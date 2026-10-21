/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){

//---------------------------------------------------------------------------
// 共通定数
//---------------------------------------------------------------------------
const SCENE_CONDITION_PREFIX = `発生条件:`;
const SCENE_STATUS_ON = `\\C[14]〇\\C[0]`;
const SCENE_STATUS_OFF = `\\C[12]×\\C[0]`;
const SCENE_LINE_BREAK_COUNT = 4;          //この数に達したら改行
const SCENE_CONDITION_SLOT_COUNT = 9;      //EventSet*1..9 の上限
const SCENE_UNKNOWN_NAME = `？？？`;
const SCENE_PENDING_MARK = `\u3000`;        //発生保留シーンの表示(全角スペース)
const SCENE_UNKNOWN_DESCRIPTION = `？？？？？？？？？？？？\n`;
const SCENE_WORD_SET_CHUNK_LIMIT = 10;     // valueWordSetN 1個あたりの表示数

//条件メタで使う番号
const SCENE_VAR_CURRENT_ACTOR = 2;         //基準となるアクター
const SCENE_VAR_ANY_ACTOR = 11;            //誰でもいいアクターの変数
const SCENE_ITEM_ANY_ACTOR_ID = 11;        //EventSetItem の既定アイテムID
const SCENE_VAR_MAIN_QUEST = 135;          //メインクエスト進行
const SCENE_VAR_ANY_PARTY_ACTOR = 0;       //EventSetActor の 0 は上記の誰でも可
const SCENE_PARTY_ACTOR_VAR_FIRST = 621;   //621〜624: パーティ1〜4人目のアクターID
const SCENE_PARTY_ACTOR_COUNT_VAR = 54;    //パーティ人数(1で[単独行動])
const SCENE_SUBJUGATION_COUNT_VAR = 52;    //討伐数配列
const SCENE_ACTOR_ARRAY_OFFSET = 380;      //アクター毎の状態配列
const SCENE_ACTOR_CLOTH_OFFSET = 440;      //アクター毎の現在衣装配列
const SCENE_CONDITION_LABEL_VAR_OFFSET = 400; //条件表示名の変数
const SCENE_CLOTH_SLOT_LABEL_VAR_OFFSET = 460; //衣装部位名のスイッチ
const SCENE_EXPOSURE_PARAM = 4;            //露出度パラメータ(比較が以下になる)
const SCENE_CLOTH_TOTAL_PARAM = 41;        //統合衣装指定パラメータ
const SCENE_MAX_INACTIVE_ACTOR = 20;       //存在しないアクター

//スイッチ
const SCENE_SWITCH_ALL_DEFEATED = 83;      //全滅スイッチ
const SCENE_SWITCH_HINT_MAP_FREE = 433;    //ヒント提示で場所区分けを無くす
const SCENE_SWITCH_HIDE_UNKNOWN = 435;     //特定名を伏せる
const SCENE_SWITCH_MAP_START = 477;        //マップ最初の並列イベント
const SCENE_SWITCH_MORNING_START = 472;    //朝の並列イベント
const SCENE_SWITCH_PARALLEL_FIRED = 474;   //並列イベント起動済み
const SCENE_SWITCH_SOUWA_NAVI = 367;       //挿話ナヴィ発生
const SCENE_SWITCH_HSCENE_NAVI = 369;      //シーンナヴィ発生
const SCENE_SWITCH_SOUWA_GROUP = 479;      //挿話グループ発生
const SCENE_SWITCH_HSCENE_GROUP = 480;     //シーングループ発生
const SCENE_SWITCH_MEMORY = 29;            //回想中

//アイテムカテゴリ(EICSwitch値)
const SCENE_EIC_SOUWA = 102;
const SCENE_EIC_SCENE = 103;
const SCENE_EIC_TITLE = 104;
const SCENE_EIC_HTITLE = 105;
const SCENE_SG_QUEST = 1;                  //<SG種別>がクエスト

const SCENE_SKILL_ID_DEFAULT = 18;         //既定スキル(習得済み判定)
const SCENE_SKILL_ID_HIDDEN_NAME = 407;    //このスキル未習得＝未加入キャラ
const SCENE_JOB_LEARNED_SKILL = 18;

//---------------------------------------------------------------------------
// 表示用の作業変数(旧: 代入だけで宣言されていなかった暗黙のグローバル)
// 他のプラグインからも状態を参照できるよう、従来どおりグローバルに置く
//---------------------------------------------------------------------------
var valueCountSet1 = 0;            //書き込み済みシーン数(変数195にも入れる)
var valueCountSet2 = 1;            //現在書き込み中の valueWordSetN の番号
var initialWordSetText = ` `;      //各 valueWordSetN の初期値
var mapSceneOccurrenceCount = 0;   //そのマップで発生するシーン数
var valueCountDefeadSwitche2 = 0;  //全滅スイッチ時に成立したシーンのアイテムID
var valueParallelEventId = 0;      //並列イベントの発生元イベントID
var j = 0;                         //シーンを番号順に扱うための記録用カウンタ

//---------------------------------------------------------------------------
// 小さな共通ヘルパ
//---------------------------------------------------------------------------
//内部用。$gameActors.actor(id) は未加入/未設定で undefined を返す
function nakamiActor(id) {
  return $gameActors.actor(Number(id));
}

//内部用。変数が未設定/配列でない場合に index アクセスで落ちないためのヘルパ
function nakamiArrayValue(varId, index) {
  const arr = $gameVariables.value(varId);
  if (!Array.isArray(arr)) return undefined;
  return arr[index];
}

//現在のアクターID(条件の基準)
function sceneCurrentActorId() {
  return $gameVariables.value(SCENE_VAR_CURRENT_ACTOR);
}

//アクターが加入済み(条件を満たせる)か
function isSceneActorAvailable(actor) {
  return actor.isLearnedSkill(SCENE_SKILL_ID_DEFAULT) && !actor.isStateAffected(valueDollStateId);
}

//未加入キャラ(名前を伏せるべきアクター)か
function isSceneActorNotJoined(actor) {
  return !actor.isLearnedSkill(SCENE_SKILL_ID_HIDDEN_NAME);
}

//EventSet*1..9 の連番メタを順に処理する
function forEachSceneConditionSlot(dataItem, metaPrefix, callback) {
  for (let slot = 1; slot <= SCENE_CONDITION_SLOT_COUNT; slot++) {
    const metaValue = dataItem.meta[metaPrefix + slot];
    if (!metaValue) continue;
    callback(metaValue.split(','), slot);
  }
}

//条件1件分の成否をカウントし、状態マーカーを追記する
function appendConditionStatus(state, isMet) {
  state.unmetConditionCount += 1;
  if (isMet) {
    state.metConditionCount += 1;
    state.messageText += SCENE_STATUS_ON;
  } else {
    state.messageText += SCENE_STATUS_OFF;
  }
}

//発生条件の本文を追記する(行数も加算)
function appendSceneText(state, text, lineCountToAdd) {
  state.messageText += text;
  state.lineCount += (lineCountToAdd === undefined ? 1 : lineCountToAdd);
}

//指定行数に達していたら改行してカウンタを戻す
function breakSceneLineIfNeeded(state) {
  if (state.lineCount < SCENE_LINE_BREAK_COUNT) return;
  state.messageText += `\n`;
  state.lineCount = 0;
}

//条件テキストに色付きアクター名を入れる
function tagSceneActorName(actor) {
  return colorTaggedText(27, actor.name());
}

//---------------------------------------------------------------------------
// 発生条件の状態(旧: scene_joukenNakami のローカル変数群)
//---------------------------------------------------------------------------
function createSceneConditionState(dataItem, itemIndex, sceneGroupId, occurrenceSwitchOffset, checkSwitchOffset, occurrenceCountVarId, unmetCountVarId) {
  return {
    dataItem,
    itemIndex,
    sceneGroupId,
    occurrenceSwitchOffset,
    checkSwitchOffset,
    occurrenceCountVarId,
    unmetCountVarId,
    messageText: ``,
    lineCount: 0,
    unmetConditionCount: 0,   //発生条件。未成立でも加算
    metConditionCount: 0,     //発生条件。成立で加算
    marGenScene1: 0,          //1でマップ発生シーン
    eventSceneMissing: 1,     //0でEventSetSceneが存在しない/メイン進行不足/アクター不在
    eventSceneNotExists: 0,   //EventSetSceneが存在しない場合に1
    insufficientMainQuest: 0, //メインクエスト進行が足りない場合に1
    cannotExecute: 0,         //実行不可の場合に1
    inBattle: 0,              //戦闘中か否か
    showMapName: 0,           //？？？表記の時にマップ名表示
    actorNotJoined: 0,        //アクターが加入していない
    defeatedSwitchItemId: 0   //全滅スイッチ判定に使ったアイテムID
  };
}

//中身スクリプト
scene_joukenNakami = function (sceneGroupId, itemIndex, occurrenceSwitchOffset, checkSwitchOffset, occurrenceCountVarId, unmetCountVarId) {

  const dataItem = $dataItems[itemIndex];
  if (!dataItem || !dataItem.name) return;

  const state = createSceneConditionState(dataItem, itemIndex, sceneGroupId,
    occurrenceSwitchOffset, checkSwitchOffset, occurrenceCountVarId, unmetCountVarId);

  //☆☆発生条件の組み立て(この順序でテキストが積まれる)
  appendBattleCondition(state);
  appendMapCondition(state);
  appendAutoStartConditions(state);
  appendOccurrenceMainCondition(state);
  appendNoteWordCondition(state);

  if (!appendPerspectiveCondition(state)) return;   //視点アクターが存在しない場合は中断
  appendSwitchConditions(state);
  appendActorCondition(state);
  appendSceneItemCondition(state);
  appendSkillRankConditions(state);
  appendSkillConditions(state);
  appendSkillEquipConditions(state);
  appendStateConditions(state);
  appendJobConditions(state);
  appendSubjugationConditions(state);
  appendRegistrationCondition(state);
  appendMoneyCondition(state);
  appendHexpConditions(state);
  appendClothConditions(state);
  appendMainRootCondition(state);
  appendValConditions(state);
  appendItemCountConditions(state);

  //☆☆発生不可条件
  appendEraseActorCondition(state);
  appendEraseSwitchCondition(state);
  appendEraseMainCondition(state);
  appendEraseValCondition(state);

  //☆☆判定と表示用テキストの確定
  finalizeSceneEntry(state);
};

//[戦闘] 戦闘中に発生するシーンか
function appendBattleCondition(state) {
  const battleMeta = state.dataItem.meta['EventSetBattle'];
  if (!battleMeta) return;

  state.inBattle = Number(battleMeta);
  if (state.inBattle != 1) return;

  //NOTE: 戦闘条件はラベルだけで状態マーカーを出さない
  appendSceneText(state, `[戦闘]`, 0);
  state.marGenScene1 += 1;
  state.unmetConditionCount += 1;
  state.metConditionCount += 1;
}

//[場所] 発生マップ
function appendMapCondition(state) {
  const mapMeta = state.dataItem.meta['EventSetMap'];
  if (!mapMeta) return;

  const mapSwitchId = Number(mapMeta);

  if (mapSwitchId == 0) {
    //EventSetMapが0の場合は代替スイッチ(2)を判定する
    state.showMapName = `[何処でも]`;
    state.messageText += state.showMapName;
  } else {
    const mapName = $dataSystem.switches[mapSwitchId];
    state.showMapName = `[${mapName}]`;
    state.messageText += state.showMapName;
  }

  state.lineCount += 1;

  //NOTE: 場所条件はカウントのみで状態マーカーを出さない。
  //      0(何処でも)の場合も従来通りスイッチ0を判定する(常にfalse)
  state.unmetConditionCount += 1;
  if ($gameSwitches.value(mapSwitchId)) {
    state.marGenScene1 += 1;
    state.metConditionCount += 1;
  }

  //ヒント提示のため場所での区切りを無くしている
  if ($gameSwitches.value(SCENE_SWITCH_HINT_MAP_FREE)) {
    state.marGenScene1 += 1;
  }

  breakSceneLineIfNeeded(state);
}

//[自動発生]/[朝自動発生]/[宿泊時に自動発生]
function appendAutoStartConditions(state) {
  const autoStartMeta = state.dataItem.meta['AutoStart'];
  if (!autoStartMeta) return;

  const autoStartLabelText = SCENE_AUTO_START_LABELS[Number(autoStartMeta)];
  if (!autoStartLabelText) return;

  appendSceneText(state, autoStartLabelText, 1);
}

const SCENE_AUTO_START_LABELS = {
  1: `[自動発生]`,
  2: `[朝自動発生]`,
  3: `[宿泊時に自動発生]`
};

//[メイン[2]進行中に発生]
function appendOccurrenceMainCondition(state) {
  const occurrenceMainMeta = state.dataItem.meta['EventSetOccurrenceMain'];
  if (!occurrenceMainMeta) return;
  if (Number(occurrenceMainMeta) < 1) return;

  appendSceneText(state, `[メイン[${occurrenceMainMeta}]進行中に発生]`, 1);
}

//[メモ] 注記(この直後が最初の改行判定)
function appendNoteWordCondition(state) {
  const noteWordMeta = state.dataItem.meta['NoteWord'];
  if (noteWordMeta) {
    appendSceneText(state, `[${noteWordMeta}]`, 1);
  }

  breakSceneLineIfNeeded(state);
}

//[◯◯視点] 視点スイッチ(441以降)の条件。falseを返すと全体を中断
function appendPerspectiveCondition(state) {
  const perspectiveMeta = state.dataItem.meta['EventSetPerspective'];
  if (!perspectiveMeta) {
    breakSceneLineIfNeeded(state);
    return true;
  }

  const perspectiveActorId = Number(perspectiveMeta);
  const isCurrentActor = perspectiveActorId == sceneCurrentActorId();

  if (perspectiveActorId >= 1 && !isCurrentActor) {
    const perspectiveActor = nakamiActor(perspectiveActorId);
    if (!perspectiveActor) return false;

    appendSceneText(state, `[${perspectiveActor.name()}視点`, 1);
  }

  const isPerspectiveMet = $gameSwitches.value(perspectiveActorId + SCENE_PERSPECTIVE_SWITCH_OFFSET);
  if (isPerspectiveMet) {
    state.unmetConditionCount += 1;
    state.metConditionCount += 1;
    if (!isCurrentActor) state.messageText += SCENE_STATUS_ON;
  } else {
    state.unmetConditionCount += 1;
    if (!isCurrentActor) state.messageText += SCENE_STATUS_OFF;

    const perspectiveActor = nakamiActor(perspectiveActorId);
    if (perspectiveActor && isSceneActorNotJoined(perspectiveActor)) {
      state.eventSceneMissing = 0;
      state.actorNotJoined = 1;
    }
  }

  breakSceneLineIfNeeded(state);
  return true;
}

const SCENE_PERSPECTIVE_SWITCH_OFFSET = 440;

//EventSetSwi / EventNotSetSwi (スイッチ条件)。旧: 2つのほぼ同一コードブロック
function appendSwitchConditions(state) {
  appendSwitchConditionGroup(state, {
    metaName: 'EventSetSwi',
    defaultSwitchId: 2,
    labelPrefix: ``,
    isSetRequired: true
  });
  appendSwitchConditionGroup(state, {
    metaName: 'EventNotSetSwi',
    defaultSwitchId: 1,
    labelPrefix: `不可:`,
    isSetRequired: false
  });
}

function appendSwitchConditionGroup(state, options) {
  const switchMeta = state.dataItem.meta[options.metaName];
  if (switchMeta) {
    const switchIdValues = switchMeta.split(',');

    for (let index = 0; index < switchIdValues.length; index++) {
      const rawSwitchId = switchIdValues[index];
      let switchId;

      if (rawSwitchId == 0) {
        switchId = options.defaultSwitchId;
      } else {
        const switchName = scene_joukenNakami_clean_prefixes($dataSystem.switches[Number(rawSwitchId)]);
        appendSceneText(state, `[${options.labelPrefix}${switchName}`, 1);
        switchId = Number(rawSwitchId);
      }

      const isSwitchOn = $gameSwitches.value(switchId);
      const isMet = options.isSetRequired ? isSwitchOn : !isSwitchOn;

      if (isMet && options.isSetRequired && switchId == SCENE_SWITCH_ALL_DEFEATED) {
        //全滅スイッチ
        state.defeatedSwitchItemId = state.itemIndex;
      }

      appendConditionStatus(state, isMet);
    }
  }

  breakSceneLineIfNeeded(state);
}

//[アクター名] アクターが加入しているか
function appendActorCondition(state) {
  const actorMeta = state.dataItem.meta['EventSetActor'];
  if (!actorMeta) {
    breakSceneLineIfNeeded(state);
    return;
  }

  const actorIdValues = actorMeta.split(',');

  for (let index = 0; index <= actorIdValues.length - 1; index++) {
    const rawActorId = actorIdValues[index];
    const isAnyActor = Number(rawActorId) == 0;

    if (isAnyActor) {
      //誰でもいいアクター(変数11のアクター)
      actorIdValues[index] = $gameVariables.value(SCENE_VAR_ANY_ACTOR);
    } else {
      const listedActor = nakamiActor(rawActorId);
      if (listedActor) appendSceneText(state, `[${listedActor.name()}]`, 1);
    }

    const actor = nakamiActor(actorIdValues[index]);
    if (!actor) continue;

    const isAvailable = isSceneActorAvailable(actor);
    appendConditionStatus(state, isAvailable);

    if (!isAvailable && isSceneActorNotJoined(actor)) {
      state.eventSceneMissing = 0;
      state.actorNotJoined = 1;
    }
  }

  breakSceneLineIfNeeded(state);
}

//[挿話集:アイテム] 前提シーン(アイテム)の条件
function appendSceneItemCondition(state) {
  const itemSetMeta = state.dataItem.meta['ItemSetScene'];
  if (!itemSetMeta) {
    breakSceneLineIfNeeded(state);
    return;
  }

  const sceneItemIdValues = itemSetMeta.split(',');

  for (let index = 0; index <= sceneItemIdValues.length - 1; index++) {
    if (!sceneItemIdValues[index]) continue;

    const sceneItemId = Number(sceneItemIdValues[index]);
    const sceneItem = $dataItems[sceneItemId];
    if (!sceneItem) continue;

    appendSceneText(state, `${readSceneItemCategoryLabel(sceneItem)}\x1bIIN[${sceneItemId}]`, 1);

    const isMet = isSceneItemConditionMet(sceneItem, sceneItemId);
    appendConditionStatus(state, isMet);

    if (!isMet) {
      state.eventSceneMissing = 0;
      state.eventSceneNotExists = 1;
    }
  }

  breakSceneLineIfNeeded(state);
}

//アイテムのカテゴリ見出し
function readSceneItemCategoryLabel(sceneItem) {
  const eicSwitchMeta = sceneItem.meta['EICSwitch'];
  if (eicSwitchMeta) {
    return SCENE_ITEM_CATEGORY_LABELS[Number(eicSwitchMeta)] || ``;
  }
  if (sceneItem.meta['SG種別']) {
    //<SG種別>がクエスト以外なら見出しなし
    return Number(sceneItem.meta['SG種別']) == SCENE_SG_QUEST ? `[クエスト達成:` : ``;
  }
  return `[`;
}

const SCENE_ITEM_CATEGORY_LABELS = {
  [SCENE_EIC_SOUWA]: `[挿話集:`,
  [SCENE_EIC_SCENE]: `[シーン:`,
  [SCENE_EIC_TITLE]: `[タイトル:`,
  [SCENE_EIC_HTITLE]: `[H'タイトル:`
};

//前提シーンの成立判定(シーン/挿話は所持ではなく専用スイッチで判定)
function isSceneItemConditionMet(sceneItem, sceneItemId) {
  const eicSwitchMeta = sceneItem.meta['EICSwitch'];
  if (eicSwitchMeta) {
    const eicSwitchId = Number(eicSwitchMeta);
    if (eicSwitchId == SCENE_EIC_SCENE) return $gameSwitches.value(sceneItemId + 600);
    if (eicSwitchId == SCENE_EIC_SOUWA) return $gameSwitches.value(sceneItemId + 900);
  }
  return $gameParty.hasItem(sceneItem);
}

//[スキル名:Rank5↑] スキルランク条件
function appendSkillRankConditions(state) {
  forEachSceneConditionSlot(state.dataItem, 'EventSetSkillRank', function(rankValues) {
    if (!rankValues[1]) rankValues[1] = SCENE_SKILL_ID_DEFAULT;
    if (!rankValues[0]) rankValues[0] = sceneCurrentActorId();

    const actor = nakamiActor(rankValues[0]);
    if (!actor) return;

    const skillId = Number(rankValues[1]);
    const rankNum = Number(rankValues[2]);

    if (!appendHiddenSkillLabel(state, actor, skillId, `特定スキルランク${rankNum}↑]`)) {
      const skill = $dataSkills[skillId];
      if (!skill) return;
      appendSkillLabel(state, actor, rankValues[0], skill, `:Rank${rankNum}↑`);
    }

    appendConditionStatus(state, actor.isLearnedSkill(skillId) && actor.skillMasteryLevel(skillId) >= rankNum);
  });

  breakSceneLineIfNeeded(state);
}

//[スキル名習得] スキル習得条件
function appendSkillConditions(state) {
  forEachSceneConditionSlot(state.dataItem, 'EventSetSkill', function(skillValues) {
    if (!skillValues[1]) skillValues[1] = SCENE_SKILL_ID_DEFAULT;
    if (!skillValues[0]) skillValues[0] = sceneCurrentActorId();

    const actor = nakamiActor(skillValues[0]);
    if (!actor) return;

    const skillId = Number(skillValues[1]);

    if (!appendHiddenSkillLabel(state, actor, skillId, `特定スキル習得`)) {
      const skill = $dataSkills[skillId];
      if (!skill) return;
      appendSkillLabel(state, actor, skillValues[0], skill, `習得`);
    }

    appendConditionStatus(state, actor.isLearnedSkill(skillId));
  });

  breakSceneLineIfNeeded(state);
}

//[スキル名装着] スキル装着条件
function appendSkillEquipConditions(state) {
  forEachSceneConditionSlot(state.dataItem, 'EventSetSkillEquip', function(equipValues) {
    const actorId = Number(equipValues[0]) == 0 ? sceneCurrentActorId() : Number(equipValues[0]);
    const skillId = Number(equipValues[1]);

    const actor = nakamiActor(actorId);
    if (!actor) return;

    if (!appendHiddenSkillLabel(state, actor, skillId, `特定スキル装着`)) {
      const skill = $dataSkills[skillId];
      if (!skill) return;
      appendSkillLabel(state, actor, actorId, skill, `装着`);
    }

    appendConditionStatus(state, actor.battleSkillsRaw().includes(skillId));
  });

  breakSceneLineIfNeeded(state);
}

//名前置換スイッチがONでスキル未習得なら伏せた表記を追記する(trueを返す)
function appendHiddenSkillLabel(state, actor, skillId, hiddenHeaderText) {
  if ($gameSwitches.value(SCENE_SWITCH_HIDE_UNKNOWN)) return false;
  if (actor.isLearnedSkill(skillId)) return false;

  appendSceneText(state, `[${actor.name()}が${hiddenHeaderText}`, 1);
  return true;
}

//スキル条件の見出し(基準アクター以外は名前を前置)
function appendSkillLabel(state, actor, rawActorId, skill, headerText) {
  const actorPrefix = rawActorId == sceneCurrentActorId() ? `` : `${actor.name()}が`;
  appendSceneText(state, `[${actorPrefix}${skill.name}${headerText}`, 1);
}

//State:[◯◯] ステート付与条件
function appendStateConditions(state) {
  forEachSceneConditionSlot(state.dataItem, 'EventSetState', function(stateValues) {
    const actorId = Number(stateValues[0]) == 0 ? sceneCurrentActorId() : Number(stateValues[0]);
    const stateId = Number(stateValues[1]);

    const actor = nakamiActor(actorId);
    if (!actor) return;

    const stateLabel = `State:[\x1bSIM[${stateId}]`;
    if (Number(stateValues[0]) == sceneCurrentActorId()) {
      appendSceneText(state, stateLabel, 1);
    } else {
      appendSceneText(state, `[${actor.name()}がステート:\x1bSIM[${stateId}]`, 1);
    }

    appendConditionStatus(state, actor.isStateAffected(stateId));
  });

  breakSceneLineIfNeeded(state);
}

//[ジョブ名] サブクラス条件
function appendJobConditions(state) {
  forEachSceneConditionSlot(state.dataItem, 'EventSetJob', function(jobValues) {
    const actorId = Number(jobValues[0]) == 0 ? sceneCurrentActorId() : Number(jobValues[0]);
    const jobId = Number(jobValues[1]);

    const actor = nakamiActor(actorId);
    if (!actor) return;

    const unlockedClasses = actor._unlockedClasses || [];
    if (!$gameSwitches.value(SCENE_SWITCH_HIDE_UNKNOWN) && !unlockedClasses.contains(jobId)) {
      appendSceneText(state, `[${actor.name()}が特定ジョブ`, 1);
    } else {
      appendSceneText(state, `[${actor.name()}がジョブ:\x1bJ[${jobId}]`, 1);
    }

    if (!actor.subclass()) return;
    if (actor._subclassId == jobId) {
      appendConditionStatus(state, true);
    } else {
      appendConditionStatus(state, false);
    }
  });

  breakSceneLineIfNeeded(state);
}

//[討伐数] 討伐数条件
function appendSubjugationConditions(state) {
  forEachSceneConditionSlot(state.dataItem, 'EventSetSubjugation', function(subjugationValues) {
    const monsterId = Number(subjugationValues[0]);
    const requiredCount = Number(subjugationValues[1]);
    const currentCount = nakamiArrayValue(SCENE_SUBJUGATION_COUNT_VAR, monsterId);

    const monsterName = colorTaggedText(2, `\x1bSIM[${monsterId}]`);
    const requiredText = colorTaggedText(10, currentCount);
    appendSceneText(state, `[${monsterName}:${requiredText}/${requiredCount}`, 1);

    appendConditionStatus(state, currentCount >= requiredCount);
  });

  breakSceneLineIfNeeded(state);
}

//[条件付き選択肢を選ぶ事で回想登録]
function appendRegistrationCondition(state) {
  if (!state.dataItem.meta['RegistrationC1']) return;

  appendSceneText(state, `[条件付き選択肢を選ぶ事で回想登録]`, 1);
}

//[1000\G] 所持金条件
function appendMoneyCondition(state) {
  const moneyMeta = state.dataItem.meta['EventSetMoney'];
  if (!moneyMeta) return;

  const requiredGold = Number(moneyMeta);
  if (requiredGold == 0) return;

  appendSceneText(state, `[${requiredGold}\\G`, 0);
  appendConditionStatus(state, $gameParty.gold() >= requiredGold);
}

//[露出度20以下]/[感度300以上] H経験値配列条件
function appendHexpConditions(state) {
  forEachSceneConditionSlot(state.dataItem, 'EventSetHexpArr', function(hexpValues) {
    const actorId = Number(hexpValues[0]);
    const paramType = Number(hexpValues[1]);
    const targetValue = Number(hexpValues[2]);

    const actor = nakamiActor(actorId);
    if (!actor) return;

    const paramName = $dataSystem.variables[paramType + SCENE_CONDITION_LABEL_VAR_OFFSET];
    const currentValue = nakamiArrayValue(actorId + SCENE_ACTOR_ARRAY_OFFSET, paramType);
    const actorName = tagSceneActorName(actor);

    if (paramType == SCENE_EXPOSURE_PARAM) {
      //露出度だけは「以下」
      appendSceneText(state, `[${actorName}${paramName}${targetValue}以下`, 1);
      appendConditionStatus(state, currentValue <= targetValue);
      return;
    }

    appendSceneText(state, `[${actorName}${paramName}${targetValue}以上`, 1);
    appendConditionStatus(state, currentValue >= targetValue);
  });

  breakSceneLineIfNeeded(state);
}

//[アクター名が衣装名着用] 衣装条件
function appendClothConditions(state) {
  forEachSceneConditionSlot(state.dataItem, 'EventSetClothArr', function(clothValues) {
    const actorId = Number(clothValues[0]);
    const paramType = Number(clothValues[1]);
    const targetValue = Number(clothValues[2]);

    const actor = nakamiActor(actorId);
    if (!actor) return;

    const clothLabel = readClothConditionLabel(actor, actorId, paramType, targetValue);
    if (clothLabel === null) return;

    appendSceneText(state, clothLabel, 2);

    const currentCloth = nakamiArrayValue(actorId + SCENE_ACTOR_CLOTH_OFFSET, paramType);
    appendConditionStatus(state, currentCloth == targetValue);
  });

  breakSceneLineIfNeeded(state);
}

//衣装条件の表示名。統合衣装(41)は衣装一覧から該当アイテム名を探す
function readClothConditionLabel(actor, actorId, paramType, targetValue) {
  if (paramType == SCENE_CLOTH_TOTAL_PARAM) {
    return `[${actor.name()}が${findTotalClothName(actorId, targetValue)}着用`;
  }
  if (paramType == 0) {
    const clothItem = $dataItems[targetValue];
    if (!clothItem) return null;
    return `[${actor.name()}が${clothItem.name}着用`;
  }
  return `[${actor.name()}の${$dataSystem.switches[paramType + SCENE_CLOTH_SLOT_LABEL_VAR_OFFSET]}に特定衣装`;
}

//統合衣装ID(targetValue)に一致するアクター専用衣装の名前
//$dataItems は読み込み後に変化しないので、初回だけ索引を作って以降は参照する
function findTotalClothName(actorId, totalClothNumber) {
  const clothKey = `${actorId}:${totalClothNumber}`;
  if (!SCENE_TOTAL_CLOTH_NAME_INDEX) buildTotalClothNameIndex();

  const clothName = SCENE_TOTAL_CLOTH_NAME_INDEX.get(clothKey);
  return clothName === undefined ? `` : clothName;
}

let SCENE_TOTAL_CLOTH_NAME_INDEX = null;

//衣装一覧を1回だけ走査して「アクターID:統合衣装ID → アイテム名」を作る
function buildTotalClothNameIndex() {
  SCENE_TOTAL_CLOTH_NAME_INDEX = new Map();

  const itemCount = $dataItems.length - 1;
  for (let itemId = 1; itemId <= itemCount; itemId++) {
    const item = $dataItems[itemId];
    if (!item) continue;

    const totalClothMeta = item.meta['TotalCloth'];
    if (!totalClothMeta) continue;
    if (!item.meta['EICSwitch']) continue;

    const actorId = Number(item.meta['EICSwitch']) - SCENE_ACTOR_ARRAY_OFFSET;
    const clothKey = `${actorId}:${Number(totalClothMeta)}`;
    //同じ組み合わせは最初に見つかったアイテム名を使う(従来の break と同じ)
    if (SCENE_TOTAL_CLOTH_NAME_INDEX.has(clothKey)) continue;

    SCENE_TOTAL_CLOTH_NAME_INDEX.set(clothKey, item.name);
  }
}

//[メイン進行[2]↑] メインクエスト進行条件
function appendMainRootCondition(state) {
  const mainRootMeta = state.dataItem.meta['EventSetMainRoot'];
  if (!mainRootMeta) return;

  const mainRootValues = mainRootMeta.split(',');
  const mainQuestVarId = Number(mainRootValues[0]);
  const requiredProgress = Number(mainRootValues[1]);
  if (mainRootValues[1] == 0) return;

  if (mainRootValues[0] == 0) {
    mainRootValues[0] = SCENE_VAR_MAIN_QUEST;
  } else {
    if (requiredProgress == 49) {
      appendSceneText(state, `[メインクエスト完了後`, 1);
    } else {
      appendSceneText(state, `[メイン進行[${requiredProgress}]↑`, 1);
    }
  }

  const isMet = $gameVariables.value(mainQuestVarId) >= requiredProgress;
  appendConditionStatus(state, isMet);

  if (!isMet) {
    state.eventSceneMissing = 0;
    state.insufficientMainQuest = 1;
  }
}

//[単独行動]/[変数名:3↑] 変数条件
function appendValConditions(state) {
  forEachSceneConditionSlot(state.dataItem, 'EventSetVal', function(valValues) {
    const varId = Number(valValues[0]);
    const requiredValue = Number(valValues[1]);

    if (valValues[0] == 0) {
      valValues[0] = SCENE_VAR_CURRENT_ACTOR;
    } else if (!appendValConditionLabel(state, varId, requiredValue)) {
      //表示できない条件(アクター未解決)はその条件だけを飛ばす
      return;
    }

    appendConditionStatus(state, $gameVariables.value(varId) >= requiredValue);
  });

  breakSceneLineIfNeeded(state);
}

//変数条件の表示名(単独行動 / パーティn番目 / 変数名)
function appendValConditionLabel(state, varId, requiredValue) {
  if (varId == SCENE_PARTY_ACTOR_COUNT_VAR || requiredValue == 1) {
    appendSceneText(state, `[単独行動`, 1);
    return true;
  }

  if (varId >= SCENE_PARTY_ACTOR_VAR_FIRST && varId <= SCENE_PARTY_ACTOR_VAR_FIRST + 3) {
    const partyActor = nakamiActor(requiredValue);
    if (!partyActor) return false;

    appendSceneText(state, `[${varId - SCENE_PARTY_ACTOR_VAR_FIRST + 1}番目:${partyActor.name()}`, 1);
    return true;
  }

  const varName = scene_joukenNakami_clean_prefixes($dataSystem.variables[varId]);
  appendSceneText(state, `[${varName}:${requiredValue}↑`, 1);
  return true;
}

//[アイテム] 所持数条件
function appendItemCountConditions(state) {
  forEachSceneConditionSlot(state.dataItem, 'EventSetItem', function(itemValues) {
    const itemId = Number(itemValues[0]);
    const requiredCount = Number(itemValues[1]);

    if (itemValues[0] == 0) itemValues[0] = SCENE_ITEM_ANY_ACTOR_ID;

    state.lineCount += 1;

    const countItem = $dataItems[itemId];
    if (!countItem) return;

    const requiredText = colorTaggedText(2, requiredCount);
    state.messageText += `\x1bIIN[${itemId}:${requiredText}]`;
    appendConditionStatus(state, $gameParty.numItems(countItem) >= requiredCount);
  });

  breakSceneLineIfNeeded(state);
}

//[＜アクター名＞が仲間の場合に発生不可]
function appendEraseActorCondition(state) {
  const eraseActorMeta = state.dataItem.meta['EventEraseActor'];
  if (!eraseActorMeta) {
    breakSceneLineIfNeeded(state);
    return;
  }

  const eraseActorIdValues = eraseActorMeta.split(',');
  let eraseActorLabel = ` `;

  for (let index = 0; index <= eraseActorIdValues.length - 1; index++) {
    if (Number(eraseActorIdValues[index]) == 0) {
      //存在しないアクター
      eraseActorIdValues[index] = SCENE_MAX_INACTIVE_ACTOR;
    } else {
      const eraseActor = nakamiActor(eraseActorIdValues[index]);
      eraseActorLabel = (eraseActor && !isSceneActorNotJoined(eraseActor)) ? `${eraseActor.name()}` : `？？？`;
    }

    const eraseCheckActor = nakamiActor(eraseActorIdValues[index]);
    if (!eraseCheckActor) continue;
    if (eraseActorIdValues[index] == SCENE_MAX_INACTIVE_ACTOR) continue;

    if (isSceneActorAvailable(eraseCheckActor)) {
      state.cannotExecute = 1;
      appendSceneText(state, `[＜${eraseActorLabel}＞が仲間のため発生不可]`, 1);
    } else {
      appendSceneText(state, `[＜${eraseActorLabel}＞が仲間の場合に発生不可]`, 1);
    }
  }

  breakSceneLineIfNeeded(state);
}

//[スイッチ名につき発生不可]
function appendEraseSwitchCondition(state) {
  const eraseSwitchMeta = state.dataItem.meta['EventEraseSwi'];
  if (!eraseSwitchMeta) {
    breakSceneLineIfNeeded(state);
    return;
  }

  const eraseSwitchId = Number(eraseSwitchMeta);
  if (eraseSwitchId >= 1) {
    const eraseSwitchName = scene_joukenNakami_clean_prefixes($dataSystem.switches[eraseSwitchId]);
    if ($gameSwitches.value(eraseSwitchId)) {
      state.cannotExecute = 1;
      appendSceneText(state, `[${eraseSwitchName}につき発生不可]`, 1);
    } else {
      appendSceneText(state, `[${eraseSwitchName}で発生不可]`, 1);
    }
  }

  breakSceneLineIfNeeded(state);
}

//[メインクエスト進行につき発生不可]
function appendEraseMainCondition(state) {
  const eraseMainMeta = state.dataItem.meta['EventEraseMain'];
  if (!eraseMainMeta) {
    breakSceneLineIfNeeded(state);
    return;
  }

  const eraseMainValues = eraseMainMeta.split(',');
  const mainQuestVarId = Number(eraseMainValues[0]);
  const requiredMainQuestProgress = Number(eraseMainValues[1]);
  if (requiredMainQuestProgress < 1) {
    breakSceneLineIfNeeded(state);
    return;
  }

  if ($gameVariables.value(mainQuestVarId) > requiredMainQuestProgress) {
    state.cannotExecute = 1;
    appendSceneText(state, `[メインクエスト進行につき発生不可]`, 1);
  } else {
    //BUGFIX: 従来は常に0のmainQuestProgressを表示していた
    appendSceneText(state, `[メインクエスト進行＜${requiredMainQuestProgress}＞で発生不可]`, 1);
  }

  breakSceneLineIfNeeded(state);
}

//[変数名一定で発生不可]
function appendEraseValCondition(state) {
  const eraseValMeta = state.dataItem.meta['EventEraseVal'];
  if (!eraseValMeta) return;

  const eraseValValues = eraseValMeta.split(',');
  const targetVarId = Number(eraseValValues[0]);
  const targetVarValue = Number(eraseValValues[1]);
  if (targetVarId < 1) return;

  const targetVarName = scene_joukenNakami_clean_prefixes($dataSystem.variables[targetVarId]);
  if ($gameVariables.value(targetVarId) > targetVarValue) {
    state.cannotExecute = 1;
    appendSceneText(state, `[${targetVarName}一定につき発生不可]`, 1);
  } else {
    appendSceneText(state, `[${targetVarName}一定で発生不可]`, 1);
  }
}

//---------------------------------------------------------------------------
// 判定結果の確定と表示用テキストの生成
//---------------------------------------------------------------------------
function finalizeSceneEntry(state) {
  const dataItem = state.dataItem;

  //発生条件テキストを説明に反映(NoAddDescription指定時は除く)
  const conditionText = SCENE_CONDITION_PREFIX + state.messageText;
  if (!dataItem.meta['NoAddDescription']) {
    dataItem.description = conditionText;
  }

  j += 1;
  state.sceneName = dataItem.name;
  state.sceneDescription = dataItem.description;
  if (state.unmetConditionCount != state.metConditionCount) {
    state.sceneName = SCENE_UNKNOWN_NAME;
  }
  //amygameSettei.js が初期化しているグローバル。互換のため同じ値を残す
  valueSceneName1 = state.sceneName;

  //前提シーン/メインクエスト/未加入キャラのいずれかが不足していれば内容を伏せる
  state.sceneDescription = buildHiddenSceneDescription(state) + buildUnmetRequirementText(state);

  if ($gameSwitches.value(state.checkSwitchOffset + state.itemIndex)) {
    //判定済み。表示のみで発生処理は行わない
    mapSceneOccurrenceCount += 1;
    return;
  }

  if (state.marGenScene1 >= 1 && state.cannotExecute == 0) {
    registerOccurredScene(state, conditionText);
    return;
  }

  registerPendingScene(state);
}

//条件が揃わない場合の説明文(？？？表記)。伏せる必要がなければ通常の説明を返す
function buildHiddenSceneDescription(state) {
  const mustHide = state.eventSceneNotExists >= 1 || state.insufficientMainQuest >= 1 || state.eventSceneMissing == 0;
  if (!mustHide) return state.sceneDescription;

  let hiddenDescription = SCENE_UNKNOWN_DESCRIPTION;
  if (state.showMapName != 0) hiddenDescription += `${state.showMapName}`;
  return hiddenDescription;
}

//不足している前提の説明
function buildUnmetRequirementText(state) {
  let requirementText = ``;
  if (state.eventSceneNotExists >= 1) requirementText += `[要:前提シーン] `;
  if (state.insufficientMainQuest >= 1) requirementText += `[要:メインクエスト一定進行] `;
  if (state.actorNotJoined >= 1) requirementText += `[要:未加入キャラ] `;
  return requirementText;
}

//条件を満たして発生するシーン
function registerOccurredScene(state, conditionText) {
  markSceneGroupOccurrence(state);
  logSceneOccurrenceInBattle(state, conditionText);
  mapSceneOccurrenceCount += 1;

  const sceneTextBlock = `${state.sceneName}\n${state.sceneDescription}\n`;
  if (state.unmetConditionCount == state.metConditionCount) {
    appendSceneWordChunk(sceneTextBlock);
    applyMetSceneSwitches(state);
    return;
  }

  appendSceneWordChunk(`\\C[5]${sceneTextBlock}\\C[0]`);
  $gameSwitches.setValue(state.itemIndex + state.occurrenceSwitchOffset, false);//発生用スイッチ
  incrementSceneCounter(state, state.unmetCountVarId);
}

//条件はあるが今は発生できない/しないシーン
function registerPendingScene(state) {
  appendSceneWordChunk(`\\C[1]${SCENE_PENDING_MARK}\\C[0]`);
  if (!state.dataItem.meta['RepeatScene']) {
    $gameSwitches.setValue(state.itemIndex + state.occurrenceSwitchOffset, false);//発生用スイッチ
  }
}

//成立シーンの発生スイッチ/自動起動スイッチ/カウンタ
function applyMetSceneSwitches(state) {
  $gameSwitches.setValue(state.itemIndex + state.occurrenceSwitchOffset, true);//発生用スイッチ

  if (state.defeatedSwitchItemId >= 1) {
    valueCountDefeadSwitche2 = state.itemIndex;
  }

  applyAutoStartSwitch(state);
  incrementSceneCounter(state, state.occurrenceCountVarId);
}

//グループ発生スイッチ(挿話/シーン)
function markSceneGroupOccurrence(state) {
  if (state.sceneGroupId == 1) $gameSwitches.setValue(SCENE_SWITCH_SOUWA_GROUP, true);
  if (state.sceneGroupId == 2) $gameSwitches.setValue(SCENE_SWITCH_HSCENE_GROUP, true);
}

//戦闘中に発生するシーンは戦闘ログにも出す
function logSceneOccurrenceInBattle(state, conditionText) {
  if (state.inBattle != 1) return;
  if (!$gameParty.inBattle()) return;

  BattleManager._logWindow.push(`addText`, conditionText);
}

//自動起動シーンの起動スイッチ
function applyAutoStartSwitch(state) {
  const autoStartMeta = state.dataItem.meta['AutoStart'];
  if (!autoStartMeta) return;

  const autoStartType = Number(autoStartMeta);
  //マップ最初の並列イベントの時にオンオフ自動
  if (autoStartType == 1 && $gameSwitches.value(SCENE_SWITCH_MAP_START)) {
    $gameSwitches.setValue(SCENE_SWITCH_PARALLEL_FIRED, true);
    valueCountDefeadSwitche2 = state.itemIndex;
  }
  //朝の並列スイッチ
  if (autoStartType == 2 && $gameSwitches.value(SCENE_SWITCH_MORNING_START)) {
    $gameSwitches.setValue(SCENE_SWITCH_PARALLEL_FIRED, true);
    valueCountDefeadSwitche2 = state.itemIndex;
  }
}

//成立/未成立カウンタの加算。戦闘中の戦闘シーン以外は戦闘中でも加算しない
function incrementSceneCounter(state, counterVarId) {
  if ($gameParty.inBattle() && state.inBattle != 1) return;

  $gameVariables.setValue(counterVarId, $gameVariables.value(counterVarId) + 1);
}

//valueWordSetN へ1シーン分のテキストを追記する
function appendSceneWordChunk(textChunk) {
  globalThis[sceneWordSetKey()] += textChunk;

  valueCountSet1 += 1;
  if ((valueCountSet1 % SCENE_WORD_SET_CHUNK_LIMIT) == 0) {
    valueCountSet2 += 1;
    resetWordSet();
  }
}

//現在書き込み先の valueWordSetN のプロパティ名
function sceneWordSetKey() {
  return `valueWordSet` + valueCountSet2;
}

//書き込み先の valueWordSetN を初期テキストで初期化する
function resetWordSet() {
  globalThis[sceneWordSetKey()] = initialWordSetText;
}

//---------------------------------------------------------------------------
// グループ単位の発生条件設定
//---------------------------------------------------------------------------
//シーンのアイテム範囲と、その発生/達成スイッチのオフセット
const SCENE_ITEM_RANGES = {
  1: { firstItemId: 401, lastItemId: 500, occurrenceSwitchOffset: 800, checkSwitchOffset: 900 },
  2: { firstItemId: 501, lastItemId: 600, occurrenceSwitchOffset: 500, checkSwitchOffset: 600 }
};

//回想挿話発生条件式。回想scene_jouken(2);。挿話scene_jouken(1);
const SCENE_GROUP_CONFIGS = {
  1: {
    ...SCENE_ITEM_RANGES[1],
    resetSwitchId: SCENE_SWITCH_SOUWA_NAVI,
    occurrenceGroupSwitchId: SCENE_SWITCH_SOUWA_GROUP,
    occurrenceCountVarId: 517,
    unmetCountVarId: 518,
    addItemIdSource: () => valueSouwasceneAddId
  },
  2: {
    ...SCENE_ITEM_RANGES[2],
    resetSwitchId: SCENE_SWITCH_HSCENE_NAVI,
    occurrenceGroupSwitchId: SCENE_SWITCH_HSCENE_GROUP,
    occurrenceCountVarId: 504,
    unmetCountVarId: 505,
    addItemIdSource: () => valueHsceneAddId
  }
};

//☆☆☆条件追加。<EventSetVal1:0,0>
scene_joukensettei = function (sceneGroupId) {

  $gameVariables.setValue(195, 0);//表示時の個数を入れる事でコモンイベントのウィンド数を抑制

  resetPartyActorVariables();
  applySceneGroupSettings(sceneGroupId);

  const groupConfig = SCENE_GROUP_CONFIGS[sceneGroupId];
  if (!groupConfig) return;

  //追加分のID配列が無い場合はここで打ち切る(従来動作)
  if (!processSceneGroupItems(sceneGroupId, groupConfig)) return;

  $gameVariables.setValue(195, valueCountSet1);//表示時の個数を入れる事でコモンイベントのウィンド数を抑制

  applySceneNaviSwitches();
};

//621-624にパーティ1-4人目のアクターID、54に人数を入れる(表記用)
function resetPartyActorVariables() {
  for (let partySlot = 0; partySlot < 4; partySlot++) {
    $gameVariables.setValue(SCENE_PARTY_ACTOR_VAR_FIRST + partySlot, 0);
  }

  const battlers = $gameParty.battleMembers();
  const battlersCount = battlers.length;
  for (let index = 0; index < battlersCount; index++) {
    $gameVariables.setValue(SCENE_PARTY_ACTOR_VAR_FIRST + index, battlers[index].actorId());
  }
  $gameVariables.setValue(SCENE_PARTY_ACTOR_COUNT_VAR, battlersCount);//1の時は[単独行動]表記
}

//表示用グローバルとカウンタの初期化
function applySceneGroupSettings(sceneGroupId) {
  const groupConfig = SCENE_GROUP_CONFIGS[sceneGroupId];

  valueCountSet1 = 0;
  valueCountSet2 = 1;
  initialWordSetText = ` `;
  resetWordSet();
  mapSceneOccurrenceCount = 0;//そのマップで発生するシーン数
  j = 0;//配列を番号順に居れるため

  if (!groupConfig) {
    console.warn(`id1 is ${sceneGroupId}! must be 1 or 2!`);
    return;
  }

  $gameSwitches.setValue(groupConfig.occurrenceGroupSwitchId, false);
  $gameSwitches.setValue(groupConfig.resetSwitchId, false);
  $gameVariables.setValue(groupConfig.occurrenceCountVarId, 0);
  $gameVariables.setValue(groupConfig.unmetCountVarId, 0);
}

//範囲内のシーンを全て判定する。追加分が無い場合は false
function processSceneGroupItems(sceneGroupId, groupConfig) {
  for (let itemIndex = groupConfig.firstItemId; itemIndex <= groupConfig.lastItemId; itemIndex++) {
    scene_joukenNakami(sceneGroupId, itemIndex, groupConfig.occurrenceSwitchOffset,
      groupConfig.checkSwitchOffset, groupConfig.occurrenceCountVarId, groupConfig.unmetCountVarId);
  }

  return processAddableSceneItems(sceneGroupId, groupConfig);
}

//アイテムID<HsceneItem><SouwaItem>で追加されるシーン
function processAddableSceneItems(sceneGroupId, groupConfig) {
  const insertableItemIds = groupConfig.addItemIdSource();
  if (!Array.isArray(insertableItemIds)) return false;

  for (const itemId of insertableItemIds) {
    const item = $dataItems[itemId];
    if (!item) continue;

    const itemMeta = item.meta;
    //発生スイッチ。リセットなしの1601-1700の間に実行
    const addEventIncidenceSwiNum = Number(itemMeta['AddEventIncidenceSwi']);
    const addEventCompSwiNum = Number(itemMeta['AddEventCompSwi']);//達成スイッチ

    scene_joukenNakami(sceneGroupId, itemId, addEventIncidenceSwiNum, addEventCompSwiNum,
      groupConfig.occurrenceCountVarId, groupConfig.unmetCountVarId);
  }

  return true;
}

//成立数が1以上なら挿話/シーンのナヴィスイッチを立てる(グループに関わらず両方を見る)
const SCENE_SOUWA_COUNT_VAR_ID = SCENE_GROUP_CONFIGS[1].occurrenceCountVarId;
const SCENE_HSCENE_COUNT_VAR_ID = SCENE_GROUP_CONFIGS[2].occurrenceCountVarId;

function applySceneNaviSwitches() {
  if ($gameVariables.value(SCENE_SOUWA_COUNT_VAR_ID) >= 1) {
    $gameSwitches.setValue(SCENE_SWITCH_SOUWA_NAVI, true);
  }
  if ($gameVariables.value(SCENE_HSCENE_COUNT_VAR_ID) >= 1) {
    $gameSwitches.setValue(SCENE_SWITCH_HSCENE_NAVI, true);
  }
}

//☆☆☆条件追加。<EventSetVal1:0,0>
scene_commonIdRec = function (itemId) {
  const sceneItem = $dataItems[itemId];
  if (!sceneItem) return;

  const itemAddAddEventCommonId = sceneItem.meta['AddAddEventCommonId'];
  const addAddEventCommonId = itemAddAddEventCommonId ? Number(itemAddAddEventCommonId) : itemId;
  if (addAddEventCommonId >= 2) {
    event_pararelStarting(1, itemId, 1);
    return;
  }

  if ($gameSwitches.value(SCENE_SWITCH_MEMORY)) {
    TickerManager.show('無効なIDが選択されました。ホームに帰還します。');
    for (let switchId = 101; switchId <= 110; switchId++) {
      $gameSwitches.setValue(switchId, false);
    }
    set_playerPosition2(168);
    return;
  }

  TickerManager.show('無効なIDが選択されました。処理を中断します。');
};

//イベントから挿話シーン発生event_pararelSet(this._eventId,0,1,8);
event_pararelSet = function (eventId, offsetX, offsetY, playerDirection) {

  event_charaPreset(eventId);
  event_charaRoot(eventId);

  const event = $gameMap.event(eventId);
  if (!event) return;

  $gameVariables.setValue(161, [$gameMap.mapId(), event._realX + offsetX, event._realY + offsetY]);
  set_playerPosition2(161);

  if (playerDirection >= 1) $gamePlayer.setDirection(playerDirection);

  if (!event.event().meta['EvSceneSet']) return;

  const sceneItemId = Number(event.event().meta['EvSceneSet'].split(',')[0]);
  event_pararelStarting(1, sceneItemId, eventId);
};

var event_pararelStartingCEventIdsArray = [119, 125, 429, 481];

//並列イベントスイッチオン。id1が0でﾒｲﾝ1でｼｰﾝ挿話,event_pararelStarting(1,501,this._eventId);
event_pararelStarting = function (isCommonEventTarget, targetId, sourceEventId) {

  valueCountDefeadSwitche2 = 0;//全滅スイッチオン時に成立判定

  if (!hasActiveParallelEvent()) {
    valueParallelEventId = sourceEventId;
    activateParallelTarget(isCommonEventTarget, targetId);
  }

  if (!$gameSwitches.value(SCENE_SWITCH_MEMORY)) {
    const sceneRestoreData = $gameVariables.value(SCENE_VAR_SCENE_RESTORE_DATA);
    if (Array.isArray(sceneRestoreData)) {
      sceneRestoreData[targetId] = writeSceneSnapshot(Array(12).fill(0), sourceEventId);
    }
  }

  $gameVariables.setValue(171, [$gameMap.mapId(), $gamePlayer._realX, $gamePlayer._realY]);
};

const SCENE_VAR_SCENE_RESTORE_DATA = 163;

//対象外の並列コモンイベントが既に動いているか
function hasActiveParallelEvent() {
  const activeCommonEventIds = $gameMap._commonEvents
    .filter(function (commonEvent) { return commonEvent.isActive(); })
    .map(function (commonEvent) { return commonEvent.event().id; });

  for (let index = 0; index < activeCommonEventIds.length; index++) {
    const eventId = activeCommonEventIds[index];
    if (eventId < 2) continue;

    const commonEventSwitchId = $dataCommonEvents[eventId].switchId;
    if (!commonEventSwitchId) continue;
    if (event_pararelStartingCEventIdsArray.some(function (id) { return id == commonEventSwitchId; })) continue;

    return true;
  }
  return false;
}

//並列イベント(コモンイベント)のスイッチをONにする
function activateParallelTarget(isCommonEventTarget, targetId) {
  if (isCommonEventTarget == 0 || findSceneItemRange(targetId)) {
    const targetCommonEvent = $dataCommonEvents[targetId];
    if (targetCommonEvent) $gameSwitches.setValue(targetCommonEvent.switchId, true);
    return;
  }

  const parallelTargetItem = $dataItems[targetId];
  const itemAddEventParallelSwi = parallelTargetItem ? parallelTargetItem.meta['AddEventParallelSwi'] : null;
  if (!itemAddEventParallelSwi) return;

  const parallelCommonEvent = $dataCommonEvents[Number(itemAddEventParallelSwi)];
  if (parallelCommonEvent) $gameSwitches.setValue(parallelCommonEvent.switchId, true);
}

//プレイヤーとイベントの位置/グラフィックを1つの配列に記録する
//[0]マップID [1-5]プレイヤー [6-11]イベント
function writeSceneSnapshot(snapshot, eventId) {
  snapshot[0] = $gameMap.mapId();
  snapshot[1] = $gamePlayer.characterName();
  snapshot[2] = $gamePlayer.characterIndex();
  snapshot[3] = $gamePlayer._realX;
  snapshot[4] = $gamePlayer._realY;
  snapshot[5] = $gamePlayer.direction();

  const event = eventId ? $gameMap.event(eventId) : null;
  if (!event) return snapshot;

  snapshot[6] = event.characterName();
  snapshot[7] = event.characterIndex();
  snapshot[8] = event._realX;
  snapshot[9] = event._realY;
  snapshot[10] = event.direction();
  snapshot[11] = event.pattern();

  return snapshot;
}

//一時的にキャラグラ記憶ともろもろ設定,id2が0でスタート。1で終了
Npc_TemporarilySave = function (eventId, saveMode) {

  if (saveMode == 0) {
    valueNpcGuraTemporarilySave = writeSceneSnapshot(Array(12).fill(0), eventId);
    $gameVariables.setValue(292, Array(21).fill(0));

    for (let switchId = 13; switchId <= 15; switchId++) {
      if ($gameSwitches.value(switchId)) $gameVariables.setValue(320, switchId);
    }
    return;
  }

  if (saveMode != 1) return;

  if ($gameVariables.value(320) >= 1) {
    for (let switchId = 13; switchId <= 15; switchId++) {
      $gameSwitches.setValue(switchId, false);
    }
    $gameSwitches.setValue($gameVariables.value(320), true);
  }
  $gameVariables.setValue(320, 0);
  $gameVariables.setValue(292, Array(21).fill(0));
};

//段階シーンを選択肢で表示
scene_choiceDecision = function (choiceItemIds, choiceSwitchId) {//scene_choiceDecision([503,502,501],161);

  $gameSwitches.setValue(choiceSwitchId, false);

  let selectedItemId = 0;
  let choiceDescriptionText = ` `;

  for (const sceneItemId of choiceItemIds) {
    const sceneItem = $dataItems[sceneItemId];
    if (!sceneItem) continue;

    const switchIds = readSceneChoiceSwitchIds(sceneItemId, sceneItem);

    if (!$gameSwitches.value(switchIds.completionSwitchId)) {
      choiceDescriptionText = `\x1bIIN[${sceneItemId}]\n${sceneItem.description}`;
    }
    if ($gameSwitches.value(switchIds.incidenceSwitchId) && !$gameSwitches.value(switchIds.completionSwitchId)) {
      $gameSwitches.setValue(choiceSwitchId, true);
      selectedItemId = sceneItemId;
    }
  }

  valueCountSet1 = selectedItemId;
  $gameVariables.setValue(22, choiceDescriptionText);

};

//アイテムIDが属するシーン範囲(挿話/シーン)を返す。範囲外は null
function findSceneItemRange(itemId) {
  const numericItemId = Number(itemId);
  for (const range of Object.values(SCENE_ITEM_RANGES)) {
    if (numericItemId < range.firstItemId) continue;
    if (numericItemId > range.lastItemId) continue;
    return range;
  }
  return null;
}

//選択肢用の発生/達成スイッチID(アイテム範囲かメタで決まる)
function readSceneChoiceSwitchIds(sceneItemId, sceneItem) {
  let incidenceSwitchId = 0;
  let completionSwitchId = 0;

  const itemRange = findSceneItemRange(sceneItemId);
  if (itemRange) {
    incidenceSwitchId = sceneItemId + itemRange.occurrenceSwitchOffset;
    completionSwitchId = sceneItemId + itemRange.checkSwitchOffset;
  }

  if (sceneItem.meta['AddEventIncidenceSwi']) {
    incidenceSwitchId = Number(sceneItem.meta['AddEventIncidenceSwi']);
  }
  if (sceneItem.meta['AddEventCompSwi']) {
    completionSwitchId = Number(sceneItem.meta['AddEventCompSwi']);
  }

  if (!completionSwitchId || !incidenceSwitchId) {
    console.warn(`One of value3 or value4 was not set! Code can work incorrect! value3:${incidenceSwitchId},value4:${completionSwitchId}`);
  }

  return { incidenceSwitchId, completionSwitchId };
}

//#region scene_choiceSouwa
//挿話選択肢発生スクリプト
scene_choiceSouwa = function () {
  //挿話選択肢フラグをリセット
  $gameVariables.setValue(19, 0);

  const availableSouwaChoices = getAvailableSouwaChoices();
  if (availableSouwaChoices.length === 0) return;

  $gameVariables.setValue(19, 1);
  addSouwaChoicesToGameSystem(availableSouwaChoices);
};

//利用可能な挿話のアイテムID一覧(スイッチ範囲とメタ指定の両方)
function getAvailableSouwaChoices() {
  const switchBasedChoices = getSwitchBasedSouwaChoices();
  const metaBasedChoices = getMetaBasedSouwaChoices();

  //他プラグインも参照するグローバル(valueScriptArray1)に結果を残す
  valueScriptArray1 = [...switchBasedChoices, ...metaBasedChoices];

  return valueScriptArray1;
}

//スイッチ範囲(1201-1300)由来の挿話
function getSwitchBasedSouwaChoices() {
  const choices = [];

  for (let switchId = 1201; switchId <= 1300; switchId++) {
    const itemId = switchId - 800;
    if (!isSwitchBasedSouwaAvailable(switchId, itemId)) continue;

    choices.push(itemId);
  }

  return choices;
}

//スイッチ範囲由来の挿話が選択可能か
function isSwitchBasedSouwaAvailable(switchId, itemId) {
  if (!$gameSwitches.value(switchId)) return false;

  const item = $dataItems[itemId];
  if (!item) return false;
  if ($gameParty.hasItem(item)) return false;
  if ($gameSwitches.value(switchId + 100)) return false;
  if (item.meta['singleSouwaIncidence']) return false;

  return true;
}

//メタ(AddEventIncidenceSwi)指定の挿話
function getMetaBasedSouwaChoices() {
  const choices = [];

  for (let itemId = 1; itemId < $dataItems.length; itemId++) {
    const currentItem = $dataItems[itemId];
    if (!currentItem) continue;
    if (!isMetaBasedSouwaAvailable(currentItem)) continue;

    choices.push(itemId);
  }

  return choices;
}

//メタ指定の挿話が選択可能か
function isMetaBasedSouwaAvailable(item) {
  if (!item.meta['AddEventIncidenceSwi']) return false;
  if (Number(item.meta['EICSwitch']) !== SCENE_EIC_SOUWA) return false;
  if (!$gameSwitches.value(Number(item.meta['AddEventIncidenceSwi']))) return false;
  if ($gameParty.hasItem(item)) return false;
  if ($gameSwitches.value(Number(item.meta['AddEventCompSwi']))) return false;
  if (item.meta['singleSouwaIncidence']) return false;

  return true;
}

//挿話をカスタム選択肢として登録する
function addSouwaChoicesToGameSystem(choices) {
  for (let index = 0; index < choices.length; index++) {
    const chosenItemId = choices[index];
    const chosenItem = $dataItems[chosenItemId];
    if (!chosenItem) continue;

    $gameSystem.addCustomChoice(1, { text: chosenItem.name, value: chosenItemId });
  }
}

//#endregion

//オールナビスクリプト
const SCENE_NAVI_PICTURE_ID_START = 101;
const SCENE_NAVI_DESCRIPTION_FONT_SIZE = 28;

scene_allNavigation = function () {

  valueScriptArray1 = [];

  const itemEICSwitchId = $gameVariables.value(19) == 1 ? SCENE_EIC_SOUWA : SCENE_EIC_SCENE;
  collectNavigationItemIds(itemEICSwitchId);

  if (valueScriptArray1.length === 0) return;

  let pictureId = SCENE_NAVI_PICTURE_ID_START;
  for (let index = 0; index < valueScriptArray1.length; index++) {
    const navigationItem = $dataItems[valueScriptArray1[index]];

    $gameSystem.addCustomChoice(1, { text: navigationItem.name, value: 0 });
    showNavigationDescriptionPicture(navigationItem, pictureId);

    $gameMessage.setSelectPictureId(index, pictureId);
    pictureId += 1;
  }

};

//指定カテゴリ(EICSwitch)のアイテムIDを集める
function collectNavigationItemIds(itemEICSwitchId) {
  for (let itemId = 1; itemId < $dataItems.length; itemId++) {
    const item = $dataItems[itemId];
    if (!item || !item.meta['EICSwitch']) continue;
    if (Number(item.meta['EICSwitch']) != itemEICSwitchId) continue;

    valueScriptArray1.push(itemId);
  }
}

//ナビの説明文とウィンドウ枠を表示する
function showNavigationDescriptionPicture(navigationItem, pictureId) {
  $gameScreen.setDTextPicture(navigationItem.description, SCENE_NAVI_DESCRIPTION_FONT_SIZE);
  $gameScreen.dWindowFrame = 'ON';
  $gameScreen.showPicture(pictureId, '', 0, 10, 606, 100, 100, 0, 0);
}

//}());
