"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  UserPlus,
  User,
  DollarSign,
  Percent,
  Clock,
  Divide,
  Contact,
} from "lucide-react";
import Link from "next/link";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { getUserProfileByAddress } from "@/lib/sui-queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import ContractCard from "./contract-card";

const UserContracts = () => {
  const {
    account,
    userProfile,
    displayName,
    refreshProfile,
    initials,
    contracts,
  } = useAuth();

  if (!userProfile) {
    return null;
  }

  console.log("contracts", contracts);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Contracts</h1>
      </div>

      {contracts?.map((contract) => (
        <ContractCard key={contract.id} contract={contract} />
      ))}
    </div>
  );
};

export default UserContracts;
