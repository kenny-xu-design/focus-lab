param(
  [int]$Port = 5174
)

$ErrorActionPreference = 'Stop'
$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$url = "http://127.0.0.1:$Port/launcher"

Set-Location -LiteralPath $projectRoot

function Test-FocusLabServer {
  param([string]$TargetUrl)

  try {
    $response = Invoke-WebRequest -Uri $TargetUrl -UseBasicParsing -TimeoutSec 2
    return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
  } catch {
    return $false
  }
}

if (-not (Test-Path -LiteralPath (Join-Path $projectRoot 'node_modules'))) {
  Write-Host 'Focus Lab dependencies are missing. Run npm install in the project first.' -ForegroundColor Yellow
  Read-Host 'Press Enter to close'
  exit 1
}

if (-not (Test-FocusLabServer -TargetUrl $url)) {
  $npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
  if (-not $npm) {
    $npm = Get-Command npm -ErrorAction Stop
  }

  Start-Process `
    -FilePath $npm.Source `
    -ArgumentList @('run', 'dev', '--', '--host', '127.0.0.1', '--port', $Port.ToString()) `
    -WorkingDirectory $projectRoot `
    -WindowStyle Hidden

  $ready = $false
  for ($index = 0; $index -lt 30; $index += 1) {
    Start-Sleep -Milliseconds 500
    if (Test-FocusLabServer -TargetUrl $url) {
      $ready = $true
      break
    }
  }

  if (-not $ready) {
    Write-Host "Focus Lab is starting. Opening $url anyway." -ForegroundColor Yellow
  }
}

Start-Process $url
