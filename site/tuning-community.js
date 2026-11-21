/**
 * ROADLINK · 骑行社区 · 机车 AI 改装娱乐社区 (1:1 同视角改装对比沙盘 + WebAudio 真实排气声浪试听 + 交规合规预审 + 社区抄作业联动)
 */
window.mountTuningCommunity = function (root, asset, speak) {
  'use strict';

  const BUILDS = [
    {
      id: 'blackgold',
      img: 'tuning-blackgold',
      shortTitle: '黑金碳纤竞技',
      title: '黑金锻造碳纤 · 赛道竞技版',
      author: '07 阿岳 · 杭州',
      badge: '🔥 本周热榜 TOP 1',
      prompt: '黑金锻造碳纤赛道风，配钛合金蓝焰短尾排气与金色锻造轮毂，100% 合规年检',
      copies: 428,
      likes: 1284,
      exhaust: {
        name: '钛合金蓝焰回压短尾',
        db: 87,
        stockDb: 78,
        baseHz: 55,
        filterHz: 390,
        note: '双缸低沉鼓点 · 实测 87dB(A) ≤ 国标90dB'
      },
      compliance: '✓ 交规 AI 预审通过：换色面积 24%（<30% 免变更行驶证）· 保留原厂三元催化与消音塞 · 不改动力车架',
      shop: { name: '杭州滨江 ROADLINK 官方认证工坊', dist: '4.6 km', labor: 380, code: '#T208' },
      parts: [
        { id: 'head', num: 1, x: 36, y: 23, cat: '风挡视镜', name: '熏黑竞技风挡 + CNC 手把镜', price: 620, weight: -0.3, legal: '原孔位无损安装' },
        { id: 'tank', num: 2, x: 47, y: 31, cat: '涂装护板', name: '锻造碳纤油箱罩 + 黑金竞技拉花', price: 1880, weight: -1.1, legal: '面积<30% 免备案' },
        { id: 'wheel', num: 3, x: 30, y: 65, cat: '轮系卡钳', name: '金色旋压锻造轮毂套装', price: 2580, weight: -1.8, legal: '原厂同尺寸合法' },
        { id: 'exhaust', num: 4, x: 55, y: 67, cat: '排气声浪', name: '钛合金蓝焰回压尾段 (含消音塞)', price: 2380, weight: -2.4, legal: '87dB 国标合规' }
      ]
    },
    {
      id: 'cement',
      img: 'tuning-cement',
      shortTitle: '水泥灰机能',
      title: '纳多水泥灰 · 赛博机能版',
      author: '18 陈默 · 成都',
      badge: '⚡ 跑山人气王',
      prompt: '纳多水泥灰配赛博荧光绿拉花，加装碳纤下压力定风翼与金色倒置减震',
      copies: 316,
      likes: 962,
      exhaust: {
        name: '隐藏式碳纤维底置回压包',
        db: 85,
        stockDb: 78,
        baseHz: 62,
        filterHz: 460,
        note: '中低转顺滑紧致 · 实测 85dB(A) 静谧浑厚'
      },
      compliance: '✓ 交规 AI 预审通过：已自动生成车管所 10元换色备案色卡 · 定风翼不超车宽 · 年检无忧',
      shop: { name: '成都天府 ROADLINK 官方机车中心', dist: '3.2 km', labor: 360, code: '#T315' },
      parts: [
        { id: 'head', num: 1, x: 35, y: 27, cat: '车头灯眉', name: '赛博绿灯眉 + 单座快拆后驼峰', price: 780, weight: -0.5, legal: '卡扣双座秒切换' },
        { id: 'tank', num: 2, x: 45, y: 34, cat: '气动涂装', name: '纳多水泥灰车衣 + 碳纤定风翼', price: 2180, weight: -0.6, legal: '附10元换色预约单' },
        { id: 'wheel', num: 3, x: 35, y: 49, cat: '悬挂系统', name: '金色氮气可调倒置前减震外管', price: 1920, weight: -0.4, legal: '原厂行程安全合规' },
        { id: 'exhaust', num: 4, x: 52, y: 70, cat: '底置排气', name: '碳纤维底置回压尾段 + 下导流罩', price: 2100, weight: -2.1, legal: '85dB 低噪合规' }
      ]
    },
    {
      id: 'retro',
      img: 'tuning-retro',
      shortTitle: '复古拉丝银',
      title: '手工拉丝铝 · 英伦咖啡骑士',
      author: '05 老周 · 大理',
      badge: '🎩 复古美学精选',
      prompt: '手工拉丝铝油箱配英伦墨绿腰线，菱格驼色真皮坐垫与双出不锈钢鱼雷排气',
      copies: 259,
      likes: 845,
      exhaust: {
        name: '高位双出拉丝不锈钢鱼雷管',
        db: 86,
        stockDb: 78,
        baseHz: 49,
        filterHz: 340,
        note: '英伦复古双缸脉冲 · 实测 86dB(A) 醇厚不炸街'
      },
      compliance: '✓ 交规 AI 预审通过：圆灯猪头罩采用国标切线透镜 · 含三元催化回压芯 · 100% 合规备案',
      shop: { name: '大理苍山 ROADLINK 认证定制工坊', dist: '2.8 km', labor: 420, code: '#T109' },
      parts: [
        { id: 'head', num: 1, x: 35, y: 26, cat: '复古导流', name: '复古圆灯子弹头导流罩 + 手把镜', price: 1180, weight: -0.2, legal: '国标透镜光型合规' },
        { id: 'tank', num: 2, x: 49, y: 34, cat: '金属油箱', name: '手工拉丝铝油箱罩 + 英伦绿腰线', price: 2280, weight: -0.5, legal: '附车管所备案指引' },
        { id: 'wheel', num: 3, x: 30, y: 66, cat: '轮系坐垫', name: '菱格缝线真皮坐垫 + 金圈真空辐条轮', price: 2950, weight: -0.9, legal: '原厂轮胎规格一致' },
        { id: 'exhaust', num: 4, x: 67, y: 48, cat: '复古双出', name: '高位双出拉丝不锈钢鱼雷尾段', price: 2680, weight: -1.6, legal: '86dB 含三元催化' }
      ]
    }
  ];

  const STAGES = [
    {
      label: '01 · 素车痛点与灵感',
      speech: '原厂素车千篇一律，盲目改装又怕难看踩坑、过不了年检。输入一句话灵感即可开启 1:1 预览。'
    },
    {
      label: '02 · AI 1:1 渲染换装',
      speech: 'AI 毫米级 3D 沙盘 2 秒渲染换装，拖动中间滑杆即可同视角对比改前原厂与改后效果。'
    },
    {
      label: '03 · 声浪试听与合规',
      speech: '在线试听双缸排气怠速与高转声浪，AI 自动核验分贝与换色面积，确保 100% 合法备案。'
    },
    {
      label: '04 · 抄作业到店施工',
      speech: '400 多位车友同款配件清单透明直采，一键同步手机 App 预约附近官方认证门店施工。'
    }
  ];

  const STAGE_MS = 4800;
  let destroyed = false;
  let buildIdx = 0;
  let viewMode = 'split'; // 'split' | 'after' | 'xray'
  let splitPct = 36;      // % of Before (stock) shown from left
  let activePartIdx = 1;
  let customTag = '';

  // Per-build interactive state (checked BOM items, likes, copies, booked)
  const buildState = BUILDS.map(b => ({
    checked: new Set(b.parts.map(p => p.id)),
    liked: false,
    likes: b.likes,
    copies: b.copies,
    booked: false
  }));

  // Story timeline state
  let playing = true;
  let stageIdx = 1;
  let stageElapsed = 0;
  let lastSpeechStage = -1;

  // Exhaust audio synthesizer state
  let audioCtx = null;
  let soundNodes = null;
  let soundPlaying = false;
  let exhaustMode = 'custom'; // 'stock' | 'custom'
  let currentRpm = 1450;
  let targetRpm = 1450;
  let revTimer = null;

  root.innerHTML = `
    <section class="tc" aria-label="机车 AI 改装娱乐社区">
      <div class="tc-grid">
        <!-- 1. 左侧：1:1 同视角暗房改装沙盘 + 真实排气声浪台 -->
        <div class="tc-stage">
          <header class="tc-stage-top">
            <div class="tc-stage-badge">
              <i class="tc-live-dot"></i>
              <span data-tc-stage-title></span>
              <span class="tc-render-tag" data-tc-render-tag>AI 渲染 2.1s</span>
            </div>
            <div class="tc-view-modes" role="group" aria-label="沙盘视图模式">
              <button type="button" data-tc-view="split" aria-pressed="true">⇄ 改前/改后对比</button>
              <button type="button" data-tc-view="after" aria-pressed="false">✦ 纯享成片</button>
              <button type="button" data-tc-view="xray" aria-pressed="false">◎ 部件热点</button>
            </div>
          </header>

          <div class="tc-viewport" data-tc-viewport>
            <img class="tc-bike-img tc-bike-after" data-tc-after alt="AI 改装方案渲染效果">
            <img class="tc-bike-img tc-bike-before" src="${asset('tuning-stock')}" data-tc-before alt="原厂素车状态">

            <span class="tc-corner-label tc-label-before" data-tc-lbl-before>原厂素车</span>
            <span class="tc-corner-label tc-label-after" data-tc-lbl-after></span>

            <div class="tc-scanline" data-tc-scanline></div>

            <div class="tc-divider" data-tc-divider title="左右拖动对比改前素车与 AI 改装效果">
              <span class="tc-divider-knob">⇄</span>
            </div>

            <div class="tc-pins" data-tc-pins></div>
            <div class="tc-part-pop" data-tc-part-pop></div>
          </div>

          <div class="tc-soundbar">
            <div class="tc-sound-head">
              <div class="tc-sound-title">
                <span>🎧 真实排气声浪试听</span>
                <span class="tc-sound-note" data-tc-exhaust-name></span>
              </div>
              <span class="tc-db-pill" data-tc-db-pill></span>
            </div>
            <div class="tc-sound-controls">
              <div class="tc-sound-btns">
                <button type="button" class="tc-btn-sound" data-tc-sound-toggle aria-pressed="false">🔊 试听怠速声浪</button>
                <button type="button" class="tc-btn-rev" data-tc-rev>⚡ 轰油门 7500 RPM</button>
              </div>
              <div class="tc-exhaust-switch" role="group" aria-label="切换原厂与改装排气音色">
                <button type="button" data-tc-exhaust-mode="stock" aria-pressed="false">原厂静音 78dB</button>
                <button type="button" data-tc-exhaust-mode="custom" aria-pressed="true">改装回压声浪</button>
              </div>
            </div>
            <div class="tc-spectrum-wrap">
              <canvas class="tc-spectrum-canvas" data-tc-spectrum></canvas>
              <span class="tc-rpm-readout" data-tc-rpm>1,450 RPM</span>
            </div>
          </div>
        </div>

        <!-- 2. 中间：AI 灵感输入 + 三大流派 + 可勾选配件清单 + 一键抄作业 -->
        <div class="tc-console">
          <form class="tc-prompt-form" data-tc-form>
            <input class="tc-prompt-input" type="text" name="prompt" maxlength="60" placeholder="输入改装灵感：如 黑金碳纤 / 水泥灰定风翼 / 复古双出排气">
            <button class="tc-prompt-submit" type="submit">✦ AI 换装</button>
          </form>

          <div class="tc-builds" role="group" aria-label="热门车友改装流派">
            ${BUILDS.map((b, idx) => `
              <button type="button" class="tc-build-btn" data-tc-build="${idx}" aria-pressed="${idx === 0}">
                <strong>${b.shortTitle}</strong>
                <small>🔥 <span data-tc-build-copies="${idx}">${b.copies}</span> 人抄作业</small>
              </button>
            `).join('')}
          </div>

          <div class="tc-metrics">
            <div class="tc-metric-card">
              <small>已选配件直采</small>
              <strong class="accent" data-tc-total-price></strong>
            </div>
            <div class="tc-metric-card">
              <small>整车轻量化</small>
              <strong data-tc-total-weight></strong>
            </div>
            <div class="tc-metric-card">
              <small>交规 AI 预审</small>
              <strong class="success">100% 合规</strong>
            </div>
          </div>

          <div class="tc-bom">
            <div class="tc-bom-head">
              <span data-tc-author></span>
              <span>点击配件定位 · 勾选自由搭配</span>
            </div>
            <div class="tc-bom-list" data-tc-bom-list></div>
          </div>

          <div class="tc-compliance-bar" data-tc-compliance></div>

          <div class="tc-cta-row">
            <button type="button" class="tc-like-btn" data-tc-like></button>
            <button type="button" class="tc-copy-cta" data-tc-book></button>
          </div>
        </div>

        <!-- 3. 右侧：实时联动的 ROADLINK 手机 App -->
        <aside class="app-phone-panel" aria-label="骑行社区 AI 改装工坊手机 App">
          <div class="app-phone-label">
            <b>手机 App · AI 改装坊</b>
            <a target="_blank" rel="noopener" data-tc-app-link href="${RoadlinkPhone.link('tuning')}">打开完整 App ↗</a>
          </div>
          ${RoadlinkPhone.frameMarkup()}
        </aside>
      </div>

      <!-- 4. 底部四阶段演示进度条 -->
      <footer class="tc-player">
        <div class="tc-transport">
          <button type="button" data-tc-play>Ⅱ 暂停</button>
          <button type="button" data-tc-replay>↺ 重播</button>
        </div>
        <div class="tc-stages" role="group" aria-label="改装演示阶段">
          ${STAGES.map((st, idx) => `
            <button type="button" class="tc-stage-step" data-tc-stage="${idx}" aria-current="${idx === stageIdx ? 'step' : 'false'}">
              <span>${st.label}</span>
              <i class="tc-stage-fill" data-tc-fill="${idx}" style="width:0%"></i>
            </button>
          `).join('')}
        </div>
      </footer>
    </section>
  `;

  const $ = sel => root.querySelector(sel);
  const all = sel => Array.from(root.querySelectorAll(sel));

  const viewportEl = $('[data-tc-viewport]');
  const afterImg = $('[data-tc-after]');
  const beforeImg = $('[data-tc-before]');
  const dividerEl = $('[data-tc-divider]');
  const scanlineEl = $('[data-tc-scanline]');
  const pinsEl = $('[data-tc-pins]');
  const partPopEl = $('[data-tc-part-pop]');
  const promptInput = $('.tc-prompt-input');
  const spectrumCanvas = $('[data-tc-spectrum]');
  const sCtx = spectrumCanvas.getContext('2d');

  function calcTotals(idx) {
    const b = BUILDS[idx];
    const st = buildState[idx];
    let price = 0;
    let weight = 0;
    let count = 0;
    b.parts.forEach(p => {
      if (st.checked.has(p.id)) {
        price += p.price;
        weight += p.weight;
        count += 1;
      }
    });
    return { price, weight, count };
  }

  function buildPhoneContext() {
    const b = BUILDS[buildIdx];
    const st = buildState[buildIdx];
    const totals = calcTotals(buildIdx);
    return {
      kind: 'tuning',
      page: 'community',
      feature: 'tuning',
      buildId: b.id,
      img: '../' + asset(b.img),
      title: b.title,
      shortTitle: b.shortTitle,
      author: b.author,
      badge: b.badge,
      price: totals.price,
      weight: totals.weight.toFixed(1),
      partCount: totals.count,
      totalParts: b.parts.length,
      db: b.exhaust.db,
      copies: st.copies,
      booked: st.booked,
      shopName: b.shop.name,
      shopDist: b.shop.dist,
      shopLabor: b.shop.labor,
      shopCode: b.shop.code,
      parts: b.parts.filter(p => st.checked.has(p.id)).map(p => [p.name, '¥' + p.price])
    };
  }

  const phone = RoadlinkPhone.mount($('.app-phone-panel'), buildPhoneContext(), action => {
    pauseAuto();
    if (action === 'tuning-next-build') {
      selectBuild((buildIdx + 1) % BUILDS.length, true);
    } else if (action === 'tuning-book-shop') {
      bookCurrentBuild();
    }
  });

  function triggerLaserScan() {
    scanlineEl.classList.remove('is-scanning');
    void scanlineEl.offsetWidth;
    scanlineEl.classList.add('is-scanning');
  }

  // ==================== Web Audio API 真实双缸排气声浪合成器 ====================
  function ensureAudioEngine() {
    if (audioCtx) return;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;
    audioCtx = new AudioCtor();

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const pulseOsc = audioCtx.createOscillator();
    const pulseGain = audioCtx.createGain();
    const subOsc = audioCtx.createOscillator();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    subOsc.type = 'sine';
    pulseOsc.type = 'sine';

    const mixer = audioCtx.createGain();
    const subGain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 3.2;

    const master = audioCtx.createGain();
    master.gain.value = 0.0001;

    // 4-stroke firing cadence modulation
    pulseOsc.connect(pulseGain.gain);
    osc1.connect(mixer);
    osc2.connect(mixer);
    subOsc.connect(subGain);

    mixer.connect(pulseGain);
    subGain.connect(filter);
    pulseGain.connect(filter);
    filter.connect(master);
    master.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    subOsc.start();
    pulseOsc.start();

    soundNodes = { osc1, osc2, subOsc, pulseOsc, pulseGain, subGain, mixer, filter, master };
    syncAudioParams();
  }

  function syncAudioParams() {
    if (!audioCtx || !soundNodes) return;
    const b = BUILDS[buildIdx];
    const isCustom = exhaustMode === 'custom';
    const rpmRatio = currentRpm / 1450;
    const base = b.exhaust.baseHz * rpmRatio;

    soundNodes.osc1.frequency.setTargetAtTime(base, audioCtx.currentTime, 0.04);
    soundNodes.osc2.frequency.setTargetAtTime(base * 1.505, audioCtx.currentTime, 0.04);
    soundNodes.subOsc.frequency.setTargetAtTime(base * 0.5, audioCtx.currentTime, 0.04);
    soundNodes.pulseOsc.frequency.setTargetAtTime((currentRpm / 60) * 0.5, audioCtx.currentTime, 0.04);

    const cutoff = (isCustom ? b.exhaust.filterHz : 210) * (0.85 + rpmRatio * 0.55);
    soundNodes.filter.frequency.setTargetAtTime(Math.min(2400, cutoff), audioCtx.currentTime, 0.05);
    soundNodes.filter.Q.setTargetAtTime(isCustom ? 3.8 : 1.4, audioCtx.currentTime, 0.05);
    soundNodes.subGain.gain.setTargetAtTime(isCustom ? 0.34 : 0.12, audioCtx.currentTime, 0.05);
    soundNodes.mixer.gain.setTargetAtTime(isCustom ? 0.28 : 0.13, audioCtx.currentTime, 0.05);

    const targetGain = soundPlaying ? (isCustom ? 0.22 : 0.11) * Math.min(1.45, 0.85 + (rpmRatio - 1) * 0.22) : 0.0001;
    soundNodes.master.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.06);
  }

  function toggleSound(forceOn) {
    ensureAudioEngine();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    soundPlaying = typeof forceOn === 'boolean' ? forceOn : !soundPlaying;
    syncAudioParams();
    renderControls();
  }

  function triggerThrottleRev() {
    pauseAuto();
    toggleSound(true);
    const revBtn = $('[data-tc-rev]');
    revBtn.classList.add('is-revving');
    targetRpm = 7520;
    if (revTimer) clearTimeout(revTimer);
    revTimer = setTimeout(() => {
      if (destroyed) return;
      targetRpm = 1450;
      revBtn.classList.remove('is-revving');
    }, 1150);
  }

  // ==================== 交互控制与状态同步 ====================
  function pauseAuto() {
    if (playing) {
      playing = false;
      renderTransport();
    }
  }

  function selectBuild(idx, withScan) {
    buildIdx = idx;
    activePartIdx = Math.min(activePartIdx, BUILDS[idx].parts.length - 1);
    customTag = '';
    promptInput.value = BUILDS[idx].prompt;
    if (withScan) triggerLaserScan();
    syncAudioParams();
    renderAll();
  }

  function bookCurrentBuild() {
    const st = buildState[buildIdx];
    if (!st.booked) {
      st.booked = true;
      st.copies += 1;
    }
    stageIdx = 3;
    stageElapsed = 0;
    renderAll();
    if (speak) speak('已复制同款配件清单并下发至' + BUILDS[buildIdx].shop.name);
  }

  function applyStagePreset(idx, fromAuto) {
    stageIdx = idx;
    stageElapsed = 0;
    if (idx === 0) {
      viewMode = 'split';
      splitPct = 76;
    } else if (idx === 1) {
      viewMode = 'split';
      splitPct = 28;
      triggerLaserScan();
    } else if (idx === 2) {
      viewMode = 'xray';
      activePartIdx = 3; // highlight exhaust & compliance
    } else if (idx === 3) {
      viewMode = 'after';
    }
    renderAll();
    if (speak && (fromAuto || lastSpeechStage !== idx)) {
      lastSpeechStage = idx;
      speak(STAGES[idx].speech);
    }
  }

  function renderViewportOnly() {
    const b = BUILDS[buildIdx];
    const showSplit = viewMode === 'split';
    beforeImg.style.display = showSplit ? 'block' : 'none';
    dividerEl.style.display = showSplit ? 'block' : 'none';
    $('[data-tc-lbl-before]').style.opacity = showSplit && splitPct > 14 ? '1' : '0';
    if (showSplit) {
      beforeImg.style.clipPath = `inset(0 ${(100 - splitPct).toFixed(1)}% 0 0)`;
      dividerEl.style.left = `${splitPct.toFixed(1)}%`;
    }
    $('[data-tc-lbl-after]').textContent = customTag || ('AI 改装 · ' + b.shortTitle);
  }

  function renderControls() {
    const b = BUILDS[buildIdx];
    const isCustom = exhaustMode === 'custom';
    const liveDb = Math.round((isCustom ? b.exhaust.db : b.exhaust.stockDb) + ((currentRpm - 1450) / 6000) * 2.4);

    $('[data-tc-exhaust-name]').textContent = isCustom ? b.exhaust.name + ' · ' + b.exhaust.note : '原厂不锈钢静音尾段 · 平顺温和';
    $('[data-tc-db-pill]').textContent = `峰值 ${liveDb} dB(A) · 国标 ≤90dB 合规`;

    const soundBtn = $('[data-tc-sound-toggle]');
    soundBtn.setAttribute('aria-pressed', String(soundPlaying));
    soundBtn.textContent = soundPlaying ? '🔊 声浪试听中 (点击停止)' : '🔊 试听怠速声浪';

    all('[data-tc-exhaust-mode]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.tcExhaustMode === exhaustMode));
    });
  }

  function renderTransport() {
    $('[data-tc-play]').textContent = playing ? 'Ⅱ 暂停' : '▶ 继续';
    all('[data-tc-stage]').forEach((btn, idx) => {
      btn.setAttribute('aria-current', idx === stageIdx ? 'step' : 'false');
      const fill = btn.querySelector('[data-tc-fill]');
      if (fill) {
        const w = idx < stageIdx ? 100 : idx === stageIdx ? Math.min(100, (stageElapsed / STAGE_MS) * 100) : 0;
        fill.style.width = w.toFixed(1) + '%';
      }
    });
  }

  function renderAll() {
    const b = BUILDS[buildIdx];
    const st = buildState[buildIdx];
    const totals = calcTotals(buildIdx);
    const activePart = b.parts[activePartIdx] || b.parts[0];

    // Stage top & images
    $('[data-tc-stage-title]').textContent = b.title;
    $('[data-tc-render-tag]').textContent = customTag ? '✦ 灵感定制已生成' : b.badge;
    afterImg.src = asset(b.img);

    all('[data-tc-view]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.tcView === viewMode));
    });

    renderViewportOnly();

    // Pins on motorcycle
    pinsEl.innerHTML = b.parts.map((p, idx) => {
      const checked = st.checked.has(p.id);
      const cls = ['tc-pin', idx === activePartIdx ? 'is-active' : '', !checked ? 'is-muted' : ''].filter(Boolean).join(' ');
      return `<button type="button" class="${cls}" data-tc-pin="${idx}" style="left:${p.x}%;top:${p.y}%;" title="${p.name}">${p.num}</button>`;
    }).join('');

    // Floating active part spec card
    partPopEl.hidden = viewMode === 'split' && stageIdx === 0;
    partPopEl.innerHTML = `
      <div class="tc-part-pop-top">
        <strong>0${activePart.num} · ${activePart.name}</strong>
        <span class="tc-part-legal">✓ ${activePart.legal}</span>
      </div>
      <div class="tc-part-pop-meta">
        <span>直采价 <b>¥${activePart.price.toLocaleString('zh-CN')}</b></span>
        <span>轻量化 <b>${activePart.weight} kg</b></span>
        <span>类别：${activePart.cat}</span>
      </div>
    `;

    // Build selector cards
    all('[data-tc-build]').forEach((btn, idx) => {
      btn.setAttribute('aria-pressed', String(idx === buildIdx));
      const copySpan = btn.querySelector('[data-tc-build-copies]');
      if (copySpan) copySpan.textContent = buildState[idx].copies;
    });

    // Metrics
    $('[data-tc-total-price]').textContent = '¥' + totals.price.toLocaleString('zh-CN');
    $('[data-tc-total-weight]').textContent = (totals.weight < 0 ? totals.weight.toFixed(1) : '0.0') + ' kg';
    $('[data-tc-author]').textContent = `方案主理人：${b.author}（已选 ${totals.count}/${b.parts.length} 件）`;

    // BOM checklist
    $('[data-tc-bom-list]').innerHTML = b.parts.map((p, idx) => {
      const checked = st.checked.has(p.id);
      return `
        <div class="tc-bom-item ${idx === activePartIdx ? 'is-focused' : ''} ${checked ? '' : 'is-unchecked'}" data-tc-bom-row="${idx}">
          <div class="tc-bom-left">
            <span class="tc-check" data-tc-bom-toggle="${p.id}" role="checkbox" aria-checked="${checked}" tabindex="0">${checked ? '✓' : ''}</span>
            <div class="tc-bom-title">
              <b>0${p.num} · ${p.name}</b>
              <span>✓ ${p.legal} · ${p.weight}kg</span>
            </div>
          </div>
          <span class="tc-bom-price">¥${p.price}</span>
        </div>
      `;
    }).join('');

    // Compliance & Social CTAs
    $('[data-tc-compliance]').textContent = b.compliance;

    const likeBtn = $('[data-tc-like]');
    likeBtn.className = 'tc-like-btn' + (st.liked ? ' is-liked' : '');
    likeBtn.textContent = `${st.liked ? '♥' : '♡'} ${st.likes.toLocaleString('zh-CN')}`;

    const bookBtn = $('[data-tc-book]');
    bookBtn.className = 'tc-copy-cta' + (st.booked ? ' is-booked' : '');
    bookBtn.textContent = st.booked
      ? `✓ 已同步 App 预约门店 (${b.shop.code})`
      : `🛍️ 一键抄作业 · 预约门店 (${st.copies}人同款)`;

    renderControls();
    renderTransport();
    phone.update(buildPhoneContext());
  }

  // ==================== 拖拽分割滑杆交互 ====================
  let draggingSplit = false;
  function updateSplitFromPointer(clientX) {
    const rect = viewportEl.getBoundingClientRect();
    if (!rect.width) return;
    splitPct = Math.max(6, Math.min(94, ((clientX - rect.left) / rect.width) * 100));
    if (viewMode !== 'split') {
      viewMode = 'split';
      renderAll();
    } else {
      renderViewportOnly();
    }
  }

  viewportEl.addEventListener('pointerdown', e => {
    if (e.target.closest('[data-tc-pin]')) return;
    if (viewMode !== 'split' && !e.target.closest('[data-tc-divider]')) return;
    pauseAuto();
    draggingSplit = true;
    viewportEl.setPointerCapture?.(e.pointerId);
    updateSplitFromPointer(e.clientX);
  });

  viewportEl.addEventListener('pointermove', e => {
    if (!draggingSplit) return;
    updateSplitFromPointer(e.clientX);
  });

  viewportEl.addEventListener('pointerup', () => { draggingSplit = false; });
  viewportEl.addEventListener('pointercancel', () => { draggingSplit = false; });

  // ==================== 全局点击与表单委托 ====================
  root.addEventListener('click', e => {
    const viewBtn = e.target.closest('[data-tc-view]');
    if (viewBtn) {
      pauseAuto();
      viewMode = viewBtn.dataset.tcView;
      if (viewMode === 'split' && (splitPct < 12 || splitPct > 88)) splitPct = 42;
      renderAll();
      return;
    }

    const buildBtn = e.target.closest('[data-tc-build]');
    if (buildBtn) {
      pauseAuto();
      selectBuild(Number(buildBtn.dataset.tcBuild), true);
      return;
    }

    const pinBtn = e.target.closest('[data-tc-pin]');
    if (pinBtn) {
      pauseAuto();
      activePartIdx = Number(pinBtn.dataset.tcPin);
      if (activePartIdx === 3) exhaustMode = 'custom';
      renderAll();
      return;
    }

    const bomToggle = e.target.closest('[data-tc-bom-toggle]');
    if (bomToggle) {
      e.stopPropagation();
      pauseAuto();
      const partId = bomToggle.dataset.tcBomToggle;
      const set = buildState[buildIdx].checked;
      if (set.has(partId) && set.size > 1) set.delete(partId);
      else set.add(partId);
      renderAll();
      return;
    }

    const bomRow = e.target.closest('[data-tc-bom-row]');
    if (bomRow) {
      pauseAuto();
      activePartIdx = Number(bomRow.dataset.tcBomRow);
      renderAll();
      return;
    }

    if (e.target.closest('[data-tc-sound-toggle]')) {
      pauseAuto();
      toggleSound();
      return;
    }

    if (e.target.closest('[data-tc-rev]')) {
      triggerThrottleRev();
      return;
    }

    const exBtn = e.target.closest('[data-tc-exhaust-mode]');
    if (exBtn) {
      pauseAuto();
      exhaustMode = exBtn.dataset.tcExhaustMode;
      syncAudioParams();
      renderControls();
      return;
    }

    if (e.target.closest('[data-tc-like]')) {
      pauseAuto();
      const st = buildState[buildIdx];
      st.liked = !st.liked;
      st.likes += st.liked ? 1 : -1;
      renderAll();
      return;
    }

    if (e.target.closest('[data-tc-book]')) {
      pauseAuto();
      bookCurrentBuild();
      return;
    }

    if (e.target.closest('[data-tc-play]')) {
      playing = !playing;
      renderTransport();
      return;
    }

    if (e.target.closest('[data-tc-replay]')) {
      replay();
      return;
    }

    const stBtn = e.target.closest('[data-tc-stage]');
    if (stBtn) {
      pauseAuto();
      applyStagePreset(Number(stBtn.dataset.tcStage), false);
    }
  });

  $('[data-tc-form]').addEventListener('submit', e => {
    e.preventDefault();
    pauseAuto();
    const val = promptInput.value.trim();
    if (!val) return;
    if (/复古|银|铝|咖啡|圆灯|鱼雷/.test(val)) buildIdx = 2;
    else if (/水泥|灰|绿|赛博|定风翼|驼峰/.test(val)) buildIdx = 1;
    else buildIdx = 0;
    customTag = '✦ AI 定制：' + val.slice(0, 14) + (val.length > 14 ? '…' : '');
    viewMode = 'split';
    splitPct = 25;
    triggerLaserScan();
    syncAudioParams();
    renderAll();
  });

  // ==================== 声浪频谱与主动画循环 ====================
  let rafId = 0;
  let lastStamp = performance.now();

  function drawSpectrum(now) {
    const w = spectrumCanvas.width = spectrumCanvas.parentElement?.clientWidth || 380;
    const h = spectrumCanvas.height = 44;
    sCtx.clearRect(0, 0, w, h);

    const bars = 36;
    const gap = 3;
    const barW = Math.max(2, (w - 96 - gap * bars) / bars);
    const rpmNorm = (currentRpm - 1450) / 6200;
    const isCustom = exhaustMode === 'custom';
    const activeAmp = soundPlaying ? (isCustom ? 0.92 : 0.48) : 0.24;

    for (let i = 0; i < bars; i++) {
      const freqBand = i / bars;
      const bassBoost = isCustom ? Math.exp(-freqBand * 2.4) : Math.exp(-Math.pow(freqBand - 0.35, 2) * 8);
      const wave = 0.55 + 0.45 * Math.sin(now * (soundPlaying ? 0.016 : 0.004) + i * 0.62);
      const revBoost = 1 + rpmNorm * (0.6 + freqBand * 1.1);
      const bh = Math.max(3, Math.min(h - 6, h * 0.72 * activeAmp * bassBoost * wave * revBoost));
      const x = 8 + i * (barW + gap);
      const y = h - bh - 3;

      sCtx.fillStyle = rpmNorm > 0.35 && i < 14
        ? '#fb7185'
        : isCustom
          ? (soundPlaying ? '#f5c400' : 'rgba(245, 196, 0, 0.45)')
          : 'rgba(148, 163, 184, 0.55)';
      sCtx.beginPath();
      sCtx.roundRect(x, y, barW, bh, 2);
      sCtx.fill();
    }
  }

  function tick(now) {
    if (destroyed) return;
    const dt = Math.min(80, now - lastStamp);
    lastStamp = now;

    // Smooth RPM interpolation
    const prevRpm = currentRpm;
    currentRpm += (targetRpm - currentRpm) * Math.min(1, dt * (targetRpm > currentRpm ? 0.014 : 0.006));
    if (Math.abs(currentRpm - prevRpm) > 4) {
      $('[data-tc-rpm]').textContent = `${Math.round(currentRpm).toLocaleString('zh-CN')} RPM`;
      if (soundPlaying) syncAudioParams();
    }

    // Story timeline auto-progression
    if (playing && !document.hidden) {
      stageElapsed += dt;
      if (viewMode === 'split' && stageIdx === 0) {
        splitPct = 78 - (stageElapsed / STAGE_MS) * 32;
        renderViewportOnly();
      } else if (viewMode === 'split' && stageIdx === 1) {
        splitPct = 46 - (stageElapsed / STAGE_MS) * 26;
        renderViewportOnly();
      }
      if (stageElapsed >= STAGE_MS) {
        const nextStage = (stageIdx + 1) % STAGES.length;
        if (nextStage === 0) buildIdx = (buildIdx + 1) % BUILDS.length;
        applyStagePreset(nextStage, true);
      } else {
        renderTransport();
      }
    }

    drawSpectrum(now);
    rafId = requestAnimationFrame(tick);
  }

  function replay() {
    playing = true;
    applyStagePreset(0, true);
  }

  promptInput.value = BUILDS[0].prompt;
  renderAll();
  rafId = requestAnimationFrame(tick);

  return {
    replay,
    toggle() {
      playing = !playing;
      renderTransport();
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(rafId);
      if (revTimer) clearTimeout(revTimer);
      if (audioCtx) {
        try { audioCtx.close(); } catch (e) {}
        audioCtx = null;
      }
      phone.destroy();
    }
  };
};
