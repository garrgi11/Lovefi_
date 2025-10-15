import { Profile } from "../contexts/UserContext";

const cryptoTaglines = [
  "Insert Quirky Crypto Meme",
  "To the moon and beyond 🚀",
  "HODL my heart, not just my crypto",
  "Looking for my diamond hands partner 💎",
  "Swipe right if you understand DeFi",
  "Seeking someone who gets the blockchain life",
  "When Lambo? When love? 🏎️",
  "My heart is decentralized but open to you",
  "Bull market in love, bear market in loneliness",
  "Smart contracts but smarter relationships",
  "Yield farming and relationship farming",
  "Not your keys, not your crypto. But you can have my heart",
];

const cryptoInterests = [
  "Bitcoin maximalist",
  "DeFi enthusiast",
  "NFT collector",
  "Ethereum believer",
  "Solana staker",
  "DAO participant",
  "Crypto trading",
  "Web3 gaming",
  "Metaverse explorer",
  "Blockchain developer",
  "Crypto memes lover",
  "HODL strategy",
  "DeFi yield farming",
  "Layer 2 solutions",
  "Smart contracts",
  "Crypto art collector",
  "Mining enthusiast",
  "Staking rewards",
  "Cross-chain protocols",
  "Crypto education",
];

const lifestyleInterests = [
  "Digital nomad lifestyle",
  "Tech conferences",
  "Startup culture",
  "Remote work",
  "Coding marathons",
  "Hackathons",
  "Coffee shop wifi warrior",
  "Coworking spaces",
  "Tech meetups",
  "Innovation hubs",
  "Venture capital discussions",
  "Entrepreneurship",
  "Future tech trends",
  "AI and ML",
  "Quantum computing",
  "Space exploration",
  "Sustainable tech",
  "Open source projects",
  "DevOps culture",
  "Cloud architecture",
];

// Sample photos - in a real app these would be actual user photos
const samplePhotos = [
  "https://api.builder.io/api/v1/image/assets/TEMP/af8f73f4142b1ef8e6d592d18b85241000f6502f?width=590",
  "https://api.builder.io/api/v1/image/assets/TEMP/6cabb3dad76cb51b24764256d4f4bd8801bd4295?width=462",
  "https://api.builder.io/api/v1/image/assets/TEMP/434a85bde041459edbb784f0e83f407bd7633083?width=590",
];

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function calculateMatchPercentage(
  userInterests: string[],
  userPreferences: string[],
  profileInterests: string[],
  profilePreferences: string[],
): number {
  const userCombined = [...userInterests, ...userPreferences];
  const profileCombined = [...profileInterests, ...profilePreferences];

  const commonItems = userCombined.filter((item) =>
    profileCombined.some(
      (profileItem) =>
        profileItem.toLowerCase().includes(item.toLowerCase()) ||
        item.toLowerCase().includes(profileItem.toLowerCase()),
    ),
  );

  const totalUniqueItems = new Set([...userCombined, ...profileCombined]).size;
  const matchScore = (commonItems.length / Math.max(totalUniqueItems, 1)) * 100;

  // Add some randomness and ensure minimum viable match
  const randomFactor = (Math.random() - 0.5) * 20; // ±10%
  const finalScore = Math.max(50, Math.min(95, matchScore + randomFactor));

  return Math.round(finalScore);
}

function generateCommonInterests(
  userInterests: string[],
  profileInterests: string[],
): string[] {
  const common = [];

  // Find actual common interests
  const actualCommon = userInterests.filter((interest) =>
    profileInterests.some(
      (profileInterest) =>
        profileInterest.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(profileInterest.toLowerCase()),
    ),
  );

  common.push(...actualCommon.slice(0, 2));

  // Add some fun crypto-specific commonalities
  const cryptoCommon = [
    "looking for someone who gets crypto humor",
    "both believe in the future of blockchain",
    "ready to build something decentralized together",
    "understand that patience is key in crypto and love",
    "know that the best things are worth HODLing",
    "appreciate the volatility of both markets and emotions",
  ];

  if (common.length < 3) {
    common.push(...getRandomItems(cryptoCommon, 3 - common.length));
  }

  return common.slice(0, 3);
}

export function generateProfiles(
  count: number,
  userInterests: string[] = [],
  userPreferences: string[] = [],
): Profile[] {
  const names = [
    "Jessica Parker",
    "Alex Chen",
    "Morgan Smith",
    "Casey Johnson",
    "River Taylor",
    "Sage Kim",
    "Blake Rodriguez",
    "Quinn Martinez",
    "Avery Liu",
    "Emery Garcia",
    "Dakota Williams",
    "Rowan Brown",
    "Phoenix Davis",
    "Skyler Wilson",
    "Eden Miller",
  ];

  return Array.from({ length: count }, (_, index) => {
    const profileInterests = getRandomItems(
      [...cryptoInterests, ...lifestyleInterests],
      8,
    );
    const profilePreferences = getRandomItems(
      [...cryptoInterests, ...lifestyleInterests],
      6,
    );

    const matchPercentage = calculateMatchPercentage(
      userInterests,
      userPreferences,
      profileInterests,
      profilePreferences,
    );

    const commonInterests = generateCommonInterests(
      userInterests,
      profileInterests,
    );

    return {
      id: `profile_${index + 1}`,
      name: names[index % names.length],
      age: 20 + Math.floor(Math.random() * 15), // Ages 20-34
      photos: getRandomItems(samplePhotos, Math.floor(Math.random() * 3) + 1),
      distance: Math.floor(Math.random() * 20) + 1, // 1-20 km
      matchPercentage,
      cryptoTagline:
        cryptoTaglines[Math.floor(Math.random() * cryptoTaglines.length)],
      commonInterests,
      personalInterests: profileInterests,
      partnerPreferences: profilePreferences,
    };
  });
}

export { cryptoTaglines, cryptoInterests, lifestyleInterests };
