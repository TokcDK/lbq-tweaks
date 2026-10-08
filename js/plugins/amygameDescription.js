/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){

// ---------------------------------------------------------------------------
// Lookup tables and small helpers
//
// Most of what follows used to be a chain of `if (x == n) { ... }` branches —
// up to twelve of them per chain, and several chains appeared two or three
// times with identical bodies. Every chain is the same shape: an id mapped to
// an icon, a label, or a percentage. Written as data it is one line, and the
// id ranges become visible instead of being implied by thirty near-identical
// lines.
//
// Only pure literals live at this level. Anything that reads a $data* global
// has to be resolved inside a function: this plugin file is evaluated by
// PluginManager, which runs before DataManager.loadDatabase() fills those
// globals, so a top-level table would capture undefined.
// ---------------------------------------------------------------------------

// databaseTypeId -> the database to rewrite. Resolved per call for the reason
// above. An unknown id keeps the previous selection, as the original did.
descriptionDatabase = function(databaseTypeId){
  return [$dataItems, $dataWeapons, $dataArmors, $dataSkills, $dataStates, $dataClasses][databaseTypeId];
};

// RM core skill `scope` id -> target label.
const SCOPE_LABELS = [``, `敵単体`, `敵全体`, `敵R1`, `敵R2`, `敵R3`, `敵R4`, `味方単体`, `味方全体`, `戦闘不能単体`, `戦闘不能全体`, `使用者`];

// Skill / item `occasion` id -> "where it can be used" icon pair.
const OCCASION_ICONS = [`\\I[661]\\I[660]`, `\\I[661]`, `\\I[660]`, `\\I[16]`];

// States 206..217 are drawn from the battle-state icon sheet rather than from
// their own iconIndex. The range is contiguous and three separate blocks used
// to spell it out branch by branch, so one array indexed by `stateId - 206`
// replaces all of them.
const BATTLE_STATE_ICON_FIRST_ID = 206;
const BATTLE_STATE_ICONS = [`\\I[322]`, `\\I[323]`, `\\I[324]`, `\\I[325]`, `\\I[326]`, `\\I[327]`,
                            `\\I[338]`, `\\I[339]`, `\\I[340]`, `\\I[341]`, `\\I[342]`, `\\I[343]`];

// Trait code 22 (xparam) / 23 (sparam) dataId -> [grantIcon, upIcon, downIcon].
const XPARAM_ICONS = {0: [630, 630, 646], 1: [632, 632, 648], 2: [631, 631, 647],
                      7: [640, 640, 643], 8: [641, 641, 644], 9: [642, 642, 645]};
const SPARAM_ICONS = {0: [649, 649, 649], 4: [634, 634, 650], 5: [635, 635, 651],
                      6: [654, 638, 654], 7: [655, 639, 655], 9: [656, 656, 672]};
const PARAM_ICON_DEFAULT = [16, 16, 16];
// For these sparam ids a value below 1 is the good direction, so the up/down
// icons are swapped relative to every other entry.
const SPARAM_ICONS_NEGATIVE_IS_GOOD = [6, 7];

// `<additionalSetN>` target index 1-4 -> the "to whom" prefix label.
const ADDITIONAL_SET_TARGET_LABELS = [``, `使用者に`, `味方全体に`, `対象敵に`, `敵全体に`];//翻訳対象

// `<Skill Tier N Slots>` -> the label shown for slot N.
const SKILL_TIER_SLOT_LABELS = [``, `Ability装着数`, `Main装着数`, `Job装着数`,
                                `G-Passive装着数`, `Passive装着数`, `H-Passive装着数`];

// `<titleGetAchievement>` counter id -> counter name.
const ACHIEVEMENT_NAMES = [``, `TotalKill`, `MaxAssalt`, `TotalAssalt`, `TotalOverKill`, `MaxDamage`,
                           `TotalDamage`, `Defead`, `AttackCount`, `S-AbilityCount`, `A-AbilityCount`,
                           `W-AbilityCount`, `R-AbilityCount`, `BurstCount`, `ChainCount`,
                           `TotalDefead`, `CriticalCount`];

// Class iconIndex -> the name of the growth-stat table that class uses. Stored
// as a name rather than as the array itself because the stat tables are set up
// by amyGameSettei.js and must be read at call time.
const CLASS_GROWTH_STAT_NAMES = {353: `valueActor1Statas`, 354: `valueActor2Statas`, 355: `valueActor3Statas`,
                                 356: `valueActor4Statas`, 357: `valueActor5Statas`,
                                 97: `valueFighterStatas`, 107: `valueNightStatas`, 108: `valuePriestStatas`,
                                 101: `valueMagicianStatas`, 115: `valueThiefStatas`, 96: `valueEnhancerStatas`,
                                 106: `valueGrapplerStatas`, 120: `valueSamuraiStatas`, 102: `valueRangerStatas`,
                                 199: `valueHarpistStatas`, 99: `valueDestroyerStatas`, 554: `valueSlaveStatas`};

// Class rank 1..4 -> Roman numeral.
const CLASS_RANK_NUMERALS = [``, `Ⅰ`, `Ⅱ`, `Ⅲ`, `Ⅳ`];

// Parameter order used by the class description and the class comparison list.
const GROWTH_STAT_LABELS = [`Mhp`, `Mmp`, `Atk`, `Def`, `Mag`, `Dex`, `Agi`, `Luk`];

// `<RaceDropRarity>` -> drop-range note. Ids 1..5 are commented out in the
// original, so they are simply absent; 9 and 10 deliberately share a message.
const RACE_DROP_RARITY_TEXT = {6: `[種族エネミーLv20からドロップ]`, 7: `[種族エネミーLv30からドロップ]`,
                               8: `[種族エネミーLv40からドロップ]`, 9: `[種族エネミーLv50からドロップ]`,
                               10: `[種族エネミーLv50からドロップ]`};

// `<additionalSet<N>>` third field: the state ids that are not plain state ids.
const ADDITIONAL_SET_EXTRA_ICONS = {201: `\\I[658]`};
// ...and the "*N" suffixes that mean "this many stacks".
const ADDITIONAL_SET_STACK_SUFFIX = {293: `*10`, 294: `*20`, 295: `*30`};

// `<Category>` -> the id of the state whose help text is appended.
const CATEGORY_HELP_STATE_IDS = {' StateabNomal': 15, ' StateSPabNomal': 30,
                                 ' StateUnique': 40, ' InvalidDispel': 201, ' PowerUp': 202};

// Quest objective meta key -> the label printed for it.
const QUEST_OBJECTIVE_LABELS = [
  [`QuestCompSubjugation1`, `討伐依頼`],
  [`QuestCompcollect1`, `収集依頼`],
  [`QuestCompDelivery1`, `納品依頼`],
  [`QuestCompVal1`, `指定値達成依頼`],
  [`QuestCompArray1`, `指定値達成依頼`],
  [`QuestCompSkill1`, `指定スキル獲得依頼`],
  [`QuestCompSkillRank1`, `指定スキルランク到達依頼`],
  [`QuestCompSkillSwi`, `指定目的達成依頼`]
];

// The two "is this element a special-attack element" id sets. They were inlined
// as `.some(function(id){return id == x})` closures, four times for the resist
// set alone.
const SPECIAL_ATTACK_ELEMENT_IDS = [18, 19, 51, 52, 53, 54, 55, 56, 57, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70,
                                    71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 82, 83];
const ATTACK_AMPLIFY_ELEMENT_IDS = [18, 19, 51, 52, 53, 54, 55, 56, 57, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70,
                                    71, 72, 73, 74, 75, 76, 77, 78, 79, 80];
const RESIST_SPECIAL_ELEMENT_IDS = [10, 11, 12, 15, 20, 38, 39, 40, 41];
const RESIST_EXCLUDED_ELEMENT_IDS = [35, 37, 38, 41];

// Skill type ids that are cast in battle. Two slightly different sets are in
// use — the scope line also covers type 2 — so both are named rather than left
// as two similar-looking array literals in the middle of the code.
const BATTLE_SKILL_TYPE_IDS = [1, 4, 5, 6, 7, 8, 11, 12, 14];
const BATTLE_SKILL_TYPE_IDS_WITH_SCOPE = [1, 2, 4, 5, 6, 7, 8, 11, 12, 14];
// Skill types that take a turn to resolve.
const TURN_ACTION_SKILL_TYPE_IDS = [4, 5, 6, 7, 8];
// Skill types that get the "auto" and "equipped" header flags.
const EQUIPPED_SKILL_TYPE_IDS = [9, 10, 15];
// Weapon type id 12 marks the Burst skill type.
const BURST_SKILL_TYPE_ID = 12;

// ---------------------------------------------------------------------------
// Translatable labels
//
// A `//翻訳対象` marker means the literal's *value* is human-readable text that
// has to reach a translator. Everything around it — `\C[n]`, `\I[n]`, the
// `\x1b*` name codes, wrapper brackets, and pure-ASCII tokens such as `Rank:`,
// `TP`, `%` — stays in the template literal. The string a translator edits then
// reads as a word or a short phrase instead of mostly control-code noise, and
// the codes cannot be mangled by the translation pass.
//
// Only labels shared by more than one site live here; a label used once is a
// local `const` immediately above the statement that consumes it.
// ---------------------------------------------------------------------------
const CONDITION_LABEL = `条件`;//翻訳対象
const POWER_LABEL = `威力`;//翻訳対象
const DRAIN_LABEL = `与Dの`;//翻訳対象
const ABSORB_LABEL = `吸収回復`;//翻訳対象
const OR_MORE_SUFFIX = `以上`;//翻訳対象
const TIMES_SUFFIX = `倍`;//翻訳対象
const SUITABLE_LV_LABEL = `適正Lv`;//翻訳対象
const TP_LABEL = `TP`;//翻訳対象
const RANK_LABEL = `Rank`;//翻訳対象
// Entry 18 of the damage-formula table is the only entry carrying text; the
// `GunDamage` tag further down the item section reuses the same word.
const FIXED_VALUE_TEXT = `固定値`;//翻訳対象

// `DamageFormula2` first field -> the blurb shown for it. Every entry is the
// body of `[\C[${colorCode}]…\C[0]`. Ids 8, 9 and 10 are built from the
// remaining fields and are handled before this table is consulted; id 31 has
// no blurb at all (see the note at the lookup site).
const DAMAGE_FORMULA_TEXT = {
  1: `\\I[34]100%`, 2: `\\I[36]100%`, 3: `\\I[37]100%`, 4: `\\I[39]100%`, 5: `\\I[35]100%`,
  6: `\\I[37]50%\\I[38]50%`, 7: `\\I[34]50%\\I[37]50%`,
  11: `\\I[34]70%\\I[37]20%\\I[38]10%`, 12: `\\I[34]20%\\I[37]40%\\I[38]40%`,
  13: `\\I[34]60%\\I[37]40%`, 14: `\\I[36]100%`,
  15: `\\I[34]40%\\I[37]30%\\I[38]30%`, 16: `\\I[34]80%\\I[37]20%`, 17: `\\I[34]100%`,
  18: `\\I[37]50%+${FIXED_VALUE_TEXT}`, 19: `\\I[34]20%\\I[37]80%`, 20: `\\I[36]50%\\I[37]50%`,
  24: `\\I[37]50%\\I[39]50%`, 25: `\\I[37]50%`,
  28: `\\I[34]100%`, 29: `\\I[34]80%\\I[37]10%\\I[38]10%`, 30: `\\I[34]70%\\I[37]10%\\I[38]20%`
};

// Element id -> the `\I[n]` / literal-label text for it, and the two derived
// forms the trait scan needs. `amygame_elementIcon` already centralises the id
// table; these wrappers stop every call site from repeating the
// `elementIcon[0] >= 1 ? name : icon` test.
function elementLabel(elementId) {
  const elementIcon = amygame_elementIcon(elementId);
  return elementIcon[0] >= 1 ? `${elementIcon[1]}` : `\x1bI[${elementIcon[1]}]`;
}
function elementAmplifyLabel(elementId) {
  const elementIcon = amygame_elementIcon(elementId);
  return elementIcon[0] >= 1 ? `${elementIcon[1]}${POWER_LABEL}` : `\x1bI[${elementIcon[2]}]${POWER_LABEL}`;
}
// The `\x1bI[n]` icon used by the element-resist trait (code 11). Takes the
// already-fetched descriptor: `amygame_elementIcon` allocates a fresh array on
// every call, so the trait scan reads it once.
function elementResistIcon(elementIcon) {
  return `\x1bI[${elementIcon[3]}]`;
}
// State id -> the icon to draw for it, honouring the battle-state sheet range.
function stateIconText(stateId) {
  const battleIcon = BATTLE_STATE_ICONS[stateId - BATTLE_STATE_ICON_FIRST_ID];
  if (battleIcon) return battleIcon;
  return $dataStates[stateId].iconIndex >= 1
    ? `\x1bI[${$dataStates[stateId].iconIndex}]`
    : `${$dataStates[stateId].name}`;
}
// Same, but for the `<additionalSet>` path, which falls back to `\x1bSIM[n]`
// and appends one `+` per extra stack.
function additionalSetStateIcon(stateId, stackCount) {
  const battleIcon = BATTLE_STATE_ICONS[stateId - BATTLE_STATE_ICON_FIRST_ID];
  let text = battleIcon ? battleIcon : `\x1bSIM[${stateId}]`;
  if (ADDITIONAL_SET_EXTRA_ICONS[stateId]) text = ADDITIONAL_SET_EXTRA_ICONS[stateId];
  if (ADDITIONAL_SET_STACK_SUFFIX[stateId]) text += ADDITIONAL_SET_STACK_SUFFIX[stateId];
  for (let plusSignCount = 2; plusSignCount <= stackCount; plusSignCount++) {
    text += `+`;
  }
  return text;
}
// The passive-state lists built by amyGameSettei.js hold their ids as strings
// (`pushArray` pushes `metaValue.split(',')`), so the test has to stay loose.
function containsState(passiveList, stateId) {
  for (let index = 0; index < passiveList.length; index++) {
    if(passiveList[index] == stateId){ return true; };
  };
  return false;
}
// `[\C[n]label\C[0]] ` — the shape shared by most single-value effect notes.
function colorTaggedText(colorCode, text) {
  return `\\C[${colorCode}]${text}\\C[0]`;
}
// `value1,value2` style meta, split and trimmed. Trimming matters: the notes in
// this project are hand-written and carry stray spaces after the commas.
function splitMetaValues(metaValue) {
  return String(metaValue).split(',').map(function (part) { return part.trim(); });
}
// Growth-stat row for a class, e.g. `\C[16]Mhp\C[10]120\C[0],…`. Built once and
// reused: the original pasted this 8-stat expression into two long templates.
function growthStatText(growthStats, rankValue) {
  return GROWTH_STAT_LABELS.map(function (label, index) {
    return `\\C[16]${label}\\C[10]${Number(growthStats[index]) * rankValue}\\C[0]`;
  }).join(',');
}
// The "all stats up" note. `traitValue` is the RM multiplier, so 1 is neutral
// and above/below 1 selects the up or down icon. `isUniform` is true when every
// stat in the run carried the same multiplier, in which case the percentage is
// dropped (showing "×2" once is clearer than eight identical percentages).
function allStatUpText(traitValue, upIcon, downIcon, isUniform) {
  const icon = traitValue >= 1 ? upIcon : downIcon;
  const percent = Math.round(Math.abs(traitValue - 1) * 100);
  return isUniform ? `${icon} ` : `${icon}${percent}% `;
}
// `[\C[3]\I[n]:value%up\C[0]]` — the row shared by skill effect codes 11 (HP),
// 12 (MP) and 13 (TP). The colour is 3 for a positive value and 4 for a
// negative one; `unit` is `%` for the percentage field and empty for the flat
// `value2` field; `direction` is `up`/`down` for TP and empty for HP/MP.
// The icon table is a module-scope constant: it was previously rebuilt inside
// the per-entry loop, which allocated the same object once per database entry.
const RECOVERY_EFFECT_ICONS = {11: 627, 12: 628, 13: 629};
function recoveryEffectText(iconId, value, unit, direction) {
  return `[\\C[${value >= 1 ? 3 : 4}]\\I[${iconId}]:${value}${unit}${direction}\\C[0]]`;
}
// `<HP|MP Life Steal Physical|Magical>`: four near-identical blocks. The value
// comes from the physical tag when both are present, and the prefix names
// whichever tags are in play. `lossSuffix` differs between HP (反動ﾀﾞﾒｰｼﾞ) and
// MP (消耗); a value below 1 means the skill costs rather than drains.
function lifeStealText(prefix, rawValue, resource, lossSuffix) {
  const value = Number(String(rawValue).replace(' ', '').replace('%', ''));
  const isGain = value >= 1;
  return `[\\C[${isGain ? 2 : 10}]${prefix}${DRAIN_LABEL}${value}%${resource}${isGain ? ABSORB_LABEL : lossSuffix}\\C[0]]`;
}
function lifeStealGroupText(meta, resource, lossSuffix) {
  const physical = meta[resource + ' Life Steal Physical'];
  const magical = meta[resource + ' Life Steal Magical'];
  if(physical && magical){
    return lifeStealText(`物理/魔法`, physical, resource, lossSuffix);
  };
  let text = ``;
  if(physical){ text += lifeStealText(`物理`, physical, resource, lossSuffix); };
  if(magical){ text += lifeStealText(`魔法`, magical, resource, lossSuffix); };
  return text;
}
// `<titleEffectN>` / `<eatEffectN>` share one body. `metaValues[0]` selects
// which stat table supplies the name: 0 param, 1 xparam, 2 sparam, 3 element
// (with 特攻 inserted for the amplify set). Case 4 is handled by the caller
// because it writes to the output as well.
// A `switch` rather than four `if`s: every arm returns, and `sourceIndex` is
// already a number, so `switch`'s `===` is the same test the `==` chain made —
// with one jump instead of up to four comparisons.
function statEffectName(metaValues) {
  const sourceIndex = Number(metaValues[0]);
  const statIndex = Number(metaValues[1]);
  switch(sourceIndex){
    case 0: return TextManager.param(statIndex);
    case 1: return FTKR.CSS.cssStatus.xparam[statIndex];
    case 2: return FTKR.CSS.cssStatus.sparam[statIndex];
    case 3:
      const specialAttackLabel = `特攻`;//翻訳対象
      return `${$dataSystem.elements[statIndex]}`
        + (ATTACK_AMPLIFY_ELEMENT_IDS.indexOf(statIndex) >= 0 ? specialAttackLabel : ``) + POWER_LABEL;
    default: return undefined;
  };
}
// amyGameSettei.js sets the growth-stat tables up as bare top-level variables,
// i.e. as properties of the global object. `globalThis` does not exist in MV's
// NW.js build, so reach the global object the old way. The tables have to be
// read at call time: this file is evaluated before that one.
const GAME_GLOBALS = (function () { return this; })();
function classGrowthStats(classIconIndex) {
  const tableName = CLASS_GROWTH_STAT_NAMES[Number(classIconIndex)];
  return (tableName && GAME_GLOBALS[tableName]) || valuePeplesStatas;
}
// The class comparison list pads every name out to six display cells. The
// original spelled that out as five branches, one per source length.
const CLASS_NAME_WIDTH = 6;
function classComparisonName(className) {
  const paddingLength = className.length >= 1 && className.length < CLASS_NAME_WIDTH
    ? CLASS_NAME_WIDTH - className.length : 0;
  return className + `　`.repeat(paddingLength);
}

//武器防具の説明文に効果に応じた文章追加
various_description = function(databaseTypeId){

Hentai380_ArrangementNameSet();

//value10文言 value11文言文頭 value12-14属性の付与/増加/減少 value15数字か文字列か value16ALL設定
//value17武器攻撃補正 value18スキル属性 value19説明文改変スキップ value20十種武器装備可能時

valueItems = descriptionDatabase(databaseTypeId) || valueItems;

var start = 1;
if(databaseTypeId == 2){
  var end = valueArmorsLength;
} else {
  var end = valueItems.length-1;
};

for (var i = start; i <= end; i++) {

// The entry being described and its parsed notetag metadata. Both were written
// out in full at each of the ~470 use sites below.
var item = valueItems[i];
var itemMeta = item.meta;

var effectText = ``;
var headerText = ``;
var statUpCount = 0;
var skillElementText = ``;
var skipDescFlag = 0;//追加説明するかどうか
var tenWeaponCount = 0;//武器種計算
var damageCutRef = 0;//物理魔法ダメージカット。数値が同一かどうか
var damageCutCount = 0;//物理魔法ダメージカット
var damageCutIsFirst = 0;//物理魔法ダメージカット。１個めかどうか
var prevStateCode = 0;//スキル効果。同じ効果が連続で存在する時
var consecStateCount = 0;//スキル効果。同じ効果が連続で存在する時。カウント用
var colorCode = 2;//カラー設定。通常は２．変更時はその直後に２に戻す。
var calcTmp = 0;//計算用
var suffixText = ``;//説明文前段の後半部分に付記する文言
var descWordText = 0;//DescriptionWord用
var additionalSetTextByTarget = [];
var additionalSetCountByTarget = [];

if(item.name == ''){
var skipDescFlag = 1;
};

if(databaseTypeId == 1 && item.wtypeId == 0){
var skipDescFlag = 1;
};

// Unnamed entries — and weapons with no weapon type — get no generated text at
// all. This used to be an `if(skipDescFlag == 0){ … }` wrapping the next 1700
// lines; a guard clause costs one brace and keeps the rest of the loop body one
// level shallower.
if(skipDescFlag != 0){
continue;
};

if(databaseTypeId == 1 || databaseTypeId == 2){
  const categoryLabel = `分類`;//翻訳対象
  const typeLabel = `種別`;//翻訳対象
  var headerText = `[\\C[${colorCode}]${categoryLabel}\\C[0]:${$dataSystem.equipTypes[item.etypeId]}]`;
    if(databaseTypeId == 1 && item.wtypeId >= 1){
      var weaponTypeName = $dataSystem.weaponTypes[item.wtypeId];
      headerText += `[\\C[${colorCode}]${typeLabel}\\C[0]:${weaponTypeName}]`
    };
    if(databaseTypeId == 2 && item.atypeId >= 1){headerText += `[\\C[${colorCode}]${typeLabel}\\C[0]:${$dataSystem.armorTypes[item.atypeId]}]`};
if(databaseTypeId == 1 || databaseTypeId == 2){
  if(itemMeta['LotteryRearity']){
    headerText += `[\\I[517]:${Number(itemMeta['LotteryRearity'])}]`;
}};
};

if(databaseTypeId == 1 || databaseTypeId == 2 || databaseTypeId == 4 || databaseTypeId == 5){

  //十種武器: ten weapon-type traits on one entry are summarised as "十種武器".
  for (var traitScanIndex = 0; traitScanIndex <= 9; traitScanIndex++) {
    var weaponTrait = item.traits[traitScanIndex];
    if(weaponTrait && weaponTrait.code == 51){
      tenWeaponCount += 1;
    };
  };
  if(tenWeaponCount >= 10){
    effectText += `${colorTaggedText(colorCode, `武器種:`)}十種武器 `;
  };

  var effectValue = 0;
  var calcTmp = 0;
  //ステアップALLで纏める: count the stat-up traits and how many of them repeat
  // the same multiplier, so a full set can be collapsed to one icon below.
  for (var traitScanIndex = 0; traitScanIndex <= 7; traitScanIndex++) {
    var statTrait = item.traits[traitScanIndex];
    if(statTrait && statTrait.code == 21){
      statUpCount += 1;
      if(effectValue == statTrait.value){
        var effectValue = statTrait.value;
        calcTmp += 1;
      };
    };
  };
  if(statUpCount == 5 && item.traits[4]){
    effectText += allStatUpText(item.traits[4].value, `\\I[658]+`, `\\I[674]-`, calcTmp >= 2);
  };
  if(statUpCount == 8){
    effectText += allStatUpText(item.traits[7].value, `\\I[659]+`, `\\I[675]-`, calcTmp >= 2);
  };

  //物理魔法ダメージカット: count the physical and magical damage-cut traits, but
  // only when they carry the same multiplier (a mismatched pair is shown
  // individually by the code-23 branch further down).
  for (var traitScanIndex = 0; traitScanIndex <= 1; traitScanIndex++) {
    var cutTrait = item.traits[traitScanIndex];
    if(cutTrait && cutTrait.code == 23 && (cutTrait.dataId == 6 || cutTrait.dataId == 7)){
      if(damageCutIsFirst == 0){
        var damageCutRef = cutTrait.value;
      };
      if(damageCutIsFirst == 0 || damageCutRef == cutTrait.value){
        damageCutCount += 1;
      };
      damageCutIsFirst += 1;
    };
  };

  if(damageCutCount == 2){
    effectText += allStatUpText(item.traits[1].value, `\\I[654]\\I[655]-`, `\\I[638]\\I[639]+`, false);
  };

  for (var traitIndex = 0; traitIndex <= 19; traitIndex++) {
    var trait = item.traits[traitIndex];
    if(trait){
      // Every branch below used to locate its target id by looping the whole id
      // range and comparing `trait.dataId == traitDataId`. Such a loop matches at
      // most once, so reading the id and range-checking it is the same test with
      // no loop and one nesting level less.
      var traitDataId = trait.dataId;
      var traitValue = trait.value;

      if(trait.code == 31){
        if(traitDataId >= 1 && traitDataId <= $dataSystem.elements.length-1){
          if(!itemMeta['EnemyState']){
            if(SPECIAL_ATTACK_ELEMENT_IDS.indexOf(traitDataId) >= 0){
              effectText += `${colorTaggedText(colorCode, `特攻属性付与`)}${elementLabel(traitDataId)} `;
            } else {
              effectText += `${colorTaggedText(colorCode, `攻撃属性付与`)}${elementLabel(traitDataId)}\\C[${colorCode}] `;
            };
          };
        };
      };

      if(trait.code == 11){
        if(traitDataId >= 1 && traitDataId <= $dataSystem.elements.length-1){
          // Read the descriptor once: each call allocates.
          const elementIcon = amygame_elementIcon(traitDataId);
          if(elementIcon[0] >= 1){
            // A handful of element ids carry a literal label instead of an icon.
            var fragText = `${elementIcon[1]}`;
          } else {
            // Element 11 is scaled by 10 rather than 100, so a "10% resist" is
            // written as 1 in the database.
            var effectValue = Math.round(Math.abs(traitValue - 1) * (traitDataId == 11 ? 10 : 100));
            var fragText = `${elementResistIcon(elementIcon)}${RESIST_SPECIAL_ELEMENT_IDS.indexOf(traitDataId) >= 0
              ? (traitValue >= 1 ? `+` : `-`)
              : (traitValue >= 1 ? `耐性-` : `耐性+`)}`;
          };
          // Element ids 35/37/38/41 are never listed, and 41-80 are enemy-only:
          // the latter are hidden altogether when the page is a state page.
          if(RESIST_EXCLUDED_ELEMENT_IDS.indexOf(traitDataId) < 0
             && !(itemMeta['EnemyState'] && traitDataId >= 41 && traitDataId <= 80)){
            effectText += `${fragText}${effectValue}% `;
          };
        };
      };

      if(trait.code == 12){
        if(traitDataId >= 0 && traitDataId <= 7){
          if(traitValue >= 1){
            var effectValue = Math.round((traitValue - 1) * 100);
            var fragText = `${colorTaggedText(1, `耐性-`)}\x1bI[${traitDataId + 48}]`;
          } else {
            var effectValue = Math.round((1 - traitValue) * 100);
            var fragText = `${colorTaggedText(colorCode, `耐性+`)}\x1bI[${traitDataId + 48}]`;
          };
          effectText += `${fragText}${effectValue}% `;
        };
      };

      if(trait.code == 13){
        if(traitDataId >= 1 && traitDataId <= $dataStates.length-1){
          var effectValue = Math.round(Math.abs(traitValue - 1) * 100);
          var resistColor = traitValue >= 1 ? 1 : colorCode;
          effectText += `\\C[0]${colorTaggedText(resistColor, traitValue >= 1 ? `耐性-` : `耐性+`)}${stateIconText(traitDataId)}${effectValue}% `;
        };
      };

      if(trait.code == 14){
        if(traitDataId >= 1 && traitDataId <= $dataStates.length-1){
          effectText += `${colorTaggedText(colorCode, `無効化`)}${stateIconText(traitDataId)} `;
        };
      };

      // Stat-up traits that are not part of a full five/eight-stat run.
      if((traitIndex > statUpCount || statUpCount <= 4) && trait.code == 21){
        if(traitDataId >= 0 && traitDataId <= 7){
          effectText += allStatUpText(traitValue, `\x1bI[${traitDataId + 32}]+`, `\x1bI[${traitDataId + 48}]-`, false);
        };
      };

      if(trait.code == 22){
        if(traitDataId >= 0 && traitDataId <= 9){
          var xparamIcons = XPARAM_ICONS[traitDataId] || PARAM_ICON_DEFAULT;
          if(traitValue >= 0.01){
            effectText += `\x1bI[${xparamIcons[1]}]+${Math.round(traitValue * 100)}% `;
          } else {
            effectText += `\x1bI[${xparamIcons[2]}]${Math.round(traitValue * 100)}% `;
          };
        };
      };

      // A matched physical+magical damage-cut pair was already summarised above.
      if(damageCutCount <= 1 && trait.code == 23){
        if(traitDataId >= 0 && traitDataId <= 9){
          var sparamIcons = SPARAM_ICONS[traitDataId] || PARAM_ICON_DEFAULT;
          var negativeIsGood = SPARAM_ICONS_NEGATIVE_IS_GOOD.indexOf(traitDataId) >= 0;
          var isUp = (traitValue >= 1) !== negativeIsGood;
          effectText += `\x1bI[${isUp ? sparamIcons[1] : sparamIcons[2]}]${isUp ? `+` : `-`}${Math.round(Math.abs(traitValue - 1) * 100)}% `;
        };
      };

      if(trait.code == 32){ //31は先頭で実行済み。
        if(traitDataId >= 1 && traitDataId <= $dataStates.length-1){
          effectText += `${colorTaggedText(colorCode, `ステート付与`)}${stateIconText(traitDataId)}${Math.round(traitValue * 100)}% `;
        };
      };

      if(trait.code == 33){
        if(traitDataId == 0){
          effectText += `${colorTaggedText(colorCode, `AttackSpeed+`)}${Math.round(traitValue)} `;
        };
      };

      if(trait.code == 41){
        if(traitDataId >= 1 && traitDataId <= $dataSystem.skillTypes.length-1){
          effectText += `${colorTaggedText(colorCode, `使用可能`)}<${$dataSystem.skillTypes[traitDataId]}> `;
        };
      };

      if(trait.code == 42){
        if(traitDataId >= 1 && traitDataId <= $dataSystem.skillTypes.length-1){
          effectText += `\\I[626]<${$dataSystem.skillTypes[traitDataId]}> `;
        };
      };

      if(trait.code == 43){
        if(traitDataId >= 1 && traitDataId <= $dataSkills.length-1){
          var skillRef = `<\x1bSIN[${traitDataId}]>`;
          if(databaseTypeId == 1 && $dataSkills[traitDataId].stypeId == BURST_SKILL_TYPE_ID){
            effectText += `${colorTaggedText(colorCode, `Burst`)}${skillRef} `;
          } else {
            effectText += `${colorTaggedText(colorCode, `使用可能`)}${skillRef} `;
          };
        };
      };

      if(trait.code == 44){
        if(traitDataId >= 1 && traitDataId <= $dataSkills.length-1){
          effectText += `\\I[626]<\x1bSIN[${traitDataId}]> `;
        };
      };

      if(tenWeaponCount <= 9 && trait.code == 51){
        if(traitDataId >= 1 && traitDataId <= $dataSystem.weaponTypes.length-1){
          effectText += `${colorTaggedText(colorCode, `武器種`)}<${$dataSystem.weaponTypes[traitDataId]}> `;
        };
      };

      if(trait.code == 52){
        if(traitDataId >= 2 && traitDataId <= $dataSystem.armorTypes.length-1){
          effectText += `${colorTaggedText(colorCode, `防具種`)}<${$dataSystem.armorTypes[traitDataId]}> `;
        };
      };

      if(trait.code == 53){
        if(traitDataId >= 1 && traitDataId <= $dataSystem.equipTypes.length-1){
          effectText += `${colorTaggedText(1, `装備固定`)}<${$dataSystem.equipTypes[traitDataId]}> `;
        };
      };

      if(trait.code == 54){
        if(traitDataId >= 1 && traitDataId <= $dataSystem.equipTypes.length-1){
          effectText += `${colorTaggedText(1, `装備封印`)}<${$dataSystem.equipTypes[traitDataId]}> `;
        };
      };

      if(trait.code == 61){
        if(traitDataId == 0){
          effectText += `${colorTaggedText(colorCode, `行動回数追加`)}${Math.round(traitValue * 100)}% `;
        };
      };

    };
  };

};//ここまで特徴コード。武器防具ステート。スキルはtraitsではなくeffectsなので下で実行

// `<HSkillLearn>`: up to three numbered premise tags, each of four kinds. The
// original wrote the four kinds out twelve times and tracked "did anything
// match" with an iconIdxGrant flag that was re-`var`d inside every branch.
if(itemMeta['HSkillLearn']){
  const premiseTexts = [];
  for (let premiseIndex = 1; premiseIndex <= 3; premiseIndex++) {
    const premiseSkill = itemMeta['PremiseSkill' + premiseIndex];
    const premiseSkillRank = itemMeta['PremiseSkillRank' + premiseIndex];
    const premiseVariable = itemMeta['PremiseVariable' + premiseIndex];
    const premiseArrangement = itemMeta['PremiseArrangement' + premiseIndex];
    if(premiseSkill){
      const learnSuffix = `習得`;//翻訳対象
      premiseTexts.push(`\\C[27]<${$dataSkills[Number(premiseSkill)].name}>\\C[0]${learnSuffix}`);
    };
    if(premiseSkillRank){
      const rankValues = splitMetaValues(premiseSkillRank);
      const reachSuffix = `到達`;//翻訳対象
      premiseTexts.push(`\\C[27]<${$dataSkills[Number(rankValues[0])].name}>\\C[0]${RANK_LABEL}:\\C[27]${Number(rankValues[1])}\\C[0]${reachSuffix}`);
    };
    if(premiseVariable){
      const variableValues = splitMetaValues(premiseVariable);
      // The original stripped up to three ideographic spaces, then one space and
      // one colon — five sequential first-occurrence replaces, not a global one.
      const variableName = `${$dataSystem.variables[Number(variableValues[0])]}`
        .replace("　", "").replace("　", "").replace("　", "").replace(" ", "").replace(":", "");
      premiseTexts.push(`\\C[27]${variableName}\\C[0]:\\C[27]${Number(variableValues[1])}\\C[0]${OR_MORE_SUFFIX}`);
    };
    if(premiseArrangement){
      const arrangementValues = splitMetaValues(premiseArrangement);
      premiseTexts.push(`\\C[27]${valueHentaiArrangement[Number(arrangementValues[0])]}\\C[0]:\\C[27]${Number(arrangementValues[1])}\\C[0]${OR_MORE_SUFFIX}`);
    };
  };
  const noneLabel = `なし`;//翻訳対象
  effectText += `[${CONDITION_LABEL}:${premiseTexts.length ? premiseTexts.join(``) : `\\C[27]${noneLabel}\\C[0]`}]`;
};

if(itemMeta['DescriptionWord']){
  var fragText = `${itemMeta['DescriptionWord']}`;
    if(databaseTypeId == 3 && item.stypeId == 15){
      var descWordText = `\\C[27][${fragText}]\\C[0] `;
    } else {
      var descWordText = `\\C[${colorCode}][${fragText}]\\C[0] `;
    };
};//一言が必要なもののみ

if(itemMeta['GunDamage']){
var effectValue = itemMeta['GunDamage'];
effectText += `[${FIXED_VALUE_TEXT}:${effectValue}] `;
};//銃武器の固定値

if(databaseTypeId == 3 || databaseTypeId == 0){

    if(EQUIPPED_SKILL_TYPE_IDS.indexOf(item.stypeId) >= 0){
    if(itemMeta['Unequippable']){
      var fragText = `<自動>`;
      if(item.stypeId == 15){var colorCode = 27};
      headerText += `\\C[${colorCode}]${fragText}\\C[0]`;
      var colorCode = 2;
    };
  };
  if(itemMeta['Skill Tier']){
      var effectValue = itemMeta['Skill Tier'].replace(' ','');
      effectValue = Number(effectValue);
      if(effectValue >= 1){effectValue = `\x1bI[${Yanfly.Icon.ESTier[effectValue]}]${Yanfly.Param.ESTierName[effectValue]}>`};
      var fragText = `<装着:${effectValue}`;
      if(item.stypeId == 15){var colorCode = 27};
      headerText += `\\C[${colorCode}]${fragText}\\C[0] `;
      var colorCode = 2;
  };
// `occasion` -> the "where can this be used" icon pair. The two blocks below
// were identical except that the skill database gates it on a battle skill
// type, so the gate is the only thing left in the condition.
if(databaseTypeId == 0 || (databaseTypeId == 3 && BATTLE_SKILL_TYPE_IDS.indexOf(item.stypeId) >= 0)){
  if(!item.occasion || !itemMeta['BattleMapInformation']){
    var fragText = OCCASION_ICONS[item.occasion] || OCCASION_ICONS[0];
    headerText += `\\C[${colorCode}]${fragText}\\C[0]`;
  };
};
  if(itemMeta['SaveShare']){
    headerText += `\\I[15]`;
  };

  if(itemMeta['MCharacterLearn']){
    headerText += `\\I[14]`;
  };

if(databaseTypeId == 3 && TURN_ACTION_SKILL_TYPE_IDS.indexOf(item.stypeId) >= 0 && !itemMeta['Instant']){
  var colorCode = 13;
  const turnActionText = `ターン行動`;//翻訳対象
  headerText += `\\C[${colorCode}]<${turnActionText}>\\C[0] `;
  var colorCode = 2;
};
  if(item.scope >= 1 && BATTLE_SKILL_TYPE_IDS_WITH_SCOPE.indexOf(item.stypeId) >= 0){
    var fragText = SCOPE_LABELS[item.scope];
    var colorCode = 14;
    headerText += `\\C[${colorCode}]<${fragText}>\\C[0] `;
    var colorCode = 2;
  };

  if(itemMeta['Multiple Elements']){
    splitMetaValues(itemMeta['Multiple Elements']).forEach(function (elementId) {
      skillElementText += colorTaggedText(colorCode, elementLabel(elementId));
    });
    headerText += `[属性:${skillElementText}] `;
  };

if(itemMeta['Custom Cooldown Mastery Formula'] || itemMeta['Custom MP Cost Mastery Formula']  || itemMeta['Mastery Effect']){
  //var value9 = `RankUpで`;
  //value11 += `[${value9}]`;
};
if(itemMeta['Select Conditions']){
  const frontGuardOnlyText = `対象前衛のみ`;//翻訳対象
  headerText += `[\\C[${colorCode}]${frontGuardOnlyText}\\C[0]] `;
};
if(itemMeta['SkillLearningClass']){
  var effectValue = `${$dataSystem.skillTypes[item.stypeId]}`;
  var fragText = Number(itemMeta['SkillLearningClass']);
  if(fragText != 100){
    const learnNameCode = `\x1bJ[${fragText}]`;//名前コード。翻訳対象外
    const learnText = `習得`;//翻訳対象
    effectText += `[\\C[${colorCode}]${effectValue}\\C[0]] [\\C[${colorCode}]${learnNameCode}\\C[0]${learnText}] `;
  };
};
if(itemMeta['Limit Uses']){
  var fragText = Number(itemMeta['Limit Uses']);
  if(itemMeta['Not Recover All Uses']){//<After Battle Uses Recover: 0>もセット
    const dailyUsesText = `1日${fragText}回`;//翻訳対象
    headerText += `[\\C[${colorCode}]${dailyUsesText}\\C[0]] `;
  } else {
    const battleUsesText = `戦闘中${fragText}回`;//翻訳対象
    headerText += `[\\C[${colorCode}]${battleUsesText}\\C[0]] `;
  };
};
if(databaseTypeId == 0){
  if(item.consumable){
    //value10 += `[\\C[${value26}]消耗品\\C[0]] `;
  };
};
if(databaseTypeId == 0){
  if(itemMeta['SeiyokuItem']){
    var colorCode = 27;
    const lustItemText = `性欲品`;//翻訳対象
    effectText += `[\\C[${colorCode}]${lustItemText}\\C[0]] `;
  };
};
var colorCode = 2;
if(itemMeta['DamageFormula2']){
  var metaValues = splitMetaValues(itemMeta['DamageFormula2']);
  var formulaId = Number(metaValues[0]);
  // 8, 9, 10 and 31 are the ids that are not a fixed blurb, so they are taken
  // first and the table covers the remaining twenty-three.
  if(formulaId == 8){var fragText = recoveryEffectMsg(36, 36);};
  if(formulaId == 9){var fragText = recoveryEffectMsg(34, 35);};
  if(formulaId == 10){
    var absorbNum = metaValues[1];var dmgNum = metaValues[2];
    var msg = `現在HPの${absorbNum}%消費して×${dmgNum}倍の与ダメ`;
    var fragText = `[\\C[${colorCode}]${msg}\\C[0]`;
  };
  // Id 31 (skill 373 "ルビフリップ") has no blurb. The original let it fall
  // through and then appended to `fragText` regardless, which is a
  // function-scoped `var`: it still held whatever an earlier branch of the same
  // iteration had assigned, so the note ended in a leftover fragment from an
  // unrelated section. The guard makes "no blurb" mean "append nothing". On the
  // current database it is a no-op (the leftover happened to be a full
  // fragment), but it removes the dependency on evaluation order.
  if(DAMAGE_FORMULA_TEXT[formulaId]){
    var fragText = `[\\C[${colorCode}]${DAMAGE_FORMULA_TEXT[formulaId]}\\C[0]`;
  };
  if(fragText){
    if(metaValues[2] >= 0){fragText += ` \\C[${colorCode}]×${metaValues[2]}\\C[0]] `};
    if(metaValues[1] >= 1){fragText += `\\I[666]:${metaValues[1]}`};
    if(databaseTypeId == 3){
      if(item.stypeId == 12){
        if(itemMeta['ユニーク']){//武器を特定できないため無効状態
          fragText += `+強化段階`;
        } else {
          fragText += `+装備レア度`;
        };
      };
    };
    suffixText += `${fragText} `;//元文章の後に追記される。
  };
  if(itemMeta['LevelFluctuation']){
    var levelFluctuation = itemMeta['LevelFluctuation'];
    suffixText += `[${levelFluctuation}ﾚﾍﾞﾙ毎に威力+]`;
  };
};

if(item.damage.type >= 1){
  if(itemMeta['PotionUsePoint']){
    if(item.damage.type == 3){var fragText = 'HP'};//HP回復
    if(item.damage.type == 4){var fragText = 'MP'};//MP回復
      if(Number(itemMeta['PotionUsePoint']) >= 2){
        var effectValue = Number(itemMeta['PotionUsePoint']);
      } else {
        var effectValue = `全`;
      };
      const recoveryText = `回復`;//翻訳対象
      effectText += `[\\C[${colorCode}]${fragText}\\C[3]${effectValue}\\C[0]${recoveryText}]`;
  };
};
if(itemMeta['SkillStateAddRemove']){
  var fragText = Number(itemMeta['SkillStateAddRemove']);
  const stateNameCode = `\x1bSIM[${fragText}]`;//ステート名コード。翻訳対象外
  const grantRemoveText = `付与/解除`;//翻訳対象
  effectText += `[\\C[${colorCode}]${stateNameCode}\\C[0]${grantRemoveText}]`;//
};
if(itemMeta['PotionResist']){
  var fragText = Number(itemMeta['PotionResist']);
  effectText += `[\\I[624]+${fragText}%]`;
};
if(item.speed != 0){
  var fragText = item.speed;
  const speedLabel = `Speed`;//翻訳対象
  effectText += `\\C[${colorCode}]${speedLabel}\\C[0]:${fragText} `;
};
if(itemMeta['Repeat']){
  var fragText = Number(itemMeta['Repeat']);
  effectText += `\\I[668]:${fragText} `;
};
if(itemMeta['Warmup']){
  var fragText = Number(itemMeta['Warmup']);
  effectText += `\\I[662]:${fragText} `;
};
if(itemMeta['Cooldown']){
  var fragText = Number(itemMeta['Cooldown']);
  effectText += `\\I[663]:${fragText} `;
};
if(itemMeta['RankUpPoint']){
  var fragText = Number(itemMeta['RankUpPoint']);
  if(itemMeta['Max Mastery Level']){
    if(Number(itemMeta['Max Mastery Level']) == 1){
      effectText += `\\I[664]:${fragText} `;
    } else {
      effectText += `\\I[664]:${fragText}*${RANK_LABEL} `;
    };
  };
};
//if(itemMeta['Max Mastery Level']){
//  value10 += `\\I[664]:Rank*Exp `;
//};//冗長なので使用しない。
if(itemMeta['Max Mastery Level']){
  var fragText = Number(itemMeta['Max Mastery Level']);
  effectText += `\\I[665]:${fragText} `;
};
if(item.tpGain != 0){
  var fragText = item.tpGain;
  effectText += `\\C[${colorCode}]${TP_LABEL}\\C[0]:${fragText}\\C[10]↑\\C[0] `;
};

var additionalSetTextByTarget = [
  0,
  `[\\C[${colorCode}]${ADDITIONAL_SET_TARGET_LABELS[1]}`,
  `[\\C[${colorCode}]${ADDITIONAL_SET_TARGET_LABELS[2]}`,
  `[\\C[${colorCode}]${ADDITIONAL_SET_TARGET_LABELS[3]}`,
  `[\\C[${colorCode}]${ADDITIONAL_SET_TARGET_LABELS[4]}`,
];
var additionalSetCountByTarget = [0,0,0,0,0];
// Nine `<additionalSetN>` slots, each `target,flag,stacks,stateId`. The state
// icon ladder and the four-way "which target" dispatch were written out twice
// per slot; the icon is now a helper and the target is just an index.
for (let additionalSetSlot = 1; additionalSetSlot <= 9; additionalSetSlot++) {
  const additionalSetMeta = itemMeta['additionalSet' + additionalSetSlot];
  if(!additionalSetMeta){ continue; };
  const additionalSetValues = splitMetaValues(additionalSetMeta);
  const targetIndex = Number(additionalSetValues[0]);
  if(targetIndex < 1 || targetIndex > 4){ continue; };
  additionalSetCountByTarget[targetIndex] += 1;
  if(Number(additionalSetValues[1]) == 1){
    additionalSetTextByTarget[targetIndex] +=
      additionalSetStateIcon(Number(additionalSetValues[3]), Number(additionalSetValues[2]));
  };
};
// A target whose slots all lacked the flag still bumps its count, so the line
// below prints an empty "付与" for it — that is the original behaviour.
for (let targetIndex = 1; targetIndex <= 4; targetIndex++) {
  if(additionalSetCountByTarget[targetIndex] >= 1){
    const additionalSetGrantText = `付与`;//翻訳対象
    effectText += `${additionalSetTextByTarget[targetIndex]}${additionalSetGrantText}\\C[0]] `;
  };
};

  // Effect codes 11/12/13 are the HP/MP/TP recovery rows and 21/22 the state
  // add/remove rows. Each was written out twice (percentage field plus flat
  // field) or once per state id by scanning the whole state list; only one
  // `code` can match per effect, so this is a single dispatch.
  for (let effectIndex = 0; effectIndex <= 19; effectIndex++) {
    const effect = item.effects[effectIndex];
    if(!effect){ continue; };
    const effectIcon = RECOVERY_EFFECT_ICONS[effect.code];

    if(effectIcon && effect.dataId == 0){
      const percentValue = Math.round(effect.value1 * (effect.code == 13 ? 1 : 100));
      if(percentValue != 0){
        effectText += recoveryEffectText(effectIcon, percentValue, `%`,
          effect.code == 13 ? (percentValue >= 1 ? `up` : `down`) : ``);
      };
      // TP (13) has no flat-value field.
      if(effect.code != 13 && effect.value2 != 0){
        effectText += recoveryEffectText(effectIcon, effect.value2, ``, ``);
      };
    };

    if(effect.code == 21 || effect.code == 22){
      const stateId = effect.dataId;
      if(stateId < 1 || stateId > $dataStates.length-1){ continue; };
      const state = $dataStates[stateId];
      const stateIcon = state.iconIndex >= 1 ? `\x1bI[${state.iconIndex}]` : `${state.name}`;

      if(effect.code == 22){
        const removePercent = Math.round(effect.value1 * 100);
        const removalLabel = `解除`;//翻訳対象
        effectText += removePercent == 100
          ? `[\\C[3]${removalLabel}:\\C[0]${stateIcon}]`
          : `[\\C[3]${removalLabel}:\\C[0]${stateIcon}${removePercent}%]`;
        continue;
      };

      // 21: a repeat of the previous state collapses to a bare `+`.
      if(stateId == prevStateCode){
        consecStateCount += 1;
        effectText += `\\C[${colorCode}]+\\C[0]`;
        continue;
      };
      prevStateCode = stateId;
      consecStateCount = 0;
      // Battle states (206-217) draw from their own icon sheet and carry no
      // turn counter.
      const isBattleState = stateId >= 206 && stateId <= 217;
      let turnText = ``;
      if(!isBattleState && state.autoRemovalTiming >= 1){
        turnText = state.minTurns == state.maxTurns
          ? ` ${state.minTurns}t`
          : ` ${state.minTurns}～${state.maxTurns}t`;
      };
      const grantPercent = Math.round(effect.value1 * 100);
      const grantLabel = `付与`;//翻訳対象
      effectText += grantPercent == 100
        ? `[\\C[${colorCode}]${grantLabel}:\\C[0]${stateIconText(stateId)}${turnText}]`
        : `[\\C[${colorCode}]${grantLabel}:\\C[0]${stateIconText(stateId)}${grantPercent}%${turnText}]`;
    };
  };

};//スキルのみの処理終わり

if(itemMeta['dispelCount']){
  var fragText = Number(itemMeta['dispelCount']);
  const dispelStateText = `強化状態`;//翻訳対象
  const dispelCountSuffix = `つ`;//翻訳対象
  const dispelActionText = `消去`;//翻訳対象
  effectText += `[\\C[${colorCode}]${dispelStateText}\\C[3]${fragText}${dispelCountSuffix}\\C[${colorCode}]${dispelActionText}\\C[0]]`;
};
if(itemMeta['abNomalClearCount']){
  var fragText = Number(itemMeta['abNomalClearCount']);
  const clearCountSuffix = `つ`;//翻訳対象
  const clearRecoverText = `回復`;//翻訳対象
  if(itemMeta['StateabNomalOnly']){
    effectText += `[\\C[${colorCode}]\\I[683]\\C[3]${fragText}${clearCountSuffix}\\C[${colorCode}]${clearRecoverText}\\C[0]]`;
  } else {
    effectText += `[\\C[${colorCode}]\\I[683]\\I[684]\\C[3]${fragText}${clearCountSuffix}\\C[${colorCode}]${clearRecoverText}\\C[0]]`;
  };
};
if(itemMeta['abNomalClearCountPlus']){
  const ailmentRecoveryText = `状態異常回復数+(Magic/300)`;//翻訳対象
  effectText += `[\\C[${colorCode}]${ailmentRecoveryText}\\C[0]]`;
};
if(itemMeta['dispelCountPlus']){
  const buffRemovalText = `強化解除数+(Magic/300)`;//翻訳対象
  effectText += `[\\C[${colorCode}]${buffRemovalText}\\C[0]]`;
};

if(itemMeta['Passive State'] && !itemMeta['パッシブ隠蔽']){
  if($dataStates[Number(itemMeta['Passive State'])] && $dataStates[Number(itemMeta['Passive State'])].meta['SpcialState']){
    const specialEffectGrantText = `特殊効果付与`;//翻訳対象
    effectText += `\\C[${colorCode}]${specialEffectGrantText}\\C[0]<\x1bSIM[${Number(itemMeta['Passive State'])}]> `;
  } else {
    const passiveGrantText = `付与`;//翻訳対象
    effectText += `\\C[${colorCode}]${passiveGrantText}\\C[0]<\x1bSIM[${Number(itemMeta['Passive State'])}]> `;
  };
};//パッシブステート

//属性威力加算
for (let elementId = 1; elementId <= $dataSystem.elements.length-1; elementId++) {
  const amplifyValue = itemMeta['Element Amplify ' + elementId];
  if(amplifyValue){
    effectText += `${elementAmplifyLabel(elementId)}${amplifyValue.replace(' ','')} `;
  };
};

if(itemMeta['PassiveElementP']){//<Max Mastery Level: 5>
  const metaValues = splitMetaValues(itemMeta['PassiveElementP']);
  const amplifyValue = Number(metaValues[1]);
  var colorCode = amplifyValue >= 1 ? 10 : 1;
  const rankPrefix = itemMeta['Max Mastery Level'] ? `Rank*` : ``;
  effectText += `\\C[${colorCode}]<${elementAmplifyLabel(metaValues[0])}${rankPrefix}${amplifyValue}%\\C[0]>`;
  var colorCode = 2;
};
if(itemMeta['SpecialAttack']){
  var effectValue = Number(itemMeta['SpecialAttack']);
  var fragText = `<\x1bSIN[${effectValue}]>`;
  const attackLabel = `Attack`;//翻訳対象
  effectText += `\\C[${colorCode}]${attackLabel}\\C[0]${fragText} `;
};
if(itemMeta['AddPowerWeapon']){
  var effectValue = itemMeta['AddPowerWeapon'];
  effectText += `\\I[666]+${effectValue} `;
};//スキルのパワーに加算
if(itemMeta['Critical Multiplier']){
  var effectValue = itemMeta['Critical Multiplier'].replace(' ','');
  effectText += `\\I[78]${POWER_LABEL}${effectValue} `;
};//会心威力
if(itemMeta['Counter Skills']){
  var effectValue = itemMeta['Counter Skills'];
  const counterSkillLabel = `反撃スキル`;//翻訳対象
  effectText += `\\C[16]${counterSkillLabel}:\x1bSIN[${effectValue}]\\C[0] `;
};
if(itemMeta['Counter Total']){
  var effectValue = itemMeta['Counter Total'];
  var effectValue = effectValue.replace(" +", "");
  const maxCounterText = `最大反撃回数:${Number(effectValue)+1}回`;//翻訳対象
  effectText += `\\C[16][${maxCounterText}]\\C[0] `;
};
if(itemMeta['CertainlyDouble']){
  const certainlyDoubleText = `必ず2連撃以上`;//翻訳対象
  effectText += `\\C[16][${certainlyDoubleText}]\\C[0] `;
};
if(itemMeta['CertainlyTriple']){
  const certainlyTripleText = `必ず3連撃`;//翻訳対象
  effectText += `\\C[16][${certainlyTripleText}]\\C[0] `;
};
if(itemMeta['NormalAttackHit']){
  var effectValue = itemMeta['NormalAttackHit'];
  const normalAttackHitText = `通常攻撃Hit数+${effectValue}`;//翻訳対象
  effectText += `\\C[16][${normalAttackHitText}]\\C[0] `;
};
if(itemMeta['AttackAbilityHit']){
  var effectValue = itemMeta['AttackAbilityHit'];
  const attackAbilityHitText = `通常/アビリティ攻撃Hit数+${effectValue}`;//翻訳対象
  effectText += `\\C[16][${attackAbilityHitText}]\\C[0] `;
};
if(itemMeta['BattleAddAttackSet']){
  var effectValue = itemMeta['BattleAddAttackSet'];
  const pursuitText = `追撃${effectValue}%`;//翻訳対象
  effectText += `\\C[16][${pursuitText}]\\C[0] `;
};
if(itemMeta['Evade Counter']){
  const evadeCounterText = `回避後に反撃`;//翻訳対象
  effectText += `\\C[16][${evadeCounterText}]\\C[0] `;
};
if(itemMeta['Hit Counter']){
  const hitCounterText = `攻撃受後に反撃`;//翻訳対象
  effectText += `\\C[16][${hitCounterText}]\\C[0] `;
};
if(itemMeta['MaxTp']){
  var effectValue = itemMeta['MaxTp'];
  const maxTpLabel = `MaxTp`;//翻訳対象
  effectText += `\\C[16]${maxTpLabel}\\C[0]+${effectValue} `;
};
if(itemMeta['elementRegist6']){
  var effectValue = itemMeta['elementRegist6'];
  if(effectValue == 0){
    const sixElementFullResistText = `六属性完全耐性`;//翻訳対象
    effectText += `\\C[${colorCode}]${sixElementFullResistText}\\C[0] `;
  } else {
    const sixElementResistText = `六属性耐性`;//翻訳対象
    effectText += `\\C[${colorCode}]${sixElementResistText}\\C[0]${effectValue}% `;
  };
};
if(itemMeta['elementRegist9']){
  var effectValue = itemMeta['elementRegist9'];
  if(effectValue == 0){
    const nineElementFullResistText = `九属性完全耐性`;//翻訳対象
    effectText += `\\C[${colorCode}]${nineElementFullResistText}\\C[0] `;
  } else {
    const nineElementResistText = `九属性耐性`;//翻訳対象
    effectText += `\\C[${colorCode}]${nineElementResistText}\\C[0]${effectValue}% `;
  };
};
if(itemMeta['StateabNomalResist']){
  var effectValue = itemMeta['StateabNomalResist'];
  if(effectValue == 0){
    const nullifyText = `無効`;//翻訳対象
    effectText += `\\C[${colorCode}]\\I[683]${nullifyText}\\C[0] `;
  } else {
    const resistText = `耐性`;//翻訳対象
    effectText += `\\C[${colorCode}]\\I[683]${resistText}\\C[0]+${effectValue}% `;
  };
};
if(itemMeta['StateSPabNomalResist']){
  var effectValue = itemMeta['StateSPabNomalResist'];
  if(effectValue == 0){
    const spNullifyText = `無効`;//翻訳対象
    effectText += `\\C[${colorCode}]\\I[684]${spNullifyText}\\C[0] `;
  } else {
    const spResistText = `耐性`;//翻訳対象
    effectText += `\\C[${colorCode}]\\I[684]${spResistText}\\C[0]+${effectValue}% `;
  };
};
if(itemMeta['DispelGuard']){
  const dispelGuardText = `強化消去無効`;//翻訳対象
  effectText += `\\C[${colorCode}]${dispelGuardText}\\C[0] `;
};
if(itemMeta['Level Up Recover All']){
    const levelUpRecoverAllText = `LvUp時に全回復`;//翻訳対象
    effectText += `[\\C[16]${levelUpRecoverAllText}\\C[0]]`;
};
if(itemMeta['Bypass Damage Cap']){
  const bypassDamageCapText = `D.Cap無効`;//翻訳対象
  effectText += `\\C[16]${bypassDamageCapText}\\C[0] `;
} else {
  if(itemMeta['Damage Cap']){
    var effectValue = itemMeta['Damage Cap'].replace(' ','');
    const damageCapLabel = `D.Cap`;//翻訳対象
    effectText += `\\C[16]${damageCapLabel}:\\C[0]${effectValue} `;
  };
};
if(itemMeta['Bypass Heal Cap']){
  const bypassHealCapText = `H.Cap無効`;//翻訳対象
  effectText += `\\C[16]${bypassHealCapText}\\C[0] `;
} else {
  if(itemMeta['Heal Cap']){
    var effectValue = itemMeta['Heal Cap'].replace(' ','');
    const healCapLabel = `H.Cap`;//翻訳対象
    effectText += `\\C[16]${healCapLabel}:\\C[0]${effectValue} `;
  };
};
if(itemMeta['HP Cost']){
  var effectValue = itemMeta['HP Cost'].replace(' ','');
  const hpCostText = `HP${effectValue}消費`;//翻訳対象
  effectText += `[\\C[16]${hpCostText}\\C[0]]`;
};
if(itemMeta['MP Cost']){
  var effectValue = itemMeta['MP Cost'].replace(' ','');
  const mpCostText = `MP${effectValue}消費`;//翻訳対象
  effectText += `[\\C[16]${mpCostText}\\C[0]]`;
};
if(itemMeta['SpcialState']){
  // The two `\x1bSIM[n]` codes expand to *state names*, i.e. to other
  // game text, so they stay outside the translatable strings.
  const activationStateIcon = `\x1bSIM[110]`;//ステート名コード。翻訳対象外
  const activationText = `で発動`;//翻訳対象
  const expiryStateIcon = `\x1bSIM[109]`;//ステート名コード。翻訳対象外
  const expiryText = `で効果消失`;//翻訳対象
  suffixText += `[\\C[${colorCode}]${activationStateIcon}${activationText}\\C[0]][${expiryStateIcon}${expiryText}]`;
  const activationConditionText = `行動時MP消費/消費MP未満で`;//翻訳対象
  const grantText = `付与`;//翻訳対象
  effectText += `[\\C[${colorCode}]${activationConditionText}\\I[252]${grantText}\\C[0]]`;
};
if(itemMeta['activateRate']){
  var effectValue = Math.round(itemMeta['activateRate'] * 100);
  const consumeMpText = `消費MP:MMP`;//翻訳対象
  suffixText += `[${consumeMpText}\\C[10]${effectValue}%\\C[0]]`;
};
if(itemMeta['activatePoint']){//使ってない？
  var effectValue = itemMeta['activatePoint'];
  const consumeMpLabel = `消費MP:`;//翻訳対象
  suffixText += `[${consumeMpLabel}\\C[2]${effectValue}\\C[0]]`;
};
if(itemMeta['Global Cooldown']){
  var effectValue = Number(itemMeta['Global Cooldown']);
  const allCooldownLabel = `全てのCT:`;//翻訳対象
  suffixText += `[${allCooldownLabel}\\C[2]${effectValue}\\C[0]]`;
};
// `SType N Cooldown` / `SType N Warmup` for skill types 1-15: the same row with
// a different icon, written out twice.
for (let skillTypeId = 1; skillTypeId <= 15; skillTypeId++) {
  for (const [metaSuffix, iconId] of [[`Cooldown`, 663], [`Warmup`, 662]]) {
    const metaValue = itemMeta[`SType ${skillTypeId} ${metaSuffix}`];
    if(!metaValue){ continue; };
    var colorCode = Number(metaValue) < 0 ? 3 : 1;
    effectText += `[${$dataSystem.skillTypes[skillTypeId]}\\C[${colorCode}]\\I[${iconId}]${Number(metaValue)}\\C[0]]`;
  };
};
var colorCode = 2;
effectText += lifeStealGroupText(itemMeta, `HP`, `反動ﾀﾞﾒｰｼﾞ`);
var colorCode = 2;
effectText += lifeStealGroupText(itemMeta, `MP`, `消耗`);
var colorCode = 2;
if(itemMeta['HP Life Steal']){
  var effectValue = itemMeta['HP Life Steal'].replace(' ','');
  var effectValue = effectValue.replace('%','');
  effectText += `[\\C[${colorCode}]${DRAIN_LABEL}${Number(effectValue)}%HP${ABSORB_LABEL}\\C[0]]`;
};
if(itemMeta['MP Life Steal']){
  var effectValue = itemMeta['MP Life Steal'].replace(' ','');
  var effectValue = effectValue.replace('%','');
  effectText += `[\\C[${colorCode}]${DRAIN_LABEL}${Number(effectValue)}%HP${ABSORB_LABEL}\\C[0]]`;
};
if(itemMeta['RankMaxLearning']){
  if(item.stypeId != 11){//召喚は前提スキルがあるため除外
    if(Number(itemMeta['Max Mastery Level']) >= 2){
      const rankMaxLearnText = `RankMaxで習得が可能になる`;//翻訳対象
      effectText += `[\\C[${colorCode}]${rankMaxLearnText}\\C[0]]`;
    } else {
      const masteryMaxLearnText = `熟練度Maxで習得が可能になる`;//翻訳対象
      effectText += `[\\C[${colorCode}]${masteryMaxLearnText}\\C[0]]`;
    };
  };
};
if(itemMeta['trapEvasion']){
  const trapEvasionText = `引っ掛かったトラップを自動で回避する`;//翻訳対象
  effectText += `[\\C[${colorCode}]${trapEvasionText}\\C[0]]`;
};
if(itemMeta['SemenRemove']){
  var colorCode = 27;
  var effectValue = Number(itemMeta['SemenRemove']);
  const semenRemoveText = `状態異常精液${effectValue}つ回復`;//翻訳対象
  effectText += `[\\C[${colorCode}]${semenRemoveText}\\C[0]]`;
};
if(itemMeta['HstaSuppression']){
  var colorCode = 27;
  var metaValues = itemMeta['HstaSuppression'].split(',');
  var effectValue = Number(metaValues[1]);
  const desireLimitText = `性欲度${effectValue*100}まで`;//翻訳対象
  const developmentLimitText = `各開発/経験度${effectValue}まで`;//翻訳対象
  if(Number(metaValues[0]) == 0){
    effectText += `[\\C[${colorCode}]${desireLimitText}\\C[0]][\\C[${colorCode}]${developmentLimitText}\\C[0]]`;
  } else {
    const rankVariableName = $dataSystem.variables[Number(metaValues[0])];
    const rankLimitText = `のランク${effectValue}まで`;//翻訳対象
    effectText += `[\\C[${colorCode}]${rankVariableName}${rankLimitText}\\C[0]]`;
  };
};
var colorCode = 2;
if(itemMeta['TPGain1']){
  var effectValue = itemMeta['TPGain1'];
  effectText += `[\\C[${colorCode}]${TP_LABEL}${effectValue}%\\C[0]]`;
};
if(itemMeta['gainExp']){
  var effectValue = itemMeta['gainExp'];
  const gainExpLabel = `獲得Exp`;//翻訳対象
  effectText += `[\\C[${colorCode}]${gainExpLabel}:${effectValue}%\\C[0]]`;
};
for (let tierIndex = 1; tierIndex <= 6; tierIndex++) {
  const tierSlots = itemMeta['Skill Tier ' + tierIndex + ' Slots'];
  if(tierSlots){
    var colorCode = 16;
    effectText += `[\\C[${colorCode}]${SKILL_TIER_SLOT_LABELS[tierIndex]}\\C[2]${tierSlots.replace(' ','')}\\C[0]]`;
  };
};
var colorCode = 2;

//称号関係
if(itemMeta['titleGetSwitch']){
  var effectValue = Number(itemMeta['titleGetSwitch']);
  if(effectValue == 2 || itemMeta['DescriptionWord']){}else{
    effectText += `\\C[${colorCode}][${CONDITION_LABEL}:${$dataSystem.switches[effectValue]}]\\C[0]`;
  };
};
if(itemMeta['titleGetVariable']){
  var metaValues = itemMeta['titleGetVariable'].split(',');
  if(itemMeta['DescriptionWord']){}else{
    effectText += `\\C[${colorCode}][${CONDITION_LABEL}:${$dataSystem.variables[Number(metaValues[0])]}:${Number(metaValues[1])}]\\C[0]`;
  };
};
if(itemMeta['titleGetArray']){
  var metaValues = itemMeta['titleGetArray'].split(',');
  if(itemMeta['DescriptionWord']){}else{
    if(Number(metaValues[0]) == 52){
      const subjugationCountLabel = `体討伐`;//翻訳対象
      effectText += `\\C[${colorCode}][${CONDITION_LABEL}:\x1bSIM[${Number(metaValues[1])}]:${Number(metaValues[2])}${subjugationCountLabel}]\\C[0]`;
    };
  };
};
if(itemMeta['titleGetItems']){
  var metaValues = itemMeta['titleGetItems'].split(',');
  if(itemMeta['DescriptionWord']){}else{
    const quantityLabel = `個`;//翻訳対象
    effectText += `\\C[${colorCode}][${CONDITION_LABEL}:\x1bIIN[${Number(metaValues[0])}]:${Number(metaValues[1])}${quantityLabel}]\\C[0]`;
  };
};
if(itemMeta['titleGetSkillRank']){
  var metaValues = itemMeta['titleGetSkillRank'].split(',');
  const partyMemberLabel = `パーティの誰かが`;//翻訳対象
  effectText += `\\C[${colorCode}][${CONDITION_LABEL}:${partyMemberLabel}\x1bSIN[${Number(metaValues[0])}]${RANK_LABEL}:${Number(metaValues[1])}${OR_MORE_SUFFIX}]\\C[0]`;
};
if(itemMeta['titleGetAchievement']){
  var metaValues = itemMeta['titleGetAchievement'].split(',');
  if(itemMeta['DescriptionWord']){}else{
    const achievementName = ACHIEVEMENT_NAMES[Number(metaValues[0])];
    const personalTagLabel = `個人`;//翻訳対象
    const personalTag = itemMeta['KojinTitle'] ? `[${personalTagLabel}]` : ``;
    effectText += `\\C[${colorCode}][${CONDITION_LABEL}:${achievementName}${personalTag}:${Number(metaValues[1])}]\\C[0]`;
  };
};
if(itemMeta['HtitleGetArray']){
  var metaValues = itemMeta['HtitleGetArray'].split(',');
  if(itemMeta['DescriptionWord']){}else{
    effectText += `\\C[${colorCode}][${CONDITION_LABEL}:${$dataSystem.variables[Number(metaValues[0]) + 400]}:${Number(metaValues[1])}]\\C[0]`;
  };
};
if(itemMeta['annihilationTitle']){
  var metaValues = itemMeta['annihilationTitle'].split(',');
  const annihilationCountLabel = `殲滅回数`;//翻訳対象
  const totalAnnihilationCountLabel = `の総殲滅回数`;//翻訳対象
  const allMapsLabel = `全マップ`;//翻訳対象
  const allDungeonsLabel = `全ダンジョン`;//翻訳対象
  const timesOrMoreSuffix = `回以上`;//翻訳対象
  if(Number(metaValues[0]) >= 20 && $dataItems[Number(metaValues[0])]){
    var effectValue = `\\C[1]<${$dataItems[Number(metaValues[0])].name}>\\C[0]${annihilationCountLabel}:\\C[10]${Number(metaValues[1])}\\C[0]${timesOrMoreSuffix}`;
  };
  if(Number(metaValues[0]) == 1){
    var effectValue = `\\C[1]<${allMapsLabel}>\\C[0]${totalAnnihilationCountLabel}:\\C[10]${Number(metaValues[0])}\\C[0]${timesOrMoreSuffix}`;
  };
  if(Number(metaValues[0]) == 2){
    var effectValue = `\\C[1]<${allDungeonsLabel}>\\C[0]${totalAnnihilationCountLabel}:\\C[10]${Number(metaValues[0])}\\C[0]${timesOrMoreSuffix}`;
  };
    effectText += `\\C[${colorCode}][${CONDITION_LABEL}:${effectValue}\\C[${colorCode}]]\\C[0]`;
};
if(itemMeta['PassivePlusTrait']){
  var metaValues = itemMeta['PassivePlusTrait'].split(',');
  if(Number(metaValues[0]) == 11){
    var effectValue = Number(metaValues[2]);
    const damageResistLabel = `ダメージ耐性`;//翻訳対象
    const elementName = $dataSystem.elements[Number(metaValues[1])];
    if(effectValue >= 0){
      effectText += `[\\C[${colorCode}]${elementName}\\C[0]${damageResistLabel}${Math.round(effectValue * 100)}%Down]`;
    } else {
      var effectValue = effectValue - effectValue - effectValue;
      effectText += `[\\C[${colorCode}]${elementName}\\C[0]${damageResistLabel}${Math.round(effectValue * 100)}%Up]`;
    };
  };
};
if(itemMeta['PassivePlusEffect']){//PassiveCondi
  var metaValues = itemMeta['PassivePlusEffect'].split(',');
  if(Number(metaValues[0]) == 0){
    var effectValue = TextManager.param(Number(metaValues[1]));
  };
  if(Number(metaValues[0]) == 1){
    var effectValue = FTKR.CSS.cssStatus.xparam[Number(metaValues[1])];
  };
  if(Number(metaValues[0]) == 2){
    var effectValue = FTKR.CSS.cssStatus.sparam[Number(metaValues[1])];
  };   
  effectText += `[\\C[${colorCode}]${effectValue}\\C[0]+${Math.round(Number(metaValues[2]) * 100)}%]`;
};
//称号効果
if(itemMeta['titleEffectConfiVal']){
  var metaValues = itemMeta['titleEffectConfiVal'].split(',');
  if(itemMeta['DescriptionWord']){}else{
    effectText += `[\\C[${colorCode}]${$dataSystem.variables[Number(metaValues[0])]}:+${Number(metaValues[1])}\\C[0]]`;
  };
};
if(itemMeta['titleEffectConfiSwi']){
  var effectValue = Number(itemMeta['titleEffectConfiSwi']);
  effectText += `[\\C[${colorCode}]${$dataSystem.switches[effectValue]}\\C[0]]`;
};

if(itemMeta['titleSenkaGet']){
  var effectValue = Number(itemMeta['titleSenkaGet']);
  effectText += `[\\C[${colorCode}]\x1bIIN[10]+${effectValue}\\C[0]]`;
};
//称号効果 / 食事バフ: the same nine-slot body twice.
for (const statEffectPrefix of [`titleEffect`, `eatEffect`]) {
for (let statEffectSlot = 1; statEffectSlot <= 9; statEffectSlot++) {
  const statEffectMeta = itemMeta[statEffectPrefix + statEffectSlot];
  if(!statEffectMeta){ continue; };
  const metaValues = splitMetaValues(statEffectMeta);
  const statSource = Number(metaValues[0]);
  if(statSource == 4){
    // Element resist: the element name goes straight to the output, and the row
    // is labelled 耐性 — except for the resist-special elements, which keep
    // whatever the previous slot left in `effectValue`.
    effectText += `${$dataSystem.elements[Number(metaValues[1])]}`;
    if(RESIST_SPECIAL_ELEMENT_IDS.indexOf(Number(metaValues[1])) < 0){
      var effectValue = `耐性`;
    };
  } else if(statSource >= 0 && statSource <= 3){
    var effectValue = statEffectName(metaValues);
  };
  // `x - x - x` in the original is just `-x`, i.e. the magnitude.
  const statPercent = Math.abs(Number(metaValues[2])) * 100;
  var colorCode = 1;
  effectText += `[\\C[${colorCode}]${effectValue}\\C[0]+\\C[2]${statPercent}\\C[0]%]`;
  var colorCode = 2;
};
};
//娼婦系説明文
if(itemMeta['ProstitutionMoneyUp']){
    var effectValue = itemMeta['ProstitutionMoneyUp'];
    const prostitutionBonusText = `売春額に${effectValue}倍補正`;//翻訳対象
    effectText += `\\C[27]${prostitutionBonusText}\\C[0] `;
};
if(itemMeta['BustSizeChange']){
    var effectValue = itemMeta['BustSizeChange'];
    const bustSizeLabel = `BustSize`;//翻訳対象
    effectText += `\\C[27]${bustSizeLabel}+${effectValue}cm\\C[0] `;
};
if(itemMeta['HipSizeChange']){
    var effectValue = itemMeta['HipSizeChange'];
    const hipSizeLabel = `HipSize`;//翻訳対象
    effectText += `\\C[27]${hipSizeLabel}+${effectValue}cm\\C[0] `;
};
if(itemMeta['BodyWeightChange']){
    var effectValue = itemMeta['BodyWeightChange'];
    const bodyWeightLabel = `BodyWeight`;//翻訳対象
    effectText += `\\C[27]${bodyWeightLabel}+${effectValue}kg\\C[0] `;
};

if(itemMeta['下級鑑定品'] || itemMeta['中級鑑定品'] || itemMeta['上級鑑定品']){
  const unidentifiedLabel = `未鑑定品`;//翻訳対象
  const lowGradeLabel = `下級`;//翻訳対象
  const midGradeLabel = `中級`;//翻訳対象
  const highGradeLabel = `上級`;//翻訳対象
  var fragText = `\\C[3][${unidentifiedLabel}]\\C[0]`;
    if(itemMeta['下級鑑定品']){fragText += `\\C[${colorCode}][${lowGradeLabel}]\\C[0]`};
    if(itemMeta['中級鑑定品']){fragText += `\\C[${colorCode}][${midGradeLabel}]\\C[0]`};
    if(itemMeta['上級鑑定品']){fragText += `\\C[${colorCode}][${highGradeLabel}]\\C[0]`};
      effectText += `${fragText} `;
};

if(itemMeta['walletIn']){
  var effectValue = itemMeta['BodyWeightChange'];
  const useWithLabel = `使用で`;//翻訳対象
  const obtainLabel = `入手`;//翻訳対象
  effectText += `\\C[${colorCode}][${useWithLabel}\\G${obtainLabel}]\\C[0] `;
};
if(itemMeta['QuestSetMap']){
  if(Number(itemMeta['QuestSetMap']) == 0){
    var effectValue = `[常設]`;
  } else {
    var effectValue = $dataSystem.switches[Number(itemMeta['QuestSetMap'])];
  };
  var colorCode = 16;
  const acceptLabel = `受注`;//翻訳対象
  effectText += `[\\C[${colorCode}]${acceptLabel}\\C[0]:\\C[2]${effectValue}\\C[0]] `;
  var colorCode = 2;
};
if(itemMeta['QuestSubjectMap']){
  var effectValue = $dataSystem.switches[Number(itemMeta['QuestSubjectMap'])];
  var colorCode = 16;
  const targetLabel = `対象`;//翻訳対象
  effectText += `[\\C[${colorCode}]${targetLabel}\\C[0]:\\C[2]${effectValue}\\C[0]]\n`;
  var colorCode = 2;
};
if(itemMeta['QuestSuitableLv']){
    var effectValue = Number(itemMeta['QuestSuitableLv']);
    var colorCode = 16;
    effectText += `[\\C[${colorCode}]${SUITABLE_LV_LABEL}\\C[0]:\\C[2]${effectValue}\\C[0]] `;
    var colorCode = 2;
} else {
  if(itemMeta['QuestSubjectMap']){
    var effectValue = Number(itemMeta['QuestSubjectMap']);
    for (var traitDataId = 1; traitDataId <= $dataItems.length-1; traitDataId++) {
      if($dataItems[traitDataId].meta['MapSwitch']){
        if(Number($dataItems[traitDataId].meta['MapSwitch']) == effectValue){
          if($dataItems[traitDataId].meta['EnemyLV']){
            var metaValues = $dataItems[traitDataId].meta['EnemyLV'].split(',');
            var fragText = Math.min(...metaValues);
            var colorCode = 16;
            effectText += `[\\C[${colorCode}]${SUITABLE_LV_LABEL}\\C[0]:\\C[2]${fragText}\\C[0]] `;
            var colorCode = 2;
            break;
    }}}};
  };
};
var colorCode = 2;
// `<QuestCompXxx1>`: eight near-identical blocks, each shown when the first
// field is at least 1. QuestCompSkillRank1 used to put its brackets inside the
// colour code instead of around it; that tag is unused in this database, so
// normalising it is byte-neutral (and the golden diff proves it).
for (const [questMetaKey, questLabel] of QUEST_OBJECTIVE_LABELS) {
  const questMeta = itemMeta[questMetaKey];
  if(questMeta && Number(questMeta.split(',')[0]) >= 1){
    effectText += `[\\C[${colorCode}]${questLabel}\\C[0]] `;
  };
};
if(itemMeta['CoercionQuest']){
  const questForcedProgressText = `クエスト進行中に強制進行あり`;//翻訳対象
  effectText += `[\\C[${colorCode}]${questForcedProgressText}\\C[0]] `;
};
if(itemMeta['Stuff']){
  var effectValue = Number(itemMeta['Stuff']);
  const satietyText = `満腹度+${effectValue}（${$gameVariables.value(16)}/${$gameVariables.value(13)}）`;//翻訳対象
  effectText += `\\C[${colorCode}][${satietyText}]\\C[0] `;
};
if(itemMeta['ＴＰ']){
  var effectValue = Number(itemMeta['ＴＰ']);
  effectText += `\\C[${colorCode}][${TP_LABEL}+${effectValue}]\\C[0] `;
};
if(itemMeta['Ingredients']){
  const ingredientLabel = `食材(換金用途)`;//翻訳対象
  effectText += `\\C[${colorCode}][${ingredientLabel}]\\C[0] `;
};
if(itemMeta['Alcohol']){
  const alcoholLabel = `アルコール`;//翻訳対象
  effectText += `\\C[${colorCode}][${alcoholLabel}]\\C[0] `;
};
if(itemMeta['ExpiryDate']){
  if(itemMeta['Menu Category']){
    if(itemMeta['Menu Category'] == ' Food'){
      const expirySameDayLabel = `賞味期限当日中`;//翻訳対象
      effectText += `\\C[${colorCode}][${expirySameDayLabel}]\\C[0] `;
    };
  } else {
      const expiryNextDayLabel = `翌日自動返却`;//翻訳対象
      effectText += `\\C[${colorCode}][${expiryNextDayLabel}]\\C[0] `;
  };
};
if(itemMeta['EventFactorClearReset']){
  const questItemLabel = `クエスト関連アイテム`;//翻訳対象
  effectText += `\\C[${colorCode}][${questItemLabel}]\\C[0] `;
};
if(itemMeta['AddPowerCustom']){
  var effectValue = Number(itemMeta['AddPowerCustom']);
    if(effectValue >= 1){
      effectText += `\\I[666]+${effectValue} `;
    };
};
if(itemMeta['RaceDropRarity']){
  const rarityText = RACE_DROP_RARITY_TEXT[Number(itemMeta['RaceDropRarity'])];
  if(rarityText){ effectText += rarityText; };
};
if(itemMeta['PartyExpRate']){
  var effectValue = itemMeta['PartyExpRate'];
  effectText += `\\I[296]${effectValue}${TIMES_SUFFIX} `;
};
if(itemMeta['PartyGoldRate']){
  var effectValue = itemMeta['PartyGoldRate'];
  effectText += `\\I[314]${effectValue}${TIMES_SUFFIX} `;
};
if(itemMeta['EnemyExpRate']){
  var effectValue = itemMeta['EnemyExpRate'];
  effectText += `\\I[296]${effectValue}${TIMES_SUFFIX} `;
};
if(itemMeta['EnemyGoldRate']){
  var effectValue = itemMeta['EnemyGoldRate'];
  effectText += `\\I[314]${effectValue}${TIMES_SUFFIX} `;
};
//↓スキル最後に付けるようにする。

if(itemMeta['Learn Require Eval']){
    const learnRequirementLabel = `習得条件あり`;//翻訳対象
    headerText += `[\\C[${colorCode}]${learnRequirementLabel}\\C[0]]`;
};

if(itemMeta['SwicthOnOffUse']){
    const toggleOnUseLabel = `使用でOn/Off`;//翻訳対象
    effectText += `[\\C[${colorCode}]${toggleOnUseLabel}\\C[0]]`;
};

//↓ステート最後に付けるようにする。
// Each of the five `<Category>` values appends one fixed state's help text.
const categoryStateId = CATEGORY_HELP_STATE_IDS[itemMeta['Category']];
if(categoryStateId){
  suffixText += `\\C[${colorCode}]${$dataStates[categoryStateId].description}\\C[0] `;
};
if(itemMeta['timeRemove']){
  const timeReleaseLabel = `時間経過で解除`;//翻訳対象
  effectText += `[\\C[${colorCode}]${timeReleaseLabel}\\C[0]]`;
};

if(databaseTypeId == 4){
  if(itemMeta['registUp']){
    var effectValue = itemMeta['registUp'];
    const resistOnApplyText = `付与時に耐性率${effectValue}%up`;//翻訳対象
    effectText += `[\\C[${colorCode}]${resistOnApplyText}\\C[0]]`;
  };
  if(item.autoRemovalTiming >= 1){
    var fragText = `\\I[75]:${item.minTurns}`;
      if(item.minTurns != item.maxTurns){
        fragText += `～${item.maxTurns}`;
      };
      effectText += `[${fragText}] `;
  } else {
    // `∞` when none of the equipped passive skills / weapons / armors grants
    // this state. Three identical scan-the-whole-list loops used to decide it;
    // this short-circuits and allocates nothing.
    const grantedByEquipment = containsState(valueEquipPassiveSkill, i)
      || containsState(valueEquipPassiveWeapon, i)
      || containsState(valueEquipPassiveArmor, i);
    if(!grantedByEquipment){ effectText += `[\\I[75]:∞] `; };
  };

};
if(databaseTypeId == 4){var descWordText = `　${descWordText}`};
if(databaseTypeId != 4){
  if(item.description == undefined){
    if(itemMeta['NoAddDescription']){
      item.description = `解説なし`;
    } else {
      item.description = ``;
    };
  };
};
// `descWordText` is 0 when the entry has no `<DescriptionWord>` and the rendered
// word otherwise. Without `NoAddDescription` the effect text always follows on a
// new line; with it, the description word (if any) is the only thing appended,
// and it too goes on its own line.
const descWordPart = descWordText == 0 ? `` : descWordText;
const tempDesc = itemMeta['NoAddDescription']
  ? `${headerText}${item.description}${suffixText}${descWordPart ? `\n${descWordPart}` : ``}`
  : `${headerText}${item.description}${suffixText}\n${descWordPart}${effectText}`;
if(databaseTypeId == 0 || databaseTypeId == 1 || databaseTypeId == 2 || databaseTypeId == 3){
  item.description = tempDesc;
};
if(databaseTypeId == 4){//ステートとジョブは解説入れてる分のみに適用するため。
  if(itemMeta['Help Description']){
    item.description = tempDesc;
}};
if(!itemMeta['NoAddDescription']){
  if(databaseTypeId == 5){//ステートとジョブは解説入れてる分のみに適用するため。
    if(itemMeta['Help Description']){
      item.description = `${headerText}${item.description}${suffixText}${effectText}`;
}}};

//解説では無く実際に影響のある処理。解説に反映させたくないもの。
if(databaseTypeId == 1 || databaseTypeId == 2 || databaseTypeId == 4 || databaseTypeId == 5){//スキルタイプ4封印で5-8までまとめて封印。
  for (var traitIndex = 0; traitIndex <= 19; traitIndex++) {
    if(item.traits[traitIndex]){
      if(item.traits[traitIndex].code == 42){ 
        if(item.traits[traitIndex].dataId == 4){
          item.traits.push({code: 42, dataId: 5, value: 1});
          item.traits.push({code: 42, dataId: 6, value: 1});
          item.traits.push({code: 42, dataId: 7, value: 1});
          item.traits.push({code: 42, dataId: 8, value: 1});
  }}}};
};

};//ここまでで各種データベースのlength-1.

};

//通常攻撃の追加説明文にランク補正値と派生スキルの有無を表示valueAddDescriptionSkill = Array(101).fill(0);
// Normal attacks get a rank-correction line and, optionally, the skills they
// derive into. The 101-200 and 901-950 blocks were the same body with a
// different header and output slot; 901-950 has no `<NormalAttackDerivedSuper>`
// tag in this database, so handling it in the shared body is a no-op there.
function attackSkillRankText(skill, headerText) {
  let descriptionText = headerText;
  const masteryEffect = skill.meta['Mastery Effect'];
  const rankCorrectionLabel = `ランク補正`;//翻訳対象
  const damagePerRankLabel = `ダメージ値にランク毎`;//翻訳対象
  descriptionText += masteryEffect
    ? `[${rankCorrectionLabel}:${damagePerRankLabel}${masteryEffect.replace(' Damage Per Level', '').replace(' ', '')}]\n`
    : `\n`;
  for (const derivedTag of [`NormalAttackDerived`, `NormalAttackDerivedSuper`]) {
    const derivedMeta = skill.meta[derivedTag];
    if(!derivedMeta){ continue; };
    const metaValues = derivedMeta.split(',');
    const derivedSkillName = $dataSkills[Number(metaValues[1])].name;
    const derivedRankLabel = `ランク${metaValues[0]}で`;//翻訳対象
    const derivedRankConditionLabel = `ランク${metaValues[0]}と特殊条件を満たす事で`;//翻訳対象
    const derivedSkillSuffix = `が派生発生`;//翻訳対象
    descriptionText += derivedTag == `NormalAttackDerived`
      ? `[${derivedRankLabel}\\C[2]${derivedSkillName}\\C[0]${derivedSkillSuffix}]`
      : `[${derivedRankConditionLabel}\\C[2]${derivedSkillName}\\C[0]${derivedSkillSuffix}]`;
  };
  return descriptionText;
}
attack_addKaisetu1 = function(){
  // 101-200: the plain normal attacks.
  for (let skillId = 101; skillId <= 200; skillId++) {
    const skill = $dataSkills[skillId];
    if(skill.name != ''){
      valueAddDescriptionSkill[skillId - 100] = attackSkillRankText(skill, ``);
    };
  };
  // 901-950: the same, with a required-mastery header.
  for (let skillId = 901; skillId <= 950; skillId++) {
    const skill = $dataSkills[skillId];
    if(skill.name != ''){
      const headerText = `[必要熟練度:基礎値${Number(skill.meta.RankUpPoint)}にランク×基礎値をプラス]`;
      valueAddDescriptionSkill[skillId - 800] = attackSkillRankText(skill, headerText);
    };
  };
};

recoveryEffectMsg = function (ind1,ind2) {
	const obj1 = `\\I[ind1]`;
	const obj2 = `\\I[ind2]`;
	const effectName = `回復`;
	const extraEffectMsg = `対象の${obj2}も影響`;
	return `[\\C[3]${effectName}:${obj1}100%(${extraEffectMsg})\\C[0]`;
}

//ジョブの追加説明文valueAddDescriptionClass
// Job description: `valueAddDescriptionClass` feeds the class screen and
// `valueClassGrowStatasComparison` the side-by-side list. The name-padding
// ladder, the seventeen-branch growth-stat lookup and the twice-pasted
// eight-stat expression are all data or one helper now.
class_addKaisetu1 = function(){
  for (let classId = 1; classId < $dataClasses.length; classId++) {
    const classData = $dataClasses[classId];
    if(classData.name == ''){ continue; };
    const classMeta = classData.meta;
    let comparisonText = classComparisonName(classData.name);
    const growthStats = classGrowthStats(classMeta['Icon']);
    // `<classRank>` 0 means "unranked", which the original wrote as 1. A missing
    // tag yields NaN and stays NaN, as before.
    const rawRank = Number(classMeta['classRank']);
    const classRankVal = rawRank == 0 ? 1 : rawRank;
    const primaryClassLabel = `メイン`;//翻訳対象
    const secondaryClassLabel = `サブ`;//翻訳対象
    let descriptionText = classMeta['Primary Only'] ? `[\\C[1]${primaryClassLabel}\\C[0]]` : `[\\C[5]${secondaryClassLabel}\\C[0]]`;
    descriptionText += `[Class${CLASS_RANK_NUMERALS[classRankVal]}]`;
    const growthStatRow = growthStatText(growthStats, classRankVal);
    descriptionText += `[GrowStatas:${growthStatRow}]\n`;
    comparisonText += `:${growthStatRow}]`;
    for (let learningIndex = 0; learningIndex <= 10; learningIndex++) {
      const learning = classData.learnings[learningIndex];
      if(!learning){ continue; };
      // Main classes only list the skills the current playthrough has reached.
      if(classMeta['Primary Only'] && learning.level < $gameVariables.value(6)){ continue; };
      const levelLabel = `Lv`;//翻訳対象
      descriptionText += `[${levelLabel}${learning.level}:\\C[2]\x1bSIN[${learning.skillId}]\\C[0]]`;
    };
    valueAddDescriptionClass[classId] = descriptionText;
    valueClassGrowStatasComparison[classId] = comparisonText;
  };
};

//}());
