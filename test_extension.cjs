// JavaScript | test_extension.cjs | Node 24 | extension lifecycle and popup routing
'use strict';
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const path = require('node:path');
const template = fs.readFileSync(path.join(__dirname, 'loader-template.js'), 'utf8');
function harness(options = {}) {
  const state = { canvas: options.canvas === false ? null : {}, installed: false, count: 0, removed: 0, fail: false };
  const context = { location: { origin: options.origin || 'https://farmricochet.com', pathname: '/play' }, document: { querySelector: () => state.canvas }, window: { render_pvp_to_text() {} }, setInterval: callback => { state.tick = callback; } };
  context.installMock = async () => {
    state.count++;
    if (state.pending) await state.pending;
    if (state.fail) throw new Error('module unavailable');
    state.installed = true;
    context.window.FarmPvpTrajetoria = { info: () => ({ installed: state.installed }), destroy() { state.installed = false; state.removed++; delete context.window.FarmPvpTrajetoria; } };
  };
  vm.createContext(context);
  vm.runInContext(template.replace('/* OVERLAY_SOURCE */', 'installMock()'), context);
  state.context = context;
  state.control = context.window.FarmRicochetesExtension;
  return state;
}
async function flush() { await new Promise(resolve => setImmediate(resolve)); }
async function run() {
  let state = harness({ canvas: false });
  await flush(); assert.equal(state.count, 0);
  state.canvas = {}; await state.tick(); assert.equal(state.count, 1);
  state.context.window.FarmPvpTrajetoria.destroy();
  await state.tick(); assert.equal(state.count, 1, 'manual removal is respected');
  await state.control.enable(); assert.equal(state.count, 2);
  state.control.disable(); await state.tick(); assert.equal(state.installed, false);
  state.canvas = {}; await state.control.enable(); assert.equal(state.installed, true);
  state.canvas = {};
  await state.tick(); assert.equal(state.count, 4, 'new arena is installed');
  state = harness({ canvas: false }); state.fail = true; state.canvas = {};
  await state.tick(); assert.match(state.control.info().error, /unavailable/);
  state.fail = false; await state.tick(); assert.equal(state.installed, true);
  state = harness({ canvas: false }); let release;
  state.pending = new Promise(resolve => release = resolve); state.canvas = {};
  const running = state.tick(); state.control.disable(); release(); await running;
  assert.equal(state.installed, false, 'disable wins over pending installation');
  state = harness({ origin: 'https://example.com' }); assert.equal(state.control, undefined);
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'extension/manifest.json'), 'utf8'));
  assert.deepEqual(manifest.permissions, ['activeTab', 'scripting']);
  assert.equal(manifest.content_scripts[0].world, 'MAIN');
  new vm.Script(fs.readFileSync(path.join(__dirname, 'extension/bootstrap.js'), 'utf8'));
  const popup = fs.readFileSync(path.join(__dirname, 'extension/popup.js'), 'utf8');
  const events = {}, status = { textContent: '' }, calls = [], buttons = [{}, {}];
  let url = 'https://farmricochet.com/play';
  const context = { URL, document: { getElementById: id => id === 'status' ? status : { addEventListener: (_, fn) => events[id] = fn }, querySelectorAll: () => buttons }, chrome: { tabs: { query: async () => [{ id: 42, url }] }, scripting: { executeScript: async options => { calls.push(options); return [{ result: 'OK' }]; } } } };
  vm.createContext(context); vm.runInContext(popup, context);
  await events.enable(); assert.equal(calls.length, 2); assert.equal(calls[0].target.tabId, 42);
  assert.equal(calls[0].world, 'MAIN'); assert.equal(status.textContent, 'OK');
  calls.length = 0; await events.disable(); assert.equal(calls.length, 1); assert.equal(calls[0].args[0], false);
  calls.length = 0; url = 'https://farmricochet.com.evil.example/play';
  await events.enable(); assert.equal(calls.length, 0); assert.match(status.textContent, /Selecione a aba/);
  assert.equal(buttons.some(button => button.disabled), false);
  console.log('PASS: arena lifecycle, removal/re-enable, retry, pending-import race, origin restrictions, popup tab routing and packaged syntax.');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
