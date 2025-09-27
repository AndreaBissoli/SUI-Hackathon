import type { Student, Investor, Contract } from "@/types";

export async function fetchStudents(): Promise<Student[]> {
  try {
    // In a real implementation, this would query the registry and fetch student objects
    // For now, return mock data
    return [
      {
        id: "0x1",
        owner: "0xstudent1",
        name: "Alice",
        surname: "Johnson",
        age: 22,
        cvHash: "QmHash1",
        profileImage: "/diverse-student-profiles.png",
        fundingRequested: 50000,
        equityPercentage: 15,
        durationMonths: 24,
        createdAt: Date.now() - 86400000,
      },
      {
        id: "0x2",
        owner: "0xstudent2",
        name: "Bob",
        surname: "Smith",
        age: 24,
        cvHash: "QmHash2",
        profileImage: "/diverse-student-profiles.png",
        fundingRequested: 75000,
        equityPercentage: 20,
        durationMonths: 36,
        createdAt: Date.now() - 172800000,
      },
    ];
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}

export async function fetchInvestors(): Promise<Investor[]> {}

export async function fetchContracts(): Promise<Contract[]> {
  try {
    // Mock data for contracts
    return [
      {
        id: "0x5",
        studentAddress: "0xstudent1",
        investorAddress: "0xinvestor1",
        pdfHash: "QmContractHash1",
        fundingAmount: 50000,
        releaseIntervalDays: 30,
        equityPercentage: 15,
        durationMonths: 24,
        fundsReleased: 10000,
        isActive: true,
        createdAt: Date.now() - 432000000,
      },
    ];
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return [];
  }
}
