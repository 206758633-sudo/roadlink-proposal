(() => {
  'use strict';
  if (new URLSearchParams(location.search).get('embed') !== 'scene' || window.parent === window) return;

  const origin = location.protocol === 'file:' ? '*' : location.origin;
  const plainView = redraw;
  const originalActiveGroup = activeGroup;
  let context = null;
  let follow = true;
  let expectedPage = readPage();
  let crewMap = null;

  function send(action) {
    window.parent.postMessage({type:'roadlink-phone-action',action}, origin);
  }

  function syncButton(label, id, glyph='arrow-right') {
    return `<button class="btn primary" type="button" data-scene-action="${id}">${icon(glyph)}${esc(label)}</button>`;
  }

  function followButton(){
    return `<button class="text-btn" type="button" data-scene-action="follow">${icon("arrows-merge")}返回演示画面</button>`;
  }

  function box(title, body, style='info') {
    return `<div class="${style}"><h3>${esc(title)}</h3><p class="small">${esc(body)}</p></div>`;
  }

  function routeMap(route, point='') {
    return `<div class="panel scene-map">
      <div class="map">
        <canvas role="img" data-map="${esc(route.id)}" data-active="false" aria-label="${esc(route.name)}演示路线"></canvas>
        <span class="map-watermark">模拟定位</span>
      </div>
      <div class="map-key"><span><i class="dot lime"></i>骑行路线</span><span><i class="dot regroup"></i>${esc(point || route.supply)}</span></div>
    </div>`;
  }

  const crewRoute = {id:'site-crew', name:'康定 → 新都桥', near:'川西摩旅', km:76, start:'康定', supply:'镇口加油站', end:'新都桥', offset:2};
  const homeRoute = {id:'site-home', name:'松林观景台', near:'松林骑队', km:8.4, start:'陈默 · 我', supply:'途中集合点', end:'松林观景台', offset:1};
  routes.push(crewRoute, homeRoute);
  activeGroup = function () {
    if (follow && context?.kind==='crew') {
      return {id:'site-crew-live',route:crewRoute.id,title:'新都桥骑行小队',owner:'老王',
        lead:'康定集合点',members:context.count,cap:5};
    }
    return originalActiveGroup();
  };

  function crewMiniMap(c) {
    return `<div class="panel scene-map">
      <div class="map">
        <svg class="scene-crew-map" viewBox="62 41 615 234" role="img" aria-label="与路演同步的队员位置示意">
          <path d="M62 211Q132 186 190 231T298 189T415 165T519 185T683 127"
            fill="none" stroke="#32483b" stroke-width="13"/>
          <path d="${esc(c.route)}" fill="none" stroke="#151d16" stroke-width="13"/>
          <path d="${esc(c.route)}" fill="none" stroke="#d9fb52" stroke-width="5"/>
          <text x="99" y="267">康定</text><text x="593" y="61">新都桥</text>
          ${c.riders.map((rider,i)=>`<circle data-site-rider="${i}" r="8" stroke="#172417" stroke-width="3" fill="${['#d9fb52','#ffdc81','#9bc6fc','#ddabde','#ffad81'][i]}" hidden><title>${esc(rider)}</title></circle>`).join('')}
          <g class="scene-map-pin" hidden><circle r="13" fill="#ffb574" stroke="#382c20" stroke-width="2"/><text y="5" text-anchor="middle"></text></g>
        </svg>
        <span class="map-watermark">模拟定位</span>
      </div>
      <div class="map-key"><span><i class="dot lime"></i>骑行路线</span><span><i class="dot regroup"></i>${c.stage>=5?'最近集合点 · 镇口加油站':'补给 · 镇口加油站'}</span></div>
    </div>`;
  }

  function paintCrewPositions() {
    const map=screen.querySelector('.scene-crew-map');
    if (!map || !crewMap) return;
    map.querySelectorAll('[data-site-rider]').forEach(marker=>{
      const point=crewMap.points[Number(marker.dataset.siteRider)];
      marker.toggleAttribute('hidden',!point);
      if(point){marker.setAttribute('cx',point[0]);marker.setAttribute('cy',point[1]);}
    });
    const pin=map.querySelector('.scene-map-pin');
    pin.toggleAttribute('hidden',!crewMap.pin);
    if(crewMap.pin) {
      const [x,y,text]=crewMap.pin;
      pin.setAttribute('transform',`translate(${x} ${y})`);
      pin.querySelector('text').textContent=text;
    }
  }

  function crewView(c) {
    const rank = c.stage===7 && c.arrived;
    const heading = rank ? '骑行总览' : '组队骑行';
    const tabs = c.stage<3 ? '附近组队' : rank ? '最近一次骑行' : '当前车队';
    if (rank) {
      return `${pageHead(heading,'川西摩旅行程已完成')}
        <div class="stack">
          <div class="hero scene-hero">${picture('crew','队友完成骑行')}<div class="hero-flag">${tag(tabs,'',true)}</div>
          <div class="hero-content"><div><b class="metric">76</b> <span class="unit">km</span></div><h2>康定 → 新都桥</h2><p>5 人同行 · 全员已抵达</p></div></div>
          ${box(c.title,c.detail)}
          ${syncButton(c.button,'crew-next','flag-checkered')}
        </div>`;
    }

    if (c.stage<3) {
      return `${pageHead(heading,'搜索附近路线，申请加入车队',tag('申请制','good'))}
      <div class="stack">
        <div class="row">${tag(tabs,'good')}${tag('康定集合点')}</div>
        <section class="group-card panel">
          <div class="row spread"><h3>新都桥骑行小队</h3>${tag(c.stage===0?'附近发布':c.stage===1?'已发布':'审批中',c.stage===2?'warn':'good')}</div>
          <p class="muted small">康定 → 新都桥 · 川西摩旅</p>
          <div class="statlines"><span>${icon('road-horizon')}76 km</span><span>${icon('users-three')}${c.count} / 5</span></div>
          ${box(c.title,c.detail)}
          ${syncButton(c.button,'crew-next','users-three')}
        </section>
        ${c.stage>0 ? `<div class="panel pad"><h3>已加入的车友</h3><p class="muted small">${esc(c.riders.join(' · '))}</p></div>` : ''}
      </div>`;
    }

    const warning=c.stage===4||c.stage===5;
    return `${pageHead(heading,'车队位置、首尾距离和沿途补给')}
    <div class="stack">
      <section class="panel">
        <div class="pad row spread"><div><h2>康定 → 新都桥</h2><p class="muted small">当前车队 · 76 km</p></div>${tag(c.stage===7?'接近终点':warning?'需留意':'模拟行驶中',warning?'warn':'good',true)}</div>
        ${crewMiniMap(c)}
        <div class="team-status">
          <div><b class="accent">5</b><small>车队成员</small></div>
          <div><b>${esc(c.distance)}</b><small>首尾距离</small></div>
          <div><b>${esc(c.location)}</b><small>${c.stage>=5?'最近集合点':'计划终点'}</small></div>
        </div>
        <div class="segment">${box(c.title,c.detail,warning?'info alert':'info')}</div>
        <div class="segment row wrap">${syncButton(c.button,'crew-next')}${action('队内语音','voice',{},'btn','microphone')}</div>
      </section>
      <section class="panel pad"><h2>路线与补给</h2>${routeStops(crewRoute,'康定集合点')}</section>
    </div>`;
  }

  function homeView(c) {
    return `${pageHead('路线图','手机与车把圆屏同步导航')}
    <div class="stack">
      <section class="panel">
        <div class="pad row spread"><div><h2>松林观景台</h2><p class="small muted">8.4 km · 约 18 分钟</p></div>${tag(c.navigation?'导航中':'待导航',c.navigation?'good':'')}</div>
        ${routeMap(homeRoute,c.shared?'队友阿岳共享位置中':'松林观景台')}
        <div class="segment">
          ${c.navigation ? box(c.turn.distance+' · '+c.turn.tip,'同步至圆屏与头盔贴片') : box('路线已规划','开启导航后显示下一路口')}
        </div>
        <div class="segment row wrap">
          ${syncButton(c.navigation?'结束导航':'开始导航','home-navigation','map-pin')}
          ${c.navigation ? syncButton('模拟下一路口','home-next') : ''}
        </div>
      </section>
      <section class="panel pad stack"><h3>松林骑队 · 阿岳</h3>
        ${syncButton(c.shared?'停止位置共享':'开启位置共享','home-share','users-three')}
      </section>
    </div>`;
  }

  const openFeature = {
    ranking:()=>action('查看完整榜单','rank',{},'btn primary','trophy'),
    trajectory:()=>action('查看最近骑行路线','open-route',{id:'miaofeng'},'btn primary','map-trifold'),
    capture:()=>action('打开同行抓拍','open-ai',{id:'capture'},'btn primary','aperture'),
    glove:()=>action('试试相机语音指令','open-ai',{id:'camera',voice:'yes'},'btn primary','microphone'),
    wechat:()=>action('打开微信助手','open-ai',{id:'wechat'},'btn primary','chats-circle'),
    dabing:()=>action('与大冰对话','guide',{},'btn primary','chats-circle'),
    routes:()=>action('查看附近骑行路线','route-tab',{id:'nearby'},'btn primary','map-trifold')
  };

  function featureView(c) {
    const quick = openFeature[c.feature]?.(c);
    const related = c.feature==='dabing' || c.feature==='tuning' ? '骑行社区' :
      {ride:'骑行总览',ai:'AI 驾驶舱',routes:'路线图',me:'我的'}[c.page] || '骑行 App';
    const detail = c.feature==='wechat' && c.phase===2 ? 'AI 已生成回复草稿。可在微信助手确认后模拟发送。' : c.detail;
    const footer = c.feature==='capture' && c.phase===2 ? `<figure class="media-preview">${picture('capture','同行抓拍样张')}</figure>` : '';
    return `<section class="scene-card panel stack pad" aria-label="当前演示内容">
      <div class="row spread">${tag(related,'good')}${tag('演示联动')}</div>
      <div><h2>${esc(c.headline)}</h2><p class="muted small">${esc(detail)}</p></div>
      ${c.metrics.length ? `<div class="scene-metrics">${c.metrics.map(([label,value])=>
        `<div><span class="muted tiny">${esc(label)}</span><b>${esc(value)}</b></div>`).join('')}</div>` : ''}
      ${footer}
      ${quick || ''}
    </section>`;
  }

  redraw = function () {
    plainView();
    if (!context || !follow || ui.page!==expectedPage) {
      if(context) screen.insertAdjacentHTML('afterbegin', followButton());
      return;
    }
    if (context.kind==='crew' || context.kind==='home') {
      screen.innerHTML=context.kind==='crew' ? crewView(context) : homeView(context);
      requestMaps();
      if(context.kind==='crew') paintCrewPositions();
    } else {
      const heading=screen.querySelector('.page-head');
      heading?.insertAdjacentHTML('afterend',featureView(context));
    }
  };

  function update(next){
    const previousPage=expectedPage;
    context=next;
    expectedPage=next.page;
    if (!follow) return;
    if(next.feature==='dabing') ui.communityTab='guide';
    if(ui.page!==expectedPage) {
      if(sheet.open) sheet.close();
      history.replaceState(history.state,"","#"+expectedPage);
      changePage();
    } else if(previousPage!==expectedPage || !sheet.open) redraw();
  }

  document.addEventListener('click',event=>{
    const btn=event.target.closest('[data-scene-action]');
    if(btn){
      const id=btn.dataset.sceneAction;
      if(id==='follow'){follow=true;update(context);}
      else send(id);
      return;
    }
    const anchor=event.target.closest('#nav a, .logo');
    if(anchor){
      const target=anchor.getAttribute('href')?.slice(1);
      if(target===expectedPage && follow && context){
        event.preventDefault();
        follow=false;
        redraw();
      }else if(target!==expectedPage){
        follow=false;
      }
    }
    const native=event.target.closest('.scene-card [data-action]');
    if(native?.dataset.action==='route-tab'){follow=false;}
  },true);

  window.addEventListener('message',event=>{
    if(event.source!==window.parent || (origin!=='*' && event.origin!==origin)) return;
    if(event.data?.type==='roadlink-scene') update(event.data.context);
    else if(event.data?.type==='roadlink-scene-map'){
      crewMap=event.data.map;
      paintCrewPositions();
    }
  });

  document.documentElement.classList.add('scene-embedded');
  window.parent.postMessage({type:'roadlink-phone-ready'},origin);
})();
