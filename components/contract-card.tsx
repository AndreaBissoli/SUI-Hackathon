"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  DollarSign,
  Percent,
  Clock,
  Calendar,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Contract } from "@/types";
import { is } from "date-fns/locale";
import {
  AcceptContractParams,
  acceptContractTransaction,
  executeTransaction,
  RejectContractParams,
  rejectContractTransaction,
} from "@/lib/sui-transactions";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { REGISTRY_ID } from "@/lib/sui-client";

const ContractCard = ({ contract }: { contract: Contract }) => {
  const { account, userProfile, isInvestor, isStudent, refreshProfile } =
    useAuth();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  // Determina l'altra parte del contratto
  const otherPartyAddress = isStudent
    ? contract.investorAddress
    : contract.studentAddress;
  const otherPartyType = isStudent ? "investor" : "student";

  // Formatta i SUI (da nanoSUI a SUI)
  const formatSUI = (amount: number) => {
    return (amount / 1000000000).toFixed(2);
  };

  // Gestori per accettare/rifiutare il contratto
  const handleAcceptContract = async () => {
    if (!account) return;

    if (!isStudent) return;

    try {
      const transactionParameters: AcceptContractParams = {
        contractId: contract.id,
      };
      const transaction = await acceptContractTransaction(
        transactionParameters
      );

      await executeTransaction(transaction, signAndExecuteTransaction);
    } catch (error) {
      console.error("Error accepting contract:", error);
    }
    refreshProfile();
  };

  const handleRejectContract = async () => {
    if (!account) return;

    if (!isStudent) return;

    try {
      const transactionParameters: RejectContractParams = {
        contractId: contract.id,
        registryId: REGISTRY_ID,
      };
      const transaction = await rejectContractTransaction(
        transactionParameters
      );

      await executeTransaction(transaction, signAndExecuteTransaction);
      console.log("done");
    } catch (error) {
      console.error("Error rejecting contract:", error);
    }
    refreshProfile();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <CardTitle className="text-lg font-semibold">
            Contract #{contract.id.slice(0, 8)}...
          </CardTitle>
          <Badge
            variant={contract.isActive ? "default" : "secondary"}
            className="w-fit"
          >
            {contract.isActive ? "Active" : "Pending"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informazioni principali del contratto */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Funding Amount
              </span>
            </div>
            <p className="text-lg font-semibold">
              {formatSUI(contract.fundingAmount)} SUI
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Equity</span>
            </div>
            <p className="text-lg font-semibold">
              {contract.equityPercentage}%
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Duration</span>
            </div>
            <p className="text-lg font-semibold">
              {contract.durationMonths} months
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Release Interval
              </span>
            </div>
            <p className="text-lg font-semibold">
              {contract.releaseIntervalDays} days
            </p>
          </div>
        </div>

        {/* Link all'altra parte */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {isStudent ? "Investor" : "Student"}
            </p>
            <p className="text-sm font-mono">
              {otherPartyAddress.slice(0, 8)}...{otherPartyAddress.slice(-6)}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/profile/${otherPartyAddress}`}>
              <User className="h-4 w-4 mr-2" />
              View Profile
              <ExternalLink className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Azioni per contratti inattivi */}
        {!contract.isActive && isStudent && (
          <div className="flex flex-col sm:flex-row gap-2 p-3 border border-amber-200 bg-amber-50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                Contract Pending
              </p>
              <p className="text-xs text-amber-600">
                This contract is waiting for acceptance from both parties.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAcceptContract}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                onClick={handleRejectContract}
                variant="destructive"
                size="sm"
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          </div>
        )}

        {/* Informazioni aggiuntive per contratti attivi */}
        {contract.isActive && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Funds Released</p>
              <p className="text-sm font-semibold">
                {formatSUI(contract.fundsReleased)} SUI
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Next Release</p>
              <p className="text-sm font-semibold">
                {new Date(contract.nextReleaseTime).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractCard;
