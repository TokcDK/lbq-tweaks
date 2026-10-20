/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){

// ---------------------------------------------------------------------------
// 共通ヘルパー
// ---------------------------------------------------------------------------

// データベース種別ID。0 がアイテム、1 が武器、2 が防具。
const ITEM_SHOP_DB_ITEM = 0;
const ITEM_SHOP_DB_WEAPON = 1;
const ITEM_SHOP_DB_ARMOR = 2;

// databaseTypeId -> データベース配列。範囲外は undefined(元コードの「該当なし」と同じ)。
function itemShopDatabase(databaseTypeId) {
  switch (databaseTypeId) {
    case ITEM_SHOP_DB_ITEM: return $dataItems;
    case ITEM_SHOP_DB_WEAPON: return $dataWeapons;
    case ITEM_SHOP_DB_ARMOR: return $dataArmors;
    default: return undefined;
  }
}

// 走査する末尾ID。防具だけは上限が別変数で管理されている。
function itemShopDatabaseEnd(databaseTypeId, entries) {
  return databaseTypeId === ITEM_SHOP_DB_ARMOR ? valueArmorsLength : entries.length - 1;
}

// Scene_Shop に渡す品揃えの1行。template は元コードが使っていた4要素の形。
function itemShopEntry(databaseTypeId, itemId, template) {
  const entry = (template || [0, 0, 0, 0]).slice();
  entry[0] = databaseTypeId;
  entry[1] = itemId;
  return entry;
}

// 品揃えを組み立て終えた後の共通処理(グローバル goods への代入とシーン遷移)。
// prepareFlag は Scene_Shop へ渡す第2引数(shop_preparation1 だけ false)。
function itemShopOpen(goodsEntries, sortFlag, prepareFlag) {
  if (sortFlag != 1) return;
  goods = goodsEntries;
  SceneManager.push(Scene_Shop);
  SceneManager.prepareNextScene(goods, prepareFlag !== false);
}

// 条件に合う品目を集める。collectShopEntries は 6 つのショップ関数の共通部分。
function collectShopEntries(databaseTypeIds, matches, template, reportedDatabaseTypeId) {
  const shopEntries = [];
  for (const databaseTypeId of databaseTypeIds) {
    const entries = itemShopDatabase(databaseTypeId);
    if (!entries) continue;
    const end = itemShopDatabaseEnd(databaseTypeId, entries);
    for (let itemId = 1; itemId <= end; itemId++) {
      const item = entries[itemId];
      if (!item) continue;
      if (matches(item, databaseTypeId) === false) continue;
      // reportedDatabaseTypeId を渡した場合は、走査した種別ではなくその値を記録する。
      const entryTypeId = (reportedDatabaseTypeId === undefined) ? databaseTypeId : reportedDatabaseTypeId;
      shopEntries.push(itemShopEntry(entryTypeId, itemId, template));
    }
  }
  return shopEntries;
}

// 売却系メタタグ。item_priceinfo / item_ikkatu / ikkatu_sellChoice で同じ並びを使う。
const ITEM_SHOP_SELL_VARIABLE_TAGS = ['Variable 57 Sell Price', 'Variable 69 Sell Price'];
const ITEM_SHOP_SELL_ITEM_TAGS = ['Item 270 Sell Price', 'Item 147 Sell Price', 'Item 152 Sell Price'];
const ITEM_SHOP_SELL_TAGS = ['Sell Price'].concat(ITEM_SHOP_SELL_VARIABLE_TAGS, ITEM_SHOP_SELL_ITEM_TAGS);

// 売却価格を1つでも持っているか(売却不可判定に使う)。
function hasSellPriceTag(entry) {
  const meta = entry.meta;
  return ITEM_SHOP_SELL_TAGS.some(function (key) { return !!meta[key]; });
}

// アイテム/武器/防具の表示名。アイコン付きの \\x1bI[n] マーカーは文字列の外で作る。
function itemShopIconName(entry) {
  return `\x1bI[${entry.iconIndex}]${entry.name}`;
}

// 食べ物を食べた時の動詞。飲み物→呑み物(酒)→食べ物の順で判定する。
function eatOutcomeText(meta) {
  if (meta['Drink']) return `飲んだ！`;//翻訳対象
  if (meta['Alcohol']) return `呑んだ！`;//翻訳対象
  return `食べた！`;//翻訳対象
}

// ---------------------------------------------------------------------------
// アイテム入手後の処理
// ---------------------------------------------------------------------------
itemGet_afterProcess = function(){

  if ($gameSwitches.value(29)) return;

  $gameVariables.setValue(289, 4);//タイトル設定可能数
  $gameVariables.setValue(295, 0);//Hタイトル設定可能数
  $gameVariables.setValue(13, 5);//満腹度上限

  title_EffectConfi();
  actors_unlockedClassHit();

  rebuildQuestExArray();
  syncCollectBookFlag203();
  collectCasinoMedals();

  quest_settei(1);
  quest_settei(2);
  time_settei();

  const mapStatusMode = $gameVariables.value(200);//1非表示2簡易ステ3簡易Ｈステ4収集アイテム5ミニマップ
  if (mapStatusMode == 3) actor_miniHstatusList1(283);
  if (mapStatusMode == 4) item_collectList1(284);

  showQuestProgressPopups();
  processDailyQuestItems();
  chargeSeisyoujuuParams();

  $gameSwitches.setValue(380, false);
};

// クエスト対象アイテム(<EICSwitch:108>)の所持状況を valueQuestArrayEX へ写す。
function rebuildQuestExArray() {
  valueQuestArrayEX = Array(201).fill(0);

  const dataItems = $dataItems;
  const party = $gameParty;
  const itemsLen = dataItems.length;

  for (let itemId = 1; itemId < itemsLen; itemId++) {
    const item = dataItems[itemId];
    if (!item || item.name === '') continue;
    if (Number(item.meta['EICSwitch']) !== 108) continue;
    if (!party.hasItem(item)) continue;

    // 101-900 は 101-100 の位置、901-1000 は 1-100 の位置に対応する。
    const questIndex = (itemId <= 900) ? itemId - 800 : itemId - 900;
    if (valueQuestArray6[questIndex] === 0) {
      valueQuestArrayEX[questIndex] = valueQuestArray2[questIndex];
    }
  }
}

// 収集帳の "2冊目" フラグ(変数203)。全冊所持なら 2、そうでなければ 1。
function syncCollectBookFlag203() {
  if (!($gameVariables.value(203) >= 2)) return;
  const hasAllBooks = $gameParty.hasItem($dataItems[52]);
  $gameVariables.setValue(203, hasAllBooks ? 2 : 1);
}

// カジノメダルアイテムを全て換金する(所持分は -9999 で消す)。
function collectCasinoMedals() {
  const party = $gameParty;
  const dataItems = $dataItems;
  let medalTotalPts = 0;

  for (const itemId of valueCasinoMedalItem) {
    const item = dataItems[itemId];
    if (!party.hasItem(item)) continue;
    medalTotalPts += Number(item.meta['MedalRate']) * party.numItems(item);
    party.gainItem(item, -9999);
  }

  if (medalTotalPts >= 1) {
    $gameVariables.setValue(69, $gameVariables.value(69) + medalTotalPts);
  }
}

// クエスト進捗のポップアップ。前回値と現在値で変化した行だけを表示する。
function showQuestProgressPopups() {
  const isInBattle = $gameParty.inBattle();

  for (let questIndex = 1; questIndex <= 200; questIndex++) {
    const previousValue = valueQuestArrayEX[questIndex];
    const currentValue = valueQuestArray2[questIndex];
    if (previousValue === 0 || previousValue === currentValue) continue;

    const itemLabelId = (questIndex <= 100) ? questIndex + 800 : questIndex + 900;
    CommonPopupManager.showInfo({}, `\x1bIIN[${itemLabelId}]`, null);

    const previousValueLines = previousValue.split("\n");
    const currentValueLines = currentValue.split("\n");

    for (let lineIndex = 0; lineIndex < previousValueLines.length; lineIndex++) {
      if (previousValueLines[lineIndex] === currentValueLines[lineIndex]) continue;

      CommonPopupManager.showInfo({}, currentValueLines[lineIndex], null);
      if (valueQuestArray6[questIndex] !== 1) continue;

      const achievedText = `\x1bIIN[${itemLabelId}]:[${colorTaggedText(10, `条件達成`)}]`;//翻訳対象
      CommonPopupManager.showInfo({}, achievedText, null);

      if (isInBattle) continue;
      const particleName = (questIndex >= 101) ? 'cracker_min_r' : 'cracker_min_l';
      $gameScreen._particle.particlePlay(0, particleName, 'player', 'def', 'above');
    }
  }
}

// デイリークエスト(<SGカテゴリ>)を達成済みの所持アイテムから報酬処理する。
function processDailyQuestItems() {
  if (!$gameSwitches.value(129)) return;

  const dailyQuestName = 'デイリークエスト';
  const dataItems = $dataItems;
  const party = $gameParty;
  const dailyQuestEnd = dataItems.length - 1;

  for (let itemId = 1; itemId <= dailyQuestEnd; itemId++) {
    const item = dataItems[itemId];
    if (!item || item.name === '') continue;
    if (Number(item.meta['EICSwitch']) !== 108) continue;
    if (item.meta['SGカテゴリ'] !== dailyQuestName) continue;
    if (!party.hasItem(item)) continue;
    if (valueQuestArray6[itemId - 900] !== 1) continue;

    $gameSwitches.setValue(518, true);
    quest_housyuu(itemId, 2);
    $gameSwitches.setValue(518, false);
  }
}

// 性消珠(装備タイプ6 + <ItemPicture>)を重ねて使った分をパラメータへ変換する。
function chargeSeisyoujuuParams() {
  const variable352Values = $gameVariables.value(352);
  const party = $gameParty;
  let hasParameterIncrease = false;

  for (let armorId = 1; armorId <= valueArmorsLength; armorId++) {
    const armor = $dataArmors[armorId];
    if (!armor || armor.etypeId !== 6 || !armor.meta['ItemPicture']) continue;
    if (!party.hasItem(armor, true)) continue;

    let itemCount = party.numItems(armor);
    if (party.membersEqArmor(armorId)) itemCount += 1;
    if (itemCount < 2) continue;

    const seisyoujuuIndex = armorId - valueSeisyoujuuStartId;
    if (variable352Values[seisyoujuuIndex] === undefined) continue;

    itemCount -= 1;
    const initialParamValue = variable352Values[seisyoujuuIndex];
    variable352Values[seisyoujuuIndex] += itemCount;
    party.loseItem(armor, itemCount);
    seisyoujuu_addParams(armorId);

    AudioManager.playSe({ "name": "Magic2", "volume": 100, "pitch": 130, "pan": 0 });
    playSeisyoujuuParticle();

    const armorName = colorTaggedText(2, `\x1bAIN[${armorId}]`);
    const addedValueText = colorTaggedText(10, `+${itemCount}`);
    const popupMessage = `${armorName} [強化値:${initialParamValue}${addedValueText}]<パラメータアップ！>`;//翻訳対象
    CommonPopupManager.showInfo({}, popupMessage, null);

    hasParameterIncrease = true;
  }

  if (hasParameterIncrease) refreshBattleMembers();
}

// 性消珠の吸い込みパーティクル。名前は元コードのまま。
function playSeisyoujuuParticle() {
  const particleName = `charge_c`;
  $gameScreen._particle.particlePlay(0, particleName, 'player', 'def', 'above');
  $gameScreen._particle.particleUpdate([particleName, 'emitterLifetime', 1]);
  $gameScreen._particle.particleExceed(particleName, 0.5);
}

function refreshBattleMembers() {
  const battleMembers = $gameParty.battleMembers();
  for (const actor of battleMembers) {
    if (actor) actor.refresh();
  }
}

// ---------------------------------------------------------------------------
// ポーション
// ---------------------------------------------------------------------------
// アイテムのHPMPポーション効果
item_Potion1 = function(usedItem,targetItem,itemId){

  const itemMeta = $dataItems[itemId].meta;
  const potionResistDelta = targetItem.isStateAffected(291) ? 0 : Number(itemMeta['PotionResist']);
  const potionUsePoint = Number(itemMeta['PotionUsePoint']);
  const resistVariableId = 380 + targetItem.actorId();
  const resistValues = $gameVariables.value(resistVariableId);
  const currentResist = resistValues[58];

  if (!targetItem.isStateAffected(291)) targetItem.addState(39);

  // damage.type 3 は HP 回復、それ以外は MP 回復。
  const restoresHp = $dataItems[itemId].damage.type == 3;
  const baseAmount = potionUsePoint == 1
    ? (restoresHp ? targetItem.mhp : targetItem.mmp)//1 は全回復
    : potionUsePoint;//それ以外は固定値
  valuePotion1 = Math.round(baseAmount * (100 - currentResist) / 100);

  resistValues[58] += potionResistDelta;

  const resourceLabel = restoresHp ? `HP` : `MP`;
  const actorName = targetItem.name();
  const newResist = $gameVariables.value(resistVariableId)[58];
  const potionMessage = targetItem.isStateAffected(291)
    ? buildPotionMessageSuppressed(actorName, resourceLabel, valuePotion1, newResist)
    : buildPotionMessageApplied(actorName, resourceLabel, valuePotion1, potionResistDelta, newResist);

  if ($gameParty.inBattle()) {
    BattleManager._logWindow.push(`addText`, potionMessage);
  } else {
    TickerManager.show(potionMessage);
  }
};

// 耐性値上昇が無効化されている時のメッセージ。
function buildPotionMessageSuppressed(actorName, resourceLabel, amount, currentResist) {
  return `${actorName}の${resourceLabel}が${amount}回復！ 耐性値上昇は無効化されている。[${currentResist}%]`;//翻訳対象
}

// 通常時のメッセージ。
function buildPotionMessageApplied(actorName, resourceLabel, amount, resistDelta, currentResist) {
  return `${actorName}の${resourceLabel}が${amount}回復！ 耐性値が${resistDelta}%上昇し${currentResist}%になった。`;//翻訳対象
}

// ---------------------------------------------------------------------------
// アイテム収集率
// ---------------------------------------------------------------------------
// value321-325 に [所持数, 総数] を入れる。範囲は 100 件ずつ。
const COLLECT_RATE_RANGES = [
  { variableId: 321, first: 401, last: 500, countsOwned: true },
  { variableId: 322, first: 501, last: 600, countsOwned: true },
  { variableId: 323, first: 601, last: 700, countsOwned: true },
  { variableId: 324, first: 701, last: 800, countsOwned: true },
  { variableId: 325, first: 901, last: 1000, countsOwned: true }
];

// 各アイテム収集率
collect_keisan1 = function(){
  for (const range of COLLECT_RATE_RANGES) {
    $gameVariables.setValue(range.variableId, countCollectedItems(range.first, range.last, range.countsOwned));
  }
};

// [所持数, 総数]。元コードの 801-900 の走査は結果を上書きされて捨てられており、
// さらに 901-1000 の走査で ownedItemCount をリセットし忘れていた為、
// value325 の所持数に 701-800 の件数が混ざっていた。ここでは範囲ごとに数え直す。
function countCollectedItems(first, last, countsOwned) {
  const dataItems = $dataItems;
  const party = $gameParty;
  let totalItemCount = 0;
  let ownedItemCount = 0;

  for (let itemId = first; itemId <= last; itemId++) {
    const item = dataItems[itemId];
    if (!item || item.name === '') continue;
    totalItemCount += 1;
    if (countsOwned && party.hasItem(item)) ownedItemCount += 1;
  }

  return [ownedItemCount, totalItemCount];
}

// ---------------------------------------------------------------------------
// 鑑定
// ---------------------------------------------------------------------------
// 鑑定実行中身
kantei_nakami = function(){

  const appraisalEntry = $dataItems[$gameVariables.value(19)];
  if (!appraisalEntry) return;
  const appraisalMeta = appraisalEntry.meta;

  $gameParty.loseItem(appraisalEntry, 1);

  const appraisalTarget = resolveAppraisalTarget(appraisalEntry);
  if (!appraisalTarget) return;

  const appraisalItem = appraisalTarget.entries[appraisalTarget.index];
  if (!appraisalItem) return;

  $gameParty.gainItem(appraisalItem, 1);
  const acquiredItemMessage = `${colorTaggedText(16, itemShopIconName(appraisalItem))}を入手した。`;//翻訳対象

  if (!$gameSwitches.value(114)) {
    TickerManager.show(acquiredItemMessage);
  } else {
    CommonPopupManager.showInfo({}, acquiredItemMessage, null);
  }
};

// 鑑定で出てくる品を決める。候補の作り方が 4 パターンあるだけなので、
// 「どのデータベースを」「どの条件で」絞るかだけを切り替える。
function resolveAppraisalTarget(appraisalEntry) {
  const appraisalMeta = appraisalEntry.meta;

  const entries = appraisalDatabaseFor(appraisalMeta);
  if (!entries) return null;
  const end = itemShopDatabaseEnd(appraisalDatabaseForId(appraisalMeta), entries);

  // 決定順は元コードと同じ。<鑑定> → <鑑定カテゴリ> → <鑑定レアリティ版> の順に
  // 上書きしていくので、複数付いている場合は後ろのタグが優先される。
  let index;
  if (appraisalMeta['鑑定']) {
    index = pickRandomIdFrom(appraisalMeta['鑑定'].split(','), $dataItems);
  }
  if (appraisalMeta['鑑定カテゴリ']) {
    const categoryValue = appraisalMeta['鑑定カテゴリ'];
    const candidateIndices = collectRarityCandidates(entries, end, appraisalMeta['鑑定カテゴリランク'].split(','),
      function (item) { return appraisalCategoryMatches(item, entries, categoryValue); });
    index = pickRandomIdFrom(candidateIndices, entries);
  }
  if (appraisalMeta['鑑定レアリティ版']) {
    const candidateIndices = collectRarityCandidates(entries, end, appraisalMeta['鑑定レアリティ版'].split(','),
      function () { return true; });
    index = pickRandomIdFrom(candidateIndices, entries);
  }

  return { entries, index };
}

// 候補から1件抽選する。空なら undefined を返す。
function pickRandomIdFrom(candidateIds, entries) {
  if (!candidateIds.length) return undefined;
  return candidateIds[getRandomIndex(candidateIds.length)];
}

// <鑑定道具> / <鑑定武器> / <鑑定防具> のどれが付いているかで対象データベースが決まる。
function appraisalDatabaseFor(appraisalMeta) {
  if (appraisalMeta['鑑定道具']) return $dataItems;
  if (appraisalMeta['鑑定武器']) return $dataWeapons;
  if (appraisalMeta['鑑定防具']) return $dataArmors;
  return undefined;
}

function appraisalDatabaseForId(appraisalMeta) {
  if (appraisalMeta['鑑定防具']) return ITEM_SHOP_DB_ARMOR;
  if (appraisalMeta['鑑定武器']) return ITEM_SHOP_DB_WEAPON;
  return ITEM_SHOP_DB_ITEM;
}

// <鑑定カテゴリ> の一致判定。武器は wtypeId、防具は etypeId、道具はメニューカテゴリ。
function appraisalCategoryMatches(item, entries, categoryValue) {
  if (!item || !item.meta['LotteryRearity']) return false;
  if (entries === $dataWeapons) return item.wtypeId == Number(categoryValue);
  if (entries === $dataArmors) return item.etypeId == Number(categoryValue);
  return !!item.meta['Menu Category'] && item.meta['Menu Category'] == categoryValue;
}

// ランク(レアリティ)候補ごとに対象データベースを1回ずつ走査する。
function collectRarityCandidates(entries, end, rarityValues, matches) {
  const candidateIndices = [];
  for (const rarityValue of rarityValues) {
    for (let itemId = 1; itemId <= end; itemId++) {
      const item = entries[itemId];
      if (!item) continue;
      if (!matches(item)) continue;
      if (Number(item.meta['LotteryRearity']) != rarityValue) continue;
      candidateIndices.push(itemId);
    }
  }
  return candidateIndices;
}

// 鑑定アイテム版
kantei_item = function(usedItem,targetItem,itemId){

  if (targetItem.actorId() != usedItem.actorId()) return;

  $gameVariables.setValue(19, itemId);
  const actor = usedItem;
  const targetItemData = $dataItems[itemId];
  const appraisalSkillId = valueAppraisalSkillId;
  const appraisalSkill = $dataSkills[appraisalSkillId];

  if (actor.mp < appraisalSkill.mpCost) {
    TickerManager.show(`${actor.name()}のMPが足りません…。`);//翻訳対象
    return;
  }
  if (!actor.isLearnedSkill(appraisalSkillId)) {
    const skillName = `\x1bSIN[${appraisalSkillId}]`;
    TickerManager.show(`パーソナルスキル＜${colorTaggedText(3, skillName)}＞が必要です…。`);//翻訳対象
    return;
  }
  if (!canAppraise(actor, targetItemData, appraisalSkillId)) {
    const skillName = `\x1bSIN[${appraisalSkillId}]`;
    const rankLabel = `ランク`;//翻訳対象
    TickerManager.show(`${colorTaggedText(1, skillName + rankLabel)}が足りません…。`);//翻訳対象
    return;
  }

  kantei_nakami();
  if (actor.skillMasteryLevel(appraisalSkillId) > 3) return;

  actor.gainMp(-appraisalSkill.mpCost);
  actor.gainSkillMasteryUses(appraisalSkillId, $gameVariables.value(203));//変更熟練度
  showAppraisalMasteryMessage(actor, appraisalSkillId);
};

// <下級鑑定品>/<中級鑑定品>/<上級鑑定品> と熟練度ランクの比較。
function canAppraise(actor, targetItemData, appraisalSkillId) {
  const masteryLevel = actor.skillMasteryLevel(appraisalSkillId);
  if (targetItemData.meta['下級鑑定品'] && masteryLevel >= 1) return true;
  if (targetItemData.meta['中級鑑定品'] && masteryLevel >= 2) return true;
  if (targetItemData.meta['上級鑑定品'] && masteryLevel >= 3) return true;
  return false;
}

// 熟練度獲得メッセージ。スキル名は <\x1bSIN[id]> の技術マーカーなので外に出す。
function showAppraisalMasteryMessage(actor, appraisalSkillId) {
  const actorName = actor.name();
  const skillName = colorTaggedText(3, `\x1bSIN[${appraisalSkillId}]`);
  const gainedMastery = $gameVariables.value(203);
  const currentUses = actor.skillMasteryUses(appraisalSkillId);
  const maxUses = actor.skillMasteryUsageMax(appraisalSkillId);
  const mpState = `${actor.mp}/${actor.param(1)}`;
  TickerManager.show(
    `${actorName}のMPが5消費された。【現在MP${mpState}】＜${skillName}＞熟練度\\V[203]獲得！（${currentUses}/${maxUses}）`//翻訳対象
  );
}

// 鑑定一括
kantei_ikkatu = function(unusedArg1,unusedArg2,itemId){

  $gameSwitches.setValue(69,true);
  $gameSwitches.setValue(114,true);

  const dataItems = $dataItems;
  const party = $gameParty;
  const itemsLen = dataItems.length;

  for (let itemId = 1; itemId < itemsLen; itemId++) {
    const item = dataItems[itemId];
    if (!item) continue;
    if (!isAppraisalItem(item)) continue;
    if (!party.hasItem(item)) continue;

    $gameVariables.setValue(19, itemId);
    kantei_nakami();
    // 鑑定結果が同じIDの鑑定品だった場合は、その枠をもう一度処理する。
    if (party.hasItem(item)) itemId -= 1;
  }

  $gameSwitches.setValue(114,false);
  $gameSwitches.setValue(69,false);
};

function isAppraisalItem(item) {
  if (!item) return false;
  return !!(item.meta['下級鑑定品'] || item.meta['中級鑑定品'] || item.meta['上級鑑定品']);
}

// 店で鑑定一括
kantei_shopikkatu1 = function(){

  const counts = countAppraisalItems();
  const totalCount = counts.low + counts.mid + counts.high;

  if (totalCount == 0) {
    $gameSwitches.setValue(116,true);
    return;
  }

  // NOTE: 表示している料金表は 100/500/1000 だが、実際の計算は 10/100/1000。
  // 元コードのまま(表示と計算が食い違っている)。
  const fee = counts.low * APPRAISAL_FEES.low + counts.mid * APPRAISAL_FEES.mid + counts.high * APPRAISAL_FEES.high;
  $gameVariables.setValue(21, fee);

  WindowManager.show(0, 10, 100, 800, 300);
  WindowManager.drawText(0, buildAppraisalFeeText(counts, fee));
};

const APPRAISAL_FEES = { low: 10, mid: 100, high: 1000 };

const APPRAISAL_ITEM_ROWS = [
  { metaKey: '下級鑑定品', countKey: 'low', label: `下級鑑定品` },//翻訳対象
  { metaKey: '中級鑑定品', countKey: 'mid', label: `中級鑑定品` },//翻訳対象
  { metaKey: '上級鑑定品', countKey: 'high', label: `上級鑑定品` }//翻訳対象
];

// 所持している鑑定品の個数を種類別に数える。
function countAppraisalItems() {
  const counts = { low: 0, mid: 0, high: 0 };
  const dataItems = $dataItems;
  const party = $gameParty;
  const itemsEnd = dataItems.length - 1;

  for (let itemId = 1; itemId <= itemsEnd; itemId++) {
    const item = dataItems[itemId];
    if (!item || !party.hasItem(item)) continue;
    for (const row of APPRAISAL_ITEM_ROWS) {
      if (!item.meta[row.metaKey]) continue;
      counts[row.countKey] += party.numItems(item);
    }
  }
  return counts;
}

// 鑑定料金の表示テキスト。
function buildAppraisalFeeText(counts, fee) {
  const headerText = `鑑定料金表\n（下級：100\\G）（中級：500\\G）（上級：1000\\G）\n`;//翻訳対象
  let feeDisplayText = headerText;

  for (const row of APPRAISAL_ITEM_ROWS) {
    const count = counts[row.countKey];
    if (count < 1) continue;
    feeDisplayText += `${row.label}：${colorTaggedText(1, `${count}`)}個\n`;//翻訳対象
  }

  feeDisplayText += `合計鑑定料金${colorTaggedText(10, `${fee}`)}\\G\\$`;//翻訳対象
  return feeDisplayText;
}
// ---------------------------------------------------------------------------
// 採取時の拾得物と熟練度
// ---------------------------------------------------------------------------
// 採取/採掘で得た固有素材。gatherModeId 0=採取 1=採掘。
item_getScript1 = function(gatherModeId,materialSlotId){

  const collectedVariableId = $gameVariables.value(240);//1以上ならアイテム、0なら武器IDを参照
  const item = collectedVariableId >= 1 ? $dataItems[collectedVariableId] : $dataWeapons[$gameVariables.value(230)];
  if (!item) return;

  const uniqueMaterialTag = 'UniqueMaterial' + materialSlotId;
  const uniqueMaterialValue = item.meta[uniqueMaterialTag];
  if (uniqueMaterialValue === undefined || uniqueMaterialValue === null) return;

  const materialCandidates = uniqueMaterialValue.split(',');
  // スイッチ605が立っている時は先頭の素材に固定。
  const materialId = $gameSwitches.value(605)
    ? Number(materialCandidates[0])
    : materialCandidates[getRandomIndex(materialCandidates.length)];

  const gatherSkillId = gatherModeId == 0 ? valueHarvestingSkillId : valueMiningSkillId;
  item_getSkillLevel(gatherSkillId, 0, materialId);
};

// 熟練度上昇拾得物。itemType 0=お金 1=アイテム 2=武器 3=防具。
item_getSkillLevel = function(skillId,itemType,rewardId){

  const actor = $gameActors.actor($gameVariables.value(11));
  const skill = $dataSkills[skillId];
  if (!actor || !skill) return;

  const isLearnedSkill = actor.isLearnedSkill(skillId);
  const skillMasteryLevel = isLearnedSkill ? actor.skillMasteryLevel(skillId) : 0;

  const gainResult = gainGatherSkillMastery(actor, skill, skillId, isLearnedSkill, skillMasteryLevel);
  const rewardAmount = computeGatherRewardAmount(actor, skillMasteryLevel, rewardId);
  const rewardText = grantGatherReward(itemType, rewardId, rewardAmount);

  CommonPopupManager.showInfo({}, rewardText + gainResult.text, null);

  // 熟練度が上がらなかった場合は「上昇前の熟練度」も 0 として渡す(元コードどおり)。
  valueScriptArray1 = isLearnedSkill
    ? [$gameVariables.value(11), gainResult.skillLevel, skillId]
    : [$gameVariables.value(11), 0, 0];
};

// 熟練度を加算し、表示用テキストと加算前の熟練度を返す。
// 最大ランク到達済みなどで加算しない場合は text = '　'(見えない1文字)を返す。
function gainGatherSkillMastery(actor, skill, skillId, isLearnedSkill, skillMasteryLevel) {
  const noGain = { text: '　', skillLevel: 0 };

  if (skillMasteryLevel == Number(skill.meta['Max Mastery Level'])) return noGain;
  if (!isLearnedSkill || skillMasteryLevel < 0) return noGain;

  actor.gainSkillMasteryUses(skillId, $gameVariables.value(203));//変更熟練度

  const skillName = colorTaggedText(1, `＜${stripSkillStateSuffix(skill.name)}＞`);
  const masteryLabel = `熟練度`;//翻訳対象
  const obtainedLabel = `獲得！`;//翻訳対象
  return { text: `${skillName}${masteryLabel}${colorTaggedText(10, `\\V[203]`)}${obtainedLabel}`, skillLevel: skillMasteryLevel };
}

// スキル名に付く ＜ON＞ / ＜OFF＞ を落とす。
function stripSkillStateSuffix(skillName) {
  return skillName.replace("＜ON＞", "").replace("＜OFF＞", "");
}

// 拾得物の獲得量。熟練度0なら1個、素材ID 10/141 は「幸運」系スキルで10倍。
function computeGatherRewardAmount(actor, skillMasteryLevel, rewardId) {
  if (skillMasteryLevel != 0) {
    if ((rewardId == 10 || rewardId == 141) && actor.isLearnedSkill(799)) return skillMasteryLevel * 10;
    return skillMasteryLevel;
  }
  return 1;
}

// 拾得物本体(お金 or アイテム)を付与し、その報告文を返す。
function grantGatherReward(itemType, rewardId, rewardAmount) {
  const notFoundText = '　';
  if (rewardId < 1) return notFoundText;

  if (itemType == 3) {
    const goldAmount = rewardId * rewardAmount;
    $gameParty.gainGold(goldAmount);
    // 元コードと同じく、色タグは「小銭を拾った。（+」で開いて金額の後で閉じる。
    const goldLabel = `\\C[3]小銭を拾った。（+`;//翻訳対象
    return `${goldLabel}${colorTaggedText(10, `${goldAmount}`)}\\G）`;
  }

  const entries = itemShopDatabase(itemType);
  const rewardItem = entries && entries[rewardId];
  if (!rewardItem) return notFoundText;

  $gameParty.gainItem(rewardItem, rewardAmount);
  const gainItemLabel = `を`;//翻訳対象
  const gainCountLabel = `個入手した。`;//翻訳対象
  return `${colorTaggedText(3, itemShopIconName(rewardItem))}${gainItemLabel}${colorTaggedText(10, `${rewardAmount}`)}${gainCountLabel}`;
}

// 熟練度上昇拾得物。後半。直前に item_getSkillLevel が入れた valueScriptArray1 を消費する。
item_getSkillLevel2 = function(){

  const skillId = valueScriptArray1 ? valueScriptArray1[2] : 0;
  if (skillId < 1) return;

  const actor = $gameActors.actor(valueScriptArray1[0]);
  const skill = $dataSkills[skillId];
  if (!actor || !skill) return;

  const maxSkillMasteryLevel = Number(skill.meta['Max Mastery Level']);
  const skillMasteryLevel = actor.skillMasteryLevel(skillId);
  const skillRarity = actor.isLearnedSkill(skillId) && skillMasteryLevel >= 0
    ? get_skill_rarity(skillMasteryLevel, maxSkillMasteryLevel)
    : ``;

  if (skillRarity) showSkillMasteryInfo(actor, skill, skillId, skillMasteryLevel, maxSkillMasteryLevel, skillRarity);

  const lastSkillMasteryLevel = valueScriptArray1[1];
  if (!(lastSkillMasteryLevel >= 1)) return;
  if (!(skillMasteryLevel > lastSkillMasteryLevel)) return;

  $gameSwitches.setValue(133, true);
  valueWordSet1 = buildSkillRankUpWord(actor, skill, skillRarity, skillMasteryLevel, maxSkillMasteryLevel);
};

// 熟練度の使用回数とランクを1行で表示する。
function showSkillMasteryInfo(actor, skill, skillId, skillMasteryLevel, maxSkillMasteryLevel, skillRarity) {
  const skillRarityName = skill.name + skillRarity;
  const usesText = colorTaggedText(2, `${actor.skillMasteryUses(skillId)}`);
  const usesMaxText = colorTaggedText(2, `${actor.skillMasteryUsageMax(skillId)}`);
  const usesLabel = `Uses:`;

  const infoMessageText = skillMasteryLevel == maxSkillMasteryLevel
    ? `${skillRarityName} ${colorTaggedText(10, `Complete!`)}`
    : `${skillRarityName}　${usesLabel}${usesText}／${usesMaxText}`;
  CommonPopupManager.showInfo({}, infoMessageText, null);
}

// ランクアップ/カンストの実況文(valueWordSet1 に入る)。
function buildSkillRankUpWord(actor, skill, skillRarity, skillMasteryLevel, maxSkillMasteryLevel) {
  const actorName = actor.name();
  const skillName = colorTaggedText(1, `＜${stripSkillStateSuffix(skill.name)}＞`);
  return skillMasteryLevel == maxSkillMasteryLevel
    ? `${actorName}の${skillName}がカンストした！`//翻訳対象
    : `${actorName}の${skillName}が${skillRarity}にランクアップ！`;//翻訳対象
}

// 熟練度ランク表記。最大ランクが 5 未満のスキルは 1 段階上の表記から始まる。
const skillMasteryLevelRarityMarks = [
  colorTaggedText(4, `[E]`), colorTaggedText(4, `[E]`), colorTaggedText(12, `[D]`),
  colorTaggedText(5, `[C]`), colorTaggedText(13, `[B]`), colorTaggedText(27, `[A]`),
  colorTaggedText(30, `[S]`)
];

get_skill_rarity = function (skillMasteryLevel, maxSkillMasteryLevel){
  let skillRarityIndex = skillMasteryLevel;
  if (maxSkillMasteryLevel < 6) skillRarityIndex++;
  if (skillRarityIndex >= skillMasteryLevelRarityMarks.length) skillRarityIndex = skillMasteryLevelRarityMarks.length - 1;
  return skillMasteryLevelRarityMarks[skillRarityIndex];
};

// アイテム使用でスキル熟練度アップ。selectionModeId 2 で確定、それ以外は選択表示のみ。
item_skilljukurenndoup = function(selectionModeId){

  const actor = $gameActors.actor($gameVariables.value(20));
  const usedItem = $dataItems[$gameVariables.value(93)];
  const skillId = $gameVariables.value(19);
  const skill = $dataSkills[skillId];
  if (!actor || !skill) return;

  const masteryGain = $gameVariables.value(22) * $gameVariables.value(203);//変更熟練度
  const skillType = skill.stypeId;
  valueCountSet1 = 0;

  if (!skill.meta['Max Mastery Level']) {
    WindowManager.drawText(1, buildSkillNoRankText(skillId, skillType));
    return;
  }

  $gameVariables.setValue(23, actor.skillMasteryLevel(skillId));//使用前の熟練度

  const infoMessageText = (selectionModeId == 2)
    ? useSkillMasteryBook(actor, usedItem, skillId, skillType, masteryGain)
    : buildSkillMasteryBookChoiceText(actor, skillId, skillType);
  WindowManager.drawText(1, infoMessageText);
};

// スキル名を色付きで <\x1bSIN[id]> 表記にする。
function skillColoredName(skillId, skillType, brackets) {
  const skillName = `\x1bSIN[${skillId}]`;
  return colorTaggedText(valueSkillColorArr[skillType], brackets === false ? skillName : `＜${skillName}＞`);
}

function buildSkillNoRankText(skillId, skillType) {
  const suffix = `はランクが存在しないスキルのため使用できない…。`;//翻訳対象
  return `${skillColoredName(skillId, skillType)}${suffix}`;
}

// 確定使用。熟練度を加算し、ランクアップしたらログを2行追加する。
function useSkillMasteryBook(actor, usedItem, skillId, skillType, masteryGain) {
  const beforeMasteryLevel = actor.skillMasteryLevel(skillId);
  actor.gainSkillMasteryUses(skillId, masteryGain);
  $gameParty.loseItem(usedItem, 1);

  const playerName = actor.name();
  const skillName = skillColoredName(skillId, skillType);
  const masteryLabel = `熟練度が`;//翻訳対象
  const masteryUpLabel = `上昇した！`;//翻訳対象
  const usesLabel = `${actor.skillMasteryUses(skillId)}/${actor.skillMasteryUsageMax(skillId)}`;
  const infoMessageText = `${playerName}の${skillName}${masteryLabel}${masteryGain}${masteryUpLabel}（${usesLabel}）`;

  const currentMasteryLevel = actor.skillMasteryLevel(skillId);
  if (currentMasteryLevel > beforeMasteryLevel) {
    if (!$gameParty.inBattle()) $gamePlayer.requestAnimation(300);
    const rankUpText = `${playerName}の${skillName}が${colorTaggedText(2, `${currentMasteryLevel}`)}にランクアップ！`;//翻訳対象
    gab_wordParticle(rankUpText);
    $gameSystem.pushInfoLog(infoMessageText);
    $gameSystem.pushInfoLog(rankUpText);
    return infoMessageText;
  }

  $gameSystem.pushInfoLog(infoMessageText);
  return infoMessageText;
}

// 選択中の表示。使用可能なら valueCountSet1 にスキルIDを入れて「もう一度選択」を促す。
function buildSkillMasteryBookChoiceText(actor, skillId, skillType) {
  const skill = $dataSkills[skillId];
  const cannotUseLabel = `は対象に選べない…。`;//翻訳対象
  const skillName = skillColoredName(skillId, skillType);

  if (skill.meta['NoJpBook']) return `${skillName}${cannotUseLabel}`;

  const skillMasteryLevel = actor.skillMasteryLevel(skillId);
  if (skillMasteryLevel >= Number(skill.meta['Max Mastery Level'])) {
    const maxedLabel = `は最大ランクに達しているため使用できない。`;//翻訳対象
    return `${actor.name()}の${skillName}${maxedLabel}`;
  }

  valueCountSet1 += skillId;
  const usesLabel = `熟練度:`;
  const usesText = `${actor.skillMasteryUses(skillId)}/${actor.skillMasteryUsageMax(skillId)}`;
  const promptLabel = `（もう一度選択で使用されます）`;//翻訳対象
  return `${skillColoredName(skillId, skillType, false)} ${usesLabel}${usesText}　${colorTaggedText(10, promptLabel)}`;
}

// ---------------------------------------------------------------------------
// アイテム価格等説明
// ---------------------------------------------------------------------------

// 買取/売却価格の表示。売却タグは後ろのものが優先される(元コードの上書き順)。
const PRICE_INFO_SELL_TAGS = [
  { metaKey: 'Sell Price', kind: 'gold' },
  { metaKey: 'Variable 57 Sell Price', kind: 'variable', variableId: 57 },
  { metaKey: 'Variable 69 Sell Price', kind: 'variable', variableId: 69 },
  { metaKey: 'Item 270 Sell Price', kind: 'item', itemId: 270 },
  { metaKey: 'Item 147 Sell Price', kind: 'item', itemId: 147 },
  { metaKey: 'Item 152 Sell Price', kind: 'item', itemId: 152 }
];

// 武器種別ごとの通常攻撃説明。value は [英語名, スキルID, 説明]。
const WEAPON_BASE_ATTACK_TEXTS = {
  '剣': ['Sword', 101, `与D*1.0倍/対象前衛のみ`],
  '短剣': ['Dagger', 111, `与D*0.5倍/2Hit/対象前衛のみ`],
  '刀': ['Blade', 121, `与D*0.9倍/対象前衛のみ`],
  '杖': ['Wand', 131, `与D*1.0倍`],
  '拳': ['Fist', 141, `与D*0.4倍/2Hit/対象前衛のみ`],
  '槍': ['Lance', 151, `与D*1.2倍/対象前衛のみ`],
  '斧': ['Axe', 161, `与D*1.5倍/対象前衛のみ`],
  '銃': ['Gun', 171, `与D*0.5倍+固定ダメ/即死付与`],
  '弓': ['Bow', 181, `与D*0.8倍/浮遊特攻`],
  '楽器': ['Instrument', 191, `与D*0.5倍/ランダムデバフ`],
  '針': ['Needle', 81, `与D*1.0倍/対象前衛のみ/装備条件なし`],
  '鞭': ['Whip', 84, `与D*0.5倍/全体攻撃/装備条件なし`],
  '鈍器': ['Blow', 901, `与D*1.0倍/対象前衛のみ`],
  '爪': ['Claw', 911, `与D*1.0倍/対象前衛のみ`],
  '牙': ['Fang', 921, `与D*1.0倍/対象前衛のみ`]
};

// レアリティ昇格素材のタグ。表示順は元コードと同じ。
const RARITY_PROMOTION_TAGS = [
  { metaKey: 'LRpromotionM', label: `[RarelityLR解放素材]` },
  { metaKey: 'URpromotionM', label: `[RarelityUR解放素材]` },
  { metaKey: 'SSRpromotionM', label: `[RarelitySSR解放素材]` },
  { metaKey: 'SRpromotionM', label: `[RarelitySR解放素材]` },
  { metaKey: 'RpromotionM', label: `[RarelityR解放素材]` }
];

item_priceinfo = function(databaseTypeId,itemId){

  const databaseEntries = itemShopDatabase(databaseTypeId);
  if (!databaseEntries || !databaseEntries[itemId]) return;

  const item = databaseEntries[itemId];
  const itemMeta = item.meta;
  const itemPrice = Number(item.price);

  let priceInfoText = buildPriceInfoSellText(item, itemPrice);
  priceInfoText += buildPriceInfoRankText(itemMeta);
  priceInfoText += buildPriceInfoShopStateText(databaseTypeId, itemId, itemMeta);
  priceInfoText += buildPriceInfoBaseAttackText(databaseTypeId, item);
  priceInfoText += buildPriceInfoEquipStateText(itemMeta);
  priceInfoText += buildPriceInfoRarityPromotionText(itemMeta);
  priceInfoText += buildPriceInfoReturnItemText(itemMeta);
  priceInfoText += buildPriceInfoAbilityLearnText(itemMeta);
  priceInfoText += buildPriceInfoSynthesisMaterialText(databaseTypeId, itemId, item, itemMeta);
  priceInfoText += buildPriceInfoSingleAlchemyText(databaseEntries, itemId, item, itemMeta);
  priceInfoText += buildPriceInfoQuestMaterialText(databaseTypeId, itemId);
  priceInfoText += buildPriceInfoSeisyoujuuText(databaseTypeId, itemId, item);

  if (itemMeta['GatchaHasRange']) priceInfoText += `[所持でガチャ排出品に追加]\n`;//翻訳対象

  $gameVariables.setValue(801, priceInfoText);
};

// 買取価格/売却価格。price/2 が既定で、売却タグがあればその表示で置き換わる。
function buildPriceInfoSellText(item, itemPrice) {
  let sellText = null;

  if (itemPrice >= 1) {
    const buyBackPrice = Math.floor(itemPrice / 2);
    sellText = `買取価格:` + colorTaggedText(2, buyBackPrice.toLocaleString()) + `\\G\n`;//翻訳対象
  }

  for (const sellTag of PRICE_INFO_SELL_TAGS) {
    const tagValue = item.meta[sellTag.metaKey];
    if (!tagValue) continue;
    sellText = buildSellTagText(sellTag, tagValue);
  }

  // 元コードどおり、売却タグも価格も無い品は [売却不可] で上書きされる。
  if (itemPrice == 0 && !hasSellPriceTag(item)) return colorTaggedText(1, `[売却不可]`) + `\n`;
  return sellText || ``;
}

// 1つの売却タグから表示文を作る。
function buildSellTagText(sellTag, tagValue) {
  const formattedValue = Number(tagValue).toLocaleString();

  switch (sellTag.kind) {
    case 'gold':
      return `買取価格:` + colorTaggedText(2, formattedValue) + `\n`;//翻訳対象
    case 'variable': {
      const currencyName = $dataSystem.variables[sellTag.variableId];
      return `売却pt:` + colorTaggedText(2, formattedValue + currencyName) + `\n`;//翻訳対象
    }
    default: {
      const priceItemName = $dataItems[sellTag.itemId].name;
      const countLabel = `個`;//翻訳対象
      return `売却:` + colorTaggedText(2, priceItemName + formattedValue + countLabel) + `\n`;//翻訳対象
    }
  }
}

// 抽選ランクの表示。
function buildPriceInfoRankText(itemMeta) {
  if (!itemMeta['LotteryRearity']) return `ランク:──\n`;//翻訳対象
  const rarityValue = Number(itemMeta['LotteryRearity']);
  return `ランク:` + colorTaggedText(14, `${rarityValue}`) + `\n`;//翻訳対象
}

// 販売状態(非売品/販売のみ/一括売却対象)の表示。
function buildPriceInfoShopStateText(databaseTypeId, itemId, itemMeta) {
  let shopStateText = ``;

  if (!itemMeta.ShopRank) {
    shopStateText += colorTaggedText(29, `[非売品]`) + `\n`;
  } else if (!itemMeta['LotteryRearity']) {
    shopStateText += colorTaggedText(29, `[販売のみ]`) + `\n`;
  }

  if ($gameSelfSwitches.getVariableValue([4, 11 + databaseTypeId, itemId]) == 1) {
    shopStateText += colorTaggedText(10, `[一括売却対象]`) + `\n`;
  }

  return shopStateText;
}

// 武器種別の通常攻撃説明。
function buildPriceInfoBaseAttackText(databaseTypeId, item) {
  if (databaseTypeId != ITEM_SHOP_DB_WEAPON) return ``;
  if (!(item.wtypeId >= 1)) return ``;

  const weaponTypeName = $dataSystem.weaponTypes[item.wtypeId];
  const baseAttack = WEAPON_BASE_ATTACK_TEXTS[weaponTypeName];
  const heading = `基本通常攻撃:`;//翻訳対象
  if (!baseAttack) return heading;

  const [attackName, attackSkillId, attackNote] = baseAttack;
  const skillMarker = `<\\SIN[${attackSkillId}]>`;
  return `${heading}${colorTaggedText(2, attackName)}${skillMarker}\n[${attackNote}]\n`;
}

// セットボーナス/装備条件の表示。
function buildPriceInfoEquipStateText(itemMeta) {
  let equipStateText = ``;
  if (itemMeta['SetBonus']) equipStateText += colorTaggedText(14, `[セットボーナス効果]`) + `\n`;
  if (itemMeta['Custom Equip Requirement Text'] || itemMeta['Equip Requirement']) {
    equipStateText += colorTaggedText(10, `[装備条件あり]`) + `\n`;
  }
  return equipStateText;
}

// レアリティ昇格素材/ジョブ解放素材の表示。
function buildPriceInfoRarityPromotionText(itemMeta) {
  let promotionText = ``;
  for (const promotionTag of RARITY_PROMOTION_TAGS) {
    if (!itemMeta[promotionTag.metaKey]) continue;
    promotionText += colorTaggedText(28, promotionTag.label) + `\n`;
  }
  if (itemMeta['class2JobReleaseM']) promotionText += colorTaggedText(20, `[Class2ndJob解放素材]`) + `\n`;
  return promotionText;
}

// 帰還アイテム(<returnItem>)の現在の帰還先。変数327の配列で 2 が入っている枠。
function buildPriceInfoReturnItemText(itemMeta) {
  if (!itemMeta['returnItem']) return ``;

  const returnSlotValues = $gameVariables.value(327);
  let returnWeaponId = 22;
  for (let slotId = 1; slotId <= 100; slotId++) {
    if (returnSlotValues[slotId] != 2) continue;
    returnWeaponId = slotId;
    break;
  }

  return colorTaggedText(20, `[現在の帰還先]`) + `\n` + `${$dataWeapons[returnWeaponId].name}\n`;
}

// アビリティ習得コスト素材の表示。
function buildPriceInfoAbilityLearnText(itemMeta) {
  if (!itemMeta['AbilityLearnM']) return ``;
  const classId = Number(itemMeta['AbilityLearnM']);
  const classSeriesLabel = `系列`;//翻訳対象
  return colorTaggedText(3, `[アビリティ習得コスト素材]`) + `\n`
    + colorTaggedText(21, `${$dataClasses[classId].name}${classSeriesLabel}`) + `\n`;
}

// 錬金素材かどうか。valueItemsSynth1 は 0=アイテム 2000+=武器 3000+=防具 の通し番号。
function buildPriceInfoSynthesisMaterialText(databaseTypeId, itemId, item, itemMeta) {
  let synthItemId = itemId;
  if (databaseTypeId == ITEM_SHOP_DB_WEAPON) synthItemId = itemId + 2000;
  if (databaseTypeId == ITEM_SHOP_DB_ARMOR) synthItemId = itemId + 3000;

  const synthesisSourceText = valueItemsSynth1[synthItemId];
  if (synthesisSourceText == 0) return ``;

  let materialText = `[錬金素材元対象]\n`;//翻訳対象
  if (synthesisSourceText.length >= 40) return materialText + colorTaggedText(14, `[多岐に渡る錬金素材元]`) + `\n`;

  // レアリティ8以上は錬金Rank4未満だと伏せる。
  const isLockedByAlchemyRank = itemMeta['LotteryRearity']
    && $gameActors.actor($gameVariables.value(2)).skillMasteryLevel(valueAlchemySkillId) <= 3
    && Number(itemMeta['LotteryRearity']) >= 8;

  materialText += isLockedByAlchemyRank
    ? colorTaggedText(10, `錬金Rank4以上で表示`) + `\n`
    : colorTaggedText(3, synthesisSourceText) + `\n`;
  return materialText;
}

// 単一アイテム錬金の情報。<単一アイテム錬金> は 素材ID,必要Rank,完成品ID,個数。
function buildPriceInfoSingleAlchemyText(databaseEntries, itemId, item, itemMeta) {
  const singleAlchemyValue = itemMeta['単一アイテム錬金'];
  if (!singleAlchemyValue) return ``;

  const singleItemAlchemyValues = singleAlchemyValue.split(',');
  const resultItemName = databaseEntries[Number(singleItemAlchemyValues[2])].name;
  const alchemySkillName = $dataSkills[valueAlchemySkillId].name;
  const alchemyRankLabel = `Rank`;//翻訳対象
  const requireLabel = `[要]`;//翻訳対象
  const countLabel = `個`;//翻訳対象

  return `[可]` + colorTaggedText(14, resultItemName) + `\n`
    + requireLabel + colorTaggedText(2, `${alchemySkillName}${alchemyRankLabel}${singleItemAlchemyValues[1]}`) + `\n`
    + colorTaggedText(1, item.name) + `×${singleItemAlchemyValues[3]}${countLabel}\n`;
}

// クエスト指定素材の表示。デイリークエスト(901-1000)は 801-900 の達成状況を見る。
// NOTE: 元コードは武器/防具でも判定に使った側(+2000/+3000)ではなく
// valueQuestArray1[itemId] を読んでおり、武器/防具では undefined 参照で落ちていた。
// ここでは判定に使った側の情報をそのまま使う。
function buildPriceInfoQuestMaterialText(databaseTypeId, itemId) {
  const questEntry = findQuestMaterialEntry(databaseTypeId, itemId);
  if (!questEntry) return ``;

  const questItemId = questEntry[1];
  const questMaterialLabel = colorTaggedText(14, `[クエスト指定素材]`);//翻訳対象

  if (!(questItemId >= 801 && questItemId <= 900)) {
    return questMaterialLabel + colorTaggedText(11, `(ﾃﾞｲﾘｰ)`) + `\n`;//翻訳対象
  }

  const isDelivered = $gameParty.hasItem($dataItems[questItemId + 100], true);
  const deliveredLabel = isDelivered ? colorTaggedText(2, `(済)`) : colorTaggedText(10, `(未)`);
  return questMaterialLabel + deliveredLabel + `\n`;
}

// databaseTypeId と itemId に対応するクエスト素材情報を返す。
function findQuestMaterialEntry(databaseTypeId, itemId) {
  const questOffset = (databaseTypeId == ITEM_SHOP_DB_WEAPON) ? 2000 : (databaseTypeId == ITEM_SHOP_DB_ARMOR) ? 3000 : 0;
  const questEntry = valueQuestArray1[itemId + questOffset];
  if (!questEntry) return null;
  return questEntry[0] == databaseTypeId + 1 ? questEntry : null;
}

// 性消珠(装備タイプ6 + <ItemPicture>)の強化値表示。
function buildPriceInfoSeisyoujuuText(databaseTypeId, itemId, item) {
  if (databaseTypeId != ITEM_SHOP_DB_ARMOR) return ``;
  if (item.etypeId != 6) return ``;
  if (!item.meta['ItemPicture']) return ``;

  const enhanceValue = $gameVariables.value(352)[itemId - valueSeisyoujuuStartId];
  const enhanceLabel = `強化値:`;//翻訳対象
  return `${enhanceLabel}${colorTaggedText(10, `${enhanceValue}`)}\n`;
}
// ---------------------------------------------------------------------------
// 単一アイテム錬金
// ---------------------------------------------------------------------------
// アイテム使用時の単一合成パターン。使用アイテムを素材にする場合。
item_synthesis = function(usedItem,targetItem,itemId){

  if (targetItem.actorId() != usedItem.actorId()) return;

  const synthesisItem = $dataItems[itemId];
  if (!synthesisItem.meta['単一アイテム錬金']) return;

  const singleItemAlchemyValues = synthesisItem.meta['単一アイテム錬金'].split(',');
  const requiredRank = Number(singleItemAlchemyValues[1]);
  const materialCount = Number(singleItemAlchemyValues[3]);
  const resultItemId = Number(singleItemAlchemyValues[2]);
  const resultItem = $dataItems[resultItemId];
  const actor = $gameActors.actor($gameVariables.value(2));

  // 錬金増加スキル(792)を持っていれば2個できる。
  craftAmount = actor.isLearnedSkill(ALCHEMY_BOOST_SKILL_ID) ? 2 : 1;

  if (!actor.isLearnedSkill(valueAlchemySkillId) || actor.skillMasteryLevel(valueAlchemySkillId) < requiredRank) {
    TickerManager.show(`主人公の\x1bSIN[${valueAlchemySkillId}]ランクが必要値に達していません。`);//翻訳対象
    return;
  }

  if ($gameParty.numItems(synthesisItem) < materialCount) {
    TickerManager.show(`必要素材が足りません。`);//翻訳対象
    return;
  }

  AudioManager.playSe({ "name": "Z11_AlchemySuccess", "volume": 80, "pitch": 110, "pan": 0 });
  $gameParty.loseItem(synthesisItem, materialCount);
  $gameParty.gainItem(resultItem, craftAmount);

  const materialLabel = `\x1bIIN[${itemId}]`;
  const resultLabel = colorTaggedText(10, `\x1bIIN[${resultItemId}]`);
  const craftSuccessMessage = `${materialLabel}を${materialCount}個消費して${resultLabel}を${craftAmount}個制作した！`;//翻訳対象
  TickerManager.show(craftSuccessMessage);

  const remainingMaterial = $gameParty.numItems(synthesisItem);
  const remainingResult = $gameParty.numItems(resultItem);
  const craftInfoMessage = `${materialLabel}` + colorTaggedText(1, `${remainingMaterial}`)
    + `個/` + `\x1bIIN[${resultItemId}]` + colorTaggedText(10, `${remainingResult}`) + `個`;
  TickerManager.show(craftInfoMessage);
};

const ALCHEMY_BOOST_SKILL_ID = 792;

// ---------------------------------------------------------------------------
// 錬金アイテムの素材説明
// ---------------------------------------------------------------------------
// レシピ種別ごとの定義。レシピ配列名・参照データベース・アイコン表記が違うだけ。
const SYNTHESIS_RECIPE_KINDS = [
  { recipeKey: 'Item Recipe', recipeListKey: 'recipeItem', databaseTypeId: ITEM_SHOP_DB_ITEM, iconMarker: 'II' },
  { recipeKey: 'Weapon Recipe', recipeListKey: 'recipeWeapon', databaseTypeId: ITEM_SHOP_DB_WEAPON, iconMarker: 'WI' },
  { recipeKey: 'Armor Recipe', recipeListKey: 'recipeArmor', databaseTypeId: ITEM_SHOP_DB_ARMOR, iconMarker: 'AI' }
];

// 錬金アイテムの素材となるアイテムへの説明追加分
item_addSynthesisHelp = function(){

  valueItemsSynth1 = Array(4001).fill(0);

  const actor = $gameActors.actor($gameVariables.value(2));
  if (!actor) return;

  const dataItems = $dataItems;
  const knowsAlchemy = actor.isLearnedSkill(valueAlchemySkillId);
  const itemsEnd = dataItems.length - 1;

  for (let itemId = 1; itemId <= itemsEnd; itemId++) {
    const recipeItem = dataItems[itemId];
    if (!recipeItem) continue;
    for (const recipeKind of SYNTHESIS_RECIPE_KINDS) {
      if (!recipeItem.meta[recipeKind.recipeKey]) continue;
      registerSynthesisSources(recipeItem[recipeKind.recipeListKey], recipeKind, knowsAlchemy);
    }
  }
};

// レシピ1件分の素材を valueItemsSynth1 へ登録する(同じ素材は説明文を連結)。
function registerSynthesisSources(recipeIds, recipeKind, knowsAlchemy) {
  const entries = itemShopDatabase(recipeKind.databaseTypeId);

  for (const recipeId of recipeIds) {
    const recipeTarget = entries[recipeId];
    if (!recipeTarget) continue;
    const ingredients = recipeTarget.synthIngredients;

    for (let ingredientIndex = 0; ingredientIndex < ingredients.length; ingredientIndex++) {
      const synthIngredient = DataManager.getSynthesisIngredient(recipeTarget, ingredientIndex);
      const sourceId = synthIngredient.id + synthesisSlotOffset(synthIngredient);
      const ingredientDisplayText = knowsAlchemy
        ? `\x1b${recipeKind.iconMarker}N[${recipeId}]\n`
        : `？？？\n`;//翻訳対象

      if (valueItemsSynth1[sourceId] == 0) {
        valueItemsSynth1[sourceId] = ingredientDisplayText;
      } else {
        valueItemsSynth1[sourceId] += ingredientDisplayText;
      }
    }
  }
}

// 強化枠持ちの素材は武器/防具で別枠として扱う(<No Augment Slots>)。
function synthesisSlotOffset(synthIngredient) {
  if (!synthIngredient.meta['No Augment Slots']) return 0;
  return synthIngredient.etypeId == 1 ? 2000 : 3000;
}

// ---------------------------------------------------------------------------
// 固有武器
// ---------------------------------------------------------------------------
// 強化段階(変数287の[10])に応じた武器名の接頭辞。<EnhanceName1..9: 必要段階,接頭辞>
function applyUniqueWeaponName(uniqueWeapon, empowerLevel) {
  let isEnhanced = false;

  // 条件を満たす接頭辞が複数ある場合は、一番後ろのものが残る(元コードの上書き順)。
  for (let enhanceIndex = 1; enhanceIndex <= 9; enhanceIndex++) {
    const enhanceNameValue = uniqueWeapon.meta['EnhanceName' + enhanceIndex];
    if (!enhanceNameValue) continue;

    const enhanceNameValues = enhanceNameValue.split(',');
    if (!(empowerLevel >= Number(enhanceNameValues[0]))) continue;

    uniqueWeapon.name = enhanceNameValues[1] + uniqueWeapon.meta['BasicName'];
    isEnhanced = true;
  }
  return isEnhanced;
}

// 強化段階で追加される特性(変数287の[11..30])。値 -> [code, dataId]。
const UNIQUE_WEAPON_TRAITS = {
  1: [22, 0], 2: [22, 1], 3: [22, 2], 4: [22, 7], 5: [22, 8], 6: [22, 9],
  7: [21, 0], 8: [21, 1], 9: [21, 2], 10: [21, 3],
  11: [21, 4], 12: [21, 5], 13: [21, 6], 14: [21, 7]
};
const UNIQUE_WEAPON_TRAIT_VALUE = { 22: 0.01, 21: 1 + 0.05 };

// 固有武器拡張要素設定
weapon_uniqueSet = function(weaponSlotId){

  const uniqueWeapon = $dataWeapons[weaponSlotId + 80];
  if (!uniqueWeapon || uniqueWeapon.name !== '') {

    const weaponStateValues = $gameVariables.value(287)[weaponSlotId];
    const empowerLevel = weaponStateValues[10];
    const isEnhanced = applyUniqueWeaponName(uniqueWeapon, empowerLevel);

    if (!isEnhanced) uniqueWeapon.name = uniqueWeapon.meta['BasicName'];

    // 奥義スキル。強化済みなら1段階上を使う。
    const uniqueSkillId = Number(uniqueWeapon.meta['UniqueOugi']) + (isEnhanced ? 1 : 0);
    weaponStateValues[9] = uniqueSkillId;

    uniqueWeapon.traits = [{ code: 43, dataId: uniqueSkillId, value: 0.00 }];
    for (let traitSlot = 11; traitSlot <= 30; traitSlot++) {
      if (!(weaponStateValues[traitSlot] >= 1)) continue;
      const trait = UNIQUE_WEAPON_TRAITS[weaponStateValues[traitSlot]];
      if (!trait) continue;
      uniqueWeapon.traits.push({ code: trait[0], dataId: trait[1], value: UNIQUE_WEAPON_TRAIT_VALUE[trait[0]] });
    }

    $gamePlayer.refresh();
  }
};

// 固有武器追加説明。valueCountSet3 = 1行あたりの表示数(3 or 5)。
const UNIQUE_WEAPON_PARAM_ICONS = [32, 33, 34, 35, 36, 37, 38, 39];
const UNIQUE_WEAPON_EFFECT_TEXTS = {
  1: `\\I[630]+1%`, 2: `\\I[632]+1%`, 3: `\\I[631]+1%`,
  4: `\\I[640]+1%`, 5: `\\I[641]+1%`, 6: `\\I[642]+1%`,
  7: `\\I[32]+5%`, 8: `\\I[33]+5%`, 9: `\\I[34]+5%`, 10: `\\I[35]+5%`,
  11: `\\I[36]+5%`, 12: `\\I[37]+5%`, 13: `\\I[38]+5%`, 14: `\\I[39]+5%`
};

weapon_uniqueAdd = function(itemId){

  const weaponStateValues = $gameVariables.value(287)[itemId - 80];
  const empowerLevel = weaponStateValues[10];
  const passiveStateData = $dataStates[Number($dataWeapons[itemId].meta['Passive State'])];

  const empowerLabel = `強化段階:`;//翻訳対象
  let enhanceInfoText = colorTaggedText(14, `${empowerLabel}${empowerLevel}/20`) + `\n`;

  if (empowerLevel >= 5 && passiveStateData && passiveStateData.meta['PassiveAddDescription']) {
    const passiveLabel = `付与効果:`;//翻訳対象
    enhanceInfoText += `${passiveLabel}${passiveStateData.meta['PassiveAddDescription']}\n`;
  }

  enhanceInfoText += buildUniqueWeaponParamText(weaponStateValues, UNIQUE_WEAPON_PARAM_ICONS, 0, 7);
  enhanceInfoText += `\n`;
  enhanceInfoText += buildUniqueWeaponEffectText(weaponStateValues, 11, 30);

  if (valueCountSet3 == 3) {
    $gameVariables.setValue(801, $gameVariables.value(801) + enhanceInfoText);
  } else {
    $gameVariables.setValue(801, enhanceInfoText);
  }
};

// パラメータ上昇(変数287の[0..7])を「アイコン+値」で並べる。
function buildUniqueWeaponParamText(weaponStateValues, paramIcons, firstIndex, lastIndex) {
  let paramText = ``;
  let effectCount = 0;

  for (let paramIndex = firstIndex; paramIndex <= lastIndex; paramIndex++) {
    if (!(weaponStateValues[paramIndex] >= 1)) continue;

    paramText += `\\I[${paramIcons[paramIndex]}]` + colorTaggedText(2, `+${weaponStateValues[paramIndex]}`) + ` `;
    effectCount += 1;
    if (effectCount % valueCountSet3 == 0) paramText += `\n`;
  }
  return paramText;
}

// 付加効果(変数287の[11..30]の値)を「[アイコン+効果]」で並べる。
function buildUniqueWeaponEffectText(weaponStateValues, firstIndex, lastIndex) {
  let effectText = ``;
  let effectCount = 0;
  let effectIconText;

  for (let effectSlot = firstIndex; effectSlot <= lastIndex; effectSlot++) {
    const effectValue = weaponStateValues[effectSlot];
    if (!(effectValue >= 1)) continue;

    const effectCandidateText = UNIQUE_WEAPON_EFFECT_TEXTS[effectValue];
    // 15以上の値はテーブルに無いので、直前の表示がそのまま残る(元コードの挙動)。
    if (effectCandidateText !== undefined) effectIconText = effectCandidateText;

    effectCount += 1;
    effectText += `[${effectIconText}]`;
    if (effectCount % valueCountSet3 == 0) effectText += `\n`;
  }
  return effectText;
}

// 固有武器強化過程 weapon_uniqueEnhance($gameVariables.value(20)); 2,3,4,5,6,7
// 強化段階ごとの [必要額, 上昇値配列, 付与スキル]。上から順に上書きされる。
const UNIQUE_WEAPON_ENHANCE_TIERS = [
  { minLevel: 0, costPerLevel: 0, flatCost: 1500, statGains: [30, 0, 0, 0, 0, 0], skillIds: [0, 0] },
  { minLevel: 1, costPerLevel: 3000, flatCost: 0, statGains: [30, 0, 0, 0, 0, 0], skillIds: [0, 0] },
  { minLevel: 5, costPerLevel: 5000, flatCost: 0, statGains: [50, 0, 30, 0, 0, 0], skillIds: [1204, 'level'] },
  { minLevel: 10, costPerLevel: 10000, flatCost: 0, statGains: [100, 0, 50, 30, 30, 0], skillIds: [1206, 'level'] },
  { minLevel: 15, costPerLevel: 100000, flatCost: 0, statGains: [100, 0, 50, 50, 50, 50], skillIds: [1208, 'level'] }
];

weapon_uniqueEnhance = function(id,enhanceModeId){

  if (enhanceModeId == 1) {
    const empowerLevel = $gameVariables.value(287)[id][10];
    const tier = UNIQUE_WEAPON_ENHANCE_TIERS.reduce(function (selectedTier, candidateTier) {
      return empowerLevel >= candidateTier.minLevel ? candidateTier : selectedTier;
    }, UNIQUE_WEAPON_ENHANCE_TIERS[0]);

    valueCountSet1 = tier.flatCost || tier.costPerLevel * empowerLevel;
    valueScriptArray1 = tier.statGains.slice();
    valueScriptArray2 = tier.skillIds.map(function (skillId) {
      return skillId === 'level' ? empowerLevel : skillId;
    });
  }

  if (enhanceModeId == 2) {
    const weaponStateValues = $gameVariables.value(287)[id];
    const uniqueStatGainList = valueScriptArray1;
    for (let statIndex = 0; statIndex <= 5; statIndex++) {
      if (!(uniqueStatGainList[statIndex] >= 1)) continue;
      weaponStateValues[statIndex + 2] += uniqueStatGainList[statIndex];
    }
  }
};

// ---------------------------------------------------------------------------
// 収集表示・簡易Hステータス
// ---------------------------------------------------------------------------
// 収集表示アイテムリスト表示 item_collectList1(284);
// NOTE: 元コードは $gameVariables.value(id1) と未定義変数を参照して必ず落ちていた。
// また eval() で collectSlot1..4 を作っていたが、添字付き配列に置き換えた。
item_collectList1 = function(varId){

  const collectedItemIds = $gameVariables.value(varId);
  const dataItems = $dataItems;
  const party = $gameParty;
  const collectSlotTexts = [];

  for (let slotIndex = 1; slotIndex <= 4; slotIndex++) {
    const collectedItemId = collectedItemIds[slotIndex];
    if (collectedItemId == 0) {
      collectSlotTexts[slotIndex] = `[登録なし]`;//翻訳対象
      continue;
    }
    const collectedItem = dataItems[collectedItemId];
    if (!collectedItem) {
      collectSlotTexts[slotIndex] = `[登録なし]`;//翻訳対象
      continue;
    }
    collectSlotTexts[slotIndex] = `[${collectedItem.name}:${party.numItems(collectedItem)}]`;
  }

  $gameScreen.setDTextPicture(collectSlotTexts[1] + collectSlotTexts[2], 22);
  $gameScreen.setDTextPicture(collectSlotTexts[3] + collectSlotTexts[4], 22);
  $gameScreen.dWindowFrame = 'ON';
  $gameScreen.showPicture(48, "", 0, 10, 698, 100, 100, 255, 0);
};

// 収集表示アイテムリスト表示 actor_miniHstatusList1(283);
actor_miniHstatusList1 = function(varId){

  const battleMembers = $gameParty.battleMembers();
  const statusList = $gameVariables.value(varId);
  let girlMemberCount = 0;

  for (let memberIndex = 0; memberIndex <= 3; memberIndex++) {
    const battleMember = battleMembers[memberIndex];
    if (!battleMember) continue;

    const memberActorId = battleMember.actorId();
    const actor = $gameActors.actor(memberActorId);
    if (!isGirl(actor)) continue;

    girlMemberCount += 1;
    const girlIconName = $dataActors[memberActorId].meta['IconGura'];
    const memberText = girlIconName
      ? `\x1bI[${Number(girlIconName)}]`
      : `[${actor.name()}]`;

    const hpLabel = `\\I[12]:${$gameVariables.value(memberActorId + 380)[1]}`;
    const mpLabel = `\\I[376]:${$gameVariables.value(memberActorId + 380)[2]}`;
    statusList[memberIndex] = memberText + ` ${hpLabel} ${mpLabel}` + buildActorStateIconsText(actor);
    $gameScreen.setDTextPicture(statusList[memberIndex], 22);
  }

  if (girlMemberCount < 1) return;

  const iconOffsetValue = 758 + (girlMemberCount * -30);
  $gameScreen.dWindowFrame = 'ON';
  $gameScreen.showPicture(48, "", 0, 10, iconOffsetValue, 100, 100, 255, 0);
};

// 表示対象のステート(valueHstateDisplay)をアイコンで並べる。
function buildActorStateIconsText(actor) {
  let stateIconsText = ``;
  for (const stateId of valueHstateDisplay) {
    if (!actor.isStateAffected(stateId)) continue;
    stateIconsText += `\\I[${$dataStates[stateId].iconIndex}]`;
  }
  return stateIconsText;
}

// ---------------------------------------------------------------------------
// ショップ品揃え
// ---------------------------------------------------------------------------
// ショップの品目指定。shop_preparation1(1,1,0);//種類/ランク/0読み込みのみ1ショップ処理実行
shop_preparation1 = function(databaseTypeId,targetRarity,sortFlag){

  const entries = itemShopDatabase(databaseTypeId);
  if (!entries) return;
  valueItems = entries;

  const itemsEnd = itemShopDatabaseEnd(databaseTypeId, entries);
  const shopEntries = [];

  for (let itemId = 1; itemId <= itemsEnd; itemId++) {
    const item = entries[itemId];
    if (!item) continue;
    const itemMeta = item.meta;
    if (!itemMeta['ShopRank'] || !itemMeta['LotteryRearity']) continue;
    if (itemMeta['SeiyokuItem']) continue;

    // 武器/防具は装備タイプ(valueCountSet3)が一致するものだけ。アイテムは常に対象。
    const isRankMatched = databaseTypeId == ITEM_SHOP_DB_ITEM || valueCountSet3 == item.etypeId;
    if (!isRankMatched) continue;
    if (Number(itemMeta['LotteryRearity']) != targetRarity) continue;

    shopEntries.push(itemShopEntry(databaseTypeId, itemId));
  }

  // この関数だけ Scene_Shop へ false を渡す(元コードのまま)。
  itemShopOpen(shopEntries, sortFlag, false);
};

// 性欲品ショップ。shop_preparationH(0,1,1);
shop_preparationH = function(unusedArg1,seiyokuItemId,sortFlag){

  const shopEntries = collectShopEntries([ITEM_SHOP_DB_ITEM, ITEM_SHOP_DB_WEAPON, ITEM_SHOP_DB_ARMOR], function (item) {
    return !!item.meta['SeiyokuItem'] && Number(item.meta['SeiyokuItem']) == seiyokuItemId;
  });
  valueItems = $dataArmors;//元コードは防具を最後に参照するため
  itemShopOpen(shopEntries, sortFlag);
};

// 食品ショップ。shop_preparationE(0,1,1);
shop_preparationE = function(databaseTypeId,eatShopId,sortFlag){

  const shopEntries = collectFromItemDatabase(function (item) {
    return !!item.meta['EatShop'] && Number(item.meta['EatShop']) == eatShopId;
  }, databaseTypeId);
  itemShopOpen(shopEntries, sortFlag);
};

// 食材ショップ。shop_preparationEI(0,1,1);
shop_preparationEI = function(databaseTypeId,ingredientsShopId,sortFlag){

  const shopEntries = collectFromItemDatabase(function (item) {
    return !!item.meta['IngredientsShop'] && Number(item.meta['IngredientsShop']) == ingredientsShopId;
  }, databaseTypeId);
  itemShopOpen(shopEntries, sortFlag);
};

// アイテムデータベースだけを対象にした品揃え。品揃えの種別だけ引数の値で記録する
// (shop_preparationE/EI, bookShop_preparert2 は databaseTypeId を素通ししている)。
function collectFromItemDatabase(matches, databaseTypeId) {
  valueItems = $dataItems;
  return collectShopEntries([ITEM_SHOP_DB_ITEM], matches, [0, 0, 0, 0], databaseTypeId);
}

// カジノ"Variable 69 Buy Price"、ブースト薬"Variable 57 Buy Price" otherShop_preparation1(57,0,1);
otherShop_preparation1 = function(buyPriceVarId,lotteryRarity,sortFlag){

  const buyPriceTag = 'Variable ' + buyPriceVarId + ' Buy Price';
  const shopEntries = collectShopEntries([ITEM_SHOP_DB_ITEM, ITEM_SHOP_DB_WEAPON, ITEM_SHOP_DB_ARMOR], function (item) {
    if (!item.meta[buyPriceTag]) return false;
    // lotteryRarity 0 は全ランク、1以上は抽選ランク一致、その間の値は対象なし(元コードどおり)。
    if (lotteryRarity == 0) return true;
    if (lotteryRarity >= 1) return Number(item.meta['LotteryRearity']) == lotteryRarity;
    return false;
  }, [0, 0, 1, 0]);
  itemShopOpen(shopEntries, sortFlag);
};

// 書店(選択肢を作らず品揃えだけ作る版)
bookShop_preparert2 = function(databaseTypeId,bookShopId,sortFlag){

  const shopEntries = collectFromItemDatabase(function (item) {
    return !!item.meta['bookShop'] && Number(item.meta['bookShop']) == bookShopId;
  }, databaseTypeId);
  itemShopOpen(shopEntries, sortFlag);
};

// 書店(選択肢を作る版)。valueCountSet1=ピクチャID, valueCountSet2=選択値 を進めながら並べる。
bookShop_preparert = function(bookShopId){

  const dataItems = $dataItems;
  const party = $gameParty;
  const itemsEnd = dataItems.length - 1;

  for (let itemId = 1; itemId <= itemsEnd; itemId++) {
    const bookItem = dataItems[itemId];
    if (!bookItem || bookItem.name === '') continue;
    const bookMeta = bookItem.meta;
    if (!bookMeta['bookShop']) continue;
    if (Number(bookMeta['bookShop']) != bookShopId) continue;

    // <Max Item:1> の書物は未所持の時だけ並べる。
    const isBookOwned = Number(bookMeta['Max Item']) == 1 ? party.numItems(bookItem) != 0 : false;
    if (isBookOwned) continue;

    addBookChoice(bookItem, itemId);
  }
};

// 書物1冊分の選択肢・説明・ピクチャを登録する。
function addBookChoice(bookItem, itemId) {
  const bookPrice = applyShopDiscount(bookItem.price);
  const ownedCount = $gameParty.numItems(bookItem);
  const bookListText = `${padBookName(bookItem.name)}${buildBookOwnedLabel(ownedCount)} `
    + colorTaggedText(2, bookPrice.toLocaleString()) + `\\G`;
  const bookDescriptionText = buildBookDescriptionText(bookItem);

  $gameSystem.addCustomChoice(1, { text: bookListText, value: valueCountSet2 });
  $gameScreen.setDTextPicture(bookDescriptionText, 28);
  $gameScreen.dWindowFrame = 'ON';
  $gameScreen.showPicture(valueCountSet1, "", 0, 10, 606, 100, 100, 255, 0);
  $gameMessage.setSelectPictureId(valueCountSet2, valueCountSet1);
  valueCountSet1 += 1;
  valueCountSet2 += 1;
  valueScriptArray2.push(itemId);
}

// valueCountSet3 は割引率(%)。
function applyShopDiscount(price) {
  if (valueCountSet3 == 0) return price;
  return Math.floor(price - (price * valueCountSet3 / 100));
}

function buildBookOwnedLabel(ownedCount) {
  if (ownedCount < 1) return colorTaggedText(3, `[未所持]`) + ` `;
  return colorTaggedText(10, `[${ownedCount}冊所持]`) + ` `;
}

// 書名を全角スペースで 21 文字分に揃える。
function padBookName(bookName) {
  let paddedName = bookName;
  if (paddedName.length > 19) return paddedName;
  for (let padIndex = paddedName.length; padIndex <= 20; padIndex++) paddedName += `　`;
  return paddedName;
}

// <ADDescription:\sin[788]:\SD[788]> からスキルIDを抜き出して説明文に足す。
function buildBookDescriptionText(bookItem) {
  const bookDescriptionText = `${bookItem.description}`;
  const adDescriptionValue = bookItem.meta['ADDescription'];
  if (!adDescriptionValue) return bookDescriptionText;

  const adDescription = adDescriptionValue.replace("\\sin[", "");
  const adSkillId = extractSkillIdFromDescription(adDescription);
  const adSkill = $dataSkills[Number(adSkillId)];
  return `${bookDescriptionText}\n${adSkill.name}:${adSkill.description}`;
}

// "[788]" の閉じ括弧までの数字を読む(最大3桁)。
function extractSkillIdFromDescription(adDescription) {
  let adSkillId = `${adDescription.charAt(0)}${adDescription.charAt(1)}`;
  if (adDescription.charAt(2) != ']') adSkillId += adDescription.charAt(2);
  return adSkillId;
}

// <jouhouBuyVariable:135,1><jouhouBuySwitche:135><jouhouBuyItem:100,101>
jouhouShop_preparert = function(){

  const dataItems = $dataItems;
  const buyInfoItemId = 6;//条件を満たさない枠に出すダミーアイテム
  const itemsEnd = dataItems.length - 1;
  const buyItemIds = [];

  for (let itemId = 1; itemId <= itemsEnd; itemId++) {
    const infoItemMeta = dataItems[itemId].meta;

    if (infoItemMeta['jouhouBuyVariable']) {
      const jouhouBuyValues = infoItemMeta['jouhouBuyVariable'].split(',');
      const jouhouVariableId = Number(jouhouBuyValues[0]);
      if (jouhouVariableId >= 1) {
        const isVariableReached = $gameVariables.value(jouhouVariableId) >= Number(jouhouBuyValues[1]);
        buyItemIds.push(isVariableReached ? itemId : buyInfoItemId);
      }
    }

    if (infoItemMeta['jouhouBuySwitche'] && Number(infoItemMeta['jouhouBuySwitche']) >= 1) {
      const isSwitchOn = $gameSwitches.value(Number(infoItemMeta['jouhouBuySwitche']));
      buyItemIds.push(isSwitchOn ? itemId : buyInfoItemId);
    }

    if (infoItemMeta['jouhouBuyItem']) {
      buyItemIds.push(resolveJouhouBuyItemId(itemId, infoItemMeta['jouhouBuyItem'], buyInfoItemId));
    }
  }

  for (const infoItemId of buyItemIds) {
    $gameSystem.addCustomChoice(1, { text: buildJouhouChoiceText(infoItemId, buyInfoItemId), value: infoItemId });
  }
};

// <jouhouBuyItem:100,101> のいずれかを持っていればその情報を買える。
function resolveJouhouBuyItemId(itemId, jouhouBuyItemValue, buyInfoItemId) {
  const jouhouBuyValues = jouhouBuyItemValue.split(',');
  for (const jouhouBuyItemId of jouhouBuyValues) {
    if (Number(jouhouBuyItemId) < 1) continue;
    if (!$gameParty.hasItem($dataItems[Number(jouhouBuyItemId)], true)) continue;
    return itemId;
  }
  return buyInfoItemId;
}

// 情報屋の選択肢テキスト。ダミー枠(6)は名前だけ。
function buildJouhouChoiceText(infoItemId, buyInfoItemId) {
  const infoItem = $dataItems[infoItemId];
  if (infoItemId == buyInfoItemId) return infoItem.name;

  let infoItemNameText = infoItem.name;
  const priceLabel = `(`;
  infoItemNameText += ` ` + colorTaggedText(2, `${priceLabel}${infoItem.price.toLocaleString()}\\G)`);//翻訳対象
  if ($gameParty.hasItem(infoItem, true)) infoItemNameText += colorTaggedText(10, `[購入済み]`);
  return infoItemNameText;
}
// ---------------------------------------------------------------------------
// 食事
// ---------------------------------------------------------------------------
// 満腹度(変数16)の上限は変数13。食べた効果は変数620の配列に積む。
const EAT_SATIETY_VARIABLE_ID = 16;
const EAT_SATIETY_MAX_VARIABLE_ID = 13;
const EAT_EFFECT_ARRAY_VARIABLE_ID = 620;
const EAT_EFFECT_STATE_ID = 107;
const EAT_EFFECT_SLOT_MAX = 9;

// 満腹度が上限に達しているか(item_eatEvent2 は「上限<=現在」で判定する)。
function isFullStomach() {
  return !($gameVariables.value(EAT_SATIETY_MAX_VARIABLE_ID) > $gameVariables.value(EAT_SATIETY_VARIABLE_ID));
}

// item_eatEvent(没版)は「現在 > 上限」で判定する(元コードで判定式が異なる)。
function isFullStomachOver() {
  return $gameVariables.value(EAT_SATIETY_VARIABLE_ID) > $gameVariables.value(EAT_SATIETY_MAX_VARIABLE_ID);
}

// <eatEffect1..9: 種類,値,時間> を変数620の配列へ積む。
function pushEatEffectEntries(itemMeta) {
  const eatEffectArray = $gameVariables.value(EAT_EFFECT_ARRAY_VARIABLE_ID);

  for (let effectSlot = 1; effectSlot <= EAT_EFFECT_SLOT_MAX; effectSlot++) {
    const eatEffectValue = itemMeta['eatEffect' + effectSlot];
    if (!eatEffectValue) continue;
    const eatEffectValues = eatEffectValue.split(',');
    eatEffectArray.push([Number(eatEffectValues[0]), Number(eatEffectValues[1]), Number(eatEffectValues[2])]);
  }
}

// 食事イベント
item_eatEvent2 = function(usedItem,targetItem,itemId){

  if (targetItem.actorId() != usedItem.actorId()) return;

  // スイッチ603が立っている間は、決定でウィンドウを閉じる2段目。
  if ($gameSwitches.value(603)) {
    WindowManager.hide(0);
    valueCountSet1 = 0;
    $gameSwitches.setValue(603, false);
    return;
  }

  if (isFullStomach()) {
    const satietyMaxLabel = `満腹でこれ以上は食べられない…。（満腹上限:`;//翻訳対象
    TickerManager.show(`${satietyMaxLabel}${colorTaggedText(10, `${$gameVariables.value(EAT_SATIETY_MAX_VARIABLE_ID)}`)}）`);
    return;
  }

  const eatItem = $dataItems[itemId];
  const eatItemMeta = eatItem.meta;

  pushEatEffectEntries(eatItemMeta);
  $gameVariables.setValue(EAT_SATIETY_VARIABLE_ID, $gameVariables.value(EAT_SATIETY_VARIABLE_ID) + 1);

  $gameParty.members().forEach(function (actor) { actor.addState(EAT_EFFECT_STATE_ID); });
  trait_changeSetting(EAT_EFFECT_STATE_ID);
  $gameParty.gainItem(eatItem, -1);
  AudioManager.playSe({ "name": "Z_Eat", "volume": 100, "pitch": 100, "pan": 0 });

  const windowWidth = 1280;
  const windowHeight = 290;
  WindowManager.show(0, 0, 0, windowWidth, windowHeight);
  WindowManager.drawText(0, buildEatInfoMessage(itemId, eatItemMeta));
  valueCountSet1 = 1;

  $gameSwitches.setValue(603, true);
  activateEatEventSwitch(eatItemMeta);
};

// 満腹度と食べた動詞を出すメッセージ。
function buildEatInfoMessage(itemId, eatItemMeta) {
  const satietyNow = $gameVariables.value(EAT_SATIETY_VARIABLE_ID);
  const satietyMax = $gameVariables.value(EAT_SATIETY_MAX_VARIABLE_ID);
  const itemLabel = `\x1bIIN[${itemId}]`;

  const eatInfoMessage = `${itemLabel}を${eatOutcomeText(eatItemMeta)}。（満腹度:`
    + colorTaggedText(3, `${satietyNow}`) + `/` + colorTaggedText(10, `${satietyMax}`) + `）\n`
    + `${$dataStates[EAT_EFFECT_STATE_ID].description}\n\n`
    + `※ ` + colorTaggedText(10, `ウィンドウ消去はカーソルをそのままで決定ボタンorマウス左クリック。`) + `\n`;
  return eatInfoMessage;
}

// <EventOnSwitch:n> の 2 以上ならイベントスイッチとして立てる。
function activateEatEventSwitch(eatItemMeta) {
  const eventOnSwitchValue = eatItemMeta['EventOnSwitch'];
  if (!eventOnSwitchValue) return;

  const eventSwitchId = Number(eventOnSwitchValue);
  if (!(eventSwitchId >= 2)) return;
  if ($gameSwitches.value(eventSwitchId)) return;
  $gameSwitches.setValue(eventSwitchId, true);
}

// 食事イベント、没
item_eatEvent = function(unusedArg1,unusedArg2,itemId){

  if (isFullStomachOver()) {
    TickerManager.show(`満腹でこれ以上は食べられない…。`);//翻訳対象
    return;
  }

  const eatItem = $dataItems[itemId];
  const eatItemMeta = eatItem.meta;
  const eatStuffValue = Number(eatItemMeta['Stuff']);
  const eatTpValue = Number(eatItemMeta['ＴＰ']);

  $gameVariables.setValue(EAT_SATIETY_VARIABLE_ID, $gameVariables.value(EAT_SATIETY_VARIABLE_ID) + eatStuffValue);
  $gameParty.members().forEach(function (actor) { actor.gainTp(eatTpValue); });
  AudioManager.playSe({ "name": "Z_Eat", "volume": 100, "pitch": 100, "pan": 0 });

  const itemLabel = colorTaggedText(24, `\x1bIIN[${itemId}]`);
  const satietyNow = `\\V[16]`;
  const satietyMax = `\\V[13]`;
  const tpLabel = `TP`;
  const percentLabel = `%UP! `;
  const satietyLabel = `満腹度`;//翻訳対象
  const increaseLabel = `上昇`;//翻訳対象
  TickerManager.show(
    `${itemLabel}を${eatOutcomeText(eatItemMeta)} ${tpLabel}${colorTaggedText(2, `${eatTpValue}`)}${percentLabel}`
    + `${satietyLabel}${colorTaggedText(2, `${eatStuffValue}`)}${increaseLabel}(${satietyNow}/${satietyMax})`//翻訳対象
  );

  $gameParty.loseItem(eatItem, 1);

  const onSwitchValue = eatItemMeta['OnSwitch'];
  if (!onSwitchValue) return;
  const onSwitchId = Number(onSwitchValue);
  if (!(onSwitchId >= 1) || $gameSwitches.value(onSwitchId)) return;
  $gameSwitches.setValue(onSwitchId, true);
  time_settei();
};

// ---------------------------------------------------------------------------
// 財布アイテム
// ---------------------------------------------------------------------------
// アイテム財布からルビ入手。<walletIn: 最小,幅>
wallet_insideGet = function(usedItem,targetItem,itemId,databaseTypeId){

  if (targetItem.actorId() != usedItem.actorId()) return;

  const entries = itemShopDatabase(databaseTypeId);
  if (!entries) return;
  valueItems = entries;

  const walletItem = entries[itemId];
  const walletInValues = walletItem.meta['walletIn'].split(',');
  const walletMin = Number(walletInValues[0]);
  const walletRange = Number(walletInValues[1]);
  const walletGainAmount = Math.floor(Math.random() * walletRange + 1) + walletMin;

  const walletItemLabel = colorTaggedText(2, `\x1bIIN[${itemId}]`);
  const walletAmountLabel = `には`;//翻訳対象
  const walletFoundLabel = `入っていた！`;//翻訳対象
  TickerManager.show(
    `${walletItemLabel}${walletAmountLabel}${colorTaggedText(14, `${walletGainAmount}\\G`)}${walletFoundLabel}`
  );

  $gameParty.gainGold(walletGainAmount);
  $gameParty.gainItem(walletItem, -1);
};

// ---------------------------------------------------------------------------
// 一括売却
// ---------------------------------------------------------------------------
// 売却対象の選択肢を作る。damageTypeId 0=アイテム 1=武器 2=防具。
ikkatu_sellChoice = function(databaseTypeId,menuCategoryId){

  const entries = itemShopDatabase(databaseTypeId);
  if (!entries) return;

  const party = $gameParty;
  const itemsEnd = itemShopDatabaseEnd(databaseTypeId, entries);
  const sellChoiceTexts = [];
  const sellItemIds = [];

  for (let itemId = 1; itemId <= itemsEnd; itemId++) {
    const item = entries[itemId];
    if (!item) continue;
    if (!canBulkSell(item, databaseTypeId, menuCategoryId)) continue;
    if (!party.hasItem(item)) continue;

    // セルフスイッチ(一括売却対象)が立っていれば色を変える。
    const isMarkedForBulkSell = $gameSelfSwitches.getVariableValue([4, databaseTypeId + 11, itemId]) != 0;
    sellChoiceTexts.push(buildBulkSellChoiceText(item, party, isMarkedForBulkSell));
    sellItemIds.push(itemId);
  }

  if (sellChoiceTexts.length < 1) return;
  valueWordArray = sellChoiceTexts;
  valueCountArray = sellItemIds;
};

// 一括売却の対象になり得るか(名前・売却価格・カテゴリ・装備タイプ・所持)。
function canBulkSell(item, databaseTypeId, menuCategoryId) {
  if (item.name === '') return false;
  if (!(item.price >= 1 || hasSellPriceTag(item))) return false;
  if (databaseTypeId == ITEM_SHOP_DB_ITEM && item.meta['Menu Category'] != menuCategoryId) return false;
  if (databaseTypeId == ITEM_SHOP_DB_ARMOR && item.etypeId == 3) return false;
  return true;
}

// 一括売却の選択肢1行。
function buildBulkSellChoiceText(item, party, isMarkedForBulkSell) {
  const fontSizeTag = `\\FS[25]`;
  const nameAndCount = `\x1bI[${item.iconIndex}]${item.name}:${party.numItems(item)}`;
  return `${fontSizeTag}${colorTaggedText(isMarkedForBulkSell ? 10 : 0, nameAndCount)}`;
}

// アイテム一括売却対象選択(セルフスイッチ版)
ikkatu_sellChoice2 = function(databaseTypeId){

  const entries = itemShopDatabase(databaseTypeId);
  if (!entries) return;

  const party = $gameParty;
  const itemsEnd = itemShopDatabaseEnd(databaseTypeId, entries);
  const sellItemLines = [];
  const sellItemIds = [];
  const databaseTypeIds = [];

  for (let itemId = 1; itemId <= itemsEnd; itemId++) {
    const item = entries[itemId];
    if (!item) continue;
    if ($gameSelfSwitches.getVariableValue([4, databaseTypeId + 11, itemId]) != 1) continue;

    sellItemLines.push(`\\FS[25]\x1bI[${item.iconIndex}]${item.name}:${party.numItems(item)}`);
    sellItemIds.push(itemId);
    databaseTypeIds.push(databaseTypeId);
  }

  if (sellItemLines.length < 1) return;
  valueWordArray = sellItemLines;
  valueCountArray = sellItemIds;
  valueCountArray2 = databaseTypeIds;
};

// アイテム一括売却実行内部計算
item_ikkatu = function(databaseTypeId){

  const entries = itemShopDatabase(databaseTypeId);
  if (!entries) return;

  const party = $gameParty;
  const itemsEnd = itemShopDatabaseEnd(databaseTypeId, entries);

  for (let itemId = 1; itemId <= itemsEnd; itemId++) {
    const item = entries[itemId];
    if (!item) continue;
    if (!party.hasItem(item)) continue;
    //セルフスイッチ(一括売却対象)が立っている品だけ売る
    const bulkSellMark = $gameSelfSwitches.getVariableValue([4, 11 + databaseTypeId, itemId]);
    if (!(bulkSellMark >= 1)) continue;

    sellBulkItem(item);
  }
};

// 1品目分の一括売却。売却額は通貨別(所持金/変数57/変数69/アイテム)に振り分ける。
function sellBulkItem(item) {
  const itemMeta = item.meta;
  const sellItemCount = $gameParty.numItems(item);
  if (sellItemCount < 1) return;

  const goldPrices = resolveBulkSellGoldPrices(item);
  const variablePrice = resolveBulkSellVariablePrice(itemMeta) * sellItemCount;
  const itemPrice = resolveBulkSellItemPrice(itemMeta) * sellItemCount;

  $gameParty.loseItem(item, sellItemCount);
  if (goldPrices.total >= 1) $gameParty.gainGold(goldPrices.total);

  // NOTE: 変数69の加算にも変数57側の計算値が使われている(元コードのまま)。
  if (itemMeta['Variable 57 Sell Price'] && variablePrice >= 1) {
    $gameVariables.setValue(57, $gameVariables.value(57) + variablePrice);
  }
  if (itemMeta['Variable 69 Sell Price'] && variablePrice >= 1) {
    $gameVariables.setValue(69, $gameVariables.value(69) + variablePrice);
  }

  if (itemPrice >= 1) {
    for (const sellItemTag of ITEM_SHOP_SELL_ITEM_TAGS) {
      if (!itemMeta[sellItemTag]) continue;
      $gameParty.gainItem($dataItems[Number(sellItemTag.split(' ')[1])], itemPrice);
    }
  }

  valueIkkatuArray.push([
    `\x1bI[${item.iconIndex}]${item.name}`, sellItemCount, goldPrices.total, variablePrice, itemPrice
  ]);
  valueCountSet1 += 1;
}

// 所持金売却額。<Price> は半額、<Sell Price> が優先。
function resolveBulkSellGoldPrices(item) {
  const itemMeta = item.meta;
  let baseSellPrice = 0;
  let itemBasePrice = item.price;

  if (itemMeta['Sell Price']) baseSellPrice = Number(itemMeta['Sell Price']);
  if (itemMeta['Price']) baseSellPrice = Math.round(Number(itemMeta['Price']) / 2);

  const sellItemCount = $gameParty.numItems(item);
  if (baseSellPrice >= 1) baseSellPrice = baseSellPrice * sellItemCount;
  if (itemBasePrice >= 1) itemBasePrice = itemBasePrice / 2 * sellItemCount;

  return { total: itemBasePrice + baseSellPrice };
}

// 変数通貨の売却額(変数57/69のタグは同じ変数に上書きされる)。
function resolveBulkSellVariablePrice(itemMeta) {
  let variablePrice = 0;
  for (const sellTag of ITEM_SHOP_SELL_VARIABLE_TAGS) {
    if (!itemMeta[sellTag]) continue;
    variablePrice = Number(itemMeta[sellTag]);
  }
  return variablePrice;
}

// アイテム通貨の売却額(270/147/152 のタグは同じ変数に上書きされる)。
function resolveBulkSellItemPrice(itemMeta) {
  let itemPrice = 0;
  for (const sellTag of ITEM_SHOP_SELL_ITEM_TAGS) {
    if (!itemMeta[sellTag]) continue;
    itemPrice = Number(itemMeta[sellTag]);
  }
  return itemPrice;
}

// ---------------------------------------------------------------------------
// ショップの購入レート設定
// ---------------------------------------------------------------------------
// shop_taxDecision1(this._eventId);
// 値引き率はセルフスイッチ(10)の変数値。負値が値引き。
shop_taxDecision1 = function(eventId){

  valueCountSet1 = 0;
  valueCountSet2 = 0;
  valueCountSet3 = 0;
  valueRandomSet = 0;
  $gameSwitches.setValue(380, false);

  const actor = $gameActors.actor($gameVariables.value(11));
  const shopEvent = $gameMap.event(eventId);
  if (!actor || !shopEvent) return;

  const mapId = $gameMap.mapId();
  const taxRate = $gameSelfSwitches.getVariableValue([mapId, eventId, 10]);
  const isNegotiated = $gameSelfSwitches.value([mapId, eventId, 'B']);
  const isHoneyTrapped = $gameSelfSwitches.value([mapId, eventId, 'A']);

  $gameSystem.setBuyTaxTo(isNegotiated ? taxRate : 0);
  if (isHoneyTrapped) valueCountSet1 += 1;

  if ($gameSwitches.value(138)) {//商業on
    const shopEventMeta = shopEvent.event().meta || {};
    if (shopEventMeta['Man'] && actor.battleSkillsRaw().contains(valueHoneyTrapSkillId)) {
      valueCountSet2 += 1;
    }
    //交渉は一日一回
    if (!isNegotiated) $gameSwitches.setValue(380, true);
  }

  if (taxRate > -1) return;
  const negotiableLabel = `値段交渉済み：`;//翻訳対象
  const discountLabel = `の値引きが行われます。`;//翻訳対象
  const taxInfoText = `${negotiableLabel}${colorTaggedText(10, `${-taxRate}%`)}${discountLabel}`;
  CommonPopupManager.showInfo({}, taxInfoText, null);
};

// ショップの購入レート設定。順番にコモンでウェイトを挟んでいる shop_taxDecision2(this._eventId,1);
shop_taxDecision2 = function(eventId,decisionModeId){

  $gameSwitches.setValue(380, false);

  const actor = $gameActors.actor($gameVariables.value(11));
  if (!actor) return;

  if (decisionModeId == 1) startTaxDecisionWindow();
  if (decisionModeId == 2) playHoneyTrapScene(actor);
  if (decisionModeId == 3) rollTaxDecision(eventId, actor);
  if (decisionModeId == 4) finishTaxDecision(eventId);
};

// 1: 交渉中ウィンドウを出す。
function startTaxDecisionWindow() {
  $gameVariables.setValue(21, `値引き交渉を行っています…。\n`);//翻訳対象
  $gameScreen.dTextRealTime = 'ON';
  $gameScreen.dWindowFrame = 'ON';
  $gameScreen.setDTextPicture(`\\V[21]`, 28);

  const negotiationPictureId = 100;
  $gameScreen.showPicture(negotiationPictureId, "", 0, 10 + 50, 100, 100, 100, 0, 0);
  $gameScreen.movePicture(negotiationPictureId, 0, 10, 100, 100, 100, 255, 0, 60);
}

// 2: 色仕掛け演出。ピクチャは variant ごとに [ID, 画像, 開始X, 終了X, 不透明度] で並べる。
const HONEY_TRAP_PICTURE_SETS = {
  1: [
    [55, 'ScreenBlackOut', 640 - 100, 640, 200],
    [56, 'Zev_HoneyTrap1_1a', 640 + 100, 640, 250],
    [57, 'Zev_HoneyTrap1_1', 1024 + 128, 1024, 255]
  ],
  2: [
    [55, 'Screen_Width512Black', 1024 - 100, 1024 - 50, 200],
    [56, 'Zev_HoneyTrap1_2', 1024 + 128, 1024, 255]
  ],
  // variant 3 は抽選対象([1,2])に含まれないため実際には使われない。
  3: [
    [55, 'ScreenBlackOut', 640 - 100, 640, 200],
    [56, 'Zev_HoneyTrap1_3', 640 + 50, 640, 250]
  ]
};

function playHoneyTrapScene() {
  valueRandomSet = 10;
  const honeyTrapParticle = 'hStates_hexpUp';
  $gameScreen._particle.particleSet(0, honeyTrapParticle, 'screen', 'def', 'spriteset');
  AudioManager.playSe({ "name": 'ZH_Sexy', "volume": 40, "pitch": 130, "pan": 0 });
  $gameScreen.startFlash([255, 119, 255, 200], 60);

  const trapVariantCandidates = [1, 2];
  const trapVariant = trapVariantCandidates[getRandomIndex(trapVariantCandidates.length)];
  for (const trapPicture of HONEY_TRAP_PICTURE_SETS[trapVariant]) {
    showHoneyTrapPicture(trapPicture);
  }
}

// 1枚分のピクチャ表示(右から中央へスライド)。
function showHoneyTrapPicture(trapPicture) {
  const [pictureId, pictureName, startX, endX, opacity] = trapPicture;
  const pictureY = 384;
  const moveDuration = 60;
  $gameScreen.showPicture(pictureId, pictureName, 1, startX, pictureY, 100, 100, 0, 0);
  $gameScreen.movePicture(pictureId, 1, endX, pictureY, 100, 100, opacity, 0, moveDuration);
}

// 3: 交渉の成否抽選。しきい値は <NoDiscount> で変化する。
const TAX_SUCCESS_THRESHOLDS = { normal: 60, noDiscount: 1000 };

function rollTaxDecision(eventId, actor) {
  const businessMastery = actor.skillMasteryLevel(valueBusinessSkillId);
  const rollScore = getRandomIndex(101) + businessMastery * 10 + valueRandomSet;
  const eventMeta = $gameMap.event(eventId).event().meta || {};
  const successThreshold = eventMeta['NoDiscount'] ? TAX_SUCCESS_THRESHOLDS.noDiscount : TAX_SUCCESS_THRESHOLDS.normal;

  const formulaLabel = `成功計算式：`;//翻訳対象
  const formulaText = `${formulaLabel}${colorTaggedText(2, `${rollScore}`)} >= ${colorTaggedText(1, `${successThreshold}`)} \n`;
  $gameVariables.setValue(21, $gameVariables.value(21) + formulaText);

  if (rollScore < successThreshold) return;

  const discountRate = getRandomIndex(11) + businessMastery * 5 + valueRandomSet;
  $gameSelfSwitches.setVariableValue([$gameMap.mapId(), eventId, 10], discountRate);
  valueCountSet3 = 1;
}

// 4: 結果表示。成功していればセルフAを立てる。
function finishTaxDecision(eventId) {
  const mapId = $gameMap.mapId();

  if (valueCountSet3 != 1) {
    $gamePlayer.requestBalloon(6);
    AudioManager.playSe({ "name": 'Down1', "volume": 90, "pitch": 100, "pan": 0 });
    $gameVariables.setValue(21, $gameVariables.value(21) + `交渉失敗…。`);//翻訳対象
    $gameSelfSwitches.setValue([mapId, eventId, 'B'], true);
    return;
  }

  AudioManager.playSe({ "name": 'Z11_QuestClear', "volume": 50, "pitch": 130, "pan": 0 });
  const discountRate = $gameSelfSwitches.getVariableValue([mapId, eventId, 10]);
  const successLabel = `交渉成功！ `;//翻訳対象
  const discountLabel = `%の値引きが行われます。\n`;//翻訳対象
  $gameVariables.setValue(21,
    $gameVariables.value(21) + `${successLabel}${colorTaggedText(10, `${discountRate}${discountLabel}`)}`);

  //色仕掛け使用時に値引き成功でセルフAオン
  if (valueCountSet2 == 1) $gameSelfSwitches.setValue([mapId, eventId, 'A'], true);
  $gameSelfSwitches.setValue([mapId, eventId, 'B'], true);
}

// ---------------------------------------------------------------------------
// 価格と所持金の比較
// ---------------------------------------------------------------------------
// shop_priceComparison(10000,0,0);
// costAmount 0 なら品物から価格を引く。currencyTypeId 0=所持金 1=コイン(変数69) 2=戦貨(アイテム10)。
shop_priceComparison = function(costAmount,currencyTypeId,itemId){

  valuePriceSet1 = costAmount;
  let ownedAmount = $gameParty.gold();

  if (costAmount == 0) {
    valuePriceSet1 = resolvePurchasePrice(currencyTypeId, itemId);
  }

  const currency = purchaseCurrency(currencyTypeId, costAmount);
  ownedAmount = currency.ownedAmount;

  if (ownedAmount < costAmount) {
    const priceComparisonText = `${currency.label}:${ownedAmount.toLocaleString()}${currency.unit} < `
      + `支払額:${costAmount.toLocaleString()}${currency.unit}　所持金が足りなかった…`;//翻訳対象
    CommonPopupManager.showInfo({}, priceComparisonText, null);
    $gameSwitches.setValue(380, false);
    return;
  }

  const priceDifference = ownedAmount - costAmount;
  const priceComparisonText = `${currency.label}:${ownedAmount.toLocaleString()}${currency.unit} - `
    + `支払額:${costAmount.toLocaleString()}${currency.unit} = `
    + colorTaggedText(14, `${priceDifference.toLocaleString()}${currency.unit}`) + `…`;
  CommonPopupManager.showInfo({}, priceComparisonText, null);
  AudioManager.playSe({ "name": 'Shop', "volume": 90, "pitch": 100, "pan": 0 });

  payPurchaseCost(costAmount, currencyTypeId);
  $gameSwitches.setValue(380, true);
};

// 品物の価格(<Buy Price> 優先)。
function resolvePurchasePrice(currencyTypeId, itemId) {
  const entries = itemShopDatabase(currencyTypeId);
  if (!entries) return 0;
  valueItems = entries;//元コードと同じくグローバルにも残す

  const purchaseItem = entries[itemId];
  let comparedPrice = 0;
  if (Number(purchaseItem.price) >= 1) comparedPrice = purchaseItem.price;
  if (purchaseItem.meta['Buy Price']) comparedPrice = Number(purchaseItem.meta['Buy Price']);
  return comparedPrice;
}

// 通貨ごとの表示名・単位・所持量。costAmount 0 の時は所持金のまま(元コードどおり)。
function purchaseCurrency(currencyTypeId, costAmount) {
  if (costAmount >= 1 && currencyTypeId == 1) {
    return { label: `コイン`, unit: `枚`, ownedAmount: $gameVariables.value(69) };//翻訳対象
  }
  if (costAmount >= 1 && currencyTypeId == 2) {
    return { label: `戦貨`, unit: `枚`, ownedAmount: $gameParty.numItems($dataItems[10]) };//翻訳対象
  }
  return { label: `所持金`, unit: `\\G`, ownedAmount: $gameParty.gold() };//翻訳対象
}

// 支払い。コインは変数69、戦貨はアイテム10、それ以外は所持金。
function payPurchaseCost(costAmount, currencyTypeId) {
  if (costAmount >= 1 && currencyTypeId == 1) {
    $gameVariables.setValue(69, $gameVariables.value(69) - costAmount);
    return;
  }
  if (costAmount >= 1 && currencyTypeId == 2) {
    $gameParty.gainItem($dataItems[10], -costAmount);
    return;
  }
  $gameParty.gainGold(-costAmount);
}

// ---------------------------------------------------------------------------
// ワンオフアイテム購入
// ---------------------------------------------------------------------------
// buyModeId 1=表示準備 2=購入 3=戦闘勝利 0=後片付け
const ONE_OFF_BUY_PICTURE_ID = 101;
const ONE_OFF_BUY_SUMMON_ICON_INDEX = 508;

item_oneOffBuy = function(buyModeId,databaseTypeId,dbEntryId,buyFlag){

  const entries = itemShopDatabase(databaseTypeId);
  if (!entries) return;

  valueItems = entries[dbEntryId];
  const purchaseItem = valueItems;
  if (!purchaseItem) return;

  // NOTE: 元コードは pictureYOffset を <ItemPicture> がある時だけ定義していたため、
  // 無い場合は undefined(と NaN)が後続へ渡る。その挙動は変えていない。
  let pictureYOffset;
  let passiveStateId = 0;

  if (buyModeId == 1) {
    passiveStateId = showOneOffBuyPictures(purchaseItem, buyFlag);
    pictureYOffset = showOneOffBuyItemPicture(purchaseItem, passiveStateId);
    playOneOffBuyWeaponAnimation(purchaseItem, databaseTypeId, pictureYOffset);
    return;
  }

  if (buyModeId == 2) {
    $gameParty.gainItem(purchaseItem, 1);
    $gameParty.loseGold($gameVariables.value(22));

    const itemLabel = `\x1bI[${purchaseItem.iconIndex}]` + colorTaggedText(16, purchaseItem.name);
    const paidAmount = `(-${$gameVariables.value(22)}\\G)`;
    CommonPopupManager.showInfo({}, `${itemLabel}を購入した。${colorTaggedText(1, paidAmount)}`, null);//翻訳対象
    AudioManager.playSe({ "name": 'Shop1', "volume": 90, "pitch": 100, "pan": 0 });
    return;
  }

  if (buyModeId == 3) {//戦闘で勝利
    $gameParty.gainItem(purchaseItem, 1);
    const itemLabel = `\x1bI[${purchaseItem.iconIndex}]` + colorTaggedText(16, purchaseItem.name);
    valueWordSet0 = `${itemLabel}を入手した！`;//翻訳対象
    AudioManager.playSe({ "name": 'Z11_RareTreasureBox', "volume": 50, "pitch": 120, "pan": 0 });
    adv_partDirectPlay(18);
    return;
  }

  if (buyModeId == 0) {
    pic_eraseP(0, [ONE_OFF_BUY_PICTURE_ID - 3, ONE_OFF_BUY_PICTURE_ID - 2]);
    picture_fade1(ONE_OFF_BUY_PICTURE_ID, "fadeOut", 'Hscene005', 60, 5);
    element_particleSet(0, ONE_OFF_BUY_PICTURE_ID, passiveStateId, pictureYOffset);
  }
};

// 背景と立ち絵を出し、説明文(変数21)と価格(変数22)を設定する。
function showOneOffBuyPictures(purchaseItem, buyFlag) {
  const backgroundPath = (buyFlag == 0)
    ? "/img/parallaxes/Scene_ItemsBuy"
    : "/img/parallaxes/" + $gameVariables.value(508);
  $gameScreen.showPicture(ONE_OFF_BUY_PICTURE_ID - 3, backgroundPath, 1, 640, 384, 100, 100, 0, 0);
  $gameScreen.movePicture(ONE_OFF_BUY_PICTURE_ID - 3, 1, 640, 384, 100, 100, 250, 0, 40);

  const blackOutPath = 'ScreenBlackOut';
  $gameScreen.showPicture(ONE_OFF_BUY_PICTURE_ID - 2, blackOutPath, 1, 640, 384, 100, 100, 0, 0);
  $gameScreen.movePicture(ONE_OFF_BUY_PICTURE_ID - 2, 1, 640, 384, 100, 100, 200, 0, 40);

  let passiveStateId = 0;
  if (purchaseItem.meta['Passive State']) {
    passiveStateId = Number(purchaseItem.meta['Passive State']);
    element_particleSet(1, ONE_OFF_BUY_PICTURE_ID, passiveStateId, 0);
  }

  // NOTE: 変数22 は購入価格の一時保管として使われている(既存変数の流用)。
  $gameVariables.setValue(22, purchaseItem.price);

  const ownedLabel = $gameParty.hasItem(purchaseItem, true)
    ? colorTaggedText(3, `所持済み`)//翻訳対象
    : `　`;
  const itemLabel = `\\$` + `\x1bI[${purchaseItem.iconIndex}]` + colorTaggedText(16, purchaseItem.name);
  const priceLabel = `価格:`;//翻訳対象
  $gameVariables.setValue(21,
    `${itemLabel} ${priceLabel}${colorTaggedText(2, `${purchaseItem.price}\\G`)} ${ownedLabel}\n${purchaseItem.description}`);
  return passiveStateId;
}

// <ItemPicture:x,y> の立ち絵を出す。戻り値は Y オフセット。
function showOneOffBuyItemPicture(purchaseItem, passiveStateId) {
  const itemPictureValue = purchaseItem.meta['ItemPicture'];
  if (!itemPictureValue) return undefined;

  const itemPictureValues = itemPictureValue.split(',');
  const pictureYOffset = Number(itemPictureValues[1]);
  const pictureY = 384 + pictureYOffset;

  if (purchaseItem.iconIndex == ONE_OFF_BUY_SUMMON_ICON_INDEX) {
    const summonPath = `/img/sv_enemies/Summon_${itemPictureValues[0]}`;
    $gameScreen.showPicture(ONE_OFF_BUY_PICTURE_ID, summonPath, 1, 640, pictureY, 100, 100, 255, 0);
    picture_fade1(ONE_OFF_BUY_PICTURE_ID, "fadeIn", '162', 60, 5);
    valueTachieBless = [100, 100, 250, 0.004, 0.003];//立ち絵用息遣い設定。基本状態
    tachie_bless(ONE_OFF_BUY_PICTURE_ID, 0);
    element_particleSet(2, ONE_OFF_BUY_PICTURE_ID, passiveStateId, pictureYOffset);
    return pictureYOffset;
  }

  $gameScreen.showPicture(ONE_OFF_BUY_PICTURE_ID, itemPictureValues[0], 1, 640, pictureY, 100, 100, 255, 0);
  picture_fade1(ONE_OFF_BUY_PICTURE_ID, "157", '162', 60, 5);
  return pictureYOffset;
}

// 武器/防具で特性43(アニメーション)を持つ場合の演出。
function playOneOffBuyWeaponAnimation(purchaseItem, databaseTypeId, pictureYOffset) {
  if (databaseTypeId != ITEM_SHOP_DB_WEAPON && databaseTypeId != ITEM_SHOP_DB_ARMOR) return;
  if (!purchaseItem.traits[0] || purchaseItem.traits[0].code != 43) return;

  const animationId = $dataSkills[purchaseItem.traits[0].dataId].animationId;
  $gameScreen.startAnimation(640, 368 + pictureYOffset, animationId, false);
}

// ---------------------------------------------------------------------------
// 経験値
// ---------------------------------------------------------------------------
// databaseTypeId 1 はスキル扱い(元コードのまま)。
gain_itemGainExp1 = function(unusedArg1,actor,itemId,databaseTypeId){

  const gainExpSource = (databaseTypeId == ITEM_SHOP_DB_ITEM) ? $dataItems[itemId] : $dataSkills[itemId];
  if (!gainExpSource) return;

  const gainExpAmount = gainExpSource.meta['gainExp'] ? Number(gainExpSource.meta['gainExp']) : 100;
  actor.changeExp(actor.currentExp() + gainExpAmount, false);
  if (actor.subclass()) actor.gainExpSubclass(gainExpAmount);
  // NOTE: 元コードは表示用の文字列(gainExpMessage)を作るだけで使っていなかったため削除。
};

// ---------------------------------------------------------------------------
// 盗み
// ---------------------------------------------------------------------------
const STEAL_BASE_SKILL_ID = 1;//盗みの極意
const STEAL_WITNESS_RATE_STEP = 10;
const STEAL_DEFAULT_BOUNTY_CASH_RATE = 1000;

// 盗み処理。steal_direction1(0,51,1);
steal_direction1 = function(databaseTypeId,dbEntryId,stealCount){

  const actor = $gameActors.actor($gameVariables.value(2));
  if (!actor) return;

  const stealSuccessFlag = scanForStealWitness(actor);

  const entries = itemShopDatabase(databaseTypeId);
  if (!entries) return;
  valueItems = entries;

  const stolenItem = entries[dbEntryId];
  const stealMessage = `\x1bI[${stolenItem.iconIndex}]${stolenItem.name}を${colorTaggedText(2, `${stealCount}個`)}盗んだ！`;//翻訳対象
  CommonPopupManager.showInfo({}, stealMessage, null);
  $gameParty.gainItem(stolenItem, stealCount);

  if (stealSuccessFlag < 1) return;
  reportStealBounty(stolenItem);
};

// 周囲のNPCが盗みを目撃するか調べる。目撃した人数分の吹き出しを出す。
function scanForStealWitness(actor) {
  const player = $gamePlayer;
  // スキル1(盗みの極意)を覚えていれば探索範囲が狭くなる。
  const searchRadius = actor.isLearnedSkill(STEAL_BASE_SKILL_ID) ? 3 : 5;
  let stealSuccessFlag = 0;

  for (let scanY = player.y - searchRadius; scanY <= player.y + searchRadius; scanY++) {
    for (let scanX = player.x - searchRadius; scanX <= player.x + searchRadius; scanX++) {
      const foundEventId = $gameMap.eventIdXy(scanX, scanY);
      if (foundEventId < 1) continue;

      const foundEvent = $gameMap.event(foundEventId);
      if (!isWitnessCandidate(foundEvent, scanX, scanY)) continue;
      if (!isFacingAwayFromPlayer(foundEvent, scanX, scanY)) continue;

      if (rollStealWitness(actor)) {
        foundEvent.requestBalloon(1);
        stealSuccessFlag = 1;
        break;
      }
      foundEvent.requestBalloon(2);//?ふきだし
    }
  }
  return stealSuccessFlag;
}

// 目撃候補は「不透明なNPC」。
function isWitnessCandidate(targetEvent, scanX, scanY) {
  const eventMeta = targetEvent.event().meta || {};
  if (!eventMeta['NPC']) return false;
  return targetEvent.opacity() >= 100;
}

// プレイヤーに背を向けているか(その場から見て逆方向を向いている)。
function isFacingAwayFromPlayer(targetEvent, scanX, scanY) {
  const player = $gamePlayer;
  const eventDirection = targetEvent.direction();
  return (scanY <= player.y - 1 && eventDirection == 2)
    || (scanY >= player.y + 1 && eventDirection == 8)
    || (scanX <= player.x - 1 && eventDirection == 6)
    || (scanX >= player.x + 1 && eventDirection == 4);
}

// 目撃判定。スキル1の熟練度×10% の確率で目撃される。
function rollStealWitness(actor) {
  const witnessRandom = getRandomIndex(101);
  // スキル未習得時はしきい値0のまま比較する(出目0のときだけ目撃される)。
  const witnessThreshold = actor.isLearnedSkill(STEAL_BASE_SKILL_ID)
    ? actor.skillMasteryLevel(STEAL_BASE_SKILL_ID) * STEAL_WITNESS_RATE_STEP
    : 0;
  if (witnessThreshold < 1) return witnessThreshold >= witnessRandom;

  CommonPopupManager.showInfo({}, `目撃確率:${witnessThreshold} >=- ${witnessRandom}`, null);
  return witnessThreshold >= witnessRandom;
}

// 盗みを目撃された時の賞金加算と表示。
function reportStealBounty(stolenItem) {
  const bountyPrice = stolenItem.meta['Buy Price'] ? Number(stolenItem.meta['Buy Price']) : stolenItem.price;
  const bountyWeapon = $dataWeapons[$gameVariables.value(230)];
  const bountyCashRate = (bountyWeapon && bountyWeapon.meta['bountyCashRate'])
    ? Number(bountyWeapon.meta['bountyCashRate'])
    : STEAL_DEFAULT_BOUNTY_CASH_RATE;

  const bountyIndex = $gameVariables.value(230);
  $gameVariables.value(501)[bountyIndex] += bountyPrice + bountyCashRate;
  const bountyTotal = $gameVariables.value(501)[bountyIndex];

  $gameVariables.setValue(231, $gameVariables.value(231) + 1);
  const bountyLabel = `盗みを目撃された！　<賞金額:`;//翻訳対象
  const karmaLabel = ` カルマ値:`;//翻訳対象
  const karmaAmount = `+1(\\V[231])`;
  const stealMessage = `${bountyLabel}${colorTaggedText(10, `+${bountyPrice + bountyCashRate}(${bountyTotal})\\G`)}`
    + `${karmaLabel}${colorTaggedText(10, karmaAmount)}>`;
  CommonPopupManager.showInfo({}, stealMessage, null);
}

//}());
