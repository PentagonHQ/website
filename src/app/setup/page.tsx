"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthHook } from "@/src/hooks/use-auth-hook";
import { usePasswordValidation } from "@/src/hooks/use-pw-validation";
import { COLORS } from "@/src/constants/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/ui/dialog";
import { Button } from "@/ui/button";
import { CheckCircle, ArrowUp, ArrowDown, ArrowRight, ArrowLeft, XCircle } from "lucide-react";
import { VisuallyHidden } from "@/src/components/ui/visually-hidden";

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

export default function SetupPage() {
  const { password, error: passwordError, setError, handlePasswordChange, validatePassword, validatePasswordLength } = usePasswordValidation();
  const [colorBearings, setColorBearings] = useState<ColorBearing[]>([]);
  const [step, setStep] = useState<"password" | "mapping">("password");
  const [activeColor, setActiveColor] = useState<keyof typeof COLORS | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { setNewPassword, createAuthWallet, authState, resetAuthState } = useAuthHook();
  const [showWalletExistsDialog, setShowWalletExistsDialog] = useState(false);
  const router = useRouter();

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

  // Handle wallet creation success
  useEffect(() => {
    if (authState.walletCreated) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        router.push("/dashboard/authenticate");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [authState.walletCreated, router]);

  const handleContinueWithExisting = () => {
    router.push("/dashboard/authenticate");
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
    setActiveColor("Red"); // Auto-select Red when entering mapping step
  };

  const handleDirectionAssignment = (
    color: keyof typeof COLORS,
    direction: string,
  ) => {
    const newColorBearings = colorBearings.filter((cb) => cb.color !== color);
    newColorBearings.push({ color, direction });
    setColorBearings(newColorBearings);
  };

  const handleSetupComplete = async () => {
    if (colorBearings.length !== 4) return;

    const orderedColors: (keyof typeof COLORS)[] = ["Red", "Green", "Blue", "Yellow"];
    const orderedDirections = orderedColors
      .map(color => colorBearings.find(cb => cb.color === color)?.direction)
      .filter((direction): direction is string => direction !== undefined);

    const directions = orderedDirections.map(direction => direction[0].toLowerCase()).join("");

    try {
      await createAuthWallet(directions);
      // Only show success and redirect if wallet was actually created
      if (authState.walletCreated) {
        setShowSuccess(true);
        const timer = setTimeout(() => {
          router.push("/dashboard/authenticate");
        }, 2000);
        return () => clearTimeout(timer);
      }
    } catch (err) {
      // Error is handled by authState
      console.error("Setup failed:", err);
      // Don't reset if it was a cancellation
      if (!(err instanceof Error && err.message.includes("cancelled"))) {
        handleRetry();
      }
    }
  };

  const handleRetry = () => {
    // Only reset if there's an error that's not a cancellation
    if (authState.error && !authState.error.includes("cancelled")) {
      resetAuthState();
      setColorBearings([]);
      setActiveColor(Object.keys(COLORS)[0] as keyof typeof COLORS);
    }
  };

  // Add handleReassign function after handleRetry
  const handleReassign = () => {
    setColorBearings([]);
    setActiveColor(Object.keys(COLORS)[0] as keyof typeof COLORS);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (step !== "mapping" || !activeColor) return;

      const direction = KEYBOARD_TO_DIRECTION[e.code as keyof typeof KEYBOARD_TO_DIRECTION];
      if (!direction) return;

      if (colorBearings.some((cb) => cb.direction === direction && cb.color !== activeColor)) {
        return;
      }

      handleDirectionAssignment(activeColor, direction);

      const colors = Object.keys(COLORS) as (keyof typeof COLORS)[];
      const nextUnassigned = colors.find(
        (c) => !colorBearings.some((cb) => cb.color === c) && c !== activeColor,
      );
      setActiveColor(nextUnassigned ?? null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, activeColor, colorBearings]);

  // Also add an effect to set Red as active color when mapping step is loaded
  useEffect(() => {
    if (step === "mapping" && !activeColor && colorBearings.length === 0) {
      setActiveColor("Red");
    }
  }, [step, activeColor, colorBearings.length]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobius-themed background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        <Dialog open={showWalletExistsDialog} onOpenChange={setShowWalletExistsDialog}>
          <DialogContent className="border-emerald-400/20 bg-black/80 w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col justify-between items-center p-4 sm:p-8 rounded-lg">
            <DialogHeader className="space-y-6">
              <DialogTitle className="text-center text-emerald-400 text-3xl font-bold">
                Existing Wallet Detected
              </DialogTitle>
              <DialogDescription className="text-center text-emerald-400/70 text-lg leading-relaxed">
                You already have a wallet setup with custom credentials. What would you like to do?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-8 w-full flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleContinueWithExisting}
                className="w-full bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 text-lg px-8 py-6"
              >
                Continue with Existing
              </Button>
              <Button
                onClick={handleCreateNewWallet}
                className="w-full bg-red-400/10 text-red-400 hover:bg-red-400/20 text-lg px-8 py-6"
              >
                Create New Wallet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AnimatePresence mode="wait">
          {step === "password" && !showWalletExistsDialog && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md"
            >
              <Dialog open={true} onOpenChange={() => {}}>
                <DialogContent className="border-emerald-400/20 bg-black/80 w-[90%] max-w-2xl min-h-[250px] flex flex-col justify-between items-center p-8 rounded-lg">
                  <DialogHeader className="space-y-6">
                    <DialogTitle className="text-center text-emerald-400 text-3xl font-bold">
                      Create Your Password
                    </DialogTitle>
                    <DialogDescription className="text-center text-emerald-400/70 text-lg leading-relaxed">
                      Enter a password that will be used for authentication.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handlePasswordSubmit} className="w-full space-y-6">
                    <div>
                      <input
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 rounded-lg bg-black/40 border border-emerald-400/20 text-emerald-400 placeholder-emerald-400/50 focus:outline-none focus:border-emerald-400/50"
                        placeholder="Enter your password (A-Z, 0-9, @#$%)"
                      />
                      {passwordError && (
                        <p className="mt-2 text-red-400 text-sm">{passwordError}</p>
                      )}
                      <p className="mt-2 text-emerald-400/50 text-sm">
                        Password must be 4-10 characters long and can contain uppercase letters, numbers, and special characters (!, @, #, $)
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 text-lg px-8 py-6"
                    >
                      Continue
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </motion.div>
          )}

          {step === "mapping" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl"
            >
              <Dialog open={true} onOpenChange={() => {}}>
                <DialogContent className="border-emerald-400/20 bg-black/80 w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col justify-between items-center p-4 sm:p-8 rounded-lg">
                  <DialogHeader className="space-y-3 sm:space-y-4 w-full">
                    <DialogTitle className="text-center text-emerald-400 text-2xl sm:text-3xl font-bold">
                      Map Colors to Directions
                    </DialogTitle>
                    <DialogDescription className="text-center text-emerald-400/70 text-base sm:text-lg leading-relaxed">
                      {activeColor 
                        ? `Press an arrow key or WASD to assign a direction to ${String(activeColor)}`
                        : colorBearings.length === 4 
                          ? "All colors mapped! Ready to complete setup?"
                          : "Click a color box to start mapping directions"
                      }
                    </DialogDescription>
                  </DialogHeader>

                  {/* Color Boxes Grid - Make it more compact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 my-3 sm:my-4 w-full max-w-xl mx-auto px-2 sm:px-0">
                    {(Object.keys(COLORS) as Array<keyof typeof COLORS>).map((color) => {
                      const bearing = colorBearings.find(cb => cb.color === color);
                      const isActive = activeColor === color;
                      
                      return (
                        <motion.div
                          key={String(color)}
                          className={`w-full rounded-lg relative p-2 sm:p-4 ${
                            isActive ? 'ring-2 ring-white/50' : ''
                          }`}
                          style={{ 
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            borderWidth: 2,
                            borderStyle: 'solid',
                            borderColor: COLORS[color]
                          }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => !bearing && setActiveColor(color)}
                        >
                          <div className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-center" style={{ color: COLORS[color] }}>
                            {String(color)}
                          </div>
                          
                          {bearing ? (
                            <div className="flex items-center justify-center">
                              <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="flex items-center justify-center gap-2 sm:gap-3"
                              >
                                <div className="rounded-full border-2 p-1" style={{ borderColor: COLORS[color] }}>
                                  {bearing.direction === "UP" && (
                                    <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: COLORS[color] }} />
                                  )}
                                  {bearing.direction === "DOWN" && (
                                    <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: COLORS[color] }} />
                                  )}
                                  {bearing.direction === "LEFT" && (
                                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: COLORS[color] }} />
                                  )}
                                  {bearing.direction === "RIGHT" && (
                                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: COLORS[color] }} />
                                  )}
                                </div>
                                <div className="text-lg sm:text-xl font-bold" style={{ color: COLORS[color] }}>
                                  {bearing.direction}
                                </div>
                              </motion.div>
                            </div>
                          ) : isActive ? (
                            <div className="flex flex-col items-center justify-center">
                              {/* Show arrow buttons for active color */}
                              <div className="sm:grid sm:grid-cols-3 sm:gap-1 flex flex-row justify-center gap-2 w-full max-w-[180px] sm:max-w-[100px] mx-auto">
                                {[
                                  {direction: "UP", col: "sm:col-start-2", row: ""},
                                  {direction: "LEFT", col: "sm:col-start-1", row: "sm:row-start-2"},
                                  {direction: "RIGHT", col: "sm:col-start-3", row: "sm:row-start-2"},
                                  {direction: "DOWN", col: "sm:col-start-2", row: "sm:row-start-3"},
                                ].map(({direction, col, row}) => {
                                  const isDirectionTaken = colorBearings.some(cb => cb.direction === direction && cb.color !== activeColor);
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
                                            
                                            // Find next unassigned color
                                            const colors = Object.keys(COLORS) as (keyof typeof COLORS)[];
                                            const nextUnassigned = colors.find(
                                              (c) => !colorBearings.some((cb) => cb.color === c) && c !== activeColor
                                            );
                                            setActiveColor(nextUnassigned ?? null);
                                          }
                                        }}
                                        disabled={isDirectionTaken}
                                        className={`w-full aspect-square p-0 ${!isDirectionTaken ? 'hover:bg-white/10' : 'opacity-50'}`}
                                        style={{
                                          backgroundColor: "transparent",
                                          color: COLORS[color],
                                          borderColor: COLORS[color],
                                        }}
                                      >
                                        {direction === "UP" && <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4" />}
                                        {direction === "DOWN" && <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4" />}
                                        {direction === "LEFT" && <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />}
                                        {direction === "RIGHT" && <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />}
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-white/50 text-sm sm:text-base">
                              Waiting...
                            </div>
                          )}
                          
                          {/* Reassign button */}
                          {bearing && (
                            <div className="mt-2 sm:mt-3 flex justify-center">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setColorBearings(colorBearings.filter(cb => cb.color !== color));
                                  setActiveColor(color);
                                }}
                                className="text-xs py-0.5 px-2 sm:py-1 sm:px-3"
                                style={{
                                  backgroundColor: "transparent",
                                  color: COLORS[color],
                                  borderColor: COLORS[color],
                                }}
                              >
                                Reassign
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Complete and Reassign Buttons - Fix visibility issue */}
                  {colorBearings.length === 4 && (
                    <div className="w-full flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-xl mx-auto px-2 sm:px-0 mt-2 mb-2">
                      <Button
                        onClick={handleSetupComplete}
                        className="flex-1 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 text-sm sm:text-base px-3 py-2 sm:px-6 sm:py-4"
                      >
                        Complete Setup
                      </Button>
                      <Button
                        onClick={handleReassign}
                        className="flex-1 bg-red-400/10 text-red-400 hover:bg-red-400/20 text-sm sm:text-base px-3 py-2 sm:px-6 sm:py-4"
                      >
                        Reassign All
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Dialog */}
        <Dialog open={!!authState.error} onOpenChange={() => {}} modal>
          <DialogContent className="border-red-400/20 bg-black/40 w-[90%] max-w-2xl min-h-[200px] flex flex-col justify-between items-center p-8 rounded-lg">
            <DialogHeader className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <XCircle className="w-16 h-16 text-red-400" />
                <DialogTitle className="text-center text-red-400 text-3xl font-bold">
                  Setup Failed
                </DialogTitle>
              </div>
              <DialogDescription className="text-center text-red-400/70 text-lg leading-relaxed">
                {authState.error}
              </DialogDescription>
              <Button
                onClick={handleRetry}
                className="mt-4 bg-red-400/10 text-red-400 hover:bg-red-400/20 text-lg px-8 py-4"
              >
                Try Again
              </Button>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        {/* Loading Dialog */}
        <Dialog open={authState.isCreatingWallet} onOpenChange={() => {}}>
          <DialogContent className="border-emerald-400/20 bg-black/40 w-[90%] max-w-md min-h-[200px] flex flex-col justify-center items-center p-8 rounded-lg">
            <DialogHeader className="sr-only">
              <VisuallyHidden>
                <DialogTitle>Creating Wallet</DialogTitle>
              </VisuallyHidden>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
              <p className="text-emerald-400">Creating Wallet...</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={showSuccess} onOpenChange={() => {}}>
          <DialogContent className="border-emerald-400/20 bg-black/40 w-[90%] max-w-2xl min-h-[200px] flex flex-col justify-between items-center p-8 rounded-lg">
            <DialogHeader className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <CheckCircle className="w-16 h-16 text-emerald-400" />
                <DialogTitle className="text-center text-emerald-400 text-3xl font-bold">
                  Setup Complete!
                </DialogTitle>
              </div>
              <DialogDescription className="text-center text-emerald-400/70 text-lg leading-relaxed">
                Your authentication pattern has been securely saved. Redirecting to authentication...
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}