import type { Investor } from "@/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface InvestorCardProps {
  investor: Investor
}

export function InvestorCard({ investor }: InvestorCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Image
            src={investor.profileImage || "/placeholder.svg"}
            alt={`${investor.name} ${investor.surname}`}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <h3 className="font-semibold text-lg">
              {investor.name} {investor.surname}
            </h3>
            <p className="text-sm text-muted-foreground">Age {investor.age}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Active Investor</span>
        </div>

        <div className="flex justify-between items-center pt-2">
          <Badge variant="outline">Available</Badge>
          <Link href={`/investors/${investor.id}`}>
            <Button size="sm" variant="outline">
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
