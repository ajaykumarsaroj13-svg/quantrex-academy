Created At: 2026-06-05T10:01:18Z
Completed At: 2026-06-05T10:01:22Z

				The command completed successfully.
				Output:
				mv : Cannot create a file when that file already exists.
At line:1 char:1
+ mv extract.js extract.cjs ; node extract.cjs
+ ~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : WriteError: (C:\Users\Admin\...admy\extract.js:FileInfo) [Move-Item], IOException
    + FullyQualifiedErrorId : MoveFileInfoItemIOError,Microsoft.PowerShell.Commands.MoveItemCommand
 
Created At: 2026-06-05T07:48:08Z
Completed At: 2026-06-05T07:48:08Z
File Path: `file:///C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/pages/TestSeriesPage.jsx`
Total Lines: 1134
Total Bytes: 34923
Showing lines 1 to 250
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
<truncated 4604 bytes>
tom: 1px solid rgba(255,255,255,0.05);
183:     padding: 0 24px;
184:   }
185:   .tsp-stats-inner {
186:     max-width: 1280px;
187:     margin: 0 auto;
188:     display: fle

