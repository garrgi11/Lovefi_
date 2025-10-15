import { RequestHandler } from "express";
import { saveUserProfile } from "../data/userProfiles";

export interface SaveProfileRequest {
  userData: any;
}

export interface SaveProfileResponse {
  success: boolean;
  message: string;
  profileId?: string;
  error?: string;
}

export const handleSaveProfile: RequestHandler = (req, res) => {
  try {
    const { userData } = req.body as SaveProfileRequest;

    if (!userData) {
      const response: SaveProfileResponse = {
        success: false,
        message: "User data is required",
        error: "Missing userData in request body",
      };
      return res.status(400).json(response);
    }

    // Save the profile data
    const savedProfile = saveUserProfile(userData);

    const response: SaveProfileResponse = {
      success: true,
      message: "User profile saved successfully",
      profileId: savedProfile.id,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error saving user profile:", error);

    const response: SaveProfileResponse = {
      success: false,
      message: "Failed to save user profile",
      error: error instanceof Error ? error.message : "Unknown error",
    };

    res.status(500).json(response);
  }
};
