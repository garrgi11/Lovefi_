import React, { useState, useEffect } from "react";
import { useUser, ChatMessage } from "../contexts/UserContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import AnimatedPageWrapper from "../components/AnimatedPageWrapper";
import StakeProposal from "../components/StakeProposal";

const sampleMessages = [
  {
    profileId: "",
    lastMessage: "Sticker 😍",
    time: "23 min",
    unread: 1,
    isTyping: false,
    isFromUser: false,
  },
  {
    profileId: "",
    lastMessage: "Typing..",
    time: "27 min",
    unread: 2,
    isTyping: true,
    isFromUser: false,
  },
  {
    profileId: "",
    lastMessage: "Ok, see you then.",
    time: "33 min",
    unread: 0,
    isTyping: false,
    isFromUser: false,
  },
  {
    profileId: "",
    lastMessage: "You: Hey! What's up, long time..",
    time: "50 min",
    unread: 0,
    isTyping: false,
    isFromUser: true,
  },
  {
    profileId: "",
    lastMessage: "You: Hello how are you?",
    time: "55 min",
    unread: 0,
    isTyping: false,
    isFromUser: true,
  },
  {
    profileId: "",
    lastMessage: "You: Great I will write later..",
    time: "1 hour",
    unread: 0,
    isTyping: false,
    isFromUser: true,
  },
];

// No default messages - chats start completely empty

