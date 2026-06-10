# JEE Papers Downloader - PowerShell Script
# Run this script to download all JEE papers from GitHub

$baseUrl = "https://raw.githubusercontent.com/Samkarya/online-exam-questions/main/"
$baseDir = "C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\frontend\backend\data\test_series"

# Create directories
New-Item -ItemType Directory -Force -Path "$baseDir\jee_mains" | Out-Null
New-Item -ItemType Directory -Force -Path "$baseDir\jee_advanced" | Out-Null

# JEE Main papers (from jee.json config)
$papers = @(
    @{
        id = "jeeMain_2026_02April_shift2"
        title = "JEE Main 2026 (April 2nd, Shift 2)"
        exam = "JEE Main"
        year = 2026
        session = "April"
        shift = 2
        date = "2026-04-02"
        paperType = "Paper 1 (PCM)"
        path = "India/undergraduate/JEEMains/jeeMain_2026_02April_shift2.json"
    },
    @{
        id = "jeeMain_2026_02April_shift1"
        title = "JEE Main 2026 (April 2nd, Shift 1)"
        exam = "JEE Main"
        year = 2026
        session = "April"
        shift = 1
        date = "2026-04-02"
        paperType = "Paper 1 (PCM)"
        path = "India/undergraduate/JEEMains/jeeMain_2026_02April_shift1.json"
    },
    @{
        id = "jeeMain_2025_22Jan_shift1"
        title = "JEE Main 2025 (Jan 22nd, Shift 1)"
        exam = "JEE Main"
        year = 2025
        session = "January"
        shift = 1
        date = "2025-01-22"
        paperType = "Paper 1 (PCM)"
        path = "India/undergraduate/JEEMains/jeeMain_2025_22Jan_shift1.json"
    },
    @{
        id = "jeeMain_2025_22Jan_shift2"
        title = "JEE Main 2025 (Jan 22nd, Shift 2)"
        exam = "JEE Main"
        year = 2025
        session = "January"
        shift = 2
        date = "2025-01-22"
        paperType = "Paper 1 (PCM)"
        path = "India/undergraduate/JEEMains/jeeMain_2025_22Jan_shift2.json"
    }
)

$manifest = @{
    lastUpdated = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    totalPapers = 0
    jeeMains = 0
    jeeAdvanced = 0
    papers = @()
}

$successCount = 0

Write-Host "=== JEE Paper Downloader ===" -ForegroundColor Cyan
Write-Host "Downloading $($papers.Count) JEE Main papers...`n"

foreach ($paper in $papers) {
    $url = $baseUrl + $paper.path
    $fileName = "$($paper.id).json"
    $filePath = "$baseDir\jee_mains\$fileName"
    
    Write-Host "Downloading: $($paper.id)" -ForegroundColor Yellow
    Write-Host "  URL: $url"
    
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing
        $content = $response.Content
        
        # Save the file
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        
        # Count questions
        $json = $content | ConvertFrom-Json
        $questionCount = if ($json -is [array]) { $json.Count } else { "unknown" }
        
        $manifestEntry = @{
            id = $paper.id
            title = $paper.title
            exam = $paper.exam
            year = $paper.year
            session = $paper.session
            shift = $paper.shift
            date = $paper.date
            paperType = $paper.paperType
            isOfficial = $true
            questionCount = $questionCount
            filePath = "jee_mains/$fileName"
        }
        
        $manifest.papers += $manifestEntry
        $successCount++
        
        Write-Host "  [OK] Saved $fileName ($questionCount questions)" -ForegroundColor Green
    }
    catch {
        Write-Host "  [FAIL] Failed to download $($paper.id): $_" -ForegroundColor Red
    }
}

# Update manifest totals
$manifest.totalPapers = $successCount
$manifest.jeeMains = $successCount
$manifest.jeeAdvanced = 0

# Save manifest
$manifestPath = "$baseDir\manifest.json"
$manifest | ConvertTo-Json -Depth 10 | Set-Content -Path $manifestPath -Encoding UTF8

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Total papers downloaded: $successCount / $($papers.Count)" -ForegroundColor Green
Write-Host "JEE Main papers: $successCount"
Write-Host "JEE Advanced papers: 0 (not available in this repo)"
Write-Host "Manifest saved to: manifest.json"
Write-Host "`nNote: No JEE Advanced papers were found in this GitHub repository."
Write-Host "The repo only contains JEE Main papers under India/undergraduate/JEEMains/"
