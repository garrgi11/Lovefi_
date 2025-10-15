import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: string;
  isFromUser: boolean;
  isRead?: boolean;
  type?: "message" | "stake_proposal" | "stake_response";
  stakeData?: {
    amount: number;
    status: "pending" | "accepted" | "declined";
    proposerId: string;
    responderId: string;
  };
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  photos: string[];
  distance: number;
  matchPercentage: number;
  cryptoTagline: string;
  commonInterests: string[];
  personalInterests: string[];
  partnerPreferences: string[];
}

export interface ChatConversation {
  profileId: string;
  messages: ChatMessage[];
  lastActivity: string;
}

interface UserData {
  // From wallet connection
  wallet?: {
    name: string;
    logo?: string;
    type?: string;
  };

  // From user info
  firstName?: string;
  lastName?: string;
  birthday?: string;
  zkProof?: string;

  // From gender selection
  gender?: "woman" | "man" | "non-binary" | "other";
  customGender?: string;

  // From location selection
  location?: string;
  radius?: number;

  // From sexuality selection
  sexuality?: "straight" | "gay" | "lesbian" | "other";
  customSexuality?: string;

  // From partner preferences
  partnerPreferences?: {
    id: string;
    options: string[];
    selected: number;
  }[];

  // From personal interests
  personalInterests?: string[];

  // From photo upload
  photos?: File[];

  // Saved profiles
  savedProfiles?: Profile[];

  // Messages - profiles that were liked and are available for messaging
  messages?: Profile[];

  // Chat conversations with message history
  conversations?: ChatConversation[];

  // Relationship status
  relationshipStatus?: {
    isInRelationship: boolean;
    partnerId?: string;
    stakeAmount?: number;
    startDate?: string;
    nftMinted?: boolean;
    nftTokenId?: string;
    nftMintDate?: string;
  };

  // Profile NFT data
  nftTokenId?: number;
  nftContractAddress?: string;
  transactionHash?: string;
  metadataURI?: string;
  profileNFTMinted?: boolean;
  profileNFTMintDate?: string;
}

interface UserContextType {
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
  clearUserData: () => void;
  saveProfile: (profile: Profile) => void;
  removeSavedProfile: (profileId: string) => void;
  isSaved: (profileId: string) => boolean;
  addToMessages: (profile: Profile) => void;
  removeFromMessages: (profileId: string) => void;
  sendMessage: (profileId: string, text: string) => void;
  getConversation: (profileId: string) => ChatMessage[];
  markMessagesAsRead: (profileId: string) => void;
  sendStakeProposal: (profileId: string, amount: number) => void;
  respondToStakeProposal: (
    profileId: string,
    messageId: string,
    accept: boolean,
    onAccepted?: () => void,
  ) => void;
}

// Create context with a default value to prevent undefined errors
const UserContext = createContext<UserContextType>({
  userData: {},
  updateUserData: () => {},
  clearUserData: () => {},
  saveProfile: () => {},
  removeSavedProfile: () => {},
  isSaved: () => false,
  addToMessages: () => {},
  removeFromMessages: () => {},
  sendMessage: () => {},
  getConversation: () => [],
  markMessagesAsRead: () => {},
  sendStakeProposal: () => {},
  respondToStakeProposal: () => {},
});

// Make UserContext displayName to help with debugging
UserContext.displayName = "UserContext";

// Local storage helpers
const STORAGE_KEY = "lovefi-user-data";

const loadFromStorage = (): UserData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Error loading user data from storage:", error);
    return {};
  }
};

