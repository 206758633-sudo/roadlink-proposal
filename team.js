(function () {
  'use strict';

  var destinations = [
    { name: '松林观景台', meters: 8400, route: [[44,152],[100,129],[160,135],[210,102],[253,116],[290,76],[348,63],[395,34]] },
    { name: '山脚补给站', meters: 4200, route: [[44,152],[105,147],[138,95],[193,101],[227,67],[280,89],[334,73],[395,108]] }
  ];
  var stages = [
    { label: '见面组队', title: '见面就能组队', copy: '已登录的骑手找到附近车友，发出邀请。对方接受后，两人出现在同一个车队。' },
    { label: '定目的地', title: '在群里选一个终点', copy: '在手机上选一个终点。APP 用定位和网络生成一条大家都能看到的路线。' },
    { label: '共享位置', title: '从地图上看到队友', copy: '车友开启车队位置共享后，手机地图同时显示自己、队友和正在走的路线。' },
    { label: '同步车载屏', title: '抬眼就能看转向', copy: '手机把导航和队友位置发给 ESP32，圆屏显示转向与队友距离。请点「模拟蓝牙同步」。' },
    { label: '下发电子号牌', title: '把名字、号码或队徽亮出来', copy: '在 APP 填写号码和姓名并下发，也可单独发送队徽。ESP32 将内容转发到电子墨水屏。' },
    { label: '骑完看里程', title: '骑完回群里看里程', copy: '手机记录这一趟的 GPS 里程。骑行结束后，群内排行榜按累计里程更新。' }
  ];
  var initial = { stage: 0, completed: 0, destination: 0, progress: 0, invited: false, number: '07', rider: '陈默', plateWritten: false, hasLogo: false };
  var riderMileage = 412000;
  var teammateMileage = 416000;
  var teammateLead = 180;
  var simulationStep = 400;

  destinations.forEach(function (destination) {
    var pixels = 0;
    var offsets = destination.route.map(function (vertex, i, points) {
      if (i) pixels += Math.hypot(vertex[0] - points[i - 1][0],vertex[1] - points[i - 1][1]);
      return pixels;
    });
    destination.offsets = offsets.map(function (offset) { return Math.round(offset / pixels * destination.meters); });
  });

  function km(meters) {
    return (meters / 1000).toLocaleString('en-US',{ maximumFractionDigits:1, useGrouping:false });
  }

  function formatDistance(meters) {
    return meters >= 1000 ? km(meters) + ' km' : Math.max(1, Math.round(meters)) + ' m';
  }

  function nextVertex(destination, progress) {
    return destination.offsets.findIndex(function (offset) { return offset > progress; });
  }

  function positionAt(destination, progress) {
    var next = nextVertex(destination,progress);
    var route = destination.route;
    if (next === -1) return route[route.length - 1];
    var start = route[next - 1], end = route[next];
    var interval = destination.offsets[next] - destination.offsets[next - 1];
    var portion = (progress - destination.offsets[next - 1]) / interval;
    return [start[0] + (end[0] - start[0]) * portion,start[1] + (end[1] - start[1]) * portion];
  }

  function guidance(destination, progress) {
    var next = nextVertex(destination,progress);
    if (next === -1) return { label:'已到达', distance:'' };
    var distance = formatDistance(destination.offsets[next] - progress);
    if (next === destination.route.length - 1) return { label:'直行到终点', distance:distance };
    var before = destination.route[next - 1], turn = destination.route[next], after = destination.route[next + 1];
    var cross = (turn[0] - before[0]) * (after[1] - turn[1]) - (turn[1] - before[1]) * (after[0] - turn[0]);
    return { label:cross > 0 ? '右转' : '左转', distance:distance };
  }

  function escapeText(value) {
    return String(value).replace(/[&<>"']/g,function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function mapMarkup() {
    return '<canvas class="team-map" width="860" height="520" role="img" aria-label="示意路线、起点或骑手位置与终点"></canvas>';
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
      context.font = '700 16px -apple-system, sans-serif';
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
      '<li><i>陈</i><span><strong>陈默 · 我</strong><small>队长 · 车友 ID 007</small></span></li>' +
      '<li><i>岳</i><span><strong>阿岳</strong><small>队友 · 车友 ID 018</small></span></li></ul>';
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
        (connected ? '组队成功' : (state.invited ? '邀请已发出' : '一起出发')) + '</b></div>' +
        (connected ? members() : '<p class="team-device-note">' +
          (state.invited ? '等待阿岳接受' : '发现 1 位附近车友 · 示例账号') + '</p>' +
          '<ul class="team-members"><li><i>岳</i><span><strong>阿岳</strong><small>同款车载设备</small></span></li></ul>') + '</div>';
    }
    if (!connected && state.stage !== 0) {
      return header + '<div class="team-device-body"><div class="team-route-empty"><p>加入车队后可操作此页面</p></div></div>';
    }
    if (state.stage === 4) {
      return header + '<div class="team-device-body"><div class="team-plate-preview"><span>' +
        (state.plateWritten ? '已写入号牌' : '预设信息 · 待写入') + '</span><b>' +
        escapeText(state.number) + '</b><strong>' + escapeText(state.rider) + '</strong></div></div>';
    }
    if (state.stage === 5) {
      var finished = state.completed === 6;
      var myTotal = riderMileage + (finished ? dest.meters : 0);
      var mine = '<li class="mine"><span>陈默 · 我</span><b>' + km(myTotal) + ' km</b></li>';
      var teammate = '<li><span>阿岳</span><b>' + km(teammateMileage) + ' km</b></li>';
      return header + '<div class="team-device-body"><div class="team-mileage"><span>' +
        (finished ? '本次骑行' : '计划路线') + '</span><b>' + (hasRoute ? km(dest.meters) : '—') + ' <small>km</small></b>' +
        '<small>' + (finished ? '已计入示例累计里程' : '模拟抵达后计入里程') + '</small></div>' +
        '<ol class="team-rank">' + (myTotal > teammateMileage ? mine + teammate : teammate + mine) + '</ol></div>';
    }
    return header + '<div class="team-device-body"><div class="team-map-summary"><div><small>车队目的地</small><b>' +
      (hasRoute ? dest.name : '还未设置') + '</b></div>' + (hasRoute ? '<strong>' + km(dest.meters) + ' km' + '</strong>' : '') + '</div>' +
      (hasRoute ? '<div class="team-map-frame">' + mapMarkup() +
        '<span class="team-map-context">示意地图</span><span class="team-map-mode">' + (state.progress >= dest.meters ? '已抵达终点' : (state.completed >= 3 ? '正在共享位置' : '路线已生成')) + '</span></div>' :
        '<div class="team-route-empty"><span aria-hidden="true"></span><p>选好目的地，路线会显示在这里</p></div>') +
      (state.stage === 1 ? members() : '') +
      (state.completed >= 2 ? nextTurn(dest,state.progress) : '') + '</div>';
  }

  function nextTurn(destination, progress) {
    var turn = guidance(destination,progress);
    return '<div class="team-next-turn"><span>导航提示</span><b>' + turn.label +
      (turn.distance ? ' · ' + turn.distance : '') + '</b></div>';
  }

  function esp(state) {
    var ready = state.completed >= 4;
    var destination = destinations[state.destination];
    var turn = guidance(destination,state.progress);
    var gap = Math.min(teammateLead,destination.meters - state.progress);
    var distance = turn.distance.split(' ');
    return '<div class="team-esp-case"><div class="team-esp-screen">' +
      (ready ? '<span class="team-round-arrow" data-turn="' + turn.label + '" aria-hidden="true"></span>' +
        (turn.distance ? '<b class="team-round-distance">' + distance[0] + ' <small>' + distance[1] + '</small></b>' : '') +
        '<b>' + turn.label + '</b><small class="team-round-gap">' +
        (gap ? '阿岳在前方 ' + formatDistance(gap) : '队友已抵达') + '</small>' :
        '<div class="team-standby"><span class="team-round-signal" aria-hidden="true"></span><b>等待手机同步</b><small>转向与队友位置</small></div>') +
      '</div></div><div class="team-device-label"><strong>车把导航圆屏</strong><span>' +
      (ready ? '模拟蓝牙同步' : '待同步') + '</span></div>';
  }

  function plate(state) {
    var synced = state.plateWritten || state.hasLogo;
    return '<div class="team-ink-case"><div class="team-ink-screen">' +
      (!synced ? '<div class="team-standby"><b>等待写入</b><small>队号、姓名和车队 Logo</small></div>' :
        '<div class="team-ink-content">' + (state.hasLogo ? '<div class="team-ink-logo" aria-label="松林骑队队徽" role="img"></div>' : '') +
        (state.plateWritten ? '<strong class="team-plate-number">' + escapeText(state.number) + '</strong>' : '') +
        '<span>' + (state.plateWritten ? '<strong>' + escapeText(state.rider) + '</strong>' : '') +
        (state.hasLogo ? '<small>松林骑队</small>' : '') + '</span></div>') + '</div></div>' +
      '<div class="team-device-label"><strong>电子墨水牌</strong><span>' + (synced ? '模拟写入完成' : '待写入') + '</span></div>';
  }

  function mount(root) {
    var state = Object.assign({},initial);
    root.innerHTML =
      '<div class="team-intro"><h2 id="team-title" tabindex="-1">组队互动演示</h2><span>交互模拟 · 示例数据</span></div>' +
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
    var next = find('#team-next'), logo = find('#team-logo'), result = find('.team-result');

    function renderPanels(from) {
      find('.team-phone-content').innerHTML = phone(state);
      find('.team-esp').innerHTML = esp(state);
      find('.team-plate').innerHTML = plate(state);
      find('.team-devices').dataset.focus = state.stage === 4 && state.completed >= 5 ? 'plate' :
        (state.stage === 3 && state.completed >= 4 ? 'esp' : 'phone');
      root.querySelectorAll('.team-map').forEach(function (canvas) { draw(canvas,state,from); });
    }

    function renderControls() {
      var blocked = state.stage > state.completed;
      var travelling = state.progress < destinations[state.destination].meters;
      var simulateRide = travelling ? '模拟向前骑行' : '已到达终点';
      var labels = [
        state.completed ? '已完成组队' : (state.invited ? '模拟阿岳接受邀请' : '邀请阿岳入队'),
        state.completed === 6 ? '本次骑行已结算' : '生成群导航路线',
        state.completed >= 3 ? simulateRide : '开启车队位置共享',
        state.completed >= 4 ? simulateRide : '模拟蓝牙同步',
        '下发号码和姓名',
        state.completed === 6 ? '已计入里程榜' : '模拟抵达并结算'
      ];
      primary.textContent = labels[state.stage];
      primary.disabled = blocked || (state.stage === 0 && state.completed >= 1) ||
        ((state.stage === 2 || state.stage === 3) && state.completed > state.stage && !travelling) || ((state.stage === 1 || state.stage === 5) && state.completed === 6);
      next.hidden = !blocked && (state.completed <= state.stage || state.stage === stages.length - 1);
      if (!next.hidden) next.textContent = blocked ? '去完成 · ' + stages[state.completed].label :
        '下一步 · ' + stages[state.stage + 1].label + ' →';
      logo.hidden = state.stage !== 4;
      logo.disabled = blocked;
      fields.querySelectorAll('input,select').forEach(function (field) { field.disabled = blocked || (state.stage === 1 && state.completed === 6); });
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
      result.textContent = state.stage > state.completed ?
        '先完成「' + stages[state.completed].label + '」，再继续此步。' : '';
      renderControls();
      renderPanels();
    }

    function showStage(index) {
      state.stage = index;
      renderStep();
    }

    function finish(message, from) {
      var moveFocus = document.activeElement === primary;
      state.completed = Math.max(state.completed,state.stage + 1);
      renderControls();
      renderPanels(from);
      result.textContent = message;
      if (moveFocus && primary.disabled) {
        (next.hidden ? find('#team-reset') : next).focus({ preventScroll:true });
      }
    }

    steps.forEach(function (button,index) { button.addEventListener('click',function () { showStage(index); }); });
    next.addEventListener('click',function () {
      showStage(state.stage > state.completed ? state.completed : state.stage + 1);
      steps[state.stage].focus({ preventScroll:true });
    });
    find('#team-reset').addEventListener('click',function () {
      state = Object.assign({},initial);
      renderStep();
      steps[0].focus({ preventScroll:true });
    });
    logo.addEventListener('click',function () {
      if (logo.disabled) return;
      state.hasLogo = true;
      finish('墨水牌已收到松林骑队队徽。号码和姓名由独立操作下发。');
    });

    find('#team-form').addEventListener('submit',function (event) {
      event.preventDefault();
      if (primary.disabled) return;
      switch (state.stage) {
        case 0:
          if (state.invited) {
            finish('阿岳已接受邀请，松林骑队现在有两位车友。');
          } else {
            state.invited = true;
            renderControls();
            renderPanels();
            result.textContent = '邀请已发出，等待阿岳接受。';
          }
          break;
        case 1: {
          var choice = Number(find('#team-destination').value);
          var replanned = state.completed >= 2 && choice !== state.destination;
          if (replanned) {
            state.completed = 1;
            state.progress = 0;
          }
          state.destination = choice;
          var destination = destinations[choice];
          finish('前往「' + destination.name + '」的示例路线已生成，共 ' + km(destination.meters) + ' 公里。' +
            (replanned ? '请重新共享位置并同步圆屏。' : ''));
          break;
        }
        case 2:
        case 3:
          if (state.completed > state.stage) {
            var previous = state.progress;
            var total = destinations[state.destination].meters;
            state.progress = Math.min(total,previous + simulationStep);
            finish(state.progress === total ? '两位骑手已抵达示例路线终点。' :
              (state.completed >= 4 ? '示例位置已更新，手机与圆屏显示同一条路线的导航提示。' : '手机地图已更新示例位置。'),previous);
          } else {
            finish(state.stage === 2 ? '车队位置共享已开启，地图上能看到我和队友。' :
              '模拟同步完成，圆屏显示下一次转向和队友相对距离。');
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
          state.plateWritten = true;
          finish('模拟写入完成，墨水牌已显示队号和骑手姓名。');
          break;
        }
        case 5:
          state.progress = destinations[state.destination].meters;
          finish('本次 ' + km(state.progress) + ' 公里计入示例里程榜，累计 ' + km(riderMileage + state.progress) + ' 公里。');
          break;
      }
    });
    renderStep();
  }

  window.mountRoadlinkTeam = mount;
})();
