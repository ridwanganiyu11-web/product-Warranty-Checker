import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { INITIAL_BUSINESSES, INITIAL_WARRANTIES } from '@/lib/seed-data';
import { BusinessProfile, WarrantyRecord } from '@/lib/types';
import { hashSerial, normalizeSerial } from '@/config/web3';

interface DatabaseSchema {
  contractAddress: string;
  businesses: BusinessProfile[];
  warranties: WarrantyRecord[];
}

const DATA_DIR = process.env.VERCEL
  ? os.tmpdir()
  : path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'warrantchain-db.json');

let memoryDb: DatabaseSchema | null = null;

function readDb(): DatabaseSchema {
  if (memoryDb) return memoryDb;
  const fallback: DatabaseSchema = {
    contractAddress:
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
      '0x618fd1d309b185aB449E528cD8cCb8E7E1ea90CC',
    businesses: [...INITIAL_BUSINESSES],
    warranties: [...INITIAL_WARRANTIES],
  };
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(fallback, null, 2), 'utf8');
      memoryDb = fallback;
      return fallback;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    memoryDb = JSON.parse(raw) as DatabaseSchema;
    return memoryDb;
  } catch {
    memoryDb = fallback;
    return fallback;
  }
}

function writeDb(db: DatabaseSchema) {
  memoryDb = db;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  } catch {
    // Serverless read-only fallback handled via memoryDb
  }
}

export async function GET(req: NextRequest) {
  const db = readDb();
  const { searchParams } = new URL(req.url);
  const serial = searchParams.get('serial');
  const business = searchParams.get('business');

  if (serial) {
    const targetHash = hashSerial(serial);
    const normalized = normalizeSerial(serial);
    const found = db.warranties.find(
      (w) =>
        w.serialHash.toLowerCase() === targetHash.toLowerCase() ||
        w.serialNumber.toUpperCase() === normalized
    );
    return NextResponse.json({
      warranty: found || null,
      serialHash: targetHash,
      normalizedSerial: normalized,
    });
  }

  if (business) {
    const biz = db.businesses.find(
      (b) => b.wallet.toLowerCase() === business.toLowerCase()
    );
    const products = db.warranties.filter(
      (w) => w.businessWallet.toLowerCase() === business.toLowerCase()
    );
    return NextResponse.json({ business: biz || null, products });
  }

  return NextResponse.json(db);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = readDb();

    if (body.action === 'setContractAddress') {
      db.contractAddress = (body.contractAddress || '').trim();
      writeDb(db);
      return NextResponse.json({ ok: true, contractAddress: db.contractAddress });
    }

    if (body.action === 'registerBusiness') {
      const { wallet, name, category, location, website, txHash, onChain } = body;
      if (!wallet || !name) {
        return NextResponse.json(
          { error: 'Wallet address and business name are required' },
          { status: 400 }
        );
      }

      const nowSec = Math.floor(Date.now() / 1000);
      const existingIndex = db.businesses.findIndex(
        (b) => b.wallet.toLowerCase() === wallet.toLowerCase()
      );

      const profile: BusinessProfile = {
        wallet,
        name: name.trim(),
        category: (category || 'General Retail & Electronics').trim(),
        location: (location || 'Global').trim(),
        website: (website || '').trim(),
        registeredAt:
          existingIndex >= 0 ? db.businesses[existingIndex].registeredAt : nowSec,
        productCount:
          existingIndex >= 0 ? db.businesses[existingIndex].productCount : 0,
        txHash:
          txHash ||
          `0x${Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16)
          ).join('')}`,
        onChain: Boolean(onChain),
      };

      if (existingIndex >= 0) {
        db.businesses[existingIndex] = profile;
      } else {
        db.businesses.unshift(profile);
      }

      // Also update businessName in existing warranties for this business
      db.warranties = db.warranties.map((w) =>
        w.businessWallet.toLowerCase() === wallet.toLowerCase()
          ? { ...w, businessName: profile.name }
          : w
      );

      writeDb(db);
      return NextResponse.json({ ok: true, business: profile });
    }

    if (body.action === 'registerWarranty') {
      const {
        productName,
        serialNumber,
        category,
        durationMonths,
        businessWallet,
        businessName,
        txHash,
        onChain,
      } = body;

      if (!productName || !serialNumber || !businessWallet) {
        return NextResponse.json(
          { error: 'Product name, serial number, and business wallet are required' },
          { status: 400 }
        );
      }

      const normalized = normalizeSerial(serialNumber);
      const sHash = hashSerial(normalized);

      const exists = db.warranties.some(
        (w) => w.serialHash.toLowerCase() === sHash.toLowerCase()
      );
      if (exists) {
        return NextResponse.json(
          { error: `Serial number ${normalized} is already registered on WarrantChain.` },
          { status: 409 }
        );
      }

      const months = Number(durationMonths) || 12;
      const startSec = Math.floor(Date.now() / 1000);
      const durationSec =
        months === 12
          ? 365 * 86400
          : months === 24
            ? 730 * 86400
            : months * 30 * 86400;
      const expirySec = startSec + durationSec;

      const bizIndex = db.businesses.findIndex(
        (b) => b.wallet.toLowerCase() === businessWallet.toLowerCase()
      );
      const resolvedBizName =
        businessName ||
        (bizIndex >= 0 ? db.businesses[bizIndex].name : 'Verified Partner Store');

      if (bizIndex >= 0) {
        db.businesses[bizIndex].productCount += 1;
      } else {
        db.businesses.unshift({
          wallet: businessWallet,
          name: resolvedBizName,
          category: category || 'Electronics & Retail',
          location: 'On-Chain Merchant',
          website: '',
          registeredAt: startSec,
          productCount: 1,
          txHash: txHash || '',
          onChain: Boolean(onChain),
        });
      }

      const record: WarrantyRecord = {
        serialHash: sHash,
        productName: productName.trim(),
        serialNumber: normalized,
        category: (category || 'Electronics').trim(),
        businessWallet,
        businessName: resolvedBizName,
        startTimestamp: startSec,
        durationMonths: months,
        expiryTimestamp: expirySec,
        registeredAt: startSec,
        isRevoked: false,
        txHash:
          txHash ||
          `0x${Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16)
          ).join('')}`,
        onChain: Boolean(onChain),
      };

      db.warranties.unshift(record);
      writeDb(db);
      return NextResponse.json({ ok: true, warranty: record });
    }

    if (body.action === 'toggleRevoke') {
      const { serialHash, businessWallet } = body;
      const idx = db.warranties.findIndex(
        (w) => w.serialHash.toLowerCase() === (serialHash || '').toLowerCase()
      );
      if (idx < 0) {
        return NextResponse.json({ error: 'Warranty not found' }, { status: 404 });
      }
      if (
        db.warranties[idx].businessWallet.toLowerCase() !==
        (businessWallet || '').toLowerCase()
      ) {
        return NextResponse.json(
          { error: 'Only the registering business can update this warranty' },
          { status: 403 }
        );
      }
      db.warranties[idx].isRevoked = !db.warranties[idx].isRevoked;
      writeDb(db);
      return NextResponse.json({ ok: true, warranty: db.warranties[idx] });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

