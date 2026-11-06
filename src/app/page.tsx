'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Search,
  QrCode,
  Building2,
  CheckCircle2,
  ArrowRight,
  Cpu,
  Lock,
  FileBadge,
  Sparkles,
  Wallet,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { useWarrantChain } from '@/context/WarrantChainContext';
import {
  BOTCHAIN_CHAIN_ID,
  BOTCHAIN_EXPLORER_URL,
  BOTCHAIN_RPC_URL,
  BOTCHAIN_TOKEN_SYMBOL,
  BOTCHAIN_TOTAL_SUPPLY,
} from '@/config/web3';

const SAMPLE_SERIALS = [
  { serial: 'HP-2026-00125', label: 'HP Laptop (Active)' },
  { serial: 'TV-2026-00412', label: 'Samsung TV (Active)' },
  { serial: 'IPH-2025-00044', label: 'iPhone 16 Pro (Expired)' },
];

export default function HomePage() {
  const router = useRouter();
  const [serialQuery, setSerialQuery] = useState('');
  const { warranties, businesses } = useWarrantChain();

  const nowSec = Math.floor(Date.now() / 1000);
  const activeCount = warranties.filter(
    (w) => !w.isRevoked && w.expiryTimestamp >= nowSec
  ).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialQuery.trim()) return;
    router.push(`/verify?serial=${encodeURIComponent(serialQuery.trim())}`);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900/70 via-slate-950 to-slate-950 pt-14 pb-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/15 via-emerald-500/5 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Web3 Warranty Registry on Botchain Testnet (Chain ID {BOTCHAIN_CHAIN_ID})</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Warrant<span className="text-indigo-400">Chain</span>
              <span className="block mt-2 bg-gradient-to-r from-indigo-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent text-2xl sm:text-4xl font-bold">
                Register It. Protect It. Verify It.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Replace easily lost paper warranty cards with permanent, verifiable blockchain
              records on <strong className="text-white">Botchain</strong>. Businesses register
              product warranties in seconds; customers verify coverage anytime—<span className="text-emerald-400 font-medium">no wallet or gas required</span>.
            </p>

            {/* Instant Search Bar */}
            <form
              onSubmit={handleSearch}
              className="mx-auto mt-8 flex max-w-2xl flex-col sm:flex-row gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/90 p-2.5 shadow-2xl shadow-indigo-950/40"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="ml-3.5 h-5 w-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={serialQuery}
                  onChange={(e) => setSerialQuery(e.target.value)}
                  placeholder="Enter product serial number (e.g. HP-2026-00125)..."
                  className="w-full bg-transparent px-3.5 py-3 text-sm text-white placeholder-slate-400 focus:outline-none font-mono"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-emerald-500 transition-all"
              >
                <ShieldCheck className="h-4 w-4" />
                Verify Warranty
              </button>
            </form>

            {/* Quick sample chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
              <span className="text-slate-400">Try sample serials:</span>
              {SAMPLE_SERIALS.map((item) => (
                <button
                  key={item.serial}
                  type="button"
                  onClick={() =>
                    router.push(`/verify?serial=${encodeURIComponent(item.serial)}`)
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 font-mono text-slate-300 hover:border-indigo-500/40 hover:text-indigo-300 transition-colors"
                >
                  <span>{item.serial}</span>
                  <span className="font-sans text-[10px] text-slate-500">
                    · {item.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Secondary CTAs */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register-warranty"
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-5 py-2.5 text-sm font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-colors"
              >
                Register a Product Warranty
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-5 py-2.5 text-sm font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
              >
                Open Business Dashboard
              </Link>
              <Link
                href="/certificate/HP-2026-00125"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors"
              >
                <FileBadge className="h-4 w-4" />
                View Sample Certificate
              </Link>
            </div>
          </div>

          {/* Live Platform & Botchain Network Strip */}
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 text-center">
              <div className="text-xs font-medium text-slate-400">Botchain Network</div>
              <div className="mt-1 text-lg font-bold text-white font-mono">
                Chain ID {BOTCHAIN_CHAIN_ID}
              </div>
              <div className="mt-0.5 text-[11px] text-emerald-400">
                Token: {BOTCHAIN_TOKEN_SYMBOL} ({BOTCHAIN_TOTAL_SUPPLY})
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 text-center">
              <div className="text-xs font-medium text-slate-400">Registered Warranties</div>
              <div className="mt-1 text-2xl font-bold text-indigo-400">
                {warranties.length}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-400">
                {activeCount} currently active
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 text-center">
              <div className="text-xs font-medium text-slate-400">Verified Businesses</div>
              <div className="mt-1 text-2xl font-bold text-emerald-400">
                {businesses.length}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-400">
                On-chain merchant profiles
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 text-center">
              <div className="text-xs font-medium text-slate-400">Customer Verification</div>
              <div className="mt-1 text-xl font-bold text-white">100% Free</div>
              <div className="mt-0.5 text-[11px] text-emerald-400">
                No MetaMask or gas needed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: How It Works */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            End-to-End Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            How WarrantChain Works
          </h2>
          <p className="text-sm text-slate-400">
            Imagine an electronics shop sells a customer a laptop with a 12-month warranty.
            Here is the complete lifecycle on Botchain:
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: '01',
              title: 'Connect Business Wallet',
              desc: 'The shop opens WarrantChain and connects its wallet on Botchain Testnet (Chain ID 968).',
              icon: Wallet,
            },
            {
              step: '02',
              title: 'Enter Product & Duration',
              desc: 'The business enters the product name (e.g. HP Laptop), serial number, and selects 12 months.',
              icon: Lock,
            },
            {
              step: '03',
              title: 'Register on Botchain & QR',
              desc: 'Serial is normalized & keccak256-hashed on-chain. A QR code & Digital Certificate are generated.',
              icon: QrCode,
            },
            {
              step: '04',
              title: 'Instant Customer Verification',
              desc: 'Customer scans the QR code or enters the serial number to verify active status—no wallet needed.',
              icon: ShieldCheck,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-indigo-500/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    STEP {item.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: Two Types of Users */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* A. Businesses */}
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/25 to-slate-900/80 p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  For Merchants &amp; Retailers
                </span>
                <h3 className="text-xl font-bold text-white">A. Businesses</h3>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-slate-300">
              {[
                'Register an official on-chain Business Profile',
                'Register products with normalized & keccak256-hashed serial numbers',
                'Set flexible warranty durations (6, 12, 24, 36+ months)',
                'View and manage all registered warranties in one dashboard',
                'Generate downloadable Digital Warranty Certificates & QR codes in-browser',
                'Track active vs. expired warranty dates effortlessly',
              ].map((pt) => (
                <li key={pt} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/register-business"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                Register Business
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/register-warranty"
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-2.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-colors"
              >
                Register Warranty
              </Link>
            </div>
          </div>

          {/* B. Customers */}
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-slate-900/80 p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                <QrCode className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Wallet-Free Public Lookup
                </span>
                <h3 className="text-xl font-bold text-white">B. Customers</h3>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-slate-300">
              {[
                'Scan a product QR code or enter a serial number directly',
                'View verified product warranty details in real time',
                'Check whether the warranty is Active or Expired with a countdown',
                'See which registered business issued the warranty',
                'Inspect the exact registration date and warranty expiration date',
                'Download or print the Digital Warranty Certificate—no MetaMask required',
              ].map((pt) => (
                <li key={pt} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/verify?serial=HP-2026-00125"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
              >
                Verify Sample Product (HP-2026-00125)
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/certificate/HP-2026-00125"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
              >
                Open Digital Certificate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Where the Blockchain Comes In */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Smart Contract Architecture · ProductWarrantyRegistry.sol
              </span>
              <h2 className="mt-1 text-2xl font-bold text-white">
                Where the Botchain Blockchain Comes In
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Businesses pay a tiny Botchain Testnet (<code className="text-emerald-400">BOT</code>) gas fee when registering records. Customers verify warranties for free.
              </p>
            </div>
            <a
              href={BOTCHAIN_EXPLORER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:border-indigo-500/40 hover:text-white transition-colors self-start"
            >
              <Cpu className="h-4 w-4 text-emerald-400" />
              Botchain Explorer ({BOTCHAIN_RPC_URL})
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Contract Function</th>
                  <th className="py-3.5 px-4">Wallet Required?</th>
                  <th className="py-3.5 px-4">Gas (BOT)?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-200">
                {[
                  {
                    action: 'Search for a product',
                    fn: 'getWarranty(bytes32 serialHash)',
                    wallet: false,
                    gas: false,
                  },
                  {
                    action: 'Verify warranty validity',
                    fn: 'verifyWarranty(bytes32 serialHash)',
                    wallet: false,
                    gas: false,
                  },
                  {
                    action: 'View business profile',
                    fn: 'getBusiness(address wallet)',
                    wallet: false,
                    gas: false,
                  },
                  {
                    action: 'Register business profile',
                    fn: 'registerBusiness(...)',
                    wallet: true,
                    gas: true,
                  },
                  {
                    action: 'Register product warranty',
                    fn: 'registerWarranty(bytes32 serialHash, ...)',
                    wallet: true,
                    gas: true,
                  },
                ].map((row) => (
                  <tr key={row.action} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-medium text-white">{row.action}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-indigo-300">
                      {row.fn}
                    </td>
                    <td className="py-3.5 px-4">
                      {row.wallet ? (
                        <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-300 border border-amber-500/30">
                          Yes (Merchant)
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300 border border-emerald-500/30">
                          No
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {row.gas ? (
                        <span className="inline-flex items-center gap-1 text-xs font-mono text-amber-300">
                          <Clock className="h-3.5 w-3.5" /> Yes (BOT Testnet)
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-400">
                          No (Free Read)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

