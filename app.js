(function () {
  'use strict';

  function image(name, alt, small) {
    var file = 'assets/roadlink-' + name;
    return '<img src="' + file + '.webp"' +
      (small ? ' srcset="' + file + '-small.webp 720w, ' + file + '.webp 1280w" sizes="(max-width:760px) calc(100vw - 32px), 56vw"' : '') +
      ' width="1280" height="720" decoding="async" alt="' + alt + '">';
  }

  function panel(label, children, extra) {
    return '<div class="panel' + (extra ? ' ' + extra : '') + '"><span class="panel-label">' + label + '</span>' + children + '</div>';
  }

  function screen(label, main, sub) {
    return '<div class="screen"><span class="screen-caption">' + label + '</span><strong>' + main + '</strong><small>' + sub + '</small></div>';
  }

  function photo(name, alt, title, message, className) {
    return '<div class="photo-stage ' + (className || '') + '">' + image(name, alt, true) +
      '<div class="photo-message"><b>' + title + '</b><small>' + message + '</small></div></div>';
  }

  function routeMap(type, label, detail) {
    return '<div class="stage-width"><canvas class="device-canvas" width="720" height="246" data-map="' + type +
      '" role="img" aria-label="' + label + '"></canvas><div class="map-key"><strong>' + label +
      '</strong><span>' + detail + '</span></div></div>';
  }

  function bubbles(messages) {
    return '<div class="stage-width">' + messages.map(function (message) {
      return '<p class="bubble' + (message[2] ? ' answer' : '') + '"><small>' + message[0] + '</small>' + message[1] + '</p>';
    }).join('') + '</div>';
  }

  var scenes = [
    {
      name: '组队与车友社交', heading: '骑在一起，记住这一程', image: 'convoy',
      alt: '几名骑手沿林道保持间距骑行',
      lead: '见面就能组队，路上知道彼此在哪，骑完还能一起看轨迹、比里程、收照片。',
      features: [
        {
          name: '快速配对与位置共享', desc: '碰面加入车队，地图上看到队友。',
          explain: '两人相互确认后加入同一车队，并在骑行期间共享位置。',
          actions: [['确认配对', '两名车友已组队，地图同步两人的位置。']],
          show: function (step) { return routeMap(step ? 'paired' : 'waiting', step ? '车队位置已共享' : '等待附近车友确认', step ? '● 我　● 队友' : '我 · 集合点'); }
        },
        {
          name: '可编程外挂号牌', desc: '为车友设定醒目的编队号码。',
          explain: '在手机上设置编队号码，同步到外挂展示牌，队友一眼能认出彼此。',
          actions: [['同步新队号', '手机设置的 12 号已同步至编队展示牌。']],
          show: function (step) {
            return '<div class="feature-grid stage-width">' + screen('手机设置', '队号 12', step ? '已同步到外挂号牌' : '等待同步') +
              '<div class="panel ride-plate"><span class="panel-label">编队展示牌</span><strong class="plate-num">' + (step ? '12' : '07') + '</strong></div></div>';
          }
        },
        {
          name: 'F1 式里程排名', desc: '用累计里程排位，让每次骑行都算数。',
          explain: '榜单按累计骑行里程排位。完成一趟骑行，里程和名次就会重新计算。',
          actions: [['结算本次骑行 +42 km', '你的累计里程更新为 454 公里，升至第 2 位。']],
          show: function (step) {
            var rows = step ? [['阿岳','486 km'],['我','454 km'],['小程','438 km']] : [['阿岳','486 km'],['小程','438 km'],['我','412 km']];
            return '<table class="ranking"><thead><tr><th scope="col">排位</th><th scope="col">车友</th><th scope="col">累计里程</th></tr></thead><tbody>' +
              rows.map(function (row, i) { return '<tr' + (row[0] === '我' ? ' class="top-rank"' : '') + '><td>' + (i + 1) + '</td><td>' + row[0] + '</td><td>' + row[1] + '</td></tr>'; }).join('') +
              '</tbody></table>';
          }
        },
        {
          name: '骑行轨迹回放', desc: '沿路线回看集合、经过与到达。',
          explain: '骑完后按时间回看行程，知道一段画面或一次停靠发生在哪里。',
          actions: [['回放到途中', '光标沿轨迹来到林道入口。'], ['回放到终点', '这趟骑行抵达观景台。']],
          show: function (step) {
            return routeMap('replay-' + step, ['集合点','林道入口','观景台'][step], ['00:00 / 28:40','12:20 / 28:40','28:40 / 28:40'][step]);
          }
        },
        {
          name: '同伴接近，自动抓拍分享', desc: '留下会合瞬间，照片自动到车友手里。',
          explain: '双方开启抓拍分享后，识别到同伴接近时自动拍照，并把这张照片分享给对方。',
          actions: [['模拟同伴接近', '识别到同伴靠近，已抓拍并自动分享这张会合照片。']],
          show: function (step) {
            return step ? photo('team', '车友在观景台会合的概念照片', '会合瞬间已分享', '收件人：已配对的车友') :
              routeMap('paired','抓拍分享已开启','等待识别到同伴接近');
          }
        }
      ]
    },
    {
      name: '骑行显示与导航', heading: '下一步，抬眼就知道', image: 'hardware-visor',
      alt: '从头盔内看向前方山路',
      lead: '头盔留一句转向提醒，车把屏留完整路线，戴手套也能用按键切换。',
      features: [
        {
          name: '头盔内导航贴片', desc: '在视野一侧看到下一次转向。',
          explain: '贴片把转向方向和距离显示在视野一侧，骑手可以继续看前方路面。',
          actions: [['模拟接近路口', '头盔画面中的转向距离从 300 米更新为 80 米。']],
          show: function (step) {
            return photo('hardware-visor', '骑手视角内的头盔导航投影示意', '前方右转', step ? '80 m · 头盔内提示' : '300 m · 头盔内提示');
          }
        },
        {
          name: 'Glimpse 圆屏二次开发', desc: '给物理按键分配自己常用的动作。',
          explain: '拟以 Glimpse 圆屏为二次开发对象，让骑手为物理按键配置切页等动作。接口与适配待验证。',
          actions: [['给短按分配「切换页面」', '短按已配置为切页。'], ['模拟短按', '圆屏已由导航页切到车队页。']],
          show: function (step) {
            return '<div class="dual-control stage-width"><div class="screen round-screen"><span>圆屏样例</span><strong>' +
              (step === 2 ? '车队' : '导航') + '</strong><small>' + (step === 2 ? '两名车友' : '前方右转') + '</small></div>' +
              panel('物理按键映射', '<span class="physical-key">车把实体键</span><p>短按 · ' + (step ? '切换页面' : '待分配动作') + '</p>') + '</div>';
          }
        },
        {
          name: 'CarPlay 屏与 HUD', desc: '看全程用大屏，看下一步用抬头显示。',
          explain: 'CarPlay 屏承载完整路线，HUD（抬头显示）提炼眼下最重要的导航提示。实际联动需按设备适配。',
          actions: [['模拟进入导航', '车把屏保留完整路线，HUD 单独显示下一次转向。']],
          show: function (step) {
            var dashboard = step ? '<div class="screen"><span class="screen-caption">车把 · CarPlay 屏方案</span><strong>完整路线</strong>' +
              '<canvas class="device-canvas" width="380" height="144" data-map="guide" role="img" aria-label="车把屏中的示例路线"></canvas><small>观景台 · 剩余 8.4 km</small></div>' :
              screen('车把 · CarPlay 屏方案', '等待导航', '地图、路线与到达信息');
            return '<div class="feature-grid stage-width">' + dashboard +
              screen('HUD · 抬头显示', step ? '前方右转' : '等待提示', step ? '300 m' : '方向与距离') + '</div>';
          }
        }
      ]
    },
    {
      name: 'AI 交互与手机操控', heading: '手套戴着，手机也能帮忙', image: 'voice',
      alt: '骑手戴着手套握住车把',
      lead: '用小设备操作手机，让 AI 把微信里的要点读出来，回信由骑手确认后发出。',
      features: [
        {
          name: '戴手套操控手机', desc: '摸到实体键，AI 把意图交给手机执行。',
          explain: '戴着手套短按小设备唤醒 AI，说出指令，AI 把这条操作交给手机。',
          actions: [['模拟手套短按', 'AI 已唤醒，等待骑手指令。'], ['说「下一首」', 'AI 已解读指令，手机切换到下一首。']],
          show: function (step) { return '<div class="feature-grid stage-width">' +
            panel('手套可按的小设备', '<div class="physical-key">短按 · 唤醒 AI</div>') +
            screen('手机音频', ['当前曲目','AI 正在听','下一首'][step], ['等待实体键','请说出操作','已切换曲目'][step]) + '</div>'; }
        },
        {
          name: 'AI 总结微信', desc: '从几条群消息里提炼集合时间和地点。',
          explain: 'AI 把车友群的新消息整理成几条要点，骑手可以听到简短摘要。',
          actions: [['生成摘要', '摘要已提取集合时间、地点和出发前要做的事。']],
          show: function (step) {
            return bubbles(step ?
              [['AI 微信摘要','09:10 在山脚加油站集合。先补油，再一起出发。',true]] :
              [['车友群 · 阿岳','09:10 集合。'],['车友群 · 小程','在山脚加油站碰面。'],['车友群 · 阿岳','大家先补油再出发。']]);
          }
        },
        {
          name: 'AI 拟稿并代发微信', desc: '说一句需求，确认拟稿后发送。',
          explain: '骑手说出想传达的内容，AI 拟成消息并展示给骑手确认。',
          actions: [['让 AI 拟稿', 'AI 已拟好消息，等待骑手确认。'], ['确认模拟发送', '模拟微信消息已发送给车友群。']],
          show: function (step) {
            var messages = [['骑手指令','告诉群里我会晚到十分钟。']];
            if (step) messages.push([step === 2 ? '车友群 · 模拟已发送' : 'AI 拟稿 · 等待确认','我会晚到十分钟，你们先在加油站等我。',true]);
            return bubbles(messages);
          }
        }
      ]
    },
    {
      name: '安全与主动预警', heading: '风险出现，提醒提前一步', image: 'guard',
      alt: '暮色路面上摩托车与前方车辆保持间距',
      lead: '前后车况都能提示，异常时提醒骑手；检测到疑似摔车，可发出带位置的求救。',
      features: [
        {
          name: '头盔后部减速提示灯', desc: '减速时亮起，让后车更容易看到。',
          explain: '检测到减速时，头盔后部的提示灯亮起，让后方车友看见前车正在减速。',
          actions: [['模拟减速', '头盔后部亮红灯，提醒后车。']],
          show: function (step) {
            return photo('helmet', '后部带小型红色减速提示灯的头盔概念图', step ? '减速提示灯亮起' : '减速灯待命',
                         step ? '后方车友看到红色提示' : '等待检测到减速', step ? 'braking' : 'light-standby');
          }
        },
        {
          name: '后视摄像头', desc: '在前方屏幕看到后方车道情况。',
          explain: '打开后视画面，检查后方车辆是否靠近。',
          actions: [['打开模拟后视画面', '后视画面已显示后方一辆车。']],
          show: function (step) {
            return '<div class="camera-road stage-width"><span class="panel-label">' + (step ? '后视摄像头 · 画面示意' : '后视摄像头待启用') +
              '</span>' + (step ? '<div class="car-shape" aria-hidden="true"></div><small>后方有一辆车</small>' : '<small>点下方按钮查看</small>') + '</div>';
          }
        },
        {
          name: '摔车监测与自动求救', desc: '疑似摔车且无人取消时发出求救。',
          explain: '监测到疑似摔车后先留出取消时间。超时无人回应时，把位置与事件信息自动发给预设紧急联系人。',
          actions: [['模拟检测到摔车', '求救确认窗口已出现。'], ['模拟超时无人回应', '系统自动把模拟求救包发给预设联系人。']],
          show: function (step) {
            return '<div class="stage-width">' + panel(['监测状态','疑似摔车','模拟求救已发送'][step],
              '<p>' + ['正常骑行 · 持续监测','等待骑手取消，超时将自动发出','紧急联系人已收到位置与疑似摔车事件'][step] + '</p>', step ? 'risk-panel' : '') + '</div>';
          }
        },
        {
          name: '疲劳检测与提醒', desc: '发现疲劳迹象时提示休息。',
          explain: '识别到可能的疲劳迹象后，把休息提醒送给骑手，骑手可在安全地点停车。',
          actions: [['模拟检测到疲劳迹象', '显示休息提醒，请选安全地点停车。']],
          show: function (step) {
            return '<div class="stage-width">' + screen('骑行状态', step ? '找安全地点休息' : '持续观察状态', step ? '发现可能的疲劳迹象' : '等待状态变化') + '</div>';
          }
        },
        {
          name: '安全车距预警', desc: '跟车太近时提醒拉开距离。',
          explain: '系统监测与前车的距离变化，距离过近时提醒骑手注意留出空间。',
          actions: [['模拟前车距离缩短', '显示车距过近提醒。']],
          show: function (step) {
            return '<div class="camera-road stage-width"><span class="panel-label">前方车道 · 车距示意</span>' +
              '<div class="car-shape' + (step ? ' close' : '') + '" aria-hidden="true"></div><strong>' +
              (step ? '跟车过近 · 请留出空间' : '前车距离稳定') + '</strong></div>';
          }
        }
      ]
    },
    {
      name: '骑行社区', heading: '骑完了，故事还能继续', image: 'riderclub',
      alt: '车友停好车后在观景点讨论骑行路线',
      lead: '来社区找路线、问问题、看自己的骑行积累，也可以发一张 AI 改装构思和车友聊。',
      features: [
        {
          name: '大冰数字人在线问答', desc: '社区提问，数字人提供回复。',
          explain: '拟接入大冰数字人回复社区常见问题。这里用示例问答展示交互方式。',
          actions: [['查看数字人示例回复', '示例回复已显示，可继续查看社区路线攻略。']],
          show: function (step) {
            var messages = [['车友提问','第一次跟队，出发前要问清哪些事？']];
            if (step) messages.push(['大冰数字人 · 概念回复示例','先问清集合点、路线难度和补给安排，确认掉队时在哪里重新集合。',true]);
            return bubbles(messages);
          }
        },
        {
          name: '路线攻略分享', desc: '把路线、补给和难度装进一张攻略。',
          explain: '车友分享路线攻略，后来的人能在出发前浏览路线与关键停靠点。',
          actions: [['打开分享的攻略', '已查看示例路线、路面与补给信息。']],
          show: function (step) { return step ? routeMap('guide','周末山路环线 · 示例','约 86 km · 铺装路 · 中途加油') :
            '<div class="stage-width">' + panel('车友分享', '<strong>周末山路环线</strong><p>一张路线卡，带你找到观景台和补给点。</p>') + '</div>'; }
        },
        {
          name: '个人骑行数据总结', desc: '把每一趟骑行汇成一份个人周报。',
          explain: '把已记录的骑行次数、总里程和主要路线汇总成周报。',
          actions: [['生成本周总结', '示例周报已显示本周骑行次数、里程和主要路线。']],
          show: function (step) {
            return '<div class="stage-width">' + panel('个人骑行周报', step ?
              '<div class="metric-row"><strong>3 次</strong><strong>128 km</strong></div><p>主要路线 · 山路环线</p>' :
              '<p>汇总本周记录的骑行数据</p>') + '</div>';
          }
        },
        {
          name: '机车 AI 改装娱乐社区', desc: '试出一版外观构思，发到社区一起讨论。',
          explain: '上传机车照片后生成虚拟外观构思，保存为社区改装帖草稿。',
          actions: [['生成冰川蓝风格预览', '已生成机车外观风格示意。'], ['保存为社区草稿', '改装构思已保存为示例草稿。']],
          show: function (step) {
            return '<div class="stage-width color-demo"><figure>' + image('rescue','车友的机车外观照片',true) +
              '<figcaption>原车照片</figcaption></figure><figure class="' + (step ? 'concept' : '') + '">' +
              (step ? image('rescue','冷蓝色调的机车虚拟风格示意',true) : '<div class="camera-road"><span>等待生成预览</span></div>') +
              '<figcaption>' + (step === 2 ? '冰川蓝风格 · 改装帖草稿' : (step ? 'AI 风格概念 · 冰川蓝' : 'AI 外观构思')) + '</figcaption></figure></div>';
          }
        }
      ]
    }
  ];

  function drawMap(canvas, animate) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var mode = canvas.dataset.map;
    var route = [[52,178],[120,149],[188,159],[250,135],[299,86],[355,69],[412,98],[468,144],[530,135],[568,92],[638,72],[674,52]];
    var replay = mode.indexOf('replay-') === 0;
    var index = replay ? [0,5,11][Number(mode.slice(-1))] : (mode === 'guide' ? 11 : 3);
    ctx.setTransform(canvas.width / 720,0,0,canvas.height / 246,0,0);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    function paint(progress) {
      ctx.clearRect(0,0,720,246);
      ctx.beginPath();
      route.forEach(function (point, i) { i ? ctx.lineTo(point[0], point[1]) : ctx.moveTo(point[0], point[1]); });
      ctx.strokeStyle = '#446571';
      ctx.lineWidth = 7;
      ctx.stroke();
      var base = Math.floor(progress), fraction = progress - base;
      var left = route[base], right = route[Math.min(base + 1,route.length - 1)];
      var current = [left[0] + (right[0] - left[0]) * fraction,left[1] + (right[1] - left[1]) * fraction];
      ctx.beginPath();
      route.slice(0,base + 1).forEach(function (point, i) { i ? ctx.lineTo(point[0],point[1]) : ctx.moveTo(point[0],point[1]); });
      ctx.lineTo(current[0],current[1]);
      ctx.strokeStyle = '#a0e4ed';
      ctx.lineWidth = 4;
      ctx.stroke();
      var points = mode === 'paired' || mode === 'guide' ? [current,route[6]] : [current];
      points.forEach(function (point, j) {
        ctx.beginPath();
        ctx.arc(point[0],point[1],11,0,Math.PI * 2);
        ctx.fillStyle = j ? '#9ce1ec' : '#f9d251';
        ctx.fill();
        ctx.strokeStyle = '#182229';
        ctx.lineWidth = 3;
        ctx.stroke();
      });
    }
    if (animate && replay && index > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var from = index === 5 ? 0 : 5, start = performance.now();
      function frame(now) {
        if (!canvas.isConnected) return;
        var progress = Math.min(1,(now - start) / 540);
        paint(from + (index - from) * progress);
        if (progress < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    } else {
      paint(index);
    }
  }

  var root = document.getElementById('main-content');
  var nav = Array.from(document.querySelectorAll('#scene-nav a'));
  var sceneIndex = -1, featureIndex = 0, step = 0;
  var demo, buttons, boardTitle, visual, explainer, advance, status;

  function renderFeature(announce) {
    var feature = scenes[sceneIndex].features[featureIndex];
    boardTitle.textContent = feature.name;
    explainer.textContent = feature.explain;
    visual.innerHTML = feature.show(step);
    visual.classList.toggle('is-photo', Boolean(visual.querySelector('.photo-stage')));
    drawMap(visual.querySelector('canvas'), announce);
    visual.classList.remove('enter');
    if (announce) {
      void visual.offsetWidth;
      visual.classList.add('enter');
    }
    buttons.forEach(function (button, index) { button.setAttribute('aria-pressed', String(index === featureIndex)); });
    advance.textContent = step === feature.actions.length ? '重新体验' : feature.actions[step][0];
    status.textContent = announce && step ? feature.actions[step - 1][1] : '';
  }

  function showScene(index, focus) {
    var scene = scenes[index];
    sceneIndex = index;
    featureIndex = 0;
    step = 0;
    document.title = scene.name + ' · ROADLINK';
    nav.forEach(function (link, i) { if (i === index) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current'); });
    root.innerHTML = '<section class="scene-hero" aria-labelledby="scene-heading"><div>' +
      '<p class="scene-name">' + scene.name + '</p><h1 id="scene-heading" tabindex="-1">' + scene.heading + '</h1>' +
      '<p class="scene-lead">' + scene.lead + '</p><button type="button" class="primary" id="jump">上手体验 <span aria-hidden="true">↓</span></button></div>' +
      '<figure class="hero-photo">' + image(scene.image,scene.alt,true) + '</figure></section>' +
      '<section class="explore" id="experience" aria-labelledby="experience-title"><h2 id="experience-title" tabindex="-1">选一项，看看怎么用</h2>' +
      '<div class="demo-layout"><div class="feature-list" role="group" aria-label="本场景的功能">' +
      scene.features.map(function (feature,i) {
        return '<button type="button" class="feature-button" data-feature="' + i + '" aria-pressed="false"><strong>' + feature.name + '</strong><small>' + feature.desc + '</small></button>';
      }).join('') +
      '</div><article class="board" aria-labelledby="board-title"><header class="board-heading"><h3 id="board-title"></h3><span>概念演示</span></header>' +
      '<div class="board-visual" id="board-visual"></div><div class="board-copy"><p id="board-explain"></p>' +
      '<div class="board-controls"><button type="button" class="primary" id="advance"></button><span class="board-result" id="board-result" role="status"></span></div></div></article></div></section>' +
      '<nav class="pager" aria-label="相邻场景">' + (index ? '<a href="#/s' + index + '">← ' + scenes[index - 1].name + '</a>' : '<span></span>') +
      (index < scenes.length - 1 ? '<a href="#/s' + (index + 2) + '">' + scenes[index + 1].name + ' →</a>' : '<a href="#/s1">返回组队与车友社交 ↗</a>') + '</nav>';
    demo = document.getElementById('experience');
    buttons = Array.from(demo.querySelectorAll('.feature-button'));
    boardTitle = document.getElementById('board-title');
    visual = document.getElementById('board-visual');
    explainer = document.getElementById('board-explain');
    advance = document.getElementById('advance');
    status = document.getElementById('board-result');
    renderFeature(false);
    buttons.forEach(function (button, i) {
      button.addEventListener('click',function () {
        if (featureIndex === i) return;
        featureIndex = i;
        step = 0;
        renderFeature(true);
      });
    });
    advance.addEventListener('click',function () {
      var actions = scene.features[featureIndex].actions;
      step = step === actions.length ? 0 : step + 1;
      renderFeature(true);
    });
    document.getElementById('jump').addEventListener('click',function () {
      document.getElementById('experience-title').focus({preventScroll:true});
      demo.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    });
    window.scrollTo(0,0);
    if (focus) document.getElementById('scene-heading').focus({preventScroll:true});
  }

  function route(event) {
    var match = location.hash.match(/^#\/s([1-5])$/);
    var index = match ? Number(match[1])-1 : 0;
    if (!match) history.replaceState(null,'','#/s1');
    if (index !== sceneIndex) showScene(index,Boolean(event));
  }

  window.addEventListener('hashchange',route);
  document.querySelector('.skip-link').addEventListener('click',function (event) {
    event.preventDefault();
    document.getElementById('scene-heading').focus();
  });
  route();
})();
