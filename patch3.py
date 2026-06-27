import re

with open('src/components/ChapterPYQDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

diff_select_idx = content.find('value={difficultyFilter}')
if diff_select_idx != -1:
    select_start = content.rfind('<select', 0, diff_select_idx)
    
    type_dropdown = '''<select 
                value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                className="bg-[#1e1e24] border border-[#2d2d35] text-white px-4 py-2 rounded-lg outline-none focus:border-blue-500"
              >
                <option value="All">All Types</option>
                {availableTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              '''
    
    new_content = content[:select_start] + type_dropdown + content[select_start:]
    
    with open('src/components/ChapterPYQDashboard.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Success")
else:
    print("Failed")
