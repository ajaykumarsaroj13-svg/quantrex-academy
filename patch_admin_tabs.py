import re

with open('src/pages/AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

sidebar_tabs_old = """            <div className="flex flex-col gap-1">
              {[
                { id: 'revenue', label: 'Revenue & Sales', icon: TrendingUp },
                { id: 'students', label: 'Manage Students', icon: Users },
                { id: 'course-manager', label: 'Manage Courses', icon: BookOpen },
                { id: 'security', label: 'Anti-Piracy Logs', icon: AlertOctagon },
                { id: 'notice', label: 'Live Notifications', icon: Bell },
                { id: 'settings', label: 'Platform Settings', icon: Settings }
              ].map(tab => ("""

sidebar_tabs_new = """            <div className="flex flex-col gap-1">
              {[
                { id: 'revenue', label: 'Revenue & Sales', icon: TrendingUp },
                { id: 'students', label: 'Manage Students', icon: Users },
                { id: 'course-manager', label: 'Study Portal', icon: BookOpen },
                { id: 'home', label: 'Manage Home Page', icon: LayoutDashboard },
                { id: 'books', label: 'Manage Books', icon: Book },
                { id: 'tests', label: 'Manage Test Series', icon: FileText },
                { id: 'security', label: 'Anti-Piracy Logs', icon: AlertOctagon },
                { id: 'notice', label: 'Live Notifications', icon: Bell },
                { id: 'settings', label: 'Platform Settings', icon: Settings }
              ].map(tab => ("""

content = content.replace(sidebar_tabs_old, sidebar_tabs_new)

# Add Home Manager, Book Manager, and Test Manager UI blocks before the end of the wrapper
# We can just put them right before {adminTab === 'settings' && ... }

home_manager_ui = """
          {/* HOME DASHBOARD TAB */}
          {adminTab === 'home' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">Manage Home Page</h3>
              <div className="space-y-4">
                <div className="p-5 bg-cyberdark border border-white/5 rounded-xl space-y-4">
                  <h4 className="text-sm font-bold text-gold uppercase">Hero Section</h4>
                  <input type="text" value={homeData?.heroTitle || ''} onChange={e => setHomeData({...homeData, heroTitle: e.target.value})} className="w-full p-2 bg-obsidian border border-white/10 rounded text-xs text-white" placeholder="Hero Title" />
                  <input type="text" value={homeData?.heroSubtitle || ''} onChange={e => setHomeData({...homeData, heroSubtitle: e.target.value})} className="w-full p-2 bg-obsidian border border-white/10 rounded text-xs text-white" placeholder="Hero Subtitle" />
                  <textarea value={homeData?.heroDescription || ''} onChange={e => setHomeData({...homeData, heroDescription: e.target.value})} className="w-full p-2 bg-obsidian border border-white/10 rounded text-xs text-white h-24" placeholder="Hero Description" />
                </div>
              </div>
            </div>
          )}

          {/* BOOKS MANAGER TAB */}
          {adminTab === 'books' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">Manage Books Section</h3>
              <div className="space-y-4">
                <button onClick={() => setBooksData([...booksData, { id: 'new_book_'+Date.now(), title: 'New Book', description: 'Description', tag: 'Tag', file: ''}])} className="px-4 py-2 bg-gold text-obsidian rounded text-xs font-bold uppercase">Add New Book</button>
                {booksData?.map((book, idx) => (
                  <div key={book.id} className="p-4 bg-cyberdark border border-white/5 rounded-xl space-y-2">
                    <div className="flex gap-2">
                      <input type="text" value={book.title} onChange={e => { const newB = [...booksData]; newB[idx].title = e.target.value; setBooksData(newB); }} className="flex-1 p-2 bg-obsidian border border-white/10 rounded text-xs text-white" placeholder="Book Title" />
                      <input type="text" value={book.tag} onChange={e => { const newB = [...booksData]; newB[idx].tag = e.target.value; setBooksData(newB); }} className="w-32 p-2 bg-obsidian border border-white/10 rounded text-xs text-white" placeholder="Tag" />
                    </div>
                    <input type="text" value={book.description} onChange={e => { const newB = [...booksData]; newB[idx].description = e.target.value; setBooksData(newB); }} className="w-full p-2 bg-obsidian border border-white/10 rounded text-xs text-white" placeholder="Description" />
                    <div className="flex gap-2">
                      <input type="text" value={book.file || ''} onChange={e => { const newB = [...booksData]; newB[idx].file = e.target.value; setBooksData(newB); }} className="flex-1 p-2 bg-obsidian border border-white/10 rounded text-xs text-white" placeholder="PDF URL (/books/file.pdf or absolute URL)" />
                      <button onClick={() => { const newB = booksData.filter(b => b.id !== book.id); setBooksData(newB); }} className="px-3 py-2 bg-red-500/20 text-red-400 rounded text-xs font-bold">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TESTS MANAGER TAB */}
          {adminTab === 'tests' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">Manage Test Series</h3>
              <div className="space-y-4">
                <button onClick={() => setTestsData({...testsData, mains: [...(testsData?.mains||[]), { id: 'new_test_'+Date.now(), name: 'New Mains Test', isLive: true, tags: ['JEE Main'], syllabus: []}]})} className="mr-2 px-4 py-2 bg-blue-500 text-white rounded text-xs font-bold uppercase">Add Mains Test</button>
                <button onClick={() => setTestsData({...testsData, advanced: [...(testsData?.advanced||[]), { id: 'new_adv_'+Date.now(), name: 'New Adv Test', isLive: true, tags: ['JEE Advanced'], syllabus: []}]})} className="px-4 py-2 bg-purple-500 text-white rounded text-xs font-bold uppercase">Add Advanced Test</button>
                
                <h4 className="text-sm font-bold text-blue-400 mt-4">JEE Main Tests</h4>
                {testsData?.mains?.map((test, idx) => (
                  <div key={test.id} className="p-3 bg-cyberdark border border-white/5 rounded-xl flex gap-2 items-center">
                    <input type="text" value={test.name} onChange={e => { const newT = {...testsData}; newT.mains[idx].name = e.target.value; setTestsData(newT); }} className="flex-1 p-2 bg-obsidian border border-white/10 rounded text-xs text-white" />
                    <button onClick={() => { const newT = {...testsData}; newT.mains = newT.mains.filter(t => t.id !== test.id); setTestsData(newT); }} className="px-3 py-2 bg-red-500/20 text-red-400 rounded text-xs font-bold">Delete</button>
                  </div>
                ))}

                <h4 className="text-sm font-bold text-purple-400 mt-4">JEE Advanced Tests</h4>
                {testsData?.advanced?.map((test, idx) => (
                  <div key={test.id} className="p-3 bg-cyberdark border border-white/5 rounded-xl flex gap-2 items-center">
                    <input type="text" value={test.name} onChange={e => { const newT = {...testsData}; newT.advanced[idx].name = e.target.value; setTestsData(newT); }} className="flex-1 p-2 bg-obsidian border border-white/10 rounded text-xs text-white" />
                    <button onClick={() => { const newT = {...testsData}; newT.advanced = newT.advanced.filter(t => t.id !== test.id); setTestsData(newT); }} className="px-3 py-2 bg-red-500/20 text-red-400 rounded text-xs font-bold">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}
"""

content = content.replace("{/* SETTINGS TAB */}", home_manager_ui + "\n          {/* SETTINGS TAB */}")

with open('src/pages/AdminDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
