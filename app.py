# Python | app.py | Windows x64 / Python 3.10+ | Ricochetes PvP extension setup
from __future__ import annotations
import hashlib
import json
import os
from pathlib import Path
import shutil
import sys
import tkinter as tk
from tkinter import messagebox

VERSION = '1.3.0'
RESOURCE = Path(__file__).resolve().parent / 'extension'
FILES = ('manifest.json', 'bootstrap.js', 'popup.html', 'popup.js')


def extract(destination: Path) -> dict:
    destination.mkdir(parents=True, exist_ok=True)
    hashes = {}
    for name in FILES:
        source = RESOURCE / name
        target = destination / name
        if source.resolve() != target.resolve():
            shutil.copyfile(source, target)
        hashes[name] = hashlib.sha256(target.read_bytes()).hexdigest()
    return {'version': VERSION, 'directory': str(destination.resolve()), 'sha256': hashes}


class App:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.destination = Path(os.environ.get('LOCALAPPDATA', str(Path.home() / 'AppData/Local'))) / 'FarmRicochetTrajetoria' / ('extension-' + VERSION)
        root.title('Ricochetes PvP — usar a aba atual')
        root.geometry('650x590')
        root.minsize(620, 560)
        root.configure(bg='#10231c')
        frame = tk.Frame(root, bg='#10231c', padx=26, pady=22)
        frame.pack(fill='both', expand=True)
        def label(text, size=11, color='#bed2c5'):
            widget = tk.Label(frame, text=text, bg='#10231c', fg=color, font=('Segoe UI', size), anchor='w', justify='left', wraplength=580)
            widget.pack(fill='x', pady=(0, 13))
        label('Sua aba. Sua sessão.', 22, '#ecf4ef')
        label('Versão 1.3 — instalação da extensão no navegador onde o jogo já está aberto.')
        label('1. Clique em Preparar extensão.\n2. No Chrome atual, abra chrome://extensions.\n3. Ative Modo do desenvolvedor e clique em Carregar sem compactação.\n4. Cole o caminho abaixo e selecione essa pasta.\n5. Volte à aba do jogo. No menu de extensões, abra Ricochetes PvP e clique em Ativar nesta aba.')
        self.path_value = tk.StringVar(value=str(self.destination))
        tk.Entry(frame, textvariable=self.path_value, state='readonly', readonlybackground='#19362b', fg='#ecf4ef', font=('Segoe UI', 10)).pack(fill='x', ipady=8, pady=(0, 12))
        actions = tk.Frame(frame, bg='#10231c')
        actions.pack(fill='x')
        for text, callback in [('Preparar extensão', self.prepare), ('Copiar caminho', lambda: self.copy(str(self.destination))), ('Abrir pasta', self.open_folder)]:
            tk.Button(actions, text=text, command=callback, bg='#244c39', fg='#ecf4ef', activebackground='#35694e', activeforeground='white', relief='flat', padx=12, pady=10).pack(side='left', padx=(0, 9))
        tk.Button(frame, text='Copiar chrome://extensions', command=lambda: self.copy('chrome://extensions'), bg='#19362b', fg='#ecf4ef', relief='flat', pady=8).pack(anchor='w', pady=12)
        self.status = tk.StringVar(value='A instalação é feita uma vez. Depois, a extensão funciona sem este aplicativo aberto.')
        tk.Label(frame, textvariable=self.status, bg='#10231c', fg='#87e4af', justify='left', wraplength=580, anchor='w', font=('Segoe UI', 10)).pack(fill='x', pady=8)
        label('O navegador e o login existentes são usados. A previsão continua estimada; habilidades e mortes futuras não são simuladas.', 10)

    def copy(self, text):
        self.root.clipboard_clear()
        self.root.clipboard_append(text)
        self.root.update()
        self.status.set('Copiado: ' + text)

    def prepare(self):
        try:
            extract(self.destination)
            self.copy(str(self.destination))
            self.status.set('Extensão preparada e caminho copiado. Agora carregue essa pasta em chrome://extensions no seu Chrome atual.')
        except OSError as error:
            messagebox.showerror('Falha ao preparar', str(error))

    def open_folder(self):
        try:
            extract(self.destination)
            os.startfile(self.destination)
        except OSError as error:
            messagebox.showerror('Falha ao abrir a pasta', str(error))


def main():
    if len(sys.argv) == 3 and sys.argv[1] == '--extract':
        extract(Path(sys.argv[2]))
        return
    if len(sys.argv) == 3 and sys.argv[1] == '--self-test':
        manifest = json.loads((RESOURCE / 'manifest.json').read_text(encoding='utf-8'))
        report = {'version': VERSION, 'frozen': bool(getattr(sys, 'frozen', False)), 'manifest': manifest, 'files': {name: hashlib.sha256((RESOURCE / name).read_bytes()).hexdigest() for name in FILES}}
        Path(sys.argv[2]).write_text(json.dumps(report, indent=2), encoding='utf-8')
        return
    root = tk.Tk()
    app = App(root)
    if len(sys.argv) == 3 and sys.argv[1] == '--smoke-ui':
        root.withdraw()
        root.update_idletasks()
        Path(sys.argv[2]).write_text(json.dumps({'version': VERSION, 'frozen': bool(getattr(sys, 'frozen', False)), 'width': root.winfo_reqwidth(), 'height': root.winfo_reqheight()}), encoding='utf-8')
        root.destroy()
        return
    root.mainloop()


if __name__ == '__main__':
    main()
