/*:
* @plugindesc このゲーム専用プラグイン
* @author 作者名
* @help ゲーム専用に作成された初期読み込み用プラグイン
*/

//(function(){

//---------------------------------------------------------------------------
// Game variable / switch IDs used by this plugin (named after their meaning)
//---------------------------------------------------------------------------
const VAR_CURRENT_ACTOR_ID = 20;          // 現在処理中のアクターID
const VAR_MAIN_ACTOR_ID = 2;              // メインキャラのアクターID
const VAR_PARTNER_WEAPON_ID = 340;        // 相手の武器ID(301が汎用)
const VAR_PARTNER_NAME = 22;              // 相手名の表示用変数
const VAR_ACTOR_NAME_MIRROR = 94;         // アクター名の一時コピー
const VAR_H_PICTURE_NAME = 193;           // H CG の立ち絵名
const VAR_H_STAGE_STATE = 191;            // 立ち絵の段階(1-6)
const VAR_H_STAGE_VARIANT = 192;          // 立ち絵の表情差分
const VAR_H_STAGE_MESSAGE = 194;          // BGSライン番号
const VAR_MESSAGE_STACK = 506;            // 抑制/上限メッセージの蓄積
const VAR_MESSAGE_STACK_COUNT = 540;
const VAR_MESSAGE_STACK_ALT = 539;
const VAR_PENDING_HSTATE_INPUT = 19;      // 選択肢で選ばれた変数ID
const VAR_CHOICE_RESULT = 18;             // (未使用/予約)
const VAR_HSTATE_SELECTED_VALUE = 641;    // 相手とのH回数の一時記録
const VAR_LAST_H_COUNT = 339;             // 人数指定(NumberOfPeople)
const VAR_HISTORY_TEXT_VAR = 253;
const VAR_HISTORY_SCENE_ARRAY = 174;      // シーン履歴(アクター別)
const VAR_HEROINE_ID_ARRAY = 247;         // ヒロインID一覧
const VAR_H_STATE_DISPLAY_TEXT = 643;     // 現在のHステートアイコン
const VAR_PARTNER_NAME_OVERRIDE = 353;    // 相手名の上書き配列
const VAR_SCENE_PARTNER = 340;            // 同上(読み替え用エイリアス)
const VAR_H_SCENE_ACTOR = 530;            // H演出の対象アクター
const VAR_H_SCENE_TEXT_X = 318;           // 文字BGVのアクター
const VAR_H_SCENE_PICTURE_PARAMS = 706;
const VAR_H_SCENE_PICTURE_SLOTS = 299;    // 使用可能なピクチャID
const VAR_H_SCENE_SPOKEN_TEXT = 21;       // 絶頂時の台詞(名前マーカー付き)
const VAR_H_SCENE_PHRASES = 707;          // 追加の喘ぎ台詞
const VAR_BATTLE_MVP = 350;               // MVP記録配列
const VAR_BATTLE_KILL = 351;              // 撃破数配列
const VAR_BATTLE_DAMAGE = 298;            // 与ダメージ配列
const VAR_HSTATE_PENDING_DEVELOPMENT_BASE = 430; // 開発度の加算予定(431-439)
const VAR_SUPPRESSION_TARGET_FIRST = 431; // 開発度の抑制対象(431-439)
const VAR_SUPPRESSION_TARGET_LAST = 439;
const RANK_SUPPRESSION_SUFFIX = `上昇抑制`;
const VAR_SUPPRESSION_TARGET_IDS = [431, 432, 433, 434, 435, 436, 437, 438, 439];

const VAR_HSTATE_PENDING_FIRST = 401;     // 加算予定のHステータス(401-440)
const VAR_HSTATE_PENDING_LAST = 440;
const VAR_HSTATE_EXPOSURE_LIMIT = 405;    // 限界露出度
const VAR_HSTATE_CURRENT_EXPOSURE = 404;  // 現在の露出度(計算用の一時変数)
const VAR_HSTATE_AROUSAL = 402;           // 発情値
const VAR_HSTATE_AROUSAL_GAIN = 401;      // 今回の性欲度上昇
const VAR_HSTATE_PLEASURE_GAIN = 403;
const VAR_HSTATE_FERTILITY = 403;
const VAR_HSTATE_PROSTITUTION_MONEY = 427;
const VAR_HSTATE_PREGNANCY_PARTNER = 49;
const VAR_PHYSIQUE_VAR_FIRST = 611;       // 体型変化の記録(611/612)
const VAR_PHYSIQUE_VAR_SECOND = 612;

// offsets into the per-actor arrays
const HSTATE_ARRAY_VAR_OFFSET = 380;      // 変数(actorId+380) = Hステータス配列
const PARTNER_RECORD_VAR_OFFSET = 360;    // 変数(actorId+360) = 相手別H記録
const PARTNER_BODY_VAR_OFFSET = 440;      // 変数(actorId+440) = 体型/衣装差分
const PARTNER_RECORD_SLOT_OFFSET = 100;   // 相手別記録の区切り(101-200)
const PARTNER_CHILD_SLOT_OFFSET = 200;    // 相手別の子どもの数
const PARTNER_WIFE_SLOT_OFFSET = 100;
const HSTATE_BODY_INDEX_HEAD_VARIANT = 32; // 体型配列の頭部差分フラグ
const HSTATE_BODY_INDEX_BUST_FLAG = 18;    // 体型配列のバストフラグ(+100)

// H status array indexes
const HSTATE_INDEX_AROUSAL = 1;            // 性欲度
const HSTATE_INDEX_AROUSAL_CAP = 0;        // 性欲度上限
const HSTATE_INDEX_ESTRUS = 2;             // 発情値
const HSTATE_INDEX_FERTILITY = 3;          // 当日受精率
const HSTATE_INDEX_EXPOSURE = 4;           // 現在露出度
const HSTATE_INDEX_EXPOSURE_LIMIT = 5;     // 限界露出度
const HSTATE_INDEX_SEX_COUNT = 6;          // 性交回数
const HSTATE_INDEX_FIRST_PARTNER = 41;     // 初体験相手
const HSTATE_INDEX_PREGNANCY_SWELL = 42;   // 妊娠時の体重/サイズ増加
const HSTATE_INDEX_FIRST_CHILD_PARTNER = 49;// 初子の父親
const HSTATE_INDEX_TODAY_COUNT = 61;       // 当日Ｈ回数
const HSTATE_INDEX_DAILY_LIMIT_DAYS = 62;  // 1日10回以上の連続日数
const HSTATE_INDEX_LIBIDO_DRUG = 63;       // 性欲薬使用回数
const HSTATE_INDEX_ZERO_COUNT_DAYS = 64;   // 性欲499以上で0回の連続日数
const HSTATE_INDEX_RAPE_TODAY = 71;        // 当日強姦回数
const HSTATE_INDEX_HEIGHT = 51;            // 以下はhstates_heightsの計算結果
const HSTATE_INDEX_WEIGHT = 52;
const HSTATE_INDEX_BUST = 53;
const HSTATE_INDEX_WAIST = 54;
const HSTATE_INDEX_HIP = 55;
const HSTATE_INDEX_CUP = 56;

// game switches
const SW_H_SCENE_DISPLAY_HIDDEN = 121;    // Hシーンでステータス非表示
const SW_H_SCENE_SIMPLE = 122;            // 性欲/性感のみの簡易表示
const SW_H_SCENE_PAST = 123;              // 過去シーン
const SW_BATTLE_RECORD_VISIBLE = 130;     // 戦闘記録の表示
const SW_TICKER_MESSAGE = 475;            // ティッカーで通知
const SW_MESSAGE_STACK_MODE = 154;        // メッセージを変数に積む
const SW_H_PASSIVE_WINDOW = 115;          // 未収得Hパッシブ窓の開閉
const SW_HISTORY_DETAIL = 164;            // 履歴の詳細表示
const SW_ECSTASY_VOICE = 119;             // 絶頂ボイス
const SW_GOBLIN_ENEMY = 248;              // 敵がゴブリン
const SW_CLOTH_MENU_RELEASED = 604;       // 着せ替えメニュー解放済み
const SW_COMPACT_H_STATUS = 496;          // Hステータスの簡易表示

// skills / database ids
const SKILL_LIBIDO_UNLOCK = 18;           // 性欲度を使用できる基本スキル
const SKILL_H_EXPOSURE = 55;              // 露出開発度
const SKILL_H_SEXUAL_DEV = 54;            // 性感開発度
const SKILL_H_SKILLED = 65;               // スケベっこ(受精/絶頂処理の解放)
const SKILL_PARTNER_KNOWN = 67;           // 相手の情報を知っている
const SKILL_ALL_DEVELOPMENT = 875;        // 9種組み合わせ
const SKILL_H_DEV_FIRST = 51;             // 開発度スキル(51-59)
const SKILL_H_DEV_LAST = 59;
const SKILL_SUPPRESSION_FIRST = 61;       // 発情鎮静スキル(61-69)
const ELEMENT_REPRODUCTION = 37;          // 繁殖補正の属性
const STATE_PREGNANT = 83;                // 妊娠
const STATE_FERTILIZED = 79;              // 受精(前段階)
const STATE_BIRTHED = 82;                  // 出産済み
const STATE_ESTRUS = 61;                  // 発情
const STATE_HARASSMENT = 81;              // セクハラ(拘束前)
const HCG_PISTON_PICTURE_ID = 57;

// misc limits
const PARTNER_ACTOR_ID = 21;              // 相手名を表示するためのアクターID
const VAR_HSTATE_ECSTASY_BASE = 400;      // 絶頂系スロットの基準変数ID
const ACTOR_SCAN_FIRST = 1;               // isGirl判定で走査するアクター
const ACTOR_SCAN_LAST = 20;
const VAR_H_VAGINAL_COUNT = 406;          // 膣姦回数
const VAR_H_ANAL_COUNT = 407;            // 尻姦回数
const VAR_H_FELLATION_COUNT = 408;       // フェラ回数
const VAR_H_CLIMAX_COUNT = 414;          // 絶頂回数
const VAR_H_SQUIRT_COUNT = 425;          // 潮吹き回数
const VAR_H_INCONTINENCE_COUNT = 424;    // 失禁回数
const VAR_GROUP_H_COUNT = 409;           // 経験人数(2人以上で輪姦)
const VAR_HSTATE_PENDING_DISTINCT_PARTNERS = 409; // 経験人数の加算予定
const VAR_HSTATE_PENDING_VAGINAL_INTERNAL = 411;  // 膣内中だし回数
const VAR_HSTATE_PENDING_ANAL_INTERNAL = 412;     // 肛内中だし回数
const VAR_HSTATE_PENDING_FELLATION_INTERNAL = 416; // 口内中だし回数
const VAR_HSTATE_PENDING_GROUP_RAPE = 419;        // 輪姦フラグ
const VAR_HSTATE_PENDING_MONSTER_H = 420;         // 魔物姦フラグ
const VAR_HSTATE_PENDING_RAPE = 418;              // 強姦回数

const PARTNER_SCAN_FIRST = 1;             // 相手別履歴の走査範囲
const PARTNER_SCAN_LAST = 100;
const PARTNER_RECORD_SLOT_FIRST_INDEX = 101; // 受精相手の記録スロット
const PARTNER_RECORD_SLOT_LAST_INDEX = 200;
const EXPOSURE_ITEM_SCAN_FIRST = 1201;    // 露出計算で見るアイテム範囲
const CLOTH_SWITCH_VAR_ID_MIN = 461;      // 衣装スイッチ変数の範囲
const CLOTH_SWITCH_VAR_ID_MAX = 500;
const CLOTH_SWITCH_VAR_OFFSET = 460;      // ClothSwitch + 460 = 変数ID
const EIC_SWITCH_SHARED_ACTOR = 200;      // 全員共通の着用者ID

//---------------------------------------------------------------------------
// Small shared helpers
//---------------------------------------------------------------------------

//開発度ランク(1-6)を色付きラベルにする。6以上は全てS。
const MASTERY_RANK_LABELS = [`\\C[4][E]\\C[0]`, `\\C[12][D]\\C[0]`, `\\C[5][C]\\C[0]`, `\\C[13][B]\\C[0]`, `\\C[27][A]\\C[0]`, `\\C[30][S]\\C[0]`];
masteryRankLabel = function (masteryLevel) {
  return MASTERY_RANK_LABELS[Math.max(0, Math.min(masteryLevel, 6) - 1)];
};

//性欲表示用の文章を1行追加し、ページ行数に達したら次のvalueWordSetへ送る。
appendHStateMessage = function (messageText, linesPerPage, pageHeaderText) {
  window['valueWordSet' + valueCountSet2] += messageText;
  valueCountSet1 += 1;
  if ((valueCountSet1 % linesPerPage) != 0) return;
  valueCountSet2 += 1;
  window['valueWordSet' + valueCountSet2] = pageHeaderText || `\\C[10]H-Passive[${valueCountSet2}]\\C[0]\n`;
};

//メタ値"a,b"のindex番目を数値で返す。index省略時は全体を数値化。
metaNumberAt = function (meta, key, index, fallback) {
  const raw = meta[key];
  if (!raw) return fallback;
  if (index === undefined) return Number(raw);
  return Number(raw.split(',')[index]);
};

//現在処理中のアクター($gameVariables.value(20))を取得する。
function currentHStateActor() {
  return $gameActors.actor($gameVariables.value(VAR_CURRENT_ACTOR_ID));
}

//変数(actorId+380) のHステータス配列。
function readHStateValues(actorId) {
  return $gameVariables.value(actorId + HSTATE_ARRAY_VAR_OFFSET);
}

//変数(actorId+360) の相手別H記録配列。
function readPartnerRecords(actorId) {
  return $gameVariables.value(actorId + PARTNER_RECORD_VAR_OFFSET);
}

//変数(actorId+440) の体型/衣装差分配列。
function readPartnerBodyValues(actorId) {
  return $gameVariables.value(actorId + PARTNER_BODY_VAR_OFFSET);
}

//変数名から表示用の余白と区切りを取り除く(例: "性欲度　：" -> "性欲度")
function cleanVariableLabel(variableName) {
  //NOTE: 元コードは全角スペース3個・半角スペース1個・コロン1個までしか
  //      取り除いていなかったので、表示結果を変えないため同じ回数にしている。
  return String(variableName)
    .replace("　", ``).replace("　", ``).replace("　", ``)
    .replace(" ", ``).replace(":", ``);
}

//通知は「ティッカー」と「変数に蓄積」の2通りがあるので1か所にまとめる。
function showHStateNotice(messageText) {
  if ($gameSwitches.value(SW_MESSAGE_STACK_MODE)) {
    $gameVariables.setValue(VAR_MESSAGE_STACK_ALT, `${messageText}\n`);
    $gameVariables.setValue(VAR_MESSAGE_STACK_COUNT, $gameVariables.value(VAR_MESSAGE_STACK_COUNT) + 1);
    return;
  }
  TickerManager.show(messageText);
}

//メッセージを変数(506)へ積むか、ティッカーで流すか。
function appendMessageStack(messageText) {
  $gameVariables.setValue(VAR_MESSAGE_STACK, $gameVariables.value(VAR_MESSAGE_STACK) + messageText);
}

//401-440の「今回加算するHステータス」をゼロに戻す。
function resetPendingHStateVariables() {
  for (let varId = VAR_HSTATE_PENDING_FIRST; varId <= VAR_HSTATE_PENDING_LAST; varId++) {
    $gameVariables.setValue(varId, 0);
  }
}

//変数IDの並びに値を順番に代入する(h_exp1-h_exp4 の共通処理)
function assignGameVariableList(varIds, values) {
  for (let index = 0; index < varIds.length; index++) {
    $gameVariables.setValue(varIds[index], values[index]);
  }
}

//---------------------------------------------------------------------------
// H experience counters
//---------------------------------------------------------------------------

//中だし判定用のコイン投げ（1が出れば中だし）
const COIN_FLIP_VALUES = [1, 0, 1, 0, 1, 1];

//380-400の変数配列に名称設定。
const HENTAI_ARRANGEMENT_NAMES = {
  1: `性欲度`,
  41: `初体験相手`,
  49: `初出産相手`,
  61: `当日Ｈ回数`,
  62: `一日のＨ回数が10回以上`,
  63: `性欲薬使用回数`,
  64: `性欲499以上でＨ回数0の連続日数`,
  71: `当日強姦回数`
};

Hentai380_ArrangementNameSet = function () {

  valueHentaiArrangement = Array(71).fill(`H回数`);
  for (const index in HENTAI_ARRANGEMENT_NAMES) {
    valueHentaiArrangement[index] = HENTAI_ARRANGEMENT_NAMES[index];
  }

};

//Ｈ経験値１日経過時更新
weeks_toggleOtherH = function () {

  //61は当日Ｈ回数、62は当日Ｈ回数10以上の時に記録。64は性欲499以上でＨ回数0の連続日数
  for (let actorId = ACTOR_SCAN_FIRST; actorId <= ACTOR_SCAN_LAST; actorId++) {
    const actor = $gameActors.actor(actorId);
    if (!isGirl(actor)) continue;
    updateDailyHRecords(readHStateValues(actorId));
  };

};

//1人分の日次H記録を更新し、当日回数をリセットする。
function updateDailyHRecords(hStateValues) {
  if (hStateValues[HSTATE_INDEX_TODAY_COUNT] >= 10) {
    hStateValues[HSTATE_INDEX_DAILY_LIMIT_DAYS] += 1;//1日Ｈ回数１０回以上
  }
  if (hStateValues[HSTATE_INDEX_AROUSAL] >= 499) {
    hStateValues[HSTATE_INDEX_ZERO_COUNT_DAYS] = hStateValues[HSTATE_INDEX_TODAY_COUNT] == 0
      ? hStateValues[HSTATE_INDEX_ZERO_COUNT_DAYS] + 1
      : 0;
  }
  hStateValues[HSTATE_INDEX_TODAY_COUNT] = 0;//H回数リセット
}

//性欲経験値(開発度)を変数へ設定する。h_exp1-h_exp4 は変数IDだけが違う。
const HEXP_VARIABLES = {
  encounter: [406, 409, 408, 407, 413, 414],          // 膣/人数/フェラ/アナル/自慰/絶頂
  relation: [417, 418, 420, 419, 430, 410],           // 和姦/強姦/異種/輪姦/乱交/露出
  act: [421, 422, 423, 424, 425, 426, 415, 428, 411, 412, 416],
  development: [431, 432, 433, 434, 435, 436, 437, 438, 427]
};

h_exp1 = function (vaginalCount, partnerCount, fellatioCount, analCount, masturbationCount, orgasmCount) {
  assignGameVariableList(HEXP_VARIABLES.encounter,
    [vaginalCount, partnerCount, fellatioCount, analCount, masturbationCount, orgasmCount]);
};

h_exp2 = function (consensualCount, rapeCount, interspeciesCount, gangRapeCount, orgyCount, exposureCount) {
  assignGameVariableList(HEXP_VARIABLES.relation,
    [consensualCount, rapeCount, interspeciesCount, gangRapeCount, orgyCount, exposureCount]);
};

h_exp3 = function (harassmentCount, breastKneadCount, buttKneadCount, incontinenceCount, squirtingCount, prostitutionCount, pregnancyCount, childCount, vaginalEjaculationCount, analEjaculationCount, oralDrinkCount) {
  assignGameVariableList(HEXP_VARIABLES.act,
    [harassmentCount, breastKneadCount, buttKneadCount, incontinenceCount, squirtingCount,
      prostitutionCount, pregnancyCount, childCount, vaginalEjaculationCount,
      analEjaculationCount, oralDrinkCount]);
};

h_exp4 = function (vaginalDevelopment, analDevelopment, oralDevelopment, sensualityDevelopment, exposureDevelopment, semenExp, sexualPlayExp, serviceExp, prostitutionEarnings) {
  assignGameVariableList(HEXP_VARIABLES.development,
    [vaginalDevelopment, analDevelopment, oralDevelopment, sensualityDevelopment,
      exposureDevelopment, semenExp, sexualPlayExp, serviceExp, prostitutionEarnings]);
};

//絶頂関連の変数へランダムに加算する(6-8のいずれか)
const ECSTASY_SLOT_CANDIDATES = [6, 6, 6, 6, 7, 8, 8];
h_exp1ex = function (id) {

  for (let count = 1; count <= id; count++) {
    const ecstasySlot = ECSTASY_SLOT_CANDIDATES[getRandomIndex(ECSTASY_SLOT_CANDIDATES.length)];
    const targetVarId = VAR_HSTATE_ECSTASY_BASE + ecstasySlot;
    $gameVariables.setValue(targetVarId, $gameVariables.value(targetVarId) + 1);
  };

};

//---------------------------------------------------------------------------
// Partner (weapon id 301+) related helpers
//---------------------------------------------------------------------------

//相手とのＨ回数などから、バトル中の絶頂台詞とピクチャを出す。
h_BattleEcstasyDirect = function () {

  adv_HpartDirectPlay(3);
  const actorId = $gameVariables.value(VAR_CURRENT_ACTOR_ID);
  const actorData = $dataActors[actorId];
  if (!actorData || !actorData.meta['SexualZettyouLow']) return;

  const actor = $gameActors.actor(actorId);
  const ecstasyRank = 1;
  const ecstasyCandidates = actorData.meta['SexualZettyouLow'].split(',');
  const ecstasyValue = ecstasyCandidates[getRandomIndex(ecstasyCandidates.length)];
  const actorNameMarker = `\\nw[${actor.name()}]`;
  $gameVariables.setValue(VAR_H_SCENE_SPOKEN_TEXT, `${actorNameMarker}${ecstasyValue}`);

  showBattleEcstasyPictures(actorId, ecstasyRank);
};

//絶頂演出用のピクチャ。actorId とランクで画像名が決まる。
function showBattleEcstasyPictures(actorId, ecstasyRank) {
  const ecstasyPictureName = 'Zev_BattleEcstasy' + actorId + '_' + ecstasyRank;
  pic_1(0, 57, ecstasyPictureName, 0, 100, 255, 60, 1280, 768, 0, 0);

  const ecstasyPictureId = 51;
  const ecstasyPictureBaseName = 'ScreenBattleEcstasySell5';
  picture_anime1(ecstasyPictureId, ecstasyPictureBaseName, 5, 1, "横", 10, 1, true, [1, 2]);
  $gameScreen.movePicture(ecstasyPictureId, 1, 640, 384, 100, 100, 150, 0, 30);
}

//相手とＨ済みの場合に表示するためのスクリプト
h_keikenhyouji1 = function (resultVarId, partnerWeaponId) {

  const partnerWeapon = $dataWeapons[partnerWeaponId];
  const partnerActor = $gameActors.actor(PARTNER_ACTOR_ID);
  if (!partnerWeapon || !partnerActor) return;

  applyPartnerNameOverride(partnerActor, partnerWeapon, partnerWeaponId);
  valueScenePartnerId = partnerWeaponId;

  const partnerHRecords = readPartnerRecords($gameVariables.value(VAR_CURRENT_ACTOR_ID));
  const partnerHCount = partnerHRecords[partnerWeaponId - PARTNER_RECORD_SLOT_OFFSET];
  if (!(partnerHCount >= 1)) {
    $gameVariables.setValue(resultVarId, 0);
    return;
  };

  h_partnerFullName(VAR_PARTNER_NAME, partnerWeaponId);
  const partnerName = $gameVariables.value(VAR_PARTNER_NAME);
  const partnerInfoText = buildPartnerInfoText(partnerWeapon, partnerHRecords, partnerWeaponId, partnerName, partnerHCount);
  $gameVariables.setValue(resultVarId, `【${partnerInfoText}】`);

};

