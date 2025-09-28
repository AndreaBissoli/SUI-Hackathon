"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { InvestorCard } from "@/components/investor-card"
import { fetchInvestors } from "@/lib/sui-queries"
import type { Investor } from "@/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export default function InvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([])
  const [filteredInvestors, setFilteredInvestors] = useState<Investor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    async function loadInvestors() {
      try {
        const data = await fetchInvestors()
        setInvestors(data)
        setFilteredInvestors(data)
      } catch (error) {
        console.error("Error loading investors:", error)
      } finally {
        setLoading(false)
      }
    }

    loadInvestors()
  }, [])

  useEffect(() => {
    const filtered = investors.filter((investor) => {
      const matchesSearch =
        investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investor.surname.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })

    // Sort investors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt - a.createdAt
        case "oldest":
          return a.createdAt - b.createdAt
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    setFilteredInvestors(filtered)
  }, [investors, searchTerm, sortBy])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Investor Profiles</h1>
            <p className="text-xl text-muted-foreground">
              Connect with active investors funding educational opportunities
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search investors by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {filteredInvestors.length} of {investors.length} investors
            </div>
          </div>

          {/* Investors Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-card rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredInvestors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredInvestors.map((investor) => (
                <InvestorCard key={investor.id} investor={investor} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No investors found matching your criteria</p>
              <Button onClick={() => setSearchTerm("")}>Clear Search</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
