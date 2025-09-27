"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchStudents } from "@/lib/sui-queries";
import type { Student } from "@/types";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  FileText,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function StudentDetailPage() {
  const params = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudent() {
      try {
        const students = await fetchStudents();
        const foundStudent = students.find((s) => s.id === params.id);
        setStudent(foundStudent || null);
      } catch (error) {
        console.error("Error loading student:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStudent();
  }, [params.id]);

  const handleProposeInvestment = () => {};

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Student Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The student profile you're looking for doesn't exist.
            </p>
            <Link href="/students">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Students
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/students">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Students
              </Button>
            </Link>
          </div>

          {/* Student Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <Image
                    src={student.profileImage || "/placeholder.svg"}
                    alt={`${student.name} ${student.surname}`}
                    width={120}
                    height={120}
                    className="rounded-full"
                  />
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {student.name} {student.surname}
                    </h1>
                    <p className="text-muted-foreground">Age {student.age}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Seeking Funding</Badge>
                    <Badge variant="outline">
                      ${student.fundingRequested.toLocaleString()} Requested
                    </Badge>
                    <Badge variant="outline">
                      {student.equityPercentage}% Equity Offered
                    </Badge>
                  </div>

                  <div className="flex gap-4">
                    <Button onChange={handleProposeInvestment} size="lg">
                      Propose Investment
                    </Button>
                    <Button size="lg" variant="outline">
                      Contact Student
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funding Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-accent" />
                  Funding Request
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-2xl font-bold">
                    ${student.fundingRequested.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total funding requested for education
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Equity Offered</div>
                    <div className="text-muted-foreground">
                      {student.equityPercentage}%
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Duration</div>
                    <div className="text-muted-foreground">
                      {student.durationMonths} months
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Investment Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Equity Percentage</span>
                    <span className="font-medium">
                      {student.equityPercentage}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Contract Duration</span>
                    <span className="font-medium">
                      {student.durationMonths} months
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Expected ROI</span>
                    <span className="font-medium text-accent">15-25%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">CV/Resume</div>
                        <div className="text-xs text-muted-foreground">
                          IPFS: {student.cvHash.slice(0, 20)}...
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Profile Created
                    </span>
                    <span>
                      {new Date(student.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Wallet Address
                    </span>
                    <span className="font-mono text-xs">
                      {student.owner.slice(0, 6)}...{student.owner.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
