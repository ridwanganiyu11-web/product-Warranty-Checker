'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PackageCheck,
  Search,
  FileBadge,
  QrCode,
  PlusCircle,
  RotateCcw,
  Ban,
  X,
} from 'lucide-react';
import { useWarrantChain } from '@/context/WarrantChainContext';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { WarrantyRecord } from '@/lib/types';

function formatShortDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function MyProductsPage() {
  const { address, warranties, toggleRevokeWarranty } = useWarrantChain();

  const [scope, setScope] = useState<'all' | 'mine'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [qrModalWarranty, setQrModalWarranty] = useState<WarrantyRecord | null>(
    null
  );

  const nowSec = Math.floor(Date.now() / 1000);

  const filtered = warranties.filter((w) => {
    if (
      scope === 'mine' &&
      address &&
      w.businessWallet.toLowerCase() !== address.toLowerCase()
    ) {
      return false;
    }
    const active = !w.isRevoked && w.expiryTimestamp >= nowSec;
    if (statusFilter === 'active' && !active) return false;
    if (statusFilter === 'expired' && active) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        w.productName.toLowerCase().includes(q) ||
        w.serialNumber.toLowerCase().includes(q) ||
        w.businessName.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <PackageCheck className="h-4 w-4" />
            Smart Contract Function · getBusinessProducts()
          </div>
          <h1 className="mt-1 text-3xl font-extrabold text-white">
            Registered Product Warranties
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Browse, filter, and generate QR codes or Digital Warranty Certificates for
            registered products.
          </p>
        </div>

        <Link
          href="/register-warranty"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-emerald-500 self-start"
        >
          <PlusCircle className="h-4 w-4" />
          Register New Warranty
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/75 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, serial number, or business..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {address && (
            <div className="inline-flex rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs">
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`rounded-lg px-3 py-1.5 font-medium ${
                  scope === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Warranties
              </button>
              <button
                type="button"
                onClick={() => setScope('mine')}
                className={`rounded-lg px-3 py-1.5 font-medium ${
                  scope === 'mine'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                My Business Only
              </button>
            </div>
          )}

          <div className="inline-flex rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs">
            {(['all', 'active', 'expired'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-3 py-1.5 font-medium capitalize ${
                  statusFilter === st
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-12 text-center space-y-3">
          <p className="text-base font-bold text-white">
            No matching warranty records found
          </p>
          <p className="text-xs text-slate-400">
            Try clearing your search filter or register a new product warranty.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((w) => {
            const active = !w.isRevoked && w.expiryTimestamp >= nowSec;
            const isOwner =
              address &&
              w.businessWallet.toLowerCase() === address.toLowerCase();

            return (
              <div
                key={w.serialHash}
                className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/75 p-6 hover:border-indigo-500/40 transition-all shadow-lg space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-md bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                      {w.category}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        active
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {active ? 'Active' : w.isRevoked ? 'Revoked' : 'Expired'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {w.productName}
                    </h3>
                    <p className="mt-0.5 font-mono text-xs text-indigo-300 font-semibold">
                      Serial: {w.serialNumber}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-950/80 border border-slate-800/80 p-3.5 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Registered by:</span>
                      <Link
                        href={`/business/${w.businessWallet}`}
                        className="font-semibold text-slate-200 hover:text-indigo-300"
                      >
                        {w.businessName}
                      </Link>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Duration:</span>
                      <span className="text-slate-200 font-medium">
                        {w.durationMonths} months
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Start Date:</span>
                      <span className="text-slate-300">
                        {formatShortDate(w.startTimestamp)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Expiry Date:</span>
                      <span
                        className={
                          active
                            ? 'text-emerald-400 font-medium'
                            : 'text-rose-400 font-medium'
                        }
                      >
                        {formatShortDate(w.expiryTimestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/verify?serial=${encodeURIComponent(w.serialNumber)}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <Search className="h-3.5 w-3.5 text-indigo-400" />
                    Verify
                  </Link>
                  <Link
                    href={`/certificate/${encodeURIComponent(w.serialNumber)}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2 px-3 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                  >
                    <FileBadge className="h-3.5 w-3.5" />
                    Certificate
                  </Link>
                  <button
                    type="button"
                    onClick={() => setQrModalWarranty(w)}
                    title="Show QR Code"
                    className="rounded-xl border border-slate-700 bg-slate-950 p-2 text-slate-300 hover:border-indigo-500/50 hover:text-indigo-300 transition-colors"
                  >
                    <QrCode className="h-4 w-4" />
                  </button>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => toggleRevokeWarranty(w.serialHash)}
                      title={
                        w.isRevoked ? 'Restore Warranty' : 'Authorize Revocation'
                      }
                      className="rounded-xl border border-slate-700 bg-slate-950 p-2 text-slate-400 hover:border-rose-500/40 hover:text-rose-400 transition-colors"
                    >
                      {w.isRevoked ? (
                        <RotateCcw className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Ban className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalWarranty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center shadow-2xl space-y-4">
            <button
              type="button"
              onClick={() => setQrModalWarranty(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              WarrantChain Verification QR
            </div>
            <h3 className="text-lg font-bold text-white">
              {qrModalWarranty.productName}
            </h3>
            <p className="font-mono text-xs text-slate-300">
              {qrModalWarranty.serialNumber}
            </p>
            <div className="flex justify-center py-2">
              <QRCodeDisplay
                value={
                  typeof window !== 'undefined'
                    ? `${window.location.origin}/verify?serial=${encodeURIComponent(
                        qrModalWarranty.serialNumber
                      )}`
                    : `https://warrantchain.app/verify?serial=${encodeURIComponent(
                        qrModalWarranty.serialNumber
                      )}`
                }
                size={180}
                label={`WarrantChain-${qrModalWarranty.serialNumber}`}
              />
            </div>
            <Link
              href={`/certificate/${encodeURIComponent(
                qrModalWarranty.serialNumber
              )}`}
              className="block w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Open Full Warranty Certificate
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

