import { useEffect, useState, useRef } from "react";

const useNoiseDetection = (contestId, addWarning) => {
  // Initialize noise detection state from localStorage
  const [noiseDetection] = useState(() => {
    const storedNoiseDetection = localStorage.getItem(`noiseDetection_${contestId}`);
    return storedNoiseDetection === "true";
  });

  // Initialize noise detection count from sessionStorage
  const [noiseDetectionCount] = useState(() => {
    const storedCount = sessionStorage.getItem(`noiseDetectionCount_${contestId}`);
    return storedCount ? parseInt(storedCount, 10) : 0;
  });

  // Initialize warning popup count from sessionStorage
  const [warningPopupCount, setWarningPopupCount] = useState(() => {
    const storedWarningCount = sessionStorage.getItem(`noiseDetectionWarningCount_${contestId}`);
    return storedWarningCount ? parseInt(storedWarningCount, 10) : 0;
  });

  // Refs for tracking state between renders and animations
  const isProcessingWarning = useRef(false);
  const lastWarningTime = useRef(0);
  const DEBOUNCE_TIME = 1000; // 3 seconds between warnings

  useEffect(() => {
    if (noiseDetection) {
      let isNoiseDetected = false;
      let audioContext;
      let analyser;
      let animationFrameId;

      const detectNoise = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            analyser.fftSize = 2048;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const processNoise = () => {
              analyser.getByteTimeDomainData(dataArray);
              let values = 0;

              for (let i = 0; i < bufferLength; i++) {
                values += dataArray[i];
              }

              const average = values / bufferLength;
              const currentTime = Date.now();

              // Only process if we're not currently handling a warning and enough time has passed
              if (average > 128 && !isNoiseDetected && 
                  !isProcessingWarning.current && 
                  currentTime - lastWarningTime.current >= DEBOUNCE_TIME) {
                
                isNoiseDetected = true;
                isProcessingWarning.current = true;
                lastWarningTime.current = currentTime;

                // Trigger warning
                addWarning('noise');

               

                setWarningPopupCount(prevCount => {
                  const newCount = prevCount + 1;
                  sessionStorage.setItem(`noiseDetectionWarningCount_${contestId}`, newCount.toString());
                  return newCount;
                });

                // Reset processing flag after debounce time
                setTimeout(() => {
                  isProcessingWarning.current = false;
                }, DEBOUNCE_TIME);
              } else if (average <= 100) {
                isNoiseDetected = false;
              }

              animationFrameId = requestAnimationFrame(processNoise);
            };

            processNoise();
          })
          .catch(err => {
            console.error("Error accessing microphone:", err);
          });
      };

      detectNoise();

      // Cleanup function
      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        if (audioContext) {
          audioContext.close();
        }
      };
    }
  }, [noiseDetection, addWarning, contestId]);

  return { noiseDetection, noiseDetectionCount, warningPopupCount };
};

export default useNoiseDetection;