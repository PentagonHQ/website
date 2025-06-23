"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";

// Lazy load heavy auth components
const SetupAuth = lazy(() => import("@/src/components/auth/setup-auth"));
const WorkingAuth = lazy(() => import("@/src/components/auth/working-auth"));

type AuthFlowState = "setup" | "working";

// Simple loading component with consistent structure
const AuthLoading = () => (
    <div className="relative min-h-screen bg-black flex flex-col">
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-gray-400">Loading authentication...</p>
            </div>
        </div>
    </div>
);

export default function AuthFlow() {
    const [flowState, setFlowState] = useState<AuthFlowState>("setup");
    const [isSetupVisible, setIsSetupVisible] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Immediately start loading to reduce delays
        setShouldLoad(true);
        
        // Defer credential check to avoid blocking initial render
        const checkExistingCredentials = () => {
            // Use setTimeout with 0 delay for immediate scheduling
            setTimeout(() => {
                try {
                    const hasCredentials = !!(
                        localStorage.getItem("c1ph3r_encrypted_directions") &&
                        localStorage.getItem("c1ph3r_encrypted_password")
                    );

                    if (hasCredentials) {
                        setFlowState("working");
                    } else {
                        setFlowState("setup");
                    }
                    setIsInitialized(true);
                } catch (error) {
                    console.error("Error checking credentials:", error);
                    setFlowState("setup");
                    setIsInitialized(true);
                }
            }, 0);
        };

        checkExistingCredentials();

        // Set up intersection observer for scroll-based visibility
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsSetupVisible(true);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: "50px 0px -50px 0px"
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        // Listen for setup completion
        const handleSetupComplete = () => {
            setIsTransitioning(true);
            setIsSetupVisible(false);
            setFlowState("working");
            
            // Clear transition state after animation
            setTimeout(() => {
                setIsTransitioning(false);
            }, 600); // Match animation duration
        };

        window.addEventListener("authSetupComplete", handleSetupComplete);

        return () => {
            window.removeEventListener("authSetupComplete", handleSetupComplete);
            observer.disconnect();
        };
    }, []);

    const slideVariants = {
        initial: { opacity: 0, x: 100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -100 }
    };

    // Show loading until both shouldLoad and isInitialized are true
    if (!shouldLoad || !isInitialized) {
        return (
            <div ref={sectionRef} className="min-h-screen bg-black">
                <AuthLoading />
            </div>
        );
    }

    return (
        <div ref={sectionRef} className="min-h-screen bg-black">
            <AnimatePresence mode="wait">
                {flowState === "setup" && (
                    <motion.div
                        key="setup"
                        variants={slideVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="min-h-screen"
                    >
                        <Suspense fallback={<AuthLoading />}>
                            <SetupAuth isVisible={isSetupVisible} />
                        </Suspense>
                    </motion.div>
                )}

                {flowState === "working" && (
                    <motion.div
                        key="working"
                        variants={slideVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="min-h-screen"
                    >
                        <Suspense fallback={<AuthLoading />}>
                            <WorkingAuth />
                        </Suspense>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 