//相手役アクター(21)の表示名を、上書き変数か武器名から決める。
function applyPartnerNameOverride(partnerActor, partnerWeapon, partnerWeaponId) {
  const nameOverrideValues = $gameVariables.value(VAR_PARTNER_NAME_OVERRIDE);
  const nameOverride = nameOverrideValues[partnerWeaponId - 300];

  if (nameOverride != 0) {
    partnerActor.setName(`\x1bnnp[${partnerWeaponId}]`);
    return;
  }
  partnerActor.setName(partnerWeapon.name);
}

//相手とのＨ回数・子どもの数・妊娠の可能性を1つの文章にまとめる。
function buildPartnerInfoText(partnerWeapon, partnerHRecords, partnerWeaponId, partnerName, partnerHCount) {
  const partnerDescription = partnerWeapon.description;
  let partnerInfoText = partnerDescription == 0 ? `\n` : `${partnerDescription}\n`;

  const hCountText = colorTaggedText(27, `Ｈ回数：${partnerHCount}`);
  partnerInfoText += `\n` + `${partnerName}との${hCountText}`;

  const childCount = partnerHRecords[partnerWeaponId + PARTNER_CHILD_SLOT_OFFSET];
  if (childCount >= 1) {
    partnerInfoText += `　${partnerName}との子${childCount}人`;
  };

  if (partnerHRecords[partnerWeaponId] >= 1) {
    partnerInfoText += `　${partnerName}の子を宿しているかも知れない…。`;
  };
  return partnerInfoText;
}

//相手とＨ済みの場合に表示するためのスクリプト
h_keikenhyouji2 = function (textVarId, showFlag) {

  changePartnerInfoWindow(textVarId, showFlag);

};

//テキスト窓(ピクチャ150)の表示/退場。
function changePartnerInfoWindow(textVarId, showFlag) {
  if (textVarId != 0 && showFlag == 1 && $gameVariables.value(textVarId) != 0) {
    $gameScreen.dWindowFrame = 'ON';
    $gameScreen.setDTextPicture($gameVariables.value(textVarId), 25);
    $gameScreen.showPicture(150, "", 0, 100, 100, 100, 100, 0, 0);
    $gameScreen.movePicture(150, 0, 10, 100, 100, 100, 255, 0, 30);
  };
  if (showFlag == 0) {
    pic_move1(150, -100, 100, 100, 100, 0, 60);
  };
}

//固有相手とのＨ経験回数リスト
const PARTNER_HISTORY_VAR_FIRST = 801;
const PARTNER_HISTORY_VAR_LAST = 810;
const PARTNER_HISTORY_PAGE_LINES = 10;

h_hennreki = function () {

  for (let varId = PARTNER_HISTORY_VAR_FIRST; varId <= PARTNER_HISTORY_VAR_LAST; varId++) {
    $gameVariables.setValue(varId, 0);
  };

  const partnerHRecords = readPartnerRecords($gameVariables.value(VAR_CURRENT_ACTOR_ID));
  let listVarId = PARTNER_HISTORY_VAR_FIRST;
  let pageText = `一覧` + `\n`;
  let entryCount = 0;

  for (let partnerIndex = PARTNER_SCAN_FIRST; partnerIndex <= PARTNER_SCAN_LAST; partnerIndex++) {
    const hCount = partnerHRecords[partnerIndex];
    if (hCount < 1) continue;

    pageText += buildPartnerHistoryLine(partnerHRecords, partnerIndex, hCount);
    entryCount += 1;

    if ((entryCount % PARTNER_HISTORY_PAGE_LINES) != 0) continue;
    $gameVariables.setValue(listVarId, pageText);
    listVarId += 1;
    pageText = `　\n`;
  };

  $gameVariables.setValue(listVarId, pageText);

};

//1人分の「相手名：n回【子どもの数】」行。
function buildPartnerHistoryLine(partnerHRecords, partnerIndex, hCount) {
  const partnerWeapon = $dataWeapons[partnerIndex + 300];
  const partnerName = partnerWeapon ? partnerWeapon.name : ``;

  let entryLineText = ` ${partnerName}：`;
  entryLineText += `${hCount}回`;

  const childCount = partnerHRecords[partnerIndex + PARTNER_CHILD_SLOT_OFFSET];
  if (childCount >= 1) {
    entryLineText += `【${childCount}人】`;
  };

  return entryLineText + `\n`;
}

//h_partnerFullName(22,$gameVariables.value(340)); //代入変数id,相手id指定変数
h_partnerFullName = function (resultVarId, partnerWeaponId) {

  const partnerWeapon = $dataWeapons[partnerWeaponId];
  //BUGFIX: 武器IDが存在しない場合にmeta参照で落ちていた
  if (!partnerWeapon) return;

  const partnerMeta = partnerWeapon.meta;
  const partnerNameText = buildPartnerNameText(partnerWeapon, partnerMeta);
  $gameVariables.setValue(resultVarId, partnerNameText);

};

//姓・漢字姓・代役アクターIDのメタを反映した相手名。
//順序は 武器名 -> (=姓) -> 漢字姓を前置 -> 代役アクターで置換。
function buildPartnerNameText(partnerWeapon, partnerMeta) {
  let partnerNameText = colorTaggedText(23, partnerWeapon.name);

  if (partnerMeta['FamilyName']) {
    const familyName = partnerMeta['FamilyName'];
    partnerNameText += colorTaggedText(23, `=${familyName}`);
  };
  if (partnerMeta['FamilyNameKanji']) {
    const familyNameKanji = colorTaggedText(23, partnerMeta['FamilyNameKanji']);
    partnerNameText = `${familyNameKanji} ${partnerNameText}`;
  };
  if (partnerMeta['SubstitutionActorId']) {
    partnerNameText = `\x1bSET[${Number(partnerMeta['SubstitutionActorId'])}]`;
  };
  return partnerNameText;
}

//Ｈ経験値更新
h_exp = function (actorId, pictureName, partnerWeaponId, hideFlag, simpleFlag, pastSceneFlag) {

  $gameVariables.setValue(VAR_LAST_H_COUNT, 0);
  $gameVariables.setValue(VAR_CURRENT_ACTOR_ID, actorId);
  $gameVariables.setValue(VAR_H_PICTURE_NAME, pictureName);
  readHStateValues(actorId)[46] = pictureName;
  $gameSwitches.setValue(SW_H_SCENE_DISPLAY_HIDDEN, hideFlag);//非表示
  $gameSwitches.setValue(SW_H_SCENE_SIMPLE, simpleFlag);//性欲性感のみ簡易主にアイテム使用時
  $gameSwitches.setValue(SW_H_SCENE_PAST, pastSceneFlag);//過去シーンならオン
  $gameVariables.setValue(VAR_PARTNER_WEAPON_ID, partnerWeaponId);//301汎用
  $gameVariables.setValue(VAR_ACTOR_NAME_MIRROR, $gameActors.actor(actorId).name());

  const partnerWeapon = $dataWeapons[partnerWeaponId];
  //BUGFIX: 武器IDが存在しない場合にname参照で落ちていた
  if (!partnerWeapon) return;

  $gameVariables.setValue(VAR_PARTNER_NAME, partnerWeapon.name);
  if (partnerWeapon.meta['NumberOfPeople']) {
    $gameVariables.setValue(VAR_LAST_H_COUNT, Number(partnerWeapon.meta['NumberOfPeople']));
  };

};

//---------------------------------------------------------------------------
// Actor H status windows
//---------------------------------------------------------------------------
const H_EXPOSURE_SKILL_ID = 50;           // 性欲発展度スキル
const H_EXPOSURE_RANK_STEP = 100;         // 発展度100ごとに1ランク
const HSTATE_WINDOW_COLUMN_A = [6, 7, 8, 9, 10, 11, 12, 16, 13, 14, 15];
const HSTATE_WINDOW_COLUMN_B = [17, 18, 19, 30, 20, 21, 22, 23, 24, 25, 26, 28];
const HSTATE_COUNT_WORD = `回`;
//Engine font-size tags, kept outside of the translatable strings.
const FONT_SIZE_22 = `\\fs[22]`;
const FONT_SIZE_24 = `\\fs[24]`;
const FONT_SIZE_25 = `\\fs[25]`;
const FONT_SIZE_28 = `\\fs[28]`;

//☆☆アクター変数20の開発度表示2
actor_Hstateshyouji2 = function () {

  const actorId = $gameVariables.value(VAR_CURRENT_ACTOR_ID);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;

  const hStateValues = readHStateValues(actorId);
  const developmentRankTitle = `性欲発展度`;
  let statusText = FONT_SIZE_25 + developmentRankTitle;
  statusText += buildDevelopmentRankText(actor, hStateValues[HSTATE_INDEX_AROUSAL]);

  const skillRange = buildHSkillRange(SKILL_H_DEV_FIRST, SKILL_H_DEV_LAST);
  for (const skillId of skillRange) {
    statusText += buildHSkillStatusLine(actor, skillId);
  };

  WindowManager.show(1, 0, 200, 768, 386);
  WindowManager.drawText(1, statusText);

};

//[圏外]〜[SSS]までの発展度ランク表記。
const DEVELOPMENT_RANK_LABELS = [
  colorTaggedText(4, "[圏外]"), 
  colorTaggedText(12, "[皆無]"), 
  colorTaggedText(4, "[E]"), 
  colorTaggedText(12, "[D]"),
  colorTaggedText(5, "[C]"), 
  colorTaggedText(13, "[B]"), 
  colorTaggedText(27, "[A]"),
  colorTaggedText(30, "[S]"),
  colorTaggedText(30, "[SS]"),
  colorTaggedText(31, "[SSS]")
];

function buildDevelopmentRankText(actor, developmentRate) {
  const noneStatus = `皆無`;
  if (!actor.isLearnedSkill(H_EXPOSURE_SKILL_ID)) {
    const noneLabel = colorTaggedText(1, noneStatus);
    return `:${noneLabel}\n`;
  };

  const hRank = readDevelopmentRank(developmentRate);
  if (hRank < 1) return `${DEVELOPMENT_RANK_LABELS[hRank]}\n`;

  const rankSkillName = $dataSkills[hRank + 60].name;
  const rankSkillLabel = colorTaggedText(27, `<${rankSkillName}>`);
  return `${DEVELOPMENT_RANK_LABELS[hRank]}:${rankSkillLabel}\n`;
}

//発展度からランク(0-9)を求める。100ごとに1ランク。
function readDevelopmentRank(developmentRate) {
  let hRank = 0;
  for (let rank = 1; rank <= 9; rank++) {
    if (developmentRate >= rank * H_EXPOSURE_RANK_STEP + 1) hRank = rank;
  };
  return hRank;
}

//[51..59] のような開発度スキルの連番リスト。
function buildHSkillRange(firstSkillId, lastSkillId) {
  const skillIds = [];
  for (let skillId = firstSkillId; skillId <= lastSkillId; skillId++) skillIds.push(skillId);
  return skillIds;
}

//1つの開発度スキルぶんの「名前+ランク+使用回数+説明」行。
function buildHSkillStatusLine(actor, skillId) {
  const skill = $dataSkills[skillId];
  const masteryLevel = actor.skillMasteryLevel(skillId);

  if (!actor.isLearnedSkill(skillId)) {
    const undevelopedLabel = colorTaggedText(1, `未開発`);
    return `${skill.name}:${undevelopedLabel}\n`;
  };

  let skillLineText = `${skill.name}${masteryRankLabel(masteryLevel)}`;
  if (isHSkillRankLimited(actor, skillId, masteryLevel)) {
    skillLineText += `[ランク制限]`;
  };

  skillLineText += `(${actor.skillMasteryUses(skillId)}/${actor.skillMasteryUsageMax(skillId)}):`;
  return skillLineText + `${skill.meta['RankSetWord' + masteryLevel]}\n`;
}

//抑制スキルの効果で、このスキルのランク上昇が止まっているか。
function isHSkillRankLimited(actor, skillId, masteryLevel) {
  for (const suppressionSkillId of valueHstaSuppression) {
    if (!actor.isLearnedSkill(suppressionSkillId)) continue;

    const suppressionMeta = $dataSkills[suppressionSkillId].meta;
    const hideIfLearnedSkillId = Number(suppressionMeta['Hide if Learned Skill']);
    if (actor.isLearnedSkill(hideIfLearnedSkillId)) continue;

    const suppressionParams = suppressionMeta['HstaSuppression'].split(',');
    const suppressionTarget = Number(suppressionParams[0]);
    const suppressionParam = Number(suppressionParams[1]);

    if (suppressionTarget == 0) {
      //対象0は431-439の開発度をまとめて判定
      for (let targetVarId = VAR_SUPPRESSION_TARGET_FIRST; targetVarId <= VAR_SUPPRESSION_TARGET_LAST; targetVarId++) {
        if (targetVarId - HSTATE_ARRAY_VAR_OFFSET != suppressionSkillId) continue;
        if (masteryLevel == suppressionParam) return true;
      };
      continue;
    }

    if (suppressionTarget - HSTATE_ARRAY_VAR_OFFSET == suppressionSkillId && masteryLevel == suppressionParam) {
      return true;
    }
  };
  return false;
}

//☆☆アクター変数20のＨステータス表示1
actor_Hstateshyouji1 = function () {

  const isCompactDisplay = !$gameSwitches.value(SW_COMPACT_H_STATUS)
    && !$gameSwitches.value(SW_BATTLE_RECORD_VISIBLE)
    && $gameVariables.value(VAR_H_PICTURE_NAME) == 0;
  const windowYOffset = isCompactDisplay ? 128 : 0;
  if (isCompactDisplay) { $gameVariables.setValue(313, 128); };

  WindowManager.show(1, windowYOffset, 200, 379, 390);
  WindowManager.show(2, 379 + windowYOffset, 200, 389, 390);

  const actorId = $gameVariables.value(VAR_CURRENT_ACTOR_ID);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;

  const hStateValues = readHStateValues(actorId);
  fillHStateWordSets();

  WindowManager.drawText(1, buildHStateCountColumn(hStateValues, HSTATE_WINDOW_COLUMN_A));
  WindowManager.drawText(2, buildHStateCountColumn(hStateValues, HSTATE_WINDOW_COLUMN_B));

  if ($gameSwitches.value(SW_BATTLE_RECORD_VISIBLE)) return;

  const masteryWindowY = isCompactDisplay ? 430 + 128 : 430;
  WindowManager.show(3, masteryWindowY, 0, 338, 202);
  WindowManager.drawText(3, buildMasteryGridText(actor));

};

//valueWordSet1-40 に各Hステータスの「+n」表示を書き込む(後の行整形で使う)。
function fillHStateWordSets() {
  for (let index = 1; index <= 40; index++) {
    const statValue = $gameVariables.value(400 + index);
    window['valueWordSet' + index] = statValue >= 1 ? colorTaggedText(2, `+${statValue}`) : '　';
  };
}

//指定した並びのHステータスを「名前+回数+上昇値」の行にする。
function buildHStateCountColumn(hStateValues, indexes) {
  let displayText = `\\fs[24]`;
  for (const index of indexes) {
    const statName = $dataSystem.variables[400 + index];
    const statNameLabel = colorTaggedText(27, statName);
    displayText += `${statNameLabel}${hStateValues[index]}${HSTATE_COUNT_WORD}${window['valueWordSet' + index]}\n`;
  };
  return displayText;
}

//開発度スキル51-59のマス目表示(アイコン+ランク+使用回数)。
function buildMasteryGridText(actor) {
  const masteryTextBySlot = [];
  for (const skillId of buildHSkillRange(SKILL_H_DEV_FIRST, SKILL_H_DEV_LAST)) {
    const masteryLevel = actor.skillMasteryLevel(skillId);
    if (masteryLevel >= 1 && actor.isLearnedSkill(skillId)) {
      const iconMarker = `\x1bI[${$dataSkills[skillId].iconIndex}]`;
      const rankLabel = masteryRankLabel(masteryLevel);
      masteryTextBySlot[skillId - 50] = `${iconMarker}${rankLabel}:${actor.skillMasteryUses(skillId)}${window['valueWordSet' + (skillId - 20)]}`;
      continue;
    }
    masteryTextBySlot[skillId - 50] = `${colorTaggedText(1, `未開発`)}\\I[0] `;
  };

  const masteryGridHeader = FONT_SIZE_22 + `[開発度]` + `\\I[0]`;
  return masteryGridHeader + `${masteryTextBySlot[1]}\n${masteryTextBySlot[2]} ${masteryTextBySlot[3]}\n${masteryTextBySlot[4]} ${masteryTextBySlot[5]}\n${masteryTextBySlot[6]} ${masteryTextBySlot[7]}\n${masteryTextBySlot[8]} ${masteryTextBySlot[9]}`;
}

//MVP計算用
const MVP_RECORD_SOURCES = [
  { mvpIndex: 1, read: (actor) => actor.getAllKillEnemyCounter() },
  { mvpIndex: 2, read: (actor) => actor.attackDamageMax },
  { mvpIndex: 3, read: (actor) => actor.attackDamageSum },
  { mvpIndex: 4, read: (actor, actorId, var351, var298) => var351[actorId] },
  { mvpIndex: 5, read: (actor) => actor.acceptDamageMax },
  { mvpIndex: 6, read: (actor) => actor.acceptDamageSum },
  { mvpIndex: 7, read: (actor) => actor.deadCounter },
  { mvpIndex: 8, read: (actor, actorId, var351, var298) => var298[actorId] }
];

battlerecord_mvp = function (unusedParam) {

  const partyMembers = $gameParty.members();
  if (partyMembers.length === 0) return;

  const skillAcquisitionSequence = $gameVariables.value(VAR_BATTLE_KILL);
  const damageRecordValues = $gameVariables.value(VAR_BATTLE_DAMAGE);
  const mvp = $gameVariables.value(VAR_BATTLE_MVP);

  const mvpCandidates = MVP_RECORD_SOURCES.map(() => []);
  for (const member of partyMembers) {
    const actorId = member.actorId();
    const actor = $gameActors.actor(actorId);
    for (let sourceIndex = 0; sourceIndex < MVP_RECORD_SOURCES.length; sourceIndex++) {
      mvpCandidates[sourceIndex].push(
        MVP_RECORD_SOURCES[sourceIndex].read(actor, actorId, skillAcquisitionSequence, damageRecordValues));
    };
  };

  for (let sourceIndex = 0; sourceIndex < MVP_RECORD_SOURCES.length; sourceIndex++) {
    const { mvpIndex } = MVP_RECORD_SOURCES[sourceIndex];
    mvp[mvpIndex] = Math.max.apply(null, mvpCandidates[sourceIndex]);
  };

};

//☆☆アクター変数20の通常ステータス表示,0と4ウィンド使用
actor_stateshyouji = function () {
  const actorId = $gameVariables.value(VAR_CURRENT_ACTOR_ID);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;

  updateActorHStateDisplayActorStateshyouji(actor, actorId);
  displayBattleRecordActorStateshyouji(actor, actorId);
  displaySkillRecordActorStateshyouji(actor);
};

// Process MVP indicators for battle statistics
function setupMvpIndicatorActorStateshyouji(value, actorValue, isMvp) {
  if (value === 0) return '';
  if (value !== actorValue) return '';
  return isMvp ? colorTaggedText(17, '[MVP!]') : colorTaggedText(10, '[WORST…]');
}

function updateActorHStateDisplayActorStateshyouji(actor, actorId) {
  const isCompactDisplay = !$gameSwitches.value(SW_COMPACT_H_STATUS)
    && !$gameSwitches.value(SW_BATTLE_RECORD_VISIBLE)
    && $gameVariables.value(VAR_H_PICTURE_NAME) === 0;
  const windowYOffset = isCompactDisplay ? 128 : 0;
  WindowManager.show(0, windowYOffset, 0, 430, 202);

  const targetActorId = actorId || actor.actorId();
  seiyoku_jougenn1(actor);

  const actorStateValues = readHStateValues(targetActorId);
  fillHStateWordSets();
  $gameVariables.setValue(VAR_H_STATE_DISPLAY_TEXT, buildActiveHStateIconText(actor));

  const actorNickname = colorTaggedText(1, actor.nickname());
  let actorInfoText = FONT_SIZE_24 + actorNickname + `\n`;
  actorInfoText += `\x1bSET[${actor.actorId()}]\n`;
  if (isGirl(actor)) {
    actorInfoText += buildGirlHStateText(actor, actorStateValues);
    actorInfoText += `\\V[${VAR_H_STATE_DISPLAY_TEXT}]`;
  }
  WindowManager.drawText(0, actorInfoText);
}

//現在付与されているHステートをアイコンで並べた文字列。
function buildActiveHStateIconText(actor) {
  let iconText = `\\I[16]`;
  for (const stateId of valueHstateDisplay) {
    if (!actor.isStateAffected(stateId)) continue;
    iconText += `\\I[${$dataStates[stateId].iconIndex}]`;
  };
  return iconText;
}

//変数名(ゲーム内の表示名)を色付きラベルにする。
function buildVariableNameLabel(varId) {
  return colorTaggedText(27, $dataSystem.variables[varId]);
}

//女性アクターの性欲度・発情値などの1ブロック。
function buildGirlHStateText(actor, actorStateValues) {
  const firstPartnerText = actorStateValues[0] === 0 ? ` ` : `<${actorStateValues[0]}>`;
  const arousalLabel = buildVariableNameLabel(VAR_HSTATE_ECSTASY_BASE + 1);
  const estrusLabel = buildVariableNameLabel(VAR_HSTATE_ECSTASY_BASE + 2);
  const fertilityLabel = buildVariableNameLabel(VAR_HSTATE_ECSTASY_BASE + 3);
  const exposureLabel = buildVariableNameLabel(VAR_HSTATE_ECSTASY_BASE + 4);
  let actorInfoText = ``;

  actorInfoText += `${arousalLabel}${actorStateValues[1]}${firstPartnerText}${window['valueWordSet' + 1]}`;
  actorInfoText += `${estrusLabel}${actorStateValues[2]}${window['valueWordSet' + 2]}\n`;
  actorInfoText += `${exposureLabel}${actorStateValues[4]}<${actorStateValues[5]}>`;

  if (actor.isLearnedSkill(SKILL_H_SKILLED)) {
    actorInfoText += `${fertilityLabel}${actorStateValues[3]}%　\n`;
  } else {
    actorInfoText += `${fertilityLabel}───%　\n`;
  }
  return actorInfoText;
}

function displayBattleRecordActorStateshyouji(actor, actorId) {
  if (!$gameSwitches.value(SW_BATTLE_RECORD_VISIBLE)) return;

  const totalKillValue = $gameVariables.value(VAR_BATTLE_KILL)[actorId];
  const totalDamageValue = $gameVariables.value(VAR_BATTLE_DAMAGE)[actorId];
  const mvpStats = $gameVariables.value(VAR_BATTLE_MVP);

  // OverKill は与ダメージ配列/2 を記録している
  const mvpRows = [
    { value: mvpStats[1], actorValue: actor.getAllKillEnemyCounter(), isMvp: true },
    { value: mvpStats[2], actorValue: actor.attackDamageMax, isMvp: true },
    { value: mvpStats[3], actorValue: actor.attackDamageSum, isMvp: true },
    { value: mvpStats[8], actorValue: totalDamageValue, isMvp: true },
    { value: mvpStats[4], actorValue: totalKillValue / 2, isMvp: true },
    { value: mvpStats[5], actorValue: actor.acceptDamageMax, isMvp: true },
    { value: mvpStats[6], actorValue: actor.acceptDamageSum, isMvp: true },
    { value: mvpStats[7], actorValue: actor.deadCounter, isMvp: false }
  ];
  const mvpIndicators = mvpRows.map((row) => setupMvpIndicatorActorStateshyouji(row.value, row.actorValue, row.isMvp));

  const battleRecordText = buildBattleRecordText(mvpRows, mvpIndicators);
  WindowManager.show(1, 0, 200, 500, 389);
  WindowManager.drawText(1, battleRecordText);
}

