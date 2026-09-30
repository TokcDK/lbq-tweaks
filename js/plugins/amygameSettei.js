/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

(function() {

                   //hp,mp.at,de,ma,dx,ag,lu
valueActor1Statas = [70, 12, 9, 7, 8, 7, 8, 6];
valueActor2Statas = [60, 7, 9, 7, 7, 10, 10, 8];
valueActor3Statas = [80, 4, 8, 7, 2, 3, 2, 6];
valueActor4Statas = [50, 4, 5, 4, 3, 10, 8, 4];
valueActor5Statas = [30, 4, 3, 2, 5, 2, 4, 1];

                   //hp,mp.at,de,ma,dx,ag,lu
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

valueDestroyerStatas = [40, 1, 25, 2, 2, 2, 2, 2];

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
valueQuestRankD = [0,250,25];
valueQuestRankC = [692,1000,50];
valueQuestRankB = [693,3000,100];
valueQuestRankA = [694,10000,300];
valueQuestRankS = [695,100000,500];
valueArmorsLength = 500-1;//防具のデータベース上最大数
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
valueHoneyTrapSkillId = 875;
valueFightingSpiritSkillId = 778;
valueLeadershipSkillId = 779;
valueDollStateId = 598;
valueItemBoxOpen = 0;//アイテム袋開封時に使用
valueSerialPictureId = 0;//スクリプトを跨いだピクチャＩＤに使用
clothNextChoice = 1303;//次へ→1199
clothPreviousChoice = 1304;//前へ→1200
clothPartsChoice = 1305;//衣装パーツ指定<OFF>1201
clothBigSmallCgoice = 1306;//拡大⇔縮小1202
clothSlideUp = 1307;//↑にスライド1203
clothSlideDown = 1308;//↓にスライド1204
clothPresetSave = 1309;//↑にスライド1203
clothPresetLoad = 1310;//↓にスライド1204
zenravalueId = 1311;//全裸アイテムID
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
valueLiningCloth = Array(11).fill(0);
valueBackHairCloth = Array(11).fill(0);
valueBustUpCloth = Array(11).fill(0);
valueBustUpCloth2 = Array(11).fill(0);
valueCoatCloth = Array(11).fill(0);
valueFrontHairCloth = Array(11).fill(0);
valueFaceSelect = 1;
valueAttackCount = 0;//召喚効果などで攻撃と味方にステ付与を同時にする時、付与を重複させないため
valueSexWait= 0;//射精や挿入演出のウェイトによる効果切り替え用
valueFaceSelect = 1;
valueBossCharaGura = [1,0,0,0,0];
valueMenuCloth = 0;
valueDropCount1 = 0;
valueDropEnemyLevel = 1;
valueDropEnemyPicId = 101;
valueRegionMapArray = Array(101).fill(0);
valueLastChoiceMapSelectSkill = 0;
valueSummonSkillLearn = 450;
valueSeisyoujuuStartId = 260;
valueChainAddPower = 0;
valueChainTotalStat = 0;
valueChainMemberCount = 0;
valueChainElement = 0;
valueChainSkillId = 0;
valuePicArr1= Array(15).fill(0);
valuePicWait= 0;
valuePicWait2= 0;//original_scene系列用
valueShakeArr1 = [];
valueShakeArr2 = [];
valueSkillColorArr= Array(16).fill(0);
valueSkillColorArr[1] = 16;
valueSkillColorArr[2] = 16;
valueSkillColorArr[3] = 16;
valueSkillColorArr[4] = 16;
valueSkillColorArr[5] = 14;
valueSkillColorArr[6] = 10;
valueSkillColorArr[7] = 23;
valueSkillColorArr[8] = 11;
valueSkillColorArr[9] = 2;
valueSkillColorArr[10] = 20;
valueSkillColorArr[11] = 14;
valueSkillColorArr[12] = 18;
valueSkillColorArr[13] = 18;
valueSkillColorArr[14] = 30;
valueSkillColorArr[15] = 27;
valueStateAnimeArr= Array(501).fill(0);
valueStateAnimeArr[4] = 701;
valueStateAnimeArr[5] = 702;
valueStateAnimeArr[6] = 703;
valueStateAnimeArr[7] = 704;
valueStateAnimeArr[8] = 705;
valueStateAnimeArr[9] = 706;
valueStateAnimeArr[10] = 707;
valueStateAnimeArr[11] = 708;
//valueStateAnimeArr[1] = 1;
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
valueAttackAmplifysActorId = Array(21).fill(0);//データベースで指定されるアクターの属性威力配列
for(var j = 0; j <= 20; j++){
  valueAttackAmplifysActorId[j] = [];
  for(var j2 = 0; j2 <= 100; j2++){
    valueAttackAmplifysActorId[j].push(0);
  };
};
valuePassiveElementP = [];//パッシブで属性威力upアクターのみ
valueAddPowerCustomSkill = [];//スキル威力加算
valueAddPowerCustomWeapon = [];
valueAddPowerCustomArmor = [];
valueAddPowerCustomState = [];
valueCasinoMedalItem = [];
valueCollapseAnime = 0;
valueTachieChangeState = [];
valueStateAddState = [];//<stateAddState:5,201,2>
valueSubjugationPoint = [];//<SubjugationPoint>
valueCertainlyTriple = [];//<CertainlyTriple>
valueCertainlyDouble = [];//<CertainlyDouble>
valueNormalAttackHit = [];//<NormalAttackHit:1>
valueAttackAbilityHit = [];//<AttackAbilityHit:1>
valueBattleAddAttackSet = [];//<BattleAddAttackSet:10>
valueDispelGuardState = [];//<DispelGuard>

amygame_originalSettei = function(){

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
valueAttackAmplifysActorId = Array(21).fill(0);//データベースで指定されるアクターの属性威力配列
for(var j = 0; j <= 20; j++){
  valueAttackAmplifysActorId[j] = [];
  for(var j2 = 0; j2 <= 100; j2++){
    valueAttackAmplifysActorId[j].push(0);
  };
};
valuePassiveElementP = [];//パッシブで属性威力upｓクターのみPassiveElementP
valueAddPowerCustomSkill = [];//スキル威力加算
valueAddPowerCustomWeapon = [];
valueAddPowerCustomArmor = [];
valueAddPowerCustomState = [];
valueCasinoMedalItem = [];
valueCollapseAnime = 0;
valueTachieChangeStateTemporary = [];//部位毎で立ち絵を変化。汗など
valueStateAddState = [];//<stateAddState:5,201,2>
valueSubjugationPoint = [];//<SubjugationPoint>
valueCertainlyTriple = [];//<CertainlyTriple>
valueCertainlyDouble = [];//<CertainlyDouble>
valueNormalAttackHit = [];//<NormalAttackHit:1>
valueAttackAbilityHit = [];//<AttackAbilityHit:1>
valueBattleAddAttackSet = [];//<BattleAddAttackSet:10>
valueDispelGuardState = [];//<DispelGuard>

};

//amygame_elementIcon(id3);
amygame_elementIcon = function(valueElementIcon){

  var elementSpecialFlag = 0;var elementIconSlot1 = 16;var elementIconSlot2 = 16;var elementIconSlot3 = 16;
  if(valueElementIcon == 1 ){var elementIconSlot1 = 77; var elementIconSlot2 = 77; var elementIconSlot3 = 77};
  if(valueElementIcon == 2 ){var elementIconSlot1 = 79; var elementIconSlot2 = 79; var elementIconSlot3 = 79};
  if(valueElementIcon == 3 ){var elementIconSlot1 = 64; var elementIconSlot2 = 448;var elementIconSlot3 = 464};
  if(valueElementIcon == 4 ){var elementIconSlot1 = 65; var elementIconSlot2 = 449;var elementIconSlot3 = 465};
  if(valueElementIcon == 5 ){var elementIconSlot1 = 66; var elementIconSlot2 = 450;var elementIconSlot3 = 466};
  if(valueElementIcon == 6 ){var elementIconSlot1 = 67; var elementIconSlot2 = 451;var elementIconSlot3 = 467};
  if(valueElementIcon == 7 ){var elementIconSlot1 = 68; var elementIconSlot2 = 452;var elementIconSlot3 = 468};
  if(valueElementIcon == 8 ){var elementIconSlot1 = 69; var elementIconSlot2 = 453;var elementIconSlot3 = 469};
  if(valueElementIcon == 9 ){var elementIconSlot1 = 70; var elementIconSlot2 = 454;var elementIconSlot3 = 470};
  if(valueElementIcon == 10){var elementIconSlot1 =  31;var elementIconSlot2 =  31;var elementIconSlot3 = 31};
  if(valueElementIcon == 11){var elementIconSlot1 = 636;var elementIconSlot2 = 652;var elementIconSlot3 = 636};
  if(valueElementIcon == 12){var elementIconSlot1 = 637;var elementIconSlot2 = 637;var elementIconSlot3 = 653};
  if(valueElementIcon == 13){var elementIconSlot1 = 657;var elementIconSlot2 = 657;var elementIconSlot3 = 657};//ドロップアップ
  if(valueElementIcon == 14){var elementIconSlot1 = 657;var elementIconSlot2 = 657;var elementIconSlot3 = 657};//ドロップアップ
  if(valueElementIcon == 15){var elementIconSlot1 =  92;var elementIconSlot2 =  92;var elementIconSlot3 = 92};
  if(valueElementIcon == 16){var elementIconSlot1 = 172;var elementIconSlot2 = 172;var elementIconSlot3 = 172};
  if(valueElementIcon == 17){var elementIconSlot1 = 173;var elementIconSlot2 = 173;var elementIconSlot3 = 173};
  if(valueElementIcon == 18){var elementIconSlot1 = 174;var elementIconSlot2 = 174;var elementIconSlot3 = 174};
  if(valueElementIcon == 19){var elementIconSlot1 = 175;var elementIconSlot2 = 175;var elementIconSlot3 = 175};
  if(valueElementIcon == 20){var elementIconSlot1 = 673;var elementIconSlot2 = 673;var elementIconSlot3 = 673};//アビリティ
  if(valueElementIcon == 21){var elementIconSlot1 = 480;var elementIconSlot2 = 480;var elementIconSlot3 = 480};
  if(valueElementIcon == 22){var elementIconSlot1 = 481;var elementIconSlot2 = 481;var elementIconSlot3 = 481};
  if(valueElementIcon == 23){var elementIconSlot1 = 482;var elementIconSlot2 = 482;var elementIconSlot3 = 482};
  if(valueElementIcon == 24){var elementIconSlot1 = 483;var elementIconSlot2 = 483;var elementIconSlot3 = 483};
  if(valueElementIcon == 25){var elementIconSlot1 = 484;var elementIconSlot2 = 484;var elementIconSlot3 = 484};
  if(valueElementIcon == 26){var elementIconSlot1 = 485;var elementIconSlot2 = 485;var elementIconSlot3 = 485};
  if(valueElementIcon == 27){var elementIconSlot1 = 486;var elementIconSlot2 = 486;var elementIconSlot3 = 486};
  if(valueElementIcon == 28){var elementIconSlot1 = 487;var elementIconSlot2 = 487;var elementIconSlot3 = 487};
  if(valueElementIcon == 29){var elementIconSlot1 = 488;var elementIconSlot2 = 488;var elementIconSlot3 = 488};
  if(valueElementIcon == 30){var elementIconSlot1 = 489;var elementIconSlot2 = 489;var elementIconSlot3 = 489};
  if(valueElementIcon == 31){var elementIconSlot1 = 110;var elementIconSlot2 = 110;var elementIconSlot3 = 110};
  if(valueElementIcon == 32){var elementIconSlot1 = 105;var elementIconSlot2 = 105;var elementIconSlot3 = 105};
  if(valueElementIcon == 33){var elementIconSlot1 = 294;var elementIconSlot2 = 294;var elementIconSlot3 = 294};
  if(valueElementIcon == 34){var elementIconSlot1 = 213;var elementIconSlot2 = 213;var elementIconSlot3 = 213};
  if(valueElementIcon == 35){var elementSpecialFlag = 1;var elementIconSlot1 = `[霊体属性無効化]`;var elementIconSlot2 =  16;var elementIconSlot3 =  16};//霊体に物理で通常ダメ
  if(valueElementIcon == 36){var elementIconSlot1 = 100;var elementIconSlot2 = 100;var elementIconSlot3 = 100};
  if(valueElementIcon == 39){var elementIconSlot1 = 505;var elementIconSlot2 = 505;var elementIconSlot3 = 505};
  if(valueElementIcon == 40){var elementIconSlot1 = 504;var elementIconSlot2 = 504;var elementIconSlot3 = 504};
  if(valueElementIcon == 41){var elementSpecialFlag = 1;var elementIconSlot1 = `[状態異常数に応じて与D上昇]`;var elementIconSlot2 =  `[状態異常数に応じて与D上昇]`;var elementIconSlot3 =  `[状態異常数+1]`};//状態異常数
  if(valueElementIcon == 42){var elementIconSlot1 = 622;var elementIconSlot2 = 622;var elementIconSlot3 = 622};
  if(valueElementIcon == 43){var elementIconSlot1 = 621;var elementIconSlot2 = 621;var elementIconSlot3 = 621};
  if(valueElementIcon == 44){var elementIconSlot1 = 620;var elementIconSlot2 = 620;var elementIconSlot3 = 620};
  if(valueElementIcon == 45){var elementIconSlot1 = 619;var elementIconSlot2 = 619;var elementIconSlot3 = 619};
  if(valueElementIcon == 46){var elementIconSlot1 = 608;var elementIconSlot2 = 608;var elementIconSlot3 = 608};
  if(valueElementIcon == 47){var elementIconSlot1 = 609;var elementIconSlot2 = 609;var elementIconSlot3 = 609};
  if(valueElementIcon == 48){var elementIconSlot1 = 617;var elementIconSlot2 = 617;var elementIconSlot3 = 617};
  if(valueElementIcon == 49){var elementIconSlot1 = 618;var elementIconSlot2 = 618;var elementIconSlot3 = 618};
  if(valueElementIcon == 50){var elementIconSlot1 = 611;var elementIconSlot2 = 611;var elementIconSlot3 = 611};
  if(valueElementIcon == 51){var elementIconSlot1 = 612;var elementIconSlot2 = 612;var elementIconSlot3 = 612};
  if(valueElementIcon == 52){var elementIconSlot1 = 613;var elementIconSlot2 = 613;var elementIconSlot3 = 613};
  if(valueElementIcon == 53){var elementIconSlot1 = 614;var elementIconSlot2 = 614;var elementIconSlot3 = 614};
  if(valueElementIcon == 54){var elementIconSlot1 = 615;var elementIconSlot2 = 615;var elementIconSlot3 = 615};
  if(valueElementIcon == 55){var elementIconSlot1 = 616;var elementIconSlot2 = 616;var elementIconSlot3 = 616};
  if(valueElementIcon == 56){var elementIconSlot1 = 542;var elementIconSlot2 = 542;var elementIconSlot3 = 542};
  if(valueElementIcon == 57){var elementIconSlot1 = 623;var elementIconSlot2 = 623;var elementIconSlot3 = 623};
  if(valueElementIcon == 59){var elementIconSlot1 =  94;var elementIconSlot2 =  94;var elementIconSlot3 =  94};
  if(valueElementIcon == 60){var elementIconSlot1 =  95;var elementIconSlot2 =  95;var elementIconSlot3 =  95};
  if(valueElementIcon == 61){var elementIconSlot1 = 560;var elementIconSlot2 = 560;var elementIconSlot3 = 560};
  if(valueElementIcon == 62){var elementIconSlot1 = 561;var elementIconSlot2 = 561;var elementIconSlot3 = 561};
  if(valueElementIcon == 63){var elementIconSlot1 = 562;var elementIconSlot2 = 562;var elementIconSlot3 = 562};
  if(valueElementIcon == 64){var elementIconSlot1 = 563;var elementIconSlot2 = 563;var elementIconSlot3 = 563};
  if(valueElementIcon == 65){var elementIconSlot1 = 564;var elementIconSlot2 = 564;var elementIconSlot3 = 564};
  if(valueElementIcon == 66){var elementIconSlot1 = 565;var elementIconSlot2 = 565;var elementIconSlot3 = 565};
  if(valueElementIcon == 67){var elementIconSlot1 = 566;var elementIconSlot2 = 566;var elementIconSlot3 = 566};
  if(valueElementIcon == 68){var elementIconSlot1 = 567;var elementIconSlot2 = 567;var elementIconSlot3 = 567};
  if(valueElementIcon == 69){var elementIconSlot1 = 568;var elementIconSlot2 = 568;var elementIconSlot3 = 568};
  if(valueElementIcon == 70){var elementIconSlot1 = 569;var elementIconSlot2 = 569;var elementIconSlot3 = 569};
  //予備枠
  if(valueElementIcon == 74){var elementIconSlot1 = 570;var elementIconSlot2 = 570;var elementIconSlot3 = 570};
  if(valueElementIcon == 75){var elementIconSlot1 = 571;var elementIconSlot2 = 571;var elementIconSlot3 = 571};
  if(valueElementIcon == 76){var elementIconSlot1 = 572;var elementIconSlot2 = 572;var elementIconSlot3 = 572};
  if(valueElementIcon == 77){var elementIconSlot1 = 573;var elementIconSlot2 = 573;var elementIconSlot3 = 573};
  if(valueElementIcon == 78){var elementIconSlot1 = 574;var elementIconSlot2 = 574;var elementIconSlot3 = 574};
  if(valueElementIcon == 79){var elementIconSlot1 = 575;var elementIconSlot2 = 575;var elementIconSlot3 = 575};
  if(valueElementIcon == 80){var elementIconSlot1 = 508;var elementIconSlot2 = 508;var elementIconSlot3 = 508};
  if(valueElementIcon == 82){var elementSpecialFlag = 1;var elementIconSlot1 = `[トレジャーハント与D上昇]`;var elementIconSlot2 = `[トレジャーハント与D上昇威力]`;var elementIconSlot3 = 508};
  if(valueElementIcon == 83){var elementSpecialFlag = 1;var elementIconSlot1 = `[魅了特攻]`;var elementIconSlot2 = 16;var elementIconSlot3 = 16};
  valueElementIconArr = [elementSpecialFlag,elementIconSlot1,elementIconSlot2,elementIconSlot3];//valueElementIconArr[0]

};

})();

