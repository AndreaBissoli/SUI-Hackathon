"use client";

import { Transaction } from "@mysten/sui/transactions";
import { MODULES, suiClient } from "./sui-client";

export interface CreateStudentProfileParams {
  name: string;
  surname: string;
  age: number;
  cvHash: string;
  profileImage: string;
  fundingRequested: number;
  equityPercentage: number;
  durationMonths: number;
  registryId: string;
}

export interface CreateInvestorProfileParams {
  name: string;
  surname: string;
  age: number;
  profileImage: string;
  registryId: string;
}

export interface AcceptContractParams {
  contractId: string;
}

export interface RejectContractParams {
  contractId: string;
  registryId: string;
}

// Usa questa versione per l'hook mutate
export async function executeTransaction(
  tx: Transaction,
  signAndExecuteMutation: any // Il mutate dall'hook
): Promise<any> {
  return new Promise((resolve, reject) => {
    signAndExecuteMutation(
      {
        transaction: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showEvents: true,
        },
      },
      {
        onSuccess: async (result: any) => {
          try {
            console.log("Transaction result:", result);

            // Controlla se il result ha il digest
            if (result && result.digest) {
              // Aspetta la conferma
              await suiClient.waitForTransactionBlock({
                digest: result.digest,
                options: {
                  showEffects: true,
                  showObjectChanges: true,
                  showEvents: true,
                },
              });
            }

            console.log("Transaction successful:", result);
            resolve(result);
          } catch (error) {
            console.error("Error waiting for transaction:", error);
            // Risolvi comunque, la transazione potrebbe essere andata a buon fine
            resolve(result);
          }
        },
        onError: (error: any) => {
          console.error("Transaction failed:", error);
          reject(error);
        },
      }
    );
  });
}

export function createStudentProfileTransaction(
  params: CreateStudentProfileParams
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${MODULES.EDU_DEFI}::student_create_profile`,
    arguments: [
      tx.pure.string(params.name),
      tx.pure.string(params.surname),
      tx.pure.u64(params.age),
      tx.pure.string(params.cvHash),
      tx.pure.string(params.profileImage),
      tx.pure.u64(params.fundingRequested),
      tx.pure.u64(params.equityPercentage),
      tx.pure.u64(params.durationMonths),
      tx.object(params.registryId),
      tx.object("0x6"), // Clock object
    ],
  });

  return tx;
}

export function createInvestorProfileTransaction(
  params: CreateInvestorProfileParams
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${MODULES.EDU_DEFI}::investor_create_profile`,
    arguments: [
      tx.pure.string(params.name),
      tx.pure.string(params.surname),
      tx.pure.u64(params.age),
      tx.pure.string(params.profileImage),
      tx.object(params.registryId),
      tx.object("0x6"), // Clock object
    ],
  });

  return tx;
}

export function acceptContractTransaction(params: AcceptContractParams) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${MODULES.CONTRACT}::accept_contract`,
    arguments: [
      tx.object(params.contractId), // contract object reference
    ],
  });

  return tx;
}

export function rejectContractTransaction(params: RejectContractParams) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${MODULES.EDU_DEFI}::student_reject_contract`,
    arguments: [
      tx.object(params.contractId), // contract object reference
      tx.object(params.registryId), // registry object reference
    ],
  });

  return tx;
}
