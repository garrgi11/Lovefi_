import { ipfsService, NFTMetadata } from './ipfs';
import { contractService } from './contracts';
import { dbOperations, Profile } from './supabase';
import { ethers } from 'ethers';

export interface MintingProgress {
  step: 'uploading_images' | 'creating_metadata' | 'uploading_metadata' | 'minting_nft' | 'saving_to_db' | 'completed' | 'error';
  message: string;
  progress: number; // 0-100
  error?: string;
}

export interface MintingResult {
  success: boolean;
  tokenId?: number;
  transactionHash?: string;
  metadataURI?: string;
  profileId?: string;
  error?: string;
}

class NFTMintingService {
  /**
   * Complete NFT minting process (FAKE VERSION FOR DEMO)
   */
  async mintProfileNFT(
    userData: any,
    photos: File[],
    walletAddress: string,
    signer: ethers.Signer,
    onProgress?: (progress: MintingProgress) => void
  ): Promise<MintingResult> {
    try {
      // Step 1: Upload images to IPFS (fake)
      onProgress?.({
        step: 'uploading_images',
        message: 'Uploading photos to IPFS...',
        progress: 10
      });

      await this.delay(1000); // Simulate upload time
      const photoHashes = photos.map((_, index) => `QmFake${index}PhotoHash${Date.now()}`);
      
      onProgress?.({
        step: 'uploading_images',
        message: `Uploaded ${photoHashes.length} photos to IPFS`,
        progress: 30
      });

      await this.delay(800);

      // Step 2: Create NFT metadata (fake)
      onProgress?.({
        step: 'creating_metadata',
        message: 'Creating NFT metadata...',
        progress: 40
      });

      await this.delay(600);
      const fakeMetadata = {
        name: `${userData.firstName} ${userData.lastName}'s Profile`,
        description: 'LoveFi Dating Profile NFT',
        image: photoHashes[0],
        attributes: []
      };

      // Step 3: Upload metadata to IPFS (fake)
      onProgress?.({
        step: 'uploading_metadata',
        message: 'Uploading metadata to IPFS...',
        progress: 50
      });

      await this.delay(1200);
      const metadataHash = `QmFakeMetadataHash${Date.now()}`;
      const metadataURI = `https://ipfs.io/ipfs/${metadataHash}`;

      onProgress?.({
        step: 'uploading_metadata',
        message: 'Metadata uploaded to IPFS',
        progress: 60
      });

      await this.delay(500);

      // Step 4: Save to database (fake - skip database entirely)
      onProgress?.({
        step: 'saving_to_db',
        message: 'Saving profile to database...',
        progress: 70
      });

      await this.delay(800);
      // Skip actual database save for demo

      // Step 5: Mint NFT on blockchain (fake)
      onProgress?.({
        step: 'minting_nft',
        message: 'Minting NFT on blockchain...',
        progress: 80
      });

      await this.delay(2000); // Longer delay for "blockchain" interaction
      const fakeTokenId = Math.floor(Math.random() * 10000) + 1;
      const fakeTransactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      onProgress?.({
        step: 'minting_nft',
        message: 'NFT minted successfully!',
        progress: 90
      });

      await this.delay(500);

      // Step 6: Final completion
      onProgress?.({
        step: 'completed',
        message: 'Profile NFT created successfully!',
        progress: 100
      });

      await this.delay(800);

      return {
        success: true,
        tokenId: fakeTokenId,
        transactionHash: fakeTransactionHash,
        metadataURI,
        profileId: `fake-profile-${Date.now()}`
      };

    } catch (error) {
      console.error('Error in NFT minting process:', error);
      
      onProgress?.({
        step: 'error',
        message: 'Failed to mint profile NFT',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Helper method to simulate async delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Upload photos to IPFS
   */
  private async uploadPhotos(photos: File[]): Promise<string[]> {
    if (photos.length === 0) {
      return [];
    }

    // Check if IPFS is configured, otherwise use mock
    const isIPFSConfigured = !!import.meta.env.VITE_PINATA_JWT;
    
    if (isIPFSConfigured) {
      return await ipfsService.uploadImages(photos);
    } else {
      // Use mock uploads for development
      return await Promise.all(photos.map(photo => ipfsService.mockUpload(photo)));
    }
  }

  /**
   * Save profile data to Supabase database
   */
  private async saveProfileToDatabase(
    userData: any, 
    photoHashes: string[], 
    metadataURI: string, 
    walletAddress: string
  ): Promise<Profile> {
    // Parse location if it's a string
    let locationData = userData.location;
    if (typeof locationData === 'string') {
      try {
        locationData = JSON.parse(locationData);
      } catch {
        locationData = { address: locationData };
      }
    }

    const profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'> = {
      wallet_address: walletAddress,
      first_name: userData.firstName || '',
      last_name: userData.lastName || '',
      birthday: userData.birthday,
      gender: userData.gender,
      sexuality: userData.sexuality,
      location: locationData,
      radius: userData.radius || 50,
      personal_interests: userData.personalInterests || [],
      partner_preferences: userData.partnerPreferences?.map((pref: any) => 
        pref.options[pref.selected]
      ).filter(Boolean) || [],
      photo_ipfs_hashes: photoHashes,
      metadata_ipfs_uri: metadataURI,
      blockchain_network: 'flow-testnet',
      is_active: true,
      profile_complete: false // Will be set to true after successful minting
    };

    return await dbOperations.createProfile(profileData);
  }

  /**
   * Check if user already has a profile (FAKE VERSION FOR DEMO)
   */
  async hasExistingProfile(walletAddress: string): Promise<boolean> {
    // Always return false for demo - allows users to "mint" multiple times
    return false;
  }

  /**
   * Get existing profile data (FAKE VERSION FOR DEMO)
   */
  async getExistingProfile(walletAddress: string): Promise<Profile | null> {
    // Always return null for demo
    return null;
  }

  /**
   * Validate user data before minting
   */
  validateUserData(userData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!userData.firstName?.trim()) {
      errors.push('First name is required');
    }

    if (!userData.lastName?.trim()) {
      errors.push('Last name is required');
    }

    if (!userData.birthday) {
      errors.push('Birthday is required');
    }

    if (!userData.gender) {
      errors.push('Gender selection is required');
    }

    if (!userData.sexuality) {
      errors.push('Sexuality selection is required');
    }

    if (!userData.location) {
      errors.push('Location is required');
    }

    if (!userData.personalInterests || userData.personalInterests.length === 0) {
      errors.push('At least one personal interest is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Estimate gas costs for minting
   */
  async estimateGasCosts(
    userData: any,
    photoHashes: string[],
    metadataURI: string,
    signer: ethers.Signer
  ): Promise<{ gasEstimate: bigint; estimatedCostETH: string }> {
    try {
      const gasEstimate = await contractService.estimateMintGas(
        signer,
        userData,
        photoHashes,
        metadataURI
      );

      // Get current gas price
      const provider = signer.provider;
      if (!provider) {
        throw new Error('No provider available');
      }

      const gasPrice = await provider.getFeeData();
      const maxFeePerGas = gasPrice.maxFeePerGas || gasPrice.gasPrice || BigInt(0);
      
      const estimatedCost = gasEstimate * maxFeePerGas;
      const estimatedCostETH = ethers.formatEther(estimatedCost);

      return {
        gasEstimate,
        estimatedCostETH
      };
    } catch (error) {
      console.error('Error estimating gas costs:', error);
      throw error;
    }
  }
}

export const nftMintingService = new NFTMintingService();