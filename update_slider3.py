import re

content = open('src/pages/Home.jsx', 'r', encoding='utf-8').read()

old_slider = '''<div className="w-full overflow-hidden relative">
                <div className="flex flex-row overflow-x-auto gap-8 py-6 px-4 snap-x snap-mandatory scrollbar-hide" 
style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {(toppers || []).map((t, idx) => ('''

new_slider = '''{/* SLIDER SECTION (Infinite Auto-scroll) */}
              <div className="w-full overflow-hidden relative group">
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-obsidian to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-obsidian to-transparent z-10 pointer-events-none"></div>
                <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-8 py-6 px-4">
                {[...(toppers || []), ...(toppers || [])].map((t, idx) => ('''

content = content.replace(old_slider, new_slider)

open('src/pages/Home.jsx', 'w', encoding='utf-8').write(content)
