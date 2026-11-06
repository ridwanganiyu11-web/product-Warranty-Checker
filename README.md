# WarrantChain — Product Warranty Checker

> **Register It. Protect It. Verify It.**  
> A Web3 product warranty registration and verification platform built on the **Botchain Testnet (Chain ID: 968)**.

WarrantChain replaces easily lost paper warranty cards with permanent, tamper-evident blockchain warranty records and instant QR code verification. Businesses connect their Web3 wallet to register warranties on-chain, while customers can verify any product's warranty coverage for free—no wallet or gas required.

---

## 🌐 Live Botchain Testnet Deployment

- **Network Name:** Botchain Testnet
- **Chain ID:** `968`
- **RPC Endpoint:** `https://rpc.bohr.life`
- **Native Token:** `BOT` (Total Supply: 150,000,000 BOT)
- **Block Explorer:** [https://scan.bohr.life/](https://scan.bohr.life/)
- **Deployed `ProductWarrantyRegistry` Contract:** [`0x618fd1d309b185aB449E528cD8cCb8E7E1ea90CC`](https://scan.bohr.life/address/0x618fd1d309b185aB449E528cD8cCb8E7E1ea90CC)

---

## ✨ Core Features

### For Businesses (Wallet Connected on Botchain 968)
- **Register Business Profile (`/register-business`)**: Create or update an on-chain merchant profile linked to your wallet.
- **Register Product Warranties (`/register-warranty`)**: Enter product name, serial number, category, and warranty duration (6, 12, 18, 24, 36, or 60 months). Serial numbers are normalized and indexed on-chain using `keccak256`.
- **Business Dashboard (`/dashboard`)**: Track registered products, active warranties, expired warranties, and recent registrations.
- **My Products (`/my-products`)**: Filter and manage registered warranties, generate QR codes, and issue revocations/restorations if needed.
- **Digital Warranty Certificates (`/certificate/[serial]`)**: Generate downloadable high-resolution PNG and print-ready PDF certificates in the browser—no external paid APIs required.

### For Customers (No Wallet or Gas Required)
- **Public Warranty Verification (`/verify`)**: Search by serial number (e.g., `HP-2026-00125` or `TV-2026-00412`) or scan a product QR code.
- **Instant Coverage Status**: See whether a warranty is **Active** or **Expired**, view registration and expiration dates, and inspect the Botchain cryptographic proof.
- **Public Business Profile (`/business/[wallet]`)**: Verify which registered business issued the warranty and browse their registered products.

---

## 📜 Smart Contract (`contracts/ProductWarrantyRegistry.sol`)

| Function | Purpose | Wallet Required? | Gas (`BOT`)? |
| :--- | :--- | :---: | :---: |
| `registerBusiness(...)` | Register or update a business profile | Yes | Yes |
| `registerWarranty(...)` | Register a product warranty indexed by `keccak256(serial)` | Yes | Yes |
| `getWarranty(bytes32)` | Retrieve full warranty struct by serial hash | No | No |
| `verifyWarranty(bytes32)` | Verify if a warranty exists and is currently active | No | No |
| `getBusinessProducts(address)` | List all warranties registered by a business | No | No |
| `getWarrantyCount()` | Count total registered warranties | No | No |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and add your Reown Project ID and Botchain Testnet deployer private key:
```bash
cp .env.example .env
```

### 3. Compile & Deploy Smart Contract (Optional)
A live contract is already deployed at `0x618fd1d309b185aB449E528cD8cCb8E7E1ea90CC`. To compile and deploy your own instance:
```bash
npm run compile:contract
npm run deploy:botchain
```

### 4. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
