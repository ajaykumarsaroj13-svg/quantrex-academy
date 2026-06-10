import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Maximize2, Settings, MessageSquare, BookOpen, AlertTriangle } from 'lucide-react';

export default function VideoPlayer({ videoUrl, videoTitle, studentInfo, onReportBreach }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(0.8);
  const [showSettings, setShowSettings] = useState(false);
  
  // Anti-Piracy Watermark State
  const [watermarkPos, setWatermarkPos] = useState({ top: 20, left: 20 });
  const [blurred, setBlurred] = useState(false);

  // Resume Watching Logic
  useEffect(() => {
    if (!videoUrl) return;
    const savedTime = localStorage.getItem(`video_progress_${videoUrl}`);
    if (savedTime && videoRef.current) {
      videoRef.current.currentTime = parseFloat(savedTime);
    }
  }, [videoUrl]);

  // Periodic watermark repositioning (Security Mechanism)
  useEffect(() => {
    const interval = setInterval(() => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight;
        const width = containerRef.current.clientWidth;
        
        // Randomly position watermark within bounds, avoiding immediate edge cuts
        const top = Math.max(10, Math.floor(Math.random() * (height - 60)));
        const left = Math.max(10, Math.floor(Math.random() * (width - 280)));
        setWatermarkPos({ top, left });
      }
    }, 4000); // changes position every 4 seconds

    return () => clearInterval(interval);
  }, []);

  // Anti-Screen Recording & Developer Tools Interception
  useEffect(() => {
    // 1. Monitor Tab / Window focus changes (Screen capture detection trigger)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setBlurred(true);
        videoRef.current?.pause();
        setIsPlaying(false);
      } else {
        setBlurred(false);
      }
    };

    // 2. Prevent right-click contextual inspects on this player
    const handleContextMenu = (e) => {
      e.preventDefault();
      alert('Security Warning: Access Denied. Right-click and Inspect Element are disabled for content protection.');
      onReportBreach?.('devtools_inspect', 'Attempted right click on player context');
    };

    // 3. Prevent Devtools keyboard shortcuts
    const handleKeyDown = (e) => {
      const keysPressed = [];
      if (e.ctrlKey) keysPressed.push('Ctrl');
      if (e.shiftKey) keysPressed.push('Shift');
      keysPressed.push(e.key);

      const combined = keysPressed.join('+');
      
      // Intercept Ctrl+Shift+I, F12, Ctrl+U, Ctrl+Shift+J, PrintScreen
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
        (e.ctrlKey && e.key === 'u') ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        e.stopPropagation();
        setBlurred(true);
        videoRef.current?.pause();
        setIsPlaying(false);
        alert('Piracy Alert: Developer hotkey / Screenshot intercepted. Quantrex Academy logs security breaches in real-time.');
        onReportBreach?.('screenshot', `Hotkey combo triggered: ${combined}`);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', () => setBlurred(true));
    window.addEventListener('focus', () => setBlurred(false));
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('contextmenu', handleContextMenu);
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', () => setBlurred(true));
      window.removeEventListener('focus', () => setBlurred(false));
      if (container) {
        container.removeEventListener('contextmenu', handleContextMenu);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onReportBreach]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    // Save progress to local storage
    localStorage.setItem(`video_progress_${videoUrl}`, time.toString());
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettings(false);
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Watermark text containing user identifiers
  const watermarkText = studentInfo 
    ? `Quantrex Academy — A.K. Sir — ${studentInfo.name} (${studentInfo.phone.substring(0, 3)}XXXX${studentInfo.phone.substring(7)})` 
    : 'Quantrex Academy — A.K. Sir — GUEST';

  return (
    <div className="relative flex flex-col w-full h-full bg-black border border-cyberdark rounded-xl overflow-hidden shadow-2xl">
      {/* Video Container Wrapper */}
      <div 
        ref={containerRef}
        className="relative flex-1 flex items-center justify-center bg-black overflow-hidden group"
      >
        {/* Actual Video tag */}
        <video
          ref={videoRef}
          src={videoUrl || "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"}
          className={`w-full max-h-[500px] object-contain transition-all duration-300 ${blurred ? 'blur-2xl pointer-events-none' : ''}`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlay}
          controls={false}
          controlsList="nodownload"
        />

        {/* 1. Dynamic Moving Forensic Watermark */}
        <div 
          style={{ 
            top: `${watermarkPos.top}px`, 
            left: `${watermarkPos.left}px`,
            transition: 'top 1.5s ease-in-out, left 1.5s ease-in-out'
          }}
          className="absolute z-30 select-none pointer-events-none text-white/20 text-xs md:text-sm font-semibold tracking-wider bg-black/10 px-3 py-1.5 rounded backdrop-blur-[0.5px] border border-white/5 whitespace-nowrap font-display"
        >
          {watermarkText}
        </div>

        {/* Subtle stationary background grid watermark */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 select-none pointer-events-none opacity-[0.02] text-[8px] md:text-xs">
          {Array.from({ length: 9 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-center p-4">
              <span>{watermarkText}</span>
            </div>
          ))}
        </div>

        {/* 2. Security Blur Screen Overlay */}
        {blurred && (
          <div className="absolute inset-0 bg-obsidian/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6 z-40">
            <AlertTriangle className="h-16 w-16 text-gold animate-bounce mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">CONTENT PROTECTION SYSTEM ACTIVE</h3>
            <p className="text-gray-400 text-sm max-w-md">
              Video playback paused because browser window focus was lost or a screenshot shortcut was detected.
              Please resume active focus on this window to watch.
            </p>
            <button 
              onClick={() => setBlurred(false)} 
              className="mt-6 px-5 py-2 bg-electric hover:bg-cyan-400 text-obsidian font-semibold rounded-lg shadow-md transition-colors"
            >
              Resume Playback
            </button>
          </div>
        )}

        {/* Play/Pause Overlay indicator on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity pointer-events-none z-10">
          <button 
            onClick={togglePlay} 
            className="p-4 bg-obsidian/80 hover:bg-electric border border-electric/40 text-electric hover:text-obsidian rounded-full transition-all duration-300 transform scale-90 group-hover:scale-100 pointer-events-auto"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
          </button>
        </div>
      </div>

      {/* 3. Secure Custom Controls panel */}
      <div className="p-4 bg-cyberdark border-t border-white/5 flex flex-col gap-3 select-none">
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-platinum">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-obsidian rounded-lg appearance-none cursor-pointer accent-electric hover:h-1.5 transition-all"
          />
          <span className="text-xs font-mono text-platinum">{formatTime(duration)}</span>
        </div>

        {/* Bottom controls buttons row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-platinum hover:text-electric transition-colors">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
            </button>
            <button onClick={() => { if (videoRef.current) videoRef.current.currentTime = 0; }} className="text-platinum hover:text-electric transition-colors">
              <RotateCcw className="h-5 w-5" />
            </button>

            {/* Volume slider */}
            <div className="flex items-center gap-2 group/volume">
              <Volume2 className="h-5 w-5 text-platinum group-hover/volume:text-electric transition-colors" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-obsidian rounded-lg appearance-none cursor-pointer accent-electric transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Speed adjustments */}
            <div className="relative">
              <button 
                onClick={() => setShowSettings(!showSettings)} 
                className="flex items-center gap-1 text-platinum hover:text-electric transition-colors text-xs font-mono border border-white/5 px-2 py-1 rounded"
              >
                <Settings className="h-4 w-4" />
                {playbackSpeed}x
              </button>
              {showSettings && (
                <div className="absolute right-0 bottom-full mb-2 w-24 bg-obsidian border border-cyberdark rounded-lg shadow-xl overflow-hidden z-50">
                  {[0.5, 1, 1.25, 1.5, 2].map((sp) => (
                    <button
                      key={sp}
                      onClick={() => handleSpeedChange(sp)}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-electric hover:text-obsidian font-mono transition-colors ${playbackSpeed === sp ? 'text-electric' : 'text-gray-400'}`}
                    >
                      {sp}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleFullscreen} className="text-platinum hover:text-electric transition-colors">
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
