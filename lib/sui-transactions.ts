"use client"

import { TransactionBlock } from "@mysten/sui.js/transactions"
import { MODULES } from "./sui-client"

export interface CreateStudentProfileParams {
  name: string
  surname: string
  age: number
  cvHash: string
  profileImage: string
  fundingRequested: number
  equityPercentage: number
  durationMonths: number
  registryId: string
}

export interface CreateInvestorProfileParams {
  name: string
  surname: string
  age: number
  profileImage: string
  registryId: string
}

export function createStudentProfileTransaction(params: CreateStudentProfileParams) {
  const tx = new TransactionBlock()

  tx.moveCall({
    target: `${MODULES.EDU_DEFI}::student_create_profile`,
    arguments: [
      tx.pure(params.name),
      tx.pure(params.surname),
      tx.pure(params.age),
      tx.pure(params.cvHash),
      tx.pure(params.profileImage),
      tx.pure(params.fundingRequested),
      tx.pure(params.equityPercentage),
      tx.pure(params.durationMonths),
      tx.object(params.registryId),
      tx.object("0x6"), // Clock object
    ],
  })

  return tx
}

export function createInvestorProfileTransaction(params: CreateInvestorProfileParams) {
  const tx = new TransactionBlock()

  tx.moveCall({
    target: `${MODULES.EDU_DEFI}::investor_create_profile`,
    arguments: [
      tx.pure(params.name),
      tx.pure(params.surname),
      tx.pure(params.age),
      tx.pure(params.profileImage),
      tx.object(params.registryId),
      tx.object("0x6"), // Clock object
    ],
  })

  return tx
}
