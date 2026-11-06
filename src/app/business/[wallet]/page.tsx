'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Globe,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Search,
  FileBadge,
  ArrowLeft,
} from 'lucide-react';
import { useWarrantChain } from '@/context/WarrantChainContext';
import { getExplorerUrl } from '@/config/web3';

function formatHumanDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function PublicBusinessProfilePage() {
  const params = useParams<{ wallet: string }>();
  const walletParam = decodeURIComponent(params.wallet || '');
  const { businesses, warranties } = useWarrantChain();

  const business = businesses.find(
    (b) => b.wallet.toLowerCase() === walletParam.toLowerCase()
  );
  const businessProducts = warranties.filter(
    (w) => w.businessWallet.toLowerCase() === walletParam.toLowerCase()
  );

  const nowSec = Math.floor(Date.now() / 1000);
  const activeCount = businessProducts.filter(
    (w) => !w.isRevoked && w.expiryTimestamp >= nowSec
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Dashboard
      </Link>

      {/* Business Header Card */}
      <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 to-slate-900/80 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 shrink-0">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Registered Botchain Merchant
              </div>
              <h1 className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-white">
                {business ? business.name : 'On-Chain Merchant'}
              </h1>
              <p className="font-mono text-xs text-indigo-300 break-all mt-1">
                Wallet: {walletParam}
              </p>
            </div>
          </div>

          <a
            href={getExplorerUrl('address', walletParam)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:border-indigo-500/40 hover:text-white self-start"
          >
            View Wallet on scan.bohr.life
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Metadata strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-800/80 text-xs">
          <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3.5">
            <div className="text-slate-500">Category</div>
            <div className="mt-1 font-semibold text-white">
              {business?.category || 'Consumer Electronics'}
            </div>
          </div>
          <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3.5">
            <div className="flex items-center gap-1 text-slate-500">
              <MapPin className="h-3.5 w-3.5" /> Location
            </div>
            <div className="mt-1 font-semibold text-white">
              {business?.location || 'Verified Store'}
            </div>
          </div>
          <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3.5">
            <div className="flex items-center gap-1 text-slate-500">
              <Calendar className="h-3.5 w-3.5" /> Registered Since
            </div>
            <div className="mt-1 font-semibold text-white">
              {business
                ? formatHumanDate(business.registeredAt)
                : '6 November 2026'}
            </div>
          </div>
          <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3.5">
            <div className="flex items-center gap-1 text-slate-500">
              <Globe className="h-3.5 w-3.5" /> Warranties Issued
            </div>
            <div className="mt-1 font-semibold text-emerald-400">
              {businessProducts.length} total ({activeCount} active)
            </div>
          </div>
        </div>
      </div>

      {/* Registered Products by this Business */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">
          Products Registered by {business?.name || 'this Business'}
        </h2>

        {businessProducts.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center text-sm text-slate-400">
            No warranties have been registered by this wallet address yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {businessProducts.map((w) => {
              const active = !w.isRevoked && w.expiryTimestamp >= nowSec;
              return (
                <div
                  key={w.serialHash}
                  className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {w.productName}
                      </h3>
                      <p className="font-mono text-xs text-indigo-300 mt-0.5">
                        Serial: {w.serialNumber}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Warranty: {w.durationMonths} months · Expires{' '}
                        {formatHumanDate(w.expiryTimestamp)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        active
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {active ? 'Active' : 'Expired'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <Link
                      href={`/verify?serial=${encodeURIComponent(w.serialNumber)}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white"
                    >
                      <Search className="h-3.5 w-3.5 text-indigo-400" />
                      Verify Record
                    </Link>
                    <Link
                      href={`/certificate/${encodeURIComponent(w.serialNumber)}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/25"
                    >
                      <FileBadge className="h-3.5 w-3.5" />
                      Certificate
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

