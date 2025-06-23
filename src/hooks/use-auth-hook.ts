"use client";

import { useState, useEffect, useCallback } from "react";
import { Wallet } from "ethers";
import { CoinAuth } from "c1ph3r_c01n";
// import { resolve } from "path/win32";

type AuthState = {
  isInitialized: boolean;
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  isCreatingWallet: boolean;
  walletCreated: boolean;
  error: string | null;
};

export function useAuthHook() {
  const [password, setPassword] = useState("test");
  const [privateKey, setPrivateKey] = useState("");
  const [directions, setDirections] = useState("");
  const [rounds, setRounds] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [sdk, setSdk] = useState<CoinAuth | null>(null);

  const [authState, setAuthState] = useState<AuthState>({
    isInitialized: false,
    isAuthenticating: false,
    isAuthenticated: false,
    isCreatingWallet: false,
    walletCreated: false,
    error: null,
  });

  // Lazy initialization function - only call when needed
  const initializeAuth = useCallback(async () => {
    if (sdk) return sdk; // Return existing SDK if already initialized
    
    try {
      const newSdk = new CoinAuth(
        process.env.NODE_ENV === "development"
          ? "https://coinauth-local.arvin-993.workers.dev"
          : "https://auth.coin.fi",
        "https://auth-verifier.coin.ga", 
        process.env.NEXT_PUBLIC_VERIFIER_SECRET!,
      );
      
      setSdk(newSdk);
      setAuthState((prev) => ({ ...prev, isInitialized: true }));
      return newSdk;
    } catch (err) {
      console.error("Failed to initialize authentication:", err);
      setAuthState((prev) => ({
        ...prev,
        error: "Failed to initialize authentication",
        isInitialized: false,
      }));
      throw err;
    }
  }, [sdk]);

  const resetAuthState = () => {
    setAuthState({
      isInitialized: false, // Reset initialization state
      isAuthenticating: false,
      isAuthenticated: false,
      isCreatingWallet: false,
      walletCreated: false,
      error: null,
    });
    setRounds(undefined);
    setPrivateKey("");
    setDirections("");
    setPassword("test");
    setSdk(null); // Clear SDK to force re-initialization
  };

  const setNewPassword = (newPassword: string) => {
    setPassword(newPassword);
  };

  const setNewDirections = (newDirections: string) => {
    setDirections(newDirections);
  };

  async function createAuthWallet(newDirections: string) {
    console.log("createAuthWallet: Starting wallet creation");
    
    setAuthState((prev) => ({
      ...prev,
      isCreatingWallet: true,
      error: null,
      walletCreated: false, // Explicitly set to false
    }));

    try {
      // Initialize SDK only when needed
      const currentSdk = await initializeAuth();
      
      // Create a new random wallet
      const wallet = Wallet.createRandom();

      // Store the private key and directions
      setPrivateKey(wallet.privateKey);
      setDirections(newDirections);

      console.log("createAuthWallet: About to call SDK newCoinAuth");
      
      // Create passkey with proper error handling
      const result = await currentSdk.newCoinAuth({
        password: password,
        legend: newDirections.toUpperCase(),
        privateKey: wallet.privateKey,
        salt: process.env.NEXT_PUBLIC_PASSKEY_ENC_SALT,
      });

      console.log("createAuthWallet: SDK newCoinAuth result:", result);

      // Check if the SDK operation actually succeeded
      if (!result.success) {
        console.log("createAuthWallet: SDK operation failed, throwing error");
        throw new Error(result.error || "Passkey creation failed");
      }

      console.log("createAuthWallet: SDK operation succeeded, setting success state");

      setAuthState((prev) => ({
        ...prev,
        isCreatingWallet: false,
        walletCreated: true,
        error: null,
      }));

      return {
        success: true,
        address: wallet.address,
        privateKey: wallet.privateKey,
      };
    } catch (error) {
      console.error("createAuthWallet: Error caught:", error);
      
      // Check for various cancellation scenarios
      let errorMessage = "Failed to create wallet";
      if (error instanceof Error) {
        console.log("createAuthWallet: Error name:", error.name, "Message:", error.message);
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes("aborted") || 
            errorMsg.includes("cancelled") || 
            errorMsg.includes("canceled") ||
            errorMsg.includes("user cancelled") ||
            errorMsg.includes("operation cancelled") ||
            errorMsg.includes("notallowederror") ||
            errorMsg.includes("not allowed") ||
            error.name === "NotAllowedError" ||
            error.name === "AbortError") {
          errorMessage = "Passkey creation was cancelled by user";
        } else {
          errorMessage = error.message;
        }
      }
      
      console.log("createAuthWallet: Setting error state:", errorMessage);
      
      setAuthState((prev) => ({
        ...prev,
        isCreatingWallet: false,
        walletCreated: false,
        error: errorMessage,
      }));
      
      console.log("createAuthWallet: About to throw error");
      throw error;
    }
  }

  async function getAuthRound() {
    try {
      // Initialize SDK only when needed
      const currentSdk = await initializeAuth();
      
      // Direct call without nested try-catch for better performance
      const newAuthRound = await currentSdk.coinAuth(process.env.NEXT_PUBLIC_PASSKEY_ENC_SALT!);
      
      // Set final success state
      setAuthState((prev) => ({
        ...prev,
        isAuthenticating: false,
        isAuthenticated: true,
        error: null,
      }));
      
      return { newAuthRound: newAuthRound.authState, sdk: currentSdk };
      
    } catch (error) {
      console.error("Authentication failed:", error);
      
      let errorMessage = "Authentication failed";
      if (error instanceof Error) {
        if (error.message.includes("aborted") || 
            error.message.includes("cancelled") || 
            error.name === "NotAllowedError" ||
            error.name === "AbortError") {
          errorMessage = "Passkey authentication was cancelled";
        } else {
          errorMessage = error.message;
        }
      }
      
      setAuthState((prev) => ({
        ...prev,
        error: errorMessage,
        isAuthenticating: false,
        isAuthenticated: false,
      }));
      
      throw error;
    }
  }

  async function resolveCurrentRound(
    newSdk: CoinAuth,
    currentRoundSolution: string,
  ) {
    const sdkRoundSolution =
      await newSdk.solveCurrentRound(currentRoundSolution.toUpperCase());

    if (sdkRoundSolution.verificationResponse === null) {
      const nextRound = await newSdk.getCurrentRound();
      if (!nextRound) {
        throw new Error("No next round available");
      }
      return nextRound;
    } else {
      return sdkRoundSolution;
    }
  }

  return {
    password,
    privateKey,
    directions,
    rounds,
    isLoading,
    authState,
    setNewPassword,
    setNewDirections,
    createAuthWallet,
    getAuthRound,
    resolveCurrentRound,
    setIsLoading,
    resetAuthState,
    initializeAuth, // Export for manual initialization if needed
  };
}
