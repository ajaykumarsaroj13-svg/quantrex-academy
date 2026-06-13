import React, { useEffect, useState, useRef } from 'react';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Image from 'lucide-react/dist/esm/icons/image';
import Download from 'lucide-react/dist/esm/icons/download';
import Eye from 'lucide-react/dist/esm/icons/eye';
import ZoomIn from 'lucide-react/dist/esm/icons/zoom-in';
import ZoomOut from 'lucide-react/dist/esm/icons/zoom-out';
import RotateCw from 'lucide-react/dist/esm/icons/rotate-cw';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';
import Maximize2 from 'lucide-react/dist/esm/icons/maximize2';
import X from 'lucide-react/dist/esm/icons/x';

/**
 * SmartViewer — renders PDFs (base64 or URL) inline via <iframe>
 * and images (base64 or URL) inline via <img>.
 * Provides zoom, rotation, full-screen modal, and download.
 */
export default function PdfViewer({ pdfUrl, pdfTitle, studentInfo, onReportBreach }) {
  const [loaded, setLoaded] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const iframeRef = useRef(null);

  // Detect file type from URL / base64 header
  const isImage = pdfUrl && (
    pdfUrl.startsWith('data:image/') ||
    /\.(png|jpg|jpeg|gif|webp|bmp|svg)(\?|$)/i.test(pdfUrl)
  );
  const isPdf = pdfUrl && (
    pdfUrl.startsWith('data:application/pdf') ||
    /\.pdf(\?|$)/i.test(pdfUrl)
  );

  // Determine display filename
  const fileName = pdfTitle
    ? `${pdfTitle.replace(/[^a-z0-9]/gi, '_')}.${isImage ? 'png' : 'pdf'}`
    : `quantrex_material.${isImage ? 'png' : 'pdf'}`;

  useEffect(() => {
    setLoaded(false);
    setZoom(100);
    setRotation(0);
    const t = setTimeout(() => setLoaded(true), 600);
    return () => clearTimeout(t);
  }, [pdfUrl]);

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = fileName;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenExternal = () => {
    if (!pdfUrl) return;
    // For base64, open in new tab via blob
    if (pdfUrl.startsWith('data:')) {
      const win = window.open();
      if (win) {
        win.document.write(`<html><body style="margin:0;background:#111"><iframe src="${pdfUrl}" style="width:100%;height:100vh;border:none"></iframe></body></html>`);
      }
    } else {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const renderViewer = (inModal = false) => {
    if (!pdfUrl) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-400 text-sm font-mono gap-2">
          <FileText className="h-10 w-10 opacity-30" />
          <span>No file URL provided</span>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="flex items-center justify-center overflow-auto bg-black/30 rounded-lg p-2"
             style={{ minHeight: inModal ? '70vh' : '400px' }}>
          <img
            src={pdfUrl}
            alt={pdfTitle || 'Uploaded content'}
            className="image-viewer-frame transition-all duration-300"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              maxHeight: inModal ? '75vh' : '560px',
            }}
            onLoad={() => setLoaded(true)}
          />
        </div>
      );
    }

    if (isPdf || pdfUrl) {
      // Use Google Docs viewer as fallback for base64 if needed; for normal URLs use iframe directly
      const viewerSrc = pdfUrl.startsWith('data:') ? pdfUrl : pdfUrl;
      return (
        <iframe
          ref={iframeRef}
          src={viewerSrc}
          title={pdfTitle || 'PDF Document'}
          className="pdf-viewer-frame rounded-lg"
          style={{
            minHeight: inModal ? '78vh' : '580px',
            width: '100%',
            border: 'none',
          }}
          onLoad={() => setLoaded(true)}
          allow="fullscreen"
        />
      );
    }

    return null;
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════
          MAIN VIEWER CARD
      ═══════════════════════════════════════════════════ */}
      <div className="relative flex flex-col w-full bg-cyberdark border border-white/5 rounded-xl overflow-hidden shadow-xl">

        {/* ─ Top Toolbar ─ */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-obsidian border-b border-white/5 flex-wrap">
          {/* File info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
              isImage ? 'bg-emerald-500/15 border border-emerald-500/25' : 'bg-electric/10 border border-electric/20'
            }`}>
              {isImage
                ? <Image className="h-5 w-5 text-emerald-400" />
                : <FileText className="h-5 w-5 text-electric" />
              }
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white truncate max-w-[220px] md:max-w-xs">
                {pdfTitle || 'Study Material'}
              </h4>
              <span className="text-[10px] text-gray-500 font-mono">
                {isImage ? 'Image / Photo' : 'PDF Document'} • Quantrex Academy
              </span>
            </div>
          </div>

          {/* Toolbar actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Zoom controls (images only) */}
            {isImage && (
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                <button
                  onClick={() => setZoom(z => Math.max(25, z - 25))}
                  className="text-gray-400 hover:text-white transition-colors p-0.5"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="text-[10px] font-mono text-electric w-8 text-center">{zoom}%</span>
                <button
                  onClick={() => setZoom(z => Math.min(300, z + 25))}
                  className="text-gray-400 hover:text-white transition-colors p-0.5"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  className="text-gray-400 hover:text-white transition-colors p-0.5"
                  title="Rotate"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Fullscreen */}
            <button
              onClick={() => setFullscreen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              title="Open Full Screen"
            >
              <Maximize2 className="h-3 w-3" /> Full View
            </button>

            {/* Open externally */}
            <button
              onClick={handleOpenExternal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              title="Open in New Tab"
            >
              <ExternalLink className="h-3 w-3" /> New Tab
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg bg-electric hover:bg-cyan-400 text-obsidian transition-all shadow-md hover:shadow-cyan-500/20"
              title="Download File"
            >
              <Download className="h-3 w-3" /> Download
            </button>
          </div>
        </div>

        {/* ─ Content Area ─ */}
        <div className="relative flex-1 bg-obsidian/50 p-3 overflow-hidden">
          {!loaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-obsidian/80">
              <div className="h-10 w-10 rounded-full border-2 border-electric border-t-transparent animate-spin mb-3" />
              <span className="text-xs text-gray-400 font-mono">Loading content...</span>
            </div>
          )}
          {renderViewer(false)}
        </div>

        {/* ─ Status Bar ─ */}
        <div className="px-4 py-2 bg-obsidian border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-3 w-3 text-emerald-400" />
            Secure viewer • {studentInfo?.name || 'Guest Student'}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="h-3 w-3 text-electric" />
            {isImage ? 'Photo / Image' : 'PDF'} • Read + Download Enabled
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          FULLSCREEN MODAL
      ═══════════════════════════════════════════════════ */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col"
          onClick={(e) => { if (e.target === e.currentTarget) setFullscreen(false); }}
        >
          {/* Modal toolbar */}
          <div className="flex items-center justify-between px-5 py-3 bg-obsidian/90 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              {isImage ? <Image className="h-5 w-5 text-emerald-400" /> : <FileText className="h-5 w-5 text-electric" />}
              <span className="text-sm font-semibold text-white font-display">{pdfTitle || 'Study Material'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg bg-electric hover:bg-cyan-400 text-obsidian transition-all"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </button>
              <button
                onClick={() => setFullscreen(false)}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Modal content */}
          <div className="flex-1 overflow-auto p-4">
            {renderViewer(true)}
          </div>
        </div>
      )}
    </>
  );
}
