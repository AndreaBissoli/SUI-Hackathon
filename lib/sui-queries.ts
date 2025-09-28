import type { Student, Investor, Contract } from "@/types";
import { suiClient, REGISTRY_ID, STRUCTS } from "./sui-client";
import type { SuiObjectResponse } from "@mysten/sui.js/client";
import { add } from "date-fns";

function toNum(x: unknown, label: string): number {
  const n = typeof x === "string" ? Number(x) : (x as number);
  if (!Number.isFinite(n))
    throw new Error(`Campo numerico invalido: ${label}=${String(x)}`);
  return n;
}

// Investor: legge dall'oggetto Sui
export function parseInvestor(obj: SuiObjectResponse): Investor | null {
  const data = obj.data;
  if (!data?.content || data.content.dataType !== "moveObject") return null;
  const f: any = data.content.fields;

  return {
    // usa SEMPRE l'objectId dell’oggetto, non il fields.id.id
    id: data.objectId,
    owner: String(f.owner ?? ""),
    name: String(f.name ?? ""),
    surname: String(f.surname ?? ""),
    age: toNum(f.age, "age"),
    profileImage: String(f.profile_image ?? ""),
    createdAt: toNum(f.created_at, "created_at"),
  };
}

export function parseStudent(obj: SuiObjectResponse): Student | null {
  const data = obj.data;
  if (!data?.content || data.content.dataType !== "moveObject") return null;
  const f: any = data.content.fields;

  return {
    id: data.objectId,
    owner: String(f.owner ?? ""),
    name: String(f.name ?? ""),
    surname: String(f.surname ?? ""),
    age: toNum(f.age, "age"),
    cvHash: String(f.cv_hash ?? ""),
    profileImage: String(f.profile_image ?? ""),
    fundingRequested: toNum(f.funding_requested ?? 0, "funding_requested"),
    equityPercentage: toNum(f.equity_percentage ?? 0, "equity_percentage"),
    durationMonths: toNum(f.duration_months ?? 0, "duration_months"),
    createdAt: toNum(f.created_at, "created_at"),
  };
}

