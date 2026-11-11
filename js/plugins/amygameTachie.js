/*
tachie_kaiwastart(false,false,3,1);
//急ぎ,拡大,右人数,左人数

一時ステート
694愛液、695汗、696ボテ、
697中だし、698顔射精、699ぶっかけ

//0衣装変更即時。id2がｱｸﾀIDか立ち絵名,id3が表情,id4が新ﾋﾟｸID,id5が旧ﾋﾟｸID,id6が衣装変更なしの場合は0
tachie_dousa(0,1,2,12,13,1205,0,0,0);
//1登場,ｱｸﾀｰIDか立ち絵直接指定,表情指定,ﾋﾟｸID,0中1右2左,透明度,0,0,0
tachie_dousa(1,1,1,13,0,255,0,0,0);
//2衣装表情変更,ｱｸﾀｰIDか立ち絵直接指定,表情指定,ﾋﾟｸID,0右1左,透明度,衣装ｱｲﾃﾑID,0,0
tachie_dousa(2,1,1,14,0,255,1119,0,0);
this.wait(3);
//3立ち絵更新,0,0,ﾋﾟｸID,0,0,0,0,0。不要になった
tachie_dousa(3,0,0,13,0,0,0,0,0);
this.wait(60);
//4行動,0,0,ﾋﾟｸID,0,0,2反転3移動4退出5倒れる6攻撃,移動と退出x,0。メッセージない場合ウェイト20入れる
tachie_dousa(4,0,0,14,0,0,2,0,0);//反転
tachie_dousa(4,0,0,14,0,0,3,100,0);//移動(x+100)
//5アニメ,0,0,ﾋﾟｸID,0,0,ｱﾆﾒID,0,//アニメと立ち絵色調変更id9y座標に+
tachie_dousa(5,0,0,15,0,0,196,0,250);
//ﾋﾟｸID,0実行1終了,1バフpar2デバフpar
tachie_partDirectSet(13,1,1);
tachie_partDirectSet(13,0,1);

valueCountSet1 = 101;
tachie_clothesHason(1,22,13,1,1);//ｱｸﾀｰID,破損部位,ﾋﾟｸID,1で全損0で破損、101は破損CG表示ﾋﾟｸID始点
tachie_clothesHason(1,22,13,1,0);//id5が1で破損、0で脱衣
tachie_dousa(0,1,10,12,13,0,0,0,0);
this.wait(Math.randomInt(10));
$gameScreen.erasePicture(13);//立ち絵切り替え後、次の動作で旧ピク消去

特殊立ち絵からの通常立ち絵変更時
$gameVariables.setValue(164,0);//x軸ずらし
tachie_dousa(1,1,1,13,0,255,0,0,0);
this.wait(60);
文章の表示をしてから衣装変更スクリプト
フェードアウト
var actor = $gameActors.actor($gameVariables.value(20));
actor.addState(23);
tachie_syoukyo1(getPreviousTachiePicId());
//$gameVariables.setValue(20,1);
kisekae_tyokusetusitei(1324,23);
tachie_syoukyo1(getPreviousTachiePicId());
this.wait(60);//ここでスクリプト切る
$gameSwitches.setValue(42,true);
tachie_hyouji1($gameVariables.value(20));
var args = new Array(String(getPreviousTachiePicId()),'71','2','ON')
this.pluginCommand("P_CALL_CE", args);
フェードイン

 */

/*:
* @plugindesc このゲーム専用プラグイン
* @author 作者名
* @help ゲーム専用に作成された初期読み込み用プラグイン
*/

//(function() {

//--------------------------------------------------------------------------
// Plugin-wide constants: variable ids, switch ids and picture ids that were
// previously repeated as bare numbers all over this file.
//--------------------------------------------------------------------------
const TACHIE_VAR_EQUIP_ACTOR_ID = 20;      //現在衣装の対象アクターID
const TACHIE_VAR_EQUIP_ITEM_ID = 19;       //着せ替え対象アイテムID
const TACHIE_VAR_EVENT_ID_LIST = 292;      //アクター毎の立ち絵イベントID配列
const TACHIE_VAR_TACHIE_PIC_ID = 300;      //現在の立ち絵ピクチャID
const TACHIE_VAR_EXPRESSION_ID = 151;      //表情ID
const TACHIE_VAR_RIGHT_ACTOR_COUNT = 152;  //右登場人数
const TACHIE_VAR_LEFT_ACTOR_COUNT = 153;   //左登場人数
const TACHIE_VAR_RIGHT_X_SHIFT = 164;      //右側のx軸ずらし
const TACHIE_VAR_LEFT_X_SHIFT = 165;       //左側のx軸ずらし
const TACHIE_VAR_CLOTH_TYPE_PARAM = 493;   //衣装の関連スイッチ番号
const TACHIE_SWITCH_HASTE = 127;           //急ぎモード
const TACHIE_SWITCH_ZOOM = 126;            //拡大モード
const TACHIE_SWITCH_MEMORY_OFF = 29;       //回想中は衣装反映を止める
const TACHIE_SWITCH_DOUSA_BUSY = 97;       //立ち絵動作の処理中フラグ
const TACHIE_PIC_SCREEN_BLACKOUT = 5;      //画面暗転ピクチャ
const TACHIE_SCREEN_CENTER_X = 640;
const TACHIE_SCREEN_CENTER_Y = 384;

//立ち絵会話衣装を実際の立ち絵に反映させる。回想時は自動でoff
tachie_clothReflect = function (actorId) {
  if ($gameSwitches.value(TACHIE_SWITCH_MEMORY_OFF)) return;

  const targetClothingData = $gameVariables.value(actorId + CLOTHING_MEMORY_VAR_BASE_ID);
  const sourceClothingData = $gameVariables.value(actorId + CLOTHING_ACTOR_DATA_VAR_BASE_ID);
  if (!targetClothingData || !sourceClothingData) return;

  copyClothingSlots(targetClothingData, sourceClothingData, 0, 42);
};

//衣装配列の指定範囲をコピーする
function copyClothingSlots(targetClothingData, sourceClothingData, startIndex, endIndex) {
  for (var slotIndex = startIndex; slotIndex <= endIndex; slotIndex++) {
    targetClothingData[slotIndex] = sourceClothingData[slotIndex];
  }
}

//立ち絵ムーブ。
picTachie_move1 = function (picId, offsetX, offsetY, scaleOffsetX, scaleOffsetY, targetOpacity, moveDuration) {
  if (typeof picId !== 'number' || picId < 1) {
    console.warn("Invalid picId:", picId);
    return;
  }

  const picture = $gameScreen.picture(picId);
  if (!picture) return;

  const newX = picture.x() + (Number(offsetX) || 0);
  const newY = picture.y() + (Number(offsetY) || 0);
  const newScaleX = picture.scaleX() + (Number(scaleOffsetX) || 0);
  const newScaleY = picture.scaleY() + (Number(scaleOffsetY) || 0);
  const pictureOrigin = picture.origin();
  $gameScreen.movePicture(picId, pictureOrigin, newX, newY, newScaleX, newScaleY, Number(targetOpacity) || 255, 0, Number(moveDuration) || 60);
};

//衣装状態でスイッチオンオフ.<EvStartCloth:1,1>と併用
tachie_switchOnOff = function (id) {
  if (id !== 1) return;

  const clothingData = $gameVariables.value(CLOTHING_ACTOR_DATA_VAR_BASE_ID + id);
  if (!clothingData) return;

  const isClothClosed = clothingData[20] == 0;
  $gameSwitches.setValue(601, isClothClosed);
};

//立ち絵演出クリアも。1実行0終了
//パーティクル設定は種類(1:味方/2:敵)ごとの差分だけを表で持つ
const tachieParticleConfigMap = {
  1: {
    name: 'actor_particleLight',
    flashColor: [255, 255, 255, 200],
    sound: { name: "Up1", volume: 90, pitch: 110, pan: 0 }
  },
  2: {
    name: 'enemy_particleDark',
    flashColor: [0, 0, 0, 200],
    sound: { name: "Down4", volume: 90, pitch: 90, pan: 0 }
  }
};
const TACHIE_PARTICLE_FLASH_DURATION = 120;

tachie_partDirectSet = function (pictureId, enableFlag, particleType) {
  if (particleType !== 1 && particleType !== 2) return;

  const particleConfig = tachieParticleConfigMap[particleType];

  if (enableFlag !== 1) {
    $gameScreen._particle.particleClear(particleConfig.name);
    return;
  }

  startTachieParticleEffect(pictureId, particleConfig);
};

//パーティクル演出開始(フラッシュ、効果音、パーティクル設定)
function startTachieParticleEffect(pictureId, particleConfig) {
  $gameScreen.startFlash(particleConfig.flashColor, TACHIE_PARTICLE_FLASH_DURATION);
  AudioManager.playSe(particleConfig.sound);
  $gameScreen._particle.particleSet(0, particleConfig.name, 'picture:' + pictureId, 'def', 'screen');
}

//ピクチャの動き方設定
const TACHIE_EASING_FIELDS = ['_easingX', '_easingY', '_easingSx', '_easingSy', '_easingOp'];

picture_easingConfiguration = function (easingValue) {
  for (const easingField of TACHIE_EASING_FIELDS) {
    $gameTemp[easingField] = easingValue;
  }
};

//☆立ち絵会話最初の設定
tachie_kaiwastart = function (isHurry, isZoom, leftActorCount, rightActorCount) {
  $gameSwitches.setValue(TACHIE_SWITCH_HASTE, isHurry);//急ぎtrue通常false
  $gameSwitches.setValue(TACHIE_SWITCH_ZOOM, isZoom);//拡大true通常false
  $gameVariables.setValue(TACHIE_VAR_RIGHT_ACTOR_COUNT, rightActorCount);//右登場人数
  $gameVariables.setValue(TACHIE_VAR_LEFT_ACTOR_COUNT, leftActorCount);//左登場人数
  $gameSwitches.setValue(5, false);//スキップon。手前のコモンでスイッチonにしているため
  $gameScreen.showPicture(TACHIE_PIC_SCREEN_BLACKOUT, 'ScreenBlackOut', 1, TACHIE_SCREEN_CENTER_X, TACHIE_SCREEN_CENTER_Y, 100, 100, 25, 0);
  picture_fade1(TACHIE_PIC_SCREEN_BLACKOUT, "fadeIn", valueWipeImg, 60, 5);
};

//☆立ち絵会話衣装破損設定//ｱｸﾀｰID,破損部位,ﾋﾟｸID,1で全損0で破損、101は破損CG表示ﾋﾟｸID始点,id5が1で破損、0で脱衣
tachie_clothesHason = function (actorId, clothPartSlotId, pictureId, isFullReset, isTornOff) {
  $gameVariables.setValue(TACHIE_VAR_EQUIP_ACTOR_ID, actorId);
  clothes_hason1([clothPartSlotId], isFullReset);
  $gameSwitches.setValue(143, false);

  if ($gameVariables.value(244) < 1) return;

  clothes_hason2(pictureId, isTornOff);
  playClothesHasonBreakEffect(pictureId, isTornOff);
};

//衣装破損時の演出(全損=1 / 脱衣=0)
function playClothesHasonBreakEffect(pictureId, isTornOff) {
  switch (isTornOff) {
    case 1:
      $gameScreen.startFlash([255, 255, 255, 170], 20);
      AudioManager.playSe({ "name": "Collapse2", "volume": 50, "pitch": 130, "pan": 0 });
      $gameScreen.shakePicture(pictureId, 3, 9, 0, 20);
      break;
    case 0:
      AudioManager.playSe({ "name": "Z_ClothesTakeOff", "volume": 150, "pitch": 110, "pan": 0 });
      break;
  }
}

//☆☆立ち絵会話動作用
const scaleConfigGeneral1TachieDousaMap = {
  true: { scale: 70, y: 650 },
  false: { scale: 50, y: 550 }
};
const scaleConfigGeneral2TachieDousaMap = {
  true: { scale: 200, y: 700 },
  false: { scale: 100, y: 400 }
};
const scaleConfigSSTachieDousaMap = {
  true: { scale: 70, y: 700 },
  false: { scale: 50, y: 550 }
};
const actionItemIdsTachieDousa = [1, 3, 4, 5];

const TACHIE_DOUSA_TEXT_PARAMETER_SCALE = 100;
const TACHIE_H_PICTURE_FADE_TAG = 'Hpicture2';
const TACHIE_FADE_IN_X = 5;

tachie_dousa = function (actionType, actorParameter, expressionCode, targetPicId, sourcePicId, showCostumeId, changeCostumeId, changeCostumeParam, unusedParam) {
  //処理中フラグを立てる(終了時に必ず戻す)
  $gameSwitches.setValue(TACHIE_SWITCH_DOUSA_BUSY, true);

  //元ピクチャIDから決まる初期xオフセット(他プラグインと共有するグローバル)
  initialXOffset = sourcePicId == 0 ? 50 : -50;

  //急ぎスイッチでイージング関数とフェード時間が変わる
  const { easingFunction, fadeDuration } = getEasingAndFadeValuesTachieDousa();

  //立ち絵サイズ/座標の決定(内部で変数20/300/151を更新するため必ず先に呼ぶ)
  const { picY, picScaleX, picScaleY } = calculateScaleAndPositionTachieDousa(actorParameter, targetPicId, expressionCode);

  const dollStateFlag = checkDollStateTachieDousa(actionType, valueDollStateId);

  //人形化ステート中は動作別処理を行わない
  if (dollStateFlag == 0) {
    switch (actionType) {
      case 0:
        // --------- Action Type 0: Conversation picture change and costume update ----------
        processCostumeChangeAnimationAtype0TachieDousa(actorParameter, showCostumeId, changeCostumeId, changeCostumeParam, targetPicId, sourcePicId, expressionCode);
        break;
      case 1:
        // --------- Action Type 1: Standard picture display with position easing ----------
        animatePictureAtype1TachieDousa(targetPicId, actorParameter, sourcePicId, showCostumeId, easingFunction, picY, picScaleX, picScaleY, fadeDuration);
        break;
      case 2:
        // --------- Action Type 2: Costume changing with caching target picture attributes ----------
        processCostumeChangeAtype2TachieDousa(targetPicId, changeCostumeId, changeCostumeParam);
        break;
      case 3:
        // --------- Action Type 3: Refreshing standing picture from tachie data ----------
        updateStandingPictureAtype3TachieDousa(targetPicId);
        break;
      default:
        break;
    }
  }

  // Reset the temporary switch flag to indicate processing is complete
  $gameSwitches.setValue(TACHIE_SWITCH_DOUSA_BUSY, false);
};

//人形化ステート中かどうか(動作1,3,4,5のみ判定)
function checkDollStateTachieDousa(actionType, dollStateId) {
  if (actionItemIdsTachieDousa.indexOf(actionType) < 0) return 0;

  const actor = $gameActors.actor($gameVariables.value(TACHIE_VAR_EQUIP_ACTOR_ID));
  if (actor && actor.isStateAffected(dollStateId)) return 1;
  return actor && actor.isStateAffected(dollStateId) ? 1 : 0;
}

