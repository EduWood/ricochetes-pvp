# Python | package_extension.py | Python 3.10+ | local build
from pathlib import Path
root = Path(__file__).resolve().parent
source = (root / 'farm-pvp-ricochetes.js').read_text(encoding='utf-8').strip().removesuffix(';')
template = (root / 'loader-template.js').read_text(encoding='utf-8')
(root / 'extension/bootstrap.js').write_text(template.replace('/* OVERLAY_SOURCE */', '(' + source + '\n)'), encoding='utf-8')
