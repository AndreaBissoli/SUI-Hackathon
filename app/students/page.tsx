"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { StudentCard } from "@/components/student-card"
import { fetchStudents } from "@/lib/sui-queries"
import type { Student } from "@/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterBy, setFilterBy] = useState("all")

  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await fetchStudents()
        setStudents(data)
        setFilteredStudents(data)
      } catch (error) {
        console.error("Error loading students:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStudents()
  }, [])

  useEffect(() => {
    const filtered = students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.surname.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "high-funding" && student.fundingRequested >= 50000) ||
        (filterBy === "low-equity" && student.equityPercentage <= 15) ||
        (filterBy === "short-term" && student.durationMonths <= 24)

      return matchesSearch && matchesFilter
    })

    // Sort students
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt - a.createdAt
        case "oldest":
          return a.createdAt - b.createdAt
        case "funding-high":
          return b.fundingRequested - a.fundingRequested
        case "funding-low":
          return a.fundingRequested - b.fundingRequested
        case "equity-high":
          return b.equityPercentage - a.equityPercentage
        case "equity-low":
          return a.equityPercentage - b.equityPercentage
        default:
          return 0
      }
    })

    setFilteredStudents(filtered)
  }, [students, searchTerm, sortBy, filterBy])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Student Profiles</h1>
            <p className="text-xl text-muted-foreground">
              Discover talented students seeking funding for their education
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students by name..."
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
                  <SelectItem value="funding-high">Highest Funding</SelectItem>
                  <SelectItem value="funding-low">Lowest Funding</SelectItem>
                  <SelectItem value="equity-high">Highest Equity</SelectItem>
                  <SelectItem value="equity-low">Lowest Equity</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="high-funding">High Funding ($50K+)</SelectItem>
                  <SelectItem value="low-equity">Low Equity (≤15%)</SelectItem>
                  <SelectItem value="short-term">Short Term (≤24 months)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {filteredStudents.length} of {students.length} students
            </div>
          </div>

          {/* Students Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-card rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No students found matching your criteria</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setFilterBy("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