//戦闘記録の各行(ラベル/色/値の取得元)。値は mvpRows の同じ並びを使う。
const BATTLE_RECORD_ROWS = [
  { label: 'TotalKill  :', colorCode: 10, rowIndex: 0 },
  { label: 'MaxAssalt  :', colorCode: 10, rowIndex: 1 },
  { label: 'TotalAssalt:', colorCode: 10, rowIndex: 2 },
  { label: 'Critical   :', colorCode: 10, rowIndex: 3 },
  { label: 'OverKill   :', colorCode: 10, rowIndex: 4 },
  { label: 'MaxDamage  :', colorCode: 1, rowIndex: 5 },
  { label: 'TotalDamage:', colorCode: 1, rowIndex: 6 },
  { label: 'Defead     :', colorCode: 1, rowIndex: 7 }
];

//戦闘記録ウィンドウの本文。
function buildBattleRecordText(mvpRows, mvpIndicators) {
  const headerLine = colorTaggedText(16, `<Battle Record!>`) + '\n';
  const recordLines = BATTLE_RECORD_ROWS.map((row) => buildBattleRecordLine(row,
    mvpRows[row.rowIndex].actorValue, mvpIndicators[row.rowIndex]));
  return headerLine + recordLines.join('');
}

//「ラベル + 色付き数値 + MVP/ワースト印」の1行。
function buildBattleRecordLine(recordRow, recordValue, mvpIndicator) {
  return `${recordRow.label}${colorTaggedText(recordRow.colorCode, recordValue)}${mvpIndicator}` + '\n';
}

// New function to display the skill record
const SKILL_RECORD_STYPE_KEYS = {
  2: 'attack', 5: 'sAbility', 6: 'aAbility', 7: 'wAbility', 8: 'rAbility', 12: 'burst', 13: 'chain'
};

//スキル記録の各行(ラベルと集計キー)。
const SKILL_RECORD_ROWS = [
  { label: 'Attack   :', usageKey: 'attack' },
  { label: 'S-Ability:', usageKey: 'sAbility' },
  { label: 'A-Ability:', usageKey: 'aAbility' },
  { label: 'W-Ability:', usageKey: 'wAbility' },
  { label: 'R-Ability:', usageKey: 'rAbility' },
  { label: 'Burst!   :', usageKey: 'burst' },
  { label: 'Chain!   :', usageKey: 'chain' }
];

//スキル記録ウィンドウの本文。
function buildSkillRecordText(usageTotals) {
  const headerLine = colorTaggedText(16, `<Skill Record!>`) + '\n';
  const recordLines = SKILL_RECORD_ROWS.map((row) => `${row.label}${usageTotals[row.usageKey]}` + '\n');
  return headerLine + recordLines.join('');
}

function displaySkillRecordActorStateshyouji(actor) {
  const usageTotals = { attack: 0, sAbility: 0, aAbility: 0, wAbility: 0, rAbility: 0, burst: 0, chain: 0 };

  for (let skillId = 1; skillId <= $dataSkills.length - 1; skillId++) {
    const skill = $dataSkills[skillId];
    if (!skill || skill.name === '') continue; // Skip skills with empty names

    const usageKey = SKILL_RECORD_STYPE_KEYS[skill.stypeId];
    if (!usageKey) continue;

    usageTotals[usageKey] += actor.getSkillUseCounter(skillId);
  }

  const skillRecordText = buildSkillRecordText(usageTotals);

  WindowManager.show(2, 500, 200, 268, 389);
  WindowManager.drawText(2, skillRecordText);

  if (!$gameSwitches.value(SW_BATTLE_RECORD_VISIBLE)) return;

  WindowManager.show(4, 430, 0, 340, 202);
  hstates_heights($gameVariables.value(VAR_CURRENT_ACTOR_ID), 253);
  WindowManager.drawText(4, `\\V[253]`);
}

//---------------------------------------------------------------------------
// Derived H values: libido cap, exposure limit / current exposure, pregnancy
//---------------------------------------------------------------------------

//☆☆性欲度上限計算。露出計算時とＨプロフ表示時に一緒にやっておく
seiyoku_jougenn = function () {
  seiyoku_jougenn1(currentHStateActor());
};

seiyoku_jougenn1 = function (gameActor) {

  if (!gameActor) return;

  const actorSuppressionValues = readHStateValues(gameActor.actorId());
  actorSuppressionValues[HSTATE_INDEX_AROUSAL_CAP] = 0;

  for (const requiredSkillId of valueHstaSuppression) {
    if (!gameActor.isLearnedSkill(requiredSkillId)) continue;

    const suppressionSkill = $dataSkills[requiredSkillId];
    const hideIfLearnedSkillId = suppressionSkill.meta['Hide if Learned Skill'];
    if (hideIfLearnedSkillId && gameActor.isLearnedSkill(Number(hideIfLearnedSkillId))) continue;

    const suppressionParamsRaw = suppressionSkill.meta['HstaSuppression'];
    if (!suppressionParamsRaw) continue;

    const suppressionParams = suppressionParamsRaw.split(',');
    const suppressionType = Number(suppressionParams[0]);
    if (suppressionType != 0 && suppressionType != 401) continue;//上限そのものを下げる指定だけ扱う

    const suppressionThreshold = Number(suppressionParams[1]) * H_EXPOSURE_RANK_STEP;
    if (actorSuppressionValues[HSTATE_INDEX_AROUSAL_CAP] == 0
      || suppressionThreshold <= actorSuppressionValues[HSTATE_INDEX_AROUSAL_CAP]) {
      actorSuppressionValues[HSTATE_INDEX_AROUSAL_CAP] = suppressionThreshold - 1;
    }
  }

};

//☆☆限界露出値計算
rosyutu_genkai = function () {
  rosyutu_genkai1(currentHStateActor());
};

//露出開発度(スキル55)のランク別上限値を計算して配列と変数へ入れる。
rosyutu_genkai1 = function (gameActor) {

  if (!gameActor) return;
  const exposureLimit = EXPOSURE_LIMIT_BY_RANK[Math.min(gameActor.skillMasteryLevel(SKILL_H_EXPOSURE), 6)];

  $gameVariables.setValue(VAR_HSTATE_EXPOSURE_LIMIT, exposureLimit);
  readHStateValues(gameActor.actorId())[HSTATE_INDEX_EXPOSURE_LIMIT] = exposureLimit;
  $gameVariables.setValue(VAR_HSTATE_EXPOSURE_LIMIT, 0);

  seiyoku_jougenn1(gameActor);

};

//露出開発度のランク別上限値
const EXPOSURE_LIMIT_BY_RANK = [100, 90, 70, 50, 30, 10, 0];

//☆☆現在露出度計上
rosyutu_genzai = function () {
  rosyutu_genzai1($gameVariables.value(VAR_CURRENT_ACTOR_ID));
};

rosyutu_genzai1 = function (actorId) {

  $gameVariables.setValue(VAR_HSTATE_CURRENT_EXPOSURE, 0);
  const exposureTotal = sumWornClothExposure(actorId);

  $gameVariables.setValue(VAR_HSTATE_CURRENT_EXPOSURE, exposureTotal);
  readHStateValues(actorId)[HSTATE_INDEX_EXPOSURE] = exposureTotal;
  $gameVariables.setValue(VAR_HSTATE_CURRENT_EXPOSURE, 0);
};

//着用中の衣装(衣装スイッチが一致するもの)の露出度合計。
function sumWornClothExposure(actorId) {
  const actorEicSwitchId1 = actorId + 180;
  const actorEicSwitchId2 = actorId + HSTATE_ARRAY_VAR_OFFSET;
  let exposureTotal = 0;

  for (let itemId = EXPOSURE_ITEM_SCAN_FIRST; itemId < $dataItems.length; itemId++) {
    const item = $dataItems[itemId];
    //BUGFIX: アイテム配列に穴があるとmeta参照で落ちていた
    if (!item) continue;

    const itemMeta = item.meta;
    if (itemMeta['TotalCloth']) continue;//統合衣装は別計算

    //着用者(EICSwitch)が本人か共通(200)の物だけ対象
    const eicSwitchId = Number(itemMeta['EICSwitch']);
    if (eicSwitchId !== actorEicSwitchId1 && eicSwitchId !== actorEicSwitchId2 && eicSwitchId !== EIC_SWITCH_SHARED_ACTOR) continue;

    const clothSwitchVarId = Number(itemMeta['ClothSwitch']) + CLOTH_SWITCH_VAR_OFFSET;
    if (clothSwitchVarId < CLOTH_SWITCH_VAR_ID_MIN || clothSwitchVarId > CLOTH_SWITCH_VAR_ID_MAX) continue;
    if ($gameVariables.value(clothSwitchVarId) !== Number(itemMeta['ClothAllocationNumber'])) continue;

    exposureTotal += Number(itemMeta['ClothUncoverCount']);
  }

  return exposureTotal;
}

//受精するかどうかの計算
jusei_keisan = function () {

  const fertilizationBase = 11;
  const actorId = $gameVariables.value(VAR_CURRENT_ACTOR_ID);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;
  if (actor.isStateAffected(STATE_PREGNANT) || !actor.isLearnedSkill(SKILL_H_SKILLED)) return;
  if (!($gameVariables.value(VAR_HSTATE_ECSTASY_BASE + fertilizationBase) >= 1)) return;

  const fertilizationRate = readHStateValues(actorId)[HSTATE_INDEX_FERTILITY];
  if (!(fertilizationRate >= 1)) return;

  const battleSkills = actor.battleSkillsRaw();
  if (!isFertilizationAccepted(actor, battleSkills, fertilizationRate)) return;
  if (isFertilizationRepelled(actor, battleSkills)) {
    showFertilizationRepelledMessage(actor);
    return;
  };

  actor.addState(STATE_FERTILIZED);
  recordPregnancyPartner(actorId);
};

//受精判定(乱数)。スキル/ステートで強制・無効化される。
function isFertilizationAccepted(actor, battleSkills, fertilizationRate) {
  const fertilizationRoll = getRandomIndex(101);
  if (fertilizationRate >= fertilizationRoll) return true;
  if (battleSkills.includes(873)) return true;
  return actor.isStateAffected(75);
}

//受精を退けるスキル/ステートか。
function isFertilizationRepelled(actor, battleSkills) {
  return battleSkills.includes(874) || actor.isStateAffected(76);
}

function showFertilizationRepelledMessage(actor) {
  const skillName = colorTaggedText(27, $dataSkills[874].name);
  const actorName = actor.name();
  CommonPopupManager.showInfo({}, `${actorName}は${skillName}の効果により受精を退けた。`, null);
}

//妊娠相手(101-200のスロット)を記録する。
function recordPregnancyPartner(actorId) {
  const partnerWeaponId = $gameVariables.value(VAR_PARTNER_WEAPON_ID);
  if (partnerWeaponId < 1) return;

  const pregnancyPartnerSlot = partnerWeaponId - PARTNER_CHILD_SLOT_OFFSET;//101-200の間
  readPartnerRecords(actorId)[pregnancyPartnerSlot] += 1;
}

//受精してるキャラ以外の受精相手記録を消滅
jusei_clear = function () {

  const heroineIds = $gameVariables.value(VAR_HEROINE_ID_ARRAY);
  if (!heroineIds) return;

  for (const actorId of heroineIds) {
    $gameVariables.setValue(VAR_CURRENT_ACTOR_ID, actorId);
    if (!clearActorFertilization(actorId)) continue;
  };

};

//1人分の受精記録を消す。妊娠中なら何もしない(falseを返す)
function clearActorFertilization(actorId) {
  const actor = $gameActors.actor(actorId);
  if (!actor) return false;

  actor.removeState(STATE_FERTILIZED);//受精前段階ステート消滅
  if (actor.isStateAffected(STATE_BIRTHED)) return false;

  const partnerHRecords = readPartnerRecords(actorId);
  for (let slot = PARTNER_RECORD_SLOT_FIRST_INDEX; slot <= PARTNER_RECORD_SLOT_LAST_INDEX; slot++) {
    if (partnerHRecords[slot] >= 1) {
      partnerHRecords[slot] = 0;
    };
  };
  return true;
}


//☆☆Ｈステのうち、身長等
const CUP_SIZE_LABELS = [`AAAAA`, `AAAA`, `AAA`, `AA`, `A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`];
const CUP_SIZE_STEP = 2.5;               //カップサイズの刻み

hstates_heights = function (id, resultVarId) {

  const gameActor = $gameActors.actor(id);
  if (!gameActor || !isGirl(gameActor)) {
    $gameVariables.setValue(resultVarId, readBodyStyleLabelText($dataActors[id]));
    return;
  };

  const actorData = $dataActors[id];
  if (!actorData || !actorData.meta['HeightEtc']) return;

  const reproductionRate = gameActor.elementRate(ELEMENT_REPRODUCTION);
  const reproductionLabel = reproductionRate >= 1.1
    ? FONT_SIZE_25 + `Reproduction:${Math.round(reproductionRate)}%`
    : ``;

  const heightEtc = actorData.meta['HeightEtc'].split(',');
  const bodySize = {
    heightCm: Number(heightEtc[0]),   //身長
    weightKg: Number(heightEtc[1]),   //体重
    bustCm: Number(heightEtc[2]),     //バスト
    waistCm: Number(heightEtc[3]),    //ウェスト
    hipCm: Number(heightEtc[4])       //ヒップ
  };

  const physiqueChangeCount = applyPhysiqueSkillBonuses(gameActor, bodySize);
  applyPregnancySwell(id, bodySize);

  const hStateValues = readHStateValues(id);
  const cupSize = computeCupSizeLabel(bodySize.bustCm, bodySize.heightCm, bodySize.waistCm);
  const bodyStyleLabel = readBodyStyleLabel(id, actorData, physiqueChangeCount);

  const virginLabel = readVirginLabel(hStateValues[HSTATE_INDEX_SEX_COUNT]);
  $gameVariables.setValue(resultVarId,
    buildHeightEtcText(bodySize, cupSize, bodyStyleLabel, virginLabel, reproductionLabel));

  writeBodySizeToHState(hStateValues, bodySize, cupSize);

};

//体型データの表示ブロック。数値とタグだけなので翻訳対象の文章は無い。
function buildHeightEtcText(bodySize, cupSize, bodyStyleLabel, virginLabel, reproductionLabel) {
  return `\\fs[25]\\C[16]HT:\\C[0]${bodySize.heightCm}\\C[16]cm\\C[0]　\\C[16]WT:\\C[0]${bodySize.weightKg}\\C[16]kg\\C[0]
\\C[16]Cup:\\C[0][${cupSize}] \\C[16]B:\\C[0]${bodySize.bustCm} \\C[16]W:\\C[0]${bodySize.waistCm} \\C[16]H:\\C[0]${bodySize.hipCm}
${bodyStyleLabel}
${virginLabel}
${reproductionLabel}`;
}

//計算結果をHステート配列(51-56)へ保存する。
function writeBodySizeToHState(hStateValues, bodySize, cupSize) {
  hStateValues[HSTATE_INDEX_HEIGHT] = bodySize.heightCm;
  hStateValues[HSTATE_INDEX_WEIGHT] = bodySize.weightKg;
  hStateValues[HSTATE_INDEX_BUST] = bodySize.bustCm;
  hStateValues[HSTATE_INDEX_WAIST] = bodySize.waistCm;
  hStateValues[HSTATE_INDEX_HIP] = bodySize.hipCm;
  hStateValues[HSTATE_INDEX_CUP] = cupSize;
}

//女性でない/データが無い場合の体型ラベル
function readBodyStyleLabelText(actorData) {
  if (actorData && actorData.meta['BodyStyle']) {
    return colorTaggedText(21, `[${actorData.meta['BodyStyle']}]`);
  }
  return `NoData`;
}

//体型変化スキル(valuePhysiquUp)の補正を加算し、変化した項目数を返す。
function applyPhysiqueSkillBonuses(gameActor, bodySize) {
  const physiqueSkills = gameActor.battleSkillsRaw();
  let physiqueChangeCount = 0;//体型変化による影響数値

  for (const physiqueSkillId of valuePhysiquUp) {
    const physiqueSkill = $dataSkills[physiqueSkillId];
    //BUGFIX: スキルIDが存在しない場合にmeta参照で落ちていた
    if (!physiqueSkill) continue;
    if (!physiqueSkills.includes(physiqueSkillId)) continue;

    const physiqueMeta = physiqueSkill.meta;
    if (physiqueMeta['BodyWeightChange']) {
      bodySize.weightKg += Number(physiqueMeta['BodyWeightChange']);
      physiqueChangeCount += 1;
    };
    if (physiqueMeta['BustSizeChange']) {
      bodySize.bustCm += Number(physiqueMeta['BustSizeChange']);
      physiqueChangeCount += 1;
    };
    if (physiqueMeta['WaistSizeChange']) {
      bodySize.waistCm += Number(physiqueMeta['WaistSizeChange']);
      physiqueChangeCount += 1;
    };
    if (physiqueMeta['HipSizeChange']) {
      bodySize.hipCm += Number(physiqueMeta['HipSizeChange']);
      physiqueChangeCount += 1;
    };
  };
  return physiqueChangeCount;
}

//妊娠時の増加(配列42-45)を体型に反映する。
function applyPregnancySwell(actorId, bodySize) {
  const hStateValues = readHStateValues(actorId);
  bodySize.weightKg += hStateValues[HSTATE_INDEX_PREGNANCY_SWELL];
  bodySize.bustCm += hStateValues[HSTATE_INDEX_PREGNANCY_SWELL + 1];
  bodySize.waistCm += hStateValues[HSTATE_INDEX_PREGNANCY_SWELL + 2];
  bodySize.hipCm += hStateValues[HSTATE_INDEX_PREGNANCY_SWELL + 3];
}

//カップサイズ測定。2.5刻みでA～T、表の範囲外は「──」。
function computeCupSizeLabel(bustCm, heightCm, waistCm) {
  const cupSizeValue = (bustCm - (heightCm * 0.435 - (heightCm * 0.38 - waistCm))) + 2;//最後に+2を独自挿入
  const cupIndex = Math.max(1, Math.floor(cupSizeValue / CUP_SIZE_STEP) + 1);
  return cupIndex > CUP_SIZE_LABELS.length ? `──` : CUP_SIZE_LABELS[cupIndex - 1];
}

//アイテム名(存在しないIDでは空文字。元コードは落ちていた)
function readItemName(itemId) {
  const item = $dataItems[itemId];
  return item ? item.name : ``;
}

//体型変化の段階に応じたスタイルラベル。メインキャラの時は変数611/612も更新する。
function readBodyStyleLabel(actorId, actorData, physiqueChangeCount) {
  if (!actorData.meta['BodyStyle']) return ``;

  const physiqueUpCount = valuePhysiquUp.length;
  if (physiqueChangeCount >= physiqueUpCount * 2) {
    if (actorId == $gameVariables.value(VAR_MAIN_ACTOR_ID)) {
      $gameVariables.setValue(VAR_PHYSIQUE_VAR_SECOND, physiqueUpCount * 2);
    };
    return colorTaggedText(27, `[${readItemName(742)}]`);
  };
  if (physiqueChangeCount >= physiqueUpCount) {
    if (actorId == $gameVariables.value(VAR_MAIN_ACTOR_ID)) {
      $gameVariables.setValue(VAR_PHYSIQUE_VAR_FIRST, physiqueUpCount);
    };
    return colorTaggedText(27, `[${readItemName(741)}]`);
  };
  if (physiqueChangeCount >= physiqueUpCount / 2) {
    return colorTaggedText(21, `[${actorData.meta['BodyStyle']}]`);
  };
  return ``;
}

//性交回数に応じた処女/非処女ラベル。
function readVirginLabel(sexCount) {
  if (sexCount >= 1000) return colorTaggedText(30, `[中古]`);
  if (sexCount >= 100) return colorTaggedText(31, `[中古ヒロイン]`);
  if (sexCount >= 1) return colorTaggedText(0, `[非処女ヒロイン]`);
  return colorTaggedText(27, `[処女ヒロイン]`);
}

//---------------------------------------------------------------------------
// H passive skill learning
//---------------------------------------------------------------------------
const H_PASSIVE_PAGE_HEADER = `\\FS[28]` + colorTaggedText(10, `<` + `H-Passive Expression!` + `>`) + `\\FS[25]\n`;
const H_PASSIVE_PAGE_LINES = 6;
const H_PASSIVE_PREFIX = colorTaggedText(2, `H-Passive`) + `\\C[27]`;
const PREMISE_ENTRY_COUNT = 3;           // PremiseSkill1-3 等の個数
const PREMISE_SKILL_ID_DEFAULT = 407;    // 前提スキル未指定時の既定値
const PREMISE_VAR_ID_DEFAULT = 2;

//1つの前提条件の組(スキル/ランク/変数/配列)を読む。
function readHSkillPremise(skillMeta) {
  const premise = { skillIds: [], rankSkillIds: [], rankThresholds: [], varIds: [], varThresholds: [], arrangementIndexes: [], arrangementThresholds: [] };

  for (let entry = 1; entry <= PREMISE_ENTRY_COUNT; entry++) {
    premise.skillIds.push(metaNumberAt(skillMeta, 'PremiseSkill' + entry, undefined, PREMISE_SKILL_ID_DEFAULT));
    premise.rankSkillIds.push(metaNumberAt(skillMeta, 'PremiseSkillRank' + entry, 0, PREMISE_SKILL_ID_DEFAULT));
    premise.rankThresholds.push(metaNumberAt(skillMeta, 'PremiseSkillRank' + entry, 1, 0));
    premise.varIds.push(metaNumberAt(skillMeta, 'PremiseVariable' + entry, 0, PREMISE_VAR_ID_DEFAULT));
    premise.varThresholds.push(metaNumberAt(skillMeta, 'PremiseVariable' + entry, 1, 0));
    premise.arrangementIndexes.push(metaNumberAt(skillMeta, 'PremiseArrangement' + entry, 0, 0));
    premise.arrangementThresholds.push(metaNumberAt(skillMeta, 'PremiseArrangement' + entry, 1, 0));
  };
  return premise;
}

//☆☆Hスキル習得通常パターン
hskill_learn = function (learnModeId) {

  const actorId = $gameVariables.value(VAR_CURRENT_ACTOR_ID);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;

  for (const skillId of valueGetHskillLearn) {
    processHSkillLearnEntry(actor, actorId, skillId, learnModeId);
  };

  if (valueHskillLearnArr.length > 0 && learnModeId == 1) {
    for (const learnedSkillId of valueHskillLearnArr) {
      appendHStateMessage(buildHSkillMessage(learnedSkillId, `RankUp!`), H_PASSIVE_PAGE_LINES, H_PASSIVE_PAGE_HEADER);
    };
  };
  if (learnModeId == 1) {
    hskill_learn2();
  };

};

//1スキルぶんの習得/忘却判定。
function processHSkillLearnEntry(actor, actorId, skillId, learnModeId) {
  const skillMeta = $dataSkills[skillId].meta;
  const isLearned = actor.isLearnedSkill(skillId);
  const shouldLearn = learnModeId == 1 ? !isLearned : (learnModeId == 2 ? isLearned : false);

  if (!shouldLearn) {
    forgetHSkillIfPremiseLost(actor, skillId, skillMeta);
    return;
  };

  $gameVariables.setValue(VAR_HSTATE_SELECTED_VALUE, 0);
  const partnerWeaponId = $gameVariables.value(VAR_PARTNER_WEAPON_ID);
  const partnerHRecords = readPartnerRecords(actorId);
  const hStateValues = readHStateValues(actorId);

  if (partnerWeaponId >= 1) {
    $gameVariables.setValue(VAR_HSTATE_SELECTED_VALUE, partnerHRecords[partnerWeaponId - 300]);
  };
  hStateValues[HSTATE_INDEX_LIBIDO_DRUG] = partnerHRecords[6];//武器ID306の性欲薬使用回数を計上

  if (!isHSkillTargetActor(skillMeta, actorId)) return;

  const premise = readHSkillPremise(skillMeta);
  if (!meetsHSkillPremise(actor, hStateValues, premise)) {
    forgetHSkillOnPremiseFailure(actor, skillId, learnModeId);
    return;
  };

  actor.learnSkill(skillId);
  appendHStateMessage(buildHSkillMessage(skillId, `Expression…`), H_PASSIVE_PAGE_LINES, H_PASSIVE_PAGE_HEADER);
}

