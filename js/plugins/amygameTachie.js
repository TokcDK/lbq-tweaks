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

//立ち絵会話衣装を実際の立ち絵に反映させる。回想時は自動でoff
tachie_clothReflect = function (actorId) {

  if (!$gameSwitches.value(29)) {
    const targetClothingData = $gameVariables.value(actorId + 540);
    const sourceClothingData = $gameVariables.value(actorId + 440);
    if (!targetClothingData || !sourceClothingData) return;
    for (var i = 0; i <= 42; i++) {
      targetClothingData[i] = sourceClothingData[i];
    }
  }

};

//立ち絵ムーブ。
picTachie_move1 = function (picId, offsetX, offsetY, scaleOffsetX, scaleOffsetY, targetOpacity, moveDuration) {
  if (typeof picId !== 'number' || picId < 1) {
    console.warn("Invalid picId:", picId);
    return;
  }
  const picture = $gameScreen.picture(picId);
  if (picture) {
    const newX = picture.x() + (Number(offsetX) || 0);
    const newY = picture.y() + (Number(offsetY) || 0);
    const newScaleX = picture.scaleX() + (Number(scaleOffsetX) || 0);
    const newScaleY = picture.scaleY() + (Number(scaleOffsetY) || 0);
    const pictureOrigin = picture.origin();
    $gameScreen.movePicture(picId, pictureOrigin, newX, newY, newScaleX, newScaleY, Number(targetOpacity) || 255, 0, Number(moveDuration) || 60);
  }
};

//衣装状態でスイッチオンオフ.<EvStartCloth:1,1>と併用
tachie_switchOnOff = function (id) {

  if (id !== 1) return;
  const clothingData = $gameVariables.value(440 + id);
  if (!clothingData) return;
  $gameSwitches.setValue(601, clothingData[20] == 0);

};

//立ち絵演出クリアも。1実行0終了
tachie_partDirectSet = function(pictureId, enableFlag, particleType) {
  // Early return if particleType is not valid (1 or 2)
  if (particleType !== 1 && particleType !== 2) return;
  
  // Cache particle name for better performance
  const particleName = particleType === 1 ? 'actor_particleLight' : 'enemy_particleDark';
  
  if (enableFlag === 1) {
    // Create sound effect configuration object only once
    const soundConfig = {
      name: particleType === 1 ? "Up1" : "Down4",
      volume: 90,
      pitch: particleType === 1 ? 110 : 90,
      pan: 0
    };
    
    // Flash with appropriate color
    $gameScreen.startFlash(
      particleType === 1 ? [255, 255, 255, 200] : [0, 0, 0, 200], 
      120
    );
    
    // Play sound effect
    AudioManager.playSe(soundConfig);
    
    // Set particle with target as picture ID
    $gameScreen._particle.particleSet(
      0, 
      particleName, 
      'picture:' + pictureId, 
      'def', 
      'screen'
    );
  } else {
    // Clear particle effect when disabling
    $gameScreen._particle.particleClear(particleName);
  }
};

//ピクチャの動き方設定
picture_easingConfiguration = function (easingValue) {

  $gameTemp._easingX = easingValue;
  $gameTemp._easingY = easingValue;
  $gameTemp._easingSx = easingValue;
  $gameTemp._easingSy = easingValue;
  $gameTemp._easingOp = easingValue;

};

//☆立ち絵会話最初の設定
tachie_kaiwastart = function (isHurry, isZoom, leftActorCount, rightActorCount) {

  $gameSwitches.setValue(127, isHurry);//急ぎtrue通常false
  $gameSwitches.setValue(126, isZoom)//拡大true通常false
  $gameVariables.setValue(152, rightActorCount);//右登場人数
  $gameVariables.setValue(153, leftActorCount);//左登場人数
  $gameSwitches.setValue(5, false);//スキップon。手前のコモンでスイッチonにしているため
  $gameScreen.showPicture(5, 'ScreenBlackOut', 1, 640, 384, 100, 100, 25, 0);
  picture_fade1(5, "fadeIn", valueWipeImg, 60, 5);


};

//☆立ち絵会話衣装破損設定//ｱｸﾀｰID,破損部位,ﾋﾟｸID,1で全損0で破損、101は破損CG表示ﾋﾟｸID始点,id5が1で破損、0で脱衣
tachie_clothesHason = function (actorId, clothPartSlotId, pictureId, isFullReset, isTornOff) {

  $gameVariables.setValue(20, actorId);
  clothes_hason1([clothPartSlotId], isFullReset);
  $gameSwitches.setValue(143, false);
  if ($gameVariables.value(244) >= 1) {
    clothes_hason2(pictureId, isTornOff);
    if (isTornOff == 1) {
      $gameScreen.startFlash([255, 255, 255, 170], 20);
      AudioManager.playSe({ "name": "Collapse2", "volume": 50, "pitch": 130, "pan": 0 });
      $gameScreen.shakePicture(pictureId, 3, 9, 0, 20);
    }
    else if (isTornOff == 0) {
      AudioManager.playSe({ "name": "Z_ClothesTakeOff", "volume": 150, "pitch": 110, "pan": 0 });
    }
  }

};

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
tachie_dousa = function (actionType, actorParameter, expressionCode, targetPicId, sourcePicId, showCostumeId, changeCostumeId, changeCostumeParam, unusedParam) {

  // Set a temporary switch flag to indicate processing is underway
  $gameSwitches.setValue(97, true);

  // Determine initial X offset based on the source picture ID
  initialXOffset = sourcePicId == 0 ? 50 : -50;

  // Set easing function and fade duration based on switch 127 (which may indicate a special mode)
  const result1 = getEasingAndFadeValuesTachieDousa();
  const easingFunction = result1.easingFunction;
  const fadeDuration = result1.fadeDuration;

  const result2 = calculateScaleAndPositionTachieDousa(actorParameter, targetPicId, expressionCode);
  const picY = result2.picY;
  const picScaleX = result2.picScaleX;
  const picScaleY = result2.picScaleY;

  // Replace the original selection placeholder code with:
  const dollStateFlag = checkDollStateTachieDousa(actionType, valueDollStateId);

  // If not in doll state, proceed with action-specific processing
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
  $gameSwitches.setValue(97, false);
};

function checkDollStateTachieDousa(actionType, dollStateId) {
  // Check if the actor is in a doll state for certain action types (1,3,4,5)
  let flag = 0;
  // PERF: indexOf instead of .some(closure) — this is called on every
  // tachie_dousa() (the 4th most-referenced function in the project).
  if (actionItemIdsTachieDousa.indexOf(actionType) >= 0) {
    const actor = $gameActors.actor($gameVariables.value(20));
    if (actor && actor.isStateAffected(dollStateId)) {
      flag = 1;
    }
  }
  return flag;
}

