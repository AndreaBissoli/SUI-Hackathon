import type { Student } from "@/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, DollarSign, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface StudentCardProps {
  student: Student
}

export function StudentCard({ student }: StudentCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Image
            src={student.profileImage || "/placeholder.svg"}
            alt={`${student.name} ${student.surname}`}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <h3 className="font-semibold text-lg">
              {student.name} {student.surname}
            </h3>
            <p className="text-sm text-muted-foreground">Age {student.age}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-accent" />
            <span className="font-medium">${student.fundingRequested.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span>{student.equityPercentage}% equity</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{student.durationMonths} months duration</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <Badge variant="secondary">Seeking Funding</Badge>
          <Link href={`/students/${student.id}`}>
            <Button size="sm">View Profile</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
