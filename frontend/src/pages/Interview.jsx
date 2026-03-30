import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Video, Terminal, AlertCircle, CheckSquare, Square, ChevronRight, Hash } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Interview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId, initialMessage } = location.state || { sessionId: "MERN-Tech-Fallback", initialMessage: "[SYS_INIT] CONNECTION ESTABLISHED. STATE YOUR NAME AND PROCEED." };

  const candidateName = localStorage.getItem('candidateName') || 'CANDIDATE';
  const candidateInitials = candidateName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Real-time Bio-metrics States
  const [stream, setStream] = useState(null);
  const [vocalStress, setVocalStress] = useState(15);
  const [gazeLock, setGazeLock] = useState(98);
  const [gazeAlert, setGazeAlert] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Media Stream & Audio Analyzer
  useEffect(() => {
    const initStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        setIsCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        
        // Setup Audio Analyzer
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(mediaStream);
        source.connect(analyser);
        analyser.fftSize = 256;
        
        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const updateAudioLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
          const stress = Math.max(15, Math.min(100, (average / 128) * 100 + 10));
          setVocalStress(stress);
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        };
        updateAudioLevel();

      } catch (err) {
        console.error("Media access denied:", err);
        setIsCameraActive(false);
        setGazeLock(5);
        setGazeAlert(true);
        setVisibleLogs(prev => [...prev, "> [GAZE_LOSS_DETECTED] V_FEED CRITICAL"]);
      }
    };

    initStream();

    // Setup Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev + (prev ? ' ' : '') + transcript);
        setVisibleLogs(prev => [...prev, "> [V_TRANSCRIPT] COMPLETE. PACKET_POPULATED.."]);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Gaze Tracking Logic (Active-Aware)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isCameraActive) {
        setGazeLock(5);
        setGazeAlert(true);
        return;
      }

      // Maintain baseline 90%+ when active, with occasional heavy dips
      const criticalDip = Math.random() > 0.95;
      if (criticalDip) {
        setGazeLock(5); // Drop to <10% as requested for critical loss
        setGazeAlert(true);
        setVisibleLogs(prev => [...prev, "> [GAZE_LOSS_DETECTED] V_FEED CRITICAL"]);
        setTimeout(() => setGazeAlert(false), 2000);
      } else {
        const minorFluctuation = Math.random() > 0.7;
        setGazeLock(prev => {
          if (prev < 90) return prev + 10; // Rapid recovery
          return 92 + Math.random() * 7; // Baseline 92-99%
        });
        if (gazeLock > 10) setGazeAlert(false);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isCameraActive, gazeLock]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        setVisibleLogs(prev => [...prev, "> [V_STREAM] INITIALIZED. UPLINK_ACTIVE.."]);
      } catch (err) {
        console.error("Speech Recognition failed to start:", err);
      }
    }
  };
  
  const [chatHistory, setChatHistory] = useState([
    { role: 'system', content: `[SYS_LOG] SESSION_ID: ${sessionId} // PROTOCOL_ENGAGED` },
    { role: 'agent', content: initialMessage }
  ]);
  
  const [visibleLogs, setVisibleLogs] = useState([
     "> Audio feed locked (WebRTC).",
     "> Awaiting candidate bio-data..."
  ]);
  
  const chatEndRef = useRef(null);
  const logsEndRef = useRef(null);
  
  const scrollToBottom = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'auto' }); // Brutalist feel: jump to bottom, no smooth scroll
  };

  useEffect(() => {
    scrollToBottom(chatEndRef);
  }, [chatHistory]);

  useEffect(() => {
    scrollToBottom(logsEndRef);
  }, [visibleLogs]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg = inputText;
    setInputText('');
    setChatHistory(prev => [...prev, { role: 'candidate', content: userMsg }]);
    setVisibleLogs(prev => [...prev, `> [INPUT_DETECTED] Processing packet...`]);
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('hireai_token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/interview/message`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ session_id: sessionId, candidate_text: userMsg })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Brutalist logs
        data.evaluator_logs.forEach((log, index) => {
           setTimeout(() => {
             setVisibleLogs(prev => [...prev, `> ${log.message.toUpperCase()}`]);
           }, index * 400); // Faster, more abrupt logs
        });

        // Add Agent Response after a delay
        setTimeout(() => {
             setChatHistory(prev => [...prev, { role: 'agent', content: data.agent_response }]);
             setIsProcessing(false);
        }, data.evaluator_logs.length * 400 + 400);

      } else {
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Failed to send message", err);
      setIsProcessing(false);
      setChatHistory(prev => [...prev, { role: 'system', content: 'ERR_TIMEOUT_RETRYING' }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const endSession = () => {
    navigate('/results', { state: { sessionId } });
  };

  return (
    <div className="h-[100dvh] min-h-[100dvh] w-full bg-[#050505] text-white flex flex-col font-sans selection:bg-electric selection:text-[#050505] overflow-hidden">
      
      {/* Top Protocol Header */}
      <header className="h-14 sm:h-16 border-b-4 border-white bg-[#050505] flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center bg-white text-[#050505] font-black font-mono shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)] cursor-pointer" onClick={() => navigate('/')}>H</span>
            <span className="font-black uppercase tracking-widest text-base sm:text-lg hidden sm:block">Arena</span>
          </div>
          <div className="h-6 w-[2px] bg-[#333]"></div>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1 sm:gap-2">
            <Hash className="w-3 h-3 sm:w-4 sm:h-4 text-electric" />
            <span className="hidden xs:inline">OBJ_ID:</span> {sessionId?.substring(0,6).toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono font-bold text-electric uppercase border border-electric px-3 py-1">
            <span className="w-2 h-2 bg-electric animate-ping"></span>
            Sync Stable
          </div>
          <button 
            onClick={endSession} 
            className="text-xs font-black uppercase tracking-widest text-[#050505] bg-white border-2 border-white px-4 py-2 hover:bg-transparent hover:text-white transition-colors"
          >
            Abort Eval
          </button>
        </div>
      </header>

      {/* Main HUD Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Pane: Candidate Visuals */}
        <div className="w-[320px] shrink-0 border-r-2 border-zinc-800 flex flex-col p-6 hidden lg:flex bg-[#0A0A0A]">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">Target Vision</h3>
          
          <div className="relative w-full aspect-video border-2 border-zinc-700 bg-black flex items-center justify-center group uppercase overflow-hidden">
            {/* Live webcam feed */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover grayscale brightness-125 contrast-125 opacity-40"
            />
            
            {/* HUD Scanline Effect overlay on video */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            
            {/* Tactical crosshair overlays */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-electric m-2"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-electric m-2"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-electric m-2"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-electric m-2"></div>

            <div className="absolute top-2 left-3 z-20 flex items-center gap-2">
              <span className="flex h-5 items-center gap-1.5 bg-red-600 px-2 text-[10px] font-bold text-white uppercase font-mono tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-white opacity-70"></span>
                REC
              </span>
            </div>
            <div className="absolute bottom-2 left-3 z-20">
              <span className="text-[10px] font-mono font-black text-white uppercase tracking-widest bg-black/80 px-1 py-0.5">{candidateName.toUpperCase()}</span>
            </div>
          </div>
          
          <div className="mt-8 flex-1">
             <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Video className="w-4 h-4 text-white" /> Bio-Metrics
             </h4>
             <div className="space-y-6">
               <div>
                 <div className="flex justify-between text-[10px] font-mono font-bold uppercase mb-2">
                   <span className="text-zinc-400">Gaze Lock</span>
                   <span className={gazeAlert ? 'text-red-500 animate-pulse' : 'text-[#CCFF00]'}>
                     {Math.round(gazeLock)}% {gazeAlert && '!! LOOK_HERE !!'}
                   </span>
                 </div>
                 <div className="h-3 w-full border border-zinc-800 bg-black">
                   <motion.div 
                    animate={{ width: `${gazeLock}%`, backgroundColor: gazeAlert ? '#ef4444' : '#CCFF00' }}
                    className="h-full"
                   />
                 </div>
               </div>
               <div>
                 <div className="flex justify-between text-[10px] font-mono font-bold uppercase mb-2">
                   <span className="text-zinc-400">Vocal Stress</span>
                   <span className="text-white font-mono">{vocalStress > 40 ? 'SPIKE_DETECTED' : 'NOMINAL'}</span>
                 </div>
                 <div className="h-3 w-full border border-zinc-800 bg-black">
                   <motion.div 
                    animate={{ width: `${vocalStress}%` }}
                    className="h-full bg-white"
                   />
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Center Pane: Active Comm Channel */}
        <div className="flex-1 flex flex-col bg-[#050505] min-w-0 border-r-2 border-zinc-800">
          
          {/* Chat Readout */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 scrollbar-hide">
            <AnimatePresence>
              {chatHistory.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: msg.role === 'candidate' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'system' ? (
                    <div className="w-full flex justify-center my-4">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#CCFF00] font-mono bg-[#CCFF00]/10 border border-[#CCFF00]/30 px-3 py-1">
                        {msg.content}
                      </span>
                    </div>
                  ) : (
                    <div className={`flex w-full max-w-2xl ${msg.role === 'candidate' ? 'flex-row-reverse' : 'flex-row'} gap-3 sm:gap-6`}>
                      <div className="shrink-0">
                        {msg.role === 'agent' ? (
                          <div className="h-10 w-10 bg-white text-[#050505] border-2 border-white flex items-center justify-center font-black text-sm uppercase">
                            AI
                          </div>
                        ) : (
                          <div className="h-10 w-10 border-2 border-zinc-600 text-zinc-400 flex items-center justify-center font-black text-sm uppercase">
                            {candidateInitials}
                          </div>
                        )}
                      </div>
                      
                      <div className={`p-5 text-sm uppercase font-extrabold tracking-wide leading-relaxed border-2 ${
                        msg.role === 'agent' 
                          ? 'border-zinc-800 bg-[#111] text-white' 
                          : 'border-electric bg-electric/5 text-electric'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
            
            {/* Terminal Typed Processing Indicator */}
            {isProcessing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start w-full max-w-2xl gap-6"
              >
                 <div className="shrink-0">
                    <div className="h-10 w-10 bg-white text-[#050505] border-2 border-white flex items-center justify-center font-black text-sm uppercase">
                      AI
                    </div>
                 </div>
                  <div className="p-4 sm:p-5 border-2 border-zinc-800 bg-[#111] text-zinc-500 font-mono text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-2">
                    [COMPUTING_RESPONSE] <span className="w-2 h-4 bg-zinc-400 animate-pulse"></span>
                 </div>
              </motion.div>
            )}
          </div>

          {/* Input Console */}
          <div className="border-t-2 border-zinc-800 bg-[#0A0A0A] p-6 relative">
            {/* Listening Glow Overlay */}
            <AnimatePresence>
              {isListening && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-toxic/5 pointer-events-none z-0"
                  style={{ boxShadow: 'inset 0 0 50px rgba(204,255,0,0.1)' }}
                />
              )}
            </AnimatePresence>

            <div className="max-w-4xl mx-auto flex flex-col gap-4 relative z-10">
              
              <div className="flex items-center gap-4">
                {/* Click to speak toggle */}
                <button
                  onClick={toggleListening}
                  className={`relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center shrink-0 border-2 transition-all ${
                    isListening 
                      ? 'bg-red-600 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse' 
                      : 'bg-transparent border-zinc-700 text-zinc-500 hover:border-toxic hover:text-toxic'
                  }`}
                >
                  <Mic className={`h-6 w-6 ${isListening ? 'scale-110' : ''}`} />
                  {isListening && (
                    <motion.span 
                      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="absolute inset-0 border-2 border-red-600 rounded-none"
                    />
                  )}
                </button>

                <div className="flex-1 flex relative items-center">
                  <div className={`absolute left-0 top-0 bottom-0 w-2 transition-colors hidden sm:block ${isListening ? 'bg-toxic' : 'bg-electric'}`}></div>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? "LISTENING..." : "ENTER RESPONSE SEQUENCE..."}
                    className={`w-full bg-[#111] border-2 text-sm uppercase pl-4 sm:pl-6 pr-14 py-4 focus:outline-none transition-all font-mono ${
                      isListening 
                        ? 'border-toxic text-toxic placeholder-toxic/50 shadow-[0_0_10px_rgba(204,255,0,0.2)]' 
                        : 'border-zinc-700 text-white placeholder-zinc-700 focus:border-white'
                    }`}
                  />
                  
                  {/* Real-time Waveform Simulation (Only while listening) */}
                  {isListening && (
                    <div className="absolute right-16 flex items-center gap-1.5 pointer-events-none">
                      {[1, 2, 3, 4].map(i => (
                        <motion.div 
                          key={i}
                          animate={{ height: [4, 16, 4] }}
                          transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                          className="w-1 bg-toxic"
                        />
                      ))}
                    </div>
                  )}

                  <button 
                    onClick={handleSendMessage}
                    disabled={isProcessing || isListening}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-white transition-colors disabled:opacity-30"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest">
                 <span className={`${isListening ? 'text-toxic animate-pulse' : 'text-zinc-600'}`}>
                    {isListening ? '> VOICE_UPLINK_ESTABLISHED // CAPTURING_STREAM' : '> CLICK_MIC_FOR_VOICE_TRANSCRIPT'}
                 </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Evaluator Log (Brutalist Terminal) */}
        <div className="w-[340px] shrink-0 bg-[#000] flex flex-col font-mono text-[#CCFF00] hidden xl:flex">
          
          <div className="p-4 border-b-2 border-zinc-800 flex justify-between items-center text-xs uppercase tracking-widest font-bold">
             <div className="flex items-center gap-2">
               <Terminal className="w-4 h-4 text-zinc-500" />
               <span className="text-white">SYS_LOG.exe</span>
             </div>
             <div className="flex gap-2">
               <span className="w-3 h-3 border border-zinc-600"></span>
               <span className="w-3 h-3 border border-zinc-600"></span>
               <span className="w-3 h-3 bg-[#CCFF00]"></span>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 text-[10px] uppercase leading-loose space-y-1 scrollbar-hide">
             {visibleLogs.map((log, idx) => {
               let colorClass = "text-zinc-500";
               if (log.includes("LOCKED") || log.includes("SECURE")) colorClass = "text-[#CCFF00]";
               if (log.includes("DETECTED")) colorClass = "text-electric";
               if (log.includes("ERROR") || log.includes("TIMEOUT")) colorClass = "text-red-500 bg-red-500/10 inline-block px-1";
               
               return (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   className={colorClass}
                 >
                   {log}
                 </motion.div>
               );
             })}
             <div ref={logsEndRef} />
             
             {chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'agent' && (
               <div className="mt-4 text-[#CCFF00]/50 flex items-center gap-2">
                 <span className="w-2 h-4 bg-[#CCFF00] animate-pulse"></span> AWAIT.INPUT
               </div>
             )}
          </div>
          
          {/* Active Rubric Status */}
          <div className="p-6 border-t-2 border-zinc-800 bg-[#050505] mt-auto">
             <h4 className="text-[10px] font-black text-white uppercase mb-4 tracking-widest">Active Eval Nodes</h4>
             <div className="space-y-3 font-mono text-[10px] uppercase tracking-widest">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Node_Architecture</span>
                  <span className="text-[#CCFF00] border border-[#CCFF00] px-1 bg-[#CCFF00]/10 flex items-center gap-1"><CheckSquare className="w-3 h-3"/> PASS</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Realtime_Comm</span>
                  <span className="text-electric border border-electric px-1 bg-electric/10 animate-pulse">EVAL...</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600">Sys_Security</span>
                  <span className="text-zinc-700 font-bold">STANDBY</span>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Interview;