function getEasingAndFadeValuesTachieDousa() {
  let easingFunction, fadeDuration;
  picture_motion1("smooth", [0]);
  if ($gameSwitches.value(127)) {
    easingFunction = 'easeOutBack';
    fadeDuration = 40;
  } else {
    easingFunction = 'easeInOutQuad';
    fadeDuration = 60;
  }
  return { easingFunction, fadeDuration };
}

function processCostumeChangeAnimationAtype0TachieDousa(actorParameter, showCostumeId, changeCostumeId, changeCostumeParam, targetPicId, sourcePicId, expressionCode) {
  // Determine move durations based on costume change flag
  let primaryMoveDuration = changeCostumeId === 0 ? 60 : changeCostumeId + changeCostumeId;
  let fadeDelayDuration = changeCostumeId === 0 ? 30 : changeCostumeId;

  // Cache source picture values for smooth transition
  let sourcePic = $gameScreen.picture(sourcePicId);
  if (sourcePic) {
    let originalOrigin = sourcePic.origin();
    let originalX = sourcePic.x();
    let originalY = sourcePic.y();
    let originalScaleX = sourcePic.scaleX();
    let originalScaleY = sourcePic.scaleY();
    let originalOpacity = sourcePic.opacity();

    // If temporary values were set by previous operations, use them instead
    if (valueTacieSet[0] >= 1) {
      originalOrigin = valueTacieSet[0];
      originalX = valueTacieSet[1];
      originalY = valueTacieSet[2];
      originalScaleX = valueTacieSet[3];
      originalScaleY = valueTacieSet[4];
      originalOpacity = valueTacieSet[5];
      valueTacieSet = [0, 0, 0, 0, 0, 0];
    }

    // For numeric actorParameter, perform costume change or setup routine
    if (actorParameter >= 1) {
      if (showCostumeId >= 1) {
        kisekae_tyokusetusitei(showCostumeId, expressionCode);
      } else {
        tachie_settei2();
      }
      const targetPic = $gameScreen.picture(targetPicId);
      if (targetPic) {
        targetPic._origin = originalOrigin;
        targetPic._x = originalX;
        targetPic._y = originalY;
        targetPic._scaleX = originalScaleX;
        targetPic._scaleY = originalScaleY;
        targetPic._opacity = 0;
      }
    } else {
      // Otherwise, erase target picture and then show a new picture
      let targetPic = $gameScreen.picture(targetPicId);
      if (targetPic) {
        $gameScreen.erasePicture(targetPicId);
      }
      if (typeof actorParameter === 'string' && actorParameter.trim() !== '') {
        $gameScreen.showPicture(
          targetPicId,
          "/img/tachies/" + actorParameter,
          originalOrigin,
          originalX,
          originalY,
          originalScaleX,
          originalScaleY,
          0,
          0
        );
      } else {
        console.warn("Invalid actorParameter for image path:", actorParameter);
        $gameScreen.erasePicture(targetPicId); // Fallback to avoid crash
      }
    }

    // Process costume change animation if the parameter is set
    if (changeCostumeParam >= 1) {
      if (targetPicId >= sourcePicId) {
        $gameScreen.movePicture(targetPicId, originalOrigin, originalX, originalY, originalScaleX, originalScaleY, originalOpacity, 0, fadeDelayDuration);
        picture_fade1(targetPicId, "fadeIn", 'Hpicture2', fadeDelayDuration, 5);
        $gameScreen.movePicture(sourcePicId, originalOrigin, originalX, originalY, originalScaleX, originalScaleY, 0, 0, primaryMoveDuration);
      } else {
        $gameScreen.movePicture(targetPicId, originalOrigin, originalX, originalY, originalScaleX, originalScaleY, originalOpacity, 0, fadeDelayDuration);
        picture_fade1(sourcePicId, "fadeOut", 'Hpicture2', primaryMoveDuration, 5);
      }
    } else {
      // Default movement and fade for costume change
      $gameScreen.movePicture(targetPicId, originalOrigin, originalX, originalY, originalScaleX, originalScaleY, originalOpacity, 0, fadeDelayDuration);
      $gameScreen.movePicture(sourcePicId, originalOrigin, originalX, originalY, originalScaleX, originalScaleY, 0, 0, primaryMoveDuration);
    }

    // Additional blessing effect if switch 126 is enabled
    if ($gameSwitches.value(126)) {
      tachie_bless(targetPicId, 0);
    }

    // Update event graphics if variable 292 holds a valid event ID for the actor
    const dynamicallyGeneratedEventIds = $gameVariables.value(292); // Use the dynamically generated ID array for events
    const actorId = $gameVariables.value(20);
    if (dynamicallyGeneratedEventIds !== 0 && dynamicallyGeneratedEventIds[actorId] >= 1) {
      const event = $gameMap.event(dynamicallyGeneratedEventIds[actorId]);
      const actor = $gameActors.actor(actorId);
      if (event && actor) {
        event.setImage(actor.characterName(), actor.characterIndex());
      }
    }
  }
}

function calculateScaleAndPositionTachieDousa(actorParameter, targetPicId, expressionCode) {
  const isScaled = $gameSwitches.value(126);
  let picY, picScaleX, picScaleY;

  // Check if actorParameter is numeric (including 0)
  if ((typeof actorParameter === 'number' || (!isNaN(actorParameter) && actorParameter !== null)) && actorParameter >= 0) {
    $gameVariables.setValue(20, actorParameter);
    $gameVariables.setValue(300, targetPicId);
    $gameVariables.setValue(151, expressionCode); // Set expression code

    // Use general configuration for numeric actorParameter
    const { scale, y } = scaleConfigGeneral1TachieDousaMap[isScaled];
    picScaleY = picScaleX = scale;
    picY = y;
  } else {
    // Use textual configuration if actorParameter is not numeric
    const { scale, y } = scaleConfigGeneral2TachieDousaMap[isScaled];
    picScaleY = picScaleX = scale;
    picY = y;

    // PERF: String(actorParameter) was rebuilt for each of the four tests below.
    const actorParameterText = String(actorParameter);
    if (actorParameterText.match(/SS/)) {
      const { scale, y } = scaleConfigSSTachieDousaMap[isScaled];
      picScaleY = picScaleX = scale;
      picY = y;
    }
    if (actorParameterText.match(/Upper/)) {
      picY = 384;
    }
    if (actorParameterText.match(/Scale/)) {
      picScaleX = 100;
      picY = 384;
    }
    if (actorParameterText.match(/State/)) {
      picScaleY = picScaleX = 100;
      picY = 384;
    }
  }

  return { picY, picScaleX, picScaleY };
}

