"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    // Initialize SDK and PassKeyManager only in browser environment
    if (typeof window !== "undefined") {
      initializeAuth();
    }
  }, []);

  const initializeAuth = async () => {
    try {
      setSdk(
        new CoinAuth(
          process.env.NODE_ENV === "development"
            ? "https://coinauth-local.arvin-993.workers.dev"
            : "https://auth.coin.fi",
          "https://auth-verifier.coin.ga", 
          process.env.NEXT_PUBLIC_VERIFIER_SECRET!,
        )
      );
      setAuthState((prev) => ({ ...prev, isInitialized: true }));
    } catch (err) {
      console.error("Failed to initialize authentication:", err);
      setAuthState((prev) => ({
        ...prev,
        error: "Failed to initialize authentication",
        isInitialized: false,
      }));
    }
  };

  const resetAuthState = () => {
    setAuthState({
      isInitialized: true,
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
  };

  const setNewPassword = (newPassword: string) => {
    setPassword(newPassword);
  };

  const setNewDirections = (newDirections: string) => {
    setDirections(newDirections);
  };

  async function createAuthWallet(newDirections: string) {
    if (!sdk) {
      throw new Error("CoinAuth SDK not initialized");
    }

    try {
      setAuthState((prev) => ({
        ...prev,
        isCreatingWallet: true,
        error: null,
      }));

      // Create a new random wallet
      const wallet = Wallet.createRandom();

      // Store the private key and directions
      setPrivateKey(wallet.privateKey);
      setDirections(newDirections);

      // Create passkey with proper error handling
      try {

        // Start auth only if passkey creation was successful
        await sdk.newCoinAuth({
          password: password,
          legend: newDirections.toUpperCase(),
          privateKey: wallet.privateKey,
          salt: process.env.NEXT_PUBLIC_PASSKEY_ENC_SALT,
        });

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
      } catch (err) {
        // Handle passkey creation errors
        if (err instanceof Error) {
          if (err.message.includes("The operation was aborted")) {
            throw new Error("Passkey creation was cancelled");
          }
          throw err;
        }
        throw new Error("Failed to create passkey");
      }
    } catch (error) {
      console.error("Failed to create wallet:", error);
      setAuthState((prev) => ({
        ...prev,
        isCreatingWallet: false,
        walletCreated: false,
        error:
          error instanceof Error ? error.message : "Failed to create wallet",
      }));
      throw error;
    }
  }

  async function getAuthRound() {
    if ( !sdk ) {
      throw new Error("CoinAuth SDK not initialized");
    }
    try {
      setAuthState((prev) => ({
        ...prev,
        isAuthenticating: true,
        error: null,
      }));

      try {

        const newAuthRound = await sdk.coinAuth(process.env.NEXT_PUBLIC_PASSKEY_ENC_SALT!);
        return { newAuthRound: newAuthRound.authState, sdk };
      } catch (err) {
        // Handle passkey authentication errors
        if (err instanceof Error) {
          if (err.message.includes("The operation was aborted")) {
            throw new Error("Passkey authentication was cancelled");
          }
          throw err;
        }
        throw new Error("Failed to authenticate passkey");
      }
    } catch (error) {
      console.error("Authentication failed:", error);
      setAuthState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Authentication failed",
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
  };
}
