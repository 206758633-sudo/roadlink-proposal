(function () {
  'use strict';

  var destinations = [
    { name: '松林观景台', distance: '8.4 km', next: '300 米后右转', route: [[44,152],[100,129],[160,135],[210,102],[253,116],[290,76],[348,63],[395,34]] },
    { name: '山脚补给站', distance: '4.2 km', next: '400 米后左转', route: [[44,152],[105,147],[138,95],[193,101],[227,67],[280,89],[334,73],[395,108]] }
  ];
  var stages = [
    { label: '见面组队', title: '两位车友，面对面建队', copy: '骑手已登录 APP，手机提供联网、GPS 与蓝牙。确认附近车友后，群里就能看到双方的身份和设备。' },
    { label: '定目的地', title: '在群里选一个终点', copy: '选择集合后的共同目的地。手机用自己的定位和联网能力生成导航路线。' },
    { label: '共享位置', title: '从地图上看到队友', copy: '车友开启车队位置共享后，手机地图同时显示自己、队友和正在走的路线。' },
    { label: '同步车载屏', title: '把手机的导航画面带到车把上', copy: '手机通过蓝牙下发导航与队友位置。ESP32 接收并显示手机提供的信息。' },
    { label: '下发电子号牌', title: '把名字、号码或队徽亮出来', copy: '在 APP 写入号码、骑手姓名，或选择车队 Logo。ESP32 将内容转发到三防电子墨水屏。' },
    { label: '骑完看里程', title: '骑完回群里看里程', copy: '手机记录这一趟的 GPS 里程。骑行结束后，群内排行榜按累计里程更新。' }
  ];
  var initial = { stage: 0, completed: 0, destination: 0, movement: 0, number: '07', rider: '陈默', plate: 'identity' };

  function escapeText(value) {
    return String(value).replace(/[&<>"']/g,function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function mapMarkup(forCar) {
    return '<canvas class="team-map" width="430" height="185" role="img" aria-label="' +
      (forCar ? 'ESP32 上同步的导航路线和队友位置' : '手机生成的路线和车队位置') + '"></canvas>';
  }

  function draw(canvas, state) {
    var context = canvas.getContext('2d');
    if (!context) return;
    var route = destinations[state.destination].route;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    route.forEach(function (point,i) { i ? context.lineTo(point[0],point[1]) : context.moveTo(point[0],point[1]); });
    context.lineWidth = 12;
    context.strokeStyle = '#213e45';
    context.stroke();
    context.lineWidth = 5;
    context.strokeStyle = '#8cdde2';
    context.stroke();

    var self = route[Math.min(state.movement,route.length - 3)];
    var teammate = state.completed >= 3 ? route[Math.min(state.movement + 2,route.length - 2)] : null;
    var end = route[route.length - 1];
    var marks = [{point:end,color:'#cbd4d5'},{point:self,color:'#ffd453'}];
    if (teammate) marks.push({point:teammate,color:'#9de0f1'});
    marks.forEach(function (mark) {
      context.beginPath();
      context.arc(mark.point[0],mark.point[1],8,0,Math.PI * 2);
      context.strokeStyle = '#142327';
      context.lineWidth = 3;
      context.fillStyle = mark.color;
      context.fill();
      context.stroke();
    });
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
    var header = '<div class="team-device-header"><strong>手机 APP</strong><span>示例账号 · 陈默</span></div>';
    var services = '<div class="team-tags"><span>已登录</span><span>手机联网</span><span>手机 GPS</span><span>蓝牙已配对</span></div>';
    if (state.stage === 0) {
      return header + services + '<div class="team-device-body">' +
        (connected ? '<b>松林骑队 · 2 人</b>' + members() :
          '<b>附近发现同款设备</b><ul class="team-members"><li><i>岳</i><span><strong>阿岳</strong><small>APP 已登录 · 同款 ESP32</small></span></li></ul>') + '</div>';
    }
    if (state.stage === 5) {
      var finished = state.completed === 6;
      return header + '<div class="team-device-body"><b>松林骑队 · 累计里程</b>' +
        '<p class="team-device-note">' + (finished ? '本次 42 km 已记入' : '本次骑行记录 · 42 km，待结算') + '</p>' +
        '<ol class="team-rank">' +
        (finished ? '<li class="mine"><span>陈默 · 我</span><b>454 km</b></li><li><span>阿岳</span><b>438 km</b></li>' :
          '<li><span>阿岳</span><b>438 km</b></li><li class="mine"><span>陈默 · 我</span><b>412 km</b></li>') + '</ol></div>';
    }
    return header + services + '<div class="team-device-body"><b>松林骑队 · 2 人</b>' +
      (hasRoute ? '<p class="team-device-note">群目的地 · ' + dest.name + ' · ' + dest.distance + '</p>' + mapMarkup(false) + legend(state) :
        '<p class="team-device-note">等待选择共同目的地</p>' + members()) + '</div>';
  }

  function legend(state) {
    return '<div class="team-map-key"><span><i></i>我</span>' +
      (state.completed >= 3 ? '<span><i></i>队友</span>' : '') + '<span><i></i>终点</span></div>';
  }

  function esp(state) {
    var ready = state.completed >= 4, dest = destinations[state.destination];
    return '<div class="team-device-header"><strong>ESP32 车载屏</strong><span>接收并显示</span></div>' +
      '<div class="team-esp-screen">' +
      (ready ? '<b>' + dest.next + '</b>' + mapMarkup(true) + legend(state) + '<p class="team-device-note">手机已下发 · ' + dest.name + '</p>' :
        '<div class="team-standby"><b>等待手机同步</b><small>将显示导航路线与队友位置</small></div>') + '</div>';
  }

  function plate(state) {
    var synced = state.completed >= 5;
    return '<div class="team-device-header"><strong>三防电子墨水屏</strong><span>由 ESP32 转发</span></div>' +
      '<div class="team-ink-screen">' +
      (!synced ? '<div class="team-standby"><b>等待写入</b><small>队号、姓名或车队 Logo</small></div>' :
        (state.plate === 'logo' ? '<div class="team-ink-logo" aria-hidden="true"></div><strong>松林骑队</strong>' :
          '<strong class="team-plate-number">' + escapeText(state.number) + '</strong>' +
          '<span>' + escapeText(state.rider) + '</span>')) + '</div>';
  }

  function mount(root) {
    var state = Object.assign({},initial);
    root.innerHTML =
      '<div class="team-intro"><div><h2 id="team-title" tabindex="-1">跟着一趟骑行，走完组队流程</h2>' +
      '<p>选任一步体验，也可以按顺序走完整趟。</p></div><span>概念演示 · 示例数据</span></div>' +
      '<div class="team-steps" role="group" aria-label="组队流程步骤">' +
      stages.map(function (stage,index) {
        return '<button type="button" class="team-step"><span aria-hidden="true">0' + (index + 1) + '</span>' + stage.label + '</button>';
      }).join('') + '</div>' +
      '<div class="team-action"><div><h3 id="team-stage-title"></h3><p id="team-stage-copy"></p></div>' +
      '<form class="team-form" id="team-form"><div class="team-fields"></div><div class="team-actions">' +
      '<button type="submit" class="primary" id="team-do"></button>' +
      '<button type="button" class="secondary" id="team-logo" hidden>下发车队 Logo</button>' +
      '<button type="button" class="secondary" id="team-next" hidden>下一步 →</button>' +
      '<button type="button" class="team-reset" id="team-reset">重置演示</button></div></form>' +
      '<p class="team-result" role="status"></p></div>' +
      '<ol class="team-signal" aria-label="信息流"><li><b>手机 APP</b><span>联网、定位、处理信息</span></li>' +
      '<li><b>蓝牙 → ESP32</b><span>显示导航和队友</span></li><li><b>ESP32 → 电子墨水屏</b><span>显示队号、姓名或队徽</span></li></ol>' +
      '<div class="team-devices"><article class="team-device team-phone"></article>' +
      '<article class="team-device team-esp"></article><article class="team-device team-plate"></article></div>';

    var find = function (selector) { return root.querySelector(selector); };
    var steps = Array.from(root.querySelectorAll('.team-step'));
    var fields = find('.team-fields'), primary = find('#team-do');
    var next = find('#team-next'), logo = find('#team-logo'), result = find('.team-result');

    function renderPanels() {
      find('.team-phone').innerHTML = phone(state);
      find('.team-esp').innerHTML = esp(state);
      find('.team-plate').innerHTML = plate(state);
      find('.team-devices').dataset.focus = state.stage === 4 ? 'plate' : (state.stage === 3 ? 'esp' : 'phone');
      root.querySelectorAll('.team-map').forEach(function (canvas) { draw(canvas,state); });
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
    }

    function renderStep() {
      var stage = stages[state.stage];
      steps.forEach(function (button,i) { button.setAttribute('aria-pressed',String(i === state.stage)); });
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

    function finish(message) {
      var moveFocus = document.activeElement === primary;
      state.completed = Math.max(state.completed,state.stage + 1);
      renderControls();
      renderPanels();
      result.textContent = message;
      if (moveFocus && primary.disabled) {
        (next.hidden ? find('#team-reset') : next).focus({ preventScroll:true });
      }
    }

    steps.forEach(function (button,index) { button.addEventListener('click',function () { showStage(index); }); });
    next.addEventListener('click',function () {
      showStage(state.stage + 1);
      steps[state.stage].focus({ preventScroll:true });
    });
    find('#team-reset').addEventListener('click',function () {
      state = Object.assign({},initial);
      renderStep();
      steps[0].focus({ preventScroll:true });
    });
    logo.addEventListener('click',function () {
      state.plate = 'logo';
      finish('手机把松林骑队 Logo 发给 ESP32，墨水屏已刷新为队徽。');
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
            state.movement = (state.movement + 1) % 5;
            finish(state.completed >= 4 ? '手机 GPS 位置更新，ESP32 屏幕同步显示。' : '队友位置已在手机地图更新。');
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
          state.plate = 'identity';
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
