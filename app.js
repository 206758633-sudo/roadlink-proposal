/**
 * ROADLINK × 智能骑行方案路演 (高可视化 + 图片视频模拟演示版)
 * 采用 Knight 左右分屏模拟器架构 + BRP 黑金轻奢质感
 * 特性：高画质实景平移变焦 + 4K 60FPS 视频仪表与雷达图层 + 快门闪光大片弹窗 + 极简大字号遥测
 */
(function () {
  'use strict';

  var cleanups = [];
  function onCleanup(fn) { cleanups.push(fn); }
  function flushCleanups() {
    while (cleanups.length) {
      try { cleanups.pop()(); } catch (e) { console.error(e); }
    }
  }

  function asset(name) { return 'assets/roadlink-' + name + '.webp'; }

  // 语音播报模块
  var audioEnabled = false;
  var audioBtn = document.getElementById('btn-audio');
  var audioLabel = document.getElementById('audio-label');
  var replayBtn = document.getElementById('btn-replay');

  function speakText(text) {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      var clean = text.replace(/^[🎙️🤖📡🛡️💬🛑📸✨\s]+/, '').replace(/[「」『』]/g, '');
      var utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }

  if (audioBtn) {
    audioBtn.addEventListener('click', function () {
      audioEnabled = !audioEnabled;
      audioBtn.setAttribute('aria-pressed', String(audioEnabled));
      if (audioLabel) audioLabel.textContent = audioEnabled ? '🔊 声音已开' : '🔇 声音已关';
      if (audioEnabled) speakText('ROADLINK 智能骑行视效演示已就绪');
      else if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    });
  }

  // ==================== 5 大场景与 20 项核心功能定义 (极简文字 · 突出高能视效) ====================
  var SCENES = [
    {
      id: 's1',
      num: '01',
      eyebrow: 'GROUP RIDE & SOCIAL',
      title: '组队与车友社交',
      tagline: '车队快速配对 · 电子外挂号牌 · F1式里程榜 · 3D轨迹回放 · 接近自动拍照',
      features: [
        {
          id: 'pair',
          name: '车队快速配对/位置共享',
          sub: 'UWB碰一碰秒级建队 · 动态网状雷达全域共享',
          bg: 'convoy',
          videoType: 'radar_convoy',
          cam: [{ z: 1.04, ox: 0, oy: 0 }, { z: 1.16, ox: -15, oy: -10 }, { z: 1.08, ox: 8, oy: 5 }],
          phases: [
            {
              step: '1 发生', title: '车友集合点碰一碰',
              hud: { icon: '📡', title: '发现附近车友设备', desc: 'UWB 扫描到「05 老周」「18 阿岳」，相距 2.4m' },
              voice: '检测到车队碰一碰，正在建立加密 MESH 自组网...',
              vals: [{ k: '车队状态', v: '自组网建立中', cls: 'accent' }, { k: '对讲频段', v: '433.8 MHz' }, { k: '入网成员', v: '3 台机车' }],
              punchline: '无需输群号，头盔/车把靠近 1 秒内无感完成自组网，无信号深山也能通对讲。'
            },
            {
              step: '2 系统反应', title: '全队高精度雷达锁定',
              hud: { icon: '⚡', title: '全员位置雷达锁定', desc: '10Hz 高频刷新，端到端延迟仅 18ms，掉队 500m 自动告警' },
              voice: '车队雷达已锁定，阿岳领航 120m，老周伴随 45m。',
              vals: [{ k: '网络延迟', v: '18 ms', cls: 'success' }, { k: '刷新频率', v: '10 Hz' }, { k: '掉队阈值', v: '500 m' }],
              punchline: '仪表盘与 HUD 毫秒级同步全队每个人的方位和车速，车队再长也不会跟丢。'
            },
            {
              step: '3 解决', title: '无缝编队巡航共享',
              hud: { icon: '📍', title: '全队巡航阵型保持', desc: '全队平均时速 68km/h，间距 82m，失联概率 0.00%' },
              voice: '全队位置共享生效中，前方 800m 进入山道。',
              vals: [{ k: '平均时速', v: '68 km/h', cls: 'accent' }, { k: '队形间距', v: '82 m' }, { k: '失联概率', v: '0.00%', cls: 'success' }],
              punchline: '小白秒懂：就像开着全天候车队雷达雷达屏，随时随地知道前后队友在哪。'
            }
          ]
        },
        {
          id: 'plate',
          name: '可编程外挂号牌',
          sub: '车尾超低功耗双色水墨屏 · 阳光直射清晰可见',
          bg: 'hardware-edge',
          videoType: 'eink_flash',
          cam: [{ z: 1.06, ox: 5, oy: 10 }, { z: 1.25, ox: 15, oy: 6 }, { z: 1.12, ox: 0, oy: 0 }],
          phases: [
            {
              step: '1 发生', title: '手机一键下发号牌',
              hud: { icon: '🏷️', title: '设定车手号牌', desc: '下发「07 陈默 / AB型血 / 浙A·MOTO」' },
              voice: '已为您将车手号牌与急救血型下发至车尾墨水屏。',
              vals: [{ k: '号牌模式', v: '车队赛道', cls: 'accent' }, { k: '显示介质', v: '电子墨水屏' }, { k: '续航周期', v: '180 天' }],
              punchline: '车尾轻量化智能号牌，断电永久保持，强光直射依然清晰可见。'
            },
            {
              step: '2 系统反应', title: '黑白反转刷写渲染',
              hud: { icon: '🔄', title: '墨水屏刷新完成', desc: '黑白高对比反转刷写，夜骑微光导光环自适应点亮' },
              voice: '号牌已同步更新，微光轮廓条已适配夜骑模式。',
              vals: [{ k: '刷写耗时', v: '0.42 s', cls: 'success' }, { k: '背光亮度', v: '自适应 65%' }, { k: '防护等级', v: 'IP68 防暴' }],
              punchline: '遇险碰撞时可瞬间切为「SOS 红色求救标牌」，抢夺黄金救援时间。'
            },
            {
              step: '3 解决', title: '后车一秒精准识队',
              hud: { icon: '🏁', title: '车队辨识率 100%', desc: '后方车友一眼即知前车身份与编号，杜绝陌生车队混入' },
              voice: '号牌已就绪，进站打卡与检录秒级自动识别。',
              vals: [{ k: '编队辨识率', v: '100%', cls: 'success' }, { k: '个性表达', v: '自由定制' }, { k: '急救血型', v: '常驻显现' }],
              punchline: '小白秒懂：帅气拉风，后车一眼认出队长和同伴，不会跟错陌生车队。'
            }
          ]
        },
        {
          id: 'ranking',
          name: 'F1式骑行总里程排名',
          sub: '实时遥测积分抓取 · 车队天梯动态榜单',
          bg: 'replay',
          videoType: 'f1_rank',
          cam: [{ z: 1.02, ox: 0, oy: 0 }, { z: 1.15, ox: -10, oy: -15 }, { z: 1.08, ox: 5, oy: 5 }],
          phases: [
            {
              step: '1 发生', title: '车手冲刺累计里程',
              hud: { icon: '🏎️', title: 'F1 遥测数据抓取', desc: '「07 陈默」本段冲刺 18.4km，总里程达 412.8km' },
              voice: '里程数据实时写入账本，当前顺位 P2。',
              vals: [{ k: '实时总里程', v: '412.8 km', cls: 'accent' }, { k: '即时顺位', v: 'P2' }, { k: '距榜首差距', v: '-3.2 km' }],
              punchline: '参考 F1 动态遥测看板，把骑行变成趣味十足的车队天梯积分榜。'
            },
            {
              step: '2 系统反应', title: '顺位上升动态跳动',
              hud: { icon: '📈', title: '超越队友提示', desc: '超越「05 老周」升至总榜第 2 位，解锁山道先锋徽章' },
              voice: '恭喜！您的排名升至第 2 位，距离榜首仅差 3.2 公里！',
              vals: [{ k: '当前排名', v: 'P2 (▲1)', cls: 'success' }, { k: '累计爬升', v: '1,420 m' }, { k: '能效平顺分', v: '94 分' }],
              punchline: '圆屏支持一键切屏查看车队积分榜，重点嘉奖连续骑行耐力与安全合规。'
            },
            {
              step: '3 解决', title: '全队战报赛季结算',
              hud: { icon: '🏆', title: '车队总里程突破', desc: '全队累计贡献 1,248km，解锁千岛湖黄金勋章' },
              voice: '里程已同步至车友荣誉堂，全队公会排名前 5%。',
              vals: [{ k: '车队总里程', v: '1,248 km', cls: 'accent' }, { k: '省公会排名', v: 'Top 5%', cls: 'success' }, { k: '社交点赞', v: '328 +' }],
              punchline: '小白秒懂：每一公里都有团队积分和社交荣誉，骑完有得聊、有得炫。'
            }
          ]
        },
        {
          id: 'trajectory',
          name: '骑行轨迹高精回放',
          sub: '六轴 IMU 厘米级姿态还原 · 3D 压弯大片复盘',
          bg: 'corner',
          videoType: 'lean_angle',
          cam: [{ z: 1.05, ox: -10, oy: 10 }, { z: 1.22, ox: 8, oy: -10 }, { z: 1.08, ox: 0, oy: 0 }],
          phases: [
            {
              step: '1 发生', title: '连续攻弯数据记录',
              hud: { icon: '📐', title: '六轴陀螺仪高频采样', desc: '连续 12 个发卡弯，最大压弯倾角 38.4°，弯心最低时速 46km/h' },
              voice: '正在高频记录车身姿态、压弯倾角与刹车力度。',
              vals: [{ k: '当前倾角', v: '38.4°', cls: 'accent' }, { k: '侧向 G 值', v: '1.24 G' }, { k: '过弯平顺度', v: '96 分' }],
              punchline: '六轴 IMU 配合高精 GNSS，记录每一米行驶的倾角姿态与赛车走线。'
            },
            {
              step: '2 系统反应', title: '3D 动态轨迹重建',
              hud: { icon: '🎥', title: '3D 走线分析生成', desc: '对比「最佳赛车走线 vs 实际走线」，3号弯建议晚制动 0.2s' },
              voice: '3D 轨迹渲染完成，过弯动作评级为 S 级。',
              vals: [{ k: '轨迹偏差', v: '< 0.3 m', cls: 'success' }, { k: '制动点优化', v: '延后 0.2s' }, { k: '动作评级', v: 'S 级' }],
              punchline: '无需繁琐导出视频，手机内即可 360° 旋转观看 3D 赛车级走线大片。'
            },
            {
              step: '3 解决', title: '15秒炫酷大片秒传',
              hud: { icon: '✨', title: '生成车载仪表短视频', desc: '带真实时速、倾角和转速表的 15 秒短视频，一键发朋友圈' },
              voice: '大片级轨迹视频已导出，随时可一键分发社群。',
              vals: [{ k: '视频画质', v: '4K / 60fps', cls: 'accent' }, { k: '生成耗时', v: '3 秒' }, { k: '社交热度', v: '爆款内容', cls: 'success' }],
              punchline: '小白秒懂：不需要会剪辑，一键导出像职业博主一样的机车过弯大片。'
            }
          ]
        },
        {
          id: 'capture',
          name: '同伴接近自动拍照',
          sub: '25m 测距雷达感知 · AI 双向抓拍并秒发群聊',
          bg: 'ride-capture',
          videoType: 'shutter_capture',
          cam: [{ z: 1.04, ox: 0, oy: 0 }, { z: 1.28, ox: 22, oy: 8 }, { z: 1.12, ox: 10, oy: 0 }],
          phases: [
            {
              step: '1 发生', title: '车友并线加速接近',
              hud: { icon: '🎯', title: '同伴接近感知 25m', desc: '后视镜头识别队友「18 阿岳」以 +15km/h 相对时速在右后侧接近' },
              voice: '注意，车友阿岳正在右后方 14 米接近，抓拍引擎已预热。',
              vals: [{ k: '同伴目标', v: '18 阿岳', cls: 'accent' }, { k: '相对距离', v: '14.2 m' }, { k: '相对时速', v: '+15 km/h' }],
              punchline: '以往拍照必须冒险单手掏手机，现在前后 4K 摄像头通过视觉测距自动戒备。'
            },
            {
              step: '2 系统反应', title: 'AI 双向连拍触发',
              hud: { icon: '📸', title: '黄金机位抓拍！', desc: '双方进入并骑黄金机位，两车互拍 3 张 HDR 运动连拍，AI 实时超清防抖' },
              voice: '咔嚓！已为您抓拍并骑过弯瞬间，AI 增强处理中。',
              vals: [{ k: '快门速度', v: '1/2000 s', cls: 'success' }, { k: '防抖算法', v: 'EIS 运动防抖' }, { k: '连拍张数', v: '3 张' }],
              punchline: '两台车局域无线握手，实现「你拍我、我拍你」的默契双机位互拍。'
            },
            {
              step: '3 解决', title: '秒推微信车友相册',
              hud: { icon: '🎉', title: '照片已自动共享', desc: '4K 并骑大片推送至车队相册，阿岳的车机和手机已同步收到' },
              voice: '照片已同步推送至车队微信群，双手全程紧握车把。',
              vals: [{ k: '传输时延', v: '1.2 秒', cls: 'success' }, { k: '成片画质', v: '4K UltraHD' }, { k: '脱把概率', v: '0% 安全', cls: 'accent' }],
              punchline: '小白秒懂：双手不离开车把，骑完全程就能收获上百张自己骑车时的超帅动态大片！'
            }
          ]
        }
      ]
    },
    {
      id: 's2',
      num: '02',
      eyebrow: 'DISPLAY & NAVIGATION',
      title: '骑行显示与导航',
      tagline: '头盔内导航贴片 · Glimpse圆屏二次开发 · 物理按键盲操 · CarPlay/HUD多屏协同',
      features: [
        {
          id: 'visor',
          name: '头盔内导航贴片',
          sub: '光波导超微透镜 · 视线前方 3 米虚像浮空指引',
          bg: 'hardware-visor',
          videoType: 'hud_visor',
          cam: [{ z: 1.05, ox: 0, oy: 0 }, { z: 1.25, ox: -16, oy: -10 }, { z: 1.10, ox: -5, oy: 0 }],
          phases: [
            {
              step: '1 发生', title: '复杂路口视线盲区',
              hud: { icon: '👁️', title: '视线不离前方道路', desc: '前方 150 米为五岔路口，低头看手机支架会导致 2.5 秒视线盲区' },
              voice: '前方复杂路口，头盔贴片 HUD 进入引导模式。',
              vals: [{ k: '虚像距离', v: '前方 3 米', cls: 'accent' }, { k: '镜片厚度', v: '1.8 mm' }, { k: '透过率', v: '> 85%' }],
              punchline: '任何普通头盔均可磁吸贴装，信息投射在眼睛前方 3 米虚像，无需重新对焦。'
            },
            {
              step: '2 系统反应', title: '极简黄色转向浮空',
              hud: { icon: '↗️', title: '浮空动态路标', desc: '视野右上角浮现极简黄色箭头「80m 后右转辅道」，3000 nits 白天清晰' },
              voice: '保持当前车道，80 米后由右侧辅道进入盘山公路。',
              vals: [{ k: '转向距离', v: '80 m', cls: 'success' }, { k: '峰值亮度', v: '3,000 nits' }, { k: '视野遮挡', v: '0%' }],
              punchline: '只显示最关键信息（转向、时速、盲区红框），绝不遮挡路面观察视线。'
            },
            {
              step: '3 解决', title: '盲操过弯视线全专注',
              hud: { icon: '🛡️', title: '安全通过复杂路口', desc: '骑手无需低头，眼睛全程注视前方弯心，过弯安全性提升 85%' },
              voice: '转向完成，恢复标准巡航 HUD 视图。',
              vals: [{ k: '低头盲区', v: '0 秒', cls: 'success' }, { k: '对焦延时', v: '0 ms' }, { k: '驾驶专注度', v: '100%', cls: 'accent' }],
              punchline: '小白秒懂：告别在高速或山道低头看手机的致命隐患，像战斗机飞行员一样看浮空指引。'
            }
          ]
        },
        {
          id: 'glimpse',
          name: 'Glimpse圆屏与自定义按键',
          sub: '1.4寸纯圆机械质感表盘 · 手把大拇指物理拨轮盲操',
          bg: 'hardware-kit',
          videoType: 'round_gauge',
          cam: [{ z: 1.08, ox: 0, oy: 15 }, { z: 1.25, ox: 10, oy: 16 }, { z: 1.10, ox: 0, oy: 5 }],
          phases: [
            {
              step: '1 发生', title: '复古纯圆仪表就绪',
              hud: { icon: '🔘', title: 'Glimpse 智能圆屏', desc: '复刻机械表盘质感，开放开源二次开发接口' },
              voice: 'Glimpse 车把表头已连接，当前加载复古时速表盘。',
              vals: [{ k: '屏幕形态', v: '1.4寸 纯圆', cls: 'accent' }, { k: '分辨率', v: '454×454 Retina' }, { k: '安装位置', v: '手把中央上盖' }],
              punchline: '兼顾复古机车美学与现代数字功能，小巧不破坏爱车整体颜值。'
            },
            {
              step: '2 系统反应', title: '物理按键盲操切换',
              hud: { icon: '🎛️', title: '拨轮切换多模态', desc: '大拇指轻推左侧五向拨轮，瞬间切至「胎温胎压监控」与「倾角罗盘」' },
              voice: '切换至胎压监控，前轮 2.3 bar，后轮 2.5 bar。',
              vals: [{ k: '前轮胎压', v: '2.3 bar', cls: 'success' }, { k: '后轮胎压', v: '2.5 bar', cls: 'accent' }, { k: '切屏响应', v: '16 ms' }],
              punchline: '戴重型手套也能通过机械按键盲操切屏，长按还能一键对讲或打双闪。'
            },
            {
              step: '3 解决', title: '关键数据尽在掌控',
              hud: { icon: '✨', title: '多信息极简直观', desc: '胎压异常时边缘爆闪红色环形警示，指针指示领航方位' },
              voice: '当前胎温胎压处于最佳抓地力区间，可放心过弯。',
              vals: [{ k: '盲操准确率', v: '100%', cls: 'success' }, { k: '抗振等级', v: '车规 20G' }, { k: '个性皮肤', v: '自由定制' }],
              punchline: '小白秒懂：大拇指一抠就能看胎压和罗盘，扎实省心，手机再也不会震坏脱落。'
            }
          ]
        },
        {
          id: 'carplay_hud',
          name: 'CarPlay屏与HUD协同',
          sub: '中控7寸大屏全景规划 · 头盔HUD微光关键指引',
          bg: 'hardware-installed',
          videoType: 'cockpit_sync',
          cam: [{ z: 1.05, ox: 0, oy: 0 }, { z: 1.18, ox: -10, oy: 8 }, { z: 1.10, ox: 0, oy: 0 }],
          phases: [
            {
              step: '1 发生', title: '双屏任务智能分配',
              hud: { icon: '📱', title: 'CarPlay 中控连接', desc: '7 英寸高亮车规大屏无线直连 Apple CarPlay / HiCar' },
              voice: '双屏协同已激活：大屏看全景路网，头盔负责关键转弯。',
              vals: [{ k: '主屏形态', v: '7寸 车规大屏', cls: 'accent' }, { k: '无线协议', v: 'WiFi 6 + BLE' }, { k: '协同架构', v: '双屏异显' }],
              punchline: '大屏看全城路况与拥堵红线，头盔 HUD 仅在临近路口弹窗精简黄色箭头。'
            },
            {
              step: '2 系统反应', title: '视线焦点自动流转',
              hud: { icon: '🔄', title: '焦点智能流转', desc: '直道大屏待机，入弯前头盔高亮锁定，盲区有车时边缘闪烁黄色预警' },
              voice: '右后盲区有车辆接近，HUD 右下角已同步闪烁警示。',
              vals: [{ k: '双屏同步差', v: '< 8 ms', cls: 'success' }, { k: '防雨触控', v: '手套触控' }, { k: '自动亮度', v: '双光感联动' }],
              punchline: '不仅支持导航，还能将音乐歌词、来电与对讲频道在多屏之间智能分流。'
            },
            {
              step: '3 解决', title: '沉浸式智能座舱体验',
              hud: { icon: '🏍️', title: '顶级人机交互协同', desc: '全车信息井井有条，既有科技豪华感，又将安全风险降至最低' },
              voice: '当前巡航模式已设定，双屏协同稳定工作中。',
              vals: [{ k: '信息认知时耗', v: '-70%', cls: 'success' }, { k: '多端协同度', v: '100%' }, { k: '座舱科技感', v: '豪华尊享', cls: 'accent' }],
              punchline: '小白秒懂：像开跑车一样骑摩托，车机大屏看宏观路线，头盔 HUD 引导过弯。'
            }
          ]
        }
      ]
    },
    {
      id: 's3',
      num: '03',
      eyebrow: 'AI INTERACTION & PHONE CONTROL',
      title: 'AI 交互与手机操控',
      tagline: '戴手套小设备盲操 · 手把触感微控器 · 80km/h风噪过滤 · 语音总结与口述代发微信',
      features: [
        {
          id: 'glove',
          name: '戴手套用小设备操控',
          sub: '无线指环/手把微触控器 · 免脱手套机械盲操',
          bg: 'voice',
          videoType: 'tactile_ring',
          cam: [{ z: 1.05, ox: 0, oy: 0 }, { z: 1.25, ox: -12, oy: 15 }, { z: 1.10, ox: 0, oy: 5 }],
          phases: [
            {
              step: '1 发生', title: '厚重手套无法触屏',
              hud: { icon: '🧤', title: '传统触屏痛点', desc: '冬季/防摔碳纤维手套无法滑动手机屏幕，以往看消息必须停车' },
              voice: '戴着碳纤维硬壳手套，手机来电与消息无法触控。',
              vals: [{ k: '传统操作', v: '必须停车脱手套', cls: 'danger' }, { k: '安全隐患', v: '路边违停 / 分心' }, { k: '耗时', v: '> 60 秒' }],
              punchline: '专业骑行手套有厚重护具，很多新手因强行单手脱手套划手机而摔车追尾。'
            },
            {
              step: '2 系统反应', title: '手把微触控器触发',
              hud: { icon: '🖲️', title: '微动触控秒级激活', desc: '大拇指轻按手把控制器，无需脱手套，直达手机后台唤醒 AI' },
              voice: '手把控制器已捕获双击手势，进入骑行免触控制模式。',
              vals: [{ k: '响应延迟', v: '12 ms', cls: 'success' }, { k: '连接协议', v: 'BLE 5.3 工业级' }, { k: '防护等级', v: 'IP67 防水抗汗' }],
              punchline: '微控制器体积如硬币大小，微动按键隔着 5mm 厚手套也有清脆机械手感。'
            },
            {
              step: '3 解决', title: '双手不离把操控一切',
              hud: { icon: '✨', title: '全程双手紧握龙头', desc: '切歌、接电话、唤醒导航、呼叫队友，手指轻拨一秒完成' },
              voice: '已接通老周的语音通话，降噪麦克风已过滤发动机轰鸣。',
              vals: [{ k: '脱把概率', v: '0% 安全', cls: 'accent' }, { k: '操作成功率', v: '99.8%', cls: 'success' }, { k: '骑行安全感', v: '极佳' }],
              punchline: '小白秒懂：手套不用脱，双手不离车把，大拇指按一下搞定手机一切功能。'
            }
          ]
        },
        {
          id: 'wechat',
          name: 'AI总结与代发微信',
          sub: '主动抗风噪降噪 · 大模型长消息提炼 · 口述代发微信',
          bg: 'ai-engine',
          videoType: 'ai_wechat',
          cam: [{ z: 1.05, ox: 0, oy: 0 }, { z: 1.22, ox: 15, oy: -10 }, { z: 1.10, ox: 5, oy: 0 }],
          phases: [
            {
              step: '1 发生', title: '连续收到 8 条长消息',
              hud: { icon: '💬', title: '收到紧急长消息', desc: '工作群发来 5 条语音与 3 条文本：「今晚评审改 8 点，需要你确认方案」' },
              voice: '收到微信群聊 8 条未读消息，骑行 AI 助理正在提炼核心摘要。',
              vals: [{ k: '未读条数', v: '8 条消息', cls: 'accent' }, { k: '原始字数', v: '286 字' }, { k: '阅读负荷', v: '不可看' }],
              punchline: '骑行中手机震个不停极度焦虑，端侧大模型第一时间浓缩为一句干练口语。'
            },
            {
              step: '2 系统反应', title: 'AI 精炼一句话播报',
              hud: { icon: '🤖', title: 'AI 提炼一句话播报', desc: '耳机播报：「张总通知今晚评审改 8 点，问你方案是否就绪」' },
              voice: '张总问您今晚8点评审方案是否OK？您可直接口述回复。',
              vals: [{ k: '信息浓缩比', v: '90%', cls: 'success' }, { k: '提炼耗时', v: '0.6 秒' }, { k: '语义准确度', v: '99.2%' }],
              punchline: '不仅读消息，AI 能根据对话上下文智能推断最合理的回复方案。'
            },
            {
              step: '3 解决', title: '口述转商务格式代发',
              hud: { icon: '🚀', title: '微信消息已自动发送', desc: 'AI 整理为：「收到，方案已在飞书更新，今晚 8 点准时参会。」并秒发群聊' },
              voice: '微信已成功代发张总。已为您开启免打扰，请专心骑行。',
              vals: [{ k: '代发状态', v: '已发送', cls: 'success' }, { k: '格式润色', v: '商务得体' }, { k: '停车次数', v: '0 次', cls: 'accent' }],
              punchline: '小白秒懂：骑在路上不耽误工作，听一句话、动一下嘴全搞定。'
            }
          ]
        }
      ]
    },
    {
      id: 's4',
      num: '04',
      eyebrow: 'ACTIVE SAFETY & PRE-WARNING',
      title: '安全与主动预警',
      tagline: '头盔减速刹车灯 · 后视盲区摄像头 · 摔车监测自动求救 · 疲劳检测 · 安全车距预警',
      features: [
        {
          id: 'brakelight',
          name: '头盔减速刹车灯',
          sub: '六轴 IMU 感知负加速度 · 发动机制动 8ms 超频爆闪',
          bg: 'helmet',
          videoType: 'brake_flash',
          cam: [{ z: 1.05, ox: 0, oy: 0 }, { z: 1.25, ox: 0, oy: -15 }, { z: 1.10, ox: 0, oy: -5 }],
          phases: [
            {
              step: '1 发生', title: '降档发动机制动',
              hud: { icon: '🛑', title: '发动机制动发生', desc: '降档车速骤降，但未捏物理刹车杆，传统车尾灯不亮' },
              voice: '降档减速入弯，物理刹车灯未通电点亮。',
              vals: [{ k: '减速度', v: '-0.42 G', cls: 'accent' }, { k: '物理刹车杆', v: '未触发' }, { k: '后车视线', v: '易追尾盲区' }],
              punchline: '老手降档发动机制动时车速骤降，但传统尾灯不亮，后方 SUV 极易追尾！'
            },
            {
              step: '2 系统反应', title: '头盔高位刹车灯爆闪',
              hud: { icon: '💡', title: '头盔高位超频爆闪', desc: '内置 IMU 检测到负加速度，高位矩阵灯带 8ms 内超频爆闪' },
              voice: '惯性传感器检测到紧急减速，头盔高位警示灯爆闪中。',
              vals: [{ k: '响应时间', v: '8 ms', cls: 'danger' }, { k: '发光高度', v: '人眼 1.5 米' }, { k: '可视距离', v: '500 m' }],
              punchline: '处于后车司机眼睛最敏感的 1.5 米平视高度，穿透雨雾能力极强。'
            },
            {
              step: '3 解决', title: '后车平缓刹车防追尾',
              hud: { icon: '🛡️', title: '追尾风险直降 92%', desc: '后方车辆第一时间收到减速信号并平缓刹车，保持 28m 间距' },
              voice: '后车已同步减速，保持安全间距 28 米。',
              vals: [{ k: '追尾防范率', v: '92%', cls: 'success' }, { k: '安装适配', v: '磁吸免破线' }, { k: '续航能力', v: '30 小时' }],
              punchline: '小白秒懂：哪怕只是松油门降档，头盔也能自动替你亮灯提醒后车，保命护体。'
            }
          ]
        },
        {
          id: 'rearview',
          name: '后视摄像头与盲区感知',
          sub: '170° 星光夜视超微光镜头 · 盲区逼近 HUD 动态红框',
          bg: 'corner',
          videoType: 'rear_reticle',
          cam: [{ z: 1.05, ox: 0, oy: 0 }, { z: 1.25, ox: 18, oy: 10 }, { z: 1.10, ox: 5, oy: 0 }],
          phases: [
            {
              step: '1 发生', title: '盲区车辆快速插上',
              hud: { icon: '👀', title: '传统后视镜死角', desc: '后方一辆轿车正以 85km/h 从右后死角盲区插上，物理后视镜看不到' },
              voice: '警告：右后方盲区发现高速逼近目标，正处于物理死角。',
              vals: [{ k: '目标车速', v: '85 km/h', cls: 'accent' }, { k: '盲区位置', v: '右后 45°' }, { k: '碰撞预计', v: '2.8 秒后' }],
              punchline: '摩托车后视镜常被骑手肩膀遮挡，车尾集成 170° 星光夜视镜头全天候戒备。'
            },
            {
              step: '2 系统反应', title: 'HUD 亮起危险红框',
              hud: { icon: '⚠️', title: '盲区超车高亮锁定', desc: 'HUD 右边缘亮起危险红框，圆屏切出流媒体画面，禁止向右变道' },
              voice: '右侧盲区有车超车！请切勿向右变道！',
              vals: [{ k: '预警延迟', v: '< 20 ms', cls: 'danger' }, { k: '视场角度', v: '170° 超广角' }, { k: '流媒体延迟', v: '32 ms' }],
              punchline: '测算逼近速度（TTC 时间），若骑手打右转向灯，耳机会发出急促蜂鸣警示。'
            },
            {
              step: '3 解决', title: '安然避让安全过弯',
              hud: { icon: '✅', title: '危险目标超车完毕', desc: '目标车辆安全掠过，HUD 警示自动撤销，恢复标准导航视图' },
              voice: '危险目标已越过，盲区恢复安全状态。',
              vals: [{ k: '侧翻风险', v: '完全规避', cls: 'success' }, { k: '夜视感度', v: '0.001 Lux' }, { k: '雨天可视', v: '疏水涂层' }],
              punchline: '小白秒懂：就像脑后长了眼睛，变道过弯再也不用别扭扭头回看后方。'
            }
          ]
        },
        {
          id: 'crash',
          name: '摔车监测与自动求救',
          sub: '倾覆姿态冲击算法 · 60s 倒计时呼救与北斗卫星短报文',
          bg: 'rescue',
          videoType: 'crash_sos',
          cam: [{ z: 1.05, ox: 0, oy: 0 }, { z: 1.25, ox: -15, oy: 15 }, { z: 1.10, ox: 0, oy: 5 }],
          phases: [
            {
              step: '1 发生', title: '弯道滑倒车身倾覆',
              hud: { icon: '🚨', title: '严重碰撞倾覆 78°', desc: '车身倾角达 78.5°，六轴加速度达 6.8G，发动机自动熄火' },
              voice: '检测到摔车姿态与强烈冲击，正在检测生命体征！',
              vals: [{ k: '车身倾角', v: '78.5° (倒地)', cls: 'danger' }, { k: '冲击峰值', v: '6.8 G' }, { k: '引擎状态', v: '防爆燃熄火' }],
              punchline: '最怕摔车后人晕倒在无人荒郊野岭、手机摔飞无法求救。车备有独立电池与传感器。'
            },
            {
              step: '2 系统反应', title: '60秒防误报倒计时',
              hud: { icon: '⏱️', title: '紧急救助倒计时 48s', desc: '耳机大声询问状态，若无车手按键或语音取消，倒计时结束发 SOS' },
              voice: '您还好吗？若无大碍请按手把任意键取消；48 秒后自动呼救！',
              vals: [{ k: '倒计时剩余', v: '48 秒', cls: 'danger' }, { k: '高精定位', v: '北斗三号双频' }, { k: '坐标锁定', v: '30.184°N, 120.218°E' }],
              punchline: '结合车速与心率综合研判，轻微原地倒车只要扶起车子或按键即可随时取消。'
            },
            {
              step: '3 解决', title: '北斗卫星发射求救信',
              hud: { icon: '🚑', title: 'SOS 报警已自动发出', desc: '向 120 中心与紧急联系人发送准确定位，赢得 45 分钟黄金时间' },
              voice: '紧急联系人已收到您的遇险短信与求救电话，救援力量正在赶往。',
              vals: [{ k: '报警时效', v: '即刻发送', cls: 'success' }, { k: '通信通道', v: '4G + 卫星短报文' }, { k: '黄金时间', v: '赢得 45 分钟', cls: 'accent' }],
              punchline: '小白秒懂：深山没手机信号也能发坐标，一个人跑长途，家里人最放心的定心丸。'
            }
          ]
        },
        {
          id: 'fatigue',
          name: '疲劳检测与提醒',
          sub: '连续骑行微操僵硬分析 · 主动规划咖啡驿站',
          bg: 'guard',
          videoType: 'fatigue_rest',
          cam: [{ z: 1.05, ox: 0, oy: 0 }, { z: 1.15, ox: -10, oy: -10 }, { z: 1.08, ox: 0, oy: 0 }],
          phases: [
            {
              step: '1 发生', title: '连续骑行 2.5 小时',
              hud: { icon: '☕', title: '疲劳表征显现', desc: '连续骑行 150km，龙头微修正频率下降 40%，反应灵敏度衰减' },
              voice: '系统监测到您已连续骑行 150 公里，反应灵敏度出现疲劳衰减。',
              vals: [{ k: '连续时长', v: '2 小时 34 分', cls: 'accent' }, { k: '微操反应率', v: '下降 40%' }, { k: '心率均值', v: '118 bpm' }],
              punchline: '长途跑高速容易产生公路催眠，系统精准判断中枢神经疲劳程度。'
            },
            {
              step: '2 系统反应', title: '主动提议就近补给',
              hud: { icon: '💡', title: '推荐就近机车驿站', desc: '前方 3.8 公里有「莫干山观景服务区」，备有机车水吧与充气桩' },
              voice: '前方 3.8 公里有很棒的机车驿站，我们进去喝杯咖啡活动下肩颈吧？',
              vals: [{ k: '推荐驿站', v: '莫干山驿站' }, { k: '距离', v: '3.8 km', cls: 'success' }, { k: '车友评价', v: '4.9 分 ★★★★★' }],
              punchline: '像一位懂你的老车友副驾驶，按一下车把拨轮即可将该休息点顺畅插入导航。'
            },
            {
              step: '3 解决', title: '进站休整精力满血',
              hud: { icon: '🔋', title: '体能状态满血复原', desc: '打卡服务区喝水拉伸 15 分钟，指标恢复绿色优良，安全继续启程' },
              voice: '休整完毕，疲劳指数已清零，为您规划剩余 65 公里山道。',
              vals: [{ k: '疲劳指数', v: '优良 (绿色)', cls: 'success' }, { k: '补给完成', v: '精力充沛' }, { k: '安全系数', v: '顶级', cls: 'accent' }],
              punchline: '小白秒懂：长途不再硬撑死扛，AI 成为贴身健康副驾驶，骑行从容舒适。'
            }
          ]
        },
        {
          id: 'distance',
          name: '安全车距主动预警',
          sub: '前向毫米波雷达测距 · 急刹 FCW 红色防撞方框',
          bg: 'guard',
          videoType: 'distance_fcw',
          cam: [{ z: 1.05, ox: 0, oy: 0 }, { z: 1.25, ox: 0, oy: 15 }, { z: 1.10, ox: 0, oy: 5 }],
          phases: [
            {
              step: '1 发生', title: '前车突发急刹变道',
              hud: { icon: '🚗', title: '前车车距骤减', desc: '前方大货车突然紧急制动，跟车距离从 45m 瞬间缩至 16m' },
              voice: '前向雷达告警：前车突发制动，两车间距快速缩减！',
              vals: [{ k: '两车间距', v: '16.4 m', cls: 'danger' }, { k: '相对减速', v: '-38 km/h' }, { k: '碰撞时间', v: '1.2 秒' }],
              punchline: '新手制动反应往往有 0.8 到 1.2 秒迟滞，车头高精毫米波雷达每秒测距 50 次戒备。'
            },
            {
              step: '2 系统反应', title: 'HUD 红色防撞方框',
              hud: { icon: '⚠️', title: 'FCW 碰撞警告', desc: 'HUD 对准前车贴合动态红色预警方框，车把震动提示音同步急促响起' },
              voice: '急刹！注意减速！',
              vals: [{ k: '告警级别', v: 'Level 3 紧急', cls: 'danger' }, { k: '声光触同步', v: '毫秒级' }, { k: '建议刹车力', v: '75%' }],
              punchline: '红色警告框直接贴合在前车实景车尾上，车把微电机震动指尖，消除走神。'
            },
            {
              step: '3 解决', title: '从容刹停留足余量',
              hud: { icon: '🛡️', title: '安全制动完毕', desc: '比人眼提前 0.8 秒预警，车手从容重刹降速，稳稳停在安全间距外' },
              voice: '车距已恢复安全标准，前向碰撞警报解除。',
              vals: [{ k: '刹停余量', v: '8.2 米', cls: 'success' }, { k: 'ABS 触发', v: '平稳受控' }, { k: '追尾风险', v: '0%', cls: 'accent' }],
              punchline: '小白秒懂：提前 0.8 秒提醒就是生死之别，雷达当第三只眼，杜绝追尾。'
            }
          ]
        }
      ]
    },
    {
      id: 's5',
      num: '05',
      eyebrow: 'RIDING COMMUNITY & DIGITAL AVATAR',
      title: '骑行社区',
      tagline: '大冰 3D 数字人在线问答 · 摩友金牌路书 · 个人数据六维战报 · 3D 虚拟机车改装工坊',
      features: [
        {
          id: 'dabing',
          name: '大冰数字人在线问答',
          sub: '50万+ 真实问答机车知识库 · 真人声线表情在线指导',
          bg: 'riderclub',
          videoType: 'dabing_avatar',
          cam: [{ z: 1.05, ox: 0, oy: 0 }, { z: 1.20, ox: -12, oy: -10 }, { z: 1.10, ox: 0, oy: 0 }],
          phases: [
            {
              step: '1 发生', title: '新手提问跑山调校',
              hud: { icon: '❓', title: '车主社区求助', desc: '「新手第一次跑安吉天荒坪，减震和胎压怎么调？」' },
              voice: '大冰老师，我这周跑天荒坪，减震阻尼和胎压应该怎么调？',
              vals: [{ k: '求助主题', v: '山道调校指南', cls: 'accent' }, { k: '数字人', v: '大冰 3D 拟真' }, { k: '知识库', v: '50万+ 真实问答' }],
              punchline: '新手买车后遇到机械故障保养踩坑，大冰数字人以真人语气表情在线解答。'
            },
            {
              step: '2 系统反应', title: '真人声线专业解答',
              hud: { icon: '🎙️', title: '大冰语音回复', desc: '「天荒坪多发卡弯，前减震建议压紧 2 格，冷胎压放 2.3，注意接缝！」' },
              voice: '哥们，天荒坪下山发卡弯急，前压紧2格，冷胎压放2.3最稳！',
              vals: [{ k: '推理响应', v: '0.8 秒', cls: 'success' }, { k: '声线拟真度', v: '98.5%' }, { k: '建议水准', v: '教官级' }],
              punchline: '根据车型、公里数、骑行习惯给出针对性避坑建议，手上沾油也能语音问答。'
            },
            {
              step: '3 解决', title: '参数一键下发车机',
              hud: { icon: '🤝', title: '保存至车辆备忘录', desc: '问答生成的调校参数自动同步至仪表，车友在线跟帖点赞' },
              voice: '减震调校指引已同步至仪表备忘录，祝跑山愉快！',
              vals: [{ k: '疑虑化解', v: '100%', cls: 'success' }, { k: '少走弯路', v: '省数千改装费' }, { k: '社群归属感', v: '极强', cls: 'accent' }],
              punchline: '小白秒懂：身边随时跟着一位 20 年驾龄老炮教官，随时解答所有不懂的问题。'
            }
          ]
        },
        {
          id: 'routes',
          name: '骑行路线攻略分享',
          sub: '百万车友共创 GPX 路书 · 危险碎石弯道提前 200m 预警',
          bg: 'mountain-ride',
          videoType: 'route_gpx',
          cam: [{ z: 1.05, ox: 0, oy: 0 }, { z: 1.18, ox: 15, oy: -12 }, { z: 1.08, ox: 0, oy: 0 }],
          phases: [
            {
              step: '1 发生', title: '周末不知骑往何处',
              hud: { icon: '🗺️', title: '传统导航不懂骑行', desc: '普通地图只导高速拥堵路，缺乏机车最爱的风景优美盘山路' },
              voice: '附近有哪些风景好、弯道舒服、路面没有大货车的路线？',
              vals: [{ k: '路书库', v: '全国 1.2万条', cls: 'accent' }, { k: '路况更新', v: '1 小时内' }, { k: '筛选维度', v: '弯道分 / 风景分' }],
              punchline: '骑士要的不是最快到达，而是沿途连绵弯道与美景，摩友实时众包维护。'
            },
            {
              step: '2 系统反应', title: '金牌路书一键上车',
              hud: { icon: '📲', title: '「四明山黄金线」下发', desc: '全程 86km，共 42 个弯道，包含 3 处观景打卡台与 2 处驿站' },
              voice: '已规划四明山黄金线，避开施工路段，一键推送到车机。',
              vals: [{ k: '总里程', v: '86.4 km' }, { k: '弯道评级', v: '★★★★☆ 极乐', cls: 'accent' }, { k: '打卡热度', v: 'Top 1' }],
              punchline: '手机点击一键上车，GPX 轨迹同步至 HUD，碎石盲弯提早 200m 主动预警。'
            },
            {
              step: '3 解决', title: '无忧骑行尽享美景',
              hud: { icon: '🌲', title: '完美路书打卡', desc: '跟着老车友踩过点的路线畅快骑行，不用停在叉路口看手机' },
              voice: '已到达观景台打卡点，已为您自动记录本次跑山成就。',
              vals: [{ k: '路线满意度', v: '99.4%', cls: 'success' }, { k: '避开陷阱', v: '100%' }, { k: '同行偶遇', v: '8 组车友' }],
              punchline: '小白秒懂：刚提车的新手也能像老炮一样找到最爽、最安全的风景山路。'
            }
          ]
        },
        {
          id: 'report',
          name: '个人骑行数据总结',
          sub: '六维骑士能力雷达图 · 黑金高逼格年度画册海报',
          bg: 'ai-engine',
          videoType: 'report_radar',
          cam: [{ z: 1.05, ox: 0, oy: 0 }, { z: 1.22, ox: -10, oy: 12 }, { z: 1.10, ox: 0, oy: 0 }],
          phases: [
            {
              step: '1 发生', title: '季度骑行数据结算',
              hud: { icon: '📊', title: '个人数据沉淀', desc: '累计骑行 12,480 公里，跨越 4 省 28 座城市，压过 3,200 个弯道' },
              voice: '本季度骑行报告已生成，正在计算六维能力模型。',
              vals: [{ k: '总里程', v: '12,480 km', cls: 'accent' }, { k: '骑行天数', v: '142 天' }, { k: '最高海拔', v: '3,840 m' }],
              punchline: '时速、倾角、制动平顺度全生命周期云端保存，见证从小白向骑士的蜕变。'
            },
            {
              step: '2 系统反应', title: '六维能力雷达图',
              hud: { icon: '🎖️', title: '骑士段位：大师级', desc: '攻弯 96 / 控速 94 / 反应 98 / 耐力 91，荣获「山道猎鹰」称号' },
              voice: '综合安全与控车评分超越全国 94% 骑士，解锁大师勋章！',
              vals: [{ k: '控车评分', v: '96 分', cls: 'success' }, { k: '全国超越', v: 'Top 6%', cls: 'accent' }, { k: '安全无事故', v: '380 天' }],
              punchline: '权威数据还可对接保险公司享受机车商业险折扣，AI 给出针对性训练建议。'
            },
            {
              step: '3 解决', title: '黑金海报一键导出',
              hud: { icon: '✨', title: '朋友圈海报生成', desc: '黑金轻奢质感个人画册，引爆小红书与微信朋友圈' },
              voice: '高画质成就卡片已保存相册，专属水印已生成。',
              vals: [{ k: '朋友圈点赞', v: '99+', cls: 'success' }, { k: '社区声望', v: 'Lv.7 大师' }, { k: '荣誉留存', v: '终身' }],
              punchline: '小白秒懂：把迎风飞驰的热爱变成最炫酷的个人履历，满足社交分享欲。'
            }
          ]
        },
        {
          id: 'tuning',
          name: '机车 AI 改装娱乐社区',
          sub: '1:1 毫米级 3D 虚拟改装沙盘 · 真实排气声浪在线试听',
          bg: 'riderclub',
          videoType: 'tuning_sandbox',
          cam: [{ z: 1.05, ox: 0, oy: 0 }, { z: 1.25, ox: 15, oy: 15 }, { z: 1.12, ox: 0, oy: 5 }],
          phases: [
            {
              step: '1 发生', title: '个性化改装想法萌生',
              hud: { icon: '🎨', title: '改装试错成本高昂', desc: '想改水泥灰车漆、换天蝎碳纤排气，但怕改完难看且不合规' },
              voice: '想改战斗灰加黄色拉花，换个短尾排气，不知道好不好看？',
              vals: [{ k: '传统痛点', v: '无法预览', cls: 'accent' }, { k: '试错成本', v: '数千上万元' }, { k: '合规风险', v: '未知' }],
              punchline: '很多新手改装踩坑，不仅难看还影响操控。ROADLINK 提供 1:1 3D AI 改装沙盘。'
            },
            {
              step: '2 系统反应', title: '3D 效果与声浪试听',
              hud: { icon: '⚡', title: 'AI 虚拟沙盘即时渲染', desc: '黑金竞技拉花与短尾碳纤维排气装配完毕，耳机试听双缸低沉轰鸣' },
              voice: '黑金拉花与短尾排气已装配，声浪模拟器已就绪。',
              vals: [{ k: '渲染时间', v: '2.4 秒', cls: 'success' }, { k: '材质质感', v: '真碳纤维 / 金属' }, { k: '声浪模拟', v: '双缸轰鸣' }],
              punchline: '不仅看外观，还能佩戴耳机试听声浪音效！AI 自动核验上牌合规性。'
            },
            {
              step: '3 解决', title: '一键采购方案到店',
              hud: { icon: '🛍️', title: '改装方案一键落地', desc: '配件清单打包至官方认证门店，方案在社区引来 400+ 车友抄作业' },
              voice: '方案已下发至离您最近的官方授权工坊，排期即可前往施工。',
              vals: [{ k: '方案落地', v: '所见即所得', cls: 'success' }, { k: '合规认证', v: '100% 合法' }, { k: '社区热度', v: '登顶热榜', cls: 'accent' }],
              punchline: '小白秒懂：零门槛圆梦改装，改前改后心里有底，避免踩坑花冤枉钱。'
            }
          ]
        }
      ]
    }
  ];

  // 全局交互状态
  var state = {
    route: 'home',
    sceneIdx: 0,
    featIdx: 0,
    phaseIdx: 0,
    isPlaying: true,
    progress: 0,
    timer: null,
    sparkData: [55, 62, 70, 78, 85, 92, 88, 76, 82, 90, 96, 94]
  };

  var mainContent = document.getElementById('main-content');
  var sceneNav = document.getElementById('scene-nav');

  function updateNav() {
    if (!sceneNav) return;
    var links = sceneNav.querySelectorAll('a');
    links.forEach(function (link) {
      var r = link.getAttribute('data-route');
      if (r === state.route) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  // ==================== 动态 SPARKLINE CANVAS 遥测引擎 ====================
  function initSparkline(canvas) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var pts = state.sparkData.slice();

    function render() {
      if (!canvas.isConnected) return;
      var w = canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : 300;
      var h = canvas.height = 54;
      ctx.clearRect(0, 0, w, h);

      // 参考线
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.5); ctx.lineTo(w, h * 0.5);
      ctx.stroke();

      var grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(245, 196, 0, 0.28)');
      grad.addColorStop(1, 'rgba(245, 196, 0, 0.0)');

      var step = w / (pts.length - 1);
      ctx.beginPath();
      pts.forEach(function (val, idx) {
        var x = idx * step;
        var y = h - (val / 120) * (h * 0.82) - 4;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#f5c400';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      ctx.fillStyle = grad; ctx.fill();

      // 最新点
      var lastX = w;
      var lastY = h - (pts[pts.length - 1] / 120) * (h * 0.82) - 4;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#f5c400'; ctx.fill();
    }

    render();
    var interval = setInterval(function () {
      if (!canvas.isConnected) { clearInterval(interval); return; }
      var last = pts[pts.length - 1];
      var next = Math.max(35, Math.min(115, last + (Math.random() * 12 - 6)));
      pts.shift(); pts.push(next);
      state.sparkData = pts;
      render();
    }, 450);
    onCleanup(function () { clearInterval(interval); });
  }

  // ==================== 4K 60FPS 视频仪表与雷达图层 (Video Canvas Simulator) ====================
  function initVideoCanvas(canvas, videoType, featId) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var start = performance.now();
    var raf;

    function draw(now) {
      if (!canvas.isConnected) return;
      var t = (now - start) / 1000;
      var w = canvas.width = canvas.parentElement.clientWidth || 640;
      var h = canvas.height = canvas.parentElement.clientHeight || 500;
      ctx.clearRect(0, 0, w, h);

      // 1. 左下角动态仪表盘 (Speedometer & RPM Dial)
      var cx = 86, cy = h - 86;
      ctx.beginPath();
      ctx.arc(cx, cy, 48, Math.PI * 0.75, Math.PI * 2.25);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 6;
      ctx.stroke();

      var speed = 64 + Math.sin(t * 1.8) * 8;
      var speedAng = Math.PI * 0.75 + (speed / 120) * Math.PI * 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 48, Math.PI * 0.75, speedAng);
      ctx.strokeStyle = '#f5c400';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 24px var(--num)';
      ctx.textAlign = 'center';
      ctx.fillText(Math.round(speed), cx, cy + 4);
      ctx.font = '600 10px var(--num)';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('KM/H · 4TH', cx, cy + 18);

      // 2. 右侧倾角罗盘 (Lean Angle Arc)
      var lean = 24 + Math.sin(t * 1.4) * 14;
      var rx = w - 80, ry = h - 86;
      ctx.beginPath();
      ctx.arc(rx, ry, 36, Math.PI * 0.8, Math.PI * 2.2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '800 18px var(--num)';
      ctx.fillText(lean.toFixed(1) + '°', rx, ry + 4);
      ctx.font = '600 10px var(--num)';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('LEAN ANGLE', rx, ry + 18);

      // 3. 特殊动态视频图层 (根据功能定制)
      if (videoType === 'radar_convoy' || videoType === 'route_gpx') {
        // 雷达声波扩散
        var r = (t * 60) % (w * 0.45);
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.5, Math.max(1, r), 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(245, 196, 0, ' + Math.max(0, 0.35 - r / (w * 0.45)) + ')';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 队友动态光标
        var p1 = [w * 0.5 - 90 + Math.sin(t * 1.5) * 6, h * 0.5 - 40 + Math.cos(t * 1.2) * 5];
        var p2 = [w * 0.5 + 110 + Math.cos(t * 1.4) * 6, h * 0.5 + 30 + Math.sin(t * 1.6) * 5];

        function drawDot(p, label, col) {
          ctx.beginPath(); ctx.arc(p[0], p[1], 5, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
          ctx.beginPath(); ctx.arc(p[0], p[1], Math.max(1, 10 + 4 * Math.sin(t * 4)), 0, Math.PI * 2);
          ctx.fillStyle = col === '#f5c400' ? 'rgba(245,196,0,0.2)' : 'rgba(56,189,248,0.2)'; ctx.fill();
          ctx.font = '700 11px var(--sans)'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
          ctx.fillText(label, p[0] + 12, p[1] + 4);
        }
        drawDot([w * 0.5, h * 0.5], '07 陈默(本机)', '#f5c400');
        drawDot(p1, '18 阿岳 (-12m)', '#38bdf8');
        drawDot(p2, '05 老周 (+45m)', '#32d583');
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    onCleanup(function () { cancelAnimationFrame(raf); });
  }

  // ==================== 3-PHASE 视频播放与步进控制器 ====================
  function stopAuto() {
    if (state.timer) {
      clearInterval(state.timer);
      state.timer = null;
    }
    state.isPlaying = false;
    updateVideoPlayBtn();
  }

  function startAuto() {
    stopAuto();
    state.isPlaying = true;
    updateVideoPlayBtn();
    var duration = 4000;
    var step = (60 / duration) * 100;

    state.timer = setInterval(function () {
      state.progress += step;
      if (state.progress >= 100) {
        state.progress = 0;
        var nextPhase = (state.phaseIdx + 1) % 3;
        setPhase(nextPhase, true);
      } else {
        updateProgressBars();
      }
    }, 60);
  }

  function updateVideoPlayBtn() {
    var btn = document.getElementById('video-play-toggle');
    if (btn) btn.textContent = state.isPlaying ? '⏸' : '▶';
  }

  function updateProgressBars() {
    var fill = document.getElementById('video-fill');
    var timeEl = document.getElementById('video-time');
    var pProg = document.querySelector('.kx-prog i');

    var p = Math.min(100, Math.max(0, state.progress));
    if (fill) fill.style.width = p + '%';
    if (pProg) pProg.style.width = p + '%';
    if (timeEl) {
      var sec = Math.floor((state.phaseIdx * 4) + (p / 100 * 4));
      timeEl.textContent = '00:' + (sec < 10 ? '0' + sec : sec) + ' / 00:12';
    }
  }

  function setPhase(idx, fromAuto) {
    state.phaseIdx = idx;
    if (!fromAuto) {
      state.progress = 0;
      updateProgressBars();
    }
    renderPhaseVisuals();

    var sc = SCENES[state.sceneIdx];
    var feat = sc.features[state.featIdx];
    var phase = feat.phases[state.phaseIdx];
    if (phase && phase.voice) speakText(phase.voice);
  }

  // ==================== 页面渲染：HOME 页面 ====================
  function drawHomeAppMap(canvas) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(2,2);
    ctx.fillStyle = '#edeee5';
    ctx.fillRect(0,0,320,210);
    ctx.fillStyle = '#d8e5cc';
    ctx.fill(new Path2D('M0 0H320V48L281 43L239 58L178 43L123 57L72 40L0 66Z M0 138L42 120L105 139L82 186L27 210H0Z'));
    ctx.fillStyle = '#bbd7db';
    ctx.fill(new Path2D('M247 124Q256 102 275 112T303 124L320 133V183Q295 190 278 177T248 149Z'));
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    [
      'M-10 78Q53 60 89 82T171 80Q212 68 247 79T333 65',
      'M-8 124Q61 98 102 119T188 120Q217 110 235 96T328 96',
      'M14 -8Q33 57 37 107T72 218',
      'M110 -5Q95 48 115 105T137 219',
      'M206 -7Q192 37 204 75T192 141Q171 185 176 220',
      'M-10 161Q44 146 95 161T187 166Q212 163 239 179T330 192'
    ].forEach(function (line) {
      var road = new Path2D(line);
      ctx.strokeStyle = '#cdd4c7';
      ctx.lineWidth = 8;
      ctx.stroke(road);
      ctx.strokeStyle = '#fbfaf4';
      ctx.lineWidth = 6;
      ctx.stroke(road);
    });

    ctx.fillStyle = '#647a62';
    ctx.font = '600 16px system-ui';
    ctx.fillText('松林公园',117,24);
    ctx.fillText('青石湖',261,152);
    var route = new Path2D('M51 162Q67 157 90 159Q116 163 135 147L175 115Q190 102 200 81Q217 54 246 50L281 44');
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 14;
    ctx.stroke(route);
    ctx.strokeStyle = '#1f76bb';
    ctx.lineWidth = 9;
    ctx.stroke(route);
    [[51,162,'#227bc8'],[281,44,'#276349']].forEach(function (pin) {
      ctx.beginPath();
      ctx.arc(pin[0],pin[1],9,0,Math.PI*2);
      ctx.fillStyle = pin[2];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
    });
  }

  function renderHome() {
    flushCleanups();
    stopAuto();
    mainContent.innerHTML = `
      <section class="rl-gallery" aria-labelledby="rl-title">
        <div class="cockpit-hero">
          <div class="cockpit-frame">
            <img class="cockpit-photo" src="${asset('motorcycle-road-hero')}" alt="夕阳下，戴头盔的骑手驾驶摩托车沿山路行驶" fetchpriority="high">
            <small class="cockpit-note">骑行场景示意</small>
          </div>
          <div class="cockpit-content">
            <header class="cockpit-heading">
              <p class="cockpit-brand">骑行导航 <span>ROADLINK</span></p>
              <h1 id="rl-title">路线在手机，<br><em>转向在眼前。</em></h1>
              <p class="cockpit-lead">手机 App 规划路线，车把圆屏与头盔贴片同步提示。</p>
            </header>
            <div class="cockpit-actions"><button class="cockpit-start" data-open="ride"><i aria-hidden="true"></i>体验头盔内的导航 <span aria-hidden="true">→</span></button><button class="open-riding-app" data-open="app">打开骑行 App <span aria-hidden="true">↗</span></button></div>
            <div class="cockpit-legend" aria-label="两件加装硬件">
              <button data-open="optics"><span class="part-photo part-optics" aria-hidden="true"></span><span class="part-copy"><strong>头盔 HUD 贴片</strong><small>透明投影 · 风镜内侧</small></span></button>
              <button data-open="bar"><span class="part-photo part-bar" aria-hidden="true"></span><span class="part-copy"><strong>车把防水圆屏</strong><small>夹装车把 · 实体按键</small></span></button>
            </div>
            <nav class="cockpit-shortcuts" aria-label="场景快捷入口"><a href="#/s3">AI 手机操控</a><a href="#/s1">组队骑行</a><a href="#/s5">骑行社区</a></nav>
          </div>
        </div>
        <dialog class="cockpit-dialog" aria-labelledby="device-heading">
          <header><h2 id="device-heading"></h2><button class="device-close" aria-label="关闭设备演示">×</button></header>
          <div class="device-content">
            <div class="device-view device-app" data-panel="app">              <div class="home-hw-phone" aria-label="ROADLINK 手机 App 交互演示">
<div class="home-app-status" aria-hidden="true"><span>9:41</span><i></i><span class="home-app-battery"></span></div>
<div class="home-app-top"><span>ROADLINK</span><strong id="home-app-title">路线规划</strong></div>
<section class="home-app-panel" id="home-app-route" aria-label="路线">
<div class="home-app-map">
<canvas width="640" height="420" role="img" aria-label="从我的位置到松林观景台的示例路线"></canvas>
<span class="home-app-map-tag">示意地图</span><span class="home-app-mate" hidden>阿岳</span>
</div>
<div class="home-app-trip" id="home-app-trip"><strong>松林观景台</strong><span>8.4 公里 · 预计 18 分钟</span></div>
<div class="home-hw-phone-turn" id="home-app-next-turn" hidden><span class="home-app-turn-icon" aria-hidden="true"></span><span><b>300 m</b><small>前方右转</small></span></div>
<button type="button" class="home-app-primary" id="home-app-navigation" aria-pressed="false">开始导航</button>
</section>
<section class="home-app-panel" id="home-app-team" aria-label="车队" hidden>
<div class="home-app-section-head"><strong>松林骑队</strong><small>2 位成员</small></div>
<ul class="home-app-list">
<li><span class="home-app-avatar">陈</span><div><strong>陈默 · 我</strong><small id="home-app-share-state">未共享位置</small></div></li>
<li><span class="home-app-avatar">岳</span><div><strong>阿岳</strong><small>正在共享位置</small></div></li>
</ul>
<button type="button" class="home-app-primary" id="home-app-share" aria-pressed="false">开启位置共享</button>
</section>
<section class="home-app-panel" id="home-app-devices" aria-label="设备" hidden>
<div class="home-app-section-head"><strong>我的设备</strong><small>蓝牙连接示意</small></div>
<ul class="home-app-list">
<li><span class="home-app-device-icon car" aria-hidden="true"></span><div><strong>车把显示屏</strong><small>模拟连接</small></div></li>
<li><span class="home-app-device-icon hud" aria-hidden="true"></span><div><strong>头盔 HUD</strong><small>模拟连接</small></div></li>
</ul>
<button type="button" class="home-app-primary" id="home-app-hud-preview">查看 HUD 画面</button>
</section>
<nav class="home-app-tabs" aria-label="App 页面">
<button type="button" data-app-page="route" aria-pressed="true" aria-controls="home-app-route"><i aria-hidden="true"></i>路线</button>
<button type="button" data-app-page="team" aria-pressed="false" aria-controls="home-app-team"><i aria-hidden="true"></i>车队</button>
<button type="button" data-app-page="devices" aria-pressed="false" aria-controls="home-app-devices"><i aria-hidden="true"></i>设备</button>
</nav>
</div></div>
            <div class="device-view" data-panel="bar" hidden>
              <div class="device-bar-detail" role="img" aria-label="夹在车把上的防水圆屏，下面有三个实体按键"></div>
              <div class="rl-bar-readout"><strong class="rl-bar-value"></strong><small class="rl-bar-tip"></small></div>
            </div>
            <div class="device-view" data-panel="optics" hidden>
              <div class="device-optics-detail" role="img" aria-label="头盔内侧的微型投影器与透明 HUD 贴片"></div>
              <button data-open="ride" class="detail-pin">从贴片看出去 ↗</button>
            </div>
            <div class="device-view" data-panel="ride" hidden>
              <img src="${asset('hardware-visor')}" alt="从头盔里看到的前方山路">
              <div class="rl-projection"><b class="rl-proj-arrow"></b><span><strong class="rl-proj-dist"></strong><small class="rl-proj-tip"></small></span></div>
            </div>
          </div>
          <footer class="device-actions"><button class="rl-primary"></button><button class="rl-secondary"></button></footer>
        </dialog>
      </section>
      <section class="rl-scenes" aria-labelledby="rl-scenes-heading"><h2 id="rl-scenes-heading">骑行场景</h2>
        <div class="rl-links">${SCENES.map(s=>`<a href="#/${s.id}">${s.title}<span aria-hidden="true">↗</span></a>`).join('')}</div>
      </section>`;
    const gallery = mainContent.querySelector('.rl-gallery');
    const get = selector => gallery.querySelector(selector);
    const trip = [{arrow:'↱',dist:'300 m',tip:'前方右转'}, {arrow:'↰',dist:'80 m',tip:'路口左转'}, {arrow:'↑',dist:'500 m',tip:'沿湖路直行'}];
    let view = 'ride', nav = true, power = false, shared = false, page = 'route', step = 0;
    gallery.querySelectorAll('canvas').forEach(drawHomeAppMap);
    const primary = get('.rl-primary'), secondary = get('.rl-secondary');

    const dialog = get('.cockpit-dialog');
    const titles = {app:'骑行 App',bar:'车把防水屏',optics:'风镜内侧的透明贴片',ride:'头盔内视角'};
    function refresh() {
      const turn = trip[step];
      get('#device-heading').textContent = titles[view];
      gallery.querySelectorAll('[data-panel]').forEach(panel=>{panel.hidden = panel.dataset.panel !== view;});
      get('.rl-projection').hidden = !power;
      get('.rl-proj-arrow').textContent = nav ? turn.arrow : '◇';
      get('.rl-proj-dist').textContent = nav ? turn.dist : 'HUD 已启动';
      get('.rl-proj-tip').textContent = nav ? turn.tip : '等待手机开始导航';
      get('.rl-bar-value').textContent = nav ? turn.arrow+' '+turn.dist : '待导航';
      get('.rl-bar-tip').textContent = nav ? turn.tip : '等待手机路线';
      get('#home-app-trip').hidden = nav;
      get('#home-app-next-turn').hidden = !nav;
      get('#home-app-next-turn b').textContent = turn.dist;
      get('#home-app-next-turn small').textContent = turn.tip;
      get('.home-app-turn-icon').textContent = turn.arrow;
      get('#home-app-navigation').textContent = nav ? '结束导航' : '开始导航';
      get('#home-app-navigation').setAttribute('aria-pressed',nav);
      get('#home-app-title').textContent = {route:nav?'导航中':'路线规划',team:'车队',devices:'设备'}[page];
      get('.home-app-mate').hidden = !shared;
      get('#home-app-share-state').textContent = shared?'正在共享位置':'未共享位置';
      get('#home-app-share').textContent = shared?'停止位置共享':'开启位置共享';
      get('#home-app-share').setAttribute('aria-pressed',shared);
      gallery.querySelectorAll('[data-app-page]').forEach(b=>{
        const active = b.dataset.appPage === page;
        b.setAttribute('aria-pressed',active);
        get('#'+b.getAttribute('aria-controls')).hidden = !active;
      });
      const actions = {
        optics:[['看头盔内视角','ride']],
        app:[['查看车把屏','bar']],
        bar:nav?[['看头盔内视角','ride'],['模拟下一路口','next']]:[['去 App 开始导航','app']],
        ride:[[power?'关闭 HUD':'启动 HUD','power'],nav&&power?['模拟下一路口','next']:['打开骑行 App','app']]
      }[view];
      [primary,secondary].forEach((b,i)=>{
        b.hidden = !actions[i];
        if (actions[i]) {b.textContent=actions[i][0];b.dataset.action=actions[i][1];}
      });
    }
    gallery.addEventListener('click', e=>{
      const b = e.target.closest('button');
      if (!b) return;
      if (b.classList.contains('device-close')) {dialog.close();return;}
      const action = b.dataset.action || b.dataset.open;
      if (b.dataset.appPage) page = b.dataset.appPage;
      else if (b.id === 'home-app-navigation') {nav = !nav;step = 0;}
      else if (b.id === 'home-app-share') shared = !shared;
      else if (action === 'next') {step = (step+1)%trip.length;speakText(trip[step].dist+'，'+trip[step].tip);}
      else if (action === 'power') power = !power;
      else if (action === 'ride' || b.id === 'home-app-hud-preview') {view='ride';power=true;}
      else if (action) view=action;
      refresh();
      if (!dialog.open && b.dataset.open) dialog.showModal();
      else if (b.closest('[hidden]') || b.hidden) get('.device-close').focus({preventScroll:true});
    });
    refresh();
  }

  // ==================== 页面渲染：Knight 左右分屏模拟器模块页 ====================
  function renderModulePage() {
    flushCleanups();
    var sc = SCENES[state.sceneIdx];
    var feat = sc.features[state.featIdx];

    mainContent.innerHTML = [
      '<div class="shell module-page">',
      '  <div class="module-mast">',
      '    <div>',
      '      <div class="eyebrow"><span class="n">' + sc.num + '</span> ' + sc.eyebrow + '</div>',
      '      <h1>' + sc.title + '</h1>',
      '    </div>',
      '    <div class="module-mast-sub">' + sc.tagline + '</div>',
      '  </div>',
      '  <!-- 横向 Feature Tabs -->',
      '  <div class="feature-tabs" role="tablist">',
      sc.features.map(function (f, idx) {
        return [
          '    <button class="feature-tab" role="tab" aria-pressed="' + String(idx === state.featIdx) + '" data-idx="' + idx + '">',
          '      ' + f.name,
          '    </button>'
        ].join('');
      }).join(''),
      '  </div>',
      '  <!-- 左右分屏模拟器 Frame -->',
      '  <div class="p1-frame">',
      '    <!-- 左侧实景视频与动态视效主舞台 -->',
      '    <div class="p1-visual" id="p1-visual">',
      '      <!-- 3-Phase Stepper 步骤 -->',
      '      <div class="kx-steps">',
      feat.phases.map(function (p, pIdx) {
        return [
          '        <button class="kx-step ' + (pIdx === state.phaseIdx ? 'active' : (pIdx < state.phaseIdx ? 'done' : '')) + '" data-pidx="' + pIdx + '">',
          '          <i>' + (pIdx + 1) + '</i><span>' + p.step + '</span>',
          '        </button>'
        ].join('');
      }).join(''),
      '      </div>',
      '      <!-- 4K 60FPS Live Cam 徽标 -->',
      '      <div class="rec-badge"><i class="rec-dot"></i><span>4K 60FPS LIVE CAM · ' + feat.name + '</span></div>',
      '      <!-- 背景高清实景与动态运镜平移缩放 -->',
      '      <img class="kx-photo" id="kx-photo" src="' + asset(feat.bg) + '" alt="' + feat.name + '">',
      '      <div class="kx-scrim"></div>',
      '      <!-- 动态仪表盘与雷达 Canvas 图层 -->',
      '      <canvas id="kx-visual-canvas" style="position:absolute;inset:0;width:100%;height:100%;z-index:4;pointer-events:none;"></canvas>',
      '      <!-- 浮动深色玻璃 HUD 卡片 -->',
      '      <div class="kx-hud-card" id="kx-hud-card" style="top: 64px; left: 24px;"></div>',
      '      <!-- 动态智能识别 Reticle 方框 -->',
      '      <div class="kx-ret" id="kx-ret" style="top: 32%; left: 45%; width: 150px; height: 150px;" hidden>',
      '        <span class="kx-ret-tag" id="kx-ret-tag">TARGET</span>',
      '      </div>',
      '      <!-- 快门拍照闪光层 -->',
      '      <div class="shutter-flash" id="shutter-flash"></div>',
      '      <!-- 紧急制动红光光晕 -->',
      '      <div class="danger-vignette" id="danger-vignette"></div>',
      '      <!-- 悬浮抓拍大片弹窗 (自动抓拍特性) -->',
      '      <div class="capture-card-overlay" id="capture-card-overlay" hidden>',
      '        <img src="assets/roadlink-ride-capture-small.webp" alt="并骑抓拍大片">',
      '        <div class="cap-tag"><span>📸 自动抓拍完成</span><span>4K HDR</span></div>',
      '      </div>',
      '      <!-- 底部语音播报胶囊 -->',
      '      <div class="kx-voice" id="kx-voice">',
      '        <span class="kx-voice-role" id="kx-voice-role">AI 助理</span>',
      '        <div class="kx-bars" id="kx-bars"><i></i><i></i><i></i><i></i></div>',
      '        <span class="kx-voice-text" id="kx-voice-text">系统就绪</span>',
      '      </div>',
      '      <!-- 底部视频播放器控制条 -->',
      '      <div class="video-ctrl-bar">',
      '        <button class="video-btn" id="video-play-toggle" title="播放/暂停模拟视频">⏸</button>',
      '        <span class="video-time" id="video-time">00:00 / 00:12</span>',
      '        <div class="video-track" id="video-track"><i class="video-fill" id="video-fill"></i></div>',
      '        <span class="video-badge">1080P 60FPS</span>',
      '      </div>',
      '      <div class="kx-prog"><i></i></div>',
      '    </div>',
      '    <!-- 右侧遥测控制台 (极简大字号 · 去除繁琐文字) -->',
      '    <div class="p1-console" id="p1-console">',
      '      <div class="console-top">',
      '        <h2 id="cs-title">' + feat.name + '</h2>',
      '        <div class="console-source" id="cs-sub">' + feat.sub + '</div>',
      '      </div>',
      '      <!-- 大字号核心遥测数值 -->',
      '      <div class="console-values" id="cs-vals"></div>',
      '      <!-- 小白一秒看懂核心收益 (仅一句话) -->',
      '      <div class="like-box" id="cs-punchline" style="margin: 12px 0;"></div>',
      '      <!-- 阶段快速切换按钮 -->',
      '      <div class="console-pills">',
      feat.phases.map(function (p, pIdx) {
        return [
          '        <button class="sub-pill ' + (pIdx === state.phaseIdx ? 'on' : '') + '" data-pidx="' + pIdx + '">',
          '          ' + p.title,
          '        </button>'
        ].join('');
      }).join(''),
      '      </div>',
      '      <!-- 底部实时波形遥测 Sparkline -->',
      '      <div class="console-chart-wrap">',
      '        <div class="console-chart-label">',
      '          <span>LIVESTREAM TELEMETRY · 实时遥测数据流</span>',
      '          <span style="color:var(--accent);">100Hz MESH</span>',
      '        </div>',
      '        <canvas class="p1-chart" id="p1-chart"></canvas>',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <!-- 底部上一章 / 下一章 -->',
      '  <div class="module-foot">',
      '    <div>ROADLINK 次世代智能机车系统 · 方案与投资路演专业版</div>',
      '    <div>',
      state.sceneIdx < 4
        ? '      <a href="#/s' + (state.sceneIdx + 2) + '">下一章节：' + SCENES[state.sceneIdx + 1].title + ' →</a>'
        : '      <a href="#/home">↺ 返回方案概览</a>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');

    // 绑定 Feature Tabs 切换
    var tabs = mainContent.querySelectorAll('.feature-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var idx = Number(tab.getAttribute('data-idx'));
        if (idx !== state.featIdx) {
          state.featIdx = idx;
          state.phaseIdx = 0;
          renderModulePage();
        }
      });
    });

    // 绑定 Phase 步进按钮
    var steps = mainContent.querySelectorAll('.kx-step, .sub-pill');
    steps.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var pIdx = Number(btn.getAttribute('data-pidx'));
        setPhase(pIdx, false);
      });
    });

    // 绑定视频播放暂停控制
    var playBtn = document.getElementById('video-play-toggle');
    if (playBtn) {
      playBtn.addEventListener('click', function () {
        if (state.isPlaying) stopAuto();
        else startAuto();
      });
    }

    var track = document.getElementById('video-track');
    if (track) {
      track.addEventListener('click', function (e) {
        var rect = track.getBoundingClientRect();
        var pct = (e.clientX - rect.left) / rect.width;
        state.progress = pct * 100;
        updateProgressBars();
      });
    }

    // 初始化动态 Canvas
    var visCanvas = document.getElementById('kx-visual-canvas');
    initVideoCanvas(visCanvas, feat.videoType, feat.id);

    var sparkCanvas = document.getElementById('p1-chart');
    initSparkline(sparkCanvas);

    // 渲染动态元素
    renderPhaseVisuals();

    // 启动自动播放
    startAuto();

    var curPhase = feat.phases[state.phaseIdx];
    if (curPhase && curPhase.voice) speakText(curPhase.voice);
  }

  // ==================== 动态更新 Phase 元素 ====================
  function renderPhaseVisuals() {
    var sc = SCENES[state.sceneIdx];
    var feat = sc.features[state.featIdx];
    var phase = feat.phases[state.phaseIdx];
    if (!phase) return;

    // 1. Stepper 状态
    var steps = document.querySelectorAll('.kx-step');
    steps.forEach(function (st, idx) {
      st.className = 'kx-step ' + (idx === state.phaseIdx ? 'active' : (idx < state.phaseIdx ? 'done' : ''));
    });

    var subPills = document.querySelectorAll('.sub-pill');
    subPills.forEach(function (sp, idx) {
      if (idx === state.phaseIdx) sp.classList.add('on');
      else sp.classList.remove('on');
    });

    // 2. 镜头平移缩放 (Camera Pan/Zoom)
    var photo = document.getElementById('kx-photo');
    if (photo && feat.cam && feat.cam[state.phaseIdx]) {
      var c = feat.cam[state.phaseIdx];
      photo.style.setProperty('--z', c.z);
      photo.style.setProperty('--ox', c.ox + 'px');
      photo.style.setProperty('--oy', c.oy + 'px');
    }

    // 3. HUD 卡片
    var hudCard = document.getElementById('kx-hud-card');
    if (hudCard && phase.hud) {
      hudCard.innerHTML = [
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">',
        '  <span style="font-size:16px;">' + (phase.hud.icon || '📍') + '</span>',
        '  <strong style="font-size:14px;color:var(--paper);">' + phase.hud.title + '</strong>',
        '</div>',
        '<div style="font-size:12px;color:var(--soft);line-height:1.45;">' + phase.hud.desc + '</div>'
      ].join('');
    }

    // 4. 动态目标视框 Reticle
    var ret = document.getElementById('kx-ret');
    var retTag = document.getElementById('kx-ret-tag');
    if (ret) {
      if (feat.id === 'capture' || feat.id === 'rearview' || feat.id === 'distance') {
        ret.hidden = false;
        ret.className = 'kx-ret ' + (state.phaseIdx === 1 ? 'danger' : (state.phaseIdx === 2 ? 'success' : ''));
        if (state.phaseIdx === 0) {
          ret.style.top = '34%'; ret.style.left = '48%'; ret.style.width = '130px'; ret.style.height = '130px';
          if (retTag) retTag.textContent = 'DETECT 25m';
        } else if (state.phaseIdx === 1) {
          ret.style.top = '28%'; ret.style.left = '42%'; ret.style.width = '170px'; ret.style.height = '170px';
          if (retTag) retTag.textContent = 'LOCKED · 动态追踪';
        } else {
          ret.style.top = '30%'; ret.style.left = '44%'; ret.style.width = '150px'; ret.style.height = '150px';
          if (retTag) retTag.textContent = 'AUTO CAPTURED';
        }
      } else {
        ret.hidden = true;
      }
    }

    // 5. 快门闪光与抓拍弹窗
    var shutter = document.getElementById('shutter-flash');
    var capCard = document.getElementById('capture-card-overlay');
    if (feat.id === 'capture') {
      if (state.phaseIdx === 1) {
        if (shutter) {
          shutter.classList.remove('trigger');
          void shutter.offsetWidth;
          shutter.classList.add('trigger');
        }
      }
      if (capCard) capCard.hidden = (state.phaseIdx !== 2);
    } else {
      if (capCard) capCard.hidden = true;
    }

    // 6. 紧急制动红光光晕
    var dangerVig = document.getElementById('danger-vignette');
    if (dangerVig) {
      var isDanger = (feat.id === 'brakelight' && state.phaseIdx === 1) || (feat.id === 'distance' && state.phaseIdx === 1) || (feat.id === 'crash' && state.phaseIdx === 0);
      dangerVig.classList.toggle('on', isDanger);
    }

    // 7. 语音播报条
    var voiceText = document.getElementById('kx-voice-text');
    if (voiceText && phase.voice) voiceText.textContent = phase.voice;

    // 8. 控制台大字号数值
    var csVals = document.getElementById('cs-vals');
    if (csVals && phase.vals) {
      csVals.innerHTML = phase.vals.map(function (v) {
        return [
          '<div class="val-item">',
          '  <small>' + v.k + '</small>',
          '  <strong class="' + (v.cls || '') + '">' + v.v + '</strong>',
          '</div>'
        ].join('');
      }).join('');
    }

    // 9. 小白一秒看懂收益 (仅一句话)
    var punchline = document.getElementById('cs-punchline');
    if (punchline && phase.punchline) {
      punchline.innerHTML = '<b>💡 小白一秒看懂</b>' + phase.punchline;
    }
  }

  // ==================== 全局路由中心 ====================
  function onRoute() {
    var hash = location.hash || '#/home';
    var m = hash.match(/^#\/(home|s1|s2|s3|s4|s5)$/);
    if (!m) {
      history.replaceState(null, '', '#/home');
      state.route = 'home';
    } else {
      state.route = m[1];
    }

    updateNav();

    if (state.route === 'home') {
      renderHome();
    } else {
      var sIdx = parseInt(state.route.substring(1), 10) - 1;
      state.sceneIdx = Math.max(0, Math.min(4, sIdx));
      state.featIdx = 0;
      state.phaseIdx = 0;
      state.progress = 0;
      renderModulePage();
    }

    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', onRoute);

  // 头部重播
  if (replayBtn) {
    replayBtn.addEventListener('click', function () {
      if (state.route === 'home') {
        renderHome();
      } else {
        setPhase(0, false);
        startAuto();
      }
    });
  }

  // 键盘快捷键
  document.addEventListener('keydown', function (e) {
    if (e.target.matches('input, textarea, select') || e.target.closest('.rl-gallery button')) return;
    if (e.code === 'Space') {
      e.preventDefault();
      if (state.route !== 'home') {
        var nextP = (state.phaseIdx + 1) % 3;
        setPhase(nextP, false);
      }
    } else if (e.code === 'ArrowRight') {
      if (state.route === 'home') location.hash = '#/s1';
      else if (state.sceneIdx < 4) location.hash = '#/s' + (state.sceneIdx + 2);
    } else if (e.code === 'ArrowLeft') {
      if (state.sceneIdx > 0) location.hash = '#/s' + state.sceneIdx;
      else if (state.route !== 'home') location.hash = '#/home';
    }
  });

  // 首次运行
  onRoute();
})();
