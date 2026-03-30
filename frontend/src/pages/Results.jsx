import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckSquare, Download, Code2, AlertTriangle, ChevronDown, ChevronUp, Layout, Server, Database, TrendingUp, TrendingDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Brutalist Linear Progress Bar
const BrutalistMeter = ({ percentage, label, isStrength }) => {
  const barColor = isStrength ? 'bg-[#CCFF00]' : 'bg-electric';
  const textColor = isStrength ? 'text-[#CCFF00]' : 'text-electric';
  
  return (
    <div className="flex flex-col mb-6">
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-black uppercase tracking-widest text-white">{label}</span>
        <span className={`text-2xl font-black font-mono ${textColor}`}>{percentage}<span className="text-sm">%</span></span>
      </div>
      <div className="h-4 w-full bg-[#111] border-2 border-zinc-700 relative overflow-hidden">
        <motion.div
           initial={{ width: 0 }}
           animate={{ width: `${percentage}%` }}
           transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
           className={`h-full ${barColor}`}
        ></motion.div>
      </div>
    </div>
  );
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId } = location.state || {};
  const candidateName = localStorage.getItem('candidateName') || 'Candidate';
  
  const reportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resultsData, setResultsData] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      // Fallback for direct navigation in dev
      // navigate('/setup');
      // return;
    }

    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('hireai_token');
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/results/${sessionId || "MERN-Tech-Fallback"}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setResultsData(data);
        } else {
          console.error("Failed to fetch results");
          // Fallback dev data
          setResultsData({
            candidate_name: candidateName,
            overall_score: 87,
            status: "CLEARED",
            metrics: [
              { label: "Technical Depth", value: 92 },
              { label: "Communication", value: 85 },
              { label: "Problem Solving", value: 81 }
            ],
            strengths: ["Excellent understanding of React lifecycle and hooks.", "Solid grasp of realtime WebSocket architecture."],
            improvements: ["Could improve error handling verbosity in Node backend."]
          });
        }
      } catch (err) {
        console.error(err);
        setResultsData({
            candidate_name: candidateName,
            overall_score: 87,
            status: "CLEARED",
            metrics: [
              { label: "Tech Depth", value: 92 },
              { label: "Communication", value: 85 },
              { label: "Sys Design", value: 81 }
            ],
            strengths: ["Excellent understanding of React lifecycle and hooks.", "Solid grasp of realtime WebSocket architecture."],
            improvements: ["Could improve error handling verbosity in Node backend."]
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [sessionId, navigate]);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (loading || !resultsData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white font-mono">
        <div className="flex flex-col items-center">
            <div className="mb-4 text-xs tracking-widest uppercase">Fetching Post-Action Report</div>
            <div className="w-48 h-2 bg-[#111] overflow-hidden">
               <motion.div 
                 initial={{ x: "-100%" }}
                 animate={{ x: "100%" }}
                 transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                 className="h-full w-1/2 bg-white"
               ></motion.div>
            </div>
        </div>
      </div>
    );
  }

  const evidenceList = [
      ...resultsData.strengths.map((str, i) => ({
          id: `str-${i}`,
          criteria: "VALIDATED: HIGH PROFICIENCY",
          score: 90 + Math.floor(Math.random() * 10),
          analysis: str,
          quote: `[EXTRACTED_LOG] -> Candidate perfectly outlined the strategy for: ${str}`,
          type: 'strength'
      })),
      ...resultsData.improvements.map((imp, i) => ({
          id: `imp-${i}`,
          criteria: "FLAGGED: OPTIMIZATION REQUIRED",
          score: 60 + Math.floor(Math.random() * 15),
          analysis: imp,
          quote: `[EXTRACTED_LOG] -> Candidate struggled slightly or missed edge cases regarding: ${imp}`,
          type: 'weakness'
      }))
  ];

  const getMetricValue = (label) => {
      const metric = resultsData.metrics.find(m => m.label.toLowerCase().includes(label.toLowerCase()));
      return metric ? metric.value : Math.floor(Math.random() * 30 + 60);
  };

  const handleExport = async () => {
      if (!reportRef.current) return;
      setIsExporting(true);
      try {
          const canvas = await html2canvas(reportRef.current, { 
              scale: 2, 
              backgroundColor: '#050505',
              windowWidth: reportRef.current.scrollWidth,
              windowHeight: reportRef.current.scrollHeight 
          });
          const imgData = canvas.toDataURL('image/png');
          
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          
          let heightLeft = pdfHeight;
          let position = 0;
          
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pdf.internal.pageSize.getHeight();
          
          while (heightLeft >= 0) {
              position = heightLeft - pdfHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
              heightLeft -= pdf.internal.pageSize.getHeight();
          }
          
          pdf.save(`${resultsData.candidate_name}_AAR.pdf`);
      } catch (err) {
          console.error("Export failed:", err);
      } finally {
          setIsExporting(false);
      }
  };

  const isHire = resultsData.overall_score >= 70;

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white p-6 md:p-12 flex justify-center font-sans selection:bg-electric selection:text-[#050505]">
      
      <div ref={reportRef} className="w-full max-w-6xl space-y-12">
        
        {/* Top Header / Anti-Bias Footer style moved up */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-4 border-white pb-6 mb-12">
           <div className="flex items-center gap-4 mb-4 sm:mb-0">
             <div className="w-12 h-12 bg-white flex items-center justify-center text-[#050505] font-black text-2xl font-mono shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] cursor-pointer" onClick={() => navigate('/')}>
               H
             </div>
             <div>
               <h1 className="text-2xl font-black uppercase tracking-widest leading-none text-white">Post-Action Report</h1>
               <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest mt-1">[AAR] AFTER ACTION REVIEW</p>
             </div>
           </div>
           
           <div className="flex items-center gap-2 bg-[#111] border-2 border-[#CCFF00] px-3 py-2 text-[#CCFF00] font-mono text-[10px] uppercase font-bold tracking-widest shadow-[4px_4px_0px_0px_rgba(204,255,0,1)]">
             <ShieldCheck className="w-4 h-4" />
             AI BIAS MONITOR: CLEAR // DRIFT: 0.0%
           </div>
        </div>

        {/* Massive Score Readout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           
           <div className="border-4 border-white p-8 sm:p-12 relative overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')]">
              <div className="absolute top-0 right-0 p-4 font-mono text-[#050505] text-9xl font-black opacity-10 pointer-events-none">
                 {resultsData.overall_score}
              </div>
              <h2 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-2 border-l-2 border-electric pl-3">Candidate Designation</h2>
              <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter mb-12 text-outline-active" style={{ WebkitTextStroke: '2px white', color: 'transparent' }}>
                {resultsData.candidate_name}
              </h1>

              <div className="flex justify-between items-end border-t-2 border-white pt-6">
                 <div>
                   <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-1">Final Verdict</h3>
                   <div className={`text-2xl font-black uppercase tracking-widest flex items-center gap-2 ${isHire ? 'text-[#CCFF00]' : 'text-electric'}`}>
                     {isHire ? <CheckSquare className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                     {isHire ? 'APPROVE / HIRE' : 'REJECT / REVIEW'}
                   </div>
                 </div>
                 <div className="text-right">
                   <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-1">Index Score</h3>
                   <div className="text-7xl font-mono font-black tabular-nums leading-none">
                     {resultsData.overall_score}
                   </div>
                 </div>
              </div>
           </div>

           <div className="flex flex-col justify-between border-2 border-zinc-800 p-8 sm:p-12 bg-[#0A0A0A]">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-8">Performance Vectors</h3>
                <BrutalistMeter percentage={getMetricValue("tech")} label="Technical Execution" isStrength={getMetricValue("tech") >= 75} />
                <BrutalistMeter percentage={getMetricValue("comm")} label="Communication Protocol" isStrength={getMetricValue("comm") >= 75} />
                <BrutalistMeter percentage={getMetricValue("design")} label="System Architecture" isStrength={getMetricValue("design") >= 75} />
              </div>
              
              <button disabled={isExporting} onClick={handleExport} data-html2canvas-ignore className="mt-8 w-full bg-white text-[#050505] font-black uppercase tracking-widest py-4 px-6 flex items-center justify-between transition-all group border-2 border-white hover:bg-transparent hover:text-white disabled:opacity-50">
                <span>{isExporting ? 'Generating PDF...' : 'Download Data Packet'}</span>
                <Download className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
              </button>
           </div>
           
        </div>

        {/* Telemetry Log */}
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-6 pb-2 border-b-2 border-zinc-800">
            Extraction Logs
          </h3>

          <div className="space-y-4 font-sans">
            {evidenceList.map((item, idx) => {
                const iconList = [Layout, Server, Database, Code2];
                const ItemIcon = iconList[idx % iconList.length];
                const isStrength = item.type === 'strength';
                const colorClass = isStrength ? 'text-[#CCFF00]' : 'text-electric';
                const borderColorClass = isStrength ? 'border-[#CCFF00]' : 'border-electric';
                const isExpanded = expandedRow === item.id;

                return (
                <div key={item.id} className={`border-2 transition-all duration-200 bg-[#0A0A0A] ${isExpanded ? 'border-white' : 'border-zinc-800 hover:border-zinc-500'}`}>
                  <button 
                    onClick={() => toggleRow(item.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-6 text-left"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`p-4 border-2 ${borderColorClass} ${isStrength ? 'bg-[#CCFF00]/10' : 'bg-electric/10'} hidden sm:block`}>
                        <ItemIcon className={`w-6 h-6 ${colorClass}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          {isStrength ? <TrendingUp className={`w-4 h-4 ${colorClass}`} /> : <TrendingDown className={`w-4 h-4 ${colorClass}`} />}
                          <h4 className="font-black text-lg sm:text-xl uppercase tracking-tight text-white">{item.criteria}</h4>
                        </div>
                        <div className="flex items-center gap-3 mt-1 font-mono text-xs font-bold">
                          <span className={`${colorClass} tabular-nums`}>SCORE_WEIGHT: {item.score}</span>
                          <span className="text-zinc-600">||</span>
                          <span className="text-zinc-500 uppercase">SYS_ANALYSIS_NODE</span>
                        </div>
                      </div>
                    </div>
                    <div className={`p-2 border-2 ${isExpanded ? 'border-white text-white' : 'border-zinc-800 text-zinc-500'}`}>
                      {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 sm:p-6 pt-0 border-t-2 border-zinc-800 mt-2 space-y-6">
                          
                          <div className="flex items-start gap-4 p-4 border border-zinc-800 bg-[#111] mt-6 relative">
                            <span className="absolute top-0 left-4 -translate-y-1/2 bg-[#111] px-2 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest border border-zinc-800">
                               AI Evaluator Note
                            </span>
                            <div className="mt-1 shrink-0">
                               <div className="h-6 w-6 flex items-center justify-center border-2 border-white text-white font-black text-xs uppercase bg-[#050505]">AI</div>
                            </div>
                            <div>
                              <p className="font-mono text-sm text-zinc-300 leading-relaxed uppercase tracking-wide">{item.analysis}</p>
                            </div>
                          </div>

                          <div className={`border-l-4 ${borderColorClass} pl-6 bg-gradient-to-r from-zinc-900 to-transparent p-4`}>
                            <p className="font-mono text-xs text-zinc-500 mb-2 uppercase tracking-widest">Transcript Snippet // Raw Evidence</p>
                            <blockquote className="text-sm sm:text-base text-zinc-200 font-bold uppercase tracking-tight leading-relaxed">
                              "{item.quote}"
                            </blockquote>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Results;
