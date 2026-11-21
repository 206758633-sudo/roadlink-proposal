// Native vehicle signals in a fictional ride. Distances, imagery and HUD share one clock.
window.mountSafetyDemo = function (root,id,asset,speak) {
  'use strict';
  const front=id==='distance', rear=id==='rearview', crash=id==='crash';
  const clamp=x=>Math.min(1,Math.max(0,x));
  const ramp=(t,a,b)=>clamp((t-a)/(b-a));
  // Integral of a linear change in speed, in metres when speed is m/s.
  function travelled(t,a,b,delta){
    const h=Math.max(0,t-a),d=b-a;
    return delta*(h<=d?h*h/(2*d):h-d/2);
  }
  const clock=s=>'00:'+String(Math.floor(s)).padStart(2,'0');
  function signals(t){
    const ego=15-7*ramp(t,6,9);
    const lead=15-6*ramp(t,2,5)+5*ramp(t,12,15);
    const motion=15*t+travelled(t,6,9,-7);
    const gap=34+15*t+travelled(t,2,5,-6)+travelled(t,12,15,5)-motion;
    const along=-29+2.85*t, fall=ramp(t,3.2,4.8);
    return {id,t, gap,closing:ego-lead,along, range:Math.hypot(along,3.05),
      metres:crash?2.8*t+travelled(t,2.5,4.8,-2.8):rear?13*t:motion,
      speed:3.6*(crash?2.8*(1-ramp(t,2.5,4.8)):rear?13:ego),
      fall:crash?fall:0, angle:Math.round(64*fall), matched:front?t>=4:rear&&t>=3.4&&along<3,
      frontWarn:gap<=19&&t>4, rearWarn:along>=-6.7&&along<3};
  }
  const length=crash?23:19;
  const steps=front?['跟车','前车减速','核对目标','车距提醒','间距恢复']:rear?['后方来车','从右侧接近','核对方位','盲区提醒','驶离盲区']:['低速骑行','原车报倾倒','确认静止','等待取消','求救结果'];
  function phase(s){
    if(front) return s.t>=9 && s.gap>=22?4:s.frontWarn||s.t>=9?3:s.t>=4?2:s.t>=2?1:0;
    if(rear) return s.along>=3?4:s.rearWarn?3:s.matched?2:s.t>=1.7?1:0;
    return s.t>=18?4:s.t>=8?3:s.t>=4.8?2:s.t>=3.2?1:0;
  }
  const boundaries=[0];
  for(let tick=1;tick<=length*100;tick++){
    const n=phase(signals(tick/100));if(boundaries[n]===undefined)boundaries[n]=tick/100;
  }
  const device=crash?'原车紧急呼叫':rear?'原车后摄像头':'原车前摄像头';
  const radarName=crash?'原车倾倒检测':rear?'原车后向雷达':'原车前向雷达';
  const notes=front?['两车速度相同，车距稳定。','雷达测到前车减速，距离开始缩短。','前摄识别到本车道摩托车，与雷达目标吻合。','同车道目标正在逼近，向头盔发送车距提醒。','间距持续回升，撤下车距提醒。']:
    rear?['后方车辆仍在盲区外。','后向雷达发现目标从车身右侧接近。','后摄中的摩托车与右后雷达目标吻合。','目标与本车并行，保留右侧提醒。','目标已越过本车并离开监测区，撤下提醒。']:
    ['原车紧急呼叫系统待命。','原车报告倾倒，车辆正在减速。','倾倒状态持续，车速归零。','原车已启动求救倒计时，骑手可以取消。','原车已发出带位置的模拟求救请求。'];
  const radar=crash?`<svg viewBox="0 0 200 90" role="img" aria-label="车辆倾倒姿态示意"><path class="ss-ground" d="M12 74H188"/><g class="ss-bike"><circle cx="72" cy="59" r="10"/><circle cx="123" cy="59" r="10"/><path d="M72 59l14-22 13 18h24l-14-32H98M80 34h16"/></g></svg>`:
    `<svg viewBox="0 0 200 90" role="img" aria-label="目标相对于本车的方位"><path class="ss-grid" d="M32 0v90m43-90v90m45-90v90m47-90v90M0 22h200M0 45h200M0 68h200"/><path class="ss-fan" d="${rear?'M95 35L164 78Q140 91 102 87Z':'M95 76L48 10Q93 -3 142 10Z'}"/><rect class="ss-ego" x="91" y="${rear?29:68}" width="8" height="14" rx="3"/><circle class="ss-target" r="4.5"/></svg>`;
  root.innerHTML=`<section class="ss" aria-label="原车安全事件回放">
    <div class="ss-view">
      <canvas class="ss-main" role="img" aria-label="骑手视角场景重建"></canvas>
      <div class="ss-glass"></div>
      <header class="ss-head"><div><i></i> <b>头盔内视角</b></div><small>模拟回放</small></header>
      <div class="ss-hud" role="status" hidden><i></i><div><b></b><small></small></div></div>
      <div class="ss-readouts"><div><strong data-speed></strong><small>本车 km/h</small></div><em></em><div><strong data-main-value></strong><small data-main-unit></small></div></div>
      <button type="button" class="ss-viewtoggle" ${crash?'hidden':''}></button>
    </div>
    <aside class="ss-console"><header><small>信号来源 · 原车</small><h2>${front?'跟车距离':rear?'右侧盲区':'摔车求救'}</h2></header>
      <div class="ss-sensor"><div class="ss-radar">${radar}</div><div><small>${radarName}</small><b data-measure></b><span data-trend></span></div></div>
      ${crash?`<div class="ss-call"><small>${device}</small><b data-call></b><span>车辆定位 · 山道 K12（示例）</span></div>`:
        `<button class="ss-feed" aria-label="放大${device}画面"><canvas role="img" aria-label="${device}同步画面"></canvas><span><b>${device}</b><em>放大 ↗</em></span></button><small class="ss-camera-note"></small>`}
      <div class="ss-decision"><small>AI 判断</small><p></p></div>
      <button class="ss-cancel" hidden>模拟按原车键取消求救</button>
    </aside>
    <footer class="ss-player"><div class="ss-bar"><button data-play></button><button data-replay aria-label="从头重播">↺ 重播</button>
      <span class="ss-time"></span><input type="range" min="0" max="${length}" step=".05" value="0" aria-label="拖动查看事件进度"></div>
      <div class="ss-steps">${steps.map((label,i)=>`<button data-stage="${i}">${label}</button>`).join('')}</div>
      <small class="ss-note">画面与原车信号均为同一段模拟行程。可用数据依车型配置而定。${crash?'求救操作仅在演示中生效。':''}</small>
    </footer></section>`;
  const $=s=>root.querySelector(s), page=$('.ss'), main=$('.ss-main'), thumb=$('.ss-feed canvas');
  const stageButtons=Array.from(root.querySelectorAll('[data-stage]'));
  let t=0,playing=true,raw=false,cancelled=false,destroyed=false,frame=0,last=null,lastPaint=-1,lastSpeech='';
  const painter=window.createSafetyCamera(id,asset,()=>{if(!destroyed) render();});
  function hud(s,n){
    if(cancelled)return ['✓','求救已取消','原车已记录骑手确认'];
    if(n===3 && crash)return ['SOS',Math.ceil(18-s.t)+' 秒后求救','可按原车键取消'];
    if(n===3)return front?['!','注意前车距离',Math.round(s.gap)+' m · 本车道']:['↗','右侧盲区有车','留意右后方'];
    if(n===4&&crash)return ['SOS','求救请求已发出','原车已附上位置 · 模拟'];
    if(n===4&&s.t-boundaries[4]<1.6)return ['✓','提醒解除',front?'车距已拉开':'目标已驶离'];
    return null;
  }
  function render(){
    const s=signals(t),n=phase(s),msg=hud(s,n),sensor=rear?'rear':'front';
    page.dataset.case=id;page.dataset.phase=n;page.dataset.view=raw?'camera':'helmet';
    painter.draw(main,s,raw?sensor:'helmet');if(thumb)painter.draw(thumb,s,sensor);
    $('.ss-head b').textContent=raw?device:'头盔内视角';
    main.setAttribute('aria-label',raw?device+'场景重建':'头盔内视角场景重建');
    $('.ss-viewtoggle').textContent=raw?'返回头盔视角 ↙':'查看原车画面 ↗';
    $('.ss-hud').hidden=!msg||raw;
    if(msg){$('.ss-hud i').textContent=msg[0];$('.ss-hud b').textContent=msg[1];$('.ss-hud small').textContent=msg[2];}
    $('[data-speed]').textContent=Math.round(s.speed);
    $('[data-main-value]').textContent=front?Math.round(s.gap):rear?(Math.abs(s.along)<2?'右侧':s.along<0?'右后':'右前'):s.angle+'°';
    $('[data-main-unit]').textContent=front?'前车距离 m':rear?'目标方位':'车身倾角';
    $('[data-measure]').textContent=crash?s.angle+'° · '+(n===0?'行驶中':'倾倒事件'):front?Math.round(s.gap)+' m':s.range.toFixed(1)+' m';
    $('[data-trend]').textContent=crash?'车速 '+Math.round(s.speed)+' km/h':front?
      (Math.abs(s.closing)<.15?'相对速度接近零':(s.closing>0?'接近 ':'远离 ')+Math.abs(s.closing*3.6).toFixed(0)+' km/h'):
      (s.along<0?'右后方':'右前方')+' · '+(n===3?'位于盲区':n===4?'离开盲区':'正在接近');
    if(crash){
      $('.ss-bike').style.transform='rotate('+(-s.angle)+'deg)';
      $('[data-call]').textContent=cancelled?'骑手已取消':n===4?'请求已发出':n===3?'等待取消 · '+Math.ceil(18-t)+' 秒':'待命';
    }else{
      const target=$('.ss-target');
      target.setAttribute('cx',rear?116:95);target.setAttribute('cy',rear?Math.max(4,Math.min(84,36-s.along*1.6)):70-s.gap*1.65);
      $('.ss-camera-note').textContent=front?(s.matched?'前摄 · 同车道摩托车已关联':'前摄 · 跟随本车道前车'):
        s.along < -5?'后摄镜像 · 画面右侧对应车身右侧':s.along<3?'来车从后摄边缘移出，雷达继续跟踪。':'来车已通过，后摄中不再可见。';
    }
    let decision=notes[n];
    if(front && n===3 && s.closing<0)decision='间距开始拉开，但两车仍近，暂时保留提醒。';
    if(rear && n===3 && s.along<-2)decision='来车已进入右后盲区，镜片右侧出现提示。';
    $('.ss-decision p').textContent=cancelled?'骑手已通过原车取消本次求救。':decision;
    $('.ss-cancel').hidden=!crash||n!==3||cancelled;
    $('.ss-time').textContent=clock(t)+' / '+clock(length);
    const slider=$('.ss-bar input');slider.value=t;slider.style.setProperty('--pos',100*t/length+'%');
    slider.setAttribute('aria-valuetext',clock(t)+'，'+steps[n]);
    $('[data-play]').textContent=cancelled||t>=length?'▶ 重播':playing?'Ⅱ 暂停':'▶ 继续';
    stageButtons.forEach((b,i)=>b.setAttribute('aria-current',i===n?'step':'false'));
    const speech=cancelled?'求救已取消':n===3?(crash?'原车即将发起求救':msg[1]):n===4&&msg?msg[1]:'';
    if(speech&&lastSpeech!==speech)speak(speech);lastSpeech=speech;
  }
  function tick(stamp){
    if(playing&&!document.hidden&&last!==null){
      t+=(stamp-last)/1000;
      if(t>=length){if(crash){t=length;playing=false;render();}else{t%=length;}}
    }
    last=stamp;
    if(playing&&!document.hidden&&stamp-lastPaint>=45){render();lastPaint=stamp;}
    frame=requestAnimationFrame(tick);
  }
  function seek(value){t=value;cancelled=false;last=null;render();}
  function replay(){playing=true;seek(0);}
  function toggle(){if(cancelled||t>=length)return replay();playing=!playing;last=null;render();}
  function click(e){
    const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-stage'))seek(boundaries[Number(b.dataset.stage)]);
    if(b.hasAttribute('data-play'))toggle();
    if(b.hasAttribute('data-replay'))replay();
    if(b.classList.contains('ss-viewtoggle')||b.classList.contains('ss-feed')){raw=b.classList.contains('ss-feed')||!raw;render();}
    if(b.classList.contains('ss-cancel')&&phase(signals(t))===3){cancelled=true;playing=false;render();}
  }
  function scrub(e){playing=false;seek(Number(e.target.value));}
  function visibility(){last=null;}
  const resize=new ResizeObserver(()=>{if(!destroyed)render();});resize.observe(main);
  root.addEventListener('click',click);$('.ss-bar input').addEventListener('input',scrub);
  document.addEventListener('visibilitychange',visibility);render();frame=requestAnimationFrame(tick);
  return {toggle,replay,destroy(){destroyed=true;painter.destroy();resize.disconnect();cancelAnimationFrame(frame);root.removeEventListener('click',click);$('.ss-bar input').removeEventListener('input',scrub);document.removeEventListener('visibilitychange',visibility);if('speechSynthesis' in window)window.speechSynthesis.cancel();}};
};