export default function MessagesPage() {
  const {
    userData,
    updateUserData,
    sendMessage,
    getConversation,
    markMessagesAsRead,
    sendStakeProposal,
    respondToStakeProposal,
  } = useUser();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState("");
  const [openChatId, setOpenChatId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [currentChatMessages, setCurrentChatMessages] = useState<ChatMessage[]>(
    [],
  );
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);

  const messages = userData.messages || [];

  // Check for chat parameter in URL and set openChatId
  useEffect(() => {
    const chatId = searchParams.get("chat");
    if (chatId && chatId !== openChatId) {
      setOpenChatId(chatId);
    } else if (!chatId && openChatId) {
      setOpenChatId(null);
      setCurrentChatMessages([]);
    }
  }, [searchParams, openChatId]);

  // Load conversation when openChatId changes
  useEffect(() => {
    if (openChatId) {
      const conversations = userData.conversations || [];
      const conversation = conversations.find(
        (conv) => conv.profileId === openChatId,
      );
      const conversationMessages = conversation ? conversation.messages : [];

      // Always set the conversation messages (empty array if no conversation exists)
      setCurrentChatMessages(conversationMessages);
    } else {
      // Clear messages when no chat is open
      setCurrentChatMessages([]);
    }
  }, [openChatId, userData.conversations]);

  // This useEffect is now redundant since we handle conversation updates above
  // Removed to prevent duplicate updates and potential loops

  const openChat = (profileId: string) => {
    setIsAnimatingIn(true);
    setOpenChatId(profileId);
    setSearchParams({ chat: profileId });
    // Mark messages as read when user opens a chat
    markMessagesAsRead(profileId);

    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimatingIn(false);
    }, 400);
  };

  const closeChat = () => {
    setIsAnimatingOut(true);

    // Wait for slide-down animation to complete before closing
    setTimeout(() => {
      setOpenChatId(null);
      setSearchParams({});
      setCurrentChatMessages([]);
      setIsAnimatingIn(false);
      setIsAnimatingOut(false);
    }, 300);
  };

  const handleSendMessage = () => {
    if (messageText.trim() && openChatId) {
      sendMessage(openChatId, messageText.trim());
      setMessageText("");
    }
  };

  const handleDollarClick = () => {
    setIsStakeModalOpen(true);
  };

  const handleStakeSubmit = (amount: number) => {
    if (openChatId) {
      sendStakeProposal(openChatId, amount);
    }
    setIsStakeModalOpen(false);
  };

  // Test function to simulate receiving a stake proposal
  const simulateIncomingStake = () => {
    if (!openChatId) return;

    const conversations = userData.conversations || [];
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const testAmount = 0.05; // Test with 0.05 ETH
    const incomingStakeMessage = {
      id: Date.now().toString(),
      text: `Proposed a stake of ${testAmount} ETH for an exclusive relationship`,
      timestamp,
      isFromUser: false, // This makes it an incoming proposal
      isRead: false,
      type: "stake_proposal" as const,
      stakeData: {
        amount: testAmount,
        status: "pending" as const,
        proposerId: openChatId,
        responderId: "current_user",
      },
    };

    // Manually add the message to test receiving stakes
    const updatedConversations = conversations.map((conv) => {
      if (conv.profileId === openChatId) {
        return {
          ...conv,
          messages: [...conv.messages, incomingStakeMessage],
          lastActivity: new Date().toISOString(),
        };
      }
      return conv;
    });

    // Update user data with the simulated incoming message
    updateUserData({ conversations: updatedConversations });
  };

  const currentChatProfile = openChatId
    ? messages.find((p) => p.id === openChatId)
    : null;

  return (
    <AnimatedPageWrapper>
      <div className="w-full min-h-screen bg-white relative max-w-sm mx-auto overflow-x-hidden">
        {/* Header */}
        <div className="px-11 pt-4 pb-6">
          <h1 className="text-[34px] font-normal text-black leading-[150%] font-[Alata]">
            Messages
          </h1>
        </div>

        {/* Search Bar */}
        <div className="px-10 pb-6">
          <div className="relative">
            <div className="absolute left-5 top-3.5 text-gray-400 pointer-events-none">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="9.16667"
                  cy="9.16667"
                  r="7.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M15.5 15.5L19.5 19.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <input
              id="search-messages"
              name="searchMessages"
              type="text"
              placeholder="Search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-12 pl-12 pr-4 border border-[#E8E6EA] rounded-[15px] bg-white text-sm font-normal placeholder-black placeholder-opacity-40 focus:outline-none focus:border-lovefi-purple"
            />
          </div>
        </div>

        {/* Messages Section */}
        <div className="px-10 pb-8">
          <h2 className="text-lg font-normal text-black mb-6 font-[Alata]">
            Messages
          </h2>

          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="mb-6">
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 80 80"
                    fill="none"
                    className="mx-auto mb-4 text-gray-300"
                  >
                    <path
                      d="M70 30C70 58.719 47.7188 82 20 82C15.0133 82 2 82 2 82C2 82 2 63.0361 2 50C2 21.281 24.2812 -2 52 -2C57.8688 -2 70 -2 70 30Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-[Alata] text-black mb-4">
                  No Messages Yet
                </h2>
                <p className="text-gray-600 font-[Alata] max-w-xs mx-auto leading-relaxed">
                  When you heart someone in the matching section, they'll appear
                  here for conversations.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {messages.map((profile, index) => {
                const conversations = userData.conversations || [];
                const conversation = conversations.find(
                  (conv) => conv.profileId === profile.id,
                );
                const conversationMessages = conversation
                  ? conversation.messages
                  : [];
                const lastMessage =
                  conversationMessages.length > 0
                    ? conversationMessages[conversationMessages.length - 1]
                    : null;

                // Use sample data if no real conversation exists
                const messageData =
                  sampleMessages[index % sampleMessages.length];
                const displayMessage = lastMessage
                  ? {
                      lastMessage: lastMessage.isFromUser
                        ? `You: ${lastMessage.text}`
                        : lastMessage.text,
                      time: lastMessage.timestamp,
                      isFromUser: lastMessage.isFromUser,
                    }
                  : messageData;

                const hasUnread = conversationMessages.some(
                  (msg) => !msg.isFromUser && !msg.isRead,
                );
                const isOnline = index < 2; // First two are "online"

                return (
                  <div key={profile.id} className="relative">
                    <div
                      className="flex items-center py-4 cursor-pointer hover:bg-gray-50 rounded-lg"
                      onClick={() => openChat(profile.id)}
                    >
                      {/* Profile Photo */}
                      <div className="relative mr-4">
                        <div
                          className={`w-14 h-14 rounded-full overflow-hidden ${isOnline ? "ring-2 ring-lovefi-purple" : ""}`}
                        >
                          <img
                            src={profile.photos[0]}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-normal text-black font-[Alata] truncate">
                            {profile.name}
                          </h3>
                          <span className="text-xs text-gray-400 font-[Alata] ml-2">
                            {displayMessage.time}
                          </span>
                        </div>
                        <p className="text-sm text-black font-normal leading-[150%] truncate">
                          {messageData.isTyping ? (
                            <span className="text-black">
                              {displayMessage.lastMessage}
                            </span>
                          ) : displayMessage.isFromUser ? (
                            <>
                              <span className="text-black opacity-40">
                                You:{" "}
                              </span>
                              <span className="text-black">
                                {displayMessage.lastMessage.replace(
                                  "You: ",
                                  "",
                                )}
                              </span>
                            </>
                          ) : (
                            <span className="text-black">
                              {displayMessage.lastMessage}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Unread Indicator */}
                      {hasUnread && (
                        <div className="ml-3">
                          <div className="w-5 h-5 bg-lovefi-purple rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-normal font-[Alata]">
                              {
                                conversationMessages.filter(
                                  (msg) => !msg.isFromUser && !msg.isRead,
                                ).length
                              }
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    {index < messages.length - 1 && (
                      <div className="ml-[66px] h-px bg-gray-200"></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation as part of normal flow */}
        <div className="bg-white border-t-4 border-gray-400 shadow-xl py-6 px-4 mt-8">
          <div className="grid grid-cols-3 gap-0 max-w-sm mx-auto">
            <button
              onClick={() => (window.location.href = "/matching")}
              className="flex flex-col items-center justify-center py-4 px-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              <div className="text-3xl mb-2">♥</div>
              <span className="text-sm font-medium">Matching</span>
            </button>
            <button
              onClick={() => (window.location.href = "/messages")}
              className="flex flex-col items-center justify-center py-4 px-2 rounded-lg text-purple-600 bg-purple-100"
            >
              <div className="text-3xl mb-2">💬</div>
              <span className="text-sm font-medium">Messages</span>
            </button>
            <button
              onClick={() => (window.location.href = "/profile")}
              className="flex flex-col items-center justify-center py-4 px-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              <div className="text-3xl mb-2">👤</div>
              <span className="text-sm font-medium">Profile</span>
            </button>
          </div>
        </div>

        {/* Chat Modal Overlay */}
        {openChatId && currentChatProfile && (
          <div className="fixed inset-0 bg-black/60 z-50 flex flex-col">
            <div
              className="bg-white relative max-w-sm mx-auto w-full"
              style={{
                height: "100vh",
                transform: isAnimatingOut
                  ? "translateY(100%)"
                  : isAnimatingIn
                    ? "translateY(100%)"
                    : "translateY(0)",
                animation: isAnimatingIn
                  ? "slideUp 0.4s cubic-bezier(0.4, 0.0, 0.2, 1) forwards"
                  : isAnimatingOut
                    ? "slideDown 0.3s cubic-bezier(0.4, 0.0, 0.6, 1) forwards"
                    : "none",
              }}
            >
              {/* Header with Back Button */}
              <div className="px-6 pt-2 pb-2 flex items-center">
                <button
                  onClick={closeChat}
                  className="mr-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M19 12H5M12 19L5 12L12 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <h1 className="text-[34px] font-normal text-black leading-[150%] font-[Alata]">
                  Messages
                </h1>
              </div>

              {/* Chat Container */}
              <div
                className="flex-1 bg-white rounded-t-[24px] relative flex flex-col"
                style={{ height: "calc(100vh - 80px)" }}
              >
                {/* Pull indicator */}
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="w-[27px] h-3 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <div className="w-3 h-0.5 bg-[#E8E6EA] rounded-full"></div>
                  </div>
                </div>

                {/* Chat Header */}
                <div className="pt-8 px-10 pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 via-red-500 to-purple-600 p-0.5">
                          <img
                            src={currentChatProfile.photos[0]}
                            alt={currentChatProfile.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        <div className="absolute bottom-1 right-1 w-3 h-3 bg-[#E94057] rounded-full"></div>
                      </div>
                      <div className="ml-4">
                        <h2 className="text-2xl font-normal text-black font-[Alata]">
                          {currentChatProfile.name}
                        </h2>
                        <p className="text-xs text-black/40 font-[Alata]">
                          • Online
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 px-10 pb-6 overflow-y-auto">
                  {currentChatMessages.length === 0 ? (
                    /* Empty state for new conversations */
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="mb-4">
                          <svg
                            width="60"
                            height="60"
                            viewBox="0 0 60 60"
                            fill="none"
                            className="mx-auto mb-4 text-gray-300"
                          >
                            <path
                              d="M50 20C50 38.719 37.7188 52 20 52C15.0133 52 12 52 12 52C12 52 12 43.0361 12 35C12 16.281 24.2812 2 42 2C47.8688 2 50 2 50 20Z"
                              fill="currentColor"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-[Alata] text-black mb-2">
                          Start the conversation
                        </h3>
                        <p className="text-gray-600 font-[Alata] text-sm max-w-xs mx-auto leading-relaxed">
                          Say hello and start chatting with{" "}
                          {currentChatProfile?.name}!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Today Divider */}
                      <div className="flex items-center mb-6">
                        <div className="flex-1 h-px bg-[#E8E6EA]"></div>
                        <span className="px-4 text-xs text-black/70 font-[Alata]">
                          Today
                        </span>
                        <div className="flex-1 h-px bg-[#E8E6EA]"></div>
                      </div>

                      {/* Message List */}
                      <div className="space-y-4">
                        {currentChatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.isFromUser ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[280px] ${message.isFromUser ? "mr-0 ml-6" : "ml-0 mr-6"}`}
                            >
                              {message.type === "stake_proposal" ? (
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-[15px] p-4 text-white">
                                  <div className="flex items-center mb-2">
                                    <svg
                                      width="20"
                                      height="20"
                                      viewBox="0 0 34 34"
                                      fill="none"
                                      className="mr-2"
                                    >
                                      <g clipPath="url(#clip0_20_209)">
                                        <path
                                          d="M17 1.41663V32.5833M24.0833 7.08329H13.4583C12.1433 7.08329 10.8821 7.60569 9.95226 8.53555C9.02239 9.46542 8.5 10.7266 8.5 12.0416C8.5 13.3567 9.02239 14.6178 9.95226 15.5477C10.8821 16.4776 12.1433 17 13.4583 17H20.5417C21.8567 17 23.1179 17.5224 24.0477 18.4522C24.9776 19.3821 25.5 20.6433 25.5 21.9583C25.5 23.2733 24.9776 24.5345 24.0477 25.4644C23.1179 26.3942 21.8567 26.9166 20.5417 26.9166H8.5"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </g>
                                      <defs>
                                        <clipPath id="clip0_20_209">
                                          <rect
                                            width="34"
                                            height="34"
                                            fill="white"
                                          />
                                        </clipPath>
                                      </defs>
                                    </svg>
                                    <span className="font-[Alata] font-medium">
                                      Stake Proposal
                                    </span>
                                  </div>
                                  <p className="text-sm font-[Alata] mb-3">
                                    💎 {message.stakeData?.amount} ETH for
                                    exclusive relationship
                                  </p>
                                  {message.stakeData?.status === "pending" &&
                                    !message.isFromUser && (
                                      <div className="flex gap-2 mt-3">
                                        <button
                                          onClick={() =>
                                            openChatId &&
                                            respondToStakeProposal(
                                              openChatId,
                                              message.id,
                                              true,
                                              () =>
                                                navigate("/relationship-nft"),
                                            )
                                          }
                                          className="flex-1 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-lg py-2 px-3 text-xs font-[Alata] transition-colors"
                                        >
                                          Accept
                                        </button>
                                        <button
                                          onClick={() =>
                                            openChatId &&
                                            respondToStakeProposal(
                                              openChatId,
                                              message.id,
                                              false,
                                            )
                                          }
                                          className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg py-2 px-3 text-xs font-[Alata] transition-colors"
                                        >
                                          Decline
                                        </button>
                                      </div>
                                    )}
                                  {message.stakeData?.status === "accepted" && (
                                    <div className="bg-green-500/20 border border-green-300/30 rounded-lg p-2 mt-2">
                                      <p className="text-xs font-[Alata] text-green-100">
                                        ✅ Accepted
                                      </p>
                                    </div>
                                  )}
                                  {message.stakeData?.status === "declined" && (
                                    <div className="bg-red-500/20 border border-red-300/30 rounded-lg p-2 mt-2">
                                      <p className="text-xs font-[Alata] text-red-100">
                                        ❌ Declined
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div
                                  className={`rounded-[15px] p-4 ${
                                    message.isFromUser
                                      ? "bg-[#F3F3F3] rounded-br-none"
                                      : "bg-[#E94057]/7 rounded-bl-none"
                                  }`}
                                >
                                  <p className="text-sm font-normal text-black leading-[150%] font-[Alata]">
                                    {message.text}
                                  </p>
                                </div>
                              )}
                              <div
                                className={`flex items-center mt-2 ${message.isFromUser ? "justify-end" : "justify-start"}`}
                              >
                                <span className="text-xs text-black/40 font-[Alata]">
                                  {message.timestamp}
                                </span>
                                {message.isFromUser && message.isRead && (
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    className="ml-2"
                                  >
                                    <path
                                      d="M11.8048 5.13807C12.0651 4.87772 12.0651 4.45561 11.8048 4.19526C11.5444 3.93491 11.1223 3.93491 10.8619 4.19526L4.66669 10.3905L1.80476 7.5286C1.54441 7.26825 1.1223 7.26825 0.861949 7.5286C0.6016 7.78894 0.6016 8.21106 0.861949 8.4714L4.19528 11.8047C4.45563 12.0651 4.87774 12.0651 5.13809 11.8047L11.8048 5.13807Z"
                                      fill="#E94057"
                                    />
                                    <path
                                      d="M15.1381 5.13807C15.3984 4.87772 15.3984 4.45561 15.1381 4.19526C14.8777 3.93491 14.4556 3.93491 14.1953 4.19526L7.99688 10.3937C7.73519 10.1862 7.35378 10.2034 7.11195 10.4453C6.8516 10.7056 6.8516 11.1277 7.11195 11.3881L7.52862 11.8047C7.78896 12.0651 8.21107 12.0651 8.47142 11.8047L15.1381 5.13807Z"
                                      fill="#E94057"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-10 pt-4 bg-white">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                      <input
                        id="chat-message-input"
                        name="chatMessage"
                        type="text"
                        placeholder="Your message"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                        className="w-full h-12 pl-4 pr-12 border border-[#E8E6EA] rounded-[15px] bg-white text-sm font-normal placeholder-black placeholder-opacity-40 focus:outline-none focus:border-lovefi-purple"
                      />
                      <button
                        className="absolute right-3 top-3"
                        onClick={() => console.log("Voice recording")}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M13.75 10V4.58337C13.75 2.51231 12.0711 0.833374 10 0.833374C7.92894 0.833374 6.25002 2.51231 6.25002 4.58337V10C6.25002 12.0711 7.92894 13.75 10 13.75C12.0711 13.75 13.75 12.0711 13.75 10Z"
                            fill="#E94057"
                          />
                          <path
                            d="M3.75002 8.75004C4.21026 8.75004 4.58335 9.12314 4.58335 9.58337C4.58335 12.5749 7.00847 15 10 15C12.9916 15 15.4167 12.5749 15.4167 9.58337C15.4167 9.12314 15.7898 8.75004 16.25 8.75004C16.7103 8.75004 17.0834 9.12314 17.0834 9.58337C17.0834 13.2135 14.3527 16.2058 10.8334 16.6182V18.3334C10.8334 18.7936 10.4603 19.1667 10 19.1667C9.53978 19.1667 9.16669 18.7936 9.16669 18.3334V16.6182C5.64737 16.2058 2.91669 13.2135 2.91669 9.58337C2.91669 9.12314 3.28978 8.75004 3.75002 8.75004Z"
                            fill="#E94057"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Stake Button */}
                    <button
                      onClick={handleDollarClick}
                      className="w-12 h-12 border border-[#E8E6EA] rounded-[15px] bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <svg
                        width="34"
                        height="34"
                        viewBox="0 0 34 34"
                        fill="none"
                      >
                        <g clipPath="url(#clip0_20_209)">
                          <path
                            d="M17 1.41663V32.5833M24.0833 7.08329H13.4583C12.1433 7.08329 10.8821 7.60569 9.95226 8.53555C9.02239 9.46542 8.5 10.7266 8.5 12.0416C8.5 13.3567 9.02239 14.6178 9.95226 15.5477C10.8821 16.4776 12.1433 17 13.4583 17H20.5417C21.8567 17 23.1179 17.5224 24.0477 18.4522C24.9776 19.3821 25.5 20.6433 25.5 21.9583C25.5 23.2733 24.9776 24.5345 24.0477 25.4644C23.1179 26.3942 21.8567 26.9166 20.5417 26.9166H8.5"
                            stroke="#1E1E1E"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_20_209">
                            <rect width="34" height="34" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </button>

                    {/* Test Button - Simulate Incoming Stake */}
                    <button
                      onClick={simulateIncomingStake}
                      className="w-12 h-12 border border-purple-300 rounded-[15px] bg-purple-50 flex items-center justify-center hover:bg-purple-100 transition-colors"
                      title="Test: Simulate incoming stake proposal"
                    >
                      <span className="text-sm font-bold text-purple-600">
                        TEST
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stake Proposal Modal */}
        <StakeProposal
          isOpen={isStakeModalOpen}
          onClose={() => setIsStakeModalOpen(false)}
          onSubmit={handleStakeSubmit}
          recipientName={currentChatProfile?.name || ""}
        />
      </div>
    </AnimatedPageWrapper>
  );
}
