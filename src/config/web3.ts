import { defineChain } from '@reown/appkit/networks';
import { keccak256, toBytes } from 'viem';

export const BOTCHAIN_CHAIN_ID = 968;
export const BOTCHAIN_RPC_URL =
  process.env.NEXT_PUBLIC_BOTCHAIN_RPC_URL || 'https://rpc.bohr.life';
export const BOTCHAIN_EXPLORER_URL =
  process.env.NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL || 'https://scan.bohr.life/';
export const BOTCHAIN_TOKEN_SYMBOL = 'BOT';
export const BOTCHAIN_TOTAL_SUPPLY = '150,000,000 BOT';

export const botchainTestnet = defineChain({
  id: 968,
  caipNetworkId: 'eip155:968',
  chainNamespace: 'eip155',
  name: 'Botchain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BOT',
    symbol: 'BOT',
  },
  rpcUrls: {
    default: {
      http: [BOTCHAIN_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: 'Botchain Explorer',
      url: BOTCHAIN_EXPLORER_URL,
    },
  },
  testnet: true,
});

// Project ID for Reown AppKit
export const projectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || '05e6edf1e0ff1ba8a6a26c95abd820bf';

/**
 * Normalize a serial number before hashing or comparison:
 * Trims whitespace, collapses internal spaces, and converts to uppercase.
 */
export function normalizeSerial(serial: string): string {
  return serial.trim().replace(/\s+/g, '-').toUpperCase();
}

/**
 * Compute keccak256 hash of the normalized serial number (bytes32)
 */
export function hashSerial(serial: string): `0x${string}` {
  const normalized = normalizeSerial(serial);
  return keccak256(toBytes(normalized));
}

/**
 * Format an explorer link for transactions or addresses on Botchain Testnet
 */
export function getExplorerUrl(type: 'tx' | 'address', value: string): string {
  const base = BOTCHAIN_EXPLORER_URL.replace(/\/$/, '');
  return `${base}/${type}/${value}`;
}
