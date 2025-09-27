"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface InvestorFormData {
  name: string
  surname: string
  age: number
  profileImage: string
}

export function InvestorRegistrationForm() {
  // Simplified without wallet integration for now
  const isConnected = false
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<InvestorFormData>({
    name: "",
    surname: "",
    age: 18,
    profileImage: "",
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
      alert("Investor profile created successfully!")

      setFormData({
        name: "",
        surname: "",
        age: 18,
        profileImage: "",
      })
    } catch (error) {
      console.error("Error creating investor profile:", error)
      alert("Error creating profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof InvestorFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Register as Investor</CardTitle>
        <p className="text-muted-foreground">Create your profile to start funding student education</p>
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
              min="18"
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

          <Button type="submit" className="w-full" disabled={loading || !isConnected}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              "Create Investor Profile"
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
