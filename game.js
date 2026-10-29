/* 末日卡牌堆 · 余烬 2.0 — 单文件游戏逻辑 */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);

  // ---------- icons ----------
  const ICON = {
    food: 'resource_apple', wood: 'resource_wood', metal: 'resource_iron',
    medicine: 'flask_full', parts: 'puzzle', def: 'shield',
    research: 'book_open', ap: 'hourglass', survivor: 'character', attack: 'skull'
  };

  const SURVIVOR_TYPES = ['survivor', 'scavenger', 'engineer', 'medic', 'hunter', 'cook', 'guard'];

  // ---------- cards ----------
  const CARD = {
    survivor: {
      name: '幸存者', icon: 'character', type: 'survivor', cost: { food: 1 }, def: 0, prod: {},
      desc: '每天吃 1 食物。普通，但营地不能没有的人。', tags: ['人']
    },
    scavenger: {
      name: '拾荒者', icon: 'pouch', type: 'survivor', cost: { food: 1 }, def: 0, prod: { food: 1 },
      desc: '每天 +1 食物；探索时多带回 1 份资源。', tags: ['人', '采集']
    },
    engineer: {
      name: '工程师', icon: 'resource_planks', type: 'survivor', cost: { food: 1 }, def: 1, prod: { metal: 1 },
      desc: '每天 +1 金属，防御 +1；挨着工作台再 +1 金属。', tags: ['人', '工程']
    },
    medic: {
      name: '医生', icon: 'flask_full', type: 'survivor', cost: { food: 1 }, def: 0, prod: { medicine: 1 },
      desc: '每天 +1 药品；挨着庇护所再 +1 药品。', tags: ['人', '医疗']
    },
    hunter: {
      name: '猎人', icon: 'bow', type: 'survivor', cost: { food: 1 }, def: 1, prod: { food: 1 },
      desc: '每天 +1 食物，防御 +1；探索时降低风险。', tags: ['人', '狩猎']
    },
    cook: {
      name: '厨师', icon: 'resource_wheat', type: 'survivor', cost: { food: 1 }, def: 0, prod: { food: 1 },
      desc: '每天 +1 食物；挨着篝火再 +1 食物。', tags: ['人', '烹饪']
    },
    guard: {
      name: '守卫', icon: 'shield', type: 'survivor', cost: { food: 1 }, def: 2, prod: {},
      desc: '防御 +2；挨着木墙再 +1 防御。', tags: ['人', '防御']
    },

    campfire: {
      name: '篝火', icon: 'campfire', type: 'structure', cost: { wood: 2 }, def: 1, prod: {},
      desc: '防御 +1；厨师相邻 +1 食物。营地的心脏。', tags: ['建筑', '火']
    },
    wall: {
      name: '木墙', icon: 'structure_wall', type: 'structure', cost: { wood: 2 }, def: 2, prod: {},
      desc: '防御 +2；两张木墙合成庇护所；可升级成加固墙。', tags: ['建筑']
    },
    tower: {
      name: '哨塔', icon: 'structure_tower', type: 'structure', cost: { wood: 3, metal: 1 }, def: 3, prod: {},
      desc: '防御 +3；挨着木墙 +1；可升级。', tags: ['建筑']
    },
    shelter: {
      name: '庇护所', icon: 'structure_house', type: 'structure', cost: { wood: 3 }, def: 2, prod: {},
      desc: '防御 +2；医生相邻 +1 药品；两张木墙合成。', tags: ['建筑']
    },
    farm: {
      name: '农场', icon: 'structure_farm', type: 'structure', cost: { wood: 2 }, def: 0, prod: { food: 2 },
      desc: '每天 +2 食物；挨着集水器 +1；可升级。', tags: ['建筑', '生产']
    },
    raincatcher: {
      name: '集水器', icon: 'flask_full', type: 'structure', cost: { metal: 2 }, def: 0, prod: { food: 1 },
      desc: '每天 +1 食物；挨着农场 +1；可升级。', tags: ['建筑', '生产']
    },
    workbench: {
      name: '工作台', icon: 'resource_planks', type: 'structure', cost: { metal: 2 }, def: 0, prod: { metal: 1, research: 1 },
      desc: '每天 +1 金属 +1 研究；升级需要研究点。', tags: ['建筑', '生产']
    },
    bow: {
      name: '猎弓', icon: 'bow', type: 'item', cost: { wood: 1, metal: 1 }, def: 1, prod: {},
      desc: '防御 +1；与幸存者合成猎人。', tags: ['道具']
    },
    trap: {
      name: '陷阱', icon: 'spinner', type: 'item', cost: { wood: 1, metal: 1 }, def: 2, prod: {},
      desc: '防御 +2。便宜，但占地方。', tags: ['道具']
    },
    radio: {
      name: '电台', icon: 'structure_watchtower', type: 'structure', cost: { wood: 2, metal: 2 }, def: 0, prod: {},
      desc: '需要 3 个零件；第 15 天呼叫救援。', tags: ['建筑', '救援']
    },

    fortress: {
      name: '堡垒', icon: 'structure_gate', type: 'structure', cost: {}, def: 5, prod: {},
      desc: '木墙 + 哨塔合成；防御 +5。', tags: ['建筑', '合成']
    },
    greenhouse: {
      name: '温室', icon: 'structure_farm', type: 'structure', cost: {}, def: 0, prod: { food: 3 },
      desc: '农场 + 集水器合成；每天 +3 食物。', tags: ['建筑', '合成']
    },
    spikewall: {
      name: '尖刺墙', icon: 'structure_wall', type: 'structure', cost: {}, def: 4, prod: {},
      desc: '木墙 + 陷阱合成；防御 +4。', tags: ['建筑', '合成']
    },
    homestead: {
      name: '家园', icon: 'structure_house', type: 'structure', cost: {}, def: 3, prod: { food: 1 },
      desc: '庇护所 + 农场合成；防御 +3，每天 +1 食物。', tags: ['建筑', '合成']
    },
    watchtower: {
      name: '瞭望塔', icon: 'structure_tower', type: 'structure', cost: {}, def: 5, prod: {},
      desc: '哨塔 + 陷阱合成；防御 +5。', tags: ['建筑', '合成']
    }
  };

  // 升级表：index 0 = Lv.1
  CARD.campfire.levels = [
    { def: 1, prod: {} },
    { def: 2, prod: {}, cost: { wood: 2, metal: 1 }, research: 1 },
    { def: 3, prod: { food: 1 }, cost: { wood: 3, metal: 2 }, research: 2 }
  ];
  CARD.wall.levels = [
    { def: 2, prod: {} },
    { def: 4, prod: {}, cost: { wood: 2, metal: 1 }, research: 1 },
    { def: 6, prod: {}, cost: { wood: 3, metal: 2 }, research: 2 }
  ];
  CARD.tower.levels = [
    { def: 3, prod: {} },
    { def: 5, prod: {}, cost: { wood: 3, metal: 2 }, research: 1 },
    { def: 7, prod: {}, cost: { wood: 4, metal: 2 }, research: 2 }
  ];
  CARD.shelter.levels = [
    { def: 2, prod: {} },
    { def: 4, prod: {}, cost: { wood: 3, metal: 1 }, research: 1 },
    { def: 6, prod: {}, cost: { wood: 4, metal: 2 }, research: 2 }
  ];
  CARD.farm.levels = [
    { def: 0, prod: { food: 2 } },
    { def: 0, prod: { food: 3 }, cost: { wood: 2, metal: 1 }, research: 1 },
    { def: 0, prod: { food: 4 }, cost: { wood: 3, metal: 1 }, research: 2 }
  ];
  CARD.raincatcher.levels = [
    { def: 0, prod: { food: 1 } },
    { def: 0, prod: { food: 2 }, cost: { metal: 2, wood: 1 }, research: 1 },
    { def: 0, prod: { food: 3 }, cost: { metal: 3 }, research: 2 }
  ];
  CARD.workbench.levels = [
    { def: 0, prod: { metal: 1, research: 1 } },
    { def: 0, prod: { metal: 2, research: 1 }, cost: { metal: 2 }, research: 1 },
    { def: 0, prod: { metal: 2, research: 2 }, cost: { metal: 3 }, research: 2 }
  ];

  const RECIPES = [
    { a: 'wall', b: 'wall', out: 'shelter' },
    { a: 'wall', b: 'tower', out: 'fortress' },
    { a: 'survivor', b: 'bow', out: 'hunter' },
    { a: 'farm', b: 'raincatcher', out: 'greenhouse' },
    { a: 'wall', b: 'trap', out: 'spikewall' },
    { a: 'shelter', b: 'farm', out: 'homestead' },
    { a: 'tower', b: 'trap', out: 'watchtower' }
  ];

  const ADJ = [
    { a: 'campfire', b: 'cook', stat: 'food', v: 1, label: '篝火 + 厨师' },
    { a: 'tower', b: 'wall', stat: 'def', v: 1, label: '哨塔 + 木墙' },
    { a: 'farm', b: 'raincatcher', stat: 'food', v: 1, label: '农场 + 集水器' },
    { a: 'workbench', b: 'engineer', stat: 'metal', v: 1, label: '工作台 + 工程师' },
    { a: 'shelter', b: 'medic', stat: 'medicine', v: 1, label: '庇护所 + 医生' },
    { a: 'guard', b: 'wall', stat: 'def', v: 1, label: '守卫 + 木墙' },
    { a: 'hunter', b: 'tower', stat: 'def', v: 1, label: '猎人 + 哨塔' }
  ];

  const WEATHERS = [
    { id: 'clear', name: '晴', icon: '☀️', fuel: 2, risk: 0, morale: 1, desc: '今夜耗柴 2' },
    { id: 'cold', name: '寒潮', icon: '❄️', fuel: 4, risk: 0, morale: -2, desc: '耗柴 4；缺柴会冻伤' },
    { id: 'storm', name: '暴雪', icon: '🌨️', fuel: 5, risk: 0.1, morale: -3, desc: '耗柴 5；探索更危险' },
    { id: 'fog', name: '浓雾', icon: '🌫️', fuel: 2, risk: 0.15, morale: 0, desc: '探索风险 +15%' },
    { id: 'warm', name: '回暖', icon: '🌤️', fuel: 1, risk: 0, morale: 4, desc: '耗柴 1；士气 +4' }
  ];

  const CRAFTS = [
    { type: 'wall', cost: { wood: 2 } },
    { type: 'farm', cost: { wood: 2 } },
    { type: 'raincatcher', cost: { metal: 2 } },
    { type: 'tower', cost: { wood: 3, metal: 1 } },
    { type: 'shelter', cost: { wood: 3 } },
    { type: 'workbench', cost: { metal: 2 } },
    { type: 'bow', cost: { wood: 1, metal: 1 } },
    { type: 'trap', cost: { wood: 1, metal: 1 } },
    { type: 'radio', cost: { wood: 2, metal: 2 }, requiresParts: 3 }
  ];

  const OPS = [
    { id: 'fortify', name: '加固防线', icon: 'shield', cost: { wood: 2 }, desc: '今夜防御 +2', ap: 1 },
    { id: 'soup', name: '热汤', icon: 'campfire', cost: { food: 2 }, desc: '士气 +12', ap: 1 },
    { id: 'heal', name: '治疗', icon: 'flask_full', cost: { medicine: 1 }, desc: '治愈一名伤员', ap: 1 },
    { id: 'study', name: '研究', icon: 'book_open', cost: { metal: 1 }, desc: '研究 +2', ap: 1 },
    { id: 'airdrop', name: '空投补给', icon: 'pouch', cost: {}, desc: '食物+2 木+2 金属+1（每局一次）', ap: 0 }
  ];

  const LOCATIONS = {
    radio: {
      name: '废弃电台', icon: 'structure_watchtower', tone: 'purple',
      desc: '铁塔还立着，控制室里有零件。',
      rewards: { parts: 1, metal: 1 }, cards: ['engineer', 'tower', 'radio'],
      risk: 0.25, riskText: '塔上掉下碎石', penalty: { metal: -1 }
    },
    supermarket: {
      name: '超市废墟', icon: 'resource_apple', tone: 'green',
      desc: '货架倒了，但罐头还在。',
      rewards: { food: 3 }, cards: ['cook', 'scavenger', 'survivor'],
      risk: 0.18, riskText: '踩到碎玻璃', penalty: { food: -1 }
    },
    hardware: {
      name: '五金店', icon: 'resource_wood', tone: 'blue',
      desc: '木头、钉子、还能用的工具。',
      rewards: { wood: 3, metal: 1 }, cards: ['wall', 'tower', 'workbench'],
      risk: 0.18, riskText: '屋顶塌了一角', penalty: { wood: -1 }
    },
    hospital: {
      name: '医院', icon: 'flask_full', tone: 'green',
      desc: '药柜被翻过，但还有几盒。',
      rewards: { medicine: 1, food: 1 }, cards: ['medic', 'survivor'],
      risk: 0.14, riskText: '走廊里有动静', penalty: { food: -1 }
    },
    gas: {
      name: '加油站', icon: 'resource_iron', tone: 'gold',
      desc: '油泵空了，金属零件还在。',
      rewards: { metal: 2, wood: 1 }, cards: ['trap', 'bow', 'engineer'],
      risk: 0.18, riskText: '油味太浓，呛到了', penalty: { food: -1 }
    },
    shelter: {
      name: '避难所', icon: 'structure_house', tone: 'blue',
      desc: '门没锁，里面也许有人。',
      rewards: { food: -1 }, cards: ['survivor', 'guard', 'shelter'],
      risk: 0.12, riskText: '里面的人不欢迎你', penalty: { medicine: -1 }
    }
  };

  const EVENTS = [
    {
      id: 'stranger', title: '门外有人', kicker: 'DAY EVENT',
      text: '一个裹着毯子的人站在门口，说他只要一口热的。',
      choices: [
        { label: '收留他', desc: '食物 -2；获得 1 张幸存者', effects: { food: -2, addCard: 'survivor' }, log: '你收留了一个陌生人。他成了营地的新人手。' },
        { label: '关门', desc: '木头 +2；士气 -2', effects: { wood: 2, morale: -2 }, log: '你关上了门。门外安静了很久。' }
      ]
    },
    {
      id: 'raiders', title: '掠夺者', kicker: 'DAY EVENT',
      text: '三个人影在营地外停下，手里有棍子和刀。他们想要“过路费”。',
      choices: [
        { label: '交粮', desc: '食物 -3；避免冲突', effects: { food: -3, morale: -2 }, log: '你交出了三份口粮。他们没有进来。' },
        { label: '拿起武器', desc: '木头 -2；一人受伤', effects: { wood: -2, wound: true }, log: '你们守在火堆旁。对方走了，但有人挂了彩。' }
      ]
    },
    {
      id: 'sick', title: '高烧', kicker: 'DAY EVENT',
      text: '有人开始咳血。药只够一个人，或者，把他隔离开。',
      choices: [
        { label: '用药', desc: '药品 -1；士气 +4', effects: { medicine: -1, morale: 4 }, log: '药打进去了。他退了烧。' },
        { label: '隔离', desc: '失去 1 名幸存者；士气 -8', effects: { removeSurvivor: true, morale: -8 }, log: '你把他移到了冷库。没人说话。' }
      ]
    },
    {
      id: 'signal', title: '电台信号', kicker: 'DAY EVENT',
      text: '收音机里传来一段断续的呼号。修好它，也许能换来一个零件。',
      choices: [
        { label: '修天线', desc: '金属 -2；零件 +1', effects: { metal: -2, parts: 1 }, log: '你修好了天线。呼号清晰了一点。' },
        { label: '关掉收音机', desc: '食物 +2；士气 +2', effects: { food: 2, morale: 2 }, log: '你关掉了收音机。营地安静得只剩风声。' }
      ]
    },
    {
      id: 'trader', title: '路过的商人', kicker: 'DAY EVENT',
      text: '一个推着车的商人愿意换东西。他的秤不太准，但你没得选。',
      choices: [
        { label: '用食物换金属', desc: '食物 -3；金属 +3', effects: { food: -3, metal: 3 }, log: '你换到了三块金属。商人走得很急。' },
        { label: '用金属换食物', desc: '金属 -3；食物 +3', effects: { metal: -3, food: 3 }, log: '你换到了三份食物。至少今晚不饿。' }
      ]
    },
    {
      id: 'storm', title: '暴风雪提前', kicker: 'DAY EVENT',
      text: '风把营地外的铁皮吹得整夜响。今晚会非常冷。',
      choices: [
        { label: '烧柴硬扛', desc: '木头 -3；士气 +6', effects: { wood: -3, morale: 6 }, log: '火堆烧得很旺。大家围着火坐了一夜。' },
        { label: '省柴', desc: '士气 -8；一人受伤', effects: { morale: -8, wound: true }, log: '你省下了柴。有人在天亮时咳出了血。' }
      ]
    }
  ];

  const START_DECK = [
    'wall', 'farm', 'tower', 'shelter', 'cook', 'hunter', 'raincatcher',
    'workbench', 'medic', 'guard', 'trap', 'engineer', 'survivor', 'bow', 'radio', 'wall'
  ];

  // ---------- meta / profile ----------
  const PROFILE_KEY = 'ember-camp-profile-v3';
  const LEADERS = [
    { id: 'scavenger', name: '拾荒者', icon: 'pouch', cost: 0, desc: '探索多带 1 份资源，探索风险 -5%。' },
    { id: 'engineer', name: '工程师', icon: 'resource_planks', cost: 60, desc: '工坊制造少 1 金属；卡牌升级少 1 研究。' },
    { id: 'medic', name: '医者', icon: 'flask_full', cost: 80, desc: '开局多 1 药品；伤员恢复快 1 天。' }
  ];

  const META_UPGRADES = [
    { id: 'supply', name: '补给线', icon: 'resource_apple', max: 3, cost: 30, desc: '开局食物 +2/级' },
    { id: 'wood', name: '木料堆', icon: 'resource_wood', max: 3, cost: 30, desc: '开局木头 +2/级' },
    { id: 'metal', name: '工具箱', icon: 'resource_iron', max: 3, cost: 35, desc: '开局金属 +1/级' },
    { id: 'medicine', name: '药柜', icon: 'flask_full', max: 3, cost: 40, desc: '开局药品 +1/级' },
    { id: 'morale', name: '篝火余温', icon: 'campfire', max: 3, cost: 35, desc: '开局士气 +8/级' },
    { id: 'fuel', name: '保暖层', icon: 'structure_house', max: 2, cost: 50, desc: '每晚耗柴 -1/级' }
  ];

  const ACHIEVEMENTS = [
    { id: 'day5', name: '活过第 5 天', desc: '单局撑到第 5 天', reward: 20, check: () => state.day >= 5 },
    { id: 'rescue', name: '电台响了', desc: '完成一次救援结局', reward: 50, check: () => state.endKind === 'good' },
    { id: 'lv3', name: '满级营地', desc: '把一张牌升到 Lv.3', reward: 30, check: () => state.maxCardLevel >= 3 },
    { id: 'survivors5', name: '人丁兴旺', desc: '单局拥有 5 名幸存者', reward: 30, check: () => state.runStats.maxSurvivors >= 5 },
    { id: 'scav10', name: '拾荒十次', desc: '累计探索 10 次', reward: 30, check: () => profile.stats.scavenges >= 10 },
    { id: 'wins3', name: '老手', desc: '累计完成 3 次救援', reward: 80, check: () => profile.stats.wins >= 3 }
  ];

  const DAILY_MODS = [
    { id: 'cold', name: '寒潮', icon: '❄️', desc: '耗柴 +1，开局木头 +2', fuel: 1, start: { wood: 2 } },
    { id: 'raiders', name: '掠夺者', icon: '☠️', desc: '夜袭 +1，开局金属 +1', attack: 1, start: { metal: 1 } },
    { id: 'fog', name: '浓雾', icon: '🌫️', desc: '探索风险 +10%，开局食物 +2', scavRisk: 0.1, start: { food: 2 } },
    { id: 'harvest', name: '丰收', icon: '🌾', desc: '开局食物 +3，士气 +5', morale: 5, start: { food: 3 } }
  ];

  const DEFAULT_PROFILE = {
    embers: 0,
    upgrades: { supply: 0, wood: 0, metal: 0, medicine: 0, morale: 0, fuel: 0 },
    leaders: ['scavenger'],
    achievements: {},
    stats: { runs: 0, wins: 0, bestDay: 0, bestScore: 0, scavenges: 0 },
    daily: { date: '', best: 0, streak: 0, lastDate: '' },
    leaderboard: []
  };

  function loadProfile() {
    let p = null;
    try { p = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); } catch (e) {}
    const merged = {
      ...DEFAULT_PROFILE,
      ...(p || {}),
      upgrades: { ...DEFAULT_PROFILE.upgrades, ...((p && p.upgrades) || {}) },
      achievements: { ...((p && p.achievements) || {}) },
      stats: { ...DEFAULT_PROFILE.stats, ...((p && p.stats) || {}) },
      daily: { ...DEFAULT_PROFILE.daily, ...((p && p.daily) || {}) },
      leaderboard: Array.isArray(p && p.leaderboard) ? p.leaderboard : []
    };
    if (!Array.isArray(merged.leaders) || !merged.leaders.length) merged.leaders = ['scavenger'];
    return merged;
  }
  function saveProfile() {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch (e) {}
  }
  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function yesterdayKey() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function hashString(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function mulberry32(seed) {
    return function () {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function metaCost(up) {
    const level = profile.upgrades[up.id] || 0;
    return up.cost * (level + 1);
  }
  function leaderById(id) {
    return LEADERS.find(l => l.id === id) || LEADERS[0];
  }
  function isDaily() { return state.mode === 'daily'; }
  function isEndless() { return state.mode === 'endless'; }

  let profile = loadProfile();
  let runRng = Math.random;
  function rng() { return runRng(); }

  // ---------- state ----------
  let uidCounter = 0;
  const state = {
    day: 1, maxDay: 15, act: 1, ap: 4,
    food: 8, wood: 10, metal: 4, medicine: 2, morale: 60, research: 0, parts: 0,
    weather: 'clear', tempDef: 0,
    board: Array(12).fill(null), hand: [], deck: [], discard: [],
    selectedHand: null, selectedBoard: null,
    explored: false, scavengeTeam: [], adUsed: false, sound: true,
    phase: 'tutorial', started: false, eventSeen: [], log: [],
    best: 0, score: 0, firstPlay: false, firstCombine: false, firstUpgrade: false,
    mode: 'standard', leader: 'scavenger', dailyMod: null, endless: false,
    fuelDiscount: 0, maxCardLevel: 1, endKind: null, embersEarned: 0,
    runStats: { scavenges: 0, upgrades: 0, crafts: 0, maxSurvivors: 0 },
    pendingLeader: 'scavenger'
  };

  const SOUND = {
    place: new Audio('assets/audio/cardPlace1.ogg'),
    slide: new Audio('assets/audio/cardSlide1.ogg'),
    combine: new Audio('assets/audio/chipsCollide1.ogg'),
    night: new Audio('assets/audio/dieThrow1.ogg')
  };
  Object.values(SOUND).forEach(a => { a.preload = 'auto'; a.volume = 0.35; });

  // ---------- helpers ----------
  function makeCard(type, level = 1) {
    return { uid: ++uidCounter, type, level, wounded: 0, away: false };
  }
  function getData(card) {
    const base = CARD[card.type];
    const lv = base.levels ? base.levels[card.level - 1] : null;
    return { ...base, ...(lv || {}), level: card.level };
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function random(arr) { return arr[Math.floor(rng() * arr.length)]; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function currentWeather() { return WEATHERS.find(w => w.id === state.weather) || WEATHERS[0]; }
  function survivors() { return state.board.filter(c => c && SURVIVOR_TYPES.includes(c.type)).length; }
  function healthySurvivors() { return state.board.filter(c => c && SURVIVOR_TYPES.includes(c.type) && !c.away && c.wounded <= 0); }
  function woundedSurvivors() { return state.board.filter(c => c && SURVIVOR_TYPES.includes(c.type) && c.wounded > 0); }
  function hasCard(type) { return state.board.some(c => c && c.type === type); }
  function boardCards() { return state.board.map((c, i) => c ? { ...c, slot: i } : null).filter(Boolean); }
  function attack() { return 2 + state.day + (state.day >= 11 ? 2 : 0) + (state.dailyMod && state.dailyMod.attack ? state.dailyMod.attack : 0); }
  function fuelNeed() {
    const base = currentWeather().fuel + Math.floor(survivors() / 3) + (state.dailyMod && state.dailyMod.fuel ? state.dailyMod.fuel : 0);
    return Math.max(0, base - (state.fuelDiscount || 0));
  }
  function moraleMult() { return state.morale >= 80 ? 1.1 : state.morale < 30 ? 0.75 : 1; }
  function actName() { return state.day <= 5 ? 'ACT I' : state.day <= 10 ? 'ACT II' : 'ACT III'; }
  function sound(name) {
    if (!state.sound) return;
    const a = SOUND[name];
    if (!a) return;
    try { a.currentTime = 0; a.play().catch(() => {}); } catch (e) {}
  }
  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 1600);
  }
  function float(text, kind = 'gold') {
    const el = document.createElement('div');
    el.className = 'float ' + kind;
    el.textContent = text;
    el.style.left = (16 + rng() * 68) + '%';
    el.style.top = (30 + rng() * 35) + '%';
    $('floats').appendChild(el);
    setTimeout(() => el.remove(), 950);
  }
  function log(text, kind = '') {
    state.log.unshift({ text, kind });
    state.log = state.log.slice(0, 30);
  }
  function canAfford(cost) {
    return Object.entries(cost || {}).every(([k, v]) => (state[k] || 0) >= v);
  }
  function payCost(cost) {
    for (const [k, v] of Object.entries(cost || {})) state[k] -= v;
  }
  function costHtml(cost) {
    if (!cost) return '';
    return Object.entries(cost).map(([k, v]) =>
      `<span class="cost-part"><img src="assets/icons/${ICON[k] || 'puzzle'}.png" alt="">${v}</span>`
    ).join('');
  }
  function costText(cost) {
    if (!cost) return '免费';
    const map = { food: '食物', wood: '木', metal: '金属', medicine: '药' };
    return Object.entries(cost).map(([k, v]) => `${v}${map[k] || k}`).join(' + ');
  }
  function craftCost(craft) {
    const c = { ...(craft.cost || {}) };
    if (state.leader === 'engineer' && c.metal) c.metal = Math.max(0, c.metal - 1);
    return c;
  }
  function upgradeResearch(next) {
    return Math.max(0, (next.research || 0) - (state.leader === 'engineer' ? 1 : 0));
  }
  function prodText(prod) {
    const map = { food: '食', wood: '木', metal: '金', medicine: '药', research: '研' };
    return Object.entries(prod || {}).map(([k, v]) => `+${v}${map[k] || k}`).join(' ');
  }
  function statIcons(d) {
    const parts = [];
    if (d.def) parts.push(`<span class="sicon"><img src="assets/icons/${ICON.def}.png" alt="">${d.def}</span>`);
    for (const [k, v] of Object.entries(d.prod || {})) {
      parts.push(`<span class="sicon"><img src="assets/icons/${ICON[k] || 'puzzle'}.png" alt="">${v}</span>`);
    }
    if (!parts.length) parts.push('<span class="sicon muted">—</span>');
    return parts.join('');
  }

  // ---------- stats ----------
  function getStats() {
    const s = { def: 0, food: 0, wood: 0, metal: 0, medicine: 0, research: 0 };
    const bonuses = {};
    const addBonus = (uid, stat, v, label) => {
      if (!bonuses[uid]) bonuses[uid] = [];
      bonuses[uid].push({ stat, v, label });
    };

    state.board.forEach(card => {
      if (!card || card.away) return;
      const d = getData(card);
      const mult = card.wounded > 0 ? 0.5 : 1;
      s.def += Math.floor((d.def || 0) * mult);
      for (const [k, v] of Object.entries(d.prod || {})) s[k] += Math.floor(v * mult);
    });

    const dirs = [[1, 0], [0, 1]];
    for (let i = 0; i < 12; i++) {
      const a = state.board[i];
      if (!a || a.away) continue;
      const x = i % 4, y = Math.floor(i / 4);
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (nx > 3 || ny > 2) continue;
        const j = ny * 4 + nx;
        const b = state.board[j];
        if (!b || b.away) continue;
        for (const adj of ADJ) {
          const match = (adj.a === a.type && adj.b === b.type) || (adj.a === b.type && adj.b === a.type);
          if (!match) continue;
          s[adj.stat] += adj.v;
          addBonus(a.uid, adj.stat, adj.v, adj.label);
          addBonus(b.uid, adj.stat, adj.v, adj.label);
        }
      }
    }
    return { s, bonuses };
  }

  // ---------- render ----------
  function render() {
    state.runStats.maxSurvivors = Math.max(state.runStats.maxSurvivors || 0, survivors());
    state.maxCardLevel = Math.max(state.maxCardLevel || 1, ...state.board.filter(Boolean).map(c => c.level || 1));
    const stats = getStats();
    renderHud(stats);
    renderStatus();
    renderBoard(stats);
    renderHand(stats);
    renderNight(stats);
    renderParts();
    renderLog();
    renderDetail(stats);
  }

  function renderHud(stats) {
    $('hudDay').textContent = state.day;
    $('hudFood').textContent = state.food;
    $('hudWood').textContent = state.wood;
    $('hudMetal').textContent = state.metal;
    $('hudMedicine').textContent = state.medicine;
    $('hudSurvivors').textContent = survivors();
    $('apLabel').textContent = state.ap;
    $('handCount').textContent = state.hand.length;
    $('exploreBtn').disabled = state.phase !== 'day' || state.ap < 1 || state.explored || healthySurvivors().length === 0;
    $('workshopBtn').disabled = state.phase !== 'day';
    $('opsBtn').disabled = state.phase !== 'day';
    $('endDayBtn').disabled = state.phase !== 'day';
    $('logDay').textContent = `DAY ${state.day}`;
  }

  function renderStatus() {
    const w = currentWeather();
    $('weatherIcon').textContent = w.icon;
    $('weatherName').textContent = w.name;
    $('weatherDesc').textContent = `${w.desc} · 需柴 ${fuelNeed()}${state.dailyMod ? ' · ' + state.dailyMod.name : ''}`;
    $('moraleLabel').textContent = Math.round(state.morale);
    $('moraleBar').style.width = clamp(state.morale, 0, 100) + '%';
    $('researchLabel').textContent = state.research;
    $('tempDefLabel').textContent = state.tempDef;
    $('actLabel').textContent = state.mode === 'daily' ? 'DAILY' : state.mode === 'endless' ? 'ENDLESS' : actName();
  }

  function cardClass(type) {
    const d = CARD[type];
    const cls = ['card', d.type];
    if (type === 'radio') cls.push('radio');
    if (d.tags && d.tags.includes('合成')) cls.push('special');
    return cls.join(' ');
  }

  function cardHtml(card, opts = {}) {
    const d = getData(card);
    const cost = opts.hideCost ? '' : costHtml(d.cost);
    const bonuses = opts.bonuses || [];
    const bonus = bonuses.length ? `<span class="bonus">+${bonuses.reduce((n, b) => n + b.v, 0)}</span>` : '';
    const level = card.level > 1 ? `<span class="level">Lv.${card.level}</span>` : '';
    const wound = card.wounded > 0 ? '<span class="wound">🩹</span>' : '';
    const away = card.away ? '<span class="away">🚶</span>' : '';
    return `<button class="${cardClass(card.type)}${opts.selected ? ' selected' : ''}${opts.unaffordable ? ' unaffordable' : ''}" ${opts.attr || ''}>
      ${cost ? `<span class="cost">${cost}</span>` : ''}
      <span class="type-dot"></span>
      <img class="icon" src="assets/icons/${d.icon}.png" alt="">
      <span class="name">${d.name}</span>
      <span class="stats">${statIcons(d)}</span>
      ${level}${wound}${away}${bonus}
    </button>`;
  }

  function renderBoard(stats) {
    const canDrop = state.selectedHand !== null && state.phase === 'day';
    let html = '';
    for (let i = 0; i < 12; i++) {
      const card = state.board[i];
      if (!card) {
        html += `<div class="slot ${canDrop ? 'can-drop' : ''}" data-slot="${i}"></div>`;
      } else {
        const bonus = stats.bonuses[card.uid] || [];
        html += `<div class="slot" data-slot="${i}">
          ${cardHtml(card, { attr: `data-board="${i}"`, hideCost: true, selected: state.selectedBoard === i, bonuses: bonus })}
        </div>`;
      }
    }
    $('board').innerHTML = html;
  }

  function renderHand(stats) {
    if (!state.hand.length) {
      $('hand').innerHTML = '<div class="empty-hand">手牌空了。结束白天，明天再找。</div>';
      return;
    }
    $('hand').innerHTML = state.hand.map(c => cardHtml(c, {
      attr: `data-hand="${c.uid}"`,
      selected: state.selectedHand === c.uid,
      unaffordable: !canAfford(CARD[c.type].cost)
    })).join('');
  }

  function renderNight(stats) {
    const atk = attack();
    const def = stats.s.def + state.tempDef;
    $('attackLabel').textContent = atk;
    $('defenseLabel').textContent = def;
    const miniAtk = $('miniAttack');
    const miniDef = $('miniDef');
    if (miniAtk) miniAtk.textContent = atk;
    if (miniDef) miniDef.textContent = def;
    const pct = clamp(def / Math.max(1, atk) * 100, 0, 100);
    $('defBar').style.width = pct + '%';
    $('nightPhase').textContent = state.phase === 'night' ? '夜袭中' : '天黑前';
    const panel = document.querySelector('.night-panel');
    panel.classList.toggle('ok', def >= atk);
    panel.classList.toggle('bad', def < atk);
    $('nightHint').textContent = def >= atk
      ? '防线够，能守住。'
      : `还差 ${atk - def} 防御。夜里会破防。`;
  }

  function renderParts() {
    $('partsRow').innerHTML = [0, 1, 2].map(i =>
      `<div class="part ${i < state.parts ? 'filled' : ''}"><img src="assets/icons/${ICON.parts}.png" alt=""></div>`
    ).join('');
    const mini = $('partsMini');
    if (mini) mini.textContent = `${state.parts}/3`;
    $('radioState').textContent = hasCard('radio') ? '电台已建' : state.parts >= 3 ? '可建电台' : '未建电台';
  }

  function renderLog() {
    $('log').innerHTML = state.log.length
      ? state.log.map(x => `<div class="log-item ${x.kind}">${x.text}</div>`).join('')
      : '<div class="log-item">营地很安静，只有火在响。</div>';
  }

  function renderDetail(stats) {
    const el = $('detail');
    if (state.selectedHand !== null) {
      const card = state.hand.find(c => c.uid === state.selectedHand);
      if (card) {
        const d = getData(card);
        el.innerHTML = `<b>${d.name}</b> · 费用 ${costText(d.cost)} · ${d.desc}`;
        return;
      }
    }
    if (state.selectedBoard !== null) {
      const card = state.board[state.selectedBoard];
      if (card) {
        const d = getData(card);
        const bonuses = stats.bonuses[card.uid] || [];
        const status = [];
        if (card.wounded > 0) status.push(`受伤 ${card.wounded} 天`);
        if (card.away) status.push('外出探索中');
        const levels = CARD[card.type].levels;
        const next = levels && card.level < levels.length ? levels[card.level] : null;
        let html = `<b>${d.name}${card.level > 1 ? ' Lv.' + card.level : ''}</b> · 防御 ${d.def || 0}${prodText(d.prod) ? ' · ' + prodText(d.prod) : ''} · ${d.desc}`;
        if (status.length) html += ` · <span style="color:#ffb3c1">${status.join('，')}</span>`;
        if (bonuses.length) html += ` · 相邻：${bonuses.map(b => b.label + ' +' + b.v).join('，')}`;
        const recipes = RECIPES.filter(r => r.a === card.type || r.b === card.type);
        if (recipes.length) html += ` · 可合成：${recipes.map(r => `${CARD[r.a].name}+${CARD[r.b].name}=${CARD[r.out].name}`).join('；')}`;
        if (next) {
          const needResearch = upgradeResearch(next);
          const can = state.ap >= 1 && canAfford(next.cost) && state.research >= needResearch;
          html += `<br><button class="detail-btn" id="upgradeBtn" ${can ? '' : 'disabled'}>升级 Lv.${card.level + 1} · ${costText(next.cost)}${needResearch ? ' + ' + needResearch + '研究' : ''}</button>`;
        } else if (card.type === 'radio') {
          html += '<br><span style="color:#c4b5fd">救援核心：第 15 天判定。</span>';
        }
        el.innerHTML = html;
        if (next && $('upgradeBtn')) $('upgradeBtn').onclick = () => upgradeCard(state.selectedBoard);
        return;
      }
    }
    el.textContent = '点一张手牌查看详情；点营地牌可升级/合成。';
  }

  // ---------- selection / play ----------
  function selectHand(uidValue) {
    if (state.phase !== 'day') return;
    state.selectedHand = state.selectedHand === uidValue ? null : uidValue;
    state.selectedBoard = null;
    render();
  }

  function selectBoard(index) {
    if (state.phase !== 'day') return;
    if (state.selectedBoard === index) { state.selectedBoard = null; state.selectedHand = null; render(); return; }
    state.selectedHand = null;
    state.selectedBoard = index;
    render();
  }

  function playCard(index) {
    if (state.phase !== 'day') return;
    if (state.selectedHand === null) return;
    if (state.board[index]) { toast('这个位置已经有牌了'); return; }
    if (state.ap < 1) { toast('行动点不够，结束白天吧'); return; }
    const card = state.hand.find(c => c.uid === state.selectedHand);
    if (!card) return;
    const d = CARD[card.type];
    if (!canAfford(d.cost)) { toast(`资源不够：需要 ${costText(d.cost)}`); return; }
    payCost(d.cost);
    state.ap--;
    state.hand = state.hand.filter(c => c.uid !== card.uid);
    state.board[index] = card;
    state.selectedHand = null;
    state.selectedBoard = index;
    sound('place');
    log(`打出 <b>${d.name}</b>。${d.desc}`, 'good');
    state.firstPlay = true;
    if (card.type === 'radio') {
      log('电台建好了。只要零件够，第 15 天就能呼叫救援。', 'good');
      toast('电台建好了');
    }
    render();
  }

  function findRecipe(aType, bType) {
    return RECIPES.find(r =>
      (r.a === aType && r.b === bType) || (r.a === bType && r.b === aType)
    );
  }

  function combineBoard(index) {
    if (state.phase !== 'day') return;
    if (state.selectedBoard === null || state.selectedBoard === index) return;
    const a = state.board[state.selectedBoard];
    const b = state.board[index];
    if (!a || !b) return;
    const recipe = findRecipe(a.type, b.type);
    if (!recipe) {
      toast('这两张牌凑不出东西');
      state.selectedBoard = index;
      render();
      return;
    }
    const first = state.selectedBoard;
    state.board[first] = makeCard(recipe.out);
    state.board[index] = null;
    state.selectedBoard = first;
    state.selectedHand = null;
    sound('combine');
    log(`合成 <b>${CARD[recipe.out].name}</b>：${CARD[a.type].name} + ${CARD[b.type].name}。`, 'good');
    toast(`合成了 ${CARD[recipe.out].name}`);
    state.firstCombine = true;
    render();
  }

  function upgradeCard(index) {
    if (state.phase !== 'day') return;
    const card = state.board[index];
    if (!card) return;
    const levels = CARD[card.type].levels;
    if (!levels || card.level >= levels.length) { toast('已经是最高等级'); return; }
    if (state.ap < 1) { toast('行动点不够'); return; }
    const next = levels[card.level];
    if (!canAfford(next.cost)) { toast(`资源不够：需要 ${costText(next.cost)}`); return; }
    const needResearch = upgradeResearch(next);
    if (state.research < needResearch) { toast(`研究点不够：需要 ${needResearch}`); return; }
    payCost(next.cost);
    state.research -= needResearch;
    state.ap--;
    state.runStats.upgrades++;
    card.level++;
    sound('combine');
    log(`升级 <b>${CARD[card.type].name}</b> 到 Lv.${card.level}。`, 'good');
    toast(`${CARD[card.type].name} 升到 Lv.${card.level}`);
    state.firstUpgrade = true;
    render();
  }

  // ---------- workshop ----------
  function showWorkshop() {
    if (state.phase !== 'day') return;
    state.phase = 'workshop';
    const rows = CRAFTS.map(c => {
      const d = CARD[c.type];
      const cc = craftCost(c);
      const can = state.ap >= 1 && canAfford(cc) && (!c.requiresParts || state.parts >= c.requiresParts);
      const lock = c.requiresParts && state.parts < c.requiresParts ? `需要 ${c.requiresParts} 个零件` : '';
      return `<div class="craft-row">
        <img src="assets/icons/${d.icon}.png" alt="">
        <div class="ci"><b>${d.name}</b><span>${costText(c.cost)}${lock ? ' · ' + lock : ''}</span></div>
        <button data-craft="${c.type}" ${can ? '' : 'disabled'}>制造</button>
      </div>`;
    }).join('');
    overlay(`<div class="modal">
      <div class="kicker">工坊 · 1 AP / 张</div>
      <h2>把资源变成能活的牌</h2>
      <p>制造会直接进手牌；卡牌升级在营地牌的详情里。</p>
      <div class="craft-list">${rows}</div>
      <button class="ghost" id="closeWorkshop">关闭</button>
    </div>`);
    document.querySelectorAll('[data-craft]').forEach(btn => {
      btn.onclick = () => craftCard(btn.dataset.craft);
    });
    $('closeWorkshop').onclick = () => { state.phase = 'day'; closeOverlay(); render(); };
  }

  function craftCard(type) {
    const craft = CRAFTS.find(c => c.type === type);
    if (!craft) return;
    if (state.phase !== 'workshop') return;
    if (state.ap < 1) { toast('行动点不够'); return; }
    const cc = craftCost(craft);
    if (!canAfford(cc)) { toast(`资源不够：需要 ${costText(cc)}`); return; }
    if (craft.requiresParts && state.parts < craft.requiresParts) { toast(`还需要 ${craft.requiresParts} 个零件`); return; }
    payCost(cc);
    state.ap--;
    state.runStats.crafts++;
    addCardToHand(type);
    log(`工坊制造 <b>${CARD[type].name}</b>。`, 'good');
    sound('place');
    toast(`制造了 ${CARD[type].name}`);
    showWorkshop();
  }

  // ---------- operations ----------
  function showOps() {
    if (state.phase !== 'day') return;
    state.phase = 'ops';
    renderOps();
  }

  function renderOps() {
    const rows = OPS.map(op => {
      let can = state.ap >= op.ap && canAfford(op.cost);
      if (op.id === 'heal' && woundedSurvivors().length === 0) can = false;
      if (op.id === 'airdrop' && state.adUsed) can = false;
      const cost = Object.keys(op.cost || {}).length ? costText(op.cost) : '免费';
      return `<button class="op-card" data-op="${op.id}" ${can ? '' : 'disabled'}>
        <b>${op.name}</b><span>${op.desc}</span><em>${op.ap ? op.ap + ' AP · ' : ''}${cost}</em>
      </button>`;
    }).join('');
    overlay(`<div class="modal">
      <div class="kicker">营地行动</div>
      <h2>今天还能做点什么</h2>
      <p>行动花费行动点；不花行动点的空投每局只有一次。</p>
      <div class="ops-grid">${rows}</div>
      <button class="ghost" id="closeOps">关闭</button>
    </div>`);
    document.querySelectorAll('[data-op]').forEach(btn => btn.onclick = () => doOp(btn.dataset.op));
    $('closeOps').onclick = () => { state.phase = 'day'; closeOverlay(); render(); };
  }

  function doOp(id) {
    const op = OPS.find(o => o.id === id);
    if (!op || state.phase !== 'ops') return;
    if (state.ap < op.ap) { toast('行动点不够'); return; }
    if (!canAfford(op.cost)) { toast(`资源不够：需要 ${costText(op.cost)}`); return; }
    if (op.id === 'heal' && woundedSurvivors().length === 0) { toast('没有伤员'); return; }
    if (op.id === 'airdrop' && state.adUsed) { toast('本局空投已经用过了'); return; }

    if (op.id === 'fortify') { state.tempDef += 2; log('加固防线：今夜防御 +2。', 'good'); }
    if (op.id === 'soup') { state.morale = clamp(state.morale + 12, 0, 100); log('热汤下肚：士气 +12。', 'good'); }
    if (op.id === 'heal') {
      const target = woundedSurvivors()[0];
      target.wounded = 0;
      log(`治疗：<b>${getData(target).name}</b> 恢复。`, 'good');
    }
    if (op.id === 'study') { state.research += 2; log('研究：研究点 +2。', 'good'); }
    if (op.id === 'airdrop') {
      state.adUsed = true;
      state.food += 2; state.wood += 2; state.metal += 1;
      log('空投补给：食物 +2，木头 +2，金属 +1。', 'good');
    }
    payCost(op.cost);
    state.ap -= op.ap;
    sound('place');
    renderOps();
    render();
  }

  // ---------- scavenge ----------
  function showScavenge() {
    if (state.phase !== 'day' || state.ap < 1 || state.explored) return;
    if (healthySurvivors().length === 0) { toast('没有健康的幸存者可以出门'); return; }
    state.phase = 'scavenge';
    state.scavengeTeam = [];
    renderScavenge();
  }

  function renderScavenge() {
    const healthy = healthySurvivors();
    const chips = healthy.map(c => {
      const d = getData(c);
      const selected = state.scavengeTeam.includes(c.uid);
      return `<button class="scout-chip ${selected ? 'selected' : ''}" data-scout="${c.uid}">
        <img src="assets/icons/${d.icon}.png" alt=""><b>${d.name}</b><small>${selected ? '已选' : '点击选择'}</small>
      </button>`;
    }).join('');
    const keys = getLocationChoices();
    const locs = keys.map(key => {
      const loc = LOCATIONS[key];
      const risk = Math.round((loc.risk + currentWeather().risk) * 100);
      const reward = Object.entries(loc.rewards || {}).map(([k, v]) => `${v > 0 ? '+' : ''}${v}${({ food: '食', wood: '木', metal: '金', medicine: '药', parts: '零件' })[k]}`).join(' ');
      return `<button class="loc" data-loc="${key}">
        <img src="assets/icons/${loc.icon}.png" alt="">
        <b>${loc.name}</b>
        <span>${loc.desc}</span>
        <em class="reward">${reward} + 卡牌</em>
        <em>风险约 ${risk}%</em>
      </button>`;
    }).join('');
    overlay(`<div class="modal">
      <div class="kicker">探索 · 1 AP</div>
      <h2>派谁出门？</h2>
      <p>选 1-2 名健康的幸存者。外出的人今晚不参与防御和生产，也可能受伤。</p>
      <div class="scout-head"><span>队伍 <b>${state.scavengeTeam.length}</b>/2</span><span>${state.scavengeTeam.length ? '点地点出发' : '先选人'}</span></div>
      <div class="scout-list">${chips}</div>
      <div class="loc-grid">${locs}</div>
      <button class="ghost" id="closeScavenge">留在营地</button>
    </div>`);
    document.querySelectorAll('[data-scout]').forEach(btn => {
      btn.onclick = () => {
        const id = Number(btn.dataset.scout);
        if (state.scavengeTeam.includes(id)) state.scavengeTeam = state.scavengeTeam.filter(x => x !== id);
        else if (state.scavengeTeam.length < 2) state.scavengeTeam.push(id);
        else toast('最多带两个人');
        renderScavenge();
      };
    });
    document.querySelectorAll('[data-loc]').forEach(btn => {
      btn.onclick = () => chooseScavenge(btn.dataset.loc);
    });
    $('closeScavenge').onclick = () => { state.phase = 'day'; closeOverlay(); render(); };
  }

  function getLocationChoices() {
    const pool = Object.keys(LOCATIONS).filter(k => k !== 'radio');
    const choices = [];
    if (state.parts < 3) choices.push('radio');
    while (choices.length < 3) {
      const k = random(pool);
      if (!choices.includes(k)) choices.push(k);
    }
    return shuffle(choices);
  }

  function chooseScavenge(key) {
    if (state.phase !== 'scavenge') return;
    if (!state.scavengeTeam.length) { toast('先选一个出门的人'); return; }
    const loc = LOCATIONS[key];
    if (!loc) return;
    const team = state.scavengeTeam.map(id => state.board.find(c => c && c.uid === id)).filter(Boolean);
    if (!team.length) { toast('队伍不见了'); return; }

    state.ap--;
    state.explored = true;
    state.runStats.scavenges++;
    team.forEach(c => c.away = true);
    const scav = team.some(c => c.type === 'scavenger');
    const hunter = team.some(c => c.type === 'hunter');
    const factor = 1 + 0.35 * (team.length - 1);
    let risk = loc.risk + currentWeather().risk + 0.06 * (team.length - 1) - (hunter ? 0.06 : 0)
      - (state.leader === 'scavenger' ? 0.05 : 0)
      + (state.dailyMod && state.dailyMod.scavRisk ? state.dailyMod.scavRisk : 0);
    risk = clamp(risk, 0.05, 0.75);

    const rewards = { ...loc.rewards };
    const leaderBonus = state.leader === 'scavenger' ? 1 : 0;
    for (const k of ['food', 'wood', 'metal']) {
      if (rewards[k] > 0) rewards[k] = Math.max(1, Math.round(rewards[k] * factor + (scav ? 1 : 0) + leaderBonus));
    }
    const bad = rng() < risk;
    if (bad) {
      const victim = random(team);
      victim.wounded = 2;
      for (const k of ['food', 'wood', 'metal']) if (rewards[k] > 0) rewards[k] = Math.max(1, Math.round(rewards[k] * 0.5));
      log(`探索<b>${loc.name}</b>：${loc.riskText}，<b>${getData(victim).name}</b>受伤。`, 'bad');
      toast('有人受伤了');
    } else {
      log(`探索<b>${loc.name}</b>：安全返回。`, 'good');
    }
    for (const [k, v] of Object.entries(rewards)) {
      if (k === 'parts') state.parts = clamp(state.parts + v, 0, 3);
      else state[k] = Math.max(0, state[k] + v);
    }
    const cards = 1 + (scav ? 1 : 0);
    for (let i = 0; i < cards; i++) addCardToHand(random(loc.cards));
    if (state.parts >= 3) ensureRadioCard();
    state.scavengeTeam = [];
    state.phase = 'day';
    closeOverlay();
    render();
  }

  // ---------- cards / deck ----------
  function hasRadioAvailable() {
    return hasCard('radio') || state.hand.some(c => c.type === 'radio') ||
      state.deck.includes('radio') || state.discard.includes('radio');
  }
  function ensureRadioCard() {
    if (state.parts < 3 || hasRadioAvailable()) return;
    state.hand.push(makeCard('radio'));
    log('零件够了。你找到了电台的图纸。', 'good');
    toast('获得电台卡');
  }
  function addCardToHand(type) {
    if (state.hand.length >= 9) {
      state.discard.push(type);
      log(`手牌满了，<b>${CARD[type].name}</b>进了弃牌堆。`, 'bad');
      return;
    }
    state.hand.push(makeCard(type));
    float(`+${CARD[type].name}`, 'gold');
  }
  function drawCards(n) {
    for (let i = 0; i < n; i++) {
      if (!state.deck.length) {
        if (state.discard.length) {
          state.deck = shuffle(state.discard);
          state.discard = [];
          log('弃牌堆洗回了牌库。');
        } else return;
      }
      const type = state.deck.pop();
      if (state.hand.length >= 9) {
        state.discard.push(type);
        log(`手牌满了，<b>${CARD[type].name}</b>进了弃牌堆。`, 'bad');
      } else state.hand.push(makeCard(type));
    }
  }

  // ---------- night / day ----------
  function endDay() {
    if (state.phase !== 'day') return;
    state.phase = 'night';
    const atk = attack();
    const def = getStats().s.def + state.tempDef;
    sound('night');
    log(`第 ${state.day} 天结束。今夜袭击 ${atk}，防御 ${def}。`, def >= atk ? 'good' : 'bad');
    render();
    overlay(`<div class="modal night-modal">
      <div class="kicker">NIGHT ${state.day}</div>
      <div class="night-skull">☠️</div>
      <h2>${def >= atk ? '防线守住了' : '防线被突破'}</h2>
      <p>${def >= atk ? '火堆还亮着。' : '它们冲进来了，你得丢下一点东西。'}</p>
      <div class="night-bars">
        <div class="night-bar attack"><span>袭击</span><div class="bar"><i style="width:${Math.min(100, atk / Math.max(atk, def, 1) * 100)}%"></i></div><b>${atk}</b></div>
        <div class="night-bar defense"><span>防御</span><div class="bar"><i style="width:${Math.min(100, def / Math.max(atk, def, 1) * 100)}%"></i></div><b>${def}</b></div>
      </div>
    </div>`);
    setTimeout(() => resolveNight(atk, def), 1100);
  }

  function resolveNight(atk, def) {
    if (state.phase !== 'night') return;
    const need = fuelNeed();
    if (state.wood >= need) {
      state.wood -= need;
      log(`烧柴：消耗 ${need} 木头。`);
    } else {
      state.wood = 0;
      state.morale = Math.max(0, state.morale - 12);
      const victim = healthySurvivors()[0];
      if (victim) victim.wounded = 2;
      log(`柴不够：有人冻伤了，士气 -12。`, 'bad');
    }

    const raw = getStats().s;
    const mult = moraleMult();
    const prod = {
      food: Math.floor(raw.food * mult),
      wood: Math.floor(raw.wood * mult),
      metal: Math.floor(raw.metal * mult),
      medicine: Math.floor(raw.medicine * mult),
      research: Math.floor(raw.research * mult)
    };
    for (const [k, v] of Object.entries(prod)) if (v > 0) state[k] += v;
    const parts = Object.entries(prod).filter(([, v]) => v > 0).map(([k, v]) => `+${v}${({ food: '食', wood: '木', metal: '金', medicine: '药', research: '研' })[k]}`);
    if (parts.length) log(`营地生产：${parts.join('，')}。`, 'good');

    const pop = survivors();
    if (pop <= 0) { closeOverlay(); endGame('bad'); return; }
    if (state.food >= pop) {
      state.food -= pop;
      log(`晚饭：${pop} 个人吃掉 ${pop} 份食物。`);
    } else {
      state.food = 0;
      log('食物不够。有人没撑过今晚。', 'bad');
      removeSurvivor('饥饿');
      if (survivors() <= 0) { closeOverlay(); endGame('bad'); return; }
    }
    if (state.morale <= 0) { closeOverlay(); endGame('bad'); return; }

    if (def >= atk) {
      log('夜袭：防线守住了。', 'good');
      closeOverlay();
      setTimeout(advanceDay, 400);
      return;
    }
    closeOverlay();
    setTimeout(() => showBreach(atk, def), 220);
  }

  function showBreach(atk, def) {
    state.phase = 'breach';
    const cards = boardCards();
    const canWound = healthySurvivors().length > 0;
    if (!cards.length) {
      if (canWound) {
        woundSurvivor('夜袭');
        advanceDay();
      } else endGame('bad');
      return;
    }
    overlay(`<div class="modal">
      <div class="kicker">防线突破</div>
      <h2>丢下一张牌，或者让一个人受伤。</h2>
      <p>袭击 ${atk}，防御 ${def}。怪物冲进了营地，你必须付出代价。</p>
      <div class="choices">
        <button class="choice" id="sacrificeBtn"><b>牺牲一张营地牌</b><span>失去一张牌，保住所有人。</span></button>
        <button class="choice" id="woundBtn" ${canWound ? '' : 'disabled'}><b>让一个人受伤</b><span>该幸存者 2 天不能工作/探索。</span></button>
      </div>
      <button class="ghost" id="breachCancel" disabled>必须选择</button>
    </div>`);
    $('sacrificeBtn').onclick = () => showSacrifice(cards);
    $('woundBtn').onclick = () => {
      if (!canWound) return;
      woundSurvivor('夜袭');
      closeOverlay();
      advanceDay();
    };
  }

  function showSacrifice(cards) {
    overlay(`<div class="modal">
      <div class="kicker">牺牲</div>
      <h2>哪张牌留下来？</h2>
      <p>被撕碎的牌会永远离开这一局。</p>
      <div class="breach-grid">
        ${cards.map(c => `<button class="breach-card" data-sacrifice="${c.slot}">
          <img src="assets/icons/${getData(c).icon}.png" alt=""><b>${getData(c).name}</b>
        </button>`).join('')}
      </div>
    </div>`);
    document.querySelectorAll('[data-sacrifice]').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.dataset.sacrifice);
        const card = state.board[idx];
        if (!card) return;
        state.board[idx] = null;
        state.selectedBoard = null;
        log(`夜袭：<b>${getData(card).name}</b>被毁。`, 'bad');
        sound('combine');
        closeOverlay();
        if (survivors() <= 0) { endGame('bad'); return; }
        advanceDay();
      };
    });
  }

  function woundSurvivor(reason) {
    const target = healthySurvivors()[0];
    if (!target) return false;
    target.wounded = 2;
    log(`<b>${getData(target).name}</b>受伤了（${reason}），2 天不能行动。`, 'bad');
    toast(`${getData(target).name}受伤`);
    return true;
  }

  function removeSurvivor(reason) {
    const idx = state.board.findIndex(c => c && SURVIVOR_TYPES.includes(c.type));
    if (idx < 0) return;
    const card = state.board[idx];
    state.board[idx] = null;
    log(`<b>${getData(card).name}</b>倒下了（${reason}）。`, 'bad');
    toast(`${getData(card).name}倒下了`);
  }

  function advanceDay() {
    if (state.phase === 'end') return;
    if (state.day >= state.maxDay) { endGame(checkRescue()); return; }
    state.day++;
    state.ap = 4;
    state.explored = false;
    state.tempDef = 0;
    state.scavengeTeam = [];
    state.phase = 'day';
    state.selectedHand = null;
    state.selectedBoard = null;
    state.board.forEach(c => {
      if (!c) return;
      c.away = false;
      if (c.wounded > 0) c.wounded -= (state.leader === 'medic' ? 2 : 1);
      if (c.wounded < 0) c.wounded = 0;
    });
    rollWeather();
    if (state.morale <= 0) { endGame('bad'); return; }
    drawCards(2);
    render();
    toast(`第 ${state.day} 天 · ${currentWeather().icon} ${currentWeather().name}`);
    maybeEvent();
  }

  function rollWeather() {
    const pool = state.day <= 4
      ? ['clear', 'clear', 'cold', 'fog']
      : state.day <= 9
        ? ['clear', 'cold', 'storm', 'fog', 'warm']
        : ['cold', 'storm', 'storm', 'fog', 'warm'];
    state.weather = random(pool);
    const w = currentWeather();
    state.morale = clamp(state.morale + w.morale, 0, 100);
    log(`天气：${w.icon} ${w.name}。${w.desc}。`, w.morale > 0 ? 'good' : w.morale < 0 ? 'bad' : '');
  }

  function maybeEvent() {
    if (![3, 5, 7, 9, 11, 13].includes(state.day)) return;
    if (state.eventSeen.includes(state.day)) return;
    state.eventSeen.push(state.day);
    const ev = random(EVENTS);
    state.phase = 'event';
    overlay(`<div class="modal">
      <div class="kicker">${ev.kicker} · DAY ${state.day}</div>
      <h2>${ev.title}</h2>
      <p>${ev.text}</p>
      <div class="choices">
        ${ev.choices.map((c, i) => `<button class="choice" data-event="${i}">
          <b>${c.label}</b><span>${c.desc}</span>
        </button>`).join('')}
      </div>
    </div>`);
    document.querySelectorAll('[data-event]').forEach(btn => {
      btn.onclick = () => {
        const choice = ev.choices[Number(btn.dataset.event)];
        applyEffects(choice.effects);
        log(choice.log, 'good');
        state.phase = 'day';
        closeOverlay();
        if (survivors() <= 0 || state.morale <= 0) { endGame('bad'); return; }
        render();
      };
    });
  }

  function applyEffects(effects) {
    for (const [k, v] of Object.entries(effects || {})) {
      if (k === 'addCard') addCardToHand(v);
      else if (k === 'removeSurvivor') removeSurvivor('事件');
      else if (k === 'wound') woundSurvivor('事件');
      else if (k === 'parts') {
        state.parts = clamp(state.parts + v, 0, 3);
        if (state.parts >= 3) ensureRadioCard();
      } else state[k] = Math.max(0, (state[k] || 0) + v);
    }
    state.morale = clamp(state.morale, 0, 100);
  }

  function checkRescue() {
    if (survivors() <= 0 || state.morale <= 0) return 'bad';
    if (hasCard('radio') && state.parts >= 3) return 'good';
    return 'neutral';
  }

  // ---------- end ----------
  function checkAchievements() {
    const fresh = [];
    for (const a of ACHIEVEMENTS) {
      if (profile.achievements[a.id]) continue;
      if (a.check()) {
        profile.achievements[a.id] = true;
        profile.embers += a.reward;
        fresh.push(a);
      }
    }
    return fresh;
  }

  function endGame(kind) {
    if (state.phase === 'end') return;
    state.endKind = kind;
    state.phase = 'end';
    state.score = state.day * 10 + survivors() * 12 + state.parts * 18 + boardCards().length * 4 + Math.round(state.morale) * 2 + (state.endless ? state.day * 4 : 0);
    state.best = Math.max(state.best || 0, state.score);

    profile.stats.bestDay = Math.max(profile.stats.bestDay || 0, state.day);
    profile.stats.bestScore = Math.max(profile.stats.bestScore || 0, state.score);
    profile.stats.scavenges = (profile.stats.scavenges || 0) + (state.runStats.scavenges || 0);
    if (kind === 'good') profile.stats.wins = (profile.stats.wins || 0) + 1;

    const embers = Math.max(8, Math.floor(state.score / 14) + (kind === 'good' ? 25 : 0) + (state.endless ? Math.floor(state.day / 2) : 0)) * (isDaily() ? 2 : 1);
    state.embersEarned = embers;
    profile.embers += embers;

    if (isDaily()) {
      const today = todayKey();
      const d = profile.daily;
      if (d.date !== today) {
        d.streak = d.lastDate === yesterdayKey() ? (d.streak || 1) + 1 : 1;
        d.date = today;
        d.best = 0;
      }
      d.best = Math.max(d.best || 0, state.score);
      d.lastDate = today;
    }

    const fresh = checkAchievements();
    profile.leaderboard.push({
      score: state.score, day: state.day, kind, leader: state.leader,
      mode: state.mode, date: todayKey()
    });
    profile.leaderboard.sort((a, b) => b.score - a.score);
    profile.leaderboard = profile.leaderboard.slice(0, 5);
    saveProfile();

    const rank = kind === 'good'
      ? (state.morale >= 70 && survivors() >= 4 ? 'S' : 'A')
      : kind === 'neutral' ? 'B' : 'C';
    const info = kind === 'good'
      ? { kicker: '救援到达', title: '电台响了', text: '第 15 天，救援队顺着信号找到了你们。火堆还亮着。' }
      : kind === 'neutral'
        ? { kicker: '第 15 天', title: '你活下来了', text: '救援没有来。但你们还在，火也还在。也许明天会有信号。' }
        : state.endless
          ? { kicker: '无尽结束', title: '寒夜吞没了营地', text: `你撑到了第 ${state.day} 天。火灭了，但记录还在。` }
          : { kicker: '营地失守', title: '火灭了', text: '最后一个人倒下时，雪把营地盖住了。' };

    overlay(`<div class="modal end-modal">
      <div class="kicker">${info.kicker}</div>
      <div class="end-rank rank-${rank}">${rank}</div>
      <h2>${info.title}</h2>
      <p>${info.text}</p>
      <div class="stats-grid">
        <div class="stat-box"><b>${state.day}</b><span>天数</span></div>
        <div class="stat-box"><b>${survivors()}</b><span>幸存者</span></div>
        <div class="stat-box"><b>${state.parts}/3</b><span>电台零件</span></div>
      </div>
      <div class="stats-grid">
        <div class="stat-box"><b>${state.score}</b><span>本局得分</span></div>
        <div class="stat-box"><b>${profile.stats.bestScore}</b><span>最佳</span></div>
        <div class="stat-box"><b>${hasCard('radio') ? '已建' : '未建'}</b><span>电台</span></div>
      </div>
      <div class="ember-reward">余烬 +${embers}${isDaily() ? ' · 今日双倍' : ''}${fresh.length ? ` · 成就 +${fresh.reduce((n, a) => n + a.reward, 0)}` : ''}</div>
      ${fresh.length ? `<div class="fresh-ach">${fresh.map(a => `<span>🏅 ${a.name}</span>`).join('')}</div>` : ''}
      <button class="primary" id="againBtn">再来一局</button>
      ${state.mode === 'standard' && kind !== 'bad' && survivors() > 0 ? '<button class="ghost" id="endlessBtn">继续撑 · 无尽</button>' : ''}
      <button class="ghost" id="homeBtn">回营地</button>
      <button class="ghost" id="shareBtn">复制战绩</button>
    </div>`);
    $('againBtn').onclick = () => startRun(state.mode, state.leader);
    $('homeBtn').onclick = () => showHome();
    $('shareBtn').onclick = () => copyText(`我在《末日卡牌堆·余烬》撑到第 ${state.day} 天，活下来 ${survivors()} 人，士气 ${Math.round(state.morale)}，得分 ${state.score}（${rank}）。你能撑到救援吗？`);
    if ($('endlessBtn')) $('endlessBtn').onclick = () => continueEndless();
    log(`本局结束：${info.title}。得分 ${state.score}，余烬 +${embers}。`, kind === 'good' ? 'good' : 'bad');
  }

  function continueEndless() {
    if (state.endless) return;
    state.mode = 'endless';
    state.endless = true;
    state.maxDay = 999;
    state.endKind = null;
    state.phase = 'day';
    state.day++;
    state.ap = 4;
    state.explored = false;
    state.tempDef = 0;
    state.scavengeTeam = [];
    state.board.forEach(c => {
      if (!c) return;
      c.away = false;
      if (c.wounded > 0) c.wounded -= (state.leader === 'medic' ? 2 : 1);
      if (c.wounded < 0) c.wounded = 0;
    });
    rollWeather();
    drawCards(2);
    closeOverlay();
    render();
    log(`无尽寒夜：第 ${state.day} 天。能撑多久？`, 'good');
    toast('无尽寒夜 · 继续');
    maybeEvent();
  }

  // ---------- home / meta ----------
  function previewDailyMod() {
    const r = mulberry32(hashString('ember-daily-' + todayKey()));
    return DAILY_MODS[Math.floor(r() * DAILY_MODS.length)];
  }

  function showHome() {
    state.phase = 'home';
    state.started = false;
    const dailyMod = previewDailyMod();
    const dailyBest = profile.daily.date === todayKey() ? (profile.daily.best || 0) : 0;
    const endlessOk = (profile.stats.wins || 0) > 0;
    const board = profile.leaderboard.slice(0, 3).map((x, i) =>
      `<div class="home-rank"><b>${i + 1}</b><span>${x.score}</span><em>${x.kind === 'good' ? '救援' : x.kind === 'neutral' ? '活下来' : '失守'} · ${x.leader || ''}</em></div>`
    ).join('');
    overlay(`<div class="modal home-modal">
      <div class="home-glow"></div>
      <div class="kicker">SURVIVAL CARD ROGUELIKE</div>
      <h2>末日卡牌堆 <span>余烬</span></h2>
      <p>15 天，一座营地，一堆牌。每一次重开，都会比上一次多一点东西。</p>
      <div class="home-stats">
        <div><b>${profile.embers}</b><span>余烬</span></div>
        <div><b>${profile.stats.bestScore || 0}</b><span>最佳得分</span></div>
        <div><b>${profile.stats.wins || 0}</b><span>救援次数</span></div>
        <div><b>${profile.daily.streak || 0}</b><span>连续挑战</span></div>
      </div>
      <button class="primary" id="homeStart">开始新的一局</button>
      <button class="ghost" id="homeDaily">今日挑战 · ${dailyMod.icon} ${dailyMod.name}<small>${dailyBest ? '今日最佳 ' + dailyBest : '今日还没打'}</small></button>
      <button class="ghost" id="homeEndless" ${endlessOk ? '' : 'disabled'}>无尽寒夜<small>${endlessOk ? '撑到死为止，冲最高分' : '通关一次后解锁'}</small></button>
      <div class="home-row">
        <button class="ghost" id="homeMeta">🔥 营地传承</button>
        <button class="ghost" id="homeAch">🏅 成就</button>
        <button class="ghost" id="homeHelp">玩法</button>
      </div>
      <div class="home-board">
        <div class="home-board-title">本地营地榜 <span>TOP 3</span></div>
        ${board || '<div class="home-empty">还没有记录。第一局就是你的。</div>'}
      </div>
    </div>`);
    $('homeStart').onclick = () => showLeaderSelect('standard');
    $('homeDaily').onclick = () => showLeaderSelect('daily');
    if ($('homeEndless')) $('homeEndless').onclick = () => { if (endlessOk) showLeaderSelect('endless'); };
    $('homeMeta').onclick = showMeta;
    $('homeAch').onclick = showAchievements;
    $('homeHelp').onclick = () => showTutorial(false);
  }

  function showLeaderSelect(mode) {
    state.mode = mode;
    state.phase = 'leader';
    if (!profile.leaders.includes(state.pendingLeader)) state.pendingLeader = profile.leaders[0];
    renderLeaderSelect();
  }

  function renderLeaderSelect() {
    const dailyMod = previewDailyMod();
    const modeLabel = state.mode === 'daily' ? `今日挑战 · ${dailyMod.icon} ${dailyMod.name}` : state.mode === 'endless' ? '无尽寒夜' : '新的一局';
    const modeDesc = state.mode === 'daily' ? dailyMod.desc : state.mode === 'endless' ? '没有第 15 天。夜袭会一直变强，撑到死为止。' : '撑到第 15 天，集齐零件，呼叫救援。';
    const cards = LEADERS.map(l => {
      const unlocked = profile.leaders.includes(l.id);
      const selected = state.pendingLeader === l.id;
      return `<button class="leader-card ${selected ? 'selected' : ''}" data-leader="${l.id}">
        <img src="assets/icons/${l.icon}.png" alt="">
        <b>${l.name}</b>
        <span>${l.desc}</span>
        <em>${unlocked ? (selected ? '已选择' : '选择') : `解锁 ${l.cost} 余烬`}</em>
      </button>`;
    }).join('');
    overlay(`<div class="modal">
      <div class="kicker">${modeLabel}</div>
      <h2>选一个领袖</h2>
      <p>${modeDesc}</p>
      <div class="leader-list">${cards}</div>
      <button class="primary" id="leaderStart">出发</button>
      <button class="ghost" id="leaderBack">回营地</button>
    </div>`);
    document.querySelectorAll('[data-leader]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.leader;
        const l = leaderById(id);
        if (!profile.leaders.includes(id)) {
          if (profile.embers < l.cost) { toast(`余烬不够：需要 ${l.cost}`); return; }
          profile.embers -= l.cost;
          profile.leaders.push(id);
          saveProfile();
          toast(`解锁 ${l.name}`);
        }
        state.pendingLeader = id;
        renderLeaderSelect();
      };
    });
    $('leaderStart').onclick = () => startRun(state.mode, state.pendingLeader);
    $('leaderBack').onclick = showHome;
  }

  function showMeta() {
    state.phase = 'meta';
    const rows = META_UPGRADES.map(u => {
      const level = profile.upgrades[u.id] || 0;
      const cost = metaCost(u);
      const maxed = level >= u.max;
      const can = !maxed && profile.embers >= cost;
      return `<div class="meta-row">
        <img src="assets/icons/${u.icon}.png" alt="">
        <div><b>${u.name} <em>Lv.${level}/${u.max}</em></b><span>${u.desc}</span></div>
        <button data-buy="${u.id}" ${can ? '' : 'disabled'}>${maxed ? '满级' : cost + ' 余烬'}</button>
      </div>`;
    }).join('');
    const leaderRows = LEADERS.map(l => {
      const ok = profile.leaders.includes(l.id);
      return `<div class="meta-row">
        <img src="assets/icons/${l.icon}.png" alt="">
        <div><b>${l.name}</b><span>${l.desc}</span></div>
        <button data-unlock="${l.id}" ${ok ? 'disabled' : ''}>${ok ? '已解锁' : l.cost + ' 余烬'}</button>
      </div>`;
    }).join('');
    overlay(`<div class="modal">
      <div class="kicker">营地传承 · 余烬 ${profile.embers}</div>
      <h2>把上一局带回来</h2>
      <p>余烬在每局结束后获得；买下的传承会永久生效。</p>
      <div class="meta-section">开局补给</div>
      <div class="meta-list">${rows}</div>
      <div class="meta-section">领袖</div>
      <div class="meta-list">${leaderRows}</div>
      <button class="ghost" id="metaBack">回营地</button>
    </div>`);
    document.querySelectorAll('[data-buy]').forEach(btn => {
      btn.onclick = () => buyMeta(btn.dataset.buy);
    });
    document.querySelectorAll('[data-unlock]').forEach(btn => {
      btn.onclick = () => {
        const l = leaderById(btn.dataset.unlock);
        if (profile.leaders.includes(l.id)) return;
        if (profile.embers < l.cost) { toast(`余烬不够：需要 ${l.cost}`); return; }
        profile.embers -= l.cost;
        profile.leaders.push(l.id);
        saveProfile();
        toast(`解锁 ${l.name}`);
        showMeta();
      };
    });
    $('metaBack').onclick = showHome;
  }

  function buyMeta(id) {
    const u = META_UPGRADES.find(x => x.id === id);
    if (!u) return;
    const level = profile.upgrades[id] || 0;
    if (level >= u.max) return;
    const cost = metaCost(u);
    if (profile.embers < cost) { toast(`余烬不够：需要 ${cost}`); return; }
    profile.embers -= cost;
    profile.upgrades[id] = level + 1;
    saveProfile();
    toast(`${u.name} 升到 Lv.${level + 1}`);
    showMeta();
  }

  function showAchievements() {
    state.phase = 'ach';
    const rows = ACHIEVEMENTS.map(a => {
      const ok = !!profile.achievements[a.id];
      return `<div class="ach-row ${ok ? 'unlocked' : ''}">
        <div class="ach-icon">${ok ? '🏅' : '🔒'}</div>
        <div><b>${a.name}</b><span>${a.desc}</span></div>
        <em>+${a.reward} 余烬</em>
      </div>`;
    }).join('');
    overlay(`<div class="modal">
      <div class="kicker">成就 · 已解锁 ${Object.keys(profile.achievements).length}/${ACHIEVEMENTS.length}</div>
      <h2>下一局想做什么</h2>
      <p>成就自动结算，给余烬，也给下一局多一点目标。</p>
      <div class="ach-list">${rows}</div>
      <button class="ghost" id="achBack">回营地</button>
    </div>`);
    $('achBack').onclick = showHome;
  }

  // ---------- tutorial / overlay ----------
  function showTutorial(first = false) {
    overlay(`<div class="modal">
      <div class="kicker">SURVIVAL CARD GAME · 2.1</div>
      <h2>末日卡牌堆 <span>余烬</span></h2>
      <p>15 天，撑到救援。你只有一双手、一堆牌和一座快灭的火。</p>
      <ul>
        <li><b>打牌：</b>点手牌 → 点营地空位。要花行动点和资源。</li>
        <li><b>升级：</b>点营地牌 → 详情里升级。墙/塔/农场/篝火都能升 Lv.2-3。</li>
        <li><b>工坊：</b>花资源直接造牌；<b>行动：</b>加固、热汤、治疗、研究、空投。</li>
        <li><b>探索：</b>派 1-2 人出门，带回资源/卡牌，但今晚不防守，也可能受伤。</li>
        <li><b>过夜：</b>烧柴、生产、吃饭、挡夜袭；防御不够可牺牲牌或让人受伤。</li>
        <li><b>目标：</b>3 个电台零件 + 电台，撑到第 15 天。</li>
        <li><b>传承：</b>每局结束拿余烬，回营地买永久升级/解锁领袖。</li>
      </ul>
      <p style="font-size:9px;color:#8d9b8a;margin-top:4px">素材：Kenney Board Game Icons / Board Game Pack（CC0 1.0）</p>
      <button class="primary" id="startBtn">${first ? '开始' : '知道了'}</button>
    </div>`);
    $('startBtn').onclick = () => {
      closeOverlay();
      if (state.started) { state.phase = 'day'; render(); }
      else showHome();
    };
  }

  function overlay(html) {
    $('overlay').innerHTML = html;
    $('overlay').classList.remove('hidden');
  }
  function closeOverlay() {
    $('overlay').classList.add('hidden');
    $('overlay').innerHTML = '';
  }

  function copyText(text) {
    const done = () => toast('文案已复制');
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { toast('复制失败，请长按选择'); }
    document.body.removeChild(ta);
  }

  // ---------- setup ----------
  function resetGame(leader = state.leader, mode = state.mode) {
    uidCounter = 0;
    state.leader = leaderById(leader).id;
    state.mode = mode;
    state.endless = mode === 'endless';
    state.pendingLeader = state.leader;
    state.maxDay = state.endless ? 999 : 15;
    state.dailyMod = mode === 'daily' ? previewDailyMod() : null;
    runRng = mode === 'daily'
      ? mulberry32(hashString('ember-daily-' + todayKey()))
      : Math.random;
    state.day = 1;
    state.ap = 4;
    state.food = 8;
    state.wood = 10;
    state.metal = 4;
    state.medicine = 2;
    state.morale = 60;
    state.research = 0;
    state.parts = 0;
    state.weather = 'clear';
    state.tempDef = 0;
    state.fuelDiscount = profile.upgrades.fuel || 0;
    state.maxCardLevel = 1;
    state.endKind = null;
    state.embersEarned = 0;
    state.runStats = { scavenges: 0, upgrades: 0, crafts: 0, maxSurvivors: 0 };
    state.board = Array(12).fill(null);
    state.board[0] = makeCard('survivor');
    state.board[1] = makeCard('campfire');
    state.board[2] = makeCard('survivor');
    state.hand = ['wall', 'farm', 'scavenger', 'bow'].map(t => makeCard(t));
    state.deck = shuffle(START_DECK);
    state.discard = [];
    state.selectedHand = null;
    state.selectedBoard = null;
    state.explored = false;
    state.scavengeTeam = [];
    state.adUsed = false;
    state.phase = 'day';
    state.started = true;
    state.eventSeen = [];
    state.log = [];
    state.score = 0;
    state.firstPlay = false;
    state.firstCombine = false;
    state.firstUpgrade = false;
    state.best = profile.stats.bestScore || 0;

    // 营地传承
    const u = profile.upgrades;
    state.food += 2 * (u.supply || 0);
    state.wood += 2 * (u.wood || 0);
    state.metal += 1 * (u.metal || 0);
    state.medicine += 1 * (u.medicine || 0);
    state.morale = clamp(state.morale + 8 * (u.morale || 0), 0, 100);
    if (state.leader === 'medic') state.medicine += 1;
    if (state.leader === 'engineer') state.metal += 1;

    if (mode === 'daily' && state.dailyMod) {
      for (const [k, v] of Object.entries(state.dailyMod.start || {})) state[k] += v;
      if (state.dailyMod.morale) state.morale = clamp(state.morale + state.dailyMod.morale, 0, 100);
    }

    log('第 1 天。你们在废墟里点起篝火。');
    if (mode === 'daily') log(`今日挑战：${state.dailyMod.name}。${state.dailyMod.desc}。`, 'good');
    else if (mode === 'endless') log('无尽寒夜：没有第 15 天，只有能撑多久。', 'good');
    else log('目标：撑到第 15 天，集齐 3 个电台零件。');
    const leadData = leaderById(state.leader);
    log(`领袖：<b>${leadData.name}</b>。${leadData.desc}`);
  }

  function startRun(mode = 'standard', leader = state.leader) {
    resetGame(leader, mode);
    state.started = true;
    state.phase = 'day';
    closeOverlay();
    profile.stats.runs = (profile.stats.runs || 0) + 1;
    saveProfile();
    render();
    sound('place');
    if (mode === 'daily') toast(`今日挑战 · ${state.dailyMod.name}`);
    else if (mode === 'endless') toast('无尽寒夜开始');
  }

  function bind() {
    $('board').addEventListener('click', (e) => {
      const boardCard = e.target.closest('[data-board]');
      if (boardCard) {
        const idx = Number(boardCard.dataset.board);
        if (state.selectedHand !== null) { state.selectedHand = null; selectBoard(idx); return; }
        if (state.selectedBoard !== null && state.selectedBoard !== idx) { combineBoard(idx); return; }
        selectBoard(idx);
        return;
      }
      const slot = e.target.closest('[data-slot]');
      if (slot) playCard(Number(slot.dataset.slot));
    });
    $('hand').addEventListener('click', (e) => {
      const card = e.target.closest('[data-hand]');
      if (card) selectHand(Number(card.dataset.hand));
    });
    $('exploreBtn').onclick = showScavenge;
    $('workshopBtn').onclick = showWorkshop;
    $('opsBtn').onclick = showOps;
    $('endDayBtn').onclick = endDay;
    $('soundBtn').onclick = () => {
      state.sound = !state.sound;
      $('soundBtn').textContent = state.sound ? '🔊' : '🔇';
      toast(state.sound ? '声音开' : '声音关');
    };
    $('helpBtn').onclick = () => showTutorial(false);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !$('overlay').classList.contains('hidden')) {
        if (['scavenge', 'workshop', 'ops'].includes(state.phase)) {
          state.phase = 'day'; closeOverlay(); render();
        }
      }
    });
  }

  resetGame('scavenger', 'standard');
  state.phase = 'home';
  state.started = false;
  bind();
  render();
  showHome();

  window.__game = {
    state, profile, render, endDay, endGame, resetGame, getStats, startRun,
    maybeEvent, showBreach, showScavenge, showWorkshop, showOps,
    upgradeCard, chooseScavenge, doOp, showHome, showLeaderSelect,
    showMeta, showAchievements, continueEndless, checkAchievements
  };
})();










