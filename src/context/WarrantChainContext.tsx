'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { createAppKit, useAppKit } from '@reown/appkit/react';
import {
  WagmiProvider,
  useAccount,
  useChainId,
  useSwitchChain,
  useWalletClient,
  useDisconnect,
} from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';
import {
  botchainTestnet,
  wagmiAdapter,
  wagmiConfig,
  projectId,
  networks,
  BOTCHAIN_CHAIN_ID,
  BOTCHAIN_RPC_URL,
  hashSerial,
  normalizeSerial,
} from '@/config/web3';
import {
  PRODUCT_WARRANTY_REGISTRY_ABI,
  PRODUCT_WARRANTY_REGISTRY_BYTECODE,
} from '@/contracts/ProductWarrantyRegistryABI';
import { BusinessProfile, WarrantyRecord } from '@/lib/types';

// Initialize Reown AppKit once on client/module load
const metadata = {
  name: 'WarrantChain',
  description: 'Register It. Protect It. Verify It. — Web3 Warranty Registry on Botchain',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://warrantchain.app',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: botchainTestnet,
  metadata,
  features: {
    analytics: false,
  },
});

const queryClient = new QueryClient();

const publicClient = createPublicClient({
  chain: botchainTestnet,
  transport: http(BOTCHAIN_RPC_URL),
});

interface WarrantChainContextType {
  // Wallet & Network
  address: string | undefined;
  isConnected: boolean;
  isDemoWallet: boolean;
  chainId: number;
  isBotchainNetwork: boolean;
  openConnectModal: () => void;
  switchToBotchain: () => Promise<void>;
  enableDemoWallet: (customWallet?: string) => void;
  disconnectWallet: () => void;

  // Smart Contract
  contractAddress: string;
  saveContractAddress: (addr: string) => Promise<void>;
  deployContract: () => Promise<string>;
  isDeploying: boolean;

  // Data
  businesses: BusinessProfile[];
  warranties: WarrantyRecord[];
  currentBusiness: BusinessProfile | null;
  isLoading: boolean;
  refreshData: () => Promise<void>;

  // Actions
  registerBusiness: (input: {
    name: string;
    category: string;
    location: string;
    website: string;
  }) => Promise<{ txHash: string; onChain: boolean; business: BusinessProfile }>;

  registerWarranty: (input: {
    productName: string;
    serialNumber: string;
    category: string;
    durationMonths: number;
  }) => Promise<{ txHash: string; onChain: boolean; warranty: WarrantyRecord }>;

  verifyWarrantyBySerial: (serial: string) => Promise<{
    warranty: WarrantyRecord | null;
    serialHash: `0x${string}`;
    normalizedSerial: string;
    source: 'onchain' | 'hybrid-registry' | 'not-found';
  }>;

  toggleRevokeWarranty: (serialHash: `0x${string}`) => Promise<void>;
}

const WarrantChainContext = createContext<WarrantChainContextType | undefined>(
  undefined
);

