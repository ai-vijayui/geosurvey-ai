export function useOnboarding() {
  return {
    isFirstTimeUser: false,
    runTour: false,
    startTour: () => undefined,
    stopTour: () => undefined,
    completeTour: () => undefined,
    resetTour: () => undefined,
    skipTour: () => undefined
  };
}