function animatePictureAtype1TachieDousa(targetPicId, actorParameter, sourcePicId, showCostumeId, easingFunction, picY, picScaleX, picScaleY, fadeDuration) {
  // Retrieve the target picture object

  // Set initial opacity based on costume show parameter
  let initialOpacity = showCostumeId;
  if (actorParameter >= 1) {
    tachie_settei2();
  } else {
    let initialX;
    if (sourcePicId === 0) initialX = 690; // 640 + 50
    else if (sourcePicId === 1) initialX = 400; // 300 + 100
    else if (sourcePicId === 2) initialX = 0; // 100 - 100
    else initialX = 100; // Default

    // Show a new picture using actorParameter as image name
    if (typeof actorParameter === 'string' && actorParameter.trim() !== '') {
      $gameScreen.showPicture(targetPicId, "/img/tachies/" + actorParameter, 1, initialX, picY, picScaleX, picScaleY, 0, 0);
    } else {
      console.warn("Invalid actorParameter for image path:", actorParameter);
      $gameScreen.erasePicture(targetPicId);
    }
  }

  // Cache target picture attributes for consistency
  const targetPic = $gameScreen.picture(targetPicId);
  if(!targetPic) {
    return;
  }
  targetPic._origin = 1;
  targetPic._y = picY;
  targetPic._scaleY = picScaleY;
  targetPic._opacity = 0;

  let targetXPos = (sourcePicId === 1) ? 300 : 100;
  // Adjust based on sourcePicId values
  if (sourcePicId === 0) {
    targetXPos = 640;
    targetPic._x = 690; // 640 + 50
  }
  if (sourcePicId === 1) {
    if ($gameVariables.value(152) === 0) {
      targetXPos = 1124; // 1024 + 100
    } else {
      targetXPos = 1280 - targetXPos + $gameVariables.value(164) - ($gameVariables.value(152) * 80);
    }
    if ($gameSwitches.value(126)) targetXPos += 50;
    targetPic._x = targetXPos + 100;
    $gameVariables.setValue(164, $gameVariables.value(164) + 150);
  }
  if (sourcePicId === 2) {
    targetXPos = targetXPos + $gameVariables.value(165) + ($gameVariables.value(153) * 80);
    targetPic._x = targetXPos - 100;
    // picScaleX = picScaleX - picScaleX - picScaleX equals negative picScaleX
    picScaleX = -picScaleX;
    $gameVariables.setValue(165, $gameVariables.value(165) - 150);
  }
  targetPic._scaleX = picScaleX;

  // Animate moving the picture into position using the calculated parameters
  $gameScreen.movePicture(targetPicId, 1, targetXPos, picY, picScaleX, picScaleY, initialOpacity, 0, fadeDuration);

  if ($gameSwitches.value(126)) {
    tachie_bless(targetPicId, 0);
  }
}

function processCostumeChangeAtype2TachieDousa(targetPicId, changeCostumeId, changeCostumeParam) {
  // Cache targetPic attributes for reuse in the costume change
  const targetPic = $gameScreen.picture(targetPicId);
  if(!targetPic) {
    return;
  }
  
  const cachedAttributes = [
    targetPic.origin(),
    targetPic.x(),
    targetPic.y(),
    targetPic.scaleX(),
    targetPic.scaleY(),
    targetPic.opacity()
  ];

  // Execute costume change routine either by direct specification or default settings
  if (changeCostumeId >= 1) {
    kisekae_tyokusetusitei(changeCostumeId, changeCostumeParam);
  } else {
    tachie_settei2();
  }

  // Update event image if applicable
  if ($gameVariables.value(292) != 0) {
    if ($gameVariables.value(292)[$gameVariables.value(20)] >= 1) {
      const event = $gameMap.event($gameVariables.value(292)[$gameVariables.value(20)]);
      const actor = $gameActors.actor($gameVariables.value(20));
      if (event && actor) {
        event.setImage(actor.characterName(), actor.characterIndex());
      }
    }
  }

  // Restore cached picture attributes back to the target picture
  targetPic._origin = cachedAttributes[0];
  targetPic._x = cachedAttributes[1];
  targetPic._y = cachedAttributes[2];
  targetPic._scaleX = cachedAttributes[3];
  targetPic._scaleY = cachedAttributes[4];
  targetPic._opacity = cachedAttributes[5];
}

function updateStandingPictureAtype3TachieDousa(targetPicId) {
  // Calculate index for tachie picture data (adjusting from 1-indexed to zero-indexed)
  let standPicIndex = parseInt(targetPicId, 10) || 0;
  standPicIndex--;
  if (standPicIndex !== -1) {
    // If tachie data exists for this index, update the picture using tachie metadata
    if ($TKMvar.tachie.PicData.length > standPicIndex) {
      if ($TKMvar.tachie.PicData[standPicIndex]["char"]) {
        const PicData = $TKMvar.tachie.PicData;
        const pictureId = PicData[standPicIndex]["picNum"];
        const char = PicData[standPicIndex]["char"];
        const name = "TKMtachie_" + char + "_";
        const x = PicData[standPicIndex]["x"];
        const y = PicData[standPicIndex]["y"];
        // Show the standing picture with updated attributes
        $gameScreen.showPicture(pictureId, name, 0, x, y, 85, 85, 0, 0);
      }
    }
  }
  // Restore target picture properties from cached values
  const targetPic = $gameScreen.picture(targetPicId);
  if (targetPic) {
    targetPic._origin = valueTacieSet[0];
    targetPic._x = valueTacieSet[1];
    targetPic._y = valueTacieSet[2];
    targetPic._scaleX = valueTacieSet[3];
    targetPic._scaleY = valueTacieSet[4];
    targetPic._opacity = valueTacieSet[5];
  }
  // Finalize picture settings with a set function (likely updating fade and opacity)
  pic_set(targetPicId, 1, 255, 10);
  // Clear cached temporary values
  valueTacieSet = [0, 0, 0, 0, 0, 0];
}