//習得対象のアクターか(MainCharaPremise / SkillLearningClass の判定)。
function isHSkillTargetActor(skillMeta, actorId) {
  let mainCharaId = skillMeta['MainCharaPremise'] ? $gameVariables.value(VAR_MAIN_ACTOR_ID) : 0;
  if (skillMeta['SkillLearningClass']) mainCharaId = 100;//あったらここでは習得させない
  return mainCharaId == 0 || mainCharaId == actorId;
}

//前提条件(スキル習得・ランク・変数・配列)をすべて満たしているか。
function meetsHSkillPremise(actor, hStateValues, premise) {
  for (let entry = 0; entry < PREMISE_ENTRY_COUNT; entry++) {
    if (!actor.isLearnedSkill(premise.skillIds[entry])) return false;
    if (!(actor.skillMasteryLevel(premise.rankSkillIds[entry]) >= premise.rankThresholds[entry])) return false;
    if (!($gameVariables.value(premise.varIds[entry]) >= premise.varThresholds[entry])) return false;
    if (!(hStateValues[premise.arrangementIndexes[entry]] >= premise.arrangementThresholds[entry])) return false;
  };
  return true;
}

//前提変数を下回ったスキルを忘却する(リセット時のみ意味がある処理)。
function forgetHSkillIfPremiseLost(actor, skillId, skillMeta) {
  if (!skillMeta['LostHSkill'] || !skillMeta['PremiseVariable1']) return;

  const premiseParams = skillMeta['PremiseVariable1'].split(',');
  const premiseVarId = Number(premiseParams[0]);
  const premiseThreshold = Number(premiseParams[1]);
  if ($gameVariables.value(premiseVarId) < premiseThreshold) {
    actor.forgetSkill(skillId);
  };
}

//リセットモード(2)で前提を満たさなくなったスキルを忘却し、通知する。
function forgetHSkillOnPremiseFailure(actor, skillId, learnModeId) {
  if (learnModeId != 2) return;

  actor.forgetSkill(skillId);
  const skillName = $dataSkills[skillId].name;
  CommonPopupManager.showInfo({}, `──${skillName}忘却…──`, null);
}

//Hパッシブ習得メッセージ。suffixは「Expression…」か「RankUp!」。
function buildHSkillMessage(skillId, suffix) {
  const skillMarker = `${H_PASSIVE_PREFIX}\x1bSIN[${skillId}]\\C[0]`;
  const skillDescription = $dataSkills[skillId].description;
  return `──${skillMarker}${suffix}──\n${skillDescription}\\C[0]\n`;
}

//☆☆Hスキル習得やアイテム入手特殊パターン
hskill_learn2 = function () {

  const actor = currentHStateActor();
  if (!actor) return;

  const exposureRank = actor.skillMasteryLevel(SKILL_H_EXPOSURE);
  const exposureSkillName = $dataSkills[SKILL_H_EXPOSURE].name;

  grantClothItemByExposureRank(actor, exposureSkillName, exposureRank, zenravalueId, 1);//全裸
  grantClothItemByExposureRank(actor, exposureSkillName, exposureRank, clothPartsChoice, 2);//パーツ指定

  //同カテゴリのClothType衣装を1着だけ取得（ランク3: ClothBreakage / ランク4: 改）
  grantClothByType(exposureSkillName, exposureRank, 'ClothBreakage', 3);
  grantClothByType(exposureSkillName, exposureRank, '改', 4);

  releaseClothMenuByExposureRank(exposureSkillName, exposureRank);
  learnAllDevelopmentSkill(actor);
};

//指定ランク到達で衣装アイテムを1個だけ取得する。
function grantClothItemByExposureRank(actor, exposureSkillName, exposureRank, itemId, rankThreshold) {
  const clothItem = $dataItems[itemId];
  if (!clothItem || exposureRank < rankThreshold || $gameParty.hasItem(clothItem)) return;

  $gameParty.gainItem(clothItem, 1);

  const exposureSkill = colorTaggedText(2, exposureSkillName);
  const itemIconName = colorTaggedText(27, `\x1bIIN[${itemId}]`);
  const clothDescription = clothItem.description;
  appendHStateMessage(`──${exposureSkill}が${rankThreshold}到達！　Got ${itemIconName}!──` + `\n${clothDescription}\n`, H_PASSIVE_PAGE_LINES, H_PASSIVE_PAGE_HEADER);
}

//衣装アイテムを種類(subCategory/ClothType)ごとに索引化する。
//$dataItems は読み込み後に増えないので、種類ごとに1回だけ作る。
const clothTypeIndexCache = new Map();

function readClothTypeIndex(clothType) {
  if (clothTypeIndexCache.has(clothType)) return clothTypeIndexCache.get(clothType);

  const indexBySubCategory = new Map();
  for (let itemId = 1; itemId <= $dataItems.length - 1; itemId++) {
    const item = $dataItems[itemId];
    if (!item) continue;

    const itemMeta = item.meta;
    if (!itemMeta['subCategory'] || !itemMeta['ClothType']) continue;
    if (itemMeta['ClothType'] != clothType) continue;
    //候補はアイテムID昇順のまま保持する(元コードの走査順)
    const subCategoryIds = indexBySubCategory.get(itemMeta['subCategory']);
    if (subCategoryIds) { subCategoryIds.push(itemId); continue; }
    indexBySubCategory.set(itemMeta['subCategory'], [itemId]);
  };

  clothTypeIndexCache.set(clothType, indexBySubCategory);
  return indexBySubCategory;
}

//同カテゴリのClothType衣装を1着だけ取得する。
function grantClothByType(exposureSkillName, exposureRank, clothType, rankThreshold) {
  if (exposureRank < rankThreshold) return;

  const indexBySubCategory = readClothTypeIndex(clothType);
  const ownedClothSubCategories = collectOwnedClothSubCategories();

  for (const subCategory of ownedClothSubCategories) {
    const candidateItemIds = indexBySubCategory.get(subCategory);
    if (!candidateItemIds) continue;

    //元コードは「所持済みの候補が出た時点で打ち切る」ので break のまま
    for (const candidateItemId of candidateItemIds) {
      if ($gameParty.hasItem($dataItems[candidateItemId])) break;

      clothes_get($gameVariables.value(VAR_CURRENT_ACTOR_ID), subCategory, clothType);
      appendClothGrantedByTypeMessage(exposureSkillName, rankThreshold, candidateItemId);
      break;
    };
  };
}

//統合衣装(TotalCloth)を持つ所持アイテムの subCategory を重複なく集める。
function collectOwnedClothSubCategories() {
  const subCategories = [];
  const seen = new Set();

  for (let itemId = 1; itemId <= $dataItems.length - 1; itemId++) {
    const item = $dataItems[itemId];
    if (!item) continue;

    const itemMeta = item.meta;
    if (!itemMeta['subCategory'] || !itemMeta['ClothType'] || !itemMeta['TotalCloth']) continue;
    if (!$gameParty.hasItem(item)) continue;
    if (seen.has(itemMeta['subCategory'])) continue;

    seen.add(itemMeta['subCategory']);
    subCategories.push(itemMeta['subCategory']);
  };
  return subCategories;
}

function appendClothGrantedByTypeMessage(exposureSkillName, rankThreshold, candidateItemId) {
  const exposureSkill = colorTaggedText(2, `${exposureSkillName}:Rank${rankThreshold}`);
  const itemIconName = colorTaggedText(27, `\x1bIIN[${candidateItemId}]`);
  appendHStateMessage(`──${exposureSkill}の効果により、Got ${itemIconName}!──` + `\n`, H_PASSIVE_PAGE_LINES, H_PASSIVE_PAGE_HEADER);
}

//露出開発度5でメニューの着せ替えを解放する。
function releaseClothMenuByExposureRank(exposureSkillName, exposureRank) {
  if ($gameSwitches.value(SW_CLOTH_MENU_RELEASED) || exposureRank < 5) return;

  $gameSwitches.setValue(SW_CLOTH_MENU_RELEASED, true);
  const exposureSkill = colorTaggedText(2, exposureSkillName);
  const menuName = colorTaggedText(27, `着せ替え`);
  appendHStateMessage(`──${exposureSkill}が5到達！　メニュー画面に${menuName}出現──` + `\n\n`, H_PASSIVE_PAGE_LINES, H_PASSIVE_PAGE_HEADER);
}

//全開発度6で9種組み合わせスキルを習得する。
function learnAllDevelopmentSkill(actor) {
  if (actor.isLearnedSkill(SKILL_ALL_DEVELOPMENT)) return;

  for (const skillId of buildHSkillRange(SKILL_H_DEV_FIRST, SKILL_H_DEV_LAST)) {
    if (actor.skillMasteryLevel(skillId) < 6) return;
  };

  actor.learnSkill(SKILL_ALL_DEVELOPMENT);
  const devPoints = colorTaggedText(2, `全開発度(経験値)`);
  const skillMarker = `\\C[27]\x1bSIN[${SKILL_ALL_DEVELOPMENT}]\\C[0]`;
  const description = $dataSkills[SKILL_ALL_DEVELOPMENT].description;
  appendHStateMessage(`──${devPoints}\\C[10]Max\\C[0]！　${skillMarker}Expression!──\n${description}\\C[0]\n`, H_PASSIVE_PAGE_LINES, H_PASSIVE_PAGE_HEADER);
}

//☆☆Ｈパッシブ未収得分の条件提示
actor_HpassiveConditions = function (unusedArg1, sourceActor, unusedItemId) {

  if ($gameSwitches.value(SW_H_PASSIVE_WINDOW)) {
    $gameSwitches.setValue(SW_H_PASSIVE_WINDOW, false);
    WindowManager.hide(1);
    return;
  };

  const actor = $gameActors.actor(sourceActor.actorId());
  if (!isGirl(actor)) {
    const actorName = actor.name();
    TickerManager.show(`${actorName}は対象キャラではありません…。`);
    return;
  };

  $gameSwitches.setValue(SW_H_PASSIVE_WINDOW, true);
  const unlearnedSkillText = buildUnlearnedHSkillText(actor);
  if (unlearnedSkillText.unlearnedCount < 1) {
    WindowManager.show(1, 0, 100, 1024, 180);
    WindowManager.drawText(1, `\\C[27]\\fs[28]H-Passive Complete!\\C[0]`);
    return;
  };

  WindowManager.show(1, 0, 0, 1280, unlearnedSkillText.unlearnedCount * 60);
  WindowManager.drawText(1, `\\fs[28]${unlearnedSkillText.unlearnedText}`);

};

//未習得のHパッシブを一覧にする。
function buildUnlearnedHSkillText(actor) {
  const hPassiveLabel = colorTaggedText(27, `<H-Passive>`);
  const actorName = actor.name();
  let unlearnedText = `${actorName}の未収得${hPassiveLabel}` + `\n`;
  let unlearnedCount = 0;

  for (let skillId = 1; skillId <= $dataSkills.length - 1; skillId++) {
    const skill = $dataSkills[skillId];
    if (!skill || !skill.meta['HSkillLearn'] || actor.isLearnedSkill(skillId)) continue;

    unlearnedText += `${colorTaggedText(27, skill.name)}\n`;
    unlearnedText += `${skill.meta['ADDescription']}\n`;
    unlearnedCount += 1;
  };
  return { unlearnedText, unlearnedCount };
}

//☆スキルアイテムステート性経験値補正
hStates_up1 = function (id) {

  const databaseEntries = readHexpDatabase(id);
  if (!databaseEntries) return;

  const actor = currentHStateActor();
  if (!actor) return;

  const battleSkills = actor.battleSkillsRaw();
  const metaList = databaseEntries.metaList;

  for (const entryId of metaList) {
    const entryMeta = databaseEntries.entries[entryId].meta;
    const isBattlingEntry = battleSkills.includes(entryId);

    if (entryMeta['HexpReflectionSkill'] && isBattlingEntry) {
      applyHexpReflection(databaseEntries.entries[entryId], entryMeta);
    };
    if (entryMeta['ProstitutionMoneyUp'] && isBattlingEntry) {
      applyProstitutionMoneyUp(databaseEntries.entries[entryId], entryMeta);
    };
  };

  if (id == 3) {
    grantProstitutionJobExp(actor);
  };

};

//id(1:スキル 2:アイテム 3:ステート)ごとのデータベースとメタ対象一覧。
const HEXP_DATABASE_SETTINGS = {
  1: { database: () => $dataSkills, metaList: () => valueHStatesUp1 },
  2: { database: () => $dataItems, metaList: () => valueHStatesUp2 },
  3: { database: () => $dataStates, metaList: () => valueHStatesUp3 }
};

function readHexpDatabase(id) {
  const settings = HEXP_DATABASE_SETTINGS[id];
  if (!settings) return null;
  return { entries: settings.database(), metaList: settings.metaList() };
}

//HexpReflectionSkill: 変数の値をスキルランクに応じて別の変数へ加算する。
function applyHexpReflection(entry, entryMeta) {
  const activateSwitchId = entryMeta['HexpActivateSwi'] ? Number(entryMeta['HexpActivateSwi']) : 2;
  if (!$gameSwitches.value(activateSwitchId)) return;

  const activateVarId = entryMeta['HexpActivateVal'] ? Number(entryMeta['HexpActivateVal']) : 0;
  if (activateVarId < 1) return;

  const activateValue = $gameVariables.value(activateVarId);
  if (activateValue < 1) return;

  const reflectionSkillId = entryMeta['HexpReflectionSkill'] ? Number(entryMeta['HexpReflectionSkill']) : 0;
  const reflectionVarId = entryMeta['HexpReflectionVal'] ? Number(entryMeta['HexpReflectionVal']) : 0;
  const reflectionSkillRank = entryMeta['HexpReflectionSkillRank'] ? Number(entryMeta['HexpReflectionSkillRank']) : 0;

  const actor = currentHStateActor();
  const reflectionGain = activateValue * actor.skillMasteryLevel(reflectionSkillId) * reflectionSkillRank;
  $gameVariables.setValue(reflectionVarId, $gameVariables.value(reflectionVarId) + reflectionGain);

  const entryName = colorTaggedText(27, `<${entry.name}>`);
  const gainText = colorTaggedText(31, `(+${reflectionGain})`);
  appendHStateMessage(`${entryName}${H_ACTIVATED_WORD}${gainText}\\I[12]\n`, 3);
}

//ProstitutionMoneyUp: 売春額を倍率で増やす。
function applyProstitutionMoneyUp(entry, entryMeta) {
  if ($gameVariables.value(VAR_HSTATE_PROSTITUTION_MONEY) < 1) return;

  const prostitutionMoneyRate = Number(entryMeta['ProstitutionMoneyUp']);
  $gameVariables.setValue(VAR_HSTATE_PROSTITUTION_MONEY,
    $gameVariables.value(VAR_HSTATE_PROSTITUTION_MONEY) * prostitutionMoneyRate);

  const entryName = colorTaggedText(27, `<${entry.name}>`);
  const gainText = colorTaggedText(31, `(×${prostitutionMoneyRate}\\G)`);
  appendHStateMessage(`${entryName}${H_ACTIVATED_WORD}${gainText}\\I[12]\n`, 3);
}

const H_ACTIVATED_WORD = `発動`;

//売春額の一時記憶と、娼婦/奴隷ジョブの経験値取得。
const SUBCLASS_PROSTITUTE = 41;
const SUBCLASS_SLAVE = 42;
const PROSTITUTION_EXP_DIVISOR = 10;

function grantProstitutionJobExp(actor) {
  valueProstitutionMoney = $gameVariables.value(VAR_HSTATE_PROSTITUTION_MONEY);

  if (valueProstitutionMoney >= 1 && actor.subclass() && actor._subclassId == SUBCLASS_PROSTITUTE) {
    const jobExp = Math.ceil(valueProstitutionMoney / PROSTITUTION_EXP_DIVISOR);
    actor.gainExpSubclass(jobExp);
    appendJobExpMessage(SUBCLASS_PROSTITUTE, jobExp);
  };

  if (actor.subclass() && actor._subclassId == SUBCLASS_SLAVE) {
    const slaveExp = sumPendingHStateVariables();
    actor.gainExpSubclass(Math.ceil(slaveExp));
    appendJobExpMessage(SUBCLASS_SLAVE, Math.ceil(slaveExp));
  };
}

//401-440に入っている今回の上昇値を合計する(奴隷ジョブの経験値)。
function sumPendingHStateVariables() {
  let total = 0;
  for (let varId = VAR_HSTATE_PENDING_FIRST; varId <= VAR_HSTATE_PENDING_LAST; varId++) {
    if ($gameVariables.value(varId) >= 1) {
      total += $gameVariables.value(varId);
    };
  };
  return total;
}

function appendJobExpMessage(subclassId, jobExp) {
  const jobName = `\x1bJ[${subclassId}]`;
  const expText = colorTaggedText(31, `${jobExp}`);
  appendHStateMessage(`ジョブ:${colorTaggedText(27, `[${jobName}]`)}に${expText}expを取得\\I[12]\n`, 3);
}

//---------------------------------------------------------------------------
// Libido cap enforcement / suppression display
//---------------------------------------------------------------------------

//☆☆性欲度上限の処理。上限に達していたら上昇値を切り捨てる。
seiyoku_genkai = function () {

  seiyoku_jougenn();

  const actorId = $gameVariables.value(VAR_CURRENT_ACTOR_ID);
  const hStateValues = readHStateValues(actorId);
  const libidoGain = $gameVariables.value(VAR_HSTATE_PENDING_FIRST);

  if (isLibidoCapped(libidoGain, hStateValues)) {
    notifyLibidoSuppressed();
    hStateValues[HSTATE_INDEX_AROUSAL] = hStateValues[HSTATE_INDEX_AROUSAL_CAP];
    $gameVariables.setValue(VAR_HSTATE_PENDING_FIRST, 0);
  };

  if ($gameVariables.value(VAR_HSTATE_AROUSAL) >= 100) {
    hStateValues[HSTATE_INDEX_ESTRUS] = 100;
    $gameVariables.setValue(VAR_HSTATE_AROUSAL, 0);
  };

};

//上昇後の性欲度が上限以上か。
function isLibidoCapped(libidoGain, hStateValues) {
  const libidoAfterGain = libidoGain + hStateValues[HSTATE_INDEX_AROUSAL];
  const arousalCap = hStateValues[HSTATE_INDEX_AROUSAL_CAP];
  return libidoAfterGain >= arousalCap && arousalCap >= 1;
}

//上限到達メッセージ(ティッカーかメッセージ枠か)。
function notifyLibidoSuppressed() {
  const suppressedMessage = `性欲度上限のため、性欲度上昇が抑制された。`;
  if ($gameSwitches.value(SW_TICKER_MESSAGE)) {
    TickerManager.show(suppressedMessage);
    return;
  };
  appendMessageStack(`\n${suppressedMessage}`);
}

//☆☆性欲度以外のランク制限を実施
hstates_rankSeigen = function () {

  const actorId = $gameVariables.value(VAR_CURRENT_ACTOR_ID);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;

  const hStateValues = readHStateValues(actorId);
  let suppressionResult = `　`;

  for (const suppressionSkillId of valueHstaSuppression) {
    const suppressionMeta = $dataSkills[suppressionSkillId].meta;
    if (!actor.isLearnedSkill(suppressionSkillId)) continue;
    if (actor.isLearnedSkill(Number(suppressionMeta['Hide if Learned Skill']))) continue;

    const suppressionParams = suppressionMeta['HstaSuppression'].split(',');
    const suppressionTarget = Number(suppressionParams[0]);
    const suppressionParam = Number(suppressionParams[1]);
    const skillName = `\n${$dataSkills[suppressionSkillId].name}`;
    const suppressionNote = `${skillName}の影響により`;

    const limitedCount = applyRankSuppression(actor, hStateValues, suppressionTarget, suppressionParam, (limitedSkillId) => {
      suppressionResult += `\\C[1][${$dataSkills[limitedSkillId].name}]\\C[0]`;
    });
    if (limitedCount < 1) continue;

    notifyRankSuppressed(suppressionNote + suppressionResult + RANK_SUPPRESSION_SUFFIX);
  };

};

//対象0は開発度431-439をまとめて判定。制限にかかった数を返す。
function applyRankSuppression(actor, hStateValues, suppressionTarget, suppressionParam, onLimited) {
  //431-439 (開発度) をまとめて判定する場合と単体指定の場合
  const targetVarIds = suppressionTarget == 0
    ? VAR_SUPPRESSION_TARGET_IDS
    : [suppressionTarget];
  let limitedCount = 0;

  for (const targetVarId of targetVarIds) {
    if (!($gameVariables.value(targetVarId) >= 1)) continue;
    if (actor.skillMasteryLevel(targetVarId - 380) != suppressionParam) continue;

    const usageTotal = $gameVariables.value(targetVarId) + hStateValues[targetVarId - VAR_HSTATE_PENDING_FIRST];
    if (!(usageTotal >= actor.skillMasteryUsageMax(targetVarId - 380))) continue;

    $gameVariables.setValue(targetVarId, 0);
    onLimited(targetVarId - 380);
    limitedCount += 1;
  };
  return limitedCount;
}

function notifyRankSuppressed(suppressionMessage) {
  if ($gameSwitches.value(SW_H_SCENE_SIMPLE)) {
    TickerManager.show(suppressionMessage);
    return;
  };
  appendMessageStack(suppressionMessage);
}

//☆☆性欲上昇簡易表示
seiyoku_kanniHyouji = function () {

  const useTicker = $gameSwitches.value(SW_TICKER_MESSAGE);
  if (!useTicker) {
    valueWordSet0 = `${$gameVariables.value(VAR_MESSAGE_STACK)}\n`;
  };

  const actorId = $gameVariables.value(VAR_CURRENT_ACTOR_ID);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;

  const hStateValues = readHStateValues(actorId);
  for (let statVarId = VAR_HSTATE_PENDING_FIRST; statVarId <= VAR_HSTATE_PENDING_LAST; statVarId++) {
    const statLine = buildLibidoStatLine(actor, hStateValues, statVarId);
    if (statLine === null) continue;
    valueWordSet0 += statLine;
  };

  //変更: 元コードはループ内で毎回 TickerManager.show していた(表示内容は最後の
  //      呼び出しが正しい)。最終テキストが確定してから1回だけ表示する。
  if (useTicker) {
    TickerManager.show(valueWordSet0);
  } else {
    outputLibidoStatSummary();
  };
  $gameSwitches.setValue(SW_H_SCENE_SIMPLE, false);

};

//1変数ぶんの性欲上昇表示行。対象外/上昇なしは null。
function buildLibidoStatLine(actor, hStateValues, statVarId) {
  if (statVarId == VAR_HSTATE_EXPOSURE_LIMIT) return null;//405は表示しない

  const statValue = $gameVariables.value(statVarId);
  if (statValue == 0) return null;

  let statDisplayValue;
  if (statVarId >= VAR_HSTATE_PENDING_FIRST && statVarId <= VAR_SUPPRESSION_TARGET_LAST) {
    statDisplayValue = hStateValues[statVarId - VAR_HSTATE_ECSTASY_BASE];
  } else {
    if (!actor.isLearnedSkill(statVarId - 380)) return null;
    statDisplayValue = actor.skillMasteryUses(statVarId - 380);
  };

  const statName = cleanVariableLabel($dataSystem.variables[statVarId]);
  const statColorTag = statValue >= 1 ? `\\C[2]+${statValue}！` : `\\C[1]${statValue}！`;
  return `${actor.name()}: ${statName}${statColorTag}\\C[0](${statDisplayValue + statValue})\n`;
}

