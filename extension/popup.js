// JavaScript | popup.js | Chrome/Edge MV3 | Farm Ricochet
'use strict';
const status = document.getElementById('status');
const buttons = [...document.querySelectorAll('button')];
async function command(enable) {
  buttons.forEach(button => button.disabled = true);
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = new URL(tab?.url || 'about:blank');
    if (url.origin !== 'https://farmricochet.com' || url.pathname.replace(/\/$/, '') !== '/play') {
      throw new Error('Selecione a aba https://farmricochet.com/play e abra esta extensão nela.');
    }
    if (enable) {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, world: 'MAIN', files: ['bootstrap.js'] });
    }
    const replies = await chrome.scripting.executeScript({
      target: { tabId: tab.id }, world: 'MAIN', args: [enable],
      func: async on => {
        const control = window.FarmRicochetesExtension;
        if (!control) {
          if (!on) { window.FarmPvpTrajetoria?.destroy?.(); return 'Previsão removida.'; }
          throw new Error('A extensão não iniciou. Reabra o menu e tente novamente.');
        }
        return on ? await control.enable() : control.disable();
      }
    });
    status.textContent = replies[0]?.result || 'Comando concluído.';
  } catch (error) {
    status.textContent = error.message || String(error);
  } finally { buttons.forEach(button => button.disabled = false); }
}
document.getElementById('enable').addEventListener('click', () => command(true));
document.getElementById('disable').addEventListener('click', () => command(false));