//☆☆着せ替え直接指定
kisekae_tyokusetusitei = function (itemId, relatedSwitchId) {

  const actor = $gameActors.actor($gameVariables.value(20));
  if (!actor) return;
  $gameVariables.setValue(19, itemId);
  if (!$dataItems[itemId]) return;
  if (!$gameParty.hasItem($dataItems[itemId])) {
    $gameParty.gainItem($dataItems[itemId], 1);
    for (var i = 1; i <= 9; i++) {
      if ($dataItems[itemId].meta['SubstituteGetItem' + 1]) {
        $gameParty.gainItem($dataItems[Number($dataItems[itemId].meta['SubstituteGetItem' + 1])], 1);
      };
    };
    if ($dataItems[itemId].meta['TotalCloth'] && $dataItems[itemId].meta['subCategory'] && $dataItems[itemId].meta['ClothType']) {
      clothes_get($gameVariables.value(20), $dataItems[itemId].meta['subCategory'], $dataItems[itemId].meta['ClothType']);
    };
  };
  //現在衣装を呼び出し
  var start = 1; var end = 40;
  for (var i = start; i <= end; i++) {
    $gameVariables.setValue(i + 460, $gameVariables.value($gameVariables.value(20) + 440)[i]);
  };

  if ($dataItems[$gameVariables.value(19)].meta['ClothSpecify']) {
    $gameVariables.value($gameVariables.value(20) + 440)[41] = Number($dataItems[$gameVariables.value(19)].meta['TotalCloth']);
    $gameVariables.value($gameVariables.value(20) + 440)[0] = $gameVariables.value(19);
    //現在衣装を初期化
    var start = 1; var end = 40;
    for (var i = start; i <= end; i++) {
      $gameVariables.setValue(i + 460, 0);
    };
    $gameVariables.setValue(465, Number($dataItems[$gameVariables.value(19)].meta['ClothSpecify']));
    if (relatedSwitchId >= 1) {
      $gameVariables.setValue(493, relatedSwitchId);
    };
    actor.addState(23);
  } else {
    actor.removeState(23);
    kisekae_naibusyori1();
  };

  //衣装情報を更新
  var start = 1; var end = 40;
  for (var i = start; i <= end; i++) {
    $gameVariables.value($gameVariables.value(20) + 440)[i] = $gameVariables.value(i + 460);
  }
  tachie_settei3(actor);

};

//☆☆着せ替え内部処理一部
kisekae_naibusyori1 = function () {

  const gameVar20 = $gameVariables.value(20);
  const gameVar20_440 = gameVar20 + 440;
  const gameVar19 = $gameVariables.value(19);
  const item_gameVar19 = $dataItems[gameVar19];
  const clothTypeId460 = 460;

  if (!item_gameVar19) return;
  const actorClothingData = $gameVariables.value(gameVar20_440);
  if (!actorClothingData) return;

  $gameVariables.value(gameVar20_440)[0] = 0;
  if (item_gameVar19.meta['TotalCloth']) {
    $gameVariables.value(gameVar20_440)[41] = Number(item_gameVar19.meta['TotalCloth']);
    $gameVariables.value(gameVar20_440)[0] = gameVar19;
    //現在衣装を初期化
    for (var i = 1; i <= 40; i++) if (i !== 4) $gameVariables.setValue(i + clothTypeId460, 0);

    if (item_gameVar19.meta['subCategory'] !== '全裸') {
      const gameVar20_380 = gameVar20 + 380;
      for (let clothTypeName of ['通常', item_gameVar19.meta['ClothType']]) {
        const max = $dataItems.length;
        for (var i = 1101; i < max; i++) {
          const item = $dataItems[i];
          if (item.meta['ClothType'] !== clothTypeName) continue;
          const itemEICSwitchNum = Number(item.meta['EICSwitch']);
          if (gameVar20_380 == itemEICSwitchNum
            || gameVar20 + 180 == itemEICSwitchNum
            || 200 == itemEICSwitchNum
            || 400 == itemEICSwitchNum) {
            if (item.meta['subCategory'] === item_gameVar19.meta['subCategory']) {
              const clothSwitchId = Number(item.meta['ClothSwitch']);
              const clothAllocationNumber = Number(item.meta['ClothAllocationNumber']);
              $gameVariables.setValue(clothTypeId460 + clothSwitchId, clothAllocationNumber);
            }
          }
        };
      }
    };
  } else {
    const clothSwitchId = Number(item_gameVar19.meta['ClothSwitch']);
    const clothAllocationNumber = Number(item_gameVar19.meta['ClothAllocationNumber']);
    $gameVariables.setValue(clothTypeId460 + clothSwitchId, $gameVariables.value(clothTypeId460 + clothSwitchId) == clothAllocationNumber ? 0 : clothAllocationNumber);
  };

};

//☆☆立ち絵設定。本体
// 立ち絵パーツ変数の基準ID(衣装パーツ1..40は460+スロット、人形用の一時保存は560+スロット)
const CLOTHING_PART_VAR_BASE_ID = 460;
const CLOTHING_TEMP_VAR_BASE_ID = 560;
const CLOTHING_PART_SLOT_COUNT = 40;

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
  const actorClothingData = $gameVariables.value(actorId + 440);
  const actorExposureData = $gameVariables.value(actorId + 380);
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

