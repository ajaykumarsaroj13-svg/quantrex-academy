import re

filepath = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\frontend\src\pages\StudentDashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Instead of relying on specific grid layouts for Focus Mode, we'll extract the selectedVideo, selectedPdf, and chapter content
# and render them inside a FULL SCREEN OVERLAY if isFocusMode is true.

# Wait, `isFocusMode` is true if selectedVideo || selectedPdf || (activeTab === 'courses' && selectedSyllabusChapterId)
# I will find the definition of `isFocusMode` and update it.
content = content.replace(
    "const isFocusMode = selectedVideo || selectedPdf || (activeTab === 'courses' && selectedSyllabusChapterId);",
    "const isFocusMode = selectedVideo || selectedPdf || (activeTab === 'courses' && selectedSyllabusChapterId);\n  const isTrueFullScreen = selectedVideo || selectedPdf;"
)

# Replace the entire render return block for the True Full Screen Focus Mode
# Before:
#   return (
#     <>
#       <style>{globalThemeCSS}</style>
#       <div className={`study-portal-wrapper min-h-screen px-4 md:px-12 py-10 mx-auto grid grid-cols-1 gap-8 transition-all duration-300 ${isFocusMode ? 'max-w-[1600px] lg:grid-cols-1' : 'max-w-7xl lg:grid-cols-4'}`}>

# We'll inject the True Full-Screen Overlay right after `<style>{globalThemeCSS}</style>`

full_screen_overlay = """
      {/*  TRUE FULL SCREEN OVERLAY FOR READER/VIDEO  */}
      {isTrueFullScreen && (
        <div className={`fixed inset-0 z-[100] w-screen h-screen overflow-y-auto ${isLight ? 'bg-[#f4f6fa]' : 'bg-[#000000]'} transition-colors duration-300`}>
          <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 space-y-6">
            
            {/* Header */}
            <div className={`flex justify-between items-center p-4 rounded-2xl border shadow-lg ${isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10 backdrop-blur-md'}`}>
              <button 
                onClick={() => { setSelectedVideo(null); setSelectedPdf(null); }}
                className={`px-5 py-2.5 font-bold rounded-xl flex items-center gap-2 transition-all ${isLight ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'bg-electric text-obsidian hover:bg-blue-400'}`}
              >
                +? Back to Chapters
              </button>
              
              <div className={`text-base font-black tracking-wider uppercase ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {selectedVideo ? selectedVideo.title : selectedPdf ? selectedPdf.title : 'Study Materials'}
              </div>

              <button 
                onClick={onToggleTheme}
                className={`px-5 py-2.5 font-bold rounded-xl border flex items-center gap-2 transition-all ${isLight ? 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200' : 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700'}`}
              >
                {isLight ? 'dYOT Dark Mode' : '~?,? Light Mode'}
              </button>
            </div>

            {/* Content */}
            {selectedVideo ? (
                <div className="space-y-4">
                  <VideoPlayer 
                    videoUrl={selectedVideo.url} 
                    videoTitle={selectedVideo.title} 
                    studentInfo={user}
                  />
                  <div className={`p-6 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isLight ? 'bg-white border-gray-200' : 'glass-panel border-white/5'}`}>
                    <div className="space-y-1">
                      <h4 className={`font-bold text-base ${isLight ? 'text-black' : 'text-white'}`}>{selectedVideo.title}</h4>
                      <p className={`text-[10px] font-mono leading-relaxed max-w-xl ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                        {selectedVideo.downloadBlocked 
                          ? 'dY"' Forensic Watermarking and Active Piracy block is active. Downloads are disabled.' 
                          : 'dY"" Downloads allowed for offline personal study.'}
                      </p>
                    </div>
                  </div>
                </div>
            ) : selectedPdf ? (
                <div className={`p-4 rounded-xl shadow-2xl ${isLight ? 'bg-white border border-gray-200' : 'bg-[#1a1a2e] border border-white/10'}`}>
                  <iframe 
                    src={selectedPdf.url} 
                    className="pdf-viewer-frame w-full h-[80vh] rounded-lg"
                    title={selectedPdf.title}
                  />
                </div>
            ) : null}
          </div>
        </div>
      )}
"""

content = content.replace(
    "<style>{globalThemeCSS}</style>",
    f"<style>{{globalThemeCSS}}</style>\n{full_screen_overlay}"
)

# And if `isTrueFullScreen` is true, we should hide the rest of the dashboard.
content = content.replace(
    "<div className={`study-portal-wrapper min-h-screen px-4 md:px-12 py-10 mx-auto grid grid-cols-1 gap-8 transition-all duration-300 ${isFocusMode ? 'max-w-[1600px] lg:grid-cols-1' : 'max-w-7xl lg:grid-cols-4'}`}>",
    "{!isTrueFullScreen && (<div className={`study-portal-wrapper min-h-screen px-4 md:px-12 py-10 mx-auto grid grid-cols-1 gap-8 transition-all duration-300 ${isFocusMode ? 'max-w-[1600px] lg:grid-cols-1' : 'max-w-7xl lg:grid-cols-4'}`}>"
)

content = content.replace(
    "    </>\n  );\n}",
    "    </div>)}\n    </>\n  );\n}"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected True Full Screen overlay into Dashboard")
