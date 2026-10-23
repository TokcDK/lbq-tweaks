/*:
* @plugindesc このゲーム専用プラグイン
* @author 作者名
* @help ゲーム専用に作成された初期読み込み用プラグイン
*/

//(function(){

//---------------------------------------------------------------------------
// Game variable / switch IDs used by this plugin (named after their meaning)
//---------------------------------------------------------------------------
const VAR_CURRENT_ACTOR_ID = 20;          // actor id currently being processed
const VAR_MAIN_ACTOR_ID = 2;              // main character actor id
const VAR_PARTNER_WEAPON_ID = 340;        // partner weapon id (301 is the generic partner)
const VAR_PARTNER_NAME = 22;              // display variable for the partner name
const VAR_ACTOR_NAME_MIRROR = 94;         // temporary copy of an actor name
const VAR_H_PICTURE_NAME = 193;           // standing picture name of the H CG
const VAR_H_STAGE_STATE = 191;            // stage of the standing picture (1-6)
const VAR_H_STAGE_VARIANT = 192;          // expression variant of the standing picture
const VAR_H_STAGE_MESSAGE = 194;          // BGS line number
const VAR_MESSAGE_STACK = 506;            // accumulated suppression / cap messages
const VAR_MESSAGE_STACK_COUNT = 540;
const VAR_MESSAGE_STACK_ALT = 539;
const VAR_PENDING_HSTATE_INPUT = 19;      // variable id picked in the choice window
const VAR_CHOICE_RESULT = 18;             // unused / reserved
const VAR_HSTATE_SELECTED_VALUE = 641;    // temporary copy of the H count with the partner
const VAR_LAST_H_COUNT = 339;             // explicit head count (NumberOfPeople)
const VAR_HISTORY_TEXT_VAR = 253;
const VAR_HISTORY_SCENE_ARRAY = 174;      // scene history, per actor
const VAR_HEROINE_ID_ARRAY = 247;         // list of heroine ids
const VAR_H_STATE_DISPLAY_TEXT = 643;     // current H state icons
const VAR_PARTNER_NAME_OVERRIDE = 353;    // overrides of the partner name
const VAR_SCENE_PARTNER = 340;            // same as above, alias for readability at the call site
const VAR_H_SCENE_ACTOR = 530;            // actor the H scene is played for
const VAR_H_SCENE_TEXT_X = 318;           // actor of the text BGV
const VAR_COMPACT_WINDOW_OFFSET = 313;    // window offset of the compact H status
const VAR_H_SCENE_PICTURE_PARAMS = 706;
const VAR_H_SCENE_PICTURE_SLOTS = 299;    // picture ids that may be used
const VAR_H_SCENE_SPOKEN_TEXT = 21;       // ecstasy line (already carries the name marker)
const VAR_H_SCENE_PHRASES = 707;          // extra moaning lines
const VAR_BATTLE_MVP = 350;               // MVP record array
const VAR_BATTLE_KILL = 351;              // kill count array
const VAR_BATTLE_DAMAGE = 298;            // dealt damage array
const VAR_HSTATE_PENDING_DEVELOPMENT_BASE = 430; // pending development gain (431-439)
const VAR_SUPPRESSION_TARGET_FIRST = 431; // development suppression targets (431-439)
const VAR_SUPPRESSION_TARGET_LAST = 439;
const RANK_SUPPRESSION_SUFFIX = `上昇抑制`;
const VAR_SUPPRESSION_TARGET_IDS = [431, 432, 433, 434, 435, 436, 437, 438, 439];

const VAR_HSTATE_PENDING_FIRST = 401;     // pending H state gain (401-440)
const VAR_HSTATE_PENDING_LAST = 440;
const VAR_HSTATE_EXPOSURE_LIMIT = 405;    // exposure limit
const VAR_HSTATE_CURRENT_EXPOSURE = 404;  // current exposure (scratch for the calculation)
const VAR_HSTATE_AROUSAL = 402;           // arousal value
const VAR_HSTATE_AROUSAL_GAIN = 401;      // arousal gain of this call
const VAR_HSTATE_PLEASURE_GAIN = 403;
const VAR_HSTATE_FERTILITY = 403;
const VAR_HSTATE_PROSTITUTION_MONEY = 427;
const VAR_HSTATE_PREGNANCY_PARTNER = 49;
const VAR_PHYSIQUE_VAR_FIRST = 611;       // physique change record (611/612)
const VAR_PHYSIQUE_VAR_SECOND = 612;

// offsets into the per-actor arrays
const HSTATE_ARRAY_VAR_OFFSET = 380;      // variable (actorId + 380) holds the H state array
const PARTNER_RECORD_VAR_OFFSET = 360;    // variable (actorId + 360) holds the per-partner record
const PARTNER_BODY_VAR_OFFSET = 440;      // variable (actorId + 440) holds the physique / outfit deltas
const PARTNER_RECORD_SLOT_OFFSET = 100;   // per-partner record slot offset (101-200)
const PARTNER_CHILD_SLOT_OFFSET = 200;    // child count of the partner
const PARTNER_WIFE_SLOT_OFFSET = 100;
const HSTATE_BODY_INDEX_HEAD_VARIANT = 32; // head variant flag inside the physique array
const HSTATE_BODY_INDEX_BUST_FLAG = 18;   // bust flag inside the physique array (+100)

// H status array indexes
const HSTATE_INDEX_AROUSAL = 1;           // libido
const HSTATE_INDEX_AROUSAL_CAP = 0;       // libido cap
const HSTATE_INDEX_ESTRUS = 2;            // arousal (estrus) value
const HSTATE_INDEX_FERTILITY = 3;         // fertility of the day
const HSTATE_INDEX_EXPOSURE = 4;          // current exposure
const HSTATE_INDEX_EXPOSURE_LIMIT = 5;    // exposure limit
const HSTATE_INDEX_SEX_COUNT = 6;         // intercourse count
const HSTATE_INDEX_FIRST_PARTNER = 41;    // first partner
const HSTATE_INDEX_PREGNANCY_SWELL = 42;  // weight / size gain while pregnant
const HSTATE_INDEX_FIRST_CHILD_PARTNER = 49; // father of the first child
const HSTATE_INDEX_TODAY_COUNT = 61;      // H count of the day
const HSTATE_INDEX_DAILY_LIMIT_DAYS = 62; // consecutive days with 10 or more rounds
const HSTATE_INDEX_LIBIDO_DRUG = 63;      // libido drug uses
const HSTATE_INDEX_ZERO_COUNT_DAYS = 64;  // consecutive days with zero rounds while libido is 499 or more
const HSTATE_INDEX_RAPE_TODAY = 71;       // rape count of the day
const HSTATE_INDEX_HEIGHT = 51;           // the following entries are results of hstates_heights
const HSTATE_INDEX_WEIGHT = 52;
const HSTATE_INDEX_BUST = 53;
const HSTATE_INDEX_WAIST = 54;
const HSTATE_INDEX_HIP = 55;
const HSTATE_INDEX_CUP = 56;

// game switches
const SW_H_SCENE_DISPLAY_HIDDEN = 121;    // hide the status window during an H scene
const SW_H_SCENE_SIMPLE = 122;            // simple display with libido / arousal only
const SW_H_SCENE_PAST = 123;              // past scene
const SW_BATTLE_RECORD_VISIBLE = 130;     // show the battle record
const SW_TICKER_MESSAGE = 475;            // announce through the ticker
const SW_MESSAGE_STACK_MODE = 154;        // accumulate messages in a variable
const SW_H_PASSIVE_WINDOW = 115;          // open the uncollected H passive window
const SW_HISTORY_DETAIL = 164;            // detailed history display
const SW_ECSTASY_VOICE = 119;             // ecstasy voice
const SW_GOBLIN_ENEMY = 248;              // the enemy is a goblin
const SW_CLOTH_MENU_RELEASED = 604;       // dress-up menu already released
const SW_COMPACT_H_STATUS = 496;          // compact H status display

// skills / database ids
const SKILL_LIBIDO_UNLOCK = 18;           // base skill that unlocks the libido value
const SKILL_H_EXPOSURE = 55;              // exposure development skill
const SKILL_H_SEXUAL_DEV = 54;            // sexual development skill
const SKILL_H_SKILLED = 65;               // skebe-ko skill (unlocks fertilisation / climax handling)
const SKILL_PARTNER_KNOWN = 67;           // the partner's information is known
const SKILL_ALL_DEVELOPMENT = 875;        // skill of nine combined developments
const SKILL_H_DEV_FIRST = 51;             // development skills (51-59)
const SKILL_H_DEV_LAST = 59;
const SKILL_SUPPRESSION_FIRST = 61;       // estrus calming skills (61-69)
const ELEMENT_REPRODUCTION = 37;          // element of the breeding bonus
const STATE_PREGNANT = 83;                // pregnant
const STATE_FERTILIZED = 79;              // fertilised (previous stage of pregnant)
const STATE_BIRTHED = 82;                 // already gave birth
const STATE_ESTRUS = 61;                  // estrus
const STATE_HARASSMENT = 81;              // harassment (before restraint)
const HCG_PISTON_PICTURE_ID = 57;

// misc limits
const PARTNER_ACTOR_ID = 21;              // actor id used to display the partner name
const VAR_HSTATE_ECSTASY_BASE = 400;      // base variable id of the climax slots
const ACTOR_SCAN_FIRST = 1;               // first actor id scanned by the isGirl check
const ACTOR_SCAN_LAST = 20;
const VAR_H_VAGINAL_COUNT = 406;          // vaginal intercourse count
const VAR_H_ANAL_COUNT = 407;             // anal intercourse count
const VAR_H_FELLATION_COUNT = 408;        // fellatio count
const VAR_H_CLIMAX_COUNT = 414;           // climax count
const VAR_H_SQUIRT_COUNT = 425;           // squirting count
const VAR_H_INCONTINENCE_COUNT = 424;     // incontinence count
const VAR_GROUP_H_COUNT = 409;            // partner count (group sex from two upwards)
const VAR_HSTATE_PENDING_DISTINCT_PARTNERS = 409; // pending distinct partner gain
const VAR_HSTATE_PENDING_VAGINAL_INTERNAL = 411; // vaginal internal (creampie) count
const VAR_HSTATE_PENDING_ANAL_INTERNAL = 412; // anal internal count
const VAR_HSTATE_PENDING_FELLATION_INTERNAL = 416; // oral internal count
const VAR_HSTATE_PENDING_GROUP_RAPE = 419; // group rape flag
const VAR_HSTATE_PENDING_MONSTER_H = 420; // monster intercourse flag
const VAR_HSTATE_PENDING_RAPE = 418;      // rape count

const PARTNER_SCAN_FIRST = 1;             // scan range of the per-partner history
const PARTNER_SCAN_LAST = 100;
const PARTNER_RECORD_SLOT_FIRST_INDEX = 101; // first slot of the per-partner records (101-200)
const PARTNER_RECORD_SLOT_LAST_INDEX = 200;
const EXPOSURE_ITEM_SCAN_FIRST = 1201;   // first item id scanned by the exposure calculation
const CLOTH_SWITCH_VAR_ID_MIN = 461;     // clothing switch variables, lower bound
const CLOTH_SWITCH_VAR_ID_MAX = 500;
const CLOTH_SWITCH_VAR_OFFSET = 460;     // ClothSwitch + 460 gives the variable id
const EIC_SWITCH_ACTOR_OFFSET = 180;     // EICSwitch of actor n is n + 180
const EIC_SWITCH_SHARED_ACTOR = 200;     // wearer id shared by the whole party

//---------------------------------------------------------------------------
// Small shared helpers
//---------------------------------------------------------------------------

// Development rank (1-6) as a coloured label; rank 6 and above are all S.
const MASTERY_RANK_LABELS = [`\\C[4][E]\\C[0]`, `\\C[12][D]\\C[0]`, `\\C[5][C]\\C[0]`, `\\C[13][B]\\C[0]`, `\\C[27][A]\\C[0]`, `\\C[30][S]\\C[0]`];
masteryRankLabel = function (masteryLevel) {
  return MASTERY_RANK_LABELS[Math.max(0, Math.min(masteryLevel, 6) - 1)];
};

// Adds one line to the libido text and moves to the next valueWordSet when the page is full.
appendHStateMessage = function (messageText, linesPerPage, pageHeaderText) {
  window['valueWordSet' + valueCountSet2] += messageText;
  valueCountSet1 += 1;
  if ((valueCountSet1 % linesPerPage) != 0) return;
  valueCountSet2 += 1;
  window['valueWordSet' + valueCountSet2] = pageHeaderText || `\\C[10]H-Passive[${valueCountSet2}]\\C[0]\n`;
};

// Returns the index-th number of a "a,b" meta value; without an index the whole value is converted.
metaNumberAt = function (meta, key, index, fallback) {
  const raw = meta[key];
  if (!raw) return fallback;
  if (index === undefined) return Number(raw);
  return Number(raw.split(',')[index]);
};

// Actor currently being processed ($gameVariables.value(20)).
// Actor id and actor of variable 20; the caller decides what to do without an actor.
function readCurrentActor() {
  const actorId = $gameVariables.value(VAR_CURRENT_ACTOR_ID);
  return { actorId: actorId, actor: $gameActors.actor(actorId) };
}

function currentHStateActor() {
  return $gameActors.actor($gameVariables.value(VAR_CURRENT_ACTOR_ID));
}

// H state array of variable (actorId + 380).
function readHStateValues(actorId) {
  return $gameVariables.value(actorId + HSTATE_ARRAY_VAR_OFFSET);
}

// Per-partner H record array of variable (actorId + 360).
function readPartnerRecords(actorId) {
  return $gameVariables.value(actorId + PARTNER_RECORD_VAR_OFFSET);
}

// Physique / outfit delta array of variable (actorId + 440).
function readPartnerBodyValues(actorId) {
  return $gameVariables.value(actorId + PARTNER_BODY_VAR_OFFSET);
}

// Strips the display padding and separator from a variable name ("Libido　：" -> "Libido").
function cleanVariableLabel(variableName) {
  // NOTE: the original removed at most three full-width spaces, one half-width space
  //       and one colon, so the same counts are used here to keep the output identical.
  return String(variableName)
    .replace("　", ``).replace("　", ``).replace("　", ``)
    .replace(" ", ``).replace(":", ``);
}

// Notifications go either to the ticker or into a variable, so they are funnelled through one place.
function showHStateNotice(messageText) {
  if ($gameSwitches.value(SW_MESSAGE_STACK_MODE)) {
    $gameVariables.setValue(VAR_MESSAGE_STACK_ALT, `${messageText}\n`);
    $gameVariables.setValue(VAR_MESSAGE_STACK_COUNT, $gameVariables.value(VAR_MESSAGE_STACK_COUNT) + 1);
    return;
  }
  TickerManager.show(messageText);
}

// Append the message to variable 506 or show it in the ticker.
function appendMessageStack(messageText) {
  $gameVariables.setValue(VAR_MESSAGE_STACK, $gameVariables.value(VAR_MESSAGE_STACK) + messageText);
}

// Reset the "gain of this call" H states 401-440 back to zero.
function resetPendingHStateVariables() {
  for (let varId = VAR_HSTATE_PENDING_FIRST; varId <= VAR_HSTATE_PENDING_LAST; varId++) {
    $gameVariables.setValue(varId, 0);
  }
}

// Assigns values to a list of variable ids in order (shared by h_exp1-h_exp4).
function assignGameVariableList(varIds, values) {
  for (let index = 0; index < varIds.length; index++) {
    $gameVariables.setValue(varIds[index], values[index]);
  }
}

//---------------------------------------------------------------------------
// H experience counters
//---------------------------------------------------------------------------

// Coin toss for the creampie decision (1 means internal).
const COIN_FLIP_VALUES = [1, 0, 1, 0, 1, 1];

// Name the variables of the 380-400 array.
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

// Daily refresh of the H experience values.
weeks_toggleOtherH = function () {

  // 61 is the H count of the day, 62 the streak with 10 or more, 64 the streak of zero rounds while libido is 499 or more.
  for (let actorId = ACTOR_SCAN_FIRST; actorId <= ACTOR_SCAN_LAST; actorId++) {
    const actor = $gameActors.actor(actorId);
    if (!isGirl(actor)) continue;
    updateDailyHRecords(readHStateValues(actorId));
  };

};

