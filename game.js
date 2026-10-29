/* 末日卡牌堆 · 余烬 — 单文件游戏逻辑 */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);

  // ---------- data ----------
  const ICON = {
    food: 'resource_apple',
    wood: 'resource_wood',
    metal: 'resource_iron',
    medicine: 'flask_full',
    parts: 'puzzle',
    def: 'shield',
    ap: 'hourglass',
    survivor: 'character',
    attack: 'skull'
  };

  const SURVIVOR_TYPES = ['survivor', 'scavenger', 'engineer', 'medic', 'hunter', 'cook', 'guard'];

  const CARD = {
    survivor: {
      name: '幸存者', icon: 'character', type: 'survivor', cost: { food: 1 }, def: 0, prod: {},
      desc: '每天吃 1 食物。最普通，也最不能少的人。', tags: ['人']
    },
    scavenger: {
      name: '拾荒者', icon: 'pouch', type: 'survivor', cost: { food: 1 }, def: 0, prod: { food: 1 },
      desc: '每天 +1 食物；探索时多带回 1 份资源。', tags: ['人', '采集']
    },
    engineer: {
      name: '工程师', icon: 'resource_planks', type: 'survivor', cost: { food: 1 }, def: 1, prod: { metal: 1 },
      desc: '每天 +1 金属；防御 +1；挨着工作台再 +1 金属。', tags: ['人', '工程']
    },
    medic: {
      name: '医生', icon: 'flask_full', type: 'survivor', cost: { food: 1 }, def: 0, prod: { medicine: 1 },
      desc: '每天 +1 药品；挨着庇护所再 +1 药品。', tags: ['人', '医疗']
    },
    hunter: {
      name: '猎人', icon: 'bow', type: 'survivor', cost: { food: 1 }, def: 1, prod: { food: 1 },
      desc: '每天 +1 食物；防御 +1；挨着哨塔再 +1 防御。', tags: ['人', '狩猎']
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
      desc: '防御 +1；厨师相邻时 +1 食物。营地的心脏。', tags: ['建筑', '火']
    },
    wall: {
      name: '木墙', icon: 'structure_wall', type: 'structure', cost: { wood: 2 }, def: 2, prod: {},
      desc: '防御 +2；两张木墙可以合成庇护所。', tags: ['建筑']
    },
    tower: {
      name: '哨塔', icon: 'structure_tower', type: 'structure', cost: { wood: 3, metal: 1 }, def: 3, prod: {},
      desc: '防御 +3；挨着木墙再 +1 防御；与木墙合成堡垒。', tags: ['建筑']
    },
    shelter: {
      name: '庇护所', icon: 'structure_house', type: 'structure', cost: { wood: 3 }, def: 2, prod: {},
      desc: '防御 +2；两张木墙合成。给营地一点像家的东西。', tags: ['建筑']
    },
    farm: {
      name: '农场', icon: 'structure_farm', type: 'structure', cost: { wood: 2 }, def: 0, prod: { food: 2 },
      desc: '每天 +2 食物；挨着集水器再 +1 食物。', tags: ['建筑', '生产']
    },
    raincatcher: {
      name: '集水器', icon: 'flask_full', type: 'structure', cost: { metal: 2 }, def: 0, prod: { food: 1 },
      desc: '每天 +1 食物；挨着农场再 +1 食物；与农场合成温室。', tags: ['建筑', '生产']
    },
    workbench: {
      name: '工作台', icon: 'resource_planks', type: 'structure', cost: { metal: 2 }, def: 0, prod: { metal: 1 },
      desc: '每天 +1 金属；挨着工程师再 +1 金属。', tags: ['建筑', '生产']
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
      desc: '需要 3 个零件；第 10 天呼叫救援。', tags: ['建筑', '救援']
    },

    fortress: {
      name: '堡垒', icon: 'structure_gate', type: 'structure', cost: {}, def: 5, prod: {},
      desc: '木墙 + 哨塔合成；防御 +5。', tags: ['建筑', '合成']
    },
    greenhouse: {
      name: '温室', icon: 'structure_farm', type: 'structure', cost: {}, def: 0, prod: { food: 3 },
      desc: '农场 + 集水器合成；每天 +3 食物。', tags: ['建筑', '合成']
    }
  };

  const RECIPES = [
    { a: 'wall', b: 'wall', out: 'shelter' },
    { a: 'wall', b: 'tower', out: 'fortress' },
    { a: 'survivor', b: 'bow', out: 'hunter' },
    { a: 'farm', b: 'raincatcher', out: 'greenhouse' }
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

  const START_DECK = [
    'wall', 'farm', 'tower', 'shelter', 'cook', 'hunter', 'raincatcher',
    'workbench', 'medic', 'guard', 'trap', 'engineer', 'survivor', 'bow', 'radio'
  ];

  const LOCATIONS = {
    radio: {
      name: '废弃电台', icon: 'structure_watchtower', tone: 'purple',
      desc: '铁塔还立着，控制室里有零件。',
      rewards: { parts: 1, metal: 1 },
      cards: ['engineer', 'tower', 'radio'],
      risk: 0.25, riskText: '塔上掉下碎石', penalty: { metal: -1 }
    },
    supermarket: {
      name: '超市废墟', icon: 'resource_apple', tone: 'green',
      desc: '货架倒了，但罐头还在。',
      rewards: { food: 3 },
      cards: ['cook', 'scavenger', 'survivor'],
      risk: 0.18, riskText: '踩到碎玻璃', penalty: { food: -1 }
    },
    hardware: {
      name: '五金店', icon: 'resource_wood', tone: 'blue',
      desc: '木头、钉子、还能用的工具。',
      rewards: { wood: 3, metal: 1 },
      cards: ['wall', 'tower', 'workbench'],
      risk: 0.18, riskText: '屋顶塌了一角', penalty: { wood: -1 }
    },
    hospital: {
      name: '医院', icon: 'flask_full', tone: 'green',
      desc: '药柜被翻过，但还有几盒。',
      rewards: { medicine: 1, food: 1 },
      cards: ['medic', 'survivor'],
      risk: 0.14, riskText: '走廊里有动静', penalty: { food: -1 }
    },
    gas: {
      name: '加油站', icon: 'resource_iron', tone: 'gold',
      desc: '油泵空了，金属零件还在。',
      rewards: { metal: 2, wood: 1 },
      cards: ['trap', 'bow', 'engineer'],
      risk: 0.18, riskText: '油味太浓，呛到了', penalty: { food: -1 }
    },
    shelter: {
      name: '避难所', icon: 'structure_house', tone: 'blue',
      desc: '门没锁，里面也许有人。',
      rewards: { food: -1 },
      cards: ['survivor', 'guard', 'shelter'],
      risk: 0.12, riskText: '里面的人不欢迎你', penalty: { medicine: -1 }
    }
  };

  const EVENTS = [
    {
      id: 'stranger', title: '门外有人', kicker: 'DAY EVENT',
      text: '一个裹着毯子的人站在门口，说他只要一口热的。',
      choices: [
        { label: '收留他', desc: '食物 -2；获得 1 张幸存者', effects: { food: -2, addCard: 'survivor' }, log: '你收留了一个陌生人。他成了营地的新人手。' },
        { label: '关门', desc: '木头 +2；不增加人口', effects: { wood: 2 }, log: '你关上了门。门外安静了很久。' }
      ]
    },
    {
      id: 'raiders', title: '掠夺者', kicker: 'DAY EVENT',
      text: '三个人影在营地外停下，手里有棍子和刀。他们想要“过路费”。',
      choices: [
        { label: '交粮', desc: '食物 -3；避免冲突', effects: { food: -3 }, log: '你交出了三份口粮。他们没有进来。' },
        { label: '拿起武器', desc: '木头 -2；守住营地', effects: { wood: -2 }, log: '你们守在火堆旁。对方看了一眼，走了。' }
      ]
    },
    {
      id: 'sick', title: '高烧', kicker: 'DAY EVENT',
      text: '有人开始咳血。药只够一个人，或者，把他隔离开。',
      choices: [
        { label: '用药', desc: '药品 -1；救回他', effects: { medicine: -1 }, log: '药打进去了。他退了烧。' },
        { label: '隔离', desc: '失去 1 名幸存者', effects: { removeSurvivor: true }, log: '你把他移到了冷库。没人说话。' }
      ]
    },
    {
      id: 'signal', title: '电台信号', kicker: 'DAY EVENT',
      text: '收音机里传来一段断续的呼号。修好它，也许能换来一个零件。',
      choices: [
        { label: '修天线', desc: '金属 -2；电台零件 +1', effects: { metal: -2, parts: 1 }, log: '你修好了天线。呼号清晰了一点。' },
        { label: '关掉收音机', desc: '食物 +2；保存体力', effects: { food: 2 }, log: '你关掉了收音机。营地安静得只剩风声。' }
      ]
    },
    {
      id: 'trader', title: '路过的商人', kicker: 'DAY EVENT',
      text: '一个推着车的商人愿意换东西。他的秤不太准，但你没得选。',
      choices: [
        { label: '用食物换金属', desc: '食物 -3；金属 +3', effects: { food: -3, metal: 3 }, log: '你换到了三块金属。商人走得很急。' },
        { label: '用金属换食物', desc: '金属 -3；食物 +3', effects: { metal: -3, food: 3 }, log: '你换到了三份食物。至少今晚不饿。' }
      ]
    }
  ];

  // ---------- state ----------
  let uid = 0;
  const state = {
    day: 1, maxDay: 10, ap: 3,
    food: 6, wood: 8, metal: 3, medicine: 1, parts: 0,
    board: Array(12).fill(null),
    hand: [], deck: [], discard: [],
    selectedHand: null, selectedBoard: null,
    explored: false, adUsed: false, sound: true,
    phase: 'tutorial', started: false,
    eventSeen: [], log: [], best: 0, score: 0,
    firstPlay: false, firstNight: false, firstCombine: false
  };

  const SOUND = {
    place: new Audio('assets/audio/cardPlace1.ogg'),
    slide: new Audio('assets/audio/cardSlide1.ogg'),
    combine: new Audio('assets/audio/chipsCollide1.ogg'),
    night: new Audio('assets/audio/dieThrow1.ogg')
  };
  Object.values(SOUND).forEach(a => { a.preload = 'auto'; a.volume = 0.35; });

  // ---------- helpers ----------
  function makeCard(type) { return { uid: ++uid, type }; }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function random(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function survivors() {
    return state.board.filter(c => c && SURVIVOR_TYPES.includes(c.type)).length;
  }
  function hasCard(type) {
    return state.board.some(c => c && c.type === type);
  }
  function boardCards() {
    return state.board.map((c, i) => c ? { ...c, slot: i } : null).filter(Boolean);
  }
  function attack() { return 2 + state.day; }
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
    el.style.left = (16 + Math.random() * 68) + '%';
    el.style.top = (30 + Math.random() * 35) + '%';
    $('floats').appendChild(el);
    setTimeout(() => el.remove(), 950);
  }
  function log(text, kind = '') {
    state.log.unshift({ text, kind });
    state.log = state.log.slice(0, 24);
  }

  // ---------- stats ----------
  function getStats() {
    const s = { def: 0, food: 0, wood: 0, metal: 0, medicine: 0 };
    const bonuses = {};
    const addBonus = (uid, stat, v, label) => {
      if (!bonuses[uid]) bonuses[uid] = [];
      bonuses[uid].push({ stat, v, label });
    };

    state.board.forEach(card => {
      if (!card) return;
      const d = CARD[card.type];
      s.def += d.def || 0;
      for (const [k, v] of Object.entries(d.prod || {})) s[k] += v;
    });

    // right/down only, so each pair is counted once
    const dirs = [[1, 0], [0, 1]];
    for (let i = 0; i < 12; i++) {
      const a = state.board[i];
      if (!a) continue;
      const x = i % 4, y = Math.floor(i / 4);
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (nx > 3 || ny > 2) continue;
        const j = ny * 4 + nx;
        const b = state.board[j];
        if (!b) continue;
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
    return Object.entries(cost).map(([k, v]) => `${v}${({ food: '食物', wood: '木', metal: '金属', medicine: '药' })[k] || k}`).join(' + ');
  }
  function prodText(prod) {
    const map = { food: '食', wood: '木', metal: '金', medicine: '药' };
    return Object.entries(prod || {}).map(([k, v]) => `+${v}${map[k] || k}`).join(' ');
  }
  function statIcons(type, stats) {
    const d = CARD[type];
    const parts = [];
    if (d.def) parts.push(`<span class="sicon"><img src="assets/icons/${ICON.def}.png" alt="">${d.def}</span>`);
    for (const [k, v] of Object.entries(d.prod || {})) {
      parts.push(`<span class="sicon"><img src="assets/icons/${ICON[k]}.png" alt="">${v}</span>`);
    }
    if (!parts.length) parts.push('<span class="sicon muted">—</span>');
    return parts.join('');
  }

  // ---------- render ----------
  function render() {
    const stats = getStats();
    renderHud(stats);
    renderBoard(stats);
    renderHand(stats);
    renderNight(stats);
    renderObjective();
    renderLog();
    renderDetail(stats);
    renderParts();
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
    $('exploreBtn').disabled = state.phase !== 'day' || state.ap < 1 || state.explored;
    $('endDayBtn').disabled = state.phase !== 'day';
    $('supplyBtn').disabled = state.adUsed || state.phase === 'end';
    $('logDay').textContent = `DAY ${state.day}`;
  }

  function cardClass(type) {
    const d = CARD[type];
    const cls = ['card', d.type];
    if (type === 'radio') cls.push('radio');
    if (d.tags && d.tags.includes('合成')) cls.push('special');
    return cls.join(' ');
  }

  function cardHtml(type, opts = {}) {
    const d = CARD[type];
    const cost = opts.hideCost ? '' : costHtml(d.cost);
    const bonuses = opts.bonuses || [];
    const bonus = bonuses.length ? `<span class="bonus">+${bonuses.reduce((n, b) => n + b.v, 0)}</span>` : '';
    const selected = opts.selected ? ' selected' : '';
    const unaffordable = opts.unaffordable ? ' unaffordable' : '';
    return `<button class="${cardClass(type)}${selected}${unaffordable}" ${opts.attr || ''}>
      ${cost ? `<span class="cost">${cost}</span>` : ''}
      <span class="type-dot"></span>
      <img class="icon" src="assets/icons/${d.icon}.png" alt="">
      <span class="name">${d.name}</span>
      <span class="stats">${statIcons(type)}</span>
      ${bonus}
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
          ${cardHtml(card.type, {
            attr: `data-board="${i}"`,
            hideCost: true,
            selected: state.selectedBoard === i,
            bonuses: bonus
          })}
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
    $('hand').innerHTML = state.hand.map(c => cardHtml(c.type, {
      attr: `data-hand="${c.uid}"`,
      selected: state.selectedHand === c.uid,
      unaffordable: !canAfford(CARD[c.type].cost)
    })).join('');
  }

  function renderNight(stats) {
    const atk = attack();
    const def = stats.s.def;
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
      : `还差 ${atk - def} 防御。夜里会破防，得牺牲一张牌。`;
  }

  function renderParts() {
    $('partsRow').innerHTML = [0, 1, 2].map(i =>
      `<div class="part ${i < state.parts ? 'filled' : ''}"><img src="assets/icons/${ICON.parts}.png" alt=""></div>`
    ).join('');
    const mini = $('partsMini');
    if (mini) mini.textContent = `${state.parts}/3`;
    $('radioState').textContent = hasCard('radio') ? '电台已建' : state.parts >= 3 ? '可建电台' : '未建电台';
  }

  function renderObjective() {
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
        const d = CARD[card.type];
        const bonuses = stats.bonuses[card.uid] || [];
        el.innerHTML = `<b>${d.name}</b> · ${d.type === 'survivor' ? '人' : d.type === 'structure' ? '建筑' : '道具'} · 费用 ${costText(d.cost)} · ${d.desc}${bonuses.length ? ` · 相邻加成：${bonuses.map(b => b.label + ' +' + b.v).join('，')}` : ''}`;
        return;
      }
    }
    if (state.selectedBoard !== null) {
      const card = state.board[state.selectedBoard];
      if (card) {
        const d = CARD[card.type];
        const bonuses = stats.bonuses[card.uid] || [];
        const recipe = RECIPES.filter(r => r.a === card.type || r.b === card.type)
          .map(r => `${CARD[r.a].name}+${CARD[r.b].name}=${CARD[r.out].name}`);
        el.innerHTML = `<b>${d.name}</b> · 防御 ${d.def || 0}${prodText(d.prod) ? ' · ' + prodText(d.prod) : ''} · ${d.desc}${bonuses.length ? ` · 相邻加成：${bonuses.map(b => b.label + ' +' + b.v).join('，')}` : ''}${recipe.length ? ` · 可合成：${recipe.join('；')}` : ''}`;
        return;
      }
    }
    el.textContent = '点一张手牌查看详情；点两张营地牌可以合成。';
  }

  // ---------- card actions ----------
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
    if (!state.firstPlay) { state.firstPlay = true; }
    if (card.type === 'radio') {
      log('电台建好了。只要零件够，第 10 天就能呼叫救援。', 'good');
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
    if (!state.firstCombine) state.firstCombine = true;
    render();
  }

  function openExplore() {
    if (state.phase !== 'day' || state.ap < 1 || state.explored) return;
    state.phase = 'explore';
    const keys = getLocationChoices();
    const html = keys.map(key => {
      const loc = LOCATIONS[key];
      const reward = Object.entries(loc.rewards || {}).map(([k, v]) => `${v > 0 ? '+' : ''}${v}${({food:'食',wood:'木',metal:'金',medicine:'药',parts:'零件'})[k]}`).join(' ');
      return `<button class="loc" data-loc="${key}">
        <img src="assets/icons/${loc.icon}.png" alt="">
        <b>${loc.name}</b>
        <span>${loc.desc}</span>
        <em class="reward">${reward}${loc.cards.length ? ' + 1 张牌' : ''}</em>
        <em>风险：${loc.riskText}</em>
      </button>`;
    }).join('');
    overlay(`<div class="modal">
      <div class="kicker">探索 · 1 AP</div>
      <h2>今天去哪？</h2>
      <p>每次探索都会带回资源，也可能带点麻烦。电台零件只能在废弃电台找到。</p>
      <div class="loc-grid">${html}</div>
      <button class="ghost" id="cancelExplore">留在营地</button>
    </div>`);
    document.querySelectorAll('[data-loc]').forEach(btn => {
      btn.onclick = () => chooseLocation(btn.dataset.loc);
    });
    $('cancelExplore').onclick = () => {
      state.phase = 'day';
      closeOverlay();
      render();
    };
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

  function chooseLocation(key) {
    const loc = LOCATIONS[key];
    if (!loc) return;
    state.ap--;
    state.explored = true;
    const scav = hasCard('scavenger');
    const rewards = { ...loc.rewards };
    if (scav) {
      for (const k of ['food', 'wood', 'metal']) if (rewards[k] > 0) rewards[k] += 1;
    }
    for (const [k, v] of Object.entries(rewards)) {
      if (k === 'parts') state.parts = clamp(state.parts + v, 0, 3);
      else state[k] = Math.max(0, state[k] + v);
    }
    const risk = Math.random() < loc.risk;
    if (risk) {
      for (const [k, v] of Object.entries(loc.penalty || {})) state[k] = Math.max(0, state[k] + v);
      log(`在<b>${loc.name}</b>遇到麻烦：${loc.riskText}。`, 'bad');
      toast(loc.riskText);
    } else {
      log(`探索<b>${loc.name}</b>：${Object.entries(rewards).map(([k, v]) => `${v > 0 ? '+' : ''}${v}${({food:'食',wood:'木',metal:'金',medicine:'药',parts:'零件'})[k]}`).join(' ')}。`, 'good');
    }
    const cardType = random(loc.cards);
    addCardToHand(cardType);
    if (state.parts >= 3) ensureRadioCard();
    state.phase = 'day';
    closeOverlay();
    render();
  }

  function hasRadioAvailable() {
    return hasCard('radio') ||
      state.hand.some(c => c.type === 'radio') ||
      state.deck.includes('radio') ||
      state.discard.includes('radio');
  }

  function ensureRadioCard() {
    if (state.parts < 3 || hasRadioAvailable()) return;
    state.hand.push(makeCard('radio'));
    log('你凑齐了零件，也找到了电台图纸。', 'good');
    toast('获得电台卡');
  }

  function addCardToHand(type) {
    if (state.hand.length >= 8) {
      state.discard.push(type);
      log(`手牌满了，<b>${CARD[type].name}</b>被放进弃牌堆。`, 'bad');
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
        } else {
          return;
        }
      }
      const type = state.deck.pop();
      if (state.hand.length >= 8) {
        state.discard.push(type);
        log(`手牌满了，<b>${CARD[type].name}</b>被放进弃牌堆。`, 'bad');
      } else {
        state.hand.push(makeCard(type));
      }
    }
  }

  // ---------- night / day ----------
  function endDay() {
    if (state.phase !== 'day') return;
    state.phase = 'night';
    const atk = attack();
    const def = getStats().s.def;
    sound('night');
    log(`第 ${state.day} 天结束。今夜袭击 ${atk}，营地防御 ${def}。`, def >= atk ? 'good' : 'bad');
    render();
    const html = `<div class="modal night-modal">
      <div class="kicker">NIGHT ${state.day}</div>
      <div class="night-skull">☠️</div>
      <h2>${def >= atk ? '防线守住了' : '防线被突破'}</h2>
      <p>${def >= atk ? '火堆还亮着。' : '它们冲进来了，你得丢下一点东西。'}</p>
      <div class="night-bars">
        <div class="night-bar attack"><span>袭击</span><div class="bar"><i style="width:${Math.min(100, atk / Math.max(atk, def, 1) * 100)}%"></i></div><b>${atk}</b></div>
        <div class="night-bar defense"><span>防御</span><div class="bar"><i style="width:${Math.min(100, def / Math.max(atk, def, 1) * 100)}%"></i></div><b>${def}</b></div>
      </div>
    </div>`;
    overlay(html);
    setTimeout(() => resolveNight(atk, def), 1150);
  }

  function resolveNight(atk, def) {
    if (state.phase !== 'night') return;
    const stats = getStats().s;
    const prodParts = [];
    for (const k of ['food', 'wood', 'metal', 'medicine']) {
      if (stats[k] > 0) prodParts.push(`+${stats[k]}${({food:'食',wood:'木',metal:'金',medicine:'药'})[k]}`);
    }
    if (prodParts.length) {
      state.food += stats.food;
      state.wood += stats.wood;
      state.metal += stats.metal;
      state.medicine += stats.medicine;
      log(`营地生产：${prodParts.join('，')}。`, 'good');
    }

    const pop = survivors();
    if (pop <= 0) {
      closeOverlay();
      endGame('bad');
      return;
    }
    if (state.food >= pop) {
      state.food -= pop;
      log(`晚饭：${pop} 个人吃掉 ${pop} 份食物。`);
    } else {
      state.food = 0;
      log('食物不够。有人没撑过今晚。', 'bad');
      removeSurvivor('饿死');
      if (survivors() <= 0) { closeOverlay(); endGame('bad'); return; }
    }

    if (def >= atk) {
      log('夜袭：防线守住了。', 'good');
      closeOverlay();
      setTimeout(advanceDay, 450);
      return;
    }

    closeOverlay();
    setTimeout(() => showBreach(atk, def), 250);
  }

  function showBreach(atk, def) {
    state.phase = 'breach';
    const cards = boardCards();
    if (!cards.length) {
      log('营地没有牌可挡。有人被拖走了。', 'bad');
      removeSurvivor('夜袭');
      if (survivors() <= 0) { endGame('bad'); return; }
      advanceDay();
      return;
    }
    const html = `<div class="modal">
      <div class="kicker">防线突破</div>
      <h2>丢下一张牌，保住其他人。</h2>
      <p>袭击 ${atk}，防御 ${def}。怪物冲进了营地，你必须牺牲一张营地牌。</p>
      <div class="breach-grid">
        ${cards.map(c => `<button class="breach-card" data-sacrifice="${c.slot}">
          <img src="assets/icons/${CARD[c.type].icon}.png" alt="">
          <b>${CARD[c.type].name}</b>
        </button>`).join('')}
      </div>
    </div>`;
    overlay(html);
    document.querySelectorAll('[data-sacrifice]').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.dataset.sacrifice);
        const card = state.board[idx];
        if (!card) return;
        state.board[idx] = null;
        state.selectedBoard = null;
        log(`夜袭：<b>${CARD[card.type].name}</b>被毁。`, 'bad');
        sound('combine');
        closeOverlay();
        if (survivors() <= 0) { endGame('bad'); return; }
        advanceDay();
      };
    });
  }

  function removeSurvivor(reason) {
    const idx = state.board.findIndex(c => c && SURVIVOR_TYPES.includes(c.type));
    if (idx < 0) return;
    const card = state.board[idx];
    state.board[idx] = null;
    log(`<b>${CARD[card.type].name}</b>倒下了（${reason}）。`, 'bad');
    toast(`${CARD[card.type].name}倒下了`);
  }

  function advanceDay() {
    if (state.phase === 'end') return;
    if (state.day >= state.maxDay) {
      endGame(checkRescue());
      return;
    }
    state.day++;
    state.ap = 3;
    state.explored = false;
    state.phase = 'day';
    state.selectedHand = null;
    state.selectedBoard = null;
    drawCards(2);
    render();
    toast(`第 ${state.day} 天`);
    maybeEvent();
  }

  function checkRescue() {
    if (survivors() <= 0) return 'bad';
    if (hasCard('radio') && state.parts >= 3) return 'good';
    return 'neutral';
  }

  function maybeEvent() {
    if (![3, 5, 7, 9].includes(state.day)) return;
    if (state.eventSeen.includes(state.day)) return;
    state.eventSeen.push(state.day);
    const ev = random(EVENTS);
    state.phase = 'event';
    const html = `<div class="modal">
      <div class="kicker">${ev.kicker} · DAY ${state.day}</div>
      <h2>${ev.title}</h2>
      <p>${ev.text}</p>
      <div class="choices">
        ${ev.choices.map((c, i) => `<button class="choice" data-event="${i}">
          <b>${c.label}</b><span>${c.desc}</span>
        </button>`).join('')}
      </div>
    </div>`;
    overlay(html);
    document.querySelectorAll('[data-event]').forEach(btn => {
      btn.onclick = () => {
        const choice = ev.choices[Number(btn.dataset.event)];
        applyEffects(choice.effects);
        log(choice.log, 'good');
        state.phase = 'day';
        closeOverlay();
        if (survivors() <= 0) { endGame('bad'); return; }
        render();
      };
    });
  }

  function applyEffects(effects) {
    for (const [k, v] of Object.entries(effects || {})) {
      if (k === 'addCard') addCardToHand(v);
      else if (k === 'removeSurvivor') removeSurvivor('事件');
      else if (k === 'parts') {
        state.parts = clamp(state.parts + v, 0, 3);
        if (state.parts >= 3) ensureRadioCard();
      }
      else state[k] = Math.max(0, (state[k] || 0) + v);
    }
  }

  // ---------- end ----------
  function endGame(kind) {
    if (state.phase === 'end') return;
    state.phase = 'end';
    state.score = state.day * 10 + survivors() * 12 + state.parts * 18 + boardCards().length * 4;
    state.best = Math.max(state.best || 0, state.score);
    try { localStorage.setItem('ember-camp-best', String(state.best)); } catch (e) {}
    const info = {
      good: { kicker: '救援到达', title: '电台响了', text: '第 10 天，救援队顺着信号找到了你们。火堆还亮着。' },
      neutral: { kicker: '第 10 天', title: '你活下来了', text: '救援没有来。但你们还在，火也还在。也许明天会有信号。' },
      bad: { kicker: '营地失守', title: '火灭了', text: '最后一个人倒下时，雪把营地盖住了。' }
    }[kind];
    const html = `<div class="modal">
      <div class="kicker">${info.kicker}</div>
      <h2>${info.title}</h2>
      <p>${info.text}</p>
      <div class="stats-grid">
        <div class="stat-box"><b>${state.day}</b><span>天数</span></div>
        <div class="stat-box"><b>${survivors()}</b><span>幸存者</span></div>
        <div class="stat-box"><b>${state.parts}/3</b><span>电台零件</span></div>
      </div>
      <div class="stats-grid">
        <div class="stat-box"><b>${state.score}</b><span>本局得分</span></div>
        <div class="stat-box"><b>${state.best}</b><span>最佳</span></div>
        <div class="stat-box"><b>${hasCard('radio') ? '已建' : '未建'}</b><span>电台</span></div>
      </div>
      <button class="primary" id="againBtn">再撑一次</button>
      <button class="ghost" id="shareBtn">复制战绩</button>
    </div>`;
    overlay(html);
    $('againBtn').onclick = () => { resetGame(); startRun(); };
    $('shareBtn').onclick = () => copyText(`我在《末日卡牌堆·余烬》撑到第 ${state.day} 天，活下来 ${survivors()} 人，得分 ${state.score}。你能撑到救援吗？`);
    log(`本局结束：${info.title}。得分 ${state.score}。`, kind === 'good' ? 'good' : 'bad');
  }

  // ---------- tutorial / supply ----------
  function showTutorial(first = false) {
    const html = `<div class="modal">
      <div class="kicker">SURVIVAL CARD GAME</div>
      <h2>末日卡牌堆 <span>余烬</span></h2>
      <p>10 天，撑到救援。你只有一双手、一堆牌和一座快灭的火。</p>
      <ul>
        <li><b>打牌：</b>点手牌 → 点营地空位。要花行动点和资源。</li>
        <li><b>合成：</b>点两张营地牌，例如木墙+木墙=庇护所。</li>
        <li><b>相邻加成：</b>篝火挨着厨师、农场挨着集水器，会多产出。</li>
        <li><b>过夜：</b>结束白天，生产、吃饭、挡夜袭。防御不够就要牺牲一张牌。</li>
        <li><b>目标：</b>集齐 3 个电台零件，建电台，撑到第 10 天。</li>
      </ul>
      <p style="font-size:9px;color:#8d9b8a;margin-top:4px">素材：Kenney Board Game Icons / Board Game Pack（CC0 1.0）</p>
      <button class="primary" id="startBtn">${first ? '点燃篝火' : '继续'}</button>
    </div>`;
    overlay(html);
    $('startBtn').onclick = () => {
      closeOverlay();
      if (first) startRun();
      else { state.phase = state.started ? 'day' : 'tutorial'; render(); }
    };
  }

  function showSupply() {
    if (state.adUsed || state.phase === 'end') return;
    let left = 3;
    overlay(`<div class="modal">
      <div class="kicker">模拟广告 · 3 秒</div>
      <h2>空投补给</h2>
      <p>看完领取：食物 +2、木头 +2、金属 +1。每局一次。</p>
      <div class="ad-box" style="height:120px;border-radius:12px;background:linear-gradient(135deg,#166534,#ca8a04 55%,#b45309);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;margin:10px 0">补给箱<br><span style="font-size:10px">SUPPLY DROP</span></div>
      <div id="adCount" style="text-align:center;font-size:11px;color:#b9c9b0">${left} 秒后可领取</div>
      <button class="ghost" id="skipAd">跳过（无奖励）</button>
    </div>`);
    $('skipAd').onclick = () => { clearInterval(timer); closeOverlay(); render(); toast('已跳过广告'); };
    const timer = setInterval(() => {
      left--;
      const el = $('adCount');
      if (el) el.textContent = left > 0 ? `${left} 秒后可领取` : '广告播放完毕';
      if (left <= 0) {
        clearInterval(timer);
        overlay(`<div class="modal">
          <div class="kicker">补给到了</div>
          <h2>+2 食物 +2 木头 +1 金属</h2>
          <p>省着点用。第 10 天之前，电台比什么都重要。</p>
          <button class="primary" id="claimAd">领取补给</button>
        </div>`);
        $('claimAd').onclick = () => {
          state.adUsed = true;
          state.food += 2; state.wood += 2; state.metal += 1;
          log('空投补给：食物 +2，木头 +2，金属 +1。', 'good');
          closeOverlay();
          render();
        };
      }
    }, 1000);
  }

  // ---------- overlay ----------
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

  // ---------- game setup ----------
  function resetGame() {
    uid = 0;
    state.day = 1;
    state.ap = 3;
    state.food = 6;
    state.wood = 8;
    state.metal = 3;
    state.medicine = 1;
    state.parts = 0;
    state.board = Array(12).fill(null);
    state.board[1] = makeCard('survivor');
    state.board[2] = makeCard('campfire');
    state.board[3] = makeCard('survivor');
    state.hand = ['wall', 'farm', 'scavenger', 'bow'].map(makeCard);
    state.deck = shuffle(START_DECK);
    state.discard = [];
    state.selectedHand = null;
    state.selectedBoard = null;
    state.explored = false;
    state.adUsed = false;
    state.phase = 'day';
    state.started = true;
    state.eventSeen = [];
    state.log = [];
    state.score = 0;
    state.firstPlay = false;
    state.firstNight = false;
    state.firstCombine = false;
    try {
      const b = Number(localStorage.getItem('ember-camp-best') || 0);
      state.best = Number.isFinite(b) ? b : 0;
    } catch (e) { state.best = 0; }
    log('第 1 天。你们在废墟里点起篝火。');
    log('目标：撑到第 10 天，集齐 3 个电台零件。');
  }

  function startRun() {
    state.started = true;
    state.phase = 'day';
    closeOverlay();
    render();
    sound('place');
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
    $('exploreBtn').onclick = openExplore;
    $('endDayBtn').onclick = endDay;
    $('supplyBtn').onclick = showSupply;
    $('soundBtn').onclick = () => {
      state.sound = !state.sound;
      $('soundBtn').textContent = state.sound ? '🔊' : '🔇';
      toast(state.sound ? '声音开' : '声音关');
    };
    $('helpBtn').onclick = () => showTutorial(false);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!$('overlay').classList.contains('hidden') && state.phase === 'explore') {
          state.phase = 'day'; closeOverlay(); render();
        }
      }
    });
  }

  // ---------- boot ----------
  resetGame();
  state.phase = 'tutorial';
  state.started = false;
  bind();
  render();
  showTutorial(true);

  // test hook
  window.__game = {
    state,
    render,
    endDay,
    endGame,
    resetGame,
    getStats,
    startRun,
    maybeEvent,
    showBreach,
    openExplore
  };
})();

