import { useState, useRef, ChangeEvent } from "react";
import { useUser } from "../contexts/UserContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { nftMintingService, MintingProgress } from "../lib/nftMinting";
import { useProfileContract } from "../lib/contracts";

export default function PhotoUpload() {
  const { userData, updateUserData } = useUser();
  const { user, primaryWallet } = useAuth();
  const { contractService, getSigner, isConnected } = useProfileContract();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine back route based on referrer or default flow
  const isFromProfile = location.state?.from === "profile";
  const backRoute = isFromProfile ? "/profile" : "/personal-interests";
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>(
    userData.photos || [],
  );
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  // NFT minting state
  const [isMinting, setIsMinting] = useState(false);
  const [mintingProgress, setMintingProgress] = useState<MintingProgress | null>(null);
  const [mintingError, setMintingError] = useState<string | null>(null);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const updatedPhotos = [...uploadedPhotos, ...newFiles];
      setUploadedPhotos(updatedPhotos);

      // Create preview URLs for new files
      const newPreviewUrls: string[] = [];
      newFiles.forEach((file) => {
        const url = URL.createObjectURL(file);
        newPreviewUrls.push(url);
      });
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);

      // Update user data
      updateUserData({ photos: updatedPhotos });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleStartMatching = async () => {
    // Reset error state
    setMintingError(null);
    setMintingProgress(null);

    // Validate that user is connected
    if (!isConnected || !primaryWallet || !user) {
      setMintingError("Please connect your wallet first");
      return;
    }

    // Validate user data
    const validation = nftMintingService.validateUserData(userData);
    if (!validation.isValid) {
      setMintingError(`Please complete your profile: ${validation.errors.join(", ")}`);
      return;
    }

    // Check if user already has a profile
    try {
      const walletAddress = primaryWallet.address;
      const hasProfile = await nftMintingService.hasExistingProfile(walletAddress);
      
      if (hasProfile) {
        setMintingError("You already have a profile NFT");
        // Navigate to matching anyway since they have a profile
        navigate("/matching");
        return;
      }
    } catch (error) {
      console.error("Error checking existing profile:", error);
    }

    // Require at least one photo
    if (uploadedPhotos.length === 0) {
      setMintingError("Please upload at least one photo");
      return;
    }

    setIsMinting(true);

    try {
      // Update photos in context
      updateUserData({ photos: uploadedPhotos });

      // Get signer
      const signer = await getSigner();
      const walletAddress = await signer.getAddress();

      // Start NFT minting process
      const result = await nftMintingService.mintProfileNFT(
        userData,
        uploadedPhotos,
        walletAddress,
        signer,
        (progress) => {
          setMintingProgress(progress);
        }
      );

      if (result.success) {
        console.log("✅ Profile NFT minted successfully:", result);
        
        // Update user data with NFT info
        updateUserData({ 
          nftTokenId: result.tokenId,
          nftContractAddress: import.meta.env.VITE_PROFILE_NFT_CONTRACT_ADDRESS || '0x34d89a5471251ab8925cAa95eEd901335e7E93D7',
          transactionHash: result.transactionHash,
          metadataURI: result.metadataURI
        });

        // Navigate to matching screen after successful minting
        navigate("/matching");
      } else {
        throw new Error(result.error || "Failed to mint profile NFT");
      }
    } catch (error: any) {
      console.error("❌ Failed to mint profile NFT:", error);
      
      // Provide more specific error messages for common issues
      let errorMessage = "Failed to mint profile NFT";
      
      if (error?.code === 'PGRST205') {
        errorMessage = "Database not set up. Please create the profiles table in Supabase.";
      } else if (error?.message?.includes('profiles')) {
        errorMessage = "Database table missing. Please run the database schema in Supabase.";
      } else if (error?.message?.includes('wallet')) {
        errorMessage = "Wallet connection error. Please reconnect your wallet.";
      } else if (error?.message?.includes('IPFS')) {
        errorMessage = "Photo upload failed. Please check your internet connection.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setMintingError(errorMessage);
    } finally {
      setIsMinting(false);
    }
  };

  const handleBack = () => {
    navigate(backRoute);
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = uploadedPhotos.filter((_, i) => i !== index);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);

    setUploadedPhotos(updatedPhotos);
    setPreviewUrls(updatedPreviews);
    updateUserData({ photos: updatedPhotos });
  };

  return (
    <div className="w-full h-full bg-white flex flex-col relative max-w-sm mx-auto">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="absolute left-5 top-5 w-13 h-13 rounded-[15px] border border-lovefi-border bg-white flex items-center justify-center z-10"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-lovefi-purple"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.2071 18.7071C14.8166 19.0976 14.1834 19.0976 13.7929 18.7071L7.79289 12.7071C7.40237 12.3166 7.40237 11.6834 7.79289 11.2929L13.7929 5.29289C14.1834 4.90237 14.8166 4.90237 15.2071 5.29289C15.5976 5.68342 15.5976 6.31658 15.2071 6.70711L9.91421 12L15.2071 17.2929C15.5976 17.6834 15.5976 18.3166 15.2071 18.7071Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {/* Title */}
      <div className="pt-20 px-5 pb-6">
        <h1 className="text-lg font-normal leading-[150%] text-black font-[Alata]">
          You're almost done!{"\n"}
          Finally, please upload photo(s) you want your{" "}
          <span className="text-lovefi-purple">true love</span> to see!
        </h1>
      </div>

      {/* Upload area */}
      <div className="flex-1 px-[26px] py-4">
        <div
          onClick={handleUploadClick}
          className="w-full h-[439px] rounded-[10px] border border-dashed border-[#8B5DE8] bg-transparent flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
        >
          {previewUrls.length > 0 ? (
            <div className="w-full h-full grid grid-cols-2 gap-2 p-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(index);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <div className="text-sm mb-4">Click to upload photos</div>
              <div className="text-xs">Support multiple photo selection</div>
            </div>
          )}
        </div>

        {/* Camera button positioned as in Figma */}
        <button
          onClick={handleUploadClick}
          className="absolute right-[42px] bottom-[191px] w-[34px] h-[34px] rounded-full bg-lovefi-purple border-2 border-white flex items-center justify-center"
        >
          <svg
            width="16"
            height="14"
            viewBox="0 0 16 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8 6.14539C7.48 6.14539 6.992 6.33962 6.616 6.70477C6.248 7.06215 6.048 7.53607 6.056 8.02553V8.0333C6.056 8.53829 6.256 9.01221 6.624 9.36959C6.992 9.72697 7.48 9.9212 8 9.9212C9.072 9.9212 9.936 9.07436 9.944 8.0333C9.944 7.5283 9.744 7.05438 9.376 6.697C9.008 6.33962 8.52 6.14539 8 6.14539ZM12.488 6.19978C12.088 6.19978 11.768 5.88901 11.768 5.50056C11.768 5.1121 12.088 4.79356 12.488 4.79356C12.888 4.79356 13.216 5.1121 13.216 5.50056C13.216 5.88901 12.888 6.19978 12.488 6.19978ZM10.216 10.1931C9.648 10.7447 8.864 11.0866 8 11.0866C7.16 11.0866 6.376 10.768 5.776 10.1931C5.184 9.61043 4.856 8.84906 4.856 8.0333C4.848 7.22531 5.176 6.46393 5.768 5.88124C6.368 5.29856 7.16 4.98002 8 4.98002C8.84 4.98002 9.632 5.29856 10.224 5.87347C10.816 6.45616 11.144 7.22531 11.144 8.0333C11.136 8.88013 10.784 9.64151 10.216 10.1931ZM12.512 2.61043C12.44 2.61043 12.384 2.57159 12.352 2.5172L12.272 2.34628C12.056 1.90344 11.808 1.39068 11.656 1.09545C11.288 0.396226 10.656 0.00776915 9.88 0H6.112C5.336 0.00776915 4.712 0.396226 4.344 1.09545C4.184 1.40622 3.912 1.96559 3.688 2.42397L3.64 2.5172C3.616 2.57936 3.552 2.61043 3.488 2.61043C1.56 2.61043 0 4.13319 0 5.99778V10.6127C0 12.4772 1.56 14 3.488 14H12.512C14.432 14 16 12.4772 16 10.6127V5.99778C16 4.13319 14.432 2.61043 12.512 2.61043Z"
              fill="white"
            />
          </svg>
        </button>
      </div>

      {/* Hidden file input */}
      <input
        id="photo-upload"
        name="photoUpload"
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error display */}
      {mintingError && (
        <div className="px-5 pb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm font-[Alata]">{mintingError}</p>
          </div>
        </div>
      )}

      {/* Progress display */}
      {mintingProgress && (
        <div className="px-5 pb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-800 text-sm font-[Alata]">{mintingProgress.message}</p>
              <span className="text-blue-600 text-xs font-[Alata]">{Math.round(mintingProgress.progress)}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${mintingProgress.progress}%` }}
              />
            </div>
            {mintingProgress.step === 'minting_nft' && (
              <p className="text-blue-600 text-xs font-[Alata] mt-2">
                This may take a few minutes. Please don't close this window.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Start matching button */}
      <div className="p-5 pt-6">
        <button
          onClick={handleStartMatching}
          disabled={isMinting}
          className={`w-full h-14 rounded-[15px] flex items-center justify-center transition-all duration-200 ${
            isMinting 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-lovefi-purple hover:opacity-90"
          }`}
        >
          {isMinting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              <span className="text-white text-base font-normal leading-[150%] font-[Alata]">
                {mintingProgress?.step === 'uploading_images' && 'Uploading photos...'}
                {mintingProgress?.step === 'creating_metadata' && 'Creating metadata...'}
                {mintingProgress?.step === 'uploading_metadata' && 'Uploading to IPFS...'}
                {mintingProgress?.step === 'saving_to_db' && 'Saving profile...'}
                {mintingProgress?.step === 'minting_nft' && 'Minting NFT...'}
                {mintingProgress?.step === 'completed' && 'Complete! 🎉'}
                {!mintingProgress?.step && 'Processing...'}
              </span>
            </div>
          ) : (
            <span className="text-white text-base font-normal leading-[150%] font-[Alata]">
              Start matching!
            </span>
          )}
        </button>
        
        {!isMinting && (
          <p className="text-xs text-gray-500 text-center mt-3 font-[Alata]">
            This will create your Profile NFT on the blockchain
          </p>
        )}
      </div>
    </div>
  );
}
