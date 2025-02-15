import { useEffect, useState } from "react";

const useFullScreenMode = (contestId, isTestFinished, addWarning) => {
  const [fullScreenMode, setFullScreenMode] = useState(() => {
    const storedFullScreenMode = localStorage.getItem(`fullScreenMode_${contestId}`);
    return storedFullScreenMode === "true";
  });

  const actuallyEnforceFullScreen = async () => {
    try {
      const element = document.documentElement;
      if (
        !document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.mozFullScreenElement &&
        !document.msFullscreenElement
      ) {
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
          await element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen();
        }
      }
    } catch (error) {
      console.error("Error requesting fullscreen mode:", error);
    }
  };

  useEffect(() => {
    if (!isTestFinished && fullScreenMode) {
      (async () => {
        try {
          await actuallyEnforceFullScreen();
        } catch (error) {
          console.error("Error initializing fullscreen:", error);
        }
      })();
    }
  }, [fullScreenMode, isTestFinished]);

  useEffect(() => {
    const onFullscreenChange = async () => {
      const isFullscreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      if (!isFullscreen && !isTestFinished && fullScreenMode) {
        addWarning("fullscreen");
        await actuallyEnforceFullScreen();
      }
      setFullScreenMode(isFullscreen);
      localStorage.setItem(
        `fullScreenMode_${contestId}`,
        isFullscreen ? "true" : "false"
      );
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    document.addEventListener("mozfullscreenchange", onFullscreenChange);
    document.addEventListener("MSFullscreenChange", onFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
      document.removeEventListener("mozfullscreenchange", onFullscreenChange);
      document.removeEventListener("MSFullscreenChange", onFullscreenChange);
    };
  }, [contestId, isTestFinished, fullScreenMode, addWarning]);

  return fullScreenMode;
};

export default useFullScreenMode;
