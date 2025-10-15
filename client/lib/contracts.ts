import { ethers } from 'ethers';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

// ProfileNFT contract ABI (simplified for the functions we need)
const PROFILE_NFT_ABI = [
  "function mintProfile(address user, string firstName, string lastName, string birthday, string gender, string sexuality, string location, uint256 radius, string[] personalInterests, string[] partnerPreferences, string[] photoHashes, string metadataURI) returns (uint256)",
  "function updateProfile(string location, uint256 radius, string[] personalInterests, string[] partnerPreferences, string[] photoHashes, string metadataURI)",
  "function hasProfile(address user) view returns (bool)",
  "function getProfile(address user) view returns (tuple(string firstName, string lastName, string birthday, string gender, string sexuality, string location, uint256 radius, string[] personalInterests, string[] partnerPreferences, string[] photoHashes, string metadataURI, uint256 createdAt, bool isActive))",
  "function getUserProfileTokenId(address user) view returns (uint256)",
  "function getTotalProfiles() view returns (uint256)",
  "event ProfileMinted(address indexed user, uint256 tokenId, string firstName, string lastName)"
];

interface ContractConfig {
  address: string;
  network: string;
  rpcUrl: string;
}

class ContractService {
  private contractAddress: string;
  private networkConfig: ContractConfig;

  constructor() {
    this.contractAddress = import.meta.env.VITE_PROFILE_NFT_CONTRACT_ADDRESS || '0x34d89a5471251ab8925cAa95eEd901335e7E93D7';
    this.networkConfig = {
      address: this.contractAddress,
      network: 'flow-testnet',
      rpcUrl: import.meta.env.VITE_FLOW_RPC_URL || 'https://testnet.evm.nodes.onflow.org'
    };
  }

  /**
   * Get contract instance using user's wallet
   */
  async getContract(signer: ethers.Signer) {
    if (!this.contractAddress) {
      throw new Error('Contract address not configured');
    }

    return new ethers.Contract(this.contractAddress, PROFILE_NFT_ABI, signer);
  }

  /**
   * Get contract instance for reading (using RPC provider)
   */
  async getReadOnlyContract() {
    if (!this.networkConfig.rpcUrl) {
      throw new Error('RPC URL not configured');
    }

    try {
      // Use ethers v6 JsonRpcProvider with Flow testnet configuration
      const provider = new ethers.JsonRpcProvider(this.networkConfig.rpcUrl, {
        name: 'flow-testnet',
        chainId: 545
      });
      
      // Test the connection
      await provider.getNetwork();
      
      return new ethers.Contract(this.contractAddress, PROFILE_NFT_ABI, provider);
    } catch (error) {
      console.error('Failed to connect to Flow testnet:', error);
      throw new Error('Unable to connect to blockchain network');
    }
  }

  /**
   * Check if user has a profile NFT
   */
  async hasProfile(userAddress: string): Promise<boolean> {
    try {
      const contract = await this.getReadOnlyContract();
      return await contract.hasProfile(userAddress);
    } catch (error) {
      console.error('Error checking if user has profile:', error);
      return false;
    }
  }

  /**
   * Get user's profile token ID
   */
  async getUserProfileTokenId(userAddress: string): Promise<number> {
    try {
      const contract = await this.getReadOnlyContract();
      const tokenId = await contract.getUserProfileTokenId(userAddress);
      return tokenId.toNumber();
    } catch (error) {
      console.error('Error getting user profile token ID:', error);
      return 0;
    }
  }

  /**
   * Mint a new profile NFT
   */
  async mintProfile(
    signer: ethers.Signer,
    userData: any,
    photoHashes: string[],
    metadataURI: string
  ): Promise<{ tokenId: number; transactionHash: string }> {
    try {
      const contract = await this.getContract(signer);
      const userAddress = await signer.getAddress();

      // Validate required fields
      if (!userData.firstName || !userData.lastName) {
        throw new Error('First name and last name are required');
      }

      // Check if user already has a profile
      const hasExistingProfile = await this.hasProfile(userAddress);
      if (hasExistingProfile) {
        throw new Error('User already has a profile NFT');
      }

      // Prepare contract parameters
      const partnerPreferences = userData.partnerPreferences?.map((pref: any) => 
        pref.options[pref.selected]
      ).filter(Boolean) || [];

      // Estimate gas before sending transaction
      console.log('Estimating gas for profile minting...');
      const gasEstimate = await this.estimateMintGas(signer, userData, photoHashes, metadataURI);
      console.log('Estimated gas:', gasEstimate.toString());

      // Execute the transaction with gas settings
      const tx = await contract.mintProfile(
        userAddress,
        userData.firstName || '',
        userData.lastName || '',
        userData.birthday || '',
        userData.gender || '',
        userData.sexuality || '',
        userData.location || '',
        userData.radius || 50,
        userData.personalInterests || [],
        partnerPreferences,
        photoHashes,
        metadataURI,
        {
          gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
        }
      );

      console.log('✅ Profile minting transaction sent:', tx.hash);

      // Wait for transaction confirmation with timeout
      const receipt = await tx.wait();
      if (!receipt) {
        throw new Error('Transaction receipt not received');
      }

      console.log('✅ Profile minting confirmed:', receipt.hash);

      // Extract token ID from events - ethers v6 compatible
      let tokenId = 0;
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          
          if (parsedLog?.name === 'ProfileMinted') {
            // Handle both BigNumber and number types for v6 compatibility
            const tokenIdValue = parsedLog.args.tokenId;
            tokenId = typeof tokenIdValue === 'bigint' ? Number(tokenIdValue) : tokenIdValue;
            console.log('✅ Extracted token ID:', tokenId);
            break;
          }
        } catch (parseError) {
          // Continue to next log if parsing fails
          continue;
        }
      }

