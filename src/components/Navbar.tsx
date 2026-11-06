'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Search,
  LayoutDashboard,
  PlusCircle,
  Building2,
  PackageCheck,
  Wallet,
  AlertTriangle,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useWarrantChain } from '@/context/WarrantChainContext';
import { BOTCHAIN_EXPLORER_URL } from '@/config/web3';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: ShieldCheck },
  { href: '/verify', label: 'Verify Warranty', icon: Search },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/register-warranty', label: 'Register Warranty', icon: PlusCircle },
  { href: '/my-products', label: 'My Products', icon: PackageCheck },
  { href: '/register-business', label: 'Register Business', icon: Building2 },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const {
    address,
    isConnected,
    isDemoWallet,
    isBotchainNetwork,
    currentBusiness,
    openConnectModal,
    switchToBotchain,
    enableDemoWallet,
    disconnectWallet,
  } = useWarrantChain();

  const shortAddr = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-emerald-500 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">
                Warrant<span className="text-indigo-400">Chain</span>
              </span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                Botchain 968
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Register It. Protect It. Verify It.
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Wallet & Network Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <a
            href={BOTCHAIN_EXPLORER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
            title="Botchain Testnet Explorer (Chain ID 968)"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>BOT · 968</span>
            <ExternalLink className="h-3 w-3 text-slate-500" />
          </a>

          {isConnected ? (
            <div className="flex items-center gap-2">
              {!isBotchainNetwork && !isDemoWallet && (
                <button
                  type="button"
                  onClick={switchToBotchain}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 transition-colors"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Switch to Botchain (968)
                </button>
              )}

              <button
                type="button"
                onClick={openConnectModal}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:border-indigo-400 transition-colors"
              >
                <Wallet className="h-3.5 w-3.5 text-indigo-400" />
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span>{shortAddr}</span>
                    {isDemoWallet && (
                      <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[10px] text-amber-300">
                        Demo
                      </span>
                    )}
                  </div>
                  {currentBusiness && (
                    <div className="text-[10px] font-normal text-emerald-400 truncate max-w-[120px]">
                      {currentBusiness.name}
                    </div>
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={disconnectWallet}
                title="Disconnect Wallet"
                className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:border-rose-500/40 hover:text-rose-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => enableDemoWallet()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-300 hover:border-indigo-500/40 hover:text-white transition-colors"
                title="Instant Demo Merchant Login (ABC Electronics)"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Demo Merchant
              </button>
              <button
                type="button"
                onClick={openConnectModal}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-indigo-400 transition-all"
              >
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex lg:hidden items-center justify-center rounded-lg border border-slate-800 p-2 text-slate-300 hover:bg-slate-900"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-3">
          <div className="grid grid-cols-2 gap-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium ${
                    active
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            {isConnected ? (
              <div className="flex items-center justify-between w-full">
                <div className="text-xs text-slate-300">
                  Connected: <span className="font-mono text-white">{shortAddr}</span>
                  {currentBusiness && (
                    <span className="ml-2 text-emerald-400">({currentBusiness.name})</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={disconnectWallet}
                  className="text-xs text-rose-400 font-medium"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex w-full gap-2">
                <button
                  type="button"
                  onClick={() => {
                    enableDemoWallet();
                    setMobileOpen(false);
                  }}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-900 py-2 text-xs font-medium text-slate-200"
                >
                  Demo Merchant
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openConnectModal();
                    setMobileOpen(false);
                  }}
                  className="flex-1 rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white"
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

