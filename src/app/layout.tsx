import type { Metadata } from 'next';
import './globals.css';
import { WarrantChainProvider } from '@/context/WarrantChainContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'WarrantChain — Register It. Protect It. Verify It.',
  description:
    'Web3 Product Warranty Verification & Registry on Botchain Testnet (Chain ID 968). Replace paper warranty cards with verifiable blockchain records and QR codes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <WarrantChainProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </WarrantChainProvider>
      </body>
    </html>
  );
}