const saveToStorage = (data: UserData) => {
  try {
    // Create a copy of data without File objects (they can't be serialized)
    const serializable = { ...data };
    // Remove photos as they contain File objects that can't be serialized
    delete serializable.photos;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (error) {
    console.error("Error saving user data to storage:", error);
  }
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData>(loadFromStorage);

  const updateUserData = useCallback((data: Partial<UserData>) => {
    setUserData((prev) => {
      const newData = { ...prev, ...data };
      saveToStorage(newData);
      return newData;
    });
  }, []);

  const clearUserData = useCallback(() => {
    setUserData({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const saveProfile = useCallback((profile: Profile) => {
    setUserData((prev) => {
      const existingProfiles = prev.savedProfiles || [];
      // Check if profile is already saved
      if (existingProfiles.some((p) => p.id === profile.id)) {
        return prev; // Profile already saved, don't add duplicate
      }
      const newData = {
        ...prev,
        savedProfiles: [...existingProfiles, profile],
      };
      saveToStorage(newData);
      return newData;
    });
  }, []);

  const removeSavedProfile = useCallback((profileId: string) => {
    setUserData((prev) => {
      const newData = {
        ...prev,
        savedProfiles: (prev.savedProfiles || []).filter(
          (profile) => profile.id !== profileId,
        ),
      };
      saveToStorage(newData);
      return newData;
    });
  }, []);

  const isSaved = useCallback(
    (profileId: string) => {
      return (userData.savedProfiles || []).some(
        (profile) => profile.id === profileId,
      );
    },
    [userData.savedProfiles],
  );

  const addToMessages = useCallback((profile: Profile) => {
    setUserData((prev) => {
      const existingMessages = prev.messages || [];
      const existingConversations = prev.conversations || [];

      // Check if profile is already in messages
      if (existingMessages.some((p) => p.id === profile.id)) {
        return prev; // Profile already in messages, don't add duplicate
      }

      // Add profile to messages list
      const updatedMessages = [...existingMessages, profile];

      // Initialize empty conversation if not exists
      let updatedConversations = existingConversations;
      if (
        !existingConversations.some((conv) => conv.profileId === profile.id)
      ) {
        updatedConversations = [
          ...existingConversations,
          {
            profileId: profile.id,
            messages: [],
            lastActivity: new Date().toISOString(),
          },
        ];
      }

      const newData = {
        ...prev,
        messages: updatedMessages,
        conversations: updatedConversations,
      };
      saveToStorage(newData);
      return newData;
    });
  }, []);

  const removeFromMessages = useCallback((profileId: string) => {
    setUserData((prev) => {
      const newData = {
        ...prev,
        messages: (prev.messages || []).filter(
          (profile) => profile.id !== profileId,
        ),
        conversations: (prev.conversations || []).filter(
          (conv) => conv.profileId !== profileId,
        ),
      };
      saveToStorage(newData);
      return newData;
    });
  }, []);

  const sendMessage = useCallback((profileId: string, text: string) => {
    setUserData((prev) => {
      const conversations = prev.conversations || [];
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text,
        timestamp,
        isFromUser: true,
        isRead: false,
      };

      const updatedConversations = conversations.map((conv) => {
        if (conv.profileId === profileId) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastActivity: new Date().toISOString(),
          };
        }
        return conv;
      });

      const newData = {
        ...prev,
        conversations: updatedConversations,
      };
      saveToStorage(newData);
      return newData;
    });
  }, []);

  const getConversation = useCallback(
    (profileId: string): ChatMessage[] => {
      const conversations = userData.conversations || [];
      const conversation = conversations.find(
        (conv) => conv.profileId === profileId,
      );
      return conversation ? conversation.messages : [];
    },
    [userData.conversations],
  );

  const markMessagesAsRead = useCallback((profileId: string) => {
    setUserData((prev) => {
      const conversations = prev.conversations || [];
      const updatedConversations = conversations.map((conv) => {
        if (conv.profileId === profileId) {
          return {
            ...conv,
            messages: conv.messages.map((msg) => ({ ...msg, isRead: true })),
          };
        }
        return conv;
      });

      const newData = {
        ...prev,
        conversations: updatedConversations,
      };
      saveToStorage(newData);
      return newData;
    });
  }, []);

  const sendStakeProposal = useCallback((profileId: string, amount: number) => {
    setUserData((prev) => {
      const conversations = prev.conversations || [];
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const stakeMessage: ChatMessage = {
        id: Date.now().toString(),
        text: `Proposed a stake of ${amount} ETH for an exclusive relationship`,
        timestamp,
        isFromUser: true,
        isRead: false,
        type: "stake_proposal",
        stakeData: {
          amount,
          status: "pending",
          proposerId: "current_user", // In a real app, this would be the current user's ID
          responderId: profileId,
        },
      };

      const updatedConversations = conversations.map((conv) => {
        if (conv.profileId === profileId) {
          return {
            ...conv,
            messages: [...conv.messages, stakeMessage],
            lastActivity: new Date().toISOString(),
          };
        }
        return conv;
      });

      const newData = {
        ...prev,
        conversations: updatedConversations,
      };
      saveToStorage(newData);
      return newData;
    });
  }, []);

  const respondToStakeProposal = useCallback(
    (
      profileId: string,
      messageId: string,
      accept: boolean,
      onAccepted?: () => void,
    ) => {
      setUserData((prev) => {
        const conversations = prev.conversations || [];
        const timestamp = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const updatedConversations = conversations.map((conv) => {
          if (conv.profileId === profileId) {
            const updatedMessages = conv.messages.map((msg) => {
              if (msg.id === messageId && msg.type === "stake_proposal") {
                return {
                  ...msg,
                  stakeData: {
                    ...msg.stakeData!,
                    status: accept ? "accepted" : "declined",
                  },
                };
              }
              return msg;
            });

            // Add response message
            const responseMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              text: accept
                ? `Accepted the stake proposal. You are now in a committed relationship!`
                : `Declined the stake proposal.`,
              timestamp,
              isFromUser: false,
              isRead: false,
              type: "stake_response",
            };

            return {
              ...conv,
              messages: [...updatedMessages, responseMessage],
              lastActivity: new Date().toISOString(),
            };
          }
          return conv;
        });

        // If accepted, update relationship status
        let newData = {
          ...prev,
          conversations: updatedConversations,
        };

        if (accept) {
          // Find the stake amount from the original proposal
          const conversation = conversations.find(
            (conv) => conv.profileId === profileId,
          );
          const stakeMessage = conversation?.messages.find(
            (msg) => msg.id === messageId,
          );
          const stakeAmount = stakeMessage?.stakeData?.amount || 0;

          newData = {
            ...newData,
            relationshipStatus: {
              isInRelationship: true,
              partnerId: profileId,
              stakeAmount,
              startDate: new Date().toISOString(),
            },
          };
        }

        saveToStorage(newData);

        // Call the onAccepted callback if provided and stake was accepted
        if (accept && onAccepted) {
          setTimeout(onAccepted, 100); // Small delay to ensure state is updated
        }

        return newData;
      });
    },
    [],
  );

  const contextValue = {
    userData,
    updateUserData,
    clearUserData,
    saveProfile,
    removeSavedProfile,
    isSaved,
    addToMessages,
    removeFromMessages,
    sendMessage,
    getConversation,
    markMessagesAsRead,
    sendStakeProposal,
    respondToStakeProposal,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);

  // More detailed error message for debugging
  if (!context || Object.keys(context).length === 0) {
    console.error("useUser hook called outside of UserProvider!");
    throw new Error(
      "useUser must be used within a UserProvider. " +
        "Make sure your component is wrapped with <UserProvider>.",
    );
  }

  return context;
};

// Export the context for advanced use cases
export { UserContext };
