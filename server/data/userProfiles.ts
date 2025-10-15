import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

interface UserProfileData {
  id: string;
  timestamp: string;
  wallet?: {
    name: string;
    logo?: string;
    type?: string;
  };
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    birthday?: string;
    zkProof?: string;
  };
  gender?: {
    selection: string;
    customGender?: string;
  };
  location?: {
    street?: string;
    city: string;
    country: string;
    fullAddress?: string;
    latitude?: number;
    longitude?: number;
    searchRadius: number;
  };
  sexuality?: {
    selection: string;
    customSexuality?: string;
  };
  personalInterests?: string[];
  partnerPreferences?: {
    category: string;
    question: string;
    options: string[];
    selectedIndex: number;
    selectedOption: string;
  }[];
  photos?: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
    uploadedAt: string;
  }[];
  completedAt: string;
  version: string;
}

const DATA_DIR = join(process.cwd(), "server", "data", "profiles");

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

export function saveUserProfile(userData: any): UserProfileData {
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Parse location data if it's stored as JSON string
  let locationData = userData.location;
  if (typeof locationData === "string") {
    try {
      locationData = JSON.parse(locationData);
    } catch {
      // If parsing fails, treat as legacy string format
      locationData = {
        city: locationData,
        country: "",
        searchRadius: userData.radius || 10,
      };
    }
  }

  const profileData: UserProfileData = {
    id: userId,
    timestamp: new Date().toISOString(),

    // Wallet information
    wallet: userData.wallet
      ? {
          name: userData.wallet.name,
          logo: userData.wallet.logo,
          type: userData.wallet.type,
        }
      : undefined,

    // Personal information
    personalInfo: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      birthday: userData.birthday,
      zkProof: userData.zkProof,
    },

    // Gender selection
    gender: userData.gender
      ? {
          selection: userData.gender,
          customGender: userData.customGender,
        }
      : undefined,

    // Location data
    location: locationData
      ? {
          street: locationData.street,
          city: locationData.city,
          country: locationData.country,
          fullAddress: locationData.fullAddress,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          searchRadius: userData.radius || 10,
        }
      : undefined,

    // Sexuality
    sexuality: userData.sexuality
      ? {
          selection: userData.sexuality,
          customSexuality: userData.customSexuality,
        }
      : undefined,

    // Personal interests
    personalInterests: userData.personalInterests || [],

    // Partner preferences with detailed mapping
    partnerPreferences:
      userData.partnerPreferences?.map((pref: any) => ({
        category: getPreferenceCategory(pref.id),
        question: getPreferenceQuestion(pref.id),
        options: pref.options,
        selectedIndex: pref.selected,
        selectedOption: pref.options[pref.selected],
      })) || [],

    // Photos metadata (actual files would be handled separately)
    photos:
      userData.photos?.map((photo: File, index: number) => ({
        name: photo.name,
        size: photo.size,
        type: photo.type,
        lastModified: photo.lastModified,
        uploadedAt: new Date().toISOString(),
      })) || [],

    // Metadata
    completedAt: new Date().toISOString(),
    version: "2.0",
  };

  // Save to JSON file
  const filename = `${userId}.json`;
  const filepath = join(DATA_DIR, filename);

  try {
    writeFileSync(filepath, JSON.stringify(profileData, null, 2), "utf8");
    console.log(`✅ User profile saved: ${filepath}`);
  } catch (error) {
    console.error(`❌ Failed to save user profile: ${error}`);
    throw new Error("Failed to save user profile");
  }

  return profileData;
}

function getPreferenceCategory(id: string): string {
  const categories: Record<string, string> = {
    lifestyle: "Lifestyle",
    blockchain: "Blockchain",
    investment: "Investment",
    community: "Community",
  };
  return categories[id] || "Unknown";
}

function getPreferenceQuestion(id: string): string {
  const questions: Record<string, string> = {
    lifestyle: "How would you describe your lifestyle?",
    blockchain: "What is your blockchain preference?",
    investment: "What describes your investment style?",
    community: "Which community do you identify with?",
  };
  return questions[id] || "Unknown question";
}
