const fs = require('fs');
let code = fs.readFileSync('src/pages/TestSeriesExam.jsx', 'utf8');

code = code.replace(`        /* WATERMARK OVERLAY */
        .nta-solution-box {
          position: relative;
        }
        .nta-solution-box::before {
          content: 'Quantrex Academy';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: rgba(200, 200, 200, 0.15);
          font-weight: 800;
          transform: rotate(-30deg);
          pointer-events: none;
          z-index: 10;
        }

      {/* ─── HEADER ─── */}`, `        .nta-question-panel {
          padding-bottom: 80px !important;
        }
        /* WATERMARK OVERLAY */
        .nta-solution-box {
          position: relative;
        }
        .nta-solution-box::before {
          content: 'Quantrex Academy';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: rgba(200, 200, 200, 0.15);
          font-weight: 800;
          transform: rotate(-30deg);
          pointer-events: none;
          z-index: 10;
        }
      \`}</style>

      {/* ─── HEADER ─── */}`);

fs.writeFileSync('src/pages/TestSeriesExam.jsx', code);
console.log('Restored JSX syntax');
