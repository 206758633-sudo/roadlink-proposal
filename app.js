(function () {
  'use strict';

  var cleanups = [];
  function onCleanup(fn) { cleanups.push(fn); }
  function flushCleanups() {
    while (cleanups.length) {
      try { cleanups.pop()(); } catch (e) {}
    }
  }
  function asset(name) { return 'assets/roadlink-' + name + '.webp'; }

  /* ==================== 动态 CANVAS 可视化引擎 ==================== */

  // 1. 路线地图 / 位置共享 / 轨迹回放 Canvas
  function mountMapCanvas(canvas, mode, active) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var route = [[50, 195], [125, 160], [195, 172], [265, 138], [330, 86], [395, 68], [460, 108], [520, 152], [585, 136], [635, 88], [705, 66], [750, 44]];
    var rafId, start = performance.now();

    function draw(now) {
      if (!canvas.isConnected) return;
      var t = (now - start) / 1000;
      ctx.setTransform(canvas.width / 800, 0, 0, canvas.height / 250, 0, 0);
      ctx.fillStyle = '#07101a';
      ctx.fillRect(0, 0, 800, 250);

      // 科技网格与地形等高线
      ctx.strokeStyle = 'rgba(56, 232, 255, 0.06)';
      ctx.lineWidth = 1;
      for (var x = 40; x < 800; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 250); ctx.stroke(); }
      for (var y = 40; y < 250; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(800, y); ctx.stroke(); }

      // 湖泊与山林色块
      ctx.fillStyle = 'rgba(46, 229, 157, 0.06)';
      ctx.beginPath(); ctx.ellipse(390, 40, 180, 36, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(56, 232, 255, 0.07)';
      ctx.beginPath(); ctx.ellipse(620, 200, 120, 38, -0.1, 0, Math.PI * 2); ctx.fill();

      // 完整底线
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath();
      route.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.strokeStyle = 'rgba(148, 179, 214, 0.25)';
      ctx.lineWidth = 8;
      ctx.stroke();

      // 计算当前轨迹进度
      var prog = 0;
      if (mode === 'pair') {
        prog = active ? Math.min(10.8, 2 + ((t * 1.4) % 8.8)) : 1;
      } else if (mode === 'replay') {
        prog = active ? Math.min(11, (t * 2.6) % 11.5) : 2.5;
      } else if (mode === 'guide') {
        prog = active ? 11 : 4;
      }

      var base = Math.floor(prog), frac = prog - base;
      var p1 = route[base], p2 = route[Math.min(base + 1, route.length - 1)];
      var cur = [p1[0] + (p2[0] - p1[0]) * frac, p1[1] + (p2[1] - p1[1]) * frac];

      // 发光已行驶轨迹
      ctx.beginPath();
      route.slice(0, base + 1).forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.lineTo(cur[0], cur[1]);
      ctx.strokeStyle = 'rgba(56, 232, 255, 0.24)'; ctx.lineWidth = 16; ctx.stroke();
      ctx.strokeStyle = '#38e8ff'; ctx.lineWidth = 5; ctx.stroke();

      // 地标文字
      ctx.font = '700 13px -apple-system, sans-serif';
      ctx.fillStyle = '#9bb0c9';
      ctx.fillText('📍 山脚集合点', 28, 226);
      ctx.fillText('🌲 松林弯道 · 补给站', 345, 42);
      ctx.fillText('🏁 观景台终点 (86km)', 615, 32);

      // 骑手坐标点
      function drawPin(pt, color, label, dy) {
        var r = 14 + 5 * Math.sin(t * 5);
        ctx.beginPath(); ctx.arc(pt[0], pt[1], r, 0, Math.PI * 2);
        ctx.fillStyle = color === '#ffb42e' ? 'rgba(255,180,46,0.25)' : 'rgba(56,232,255,0.25)';
        ctx.fill();
        ctx.beginPath(); ctx.arc(pt[0], pt[1], 8, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.fill();
        ctx.lineWidth = 2.5; ctx.strokeStyle = '#07101a'; ctx.stroke();
        ctx.font = '700 13px -apple-system, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(label, pt[0] + 12, pt[1] + dy);
      }

      drawPin(cur, '#ffb42e', '07 陈默(我)', -10);
      if (mode === 'pair' && active) {
        var mIdx = Math.min(route.length - 1, base + 2);
        drawPin(route[mIdx], '#38e8ff', '18 阿岳', 18);
        var mIdx2 = Math.max(0, base - 1);
        drawPin(route[mIdx2], '#2ee59d', '05 老周', 18);
      }

      // 底部实时遥测条
      ctx.fillStyle = 'rgba(6, 10, 16, 0.82)';
      ctx.fillRect(0, 214, 800, 36);
      ctx.font = '700 13px ui-monospace, monospace';
      ctx.fillStyle = '#38e8ff';
      var km = (prog / 11 * 86).toFixed(1);
      ctx.fillText(
        mode === 'pair'
          ? (active ? '3 位队友正在共享示例位置' : '等待车友接受组队邀请')
          : '● 轨迹进度：' + km + ' / 86.0 km  |  实时车速：' + (active ? Math.round(52 + 12 * Math.sin(t * 2)) : 0) + ' km/h  |  海拔：' + Math.round(320 + prog * 45) + ' m',
        20, 237
      );

      rafId = requestAnimationFrame(draw);
    }
    rafId = requestAnimationFrame(draw);
    onCleanup(function () { cancelAnimationFrame(rafId); });
  }

  function captureVisual() {
    return '<div class="capture-story">' +
      '<figure class="capture-frame">' +
        '<img src="' + asset('ride-capture') + '" alt="前车的后向相机画面，阿岳正在同车道跟骑">' +
        '<figcaption><span>陈默的后向相机</span><span>AI 生成示意</span></figcaption>' +
        '<span class="capture-reticle" aria-hidden="true"></span>' +
        '<div class="capture-camera-state"><span data-capture-frame>取景预览</span><strong data-capture-gap>48 m</strong><small>示例车距</small></div>' +
      '</figure>' +
      '<div class="capture-track" role="img" aria-label="两车同向骑行，陈默在前，阿岳在后">' +
        '<span class="capture-track-direction" aria-hidden="true">同向骑行 →</span>' +
        '<span class="capture-marker capture-follower" aria-hidden="true"><i></i>阿岳</span>' +
        '<span class="capture-marker capture-lead" aria-hidden="true"><i></i>陈默</span>' +
      '</div>' +
    '</div>';
  }

  function captureDetails(armed) {
    return '<ol class="capture-steps" aria-label="抓拍进度">' +
      '<li aria-current="step">' + (armed ? '双方已同意分享' : '出发前确认分享') + '</li>' +
      '<li>队友从后方接近</li>' +
      '<li>抓拍并发送给阿岳</li>' +
    '</ol>' +
    '<div class="capture-receipt" hidden>' +
      '<img src="' + asset('ride-capture-small') + '" alt="阿岳在车队相册收到的抓拍示意图">' +
      '<div><strong>阿岳收到 1 张照片</strong><small>车队相册 · 模拟分享</small></div>' +
    '</div>' +
    '<p class="capture-announce" role="status"></p>';
  }

  function mountCapture(active) {
    if (!active) return;
    var story = document.querySelector('.capture-story');
    var button = document.getElementById('btn-action');
    var steps = document.querySelectorAll('.capture-steps li');
    var readout = story.querySelector('[data-capture-gap]');
    var camera = story.querySelector('[data-capture-frame]');
    var receipt = document.querySelector('.capture-receipt');
    var status = document.querySelector('.capture-announce');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var start = performance.now(), frameId;
    button.setAttribute('aria-disabled','true');
    button.firstElementChild.textContent = '队友正在接近';
    steps[0].removeAttribute('aria-current');
    steps[1].setAttribute('aria-current','step');
    camera.textContent = '阿岳正在接近';

    function draw(now) {
      if (!story.isConnected) return;
      var progress = reduce ? 1 : Math.min(1,(now - start) / 1850);
      story.style.setProperty('--follower', (18 + 29 * progress) + '%');
      story.style.setProperty('--leader', (70 + 4 * progress) + '%');
      story.style.setProperty('--approach', String(progress));
      readout.textContent = Math.round(48 - 24 * progress) + ' m';
      if (progress < 1) {
        frameId = requestAnimationFrame(draw);
        return;
      }
      steps[1].removeAttribute('aria-current');
      steps[2].setAttribute('aria-current','step');
      story.classList.add('has-capture');
      camera.textContent = '已定格';
      receipt.hidden = false;
      status.textContent = '抓拍完成。已模拟分享给阿岳。';
      button.removeAttribute('aria-disabled');
      button.firstElementChild.textContent = '重新演示';
    }

    frameId = requestAnimationFrame(draw);
    onCleanup(function () { cancelAnimationFrame(frameId); });
  }

  // 3. 后视摄像头 / 安全车距预警 60fps 动态公路雷达 Canvas
  function mountRoadRadarCanvas(canvas, mode, active) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var rafId, start = performance.now();

    function loop(now) {
      if (!canvas.isConnected) return;
      var t = (now - start) / 1000;
      var approach = active ? Math.min(1, t / 1.7) : 0;

      ctx.setTransform(canvas.width / 800, 0, 0, canvas.height / 320, 0, 0);
      var sky = ctx.createLinearGradient(0, 0, 0, 125);
      sky.addColorStop(0, '#070e17'); sky.addColorStop(1, '#142336');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, 800, 125);

      // 透视路面
      ctx.fillStyle = '#101822'; ctx.fillRect(0, 125, 800, 195);
      ctx.fillStyle = '#182330';
      ctx.beginPath(); ctx.moveTo(345, 125); ctx.lineTo(455, 125); ctx.lineTo(740, 320); ctx.lineTo(60, 320); ctx.closePath(); ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(345, 125); ctx.lineTo(60, 320); ctx.moveTo(455, 125); ctx.lineTo(740, 320); ctx.stroke();

      // 动态透视车道虚线
      for (var i = 0; i < 6; i++) {
        var z = ((i / 6) + (t * 0.7)) % 1;
        var y1 = 128 + z * z * 190;
        var y2 = Math.min(320, y1 + 12 + z * 24);
        ctx.strokeStyle = 'rgba(255, 180, 46, ' + (0.25 + z * 0.6) + ')';
        ctx.lineWidth = 2 + z * 3;
        ctx.beginPath(); ctx.moveTo(400, y1); ctx.lineTo(400, y2); ctx.stroke();
      }

      // 逼近车辆
      var scale = active ? (0.45 + approach * 1.05) : 0.44;
      var cx = 400, cy = 148 + scale * 72;
      var w = 122 * scale, h = 64 * scale;

      ctx.save(); ctx.translate(cx, cy);
      // AI 识别框
      var isClose = active && approach > 0.45;
      ctx.strokeStyle = isClose ? '#ff4d4f' : '#38e8ff';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-w * 0.6, -h * 0.95, w * 1.2, h * 1.45);

      ctx.fillStyle = '#29384a';
      ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h * 0.72, 10 * scale); ctx.fill();
      ctx.fillStyle = '#18222f';
      ctx.beginPath(); ctx.roundRect(-w * 0.35, -h * 0.84, w * 0.7, h * 0.38, 7 * scale); ctx.fill();

      // 车灯（后视摄像头看后车白色大灯，前车预警看前车红色刹车尾灯）
      ctx.fillStyle = mode === 'rear' ? '#fff7d1' : '#ff2e2e';
      ctx.shadowColor = mode === 'rear' ? '#fff3a8' : '#ff2e2e';
      ctx.shadowBlur = 20;
      ctx.fillRect(-w * 0.42, -h * 0.12, w * 0.2, h * 0.18);
      ctx.fillRect(w * 0.22, -h * 0.12, w * 0.2, h * 0.18);
      ctx.restore();

      var dist = active ? Math.max(6, Math.round(32 - approach * 25)) : 32;
      ctx.fillStyle = 'rgba(6, 10, 16, 0.84)';
      ctx.beginPath(); ctx.roundRect(18, 16, 250, 46, 10); ctx.fill();
      ctx.font = '800 15px ui-monospace, monospace';
      ctx.fillStyle = dist <= 12 ? '#ff6b6b' : '#38e8ff';
      ctx.fillText((mode === 'rear' ? '📷 超广角后视画面 · ' : '📡 前车实时车距 · ') + dist + ' m', 32, 44);

      if (dist <= 12) {
        var alpha = 0.35 + 0.45 * Math.abs(Math.sin(t * 8));
        ctx.fillStyle = 'rgba(255, 64, 64, ' + alpha + ')';
        ctx.fillRect(0, 0, 14, 320); ctx.fillRect(786, 0, 14, 320);

        ctx.fillStyle = 'rgba(255, 64, 64, 0.92)';
        ctx.beginPath(); ctx.roundRect(490, 16, 290, 46, 10); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = '800 15px -apple-system, sans-serif';
        ctx.fillText(mode === 'rear' ? '⚠ 后方车辆高速逼近！勿变道' : '⚠ 跟车过近！请立即减速拉开车距', 508, 44);
      }

      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
    onCleanup(function () { cancelAnimationFrame(rafId); });
  }

  // 4. 疲劳检测波形 Canvas
  function mountFatigueCanvas(canvas, active) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var rafId, start = performance.now();
    function loop(now) {
      if (!canvas.isConnected) return;
      var t = (now - start) / 1000;
      ctx.setTransform(canvas.width / 800, 0, 0, canvas.height / 260, 0, 0);
      ctx.fillStyle = '#08101a'; ctx.fillRect(0, 0, 800, 260);

      // 网格
      ctx.strokeStyle = 'rgba(56,232,255,0.07)';
      for (var x = 0; x < 800; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 260); ctx.stroke(); }

      // 绘制车把微修正与注意力波形
      ctx.beginPath();
      for (var i = 0; i < 800; i += 4) {
        var amp = active ? (38 + 26 * Math.sin(i * 0.03 + t * 3)) : 14;
        var y = 135 + Math.sin(i * 0.04 + t * 5) * amp + (active ? Math.sin(i * 0.15 - t * 8) * 16 : 0);
        i === 0 ? ctx.moveTo(i, y) : ctx.lineTo(i, y);
      }
      ctx.strokeStyle = active ? '#ffb42e' : '#2ee59d';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      ctx.fillStyle = 'rgba(6, 10, 16, 0.86)';
      ctx.beginPath(); ctx.roundRect(20, 16, 340, 50, 10); ctx.fill();
      ctx.font = '800 15px -apple-system, sans-serif';
      ctx.fillStyle = active ? '#ffb42e' : '#2ee59d';
      ctx.fillText(active ? '⚠ 连续骑行 2h 15m · 检出车把微姿态疲劳波动' : '● 骑行专注度良好 · 持续骑行 45 分钟', 36, 46);

      if (active) {
        ctx.fillStyle = 'rgba(255, 180, 46, 0.18)';
        ctx.strokeStyle = '#ffb42e'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(450, 16, 330, 50, 10); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffe299';
        ctx.fillText('☕ 语音提醒：前方 1.5km 服务区请停车休息', 466, 46);
      }
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
    onCleanup(function () { cancelAnimationFrame(rafId); });
  }

  /* ==================== 五大场景 · 20 项核心功能定义 ==================== */
  var SCENES = [
    {
      name: '组队与车友社交',
      heading: '第一次见面，也能一起骑',
      summary: '组队上路，途中看见彼此，骑完还能一起回看。',
      hero: ['convoy', '车队骑行场景示意'],
      features: [
        {
          id: 'team-journey',
          name: '完整组队流程'
        },
        {
          name: '可编程外挂号牌',
          desc: '手机改队号和昵称，同步到车尾墨水号牌',
          action: '点击模拟：把手机设置的队号同步刷新到电子号牌',
          render: function (active) {
            var num = active ? '12' : '07';
            var rider = active ? '阿岳' : '陈默';
            return '<div class="plate-workbench">' +
              '<div class="mini-phone">' +
                '<div class="mini-phone-head"><span>📱 手机 APP 号牌设置</span><span>BLE 5.3</span></div>' +
                '<div class="plate-inputs">' +
                  '<label>编队号码 (01~99)<input type="text" id="inp-plate-num" maxlength="2" value="' + num + '"></label>' +
                  '<label>骑手昵称<input type="text" id="inp-plate-name" maxlength="6" value="' + rider + '"></label>' +
                '</div>' +
                '<div style="font-size:11.5px;color:var(--green)">✓ 支持自定义输入，实时同步右侧号牌</div>' +
              '</div>' +
              '<div class="ble-wave"><div class="ble-line"></div><span>蓝牙写入</span></div>' +
              '<div class="eink-board">' +
                '<div class="eink-paper' + (active ? ' flash' : '') + '" id="eink-paper">' +
                  '<div class="eink-big-num" id="out-plate-num">' + num + '</div>' +
                  '<div class="eink-right"><strong id="out-plate-name">' + rider + '</strong><span>ROADLINK 松林骑队</span></div>' +
                '</div>' +
              '</div>' +
            '</div>';
          },
          mount: function () {
            var iNum = document.getElementById('inp-plate-num');
            var iName = document.getElementById('inp-plate-name');
            var oNum = document.getElementById('out-plate-num');
            var oName = document.getElementById('out-plate-name');
            var paper = document.getElementById('eink-paper');
            function sync() {
              if (oNum) oNum.textContent = iNum.value || '07';
              if (oName) oName.textContent = iName.value || '陈默';
              if (paper) { paper.classList.remove('flash'); void paper.offsetWidth; paper.classList.add('flash'); }
            }
            if (iNum) iNum.addEventListener('input', sync);
            if (iName) iName.addEventListener('input', sync);
          }
        },
        {
          name: 'F1 式骑行总里程排名',
          desc: '按累计总里程像 F1 车手榜一样实时排位',
          action: '点击模拟：结算本次骑行 +42 km，看名次动态反超',
          render: function (active) {
            var list = active
              ? [{ p: 1, n: '18 阿岳', km: 486, me: false }, { p: 2, n: '07 陈默 · 我 (刚结算 +42 km ▲1)', km: 454, me: true }, { p: 3, n: '23 小程', km: 438, me: false }]
              : [{ p: 1, n: '18 阿岳', km: 486, me: false }, { p: 2, n: '23 小程', km: 438, me: false }, { p: 3, n: '07 陈默 · 我', km: 412, me: true }];
            return '<div class="f1-tower">' + list.map(function (r) {
              var pct = Math.round(r.km / 520 * 100);
              return '<div class="f1-card' + (r.me ? ' me' : '') + '">' +
                '<div class="f1-rank">P' + r.p + '</div>' +
                '<div><div style="font-size:15px;font-weight:800">' + r.n + '</div>' +
                '<div class="f1-progress-track"><div class="f1-progress-fill" style="width:' + pct + '%"></div></div></div>' +
                '<div class="f1-val">' + r.km + ' km</div>' +
              '</div>';
            }).join('') + '</div>';
          }
        },
        {
          name: '骑行轨迹回放',
          desc: '沿时间轴动态回看整趟骑行路线、车速与海拔',
          action: '点击模拟：高速回放整趟 86km 山路骑行轨迹',
          render: function () {
            return '<div class="sim-full"><canvas class="sim-canvas" id="s1-replay-canvas" width="800" height="250"></canvas></div>';
          },
          mount: function (active) {
            mountMapCanvas(document.getElementById('s1-replay-canvas'), 'replay', active);
          }
        },
        {
          id: 'capture',
          name: '骑行途中自动抓拍',
          desc: '两车同向骑行，阿岳从后方接近。陈默车上的后向相机自动定格一张，发送给阿岳。',
          action: '播放接近过程',
          bleed: true,
          render: captureVisual,
          mount: mountCapture
        }
      ]
    },

    {
      name: '骑行显示与导航',
      heading: '下一步，抬眼就知道',
      summary: '路线在车把屏，下一步转向在视线里。',
      hero: ['hardware-visor', '头盔内导航场景示意'],
      features: [
        {
          name: '头盔内导航贴片',
          desc: '在头盔视野一侧悬浮显示下一次转向与距离',
          action: '点击模拟：接近路口（300m → 60m 高亮转向提醒）',
          bleed: true,
          render: function (active) {
            var d = active ? 60 : 280;
            return '<div class="visor-full">' +
              '<img src="' + asset('hardware-visor') + '" alt="头盔内导航贴片视角">' +
              '<div class="ar-patch-box' + (d <= 100 ? ' urgent' : '') + '" id="ar-box">' +
                '<div style="font-size:10px;opacity:.8;margin-bottom:6px;display:flex;justify-content:space-between"><span>HELMET AR PATCH</span><span>● 抬眼即见</span></div>' +
                '<div style="display:flex;align-items:center;gap:12px">' +
                  '<span style="font-size:34px;line-height:1">↱</span>' +
                  '<div><div style="font-size:30px;font-weight:900;line-height:1" id="ar-dist">' + d + ' m</div><div style="font-size:13px;font-weight:700;margin-top:3px">前方路口右转 · 盘山道</div></div>' +
                '</div>' +
                '<div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.18);display:flex;align-items:center;gap:8px;font-size:11px">' +
                  '<span>拖动距离：</span><input type="range" id="ar-slider" min="30" max="300" step="10" value="' + d + '" style="flex:1;accent-color:var(--hud)">' +
                '</div>' +
              '</div>' +
            '</div>';
          },
          mount: function () {
            var s = document.getElementById('ar-slider');
            var txt = document.getElementById('ar-dist');
            var box = document.getElementById('ar-box');
            if (s) s.addEventListener('input', function () {
              txt.textContent = s.value + ' m';
              box.classList.toggle('urgent', Number(s.value) <= 100);
            });
          }
        },
        {
          name: 'Glimpse 圆屏二次开发 + 物理按键',
          desc: '基于开源 Glimpse 圆屏，给车把实体键绑定切页动作',
          action: '点击模拟：按压车把物理键 → 圆屏秒切车队与胎压页',
          render: function (active) {
            return '<div class="sim-split">' +
              '<div class="round-dial-wrap">' +
                '<div class="round-cnc"><div class="round-oled-face" id="glimpse-face">' +
                  '<span style="font-size:11px;color:var(--cyan);font-weight:700">' + (active ? '车队位置雷达 · 第 2 页' : 'Glimpse 转向导航 · 第 1 页') + '</span>' +
                  '<b style="font:900 32px/1.15 var(--mono);color:#fff;margin:8px 0">' + (active ? '阿岳 +180m' : '↱ 240 m') + '</b>' +
                  '<small style="font-size:12px;color:var(--soft)">' + (active ? '老周在后方 -90m · 全队在线' : '前方右转进入松林大道') + '</small>' +
                '</div></div>' +
                '<span style="font-size:12px;color:var(--muted)">1.8" Glimpse 开源圆屏二次开发</span>' +
              '</div>' +
              '<div class="hw-key-pod">' +
                '<div style="font-size:12px;color:var(--cyan);font-weight:700;margin-bottom:10px">左手车把自定义物理按键</div>' +
                '<button type="button" class="hw-phys-btn' + (active ? ' pressed' : '') + '" id="phys-key-btn">' +
                  '<span>按一下切页</span><small style="font-size:11px;opacity:.8">戴厚手套可盲按</small>' +
                '</button>' +
                '<div style="margin-top:12px;font-size:12.5px;color:var(--soft)">当前映射：<b>短按 = 循环切换圆屏页面</b></div>' +
              '</div>' +
            '</div>';
          },
          mount: function (active, toggle) {
            var b = document.getElementById('phys-key-btn');
            if (b) b.addEventListener('click', toggle);
          }
        },
        {
          name: 'CarPlay 屏与 HUD 抬头显示协同',
          desc: '看全程全局用 CarPlay 大屏，看眼下下一步用 HUD',
          action: '点击模拟：开启 CarPlay 全局路线 + HUD 抬头转向双屏联动',
          render: function (active) {
            return '<div class="sim-full" style="display:grid;gap:12px">' +
              '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-radius:14px;background:rgba(107,255,184,0.12);border:1.5px solid var(--hud)">' +
                '<div><span style="font-size:11px;color:var(--hud);display:block">上方 HUD 抬头显示（只看下一步，不分散注意力）</span>' +
                '<strong style="font:900 22px var(--mono);color:#fff">' + (active ? '↱ 前方 180m 右转进入观景台匝道' : '等待导航路线同步…') + '</strong></div>' +
                '<span class="state-badge on">' + (active ? 'HUD 已同步' : '待机') + '</span>' +
              '</div>' +
              '<div style="padding:12px;border-radius:16px;background:#0b131e;border:2px solid #263649">' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--soft);margin-bottom:6px"><span>下方车把 CarPlay 屏（承载全局路线、路况与预计到达）</span><b style="color:var(--amber)">剩余 8.4 km · 预计 12 分钟</b></div>' +
                '<canvas class="sim-canvas" id="s2-carplay-canvas" width="800" height="220"></canvas>' +
              '</div>' +
            '</div>';
          },
          mount: function (active) {
            mountMapCanvas(document.getElementById('s2-carplay-canvas'), 'guide', active);
          }
        }
      ]
    },

    {
      name: 'AI 交互与手机操控',
      heading: '手留在车把，手机交给语音',
      summary: '用实体键发起指令，听摘要，确认后再发送消息。',
      hero: ['voice', '骑手佩戴头盔和手套的场景示意'],
      features: [
        {
          name: '戴手套用小设备 + AI 操控手机',
          desc: '按一下车把小设备唤醒 AI，语音指令直接交给手机执行',
          action: '点击模拟：戴手套短按唤醒 AI → 说“切到下一首歌”',
          render: function (active) {
            var bars = Array(16).fill('<i></i>').join('');
            return '<div class="sim-split">' +
              '<div class="hw-key-pod">' +
                '<span style="font-size:12px;color:var(--cyan);font-weight:700">车把蓝牙小设备（戴手套一摸即按）</span>' +
                '<div class="eq-bars" style="margin:16px 0">' + bars + '</div>' +
                '<strong style="font-size:16px;color:var(--amber);display:block">' + (active ? '🎙 “帮我切到下一首歌，音量调大”' : '短按实体键 → 唤醒 AI 语音助手') + '</strong>' +
              '</div>' +
              '<div class="wx-visual-panel">' +
                '<div class="wx-panel-head"><span>📱 口袋里的手机执行结果</span><span style="color:var(--green)">● AI 已接管</span></div>' +
                '<div style="padding:24px 18px;text-align:center">' +
                  '<div style="font-size:12px;color:var(--muted)">车载音乐 / 导航控制</div>' +
                  '<strong style="font-size:22px;color:#fff;display:block;margin:10px 0">' + (active ? '🎵 已切换：公路之歌 (音量 80%)' : '🎵 当前播放：夜航星 (音量 60%)') + '</strong>' +
                  '<span class="state-badge on">' + (active ? '✓ 全程未摘手套 · 未掏手机' : '等待车把按键指令') + '</span>' +
                '</div>' +
              '</div>' +
            '</div>';
          }
        },
        {
          name: 'AI 总结微信群消息',
          desc: '从几十条嘈杂群聊里提炼出集合时间、地点与注意事项',
          action: '点击模拟：AI 一秒扫描 6 条群聊 → 提炼 3 条核心卡片并播报',
          render: function (active) {
            return '<div class="sim-split">' +
              '<div class="wx-visual-panel">' +
                '<div class="wx-panel-head"><span>💬 松林车友微信群 (28人)</span><span>6 条新消息</span></div>' +
                '<div class="wx-panel-body">' +
                  '<div class="wx-msg-pill"><b>阿岳:</b>今天天气太爽了哈哈，大家 09:10 集合啊！</div>' +
                  '<div class="wx-msg-pill"><b>老周:</b>[表情包] 我刚洗完车，昨晚激动得没睡着😂</div>' +
                  '<div class="wx-msg-pill"><b>小程:</b>@所有人 原路口修路，改在「山脚中石化加油站」碰面！</div>' +
                  '<div class="wx-msg-pill"><b>阿岳:</b>收到！大家记住进山前先加满油，山上没油站。</div>' +
                '</div>' +
              '</div>' +
              '<div class="wx-visual-panel" style="border-color:' + (active ? 'var(--cyan)' : 'var(--line)') + '">' +
                '<div class="wx-panel-head"><span>🤖 ROADLINK AI 语音提炼重点</span><span style="color:var(--cyan)">' + (active ? '🔊 耳机播报中' : '待提炼') + '</span></div>' +
                '<div class="wx-panel-body">' +
                  '<div class="ai-key-card"><div class="ai-key-icon">🕘</div><div><small style="color:var(--cyan);font-weight:700">集合时间</small><strong style="display:block;font-size:15px">今天上午 09:10 准时出发</strong></div></div>' +
                  '<div class="ai-key-card"><div class="ai-key-icon">📍</div><div><small style="color:var(--cyan);font-weight:700">集合地点（有变更）</small><strong style="display:block;font-size:15px">山脚中石化加油站</strong></div></div>' +
                  '<div class="ai-key-card"><div class="ai-key-icon">⛽</div><div><small style="color:var(--cyan);font-weight:700">出发前必做</small><strong style="display:block;font-size:15px">进山前务必先加满油（已过滤闲聊）</strong></div></div>' +
                '</div>' +
              '</div>' +
            '</div>';
          }
        },
        {
          name: 'AI 拟稿并代发微信',
          desc: '骑手说一句大白话，AI 润色成通顺消息，确认后代发',
          action: '点击模拟：口述“我晚到十分钟” → AI 拟稿并确认发到微信群',
          render: function (active) {
            return '<div class="sim-full" style="max-width:740px">' +
              '<div class="wx-visual-panel">' +
                '<div class="wx-panel-head"><span>✍ AI 微信拟稿与代发助手</span><span style="color:var(--green)">' + (active ? '✓ 已确认发送至车友群' : '步骤 1：识别骑手语音意图') + '</span></div>' +
                '<div class="wx-panel-body" style="gap:12px;padding:18px">' +
                  '<div class="wx-msg-pill" style="font-size:14px"><b>🎙 骑手口述指令：</b>“告诉群里路上有点堵，我会晚到十分钟。”</div>' +
                  '<div class="ai-key-card" style="border-color:' + (active ? 'var(--green)' : 'var(--amber)') + ';background:' + (active ? 'var(--green-soft)' : 'var(--amber-soft)') + '">' +
                    '<div class="ai-key-icon" style="background:rgba(0,0,0,0.2);color:#fff">' + (active ? '✓' : '🤖') + '</div>' +
                    '<div><small style="color:' + (active ? 'var(--green)' : 'var(--amber)') + ';font-weight:800">' + (active ? '已代发至「松林车友群」' : 'AI 拟稿完成 · 等待骑手短按确认') + '</small>' +
                    '<strong style="display:block;font-size:15.5px;margin-top:2px">“兄弟们，路上稍微有点堵，我大约晚到 10 分钟，你们先在山脚加油站等我！”</strong></div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>';
          }
        }
      ]
    },

    {
      name: '安全与主动预警',
      heading: '看见风险，及时提醒',
      summary: '从后方接近到疑似摔车，把需要注意的情况及时提示给骑手。',
      hero: ['guard', '主动预警场景示意'],
      features: [
        {
          name: '头盔后部减速刹车灯',
          desc: '检测到减速时头盔后部红灯自动高亮爆闪，后车更容易看到',
          action: '点击模拟：紧急减速（65 → 18 km/h），触发头盔高位红灯爆闪',
          bleed: true,
          render: function (active) {
            return '<div class="visor-full">' +
              '<img src="' + asset('helmet') + '" alt="头盔后部减速刹车灯" style="filter:' + (active ? 'brightness(1.05)' : 'brightness(0.65) grayscale(0.5)') + ';transition:filter .3s">' +
              (active ? '<div style="position:absolute;left:50%;top:52%;transform:translate(-50%,-50%);width:220px;height:90px;border-radius:50%;background:radial-gradient(circle,#ff1a1a 0%,rgba(255,25,25,0.55) 50%,transparent 75%);box-shadow:0 0 60px #ff1a1a;animation:led-pulse .35s infinite alternate"></div>' : '') +
              '<div style="position:absolute;left:24px;bottom:20px;right:24px;padding:12px 18px;border-radius:14px;background:rgba(6,10,16,0.86);backdrop-filter:blur(10px);border:1px solid var(--line-strong);display:flex;justify-content:space-between;align-items:center">' +
                '<div><strong style="font-size:16px;color:' + (active ? '#ff6b6b' : '#fff') + '">' + (active ? '🚨 惯导检测到 -0.65G 减速 · 头盔高位红灯爆闪中！' : '头盔后部惯导刹车灯 · 匀速待命') + '</strong>' +
                '<div style="font-size:12px;color:var(--soft)">无需接原车线路，内置加速度传感器一减速就亮</div></div>' +
                '<b style="font:900 22px var(--mono);color:' + (active ? '#ff6b6b' : 'var(--cyan)') + '">' + (active ? '65 → 18 km/h' : '65 km/h') + '</b>' +
              '</div>' +
            '</div>';
          }
        },
        {
          name: '后视摄像头（盲区监测）',
          desc: '在前方屏幕实时看到身后车道来车与盲区距离预警',
          action: '点击模拟：后方车辆高速逼近至 6 米，触发红框盲区警报',
          render: function () {
            return '<div class="sim-full"><canvas class="sim-canvas" id="s4-rear-canvas" width="800" height="320"></canvas></div>';
          },
          mount: function (active) {
            mountRoadRadarCanvas(document.getElementById('s4-rear-canvas'), 'rear', active);
          }
        },
        {
          name: '摔车监测与自动发送求救',
          desc: '疑似摔车且倒计时无人取消时，自动把精准定位发给紧急联系人',
          action: '点击模拟：检测到 84° 疑似摔车 → 启动 10 秒自动 SOS 求救',
          render: function (active) {
            return '<div class="sos-visual' + (active ? ' alert' : '') + '">' +
              '<div class="sos-dial">' +
                '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="9"/>' +
                '<circle id="sos-ring-bar" cx="60" cy="60" r="52" fill="none" stroke="' + (active ? '#ff4d4f' : '#2ee59d') + '" stroke-width="9" stroke-dasharray="326.7" stroke-dashoffset="0" stroke-linecap="round"/></svg>' +
                '<strong id="sos-timer-txt" style="color:' + (active ? '#ff6b6b' : 'var(--green)') + '">' + (active ? '10s' : '正常') + '</strong>' +
              '</div>' +
              '<div>' +
                '<div style="font-size:12.5px;font-weight:800;color:' + (active ? '#ff8a8a' : 'var(--green)') + '">' + (active ? '🚨 陀螺仪检测到车身倾角 84° · 疑似摔车静止' : '● 六轴陀螺仪实时监测中 · 当前倾角 12° 正常') + '</div>' +
                '<h3 style="margin:6px 0 8px;font-size:20px">' + (active ? '倒计时结束将自动向家人和队友发送定位求救！' : '正常压弯不误报，异常倒地自动触发救援确认') + '</h3>' +
                '<div style="padding:12px;border-radius:12px;background:rgba(0,0,0,0.35);border:1px solid var(--line);font-size:13px;color:var(--soft)" id="sos-msg-box">' +
                  (active
                    ? '📍 <b>SOS 求救包已就绪：</b>陈默于松林山道 K3.2（30.248°N, 120.112°E）疑似摔车未响应，点击直接导航救援！'
                    : '提示：如果只是原地倒车，骑手可在 10 秒内按键取消，不会惊动家人。') +
                '</div>' +
              '</div>' +
            '</div>';
          },
          mount: function (active) {
            if (!active) return;
            var left = 10;
            var txt = document.getElementById('sos-timer-txt');
            var ring = document.getElementById('sos-ring-bar');
            var box = document.getElementById('sos-msg-box');
            var timer = setInterval(function () {
              left--;
              if (left > 0) {
                if (txt) txt.textContent = left + 's';
                if (ring) ring.setAttribute('stroke-dashoffset', String(((10 - left) / 10) * 326.7));
              } else {
                clearInterval(timer);
                if (txt) txt.textContent = '已发';
                if (box) box.innerHTML = '✅ <b style="color:var(--green)">SOS 已自动发送给【妻子、队长老周】：</b>含精准 GPS 经纬度、最后车速与一键救援导航链接！';
              }
            }, 850);
            onCleanup(function () { clearInterval(timer); });
          }
        },
        {
          name: '疲劳检测与提醒',
          desc: '持续识别骑行时长与操控波动，发现疲劳迹象及时提醒休息',
          action: '点击模拟：连续骑行 2 小时检出疲劳波动 → 弹出服务区休息提醒',
          render: function () {
            return '<div class="sim-full"><canvas class="sim-canvas" id="s4-fatigue-canvas" width="800" height="260"></canvas></div>';
          },
          mount: function (active) {
            mountFatigueCanvas(document.getElementById('s4-fatigue-canvas'), active);
          }
        },
        {
          name: '安全车距预警',
          desc: '实时监测与前车距离，跟车太近或前车急刹时提醒拉开空间',
          action: '点击模拟：前车急刹距离缩至 6 米 → 触发防追尾红色预警',
          render: function () {
            return '<div class="sim-full"><canvas class="sim-canvas" id="s4-fwd-canvas" width="800" height="320"></canvas></div>';
          },
          mount: function (active) {
            mountRoadRadarCanvas(document.getElementById('s4-fwd-canvas'), 'front', active);
          }
        }
      ]
    },

    {
      name: '骑行社区',
      heading: '骑完一程，故事还能继续',
      summary: '交流骑行经验，分享路线和自己的骑行记录。',
      hero: ['riderclub', '车友社区场景示意'],
      features: [
        {
          name: '大冰数字人在线问答',
          desc: '新手有骑行疑问？大冰数字人随时在线提供老司机级解答',
          action: '点击模拟：向大冰数字人提问并切换查看新手解答',
          render: function (active) {
            var q = active ? '雨天跑山视线差、路面滑，怎么骑才安全？' : '第一次跟车队跑山，出发前要问清哪些事？';
            var a = active
              ? '记住三点：① 头盔贴上防雾片，用咱们车把实体键盲操别掏手机；② 过弯别压白线和井盖，倾角留足余量；③ 把头盔后部减速灯打开，让后方汽车老远就能看见你！'
              : '第一次跟队问清三件事就行：① 几点在哪集合、进山前在哪加油；② 路线有没有非铺装烂路；③ 万一掉队了在哪个观景台等。用 ROADLINK 组队后队友位置都在屏上，放心骑！';
            return '<div class="sim-full" style="max-width:780px">' +
              '<div class="wx-visual-panel">' +
                '<div class="wx-panel-head"><span>🤖 大冰数字人 · 社区在线导师</span><span style="color:var(--green)">● 实时语音+文字解答</span></div>' +
                '<div class="wx-panel-body" style="padding:18px;gap:14px">' +
                  '<div class="wx-msg-pill" style="font-size:14.5px"><b>🙋‍♂️ 新手摩友提问：</b>' + q + '</div>' +
                  '<div class="ai-key-card" style="align-items:flex-start">' +
                    '<div class="ai-key-icon" style="width:46px;height:46px;font-size:20px;font-weight:900">冰</div>' +
                    '<div><small style="color:var(--cyan);font-weight:800">大冰数字人 · 语音回复中 🔊</small>' +
                    '<p style="margin:6px 0 0;font-size:14.5px;color:#fff;line-height:1.55">' + a + '</p></div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>';
          }
        },
        {
          name: '骑行路线攻略分享',
          desc: '把路线轨迹、路面难度、加油补给点和观景台装进一张攻略卡',
          action: '点击模拟：打开车友分享的「周末山路环线」并一键导入导航',
          render: function (active) {
            return '<div class="sim-full" style="display:grid;gap:10px">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid var(--line)">' +
                '<div><strong style="font-size:16px;color:var(--amber)">🗺 周末松林山路环线 · 86 km（新手友好 ★★☆）</strong>' +
                '<span style="font-size:12.5px;color:var(--soft);margin-left:12px">全程铺装柏油路 · 途经 2 处加油站 · 1 处山顶咖啡观景台</span></div>' +
                '<span class="state-badge on">' + (active ? '✓ 已导入车把导航' : '2,480 人已跑过') + '</span>' +
              '</div>' +
              '<canvas class="sim-canvas" id="s5-guide-canvas" width="800" height="230"></canvas>' +
            '</div>';
          },
          mount: function (active) {
            mountMapCanvas(document.getElementById('s5-guide-canvas'), 'guide', active);
          }
        },
        {
          name: '个人骑行数据总结',
          desc: '把每周骑行次数、总里程、最大倾角汇总成个人战报海报',
          action: '点击模拟：生成本周个人骑行高光数据战报',
          render: function (active) {
            var bars = active ? [35, 0, 52, 24, 0, 96, 78] : [18, 0, 28, 12, 0, 45, 36];
            var days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
            return '<div class="sim-full" style="max-width:780px;padding:22px;border-radius:18px;background:linear-gradient(145deg,#132030,#091018);border:1.5px solid rgba(255,180,46,0.45)">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +
                '<div><span style="font:800 11px var(--mono);color:var(--amber)">ROADLINK WEEKLY RIDER REPORT</span><h3 style="margin:2px 0 0;font-size:20px">陈默的个人骑行数据周报</h3></div>' +
                '<span class="state-badge on">' + (active ? '🏆 本周击败 88% 同城摩友' : '累计数据统计中') + '</span>' +
              '</div>' +
              '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px">' +
                '<div style="padding:12px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid var(--line)"><b style="font:900 26px var(--mono);color:var(--amber);display:block">' + (active ? '128 km' : '42 km') + '</b><span style="font-size:11.5px;color:var(--muted)">本周总里程</span></div>' +
                '<div style="padding:12px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid var(--line)"><b style="font:900 26px var(--mono);color:var(--cyan);display:block">' + (active ? '3 次' : '1 次') + '</b><span style="font-size:11.5px;color:var(--muted)">本周出车次数</span></div>' +
                '<div style="padding:12px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid var(--line)"><b style="font:900 26px var(--mono);color:var(--green);display:block">' + (active ? '35°' : '26°') + '</b><span style="font-size:11.5px;color:var(--muted)">最大压弯倾角</span></div>' +
                '<div style="padding:12px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid var(--line)"><b style="font:900 26px var(--mono);color:#fff;display:block">' + (active ? '1,240m' : '410m') + '</b><span style="font-size:11.5px;color:var(--muted)">累计海拔爬升</span></div>' +
              '</div>' +
              '<div style="display:flex;align-items:flex-end;gap:12px;height:105px;padding:12px 16px 0;border-radius:12px;background:rgba(0,0,0,0.3)">' +
                days.map(function (d, i) {
                  return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end">' +
                    '<div style="width:100%;max-width:36px;height:' + bars[i] + 'px;border-radius:6px 6px 2px 2px;background:' + (i >= 5 ? 'linear-gradient(180deg,var(--amber),#e06d06)' : 'linear-gradient(180deg,var(--cyan),#2563eb)') + ';transition:height .5s"></div>' +
                    '<span style="font-size:11px;color:var(--soft)">' + d + '</span></div>';
                }).join('') +
              '</div>' +
            '</div>';
          }
        },
        {
          name: '机车 AI 改装娱乐社区',
          desc: '上传爱车照片一键生成 AI 涂装构思，左右拖动滑块实时对比',
          action: '点击模拟：切换 AI 改装涂装风格并保存为社区改装帖',
          render: function (active) {
            return '<div class="sim-full" style="max-width:760px">' +
              '<div class="style-chips" id="mod-style-chips">' +
                '<button type="button" class="style-chip' + (!active ? ' active' : '') + '" data-filter="sepia(.25) hue-rotate(155deg) saturate(1.65)">❄️ 冰川赛博蓝</button>' +
                '<button type="button" class="style-chip' + (active ? ' active' : '') + '" data-filter="hue-rotate(315deg) saturate(1.85) contrast(1.1)">🔥 赛道赤焰红</button>' +
                '<button type="button" class="style-chip" data-filter="grayscale(.88) contrast(1.3) brightness(.82)">🖤 磨砂黑武士</button>' +
                '<button type="button" class="style-chip" data-filter="sepia(.6) hue-rotate(10deg) saturate(1.9)">⚡ 暗夜流光金</button>' +
              '</div>' +
              '<div class="compare-stage">' +
                '<img src="' + asset('rescue') + '" alt="原车外观示意">' +
                '<div class="compare-clip" id="mod-clip">' +
                  '<img src="' + asset('rescue') + '" id="mod-after-img" style="filter:' + (active ? 'hue-rotate(315deg) saturate(1.85) contrast(1.1)' : 'sepia(.25) hue-rotate(155deg) saturate(1.65)') + '" alt="AI改装预览">' +
                '</div>' +
                '<span style="position:absolute;left:12px;top:12px;padding:4px 10px;border-radius:6px;background:rgba(0,0,0,0.75);font-size:12px">👈 原车外观</span>' +
                '<span style="position:absolute;right:12px;top:12px;padding:4px 10px;border-radius:6px;background:rgba(0,0,0,0.75);font-size:12px;color:var(--amber)" id="mod-badge-txt">👉 AI 改装预览（左右拖动滑块对比）</span>' +
                '<div class="compare-line" id="mod-line"><div class="compare-knob">⇄</div></div>' +
                '<input type="range" class="compare-input" id="mod-range" min="5" max="95" value="50" aria-label="左右拖动对比原车与AI改装效果">' +
              '</div>' +
            '</div>';
          },
          mount: function () {
            var r = document.getElementById('mod-range');
            var clip = document.getElementById('mod-clip');
            var line = document.getElementById('mod-line');
            var img = document.getElementById('mod-after-img');
            var txt = document.getElementById('mod-badge-txt');
            if (r) r.addEventListener('input', function () {
              clip.style.clipPath = 'inset(0 0 0 ' + r.value + '%)';
              line.style.left = r.value + '%';
            });
            Array.from(document.querySelectorAll('#mod-style-chips .style-chip')).forEach(function (btn) {
              btn.addEventListener('click', function () {
                Array.from(document.querySelectorAll('#mod-style-chips .style-chip')).forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                if (img) img.style.filter = btn.dataset.filter;
                if (txt) txt.textContent = '👉 AI 改装：' + btn.textContent;
              });
            });
          }
        }
      ]
    }
  ];

  /* ==================== 页面渲染与交互控制器 ==================== */
  var root = document.getElementById('main-content');
  var navLinks = Array.from(document.querySelectorAll('#scene-nav a'));
  var autoBtn = document.getElementById('btn-auto-scene');
  var teamPlayback = null;
  var state = { sceneIdx: 0, featIdx: 0, active: false, captureArmed: false, timer: null };

  function stopAuto() {
    if (state.timer) {
      clearInterval(state.timer);
      state.timer = null;
      if (teamPlayback) { teamPlayback.stop(); state.active = false; }
    }
    if (autoBtn) { autoBtn.classList.remove('active'); autoBtn.textContent = '自动轮播'; autoBtn.setAttribute('aria-pressed','false'); }
  }

  function startAuto() {
    stopAuto();
    autoBtn.classList.add('active');
    autoBtn.textContent = '停止轮播';
    autoBtn.setAttribute('aria-pressed','true');
    state.timer = setInterval(function () {
      var sc = SCENES[state.sceneIdx];
      if (teamPlayback && teamPlayback.isPlaying()) return;
      if (!state.active) {
        state.active = true;
        if (teamPlayback) teamPlayback.play();
        else render();
      } else {
        state.active = false;
        state.featIdx = (state.featIdx + 1) % sc.features.length;
        state.captureArmed = false;
        render();
      }
    }, 3200);
    if (teamPlayback) { state.active = true; teamPlayback.play(); }
  }

  function toggleActive() {
    var button = document.getElementById('btn-action');
    if (!button || button.getAttribute('aria-disabled') === 'true') return;
    stopAuto();
    var restoreFocus = document.activeElement === button;
    var capture = SCENES[state.sceneIdx].features[state.featIdx].id === 'capture';
    if (capture && !state.captureArmed && !state.active) {
      state.captureArmed = true;
    } else {
      state.active = !state.active;
      if (capture && !state.active) state.captureArmed = false;
    }
    render();
    if (restoreFocus) document.getElementById('btn-action').focus({preventScroll:true});
  }

  function selectFeature(index, focus) {
    stopAuto();
    state.featIdx = index;
    state.active = false;
    state.captureArmed = false;
    render();
    if (focus) root.querySelector('.feat-tab[aria-pressed="true"]').focus({preventScroll:true});
  }

  function render() {
    flushCleanups();
    teamPlayback = null;
    var sc = SCENES[state.sceneIdx];
    var feat = sc.features[state.featIdx];
    var capture = feat.id === 'capture';
    var team = feat.id === 'team-journey';
    var armed = state.captureArmed || state.active;
    var action = state.active ? '重新体验' : (feat.action || '').replace(/^点击模拟[：:]\s*/, '');
    if (capture && !armed) action = '模拟双方同意';

    document.title = sc.name + ' · ROADLINK';
    navLinks.forEach(function (a, i) {
      if (i === state.sceneIdx) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    root.innerHTML =
      '<section class="scene-hero" aria-labelledby="scene-title">' +
        '<picture class="scene-background"><source media="(max-width:680px)" srcset="' + asset(sc.hero[0] + '-small') + '">' +
          '<img src="' + asset(sc.hero[0]) + '" alt="' + sc.hero[1] + '"></picture>' +
        '<div class="scene-intro"><p class="scene-eyebrow">' + sc.name + '</p>' +
          '<h1 id="scene-title">' + sc.heading + '</h1><p class="scene-summary">' + sc.summary + '</p></div>' +
      '</section>' +
      '<section class="stage-grid" aria-label="场景互动演示">' +
        '<div class="feat-sidebar" role="group" aria-label="选择功能">' +
          sc.features.map(function (f, i) {
            var isCur = i === state.featIdx;
            return '<button type="button" class="feat-tab" data-idx="' + i + '" aria-pressed="' + isCur + '">' + f.name + '</button>';
          }).join('') +
        '</div>' +
        (team ? '<article class="team-walkthrough" aria-labelledby="team-title"></article>' :
        '<article class="visual-card' + (capture ? ' capture-card' : '') + '" aria-labelledby="feature-title">' +
          '<div class="visual-viewport' + (feat.bleed ? ' bleed' : '') + '">' + feat.render(state.active) + '</div>' +
          '<div class="visual-notes"><span class="visual-mode">交互模拟 · 示例数据</span>' +
            '<h2 id="feature-title" tabindex="-1">' + feat.name + '</h2>' +
            '<p class="visual-description">' + feat.desc + '</p>' +
            (capture ? captureDetails(armed) : '') +
            '<button type="button" class="action-btn" id="btn-action"><span>' + action + '</span></button>' +
          '</div>' +
        '</article>') +
      '</section>';

    Array.from(root.querySelectorAll('.feat-tab')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (Number(btn.dataset.idx) !== state.featIdx) selectFeature(Number(btn.dataset.idx),true);
      });
    });
    if (team) {
      teamPlayback = window.mountRoadlinkTeam(root.querySelector('.team-walkthrough'), stopAuto);
      onCleanup(teamPlayback.stop);
    } else {
      document.getElementById('btn-action').addEventListener('click', toggleActive);
      if (feat.mount) feat.mount(state.active, toggleActive);
    }
  }

  function onRoute() {
    var m = location.hash.match(/^#\/s([1-5])$/);
    var idx = m ? Number(m[1]) - 1 : 0;
    if (!m) history.replaceState(null, '', '#/s1');
    stopAuto();
    state.sceneIdx = idx;
    var view = new URLSearchParams(location.search).get('view');
    var capture = idx === 0 && view === 'capture';
    state.featIdx = capture ? SCENES[idx].features.findIndex(function (feat) { return feat.id === 'capture'; }) : 0;
    state.active = false;
    state.captureArmed = false;
    render();
    if (capture || (idx === 0 && view === 'demo')) {
      root.querySelector('.stage-grid').scrollIntoView();
    } else {
      window.scrollTo(0,0);
    }
  }

  window.addEventListener('hashchange', onRoute);

  if (autoBtn) {
    autoBtn.addEventListener('click', function () {
      if (state.timer) stopAuto();
      else startAuto();
    });
  }

  var fsBtn = document.getElementById('btn-fullscreen');
  if (fsBtn) {
    fsBtn.addEventListener('click', function () {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen && document.exitFullscreen();
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
    if (e.target && e.target.closest('input, textarea, select, button, a, [contenteditable]')) return;
    var sc = SCENES[state.sceneIdx];
    if (e.code === 'Space' && !teamPlayback) {
      e.preventDefault();
      toggleActive();
    } else if (e.code === 'ArrowRight' && state.sceneIdx < SCENES.length - 1) {
      location.hash = '#/s' + (state.sceneIdx + 2);
    } else if (e.code === 'ArrowLeft' && state.sceneIdx > 0) {
      location.hash = '#/s' + state.sceneIdx;
    } else if (e.code === 'ArrowDown' || e.code === 'ArrowUp') {
      e.preventDefault();
      var direction = e.code === 'ArrowDown' ? 1 : -1;
      selectFeature((state.featIdx + direction + sc.features.length) % sc.features.length,false);
    }
  });

  onRoute();
})();
