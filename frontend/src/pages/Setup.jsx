import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonitorPlay, Users, Briefcase, Mic, Camera, ChevronRight, CheckSquare, Square, Zap, Cpu, Activity, ShieldAlert, Crosshair, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const iconMap = {
  MonitorPlay,
  Users,
  Briefcase
};

const GlitchText = ({ text, className = "" }) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <motion.span 
        className="absolute top-0 left-0 -ml-0.5 text-electric opacity-70"
        animate={{ x: [-2, 2, -1, 0], y: [1, -1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 0.2, repeatType: "mirror", repeatDelay: Math.random() * 2 }}
      >
        {text}
      </motion.span>
      <motion.span 
        className="absolute top-0 left-[2px] text-toxic opacity-70"
        animate={{ x: [2, -2, 1, 0], y: [-1, 1, 0, -1] }}
        transition={{ repeat: Infinity, duration: 0.3, repeatType: "mirror", repeatDelay: Math.random() * 2 }}
      >
        {text}
      </motion.span>
      <span className="relative">{text}</span>
    </div>
  );
}

const Setup = () => {
  const navigate = useNavigate();
  const [protocols, setProtocols] = useState([]);
  const [selectedType, setSelectedType] = useState('technical');
  const [selectedCompany, setSelectedCompany] = useState('General');
  const candidateName = localStorage.getItem('candidateName') || 'CANDIDATE';
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/setup/protocols`);
        if (res.ok) {
          const data = await res.json();
          setProtocols(data.protocols);
        }
      } catch (err) {
        console.error("Could not fetch protocols", err);
        setProtocols([
           { id: 'technical', title: 'Technical Screen', desc: 'Deep dive into algos & sys design.', icon: 'MonitorPlay' },
           { id: 'behavioral', title: 'Cultural Fit', desc: 'Assess leadership and teamwork.', icon: 'Users' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchProtocols();
  }, []);

  const handleStart = async () => {
    try {
      const token = localStorage.getItem('hireai_token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/interview/start`, {
         method: 'POST',
         headers: { 
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify({ 
           protocol_id: selectedType,
           company_name: selectedCompany
         })
      });
      if (res.ok) {
         const data = await res.json();
         navigate('/interview', { state: { 
           sessionId: data.session_id, 
           initialMessage: data.initial_message,
           camEnabled,
           micEnabled
         } });
      } else {
         console.error("Start failed");
         navigate('/login');
      }
    } catch {
       navigate('/interview', { state: { 
         sessionId: "MOCK-SESSION-123", 
         initialMessage: "INITIALIZING MODULE...",
         camEnabled,
         micEnabled
       } });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, rotateX: -10 },
    visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white p-4 sm:p-8 md:p-12 font-sans selection:bg-electric selection:text-[#050505] overflow-x-hidden relative">
      
      {/* Animated Background Grid & Scanline */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, #CCFF00 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}
      />
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-gradient-to-b from-transparent via-electric/10 to-transparent h-32"
        animate={{ y: ['-100vh', '100vh'] }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
      />
      
      {/* Heavy Corner Borders */}
      <div className="absolute top-0 left-0 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 border-t-8 border-l-8 border-electric pointer-events-none z-0 opacity-50 m-4 sm:m-6" />
      <div className="absolute bottom-0 right-0 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 border-b-8 border-r-8 border-toxic pointer-events-none z-0 opacity-50 m-4 sm:m-6" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Top Header Bar */}
        <motion.header 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-white pb-6 mb-12 gap-6"
        >
          <div className="flex items-center gap-4 sm:gap-6">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              className="w-12 h-12 sm:w-16 sm:h-16 bg-toxic flex items-center justify-center text-[#050505] font-black text-2xl sm:text-3xl font-mono border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] sm:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] cursor-pointer"
              onClick={() => navigate('/')}
            >
              H
            </motion.div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none flex items-center gap-3">
                <GlitchText text="Configuration" />
                <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }}>_</motion.span>
              </h1>
              <p className="font-mono text-sm text-toxic uppercase tracking-[0.3em] mt-2 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]">
                <Activity className="w-4 h-4" /> Pre-Flight Sequence Active
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 font-mono text-xs uppercase text-zinc-400 bg-[#111] p-4 border-2 border-zinc-800 shadow-[4px_4px_0px_0px_rgba(39,39,42,1)]">
             <div className="flex gap-3 items-center">
               <span className="w-3 h-3 bg-electric border border-white animate-pulse"></span> 
               SYSTEM: <span className="text-white font-bold ml-auto">ONLINE</span>
             </div>
             <div className="flex gap-3 items-center">
               <span className="w-3 h-3 bg-toxic border border-white"></span> 
               UPLINK: <span className="text-white font-bold ml-auto">STABLE</span>
             </div>
          </div>
        </motion.header>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12"
        >
          
          {/* Main Configuration Area */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Protocol Selection */}
            <motion.section variants={itemVariants} className="relative group">
              <div className="absolute -left-6 top-0 bottom-0 w-2 bg-zinc-800 group-hover:bg-toxic transition-colors duration-500" />
              <div className="flex justify-between items-end mb-8 border-b-2 border-zinc-800 pb-4">
                <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  <span className="text-zinc-500 font-mono text-xl">01</span> Select Protocol
                </h2>
                <span className="font-mono text-sm bg-electric text-black px-2 py-1 font-bold animate-pulse border-2 border-black">&lt;REQUIRED&gt;</span>
              </div>

              {loading ? (
                 <div className="h-64 border-4 border-dashed border-zinc-800 flex flex-col items-center justify-center font-mono text-toxic bg-[#0A0A0A]">
                    <Cpu className="w-12 h-12 mb-4 animate-spin drop-shadow-[0_0_10px_rgba(204,255,0,0.8)]" />
                    [LOADING_PROTOCOLS...]
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {protocols.map((type) => {
                    const Icon = iconMap[type.icon] || MonitorPlay;
                    const isSelected = selectedType === type.id;
                    
                    return (
                      <motion.button
                        key={type.id}
                        whileHover={{ scale: 1.02, y: -4, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedType(type.id)}
                        className={`relative flex flex-col items-start p-8 border-4 text-left transition-all duration-300 overflow-hidden ${
                          isSelected 
                            ? 'border-white bg-[#111] shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]' 
                            : 'border-zinc-800 bg-[#0A0A0A] hover:border-toxic hover:shadow-[8px_8px_0px_0px_rgba(204,255,0,0.5)]'
                        }`}
                      >
                        {/* Background kinetic element */}
                        <motion.div 
                          className="absolute -right-16 -top-16 opacity-[0.03] pointer-events-none rotate-45"
                          animate={{ rotate: isSelected ? [45, 90, 45] : 45 }}
                          transition={{ repeat: Infinity, duration: 20 }}
                        >
                          <Crosshair className="w-64 h-64 text-white" />
                        </motion.div>

                        <div className="absolute top-4 right-4 z-10">
                          {isSelected ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} className="text-black bg-toxic p-1 border-2 border-white relative shadow-[0_0_15px_rgba(204,255,0,0.5)]">
                              <CheckSquare className="w-6 h-6" />
                            </motion.div>
                          ) : (
                            <Square className="w-6 h-6 text-zinc-600" />
                          )}
                        </div>

                        <div className={`p-4 border-4 mb-8 z-10 transition-colors ${isSelected ? 'border-toxic bg-toxic/10 text-toxic' : 'border-zinc-700 text-zinc-400'}`}>
                          <Icon className="w-10 h-10" />
                        </div>
                        <h3 className={`text-2xl font-black uppercase tracking-tighter mb-3 z-10 ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                          {isSelected ? <GlitchText text={type.title} /> : type.title}
                        </h3>
                        <p className="text-sm font-mono text-zinc-500 leading-relaxed z-10 max-w-[90%]">{type.desc}</p>
                        
                        {/* Animated bottom border line on select */}
                        {isSelected && (
                           <motion.div layoutId="selected_bottom_border" className="absolute bottom-0 left-0 right-0 h-2 bg-electric shadow-[0_0_15px_#FF4A00]" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.section>
            
            {/* Target Corporation Selection */}
            <motion.section variants={itemVariants} className="relative group">
              <div className="absolute -left-6 top-0 bottom-0 w-2 bg-zinc-800 group-hover:bg-electric transition-colors duration-500" />
              <div className="flex justify-between items-end mb-8 border-b-2 border-zinc-800 pb-4">
                <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  <span className="text-zinc-500 font-mono text-xl">02</span> Target Corporation (Database Uplink)
                </h2>
                <span className="font-mono text-xs text-zinc-400 bg-zinc-900 border border-zinc-700 px-2 py-1">&lt;CORP_INTEGRATION&gt;</span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 'Google', color: 'border-blue-500/50 hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]' },
                  { id: 'Amazon', color: 'border-orange-500/50 hover:border-orange-500 hover:shadow-[0_0_15px_rgba(249,115,22,0.5)]', shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.5)]' },
                  { id: 'Microsoft', color: 'border-teal-500/50 hover:border-teal-500 hover:shadow-[0_0_15px_rgba(20,184,166,0.5)]', shadow: 'shadow-[0_0_15px_rgba(20,184,166,0.5)]' },
                  { id: 'General', color: 'border-toxic/50 hover:border-toxic hover:shadow-[0_0_15px_rgba(204,255,0,0.5)]', shadow: 'shadow-[0_0_15_rgba(204,255,0,0.5)]' }
                ].map((corp) => {
                  const isSelected = selectedCompany === corp.id;
                  return (
                    <motion.button
                      key={corp.id}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCompany(corp.id)}
                      className={`relative flex flex-col items-center justify-center p-6 border-2 font-mono text-xs font-black transition-all duration-300 ${
                        isSelected 
                          ? `bg-[#111] ${corp.color.split(' ').slice(1,2).join(' ')} ${corp.shadow}` 
                          : 'bg-[#0A0A0A] border-zinc-800 text-zinc-500'
                      }`}
                    >
                      {isSelected && (
                        <motion.div 
                          layoutId="selected_corp_indicator" 
                          className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-black rotate-45 z-10" 
                        />
                      )}
                      <span className={isSelected ? 'text-white' : ''}>{corp.id.toUpperCase()}</span>
                      <span className="mt-2 opacity-30 text-[8px]">DATABASE_LOADED</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>

            {/* Pre-Flight Diagnostics */}
            <motion.section variants={itemVariants} className="relative group">
              <div className="absolute -left-6 top-0 bottom-0 w-2 bg-zinc-800 group-hover:bg-electric transition-colors duration-500" />
              <div className="flex justify-between items-end mb-8 border-b-2 border-zinc-800 pb-4">
                <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  <span className="text-zinc-500 font-mono text-xl">03</span> Diagnostics
                </h2>
                <span className="font-mono text-xs text-zinc-400 bg-zinc-900 border border-zinc-700 px-2 py-1">&lt;HARDWARE_CHECK&gt;</span>
              </div>
              
              <div className="border-4 border-zinc-800 bg-[#0A0A0A] text-mono divide-y-4 divide-zinc-800">
                
                {/* Audio Vector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 md:p-8 gap-6 relative overflow-hidden group/diag">
                  {!micEnabled && <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />}
                  <div className="flex items-center gap-6 z-10">
                    <div className={`p-4 border-4 transition-colors ${micEnabled ? 'border-toxic text-toxic bg-toxic/5' : 'border-red-500 text-red-500 bg-red-500/10'}`}>
                      {micEnabled ? <Mic className="w-8 h-8 group-hover/diag:animate-bounce" /> : <ShieldAlert className="w-8 h-8 animate-pulse" />}
                    </div>
                    <div>
                      <h4 className="font-black text-xl md:text-2xl uppercase tracking-tighter text-white mb-2">Audio Vector</h4>
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 ${micEnabled ? 'bg-toxic shadow-[0_0_10px_rgba(204,255,0,0.8)]' : 'bg-red-500'} rounded-full`}></div>
                         <p className="font-mono text-sm text-zinc-400 uppercase tracking-widest">{micEnabled ? 'Active // Input: Default' : 'Offline_ERR'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMicEnabled(!micEnabled)}
                    className={`px-6 py-3 border-4 font-black uppercase tracking-widest transition-colors z-10 ${
                      micEnabled 
                         ? 'border-toxic text-black bg-toxic hover:bg-white hover:border-white shadow-[4px_4px_0_rgba(204,255,0,0.3)]' 
                         : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white shadow-[4px_4px_0_rgba(239,68,68,0.3)]'
                    }`}
                  >
                    {micEnabled ? 'Power Down' : 'Initialize'}
                  </motion.button>
                </div>

                {/* Visual Vector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 md:p-8 gap-6 relative overflow-hidden group/diag">
                  {!camEnabled && <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />}
                  <div className="flex items-center gap-6 z-10">
                    <div className={`p-4 border-4 transition-colors ${camEnabled ? 'border-toxic text-toxic bg-toxic/5' : 'border-red-500 text-red-500 bg-red-500/10'}`}>
                      {camEnabled ? <Camera className="w-8 h-8 group-hover/diag:animate-bounce" /> : <ShieldAlert className="w-8 h-8 animate-pulse" />}
                    </div>
                    <div>
                      <h4 className="font-black text-xl md:text-2xl uppercase tracking-tighter text-white mb-2">Visual Vector</h4>
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 ${camEnabled ? 'bg-toxic shadow-[0_0_10px_rgba(204,255,0,0.8)]' : 'bg-red-500'} rounded-full`}></div>
                         <p className="font-mono text-sm text-zinc-400 uppercase tracking-widest">{camEnabled ? 'Active // Input: 1080p' : 'Offline_ERR'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCamEnabled(!camEnabled)}
                    className={`px-6 py-3 border-4 font-black uppercase tracking-widest transition-colors z-10 ${
                      camEnabled 
                         ? 'border-toxic text-black bg-toxic hover:bg-white hover:border-white shadow-[4px_4px_0_rgba(204,255,0,0.3)]' 
                         : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white shadow-[4px_4px_0_rgba(239,68,68,0.3)]'
                    }`}
                  >
                    {camEnabled ? 'Power Down' : 'Initialize'}
                  </motion.button>
                </div>

              </div>
            </motion.section>

          </div>

          {/* Action Sidebar */}
          <motion.div variants={itemVariants} className="lg:col-span-4 perspective-1000">
            <motion.div 
               className="sticky top-12 border-4 border-white bg-[#111] p-8 shadow-[12px_12px_0px_0px_rgba(255,74,0,1)] relative overflow-hidden"
               whileHover={{ scale: 1.02, rotateY: -5, rotateX: 5 }}
               transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Decorative side barcode */}
              <div className="absolute right-4 top-8 bottom-8 flex flex-col justify-between opacity-20 pointer-events-none">
                 {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="h-1 bg-white mb-1" style={{ width: `${Math.random() * 20 + 10}px` }}></div>
                 ))}
              </div>

              <h3 className="text-2xl font-black uppercase tracking-tighter border-b-4 border-white pb-4 mb-8 flex items-center gap-3">
                <Zap className="text-electric w-6 h-6 animate-pulse" /> Execute
              </h3>
              
              <div className="space-y-6 font-mono text-sm mb-12 relative z-10">
                <div className="group">
                  <span className="text-zinc-500 uppercase text-xs block mb-2 font-bold group-hover:text-toxic transition-colors">Candidate ID</span>
                  <div className="text-white bg-[#0A0A0A] p-3 border-2 border-zinc-700 flex items-center justify-between group-hover:border-toxic transition-colors">
                     <span>{candidateName.toUpperCase()}</span>
                     <Terminal className="text-zinc-600 w-4 h-4 group-hover:text-toxic" />
                  </div>
                </div>
                <div className="group">
                  <span className="text-zinc-500 uppercase text-xs block mb-2 font-bold group-hover:text-toxic transition-colors">Target Role</span>
                  <div className="text-white bg-[#0A0A0A] p-3 border-2 border-zinc-700 flex items-center justify-between group-hover:border-toxic transition-colors">
                     <span>FULL_STACK_DEV</span>
                     <Terminal className="text-zinc-600 w-4 h-4 group-hover:text-toxic" />
                  </div>
                </div>
                <div className="group">
                  <span className="text-zinc-500 uppercase text-xs block mb-2 font-bold group-hover:text-toxic transition-colors">Selected Protocol</span>
                  <div className="text-electric font-bold bg-electric/10 p-3 border-2 border-electric uppercase flex items-center justify-between shadow-[inset_0_0_15px_rgba(255,74,0,0.3)]">
                    <GlitchText text={selectedType || "NONE"} />
                    <Activity className="text-electric w-4 h-4" />
                  </div>
                </div>

                <div className="group">
                  <span className="text-zinc-500 uppercase text-xs block mb-2 font-bold group-hover:text-toxic transition-colors">Corp_Database</span>
                  <div className="text-zinc-300 font-mono text-[10px] bg-[#0A0A0A] p-3 border-2 border-zinc-800 uppercase flex items-center justify-between">
                    <span className="flex items-center gap-2">
                       <span className="w-2 h-2 bg-zinc-600 rounded-full animate-pulse"></span>
                       {`>_ ${selectedCompany.toUpperCase()}_DATASET_LOADED`}
                    </span>
                  </div>
                </div>
                
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-zinc-600 to-transparent my-8 opacity-50"></div>
                
                <div className="flex justify-between items-center text-zinc-400 bg-[#222] p-4 border border-zinc-800">
                  <span className="font-bold">EST_DURATION</span>
                  <span className="text-toxic font-black text-lg drop-shadow-[0_0_5px_rgba(204,255,0,0.6)]">45:00 MIN</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                disabled={!micEnabled}
                className="w-full relative group overflow-hidden bg-electric text-[#050505] font-black text-xl uppercase tracking-widest py-6 px-6 flex items-center justify-between disabled:opacity-50 border-4 border-electric disabled:cursor-not-allowed z-10 shadow-[6px_6px_0_rgba(255,255,255,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all"
              >
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0"></div>
                <span className="relative z-10 group-hover:text-black transition-colors delay-100">{micEnabled ? 'Engage Protocol' : 'Audio Required'}</span>
                <ChevronRight className="w-8 h-8 group-hover:translate-x-4 transition-transform relative z-10 group-hover:text-black" />
              </motion.button>

              {!micEnabled && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-3 border-2 border-red-500 bg-red-500/10 text-center"
                >
                  <p className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest flex items-center justify-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> ERR: System requires active audio feed
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
          
        </motion.div>
      </div>
    </div>
  );
};

export default Setup;
