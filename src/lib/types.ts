export interface BusinessProfile {
  wallet: string;
  name: string;
  category: string;
  location: string;
  website: string;
  registeredAt: number; // unix timestamp (seconds)
  productCount: number;
  txHash?: string;
  onChain?: boolean;
}

export interface WarrantyRecord {
  serialHash: `0x${string}`;
  productName: string;
  serialNumber: string;
  category: string;
  businessWallet: string;
  businessName: string;
  startTimestamp: number; // unix timestamp (seconds)
  durationMonths: number;
  expiryTimestamp: number; // unix timestamp (seconds)
  registeredAt: number; // unix timestamp (seconds)
  isRevoked: boolean;
  txHash: string;
  onChain?: boolean;
}

export interface DashboardStats {
  totalProducts: number;
  activeWarranties: number;
  expiredWarranties: number;
  totalBusinesses: number;
}

