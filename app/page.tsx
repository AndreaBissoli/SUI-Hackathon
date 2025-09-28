"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { StudentCard } from "@/components/student-card"
import { InvestorCard } from "@/components/investor-card"
import { fetchStudents, fetchInvestors } from "@/lib/sui-queries"
import type { Student, Investor } from "@/types"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  const [students, setStudents] = useState<Student[]>([])
  const [investors, setInvestors] = useState<Investor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [studentsData, investorsData] = await Promise.all([fetchStudents(), fetchInvestors()])
        setStudents(studentsData)
        setInvestors(investorsData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        <HeroSection />

        {/* Featured Students Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold">Featured Students</h2>
                <p className="text-muted-foreground mt-2">
                  Discover talented students seeking funding for their education
                </p>
              </div>
              <Link href="/students">
                <Button variant="outline">View All Students</Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 bg-card rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.slice(0, 3).map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Featured Investors Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold">Active Investors</h2>
                <p className="text-muted-foreground mt-2">
                  Connect with investors ready to fund educational opportunities
                </p>
              </div>
              <Link href="/investors">
                <Button variant="outline">View All Investors</Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-48 bg-card rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {investors.slice(0, 4).map((investor) => (
                  <InvestorCard key={investor.id} investor={investor} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">{students.length}</div>
                <div className="text-primary-foreground/80">Active Students</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">{investors.length}</div>
                <div className="text-primary-foreground/80">Registered Investors</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">$125K</div>
                <div className="text-primary-foreground/80">Total Funding Requested</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
