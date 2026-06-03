import re

filepath = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\frontend\src\pages\StudentDashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Instead of patching small pieces, I will find where selectedVideo is handled.
# Currently it is:
# {/* If a video lecture is active, render Course Player Overlay instead of list */}
# {selectedVideo ? (
#   <div className="space-y-6 animate-fade-in"> ...

# I want to extract the selectedVideo and selectedPdf logic and wrap them in a Full Screen overlay.

full_screen_overlay_start = """
          {/* True Full-Window Focus Mode Overlay */}
          {(selectedVideo || selectedPdf || (activeTab === 'courses' && selectedSyllabusChapterId)) && (
            <div className={`fixed inset-0 z-[100] overflow-y-auto transition-colors duration-300 ${isLight ? 'bg-white text-black' : 'bg-black text-white'} p-4 md:p-8`}>
              <div className="max-w-[1600px] mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <button 
                    onClick={() => { setSelectedVideo(null); setSelectedPdf(null); setSelectedSyllabusChapterId(null); }}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-lg transition-all"
                  >
                    +? Back to Dashboard
                  </button>
                  <button 
                    onClick={onToggleTheme}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide border flex items-center gap-2 transition-all ${isLight ? 'bg-gray-100 text-black border-gray-300' : 'bg-zinc-800 text-white border-zinc-700'}`}
                  >
                    {isLight ? '~?,? Switch to Dark Mode' : 'dYOT Switch to Light Mode'}
                  </button>
                </div>
"""

# Wait, `StudentDashboard.jsx` is huge and complex. I'll just write a script that replaces the entire component's return value to support this.
# Let's inspect the code for selectedVideo.
