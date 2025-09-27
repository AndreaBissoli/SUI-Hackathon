"use client"
import type { Student, Investor, Contract } from "@/types"

export async function fetchUserProfile(walletAddress: string): Promise<{
  type: "student" | "investor" | null
  profile: Student | Investor | null
  contracts: Contract[]
}> {
  try {
    // In a real implementation, this would query the blockchain for user's objects
    // For now, return mock data based on wallet address

    const students = await import("./sui-queries").then((m) => m.fetchStudents())
    const investors = await import("./sui-queries").then((m) => m.fetchInvestors())
    const contracts = await import("./sui-queries").then((m) => m.fetchContracts())

    // Check if user is a student
    const studentProfile = students.find((s) => s.owner === walletAddress)
    if (studentProfile) {
      const studentContracts = contracts.filter((c) => c.studentAddress === walletAddress)
      return {
        type: "student",
        profile: studentProfile,
        contracts: studentContracts,
      }
    }

    // Check if user is an investor
    const investorProfile = investors.find((i) => i.owner === walletAddress)
    if (investorProfile) {
      const investorContracts = contracts.filter((c) => c.investorAddress === walletAddress)
      return {
        type: "investor",
        profile: investorProfile,
        contracts: investorContracts,
      }
    }

    return {
      type: null,
      profile: null,
      contracts: [],
    }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return {
      type: null,
      profile: null,
      contracts: [],
    }
  }
}
