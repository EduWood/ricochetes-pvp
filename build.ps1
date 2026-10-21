$ErrorActionPreference = 'Stop'
$buildRoot = $PSScriptRoot
$venvPython = Join-Path $buildRoot 'venv/Scripts/python.exe'
if (-not (Test-Path -LiteralPath $venvPython)) {
    python -m venv (Join-Path $buildRoot 'venv')
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao criar ambiente.' }
}
& $venvPython -m pip install -r (Join-Path $buildRoot 'requirements.txt')
if ($LASTEXITCODE -ne 0) { throw 'Falha ao instalar dependências.' }
& $venvPython (Join-Path $buildRoot 'package_extension.py')
if ($LASTEXITCODE -ne 0) { throw 'Falha ao gerar extensão.' }
& $venvPython -m unittest discover -s $buildRoot -p 'test_*.py'
if ($LASTEXITCODE -ne 0) { throw 'Falha nos testes Python.' }
node (Join-Path $buildRoot 'test_extension.cjs')
if ($LASTEXITCODE -ne 0) { throw 'Falha nos testes da extensão.' }
node (Join-Path $buildRoot 'test_tactics.cjs')
if ($LASTEXITCODE -ne 0) { throw 'Falha nos testes de dano e busca.' }
& $venvPython -m PyInstaller --noconfirm --onefile --windowed --name RicochetesPvP --version-file (Join-Path $buildRoot 'version.txt') --add-data ((Join-Path $buildRoot 'extension') + ';extension') --distpath (Join-Path $buildRoot 'dist') --workpath (Join-Path $buildRoot 'build') --specpath $buildRoot (Join-Path $buildRoot 'app.py')
if ($LASTEXITCODE -ne 0) { throw 'Falha na compilação.' }
