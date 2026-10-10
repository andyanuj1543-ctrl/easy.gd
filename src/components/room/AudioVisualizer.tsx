import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  volume: number; // 0 to 100
  isSpeaking: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ volume, isSpeaking }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barCount = 18;
    const barWidth = 3;
    const gap = 2;
    const startX = (canvas.width - (barCount * (barWidth + gap))) / 2;

    for (let i = 0; i < barCount; i++) {
      // Dynamic height based on volume and sinusoidal variation
      const factor = isSpeaking ? Math.sin((i / barCount) * Math.PI) * (volume / 100) : 0.08;
      const height = Math.max(3, factor * canvas.height);
      const y = (canvas.height - height) / 2;

      ctx.fillStyle = isSpeaking ? '#10b981' : '#475569';
      ctx.beginPath();
      ctx.roundRect(startX + i * (barWidth + gap), y, barWidth, height, [2]);
      ctx.fill();
    }
  }, [volume, isSpeaking]);

  return (
    <canvas
      ref={canvasRef}
      width={100}
      height={24}
      className="inline-block align-middle"
    />
  );
};
