// Project the same simulated target into the rider's view and the vehicle camera.
window.createSafetyCamera = function (id, asset, onReady) {
  const images = {};
  let active = true;
  const keys=id==='crash'?['turnout','stopped']:id==='distance'?['forward','lead']:['forward','mirror','lead','following'];
  for (const key of keys) {
    const im = new Image();
    images[key] = im;
    im.onload = ()=>{ if(active) onReady(); };
    im.src = asset('safety-'+key);
  }
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  function surface(ctx, plate, rear, metres) {
    const horizon = rear ? .493 : .465, vx = rear ? .508 : .502;
    const left = rear ? -2.65 : -.94, right = rear ? 2.1 : 2.8;
    // Sample photographed asphalt by ground distance. The centre dashes have a
    // fixed spacing in the scene and pass the viewer as odometry advances.
    ctx.save();
    ctx.beginPath();ctx.moveTo(vx,horizon);ctx.lineTo(vx+left*(1-horizon),1);
    ctx.lineTo(vx+right*(1-horizon),1);ctx.closePath();ctx.clip();
    const w=plate.naturalWidth,h=plate.naturalHeight, sign=rear?-1:1;
    const lane=rear?.035:.525;
    const step=.008;
    for(let y=horizon+.01;y<1;y+=step){
      const ground=2.15/(y-horizon), q=((ground+sign*metres)%12+12)%12;
      const sy=(.69+.24*(.5-.5*Math.cos(q*Math.PI/6)))*h;
      const lineX=vx+lane*(y-horizon);
      const wipe=.004+.067*(y-horizon);
      ctx.globalAlpha=1;
      ctx.drawImage(plate,(lineX-wipe*3)*w,y*h,2*wipe*w,step*h,lineX-wipe,y,2*wipe,step+.0005);
      ctx.globalAlpha=Math.min(.24,(y-horizon)*1.7);
      ctx.drawImage(plate,.32*w,sy,.17*w,Math.max(1,step*h),0,y,1,step+.001);
    }
    ctx.globalAlpha=1;

    for(let k=-2;k<24;k++){
      const near=(k+1)*12-((sign*metres%12+12)%12);
      if(near+4<3)continue;
      const a=2.15/Math.max(2,near), b=2.15/(near+4);
      ctx.fillStyle='rgba(222,224,223,.78)';ctx.beginPath();
      ctx.moveTo(vx+(lane-.017)*a,horizon+a);ctx.lineTo(vx+(lane+.017)*a,horizon+a);
      ctx.lineTo(vx+(lane+.017)*b,horizon+b);ctx.lineTo(vx+(lane-.017)*b,horizon+b);ctx.closePath();ctx.fill();
    }
    ctx.restore();
    // Keep the rider's windscreen fixed at the extreme bottom of the frame.
    if(!rear){ctx.save();ctx.beginPath();ctx.ellipse(.498,1.025,.09,.067,0,0,Math.PI*2);ctx.clip();ctx.drawImage(plate,0,0,1,1);ctx.restore();}
  }
  function draw(canvas, s, view) {
    const rear=view==='rear', helmet=view==='helmet';
    const plate=images[id==='crash'?'turnout':rear?'mirror':'forward'];
    if(!plate.naturalWidth)return;
    const rect=canvas.getBoundingClientRect(), dpr=Math.min(devicePixelRatio||1,1.5);
    const width=Math.round(rect.width*dpr),height=Math.round(rect.height*dpr);
    if(!width||!height)return;
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
    const ctx=canvas.getContext('2d'), cw=Math.max(width,height*2),ch=cw/2;
    ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#101918';ctx.fillRect(0,0,width,height);
    ctx.save();ctx.translate(width/2,height/2);
    const roll=still.matches?0:(s.fall*(1-s.fall)*.14+Math.sin(s.metres*.12)*.0016);
    ctx.rotate(roll);const cover=(view==='front'?1.15:1.012)+Math.abs(roll)*2;
    ctx.scale(cw*cover,ch*cover);ctx.translate(-.5,-.5);
    ctx.drawImage(plate,0,0,1,1);
    if(id==='crash'){
      if(images.stopped.naturalWidth && s.fall>0){
        ctx.globalAlpha=s.fall*s.fall*(3-2*s.fall);
        ctx.drawImage(images.stopped,0,0,1,1);
      }
      ctx.restore();return;
    }
    surface(ctx,plate,rear,still.matches?0:s.metres);
    let depth=0,side=0, sprite;
    if(s.id==='distance'&&!rear){depth=s.gap;side=-.18;sprite=images.lead;}
    if(s.id==='rearview'){
      depth=rear?-s.along:s.along;side=3.05;sprite=rear?images.following:images.lead;
    }
    if(depth>1.8&&sprite?.naturalWidth){
      const horizon=rear?.493:.465, fy=1.31;
      const y=horizon+fy*(rear?1.18:1.62)/depth;
      const x=(rear?.508:.502)+fy*.5*side/depth;
      const sh=fy*1.88/depth, sw=sh*sprite.naturalWidth/sprite.naturalHeight/2;
      ctx.save();ctx.fillStyle='rgba(22,23,22,.38)';ctx.beginPath();ctx.ellipse(x,y,sw*.45,sh*.037,0,0,Math.PI*2);ctx.fill();ctx.restore();
      ctx.drawImage(sprite,x-sw/2,y-sh,sw,sh);
      if(!helmet && s.matched && x>.035 && x<.97 && y<1.03){
        ctx.strokeStyle='#bcecc8';ctx.lineWidth=.0021;
        ctx.strokeRect(x-sw*.53,y-sh,sw*1.06,sh);
      }
    }
    ctx.restore();
  }
  return {draw, destroy(){active=false;Object.values(images).forEach(i=>i.onload=null);}};
};
