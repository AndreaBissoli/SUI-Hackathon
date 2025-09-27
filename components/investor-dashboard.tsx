"use client"

import type { Investor, Contract } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, Users, FileText, Search, Edit } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface InvestorDashboardProps {
  investor: Investor
  contracts: Contract[]
}

export function InvestorDashboard({ investor, contracts }: InvestorDashboardProps) {
  const totalInvested = contracts.reduce((sum, contract) => sum + contract.fundingAmount, 0)
  const activeContracts = contracts.filter((contract) => contract.isActive)
  const totalFundsReleased = contracts.reduce((sum, contract) => sum + contract.fundsReleased, 0)

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Image
                src={investor.profileImage || "/placeholder.svg"}
                alt={`${investor.name} ${investor.surname}`}
                width={100}
                height={100}
                className="rounded-full"
              />
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {investor.name}!</h1>
                <p className="text-muted-foreground">Investor Profile • Age {investor.age}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Active Investor</Badge>
                <Badge variant="outline">{activeContracts.length} Active Investments</Badge>
                <Badge variant="outline">${totalInvested.toLocaleString()} Invested</Badge>
              </div>

              <Button className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInvested.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Across {contracts.length} contracts</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeContracts.length}</div>
            <div className="text-xs text-muted-foreground">Currently funding</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Funds Released</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalFundsReleased.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">To students</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expected ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">18.5%</div>
            <div className="text-xs text-muted-foreground">Average projected</div>
          </CardContent>
        </Card>
      </div>

      {/* Investment Portfolio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            Your Investment Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contracts.length > 0 ? (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">Contract #{contract.id.slice(0, 8)}...</div>
                    <div className="text-sm text-muted-foreground">
                      Student: {contract.studentAddress.slice(0, 6)}...{contract.studentAddress.slice(-4)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(contract.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="font-medium">${contract.fundingAmount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{contract.equityPercentage}% equity</div>
                    <Badge variant={contract.isActive ? "default" : "secondary"}>
                      {contract.isActive ? "Active" : "Pending"}
                    </Badge>
                  </div>

                  <div className="ml-4">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No investments yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start by browsing student profiles and making your first investment
              </p>
              <Link href="/students">
                <Button>
                  <Search className="mr-2 h-4 w-4" />
                  Browse Students
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/students">
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <Search className="h-4 w-4" />
                Find New Students to Fund
              </Button>
            </Link>
            <Button variant="outline" className="justify-start gap-2 bg-transparent">
              <TrendingUp className="h-4 w-4" />
              View Portfolio Performance
            </Button>
            <Button variant="outline" className="justify-start gap-2 bg-transparent">
              <DollarSign className="h-4 w-4" />
              Claim Dividend Payments
            </Button>
            <Button variant="outline" className="justify-start gap-2 bg-transparent">
              <Users className="h-4 w-4" />
              Manage Student Relationships
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
