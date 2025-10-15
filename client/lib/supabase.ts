import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface Profile {
  id: string;
  wallet_address: string;
  nft_token_id?: number;
  nft_contract_address?: string;
  first_name: string;
  last_name: string;
  birthday?: string;
  gender?: string;
  sexuality?: string;
  location?: any; // JSON object
  radius?: number;
  personal_interests?: string[];
  partner_preferences?: string[];
  photo_ipfs_hashes?: string[];
  metadata_ipfs_uri?: string;
  blockchain_network?: string;
  mint_transaction_hash?: string;
  minted_at?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  profile_complete?: boolean;
}

export interface PhotoUpload {
  id: string;
  profile_id: string;
  ipfs_hash: string;
  original_filename?: string;
  file_size?: number;
  mime_type?: string;
  upload_order?: number;
  created_at?: string;
}

export interface NFTMintQueue {
  id: string;
  profile_id: string;
  wallet_address: string;
  metadata_ipfs_uri: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transaction_hash?: string;
  error_message?: string;
  retry_count?: number;
  created_at?: string;
  processed_at?: string;
  completed_at?: string;
}

// Database operations
export const dbOperations = {
  // Profile operations
  async getProfile(walletAddress: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      if (error.code === 'PGRST205') {
        // Table doesn't exist
        console.error('Profiles table does not exist. Please run the database schema first.');
        throw new Error('Database not initialized. Please contact support.');
      }
      console.error('Error fetching profile:', error);
      throw error;
    }

    return data;
  },

  async createProfile(profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST205') {
        // Table doesn't exist
        console.error('Profiles table does not exist. Please run the database schema first.');
        throw new Error('Database not initialized. Please contact support.');
      }
      console.error('Error creating profile:', error);
      throw error;
    }

    return data;
  },

  async updateProfile(walletAddress: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('wallet_address', walletAddress)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return data;
  },

  // Photo operations
  async savePhotoUpload(photoData: Omit<PhotoUpload, 'id' | 'created_at'>): Promise<PhotoUpload> {
    const { data, error } = await supabase
      .from('photo_uploads')
      .insert(photoData)
      .select()
      .single();

    if (error) {
      console.error('Error saving photo upload:', error);
      throw error;
    }

    return data;
  },

  async getProfilePhotos(profileId: string): Promise<PhotoUpload[]> {
    const { data, error } = await supabase
      .from('photo_uploads')
      .select('*')
      .eq('profile_id', profileId)
      .order('upload_order', { ascending: true });

    if (error) {
      console.error('Error fetching photos:', error);
      throw error;
    }

    return data || [];
  },

  // NFT mint queue operations
  async addToMintQueue(queueData: Omit<NFTMintQueue, 'id' | 'created_at'>): Promise<NFTMintQueue> {
    const { data, error } = await supabase
      .from('nft_mint_queue')
      .insert(queueData)
      .select()
      .single();

    if (error) {
      console.error('Error adding to mint queue:', error);
      throw error;
    }

    return data;
  },

  async updateMintStatus(id: string, updates: Partial<NFTMintQueue>): Promise<NFTMintQueue> {
    const { data, error } = await supabase
      .from('nft_mint_queue')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating mint status:', error);
      throw error;
    }

    return data;
  },

  async getMintStatus(walletAddress: string): Promise<NFTMintQueue | null> {
    const { data, error } = await supabase
      .from('nft_mint_queue')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching mint status:', error);
      throw error;
    }

    return data;
  }
};