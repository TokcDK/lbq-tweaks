/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){

menu_particleSet = function(){//メニューパーティクル設定

if($gameSwitches.value(15)){
  var value1 = 'particle_w1';
} else {
  var value1 = 'particle_w';
};
var value2 = 'above';
var actor = $gameParty.members()[0];
if(actor.isStateAffected(61)){var value1 = 'charm_bw2';var value2 = 'above'};
if(actor._subclassId == 41 || actor._subclassId == 42){var value1 = 'romantic_mood';var value2 = 'below'};
$gameScreen._particle.particleSet(0,'menu','Scene_Menu',value1,value2);
if(actor._subclassId == 41 || actor._subclassId == 42){

} else {
  if(actor.isStateAffected(61)){
    var value2 = 0.1;
    var value3 = '#e200ff';
    var value4 = '#ffffff';
    if(actor.isLearnedSkill(61)){var value2 = 0.09};
    if(actor.isLearnedSkill(62)){var value2 = 0.08};
    if(actor.isLearnedSkill(63)){var value2 = 0.07};
    if(actor.isLearnedSkill(64)){var value2 = 0.06};
    if(actor.isLearnedSkill(65)){var value2 = 0.05;var value4 = '#ff003b'};
    if(actor.isLearnedSkill(66)){var value2 = 0.04};
    if(actor.isLearnedSkill(67)){var value2 = 0.03};
    if(actor.isLearnedSkill(68)){var value2 = 0.02};
    if(actor.isLearnedSkill(69)){var value2 = 0.01};
    if(actor.isLearnedSkill(70)){var value2 = 0.01};
    $gameScreen._particle.particleUpdate(['menu','frequency',String(value2)]);
    $gameScreen._particle.particleUpdate(['menu','color',String(value3),String(value4)]);
  } else {
    if($gameSwitches.value(201)){
      var value2 = -20;
      var value3 = '#ff77b6';
      var value4 = '#fffdb9';
      $gameScreen._particle.particleUpdate(['menu','acceleration','0',String(value2)]);
      $gameScreen._particle.particleUpdate(['menu','color',String(value3),String(value4)]);
    };
  };
};
$gameScreen._particle.particleExceed('menu',60);

};

//天候設定
weather_set = function(){

valueWeather = Array(51).fill(0);

var arr1 = [0.1,0.15,0.20,0.25,0.30];//暗闇の視界制限
var value2 =  arr1[Math.floor(Math.random() * arr1.length)];
valueWeather[1] = value2;
var value2 =  Math.floor( Math.random() * 6) + 1;
valueWeather[2] = value2;
var arr1 = [0.3,0.4,0.5];//六色ネオン
var value2 =  arr1[Math.floor(Math.random() * arr1.length)];
valueWeather[3] = value2;
var arr1 = [0.02,0.03,0.04,0.05,0.06];//薄いフォグ
var value2 =  arr1[Math.floor(Math.random() * arr1.length)];
valueWeather[4] = value2;
var value2 =  Math.floor( Math.random() * 6) + 5;
valueWeather[5] = value2;
var value2 =  Math.floor( Math.random() * 51) + 50;
valueWeather[6] = value2;
var arr1 = [0.05,0.06,0.07,0.08,0.09];//モヤの影
var value2 =  arr1[Math.floor(Math.random() * arr1.length)];
valueWeather[7] = value2;//透明
var value2 =  Math.floor( Math.random() * 51) + 50;
valueWeather[8] = value2;//速度
var value2 =  Math.floor( Math.random() * 6) + 5;
valueWeather[9] = value2;//スケール
var arr1 = [-500,0,600];//全体マップ
var value2 =  arr1[Math.floor(Math.random() * arr1.length)];
valueWeather[10] = value2;
var arr1 = [0.25,0.30,0.35,0.40];
var value2 =  arr1[Math.floor(Math.random() * arr1.length)];
valueWeather[11] = value2;
var value2 =  Math.floor( Math.random() * 5) + 6;
valueWeather[12] = value2;
var value2 =  Math.floor( Math.random() * 26) + 25;//天候:雲
valueWeather[13] = value2;
var arr1 = [0.30,0.31,0.32,0.33,0.35,0.35,0.36,0.37,0.38,0.39,0.40,0.45];//雲透明
var value2 =  arr1[Math.floor(Math.random() * arr1.length)];
valueWeather[14] = value2;
var value2 =  Math.floor( Math.random() * 76) + 25;//雲の影
valueWeather[15] = value2;//速度
var arr1 = [0.10,0.15,0.20,0.25,0.30,0.35,0.40];
var value2 =  arr1[Math.floor(Math.random() * arr1.length)];
valueWeather[16] = value2;//透明度
var arr1 = [0.1,0.11,0.12,0.13,0.14,0.15];//木漏れ日[weather]
var value2 =  arr1[Math.floor(Math.random() * arr1.length)];
valueWeather[17] = value2;
var value2 =  Math.floor( Math.random() * 8) + 7;
var value3 =  Math.floor( Math.random() * 10) + 15;
valueWeather[18] = value2;
valueWeather[19] = value3;
var value2 =  Math.floor( Math.random() * 5) + 0;
valueWeather[20] = value2;
var arr1 = [-500,0,600];//太陽光のフレア
var value2 =  arr1[Math.floor(Math.random() * arr1.length)];
valueWeather[21] = value2;
var arr1 = [0.5,0.6,0.7,0.8,0.9,1.0];
var value2 =  arr1[Math.floor(Math.random() * arr1.length)];
valueWeather[22] = value2;
var value2 =  Math.floor( Math.random() * 3) + 4;
valueWeather[23] = value2;
var arr1 = [0.05,0.06,0.07];//淡いライトリーク。夜の街。
var value2 =  arr1[Math.floor(Math.random() * arr1.length)];
valueWeather[24] = value2;
var value2 =  Math.floor( Math.random() * 41) + 10;
valueWeather[25] = value2;
var arr1 = [0.06,0.07,0.08,0.09,0.05];//青&緑のライトリーク
var value2 =  arr1[Math.floor(Math.random() * arr1.length)];
valueWeather[26] = value2;
var value2 =  Math.floor( Math.random() * 5) + 1;
valueWeather[27] = value2;
var arr1 = [0.08,0.09,0.10,0.11,0.12];//fog_battle_front
var value2 =  arr1[Math.floor(Math.random() * arr1.length)];
valueWeather[28] = value2;
var value2 =  Math.floor( Math.random() * 71) + 30;
valueWeather[29] = value2;
var value2 =  Math.floor( Math.random() * 81) + 20;
valueWeather[30] = value2;//particle_w2
valueWeather[31] = value2;
valueWeather[32] = value2;
valueWeather[33] = value2;

var value2 =  Math.floor( Math.random() * 51) + 150;
valueWeather[46] = value2;
var value2 =  Math.floor( Math.random() * 51) + 100;//ダンジョン暗さ
valueWeather[47] = value2;
var value2 = [1,2,3,4,5,6][Math.floor(Math.random() * 6)];//空夜パターン
valueWeather[48] = value2;
var value2 = [1,2,3,4,5,6,7,8,9,10][Math.floor(Math.random() * 10)];//空パターン
valueWeather[49] = value2;
var value2 = [-1,-2,-3,-4,-5][Math.floor(Math.random() * 5)];//xスクロール
valueWeather[50] = value2;

};

//マップの環境パーティクル設定と色調と遠景
map_weatherSet1 = function(){

var valueDarkness = 0;
var valueLightChara = 0;
if($gameMap.parallaxName() === "BlueSky" && $gameSwitches.value(15)){
  $gameMap.changeParallax("StarlitSky",true,false,1,0);
};
if($dataMap.meta['LightChara']){//<LightChara:1, 3, 200, 0.1>
  var arr1 = $dataMap.meta['LightChara'].split(',');
  var valueLightChara = Number(arr1[0]);
};
if(!$gameSwitches.value(212)){
  if($gameSwitches.value(15)){
    var valueDarkness = valueWeather[46];
  };
  if($gameSwitches.value(207) && $gameSwitches.value(204)){//屋内ダンジョン
    var valueDarkness = valueWeather[47];
  };
};
if($dataMap.meta['DarkSource']){
  var valueDarkness = Number($dataMap.meta['DarkSource']);
};
if($gameSwitches.value(209) || $gameSwitches.value(227)){
  if($gameSwitches.value(15)){
    $gameVariables.setValue(197,"SkyPatternNight");
    var value2 = valueWeather[48];
  }else{
    $gameVariables.setValue(197,"SkyPattern");
    var value2 = valueWeather[49];
  }
  var value1 = valueWeather[50];
  $gameMap.changeParallax($gameVariables.value(197)+value2,true,false,value1,0);
};
if(valueDarkness >= 1){
  $gameMap.darknessOpacity = valueDarkness;
};
if(valueLightChara >= 1){
  $gamePlayer.moveLight(Number(arr1[0]), Number(arr1[1]), Number(arr1[2]), Number(arr1[3]));
};
if(!$gameSwitches.value(46)){
  map_weatherSet2();
};
map_regionSet();
};

//マップの環境パーティクル設定と色調と遠景
map_weatherSet2 = function(){

if($gameParty.inBattle()){
  var valueWeather1 = 'battleWeather';
} else {
  var valueWeather1 = 'weather';
};
var value2 = 'click';
$gameScreen._particle.particleSet(0,value2,'click','def','above');
$gameScreen._particle.particleSet(0,value2,'click2','def','above');
if(!$gameSwitches.value(201) && $gameSwitches.value(205)){
  var value2 = 'dust_walk';
  $gameScreen._particle.particleSet(0,value2,'walk:player','def','below');
};
var value10 = 0;
if($gameSwitches.value(15)){
  var value11 = $gameVariables.value(251);
} else {
  var value11 = $gameVariables.value(256);
};
$gameSystem.setBgsFadeForSe(10);

if(value11 == 1){
  var value1 = 'darkness_s';//暗闇の視界制限
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
  var value2 = valueWeather[1];
  $gameScreen._particle.particleUpdate([value1,'alpha','0',value2+'@0.5','0']);
  var value2 = valueWeather[2];
  $gameScreen._particle.particleUpdate([value1,'speed',String(value2),String(value2)]);
};
if(value11 == 2){
  var value1 = 'rain_fog_w';//雨天時のモヤ
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
  var value10 = 1;
};
if(value11 == 3){
  var value1 = 'dust_w';//薄暗い廃墟など
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
  var value10 = 1;
};
if(value11 == 4){
  var value1 = 'rain_w';//しとしと雨
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
  var value1 = 'rain_fog_w';//雨天時のモヤ
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
  //var value10 = 1;他と共存させる。
  $gameSystem.setBgsLine(10);
  AudioManager.playBgs({"name":"11_Drips","volume":25,"pitch":100,"pan":0});
};
if(value11 == 5){
  var value1 = 'rain_w2';//強めの雨
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
  var value1 = 'rain_fog_w';//雨天時のモヤ
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
  $gameSystem.setBgsLine(10);
  AudioManager.playBgs({"name":"11_Storm1","volume":20,"pitch":150,"pan":0});
  var value10 = 1;
};
if(value11 == 6){
  var value1 = 'rain_w3';//本降りの雨
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
  $gameSystem.setBgsLine(10);
  AudioManager.playBgs({"name":"11_Storm1","volume":25,"pitch":100,"pan":0});
  var value10 = 1;
};
if(value11 == 7){
  var value1 = 'snow_w';//うっすらと降る雪
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
  var value1 = 'snow_w2';//雪の結晶
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
};
if(value11 == 8){
  var value1 = 'blizard_w';//吹雪
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
  $gameSystem.setBgsLine(10);
  AudioManager.playBgs({"name":"11_Wind","volume":25,"pitch":50,"pan":0});
  var value10 = 1;
};
if(value11 == 9){
  var value1 = 'thunder_w';//ピカッと一瞬光る稲妻
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
  $gameSystem.setBgsLine(10);
  AudioManager.playBgs({"name":"11_Thunder","volume":50,"pitch":150,"pan":0});
};
if(value11 == 10){
  var value1 = 'thunder_w2';//黄色の稲妻
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
  $gameSystem.setBgsLine(10);
  AudioManager.playBgs({"name":"11_Thunder","volume":50,"pitch":100,"pan":0});
};
if(value11 == 11){
  var value1 = 'dust_w';//火事現場
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','spriteset');
  var value1 = 'particle_w';
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','spriteset');
  var value1 = 'sparks_w';
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','spriteset');
  var value1 = 'sparks_w2';
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','spriteset');
  var value1 = 'narration_fire_s';
  $gameScreen._particle.particleGroupSet(0,value1,valueWeather1);
  $gameScreen.startTint([68,-34,-34,68], 10);
  $gameSystem.setBgsLine(10);
  AudioManager.playBgs({"name":"11_fire","volume":25,"pitch":80,"pan":0});
  var value10 = 1;
};
if(value11 == 12){
  var value1 = 'bubble_w';//海底
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','spriteset');
  var value1 = 'fog_w';
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','spriteset');
  var value1 = 'fish_w';
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','spriteset');
  var value1 = 'light_pillar_w';
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','spriteset');
  $gameScreen.startTint([-100,-30,0,0], 10);
  $gameScreen.startDisplacementFilter(2,2,10,'DisplacementMap');
  $gameScreen._particle.particleSet(0,'bubble_c','attach:player','def','99');
  $gameSystem.setBgsLine(10);
  AudioManager.playBgs({"name":"11_Sea","volume":25,"pitch":50,"pan":0});
  var value10 = 1;
};
if(value11 == 13){
  var value1 = 'flare_s';//太陽光のフレア//砂漠
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
  var arr1 = [-500,0,600];
  var value2 =  arr1[Math.floor(Math.random() * arr1.length)];
  $gameScreen._particle.particleUpdate([value1,'pos',String(value2),-600]);
  var arr1 = [0.5,0.6,0.7,0.8,0.9,1.0];
  var value2 =  arr1[Math.floor(Math.random() * arr1.length)];
  $gameScreen._particle.particleUpdate([value1,'alpha','0',value2+'@0.2',value2+'@0.8','0']);
  $gameScreen._particle.particleUpdate([value1,'scale','10','10']);
  var value10 = 1;
};
if(value11 == 14){
  var value1 = 'light_leak_s3';//六色ネオン
  $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
  var value2 = valueWeather[3];
  $gameScreen._particle.particleUpdate([value1,'alpha','0',value2+'@0.5','0']);
  var value10 = 1;
};
if(value11 == 15){

};
if(value10 >= 1){
  var arr1 = ['fog_w','fog_shadow_w','flash_s','cloud_w','stardust_w','cloud_shadow_w',
  'dappled_r1','flare_s','light_leak_s','light_leak_s2'];
  var list = arr1;
  list.forEach(function(id) {
    $gameScreen._particle.particleClear(id);
  }, this);
};
if(value10 == 0){
  if($gameSwitches.value(207) && $gameSwitches.value(204)){
    var value1 = 'fog_w';//薄いフォグ
    $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
    var value2 = valueWeather[4];
    $gameScreen._particle.particleUpdate([value1,'alpha','0',value2+'@0.05',value2+'@0.9','0']);
    var value2 = valueWeather[5];
    $gameScreen._particle.particleUpdate([value1,'scale',String(value2),value2+'@0.5',String(value2)]);
    var value2 = valueWeather[6];
    $gameScreen._particle.particleUpdate([value1,'speed',String(value2),String(value2)]);
  };
  if($gameSwitches.value(207) && $gameSwitches.value(203)){
    var value1 = 'fog_shadow_w';//モヤの影
    $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
    var value2 = valueWeather[7];
    $gameScreen._particle.particleUpdate([value1,'alpha','0',value2+'@0.05',value2+'@0.9','0']);
    var value2 = valueWeather[8];
    $gameScreen._particle.particleUpdate([value1,'speed',String(value2),String(value2)]);
    var value2 = valueWeather[9];
    $gameScreen._particle.particleUpdate([value1,'scale',String(value2),value2+'@0.5',String(value2)]);
  };
  if($gameSwitches.value(209) || $gameSwitches.value(227)){//全体マップと艦橋マップ
    var value1 = 'flash_s';//太陽光のフラッシュ
    $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
    var value2 = valueWeather[10];
    $gameScreen._particle.particleUpdate([value1,'pos',String(value2),-600]);
    var value2 = valueWeather[11];
    $gameScreen._particle.particleUpdate([value1,'alpha','0',value2+'@0.2','0']);
    var value2 = valueWeather[12];
    $gameScreen._particle.particleUpdate([value1,'scale',String(value2),String(value2)]);
    var value1 = 'cloud_w';//天候:雲
    $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
    var value2 = valueWeather[13];
    $gameScreen._particle.particleUpdate([value1,'speed',String(value2),String(value2)]);
    var value2 = valueWeather[14];
    $gameScreen._particle.particleUpdate([value1,'alpha','0',value2+'@0.05',value2+'@0.9','0']);
    var value1 = 'particle_w2';//空域図浮遊パーティクル
    $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
    var value2 = valueWeather[30];
    $gameScreen._particle.particleUpdate([value1,'speed',String(value2),'10']);
  } else {
    if($gameSwitches.value(13) && $gameSwitches.value(203)){
      var value1 = 'cloud_shadow_w';//雲の影
      $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
      var value2 = valueWeather[15];
      $gameScreen._particle.particleUpdate([value1,'speed',String(value2),String(value2)]);
      var value2 = valueWeather[16];
      $gameScreen._particle.particleUpdate([value1,'alpha','0',value2+'@0.05',value2+'@0.9','0']);
      var value1 = 'dappled_r1';//木漏れ日[weather]
      $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
      var value2 = valueWeather[17];
      $gameScreen._particle.particleUpdate([value1,'alpha','0',value2+'@0.4',value2+'@0.6','0']);
      var value2 = valueWeather[18];
      var value3 = valueWeather[19];
      $gameScreen._particle.particleUpdate([value1,'scale',String(value2),String(value3)]);
      var value2 = valueWeather[20];
      $gameScreen._particle.particleUpdate([value1,'speed',String(value2),String(value2)]);
    };
  };
  if($gameSwitches.value(205) && $gameSwitches.value(15)){
    var value1 = 'stardust_w';//スターダスト。野外屋外フィールド
    $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
  };
  if($gameSwitches.value(14) && $gameSwitches.value(203) ){
    var value1 = 'flare_s';//太陽光のフレア
    $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
    var value2 = valueWeather[21];
    $gameScreen._particle.particleUpdate([value1,'pos',String(value2),-600]);
    var value2 = valueWeather[22];
    $gameScreen._particle.particleUpdate([value1,'alpha','0',value2+'@0.2',value2+'@0.8','0']);
    var value2 = valueWeather[23];
    $gameScreen._particle.particleUpdate([value1,'scale',String(value2),String(value2)]);
  };
  if($gameSwitches.value(15) && $gameSwitches.value(203)){
    var value1 = 'light_leak_s';//淡いライトリーク。夜の街。
    $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
    var value2 = valueWeather[24];
    $gameScreen._particle.particleUpdate([value1,'alpha','0',value2+'@0.1','0']);
    var value2 = valueWeather[25];
    $gameScreen._particle.particleUpdate([value1,'scale',String(value2),String(value2)]);
    var value1 = 'light_leak_s2';//青&緑のライトリーク
    $gameScreen._particle.particleSet(0,value1,valueWeather1,'def','99');
    var value2 = valueWeather[26];
    $gameScreen._particle.particleUpdate([value1,'alpha','0',value2+'@0.1','0']);
    var value2 = valueWeather[27];
    $gameScreen._particle.particleUpdate([value1,'scale',String(value2),value2+'@0.5',String(value2)]);
  };
};

};

//特定リージョンに対応したパーティクルと動的生成その他
map_regionSet = function(){

//if($gameMap.regionId($gamePlayer._realX, $gamePlayer._realY+1) == 91){
  //$gameSwitches.setValue(206,true);
//};
var arr1 = Array(151).fill(0);
for (var i = 0; i <= $gameMap.width() - 1; i++) {
  for (var j = 0; j <= $gameMap.height() - 1; j++) {
    if($gameMap.regionId(i,j) >= 1){    
      arr1[$gameMap.regionId(i,j)] += 1;
}}};
  valueRegionMapArray =  arr1;
  var value1 = 30;
  if(arr1[value1] >= 1){
    var value2 = 'dappled_r';
    $gameScreen._particle.particleSet(0,value2,'region:' + value1,'def','above');
  };
  var value1 = 31;
  if(arr1[value1] >= 1){
    var value2 = 'light_pillar_r';
    $gameScreen._particle.particleSet(0,value2,'region:' + value1,'def','above');
  };
  var value1 = 32;
  if(arr1[value1] >= 1){
    var value2 = 'light_floor_r';
    $gameScreen._particle.particleSet(0,value2,'region:' + value1,'def','below');
  };
  var value1 = 33;
  if(arr1[value1] >= 1){
    var value2 = 'bubble_cp';
    $gameScreen._particle.particleSet(0,value2,'region:' + value1,'def','above');
  };
  var value1 = 34;
  if(arr1[value1] >= 1){
    var value2 = 'darkness_r';
    $gameScreen._particle.particleSet(0,value2,'region:' + value1,'def','above');
  };
  var value1 = 35;
  if(arr1[value1] >= 1){
    var value2 = 'poison_r';
    $gameScreen._particle.particleSet(0,value2,'region:' + value1,'def','below');
  };
  var value1 = 36;
  if(arr1[value1] >= 1){
    $gameScreen._particle.particleSet(0,'dark_hole_r','region:' + value1,'def','above');
    $gameScreen._particle.particleSet(0,'dark_hole_r_2','region:' + value1,'def','above');
    $gameScreen._particle.particleSet(0,'dark_hole_r_3','region:' + value1,'def','above');
  };
  var value1 = 37;
  if(arr1[value1] >= 1){
    var value2 = 'magma_r';
    $gameScreen._particle.particleSet(0,value2,'region:' + value1,'def','below');
  };
  var value1 = 38;
  if(arr1[value1] >= 1){
    var value2 = 'ripple_r';
    $gameScreen._particle.particleSet(0,value2,'region:' + value1,'def','below');
  };
  var value1 = 3;
  if(arr1[value1] >= 1){
    $gameScreen._particle.particleSet(0,'splash_walk','walk:player:' + value1,'def','below');
    $gameScreen._particle.particleSet(0,'ripple_walk','walk:player:' + value1,'def','below');
  };
  //135拠点着替え 134拠点宿泊 133拠点クリスタルなし 123死体 119火災 130回復魔方陣 87滝下 2滝上
  var arr2 = [246,245,244,241, 99, 73, 83, 82, 81,241,241,241,203,200,199,186,183, 90,165,162,159,158,154,135,134, 67, 77, 87,  2, 61,100, 49, 60, 54, 66, 50, 51, 65, 97,101,115,123,119,117,138,231,48,116];//動的生成元イベントID
  var arr3 = [112,111,110,109,108,107,106,105,104,101,102,103, 18, 94, 95, 17, 60, 69, 70, 71, 72, 73, 74, 93, 92, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77, 76, 75, 29, 28, 20, 19, 16, 7,  6];//リージョンID
  for (var i = 0; i <= arr2.length-1; i++) {
    var value2 = Number(arr2[i]);//死体。npc配置で血痕
    var value1 = Number(arr3[i]);
    if(arr1[value1] >= 1){
      var map_width = $gameMap.width();
      var map_height = $gameMap.height();
        for (var y = 0; y < map_height; y++) {
          for (var x = 0; x < map_width; x++) {
            if($gameMap.regionId(x, y) == value1){
              $gameMap.spawnEvent(value2, x, y, true);
                if(value1 == 91 && $gameVariables.value(327)[$gameMap.mapId()] >= 1){
                  $gameSelfSwitches.setValue([$gameMap.mapId(), $gameMap.getLastSpawnEventId(), 'A'], true);
                };
        }}};
    };
  };
  if(!$gameSwitches.value(15)){    //夜に勝手に作成されるので、スクリプト夜生成禁止にする
  var value2 = 111;//立ちNPC
  for (var value1 = 24; value1 <= 27; value1++) {
    if(arr1[value1] >= 1){
      var map_width = $gameMap.width();
      var map_height = $gameMap.height();
        for (var y = 0; y < map_height; y++) {
          for (var x = 0; x < map_width; x++) {
            if($gameMap.regionId(x, y) == value1){
              $gameMap.spawnEvent(value2, x, y, true);
              var eventId = $gameMap.getLastSpawnEventId();
              var event = $gameMap.event(eventId);
              if(value1 == 24){event.setDirection(2)};//2,4,6,8
              if(value1 == 25){event.setDirection(4)};//2,4,6,8
              if(value1 == 26){event.setDirection(6)};//2,4,6,8
              if(value1 == 27){event.setDirection(8)};//2,4,6,8
        }}};
  }};
  };
  if($gameSwitches.value(15)){
  var value2 = 191;//立ちNPC
  for (var value1 = 41; value1 <= 44; value1++) {
    if(arr1[value1] >= 1){
      var map_width = $gameMap.width();
      var map_height = $gameMap.height();
        for (var y = 0; y < map_height; y++) {
          for (var x = 0; x < map_width; x++) {
            if($gameMap.regionId(x, y) == value1){
              $gameMap.spawnEvent(value2, x, y, true);
              var eventId = $gameMap.getLastSpawnEventId();
              var event = $gameMap.event(eventId);
              if(value1 == 41){event.setDirection(2)};//2,4,6,8
              if(value1 == 42){event.setDirection(4)};//2,4,6,8
              if(value1 == 43){event.setDirection(6)};//2,4,6,8
              if(value1 == 44){event.setDirection(8)};//2,4,6,8
        }}};
  }};
  };
  var value2 = 118;//食べ物全日。npc配置で湯気
  var value3 = true;
  for (var value1 = 21; value1 <= 23; value1++) {
    if(value1 == 22){
      var value2 = 121;
      if($gameSwitches.value(15)){var value3 = false};
    };
    if(value1 == 23){var value2 = 120};
    if(value3){
    if(arr1[value1] >= 1){
      var map_width = $gameMap.width();
      var map_height = $gameMap.height();
        for (var y = 0; y < map_height; y++) {
          for (var x = 0; x < map_width; x++) {
            if($gameMap.regionId(x, y) == value1){
              $gameMap.spawnEvent(value2, x, y, true);
        }}};
  }}};
  var value2 = 213;//天蓋つきベッド
  var value1 = 96;
  var map_width = $gameMap.width();
  var map_height = $gameMap.height();
  for (var y = 0; y < map_height; y++) {
    for (var x = 0; x < map_width; x++) {
      if($gameMap.regionId(x, y) == value1){
        $gameMap.spawnEvent(value2, x, y, true);
        $gameMap.spawnEvent(value2+1, x, y, true);
        $gameMap.spawnEvent(value2+2, x, y, true);
  }}};
};

//ADVパート演出
adv_partDirectPlay = function(id1){

if(id1 == 0){
  if($gameScreen._tone_temp != 0){
    $gameScreen.startTint($gameScreen._tone_temp, 10);
    $gameScreen._tone_temp = 0;
  };
  var arr1 = ['gloom_sp','glitter_sp','hearts_sp','questions_sp','feather_sp','ether_sp','lines_sp','direct_screenRing',
  'direct_screenDiffusion1','text_dispray1','direct_screenRing','direct_screenDiffusion2','direct_screenDiffusion3',
  'direct_screenSquare'];
  for (var i = 0; i <= arr1.length-1; i++) {
    $gameScreen._particle.particleClear(arr1[i]);
  };
};
if(id1 == 1){
  var value1 = 'gloom_sp';//どんより
  var value2 = "Down3";
  AudioManager.playSe({"name":value2,"volume":90,"pitch":70,"pan":0});
  $gameScreen.startFlash([0,0,0,200], 120);
  $gameScreen._particle.particlePlay(0,value1,'screen','def','screen');
};
if(id1 == 2){
  var value1 = 'glitter_sp';//
  $gameScreen.startFlash([255,255,255,200], 120);
  var value2 = "Up3";
  AudioManager.playSe({"name":value2,"volume":90,"pitch":100,"pan":0});
  $gameScreen._particle.particlePlay(0,value1,'screen','def','screen');
};
if(id1 == 3){
  var value1 = 'hearts_sp';//
  $gameScreen.startFlash([255,119,255,200], 120);
  var value2 = "11_Sexy";
  AudioManager.playMe({"name":value2,"volume":90,"pitch":150,"pan":0});
  $gameScreen._particle.particlePlay(0,value1,'screen','def','screen');
};
if(id1 == 4){
  var value1 = 'questions_sp';//
  $gameScreen.startFlash([255,255,255,200], 120);
  var value2 = "Saint1";
  AudioManager.playSe({"name":value2,"volume":90,"pitch":70,"pan":0});
  $gameScreen._particle.particlePlay(0,value1,'screen','def','screen');
};
if(id1 == 5){
  var value1 = 'feather_sp';//
  var value2 = "Z11_RareTreasureBox";
  AudioManager.playSe({"name":value2,"volume":60,"pitch":100,"pan":0});
  $gameScreen._particle.particlePlay(0,value1,'screen','def','screen');
};
if(id1 == 6){
  var value1 = 'ether_sp';//戦闘敗北時
  var value2 = "Z_Summoning";
  AudioManager.playSe({"name":value2,"volume":60,"pitch":120,"pan":0});
  $gameScreen._particle.particlePlay(0,value1,'screen','def','spriteset');
  var value1 = `拠点に強制帰還されます…。`;
  TickerManager.show(value1);
};
if(id1 == 7){
  var value1 = 'lines_sp';//集中線
  $gameScreen.startFlash([255,255,255,200], 120);
  var value2 = "Wind1";
  AudioManager.playSe({"name":value2,"volume":90,"pitch":120,"pan":0});
  $gameScreen._particle.particlePlay(0,value1,'screen','def','screen');
};
if(id1 == 8){//宝箱レア演出。元コモンで色調変更
  $gameScreen.startFlash([255,255,255,200], 30);
    if($gameScreen._tone_temp == 0){
      $gameScreen._tone_temp = $gameScreen.tone().concat();  
      $gameScreen.startTint([-100,-100,-100,150], 10);
    };
  picture_motion1("smooth",[0]);
  var value1 = 100;//文字ピクチャ。元コモンで実行している。
  $gameScreen.showPicture(value1,"",1,640+200,384,100,100,0,0);
  $gameScreen.movePicture(value1,1,640,384,100,100,255,0,60);
  var value1 = 99;
  var value2 = 'ScreenCenterTextDisPray';
  $gameScreen.showPicture(value1,value2,1,640+200,384,100,0,0,0);
  $gameScreen.movePicture(value1,1,640,384,100,50,200,0,60);
  var value1 = 'direct_screenRing';//
  $gameScreen._particle.particlePlay(0,value1,'screen','def','screen');
  var value1 = 'direct_screenDiffusion1';//
  $gameScreen._particle.particlePlay(0,value1,'screen','def','screen');
};
if(id1 == 9){//仲間加入
  $gameScreen.startFlash([255,255,255,200], 30);
    if($gameScreen._tone_temp == 0){
      $gameScreen._tone_temp = $gameScreen.tone().concat();  
      $gameScreen.startTint([-100,-100,-100,150], 10);
    };
  picture_motion1("smooth",[0]);
  var value1 = 99;
  var value2 = 'ScreenCenterTextDisPray';
  $gameScreen.showPicture(value1,value2,1,640+200,384,100,0,0,0);
  $gameScreen.movePicture(value1,1,640,384,100,50,200,0,30);
  var value1 = 'text_dispray1';//仲間加入
  $gameScreen._particle.particleSet(0,value1,'screen','def','screen');
  $gameScreen._particle.particleUpdate([value1,'pos',-600,20]);
  if($dataActors[$gameVariables.value(20)].meta['NpcChara']){
    $gameScreen._particle.particleUpdate([value1,'color','#e59fff','#6d80ff']);
  };
  var value1 = `\\V[53]\\V[49]がパーティに加わった！`;
  var value2 = 28;
  $gameScreen.setDTextPicture(value1, value2);
  var value1 = 100;
  $gameScreen.showPicture(value1,"",1,640,384,100,100,0,0);
  if(isGirl($gameActors.actor($gameVariables.value(20)))){
    $gameScreen.movePicture(value1,1,640-200,384,100,100,255,0,30);
  } else {
    $gameScreen.movePicture(value1,1,640-50,384,100,100,255,0,30);
  };
  var arr1 = [2,6];
  var value1 = arr1[Math.floor(Math.random() * arr1.length)];
  valueFaceSelect = value1; 
  $gameSwitches.setValue(436,true);
  battle_bustUp(101,550,0,40);
  $gameSwitches.setValue(436,false);
};
if(id1 == 10){//ワープポイントアクティベート
  var value1 = "Item4";
  AudioManager.playSe({"name":value2,"volume":50,"pitch":50,"pan":0});
  $gameScreen.startFlash([255,255,255,200], 30);
    if($gameScreen._tone_temp == 0){
      $gameScreen._tone_temp = $gameScreen.tone().concat();  
      $gameScreen.startTint([-100,-100,-100,150], 10);
    };
  picture_motion1("smooth",[0]);
  var value1 = 100;//文字ピクチャ。。元コモンで実行している。
  $gameScreen.showPicture(value1,"",1,640,384,100,100,0,0);
  $gameScreen.movePicture(value1,1,640,384,100,100,255,0,60);
  var value1 = 99;
  var value2 = 'ScreenCenterTextDisPray';
  $gameScreen.showPicture(value1,value2,1,640+200,384,100,0,0,0);
  $gameScreen.movePicture(value1,1,640,384,100,50,200,0,60);
  var value1 = 'direct_screenRing';//
  $gameScreen._particle.particlePlay(0,value1,'screen','def','screen');
  var value1 = 'direct_screenDiffusion2';//
  $gameScreen._particle.particlePlay(0,value1,'screen','def','screen');
};
if(id1 == 11){//拠点アクティベート
  var value1 = "Item4";
  AudioManager.playSe({"name":value2,"volume":50,"pitch":50,"pan":0});
  $gameScreen.startFlash([255,255,255,200], 30);
    if($gameScreen._tone_temp == 0){
      $gameScreen._tone_temp = $gameScreen.tone().concat();  
      $gameScreen.startTint([-100,-100,-100,150], 10);
    };
  picture_motion1("smooth",[0]);
  var value1 = 100;//文字ピクチャ。。元コモンで実行している。
  $gameScreen.showPicture(value1,"",1,640,384,100,100,0,0);
  $gameScreen.movePicture(value1,1,640,384,100,100,255,0,60);
  var value1 = 99;
  var value2 = 'ScreenCenterTextDisPray';
  $gameScreen.showPicture(value1,value2,1,640+200,384,100,0,0,0);
  $gameScreen.movePicture(value1,1,640,384,100,50,200,0,60);
  var value1 = 'direct_screenRing';//
  $gameScreen._particle.particlePlay(0,value1,'screen','def','screen');
  var value1 = 'direct_screenDiffusion3';//
  $gameScreen._particle.particlePlay(0,value1,'screen','def','screen');
};
if(id1 == 12){//夜シーン強制
  picture_motion1("smooth",[0]);
  var value1 = 'direct_screenSquare';
  $gameScreen._particle.particlePlay(0,value1,'screen','def','screen');
  var value1 = `イベント自動発生`;
  var value2 = 28;
  $gameScreen.setDTextPicture(value1, value2);
  $gameScreen.dWindowFrame = 'ON';
  var value1 = 100;
  $gameScreen.showPicture(value1,"",1,640+50,384,100,100,0,0);
  $gameScreen.movePicture(value1,1,640,384,100,100,255,0,20);
};
if(id1 == 13){//シーンタイトル通知
  picture_motion1("smooth",[0]);
  var value1 = 102;
  var value2 = 'ScreenCenterTextDisPrayTitle';
  $gameScreen.showPicture(value1,value2,1,640-100,384-200,100,80,0,0);
  $gameScreen.movePicture(value1,1,640,384-200,100,80,200,0,30);
  var value1 = 'text_dispray1';
  $gameScreen._particle.particlePlay(0,value1,'screen','def','screen');
  $gameScreen._particle.particleUpdate([value1,'pos',-700,-200]);
  var value1 = `──\\V[142]──`;
  var value2 = 28;
  if($gameVariables.value(535) >= 1){
    $gameScreen.setDTextPicture(`\\f[b]\\C[13]${value1}\\C[0]`, value2);
  } else {
    $gameScreen.setDTextPicture(`\\f[b]\\C[16]${value1}\\C[0]`, value2);
  };
  var value1 = 103;
  $gameScreen.showPicture(value1,"",0,10,170,0,100,0,0);
  $gameScreen.movePicture(value1,0,50,170,100,100,255,0,30);
};
if(id1 == 14 || id1 == 15 || id1 == 16){//アイテムスキル称号獲得忘却。Ｈ通常どちらも。
  var id4 = $gameVariables.value(20);
  var id2 = $gameVariables.value(19);
  var actor = $gameActors.actor(id4);
  if(id1 == 14){valueItems = $dataItems};
  if(id1 == 15 || id1 == 16){valueItems = $dataSkills};
  if(id1 == 14){
    if(Number(valueItems[id2].meta['EICSwitch']) == 104){//通常
      var id3 = 1;
    } else {
      var id3 = 2;
    };
  };
  if(id1 == 15 || id1 == 16){
    if(valueItems[id2].stypeId == 14 || valueItems[id2].stypeId == 15){//Hスキル
      var id3 = 2;
    } else {
      var id3 = 1;
    };
  };
  if(id3 == 1){//通常
    AudioManager.playMe({"name":"21_SkillLearn","volume":60,"pitch":100,"pan":0});
    $gameScreen.startFlash([255,255,255,200], 30);
    $gameVariables.setValue(22,300); 
  } else {
    AudioManager.playSe({"name":"ZH_Sexy","volume":45,"pitch":100,"pan":0});
    $gameScreen.startFlash([255,119,255,204], 30);
    $gameVariables.setValue(22,242); 
  };
    if($gameScreen._tone_temp == 0){
      $gameScreen._tone_temp = $gameScreen.tone().concat();  
      $gameScreen.startTint([-100,-100,-100,150], 10);
    };
  picture_motion1("smooth",[0]);
  var value1 = 51;
  var value2 = 'ScreenCenterTextDisPrayOneRow';
  $gameScreen.showPicture(value1,value2,1,640+200,384,100,0,0,0);
  $gameScreen.movePicture(value1,1,640,384,100,100,250,0,60);
  var value1 = 'direct_screenRing';
  $gameScreen._particle.particleSet(0,value1,'screen','def','screen');
    if(id3 == 1){
      $gameScreen._particle.particleUpdate([value1,'color','#8fceff','#ffffff']);//通常
    } else {
      $gameScreen._particle.particleUpdate([value1,'color','#dc7dff','#ffffff']);//H関係
    };
    if(id3 == 1){
      var value1 = 'direct_screenDiffusion2';
    } else {
      var value1 = 'direct_screenDiffusionH';
    };
    $gameScreen._particle.particleSet(0,value1,'screen','def','screen');
    if(id3 == 1){
      $gameScreen._particle.particleUpdate([value1,'color','#8fceff','#ffffff']);//通常
    };
    if(id1 == 14){var value1 = `\\C[16]称号\\C[0]＜\\C[2]\x1bIIN[${id2}]\\C[0]＞獲得！`};
    if(id1 == 15){var value1 = `\\C[16]${$dataSystem.skillTypes[valueItems[id2].stypeId]}\\C[0]＜\\C[2]\x1bSIN[${id2}]\\C[0]＞獲得！`};
    if(id1 == 16){var value1 = `\\C[16]${$dataSystem.skillTypes[valueItems[id2].stypeId]}\\C[0]＜\\C[2]\x1bSIN[${id2}]\\C[0]＞忘却…`};
  var value2 = 28;
  $gameScreen.setDTextPicture(value1, value2);
  var value1 = 60;
  $gameScreen.showPicture(value1,"",1,640,384,100,100,0,0);
  $gameScreen.movePicture(value1,1,640-100,384,100,100,255,0,60);
    if(!$gameSwitches.value(29)){
      if(id1 == 14){$gameParty.gainItem(valueItems[id2], 1)};
      if(id1 == 15){actor.learnSkill(id2)};
      if(id1 == 16){actor.forgetSkill(id2)};
    };
    if(id3 == 1){
      var arr1 = [2,6];
      if(id4 == 1){arr1.push(53)};
    };
    if(id3 == 2){
      if(actor.isLearnedSkill(65)){
        var arr1 = [27,28,29,30,31,32,39,40,41];
      } else {
        var arr1 = [21,22,23,24,25];
      };
    };
    var value1 = arr1[Math.floor(Math.random() * arr1.length)];
    valueFaceSelect = value1; 
    $gameSwitches.setValue(436,true);
    battle_bustUp(52,550,0,120);
    $gameSwitches.setValue(436,false);
    valueWordSet0 = `解説文:\n${valueItems[id2].description}`;
};
if(id1 == 17){//汎用演出。valueWordSet0に文章入れておく。
  //console.log(`顔グラピクID変更の為にピクID変更の必要ありamygameParticle787行`);
  var actor = $gameActors.actor($gameVariables.value(20));
  $gameScreen.startFlash([255,255,255,200], 30);
    if($gameScreen._tone_temp == 0){
      $gameScreen._tone_temp = $gameScreen.tone().concat();  
      $gameScreen.startTint([-100,-100,-100,150], 10);
    };
  picture_motion1("smooth",[0]);
  var value1 = 51;
  var value2 = 'ScreenCenterTextDisPrayOneRow';
  var value3 = 100;
  if(valueWordSet0.match(/\n/)){
    var value3 = value3 * (valueWordSet0.split('\n').length);
  };
  $gameScreen.showPicture(value1,value2,1,640+200,384,100,0,0,0);
  $gameScreen.movePicture(value1,1,640,384,100,value3,250,0,60);
    var value1 = 'direct_screenRing';
    $gameScreen._particle.particleSet(0,value1,'screen','def','screen');
    $gameScreen._particle.particleUpdate([value1,'color','#007bff','#f7ff76']);
    var value1 = 'direct_screenDiffusion2';
    $gameScreen._particle.particleSet(0,value1,'screen','def','screen');
    $gameScreen._particle.particleUpdate([value1,'color','#007bff','#f7ff76']);
      var value1 = valueWordSet0;
      var value2 = 28;
      $gameScreen.setDTextPicture(value1, value2);
      var value1 = 60;
      $gameScreen.showPicture(value1,"",1,640,384,100,100,0,0);
      $gameScreen.movePicture(value1,1,640-200,384,100,100,255,0,60);
        var arr1 = [2,6];
        if($gameVariables.value(20) == 1){arr1.push(53)};//りしゃぶる。リーシャ。ドヤ顔
        var value1 = arr1[Math.floor(Math.random() * arr1.length)];
        valueFaceSelect = value1; 
        $gameSwitches.setValue(436,true);
        battle_bustUp(52,550,0,120);
        $gameSwitches.setValue(436,false);
};
if(id1 == 18){//汎用演出顔グラなし。valueWordSet0に文章入れておく。
  $gameScreen.startFlash([255,255,255,200], 30);
    if($gameScreen._tone_temp == 0){
      $gameScreen._tone_temp = $gameScreen.tone().concat();  
      $gameScreen.startTint([-100,-100,-100,150], 10);
    };
  picture_motion1("smooth",[0]);
  var value1 = 51;
  var value2 = 'ScreenCenterTextDisPrayOneRow';
  var value3 = 100;
  if(valueWordSet0.match(/\n/)){
    var value3 = value3 * (valueWordSet0.split('\n').length);
  };
  $gameScreen.showPicture(value1,value2,1,640+200,384,100,0,0,0);
  $gameScreen.movePicture(value1,1,640,384,100,value3,250,0,60);
    var value1 = 'direct_screenRing';
    $gameScreen._particle.particleSet(0,value1,'screen','def','screen');
    $gameScreen._particle.particleUpdate([value1,'color','#007bff','#f7ff76']);
    $gameScreen._particle.particleUpdate([value1,'colorMode','0']);
    var value1 = 'direct_screenDiffusion2';
    $gameScreen._particle.particleSet(0,value1,'screen','def','screen');
    $gameScreen._particle.particleUpdate([value1,'color','#007bff','#f7ff76']);
    $gameScreen._particle.particleUpdate([value1,'colorMode','0']);
      var value1 = valueWordSet0;
      var value2 = 28;
      $gameScreen.setDTextPicture(value1, value2);
      var value1 = 60;
      $gameScreen.showPicture(value1,"",1,640,384,100,100,0,0);
      $gameScreen.movePicture(value1,1,640,384,100,100,255,0,60);
};
if(id1 == 19){//汎用2行まで演出顔グラなしH。valueWordSet0に文章入れておく。
  //hSkill_rankUpWordDirect(1,1,671,1);で使用
  var value1 = Math.floor( Math.random() * 51) + 100;
  AudioManager.playSe({"name":'ZH_SexyVoice',"volume":50,"pitch":value1,"pan":0});
  $gameScreen.startFlash([255,119,255,200], 60);
    if($gameScreen._tone_temp == 0){
      $gameScreen._tone_temp = $gameScreen.tone().concat();  
      $gameScreen.startTint([-100,-100,-100,150], 10);
    };
  picture_motion1("smooth",[0]);
  var value1 = 108;
  var value2 = 'ScreenWordBackH';
  var value3 = 50;
  var actor = $gameActors.actor($gameVariables.value(2));
  if(actor.isLearnedSkill(63)){var value3 = 100};
  if(actor.isLearnedSkill(65)){var value3 = 150};
  if(actor.isLearnedSkill(68)){var value3 = 200};
  $gameScreen.showPicture(value1,value2,1,640,384,100,100,value3,0);
  picture_fade1(value1,"fadeIn",'Hscene005',120,5);
  var value1 = 109;
  var value2 = 'ScreenCenterTextDisPrayOneRow';
  var value3 = 100;
  if(valueWordSet0.match(/\n/)){
    var value3 = value3 * (valueWordSet0.split('\n').length);
  };
  $gameScreen.showPicture(value1,value2,1,640+200,384,100,0,0,0);
  $gameScreen.movePicture(value1,1,640,384,100,value3,250,0,60);
    var value1 = 'direct_screenRing';
    $gameScreen._particle.particleSet(0,value1,'screen','def','screen');
    $gameScreen._particle.particleUpdate([value1,'color','#dc7dff','#ffffff']);
    var value1 = 'direct_screenDiffusion2';
    $gameScreen._particle.particleSet(0,value1,'screen','def','screen');
    $gameScreen._particle.particleUpdate([value1,'color','#dc7dff','#ffffff']);
      var value1 = valueWordSet0;
      var value2 = 28;
      $gameScreen.setDTextPicture(value1, value2);
      var value1 = 110;
      $gameScreen.showPicture(value1,"",1,640,384,100,100,0,0);
      $gameScreen.movePicture(value1,1,640,384,100,100,255,0,60);
};
if(id1 == 20){//睡眠誘導光
  var value1 = 'ether_sp';
  $gameScreen._particle.particlePlay(0,value1,'screen','def','screen');
  var value2 = '#dd00ff';
  var value3 = '#86e3ff';
  $gameScreen._particle.particleUpdate([value1,'color',String(value2),String(value3)]);
  var value2 = '3';
  $gameScreen._particle.particleUpdate([value1,'emitterLifetime',String(value2)]);
  var value2 = '0.01';
  $gameScreen._particle.particleUpdate([value1,'frequency',String(value2)]);
  $gameScreen.startFlash([255,119,255,200], 60);
  var value2 = "Saint2";
  var value3 = Math.floor( Math.random() * 26) + 50;;
  AudioManager.playSe({"name":value2,"volume":90,"pitch":value3,"pan":0});
};
if(id1 == 21){//眠気の兆候
  var value1 = 'bubble_w';
  $gameScreen._particle.particlePlay(0,value1,'screen','def','screen');
  var value2 = '#ff00e9';
  var value3 = '#86e3ff';
  $gameScreen._particle.particleUpdate([value1,'color',String(value2),String(value3)]);
  var value2 = '0.05';
  $gameScreen._particle.particleUpdate([value1,'frequency',String(value2)]);
  var value2 = '3';
  $gameScreen._particle.particleUpdate([value1,'emitterLifetime',String(value2)]);
  var value2 = '45';
  var value3 = '0.5';
  $gameScreen._particle.particleUpdate([value1,'fluctuation',String(value2),String(value3)]);
  $gameScreen._particle.particleUpdate([value1,'scale','0','0.3@0.2','2@0.95','0.8']);
  var value2 = '5';
  var value3 = '7';
  $gameScreen._particle.particleUpdate([value1,'lifetime',String(value2),String(value3)]);
  $gameScreen._particle.particleUpdate([value1,'blendMode','0']);
  $gameScreen.startFlash([85,200,255,200], 60);
  var value2 = "Saint1";
  var value3 = Math.floor( Math.random() * 26) + 50;;
  AudioManager.playSe({"name":value2,"volume":90,"pitch":value3,"pan":0});
};
if(id1 == 22){
  var value2 = "Magic2";
  AudioManager.playSe({"name":value2,"volume":100,"pitch":70,"pan":0});
  $gameScreen.startFlash([136,0,0,150], 60);
  var value1 = 'htext_dispray1';
  $gameScreen._particle.particlePlay(0,value1,'screen','def','screen');
  var value1 = 'htext_dispray2';
  $gameScreen._particle.particlePlay(0,value1,'screen','def','screen');
};
if(id1 == 23){//催眠掛かる
  $gameScreen.startFlash([255,119,255,204], 60);
  var value2 = "Saint1";
  AudioManager.playSe({"name":value2,"volume":100,"pitch":130,"pan":0});
  $gameScreen.startFlash([136,0,0,150], 60);
  var value1 = 'explode_cp_4';
  $gameScreen._particle.particlePlay(0,value1,'screen','def','spriteset');
  $gameScreen._particle.particleUpdate([value1,'color','#242fff','#f1ff59']);
  $gameScreen._particle.particleUpdate([value1,'scale','1','0.7']);
  $gameScreen._particle.particleUpdate([value1,'particlesPerWave','10']);
  $gameScreen._particle.particleUpdate([value1,'ring',0,0,1280,0]);
  filter_direct(10,360,10,60);
};

};

//ADVパート演出クリアも。0でクリア
adv_partDirectSet = function(id1){

  if(id1 != 0 & id1 != 6 & id1 != 9){
    if($gameScreen._tone_temp == 0){
      $gameScreen._tone_temp = $gameScreen.tone().concat();  
      $gameScreen.startTint([-100,-100,-100,100], 10);//他より薄くしている
    };
  };
  if(id1 == 0){
    if($gameScreen._tone_temp != 0){
      $gameScreen.startTint($gameScreen._tone_temp, 10);
      $gameScreen._tone_temp = 0;
    };
    var arr1 = ['lines_width1','lines_width2','lines_width3','lines_width4','lines_height1','lines_height2','lines_height3','lines_height4',
               'lines_heightSB','lines_heightS','lines_sp1','shower_event','cloud_w_front','actor_particleLight','enemy_particleDark','cloud_w',
               'hologram_screen','lifeStorm_screen'];
    for (var i = 0; i <= arr1.length-1; i++) {
      $gameScreen._particle.particleClear(arr1[i]);
    };
  };
  if(id1 == 1){
    var value1 = 'lines_width1';
    $gameScreen._particle.particleSet(0,value1,'screen','def','above');
    var value1 = 'lines_width4';
    $gameScreen._particle.particleSet(0,value1,'screen','def','screen');
    var value1 = 'lines_width2';
    $gameScreen._particle.particleSet(0,value1,'screen','def','screen');
    var value1 = 'lines_width3';
    $gameScreen._particle.particleSet(0,value1,'screen','def','spriteset');
  };
  if(id1 == 2){
    var value1 = 'lines_height1';
    $gameScreen._particle.particleSet(0,value1,'screen','def','spriteset');
    var value1 = 'lines_height4';
    $gameScreen._particle.particleSet(0,value1,'screen','def','spriteset');
    var value1 = 'lines_height2';
    $gameScreen._particle.particleSet(0,value1,'screen','def','spriteset');
    var value1 = 'lines_height3';
    $gameScreen._particle.particleSet(0,value1,'screen','def','spriteset');
  };
  if(id1 == 3){
    var value1 = 'lines_heightSB';//下から粒子
    $gameScreen._particle.particleSet(0,value1,'screen','def','spriteset');
    var value1 = 'lines_heightS';//下から粒子
    $gameScreen._particle.particleSet(0,value1,'screen','def','spriteset');
  };
  if(id1 == 4){
    var value1 = 'lines_sp1';//集中線永続
    $gameScreen.startFlash([255,255,255,200], 120);
    var value2 = "Wind1";
    AudioManager.playSe({"name":value2,"volume":90,"pitch":120,"pan":0});
    $gameScreen._particle.particleSet(0,value1,'screen','def','spriteset');
  };
  if(id1 == 5){
    var value1 = 'shower_event';//シャワー
    var value2 = "z_Shower";
    AudioManager.playSe({"name":value2,"volume":90,"pitch":120,"pan":0});
    $gameScreen._particle.particleSet(0,value1,'screen','def','spriteset');
  };
  if(id1 == 6){
    var value1 = 'cloud_w_front';
    $gameScreen._particle.particleSet(0,value1,'weather','def','spriteset');
  };
  if(id1 == 7){
    $gameScreen.startFlash([255,255,255,200], 120);
    var value2 = "Up1";
    AudioManager.playSe({"name":value2,"volume":90,"pitch":110,"pan":0});
    var value1 = 'actor_particleLight';
    $gameScreen._particle.particleSet(0,value1,'weather','def','spriteset');
    $gameScreen._particle.particleUpdate([value1,'rect',-700,400,1300,768]);
  };
  if(id1 == 8){
    $gameScreen.startFlash([0,0,0,200], 120);
    var value2 = "Down4";
    AudioManager.playSe({"name":value2,"volume":90,"pitch":90,"pan":0});
    var value1 = 'enemy_particleDark';
    $gameScreen._particle.particleSet(0,value1,'weather','def','spriteset');
    $gameScreen._particle.particleUpdate([value1,'rect',-700,400,1300,768]);
  };
  if(id1 == 9){
    var value1 = 'cloud_w';//天候:雲
    $gameScreen._particle.particleSet(0,value1,'weather','def','spriteset');
  };
  if(id1 == 10){//生命の嵐
    var value1 = 'hologram_screen';
    $gameScreen._particle.particleSet(0,value1,'screen','def','spriteset');
    var value1 = 'lifeStorm_screen';
    $gameScreen._particle.particleSet(0,value1,'screen','def','spriteset');
  };

};

//フィルター演出filter_direct(1,640,384,0.01);//種類.x軸,y軸,強さ
filter_direct = function(id1,value1,value2,value3){//0消去1絶頂2洗脳3グニャ～4oldfilm5ノイズ発生6ノイズ濃さ7ぼかし/8ぼかし濃さ/10グリッチｳｪｲﾄのみ

if(id1 == 0){
  var list = ['zettyou','brainwashing','sepia','gunya1','noise1','bokasi','dokun'];
  list.forEach(function(id2) {
    $gameMap.eraseFilter(id2);
  }, this);
};
if(id1 == 1){
  $gameScreen.startFlash([255,119,255,204], 60);
  var value10 = 'zettyou';
  $gameMap.createFilter(value10,'shockwave',0,'screen');
  $gameMap.setFilter(value10,[value1,value2,-1,50,200,1.3]);
  $gameMap.setFilterAddiTime(value10,value3);
  $gameMap.eraseFilterAfterMove(value10);
};
if(id1 == 2){
  var value4 = 180;
  if(value3 == 0.02){var value4 = 180};
  if(value3 == 0.03){var value4 = 150};
  if(value3 == 0.04){var value4 = 120};
  if(value3 == 0.05){var value4 = 90};
  $gameScreen.startFlash([255,119,255,204], value4);
  var value10 = 'brainwashing';
  $gameMap.createFilter(value10,'shockwave',0,'screen');
  if(value3 >= 0.04){
    $gameMap.setFilter(value10,[value1,value2,-1,200,300,1]);
    var arr1 = ['ZH_sticky2',100,100];
    var value4 = Math.floor( Math.random() * 26) + Number(arr1[2]);
    $gameScreen.startShake(7, 7, 60);
  } else {
    $gameMap.setFilter(value10,[value1,value2,-1,30,160,1]);
    var arr1 = ['Saint1',75,50];
    var value4 = Math.floor( Math.random() * 26) + Number(arr1[2]);
  };
  AudioManager.playSe({"name":arr1[0],"volume":Number(arr1[1]),"pitch":value4,"pan":0});
  $gameMap.setFilterAddiTime(value10,value3);
};
if(id1 == 3){
  AudioManager.playSe({"name":"Z_BlackOut","volume":80,"pitch":50,"pan":0});
  var value10 = 'gunya1';
  $gameMap.createFilter(value10,'twist',0,'screen');
  $gameMap.setFilter(value10,[value1,value2,0,0]);
  $gameMap.moveFilterQueue(value10,[value1,value2,1280,2],180);
  $gameMap.moveFilterQueue(value10,[value1,value2,1280,4],180);
  $gameMap.moveFilterQueue(value10,[value1,value2,1280,6],180);
  $gameMap.moveFilterQueue(value10,[value1,value2,1280,8],180);
  $gameMap.moveFilterQueue(value10,[value1,value2,1280,10],800);
};
if(id1 == 4){
  var value10 = 'sepia';
  $gameMap.createFilter(value10,'oldfilm',0,'screen');
};
if(id1 == 5){
  var value10 = 'noise1';
  $gameMap.createFilter(value10,'noise',0,'screen');
  $gameMap.setFilter(value10,[value1]);
};
if(id1 == 6){
  $gameMap.moveFilterQueue(value10,[value1],value2);
};
if(id1 == 7){
  var value10 = 'bokasi';
  $gameMap.createFilter(value10,'blur',0,'screen');
  $gameMap.setFilter(value10,[value1]);
};
if(id1 == 8){
  $gameMap.moveFilterQueue(value10,[value1],value2);
};
if(id1 == 9){
  var value10 = 'dokun';
  $gameMap.createFilter(value10,'zoomblur',0,'screen');
  $gameMap.setFilter(value10,[value1,value2,0,0.5]);
  $gameMap.moveFilterQueue(value10,[value1,value2,0,0],value3);
  $gameMap.eraseFilterAfterMove(value10);
  var value4 = 100;
  if(value3 <= 20){var value4 = 100};
  if(value3 <= 10){var value4 = 150};
  if(value3 >= 30){var value4 = 90};
  if(value3 >= 40){var value4 = 80};
  if(value3 >= 60){var value4 = 50};
  AudioManager.playSe({"name":'Z_HeartBeat',"volume":90,"pitch":value4,"pan":0});
  $gameScreen.startFlash([255,255,255,value4], value3);
};
if(id1 == 10){
  var value10 = 'glitch1';
  var value4 = 2;//Math.floor( Math.random() * 11) + 5;
  if(value1 == 1000){var value5 = Math.floor( Math.random() * 360)}else{var value5 = value1};
  if(value2 == 1000){var value6 = Math.floor( Math.random() * 11)}else{var value6 = value2};
  $gameMap.createFilter(value10,'glitch',0,'screen');
  //$gameMap.setFilter(value10,[value4,100,value5,value6,0]);
  $gameMap.moveFilterQueue(value10,[value4,100,value5,value6,0],value3);
  $gameMap.eraseFilterAfterMove(value10);
  AudioManager.playSe({"name":"Z_CGDispray","volume":20,"pitch":150,"pan":0});
};

};

//属性によるパーティクル発生
element_particleSet = function(id11,value1,value2,value5){

  if(id11 == 0){
    picture_fade1(value1-1,"fadeOut",'102',60,5);
    picture_fade1(value1+1,"fadeOut",'102',60,5);
    var arr1 = ['sparks_w2','petal_w','lines_width3','stardust_w','bubble_w','diamonddust_w','black_particle_w','ether_sp'];
    for (var i = 0; i <= arr1.length-1; i++) {
      $gameScreen._particle.particleClear(arr1[i]);
    };
  };
  if(id11 == 1){
    var value3 = 'ether_sp';
    if(value2 == 51 || value2 == 3){var value3 = 'sparks_w2'};
    if(value2 == 52 || value2 == 4){var value3 = 'petal_w'};
    if(value2 == 53 || value2 == 5){var value3 = 'stardust_w'};
    if(value2 == 54 || value2 == 6){var value3 = 'bubble_w'};
    if(value2 == 55 || value2 == 7){var value3 = 'diamonddust_w'};
    if(value2 == 56 || value2 == 8){var value3 = 'black_particle_w'};
    if(value2 == 57 || value2 == 9){var value3 = 'ether_sp'};
    $gameScreen._particle.particleSet(0,value3,'screen','def','spriteset');
  };
  if(id11 == 2){
    if(value2 >= 1){
      var value3 = '/img/parallaxes/Scene_Element_' + value2;
      $gameScreen.showPicture(value1-1,value3,1,640,384+value5,100,100,200,1);
      picture_fade1(value1-1,"fadeIn",'102',60,5);
      hcg_piston(value1-1,7,1,2);
      $gameScreen.showPicture(value1+1,value3,1,640,384+value5,100,100,50,1);
      picture_fade1(value1+1,"fadeIn",'102',60,5);
      hcg_piston(value1+1,7,1,2);
    };
  };

};

//gabによるパーティクル発生
gab_wordParticle = function(id10){

AudioManager.playSe({"name":'Chime2',"volume":90,"pitch":100,"pan":0});
var value1 = 'text_dispray2';
$gameScreen._particle.particleClear(value1);
var scene = SceneManager._scene;
if (scene._gabWindow) scene.clearGabWindow();
$gameScreen._particle.particlePlay(0,value1,'screen','def','screen');
//$gameScreen._particle.particleUpdate([value1,'pos',-600,-260]);
$gameScreen._particle.particleExceed(value1,0.3);
var gabData = [`　　　${id10}`,'',0,0,'',0];
if (scene._gabWindow) scene.startGabWindow(gabData);

};

//Hランク上昇任意hSkill_rankUpWordDirect(1,1,671,1);//1が最初2が文字で0で締め,ｱｸﾀｰ,ｽｷﾙid,ﾗﾝｸｾｯﾄ
hSkill_rankUpWordDirect = function(id1,id2,id3,id4){

if(id1 == 1){
  var actor = $gameActors.actor(id2);
  if(!$gameSwitches.value(29)){actor.setSkillMasteryLevel(id3, id4)};
  valueWordSet0 = `\\C[26]${actor.name()}\\C[0]の\\C[27]<\\sin[${id3}]>\\C[0]ランクが\\C[10]${id4}\\C[0]になった…。`;
  adv_partDirectPlay(19);
};
if(id1 == 2){
  valueWordSet0 = id2;
  adv_partDirectPlay(19);
};
if(id1 == 0){
  adv_partDirectPlay(0);
  picture_fade1(108,"fadeOut",'Hscene005',120,5);
  $gameScreen.movePicture(109,1,640-200,384,100,100,0,0,120);
  $gameScreen.movePicture(110,1,640-200,384,100,100,0,0,120);
};

};

//獲得物の簡易表示get_infoDirect(0,51,0,1);
get_infoDirect = function(id1,id2,id3,id4){

var arr1 = ['Saint5',75,50];
if(id1 == 0){var value1 = `\\C[2]＜\x1bIIN[${id2}]＞\\C[0]`;var valueItems = $dataItems;var value2 = `を入手した！`};
if(id1 == 1){var value1 = `\\C[2]＜\x1bWIN[${id2}]＞\\C[0]`;var valueItems = $dataWeapons;var value2 = `を入手した！`};
if(id1 == 2){var value1 = `\\C[2]＜\x1bAIN[${id2}]＞\\C[0]`;var valueItems = $dataArmors;var value2 = `を入手した！`};
if(id1 == 3){var value1 = `\\C[2]＜\x1bSIN[${id2}]＞\\C[0]`;var valueItems = $dataSkills;var value2 = `獲得した！`};
if(id1 == 4){var value1 = `\\C[6]${id2.toLocaleString()}\G\\C[0]`;var valueItems = $dataSkills;var value2 = `入手した！`};
if(id1 == 5){var value1 = `\\C[2]＜\x1bJ[${id2}]＞\\C[0]`;var valueItems = $dataclasses;var value2 = `が解放された！`};
if(id2 <= -1 && id1 == 4){var value2 = `失った…。`};
if([0,1,2].some(function(id){return id1 == id})){
  if(id4 <= -1){
    var value2 = `を失った…。`;
}};
if(id1 == 4){
  var value5 = 100;
  if(id2 >= 10000 && id2 <= 30000){var value5 = 90};
  if(id2 >= 30001 && id2 <= 60000){var value5 = 80};
  if(id2 >= 60001 && id2 <= 100000){var value5 = 70};
  if(id2 >= 100001 && id2 <= 200000){var value5 = 60};
  if(id2 >= 200001){var value5 = 50};
  var arr1 = ['Shop1',100,value5];
  if(!$gameSwitches.value(29)){$gameParty.gainGold(id2)};
} else {
  if(valueItems[id2].meta['EICSwitch']){
    if(Number(valueItems[id2].meta['EICSwitch']) == 104){
      var value1 = `\\C[17]称号:\\C[0]`　+ value1;
    };
    if(Number(valueItems[id2].meta['EICSwitch']) == 105){
      var value1 = `\\C[27]Ｈ称号:\\C[0]`　+ value1;
      var arr1 = ['ZH_Sexy',50,150];
    };
    if(Number(valueItems[id2].meta['EICSwitch']) == 108){
      var value1 = `\\C[20]クエスト:\\C[0]`　+ value1;
    };
  };
  if(id1 == 3){
    var value1 = `${$dataSystem.skillTypes[valueItems[id2].stypeId]}:` + value1;
    if(valueItems[id2].stypeId == 14 || valueItems[id2].stypeId == 15){
      var value2 = `を獲得した………。`;
      var arr1 = ['ZH_Sexy',50,150];
    };
  };
  if(id1 == 5){
    if(valueItems[id2].meta['Subclass Only']){
      var value4 = `\\C[17]サブジョブ \\C[0]`;
    } else {
      var value4 = `\\C[20]メインジョブ \\C[0]`;
    };
    if(valueItems[id2].meta['classRank']){
      if(Number(valueItems[id2].meta['classRank']) == 1){value4 += `Class\\C[10]Ⅰ\\C[0]`};
      if(Number(valueItems[id2].meta['classRank']) == 2){value4 += `Class\\C[10]Ⅱ\C[0]`};
      if(Number(valueItems[id2].meta['classRank']) == 3){value4 += `Class\\C[10]Ⅲ\\C[0]`};
      if(Number(valueItems[id2].meta['classRank']) == 4){value4 += `Class\\C[10]Ⅳ\\C[0]`};
    };
    var value1 = `${value4}:`　+ value1;
  };
  if(id1 <= 2){
    if(!$gameSwitches.value(29)){$gameParty.gainItem(valueItems[id2], id4)};
  };
  if(id1 == 3){
    if(id3 == 0){
      var value4 = $gameVariables.value(2);
    } else {
      var value4 = id3;
    };
    var actor = $gameActors.actor(value4);
    if(!actor.isLearnedSkill(id2)){
      if(!$gameSwitches.value(29)){actor.learnSkill(id2)};
    };
    var value1 = `\x1bN[${value4}]が`　+ value1;
  };
  if(id1 == 5){
    if(id3 == 0){
      var value4 = $gameVariables.value(2);
    } else {
      var value4 = id3;
    };
    var actor = $gameActors.actor(value4);
    if(!actor._unlockedClasses.contains(id2)){
      if(!$gameSwitches.value(29)){actor.unlockClass(id2)};
    };
    var value1 = `\x1bN[${value4}]の`　+ value1;
  };
};
if([0,1,2].some(function(id){return id1 == id})){
  var value1 = value1 + `×${id4} `
};
var value3 = `　　${value1} ${value2}`;
TickerManager.show(value3);
if($gameSwitches.value(124)){
  if([0,1,2,3].some(function(id){return id1 == id})){
    var arr2 = valueItems[id2].description.split("\n");
    if(arr2[0] == 0){}else{TickerManager.show(`　　　解説文:${arr2[0]}`)};
    if(arr2[1] == 0){}else{TickerManager.show(`　　　${arr2[1]}`)};
  };
};
AudioManager.playSe({"name":arr1[0],"volume":Number(arr1[1]),"pitch":Number(arr1[2]),"pan":0});
if(!$gameParty.inBattle()){
  if($gameVariables.value(530) == 0){
    $gamePlayer.requestAnimation(229);
  } else {
    if($gameMap.event($gameVariables.value(292)[$gameVariables.value(530)]) >= 1){
      if(!!$gameMap.event($gameMap.event($gameVariables.value(292)[$gameVariables.value(530)]))) {
        $gameMap.event($gameVariables.value(292)[$gameVariables.value(530)]).requestAnimation(229);
      };
    };
  };
};
itemGet_afterProcess();
};

//直接的演出指定
direct_staging1 = function(id1,valuePic1,value2,value3){

if(id1 == 1){//1絶望的な回想
  pic_1(2,valuePic1,value2,0,100,255,60,1280,768,value3,0);
  $gameScreen.startFlash([255,255,255,170], 60);
  filter_direct(9,640,384,60);
  filter_direct(10,1000,1000,60);
  filter_direct(4,0,0,0);
  filter_direct(5,0.1,0,0);
};
if(id1 == 2){

};

};

//}());