function getEasingAndFadeValuesTachieDousa() {
  picture_motion1("smooth", [0]);

  if ($gameSwitches.value(TACHIE_SWITCH_HASTE)) {
    return { easingFunction: 'easeOutBack', fadeDuration: 40 };
  }
  return { easingFunction: 'easeInOutQuad', fadeDuration: 60 };
}

function processCostumeChangeAnimationAtype0TachieDousa(actorParameter, showCostumeId, changeCostumeId, changeCostumeParam, targetPicId, sourcePicId, expressionCode) {
  const sourcePic = $gameScreen.picture(sourcePicId);
  if (!sourcePic) return;

  //退避した元ピクチャの属性(前処理でvalueTacieSetが入っていればそちらを優先)
  const sourceAttributes = readTachiePictureAttributes(sourcePic);
  const durations = {
    primaryMove: changeCostumeId === 0 ? 60 : changeCostumeId + changeCostumeId,
    fadeDelay: changeCostumeId === 0 ? 30 : changeCostumeId
  };

  if (actorParameter >= 1) {
    applyCostumeChangeToTargetPicture(showCostumeId, expressionCode, targetPicId, sourceAttributes);
  } else {
    replacePictureWithDirectTachie(actorParameter, targetPicId, sourceAttributes);
  }

  moveTachiePicturesOnCostumeChange(targetPicId, sourcePicId, sourceAttributes, durations, changeCostumeParam);

  if ($gameSwitches.value(TACHIE_SWITCH_ZOOM)) {
    tachie_bless(targetPicId, 0);
  }

  syncActorEventImage($gameVariables.value(TACHIE_VAR_EQUIP_ACTOR_ID));
}

//ピクチャの表示属性を読み出す(直前処理で退避された値があれば優先して消費する)
function readTachiePictureAttributes(picture) {
  const attributes = {
    origin: picture.origin(),
    x: picture.x(),
    y: picture.y(),
    scaleX: picture.scaleX(),
    scaleY: picture.scaleY(),
    opacity: picture.opacity()
  };

  if (valueTacieSet[0] < 1) return attributes;

  attributes.origin = valueTacieSet[0];
  attributes.x = valueTacieSet[1];
  attributes.y = valueTacieSet[2];
  attributes.scaleX = valueTacieSet[3];
  attributes.scaleY = valueTacieSet[4];
  attributes.opacity = valueTacieSet[5];
  valueTacieSet = [0, 0, 0, 0, 0, 0];

  return attributes;
}

//数値のアクター指定時: 衣装を差し替えて新ピクチャをフェードインさせる
function applyCostumeChangeToTargetPicture(showCostumeId, expressionCode, targetPicId, sourceAttributes) {
  if (showCostumeId >= 1) {
    kisekae_tyokusetusitei(showCostumeId, expressionCode);
  } else {
    tachie_settei2();
  }

  const targetPic = $gameScreen.picture(targetPicId);
  if (!targetPic) return;

  targetPic._origin = sourceAttributes.origin;
  targetPic._x = sourceAttributes.x;
  targetPic._y = sourceAttributes.y;
  targetPic._scaleX = sourceAttributes.scaleX;
  targetPic._scaleY = sourceAttributes.scaleY;
  targetPic._opacity = 0;
}

//立ち絵名の直接指定時: 旧ピクチャを消して新しい立ち絵を同じ属性で表示する
function replacePictureWithDirectTachie(actorParameter, targetPicId, sourceAttributes) {
  if ($gameScreen.picture(targetPicId)) {
    $gameScreen.erasePicture(targetPicId);
  }

  const tachieName = typeof actorParameter === 'string' ? actorParameter.trim() : '';
  if (tachieName === '') {
    console.warn("Invalid actorParameter for image path:", actorParameter);
    $gameScreen.erasePicture(targetPicId);
    return;
  }

  $gameScreen.showPicture(
    targetPicId,
    "/img/tachies/" + tachieName,
    sourceAttributes.origin,
    sourceAttributes.x,
    sourceAttributes.y,
    sourceAttributes.scaleX,
    sourceAttributes.scaleY,
    0,
    0
  );
}

//衣装変更時のピクチャ移動/フェード。新旧ピクチャIDの大小でフェード方法が変わる
function moveTachiePicturesOnCostumeChange(targetPicId, sourcePicId, attributes, durations, changeCostumeParam) {
  const { origin, x, y, scaleX, scaleY, opacity } = attributes;
  const isFadeInToTarget = changeCostumeParam >= 1 && targetPicId >= sourcePicId;
  const isFadeOutFromSource = changeCostumeParam >= 1 && targetPicId < sourcePicId;

  $gameScreen.movePicture(targetPicId, origin, x, y, scaleX, scaleY, opacity, 0, durations.fadeDelay);

  if (isFadeInToTarget) {
    picture_fade1(targetPicId, "fadeIn", TACHIE_H_PICTURE_FADE_TAG, durations.fadeDelay, TACHIE_FADE_IN_X);
    $gameScreen.movePicture(sourcePicId, origin, x, y, scaleX, scaleY, 0, 0, durations.primaryMove);
    return;
  }

  if (isFadeOutFromSource) {
    picture_fade1(sourcePicId, "fadeOut", TACHIE_H_PICTURE_FADE_TAG, durations.primaryMove, TACHIE_FADE_IN_X);
    return;
  }

  $gameScreen.movePicture(sourcePicId, origin, x, y, scaleX, scaleY, 0, 0, durations.primaryMove);
}

//アクターに対応するマップイベントのグラフィックを立ち絵と同期させる
function syncActorEventImage(actorId) {
  const eventIds = $gameVariables.value(TACHIE_VAR_EVENT_ID_LIST);
  if (!eventIds || eventIds[actorId] < 1) return;

  const event = $gameMap.event(eventIds[actorId]);
  const actor = $gameActors.actor(actorId);
  if (!event || !actor) return;

  event.setImage(actor.characterName(), actor.characterIndex());
}

function calculateScaleAndPositionTachieDousa(actorParameter, targetPicId, expressionCode) {
  const isScaled = $gameSwitches.value(TACHIE_SWITCH_ZOOM);
  const isNumericActorParameter = (typeof actorParameter === 'number' || (!isNaN(actorParameter) && actorParameter !== null)) && actorParameter >= 0;

  if (isNumericActorParameter) {
    $gameVariables.setValue(TACHIE_VAR_EQUIP_ACTOR_ID, actorParameter);
    $gameVariables.setValue(TACHIE_VAR_TACHIE_PIC_ID, targetPicId);
    $gameVariables.setValue(TACHIE_VAR_EXPRESSION_ID, expressionCode);

    const generalConfig = scaleConfigGeneral1TachieDousaMap[isScaled];
    return { picY: generalConfig.y, picScaleX: generalConfig.scale, picScaleY: generalConfig.scale };
  }

  //立ち絵名による指定(文字列パラメータ)
  const generalConfig = scaleConfigGeneral2TachieDousaMap[isScaled];
  const size = { picY: generalConfig.y, picScaleX: generalConfig.scale, picScaleY: generalConfig.scale };
  applyTachieTextParameterAdjustments(String(actorParameter), isScaled, size);

  return size;
}

//立ち絵名に含まれる接尾辞(SS/Upper/Scale/State)によるサイズ補正。順に累積適用する
function applyTachieTextParameterAdjustments(actorParameterText, isScaled, size) {
  if (actorParameterText.match(/SS/)) {
    const ssConfig = scaleConfigSSTachieDousaMap[isScaled];
    size.picScaleX = size.picScaleY = ssConfig.scale;
    size.picY = ssConfig.y;
  }
  if (actorParameterText.match(/Upper/)) {
    size.picY = TACHIE_SCREEN_CENTER_Y;
  }
  if (actorParameterText.match(/Scale/)) {
    size.picScaleX = TACHIE_DOUSA_TEXT_PARAMETER_SCALE;
    size.picY = TACHIE_SCREEN_CENTER_Y;
  }
  if (actorParameterText.match(/State/)) {
    size.picScaleY = size.picScaleX = TACHIE_DOUSA_TEXT_PARAMETER_SCALE;
    size.picY = TACHIE_SCREEN_CENTER_Y;
  }
}

function animatePictureAtype1TachieDousa(targetPicId, actorParameter, sourcePicId, showCostumeId, easingFunction, picY, picScaleX, picScaleY, fadeDuration) {
  const initialOpacity = showCostumeId;

  if (actorParameter >= 1) {
    tachie_settei2();
  } else {
    showActorParameterTachiePicture(targetPicId, actorParameter, sourcePicId, picY, picScaleX, picScaleY);
  }

  const targetPic = $gameScreen.picture(targetPicId);
  if (!targetPic) return;

  targetPic._origin = 1;
  targetPic._y = picY;
  targetPic._scaleY = picScaleY;
  targetPic._opacity = 0;

  const placement = calculateEntryPlacement(sourcePicId, targetPic, picScaleX);
  const targetXPos = placement.targetXPos;
  picScaleX = placement.picScaleX;
  targetPic._scaleX = picScaleX;

  $gameScreen.movePicture(targetPicId, 1, targetXPos, picY, picScaleX, picScaleY, initialOpacity, 0, fadeDuration);

  if ($gameSwitches.value(TACHIE_SWITCH_ZOOM)) {
    tachie_bless(targetPicId, 0);
  }
}

//立ち絵名が直接指定された場合の新規表示
function showActorParameterTachiePicture(targetPicId, actorParameter, sourcePicId, picY, picScaleX, picScaleY) {
  const initialX = getEntryInitialXPosition(sourcePicId);
  const tachieName = typeof actorParameter === 'string' ? actorParameter.trim() : '';

  if (tachieName === '') {
    console.warn("Invalid actorParameter for image path:", actorParameter);
    $gameScreen.erasePicture(targetPicId);
    return;
  }

  $gameScreen.showPicture(targetPicId, "/img/tachies/" + tachieName, 1, initialX, picY, picScaleX, picScaleY, 0, 0);
}

//登場位置(0:中央 1:右 2:左)ごとの初期x座標
function getEntryInitialXPosition(sourcePicId) {
  switch (sourcePicId) {
    case 0: return 690;  // 640 + 50
    case 1: return 400;  // 300 + 100
    case 2: return 0;    // 100 - 100
    default: return 100;
  }
}

//登場位置ごとの最終x座標と左右反転スケールを求める
function calculateEntryPlacement(sourcePicId, targetPic, picScaleX) {
  let targetXPos = (sourcePicId === 1) ? 300 : 100;

  switch (sourcePicId) {
    case 0:
      targetXPos = TACHIE_SCREEN_CENTER_X;
      targetPic._x = 690; // 640 + 50
      break;
    case 1:
      targetXPos = calculateRightEntryXPosition();
      targetPic._x = targetXPos + 100;
      $gameVariables.setValue(TACHIE_VAR_RIGHT_X_SHIFT, $gameVariables.value(TACHIE_VAR_RIGHT_X_SHIFT) + 150);
      break;
    case 2:
      targetXPos = targetXPos + $gameVariables.value(TACHIE_VAR_LEFT_X_SHIFT) + ($gameVariables.value(TACHIE_VAR_LEFT_ACTOR_COUNT) * 80);
      targetPic._x = targetXPos - 100;
      //左右反転(picScaleX = picScaleX - picScaleX - picScaleX)
      picScaleX = -picScaleX;
      $gameVariables.setValue(TACHIE_VAR_LEFT_X_SHIFT, $gameVariables.value(TACHIE_VAR_LEFT_X_SHIFT) - 150);
      break;
  }

  return { targetXPos, picScaleX };
}

//右からの登場時x座標(右登場人数とx軸ずらしで決まる)
function calculateRightEntryXPosition() {
  const rightActorCount = $gameVariables.value(TACHIE_VAR_RIGHT_ACTOR_COUNT);

  if (rightActorCount === 0) return 1124; // 1024 + 100

  let rightEntryX = 1280 - 300 + $gameVariables.value(TACHIE_VAR_RIGHT_X_SHIFT) - (rightActorCount * 80);
  if ($gameSwitches.value(TACHIE_SWITCH_ZOOM)) rightEntryX += 50;
  return rightEntryX;
}

function processCostumeChangeAtype2TachieDousa(targetPicId, changeCostumeId, changeCostumeParam) {
  // The target picture usually does not exist yet: type 2 runs before the
  // following type 0 shows it, and the previous id is often erased first.
  // Only the attribute save/restore needs the picture, so never bail out here —
  // doing so skips the costume change and its item grant (e.g. CE329 swimsuit).
  const targetPic = $gameScreen.picture(targetPicId);
  const cachedAttributes = targetPic ? readTachiePictureAttributesFrom(targetPic) : null;

  if (changeCostumeId >= 1) {
    kisekae_tyokusetusitei(changeCostumeId, changeCostumeParam);
  } else {
    tachie_settei2();
  }

  syncActorEventImage($gameVariables.value(TACHIE_VAR_EQUIP_ACTOR_ID));

  if (targetPic) restoreTachiePictureAttributes(targetPic, cachedAttributes);
}

//ピクチャの現在属性を退避する(valueTacieSetは消費しない)
function readTachiePictureAttributesFrom(picture) {
  return {
    origin: picture.origin(),
    x: picture.x(),
    y: picture.y(),
    scaleX: picture.scaleX(),
    scaleY: picture.scaleY(),
    opacity: picture.opacity()
  };
}

//退避した属性をピクチャへ戻す
function restoreTachiePictureAttributes(picture, attributes) {
  picture._origin = attributes.origin;
  picture._x = attributes.x;
  picture._y = attributes.y;
  picture._scaleX = attributes.scaleX;
  picture._scaleY = attributes.scaleY;
  picture._opacity = attributes.opacity;
}

function updateStandingPictureAtype3TachieDousa(targetPicId) {
  //1始まりのピクチャIDを立ち絵データの添字へ変換する
  const standPicIndex = (parseInt(targetPicId, 10) || 0) - 1;
  if (standPicIndex !== -1) {
    showStandingPictureFromTachieData(standPicIndex);
  }

  const targetPic = $gameScreen.picture(targetPicId);
  if (targetPic) {
    restoreTachiePictureAttributes(targetPic, {
      origin: valueTacieSet[0],
      x: valueTacieSet[1],
      y: valueTacieSet[2],
      scaleX: valueTacieSet[3],
      scaleY: valueTacieSet[4],
      opacity: valueTacieSet[5]
    });
  }

  //フェードと透明度を整えて確定させる
  pic_set(targetPicId, 1, 255, 10);
  valueTacieSet = [0, 0, 0, 0, 0, 0];
}

