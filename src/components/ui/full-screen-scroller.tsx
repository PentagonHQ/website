"use client";

import { useEffect, useRef, ReactNode, useCallback } from "react";

interface FullScreenScrollerProps {
    children: ReactNode;
    className?: string;
    onScrollUp?: () => void;
    onScrollDown?: () => void;
    sectionId?: string;
}

export default function FullScreenScroller({
    children,
    className = "",
    onScrollUp,
    onScrollDown,
    sectionId
}: FullScreenScrollerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);
    const lastScrollTimeRef = useRef(0);
    const scrollAccumulatorRef = useRef(0);

    // Debounce scroll events to handle momentum scrolling
    const handleDebouncedScroll = useCallback((direction: 'up' | 'down') => {
        const now = Date.now();
        
        // Minimum time between scroll actions (increased from 1000ms)
        if (now - lastScrollTimeRef.current < 1500) {
            return;
        }

        lastScrollTimeRef.current = now;
        isScrollingRef.current = true;

        if (direction === 'down' && onScrollDown) {
            onScrollDown();
        } else if (direction === 'up' && onScrollUp) {
            onScrollUp();
        }

        // Reset scrolling flag after animation
        setTimeout(() => {
            isScrollingRef.current = false;
        }, 1200); // Slightly longer than animation
    }, [onScrollUp, onScrollDown]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            // Don't prevent default if there's scrollable content within the section
            const target = e.target as HTMLElement;
            const scrollableParent = target.closest('[data-scrollable="true"]');

            if (scrollableParent) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            if (isScrollingRef.current) {
                return;
            }

            // Accumulate scroll delta to handle small incremental scrolls
            scrollAccumulatorRef.current += e.deltaY;

            // Only trigger navigation when accumulated scroll exceeds threshold
            const scrollThreshold = 10; // Require meaningful scroll amount
            
            if (Math.abs(scrollAccumulatorRef.current) >= scrollThreshold) {
                const direction = scrollAccumulatorRef.current > 0 ? 'down' : 'up';
                
                // Reset accumulator
                scrollAccumulatorRef.current = 0;
                
                // Use debounced scroll handler
                handleDebouncedScroll(direction);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (isScrollingRef.current) return;

            let shouldScroll = false;
            let direction: 'up' | 'down' | null = null;

            switch (e.key) {
                case 'ArrowDown':
                case 'PageDown':
                case ' ': // Space bar
                    if (!e.shiftKey) { // Shift+Space goes up
                        e.preventDefault();
                        direction = 'down';
                        shouldScroll = true;
                    }
                    break;
                case 'ArrowUp':
                case 'PageUp':
                    e.preventDefault();
                    direction = 'up';
                    shouldScroll = true;
                    break;
            }

            if (shouldScroll) {
                isScrollingRef.current = true;

                if (direction === 'down' && onScrollDown) {
                    onScrollDown();
                } else if (direction === 'up' && onScrollUp) {
                    onScrollUp();
                }

                setTimeout(() => {
                    isScrollingRef.current = false;
                }, 1000);
            }
        };

        // Handle touch events for mobile
        let touchStartY = 0;
        let touchEndY = 0;

        const handleTouchStart = (e: TouchEvent) => {
            touchStartY = e.changedTouches[0].screenY;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (isScrollingRef.current) return;

            touchEndY = e.changedTouches[0].screenY;
            const touchDiff = touchStartY - touchEndY;

            // Minimum swipe distance to trigger section change
            if (Math.abs(touchDiff) > 50) {
                isScrollingRef.current = true;

                if (touchDiff > 0 && onScrollDown) {
                    onScrollDown();
                } else if (touchDiff < 0 && onScrollUp) {
                    onScrollUp();
                }

                setTimeout(() => {
                    isScrollingRef.current = false;
                }, 1000);
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchend', handleTouchEnd, { passive: true });
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            container.removeEventListener('wheel', handleWheel);
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onScrollUp, onScrollDown, handleDebouncedScroll]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-screen overflow-hidden ${className}`}
            style={{ touchAction: 'none' }}
            data-section={sectionId}
        >
            <div className="w-full h-full">
                {children}
            </div>
        </div>
    );
} 