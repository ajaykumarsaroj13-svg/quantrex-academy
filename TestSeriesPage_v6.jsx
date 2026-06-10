Created At: 2026-06-05T11:09:32Z
Completed At: 2026-06-05T11:09:32Z
File Path: `file:///C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/pages/TestSeriesPage.jsx`
Total Lines: 1135
Total Bytes: 34948
Showing lines 1 to 800
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: import React, { useState, useEffect, useMemo } from 'react';
2: 
3: // ─── Color Palette ─────────────────────────────────────────────────────────────
4: const EXAM_CONFIG = {
5:   'JEE Main': {
6:     color: '#3b82f6',
7:     gradient: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
8:     glow: 'rgba(59,130,246,0.35)',
9:     bg: 'rgba(59,130,246,0.12)',
10:     border: 'rgba(59,130,246,0.35)',
11:   },
12:   'JEE Advanced': {
13:     color: '#a78bfa',
14:     gradient: 'linear-gradient(135deg, #5b21b6, #7c3aed)',
15:     glow: 'rgba(124,58,237,0.35)',
16:     bg: 'rgba(124,58,237,0.12)',
17:     border: 'rgba(124,58,237,0.35)',
18:   },
19: };
20: 
21: const FILTER_TABS = ['All', 'JEE Main', 'JEE Advanced'];
22: 
23: // ─── Inline Global Styles ───────────────────────────────────────────────────────
24: const GLOBAL_CSS = `
25:   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
26: 
27:   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
28: 
29:   .tsp-root {
30:     font-family: 'Inter', sans-serif;
31:     background: var(--bg-primary, #0a0a1a);
32:     min-height: 100vh;
33:     color: var(--text-primary, #e2e8f0);
34:   }
35: 
36:   /* ── Scrollbar ── */
37:   ::-webkit-s
<truncated 23333 bytes>

754:                test.examType === 'BITSAT' ? '⚡' :
755:                test.examType === 'NCERT 11' ? '📖' : '📕'}
756:             </span>
757:             {test.examType}
758:           </div>
759:           <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
760:             {test.isOfficial && (
761:               <span className="tsp-badge-official">⭐ Official</span>
762:             )}
763:             {(test.isFree || test.free) && (
764:               <span className="tsp-badge-free">✓ Free</span>
765:             )}
766:           </div>
767:         </div>
768: 
769:         {/* Title */}
770:         <div className="tsp-card-title">{test.title || test.name || 'Untitled Test'}</div>
771: 
772:         {/* Year / Session / Shift badges */}
773:         <div className="tsp-meta-row">
774:           {test.year && (
775:             <>
776:               <div className="tsp-badge" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
777:                 {test.year}
778:               </div>
779:               <div className="tsp-meta-dot" />
780:             </>
781:           )}
782:           {test.session && (
783:             <>
784:               <div className="tsp-badge">Session {test.session}</div>
785:               <div className="tsp-meta-dot" />
786:             </>
787:           )}
788:           {test.shift && (
789:             <div className="tsp-badge">{test.shift}</div>
790:           )}
791:         </div>
792: 
793:         {/* Meta info */}
794:         <div className="tsp-meta-row">
795:           <div className="tsp-meta-item">
796:             <span>📅</span>
797:             <span>{test.examDate || test.date || 'Scheduled'}</span>
798:           </div>
799:         </div>
800: 
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
