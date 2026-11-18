(function () {
  'use strict';

  var destinations = [
    { name: '松林观景台', distance: '8.4 km', meters: 300, turn: '右转', route: [[44,152],[100,129],[160,135],[210,102],[253,116],[290,76],[348,63],[395,34]] },
    { name: '山脚补给站', distance: '4.2 km', meters: 400, turn: '左转', route: [[44,152],[105,147],[138,95],[193,101],[227,67],[280,89],[334,73],[395,108]] }
  ];
  var stages = [
    { label: '见面组队', title: '见面就能组队', copy: '两位车友打开 APP。点「确认快速组队」，队友的名字和设备就会出现在同一个群里。' },
    { label: '定目的地', title: '在群里选一个终点', copy: '在手机上选一个终点。APP 用定位和网络生成一条大家都能看到的路线。' },
    { label: '共享位置', title: '从地图上看到队友', copy: '车友开启车队位置共享后，手机地图同时显示自己、队友和正在走的路线。' },
    { label: '同步车载屏', title: '抬眼就能看转向', copy: '点「用蓝牙同步到 ESP32」，圆屏就会显示下一个转弯和队友在你前方的位置。' },
    { label: '下发电子号牌', title: '把名字、号码或队徽亮出来', copy: '在 APP 写入号码、骑手姓名，或选择车队 Logo。ESP32 将内容转发到三防电子墨水屏。' },
    { label: '骑完看里程', title: '骑完回群里看里程', copy: '手机记录这一趟的 GPS 里程。骑行结束后，群内排行榜按累计里程更新。' }
  ];
  var initial = { stage: 0, completed: 0, destination: 0, movement: 0, number: '07', rider: '陈默', hasLogo: false };

  function escapeText(value) {
    return String(value).replace(/[&<>"']/g,function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function mapMarkup() {
    return '<canvas class="team-map" width="860" height="520" role="img" aria-label="路线、我的位置、队友位置与终点"></canvas>';
  }

  function draw(canvas, state, from) {
    var context = canvas.getContext('2d');
    if (!context) return;
    var route = destinations[state.destination].route;
    var movement = state.movement;
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
      context.font = '700 16px -apple-system, sans-serif';
      context.lineWidth = 4;
      context.strokeText(name,x + 11,y + offset);
      context.fillText(name,x + 11,y + offset);
    }

    function point(index, progress) {
      var next = route[movement + index];
      if (!motion) return next;
      var previous = route[from + index];
      return previous.map(function (value,i) { return value + (next[i] - value) * progress; });
    }

    function frame(now) {
      if (started === undefined) started = now;
      var fraction = motion ? Math.min(1, (now - started) / 420) : 1;
      var progress = 1 - Math.pow(1 - fraction, 3);
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
      var self = point(0,progress);
      var teammate = point(2,progress);
      var end = route[route.length - 1];
      context.beginPath();
      context.arc(end[0],end[1],7,0,Math.PI * 2);
      context.fillStyle = '#203831';
      context.fill();
      context.lineWidth = 2.5;
      context.strokeStyle = '#fff';
      context.stroke();
      pin(self[0],self[1],'#bb6d10','我',-7);
      if (sharing) pin(teammate[0],teammate[1],'#246fbe','阿岳',14);
      if (fraction < 1 && canvas.isConnected) requestAnimationFrame(frame);
    }

    frame(performance.now());
  }

  function members() {
    return '<ul class="team-members">' +
      '<li><i>陈</i><span><strong>陈默 · 我</strong><small>队长 · 同款 ESP32 已配对</small></span></li>' +
      '<li><i>岳</i><span><strong>阿岳</strong><small>队友 · 同款 ESP32 已配对</small></span></li></ul>';
  }

  function phone(state) {
    var connected = state.completed >= 1;
    var hasRoute = state.completed >= 2;
    var dest = destinations[state.destination];
    var appName = state.stage === 0 ? '附近的车友' :
      (state.stage === 4 ? '电子号牌' : (state.stage === 5 ? '车队里程榜' : '松林骑队'));
    var header = '<div class="team-device-header"><strong>' + appName + '</strong><span>陈默</span></div>';
    if (state.stage === 0) {
      return header + '<div class="team-device-body team-lobby"><div class="team-lobby-cover"><span>松林骑队</span><b>' +
        (connected ? '组队成功' : '一起出发') + '</b></div>' +
        (connected ? members() : '<p class="team-device-note">发现 1 位已登录的附近车友</p>' +
          '<ul class="team-members"><li><i>岳</i><span><strong>阿岳</strong><small>同款车载设备</small></span></li></ul>') + '</div>';
    }
    if (state.stage === 4) {
      return header + '<div class="team-device-body"><div class="team-plate-preview"><span>当前号牌</span><b>' +
        escapeText(state.number) + '</b><strong>' + escapeText(state.rider) + '</strong></div></div>';
    }
    if (state.stage === 5) {
      var finished = state.completed === 6;
      return header + '<div class="team-device-body"><div class="team-mileage"><span>本次骑行</span><b>42 <small>km</small></b>' +
        '<small>' + (finished ? '已计入累计里程' : '结束骑行后计入里程') + '</small></div>' +
        '<ol class="team-rank">' +
        (finished ? '<li class="mine"><span>陈默 · 我</span><b>454 km</b></li><li><span>阿岳</span><b>438 km</b></li>' :
          '<li><span>阿岳</span><b>438 km</b></li><li class="mine"><span>陈默 · 我</span><b>412 km</b></li>') + '</ol></div>';
    }
    return header + '<div class="team-device-body"><div class="team-map-summary"><div><small>车队目的地</small><b>' +
      (hasRoute ? dest.name : '还未设置') + '</b></div>' + (hasRoute ? '<strong>' + dest.distance + '</strong>' : '') + '</div>' +
      (hasRoute ? '<div class="team-map-frame">' + mapMarkup() +
        '<span class="team-map-mode">' + (state.completed >= 3 ? '正在共享位置' : '车队路线已生成') + '</span></div>' :
        '<div class="team-route-empty"><span aria-hidden="true"></span><p>选好目的地，路线会显示在这里</p></div>') +
      (state.stage === 1 ? members() : '') +
      (state.completed >= 4 ? '<div class="team-next-turn"><span>下一个路口</span><b>' +
        dest.turn + ' · ' + turnDistance(state) + ' m</b></div>' : '') + '</div>';
  }

  function turnDistance(state) {
    return destinations[state.destination].meters - state.movement * 35;
  }

  function riderMarker(label, position, movement, from) {
    return '<span style="--position:' + (position + movement * 5) + '%' +
      (from === undefined ? '' : ';--previous:' + (position + from * 5) + '%') + '">' + label + '</span>';
  }

  function esp(state, from) {
    var ready = state.completed >= 4, dest = destinations[state.destination];
    return '<div class="team-esp-case"><div class="team-esp-screen">' +
      (ready ? '<span class="team-round-arrow" data-turn="' + dest.turn + '" aria-hidden="true"></span>' +
        '<b class="team-round-distance">' + turnDistance(state) + ' <small>m</small></b><b>' + dest.turn + '</b>' +
        '<div class="team-round-line" role="img" aria-label="阿岳在我前方">' +
        riderMarker('我',26,state.movement,from) + riderMarker('阿岳',60,state.movement,from) + '</div>' :
        '<div class="team-standby"><span class="team-round-signal" aria-hidden="true"></span><b>等待手机同步</b><small>转向与队友位置</small></div>') + '</div></div>' +
      '<div class="team-device-label"><strong>车把导航圆屏</strong><span>' + (ready ? '蓝牙已同步' : '待同步') + '</span></div>';
  }

  function plate(state) {
    var synced = state.completed >= 5;
    return '<div class="team-ink-case"><div class="team-ink-screen">' +
      (!synced ? '<div class="team-standby"><b>等待写入</b><small>队号、姓名和车队 Logo</small></div>' :
        '<div class="team-ink-content">' + (state.hasLogo ? '<div class="team-ink-logo" aria-label="松林骑队队徽" role="img"></div>' : '') +
        '<strong class="team-plate-number">' + escapeText(state.number) + '</strong>' +
        '<span><strong>' + escapeText(state.rider) + '</strong>' + (state.hasLogo ? '<small>松林骑队</small>' : '') + '</span></div>') + '</div></div>' +
      '<div class="team-device-label"><strong>三防电子墨水牌</strong><span>' + (synced ? 'ESP32 已转发' : '待写入') + '</span></div>';
  }

  function mount(root, ridePhoto) {
    var state = Object.assign({},initial);
    root.innerHTML =
      '<header class="team-intro"><div><h1 id="scene-heading" tabindex="-1">组队与车友社交</h1>' +
      '<p>在手机上操作，看车把圆屏和电子号牌怎么变。</p><span>模拟演示</span></div>' +
      '<figure class="team-intro-photo">' + ridePhoto + '</figure></header>' +
      '<div class="team-steps" role="group" aria-label="组队流程步骤">' +
      stages.map(function (stage,index) {
        return '<button type="button" class="team-step"><span aria-hidden="true">0' + (index + 1) + '</span>' + stage.label + '</button>';
      }).join('') + '</div>' +
      '<div class="team-stage"><aside class="team-action"><p id="team-stage-count" class="team-stage-count"></p><h3 id="team-stage-title"></h3><p id="team-stage-copy"></p>' +
      '<p class="team-result" role="status"></p><div class="team-actions">' +
      '<button type="button" class="secondary" id="team-next" hidden>下一步 →</button>' +
      '<button type="button" class="team-reset" id="team-reset">重置演示</button></div></aside>' +
      '<div class="team-devices"><div class="team-handset"><article class="team-phone"><div class="team-phone-bezel">' +
      '<div class="team-phone-status" aria-hidden="true"><span>9:41</span><i></i><span>5G ▮</span></div><div class="team-phone-content"></div>' +
      '<form class="team-form" id="team-form"><div class="team-fields"></div><div class="team-actions">' +
      '<button type="submit" class="primary" id="team-do"></button>' +
      '<button type="button" class="secondary" id="team-logo" hidden>下发车队 Logo</button></div></form><div class="team-home-bar" aria-hidden="true"></div></div></article>' +
      '<div class="team-device-label"><strong>手机 APP</strong><span>联网 · GPS · 蓝牙</span></div></div>' +
      '<div class="team-outputs"><article class="team-esp"></article><article class="team-plate"></article></div></div></div>';

    var find = function (selector) { return root.querySelector(selector); };
    var steps = Array.from(root.querySelectorAll('.team-step'));
    var fields = find('.team-fields'), primary = find('#team-do');
    var next = find('#team-next'), reset = find('#team-reset'), logo = find('#team-logo'), result = find('.team-result');

    function renderPanels(from) {
      find('.team-phone-content').innerHTML = phone(state);
      find('.team-esp').innerHTML = esp(state,from);
      find('.team-plate').innerHTML = plate(state);
      find('.team-devices').dataset.focus = state.stage === 4 && state.completed >= 5 ? 'plate' :
        (state.stage === 3 && state.completed >= 4 ? 'esp' : 'phone');
      root.querySelectorAll('.team-map').forEach(function (canvas) { draw(canvas,state,from); });
    }

    function renderControls() {
      var labels = [
        state.completed ? '已完成组队' : '确认快速组队',
        '生成群导航路线',
        state.completed >= 3 ? '模拟队友前进' : '开启车队位置共享',
        state.completed >= 4 ? '模拟队友前进' : '用蓝牙同步到 ESP32',
        '下发号码和姓名',
        state.completed === 6 ? '已计入里程榜' : '结束骑行并计入里程榜'
      ];
      primary.textContent = labels[state.stage];
      primary.disabled = (state.stage === 0 && state.completed >= 1) || (state.stage === 5 && state.completed === 6);
      next.hidden = state.completed <= state.stage || state.stage === stages.length - 1;
      if (!next.hidden) next.textContent = '下一步 · ' + stages[state.stage + 1].label + ' →';
      logo.hidden = state.stage !== 4;
      reset.hidden = state.completed === 0;
    }

    function renderStep() {
      var stage = stages[state.stage];
      steps.forEach(function (button,i) { button.setAttribute('aria-pressed',String(i === state.stage)); });
      find('#team-stage-count').textContent = '第 ' + (state.stage + 1) + ' 步 / 共 ' + stages.length + ' 步';
      find('#team-stage-title').textContent = stage.title;
      find('#team-stage-copy').textContent = stage.copy;
      fields.innerHTML = '';
      if (state.stage === 1) {
        fields.innerHTML = '<label>车队目的地<select id="team-destination">' +
          destinations.map(function (dest,i) { return '<option value="' + i + '"' + (i === state.destination?' selected':'') + '>' + dest.name + '</option>'; }).join('') +
          '</select></label>';
      } else if (state.stage === 4) {
        fields.innerHTML = '<label>编队号码<input type="text" inputmode="numeric" id="team-number" maxlength="3" required value="' + escapeText(state.number) + '"></label>' +
          '<label>骑手姓名<input type="text" id="team-rider" maxlength="10" required value="' + escapeText(state.rider) + '"></label>';
        fields.querySelectorAll('input').forEach(function (input) {
          input.addEventListener('input',function () { input.setCustomValidity(''); });
        });
      }
      result.textContent = '';
      renderControls();
      renderPanels();
    }

    function showStage(index) {
      state.stage = index;
      state.completed = Math.max(state.completed,index);
      renderStep();
    }

    function finish(message, from) {
      var moveFocus = document.activeElement === primary;
      state.completed = Math.max(state.completed,state.stage + 1);
      renderControls();
      renderPanels(from);
      result.textContent = message;
      if (moveFocus && primary.disabled) {
        (next.hidden ? reset : next).focus({ preventScroll:true });
      }
    }

    steps.forEach(function (button,index) { button.addEventListener('click',function () { showStage(index); }); });
    next.addEventListener('click',function () {
      showStage(state.stage + 1);
      steps[state.stage].focus({ preventScroll:true });
    });
    reset.addEventListener('click',function () {
      state = Object.assign({},initial);
      renderStep();
      steps[0].focus({ preventScroll:true });
    });
    logo.addEventListener('click',function () {
      state.hasLogo = true;
      finish('手机把松林骑队 Logo 发给 ESP32，墨水牌上的队徽已更新。');
    });

    find('#team-form').addEventListener('submit',function (event) {
      event.preventDefault();
      if (primary.disabled) return;
      switch (state.stage) {
        case 0:
          finish('松林骑队已创建。两位车友的身份和设备出现在群里。');
          break;
        case 1:
          state.destination = Number(find('#team-destination').value);
          state.movement = 0;
          finish('手机已生成前往「' + destinations[state.destination].name + '」的车队路线。');
          break;
        case 2:
        case 3:
          if (state.completed > state.stage) {
            var previous = state.movement;
            state.movement = (state.movement + 1) % 5;
            finish(state.completed >= 4 ? '手机 GPS 位置更新，ESP32 屏幕同步显示。' : '队友位置已在手机地图更新。', previous);
          } else {
            finish(state.stage === 2 ? '车队位置共享已开启，地图上能看到我和队友。' :
              '手机已经通过蓝牙把导航和队友位置下发到 ESP32。');
          }
          break;
        case 4: {
          var number = find('#team-number'), rider = find('#team-rider');
          if (!/^\d{1,3}$/.test(number.value) || Number(number.value) < 1) {
            number.setCustomValidity('请输入 1 至 999 之间的编队号码。');
            number.reportValidity();
            return;
          }
          if (!rider.value.trim()) {
            rider.setCustomValidity('请输入示例骑手姓名。');
            rider.reportValidity();
            return;
          }
          state.number = number.value;
          state.rider = rider.value.trim();
          finish('ESP32 已把队号和骑手姓名转发给墨水屏。');
          break;
        }
        case 5:
          finish('手机记录的 42 公里计入群榜。累计 454 公里，升至第 1 名。');
          break;
      }
    });
    renderStep();
  }

  window.mountRoadlinkTeam = mount;
})();