//簡易表示の出力先(累積テキストかDTextPictureか)。
function outputLibidoStatSummary() {
  if ($gameSwitches.value(SW_MESSAGE_STACK_MODE)) {
    $gameVariables.setValue(VAR_MESSAGE_STACK_ALT, `${valueWordSet0}\n`);
    $gameVariables.setValue(VAR_MESSAGE_STACK_COUNT, $gameVariables.value(VAR_MESSAGE_STACK_COUNT) + 1);
    return;
  };
  $gameScreen.setDTextPicture(valueWordSet0, 28);
}

//☆☆性欲度補正
seiyoku_hosei = function () {

  const actorId = $gameVariables.value(VAR_CURRENT_ACTOR_ID);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;

  //現在。限界露出度設定
  rosyutu_genkai1(actor);
  rosyutu_genzai1(actor.actorId());

  //発情値を設定
  $gameVariables.setValue(VAR_HSTATE_AROUSAL, $gameVariables.value(VAR_HSTATE_PENDING_FIRST));

  //初体験時の相手をＨステ配列41に記録
  recordInitialExperiencePartner(actorId);

  //相手が魔物場合に魔物姦回数+1
  recordMonsterPartnerCount();

  //人数が指定されている場合、339に数が格納されているので経験人数に反映
  //同一人物の場合に経験人数上昇を抑制
  recordDistinctPartnerCount(actorId);

  //各相手とのＨ回数を記録
  recordPartnerHCount(actorId);

  //中だし判定
  rollInternalEjaculation(actor);

  //経験人数二人以上で輪姦
  if ($gameVariables.value(VAR_GROUP_H_COUNT) >= 2) {
    $gameVariables.setValue(VAR_HSTATE_PENDING_GROUP_RAPE, 1);
  };

  //受精するかどうか
  jusei_keisan();

  //回数に応じて各開発度に＋
  const reproductionRate = applyDevelopmentTable(actor);
  if (reproductionRate >= 1.1) {
    notifyReproductionBonus(reproductionRate);
  };

  applyBodyFluidStates(actor);
  applyDevelopmentRankBonus(actor);
  applyDevelopmentRankMultiplier(actor);
  applyEstrusAmplification(actor);
  applyClimaxCountIncrements(actor);
};

//初体験時の相手をＨステ配列41に記録。
function recordInitialExperiencePartner(actorId) {
  const hStateValues = readHStateValues(actorId);
  const sexCount = hStateValues[HSTATE_INDEX_SEX_COUNT];
  if (sexCount != 0) return;
  if (!($gameVariables.value(VAR_HSTATE_ECSTASY_BASE + HSTATE_INDEX_SEX_COUNT) >= 1)) return;

  hStateValues[HSTATE_INDEX_FIRST_PARTNER] = $gameVariables.value(VAR_PARTNER_NAME);
}

//相手が魔物場合に魔物姦回数+1。事前に数字が入っている場合は無視。
function recordMonsterPartnerCount() {
  if ($gameVariables.value(VAR_HSTATE_PENDING_MONSTER_H) != 0) return;

  const partnerWeapon = $dataWeapons[$gameVariables.value(VAR_PARTNER_WEAPON_ID)];
  //BUGFIX: 相手武器IDが0/範囲外の時に落ちていた
  if (!partnerWeapon) return;
  if (!partnerWeapon.meta['monster']) return;

  $gameVariables.setValue(VAR_HSTATE_PENDING_MONSTER_H, 1);
}

//指定人数ぶんの経験人数を加算(同一相手の場合は抑制)。
function recordDistinctPartnerCount(actorId) {
  const partnerHRecords = readPartnerRecords(actorId);
  const partnerRecordIndex = $gameVariables.value(VAR_PARTNER_WEAPON_ID) - 300;
  if (partnerHRecords[partnerRecordIndex] != 0) return;

  $gameVariables.setValue(VAR_HSTATE_PENDING_DISTINCT_PARTNERS,
    $gameVariables.value(VAR_HSTATE_PENDING_DISTINCT_PARTNERS) + $gameVariables.value(VAR_LAST_H_COUNT));
}

//各相手とのＨ回数を記録。
function recordPartnerHCount(actorId) {
  const hasAnyHCount = $gameVariables.value(VAR_H_VAGINAL_COUNT) >= 1
    || $gameVariables.value(VAR_H_ANAL_COUNT) >= 1
    || $gameVariables.value(VAR_H_FELLATION_COUNT) >= 1;
  if (!hasAnyHCount) return;

  readPartnerRecords(actorId)[$gameVariables.value(VAR_PARTNER_WEAPON_ID) - 300] += 1;
}

//中だし判定。コイン投げで決め、スキル/ステートで上書きする。
function rollInternalEjaculation(actor) {
  const actorBattleSkills = actor.battleSkillsRaw();
  const rollInternalCount = (hCount) => {
    let internalCount = 0;
    for (let i = 1; i <= hCount; i++) {
      if (COIN_FLIP_VALUES[getRandomIndex(COIN_FLIP_VALUES.length)] == 1) {
        internalCount += 1;
      };
    };
    if (actorBattleSkills.includes(871) || actor.isStateAffected(73)) {
      internalCount = hCount;
    };
    if (actorBattleSkills.includes(872) || actor.isStateAffected(74)) {
      internalCount = 0;
    };
    return internalCount;
  };

  //膣姦/尻姦/フェラで中だしか否か。対象変数に既に数字がある場合はその数字を採用。
  recordInternalCountFor(VAR_H_VAGINAL_COUNT, VAR_HSTATE_PENDING_VAGINAL_INTERNAL, rollInternalCount);
  recordInternalCountFor(VAR_H_ANAL_COUNT, VAR_HSTATE_PENDING_ANAL_INTERNAL, rollInternalCount);
  recordInternalCountFor(VAR_H_FELLATION_COUNT, VAR_HSTATE_PENDING_FELLATION_INTERNAL, rollInternalCount);
}

//1部位ぶんの中だし回数を記録する。
function recordInternalCountFor(hCountVarId, internalVarId, rollInternalCount) {
  const hCount = $gameVariables.value(hCountVarId);
  if (!(hCount >= 1)) return;
  if ($gameVariables.value(internalVarId) != 0) return;

  const computedInternal = rollInternalCount(hCount);
  if (!(computedInternal >= 1)) return;

  $gameVariables.setValue(internalVarId, $gameVariables.value(internalVarId) + computedInternal);
}

//回数→開発度の加算テーブル(元コードの並びをそのまま保持)。
const DEVELOPMENT_SOURCE_VARS = [406, 407, 408, 410, 408, 408, 411, 412, 416, 413, 421, 426, 414];
const DEVELOPMENT_TARGET_VARS = [431, 432, 433, 435, 438, 437, 436, 436, 436, 434, 434, 439, 434];

function applyDevelopmentTable(actor) {
  const reproductionRate = actor.elementRate(ELEMENT_REPRODUCTION);
  const amplified = reproductionRate >= 1.1;

  for (let devIndex = 0; devIndex < DEVELOPMENT_SOURCE_VARS.length; devIndex++) {
    const sourceValue = $gameVariables.value(DEVELOPMENT_SOURCE_VARS[devIndex]);
    if (sourceValue < 1) continue;

    const baseDevelopmentValue = amplified ? sourceValue + Math.round(reproductionRate) : sourceValue;
    const targetVarId = DEVELOPMENT_TARGET_VARS[devIndex];
    $gameVariables.setValue(targetVarId, $gameVariables.value(targetVarId) + baseDevelopmentValue);
  };
  return reproductionRate;
}

function notifyReproductionBonus(reproductionRate) {
  const reproduction = colorTaggedText(27, '<' + `Reproduction` + '>');
  const bonusPts = colorTaggedText(27, `+${Math.round(reproductionRate)}`);
  appendHStateMessage(`${reproduction}補正。各開発度/経験度加算値に${bonusPts}` + '\n', 3);
}

//ステート精液の付与
const BODY_FLUID_STATE_SETTINGS = [
  { pendingVarId: 411, stateId: 84 },
  { pendingVarId: 408, stateId: 85 },
  { pendingVarId: 419, stateId: 86 }
];

function applyBodyFluidStates(actor) {
  for (const setting of BODY_FLUID_STATE_SETTINGS) {
    if ($gameVariables.value(setting.pendingVarId) >= 1) actor.addState(setting.stateId);
  };
}

//各開発度のランクに応じて回数上昇の時に開発度に補正(スキル51-56)
const DEV_RANK_BONUS_SETTINGS = [
  { sourceVarId: 406, skillId: 51, targetVarId: 434, threshold: 2 },
  { sourceVarId: 407, skillId: 52, targetVarId: 434, threshold: 3 },
  { sourceVarId: 408, skillId: 53, targetVarId: 434, threshold: 3 },
  { sourceVarId: 410, skillId: 55, targetVarId: 434, threshold: 2 },
  { sourceVarId: 411, skillId: 56, targetVarId: 434, threshold: 3 },
  { sourceVarId: 412, skillId: 56, targetVarId: 434, threshold: 4 },
  { sourceVarId: 413, skillId: 51, targetVarId: 431, threshold: 2 },
  { sourceVarId: 413, skillId: 52, targetVarId: 432, threshold: 4 },
  { sourceVarId: 418, skillId: 54, targetVarId: 434, threshold: 4 },
  { sourceVarId: 419, skillId: 54, targetVarId: 434, threshold: 5 },
  { sourceVarId: 420, skillId: 54, targetVarId: 434, threshold: 5 }
];

function applyDevelopmentRankBonus(actor) {
  for (const setting of DEV_RANK_BONUS_SETTINGS) {
    const masteryLevel = actor.skillMasteryLevel(setting.skillId);
    if (masteryLevel < setting.threshold) continue;

    const sourceValue = $gameVariables.value(setting.sourceVarId);
    if (sourceValue < 1) continue;

    $gameVariables.setValue(setting.targetVarId,
      $gameVariables.value(setting.targetVarId) + sourceValue * masteryLevel);
  };
}

//開発度ランクに応じて回数上昇の時に乗算。スキル51-59。最後に実行。
function applyDevelopmentRankMultiplier(actor) {
  for (let skillIndex = 1; skillIndex <= 9; skillIndex++) {
    const masteryLevel = actor.skillMasteryLevel(skillIndex + 50);
    if (masteryLevel < 1) continue;

    const devVarId = skillIndex + VAR_HSTATE_PENDING_DEVELOPMENT_BASE;
    const devValue = $gameVariables.value(devVarId);
    if (devValue < 2) continue;

    $gameVariables.setValue(devVarId, devValue * masteryLevel);
  };
}

//発情値を性感開発値で増幅
function applyEstrusAmplification(actor) {
  const sensualityLevel = actor.skillMasteryLevel(SKILL_H_SEXUAL_DEV);
  if (sensualityLevel < 1) return;

  const pendingEstrus = $gameVariables.value(VAR_HSTATE_AROUSAL);
  if (!(pendingEstrus >= 1)) return;

  $gameVariables.setValue(VAR_HSTATE_AROUSAL, pendingEstrus + pendingEstrus * sensualityLevel);
}

//発情値100で絶頂回数+。性感開発度に応じて潮吹き/失禁も加算。
function applyClimaxCountIncrements(actor) {
  if ($gameVariables.value(VAR_HSTATE_AROUSAL) >= 100) {
    addClimaxCount(VAR_H_CLIMAX_COUNT, 1);
    if (actor.isLearnedSkill(SKILL_H_SKILLED)) {//スケベっこ以上で膣アナルフェラ回数に応じて絶頂回数+
      //変更: 旧来は未使用の乱数(getRandomIndex)を1回消費していた。加算値は
      //      膣穴(406)+アナル(407)+フェラ(408)回数で、上のコメントの仕様どおり。
      const aggregateHCount = $gameVariables.value(VAR_H_VAGINAL_COUNT)
        + $gameVariables.value(VAR_H_ANAL_COUNT)
        + $gameVariables.value(VAR_H_FELLATION_COUNT);
      addClimaxCount(VAR_H_CLIMAX_COUNT, aggregateHCount);
    };
  };

  const sensualityLevel = actor.skillMasteryLevel(SKILL_H_SEXUAL_DEV);
  if (sensualityLevel < 3) return;
  if (!($gameVariables.value(VAR_H_CLIMAX_COUNT) >= 1)) return;

  if (getRandomIndex(101) + (sensualityLevel * 10) >= 80) {
    addClimaxCount(VAR_H_SQUIRT_COUNT, 1);
  };
  if (getRandomIndex(101) + (sensualityLevel * 10) >= 110) {
    addClimaxCount(VAR_H_INCONTINENCE_COUNT, 1);
  };
}

function addClimaxCount(climaxVarId, amount) {
  $gameVariables.setValue(climaxVarId, $gameVariables.value(climaxVarId) + amount);
}

//☆☆性欲度情報を更新
seiyoku_hanei = function () {

  const actorId = $gameVariables.value(VAR_CURRENT_ACTOR_ID);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;

  const hStateValues = readHStateValues(actorId);
  applyPendingToHStateValues(hStateValues);

  if (hasAnyHCountToday()) {
    hStateValues[HSTATE_INDEX_TODAY_COUNT] += 1;
  };

  //売春時のゴールド獲得処理
  if ($gameVariables.value(VAR_HSTATE_PROSTITUTION_MONEY) >= 1) {
    $gameParty.gainGold(Math.ceil($gameVariables.value(VAR_HSTATE_PROSTITUTION_MONEY)));
  };

  const battleSkills = actor.battleSkillsRaw();
  applyRapeStateOnBattle(actor, hStateValues, battleSkills);
  calmEstrusOutsideBattle(actor, hStateValues, battleSkills);
  updateEstrusState(actor, hStateValues);

  recordHSkillRankUps(actor);
  writeBackHStateValues(hStateValues);
};

//401-430の上昇値をＨステ配列1-30へ加算(負値は0で止める)。
function applyPendingToHStateValues(hStateValues) {
  for (let index = 1; index <= 30; index++) {
    hStateValues[index] += $gameVariables.value(index + VAR_HSTATE_ECSTASY_BASE);
    if (hStateValues[index] < 0) {
      hStateValues[index] = 0;
    };
  };
}

//当日のＨ回数・強姦・人数系の変数のいずれかが立っているか。
const DAILY_H_COUNT_TRIGGER_VARS = [406, 407, 417, 418, 419, 420];

function hasAnyHCountToday() {
  return DAILY_H_COUNT_TRIGGER_VARS.some((varId) => $gameVariables.value(varId) >= 1);
}

//強姦時に当日強姦回数に+。戦闘中は放心付与。
function applyRapeStateOnBattle(actor, hStateValues, battleSkills) {
  if (!($gameVariables.value(VAR_HSTATE_PENDING_RAPE) >= 1)) return;

  hStateValues[HSTATE_INDEX_RAPE_TODAY] += 1;
  if ($gameParty.inBattle() && !battleSkills.includes(846)) {
    actor.addState(64);
  };
}

//絶頂で発情鎮静。戦闘中はコモン113で行う。
function calmEstrusOutsideBattle(actor, hStateValues, battleSkills) {
  if (battleSkills.includes(867)) return;
  if ($gameParty.inBattle()) return;
  if (!($gameVariables.value(VAR_H_CLIMAX_COUNT) >= 1)) return;

  let calmValue = 0;
  //スキル61-69の習得状況に応じて鎮静値が上がる
  for (let skillIndex = 0; skillIndex < CALM_RANDOM_MAX_BY_SKILL.length; skillIndex++) {
    if (!actor.isLearnedSkill(61 + skillIndex)) continue;
    calmValue += getRandomIndex(CALM_RANDOM_MAX_BY_SKILL[skillIndex]);
  };
  hStateValues[HSTATE_INDEX_ESTRUS] = calmValue;
}

const CALM_RANDOM_MAX_BY_SKILL = [1, 2, 3, 4, 5, 6, 6, 6, 6];

//発情値に応じて発情ステートを付与/解除(移行時のみメッセージ)。
function updateEstrusState(actor, hStateValues) {
  if (hStateValues[HSTATE_INDEX_ESTRUS] >= 50 + 1) {
    if (!actor.isStateAffected(STATE_ESTRUS)) {
      const actorName = actor.name();
      const estrusLabel = colorTaggedText(27, `発情`);
      notifyEstrusChange(`${actorName}は${estrusLabel}している…。`);
    };
    actor.addState(STATE_ESTRUS);
    return;
  };

  if (actor.isStateAffected(STATE_ESTRUS)) {
    const actorName = actor.name();
    const estrusLabel = colorTaggedText(27, `発情`);
    notifyEstrusChange(`${actorName}の${estrusLabel}が静まった…。`);
  };
  actor.removeState(STATE_ESTRUS);
}

//発情関連メッセージ。累積テキストかティッカーか。
function notifyEstrusChange(estrusMessage) {
  if ($gameSwitches.value(SW_MESSAGE_STACK_MODE)) {
    $gameVariables.setValue(VAR_MESSAGE_STACK_ALT, `${estrusMessage}\n`);
    $gameVariables.setValue(VAR_MESSAGE_STACK_COUNT, $gameVariables.value(VAR_MESSAGE_STACK_COUNT) + 1);
    return;
  };
  TickerManager.show(estrusMessage);
}

//スキル51-59の熟練度上昇を反映し、ランクアップしたものを記録する。
function recordHSkillRankUps(actor) {
  valueHskillLearnArr = [];
  for (let skillId = SKILL_H_DEV_FIRST; skillId <= SKILL_H_DEV_LAST; skillId++) {
    const masteryLevelBefore = actor.skillMasteryLevel(skillId);
    actor.gainSkillMasteryUses(skillId, $gameVariables.value(skillId + 380));
    const masteryLevelAfter = actor.skillMasteryLevel(skillId);
    if (masteryLevelBefore != masteryLevelAfter && masteryLevelBefore >= 1) {
      valueHskillLearnArr.push(skillId);
    };
  };
}

//Ｈステ配列1-30を変数401-430へ書き戻す。
function writeBackHStateValues(hStateValues) {
  for (let index = 1; index <= 30; index++) {
    $gameVariables.setValue(VAR_HSTATE_ECSTASY_BASE + index, hStateValues[index]);
  };
}

//---------------------------------------------------------------------------
// Item / skill usage, daily fertility, history lists
//---------------------------------------------------------------------------

//☆☆スキルアイテム使用による性欲数値更新a,b,this.item().id,1
const LIBIDO_USE_LIMIT_SKILL_DEFAULT = 18;
const LIBIDO_USE_LIMIT_SKILL_NON_GIRL = 61;
const ITEM_USE_PARTNER_WEAPON_ID = 306;

seiyoku_itemHanei = function (unusedArg1, targetItem, itemOrSkillId, isSkill) {

  const databaseEntries = isSkill == 1 ? $dataSkills : $dataItems;
  const targetActorId = targetItem.actorId();
  $gameVariables.setValue(VAR_CURRENT_ACTOR_ID, targetActorId);

  const actor = $gameActors.actor(targetActorId);
  if (!actor) return;

  const entry = databaseEntries[itemOrSkillId];
  if (!isHeroineActor(targetActorId)) {
    rejectItemUse(actor, entry);
    const actorName = actor.name();
    TickerManager.show(`${actorName}には使用する事が出来ない…。`);
    return;
  };

  //使用アイテム名表示。アイテム使用時はパッシブ反映しない。
  const itemMeta = entry.meta;
  const requiredSkillId = resolveLibidoUseLimitSkill(itemMeta, actor);
  if (!actor.isLearnedSkill(requiredSkillId)) {
    rejectItemUse(actor, entry);
    const actorName = actor.name();
    TickerManager.show(`条件を満たしていない為、${actorName}には使用する事が出来ない…。`);
    $gameSwitches.setValue(SW_TICKER_MESSAGE, false);
    return;
  };

  applyItemLibidoJudgement(targetActorId, itemMeta);
  reportItemUse(actor, entry, databaseEntries);
};

//ヒロイン(meta['Heroine'])のアクターか。
function isHeroineActor(actorId) {
  const targetActorData = $dataActors[actorId];
  return !!(targetActorData && targetActorData.meta['Heroine']);
}

//使用不可時はアイテムを返却する。
function rejectItemUse(actor, entry) {
  $gameParty.gainItem(entry, +1);
}

//使用に必要なスキルID。女の子以外は別スキルで判定する。
function resolveLibidoUseLimitSkill(itemMeta, actor) {
  const limitSkillId = itemMeta['性欲度使用制限'] ? Number(itemMeta['性欲度使用制限']) : LIBIDO_USE_LIMIT_SKILL_DEFAULT;
  return isGirl(actor) ? limitSkillId : LIBIDO_USE_LIMIT_SKILL_NON_GIRL;
}

//アイテムのH判定値を適用し、性欲値の更新一式を走らせる。
function applyItemLibidoJudgement(actorId, itemMeta) {
  resetPendingHStateVariables();
  h_exp(actorId, '0_1_0', ITEM_USE_PARTNER_WEAPON_ID, false, true, false);

  const itemJudgement = itemMeta['HitemJudgement'].split(',');
  $gameVariables.setValue(Number(itemJudgement[0]), Number(itemJudgement[1]));
  $gameSwitches.setValue(SW_TICKER_MESSAGE, true);

  valueWordSet0 = ``;
  seiyoku_genkai();
  seiyoku_kanniHyouji();
  seiyoku_hanei();
  $gameVariables.setValue(VAR_LAST_H_COUNT, 0);
  $gameVariables.setValue(VAR_PARTNER_WEAPON_ID, 0);
  resetPendingHStateVariables();
  $gameVariables.setValue(VAR_MESSAGE_STACK, ' ');
  $gameSwitches.setValue(SW_BATTLE_RECORD_VISIBLE, false);
}

//アイテム使用時のみ残数を表示する。
function reportItemUse(actor, entry, databaseEntries) {
  if (databaseEntries == $dataItems) {
    const itemName = entry.name;
    const ownedItemCount = $gameParty.numItems(entry);
    TickerManager.show(`${itemName}：${ownedItemCount}個`);
  };
  $gameSwitches.setValue(SW_TICKER_MESSAGE, false);
}

//☆☆当日受精率設定
const FERTILIZER_SKILL_ID = 65;//スケベっこで解放
const FERTILITY_RANDOM_MAX = 11;
const FERTILITY_MONSTER_BONUS_MAX = 51;

jusei_todayrate = function () {

  const heroineIds = $gameVariables.value(VAR_HEROINE_ID_ARRAY);
  if (!heroineIds) return;

  for (const actorId of heroineIds) {
    const actor = $gameActors.actor(actorId);
    if (!actor) continue;
    applyTodayFertility(actor);
  };

};

function applyTodayFertility(actor) {
  const hStateValues = readHStateValues(actor.actorId());

  if (!actor.isLearnedSkill(FERTILIZER_SKILL_ID)) {
    hStateValues[HSTATE_INDEX_FERTILITY] = 0;
    return;
  };

  let fertilityRate = getRandomIndex(FERTILITY_RANDOM_MAX);
  if (actor.battleSkillsRaw().includes(870)) {
    fertilityRate += getRandomIndex(FERTILITY_MONSTER_BONUS_MAX);
  };
  hStateValues[HSTATE_INDEX_FERTILITY] = fertilityRate;
}

