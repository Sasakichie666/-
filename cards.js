// cards.js
// ============================================================
// 牌库定义、配对规则、组合检测等核心数据与逻辑
// 所有函数均为纯函数，不依赖游戏状态，可独立使用
// ============================================================

'use strict';

// ---------- 牌库定义 ----------
const CARD_DEFS = [
    { id: 'm01_hana_01', name: '松', month: 1, types: ['hana'], icon: '🌲', season: 'winter' },
    { id: 'm01_hana_02', name: '松', month: 1, types: ['hana'], icon: '🌲', season: 'winter' },
    { id: 'm01_kemono', name: '鹤', month: 1, types: ['kemono'], icon: '🦩', season: 'winter' },
    { id: 'm02_hana_01', name: '梅', month: 2, types: ['hana'], icon: '🌸', season: 'spring' },
    { id: 'm02_hana_02', name: '梅', month: 2, types: ['hana'], icon: '🌸', season: 'spring' },
    { id: 'm02_kemono', name: '莺', month: 2, types: ['kemono'], icon: '🐦', season: 'spring' },
    { id: 'm03_hana_01', name: '樱', month: 3, types: ['hana'], icon: '💮', season: 'spring' },
    { id: 'm03_hana_02', name: '樱', month: 3, types: ['hana'], icon: '💮', season: 'spring' },
    { id: 'm03_mono', name: '樱下幕', month: 3, types: ['mono', 'kei'], icon: '🎪', season: 'spring' },
    { id: 'm04_hana_01', name: '藤', month: 4, types: ['hana'], icon: '🪻', season: 'spring' },
    { id: 'm04_hana_02', name: '藤', month: 4, types: ['hana'], icon: '🪻', season: 'spring' },
    { id: 'm04_kemono', name: '杜鹃', month: 4, types: ['kemono'], icon: '🕊️', season: 'summer' },
    { id: 'm05_hana_01', name: '菖', month: 5, types: ['hana'], icon: '🌿', season: 'summer' },
    { id: 'm05_hana_02', name: '菖', month: 5, types: ['hana'], icon: '🌿', season: 'summer' },
    { id: 'm05_mono_01', name: '八桥', month: 5, types: ['mono'], icon: '🌉', season: 'summer' },
    { id: 'm05_ame', name: '五月雨', month: 5, types: ['mono', 'kei'], icon: '🌧️', season: 'summer' },
    { id: 'm06_hana_01', name: '牡丹', month: 6, types: ['hana'], icon: '🏵️', season: 'summer' },
    { id: 'm06_hana_02', name: '牡丹', month: 6, types: ['hana'], icon: '🏵️', season: 'summer' },
    { id: 'm06_kemono', name: '蝶', month: 6, types: ['kemono'], icon: '🦋', season: 'summer' },
    { id: 'm07_hana_01', name: '萩', month: 7, types: ['hana'], icon: '🌾', season: 'summer' },
    { id: 'm07_hana_02', name: '萩', month: 7, types: ['hana'], icon: '🌾', season: 'summer' },
    { id: 'm07_kemono', name: '猪', month: 7, types: ['kemono'], icon: '🐗', season: 'autumn' },
    { id: 'm08_hana_01', name: '芒', month: 8, types: ['hana'], icon: '🌾', season: 'autumn' },
    { id: 'm08_hana_02', name: '芒', month: 8, types: ['hana'], icon: '🌾', season: 'autumn' },
    { id: 'm08_kemono', name: '雁', month: 8, types: ['kemono'], icon: '🪿', season: 'autumn' },
    { id: 'm08_mono', name: '满月', month: 8, types: ['mono', 'kei'], icon: '🌕', season: 'autumn' },
    { id: 'm09_hana_01', name: '菊', month: 9, types: ['hana'], icon: '🌼', season: 'autumn' },
    { id: 'm09_hana_02', name: '菊', month: 9, types: ['hana'], icon: '🌼', season: 'autumn' },
    { id: 'm09_mono', name: '酒', month: 9, types: ['mono'], icon: '🍶', season: 'autumn' },
    { id: 'm10_hana_01', name: '红叶', month: 10, types: ['hana'], icon: '🍁', season: 'autumn' },
    { id: 'm10_hana_02', name: '红叶', month: 10, types: ['hana'], icon: '🍁', season: 'autumn' },
    { id: 'm10_kemono', name: '鹿', month: 10, types: ['kemono'], icon: '🦌', season: 'winter' },
    { id: 'm11_hana_01', name: '柳', month: 11, types: ['hana'], icon: '🌿', season: 'winter' },
    { id: 'm11_hana_02', name: '柳', month: 11, types: ['hana'], icon: '🌿', season: 'winter' },
    { id: 'm11_kemono', name: '燕', month: 11, types: ['kemono'], icon: '🐦', season: 'winter' },
    { id: 'm12_hana_01', name: '桐', month: 12, types: ['hana'], icon: '🌳', season: 'winter' },
    { id: 'm12_hana_02', name: '桐', month: 12, types: ['hana'], icon: '🌳', season: 'winter' },
    { id: 'm12_kemono', name: '凤', month: 12, types: ['kemono'], icon: '🦚', season: 'winter' },
    { id: 'tanzaku_spring', name: '春·歌', month: 0, types: ['bun'], icon: '📜', season: 'spring' },
    { id: 'tanzaku_summer', name: '夏·句', month: 0, types: ['bun'], icon: '📜', season: 'summer' },
    { id: 'tanzaku_autumn', name: '秋·吟', month: 0, types: ['bun'], icon: '📜', season: 'autumn' },
    { id: 'tanzaku_winter', name: '冬·诗', month: 0, types: ['bun'], icon: '📜', season: 'winter' },
    // 玩具牌
    { id: 'toy_crane_01', name: '千纸鹤', month: 0, types: ['mono'], icon: '🪈' },
    { id: 'toy_cat_01', name: '招财猫', month: 0, types: ['mono'], icon: '🐱' },
    { id: 'toy_daruma_01', name: '达摩', month: 0, types: ['asobi', 'mono'], icon: '🎎' },
    { id: 'toy_dog_01', name: '犬张子', month: 0, types: ['asobi', 'mono'], icon: '🐶' },
    // 新增玩物牌
    { id: 'temari', name: '手鞠', month: 0, types: ['asobi', 'mono'], icon: '⚽' },
    { id: 'hagoita', name: '羽子板', month: 0, types: ['asobi', 'mono'], icon: '🏸' },
    { id: 'komainu', name: '狛犬', month: 0, types: ['mono'], icon: '🦁' },
    { id: 'kakejiku_01', name: '挂轴', month: 0, types: ['bun', 'mono'], icon: '🖼️' },
    { id: 'koi', name: '鲤', month: 0, types: ['kemono'], icon: '🐟' },
    { id: 'kingyo', name: '金鱼', month: 0, types: ['kemono'], icon: '🐠' },
    { id: 'hotaru', name: '萤', month: 0, types: ['kemono'], icon: '🪲' },
    { id: 'furin', name: '风铃', month: 0, types: ['mono'], icon: '🎐' },
    // 原有其他牌
    { id: 'mask_noh', name: '能面', month: 0, types: ['men', 'mono'], icon: '🎭' },
    { id: 'mask_oni', name: '鬼面', month: 0, types: ['men', 'mono'], icon: '👹', pairAny: true },
    { id: 'mask_kitsune', name: '狐面', month: 0, types: ['men', 'mono'], icon: '🦊' },
    { id: 'mask_tengu', name: '天狗面', month: 0, types: ['men', 'mono'], icon: '👺' },
    { id: 'shrine_torii', name: '鸟居', month: 0, types: ['mono', 'kei'], icon: '⛩️' },
    { id: 'shrine_ema', name: '绘马', month: 0, types: ['mono'], icon: '🪵' },
    { id: 'shrine_omamori', name: '御守', month: 0, types: ['mono'], icon: '🎀' },
    { id: 'shrine_lantern', name: '灯笼', month: 0, types: ['mono'], icon: '🏮' },
    { id: 'oiran_oiran_01', name: '花魁', month: 0, types: ['special'], icon: '👘', isOiran: true },
    { id: 'oiran_umbrella', name: '伞', month: 0, types: ['mono'], icon: '☂️' },
    { id: 'oiran_geta', name: '木屐', month: 0, types: ['mono'], icon: '👡' },
    { id: 'oiran_fan', name: '折扇', month: 0, types: ['mono'], icon: '🪭' },
    { id: 'garden_lantern', name: '石灯笼', month: 0, types: ['mono'], icon: '🪨' },
    { id: 'garden_pond', name: '池塘', month: 0, types: ['mono'], icon: '🌊' },
    { id: 'inner_bonsai_01', name: '盆栽', month: 0, types: ['hana', 'mono'], icon: '🪴' },
    { id: 'inner_armor', name: '大铠', month: 0, types: ['mono'], icon: '🛡️' },
    { id: 'inner_screen', name: '屏风', month: 0, types: ['mono'], icon: '🖼️' },
    { id: 'special_bamboo', name: '竹', month: 0, types: ['hana'], icon: '🎋' },
    { id: 'special_orchid', name: '兰', month: 0, types: ['hana'], icon: '🌺' },
    // ---- 先前新增牌 ----
    { id: 'yukata', name: '浴衣', month: 0, types: ['mono'], icon: '👘' },
    { id: 'uchiwa', name: '团扇', month: 0, types: ['mono'], icon: '🪭' },
    { id: 'hanabi', name: '花火', month: 0, types: ['mono', 'kei'], icon: '🎇' },
    { id: 'koto', name: '琴', month: 0, types: ['mono'], icon: '🪕' },
    { id: 'yokku', name: '祝句', month: 0, types: ['bun'], icon: '📜', season: null },
    { id: 'tsuzumi', name: '鼓', month: 0, types: ['mono'], icon: '🥁' },
    { id: 'kanagawa', name: '神奈川', month: 0, types: ['mono', 'kei'], icon: '🌊' },
    { id: 'fune', name: '舟', month: 0, types: ['mono'], icon: '🚢' },
    { id: 'kaze', name: '风', month: 0, types: ['mono', 'kei'], icon: '🍃' },
    { id: 'yuki', name: '雪', month: 0, types: ['mono', 'kei'], icon: '❄️' },
    { id: 'fuji', name: '富士山', month: 0, types: ['mono', 'kei'], icon: '🗻' },
    { id: 'hi', name: '日', month: 0, types: ['mono', 'kei'], icon: '☀️' },
    { id: 'fue', name: '笛', month: 0, types: ['mono'], icon: '🎶' },

    // ===== 复数存在的牌（第二张） =====
    { id: 'toy_daruma_02', name: '达摩', month: 0, types: ['asobi', 'mono'], icon: '🎎' },
    { id: 'oiran_oiran_02', name: '花魁', month: 0, types: ['special'], icon: '👘', isOiran: true },
    { id: 'kakejiku_02', name: '挂轴', month: 0, types: ['bun', 'mono'], icon: '🖼️' },
    { id: 'inner_bonsai_02', name: '盆栽', month: 0, types: ['hana', 'mono'], icon: '🪴' },
];

