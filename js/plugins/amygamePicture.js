/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){

//picture_motion1("smooth",[0]);
picture_motion1 = function(motionType,motionParams){

// PERF: the five slots used to call getPattern() five times with identical
// arguments. Every curve function in PictureMotion.js returns a pure closure
// over its creation-time constants (no shared state), so one lookup assigned
// to all five slots behaves exactly the same way.
var pattern = curveFunctions.getPattern(motionType, motionParams);
curveFunctions.patternX = pattern;
curveFunctions.patternY = pattern;
curveFunctions.patternScaleX = pattern;
curveFunctions.patternScaleY = pattern;
curveFunctions.patternOpacity = pattern;

}

picture_preload1 = function(){

Galv.CACHE.load('pictures','actorrealityN');
Galv.CACHE.load('pictures','actorrealityR');
Galv.CACHE.load('pictures','actorrealitySR');
Galv.CACHE.load('pictures','actorrealitySSR');
Galv.CACHE.load('pictures','actorrealityUR');
Galv.CACHE.load('pictures','actorrealityLR');
//Galv.CACHE.load('parallaxes','EV_15_2');

Galv.CACHE.load('system','Window');
Galv.CACHE.load('system','Window1');
Galv.CACHE.load('system','Window2');
Galv.CACHE.load('system','Window3');

Galv.CACHE.load('system','IconSet');
Galv.CACHE.load('system','Balloon');
Galv.CACHE.load('system','Shadow1');
Galv.CACHE.load('system','Shadow2');
Galv.CACHE.load('system','Damage');
Galv.CACHE.load('system','Damage2');
Galv.CACHE.load('system','States');

for (var i = 1; i <= 58; i++) {
  Galv.CACHE.load('system','Weapons' + i);
}
Galv.CACHE.load('system','ButtonSet');
Galv.CACHE.load('system','WindowCursor');
Galv.CACHE.load('system','Dust1');
Galv.CACHE.load('system','ActiveMessageSkin');

}

//ピクチャ表示（通常のピクチャ表示のみ！）
pic_1 = function(flashTypeId,pictureId,pictureName,entryTypeId,scale,opacity,waitFrames,width,height,baseWidth,baseHeight){

var halfWidth = baseWidth/2;
var halfHeight = baseHeight/2;
var scaleMultiplier = 1;
if(entryTypeId <= 3){
  var scaleMultiplier = 2;
    if(flashTypeId == 3){
      var scaleMultiplier = 5;
    }
}
if(waitFrames >= 61 && entryTypeId <= 3){
  var scaleMultiplier = 5;
}
var offsetX = 0;
var offsetY = 0;
if(entryTypeId == 3){
  var randomDirectionIndex = getRandomIndex(3);
  var scaleMultiplier = 1;
  if(randomDirectionIndex == 0){var offsetX = 50}
  if(randomDirectionIndex == 1){var offsetX = -50}
  if(randomDirectionIndex == 2){var offsetY = 50}
  if(randomDirectionIndex == 3){var offsetY = -50}
//if(randomDirectionIndex >= 1){var offsetX = 100}//テスト
}
if(flashTypeId >= 4){
  if(entryTypeId == 4){var offsetY = flashTypeId}
  if(entryTypeId == 5){var offsetX = -flashTypeId}
  if(entryTypeId == 6){var offsetX = flashTypeId}
  if(entryTypeId == 7){var offsetY = -flashTypeId}
} else {
  if(entryTypeId == 4){var offsetY = 100}
  if(entryTypeId == 5){var offsetX = -100}
  if(entryTypeId == 6){var offsetX = 100}
  if(entryTypeId == 7){var offsetY = -100}
}
if(entryTypeId == 1){var scaleMultiplier = 0}
if(entryTypeId == 2){var scaleMultiplier = 1}
if(entryTypeId >= 3){
  if(!$gameScreen.picture(pictureId-1)){
    picture_motion1("smooth",[0]);
    var hueValue = 200;
    if($gameVariables.value(20) >= 1){
      if($dataActors[$gameVariables.value(20)].meta['tachieHue']){
        var hueValue = Number($dataActors[$gameVariables.value(20)].meta['tachieHue']);
    }}
    $gameScreen.showPicture_hue(pictureId-1, pictureName, hueValue, 1, width/2+halfWidth+offsetX+offsetX, height/2+halfHeight+offsetY+offsetY, scale*scaleMultiplier, scale*scaleMultiplier, 0, 0);
    $gameScreen.movePicture(pictureId-1, 1,width/2+halfWidth,height/2+halfHeight,scale, scale, 150, 0, waitFrames+20);
  }
}
$gameScreen.showPicture(pictureId,pictureName,1,width/2+halfWidth+offsetX,height/2+halfHeight+offsetY,scale*scaleMultiplier,scale*scaleMultiplier,0,0);
$gameScreen.movePicture(pictureId, 1,width/2+halfWidth,height/2+halfHeight,scale, scale, opacity, 0, waitFrames);
if(flashTypeId <= 1){
  if(waitFrames <= 60){
    AudioManager.playSe({"name":"Z_CGDispray","volume":20,"pitch":150,"pan":0});
      if(flashTypeId == 1){
        $gameScreen.startFlash([255,255,255,204], waitFrames);
        $gameScreen.startShake(7, 7, waitFrames/2);
      }
      if(flashTypeId == 0){
        $gameScreen.startFlash([255,119,255,204], waitFrames);
        $gameScreen.startShake(5, 5, waitFrames/2);
      }
  }
}

}

//ピクチャ指定して配列に代入
pic_setArray = function(parallelSlotId,pictureId,jitterX,jitterY,scaleAmount,waitFrames){

if(parallelSlotId <= 0){
  valueParallelPic1 = 0;
  valueParallelPic2 = 0;
  valueParallelPic3 = 0;
  valueParallelPic4 = 0;
  picture_motion1("smooth",[0]);
}
valuePicArr1= Array(15).fill(0);
if(parallelSlotId <= 1){valueParallelPic1 = pictureId}
if(parallelSlotId == 2){valueParallelPic2 = pictureId}
if(parallelSlotId == 3){valueParallelPic3 = pictureId}
if(parallelSlotId == 4){valueParallelPic4 = pictureId}
if($gameScreen.picture(pictureId)){
  valuePicArr1[0] = pictureId;
  valuePicArr1[11] = $gameScreen.picture(pictureId).name();
  valuePicArr1[1] = $gameScreen.picture(pictureId).origin();
  valuePicArr1[2] = $gameScreen.picture(pictureId).x();
  valuePicArr1[3] = $gameScreen.picture(pictureId).y();
  valuePicArr1[4] = $gameScreen.picture(pictureId).scaleX();
  valuePicArr1[5] = $gameScreen.picture(pictureId).scaleY();
  valuePicArr1[6] = $gameScreen.picture(pictureId).opacity();
  valuePicArr1[7] = $gameScreen.picture(pictureId).blendMode();
  valuePicArr1[8] = jitterX;//x
  valuePicArr1[9] = jitterY;//y
  valuePicArr1[10] = waitFrames;//ウェイト
  valuePicArr1[12] = getRandomIndex(51) + 100;//残像の-透明度
  valuePicArr1[13] = scaleAmount;//scale
  $gameScreen.showPicture_hue(valuePicArr1[0]-1,valuePicArr1[11],283,valuePicArr1[1],valuePicArr1[2],valuePicArr1[3],
  valuePicArr1[4],valuePicArr1[5],valuePicArr1[6]-valuePicArr1[12],0);
}

}

//ピクチャ指定して配列に代入したものを並列処理
pic_setArrayParallel1 = function(pictureId){

var valuePicVal1 = 0;
var valuePicVal2 = 0;
var valuePicVal3 = 0;
var valuePicVal4 = 0;
var valuePicVal5 = 0;
valuePicWait = 0;
var valuePicVal1 = 0;
var valuePicVal2 = 0;
if(pictureId == valueParallelPic1 || pictureId == valueParallelPic2 || pictureId == valueParallelPic3 || pictureId == valueParallelPic4){
  if($gameScreen.picture(pictureId)){
    if(valuePicArr1[8] >= 1){var valuePicVal1 = valuePicArr1[8] - getRandomIndex(5)}
    if(valuePicArr1[8] <= -1){var valuePicVal1 = valuePicArr1[8] + getRandomIndex(5)}
    if(valuePicArr1[9] >= 1){var valuePicVal2 = valuePicArr1[9] - getRandomIndex(5)}
    if(valuePicArr1[9] <= -1){var valuePicVal2 = valuePicArr1[9] + getRandomIndex(5)}
    if(valuePicArr1[8] == 0){var valuePicVal1 = getRandomIndex(7) - 3}
    if(valuePicArr1[9] == 0){var valuePicVal2 = getRandomIndex(7) - 3}
    //curveFunctions.patternX = curveFunctions.getPattern('jump', [valuePicVal1]);
    //curveFunctions.patternY = curveFunctions.getPattern('jump', [valuePicVal2]);
    if(valuePicArr1[13] == 0){
      var valuePicVal3 = getRandomIndex(3);
      var valuePicVal4 = getRandomIndex(3);
    } else {
      var valuePicVal3 = valuePicArr1[13];
      var valuePicVal4 = valuePicArr1[13];
    }
    var splinePoints = [valuePicArr1[2],valuePicArr1[2]+valuePicVal1,valuePicArr1[2]+valuePicVal3,valuePicArr1[2]];
    curveFunctions.patternX = curveFunctions.getPattern('spline', splinePoints);
    var splinePoints = [valuePicArr1[3],valuePicArr1[3]+valuePicVal2,valuePicArr1[3]+valuePicVal4,valuePicArr1[3]];
    curveFunctions.patternY = curveFunctions.getPattern('spline', splinePoints);
    curveFunctions.patternScaleX = curveFunctions.getPattern('jump', [valuePicVal3]);
    curveFunctions.patternScaleY = curveFunctions.getPattern('jump', [valuePicVal4]);
    valuePicWait += valuePicArr1[10] - getRandomIndex(5);
    $gameScreen.movePicture(valuePicArr1[0],valuePicArr1[1],valuePicArr1[2],valuePicArr1[3],
    valuePicArr1[4],valuePicArr1[5],valuePicArr1[6],valuePicArr1[7],valuePicWait);
    var valuePicVal4 = getRandomIndex(4) + 1;
    var valuePicVal5 = valuePicWait - valuePicVal4;
    if(valuePicVal5 <= 1){var valuePicVal5 = 2}
    if(pictureId == valueParallelPic1){
      if($gameScreen.picture(pictureId - 1)){
        $gameScreen.movePicture(pictureId-1,valuePicArr1[1],valuePicArr1[2],valuePicArr1[3],
        valuePicArr1[4],valuePicArr1[5],valuePicArr1[6]-valuePicArr1[12],0,valuePicVal5);
      }
    }
    //if($gameScreen.picture(valuePicArr1[0] + 1)){//アニメがぶつ切り表示になるため未使用
      //$gameScreen.movePicture(valuePicArr1[0]+1,valuePicArr1[1],valuePicArr1[2],valuePicArr1[3],
      //valuePicArr1[4],valuePicArr1[5],valuePicArr1[6]-valuePicArr1[12],1,valuePicVal5);
    //}
  }
}

}

//ピクチャ指定して表示pic_set(51,1,255,60);
//id1ﾋﾟｸﾁｬid2が1透明2x3y4拡大5合成,id3で指定値,id4ウェイト
pic_set = function(pictureId,setTargetId,targetValue,waitFrames){

if($gameScreen.picture(pictureId)){
  var pictureOrigin = $gameScreen.picture(pictureId).origin();
  var pictureX = $gameScreen.picture(pictureId).x();
  var pictureY = $gameScreen.picture(pictureId).y();
  var scaleX = $gameScreen.picture(pictureId).scaleX();
  var scaleY = $gameScreen.picture(pictureId).scaleY();
  var opacity = $gameScreen.picture(pictureId).opacity();
  var blendMode = $gameScreen.picture(pictureId).blendMode();
  if(setTargetId == 1){var opacity = targetValue}
  if(setTargetId == 2){var pictureX = targetValue + pictureX}
  if(setTargetId == 3){var pictureY = targetValue + pictureY}
  if(setTargetId == 4){
    var scaleX = targetValue
    var scaleY = targetValue
  }
  if(setTargetId == 5){var blendMode = targetValue}
  $gameScreen.movePicture(pictureId,pictureOrigin,pictureX,pictureY,scaleX,scaleY,opacity,blendMode,waitFrames);
}

}

//元位置記してピクチャムーブ。pic_move1(88,-300,0,100,100,0,90);//0id,1x,2y,3拡x,4拡y,5opa,6wait
pic_move1 = function(pictureId,x,y,scaleX,scaleY,opacity,waitFrames){

// PERF: hoist the single picture lookup. Game_Screen#picture() is a function
// call plus a $gameParty.inBattle() check and an index; the old body repeated
// it nine times.
var picture = $gameScreen.picture(pictureId);
if(picture){
  if(opacity == 0){
    if(picture._breathActive){
      UTSU.PictureBreath.off([pictureId]);
    }
    if(picture._breathActive2){
      UTSU.PictureBreath2.off([pictureId]);
    }
    if(picture._breathActive3){
      UTSU.PictureBreath3.off([pictureId]);
    }
    if(picture._breathActive4){
      UTSU.PictureBreath4.off([pictureId]);
    }
    if(picture._breathActive5){
      UTSU.PictureBreath5.off([pictureId]);
    }
    if(picture._breathActive6){
      UTSU.PictureBreath6.off([pictureId]);
    }
  }
  var targetX = picture.x() + x;
  var targetY = picture.y() + y;
  //var scaleMultiplier = id4;//$gameScreen.picture(id1).scaleX() + id4;
  //var scaleMultiplier2 = id5;//$gameScreen.picture(id1).scaleY() + id5;
  var pictureOrigin = picture.origin();
  $gameScreen.movePicture(pictureId,pictureOrigin,targetX,targetY,scaleX,scaleY,opacity,0,waitFrames);
}

}

//ピクid1の位置情報をもとにピクチャid2表示.id1元ﾋﾟｸ,id2表示ﾋﾟｸ,画像名,表示ｳｪｲﾄ,id5が1で元ﾋﾟｸ消去で0で無効
pic_locationSet = function(sourcePictureId,targetPictureId,pictureName,waitFrames,isAlsoFadeOut){

if($gameScreen.picture(sourcePictureId)){
  var pictureState = [0,0,0,0,0,0,0,0];
  pictureState[1] = $gameScreen.picture(sourcePictureId).origin();
  pictureState[2] = $gameScreen.picture(sourcePictureId).x();
  pictureState[3] = $gameScreen.picture(sourcePictureId).y();
  pictureState[4] = $gameScreen.picture(sourcePictureId).scaleX();
  pictureState[5] = $gameScreen.picture(sourcePictureId).scaleY();
  pictureState[6] = $gameScreen.picture(sourcePictureId).opacity();
  pictureState[7] = $gameScreen.picture(sourcePictureId).blendMode();
  $gameScreen.showPicture(targetPictureId,pictureName,pictureState[1],pictureState[2],pictureState[3],pictureState[4],pictureState[5],0,pictureState[7]);
  $gameScreen.movePicture(targetPictureId,pictureState[1],pictureState[2],pictureState[3],pictureState[4],pictureState[5],pictureState[6],pictureState[7],waitFrames);
  if(isAlsoFadeOut == 1){
    $gameScreen.movePicture(sourcePictureId,pictureState[1],pictureState[2],pictureState[3],pictureState[4],pictureState[5],0,pictureState[7],waitFrames*2);
  }
}

}

//ピクチャアニメ
picture_anime1 = function(animePicId,animePicName,animeP1,animeP2,animeP3,animeP4,animeF1,animeF2,animeF3){

$gameScreen.setPicturesAnimation(animeP1, animeP2, animeP3, animeP4);
$gameScreen.showPicture(animePicId,animePicName,1,640,384,100,100,0,0);
$gameScreen.picture(animePicId).startAnimationFrame(animeF1, animeF2, animeF3);

}

//ピクチャアニメセル指定
picture_anime2 = function(animePicId,animePicName,animeP1,animeP2,animeP3,animeP4,cellIndex){

if(!$gameScreen.picture(animePicId)){
  $gameScreen.setPicturesAnimation(animeP1, animeP2, animeP3, animeP4);
  $gameScreen.showPicture(animePicId,animePicName,1,640,384,100,100,0,0);
}
$gameScreen.picture(animePicId).cell = cellIndex;

}

//ピクチャに対してアニメーション
picture_animation1 = function(animPicId,animX,animY,animationId){

if($gameScreen.picture(animPicId)){
  animX += $gameScreen.picture(animPicId).x();
  animY += $gameScreen.picture(animPicId).y();
  $gameScreen.startAnimation(animX, animY, animationId, false);
}

}

//ピクチャフェードインアウト
picture_fade1 = function(fadePicId,fadeType,fadeGlowA,fadeWait,fadeGlowB){

// PERF: hoist the single picture lookup instead of repeating it nine times.
var picture = $gameScreen.picture(fadePicId);
if(picture){
  if(!$gameSwitches.value(651)){
    picture._GWInfo = $gameScreen.createGWInfo([fadeType,fadeGlowA,fadeWait,fadeGlowB]);
  }
  if(fadeType === "fadeOut"){
    if(picture._breathActive){
      UTSU.PictureBreath.off([fadePicId]);
    }
    if(picture._breathActive2){
      UTSU.PictureBreath2.off([fadePicId]);
    }
    if(picture._breathActive3){
      UTSU.PictureBreath3.off([fadePicId]);
    }
    if(picture._breathActive4){
      UTSU.PictureBreath4.off([fadePicId]);
    }
    if(picture._breathActive5){
      UTSU.PictureBreath5.off([fadePicId]);
    }
    if(picture._breathActive6){
      UTSU.PictureBreath6.off([fadePicId]);
    }
    var fadeX = picture.x();
    var fadeGlowA = picture.y();
    var fadeScaleX = picture.scaleX();
    var fadeGlowB = picture.scaleY();
    var fadeType = picture.origin();
    $gameScreen.movePicture(fadePicId,fadeType,fadeX,fadeGlowA,fadeScaleX,fadeGlowB,0,0,fadeWait);
  }
}

}

//ピクチャ指定消去
pic_eraseP = function(eraseStyleId,pictureIds){

picture_motion1("smooth",[0]);
// BUGFIX: eraseWait/offsetX/offsetY stayed undefined for any eraseStyleId
// outside 1/2, producing NaN target positions in the movePicture below.
// Default them so out-of-range styles erase instantly like style 0.
var eraseWait = 0;
var offsetX = 0;
var offsetY = 0;
if(eraseStyleId == 1){
  eraseWait = getRandomIndex(21) + 40;
  var randomDirectionIndex = getRandomIndex(4);
  if(randomDirectionIndex == 0){offsetX = 50}
  if(randomDirectionIndex == 1){offsetY = 50}
  if(randomDirectionIndex == 2){offsetX = -50}
  if(randomDirectionIndex == 3){offsetY = -50}
}
if(eraseStyleId == 2){
  eraseWait = 60;
}
var list = pictureIds;
list.forEach(function(pictureId) {
  // PERF: hoist the single picture lookup instead of repeating it eight times.
  var picture = $gameScreen.picture(pictureId);
  if(picture){
    if(picture._breathActive){
      UTSU.PictureBreath.off([pictureId]);
    }
    if(picture._breathActive2){
      UTSU.PictureBreath2.off([pictureId]);
    }
    if(picture._breathActive3){
      UTSU.PictureBreath3.off([pictureId]);
    }
    if(picture._breathActive4){
      UTSU.PictureBreath4.off([pictureId]);
    }
    if(picture._breathActive5){
      UTSU.PictureBreath5.off([pictureId]);
    }
    if(picture._breathActive6){
      UTSU.PictureBreath6.off([pictureId]);
    }
    if(picture.isParallaxBase()){
      $gameScreen.eraseParallax(pictureId);
    }
    if(eraseStyleId >= 1){
      var pictureOrigin = picture.origin();
      var pictureX = picture.x() + offsetX;
      var pictureY = picture.y() + offsetY;
      var scaleX = picture.scaleX();
      var scaleY = picture.scaleY();
      //var opacity = $gameScreen.picture(id2).opacity();
      $gameScreen.movePicture(pictureId,pictureOrigin,pictureX,pictureY,scaleX,scaleY,0,0,eraseWait);
    } else {
      $gameScreen.erasePicture(pictureId);
    }
  }
}, this);

}

//ピクチャ一括消去
pic_erase = function(eraseModeId){

// BUGFIX: data/*.json calls pic_erase() with no argument six times
// (Map007 events, CommonEvents 172). Neither branch matched, so
// exemptPictureIds stayed undefined and the loop's .some() threw a TypeError
// on the first iteration. An unknown mode now behaves like mode 0 (only
// picture 0, which the game never shows, is exempt).
if(eraseModeId == 1){var exemptPictureIds = [1,2,3,4,6,9,10,47,48,49,50,94,95]}
else {var exemptPictureIds = [0]}
for (var i = 1; i <= 250; i++) {
  // PERF: indexOf avoids allocating a closure per iteration like .some(fn) did.
  if(exemptPictureIds.indexOf(i) < 0) {
    // PERF: hoist the single picture lookup instead of repeating it eight times.
    var picture = $gameScreen.picture(i);
    if(picture){
      if(picture._breathActive){
        UTSU.PictureBreath.off([i]);
      }
      if(picture._breathActive2){
        UTSU.PictureBreath2.off([i]);
      }
      if(picture._breathActive3){
        UTSU.PictureBreath3.off([i]);
      }
      if(picture._breathActive4){
        UTSU.PictureBreath4.off([i]);
      }
      if(picture._breathActive5){
        UTSU.PictureBreath5.off([i]);
      }
      if(picture._breathActive6){
        UTSU.PictureBreath6.off([i]);
      }
      if(picture.isParallaxBase()){
        $gameScreen.eraseParallax(i);
      }
      $gameScreen.erasePicture(i);
    }
  }
}

}

//ピクチャブレスオフ
pic_blessoff = function(){

var pictureIds = [];
for (var i = 1; i <= 250; i++) {
  if($gameScreen.picture(i)){
    pictureIds.push(i);
  }
}
UTSU.PictureBreath.off(pictureIds);
UTSU.PictureBreath2.off(pictureIds);
UTSU.PictureBreath3.off(pictureIds);
UTSU.PictureBreath4.off(pictureIds);
UTSU.PictureBreath5.off(pictureIds);
UTSU.PictureBreath6.off(pictureIds);

}

//ピクチャボタン動作
picture_bottan1 = function(buttonPictureId){

$gameVariables.setValue(281,buttonPictureId);
$gameVariables.setValue(282,[0,0,0,0,0,0,0,0,0,0,0]);
if($gameScreen.picture($gameVariables.value(281))){
  $gameVariables.value(282)[2] = $gameScreen.picture($gameVariables.value(281)).x();
  $gameVariables.value(282)[3] = $gameScreen.picture($gameVariables.value(281)).y();
  var pictureId = $gameVariables.value(281), variableIdOfWidth = 4, variableIdOfHeight = 5;
  var spritePicture = SceneManager._scene._spriteset._pictureContainer.children.filter(function(picture) {
    return picture._pictureId === pictureId;
  })[0];
  if(!spritePicture) return;
  $gameVariables.value(282)[variableIdOfWidth] = spritePicture.width;
  $gameVariables.value(282)[variableIdOfHeight] = spritePicture.height;
  $gameVariables.value(282)[6] = 95;
  var halfWidthOffset = ($gameVariables.value(282)[4]/2)*(100-$gameVariables.value(282)[6])/100;
  var halfHeightOffset = ($gameVariables.value(282)[5]/2)*(100-$gameVariables.value(282)[6])/100;
  var targetX = $gameVariables.value(282)[2]+halfWidthOffset;
  var targetY = $gameVariables.value(282)[3]+halfHeightOffset;
  $gameScreen.movePicture($gameVariables.value(281),1,targetX,targetY-10,
  $gameVariables.value(282)[6],$gameVariables.value(282)[6],255,0,2);
}

}

//bless_erase();
bless_erase = function(){

for(var i = 1; i <= 250; i++){
  if($gameScreen.picture(i)){
    if($gameScreen.picture(i)._breathActive){
      UTSU.PictureBreath.off([i]);
    }
    if($gameScreen.picture(i)._breathActive2){
      UTSU.PictureBreath2.off([i]);
    }
    if($gameScreen.picture(i)._breathActive3){
      UTSU.PictureBreath3.off([i]);
    }
    if($gameScreen.picture(i)._breathActive4){
      UTSU.PictureBreath4.off([i]);
    }
    if($gameScreen.picture(i)._breathActive5){
      UTSU.PictureBreath5.off([i]);
    }
    if($gameScreen.picture(i)._breathActive6){
      UTSU.PictureBreath6.off([i]);
    }
  }
}

}

//息継ぎ設定getPreviousTachiePicId()
//[0]息遣いx軸[1]y軸,立ち絵x100y100[2]頻度,平時250戦時150[3]拡縮度x,立ち絵0.005[4]拡縮度y,立ち絵0.004
tachie_bless = function(pictureId, blessType) {
  // Early exit if turning off breath effect
  if (blessType === 0) {
    UTSU.PictureBreath.off([pictureId]);
    return;
  }

  // Skip processing if breath cut switch is on
  if ($gameSwitches.value(45)) {
    return;
  }

  // Default breath settings [x, y, frequency, scaleX, scaleY]
  const baseBreathSettings = [100, 100, 250, 0.004, 0.003]; // Base settings

  // Apply breath effect based on type
  switch (blessType) {
    case 1: // Standing picture
      // Only modify settings if it's the main character breath type
      const actor = $gameActors.actor($gameVariables.value(20));

      // Change settings based on state or battle
      if (actor && actor.isStateAffected(61)) {
        // Excited state
        baseBreathSettings[2] = 150;  // Faster frequency
        baseBreathSettings[3] = 0.005; // Higher X scale
        baseBreathSettings[4] = 0.004; // Higher Y scale
      } else if ($gameParty.inBattle()) {
        // Battle state
        baseBreathSettings[2] = 200; // Medium frequency
      }

      valueTachieBless = baseBreathSettings;
      UTSU.PictureBreath.on([pictureId], valueTachieBless[2]);

      // If aura picture exists (45), apply same effect
      if ($gameScreen.picture(45)) {
        UTSU.PictureBreath.on([45], valueTachieBless[2]);
      }
      break;

    case 2:
      valueTachieBless2 = baseBreathSettings;
      UTSU.PictureBreath2.on([pictureId], valueTachieBless2[2]);
      break;

    case 3: // Face graphic body
      valueTachieBless3 = baseBreathSettings;
      UTSU.PictureBreath3.on([pictureId], valueTachieBless3[2]);
      break;

    case 4: // Face graphic breast movement
      valueTachieBless4 = baseBreathSettings;
      UTSU.PictureBreath4.on([pictureId], valueTachieBless4[2]);
      break;

    case 5: // Event CG
      valueTachieBless5 = baseBreathSettings;
      UTSU.PictureBreath5.on([pictureId], valueTachieBless5[2]);
      break;

    case 6: // Event CG
      valueTachieBless6 = baseBreathSettings;
      UTSU.PictureBreath6.on([pictureId], valueTachieBless6[2]);
      break;
  }
}

//CGでピストン表現hcg_piston(value1,7,1,1);
hcg_piston = function(pictureId,breathTypeId,breathPresetId,breathLayerId){

if($gameSwitches.value(43)) return; //高演出カット

let breathParams;
switch(breathTypeId){
case 1: {//右横
  switch(breathPresetId){
   case 1: { breathParams = [-1,3,100, 0.015, 0.001]; break; }
   case 2: { breathParams = [-1,3,60, 0.020, 0.001]; break; }
   case 3: { breathParams = [-1,3,40, 0.025, 0.001]; break; }
  }
  break;
}
case 2: {//左横
  switch(breathPresetId){
   case 1: { breathParams = [-1,3,100, -0.015, 0.001]; break; }
   case 2: { breathParams = [-1,3,60, -0.020, 0.001]; break; }
   case 3: { breathParams = [-1,3,40, -0.025, 0.001]; break; }
  }
  break;
}
case 3: {//左斜め
  switch(breathPresetId){
   case 1: { breathParams = [1,1,100, 0.015, 0.015]; break; }
   case 2: { breathParams = [1,1,50, 0.02, 0.02]; break; }
   case 3: { breathParams = [1,1,20, 0.03, 0.03]; break; }
  }
  break;
}
case 4: {//右斜め
  switch(breathPresetId){
   case 1: { breathParams = [-1,1,100, 0.015, 0.015]; break; }
   case 2: { breathParams = [-1,1,50, 0.02, 0.02]; break; }
   case 3: { breathParams = [-1,1,20, 0.03, 0.03]; break; }
  }
  break;
}
case 5: {//正面
  switch(breathPresetId){
   case 1: { breathParams = [100,100,100, 0.005, 0.004]; break; }
   case 2: { breathParams = [150,150,50, 0.005, 0.004]; break; }
   case 3: { breathParams = [200,200,20, 0.020, 0.015]; break; }
  }
  break;
}
case 6: {//正面痙攣（事後）
  switch(breathPresetId){
   case 1: { breathParams = [100,100,200, 0.003, 0.002]; break; }
   case 2: { breathParams = [100,100,100, 0.003, 0.002]; break; }
   case 3: { breathParams = [100,100,20, 0.003, 0.002]; break; }
  }
  break;
}
case 7: {//縦
  switch(breathPresetId){
   //case 1: { array = [100,100,100, 0.015, 0.04]; break; }
   case 1: { breathParams = [100,100,100, 0.015, 0.02]; break; }
   case 2: { breathParams = [100,100,50, 0.015, 0.04]; break; }
   case 3: { breathParams = [100,100,20, 0.015, 0.05]; break; }
  }
  break;
}
case 8: {//横左右に身動ぎ
  switch(breathPresetId){
   case 1: { breathParams = [100,100,150, 0.01, 0.005]; break; }
   case 2: { breathParams = [100,100,100, 0.02, 0.015]; break; }
   case 3: { breathParams = [100,100,50, 0.03, 0.020]; break; }
  }
  break;
}
case 9: {//プロフィール乳揺れ正面
  switch(breathPresetId){
   case 1: { breathParams = [100,100,150, 0.015, 0.03]; break; }
   case 2: { breathParams = [100,100,50, 0.020, 0.04]; break; }
   case 3: { breathParams = [100,100,20, 0.025, 0.05]; break; }
  }
  break;
}
case 10: {//顔グラ乳揺れ正面
  switch(breathPresetId){
   case 1: { breathParams = [100,100,150, 0.010, 0.02]; break; }
   case 2: { breathParams = [100,100,100, 0.020, 0.04]; break; }
   case 3: { breathParams = [100,100,50, 0.025, 0.05]; break; }
  }
  break;
}
};
if(!breathParams) return;

switch(breathLayerId){
  case 1: {//立ち絵用orイベCG用
    valueTachieBless = breathParams;
    UTSU.PictureBreath.on([pictureId], valueTachieBless[2]);
	break;
  }
  case 2: {//イベCG用
    valueTachieBless2 = breathParams;
    UTSU.PictureBreath2.on([pictureId], valueTachieBless2[2]);
	break;
  }
  case 3: {//顔グラ身体
    valueTachieBless3 = breathParams;
    UTSU.PictureBreath3.on([pictureId], valueTachieBless3[2]);
	break;
  }
  case 4: {//顔グラ乳揺れ
    valueTachieBless4 = breathParams;
    UTSU.PictureBreath4.on([pictureId], valueTachieBless4[2]);
	break;
  }
  case 5: {//イベントＣＧ
    valueTachieBless5 = breathParams;
    UTSU.PictureBreath5.on([pictureId], valueTachieBless5[2]);
	break;
  }
  case 6: {//イベントＣＧ
    valueTachieBless6 = breathParams;
    UTSU.PictureBreath6.on([pictureId], valueTachieBless6[2]);
	break;
  }
};

}

//パララックススクロール
parallax_scroll = function(parallaxIndex,parallaxName,parallaxX,fadeOpacity,scrollX,scrollY,fadeWait){

$gameScreen.showParallax(parallaxIndex,parallaxName,0,parallaxX);
$gameScreen.fadeParallax(parallaxIndex,fadeWait,fadeOpacity);
$gameScreen.scrollParallax(parallaxIndex,scrollX,scrollY);

}

//集中線真ん中picture_rotate(74,"ScreenConcentratedLineCenter",640,384,200,1,30);
picture_rotate = function(pictureId,pictureName,x,y,opacity,blendMode,rotationDegrees){

$gameScreen.showPicture(pictureId,
pictureName,1,x,y,0,0,0,1);
$gameScreen.movePicture(pictureId,1,
x,y,100,100,opacity,blendMode,20);
$gameScreen.rotatePicture(pictureId, rotationDegrees);
$gameScreen.startFlash([255,255,255,200],60);

}

//主人公パッシブ獲得
actor_skillMasteryGet = function(skillId,logVarId){

var value = skillId;
var actor = $gameActors.actor($gameVariables.value(11));
if(actor) actor.gainSkillMasteryUses(value,$gameVariables.value(203));//変更熟練度
var masteryText = `\\C[1]＜${$dataSkills[value].name}＞\\C[0]熟練度\\C[10]\\V[203]\\C[0]獲得！\n`;
$gameVariables.setValue(logVarId,$gameVariables.value(logVarId)+masteryText);

}

//現状確認時直前シーンCG表示
genjou_tyokuzenScene = function(){

var value = 50;
var pictureCounter = 0;
var start = $gameVariables.value(73);
var end = $gameVariables.value(74);
for(var i = start; i <= end; i++){
  $gameVariables.setValue(20,i);
  var actor = $gameActors.actor($gameVariables.value(20));
  if($gameParty.members().contains($gameActors.actor($gameVariables.value(20)))){
    var statePictureId = $gameVariables.value($gameVariables.value(20)+380)[46];
    if(statePictureId == 0){
      $gameVariables.setValue(191,1);
      if(actor.isLearnedSkill(62)){$gameVariables.setValue(191,2)}
      if(actor.isLearnedSkill(64)){$gameVariables.setValue(191,3)}
      if(actor.isLearnedSkill(66)){$gameVariables.setValue(191,4)}
      if(actor.isLearnedSkill(68)){$gameVariables.setValue(191,5)}
      if(actor.isLearnedSkill(70)){$gameVariables.setValue(191,6)}
      $gameScreen.showPicture(value+1,"HstatesBackGround"+$gameVariables.value(191),0,500,0,100,100,0,0);
      $gameScreen.showPicture(value+2,"HstatesFrame",0,500,0,100,100,0,0);
      $gameScreen.movePicture(value+1,0,0,0,100,100,255,0,20);
      $gameScreen.movePicture(value+2,0,0,0,100,100,255,0,20);
    } else {
      $gameScreen.showPicture(value+1,statePictureId,0,-200,0,100,100,0,0);
      $gameScreen.movePicture(value+1,0,0,0,100,100,255,0,20);
    }
    value += 2;
    pictureCounter += 1
}}
var value = 50;
if(pictureCounter == 2){
  $gameScreen.movePicture(value+3,0,512,0,100,100,255,0,20);
  $gameScreen.movePicture(value+4,0,512,0,100,100,255,0,20);
}
if(pictureCounter >= 3){
  for(var i = value; i <= value+pictureCounter; i++){
    if(!$gameScreen.picture(i)) continue;
    $gameScreen.picture(i)._scaleX = 50;
    $gameScreen.picture(i)._scaleY = 50;
    if(i === 2){
      $gameScreen.picture(i)._x = 256;
      $gameScreen.picture(i)._y = 384;
    }
    if(i === 3){
      $gameScreen.picture(i)._x = 0;
      $gameScreen.picture(i)._y = 384;
    }
    if(i === 4){
      $gameScreen.picture(i)._x = 256;
      $gameScreen.picture(i)._y = 384;
    }
    if(i === 5){
      $gameScreen.picture(i)._x = 512;
      $gameScreen.picture(i)._y = 0;
    }
    if(i === 6){
      $gameScreen.picture(i)._x = 768;
      $gameScreen.picture(i)._y = 384;
    }
    if(i === 7){
      $gameScreen.picture(i)._x = 512;
      $gameScreen.picture(i)._y = 384;
    }
    if(i === 8){
      $gameScreen.picture(i)._x = 768;
      $gameScreen.picture(i)._y = 384;
    }
  }
}

}

//ピクチャ更新時の音演出
picture_se1 = function(){

AudioManager.playSe({"name":"Z_CGDispray","volume":25,"pitch":150,"pan":0});

}

//移動ルートでピクチャ処理//ﾋﾟｸid,x,y,scale,opa,wait
picture_ParallelMove = function(pictureId,offsetX,offsetY,offsetScale,opacity,waitFrames){

valueCharaWaitCountarray1 = [0,0,0,0,0,0,0,0,0,0,0];
valueCharaWaitCountarray2 = [0,0,0,0,0,0,0,0,0,0,0];
if($gameScreen.picture(pictureId)){
  valueCharaWaitCountarray1[1] = pictureId;
  valueCharaWaitCountarray1[2] = $gameScreen.picture(pictureId).x();
  valueCharaWaitCountarray1[3] = $gameScreen.picture(pictureId).y();
  valueCharaWaitCountarray1[4] = $gameScreen.picture(pictureId).scaleX();
  valueCharaWaitCountarray1[5] = $gameScreen.picture(pictureId).scaleY();
  valueCharaWaitCountarray1[6] = opacity;
  valueCharaWaitCountarray1[7] = $gameScreen.picture(pictureId).blendMode();
  valueCharaWaitCountarray1[8] = waitFrames;
  valueCharaWaitCountarray2[2] = $gameScreen.picture(pictureId).x() + offsetX;
  valueCharaWaitCountarray2[3] = $gameScreen.picture(pictureId).y() + offsetY;
  valueCharaWaitCountarray2[4] = $gameScreen.picture(pictureId).scaleX() + offsetScale;
  valueCharaWaitCountarray2[5] = $gameScreen.picture(pictureId).scaleY() + offsetScale;
  valueCharaWaitCountarray2[6] = $gameScreen.picture(pictureId).opacity();
  valueCharaWaitCountarray2[7] = $gameScreen.picture(pictureId).blendMode();
  if(!!$gameMap.event(1)) {
    $gameMap.event(1).forceMoveRoute({
    "list":[
      {"code":45,"parameters": ["if($gameScreen.picture(valueCharaWaitCountarray1[1])){$gameScreen.movePicture(valueCharaWaitCountarray1[1],1,valueCharaWaitCountarray1[2],valueCharaWaitCountarray1[3],valueCharaWaitCountarray1[4],valueCharaWaitCountarray1[5],valueCharaWaitCountarray1[6],valueCharaWaitCountarray1[7],valueCharaWaitCountarray1[8] + (getRandomIndex(11) - 5))}"]},
      {"code":15, "parameters":[valueCharaWaitCountarray1[8] + (getRandomIndex(11) - 5)]},
      {"code":45,"parameters": ["if($gameScreen.picture(valueCharaWaitCountarray1[1])){$gameScreen.movePicture(valueCharaWaitCountarray1[1],1,valueCharaWaitCountarray2[2] + (getRandomIndex(3) - 2),valueCharaWaitCountarray2[3] + (getRandomIndex(3) - 2),valueCharaWaitCountarray2[4] + (getRandomIndex(3) - 2),valueCharaWaitCountarray2[5] + (getRandomIndex(3) - 2),valueCharaWaitCountarray2[6],valueCharaWaitCountarray2[7],valueCharaWaitCountarray1[8] + (getRandomIndex(11) - 5))}"]},
      {"code":15, "parameters":[valueCharaWaitCountarray1[8] + (getRandomIndex(11) - 5)]},
    {"code":0}],"repeat":true,"skippable":true});
  }
}

}

//ﾋﾟｸid,ﾌｧｲﾙ,x,y,scale,wait,0そのまま1横ズレ2拡縮,最後は変更数値pic_showMove1(valuePic1+3,valueScenePic+'03',640-128,384,100,60,0,0);
pic_showMove1 = function(pictureId,pictureName,x,y,scale,waitFrames,offsetAxisId,offsetAmount){

var offsetX = 0;
var offsetY = 0;
if(offsetAxisId == 1){
  var offsetX = offsetAmount;
}
if(offsetAxisId == 2){
  var offsetY = offsetAmount;
}
$gameScreen.showPicture(pictureId,pictureName,1,x + offsetX,y,scale + offsetY,scale + offsetY,0,0);
$gameScreen.movePicture(pictureId,1,x,y,scale,scale,255,0,waitFrames);

}

//エネミーステートでドロップ
//enemy_drop = function(user,enemy){

//}

//}());