//☆☆キャラの各種遍歴代入actor_Hhennreki(3);valueWordSet
const H_STATE_HISTORY_PAGE_HEADER = `付与されているHステート\n`;
const H_STATE_HISTORY_LINES_PER_PAGE = 8;
const H_STATE_HISTORY_PAGE_COUNT = 10;

actor_Hhennreki = function (unusedArg1) {

  for (let pageIndex = 1; pageIndex <= H_STATE_HISTORY_PAGE_COUNT; pageIndex++) {
    window['valueWordSet' + pageIndex] = H_STATE_HISTORY_PAGE_HEADER;
  };

  const actor = currentHStateActor();
  if (!actor) return;

  let wordSetIndex = 1;
  for (const stateId of valueHstateDisplay) {
    if (!actor.isStateAffected(stateId)) continue;

    const stateLine = buildHStateHistoryLine(actor, stateId);
    window['valueWordSet' + wordSetIndex] += stateLine;
    valueCountSet1 += 1;
    if (valueCountSet1 % H_STATE_HISTORY_LINES_PER_PAGE == 0) { wordSetIndex += 1 };
  };

};

//Hステート1件ぶんの履歴行(説明+進行度)。
function buildHStateHistoryLine(actor, stateId) {
  let stateDescText = `${$dataStates[stateId].description}`;
  const stateCounter = actor.getStateCounter(stateId);
  if (stateCounter != undefined) {
    const progress = '進行度';
    stateDescText += `\\C[27]${progress}:${stateCounter}\\C[0]`;
  };
  return stateDescText + `\n`;
}

//☆☆キャラの各種遍歴代入前実行2actor_Hhennreki2Before(4,5,6);
//選択肢番号は、実際の配列番号+1にしている。
const HISTORY_HEADERS = {
  4: `\\I[526]\\C[27]男性遍歴　　　　　　\\C[0]　　 　　　　　　　　　　　　　　　`,
  5: `\\I[428]\\C[27]出産履歴　　　　　　\\C[0]　　 　　　　　　　　　　　　　　　`,
  6: `\\I[556]\\C[27]シーン履歴（直近100件）\\C[0]　　　　　　　　　　　　　　　　`,
};

actor_Hhennreki2Before = function (displayTypeId) {

  const actorId = $gameVariables.value(VAR_CURRENT_ACTOR_ID);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;

  const hStateValues = readHStateValues(actorId);
  $gameSystem.addCustomChoice(1, { text: `\\FS[25]${HISTORY_HEADERS[displayTypeId]}`, value: 0 });

  if (displayTypeId == 4 && hStateValues[HSTATE_INDEX_FIRST_PARTNER] != 0) {//41は名前を入れている
    addCustomChoice(buildFirstPartnerChoice(actor, hStateValues));
  };
  if (displayTypeId == 5 && hStateValues[HSTATE_INDEX_FIRST_CHILD_PARTNER] >= 1) {//49はidを入れている
    addCustomChoice(buildFirstChildChoice(actor, hStateValues));
  };

};

function addCustomChoice(text) {
  $gameSystem.addCustomChoice(1, { text: `\\FS[25]${text}`, value: 1 });
}

//初体験の相手(スキル67の有無で言い回しが変わる)。
function buildFirstPartnerChoice(actor, hStateValues) {
  const firstPartnerLabel = actor.isLearnedSkill(SKILL_PARTNER_KNOWN)
    ? `\\C[27]初体験の相手:\\C[0]`
    : `\\C[30]処女を奪った相手:\\C[0]`;
  return `${firstPartnerLabel}${hStateValues[HSTATE_INDEX_FIRST_PARTNER]}`;
}

//初子の父親(スキル67の有無で言い回しが変わる)。
function buildFirstChildChoice(actor, hStateValues) {
  const firstChildLabel = actor.isLearnedSkill(SKILL_PARTNER_KNOWN)
    ? `\\C[27]初子の父親:\\C[0]`
    : `\\C[30]初子を産んだ男:\\C[0]`;
  return `${firstChildLabel}${$dataWeapons[hStateValues[HSTATE_INDEX_FIRST_CHILD_PARTNER]].name}`;
}

//☆☆キャラの各種遍歴代入2actor_Hhennreki2(4,5,6);
const HISTORY_LIST_SETTINGS = {
  4: { startIndex: 1, nameOffset: 300, reverseOffset: 100 },
  5: { startIndex: 201, nameOffset: 100, reverseOffset: -100 },
};
const HISTORY_LIST_ENTRY_COUNT = 100;

actor_Hhennreki2 = function (displayTypeId) {

  const listSettings = HISTORY_LIST_SETTINGS[displayTypeId];
  if (listSettings) {
    appendPartnerHistoryChoices(displayTypeId, listSettings);
    return;
  };
  if (displayTypeId != 6) return;
  appendSceneHistoryChoices();
};

//男性遍歴 / 出産履歴の一覧。
function appendPartnerHistoryChoices(displayTypeId, listSettings) {
  const actorId = $gameVariables.value(VAR_CURRENT_ACTOR_ID);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;

  const partnerHRecords = readPartnerRecords(actorId);
  const knowsAll = actor.isLearnedSkill(SKILL_PARTNER_KNOWN);

  for (let index = 0; index < HISTORY_LIST_ENTRY_COUNT; index++) {
    const recordIndex = listSettings.startIndex + index;
    if (!(partnerHRecords[recordIndex] >= 1)) continue;

    const entryText = buildPartnerHistoryEntry(displayTypeId, listSettings, partnerHRecords, recordIndex, knowsAll);
    $gameSystem.addCustomChoice(1, { text: `\\FS[25]${entryText}`, value: index + 2 });
  };
}

//相手1件ぶんの履歴テキスト。
function buildPartnerHistoryEntry(displayTypeId, listSettings, partnerHRecords, recordIndex, knowsAll) {
  const partnerWeapon = $dataWeapons[recordIndex + listSettings.nameOffset];
  let entryText;
  if (partnerWeapon.meta['Profession']) {
    entryText = `[${partnerWeapon.meta['Profession']}]\\C[16]${partnerWeapon.name}\\C[0]:`;
  } else if (partnerWeapon.meta['FamilyName']) {
    const familyName = partnerWeapon.meta['FamilyName'];
    entryText = `\\C[16]${partnerWeapon.name} = ${familyName}\\C[0]:`;
  } else {
    entryText = `\\C[16]${partnerWeapon.name}\\C[0]:`;
  };

  const hCount = partnerHRecords[recordIndex];
  const countColorTag = knowsAll ? `\\C[27]` : `\\C[1]`;
  entryText += `${countColorTag}${hCount}\\C[0]回`;

  const hasReverseRecord = partnerHRecords[recordIndex + listSettings.reverseOffset] >= 1;
  if ($gameSwitches.value(SW_HISTORY_DETAIL) && displayTypeId == 4 && hasReverseRecord) {
    entryText += `\\I[374]？`;
  };
  return entryText;
}

//シーン履歴(直近100件)。配列は1始まり。
function appendSceneHistoryChoices() {
  const sceneHistory = $gameVariables.value(VAR_HISTORY_SCENE_ARRAY)
    ? $gameVariables.value(VAR_HISTORY_SCENE_ARRAY)[$gameVariables.value(VAR_CURRENT_ACTOR_ID)]
    : 0;
  if (!sceneHistory || sceneHistory.length <= 0) return;

  for (let index = sceneHistory.length - 1; index >= 1; index--) {
    $gameSystem.addCustomChoice(1, { text: `\\FS[25]${sceneHistory[index]}`, value: index + 1 });
  };
}

//---------------------------------------------------------------------------
// Generic H scene text BGV / single word phrases
//---------------------------------------------------------------------------

//☆☆汎用Ｈシーン時に文字ＢＧＶ。<汎用シーン性感低:>scene_textBgv($gameVariables.value(318),640,384);
const defaultSexualEcstasyHi = [`「アッ…」`, `「ンっ…」`, `「ンンっ…」`, `（ピクっ…\\I[12]）`];
const defaultSexualEcstasyMiddle = [`「アッ…\\I[12]」`, `「ンっ…」`, `「ンンっ…\\I[12]」`, `（ピクっ…\\I[12]）`];
const defaultSexualEcstasyLow = ['「ヤァッ…！」', '「ダメっ…！」', '「ヤメッ…！」',
  '「アっ…、ァァ…」', '（ビクンッ）'];
const textWindowIdOptionsSceneTextBgv = [28, 29, 30, 31, 32, 33, 34, 35, 36];
const additionalXOffsetOptionsSceneTextBgv = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, -50, -60, -70, -80, -90, -100, -110, -120, -130, -140, -150];
const DEFAULT_SCENE_TEXT_PICTURE_IDS = [121, 122, 123, 124, 125, 126, 127, 128, 129, 130];
const SCENE_TEXT_X_OFFSETS_SMALL = [50, 100, 150, 200, 0, -50, -100, -150, -200];
const SCENE_TEXT_X_OFFSETS_LARGE = [100, 200, 300, 400, 0, -100, -200, -300, -400];
const SCENE_TEXT_Y_OFFSETS = [100, 150, 200, 0, -100, -200, -300, -350];
const SCENE_TEXT_WAIT_SHORT = [80, 90, 100, 110, 120];
const SCENE_TEXT_WAIT_LONG = [100, 110, 120, 130, 140, 150, 160];

scene_textBgv = function (actorId, baseX, baseY, offsetMode, waitMode, fontSetting) {

  const gameActor = $gameActors.actor(actorId);
  if (!gameActor) return;

  const chosenPhrase = pickSceneTextPhrase(gameActor);
  const chosenPictureId = reserveSceneTextPictureId();
  const chosenXOffset = pickRandomValue(offsetMode == 1 ? SCENE_TEXT_X_OFFSETS_SMALL : SCENE_TEXT_X_OFFSETS_LARGE);
  const chosenYOffset = pickRandomValue(SCENE_TEXT_Y_OFFSETS);
  const chosenWaitTime = pickRandomValue(waitMode == 0 ? SCENE_TEXT_WAIT_SHORT : SCENE_TEXT_WAIT_LONG);

  $gameScreen.setDTextPicture(`${chosenPhrase}`, pickRandomValue(textWindowIdOptionsSceneTextBgv));
  $gameScreen.dWindowFrame = 'ON';
  if (fontSetting != 0) { $gameScreen.setDtextFont(fontSetting); };
  $gameScreen.dTextAlign = 1;

  if (waitMode != 0) {
    const additionalXOffset = pickRandomValue(additionalXOffsetOptionsSceneTextBgv);
    $gameScreen.showPicture(chosenPictureId, "", 1, baseX + chosenXOffset + additionalXOffset, baseY + chosenYOffset, 100, 100, 255, 0);
    $gameScreen.movePicture(chosenPictureId, 1, baseX + chosenXOffset, baseY + chosenYOffset, 100, 100, 0, 0, chosenWaitTime);
    return;
  };

  $gameScreen.showPicture(chosenPictureId, "", 1, baseX + chosenXOffset, baseY + chosenYOffset, 150, 150, 255, 0);
  $gameScreen.movePicture(chosenPictureId, 1, baseX + chosenXOffset, baseY + chosenYOffset, 100, 100, 0, 0, chosenWaitTime);
};

//習得スキルに応じた喘ぎ台詞(変数707の台詞と連結)。
function pickSceneTextPhrase(gameActor) {
  const actorMeta = gameActor.actor().meta;
  let ecstasyPhrases = [];
  let combinedEcstasyArray = [];

  if ($gameSwitches.value(SW_ECSTASY_VOICE)) {
    ecstasyPhrases = readEcstasyPhrases(gameActor, actorMeta);
  } else {
    combinedEcstasyArray = $gameVariables.value(VAR_H_SCENE_PHRASES) || [];
  };

  if (ecstasyPhrases.length > 0) {
    combinedEcstasyArray = combinedEcstasyArray.concat(ecstasyPhrases);
  };
  return combinedEcstasyArray[getRandomIndex(combinedEcstasyArray.length)] || '';
}

//スキル68/65で台詞グレードが変わる。
function readEcstasyPhrases(gameActor, actorMeta) {
  if (gameActor.isLearnedSkill(68)) {
    return actorMeta['SexualEcstasyHi'] ? actorMeta['SexualEcstasyHi'].split(',') : defaultSexualEcstasyHi;
  };
  if (gameActor.isLearnedSkill(65)) {
    return actorMeta['SexualEcstasyMiddle'] ? actorMeta['SexualEcstasyMiddle'].split(',') : defaultSexualEcstasyMiddle;
  };
  return actorMeta['SexualEcstasyLow'] ? actorMeta['SexualEcstasyLow'].split(',') : defaultSexualEcstasyLow;
}

//使用可能なテキスト用ピクチャIDを1つ確保(使用したIDは配列から外す)。
function reserveSceneTextPictureId() {
  let availablePictureIds = $gameVariables.value(VAR_H_SCENE_PICTURE_SLOTS);
  if (availablePictureIds == 0 || !availablePictureIds || availablePictureIds.length === 0) {
    availablePictureIds = DEFAULT_SCENE_TEXT_PICTURE_IDS;
    $gameVariables.setValue(VAR_H_SCENE_PICTURE_SLOTS, availablePictureIds);
  };

  const chosenPictureId = pickRandomValue(availablePictureIds);
  const foundIndex = availablePictureIds.findIndex((idItem) => idItem === chosenPictureId);
  if (foundIndex >= 0) {
    availablePictureIds.splice(foundIndex, 1);
  };
  return chosenPictureId;
}

//☆☆CGの一部分で一言台詞pic_oneWord(valueSerialPictureId,x,y,25,60,arr1);
const PICTURE_ONE_WORD_OFFSET_RANGE = 201;
const PICTURE_ONE_WORD_OFFSET_HALF = 100;

pic_oneWord = function (pictureSlot, baseX, baseY, textMotionParam, moveDuration, textOptions, fontSetting) {

  picture_motion1(textMotionParam >= 100 ? "smooth" : "linear", [0]);
  const randomXOffset = getRandomIndex(PICTURE_ONE_WORD_OFFSET_RANGE) - PICTURE_ONE_WORD_OFFSET_HALF;
  const randomYOffset = getRandomIndex(PICTURE_ONE_WORD_OFFSET_RANGE) - PICTURE_ONE_WORD_OFFSET_HALF;
  const chosenText = pickRandomValue(textOptions);

  $gameScreen.setDTextPicture(chosenText, textMotionParam);
  $gameScreen.dWindowFrame = 'ON';
  if (fontSetting !== 0) { $gameScreen.setDtextFont(fontSetting) };
  $gameScreen.dTextAlign = 1;
  $gameScreen.showPicture(pictureSlot, "", 1, baseX + randomXOffset, baseY + randomYOffset, 50, 50, 255, 0);
  $gameScreen.movePicture(pictureSlot, 1, baseX + randomXOffset, baseY + randomYOffset, 150, 150, 0, 0, moveDuration);

};

//---------------------------------------------------------------------------
// Childbirth calculation
//---------------------------------------------------------------------------
const PREGNANCY_FALLBACK_PARTNER_SLOT = 102;
const PREGNANCY_CHILD_SLOT_OFFSET = 100;

//出産時の計算式
actor_pregnancyCalculation = function (actorId) {

  $gameVariables.setValue(VAR_CURRENT_ACTOR_ID, actorId);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;
  if (!actor.isStateAffected(STATE_PREGNANT)) return;

  //妊娠状態を解除して出産処理へ
  actor.removeState(STATE_PREGNANT);
  actor.removeStateCounter(STATE_PREGNANT);
  $gameVariables.setValue(VAR_ACTOR_NAME_MIRROR, actor.name());

  //妊娠時の一時的なサイズ増量表現を消去させる
  clearPregnancySwell(actorId);

  //妊娠相手を特定する
  const fatherSlot = pickFatherSlot(actorId);
  const partnerHRecords = readPartnerRecords(actorId);
  partnerHRecords[fatherSlot + PREGNANCY_CHILD_SLOT_OFFSET] += 1;

  const hStateValues = readHStateValues(actorId);
  if (hStateValues[HSTATE_INDEX_FIRST_CHILD_PARTNER] == 0) {
    hStateValues[HSTATE_INDEX_FIRST_CHILD_PARTNER] = fatherSlot + PARTNER_CHILD_SLOT_OFFSET;
  };

  //受精相手を特定するための配列を0にする。
  clearFertilizationPartnerRecords(partnerHRecords);
};

function clearPregnancySwell(actorId) {
  const hStateValues = readHStateValues(actorId);
  for (let offset = 0; offset < 4; offset++) {
    hStateValues[HSTATE_INDEX_PREGNANCY_SWELL + offset] = 0;
  };
}

//101-200の受精記録から父親を1人選ぶ(該当なしは102)。
function pickFatherSlot(actorId) {
  const partnerHRecords = readPartnerRecords(actorId);
  const potentialPartners = [];
  for (let partnerIndex = PARTNER_RECORD_SLOT_FIRST_INDEX; partnerIndex <= PARTNER_RECORD_SLOT_LAST_INDEX; partnerIndex++) {
    if (partnerHRecords[partnerIndex] >= 1) potentialPartners.push(partnerIndex);
  };

  const selectedPartner = potentialPartners[getRandomIndex(potentialPartners.length)];
  return selectedPartner ? selectedPartner : PREGNANCY_FALLBACK_PARTNER_SLOT;
}

function clearFertilizationPartnerRecords(partnerHRecords) {
  for (let partnerIndex = PARTNER_RECORD_SLOT_FIRST_INDEX; partnerIndex <= PARTNER_RECORD_SLOT_LAST_INDEX; partnerIndex++) {
    if (partnerHRecords[partnerIndex] >= 1) partnerHRecords[partnerIndex] = 0;
  };
}

//---------------------------------------------------------------------------
// H profile standing picture (tachie)
//---------------------------------------------------------------------------
//☆☆Hプロフィール表示時立ち絵
const HSTATES_BACKGROUND1 = "HstatesBackGround1";
const HSTATES_FRAME = "HstatesFrame";
const HSTATES_ACTOR_BUST_WHITE = "HstatesActorBustWhite";
const HSTATES_ACTOR_BODY = "HstatesActorBody";
const HSTATES_ACTOR_BUST = "HstatesActorBust";
const HSTATES_ACTOR_HEAD = "HstatesActorHead";
const HSTATES_BG_SHINE1 = "hStates_bgShine1";
const HSTATES_BODY_SHINE1 = "hStates_bodyShine1";
const HSTATES_BACKGROUND = "HstatesBackGround"; // 変数値を末尾に付ける
const HSTATES_ACTOR_FACE = "HstatesActorFace";
const CACHED_ANIMATION_FRAMES = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 2, 1, 4, 5, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
const fadeDurationsMap = {
  2: 60,
  3: 50,
  4: 40
};
const faceVariantMap = {
  1: "a",
  5: "b"
};

const H_TACHIE_BASE_PICTURE_ID = 111;//立ち絵のピクチャID基準
const H_TACHIE_DEFAULT_HUE = '#00d0ff';
const H_TACHIE_FADE_PICTURE_NAME = "HscenePose054";
//立ち絵の各レイヤー(basePicId からの相対ID)と表示位置
const H_TACHIE_LAYERS = {
  backgroundFade: 13,
  backBody: 6,
  bust: 7,
  head: 8,
  face: 9,
  bustWhite: 10,
  frame: 11,
  faceVariant: 12,
  backgroundFore: 3,
  backgroundBase: 4,
  frameBack: 5
};

actor_hStatesTachie = function (mode) {

  const actorId = $gameVariables.value(VAR_CURRENT_ACTOR_ID);
  const gameActor = $gameActors.actor(actorId); // コモンイベントから呼ばれる想定
  if (!gameActor) return;

  if (!isGirl(gameActor)) {
    tachie_hyouji2(gameActor);
    return;
  };

  if (mode == 1) {
    setupActorHStatesTachieMode1(H_TACHIE_BASE_PICTURE_ID, actorId, gameActor);
    return;
  };
  updateActorHStatesTachieMode2(H_TACHIE_BASE_PICTURE_ID, actorId);
};

function setupActorHStatesTachieMode1(basePicId, actorId, gameActor) {
  setActorStateBasedOnSkillsHStatesTachie(gameActor);
  setupHStatesPictures(basePicId, actorId);
  setupAnimatedActorBust(basePicId, actorId);
  setupActorHead(basePicId, actorId);
  animatePictures(basePicId);
  setupParticleEffects(gameActor.actor().meta);
}

function setupHStatesPictures(basePicId, actorId) {
  $gameScreen.showPicture(basePicId + H_TACHIE_LAYERS.backgroundBase, HSTATES_BACKGROUND1, 1, 1024, 384, 100, 100, 255, 0);
  $gameScreen.showPicture(basePicId + H_TACHIE_LAYERS.backBody, HSTATES_ACTOR_BODY + actorId + "_" + $gameVariables.value(VAR_H_STAGE_VARIANT), 1, 1024, 400, 100, 100, 0, 0);
  $gameScreen.showPicture(basePicId + H_TACHIE_LAYERS.face, HSTATES_ACTOR_FACE + actorId, 1, 1024, 384, 100, 100, 0, 0);
  $gameScreen.showPicture(basePicId + H_TACHIE_LAYERS.bustWhite, HSTATES_ACTOR_BUST_WHITE, 1, 1024, 384, 0, 0, 0, 0);
  $gameScreen.showPicture(basePicId + H_TACHIE_LAYERS.frame, HSTATES_FRAME, 1, 1024, 384, 100, 100, 255, 0);
  $gameScreen.showPicture(basePicId + H_TACHIE_LAYERS.frameBack, HSTATES_FRAME, 1, 1024, 384, 100, 100, 255, 0);
}

function setupAnimatedActorBust(basePicId, actorId) {
  const actorBustName = HSTATES_ACTOR_BUST + actorId;
  const bustPictureId = basePicId + H_TACHIE_LAYERS.bust;
  $gameScreen.setPicturesAnimation(5, 1, "横", 3);
  $gameScreen.showPicture(bustPictureId, actorBustName, 1, 1024, 384, 100, 100, 255, 0);
  $gameScreen.picture(bustPictureId).startAnimationFrame(3, true, CACHED_ANIMATION_FRAMES);
}

//頭部は体型フラグ(440配列の32)で差し替える。
function setupActorHead(basePicId, actorId) {
  const headVariant = readHStatesHeadVariant(actorId);
  $gameScreen.showPicture(basePicId + H_TACHIE_LAYERS.head,
    HSTATES_ACTOR_HEAD + actorId + "_" + headVariant, 1, 1024, 368, 100, 100, 0, 0);
}

function readHStatesHeadVariant(actorId) {
  return readPartnerBodyValues(actorId)[HSTATE_BODY_INDEX_HEAD_VARIANT] == 2 ? 1 : 2;
}

function animatePictures(basePicId) {
  $gameScreen.movePicture(basePicId + H_TACHIE_LAYERS.backBody, 1, 1024, 400, 100, 100, 255, 0, 10);
  $gameScreen.movePicture(basePicId + H_TACHIE_LAYERS.bust, 1, 1024, 384, 100, 100, 255, 0, 10);
  $gameScreen.movePicture(basePicId + H_TACHIE_LAYERS.head, 1, 1024, 368, 100, 100, 255, 0, 10);
  $gameScreen.movePicture(basePicId + H_TACHIE_LAYERS.face, 1, 1024, 384, 100, 100, 255, 0, 10);
  $gameScreen.movePicture(basePicId + H_TACHIE_LAYERS.bustWhite, 1, 1024, 384, 100, 100, 200, 0, 30);

  applyBlessToPictures(basePicId + H_TACHIE_LAYERS.backBody,
    basePicId + H_TACHIE_LAYERS.face);
}

