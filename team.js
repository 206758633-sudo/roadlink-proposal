(function () {
  'use strict';

  var destinations = [
    { name: '松林观景台', meters: 8400, route: [[44, 152], [100, 129], [160, 135], [210, 102], [253, 116], [290, 76], [348, 63], [395, 34]] },
    { name: '山脚补给站', meters: 4200, route: [[44, 152], [105, 147], [138, 95], [193, 101], [227, 67], [280, 89], [334, 73], [395, 108]] }
  ];

  var stages = [
    { label: '见面组队', title: '邀请附近车友', copy: '在手机 App 里发邀请。阿岳接受后，车队成员表才出现他的名字。' },
    { label: '设目的地', title: '把同一条路线发给全队', copy: '在手机里选目的地并生成路线，所有成员都能看到车队要去哪里。' },
    { label: '共享位置', title: '地图显示两位骑手', copy: '开启共享后，地图出现阿岳的标记。模拟向前骑行，看两位骑手沿路线移动。' },
    { label: '同步圆屏', title: '把下一次转向发到车把', copy: '点手机里的「模拟蓝牙同步」。圆屏会显示与手机一致的转向、距离和队友方位。' },
    { label: '下发号牌', title: '在车外挂上自己的队号', copy: '填写号码和姓名后下发。队徽可以单独发送，右边的电子墨水牌会显示收到的内容。' },
    { label: '结算里程', title: '骑完看累计排名', copy: '模拟抵达后，本次路线的里程计入车队榜。已经结算的里程只记一次。' }
  ];

  var initial = { stage: 0, completed: 0, destination: 0, progress: 0, invited: false, number: '07', rider: '陈默', plateWritten: false, hasLogo: false };
  var riderMileage = 412000;
  var teammateMileage = 416000;
  var teammateLead = 260;
  var simulationStep = 1400;

  destinations.forEach(function (destination) {
    var pixels = 0;
    var offsets = destination.route.map(function (vertex, i, points) {
      if (i) pixels += Math.hypot(vertex[0] - points[i - 1][0], vertex[1] - points[i - 1][1]);
      return pixels;
    });
    destination.offsets = offsets.map(function (offset) { return Math.round(offset / pixels * destination.meters); });
  });

  function km(meters) {
    return (meters / 1000).toLocaleString('en-US', { maximumFractionDigits: 1, useGrouping: false });
  }

  function formatDistance(meters) {
    return meters >= 1000 ? km(meters) + ' km' : Math.max(1, Math.round(meters)) + ' m';
  }

  function nextVertex(destination, progress) {
    return destination.offsets.findIndex(function (offset) { return offset > progress; });
  }

  function positionAt(destination, progress) {
    var next = nextVertex(destination, progress);
    var route = destination.route;
    if (next === -1) return route[route.length - 1];
    var start = route[next - 1], end = route[next];
    var interval = destination.offsets[next] - destination.offsets[next - 1];
    var portion = (progress - destination.offsets[next - 1]) / interval;
    return [start[0] + (end[0] - start[0]) * portion, start[1] + (end[1] - start[1]) * portion];
  }

  function guidance(destination, progress) {
    var next = nextVertex(destination, progress);
    if (next === -1) return { label: '已到达终点', distance: '', dir: 'done' };
    var distance = formatDistance(destination.offsets[next] - progress);
    if (next === destination.route.length - 1) return { label: '直行抵达', distance: distance, dir: 'up' };
    var before = destination.route[next - 1], turn = destination.route[next], after = destination.route[next + 1];
    var cross = (turn[0] - before[0]) * (after[1] - turn[1]) - (turn[1] - before[1]) * (after[0] - turn[0]);
    return { label: cross > 0 ? '前方右转' : '前方左转', distance: distance, dir: cross > 0 ? 'right' : 'left' };
  }

  function turnArrowSvg(dir) {
    if (dir === 'right') {
      return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19v-7a3 3 0 0 1 3-3h7"/><path d="M15 5l4 4-4 4"/></svg>';
    }
    if (dir === 'left') {
      return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 19v-7a3 3 0 0 0-3-3H5"/><path d="M9 5L5 9l4 4"/></svg>';
    }
    if (dir === 'done') {
      return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2ee59d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
    }
    return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M7 10l5-5 5 5"/></svg>';
  }

  function escapeText(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function draw(canvas, state, from) {
    var context = canvas.getContext('2d');
    if (!context) return;
    var destination = destinations[state.destination];
    var route = destination.route;
    var progress = state.progress;
    var sharing = state.completed >= 3;
    var landscape = new Path2D('M0 0H430V45L390 62L330 37L264 41L212 22L177 40L120 28L68 45L30 30L0 51Z M0 174L40 158L86 184L139 161L195 176L242 153L286 180L335 153L430 165V260H0Z');
    var lake = new Path2D('M263 220Q286 191 315 199T363 191Q394 180 410 196Q425 213 401 226T355 238Q323 239 305 250T274 248Q248 239 263 220Z');
    var streets = [
      'M-10 115Q58 91 113 67T213 70Q274 72 319 33T448 25',
      'M-6 181Q57 162 102 125T189 96Q247 95 323 115T437 83',
      'M22 -8Q30 72 56 110T83 263',
      'M162 -12Q149 48 156 83T172 160Q193 225 186 268',
      'M288 -10Q268 63 273 107T246 177L221 261',
      'M392 -6Q366 49 365 99T351 188',
      'M-5 220Q59 190 126 209T248 207Q294 186 345 179T434 184'
    ].map(function (path) { return new Path2D(path); });
    var motion = from !== undefined && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var started;

    function pin(x,y,fill,name,offset) {
      context.beginPath();
      context.arc(x,y,8,0,Math.PI * 2);
      context.lineWidth = 2.5;
      context.fillStyle = fill;
      context.fill();
      context.strokeStyle = '#fff';
      context.stroke();
      context.fillStyle = '#233c34';
      context.font = '700 19px -apple-system, sans-serif';
      context.lineWidth = 4;
      context.textAlign = x >= 355 ? 'right' : 'left';
      var labelX = x + (x >= 355 ? -11 : 11);
      context.strokeText(name,labelX,y + offset);
      context.fillText(name,labelX,y + offset);
      context.textAlign = 'left';
    }

    function frame(now) {
      if (started === undefined) started = now;
      var fraction = motion ? Math.min(1, (now - started) / 420) : 1;
      var travelled = motion ? from + (progress - from) * (1 - Math.pow(1 - fraction, 3)) : progress;
      context.setTransform(2,0,0,2,0,0);
      context.fillStyle = '#e8ebde';
      context.fillRect(0,0,430,260);
      context.fillStyle = '#d4e2ca';
      context.fill(landscape);
      context.fillStyle = '#bbd9da';
      context.fill(lake);
      context.lineJoin = 'round';
      context.lineCap = 'round';
      streets.forEach(function (street) {
        context.lineWidth = 7;
        context.strokeStyle = '#d0d6c7';
        context.stroke(street);
        context.lineWidth = 5;
        context.strokeStyle = '#faf9f1';
        context.stroke(street);
      });
      context.fillStyle = '#526956';
      context.font = '15px -apple-system, sans-serif';
      context.fillText('松林公园',102,36);
      context.fillText('青石湖',315,225);
      context.beginPath();
      route.forEach(function (p,i) { i ? context.lineTo(p[0],p[1]) : context.moveTo(p[0],p[1]); });
      context.lineWidth = 11;
      context.strokeStyle = '#f8fff1';
      context.stroke();
      context.lineWidth = 6;
      context.strokeStyle = '#2b7463';
      context.stroke();
      var self = positionAt(destination,travelled);
      var teammate = positionAt(destination,Math.min(destination.meters,travelled + teammateLead));
      var end = route[route.length - 1];
      context.beginPath();
      context.arc(end[0],end[1],7,0,Math.PI * 2);
      context.fillStyle = '#203831';
      context.fill();
      context.lineWidth = 2.5;
      context.strokeStyle = '#fff';
      context.stroke();
      if (travelled >= destination.meters) {
        pin(self[0],self[1],'#2b7463','两人已到',-9);
      } else {
        pin(self[0],self[1],'#bb6d10',sharing ? '我' : '起点',-7);
        if (sharing) pin(teammate[0],teammate[1],'#246fbe','阿岳',14);
      }
      if (fraction < 1 && canvas.isConnected) requestAnimationFrame(frame);
    }

    frame(performance.now());
  }

  function members() {
    return '<ul class="team-members">' +
      '<li><i>陈</i><span><strong>陈默 · 我</strong><small>队长 · 在线</small></span></li>' +
      '<li><i>岳</i><span><strong>阿岳</strong><small>队友 · 已配对车载屏</small></span></li></ul>';
  }

  function phone(state) {
    var connected = state.completed >= 1;
    var hasRoute = state.completed >= 2;
    var dest = destinations[state.destination];
    var appName = state.stage === 0 ? '附近车友' :
      (state.stage === 4 ? '电子号牌设置' : (state.stage === 5 ? '车队里程榜' : '松林骑队'));
    var header = '<div class="team-device-header"><strong>' + appName + '</strong><span>示例账号</span></div>';

    if (state.stage === 0) {
      return header + '<div class="team-device-body"><div class="team-lobby-cover"><span>ROADLINK 车队大厅</span><b>' +
        (connected ? '组队成功' : (state.invited ? '邀请已发出…' : '发现附近车友')) + '</b></div>' +
        (connected ? members() : '<p class="team-device-note">' +
          (state.invited ? '等待阿岳点击同意' : '发现 1 位附近车友') + '</p>' +
          '<ul class="team-members"><li><i>岳</i><span><strong>阿岳</strong><small>可邀请入队</small></span></li></ul>') + '</div>';
    }
    if (!connected) {
      return header + '<div class="team-device-body"><div class="team-route-empty"><p>请先完成第 1 步「见面组队」</p></div></div>';
    }
    if (state.stage === 4) {
      return header + '<div class="team-device-body"><div class="team-plate-preview"><span>' +
        (state.plateWritten ? '已通过蓝牙写入电子墨水牌 ✓' : '号牌预览 · 等待下发') + '</span><b>' +
        escapeText(state.number) + '</b><strong>' + escapeText(state.rider) + '</strong></div></div>';
    }
    if (state.stage === 5) {
      var finished = state.completed === 6;
      var myTotal = riderMileage + (finished ? dest.meters : 0);
      var mine = '<li class="mine"><span># ' + (myTotal > teammateMileage ? '1' : '2') + ' 陈默 · 我</span><b>' + km(myTotal) + ' km</b></li>';
      var mate = '<li><span># ' + (myTotal > teammateMileage ? '2' : '1') + ' 阿岳</span><b>' + km(teammateMileage) + ' km</b></li>';
      return header + '<div class="team-device-body"><div class="team-mileage"><span>' +
        (finished ? '本次骑行已计入' : '待结算路线') + '</span><b>' + (hasRoute ? km(dest.meters) : '—') + ' <small>km</small></b>' +
        '<small>' + (finished ? '排名已自动跃升！' : '点击下方模拟抵达并结算') + '</small></div>' +
        '<ol class="team-rank">' + (myTotal > teammateMileage ? mine + mate : mate + mine) + '</ol></div>';
    }

    var turn = guidance(dest, state.progress);
    return header + '<div class="team-device-body"><div class="team-map-summary"><div><small>车队目的地</small><b>' +
      (hasRoute ? dest.name : '未设置') + '</b></div>' + (hasRoute ? '<strong>' + km(dest.meters) + ' km</strong>' : '') + '</div>' +
      (hasRoute ? '<div class="team-map-frame"><canvas class="team-map" width="860" height="520" role="img" aria-label="车队位置示意地图"></canvas>' +
        '<span class="team-map-mode">' + (state.progress >= dest.meters ? '已抵达终点' : (state.completed >= 3 ? '位置共享中' : '路线已生成')) + '</span></div>' :
        '<div class="team-route-empty"><p>选好目的地，路线将立即同步全队</p></div>') +
      (state.completed >= 2 ? '<div class="team-next-turn"><span>下一导航点</span><b>' + turn.label + (turn.distance ? ' · ' + turn.distance : '') + '</b></div>' : '') + '</div>';
  }

  function esp(state) {
    var ready = state.completed >= 4;
    var dest = destinations[state.destination];
    var turn = guidance(dest, state.progress);
    var gap = Math.max(0, Math.min(teammateLead, dest.meters - state.progress));
    var distParts = turn.distance ? turn.distance.split(' ') : [];

    return '<div class="team-esp-case"><div class="team-esp-screen">' +
      (ready ? '<div class="team-round-arrow">' + turnArrowSvg(turn.dir) + '</div>' +
        (distParts.length ? '<b class="team-round-distance">' + distParts[0] + ' <small>' + distParts[1] + '</small></b>' : '') +
        '<div class="team-round-turn-text">' + turn.label + '</div>' +
        '<span class="team-round-gap">' + (gap ? '阿岳在前方 ' + formatDistance(gap) : '全队已汇合') + '</span>' :
        '<div class="team-standby"><b>待机中</b><small>等待手机蓝牙同步</small></div>') +
      '</div></div><div class="team-device-label"><strong>车把 ESP32 圆屏</strong><span>' +
      (ready ? '模拟同步' : '待同步') + '</span></div>';
  }

  function plate(state, flash) {
    var synced = state.plateWritten || state.hasLogo;
    return '<div class="team-ink-case"><div class="team-ink-screen' + (flash ? ' eink-flash' : '') + '">' +
      (!synced ? '<div class="team-standby"><b>等待下发号牌</b><small>等待手机发送</small></div>' :
        '<div class="team-ink-content">' +
        (state.hasLogo ? '<div class="team-ink-logo" aria-label="松林骑队队徽"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2L4 19h16L12 2z"/><path d="M12 10v9"/></svg></div>' : '') +
        (state.plateWritten ? '<strong class="team-plate-number">' + escapeText(state.number) + '</strong>' : '') +
        '<div class="team-ink-meta">' + (state.plateWritten ? '<strong>' + escapeText(state.rider) + '</strong>' : '') +
        (state.hasLogo ? '<small>松林骑队</small>' : '<small>ROADLINK</small>') + '</div></div>') +
      '</div></div><div class="team-device-label"><strong>电子墨水号牌</strong><span>' + (synced ? '模拟写入完成' : '待写入') + '</span></div>';
  }

  function mount(root, onManual) {
    var state = Object.assign({}, initial);
    var autoTimer = null;

    root.innerHTML =
      '<div class="team-intro"><div><h2 id="team-title" tabindex="-1">组队全流程演示</h2>' +
        '<span>交互模拟 · 示例数据</span></div>' +
        '<div class="team-intro-tools"><button type="button" class="secondary" id="team-autoplay" aria-pressed="false">自动演示</button>' +
        '<button type="button" class="team-reset" id="team-reset">重置</button></div></div>' +
      '<div class="team-steps" role="group" aria-label="组队流程步骤">' +
        stages.map(function (s, i) {
          return '<button type="button" class="team-step"><span aria-hidden="true">0' + (i + 1) + '</span>' + s.label + '</button>';
        }).join('') + '</div>' +
      '<div class="team-stage">' +
        '<aside class="team-action"><p id="team-stage-count" class="team-stage-count"></p>' +
          '<h3 id="team-stage-title"></h3><p id="team-stage-copy"></p><p class="team-result" role="status"></p></aside>' +
        '<div class="team-devices" data-focus="phone">' +
          '<div class="team-handset"><article class="team-phone"><div class="team-phone-bezel">' +
            '<div class="team-phone-status" aria-hidden="true"><span>9:41</span><i></i><span>5G</span></div>' +
            '<div class="team-phone-content"></div>' +
            '<form class="team-form" id="team-form"><div class="team-fields"></div><div class="team-actions">' +
              '<button type="submit" class="primary" id="team-do"></button>' +
              '<button type="button" class="secondary" id="team-logo" hidden>下发车队队徽</button>' +
              '<button type="button" class="secondary" id="team-next" hidden>下一步</button>' +
            '</div></form><div class="team-home-bar" aria-hidden="true"></div>' +
          '</div></article><div class="team-device-label"><strong>手机 App</strong><span>组队 · 定位 · 联网</span></div></div>' +
          '<div class="signal-bridge" aria-hidden="true">' +
            '<div class="signal-link" id="sig-esp"><div class="signal-line"></div><span class="signal-tag">导航同步</span></div>' +
            '<div class="signal-link" id="sig-ink"><div class="signal-line"></div><span class="signal-tag">号牌写入</span></div>' +
          '</div>' +
          '<div class="team-outputs"><article class="team-esp"></article><article class="team-plate"></article></div>' +
        '</div>' +
      '</div>';

    var find = function (sel) { return root.querySelector(sel); };
    var steps = Array.from(root.querySelectorAll('.team-step'));
    var fields = find('.team-fields'), primary = find('#team-do');
    var next = find('#team-next'), logo = find('#team-logo'), result = find('.team-result');
    var autoBtn = find('#team-autoplay');

    function stopAuto() {
      if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
      autoBtn.textContent = '自动演示';
      autoBtn.setAttribute('aria-pressed', 'false');
    }

    function manual() {
      stopAuto();
      if (onManual) onManual();
    }

    function renderPanels(from, flashPlate) {
      find('.team-phone-content').innerHTML = phone(state);
      find('.team-esp').innerHTML = esp(state);
      find('.team-plate').innerHTML = plate(state, flashPlate);
      find('#sig-esp').classList.toggle('active', state.completed >= 4);
      find('#sig-ink').classList.toggle('active', state.plateWritten || state.hasLogo);
      find('.team-devices').dataset.focus = state.stage === 4 && (state.plateWritten || state.hasLogo) ? 'plate' :
        (state.stage === 3 && state.completed >= 4 ? 'esp' : 'phone');
      root.querySelectorAll('.team-map').forEach(function (c) { draw(c, state, from); });
    }

    function renderControls() {
      var blocked = state.stage > state.completed;
      var travelling = state.progress < destinations[state.destination].meters;
      var labels = [
        state.completed ? '已完成组队' : (state.invited ? '模拟阿岳接受邀请' : '邀请阿岳加入车队'),
        state.completed === 6 ? '本次骑行已结算' : '生成全队共享路线',
        state.completed >= 3 ? (travelling ? '模拟向前骑行' : '已抵达终点') : '开启车队位置共享',
        state.completed >= 4 ? (travelling ? '模拟向前骑行' : '已抵达终点') : '模拟蓝牙同步',
        '下发队号和姓名到墨水牌',
        state.completed === 6 ? '已计入车队排行' : '模拟抵达并结算里程'
      ];
      primary.textContent = labels[state.stage];
      primary.disabled = blocked || (state.stage === 0 && state.completed >= 1) ||
        ((state.stage === 2 || state.stage === 3) && state.completed > state.stage && !travelling) ||
        ((state.stage === 1 || state.stage === 5) && state.completed === 6);

      next.hidden = !blocked && (state.completed <= state.stage || state.stage === stages.length - 1);
      if (!next.hidden) {
        next.textContent = blocked ? '先去完成：' + stages[state.completed].label : '下一步：' + stages[state.stage + 1].label + ' →';
      }
      logo.hidden = state.stage !== 4;
      logo.disabled = blocked;
      fields.querySelectorAll('input,select').forEach(function (f) {
        f.disabled = blocked || (state.stage === 1 && state.completed === 6);
      });
    }

    function renderStep() {
      var stage = stages[state.stage];
      steps.forEach(function (btn, i) {
        btn.setAttribute('aria-pressed', String(i === state.stage));
        btn.classList.toggle('is-done', i < state.completed);
      });
      find('#team-stage-count').textContent = '第 ' + (state.stage + 1) + ' 步 / 共 ' + stages.length + ' 步';
      find('#team-stage-title').textContent = stage.title;
      find('#team-stage-copy').textContent = stage.copy;
      fields.innerHTML = '';
      if (state.stage === 1) {
        fields.innerHTML = '<label>选择车队目的地<select id="team-destination">' +
          destinations.map(function (d, i) { return '<option value="' + i + '"' + (i === state.destination ? ' selected' : '') + '>' + d.name + ' (' + km(d.meters) + ' km)</option>'; }).join('') +
          '</select></label>';
      } else if (state.stage === 4) {
        fields.innerHTML = '<label>编队号码<input type="text" inputmode="numeric" id="team-number" maxlength="3" required value="' + escapeText(state.number) + '"></label>' +
          '<label>骑手昵称<input type="text" id="team-rider" maxlength="10" required value="' + escapeText(state.rider) + '"></label>';
        fields.querySelectorAll('input').forEach(function (input) {
          input.addEventListener('input', function () { input.setCustomValidity(''); });
        });
      }
      result.textContent = state.stage > state.completed ? '提示：请先完成「' + stages[state.completed].label + '」步骤。' : '';
      renderControls();
      renderPanels();
    }

    function finish(message, from, flashPlate) {
      var restoreFocus = document.activeElement === primary;
      state.completed = Math.max(state.completed, state.stage + 1);
      steps.forEach(function (btn, i) { btn.classList.toggle('is-done', i < state.completed); });
      renderControls();
      renderPanels(from, flashPlate);
      result.textContent = message;
      if (restoreFocus && primary.disabled && !next.hidden) next.focus({preventScroll:true});
    }

    steps.forEach(function (btn, i) {
      btn.addEventListener('click', function () { manual(); state.stage = i; renderStep(); });
    });

    next.addEventListener('click', function () {
      manual();
      state.stage = state.stage > state.completed ? state.completed : state.stage + 1;
      renderStep();
      var field = fields.querySelector('input,select');
      (field && !field.disabled ? field : primary).focus({preventScroll:true});
    });

    find('#team-reset').addEventListener('click', function () {
      manual();
      state = Object.assign({}, initial);
      renderStep();
    });

    logo.addEventListener('click', function () {
      if (logo.disabled) return;
      manual();
      state.hasLogo = true;
      finish('墨水牌已刷新显示「松林骑队」队徽！', undefined, true);
    });

    find('#team-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (primary.disabled) return;
      manual();
      switch (state.stage) {
        case 0:
          if (state.invited) {
            finish('阿岳已入队！手机大厅实时显示两位车友。');
          } else {
            state.invited = true;
            renderControls(); renderPanels();
            result.textContent = '已向阿岳发出组队邀请，点击下方按钮模拟对方同意。';
          }
          break;
        case 1: {
          var choice = Number(find('#team-destination').value);
          if (state.completed >= 2 && choice !== state.destination) {
            state.completed = 1; state.progress = 0;
          }
          state.destination = choice;
          var d = destinations[choice];
          finish('前往「' + d.name + '」的 ' + km(d.meters) + ' km 共享路线已生成！');
          break;
        }
        case 2:
        case 3:
          if (state.completed > state.stage) {
            var prev = state.progress;
            var total = destinations[state.destination].meters;
            state.progress = Math.min(total, prev + simulationStep);
            finish(state.progress === total ? '全队已抵达终点！可以去结算里程了。' :
              (state.completed >= 4 ? '已向前骑行：手机地图与车把圆屏转向提示实时同步更新！' : '地图上自己与队友位置同步前进。'), prev);
          } else {
            finish(state.stage === 2 ? '位置共享已开启，地图上同时看到我和阿岳！' : '蓝牙同步成功！右侧车把圆屏已亮起转向箭头与队友距离。');
          }
          break;
        case 4: {
          var numEl = find('#team-number'), nameEl = find('#team-rider');
          var numVal = numEl.value.trim(), nameVal = nameEl.value.trim();
          if (!/^\d{1,3}$/.test(numVal) || Number(numVal) < 1) {
            numEl.setCustomValidity('请输入 1 到 999 的队号。');
            numEl.reportValidity();
            return;
          }
          if (!nameVal) {
            nameEl.setCustomValidity('请输入骑手姓名。');
            nameEl.reportValidity();
            return;
          }
          state.number = numVal;
          state.rider = nameVal;
          state.plateWritten = true;
          finish('蓝牙写入完成！右侧电子墨水牌已刷新为「' + numVal + ' · ' + nameVal + '」。', undefined, true);
          break;
        }
        case 5:
          state.progress = destinations[state.destination].meters;
          finish('本次 ' + km(state.progress) + ' km 已计入总里程，陈默升至车队第 1 名！');
          break;
      }
    });

    // One-click roadshow autoplay script
    function play() {
      stopAuto();
      state = Object.assign({}, initial);
      renderStep();
      autoBtn.textContent = '停止演示';
      autoBtn.setAttribute('aria-pressed', 'true');

      var script = [
        function () { state.invited = true; renderControls(); renderPanels(); result.textContent = '自动演示：向附近车友阿岳发出邀请…'; },
        function () { finish('自动演示：阿岳已入队！'); },
        function () { state.stage = 1; renderStep(); },
        function () { finish('自动演示：选定「松林观景台」8.4 km 路线！'); },
        function () { state.stage = 2; renderStep(); },
        function () { finish('自动演示：开启车队实时位置共享！'); },
        function () { state.stage = 3; renderStep(); },
        function () { finish('自动演示：蓝牙同步到车把圆屏！'); },
        function () { var p = state.progress; state.progress = 2600; finish('自动演示：骑行中，手机与车把圆屏实时联动…', p); },
        function () { state.stage = 4; renderStep(); },
        function () { state.plateWritten = true; state.hasLogo = true; finish('自动演示：电子墨水牌刷新队号、姓名与队徽！', undefined, true); },
        function () { state.stage = 5; renderStep(); },
        function () { state.progress = destinations[state.destination].meters; finish('自动演示完成：里程结算，陈默跃升车队第 1 名！'); stopAuto(); }
      ];

      var idx = 0;
      function runNext() {
        if (!root.isConnected) { stopAuto(); return; }
        script[idx++]();
        if (idx < script.length) autoTimer = setTimeout(runNext, 1650);
      }
      autoTimer = setTimeout(runNext, 450);
    }

    autoBtn.addEventListener('click', function () {
      var wasPlaying = Boolean(autoTimer);
      manual();
      if (!wasPlaying) play();
    });

    renderStep();
    return {play:play, stop:stopAuto, isPlaying:function () { return Boolean(autoTimer); }};
  }

  window.mountRoadlinkTeam = mount;
})();
