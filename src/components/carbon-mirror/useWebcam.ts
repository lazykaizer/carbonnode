/** Custom hook for webcam stream access, video display, and frame capture. Zero UI code — all camera logic lives here. */
import { useState, useCallback, useRef } from 'react';

export function useWebcam(onCapture: () => void) {
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startWebcam = useCallback(async () => {
    setWebcamError(null);
    setIsWebcamActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setWebcamStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch {
      setWebcamError('Camera access denied or unavailable.');
      setIsWebcamActive(false);
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
    }
    setIsWebcamActive(false);
  }, [webcamStream]);

  const captureFrame = useCallback(() => {
    stopWebcam();
    onCapture();
  }, [stopWebcam, onCapture]);

  return {
    isWebcamActive,
    webcamStream,
    webcamError,
    videoRef,
    startWebcam,
    stopWebcam,
    captureFrame,
  };
}
