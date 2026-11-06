'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Wallet,
  Sparkles,
  Hash,
  Clock,
  CheckCircle2,
  FileBadge,
  ExternalLink,
  Search,
  Package,
  Building2,
} from 'lucide-react';
import { useWarrantChain } from '@/context/WarrantChainContext';
import {
  BOTCHAIN_CHAIN_ID,
  getExplorerUrl,
  hashSerial,
  normalizeSerial,
} from '@/config/web3';
import { WarrantyRecord } from '@/lib/types';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';

const DURATION_OPTIONS = [
  { months: 6, label: '6 Months' },
  { months: 12, label: '12 Months (1 Year)' },
  { months: 18, label: '18 Months' },
  { months: 24, label: '24 Months (2 Years)' },
  { months: 36, label: '36 Months (3 Years)' },
  { months: 60, label: '60 Months (5 Years)' },
];

export default function RegisterWarrantyPage() {
  const {
    address,
    isConnected,
    currentBusiness,
    openConnectModal,
    enableDemoWallet,
    registerWarranty,
  } = useWarrantChain();

  const [productName, setProductName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [category, setCategory] = useState('Laptops & Computers');
  const [durationMonths, setDurationMonths] = useState<number>(12);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdWarranty, setCreatedWarranty] = useState<WarrantyRecord | null>(
    null
  );

  const normalizedPreview = serialNumber.trim()
    ? normalizeSerial(serialNumber)
    : '';
  const hashPreview = normalizedPreview ? hashSerial(normalizedPreview) : '';

  const fillRandomSerial = () => {
    const num = Math.floor(10000 + Math.random() * 90000);
    setSerialNumber(`WC-2026-${num}`);
    if (!productName) {
      setProductName('HP EliteBook Ultra G1');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreatedWarranty(null);

    if (!productName.trim() || !serialNumber.trim()) {
      setError('Both product name and serial number are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await registerWarranty({
        productName,
        serialNumber,
        category,
        durationMonths,
      });
      setCreatedWarranty(res.warranty);
      setProductName('');
      setSerialNumber('');
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to register warranty'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const verifyUrl =
    typeof window !== 'undefined' && createdWarranty
      ? `${window.location.origin}/verify?serial=${encodeURIComponent(
          createdWarranty.serialNumber
        )}`
      : `https://warrantchain.app/verify?serial=${encodeURIComponent(
          createdWarranty?.serialNumber || ''
        )}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
          <PlusCircle className="h-4 w-4" />
          Smart Contract Function · registerWarranty()
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Register Product Warranty
        </h1>
        <p className="text-sm text-slate-400">
          Record a tamper-evident product warranty on Botchain Testnet (Chain ID{' '}
          {BOTCHAIN_CHAIN_ID}) and immediately generate a customer verification QR code
          and Digital Warranty Certificate.
        </p>
      </div>

      {!isConnected ? (
        <div className="rounded-3xl border border-indigo-500/30 bg-slate-900/80 p-8 text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
            <Wallet className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Connect Business Wallet to Register Warranties
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Businesses connect their wallet to sign warranty registrations on Botchain
            Testnet. You can also test immediately using Demo Merchant mode.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={openConnectModal}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition-colors"
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet (Botchain 968)
            </button>
            <button
              type="button"
              onClick={() => enableDemoWallet()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              Use Demo Merchant (ABC Electronics)
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form Column (3 cols) */}
          <div className="lg:col-span-3 rounded-3xl border border-slate-800 bg-slate-900/75 p-6 sm:p-8 shadow-xl space-y-6">
            {/* Issuing Business Banner */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-xs">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-400" />
                <span className="text-slate-400">Registering as:</span>
                <strong className="text-white">
                  {currentBusiness ? currentBusiness.name : 'New Merchant Wallet'}
                </strong>
              </div>
              {!currentBusiness && (
                <Link
                  href="/register-business"
                  className="text-indigo-400 hover:underline font-medium"
                >
                  Set Business Name →
                </Link>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Product Name / Model *
                </label>
                <div className="relative">
                  <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. HP Laptop, Samsung Television, Sony Camera"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Product Serial Number *
                  </label>
                  <button
                    type="button"
                    onClick={fillRandomSerial}
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    + Generate Sample Serial
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g. HP-2026-00999"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-mono text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />

                {hashPreview && (
                  <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Hash className="h-3 w-3 text-indigo-400" />
                        Normalized Serial:
                      </span>
                      <code className="font-mono font-bold text-emerald-400">
                        {normalizedPreview}
                      </code>
                    </div>
                    <div className="font-mono text-slate-500 break-all">
                      keccak256: <span className="text-indigo-300">{hashPreview}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Product Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Laptops & Computers">Laptops &amp; Computers</option>
                  <option value="Televisions & Home Theater">
                    Televisions &amp; Home Theater
                  </option>
                  <option value="Smartphones & Mobile">
                    Smartphones &amp; Mobile
                  </option>
                  <option value="Audio & Headphones">Audio &amp; Headphones</option>
                  <option value="Home Appliances">Home Appliances</option>
                  <option value="Gaming & Consoles">Gaming &amp; Consoles</option>
                  <option value="Watches & Wearables">Watches &amp; Wearables</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Warranty Duration *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.months}
                      type="button"
                      onClick={() => setDurationMonths(opt.months)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 px-3 text-xs font-semibold transition-all ${
                        durationMonths === opt.months
                          ? 'border-indigo-500 bg-indigo-600/20 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5 text-indigo-400" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/15 p-3.5 text-xs text-rose-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 py-3.5 px-6 text-sm font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-emerald-500 disabled:opacity-50 transition-all"
              >
                <PlusCircle className="h-4 w-4" />
                {submitting
                  ? 'Registering Warranty on Botchain...'
                  : `Register ${durationMonths}-Month Warranty on Botchain`}
              </button>
            </form>
          </div>

          {/* Right Column: Instant QR & Certificate Output (2 cols) */}
          <div className="lg:col-span-2">
            {createdWarranty ? (
              <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/25 to-slate-900/90 p-6 shadow-2xl space-y-5">
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <CheckCircle2 className="h-6 w-6 shrink-0" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">
                      Registered on Botchain
                    </div>
                    <h3 className="text-lg font-extrabold text-white">
                      {createdWarranty.productName}
                    </h3>
                  </div>
                </div>

                <div className="flex justify-center py-2">
                  <QRCodeDisplay
                    value={verifyUrl}
                    size={165}
                    label={`WarrantChain-${createdWarranty.serialNumber}`}
                  />
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Serial Number:</span>
                    <code className="font-mono font-bold text-indigo-300">
                      {createdWarranty.serialNumber}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Duration:</span>
                    <span className="font-semibold text-white">
                      {createdWarranty.durationMonths} months
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Registered By:</span>
                    <span className="font-semibold text-emerald-300">
                      {createdWarranty.businessName}
                    </span>
                  </div>
                  <div className="pt-1 border-t border-slate-800/80 font-mono text-[10px] text-slate-400 break-all">
                    Tx: {createdWarranty.txHash}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Link
                    href={`/certificate/${encodeURIComponent(
                      createdWarranty.serialNumber
                    )}`}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 px-4 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                  >
                    <FileBadge className="h-4 w-4" />
                    Open &amp; Download Warranty Certificate
                  </Link>
                  <Link
                    href={`/verify?serial=${encodeURIComponent(
                      createdWarranty.serialNumber
                    )}`}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-2.5 px-4 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
                  >
                    <Search className="h-3.5 w-3.5" />
                    Open Public Verification Page
                  </Link>
                  <a
                    href={getExplorerUrl('tx', createdWarranty.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-indigo-400 hover:underline pt-1"
                  >
                    View Transaction on Botchain Explorer
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-4 text-xs text-slate-400">
                <h3 className="text-sm font-bold text-white">
                  What happens when you register?
                </h3>
                <ol className="space-y-3 list-decimal list-inside leading-relaxed">
                  <li>
                    The serial number is normalized (trimmed &amp; uppercased) and hashed
                    using <code className="text-indigo-300">keccak256</code>.
                  </li>
                  <li>
                    <code className="text-emerald-300">ProductWarrantyRegistry.sol</code>{' '}
                    stores the product name, serial, business wallet, start timestamp, and
                    expiry timestamp on Botchain Testnet (Chain ID 968).
                  </li>
                  <li>
                    An instant customer <strong>QR Code</strong> and printable{' '}
                    <strong>Digital Warranty Certificate</strong> are generated right in
                    your browser.
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