// 衣装関連のグローバル値を更新する(女性キャラのみ)
function updateClothingGlobals(gameActor, actorClothingData) {
  const actorId = gameActor.actorId();
  valueLiningCloth[actorId] = actorClothingData[2];
  valueBackHairCloth[actorId] = gameActor.isStateAffected(23) ? 1 : actorClothingData[4];
  valueCoatCloth[actorId] = actorClothingData[28];
  valueFrontHairCloth[actorId] = actorClothingData[32];
  const bustUpClothValue = actorClothingData[41];
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
    const fixedCostumeData = $gameVariables.value(actorId + 440);
    if (!fixedCostumeData) return;
    const currentItem = $dataItems[fixedCostumeData[0]];
    if (currentItem) {
      set_charachip_graphics(currentItem.meta);
    }

  } else {
    const exposureData = $gameVariables.value(actorId + 380);
    const charachipDataArr = $gameVariables.value(actorId + 440);
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
  const actorEicSwitchId = actorId + 380;
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

//☆☆立ち絵内部処理。本体
tachie_naibusyori2 = function (gameActor) {
  if (!gameActor) return;
  const dataActor = gameActor.actor();
  if (!dataActor) return;

  const actorId = gameActor.actorId();
  const actorCharName = 'actor' + actorId;

  // Set character name for standing image
  $gameVariables.setValue(118, actorCharName);

  // Determine the picture ID to use
  // NOTE: v1.46 used the conversation picture id (var 300) while switch 90 was on;
  // the current build always resolves the picture id from the actor database.
  //const isSwitch90On = $gameSwitches.value(90); // 立ち絵会話時自動on
  //const actorPicId = getPreviousTachiePicId(); // 立ち絵表示時ﾋﾟｸﾁｬ指定ID
  // const picId = isSwitch90On
  //   ? actorPicId
  //   : Number(dataActor.meta['tachiePicId']);
  const picId = Number(dataActor.meta['tachiePicId']); // after input gameActor added we get picId only from dataActor
  $gameVariables.setValue(117, picId);

  // Calculate the zero-based tachie number
  const tachieIndex = picId > 0 ? picId - 1 : -1;

  // Get references to avoid repeated lookups
  const tachieData = $TKMvar.tachie;
  const charList = tachieData.CharList;
  const picData = tachieData.PicData;

  // Initialize character parts if switch 20 is ON
  const isPartsInitSwitchOn = $gameSwitches.value(20);
  if (isPartsInitSwitchOn) {
    // Process each clothing part
    runTachieLoop(partSlot => $gameVariables.value(partSlot + CLOTHING_PART_VAR_BASE_ID), partSlot => $gameVariables.value(partSlot + CLOTHING_PART_VAR_BASE_ID) >= 0);

    // Clear previous picture if it exists
    if (tachieIndex !== -1 && tachieIndex < picData.length) {
      $gameScreen.erasePicture(picData[tachieIndex].picNum);
    }

    // Initialize character parts array
    charList[actorCharName] = Array(tachieData.MaxLayer).fill(0);
  }

  // Handle state 19 (clear standing picture)
  if (gameActor.isStateAffected(19)) {
    //tachie_clear(picId); // undefined function
    warnMissingTachieClearTachieNaibusyori2();
    runTachieLoop(() => 0);
  } else {
    // Normal case: apply clothing parts
    runTachieLoop(partSlot => $gameVariables.value(partSlot + CLOTHING_PART_VAR_BASE_ID));
  }

  // Check if we need to change the character's standing image
  if (tachieIndex !== -1) {
    // Update character data if different from current
    const currentChar = tachieIndex < picData.length ? picData[tachieIndex].char : null;

    if (currentChar !== actorCharName && actorCharName in charList && tachieIndex < picData.length) {
      picData[tachieIndex].char = actorCharName;
      picData[tachieIndex].bitmap = [];
      tachieData.preloadBitmap(tachieIndex);
    }

    // Show the standing picture if it exists
    if (tachieIndex < picData.length && picData[tachieIndex].char) {
      const pictureId = picData[tachieIndex].picNum;
      const name = "TKMtachie_" + picData[tachieIndex].char + "_";
      const x = picData[tachieIndex].x;
      const y = picData[tachieIndex].y;
      $gameScreen.showPicture(pictureId, name, 0, x, y, 85, 85, 0, 0);
    }
  }
};

// Helper function to apply one clothing part per call to tachie_naibusyori1, from tachie_naibusyori2
function runTachieLoop(getPartNumber, condition) {
  const characterName = $gameVariables.value(118);
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
  // Extract parameters for clarity
  const partName = String(partSlot);
  const partNumber = Number(partValue) || 0;

  // Early exit if character doesn't exist
  if (!(characterName in $TKMvar.tachie.CharList)) {
    return;
  }

  // Cache frequently accessed objects
  const tachie = $TKMvar.tachie;
  const charList = tachie.CharList;
  const partsNameArr = tachie.partsNameArr;
  const picData = tachie.PicData;

  // Find the layer corresponding to this part name
  const layerNum = partsNameArr.indexOf(partName);
  if (layerNum === -1) {
    return; // Part name not found in layers
  }

  // Skip if the part is already set to the requested number
  if (charList[characterName][layerNum] === partNumber) {
    return;
  }

  // Update the character part in the list
  charList[characterName][layerNum] = partNumber;

  // Update the bitmap cache for each picture using this character
  const picCount = picData.length;
  for (let i = 0; i < picCount; i++) {
    if (picData[i].char !== characterName) continue;

    const pic = picData[i];

    // Initialize bitmap array if needed
    if (!pic.bitmap) {
      tachie.preloadBitmap(i);
    }

    // Set or clear the bitmap for the specified layer
    if (partNumber === 0) {
      pic.bitmap[layerNum] = null;
    } else {
      const imagePath = characterName + "_" + partsNameArr[layerNum] + "_" + partNumber;

      // Load the image into the bitmap cache
      pic.bitmap[layerNum] = ImageManager.loadPicture("/img/tachies/" + imagePath, 0);

      // Pre-cache using Galv's cache system
      Galv.CACHE.load('tachies', imagePath);
    }
  }
};

//☆☆立ち絵消去
tachie_syoukyo1 = function (tachiePicId) {

  if ($gameScreen.picture(tachiePicId)) {
    pic_eraseP(0, [tachiePicId]);
  };
  if ($gameScreen.picture(7)) {
    UTSU.PictureBreath.off([7]);
    $gameScreen.erasePicture(7);
  };
  if ($gameScreen.picture(45)) {
    UTSU.PictureBreath.off([45]);
    $gameScreen.erasePicture(45);
  };
  $gameSwitches.setValue(31, true);
};

//☆☆立ち絵表示
tachie_hyouji1 = function (actorId) {
  const gameActor = $gameActors.actor(actorId);
  if (!gameActor) return;
  tachie_hyouji2(gameActor);
}
tachie_hyouji2 = function (gameActor) {

  if (!gameActor) return;
  const dataActor = gameActor.actor();
  if (!dataActor) return;

  const actorId = gameActor.actorId();
  $gameVariables.setValue(112, actorId);
  const tachiePicId = Number(dataActor.meta['tachiePicId']);
  $gameVariables.setValue(300, tachiePicId);

  let stateEffectCount = 1;
  const stateChangeList = valueTachieChangeState;

  const actorLearnedSkill65 = gameActor.isLearnedSkill(65);
  const actorLearnedSkill69 = gameActor.isLearnedSkill(69);
  for (let i = 0, len = stateChangeList.length; i < len; i++) {
    const stateId = stateChangeList[i];
    if (!gameActor.isStateAffected(stateId)) continue;

    stateEffectCount++;

    const randomYPosition = getRandomIndex(51) + 384;
    const randomMoveDuration = getRandomIndex(61) + 40;
    let skillModifier = 1;

    if (actorLearnedSkill65) skillModifier++;
    if (actorLearnedSkill69) skillModifier++;
    let baseXPosition = 1024;

    if ($dataStates[stateId].meta['TachieXline']) {
      baseXPosition += Number($dataStates[stateId].meta['TachieXline']);
    }

    const pictureName = $dataStates[stateId].meta['TachieSet'] +
      ($dataStates[stateId].meta['TachieActorSpecify'] ? actorId + '_' + skillModifier : "");
    $gameScreen.showPicture(tachiePicId, pictureName, 1, baseXPosition, randomYPosition, 100, 100, 150, 0);

    if ($gameScreen.picture(tachiePicId)) {
      $gameScreen.movePicture(tachiePicId, 1, baseXPosition, 384, 100, 100, 255, 0, randomMoveDuration);
    }
  }

  if (stateEffectCount !== 1) {
    return;
  }

  const standingPictureMag = $gameVariables.value(120);
  $gameVariables.setValue(113, standingPictureMag * 9);
  $gameVariables.setValue(105, 1130); // x座標
  $gameVariables.setValue(106, $gameVariables.value(113)); // y座標60-700
  $gameVariables.setValue(107, standingPictureMag); // x拡大率
  $gameVariables.setValue(108, standingPictureMag); // y拡大率
  $gameVariables.setValue(109, 255); // 透過率
  $gameVariables.setValue(110, 40); // ウェイト
  $gameVariables.setValue(101, $gameVariables.value(105) + 100);
  $gameVariables.setValue(102, $gameVariables.value(106));
  $gameVariables.setValue(103, $gameVariables.value(107));
  $gameVariables.setValue(104, $gameVariables.value(108));
  $gameVariables.setValue(149, 0); // 表示最初の透明度

  let afterimageYOffset = 0; // 残像y軸。途中で数字を入れるためこれだけ先に実行
  if ($gameSwitches.value(130)) {
    $gameVariables.setValue(105, 1030); // x座標
  }
  if ($gameSwitches.value(200)) {
    $gameVariables.setValue(105, 780); // x座標
    if ($gameSwitches.value(150)) {
      const scaleValue = 40;
      $gameVariables.setValue(103, scaleValue); // x拡大率
      $gameVariables.setValue(104, scaleValue); // y拡大率
      $gameVariables.setValue(107, scaleValue); // x拡大率
      $gameVariables.setValue(108, scaleValue); // y拡大率
      $gameVariables.setValue(106, scaleValue * 9);
      $gameVariables.setValue(102, scaleValue * 9);
      $gameVariables.setValue(105, $gameVariables.value(105) - 100);
      $gameVariables.setValue(106, $gameVariables.value(106) + 50);
      $gameVariables.setValue(102, $gameVariables.value(102) + 50);
      $gameVariables.setValue(110, 20);
    } else {
      const scaleValue = 100;
      $gameVariables.setValue(107, scaleValue); // 拡大率
      $gameVariables.setValue(108, scaleValue); // 拡大率
      $gameVariables.setValue(103, scaleValue); // 拡大率
      $gameVariables.setValue(104, scaleValue); // 拡大率
      $gameVariables.setValue(105, $gameVariables.value(105) - 50);
      $gameVariables.setValue(106, scaleValue * 9);
      $gameVariables.setValue(102, scaleValue * 9);
    }
    $gameVariables.setValue(101, $gameVariables.value(105) - 50);
  }
  if ($gameSwitches.value(200)) {
    if ($gameVariables.value(19) >= 1) {
      if (!$dataItems[$gameVariables.value(19)].meta['TotalCloth']) {
        $gameVariables.setValue(101, $gameVariables.value(105));
      }
    }
    if ($gameVariables.value(19) == 0) {
      $gameVariables.setValue(101, $gameVariables.value(105) + 50);
      $gameVariables.setValue(102, $gameVariables.value(106));
    } else {
      if (!$gameSwitches.value(150)) {
        $gameVariables.setValue(106, $gameVariables.value(106) - Number(gameActor.actor().meta['TachiePoseYposition']));
        const clothSwitchId = $dataItems[$gameVariables.value(19)].meta['ClothSwitch']
          ? Number($dataItems[$gameVariables.value(19)].meta['ClothSwitch'])
          : 0;

        const offsetAdjustment = getOffsetAdjustment(clothSwitchId);
        if (offsetAdjustment >= 1) { afterimageYOffset = -200; }
        if (offsetAdjustment <= -1) { afterimageYOffset = 200; }
        $gameVariables.setValue(106, $gameVariables.value(106) + offsetAdjustment);
        if (!$gameVariables.value(111) == 0) { $gameVariables.setValue(102, $gameVariables.value(111)); }
        if (!$gameVariables.value(111) == 0) { $gameVariables.setValue(110, 60); }
        $gameVariables.setValue(111, $gameVariables.value(106));
      }
    }
  } else {
    $gameVariables.setValue(106, $gameVariables.value(106) - Number(gameActor.actor().meta['TachiePoseYposition']));
    $gameVariables.setValue(102, $gameVariables.value(106));
  }
  if ($gameSwitches.value(30)) {
    $gameVariables.setValue(101, $gameVariables.value(105) + 100); // x軸始点
    $gameVariables.setValue(110, 30); // ウェイト。※変化なし
    if ($gameVariables.value(263) >= 2) {
      $gameVariables.setValue(101, $gameVariables.value(105) - 100); // x軸始点
      $gameVariables.setValue(110, 20); // ウェイト。※変化なし
    }
    if ($gameSwitches.value(143)) {
      $gameVariables.setValue(101, $gameVariables.value(105) - 50); // x軸始点
      $gameVariables.setValue(110, 20); // ウェイト。※変化なし
    }
    $gameVariables.setValue(149, 50); // 表示最初の透明度
  }
  let tachieIndex = parseInt(getPreviousTachiePicId(), 10) || 0; // 立ち絵1か2か、それとも…
  tachieIndex--; // データ上は0から
  //const CharList = $TKMvar.tachie.CharList;
  //const MaxLayer = $TKMvar.tachie.MaxLayer;
  const PicData = $TKMvar.tachie.PicData;
  if (tachieIndex < 0 || tachieIndex >= PicData.length) return;
  const pictureId = PicData[tachieIndex]["picNum"];
  const characterName = PicData[tachieIndex]["char"];
  const nameStr = "TKMtachie_" + characterName + "_";
  //const partList = CharList[characterName];
  //const picX = $TKMvar.tachie.PicData[tachieIndex]["x"];
  //const picY = $TKMvar.tachie.PicData[tachieIndex]["y"];
  const horizontalOffset = $gameVariables.value(101) >= $gameVariables.value(105) ? 200 : -200;
  const effectOverlayOpacity = $gameSwitches.value(30) || $gameSwitches.value(200) ? 50 : 100;
  picture_motion1("smooth", [0]);
  $gameScreen.showPicture(pictureId, nameStr, 1,
    $gameVariables.value(101), $gameVariables.value(102),
    $gameVariables.value(103), $gameVariables.value(104), $gameVariables.value(149), 0);
  if (gameActor.isStateAffected(602) && !$gameSwitches.value(150)) {
    $gameScreen.showPicture(7, "/img/tachies/" + 'actor' + actorId + '_1_3', 1,
      $gameVariables.value(101) + horizontalOffset, $gameVariables.value(102) + afterimageYOffset,
      $gameVariables.value(103), $gameVariables.value(104), effectOverlayOpacity, 1);
  }
  const basePictureId = pictureId;
  if ($gameScreen.picture(basePictureId)) {
    $gameScreen.movePicture(basePictureId, 1,
      $gameVariables.value(105),
      $gameVariables.value(106),
      $gameVariables.value(107),
      $gameVariables.value(108),
      $gameVariables.value(109),
      0, $gameVariables.value(110));
  }
  if ($gameScreen.picture(7)) {
    $gameScreen.movePicture(7, 1,
      $gameVariables.value(105),
      $gameVariables.value(106),
      $gameVariables.value(107),
      $gameVariables.value(108),
      0, 1, $gameVariables.value(110) + 20);
  }
  $gameVariables.setValue(20, actorId);
  tachie_bless(basePictureId, 1);
  if ($gameSwitches.value(30)) {
    tachie_aura1(gameActor);
  }
};

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
  const currentExposure = $gameVariables.value(gameActor.actorId() + 380)[4];
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
    const exposureData = $gameVariables.value(gameActor.actorId() + 380);
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
  const clothingData = $gameVariables.value(gameActor.actorId() + 440);
  if ($gameVariables.value(207) === 101 ||
    ($gameVariables.value(207) >= 1 &&
      clothingData && $gameVariables.value(207) === clothingData[41])) {
    return null;
  }

  if ($gameSwitches.value(206)) return null;

  const exposureData = $gameVariables.value(gameActor.actorId() + 380);
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

  const clothingData = $gameVariables.value(gameActor.actorId() + 440);
  const exposureData = $gameVariables.value(gameActor.actorId() + 380);
  if (!clothingData || !exposureData) return;
  if (clothingData[0] >= 1 && exposureData[4] <= 9) {
    clothingData[0] = 0;
  }
}
//#endregion

