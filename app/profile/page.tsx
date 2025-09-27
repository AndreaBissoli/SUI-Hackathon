"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  UserPlus,
  User,
  DollarSign,
  Percent,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { getUserProfileByAddress } from "@/lib/sui-queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import UserContracts from "@/components/user-contracts";

interface UserProfile {
  type: "student" | "investor" | null;
  data: any;
}

export default function ProfilePage() {
  const account = useCurrentAccount();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!account) {
      router.push("/login");
      return;
    }

    loadUserProfile();
  }, [account, router]);

  const loadUserProfile = async () => {
    if (!account?.address) return;

    setLoading(true);
    try {
      const profile = await getUserProfileByAddress(account.address);
      console.log(profile);
      setUserProfile(profile);
      console.log("User profile:", profile);
    } catch (error) {
      console.error("Error loading profile:", error);
      setUserProfile({ type: null, data: null });
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading profile...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Se non ha profilo
  if (!userProfile?.type) {
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
                    You haven't created a profile yet. Register as a student or
                    investor to get started.
                  </p>
                </div>

                <div className="space-y-3">
                  <Link href="/register">
                    <Button size="lg" className="w-full">
                      Create Your Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Se ha profilo, mostra i dettagli
  const getDisplayName = () => {
    if (userProfile?.data?.name && userProfile?.data?.surname) {
      return `${userProfile.data.name} ${userProfile.data.surname}`;
    }
    return account.address.slice(0, 6) + "..." + account.address.slice(-4);
  };

  const getInitials = () => {
    if (userProfile?.data?.name && userProfile?.data?.surname) {
      return `${userProfile.data.name[0]}${userProfile.data.surname[0]}`.toUpperCase();
    }
    return account.address.slice(2, 4).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <Badge variant="secondary" className="capitalize">
              {userProfile.type}
            </Badge>
          </div>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={
                      userProfile.data?.profileImage || "/default-avatar.png"
                    }
                    alt={getDisplayName()}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{getDisplayName()}</CardTitle>
                  <p className="text-muted-foreground">
                    {userProfile.type === "student" ? "Student" : "Investor"}
                  </p>
                  <p className="text-sm text-muted-foreground font-mono mt-1">
                    {account.address}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">
                    Age: {userProfile.data?.age || "N/A"}
                  </span>
                </div>
              </div>

              {/* Student specific info */}
              {userProfile.type === "student" && userProfile.data && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Student Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userProfile.data.fundingRequested && (
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">
                          Funding Requested: $
                          {userProfile.data.fundingRequested.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {userProfile.data.equityPercentage && (
                      <div className="flex items-center space-x-2">
                        <Percent className="h-4 w-4" />
                        <span className="text-sm">
                          Equity Offered: {userProfile.data.equityPercentage}%
                        </span>
                      </div>
                    )}
                    {userProfile.data.durationMonths && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          Duration: {userProfile.data.durationMonths} months
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <Button asChild>
                  <Link
                    href={
                      userProfile.type === "student"
                        ? "/student/dashboard"
                        : "/investor/dashboard"
                    }
                  >
                    Go to Dashboard
                  </Link>
                </Button>
                <Button variant="outline" onClick={loadUserProfile}>
                  Refresh Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        {<UserContracts />}
      </main>
    </div>
  );
}
