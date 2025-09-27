"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload } from "lucide-react"

interface StudentFormData {
  name: string
  surname: string
  age: number
  cvHash: string
  profileImage: string
  fundingRequested: number
  equityPercentage: number
  durationMonths: number
}

export function StudentRegistrationForm() {
  // Simplified without wallet integration for now
  const isConnected = false
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<StudentFormData>({
    name: "",
    surname: "",
    age: 18,
    cvHash: "",
    profileImage: "",
    fundingRequested: 0,
    equityPercentage: 0,
    durationMonths: 12,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }

    setLoading(true)
    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 2000))
      alert("Student profile created successfully!")

      setFormData({
        name: "",
        surname: "",
        age: 18,
        cvHash: "",
        profileImage: "",
        fundingRequested: 0,
        equityPercentage: 0,
        durationMonths: 12,
      })
    } catch (error) {
      console.error("Error creating student profile:", error)
      alert("Error creating profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof StudentFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Register as Student</CardTitle>
        <p className="text-muted-foreground">Create your profile to connect with potential investors</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">First Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname">Last Name</Label>
              <Input
                id="surname"
                value={formData.surname}
                onChange={(e) => handleInputChange("surname", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min="16"
              max="100"
              value={formData.age}
              onChange={(e) => handleInputChange("age", Number.parseInt(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileImage">Profile Image URL</Label>
            <Input
              id="profileImage"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.profileImage}
              onChange={(e) => handleInputChange("profileImage", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cvHash">CV/Resume Hash (IPFS)</Label>
            <div className="flex gap-2">
              <Input
                id="cvHash"
                placeholder="QmHash..."
                value={formData.cvHash}
                onChange={(e) => handleInputChange("cvHash", e.target.value)}
                required
              />
              <Button type="button" variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Upload your CV to IPFS and paste the hash here</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fundingRequested">Funding Requested ($)</Label>
              <Input
                id="fundingRequested"
                type="number"
                min="1000"
                step="1000"
                value={formData.fundingRequested}
                onChange={(e) => handleInputChange("fundingRequested", Number.parseInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equityPercentage">Equity Offered (%)</Label>
              <Input
                id="equityPercentage"
                type="number"
                min="1"
                max="100"
                value={formData.equityPercentage}
                onChange={(e) => handleInputChange("equityPercentage", Number.parseInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationMonths">Duration (Months)</Label>
              <Input
                id="durationMonths"
                type="number"
                min="6"
                max="120"
                value={formData.durationMonths}
                onChange={(e) => handleInputChange("durationMonths", Number.parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !isConnected}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              "Create Student Profile"
            )}
          </Button>

          {!isConnected && (
            <p className="text-sm text-muted-foreground text-center">Please connect your wallet to register</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
