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
188:     display: flex;
189:     align-items: center;
190:     gap: 0;
191:     overflow-x: auto;
192:     scrollbar-width: none;
193:   }
194:   .tsp-stats-inner::-webkit-scrollbar { display: none; }
195:   .tsp-stat-item {
196:     display: flex;
197:     align-items: center;
198:     gap: 10px;
199:     padding: 16px 24px;
200:     border-right: 1px solid rgba(255,255,255,0.05);
201:     white-space: nowrap;
202:     flex-shrink: 0;
203:   }
204:   .tsp-stat-item:last-child { border-right: none; }
205:   .tsp-stat-icon {
206:     width: 32px;
207:     height: 32px;
208:     border-radius: 8px;
209:     display: flex;
210:     align-items: center;
211:     justify-content: center;
212:     font-size: 14px;
213:   }
214:   .tsp-stat-value {
215:     font-size: 20px;
216:     font-weight: 800;
217:     color: #f1f5f9;
218:     line-height: 1;
219:   }
220:   .tsp-stat-label {
221:     font-size: 11px;
222:     color: #475569;
223:     font-weight: 500;
224:     text-transform: uppercase;
225:     letter-spacing: 0.5px;
226:     margin-top: 2px;
227:   }
228: 
229:   /* ── Controls ── */
230:   .tsp-controls {
231:     padding: 24px 24px 0;
232:     max-width: 1280px;
233:     margin: 0 auto;
234:   }
235:   .tsp-search-wrap {
236:     position: relative;
237:     margin-bottom: 20px;
238:   }
239:   .tsp-search-icon {
240:     position: absolute;
241:     left: 16px;
242:     top: 50%;
243:     transform: translateY(-50%);
244:     color: #475569;
245:     font-size: 16px;
246:     pointer-events: none;
247:   }
248:   .tsp-search-input {
249:     width: 100%;
250:     background: rgba(255,255,255,0.04);
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
