"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, UserPlus } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  // Simplified without wallet integration for now
  const isConnected = false
  const currentAccount = null
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConnected) {
      router.push("/login")
      return
    }

    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [isConnected, router])

  if (!isConnected) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center space-y-6">
              <div>
                <UserPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">No Profile Found</h1>
                <p className="text-muted-foreground">
                  You haven't created a profile yet. Register as a student or investor to get started.
                </p>
              </div>

              <div className="space-y-3">
                <Link href="/register">
                  <Button size="lg" className="w-full">
                    Create Your Profile
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground">Wallet integration coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
