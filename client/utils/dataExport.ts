interface UserDataExport {
  wallet?: {
    name: string;
    logo?: string;
    type?: string;
  };
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    birthday?: string;
  };
  gender?: {
    selection: string;
    customGender?: string;
  };
  location?: {
    address: string;
    searchRadius: number;
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

export function exportUserDataAsJSON(userData: any): UserDataExport {
  const exportData: UserDataExport = {
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
    },

    // Gender selection
    gender: userData.gender
      ? {
          selection: userData.gender,
          customGender: userData.customGender,
        }
      : undefined,

    // Location and radius
    location: userData.location
      ? {
          address: userData.location,
          searchRadius: userData.radius || 10,
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

    // Photos metadata
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
    version: "1.0",
  };

  return exportData;
}

function getPreferenceCategory(id: string): string {
  const categories: Record<string, string> = {
    "lifestyle-activity": "Lifestyle",
    "lifestyle-social": "Lifestyle",
    "blockchain-knowledge": "Blockchain",
    "investment-experience": "Investment",
    "community-involvement": "Community",
  };
  return categories[id] || "Unknown";
}

function getPreferenceQuestion(id: string): string {
  const questions: Record<string, string> = {
    "lifestyle-activity": "How would you describe your lifestyle?",
    "lifestyle-social": "What describes your social preference?",
    "blockchain-knowledge": "What is your blockchain knowledge level?",
    "investment-experience": "How experienced are you with investments?",
    "community-involvement": "How involved are you in communities?",
  };
  return questions[id] || "Unknown question";
}

export function downloadUserDataAsJSON(
  userData: any,
  filename: string = "lovefi-user-data.json",
) {
  const exportData = exportUserDataAsJSON(userData);
  const jsonString = JSON.stringify(exportData, null, 2);

  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function logUserDataToConsole(userData: any) {
  const exportData = exportUserDataAsJSON(userData);
  console.group("📊 LoveFi User Data Export");
  console.log("Complete user data ready for backend:", exportData);
  console.log("JSON String:", JSON.stringify(exportData, null, 2));
  console.groupEnd();

  return exportData;
}
