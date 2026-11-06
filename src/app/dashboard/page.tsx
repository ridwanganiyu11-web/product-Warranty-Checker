'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ShieldCheck,
  ShieldX,
  Building2,
  PlusCircle,
  FileBadge,
  Search,
  Cpu,
  Rocket,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { useWarrantChain } from '@/context/WarrantChainContext';
import {
  BOTCHAIN_CHAIN_ID,
  BOTCHAIN_EXPLORER_URL,
  BOTCHAIN_RPC_URL,
  BOTCHAIN_TOKEN_SYMBOL,
  BOTCHAIN_TOTAL_SUPPLY,
  getExplorerUrl,
} from '@/config/web3';

export default function DashboardPage() {
  const {
    warranties,
    businesses,
    contractAddress,
    saveContractAddress,
    deployContract,
    isDeploying,
    isConnected,
    openConnectModal,
  } = useWarrantChain();

  const [statsMode, setStatsMode] = useState<'illustrative' | 'live'>('illustrative');
  const [addressInput, setAddressInput] = useState(contractAddress || '');
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const nowSec = Math.floor(Date.now() / 1000);
  const liveActive = warranties.filter(
    (w) => !w.isRevoked && w.expiryTimestamp >= nowSec
  ).length;
  const liveExpired = warranties.length - liveActive;

  // Illustrative metrics from Specification Section 3 + any newly added records above initial 8
  const extraWarranties = Math.max(0, warranties.length - 8);
  const extraBusinesses = Math.max(0, businesses.length - 3);

  const displayedStats =
    statsMode === 'illustrative'
      ? {
          registeredProducts: 125 + extraWarranties,
          activeWarranties: 98 + extraWarranties,
          expiredWarranties: 17,
          totalBusinesses: 10 + extraBusinesses,
        }
      : {
          registeredProducts: warranties.length,
          activeWarranties: liveActive,
          expiredWarranties: liveExpired,
          totalBusinesses: businesses.length,
        };

  const handleSaveContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');
    await saveContractAddress(addressInput);
    setStatusMsg('Contract address saved and synced.');
  };

  const handleDeploy = async () => {
    setErrorMsg('');
    setStatusMsg('');
    try {
      const deployed = await deployContract();
      setAddressInput(deployed);
      setStatusMsg(`Deployed ProductWarrantyRegistry to ${deployed}`);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Contract deployment failed'
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            Merchant &amp; Network Overview
          </div>
          <h1 className="mt-1 text-3xl font-extrabold text-white">
            WarrantChain Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Monitor registered products, active warranties, and Botchain smart contract activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle between Spec Illustrative Metrics and Live DB Count */}
          <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900 p-1 text-xs">
            <button
              type="button"
              onClick={() => setStatsMode('illustrative')}
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                statsMode === 'illustrative'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Benchmark View (125)
            </button>
            <button
              type="button"
              onClick={() => setStatsMode('live')}
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                statsMode === 'live'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Live Records ({warranties.length})
            </button>
          </div>

          <Link
            href="/register-warranty"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-emerald-500 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            Register Warranty
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards from Spec Section 3 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Registered products
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-white">
            {displayedStats.registeredProducts}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Total warranties indexed by keccak256 serial hash
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/25 bg-slate-900/75 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Active warranties
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-emerald-400">
            {displayedStats.activeWarranties}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Currently within valid warranty coverage period
          </p>
        </div>

        <div className="rounded-2xl border border-rose-500/25 bg-slate-900/75 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              Expired warranties
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
              <ShieldX className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-rose-400">
            {displayedStats.expiredWarranties}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Past expiration timestamp or revoked
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Businesses
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-white">
            {displayedStats.totalBusinesses}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Registered merchant wallets on Botchain
          </p>
        </div>
      </div>

      {/* Main Content Grid: Recent Registrations + Smart Contract / Business Sidebar */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Registrations (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/75 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Recent registrations</h2>
              <p className="text-xs text-slate-400">
                Click any product record to verify its status or generate its QR certificate.
              </p>
            </div>
            <Link
              href="/my-products"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              View all products →
            </Link>
          </div>

          <div className="space-y-3">
            {warranties.map((w) => {
              const active = !w.isRevoked && w.expiryTimestamp >= nowSec;
              return (
                <div
                  key={w.serialHash}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800/90 bg-slate-950/70 p-4 hover:border-indigo-500/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-bold text-white">
                        {w.productName}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          active
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {active ? 'Active' : 'Expired'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span>
                        Serial:{' '}
                        <code className="font-mono font-semibold text-indigo-300">
                          {w.serialNumber}
                        </code>
                      </span>
                      <span>
                        Warranty:{' '}
                        <strong className="text-slate-200">
                          {w.durationMonths} months
                        </strong>
                      </span>
                      <span>
                        Business:{' '}
                        <Link
                          href={`/business/${w.businessWallet}`}
                          className="text-slate-300 hover:text-white underline decoration-slate-700"
                        >
                          {w.businessName}
                        </Link>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/verify?serial=${encodeURIComponent(w.serialNumber)}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 hover:border-indigo-500/50 hover:text-white transition-colors"
                    >
                      <Search className="h-3.5 w-3.5 text-indigo-400" />
                      Verify
                    </Link>
                    <Link
                      href={`/certificate/${encodeURIComponent(w.serialNumber)}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 px-3 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/25 transition-colors"
                    >
                      <FileBadge className="h-3.5 w-3.5" />
                      Certificate
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Botchain Contract & Registered Businesses */}
        <div className="space-y-6">
          {/* Botchain Smart Contract Card */}
          <div className="rounded-3xl border border-indigo-500/30 bg-slate-900/80 p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  ProductWarrantyRegistry.sol
                </h3>
                <p className="text-[11px] text-emerald-400">
                  Botchain Testnet · Chain ID {BOTCHAIN_CHAIN_ID}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">RPC URL:</span>
                <span className="font-mono text-slate-300">{BOTCHAIN_RPC_URL}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Native Token:</span>
                <span className="font-mono text-emerald-400">
                  {BOTCHAIN_TOKEN_SYMBOL} ({BOTCHAIN_TOTAL_SUPPLY})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Explorer:</span>
                <a
                  href={BOTCHAIN_EXPLORER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  scan.bohr.life <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <form onSubmit={handleSaveContract} className="space-y-2.5">
              <label className="block text-xs font-medium text-slate-300">
                Deployed Contract Address (Optional in Hybrid Mode)
              </label>
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="0x... (Leave blank for hybrid demo mode)"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  Save Address
                </button>
                {isConnected ? (
                  <button
                    type="button"
                    onClick={handleDeploy}
                    disabled={isDeploying}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2 px-3 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    <Rocket className="h-3.5 w-3.5" />
                    {isDeploying ? 'Deploying...' : '1-Click Deploy'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={openConnectModal}
                    className="flex-1 rounded-xl bg-indigo-600/80 py-2 px-3 text-xs font-semibold text-white hover:bg-indigo-600"
                  >
                    Connect to Deploy
                  </button>
                )}
              </div>
            </form>

            {contractAddress && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-[11px] text-emerald-300 flex items-center justify-between">
                <span className="truncate font-mono">{contractAddress}</span>
                <a
                  href={getExplorerUrl('address', contractAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center gap-1 text-emerald-400 font-semibold shrink-0"
                >
                  View <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {statusMsg && (
              <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-2.5 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{statusMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="rounded-xl bg-rose-500/15 border border-rose-500/30 p-2.5 text-xs text-rose-300">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Registered Businesses Directory */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Registered Businesses
              </h3>
              <Link
                href="/register-business"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                + Add Business
              </Link>
            </div>

            <div className="space-y-2.5">
              {businesses.map((biz) => (
                <Link
                  key={biz.wallet}
                  href={`/business/${biz.wallet}`}
                  className="block rounded-2xl border border-slate-800/90 bg-slate-950/70 p-3.5 hover:border-indigo-500/40 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {biz.name}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400" />
                  </div>
                  <div className="mt-0.5 text-xs text-slate-400">{biz.category}</div>
                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>
                      {biz.wallet.slice(0, 8)}...{biz.wallet.slice(-6)}
                    </span>
                    <span className="text-emerald-400 font-sans font-medium">
                      {biz.productCount} products
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

