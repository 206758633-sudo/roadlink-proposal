/* One ride, shown on the group leader's phone and a rider's display. */
window.mountCrewRide = function (root, asset, speak) {
  'use strict';
  const stages = [
    ['碰面', '在康定，遇见今天的骑友。', '大家已登录 App。先建一个车队，再共享位置。', '创建面对面车队', 'team'],
    ['面对面建队', '告诉朋友这四个数字。', '同一集合点的骑友在各自手机上输入口令，加入同一支车队。', '演示朋友输入口令', 'team'],
    ['朋友入队', '谁来了，手机上看得见。', '队员加入后才出现在名单里。五人到齐，就能共享目的地。', '设目的地并出发', 'team'],
    ['一起出发', '五个人，沿同一条路出发。', '手机共享去新都桥的路线和队友位置，骑行显示器只呈现下一步提示。', '演示领队标记碎石', 'convoy'],
    ['前车标危险', '老王先看到碎石，后车提前知道。', '领队标记路况，后方队友的显示器收到同一位置的提醒。', '查看队尾位置', 'convoy'],
    ['有人掉队', '回头找人之前，先看队尾位置。', '老周落后 1.2 公里。App 提醒领队，队友仍在同一支车队里。', '约定镇口集合', 'convoy'],
    ['约集合点', '在同一个加油站等。', '领队选定镇口加油站作为途中集合点，位置与距离同步给全队。', '查看终点记录', 'convoy'],
    ['到了', '一起到新都桥，留下这段同行。', '途中会合后，五人抵达终点。这段 76 公里的路线保存在车队记录里。', '重新体验', 'riderclub']
  ];
  const riders = ['我','老王','老周','阿哲','小林'];
  const times = ['09:41','09:42','09:43','09:48','10:18','10:36','10:39','11:35'];
  const colors = ['#27634e','#b97132','#355d90','#835882','#47775f'];
  const device = [
    ['◎','待命','已连接手机'], ['#','2618','面对面组队码'], ['●','','车队成员'],
    ['↱','新都桥','老王在前方 300 m'], ['⚠','300 m','前方碎石 · 老王标记'],
    ['↓','1.2 km','老周落后 · 已提醒领队'], ['⚑','4.5 km','镇口加油站集合'], ['✓','已到达','新都桥 · 同行 76 km']
  ];
  let stage = 0, joined = 0, screen = 'dial', timer, arrivals;
  let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.innerHTML = `
    <section class="cr" aria-label="组队骑行演示">
      <div class="cr-bar"><div><small>组队演示 · 示例数据</small><h2>康定 <span>→</span> 新都桥</h2></div>
        <div class="cr-switch" role="group" aria-label="骑行提示显示设备">
          <button data-screen="lens" aria-pressed="false">头盔镜片</button><button data-screen="dial" aria-pressed="true">车把圆屏</button>
        </div>
      </div>
      <div class="cr-scene">
        <img class="cr-photo" alt=""><div class="cr-shade"></div><div class="cr-tags" aria-hidden="true"><div class="cr-tagplane"></div></div>
        <div class="cr-caption"><small></small><h3></h3></div>
        <div class="cr-phone"><div class="cr-status"><b></b><i></i><span>5G ▰</span></div>
          <div class="cr-app"></div><div class="cr-phonefoot">ROADLINK <strong>骑行 App</strong></div></div>
        <div class="cr-hardware"><small class="cr-hwlabel"></small><div class="cr-housing"><div class="cr-readout"></div></div></div>
      </div>
      <div class="cr-story"><p aria-live="polite"></p><div><button data-cmd="play"></button><button data-cmd="replay" aria-label="从碰面开始重播">↻ 重播</button></div></div>
      <div class="cr-steps" role="group" aria-label="八个骑行阶段">${stages.map((s,i)=>`<button data-step="${i}"><i></i>${s[0]}</button>`).join('')}</div>
    </section>`;
  const el = selector => root.querySelector(selector);
  const avatar = i => `<i class="cr-avatar" style="--rider:${colors[i]}">${riders[i].slice(-1)}</i>`;
  function map() {
    const positions = stage === 7 ? [[169,42],[178,45],[161,47],[177,54],[166,56]] :
      [[107,82],[135,61],[stage===5 ? 47 : 78,stage===5 ? 124 : 101],[123,75],[90,92]];
    const pins = positions.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="5.5" stroke="white" stroke-width="2" fill="${colors[i]}"/>`).join('');
    const labels = stage===7 ? '' : [0,1,2].map(i=>{
      const [x,y]=positions[i];
      return `<text x="${x-8}" y="${y-8}" text-anchor="end" font-size="10" fill="#183429" stroke="#edf1e4" stroke-width="2.6" paint-order="stroke">${riders[i]}</text>`;
    }).join('');
    const mark = stage===4 ? '<text x="143" y="47">⚠</text>' : stage===6 ? '<text x="143" y="47">⚑</text>' : '';
    return `<svg class="cr-map" viewBox="0 0 220 150" role="img" aria-label="车队位置示意图，五位成员与当前路线">
      <rect width="220" height="150" fill="#dce6d7"/><path d="M-12 64Q38 6 83 26T149 8L191 0M1 162Q60 91 98 116T231 89" fill="none" stroke="#bdcfba" stroke-width="19"/>
      <path d="M-9 24Q52 65 77 42T134 58T230 38M29 152Q65 120 54 91T75 -4M135 154Q119 108 166 98T219 71" fill="none" stroke="#f8f6e9" stroke-width="5"/>
      <path d="M24 134C57 117 63 104 78 101S96 86 107 82S127 78 135 61S161 63 176 41" fill="none" stroke="#217c70" stroke-width="4" stroke-linecap="round"/>${pins}${labels}${mark}
      <g font-size="10" fill="#314b43"><text x="9" y="145">康定</text><text x="160" y="30">新都桥</text><text x="5" y="53">路线示意</text></g></svg>`;
  }
  function renderPhone() {
    let body;
    if (stage < 3) {
      const count = stage===0 ? '尚未建队' : joined+' / 5 人已入队';
      const radar = stage===0 ? '<b class="cr-start">面对面组队</b>' : '<b class="cr-code">2618</b>';
      const list = riders.slice(0,joined).map((name,i)=>`<li>${avatar(i)}<b>${name}</b><small>${i===0 ? '发起人' : '已加入'}</small></li>`).join('');
      body = `<div class="cr-apphead"><small>ROADLINK / 组队</small><strong>附近骑友</strong></div>
        <div class="cr-radar"><small>康定 · 集合点</small>${radar}<span>${count}</span></div>
        <div class="cr-members"><strong>我的车队</strong><ul>${list}</ul>${joined===0 ? '<p>建队后，分享四位口令邀请朋友。</p>' : joined<5 ? '<p>等待朋友输入口令…</p>' : ''}</div>`;
    } else {
      const detail = [
        ['全队导航中','老王在前方 300 m，老周在后方 500 m。'],
        ['前方碎石 · 300 m','领队老王刚刚标记了路上的碎石。'],
        ['队尾提醒 · 老周','距离队伍 1.2 km，已通知领队。'],
        ['途中集合 · 镇口加油站','距集合点 4.5 km，已共享给五人。'],
        ['已到新都桥','五人到齐 · 本次同行 76 km']
      ][stage-3];
      body = `<div class="cr-apphead"><small>ROADLINK / 骑行路书</small><strong>${stage===7?'同行记录':'去新都桥'}</strong></div>${map()}
        <div class="cr-lineup">${riders.map((_,i)=>avatar(i)).join('')}<small>5 人</small></div>
        <div class="cr-event"><b>${detail[0]}</b><p>${detail[1]}</p></div>`;
    }
    el('.cr-app').innerHTML = body;
    el('.cr-next').textContent=stage===2 && joined<5 ? '让下一位朋友入队' : stages[stage][3];
  }
  el('.cr-phonefoot').insertAdjacentHTML('beforebegin','<button class="cr-next" data-cmd="next"></button>');
  function renderHardware() {
    const d=device[stage];
    el('.cr-hardware').dataset.mode=screen;
    el('.cr-hwlabel').textContent=screen==='dial'?'骑手视角 · 车把防水圆屏':'骑手视角 · 镜片内侧 HUD';
    el('.cr-readout').innerHTML=`<span>${d[0]}</span><b>${stage===2?joined+' / 5':d[1]}</b><small>${stage===2?riders[joined-1]+'已入队':d[2]}</small>`;
    root.querySelectorAll('[data-screen]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.screen===screen)));
  }
  function controls() {
    el('[data-cmd="play"]').textContent=playing?'Ⅱ 暂停':'▷ 播放';
  }
  function cancel() { clearTimeout(timer); clearInterval(arrivals); }
  function addRider() {
    joined=Math.min(5,joined+1); renderPhone(); renderHardware();
    if(joined===5) clearInterval(arrivals);
  }
  function schedule() {
    cancel(); controls();
    if(!playing) return;
    if(stage===2 && joined<5) arrivals=setInterval(addRider,900);
    timer=setTimeout(()=>{ if(stage<7) show(stage+1); },stage===2?6500:5700);
  }
  function show(i) {
    stage=i; joined=i===0?0:i===1?1:i===2?2:5;
    if(i===7) playing=false;
    const s=stages[i];
    el('.cr-photo').src=asset(s[4]);
    el('.cr-photo').alt={team:'停车集合的骑友',convoy:'三辆摩托车沿林间山路行进',riderclub:'骑友停车后一起回看路线'}[s[4]];
    // Anchor labels to the photograph's crop, keeping them beside their subjects.
    const tags = i>=3 && i<=6
      ? [[73,37,'小林'],[61,49,'我'],[45,69,'老王 · 领队']]
      : [];
    el('.cr-tagplane').innerHTML = tags.map(([x,y,name]) =>
      `<span style="left:${x}%;top:${y}%">${name}</span>`).join('');
    el('.cr-status b').textContent=times[i];
    el('.cr-caption small').textContent=String(i+1).padStart(2,'0')+' / 08　'+s[0];
    el('.cr-caption h3').textContent=s[1]; el('.cr-story p').textContent=s[2];
    root.querySelectorAll('[data-step]').forEach((b,j)=>{b.setAttribute('aria-current',j===i?'step':'false');b.classList.toggle('passed',j<i);});
    renderPhone(); renderHardware(); schedule(); speak(s[2]);
  }
  function replay() { playing=true; show(0); }
  function toggle() { if(stage===7) return replay(); playing=!playing; schedule(); }
  function click(event) {
    const b=event.target.closest('button');
    if(!b) return;
    if(b.dataset.screen) {screen=b.dataset.screen; renderHardware(); return;}
    if(b.hasAttribute('data-step')) {playing=false; show(Number(b.dataset.step));return;}
    if(b.dataset.cmd==='next') {
      playing=false; cancel(); controls();
      if(stage===2 && joined<5) addRider();
      else if(stage===7) replay();
      else show(stage+1);
    }
    if(b.dataset.cmd==='play') toggle();
    if(b.dataset.cmd==='replay') replay();
  }
  root.addEventListener('click',click); show(0);
  return {replay,toggle,destroy(){cancel();root.removeEventListener('click',click);if('speechSynthesis' in window) window.speechSynthesis.cancel();}};
};
