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
valuePicWait2= 0;
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

  var value15 = 0;var value12 = 16;var value13 = 16;var value14 = 16;
  if(valueElementIcon == 1 ){var value12 = 77; var value13 = 77; var value14 = 77};
  if(valueElementIcon == 2 ){var value12 = 79; var value13 = 79; var value14 = 79};
  if(valueElementIcon == 3 ){var value12 = 64; var value13 = 448;var value14 = 464};
  if(valueElementIcon == 4 ){var value12 = 65; var value13 = 449;var value14 = 465};
  if(valueElementIcon == 5 ){var value12 = 66; var value13 = 450;var value14 = 466};
  if(valueElementIcon == 6 ){var value12 = 67; var value13 = 451;var value14 = 467};
  if(valueElementIcon == 7 ){var value12 = 68; var value13 = 452;var value14 = 468};
  if(valueElementIcon == 8 ){var value12 = 69; var value13 = 453;var value14 = 469};
  if(valueElementIcon == 9 ){var value12 = 70; var value13 = 454;var value14 = 470};
  if(valueElementIcon == 10){var value12 =  31;var value13 =  31;var value14 = 31};
  if(valueElementIcon == 11){var value12 = 636;var value13 = 652;var value14 = 636};
  if(valueElementIcon == 12){var value12 = 637;var value13 = 637;var value14 = 653};
  if(valueElementIcon == 13){var value12 = 657;var value13 = 657;var value14 = 657};//ドロップアップ
  if(valueElementIcon == 14){var value12 = 657;var value13 = 657;var value14 = 657};//ドロップアップ
  if(valueElementIcon == 15){var value12 =  92;var value13 =  92;var value14 = 92};
  if(valueElementIcon == 16){var value12 = 172;var value13 = 172;var value14 = 172};
  if(valueElementIcon == 17){var value12 = 173;var value13 = 173;var value14 = 173};
  if(valueElementIcon == 18){var value12 = 174;var value13 = 174;var value14 = 174};
  if(valueElementIcon == 19){var value12 = 175;var value13 = 175;var value14 = 175};
  if(valueElementIcon == 20){var value12 = 673;var value13 = 673;var value14 = 673};//アビリティ
  if(valueElementIcon == 21){var value12 = 480;var value13 = 480;var value14 = 480};
  if(valueElementIcon == 22){var value12 = 481;var value13 = 481;var value14 = 481};
  if(valueElementIcon == 23){var value12 = 482;var value13 = 482;var value14 = 482};
  if(valueElementIcon == 24){var value12 = 483;var value13 = 483;var value14 = 483};
  if(valueElementIcon == 25){var value12 = 484;var value13 = 484;var value14 = 484};
  if(valueElementIcon == 26){var value12 = 485;var value13 = 485;var value14 = 485};
  if(valueElementIcon == 27){var value12 = 486;var value13 = 486;var value14 = 486};
  if(valueElementIcon == 28){var value12 = 487;var value13 = 487;var value14 = 487};
  if(valueElementIcon == 29){var value12 = 488;var value13 = 488;var value14 = 488};
  if(valueElementIcon == 30){var value12 = 489;var value13 = 489;var value14 = 489};
  if(valueElementIcon == 31){var value12 = 110;var value13 = 110;var value14 = 110};
  if(valueElementIcon == 32){var value12 = 105;var value13 = 105;var value14 = 105};
  if(valueElementIcon == 33){var value12 = 294;var value13 = 294;var value14 = 294};
  if(valueElementIcon == 34){var value12 = 213;var value13 = 213;var value14 = 213};
  if(valueElementIcon == 35){var value15 = 1;var value12 = `[霊体属性無効化]`;var value13 =  16;var value14 =  16};//霊体に物理で通常ダメ
  if(valueElementIcon == 36){var value12 = 100;var value13 = 100;var value14 = 100};
  if(valueElementIcon == 39){var value12 = 505;var value13 = 505;var value14 = 505};
  if(valueElementIcon == 40){var value12 = 504;var value13 = 504;var value14 = 504};
  if(valueElementIcon == 41){var value15 = 1;var value12 = `[状態異常数に応じて与D上昇]`;var value13 =  `[状態異常数に応じて与D上昇]`;var value14 =  `[状態異常数+1]`};//状態異常数
  if(valueElementIcon == 42){var value12 = 622;var value13 = 622;var value14 = 622};
  if(valueElementIcon == 43){var value12 = 621;var value13 = 621;var value14 = 621};
  if(valueElementIcon == 44){var value12 = 620;var value13 = 620;var value14 = 620};
  if(valueElementIcon == 45){var value12 = 619;var value13 = 619;var value14 = 619};
  if(valueElementIcon == 46){var value12 = 608;var value13 = 608;var value14 = 608};
  if(valueElementIcon == 47){var value12 = 609;var value13 = 609;var value14 = 609};
  if(valueElementIcon == 48){var value12 = 617;var value13 = 617;var value14 = 617};
  if(valueElementIcon == 49){var value12 = 618;var value13 = 618;var value14 = 618};
  if(valueElementIcon == 50){var value12 = 611;var value13 = 611;var value14 = 611};
  if(valueElementIcon == 51){var value12 = 612;var value13 = 612;var value14 = 612};
  if(valueElementIcon == 52){var value12 = 613;var value13 = 613;var value14 = 613};
  if(valueElementIcon == 53){var value12 = 614;var value13 = 614;var value14 = 614};
  if(valueElementIcon == 54){var value12 = 615;var value13 = 615;var value14 = 615};
  if(valueElementIcon == 55){var value12 = 616;var value13 = 616;var value14 = 616};
  if(valueElementIcon == 56){var value12 = 542;var value13 = 542;var value14 = 542};
  if(valueElementIcon == 57){var value12 = 623;var value13 = 623;var value14 = 623};
  if(valueElementIcon == 59){var value12 =  94;var value13 =  94;var value14 =  94};
  if(valueElementIcon == 60){var value12 =  95;var value13 =  95;var value14 =  95};
  if(valueElementIcon == 61){var value12 = 560;var value13 = 560;var value14 = 560};
  if(valueElementIcon == 62){var value12 = 561;var value13 = 561;var value14 = 561};
  if(valueElementIcon == 63){var value12 = 562;var value13 = 562;var value14 = 562};
  if(valueElementIcon == 64){var value12 = 563;var value13 = 563;var value14 = 563};
  if(valueElementIcon == 65){var value12 = 564;var value13 = 564;var value14 = 564};
  if(valueElementIcon == 66){var value12 = 565;var value13 = 565;var value14 = 565};
  if(valueElementIcon == 67){var value12 = 566;var value13 = 566;var value14 = 566};
  if(valueElementIcon == 68){var value12 = 567;var value13 = 567;var value14 = 567};
  if(valueElementIcon == 69){var value12 = 568;var value13 = 568;var value14 = 568};
  if(valueElementIcon == 70){var value12 = 569;var value13 = 569;var value14 = 569};
  //予備枠
  if(valueElementIcon == 74){var value12 = 570;var value13 = 570;var value14 = 570};
  if(valueElementIcon == 75){var value12 = 571;var value13 = 571;var value14 = 571};
  if(valueElementIcon == 76){var value12 = 572;var value13 = 572;var value14 = 572};
  if(valueElementIcon == 77){var value12 = 573;var value13 = 573;var value14 = 573};
  if(valueElementIcon == 78){var value12 = 574;var value13 = 574;var value14 = 574};
  if(valueElementIcon == 79){var value12 = 575;var value13 = 575;var value14 = 575};
  if(valueElementIcon == 80){var value12 = 508;var value13 = 508;var value14 = 508};
  if(valueElementIcon == 82){var value15 = 1;var value12 = `[トレジャーハント与D上昇]`;var value13 = `[トレジャーハント与D上昇威力]`;var value14 = 508};
  if(valueElementIcon == 83){var value15 = 1;var value12 = `[魅了特攻]`;var value13 = 16;var value14 = 16};
  valueElementIconArr = [value15,value12,value13,value14];//valueElementIconArr[0]

};

})();

