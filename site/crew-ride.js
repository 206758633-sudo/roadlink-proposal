window.mountCrewRide = function (root, asset, speak) {
  'use strict';
  const imageUrl = name => new URL(asset(name), document.baseURI).href;
  const chapters = [
    ['碰面','康定集合点','寻找附近组队',5], ['发布路线','发布康定 → 新都桥','发起车队',5],
    ['申请入队','车队集合','领骑审核申请',7], ['一起出发','队伍出发','全队导航',7],
    ['前车标危险','前方有碎石','共享路况',6], ['有人掉队','队尾距离拉开','队尾提醒',6],
    ['约集合点','镇口加油站','途中会合',8], ['抵达终点','抵达新都桥','行程记录',6]
  ];
  const riders = ['我','老王','阿哲','小林','老周'];
  const colors = ['#ffcf60','#8ce0cc','#9bc6fc','#ddabde','#ffad81'];
  const seconds = chapters.map(c=>c[3]);
  const starts = seconds.map((_,i)=>seconds.slice(0,i).reduce((a,b)=>a+b,0));
  const total = seconds.reduce((a,b)=>a+b);
  const route = 'M108 244 C132 252 150 260 169 238 S188 212 218 215 S255 222 268 193 S302 156 320 168 S348 191 367 168 S393 128 414 137 S452 154 467 128 S492 103 522 111 S550 121 568 96 S593 73 623 75';
  const dot = (i)=>`<g class="ride-marker" data-person="${i}"><circle r="9" fill="#102422" stroke="${colors[i]}" stroke-width="1.7"/><circle r="4" fill="${colors[i]}"/></g>`;
  const clamp = x=>Math.min(1,Math.max(0,x));
  const time = n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(Math.floor(n%60)).padStart(2,'0');
  root.innerHTML=`<section class="ride" aria-label="组队骑行互动演示">
    <header class="ride-header"><div><small><b class="ride-playstate"></b> <i></i> 示例行程</small><h2>康定 <span>→</span> 新都桥</h2></div>
      <div class="ride-route-meta">川西摩旅 <span>／</span> 76 km</div></header>
    <div class="ride-body"><div class="ride-field">
        <svg class="ride-map" viewBox="0 0 740 345" role="img" aria-label="车队路线与成员位置示意">
          <g class="ride-camera" id="roadlink-crew-map-content"><image href="${imageUrl('crew-relief')}" x="-390" y="-240" width="1520" height="850" preserveAspectRatio="none"/>
          <g class="ride-geography"><path d="M-65 307Q79 268 148 276T276 227T411 170T540 142T805 40" fill="none" stroke="#6ba5a4" stroke-opacity=".34" stroke-width="3"/>
          <text x="340" y="84">折 多 山</text><text x="466" y="260">横 断 山 区</text></g>
          <path class="ride-road" d="${route}"/><path class="ride-active-route" d="${route}" pathLength="100"/>
          <g class="ride-place" transform="translate(108 244)"><circle r="5"/><text x="-10" y="28">康定</text></g>
          <g class="ride-place" transform="translate(623 75)"><circle r="5"/><text x="9" y="-9">新都桥</text></g>
          <g class="ride-scan" transform="translate(108 244)"><circle r="20"/><circle r="36"/><circle r="54"/></g><g class="ride-markers">${riders.map((_,i)=>dot(i)).join('')}</g>
          <g class="ride-pin"><path d="M0 12l-6 -8h12Z"/><circle r="10" cy="-5"/><text text-anchor="middle"></text></g>
          <g class="ride-tracking"><path d="M0 0l10 -17h8" fill="none" stroke="#e3eade"/><rect x="18" y="-27" width="76" height="20" rx="4"/><text x="24" y="-13"></text></g>
        </g></svg>
        <div class="ride-maphead"><small>车队位置 · 路线示意</small><h3></h3></div>
        <span class="ride-north" aria-hidden="true">↑ N</span>
        <div class="ride-message" role="status"><i></i><strong></strong><span></span></div>
      </div>
      <aside class="ride-side" aria-label="组队手机 App">
        ${RoadlinkPhone.frameMarkup()}<a class="ride-app-link" href="${RoadlinkPhone.link('team')}" target="_blank" rel="noopener">打开完整 App ↗</a>
      </aside>
    </div>
    <div class="ride-instruments"><div class="ride-hwcontrols"><small>骑手视角</small><div class="ride-switch" role="group" aria-label="显示设备"><button data-mode="dial">车把圆屏</button><button data-mode="lens">头盔镜片</button></div></div>
      <div class="ride-device" aria-label="硬件显示"><i></i><b></b><span></span></div></div>
    <footer class="ride-player"><div class="ride-transport"><button data-play></button><span class="ride-time"></span><button data-replay aria-label="从头重播">↻ 重播</button></div>
      <div class="ride-chapters" role="group" aria-label="选择演示阶段">${chapters.map((c,i)=>`<button data-chapter="${i}"><i></i>${c[0]}</button>`).join('')}</div></footer>
  </section>`;
  const $=s=>root.querySelector(s);
  const all=s=>Array.from(root.querySelectorAll(s));
  const section=$('.ride'), road=$('.ride-road'), length=road.getTotalLength();
  const coord=f=>road.getPointAtLength(clamp(f)*length);
  const markers=all('.ride-marker'), chapterButtons=all('[data-chapter]');
  section.style.setProperty('--visor-photo',`url("${imageUrl('hardware-visor')}")`);
  function fitMap() {
    const field=$('.ride-field'), aspect=field.clientWidth/field.clientHeight;
    // Keep marker symbols circular and extend the relief to the edges on wide screens.
    const width=Math.max(740,345*aspect), height=Math.max(345,740/aspect);
    $('.ride-map').setAttribute('viewBox',[(740-width)/2,(345-height)/2,width,height].join(' '));
  }
  const observer=new ResizeObserver(fitMap);observer.observe($('.ride-field'));fitMap();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let elapsed=0, playing=true, mode='dial', frame, lastStamp=null, previousStage=-1, previousCue='', lastRender=-1;
  let stage=0, local=0, cue, count, selectedRider=null;
  function state() {
    stage=starts.findLastIndex(t=>elapsed>=t); local=elapsed-starts[stage];
    count=stage===0?0:stage===1?1:stage===2?Math.min(5,1+Math.floor(local/1.15)):5;
    const progress=clamp(local/seconds[stage]);
    switch(stage){
      case 0: return local<1.1?['搜索附近的骑行路线','集合点 · 康定','◎','已连接','手机蓝牙就绪']:['附近有 4 位骑友','可发布路线和集合点','◎','待组队','等待发起车队'];
      case 1: return local<1.25?['正在发布车队路线','康定出发 · 76 km','＋','建队中','等待路线发布']:['新都桥骑行小队已发布','附近骑友可申请加入','＋','申请制','等待骑友申请'];
      case 2: return [count===5?'五人已到齐':count===1?'等待领骑审核申请':riders[count-1]+' 的申请已通过','已加入 '+count+' / 5 人','●',count+' / 5',count===5?'准备出发':'车队成员'];
      case 3: return local<1.4?['已选目的地 · 新都桥','App 正在共享路线','↗','同步中','接收车队路线']:['全队沿同一路线前进','老王领骑 · 老周收尾','↗','新都桥','全队导航中'];
      case 4: return local<1.3?['老王发现前方碎石','领队准备标记路况','↗','新都桥','全队导航中']:local<2.5?['老王已标记碎石','位置正发送给后车','↗','新都桥','全队导航中']:['后车收到路况提醒','标记来自领队老王','⚠','前方碎石','注意路面'];
      case 5: {const gap=Math.round(2+10*clamp(progress/.7))/10;
        return local<4.2?['队尾距离正在拉开','老周仍在共享位置','↓',gap.toFixed(1)+' km','队尾距离']:['领队收到掉队提醒','老周落后 1.2 km','↓','1.2 km','队尾 · 老周'];}
      case 6: return local<1.4?['老王选择镇口加油站','准备共享途中集合点','↓','1.2 km','等待集合点']:local<5.8?['集合点已共享','前车在镇口等队尾','⚑','镇口集合','镇口加油站']:['老周赶到，五人会合','继续前往新都桥','✓','5 / 5','已会合'];
      default: return local<2?['车队驶入新都桥','等待最后一位骑友抵达','↗','新都桥','接近终点']:['五人全部抵达','本次同行 76 km','✓','已抵达','新都桥 · 76 km'];
    }
  }
  function phoneContext() {
    const arrived=stage===7 && local>=2;
    const button=['发布路线','查看入队申请',count<5?'模拟批准下一位':'共享目的地','查看下一段路况',
      '查看队尾','查看集合点','查看终点记录',arrived?'从头重播':'查看骑行成果'][stage];
    return {kind:'crew',page:arrived?'ride':'team',stage,arrived,count,riders:riders.slice(0,count),
      title:cue[0],detail:cue[1],button,route,
      distance:stage===5 ? cue[3] : stage===6 && local<5.8 ? '1.2 km' : '—',
      location:stage>=5?'镇口加油站':'新都桥'};
  }
  let phone, mapState, lastPhoneMap=0;
  function place(el,x,y){el.setAttribute('transform',`translate(${x.toFixed(2)} ${y.toFixed(2)})`);}
  function locations(force=false) {
    const points=[];
    const t=clamp(local/seconds[stage]);
    const zoom=stage<3?1:stage===3?1-clamp(local/1.8):0;
    $('.ride-camera').setAttribute('transform',`translate(${zoom*148} ${-zoom*136}) translate(108 244) scale(${1+.48*zoom}) translate(-108 -244)`);
    const travel=[0,0,0,0,.33,.50,.64,.78,1];
    let f=travel[stage]+(travel[stage+1]-travel[stage])*t;
    if(stage===3) f=.33*clamp((local-1.4)/5.6);
    if(stage===6) f=.64+.14*clamp((local-1.4)/3.6);
    if(stage===7) f=.78+.22*clamp(local/2);
    const spread=stage===3?clamp(f/.09):stage===6?1-clamp((local-4)/1.8):stage===7?0:1;
    const offsets=[-.028,0,-.048,-.066,-.085];
    let label;
    for(let i=0;i<5;i++){
      const visible=i<Math.max(1,count);
      markers[i].style.display=visible?'':'none';
      if(!visible)continue;
      let riderF=f+(stage>=3?offsets[i]*spread:0);
      if(i===4 && stage===5) riderF-=.115*t;
      if(i===4 && stage===6) riderF-=.115*(1-clamp(local/5.8));
      let pt=coord(riderF);
      const cluster=stage<3?1:1-spread;
      let x=pt.x+Math.cos(i*1.26)*14*cluster,y=pt.y+Math.sin(i*1.26)*14*cluster;
      if(stage===0){x=pt.x;y=pt.y;}
      if(stage===2 && i>0){const entry=1-clamp((local-i*1.15)/.65); x+=entry*23;y-=entry*16;}
      place(markers[i],x,y);
      points.push([x,y]);
      const tracked=selectedRider ?? (stage===2?count-1:stage===4?1:stage===5 || stage===6?4:0);
      if(i===tracked) label={x,y,name:stage===0?'我的位置':riders[i]+(i===1?' · 领队':i===4?' · 队尾':'')};
    }
    if(label){place($('.ride-tracking'),label.x,label.y);$('.ride-tracking text').textContent=label.name;}
    const pin=$('.ride-pin'), hazard=stage===4 && local>=1.3, stop=stage===6 && local>=1.4;
    pin.style.display=hazard||stop?'':'none';
    const pinPoint=hazard||stop?coord(hazard?.53:.78):null;
    if(pinPoint){place(pin,pinPoint.x,pinPoint.y-13);pin.querySelector('text').textContent=hazard?'!':'⚑';}
    mapState={points,pin:pinPoint?[pinPoint.x,pinPoint.y-13,hazard?'!':'⚑']:null};
    const at=performance.now();
    if (phone && (force || at-lastPhoneMap>=200)) {
      phone.drawMap(mapState);
      lastPhoneMap=at;
    }
    const drawn=stage<3?0:stage===3?100*clamp(local/1.4):100;
    $('.ride-active-route').style.strokeDasharray=drawn+' 110';
  }
  function controls(){
    $('[data-play]').textContent=playing?'Ⅱ 暂停':'▶ 继续';
    section.dataset.playing=playing;
    $('.ride-playstate').textContent=playing?'自动演示中':'已暂停';
    all('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
    $('.ride-instruments').dataset.mode=mode;
  }
  function render(force=false) {
    cue=state();
    if(stage!==previousStage || force){
      if(stage!==previousStage) selectedRider=null;
      $('.ride-maphead h3').textContent=chapters[stage][1];
      section.dataset.stage=stage;
      $('.ride-tracking rect').setAttribute('x',stage===4?-91:18);
      $('.ride-tracking text').setAttribute('x',stage===4?-86:24);
      section.style.setProperty('--trip-photo',`url("${imageUrl(stage<3?'team':stage===7?'riderclub':'convoy')}")`);
      chapterButtons.forEach((b,i)=>{b.setAttribute('aria-current',i===stage?'step':'false');b.classList.toggle('past',i<stage);});
    }
    const key=stage+'|'+cue.join('|')+'|'+playing;
    if(previousCue!==key||force){
      phone?.update(phoneContext());
      $('.ride-message strong').textContent=cue[0];$('.ride-message span').textContent=cue[1];
      $('.ride-device i').textContent=cue[2];$('.ride-device b').textContent=cue[3];$('.ride-device span').textContent=cue[4];
      if(previousStage!==stage || previousCue.split('|')[1]!==cue[0]) speak(cue[0]);
      previousCue=key;
    }
    previousStage=stage; locations(force);
    chapterButtons[stage].style.setProperty('--played',100*local/seconds[stage]+'%');
    $('.ride-time').textContent=time(elapsed)+' / '+time(total);
  }
  function tick(stamp) {
    if(playing && !document.hidden && lastStamp!==null) elapsed=(elapsed+(stamp-lastStamp)/1000)%total;
    lastStamp=stamp;
    if(playing && !document.hidden && stamp-lastRender>=(reduced.matches?200:40)){render();lastRender=stamp;}
    frame=requestAnimationFrame(tick);
  }
  function seek(t){elapsed=t;lastStamp=null;render(true);controls();}
  function replay(){playing=true;seek(0);}
  function toggle(){playing=!playing;lastStamp=null;render(true);controls();}
  function click(e){
    const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-focus')){
      const id=Number(b.dataset.focus); selectedRider=selectedRider===id?null:id;
      all('[data-focus]').forEach(btn=>btn.setAttribute('aria-pressed',String(Number(btn.dataset.focus)===selectedRider)));
      locations();return;
    }
    if(b.dataset.mode){mode=b.dataset.mode;controls();return;}
    if(b.hasAttribute('data-chapter')){seek(starts[Number(b.dataset.chapter)]);return;}
    if(b.hasAttribute('data-play')){toggle();return;}
    if(b.hasAttribute('data-replay')){replay();return;}
  }
  function advancePhone() {
    if(stage===7){
      if(local<2) seek(starts[7]+2.01);
      else replay();
    } else if(stage===2 && count<5) seek(starts[2]+count*1.15+.01);
    else if(stage===4 && local<2.5) seek(starts[stage]+(local<1.3?1.31:2.51));
    else if(stage===5 && local<4.2) seek(starts[stage]+4.21);
    else if(stage===6 && local<5.8) seek(starts[stage]+(local<1.4?1.41:5.81));
    else seek(starts[stage+1]);
  }
  function visibility(){lastStamp=null;}
  root.addEventListener('click',click);document.addEventListener('visibilitychange',visibility);
  controls();render();
  phone=RoadlinkPhone.mount($('.ride-side'),phoneContext(),action=>{
    if(action==='crew-next') advancePhone();
  });
  phone.drawMap(mapState);
  frame=requestAnimationFrame(tick);
  return {replay,toggle,destroy(){phone.destroy();observer.disconnect();cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);root.removeEventListener('click',click);if('speechSynthesis' in window)window.speechSynthesis.cancel();}};
};
