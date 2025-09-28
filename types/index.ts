export interface Student {
  id: string;
  owner: string;
  name: string;
  surname: string;
  age: number;
  cvHash: string;
  profileImage: string;
  fundingRequested: number;
  equityPercentage: number;
  durationMonths: number;
  createdAt: number;
}

export interface Investor {
  id: string;
  owner: string;
  name: string;
  surname: string;
  age: number;
  profileImage: string;
  createdAt: number;
}

export interface Contract {
  id: string;
  studentAddress: string;
  investorAddress: string;
  pdfHash: string;
  fundingAmount: number;
  releaseIntervalDays: number;
  equityPercentage: number;
  durationMonths: number;
  balance: number;
  fundsReleased: number;
  nextReleaseTime: number;
  studentMonthlyIncome: number;
  isActive: boolean;
  rewardPoolId: string | null;
  hasTokensIssued: boolean;
}
