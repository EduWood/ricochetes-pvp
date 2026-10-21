# Python | publish.py | Windows x64 / Python 3.10+ | local artifact packaging
import argparse,hashlib,json,shutil,subprocess,zipfile
from pathlib import Path
root=Path(__file__).resolve().parent
parser=argparse.ArgumentParser(description='Empacotar e verificar Ricochetes PvP')
parser.add_argument('--output-dir',type=Path,default=root/'releases')
outputs=parser.parse_args().output_dir.resolve()
outputs.mkdir(parents=True,exist_ok=True)
exe=root/'dist/RicochetesPvP.exe'
for mode,name in [('--self-test','frozen-selftest.json'),('--smoke-ui','frozen-ui.json'),('--extract','frozen-extracted')]:
    subprocess.run([str(exe),mode,str(root/name)],check=True,timeout=45,creationflags=subprocess.CREATE_NO_WINDOW)
report=json.loads((root/'frozen-selftest.json').read_text(encoding='utf-8'))
assert report['frozen'] and report['version']=='1.4.0'
for name in ('manifest.json','bootstrap.js','popup.html','popup.js'):
    data=(root/'extension'/name).read_bytes()
    assert report['files'][name]==hashlib.sha256(data).hexdigest()
    assert (root/'frozen-extracted'/name).read_bytes()==data
ui=json.loads((root/'frozen-ui.json').read_text(encoding='utf-8'))
assert ui['frozen'] and ui['width']<=650 and ui['height']<=590,ui
shutil.copyfile(exe,outputs/'RicochetesPvP-1.4.exe')
try: shutil.copyfile(exe,outputs/'RicochetesPvP.exe')
except PermissionError: pass
shutil.copyfile(root/'farm-pvp-ricochetes.js',outputs/'farm-pvp-ricochetes.js')
shutil.copyfile(root/'README.md',outputs/'RicochetesPvP-leia-me.md')
shutil.copytree(root/'extension',outputs/'RicochetesPvP-extensao',dirs_exist_ok=True)
with zipfile.ZipFile(outputs/'RicochetesPvP-extensao.zip','w',zipfile.ZIP_DEFLATED) as archive:
    for file in (root/'extension').iterdir(): archive.write(file,'RicochetesPvP-extensao/'+file.name)
    archive.write(root/'README.md','LEIA-ME.md')
with zipfile.ZipFile(outputs/'RicochetesPvP-fonte.zip','w',zipfile.ZIP_DEFLATED) as archive:
    for name in ('app.py','build.ps1','package_extension.py','publish.py','loader-template.js','test_setup.py','test_extension.cjs','test_tactics.cjs','requirements.txt','version.txt','README.md','farm-pvp-ricochetes.js','.gitignore'):
        archive.write(root/name,name)
    for folder in ('extension','fixtures','assets'):
        if (root/folder).is_dir():
            for file in (root/folder).iterdir(): archive.write(file,folder+'/'+file.name)
    for name in ('serve_preview.py','preview/index.html'):
        if (root/name).is_file(): archive.write(root/name,name)
names=('RicochetesPvP-1.4.exe','RicochetesPvP-extensao.zip','RicochetesPvP-fonte.zip')
hashes=[hashlib.sha256((outputs/name).read_bytes()).hexdigest()+'  '+name for name in names]
(outputs/'RicochetesPvP.sha256').write_text('\n'.join(hashes)+'\n',encoding='utf-8')
print(json.dumps({'version':report['version'],'embeddedFilesMatch':True,'ui':ui,'sha256':hashes},indent=2))
