/** Module containing logic for useCountAnimation. */
import { useState, useEffect } from 'react';

const FRAME_RATE = 30;

export function useCountAnimation(
  targetValue: number,
  isActive: boolean,
  durationMs: number,
): number {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    if (durationMs <= 0) return;

    const totalFrames = Math.floor(durationMs / (1000 / FRAME_RATE));
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrentValue(Math.round(targetValue * eased));

      if (frame >= totalFrames) {
        clearInterval(timer);
      }
    }, 1000 / FRAME_RATE);

    return () => clearInterval(timer);
  }, [targetValue, isActive, durationMs]);

  return isActive && durationMs <= 0 ? targetValue : currentValue;
}
