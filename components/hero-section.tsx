import { Button } from "@/components/ui/button"
import { ArrowRight, Users, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              Decentralized Education Funding
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance">
              Connect Students with
              <span className="text-accent"> Investors</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Empowering the next generation through blockchain-powered education funding. Students showcase their
              potential, investors fund their future.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/students">
              <Button size="lg" variant="outline">
                Browse Students
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold">Direct Connection</h3>
              <p className="text-sm text-muted-foreground">
                Students and investors connect directly without intermediaries
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold">Equity-Based Returns</h3>
              <p className="text-sm text-muted-foreground">
                Investors receive equity tokens and future income dividends
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold">Blockchain Security</h3>
              <p className="text-sm text-muted-foreground">
                Smart contracts ensure transparent and secure transactions
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
