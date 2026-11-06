'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Wallet,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Globe,
  MapPin,
  Tag,
} from 'lucide-react';
import { useWarrantChain } from '@/context/WarrantChainContext';
import { BOTCHAIN_CHAIN_ID, getExplorerUrl } from '@/config/web3';

export default function RegisterBusinessPage() {
  const {
    address,
    isConnected,
    currentBusiness,
    openConnectModal,
    enableDemoWallet,
    registerBusiness,
  } = useWarrantChain();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Computers & Home Electronics');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [txResult, setTxResult] = useState<{
    txHash: string;
    onChain: boolean;
    wallet: string;
  } | null>(null);

  useEffect(() => {
    if (currentBusiness) {
      setName(currentBusiness.name);
      setCategory(currentBusiness.category);
      setLocation(currentBusiness.location);
      setWebsite(currentBusiness.website);
    }
  }, [currentBusiness]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTxResult(null);

    if (!name.trim()) {
      setError('Business name is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await registerBusiness({
        name,
        category,
        location,
        website,
      });
      setTxResult({
        txHash: res.txHash,
        onChain: res.onChain,
        wallet: res.business.wallet,
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to register business'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
          <Building2 className="h-4 w-4" />
          Smart Contract Function · registerBusiness()
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          {currentBusiness ? 'Update Business Profile' : 'Register Business Profile'}
        </h1>
        <p className="text-sm text-slate-400">
          Register your merchant wallet on Botchain Testnet (Chain ID {BOTCHAIN_CHAIN_ID}) so
          customers can verify that product warranties were issued by your business.
        </p>
      </div>

      {!isConnected ? (
        <div className="rounded-3xl border border-indigo-500/30 bg-slate-900/80 p-8 text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
            <Wallet className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Connect Your Business Wallet
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Connect MetaMask or any WalletConnect-compatible wallet on Botchain Testnet
            (Chain ID 968) to register your business profile, or try Demo Merchant mode.
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
              Use Demo Merchant Wallet
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-950/90 border border-slate-800 px-4 py-3 text-xs">
            <span className="text-slate-400">Connected Merchant Wallet:</span>
            <code className="font-mono font-semibold text-indigo-300 break-all">
              {address}
            </code>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Business / Store Name *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ABC Electronics"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Industry Category
                </label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Computers & Home Electronics">
                      Computers &amp; Home Electronics
                    </option>
                    <option value="Smartphones & Wearables">
                      Smartphones &amp; Wearables
                    </option>
                    <option value="Home Appliances & Smart TVs">
                      Home Appliances &amp; Smart TVs
                    </option>
                    <option value="Audio & Photography">
                      Audio &amp; Photography
                    </option>
                    <option value="Watches & Luxury Goods">
                      Watches &amp; Luxury Goods
                    </option>
                    <option value="Automotive & E-Mobility">
                      Automotive &amp; E-Mobility
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Store Location / City
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Official Website / Support URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://abcelectronics.example.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
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
              <Building2 className="h-4 w-4" />
              {submitting
                ? 'Recording Business Profile on Botchain...'
                : currentBusiness
                  ? 'Save & Update Business Profile'
                  : 'Register Business on Botchain'}
            </button>
          </form>

          {txResult && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Business Profile Registered Successfully!
              </div>
              <div className="text-xs font-mono text-slate-300 break-all">
                Tx Reference: {txResult.txHash}
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/register-warranty"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  Register a Product Warranty
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/business/${txResult.wallet}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white"
                >
                  View Public Business Profile
                </Link>
                <a
                  href={getExplorerUrl('tx', txResult.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline"
                >
                  Botchain Explorer <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