//破損時第一段階
clothes_hason1 = function (clothPartSlotIds, isFullReset) {

  const gameVar20 = $gameVariables.value(20);
  if (isFullReset >= 1) {
    for (let i = 1; i <= 40; i++) {
      $gameVariables.setValue(i + 460, $gameVariables.value(gameVar20 + 440)[i]);
    };
  };
  $gameVariables.setValue(243, 0);
  $gameVariables.setValue(244, 0);
  const brokenPartSlotId = clothPartSlotIds[getRandomIndex(clothPartSlotIds.length)];
  if (brokenPartSlotId == 1) return;
  if ($gameVariables.value(460 + brokenPartSlotId) < 1) return;

  const itemCount = $dataItems.length;
  for (let i = 1205; i < itemCount; i++) {
    const item = $dataItems[i];
    if (brokenPartSlotId != Number(item.meta['ClothSwitch'])) continue;
    if ($gameVariables.value(brokenPartSlotId + 460) != Number(item.meta['ClothAllocationNumber'])) continue;

    const itemEICSwitchNum = Number(item.meta['EICSwitch']);
    if (itemEICSwitchNum != 200 && gameVar20 != itemEICSwitchNum - 180 && gameVar20 != itemEICSwitchNum - 380) continue;

    $gameVariables.setValue(243, item.name);
    $gameVariables.setValue(244, i);
    $gameSwitches.setValue(143, true);
    if (item.meta['ClothBreakage']) {
      const itemClothBreakageNum = Number(item.meta['ClothBreakage']);
      if (itemClothBreakageNum != $gameVariables.value(460 + brokenPartSlotId)) {
        $gameVariables.setValue(460 + brokenPartSlotId, itemClothBreakageNum);
      }
    } else {
      $gameVariables.setValue(460 + brokenPartSlotId, 0);
    }
    if (isFullReset >= 1) {
      $gameVariables.setValue(460 + brokenPartSlotId, 0);
    }
    //衣装情報を更新
    for (let i = 1; i <= 40; i++) {
      $gameVariables.value(gameVar20 + 440)[i] = $gameVariables.value(i + 460)
    };
    break;
  }
};

