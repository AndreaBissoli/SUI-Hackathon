"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { getUserProfileByAddress, fetchUserContracts } from "@/lib/sui-queries";
import type { Student, Investor, Contract } from "@/types";

// Interfaccia UserProfile condivisa in tutta l'app
export type UserProfile =
  | {
      type: "student";
      data: Student;
      address?: string;
    }
  | {
      type: "investor";
      data: Investor;
      address?: string;
    }
  | {
      type: null;
      data: null;
      address?: string;
    };

export type UserProfileState = UserProfile | null;

interface AuthContextType {
  // Stato di base
  account: any;
  userProfile: UserProfileState;
  loading: boolean;
  isAuthenticated: boolean;

  // Flags booleani
  isStudent: boolean;
  isInvestor: boolean;
  hasProfile: boolean;

  // Proprietà computate (invece di getters)
  displayName: string;
  profileImage: string;
  initials: string;

  // Type-safe data (invece di getters)
  studentData: Student | null;
  investorData: Investor | null;
  contracts: Contract[] | null;

  // Funzioni di gestione
  refreshProfile: () => Promise<void>;
  updateProfile: (newProfile: UserProfile) => void;
  resetProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const account = useCurrentAccount();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [contracts, setContracts] = useState<Contract[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Carica il profilo quando l'account cambia
  useEffect(() => {
    if (account?.address) {
      loadUserProfile(account.address);
    } else {
      resetProfile();
    }
  }, [account]);

  const loadUserProfile = async (address: string) => {
    setLoading(true);
    try {
      console.log("Loading profile for address:", address);
      const profile = await getUserProfileByAddress(address);

      if (!profile.data?.objectId) return;

      const contracts = await fetchUserContracts(address);

      setContracts(contracts);

      // Se il profilo esiste, crea il UserProfile corretto
      if (profile.type && profile.data) {
        let userProfileData: UserProfile;

        if (profile.type === "student") {
          const mappedStudentData: Student = {
            id: profile.data.objectId || address,
            owner: profile.data.owner || address,
            name: profile.data.name,
            surname: profile.data.surname,
            age: profile.data.age,
            cvUrl: profile.data.cvUrl,
            profileImage: profile.data.profileImage,
            fundingRequested: profile.data.fundingRequested,
            equityPercentage: profile.data.equityPercentage,
            durationMonths: profile.data.durationMonths,
            createdAt: Date.now(),
          };

          userProfileData = {
            type: "student",
            data: mappedStudentData,
            address: address,
          };
        } else if (profile.type === "investor") {
          const mappedInvestorData: Investor = {
            id: profile.data.objectId || address,
            owner: profile.data.owner || address,
            name: profile.data.name,
            surname: profile.data.surname,
            age: profile.data.age,
            profileImage: profile.data.profileImage,
            createdAt: Date.now(),
          };

          userProfileData = {
            type: "investor",
            data: mappedInvestorData,
            address: address,
          };
        } else {
          // Caso di fallback
          userProfileData = {
            type: null,
            data: null,
            address: address,
          };
        }

        setUserProfile(userProfileData);
        setIsAuthenticated(userProfileData.type !== null);
        console.log("Profile loaded:", userProfileData);
      } else {
        // Nessun profilo trovato
        const noProfileData: UserProfile = {
          type: null,
          data: null,
          address: address,
        };
        setUserProfile(noProfileData);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      const errorProfileData: UserProfile = {
        type: null,
        data: null,
        address: address,
      };
      setUserProfile(errorProfileData);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const resetProfile = () => {
    setUserProfile(null);
    setIsAuthenticated(false);
    setLoading(false);
  };

  // Funzione per aggiornare il profilo manualmente
  const refreshProfile = async (): Promise<void> => {
    if (account?.address) {
      await loadUserProfile(account.address);
    }
  };

  // Funzione per aggiornare il profilo senza fare una nuova query (ottimistico)
  const updateProfile = (newProfile: UserProfile): void => {
    setUserProfile(newProfile);
    setIsAuthenticated(newProfile.type !== null);
  };

  const displayName = useMemo((): string => {
    if (
      userProfile?.data &&
      "name" in userProfile.data &&
      "surname" in userProfile.data
    ) {
      return `${userProfile.data.name} ${userProfile.data.surname}`;
    }
    if (account?.address) {
      return account.address.slice(0, 6) + "..." + account.address.slice(-4);
    }
    return "";
  }, [userProfile, account]);

  const profileImage = useMemo((): string => {
    if (userProfile?.data && "profileImage" in userProfile.data) {
      return userProfile.data.profileImage || "/default-avatar.png";
    }
    return "/default-avatar.png";
  }, [userProfile]);

  const initials = useMemo((): string => {
    if (
      userProfile?.data &&
      "name" in userProfile.data &&
      "surname" in userProfile.data
    ) {
      return `${userProfile.data.name[0]}${userProfile.data.surname[0]}`.toUpperCase();
    }
    if (account?.address) {
      return account.address.slice(2, 4).toUpperCase();
    }
    return "U";
  }, [userProfile, account]);

  // 🎯 TYPE-SAFE DATA (useMemo per performance)
  const studentData = useMemo((): Student | null => {
    if (userProfile?.type === "student" && userProfile.data) {
      return userProfile.data as Student;
    }
    return null;
  }, [userProfile]);

  const investorData = useMemo((): Investor | null => {
    if (userProfile?.type === "investor" && userProfile.data) {
      return userProfile.data as Investor;
    }
    return null;
  }, [userProfile]);

  // Computed flags
  const isStudent = userProfile?.type === "student";
  const isInvestor = userProfile?.type === "investor";
  const hasProfile = userProfile?.type !== null;

  const value: AuthContextType = {
    // Stato di base
    account,
    contracts,
    userProfile,
    loading,
    isAuthenticated,

    // Flags booleani
    isStudent,
    isInvestor,
    hasProfile,

    // Proprietà computate (invece di getters!)
    displayName,
    profileImage,
    initials,

    // Type-safe data (invece di getters!)
    studentData,
    investorData,

    // Funzioni di gestione
    refreshProfile,
    updateProfile,
    resetProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizzato per usare il context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Export del tipo per TypeScript
export type UseAuthReturn = AuthContextType;
