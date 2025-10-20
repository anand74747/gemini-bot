import React, { useState, useRef, useEffect, useCallback } from 'react';
// FIX: LiveSession is not an exported member of '@google/genai'. It has been removed.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
// Corrected: Fixed import path
import { encode, decode, decodeAudioData } from './utils/audioUtils';
// Corrected: Fixed import path
import { Transcript } from './types';
// Corrected: Fixed import path
import VoiceVisualizer from './components/VoiceVisualizer';
// Corrected: Fixed import path
import { ControlButton } from './components/ControlButton';
// Corrected: Fixed import path
import { MicIcon, CloseIcon, CaptionIcon, MuteIcon, UnmuteIcon } from './components/Icons';

// App component
const App: React.FC = () => {
  // Refs for audio processing and API session
  // FIX: Use 'any' for the session promise as LiveSession is not an exported type.
  const sessionPromise = useRef<Promise<any> | null>(null);
  const inputAudioContext = useRef<AudioContext | null>(null);
  const outputAudioContext = useRef<AudioContext | null>(null);
  const scriptProcessor = useRef<ScriptProcessorNode | null>(null);
  const micStream = useRef<MediaStream | null>(null);
  const micSource = useRef<MediaStreamAudioSourceNode | null>(null);
  const outputGainNode = useRef<GainNode | null>(null);
  const nextStartTime = useRef<number>(0);
  const playingSources = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptContainerRef = useRef<HTMLElement>(null);

  // State for UI and transcription
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);

  // Refs for managing transcription text
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');

  const stopSession = useCallback(async () => {
    if (sessionPromise.current) {
      const session = await sessionPromise.current;
      session.close();
      sessionPromise.current = null;
    }

    if (micStream.current) {
      micStream.current.getTracks().forEach((track) => track.stop());
      micStream.current = null;
    }

    if (scriptProcessor.current) {
      scriptProcessor.current.disconnect();
      scriptProcessor.current = null;
    }

    if (micSource.current) {
      micSource.current.disconnect();
      micSource.current = null;
    }

    if (inputAudioContext.current && inputAudioContext.current.state !== 'closed') {
      await inputAudioContext.current.close();
    }
    if (outputAudioContext.current && outputAudioContext.current.state !== 'closed') {
      await outputAudioContext.current.close();
    }

    playingSources.current.forEach(source => source.stop());
    playingSources.current.clear();

    setIsSessionActive(false);
    setIsSpeaking(false);
    setAnalyserNode(null);
    setTranscripts([]);
    currentInputTranscription.current = '';
    currentOutputTranscription.current = '';
    nextStartTime.current = 0;
  }, []);

  const startSession = useCallback(async () => {
    if (isSessionActive) {
      return;
    }
    
    // Initialize GoogleGenAI
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    // Setup audio contexts
    // FIX: Cast window to 'any' to allow for vendor-prefixed webkitAudioContext for broader browser support.
    inputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    // FIX: Cast window to 'any' to allow for vendor-prefixed webkitAudioContext for broader browser support.
    outputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    outputGainNode.current = outputAudioContext.current.createGain();
    outputGainNode.current.connect(outputAudioContext.current.destination);
    outputGainNode.current.gain.value = isMuted ? 0 : 1;
    
    // Get microphone stream with specific error handling
    try {
      micStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      console.error('Failed to get microphone access:', error);
      await stopSession(); // stopSession handles full cleanup
      return;
    }

    setIsSessionActive(true);

    // Connect to Gemini Live API with specific error handling
    try {
      sessionPromise.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            // Setup microphone input processing
            micSource.current = inputAudioContext.current!.createMediaStreamSource(micStream.current!);
            scriptProcessor.current = inputAudioContext.current!.createScriptProcessor(4096, 1, 1);
            
            // --- Path 1: For Visualization (Raw audio) ---
            const localAnalyserNode = inputAudioContext.current!.createAnalyser();
            setAnalyserNode(localAnalyserNode);
            micSource.current.connect(localAnalyserNode);

            // --- Path 2: For API (Normalized audio) ---
            // Create and configure a dynamics compressor for audio normalization.
            const compressorNode = inputAudioContext.current!.createDynamicsCompressor();
            compressorNode.threshold.setValueAtTime(-50, inputAudioContext.current!.currentTime);
            compressorNode.knee.setValueAtTime(40, inputAudioContext.current!.currentTime);
            compressorNode.ratio.setValueAtTime(12, inputAudioContext.current!.currentTime);
            compressorNode.attack.setValueAtTime(0, inputAudioContext.current!.currentTime);
            compressorNode.release.setValueAtTime(0.25, inputAudioContext.current!.currentTime);
            
            micSource.current.connect(compressorNode);

            // The scriptProcessor now gets its audio from the compressor
            scriptProcessor.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            compressorNode.connect(scriptProcessor.current);
            scriptProcessor.current.connect(inputAudioContext.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            handleTranscription(message);
            await handleAudio(message);
          },
          onerror: (e: ErrorEvent) => {
            console.error('API Error:', e);
            stopSession();
          },
          onclose: (e: CloseEvent) => {
            console.log('Session closed.');
            // No need to call stopSession() here, as it might be called already from user action
          },
        },
      });
    } catch (error) {
      console.error('Failed to connect to Gemini API:', error);
      await stopSession();
    }
  }, [isSessionActive, isMuted, stopSession]);
  
  const handleTranscription = (message: LiveServerMessage) => {
    if (message.serverContent?.inputTranscription) {
      currentInputTranscription.current += message.serverContent.inputTranscription.text;
    }
    if (message.serverContent?.outputTranscription) {
      currentOutputTranscription.current += message.serverContent.outputTranscription.text;
    }
    if (message.serverContent?.turnComplete) {
      const fullInput = currentInputTranscription.current.trim();
      const fullOutput = currentOutputTranscription.current.trim();

      setTranscripts((prev) => {
        const newTranscripts: Transcript[] = [];
        if (fullInput) {
          newTranscripts.push({ speaker: 'user', text: fullInput });
        }
        if (fullOutput) {
          newTranscripts.push({ speaker: 'model', text: fullOutput });
        }
        return [...prev, ...newTranscripts];
      });

      currentInputTranscription.current = '';
      currentOutputTranscription.current = '';
    }
  };

  const handleAudio = async (message: LiveServerMessage) => {
    const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
    if (base64EncodedAudioString && outputAudioContext.current) {
        setIsSpeaking(true);
        nextStartTime.current = Math.max(nextStartTime.current, outputAudioContext.current.currentTime);
        const audioBuffer = await decodeAudioData(
            decode(base64EncodedAudioString),
            outputAudioContext.current,
            24000,
            1,
        );
        const source = outputAudioContext.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputGainNode.current!);
        source.addEventListener('ended', () => {
            playingSources.current.delete(source);
            if (playingSources.current.size === 0) {
              setIsSpeaking(false);
            }
        });
        
        source.start(nextStartTime.current);
        nextStartTime.current += audioBuffer.duration;
        playingSources.current.add(source);
    }
    if (message.serverContent?.interrupted) {
      playingSources.current.forEach(source => source.stop());
      playingSources.current.clear();
      nextStartTime.current = 0;
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    if (outputGainNode.current) {
      outputGainNode.current.gain.value = isMuted ? 0 : 1;
    }
  }, [isMuted]);

  useEffect(() => {
    if (transcriptContainerRef.current) {
      const container = transcriptContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [transcripts]);
  
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  const toggleSession = () => {
    if (isSessionActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-between p-4 font-sans">
      <header className="w-full flex justify-center items-center h-40">
        <VoiceVisualizer analyserNode={analyserNode} isSessionActive={isSessionActive} isSpeaking={isSpeaking} />
      </header>

      <main ref={transcriptContainerRef} className="flex-grow w-full max-w-4xl overflow-y-auto p-4 space-y-4 scroll-smooth">
        {showCaptions && transcripts.map((t, i) => (
          <div key={i} className={`flex ${t.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-2xl max-w-lg ${t.speaker === 'user' ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
              <p className="text-lg">{t.text}</p>
            </div>
          </div>
        ))}
        {!isSessionActive && transcripts.length === 0 && (
             <div className="flex justify-center items-center h-full">
                <p className="text-gray-400 text-2xl">Press the mic to start</p>
            </div>
        )}
      </main>

      <footer className="w-full max-w-4xl flex items-center justify-center space-x-6 p-4">
        <ControlButton variant="secondary" onClick={() => setShowCaptions(!showCaptions)} aria-label={showCaptions ? 'Hide captions' : 'Show captions'}>
          <CaptionIcon className={`w-10 h-10 ${showCaptions ? 'text-cyan-400' : 'text-gray-400'}`} />
        </ControlButton>

        <ControlButton onClick={toggleSession} aria-label={isSessionActive ? 'Stop session' : 'Start session'}>
          {isSessionActive ? (
            <CloseIcon className="w-12 h-12 text-white" />
          ) : (
            <MicIcon className="w-12 h-12 text-white" />
          )}
        </ControlButton>

        <ControlButton variant="secondary" onClick={() => setIsMuted(!isMuted)} aria-label={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted ? (
            <MuteIcon className="w-10 h-10 text-gray-400" />
          ) : (
            <UnmuteIcon className="w-10 h-10 text-cyan-400" />
          )}
        </ControlButton>
      </footer>
    </div>
  );
};

export default App;