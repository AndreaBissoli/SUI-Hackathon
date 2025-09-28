"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { WalletConnection } from "@/components/wallet-connection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Shield, Zap } from "lucide-react";
import { useCurrentAccount } from "@mysten/dapp-kit";

export default function LoginPage() {
  const account = useCurrentAccount();
  const router = useRouter();

  useEffect(() => {
    if (account) {
      router.push("/profile");
    }
  }, [account, router]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
              <p className="text-muted-foreground">
                Access your Bright Futures profile by connecting your Sui wallet
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <WalletConnection />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-5 w-5 text-accent" />
                  <span>Secure blockchain authentication</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Zap className="h-5 w-5 text-accent" />
                  <span>Instant access to your profile</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Wallet className="h-5 w-5 text-accent" />
                  <span>No passwords required</span>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>Don't have a profile yet?</p>
                <a href="/register" className="text-accent hover:underline">
                  Register as Student or Investor
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