//TKM立ち絵データの内容でピクチャを表示し直す
function showStandingPictureFromTachieData(standPicIndex) {
  const picDataList = $TKMvar.tachie.PicData;
  if (picDataList.length <= standPicIndex) return;

  const picData = picDataList[standPicIndex];
  if (!picData["char"]) return;

  const pictureName = "TKMtachie_" + picData["char"] + "_";
  $gameScreen.showPicture(picData["picNum"], pictureName, 0, picData["x"], picData["y"], 85, 85, 0, 0);
}

//☆☆着せ替え直接指定
const TACHIE_SUBSTITUTE_ITEM_META_COUNT = 9;
const TACHIE_CLOTH_ITEM_ID_START = 1101;
const TACHIE_CLOTH_WORK_SLOT_UNCHANGED = 4; //部位4は衣装初期化の対象外
const TACHIE_VAR_CLOTH_SPECIFY_ID = 465;    //ClothSpecify値の書き込み先

kisekae_tyokusetusitei = function (itemId, relatedSwitchId) {
  const actorId = $gameVariables.value(TACHIE_VAR_EQUIP_ACTOR_ID);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;

  $gameVariables.setValue(TACHIE_VAR_EQUIP_ITEM_ID, itemId);

  const clothItem = $dataItems[itemId];
  if (!clothItem) return;

  if (!$gameParty.hasItem(clothItem)) {
    grantClothItemAndSubstitutes(clothItem);
    grantSubCategoryClothIfComplete(clothItem, actorId);
  }

  const actorClothingData = $gameVariables.value(actorId + CLOTHING_ACTOR_DATA_VAR_BASE_ID);

  //現在衣装を呼び出し
  copyActorClothingToWorkVariables(actorClothingData);

  if (clothItem.meta['ClothSpecify']) {
    applyClothSpecifyToActor(actor, actorClothingData, itemId, relatedSwitchId);
  } else {
    actor.removeState(23);
    kisekae_naibusyori1();
  }

  //衣装情報を更新
  copyWorkVariablesToActorClothing(actorClothingData);
  tachie_settei3(actor);
};

//未所持の衣装アイテムと、その代替取得アイテムを付与する
function grantClothItemAndSubstitutes(clothItem) {
  $gameParty.gainItem(clothItem, 1);

  for (var substituteIndex = 1; substituteIndex <= TACHIE_SUBSTITUTE_ITEM_META_COUNT; substituteIndex++) {
    const substituteItemId = clothItem.meta['SubstituteGetItem' + substituteIndex];
    if (!substituteItemId) continue;

    const substituteItem = $dataItems[Number(substituteItemId)];
    if (!substituteItem) continue;

    $gameParty.gainItem(substituteItem, 1);
  }
}

//衣装一式アイテムならサブカテゴリの衣装もまとめて取得させる
function grantSubCategoryClothIfComplete(clothItem, actorId) {
  if (!clothItem.meta['TotalCloth'] || !clothItem.meta['subCategory'] || !clothItem.meta['ClothType']) return;

  clothes_get(actorId, clothItem.meta['subCategory'], clothItem.meta['ClothType']);
}

//アクターの衣装を作業用変数(460+部位)へ複写
function copyActorClothingToWorkVariables(actorClothingData) {
  if (!actorClothingData) return;

  for (var slotIndex = 1; slotIndex <= CLOTHING_PART_SLOT_COUNT; slotIndex++) {
    $gameVariables.setValue(slotIndex + CLOTHING_PART_VAR_BASE_ID, actorClothingData[slotIndex]);
  }
}

//作業用変数(460+部位)をアクターの衣装へ複写
function copyWorkVariablesToActorClothing(actorClothingData) {
  if (!actorClothingData) return;

  for (var slotIndex = 1; slotIndex <= CLOTHING_PART_SLOT_COUNT; slotIndex++) {
    actorClothingData[slotIndex] = $gameVariables.value(slotIndex + CLOTHING_PART_VAR_BASE_ID);
  }
}

//ClothSpecify付き衣装(指定衣装一式)をアクターに適用する
function applyClothSpecifyToActor(actor, actorClothingData, itemId, relatedSwitchId) {
  const clothItem = $dataItems[itemId];

  actorClothingData[41] = Number(clothItem.meta['TotalCloth']);
  actorClothingData[0] = itemId;

  //現在衣装を初期化
  clearWorkClothingSlots();
  $gameVariables.setValue(TACHIE_VAR_CLOTH_SPECIFY_ID, Number(clothItem.meta['ClothSpecify']));

  if (relatedSwitchId >= 1) {
    $gameVariables.setValue(TACHIE_VAR_CLOTH_TYPE_PARAM, relatedSwitchId);
  }
  actor.addState(23);
}

//作業用衣装スロットを全て初期化する
function clearWorkClothingSlots() {
  for (var slotIndex = 1; slotIndex <= CLOTHING_PART_SLOT_COUNT; slotIndex++) {
    $gameVariables.setValue(slotIndex + CLOTHING_PART_VAR_BASE_ID, 0);
  }
}

//作業用衣装スロットを初期化する(部位4は人形用のため残す)
function clearWorkClothingSlotsExceptBodyType() {
  for (var slotIndex = 1; slotIndex <= CLOTHING_PART_SLOT_COUNT; slotIndex++) {
    if (slotIndex === TACHIE_CLOTH_WORK_SLOT_UNCHANGED) continue;
    $gameVariables.setValue(slotIndex + CLOTHING_PART_VAR_BASE_ID, 0);
  }
}

//☆☆着せ替え内部処理一部
kisekae_naibusyori1 = function () {
  const actorId = $gameVariables.value(TACHIE_VAR_EQUIP_ACTOR_ID);
  const itemId = $gameVariables.value(TACHIE_VAR_EQUIP_ITEM_ID);
  const clothItem = $dataItems[itemId];
  if (!clothItem) return;

  const actorClothingData = $gameVariables.value(actorId + CLOTHING_ACTOR_DATA_VAR_BASE_ID);
  if (!actorClothingData) return;

  actorClothingData[0] = 0;

  if (!clothItem.meta['TotalCloth']) {
    toggleWorkClothSlotAllocation(clothItem);
    return;
  }

  actorClothingData[41] = Number(clothItem.meta['TotalCloth']);
  actorClothingData[0] = itemId;

  //現在衣装を初期化
  clearWorkClothingSlotsExceptBodyType();

  if (clothItem.meta['subCategory'] === '全裸') return;

  assignClothAllocationsForClothTypes(clothItem, actorId);
};

//衣装一式でないアイテム: 同じ部位の割当番号をトグルする
function toggleWorkClothSlotAllocation(clothItem) {
  const clothSwitchId = Number(clothItem.meta['ClothSwitch']);
  const clothAllocationNumber = Number(clothItem.meta['ClothAllocationNumber']);
  const clothVarId = CLOTHING_PART_VAR_BASE_ID + clothSwitchId;
  const currentAllocationNumber = $gameVariables.value(clothVarId);
  const nextAllocationNumber = currentAllocationNumber == clothAllocationNumber ? 0 : clothAllocationNumber;

  $gameVariables.setValue(clothVarId, nextAllocationNumber);
}

//衣装一式アイテム: 「通常」と指定カテゴリの衣装を部位へ割り当てる
function assignClothAllocationsForClothTypes(clothItem, actorId) {
  for (const clothTypeName of ['通常', clothItem.meta['ClothType']]) {
    assignClothAllocationsForClothType(clothTypeName, clothItem.meta['subCategory'], actorId);
  }
}

//指定カテゴリの衣装アイテムを走査して部位割当番号を決める
function assignClothAllocationsForClothType(clothTypeName, subCategory, actorId) {
  const exposureVarId = actorId + CLOTHING_EXPOSURE_VAR_BASE_ID;
  const itemCount = $dataItems.length;

  for (var itemIndex = TACHIE_CLOTH_ITEM_ID_START; itemIndex < itemCount; itemIndex++) {
    const candidateItem = $dataItems[itemIndex];
    if (candidateItem.meta['ClothType'] !== clothTypeName) continue;
    if (candidateItem.meta['subCategory'] !== subCategory) continue;
    if (!isClothItemApplicableToActor(candidateItem, actorId, exposureVarId)) continue;

    const clothSwitchId = Number(candidateItem.meta['ClothSwitch']);
    const clothAllocationNumber = Number(candidateItem.meta['ClothAllocationNumber']);
    $gameVariables.setValue(CLOTHING_PART_VAR_BASE_ID + clothSwitchId, clothAllocationNumber);
  }
}

//衣装アイテムがこのアクター(または共通枠)の物かどうか
function isClothItemApplicableToActor(candidateItem, actorId, exposureVarId) {
  const eicSwitchNum = Number(candidateItem.meta['EICSwitch']);

  return exposureVarId == eicSwitchNum
    || actorId + 180 == eicSwitchNum
    || 200 == eicSwitchNum
    || 400 == eicSwitchNum;
}

//☆☆立ち絵設定。本体
// 立ち絵パーツ変数の基準ID(衣装パーツ1..40は460+スロット、人形用の一時保存は560+スロット)
const CLOTHING_PART_VAR_BASE_ID = 460;        //作業用: 各部位の割当番号
const CLOTHING_TEMP_VAR_BASE_ID = 560;        //人形用の一時保存
const CLOTHING_PART_SLOT_COUNT = 40;          //衣装部位数
const CLOTHING_ACTOR_DATA_VAR_BASE_ID = 440;  //アクター毎の現在衣装配列
const CLOTHING_MEMORY_VAR_BASE_ID = 540;      //回想用に退避した衣装配列
const CLOTHING_EXPOSURE_VAR_BASE_ID = 380;    //アクター毎の露出度配列

tachie_settei2 = function () {

  // Get actor information and datas
  const actorId = $gameVariables.value(20);
  const gameActor = $gameActors.actor(actorId);
  if (!gameActor) return;

  tachie_settei3(gameActor);
}

tachie_settei3 = function (gameActor) {

  if (!gameActor) return;

  // was purpose to optimize by exclude not inbattle actors but it case new game crash, reverted, remove this commented later
  // if (!$gameParty.battleMembers().includes(gameActor)) {
  //   return;
  // }
  const actorId = gameActor.actorId();
  const actorClothingData = $gameVariables.value(actorId + CLOTHING_ACTOR_DATA_VAR_BASE_ID);
  const actorExposureData = $gameVariables.value(actorId + CLOTHING_EXPOSURE_VAR_BASE_ID);
  if (!actorClothingData || !actorExposureData) return;

  // Reset temporary clothing variables (561-600)
  resetTemporaryClothingSlots();

  // Load current clothing data from actor to working variables (461-500)
  copyClothingSlotsToWorkVariables(actorClothingData);

  // Only process further for female characters
  if (isGirl(gameActor)) {

    // Handle doll state - store current clothing in temp variables and clear current
    if (gameActor.isStateAffected(valueDollStateId)) {
      saveWorkClothingToTemporarySlots();
      clearWorkClothingSlotsWithBodyType();
    }
    else { // Normal character processing
      rosyutu_genkai1(gameActor); // Calculate exposure limits
      rosyutu_genzai1(actorId); // Calculate current exposure

      // Apply custom pose/expression settings if not in specified state
      if (!gameActor.isStateAffected(23)) {
        tachie_settei1(gameActor);
      }
    }
  }

  // Process internal tachie display data
  tachie_naibusyori2(gameActor);

  // Restore any temporary clothing that was saved
  restoreTemporaryClothingSlots();

  // Update actor's clothing data from working variables
  writeBackClothingData(actorClothingData);

  // Update character graphics
  charagra_henkou1(actorId);

  // Update clothing-related global values for female characters
  if (isGirl(gameActor)) {
    updateClothingGlobals(gameActor, actorClothingData);
  }
};

// 人形用の一時衣装変数(561-600)を初期化する
function resetTemporaryClothingSlots() {
  for (let variableId = CLOTHING_TEMP_VAR_BASE_ID + 1; variableId <= CLOTHING_TEMP_VAR_BASE_ID + CLOTHING_PART_SLOT_COUNT; variableId++) {
    $gameVariables.setValue(variableId, 0);
  }
}

// 現在衣装を作業変数(461-500)に読み出す
function copyClothingSlotsToWorkVariables(actorClothingData) {
  for (let clothingIndex = 1; clothingIndex <= CLOTHING_PART_SLOT_COUNT; clothingIndex++) {
    $gameVariables.setValue(CLOTHING_PART_VAR_BASE_ID + clothingIndex, actorClothingData[clothingIndex]);
  }
}

// 人形用に作業中の衣装を一時変数(561-600)に退避する
function saveWorkClothingToTemporarySlots() {
  for (let clothingIndex = 1; clothingIndex <= CLOTHING_PART_SLOT_COUNT; clothingIndex++) {
    $gameVariables.setValue(CLOTHING_TEMP_VAR_BASE_ID + clothingIndex, $gameVariables.value(CLOTHING_PART_VAR_BASE_ID + clothingIndex));
  }
}

// 作業中の衣装をクリアし、体型だけ3に設定する
function clearWorkClothingSlotsWithBodyType() {
  for (let clothingIndex = 1; clothingIndex <= CLOTHING_PART_SLOT_COUNT; clothingIndex++) {
    $gameVariables.setValue(CLOTHING_PART_VAR_BASE_ID + clothingIndex, 0);
  }
  $gameVariables.setValue(CLOTHING_PART_VAR_BASE_ID + 1, 3); // Set body type
}

// 一時変数に退避した衣装を作業変数に戻す
function restoreTemporaryClothingSlots() {
  for (let clothingIndex = 1; clothingIndex <= CLOTHING_PART_SLOT_COUNT; clothingIndex++) {
    const temporaryClothingData = $gameVariables.value(CLOTHING_TEMP_VAR_BASE_ID + clothingIndex);
    if (temporaryClothingData >= 1) {
      $gameVariables.setValue(CLOTHING_PART_VAR_BASE_ID + clothingIndex, temporaryClothingData);
    }
  }
}

// 作業変数の内容でアクターの衣装情報を更新する
function writeBackClothingData(actorClothingData) {
  for (let clothingIndex = 1; clothingIndex <= CLOTHING_PART_SLOT_COUNT; clothingIndex++) {
    actorClothingData[clothingIndex] = $gameVariables.value(CLOTHING_PART_VAR_BASE_ID + clothingIndex);
  }
}

// バストアップの胴体を覆う部位(インナー上/服上/服上2)
const BUST_UP_TORSO_SLOT_IDS = [21, 23, 25];

// バストアップで上半身が素肌かどうか。統合衣装(41)は1枚絵しか持たず破損差分が
// 存在しないため、覆う部位が全て外れたら立ち絵と同じく素肌差分に切り替える。
function isBustUpTorsoBare(actorClothingData) {
  return BUST_UP_TORSO_SLOT_IDS.every(function (slotId) { return actorClothingData[slotId] == 0; });
}