// Updates one actor daily H record and resets the count of the day.
function updateDailyHRecords(hStateValues) {
  const todayCount = hStateValues[HSTATE_INDEX_TODAY_COUNT];
  if (todayCount >= 10) {
    hStateValues[HSTATE_INDEX_DAILY_LIMIT_DAYS] += 1;// 10 or more H rounds in one day
  }
  if (hStateValues[HSTATE_INDEX_AROUSAL] >= 499) {
    hStateValues[HSTATE_INDEX_ZERO_COUNT_DAYS] = todayCount == 0
      ? hStateValues[HSTATE_INDEX_ZERO_COUNT_DAYS] + 1
      : 0;
  }
  hStateValues[HSTATE_INDEX_TODAY_COUNT] = 0;// reset the H count
}

// Stores the libido experience (development) in variables; h_exp1-h_exp4 only differ by the variable ids.
const HEXP_VARIABLES = {
  encounter: [406, 409, 408, 407, 413, 414],// vaginal / head count / fellatio / anal / masturbation / climax
  relation: [417, 418, 420, 419, 430, 410],// consensual / rape / monster / group / orgy / exposure
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

// Adds a random amount to the climax-related variables (one of 6-8).
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

// Picks the ecstasy line and picture from the H count with the partner.
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

// Picture used for the climax effect; the image name follows the actor id and the rank.
function showBattleEcstasyPictures(actorId, ecstasyRank) {
  const ecstasyPictureName = 'Zev_BattleEcstasy' + actorId + '_' + ecstasyRank;
  pic_1(0, 57, ecstasyPictureName, 0, 100, 255, 60, 1280, 768, 0, 0);

  const ecstasyPictureId = 51;
  const ecstasyPictureBaseName = 'ScreenBattleEcstasySell5';
  picture_anime1(ecstasyPictureId, ecstasyPictureBaseName, 5, 1, "横", 10, 1, true, [1, 2]);
  $gameScreen.movePicture(ecstasyPictureId, 1, 640, 384, 100, 100, 150, 0, 30);
}

// Script used to display the partner when the H already happened.
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

// Display name of the partner actor (21), taken from the override variable or the weapon name.
function applyPartnerNameOverride(partnerActor, partnerWeapon, partnerWeaponId) {
  const nameOverrideValues = $gameVariables.value(VAR_PARTNER_NAME_OVERRIDE);
  const nameOverride = nameOverrideValues[partnerWeaponId - 300];

  if (nameOverride != 0) {
    partnerActor.setName(`\x1bnnp[${partnerWeaponId}]`);
    return;
  }
  partnerActor.setName(partnerWeapon.name);
}

// Combines the H count, the number of children and the pregnancy chance into one message.
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

// Script used to display the partner when the H already happened.
h_keikenhyouji2 = function (textVarId, showFlag) {

  changePartnerInfoWindow(textVarId, showFlag);

};

// Show / dismiss the text window (picture 150).
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

// List of the H counts with the unique partners.
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

// One "partner name: n times [children]" line.
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

// h_partnerFullName(22,$gameVariables.value(340)); // target variable id, partner id variable
h_partnerFullName = function (resultVarId, partnerWeaponId) {

  const partnerWeapon = $dataWeapons[partnerWeaponId];
  // BUGFIX: the metadata lookup crashed when the weapon id did not exist.
  if (!partnerWeapon) return;

  const partnerMeta = partnerWeapon.meta;
  const partnerNameText = buildPartnerNameText(partnerWeapon, partnerMeta);
  $gameVariables.setValue(resultVarId, partnerNameText);

};

// Partner name built from the family name, the kanji family name and the stand-in actor id.
// Order: weapon name -> (= family name) -> kanji family name in front -> replaced by the stand-in actor.
function buildPartnerNameText(partnerWeapon, partnerMeta) {
  let partnerNameText = colorTaggedText(23, partnerWeapon.name);

  const familyName = partnerMeta['FamilyName'];
  if (familyName) partnerNameText += colorTaggedText(23, `=${familyName}`);

  const familyNameKanji = partnerMeta['FamilyNameKanji'];
  if (familyNameKanji) partnerNameText = `${colorTaggedText(23, familyNameKanji)} ${partnerNameText}`;

  // A stand-in actor always wins over the name built above.
  const substitutionActorId = readMetaNumber(partnerMeta, 'SubstitutionActorId', 0);
  if (substitutionActorId >= 1) partnerNameText = `\x1bSET[${substitutionActorId}]`;
  return partnerNameText;
}

// H experience refresh.
h_exp = function (actorId, pictureName, partnerWeaponId, hideFlag, simpleFlag, pastSceneFlag) {

  $gameVariables.setValue(VAR_LAST_H_COUNT, 0);
  $gameVariables.setValue(VAR_CURRENT_ACTOR_ID, actorId);
  $gameVariables.setValue(VAR_H_PICTURE_NAME, pictureName);
  readHStateValues(actorId)[46] = pictureName;
  $gameSwitches.setValue(SW_H_SCENE_DISPLAY_HIDDEN, hideFlag);// hidden
  $gameSwitches.setValue(SW_H_SCENE_SIMPLE, simpleFlag);// libido and arousal only, mostly used on item use
  $gameSwitches.setValue(SW_H_SCENE_PAST, pastSceneFlag);// on for a past scene
  $gameVariables.setValue(VAR_PARTNER_WEAPON_ID, partnerWeaponId);// 301 is the generic partner
  $gameVariables.setValue(VAR_ACTOR_NAME_MIRROR, $gameActors.actor(actorId).name());
  // NOTE: the mirror above is read back by the later Show Picture / text commands.

  const partnerWeapon = $dataWeapons[partnerWeaponId];
  // BUGFIX: the name lookup crashed when the weapon id did not exist.
  if (!partnerWeapon) return;

  $gameVariables.setValue(VAR_PARTNER_NAME, partnerWeapon.name);
  const partnerHeadCount = readMetaNumber(partnerWeapon.meta, 'NumberOfPeople', 0);
  if (partnerHeadCount >= 1) {
    $gameVariables.setValue(VAR_LAST_H_COUNT, partnerHeadCount);
  };

};

//---------------------------------------------------------------------------
// Actor H status windows
//---------------------------------------------------------------------------
const H_EXPOSURE_SKILL_ID = 50;           // libido development skill
const H_EXPOSURE_RANK_STEP = 100;         // one rank per 100 development points
const HSTATE_WINDOW_COLUMN_A = [6, 7, 8, 9, 10, 11, 12, 16, 13, 14, 15];
const HSTATE_WINDOW_COLUMN_B = [17, 18, 19, 30, 20, 21, 22, 23, 24, 25, 26, 28];
const HSTATE_COUNT_WORD = `回`;
//Engine font-size tags, kept outside of the translatable strings.
const FONT_SIZE_22 = `\\fs[22]`;
const FONT_SIZE_24 = `\\fs[24]`;
const FONT_SIZE_25 = `\\fs[25]`;
const FONT_SIZE_28 = `\\fs[28]`;

// Development display 2 of the actor in variable 20.
actor_Hstateshyouji2 = function () {

  const { actorId, actor } = readCurrentActor();
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

// Development rank labels from [out of range] to [SSS].
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

// Development rank (0-9); one rank per 100 points.
function readDevelopmentRank(developmentRate) {
  let hRank = 0;
  for (let rank = 1; rank <= 9; rank++) {
    if (developmentRate >= rank * H_EXPOSURE_RANK_STEP + 1) hRank = rank;
  };
  return hRank;
}

// Sequential development skill list such as [51..59].
function buildHSkillRange(firstSkillId, lastSkillId) {
  const skillIds = [];
  for (let skillId = firstSkillId; skillId <= lastSkillId; skillId++) skillIds.push(skillId);
  return skillIds;
}

// One "name + rank + uses + description" line of a development skill.
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

// Whether the suppression skills currently block the rank gain of this skill.
function isHSkillRankLimited(actor, skillId, masteryLevel) {
  for (const suppressionSkillId of valueHstaSuppression) {
    if (!actor.isLearnedSkill(suppressionSkillId)) continue;

    const suppressionMeta = $dataSkills[suppressionSkillId].meta;
    if (actor.isLearnedSkill(Number(suppressionMeta['Hide if Learned Skill']))) continue;

    if (isSuppressionEntryHit(suppressionSkillId, masteryLevel, suppressionMeta)) return true;
  };
  return false;
}

// Whether one suppression entry blocks this skill at the given mastery level.
// Target 0 (or 401) stands for the whole 431-439 development range of that skill.
function isSuppressionEntryHit(suppressionSkillId, masteryLevel, suppressionMeta) {
  const suppressionParams = suppressionMeta['HstaSuppression'].split(',');
  const suppressionTarget = Number(suppressionParams[0]);
  const suppressionThreshold = Number(suppressionParams[1]);

  if (suppressionTarget == 0) {
    return suppressionSkillId >= VAR_SUPPRESSION_TARGET_FIRST
      && suppressionSkillId <= VAR_SUPPRESSION_TARGET_LAST
      && masteryLevel == suppressionThreshold;
  }
  return suppressionTarget - HSTATE_ARRAY_VAR_OFFSET == suppressionSkillId
    && masteryLevel == suppressionThreshold;
}

// H status display 1 of the actor in variable 20.
// Window shift used by the compact H status layout.
const COMPACT_WINDOW_Y_OFFSET = 128;

// The compact layout is used outside battle records and without a standing picture.
function isCompactHStateDisplay() {
  if ($gameSwitches.value(SW_COMPACT_H_STATUS)) return false;
  if ($gameSwitches.value(SW_BATTLE_RECORD_VISIBLE)) return false;
  return $gameVariables.value(VAR_H_PICTURE_NAME) == 0;
}

actor_Hstateshyouji1 = function () {

  const isCompactDisplay = isCompactHStateDisplay();
  const windowYOffset = isCompactDisplay ? COMPACT_WINDOW_Y_OFFSET : 0;
  if (isCompactDisplay) { $gameVariables.setValue(VAR_COMPACT_WINDOW_OFFSET, COMPACT_WINDOW_Y_OFFSET); };

  WindowManager.show(1, windowYOffset, 200, 379, 390);
  WindowManager.show(2, 379 + windowYOffset, 200, 389, 390);

  const { actorId, actor } = readCurrentActor();
  if (!actor) return;

  const hStateValues = readHStateValues(actorId);
  fillHStateWordSets();

  WindowManager.drawText(1, buildHStateCountColumn(hStateValues, HSTATE_WINDOW_COLUMN_A));
  WindowManager.drawText(2, buildHStateCountColumn(hStateValues, HSTATE_WINDOW_COLUMN_B));

  if ($gameSwitches.value(SW_BATTLE_RECORD_VISIBLE)) return;

  const masteryWindowY = isCompactDisplay ? 430 + COMPACT_WINDOW_Y_OFFSET : 430;
  WindowManager.show(3, masteryWindowY, 0, 338, 202);
  WindowManager.drawText(3, buildMasteryGridText(actor));

};

// Writes the "+n" display of every H state into valueWordSet1-40 (used by the later line assembly).
function fillHStateWordSets() {
  for (let index = 1; index <= 40; index++) {
    const statValue = $gameVariables.value(400 + index);
    window['valueWordSet' + index] = statValue >= 1 ? colorTaggedText(2, `+${statValue}`) : '　';
  };
}

// Turns the listed H states into "name + count + gain" lines.
function buildHStateCountColumn(hStateValues, indexes) {
  let displayText = FONT_SIZE_24;
  for (const index of indexes) {
    const statName = $dataSystem.variables[400 + index];
    const statNameLabel = colorTaggedText(27, statName);
    displayText += `${statNameLabel}${hStateValues[index]}${HSTATE_COUNT_WORD}${window['valueWordSet' + index]}\n`;
  };
  return displayText;
}

// Grid display of the development skills 51-59 (icon + rank + uses).
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

// For the MVP calculation.
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
    pushMemberMvpRecords(mvpCandidates, member, skillAcquisitionSequence, damageRecordValues);
  };

  mvpCandidates.forEach((sourceCandidates, sourceIndex) => {
    mvp[MVP_RECORD_SOURCES[sourceIndex].mvpIndex] = Math.max.apply(null, sourceCandidates);
  });

}

// Collects the record values of one party member, one list per record source.
function pushMemberMvpRecords(mvpCandidates, member, skillAcquisitionSequence, damageRecordValues) {
  const actorId = member.actorId();
  const actor = $gameActors.actor(actorId);

  MVP_RECORD_SOURCES.forEach((recordSource, sourceIndex) => {
    mvpCandidates[sourceIndex].push(
      recordSource.read(actor, actorId, skillAcquisitionSequence, damageRecordValues));
  });
};

// Normal status display of the actor in variable 20, used by windows 0 and 4.
actor_stateshyouji = function () {
  const { actorId, actor } = readCurrentActor();
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

// Nickname and SET icon, plus the H state text and the icon lookups for girls.
function buildActorInfoText(actor, actorStateValues) {
  const actorNickname = colorTaggedText(1, actor.nickname());
  let actorInfoText = FONT_SIZE_24 + actorNickname + `\n`;
  actorInfoText += `\x1bSET[${actor.actorId()}]\n`;
  if (!isGirl(actor)) return actorInfoText;

  actorInfoText += buildGirlHStateText(actor, actorStateValues);
  actorInfoText += `\\V[${VAR_H_STATE_DISPLAY_TEXT}]`;
  return actorInfoText;
}

function updateActorHStateDisplayActorStateshyouji(actor, actorId) {
  const isCompactDisplay = isCompactHStateDisplay();
  const windowYOffset = isCompactDisplay ? COMPACT_WINDOW_Y_OFFSET : 0;
  WindowManager.show(0, windowYOffset, 0, 430, 202);

  const targetActorId = actorId || actor.actorId();
  seiyoku_jougenn1(actor);

  const actorStateValues = readHStateValues(targetActorId);
  fillHStateWordSets();
  $gameVariables.setValue(VAR_H_STATE_DISPLAY_TEXT, buildActiveHStateIconText(actor));

  WindowManager.drawText(0, buildActorInfoText(actor, actorStateValues));
}

// Assigned H states as an icon string.
function buildActiveHStateIconText(actor) {
  let iconText = `\\I[16]`;
  for (const stateId of valueHstateDisplay) {
    if (!actor.isStateAffected(stateId)) continue;
    iconText += `\\I[${$dataStates[stateId].iconIndex}]`;
  };
  return iconText;
}

// Turns a variable name (the in-game label) into a coloured label.
function buildVariableNameLabel(varId) {
  return colorTaggedText(27, $dataSystem.variables[varId]);
}

// One block of the libido / arousal values of a female actor.
// Fertility line; the value stays hidden until the skebe-ko skill is learned.
function buildFertilityLine(actor, fertilityLabel, fertilityValue) {
  const fertilityText = actor.isLearnedSkill(SKILL_H_SKILLED) ? `${fertilityValue}%` : `───%`;
  return `${fertilityLabel}${fertilityText}　` + '\n';
}

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

  actorInfoText += buildFertilityLine(actor, fertilityLabel, actorStateValues[3]);
  return actorInfoText;
}

// Window rows of the battle record in display order; mvpIndex is the slot of the MVP record array.
const BATTLE_RECORD_ROW_SOURCES = [
  { mvpIndex: 1, isMvp: true, read: (actor) => actor.getAllKillEnemyCounter() },
  { mvpIndex: 2, isMvp: true, read: (actor) => actor.attackDamageMax },
  { mvpIndex: 3, isMvp: true, read: (actor) => actor.attackDamageSum },
  { mvpIndex: 8, isMvp: true, read: (actor, totals) => totals.damage },
  // OverKill records the dealt damage array divided by two
  { mvpIndex: 4, isMvp: true, read: (actor, totals) => totals.kill / 2 },
  { mvpIndex: 5, isMvp: true, read: (actor) => actor.acceptDamageMax },
  { mvpIndex: 6, isMvp: true, read: (actor) => actor.acceptDamageSum },
  { mvpIndex: 7, isMvp: false, read: (actor) => actor.deadCounter }
];

// Values of the current actor, ready for buildBattleRecordText.
function buildBattleRecordRows(actor, actorId) {
  const killTotals = $gameVariables.value(VAR_BATTLE_KILL);
  const damageTotals = $gameVariables.value(VAR_BATTLE_DAMAGE);
  const mvpStats = $gameVariables.value(VAR_BATTLE_MVP);
  const totals = { kill: killTotals[actorId], damage: damageTotals[actorId] };

  return BATTLE_RECORD_ROW_SOURCES.map((recordRow) => ({
    value: mvpStats[recordRow.mvpIndex],
    actorValue: recordRow.read(actor, totals),
    isMvp: recordRow.isMvp
  }));
}