//破損時切れ端ColorHue用
clothes_hason2 = function (brokenPiecePicIdOverride, isTornOff) {

  const item = $dataItems[$gameVariables.value(244)];
  if (!item) return;
  const itemClothSwitch = item.meta['ClothSwitch'];
  if (!itemClothSwitch) return;

  const actorId = $gameVariables.value(20);
  const clothSwitchId = Number(itemClothSwitch);
  let brokenPiecePicId;
  if (brokenPiecePicIdOverride == 0) {
    const dataActor = $dataActors[$gameVariables.value(20)];
    brokenPiecePicId = dataActor ? Number(dataActor.meta['tachiePicId']) : 0;
  } else {
    brokenPiecePicId = brokenPiecePicIdOverride;
  }
  const pic = $gameScreen.picture(brokenPiecePicId);
  if (pic) {
    if (item.meta['EICSwitch']) {
      //let value6 = Number(item.meta['EICSwitch']);
      //if(value6-180 == $gameVariables.value(20)){value6 -= 180}else{value6 -= 200};
      if (item.meta['ClothAllocationNumber']) {
        let pictureX;
        //if (id1 == 0) {
        pictureX = pic._x;//$gameVariables.value(105);
        //} else {
        //pictureX = pic._x;
        //}
        const pictureY = pic._y;
        const scaleX = pic._scaleX;
        const scaleY = pic._scaleY;

        const clothAllocationNumber = Number(item.meta['ClothAllocationNumber']);
        $gameScreen.showPicture(valueCountSet1, "/img/tachies/" + 'actor' + actorId + '_' + clothSwitchId + '_' + clothAllocationNumber, 1, pictureX, pictureY, scaleX, scaleY, 255, 0);

        if (isTornOff == 1) {
          $gameScreen.movePicture(valueCountSet1, 1, pictureX, pictureY, scaleX * 2, scaleY, 0, 0, 60);
          picture_fade1(valueCountSet1, "fadeOut", 'Hscene005', 60, 5);
        }
        if (isTornOff == 0) {
          $gameScreen.movePicture(valueCountSet1, 1, pictureX, pictureY + pictureY, scaleX, scaleY, 0, 0, 60);
        }
        valueCountSet1 += 1;
      }
    }
  }

  // was outside of but moved inside of first because of repeating check
  if (isTornOff !== 1 /* || !itemClothSwitch */) return;
  if (clothSwitchId != 20 && clothSwitchId != 21 && clothSwitchId != 22 && clothSwitchId != 23 && clothSwitchId != 25) return;
  if (!pic) return;

  if (!item.meta['EICSwitch']) return;

  //let value6 = $gameVariables.value(20);
  //let value6 = Number(item.meta['EICSwitch']);
  //if(value6-180 == $gameVariables.value(20)){value6 -= 180}else{value6 -= 200};
  if (!item.meta['ClothAllocationNumber']) return;

  let pictureX;
  if (brokenPiecePicIdOverride == 0) {
    pictureX = $gameVariables.value(105);
  } else {
    pictureX = pic._x;
  }
  const pictureY = pic._y;
  const scaleX = pic._scaleX;
  const scaleY = pic._scaleY;

  //let value8 = Number(item.meta['ClothAllocationNumber']);
  let hueOffsetX = 0;
  let hueOffsetY = 0;
  if (item.meta['ColorHue2']) {
    const itemColorHue2DataArray = item.meta['ColorHue2'].split(',');
    const hueAxisSelector = Number(itemColorHue2DataArray[0]);
    const hueOffsetMagnitude = Number(itemColorHue2DataArray[1]);
    //let value14 = Number(item.meta['ColorHue2'].split(',')[2]);
    if (hueAxisSelector == 1) {
      hueOffsetX = hueOffsetMagnitude;
    } else {
      hueOffsetY = hueOffsetMagnitude;
    }
    //Galv.CACHE.load('pictures','actor' + value6 + '_' + 42 + '_' + value7);
    //$gameScreen.showPicture_hue(valueCountSet1,'actor' + value6 + '_' + 42 + '_' + value7,value14,1,
    //pictureX+hueOffsetX,pictureY+hueOffsetY,scaleX-scaleX-scaleX,scaleY-scaleY-scaleY,255,0);
    $gameScreen.showPicture(valueCountSet1, "/img/tachies/" + 'actor' + actorId + '_' + 42 + '_' + clothSwitchId, 1,
      pictureX + hueOffsetX, pictureY + hueOffsetY, scaleX - scaleX - scaleX, scaleY - scaleY - scaleY, 255, 0);
    if (isTornOff == 1) {
      $gameScreen.movePicture(valueCountSet1, 1, pictureX + hueOffsetX, pictureY + hueOffsetY, scaleX - scaleX - scaleX, scaleY - scaleY - scaleY, 0, 0, 60);
      picture_fade1(valueCountSet1, "fadeOut", 'Hscene005', 60, 5);
    }
    else if (isTornOff == 0) {
      $gameScreen.movePicture(valueCountSet1, 1, pictureX, pictureY + pictureY, scaleX - scaleX - scaleX, scaleY - scaleY - scaleY, 0, 0, 60);
    }
    valueCountSet1 += 1;
  }
  if (item.meta['ColorHue']) {
    //let value13 = Number(item.meta['ColorHue']);
    //$gameScreen.showPicture_hue(valueCountSet1,'actor' + value6 + '_' + 42 + '_' + value7,value13,1,pictureX,pictureY,scaleX,scaleY,255,0);
    $gameScreen.showPicture(valueCountSet1, "/img/tachies/" + 'actor' + actorId + '_' + 42 + '_' + clothSwitchId, 1, pictureX, pictureY, scaleX, scaleY, 255, 0);
  } else {
    $gameScreen.showPicture(valueCountSet1, "/img/tachies/" + 'actor' + actorId + '_' + 42 + '_' + clothSwitchId, 1, pictureX, pictureY, scaleX, scaleY, 255, 0);
  }
  if (isTornOff == 1) {
    $gameScreen.movePicture(valueCountSet1, 1, pictureX, pictureY, scaleX, scaleY, 0, 0, 60);
    picture_fade1(valueCountSet1, "fadeOut", 'Hscene005', 60, 5);
  }
  else if (isTornOff == 0) {
    $gameScreen.movePicture(valueCountSet1, 1, pictureX, pictureY + pictureY, scaleX, scaleY, 0, 0, 60);
  }
  valueCountSet1 += 1;
};