// 衣装関連のグローバル値を更新する(女性キャラのみ)
function updateClothingGlobals(gameActor, actorClothingData) {
  const actorId = gameActor.actorId();
  valueLiningCloth[actorId] = actorClothingData[2];
  valueBackHairCloth[actorId] = gameActor.isStateAffected(23) ? 1 : actorClothingData[4];
  valueCoatCloth[actorId] = actorClothingData[28];
  valueFrontHairCloth[actorId] = actorClothingData[32];
  let bustUpClothValue = actorClothingData[41];
  // 41は統合衣装の会話グラ用ID。負値はレイヤー非表示の指示なので触らない。
  if (bustUpClothValue >= 0 && isBustUpTorsoBare(actorClothingData)) bustUpClothValue = 1;
  valueBustUpCloth[actorId] = bustUpClothValue;
  valueBustUpCloth2[actorId] = bustUpClothValue;
}

//☆☆キャラグラ変更。
charagra_henkou1 = function (actorId) {
  // Return early if actorId is invalid
  if (actorId < 1) return;

  // Get actor reference
  const actor = $gameActors.actor(actorId);

  // Return early if actor wasn't found
  if (!actor) return;

  // Return early if actor isn't female
  if (!isGirl(actor)) return;

  // Process character graphics change
  charagra_choice1(actorId);

  // Apply special processing for Liscia Blue
  isyou_senyouLisciaBlueOnly(actorId);

  // Set character and battler images
  const characterImageId = actorId + '_' + $gameVariables.value(21);
  const characterImageIndex = $gameVariables.value(22);
  const battlerImageId = actorId + '_' + $gameVariables.value(23);

  actor.setCharacterImage(characterImageId, characterImageIndex);
  actor.setBattlerImage(battlerImageId);

  // Set switch if not in battle
  if (!$gameParty.inBattle()) {
    $gameSwitches.setValue(148, true);
  }
};

// for charagra_choice1
set_charachip_graphics = function (itemMeta) {
  $gameVariables.setValue(21, Number(itemMeta['CharaChip1']));//1102は全裸指定
  $gameVariables.setValue(22, Number(itemMeta['CharaChip2']));
  $gameVariables.setValue(23, Number(itemMeta['CharaChipsv']));
}

//☆☆キャラチップ決定用計算
// キャラチップ判定の対象となる衣装アイテムの最小ID
const CHARACHIP_ITEM_SEARCH_START_ID = 1331;
// 露出度集計時の部位スロット数(subCategoryのindex)
const EXPOSURE_PART_SLOT_COUNT = 21;

charagra_choice1 = function (actorId) {

  const actor = $gameActors.actor(actorId);
  if (!actor) return;

  if (actor.isStateAffected(23)) {
    // 衣装固定状態: 現在設定されている衣装アイテムのキャラチップをそのまま使う
    const fixedCostumeData = $gameVariables.value(actorId + CLOTHING_ACTOR_DATA_VAR_BASE_ID);
    if (!fixedCostumeData) return;
    const currentItem = $dataItems[fixedCostumeData[0]];
    if (currentItem) {
      set_charachip_graphics(currentItem.meta);
    }

  } else {
    const exposureData = $gameVariables.value(actorId + CLOTHING_EXPOSURE_VAR_BASE_ID);
    const charachipDataArr = $gameVariables.value(actorId + CLOTHING_ACTOR_DATA_VAR_BASE_ID);
    if (!exposureData || !charachipDataArr) return;
    const exposureValue = exposureData[4];
    let currentCostumeItemId = charachipDataArr[0];//0アイテムID
    //var value2 = $gameVariables.value(id1+440)[41];//41会話グラ用指定ID
    const zenraItem = $dataItems[zenravalueId];
    if (!zenraItem) return;
    set_charachip_graphics(zenraItem.meta);

    if (exposureValue <= 9) {
      charachipDataArr[0] = 0;
      charachipDataArr[41] = 1;
      currentCostumeItemId = 0;
    };
    if (currentCostumeItemId == 0 && exposureValue >= 26) {
      //現在衣装を呼び出し
      reloadCurrentCostumeSlots(charachipDataArr);
      selectTotalClothByExposure(actorId, charachipDataArr);
    };

    if (currentCostumeItemId >= 1 && $dataItems[currentCostumeItemId]) {
      set_charachip_graphics($dataItems[currentCostumeItemId].meta);
    }
  };
  tachie_switchOnOff();

};

// 現在衣装を作業変数(461-500)に読み出す
function reloadCurrentCostumeSlots(charachipDataArr) {
  for (let clothingIndex = 1; clothingIndex <= CLOTHING_PART_SLOT_COUNT; clothingIndex++) {
    $gameVariables.setValue(CLOTHING_PART_VAR_BASE_ID + clothingIndex, charachipDataArr[clothingIndex]);
  }
}

// 露出度が最も高い部位の統合衣装を探し、キャラチップと衣装情報に反映する
function selectTotalClothByExposure(actorId, charachipDataArr) {
  // 通常衣装(非統合)の露出度を部位別に集計する。各スロットでは最初に一致した
  // アイテムだけが有効(v1.46の内側breakと同じ結果を得るため消費済みスロットで管理する)
  const exposureByClothPart = Array(EXPOSURE_PART_SLOT_COUNT).fill(0);//21
  const consumedSlots = new Set();
  for (const singleClothItem of collectClothItemsForCharachip(actorId, false)) {
    const itemMeta = singleClothItem.meta;
    const clothSwitchVarId = Number(itemMeta['ClothSwitch']) + CLOTHING_PART_VAR_BASE_ID;
    if (clothSwitchVarId < CLOTHING_PART_VAR_BASE_ID + 1 || clothSwitchVarId > CLOTHING_PART_VAR_BASE_ID + CLOTHING_PART_SLOT_COUNT) continue;
    if (consumedSlots.has(clothSwitchVarId)) continue;
    if ($gameVariables.value(clothSwitchVarId) != Number(itemMeta['ClothAllocationNumber'])) continue;

    consumedSlots.add(clothSwitchVarId);
    exposureByClothPart[Number(itemMeta['subCategory'])] += Number(itemMeta['ClothUncoverCount']);//露出度で加算
  }

  const max = exposureByClothPart.reduce(function (a, b) {
    return Math.max(a, b);
  });
  const index = exposureByClothPart.findIndex(partExposure => partExposure === max);
  // BUGFIX: v1.46 was skipping the selection scan when index == 0 (露出部位なし)
  if (index <= 0) return;

  const totalClothItem = findTotalClothItemForPart(actorId, index);
  if (!totalClothItem) return;
  set_charachip_graphics(totalClothItem.meta);
  charachipDataArr[0] = totalClothItem.itemId;
  charachipDataArr[41] = Number(totalClothItem.meta['TotalCloth']);
}

// キャラチップ判定対象の衣装アイテムを集める(requireTotalClothで統合衣装のみに絞る)
function collectClothItemsForCharachip(actorId, requireTotalCloth) {
  const clothItems = [];
  const items = $dataItems;
  const itemsCount = items.length;
  const actorEicSwitchId = actorId + CLOTHING_EXPOSURE_VAR_BASE_ID;
  for (let itemId = CHARACHIP_ITEM_SEARCH_START_ID; itemId < itemsCount; itemId++) {
    const item = items[itemId];
    const itemMeta = item.meta;
    if (requireTotalCloth ? !itemMeta['TotalCloth'] : itemMeta['TotalCloth']) continue;
    const itemEICSwitchNum = Number(itemMeta['EICSwitch']);
    if (requireTotalCloth) {
      if (itemEICSwitchNum !== 400 && itemEICSwitchNum !== actorEicSwitchId) continue;
    } else {
      if (itemEICSwitchNum !== 200 && itemEICSwitchNum !== actorId + 180 && itemEICSwitchNum !== actorEicSwitchId) continue;
    }
    clothItems.push(item);
  }
  return clothItems;
}

// 統合衣装から指定部位のものを探す(先頭一致)
function findTotalClothItemForPart(actorId, partIndex) {
  for (const totalClothItem of collectClothItemsForCharachip(actorId, true)) {
    if (partIndex !== Number(totalClothItem.meta['subCategory'])) continue;
    return { itemId: totalClothItem.id, meta: totalClothItem.meta };
  }
  return null;
}

// tachie_clear is not defined anywhere, warn only once instead of on every refresh
let warnedMissingTachieClearTachieNaibusyori2 = false;
function warnMissingTachieClearTachieNaibusyori2() {
  if (warnedMissingTachieClearTachieNaibusyori2) return;
  warnedMissingTachieClearTachieNaibusyori2 = true;
  console.warn("use missing tachie_clear function");
}

// 立ち絵表示用の変数ID(101-113,149)は立ち絵コモンと共有しているため名前を付けて扱う
const TACHIE_VAR_SHOW_X = 101;                 //表示開始x座標
const TACHIE_VAR_SHOW_Y = 102;                 //表示開始y座標
const TACHIE_VAR_SHOW_SCALE_X = 103;           //表示開始拡大率x
const TACHIE_VAR_SHOW_SCALE_Y = 104;           //表示開始拡大率y
const TACHIE_VAR_TARGET_X = 105;               //移動先x座標
const TACHIE_VAR_TARGET_Y = 106;               //移動先y座標
const TACHIE_VAR_TARGET_SCALE_X = 107;         //移動先拡大率x
const TACHIE_VAR_TARGET_SCALE_Y = 108;         //移動先拡大率y
const TACHIE_VAR_TARGET_OPACITY = 109;         //移動先透過率
const TACHIE_VAR_MOVE_WAIT = 110;              //移動ウェイト
const TACHIE_VAR_PREVIOUS_TARGET_Y = 111;      //前回の移動先y座標
const TACHIE_VAR_SHOW_ACTOR_ID = 112;          //表示中アクターID
const TACHIE_VAR_STANDING_MAG_Y = 113;         //立ち絵倍率のy換算値
const TACHIE_VAR_TACHIE_ACTOR_NAME = 118;      //立ち絵キャラ名(actor1等)
const TACHIE_VAR_STANDING_MAG = 120;           //立ち絵倍率
const TACHIE_VAR_SHOW_INITIAL_OPACITY = 149;   //表示開始時の透過率

const TACHIE_SWITCH_AURA_EFFECT = 30;          //オーラ/残像演出
const TACHIE_SWITCH_TACHIE_X_1030 = 130;       //立ち絵x座標を1030固定
const TACHIE_SWITCH_GIRL_LAYOUT = 200;         //女の子用レイアウト
const TACHIE_SWITCH_GIRL_SMALL_SCALE = 150;    //女の子用縮小レイアウト
const TACHIE_STATE_AFTERIMAGE = 602;           //残像表示ステート
const TACHIE_STATE_HIDE_TACHIE = 19;           //立ち絵消去ステート
const TACHIE_STATE_CLOTH_FIXED = 23;           //衣装固定ステート
const TACHIE_PIC_AFTERIMAGE = 7;               //残像ピクチャID
const TACHIE_PIC_FACE_OVERLAY = 45;            //表情上書きピクチャID
const TACHIE_STANDING_PICTURE_SCALE = 85;      //TKM立ち絵の固定拡大率
const TACHIE_GIRL_LAYOUT_CENTER_X = 780;       //女の子レイアウトのx座標
const TACHIE_TACHIE_X_FORCED = 1030;           //スイッチ130時のx座標

//☆☆立ち絵内部処理。本体
tachie_naibusyori2 = function (gameActor) {
  if (!gameActor) return;

  const dataActor = gameActor.actor();
  if (!dataActor) return;

  const actorId = gameActor.actorId();
  const actorCharName = 'actor' + actorId;

  //立ち絵用キャラ名
  $gameVariables.setValue(TACHIE_VAR_TACHIE_ACTOR_NAME, actorCharName);

  //立ち絵ピクチャIDはアクターデータベースのmetaから決まる
  const tachiePicId = Number(dataActor.meta['tachiePicId']);
  $gameVariables.setValue(117, tachiePicId);

  //0始まりの立ち絵番号
  const tachieIndex = tachiePicId > 0 ? tachiePicId - 1 : -1;

  if ($gameSwitches.value(20)) {
    initializeTachieCharacterParts(actorCharName, tachieIndex);
  }

  //ステート19は立ち絵消去
  if (gameActor.isStateAffected(TACHIE_STATE_HIDE_TACHIE)) {
    //tachie_clear(picId); //元コードでも未定義関数
    warnMissingTachieClearTachieNaibusyori2();
    runTachieLoop(() => 0);
  } else {
    runTachieLoop(partSlot => $gameVariables.value(partSlot + CLOTHING_PART_VAR_BASE_ID));
  }

  updateTachiePictureCharacter(actorCharName, tachieIndex);
};

//立ち絵パーツの初期化(スイッチ20がonの時)
function initializeTachieCharacterParts(actorCharName, tachieIndex) {
  const tachieData = $TKMvar.tachie;
  const picData = tachieData.PicData;

  runTachieLoop(
    partSlot => $gameVariables.value(partSlot + CLOTHING_PART_VAR_BASE_ID),
    partSlot => $gameVariables.value(partSlot + CLOTHING_PART_VAR_BASE_ID) >= 0
  );

  //前回のピクチャを消去
  if (tachieIndex !== -1 && tachieIndex < picData.length) {
    $gameScreen.erasePicture(picData[tachieIndex].picNum);
  }

  tachieData.CharList[actorCharName] = Array(tachieData.MaxLayer).fill(0);
}

//立ち絵データのキャラを差し替えて表示する
function updateTachiePictureCharacter(actorCharName, tachieIndex) {
  if (tachieIndex === -1) return;

  const tachieData = $TKMvar.tachie;
  const charList = tachieData.CharList;
  const picData = tachieData.PicData;
  const isKnownIndex = tachieIndex < picData.length;

  const currentChar = isKnownIndex ? picData[tachieIndex].char : null;
  if (currentChar !== actorCharName && actorCharName in charList && isKnownIndex) {
    picData[tachieIndex].char = actorCharName;
    picData[tachieIndex].bitmap = [];
    tachieData.preloadBitmap(tachieIndex);
  }

  showStandingPictureFromTachieData(tachieIndex);
}

// Helper function to apply one clothing part per call to tachie_naibusyori1, from tachie_naibusyori2
function runTachieLoop(getPartNumber, condition) {
  const characterName = $gameVariables.value(TACHIE_VAR_TACHIE_ACTOR_NAME);
  for (let partSlot = 1; partSlot <= CLOTHING_PART_SLOT_COUNT; partSlot++) {
    if (condition && !condition(partSlot)) continue;
    tachie_naibusyori1(characterName, partSlot, getPartNumber(partSlot));
  }
}