function displayBattleRecordActorStateshyouji(actor, actorId) {
  if (!$gameSwitches.value(SW_BATTLE_RECORD_VISIBLE)) return;

  const mvpRows = buildBattleRecordRows(actor, actorId);
  const mvpIndicators = mvpRows.map((row) => setupMvpIndicatorActorStateshyouji(row.value, row.actorValue, row.isMvp));

  const battleRecordText = buildBattleRecordText(mvpRows, mvpIndicators);
  WindowManager.show(1, 0, 200, 500, 389);
  WindowManager.drawText(1, battleRecordText);
}

// Rows of the battle record (label / colour / value source); the values follow the mvpRows order.
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

// Body of the battle record window.
function buildBattleRecordText(mvpRows, mvpIndicators) {
  const headerLine = colorTaggedText(16, `<Battle Record!>`) + '\n';
  const recordLines = BATTLE_RECORD_ROWS.map((row) => buildBattleRecordLine(row,
    mvpRows[row.rowIndex].actorValue, mvpIndicators[row.rowIndex]));
  return headerLine + recordLines.join('');
}

// One "label + coloured value + MVP / worst mark" line.
function buildBattleRecordLine(recordRow, recordValue, mvpIndicator) {
  return `${recordRow.label}${colorTaggedText(recordRow.colorCode, recordValue)}${mvpIndicator}` + '\n';
}

// New function to display the skill record
const SKILL_RECORD_STYPE_KEYS = {
  2: 'attack', 5: 'sAbility', 6: 'aAbility', 7: 'wAbility', 8: 'rAbility', 12: 'burst', 13: 'chain'
};

// Rows of the skill record (label and summary key).
const SKILL_RECORD_ROWS = [
  { label: 'Attack   :', usageKey: 'attack' },
  { label: 'S-Ability:', usageKey: 'sAbility' },
  { label: 'A-Ability:', usageKey: 'aAbility' },
  { label: 'W-Ability:', usageKey: 'wAbility' },
  { label: 'R-Ability:', usageKey: 'rAbility' },
  { label: 'Burst!   :', usageKey: 'burst' },
  { label: 'Chain!   :', usageKey: 'chain' }
];

// Body of the skill record window.
function buildSkillRecordText(usageTotals) {
  const headerLine = colorTaggedText(16, `<Skill Record!>`) + '\n';
  const recordLines = SKILL_RECORD_ROWS.map((row) => `${row.label}${usageTotals[row.usageKey]}` + '\n');
  return headerLine + recordLines.join('');
}

// Zeroed usage counter per row of the skill record.
function createSkillUsageTotals() {
  const usageTotals = {};
  for (const recordRow of SKILL_RECORD_ROWS) usageTotals[recordRow.usageKey] = 0;
  return usageTotals;
}

// Adds the usage counter of every skill to the row of its skill type.
function countSkillUsageTotals(actor) {
  const usageTotals = createSkillUsageTotals();
  const skills = $dataSkills;
  const lastSkillId = skills.length - 1;

  for (let skillId = 1; skillId <= lastSkillId; skillId++) {
    const skill = skills[skillId];
    if (!skill || skill.name === '') continue; // Skip skills with empty names

    const usageKey = SKILL_RECORD_STYPE_KEYS[skill.stypeId];
    if (!usageKey) continue;

    usageTotals[usageKey] += actor.getSkillUseCounter(skillId);
  }
  return usageTotals;
}

