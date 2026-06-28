<#
  dcp-delta.ps1 - Detect delta files and pack them into a tar.gz,
                  preserving the directory structure.

  Delta = files whose LastWriteTime is newer than the marker file
          (last successful deploy). If -Full or no marker exists,
          every non-excluded file is included.

  Exclude rules are read from dc-exclude.txt using xcopy /EXCLUDE
  semantics: each non-comment line is a case-insensitive substring;
  if it appears anywhere in a file's relative path, the file is skipped.

  Params:
    -Root     project directory (default: script dir)
    -Exclude  path to exclude list (default: <Root>\dc-exclude.txt)
    -Marker   path to marker file  (default: <Root>\.dcp_marker)
    -Out      output archive path  (default: <Root>\deploy.tar.gz)
    -Full     ignore the marker; include everything

  Exit code 0 with output "COUNT=<n>". n=0 means nothing to deploy.
#>
param(
    [string]$Root    = $PSScriptRoot,
    [string]$Exclude = "",
    [string]$Marker  = "",
    [string]$Out     = "",
    [switch]$Full
)

$ErrorActionPreference = 'Stop'

if (-not $Exclude) { $Exclude = Join-Path $Root 'dc-exclude.txt' }
if (-not $Marker)  { $Marker  = Join-Path $Root '.dcp_marker' }
if (-not $Out)     { $Out     = Join-Path $Root 'deploy.tar.gz' }

$Root = (Resolve-Path $Root).Path

# --- Load exclude substrings (skip comments / blank lines) ---
$patterns = @()
if (Test-Path $Exclude) {
    foreach ($line in Get-Content $Exclude) {
        $t = $line.Trim()
        if ($t -and -not $t.StartsWith('#')) {
            # Normalize to forward slashes so patterns match our relative paths
            $patterns += $t.Replace('\','/').ToLower()
        }
    }
}

# Always exclude the deploy artifacts themselves
$patterns += @('deploy.tar.gz', '.dcp_marker', 'filelist.txt')

# --- Determine cutoff time ---
$cutoff = [DateTime]::MinValue
if (-not $Full -and (Test-Path $Marker)) {
    try { $cutoff = [DateTime]::Parse((Get-Content $Marker -Raw).Trim()) } catch { $cutoff = [DateTime]::MinValue }
}

# --- Walk files, apply exclude + delta filter ---
$rootLen = $Root.Length + 1
$rel = New-Object System.Collections.Generic.List[string]

$allFiles = Get-ChildItem -LiteralPath $Root -Recurse -File
foreach ($f in $allFiles) {
    $r  = $f.FullName.Substring($rootLen).Replace('\','/')
    $rl = $r.ToLower()

    $skip = $false
    foreach ($p in $patterns) {
        if ($rl.Contains($p)) { $skip = $true; break }
    }
    if ($skip) { continue }

    if ($f.LastWriteTime -gt $cutoff) {
        $rel.Add($r)
    }
}

if ($rel.Count -eq 0) {
    Write-Output "COUNT=0"
    exit 0
}

# --- Write file list (relative, forward slashes) and pack ---
$listFile = Join-Path $Root 'filelist.txt'
# LF-only line endings so any tar flavor (bsdtar / GNU) accepts the list
[IO.File]::WriteAllText($listFile, ($rel -join "`n") + "`n")

if (Test-Path $Out) { Remove-Item $Out -Force }

# Use Windows bundled bsdtar explicitly; -C root resolves relative paths, structure preserved
$tarExe = Join-Path $env:SystemRoot 'System32\tar.exe'
if (-not (Test-Path $tarExe)) { $tarExe = 'tar' }
& $tarExe -czf "$Out" -C "$Root" -T "$listFile"
if ($LASTEXITCODE -ne 0) { Write-Error "tar failed ($LASTEXITCODE)"; exit 1 }

Remove-Item $listFile -Force
Write-Output "COUNT=$($rel.Count)"
exit 0