//☆☆立ち絵内部処理CP一つずつ
/**
* Handles internal processing for character parts in the tachie (standing image) system.
* Updates a specific part of a character's standing image and manages its bitmap resources.
* @param {string} characterName - standing image character name (e.g. 'actor1')
* @param {number} partSlot - clothing part slot number (1-40)
* @param {number} partValue - part number to apply (0 clears the part)
*/
tachie_naibusyori1 = function (characterName, partSlot, partValue) {
  const partName = String(partSlot);
  const partNumber = Number(partValue) || 0;

  const tachie = $TKMvar.tachie;
  const charList = tachie.CharList;
  if (!(characterName in charList)) return;

  const partsNameArr = tachie.partsNameArr;

  //部位名に対応するレイヤー番号
  const layerNum = partsNameArr.indexOf(partName);
  if (layerNum === -1) return;

  //既に同じ値なら何もしない
  const characterParts = charList[characterName];
  if (characterParts[layerNum] === partNumber) return;

  characterParts[layerNum] = partNumber;

  //このキャラを使っている全ピクチャのビットマップキャッシュを更新する
  const picData = tachie.PicData;
  const picCount = picData.length;
  for (var picIndex = 0; picIndex < picCount; picIndex++) {
    const pic = picData[picIndex];
    if (pic.char !== characterName) continue;

    if (!pic.bitmap) {
      tachie.preloadBitmap(picIndex);
    }

    pic.bitmap[layerNum] = loadTachiePartBitmap(tachie, pic, characterName, partsNameArr[layerNum], partNumber);
  }
};

//パーツ画像を読み込む(0は消去)
function loadTachiePartBitmap(tachie, pic, characterName, layerName, partNumber) {
  if (partNumber === 0) return null;

  const imagePath = characterName + "_" + layerName + "_" + partNumber;
  const bitmap = ImageManager.loadPicture("/img/tachies/" + imagePath, 0);

  //Galvのキャッシュにも登録
  Galv.CACHE.load('tachies', imagePath);

  return bitmap;
}

//☆☆立ち絵消去
tachie_syoukyo1 = function (tachiePicId) {
  if ($gameScreen.picture(tachiePicId)) {
    pic_eraseP(0, [tachiePicId]);
  }

  erasePictureWithBreathOff(TACHIE_PIC_AFTERIMAGE);
  erasePictureWithBreathOff(TACHIE_PIC_FACE_OVERLAY);

  $gameSwitches.setValue(31, true);
};

//UTSUの呼吸エフェクトを止めてからピクチャを消す
function erasePictureWithBreathOff(pictureId) {
  if (!$gameScreen.picture(pictureId)) return;

  UTSU.PictureBreath.off([pictureId]);
  $gameScreen.erasePicture(pictureId);
}

//☆☆立ち絵表示
tachie_hyouji1 = function (actorId) {
  const gameActor = $gameActors.actor(actorId);
  if (!gameActor) return;

  tachie_hyouji2(gameActor);
};

tachie_hyouji2 = function (gameActor) {
  if (!gameActor) return;

  const dataActor = gameActor.actor();
  if (!dataActor) return;

  const actorId = gameActor.actorId();
  $gameVariables.setValue(TACHIE_VAR_SHOW_ACTOR_ID, actorId);

  const tachiePicId = Number(dataActor.meta['tachiePicId']);
  $gameVariables.setValue(TACHIE_VAR_TACHIE_PIC_ID, tachiePicId);

  //ステートで立ち絵固定されている場合は専用処理のみ
  if (applyTachieChangeStatePictures(gameActor, actorId, tachiePicId)) return;

  const standingPictureMag = $gameVariables.value(TACHIE_VAR_STANDING_MAG);
  applyStandingPictureBaseVariables(standingPictureMag);

  //残像y軸。途中で数字を入れるためこれだけ先に実行
  const afterimageYOffset = applyTachieLayoutAdjustments(gameActor);

  showStandingPictureWithMotions(gameActor, actorId, afterimageYOffset);
};

//ステート固定立ち絵を表示する。1枚でも表示したらtrue
function applyTachieChangeStatePictures(gameActor, actorId, tachiePicId) {
  let stateEffectCount = 1;

  const actorLearnedSkill65 = gameActor.isLearnedSkill(65);
  const actorLearnedSkill69 = gameActor.isLearnedSkill(69);
  const stateChangeList = valueTachieChangeState;

  for (let stateIndex = 0, listLength = stateChangeList.length; stateIndex < listLength; stateIndex++) {
    const stateId = stateChangeList[stateIndex];
    if (!gameActor.isStateAffected(stateId)) continue;

    stateEffectCount++;

    const stateMeta = $dataStates[stateId].meta;
    const randomYPosition = getRandomIndex(51) + 384;
    const randomMoveDuration = getRandomIndex(61) + 40;

    //スキル習得数で立ち絵のバリエーションが増える
    let skillModifier = 1;
    if (actorLearnedSkill65) skillModifier++;
    if (actorLearnedSkill69) skillModifier++;

    let baseXPosition = 1024;
    if (stateMeta['TachieXline']) {
      baseXPosition += Number(stateMeta['TachieXline']);
    }

    const pictureName = stateMeta['TachieSet'] +
      (stateMeta['TachieActorSpecify'] ? actorId + '_' + skillModifier : "");
    $gameScreen.showPicture(tachiePicId, pictureName, 1, baseXPosition, randomYPosition, 100, 100, 150, 0);

    if ($gameScreen.picture(tachiePicId)) {
      $gameScreen.movePicture(tachiePicId, 1, baseXPosition, TACHIE_SCREEN_CENTER_Y, 100, 100, 255, 0, randomMoveDuration);
    }
  }

  return stateEffectCount !== 1;
}

//通常立ち絵の表示開始/移動先変数を初期化する
function applyStandingPictureBaseVariables(standingPictureMag) {
  $gameVariables.setValue(TACHIE_VAR_STANDING_MAG_Y, standingPictureMag * 9);
  $gameVariables.setValue(TACHIE_VAR_TARGET_X, 1130); // x座標
  $gameVariables.setValue(TACHIE_VAR_TARGET_Y, $gameVariables.value(TACHIE_VAR_STANDING_MAG_Y)); // y座標60-700
  $gameVariables.setValue(TACHIE_VAR_TARGET_SCALE_X, standingPictureMag); // x拡大率
  $gameVariables.setValue(TACHIE_VAR_TARGET_SCALE_Y, standingPictureMag); // y拡大率
  $gameVariables.setValue(TACHIE_VAR_TARGET_OPACITY, 255); // 透過率
  $gameVariables.setValue(TACHIE_VAR_MOVE_WAIT, 40); // ウェイト
  $gameVariables.setValue(TACHIE_VAR_SHOW_X, $gameVariables.value(TACHIE_VAR_TARGET_X) + 100);
  $gameVariables.setValue(TACHIE_VAR_SHOW_Y, $gameVariables.value(TACHIE_VAR_TARGET_Y));
  $gameVariables.setValue(TACHIE_VAR_SHOW_SCALE_X, $gameVariables.value(TACHIE_VAR_TARGET_SCALE_X));
  $gameVariables.setValue(TACHIE_VAR_SHOW_SCALE_Y, $gameVariables.value(TACHIE_VAR_TARGET_SCALE_Y));
  $gameVariables.setValue(TACHIE_VAR_SHOW_INITIAL_OPACITY, 0); // 表示最初の透明度
}

//表示位置のスイッチ(130/200/30)による補正。残像y軸オフセットを返す
function applyTachieLayoutAdjustments(gameActor) {
  let afterimageYOffset = 0;

  if ($gameSwitches.value(TACHIE_SWITCH_TACHIE_X_1030)) {
    $gameVariables.setValue(TACHIE_VAR_TARGET_X, TACHIE_TACHIE_X_FORCED); // x座標
  }

  if ($gameSwitches.value(TACHIE_SWITCH_GIRL_LAYOUT)) {
    $gameVariables.setValue(TACHIE_VAR_TARGET_X, TACHIE_GIRL_LAYOUT_CENTER_X); // x座標
    if ($gameSwitches.value(TACHIE_SWITCH_GIRL_SMALL_SCALE)) {
      applyGirlCompactScaleAdjustments();
    } else {
      applyGirlNormalScaleAdjustments();
    }
    $gameVariables.setValue(TACHIE_VAR_SHOW_X, $gameVariables.value(TACHIE_VAR_TARGET_X) - 50);

    afterimageYOffset = applyGirlCostumeOffsetAdjustments(gameActor, afterimageYOffset);
  } else {
    applyTachiePoseYOffset(gameActor);
  }

  applyTachieAuraEffectAdjustments();

  return afterimageYOffset;
}

//女の子用縮小レイアウト(スイッチ150)
function applyGirlCompactScaleAdjustments() {
  const scaleValue = 40;
  $gameVariables.setValue(TACHIE_VAR_SHOW_SCALE_X, scaleValue); // x拡大率
  $gameVariables.setValue(TACHIE_VAR_SHOW_SCALE_Y, scaleValue); // y拡大率
  $gameVariables.setValue(TACHIE_VAR_TARGET_SCALE_X, scaleValue); // x拡大率
  $gameVariables.setValue(TACHIE_VAR_TARGET_SCALE_Y, scaleValue); // y拡大率
  $gameVariables.setValue(TACHIE_VAR_TARGET_Y, scaleValue * 9);
  $gameVariables.setValue(TACHIE_VAR_SHOW_Y, scaleValue * 9);
  $gameVariables.setValue(TACHIE_VAR_TARGET_X, $gameVariables.value(TACHIE_VAR_TARGET_X) - 100);
  $gameVariables.setValue(TACHIE_VAR_TARGET_Y, $gameVariables.value(TACHIE_VAR_TARGET_Y) + 50);
  $gameVariables.setValue(TACHIE_VAR_SHOW_Y, $gameVariables.value(TACHIE_VAR_SHOW_Y) + 50);
  $gameVariables.setValue(TACHIE_VAR_MOVE_WAIT, 20);
}

//女の子用等倍レイアウト
function applyGirlNormalScaleAdjustments() {
  const scaleValue = 100;
  $gameVariables.setValue(TACHIE_VAR_TARGET_SCALE_X, scaleValue); // 拡大率
  $gameVariables.setValue(TACHIE_VAR_TARGET_SCALE_Y, scaleValue); // 拡大率
  $gameVariables.setValue(TACHIE_VAR_SHOW_SCALE_X, scaleValue); // 拡大率
  $gameVariables.setValue(TACHIE_VAR_SHOW_SCALE_Y, scaleValue); // 拡大率
  $gameVariables.setValue(TACHIE_VAR_TARGET_X, $gameVariables.value(TACHIE_VAR_TARGET_X) - 50);
  $gameVariables.setValue(TACHIE_VAR_TARGET_Y, scaleValue * 9);
  $gameVariables.setValue(TACHIE_VAR_SHOW_Y, scaleValue * 9);
}

//女の子用レイアウト時: 現在衣装の部位によるy座標補正
function applyGirlCostumeOffsetAdjustments(gameActor, afterimageYOffset) {
  const costumeItemId = $gameVariables.value(TACHIE_VAR_EQUIP_ITEM_ID);
  const costumeItem = costumeItemId >= 1 ? $dataItems[costumeItemId] : null;

  if (costumeItem && !costumeItem.meta['TotalCloth']) {
    $gameVariables.setValue(TACHIE_VAR_SHOW_X, $gameVariables.value(TACHIE_VAR_TARGET_X));
  }

  if (costumeItemId == 0) {
    $gameVariables.setValue(TACHIE_VAR_SHOW_X, $gameVariables.value(TACHIE_VAR_TARGET_X) + 50);
    $gameVariables.setValue(TACHIE_VAR_SHOW_Y, $gameVariables.value(TACHIE_VAR_TARGET_Y));
    return afterimageYOffset;
  }

  if ($gameSwitches.value(TACHIE_SWITCH_GIRL_SMALL_SCALE)) return afterimageYOffset;

  const poseYposition = Number(gameActor.actor().meta['TachiePoseYposition']);
  $gameVariables.setValue(TACHIE_VAR_TARGET_Y, $gameVariables.value(TACHIE_VAR_TARGET_Y) - poseYposition);

  const clothSwitchId = costumeItem.meta['ClothSwitch'] ? Number(costumeItem.meta['ClothSwitch']) : 0;
  const offsetAdjustment = getOffsetAdjustment(clothSwitchId);
  if (offsetAdjustment >= 1) { afterimageYOffset = -200; }
  if (offsetAdjustment <= -1) { afterimageYOffset = 200; }

  $gameVariables.setValue(TACHIE_VAR_TARGET_Y, $gameVariables.value(TACHIE_VAR_TARGET_Y) + offsetAdjustment);
  if (!$gameVariables.value(TACHIE_VAR_PREVIOUS_TARGET_Y) == 0) {
    $gameVariables.setValue(TACHIE_VAR_SHOW_Y, $gameVariables.value(TACHIE_VAR_PREVIOUS_TARGET_Y));
    $gameVariables.setValue(TACHIE_VAR_MOVE_WAIT, 60);
  }
  $gameVariables.setValue(TACHIE_VAR_PREVIOUS_TARGET_Y, $gameVariables.value(TACHIE_VAR_TARGET_Y));

  return afterimageYOffset;
}

//立ち絵のy座標をアクターのポーズ設定分だけ上へずらす
function applyTachiePoseYOffset(gameActor) {
  const poseYposition = Number(gameActor.actor().meta['TachiePoseYposition']);
  $gameVariables.setValue(TACHIE_VAR_TARGET_Y, $gameVariables.value(TACHIE_VAR_TARGET_Y) - poseYposition);
  $gameVariables.setValue(TACHIE_VAR_SHOW_Y, $gameVariables.value(TACHIE_VAR_TARGET_Y));
}

//オーラ演出(スイッチ30)時の表示開始位置とウェイト
function applyTachieAuraEffectAdjustments() {
  if (!$gameSwitches.value(TACHIE_SWITCH_AURA_EFFECT)) return;

  $gameVariables.setValue(TACHIE_VAR_SHOW_X, $gameVariables.value(TACHIE_VAR_TARGET_X) + 100); // x軸始点
  $gameVariables.setValue(TACHIE_VAR_MOVE_WAIT, 30); // ウェイト。※変化なし

  if ($gameVariables.value(263) >= 2) {
    $gameVariables.setValue(TACHIE_VAR_SHOW_X, $gameVariables.value(TACHIE_VAR_TARGET_X) - 100); // x軸始点
    $gameVariables.setValue(TACHIE_VAR_MOVE_WAIT, 20); // ウェイト。※変化なし
  }
  if ($gameSwitches.value(143)) {
    $gameVariables.setValue(TACHIE_VAR_SHOW_X, $gameVariables.value(TACHIE_VAR_TARGET_X) - 50); // x軸始点
    $gameVariables.setValue(TACHIE_VAR_MOVE_WAIT, 20); // ウェイト。※変化なし
  }
  $gameVariables.setValue(TACHIE_VAR_SHOW_INITIAL_OPACITY, 50); // 表示最初の透明度
}

