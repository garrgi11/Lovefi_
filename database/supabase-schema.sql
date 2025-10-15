-- Supabase database schema for LoveFi Profile NFTs

-- Create profiles table to track user profiles and NFTs
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT NOT NULL UNIQUE,
    nft_token_id BIGINT UNIQUE,
    nft_contract_address TEXT,
    
    -- User profile data
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birthday DATE,
    gender TEXT,
    sexuality TEXT,
    location JSONB, -- Store location as JSON with address components
    radius INTEGER DEFAULT 50,
    
    -- Interests and preferences
    personal_interests TEXT[],
    partner_preferences TEXT[],
    
    -- Photos and metadata
    photo_ipfs_hashes TEXT[],
    metadata_ipfs_uri TEXT,
    
    -- Blockchain data
    blockchain_network TEXT DEFAULT 'ethereum',
    mint_transaction_hash TEXT,
    minted_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    profile_complete BOOLEAN DEFAULT false
);

-- Create index on wallet_address for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_profiles_nft_token_id ON profiles(nft_token_id);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Create photo_uploads table to track individual photo uploads
CREATE TABLE IF NOT EXISTS photo_uploads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    ipfs_hash TEXT NOT NULL,
    original_filename TEXT,
    file_size BIGINT,
    mime_type TEXT,
    upload_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(profile_id, ipfs_hash)
);

-- Create nft_mint_queue table to track pending mints
CREATE TABLE IF NOT EXISTS nft_mint_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    metadata_ipfs_uri TEXT NOT NULL,
    
    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    transaction_hash TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for mint queue processing
CREATE INDEX IF NOT EXISTS idx_nft_mint_queue_status ON nft_mint_queue(status, created_at);

-- Create audit table for profile changes
CREATE TABLE IF NOT EXISTS profile_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    action TEXT NOT NULL, -- 'created', 'updated', 'nft_minted', etc.
    changes JSONB, -- Store what changed
    transaction_hash TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_mint_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_audit ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile data
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Policy: Photo uploads follow profile ownership
CREATE POLICY "Users can manage own photos" ON photo_uploads
    FOR ALL USING (
        profile_id IN (
            SELECT id FROM profiles 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

-- Policy: Mint queue access
CREATE POLICY "Users can view own mint queue" ON nft_mint_queue
    FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Policy: Profile audit read access
CREATE POLICY "Users can view own audit logs" ON profile_audit
    FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Create a view for easy profile data retrieval with photos
CREATE OR REPLACE VIEW profile_with_photos AS
SELECT 
    p.*,
    COALESCE(
        array_agg(ph.ipfs_hash ORDER BY ph.upload_order, ph.created_at) 
        FILTER (WHERE ph.ipfs_hash IS NOT NULL), 
        '{}'::text[]
    ) as photo_hashes,
    COUNT(ph.id) as photo_count
FROM profiles p
LEFT JOIN photo_uploads ph ON p.id = ph.profile_id
GROUP BY p.id;