function displaySkillRecordActorStateshyouji(actor) {
  const skillRecordText = buildSkillRecordText(countSkillUsageTotals(actor));

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

// Libido cap calculation; run together with the exposure calculation and the H profile display.
seiyoku_jougenn = function () {
  seiyoku_jougenn1(currentHStateActor());
};

// Cap threshold of one suppression skill, or null when the skill does not apply here.
function readArousalCapLimit(gameActor, requiredSkillId) {
  if (!gameActor.isLearnedSkill(requiredSkillId)) return null;

  const suppressionMeta = $dataSkills[requiredSkillId].meta;
  const hideIfLearnedSkillId = suppressionMeta['Hide if Learned Skill'];
  if (hideIfLearnedSkillId && gameActor.isLearnedSkill(Number(hideIfLearnedSkillId))) return null;

  const suppressionParamsRaw = suppressionMeta['HstaSuppression'];
  if (!suppressionParamsRaw) return null;

  const suppressionParams = suppressionParamsRaw.split(',');
  const suppressionType = Number(suppressionParams[0]);
  // Only the entries that lower the cap itself are handled here.
  if (suppressionType != 0 && suppressionType != 401) return null;

  return Number(suppressionParams[1]) * H_EXPOSURE_RANK_STEP;
}

seiyoku_jougenn1 = function (gameActor) {

  if (!gameActor) return;

  const actorSuppressionValues = readHStateValues(gameActor.actorId());
  actorSuppressionValues[HSTATE_INDEX_AROUSAL_CAP] = 0;
  // The cap is lowered by every matching suppression skill, so it is worked on locally.
  let arousalCapValue = 0;

  for (const requiredSkillId of valueHstaSuppression) {
    const suppressionThreshold = readArousalCapLimit(gameActor, requiredSkillId);
    if (suppressionThreshold === null) continue;

    if (arousalCapValue == 0 || suppressionThreshold <= arousalCapValue) {
      arousalCapValue = suppressionThreshold - 1;
    }
  }

  actorSuppressionValues[HSTATE_INDEX_AROUSAL_CAP] = arousalCapValue;
};

// Limit exposure value calculation.
rosyutu_genkai = function () {
  rosyutu_genkai1(currentHStateActor());
};

// Computes the per-rank cap of the exposure development skill (55) into the array and the variables.
rosyutu_genkai1 = function (gameActor) {

  if (!gameActor) return;
  const exposureLimit = EXPOSURE_LIMIT_BY_RANK[Math.min(gameActor.skillMasteryLevel(SKILL_H_EXPOSURE), 6)];

  $gameVariables.setValue(VAR_HSTATE_EXPOSURE_LIMIT, exposureLimit);
  readHStateValues(gameActor.actorId())[HSTATE_INDEX_EXPOSURE_LIMIT] = exposureLimit;
  $gameVariables.setValue(VAR_HSTATE_EXPOSURE_LIMIT, 0);

  seiyoku_jougenn1(gameActor);

};

// Rank caps of the exposure development skill.
const EXPOSURE_LIMIT_BY_RANK = [100, 90, 70, 50, 30, 10, 0];

// Current exposure accounting.
rosyutu_genzai = function () {
  rosyutu_genzai1($gameVariables.value(VAR_CURRENT_ACTOR_ID));
};

rosyutu_genzai1 = function (actorId) {

  // The scratch variable is zeroed, filled for the cloth scan and zeroed again, which is
  // the state the original leaves behind.
  $gameVariables.setValue(VAR_HSTATE_CURRENT_EXPOSURE, 0);
  const exposureTotal = sumWornClothExposure(actorId);

  $gameVariables.setValue(VAR_HSTATE_CURRENT_EXPOSURE, exposureTotal);
  readHStateValues(actorId)[HSTATE_INDEX_EXPOSURE] = exposureTotal;
  $gameVariables.setValue(VAR_HSTATE_CURRENT_EXPOSURE, 0);
};

// Exposure total of the worn clothes (those whose clothing switch matches).
function sumWornClothExposure(actorId) {
  // The two per-actor wearer ids plus the one shared by the party.
  const wornSwitchIds = [
    actorId + EIC_SWITCH_ACTOR_OFFSET,
    actorId + HSTATE_ARRAY_VAR_OFFSET,
    EIC_SWITCH_SHARED_ACTOR
  ];
  const items = $dataItems;
  const lastItemId = items.length - 1;
  let exposureTotal = 0;

  for (let itemId = EXPOSURE_ITEM_SCAN_FIRST; itemId <= lastItemId; itemId++) {
    const item = items[itemId];
    // BUGFIX: the metadata lookup crashed when the item array had holes.
    if (!item) continue;

    exposureTotal += readWornClothExposure(item.meta, wornSwitchIds);
  }

  return exposureTotal;
}

// Exposure of one clothing item: 0 unless the actor wears it and the switch matches.
function readWornClothExposure(itemMeta, wornSwitchIds) {
  if (itemMeta['TotalCloth']) return 0;// whole outfits are counted separately

  // Only items worn by the actor herself (EICSwitch) or shared ones (200) count.
  if (!wornSwitchIds.includes(Number(itemMeta['EICSwitch']))) return 0;

  const clothSwitchVarId = Number(itemMeta['ClothSwitch']) + CLOTH_SWITCH_VAR_OFFSET;
  if (clothSwitchVarId < CLOTH_SWITCH_VAR_ID_MIN || clothSwitchVarId > CLOTH_SWITCH_VAR_ID_MAX) return 0;
  if ($gameVariables.value(clothSwitchVarId) !== Number(itemMeta['ClothAllocationNumber'])) return 0;

  return Number(itemMeta['ClothUncoverCount']);
}

// Fertilisation calculation.
jusei_keisan = function () {

  const fertilizationBase = 11;
  const { actorId, actor } = readCurrentActor();
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

// Fertilisation roll; skills and states can force or block it.
function isFertilizationAccepted(actor, battleSkills, fertilizationRate) {
  const fertilizationRoll = getRandomIndex(101);
  if (fertilizationRate >= fertilizationRoll) return true;
  if (battleSkills.includes(873)) return true;
  return actor.isStateAffected(75);
}

// Whether a skill or state rejects the fertilisation.
function isFertilizationRepelled(actor, battleSkills) {
  return battleSkills.includes(874) || actor.isStateAffected(76);
}

function showFertilizationRepelledMessage(actor) {
  const skillName = colorTaggedText(27, $dataSkills[874].name);
  const actorName = actor.name();
  CommonPopupManager.showInfo({}, `${actorName}は${skillName}の効果により受精を退けた。`, null);
}

// Runs the callback for every heroine id of variable 247; does nothing without a list.
function forEachHeroineId(visitHeroine) {
  const heroineIds = $gameVariables.value(VAR_HEROINE_ID_ARRAY);
  if (!heroineIds) return;
  for (const actorId of heroineIds) visitHeroine(actorId);
}

// Records the fertilising partner (slots 101-200).
function recordPregnancyPartner(actorId) {
  const partnerWeaponId = $gameVariables.value(VAR_PARTNER_WEAPON_ID);
  if (partnerWeaponId < 1) return;

  const pregnancyPartnerSlot = partnerWeaponId - PARTNER_CHILD_SLOT_OFFSET;// inside 101-200
  readPartnerRecords(actorId)[pregnancyPartnerSlot] += 1;
}

// Clears the fertilisation record of everyone except the fertilised actor.
jusei_clear = function () {

  forEachHeroineId((actorId) => {
    $gameVariables.setValue(VAR_CURRENT_ACTOR_ID, actorId);
    clearActorFertilization(actorId);
  });

};

// Clears one fertilisation record; does nothing (returns false) while pregnant.
function clearActorFertilization(actorId) {
  const actor = $gameActors.actor(actorId);
  if (!actor) return false;

  actor.removeState(STATE_FERTILIZED);// the fertilised pre-stage state disappears
  if (actor.isStateAffected(STATE_BIRTHED)) return false;

  const partnerHRecords = readPartnerRecords(actorId);
  for (let slot = PARTNER_RECORD_SLOT_FIRST_INDEX; slot <= PARTNER_RECORD_SLOT_LAST_INDEX; slot++) {
    if (partnerHRecords[slot] >= 1) {
      partnerHRecords[slot] = 0;
    };
  };
  return true;
}


// Physique related H states such as the height.
const CUP_SIZE_LABELS = [`AAAAA`, `AAAA`, `AAA`, `AA`, `A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`];
const CUP_SIZE_STEP = 2.5;                // cup size step

// Base body size from the <HeightEtc:a,b,c,d,e> tag.
function readBodySize(actorData) {
  const heightEtc = actorData.meta['HeightEtc'].split(',');
  return {
    heightCm: Number(heightEtc[0]),
    weightKg: Number(heightEtc[1]),
    bustCm: Number(heightEtc[2]),
    waistCm: Number(heightEtc[3]),
    hipCm: Number(heightEtc[4])
  };
}

// Breeding element bonus shown above the body size (empty below +10%).
function readReproductionLabel(gameActor) {
  const reproductionRate = gameActor.elementRate(ELEMENT_REPRODUCTION);
  if (reproductionRate < 1.1) return ``;
  return FONT_SIZE_25 + `Reproduction:${Math.round(reproductionRate)}%`;
}

hstates_heights = function (id, resultVarId) {

  const gameActor = $gameActors.actor(id);
  if (!gameActor || !isGirl(gameActor)) {
    $gameVariables.setValue(resultVarId, readBodyStyleLabelText($dataActors[id]));
    return;
  };

  const actorData = $dataActors[id];
  if (!actorData || !actorData.meta['HeightEtc']) return;

  const reproductionLabel = readReproductionLabel(gameActor);

  const bodySize = readBodySize(actorData);
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

// Physique display block; numbers and tags only, so nothing has to be translated.
function buildHeightEtcText(bodySize, cupSize, bodyStyleLabel, virginLabel, reproductionLabel) {
  // The labels are technical abbreviations, so they are built outside of any message.
  const heightLabel = colorTaggedText(16, `HT:`);
  const centimetreLabel = colorTaggedText(16, `cm`);
  const weightLabel = colorTaggedText(16, `WT:`);
  const kilogramLabel = colorTaggedText(16, `kg`);
  const cupLabel = colorTaggedText(16, `Cup:`);
  const bustLabel = colorTaggedText(16, `B:`);
  const waistLabel = colorTaggedText(16, `W:`);
  const hipLabel = colorTaggedText(16, `H:`);

  return FONT_SIZE_25
    + `${heightLabel}${bodySize.heightCm}${centimetreLabel}　${weightLabel}${bodySize.weightKg}${kilogramLabel}` + '\n'
    + `${cupLabel}[${cupSize}] ${bustLabel}${bodySize.bustCm} `
    + `${waistLabel}${bodySize.waistCm} ${hipLabel}${bodySize.hipCm}` + '\n'
    + bodyStyleLabel + '\n'
    + virginLabel + '\n'
    + reproductionLabel;
}

// Stores the results in the H state array (51-56).
function writeBodySizeToHState(hStateValues, bodySize, cupSize) {
  hStateValues[HSTATE_INDEX_HEIGHT] = bodySize.heightCm;
  hStateValues[HSTATE_INDEX_WEIGHT] = bodySize.weightKg;
  hStateValues[HSTATE_INDEX_BUST] = bodySize.bustCm;
  hStateValues[HSTATE_INDEX_WAIST] = bodySize.waistCm;
  hStateValues[HSTATE_INDEX_HIP] = bodySize.hipCm;
  hStateValues[HSTATE_INDEX_CUP] = cupSize;
}

// Body label for non-female actors or missing data.
function readBodyStyleLabelText(actorData) {
  if (actorData && actorData.meta['BodyStyle']) {
    return colorTaggedText(21, `[${actorData.meta['BodyStyle']}]`);
  }
  return `NoData`;
}

// Physique change tags: metadata key -> property of the bodySize object.
const PHYSIQUE_CHANGE_TAGS = [
  { metaKey: 'BodyWeightChange', sizeKey: 'weightKg' },
  { metaKey: 'BustSizeChange', sizeKey: 'bustCm' },
  { metaKey: 'WaistSizeChange', sizeKey: 'waistCm' },
  { metaKey: 'HipSizeChange', sizeKey: 'hipCm' }
];

// Adds the physique change skill bonuses (valuePhysiquUp) and returns how many values changed.
// Adds every physique change tag of one skill to the body size; returns how many tags applied.
function applyPhysiqueChangeTags(bodySize, physiqueMeta) {
  let changedTagCount = 0;

  for (const changeTag of PHYSIQUE_CHANGE_TAGS) {
    const changeValue = physiqueMeta[changeTag.metaKey];
    if (!changeValue) continue;

    bodySize[changeTag.sizeKey] += Number(changeValue);
    changedTagCount += 1;
  };

  return changedTagCount;
}

function applyPhysiqueSkillBonuses(gameActor, bodySize) {
  const physiqueSkills = gameActor.battleSkillsRaw();
  let physiqueChangeCount = 0;// number of values changed by the physique bonuses

  for (const physiqueSkillId of valuePhysiquUp) {
    const physiqueSkill = $dataSkills[physiqueSkillId];
    // BUGFIX: the metadata lookup crashed when the skill id did not exist.
    if (!physiqueSkill) continue;
    if (!physiqueSkills.includes(physiqueSkillId)) continue;

    physiqueChangeCount += applyPhysiqueChangeTags(bodySize, physiqueSkill.meta);
  };
  return physiqueChangeCount;
}

// Reflects the pregnancy gain (array 42-45) in the physique.
function applyPregnancySwell(actorId, bodySize) {
  const hStateValues = readHStateValues(actorId);
  bodySize.weightKg += hStateValues[HSTATE_INDEX_PREGNANCY_SWELL];
  bodySize.bustCm += hStateValues[HSTATE_INDEX_PREGNANCY_SWELL + 1];
  bodySize.waistCm += hStateValues[HSTATE_INDEX_PREGNANCY_SWELL + 2];
  bodySize.hipCm += hStateValues[HSTATE_INDEX_PREGNANCY_SWELL + 3];
}

// Cup size measurement in steps of 2.5 from A to T; out of table gives "--".
function computeCupSizeLabel(bustCm, heightCm, waistCm) {
  const cupSizeValue = (bustCm - (heightCm * 0.435 - (heightCm * 0.38 - waistCm))) + 2;// the original adds 2 here on purpose
  const cupIndex = Math.max(1, Math.floor(cupSizeValue / CUP_SIZE_STEP) + 1);
  return cupIndex > CUP_SIZE_LABELS.length ? `──` : CUP_SIZE_LABELS[cupIndex - 1];
}

// Item name (empty for a missing id; the original crashed).
function readItemName(itemId) {
  const item = $dataItems[itemId];
  return item ? item.name : ``;
}

// Strongest style tier first: the multiplier is applied to the physique skill count.
const BODY_STYLE_TIERS = [
  { countMultiplier: 2, labelItemId: 742, mainActorVarId: VAR_PHYSIQUE_VAR_SECOND },
  { countMultiplier: 1, labelItemId: 741, mainActorVarId: VAR_PHYSIQUE_VAR_FIRST }
];

// Style label from the physique change stage; also updates variables 611/612 for the main character.
function readBodyStyleLabel(actorId, actorData, physiqueChangeCount) {
  const bodyStyleMeta = actorData.meta['BodyStyle'];
  if (!bodyStyleMeta) return ``;

  const physiqueUpCount = valuePhysiquUp.length;
  const isMainActor = actorId == $gameVariables.value(VAR_MAIN_ACTOR_ID);

  for (const styleTier of BODY_STYLE_TIERS) {
    if (physiqueChangeCount < physiqueUpCount * styleTier.countMultiplier) continue;

    if (isMainActor) {
      $gameVariables.setValue(styleTier.mainActorVarId, physiqueUpCount * styleTier.countMultiplier);
    };
    return colorTaggedText(27, `[${readItemName(styleTier.labelItemId)}]`);
  };

  if (physiqueChangeCount >= physiqueUpCount / 2) {
    return colorTaggedText(21, `[${bodyStyleMeta}]`);
  };
  return ``;
}

// Virgin / non-virgin label from the intercourse count.
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
const PREMISE_ENTRY_COUNT = 3;            // number of PremiseSkill1-3 entries and the like
const PREMISE_SKILL_ID_DEFAULT = 407;     // default premise skill when none is given
const PREMISE_VAR_ID_DEFAULT = 2;

// Reads one premise entry (skill / rank / variable / array).
// One premise list per field; `metaIndex` is the position inside the "a,b" meta value.
const HSKILL_PREMISE_FIELDS = [
  { targetKey: 'skillIds', metaKey: 'PremiseSkill', metaIndex: undefined, fallback: PREMISE_SKILL_ID_DEFAULT },
  { targetKey: 'rankSkillIds', metaKey: 'PremiseSkillRank', metaIndex: 0, fallback: PREMISE_SKILL_ID_DEFAULT },
  { targetKey: 'rankThresholds', metaKey: 'PremiseSkillRank', metaIndex: 1, fallback: 0 },
  { targetKey: 'varIds', metaKey: 'PremiseVariable', metaIndex: 0, fallback: PREMISE_VAR_ID_DEFAULT },
  { targetKey: 'varThresholds', metaKey: 'PremiseVariable', metaIndex: 1, fallback: 0 },
  { targetKey: 'arrangementIndexes', metaKey: 'PremiseArrangement', metaIndex: 0, fallback: 0 },
  { targetKey: 'arrangementThresholds', metaKey: 'PremiseArrangement', metaIndex: 1, fallback: 0 }
];

function readHSkillPremise(skillMeta) {
  const premise = {};
  for (const premiseField of HSKILL_PREMISE_FIELDS) premise[premiseField.targetKey] = [];

  for (let entry = 1; entry <= PREMISE_ENTRY_COUNT; entry++) {
    for (const premiseField of HSKILL_PREMISE_FIELDS) {
      premise[premiseField.targetKey].push(
        metaNumberAt(skillMeta, premiseField.metaKey + entry, premiseField.metaIndex, premiseField.fallback));
    };
  };
  return premise;
}

// Regular H skill learning path.
hskill_learn = function (learnModeId) {

  const { actorId, actor } = readCurrentActor();
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

// Learn / forget decision for one skill.
// Publishes the H count with the current partner (641) and the drug uses (63) before the premise test.
function publishPartnerHStateValues(actorId) {
  const partnerWeaponId = $gameVariables.value(VAR_PARTNER_WEAPON_ID);
  const partnerHRecords = readPartnerRecords(actorId);
  const hStateValues = readHStateValues(actorId);

  // Two writes on purpose: the variable is cleared first and filled only for a known partner.
  $gameVariables.setValue(VAR_HSTATE_SELECTED_VALUE, 0);
  if (partnerWeaponId >= 1) {
    $gameVariables.setValue(VAR_HSTATE_SELECTED_VALUE, partnerHRecords[partnerWeaponId - 300]);
  };
  hStateValues[HSTATE_INDEX_LIBIDO_DRUG] = partnerHRecords[6];// libido drug uses of weapon id 306
  return hStateValues;
}

function processHSkillLearnEntry(actor, actorId, skillId, learnModeId) {
  const skillMeta = $dataSkills[skillId].meta;
  const isLearned = actor.isLearnedSkill(skillId);
  const shouldLearn = learnModeId == 1 ? !isLearned : (learnModeId == 2 ? isLearned : false);

  if (!shouldLearn) {
    forgetHSkillIfPremiseLost(actor, skillId, skillMeta);
    return;
  };

  const hStateValues = publishPartnerHStateValues(actorId);

  if (!isHSkillTargetActor(skillMeta, actorId)) return;
  if (!meetsHSkillPremise(actor, hStateValues, readHSkillPremise(skillMeta))) {
    forgetHSkillOnPremiseFailure(actor, skillId, learnModeId);
    return;
  };

  actor.learnSkill(skillId);
  appendHStateMessage(buildHSkillMessage(skillId, `Expression…`), H_PASSIVE_PAGE_LINES, H_PASSIVE_PAGE_HEADER);
}

// Whether the skill may be learned by this actor (MainCharaPremise / SkillLearningClass).
function isHSkillTargetActor(skillMeta, actorId) {
  let mainCharaId = skillMeta['MainCharaPremise'] ? $gameVariables.value(VAR_MAIN_ACTOR_ID) : 0;
  if (skillMeta['SkillLearningClass']) mainCharaId = 100;// when present the skill is not learned here
  return mainCharaId == 0 || mainCharaId == actorId;
}

// Whether every premise (learned skill, rank, variable, array) is satisfied.
function meetsHSkillPremise(actor, hStateValues, premise) {
  for (let entry = 0; entry < PREMISE_ENTRY_COUNT; entry++) {
    if (!actor.isLearnedSkill(premise.skillIds[entry])) return false;
    if (!(actor.skillMasteryLevel(premise.rankSkillIds[entry]) >= premise.rankThresholds[entry])) return false;
    if (!($gameVariables.value(premise.varIds[entry]) >= premise.varThresholds[entry])) return false;
    if (!(hStateValues[premise.arrangementIndexes[entry]] >= premise.arrangementThresholds[entry])) return false;
  };
  return true;
}

// Forgets the skills whose premise variable dropped below the requirement (only meaningful on reset).
function forgetHSkillIfPremiseLost(actor, skillId, skillMeta) {
  if (!skillMeta['LostHSkill'] || !skillMeta['PremiseVariable1']) return;

  const premiseParams = skillMeta['PremiseVariable1'].split(',');
  const premiseVarId = Number(premiseParams[0]);
  const premiseThreshold = Number(premiseParams[1]);
  if ($gameVariables.value(premiseVarId) < premiseThreshold) {
    actor.forgetSkill(skillId);
  };
}

// In reset mode (2) forgets the skills whose premise is no longer met and reports them.
function forgetHSkillOnPremiseFailure(actor, skillId, learnModeId) {
  if (learnModeId != 2) return;

  actor.forgetSkill(skillId);
  const skillName = $dataSkills[skillId].name;
  CommonPopupManager.showInfo({}, `──${skillName}忘却…──`, null);
}

// H passive learn message; the suffix is either "Expression..." or "RankUp!".
function buildHSkillMessage(skillId, suffix) {
  const skillMarker = `${H_PASSIVE_PREFIX}\x1bSIN[${skillId}]\\C[0]`;
  const skillDescription = $dataSkills[skillId].description;
  return `──${skillMarker}${suffix}──\n${skillDescription}\\C[0]\n`;
}

// Special path for H skill learning and item acquisition.
hskill_learn2 = function () {

  const actor = currentHStateActor();
  if (!actor) return;

  const exposureRank = actor.skillMasteryLevel(SKILL_H_EXPOSURE);
  const exposureSkillName = $dataSkills[SKILL_H_EXPOSURE].name;

  grantClothItemByExposureRank(actor, exposureSkillName, exposureRank, zenravalueId, 1);// fully naked
  grantClothItemByExposureRank(actor, exposureSkillName, exposureRank, clothPartsChoice, 2);// single body part

  // Takes exactly one piece of clothing of the same ClothType category (rank 3: ClothBreakage / rank 4: modified)
  grantClothByType(exposureSkillName, exposureRank, 'ClothBreakage', 3);
  grantClothByType(exposureSkillName, exposureRank, '改', 4);

  releaseClothMenuByExposureRank(exposureSkillName, exposureRank);
  learnAllDevelopmentSkill(actor);
};

// Grants exactly one clothing item when the given rank is reached.
function grantClothItemByExposureRank(actor, exposureSkillName, exposureRank, itemId, rankThreshold) {
  const clothItem = $dataItems[itemId];
  if (!clothItem || exposureRank < rankThreshold || $gameParty.hasItem(clothItem)) return;

  $gameParty.gainItem(clothItem, 1);

  const exposureSkill = colorTaggedText(2, exposureSkillName);
  const itemIconName = colorTaggedText(27, `\x1bIIN[${itemId}]`);
  const clothDescription = clothItem.description;
  appendHStateMessage(`──${exposureSkill}が${rankThreshold}到達！　Got ${itemIconName}!──` + `\n${clothDescription}\n`, H_PASSIVE_PAGE_LINES, H_PASSIVE_PAGE_HEADER);
}

// Indexes the clothing items by kind (subCategory / ClothType).
// $dataItems does not grow after loading, so the index is built once per kind.
const clothTypeIndexCache = new Map();

function readClothTypeIndex(clothType) {
  if (clothTypeIndexCache.has(clothType)) return clothTypeIndexCache.get(clothType);

  const indexBySubCategory = new Map();
  forEachClothItem((item, itemMeta, itemId) => {
    if (itemMeta['ClothType'] != clothType) return;

    // Keep the candidates in ascending item id order (the scan order of the original)
    const subCategoryIds = indexBySubCategory.get(itemMeta['subCategory']);
    if (subCategoryIds) { subCategoryIds.push(itemId); return; }
    indexBySubCategory.set(itemMeta['subCategory'], [itemId]);
  });

  clothTypeIndexCache.set(clothType, indexBySubCategory);
  return indexBySubCategory;
}

// Visits every clothing item (an item with <subCategory> and <ClothType>) in id order.
function forEachClothItem(visitClothItem) {
  const items = $dataItems;
  const lastItemId = items.length - 1;

  for (let itemId = 1; itemId <= lastItemId; itemId++) {
    const item = items[itemId];
    if (!item) continue;

    const itemMeta = item.meta;
    if (!itemMeta['subCategory'] || !itemMeta['ClothType']) continue;
    visitClothItem(item, itemMeta, itemId);
  }
}

// Takes exactly one piece of clothing of the same ClothType category.
function grantClothByType(exposureSkillName, exposureRank, clothType, rankThreshold) {
  if (exposureRank < rankThreshold) return;

  const indexBySubCategory = readClothTypeIndex(clothType);
  const ownedClothSubCategories = collectOwnedClothSubCategories();

  for (const subCategory of ownedClothSubCategories) {
    const candidateItemIds = indexBySubCategory.get(subCategory);
    if (!candidateItemIds) continue;

    // The original stops as soon as it meets an owned candidate, so break is kept
    for (const candidateItemId of candidateItemIds) {
      if ($gameParty.hasItem($dataItems[candidateItemId])) break;

      clothes_get($gameVariables.value(VAR_CURRENT_ACTOR_ID), subCategory, clothType);
      appendClothGrantedByTypeMessage(exposureSkillName, rankThreshold, candidateItemId);
      break;
    };
  };
}

// Collects the subCategories of the owned items that carry a whole outfit (TotalCloth), without duplicates.
function collectOwnedClothSubCategories() {
  const subCategories = [];
  const seen = new Set();

  forEachClothItem((item, itemMeta) => {
    if (!itemMeta['TotalCloth']) return;
    if (!$gameParty.hasItem(item)) return;
    if (seen.has(itemMeta['subCategory'])) return;

    seen.add(itemMeta['subCategory']);
    subCategories.push(itemMeta['subCategory']);
  });
  return subCategories;
}

function appendClothGrantedByTypeMessage(exposureSkillName, rankThreshold, candidateItemId) {
  const exposureSkill = colorTaggedText(2, `${exposureSkillName}:Rank${rankThreshold}`);
  const itemIconName = colorTaggedText(27, `\x1bIIN[${candidateItemId}]`);
  appendHStateMessage(`──${exposureSkill}の効果により、Got ${itemIconName}!──` + `\n`, H_PASSIVE_PAGE_LINES, H_PASSIVE_PAGE_HEADER);
}

// Exposure development 5 unlocks the dress-up menu.
function releaseClothMenuByExposureRank(exposureSkillName, exposureRank) {
  if ($gameSwitches.value(SW_CLOTH_MENU_RELEASED) || exposureRank < 5) return;

  $gameSwitches.setValue(SW_CLOTH_MENU_RELEASED, true);
  const exposureSkill = colorTaggedText(2, exposureSkillName);
  const menuName = colorTaggedText(27, `着せ替え`);
  appendHStateMessage(`──${exposureSkill}が5到達！　メニュー画面に${menuName}出現──` + `\n\n`, H_PASSIVE_PAGE_LINES, H_PASSIVE_PAGE_HEADER);
}

// All development skills at 6 unlock the nine-combination skill.
function learnAllDevelopmentSkill(actor) {
  if (actor.isLearnedSkill(SKILL_ALL_DEVELOPMENT)) return;

  for (const skillId of buildHSkillRange(SKILL_H_DEV_FIRST, SKILL_H_DEV_LAST)) {
    if (actor.skillMasteryLevel(skillId) < 6) return;
  };

  actor.learnSkill(SKILL_ALL_DEVELOPMENT);
  const devPoints = colorTaggedText(2, `全開発度(経験値)`);
  const skillMarker = `\\C[27]\x1bSIN[${SKILL_ALL_DEVELOPMENT}]\\C[0]`;
  const description = $dataSkills[SKILL_ALL_DEVELOPMENT].description;
  const maxLabel = colorTaggedText(10, `Max`);
  const maxHeaderText = `──${devPoints}${maxLabel}！　${skillMarker}Expression!──`;
  appendHStateMessage(maxHeaderText + '\n' + description + `\\C[0]` + '\n', H_PASSIVE_PAGE_LINES, H_PASSIVE_PAGE_HEADER);
}

// Shows the conditions of the uncollected H passives.
// Header of the window when every H passive is learned, and the row height of the list.
const H_PASSIVE_COMPLETE_TEXT = `H-Passive Complete!`;
const H_PASSIVE_ROW_HEIGHT = 60;

actor_HpassiveConditions = function (unusedArg1, sourceActor, unusedItemId) {

  if (closeHPassiveWindow()) return;

  const actor = $gameActors.actor(sourceActor.actorId());
  if (!isGirl(actor)) {
    const actorName = actor.name();
    TickerManager.show(`${actorName}は対象キャラではありません…。`);
    return;
  };

  $gameSwitches.setValue(SW_H_PASSIVE_WINDOW, true);
  showHPassiveWindow(actor);

}

// Closes an already open H passive window; true when the window was open.
function closeHPassiveWindow() {
  if (!$gameSwitches.value(SW_H_PASSIVE_WINDOW)) return false;

  $gameSwitches.setValue(SW_H_PASSIVE_WINDOW, false);
  WindowManager.hide(1);
  return true;
}

// Draws the unlearned H skills, or the "nothing left" text when every skill is known.
function showHPassiveWindow(actor) {
  const unlearnedSkillText = buildUnlearnedHSkillText(actor);
  if (unlearnedSkillText.unlearnedCount < 1) {
    WindowManager.show(1, 0, 100, 1024, 180);
    WindowManager.drawText(1, colorTaggedText(27, FONT_SIZE_28 + H_PASSIVE_COMPLETE_TEXT));
    return;
  };

  WindowManager.show(1, 0, 0, 1280, unlearnedSkillText.unlearnedCount * H_PASSIVE_ROW_HEIGHT);
  WindowManager.drawText(1, FONT_SIZE_28 + unlearnedSkillText.unlearnedText);
};

// Lists the H passives that are not learned yet.
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

// Skill / item / state experience bonus.
// Activation tags of the H experience lists and the handler of each one.
const HEXP_ACTIVATION_EFFECTS = [
  { metaKey: 'HexpReflectionSkill', apply: applyHexpReflection },
  { metaKey: 'ProstitutionMoneyUp', apply: applyProstitutionMoneyUp }
];

// Every activation tag of the list is applied independently, in table order.
function applyHexpActivationEffects(entry) {
  const entryMeta = entry.meta;

  for (const activationEffect of HEXP_ACTIVATION_EFFECTS) {
    if (!entryMeta[activationEffect.metaKey]) continue;
    activationEffect.apply(entry, entryMeta);
  };
}

hStates_up1 = function (id) {

  const databaseEntries = readHexpDatabase(id);
  if (!databaseEntries) return;

  const actor = currentHStateActor();
  if (!actor) return;

  const battleSkills = actor.battleSkillsRaw();
  const metaList = databaseEntries.metaList;

  for (const entryId of metaList) {
    const entry = databaseEntries.entries[entryId];
    if (!battleSkills.includes(entryId)) continue;

    applyHexpActivationEffects(entry);
  };

  if (id == 3) {
    grantProstitutionJobExp(actor);
  };

};

// Database and metadata targets per id (1: skill, 2: item, 3: state).
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

// Numeric meta value with a fallback; the metadata of MV is always a string.
function readMetaNumber(meta, metaKey, fallbackValue) {
  const rawValue = meta[metaKey];
  return rawValue ? Number(rawValue) : fallbackValue;
}

// "<entry> activated (gain)" line shared by the passive reflection handlers.
function appendActivatedMessage(entry, gainDisplayText) {
  const entryName = colorTaggedText(27, `<${entry.name}>`);
  const gainText = colorTaggedText(31, gainDisplayText);
  appendHStateMessage(`${entryName}${H_ACTIVATED_WORD}${gainText}${EXP_ICON_MARKER}` + '\n', 3);
}

// HexpReflectionSkill: adds the variable value to another variable according to the skill rank.
function applyHexpReflection(entry, entryMeta) {
  const activateSwitchId = readMetaNumber(entryMeta, 'HexpActivateSwi', 2);
  if (!$gameSwitches.value(activateSwitchId)) return;

  const activateVarId = readMetaNumber(entryMeta, 'HexpActivateVal', 0);
  if (activateVarId < 1) return;

  const activateValue = $gameVariables.value(activateVarId);
  if (activateValue < 1) return;

  const reflectionSkillId = readMetaNumber(entryMeta, 'HexpReflectionSkill', 0);
  const reflectionVarId = readMetaNumber(entryMeta, 'HexpReflectionVal', 0);
  const reflectionSkillRank = readMetaNumber(entryMeta, 'HexpReflectionSkillRank', 0);

  const actor = currentHStateActor();
  const reflectionGain = activateValue * actor.skillMasteryLevel(reflectionSkillId) * reflectionSkillRank;
  $gameVariables.setValue(reflectionVarId, $gameVariables.value(reflectionVarId) + reflectionGain);

  appendActivatedMessage(entry, `(+${reflectionGain})`);
}

// ProstitutionMoneyUp: multiplies the prostitution income.
function applyProstitutionMoneyUp(entry, entryMeta) {
  const prostitutionMoney = $gameVariables.value(VAR_HSTATE_PROSTITUTION_MONEY);
  if (prostitutionMoney < 1) return;

  const prostitutionMoneyRate = Number(entryMeta['ProstitutionMoneyUp']);
  $gameVariables.setValue(VAR_HSTATE_PROSTITUTION_MONEY, prostitutionMoney * prostitutionMoneyRate);

  appendActivatedMessage(entry, `(×${prostitutionMoneyRate}\\G)`);
}

const H_ACTIVATED_WORD = `発動`;

// Temporary copy of the prostitution income and the experience of the prostitute / slave jobs.
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

// Icon that closes the job experience line.
const EXP_ICON_MARKER = `\\I[12]`;

// Sums the gains of this call stored in 401-440 (experience of the slave job).
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
  const jobMarker = `\x1bJ[${subclassId}]`;
  const jobLabel = colorTaggedText(27, `[${jobMarker}]`);
  const expText = colorTaggedText(31, `${jobExp}`);
  appendHStateMessage(`ジョブ:${jobLabel}に${expText}expを取得${EXP_ICON_MARKER}` + '\n', 3);
}

//---------------------------------------------------------------------------
// Libido cap enforcement / suppression display
//---------------------------------------------------------------------------

// Libido cap handling; the gain is discarded once the cap is reached.
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

// Whether the libido value after the gain reaches the cap.
function isLibidoCapped(libidoGain, hStateValues) {
  const libidoAfterGain = libidoGain + hStateValues[HSTATE_INDEX_AROUSAL];
  const arousalCap = hStateValues[HSTATE_INDEX_AROUSAL_CAP];
  return libidoAfterGain >= arousalCap && arousalCap >= 1;
}

// Cap message (ticker or message window).
function notifyLibidoSuppressed() {
  const suppressedMessage = `性欲度上限のため、性欲度上昇が抑制された。`;
  if ($gameSwitches.value(SW_TICKER_MESSAGE)) {
    TickerManager.show(suppressedMessage);
    return;
  };
  appendMessageStack(`\n${suppressedMessage}`);
}

// Target, threshold and message prefix of one suppression skill; null when it does not apply.
function readSuppressionEntry(actor, suppressionSkillId) {
  if (!actor.isLearnedSkill(suppressionSkillId)) return null;

  const suppressionSkill = $dataSkills[suppressionSkillId];
  if (actor.isLearnedSkill(Number(suppressionSkill.meta['Hide if Learned Skill']))) return null;

  const suppressionParams = suppressionSkill.meta['HstaSuppression'].split(',');
  return {
    target: Number(suppressionParams[0]),
    param: Number(suppressionParams[1]),
    note: '\n' + suppressionSkill.name + `の影響により`
  };
}

// Rank limits of the values other than libido.
hstates_rankSeigen = function () {

  const { actorId, actor } = readCurrentActor();
  if (!actor) return;

  const hStateValues = readHStateValues(actorId);
  let suppressionResult = `　`;

  for (const suppressionSkillId of valueHstaSuppression) {
    const suppressionEntry = readSuppressionEntry(actor, suppressionSkillId);
    if (!suppressionEntry) continue;

    const limitedCount = applyRankSuppression(actor, hStateValues, suppressionEntry.target,
      suppressionEntry.param, (limitedSkillId) => {
        suppressionResult += colorTaggedText(1, `[${$dataSkills[limitedSkillId].name}]`);
      });
    if (limitedCount < 1) continue;

    notifyRankSuppressed(suppressionEntry.note + suppressionResult + RANK_SUPPRESSION_SUFFIX);
  };

};

// Target 0 checks the development values 431-439 as a whole; returns how many were limited.
function applyRankSuppression(actor, hStateValues, suppressionTarget, suppressionParam, onLimited) {
  // The 431-439 case (development values as a whole) versus a single value
  const targetVarIds = suppressionTarget == 0
    ? VAR_SUPPRESSION_TARGET_IDS
    : [suppressionTarget];
  let limitedCount = 0;

  for (const targetVarId of targetVarIds) {
    if (!($gameVariables.value(targetVarId) >= 1)) continue;
    if (actor.skillMasteryLevel(targetVarId - HSTATE_ARRAY_VAR_OFFSET) != suppressionParam) continue;

    const usageTotal = $gameVariables.value(targetVarId) + hStateValues[targetVarId - VAR_HSTATE_PENDING_FIRST];
    if (!(usageTotal >= actor.skillMasteryUsageMax(targetVarId - HSTATE_ARRAY_VAR_OFFSET))) continue;

    $gameVariables.setValue(targetVarId, 0);
    onLimited(targetVarId - HSTATE_ARRAY_VAR_OFFSET);
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

// Compact libido gain display.
// Adds every changed H state of this call to the accumulated display text.
function appendLibidoStatLines(actor, hStateValues) {
  for (let statVarId = VAR_HSTATE_PENDING_FIRST; statVarId <= VAR_HSTATE_PENDING_LAST; statVarId++) {
    const statLine = buildLibidoStatLine(actor, hStateValues, statVarId);
    if (statLine === null) continue;
    valueWordSet0 += statLine;
  };
}

seiyoku_kanniHyouji = function () {

  const useTicker = $gameSwitches.value(SW_TICKER_MESSAGE);
  if (!useTicker) {
    valueWordSet0 = `${$gameVariables.value(VAR_MESSAGE_STACK)}\n`;
  };

  const { actorId, actor } = readCurrentActor();
  if (!actor) return;

  appendLibidoStatLines(actor, readHStateValues(actorId));

  // CHANGED: the original called TickerManager.show inside the loop every time (only the
  //          last call was visible), so the text is now shown once after it is final.
  if (useTicker) {
    TickerManager.show(valueWordSet0);
  } else {
    outputLibidoStatSummary();
  };
  $gameSwitches.setValue(SW_H_SCENE_SIMPLE, false);

};

// Current total of a stat: the 401-440 block reads the H state array, the rest the skill masteries.
function readStatDisplayValue(actor, hStateValues, statVarId) {
  if (statVarId >= VAR_HSTATE_PENDING_FIRST && statVarId <= VAR_SUPPRESSION_TARGET_LAST) {
    return hStateValues[statVarId - VAR_HSTATE_ECSTASY_BASE];
  };

  const statSkillId = statVarId - HSTATE_ARRAY_VAR_OFFSET;
  if (!actor.isLearnedSkill(statSkillId)) return null;
  return actor.skillMasteryUses(statSkillId);
}

// The gain as a coloured "+n！" (red) or "-n！" (blue) fragment.
function buildStatGainText(statValue) {
  const statGainSign = statValue >= 1 ? '+' : '';
  return colorTaggedText(statValue >= 1 ? 2 : 1, `${statGainSign}${statValue}！`);
}

// One libido gain display line; null when the value is skipped or did not rise.
function buildLibidoStatLine(actor, hStateValues, statVarId) {
  if (statVarId == VAR_HSTATE_EXPOSURE_LIMIT) return null;// 405 is never displayed

  const statValue = $gameVariables.value(statVarId);
  if (statValue == 0) return null;

  const statDisplayValue = readStatDisplayValue(actor, hStateValues, statVarId);
  if (statDisplayValue === null) return null;

  const statName = cleanVariableLabel($dataSystem.variables[statVarId]);
  const statGainText = buildStatGainText(statValue);
  const statTotalValue = statDisplayValue + statValue;
  const actorName = actor.name();
  return `${actorName}: ${statName}${statGainText}(${statTotalValue})` + '\n';
}

// Output of the compact display (accumulated text or DTextPicture).
function outputLibidoStatSummary() {
  if ($gameSwitches.value(SW_MESSAGE_STACK_MODE)) {
    $gameVariables.setValue(VAR_MESSAGE_STACK_ALT, `${valueWordSet0}\n`);
    $gameVariables.setValue(VAR_MESSAGE_STACK_COUNT, $gameVariables.value(VAR_MESSAGE_STACK_COUNT) + 1);
    return;
  };
  $gameScreen.setDTextPicture(valueWordSet0, 28);
}

// Libido bonuses.
seiyoku_hosei = function () {

  const { actorId, actor } = readCurrentActor();
  if (!actor) return;

  // Current value; sets the exposure limit
  rosyutu_genkai1(actor);
  rosyutu_genzai1(actor.actorId());

  // sets the arousal value
  $gameVariables.setValue(VAR_HSTATE_AROUSAL, $gameVariables.value(VAR_HSTATE_PENDING_FIRST));

  // records the first partner in H state array 41
  recordInitialExperiencePartner(actorId);

  // counts a monster encounter when the partner is a monster
  recordMonsterPartnerCount();

  // when a head count is given it sits in 339, so it is added to the partner count
  // suppresses the partner count gain for the same person
  recordDistinctPartnerCount(actorId);

  // records the H count with every partner
  recordPartnerHCount(actorId);

  // creampie decision
  rollInternalEjaculation(actor);

  // group rape from two partners upwards
  if ($gameVariables.value(VAR_GROUP_H_COUNT) >= 2) {
    $gameVariables.setValue(VAR_HSTATE_PENDING_GROUP_RAPE, 1);
  };

  // fertilisation check
  jusei_keisan();

  // adds to each development value according to the count
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

// Records the first partner in H state array 41.
function recordInitialExperiencePartner(actorId) {
  const hStateValues = readHStateValues(actorId);
  const sexCount = hStateValues[HSTATE_INDEX_SEX_COUNT];
  if (sexCount != 0) return;
  if (!($gameVariables.value(VAR_HSTATE_ECSTASY_BASE + HSTATE_INDEX_SEX_COUNT) >= 1)) return;

  hStateValues[HSTATE_INDEX_FIRST_PARTNER] = $gameVariables.value(VAR_PARTNER_NAME);
}

// Counts a monster encounter when the partner is a monster; an already present number is kept.
function recordMonsterPartnerCount() {
  if ($gameVariables.value(VAR_HSTATE_PENDING_MONSTER_H) != 0) return;

  const partnerWeapon = $dataWeapons[$gameVariables.value(VAR_PARTNER_WEAPON_ID)];
  // BUGFIX: crashed when the partner weapon id was 0 or out of range.
  if (!partnerWeapon) return;
  if (!partnerWeapon.meta['monster']) return;

  $gameVariables.setValue(VAR_HSTATE_PENDING_MONSTER_H, 1);
}

// Adds the given head count to the partner count (suppressed for the same person).
function recordDistinctPartnerCount(actorId) {
  const partnerHRecords = readPartnerRecords(actorId);
  const partnerRecordIndex = $gameVariables.value(VAR_PARTNER_WEAPON_ID) - 300;
  if (partnerHRecords[partnerRecordIndex] != 0) return;

  $gameVariables.setValue(VAR_HSTATE_PENDING_DISTINCT_PARTNERS,
    $gameVariables.value(VAR_HSTATE_PENDING_DISTINCT_PARTNERS) + $gameVariables.value(VAR_LAST_H_COUNT));
}

// Records the H count with every partner.
function recordPartnerHCount(actorId) {
  const hasAnyHCount = $gameVariables.value(VAR_H_VAGINAL_COUNT) >= 1
    || $gameVariables.value(VAR_H_ANAL_COUNT) >= 1
    || $gameVariables.value(VAR_H_FELLATION_COUNT) >= 1;
  if (!hasAnyHCount) return;

  readPartnerRecords(actorId)[$gameVariables.value(VAR_PARTNER_WEAPON_ID) - 300] += 1;
}

// Creampie decision; a coin toss decides and skills / states may override it.
function rollInternalEjaculation(actor) {
  const actorBattleSkills = actor.battleSkillsRaw();
  // Skill 871 / state 73 always finish inside, skill 872 / state 74 never do (the latter wins).
  const forceAllInternal = actorBattleSkills.includes(871) || actor.isStateAffected(73);
  const forceNoneInternal = actorBattleSkills.includes(872) || actor.isStateAffected(74);
  const rollInternalCount = (hCount) => countInternalRounds(hCount, forceAllInternal, forceNoneInternal);

  // Whether vaginal, anal or oral finished inside; an existing number in the target variable wins.
  for (const internalSlot of INTERNAL_COUNT_SLOTS) {
    recordInternalCountFor(internalSlot.countVarId, internalSlot.pendingVarId, rollInternalCount);
  }
}

// The three target variables of the internal rolls, in the order the original rolled them.
const INTERNAL_COUNT_SLOTS = [
  { countVarId: VAR_H_VAGINAL_COUNT, pendingVarId: VAR_HSTATE_PENDING_VAGINAL_INTERNAL },
  { countVarId: VAR_H_ANAL_COUNT, pendingVarId: VAR_HSTATE_PENDING_ANAL_INTERNAL },
  { countVarId: VAR_H_FELLATION_COUNT, pendingVarId: VAR_HSTATE_PENDING_FELLATION_INTERNAL }
];

// Number of rounds that finished inside; every coin is flipped so the random sequence stays the same.
function countInternalRounds(hCount, forceAllInternal, forceNoneInternal) {
  let internalCount = 0;
  for (let round = 1; round <= hCount; round++) {
    if (COIN_FLIP_VALUES[getRandomIndex(COIN_FLIP_VALUES.length)] == 1) internalCount += 1;
  };

  if (forceNoneInternal) return 0;
  if (forceAllInternal) return hCount;
  return internalCount;
}

// Records the internal count of one body part.
function recordInternalCountFor(hCountVarId, internalVarId, rollInternalCount) {
  const hCount = $gameVariables.value(hCountVarId);
  if (!(hCount >= 1)) return;
  if ($gameVariables.value(internalVarId) != 0) return;

  const computedInternal = rollInternalCount(hCount);
  if (!(computedInternal >= 1)) return;

  $gameVariables.setValue(internalVarId, $gameVariables.value(internalVarId) + computedInternal);
}

// Count to development value table (the order of the original is kept).
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

// Applies the semen state.
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

// Adds a development bonus on a count gain according to the rank of each development value (skills 51-56).
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

// Multiplies on a count gain according to the development rank (skills 51-59); runs last.
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

// Amplifies the arousal value with the sexual development value.
function applyEstrusAmplification(actor) {
  const sensualityLevel = actor.skillMasteryLevel(SKILL_H_SEXUAL_DEV);
  if (sensualityLevel < 1) return;

  const pendingEstrus = $gameVariables.value(VAR_HSTATE_AROUSAL);
  if (!(pendingEstrus >= 1)) return;

  $gameVariables.setValue(VAR_HSTATE_AROUSAL, pendingEstrus + pendingEstrus * sensualityLevel);
}

// At arousal 100 the climax count rises; squirting / incontinence follow the sexual development rank.
function applyClimaxCountIncrements(actor) {
  applyClimaxCounts(actor);
  applyClimaxFluidChances(actor);
}

// Climax count of this call; from skebe-ko upwards it also follows the body part counts.
function applyClimaxCounts(actor) {
  if (!($gameVariables.value(VAR_HSTATE_AROUSAL) >= 100)) return;

  addClimaxCount(VAR_H_CLIMAX_COUNT, 1);
  if (!actor.isLearnedSkill(SKILL_H_SKILLED)) return;

  // CHANGED: the original consumed an unused random number (getRandomIndex). The gain
  //          is vaginal (406) + anal (407) + fellatio (408) as the comment above describes.
  const aggregateHCount = $gameVariables.value(VAR_H_VAGINAL_COUNT)
    + $gameVariables.value(VAR_H_ANAL_COUNT)
    + $gameVariables.value(VAR_H_FELLATION_COUNT);
  addClimaxCount(VAR_H_CLIMAX_COUNT, aggregateHCount);
}

// Squirting / incontinence rolls; both need a climax and rank 3 of the sexual development.
function applyClimaxFluidChances(actor) {
  const sensualityLevel = actor.skillMasteryLevel(SKILL_H_SEXUAL_DEV);
  if (sensualityLevel < 3) return;
  if (!($gameVariables.value(VAR_H_CLIMAX_COUNT) >= 1)) return;

  const sensualityBonus = sensualityLevel * 10;
  if (getRandomIndex(SQUIRT_ROLL_RANGE) + sensualityBonus >= SQUIRT_THRESHOLD) {
    addClimaxCount(VAR_H_SQUIRT_COUNT, 1);
  };
  if (getRandomIndex(SQUIRT_ROLL_RANGE) + sensualityBonus >= INCONTINENCE_THRESHOLD) {
    addClimaxCount(VAR_H_INCONTINENCE_COUNT, 1);
  };
}

// Squirting / incontinence roll settings.
const SQUIRT_ROLL_RANGE = 101;
const SQUIRT_THRESHOLD = 80;
const INCONTINENCE_THRESHOLD = 110;

function addClimaxCount(climaxVarId, amount) {
  $gameVariables.setValue(climaxVarId, $gameVariables.value(climaxVarId) + amount);
}

// Pays out the prostitution income accumulated during the scene.
function grantProstitutionIncome() {
  const prostitutionMoney = $gameVariables.value(VAR_HSTATE_PROSTITUTION_MONEY);
  if (prostitutionMoney < 1) return;
  $gameParty.gainGold(Math.ceil(prostitutionMoney));
}

// Refreshes the libido information.
seiyoku_hanei = function () {

  const { actorId, actor } = readCurrentActor();
  if (!actor) return;

  const hStateValues = readHStateValues(actorId);
  applyPendingToHStateValues(hStateValues);

  if (hasAnyHCountToday()) {
    hStateValues[HSTATE_INDEX_TODAY_COUNT] += 1;
  };

  grantProstitutionIncome();

  const battleSkills = actor.battleSkillsRaw();
  applyRapeStateOnBattle(actor, hStateValues, battleSkills);
  calmEstrusOutsideBattle(actor, hStateValues, battleSkills);
  updateEstrusState(actor, hStateValues);

  recordHSkillRankUps(actor);
  writeBackHStateValues(hStateValues);
};

// Adds the 401-430 gains to H state array 1-30 (negative results stop at 0).
function applyPendingToHStateValues(hStateValues) {
  for (let index = 1; index <= 30; index++) {
    hStateValues[index] += $gameVariables.value(index + VAR_HSTATE_ECSTASY_BASE);
    if (hStateValues[index] < 0) {
      hStateValues[index] = 0;
    };
  };
}

// Whether any of the daily H, rape or head count variables is set.
const DAILY_H_COUNT_TRIGGER_VARS = [406, 407, 417, 418, 419, 420];

function hasAnyHCountToday() {
  return DAILY_H_COUNT_TRIGGER_VARS.some((varId) => $gameVariables.value(varId) >= 1);
}

// Raises the daily rape count; applies a daze state during battle.
function applyRapeStateOnBattle(actor, hStateValues, battleSkills) {
  if (!($gameVariables.value(VAR_HSTATE_PENDING_RAPE) >= 1)) return;

  hStateValues[HSTATE_INDEX_RAPE_TODAY] += 1;
  if ($gameParty.inBattle() && !battleSkills.includes(846)) {
    actor.addState(64);
  };
}

// Climax calms the estrus; handled by common event 113 during battle.
function calmEstrusOutsideBattle(actor, hStateValues, battleSkills) {
  if (battleSkills.includes(867)) return;
  if ($gameParty.inBattle()) return;
  if (!($gameVariables.value(VAR_H_CLIMAX_COUNT) >= 1)) return;

  let calmValue = 0;
  // the calming value rises with the learned skills 61-69
  for (let skillIndex = 0; skillIndex < CALM_RANDOM_MAX_BY_SKILL.length; skillIndex++) {
    if (!actor.isLearnedSkill(61 + skillIndex)) continue;
    calmValue += getRandomIndex(CALM_RANDOM_MAX_BY_SKILL[skillIndex]);
  };
  hStateValues[HSTATE_INDEX_ESTRUS] = calmValue;
}

const CALM_RANDOM_MAX_BY_SKILL = [1, 2, 3, 4, 5, 6, 6, 6, 6];

// Applies or removes the estrus state according to the arousal value (message only on a transition).
function updateEstrusState(actor, hStateValues) {
  if (hStateValues[HSTATE_INDEX_ESTRUS] >= ESTRUS_STATE_THRESHOLD) {
    if (!actor.isStateAffected(STATE_ESTRUS)) notifyEstrusStarted(actor);
    actor.addState(STATE_ESTRUS);
    return;
  };

  if (actor.isStateAffected(STATE_ESTRUS)) notifyEstrusCalmed(actor);
  actor.removeState(STATE_ESTRUS);
}

// Arousal value from which the estrus state is applied.
const ESTRUS_STATE_THRESHOLD = 50 + 1;

function notifyEstrusStarted(actor) {
  const actorName = actor.name();
  const estrusLabel = colorTaggedText(27, `発情`);
  notifyEstrusChange(`${actorName}は${estrusLabel}している…。`);
}

function notifyEstrusCalmed(actor) {
  const actorName = actor.name();
  const estrusLabel = colorTaggedText(27, `発情`);
  notifyEstrusChange(`${actorName}の${estrusLabel}が静まった…。`);
}

// Estrus messages; accumulated text or ticker.
function notifyEstrusChange(estrusMessage) {
  if ($gameSwitches.value(SW_MESSAGE_STACK_MODE)) {
    $gameVariables.setValue(VAR_MESSAGE_STACK_ALT, `${estrusMessage}\n`);
    $gameVariables.setValue(VAR_MESSAGE_STACK_COUNT, $gameVariables.value(VAR_MESSAGE_STACK_COUNT) + 1);
    return;
  };
  TickerManager.show(estrusMessage);
}

// Reflects the mastery gain of skills 51-59 and records the ones that ranked up.
function recordHSkillRankUps(actor) {
  valueHskillLearnArr = [];
  for (let skillId = SKILL_H_DEV_FIRST; skillId <= SKILL_H_DEV_LAST; skillId++) {
    const masteryLevelBefore = actor.skillMasteryLevel(skillId);
    actor.gainSkillMasteryUses(skillId, $gameVariables.value(skillId + HSTATE_ARRAY_VAR_OFFSET));
    const masteryLevelAfter = actor.skillMasteryLevel(skillId);
    if (masteryLevelBefore != masteryLevelAfter && masteryLevelBefore >= 1) {
      valueHskillLearnArr.push(skillId);
    };
  };
}

// Writes H state array 1-30 back into variables 401-430.
function writeBackHStateValues(hStateValues) {
  for (let index = 1; index <= 30; index++) {
    $gameVariables.setValue(VAR_HSTATE_ECSTASY_BASE + index, hStateValues[index]);
  };
}

//---------------------------------------------------------------------------
// Item / skill usage, daily fertility, history lists
//---------------------------------------------------------------------------

// Libido value update from a skill / item use: a,b,this.item().id,1
const LIBIDO_USE_LIMIT_SKILL_DEFAULT = 18;
const LIBIDO_USE_LIMIT_SKILL_NON_GIRL = 61;
const ITEM_USE_PARTNER_WEAPON_ID = 306;

// Gives the item back and explains why it cannot be used.
function rejectItemUseWithMessage(actor, entry, refusalText, refusalReasonText) {
  rejectItemUse(actor, entry);
  const actorName = actor.name();
  TickerManager.show(`${refusalReasonText || ''}${actorName}${refusalText}`);
}

// Libido items require the skill returned by resolveLibidoUseLimitSkill; a refusal also drops the ticker switch.
function canUseLibidoItem(actor, entry) {
  const requiredSkillId = resolveLibidoUseLimitSkill(entry.meta, actor);
  if (actor.isLearnedSkill(requiredSkillId)) return true;

  rejectItemUseWithMessage(actor, entry, `には使用する事が出来ない…。`, `条件を満たしていない為、`);
  $gameSwitches.setValue(SW_TICKER_MESSAGE, false);
  return false;
}

seiyoku_itemHanei = function (unusedArg1, targetItem, itemOrSkillId, isSkill) {

  const databaseEntries = isSkill == 1 ? $dataSkills : $dataItems;
  const targetActorId = targetItem.actorId();
  $gameVariables.setValue(VAR_CURRENT_ACTOR_ID, targetActorId);

  const actor = $gameActors.actor(targetActorId);
  if (!actor) return;

  const entry = databaseEntries[itemOrSkillId];
  if (!isHeroineActor(targetActorId)) {
    rejectItemUseWithMessage(actor, entry, `には使用する事が出来ない…。`);
    return;
  };

  // Shows the used item name; no passive reflection on item use.
  if (!canUseLibidoItem(actor, entry)) return;

  applyItemLibidoJudgement(targetActorId, entry.meta);
  reportItemUse(actor, entry, databaseEntries);
};

// Whether the actor is a heroine (meta['Heroine']).
function isHeroineActor(actorId) {
  const targetActorData = $dataActors[actorId];
  return !!(targetActorData && targetActorData.meta['Heroine']);
}

// Gives the item back when it cannot be used.
function rejectItemUse(actor, entry) {
  $gameParty.gainItem(entry, +1);
}

// Skill id required for the use; girls are checked against a different skill.
function resolveLibidoUseLimitSkill(itemMeta, actor) {
  const limitSkillId = readMetaNumber(itemMeta, '性欲度使用制限', LIBIDO_USE_LIMIT_SKILL_DEFAULT);
  return isGirl(actor) ? limitSkillId : LIBIDO_USE_LIMIT_SKILL_NON_GIRL;
}

// Applies the H judgement value of the item and runs the whole libido update.
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

// Shows the remaining count only on item use.
function reportItemUse(actor, entry, databaseEntries) {
  if (databaseEntries == $dataItems) {
    const itemName = entry.name;
    const ownedItemCount = $gameParty.numItems(entry);
    TickerManager.show(`${itemName}：${ownedItemCount}個`);
  };
  $gameSwitches.setValue(SW_TICKER_MESSAGE, false);
}

// Fertility of the day.
const FERTILIZER_SKILL_ID = 65;           // unlocked by skebe-ko
const FERTILITY_RANDOM_MAX = 11;
const FERTILITY_MONSTER_BONUS_MAX = 51;

jusei_todayrate = function () {

  forEachHeroineId((actorId) => {
    const actor = $gameActors.actor(actorId);
    if (!actor) return;
    applyTodayFertility(actor);
  });

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

// Actor history entry, actor_Hhennreki(3);valueWordSet
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

// One history line of an H state (description + progress).
function buildHStateHistoryLine(actor, stateId) {
  let stateDescText = `${$dataStates[stateId].description}`;
  const stateCounter = actor.getStateCounter(stateId);
  if (stateCounter != undefined) {
    const progress = '進行度';
    stateDescText += `\\C[27]${progress}:${stateCounter}\\C[0]`;
  };
  return stateDescText + `\n`;
}

// Actor history pre-pass 2, actor_Hhennreki2Before(4,5,6);
// The choice numbers are the real array indices plus one.
// Trailing spaces keep the three headers aligned; they are layout, not text.
const HISTORY_HEADER_GAP = '　　　　　　';
const HISTORY_HEADER_PADDING = '　　 　　　　　　　　　　　　　　　';
const HISTORY_HEADER_PADDING_LONG = '　　　　　　　　　　　　　　　　';

const HISTORY_HEADERS = {
  4: `\\I[526]` + colorTaggedText(27, `男性遍歴` + HISTORY_HEADER_GAP) + HISTORY_HEADER_PADDING,
  5: `\\I[428]` + colorTaggedText(27, `出産履歴` + HISTORY_HEADER_GAP) + HISTORY_HEADER_PADDING,
  6: `\\I[556]` + colorTaggedText(27, `シーン履歴（直近100件）`) + HISTORY_HEADER_PADDING_LONG,
};

actor_Hhennreki2Before = function (displayTypeId) {

  const { actorId, actor } = readCurrentActor();
  if (!actor) return;

  const hStateValues = readHStateValues(actorId);
  $gameSystem.addCustomChoice(1, { text: `\\FS[25]${HISTORY_HEADERS[displayTypeId]}`, value: 0 });

  if (displayTypeId == 4 && hStateValues[HSTATE_INDEX_FIRST_PARTNER] != 0) {// 41 holds a name
    addCustomChoice(buildFirstPartnerChoice(actor, hStateValues));
  };
  if (displayTypeId == 5 && hStateValues[HSTATE_INDEX_FIRST_CHILD_PARTNER] >= 1) {// 49 holds an id
    addCustomChoice(buildFirstChildChoice(actor, hStateValues));
  };

};

function addCustomChoice(text) {
  $gameSystem.addCustomChoice(1, { text: `\\FS[25]${text}`, value: 1 });
}

// First partner (the wording changes with skill 67).
function buildFirstPartnerChoice(actor, hStateValues) {
  const knowsPartner = actor.isLearnedSkill(SKILL_PARTNER_KNOWN);
  const firstPartnerText = knowsPartner ? `初体験の相手:` : `処女を奪った相手:`;
  const firstPartnerLabel = colorTaggedText(knowsPartner ? 27 : 30, firstPartnerText);
  return `${firstPartnerLabel}${hStateValues[HSTATE_INDEX_FIRST_PARTNER]}`;
}

// Father of the first child (the wording changes with skill 67).
function buildFirstChildChoice(actor, hStateValues) {
  const knowsPartner = actor.isLearnedSkill(SKILL_PARTNER_KNOWN);
  const firstChildText = knowsPartner ? `初子の父親:` : `初子を産んだ男:`;
  const firstChildLabel = colorTaggedText(knowsPartner ? 27 : 30, firstChildText);
  return `${firstChildLabel}${$dataWeapons[hStateValues[HSTATE_INDEX_FIRST_CHILD_PARTNER]].name}`;
}

// Actor history 2, actor_Hhennreki2(4,5,6);
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

// Male history / birth history list.
function appendPartnerHistoryChoices(displayTypeId, listSettings) {
  const { actorId, actor } = readCurrentActor();
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

// Marks a partner that also recorded the other direction of the scene.
const REVERSE_RECORD_MARKER = `\\I[374]`;

// History text of one partner.
// Coloured partner label of the history list; the profession and the family name win in that order.
function buildPartnerHistoryLabel(partnerWeapon) {
  const partnerMeta = partnerWeapon.meta;
  const profession = partnerMeta['Profession'];
  const familyName = partnerMeta['FamilyName'];

  if (profession) return `[${profession}]` + colorTaggedText(16, partnerWeapon.name);
  if (familyName) return colorTaggedText(16, `${partnerWeapon.name} = ${familyName}`);
  return colorTaggedText(16, partnerWeapon.name);
}

function buildPartnerHistoryEntry(displayTypeId, listSettings, partnerHRecords, recordIndex, knowsAll) {
  const partnerWeapon = $dataWeapons[recordIndex + listSettings.nameOffset];
  let entryText = buildPartnerHistoryLabel(partnerWeapon) + `:`;

  const hCount = partnerHRecords[recordIndex];
  entryText += colorTaggedText(knowsAll ? 27 : 1, `${hCount}`) + `回`;

  const hasReverseRecord = partnerHRecords[recordIndex + listSettings.reverseOffset] >= 1;
  if ($gameSwitches.value(SW_HISTORY_DETAIL) && displayTypeId == 4 && hasReverseRecord) {
    entryText += REVERSE_RECORD_MARKER + `？`;
  };
  return entryText;
}

// Scene history (last 100 entries); the array starts at 1.
function appendSceneHistoryChoices() {
  const sceneHistoryArray = $gameVariables.value(VAR_HISTORY_SCENE_ARRAY);
  const actorId = $gameVariables.value(VAR_CURRENT_ACTOR_ID);
  const sceneHistory = sceneHistoryArray ? sceneHistoryArray[actorId] : 0;
  if (!sceneHistory || sceneHistory.length <= 0) return;

  for (let index = sceneHistory.length - 1; index >= 1; index--) {
    $gameSystem.addCustomChoice(1, { text: `\\FS[25]${sceneHistory[index]}`, value: index + 1 });
  };
}

//---------------------------------------------------------------------------
// Generic H scene text BGV / single word phrases
//---------------------------------------------------------------------------

// Generic H scene text BGV, <generic scene arousal low:>scene_textBgv($gameVariables.value(318),640,384);
const MOAN_ICON_MARKER = `\\I[12]`;
const defaultSexualEcstasyHi = [`「アッ…」`, `「ンっ…」`, `「ンンっ…」`, `（ピクっ…` + MOAN_ICON_MARKER + `）`];
const defaultSexualEcstasyMiddle = [
  `「アッ…` + MOAN_ICON_MARKER + `」`, `「ンっ…」`, `「ンンっ…` + MOAN_ICON_MARKER + `」`,
  `（ピクっ…` + MOAN_ICON_MARKER + `）`
];
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

// Reveals the text picture; moveSceneTextPicture then slides it into its final place.
// Scale the scene text picture starts with, and the larger one used without a wait.
const SCENE_TEXT_SCALE = 100;
const SCENE_TEXT_START_SCALE = 150;

function showSceneTextPicture(showSize, pictureId, startX, startY) {
  $gameScreen.showPicture(pictureId, "", 1, startX, startY, showSize, showSize, 255, 0);
}

function moveSceneTextPicture(pictureId, targetX, targetY, waitTime) {
  $gameScreen.movePicture(pictureId, 1, targetX, targetY, 100, 100, 0, 0, waitTime);
}

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

  const targetX = baseX + chosenXOffset;
  const targetY = baseY + chosenYOffset;
  // With a wait the line slides in from the side, otherwise it shrinks from the larger start scale.
  const slideInXOffset = waitMode != 0 ? pickRandomValue(additionalXOffsetOptionsSceneTextBgv) : 0;
  const startScale = waitMode != 0 ? SCENE_TEXT_SCALE : SCENE_TEXT_START_SCALE;

  showSceneTextPicture(startScale, chosenPictureId, targetX + slideInXOffset, targetY);
  moveSceneTextPicture(chosenPictureId, targetX, targetY, chosenWaitTime);
};

// Moaning lines that follow the learned skills (concatenated with the lines of variable 707).
function pickSceneTextPhrase(gameActor) {
  let ecstasyPhrases = [];
  let combinedEcstasyArray = [];

  if ($gameSwitches.value(SW_ECSTASY_VOICE)) {
    const actorMeta = gameActor.actor().meta;
    ecstasyPhrases = readEcstasyPhrases(gameActor, actorMeta);
  } else {
    combinedEcstasyArray = $gameVariables.value(VAR_H_SCENE_PHRASES) || [];
  };

  if (ecstasyPhrases.length > 0) {
    combinedEcstasyArray = combinedEcstasyArray.concat(ecstasyPhrases);
  };
  return combinedEcstasyArray[getRandomIndex(combinedEcstasyArray.length)] || '';
}

// Skills 68 and 65 change the line grade.
// Highest grade first: the first learned skill decides the phrase list.
const ECSTASY_PHRASE_GRADES = [
  { skillId: 68, metaKey: 'SexualEcstasyHi', defaultPhrases: defaultSexualEcstasyHi },
  { skillId: 65, metaKey: 'SexualEcstasyMiddle', defaultPhrases: defaultSexualEcstasyMiddle },
  { skillId: 0, metaKey: 'SexualEcstasyLow', defaultPhrases: defaultSexualEcstasyLow }
];

function readEcstasyPhrases(gameActor, actorMeta) {
  for (const phraseGrade of ECSTASY_PHRASE_GRADES) {
    if (phraseGrade.skillId >= 1 && !gameActor.isLearnedSkill(phraseGrade.skillId)) continue;

    const gradePhrases = actorMeta[phraseGrade.metaKey];
    return gradePhrases ? gradePhrases.split(',') : phraseGrade.defaultPhrases;
  };
}

// Reserves one usable text picture id (the used id is removed from the array).
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

// One-word line on part of the CG, pic_oneWord(valueSerialPictureId,x,y,25,60,arr1);
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

// Birth calculation.
actor_pregnancyCalculation = function (actorId) {

  $gameVariables.setValue(VAR_CURRENT_ACTOR_ID, actorId);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;
  if (!actor.isStateAffected(STATE_PREGNANT)) return;

  // clears the pregnancy and continues with the birth
  actor.removeState(STATE_PREGNANT);
  actor.removeStateCounter(STATE_PREGNANT);
  $gameVariables.setValue(VAR_ACTOR_NAME_MIRROR, actor.name());

  // removes the temporary size gain of the pregnancy
  clearPregnancySwell(actorId);

  recordBirthFather(actorId);
};

function clearPregnancySwell(actorId) {
  const hStateValues = readHStateValues(actorId);
  for (let offset = 0; offset < 4; offset++) {
    hStateValues[HSTATE_INDEX_PREGNANCY_SWELL + offset] = 0;
  };
}

// Counts the birth for the father and stores him as the first child partner.
function recordBirthFather(actorId) {
  const fatherSlot = pickFatherSlot(actorId);
  const partnerHRecords = readPartnerRecords(actorId);
  partnerHRecords[fatherSlot + PREGNANCY_CHILD_SLOT_OFFSET] += 1;

  const hStateValues = readHStateValues(actorId);
  if (hStateValues[HSTATE_INDEX_FIRST_CHILD_PARTNER] == 0) {
    hStateValues[HSTATE_INDEX_FIRST_CHILD_PARTNER] = fatherSlot + PARTNER_CHILD_SLOT_OFFSET;
  };

  // resets the array used to identify the fertilising partner
  clearFertilizationPartnerRecords(partnerHRecords);
}

// Picks one father from the fertilisation records 101-200 (102 when there is none).
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
// Standing picture shown by the H profile.
const HSTATES_BACKGROUND1 = "HstatesBackGround1";
const HSTATES_FRAME = "HstatesFrame";
const HSTATES_ACTOR_BUST_WHITE = "HstatesActorBustWhite";
const HSTATES_ACTOR_BODY = "HstatesActorBody";
const HSTATES_ACTOR_BUST = "HstatesActorBust";
const HSTATES_ACTOR_HEAD = "HstatesActorHead";
const HSTATES_BG_SHINE1 = "hStates_bgShine1";
const HSTATES_BODY_SHINE1 = "hStates_bodyShine1";
const HSTATES_BACKGROUND = "HstatesBackGround"; // the variable value is appended to the name
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

const H_TACHIE_BASE_PICTURE_ID = 111;     // base picture id of the standing picture
const H_TACHIE_DEFAULT_HUE = '#00d0ff';
const H_TACHIE_FADE_PICTURE_NAME = "HscenePose054";
// Layers of the standing picture (relative ids from basePicId) and their positions
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
  const gameActor = $gameActors.actor(actorId);// expected to be called from a common event
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

// The head is replaced according to the physique flag (index 32 of array 440).
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

// Applies the sway effect only to the pictures that are visible.
function applyBlessToPictures(firstPictureId, lastPictureId) {
  for (let pictureId = firstPictureId; pictureId <= lastPictureId; pictureId++) {
    if ($gameScreen.picture(pictureId)) {
      tachie_bless(pictureId, 0);
    }
  };
}

function setupParticleEffects(gameActorMeta) {
  const actorHue = gameActorMeta['tachieHue2'] ? gameActorMeta['tachieHue2'] : H_TACHIE_DEFAULT_HUE;
  const particle = $gameScreen._particle;

  particle.particleSet(0, HSTATES_BG_SHINE1, 'picture:116', 'def', 'above');
  particle.particleSet(0, HSTATES_BODY_SHINE1, 'picture:118', 'def', 'above');
  particle.particleUpdate([HSTATES_BODY_SHINE1, 'pos', 0, 20]);
  particle.particleUpdate([HSTATES_BODY_SHINE1, 'color', actorHue, actorHue + '@0.5', actorHue]);
}

// Particle / background update for the current stage (variable 191).
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

// Glow settings per stage (alpha / speed / scale / color / emitterLifetime).
function applyHStageParticleEffects(basePicId, hStage) {
  const particle = $gameScreen._particle;
  const bustWhitePictureId = basePicId + H_TACHIE_LAYERS.bustWhite;

  if (hStage >= 1) {
    particle.particleUpdate([HSTATES_BODY_SHINE1, 'alpha', '0.7', '0.3' + '@0.5', '0']);
  }
  if (hStage >= 2) {
    $gameScreen.movePicture(bustWhitePictureId, 1, 1024, 384, 100, 100, 150, 0, 60);
    particle.particleUpdate([HSTATES_BODY_SHINE1, 'speed', '0.5', '0.5' + '@0.5', '0.5']);
  }
  if (hStage >= 3) {
    $gameScreen.movePicture(bustWhitePictureId, 1, 1024, 384, 100, 100, 50, 0, 60);
    particle.particleUpdate([HSTATES_BODY_SHINE1, 'scale', '10', '6' + '@0.5', '6']);
    particle.particleUpdate([HSTATES_BODY_SHINE1, 'color', '#eb00ff', '#eb00ff@0.1', '#ffffff']);
  }
  if (hStage >= 4) {
    particle.particleUpdate([HSTATES_BODY_SHINE1, 'emitterLifetime', '1']);
    $gameScreen.movePicture(bustWhitePictureId, 1, 1024, 384, 100, 100, 0, 0, 60);
    particle.particleClear(HSTATES_BG_SHINE1);
    particle.particleSet(0, 'hStates_bgShine2', 'picture:57', 'def', 'blow');
  }
}

// Fades the background in from stage 2 upwards.
function applyHStageBackgroundFade(basePicId, hStage) {
  if (hStage < 2) return;

  const fadeDuration = hStage >= 5 ? H_TACHIE_BACKGROUND_FADE_DURATION_HIGH : fadeDurationsMap[hStage] || 0;
  $gameScreen.showPicture(basePicId + H_TACHIE_LAYERS.backgroundFade,
    HSTATES_BACKGROUND + hStage, 1, 1024, 384, 100, 100, 255, 0);
  picture_fade1(basePicId + H_TACHIE_LAYERS.backgroundFade, "fadeOut", H_TACHIE_FADE_PICTURE_NAME, fadeDuration, 5);
}

// Switches the foreground background from stage 2 upwards.
function applyHStageBackgroundTransition(basePicId, hStage) {
  if (hStage < 2) return;

  $gameScreen.showPicture(basePicId + H_TACHIE_LAYERS.backgroundFore,
    HSTATES_BACKGROUND + hStage, 1, 1024, 384, 100, 100, 0, 0);
  $gameScreen.movePicture(basePicId + H_TACHIE_LAYERS.backgroundBase, 1, 1024, 384, 100, 100, 0, 0, 120);
  $gameScreen.movePicture(basePicId + H_TACHIE_LAYERS.backgroundFore, 1, 1024, 384, 100, 100, 255, 0, 120);
}

// Expression variants (different names are layered on stages 1 and 5).
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

// Derives the standing picture stage (191) and the expression variant (192) from the learned skills.
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

// Resets the libido information.
const RESET_MODE_CHOICES = 1;             // build the choice window
const RESET_MODE_APPLY = 2;               // apply the choice
// Index range of the H state array that the reset covers (1-30) and of the skill part (31-40).
const HSTATE_INDEX_FIRST = 1;
const HSTATE_INDEX_LAST = 30;
const RESET_SKILL_FIRST = 31;
const RESET_SKILL_LAST = 40;

const RESET_SKIPPED_VAR_IDS = [402, 403, 404, 405, 428, 429];
const RESET_SKILL_OFFSET = 20;

seiyoku_parameterReset = function (resetModeId) {

  const { actorId, actor } = readCurrentActor();
  if (!actor) return;

  const hStateValues = readHStateValues(actorId);
  if (resetModeId == RESET_MODE_CHOICES) {
    fillResetChoicesValues(actor, hStateValues);
    addResetCustomChoices();
  };
  if (resetModeId != RESET_MODE_APPLY) return;

  applyResetSelection(actor, hStateValues);
  hskill_learn(2);// forget the matching H skills
};

// Publishes the current values (401-430) and the skill masteries (431-439) for the choice window.
function fillResetChoicesValues(actor, hStateValues) {
  for (let varId = VAR_HSTATE_PENDING_FIRST; varId <= VAR_HSTATE_PENDING_LAST; varId++) {
    if (varId == VAR_HSTATE_EXPOSURE_LIMIT) continue;

    if (varId <= VAR_HSTATE_PENDING_DEVELOPMENT_BASE) {
      $gameVariables.setValue(varId, hStateValues[varId - VAR_HSTATE_ECSTASY_BASE]);
      continue;
    };

    const skillId = varId - HSTATE_ARRAY_VAR_OFFSET;
    $gameVariables.setValue(varId, actor.isLearnedSkill(skillId) ? actor.skillMasteryLevel(skillId) : 0);
  };
}

function addResetCustomChoices() {
  $gameSystem.addCustomChoice(1, { text: `一括で未経験に変更　　　　　　　　　　　　　　　　　　`, value: 0 });
  for (let varId = VAR_HSTATE_PENDING_FIRST; varId <= VAR_SUPPRESSION_TARGET_LAST; varId++) {// experience values 431-439
    if (RESET_SKIPPED_VAR_IDS.includes(varId)) continue;
    $gameSystem.addCustomChoice(1, { text: `${$dataSystem.variables[varId]}${$gameVariables.value(varId)}`, value: varId });
  };
}

// Resets the H state / skill matching the selected variable id.
function applyResetSelection(actor, hStateValues) {
  const selectedVarId = $gameVariables.value(VAR_PENDING_HSTATE_INPUT);

  if (isHStateResetTarget(selectedVarId)) {
    resetHStateRange(actor, hStateValues, selectedVarId, HSTATE_INDEX_FIRST, HSTATE_INDEX_LAST);
  };
  if (isSkillResetTarget(selectedVarId)) {
    resetSkillRange(actor, selectedVarId, RESET_SKILL_FIRST, RESET_SKILL_LAST);
  };
}

// Whether the variable id is an H state reset target (1-30).
function isHStateResetTarget(selectedVarId) {
  return selectedVarId == 0 || isInRange(selectedVarId - VAR_HSTATE_ECSTASY_BASE, HSTATE_INDEX_FIRST, HSTATE_INDEX_LAST);
}

// Whether the variable id is a skill reset target (31-40).
function isSkillResetTarget(selectedVarId) {
  return selectedVarId == 0 || isInRange(selectedVarId - VAR_HSTATE_ECSTASY_BASE, RESET_SKILL_FIRST, RESET_SKILL_LAST);
}

function isInRange(value, minValue, maxValue) {
  return value >= minValue && value <= maxValue;
}

// Index range of a reset request: 0 resets the given full range, any other value
// names one entry of the 401-440 variable block.
function readResetRange(selectedVarId, minIndex, maxIndex) {
  if (selectedVarId == 0) return { startIndex: minIndex, endIndex: maxIndex };
  const selectedIndex = selectedVarId - VAR_HSTATE_ECSTASY_BASE;
  return { startIndex: selectedIndex, endIndex: selectedIndex };
}

// H state reset (0 means the whole range).
function resetHStateRange(actor, hStateValues, selectedVarId, minIndex, maxIndex) {
  const { startIndex, endIndex } = readResetRange(selectedVarId, minIndex, maxIndex);

  for (let index = startIndex; index <= endIndex; index++) {
    if (!(hStateValues[index] >= 1)) continue;

    hStateValues[index] = 0;
    $gameVariables.setValue(index + VAR_HSTATE_ECSTASY_BASE, 0);

    const variableNameText = cleanVariableLabel($dataSystem.variables[index + VAR_HSTATE_ECSTASY_BASE]);
    showResetNotice(colorTaggedText(1, variableNameText) + `がリセットされました…`);

    if (index == HSTATE_INDEX_SEX_COUNT) {
      hStateValues[HSTATE_INDEX_FIRST_PARTNER] = 0;
      showResetNotice(colorTaggedText(2, `初体験相手`) + `がリセットされました…`);
    };
  };
}

// Forget H skills (0 means the whole range).
function resetSkillRange(actor, selectedVarId, minIndex, maxIndex) {
  const { startIndex, endIndex } = readResetRange(selectedVarId, minIndex, maxIndex);

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

// Harassment scene before the restraint.
const SEKUHARA_STATE_ID = 81;
const SEKUHARA_STATE_COUNTER_BONUS = 10;
const SEKUHARA_STATE_SWITCH_ID = 437;
const SEKUHARA_OVERLAY_PICTURE_ID = 54;
const SEKUHARA_OVERLAY_PICTURE_NAME = 'Screen_Width512Black'; // used when only the right half shows the H CG
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

  const { actorId, actor } = readCurrentActor();
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
  const enemyType = $gameSwitches.value(SW_GOBLIN_ENEMY) ? 2 : 1;// depends on the partner: 1 human, 2 goblin, 3 giant

  showSekuharaPoses(actor, actorId, imageSetting, enemyType);

  $gameVariables.setValue(VAR_H_SCENE_TEXT_X, actorId);// text HBGV
  $gameVariables.setValue(VAR_H_SCENE_PICTURE_PARAMS, [640 + 400, 384 + 20, 1, 60, 0, 0]);
  $gameSwitches.setValue(SW_ECSTASY_VOICE, true);

};

// Applies the harassment state and returns the elapsed counter.
function addSekuharaState(actor) {
  actor.addState(SEKUHARA_STATE_ID);
  if (actor._stateCounter[SEKUHARA_STATE_ID] >= 1) {
    actor.addStateCounter(SEKUHARA_STATE_ID, +SEKUHARA_STATE_COUNTER_BONUS);
  } else {
    actor.setStateCounter(SEKUHARA_STATE_ID, 1);
  };
  return actor._stateCounter[SEKUHARA_STATE_ID];
}

// Whether switch 437 should be raised from the libido value and the counter.
function isSekuharaSwitchEnabled(arousalValue, stateCounter) {
  const exposureThreshold = Math.ceil((arousalValue + 1) / 10) + stateCounter;// the +1 guards the zero case
  return exposureThreshold >= getRandomIndex(101);
}

// Display time and pose stage according to the libido value.
function resolveSekuharaImageSetting(arousalValue) {
  const matchedSetting = SEKUHARA_IMAGE_SETTINGS.find((setting) => arousalValue >= setting.exposureThreshold);
  return matchedSetting || { imageDuration: SEKUHARA_DEFAULT_IMAGE_DURATION, poseVariant: 1 };
}

// Shows poses 1-9.
function showSekuharaPoses(actor, actorId, imageSetting, enemyType) {
  const physiqueStateValues = readPartnerBodyValues(actorId);
  // CHANGED: the original reused poseVariant outside the loop (it leaked into the later poses).
  //          The result is carried over to the next pose to keep that behaviour.
  let poseVariant = imageSetting.poseVariant;

  for (let poseIndex = 1; poseIndex < 10; poseIndex++) {
    if (isSekuharaPoseSkipped(poseIndex, poseVariant, physiqueStateValues, actor)) continue;

    poseVariant = resolveSekuharaPoseVariant(poseIndex, poseVariant, physiqueStateValues, enemyType);
    showSekuharaPose(actorId, poseIndex, poseVariant, imageSetting.imageDuration);
  };
}

// Whether this pose is skipped.
function isSekuharaPoseSkipped(poseIndex, poseVariant, physiqueStateValues, actor) {
  if (poseIndex == SEKUHARA_SKIPPED_POSE_INDEXES_FOR_BUST && physiqueStateValues[HSTATE_BODY_INDEX_BUST_FLAG] == 0) return true;
  if (poseIndex == SEKUHARA_POSE_INDEX_REQUIRED_STAGE && poseVariant <= 3) return true;
  if (poseIndex == SEKUHARA_POSE_INDEX_PREGNANT && !actor.isStateAffected(STATE_PREGNANT)) return true;
  return false;
}

// Variant number per pose (the order dependency of the original is kept).
function resolveSekuharaPoseVariant(poseIndex, imageSettingVariant, physiqueStateValues, enemyType) {
  let poseVariant = imageSettingVariant;
  if (SEKUHARA_SINGLE_VARIANT_POSE_INDEXES.includes(poseIndex)) { poseVariant = 1 };
  if (poseIndex == 3 && poseVariant >= 5) { poseVariant = 2 };
  if (poseIndex == 5 && physiqueStateValues[HSTATE_BODY_INDEX_HEAD_VARIANT] >= 1) { poseVariant = 2 };
  if (poseIndex == SEKUHARA_POSE_INDEX_WITH_MOVIE) { poseVariant = enemyType };
  return poseVariant;
}

// Animation mode name the picture plugin expects for the movie pose.
const SEKUHARA_ANIMATION_MODE = '連番';

// Image name of a harassment pose; the movie pose uses a numbered sequence.
function buildSekuharaImageName(actorId, poseIndex, poseVariant, isMovie) {
  const imageName = 'Zev_BattleSekuharaActor' + actorId + '_' + poseIndex + '_' + poseVariant;
  return isMovie ? imageName + '_0' : imageName;
}

function showSekuharaPose(actorId, poseIndex, poseVariant, imageDuration) {
  const pictureId = valuePic1 + poseIndex;
  const isMovie = poseIndex == SEKUHARA_POSE_INDEX_WITH_MOVIE;
  if (isMovie) {
    $gameScreen.setPicturesAnimation(2, imageDuration, SEKUHARA_ANIMATION_MODE, 30);
  };

  const secuharaImageName = buildSekuharaImageName(actorId, poseIndex, poseVariant, isMovie);
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

// H sounds and effects BGS line. Normal 1, H 2-9, weather 10, Bgv 10 + actor id
const ACTION_TYPE_NO_OP = 99;             // stop every BGS
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

const H_PINK_FLASH_PICTURE_ID = 111;      // CHANGED: keeps the existing behaviour of reusing picture id 111
const H_PHOTOGRAPH_PICTURE_NAME = 'ScreenWhiteOut';
const H_BLACK_OUT_PICTURE_NAME = 'ScreenBlackOut';
const H_FLASH_COLOR_PINK = [255, 119, 255];

sex_direction = function (actionType, pistonIntensity, patternVariant) {

  const voiceInfo = readHSceneVoiceInfo($gameVariables.value(VAR_H_SCENE_ACTOR), pistonIntensity);
  // intensity 0 is derived from the skill (resolved before the table lookup)
  const resolvedPistonIntensity = voiceInfo.resolvedPistonIntensity != null
    ? voiceInfo.resolvedPistonIntensity
    : pistonIntensity;

  routeSexAction(actionType, resolvedPistonIntensity, patternVariant, voiceInfo.voicePatternNum);
};

// Dispatches the action type to its handler; unknown types do nothing.
function routeSexAction(actionType, pistonIntensity, patternVariant, voicePatternNum) {
  const handler = SEX_ACTION_HANDLERS[actionType];
  if (!handler) return;
  handler(pistonIntensity, patternVariant, voicePatternNum);
}

// Voice pattern number and the piston intensity derived from the skill when 0 is given.
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
  //   Stops every BGS and sets variable 194 (line number) back to 1.
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

  //   Defaults target actionType 3 (fluid / love juice).

  //   First BGS setup
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

  //   Optional second BGS setup
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

  //   Advances the BGS line setting.
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

  //   Picks the pattern number for the variant.
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

  //   Shared body used by the subclasses that inherit play().
  play() {
    this.updateBgsLineSetting();
    this.playBgs(this.soundName, this.volumeOffset, this.pitchOffset, this.volumeRandomIndexMax, this.pitchRandomIndexMax);

    if (this.playSecond) {
      this.updateBgsLineSetting();
      // CHANGED: the getters were called as functions, which raised a TypeError.
      this.playBgs(this.soundName2, this.volumeOffset2, this.pitchOffset2, this.volumeRandomIndexMax2, this.pitchRandomIndexMax2);
    }

    this.playPatternBGS();
  }
}

class FluidSoundEffect extends SexActionSoundEffectBase {
  //   The defaults already target the love juice setting
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

// Insertion / ejaculation sound effects; the wait time changes how they play.
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

  //   Plays a random sound effect.
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

    // When there is no wait time, sway once and only play, then draw the next wait time.
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
    sex_direction(0); // closure: end of the concentration lines
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
  // Photography; the picture id reuses the intensity.
  $gameScreen.showPicture(pistonIntensity, H_PHOTOGRAPH_PICTURE_NAME, 1, 640, 384, 100, 100, 250, 0);
  $gameScreen.movePicture(pistonIntensity, 1, 640, 384, 100, 100, 0, 0, 20);
  AudioManager.playSe({ "name": 'ZH_Photograph', "volume": 100, "pitch": 100, "pan": 0 });
  valueSexWait = 30;
}

// Eye blink helper; fadeType is "fadeIn" (close) or "fadeOut" (open).
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

// Every action type plays its sound effect from this one place.
function playSexActionSoundEffect(SoundEffectClass, pistonIntensity, patternVariant, voicePatternNum) {
  new SoundEffectClass(pistonIntensity, patternVariant, voicePatternNum).play();
}

function actionType54SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  // faint pink light
  const pinkFlashPictureName = 'ScreenPinkFlash';
  $gameScreen.setPicturesAnimation(2, patternVariant / 2, "横", patternVariant);
  $gameScreen.showPicture(H_PINK_FLASH_PICTURE_ID, pinkFlashPictureName, 1, 640, 384, 100, 100, pistonIntensity, 3);
  $gameScreen.picture(H_PINK_FLASH_PICTURE_ID).startAnimationFrame(1, true, [1, 1, 1, 2]);
}

// Action type -> handler. The actionType value comes from the common events of the game.
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

// ADV H part effect clear. 0 runs, 1 finishes
const ADVDIRECT_CLEAR = 0;
const ADVDIRECT_FEEL = 1;
const ADVDIRECT_STRONG_FEEL = 2;
const ADVDIRECT_EXTREME_CLIMAX = 3;
const ADVDIRECT_LIGHT_FEEL = 4;
const ADVDIRECT_SHOW_BREASTS = 5;

// Effect type -> entry point; the type values are passed by the common events.
const ADVDIRECT_HANDLERS = {
  [ADVDIRECT_CLEAR]: adv_HpartDirectPlay_Clear,
  [ADVDIRECT_FEEL]: adv_HpartDirectPlay_Feel,                       // feel
  [ADVDIRECT_STRONG_FEEL]: adv_HpartDirectPlay_StrongFeel,          // feel strongly
  [ADVDIRECT_EXTREME_CLIMAX]: adv_HpartDirectPlay_ExtremeClimax,    // climax strongly, permanent clear required
  [ADVDIRECT_LIGHT_FEEL]: adv_HpartDirectPlay_LightFeel,            // feel lightly
  [ADVDIRECT_SHOW_BREASTS]: adv_HpartDirectPlay_ShowBreasts         // show breasts
};

adv_HpartDirectPlay = function (effectType) {
  const effectHandler = ADVDIRECT_HANDLERS[effectType];
  // Unknown types do nothing
  if (!effectHandler) return;
  effectHandler();
};

const ADVDIRECT_PARTICLE_NAMES_TO_CLEAR = ['Ecstasy_c1', 'lines_heightH1'];

function adv_HpartDirectPlay_Clear() {
  for (const particleName of ADVDIRECT_PARTICLE_NAMES_TO_CLEAR) {
    $gameScreen._particle.particleClear(particleName);
  };
}

// Shared base of the ADV H part effects; options override the look and the volume.
class AdvHPartDirectPlayEffect {
  constructor(options = {}) {
    this.particleName = 'Ecstasy_c1';
    // options: alpha (string), scaleUpdate ([start, end]), soundPitchOffset (number), filterDuration (number)
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

// 1: feel
class AdvHPartDirectPlay_FeelEffect extends AdvHPartDirectPlayEffect {
  constructor() {
    super({
      alpha: '0.4',
      soundPitchOffset: 60,
      filterDuration: 40
    });
  }
}

// 2: feel strongly (with a scale change)
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

// 4: feel lightly
class AdvHPartDirectPlay_LightFeelEffect extends AdvHPartDirectPlayEffect {
  constructor() {
    super({
      alpha: '0.3',
      soundPitchOffset: 80,
      filterDuration: 30
    });
  }
}

// 5: show breasts (flash only)
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

// 3: climax strongly; released on the second call.
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
  // NOTE: the original spelled it "spritset" (that behaviour is kept)
  $gameScreen._particle.particlePlay(0, particleName, 'screen', 'def', 'spritset');
  $gameScreen._particle.particleUpdate([particleName, 'scale', '10', '20']);
  $gameScreen._particle.particleUpdate([particleName, 'alpha', '0.30', '0']);
}

//---------------------------------------------------------------------------
// Libido skill probability up
//---------------------------------------------------------------------------
// Chance based gain from the libido skills; 50% at most
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

// Number of learned libido skills.
function countLearnedSeiyokuSkills(gameActor) {
  let learnedCount = 0;
  for (const skillId of skillRangeSeiyokuSkillProbabilityUp) {
    if (gameActor.isLearnedSkill(skillId)) learnedCount += 1;
  };
  return learnedCount;
}

//}());
