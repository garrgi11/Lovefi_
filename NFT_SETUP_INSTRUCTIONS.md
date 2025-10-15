# LoveFi Profile NFT Implementation

## Overview
The Profile NFT system allows users to mint their dating profile as a soulbound NFT when they click "Start Matching". The NFT contains all collected user data and photos as metadata stored on IPFS.

## Features Implemented

### 1. Smart Contract (`contracts/ProfileNFT.sol`)
- **Soulbound NFT**: Cannot be transferred (only minted and burned)
- **Comprehensive Data Storage**: Stores firstName, lastName, birthday, gender, sexuality, location, interests, etc.
- **IPFS Integration**: Stores photo hashes and metadata URI
- **Events**: Emits ProfileMinted events for tracking

### 2. Database Schema (`database/supabase-schema.sql`)
- **profiles**: Main table for user profiles and NFT data
- **photo_uploads**: Individual photo tracking with IPFS hashes
- **nft_mint_queue**: Queue system for processing mints
- **profile_audit**: Audit trail for all profile changes
- **RLS Policies**: Row-level security for data protection

### 3. IPFS Integration (`client/lib/ipfs.ts`)
- **Image Upload**: Upload photos to Pinata IPFS
- **Metadata Creation**: Generate NFT-compliant metadata
- **Mock Mode**: Development mode when IPFS not configured

### 4. Smart Contract Integration (`client/lib/contracts.ts`)
- **Dynamic Labs Integration**: Works with user's connected wallet
- **Contract Interaction**: Mint, update, and query profile NFTs
- **Gas Estimation**: Calculate transaction costs
- **Error Handling**: Comprehensive error management

### 5. NFT Minting Service (`client/lib/nftMinting.ts`)
- **Complete Flow**: Orchestrates the entire minting process
- **Progress Tracking**: Real-time progress updates
- **Validation**: Ensures all required data is present
- **Database Integration**: Saves to Supabase alongside blockchain

### 6. UI Integration (`client/components/PhotoUpload.tsx`)
- **Progress UI**: Shows minting progress with loading states
- **Error Handling**: User-friendly error messages
- **Validation**: Checks all requirements before minting
- **Success States**: Redirects to matching after successful mint

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# IPFS (Pinata)
VITE_PINATA_JWT=your_pinata_jwt_token

# Blockchain
VITE_ETHEREUM_RPC_URL=your_ethereum_rpc_url
VITE_PROFILE_NFT_CONTRACT_ADDRESS=deployed_contract_address
```

### 2. Database Setup
1. Create a new Supabase project
2. Run the SQL schema from `database/supabase-schema.sql`
3. Configure RLS policies as needed

### 3. Smart Contract Deployment
1. Install Hardhat or Foundry
2. Deploy `contracts/ProfileNFT.sol` to your chosen network
3. Update `VITE_PROFILE_NFT_CONTRACT_ADDRESS` with deployed address

### 4. IPFS Setup (Pinata)
1. Create account at [Pinata](https://pinata.cloud)
2. Generate API keys and JWT token
3. Update environment variables

### 5. Install Dependencies
```bash
npm install @supabase/supabase-js ethers
```

## User Flow

1. **Profile Creation**: User fills out all profile steps (name, gender, location, interests, etc.)
2. **Photo Upload**: User uploads photos on final step
3. **Start Matching**: User clicks "Start matching!" button
4. **Validation**: System validates all required data is present
5. **IPFS Upload**: Photos uploaded to IPFS, metadata created
6. **NFT Minting**: Smart contract mints soulbound NFT with metadata
7. **Database Save**: Profile data saved to Supabase with NFT details
8. **Navigation**: User redirected to matching page

## Progress Tracking

The minting process shows real-time progress:
- **10%**: Starting upload
- **30%**: Photos uploaded to IPFS
- **50%**: Metadata uploaded to IPFS
- **70%**: Profile saved to database
- **90%**: NFT minted on blockchain
- **100%**: Complete!

## Error Handling

- **Wallet Not Connected**: Prompts user to connect wallet
- **Incomplete Profile**: Shows missing required fields
- **Existing Profile**: Prevents duplicate minting
- **No Photos**: Requires at least one photo
- **Blockchain Errors**: Shows transaction failure details
- **IPFS Errors**: Falls back to mock mode in development

## Development Mode

When IPFS is not configured, the system automatically uses mock uploads for development testing.

## Security Features

- **Soulbound**: NFTs cannot be transferred
- **Row Level Security**: Database access controlled by wallet address
- **Validation**: All data validated before minting
- **Audit Trail**: All changes logged in database

## Testing

The system is designed to work in development mode with mock data when external services are not configured. This allows testing of the complete flow without requiring blockchain or IPFS setup.