if (Test-Path .git/index.lock) { Remove-Item -Force .git/index.lock }
git add src/pages/Home.jsx public/data-script.js
git commit -m "fix: use raw github url for missing vercel images"
git push
