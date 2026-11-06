const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

// Load .env file into process.env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

/**
 * Deploy ProductWarrantyRegistry.sol to Botchain Testnet (Chain ID: 968)
 * RPC: https://rpc.bohr.life
 * Explorer: https://scan.bohr.life/
 */
async function main() {
  const rpcUrl = process.env.NEXT_PUBLIC_BOTCHAIN_RPC_URL || 'https://rpc.bohr.life';
  let privateKey = (process.env.PRIVATE_KEY || '').trim();

  if (!privateKey) {
    console.error('Error: Please add your PRIVATE_KEY to the .env file before running deploy:botchain.');
    process.exit(1);
  }
  if (!privateKey.startsWith('0x')) {
    privateKey = '0x' + privateKey;
  }

  const solc = require('solc');
  const contractPath = path.resolve(__dirname, '../contracts/ProductWarrantyRegistry.sol');
  const source = fs.readFileSync(contractPath, 'utf8');
  const input = {
    language: 'Solidity',
    sources: { 'ProductWarrantyRegistry.sol': { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } },
    },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const compiled = output.contracts['ProductWarrantyRegistry.sol']['ProductWarrantyRegistry'];

  const provider = new ethers.JsonRpcProvider(rpcUrl, {
    name: 'Botchain Testnet',
    chainId: 968,
  });
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(`Deploying ProductWarrantyRegistry with account: ${wallet.address}`);
  console.log(`Network: Botchain Testnet (Chain ID: 968, RPC: ${rpcUrl})`);

  const factory = new ethers.ContractFactory(compiled.abi, '0x' + compiled.evm.bytecode.object, wallet);
  const contract = await factory.deploy();
  console.log('Waiting for deployment transaction confirmation...');
  await contract.waitForDeployment();

  const deployedAddress = await contract.getAddress();
  console.log(`✅ ProductWarrantyRegistry deployed to: ${deployedAddress}`);
  console.log(`🔎 View on Explorer: https://scan.bohr.life/address/${deployedAddress}`);

  // Auto-save deployed address into .env
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('NEXT_PUBLIC_CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
        `NEXT_PUBLIC_CONTRACT_ADDRESS=${deployedAddress}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS=${deployedAddress}\n`;
    }
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log(`📝 Automatically updated NEXT_PUBLIC_CONTRACT_ADDRESS in .env`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
