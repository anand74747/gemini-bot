import React, { useRef, useEffect } from 'react';
import { MicIcon } from './Icons';

interface VoiceVisualizerProps {
  analyserNode: AnalyserNode | null;
  isSessionActive: boolean;
  isSpeaking: boolean;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ analyserNode, isSessionActive, isSpeaking }) => {
  const orbRef = useRef<HTMLDivElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const orb = orbRef.current;
    if (!orb) return;

    // Always cancel previous animation frame on re-render
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    // Determine the current state and apply the appropriate class
    let stateClass = '';
    if (isSpeaking) {
      stateClass = 'speaking';
    } else if (isSessionActive && analyserNode) {
      stateClass = 'listening';
    }
    
    // Set the base and state-specific classes
    orb.className = `relative w-40 h-40 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center orb ${stateClass}`.trim();

    // If listening, start the animation loop to update CSS custom properties
    if (stateClass === 'listening') {
      analyserNode.fftSize = 256;
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateListeningVisuals = () => {
        if (!orbRef.current) return;
        analyserNode.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        
        const scale = 1 + (average / 256) * 0.05;
        const shadowSpread = 20 + (average / 256) * 20;
        const shadowOpacity = 0.4 + (average / 256) * 0.3;

        // Update CSS custom properties for smoother rendering by the browser
        orbRef.current.style.setProperty('--orb-scale', `${scale}`);
        orbRef.current.style.setProperty('--orb-shadow-spread', `${shadowSpread}px`);
        orbRef.current.style.setProperty('--orb-shadow-opacity', `${shadowOpacity}`);
        
        animationFrameId.current = requestAnimationFrame(updateListeningVisuals);
      };
      updateListeningVisuals();
    }

    // Cleanup function
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [analyserNode, isSessionActive, isSpeaking]);

  return (
    <div className="w-full h-40 flex items-center justify-center">
      <div
        ref={orbRef}
        className="relative w-40 h-40 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center orb"
        // Inline styles for transition and box-shadow are removed and now handled by CSS classes for better performance
      >
        <div className={`transition-opacity duration-300 ${isSessionActive ? 'opacity-0' : 'opacity-100'}`}>
            {!isSessionActive && <MicIcon className="w-16 h-16 text-white/80" />}
        </div>
      </div>
    </div>
  );
};

export default VoiceVisualizer;