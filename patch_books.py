import re

with open('src/pages/BooksLibrary.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update signature
old_sig = "export default function BooksLibrary({ setActivePage, theme, setReadingBook, user }) {"
new_sig = "export default function BooksLibrary({ setActivePage, theme, setReadingBook, user, booksData }) {"
content = content.replace(old_sig, new_sig)

# Replace local ooks array definition with booksData OR fallback
old_books = """  const books = [
    {
      id: 'allen-maths-handbook',
      title: 'Allen Maths Handbook',
      description: 'Complete mathematics formulas and quick revision handbook for JEE Main and Advanced.',
      coverColor: 'from-orange-500 to-red-600',
      tag: 'Mathematics',
      pages: '200+',
      file: '/books/Allen-Maths-Handbook.pdf'
    },
    {
      id: 'black-book-maths',
      title: 'Advanced Problems in Mathematics',
      description: 'Vikas Gupta & Pankaj Joshi (Black Book) - Chapter-wise Interactive Practice.',
      coverColor: 'from-gray-800 to-black',
      tag: 'Practice Book',
      pages: 'Interactive',
      type: 'interactive'
    }
  ];"""

new_books = """  const books = booksData && booksData.length > 0 ? booksData : [];"""
content = content.replace(old_books, new_books)

with open('src/pages/BooksLibrary.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
