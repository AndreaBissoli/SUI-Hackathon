"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchInvestors } from "@/lib/sui-queries";
import type { Investor, Contract } from "@/types";
import {
  ArrowLeft,
  User,
  Calendar,
  TrendingUp,
  DollarSign,
  FileText,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function InvestorDetailPage() {
  const params = useParams();
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvestor() {
      try {
        const students = await fetchInvestors();
        const foundStudent = students.find((s) => s.id === params.id);
        setInvestor(foundStudent || null);
      } catch (error) {
        console.error("Error loading student:", error);
      } finally {
        setLoading(false);
      }
    }
    loadInvestor();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Investor Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The investor profile you're looking for doesn't exist.
            </p>
            <Link href="/investors">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Investors
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const totalInvested = contracts.reduce(
    (sum, contract) => sum + contract.fundingAmount,
    0
  );
  const activeContracts = contracts.filter(
    (contract) => contract.isActive
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/investors">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Investors
              </Button>
            </Link>
          </div>

          {/* Investor Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <Image
                    src={investor.profileImage || "/placeholder.svg"}
                    alt={`${investor.name} ${investor.surname}`}
                    width={120}
                    height={120}
                    className="rounded-full"
                  />
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {investor.name} {investor.surname}
                    </h1>
                    <p className="text-muted-foreground">Age {investor.age}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Active Investor</Badge>
                    <Badge variant="outline">
                      {activeContracts} Active Contracts
                    </Badge>
                    <Badge variant="outline">
                      ${totalInvested.toLocaleString()} Invested
                    </Badge>
                  </div>

                  <div className="flex gap-4">
                    <Button size="lg">Contact Investor</Button>
                    <Button size="lg" variant="outline">
                      View Portfolio
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-accent" />
                  Total Invested
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${totalInvested.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">
                  Across {contracts.length} contracts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Active Contracts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeContracts}</div>
                <p className="text-sm text-muted-foreground">
                  Currently funding students
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  Member Since
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date(investor.createdAt).getFullYear()}
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(investor.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Investment Portfolio */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                Investment Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contracts.length > 0 ? (
                <div className="space-y-4">
                  {contracts.map((contract) => (
                    <div
                      key={contract.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          Contract #{contract.id.slice(0, 8)}...
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Student: {contract.studentAddress.slice(0, 6)}...
                          {contract.studentAddress.slice(-4)}
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="font-medium">
                          ${contract.fundingAmount.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {contract.equityPercentage}% equity
                        </div>
                        <Badge
                          variant={contract.isActive ? "default" : "secondary"}
                        >
                          {contract.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No investment contracts yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-accent" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profile Created</span>
                  <span>
                    {new Date(investor.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wallet Address</span>
                  <span className="font-mono text-xs">
                    {investor.owner.slice(0, 6)}...{investor.owner.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Investment Style
                  </span>
                  <span>Education Focused</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
