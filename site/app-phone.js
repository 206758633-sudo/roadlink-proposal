(() => {
  'use strict';

  const appURL = new URL('riding-app.html?v=tuning-01', document.currentScript.src);
  const origin = location.protocol === 'file:' ? '*' : location.origin;
  const pageForFeature = {
    plate: 'me', ranking: 'ride', trajectory: 'routes', capture: 'ai',
    glove: 'ai', wechat: 'ai', dabing: 'community', routes: 'routes',
    report: 'me', tuning: 'community'
  };

  function frameMarkup() {
    return '<div class="app-phone"><div class="app-phone-camera" aria-hidden="true"></div><iframe class="app-phone-screen" title="ROADLINK 骑行 App"></iframe><i aria-hidden="true" class="app-phone-edge"></i></div>';
  }

  function link(page) {
    const url = new URL(appURL);
    url.hash = page;
    return url.href;
  }

  function mount(host, initial, onAction = () => {}) {
    const iframe = host.querySelector('iframe');
    let context = initial;
    let ready = false;
    let map = null;
    function post() {
      if (ready) iframe.contentWindow.postMessage({type:'roadlink-scene', context}, origin);
    }
    function receive(event) {
      if (event.source !== iframe.contentWindow || (origin !== '*' && event.origin !== origin)) return;
      if (event.data?.type === 'roadlink-phone-ready') {
        ready = true;
        post();
        if (map) iframe.contentWindow.postMessage({type:'roadlink-scene-map', map}, origin);
      } else if (event.data?.type === 'roadlink-phone-action') {
        onAction(event.data.action);
      }
    }
    function fit() {
      const width = iframe.parentElement.clientWidth;
      if (width) iframe.style.setProperty('--app-scale', width / 402);
    }
    const observer = new ResizeObserver(fit);
    observer.observe(iframe.parentElement);
    window.addEventListener('message', receive);
    const url = new URL(appURL);
    url.searchParams.set('embed', 'scene');
    url.hash = initial.page;
    iframe.src = url.href;
    fit();
    return {
      update(next) { context = next; post(); },
      drawMap(next) {
        map=next;
        if(ready) iframe.contentWindow.postMessage({type:'roadlink-scene-map',map},origin);
      },
      destroy() {
        observer.disconnect();
        window.removeEventListener('message', receive);
      }
    };
  }

  function feature(feat, phase, index) {
    return {
      kind:'feature', page:pageForFeature[feat.id] || 'ride', feature:feat.id,
      name:feat.name, phase:index, headline:phase.hud?.title || phase.title,
      detail:phase.hud?.desc || '', metrics:(phase.vals || []).map(({k,v})=>[k,v])
    };
  }

  window.RoadlinkPhone = {frameMarkup, link, mount, feature};
})();