amygame_originalVal = function(){

$gameScreen._tone_temp = 0;
amygame_originalSettei();
//錬金アイテムの素材となるアイテムへの説明追加分.独自変数読込後じゃないと×。
//一日始まりコモンとスキル習得タイミングで実行。
item_addSynthesisHelp();
$gameVariables.setValue(202,[]);
for (var i = 1; i <= $dataMap.length-1; i++) {
  if($dataMap[i].meta['EventRespawnBan']){
    $gameVariables.value(202).push(i);
}};
weather_set();
for (var i = 1; i <= $dataStates.length-1; i++) {
  if($dataStates[i].meta['HstateDisplaySet']){valueHstateDisplay.push(i)};
  if($dataStates[i].meta['BattleEndCoutaClearState']){valueStateBattleClear.push(i)};
  if($dataStates[i].meta['PartyGoldRate']){valueStatePartyGoldRate.push(i)};
  if($dataStates[i].meta['PartyExpRate']){valueStatePartyExpRate.push(i)};
  if($dataStates[i].meta['NameCondiAddState']){valueEnemyAddState.push(i)};//グラネームと同一のpush先
  if($dataStates[i].meta['GraphicNameCondiAddState']){valueEnemyAddState.push(i)};
  if($dataStates[i].meta['EnemyGoldRate']){valueStateEnemyGoldRate.push(i)};
  if($dataStates[i].meta['EnemyExpRate']){valueStateEnemyExpRate.push(i)};
  if($dataStates[i].meta['SubjugationPointItem']){valueStateGetItems.push(i)};
  if($dataStates[i].meta['HexpReflectionSkill']){valueHStatesUp3.push(i)};
  if($dataStates[i].meta['TachieChange']){valueTachieChangeState.push(i)};
  if($dataStates[i].meta['FaceChange']){valueFaceChangeState.push(i)};
  if($dataStates[i].meta['UniqueDrop']){valueEnemyDropAdd1.push(i)};
  if($dataStates[i].meta['classStateDrop']){valueClassStateA.push(i)};
  if($dataStates[i].meta['AddPowerCustom']){valueAddPowerCustomState.push(i)};
  if($dataStates[i].meta['TachieChangeStateTemporary']){valueTachieChangeStateTemporary.push(i)};
  if($dataStates[i].meta['stateAddState']){valueStateAddState.push(i)};
  if($dataStates[i].meta['SubjugationPoint']){valueSubjugationPoint.push(i)};
  if($dataStates[i].meta['CertainlyTriple']){valueCertainlyTriple.push(i)};
  if($dataStates[i].meta['CertainlyDouble']){valueCertainlyDouble.push(i)};
  if($dataStates[i].meta['NormalAttackHit']){valueNormalAttackHit.push(i)};
  if($dataStates[i].meta['AttackAbilityHit']){valueAttackAbilityHit.push(i)};
  if($dataStates[i].meta['BattleAddAttackSet']){valueBattleAddAttackSet.push(i)};//未使用
  if($dataStates[i].meta['DispelGuard']){valueDispelGuardState.push(i)};

};
for (var i = 1; i <= $dataSkills.length-1; i++) {
  if($dataSkills[i].meta['SwicthOnOffUse'] && $dataSkills[i].meta['MCharacterLearn']){valuePersonalSkill.push(i)};
  if($dataSkills[i].meta['SkillChangeName']){valueChangeSkill.push(i)};
  if($dataSkills[i].meta['ValSkillChangeName']){valueVariablesChangeSkill.push(i)};
  if($dataSkills[i].meta['MCharacterSkillLearnSwith']){valueHeroGetSkill.push(i)};
  if($dataSkills[i].meta['StyleSizeChange']){valuePhysiquUp.push(i)};
  if($dataSkills[i].meta['PassiveCondi']){valuePassiveAdd.push(i)};
  if($dataSkills[i].meta['PassivePlusEffect']){valuePassivePlussSkill.push(i)};
  if($dataSkills[i].meta['PassivePlusTrait']){valuePassivePlussSkill2.push(i)};
  if($dataSkills[i].meta['HstaSuppression']){valueHstaSuppression.push(i)};
  if($dataSkills[i].meta['HexpReflectionSkill']){valueHStatesUp1.push(i)};
  if($dataSkills[i].meta['MCharacterSkillLearnSkill']){valueHeroGetSkill.push(i)};
  if($dataSkills[i].meta['MCharacterSkillLearnSRank']){valueHeroGetSkill.push(i)};
  if($dataSkills[i].meta['HSkillLearn']){valueGetHskillLearn.push(i)};
  if($dataSkills[i].meta['PassiveElementP']){valuePassiveElementP.push(i)};
  if($dataSkills[i].meta['AddPowerCustom']){valueAddPowerCustomSkill.push(i)};
  if($dataSkills[i].meta['Equip State']){
    var arr1 = $dataSkills[i].meta['Equip State'].split(',');
    for (var j = 0; j <= arr1.length-1; j++) {
      valueEquipPassiveSkill.push(arr1[j]);
    };
  };
  if($dataSkills[i].meta['Passive State']){
    var arr1 = $dataSkills[i].meta['Passive State'].split(',');
    for (var j = 0; j <= arr1.length-1; j++) {
      valueEquipPassiveSkill.push(arr1[j]);
    };
  };
};
for (var i = 1; i <= $dataItems.length-1; i++) {
  if($dataItems[i].meta['SkillCostToday']){valueOneDayLimitItem.push(i)};
  if($dataItems[i].meta['HexpReflectionSkill']){valueHStatesUp2.push(i)};
  if($dataItems[i].meta['BattleMapInformation']){valueJouhouBattleMap.push(i)};
  if($dataItems[i].meta['DropRate']){valueItemDropRate1.push(i)};
  if($dataItems[i].meta['SouwaItem']){valueSouwasceneAddId.push(i)};
  if($dataItems[i].meta['HsceneItem']){valueHsceneAddId.push(i)};
  if($dataItems[i].iconIndex == 234){valueTitleSetItemsNoSetEffect.push(i)};
  if($dataItems[i].meta['MedalRate']){valueCasinoMedalItem.push(i)};
  if($dataItems[i].meta['SwicthOnOffUse']){valuePersonalItem.push(i)};
};
for (var i = 1; i <= $dataWeapons.length-1; i++) {
  if($dataWeapons[i].meta['TownInformation']){valueJouhouTown.push(i)};
  if($dataWeapons[i].meta['AddPowerCustom']){valueAddPowerCustomWeapon.push(i)};
  if($dataWeapons[i].meta['Equip State']){
    var arr1 = $dataWeapons[i].meta['Equip State'].split(',');
    for (var j = 0; j <= arr1.length-1; j++) {
      valueEquipPassiveWeapon.push(arr1[j]);
    };
  };
  if($dataWeapons[i].meta['Passive State']){
    var arr1 = $dataWeapons[i].meta['Passive State'].split(',');
    for (var j = 0; j <= arr1.length-1; j++) {
      valueEquipPassiveWeapon.push(arr1[j]);
    };
  };
};
for (var i = 1; i <= valueArmorsLength; i++) {
  if($dataArmors[i].meta['AddPowerCustom']){valueAddPowerCustomArmor.push(i)};
  if($dataArmors[i].meta['Equip State']){
    var arr1 = $dataArmors[i].meta['Equip State'].split(',');
    for (var j = 0; j <= arr1.length-1; j++) {
      valueEquipPassiveArmor.push(arr1[j]);
    };
  };
  if($dataArmors[i].meta['Passive State']){
    var arr1 = $dataArmors[i].meta['Passive State'].split(',');
    for (var j = 0; j <= arr1.length-1; j++) {
      valueEquipPassiveArmor.push(arr1[j]);
    };
  };
};

};
