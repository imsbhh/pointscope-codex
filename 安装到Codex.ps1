[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$marketplaceRoot = $PSScriptRoot
$catalogPath = Join-Path $marketplaceRoot '.agents/plugins/marketplace.json'
if (-not (Test-Path -LiteralPath $catalogPath -PathType Leaf)) {
    throw 'Please run this script inside the extracted PointScope-Codex folder.'
}
$catalog = Get-Content -LiteralPath $catalogPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ($catalog.name -ne 'pointscope-local') { throw 'Unexpected PointScope marketplace.' }
$codexCommand = Get-Command codex -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
if ($codexCommand) {
    $codexExecutable = $codexCommand.Source
} else {
    $codexExecutable = Join-Path $env:USERPROFILE '.codex/plugins/.plugin-appserver/codex.exe'
}
if (-not (Test-Path -LiteralPath $codexExecutable -PathType Leaf)) {
    throw 'Codex was not found. Use the existing Codex CLI to add this local marketplace; no runtime will be downloaded.'
}
Write-Host 'Registering the local PointScope marketplace in Codex...'
& $codexExecutable plugin marketplace add $marketplaceRoot --json
if ($LASTEXITCODE -ne 0) { throw 'Could not register the local marketplace. See the Codex output above.' }
& $codexExecutable plugin add 'pointscope@pointscope-local' --json
if ($LASTEXITCODE -ne 0) { throw 'Could not install PointScope. See the Codex output above.' }
Write-Host 'PointScope installed. Confirm it is enabled in Codex plugin settings, then use $pointscope in a new chat.'