//立ち絵本体と残像ピクチャを表示して移動させる
function showStandingPictureWithMotions(gameActor, actorId, afterimageYOffset) {
  //立ち絵1か2か、それとも…
  const tachieIndex = (parseInt(getPreviousTachiePicId(), 10) || 0) - 1; // データ上は0から
  const picDataList = $TKMvar.tachie.PicData;
  if (tachieIndex < 0 || tachieIndex >= picDataList.length) return;

  const pictureId = picDataList[tachieIndex]["picNum"];
  const characterName = picDataList[tachieIndex]["char"];
  const pictureName = "TKMtachie_" + characterName + "_";

  const showX = $gameVariables.value(TACHIE_VAR_SHOW_X);
  const showY = $gameVariables.value(TACHIE_VAR_SHOW_Y);
  const showScaleX = $gameVariables.value(TACHIE_VAR_SHOW_SCALE_X);
  const showScaleY = $gameVariables.value(TACHIE_VAR_SHOW_SCALE_Y);

  const horizontalOffset = showX >= $gameVariables.value(TACHIE_VAR_TARGET_X) ? 200 : -200;
  const effectOverlayOpacity = $gameSwitches.value(TACHIE_SWITCH_AURA_EFFECT) || $gameSwitches.value(TACHIE_SWITCH_GIRL_LAYOUT) ? 50 : 100;

  picture_motion1("smooth", [0]);
  $gameScreen.showPicture(pictureId, pictureName, 1, showX, showY, showScaleX, showScaleY,
    $gameVariables.value(TACHIE_VAR_SHOW_INITIAL_OPACITY), 0);

  showTachieAfterimagePicture(gameActor, actorId, afterimageYOffset, horizontalOffset, effectOverlayOpacity);

  if ($gameScreen.picture(pictureId)) {
    $gameScreen.movePicture(pictureId, 1,
      $gameVariables.value(TACHIE_VAR_TARGET_X),
      $gameVariables.value(TACHIE_VAR_TARGET_Y),
      $gameVariables.value(TACHIE_VAR_TARGET_SCALE_X),
      $gameVariables.value(TACHIE_VAR_TARGET_SCALE_Y),
      $gameVariables.value(TACHIE_VAR_TARGET_OPACITY),
      0, $gameVariables.value(TACHIE_VAR_MOVE_WAIT));
  }
  if ($gameScreen.picture(TACHIE_PIC_AFTERIMAGE)) {
    $gameScreen.movePicture(TACHIE_PIC_AFTERIMAGE, 1,
      $gameVariables.value(TACHIE_VAR_TARGET_X),
      $gameVariables.value(TACHIE_VAR_TARGET_Y),
      $gameVariables.value(TACHIE_VAR_TARGET_SCALE_X),
      $gameVariables.value(TACHIE_VAR_TARGET_SCALE_Y),
      0, 1, $gameVariables.value(TACHIE_VAR_MOVE_WAIT) + 20);
  }

  $gameVariables.setValue(TACHIE_VAR_EQUIP_ACTOR_ID, actorId);
  tachie_bless(pictureId, 1);

  if ($gameSwitches.value(TACHIE_SWITCH_AURA_EFFECT)) {
    tachie_aura1(gameActor); // amygameBattle.jsで定義
  }
}

//残像用ピクチャ(ステート602)の表示
function showTachieAfterimagePicture(gameActor, actorId, afterimageYOffset, horizontalOffset, effectOverlayOpacity) {
  if (!gameActor.isStateAffected(TACHIE_STATE_AFTERIMAGE)) return;
  if ($gameSwitches.value(TACHIE_SWITCH_GIRL_SMALL_SCALE)) return;

  const afterimageName = "/img/tachies/" + 'actor' + actorId + '_1_3';
  $gameScreen.showPicture(TACHIE_PIC_AFTERIMAGE, afterimageName, 1,
    $gameVariables.value(TACHIE_VAR_SHOW_X) + horizontalOffset,
    $gameVariables.value(TACHIE_VAR_SHOW_Y) + afterimageYOffset,
    $gameVariables.value(TACHIE_VAR_SHOW_SCALE_X),
    $gameVariables.value(TACHIE_VAR_SHOW_SCALE_Y),
    effectOverlayOpacity, 1);
}

// 部位IDごとの立ち絵y座標補正値
// Hat IDs: return 100
const hatSlotsSet = new Set([4, 31, 32, 35, 36]);
// Coat/Collar IDs: return -100
const coatSlotsSet = new Set([28, 29]);
// Nipple IDs: return -200
const nippleSlotsSet = new Set([11]);
// Arm IDs: return -300
const armsSlotsSet = new Set([17, 21, 23, 24, 25, 26]);
// Underwear IDs (lower clothing): return -500
const underwearSlotsSet = new Set([7, 14, 20, 22]);
// Shoe IDs: return -1000
const shoesSlotsSet = new Set([18, 27]);

function getOffsetAdjustment(clothSwitchId) {
  if (hatSlotsSet.has(clothSwitchId)) return 100;
  if (coatSlotsSet.has(clothSwitchId)) return -100;
  if (nippleSlotsSet.has(clothSwitchId)) return -200;
  if (armsSlotsSet.has(clothSwitchId)) return -300;
  if (underwearSlotsSet.has(clothSwitchId)) return -500;
  if (shoesSlotsSet.has(clothSwitchId)) return -1000;
  return 0;
}

//#region tachie_settei1 constants
//☆☆立ち絵設定
const standingPictureSlotOffsetsTo0 = [1, 2, 3, 5, 6, 8, 9, 10, 12, 13, 15, 16, 19, 24, 26, 30, 34, 37, 38, 39, 40];
const standingPictureSlotOffsetsTo1 = [5, 9, 10, 15, 31, 33];
const baseFaceExpressions = [1, 1, 1, 1, 1, 2, 5, 6, 15]; // 基本表情
const excitedFaceExpressions = [4, 4, 4, 4, 5, 4, 4, 4, 4, 8]; // 興奮表情
const damageFaceExpressionsMap = {
  1: 9, // 被ダメージ表情変化
  2: 8  // 与ダメージ表情変化
};
const EFFECT_STATE_IDS = [61, 65, 84, 85, 86]; // 発情、自慰、精液
// 発情等の強度(380+actorId[1])別の表情候補。上から順に最初に一致した段階を採用する
const FACE_EXPRESSION_INTENSITY_LEVELS = [
  { minIntensity: 900, options: [29, 30, 31, 32, 37, 38, 39, 40, 41, 42, 43, 44] }, // highest
  { minIntensity: 700, options: [25, 26, 27, 28, 29, 30, 31, 32] },                 // moderate
  { minIntensity: 500, options: [21, 22, 23, 24, 25, 26, 27, 28] },                 // mild
  { minIntensity: 300, options: [17, 18, 19, 20, 21, 22, 23, 24] }                  // low
];
const SIMPLE_FACE_OPTIONS = [17, 18, 19, 20];                                   // Else simple face options
const LOW_FACE_OPTIONS = [17, 18, 19, 20, 21, 22, 23, 24];                     // For intensity >= 300 and low exposure
const HIGHER_FACE_OPTIONS = [29, 30, 31, 32, 37, 38, 39, 40];
const RESTRAINED_FACE_OPTIONS = [37, 38, 39, 40, 41, 42, 43, 44];
const PREGNANCY_FACE_OPTIONS = [21, 22, 23, 24, 25, 26, 27, 28];
// 表情差分の熟練度に使うスキルと閾値
const FACE_MASTERY_SKILL_ID = 50;
const RESTRAINT_MASTERY_LEVEL = 7; // 拘束表情の熟練度閾値
const SWEAT_MASTERY_LEVEL = 5;     // 発汗差分の熟練度閾値
const TACHIE_SETTEI1_BASE_VAR_ID = CLOTHING_PART_VAR_BASE_ID; // 460: tachie_settei1 works on the clothing part variables
const PREGNANCY_PART_IDS = [16, 17, 19, 20, 21, 22, 23, 24, 25, 26, 28];
const BUKKAKE_FACE_EXPRESSIONS = [2, 3, 4];
//#endregion
tachie_settei1 = function (gameActor) {
  //const gameActor = $gameActors.actor($gameVariables.value(20));

  //☆☆立ち絵内部処理前変数割当↓☆☆
  preSetupTachieSettei1(gameActor);

  // ☆☆表情差分↓☆☆
  // Determine the face expression for the character
  const expressionResult = determineFaceExpressionTachieSettei1(gameActor, $gameVariables, $gameSwitches);
  $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 33, expressionResult);

  //☆☆共通パーツ前段↓☆☆
  setModestPoseTachieSettei1(gameActor);

  // 発情＆性欲高い＆戦闘以外＆露出高いで腕グラビアポーズ
  applyGlamourPoseForArousalTachieSettei1(gameActor);

  //☆☆個別衣装設定↓☆☆
  kobetu_isyousettei1(gameActor);

  //☆☆共通パーツ後段↓☆☆
  applyCommonPostProcessingTachieSettei1(gameActor);
};

//#region apply common processing
function applyCommonPostProcessingTachieSettei1(gameActor) {
  // Get actor reference for state-related checks
  //const actor = $gameActors.actor($gameVariables.value(20));

  // Apply adjustments for different body parts and states
  hideBreastsWhenCoveredTachieSettei1();
  hideClothingShadowWhenNoClothesTachieSettei1();
  applyBondageEffectsTachieSettei1();
  handleNipplePiercingVisibilityTachieSettei1();
  handleArmCoverVisibilityTachieSettei1();
  handlePregnancyStateTachieSettei1(gameActor);
  handleFacialFluidEffectsTachieSettei1(gameActor);
  applyTemporaryStateEffectsTachieSettei1(gameActor);
}

// Hide breasts when covered by right arm
function hideBreastsWhenCoveredTachieSettei1() {
  if ($gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 9) === 4) {
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 10, 0);
  }
}

// Hide clothing shadow when no clothes are present
function hideClothingShadowWhenNoClothesTachieSettei1() {
  if ($gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 19) >= 1 &&
    $gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 23) === 0) {
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 19, 0);
  }
}

// Apply special effects for bondage outfit
function applyBondageEffectsTachieSettei1() {
  if ($gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 20) === 11) {
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 10, 1);
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 9, 1);
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 15, 1);
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 24, 0);
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 26, 0);
  }
}

// Handle nipple piercing visibility based on breast visibility
function handleNipplePiercingVisibilityTachieSettei1() {
  if ($gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 10) === 0 &&
    $gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 11) === 1) {
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 111, $gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 11));
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 11, 0);
  }
}

// Handle arm cover visibility based on arm position
function handleArmCoverVisibilityTachieSettei1() {
  // Handle right arm cover
  if ($gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 9) === 4) {
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 117, $gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 17));
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 17, 0);
  }

  // Handle left arm cover
  if ($gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 15) === 4) {
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 126, $gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 26));
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 26, 0);
  }
}

// Handle pregnancy state and visual changes
function handlePregnancyStateTachieSettei1(gameActor) {
  if (!gameActor.isStateAffected(83)) return;

  // Save and reset body part states for pregnancy mode
  saveAndResetBodyPartsForPregnancyTachieSettei1();

  // Set specific pose for pregnancy
  setPregnancyPoseTachieSettei1();

  // Handle clothing adjustments for pregnancy
  handlePregnancyClothingTachieSettei1(gameActor);

  // Handle navel piercing during pregnancy
  handleNavelPiercingDuringPregnancyTachieSettei1();
}

// Save and hide body parts that should be adjusted during pregnancy
function saveAndResetBodyPartsForPregnancyTachieSettei1() {
  for (const partId of PREGNANCY_PART_IDS) {
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + partId + 100,
      $gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + partId));
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + partId, 0);
  }
}

// Set the pose for pregnancy
function setPregnancyPoseTachieSettei1() {
  $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 9, 1);  // Right arm
  $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 10, 1); // Breasts
  $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 15, 1); // Left arm
  $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 12, 2); // Default pregnant belly
}

// Handle clothing adjustment based on exposure during pregnancy
function handlePregnancyClothingTachieSettei1(gameActor) {
  if ($gameVariables.value(380 + gameActor.actorId())[4] >= 5) {
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 28, 1); // Apply coat
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 12, 1); // Change belly appearance
  }
}

// Handle navel piercing appearance during pregnancy
function handleNavelPiercingDuringPregnancyTachieSettei1() {
  if ($gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 14) === 1) {
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 114,
      $gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 14));
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 14, 2); // Change to pregnancy-specific piercing
  }
}

// Handle facial fluid effects based on arm position
function handleFacialFluidEffectsTachieSettei1(actor) {
  if (!actor.isStateAffected(83)) return;

  // Check if arm position is in one of the states that affects fluid appearance
  const isArmInEffectingPosition = BUKKAKE_FACE_EXPRESSIONS.some(function (stateFace) {
    return $gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 9) === stateFace;
  });

  // Update fluid appearance if needed
  if (isArmInEffectingPosition && $gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 40) === 2) {
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 40, 3);
  }
}

// Apply temporary state effects from state metadata
function applyTemporaryStateEffectsTachieSettei1(actor) {
  for (const tempStateId of valueTachieChangeStateTemporary) {
    if (!actor.isStateAffected(tempStateId)) continue;

    // Parse state metadata to get part ID and new value
    const tachieChangeTempMeta = $dataStates[tempStateId].meta['TachieChangeStateTemporary'];
    if (!tachieChangeTempMeta) continue;
    const tachieChangeTempArr = tachieChangeTempMeta.split(',');
    const targetPartId = Number(tachieChangeTempArr[0]);
    const newPartValue = Number(tachieChangeTempArr[1]);

    // Apply the change to the target part
    // NOTE: v1.46 first wrote the variable to itself (a redundant no-op
    // assignment) before overwriting it with the new value; only the new
    // value matters, so the self-assignment is dropped here.
    const targetVariableId = TACHIE_SETTEI1_BASE_VAR_ID + targetPartId;
    $gameVariables.setValue(targetVariableId, newPartValue); // Set new value
  }
}
//#endregion

//#region tachie_settei1 set modest pose
// Apply special arm pose for aroused characters with high exposure
function applyGlamourPoseForArousalTachieSettei1(gameActor) {
  const isAroused = gameActor.isStateAffected(61) || gameActor.isStateAffected(694);
  const hasConfidenceSkill = gameActor.isLearnedSkill(66);
  const notInBattle = !$gameSwitches.value(30);
  const currentExposure = $gameVariables.value(gameActor.actorId() + CLOTHING_EXPOSURE_VAR_BASE_ID)[4];
  const hasHighExposure = currentExposure <= 9;

  if (isAroused && hasConfidenceSkill && notInBattle && hasHighExposure) {
    // Apply glamour pose: left arm relaxed (0), right arm in pose 2
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 15, 0); // Left arm
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 9, 2);  // Right arm
  }
}