//表示中のピクチャにだけ揺れ演出をかける。
function applyBlessToPictures(firstPictureId, lastPictureId) {
  for (let pictureId = firstPictureId; pictureId <= lastPictureId; pictureId++) {
    if ($gameScreen.picture(pictureId)) {
      tachie_bless(pictureId, 0);
    }
  };
}

function setupParticleEffects(gameActorMeta) {
  const actorHue = gameActorMeta['tachieHue2'] ? gameActorMeta['tachieHue2'] : H_TACHIE_DEFAULT_HUE;

  $gameScreen._particle.particleSet(0, HSTATES_BG_SHINE1, 'picture:116', 'def', 'above');
  $gameScreen._particle.particleSet(0, HSTATES_BODY_SHINE1, 'picture:118', 'def', 'above');
  $gameScreen._particle.particleUpdate([HSTATES_BODY_SHINE1, 'pos', 0, 20]);
  $gameScreen._particle.particleUpdate([HSTATES_BODY_SHINE1, 'color', actorHue, actorHue + '@0.5', actorHue]);
}

//段階(変数191)に応じたパーティクル/背景の更新。
const H_TACHIE_BACKGROUND_FADE_DURATION_HIGH = 30;
const H_TACHIE_STAGE_MIN = 1;
const H_TACHIE_STAGE_FACE_VARIANT = [1, 5];

function updateActorHStatesTachieMode2(basePicId, actorId) {
  const hStage = $gameVariables.value(VAR_H_STAGE_STATE);

  applyHStageParticleEffects(basePicId, hStage);
  applyHStageBackgroundFade(basePicId, hStage);
  applyHStageBackgroundTransition(basePicId, hStage);

  bless_erase();
  updateHStageFacePicture(basePicId, actorId, hStage);

  $gameScreen.movePicture(basePicId + H_TACHIE_LAYERS.frame, 1, 1024, 384, 100, 100, 0, 0, 60);
  applyBlessToPictures(basePicId + H_TACHIE_LAYERS.backBody,
    basePicId + H_TACHIE_LAYERS.face);

  if ($gameScreen.picture(basePicId + H_TACHIE_LAYERS.bust)) {
    hcg_piston(basePicId + H_TACHIE_LAYERS.bust, 9, 1, 2);
  };
}

//段階ごとの光り方(alpha / speed / scale / color / emitterLifetime)。
function applyHStageParticleEffects(basePicId, hStage) {
  if (hStage >= 1) {
    $gameScreen._particle.particleUpdate([HSTATES_BODY_SHINE1, 'alpha', '0.7', '0.3' + '@0.5', '0']);
  }
  if (hStage >= 2) {
    $gameScreen.movePicture(basePicId + H_TACHIE_LAYERS.bustWhite, 1, 1024, 384, 100, 100, 150, 0, 60);
    $gameScreen._particle.particleUpdate([HSTATES_BODY_SHINE1, 'speed', '0.5', '0.5' + '@0.5', '0.5']);
  }
  if (hStage >= 3) {
    $gameScreen.movePicture(basePicId + H_TACHIE_LAYERS.bustWhite, 1, 1024, 384, 100, 100, 50, 0, 60);
    $gameScreen._particle.particleUpdate([HSTATES_BODY_SHINE1, 'scale', '10', '6' + '@0.5', '6']);
    $gameScreen._particle.particleUpdate([HSTATES_BODY_SHINE1, 'color', '#eb00ff', '#eb00ff@0.1', '#ffffff']);
  }
  if (hStage >= 4) {
    $gameScreen._particle.particleUpdate([HSTATES_BODY_SHINE1, 'emitterLifetime', '1']);
    $gameScreen.movePicture(basePicId + H_TACHIE_LAYERS.bustWhite, 1, 1024, 384, 100, 100, 0, 0, 60);
    $gameScreen._particle.particleClear(HSTATES_BG_SHINE1);
    $gameScreen._particle.particleSet(0, 'hStates_bgShine2', 'picture:57', 'def', 'blow');
  }
}

//段階2以上で背景をフェードインさせる。
function applyHStageBackgroundFade(basePicId, hStage) {
  if (hStage < 2) return;

  const fadeDuration = hStage >= 5 ? H_TACHIE_BACKGROUND_FADE_DURATION_HIGH : fadeDurationsMap[hStage] || 0;
  $gameScreen.showPicture(basePicId + H_TACHIE_LAYERS.backgroundFade,
    HSTATES_BACKGROUND + hStage, 1, 1024, 384, 100, 100, 255, 0);
  picture_fade1(basePicId + H_TACHIE_LAYERS.backgroundFade, "fadeOut", H_TACHIE_FADE_PICTURE_NAME, fadeDuration, 5);
}

//段階2以上で前景背景を切り替える。
function applyHStageBackgroundTransition(basePicId, hStage) {
  if (hStage < 2) return;

  $gameScreen.showPicture(basePicId + H_TACHIE_LAYERS.backgroundFore,
    HSTATES_BACKGROUND + hStage, 1, 1024, 384, 100, 100, 0, 0);
  $gameScreen.movePicture(basePicId + H_TACHIE_LAYERS.backgroundBase, 1, 1024, 384, 100, 100, 0, 0, 120);
  $gameScreen.movePicture(basePicId + H_TACHIE_LAYERS.backgroundFore, 1, 1024, 384, 100, 100, 255, 0, 120);
}

//表情差分(段階1/5で別名の差分を重ねる)。
function updateHStageFacePicture(basePicId, actorId, hStage) {
  $gameScreen.setPicturesAnimation(5, 1, "横", 5);
  $gameScreen.showPicture(basePicId + H_TACHIE_LAYERS.face,
    HSTATES_ACTOR_FACE + actorId + "_" + hStage, 1, 1024, 384, 100, 100, 255, 0);
  $gameScreen.picture(basePicId + H_TACHIE_LAYERS.face).startAnimationFrame(1, false, [1]);

  if (!H_TACHIE_STAGE_FACE_VARIANT.includes(hStage)) return;

  const faceVariantSuffix = faceVariantMap[hStage];
  $gameScreen.showPicture(basePicId + H_TACHIE_LAYERS.faceVariant,
    HSTATES_ACTOR_FACE + actorId + faceVariantSuffix, 1, 1024, 384, 100, 100, 0, 3);
  $gameScreen.movePicture(basePicId + H_TACHIE_LAYERS.faceVariant, 1, 1024, 384, 100, 100, 150, 3, 180);
}

//習得スキルから立ち絵の段階(191)と表情差分(192)を決める。
const H_TACHIE_STAGE_BY_SKILL = [
  { skillId: 70, stage: 6, variant: 1 },
  { skillId: 68, stage: 5, variant: 2 },
  { skillId: 66, stage: 4, variant: 1 },
  { skillId: 64, stage: 3, variant: 1 },
  { skillId: 62, stage: 2, variant: 1 }
];
const H_TACHIE_DEFAULT_STAGE = 1;

function setActorStateBasedOnSkillsHStatesTachie(actor) {
  $gameVariables.setValue(VAR_H_STAGE_VARIANT, 1);

  const stageSetting = H_TACHIE_STAGE_BY_SKILL.find((setting) => actor.isLearnedSkill(setting.skillId));
  if (!stageSetting) {
    $gameVariables.setValue(VAR_H_STAGE_STATE, H_TACHIE_DEFAULT_STAGE);
    return;
  };

  $gameVariables.setValue(VAR_H_STAGE_STATE, stageSetting.stage);
  if (stageSetting.variant != 1) {
    $gameVariables.setValue(VAR_H_STAGE_VARIANT, stageSetting.variant);
  };
}

//---------------------------------------------------------------------------
// Libido parameter reset, battle harassment, sex direction dispatch
//---------------------------------------------------------------------------

//☆☆性欲度情報をリセット
const RESET_MODE_CHOICES = 1;//選択肢作成
const RESET_MODE_APPLY = 2;//反映
const RESET_SKIPPED_VAR_IDS = [402, 403, 404, 405, 428, 429];
const RESET_SKILL_OFFSET = 20;

seiyoku_parameterReset = function (resetModeId) {

  const actorId = $gameVariables.value(VAR_CURRENT_ACTOR_ID);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;

  const hStateValues = readHStateValues(actorId);
  if (resetModeId == RESET_MODE_CHOICES) {
    fillResetChoicesValues(actor, hStateValues);
    addResetCustomChoices();
  };
  if (resetModeId != RESET_MODE_APPLY) return;

  applyResetSelection(actor, hStateValues);
  hskill_learn(2);//該当するHスキル忘却
};

//現在値(401-430)とスキル熟練度(431-439)を選択肢用に変数へ入れる。
function fillResetChoicesValues(actor, hStateValues) {
  for (let varId = VAR_HSTATE_PENDING_FIRST; varId <= VAR_HSTATE_PENDING_LAST; varId++) {
    if (varId == VAR_HSTATE_EXPOSURE_LIMIT) continue;

    if (varId <= VAR_HSTATE_PENDING_DEVELOPMENT_BASE) {
      $gameVariables.setValue(varId, hStateValues[varId - VAR_HSTATE_ECSTASY_BASE]);
      continue;
    };

    const skillId = varId - 380;
    $gameVariables.setValue(varId, actor.isLearnedSkill(skillId) ? actor.skillMasteryLevel(skillId) : 0);
  };
}

function addResetCustomChoices() {
  $gameSystem.addCustomChoice(1, { text: `一括で未経験に変更　　　　　　　　　　　　　　　　　　`, value: 0 });
  for (let varId = VAR_HSTATE_PENDING_FIRST; varId <= VAR_SUPPRESSION_TARGET_LAST; varId++) {//431-439経験値
    if (RESET_SKIPPED_VAR_IDS.includes(varId)) continue;
    $gameSystem.addCustomChoice(1, { text: `${$dataSystem.variables[varId]}${$gameVariables.value(varId)}`, value: varId });
  };
}

//選択された変数IDに応じてHステート/スキルをリセットする。
function applyResetSelection(actor, hStateValues) {
  const selectedVarId = $gameVariables.value(VAR_PENDING_HSTATE_INPUT);

  if (isHStateResetTarget(selectedVarId)) {
    resetHStateRange(actor, hStateValues, selectedVarId, 1, 30);
  };
  if (isSkillResetTarget(selectedVarId)) {
    resetSkillRange(actor, selectedVarId, 31, 40);
  };
}

//変数IDがHステート側(1-30)のリセット対象か。
function isHStateResetTarget(selectedVarId) {
  return selectedVarId == 0 || (isInRange(selectedVarId - 400, 1, 30));
}

//変数IDがスキル側(31-40)のリセット対象か。
function isSkillResetTarget(selectedVarId) {
  return selectedVarId == 0 || (isInRange(selectedVarId - 400, 31, 40));
}

function isInRange(value, minValue, maxValue) {
  return value >= minValue && value <= maxValue;
}

//Hステートのリセット(0指定は全範囲)。
function resetHStateRange(actor, hStateValues, selectedVarId, minIndex, maxIndex) {
  const startIndex = selectedVarId == 0 ? minIndex : selectedVarId - 400;
  const endIndex = selectedVarId == 0 ? maxIndex : selectedVarId - 400;

  for (let index = startIndex; index <= endIndex; index++) {
    if (!(hStateValues[index] >= 1)) continue;

    hStateValues[index] = 0;
    $gameVariables.setValue(index + VAR_HSTATE_ECSTASY_BASE, 0);

    const variableNameText = cleanVariableLabel($dataSystem.variables[index + VAR_HSTATE_ECSTASY_BASE]);
    showResetNotice(`\\C[1]${variableNameText}\\C[0]がリセットされました…`);

    if (index == HSTATE_INDEX_SEX_COUNT) {
      hStateValues[HSTATE_INDEX_FIRST_PARTNER] = 0;
      showResetNotice(`\\C[2]初体験相手\\C[0]がリセットされました…`);
    };
  };
}

//Hスキルの忘却(0指定は全範囲)。
function resetSkillRange(actor, selectedVarId, minIndex, maxIndex) {
  const startIndex = selectedVarId == 0 ? minIndex : selectedVarId - 400;
  const endIndex = selectedVarId == 0 ? maxIndex : selectedVarId - 400;

  for (let index = startIndex; index <= endIndex; index++) {
    const skillId = index + RESET_SKILL_OFFSET;
    if (!actor.isLearnedSkill(skillId)) continue;

    actor.setSkillMasteryUses(skillId, 0);
    actor.setSkillMasteryLevel(skillId, 0);
    actor.forgetSkill(skillId);
    const skillName = $dataSkills[skillId].name;
    showResetNotice(`${skillName}忘却…`);
  };
}

function showResetNotice(resetMessage) {
  CommonPopupManager.showInfo({}, resetMessage, null);
}

//☆☆拘束前のセクハラ演出
const SEKUHARA_STATE_ID = 81;
const SEKUHARA_STATE_COUNTER_BONUS = 10;
const SEKUHARA_STATE_SWITCH_ID = 437;
const SEKUHARA_OVERLAY_PICTURE_ID = 54;
const SEKUHARA_OVERLAY_PICTURE_NAME = 'Screen_Width512Black';//右側のみＨＣＧの際に使用
const SEKUHARA_PICTURE_ID_BASE = 60;
const SEKUHARA_DEFAULT_IMAGE_DURATION = 180;
const SEKUHARA_IMAGE_SETTINGS = [
  { exposureThreshold: 1000, imageDuration: 120, poseVariant: 6 },
  { exposureThreshold: 800, imageDuration: 140, poseVariant: 5 },
  { exposureThreshold: 600, imageDuration: 150, poseVariant: 4 },
  { exposureThreshold: 400, imageDuration: 160, poseVariant: 3 },
  { exposureThreshold: 200, imageDuration: 170, poseVariant: 2 }
];
const SEKUHARA_SKIPPED_POSE_INDEXES_FOR_BUST = 2;
const SEKUHARA_POSE_INDEX_WITH_MOVIE = 9;
const SEKUHARA_POSE_INDEX_REQUIRED_STAGE = 6;
const SEKUHARA_POSE_INDEX_PREGNANT = 8;
const SEKUHARA_POSE_INDEX_WITH_PISTON = 4;
const SEKUHARA_SINGLE_VARIANT_POSE_INDEXES = [1, 2, 4, 5, 6, 8];

actor_battleSekughara1 = function () {

  const actorId = $gameVariables.value(VAR_CURRENT_ACTOR_ID);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;

  const stateCounter = addSekuharaState(actor);
  const hStateValues = readHStateValues(actorId);
  const arousalValue = hStateValues[HSTATE_INDEX_AROUSAL];

  if (isSekuharaSwitchEnabled(arousalValue, stateCounter)) {
    $gameSwitches.setValue(SEKUHARA_STATE_SWITCH_ID, true);
  };

  $gameScreen.showPicture(SEKUHARA_OVERLAY_PICTURE_ID, SEKUHARA_OVERLAY_PICTURE_NAME, 1, 1024 - 100, 384, 100, 100, 0, 0);
  $gameScreen.movePicture(SEKUHARA_OVERLAY_PICTURE_ID, 1, 1024 - 50, 384, 100, 100, 200, 0, 60);

  valuePic1 = SEKUHARA_PICTURE_ID_BASE;
  const imageSetting = resolveSekuharaImageSetting(arousalValue);
  const enemyType = $gameSwitches.value(SW_GOBLIN_ENEMY) ? 2 : 1;//相手によって変更.1ヒト2ゴブ3巨人

  showSekuharaPoses(actor, actorId, imageSetting, enemyType);

  $gameVariables.setValue(VAR_H_SCENE_TEXT_X, actorId);//文字HBGV
  $gameVariables.setValue(VAR_H_SCENE_PICTURE_PARAMS, [640 + 400, 384 + 20, 1, 60, 0, 0]);
  $gameSwitches.setValue(SW_ECSTASY_VOICE, true);

};

//セクハラステートを付与し、経過カウンタを返す。
function addSekuharaState(actor) {
  actor.addState(SEKUHARA_STATE_ID);
  if (actor._stateCounter[SEKUHARA_STATE_ID] >= 1) {
    actor.addStateCounter(SEKUHARA_STATE_ID, +SEKUHARA_STATE_COUNTER_BONUS);
  } else {
    actor.setStateCounter(SEKUHARA_STATE_ID, 1);
  };
  return actor._stateCounter[SEKUHARA_STATE_ID];
}

//性欲度とカウンタからスイッチ(437)を立てるか判定。
function isSekuharaSwitchEnabled(arousalValue, stateCounter) {
  const exposureThreshold = Math.ceil((arousalValue + 1) / 10) + stateCounter;//0の場合の対策で+1
  return exposureThreshold >= getRandomIndex(101);
}

//性欲度に応じた表示時間とポーズ段階。
function resolveSekuharaImageSetting(arousalValue) {
  const matchedSetting = SEKUHARA_IMAGE_SETTINGS.find((setting) => arousalValue >= setting.exposureThreshold);
  return matchedSetting || { imageDuration: SEKUHARA_DEFAULT_IMAGE_DURATION, poseVariant: 1 };
}

//ポーズ1-9を表示する。
function showSekuharaPoses(actor, actorId, imageSetting, enemyType) {
  const physiqueStateValues = readPartnerBodyValues(actorId);
  //変更: 元コードは poseVariant をループ外で使い回していた(後のポーズに影響)。
  //      その挙動を保つため、算出結果を次のポーズへ引き継ぐ。
  let poseVariant = imageSetting.poseVariant;

  for (let poseIndex = 1; poseIndex < 10; poseIndex++) {
    if (isSekuharaPoseSkipped(poseIndex, poseVariant, physiqueStateValues, actor)) continue;

    poseVariant = resolveSekuharaPoseVariant(poseIndex, poseVariant, physiqueStateValues, enemyType);
    showSekuharaPose(actorId, poseIndex, poseVariant, imageSetting.imageDuration);
  };
}

//表示しないポーズか。
function isSekuharaPoseSkipped(poseIndex, poseVariant, physiqueStateValues, actor) {
  if (poseIndex == SEKUHARA_SKIPPED_POSE_INDEXES_FOR_BUST && physiqueStateValues[HSTATE_BODY_INDEX_BUST_FLAG] == 0) return true;
  if (poseIndex == SEKUHARA_POSE_INDEX_REQUIRED_STAGE && poseVariant <= 3) return true;
  if (poseIndex == SEKUHARA_POSE_INDEX_PREGNANT && !actor.isStateAffected(STATE_PREGNANT)) return true;
  return false;
}

//ポーズごとの差分番号(元コードの順序依存をそのまま維持)。
function resolveSekuharaPoseVariant(poseIndex, imageSettingVariant, physiqueStateValues, enemyType) {
  let poseVariant = imageSettingVariant;
  if (SEKUHARA_SINGLE_VARIANT_POSE_INDEXES.includes(poseIndex)) { poseVariant = 1 };
  if (poseIndex == 3 && poseVariant >= 5) { poseVariant = 2 };
  if (poseIndex == 5 && physiqueStateValues[HSTATE_BODY_INDEX_HEAD_VARIANT] >= 1) { poseVariant = 2 };
  if (poseIndex == SEKUHARA_POSE_INDEX_WITH_MOVIE) { poseVariant = enemyType };
  return poseVariant;
}

function showSekuharaPose(actorId, poseIndex, poseVariant, imageDuration) {
  const pictureId = valuePic1 + poseIndex;
  const isMovie = poseIndex == SEKUHARA_POSE_INDEX_WITH_MOVIE;
  let secuharaImageName;

  if (isMovie) {
    $gameScreen.setPicturesAnimation(2, imageDuration, '連番', 30);
    secuharaImageName = 'Zev_BattleSekuharaActor' + actorId + '_' + poseIndex + '_' + poseVariant + '_0';
  } else {
    secuharaImageName = 'Zev_BattleSekuharaActor' + actorId + '_' + poseIndex + '_' + poseVariant;
  };

  $gameScreen.showPicture(pictureId, secuharaImageName, 1, 640 + 400, 384 + 50, 100, 100, 0, 0);
  if (isMovie) {
    $gameScreen.picture(pictureId).startAnimationFrame(1, true, [2, 3]);
  };
  $gameScreen.movePicture(pictureId, 1, 640 + 400, 384 + 20, 100, 100, 255, 0, 40);

  if (isMovie || poseIndex == SEKUHARA_POSE_INDEX_WITH_PISTON) {
    hcg_piston(pictureId, 9, 2, 2);
    return;
  };
  tachie_bless(pictureId, 1);
}

//---------------------------------------------------------------------------
// H action direction (BGS lines and sound effects)
//---------------------------------------------------------------------------

//☆☆H時の音や効果 BGSライン。通常1,Ｈ2-9,天候10,Bgv10+アクターID//
const ACTION_TYPE_NO_OP = 99;//全BGS停止
const ACTION_TYPE_FLASH = 0;
const ACTION_TYPE_PISTON_WEAK = 1;
const ACTION_TYPE_PISTON_STRONG = 2;
const ACTION_TYPE_FLUID = 3;
const ACTION_TYPE_KISS = 4;
const ACTION_TYPE_FELLATIO = 5;
const ACTION_TYPE_BUST_KNEAD = 6;
const ACTION_TYPE_VIBRATION = 7;
const ACTION_TYPE_VIBRATION_STRONG = 8;
const ACTION_TYPE_INSERTION = 11;
const ACTION_TYPE_EJACULATION = 12;
const ACTION_TYPE_NO_EJACULATION = 13;
const ACTION_TYPE_PHOTOGRAPH = 51;
const ACTION_TYPE_EYES_CLOSE = 52;
const ACTION_TYPE_EYES_OPEN = 53;
const ACTION_TYPE_PINK_FLASH = 54;

const H_PINK_FLASH_PICTURE_ID = 111;//変更: 立ち絵の基準ID(111)と同じIDを使う既存挙動をそのまま維持
const H_PHOTOGRAPH_PICTURE_NAME = 'ScreenWhiteOut';
const H_BLACK_OUT_PICTURE_NAME = 'ScreenBlackOut';
const H_FLASH_COLOR_PINK = [255, 119, 255];

sex_direction = function (actionType, pistonIntensity, patternVariant) {

  const voiceInfo = readHSceneVoiceInfo($gameVariables.value(VAR_H_SCENE_ACTOR), pistonIntensity);
  //強度0はスキルから決まる(表引きの前に確定させる)
  const resolvedPistonIntensity = voiceInfo.resolvedPistonIntensity != null
    ? voiceInfo.resolvedPistonIntensity
    : pistonIntensity;

  routeSexAction(actionType, resolvedPistonIntensity, patternVariant, voiceInfo.voicePatternNum);
};

//行動種別を専用処理へ振り分ける。未知の種別は何もしない。
function routeSexAction(actionType, pistonIntensity, patternVariant, voicePatternNum) {
  const handler = SEX_ACTION_HANDLERS[actionType];
  if (!handler) return;
  handler(pistonIntensity, patternVariant, voicePatternNum);
}

//声パターン番号と、0指定時にスキルから決めるピストン強度。
function readHSceneVoiceInfo(actorId, pistonIntensity) {
  if (actorId < 1) return { voicePatternNum: 0, resolvedPistonIntensity: null };

  $gameVariables.setValue(VAR_CURRENT_ACTOR_ID, actorId);

  const actorData = $dataActors[actorId];
  if (!actorData || !actorData.meta['HvoicePattern']) {
    return { voicePatternNum: 0, resolvedPistonIntensity: null };
  };

  const voicePatternNum = Number(actorData.meta['HvoicePattern']);
  if (pistonIntensity != 0) return { voicePatternNum, resolvedPistonIntensity: null };

  const actor = $gameActors.actor(actorId);
  const resolvedPistonIntensity = actor && actor.isLearnedSkill(SKILL_H_SKILLED) ? 2 : 1;
  return { voicePatternNum, resolvedPistonIntensity };
}

