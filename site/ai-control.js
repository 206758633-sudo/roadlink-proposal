/**
 * ROADLINK · 模块 01 AI 操控（骑士随行 · AI 骑行硬件控制手机 · 三端同步实景演绎）
 * 独立 Shadow DOM 封装，与全局样式零冲突，支持三端同屏 / 镜片视角 / 圆盘特写与四大核心场景同步。
 */
window.mountAiControl = function (root, asset, speak) {
  'use strict';
  let destroyed = false;
  let lastSpeechKey = '';
  const shadow = root.shadowRoot || root.attachShadow({ mode: 'open' });
  const byId = id => shadow.getElementById(id);

  const styleEl = document.createElement('style');
  styleEl.textContent = "*, ::before, ::after {\n  box-sizing: border-box;\n  border-width: 0;\n  border-style: solid;\n  border-color: rgba(255, 255, 255, 0.12);\n}\nh1, h2, h3, h4, p {\n  margin: 0;\n  font-size: inherit;\n  font-weight: inherit;\n}\nbutton, input {\n  font-family: inherit;\n  font-size: 100%;\n  font-weight: inherit;\n  line-height: inherit;\n  letter-spacing: inherit;\n  color: inherit;\n  margin: 0;\n  padding: 0;\n  background-color: transparent;\n  background-image: none;\n}\nimg, svg, video, canvas {\n  display: block;\n  vertical-align: middle;\n}\nimg, video {\n  max-width: 100%;\n  height: auto;\n}\n@keyframes tw-spin {\n  to { transform: rotate(360deg); }\n}\n@keyframes tw-pulse {\n  50% { opacity: .5; }\n}\n* {\n      box-sizing: border-box;\n      user-select: none;\n      -webkit-font-smoothing: antialiased;\n      -moz-osx-font-smoothing: grayscale;\n    }\n\n    :host {\n      display: block;\n      width: 100%;\n    }\n    .ai-root {\n      margin: 0;\n      padding: 0;\n      width: 100%;\n      background-color: transparent;\n      color: #FFFFFF;\n      font-family: \"Inter\", \"PingFang SC\", -apple-system, BlinkMacSystemFont, \"SF Pro Display\", \"HarmonyOS Sans SC\", \"Microsoft YaHei\", sans-serif;\n      overflow-x: hidden;\n    }\n\n    /* ==================== 主视窗：1360x740 (约16:9) 头盔内部第一人称视角容器 ==================== */\n    .helmet-pov-viewport {\n      position: relative;\n      width: 1360px;\n      height: 740px;\n      border-radius: 26px;\n      overflow: hidden;\n      background: #05070A;\n      box-shadow:\n        0 36px 95px rgba(0, 0, 0, 0.92),\n        0 0 0 1px rgba(255, 255, 255, 0.08);\n      transform-origin: top left;\n      flex-shrink: 0;\n    }\n\n    /* 真实高速实拍底图轻微行车呼吸感与速度动势 */\n    @keyframes highwayForwardMotion {\n      0%   { transform: scale(1.035) translate3d(0px, 0px, 0); }\n      50%  { transform: scale(1.065) translate3d(-4px, 2px, 0); }\n      100% { transform: scale(1.035) translate3d(0px, 0px, 0); }\n    }\n    .pov-photo-motion {\n      animation: highwayForwardMotion 13s ease-in-out infinite;\n      transform-origin: 54% 44%;\n    }\n\n    /* 底部真实摩托第一人称车把摄影图融合遮罩（仅保留实拍车把暗部主体，右上夜空绝对干净深邃） */\n    .real-cockpit-photo-mask {\n      mask-image: radial-gradient(ellipse 46% 42% at 53% 96%, rgba(0,0,0,0.96) 28%, rgba(0,0,0,0.55) 62%, transparent 88%);\n      -webkit-mask-image: radial-gradient(ellipse 46% 42% at 53% 96%, rgba(0,0,0,0.96) 28%, rgba(0,0,0,0.55) 62%, transparent 88%);\n      filter: brightness(0.62) contrast(1.18) saturate(0.88);\n    }\n\n    /* 头盔内衬海绵暗角 + 风镜上沿橡胶密封圈 + 底部碳纤维下巴护罩（Chin Bar）包裹层 */\n    .helmet-interior-liner {\n      position: absolute;\n      inset: 0;\n      pointer-events: none;\n      z-index: 12;\n      box-shadow:\n        inset 0 26px 38px rgba(2, 3, 5, 0.94),\n        inset 0 -32px 46px rgba(2, 3, 5, 0.95),\n        inset 42px 0 58px rgba(3, 4, 7, 0.86),\n        inset -42px 0 58px rgba(3, 4, 7, 0.88),\n        inset 0 0 110px rgba(0, 0, 0, 0.68);\n    }\n\n    /* 顶部风镜胶条微反光棱线 */\n    .helmet-visor-top-seal {\n      position: absolute;\n      top: -18px;\n      left: 4%;\n      right: 4%;\n      height: 36px;\n      border-radius: 50%;\n      border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);\n      background: linear-gradient(180deg, #030406 40%, rgba(12, 15, 20, 0.85) 100%);\n      filter: blur(1px);\n      pointer-events: none;\n      z-index: 13;\n    }\n\n    /* 底部碳纤维纹理头盔下巴护罩与中央鼻翼呼吸导流罩暗影（真实头盔内边缘光学失焦质感） */\n    .helmet-chin-guard {\n      position: absolute;\n      bottom: -24px;\n      left: -2%;\n      right: -2%;\n      height: 68px;\n      pointer-events: none;\n      z-index: 13;\n      background:\n        radial-gradient(ellipse 18% 72% at 52% 100%, rgba(18, 21, 27, 0.92) 0%, rgba(8, 10, 14, 0.88) 65%, transparent 100%),\n        repeating-linear-gradient(45deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 2px, transparent 2px, transparent 6px),\n        linear-gradient(0deg, rgba(4, 5, 8, 0.98) 28%, rgba(10, 12, 16, 0.65) 72%, transparent 100%);\n      filter: blur(1.5px);\n    }\n\n    /* ==================== 第一端（左侧）：Apple iPhone 真机 ==================== */\n    .iphone-chassis {\n      width: 296px;\n      height: 618px;\n      border-radius: 44px;\n      padding: 8px;\n      background: linear-gradient(145deg, #484C56 0%, #1F2229 30%, #111318 70%, #393D47 100%);\n      box-shadow:\n        0 28px 65px rgba(0, 0, 0, 0.88),\n        0 0 0 1px rgba(255, 255, 255, 0.16),\n        inset 0 1px 1.5px rgba(255, 255, 255, 0.3);\n    }\n\n    .iphone-display {\n      width: 100%;\n      height: 100%;\n      border-radius: 36px;\n      background: #F7F6F1;\n      color: #141414;\n      display: flex;\n      flex-direction: column;\n      overflow: hidden;\n      position: relative;\n    }\n\n    /* ==================== 第二端（严格右上方）：头盔风镜透明光学波导贴片 HUD ==================== */\n    .visor-hud-patch {\n      position: absolute;\n      top: 32px;\n      right: 38px;\n      width: 410px;\n      min-height: 206px;\n      border-radius: 18px;\n      background:\n        radial-gradient(circle at 28% 45%, rgba(74, 222, 128, 0.13) 0%, rgba(16, 48, 34, 0.06) 55%, transparent 82%),\n        rgba(10, 26, 20, 0.24);\n      backdrop-filter: blur(2px);\n      -webkit-backdrop-filter: blur(2px);\n      border: 1px solid rgba(74, 222, 128, 0.28);\n      box-shadow:\n        0 16px 42px rgba(0, 0, 0, 0.32),\n        0 0 28px rgba(74, 222, 128, 0.08),\n        inset 0 1px 1px rgba(255, 255, 255, 0.22),\n        inset 0 0 22px rgba(74, 222, 128, 0.07);\n      transition: opacity 0.65s ease, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;\n    }\n\n    /* 四角精密荧光绿光学对位角标 */\n    .hud-corner {\n      position: absolute;\n      width: 10px;\n      height: 10px;\n      border-color: rgba(74, 222, 128, 0.78);\n      pointer-events: none;\n    }\n    .hud-corner-tl { top: 7px; left: 7px; border-top: 1.8px solid; border-left: 1.8px solid; border-top-left-radius: 4px; }\n    .hud-corner-tr { top: 7px; right: 7px; border-top: 1.8px solid; border-right: 1.8px solid; border-top-right-radius: 4px; }\n    .hud-corner-bl { bottom: 7px; left: 7px; border-bottom: 1.8px solid; border-left: 1.8px solid; border-bottom-left-radius: 4px; }\n    .hud-corner-br { bottom: 7px; right: 7px; border-bottom: 1.8px solid; border-right: 1.8px solid; border-bottom-right-radius: 4px; }\n\n    /* 贴片左侧微米级波导棱镜柱 */\n    .waveguide-prism-bar {\n      width: 12px;\n      border-radius: 999px;\n      background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(74,222,128,0.16) 50%, rgba(255,255,255,0.06) 100%);\n      border: 1px solid rgba(74, 222, 128, 0.22);\n      box-shadow: 0 0 10px rgba(74, 222, 128, 0.15);\n    }\n\n    .hud-phosphor-main {\n      color: #4ADE80;\n      text-shadow:\n        0 0 14px rgba(74, 222, 128, 0.68),\n        0 0 32px rgba(34, 197, 94, 0.32);\n    }\n\n    .hud-phosphor-sub {\n      color: #86EFAC;\n      text-shadow: 0 0 10px rgba(74, 222, 128, 0.38);\n    }\n\n    /* ==================== 第三端（车把中央 + 特写弹窗）：三防车把防水圆盘屏 ==================== */\n    .rugged-pod-housing {\n      background:\n        radial-gradient(circle at 28% 18%, rgba(255,255,255,0.19) 0%, transparent 45%),\n        linear-gradient(155deg, #323842 0%, #171B21 48%, #0B0E12 100%);\n      border-radius: 36px;\n      border: 1.5px solid rgba(255, 255, 255, 0.22);\n      box-shadow:\n        0 20px 44px rgba(0, 0, 0, 0.92),\n        inset 1.5px 2px 3px rgba(255, 255, 255, 0.28),\n        inset -4px -6px 12px rgba(0, 0, 0, 0.9);\n      position: relative;\n    }\n\n    .pod-circular-oled {\n      border-radius: 9999px;\n      background: radial-gradient(circle at 36% 32%, #0D332F 0%, #072220 65%, #031211 100%);\n      box-shadow:\n        inset 0 5px 14px rgba(0, 0, 0, 0.95),\n        0 0 0 4px #0B0E12,\n        0 1.5px 2px rgba(255, 255, 255, 0.18);\n      position: relative;\n      overflow: hidden;\n    }\n\n    /* 外壳立体反光水珠 */\n    .water-bead {\n      position: absolute;\n      border-radius: 56% 44% 52% 48% / 48% 55% 45% 52%;\n      background: radial-gradient(\n        circle at 32% 28%,\n        rgba(255, 255, 255, 0.96) 0%,\n        rgba(210, 245, 255, 0.38) 32%,\n        rgba(10, 18, 24, 0.58) 74%,\n        rgba(0, 0, 0, 0.88) 100%\n      );\n      box-shadow: 1.2px 2px 3px rgba(0, 0, 0, 0.85);\n      pointer-events: none;\n    }\n\n    /* 橡胶实体按键 */\n    .pod-rubber-btn {\n      background: linear-gradient(180deg, #2E343E 0%, #14171D 100%);\n      border: 1px solid rgba(255, 255, 255, 0.18);\n      box-shadow: 0 2.5px 4px rgba(0, 0, 0, 0.88), inset 0 1px 0.5px rgba(255, 255, 255, 0.24);\n      transition: transform 0.1s ease;\n    }\n    .pod-rubber-btn:active {\n      transform: translateY(1.5px) scale(0.95);\n    }\n\n    /* 两侧破风青色流光动画 */\n    @keyframes aeroStreamDash {\n      0%   { stroke-dashoffset: 220; opacity: 0.45; }\n      50%  { opacity: 0.95; }\n      100% { stroke-dashoffset: 0; opacity: 0.45; }\n    }\n    .aero-wind-line {\n      stroke-dasharray: 110 110;\n      animation: aeroStreamDash 2.4s linear infinite;\n    }\n\n    /* 大疆录像圆盘红环呼吸动画 */\n    @keyframes recPulseGlow {\n      0%, 100% { opacity: 1; filter: drop-shadow(0 0 6px rgba(244, 63, 94, 0.85)); }\n      50%      { opacity: 0.42; filter: drop-shadow(0 0 2px rgba(244, 63, 94, 0.3)); }\n    }\n    .rec-breathing-ring {\n      animation: recPulseGlow 1.2s ease-in-out infinite;\n    }\n\n    /* 快门闪光特效 */\n    @keyframes cameraFlashAnim {\n      0%   { opacity: 0.95; }\n      100% { opacity: 0; }\n    }\n    .camera-flash-mask {\n      animation: cameraFlashAnim 0.48s ease-out forwards;\n    }\n\n    /* AI 代触控波纹 */\n    @keyframes aiTouchWave {\n      0%   { transform: translate(-50%, -50%) scale(0.35); opacity: 0.95; }\n      100% { transform: translate(-50%, -50%) scale(1.75); opacity: 0; }\n    }\n    .ai-touch-ripple {\n      position: absolute;\n      width: 36px;\n      height: 36px;\n      border-radius: 9999px;\n      background: radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(74,222,128,0.65) 55%, transparent 76%);\n      border: 1.5px solid #FFFFFF;\n      pointer-events: none;\n      z-index: 60;\n      animation: aiTouchWave 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;\n    }\n\n    .no-scrollbar::-webkit-scrollbar { display: none; }\n    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }\n.absolute { position: absolute; }\n.flex { display: flex; }\n.grid { display: grid; }\n.relative { position: relative; }\n.hidden { display: none; }\n.cursor-pointer { cursor: pointer; }\n.flex-1 { flex: 1 1 0%; }\n.flex-col { flex-direction: column; }\n.flex-wrap { flex-wrap: wrap; }\n.font-black { font-weight: 900; }\n.font-bold { font-weight: 700; }\n.font-extrabold { font-weight: 800; }\n.font-medium { font-weight: 500; }\n.font-mono { font-family: \"JetBrains Mono\", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }\n.font-normal { font-weight: 400; }\n.font-semibold { font-weight: 600; }\n.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }\n.grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }\n.inset-0 { inset: 0px; }\n.inset-\\[10px\\] { inset: 10px; }\n.items-center { align-items: center; }\n.items-end { align-items: flex-end; }\n.items-stretch { align-items: stretch; }\n.justify-between { justify-content: space-between; }\n.justify-center { justify-content: center; }\n.justify-end { justify-content: flex-end; }\n.leading-none { line-height: 1; }\n.leading-snug { line-height: 1.375; }\n.leading-tight { line-height: 1.25; }\n.line-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }\n.min-w-0 { min-width: 0px; }\n.object-center { object-position: center; }\n.object-cover { object-fit: cover; }\n.overflow-hidden { overflow: hidden; }\n.pointer-events-none { pointer-events: none; }\n.shrink-0 { flex-shrink: 0; }\n.text-center { text-align: center; }\n.text-left { text-align: left; }\n.tracking-\\[-0\\.02em\\] { letter-spacing: -0.02em; }\n.tracking-\\[0\\.08em\\] { letter-spacing: 0.08em; }\n.tracking-tight { letter-spacing: -0.025em; }\n.tracking-tighter { letter-spacing: -0.05em; }\n.tracking-wide { letter-spacing: 0.025em; }\n.tracking-wider { letter-spacing: 0.05em; }\n.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.underline { text-decoration-line: underline; }\n.whitespace-nowrap { white-space: nowrap; }\n.inset-x-0 { left: 0px; right: 0px; }\n.overflow-y-auto { overflow-y: auto; }\n.underline-offset-4 { text-underline-offset: 4px; }\n.-left-\\[95px\\] { left: -95px; }\n.-top-4 { top: -1rem; }\n.bottom-0 { bottom: 0px; }\n.bottom-1\\.5 { bottom: 0.375rem; }\n.bottom-10 { bottom: 2.5rem; }\n.bottom-14 { bottom: 3.5rem; }\n.bottom-2 { bottom: 0.5rem; }\n.bottom-3\\.5 { bottom: 0.875rem; }\n.bottom-9 { bottom: 2.25rem; }\n.decoration-white\\/60 { text-decoration-color: rgba(255, 255, 255, 0.6); }\n.left-0 { left: 0px; }\n.left-11 { left: 2.75rem; }\n.left-2 { left: 0.5rem; }\n.left-2\\.5 { left: 0.625rem; }\n.left-4 { left: 1rem; }\n.left-5 { left: 1.25rem; }\n.left-8 { left: 2rem; }\n.left-\\[31\\%\\] { left: 31%; }\n.left-\\[58\\%\\] { left: 58%; }\n.right-2 { right: 0.5rem; }\n.right-2\\.5 { right: 0.625rem; }\n.right-3 { right: 0.75rem; }\n.right-4 { right: 1rem; }\n.right-6 { right: 1.5rem; }\n.right-9 { right: 2.25rem; }\n.top-2 { top: 0.5rem; }\n.top-2\\.5 { top: 0.625rem; }\n.top-20 { top: 5rem; }\n.top-3 { top: 0.75rem; }\n.top-5 { top: 1.25rem; }\n.top-6 { top: 1.5rem; }\n.top-9 { top: 2.25rem; }\n.top-\\[12px\\] { top: 12px; }\n.top-\\[34\\%\\] { top: 34%; }\n.top-\\[38\\%\\] { top: 38%; }\n.z-0 { z-index: 0; }\n.z-10 { z-index: 10; }\n.z-14 { z-index: 14; }\n.z-20 { z-index: 20; }\n.z-25 { z-index: 25; }\n.z-30 { z-index: 30; }\n.z-35 { z-index: 35; }\n.z-50 { z-index: 50; }\n.h-1\\.5 { height: 0.375rem; }\n.h-11 { height: 2.75rem; }\n.h-12 { height: 3rem; }\n.h-2 { height: 0.5rem; }\n.h-2\\.5 { height: 0.625rem; }\n.h-3\\.5 { height: 0.875rem; }\n.h-4 { height: 1rem; }\n.h-6 { height: 1.5rem; }\n.h-7 { height: 1.75rem; }\n.h-\\[1\\.8px\\] { height: 1.8px; }\n.h-\\[10px\\] { height: 10px; }\n.h-\\[114px\\] { height: 114px; }\n.h-\\[11px\\] { height: 11px; }\n.h-\\[135px\\] { height: 135px; }\n.h-\\[138px\\] { height: 138px; }\n.h-\\[142px\\] { height: 142px; }\n.h-\\[146px\\] { height: 146px; }\n.h-\\[162px\\] { height: 162px; }\n.h-\\[164px\\] { height: 164px; }\n.h-\\[18px\\] { height: 18px; }\n.h-\\[19px\\] { height: 19px; }\n.h-\\[1px\\] { height: 1px; }\n.h-\\[2\\.5px\\] { height: 2.5px; }\n.h-\\[21px\\] { height: 21px; }\n.h-\\[228px\\] { height: 228px; }\n.h-\\[22px\\] { height: 22px; }\n.h-\\[23px\\] { height: 23px; }\n.h-\\[24px\\] { height: 24px; }\n.h-\\[26px\\] { height: 26px; }\n.h-\\[29px\\] { height: 29px; }\n.h-\\[3\\.5px\\] { height: 3.5px; }\n.h-\\[32px\\] { height: 32px; }\n.h-\\[34px\\] { height: 34px; }\n.h-\\[40px\\] { height: 40px; }\n.h-\\[58\\%\\] { height: 58%; }\n.h-\\[9\\.5px\\] { height: 9.5px; }\n.h-full { height: 100%; }\n.max-w-\\[1360px\\] { max-width: 1360px; }\n.max-w-\\[148px\\] { max-width: 148px; }\n.min-h-\\[40px\\] { min-height: 40px; }\n.min-h-screen { min-height: 100vh; }\n.w-1\\.5 { width: 0.375rem; }\n.w-10 { width: 2.5rem; }\n.w-11 { width: 2.75rem; }\n.w-12 { width: 3rem; }\n.w-14 { width: 3.5rem; }\n.w-2 { width: 0.5rem; }\n.w-2\\.5 { width: 0.625rem; }\n.w-24 { width: 6rem; }\n.w-3 { width: 0.75rem; }\n.w-3\\.5 { width: 0.875rem; }\n.w-4 { width: 1rem; }\n.w-6 { width: 1.5rem; }\n.w-7 { width: 1.75rem; }\n.w-8 { width: 2rem; }\n.w-9 { width: 2.25rem; }\n.w-\\[10px\\] { width: 10px; }\n.w-\\[114px\\] { width: 114px; }\n.w-\\[11px\\] { width: 11px; }\n.w-\\[154px\\] { width: 154px; }\n.w-\\[164px\\] { width: 164px; }\n.w-\\[18px\\] { width: 18px; }\n.w-\\[19px\\] { width: 19px; }\n.w-\\[218px\\] { width: 218px; }\n.w-\\[23px\\] { width: 23px; }\n.w-\\[29px\\] { width: 29px; }\n.w-\\[32px\\] { width: 32px; }\n.w-\\[344px\\] { width: 344px; }\n.w-\\[78px\\] { width: 78px; }\n.w-full { width: 100%; }\n.gap-0\\.5 { gap: 0.125rem; }\n.gap-1 { gap: 0.25rem; }\n.gap-1\\.5 { gap: 0.375rem; }\n.gap-2 { gap: 0.5rem; }\n.gap-2\\.5 { gap: 0.625rem; }\n.gap-3 { gap: 0.75rem; }\n.gap-3\\.5 { gap: 0.875rem; }\n.gap-4 { gap: 1rem; }\n.p-2 { padding: 0.5rem; }\n.p-2\\.5 { padding: 0.625rem; }\n.p-3 { padding: 0.75rem; }\n.p-3\\.5 { padding: 0.875rem; }\n.p-\\[1px\\] { padding: 1px; }\n.p-\\[3px\\] { padding: 3px; }\n.rounded { border-radius: 0.25rem; }\n.rounded-\\[10px\\] { border-radius: 10px; }\n.rounded-\\[11px\\] { border-radius: 11px; }\n.rounded-\\[15px\\] { border-radius: 15px; }\n.rounded-\\[1px\\] { border-radius: 1px; }\n.rounded-\\[2\\.5px\\] { border-radius: 2.5px; }\n.rounded-\\[20px\\] { border-radius: 20px; }\n.rounded-\\[22px\\] { border-radius: 22px; }\n.rounded-\\[5px\\] { border-radius: 5px; }\n.rounded-\\[6px\\] { border-radius: 6px; }\n.rounded-\\[7px\\] { border-radius: 7px; }\n.rounded-\\[8px\\] { border-radius: 8px; }\n.rounded-full { border-radius: 9999px; }\n.rounded-lg { border-radius: 0.5rem; }\n.rounded-md { border-radius: 0.375rem; }\n.rounded-xs { border-radius: 0.125rem; }\n.mx-auto { margin-left: auto; margin-right: auto; }\n.my-0\\.5 { margin-top: 0.125rem; margin-bottom: 0.125rem; }\n.my-2\\.5 { margin-top: 0.625rem; margin-bottom: 0.625rem; }\n.px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }\n.px-1\\.5 { padding-left: 0.375rem; padding-right: 0.375rem; }\n.px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }\n.px-2\\.5 { padding-left: 0.625rem; padding-right: 0.625rem; }\n.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }\n.px-3\\.5 { padding-left: 0.875rem; padding-right: 0.875rem; }\n.px-4 { padding-left: 1rem; padding-right: 1rem; }\n.px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }\n.py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }\n.py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }\n.py-1\\.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }\n.py-2\\.5 { padding-top: 0.625rem; padding-bottom: 0.625rem; }\n.py-4 { padding-top: 1rem; padding-bottom: 1rem; }\n.mb-0\\.5 { margin-bottom: 0.125rem; }\n.mb-1 { margin-bottom: 0.25rem; }\n.mb-1\\.5 { margin-bottom: 0.375rem; }\n.mb-2 { margin-bottom: 0.5rem; }\n.mb-3\\.5 { margin-bottom: 0.875rem; }\n.mt-0\\.5 { margin-top: 0.125rem; }\n.mt-1 { margin-top: 0.25rem; }\n.mt-1\\.5 { margin-top: 0.375rem; }\n.mt-2 { margin-top: 0.5rem; }\n.mt-2\\.5 { margin-top: 0.625rem; }\n.pb-0\\.5 { padding-bottom: 0.125rem; }\n.pb-1 { padding-bottom: 0.25rem; }\n.pb-1\\.5 { padding-bottom: 0.375rem; }\n.pb-2\\.5 { padding-bottom: 0.625rem; }\n.pl-1 { padding-left: 0.25rem; }\n.pr-1 { padding-right: 0.25rem; }\n.pr-2 { padding-right: 0.5rem; }\n.pr-2\\.5 { padding-right: 0.625rem; }\n.pt-0\\.5 { padding-top: 0.125rem; }\n.pt-1 { padding-top: 0.25rem; }\n.pt-1\\.5 { padding-top: 0.375rem; }\n.pt-2 { padding-top: 0.5rem; }\n.pt-2\\.5 { padding-top: 0.625rem; }\n.space-y-0\\.5 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.125rem; }\n.space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; }\n.space-y-1\\.5 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.375rem; }\n.space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem; }\n.space-y-2\\.5 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.625rem; }\n.bg-\\[\\#06080C\\] { background-color: rgb(6, 8, 12); }\n.bg-\\[\\#080B11\\] { background-color: rgb(8, 11, 17); }\n.bg-\\[\\#081C18\\]\\/92 { background-color: rgba(8, 28, 24, 0.92); }\n.bg-\\[\\#0A0B0E\\] { background-color: rgb(10, 11, 14); }\n.bg-\\[\\#0D1117\\]\\/\\[0\\.92\\] { background-color: rgba(13, 17, 23, 0.92); }\n.bg-\\[\\#0EA5E9\\] { background-color: rgb(14, 165, 233); }\n.bg-\\[\\#0F1722\\] { background-color: rgb(15, 23, 34); }\n.bg-\\[\\#10141B\\]\\/\\[0\\.86\\] { background-color: rgba(16, 20, 27, 0.86); }\n.bg-\\[\\#12151B\\] { background-color: rgb(18, 21, 27); }\n.bg-\\[\\#131820\\] { background-color: rgb(19, 24, 32); }\n.bg-\\[\\#141414\\] { background-color: rgb(20, 20, 20); }\n.bg-\\[\\#14171D\\] { background-color: rgb(20, 23, 29); }\n.bg-\\[\\#151922\\]\\/90 { background-color: rgba(21, 25, 34, 0.9); }\n.bg-\\[\\#16181D\\] { background-color: rgb(22, 24, 29); }\n.bg-\\[\\#163C29\\] { background-color: rgb(22, 60, 41); }\n.bg-\\[\\#18202C\\] { background-color: rgb(24, 32, 44); }\n.bg-\\[\\#182238\\] { background-color: rgb(24, 34, 56); }\n.bg-\\[\\#1E1C18\\] { background-color: rgb(30, 28, 24); }\n.bg-\\[\\#1F1C16\\] { background-color: rgb(31, 28, 22); }\n.bg-\\[\\#2AAE67\\] { background-color: rgb(42, 174, 103); }\n.bg-\\[\\#4ADE80\\] { background-color: rgb(74, 222, 128); }\n.bg-\\[\\#4ADE80\\]\\/12 { background-color: rgba(74, 222, 128, 0.12); }\n.bg-\\[\\#4ADE80\\]\\/20 { background-color: rgba(74, 222, 128, 0.2); }\n.bg-\\[\\#4ADE80\\]\\/25 { background-color: rgba(74, 222, 128, 0.25); }\n.bg-\\[\\#4ADE80\\]\\/28 { background-color: rgba(74, 222, 128, 0.28); }\n.bg-\\[\\#4ADE80\\]\\/35 { background-color: rgba(74, 222, 128, 0.35); }\n.bg-\\[\\#4ADE80\\]\\/70 { background-color: rgba(74, 222, 128, 0.7); }\n.bg-\\[\\#4ADE80\\]\\/85 { background-color: rgba(74, 222, 128, 0.85); }\n.bg-\\[\\#5EEAD4\\] { background-color: rgb(94, 234, 212); }\n.bg-\\[\\#6BE856\\] { background-color: rgb(107, 232, 86); }\n.bg-\\[\\#95EC69\\] { background-color: rgb(149, 236, 105); }\n.bg-\\[\\#DCFCE7\\] { background-color: rgb(220, 252, 231); }\n.bg-\\[\\#EA580C\\] { background-color: rgb(234, 88, 12); }\n.bg-\\[\\#EFECE4\\] { background-color: rgb(239, 236, 228); }\n.bg-\\[\\#EFECE6\\] { background-color: rgb(239, 236, 230); }\n.bg-\\[\\#F3F1EA\\] { background-color: rgb(243, 241, 234); }\n.bg-\\[\\#F59E0B\\] { background-color: rgb(245, 158, 11); }\n.bg-\\[\\#F5AB65\\] { background-color: rgb(245, 171, 101); }\n.bg-\\[\\#F6EAD7\\] { background-color: rgb(246, 234, 215); }\n.bg-\\[\\#F7F6F1\\] { background-color: rgb(247, 246, 241); }\n.bg-\\[\\#FBFAF6\\] { background-color: rgb(251, 250, 246); }\n.bg-black\\/65 { background-color: rgba(0, 0, 0, 0.65); }\n.bg-black\\/70 { background-color: rgba(0, 0, 0, 0.7); }\n.bg-black\\/75 { background-color: rgba(0, 0, 0, 0.75); }\n.bg-black\\/80 { background-color: rgba(0, 0, 0, 0.8); }\n.bg-black\\/\\[0\\.05\\] { background-color: rgba(0, 0, 0, 0.05); }\n.bg-transparent { background-color: transparent; }\n.bg-white { background-color: rgb(255, 255, 255); }\n.bg-white\\/15 { background-color: rgba(255, 255, 255, 0.15); }\n.bg-white\\/\\[0\\.05\\] { background-color: rgba(255, 255, 255, 0.05); }\n.bg-white\\/\\[0\\.06\\] { background-color: rgba(255, 255, 255, 0.06); }\n.bg-white\\/\\[0\\.07\\] { background-color: rgba(255, 255, 255, 0.07); }\n.bg-white\\/\\[0\\.16\\] { background-color: rgba(255, 255, 255, 0.16); }\n.bg-gradient-to-b { background-image: linear-gradient(to bottom, var(--tw-gradient-stops)); }\n.from-\\[\\#0E1923\\] { --tw-gradient-from: rgb(14, 25, 35); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(0,0,0,0)); }\n.via-\\[\\#091118\\] { --tw-gradient-stops: var(--tw-gradient-from), rgb(9, 17, 24), var(--tw-gradient-to, rgba(0,0,0,0)); }\n.to-\\[\\#080B10\\] { --tw-gradient-to: rgb(8, 11, 16); }\n.border { border-width: 1px; border-style: solid; }\n.border-2 { border-width: 2px; border-style: solid; }\n.border-\\[1\\.8px\\] { border-width: 1.8px; border-style: solid; }\n.border-b { border-bottom-width: 1px; border-bottom-style: solid; }\n.border-l { border-left-width: 1px; border-left-style: solid; }\n.border-t { border-top-width: 1px; border-top-style: solid; }\n.text-\\[10\\.5px\\] { font-size: 10.5px; }\n.text-\\[10px\\] { font-size: 10px; }\n.text-\\[11\\.5px\\] { font-size: 11.5px; }\n.text-\\[11px\\] { font-size: 11px; }\n.text-\\[12\\.5px\\] { font-size: 12.5px; }\n.text-\\[12px\\] { font-size: 12px; }\n.text-\\[13\\.5px\\] { font-size: 13.5px; }\n.text-\\[13px\\] { font-size: 13px; }\n.text-\\[14px\\] { font-size: 14px; }\n.text-\\[16px\\] { font-size: 16px; }\n.text-\\[17px\\] { font-size: 17px; }\n.text-\\[18px\\] { font-size: 18px; }\n.text-\\[19px\\] { font-size: 19px; }\n.text-\\[21px\\] { font-size: 21px; }\n.text-\\[22px\\] { font-size: 22px; }\n.text-\\[24px\\] { font-size: 24px; }\n.text-\\[26px\\] { font-size: 26px; }\n.text-\\[27px\\] { font-size: 27px; }\n.text-\\[28px\\] { font-size: 28px; }\n.text-\\[38px\\] { font-size: 38px; }\n.text-\\[8\\.5px\\] { font-size: 8.5px; }\n.text-\\[8px\\] { font-size: 8px; }\n.text-\\[9\\.5px\\] { font-size: 9.5px; }\n.text-\\[9px\\] { font-size: 9px; }\n.text-\\[\\#0B1410\\] { color: rgb(11, 20, 16); }\n.text-\\[\\#0EA5E9\\] { color: rgb(14, 165, 233); }\n.text-\\[\\#111318\\] { color: rgb(17, 19, 24); }\n.text-\\[\\#132610\\] { color: rgb(19, 38, 16); }\n.text-\\[\\#141414\\] { color: rgb(20, 20, 20); }\n.text-\\[\\#15803D\\] { color: rgb(21, 128, 61); }\n.text-\\[\\#181410\\] { color: rgb(24, 20, 16); }\n.text-\\[\\#1F1F1F\\] { color: rgb(31, 31, 31); }\n.text-\\[\\#2AAE67\\] { color: rgb(42, 174, 103); }\n.text-\\[\\#333\\] { color: rgb(51, 51, 51); }\n.text-\\[\\#4ADE80\\] { color: rgb(74, 222, 128); }\n.text-\\[\\#555\\] { color: rgb(85, 85, 85); }\n.text-\\[\\#575651\\] { color: rgb(87, 86, 81); }\n.text-\\[\\#5EEAD4\\] { color: rgb(94, 234, 212); }\n.text-\\[\\#5EEAD4\\]\\/80 { color: rgba(94, 234, 212, 0.8); }\n.text-\\[\\#5EEAD4\\]\\/85 { color: rgba(94, 234, 212, 0.85); }\n.text-\\[\\#666\\] { color: rgb(102, 102, 102); }\n.text-\\[\\#6E6D68\\] { color: rgb(110, 109, 104); }\n.text-\\[\\#86EFAC\\] { color: rgb(134, 239, 172); }\n.text-\\[\\#86EFAC\\]\\/75 { color: rgba(134, 239, 172, 0.75); }\n.text-\\[\\#8C8B85\\] { color: rgb(140, 139, 133); }\n.text-\\[\\#9A9992\\] { color: rgb(154, 153, 146); }\n.text-\\[\\#9BFAD0\\] { color: rgb(155, 250, 208); }\n.text-\\[\\#B87421\\] { color: rgb(184, 116, 33); }\n.text-\\[\\#D97706\\] { color: rgb(217, 119, 6); }\n.text-\\[\\#F59E0B\\] { color: rgb(245, 158, 11); }\n.text-rose-300 { color: rgb(253, 164, 175); }\n.text-rose-400 { color: rgb(251, 113, 133); }\n.text-white { color: rgb(255, 255, 255); }\n.text-white\\/42 { color: rgba(255, 255, 255, 0.42); }\n.text-white\\/45 { color: rgba(255, 255, 255, 0.45); }\n.text-white\\/55 { color: rgba(255, 255, 255, 0.55); }\n.text-white\\/60 { color: rgba(255, 255, 255, 0.6); }\n.text-white\\/65 { color: rgba(255, 255, 255, 0.65); }\n.text-white\\/70 { color: rgba(255, 255, 255, 0.7); }\n.text-white\\/75 { color: rgba(255, 255, 255, 0.75); }\n.text-white\\/80 { color: rgba(255, 255, 255, 0.8); }\n.text-white\\/85 { color: rgba(255, 255, 255, 0.85); }\n.text-white\\/90 { color: rgba(255, 255, 255, 0.9); }\n.text-white\\/95 { color: rgba(255, 255, 255, 0.95); }\n.border-\\[\\#141414\\]\\/75 { border-color: rgba(20, 20, 20, 0.75); }\n.border-\\[\\#4ADE80\\] { border-color: rgb(74, 222, 128); }\n.border-\\[\\#4ADE80\\]\\/30 { border-color: rgba(74, 222, 128, 0.3); }\n.border-\\[\\#4ADE80\\]\\/35 { border-color: rgba(74, 222, 128, 0.35); }\n.border-\\[\\#4ADE80\\]\\/45 { border-color: rgba(74, 222, 128, 0.45); }\n.border-\\[\\#4ADE80\\]\\/65 { border-color: rgba(74, 222, 128, 0.65); }\n.border-\\[\\#4ADE80\\]\\/80 { border-color: rgba(74, 222, 128, 0.8); }\n.border-\\[\\#F59E0B\\] { border-color: rgb(245, 158, 11); }\n.border-black\\/15 { border-color: rgba(0, 0, 0, 0.15); }\n.border-black\\/5 { border-color: rgba(0, 0, 0, 0.05); }\n.border-black\\/\\[0\\.05\\] { border-color: rgba(0, 0, 0, 0.05); }\n.border-black\\/\\[0\\.06\\] { border-color: rgba(0, 0, 0, 0.06); }\n.border-black\\/\\[0\\.09\\] { border-color: rgba(0, 0, 0, 0.09); }\n.border-transparent { border-color: transparent; }\n.border-white\\/10 { border-color: rgba(255, 255, 255, 0.1); }\n.border-white\\/\\[0\\.05\\] { border-color: rgba(255, 255, 255, 0.05); }\n.border-white\\/\\[0\\.08\\] { border-color: rgba(255, 255, 255, 0.08); }\n.border-white\\/\\[0\\.09\\] { border-color: rgba(255, 255, 255, 0.09); }\n.border-white\\/\\[0\\.12\\] { border-color: rgba(255, 255, 255, 0.12); }\n.border-white\\/\\[0\\.13\\] { border-color: rgba(255, 255, 255, 0.13); }\n.border-white\\/\\[0\\.15\\] { border-color: rgba(255, 255, 255, 0.15); }\n.border-white\\/\\[0\\.1\\] { border-color: rgba(255, 255, 255, 0.1); }\n.border-t-transparent { border-top-color: transparent; }\n.-rotate-90 { transform: rotate(-90deg); }\n.backdrop-blur-md { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }\n.backdrop-blur-xl { backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }\n.brightness-95 { filter: brightness(.95); }\n.drop-shadow-\\[0_0_14px_rgba\\(74\\,222\\,128\\,0\\.85\\)\\] { filter: drop-shadow(0 0 14px rgba(74,222,128,0.85)); }\n.mix-blend-screen { mix-blend-mode: screen; }\n.scale-105 { transform: scale(1.05); }\n.shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1); }\n.shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }\n.shadow-2xs { box-shadow: 0 1px rgba(0, 0, 0, 0.05); }\n.shadow-\\[0_0_6px_\\#4ADE80\\] { box-shadow: 0 0 6px #4ADE80; }\n.shadow-\\[0_0_8px_rgba\\(74\\,222\\,128\\,0\\.6\\)\\] { box-shadow: 0 0 8px rgba(74,222,128,0.6); }\n.shadow-\\[0_0_9px_\\#4ADE80\\] { box-shadow: 0 0 9px #4ADE80; }\n.shadow-\\[0_30px_80px_rgba\\(0\\,0\\,0\\,0\\.95\\)\\] { box-shadow: 0 30px 80px rgba(0,0,0,0.95); }\n.shadow-\\[0_3px_12px_rgba\\(0\\,0\\,0\\,0\\.05\\)\\] { box-shadow: 0 3px 12px rgba(0,0,0,0.05); }\n.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }\n.opacity-0 { opacity: 0; }\n.opacity-60 { opacity: 0.6; }\n.opacity-85 { opacity: 0.85; }\n.transition { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }\n.transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }\n.transition-opacity { transition-property: opacity; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }\n.transition-transform { transition-property: transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }\n.duration-1000 { transition-duration: 1000ms; }\n.duration-400 { transition-duration: 400ms; }\n.duration-500 { transition-duration: 500ms; }\n.animate-pulse { animation: tw-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }\n.animate-spin { animation: tw-spin 1s linear infinite; }\n.hover\\:bg-\\[\\#202634\\]:hover { background-color: rgb(32, 38, 52); }\n.hover\\:bg-\\[\\#E4E0D5\\]:hover { background-color: rgb(228, 224, 213); }\n.hover\\:bg-\\[\\#F7BA7E\\]:hover { background-color: rgb(247, 186, 126); }\n.hover\\:bg-\\[\\#FBBF24\\]:hover { background-color: rgb(251, 191, 36); }\n.hover\\:bg-neutral-100:hover { background-color: rgb(245, 245, 245); }\n.hover\\:bg-neutral-50:hover { background-color: rgb(250, 250, 250); }\n.hover\\:bg-white\\/\\[0\\.11\\]:hover { background-color: rgba(255, 255, 255, 0.11); }\n.hover\\:bg-white\\/\\[0\\.12\\]:hover { background-color: rgba(255, 255, 255, 0.12); }\n.hover\\:bg-white\\/\\[0\\.15\\]:hover { background-color: rgba(255, 255, 255, 0.15); }\n.group:hover .group-hover\\:text-white { color: rgb(255, 255, 255); }\n.hover\\:text-\\[\\#5EEAD4\\]:hover { color: rgb(94, 234, 212); }\n.hover\\:text-white:hover { color: rgb(255, 255, 255); }\n.hover\\:border-\\[\\#F59E0B\\]:hover { border-color: rgb(245, 158, 11); }\n.hover\\:scale-\\[1\\.03\\]:hover { transform: scale(1.03); }\n.active\\:scale-\\[0\\.99\\]:active { transform: scale(0.99); }\n@media (min-width: 640px) {\n  .sm\\:flex-row { flex-direction: row; }\n  .sm\\:items-end { align-items: flex-end; }\n  .sm\\:whitespace-nowrap { white-space: nowrap; }\n  .sm\\:gap-5 { gap: 1.25rem; }\n  .sm\\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }\n  .sm\\:text-\\[31px\\] { font-size: 31px; }\n}\n@media (min-width: 1280px) {\n  .xl\\:flex-row { flex-direction: row; }\n  .xl\\:items-end { align-items: flex-end; }\n}";
  const wrapEl = document.createElement('div');
  wrapEl.className = 'ai-root flex flex-col items-center w-full';
  wrapEl.innerHTML = "<!-- ==================== 顶部标题与全局场景/视角控制栏 ==================== -->\n  <header class=\"w-full max-w-[1360px] mb-3.5 flex flex-col xl:flex-row xl:items-end justify-between gap-3\">\n    <!-- 左侧模块标识、AI 实景工具条与大标题 -->\n    <div class=\"flex flex-col gap-1.5 shrink-0\">\n      <div class=\"flex flex-wrap items-center gap-2\">\n        <div class=\"text-[12px] font-semibold tracking-[0.08em] text-[#F59E0B] whitespace-nowrap\">\n          核心模块 01 · AI 硬件控手机\n        </div>\n        <div class=\"flex items-center gap-1.5\">\n          <button data-ai-action=\"gen-bg\" id=\"ai-bg-btn\" title=\"调用 Gemini 影像模型实时生成头盔内第一人称高速实景照片\"\n            class=\"h-[24px] px-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-[11px] text-white/75 hover:text-white flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0\">\n            <span id=\"ai-bg-dot\" class=\"w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse shrink-0\"></span>\n            <span id=\"ai-bg-status\">AI 正在生成头盔实景...</span>\n          </button>\n          <label title=\"上传本地骑行实景照片作为头盔视野背景\"\n            class=\"h-[24px] px-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.1] text-[11px] text-white/65 hover:text-white flex items-center gap-1 transition cursor-pointer whitespace-nowrap shrink-0\">\n            <span>上传实景图</span>\n            <input type=\"file\" accept=\"image/*\" class=\"hidden\" id=\"ai-local-bg-input\" />\n          </label>\n        </div>\n      </div>\n      <h1 class=\"text-[26px] sm:text-[31px] font-extrabold tracking-[-0.02em] text-white leading-none sm:whitespace-nowrap\">\n        不摘手套，一句话控手机\n      </h1>\n    </div>\n\n    <!-- 右侧：四大业务场景胶囊（选中态纯白底黑字） + 三端视角切换胶囊 -->\n    <div class=\"flex flex-wrap items-center gap-2\">\n      <!-- 四大核心场景 -->\n      <div class=\"flex flex-wrap items-center gap-1.5\">\n        <button data-ai-action=\"scenario\" data-sc=\"wechat\" id=\"sc-pill-wechat\"\n          class=\"h-[34px] px-3.5 rounded-full text-[13px] font-bold transition-all flex items-center gap-2 bg-white text-[#111318] shadow-sm cursor-pointer\">\n          <span class=\"w-[18px] h-[18px] rounded-full bg-[#2AAE67] text-white text-[10.5px] font-bold flex items-center justify-center shrink-0\">微</span>\n          <span>微信总结汇报</span>\n        </button>\n\n        <button data-ai-action=\"scenario\" data-sc=\"meituan\" id=\"sc-pill-meituan\"\n          class=\"h-[34px] px-3.5 rounded-full text-[13px] font-medium transition-all flex items-center gap-2 bg-white/[0.06] border border-white/[0.1] text-white/80 hover:text-white hover:bg-white/[0.11] cursor-pointer\">\n          <span class=\"w-[18px] h-[18px] rounded-full bg-[#F59E0B] text-[#141414] text-[10.5px] font-extrabold flex items-center justify-center shrink-0\">团</span>\n          <span>顺路点奶茶导航</span>\n        </button>\n\n        <button data-ai-action=\"scenario\" data-sc=\"dji_voice\" id=\"sc-pill-dji_voice\"\n          class=\"h-[34px] px-3.5 rounded-full text-[13px] font-medium transition-all flex items-center gap-2 bg-white/[0.06] border border-white/[0.1] text-white/80 hover:text-white hover:bg-white/[0.11] cursor-pointer\">\n          <span class=\"w-[18px] h-[18px] rounded-full bg-[#0EA5E9] text-white text-[10.5px] font-bold flex items-center justify-center shrink-0\">疆</span>\n          <span>语音控大疆</span>\n        </button>\n\n        <button data-ai-action=\"scenario\" data-sc=\"dji_group\" id=\"sc-pill-dji_group\"\n          class=\"h-[34px] px-3.5 rounded-full text-[13px] font-medium transition-all flex items-center gap-2 bg-white/[0.06] border border-white/[0.1] text-white/80 hover:text-white hover:bg-white/[0.11] cursor-pointer\">\n          <span class=\"w-[18px] h-[18px] rounded-full bg-[#EA580C] text-white text-[10.5px] font-bold flex items-center justify-center shrink-0\">群</span>\n          <span>定位感应发车友群</span>\n        </button>\n      </div>\n\n      <!-- 硬件视角切换器（默认激活 [⊞ 三端同屏] 琥珀橙高亮） -->\n      <div class=\"h-[34px] p-[3px] rounded-[10px] bg-[#14171D] border border-white/[0.12] flex items-center gap-0.5\">\n        <button data-ai-action=\"view\" data-mode=\"all\" id=\"view-btn-all\"\n          class=\"h-full px-3 rounded-[7px] text-[12.5px] font-bold transition-all flex items-center gap-1.5 bg-[#F59E0B] text-[#141414] cursor-pointer\">\n          <span>⊞</span><span>三端同屏</span>\n        </button>\n        <button data-ai-action=\"view\" data-mode=\"visor\" id=\"view-btn-visor\"\n          class=\"h-full px-3 rounded-[7px] text-[12.5px] font-medium transition-all flex items-center gap-1.5 text-white/75 hover:text-white cursor-pointer\">\n          <span>▭</span><span>镜片视角</span>\n        </button>\n        <button data-ai-action=\"view\" data-mode=\"pod\" id=\"view-btn-pod\"\n          class=\"h-full px-3 rounded-[7px] text-[12.5px] font-medium transition-all flex items-center gap-1.5 text-white/75 hover:text-white cursor-pointer\">\n          <span>○</span><span>圆盘特写</span>\n        </button>\n      </div>\n    </div>\n  </header>\n\n  <!-- ==================== 自适应缩放包装器（确保在任意笔记本/大屏保持精准坐标比例） ==================== -->\n  <div id=\"stage-scale-wrapper\" class=\"relative w-full overflow-hidden\">\n    <main class=\"helmet-pov-viewport\" id=\"helmet-stage\">\n\n      <!-- 1. 第 0 帧即刻呈现的真实夜间高速公路 + 真实摩托第一人称车把摄影融合层（零简笔画 SVG） -->\n      <div class=\"absolute inset-0 overflow-hidden bg-[#06080C] z-0\">\n        <!-- 光学景深暗调夜空与路灯柔光基底 -->\n        <div class=\"absolute inset-0\"\n          style=\"background:\n            radial-gradient(circle at 52% 48%, rgba(239, 68, 68, 0.22) 0%, transparent 28%),\n            radial-gradient(circle at 46% 36%, rgba(245, 158, 11, 0.18) 0%, transparent 34%),\n            linear-gradient(180deg, #04060A 0%, #090C13 42%, #11141C 58%, #06080B 100%);\">\n        </div>\n\n        <!-- 真实夜间城市多车道高速公路车流摄影底图 -->\n        <img id=\"fallback-highway-img\"\n          src=\"https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1920&q=85\"\n          alt=\"夜间城市高速实景\"\n          class=\"pov-photo-motion absolute inset-0 w-full h-full object-cover object-center opacity-85\"\n          style=\"filter: brightness(0.72) contrast(1.12);\"\n        />\n\n        <!-- 真实仿赛摩托夜间第一人称把立摄影暗调融合层（仅底部中间区域自然显影） -->\n        <img id=\"fallback-cockpit-img\"\n          src=\"https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1600&q=85\"\n          alt=\"真实摩托第一人称车把\"\n          class=\"real-cockpit-photo-mask absolute inset-x-0 bottom-0 w-full h-[58%] object-cover object-center pointer-events-none\"\n        />\n\n        <!-- 右上方夜空净空渐变压暗保护层（确保右上方 HUD 背景深邃纯净、对比度极佳） -->\n        <div class=\"absolute inset-0 pointer-events-none\"\n          style=\"background: radial-gradient(circle at 82% 18%, rgba(4, 6, 10, 0.82) 0%, rgba(4, 6, 10, 0.42) 32%, transparent 62%);\">\n        </div>\n\n        <!-- Gemini AI 实时生成的专属「头盔内第一人称夜间高速骑行实景照片」平滑淡入层 -->\n        <img id=\"ai-generated-pov-img\"\n          alt=\"AI 生成头盔内第一人称夜间高速实景\"\n          class=\"pov-photo-motion absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-opacity duration-1000 pointer-events-none\"\n        />\n\n        <!-- 微动态高速尾灯与路灯掠影 Canvas（增强真实夜骑行进感） -->\n        <canvas id=\"highway-motion-canvas\" class=\"absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-60\"></canvas>\n      </div>\n\n      <!-- 2. 真实全盔内部包裹边缘层：顶部风镜密封胶条、两侧脸颊海绵暗角、底部碳纤维下巴护罩与鼻翼导流边缘 -->\n      <div class=\"helmet-interior-liner\"></div>\n      <div class=\"helmet-visor-top-seal\"></div>\n      <div class=\"helmet-chin-guard\"></div>\n\n      <!-- 头盔风镜玻璃极细微边缘光学折射弧线 -->\n      <div class=\"absolute inset-[10px] rounded-[22px] border border-white/[0.05] pointer-events-none z-14\"></div>\n\n      <!-- ==================== 3. 骑手语音识别悬浮胶囊（置于手机右侧偏中上方，绝不与右上方 HUD 冲突） ==================== -->\n      <div style=\"position: absolute; top: 28px; left: 342px; max-width: 428px;\" class=\"z-30\">\n        <div class=\"min-h-[40px] px-3.5 py-1.5 rounded-full bg-[#10141B]/[0.86] backdrop-blur-md border border-white/[0.13] shadow-2xl flex items-center gap-2.5\">\n          <span id=\"voice-role-tag\"\n            class=\"w-[23px] h-[23px] rounded-full bg-[#163C29] border border-[#4ADE80]/45 text-[#4ADE80] text-[11px] font-bold flex items-center justify-center shrink-0\">\n            你\n          </span>\n          <span id=\"voice-command-text\" class=\"text-[13px] font-medium text-white/95 leading-snug line-clamp-2\">\n            你好骑士，总结一下微信工作群刚聊了什么\n          </span>\n        </div>\n      </div>\n\n      <!-- ==================== 4. 第一端（左侧）：苹果 iPhone 真机「你的手机 · 骑士 App」 ==================== -->\n      <div style=\"position: absolute; left: 28px; top: 26px;\" class=\"z-30 flex flex-col items-center\">\n        <div class=\"iphone-chassis\">\n          <div class=\"iphone-display\" id=\"iphone-surface\">\n            <!-- AI 自动触控波纹层 -->\n            <div id=\"iphone-ripple-box\" class=\"absolute inset-0 pointer-events-none z-50\"></div>\n\n            <!-- iOS 状态栏 + 灵动岛 -->\n            <div class=\"px-5 pt-2.5 pb-1.5 flex items-center justify-between text-[11.5px] font-bold text-[#141414] bg-[#F7F6F1] shrink-0\">\n              <span>09:41</span>\n              <div class=\"w-[78px] h-[21px] rounded-full bg-[#0A0B0E] flex items-center justify-end pr-2.5\">\n                <span class=\"w-2 h-2 rounded-full bg-[#182238] border border-white/10\"></span>\n              </div>\n              <div class=\"flex items-center gap-1\">\n                <svg class=\"w-3.5 h-2.5\" viewBox=\"0 0 16 12\" fill=\"#141414\">\n                  <rect x=\"1\" y=\"8\" width=\"2\" height=\"4\" rx=\"0.5\"/>\n                  <rect x=\"4.5\" y=\"5.5\" width=\"2\" height=\"6.5\" rx=\"0.5\"/>\n                  <rect x=\"8\" y=\"3\" width=\"2\" height=\"9\" rx=\"0.5\"/>\n                  <rect x=\"11.5\" y=\"0.5\" width=\"2\" height=\"11.5\" rx=\"0.5\"/>\n                </svg>\n                <svg class=\"w-3.5 h-2.5\" viewBox=\"0 0 16 12\" fill=\"none\" stroke=\"#141414\" stroke-width=\"1.6\" stroke-linecap=\"round\">\n                  <path d=\"M2 4.5C5.5 1.5 10.5 1.5 14 4.5\"/>\n                  <path d=\"M4.5 7.2C6.7 5.3 9.3 5.3 11.5 7.2\"/>\n                  <circle cx=\"8\" cy=\"10\" r=\"1\" fill=\"#141414\"/>\n                </svg>\n                <div class=\"w-[18px] h-[9.5px] rounded-[2.5px] border border-[#141414]/75 p-[1px]\">\n                  <div class=\"w-full h-full bg-[#141414] rounded-[1px]\"></div>\n                </div>\n              </div>\n            </div>\n\n            <!-- 骑士随行 App 顶栏 -->\n            <div class=\"px-4 pt-1 pb-2.5 border-b border-black/[0.06] bg-[#F7F6F1] shrink-0 flex items-center justify-between\">\n              <div>\n                <div class=\"text-[17px] font-extrabold text-[#141414] leading-tight\">骑士随行</div>\n                <div class=\"flex items-center gap-1.5 mt-0.5 text-[10px] text-[#6E6D68] font-medium\">\n                  <span class=\"w-1.5 h-1.5 rounded-full bg-[#2AAE67]\"></span>\n                  <span>骑行助手 · 镜片和圆盘已连接</span>\n                </div>\n              </div>\n              <span class=\"px-2 py-0.5 rounded-full bg-black/[0.05] text-[9.5px] font-semibold text-[#555]\">AI 接管中</span>\n            </div>\n\n            <!-- 骑士随行主对话流与内嵌应用卡片容器 -->\n            <div id=\"iphone-card-stream\" class=\"flex-1 px-3 py-2.5 overflow-y-auto no-scrollbar space-y-2.5 bg-[#F7F6F1]\">\n              <!-- JS 实时同步渲染 -->\n            </div>\n\n            <!-- 底部按住说话 + 6 栏导航 -->\n            <div class=\"bg-[#FBFAF6] border-t border-black/[0.06] px-3 pt-2 pb-1.5 shrink-0\">\n              <div class=\"flex items-center gap-2 mb-2\">\n                <button data-ai-action=\"step-next\" title=\"点击推进下一步语音指令\"\n                  class=\"w-[29px] h-[29px] rounded-full bg-white border border-black/[0.09] flex items-center justify-center text-[#141414] hover:bg-neutral-100 cursor-pointer shrink-0\">\n                  <svg class=\"w-3.5 h-3.5\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n                    <rect x=\"9\" y=\"2\" width=\"6\" height=\"11\" rx=\"3\"/>\n                    <path d=\"M5 10a7 7 0 0014 0M12 17v4M9 21h6\"/>\n                  </svg>\n                </button>\n                <button data-ai-action=\"step-next\"\n                  class=\"flex-1 h-[29px] rounded-full bg-white border border-black/[0.09] text-[11.5px] font-semibold text-[#141414] flex items-center justify-center hover:bg-neutral-50 active:scale-[0.99] transition cursor-pointer\">\n                  按住 说话\n                </button>\n              </div>\n\n              <div class=\"grid grid-cols-6 text-center text-[9px] text-[#8C8B85] pb-1\">\n                <div class=\"flex flex-col items-center gap-0.5\">\n                  <svg class=\"w-3.5 h-3.5\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M12 3l8 7v10H4V10l8-7z\"/></svg>\n                  <span>骑行</span>\n                </div>\n                <div class=\"flex flex-col items-center gap-0.5 text-[#141414] font-bold\">\n                  <svg class=\"w-3.5 h-3.5\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M12 2l2.3 6.7L21 11l-6.7 2.3L12 20l-2.3-6.7L3 11l6.7-2.3L12 2z\"/></svg>\n                  <span>AI</span>\n                </div>\n                <div class=\"flex flex-col items-center gap-0.5\">\n                  <svg class=\"w-3.5 h-3.5\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><circle cx=\"9\" cy=\"8\" r=\"3\"/><circle cx=\"16\" cy=\"9\" r=\"2.5\"/><path d=\"M3 19c0-3 2.7-5 6-5s6 2 6 5\"/></svg>\n                  <span>组队</span>\n                </div>\n                <div class=\"flex flex-col items-center gap-0.5\">\n                  <svg class=\"w-3.5 h-3.5\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z\"/></svg>\n                  <span>路线</span>\n                </div>\n                <div class=\"flex flex-col items-center gap-0.5\">\n                  <svg class=\"w-3.5 h-3.5\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><rect x=\"4\" y=\"4\" width=\"16\" height=\"13\" rx=\"2\"/><path d=\"M8 21l4-4h8\"/></svg>\n                  <span>社区</span>\n                </div>\n                <div class=\"flex flex-col items-center gap-0.5\">\n                  <svg class=\"w-3.5 h-3.5\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M5 20c0-3.8 3.1-6.5 7-6.5s7 2.7 7 6.5\"/></svg>\n                  <span>我的</span>\n                </div>\n              </div>\n              <div class=\"w-24 h-[3.5px] rounded-full bg-black/80 mx-auto\"></div>\n            </div>\n          </div>\n        </div>\n\n        <!-- 手机底部说明标签 -->\n        <div class=\"mt-2 text-[12.5px] text-white/55 font-medium tracking-wide\">\n          你的手机 · 骑士 App\n        </div>\n      </div>\n\n      <!-- ==================== 5. 第二端（严格位于画面右上方）：头盔风镜透明光学贴片 HUD ==================== -->\n      <!-- 位置严格锁定：top: 32px; right: 38px; width: 410px; 处于深色夜空区，绝不下沉遮挡底部车把 -->\n      <div id=\"helmet-upper-right-hud\" class=\"visor-hud-patch z-30 px-5 py-4 flex items-stretch gap-3.5\">\n        <!-- 四角荧光绿光学定位角标 -->\n        <span class=\"hud-corner hud-corner-tl\"></span>\n        <span class=\"hud-corner hud-corner-tr\"></span>\n        <span class=\"hud-corner hud-corner-bl\"></span>\n        <span class=\"hud-corner hud-corner-br\"></span>\n\n        <!-- 左侧光学波导棱镜导光条 -->\n        <div class=\"waveguide-prism-bar shrink-0 my-0.5\"></div>\n\n        <!-- 右侧全息荧光绿核心显示内容 -->\n        <div class=\"flex-1 flex flex-col justify-between min-w-0 py-0.5\">\n          <!-- 顶部状态栏 -->\n          <div class=\"flex items-center justify-between gap-2\">\n            <div class=\"flex items-center gap-2 text-[13px] font-semibold hud-phosphor-sub min-w-0\">\n              <span id=\"hud-spinner\" class=\"w-3.5 h-3.5 rounded-full border-[1.8px] border-[#4ADE80] border-t-transparent animate-spin shrink-0\"></span>\n              <span id=\"hud-status-label\" class=\"truncate\">AI 正在替你操作 · 骑士</span>\n            </div>\n            <span class=\"text-[10.5px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-[#4ADE80]/12 border border-[#4ADE80]/30 text-[#86EFAC] shrink-0\">\n              头盔风镜 HUD\n            </span>\n          </div>\n\n          <!-- 核心大标题 (26-30px) + 辅助实时参数/摘要 (13-14px) -->\n          <div id=\"hud-main-body\" class=\"my-2.5\">\n            <!-- JS 毫秒级同步注入 -->\n          </div>\n\n          <!-- 底部四节点光学进度连线 ●━━●━━○━━○ -->\n          <div class=\"flex items-center justify-between pt-1\">\n            <div id=\"hud-optical-nodes\" class=\"flex items-center gap-1.5\">\n              <!-- JS 渲染 ●━━●━━○━━○ -->\n            </div>\n            <span id=\"hud-step-hint\" class=\"text-[10.5px] font-mono text-[#86EFAC]/75\">STEP 01/04</span>\n          </div>\n        </div>\n      </div>\n\n      <!-- ==================== 6. 第三端 A（默认三端同屏：底部车把中央硬件防水圆盘屏） ==================== -->\n      <div id=\"handlebar-center-pod\"\n        style=\"position: absolute; bottom: 58px; left: 53%; transform: translateX(-50%);\"\n        class=\"z-25 flex flex-col items-center transition-all duration-400\">\n\n        <!-- 两侧淡淡青蓝色破风气流光束 -->\n        <svg class=\"absolute -left-[95px] top-[12px] w-[344px] h-[135px] pointer-events-none z-0 opacity-85\" viewBox=\"0 0 344 135\">\n          <defs>\n            <linearGradient id=\"miniAeroCyan\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"0%\">\n              <stop offset=\"0%\" stop-color=\"#38BDF8\" stop-opacity=\"0\"/>\n              <stop offset=\"28%\" stop-color=\"#67E8F9\" stop-opacity=\"0.72\"/>\n              <stop offset=\"72%\" stop-color=\"#2DD4BF\" stop-opacity=\"0.72\"/>\n              <stop offset=\"100%\" stop-color=\"#38BDF8\" stop-opacity=\"0\"/>\n            </linearGradient>\n          </defs>\n          <path class=\"aero-wind-line\" d=\"M 4 36 Q 172 58 340 28\" fill=\"none\" stroke=\"url(#miniAeroCyan)\" stroke-width=\"2\"/>\n          <path class=\"aero-wind-line\" d=\"M 0 74 Q 172 82 344 70\" fill=\"none\" stroke=\"url(#miniAeroCyan)\" stroke-width=\"1.6\"/>\n          <path class=\"aero-wind-line\" d=\"M 14 108 Q 172 95 330 112\" fill=\"none\" stroke=\"url(#miniAeroCyan)\" stroke-width=\"2\"/>\n        </svg>\n\n        <!-- 立体三防圆角八边方形硬件圆盘（约 154x162px，点击可展开特写卡片） -->\n        <div data-ai-action=\"view\" data-mode=\"pod\" title=\"点击放大查看「车把防水屏」水珠与破风特写\"\n          class=\"rugged-pod-housing z-10 w-[154px] h-[162px] p-2.5 flex flex-col items-center justify-between cursor-pointer hover:scale-[1.03] transition-transform\"\n          style=\"transform: perspective(650px) rotateX(6deg) rotateY(-5deg);\">\n\n          <!-- 立体高光防水水珠 -->\n          <span class=\"water-bead w-2 h-1.5 top-2.5 left-5\"></span>\n          <span class=\"water-bead w-1.5 h-1.5 top-5 left-2.5\"></span>\n          <span class=\"water-bead w-2 h-1.5 top-2.5 right-6\"></span>\n          <span class=\"water-bead w-1.5 h-1.5 bottom-10 left-2\"></span>\n          <span class=\"water-bead w-2 h-1.5 bottom-9 right-2.5\"></span>\n\n          <!-- 正圆形防眩光深青黑 OLED 屏 (#072220) -->\n          <div class=\"pod-circular-oled w-[114px] h-[114px] flex flex-col items-center justify-center p-2\">\n            <!-- 环形状态光弧 -->\n            <svg class=\"absolute inset-0 w-full h-full -rotate-90 pointer-events-none\" viewBox=\"0 0 100 100\">\n              <circle cx=\"50\" cy=\"50\" r=\"46\" fill=\"none\" stroke=\"rgba(126,247,196,0.1)\" stroke-width=\"2.5\"/>\n              <circle id=\"mini-pod-arc\" cx=\"50\" cy=\"50\" r=\"46\" fill=\"none\" stroke=\"#5EEAD4\" stroke-width=\"2.8\"\n                stroke-dasharray=\"289\" stroke-dashoffset=\"144\" stroke-linecap=\"round\" class=\"transition-all duration-500\"/>\n            </svg>\n            <div id=\"mini-pod-oled-content\" class=\"relative z-10 w-full h-full flex flex-col items-center justify-center text-center\">\n              <!-- JS 实时同步注入 -->\n            </div>\n          </div>\n\n          <!-- 底部三颗可点击橡胶实体按键（阻止冒泡直接控步） -->\n          <div class=\"flex items-center justify-center gap-1.5 z-20 pt-0.5\" data-stop-prop=\"1\">\n            <button data-ai-action=\"step-prev\" title=\"左翻：上一步\"\n              class=\"pod-rubber-btn w-8 h-[18px] rounded-[5px] text-[8.5px] text-white/75 hover:text-[#5EEAD4] flex items-center justify-center cursor-pointer\">◀</button>\n            <button data-ai-action=\"toggle-play\" title=\"AI 确认 / 暂停\"\n              class=\"pod-rubber-btn w-9 h-[18px] rounded-[5px] text-[8.5px] text-[#5EEAD4] font-bold flex items-center justify-center cursor-pointer\">●</button>\n            <button data-ai-action=\"step-next\" title=\"右翻：下一步 / 下一路口\"\n              class=\"pod-rubber-btn w-8 h-[18px] rounded-[5px] text-[8.5px] text-white/75 hover:text-[#5EEAD4] flex items-center justify-center cursor-pointer\">▶</button>\n          </div>\n        </div>\n      </div>\n\n      <!-- ==================== 7. 第三端 B（点击 [○ 圆盘特写] 或点击车把圆盘弹出的高拟真放大特写卡片） ==================== -->\n      <div id=\"pod-closeup-card\"\n        style=\"position: absolute; right: 38px; bottom: 58px; width: 540px; height: 392px;\"\n        class=\"hidden z-35 rounded-[20px] bg-[#0D1117]/[0.92] backdrop-blur-xl border border-white/[0.15] shadow-[0_30px_80px_rgba(0,0,0,0.95)] overflow-hidden flex-col justify-between\">\n\n        <!-- 特写卡片顶栏 -->\n        <div class=\"px-4 py-2.5 bg-[#131820] border-b border-white/[0.08] flex items-center justify-between shrink-0\">\n          <div class=\"flex items-center gap-2\">\n            <span class=\"w-2 h-2 rounded-full bg-[#5EEAD4]\"></span>\n            <span class=\"text-[13.5px] font-bold text-white tracking-wide\">车把防水屏 · 实体硬件同步特写</span>\n          </div>\n          <button data-ai-action=\"view\" data-mode=\"all\" title=\"返回三端同屏\"\n            class=\"w-6 h-6 rounded-full bg-white/[0.07] hover:bg-white/[0.15] text-white/75 hover:text-white text-[13px] flex items-center justify-center cursor-pointer\">\n            ✕\n          </button>\n        </div>\n\n        <!-- 中间强烈破风青色光流 + 放大版水珠三防圆盘硬件 -->\n        <div class=\"relative flex-1 flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0E1923] via-[#091118] to-[#080B10]\">\n          <!-- 强烈破风青色光流 SVG -->\n          <svg class=\"absolute inset-0 w-full h-full pointer-events-none\" viewBox=\"0 0 540 280\">\n            <defs>\n              <linearGradient id=\"closeupWindGrad\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"0%\">\n                <stop offset=\"0%\" stop-color=\"#0EA5E9\" stop-opacity=\"0\"/>\n                <stop offset=\"25%\" stop-color=\"#67E8F9\" stop-opacity=\"0.9\"/>\n                <stop offset=\"75%\" stop-color=\"#2DD4BF\" stop-opacity=\"0.9\"/>\n                <stop offset=\"100%\" stop-color=\"#0EA5E9\" stop-opacity=\"0\"/>\n              </linearGradient>\n              <linearGradient id=\"barTubeGrad\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n                <stop offset=\"0%\" stop-color=\"#383E4A\"/>\n                <stop offset=\"45%\" stop-color=\"#181C23\"/>\n                <stop offset=\"100%\" stop-color=\"#07090D\"/>\n              </linearGradient>\n            </defs>\n            <path class=\"aero-wind-line\" d=\"M 0 68 Q 270 112 540 54\" fill=\"none\" stroke=\"url(#closeupWindGrad)\" stroke-width=\"3.2\"/>\n            <path class=\"aero-wind-line\" d=\"M 0 118 Q 270 144 540 108\" fill=\"none\" stroke=\"url(#closeupWindGrad)\" stroke-width=\"2.2\"/>\n            <path class=\"aero-wind-line\" d=\"M 0 168 Q 270 156 540 176\" fill=\"none\" stroke=\"url(#closeupWindGrad)\" stroke-width=\"3.4\"/>\n            <path class=\"aero-wind-line\" d=\"M 10 206 Q 270 185 530 215\" fill=\"none\" stroke=\"url(#closeupWindGrad)\" stroke-width=\"1.8\"/>\n            <!-- 湿润金属车把横管 -->\n            <path d=\"M 20 265 Q 265 210 520 256\" fill=\"none\" stroke=\"url(#barTubeGrad)\" stroke-width=\"44\" stroke-linecap=\"round\"/>\n            <path d=\"M 35 254 Q 265 201 508 246\" fill=\"none\" stroke=\"rgba(255,255,255,0.18)\" stroke-width=\"2.5\"/>\n          </svg>\n\n          <!-- 放大版带立体水珠的防水圆盘主体 -->\n          <div class=\"rugged-pod-housing z-10 w-[218px] h-[228px] p-3.5 flex flex-col items-center justify-between\"\n            style=\"transform: perspective(760px) rotateY(-12deg) rotateX(7deg) rotateZ(-6deg);\">\n            <span class=\"water-bead w-3 h-2.5 top-3 left-8\"></span>\n            <span class=\"water-bead w-2 h-2 top-6 left-4\"></span>\n            <span class=\"water-bead w-2.5 h-2 top-3 right-9\"></span>\n            <span class=\"water-bead w-2 h-2 top-9 right-4\"></span>\n            <span class=\"water-bead w-3 h-2.5 top-20 left-2.5\"></span>\n            <span class=\"water-bead w-2.5 h-2 bottom-14 right-3\"></span>\n            <span class=\"water-bead w-2 h-1.5 bottom-3.5 left-11\"></span>\n\n            <div class=\"pod-circular-oled w-[164px] h-[164px] flex flex-col items-center justify-center p-3\">\n              <svg class=\"absolute inset-0 w-full h-full -rotate-90 pointer-events-none\" viewBox=\"0 0 100 100\">\n                <circle cx=\"50\" cy=\"50\" r=\"46.5\" fill=\"none\" stroke=\"rgba(126,247,196,0.1)\" stroke-width=\"2.2\"/>\n                <circle id=\"large-pod-arc\" cx=\"50\" cy=\"50\" r=\"46.5\" fill=\"none\" stroke=\"#5EEAD4\" stroke-width=\"2.6\"\n                  stroke-dasharray=\"292\" stroke-dashoffset=\"146\" stroke-linecap=\"round\" class=\"transition-all duration-500\"/>\n              </svg>\n              <div id=\"large-pod-oled-content\" class=\"relative z-10 w-full h-full flex flex-col items-center justify-center text-center\">\n                <!-- JS 同步注入 -->\n              </div>\n            </div>\n\n            <div class=\"flex items-center justify-center gap-2 z-20\">\n              <button data-ai-action=\"step-prev\" class=\"pod-rubber-btn w-10 h-[22px] rounded-[6px] text-[9.5px] text-white/75 hover:text-[#5EEAD4] flex items-center justify-center cursor-pointer\">◀</button>\n              <button data-ai-action=\"toggle-play\" class=\"pod-rubber-btn w-11 h-[22px] rounded-[6px] text-[9.5px] text-[#5EEAD4] font-bold flex items-center justify-center cursor-pointer\">●</button>\n              <button data-ai-action=\"step-next\" class=\"pod-rubber-btn w-10 h-[22px] rounded-[6px] text-[9.5px] text-white/75 hover:text-[#5EEAD4] flex items-center justify-center cursor-pointer\">▶</button>\n            </div>\n          </div>\n        </div>\n\n        <!-- 特写卡片底栏：还原参考图暖琥珀色「看头盔内视角」按钮 + 下划线「模拟下一路口」 -->\n        <div class=\"px-4 py-2.5 bg-[#12151B] border-t border-white/[0.08] flex items-center justify-between shrink-0\">\n          <div class=\"flex items-center gap-4\">\n            <button data-ai-action=\"view\" data-mode=\"all\"\n              class=\"px-3.5 py-1.5 rounded-[8px] bg-[#F5AB65] hover:bg-[#F7BA7E] text-[#181410] text-[12.5px] font-bold shadow transition cursor-pointer\">\n              看头盔内视角\n            </button>\n            <button data-ai-action=\"next-intersection\"\n              class=\"text-[12.5px] text-white/85 hover:text-white underline underline-offset-4 decoration-white/60 cursor-pointer\">\n              模拟下一路口\n            </button>\n          </div>\n          <span class=\"text-[11px] text-white/45\">IP68 防水防震 · 蓝牙直连手机</span>\n        </div>\n      </div>\n\n      <!-- ==================== 8. 底部四段式琥珀橙进度条 + 最右侧暂停 `⏸` 与重播 `↻` 按钮 ==================== -->\n      <div style=\"position: absolute; left: 342px; right: 24px; bottom: 0; height: 46px;\"\n        class=\"z-30 flex items-end justify-between gap-4 pb-1.5\">\n        <!-- 四段式可点击琥珀橙进度轨道 -->\n        <div id=\"four-step-timeline\" class=\"flex-1 grid grid-cols-4 h-[40px]\">\n          <!-- JS 实时渲染进度与标签 -->\n        </div>\n\n        <!-- 最右侧：暂停/继续 与 重播 圆形按钮（不占用右上角 HUD 区域） -->\n        <div class=\"flex items-center gap-2 pb-1 shrink-0\">\n          <button data-ai-action=\"toggle-play\" id=\"btn-play-toggle\" title=\"暂停 / 继续自动演绎\"\n            class=\"w-[32px] h-[32px] rounded-full bg-[#151922]/90 hover:bg-[#202634] border border-white/[0.15] text-white/90 flex items-center justify-center transition cursor-pointer\">\n            <span id=\"play-toggle-icon\" class=\"text-[10.5px] font-bold tracking-tighter\">❚❚</span>\n          </button>\n          <button data-ai-action=\"replay\" title=\"从头重播当前场景\"\n            class=\"w-[32px] h-[32px] rounded-full bg-[#151922]/90 hover:bg-[#202634] border border-white/[0.15] text-white/90 flex items-center justify-center transition cursor-pointer text-[14px]\">\n            ↻\n          </button>\n        </div>\n      </div>\n\n    </main>\n  </div>";
  shadow.replaceChildren(styleEl, wrapEl);

// ==================== 一、视窗自适应等比缩放（保证在任意屏幕 100% 还原精确布局） ====================
    function fitStageToViewport() {
      const wrapper = byId('stage-scale-wrapper');
      const stage = byId('helmet-stage');
      if (!wrapper || !stage) return;
      const availWidth = wrapper.clientWidth || Math.min(window.innerWidth - 24, 1360);
      const scale = Math.min(1, availWidth / 1360);
      const offsetX = Math.max(0, (availWidth - 1360 * scale) / 2);
      stage.style.position = 'absolute';
      stage.style.left = '0px';
      stage.style.top = '0px';
      stage.style.transform = `translateX(${offsetX}px) scale(${scale})`;
      wrapper.style.height = `${Math.round(740 * scale)}px`;
    }
    const resizeObserver = new ResizeObserver(() => {
      if (!destroyed) fitStageToViewport();
    });
    resizeObserver.observe(byId('stage-scale-wrapper'));

    // ==================== 二、实景底图多重容错 + Gemini API 实时生成头盔内第一人称实景图 ====================
    const localHighwayAsset = new URL(asset('hardware-visor'), document.baseURI).href;
    const localCockpitAsset = new URL(asset('cockpit-overlook'), document.baseURI).href;
    (function setupPhotoFallbacks() {
      const hwImg = byId('fallback-highway-img');
      const hwBackups = [
        'https://unsplash.com/photos/8As6hrLM4Ec/download?w=1920',
        'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=1920&q=85',
        localHighwayAsset
      ];
      let hwIdx = 0;
      hwImg.onerror = () => {
        if (hwIdx < hwBackups.length) {
          hwImg.src = hwBackups[hwIdx++];
          if (!destroyed) renderThreeEnds();
        }
      };

      const ckImg = byId('fallback-cockpit-img');
      const ckBackups = [
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1600&q=85',
        localCockpitAsset
      ];
      let ckIdx = 0;
      ckImg.onerror = () => { if (ckIdx < ckBackups.length) ckImg.src = ckBackups[ckIdx++]; };
    })();

    let cachedHelmetPovUrl = null;
    let isGeneratingAiBg = false;

    const HELMET_POV_PROMPT =
      "first-person POV photo from inside a motorcycle helmet looking out through the clear visor at night on an urban highway, subtle dark helmet interior padding and chin guard visible along the outer frame edges, rider wearing black leather motorcycle gloves gripping sportbike handlebars with smoked windscreen at the bottom center, motion-blurred asphalt lanes, glowing red car taillights and warm amber streetlamps ahead, upper right sky area dark and clean, photorealistic cinematic photography";

    async function fetchWithRetry(url, options, maxRetries = 3) {
      let delay = 1000;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const res = await fetch(url, options);
          if (res.ok) return await res.json();
          if (res.status !== 429 && res.status < 500) break;
        } catch (err) {
          // 网络抖动静默退避重试
        }
        if (attempt < maxRetries - 1) {
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
        }
      }
      return null;
    }

    async function generateAiHelmetPovImage(forceRefresh = false) {
      if (isGeneratingAiBg) return;
      if (cachedHelmetPovUrl && !forceRefresh) {
        applyCustomPovBackground(cachedHelmetPovUrl, 'AI 头盔实景已就绪 · 重新生成');
        return;
      }

      isGeneratingAiBg = true;
      const dotEl = byId('ai-bg-dot');
      const txtEl = byId('ai-bg-status');
      dotEl.className = 'w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse';
      txtEl.textContent = 'AI 正在生成头盔实景...';

      const apiKey = ""; // Canvas 运行时自动注入
      let generatedDataUrl = null;

      // 优先尝试 imagen-3.0-generate-002 (16:9)，若环境路由至 Gemini 3.1 Flash Image 则自动无缝切换
      const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
      const imagenRes = await fetchWithRetry(imagenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: HELMET_POV_PROMPT }],
          parameters: { sampleCount: 1, aspectRatio: "16:9" }
        })
      }, 2);

      const b64Imagen = imagenRes?.predictions?.[0]?.bytesBase64Encoded;
      if (b64Imagen) {
        generatedDataUrl = `data:image/png;base64,${b64Imagen}`;
      } else {
        // 自动回退至 gemini-3.1-flash-image (16:9 原生高清图像生成)
        const flashImgUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${apiKey}`;
        const flashRes = await fetchWithRetry(flashImgUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: HELMET_POV_PROMPT }] }],
            generationConfig: {
              responseModalities: ['IMAGE'],
              imageConfig: { aspectRatio: "16:9" }
            }
          })
        }, 3);
        const inlinePart = flashRes?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (inlinePart?.inlineData?.data) {
          const mime = inlinePart.inlineData.mimeType || 'image/png';
          generatedDataUrl = `data:${mime};base64,${inlinePart.inlineData.data}`;
        }
      }

      isGeneratingAiBg = false;
      if (destroyed) return;
      if (generatedDataUrl) {
        cachedHelmetPovUrl = generatedDataUrl;
        applyCustomPovBackground(generatedDataUrl, '✦ AI 头盔实景已应用 · 重新生成');
      } else {
        dotEl.className = 'w-1.5 h-1.5 rounded-full bg-[#4ADE80]';
        txtEl.textContent = '实拍高速视野已就绪 · 点击 AI 重绘';
      }
    }

    function applyCustomPovBackground(srcUrl, statusLabel) {
      const aiImg = byId('ai-generated-pov-img');
      const dotEl = byId('ai-bg-dot');
      const txtEl = byId('ai-bg-status');
      aiImg.onload = () => {
        if (destroyed) return;
        aiImg.style.opacity = '0.94';
        dotEl.className = 'w-1.5 h-1.5 rounded-full bg-[#4ADE80]';
        txtEl.textContent = statusLabel;
        renderThreeEnds(); // 同步更新手机内大疆实时图传取景画面
      };
      aiImg.src = srcUrl;
    }

    function handleLocalBgUpload(event) {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        if (typeof e.target?.result === 'string') {
          cachedHelmetPovUrl = e.target.result;
          applyCustomPovBackground(cachedHelmetPovUrl, '✓ 已载入自定义头盔实景');
        }
      };
      reader.readAsDataURL(file);
    }

    function getCurrentLiveRoadImageSrc() {
      return cachedHelmetPovUrl || byId('fallback-highway-img').src;
    }

    // ==================== 三、四大核心业务场景与三端同步状态机 ====================
    const state = {
      scenario: 'wechat',      // 'wechat' | 'meituan' | 'dji_voice' | 'dji_group'
      viewMode: 'all',         // 'all' (默认三端同屏) | 'visor' (镜片视角) | 'pod' (圆盘特写)
      step: 0,                 // 0..3
      playing: true,
      elapsedMs: 0,
      stepDurationMs: 4600,

      // 美团顺路门店可点击切换（0: 霸王茶姬 | 1: Manner Coffee）
      storeIdx: 0,
      // 美团骑行导航路口模拟推进（0: 300m | 1: 80m | 2: 15m）
      navIdx: 0,

      // 大疆实时录制秒数 & 快门闪光
      recSeconds: 8,
      triggerFlash: false,

      // 微信 Step 4 完成 2 秒后柔和降低右上方 HUD 透明度以保持视野清爽
      hudSoftDimTimer: null
    };

    const MEITUAN_STORES = [
      {
        name: '霸王茶姬（环山公路驿站店）',
        shortName: '霸王茶姬驿站店',
        drink: '少冰三分糖伯牙绝弦',
        price: 18,
        distLabel: '顺路 300m · 0绕路',
        distMeters: '300',
        address: '环山公路驿站东侧 88 号',
        pickupCode: 'A082',
        emoji: '🧋'
      },
      {
        name: 'Manner Coffee（观景台店）',
        shortName: 'Manner观景台店',
        drink: '少冰美式（双份浓缩）',
        price: 15,
        distLabel: '顺路 450m · 0绕路',
        distMeters: '450',
        address: '环山观景台东侧 12 号',
        pickupCode: 'M205',
        emoji: '☕'
      }
    ];

    function getNavWaypoints(store) {
      return [
        { dist: store.distMeters, unit: 'm', action: '前方右转', roadHint: store.shortName, podBottom: '前方右转' },
        { dist: '80',             unit: 'm', action: '减速靠右进入驿站', roadHint: store.address, podBottom: '减速靠右' },
        { dist: '15',             unit: 'm', action: `已达${store.shortName}`, roadHint: `骑手快取码 #${store.pickupCode}`, podBottom: `快取 #${store.pickupCode}` }
      ];
    }

    const TIMELINE_CONFIG = {
      wechat:    ['总结消息', '语音回复', '确认汇报', '已汇报'],
      meituan:   ['沿途搜店', '确认奶茶', '定位启航', '骑行导航'],
      dji_voice: ['唤醒连接', '打卡拍照', '开启录视频', '高光保存'],
      dji_group: ['定位与队友感应', '自动录像抓拍', 'AI 卡点剪辑', '直发车友群']
    };

    // 切换顶部四大场景胶囊
    function switchScenario(sc) {
      state.scenario = sc;
      state.step = 0;
      state.elapsedMs = 0;
      state.navIdx = 0;

      ['wechat', 'meituan', 'dji_voice', 'dji_group'].forEach(key => {
        const el = byId('sc-pill-' + key);
        if (key === sc) {
          el.className = 'h-[34px] px-3.5 rounded-full text-[13px] font-bold transition-all flex items-center gap-2 bg-white text-[#111318] shadow-sm cursor-pointer';
        } else {
          el.className = 'h-[34px] px-3.5 rounded-full text-[13px] font-medium transition-all flex items-center gap-2 bg-white/[0.06] border border-white/[0.1] text-white/80 hover:text-white hover:bg-white/[0.11] cursor-pointer';
        }
      });

      renderThreeEnds();
    }

    // 切换硬件视角模式：[⊞ 三端同屏] / [▭ 镜片视角] / [○ 圆盘特写]
    function switchViewMode(mode) {
      state.viewMode = mode;
      ['all', 'visor', 'pod'].forEach(m => {
        const btn = byId('view-btn-' + m);
        if (m === mode) {
          btn.className = 'h-full px-3 rounded-[7px] text-[12.5px] font-bold transition-all flex items-center gap-1.5 bg-[#F59E0B] text-[#141414] cursor-pointer';
        } else {
          btn.className = 'h-full px-3 rounded-[7px] text-[12.5px] font-medium transition-all flex items-center gap-1.5 text-white/75 hover:text-white cursor-pointer';
        }
      });

      const hudEl = byId('helmet-upper-right-hud');
      const miniPodEl = byId('handlebar-center-pod');
      const closeupCardEl = byId('pod-closeup-card');

      if (mode === 'all') {
        hudEl.style.display = 'flex';
        miniPodEl.style.display = 'flex';
        closeupCardEl.classList.add('hidden');
        closeupCardEl.classList.remove('flex');
      } else if (mode === 'visor') {
        hudEl.style.display = 'flex';
        miniPodEl.style.display = 'none';
        closeupCardEl.classList.add('hidden');
        closeupCardEl.classList.remove('flex');
      } else if (mode === 'pod') {
        // 右上方头盔 HUD 依然保留同步可见，右侧下方弹出带强烈破风青色光流的「车把防水屏」特写卡片
        hudEl.style.display = 'flex';
        miniPodEl.style.display = 'none';
        closeupCardEl.classList.remove('hidden');
        closeupCardEl.classList.add('flex');
      }

      renderThreeEnds();
    }

    function togglePlayPause() {
      state.playing = !state.playing;
      byId('play-toggle-icon').textContent = state.playing ? '❚❚' : '▶';
    }

    function replayCurrentScenario() {
      state.step = 0;
      state.elapsedMs = 0;
      state.navIdx = 0;
      state.playing = true;
      byId('play-toggle-icon').textContent = '❚❚';
      renderThreeEnds();
    }

    function goToStep(idx) {
      state.step = idx;
      state.elapsedMs = 0;
      if (state.scenario === 'meituan' && idx === 2) state.navIdx = 0;
      if (state.scenario === 'dji_voice' && idx === 1) state.triggerFlash = true;
      if (idx >= 1) emitPhoneTouchRipple(72, 54);
      renderThreeEnds();
    }

    function stepForward() {
      if (state.scenario === 'meituan' && state.step === 3 && state.navIdx < 2) {
        simulateNextIntersection();
        return;
      }
      goToStep((state.step + 1) % 4);
    }

    function stepBackward() {
      goToStep((state.step + 3) % 4);
    }

    // 美团点击门店卡片直接选中奶茶并推进锁单导航
    function selectMeituanStore(idx, advanceToConfirm = true) {
      state.storeIdx = idx;
      state.navIdx = 0;
      emitPhoneTouchRipple(68, idx === 0 ? 48 : 65);
      if (advanceToConfirm) {
        state.step = 1;
        state.elapsedMs = 0;
      }
      renderThreeEnds();
    }

    // 点击「模拟下一路口」三端同步推进：300m -> 80m -> 15m
    function simulateNextIntersection(ev) {
      if (ev) ev.stopPropagation();
      if (state.scenario !== 'meituan') {
        switchScenario('meituan');
        state.step = 3;
        state.navIdx = 0;
      } else if (state.step < 2) {
        state.step = 3;
        state.navIdx = 0;
      } else if (state.step === 2) {
        state.step = 3;
        state.navIdx = 1;
      } else {
        state.navIdx = (state.navIdx + 1) % 3;
      }
      state.elapsedMs = 0;
      renderThreeEnds();
    }

    function emitPhoneTouchRipple(xPct, yPct) {
      const box = byId('iphone-ripple-box');
      if (!box) return;
      const dot = document.createElement('div');
      dot.className = 'ai-touch-ripple';
      dot.style.left = `${xPct}%`;
      dot.style.top = `${yPct}%`;
      box.appendChild(dot);
      setTimeout(() => dot.remove(), 660);
    }

    // 手机卡片底部的 4 颗可点击步骤胶囊
    function buildCardStepPills(labels, activeIdx) {
      return `
        <div class="flex flex-wrap items-center gap-1 mt-2.5 pt-2 border-t border-black/[0.06]">
          ${labels.map((txt, i) => {
            if (i === activeIdx) {
              return `<button data-ai-action="step" data-step="${i}" class="px-2 py-0.5 rounded-full bg-[#16181D] text-white text-[9.5px] font-bold flex items-center gap-1 cursor-pointer"><span class="w-1.5 h-1.5 rounded-full bg-[#4ADE80]"></span>${txt}</button>`;
            }
            return `<button data-ai-action="step" data-step="${i}" class="px-2 py-0.5 rounded-full bg-[#EFECE4] hover:bg-[#E4E0D5] text-[#6E6D68] text-[9.5px] font-medium cursor-pointer transition">${txt}</button>`;
          }).join('')}
        </div>
      `;
    }

    // 右上方头盔 HUD 底部四节点光学连线 ●━━●━━○━━○
    function buildOpticalNodes(activeIdx) {
      let out = '';
      for (let i = 0; i < 4; i++) {
        const done = i < activeIdx;
        const curr = i === activeIdx;
        const nodeStyle = curr
          ? 'w-[11px] h-[11px] rounded-full border-2 border-[#4ADE80] bg-[#4ADE80]/35 shadow-[0_0_9px_#4ADE80]'
          : done
            ? 'w-[10px] h-[10px] rounded-full bg-[#4ADE80] shadow-[0_0_6px_#4ADE80]'
            : 'w-[10px] h-[10px] rounded-full border border-[#4ADE80]/45 bg-transparent';
        out += `<span class="${nodeStyle} cursor-pointer" data-ai-action="step" data-step="${i}"></span>`;
        if (i < 3) {
          out += `<span class="w-6 h-[1.8px] ${i < activeIdx ? 'bg-[#4ADE80]/85' : 'bg-[#4ADE80]/28'}"></span>`;
        }
      }
      return out;
    }

    // ==================== 四、主渲染函数：确保 iPhone + 右上方头盔 HUD + 车把圆盘 毫秒级一致 ====================
    function renderThreeEnds() {
      const s = state.step;

      // 清理并处理微信 Step 4「2秒后柔和降低右上方 HUD 透明度保持视野清爽」
      const hudBox = byId('helmet-upper-right-hud');
      if (state.hudSoftDimTimer) {
        clearTimeout(state.hudSoftDimTimer);
        state.hudSoftDimTimer = null;
      }
      hudBox.style.opacity = '1';
      if (state.scenario === 'wechat' && s === 3) {
        state.hudSoftDimTimer = setTimeout(() => {
          if (state.scenario === 'wechat' && state.step === 3) {
            hudBox.style.opacity = '0.38';
          }
        }, 2000);
      }

      const roleTag = byId('voice-role-tag');
      const voiceTxt = byId('voice-command-text');
      const phoneStream = byId('iphone-card-stream');

      const hudSpinner = byId('hud-spinner');
      const hudStatusLabel = byId('hud-status-label');
      const hudBody = byId('hud-main-body');
      const hudNodes = byId('hud-optical-nodes');
      const hudStepHint = byId('hud-step-hint');

      const miniArc = byId('mini-pod-arc');
      const largeArc = byId('large-pod-arc');
      const miniPodContent = byId('mini-pod-oled-content');
      const largePodContent = byId('large-pod-oled-content');

      hudNodes.innerHTML = buildOpticalNodes(s);
      hudStepHint.textContent = `STEP 0${s + 1}/04`;

      // 圆盘外圈进度弧与录制呼吸红环控制
      const isDjiRecording = (state.scenario === 'dji_voice' && s === 2) || (state.scenario === 'dji_group' && s === 1);
      const dashMini = [216, 144, 72, 0][s];
      const dashLarge = [219, 146, 73, 0][s];
      miniArc.setAttribute('stroke-dashoffset', isDjiRecording ? '28' : String(dashMini));
      largeArc.setAttribute('stroke-dashoffset', isDjiRecording ? '30' : String(dashLarge));
      miniArc.setAttribute('stroke', isDjiRecording ? '#F43F5E' : '#5EEAD4');
      largeArc.setAttribute('stroke', isDjiRecording ? '#F43F5E' : '#5EEAD4');
      miniArc.classList.toggle('rec-breathing-ring', isDjiRecording);
      largeArc.classList.toggle('rec-breathing-ring', isDjiRecording);

      // 右上方 HUD 顶栏状态
      if (s === 3 && !(state.scenario === 'meituan' && state.navIdx < 2)) {
        hudSpinner.className = 'w-4 h-4 rounded-full bg-[#4ADE80]/25 border border-[#4ADE80] text-[#4ADE80] text-[10px] font-bold flex items-center justify-center shrink-0';
        hudSpinner.textContent = '✓';
        hudStatusLabel.textContent = '已替你完成操作 · 骑士';
      } else {
        hudSpinner.className = 'w-3.5 h-3.5 rounded-full border-[1.8px] border-[#4ADE80] border-t-transparent animate-spin shrink-0';
        hudSpinner.textContent = '';
        hudStatusLabel.textContent = 'AI 正在替你操作 · 骑士';
      }

      const cardStatusPill = (s === 3 && !(state.scenario === 'meituan' && state.navIdx < 2))
        ? `<span class="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[9.5px] font-bold">已完成</span>`
        : `<span class="px-2 py-0.5 rounded-full bg-[#F6EAD7] text-[#B87421] text-[9.5px] font-bold">进行中</span>`;

      // ==================== 场景 1：[微] 微信总结汇报 ====================
      if (state.scenario === 'wechat') {
        const pills = TIMELINE_CONFIG.wechat;
        const voices = [
          { role: '你', text: '你好骑士，总结一下微信工作群刚聊了什么' },
          { role: '你', text: '回复群里：OTA 良率 99.6%，防水测试已过，今晚十点准时封版汇报' },
          { role: 'AI', text: '工作总结汇报已生成，请语音确认是否立即发送至智能硬件交付群？' },
          { role: '你', text: '确认发送，直接发到群里' }
        ];
        roleTag.textContent = voices[s].role;
        voiceTxt.textContent = voices[s].text;

        let wxSubView = '';
        if (s === 0) {
          wxSubView = `
            <div class="flex items-center justify-between text-[10.5px] text-[#575651] mb-1.5">
              <span class="font-semibold">智能硬件交付群 (8条未读)</span>
              <span class="text-[#2AAE67] font-bold">AI 摘要播报中</span>
            </div>
            <div class="rounded-[11px] bg-[#1E1C18] text-white p-2.5 space-y-1.5 text-[10.5px] leading-snug">
              <div class="text-[#F59E0B] font-bold">✦ AI 提炼 3 点核心摘要</div>
              <div class="text-white/95">1. 王总询问 OTA 压测良率与封版时间</div>
              <div class="text-white/95">2. 测试组反馈防水气密性 99.4% 达标</div>
              <div class="text-white/90">3. 产线等待今晚最终封版确认</div>
            </div>
          `;
        } else if (s === 1 || s === 2) {
          wxSubView = `
            <div class="flex items-center justify-between text-[10.5px] text-[#575651] mb-1.5">
              <span class="font-semibold">智能硬件交付群 · 结构化汇报草稿</span>
              <span class="text-[#B87421] font-bold">${s === 2 ? '待语音确认' : 'AI 整理中'}</span>
            </div>
            <div class="rounded-[11px] bg-[#1E1C18] text-white p-2.5 space-y-1.5 text-[10.5px] leading-snug border ${s === 2 ? 'border-[#4ADE80]/65' : 'border-transparent'}">
              <div class="text-[#4ADE80] font-bold">【阶段工作总结汇报】@王总</div>
              <div><span class="text-white/60">【当前进展】</span>OTA 压测良率提升至 99.6%</div>
              <div><span class="text-white/60">【测试闭环】</span>IP68 防水气密全检已通过</div>
              <div><span class="text-white/60">【交付节点】</span>今晚 22:00 准时完成封版汇报</div>
            </div>
          `;
        } else {
          wxSubView = `
            <div class="flex items-center justify-between text-[10.5px] text-[#15803D] font-bold mb-1.5">
              <span>✓ 已送达智能硬件交付群</span>
              <span>刚刚</span>
            </div>
            <div class="rounded-[11px] bg-[#95EC69] text-[#141414] p-2.5 text-[10.5px] leading-snug font-medium shadow-2xs">
              <div class="font-extrabold mb-0.5">【阶段工作总结汇报】@王总</div>
              <div>【当前进展】OTA 压测良率 99.6%</div>
              <div>【测试闭环】防水气密测试已过</div>
              <div>【交付节点】今晚 22:00 准时封版汇报</div>
            </div>
            <div class="mt-1.5 rounded-lg bg-[#EFECE6] px-2.5 py-1.5 text-[10px] text-[#1F1F1F] flex items-center justify-between">
              <span><strong>王总：</strong>收到，汇报很清晰，路上注意安全 👍</span>
            </div>
          `;
        }

        phoneStream.innerHTML = `
          <div class="text-center text-[10px] text-[#9A9992]">20:15</div>
          <div class="flex justify-end">
            <div class="px-3.5 py-1.5 rounded-full bg-[#6BE856] text-[#132610] text-[12px] font-bold flex items-center gap-2 shadow-2xs">
              <span>${s >= 1 ? '5"' : '3"'}</span><span class="tracking-tighter">))</span>
            </div>
          </div>
          <div class="bg-white rounded-[15px] p-3 shadow-[0_3px_12px_rgba(0,0,0,0.05)] border border-black/[0.05]">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-1.5">
                <span class="w-[19px] h-[19px] rounded-[5px] bg-[#2AAE67] text-white text-[10px] font-bold flex items-center justify-center">微</span>
                <span class="text-[12px] font-bold text-[#141414]">代你操作 · 骑士</span>
              </div>
              ${cardStatusPill}
            </div>
            ${wxSubView}
            ${buildCardStepPills(pills, s)}
          </div>
        `;

        // 右上方头盔 HUD
        if (s === 0) {
          hudBody.innerHTML = `
            <div class="text-[26px] font-extrabold hud-phosphor-main tracking-tight leading-tight">总结 微信工作群</div>
            <div class="mt-1.5 space-y-0.5 text-[13px] hud-phosphor-sub leading-snug">
              <div class="truncate">1. 王总问 OTA 良率与封版时间</div>
              <div class="truncate">2. 防水气密 99.4% 达标 · 3. 产线待确认</div>
            </div>
          `;
        } else if (s === 1) {
          hudBody.innerHTML = `
            <div class="text-[26px] font-extrabold hud-phosphor-main tracking-tight leading-tight">AI 生成工作汇报</div>
            <div class="mt-1.5 text-[13.5px] hud-phosphor-sub leading-snug">
              【进展】良率99.6% · 【闭环】防水已过<br/>【节点】今晚 22:00 准时封版汇报
            </div>
          `;
        } else if (s === 2) {
          hudBody.innerHTML = `
            <div class="text-[26px] font-extrabold hud-phosphor-main tracking-tight leading-tight">确认发送 工作汇报？</div>
            <div class="mt-1.5 text-[13.5px] hud-phosphor-sub leading-snug">
              目标：智能硬件交付群 · 说「确认」即刻发出
            </div>
          `;
        } else {
          hudBody.innerHTML = `
            <div class="text-[27px] font-extrabold hud-phosphor-main tracking-tight leading-tight">✓ 工作汇报已发出</div>
            <div class="mt-1.5 text-[13.5px] hud-phosphor-sub leading-snug">
              已送达智能硬件交付群 · 2秒后自动柔化视野
            </div>
          `;
        }

        // 车把防水圆盘（小屏与特写大屏同步）
        const wxPodSmall = [
          `<div class="text-[9.5px] text-[#5EEAD4]/85 font-semibold">微信 · 8条未读</div><div class="text-[12.5px] font-extrabold text-[#9BFAD0] mt-0.5">正在播报摘要</div>`,
          `<div class="text-[9.5px] text-[#5EEAD4]/85 font-semibold">语音转汇报</div><div class="text-[12.5px] font-extrabold text-[#9BFAD0] mt-0.5">AI 生成工作汇报</div>`,
          `<div class="text-[9.5px] text-[#F59E0B] font-bold">待语音确认</div><div class="text-[12.5px] font-extrabold text-[#9BFAD0] mt-0.5">今晚22:00封版</div>`,
          `<div class="text-[18px] text-[#4ADE80] font-black leading-none">✓</div><div class="text-[12.5px] font-extrabold text-[#9BFAD0] mt-1">汇报完成</div>`
        ][s];

        const wxPodLarge = [
          `<div class="text-[11px] text-[#5EEAD4]/85 font-semibold">微信 · 8条未读</div><div class="text-[18px] font-extrabold text-[#9BFAD0] mt-1">正在播报摘要</div><div class="text-[10.5px] text-[#5EEAD4]/80 mt-1">OTA良率 · 防水达标</div>`,
          `<div class="text-[11px] text-[#5EEAD4]/85 font-semibold">语音控制回复</div><div class="text-[18px] font-extrabold text-[#9BFAD0] mt-1">AI 生成工作汇报</div><div class="text-[10.5px] text-[#5EEAD4]/80 mt-1">良率99.6% · 22点封版</div>`,
          `<div class="text-[11px] text-[#F59E0B] font-bold">待确认发送</div><div class="text-[18px] font-extrabold text-[#9BFAD0] mt-1">智能硬件交付群</div><div class="text-[10.5px] text-[#5EEAD4]/80 mt-1">说「确认」即刻发出</div>`,
          `<div class="text-[24px] text-[#4ADE80] font-black leading-none">✓</div><div class="text-[19px] font-extrabold text-[#9BFAD0] mt-1">汇报完成</div><div class="text-[10.5px] text-[#5EEAD4]/85 mt-0.5">已送达交付群</div>`
        ][s];

        miniPodContent.innerHTML = wxPodSmall;
        largePodContent.innerHTML = wxPodLarge;
      }

      // ==================== 场景 2：[团] 顺路点奶茶导航 ====================
      else if (state.scenario === 'meituan') {
        const pills = TIMELINE_CONFIG.meituan;
        const store = MEITUAN_STORES[state.storeIdx];
        const waypoints = getNavWaypoints(store);
        const activeWp = s === 2 ? waypoints[0] : waypoints[state.navIdx];

        const mtVoices = [
          { role: '你', text: '你好骑士，美团搜一下沿途顺路的奶茶或咖啡（可直接点击下方门店卡片切换）' },
          { role: '你', text: `点这杯${store.shortName}的${store.drink}，直接导航过去` },
          { role: 'AI', text: `已锁单生成快取码 #${store.pickupCode}，直接按门店定位拉起骑行导航` },
          { role: 'AI', text: `骑行导航中：${activeWp.dist}${activeWp.unit} ${activeWp.action}（可点「模拟下一路口」）` }
        ];
        roleTag.textContent = mtVoices[s].role;
        voiceTxt.textContent = mtVoices[s].text;

        let mtSubView = '';
        if (s === 0) {
          mtSubView = `
            <div class="flex items-center justify-between text-[10.5px] text-[#575651] mb-1.5">
              <span class="font-semibold">美团外卖 · 顺路免绕路茶饮</span>
              <span class="text-[#D97706] font-bold">点击卡片即选</span>
            </div>
            <div class="space-y-1.5">
              ${MEITUAN_STORES.map((item, idx) => {
                const selected = state.storeIdx === idx;
                return `
                  <div data-ai-action="meituan-store" data-idx="${idx}" data-adv="1"
                    class="rounded-[11px] p-2.5 cursor-pointer transition-all border ${
                      selected
                        ? 'bg-[#1F1C16] text-white border-[#F59E0B] shadow-sm'
                        : 'bg-[#F3F1EA] text-[#141414] border-black/5 hover:border-[#F59E0B]'
                    }">
                    <div class="flex items-center justify-between text-[11px] font-bold">
                      <span class="truncate pr-1">${item.emoji} ${item.name}</span>
                      <span class="${selected ? 'text-[#F59E0B]' : 'text-[#D97706]'} shrink-0">¥${item.price}</span>
                    </div>
                    <div class="text-[10.5px] mt-0.5 ${selected ? 'text-white/90' : 'text-[#333]'} font-medium">${item.drink}</div>
                    <div class="flex items-center justify-between text-[9.5px] mt-1 ${selected ? 'text-white/65' : 'text-[#666]'}">
                      <span>骑手专属免下车快取</span>
                      <span class="px-1.5 py-0.5 rounded bg-[#F59E0B] text-[#141414] font-extrabold">${item.distLabel}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        } else if (s === 1) {
          mtSubView = `
            <div class="flex items-center justify-between text-[10.5px] text-[#575651] mb-1.5">
              <span class="font-semibold">美团锁单成功 · 提取门店坐标</span>
              <button data-ai-action="meituan-store" data-idx="${1 - state.storeIdx}" data-adv="0" class="text-[9.5px] text-[#D97706] underline cursor-pointer">切换门店</button>
            </div>
            <div class="rounded-[11px] bg-[#1F1C16] text-white p-3 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold text-[#F59E0B]">${store.name}</span>
                <span class="px-2 py-0.5 rounded bg-[#4ADE80]/20 text-[#4ADE80] font-mono text-[11px] font-bold">#${store.pickupCode}</span>
              </div>
              <div class="text-[11px] font-semibold">${store.drink} · ¥${store.price}</div>
              <div class="pt-1 border-t border-white/10 text-[10px] text-white/80 flex items-center gap-1">
                <span>📍 定位地址：${store.address}</span>
              </div>
            </div>
          `;
        } else {
          // Step 3 & Step 4：深色实时骑行导航图 + 可点击「模拟下一路口」
          const riderY = s === 2 ? 112 : [112, 74, 40][state.navIdx];
          mtSubView = `
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[10.5px] text-[#575651] font-bold truncate max-w-[148px]">导航 · ${store.shortName}</span>
              <button data-ai-action="next-intersection"
                class="px-2 py-0.5 rounded-md bg-[#F59E0B] hover:bg-[#FBBF24] text-[#141414] text-[9.5px] font-extrabold shadow-2xs transition cursor-pointer shrink-0">
                模拟下一路口 ↻
              </button>
            </div>
            <div class="relative h-[142px] rounded-[11px] overflow-hidden bg-[#0F1722] border border-black/15">
              <svg class="w-full h-full" viewBox="0 0 240 142">
                <rect width="240" height="142" fill="#0F1722"/>
                <!-- 城市路网底纹 -->
                <path d="M0 92 H240 M42 0 V142 M168 0 V142" stroke="#1C293B" stroke-width="11"/>
                <!-- 导航规划主干道 -->
                <path d="M88 142 V38 H192" stroke="#263850" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <path d="M88 ${riderY + 18} V38 H188" stroke="#4ADE80" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <!-- 奶茶门店定位终点 -->
                <circle cx="190" cy="38" r="10" fill="#F59E0B" stroke="#FFFFFF" stroke-width="2"/>
                <text x="190" y="42" text-anchor="middle" font-size="10">${store.emoji}</text>
                <!-- 当前骑手实时蓝标 -->
                <circle cx="88" cy="${riderY}" r="7.5" fill="#38BDF8" stroke="#FFFFFF" stroke-width="2.2"/>
              </svg>
              <div class="absolute top-2 left-2 right-2 px-2.5 py-1.5 rounded-lg bg-[#081C18]/92 border border-[#4ADE80]/35 text-[#4ADE80] flex items-center justify-between text-[10.5px] font-bold">
                <span>↱ ${activeWp.dist}${activeWp.unit} ${activeWp.action}</span>
                <span class="text-white/85 font-mono">#${store.pickupCode}</span>
              </div>
              <div class="absolute bottom-1.5 left-2 right-2 px-2 py-0.5 rounded bg-black/65 text-[9.5px] text-white/80 truncate">
                📍 ${store.address}
              </div>
            </div>
          `;
        }

        phoneStream.innerHTML = `
          <div class="text-center text-[10px] text-[#9A9992]">20:18</div>
          <div class="flex justify-end">
            <div class="px-3.5 py-1.5 rounded-full bg-[#6BE856] text-[#132610] text-[12px] font-bold flex items-center gap-2">
              <span>3"</span><span class="tracking-tighter">))</span>
            </div>
          </div>
          <div class="bg-white rounded-[15px] p-3 shadow-[0_3px_12px_rgba(0,0,0,0.05)] border border-black/[0.05]">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-1.5">
                <span class="w-[19px] h-[19px] rounded-[5px] bg-[#F59E0B] text-[#141414] text-[10px] font-extrabold flex items-center justify-center">团</span>
                <span class="text-[12px] font-bold text-[#141414]">代你操作 · 骑士</span>
              </div>
              ${cardStatusPill}
            </div>
            ${mtSubView}
            ${buildCardStepPills(pills, s)}
          </div>
        `;

        // 右上方头盔 HUD（Step 3 & Step 4 投射醒目荧光绿右转大箭头）
        if (s === 0) {
          hudBody.innerHTML = `
            <div class="text-[26px] font-extrabold hud-phosphor-main tracking-tight leading-tight">美团 · 沿途顺路茶饮</div>
            <div class="mt-1.5 space-y-0.5 text-[13px] hud-phosphor-sub">
              <div>1. 霸王茶姬 · 伯牙绝弦 ¥18 (顺路300m)</div>
              <div>2. Manner · 少冰美式 ¥15 (顺路450m)</div>
            </div>
          `;
        } else if (s === 1) {
          hudBody.innerHTML = `
            <div class="text-[26px] font-extrabold hud-phosphor-main tracking-tight leading-tight">已锁单 · 快取码 #${store.pickupCode}</div>
            <div class="mt-1.5 text-[13.5px] hud-phosphor-sub truncate">
              ${store.drink} · 正在提取定位：${store.address}
            </div>
          `;
        } else {
          hudBody.innerHTML = `
            <div class="flex items-center gap-3.5">
              <svg class="w-12 h-12 text-[#4ADE80] shrink-0 drop-shadow-[0_0_14px_rgba(74,222,128,0.85)]" viewBox="0 0 52 52" fill="none">
                <path d="M13 43 V22 C13 16 18 11.5 24 11.5 H39 M30 4.5 L41 11.5 L30 18.5" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <div class="min-w-0">
                <div class="text-[28px] font-extrabold hud-phosphor-main leading-none tracking-tight">
                  ${activeWp.dist}${activeWp.unit} ${activeWp.podBottom}
                </div>
                <div class="text-[13.5px] hud-phosphor-sub mt-1.5 truncate">
                  ${activeWp.action} · ${store.shortName}
                </div>
              </div>
            </div>
          `;
        }

        // 车把圆盘屏（Step 3/4 严格呈现参考图同款排版：↱ 300 + m + 前方右转）
        if (s === 0) {
          miniPodContent.innerHTML = `<div class="text-[9.5px] text-[#5EEAD4]/85 font-semibold">美团搜店</div><div class="text-[13px] font-extrabold text-[#9BFAD0] mt-0.5">2家顺路</div><div class="text-[9.5px] text-[#5EEAD4] mt-0.5">300m 0绕路</div>`;
          largePodContent.innerHTML = `<div class="text-[11px] text-[#5EEAD4]/85 font-semibold">美团搜店 · 2家顺路</div><div class="text-[18px] font-extrabold text-[#9BFAD0] mt-1">${store.drink}</div><div class="text-[11px] text-[#5EEAD4] mt-0.5">${store.distLabel}</div>`;
        } else if (s === 1) {
          miniPodContent.innerHTML = `<div class="text-[9.5px] text-[#5EEAD4]/85 font-semibold">骑手快取码</div><div class="text-[17px] font-mono font-black text-[#9BFAD0] mt-0.5">#${store.pickupCode}</div><div class="text-[9px] text-[#5EEAD4]">准备启航</div>`;
          largePodContent.innerHTML = `<div class="text-[11px] text-[#5EEAD4]/85 font-semibold">已锁单 · 提取定位</div><div class="text-[26px] font-mono font-black text-[#9BFAD0] mt-0.5">#${store.pickupCode}</div><div class="text-[11px] text-[#5EEAD4] mt-0.5">${store.shortName}</div>`;
        } else {
          miniPodContent.innerHTML = `
            <div class="w-full px-1.5 text-left flex flex-col justify-center">
              <div class="flex items-center gap-1">
                <svg class="w-4 h-4 text-[#9BFAD0] shrink-0" viewBox="0 0 32 32" fill="none">
                  <path d="M7 26 V10 H24 M19 5 L25 10 L19 15" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="text-[24px] font-black text-[#9BFAD0] leading-none tracking-tight">${activeWp.dist}</span>
              </div>
              <div class="text-[13px] font-extrabold text-[#9BFAD0] leading-tight pl-1">${activeWp.unit}</div>
              <div class="text-[9.5px] font-semibold text-[#5EEAD4] text-center mt-0.5 truncate">${activeWp.podBottom}</div>
            </div>
          `;
          largePodContent.innerHTML = `
            <div class="w-full px-2.5 text-left flex flex-col justify-center">
              <div class="flex items-center gap-1.5">
                <svg class="w-7 h-7 text-[#9BFAD0] shrink-0" viewBox="0 0 32 32" fill="none">
                  <path d="M7 26 V10 H24 M19 5 L25 10 L19 15" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="text-[38px] font-black text-[#9BFAD0] leading-none tracking-tight">${activeWp.dist}</span>
              </div>
              <div class="text-[21px] font-extrabold text-[#9BFAD0] leading-tight pl-1">${activeWp.unit}</div>
              <div class="text-[13px] font-semibold text-[#5EEAD4] text-center mt-1">${activeWp.podBottom}</div>
            </div>
          `;
        }
      }

      // ==================== 场景 3：[疆] 语音控大疆 ====================
      else if (state.scenario === 'dji_voice') {
        const pills = TIMELINE_CONFIG.dji_voice;
        const secStr = String(state.recSeconds).padStart(2, '0');
        const flashLayer = state.triggerFlash ? `<div class="camera-flash-mask absolute inset-0 bg-white z-30 pointer-events-none"></div>` : '';
        state.triggerFlash = false;

        const djiVoices = [
          { role: '你', text: '你好骑士，连上大疆准备沿途打卡拍视频' },
          { role: '你', text: '大疆拍照，打卡跨海高架桥夜景' },
          { role: '你', text: '开始录制视频，开启超强增稳' },
          { role: '你', text: '标记高光时刻并保存视频' }
        ];
        roleTag.textContent = djiVoices[s].role;
        voiceTxt.textContent = djiVoices[s].text;

        phoneStream.innerHTML = `
          <div class="text-center text-[10px] text-[#9A9992]">20:24</div>
          <div class="flex justify-end">
            <div class="px-3.5 py-1.5 rounded-full bg-[#6BE856] text-[#132610] text-[12px] font-bold flex items-center gap-2">
              <span>3"</span><span class="tracking-tighter">))</span>
            </div>
          </div>
          <div class="bg-white rounded-[15px] p-3 shadow-[0_3px_12px_rgba(0,0,0,0.05)] border border-black/[0.05]">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-1.5">
                <span class="w-[19px] h-[19px] rounded-[5px] bg-[#0EA5E9] text-white text-[9px] font-extrabold flex items-center justify-center">DJI</span>
                <span class="text-[12px] font-bold text-[#141414]">代你操作 · 骑士</span>
              </div>
              ${cardStatusPill}
            </div>

            <div class="text-[10.5px] text-[#575651] font-semibold mb-1.5 flex items-center justify-between">
              <span>DJI Mimo · Osmo Action 5 Pro</span>
              <span class="text-[#0EA5E9] font-mono text-[9.5px]">GPS 强 · 4K60</span>
            </div>

            <!-- DJI Mimo 实时图传子视图 -->
            <div class="relative h-[146px] rounded-[11px] overflow-hidden bg-[#080B11] border border-black/15">
              ${flashLayer}
              <img src="${getCurrentLiveRoadImageSrc()}" class="w-full h-full object-cover scale-105 brightness-95" alt="DJI Mimo 图传"/>
              <!-- 电子水平仪准星 -->
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div class="w-14 h-[1px] bg-[#4ADE80]/70"></div>
                <div class="w-2 h-2 rounded-full border border-[#4ADE80]/80"></div>
              </div>
              <!-- 顶部相机参数栏 -->
              <div class="absolute top-2 left-2 right-2 flex items-center justify-between text-[9.5px] font-mono text-white">
                <span class="px-1.5 py-0.5 rounded bg-black/70 font-bold ${s === 2 ? 'text-rose-400' : 'text-white'}">
                  ${s === 2 ? `● REC 00:${secStr}` : '4K 60FPS'}
                </span>
                <span class="px-1.5 py-0.5 rounded bg-black/70 text-[#4ADE80]">🔋 86% · GPS</span>
              </div>
              <!-- 底部水印/增稳/高光状态栏 -->
              <div class="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/75 text-[9.5px] text-white flex items-center justify-between">
                <span>${s === 1 ? '📍 跨海高架桥 · 76km/h · 海拔42m' : 'RockSteady 3.0 超强增稳'}</span>
                <span class="text-[#F59E0B] font-bold">
                  ${s === 0 ? '图传就绪' : s === 1 ? '📸 已打卡' : s === 2 ? '正在录制' : '★ HiLight 已存'}
                </span>
              </div>
            </div>

            ${buildCardStepPills(pills, s)}
          </div>
        `;

        const djiHudTitles = [
          'DJI 已就绪 · 4K60',
          '📸 已打卡拍照 · 跨海高架',
          `● REC 正在录视频 00:${secStr}`,
          '✓ 4K视频已保存'
        ];
        const djiHudSubs = [
          'Osmo Action 5 Pro 实时图传连接 · 电量 86% · GPS强',
          '已叠加跨海高架地标 · 时速 76km/h 与海拔水印',
          'RockSteady 3.0 超强增稳已开启 · 语音随时标高光',
          '已打上 ★ HiLight 高光时刻标签并存入手机相册'
        ];
        hudBody.innerHTML = `
          <div class="text-[27px] font-extrabold hud-phosphor-main tracking-tight leading-tight">${djiHudTitles[s]}</div>
          <div class="mt-1.5 text-[13.5px] hud-phosphor-sub truncate">${djiHudSubs[s]}</div>
        `;

        miniPodContent.innerHTML = [
          `<div class="text-[9.5px] text-[#5EEAD4]/85 font-mono">DJI Action 5</div><div class="text-[12.5px] font-extrabold text-[#9BFAD0] mt-0.5">已连接 · 4K60</div>`,
          `<div class="text-[16px] leading-none">📸</div><div class="text-[12px] font-extrabold text-[#9BFAD0] mt-1">打卡拍照成功</div>`,
          `<div class="text-[10px] text-rose-400 font-mono font-bold">● REC</div><div class="text-[16px] font-mono font-black text-white mt-0.5">00:${secStr}</div>`,
          `<div class="text-[16px] text-[#4ADE80] font-black leading-none">✓</div><div class="text-[12px] font-extrabold text-[#9BFAD0] mt-1">4K视频已保存</div>`
        ][s];

        largePodContent.innerHTML = [
          `<div class="text-[11px] text-[#5EEAD4]/85 font-mono">DJI Osmo Action 5</div><div class="text-[18px] font-extrabold text-[#9BFAD0] mt-1">已连接 · 4K60</div><div class="text-[10.5px] text-[#5EEAD4]/80 mt-0.5">电量 86% · GPS强</div>`,
          `<div class="text-[22px] leading-none">📸</div><div class="text-[18px] font-extrabold text-[#9BFAD0] mt-1">已打卡拍照</div><div class="text-[10.5px] text-[#5EEAD4]/85 mt-0.5">跨海高架夜景水印</div>`,
          `<div class="text-[11px] text-rose-400 font-mono font-bold">● RockSteady 3.0</div><div class="text-[26px] font-mono font-black text-white mt-0.5">00:${secStr}</div><div class="text-[11px] text-rose-300">正在录制 4K 视频</div>`,
          `<div class="text-[22px] text-[#4ADE80] font-black leading-none">★ ✓</div><div class="text-[18px] font-extrabold text-[#9BFAD0] mt-1">4K视频已保存</div><div class="text-[10.5px] text-[#5EEAD4]/85 mt-0.5">HiLight 高光已标记</div>`
        ][s];
      }

      // ==================== 场景 4：[群] 定位感应发车友群 ====================
      else if (state.scenario === 'dji_group') {
        const pills = TIMELINE_CONFIG.dji_group;
        roleTag.textContent = 'AI';

        const groupPrompts = [
          '定位与 UWB 队友感应触发：驶入「环山观景弯道打卡点」，检测到老王(12m)、阿杰(18m)同框',
          '零语音自动触发：大疆已开启双机位 4K 跟拍并连拍 3 张压弯同框照',
          '驶出打卡弯道：骑士 AI 正在抽取压弯高光 + 引擎声浪卡点电音合成 15s 成片',
          'AI 已自动跳转微信，将 15s 高清成片与打卡定位直发至《骑行车友组队群 (12人)》'
        ];
        voiceTxt.textContent = groupPrompts[s];

        let groupSubView = '';
        if (s === 0) {
          groupSubView = `
            <div class="text-[10.5px] text-[#575651] font-semibold mb-1.5">地理围栏 + UWB 队友雷达自动感应</div>
            <div class="rounded-[11px] bg-[#1E1C18] text-white p-2.5 space-y-1.5 text-[10.5px]">
              <div class="flex items-center justify-between">
                <span class="text-white/65">打卡围栏：</span>
                <span class="text-[#F59E0B] font-bold">📍 环山观景弯道打卡点</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-white/65">同框队友：</span>
                <span class="text-[#4ADE80] font-bold">老王 (12m) · 阿杰 (18m)</span>
              </div>
              <div class="text-[10px] text-white/80 pt-1 border-t border-white/10">⚡ 满足组队同框条件，自动唤醒大疆跟拍</div>
            </div>
          `;
        } else if (s === 1) {
          groupSubView = `
            <div class="text-[10.5px] text-[#575651] font-semibold mb-1.5">AI 目标锁定跟拍 · 双机位录像 + 3连拍</div>
            <div class="relative h-[138px] rounded-[11px] overflow-hidden bg-[#080B11] border border-black/15">
              <img src="${getCurrentLiveRoadImageSrc()}" class="w-full h-full object-cover scale-105" alt="AI 锁定队友摩托"/>
              <!-- 绿色 AI 追踪框锁定队友摩托 -->
              <div class="absolute left-[31%] top-[34%] w-12 h-12 border-[1.8px] border-[#4ADE80] rounded-xs shadow-[0_0_8px_rgba(74,222,128,0.6)]">
                <span class="absolute -top-4 left-0 px-1 bg-[#4ADE80] text-[#0B1410] text-[8px] font-extrabold rounded-xs whitespace-nowrap">老王 12m</span>
              </div>
              <div class="absolute left-[58%] top-[38%] w-11 h-11 border-[1.8px] border-[#4ADE80] rounded-xs shadow-[0_0_8px_rgba(74,222,128,0.6)]">
                <span class="absolute -top-4 left-0 px-1 bg-[#4ADE80] text-[#0B1410] text-[8px] font-extrabold rounded-xs whitespace-nowrap">阿杰 18m</span>
              </div>
              <div class="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/75 text-[9.5px] text-white flex justify-between">
                <span>📸 连拍 3/3 张压弯同框</span>
                <span class="text-rose-400 font-mono font-bold">● AUTO REC</span>
              </div>
            </div>
          `;
        } else if (s === 2) {
          groupSubView = `
            <div class="text-[10.5px] text-[#575651] font-semibold mb-1.5">AI 自动卡点剪辑渲染完成</div>
            <div class="rounded-[11px] bg-[#1E1C18] text-white p-3 space-y-2 text-[10.5px]">
              <div class="flex items-center justify-between">
                <span class="font-bold text-[#F59E0B]">🎬 夜骑小队 · 观景弯打卡.mp4</span>
                <span class="text-[#4ADE80] font-mono font-bold">15s</span>
              </div>
              <div class="text-[10px] text-white/75">✓ 高光压弯镜头 ×3 · 引擎声浪 + 电音卡点 BGM</div>
              <div>
                <div class="flex justify-between text-[9.5px] text-[#4ADE80] font-mono mb-1">
                  <span>AI 成片渲染完成</span><span>100% 成片 15s</span>
                </div>
                <div class="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
                  <div class="w-full h-full bg-[#4ADE80]"></div>
                </div>
              </div>
            </div>
          `;
        } else {
          groupSubView = `
            <div class="flex items-center justify-between text-[10.5px] text-[#15803D] font-bold mb-1.5">
              <span>微信 · 骑行车友组队群 (12人)</span>
              <span>已自动分享</span>
            </div>
            <div class="rounded-[11px] bg-[#18202C] text-white p-2.5 flex items-center justify-between">
              <div class="min-w-0 pr-2">
                <div class="text-[9.5px] text-[#4ADE80] font-bold">🎬 15s 高清卡点成片 · 📍环山观景弯</div>
                <div class="text-[11px] font-bold mt-0.5 truncate">夜骑小队 · 观景弯压弯同框</div>
              </div>
              <span class="w-7 h-7 rounded-full bg-[#2AAE67] text-white flex items-center justify-center text-[10px] shrink-0">▶</span>
            </div>
            <div class="mt-1.5 space-y-1">
              <div class="rounded-lg bg-[#EFECE6] px-2.5 py-1 text-[10px] text-[#1F1F1F]">
                <strong>老王：</strong>帅炸了！刚出弯成片就自动发群里了 🔥
              </div>
              <div class="rounded-lg bg-[#EFECE6] px-2.5 py-1 text-[10px] text-[#1F1F1F]">
                <strong>阿杰：</strong>这压弯追踪卡点绝了 👏
              </div>
            </div>
          `;
        }

        phoneStream.innerHTML = `
          <div class="text-center text-[10px] text-[#9A9992]">20:30</div>
          <div class="bg-white rounded-[15px] p-3 shadow-[0_3px_12px_rgba(0,0,0,0.05)] border border-black/[0.05]">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-1.5">
                <span class="w-[19px] h-[19px] rounded-[5px] bg-[#EA580C] text-white text-[10px] font-bold flex items-center justify-center">群</span>
                <span class="text-[12px] font-bold text-[#141414]">代你操作 · 骑士</span>
              </div>
              ${cardStatusPill}
            </div>
            ${groupSubView}
            ${buildCardStepPills(pills, s)}
          </div>
        `;

        const grpHudTitles = [
          '📍 感应触发 · 队友同框 (3人)',
          '● 自动跟拍 · 锁定队友摩托',
          '🎬 AI 自动剪辑完成 (15s)',
          '✓ 成片已发 · 骑行车友组队群'
        ];
        const grpHudSubs = [
          '环山观景弯道打卡点 · 老王(12m) 阿杰(18m) 同框',
          '零语音介入 · 双机位 4K 录像 + 压弯同框 3 连拍',
          '已合成高光压弯镜头 + 引擎声浪电音 BGM + 字幕',
          '《骑行车友组队群 (12人)》 · 老王回复：帅炸了！'
        ];
        hudBody.innerHTML = `
          <div class="text-[26px] font-extrabold hud-phosphor-main tracking-tight leading-tight">${grpHudTitles[s]}</div>
          <div class="mt-1.5 text-[13.5px] hud-phosphor-sub truncate">${grpHudSubs[s]}</div>
        `;

        miniPodContent.innerHTML = [
          `<div class="text-[9.5px] text-[#5EEAD4]/85 font-semibold">UWB 3人同框</div><div class="text-[12.5px] font-extrabold text-[#9BFAD0] mt-0.5">自动跟拍触发</div>`,
          `<div class="text-[9.5px] text-rose-400 font-mono font-bold">● AUTO 跟拍</div><div class="text-[12px] font-extrabold text-white mt-0.5">双机位+3连拍</div>`,
          `<div class="text-[9.5px] text-[#5EEAD4]/85 font-semibold">AI 卡点合成</div><div class="text-[13px] font-extrabold text-[#9BFAD0] mt-0.5">100% 成片15s</div>`,
          `<div class="text-[16px] text-[#4ADE80] font-black leading-none">✓</div><div class="text-[11.5px] font-extrabold text-[#9BFAD0] mt-1">已分享至车友群</div>`
        ][s];

        largePodContent.innerHTML = [
          `<div class="text-[11px] text-[#5EEAD4]/85 font-semibold">观景弯 · 队友同框(3人)</div><div class="text-[18px] font-extrabold text-[#9BFAD0] mt-1">自动跟拍触发</div><div class="text-[10.5px] text-[#5EEAD4]/80 mt-0.5">老王12m · 阿杰18m</div>`,
          `<div class="text-[11px] text-rose-400 font-mono font-bold">● AI 绿框追踪中</div><div class="text-[19px] font-extrabold text-white mt-1">自动录像 & 抓拍</div><div class="text-[10.5px] text-rose-300 mt-0.5">压弯同框 3 连拍</div>`,
          `<div class="text-[11px] text-[#5EEAD4]/85 font-semibold">引擎声浪 + 电音BGM</div><div class="text-[19px] font-extrabold text-[#9BFAD0] mt-1">AI 剪辑完成 15s</div><div class="text-[10.5px] text-[#5EEAD4]/85 mt-0.5">夜骑小队·观景弯打卡</div>`,
          `<div class="text-[22px] text-[#4ADE80] font-black leading-none">✓</div><div class="text-[18px] font-extrabold text-[#9BFAD0] mt-1">已分享至车友群</div><div class="text-[10.5px] text-[#5EEAD4]/85 mt-0.5">老王：帅炸了 🔥</div>`
        ][s];
      }

      const speechKey = `${state.scenario}:${s}:${state.navIdx}`;
      if (speak && lastSpeechKey !== speechKey && voiceTxt.textContent) {
        lastSpeechKey = speechKey;
        speak(voiceTxt.textContent);
      }
      renderTimelineTrack();
    }

    // 渲染底部四段式琥珀橙进度条 (#F59E0B)
    function renderTimelineTrack() {
      const steps = TIMELINE_CONFIG[state.scenario];
      const container = byId('four-step-timeline');
      const pct = Math.min(100, (state.elapsedMs / state.stepDurationMs) * 100);

      container.innerHTML = steps.map((title, idx) => {
        let fillW = '0%';
        if (idx < state.step) fillW = '100%';
        else if (idx === state.step) fillW = `${pct.toFixed(1)}%`;

        const txtStyle = idx === state.step
          ? 'text-white font-bold'
          : idx < state.step
            ? 'text-white/70 font-medium'
            : 'text-white/42 font-normal';

        return `
          <div data-ai-action="step" data-step="${idx}" class="flex flex-col justify-between cursor-pointer group ${idx > 0 ? 'border-l border-white/[0.09]' : ''}">
            <div class="w-full h-[2.5px] bg-white/[0.16] overflow-hidden">
              <div class="h-full bg-[#F59E0B]" style="width:${fillW}"></div>
            </div>
            <div class="px-3 pt-1.5 pb-1 text-[12px] ${txtStyle} group-hover:text-white transition truncate">
              0${idx + 1} · ${title}
            </div>
          </div>
        `;
      }).join('');
    }

    // ==================== 五、夜间高速微流光粒子 Canvas + 自动轮播主循环 ====================
    const motionCanvas = byId('highway-motion-canvas');
    const mCtx = motionCanvas.getContext('2d');
    const streaks = Array.from({ length: 12 }, (_, i) => ({
      dir: i % 2 === 0 ? 1 : -1,
      prog: i / 12,
      spd: 0.0002 + (i % 4) * 0.00005,
      color: i % 3 === 0 ? 'rgba(245, 158, 11,' : 'rgba(239, 68, 68,'
    }));

    function initMotionCanvas() {
      motionCanvas.width = 1360;
      motionCanvas.height = 740;
    }

    let rafId = 0;
    let lastTick = performance.now();
    function tickLoop(now) {
      if (destroyed) return;
      const dt = Math.min(80, now - lastTick);
      lastTick = now;

      if (state.playing && !document.hidden) {
        state.elapsedMs += dt;
        if (state.elapsedMs >= state.stepDurationMs) {
          state.elapsedMs = 0;
          if (state.scenario === 'meituan' && state.step === 3 && state.navIdx < 2) {
            state.navIdx++;
            renderThreeEnds();
          } else {
            state.step = (state.step + 1) % 4;
            if (state.step === 0) state.navIdx = 0;
            if (state.scenario === 'dji_voice' && state.step === 1) state.triggerFlash = true;
            if (state.step >= 1) emitPhoneTouchRipple(72, 54);
            renderThreeEnds();
          }
        } else {
          renderTimelineTrack();
        }
      }

      mCtx.clearRect(0, 0, 1360, 740);
      const vpX = 720;
      const vpY = 355;

      streaks.forEach(st => {
        st.prog = (st.prog + dt * st.spd) % 1;
        const p = Math.pow(st.prog, 2.3);
        const x1 = vpX + st.dir * (36 + p * 540);
        const y1 = vpY + p * 290;
        const x2 = vpX + st.dir * (36 + p * 1.13 * 540);
        const y2 = vpY + p * 1.13 * 290;

        const g = mCtx.createLinearGradient(x1, y1, x2, y2);
        g.addColorStop(0, st.color + '0)');
        g.addColorStop(0.5, st.color + (0.14 * p).toFixed(3) + ')');
        g.addColorStop(1, st.color + '0)');
        mCtx.strokeStyle = g;
        mCtx.lineWidth = 1 + p * 3.2;
        mCtx.beginPath();
        mCtx.moveTo(x1, y1);
        mCtx.lineTo(x2, y2);
        mCtx.stroke();
      });

      rafId = requestAnimationFrame(tickLoop);
    }

    const recTimer = setInterval(() => {
      if (destroyed) return;
      state.recSeconds = (state.recSeconds + 1) % 60;
      if (state.scenario === 'dji_voice' && state.step === 2) {
        renderThreeEnds();
      }
    }, 1000);

    // ShadowRoot 统一事件委托
    shadow.addEventListener('click', ev => {
      const actionEl = ev.target.closest('[data-ai-action]');
      if (!actionEl) return;
      if (ev.target.closest('[data-stop-prop]') && !actionEl.closest('[data-stop-prop]')) return;
      const act = actionEl.dataset.aiAction;
      if (act === 'gen-bg') generateAiHelmetPovImage(true);
      else if (act === 'scenario') switchScenario(actionEl.dataset.sc);
      else if (act === 'view') switchViewMode(actionEl.dataset.mode);
      else if (act === 'step-next') { ev.stopPropagation(); stepForward(); }
      else if (act === 'step-prev') { ev.stopPropagation(); stepBackward(); }
      else if (act === 'toggle-play') { ev.stopPropagation(); togglePlayPause(); }
      else if (act === 'replay') { ev.stopPropagation(); replayCurrentScenario(); }
      else if (act === 'step') goToStep(Number(actionEl.dataset.step));
      else if (act === 'meituan-store') selectMeituanStore(Number(actionEl.dataset.idx), actionEl.dataset.adv === '1');
      else if (act === 'next-intersection') simulateNextIntersection(ev);
    });

    const uploadInput = byId('ai-local-bg-input');
    if (uploadInput) uploadInput.addEventListener('change', handleLocalBgUpload);

    fitStageToViewport();
    initMotionCanvas();
    switchViewMode('all');
    renderThreeEnds();
    generateAiHelmetPovImage(false);
    rafId = requestAnimationFrame(tickLoop);

    return {
      replay: replayCurrentScenario,
      toggle: togglePlayPause,
      destroy() {
        destroyed = true;
        cancelAnimationFrame(rafId);
        clearInterval(recTimer);
        if (state.hudSoftDimTimer) clearTimeout(state.hudSoftDimTimer);
        resizeObserver.disconnect();
      }
    };
  
};