//着せ替え時統合衣装他処理
clothes_change1 = function () {

  const id = 1;
  const actorEicBaseId = 380 + $gameVariables.value(20);
  const globalEicId = 400;
  const itemsCount = $dataItems.length;

  valueRandomSet = Array(101).fill(0);

  let j = 1;
  for (let i = 1; i < itemsCount; i++) {
    const item = $dataItems[i];
    if ($gameParty.hasItem(item)) {
      const itemEicSwitchNum = Number(item.meta['EICSwitch']);
      if (itemEicSwitchNum == actorEicBaseId || itemEicSwitchNum == globalEicId) {
        const choiceParams = {
          text: item.name,
          value: i
        };
        $gameSystem.addCustomChoice(id, choiceParams);
        valueRandomSet[j] = i;
        j++;
      }
    }
  }

};

//着せ替え時単品目処理
clothes_change2 = function () {

  const id = 2;
  const actorId = $gameVariables.value(20);
  const actorEicBaseId = 380 + actorId;
  const globalEicId = 400;
  const itemsCount = $dataItems.length;
  const item19 = $dataItems[$gameVariables.value(19)];
  if (!item19) return;

  $gameScreen.showPicture(100, '/img/tachies/actor' + actorId + '_5_99', 1, 1200, 550, 20, 20, 200, 0);
  valueRandomSet = Array(201).fill(0);

  let j = 1;
  for (let i = 1; i < itemsCount; i++) {
    const item = $dataItems[i];
    if ($gameParty.hasItem(item) &&
      item19.meta['subCategory'] == item.meta['subCategory']) {
      const itemEICSwitchNum = Number(item.meta['EICSwitch']);
      if (itemEICSwitchNum == actorEicBaseId || itemEICSwitchNum == globalEicId || itemEICSwitchNum == actorEicBaseId - 200 || itemEICSwitchNum == globalEicId - 200) {
        const choiceParams = { text: item.name, value: i };
        $gameSystem.addCustomChoice(id, choiceParams);
        if (!item.meta['TotalCloth']) {
          if (Number(item.meta['ClothAllocationNumber']) >= 1) {
            $gameScreen.showPicture(j + 100, "/img/tachies/" + 'actor' + actorId + '_' + Number(item.meta['ClothSwitch']) + '_' + Number(item.meta['ClothAllocationNumber']), 1, 1200, 550, 20, 20, 0, 0);
            $gameMessage.setSelectPictureId(j - 1, j + 100);
          };
        };
        valueRandomSet[j] = i;
        j++;
      }
    }
  }

};

//衣装取得
clothes_get = function (id, subCategory, clothType) {

  $gameVariables.setValue(20, id); // replaced $gameVariables.value(20) below by id, get id is much faster than get variable value
  const items = $dataItems;
  const itemsCount = items.length;
  for (let itemIndex = 1301; itemIndex < itemsCount; itemIndex++) {
    const item = items[itemIndex];
    const itemEICSwitchNum = Number(item.meta['EICSwitch']);
    if (id + 380 == itemEICSwitchNum || id + 180 == itemEICSwitchNum || 200 == itemEICSwitchNum || 400 == itemEICSwitchNum) {
      if (item.meta['subCategory'] == subCategory && item.meta['ClothType'] == clothType) {
        $gameParty.gainItem(item, 1);
      }
    }
  }
}

get_and_cofig_girls_standing_pic = function () {
  const battlers = $gameParty.battleMembers();
  const battlersCount = battlers.length;
  for (let i = 0; i < battlersCount; i++) {
    const actor = battlers[i];
    if (isGirl(actor)) { // 女のみ, girls only
      $gameVariables.setValue(20, actor.actorId());
      tachie_settei3(actor);
    }
  }
}

//}());

