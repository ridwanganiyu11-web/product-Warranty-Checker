'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ExternalLink, Cpu, Lock } from 'lucide-react';
import {
  BOTCHAIN_CHAIN_ID,
  BOTCHAIN_EXPLORER_URL,
  BOTCHAIN_RPC_URL,
  BOTCHAIN_TOKEN_SYMBOL,
  BOTCHAIN_TOTAL_SUPPLY,
} from '@/config/web3';

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 print:hidden">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Warrant<span className="text-indigo-400">Chain</span>
              </span>
            </div>
            <p className="text-sm font-medium text-indigo-300">
              Register It. Protect It. Verify It.
            </p>
            <p className="text-xs leading-relaxed text-slate-400 max-w-md">
              A decentralized Web3 product warranty registry on the Botchain blockchain.
              Replaces easily lost paper warranty cards with tamper-evident on-chain records
              and instant QR verification—no customer wallet required.
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-[11px] text-slate-300">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>
                Serial numbers normalized &amp; indexed with <code className="text-indigo-300">keccak256</code>
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Platform Pages
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/verify" className="hover:text-white transition-colors">
                  Public Warranty Verification
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Business Dashboard
                </Link>
              </li>
              <li>
                <Link href="/register-warranty" className="hover:text-white transition-colors">
                  Register Product Warranty
                </Link>
              </li>
              <li>
                <Link href="/register-business" className="hover:text-white transition-colors">
                  Register Business Profile
                </Link>
              </li>
              <li>
                <Link href="/my-products" className="hover:text-white transition-colors">
                  My Registered Products
                </Link>
              </li>
              <li>
                <Link
                  href="/certificate/HP-2026-00125"
                  className="hover:text-white transition-colors"
                >
                  Sample Digital Certificate
                </Link>
              </li>
            </ul>
          </div>

          {/* Botchain Network Specs */}
          <div className="space-y-2.5">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-200">
              <Cpu className="h-3.5 w-3.5 text-emerald-400" />
              Botchain Testnet Specs
            </h4>
            <dl className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-slate-500">Chain ID:</dt>
                <dd className="font-mono text-slate-200">{BOTCHAIN_CHAIN_ID}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Native Token:</dt>
                <dd className="font-mono text-emerald-400">{BOTCHAIN_TOKEN_SYMBOL}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Total Supply:</dt>
                <dd className="font-mono text-slate-300">{BOTCHAIN_TOTAL_SUPPLY}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">RPC Endpoint:</dt>
                <dd className="font-mono text-slate-300 truncate max-w-[155px]">
                  {BOTCHAIN_RPC_URL}
                </dd>
              </div>
              <div className="pt-1">
                <a
                  href={BOTCHAIN_EXPLORER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Explorer: scan.bohr.life
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} WarrantChain · Powered by ProductWarrantyRegistry.sol on Botchain Testnet</p>
          <p>
            Note: On-chain registration proves the submitting wallet recorded the warranty; verify seller identity via Business Profile.
          </p>
        </div>
      </div>
    </footer>
  );
}

