// IPFS integration for uploading images and metadata
// Using Pinata as the IPFS service provider

export interface IPFSUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties: {
    firstName: string;
    lastName: string;
    birthday: string;
    gender: string;
    sexuality: string;
    location: any;
    radius: number;
    personalInterests: string[];
    partnerPreferences: string[];
    photoHashes: string[];
    createdAt: string;
  };
}

class IPFSService {
  private pinataApiKey: string;
  private pinataSecretKey: string;
  private pinataJWT: string;

  constructor() {
    this.pinataApiKey = import.meta.env.VITE_PINATA_API_KEY;
    this.pinataSecretKey = import.meta.env.VITE_PINATA_SECRET_API_KEY;
    this.pinataJWT = import.meta.env.VITE_PINATA_JWT;

    if (!this.pinataJWT && (!this.pinataApiKey || !this.pinataSecretKey)) {
      console.warn('IPFS service not configured. Upload functionality will be limited.');
    }
  }

  /**
   * Upload a single image file to IPFS
   */
  async uploadImage(file: File): Promise<string> {
    if (!this.pinataJWT) {
      throw new Error('Pinata JWT not configured');
    }

    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: `profile-image-${Date.now()}`,
      keyvalues: {
        type: 'profile-image',
        uploadedAt: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.pinataJWT}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: IPFSUploadResponse = await response.json();
      return result.IpfsHash;
    } catch (error) {
      console.error('Error uploading image to IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images to IPFS
   */
  async uploadImages(files: File[]): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Upload JSON metadata to IPFS
   */
  async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    if (!this.pinataJWT) {
      throw new Error('Pinata JWT not configured');
    }

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.pinataJWT}`
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `profile-metadata-${metadata.properties.firstName}-${metadata.properties.lastName}`,
            keyvalues: {
              type: 'profile-metadata',
              wallet: 'lovefi-profile',
              uploadedAt: new Date().toISOString()
            }
          },
          pinataOptions: {
            cidVersion: 0
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: IPFSUploadResponse = await response.json();
      return result.IpfsHash;
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error);
      throw error;
    }
  }

  /**
   * Create NFT metadata from user data
   */
  createNFTMetadata(userData: any, photoHashes: string[]): NFTMetadata {
    const mainPhotoHash = photoHashes[0] || '';
    const mainPhotoUrl = mainPhotoHash ? `https://gateway.pinata.cloud/ipfs/${mainPhotoHash}` : '';

    return {
      name: `${userData.firstName} ${userData.lastName} - LoveFi Profile`,
      description: `LoveFi dating profile for ${userData.firstName} ${userData.lastName}. A soulbound NFT representing their dating profile on the LoveFi platform.`,
      image: mainPhotoUrl,
      attributes: [
        {
          trait_type: "Age",
          value: userData.birthday ? this.calculateAge(userData.birthday) : "Unknown"
        },
        {
          trait_type: "Gender", 
          value: userData.gender || "Not specified"
        },
        {
          trait_type: "Sexuality",
          value: userData.sexuality || "Not specified"
        },
        {
          trait_type: "Location",
          value: this.formatLocation(userData.location)
        },
        {
          trait_type: "Search Radius",
          value: userData.radius || 50
        },
        {
          trait_type: "Interests Count",
          value: userData.personalInterests?.length || 0
        },
        {
          trait_type: "Photos Count",
          value: photoHashes.length
        },
        {
          trait_type: "Profile Type",
          value: "Dating Profile"
        }
      ],
      properties: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        birthday: userData.birthday,
        gender: userData.gender,
        sexuality: userData.sexuality,
        location: userData.location,
        radius: userData.radius || 50,
        personalInterests: userData.personalInterests || [],
        partnerPreferences: userData.partnerPreferences?.map((pref: any) => 
          pref.options[pref.selected]
        ).filter(Boolean) || [],
        photoHashes: photoHashes,
        createdAt: new Date().toISOString()
      }
    };
  }

  /**
   * Calculate age from birthday string
   */
  private calculateAge(birthday: string): number {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Format location from stored JSON
   */
  private formatLocation(locationString?: string): string {
    if (!locationString) return "Not specified";

    try {
      const locationData = JSON.parse(locationString);
      const parts = [];

      if (locationData.city) parts.push(locationData.city);
      if (locationData.country) parts.push(locationData.country);

      return parts.length > 0 ? parts.join(", ") : "Not specified";
    } catch {
      return locationString;
    }
  }

  /**
   * Get IPFS URL for a hash
   */
  getIPFSUrl(hash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }

  /**
   * Mock upload for development (when IPFS is not configured)
   */
  async mockUpload(file: File): Promise<string> {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a mock hash
    return `mock_hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Mock metadata upload for development
   */
  async mockUploadMetadata(metadata: NFTMetadata): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return `mock_metadata_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const ipfsService = new IPFSService();