"use client"

import type { Student, Contract } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DollarSign, TrendingUp, FileText, Users, Edit } from "lucide-react"
import Image from "next/image"

interface StudentDashboardProps {
  student: Student
  contracts: Contract[]
}

export function StudentDashboard({ student, contracts }: StudentDashboardProps) {
  const totalFunded = contracts.reduce((sum, contract) => sum + contract.fundingAmount, 0)
  const fundingProgress = (totalFunded / student.fundingRequested) * 100
  const activeContracts = contracts.filter((contract) => contract.isActive)

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Image
                src={student.profileImage || "/placeholder.svg"}
                alt={`${student.name} ${student.surname}`}
                width={100}
                height={100}
                className="rounded-full"
              />
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {student.name}!</h1>
                <p className="text-muted-foreground">Student Profile • Age {student.age}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">${student.fundingRequested.toLocaleString()} Requested</Badge>
                <Badge variant="outline">{student.equityPercentage}% Equity Offered</Badge>
                <Badge variant="outline">{student.durationMonths} Months</Badge>
              </div>

              <Button className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funding Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Funding Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Funding Received</span>
              <span>
                ${totalFunded.toLocaleString()} / ${student.fundingRequested.toLocaleString()}
              </span>
            </div>
            <Progress value={fundingProgress} className="h-2" />
            <div className="text-xs text-muted-foreground">{fundingProgress.toFixed(1)}% of funding goal reached</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{activeContracts.length}</div>
              <div className="text-sm text-muted-foreground">Active Investors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">${totalFunded.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Funded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                ${(student.fundingRequested - totalFunded).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Remaining Need</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Contracts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            Your Contracts
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
                      Investor: {contract.investorAddress.slice(0, 6)}...{contract.investorAddress.slice(-4)}
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No investment contracts yet</p>
              <p className="text-sm text-muted-foreground">
                Investors will find your profile and propose funding contracts
              </p>
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
            <Button variant="outline" className="justify-start gap-2 bg-transparent">
              <Edit className="h-4 w-4" />
              Update Profile Information
            </Button>
            <Button variant="outline" className="justify-start gap-2 bg-transparent">
              <FileText className="h-4 w-4" />
              Upload New CV/Documents
            </Button>
            <Button variant="outline" className="justify-start gap-2 bg-transparent">
              <DollarSign className="h-4 w-4" />
              Adjust Funding Requirements
            </Button>
            <Button variant="outline" className="justify-start gap-2 bg-transparent">
              <Users className="h-4 w-4" />
              View Interested Investors
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
