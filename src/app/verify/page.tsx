'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Building2,
  Calendar,
  Clock,
  FileBadge,
  ExternalLink,
  Hash,
  CheckCircle2,
  XCircle,
  Info,
  QrCode,
} from 'lucide-react';
import { useWarrantChain } from '@/context/WarrantChainContext';
import { WarrantyRecord } from '@/lib/types';
import { getExplorerUrl, hashSerial, normalizeSerial } from '@/config/web3';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';

function formatHumanDate(timestampSec: number): string {
  const date = new Date(timestampSec * 1000);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function VerifyWarrantyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSerial = searchParams.get('serial') || '';

  const { verifyWarrantyBySerial, warranties } = useWarrantChain();

  const [inputSerial, setInputSerial] = useState(initialSerial || 'HP-2026-00125');
  const [searchedSerial, setSearchedSerial] = useState('');
  const [computedHash, setComputedHash] = useState<string>('');
  const [result, setResult] = useState<WarrantyRecord | null>(null);
  const [source, setSource] = useState<'onchain' | 'hybrid-registry' | 'not-found' | ''>('');
  const [searching, setSearching] = useState(false);

  const performLookup = useCallback(
    async (serialToFind: string) => {
      const trimmed = serialToFind.trim();
      if (!trimmed) return;
      setSearching(true);
      try {
        const res = await verifyWarrantyBySerial(trimmed);
        setSearchedSerial(res.normalizedSerial);
        setComputedHash(res.serialHash);
        setResult(res.warranty);
        setSource(res.source);
      } finally {
        setSearching(false);
      }
    },
    [verifyWarrantyBySerial]
  );

  useEffect(() => {
    const target = initialSerial || 'HP-2026-00125';
    setInputSerial(target);
    performLookup(target);
  }, [initialSerial, performLookup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSerial.trim()) return;
    const norm = normalizeSerial(inputSerial);
    router.replace(`/verify?serial=${encodeURIComponent(norm)}`, { scroll: false });
    performLookup(norm);
  };

  // Reference timestamp: current time (Nov 6, 2026 in environment)
  const nowSec = Math.floor(Date.now() / 1000);
  const isActive =
    result && !result.isRevoked && result.expiryTimestamp >= nowSec;

  const daysRemaining = result
    ? Math.ceil((result.expiryTimestamp - nowSec) / 86400)
    : 0;

  const verifyUrl =
    typeof window !== 'undefined' && result
      ? `${window.location.origin}/verify?serial=${encodeURIComponent(result.serialNumber)}`
      : `https://warrantchain.app/verify?serial=${encodeURIComponent(
          result?.serialNumber || 'HP-2026-00125'
        )}`;

  const liveHashPreview = inputSerial.trim()
    ? hashSerial(inputSerial)
    : '';

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          Public Gasless Verification · No Wallet Needed
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Warranty Verification
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Enter a product serial number or scan a WarrantChain QR code to check whether
          a product has a registered warranty on Botchain, when it expires, and which
          business registered it.
        </p>
      </div>

      {/* Search Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6 shadow-xl space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={inputSerial}
              onChange={(e) => setInputSerial(e.target.value)}
              placeholder="Enter serial number (e.g. HP-2026-00125)..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-12 pr-4 py-3.5 text-sm font-mono text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-emerald-500 disabled:opacity-50 transition-all"
          >
            <ShieldCheck className="h-4 w-4" />
            {searching ? 'Verifying...' : 'Verify Record'}
          </button>
        </form>

        {/* Live keccak256 hash indicator */}
        {liveHashPreview && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-950/90 border border-slate-800/80 px-3.5 py-2 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Hash className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span>Normalized Serial:</span>
              <code className="font-mono font-semibold text-white">
                {normalizeSerial(inputSerial)}
              </code>
            </div>
            <div className="font-mono text-[11px] text-slate-400 truncate max-w-full sm:max-w-md">
              keccak256: <span className="text-indigo-300">{liveHashPreview}</span>
            </div>
          </div>
        )}

        {/* Quick Select Serials */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-medium">Quick lookup:</span>
          {warranties.slice(0, 6).map((w) => {
            const active = !w.isRevoked && w.expiryTimestamp >= nowSec;
            return (
              <button
                key={w.serialHash}
                type="button"
                onClick={() => {
                  setInputSerial(w.serialNumber);
                  router.replace(`/verify?serial=${encodeURIComponent(w.serialNumber)}`, {
                    scroll: false,
                  });
                  performLookup(w.serialNumber);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono transition-colors ${
                  searchedSerial === w.serialNumber
                    ? 'border-indigo-500 bg-indigo-500/20 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    active ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                <span>{w.serialNumber}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Verification Result Card */}
      {searchedSerial && !searching && (
        <>
          {result ? (
            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl">
              {/* Top Verification Banner */}
              <div
                className={`flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b ${
                  isActive
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isActive ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
                      Warranty verification · Verified record
                    </div>
                    <div className="text-lg font-bold text-white">
                      {isActive
                        ? 'Warranty is active'
                        : result.isRevoked
                          ? 'Warranty has been revoked by issuer'
                          : 'Warranty has expired'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {isActive ? 'ACTIVE COVERAGE' : 'EXPIRED'}
                  </span>
                </div>
              </div>

              {/* Main Record Body */}
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Product Headline */}
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center rounded-md bg-indigo-500/15 px-2.5 py-0.5 text-xs font-medium text-indigo-300 border border-indigo-500/30">
                      {result.category}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                      {result.productName}
                    </h2>
                    <p className="font-mono text-sm text-slate-300">
                      Product serial:{' '}
                      <span className="font-bold text-indigo-300">
                        {result.serialNumber}
                      </span>
                    </p>
                  </div>

                  {/* Key Fields Grid matching Spec Section 4 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Building2 className="h-4 w-4 text-indigo-400" />
                        Registered by
                      </div>
                      <div className="mt-1.5 text-base font-bold text-white">
                        {result.businessName}
                      </div>
                      <Link
                        href={`/business/${result.businessWallet}`}
                        className="mt-1 inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-mono"
                      >
                        {result.businessWallet.slice(0, 10)}...
                        {result.businessWallet.slice(-6)}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="h-4 w-4 text-emerald-400" />
                        Warranty duration
                      </div>
                      <div className="mt-1.5 text-base font-bold text-white">
                        {result.durationMonths} months
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {isActive
                          ? `${daysRemaining} days of coverage remaining`
                          : `Expired ${Math.abs(daysRemaining)} days ago`}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar className="h-4 w-4 text-indigo-400" />
                        Registration date
                      </div>
                      <div className="mt-1.5 text-base font-bold text-white">
                        {formatHumanDate(result.startTimestamp)}
                      </div>
                      <div className="mt-1 text-[11px] font-mono text-slate-500">
                        Unix: {result.startTimestamp}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar className="h-4 w-4 text-emerald-400" />
                        Expiry date
                      </div>
                      <div className="mt-1.5 text-base font-bold text-white">
                        {formatHumanDate(result.expiryTimestamp)}
                      </div>
                      <div className="mt-1 text-[11px] font-mono text-slate-500">
                        Unix: {result.expiryTimestamp}
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Proof Details */}
                  <div className="rounded-2xl border border-slate-800/90 bg-slate-950/60 p-4 space-y-2 text-xs">
                    <div className="font-semibold text-slate-300 flex items-center justify-between">
                      <span>Botchain Cryptographic Proof (Chain ID 968)</span>
                      <span className="rounded bg-indigo-500/15 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                        {source === 'onchain' ? 'Live Smart Contract' : 'Botchain Registry'}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-400 break-all">
                      <span className="text-slate-500">Serial Hash (keccak256): </span>
                      {result.serialHash}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400 break-all flex items-center justify-between gap-2">
                      <div>
                        <span className="text-slate-500">Tx Reference: </span>
                        {result.txHash}
                      </div>
                      <a
                        href={getExplorerUrl('tx', result.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 shrink-0"
                      >
                        Explorer <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Link
                      href={`/certificate/${encodeURIComponent(result.serialNumber)}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 px-5 py-3 text-xs font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-emerald-500 transition-all"
                    >
                      <FileBadge className="h-4 w-4" />
                      Open Digital Warranty Certificate
                    </Link>
                    <Link
                      href={`/business/${result.businessWallet}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:text-white transition-colors"
                    >
                      <Building2 className="h-4 w-4 text-indigo-400" />
                      View Business Profile
                    </Link>
                  </div>
                </div>

                {/* Right Column: QR Code Verification Card */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-center space-y-4">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                    <QrCode className="h-4 w-4 text-indigo-400" />
                    Public Verification QR Code
                  </div>
                  <QRCodeDisplay
                    value={verifyUrl}
                    size={165}
                    label={`WarrantChain-${result.serialNumber}`}
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-[220px]">
                    Scanning this QR code opens this public verification record directly—no
                    MetaMask wallet required.
                  </p>
                </div>
              </div>

              {/* Authenticity Notice Footer */}
              <div className="border-t border-slate-800/80 bg-slate-950/90 px-6 py-3.5 flex items-start gap-2.5 text-xs text-slate-400">
                <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Verification Note:</strong> Registering a warranty on Botchain
                  cryptographically proves that wallet{' '}
                  <code className="text-slate-300">{result.businessWallet}</code>{' '}
                  ({result.businessName}) submitted this warranty record on{' '}
                  {formatHumanDate(result.registeredAt)}.
                </span>
              </div>
            </div>
          ) : (
            /* Not Found State */
            <div className="rounded-3xl border border-rose-500/30 bg-rose-950/15 p-8 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-white">
                No Registered Warranty Found
              </h2>
              <p className="text-sm text-slate-300 max-w-lg mx-auto">
                No warranty record matching serial number{' '}
                <code className="font-mono font-bold text-rose-300">{searchedSerial}</code>{' '}
                (hash <code className="font-mono text-xs text-slate-400">{computedHash.slice(0, 18)}...</code>)
                was found on WarrantChain.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  href="/register-warranty"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Are you the seller? Register this Warranty
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function VerifyWarrantyPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-16 text-center text-slate-400">
          Loading Warranty Verification...
        </div>
      }
    >
      <VerifyWarrantyContent />
    </Suspense>
  );
}