function WarrantChainInnerProvider({ children }: { children: React.ReactNode }) {
  const { open } = useAppKit();
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();
  const wagmiChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const { disconnect } = useDisconnect();

  const [demoAddress, setDemoAddress] = useState<string | undefined>(undefined);
  const [contractAddress, setContractAddress] = useState<string>(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x618fd1d309b185aB449E528cD8cCb8E7E1ea90CC'
  );
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [warranties, setWarranties] = useState<WarrantyRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);

  const address = wagmiConnected && wagmiAddress ? wagmiAddress : demoAddress;
  const isConnected = Boolean(address);
  const isDemoWallet = !wagmiConnected && Boolean(demoAddress);
  const chainId = wagmiConnected ? wagmiChainId : BOTCHAIN_CHAIN_ID;
  const isBotchainNetwork = chainId === BOTCHAIN_CHAIN_ID;

  useEffect(() => {
    const savedDemo = localStorage.getItem('warrantchain_demo_wallet');
    if (savedDemo) {
      setDemoAddress(savedDemo);
    }
    const savedContract = localStorage.getItem('warrantchain_contract_address');
    if (savedContract) {
      setContractAddress(savedContract);
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/warranties', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setBusinesses(data.businesses || []);
        setWarranties(data.warranties || []);
        if (data.contractAddress && !contractAddress) {
          setContractAddress(data.contractAddress);
        }
      }
    } catch (err) {
      console.error('Failed to load WarrantChain registry data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const currentBusiness =
    businesses.find(
      (b) => address && b.wallet.toLowerCase() === address.toLowerCase()
    ) || null;

  const openConnectModal = useCallback(() => {
    open();
  }, [open]);

  const switchToBotchain = useCallback(async () => {
    try {
      if (switchChainAsync) {
        await switchChainAsync({ chainId: BOTCHAIN_CHAIN_ID });
      }
    } catch {
      // Fallback: request wallet_addEthereumChain directly if MetaMask/injected provider exists
      if (typeof window !== 'undefined' && (window as unknown as { ethereum?: { request: (args: unknown) => Promise<unknown> } }).ethereum) {
        const eth = (window as unknown as { ethereum: { request: (args: unknown) => Promise<unknown> } }).ethereum;
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x3c8', // 968 in hex
              chainName: 'Botchain Testnet',
              nativeCurrency: {
                name: 'BOT',
                symbol: 'BOT',
                decimals: 18,
              },
              rpcUrls: [BOTCHAIN_RPC_URL],
              blockExplorerUrls: ['https://scan.bohr.life/'],
            },
          ],
        });
      }
    }
  }, [switchChainAsync]);

  const enableDemoWallet = useCallback((customWallet?: string) => {
    // Default to ABC Electronics deployer wallet on Botchain Testnet
    const chosen =
      customWallet || '0x5E889b72A1464489e7df124280Ee4A5c11b039B3';
    setDemoAddress(chosen);
    localStorage.setItem('warrantchain_demo_wallet', chosen);
  }, []);

  const disconnectWallet = useCallback(() => {
    if (wagmiConnected) {
      disconnect();
    }
    setDemoAddress(undefined);
    localStorage.removeItem('warrantchain_demo_wallet');
  }, [wagmiConnected, disconnect]);

  const saveContractAddress = useCallback(async (addr: string) => {
    const cleaned = addr.trim();
    setContractAddress(cleaned);
    localStorage.setItem('warrantchain_contract_address', cleaned);
    await fetch('/api/warranties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'setContractAddress',
        contractAddress: cleaned,
      }),
    });
  }, []);

  const deployContract = useCallback(async (): Promise<string> => {
    if (!walletClient || !wagmiAddress) {
      throw new Error(
        'Please connect a live Web3 wallet (e.g. MetaMask via Connect Wallet) on Botchain Testnet (Chain ID 968) to deploy the contract.'
      );
    }
    setIsDeploying(true);
    try {
      if (wagmiChainId !== BOTCHAIN_CHAIN_ID) {
        await switchToBotchain();
      }
      const hash = await walletClient.deployContract({
        abi: PRODUCT_WARRANTY_REGISTRY_ABI,
        bytecode: PRODUCT_WARRANTY_REGISTRY_BYTECODE,
        account: wagmiAddress,
        chain: botchainTestnet,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (!receipt.contractAddress) {
        throw new Error('Deployment transaction succeeded but no contract address was returned.');
      }
      await saveContractAddress(receipt.contractAddress);
      return receipt.contractAddress;
    } finally {
      setIsDeploying(false);
    }
  }, [walletClient, wagmiAddress, wagmiChainId, switchToBotchain, saveContractAddress]);

  const registerBusiness = useCallback(
    async (input: {
      name: string;
      category: string;
      location: string;
      website: string;
    }) => {
      if (!address) {
        throw new Error('Please connect your wallet first.');
      }

      let txHash = '';
      let onChain = false;

      // Attempt live on-chain transaction if connected with real wallet and contractAddress is set
      if (
        wagmiConnected &&
        walletClient &&
        contractAddress &&
        contractAddress.startsWith('0x') &&
        contractAddress.length === 42
      ) {
        if (wagmiChainId !== BOTCHAIN_CHAIN_ID) {
          await switchToBotchain();
        }
        const hash = await walletClient.writeContract({
          address: contractAddress as `0x${string}`,
          abi: PRODUCT_WARRANTY_REGISTRY_ABI,
          functionName: 'registerBusiness',
          args: [
            input.name.trim(),
            input.category.trim(),
            input.location.trim(),
            input.website.trim(),
          ],
          chain: botchainTestnet,
          account: wagmiAddress!,
        });
        await publicClient.waitForTransactionReceipt({ hash });
        txHash = hash;
        onChain = true;
      }

      const res = await fetch('/api/warranties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'registerBusiness',
          wallet: address,
          name: input.name,
          category: input.category,
          location: input.location,
          website: input.website,
          txHash,
          onChain,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register business');
      }

      await refreshData();
      return {
        txHash: data.business.txHash,
        onChain,
        business: data.business as BusinessProfile,
      };
    },
    [
      address,
      wagmiConnected,
      walletClient,
      contractAddress,
      wagmiChainId,
      wagmiAddress,
      switchToBotchain,
      refreshData,
    ]
  );

  const registerWarranty = useCallback(
    async (input: {
      productName: string;
      serialNumber: string;
      category: string;
      durationMonths: number;
    }) => {
      if (!address) {
        throw new Error('Please connect your business wallet first.');
      }

      const normalized = normalizeSerial(input.serialNumber);
      const sHash = hashSerial(normalized);

      let txHash = '';
      let onChain = false;

      if (
        wagmiConnected &&
        walletClient &&
        contractAddress &&
        contractAddress.startsWith('0x') &&
        contractAddress.length === 42
      ) {
        if (wagmiChainId !== BOTCHAIN_CHAIN_ID) {
          await switchToBotchain();
        }
        const hash = await walletClient.writeContract({
          address: contractAddress as `0x${string}`,
          abi: PRODUCT_WARRANTY_REGISTRY_ABI,
          functionName: 'registerWarranty',
          args: [
            sHash,
            input.productName.trim(),
            normalized,
            input.category.trim(),
            BigInt(input.durationMonths),
          ],
          chain: botchainTestnet,
          account: wagmiAddress!,
        });
        await publicClient.waitForTransactionReceipt({ hash });
        txHash = hash;
        onChain = true;
      }

      const res = await fetch('/api/warranties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'registerWarranty',
          productName: input.productName,
          serialNumber: normalized,
          category: input.category,
          durationMonths: input.durationMonths,
          businessWallet: address,
          businessName: currentBusiness?.name || 'Verified Botchain Merchant',
          txHash,
          onChain,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register warranty');
      }

      await refreshData();
      return {
        txHash: data.warranty.txHash,
        onChain,
        warranty: data.warranty as WarrantyRecord,
      };
    },
    [
      address,
      wagmiConnected,
      walletClient,
      contractAddress,
      wagmiChainId,
      wagmiAddress,
      currentBusiness,
      switchToBotchain,
      refreshData,
    ]
  );

  const verifyWarrantyBySerial = useCallback(
    async (serial: string) => {
      const normalized = normalizeSerial(serial);
      const sHash = hashSerial(normalized);

      // 1. Check live smart contract on Botchain Testnet (gasless read!) if contractAddress is set
      if (
        contractAddress &&
        contractAddress.startsWith('0x') &&
        contractAddress.length === 42
      ) {
        try {
          const onChainData = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: PRODUCT_WARRANTY_REGISTRY_ABI,
            functionName: 'getWarranty',
            args: [sHash],
          });

          if (onChainData && onChainData.exists) {
            const record: WarrantyRecord = {
              serialHash: onChainData.serialHash,
              productName: onChainData.productName,
              serialNumber: onChainData.serialNumber,
              category: onChainData.category,
              businessWallet: onChainData.businessWallet,
              businessName: onChainData.businessName,
              startTimestamp: Number(onChainData.startTimestamp),
              durationMonths: Number(onChainData.durationMonths),
              expiryTimestamp: Number(onChainData.expiryTimestamp),
              registeredAt: Number(onChainData.registeredAt),
              isRevoked: onChainData.isRevoked,
              txHash: contractAddress,
              onChain: true,
            };
            return {
              warranty: record,
              serialHash: sHash,
              normalizedSerial: normalized,
              source: 'onchain' as const,
            };
          }
        } catch {
          // If not found on-chain or contract call reverted with WarrantyNotFound, fall back to hybrid registry
        }
      }

      // 2. Check hybrid registry API
      const res = await fetch(
        `/api/warranties?serial=${encodeURIComponent(normalized)}`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.warranty) {
          return {
            warranty: data.warranty as WarrantyRecord,
            serialHash: sHash,
            normalizedSerial: normalized,
            source: 'hybrid-registry' as const,
          };
        }
      }

      return {
        warranty: null,
        serialHash: sHash,
        normalizedSerial: normalized,
        source: 'not-found' as const,
      };
    },
    [contractAddress]
  );

  const toggleRevokeWarranty = useCallback(
    async (serialHash: `0x${string}`) => {
      if (!address) return;
      await fetch('/api/warranties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggleRevoke',
          serialHash,
          businessWallet: address,
        }),
      });
      await refreshData();
    },
    [address, refreshData]
  );

  return (
    <WarrantChainContext.Provider
      value={{
        address,
        isConnected,
        isDemoWallet,
        chainId,
        isBotchainNetwork,
        openConnectModal,
        switchToBotchain,
        enableDemoWallet,
        disconnectWallet,
        contractAddress,
        saveContractAddress,
        deployContract,
        isDeploying,
        businesses,
        warranties,
        currentBusiness,
        isLoading,
        refreshData,
        registerBusiness,
        registerWarranty,
        verifyWarrantyBySerial,
        toggleRevokeWarranty,
      }}
    >
      {children}
    </WarrantChainContext.Provider>
  );
}

export function WarrantChainProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WarrantChainInnerProvider>{children}</WarrantChainInnerProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function useWarrantChain() {
  const ctx = useContext(WarrantChainContext);
  if (!ctx) {
    throw new Error('useWarrantChain must be used within a WarrantChainProvider');
  }
  return ctx;
}

