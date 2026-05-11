$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $PSScriptRoot "compiled"
$cssOutDir = Join-Path $root "styles\compiled"

Push-Location $root
try {
  if (Test-Path $outDir) {
    Remove-Item -Recurse -Force $outDir
  }
  if (Test-Path $cssOutDir) {
    Remove-Item -Recurse -Force $cssOutDir
  }

  New-Item -ItemType Directory -Force $outDir | Out-Null
  New-Item -ItemType Directory -Force $cssOutDir | Out-Null

  npx --yes esbuild "components/*.jsx" `
    --outdir=scripts/compiled `
    --loader:.jsx=jsx `
    --jsx-factory=React.createElement `
    --jsx-fragment=React.Fragment `
    --format=iife `
    --minify

  npx --yes esbuild "scripts/content.js" "scripts/image-slot.js" `
    --outdir=scripts/compiled `
    --format=iife `
    --minify

  npx --yes esbuild "styles/styles.css" "styles/styles-extra.css" `
    --outdir=styles/compiled `
    --minify
}
finally {
  Pop-Location
}