function shouldCoverBreastsTachieSettei1() {
  return $gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 21) === 0 &&
    $gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 23) <= 3 &&
    $gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 25) === 0 &&
    $gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 11) === 0;
}

function shouldCoverLowerBodyTachieSettei1() {
  return $gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 20) === 0 &&
    $gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 22) === 0;
}

function setModestPoseTachieSettei1(gameActor) {
  // Apply modest pose for characters not in special states
  if (gameActor.isStateAffected(22)) {
    // Skip pose adjustment for characters in state 22
    return;
  }

  // Set right arm to cover breasts (pose 4)
  if (shouldCoverBreastsTachieSettei1()) {
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 9, 4);
  }

  // Set left arm to cover lower body (pose 4)
  if (shouldCoverLowerBodyTachieSettei1()) {
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 15, 4);
  }
}
//#endregion

//#region tachie_settei1 pre slots setup

function preSetupTachieSettei1(gameActor) {
  // Reset specific slots to 0
  resetStandingPictureSlotsTachieSettei1();

  // Ensure hair has a default value
  ensureDefaultHairValueTachieSettei1();

  // Set specific slots to 1
  setDefaultSlotValuesTachieSettei1();

  // Apply state-based visual effects to the character's standing image
  applyStateBasedVisualEffectsTachieSettei1(gameActor);
}

// Helper function to reset specific slots to 0
function resetStandingPictureSlotsTachieSettei1() {
  standingPictureSlotOffsetsTo0.forEach(function (offset) {
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + offset, 0);
  });
}

// Helper function to ensure hair has a default value
function ensureDefaultHairValueTachieSettei1() {
  if ($gameVariables.value(464) === 0) { // 460 + 4 (hair)
    $gameVariables.setValue(464, 1);
  }
}

// Helper function to set specific slots to 1
function setDefaultSlotValuesTachieSettei1() {
  standingPictureSlotOffsetsTo1.forEach(function (offset) {
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + offset, 1);
  });
}

// Apply visual effects based on the actor's states
function applyStateBasedVisualEffectsTachieSettei1(gameActor) {
  // Arousal/liquid related states
  applyArousalVisualEffectsTachieSettei1(gameActor);

  // Restraint related states
  applyRestraintVisualEffectsTachieSettei1(gameActor);

  // Sweat/wetness related states
  applySweatVisualEffectsTachieSettei1(gameActor);

  // Pregnancy related states
  applyPregnancyVisualEffectsTachieSettei1(gameActor);

  // Sexual fluids related states
  applySexualFluidsVisualEffectsTachieSettei1(gameActor);
}

// Apply arousal-related visual effects
function applyArousalVisualEffectsTachieSettei1(gameActor) {
  if (gameActor.isStateAffected(61) || gameActor.isStateAffected(694)) { // 発情で愛液 (Arousal and love juice)
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 8, 2);
  }
}

// Apply restraint-related visual effects
function applyRestraintVisualEffectsTachieSettei1(gameActor) {
  if (gameActor.isStateAffected(63)) { // 拘束で腕と男 (Restraint affecting arms and male)
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 9, 3);     // Right arm
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 15, 3);    // Left arm
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 17, 0);    // Right arm cover
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 24, 0);    // Leg position
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 26, 0);    // Left arm cover
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 1, 1);     // Body state
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 38, 1);    // Male presence
  }
}

// Apply sweat/wetness-related visual effects
function applySweatVisualEffectsTachieSettei1(gameActor) {
  if (gameActor.isStateAffected(71) || gameActor.isStateAffected(695)) { // 濡れた状態で汗 (Wet state with sweat)
    $gameSwitches.setValue(100, true);
  }
}

// Apply pregnancy-related visual effects
function applyPregnancyVisualEffectsTachieSettei1(gameActor) {
  if (gameActor.isStateAffected(83) || gameActor.isStateAffected(696)) { // 妊娠でボテ腹 (Pregnancy with pregnant belly)
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 12, 1);

    // Change navel piercing appearance during pregnancy
    if ($gameVariables.value(TACHIE_SETTEI1_BASE_VAR_ID + 14) === 1 && gameActor.isStateAffected(83)) { // 臍ピアス妊娠有無で変化
      $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 14, 2);
    }
  }
}

// Apply sexual fluids-related visual effects
function applySexualFluidsVisualEffectsTachieSettei1(gameActor) {
  if (gameActor.isStateAffected(84) || gameActor.isStateAffected(697)) { // 膣内射精 (Vaginal ejaculation)
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 8, 1);
  }

  if (gameActor.isStateAffected(85) || gameActor.isStateAffected(698)) { // 顔射精 (Facial ejaculation)
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 40, 1);
  }

  if (gameActor.isStateAffected(86) || gameActor.isStateAffected(699)) { // ぶっかけ (Bukkake/covered in fluids)
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 40, 2);
  }
}
//#endregion

//#region tachie_settei1 expression setup

// Main function to determine face expression.
// v1.46 evaluated every check in sequence and later matches overwrote earlier ones,
// while the side effects (sweat switch 100, sweat face part 473) run on every call
// regardless of which expression wins - the order below keeps that behavior.
function determineFaceExpressionTachieSettei1(gameActor, $gameVariables, $gameSwitches) {
  let faceExpression = getDefaultExpressionTachieSettei1($gameVariables, $gameSwitches);

  // 露出状態による衣装クリア(下で露出差分を見るために先に実行)
  handleExposureStateTachieSettei1(gameActor, $gameVariables);

  const exposureExpression = getExposureBasedExpressionTachieSettei1(gameActor, $gameVariables, $gameSwitches);
  if (exposureExpression !== null) {
    faceExpression = exposureExpression;
  }

  // 発情、自慰、精液
  const emotionalExpression = getEmotionalExpressionTachieSettei1(gameActor, $gameVariables);
  if (emotionalExpression !== null) {
    faceExpression = emotionalExpression;
  }

  // 拘束
  const restraintExpression = getRestraintExpressionTachieSettei1(gameActor);
  if (restraintExpression !== null) {
    faceExpression = restraintExpression;
  }

  // 妊娠でボテ腹
  const pregnancyExpression = getPregnancyExpressionTachieSettei1(gameActor, $gameSwitches);
  if (pregnancyExpression !== null) {
    faceExpression = pregnancyExpression;
  }

  // 激情
  if (!$gameSwitches.value(143) && gameActor.isStateAffected(68)) {
    $gameSwitches.setValue(100, true);
  }

  // 戦闘中TP100以上
  if (!$gameSwitches.value(143) && $gameSwitches.value(30) && gameActor.tp >= 100) {
    faceExpression = $gameSwitches.value(100) ? 48 : 47;
  }

  // 発汗
  if (gameActor.isStateAffected(693)) {
    $gameSwitches.setValue(100, false);
  }
  if ($gameSwitches.value(100)) {
    // 発汗差分(熟練度で段差)
    $gameVariables.setValue(TACHIE_SETTEI1_BASE_VAR_ID + 13,
      gameActor.skillMasteryLevel(FACE_MASTERY_SKILL_ID) >= SWEAT_MASTERY_LEVEL ? 2 : 1);
  }

  // 立ち絵会話時
  if ($gameSwitches.value(97)) {
    faceExpression = $gameVariables.value(151);
  }

  // ステート固定表情(最後に適用されたものが勝つ)
  const stateFaceExpression = getStateFaceChangeExpressionTachieSettei1(gameActor);
  if (stateFaceExpression !== null) {
    faceExpression = stateFaceExpression;
  }

  $gameSwitches.setValue(100, false);
  return faceExpression;
}

// Function to get expression based on restraint state
function getRestraintExpressionTachieSettei1(gameActor) {
  if (!gameActor.isStateAffected(63)) return null;

  if (gameActor.skillMasteryLevel(FACE_MASTERY_SKILL_ID) >= RESTRAINT_MASTERY_LEVEL) {
    return RESTRAINED_FACE_OPTIONS[getRandomIndex(RESTRAINED_FACE_OPTIONS.length)];
  }
  return SIMPLE_FACE_OPTIONS[getRandomIndex(SIMPLE_FACE_OPTIONS.length)];
}

// Function to get expression based on pregnancy state
function getPregnancyExpressionTachieSettei1(gameActor, $gameSwitches) {
  if ((!$gameSwitches.value(143) && gameActor.isStateAffected(83)) || gameActor.isStateAffected(696)) {
    if (gameActor.skillMasteryLevel(FACE_MASTERY_SKILL_ID) >= RESTRAINT_MASTERY_LEVEL) {
      // 熟練度が高い場合ここでは何もしない(後続の判定に任せる)
      return null;
    }
    return PREGNANCY_FACE_OPTIONS[getRandomIndex(PREGNANCY_FACE_OPTIONS.length)];
  }
  return null;
}

// Function to get expression from the state-fixed face list (later states override earlier ones)
function getStateFaceChangeExpressionTachieSettei1(gameActor) {
  let faceExpression = null;
  for (const stateId of valueTachieChangeState) {
    if (!gameActor.isStateAffected(stateId)) continue;
    const faceChangeMeta = $dataStates[stateId].meta['FaceChange'];
    if (!faceChangeMeta) continue;

    const faceChangeArr = faceChangeMeta.split(',');
    faceExpression = Number(faceChangeArr[getRandomIndex(faceChangeArr.length)]);
  }
  return faceExpression;
}

// Function to get expression based on emotional arousal
function getEmotionalExpressionTachieSettei1(gameActor, $gameVariables) {
  // Check for states related to arousal, etc.
  if (EFFECT_STATE_IDS.some(stateId => gameActor.isStateAffected(stateId))) {
    const exposureData = $gameVariables.value(gameActor.actorId() + CLOTHING_EXPOSURE_VAR_BASE_ID);
    const intensity = exposureData ? exposureData[1] : 0;

    for (const level of FACE_EXPRESSION_INTENSITY_LEVELS) {
      if (intensity >= level.minIntensity) {
        return level.options[getRandomIndex(level.options.length)];
      }
    }
    return SIMPLE_FACE_OPTIONS[getRandomIndex(SIMPLE_FACE_OPTIONS.length)];
  }

  return null;
}

// Function to handle exposure-based expressions
function getExposureBasedExpressionTachieSettei1(gameActor, $gameVariables, $gameSwitches) {
  // Skip if special condition
  const clothingData = $gameVariables.value(gameActor.actorId() + CLOTHING_ACTOR_DATA_VAR_BASE_ID);
  if ($gameVariables.value(207) === 101 ||
    ($gameVariables.value(207) >= 1 &&
      clothingData && $gameVariables.value(207) === clothingData[41])) {
    return null;
  }

  if ($gameSwitches.value(206)) return null;

  const exposureData = $gameVariables.value(gameActor.actorId() + CLOTHING_EXPOSURE_VAR_BASE_ID);
  if (!exposureData) return null;

  let faceExpression = null;
  // Check exposure level against tolerance
  if (exposureData[4] < exposureData[5]) {
    faceExpression = LOW_FACE_OPTIONS[getRandomIndex(LOW_FACE_OPTIONS.length)];
    $gameSwitches.setValue(100, true);
  }

  // Check for low clothing value
  if (exposureData[4] <= 49) {
    const tempClothesValue = exposureData[1];
    const masteryLevel = gameActor.skillMasteryLevel(55);

    $gameSwitches.setValue(100, true);
    if (tempClothesValue >= 500 && masteryLevel >= 4) {
      faceExpression = HIGHER_FACE_OPTIONS[getRandomIndex(HIGHER_FACE_OPTIONS.length)];
    }
  }

  return faceExpression;
}

// Function to get default expressions based on situation
function getDefaultExpressionTachieSettei1($gameVariables, $gameSwitches) {
  // v1.46 drew the base pool first and re-drew for the excited state
  let faceExpression = baseFaceExpressions[getRandomIndex(baseFaceExpressions.length)];
  if ($gameSwitches.value(201) || $gameSwitches.value(239)) { // Excited
    faceExpression = excitedFaceExpressions[getRandomIndex(excitedFaceExpressions.length)];
  }
  if ($gameSwitches.value(30)) { // In battle
    faceExpression = damageFaceExpressionsMap[$gameVariables.value(276)] || 4;
  }
  return faceExpression;
}

// Helper function to handle exposure state
function handleExposureStateTachieSettei1(gameActor, $gameVariables) {
  if (!gameActor.isStateAffected(70)) return;

  const clothingData = $gameVariables.value(gameActor.actorId() + CLOTHING_ACTOR_DATA_VAR_BASE_ID);
  const exposureData = $gameVariables.value(gameActor.actorId() + CLOTHING_EXPOSURE_VAR_BASE_ID);
  if (!clothingData || !exposureData) return;
  if (clothingData[0] >= 1 && exposureData[4] <= 9) {
    clothingData[0] = 0;
  }
}
//#endregion

const TACHIE_VAR_BROKEN_CLOTH_NAME = 243;      //破損した衣装名
const TACHIE_VAR_BROKEN_CLOTH_ITEM_ID = 244;   //破損した衣装アイテムID
const TACHIE_BROKEN_CLOTH_ITEM_ID_START = 1205; //破損衣装の検索開始ID
const TACHIE_HSCENE_FADE_TAG = 'Hscene005';
const TACHIE_BROKEN_PIECE_PART_ID = 42;        //破損切れ端の立ち絵部位
const TACHIE_TORN_CLOTH_SLOT_IDS = [20, 21, 22, 23, 25]; //切れ端を出す部位

//破損時第一段階
clothes_hason1 = function (clothPartSlotIds, isFullReset) {
  const actorId = $gameVariables.value(TACHIE_VAR_EQUIP_ACTOR_ID);
  const actorClothingData = $gameVariables.value(actorId + CLOTHING_ACTOR_DATA_VAR_BASE_ID);

  if (isFullReset >= 1) {
    copyActorClothingToWorkVariables(actorClothingData);
  }

  $gameVariables.setValue(TACHIE_VAR_BROKEN_CLOTH_NAME, 0);
  $gameVariables.setValue(TACHIE_VAR_BROKEN_CLOTH_ITEM_ID, 0);

  const brokenPartSlotId = clothPartSlotIds[getRandomIndex(clothPartSlotIds.length)];
  if (brokenPartSlotId == 1) return;
  if ($gameVariables.value(CLOTHING_PART_VAR_BASE_ID + brokenPartSlotId) < 1) return;

  applyBrokenClothPieceForSlot(brokenPartSlotId, actorId, isFullReset, actorClothingData);
};

//指定部位に一致する破損衣装を探して適用する
function applyBrokenClothPieceForSlot(brokenPartSlotId, actorId, isFullReset, actorClothingData) {
  const clothVarId = CLOTHING_PART_VAR_BASE_ID + brokenPartSlotId;
  const itemCount = $dataItems.length;

  for (var itemIndex = TACHIE_BROKEN_CLOTH_ITEM_ID_START; itemIndex < itemCount; itemIndex++) {
    const item = $dataItems[itemIndex];
    if (brokenPartSlotId != Number(item.meta['ClothSwitch'])) continue;
    if ($gameVariables.value(clothVarId) != Number(item.meta['ClothAllocationNumber'])) continue;
    if (!isBrokenClothItemOfActor(item, actorId)) continue;

    applyBrokenClothItemValues(item, itemIndex, clothVarId, isFullReset);

    //衣装情報を更新
    copyWorkVariablesToActorClothing(actorClothingData);
    break;
  }
}