const fetchRegistryAddressMap = async <T>(
  mapName: string,
  parser: (obj: SuiObjectResponse) => T | null
): Promise<T[]> => {
  try {
    // Get the ServiceRegistry object
    const registryResponse = await suiClient.getObject({
      id: REGISTRY_ID,
      options: { showContent: true },
    });

    if (
      !registryResponse.data?.content ||
      registryResponse.data.content.dataType !== "moveObject"
    ) {
      console.warn("Registry not found, returning mock data");
      return [];
    }

    const registryContent = registryResponse.data.content.fields as any;
    const tableId = registryContent[mapName].fields.id.id as string;

    let cursor: string | null | undefined = null;
    const addresses: string[] = [];

    do {
      const page = await suiClient.getDynamicFields({
        parentId: tableId,
        limit: 50,
        cursor: cursor ?? undefined,
      });

      // Per ogni campo dinamico, ottieni il valore
      for (const field of page.data) {
        try {
          const fieldObject = await suiClient.getDynamicFieldObject({
            parentId: tableId,
            name: field.name,
          });

          if (
            fieldObject.data?.content &&
            fieldObject.data.content.dataType === "moveObject"
          ) {
            const fieldValue = (fieldObject.data.content.fields as any).value;
            if (fieldValue) {
              addresses.push(fieldValue);
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch dynamic field value:`, err);
        }
      }

      if (!page.hasNextPage) break;
      cursor = page.nextCursor;
    } while (cursor);

    console.log(addresses);

    if (addresses.length === 0) {
      console.log("No addresses found in registry");
      return [];
    }

    // Fetch each investor profile
    const elements: Array<T> = [];
    for (const address of addresses) {
      try {
        const response = await suiClient.getObject({
          id: address,
          options: { showContent: true },
        });

        if (
          response.data?.content &&
          response.data.content.dataType === "moveObject"
        ) {
          const parsed = parser(response);
          if (parsed) elements.push(parsed);
        }
      } catch (err) {
        console.warn(`Failed to fetch elements ${address}:`, err);
      }
    }

    return elements;
  } catch (error) {
    console.error("Error fetching elements:", error);

    return [];
  }
};

export async function fetchStudents(): Promise<Student[]> {
  return fetchRegistryAddressMap<Student>("students", parseStudent);
}

export async function fetchInvestors(): Promise<Investor[]> {
  return fetchRegistryAddressMap<Investor>("investors", parseInvestor);
}

export async function fetchContracts(): Promise<Contract[]> {
  return [];
}

// Funzione per ottenere profilo studente di un indirizzo
export async function getStudentProfileByAddress(address: string) {
  try {
    const objects = await suiClient.getOwnedObjects({
      owner: address,
      filter: {
        StructType: STRUCTS.STUDENT,
      },
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
      },
    });

    if (objects.data && objects.data.length > 0) {
      const studentObject = objects.data[0];
      if (
        studentObject.data?.content &&
        studentObject.data.content.dataType === "moveObject"
      ) {
        const fields = studentObject.data.content.fields as any;
        return {
          type: "student" as const,
          data: {
            name: fields.name,
            surname: fields.surname,
            age: parseInt(fields.age),
            cvHash: fields.cv_hash,
            profileImage: fields.profile_image,
            fundingRequested: parseInt(fields.funding_requested),
            equityPercentage: parseInt(fields.equity_percentage),
            durationMonths: parseInt(fields.duration_months),
            owner: address,
            objectId: studentObject.data.objectId,
          },
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return null;
  }
}

// Funzione per ottenere profilo investitore di un indirizzo
export async function getInvestorProfileByAddress(address: string) {
  try {
    const objects = await suiClient.getOwnedObjects({
      owner: address,
      filter: {
        StructType: STRUCTS.INVESTOR,
      },
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
      },
    });

    if (objects.data && objects.data.length > 0) {
      const investorObject = objects.data[0];
      if (
        investorObject.data?.content &&
        investorObject.data.content.dataType === "moveObject"
      ) {
        const fields = investorObject.data.content.fields as any;
        return {
          type: "investor" as const,
          data: {
            name: fields.name,
            surname: fields.surname,
            age: parseInt(fields.age),
            profileImage: fields.profile_image,
            owner: address,
            objectId: investorObject.data.objectId,
          },
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching investor profile:", error);
    return null;
  }
}

// Funzione combinata per ottenere qualsiasi profilo di un indirizzo
export async function getUserProfileByAddress(address: string) {
  try {
    // Prova prima come studente
    const studentProfile = await getStudentProfileByAddress(address);
    if (studentProfile) {
      return studentProfile;
    }

    // Poi prova come investitore
    const investorProfile = await getInvestorProfileByAddress(address);
    if (investorProfile) {
      return investorProfile;
    }

    // Nessun profilo trovato
    return {
      type: null,
      data: null,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      type: null,
      data: null,
    };
  }
}

// Funzione per verificare se un indirizzo ha profili
export async function hasProfiles(address: string) {
  try {
    const profile = await getUserProfileByAddress(address);
    return profile.type !== null;
  } catch (error) {
    console.error("Error checking profiles:", error);
    return false;
  }
}

// Aggiorna la funzione fetchUserProfile esistente
export async function fetchUserProfile(address: string) {
  return await getUserProfileByAddress(address);
}

export const fetchUserContracts = async (address: string) => {
  try {
    // Get the ServiceRegistry object
    const registryResponse = await suiClient.getObject({
      id: REGISTRY_ID,
      options: { showContent: true },
    });

    if (
      !registryResponse.data?.content ||
      registryResponse.data.content.dataType !== "moveObject"
    ) {
      console.warn("Registry not found");
      return [];
    }

    const registryContent = registryResponse.data.content.fields as any;
    // Assumendo che la tabella si chiami "user_contracts" o simile
    const tableId = registryContent.contracts.fields.id.id as string;

    try {
      // Cerca il campo dinamico con chiave uguale all'address dell'utente
      const fieldObject = await suiClient.getDynamicFieldObject({
        parentId: tableId,
        name: {
          type: "address",
          value: address,
        },
      });

      if (
        fieldObject.data?.content &&
        fieldObject.data.content.dataType === "moveObject"
      ) {
        // Il valore dovrebbe essere un vector di addresses
        const contractAddresses = (fieldObject.data.content.fields as any)
          .value;

        if (!contractAddresses || !Array.isArray(contractAddresses)) {
          console.log(`No contracts found for user ${address}`);
          return [];
        }

        // Fetch ogni contratto usando gli addresses
        const contracts: Contract[] = [];
        for (const contractAddress of contractAddresses) {
          try {
            const contractResponse = await suiClient.getObject({
              id: contractAddress,
              options: { showContent: true },
            });

            if (
              contractResponse.data?.content &&
              contractResponse.data.content.dataType === "moveObject"
            ) {
              const parsedContract = parseContract(contractResponse);
              if (parsedContract) {
                contracts.push(parsedContract);
              }
            }
          } catch (err) {
            console.warn(`Failed to fetch contract ${contractAddress}:`, err);
          }
        }

        return contracts;
      } else {
        console.log(`No contracts found for user ${address}`);
        return [];
      }
    } catch (err) {
      // L'utente potrebbe non avere nessun contratto (campo dinamico non esiste)
      console.log(`No contracts found for user ${address}:`, err);
      return [];
    }
  } catch (error) {
    console.error("Error fetching user contracts:", error);
    return [];
  }
};

// Dovrai anche implementare la funzione parseContract
function parseContract(obj: SuiObjectResponse): Contract | null {
  const data = obj.data;
  if (!data?.content || data.content.dataType !== "moveObject") return null;
  const f: any = data.content.fields;

  return {
    id: data.objectId,
    studentAddress: String(f.student_address ?? ""),
    investorAddress: String(f.investor_address ?? ""),
    pdfHash: String(f.pdf_hash ?? ""),
    fundingAmount: toNum(f.funding_amount, "funding_amount"),
    releaseIntervalDays: toNum(
      f.release_interval_days,
      "release_interval_days"
    ),
    equityPercentage: toNum(f.equity_percentage, "equity_percentage"),
    durationMonths: toNum(f.duration_months, "duration_months"),
    balance: toNum(f.balance ?? 0, "balance"), // Potrebbe essere un oggetto Balance, gestisci di conseguenza
    fundsReleased: toNum(f.funds_released, "funds_released"),
    nextReleaseTime: toNum(f.next_release_time, "next_release_time"),
    studentMonthlyIncome: toNum(
      f.student_monthly_income,
      "student_monthly_income"
    ),
    isActive: Boolean(f.is_active ?? false),
    rewardPoolId: f.reward_pool_id ? String(f.reward_pool_id) : null,
    hasTokensIssued: Boolean(f.has_tokens_issued ?? false),
  };
}
