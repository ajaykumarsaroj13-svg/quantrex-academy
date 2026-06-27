Created At: 2026-06-05T05:29:56Z
Completed At: 2026-06-05T05:29:57Z
File Path: `file:///C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/pages/TestSeriesPage.jsx`
Total Lines: 1134
Total Bytes: 34923
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
<truncated 23349 bytes>
T' ? '⚡' :
754:                test.examType === 'NCERT 11' ? '📖' : '📕'}
755:             </span>
756:             {test.examType}
757:           </div>
758:           <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
759:             {test.isOfficial && (
760:               <span className="tsp-badge-official">⭐ Official</span>
761:             )}
762:             {(test.isFree || test.free) && (
763:               <span className="tsp-badge-free">✓ Free</span>
764:             )}
765:           </div>
766:         </div>
767: 
768:         {/* Title */}
769:         <div className="tsp-card-title">{test.title || test.name || 'Untitled Test'}</div>
770: 
771:         {/* Year / Session / Shift badges */}
772:         <div className="tsp-meta-row">
773:           {test.year && (
774:             <>
775:               <div className="tsp-badge" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
776:                 {test.year}
777:               </div>
778:               <div className="tsp-meta-dot" />
779:             </>
780:           )}
781:           {test.session && (
782:             <>
783:               <div className="tsp-badge">Session {test.session}</div>
784:               <div className="tsp-meta-dot" />
785:             </>
786:           )}
787:           {test.shift && (
788:             <div className="tsp-badge">{test.shift}</div>
789:           )}
790:         </div>
791: 
792:         {/* Meta info */}
793:         <div className="tsp-meta-row">
794:           <div className="tsp-meta-item">
795:             <span>📅</span>
796:             <span>{test.examDate || test.date || 'Scheduled'}</span>
797:           </div>
798:         </div>
799: 
800:         <div className="tsp-divider" />
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
