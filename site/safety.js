// One simulated vehicle event drives the source panel, AI decision and helmet output.
window.mountSafetyDemo = function (root, id, asset, speak) {
  'use strict';
  const cases = {
    distance: {
      headline:'前车慢下来，头盔里先看到车距提醒。', road:'guard', camera:'guard',
      sources:['原车前向雷达','原车前摄像头'], stages:['平稳跟车','距离收窄','AI 核对目标','头盔预警','间距回升'],
      scene:['平稳跟随前方摩托车。','前车减速，间距开始缩小。','雷达和前摄看到的是同一辆摩托车。','前车仍在本车道，跟车距离较近。','两车间距逐渐拉开。'],
      reasoning:['雷达持续测距，摄像头识别本车道前车。','雷达发现间距持续缩小。','把雷达目标与画面中同车道的摩托车对应。','同车道目标的间距已明显缩短，保留提醒，直至间距恢复。','间距回升且趋势保持，撤下车距提醒。']
    },
    rearview: {
      headline:'右后方有车靠近，提醒出现在视野右侧。', road:'hardware-visor', camera:'ride-capture',
      sources:['原车后向雷达','原车后摄像头'], stages:['观察后方','目标靠近','AI 核对方位','头盔预警','目标离开'],
      scene:['观察山路前方。','有摩托车从右后方靠近。','来车进入右侧监测区。','右后方的摩托车进入盲区。','来车驶离右侧盲区。'],
      reasoning:['等待后方车辆进入监测区域。','后向雷达发现目标正在靠近车身右侧。','将雷达方位与后摄画面里的来车对应。','来车进入右侧盲区，在镜片右侧提示骑手。','目标驶离右侧监测区，撤下盲区提醒。']
    },
    crash: {
      headline:'原车检测到摔车，头盔显示求救进度。', road:'hardware-visor',
      sources:['原车摔车检测与车速','原车定位与紧急呼叫'], stages:['正常骑行','车辆倾倒','AI 核对车况','等待骑手确认','原车求救'],
      scene:['原车紧急呼叫系统待命。','原车检测到倾倒，随后车辆停下。','车辆持续静止。','原车等待骑手确认状态。','未收到取消操作，原车发起模拟求救。'],
      reasoning:['读取原车行驶与紧急呼叫状态。','原车报告倾倒事件，车速降至零。','结合原车摔车事件与持续静止状态，转入救援提示。','原车开启求救倒计时，头盔同步显示。','倒计时结束，原车发起模拟求救并附上车辆位置。']
    }
  };
  const item=cases[id], isCrash=id==='crash', rear=id==='rearview';
  const starts=[0,3,6,8,14], duration=18;
  const roadAlt=id==='distance'?'骑手前方同一车道内的一辆摩托车':'透过头盔镜片看到的山路';
  const diagram=isCrash?
    '<svg viewBox="0 0 100 62" aria-hidden="true"><path class="sf-track" d="M9 50H91"/><g class="sf-bike"><circle cx="34" cy="40" r="7"/><circle cx="67" cy="40" r="7"/><path d="M34 39l10-13 10 12h12l-8-21h-8M40 24h11"/></g></svg>':
    rear?'<svg viewBox="0 0 100 62" aria-hidden="true"><path class="sf-track" d="M22 1v60m54-60v60M49 1v60"/><path class="sf-fan" d="M50 15L93 47Q77 59 59 60Z"/><rect class="sf-self" x="46" y="8" width="8" height="13" rx="3"/><circle class="sf-target" r="4"/></svg>':
    '<svg viewBox="0 0 100 62" aria-hidden="true"><path class="sf-track" d="M22 1v60m54-60v60M49 1v60"/><path class="sf-fan" d="M50 51L22 8Q50 -1 78 8Z"/><rect class="sf-self" x="46" y="44" width="8" height="13" rx="3"/><circle class="sf-target" r="4"/></svg>';
  root.innerHTML=`<section class="sf" aria-label="${item.headline}">
    <div class="sf-view"><img class="sf-road" src="${asset(item.road)}" alt="${roadAlt}"><div class="sf-glass"></div>
      <header><span class="sf-eye"></span>头盔内视角 <small>场景模拟</small></header>
      <div class="sf-hud" role="status"><span></span><div><b></b><small></small></div></div>
      <div class="sf-caption"><span>当前路况与车况</span><h2></h2></div>
    </div>
    <aside class="sf-data"><small class="sf-overline">原车输入 <i>→</i> AI 判断 <i>→</i> 头盔显示</small><h3>车辆感知到什么</h3>
      <div class="sf-source"><div class="sf-chart">${diagram}</div><div><small>${item.sources[0]}</small><strong data-value="0"></strong></div></div>
      <div class="sf-source"><div class="sf-preview">${isCrash?'<span aria-hidden="true">⌖</span>':`<img src="${asset(item.camera)}" alt="原车摄像头识别画面示意"><i></i>`}</div><div><small>${item.sources[1]}</small><strong data-value="1"></strong></div></div>
      <div class="sf-decision"><small>AI 判断</small><p></p></div>
      <small class="sf-note">原车配置及可读取的数据因车型而异。画面与数值为模拟。${isCrash?'本演示不会发起真实求救。':''}</small>
    </aside>
    <div class="sf-controls"><div class="sf-tools"><button data-play></button><button data-replay>↻ 重播</button><span class="sf-time"></span>${isCrash?'<button data-cancel hidden>模拟按原车键取消求救</button>':''}</div>
      <div class="sf-stages" role="group" aria-label="预警过程">${item.stages.map((s,i)=>`<button data-stage="${i}"><i></i>${s}</button>`).join('')}</div>
    </div></section>`;
  const $=s=>root.querySelector(s), page=$('.sf'), steps=Array.from(root.querySelectorAll('[data-stage]'));
  let t=0, playing=true, cancelled=false, raf, previous=null, lastPaint=-1, stage=-1, spoken='';
  const limit=v=>Math.max(0,Math.min(1,v));
  function readings(n) {
    if(isCrash){
      const remaining=Math.max(0,Math.ceil(14-t));
      if(cancelled)return ['车辆静止 · 0 km/h','原车状态 · 已取消','✓','求救已取消','骑手已在原车确认'];
      if(n===0)return ['行驶中 · 42 km/h','车辆定位可用','·','',''];
      if(n===1)return [t<4.5?'原车报告倾倒':'倾倒 · 0 km/h','车辆定位可用','·','',''];
      if(n===2)return ['持续静止 · 0 km/h','车辆定位可用','·','',''];
      if(n===3)return ['持续静止 · 0 km/h','原车呼叫倒计时','SOS',remaining+' 秒后求救','可通过原车按键取消'];
      return ['持续静止 · 0 km/h','示例位置 · 山道 K12','SOS','原车已发起求救','已附上车辆位置 · 模拟'];
    }
    if(rear){
      if(n===0)return ['右后监测区无目标','尚无匹配来车','·','',''];
      if(n===4)return ['目标已驶离监测区','目标已离开','✓','提醒解除','右侧目标已离开'];
      const distance=Math.round(22-16*limit((t-3)/5));
      return ['右后方 · '+distance+' m',n===1?'正在识别后方目标':'后方摩托车',n===3?'↗':'·',n===3?'右侧盲区有车':'',n===3?'留意右后方':''];
    }
    const gap=t<3?36:t<9?36-22*(t-3)/6:t<11?14:t<15?14+18*(t-11)/4:32;
    return [Math.round(gap)+' m · '+(t<3||t>=15?'间距稳定':t<9?'距离收窄':t<11?'间距较近':'距离回升'),'本车道前方摩托车',
      n===3?'!':n===4?'✓':'·',n===3?'注意前车距离':n===4?'提醒解除':'',n===3?'前方 · 同车道':n===4?'跟车间距已回升':''];
  }
  function render(){
    const n=starts.reduce((chosen,start,i)=>t>=start?i:chosen,0), v=readings(n);
    const stageChanged=n!==stage;stage=n;
    page.dataset.phase=n;page.dataset.case=id;page.dataset.alert=cancelled?'clear':n===3?'warn':n===4?'clear':'quiet';
    $('[data-value="0"]').textContent=v[0];$('[data-value="1"]').textContent=v[1];
    $('.sf-hud span').textContent=v[2];$('.sf-hud b').textContent=v[3];$('.sf-hud small').textContent=v[4];
    $('.sf-hud').hidden=!v[3] || (!isCrash&&t>16);
    $('.sf-caption h2').textContent=cancelled?'骑手已取消本次求救。':item.scene[n];
    $('.sf-decision p').textContent=cancelled?'原车已记录骑手取消操作，本次求救流程结束。':item.reasoning[n];
    if(isCrash){
      $('.sf-bike').style.transform='rotate('+(-57*limit((t-3)/1.5))+'deg)';
      $('[data-cancel]').hidden=n!==3||cancelled;
    }else{
      const target=$('.sf-target');target.style.opacity=rear&&(n===0||n===4)?0:1;
      target.setAttribute('cx',rear?73-13*limit((t-3)/5):50);
      target.setAttribute('cy',rear?55-26*limit((t-3)/5):10+23*limit((36-parseInt(v[0],10))/22));
      $('.sf-preview').classList.toggle('inactive',rear&&(n===0||n===4));
      $('.sf-road').style.setProperty('--z',id==='distance'?1+.12*limit((36-parseInt(v[0],10))/22):1);
    }
    if(stageChanged){steps.forEach((b,i)=>{b.setAttribute('aria-current',i===n?'step':'false');b.classList.toggle('past',i<n);});}
    steps[n].style.setProperty('--pct',100*limit((t-starts[n])/((starts[n+1]||duration)-starts[n]))+'%');
    $('.sf-time').textContent='00:'+String(Math.floor(t)).padStart(2,'0')+' / 00:18';
    $('[data-play]').textContent=cancelled?'重新演示':playing?'Ⅱ 暂停':'▶ 继续';
    const message=cancelled?'求救已取消':n===3?(isCrash?'原车即将发起求救':v[3]):n===4?v[3]:'';
    if(message && message!==spoken)speak(message);spoken=message;
  }
  function tick(stamp){
    if(playing&&!document.hidden&&previous!==null)t=(t+(stamp-previous)/1000)%duration;
    previous=stamp;if(playing&&!document.hidden&&stamp-lastPaint>=90){render();lastPaint=stamp;}
    raf=requestAnimationFrame(tick);
  }
  function seek(s){cancelled=false;t=s;previous=null;render();}
  function replay(){playing=true;seek(0);}
  function toggle(){if(cancelled){replay();return;}playing=!playing;previous=null;render();}
  function click(e){
    const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-stage'))seek(starts[Number(b.dataset.stage)]);
    if(b.hasAttribute('data-play'))toggle();
    if(b.hasAttribute('data-replay'))replay();
    if(b.hasAttribute('data-cancel')&&stage===3){cancelled=true;playing=false;render();}
  }
  function visibility(){previous=null;}
  render();raf=requestAnimationFrame(tick);
  root.addEventListener('click',click);document.addEventListener('visibilitychange',visibility);
  return {toggle,replay,destroy(){cancelAnimationFrame(raf);root.removeEventListener('click',click);document.removeEventListener('visibilitychange',visibility);if('speechSynthesis' in window)window.speechSynthesis.cancel();}};
};
