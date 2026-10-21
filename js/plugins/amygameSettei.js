/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//---------------------------------------------------------------------------
// Collector helpers used by the database scans at the end of the file.
// They stay global because other plugins push into the same arrays.
//---------------------------------------------------------------------------

//Appends the comma separated meta tag values to a collector array
//(e.g. <Equip State:5,12> -> valueEquipPassiveSkill).
pushArray = function(metaValue, targetArray){
  if (!metaValue) return;
  targetArray.push(...metaValue.split(','));
};

//Pushes an id into a collector array when the meta tag was present.
pushValid = function(condition, targetArray, id){
  if (!condition) return;
  targetArray.push(id);
};

(function() {

//---------------------------------------------------------------------------
// Small builders used by the tables below
//---------------------------------------------------------------------------

// Base stat column order of every *Statas table below: hp, mp, at, de, ma, dx,
// ag, lu (attack, defence, magic, dexterity, agility, luck).
const STAT_COLUMN_ORDER = [`hp`, `mp`, `at`, `de`, `ma`, `dx`, `ag`, `lu`];

// Creates a rows x columns matrix filled with zeros.
function createNumberMatrix(rowCount, columnCount) {
  const matrix = [];
  for (let row = 0; row < rowCount; row++) {
    matrix.push(new Array(columnCount).fill(0));
  };
  return matrix;
}

// Copies an { index: value } table into an already sized array
// (used for the "slot id -> resource id" tables such as the state animations).
function applyIndexTable(targetArray, indexTable) {
  for (const index of Object.keys(indexTable)) {
    targetArray[Number(index)] = indexTable[index];
  };
  return targetArray;
}

//---------------------------------------------------------------------------
// Actor and class base statistics (see STAT_COLUMN_ORDER for the columns)
//---------------------------------------------------------------------------
valueActor1Statas = [70, 12, 9, 7, 8, 7, 8, 6];
valueActor2Statas = [60, 7, 9, 7, 7, 10, 10, 8];
valueActor3Statas = [80, 4, 8, 7, 2, 3, 2, 6];
valueActor4Statas = [50, 4, 5, 4, 3, 10, 8, 4];
valueActor5Statas = [30, 4, 3, 2, 5, 2, 4, 1];

// Class base statistics, same STAT_COLUMN_ORDER as the actors above.
valuePeplesStatas = [40, 10, 5, 4, 6, 5, 3, 3];
valueFighterStatas = [60, 5, 7, 5, 3, 5, 4, 5];
valueNightStatas = [90, 4, 5, 9, 4, 3, 2, 4];
valuePriestStatas = [40, 10, 4, 3, 7, 4, 3, 5];
valueMagicianStatas = [30, 10, 3, 3, 10, 3, 4, 4];
valueThiefStatas = [40, 3, 4, 2, 2, 6, 9, 10];
valueEnhancerStatas = [50, 4, 6, 4, 3, 10, 5, 3];
valueGrapplerStatas = [60, 5, 7, 3, 3, 4, 8, 4];
valueSamuraiStatas = [60, 4, 8, 4, 2, 8, 5, 3];
valueRangerStatas = [50, 3, 4, 5, 3, 10, 5, 5];
valueHarpistStatas = [40, 10, 5, 4, 6, 5, 3, 3];
valueSlaveStatas = [10, 1, 1, 1, 1, 2, 2, 1];

// Destroyer: single-target attacker with a very low HP/defence curve.
valueDestroyerStatas = [40, 1, 25, 2, 2, 2, 2, 2];

//---------------------------------------------------------------------------
// Runtime scratch state shared between common events and other plugins.
// These names are part of the plugin contract: other plugins read them
// directly, so only the grouping comments are new here.
//---------------------------------------------------------------------------

//--- Event / scene scratch values --------------------------------
valueLocationPreset = 0;
valueNpcGuraTemporarilySave = Array(12).fill(0);
valueEquipPassiveSkill = [];//Equip State  Passive State
valueEquipPassiveWeapon = [];//Equip State  Passive State
valueEquipPassiveArmor = [];//Equip State  Passive State
valueCharaWaitCount1 = 0;
valueCharaWaitCount2 = 0;
valueCharaWaitCount3 = 0;
valueCharaWaitCountarray1 = [];
valueCharaWaitCountarray2 = [];
valueBlackScreenId = 0;
valueBossEnemiesId = 30;
valueanimalEventId = 0;
valueanimalEvent2Id = 0;
valueMetalKiller = 0;
valueHtextWord = [];
valueThisEventId = 0;
valueLevelFluctuation = 0;
valuePartyMainLv = Array(21).fill(0);
valuePartySubLv = Array(21).fill(0);
valueProstitutionMoney = 0; //売春基本額一時代入。イベントで手元に残らない場合の処理

//--- Quest rank settings (D..S) ----------------------------------
valueQuestRankD = [0,250,25];
valueQuestRankC = [692,1000,50];
valueQuestRankB = [693,3000,100];
valueQuestRankA = [694,10000,300];
valueQuestRankS = [695,100000,500];

//--- General configuration values ----------------------------------
valueArmorsLength = 500 - 1;//防具のデータベース上最大数 (last armor id used by the meta scans)
valueSceneConditions1 = true;
valueSceneConditions2 = true;
valueSceneConditions3 = true;
valueGraphicsWidth = 0;
valueHypnosisCount = 60;//AddPluginSystemByVillaA.jsで使用
valueTacieSet = [0,0,0,0,0,0];
valueCommonId = 0;
valueAutoSkipPicX = 0;
valueMapBGM = [0,0,0,0];
valueMapBGS = [0,0,0,0];
valueWeatherSceneSet = 14;
valueWipeImg = 'Town129';
valueScenePic = 'Xev001_';
valuepstate = 700;//パッシブスキルID開始
valueclasses = 20;//汎用クラスID開始
valuewtype = 0;//パッシブスキル条件武器タイプ
valuepelement = 50;//パッシブスキル条件属性
valueTotalexp = 1;//
valueTotalgold = 1;//
valueDropItems = 0;
valueItemDropUpItem = 51;//所持でドロップアップアイテム

//--- Skill ids that other plugins look up by name ----------------
valueCookingSkillId = 762;
valueHuntingSkillId = 763;
valueHarvestingSkillId = 764;
valueMiningSkillId = 765;
valueAppraisalSkillId = 766;
valueBlacksmithSkillId = 767;
valueAlchemySkillId = 768;
valueFishingSkillId = 769;
valueAgricultureSkillId = 770;
valueBusinessSkillId = 771;
valueFootpadSkillId = 772;
valueStrippingSkillId = 773;
valueIdentifySkillId = 797;
valueMassGatheringSkillId = 799;
valueHoneyTrapSkillId = 875;
valueFightingSpiritSkillId = 778;
valueLeadershipSkillId = 779;

//--- Doll / item-box state ids -----------------------------------
valueDollStateId = 598;
valueItemBoxOpen = 0;//アイテム袋開封時に使用
valueSerialPictureId = 0;//スクリプトを跨いだピクチャＩＤに使用

//--- Dress-up (cloth) command ids --------------------------------
clothNextChoice = 1303;//次へ→1199
clothPreviousChoice = 1304;//前へ→1200
clothPartsChoice = 1305;//衣装パーツ指定<OFF>1201
clothBigSmallCgoice = 1306;//拡大⇔縮小1202
clothSlideUp = 1307;//↑にスライド1203
clothSlideDown = 1308;//↓にスライド1204
clothPresetSave = 1309;//↑にスライド1203
clothPresetLoad = 1310;//↓にスライド1204
zenravalueId = 1311;//全裸アイテムID

//--- Skill learning and battle scratch values ----------------------
valueSkillLearnJPCost = 0;//スキル習得時のＪＰコスト計算
valueTrialJustBeforeTP = Array(21).fill(0);//トライアル開始直前に格納する現在TP
valueJobReleaseTorF1 = Array(51).fill(0);//ジョブ解放時の一時配列
valueJobReleaseTorF2 = Array(51).fill(0);//ジョブ解放時の一時配列
valueParticleDirectSet = 0;
valueADVCutinDirect = 0;
valueEnemyEntrySetId = 0;//エネミー特定変数。バトルグループ1で設定
valueEnemyEventId = 0;//エネミーID
valueAddPowerCustom = 0;//武器防具スキルステートで計算されるスキル威力加算
valueTotalDamageCount = 0;//トータルダメージ計算
valueTotalDamageCount2 = 0;//トータルヒット数計算
valueVictoryResult = 0;//ボス戦闘後の結果代入
valueBossId = 0;//ボスのイベントIDthis._eventId
valueTroopId = 0;//ボス指定戦闘のバトルグループID
valueRandomSet = 0;

//--- Shared counters and generic string arrays -------------------
valueCountSet1 = 0;
valueCountSet2 = 0;
valueCountSet3 = 0;
valueCountSet4 = 0;
valueCountSet5 = 0;
valueCountSet6 = 0;
valueCountSet7 = 0;
valueCountSet8 = 0;
valueCountSet9 = 0;
valueScriptSet1 = 0;
valueSPBuyCountSet1 = 0;
valueSPBuyCountSet2 = 0;
valueCountDefeadSwitche1 = 0;
valueCountDefeadSwitche2 = 0;
valueWordArray = [];//get_loopChoiceDisplay1(1,0,1);//用
valueCountArray = [];//get_loopChoiceDisplay1(1,0,1);//用
valueCountArray2 = [];//get_loopChoiceDisplay1(1,0,1);//用
valueCountArray3 = [];//汎用
valueIkkatuArray = [];
valueScriptArray1 = [];//汎用配列、文字で効果音BGS
valueScriptArray2 = [];//汎用配列、文字で効果音BGS
valueTalkSet = 0;
valueTalkarr1 = [];
valueWordSet0 = 0;
valueWordSet1 = 0;
valueWordSet2 = 0;
valueWordSet3 = 0;
valueWordSet4 = 0;
valueWordSet5 = 0;
valueWordSet6 = 0;
valueWordSet7 = 0;
valueWordSet8 = 0;
valueWordSet9 = 0;//２連撃目セリフ用
valueWordSet10 = 0;//３連撃目セリフ用

//--- Quest progress arrays (one slot per quest id) ---------------
valueQuestArray1 = [];
valueQuestArray2 = Array(201).fill(0);
valueQuestArray3 = Array(201).fill(0);
valueQuestArray4 = Array(201).fill(0);
valueQuestArray5 = Array(201).fill(0);
valueQuestArray6 = Array(201).fill(0);
valueQuestArray7 = Array(201).fill(0);//特別依頼の発生条件未達の時に条件を表示する為
valueQuestArrayEX = Array(201).fill(0);//受注時のクエスト達成進行時にポップアップ表示のため
valueQuestArrayEX2 = Array(201).fill(0);
valueWordSetEx = 0;//称号アイテムスキル習得忘却にのみ使用する
valueHskillLearnArr = [];//Hexp上昇時にスキルランクアップした場合にpush

//--- Menu / window layout values ---------------------------------
valueMenuBackOpacity = 192;
valuePriceSet1 = 0;//価格と所持金比較時に使用shop_priceComparison
valueSceneName1 = 0;
valueSceneDescription1 = 0;
valueAddDescriptionSkill = Array(201).fill(0);
valueAddDescriptionClass = Array(101).fill(0);
valueClassGrowStatasComparison = Array(101).fill(0);
valueParallelEventId = 0;
valueMenuStandval1 = 0;
valueMenuStandval2 = 0;
valueMenuStandval3 = 1280;//メニュー画面で表示する変数メッセージx軸
valueBattleRecord_0 = 0;
valueBattleRecord_1 = 0;
valueBattleRecord_2 = 0;
valueBattleRecord_3 = 0;
valueHeroineCoice = [];//ヒロインのみのアクター選択時に事前にIDを配列に入れておく
valueBattleRecordMVP = Array(11).fill(0);
valueCutInSet1 = Array(7).fill(0);
valueTachieBless = [100,100,250,0.004,0.003];//立ち絵用息遣い設定。基本状態
valueTachieBless2 = [100,100,250,0.004,0.003];//追加息遣い設定。基本状態
valueInfoY = 0;//インフォプラグイン表示Ｙ軸補正値
valueMoveSet1 = 0;
valueStatusSet1 = 0;//InBattleStatusと通常ステータス画面で切り替えに使用
valueInBattleStatus = 0;//InBattleStatus表示中か否か

//--- Per-actor cloth slot caches (index = actor id) --------------
valueLiningCloth = Array(11).fill(0);
valueBackHairCloth = Array(11).fill(0);
valueBustUpCloth = Array(11).fill(0);
valueBustUpCloth2 = Array(11).fill(0);
valueCoatCloth = Array(11).fill(0);
valueFrontHairCloth = Array(11).fill(0);

//--- Battler, drop and chain-bonus scratch values ------------------
valueFaceSelect = 1;
valueAttackCount = 0;//召喚効果などで攻撃と味方にステ付与を同時にする時、付与を重複させないため
valueSexWait= 0;//射精や挿入演出のウェイトによる効果切り替え用
valueBossCharaGura = [1,0,0,0,0];
valueMenuCloth = 0;
valueDropCount1 = 0;
valueDropEnemyLevel = 1;
valueDropEnemyPicId = 101;
valueRegionMapArray = Array(151).fill(0);//リージョンごとのタイル数。map_regionCountSet で更新される
valueLastChoiceMapSelectSkill = 0;
valueSummonSkillLearn = 450;
valueSeisyoujuuStartId = 260;
valueChainAddPower = 0;
valueChainTotalStat = 0;
valueChainMemberCount = 0;
valueChainElement = 0;
valueChainSkillId = 0;

//--- Picture / shake scratch values ------------------------------
valuePicArr1= Array(15).fill(0);
valuePicWait= 0;
valuePicWait2= 0;//original_scene系列用
valueShakeArr1 = [];
valueShakeArr2 = [];

//---------------------------------------------------------------------------
// Skill type colours and state animations
//---------------------------------------------------------------------------
// Skill type id (1-15) -> font colour code used by the skill list windows.
const SKILL_TYPE_COLOR_TABLE = [16, 16, 16, 16, 14, 10, 23, 11, 2, 20, 14, 18, 18, 30, 27];
// Slot 0 stays 0: skill type 0 has no colour entry.
valueSkillColorArr = [0, ...SKILL_TYPE_COLOR_TABLE];

// State id (4-11) -> animation id played on the battler while the state is on.
const STATE_ANIMATION_TABLE = { 4: 701, 5: 702, 6: 703, 7: 704, 8: 705, 9: 706, 10: 707, 11: 708 };
const STATE_ANIMATION_SLOT_COUNT = 501;
valueStateAnimeArr = applyIndexTable(new Array(STATE_ANIMATION_SLOT_COUNT).fill(0), STATE_ANIMATION_TABLE);

//---------------------------------------------------------------------------
// Battle / picture scratch values
//---------------------------------------------------------------------------
valueBossEnemyId = 0;
valueBossAddLevel = 0;
valueEnemyAddLevel = 0;
valuePic1 = 0;
valuePic2 = '';
valuePic3 = 0;
valuePic4 = 0;
valueParallelPic1 = 0;
valueParallelPic2 = 0;
valueParallelPic3 = 0;
valueParallelPic4 = 0;
valueParallelPic5 = 0;
valueParallelPic6 = 0;
valueParallelPic7 = 0;
valueParallelPicSe1 = [0,0,0];
valueParallelPicSe2 = [0,0,0];
valueBattleAddAttack = 0;
valueSkillDamageType = 0;
valueDirectionPointX = 0;
valueDirectionPointY = 0;
valueSkillSpecialDispel35 = 0;//霊体に通常ダメージ
valueMultiAttackCount = 0;
valueShopMaxCols = 2;//ショップメニューコアで使用
valueGetInfoPointX = 0;
valueBattleSexCountArr = Array(21).fill(0);
valueScenePartnerId = 0;
valueMapNameSpecialStaging = Array(501).fill(0);

//---------------------------------------------------------------------------
// Database derived collector arrays
//---------------------------------------------------------------------------

//Game variable that receives the map ids whose events must not respawn.
const EVENT_RESPAWN_BAN_VAR_ID = 202;
//Item icon index that marks a "title" item (its effect works without equipping).
const TITLE_ITEM_ICON_INDEX = 234;
//valueAttackAmplifysActorId shape: one row per actor, one column per element.
const ATTRIBUTE_POWER_ACTOR_COUNT = 21;
const ATTRIBUTE_POWER_COLUMN_COUNT = 101;

//(Re)creates every array that amygame_originalVal() fills from the database.
//The plugin load and amygame_originalSettei() both call this, so the list of
//arrays to reset exists in exactly one place.
function resetDatabaseCollectors() {
valueEnemyAddState = [];//<付与ネーム><付与グラネーム><NameCondiAddState><GraphicNameCondiAddState>
valueHstateDisplay = [];//<Hステ表示指定><HstateDisplaySet>
valueStateBattleClear = [];//<戦闘後カウント消去ステート><BattleEndCoutaClearState>
valueStatePartyGoldRate = [];//<パーティ獲得Gレート:10.0><PartyGoldRate>
valueStatePartyExpRate = [];//<パーティ獲得Expレート:10.0> <PartyExpRate>
valueStateEnemyExpRate = [];//<経験値レート:3.0><EnemyExpRate><PartyGoldRate>
valueStateEnemyGoldRate = [];//<ゴールドレート:3.0><EnemyExpRate><PartyGoldRate>
valueStateGetItems = [];//<討伐数アイテム:361><SubjugationPointItem>
valuePersonalSkill = [];//<主人公習得><MCharacterLearn>
valuePersonalItem = [];
valueChangeSkill = [];//<スキル名称変化><ValSkillChangeName>
valueJouhouBattleMap = [];//<戦闘マップ情報>アイテム
valueJouhouTown = [];//<街情報>武器
valueVariablesChangeSkill = [];//<スキル名称変数><ValSkillChangeName>
valueHeroGetSkill = [];//<主人公獲得パッシブスイッチ><MCharacterSkillLearnSwith>
valueOneDayLimitItem = [];//<一日一回スキルコスト>?
valueHStatesUp1 = [];//<性経験反映><HexpReflectionSkill>スキル
valueHStatesUp2 = [];//<性経験反映><HexpReflectionSkill>アイテム
valueHStatesUp3 = [];//<性経験反映><HexpReflectionSkill>ステート
valuePhysiquUp = [];//<体型変化><StyleSizeChange>
valueTachieChangeState = [];//ステートで立ち絵固定
valueTachieChangeStateTemporary = [];//部位毎で立ち絵を変化。汗など
valueFaceChangeState = [];//ステートで表情固定<FaceChange:23>
valuePassiveAdd = [];//<パッシブ条件:1>スキル<PassiveCondi>
valuePassivePlussSkill = [];//<パッシブplus効果>スキル<PassivePlusEffect>
valuePassivePlussSkill2 = [];//<パッシブplus特徴>スキル<PassivePlusTrait>
valueMaxEnemyLv = 0;
valueEnemyDropAdd1 = [];//<UniqueDrop:1>エネミーのステートで変化
valueItemDropRate1 = [];//汎用ドロップ設定アイテム
valueHstaSuppression = [];//性欲経験抑制スキル
valueClassStateA = [];//ドロップに影響のあるクラスステート<classStateDrop>
valueSouwasceneAddId = [];//挿話追加アイテムID<挿話集アイテム>
valueHsceneAddId = [];//Hシーン追加アイテムID<Hシーンアイテム>
valueStartCommentary0 = 1;//初期解説コモンに使う返り値加算
valueStartCommentary1 = 1;//初期解説コモンに使う一つ辺りのピクチャID加算変数
valueStartCommentary2 = Array(101).fill(0);//初期解説コモンに使う文章の表示２個目必要かどうか
valueStartCommentary3 = Array(101).fill(0);//初期解説コモンに使う文章の表示３個目必要かどうか
valueStartCommentary2P = Array(101).fill(0);//初期解説コモンに使うピクチャの表示２個目必要かどうか
valueStartCommentary3P = Array(101).fill(0);//初期解説コモンに使うピクチャの表示３個目必要かどうか
valueGetHskillLearn = [];//習得性欲スキル
valueTitleSetItemsNoSetEffect = [];//セットしなくても効果を発揮するタイトルアイテム
valueAttackElements = [];//スキル使用直前に代入される攻撃属性配列
valueAttackStates = [];//スキル使用直前に代入される攻撃付与ステート配列
valueAttackAmplifysActorId = createNumberMatrix(ATTRIBUTE_POWER_ACTOR_COUNT, ATTRIBUTE_POWER_COLUMN_COUNT);
valuePassiveElementP = [];//パッシブで属性威力upアクターのみ
valueAddPowerCustomSkill = [];//スキル威力加算
valueAddPowerCustomWeapon = [];
valueAddPowerCustomArmor = [];
valueAddPowerCustomState = [];
valueCasinoMedalItem = [];
valueCollapseAnime = 0;
valueStateAddState = [];//<stateAddState:5,201,2>
valueSubjugationPoint = [];//<SubjugationPoint>
valueCertainlyTriple = [];//<CertainlyTriple>
valueCertainlyDouble = [];//<CertainlyDouble>
valueNormalAttackHit = [];//<NormalAttackHit:1>
valueAttackAbilityHit = [];//<AttackAbilityHit:1>
valueBattleAddAttackSet = [];//<BattleAddAttackSet:10>
valueDispelGuardState = [];//<DispelGuard>
};
resetDatabaseCollectors();

//Collector rule modes: push the entry id itself, or push the meta tag's
//comma separated values into the target array.
const COLLECT_MODE_ID = 0;
const COLLECT_MODE_LIST = 1;

//One walk over a database; every rule that matches pushes into its array.
function collectDatabaseEntries(database, collectorTable, lastScannedId) {
  const scanEnd = lastScannedId === undefined ? database.length : lastScannedId + 1;

  for (let databaseId = 1; databaseId < scanEnd; databaseId++) {
    const databaseEntry = database[databaseId];
    if (!databaseEntry) continue;
    applyCollectorRules(databaseEntry, collectorTable, databaseId);
  };
}

function applyCollectorRules(databaseEntry, collectorTable, databaseId) {
  for (const collector of collectorTable) {
    applyCollectorRule(collector, databaseEntry, databaseId);
  };
}

function applyCollectorRule(collector, databaseEntry, databaseId) {
  if (collector.mode === COLLECT_MODE_LIST) {
    pushArray(databaseEntry.meta[collector.metaKey], collector.getTargetArray());
    return;
  };
  if (!isCollectorMatched(collector, databaseEntry)) return;
  collector.getTargetArray().push(databaseId);
}

//A rule matches when its custom test passes, or, without a custom test, when
//the meta tag holds a truthy value (this is what the old pushValid() did).
function isCollectorMatched(collector, databaseEntry) {
  if (collector.isMatch) return collector.isMatch(databaseEntry);
  return !!databaseEntry.meta[collector.metaKey];
}

//States: meta tag -> array of state ids carrying it.
const STATE_META_COLLECTORS = [
  { metaKey: 'HstateDisplaySet', getTargetArray: () => valueHstateDisplay },
  { metaKey: 'BattleEndCoutaClearState', getTargetArray: () => valueStateBattleClear },
  { metaKey: 'PartyGoldRate', getTargetArray: () => valueStatePartyGoldRate },
  { metaKey: 'PartyExpRate', getTargetArray: () => valueStatePartyExpRate },
  //Both name tags feed the same array (graphic name variants of the same entry).
  { metaKey: 'NameCondiAddState', getTargetArray: () => valueEnemyAddState },
  { metaKey: 'GraphicNameCondiAddState', getTargetArray: () => valueEnemyAddState },
  { metaKey: 'EnemyGoldRate', getTargetArray: () => valueStateEnemyGoldRate },
  { metaKey: 'EnemyExpRate', getTargetArray: () => valueStateEnemyExpRate },
  { metaKey: 'SubjugationPointItem', getTargetArray: () => valueStateGetItems },
  { metaKey: 'HexpReflectionSkill', getTargetArray: () => valueHStatesUp3 },
  { metaKey: 'TachieChange', getTargetArray: () => valueTachieChangeState },
  { metaKey: 'FaceChange', getTargetArray: () => valueFaceChangeState },
  { metaKey: 'UniqueDrop', getTargetArray: () => valueEnemyDropAdd1 },
  { metaKey: 'classStateDrop', getTargetArray: () => valueClassStateA },
  { metaKey: 'AddPowerCustom', getTargetArray: () => valueAddPowerCustomState },
  { metaKey: 'TachieChangeStateTemporary', getTargetArray: () => valueTachieChangeStateTemporary },
  { metaKey: 'stateAddState', getTargetArray: () => valueStateAddState },
  { metaKey: 'SubjugationPoint', getTargetArray: () => valueSubjugationPoint },
  { metaKey: 'CertainlyTriple', getTargetArray: () => valueCertainlyTriple },
  { metaKey: 'CertainlyDouble', getTargetArray: () => valueCertainlyDouble },
  { metaKey: 'NormalAttackHit', getTargetArray: () => valueNormalAttackHit },
  { metaKey: 'AttackAbilityHit', getTargetArray: () => valueAttackAbilityHit },
  { metaKey: 'BattleAddAttackSet', getTargetArray: () => valueBattleAddAttackSet },
  { metaKey: 'DispelGuard', getTargetArray: () => valueDispelGuardState }
];

//Skills: meta tag -> array of skill ids carrying it.
const SKILL_META_COLLECTORS = [
  //A personal skill needs both the switch flag and the learn tag.
  {
    isMatch: (skillEntry) => skillEntry.meta['SwicthOnOffUse'] && skillEntry.meta['MCharacterLearn'],
    getTargetArray: () => valuePersonalSkill
  },
  { metaKey: 'SkillChangeName', getTargetArray: () => valueChangeSkill },
  { metaKey: 'ValSkillChangeName', getTargetArray: () => valueVariablesChangeSkill },
  //Three different tags feed the hero's passive-learning list, in this order.
  { metaKey: 'MCharacterSkillLearnSwith', getTargetArray: () => valueHeroGetSkill },
  { metaKey: 'MCharacterSkillLearnSkill', getTargetArray: () => valueHeroGetSkill },
  { metaKey: 'MCharacterSkillLearnSRank', getTargetArray: () => valueHeroGetSkill },
  { metaKey: 'StyleSizeChange', getTargetArray: () => valuePhysiquUp },
  { metaKey: 'PassiveCondi', getTargetArray: () => valuePassiveAdd },
  { metaKey: 'PassivePlusEffect', getTargetArray: () => valuePassivePlussSkill },
  { metaKey: 'PassivePlusTrait', getTargetArray: () => valuePassivePlussSkill2 },
  { metaKey: 'HstaSuppression', getTargetArray: () => valueHstaSuppression },
  { metaKey: 'HexpReflectionSkill', getTargetArray: () => valueHStatesUp1 },
  { metaKey: 'HSkillLearn', getTargetArray: () => valueGetHskillLearn },
  { metaKey: 'PassiveElementP', getTargetArray: () => valuePassiveElementP },
  { metaKey: 'AddPowerCustom', getTargetArray: () => valueAddPowerCustomSkill },
  { metaKey: 'Equip State', mode: COLLECT_MODE_LIST, getTargetArray: () => valueEquipPassiveSkill },
  { metaKey: 'Passive State', mode: COLLECT_MODE_LIST, getTargetArray: () => valueEquipPassiveSkill }
];

//Items.
const ITEM_META_COLLECTORS = [
  { metaKey: 'SkillCostToday', getTargetArray: () => valueOneDayLimitItem },
  { metaKey: 'HexpReflectionSkill', getTargetArray: () => valueHStatesUp2 },
  { metaKey: 'BattleMapInformation', getTargetArray: () => valueJouhouBattleMap },
  { metaKey: 'DropRate', getTargetArray: () => valueItemDropRate1 },
  { metaKey: 'SouwaItem', getTargetArray: () => valueSouwasceneAddId },
  { metaKey: 'HsceneItem', getTargetArray: () => valueHsceneAddId },
  //Title items are recognised by their icon, not by a meta tag.
  { isMatch: (itemEntry) => itemEntry.iconIndex == TITLE_ITEM_ICON_INDEX, getTargetArray: () => valueTitleSetItemsNoSetEffect },
  { metaKey: 'MedalRate', getTargetArray: () => valueCasinoMedalItem },
  { metaKey: 'SwicthOnOffUse', getTargetArray: () => valuePersonalItem }
];

//Weapons.
const WEAPON_META_COLLECTORS = [
  { metaKey: 'TownInformation', getTargetArray: () => valueJouhouTown },
  { metaKey: 'AddPowerCustom', getTargetArray: () => valueAddPowerCustomWeapon },
  { metaKey: 'Equip State', mode: COLLECT_MODE_LIST, getTargetArray: () => valueEquipPassiveWeapon },
  { metaKey: 'Passive State', mode: COLLECT_MODE_LIST, getTargetArray: () => valueEquipPassiveWeapon }
];

//Armors.
const ARMOR_META_COLLECTORS = [
  { metaKey: 'AddPowerCustom', getTargetArray: () => valueAddPowerCustomArmor },
  { metaKey: 'Equip State', mode: COLLECT_MODE_LIST, getTargetArray: () => valueEquipPassiveArmor },
  { metaKey: 'Passive State', mode: COLLECT_MODE_LIST, getTargetArray: () => valueEquipPassiveArmor }
];

function collectStateMetadata() {
  collectDatabaseEntries($dataStates, STATE_META_COLLECTORS);
}

function collectSkillMetadata() {
  collectDatabaseEntries($dataSkills, SKILL_META_COLLECTORS);
}

function collectItemMetadata() {
  collectDatabaseEntries($dataItems, ITEM_META_COLLECTORS);
}

function collectWeaponMetadata() {
  collectDatabaseEntries($dataWeapons, WEAPON_META_COLLECTORS);
}

//The armor database is scanned only up to valueArmorsLength, as before.
function collectArmorMetadata() {
  collectDatabaseEntries($dataArmors, ARMOR_META_COLLECTORS, valueArmorsLength);
}

//Resets only the collector arrays. Kept as a global because other plugins and
//common events call amygame_originalSettei() between days.
amygame_originalSettei = function () {
  resetDatabaseCollectors();
};

//---------------------------------------------------------------------------
// Day start / plugin refresh entry point
//---------------------------------------------------------------------------

amygame_originalVal = function(){

  $gameScreen._tone_temp = 0;
  amygame_originalSettei();
  //錬金アイテムの素材となるアイテムへの説明追加分.独自変数読込後じゃないと×。
  //一日始まりコモンとスキル習得タイミングで実行。
  item_addSynthesisHelp();

  collectEventRespawnBanMapIds();
  weather_set();

  //Database scans. The order is kept because several arrays receive ids from
  //different databases (states -> skills -> items -> weapons -> armors).
  collectStateMetadata();
  collectSkillMetadata();
  collectItemMetadata();
  collectWeaponMetadata();
  collectArmorMetadata();

};

//Collects the map ids whose events must stay dead (<EventRespawnBan>) into
//game variable 202, which the map transfer code reads.
function collectEventRespawnBanMapIds() {
  $gameVariables.setValue(EVENT_RESPAWN_BAN_VAR_ID, []);
  //Cached once: the variable is filled in place below.
  const respawnBanMapIds = $gameVariables.value(EVENT_RESPAWN_BAN_VAR_ID);
  const mapData = $dataMap;

  for (let mapId = 1; mapId < mapData.length; mapId++) {
    const mapEntry = mapData[mapId];
    if (!mapEntry || !mapEntry.meta['EventRespawnBan']) continue;
    respawnBanMapIds.push(mapId);
  };
}

//amygame_elementIcon(id3);
// Element / skill-type id -> [specialFlag, slot1, slot2, slot3].
//
// specialFlag is 1 when slot1 (and usually slot2) hold a literal text label instead
// of an icon index: callers test `arr[0] >= 1` and then print `arr[1]` unescaped.
// The three slot columns are the "name / amplify / rate" icon positions that the
// description and stats-screen text builders read back.
//
// Ids with no entry here fall back to ELEMENT_ICON_DEFAULT (plain icon, no label).
const ELEMENT_ICON_TABLE = {
  1: [0, 77, 77, 77],
  2: [0, 79, 79, 79],
  3: [0, 64, 448, 464],
  4: [0, 65, 449, 465],
  5: [0, 66, 450, 466],
  6: [0, 67, 451, 467],
  7: [0, 68, 452, 468],
  8: [0, 69, 453, 469],
  9: [0, 70, 454, 470],
  10: [0, 31, 31, 31],
  11: [0, 636, 652, 636],
  12: [0, 637, 637, 653],
  13: [0, 657, 657, 657], //ドロップアップ
  14: [0, 657, 657, 657], //ドロップアップ
  15: [0, 92, 92, 92],
  16: [0, 172, 172, 172],
  17: [0, 173, 173, 173],
  18: [0, 174, 174, 174],
  19: [0, 175, 175, 175],
  20: [0, 673, 673, 673], //アビリティ
  21: [0, 480, 480, 480],
  22: [0, 481, 481, 481],
  23: [0, 482, 482, 482],
  24: [0, 483, 483, 483],
  25: [0, 484, 484, 484],
  26: [0, 485, 485, 485],
  27: [0, 486, 486, 486],
  28: [0, 487, 487, 487],
  29: [0, 488, 488, 488],
  30: [0, 489, 489, 489],
  31: [0, 110, 110, 110],
  32: [0, 105, 105, 105],
  33: [0, 294, 294, 294],
  34: [0, 213, 213, 213],
  35: [1, '[霊体属性無効化]', 16, 16], //霊体に物理で通常ダメ
  36: [0, 100, 100, 100],
  39: [0, 505, 505, 505],
  40: [0, 504, 504, 504],
  41: [1, '[状態異常数に応じて与D上昇]', '[状態異常数に応じて与D上昇]', '[状態異常数+1]'], //状態異常数
  42: [0, 622, 622, 622],
  43: [0, 621, 621, 621],
  44: [0, 620, 620, 620],
  45: [0, 619, 619, 619],
  46: [0, 608, 608, 608],
  47: [0, 609, 609, 609],
  48: [0, 617, 617, 617],
  49: [0, 618, 618, 618],
  50: [0, 611, 611, 611],
  51: [0, 612, 612, 612],
  52: [0, 613, 613, 613],
  53: [0, 614, 614, 614],
  54: [0, 615, 615, 615],
  55: [0, 616, 616, 616],
  56: [0, 542, 542, 542],
  57: [0, 623, 623, 623],
  59: [0, 94, 94, 94],
  60: [0, 95, 95, 95],
  61: [0, 560, 560, 560],
  62: [0, 561, 561, 561],
  63: [0, 562, 562, 562],
  64: [0, 563, 563, 563],
  65: [0, 564, 564, 564],
  66: [0, 565, 565, 565],
  67: [0, 566, 566, 566],
  68: [0, 567, 567, 567],
  69: [0, 568, 568, 568],
  70: [0, 569, 569, 569],
  //予備枠
  74: [0, 570, 570, 570],
  75: [0, 571, 571, 571],
  76: [0, 572, 572, 572],
  77: [0, 573, 573, 573],
  78: [0, 574, 574, 574],
  79: [0, 575, 575, 575],
  80: [0, 508, 508, 508],
  82: [1, '[トレジャーハント与D上昇]', '[トレジャーハント与D上昇威力]', 508],
  83: [1, '[魅了特攻]', 16, 16]
};
const ELEMENT_ICON_DEFAULT = [0, 16, 16, 16];

// Resolves an element / skill-type id to its icon descriptor and returns
// [specialFlag, slot1, slot2, slot3].
//
// The returned array is freshly built on every call, so a caller may hold on to
// it. valueElementIconArr is still assigned for the event Script blocks and any
// other call site that reads the global right after calling this.
amygame_elementIcon = function(valueElementIcon){

  //Unknown / non numeric ids fall back to the plain icon descriptor.
  const elementIconId = Number(valueElementIcon);
  const elementIcon = (ELEMENT_ICON_TABLE[elementIconId] || ELEMENT_ICON_DEFAULT).slice();
  //Mirrored for the event Script blocks that read the global right after the call.
  valueElementIconArr = elementIcon;
  return elementIcon;

};
	
})();
