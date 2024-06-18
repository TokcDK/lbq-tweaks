/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){

//picture_motion1("smooth",[0]);
picture_motion1 = function(id1,id2){

curveFunctions.patternX = curveFunctions.getPattern(id1, id2);
curveFunctions.patternY = curveFunctions.getPattern(id1, id2);
curveFunctions.patternScaleX = curveFunctions.getPattern(id1, id2);
curveFunctions.patternScaleY = curveFunctions.getPattern(id1, id2);
curveFunctions.patternOpacity = curveFunctions.getPattern(id1, id2);

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
pic_1 = function(id1,id2,id3,id4,id5,id6,id7,id8,id9,id10,id11){

var value1 = id10/2;
var value2 = id11/2;
var value3 = 1;
if(id4 <= 3){
  var value3 = 2;
    if(id1 == 3){
      var value3 = 5;
    }
}
if(id7 >= 61 && id4 <= 3){
  var value3 = 5;
}
var value4 = 0;
var value5 = 0;
if(id4 == 3){
  var value6 = Math.floor( Math.random() * 3);
  var value3 = 1
  if(value6 == 0){var value4 = 50}
  if(value6 == 1){var value4 = -50}
  if(value6 == 2){var value5 = 50}
  if(value6 == 3){var value5 = -50}
//if(value6 >= 1){var value4 = 100}//テスト
}
if(id1 >= 4){
  if(id4 == 4){var value5 = id1}
  if(id4 == 5){var value4 = -id1}
  if(id4 == 6){var value4 = id1}
  if(id4 == 7){var value5 = -id1}
} else {
  if(id4 == 4){var value5 = 100}
  if(id4 == 5){var value4 = -100}
  if(id4 == 6){var value4 = 100}
  if(id4 == 7){var value5 = -100}
}
if(id4 == 1){var value3 = 0}
if(id4 == 2){var value3 = 1}
if(id4 >= 3){
  if(!$gameScreen.picture(id2-1)){
    picture_motion1("smooth",[0]);
    var value10 = 200;
    if($gameVariables.value(20) >= 1){
      if($dataActors[$gameVariables.value(20)].meta['tachieHue']){
        var value10 = Number($dataActors[$gameVariables.value(20)].meta['tachieHue']);
    }}
    $gameScreen.showPicture_hue(id2-1, id3, value10, 1, id8/2+value1+value4+value4, id9/2+value2+value5+value5, id5*value3, id5*value3, 0, 0);
    $gameScreen.movePicture(id2-1, 1,id8/2+value1,id9/2+value2,id5, id5, 150, 0, id7+20);
  }
}
$gameScreen.showPicture(id2,id3,1,id8/2+value1+value4,id9/2+value2+value5,id5*value3,id5*value3,0,0);
$gameScreen.movePicture(id2, 1,id8/2+value1,id9/2+value2,id5, id5, id6, 0, id7);
if(id1 <= 1){
  if(id7 <= 60){
    AudioManager.playSe({"name":"Z_CGDispray","volume":20,"pitch":150,"pan":0});
      if(id1 == 1){
        $gameScreen.startFlash([255,255,255,204], id7);
        $gameScreen.startShake(7, 7, id7/2);
      }
      if(id1 == 0){
        $gameScreen.startFlash([255,119,255,204], id7);
        $gameScreen.startShake(5, 5, id7/2);
      }
  }
}

}

//ピクチャ指定して配列に代入
pic_setArray = function(id5,id1,id2,id3,id4,id6){

if(id5 <= 0){
  valueParallelPic1 = 0;  
  valueParallelPic2 = 0;
  valueParallelPic3 = 0;
  valueParallelPic4 = 0;
  picture_motion1("smooth",[0]);
}
valuePicArr1= Array(15).fill(0);
if(id5 <= 1){valueParallelPic1 = id1}
if(id5 == 2){valueParallelPic2 = id1}
if(id5 == 3){valueParallelPic3 = id1}
if(id5 == 4){valueParallelPic4 = id1}
if($gameScreen.picture(id1)){
  valuePicArr1[0] = id1;
  valuePicArr1[11] = $gameScreen.picture(id1).name();
  valuePicArr1[1] = $gameScreen.picture(id1).origin();
  valuePicArr1[2] = $gameScreen.picture(id1).x();
  valuePicArr1[3] = $gameScreen.picture(id1).y();
  valuePicArr1[4] = $gameScreen.picture(id1).scaleX();
  valuePicArr1[5] = $gameScreen.picture(id1).scaleY();
  valuePicArr1[6] = $gameScreen.picture(id1).opacity();
  valuePicArr1[7] = $gameScreen.picture(id1).blendMode();
  valuePicArr1[8] = id2;//x
  valuePicArr1[9] = id3;//y
  valuePicArr1[10] = id6;//ウェイト
  valuePicArr1[12] = Math.floor( Math.random() * 51) + 100;//残像の-透明度
  valuePicArr1[13] = id4;//scale
  $gameScreen.showPicture_hue(valuePicArr1[0]-1,valuePicArr1[11],283,valuePicArr1[1],valuePicArr1[2],valuePicArr1[3],
  valuePicArr1[4],valuePicArr1[5],valuePicArr1[6]-valuePicArr1[12],0);
}

}

//ピクチャ指定して配列に代入したものを並列処理
pic_setArrayParallel1 = function(id1){

var valuePicVal1 = 0;
var valuePicVal2 = 0;
var valuePicVal3 = 0;
var valuePicVal4 = 0;
var valuePicVal5 = 0;
valuePicWait = 0;
var valuePicVal1 = 0;
var valuePicVal2 = 0;
if(id1 == valueParallelPic1 || id1 == valueParallelPic2 || id1 == valueParallelPic3 || id1 == valueParallelPic4){
  if($gameScreen.picture(id1)){
    if(valuePicArr1[8] >= 1){var valuePicVal1 = valuePicArr1[8] - Math.floor( Math.random() * 5)}
    if(valuePicArr1[8] <= -1){var valuePicVal1 = valuePicArr1[8] + Math.floor( Math.random() * 5)}
    if(valuePicArr1[9] >= 1){var valuePicVal2 = valuePicArr1[9] - Math.floor( Math.random() * 5)}
    if(valuePicArr1[9] <= -1){var valuePicVal2 = valuePicArr1[9] + Math.floor( Math.random() * 5)}
    if(valuePicArr1[8] == 0){var valuePicVal1 = Math.floor( Math.random() * 7) - 3}
    if(valuePicArr1[9] == 0){var valuePicVal2 = Math.floor( Math.random() * 7) - 3}
    //curveFunctions.patternX = curveFunctions.getPattern('jump', [valuePicVal1]);
    //curveFunctions.patternY = curveFunctions.getPattern('jump', [valuePicVal2]);
    if(valuePicArr1[13] == 0){
      var valuePicVal3 = Math.floor( Math.random() * 3);
      var valuePicVal4 = Math.floor( Math.random() * 3);
    } else {
      var valuePicVal3 = valuePicArr1[13];
      var valuePicVal4 = valuePicArr1[13];
    }
    var arr1 = [valuePicArr1[2],valuePicArr1[2]+valuePicVal1,valuePicArr1[2]+valuePicVal3,valuePicArr1[2]]
    curveFunctions.patternX = curveFunctions.getPattern('spline', arr1);
    var arr1 = [valuePicArr1[3],valuePicArr1[3]+valuePicVal2,valuePicArr1[3]+valuePicVal4,valuePicArr1[3]]
    curveFunctions.patternY = curveFunctions.getPattern('spline', arr1);
    curveFunctions.patternScaleX = curveFunctions.getPattern('jump', [valuePicVal3]);
    curveFunctions.patternScaleY = curveFunctions.getPattern('jump', [valuePicVal4]);
    valuePicWait += valuePicArr1[10] - Math.floor( Math.random() * 5);
    $gameScreen.movePicture(valuePicArr1[0],valuePicArr1[1],valuePicArr1[2],valuePicArr1[3],
    valuePicArr1[4],valuePicArr1[5],valuePicArr1[6],valuePicArr1[7],valuePicWait);
    var valuePicVal4 = Math.floor( Math.random() * 4) + 1;
    var valuePicVal5 = valuePicWait - valuePicVal4;
    if(valuePicVal5 <= 1){var valuePicVal5 = 2}
    if(id1 == valueParallelPic1){
      if($gameScreen.picture(id1 - 1)){
        $gameScreen.movePicture(id1-1,valuePicArr1[1],valuePicArr1[2],valuePicArr1[3],
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
pic_set = function(id1,id2,id3,id4){

if($gameScreen.picture(id1)){
  var value1 = $gameScreen.picture(id1).origin();
  var value2 = $gameScreen.picture(id1).x();
  var value3 = $gameScreen.picture(id1).y();
  var value4 = $gameScreen.picture(id1).scaleX();
  var value5 = $gameScreen.picture(id1).scaleY();
  var value6 = $gameScreen.picture(id1).opacity();
  var value7 = $gameScreen.picture(id1).blendMode();
  if(id2 == 1){var value6 = id3}
  if(id2 == 2){var value2 = id3 + value2}
  if(id2 == 3){var value3 = id3 + value3}
  if(id2 == 4){
    var value4 = id3
    var value5 = id3
  }
  if(id2 == 5){var value7 = id3}
  $gameScreen.movePicture(id1,value1,value2,value3,value4,value5,value6,value7,id4);
}

}

//元位置記してピクチャムーブ。pic_move1(88,-300,0,100,100,0,90);//0id,1x,2y,3拡x,4拡y,5opa,6wait
pic_move1 = function(id1,id2,id3,id4,id5,id6,id7){

if($gameScreen.picture(id1)){
  if(id6 == 0){
    if($gameScreen.picture(id1)._breathActive){
      UTSU.PictureBreath.off([id1]);
    }
    if($gameScreen.picture(id1)._breathActive2){
      UTSU.PictureBreath2.off([id1]);
    }
    if($gameScreen.picture(id1)._breathActive3){
      UTSU.PictureBreath3.off([id1]);
    }
    if($gameScreen.picture(id1)._breathActive4){
      UTSU.PictureBreath4.off([id1]);
    }
    if($gameScreen.picture(id1)._breathActive5){
      UTSU.PictureBreath5.off([id1]);
    }
    if($gameScreen.picture(id1)._breathActive6){
      UTSU.PictureBreath6.off([id1]);
    }
  }
  var value1 = $gameScreen.picture(id1).x() + id2;
  var value2 = $gameScreen.picture(id1).y() + id3;
  //var value3 = id4;//$gameScreen.picture(id1).scaleX() + id4;
  //var value4 = id5;//$gameScreen.picture(id1).scaleY() + id5;
  var value5 = $gameScreen.picture(id1).origin();
  $gameScreen.movePicture(id1,value5,value1,value2,id4,id5,id6,0,id7);
}

}

//ピクid1の位置情報をもとにピクチャid2表示.id1元ﾋﾟｸ,id2表示ﾋﾟｸ,画像名,表示ｳｪｲﾄ,id5が1で元ﾋﾟｸ消去で0で無効
pic_locationSet = function(id1,id2,id3,id4,id5){

if($gameScreen.picture(id1)){
  var arr1 = [0,0,0,0,0,0,0,0];
  arr1[1] = $gameScreen.picture(id1).origin();
  arr1[2] = $gameScreen.picture(id1).x();
  arr1[3] = $gameScreen.picture(id1).y();
  arr1[4] = $gameScreen.picture(id1).scaleX();
  arr1[5] = $gameScreen.picture(id1).scaleY();
  arr1[6] = $gameScreen.picture(id1).opacity();
  arr1[7] = $gameScreen.picture(id1).blendMode();
  $gameScreen.showPicture(id2,id3,arr1[1],arr1[2],arr1[3],arr1[4],arr1[5],0,arr1[7]);
  $gameScreen.movePicture(id2,arr1[1],arr1[2],arr1[3],arr1[4],arr1[5],arr1[6],arr1[7],id4);
  if(id5 == 1){
    $gameScreen.movePicture(id1,arr1[1],arr1[2],arr1[3],arr1[4],arr1[5],0,arr1[7],id4*2);
  }
}

}

//ピクチャアニメ
picture_anime1 = function(value1,value2,value3,value4,value5,value6,value7,value8,value9){

$gameScreen.setPicturesAnimation(value3, value4, value5, value6);
$gameScreen.showPicture(value1,value2,1,640,384,100,100,0,0);
$gameScreen.picture(value1).startAnimationFrame(value7, value8, value9);

}

//ピクチャアニメセル指定
picture_anime2 = function(value1,value2,value3,value4,value5,value6,id1){

if(!$gameScreen.picture(value1)){
  $gameScreen.setPicturesAnimation(value3, value4, value5, value6);
  $gameScreen.showPicture(value1,value2,1,640,384,100,100,0,0);
}
$gameScreen.picture(value1).cell = id1;

}

//ピクチャに対してアニメーション
picture_animation1 = function(value1,value2,value3,value4){

if($gameScreen.picture(value1)){
  value2 += $gameScreen.picture(value1).x();
  value3 += $gameScreen.picture(value1).y();
  $gameScreen.startAnimation(value2, value3, value4, false);
}

}

//ピクチャフェードインアウト
picture_fade1 = function(value1,value6,value3,value7,value5){

if($gameScreen.picture(value1)){
  if(!$gameSwitches.value(651)){
    $gameScreen.picture(value1)._GWInfo = $gameScreen.createGWInfo([value6,value3,value7,value5]);
  }
  if(value6 == "fadeOut"){
    if($gameScreen.picture(value1)._breathActive){
      UTSU.PictureBreath.off([value1]);
    }
    if($gameScreen.picture(value1)._breathActive2){
      UTSU.PictureBreath2.off([value1]);
    }
    if($gameScreen.picture(value1)._breathActive3){
      UTSU.PictureBreath3.off([value1]);
    }
    if($gameScreen.picture(value1)._breathActive4){
      UTSU.PictureBreath4.off([value1]);
    }
    if($gameScreen.picture(value1)._breathActive5){
      UTSU.PictureBreath5.off([value1]);
    }
    if($gameScreen.picture(value1)._breathActive6){
      UTSU.PictureBreath6.off([value1]);
    }
    var value2 = $gameScreen.picture(value1).x();
    var value3 = $gameScreen.picture(value1).y();
    var value4 = $gameScreen.picture(value1).scaleX();
    var value5 = $gameScreen.picture(value1).scaleY();
    var value6 = $gameScreen.picture(value1).origin();
    $gameScreen.movePicture(value1,value6,value2,value3,value4,value5,0,0,value7);
  }
}

}

//ピクチャ指定消去
pic_eraseP = function(id1,array){

picture_motion1("smooth",[0]);
if(id1 == 1){
  var value11 = Math.floor( Math.random() * 21) + 40;
  var value12 = Math.floor( Math.random() * 4);
  var value13 = 0;
  var value14 = 0;
  if(value12 == 0){var value13 = 50}
  if(value12 == 1){var value14 = 50}
  if(value12 == 2){var value13 = -50}
  if(value12 == 3){var value14 = -50}
}
if(id1 == 2){
  var value11 = 60;
  var value13 = 0;
  var value14 = 0;
}
var list = array;
list.forEach(function(id2) {
  if($gameScreen.picture(id2)){
    if($gameScreen.picture(id2)._breathActive){
      UTSU.PictureBreath.off([id2]);
    }
    if($gameScreen.picture(id2)._breathActive2){
      UTSU.PictureBreath2.off([id2]);
    }
    if($gameScreen.picture(id2)._breathActive3){
      UTSU.PictureBreath3.off([id2]);
    }
    if($gameScreen.picture(id2)._breathActive4){
      UTSU.PictureBreath4.off([id2]);
    }
    if($gameScreen.picture(id2)._breathActive5){
      UTSU.PictureBreath5.off([id2]);
    }
    if($gameScreen.picture(id2)._breathActive6){
      UTSU.PictureBreath6.off([id2]);
    }
    if($gameScreen.picture(id2).isParallaxBase()){
      $gameScreen.eraseParallax(id2);
    }
    if(id1 >= 1){
      if($gameScreen.picture(id2)){
      var value1 = $gameScreen.picture(id2).origin();
      var value2 = $gameScreen.picture(id2).x() + value13;
      var value3 = $gameScreen.picture(id2).y() + value14;
      var value4 = $gameScreen.picture(id2).scaleX();
      var value5 = $gameScreen.picture(id2).scaleY();
      //var value6 = $gameScreen.picture(id2).opacity();
      $gameScreen.movePicture(id2,value1,value2,value3,value4,value5,0,0,value11);
      }
    } else {
      $gameScreen.erasePicture(id2);
    }
  }
}, this);

}

//ピクチャ一括消去
pic_erase = function(id1){

if(id1 == 0){var arr1 = [0]}
if(id1 == 1){var arr1 = [1,2,3,4,6,9,10,47,48,49,50,94,95]}
for (var i = 1; i <= 250; i++) {
  if(arr1.some(function(id){return id == i})){} else {
    //$gameScreen.showPicture(i,'0_1_0',1,640-128,384,1,1,50,0);
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
      if($gameScreen.picture(i).isParallaxBase()){
        $gameScreen.eraseParallax(i);
      }
      $gameScreen.erasePicture(i);
}}}

}

//ピクチャブレスオフ
pic_blessoff = function(){

var arr2 = [];
for (var i = 1; i <= 250; i++) {
  if($gameScreen.picture(i)){
    arr2.push(i);
  }
}
UTSU.PictureBreath.off([arr2]);
UTSU.PictureBreath2.off([arr2]);
UTSU.PictureBreath3.off([arr2]);
UTSU.PictureBreath4.off([arr2]);
UTSU.PictureBreath5.off([arr2]);
UTSU.PictureBreath6.off([arr2]);

}

//ピクチャボタン動作
picture_bottan1 = function(id1){

$gameVariables.setValue(281,id1);
$gameVariables.setValue(282,[0,0,0,0,0,0,0,0,0,0,0]);
if($gameScreen.picture($gameVariables.value(281))){
  $gameVariables.value(282)[2] = $gameScreen.picture($gameVariables.value(281)).x();
  $gameVariables.value(282)[3] = $gameScreen.picture($gameVariables.value(281)).y();
  var pictureId = $gameVariables.value(281), variableIdOfWidth = 4, variableIdOfHeight = 5;
  var spritePicture = SceneManager._scene._spriteset._pictureContainer.children.filter(function(picture) {
    return picture._pictureId == pictureId; 
  })[0]; 
  $gameVariables.value(282)[variableIdOfWidth] = spritePicture.width;
  $gameVariables.value(282)[variableIdOfHeight] = spritePicture.height;
  $gameVariables.value(282)[6] = 95;
  var value1 = ($gameVariables.value(282)[4]/2)*(100-$gameVariables.value(282)[6])/100;
  var value2 = ($gameVariables.value(282)[5]/2)*(100-$gameVariables.value(282)[6])/100;
  var value3 = $gameVariables.value(282)[2]+value1;
  var value4 = $gameVariables.value(282)[3]+value2;
  $gameScreen.movePicture($gameVariables.value(281),1,value3,value4-10,
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

//息継ぎ設定$gameVariables.value(300)
//[0]息遣いx軸[1]y軸,立ち絵x100y100[2]頻度,平時250戦時150[3]拡縮度x,立ち絵0.005[4]拡縮度y,立ち絵0.004
tachie_bless = function(id11,id12){

if(id12 == 0){
  UTSU.PictureBreath.off([id11])
} else {
  let arr1 = [100,100,250,0.004,0.003];  //立ち絵用息遣い設定。基本状態
    if(id12 == 1){
      if($gameActors.actor($gameVariables.value(20)).isStateAffected(61)){
        arr1 = [100,100,150,0.005,0.004];    //立ち絵用息遣い設定。発情状態
      } else {
        if($gameParty.inBattle()){
          arr1 = [100,100,200,0.004,0.003];    //立ち絵用息遣い設定。戦闘状態
        }
      }
    }
    if(!$gameSwitches.value(45)){ //息継ぎカットスイッチ
	 switch(id12){
      case 1: {//立ち絵用
        valueTachieBless = arr1;
        UTSU.PictureBreath.on([id11], valueTachieBless[2]);
          if($gameScreen.picture(45)){//オーラ
            UTSU.PictureBreath.on(45, valueTachieBless[2]);
          }
		break;
      }
      case 6: {//イベントＣＧ
        valueTachieBless6 = arr1;
        UTSU.PictureBreath6.on([id11[, valueTachieBless6[2]);
		break;
      }
      case 5: {//イベントＣＧ
        valueTachieBless5 = arr1;
        UTSU.PictureBreath5.on([id11], valueTachieBless5[2]);
		break;
      }
      case 4: {//顔グラ乳揺れ
        valueTachieBless4 = arr1;
        UTSU.PictureBreath4.on([id11], valueTachieBless4[2]);
		break;
      }
      case 3: {//顔グラ身体
        valueTachieBless3 = arr1;
        UTSU.PictureBreath3.on([id11], valueTachieBless3[2]);
		break;
      }
      case 2: {
        valueTachieBless2 = arr1;
        UTSU.PictureBreath2.on([id11], valueTachieBless2[2]);
		break;
      }
	 }
    }
}

}

//CGでピストン表現hcg_piston(value1,7,1,1);
hcg_piston = function(id11,id12,id13,id14){

if(id12 == 1){//右横
  if(id13 == 1){var array = [-1,3,100, 0.015, 0.001]}
  if(id13 == 2){var array = [-1,3,60, 0.020, 0.001]}
  if(id13 == 3){var array = [-1,3,40, 0.025, 0.001]}
}
if(id12 == 2){//左横
  if(id13 == 1){var array = [-1,3,100, -0.015, 0.001]}
  if(id13 == 2){var array = [-1,3,60, -0.020, 0.001]}
  if(id13 == 3){var array = [-1,3,40, -0.025, 0.001]}
}
if(id12 == 3){//左斜め
  if(id13 == 1){var array = [1,1,100, 0.015, 0.015]}
  if(id13 == 2){var array = [1,1,50, 0.02, 0.02]}
  if(id13 == 3){var array = [1,1,20, 0.03, 0.03]}
}
if(id12 == 4){//右斜め
  if(id13 == 1){var array = [-1,1,100, 0.015, 0.015]}
  if(id13 == 2){var array = [-1,1,50, 0.02, 0.02]}
  if(id13 == 3){var array = [-1,1,20, 0.03, 0.03]}
}
if(id12 == 5){//正面
  if(id13 == 1){var array = [100,100,100, 0.005, 0.004]}
  if(id13 == 2){var array = [150,150,50, 0.005, 0.004]}
  if(id13 == 3){var array = [200,200,20, 0.020, 0.015]}
}
if(id12 == 6){//正面痙攣（事後）
  if(id13 == 1){var array = [100,100,200, 0.003, 0.002]}
  if(id13 == 2){var array = [100,100,100, 0.003, 0.002]}
  if(id13 == 3){var array = [100,100,20, 0.003, 0.002]}
}
if(id12 == 7){//縦
  //if(id13 == 1){var array = [100,100,100, 0.015, 0.04]}
  if(id13 == 1){var array = [100,100,100, 0.015, 0.02]}
  if(id13 == 2){var array = [100,100,50, 0.015, 0.04]}
  if(id13 == 3){var array = [100,100,20, 0.015, 0.05]}
}
if(id12 == 8){//横左右に身動ぎ
  if(id13 == 1){var array = [100,100,150, 0.01, 0.005]}
  if(id13 == 2){var array = [100,100,100, 0.02, 0.015]}
  if(id13 == 3){var array = [100,100,50, 0.03, 0.020]}
}
if(id12 == 9){//プロフィール乳揺れ正面
  if(id13 == 1){var array = [100,100,150, 0.015, 0.03]}
  if(id13 == 2){var array = [100,100,50, 0.020, 0.04]}
  if(id13 == 3){var array = [100,100,20, 0.025, 0.05]}
}
if(id12 == 10){//顔グラ乳揺れ正面
  if(id13 == 1){var array = [100,100,150, 0.010, 0.02]}
  if(id13 == 2){var array = [100,100,100, 0.020, 0.04]}
  if(id13 == 3){var array = [100,100,50, 0.025, 0.05]}
}
if(!$gameSwitches.value(43)){//高演出カット
  if(id14 == 1){//立ち絵用orイベCG用
    valueTachieBless = array;
    UTSU.PictureBreath.on([id11], valueTachieBless[2]);
  }
  if(id14 == 2){//イベCG用
    valueTachieBless2 = array;
    UTSU.PictureBreath2.on([id11], valueTachieBless2[2]);
  }
  if(id14 == 3){//顔グラ身体
    valueTachieBless3 = array;
    UTSU.PictureBreath3.on([id11], valueTachieBless3[2]);
  }
  if(id14 == 4){//顔グラ乳揺れ
    valueTachieBless4 = array;
    UTSU.PictureBreath4.on([id11], valueTachieBless4[2]);
  }
  if(id14 == 5){//イベントＣＧ
    valueTachieBless5 = array;
    UTSU.PictureBreath5.on([id11], valueTachieBless5[2]);
  }
  if(id14 == 6){//イベントＣＧ
    valueTachieBless6 = array;
    UTSU.PictureBreath6.on([id11], valueTachieBless6[2]);
  }
}

}

//パララックススクロール
parallax_scroll = function(id1,id2,id3,id4,id5,id6,id7){

$gameScreen.showParallax(id1,id2,0,id3);
$gameScreen.fadeParallax(id1,id7,id4);
$gameScreen.scrollParallax(id1,id5,id6);

}

//集中線真ん中picture_rotate(74,"ScreenConcentratedLineCenter",640,384,200,1,30);
picture_rotate = function(id1,id2,id3,id4,id5,id6,id7){

$gameScreen.showPicture(id1,
id2,1,id3,id4,0,0,0,1);
$gameScreen.movePicture(id1,1,
id3,id4,100,100,id5,id6,20);
$gameScreen.rotatePicture(id1, id7);
$gameScreen.startFlash([255,255,255,200],60);

}

//主人公パッシブ獲得
actor_skillMasteryGet = function(id1,id2){

var value = id1;
var actor = $gameActors.actor($gameVariables.value(11)); 
actor.gainSkillMasteryUses(value,$gameVariables.value(203));//変更熟練度
var value1 = `\\C[1]＜${$dataSkills[value].name}＞\\C[0]熟練度\\C[10]\\V[203]\\C[0]獲得！\n`;
$gameVariables.setValue(id2,$gameVariables.value(id2)+value1);

}

//現状確認時直前シーンCG表示
genjou_tyokuzenScene = function(){

var value = 50;
var value3 = 0;
var start = $gameVariables.value(73);
var end = $gameVariables.value(74);
for(var i = start; i <= end; i++){
  $gameVariables.setValue(20,i);
  var actor = $gameActors.actor($gameVariables.value(20));
  if($gameParty.members().contains($gameActors.actor($gameVariables.value(20)))){
    var value2 = $gameVariables.value($gameVariables.value(20)+380)[46];
    if(value2 == 0){
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
      $gameScreen.showPicture(value+1,value2,0,-200,0,100,100,0,0);
      $gameScreen.movePicture(value+1,0,0,0,100,100,255,0,20);
    }
    value += 2;
    value3 += 1
}}
var value = 50;
if(value3 == 2){
  $gameScreen.movePicture(value+3,0,512,0,100,100,255,0,20);
  $gameScreen.movePicture(value+4,0,512,0,100,100,255,0,20);
}
if(value3 >= 3){ 
  for(var i = value; i <= value+value3; i++){
    $gameScreen.picture(i)._scaleX = 50;
    $gameScreen.picture(i)._scaleY = 50;
    if(i == 2){
      $gameScreen.picture(i)._x = 256;
      $gameScreen.picture(i)._y = 384;
    }
    if(i == 3){
      $gameScreen.picture(i)._x = 0;
      $gameScreen.picture(i)._y = 384;
    }
    if(i == 4){
      $gameScreen.picture(i)._x = 256;
      $gameScreen.picture(i)._y = 384;
    }
    if(i == 5){
      $gameScreen.picture(i)._x = 512;
      $gameScreen.picture(i)._y = 0;
    }
    if(i == 6){
      $gameScreen.picture(i)._x = 768;
      $gameScreen.picture(i)._y = 384;
    }
    if(i == 7){
      $gameScreen.picture(i)._x = 512;
      $gameScreen.picture(i)._y = 384;
    }
    if(i == 8){
      $gameScreen.picture(i)._x = 768;
      $gameScreen.picture(i)._y = 384;
    }
}}

}

//ピクチャ更新時の音演出
picture_se1 = function(){

AudioManager.playSe({"name":"Z_CGDispray","volume":25,"pitch":150,"pan":0});

}

//移動ルートでピクチャ処理//ﾋﾟｸid,x,y,scale,opa,wait
picture_ParallelMove = function(id1,id2,id3,id4,id5,id6){

valueCharaWaitCountarray1 [0,0,0,0,0,0,0,0,0,0,0];
valueCharaWaitCountarray2 [0,0,0,0,0,0,0,0,0,0,0];
if($gameScreen.picture(id1)){
  valueCharaWaitCountarray1[1] = id1;
  valueCharaWaitCountarray1[2] = $gameScreen.picture(id1).x();
  valueCharaWaitCountarray1[3] = $gameScreen.picture(id1).y();
  valueCharaWaitCountarray1[4] = $gameScreen.picture(id1).scaleX();
  valueCharaWaitCountarray1[5] = $gameScreen.picture(id1).scaleY();
  valueCharaWaitCountarray1[6] = id5;
  valueCharaWaitCountarray1[7] = $gameScreen.picture(id1).blendMode();
  valueCharaWaitCountarray1[8] = id6;
  valueCharaWaitCountarray2[2] = $gameScreen.picture(id1).x() + id2;
  valueCharaWaitCountarray2[3] = $gameScreen.picture(id1).y() + id3;
  valueCharaWaitCountarray2[4] = $gameScreen.picture(id1).scaleX() + id4;
  valueCharaWaitCountarray2[5] = $gameScreen.picture(id1).scaleY() + id4;
  valueCharaWaitCountarray2[6] = $gameScreen.picture(id1).opacity();
  valueCharaWaitCountarray2[7] = $gameScreen.picture(id1).blendMode();
  if(!!$gameMap.event(1)) {
    $gameMap.event(1).forceMoveRoute({
    "list":[
      {"code":45,"parameters": ["if($gameScreen.picture(valueCharaWaitCountarray1[1])){$gameScreen.movePicture(valueCharaWaitCountarray1[1],1,valueCharaWaitCountarray1[2],valueCharaWaitCountarray1[3],valueCharaWaitCountarray1[4],valueCharaWaitCountarray1[5],valueCharaWaitCountarray1[6],valueCharaWaitCountarray1[7],valueCharaWaitCountarray1[8] + (Math.floor( Math.random() * 11) - 5))}"]},
      {"code":15, "parameters":[valueCharaWaitCountarray1[8] + (Math.floor( Math.random() * 11) - 5)]},
      {"code":45,"parameters": ["if($gameScreen.picture(valueCharaWaitCountarray1[1])){$gameScreen.movePicture(valueCharaWaitCountarray1[1],1,valueCharaWaitCountarray2[2] + (Math.floor( Math.random() * 3) - 2),valueCharaWaitCountarray2[3] + (Math.floor( Math.random() * 3) - 2),valueCharaWaitCountarray2[4] + (Math.floor( Math.random() * 3) - 2),valueCharaWaitCountarray2[5] + (Math.floor( Math.random() * 3) - 2),valueCharaWaitCountarray2[6],valueCharaWaitCountarray2[7],valueCharaWaitCountarray1[8] + (Math.floor( Math.random() * 11) - 5))}"]},
      {"code":15, "parameters":[valueCharaWaitCountarray1[8] + (Math.floor( Math.random() * 11) - 5)]},
    {"code":0}],"repeat":true,"skippable":true});
  }
}

}

//ﾋﾟｸid,ﾌｧｲﾙ,x,y,scale,wait,0そのまま1横ズレ2拡縮,最後は変更数値pic_showMove1(valuePic1+3,valueScenePic+'03',640-128,384,100,60,0,0);
pic_showMove1 = function(id1,id2,id3,id4,id5,id6,id7,id8){

var value1 = 0;
var value2 = 0;
if(id7 == 1){
  var value1 = id8;
}
if(id7 == 2){
  var value2 = id8;
}
$gameScreen.showPicture(id1,id2,1,id3 + value1,id4,id5 + value2,id5 + value2,0,0);
$gameScreen.movePicture(id1,1,id3,id4,id5,id5,255,0,id6);

}

//エネミーステートでドロップ
//enemy_drop = function(user,enemy){

//}

//}());