// ---------- 工具函数 ----------

function getCardDef(id) {
    return CARD_DEFS.find(c => c.id === id);
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function initDeck() {
    return shuffle(CARD_DEFS.map(c => c.id));
}

// ---------- 配对规则 ----------

function canPair(a, b) {
    if (a === b) return false;
    const da = getCardDef(a);
    const db = getCardDef(b);
    if (!da || !db) return false;
    if (da.name === db.name) return false;
    if (da.isOiran || db.isOiran || da.pairAny || db.pairAny) return true;
    if (da.month > 0 && db.month > 0 && da.month === db.month) return true;
    for (const ta of da.types) {
        for (const tb of db.types) {
            if (ta === tb) return true;
        }
    }
    if (da.types.includes('bun') && db.types.includes('hana') && da.season && db.season === da.season && db.month > 0) return true;
    if (db.types.includes('bun') && da.types.includes('hana') && db.season && da.season === db.season && da.month > 0) return true;
    return false;
}

// ---------- 组合检测 ----------

function detectCombos(cardIds) {
    const cardSet = new Set(cardIds);
    const has = id => cardSet.has(id);
    const hasName = name => {
        for (const id of cardSet) {
            const def = getCardDef(id);
            if (def && def.name === name) return true;
        }
        return false;
    };
    const defs = cardIds.map(id => getCardDef(id)).filter(Boolean);

    // 月份分组
    const monthGroups = {};
    defs.forEach(d => {
        if (d.month > 0) {
            if (!monthGroups[d.month]) monthGroups[d.month] = { hana: [], kemono: [], mono: [] };
            if (d.types.includes('hana')) monthGroups[d.month].hana.push(d.id);
            if (d.types.includes('kemono')) monthGroups[d.month].kemono.push(d.id);
            if (d.types.includes('mono')) monthGroups[d.month].mono.push(d.id);
        }
    });

    const rawCombos = [];

    // 月份花兽、花物
    for (const [m, grp] of Object.entries(monthGroups)) {
        for (const hid of grp.hana) for (const kid of grp.kemono) if (has(hid) && has(kid)) rawCombos.push({ name: `${m}月花兽`, score: 1, cards: [hid, kid] });
        for (const hid of grp.hana) for (const mid of grp.mono) if (has(hid) && has(mid)) rawCombos.push({ name: `${m}月花物`, score: 1, cards: [hid, mid] });
        if (parseInt(m) === 8 && has('m08_mono') && has('m08_kemono')) rawCombos.push({ name: '月下雁', score: 1, cards: ['m08_mono', 'm08_kemono'] });
    }

    // 十二花
    const monthsWithHana = new Set();
    defs.forEach(d => { if (d.types.includes('hana') && d.month > 0) monthsWithHana.add(d.month); });
    if (monthsWithHana.size >= 12) rawCombos.push({ name: '十二花', score: 2, cards: [] });

    // 六花、六物、六兽、六景
    const uniqHana = new Set(defs.filter(d => d.types.includes('hana')).map(d => d.name));
    if (uniqHana.size >= 6) rawCombos.push({ name: '六花', score: 1, cards: [] });

    const uniqMono = new Set(defs.filter(d => d.types.includes('mono') && !d.types.includes('kei')).map(d => d.name));
    if (uniqMono.size >= 6) rawCombos.push({ name: '六物', score: 1, cards: [] });

    const uniqKemono = new Set(defs.filter(d => d.types.includes('kemono')).map(d => d.name));
    if (uniqKemono.size >= 6) rawCombos.push({ name: '六兽', score: 2, cards: [] });

    const uniqKei = new Set(defs.filter(d => d.types.includes('kei')).map(d => d.name));
    if (uniqKei.size >= 6) rawCombos.push({ name: '六景', score: 1, cards: [] });

    // 四季册
    const tanzaku = ['tanzaku_spring', 'tanzaku_summer', 'tanzaku_autumn', 'tanzaku_winter'];
    if (tanzaku.every(has)) rawCombos.push({ name: '四季册', score: 4, cards: tanzaku });

    // 四玩具
    if (has('toy_dog_01') && has('temari') && hasName('达摩') && has('hagoita')) {
        rawCombos.push({ name: '四玩具', score: 3, cards: ['toy_dog_01', 'temari', 'toy_daruma_01', 'hagoita'] });
    }

    // 神社初诣
    if (has('shrine_torii') && has('komainu') && has('shrine_lantern') && has('shrine_ema')) {
        rawCombos.push({ name: '神社初诣', score: 4, cards: ['shrine_torii', 'komainu', 'shrine_lantern', 'shrine_ema'] });
    }

    // 花魁道中
    if (hasName('花魁') && has('oiran_umbrella') && has('oiran_geta') && has('oiran_fan')) {
        rawCombos.push({ name: '花魁道中', score: 6, cards: ['oiran_oiran_01', 'oiran_umbrella', 'oiran_geta', 'oiran_fan'] });
    }

    // 外庭
    if (has('garden_lantern') && has('garden_pond') && (has('m01_hana_01') || has('m01_hana_02')))
        rawCombos.push({ name: '外庭', score: 3, cards: ['garden_lantern', 'garden_pond', has('m01_hana_01') ? 'm01_hana_01' : 'm01_hana_02'] });

    // 内室
    if (hasName('盆栽') && has('inner_armor') && has('inner_screen')) {
        rawCombos.push({ name: '内室', score: 3, cards: ['inner_bonsai_01', 'inner_armor', 'inner_screen'] });
    }

    // 狐面+鸟居 等
    if (has('mask_kitsune') && has('shrine_torii')) rawCombos.push({ name: '狐面+鸟居', score: 2, cards: ['mask_kitsune', 'shrine_torii'] });
    if (has('mask_noh') && has('oiran_fan')) rawCombos.push({ name: '能面+折扇', score: 2, cards: ['mask_noh', 'oiran_fan'] });
    if (has('m09_mono') && has('m03_mono')) rawCombos.push({ name: '酒+樱下幕', score: 2, cards: ['m09_mono', 'm03_mono'] });
    if (has('m08_mono') && has('m03_mono')) rawCombos.push({ name: '月+樱下幕', score: 2, cards: ['m08_mono', 'm03_mono'] });

    // 季节花
    const springFlowers = ['m02_hana_01','m02_hana_02','m03_hana_01','m03_hana_02','m04_hana_01','m04_hana_02'];
    const summerFlowers = ['m05_hana_01','m05_hana_02','m06_hana_01','m06_hana_02','m07_hana_01','m07_hana_02'];
    const autumnFlowers = ['m08_hana_01','m08_hana_02','m09_hana_01','m09_hana_02','m10_hana_01','m10_hana_02'];
    const winterFlowers = ['m11_hana_01','m11_hana_02','m12_hana_01','m12_hana_02','m01_hana_01','m01_hana_02'];

    const hasSpring = (has('m02_hana_01')||has('m02_hana_02')) && (has('m03_hana_01')||has('m03_hana_02')) && (has('m04_hana_01')||has('m04_hana_02'));
    const hasSummer = (has('m05_hana_01')||has('m05_hana_02')) && (has('m06_hana_01')||has('m06_hana_02')) && (has('m07_hana_01')||has('m07_hana_02'));
    const hasAutumn = (has('m08_hana_01')||has('m08_hana_02')) && (has('m09_hana_01')||has('m09_hana_02')) && (has('m10_hana_01')||has('m10_hana_02'));
    const hasWinter = (has('m11_hana_01')||has('m11_hana_02')) && (has('m12_hana_01')||has('m12_hana_02')) && (has('m01_hana_01')||has('m01_hana_02'));

    if (hasSpring) {
        const cards = defs.filter(d => springFlowers.includes(d.id)).map(d => d.id);
        rawCombos.push({ name: '春花', score: 2, cards });
        if (has('tanzaku_spring')) rawCombos.push({ name: '春花+春·歌', score: 2, cards: [...cards, 'tanzaku_spring'] });
    }
    if (hasSummer) {
        const cards = defs.filter(d => summerFlowers.includes(d.id)).map(d => d.id);
        rawCombos.push({ name: '夏花', score: 2, cards });
        if (has('tanzaku_summer')) rawCombos.push({ name: '夏花+夏·句', score: 2, cards: [...cards, 'tanzaku_summer'] });
    }
    if (hasAutumn) {
        const cards = defs.filter(d => autumnFlowers.includes(d.id)).map(d => d.id);
        rawCombos.push({ name: '秋花', score: 2, cards });
        if (has('tanzaku_autumn')) rawCombos.push({ name: '秋花+秋·吟', score: 2, cards: [...cards, 'tanzaku_autumn'] });
    }
    if (hasWinter) {
        const cards = defs.filter(d => winterFlowers.includes(d.id)).map(d => d.id);
        rawCombos.push({ name: '冬花', score: 2, cards });
        if (has('tanzaku_winter')) rawCombos.push({ name: '冬花+冬·诗', score: 2, cards: [...cards, 'tanzaku_winter'] });
    }
    if (hasSpring && hasSummer) {
        const cards = [...defs.filter(d => springFlowers.includes(d.id)), ...defs.filter(d => summerFlowers.includes(d.id))].map(d => d.id);
        rawCombos.push({ name: '春夏相连', score: 3, cards });
    }
    if (hasAutumn && hasWinter) {
        const cards = [...defs.filter(d => autumnFlowers.includes(d.id)), ...defs.filter(d => winterFlowers.includes(d.id))].map(d => d.id);
        rawCombos.push({ name: '秋冬相连', score: 3, cards });
    }

    // 对酒当歌（修正：cards 包含酒和所有四季文牌，确保任意文牌点击都能显示）
    if (has('m09_mono') && (has('tanzaku_spring') || has('tanzaku_summer') || has('tanzaku_autumn') || has('tanzaku_winter'))) {
        rawCombos.push({
            name: '对酒当歌',
            score: 1,
            cards: ['m09_mono', 'tanzaku_spring', 'tanzaku_summer', 'tanzaku_autumn', 'tanzaku_winter']
        });
    }

    // 天狗面+红叶
    if (has('mask_tengu') && (has('m10_hana_01') || has('m10_hana_02'))) {
        const redLeaf = has('m10_hana_01') ? 'm10_hana_01' : 'm10_hana_02';
        rawCombos.push({ name: '天狗面+红叶', score: 2, cards: [redLeaf, 'mask_tengu'] });
    }

    // 动物
    if (has('m02_kemono') && has('m04_kemono') && has('m11_kemono')) rawCombos.push({ name: '莺鹃燕', score: 3, cards: ['m02_kemono', 'm04_kemono', 'm11_kemono'] });
    if (has('m07_kemono') && has('m10_kemono') && has('m06_kemono')) rawCombos.push({ name: '猪鹿蝶', score: 6, cards: ['m07_kemono', 'm10_kemono', 'm06_kemono'] });
    if (has('m01_kemono') && has('m12_kemono')) rawCombos.push({ name: '鹤凤双瑞', score: 3, cards: ['m01_kemono', 'm12_kemono'] });

    // 伞下雨桥
    if (hasName('花魁') && has('oiran_umbrella') && has('m05_mono_01') && has('m05_ame'))
        rawCombos.push({ name: '伞下雨桥', score: 5, cards: ['oiran_oiran_01', 'oiran_umbrella', 'm05_mono_01', 'm05_ame'] });

    // 四面具
    if (has('mask_noh') && has('mask_oni') && has('mask_kitsune') && has('mask_tengu'))
        rawCombos.push({ name: '四面具', score: 4, cards: ['mask_noh', 'mask_oni', 'mask_kitsune', 'mask_tengu'] });

    // 夏祭
    if (has('yukata') && has('uchiwa') && has('hanabi')) rawCombos.push({ name: '夏祭', score: 3, cards: ['yukata', 'uchiwa', 'hanabi'] });
    // 乐艺
    if (hasName('花魁') && has('koto') && has('fune')) rawCombos.push({ name: '乐艺', score: 2, cards: ['oiran_oiran_01', 'koto', 'fune'] });
    // 文艺
    if (hasName('花魁') && has('yokku') && (has('tanzaku_spring') || has('tanzaku_summer') || has('tanzaku_autumn') || has('tanzaku_winter'))) {
        rawCombos.push({
            name: '文艺',
            score: 2,
            cards: ['oiran_oiran_01', 'yokku', 'tanzaku_spring', 'tanzaku_summer', 'tanzaku_autumn', 'tanzaku_winter']
        });
    }

    // 七夕
    if (has('special_bamboo') && has('yokku')) rawCombos.push({ name: '七夕', score: 1, cards: ['special_bamboo', 'yokku'] });
    // 破浪祭
    if (has('tsuzumi') && has('kanagawa') && has('fune')) rawCombos.push({ name: '破浪祭', score: 3, cards: ['tsuzumi', 'kanagawa', 'fune'] });

    // 花鸟风月 风花雪月 等
    const sakura = (has('m03_hana_01') || has('m03_hana_02')) ? (has('m03_hana_01') ? 'm03_hana_01' : 'm03_hana_02') : null;
    if (sakura && has('m02_kemono') && has('kaze') && has('m08_mono')) rawCombos.push({ name: '花鸟风月', score: 6, cards: [sakura, 'm02_kemono', 'kaze', 'm08_mono'] });
    if (sakura && has('kaze') && has('yuki') && has('m08_mono')) rawCombos.push({ name: '风花雪月', score: 5, cards: [sakura, 'kaze', 'yuki', 'm08_mono'] });
    if (has('fuji') && has('kanagawa') && has('shrine_torii')) rawCombos.push({ name: '浮世三绘', score: 3, cards: ['fuji', 'kanagawa', 'shrine_torii'] });
    if (has('fuji') && has('hi')) rawCombos.push({ name: '日出之山', score: 1, cards: ['fuji', 'hi'] });
    if (has('hi') && has('m08_mono') && has('yuki') && has('m05_ame')) rawCombos.push({ name: '四天象', score: 4, cards: ['hi', 'm08_mono', 'yuki', 'm05_ame'] });

    const yanagi = (has('m11_hana_01') || has('m11_hana_02')) ? (has('m11_hana_01') ? 'm11_hana_01' : 'm11_hana_02') : null;
    if (yanagi && has('kaze')) rawCombos.push({ name: '柳间风', score: 2, cards: [yanagi, 'kaze'] });
    if (has('special_orchid') && has('fue')) rawCombos.push({ name: '兰与笛', score: 2, cards: ['special_orchid', 'fue'] });
    if (has('tsuzumi') && has('koto') && has('fue')) rawCombos.push({ name: '三乐', score: 3, cards: ['tsuzumi', 'koto', 'fue'] });
    if (has('fuji') && has('yuki')) rawCombos.push({ name: '山雪景', score: 1, cards: ['fuji', 'yuki'] });
    if (has('oiran_umbrella') && has('yuki')) rawCombos.push({ name: '雪下伞', score: 1, cards: ['oiran_umbrella', 'yuki'] });
    // 四福
    if (hasName('达摩') && has('shrine_omamori') && has('toy_crane_01') && has('shrine_ema'))
        rawCombos.push({ name: '四福', score: 3, cards: ['toy_daruma_01', 'shrine_omamori', 'toy_crane_01', 'shrine_ema'] });
    // 文武
    if (hasName('挂轴') && has('inner_armor'))
        rawCombos.push({ name: '文武', score: 2, cards: ['kakejiku_01', 'inner_armor'] });
    // 鲤跃川 游鲤 双鱼佩
    if (has('koi') && has('kanagawa')) rawCombos.push({ name: '鲤跃川', score: 2, cards: ['koi', 'kanagawa'] });
    if (has('koi') && has('garden_pond')) rawCombos.push({ name: '游鲤', score: 2, cards: ['koi', 'garden_pond'] });
    if (has('koi') && has('kingyo')) rawCombos.push({ name: '双鱼佩', score: 1, cards: ['koi', 'kingyo'] });
    if (has('hotaru') && has('m06_kemono')) rawCombos.push({ name: '萤蝶舞', score: 1, cards: ['hotaru', 'm06_kemono'] });
    if (has('garden_lantern') && has('komainu')) rawCombos.push({ name: '石造', score: 1, cards: ['garden_lantern', 'komainu'] });
    if (has('garden_lantern') && has('hotaru')) rawCombos.push({ name: '萤火', score: 2, cards: ['garden_lantern', 'hotaru'] });
    if (has('hanabi') && has('kingyo')) rawCombos.push({ name: '绚烂泡影', score: 2, cards: ['hanabi', 'kingyo'] });
    if (has('furin') && has('uchiwa') && has('kingyo')) rawCombos.push({ name: '夏之箱', score: 3, cards: ['furin', 'uchiwa', 'kingyo'] });

    // 四君子 岁寒三友
    const plum = has('m02_hana_01') || has('m02_hana_02');
    const orchid = has('special_orchid');
    const bamboo = has('special_bamboo');
    const chrys = has('m09_hana_01') || has('m09_hana_02');
    if (plum && orchid && bamboo && chrys) rawCombos.push({ name: '四君子', score: 6, cards: [] });
    const matsu = has('m01_hana_01') || has('m01_hana_02');
    if (matsu && bamboo && plum) rawCombos.push({ name: '岁寒三友', score: 3, cards: [] });

    // 去重：同名组合合并cards，但分数一致时取第一个
    const merged = new Map();
    for (const c of rawCombos) {
        if (merged.has(c.name)) {
            const exist = merged.get(c.name);
            if (c.cards && c.cards.length) {
                const combined = new Set([...(exist.cards || []), ...c.cards]);
                exist.cards = [...combined];
            }
            // 分数保持
        } else {
            merged.set(c.name, { name: c.name, score: c.score, cards: c.cards ? [...c.cards] : [] });
        }
    }
    return [...merged.values()];
}

// ---------- 组合覆盖牌逻辑 ----------

function getCoveredCardsForCombo(combo, cardIds) {
    if (combo.cards && combo.cards.length > 0) {
        // 返回实际存在的同名牌
        const targetNames = new Set(combo.cards.map(cid => getCardDef(cid)?.name).filter(Boolean));
        const result = [];
        for (const id of cardIds) {
            const def = getCardDef(id);
            if (def && targetNames.has(def.name)) result.push(id);
        }
        return result;
    }

    const defs = cardIds.map(id => getCardDef(id)).filter(Boolean);
    switch (combo.name) {
        case '六花': return defs.filter(d => d.types.includes('hana')).map(d => d.id);
        case '六物': return defs.filter(d => d.types.includes('mono') && !d.types.includes('kei')).map(d => d.id);
        case '六兽': return defs.filter(d => d.types.includes('kemono')).map(d => d.id);
        case '六景': return defs.filter(d => d.types.includes('kei')).map(d => d.id);
        case '四玩具': return defs.filter(d => d.types.includes('asobi')).map(d => d.id);
        case '神社初诣': return defs.filter(d => ['shrine_torii','komainu','shrine_lantern','shrine_ema'].includes(d.id)).map(d => d.id);
        case '外庭': return defs.filter(d => ['garden_lantern','garden_pond'].includes(d.id) || d.id.startsWith('m01_hana')).map(d => d.id);
        case '四君子': return defs.filter(d => ['m02_hana_01','m02_hana_02','special_orchid','special_bamboo','m09_hana_01','m09_hana_02'].includes(d.id)).map(d => d.id);
        case '岁寒三友': return defs.filter(d => d.id.startsWith('m01_hana') || d.id === 'special_bamboo' || d.id.startsWith('m02_hana')).map(d => d.id);
        case '十二花': return defs.filter(d => d.types.includes('hana') && d.month > 0).map(d => d.id);
        default: return [];
    }
}

function getOrphanCards(cardIds) {
    const combos = detectCombos(cardIds);
    const covered = new Set();
    for (const combo of combos) {
        const cards = getCoveredCardsForCombo(combo, cardIds);
        cards.forEach(id => covered.add(id));
    }
    return cardIds.filter(id => !covered.has(id));
}

function calculateScores(ids) {
    const combos = detectCombos(ids);
    return { combos, totalScore: combos.reduce((s, c) => s + c.score, 0) };
}

// ---------- 理论组合查询 ----------

function getAllTheoreticalCombos() {
    const allCardIds = CARD_DEFS.map(c => c.id);
    return detectCombos(allCardIds);
}

function getTheoreticalCombosForCard(cardId) {
    if (cardId.endsWith('_02')) {
        cardId = cardId.replace('_02', '_01');
    }

    const allCombos = getAllTheoreticalCombos();
    const allCardIds = CARD_DEFS.map(c => c.id);
    const result = [];
    const seen = new Set();
    const queryName = getCardDef(cardId)?.name || '';

    for (const combo of allCombos) {
        let included = false;
        if (combo.cards && combo.cards.length > 0) {
            // 按 ID 或名称匹配
            included = combo.cards.includes(cardId) || combo.cards.some(cid => getCardDef(cid)?.name === queryName);
        } else {
            const covered = getCoveredCardsForCombo(combo, allCardIds);
            included = covered.includes(cardId) || covered.some(cid => getCardDef(cid)?.name === queryName);
        }

        if (included && !seen.has(combo.name)) {
            seen.add(combo.name);
            result.push({ name: combo.name, score: combo.score });
        }
    }
    return result;
}