//破損衣装がこのアクター用(または共通)の物かどうか
function isBrokenClothItemOfActor(item, actorId) {
  const itemEICSwitchNum = Number(item.meta['EICSwitch']);

  return itemEICSwitchNum == 200
    || actorId == itemEICSwitchNum - 180
    || actorId == itemEICSwitchNum - 380;
}

//破損情報(名前、アイテムID、破損段階)を変数へ反映する
function applyBrokenClothItemValues(item, itemIndex, clothVarId, isFullReset) {
  $gameVariables.setValue(TACHIE_VAR_BROKEN_CLOTH_NAME, item.name);
  $gameVariables.setValue(TACHIE_VAR_BROKEN_CLOTH_ITEM_ID, itemIndex);
  $gameSwitches.setValue(143, true);

  if (!item.meta['ClothBreakage']) {
    $gameVariables.setValue(clothVarId, 0);
  } else {
    const itemClothBreakageNum = Number(item.meta['ClothBreakage']);
    if (itemClothBreakageNum != $gameVariables.value(clothVarId)) {
      $gameVariables.setValue(clothVarId, itemClothBreakageNum);
    }
  }

  if (isFullReset >= 1) {
    $gameVariables.setValue(clothVarId, 0);
  }
}

//破損時切れ端ColorHue用
clothes_hason2 = function (brokenPiecePicIdOverride, isTornOff) {
  const item = $dataItems[$gameVariables.value(TACHIE_VAR_BROKEN_CLOTH_ITEM_ID)];
  if (!item) return;

  const itemClothSwitch = item.meta['ClothSwitch'];
  if (!itemClothSwitch) return;

  const actorId = $gameVariables.value(TACHIE_VAR_EQUIP_ACTOR_ID);
  const clothSwitchId = Number(itemClothSwitch);
  const brokenPiecePicId = getBrokenPiecePictureId(brokenPiecePicIdOverride, actorId);
  const pic = $gameScreen.picture(brokenPiecePicId);

  showTornClothPiecePicture(item, pic, actorId, clothSwitchId, isTornOff);

  //切れ端の色調差分は「脱衣」時のみ、対象部位も限定
  if (isTornOff !== 1) return;
  if (TACHIE_TORN_CLOTH_SLOT_IDS.indexOf(clothSwitchId) < 0) return;
  if (!pic) return;
  if (!item.meta['EICSwitch']) return;
  if (!item.meta['ClothAllocationNumber']) return;

  showBrokenPieceHuePictures(item, pic, actorId, clothSwitchId, brokenPiecePicIdOverride, isTornOff);
};

//破損ピース用のピクチャID(0指定時はアクターの立ち絵ピクチャID)
function getBrokenPiecePictureId(brokenPiecePicIdOverride, actorId) {
  if (brokenPiecePicIdOverride != 0) return brokenPiecePicIdOverride;

  const dataActor = $dataActors[actorId];
  return dataActor ? Number(dataActor.meta['tachiePicId']) : 0;
}

//破損した衣装の切れ端を表示する
function showTornClothPiecePicture(item, pic, actorId, clothSwitchId, isTornOff) {
  if (!pic) return;
  if (!item.meta['EICSwitch']) return;
  if (!item.meta['ClothAllocationNumber']) return;

  const pictureX = pic._x;
  const pictureY = pic._y;
  const scaleX = pic._scaleX;
  const scaleY = pic._scaleY;
  const clothAllocationNumber = Number(item.meta['ClothAllocationNumber']);
  const piecePath = "/img/tachies/" + 'actor' + actorId + '_' + clothSwitchId + '_' + clothAllocationNumber;

  $gameScreen.showPicture(valueCountSet1, piecePath, 1, pictureX, pictureY, scaleX, scaleY, 255, 0);

  if (isTornOff == 1) {
    throwBrokenClothPiece(valueCountSet1, pictureX, pictureY, scaleX * 2, scaleY);
  }
  if (isTornOff == 0) {
    dropBrokenClothPiece(valueCountSet1, pictureX, pictureY, scaleX, scaleY);
  }
  valueCountSet1 += 1;
}

//破損ピースを飛ばしながら消す
function throwBrokenClothPiece(pictureId, pictureX, pictureY, scaleX, scaleY) {
  $gameScreen.movePicture(pictureId, 1, pictureX, pictureY, scaleX, scaleY, 0, 0, 60);
  picture_fade1(pictureId, "fadeOut", TACHIE_HSCENE_FADE_TAG, 60, TACHIE_FADE_IN_X);
}

//破損ピースを画面外へ落とす
function dropBrokenClothPiece(pictureId, pictureX, pictureY, scaleX, scaleY) {
  $gameScreen.movePicture(pictureId, 1, pictureX, pictureY + pictureY, scaleX, scaleY, 0, 0, 60);
}

//色調付き破損ピース(部位42)を表示する
function showBrokenPieceHuePictures(item, pic, actorId, clothSwitchId, brokenPiecePicIdOverride, isTornOff) {
  const pictureX = brokenPiecePicIdOverride == 0 ? $gameVariables.value(TACHIE_VAR_TARGET_X) : pic._x;
  const pictureY = pic._y;
  const scaleX = pic._scaleX;
  const scaleY = pic._scaleY;
  const piecePath = "/img/tachies/" + 'actor' + actorId + '_' + TACHIE_BROKEN_PIECE_PART_ID + '_' + clothSwitchId;

  if (item.meta['ColorHue2']) {
    const hueOffset = getBrokenPieceHueOffset(item);
    const hueX = pictureX + hueOffset.x;
    const hueY = pictureY + hueOffset.y;
    //色調差分は左右反転して重ねる
    const mirroredScaleX = -scaleX;
    const mirroredScaleY = -scaleY;

    $gameScreen.showPicture(valueCountSet1, piecePath, 1, hueX, hueY, mirroredScaleX, mirroredScaleY, 255, 0);
    if (isTornOff == 1) {
      throwBrokenClothPiece(valueCountSet1, hueX, hueY, mirroredScaleX, mirroredScaleY);
    } else if (isTornOff == 0) {
      dropBrokenClothPiece(valueCountSet1, hueX, hueY, mirroredScaleX, mirroredScaleY);
    }
    valueCountSet1 += 1;
  }

  //ColorHueの有無によらず表示内容は同じ(色調は別処理で付与される)
  $gameScreen.showPicture(valueCountSet1, piecePath, 1, pictureX, pictureY, scaleX, scaleY, 255, 0);
  if (isTornOff == 1) {
    throwBrokenClothPiece(valueCountSet1, pictureX, pictureY, scaleX, scaleY);
  } else if (isTornOff == 0) {
    dropBrokenClothPiece(valueCountSet1, pictureX, pictureY, scaleX, scaleY);
  }
  valueCountSet1 += 1;
}

//ColorHue2("軸,距離")の距離をx/yどちらへずらすか決める
function getBrokenPieceHueOffset(item) {
  const colorHue2Parts = item.meta['ColorHue2'].split(',');
  const hueAxisSelector = Number(colorHue2Parts[0]);
  const hueOffsetMagnitude = Number(colorHue2Parts[1]);

  if (hueAxisSelector == 1) return { x: hueOffsetMagnitude, y: 0 };
  return { x: 0, y: hueOffsetMagnitude };
}

//着せ替え時統合衣装他処理
const TACHIE_CUSTOM_CHOICE_ID_TOTAL_CLOTH = 1;
const TACHIE_CUSTOM_CHOICE_ID_SINGLE_CLOTH = 2;
const TACHIE_EIC_GLOBAL_ID = 400;
const TACHIE_EIC_ACTOR_ID_OFFSET = 380;
const TACHIE_EIC_ACTOR_ITEM_OFFSET = 180;
const TACHIE_CHOICE_ITEM_SEARCH_START_ID = 1;
const TACHIE_CLOTH_PREVIEW_PIC_ID = 100;
const TACHIE_CHOICE_PREVIEW_PIC_ID_BASE = 100;
const TACHIE_CHOICE_PREVIEW_X = 1200;
const TACHIE_CHOICE_PREVIEW_Y = 550;
const TACHIE_CHOICE_PREVIEW_SCALE = 20;

clothes_change1 = function () {
  const actorId = $gameVariables.value(TACHIE_VAR_EQUIP_ACTOR_ID);
  const itemCount = $dataItems.length;

  valueRandomSet = Array(101).fill(0);

  let choiceIndex = 1;
  for (let itemIndex = TACHIE_CHOICE_ITEM_SEARCH_START_ID; itemIndex < itemCount; itemIndex++) {
    const item = $dataItems[itemIndex];
    if (!$gameParty.hasItem(item)) continue;
    if (!isTotalClothChoiceItem(item, actorId)) continue;

    registerClothChoice(TACHIE_CUSTOM_CHOICE_ID_TOTAL_CLOTH, item, itemIndex);

    valueRandomSet[choiceIndex] = itemIndex;
    choiceIndex++;
  }
};

//統合衣装(着せ替え一覧)の対象アイテムかどうか
function isTotalClothChoiceItem(item, actorId) {
  const itemEicSwitchNum = Number(item.meta['EICSwitch']);

  return itemEicSwitchNum == actorId + TACHIE_EIC_ACTOR_ID_OFFSET
    || itemEicSwitchNum == TACHIE_EIC_GLOBAL_ID;
}

//選択肢として衣装アイテムを登録する
function registerClothChoice(choiceId, item, itemIndex) {
  const choiceParams = {
    text: item.name,
    value: itemIndex
  };

  $gameSystem.addCustomChoice(choiceId, choiceParams);
}

//着せ替え時単品目処理
clothes_change2 = function () {
  const actorId = $gameVariables.value(TACHIE_VAR_EQUIP_ACTOR_ID);
  const itemCount = $dataItems.length;
  const selectedItem = $dataItems[$gameVariables.value(TACHIE_VAR_EQUIP_ITEM_ID)];
  if (!selectedItem) return;

  $gameScreen.showPicture(TACHIE_CLOTH_PREVIEW_PIC_ID, '/img/tachies/actor' + actorId + '_5_99', 1,
    TACHIE_CHOICE_PREVIEW_X, TACHIE_CHOICE_PREVIEW_Y, TACHIE_CHOICE_PREVIEW_SCALE, TACHIE_CHOICE_PREVIEW_SCALE, 200, 0);

  valueRandomSet = Array(201).fill(0);

  let choiceIndex = 1;
  for (let itemIndex = TACHIE_CHOICE_ITEM_SEARCH_START_ID; itemIndex < itemCount; itemIndex++) {
    const item = $dataItems[itemIndex];
    if (!$gameParty.hasItem(item)) continue;
    if (selectedItem.meta['subCategory'] != item.meta['subCategory']) continue;
    if (!isSingleClothChoiceItem(item, actorId)) continue;

    registerClothChoice(TACHIE_CUSTOM_CHOICE_ID_SINGLE_CLOTH, item, itemIndex);
    registerClothChoicePreviewPicture(item, actorId, choiceIndex);

    valueRandomSet[choiceIndex] = itemIndex;
    choiceIndex++;
  }
};

//単品衣装(部位選択)の対象アイテムかどうか
function isSingleClothChoiceItem(item, actorId) {
  const itemEicSwitchNum = Number(item.meta['EICSwitch']);
  const actorEicSwitchId = actorId + TACHIE_EIC_ACTOR_ID_OFFSET;

  return itemEicSwitchNum == actorEicSwitchId
    || itemEicSwitchNum == TACHIE_EIC_GLOBAL_ID
    || itemEicSwitchNum == actorEicSwitchId - 200
    || itemEicSwitchNum == TACHIE_EIC_GLOBAL_ID - 200;
}

//単品衣装の選択肢用プレビューピクチャを表示する
function registerClothChoicePreviewPicture(item, actorId, choiceIndex) {
  if (item.meta['TotalCloth']) return;

  const clothAllocationNumber = Number(item.meta['ClothAllocationNumber']);
  if (clothAllocationNumber < 1) return;

  const previewPicId = choiceIndex + TACHIE_CHOICE_PREVIEW_PIC_ID_BASE;
  const previewPath = "/img/tachies/" + 'actor' + actorId + '_' + Number(item.meta['ClothSwitch']) + '_' + clothAllocationNumber;

  $gameScreen.showPicture(previewPicId, previewPath, 1,
    TACHIE_CHOICE_PREVIEW_X, TACHIE_CHOICE_PREVIEW_Y, TACHIE_CHOICE_PREVIEW_SCALE, TACHIE_CHOICE_PREVIEW_SCALE, 0, 0);
  $gameMessage.setSelectPictureId(choiceIndex - 1, previewPicId);
}

//衣装取得
const TACHIE_CLOTH_GET_ITEM_ID_START = 1301;

clothes_get = function (id, subCategory, clothType) {
  $gameVariables.setValue(TACHIE_VAR_EQUIP_ACTOR_ID, id);

  const items = $dataItems;
  const itemsCount = items.length;
  const actorEicSwitchId = id + TACHIE_EIC_ACTOR_ID_OFFSET;

  for (let itemIndex = TACHIE_CLOTH_GET_ITEM_ID_START; itemIndex < itemsCount; itemIndex++) {
    const item = items[itemIndex];
    if (!isClothItemObtainableByActor(item.meta['EICSwitch'], actorEicSwitchId)) continue;
    if (item.meta['subCategory'] != subCategory) continue;
    if (item.meta['ClothType'] != clothType) continue;

    $gameParty.gainItem(item, 1);
  }
};

//衣装アイテムの入手条件を満たすか(EICSwitchの値で判定)
function isClothItemObtainableByActor(eicSwitchMeta, actorEicSwitchId) {
  const itemEICSwitchNum = Number(eicSwitchMeta);

  return actorEicSwitchId == itemEICSwitchNum
    || actorEicSwitchId - 200 == itemEICSwitchNum
    || 200 == itemEICSwitchNum
    || TACHIE_EIC_GLOBAL_ID == itemEICSwitchNum;
}

get_and_cofig_girls_standing_pic = function () {
  const battlers = $gameParty.battleMembers();
  const battlersCount = battlers.length;

  for (let memberIndex = 0; memberIndex < battlersCount; memberIndex++) {
    const memberActor = battlers[memberIndex];
    if (!isGirl(memberActor)) continue; // 女のみ, girls only

    $gameVariables.setValue(TACHIE_VAR_EQUIP_ACTOR_ID, memberActor.actorId());
    tachie_settei3(memberActor);
  }
}

//}());
