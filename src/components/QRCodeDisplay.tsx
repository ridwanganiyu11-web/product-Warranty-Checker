'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  label?: string;
  showDownload?: boolean;
}

export function QRCodeDisplay({
  value,
  size = 160,
  label,
  showDownload = true,
}: QRCodeDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch((err) => console.error('QR generation failed:', err));
    return () => {
      active = false;
    };
  }, [value, size]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${label ? label.replace(/[^a-zA-Z0-9-_]/g, '_') : 'warrantchain-qr'}.png`;
    link.click();
  };

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div
        className="rounded-xl bg-white p-2.5 shadow-md border border-slate-200"
        style={{ width: size + 20, height: size + 20 }}
      >
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt={label || 'Warranty QR Code'}
            width={size}
            height={size}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full animate-pulse bg-slate-100 rounded-lg" />
        )}
      </div>
      {showDownload && dataUrl && (
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors print:hidden"
        >
          <Download className="w-3.5 h-3.5" />
          Download QR PNG
        </button>
      )}
    </div>
  );
}

