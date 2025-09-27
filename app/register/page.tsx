"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { StudentRegistrationForm } from "@/components/student-registration-form"
import { InvestorRegistrationForm } from "@/components/investor-registration-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, TrendingUp } from "lucide-react"

type UserType = "student" | "investor" | null

export default function RegisterPage() {
  const [selectedType, setSelectedType] = useState<UserType>(null)

  if (selectedType === "student") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Button variant="ghost" onClick={() => setSelectedType(null)} className="mb-4">
                ← Back to selection
              </Button>
            </div>
            <StudentRegistrationForm />
          </div>
        </main>
      </div>
    )
  }

  if (selectedType === "investor") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Button variant="ghost" onClick={() => setSelectedType(null)} className="mb-4">
                ← Back to selection
              </Button>
            </div>
            <InvestorRegistrationForm />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Join EduDeFi</h1>
            <p className="text-xl text-muted-foreground">
              Choose your role to get started with decentralized education funding
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-accent"
              onClick={() => setSelectedType("student")}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <GraduationCap className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold">I'm a Student</h3>
                <p className="text-muted-foreground">
                  Seeking funding for my education and willing to offer equity in my future earnings
                </p>
                <ul className="text-sm text-left space-y-2 text-muted-foreground">
                  <li>• Create your profile with CV and funding requirements</li>
                  <li>• Connect with potential investors</li>
                  <li>• Receive funding for your education</li>
                  <li>• Share future income through equity tokens</li>
                </ul>
                <Button className="w-full mt-4">Register as Student</Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-accent"
              onClick={() => setSelectedType("investor")}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold">I'm an Investor</h3>
                <p className="text-muted-foreground">
                  Looking to invest in promising students and earn returns from their future success
                </p>
                <ul className="text-sm text-left space-y-2 text-muted-foreground">
                  <li>• Browse student profiles and opportunities</li>
                  <li>• Fund education directly through smart contracts</li>
                  <li>• Receive equity tokens representing future income</li>
                  <li>• Earn dividends from student success</li>
                </ul>
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  Register as Investor
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Already have a profile? Connect your wallet to access your dashboard
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
