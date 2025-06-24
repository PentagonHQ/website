import { useState, useCallback } from 'react';

export function useSectionNavigation(totalSections: number) {
  const [currentSection, setCurrentSection] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigateToSection = useCallback((targetSection: number) => {
    if (targetSection >= 0 && targetSection < totalSections && targetSection !== currentSection && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentSection(targetSection);

      // Reset transition flag after animation
      setTimeout(() => {
        setIsTransitioning(false);
      }, 600);
    }
  }, [currentSection, totalSections, isTransitioning]);

  const scrollUp = useCallback(() => {
    navigateToSection(currentSection - 1);
  }, [currentSection, navigateToSection]);

  const scrollDown = useCallback(() => {
    navigateToSection(currentSection + 1);
  }, [currentSection, navigateToSection]);

  const scrollToTop = useCallback(() => {
    navigateToSection(0);
  }, [navigateToSection]);

  return {
    currentSection,
    isTransitioning,
    navigateToSection,
    scrollUp,
    scrollDown,
    scrollToTop
  };
}
