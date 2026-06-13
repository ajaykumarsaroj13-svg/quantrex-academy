import re

content = open('tailwind.config.js', 'r', encoding='utf-8').read()

if 'marquee:' not in content:
    content = content.replace(
        "'shimmer': 'shimmer 2.5s linear infinite',",
        "'shimmer': 'shimmer 2.5s linear infinite',\n          'marquee': 'marquee 25s linear infinite',"
    )
    content = content.replace(
        "fadeIn: {",
        "marquee: {\n            '0%': { transform: 'translateX(0)' },\n            '100%': { transform: 'translateX(-50%)' },\n          },\n          fadeIn: {"
    )

open('tailwind.config.js', 'w', encoding='utf-8').write(content)
