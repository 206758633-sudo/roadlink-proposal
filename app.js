/* ROADLINK · 六个场景提案 — 路由、进场与六个可交互的手机/车机界面示意 */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  /* ---------- 定时器小工具：切页时统一清掉 ---------- */
  function clock() {
    var ids = [];
    return {
      set: function (fn, ms) { var id = setTimeout(fn, ms); ids.push(id); return id; },
      every: function (fn, ms) { var id = setInterval(fn, ms); ids.push(id); return id; },
      clear: function () { ids.forEach(function (id) { clearTimeout(id); clearInterval(id); }); ids.length = 0; }
    };
  }

  /* =========================================================
     01 · CONVOY
     ========================================================= */
  function initConvoy(root) {
    var path = $('#convPath', root), g = $('#convRiders', root);
    var list = $('#convList', root), alertEl = $('#convAlert', root);
    var modeTag = $('#convMode', root), netTag = $('#convNet', root);
    if (!path || !g) return null;
    var L = path.getTotalLength();
    var riders = [
      { p: 0.87, name: '阿哲', role: '头车', fuel: 72, lead: true },
      { p: 0.75, name: '老周', role: '2 号', fuel: 45 },
      { p: 0.62, name: '小陈', role: '3 号', fuel: 12 },
      { p: 0.49, name: 'Jesco', role: '4 号', fuel: 88 },
      { p: 0.37, name: '源', role: '收队', fuel: 61 }
    ];
    var nodes = riders.map(function (r, i) {
      var el = document.createElementNS(NS, 'g');
      el.setAttribute('class', 'rider' + (r.lead ? ' lead' : ''));
      if (r.lead) {
        var ring = document.createElementNS(NS, 'circle');
        ring.setAttribute('r', '14'); ring.setAttribute('class', 'ring');
        el.appendChild(ring);
      }
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('r', '6'); el.appendChild(c);
      var t = document.createElementNS(NS, 'text');
      t.setAttribute('y', '19'); t.textContent = String(i + 1);
      el.appendChild(t);
      g.appendChild(el);
      return el;
    });
    function place(i) {
      var r = riders[i], pt = path.getPointAtLength(Math.max(0, Math.min(1, r.p)) * L);
      nodes[i].style.transform = 'translate(' + pt.x + 'px,' + pt.y + 'px)';
    }
    riders.forEach(function (_, i) { place(i); });

    function drawList() {
      list.innerHTML = riders.map(function (r, i) {
        return '<li class="' + (r.lead ? 'lead' : '') + (r.fuel < 20 ? ' low' : '') + '">' +
          '<b>' + (i + 1) + '</b><span>' + r.name + ' · ' + r.role + '</span>' +
          '<span class="fuel"><i>' + r.fuel + '%</i></span></li>';
      }).join('');
    }
    drawList();

    var MODES = {
      trail: {
        tag: '林道 · 无卫星信号', net: '相对定位 · 5 节点',
        kind: '', lag: 2,
        html: '<b>3 号车掉队 120 m</b>｜已通知头车与收队人，队形自动收拢', stamp: '+15s'
      },
      city: {
        tag: '城市 · GPS 良好', net: '编队 4 车 · 平均间距 30 m',
        kind: 'warn', lag: -1,
        html: '<b>4 号车进入隧道</b>｜卫星信号丢失，已切换相对定位', stamp: '自动'
      },
      highway: {
        tag: '高速 · 横风 6 级', net: 'V2V 编队 · 间距 80 m',
        kind: 'warn', lag: 1,
        html: '<b>2 号车侧风偏航</b>｜建议拉开至 120 m，减少并行超车', stamp: '提示'
      }
    };
    var clk = clock();
    var mode = 'trail';

    function apply(name) {
      mode = name;
      var m = MODES[name] || MODES.trail;
      clk.clear();
      modeTag.textContent = m.tag;
      netTag.textContent = m.net;
      alertEl.className = 'conv-alert' + (m.kind ? ' ' + m.kind : '');
      alertEl.querySelector('span').innerHTML = m.html;
      alertEl.querySelector('.mono').textContent = m.stamp;
      // 复位队形
      riders[2].p = 0.62; riders[1].p = 0.75; riders[0].p = 0.87;
      riders.forEach(function (_, i) { place(i); });
      if (REDUCE) { alertEl.classList.add('show'); return; }
      clk.set(function () {
        alertEl.classList.add('show');
        if (m.lag >= 0) { riders[m.lag].p -= 0.055; place(m.lag); }
      }, 1800);
      clk.set(function () { alertEl.classList.remove('show'); if (m.lag >= 0) { riders[m.lag].p += 0.055; place(m.lag); } }, 7600);
      clk.set(function () {
        alertEl.querySelector('span').innerHTML = '<b>加油顺位</b>｜3 号车剩 12%，建议 42 km 后加油';
        alertEl.className = 'conv-alert show warn';
      }, 9200);
      clk.set(function () { alertEl.classList.remove('show'); }, 13500);
    }

    $$('[data-conv]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-conv]', root).forEach(function (x) { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
        apply(b.dataset.conv);
      });
    });

    return {
      start: function () { apply(mode); },
      stop: function () { clk.clear(); alertEl.classList.remove('show'); }
    };
  }

  /* =========================================================
     02 · VISION / HUD
     ========================================================= */
  function initHud(root) {
    var arc = $('#hudArc', root), warn = $('#hudWarn', root);
    var distEl = $('#hudDist', root), speedEl = $('#hudSpeed', root);
    var cornerEl = $('#hudCorner', root), cornerSub = $('#hudCornerSub', root);
    var noEl = $('#hudCornerNo', root), adviceEl = $('#hudAdvice', root);
    var modeEl = $('#hudMode', root), progEl = $('#hudProg', root), nextEl = $('#hudNext', root);
    if (!arc) return null;
    var L = arc.getTotalLength();
    arc.style.strokeDasharray = L;
    arc.style.strokeDashoffset = L;

    var MODES = {
      hairpin: { no: 'C4', corner: '右弯 · 曲率 22 m', sub: '发夹弯 · 建议一挡通过', advice: '建议入弯 38', speed: 58, fill: 0.92, mode: '跑山 · 低密度' },
      s: { no: 'C7', corner: '连续 S 弯 · 曲率 34 m', sub: '3 个反向弯 · 视线短', advice: '建议入弯 52', speed: 66, fill: 0.7, mode: '跑山 · 低密度' },
      fast: { no: 'C11', corner: '高速弯 · 曲率 120 m', sub: '视野良好 · 无对向记录', advice: '建议入弯 96', speed: 84, fill: 0.42, mode: '导航 · 标准' }
    };
    var dist = 240, clk = clock(), mode = 'hairpin';

    function render() {
      var m = MODES[mode];
      distEl.textContent = '前方 ' + Math.round(dist) + ' m';
      progEl.style.setProperty('--p', ((240 - dist) / 240 * 100) + '%');
      nextEl.textContent = Math.max(0, Math.round(dist - 40)) + ' m';
      if (dist < 55) {
        warn.classList.add('show');
        adviceEl.textContent = '收油 · 可过';
        speedEl.textContent = String(Math.max(34, m.speed - 14));
      } else {
        warn.classList.remove('show');
        adviceEl.textContent = m.advice;
        speedEl.textContent = String(m.speed);
      }
    }
    function apply(name) {
      mode = name; var m = MODES[name] || MODES.hairpin;
      clk.clear();
      dist = 240;
      cornerEl.textContent = m.corner;
      cornerSub.textContent = m.sub;
      noEl.textContent = m.no;
      modeEl.textContent = m.mode;
      arc.style.strokeDashoffset = L * (1 - m.fill);
      render();
      if (REDUCE) return;
      clk.every(function () {
        dist -= 3.4;
        if (dist < 12) dist = 240;
        render();
      }, 130);
    }
    $$('[data-hud]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-hud]', root).forEach(function (x) { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
        apply(b.dataset.hud);
      });
    });
    return { start: function () { apply(mode); }, stop: function () { clk.clear(); warn.classList.remove('show'); } };
  }

  /* =========================================================
     03 · GLOVE
     ========================================================= */
  function initGlove(root) {
    var raw = $('#waveRaw', root), clean = $('#waveClean', root);
    var script = $('#glScript', root), mic = $('#glMic', root);
    var idle = $('#glIdle', root);
    var stateT = $('#glStateT', root), stateS = $('#glStateS', root), wake = $('#glWake', root);
    if (!raw || !mic) return null;
    var N = 88, rawBars = [], cleanBars = [];
    for (var i = 0; i < N; i++) {
      var a = document.createElement('i'); raw.appendChild(a); rawBars.push(a);
      var b = document.createElement('i'); clean.appendChild(b); cleanBars.push(b);
    }
    var clk = clock(), busy = false;

    function jitter() {
      rawBars.forEach(function (el) {
        el.style.height = (10 + Math.random() * 84) + '%';
        el.style.opacity = (0.22 + Math.random() * 0.45).toFixed(2);
      });
      cleanBars.forEach(function (el, i) {
        var x = i / N;
        var syl = Math.abs(Math.sin(x * Math.PI * 8.5));
        var h = (9 + syl * 68) * (0.72 + Math.random() * 0.5);
        el.style.height = Math.min(94, h) + '%';
        el.style.opacity = (0.7 + Math.random() * 0.3).toFixed(2);
      });
    }
    function bubble(text, who, mine) {
      var el = document.createElement('div');
      el.className = 'bubble' + (mine ? ' me' : '');
      el.innerHTML = '<span class="who">' + who + '</span>' + text;
      script.appendChild(el);
      while (script.children.length > 3) script.removeChild(script.firstChild);
      requestAnimationFrame(function () { el.classList.add('in'); });
      script.scrollTop = script.scrollHeight;
    }
    function run() {
      if (busy) return;
      busy = true; mic.disabled = true;
      script.innerHTML = '';
      wake.textContent = '聆听中 · 96 dB';
      stateT.textContent = '聆听中';
      stateS.textContent = '风噪抑制 · 波束成形';

      clk.set(function () { bubble('跟老张说晚半小时到', '你 · 手势唤醒', true); stateT.textContent = '识别中'; stateS.textContent = '端侧转写 · 0.4 s'; }, 500);
      clk.set(function () {
        bubble('已拟好：老张，路上有点堵，我晚半小时到，你们先进山。', 'AI 代理 · 待确认');
        stateT.textContent = '等你说「发」'; stateS.textContent = '说「改」会让它重写';
      }, 1700);
      clk.set(function () {
        bubble('已发送 ✓ 预计到达时间也同步给了车队。', 'AI 代理 · 你说「发」之后');
        stateT.textContent = '完成 · 全程未摘手套';
        stateS.textContent = '共 5.8 秒 · 0 次触屏';
        wake.textContent = '就绪';
        busy = false; mic.disabled = false;
      }, 3300);
    }
    mic.addEventListener('click', run);
    return {
      start: function () {
        if (!REDUCE) clk.every(jitter, 220); else jitter();
      },
      stop: function () {
        clk.clear();
        if (!busy) return;
        busy = false;
        mic.disabled = false;
        script.replaceChildren(idle);
        wake.textContent = '等待唤醒 …';
        stateT.textContent = '点头，或点这里';
        stateS.textContent = '三种手势任一唤醒 · 不用摘手套';
      }
    };
  }

  /* =========================================================
     04 · GUARD
     ========================================================= */
  function initGuard(root) {
    var car = $('#gdCar', root), range = $('#gdRange', root), ttc = $('#gdTTC', root), unitEl = $('#gdUnit', root), distEl = $('#gdDist', root);
    var bar = $('#gdBar', root), msg = $('#gdMsg', root), modeTag = $('#gdMode', root);
    if (!car) return null;
    var clk = clock(), mode = 'brake', d = 60;

    function setMsg(txt, cls, icon) {
      msg.className = 'gd-msg' + (cls ? ' ' + cls : '');
      msg.innerHTML = '<svg class="i" aria-hidden="true"><use href="#' + (icon || 'i-shield') + '"/></svg><span>' + txt + '</span>';
    }
    function render() {
      var pct, txt, unit;
      range.style.opacity = mode === 'brake' ? '1' : '0';
      if (mode !== 'brake') car.classList.remove('brake');
      if (mode === 'tyre') {
        pct = 74; txt = '58'; unit = '℃ · 后胎';
        car.style.opacity = '0'; distEl.style.opacity = '0';
        setMsg('后胎 58 ℃ · 建议靠边降温 10 分钟', 'warn', 'i-alert');
      } else if (mode === 'blind') {
        pct = 68; txt = '1'; unit = '台 · 对向车';
        car.style.opacity = '1'; car.style.left = '72%'; car.classList.add('oncoming'); distEl.style.opacity = '0';
        setMsg('盲弯 · 对向车 60 m 后出现，已减速提示', 'warn', 'i-alert');
      } else {
        car.style.opacity = '1'; car.classList.remove('oncoming');
        d -= 0.75; if (d < 7) d = 60;
        var left = 22 + d * 0.9;
        car.style.left = Math.min(84, left) + '%';
        distEl.textContent = Math.round(d) + ' m';
        distEl.style.left = Math.min(84, left) + '%';
        distEl.style.opacity = '1';
        var rw = Math.max(0, Math.min(70, 22 + d * 0.9 - 26));
        range.style.width = rw + 'px';
        var t = d / 16;
        txt = t.toFixed(1); unit = 'TTC · 秒';
        car.classList.toggle('brake', d < 30);
        pct = Math.max(6, Math.min(100, (1 - (d - 6) / 58) * 100));
        if (d < 22) setMsg('急刹！刹车灯已提前亮，队内已广播', 'bad', 'i-alert');
        else if (d < 38) setMsg('前车制动 · 距离 ' + Math.round(d) + ' m', 'warn', 'i-shield');
        else setMsg('前车稳定 · 距离 ' + Math.round(d) + ' m', '', 'i-shield');
        bar.style.background = d < 22 ? 'var(--bad)' : d < 38 ? 'var(--warn)' : 'var(--ok)';
      }
      ttc.textContent = txt;
      unitEl.textContent = unit;
      bar.style.width = pct + '%';
      if (mode !== 'brake') bar.style.background = 'var(--warn)';
    }

    $$('[data-guard]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-guard]', root).forEach(function (x) { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
        mode = b.dataset.guard;
        modeTag.textContent = mode === 'brake' ? '前向 · 60 GHz + 视觉' : mode === 'blind' ? '弯道 · 对向车推断' : 'TPMS · 胎温预测';
        d = 60; clk.clear();
        render();
        if (!REDUCE && mode === 'brake') clk.every(render, 130);
      });
    });

    return {
      start: function () { d = 60; render(); if (!REDUCE && mode === 'brake') clk.every(render, 130); },
      stop: function () { clk.clear(); car.classList.remove('brake'); }
    };
  }

  /* =========================================================
     05 · REPLAY
     ========================================================= */
  function initRep(root) {
    var tl = $('#repTL', root), cards = $('#repCards', root), bars = $('#repBars', root);
    var modeTag = $('#repMode', root), lapTag = $('#repLap', root);
    if (!tl) return null;
    var MODES = {
      track: {
        mode: '赛道 · 15 分钟', lap: '最佳 1:42.8',
        ev: [[1, '起跑'], [0, ''], [1, '急刹'], [0, ''], [1, '压弯'], [0, ''], [1, '超车'], [0, ''], [1, '压弯'], [0, ''], [1, '急刹'], [0, '']],
        cards: [
          { t: 'T3 出弯', b: '慢 0.4 s', s: '开油晚 8 m，肩部先出弯' },
          { t: 'T7 刹车点', b: '晚 6 m', s: '比最佳圈晚刹，入弯 +4 km/h' },
          { t: 'T9 倾角', b: '42°', s: '右侧余量还有 6°' }
        ],
        bars: [{ l: 'T1–T3', p: 88, v: '−0.42' }, { l: 'T4–T7', p: 66, v: '+0.11' }, { l: 'T8–T10', p: 94, v: '−0.68' }]
      },
      mountain: {
        mode: '跑山 · 46 分钟', lap: '弯道 38 个',
        ev: [[1, '盲弯'], [0, ''], [1, '对向车'], [0, ''], [1, '压弯'], [0, ''], [1, '盲弯'], [0, ''], [1, '落石'], [0, ''], [0, ''], [0, '']],
        cards: [
          { t: '盲弯处理', b: '12 处', s: '入弯前 1.8 s 平均收油' },
          { t: '对向车', b: '3 次', s: '2 次在弯心外侧，风险偏高' },
          { t: '刹车余量', b: '偏紧', s: '3 个弯接近极限，建议降 8%' }
        ],
        bars: [{ l: '盲弯', p: 72, v: '−12' }, { l: '对向', p: 58, v: '3 次' }, { l: '夜路', p: 34, v: '18%' }]
      },
      commute: {
        mode: '通勤 · 32 分钟', lap: '急刹 2 次',
        ev: [[0, ''], [1, '急刹'], [0, ''], [0, ''], [1, '加塞'], [0, ''], [0, ''], [1, '急刹'], [0, ''], [0, ''], [0, ''], [0, '']],
        cards: [
          { t: '急刹', b: '2 次', s: '都在路口，跟车距离不足' },
          { t: '平均速度', b: '32 km/h', s: '比上周慢 4 km/h' },
          { t: '高光片段', b: '已生成', s: '下班日落，可一键分享' }
        ],
        bars: [{ l: '急刹', p: 26, v: '2 次' }, { l: '跟车', p: 44, v: '偏近' }, { l: '夜路', p: 62, v: '56%' }]
      }
    };

    var mode = 'track';
    function apply(name) {
      mode = name;
      var m = MODES[name] || MODES.track;
      modeTag.textContent = m.mode;
      lapTag.textContent = m.lap;
      tl.innerHTML = '<div class="track">' + m.ev.map(function (e, i) {
        return '<div class="clip' + (e[0] ? ' ev' : '') + '" style="--w:' + (e[0] ? 1.6 : 1) + ';--dur:' + (4 + i % 4) + 's;--d:' + (i * .4) + 's">' +
          (e[1] ? '<b>' + e[1] + '</b>' : '') + '<i></i></div>';
      }).join('') + '</div><span class="playhead" aria-hidden="true"></span>';
      cards.innerHTML = m.cards.map(function (c) {
        return '<div class="rep-card"><span class="t">' + c.t + '</span><b>' + c.b + '</b><small>' + c.s + '</small></div>';
      }).join('');
      bars.innerHTML = m.bars.map(function (b, i) {
        return '<div class="rep-bar' + (i === 0 ? ' best' : '') + '"><span>' + b.l + '</span><span class="b"><i style="--p:' + b.p + '%"></i></span><em>' + b.v + '</em></div>';
      }).join('');
    }
    $$('[data-rep]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-rep]', root).forEach(function (x) { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
        apply(b.dataset.rep);
      });
    });
    return { start: function () { apply(mode); }, stop: function () {} };
  }

  /* =========================================================
     06 · VITALS
     ========================================================= */
  function initVit(root) {
    var arc = $('#vitArc', root), score = $('#vitScore', root), diag = $('#vitDiag', root);
    var sos = $('#vitSos', root), sent = $('#vitSent', root);
    if (!arc) return null;
    var clk = clock(), lineClk = clock(), done = false;
    var C = 2 * Math.PI * 42;
    arc.style.strokeDasharray = C;
    arc.style.strokeDashoffset = C;

    function showScore(value) {
      score.textContent = value;
      arc.style.strokeDashoffset = C * (1 - value / 100);
    }
    function finishDiagnosis() {
      diag.classList.add('ready');
      done = true;
    }
    function play() {
      if (done) return;
      var lines = $$('.ln', diag);
      if (REDUCE) {
        showScore(82);
        lines.forEach(function (line) { line.classList.add('in'); });
        finishDiagnosis();
        return;
      }
      showScore(0);
      lines.forEach(function (line) { line.classList.remove('in'); });
      var v = 0;
      clk.every(function () {
        v += 2; if (v >= 82) { v = 82; clk.clear(); }
        showScore(v);
      }, 22);
      clk.set(function () {
        lines.forEach(function (line, i) { lineClk.set(function () { line.classList.add('in'); }, i * 360); });
        lineClk.set(finishDiagnosis, 1150);
      }, 700);
    }
    sos.addEventListener('click', function () {
      sent.textContent = '✓ 模拟救援包已发出 · 匹配 3 家网点';
      sent.classList.add('in');
      var note = $('.vit-foot .note', root);
      if (note) note.style.display = 'none';
      sos.innerHTML = '<svg class="i" aria-hidden="true"><use href="#i-check"/></svg>模拟已发出';
    });
    return { start: play, stop: function () { clk.clear(); lineClk.clear(); } };
  }

  /* =========================================================
     路由
     ========================================================= */
  var ORDER = ['home', 'ai', 'hardware', 'scenes', 's1', 's2', 's3', 's4', 's5', 's6'];
  var TITLES = {
    home: 'ROADLINK · 两轮车的 AI 引擎',
    ai: 'AI 引擎 · ROADLINK',
    hardware: '硬件方案 · ROADLINK',
    scenes: '六个场景 · ROADLINK 提案',
    s1: '01 编队协同 · ROADLINK', s2: '02 弯道视界 · ROADLINK', s3: '03 免手交互 · ROADLINK',
    s4: '04 主动安全 · ROADLINK', s5: '05 骑行记忆 · ROADLINK', s6: '06 车况救援 · ROADLINK',
  };
  var DEMOS = { s1: initConvoy, s2: initHud, s3: initGlove, s4: initGuard, s5: initRep, s6: initVit };
  var demos = {}, io = {}, current = null;
  var hdr = $('#hdr'), menu = $('#menu');
  var compactNav = window.matchMedia('(max-width: 1024px)');

  function keyFromHash() {
    var k = (location.hash || '#/home').replace(/^#\/?/, '').split('?')[0];
    return ORDER.indexOf(k) > -1 ? k : 'home';
  }
  function setNav(k) {
    $$('#nav a').forEach(function (a) {
      var here = a.dataset.k === k;
      var parent = a.dataset.k === 'scenes' && /^s[1-6]$/.test(k);
      a.classList.toggle('on', here || parent);
      if (here || parent) a.setAttribute('aria-current', here ? 'page' : 'location');
      else a.removeAttribute('aria-current');
    });
  }
  function setMenu(open) {
    hdr.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
  }
  function focusHeading(view) {
    var heading = $('h1, h2', view);
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
  function reveal(k, view) {
    if (!('IntersectionObserver' in window)) { $$('[data-io]', view).forEach(function (e) { e.classList.add('in'); }); return; }
    if (!io[k]) {
      io[k] = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io[k].unobserve(en.target); }
        });
      }, { root: view.classList.contains('long') ? view : null, rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }
    $$('[data-io]', view).forEach(function (e) { io[k].observe(e); });
  }
  function show(k) {
    var view = document.getElementById('v-' + k);
    if (!view || current === k) return;
    var navigated = current !== null;
    if (current) {
      var old = document.getElementById('v-' + current);
      if (old) { old.inert = true; old.classList.remove('on'); }
      if (demos[current]) { demos[current].stop(); }
    }
    current = k;
    view.inert = false;
    view.classList.add('on');
    view.scrollTop = 0;
    document.title = TITLES[k] || TITLES.home;
    setNav(k);
    setMenu(false);
    reveal(k, view);
    if (navigated) focusHeading(view);
    if (!demos[k] && DEMOS[k]) demos[k] = DEMOS[k](view);
    if (demos[k]) demos[k].start();
  }

  window.addEventListener('hashchange', function () { show(keyFromHash()); });
  $('.skip-link').addEventListener('click', function (e) {
    e.preventDefault();
    var view = document.getElementById('v-' + current);
    setMenu(false);
    view.scrollTop = 0;
    focusHeading(view);
  });

  /* 键盘 ← → 翻页 */
  document.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    if (hdr.classList.contains('open') || e.target.closest('a, button, input, textarea, select, [contenteditable], [role="region"]')) return;
    var i = ORDER.indexOf(current);
    var next = ORDER[i + (e.key === 'ArrowRight' ? 1 : -1)];
    if (next) { e.preventDefault(); location.hash = '#/' + next; }
  });

  /* 移动端菜单 */
  menu.addEventListener('click', function () {
    var open = !hdr.classList.contains('open');
    setMenu(open);
    if (open) ($('#nav a.on') || $('#nav a')).focus();
  });
  $('#nav').addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (!link || !hdr.classList.contains('open')) return;
    setMenu(false);
    if (link.hash === location.hash) focusHeading(document.getElementById('v-' + current));
  });
  function closeMenuOutside(e) {
    if (hdr.classList.contains('open') && !hdr.contains(e.target)) setMenu(false);
  }
  document.addEventListener('click', closeMenuOutside);
  document.addEventListener('focusin', closeMenuOutside);
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !hdr.classList.contains('open')) return;
    setMenu(false);
    menu.focus();
  });
  compactNav.addEventListener('change', function () { setMenu(false); });

  $$('.view').forEach(function (view) { view.inert = true; });
  show(keyFromHash());
})();