function actionType99SexDirection() {
  // 全BGS停止。変数194(ライン番号)を1に戻す。
  AudioManager.stopAllBgs();
  $gameVariables.setValue(VAR_H_STAGE_MESSAGE, 1);
}

const H_DIRECT_PARTICLE_NAME = 'hScene_Direct1';

function actionType0SexDirection() {
  $gameScreen._particle.particleClear(H_DIRECT_PARTICLE_NAME);
  const flashDuration = getRandomIndex(41) + 180;
  const flashIntensity = getRandomIndex(21) + 40;
  $gameScreen.startFlash([H_FLASH_COLOR_PINK[0], H_FLASH_COLOR_PINK[1], H_FLASH_COLOR_PINK[2], flashDuration], flashIntensity);
  $gameScreen._particle.particleSet(0, H_DIRECT_PARTICLE_NAME, 'screen', 'def', 'screen');
}

class SexActionSoundEffectBase {
  constructor(pistonIntensity, patternVariant, voicePatternNum) {
    this.pistonIntensity = pistonIntensity;
    this.patternVariant = patternVariant;
    this.voicePatternNum = voicePatternNum;
  }

  // 既定値は actionType 3(愛液/Fluid)向け。

  // 1回目のBGS設定
  get soundName() {
    return "21_LoveJuice";
  }
  get volumeRandomIndexMax() {
    return 31;
  }
  get volumeOffset() {
    return 80;
  }
  get pitchRandomIndexMax() {
    return 41;
  }
  get pitchOffset() {
    return 80;
  }

  // 2回目のBGS設定(任意)
  get playSecond() {
    return true;
  }
  get soundName2() {
    return this.soundName;
  }
  get volumeRandomIndexMax2() {
    return this.volumeRandomIndexMax;
  }
  get volumeOffset2() {
    return this.volumeOffset;
  }
  get pitchRandomIndexMax2() {
    return this.pitchRandomIndexMax;
  }
  get pitchOffset2() {
    return 50;
  }

  // BGSライン設定を進める。
  updateBgsLineSetting() {
    $gameVariables.setValue(VAR_H_STAGE_MESSAGE, $gameVariables.value(VAR_H_STAGE_MESSAGE) + 1);
    $gameSystem.setBgsLine($gameVariables.value(VAR_H_STAGE_MESSAGE));
  }

  playBgs(soundName, volumeOffset, pitchOffset, volumeRandomIndexMax, pitchRandomIndexMax) {
    const volume = getRandomIndex(volumeRandomIndexMax) + volumeOffset;
    const pitch = getRandomIndex(pitchRandomIndexMax) + pitchOffset;
    AudioManager.playBgs({ "name": soundName, "volume": volume, "pitch": pitch, "pan": 0 });
  }

  get patternStrength() {
    return 7;
  }
  get patternVolumeOffset() {
    return 70;
  }
  get patternPitchOffset() {
    return 100;
  }
  get patternVolumeRandomIndexMax() {
    return 21;
  }
  get patternPitchRandomIndexMax() {
    return 21;
  }
  get isValidToPlayPatternBgs() {
    return this.voicePatternNum >= 1 && this.pistonIntensity <= 9;
  }
  getPatternSoundName(patternOption) {
    return "51_pattern" + this.voicePatternNum + "_" + this._patternStrength + "_" + patternOption;
  }
  get patternOptions0() {
    return [1];
  }
  get patternOptions1() {
    return [1, 2, 3];
  }
  get patternOptions2() {
    return [1, 2];
  }

  // 差分に応じたパターン番号を選ぶ。
  getPatternOption() {
    $gameSystem.setBgsLine(10 + $gameVariables.value(VAR_CURRENT_ACTOR_ID));
    let patternOptions = this.patternOptions0;
    this._patternStrength = this.patternStrength;

    if (this.patternVariant === 1) {
      patternOptions = this.patternOptions1;
    }
    if (this.pistonIntensity === 2) {
      this._patternStrength += 1;
      if (this.patternVariant === 1) {
        patternOptions = this.patternOptions2;
      }
    }
    return patternOptions[getRandomIndex(patternOptions.length)];
  }

  playPatternBGS() {
    if (!this.isValidToPlayPatternBgs) return;

    const patternName = this.getPatternSoundName(this.getPatternOption());
    const patternVolume = getRandomIndex(this.patternVolumeRandomIndexMax) + this.patternVolumeOffset;
    const patternPitch = getRandomIndex(this.patternPitchRandomIndexMax) + this.patternPitchOffset;
    AudioManager.playBgs({ "name": patternName, "volume": patternVolume, "pitch": patternPitch, "pan": 0 });
  }

  // サブクラスがplay()を継承して使う共通処理。
  play() {
    this.updateBgsLineSetting();
    this.playBgs(this.soundName, this.volumeOffset, this.pitchOffset, this.volumeRandomIndexMax, this.pitchRandomIndexMax);

    if (this.playSecond) {
      this.updateBgsLineSetting();
      //変更: ゲッターを関数として呼んでいた為TypeErrorになっていた
      this.playBgs(this.soundName2, this.volumeOffset2, this.pitchOffset2, this.volumeRandomIndexMax2, this.pitchRandomIndexMax2);
    }

    this.playPatternBGS();
  }
}

class FluidSoundEffect extends SexActionSoundEffectBase {
  // 既定値がそのまま愛液向けの設定になっている
}

class Piston1SoundEffect extends SexActionSoundEffectBase {
  get soundName() {
    return "21_Piston1";
  }
  get volumeRandomIndexMax() {
    return 21;
  }
  get volumeOffset() {
    return 90;
  }
  get pitchRandomIndexMax() {
    return 31;
  }
  get pitchOffset() {
    return 90;
  }
  get playSecond() {
    return false;
  }
  get patternStrength() {
    return 5;
  }
  get patternOptions2() {
    return [1, 2, 3];
  }
  get patternVolumeOffset() {
    return 100;
  }
}

class Piston2SoundEffect extends Piston1SoundEffect {
  get pitchOffset() {
    return 120;
  }
  get patternVolumeOffset() {
    return 70;
  }
  get patternPitchOffset() {
    return 110;
  }
}

class KissSoundEffect extends SexActionSoundEffectBase {
  get patternStrength() {
    return 1;
  }
  get patternOptions2() {
    return [1, 2, 3, 4, 5, 6];
  }
  get patternPitchRandomIndexMax() {
    return 31;
  }
  get patternPitchOffset() {
    return 90;
  }
}

class FellatioSoundEffect extends SexActionSoundEffectBase {
  get patternStrength() {
    return 3;
  }
  get patternOptions1() {
    return [1, 2, 3, 4, 5, 6, 7, 8];
  }
  get patternOptions2() {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }
  get isValidToPlayPatternBgs() {
    return this.voicePatternNum >= 1;
  }
  get patternPitchOffset() {
    return 90;
  }
}

class BustKneadSoundEffect extends SexActionSoundEffectBase {
  get soundName() {
    return "21_BustKnead";
  }
  get volumeRandomIndexMax() {
    return 11;
  }
  get volumeOffset() {
    return 10;
  }
  get playSecond() {
    return false;
  }
}

class HandyMassager2SoundEffect extends SexActionSoundEffectBase {
  get soundName() {
    return "21_HandyMassager2";
  }
  get volumeRandomIndexMax() {
    return 21;
  }
  get volumeOffset() {
    return 50;
  }
  get pitchRandomIndexMax() {
    return 21;
  }
  get playSecond() {
    return false;
  }
}

class VibratorSoundEffect extends SexActionSoundEffectBase {
  get soundName() {
    return "21_HandyMassager2";
  }
  get volumeRandomIndexMax() {
    return 21;
  }
  get volumeOffset() {
    return 60;
  }
  get pitchRandomIndexMax() {
    return 31;
  }
  get pitchOffset() {
    return 100;
  }
  get playSecond() {
    return false;
  }
}

function actionType1SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  playSexActionSoundEffect(Piston1SoundEffect, pistonIntensity, patternVariant, voicePatternNum);
}

function actionType2SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  playSexActionSoundEffect(Piston2SoundEffect, pistonIntensity, patternVariant, voicePatternNum);
}

function actionType3SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  playSexActionSoundEffect(FluidSoundEffect, pistonIntensity, patternVariant, voicePatternNum);
}

function actionType4SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  playSexActionSoundEffect(KissSoundEffect, pistonIntensity, patternVariant, voicePatternNum);
}

function actionType5SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  playSexActionSoundEffect(FellatioSoundEffect, pistonIntensity, patternVariant, voicePatternNum);
}

function actionType6SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  playSexActionSoundEffect(BustKneadSoundEffect, pistonIntensity, patternVariant, voicePatternNum);
}

function actionType7SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  playSexActionSoundEffect(HandyMassager2SoundEffect, pistonIntensity, patternVariant, voicePatternNum);
}

function actionType8SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  playSexActionSoundEffect(VibratorSoundEffect, pistonIntensity, patternVariant, voicePatternNum);
}

// 挿入/射精系の効果音。待ち時間の有無で鳴らし方が変わる。
const INSERTION_SE_OPTIONS = ['Z_zamen1', 'Z_zamen2'];
const EJACULATION_SE_OPTIONS = ['Z_zamen'];
const INSERTION_SE_VOLUME_RANDOM_MAX = 21;
const INSERTION_SE_PITCH_RANDOM_MAX = 41;

class InsertionSoundEffect {

  get seOptions() {
    return INSERTION_SE_OPTIONS;
  };

  get maxRandomIndexSexWait() {
    return 21;
  }

  get noWaitSePitch() {
    return getRandomIndex(INSERTION_SE_PITCH_RANDOM_MAX) + 80;
  }

  // ランダムな効果音を鳴らす。
  playRandomSE(seName, seVolume, sePitch, seOptions) {
    const options = seOptions || this.seOptions;
    const soundName = seName || options[getRandomIndex(options.length)];
    const volume = seVolume || getRandomIndex(INSERTION_SE_VOLUME_RANDOM_MAX) + 100;
    const pitch = sePitch || getRandomIndex(INSERTION_SE_PITCH_RANDOM_MAX) + 80;
    AudioManager.playSe({ name: soundName, volume: volume, pitch: pitch, pan: 0 });
  };

  prePlay() {
    adv_partDirectPlay(7);
  };

  play() {
    this.prePlay();

    const flashDuration = getRandomIndex(41) + 160;
    const shakeIntensity = getRandomIndex(21) + 50;
    $gameScreen.startFlash([H_FLASH_COLOR_PINK[0], H_FLASH_COLOR_PINK[1], H_FLASH_COLOR_PINK[2], flashDuration], shakeIntensity);

    if (valueSexWait >= 1) {
      this.playRandomSE();
      this.playRandomSE();
      valueSexWait = 0;
      return;
    };

    // 待ち時間が無い時は揺れ+1回だけ鳴らし、次回の待ち時間を引く。
    const shakeDuration = getRandomIndex(5) + 6;
    $gameScreen.startShake(shakeDuration, shakeDuration, shakeIntensity);
    this.playRandomSE(null, null, this.noWaitSePitch, null);
    valueSexWait = getRandomIndex(this.maxRandomIndexSexWait) + 20;
  }
}

class NoEjaculationSoundEffect extends InsertionSoundEffect {
  get maxRandomIndexSexWait() {
    return 11;
  }

  prePlay() {
    AudioManager.stopAllBgs();
    adv_partDirectSet(0);
    sex_direction(0); // 結束：集中線終了
  }
}

class EjaculationSoundEffect extends NoEjaculationSoundEffect {
  get seOptions() {
    return EJACULATION_SE_OPTIONS;
  }

  get noWaitSePitch() {
    return getRandomIndex(51) + 100;
  }
}

function actionType11SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  playSexActionSoundEffect(InsertionSoundEffect, pistonIntensity, patternVariant, voicePatternNum);
}

function actionType12SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  playSexActionSoundEffect(EjaculationSoundEffect, pistonIntensity, patternVariant, voicePatternNum);
}

function actionType13SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  new NoEjaculationSoundEffect().prePlay();
}

function actionType51SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  //写真撮影。ピクチャIDは強度が流用される。
  $gameScreen.showPicture(pistonIntensity, H_PHOTOGRAPH_PICTURE_NAME, 1, 640, 384, 100, 100, 250, 0);
  $gameScreen.movePicture(pistonIntensity, 1, 640, 384, 100, 100, 0, 0, 20);
  AudioManager.playSe({ "name": 'ZH_Photograph', "volume": 100, "pitch": 100, "pan": 0 });
  valueSexWait = 30;
}

//眼パチ閉/開く共通処理。fadeTypeは "fadeIn"(閉)か "fadeOut"(開く)。
function actionTypeEyesSexDirection(pistonIntensity, patternVariant, voicePatternNum, fadeType) {
  $gameScreen.showPicture(pistonIntensity, H_BLACK_OUT_PICTURE_NAME, 1, 640, 384, 100, 100, 255, 0);
  picture_fade1(pistonIntensity, fadeType, 'SceneCloseOpenEyes', patternVariant, 5);
  valueSexWait = patternVariant;
}

function actionType52SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  actionTypeEyesSexDirection(pistonIntensity, patternVariant, voicePatternNum, "fadeIn");
}

function actionType53SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  actionTypeEyesSexDirection(pistonIntensity, patternVariant, voicePatternNum, "fadeOut");
}

//全ての行動種別はこの1か所から効果音クラスを鳴らす。
function playSexActionSoundEffect(SoundEffectClass, pistonIntensity, patternVariant, voicePatternNum) {
  new SoundEffectClass(pistonIntensity, patternVariant, voicePatternNum).play();
}

function actionType54SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  //薄くピンク点灯
  const pinkFlashPictureName = 'ScreenPinkFlash';
  $gameScreen.setPicturesAnimation(2, patternVariant / 2, "横", patternVariant);
  $gameScreen.showPicture(H_PINK_FLASH_PICTURE_ID, pinkFlashPictureName, 1, 640, 384, 100, 100, pistonIntensity, 3);
  $gameScreen.picture(H_PINK_FLASH_PICTURE_ID).startAnimationFrame(1, true, [1, 1, 1, 2]);
}

//行動種別 -> 処理関数。actionType の値はゲーム側のコモンイベントが渡す。
const SEX_ACTION_HANDLERS = {
  [ACTION_TYPE_NO_OP]: actionType99SexDirection,
  [ACTION_TYPE_FLASH]: actionType0SexDirection,
  [ACTION_TYPE_PISTON_WEAK]: actionType1SexDirection,
  [ACTION_TYPE_PISTON_STRONG]: actionType2SexDirection,
  [ACTION_TYPE_FLUID]: actionType3SexDirection,
  [ACTION_TYPE_KISS]: actionType4SexDirection,
  [ACTION_TYPE_FELLATIO]: actionType5SexDirection,
  [ACTION_TYPE_BUST_KNEAD]: actionType6SexDirection,
  [ACTION_TYPE_VIBRATION]: actionType7SexDirection,
  [ACTION_TYPE_VIBRATION_STRONG]: actionType8SexDirection,
  [ACTION_TYPE_INSERTION]: actionType11SexDirection,
  [ACTION_TYPE_EJACULATION]: actionType12SexDirection,
  [ACTION_TYPE_NO_EJACULATION]: actionType13SexDirection,
  [ACTION_TYPE_PHOTOGRAPH]: actionType51SexDirection,
  [ACTION_TYPE_EYES_CLOSE]: actionType52SexDirection,
  [ACTION_TYPE_EYES_OPEN]: actionType53SexDirection,
  [ACTION_TYPE_PINK_FLASH]: actionType54SexDirection
};

//---------------------------------------------------------------------------
// ADV H part effects
//---------------------------------------------------------------------------

//ADVＨパート演出クリアも。0実行1終了
const ADVDIRECT_CLEAR = 0;
const ADVDIRECT_FEEL = 1;
const ADVDIRECT_STRONG_FEEL = 2;
const ADVDIRECT_EXTREME_CLIMAX = 3;
const ADVDIRECT_LIGHT_FEEL = 4;
const ADVDIRECT_SHOW_BREASTS = 5;

adv_HpartDirectPlay = function (effectType) {
  switch (effectType) {
    case ADVDIRECT_CLEAR: {
      adv_HpartDirectPlay_Clear();
      break;
    }
    case ADVDIRECT_FEEL: { // 感じる
      adv_HpartDirectPlay_Feel();
      break;
    }
    case ADVDIRECT_STRONG_FEEL: { // 激しく感じる
      adv_HpartDirectPlay_StrongFeel();
      break;
    }
    case ADVDIRECT_EXTREME_CLIMAX: { // 絶頂激しく感じる。永続クリア必須
      adv_HpartDirectPlay_ExtremeClimax();
      break;
    }
    case ADVDIRECT_LIGHT_FEEL: { // 軽く感じる
      adv_HpartDirectPlay_LightFeel();
      break;
    }
    case ADVDIRECT_SHOW_BREASTS: { // 乳見せ
      adv_HpartDirectPlay_ShowBreasts();
      break;
    }
    default: {
      // 未知の種別は何もしない
      break;
    }
  }
};

const ADVDIRECT_PARTICLE_NAMES_TO_CLEAR = ['Ecstasy_c1', 'lines_heightH1'];

function adv_HpartDirectPlay_Clear() {
  for (const particleName of ADVDIRECT_PARTICLE_NAMES_TO_CLEAR) {
    $gameScreen._particle.particleClear(particleName);
  };
}

// ADV Hパート演出の共通基底。optionsで見た目/音量を差し替える。
class AdvHPartDirectPlayEffect {
  constructor(options = {}) {
    this.particleName = 'Ecstasy_c1';
    // options: alpha(文字列), scaleUpdate([開始,終了]), soundPitchOffset(number), filterDuration(number)
    this.alpha = options.alpha || '0.4';
    this.scaleUpdate = options.scaleUpdate;
    this.soundPitchOffset = options.soundPitchOffset || 60;
    this.filterDuration = options.filterDuration || 40;
  }

  get heartbeatSoundOptions() {
    return ['Z_HeartBeatDarty'];
  }

  final() {
    filter_direct(9, 640 - 128, 368, this.filterDuration);
  }

  play() {
    $gameScreen._particle.particlePlay(0, this.particleName, 'screen', 'def', 'spriteset');
    $gameScreen._particle.particleUpdate([this.particleName, 'alpha', this.alpha, '0']);
    if (this.scaleUpdate !== undefined) {
      $gameScreen._particle.particleUpdate([this.particleName, 'scale', this.scaleUpdate[0], this.scaleUpdate[1]]);
    }

    const heartbeatSoundOptions = this.heartbeatSoundOptions;
    const selectedHeartbeatSound = heartbeatSoundOptions[getRandomIndex(heartbeatSoundOptions.length)];
    const soundVolume = getRandomIndex(21) + 100;
    const soundPitch = getRandomIndex(41) + this.soundPitchOffset;
    AudioManager.playSe({ name: selectedHeartbeatSound, volume: soundVolume, pitch: soundPitch, pan: 0 });
    this.final();
  }
}

// 1: 感じる
class AdvHPartDirectPlay_FeelEffect extends AdvHPartDirectPlayEffect {
  constructor() {
    super({
      alpha: '0.4',
      soundPitchOffset: 60,
      filterDuration: 40
    });
  }
}

// 2: 激しく感じる(スケール変更あり)
class AdvHPartDirectPlay_StrongFeelEffect extends AdvHPartDirectPlayEffect {
  constructor() {
    super({
      alpha: '0.4',
      scaleUpdate: ['10', '40'],
      soundPitchOffset: 40,
      filterDuration: 60
    });
  }
}

// 4: 軽く感じる
class AdvHPartDirectPlay_LightFeelEffect extends AdvHPartDirectPlayEffect {
  constructor() {
    super({
      alpha: '0.3',
      soundPitchOffset: 80,
      filterDuration: 30
    });
  }
}

// 5: 乳見せ(フラッシュのみ)
class Adv_HpartDirectPlay_ShowBreastsEffect extends AdvHPartDirectPlayEffect {
  constructor() {
    super({
      alpha: '0.2',
      soundPitchOffset: 80,
      filterDuration: 0
    });
  }

  get heartbeatSoundOptions() {
    return ['ZH_Knead1', 'ZH_Knead1', 'ZH_Knead1'];
  }

  final() {
    $gameScreen.startFlash([H_FLASH_COLOR_PINK[0], H_FLASH_COLOR_PINK[1], H_FLASH_COLOR_PINK[2], 200], 60);
  }
}

function adv_HpartDirectPlay_Feel() {
  new AdvHPartDirectPlay_FeelEffect().play();
}

function adv_HpartDirectPlay_StrongFeel() {
  new AdvHPartDirectPlay_StrongFeelEffect().play();
}

function adv_HpartDirectPlay_LightFeel() {
  new AdvHPartDirectPlay_LightFeelEffect().play();
}

function adv_HpartDirectPlay_ShowBreasts() {
  new Adv_HpartDirectPlay_ShowBreastsEffect().play();
}

const EXTREME_CLIMAX_WORD = '絶頂';
const EXTREME_CLIMAX_PISTON_PICTURE_ID = 57;

// 3: 絶頂激しく感じる。2回目で解除。
function adv_HpartDirectPlay_ExtremeClimax() {
  if (valueWordSet0 == EXTREME_CLIMAX_WORD) {
    clearExtremeClimax();
    return;
  };
  startExtremeClimax();
}

function clearExtremeClimax() {
  filter_direct(1, 640, 384, 0.03);
  valueWordSet0 = 0;
  adv_HpartDirectPlay_Clear();
  adv_partDirectSet(0);
  $gameScreen.eraseParallax(7);
  $gameScreen.erasePicture(51);
  $gameScreen.erasePicture(EXTREME_CLIMAX_PISTON_PICTURE_ID);
}

function startExtremeClimax() {
  valueWordSet0 = EXTREME_CLIMAX_WORD;
  hcg_piston(EXTREME_CLIMAX_PISTON_PICTURE_ID, 5, 1, 1);
  filter_direct(1, 640, 384, 0.01);
  adv_partDirectSet(2);

  const particleName = 'Ecstasy_c1';
  //注意: 元コードは 'spritset' と綴っていた(その挙動を維持)
  $gameScreen._particle.particlePlay(0, particleName, 'screen', 'def', 'spritset');
  $gameScreen._particle.particleUpdate([particleName, 'scale', '10', '20']);
  $gameScreen._particle.particleUpdate([particleName, 'alpha', '0.30', '0']);
}

//---------------------------------------------------------------------------
// Libido skill probability up
//---------------------------------------------------------------------------
//☆☆性欲スキルで確率上昇。最大50%
const skillRangeSeiyokuSkillProbabilityUp = [61, 62, 63, 64, 65, 66, 67, 68, 69, 70];
const SEIYOKU_SKILL_PROBABILITY_STEP = 5;

seiyoku_skillProbabilityUp = function () {

  const actorId = $gameVariables.value(VAR_CURRENT_ACTOR_ID);
  if (actorId === 0) {
    $gameVariables.setValue(VAR_H_SCENE_SPOKEN_TEXT, 1);
    return;
  };

  seiyoku_skillProbabilityUp1($gameActors.actor(actorId));
};

seiyoku_skillProbabilityUp1 = function (gameActor) {

  if (!gameActor) {
    valueCountSet3 = 0;
    return;
  };

  valueCountSet3 = countLearnedSeiyokuSkills(gameActor) * SEIYOKU_SKILL_PROBABILITY_STEP;
};

//習得済みの性欲スキル数。
function countLearnedSeiyokuSkills(gameActor) {
  let learnedCount = 0;
  for (const skillId of skillRangeSeiyokuSkillProbabilityUp) {
    if (gameActor.isLearnedSkill(skillId)) learnedCount += 1;
  };
  return learnedCount;
}

//}());
