import React, { useEffect, useState } from 'react';
import { FileText, Eye, ShieldAlert, CheckCircle, Printer, Download } from 'lucide-react';

export default function PdfViewer({ pdfUrl, pdfTitle, studentInfo, onReportBreach }) {
  const [logStatus, setLogStatus] = useState('Verifying digital signature...');
  const [accessLogged, setAccessLogged] = useState(false);

  useEffect(() => {
    // Simulate secure PDF access log telemetry
    const timer = setTimeout(() => {
      setLogStatus(`Secure access verified for user: ${studentInfo?.name || 'GUEST'}`);
      setAccessLogged(true);
    }, 1200);

    // Prevent Print Shortcuts (Ctrl+P, Command+P)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        e.stopPropagation();
        alert('Piracy Interception: PDF printing is disabled for this premium content.');
        onReportBreach?.('screenshot', `Attempted to print PDF document: ${pdfTitle}`);
      }
    };

    // Inject anti-print CSS rule
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body { display: none !important; }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.head.removeChild(style);
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [pdfUrl, pdfTitle, studentInfo, onReportBreach]);

  const handleCopyAlert = (e) => {
    e.preventDefault();
    alert('Security Alert: Text copying from class notes is disabled.');
    onReportBreach?.('devtools_inspect', `Text selection copy attempted on notes: ${pdfTitle}`);
  };

  const watermarkText = studentInfo 
    ? `Quantrex Academy — ${studentInfo.name} — ${studentInfo.phone}` 
    : 'Quantrex Academy — GUEST SESSION';

  return (
    <div className="relative flex flex-col w-full h-full bg-cyberdark border border-white/5 rounded-xl overflow-hidden select-none" onCopy={handleCopyAlert}>
      {/* Top Header */}
      <div className="p-4 bg-obsidian border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-electric" />
          <div>
            <h4 className="text-sm font-semibold text-white">{pdfTitle || 'JEE Study Notes'}</h4>
            <span className="text-[10px] text-gray-500 font-mono">Protected PDF Ecosystem</span>
          </div>
        </div>

        {/* Security badges */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-red-950/60 border border-red-800 text-red-400 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
            <ShieldAlert className="h-3 w-3" />
            No Download
          </span>
          <span className="text-[10px] bg-electric/10 border border-electric/30 text-electric px-2 py-0.5 rounded font-mono flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Tracked
          </span>
        </div>
      </div>

      {/* Simulated Document Preview Container */}
      <div className="relative flex-1 bg-obsidian p-6 md:p-12 overflow-y-auto max-h-[600px] no-print">
        {/* Invisible Click Blocker Overlay covering the content area */}
        <div 
          className="absolute inset-0 bg-transparent z-20 cursor-default" 
          onContextMenu={(e) => {
            e.preventDefault();
            alert('Right click disabled on notes viewer.');
          }}
        />

        {/* Dynamic Watermark Background Grid */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden opacity-[0.06] select-none flex flex-wrap gap-12 items-center justify-center rotate-[-15deg]">
          {Array.from({ length: 40 }).map((_, idx) => (
            <div key={idx} className="text-xs md:text-sm font-bold tracking-widest text-electric uppercase font-mono whitespace-nowrap">
              {watermarkText}
            </div>
          ))}
        </div>

        {/* Mock PDF Page Content */}
        <div className="relative bg-cyberdark border border-white/5 rounded-lg p-6 md:p-8 max-w-2xl mx-auto shadow-lg text-platinum z-0 space-y-6">
          <div className="border-b border-white/10 pb-4 text-center">
            <span className="text-xs text-gold font-display tracking-widest">QUANTREX ACADEMY</span>
            <h2 className="text-xl font-bold text-white mt-1">JEE Advanced Ranker Series: Limits & Continuity</h2>
            <p className="text-xs text-gray-400 font-mono mt-1">Lecture Notes & Standard Questions by A.K. Sir</p>
          </div>

          <div className="space-y-4 text-sm leading-relaxed font-mono">
            <p className="text-gold font-semibold">// Section 1: Standard Indeterminate Limits</p>
            <div className="bg-obsidian/40 border border-white/5 p-4 rounded-md text-glow-blue space-y-1">
              <p>{"$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$"}</p>
              <p>{"$$\\lim_{x \\to 0} \\frac{e^x - 1}{x} = 1$$"}</p>
              <p>{"$$\\lim_{x \\to 0} \\frac{\\ln(1+x)}{x} = 1$$"}</p>
            </div>

            <p className="text-gold font-semibold">// Section 2: Important Series Expansions</p>
            <div className="bg-obsidian/40 border border-white/5 p-4 rounded-md space-y-2 text-xs">
              <p><span className="text-electric">e^x</span> = 1 + x + x²/2! + x³/3! + ...</p>
              <p><span className="text-electric">ln(1+x)</span> = x - x²/2 + x³/3 - x⁴/4 + ... (for -1 &lt; x &le; 1)</p>
              <p><span className="text-electric">cos(x)</span> = 1 - x²/2! + x⁴/4! - ...</p>
            </div>

            <p className="text-gold font-semibold">// Question 1: JEE Advanced PYQ Pattern</p>
            <p className="text-gray-300">
              Evaluate the value of:
              {"$$\\lim_{x \\to 0} \\frac{x^2 \\sin(1/x)}{\\sin x}$$"}
            </p>
            <p className="text-gray-400 italic">
              {"Solution Strategy: Note that \\sin(1/x) behaves as a bounded oscillating value between -1 and 1. Write the expression as $x \\cdot \\frac{x}{\\sin x} \\cdot \\sin(1/x)$. Apply product limit rule..."}
            </p>
          </div>

          <div className="border-t border-white/10 pt-4 flex justify-between items-center text-[10px] text-gray-500">
            <span>© 2026 Quantrex Academy. All rights reserved.</span>
            <span>Secured Session ID: {studentInfo?.sessions?.[0]?.sessionId || 'active_token'}</span>
          </div>
        </div>
      </div>

      {/* Access Logs Status Bar */}
      <div className="p-3 bg-obsidian border-t border-white/5 flex items-center justify-between text-xs text-gray-400 font-mono">
        <span className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${accessLogged ? 'bg-emerald-500 animate-pulse' : 'bg-gold'}`} />
          {logStatus}
        </span>
        <span>IP: {studentInfo?.sessions?.[0]?.ipAddress || '127.0.0.1'}</span>
      </div>
    </div>
  );
}
