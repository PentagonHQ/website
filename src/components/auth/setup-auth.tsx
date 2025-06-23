"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthHook } from "@/src/hooks/use-auth-hook";
import { usePasswordValidation } from "@/src/hooks/use-pw-validation";
import { COLORS } from "@/src/constants/auth";

import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/ui/dialog";
import { CheckCircle, ArrowUp, ArrowDown, ArrowRight, ArrowLeft, XCircle } from "lucide-react";

// Add keyboard mapping constant
const KEYBOARD_TO_DIRECTION = {
  'ArrowUp': 'UP',
  'ArrowDown': 'DOWN',
  'ArrowLeft': 'LEFT',
  'ArrowRight': 'RIGHT',
  'KeyW': 'UP',
  'KeyS': 'DOWN',
  'KeyA': 'LEFT',
  'KeyD': 'RIGHT'
} as const;

interface ColorBearing {
  color: keyof typeof COLORS;
  direction: string;
}

interface SetupAuthProps {
  isVisible?: boolean;
}

export default function SetupAuth({ isVisible = true }: SetupAuthProps) {
  const { password, error: passwordError, setError, handlePasswordChange, validatePassword, validatePasswordLength } = usePasswordValidation();
  const [colorBearings, setColorBearings] = useState<ColorBearing[]>([]);
  const [step, setStep] = useState<"password" | "mapping" | "review">("password");
  const [activeColor, setActiveColor] = useState<keyof typeof COLORS | null>(null);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  const { setNewPassword, createAuthWallet, authState, resetAuthState } = useAuthHook();
  const [showWalletExistsDialog, setShowWalletExistsDialog] = useState(false);
  const [dialogState, setDialogState] = useState<'loading' | 'success' | 'error' | null>(null);

  // Reset auth state when component unmounts
  useEffect(() => {
    return () => {
      resetAuthState();
    };
  }, []);

  // Check for existing wallet
  useEffect(() => {
    const checkExistingWallet = () => {
      const hasCredentials = !!(
        localStorage.getItem("c1ph3r_encrypted_directions") &&
        localStorage.getItem("c1ph3r_encrypted_password")
      );
      if (hasCredentials) {
        setShowWalletExistsDialog(true);
      }
    };

    checkExistingWallet();
  }, []);

  // Handle auth state changes for dialog
  useEffect(() => {
    if (authState.isCreatingWallet) {
      setDialogState('loading');
    } else if (authState.walletCreated && !authState.error) {
      setDialogState('success');
      // Auto-proceed to working auth immediately after brief success display
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent("authSetupComplete"));
      }, 1500); // Reduced from 2000ms to 1500ms
      return () => clearTimeout(timer);
    } else if (authState.error) {
      setDialogState('error');
    } else {
      setDialogState(null);
    }
  }, [authState.isCreatingWallet, authState.walletCreated, authState.error]);

  const handleContinueWithExisting = () => {
    // Emit custom event to transition to working auth
    window.dispatchEvent(new CustomEvent("authSetupComplete"));
  };

  const handleCreateNewWallet = () => {
    // Clear existing credentials
    localStorage.removeItem("c1ph3r_encrypted_directions");
    localStorage.removeItem("c1ph3r_encrypted_password");
    localStorage.removeItem("encrypted_wallet_data");
    setShowWalletExistsDialog(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password format first
    if (!validatePassword(password)) {
      setError("Password can only contain letters (A-Z), numbers (0-9), and special characters (@, #, $, %)");
      return;
    }

    // Then validate length
    if (!validatePasswordLength()) {
      return;
    }

    setNewPassword(password);
    setStep("mapping");
    setCurrentColorIndex(0);
    setActiveColor("Red"); // Auto-select Red when entering mapping step
  };

  const handleDirectionAssignment = (
    color: keyof typeof COLORS,
    direction: string,
  ) => {
    const newColorBearings = colorBearings.filter((cb) => cb.color !== color);
    newColorBearings.push({ color, direction });
    setColorBearings(newColorBearings);
    
    // Move to next color or review step
    const colors = Object.keys(COLORS) as (keyof typeof COLORS)[];
    const nextIndex = currentColorIndex + 1;
    
    if (nextIndex < colors.length) {
      setCurrentColorIndex(nextIndex);
      setActiveColor(colors[nextIndex]);
    } else {
      setStep("review");
      setActiveColor(null);
    }
  };

  const handleSetupComplete = async () => {
    if (colorBearings.length !== 4) return;

    const orderedColors: (keyof typeof COLORS)[] = ["Red", "Green", "Blue", "Yellow"];
    const orderedDirections = orderedColors
      .map(color => colorBearings.find(cb => cb.color === color)?.direction)
      .filter((direction): direction is string => direction !== undefined);

    const directions = orderedDirections.map(direction => direction[0].toLowerCase()).join("");

    console.log("handleSetupComplete: Starting wallet creation with directions:", directions);
    
    try {
      const result = await createAuthWallet(directions);
      console.log("handleSetupComplete: Wallet creation completed successfully", result);
    } catch (err) {
      // Error handling is managed by the authState
      console.error("handleSetupComplete: Setup failed:", err);
      
      // Wait a bit for state to update
      setTimeout(() => {
        console.log("handleSetupComplete: Current auth state after error:", authState);
      }, 100);
      
      // Don't proceed if there was an error
      return;
    }
  };

  const handleRetry = () => {
    resetAuthState();
    setDialogState(null);
    // Keep the mappings and stay on review step if mappings exist
    if (colorBearings.length === 4) {
      setStep("review");
    } else {
      // Only reset if mappings are incomplete
      setColorBearings([]);
      setCurrentColorIndex(0);
      setActiveColor(Object.keys(COLORS)[0] as keyof typeof COLORS);
      setStep("mapping");
    }
  };

  // Add handleReassign function after handleRetry
  const handleReassign = () => {
    setColorBearings([]);
    setCurrentColorIndex(0);
    setActiveColor(Object.keys(COLORS)[0] as keyof typeof COLORS);
    setStep("mapping");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard events when in mapping step with active color
      if (step !== "mapping" || !activeColor) return;

      const direction = KEYBOARD_TO_DIRECTION[e.code as keyof typeof KEYBOARD_TO_DIRECTION];
      if (!direction) return;

      if (colorBearings.some((cb) => cb.direction === direction)) {
        return; // Direction already used
      }

      // Only prevent default if we're actually handling the key
      e.preventDefault();
      e.stopPropagation();

      handleDirectionAssignment(activeColor, direction);
    };

    // Only add event listener when in mapping step with active color
    if (step === "mapping" && activeColor) {
      window.addEventListener("keydown", handleKeyDown);
    }
    
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, activeColor, colorBearings, currentColorIndex]);

  // Also add an effect to set Red as active color when mapping step is loaded
  useEffect(() => {
    if (step === "mapping" && !activeColor && colorBearings.length === 0) {
      setActiveColor("Red");
    }
  }, [step, activeColor, colorBearings.length]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {showWalletExistsDialog && isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-2xl mx-auto"
        >
          <div className="bg-black/80 rounded-lg p-8 backdrop-blur-sm">
            <div className="space-y-6 text-center mb-8">
              <h1 className="text-white text-3xl font-bold">
                Existing Wallet Detected
              </h1>
              <p className="text-white/70 text-lg leading-relaxed">
                You already have a wallet setup with custom credentials. What would you like to do?
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleContinueWithExisting}
                className="w-full bg-white/10 text-white hover:bg-white/20 text-lg px-8 py-6"
              >
                Continue with Existing
              </Button>
              <Button
                onClick={handleCreateNewWallet}
                className="w-full bg-red-400/10 text-red-400 hover:bg-red-400/20 text-lg px-8 py-6"
              >
                Create New Wallet
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {step === "password" && !showWalletExistsDialog && isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl mx-auto"
          >
            <div className="bg-black/80 rounded-lg p-2 backdrop-blur-sm">
              <div className="space-y-6 text-center mb-8">
                <h1 className="text-white text-2xl font-bold">
                  Create Your Password
                </h1>
                <p className="text-white/70 text-md leading-relaxed">
                  Enter a password that will be used for authentication.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="w-full space-y-6">
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Enter using (A-Z, 0-9, @#$%)"
                  />
                  {passwordError && (
                    <p className="mt-2 text-red-400 text-sm">{passwordError}</p>
                  )}
                  <p className="mt-4 text-white/50 text-sm">
                    Minimum 4-10 characters long and can contain uppercase letters, numbers, and special characters (!, @, #, $)
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={!password}
                  variant="default"
                  className="w-full text-lg px-8 py-6"
                >
                  Continue
                </Button>
              </form>
            </div>
          </motion.div>
        )}

        {step === "mapping" && isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl mx-auto"
          >
            <div className="bg-black/80 rounded-lg p-4 sm:p-8 backdrop-blur-sm">
              <div className="space-y-3 sm:space-y-4 w-full text-center mb-8">
                <h1 className="text-white text-2xl sm:text-3xl font-bold">
                  Map Colors to Directions
                </h1>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed">
                  Press an arrow key or WASD to assign a direction to {String(activeColor)}
                </p>
                <p className="text-white/50 text-sm">
                  Step {currentColorIndex + 1} of 4
                </p>
              </div>

              {/* Single Large Color Box */}
              <div className="flex justify-center mb-8">
                {activeColor && (
                  <motion.div
                    key={`${activeColor}-${currentColorIndex}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-sm rounded-lg relative p-8"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      borderWidth: 3,
                      borderStyle: 'solid',
                      borderColor: COLORS[activeColor]
                    }}
                  >
                    <div className="text-4xl sm:text-5xl font-bold mb-8 text-center" style={{ color: COLORS[activeColor] }}>
                      {String(activeColor)}
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      {/* Show arrow buttons for active color */}
                      <div className="grid grid-cols-3 gap-3 w-full max-w-[200px] mx-auto">
                        {[
                          { direction: "UP", col: "col-start-2", row: "" },
                          { direction: "LEFT", col: "col-start-1", row: "row-start-2" },
                          { direction: "RIGHT", col: "col-start-3", row: "row-start-2" },
                          { direction: "DOWN", col: "col-start-2", row: "row-start-3" },
                        ].map(({ direction, col, row }) => {
                          const isDirectionTaken = colorBearings.some(cb => cb.direction === direction);
                          return (
                            <div
                              key={direction}
                              className={`${col} ${row}`}
                            >
                              <Button
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isDirectionTaken) {
                                    handleDirectionAssignment(activeColor, direction);
                                  }
                                }}
                                disabled={isDirectionTaken}
                                className={`w-full aspect-square p-0 text-2xl ${!isDirectionTaken ? 'hover:bg-white/10' : 'opacity-50'}`}
                                style={{
                                  backgroundColor: "transparent",
                                  color: COLORS[activeColor],
                                  borderColor: COLORS[activeColor],
                                }}
                              >
                                {direction === "UP" && <ArrowUp className="h-8 w-8" />}
                                {direction === "DOWN" && <ArrowDown className="h-8 w-8" />}
                                {direction === "LEFT" && <ArrowLeft className="h-8 w-8" />}
                                {direction === "RIGHT" && <ArrowRight className="h-8 w-8" />}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {step === "review" && isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl mx-auto"
          >
            <div className="bg-black/80 rounded-lg p-4 sm:p-8 backdrop-blur-sm">
              <div className="space-y-3 sm:space-y-4 w-full text-center mb-8">
                <h1 className="text-white text-2xl sm:text-3xl font-bold">
                  Review Your Mappings
                </h1>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed">
                  Confirm your color-to-direction assignments
                </p>
              </div>

              {/* Review Color Mappings - Directional Layout */}
              <div className="w-full max-w-sm mx-auto mb-8">
                <div className="grid grid-cols-3 grid-rows-3 gap-4 w-full h-80">
                  {/* Create 3x3 grid with specific positioning */}
                  {[...Array(9)].map((_, index) => {
                    const row = Math.floor(index / 3);
                    const col = index % 3;
                    
                    // Find color for this position
                    let bearing = null;
                    if (row === 0 && col === 1) { // Top center - UP
                      bearing = colorBearings.find(cb => cb.direction === 'UP');
                    } else if (row === 1 && col === 0) { // Middle left - LEFT
                      bearing = colorBearings.find(cb => cb.direction === 'LEFT');
                    } else if (row === 1 && col === 2) { // Middle right - RIGHT
                      bearing = colorBearings.find(cb => cb.direction === 'RIGHT');
                    } else if (row === 2 && col === 1) { // Bottom center - DOWN
                      bearing = colorBearings.find(cb => cb.direction === 'DOWN');
                    }
                    
                    // Center position (row 1, col 1)
                    if (row === 1 && col === 1) {
                      return (
                        <div key={index} className="flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-white/30 border border-white/50"></div>
                        </div>
                      );
                    }
                    
                    // Empty positions
                    if (!bearing) {
                      return <div key={index} className="w-full h-full"></div>;
                    }
                    
                    // Color bearing positions
                    return (
                      <motion.div
                        key={String(bearing.color)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: Object.keys(COLORS).indexOf(bearing.color) * 0.1 }}
                        className="rounded-none p-3 w-full h-full flex flex-col items-center justify-center"
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          borderWidth: 2,
                          borderStyle: 'solid',
                          borderColor: COLORS[bearing.color]
                        }}
                      >
                        <div className="text-sm font-bold mb-2 text-center" style={{ color: COLORS[bearing.color] }}>
                          {String(bearing.color)}
                        </div>
                        <div className="rounded-full border-2 p-1" style={{ borderColor: COLORS[bearing.color] }}>
                          {bearing.direction === "UP" && (
                            <ArrowUp className="h-4 w-4" style={{ color: COLORS[bearing.color] }} />
                          )}
                          {bearing.direction === "DOWN" && (
                            <ArrowDown className="h-4 w-4" style={{ color: COLORS[bearing.color] }} />
                          )}
                          {bearing.direction === "LEFT" && (
                            <ArrowLeft className="h-4 w-4" style={{ color: COLORS[bearing.color] }} />
                          )}
                          {bearing.direction === "RIGHT" && (
                            <ArrowRight className="h-4 w-4" style={{ color: COLORS[bearing.color] }} />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleSetupComplete}
                  variant="default"
                  className="flex-1 rounded-none px-6 py-4"
                >
                  Complete Setup
                </Button>
                <Button
                  onClick={handleReassign}
                  variant="destructive"
                  className="flex-1 rounded-none px-6 py-4"
                >
                  Start Over
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Universal Dialog for Loading, Success, and Error */}
      <Dialog open={dialogState !== null} onOpenChange={() => {}}>
        <DialogContent className="bg-black/90 border-white/20 max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogTitle className="sr-only">
            {dialogState === 'loading' && 'Creating Account'}
            {dialogState === 'success' && 'Setup Complete'}
            {dialogState === 'error' && 'Setup Failed'}
          </DialogTitle>
          
          <div className="flex flex-col items-center space-y-6 text-center p-6">
            {/* Loading State */}
            {dialogState === 'loading' && (
              <>
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
                <div className="space-y-2">
                  <DialogTitle className="text-white text-xl font-bold">Creating Account</DialogTitle>
                  <DialogDescription className="text-white/70 text-sm">
                    Please complete the passkey authentication to create your secure wallet.
                  </DialogDescription>
                </div>
                <DialogFooter className="w-full">
                  <Button
                    onClick={() => {
                      resetAuthState();
                      setDialogState(null);
                      // Return to review step to preserve mappings
                      setStep("review");
                      setActiveColor(null);
                    }}
                    variant="default"
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </>
            )}

            {/* Success State */}
            {dialogState === 'success' && (
              <>
                <CheckCircle className="w-16 h-16 text-white" />
                <div className="space-y-2">
                  <DialogTitle className="text-white text-xl font-bold">Setup Complete!</DialogTitle>
                  <DialogDescription className="text-white/70 text-sm">
                    Your authentication pattern has been securely saved. Starting authentication challenge...
                  </DialogDescription>
                </div>
              </>
            )}

            {/* Error State */}
            {dialogState === 'error' && (
              <>
                <XCircle className="w-16 h-16 text-red-400" />
                <div className="space-y-2">
                  <DialogTitle className="text-red-400 text-xl font-bold">Setup Failed</DialogTitle>
                  <DialogDescription className="text-red-400/70 text-sm">
                    {authState.error}
                  </DialogDescription>
                </div>
                <DialogFooter className="w-full">
                  <Button
                    onClick={handleRetry}
                    className="w-full bg-red-400/10 text-red-400 hover:bg-red-400/20"
                  >
                    Try Again
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}