with open('src/pages/TestSeriesPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('''          ))
        )}
      </div>
    </div>''', '''          ))
        )}
        </div>
        )}
      </div>
    </div>''')

with open('src/pages/TestSeriesPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
