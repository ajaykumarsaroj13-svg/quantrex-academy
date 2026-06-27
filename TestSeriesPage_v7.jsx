Created At: 2026-06-05T11:11:20Z
Completed At: 2026-06-05T11:11:20Z
File Path: `file:///C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/TS_dump_107.txt`
Total Lines: 95
Total Bytes: 4121
Showing lines 1 to 95
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: Created At: 2026-06-05T05:07:35Z
2: Completed At: 2026-06-05T05:07:37Z
3: File Path: `file:///C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/pages/TestSeriesPage.jsx`
4: Total Lines: 1134
5: Total Bytes: 34923
6: Showing lines 1 to 800
7: The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
8: 1: import React, { useState, useEffect, useMemo } from 'react';
9: 2: 
10: 3: // ─── Color Palette ─────────────────────────────────────────────────────────────
11: 4: const EXAM_CONFIG = {
12: 5:   'JEE Main': {
13: 6:     color: '#3b82f6',
14: 7:     gradient: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
15: 8:     glow: 'rgba(59,130,246,0.35)',
16: 9:     bg: 'rgba(59,130,246,0.12)',
17: 10:     border: 'rgba(59,130,246,0.35)',
18: 11:   },
19: 12:   'JEE Advanced': {
20: 13:     color: '#a78bfa',
21: 14:     gradient: 'linear-gradient(135deg, #5b21b6, #7c3aed)',
22: 15:     glow: 'rgba(124,58,237,0.35)',
23: 16:     bg: 'rgba(124,58,237,0.12)',
24: 17:     border: 'rgba(124,58,237,0.35)',
25: 18:   },
26: 19: };
27: 20: 
28: 21: const FILTER_TABS = ['All', 'JEE Main', 'JEE Advanced'];
29: 22: 
30: 23: // ─── Inline Global Styles ────────────────────────────
<truncated 940 bytes>
-end' }}>
52: 759:             {test.isOfficial && (
53: 760:               <span className="tsp-badge-official">⭐ Official</span>
54: 761:             )}
55: 762:             {(test.isFree || test.free) && (
56: 763:               <span className="tsp-badge-free">✓ Free</span>
57: 764:             )}
58: 765:           </div>
59: 766:         </div>
60: 767: 
61: 768:         {/* Title */}
62: 769:         <div className="tsp-card-title">{test.title || test.name || 'Untitled Test'}</div>
63: 770: 
64: 771:         {/* Year / Session / Shift badges */}
65: 772:         <div className="tsp-meta-row">
66: 773:           {test.year && (
67: 774:             <>
68: 775:               <div className="tsp-badge" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
69: 776:                 {test.year}
70: 777:               </div>
71: 778:               <div className="tsp-meta-dot" />
72: 779:             </>
73: 780:           )}
74: 781:           {test.session && (
75: 782:             <>
76: 783:               <div className="tsp-badge">Session {test.session}</div>
77: 784:               <div className="tsp-meta-dot" />
78: 785:             </>
79: 786:           )}
80: 787:           {test.shift && (
81: 788:             <div className="tsp-badge">{test.shift}</div>
82: 789:           )}
83: 790:         </div>
84: 791: 
85: 792:         {/* Meta info */}
86: 793:         <div className="tsp-meta-row">
87: 794:           <div className="tsp-meta-item">
88: 795:             <span>📅</span>
89: 796:             <span>{test.examDate || test.date || 'Scheduled'}</span>
90: 797:           </div>
91: 798:         </div>
92: 799: 
93: 800:         <div className="tsp-divider" />
94: The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
95: 
The above content shows the entire, complete file contents of the requested file.
