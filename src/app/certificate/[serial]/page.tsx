'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  ShieldCheck,
  Printer,
  Download,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Building2,
} from 'lucide-react';
import { useWarrantChain } from '@/context/WarrantChainContext';
import { WarrantyRecord } from '@/lib/types';
import { BOTCHAIN_CHAIN_ID, getExplorerUrl } from '@/config/web3';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';

function formatHumanDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function WarrantyCertificatePage() {
  const params = useParams<{ serial: string }>();
  const serialParam = decodeURIComponent(params.serial || 'HP-2026-00125');

  const { verifyWarrantyBySerial } = useWarrantChain();
  const [warranty, setWarranty] = useState<WarrantyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const loadRecord = useCallback(async () => {
    setLoading(true);
    try {
      const res = await verifyWarrantyBySerial(serialParam);
      setWarranty(res.warranty);
    } finally {
      setLoading(false);
    }
  }, [serialParam, verifyWarrantyBySerial]);

  useEffect(() => {
    loadRecord();
  }, [loadRecord]);

  const nowSec = Math.floor(Date.now() / 1000);
  const isActive =
    warranty && !warranty.isRevoked && warranty.expiryTimestamp >= nowSec;

  const verifyUrl =
    typeof window !== 'undefined' && warranty
      ? `${window.location.origin}/verify?serial=${encodeURIComponent(
          warranty.serialNumber
        )}`
      : `https://warrantchain.app/verify?serial=${encodeURIComponent(
          warranty?.serialNumber || serialParam
        )}`;

  // Generate a high-resolution Certificate PNG directly in the browser using HTML5 Canvas
  const handleDownloadCertificatePng = async () => {
    if (!warranty) return;
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 820;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background
      const grad = ctx.createLinearGradient(0, 0, 1200, 820);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(1, '#111827');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 820);

      // Decorative double border
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 4;
      ctx.strokeRect(32, 32, 1136, 756);

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(44, 44, 1112, 732);

      // Header Title
      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(
        'WARRANTCHAIN · REGISTER IT. PROTECT IT. VERIFY IT.',
        80,
        105
      );

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px sans-serif';
      ctx.fillText('DIGITAL WARRANTY CERTIFICATE', 80, 160);

      ctx.fillStyle = isActive ? '#34d399' : '#f87171';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(
        isActive ? '● VERIFIED ACTIVE WARRANTY' : '● EXPIRED WARRANTY RECORD',
        80,
        200
      );

      // Divider
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 225);
      ctx.lineTo(1120, 225);
      ctx.stroke();

      // Product & Business Details
      const drawField = (
        label: string,
        val: string,
        x: number,
        y: number,
        mono = false
      ) => {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 15px sans-serif';
        ctx.fillText(label.toUpperCase(), x, y);

        ctx.fillStyle = '#f8fafc';
        ctx.font = mono ? 'bold 24px monospace' : 'bold 26px sans-serif';
        ctx.fillText(val, x, y + 34);
      };

      drawField('Product Name', warranty.productName, 80, 280);
      drawField('Product Serial Number', warranty.serialNumber, 500, 280, true);

      drawField('Registered By (Business)', warranty.businessName, 80, 385);
      drawField(
        'Warranty Duration',
        `${warranty.durationMonths} Months`,
        500,
        385
      );

      drawField(
        'Start / Registration Date',
        formatHumanDate(warranty.startTimestamp),
        80,
        490
      );
      drawField(
        'Warranty Expiry Date',
        formatHumanDate(warranty.expiryTimestamp),
        500,
        490
      );

      // QR Code on Right
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 240,
        margin: 2,
      });
      const qrImg = new Image();
      await new Promise<void>((resolve) => {
        qrImg.onload = () => resolve();
        qrImg.src = qrDataUrl;
      });

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(850, 260, 250, 250);
      ctx.drawImage(qrImg, 855, 265, 240, 240);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.fillText('Scan to verify on Botchain', 890, 535);

      // Footer Blockchain Proof
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(80, 600);
      ctx.lineTo(1120, 600);
      ctx.stroke();

      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(
        `BOTCHAIN TESTNET (CHAIN ID ${BOTCHAIN_CHAIN_ID}) CRYPTOGRAPHIC PROOF`,
        80,
        635
      );

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '14px monospace';
      ctx.fillText(`Merchant Wallet:  ${warranty.businessWallet}`, 80, 668);
      ctx.fillText(`Serial Hash:      ${warranty.serialHash}`, 80, 696);
      ctx.fillText(`Tx Reference:     ${warranty.txHash}`, 80, 724);

      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `WarrantChain-Certificate-${warranty.serialNumber}.png`;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-400">
        Generating Digital Warranty Certificate...
      </div>
    );
  }

  if (!warranty) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-white">
          Warranty Certificate Not Found
        </h1>
        <p className="text-sm text-slate-400">
          No warranty record found for serial <code className="font-mono text-rose-300">{serialParam}</code>.
        </p>
        <Link
          href="/verify"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white"
        >
          Go to Warranty Lookup
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href={`/verify?serial=${encodeURIComponent(warranty.serialNumber)}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Verification Page
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadCertificatePng}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-emerald-500 transition-all"
          >
            <Download className="h-4 w-4" />
            {downloading ? 'Rendering PNG...' : 'Download Certificate Image (PNG)'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:text-white transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Certificate Frame */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-indigo-500/50 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-2 shadow-2xl print:border-slate-800 print:shadow-none">
        <div className="rounded-2xl border border-emerald-500/30 p-6 sm:p-10 space-y-8">
          {/* Certificate Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 shadow-lg">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                  WarrantChain · Register It. Protect It. Verify It.
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Digital Warranty Certificate
                </h1>
              </div>
            </div>

            <div
              className={`inline-flex items-center gap-2 self-start sm:self-center rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {isActive ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Warranty is Active
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-rose-400" />
                  Warranty Expired
                </>
              )}
            </div>
          </div>

          {/* Main Certificate Body + QR */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Product Name
                </div>
                <div className="mt-1 text-xl font-extrabold text-white">
                  {warranty.productName}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {warranty.category}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Product Serial Number
                </div>
                <div className="mt-1 font-mono text-xl font-extrabold text-indigo-300">
                  {warranty.serialNumber}
                </div>
                <div className="text-[11px] text-emerald-400 mt-0.5">
                  Normalized &amp; keccak256 Verified
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Registered By (Business)
                </div>
                <div className="mt-1 text-lg font-bold text-white flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-indigo-400" />
                  {warranty.businessName}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Warranty Duration
                </div>
                <div className="mt-1 text-lg font-bold text-white">
                  {warranty.durationMonths} months
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Start / Registration Date
                </div>
                <div className="mt-1 text-base font-bold text-white">
                  {formatHumanDate(warranty.startTimestamp)}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Warranty Expiry Date
                </div>
                <div
                  className={`mt-1 text-base font-bold ${
                    isActive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatHumanDate(warranty.expiryTimestamp)}
                </div>
              </div>
            </div>

            {/* Embedded QR Code */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/80 p-5 text-center space-y-2">
              <QRCodeDisplay
                value={verifyUrl}
                size={155}
                label={`Certificate-QR-${warranty.serialNumber}`}
                showDownload={false}
              />
              <span className="text-[11px] font-medium text-slate-300">
                Scan to Verify on Botchain
              </span>
            </div>
          </div>

          {/* Blockchain Transaction Reference Footer */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-indigo-300 font-semibold">
              <span>
                Botchain Testnet (Chain ID {BOTCHAIN_CHAIN_ID}) Transaction Reference
              </span>
              <a
                href={getExplorerUrl('tx', warranty.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:underline print:hidden"
              >
                Verify on scan.bohr.life <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="grid grid-cols-1 gap-1.5 font-mono text-[11px] text-slate-400 pt-1">
              <div className="break-all">
                <span className="text-slate-500">Issuing Business Wallet: </span>
                {warranty.businessWallet}
              </div>
              <div className="break-all">
                <span className="text-slate-500">Serial Hash (keccak256): </span>
                {warranty.serialHash}
              </div>
              <div className="break-all">
                <span className="text-slate-500">Blockchain Tx Reference: </span>
                {warranty.txHash}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

