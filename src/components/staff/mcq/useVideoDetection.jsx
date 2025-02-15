import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaExclamationTriangle, FaUserSlash, FaUsers } from 'react-icons/fa';

const FaceDetectionComponent = ({ contestId, onWarning }) => {
    const videoRef = useRef(null);
    const [faceDetectionCount, setFaceDetectionCount] = useState(
        parseInt(sessionStorage.getItem(`faceDetectionCount_${contestId}`)) || 0
    );
    const [isKicked, setIsKicked] = useState(false);
    const [lastFaceDetectionTime, setLastFaceDetectionTime] = useState(Date.now());
    const [icon, setIcon] = useState(<FaCheckCircle size={50} color="gray" />);
    const [isIndicatorRed, setIsIndicatorRed] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const navigate = useNavigate();

    const isProcessingWarning = useRef(false);
    const DEBOUNCE_TIME = 1000; // 1 second between warnings
    const INCREMENT_INTERVAL = 1000; // 5 seconds to increment the count
    const WARNING_INTERVAL = 15000; // 30 seconds to show the warning

    useEffect(() => {
        setupFaceDetection();
    }, [contestId]);

    const setupFaceDetection = async () => {
        try {
            await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
            await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
            await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
            await faceapi.nets.faceExpressionNet.loadFromUri('/models');
            console.log('Models loaded successfully');

            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(error => {
                    console.error('Error playing video:', error);
                });
            }
        } catch (error) {
            console.error('Error setting up face detection:', error);
        }
    };

    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement) {
            videoElement.addEventListener('loadedmetadata', () => {
                console.log('Video metadata loaded');
                const displaySize = { width: videoElement.videoWidth, height: videoElement.videoHeight };

                const interval = setInterval(async () => {
                    if (videoElement.readyState === 4) {
                        const detections = await faceapi.detectAllFaces(
                            videoElement,
                            new faceapi.TinyFaceDetectorOptions({
                                inputSize: 224,
                                scoreThreshold: 0.3
                            })
                        ).withFaceLandmarks().withFaceExpressions();

                        console.log('Detections:', detections);

                        handleFaceDetection(detections);
                    }
                }, 100);

                return () => clearInterval(interval);
            });
        }
    }, []);

    const handleFaceDetection = (detections) => {
        if (detections.length === 1) {
            const eyeDetection = checkEyeballDetection(detections[0].landmarks.positions);
            if (eyeDetection) {
                setIcon(<FaCheckCircle size={50} color="green" />);
                setIsIndicatorRed(false);
                setLastFaceDetectionTime(Date.now()); // Reset the timer
                setShowWarning(false); // Hide the warning if face is detected
            } else {
                setIcon(<FaExclamationTriangle size={50} color="red" />);
                setIsIndicatorRed(true);
            }
        } else if (detections.length === 0) {
            setIcon(<FaUserSlash size={50} color="red" />);
            setIsIndicatorRed(true);
        } else if (detections.length > 1) {
            setIcon(<FaUsers size={50} color="red" />);
            setIsIndicatorRed(true);
        } else {
            const faceOrientation = checkFaceOrientation(detections[0].landmarks.positions, videoRef.current);
            if (!faceOrientation) {
                setIcon(<FaExclamationTriangle size={50} color="red" />);
                setIsIndicatorRed(true);
            }
        }
    };

    useEffect(() => {
        if (isIndicatorRed) {
            debounceFaceDetection();
        }
    }, [isIndicatorRed]);

    const debounceFaceDetection = () => {
        const currentTime = Date.now();
        if (currentTime - lastFaceDetectionTime >= DEBOUNCE_TIME && !isProcessingWarning.current) {
            setLastFaceDetectionTime(currentTime);
            isProcessingWarning.current = true;
            handleFaceDetectionCount();

            setTimeout(() => {
                isProcessingWarning.current = false;
            }, DEBOUNCE_TIME);
        }
    };

    const handleFaceDetectionCount = () => {
        setFaceDetectionCount((prevCount) => {
            const newCount = prevCount + 1;
            sessionStorage.setItem(`faceDetectionCount_${contestId}`, newCount);

            if (newCount <= 5) {
                onWarning(`${newCount === 1 ? "First" : newCount === 2 ? "Second" : newCount === 3 ? "Third" : `${newCount}th`} Warning: Face detection issue detected!`);
            }

            if (newCount === 120) {
                onWarning(`Eleventh Warning: You have been kicked out!`);
                setIsKicked(true);
            }

            return newCount;
        });
    };

    const checkFaceOrientation = (landmarks, video) => {
        const noseTip = landmarks[30];
        const leftEyeCenter = calculateEyeCenter(landmarks.slice(36, 42));
        const rightEyeCenter = calculateEyeCenter(landmarks.slice(42, 48));

        const eyeCenterX = (leftEyeCenter.x + rightEyeCenter.x) / 2;

        const orientationThreshold = 0.015;
        const orientation = Math.abs(noseTip.x - eyeCenterX) < orientationThreshold * video.videoWidth;
        return orientation;
    };

    const calculateEyeCenter = (eyeLandmarks) => {
        const x = eyeLandmarks.reduce((sum, landmark) => sum + landmark.x, 0) / eyeLandmarks.length;
        const y = eyeLandmarks.reduce((sum, landmark) => sum + landmark.y, 0) / eyeLandmarks.length;
        return { x, y };
    };

    const checkEyeballDetection = (landmarks) => {
        const leftEyeLandmarks = landmarks.slice(36, 42);
        const rightEyeLandmarks = landmarks.slice(42, 48);

        const leftEyeDetected = leftEyeLandmarks.every(landmark => landmark.x > 0 && landmark.y > 0);
        const rightEyeDetected = rightEyeLandmarks.every(landmark => landmark.x > 0 && landmark.y > 0);

        return leftEyeDetected && rightEyeDetected;
    };

    useEffect(() => {
        if (isKicked) {
            sessionStorage.setItem('kickedOut', 'true');
            navigate('/studentdashboard');
        }
    }, [isKicked, navigate]);

    useEffect(() => {
        const incrementInterval = setInterval(() => {
            const currentTime = Date.now();
            if (currentTime - lastFaceDetectionTime >= INCREMENT_INTERVAL && isIndicatorRed) {
                handleFaceDetectionCount();
            }
        }, INCREMENT_INTERVAL);

        return () => clearInterval(incrementInterval);
    }, [lastFaceDetectionTime, isIndicatorRed]);

    useEffect(() => {
        const warningInterval = setInterval(() => {
            const currentTime = Date.now();
            if (currentTime - lastFaceDetectionTime >= WARNING_INTERVAL && isIndicatorRed) {
                setShowWarning(true);
            }
        }, WARNING_INTERVAL);

        return () => clearInterval(warningInterval);
    }, [lastFaceDetectionTime, isIndicatorRed]);

    return (
        <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 1000, display: 'flex', alignItems: 'center' }}>
            <video ref={videoRef} style={{ display: 'none' }} autoPlay muted />
            {icon}
            {showWarning && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <div className="text-red-600 mb-4">
                            <svg
                                className="w-12 h-12 mx-auto"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-center mb-4">
                            Face Detection Warning
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            Face not detected. Please ensure you are visible to the camera.
                        </p>
                        <button
                            onClick={() => setShowWarning(false)}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FaceDetectionComponent;
