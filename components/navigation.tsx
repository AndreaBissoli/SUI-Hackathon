"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { WalletConnection } from "./wallet-connection"
import { GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Students", href: "/students" },
  { name: "Investors", href: "/investors" },
  { name: "Register", href: "/register" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <GraduationCap className="h-6 w-6 text-accent" />
              EduDeFi
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-accent",
                    pathname === item.href ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <WalletConnection />
        </div>
      </div>
    </nav>
  )
}
