// JavaScript | bootstrap.js | Chrome/Edge 111+ MV3 MAIN world | Farm Ricochet
(() => {
  'use strict';
  if (location.origin !== 'https://farmricochet.com' || location.pathname.replace(/\/$/, '') !== '/play') return;
  const previous=window.FarmRicochetesExtension;
  if (previous?.version==='1.4.0') return;
  if (previous?.dispose) previous.dispose(); else previous?.disable?.();
  const install = () => {
    return /* OVERLAY_SOURCE */;
  };
  let enabled = true, busy = false, lastCanvas = null, error = '';
  async function tick() {
    if (!enabled || busy || previous?.info?.().busy) return;
    const canvas = document.querySelector('#pvp-canvas');
    if (!canvas || canvas === lastCanvas || typeof window.render_pvp_to_text !== 'function') return;
    if (window.FarmPvpTrajetoria?.info?.().installed) {
      if (!lastCanvas && window.FarmPvpTrajetoria.version==='1.4.0') { lastCanvas = canvas; return; }
      window.FarmPvpTrajetoria.destroy();
    }
    busy = true;
    try {
      await install();
      lastCanvas = canvas;
      error = '';
    } catch (failure) { error = failure.message || String(failure); }
    finally { busy = false; }
    // A removal while the async import was pending must also remove its result.
    if (!enabled) { window.FarmPvpTrajetoria?.destroy?.(); lastCanvas = null; }
  }
  const control = window.FarmRicochetesExtension = {
    version: '1.4.0',
    async enable() {
      enabled = true; lastCanvas = null; error = '';
      await tick();
      if (error) return 'Aguardando a Arena PvP. Detalhe: ' + error;
      return window.FarmPvpTrajetoria?.info?.().installed
        ? 'Previsão ativada. Os controles ficam ao lado da arena.'
        : 'Ativação preparada. Abra a Arena PvP nesta aba.';
    },
    disable() {
      enabled = false; lastCanvas = null; error = '';
      window.FarmPvpTrajetoria?.destroy?.();
      return 'Previsão removida desta aba. Após recarregar, a extensão volta a ativar automaticamente.';
    },
    info: () => ({ enabled, busy, error, installed: !!window.FarmPvpTrajetoria?.info?.().installed }),
    dispose() {
      enabled=false; clearInterval(interval); window.FarmPvpTrajetoria?.destroy?.();
      if (window.FarmRicochetesExtension===control) delete window.FarmRicochetesExtension;
    }
  };
  const interval=setInterval(tick, 1000);
  void tick();
})();