pushArray = function(metaValue, targetArray){
  if (metaValue) targetArray.push(...metaValue.split(','));
}
pushValid = function(condition, targetArray, i){
  if (condition) targetArray.push(i);
}
	
amygame_originalVal = function(){

$gameScreen._tone_temp = 0;
amygame_originalSettei();
//錬金アイテムの素材となるアイテムへの説明追加分.独自変数読込後じゃないと×。
//一日始まりコモンとスキル習得タイミングで実行。
item_addSynthesisHelp();
const gameVariables = $gameVariables;
gameVariables.setValue(202,[]);
const dataMap = $dataMap;
const dataMapLength = dataMap.length; 
for (let i = 1; i < dataMapLength; i++) {
  if(dataMap[i] && dataMap[i].meta['EventRespawnBan']){
    gameVariables.value(202).push(i);
}};
weather_set();
const dataStates = $dataStates;
const dataStatesCount = dataStates.length;
for (let i = 1; i < dataStatesCount; i++) {
  if (!dataStates[i]) continue;
  const meta = dataStates[i].meta;
  pushValid(meta['HstateDisplaySet'], valueHstateDisplay, i);
  pushValid(meta['BattleEndCoutaClearState'], valueStateBattleClear, i);
  pushValid(meta['PartyGoldRate'], valueStatePartyGoldRate, i);
  pushValid(meta['PartyExpRate'], valueStatePartyExpRate, i);
  pushValid(meta['NameCondiAddState'], valueEnemyAddState, i);//グラネームと同一のpush先
  pushValid(meta['GraphicNameCondiAddState'], valueEnemyAddState, i);
  pushValid(meta['EnemyGoldRate'], valueStateEnemyGoldRate, i);
  pushValid(meta['EnemyExpRate'], valueStateEnemyExpRate, i);
  pushValid(meta['SubjugationPointItem'], valueStateGetItems, i);
  pushValid(meta['HexpReflectionSkill'], valueHStatesUp3, i);
  pushValid(meta['TachieChange'], valueTachieChangeState, i);
  pushValid(meta['FaceChange'], valueFaceChangeState, i);
  pushValid(meta['UniqueDrop'], valueEnemyDropAdd1, i);
  pushValid(meta['classStateDrop'], valueClassStateA, i);
  pushValid(meta['AddPowerCustom'], valueAddPowerCustomState, i);
  pushValid(meta['TachieChangeStateTemporary'], valueTachieChangeStateTemporary, i);
  pushValid(meta['stateAddState'], valueStateAddState, i);
  pushValid(meta['SubjugationPoint'], valueSubjugationPoint, i);
  pushValid(meta['CertainlyTriple'], valueCertainlyTriple, i);
  pushValid(meta['CertainlyDouble'], valueCertainlyDouble, i);
  pushValid(meta['NormalAttackHit'], valueNormalAttackHit, i);
  pushValid(meta['AttackAbilityHit'], valueAttackAbilityHit, i);
  pushValid(meta['BattleAddAttackSet'], valueBattleAddAttackSet, i);//未使用
  pushValid(meta['DispelGuard'], valueDispelGuardState, i);

};
const dataSkills = $dataSkills;
const dataSkillsCount = dataSkills.length;
for (let i = 1; i < dataSkillsCount; i++) {
  if (!dataSkills[i]) continue;
  const meta = dataSkills[i].meta;
  pushValid(meta['SwicthOnOffUse'] && meta['MCharacterLearn'], valuePersonalSkill, i);
  pushValid(meta['SkillChangeName'], valueChangeSkill, i);
  pushValid(meta['ValSkillChangeName'], valueVariablesChangeSkill, i);
  pushValid(meta['MCharacterSkillLearnSwith'], valueHeroGetSkill, i);
  pushValid(meta['StyleSizeChange'], valuePhysiquUp, i);
  pushValid(meta['PassiveCondi'], valuePassiveAdd, i);
  pushValid(meta['PassivePlusEffect'], valuePassivePlussSkill, i);
  pushValid(meta['PassivePlusTrait'], valuePassivePlussSkill2, i);
  pushValid(meta['HstaSuppression'], valueHstaSuppression, i);
  pushValid(meta['HexpReflectionSkill'], valueHStatesUp1, i);
  pushValid(meta['MCharacterSkillLearnSkill'], valueHeroGetSkill, i);
  pushValid(meta['MCharacterSkillLearnSRank'], valueHeroGetSkill, i);
  pushValid(meta['HSkillLearn'], valueGetHskillLearn, i);
  pushValid(meta['PassiveElementP'], valuePassiveElementP, i);
  pushValid(meta['AddPowerCustom'], valueAddPowerCustomSkill, i);
  pushArray(meta['Equip State'], valueEquipPassiveSkill);
  pushArray(meta['Passive State'], valueEquipPassiveSkill);
};
const dataItems = $dataItems;
const dataItemsCount = dataItems.length;
for (let i = 1; i < dataItemsCount; i++) {
  if (!dataItems[i]) continue;
  const meta = dataItems[i].meta;
  pushValid(meta['SkillCostToday'], valueOneDayLimitItem, i);
  pushValid(meta['HexpReflectionSkill'], valueHStatesUp2, i);
  pushValid(meta['BattleMapInformation'], valueJouhouBattleMap, i);
  pushValid(meta['DropRate'], valueItemDropRate1, i);
  pushValid(meta['SouwaItem'], valueSouwasceneAddId, i);
  pushValid(meta['HsceneItem'], valueHsceneAddId, i);
  pushValid(dataItems[i].iconIndex == 234, valueTitleSetItemsNoSetEffect, i);
  pushValid(meta['MedalRate'], valueCasinoMedalItem, i);
  pushValid(meta['SwicthOnOffUse'], valuePersonalItem, i);
};
const dataWeapons = $dataWeapons;
const dataWeaponsCount = dataWeapons.length;
for (let i = 1; i < dataWeaponsCount; i++) {
  if (!dataWeapons[i]) continue;
  const meta = dataWeapons[i].meta;
  pushValid(meta['TownInformation'], valueJouhouTown, i);
  pushValid(meta['AddPowerCustom'], valueAddPowerCustomWeapon, i);
  pushArray(meta['Equip State'], valueEquipPassiveWeapon);
  pushArray(meta['Passive State'], valueEquipPassiveWeapon);
};
const dataArmors = $dataArmors;
for (let i = 1; i <= valueArmorsLength; i++) {
  if (!dataArmors[i]) continue;
  const meta = dataArmors[i].meta;
  pushValid(meta['AddPowerCustom'], valueAddPowerCustomArmor, i);
  pushArray(meta['Equip State'], valueEquipPassiveArmor);
  pushArray(meta['Passive State'], valueEquipPassiveArmor);
};

};