      if (tokenId === 0) {
        console.warn('⚠️ Could not extract token ID from events, but transaction succeeded');
        // Try to get the token ID directly from the contract
        try {
          tokenId = await this.getUserProfileTokenId(userAddress);
        } catch (getTokenError) {
          console.warn('Could not retrieve token ID from contract either');
        }
      }

      return {
        tokenId,
        transactionHash: receipt.hash
      };
    } catch (error: any) {
      console.error('❌ Error minting profile NFT:', error);
      
      // Provide more specific error messages
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient funds for transaction and gas fees');
      } else if (error.code === 'USER_REJECTED') {
        throw new Error('Transaction was rejected by user');
      } else if (error.message?.includes('Profile already exists')) {
        throw new Error('Profile already exists for this address');
      } else if (error.message?.includes('revert')) {
        throw new Error(`Smart contract error: ${error.reason || error.message}`);
      }
      
      throw error;
    }
  }

  /**
   * Update existing profile NFT
   */
  async updateProfile(
    signer: ethers.Signer,
    userData: any,
    photoHashes: string[],
    metadataURI: string
  ): Promise<string> {
    try {
      const contract = await this.getContract(signer);
      const userAddress = await signer.getAddress();

      // Check if user has a profile
      const hasExistingProfile = await this.hasProfile(userAddress);
      if (!hasExistingProfile) {
        throw new Error('User does not have a profile NFT to update');
      }

      // Prepare contract parameters
      const partnerPreferences = userData.partnerPreferences?.map((pref: any) => 
        pref.options[pref.selected]
      ).filter(Boolean) || [];

      const tx = await contract.updateProfile(
        userData.location || '',
        userData.radius || 50,
        userData.personalInterests || [],
        partnerPreferences,
        photoHashes,
        metadataURI
      );

      console.log('Profile update transaction sent:', tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Profile update confirmed:', receipt);

      return receipt.hash;
    } catch (error) {
      console.error('Error updating profile NFT:', error);
      throw error;
    }
  }

  /**
   * Get total number of profiles minted
   */
  async getTotalProfiles(): Promise<number> {
    try {
      const contract = await this.getReadOnlyContract();
      const total = await contract.getTotalProfiles();
      return total.toNumber();
    } catch (error) {
      console.error('Error getting total profiles:', error);
      return 0;
    }
  }

  /**
   * Estimate gas for minting
   */
  async estimateMintGas(
    signer: ethers.Signer,
    userData: any,
    photoHashes: string[],
    metadataURI: string
  ): Promise<bigint> {
    try {
      const contract = await this.getContract(signer);
      const userAddress = await signer.getAddress();

      const partnerPreferences = userData.partnerPreferences?.map((pref: any) => 
        pref.options[pref.selected]
      ).filter(Boolean) || [];

      // Use ethers v6 compatible gas estimation
      const gasEstimate = await contract.mintProfile.estimateGas(
        userAddress,
        userData.firstName || '',
        userData.lastName || '',
        userData.birthday || '',
        userData.gender || '',
        userData.sexuality || '',
        userData.location || '',
        userData.radius || 50,
        userData.personalInterests || [],
        partnerPreferences,
        photoHashes,
        metadataURI
      );

      // Ensure we return a bigint (ethers v6 returns bigint by default)
      return typeof gasEstimate === 'bigint' ? gasEstimate : BigInt(gasEstimate.toString());
    } catch (error: any) {
      console.error('Error estimating gas:', error);
      
      // Provide fallback gas estimate for Flow testnet if estimation fails
      console.warn('Using fallback gas estimate for Flow testnet');
      return BigInt(500000); // 500k gas units as fallback
    }
  }
}

// Hook to use the contract service with Dynamic Labs
export function useProfileContract() {
  const { primaryWallet } = useDynamicContext();

  const getSigner = async (): Promise<ethers.Signer> => {
    if (!primaryWallet?.connector) {
      throw new Error('No wallet connected');
    }

    try {
      // Check if we have access to window.ethereum for direct ethers.js v6 usage
      if (typeof window !== 'undefined' && window.ethereum) {
        // Use ethers.js v6 BrowserProvider for better compatibility
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        return signer;
      }

      // Fallback to Dynamic Labs connector
      const provider = await primaryWallet.connector.getPublicClient();
      const signer = provider.getSigner ? await provider.getSigner() : provider;
      
      if (!signer) {
        throw new Error('Unable to get signer from wallet');
      }

      return signer;
    } catch (error) {
      console.error('Error getting signer:', error);
      throw new Error('Failed to initialize wallet signer');
    }
  };

  return {
    contractService: new ContractService(),
    getSigner,
    isConnected: !!primaryWallet
  };
}

export const contractService = new ContractService();