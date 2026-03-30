import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import Scene3D from '../components/Scene3D';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiError, setApiError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || "dummy" })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('hireai_token', data.token);
        if (data.name) localStorage.setItem('candidateName', data.name);
        navigate('/setup');
      }
    } catch (error) {
      console.error("Login failed:", error);
      navigate('/setup'); 
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('hireai_token', data.token);
        if (data.name) localStorage.setItem('candidateName', data.name);
        navigate('/setup');
      } else {
        const errorData = await response.json();
        setApiError(errorData.detail || "Google Login Failed");
      }
    } catch (error) {
      console.error("Google verify failed:", error);
      setApiError("Network Error. Ensure backend is running.");
    }
  };

  // Kinetic Typography Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: { 
      y: "0%", 
      opacity: 1, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#050505] text-white overflow-hidden font-sans selection:bg-electric selection:text-[#050505] relative">
      <Scene3D />
      
      {/* Left Column - Kinetic Typography (Hidden on small screens) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative z-10 pointer-events-none border-r border-[#222]/30 bg-transparent">
        <div className="flex items-center gap-4">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-12 h-12 bg-white flex items-center justify-center text-[#050505] font-bold text-2xl font-mono shadow-brutal-white cursor-pointer"
            onClick={() => navigate('/')}
          >
            H
          </motion.div>
          <span className="font-mono text-sm tracking-widest uppercase text-zinc-400">HireAI System</span>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-xl"
        >
          <div className="overflow-hidden mb-2">
            <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl xl:text-8xl font-black tracking-tighter uppercase leading-[0.9]">
              Prove.
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-2">
            <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl xl:text-8xl font-black tracking-tighter uppercase leading-[0.9] text-electric">
              Your.
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl xl:text-8xl font-black tracking-tighter uppercase leading-[0.9]">
              Worth.
            </motion.h1>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-8 text-zinc-400 text-lg font-mono max-w-md leading-relaxed border-l-2 border-electric pl-4"
          >
            [SYSTEM_READY] Enter your credentials to initialize the un-biased evaluation protocol.
          </motion.p>
        </motion.div>

        <div className="font-mono text-xs text-zinc-600 uppercase flex gap-8">
          <span>V 2.0.4</span>
          <span>Status: Online</span>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        {/* Mobile Logo Fallback */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-3">
           <div className="w-8 h-8 bg-white flex items-center justify-center text-[#050505] font-bold text-lg font-mono shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] cursor-pointer" onClick={() => navigate('/')}>H</div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="w-full max-w-[440px] bg-[#050505]/70 backdrop-blur-xl p-6 sm:p-8 border border-[#222] shadow-[4px_4px_0px_0px_rgba(255,74,0,0.5)] sm:shadow-[8px_8px_0px_0px_rgba(255,74,0,0.5)]"
        >
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Initialize Session</h2>
            <p className="text-zinc-400 font-mono text-sm">Awaiting authentication token...</p>
          </div>

          {apiError && (
            <div className="mb-6 p-4 bg-[#FF4A00]/10 border-l-4 border-[#FF4A00] text-[#FF4A00] font-mono text-sm">
               &gt; ERROR: {apiError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-600" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-[#111] border border-[#333] text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:bg-[#1a1a1a] transition-colors rounded-none font-mono text-sm"
                  placeholder="IDENTITY@DOMAIN.COM"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Passphrase</label>
                <a href="#" className="text-xs font-mono text-zinc-500 hover:text-white transition-colors">Forgot?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-600" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-[#111] border border-[#333] text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:bg-[#1a1a1a] transition-colors rounded-none font-mono text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ x: 4, y: -4, boxShadow: '4px 4px 0px 0px rgba(255, 74, 0, 1)' }}
              whileTap={{ x: 0, y: 0, boxShadow: '0px 0px 0px 0px rgba(255, 74, 0, 1)' }}
              type="submit"
              className="w-full bg-white text-[#050505] font-bold uppercase tracking-widest py-4 px-6 flex items-center justify-between transition-all group border border-white"
            >
              <span>Authenticate</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </form>

          <div className="mt-8 flex items-center justify-center space-x-4">
            <div className="h-px bg-[#222] grow"></div>
            <span className="text-xs text-zinc-500 font-mono tracking-widest uppercase">Or</span>
            <div className="h-px bg-[#222] grow"></div>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="hover:scale-[1.02] transition-transform w-full flex justify-center pb-8 border-b border-[#222]">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.error('Google Sign In Logic Failed')}
                useOneTap
                theme="filled_black"
                text="continue_with"
                size="large"
                shape="rectangular"
                width={300}
              />
            </div>
          </div>

        </motion.div>
      </div>

    </div>
  );
};

export default Login;
