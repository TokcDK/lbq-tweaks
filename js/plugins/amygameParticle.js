/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){

menu_particleSet = function(){//メニューパーティクル設定

if($gameSwitches.value(15)){
  var effectName1 = 'particle_w1';
} else {
  var effectName1 = 'particle_w';
};
var effectName2 = 'above';
var actor = $gameParty.members()[0];
if(!actor) return;
if(actor.isStateAffected(61)){var effectName1 = 'charm_bw2';var effectName2 = 'above'};
if(actor._subclassId == 41 || actor._subclassId == 42){var effectName1 = 'romantic_mood';var effectName2 = 'below'};
$gameScreen._particle.particleSet(0,'menu','Scene_Menu',effectName1,effectName2);
if(actor._subclassId == 41 || actor._subclassId == 42){

} else {
  if(actor.isStateAffected(61)){
    var effectName2 = 0.1;
    var colorValue3 = '#e200ff';
    var effectName4 = '#ffffff';
    if(actor.isLearnedSkill(61)){var effectName2 = 0.09};
    if(actor.isLearnedSkill(62)){var effectName2 = 0.08};
    if(actor.isLearnedSkill(63)){var effectName2 = 0.07};
    if(actor.isLearnedSkill(64)){var effectName2 = 0.06};
    if(actor.isLearnedSkill(65)){var effectName2 = 0.05;var effectName4 = '#ff003b'};
    if(actor.isLearnedSkill(66)){var effectName2 = 0.04};
    if(actor.isLearnedSkill(67)){var effectName2 = 0.03};
    if(actor.isLearnedSkill(68)){var effectName2 = 0.02};
    if(actor.isLearnedSkill(69)){var effectName2 = 0.01};
    if(actor.isLearnedSkill(70)){var effectName2 = 0.01};
    $gameScreen._particle.particleUpdate(['menu','frequency',String(effectName2)]);
    $gameScreen._particle.particleUpdate(['menu','color',String(colorValue3),String(effectName4)]);
  } else {
    if($gameSwitches.value(201)){
      var effectName2 = -20;
      var colorValue3 = '#ff77b6';
      var effectName4 = '#fffdb9';
      $gameScreen._particle.particleUpdate(['menu','acceleration','0',String(effectName2)]);
      $gameScreen._particle.particleUpdate(['menu','color',String(colorValue3),String(effectName4)]);
    };
  };
};
$gameScreen._particle.particleExceed('menu',60);

};

//天候設定
weather_set = function(){

valueWeather = Array(51).fill(0);

var candidateValues = [0.1,0.15,0.20,0.25,0.30];//暗闇の視界制限
var randomValue2 =  candidateValues[getRandomIndex(candidateValues.length)];
valueWeather[1] = randomValue2;
var randomValue2 =  getRandomIndex(6) + 1;
valueWeather[2] = randomValue2;
var candidateValues = [0.3,0.4,0.5];//六色ネオン
var randomValue2 =  candidateValues[getRandomIndex(candidateValues.length)];
valueWeather[3] = randomValue2;
var candidateValues = [0.02,0.03,0.04,0.05,0.06];//薄いフォグ
var randomValue2 =  candidateValues[getRandomIndex(candidateValues.length)];
valueWeather[4] = randomValue2;
var randomValue2 =  getRandomIndex(6) + 5;
valueWeather[5] = randomValue2;
var randomValue2 =  getRandomIndex(51) + 50;
valueWeather[6] = randomValue2;
var candidateValues = [0.05,0.06,0.07,0.08,0.09];//モヤの影
var randomValue2 =  candidateValues[getRandomIndex(candidateValues.length)];
valueWeather[7] = randomValue2;//透明
var randomValue2 =  getRandomIndex(51) + 50;
valueWeather[8] = randomValue2;//速度
var randomValue2 =  getRandomIndex(6) + 5;
valueWeather[9] = randomValue2;//スケール
var candidateValues = [-500,0,600];//全体マップ
var randomValue2 =  candidateValues[getRandomIndex(candidateValues.length)];
valueWeather[10] = randomValue2;
var candidateValues = [0.25,0.30,0.35,0.40];
var randomValue2 =  candidateValues[getRandomIndex(candidateValues.length)];
valueWeather[11] = randomValue2;
var randomValue2 =  getRandomIndex(5) + 6;
valueWeather[12] = randomValue2;
var randomValue2 =  getRandomIndex(26) + 25;//天候:雲
valueWeather[13] = randomValue2;
var candidateValues = [0.30,0.31,0.32,0.33,0.35,0.35,0.36,0.37,0.38,0.39,0.40,0.45];//雲透明
var randomValue2 =  candidateValues[getRandomIndex(candidateValues.length)];
valueWeather[14] = randomValue2;
var randomValue2 =  getRandomIndex(76) + 25;//雲の影
valueWeather[15] = randomValue2;//速度
var candidateValues = [0.10,0.15,0.20,0.25,0.30,0.35,0.40];
var randomValue2 =  candidateValues[getRandomIndex(candidateValues.length)];
valueWeather[16] = randomValue2;//透明度
var candidateValues = [0.1,0.11,0.12,0.13,0.14,0.15];//木漏れ日[weather]
var randomValue2 =  candidateValues[getRandomIndex(candidateValues.length)];
valueWeather[17] = randomValue2;
var randomValue2 =  getRandomIndex(8) + 7;
var randomValue3 =  getRandomIndex(10) + 15;
valueWeather[18] = randomValue2;
valueWeather[19] = randomValue3;
var randomValue2 =  getRandomIndex(5) + 0;
valueWeather[20] = randomValue2;
var candidateValues = [-500,0,600];//太陽光のフレア
var randomValue2 =  candidateValues[getRandomIndex(candidateValues.length)];
valueWeather[21] = randomValue2;
var candidateValues = [0.5,0.6,0.7,0.8,0.9,1.0];
var randomValue2 =  candidateValues[getRandomIndex(candidateValues.length)];
valueWeather[22] = randomValue2;
var randomValue2 =  getRandomIndex(3) + 4;
valueWeather[23] = randomValue2;
var candidateValues = [0.05,0.06,0.07];//淡いライトリーク。夜の街。
var randomValue2 =  candidateValues[getRandomIndex(candidateValues.length)];
valueWeather[24] = randomValue2;
var randomValue2 =  getRandomIndex(41) + 10;
valueWeather[25] = randomValue2;
var candidateValues = [0.06,0.07,0.08,0.09,0.05];//青&緑のライトリーク
var randomValue2 =  candidateValues[getRandomIndex(candidateValues.length)];
valueWeather[26] = randomValue2;
var randomValue2 =  getRandomIndex(5) + 1;
valueWeather[27] = randomValue2;
var candidateValues = [0.08,0.09,0.10,0.11,0.12];//fog_battle_front
var randomValue2 =  candidateValues[getRandomIndex(candidateValues.length)];
valueWeather[28] = randomValue2;
var randomValue2 =  getRandomIndex(71) + 30;
valueWeather[29] = randomValue2;
var randomValue2 =  getRandomIndex(81) + 20;
valueWeather[30] = randomValue2;//particle_w2
valueWeather[31] = randomValue2;
valueWeather[32] = randomValue2;
valueWeather[33] = randomValue2;

var randomValue2 =  getRandomIndex(51) + 150;
valueWeather[46] = randomValue2;
var randomValue2 =  getRandomIndex(51) + 100;//ダンジョン暗さ
valueWeather[47] = randomValue2;
var randomValue2 = [1,2,3,4,5,6][getRandomIndex(6)];//空夜パターン
valueWeather[48] = randomValue2;
var randomValue2 = [1,2,3,4,5,6,7,8,9,10][getRandomIndex(10)];//空パターン
valueWeather[49] = randomValue2;
var randomValue2 = [-1,-2,-3,-4,-5][getRandomIndex(5)];//xスクロール
valueWeather[50] = randomValue2;

};

//マップの環境パーティクル設定と色調と遠景
map_weatherSet1 = function(){

var valueDarkness = 0;
var valueLightChara = 0;
if($gameMap.parallaxName() === "BlueSky" && $gameSwitches.value(15)){
  $gameMap.changeParallax("StarlitSky",true,false,1,0);
};
if($dataMap.meta['LightChara']){//<LightChara:1, 3, 200, 0.1>
  var lightCharaValues = $dataMap.meta['LightChara'].split(',');
  var valueLightChara = Number(lightCharaValues[0]);
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
    var weatherValue2 = valueWeather[48];
  }else{
    $gameVariables.setValue(197,"SkyPattern");
    var weatherValue2 = valueWeather[49];
  }
  var weatherValue1 = valueWeather[50];
  $gameMap.changeParallax($gameVariables.value(197)+weatherValue2,true,false,weatherValue1,0);
};
if(valueDarkness >= 1){
  $gameMap.darknessOpacity = valueDarkness;
};
if(valueLightChara >= 1){
  $gamePlayer.moveLight(Number(lightCharaValues[0]), Number(lightCharaValues[1]), Number(lightCharaValues[2]), Number(lightCharaValues[3]));
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
var weatherValue2 = 'click';
$gameScreen._particle.particleSet(0,weatherValue2,'click','def','above');
$gameScreen._particle.particleSet(0,weatherValue2,'click2','def','above');
if(!$gameSwitches.value(201) && $gameSwitches.value(205)){
  var weatherValue2 = 'dust_walk';
  $gameScreen._particle.particleSet(0,weatherValue2,'walk:player','def','below');
};
var gameVarValue10 = 0;
if($gameSwitches.value(15)){
  var gameVarValue11 = $gameVariables.value(251);
} else {
  var gameVarValue11 = $gameVariables.value(256);
};
$gameSystem.setBgsFadeForSe(10);

if(gameVarValue11 == 1){
  var effectName1 = 'darkness_s';//暗闇の視界制限
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
  var weatherValue2 = valueWeather[1];
  $gameScreen._particle.particleUpdate([effectName1,'alpha','0',weatherValue2+'@0.5','0']);
  var weatherValue2 = valueWeather[2];
  $gameScreen._particle.particleUpdate([effectName1,'speed',String(weatherValue2),String(weatherValue2)]);
};
if(gameVarValue11 == 2){
  var effectName1 = 'rain_fog_w';//雨天時のモヤ
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
  var gameVarValue10 = 1;
};
if(gameVarValue11 == 3){
  var effectName1 = 'dust_w';//薄暗い廃墟など
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
  var gameVarValue10 = 1;
};
if(gameVarValue11 == 4){
  var effectName1 = 'rain_w';//しとしと雨
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
  var effectName1 = 'rain_fog_w';//雨天時のモヤ
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
  //var gameVarValue10 = 1;他と共存させる。
  $gameSystem.setBgsLine(10);
  AudioManager.playBgs({"name":"11_Drips","volume":25,"pitch":100,"pan":0});
};
if(gameVarValue11 == 5){
  var effectName1 = 'rain_w2';//強めの雨
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
  var effectName1 = 'rain_fog_w';//雨天時のモヤ
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
  $gameSystem.setBgsLine(10);
  AudioManager.playBgs({"name":"11_Storm1","volume":20,"pitch":150,"pan":0});
  var gameVarValue10 = 1;
};
if(gameVarValue11 == 6){
  var effectName1 = 'rain_w3';//本降りの雨
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
  $gameSystem.setBgsLine(10);
  AudioManager.playBgs({"name":"11_Storm1","volume":25,"pitch":100,"pan":0});
  var gameVarValue10 = 1;
};
if(gameVarValue11 == 7){
  var effectName1 = 'snow_w';//うっすらと降る雪
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
  var effectName1 = 'snow_w2';//雪の結晶
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
};
if(gameVarValue11 == 8){
  var effectName1 = 'blizard_w';//吹雪
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
  $gameSystem.setBgsLine(10);
  AudioManager.playBgs({"name":"11_Wind","volume":25,"pitch":50,"pan":0});
  var gameVarValue10 = 1;
};
if(gameVarValue11 == 9){
  var effectName1 = 'thunder_w';//ピカッと一瞬光る稲妻
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
  $gameSystem.setBgsLine(10);
  AudioManager.playBgs({"name":"11_Thunder","volume":50,"pitch":150,"pan":0});
};
if(gameVarValue11 == 10){
  var effectName1 = 'thunder_w2';//黄色の稲妻
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
  $gameSystem.setBgsLine(10);
  AudioManager.playBgs({"name":"11_Thunder","volume":50,"pitch":100,"pan":0});
};
if(gameVarValue11 == 11){
  var effectName1 = 'dust_w';//火事現場
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','spriteset');
  var effectName1 = 'particle_w';
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','spriteset');
  var effectName1 = 'sparks_w';
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','spriteset');
  var effectName1 = 'sparks_w2';
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','spriteset');
  var effectName1 = 'narration_fire_s';
  $gameScreen._particle.particleGroupSet(0,effectName1,valueWeather1);
  $gameScreen.startTint([68,-34,-34,68], 10);
  $gameSystem.setBgsLine(10);
  AudioManager.playBgs({"name":"11_fire","volume":25,"pitch":80,"pan":0});
  var gameVarValue10 = 1;
};
if(gameVarValue11 == 12){
  var effectName1 = 'bubble_w';//海底
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','spriteset');
  var effectName1 = 'fog_w';
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','spriteset');
  var effectName1 = 'fish_w';
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','spriteset');
  var effectName1 = 'light_pillar_w';
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','spriteset');
  $gameScreen.startTint([-100,-30,0,0], 10);
  $gameScreen.startDisplacementFilter(2,2,10,'DisplacementMap');
  $gameScreen._particle.particleSet(0,'bubble_c','attach:player','def','99');
  $gameSystem.setBgsLine(10);
  AudioManager.playBgs({"name":"11_Sea","volume":25,"pitch":50,"pan":0});
  var gameVarValue10 = 1;
};
if(gameVarValue11 == 13){
  var effectName1 = 'flare_s';//太陽光のフレア//砂漠
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
  var candidateValues = [-500,0,600];
  var weatherValue2 =  candidateValues[getRandomIndex(candidateValues.length)];
  $gameScreen._particle.particleUpdate([effectName1,'pos',String(weatherValue2),-600]);
  var candidateValues = [0.5,0.6,0.7,0.8,0.9,1.0];
  var weatherValue2 =  candidateValues[getRandomIndex(candidateValues.length)];
  $gameScreen._particle.particleUpdate([effectName1,'alpha','0',weatherValue2+'@0.2',weatherValue2+'@0.8','0']);
  $gameScreen._particle.particleUpdate([effectName1,'scale','10','10']);
  var gameVarValue10 = 1;
};
if(gameVarValue11 == 14){
  var effectName1 = 'light_leak_s3';//六色ネオン
  $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
  var weatherValue2 = valueWeather[3];
  $gameScreen._particle.particleUpdate([effectName1,'alpha','0',weatherValue2+'@0.5','0']);
  var gameVarValue10 = 1;
};
if(gameVarValue11 == 15){

};
if(gameVarValue10 >= 1){
  var candidateValues = ['fog_w','fog_shadow_w','flash_s','cloud_w','stardust_w','cloud_shadow_w',
  'dappled_r1','flare_s','light_leak_s','light_leak_s2'];
  var list = candidateValues;
  list.forEach(function(id) {
    $gameScreen._particle.particleClear(id);
  }, this);
};
if(gameVarValue10 == 0){
  if($gameSwitches.value(207) && $gameSwitches.value(204)){
    var effectName1 = 'fog_w';//薄いフォグ
    $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
    var weatherValue2 = valueWeather[4];
    $gameScreen._particle.particleUpdate([effectName1,'alpha','0',weatherValue2+'@0.05',weatherValue2+'@0.9','0']);
    var weatherValue2 = valueWeather[5];
    $gameScreen._particle.particleUpdate([effectName1,'scale',String(weatherValue2),weatherValue2+'@0.5',String(weatherValue2)]);
    var weatherValue2 = valueWeather[6];
    $gameScreen._particle.particleUpdate([effectName1,'speed',String(weatherValue2),String(weatherValue2)]);
  };
  if($gameSwitches.value(207) && $gameSwitches.value(203)){
    var effectName1 = 'fog_shadow_w';//モヤの影
    $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
    var weatherValue2 = valueWeather[7];
    $gameScreen._particle.particleUpdate([effectName1,'alpha','0',weatherValue2+'@0.05',weatherValue2+'@0.9','0']);
    var weatherValue2 = valueWeather[8];
    $gameScreen._particle.particleUpdate([effectName1,'speed',String(weatherValue2),String(weatherValue2)]);
    var weatherValue2 = valueWeather[9];
    $gameScreen._particle.particleUpdate([effectName1,'scale',String(weatherValue2),weatherValue2+'@0.5',String(weatherValue2)]);
  };
  if($gameSwitches.value(209) || $gameSwitches.value(227)){//全体マップと艦橋マップ
    var effectName1 = 'flash_s';//太陽光のフラッシュ
    $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
    var weatherValue2 = valueWeather[10];
    $gameScreen._particle.particleUpdate([effectName1,'pos',String(weatherValue2),-600]);
    var weatherValue2 = valueWeather[11];
    $gameScreen._particle.particleUpdate([effectName1,'alpha','0',weatherValue2+'@0.2','0']);
    var weatherValue2 = valueWeather[12];
    $gameScreen._particle.particleUpdate([effectName1,'scale',String(weatherValue2),String(weatherValue2)]);
    var effectName1 = 'cloud_w';//天候:雲
    $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
    var weatherValue2 = valueWeather[13];
    $gameScreen._particle.particleUpdate([effectName1,'speed',String(weatherValue2),String(weatherValue2)]);
    var weatherValue2 = valueWeather[14];
    $gameScreen._particle.particleUpdate([effectName1,'alpha','0',weatherValue2+'@0.05',weatherValue2+'@0.9','0']);
    var effectName1 = 'particle_w2';//空域図浮遊パーティクル
    $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
    var weatherValue2 = valueWeather[30];
    $gameScreen._particle.particleUpdate([effectName1,'speed',String(weatherValue2),'10']);
  } else {
    if($gameSwitches.value(13) && $gameSwitches.value(203)){
      var effectName1 = 'cloud_shadow_w';//雲の影
      $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
      var weatherValue2 = valueWeather[15];
      $gameScreen._particle.particleUpdate([effectName1,'speed',String(weatherValue2),String(weatherValue2)]);
      var weatherValue2 = valueWeather[16];
      $gameScreen._particle.particleUpdate([effectName1,'alpha','0',weatherValue2+'@0.05',weatherValue2+'@0.9','0']);
      var effectName1 = 'dappled_r1';//木漏れ日[weather]
      $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
      var weatherValue2 = valueWeather[17];
      $gameScreen._particle.particleUpdate([effectName1,'alpha','0',weatherValue2+'@0.4',weatherValue2+'@0.6','0']);
      var weatherValue2 = valueWeather[18];
      var weatherValue3 = valueWeather[19];
      $gameScreen._particle.particleUpdate([effectName1,'scale',String(weatherValue2),String(weatherValue3)]);
      var weatherValue2 = valueWeather[20];
      $gameScreen._particle.particleUpdate([effectName1,'speed',String(weatherValue2),String(weatherValue2)]);
    };
  };
  if($gameSwitches.value(205) && $gameSwitches.value(15)){
    var effectName1 = 'stardust_w';//スターダスト。野外屋外フィールド
    $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
  };
  if($gameSwitches.value(14) && $gameSwitches.value(203) ){
    var effectName1 = 'flare_s';//太陽光のフレア
    $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
    var weatherValue2 = valueWeather[21];
    $gameScreen._particle.particleUpdate([effectName1,'pos',String(weatherValue2),-600]);
    var weatherValue2 = valueWeather[22];
    $gameScreen._particle.particleUpdate([effectName1,'alpha','0',weatherValue2+'@0.2',weatherValue2+'@0.8','0']);
    var weatherValue2 = valueWeather[23];
    $gameScreen._particle.particleUpdate([effectName1,'scale',String(weatherValue2),String(weatherValue2)]);
  };
  if($gameSwitches.value(15) && $gameSwitches.value(203)){
    var effectName1 = 'light_leak_s';//淡いライトリーク。夜の街。
    $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
    var weatherValue2 = valueWeather[24];
    $gameScreen._particle.particleUpdate([effectName1,'alpha','0',weatherValue2+'@0.1','0']);
    var weatherValue2 = valueWeather[25];
    $gameScreen._particle.particleUpdate([effectName1,'scale',String(weatherValue2),String(weatherValue2)]);
    var effectName1 = 'light_leak_s2';//青&緑のライトリーク
    $gameScreen._particle.particleSet(0,effectName1,valueWeather1,'def','99');
    var weatherValue2 = valueWeather[26];
    $gameScreen._particle.particleUpdate([effectName1,'alpha','0',weatherValue2+'@0.1','0']);
    var weatherValue2 = valueWeather[27];
    $gameScreen._particle.particleUpdate([effectName1,'scale',String(weatherValue2),weatherValue2+'@0.5',String(weatherValue2)]);
  };
};

};

//特定リージョンに対応したパーティクルと動的生成その他
map_regionSet = function(){

//if($gameMap.regionId($gamePlayer._realX, $gamePlayer._realY+1) == 91){
  //$gameSwitches.setValue(206,true);
//};
var regionEventCounts = Array(151).fill(0);
for (var i = 0; i <= $gameMap.width() - 1; i++) {
  for (var j = 0; j <= $gameMap.height() - 1; j++) {
    if($gameMap.regionId(i,j) >= 1){    
      regionEventCounts[$gameMap.regionId(i,j)] += 1;
}}};
  valueRegionMapArray =  regionEventCounts;
  var numericValue1 = 30;
  if(regionEventCounts[numericValue1] >= 1){
    var effectName2 = 'dappled_r';
    $gameScreen._particle.particleSet(0,effectName2,'region:' + numericValue1,'def','above');
  };
  var numericValue1 = 31;
  if(regionEventCounts[numericValue1] >= 1){
    var effectName2 = 'light_pillar_r';
    $gameScreen._particle.particleSet(0,effectName2,'region:' + numericValue1,'def','above');
  };
  var numericValue1 = 32;
  if(regionEventCounts[numericValue1] >= 1){
    var effectName2 = 'light_floor_r';
    $gameScreen._particle.particleSet(0,effectName2,'region:' + numericValue1,'def','below');
  };
  var numericValue1 = 33;
  if(regionEventCounts[numericValue1] >= 1){
    var effectName2 = 'bubble_cp';
    $gameScreen._particle.particleSet(0,effectName2,'region:' + numericValue1,'def','above');
  };
  var numericValue1 = 34;
  if(regionEventCounts[numericValue1] >= 1){
    var effectName2 = 'darkness_r';
    $gameScreen._particle.particleSet(0,effectName2,'region:' + numericValue1,'def','above');
  };
  var numericValue1 = 35;
  if(regionEventCounts[numericValue1] >= 1){
    var effectName2 = 'poison_r';
    $gameScreen._particle.particleSet(0,effectName2,'region:' + numericValue1,'def','below');
  };
  var numericValue1 = 36;
  if(regionEventCounts[numericValue1] >= 1){
    $gameScreen._particle.particleSet(0,'dark_hole_r','region:' + numericValue1,'def','above');
    $gameScreen._particle.particleSet(0,'dark_hole_r_2','region:' + numericValue1,'def','above');
    $gameScreen._particle.particleSet(0,'dark_hole_r_3','region:' + numericValue1,'def','above');
  };
  var numericValue1 = 37;
  if(regionEventCounts[numericValue1] >= 1){
    var effectName2 = 'magma_r';
    $gameScreen._particle.particleSet(0,effectName2,'region:' + numericValue1,'def','below');
  };
  var numericValue1 = 38;
  if(regionEventCounts[numericValue1] >= 1){
    var effectName2 = 'ripple_r';
    $gameScreen._particle.particleSet(0,effectName2,'region:' + numericValue1,'def','below');
  };
  var numericValue1 = 3;
  if(regionEventCounts[numericValue1] >= 1){
    $gameScreen._particle.particleSet(0,'splash_walk','walk:player:' + numericValue1,'def','below');
    $gameScreen._particle.particleSet(0,'ripple_walk','walk:player:' + numericValue1,'def','below');
  };
  //135拠点着替え 134拠点宿泊 133拠点クリスタルなし 123死体 119火災 130回復魔方陣 87滝下 2滝上
  var sourceEventIds = [246,245,244,241, 99, 73, 83, 82, 81,241,241,241,203,200,199,186,183, 90,165,162,159,158,154,135,134, 67, 77, 87,  2, 61,100, 49, 60, 54, 66, 50, 51, 65, 97,101,115,123,119,117,138,231,48,116];//動的生成元イベントID
  var regionIds = [112,111,110,109,108,107,106,105,104,101,102,103, 18, 94, 95, 17, 60, 69, 70, 71, 72, 73, 74, 93, 92, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77, 76, 75, 29, 28, 20, 19, 16, 7,  6];//リージョンID
  for (var i = 0; i <= sourceEventIds.length-1; i++) {
    var effectName2 = Number(sourceEventIds[i]);//死体。npc配置で血痕
    var numericValue1 = Number(regionIds[i]);
    if(regionEventCounts[numericValue1] >= 1){
      var map_width = $gameMap.width();
      var map_height = $gameMap.height();
        for (var y = 0; y < map_height; y++) {
          for (var x = 0; x < map_width; x++) {
            if($gameMap.regionId(x, y) == numericValue1){
              $gameMap.spawnEvent(effectName2, x, y, true);
                if(numericValue1 == 91 && $gameVariables.value(327)[$gameMap.mapId()] >= 1){
                  $gameSelfSwitches.setValue([$gameMap.mapId(), $gameMap.getLastSpawnEventId(), 'A'], true);
                };
        }}};
    };
  };
  if(!$gameSwitches.value(15)){    //夜に勝手に作成されるので、スクリプト夜生成禁止にする
  var effectName2 = 111;//立ちNPC
  for (var numericValue1 = 24; numericValue1 <= 27; numericValue1++) {
    if(regionEventCounts[numericValue1] >= 1){
      var map_width = $gameMap.width();
      var map_height = $gameMap.height();
        for (var y = 0; y < map_height; y++) {
          for (var x = 0; x < map_width; x++) {
            if($gameMap.regionId(x, y) == numericValue1){
              $gameMap.spawnEvent(effectName2, x, y, true);
              var eventId = $gameMap.getLastSpawnEventId();
              var event = $gameMap.event(eventId);
              if(numericValue1 == 24){event.setDirection(2)};//2,4,6,8
              if(numericValue1 == 25){event.setDirection(4)};//2,4,6,8
              if(numericValue1 == 26){event.setDirection(6)};//2,4,6,8
              if(numericValue1 == 27){event.setDirection(8)};//2,4,6,8
        }}};
  }};
  };
  if($gameSwitches.value(15)){
  var effectName2 = 191;//立ちNPC
  for (var numericValue1 = 41; numericValue1 <= 44; numericValue1++) {
    if(regionEventCounts[numericValue1] >= 1){
      var map_width = $gameMap.width();
      var map_height = $gameMap.height();
        for (var y = 0; y < map_height; y++) {
          for (var x = 0; x < map_width; x++) {
            if($gameMap.regionId(x, y) == numericValue1){
              $gameMap.spawnEvent(effectName2, x, y, true);
              var eventId = $gameMap.getLastSpawnEventId();
              var event = $gameMap.event(eventId);
              if(numericValue1 == 41){event.setDirection(2)};//2,4,6,8
              if(numericValue1 == 42){event.setDirection(4)};//2,4,6,8
              if(numericValue1 == 43){event.setDirection(6)};//2,4,6,8
              if(numericValue1 == 44){event.setDirection(8)};//2,4,6,8
        }}};
  }};
  };
  var effectName2 = 118;//食べ物全日。npc配置で湯気
  var gameSwitchValue3 = true;
  for (var numericValue1 = 21; numericValue1 <= 23; numericValue1++) {
    if(numericValue1 == 22){
      var effectName2 = 121;
      if($gameSwitches.value(15)){var gameSwitchValue3 = false};
    };
    if(numericValue1 == 23){var effectName2 = 120};
    if(gameSwitchValue3){
    if(regionEventCounts[numericValue1] >= 1){
      var map_width = $gameMap.width();
      var map_height = $gameMap.height();
        for (var y = 0; y < map_height; y++) {
          for (var x = 0; x < map_width; x++) {
            if($gameMap.regionId(x, y) == numericValue1){
              $gameMap.spawnEvent(effectName2, x, y, true);
        }}};
  }}};
  var effectName2 = 213;//天蓋つきベッド
  var numericValue1 = 96;
  var map_width = $gameMap.width();
  var map_height = $gameMap.height();
  for (var y = 0; y < map_height; y++) {
    for (var x = 0; x < map_width; x++) {
      if($gameMap.regionId(x, y) == numericValue1){
        $gameMap.spawnEvent(effectName2, x, y, true);
        $gameMap.spawnEvent(effectName2+1, x, y, true);
        $gameMap.spawnEvent(effectName2+2, x, y, true);
  }}};
};

//ADVパート演出
adv_partDirectPlay = function(effectTypeId){

if(effectTypeId == 0){
  if($gameScreen._tone_temp != 0){
    $gameScreen.startTint($gameScreen._tone_temp, 10);
    $gameScreen._tone_temp = 0;
  };
  var effectNameCandidates = ['gloom_sp','glitter_sp','hearts_sp','questions_sp','feather_sp','ether_sp','lines_sp','direct_screenRing',
  'direct_screenDiffusion1','text_dispray1','direct_screenRing','direct_screenDiffusion2','direct_screenDiffusion3',
  'direct_screenSquare'];
  for (var i = 0; i <= effectNameCandidates.length-1; i++) {
    $gameScreen._particle.particleClear(effectNameCandidates[i]);
  };
};
if(effectTypeId == 1){
  var effectName1 = 'gloom_sp';//どんより
  var colorValue2 = "Down3";
  AudioManager.playSe({"name":colorValue2,"volume":90,"pitch":70,"pan":0});
  $gameScreen.startFlash([0,0,0,200], 120);
  $gameScreen._particle.particlePlay(0,effectName1,'screen','def','screen');
};
if(effectTypeId == 2){
  var effectName1 = 'glitter_sp';//
  $gameScreen.startFlash([255,255,255,200], 120);
  var colorValue2 = "Up3";
  AudioManager.playSe({"name":colorValue2,"volume":90,"pitch":100,"pan":0});
  $gameScreen._particle.particlePlay(0,effectName1,'screen','def','screen');
};
if(effectTypeId == 3){
  var effectName1 = 'hearts_sp';//
  $gameScreen.startFlash([255,119,255,200], 120);
  var colorValue2 = "11_Sexy";
  AudioManager.playMe({"name":colorValue2,"volume":90,"pitch":150,"pan":0});
  $gameScreen._particle.particlePlay(0,effectName1,'screen','def','screen');
};
if(effectTypeId == 4){
  var effectName1 = 'questions_sp';//
  $gameScreen.startFlash([255,255,255,200], 120);
  var colorValue2 = "Saint1";
  AudioManager.playSe({"name":colorValue2,"volume":90,"pitch":70,"pan":0});
  $gameScreen._particle.particlePlay(0,effectName1,'screen','def','screen');
};
if(effectTypeId == 5){
  var effectName1 = 'feather_sp';//
  var colorValue2 = "Z11_RareTreasureBox";
  AudioManager.playSe({"name":colorValue2,"volume":60,"pitch":100,"pan":0});
  $gameScreen._particle.particlePlay(0,effectName1,'screen','def','screen');
};
if(effectTypeId == 6){
  var effectName1 = 'ether_sp';//戦闘敗北時
  var colorValue2 = "Z_Summoning";
  AudioManager.playSe({"name":colorValue2,"volume":60,"pitch":120,"pan":0});
  $gameScreen._particle.particlePlay(0,effectName1,'screen','def','spriteset');
  var effectName1 = `拠点に強制帰還されます…。`;
  TickerManager.show(effectName1);
};
if(effectTypeId == 7){
  var effectName1 = 'lines_sp';//集中線
  $gameScreen.startFlash([255,255,255,200], 120);
  var colorValue2 = "Wind1";
  AudioManager.playSe({"name":colorValue2,"volume":90,"pitch":120,"pan":0});
  $gameScreen._particle.particlePlay(0,effectName1,'screen','def','screen');
};
if(effectTypeId == 8){//宝箱レア演出。元コモンで色調変更
  $gameScreen.startFlash([255,255,255,200], 30);
    if($gameScreen._tone_temp == 0){
      $gameScreen._tone_temp = $gameScreen.tone().concat();  
      $gameScreen.startTint([-100,-100,-100,150], 10);
    };
  picture_motion1("smooth",[0]);
  var effectName1 = 100;//文字ピクチャ。元コモンで実行している。
  $gameScreen.showPicture(effectName1,"",1,640+200,384,100,100,0,0);
  $gameScreen.movePicture(effectName1,1,640,384,100,100,255,0,60);
  var effectName1 = 99;
  var colorValue2 = 'ScreenCenterTextDisPray';
  $gameScreen.showPicture(effectName1,colorValue2,1,640+200,384,100,0,0,0);
  $gameScreen.movePicture(effectName1,1,640,384,100,50,200,0,60);
  var effectName1 = 'direct_screenRing';//
  $gameScreen._particle.particlePlay(0,effectName1,'screen','def','screen');
  var effectName1 = 'direct_screenDiffusion1';//
  $gameScreen._particle.particlePlay(0,effectName1,'screen','def','screen');
};
if(effectTypeId == 9){//仲間加入
  $gameScreen.startFlash([255,255,255,200], 30);
    if($gameScreen._tone_temp == 0){
      $gameScreen._tone_temp = $gameScreen.tone().concat();  
      $gameScreen.startTint([-100,-100,-100,150], 10);
    };
  picture_motion1("smooth",[0]);
  var effectName1 = 99;
  var colorValue2 = 'ScreenCenterTextDisPray';
  $gameScreen.showPicture(effectName1,colorValue2,1,640+200,384,100,0,0,0);
  $gameScreen.movePicture(effectName1,1,640,384,100,50,200,0,30);
  var effectName1 = 'text_dispray1';//仲間加入
  $gameScreen._particle.particleSet(0,effectName1,'screen','def','screen');
  $gameScreen._particle.particleUpdate([effectName1,'pos',-600,20]);
  if($dataActors[$gameVariables.value(20)] && $dataActors[$gameVariables.value(20)].meta['NpcChara']){
    $gameScreen._particle.particleUpdate([effectName1,'color','#e59fff','#6d80ff']);
  };
  var effectName1 = `\\V[53]\\V[49]がパーティに加わった！`;
  var colorValue2 = 28;
  $gameScreen.setDTextPicture(effectName1, colorValue2);
  var effectName1 = 100;
  $gameScreen.showPicture(effectName1,"",1,640,384,100,100,0,0);
  const joinActor = $gameActors.actor($gameVariables.value(20));
  if(!!joinActor && isGirl(joinActor)){
    $gameScreen.movePicture(effectName1,1,640-200,384,100,100,255,0,30);
  } else {
    $gameScreen.movePicture(effectName1,1,640-50,384,100,100,255,0,30);
  };
  var effectNameCandidates = [2,6];
  var effectName1 = effectNameCandidates[getRandomIndex(effectNameCandidates.length)];
  valueFaceSelect = effectName1; 
  $gameSwitches.setValue(436,true);
  battle_bustUp(101,550,0,40);
  $gameSwitches.setValue(436,false);
};
if(effectTypeId == 10){//ワープポイントアクティベート
  var effectName1 = "Item4";
  AudioManager.playSe({"name":effectName1,"volume":50,"pitch":50,"pan":0});
  $gameScreen.startFlash([255,255,255,200], 30);
    if($gameScreen._tone_temp == 0){
      $gameScreen._tone_temp = $gameScreen.tone().concat();  
      $gameScreen.startTint([-100,-100,-100,150], 10);
    };
  picture_motion1("smooth",[0]);
  var effectName1 = 100;//文字ピクチャ。。元コモンで実行している。
  $gameScreen.showPicture(effectName1,"",1,640,384,100,100,0,0);
  $gameScreen.movePicture(effectName1,1,640,384,100,100,255,0,60);
  var effectName1 = 99;
  var colorValue2 = 'ScreenCenterTextDisPray';
  $gameScreen.showPicture(effectName1,colorValue2,1,640+200,384,100,0,0,0);
  $gameScreen.movePicture(effectName1,1,640,384,100,50,200,0,60);
  var effectName1 = 'direct_screenRing';//
  $gameScreen._particle.particlePlay(0,effectName1,'screen','def','screen');
  var effectName1 = 'direct_screenDiffusion2';//
  $gameScreen._particle.particlePlay(0,effectName1,'screen','def','screen');
};
if(effectTypeId == 11){//拠点アクティベート
  var effectName1 = "Item4";
  AudioManager.playSe({"name":effectName1,"volume":50,"pitch":50,"pan":0});
  $gameScreen.startFlash([255,255,255,200], 30);
    if($gameScreen._tone_temp == 0){
      $gameScreen._tone_temp = $gameScreen.tone().concat();  
      $gameScreen.startTint([-100,-100,-100,150], 10);
    };
  picture_motion1("smooth",[0]);
  var effectName1 = 100;//文字ピクチャ。。元コモンで実行している。
  $gameScreen.showPicture(effectName1,"",1,640,384,100,100,0,0);
  $gameScreen.movePicture(effectName1,1,640,384,100,100,255,0,60);
  var effectName1 = 99;
  var colorValue2 = 'ScreenCenterTextDisPray';
  $gameScreen.showPicture(effectName1,colorValue2,1,640+200,384,100,0,0,0);
  $gameScreen.movePicture(effectName1,1,640,384,100,50,200,0,60);
  var effectName1 = 'direct_screenRing';//
  $gameScreen._particle.particlePlay(0,effectName1,'screen','def','screen');
  var effectName1 = 'direct_screenDiffusion3';//
  $gameScreen._particle.particlePlay(0,effectName1,'screen','def','screen');
};
if(effectTypeId == 12){//夜シーン強制
  picture_motion1("smooth",[0]);
  var effectName1 = 'direct_screenSquare';
  $gameScreen._particle.particlePlay(0,effectName1,'screen','def','screen');
  var effectName1 = `イベント自動発生`;
  var colorValue2 = 28;
  $gameScreen.setDTextPicture(effectName1, colorValue2);
  $gameScreen.dWindowFrame = 'ON';
  var effectName1 = 100;
  $gameScreen.showPicture(effectName1,"",1,640+50,384,100,100,0,0);
  $gameScreen.movePicture(effectName1,1,640,384,100,100,255,0,20);
};
if(effectTypeId == 13){//シーンタイトル通知
  picture_motion1("smooth",[0]);
  var effectName1 = 102;
  var colorValue2 = 'ScreenCenterTextDisPrayTitle';
  $gameScreen.showPicture(effectName1,colorValue2,1,640-100,384-200,100,80,0,0);
  $gameScreen.movePicture(effectName1,1,640,384-200,100,80,200,0,30);
  var effectName1 = 'text_dispray1';
  $gameScreen._particle.particlePlay(0,effectName1,'screen','def','screen');
  $gameScreen._particle.particleUpdate([effectName1,'pos',-700,-200]);
  var effectName1 = `──\\V[142]──`;
  var colorValue2 = 28;
  if($gameVariables.value(535) >= 1){
    $gameScreen.setDTextPicture(`\\f[b]\\C[13]${effectName1}\\C[0]`, colorValue2);
  } else {
    $gameScreen.setDTextPicture(`\\f[b]\\C[16]${effectName1}\\C[0]`, colorValue2);
  };
  var effectName1 = 103;
  $gameScreen.showPicture(effectName1,"",0,10,170,0,100,0,0);
  $gameScreen.movePicture(effectName1,0,50,170,100,100,255,0,30);
};
if(effectTypeId == 14 || effectTypeId == 15 || effectTypeId == 16){//アイテムスキル称号獲得忘却。Ｈ通常どちらも。
  var actorId = $gameVariables.value(20);
  var dbEntryId = $gameVariables.value(19);
  var actor = $gameActors.actor(actorId);
  if(effectTypeId == 14){valueItems = $dataItems};
  if(effectTypeId == 15 || effectTypeId == 16){valueItems = $dataSkills};
  if(effectTypeId == 14){
    if(Number(valueItems[dbEntryId].meta['EICSwitch']) == 104){//通常
      var hModeLevel = 1;
    } else {
      var hModeLevel = 2;
    };
  };
  if(effectTypeId == 15 || effectTypeId == 16){
    if(valueItems[dbEntryId].stypeId == 14 || valueItems[dbEntryId].stypeId == 15){//Hスキル
      var hModeLevel = 2;
    } else {
      var hModeLevel = 1;
    };
  };
  if(hModeLevel == 1){//通常
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
  var effectName1 = 51;
  var colorValue2 = 'ScreenCenterTextDisPrayOneRow';
  $gameScreen.showPicture(effectName1,colorValue2,1,640+200,384,100,0,0,0);
  $gameScreen.movePicture(effectName1,1,640,384,100,100,250,0,60);
  var effectName1 = 'direct_screenRing';
  $gameScreen._particle.particleSet(0,effectName1,'screen','def','screen');
    if(hModeLevel == 1){
      $gameScreen._particle.particleUpdate([effectName1,'color','#8fceff','#ffffff']);//通常
    } else {
      $gameScreen._particle.particleUpdate([effectName1,'color','#dc7dff','#ffffff']);//H関係
    };
    if(hModeLevel == 1){
      var effectName1 = 'direct_screenDiffusion2';
    } else {
      var effectName1 = 'direct_screenDiffusionH';
    };
    $gameScreen._particle.particleSet(0,effectName1,'screen','def','screen');
    if(hModeLevel == 1){
      $gameScreen._particle.particleUpdate([effectName1,'color','#8fceff','#ffffff']);//通常
    };
    if(effectTypeId == 14){var effectName1 = `\\C[16]称号\\C[0]＜\\C[2]\x1bIIN[${dbEntryId}]\\C[0]＞獲得！`};
    if(effectTypeId == 15){var effectName1 = `\\C[16]${$dataSystem.skillTypes[valueItems[dbEntryId].stypeId]}\\C[0]＜\\C[2]\x1bSIN[${dbEntryId}]\\C[0]＞獲得！`};
    if(effectTypeId == 16){var effectName1 = `\\C[16]${$dataSystem.skillTypes[valueItems[dbEntryId].stypeId]}\\C[0]＜\\C[2]\x1bSIN[${dbEntryId}]\\C[0]＞忘却…`};
  var colorValue2 = 28;
  $gameScreen.setDTextPicture(effectName1, colorValue2);
  var effectName1 = 60;
  $gameScreen.showPicture(effectName1,"",1,640,384,100,100,0,0);
  $gameScreen.movePicture(effectName1,1,640-100,384,100,100,255,0,60);
    if(!$gameSwitches.value(29)){
      if(effectTypeId == 14){$gameParty.gainItem(valueItems[dbEntryId], 1)};
      if(effectTypeId == 15 && !!actor){actor.learnSkill(dbEntryId)};
      if(effectTypeId == 16 && !!actor){actor.forgetSkill(dbEntryId)};
    };
    if(hModeLevel == 1){
      var effectNameCandidates = [2,6];
      if(actorId == 1){effectNameCandidates.push(53)};
    };
    if(hModeLevel == 2){
      if(!!actor && actor.isLearnedSkill(65)){
        var effectNameCandidates = [27,28,29,30,31,32,39,40,41];
      } else {
        var effectNameCandidates = [21,22,23,24,25];
      };
    };
    var effectName1 = effectNameCandidates[getRandomIndex(effectNameCandidates.length)];
    valueFaceSelect = effectName1; 
    $gameSwitches.setValue(436,true);
    battle_bustUp(52,550,0,120);
    $gameSwitches.setValue(436,false);
    valueWordSet0 = `解説文:\n${valueItems[dbEntryId].description}`;
};
if(effectTypeId == 17){//汎用演出。valueWordSet0に文章入れておく。
  //console.log(`顔グラピクID変更の為にピクID変更の必要ありamygameParticle787行`);
  var actor = $gameActors.actor($gameVariables.value(20));
  $gameScreen.startFlash([255,255,255,200], 30);
    if($gameScreen._tone_temp == 0){
      $gameScreen._tone_temp = $gameScreen.tone().concat();  
      $gameScreen.startTint([-100,-100,-100,150], 10);
    };
  picture_motion1("smooth",[0]);
  var effectName1 = 51;
  var colorValue2 = 'ScreenCenterTextDisPrayOneRow';
  var colorValue3 = 100;
  if(valueWordSet0.match(/\n/)){
    var colorValue3 = colorValue3 * (valueWordSet0.split('\n').length);
  };
  $gameScreen.showPicture(effectName1,colorValue2,1,640+200,384,100,0,0,0);
  $gameScreen.movePicture(effectName1,1,640,384,100,colorValue3,250,0,60);
    var effectName1 = 'direct_screenRing';
    $gameScreen._particle.particleSet(0,effectName1,'screen','def','screen');
    $gameScreen._particle.particleUpdate([effectName1,'color','#007bff','#f7ff76']);
    var effectName1 = 'direct_screenDiffusion2';
    $gameScreen._particle.particleSet(0,effectName1,'screen','def','screen');
    $gameScreen._particle.particleUpdate([effectName1,'color','#007bff','#f7ff76']);
      var effectName1 = valueWordSet0;
      var colorValue2 = 28;
      $gameScreen.setDTextPicture(effectName1, colorValue2);
      var effectName1 = 60;
      $gameScreen.showPicture(effectName1,"",1,640,384,100,100,0,0);
      $gameScreen.movePicture(effectName1,1,640-200,384,100,100,255,0,60);
        var effectNameCandidates = [2,6];
        if($gameVariables.value(20) == 1){effectNameCandidates.push(53)};//りしゃぶる。リーシャ。ドヤ顔
        var effectName1 = effectNameCandidates[getRandomIndex(effectNameCandidates.length)];
        valueFaceSelect = effectName1; 
        $gameSwitches.setValue(436,true);
        battle_bustUp(52,550,0,120);
        $gameSwitches.setValue(436,false);
};
if(effectTypeId == 18){//汎用演出顔グラなし。valueWordSet0に文章入れておく。
  $gameScreen.startFlash([255,255,255,200], 30);
    if($gameScreen._tone_temp == 0){
      $gameScreen._tone_temp = $gameScreen.tone().concat();  
      $gameScreen.startTint([-100,-100,-100,150], 10);
    };
  picture_motion1("smooth",[0]);
  var effectName1 = 51;
  var colorValue2 = 'ScreenCenterTextDisPrayOneRow';
  var colorValue3 = 100;
  if(valueWordSet0.match(/\n/)){
    var colorValue3 = colorValue3 * (valueWordSet0.split('\n').length);
  };
  $gameScreen.showPicture(effectName1,colorValue2,1,640+200,384,100,0,0,0);
  $gameScreen.movePicture(effectName1,1,640,384,100,colorValue3,250,0,60);
    var effectName1 = 'direct_screenRing';
    $gameScreen._particle.particleSet(0,effectName1,'screen','def','screen');
    $gameScreen._particle.particleUpdate([effectName1,'color','#007bff','#f7ff76']);
    $gameScreen._particle.particleUpdate([effectName1,'colorMode','0']);
    var effectName1 = 'direct_screenDiffusion2';
    $gameScreen._particle.particleSet(0,effectName1,'screen','def','screen');
    $gameScreen._particle.particleUpdate([effectName1,'color','#007bff','#f7ff76']);
    $gameScreen._particle.particleUpdate([effectName1,'colorMode','0']);
      var effectName1 = valueWordSet0;
      var colorValue2 = 28;
      $gameScreen.setDTextPicture(effectName1, colorValue2);
      var effectName1 = 60;
      $gameScreen.showPicture(effectName1,"",1,640,384,100,100,0,0);
      $gameScreen.movePicture(effectName1,1,640,384,100,100,255,0,60);
};
if(effectTypeId == 19){//汎用2行まで演出顔グラなしH。valueWordSet0に文章入れておく。
  //hSkill_rankUpWordDirect(1,1,671,1);で使用
  var effectName1 = getRandomIndex(51) + 100;
  AudioManager.playSe({"name":'ZH_SexyVoice',"volume":50,"pitch":effectName1,"pan":0});
  $gameScreen.startFlash([255,119,255,200], 60);
    if($gameScreen._tone_temp == 0){
      $gameScreen._tone_temp = $gameScreen.tone().concat();  
      $gameScreen.startTint([-100,-100,-100,150], 10);
    };
  picture_motion1("smooth",[0]);
  var effectName1 = 108;
  var colorValue2 = 'ScreenWordBackH';
  var colorValue3 = 50;
  var actor = $gameActors.actor($gameVariables.value(2));
  if(actor.isLearnedSkill(63)){var colorValue3 = 100};
  if(actor.isLearnedSkill(65)){var colorValue3 = 150};
  if(actor.isLearnedSkill(68)){var colorValue3 = 200};
  $gameScreen.showPicture(effectName1,colorValue2,1,640,384,100,100,colorValue3,0);
  picture_fade1(effectName1,"fadeIn",'Hscene005',120,5);
  var effectName1 = 109;
  var colorValue2 = 'ScreenCenterTextDisPrayOneRow';
  var colorValue3 = 100;
  if(valueWordSet0.match(/\n/)){
    var colorValue3 = colorValue3 * (valueWordSet0.split('\n').length);
  };
  $gameScreen.showPicture(effectName1,colorValue2,1,640+200,384,100,0,0,0);
  $gameScreen.movePicture(effectName1,1,640,384,100,colorValue3,250,0,60);
    var effectName1 = 'direct_screenRing';
    $gameScreen._particle.particleSet(0,effectName1,'screen','def','screen');
    $gameScreen._particle.particleUpdate([effectName1,'color','#dc7dff','#ffffff']);
    var effectName1 = 'direct_screenDiffusion2';
    $gameScreen._particle.particleSet(0,effectName1,'screen','def','screen');
    $gameScreen._particle.particleUpdate([effectName1,'color','#dc7dff','#ffffff']);
      var effectName1 = valueWordSet0;
      var colorValue2 = 28;
      $gameScreen.setDTextPicture(effectName1, colorValue2);
      var effectName1 = 110;
      $gameScreen.showPicture(effectName1,"",1,640,384,100,100,0,0);
      $gameScreen.movePicture(effectName1,1,640,384,100,100,255,0,60);
};
if(effectTypeId == 20){//睡眠誘導光
  var effectName1 = 'ether_sp';
  $gameScreen._particle.particlePlay(0,effectName1,'screen','def','screen');
  var colorValue2 = '#dd00ff';
  var colorValue3 = '#86e3ff';
  $gameScreen._particle.particleUpdate([effectName1,'color',String(colorValue2),String(colorValue3)]);
  var colorValue2 = '3';
  $gameScreen._particle.particleUpdate([effectName1,'emitterLifetime',String(colorValue2)]);
  var colorValue2 = '0.01';
  $gameScreen._particle.particleUpdate([effectName1,'frequency',String(colorValue2)]);
  $gameScreen.startFlash([255,119,255,200], 60);
  var colorValue2 = "Saint2";
  var colorValue3 = getRandomIndex(26) + 50;;
  AudioManager.playSe({"name":colorValue2,"volume":90,"pitch":colorValue3,"pan":0});
};
if(effectTypeId == 21){//眠気の兆候
  var effectName1 = 'bubble_w';
  $gameScreen._particle.particlePlay(0,effectName1,'screen','def','screen');
  var colorValue2 = '#ff00e9';
  var colorValue3 = '#86e3ff';
  $gameScreen._particle.particleUpdate([effectName1,'color',String(colorValue2),String(colorValue3)]);
  var colorValue2 = '0.05';
  $gameScreen._particle.particleUpdate([effectName1,'frequency',String(colorValue2)]);
  var colorValue2 = '3';
  $gameScreen._particle.particleUpdate([effectName1,'emitterLifetime',String(colorValue2)]);
  var colorValue2 = '45';
  var colorValue3 = '0.5';
  $gameScreen._particle.particleUpdate([effectName1,'fluctuation',String(colorValue2),String(colorValue3)]);
  $gameScreen._particle.particleUpdate([effectName1,'scale','0','0.3@0.2','2@0.95','0.8']);
  var colorValue2 = '5';
  var colorValue3 = '7';
  $gameScreen._particle.particleUpdate([effectName1,'lifetime',String(colorValue2),String(colorValue3)]);
  $gameScreen._particle.particleUpdate([effectName1,'blendMode','0']);
  $gameScreen.startFlash([85,200,255,200], 60);
  var colorValue2 = "Saint1";
  var colorValue3 = getRandomIndex(26) + 50;;
  AudioManager.playSe({"name":colorValue2,"volume":90,"pitch":colorValue3,"pan":0});
};
if(effectTypeId == 22){
  var colorValue2 = "Magic2";
  AudioManager.playSe({"name":colorValue2,"volume":100,"pitch":70,"pan":0});
  $gameScreen.startFlash([136,0,0,150], 60);
  var effectName1 = 'htext_dispray1';
  $gameScreen._particle.particlePlay(0,effectName1,'screen','def','screen');
  var effectName1 = 'htext_dispray2';
  $gameScreen._particle.particlePlay(0,effectName1,'screen','def','screen');
};
if(effectTypeId == 23){//催眠掛かる
  $gameScreen.startFlash([255,119,255,204], 60);
  var colorValue2 = "Saint1";
  AudioManager.playSe({"name":colorValue2,"volume":100,"pitch":130,"pan":0});
  $gameScreen.startFlash([136,0,0,150], 60);
  var effectName1 = 'explode_cp_4';
  $gameScreen._particle.particlePlay(0,effectName1,'screen','def','spriteset');
  $gameScreen._particle.particleUpdate([effectName1,'color','#242fff','#f1ff59']);
  $gameScreen._particle.particleUpdate([effectName1,'scale','1','0.7']);
  $gameScreen._particle.particleUpdate([effectName1,'particlesPerWave','10']);
  $gameScreen._particle.particleUpdate([effectName1,'ring',0,0,1280,0]);
  filter_direct(10,360,10,60);
};

};

//ADVパート演出クリアも。0でクリア
adv_partDirectSet = function(effectTypeId){

  if(effectTypeId != 0 && effectTypeId != 6 && effectTypeId != 9){
    if($gameScreen._tone_temp == 0){
      $gameScreen._tone_temp = $gameScreen.tone().concat();  
      $gameScreen.startTint([-100,-100,-100,100], 10);//他より薄くしている
    };
  };
  if(effectTypeId == 0){
    if($gameScreen._tone_temp != 0){
      $gameScreen.startTint($gameScreen._tone_temp, 10);
      $gameScreen._tone_temp = 0;
    };
    var particleNamesToClear = ['lines_width1','lines_width2','lines_width3','lines_width4','lines_height1','lines_height2','lines_height3','lines_height4',
               'lines_heightSB','lines_heightS','lines_sp1','shower_event','cloud_w_front','actor_particleLight','enemy_particleDark','cloud_w',
               'hologram_screen','lifeStorm_screen'];
    for (var i = 0; i <= particleNamesToClear.length-1; i++) {
      $gameScreen._particle.particleClear(particleNamesToClear[i]);
    };
  };
  if(effectTypeId == 1){
    var effectName1 = 'lines_width1';
    $gameScreen._particle.particleSet(0,effectName1,'screen','def','above');
    var effectName1 = 'lines_width4';
    $gameScreen._particle.particleSet(0,effectName1,'screen','def','screen');
    var effectName1 = 'lines_width2';
    $gameScreen._particle.particleSet(0,effectName1,'screen','def','screen');
    var effectName1 = 'lines_width3';
    $gameScreen._particle.particleSet(0,effectName1,'screen','def','spriteset');
  };
  if(effectTypeId == 2){
    var effectName1 = 'lines_height1';
    $gameScreen._particle.particleSet(0,effectName1,'screen','def','spriteset');
    var effectName1 = 'lines_height4';
    $gameScreen._particle.particleSet(0,effectName1,'screen','def','spriteset');
    var effectName1 = 'lines_height2';
    $gameScreen._particle.particleSet(0,effectName1,'screen','def','spriteset');
    var effectName1 = 'lines_height3';
    $gameScreen._particle.particleSet(0,effectName1,'screen','def','spriteset');
  };
  if(effectTypeId == 3){
    var effectName1 = 'lines_heightSB';//下から粒子
    $gameScreen._particle.particleSet(0,effectName1,'screen','def','spriteset');
    var effectName1 = 'lines_heightS';//下から粒子
    $gameScreen._particle.particleSet(0,effectName1,'screen','def','spriteset');
  };
  if(effectTypeId == 4){
    var effectName1 = 'lines_sp1';//集中線永続
    $gameScreen.startFlash([255,255,255,200], 120);
    var effectName2 = "Wind1";
    AudioManager.playSe({"name":effectName2,"volume":90,"pitch":120,"pan":0});
    $gameScreen._particle.particleSet(0,effectName1,'screen','def','spriteset');
  };
  if(effectTypeId == 5){
    var effectName1 = 'shower_event';//シャワー
    var effectName2 = "z_Shower";
    AudioManager.playSe({"name":effectName2,"volume":90,"pitch":120,"pan":0});
    $gameScreen._particle.particleSet(0,effectName1,'screen','def','spriteset');
  };
  if(effectTypeId == 6){
    var effectName1 = 'cloud_w_front';
    $gameScreen._particle.particleSet(0,effectName1,'weather','def','spriteset');
  };
  if(effectTypeId == 7){
    $gameScreen.startFlash([255,255,255,200], 120);
    var effectName2 = "Up1";
    AudioManager.playSe({"name":effectName2,"volume":90,"pitch":110,"pan":0});
    var effectName1 = 'actor_particleLight';
    $gameScreen._particle.particleSet(0,effectName1,'weather','def','spriteset');
    $gameScreen._particle.particleUpdate([effectName1,'rect',-700,400,1300,768]);
  };
  if(effectTypeId == 8){
    $gameScreen.startFlash([0,0,0,200], 120);
    var effectName2 = "Down4";
    AudioManager.playSe({"name":effectName2,"volume":90,"pitch":90,"pan":0});
    var effectName1 = 'enemy_particleDark';
    $gameScreen._particle.particleSet(0,effectName1,'weather','def','spriteset');
    $gameScreen._particle.particleUpdate([effectName1,'rect',-700,400,1300,768]);
  };
  if(effectTypeId == 9){
    var effectName1 = 'cloud_w';//天候:雲
    $gameScreen._particle.particleSet(0,effectName1,'weather','def','spriteset');
  };
  if(effectTypeId == 10){//生命の嵐
    var effectName1 = 'hologram_screen';
    $gameScreen._particle.particleSet(0,effectName1,'screen','def','spriteset');
    var effectName1 = 'lifeStorm_screen';
    $gameScreen._particle.particleSet(0,effectName1,'screen','def','spriteset');
  };

};

//フィルター演出filter_direct(1,640,384,0.01);//種類.x軸,y軸,強さ
filter_direct = function(filterTypeId,randomValue1,randomValue2,stringValue3){//0消去1絶頂2洗脳3グニャ～4oldfilm5ノイズ発生6ノイズ濃さ7ぼかし/8ぼかし濃さ/10グリッチｳｪｲﾄのみ

if(filterTypeId == 0){
  var list = ['zettyou','brainwashing','sepia','gunya1','noise1','bokasi','dokun'];
  list.forEach(function(filterName) {
    $gameMap.eraseFilter(filterName);
  }, this);
};
if(filterTypeId == 1){
  $gameScreen.startFlash([255,119,255,204], 60);
  var effectName10 = 'zettyou';
  $gameMap.createFilter(effectName10,'shockwave',0,'screen');
  $gameMap.setFilter(effectName10,[randomValue1,randomValue2,-1,50,200,1.3]);
  $gameMap.setFilterAddiTime(effectName10,stringValue3);
  $gameMap.eraseFilterAfterMove(effectName10);
};
if(filterTypeId == 2){
  var effectName4 = 180;
  if(stringValue3 == 0.02){var effectName4 = 180};
  if(stringValue3 == 0.03){var effectName4 = 150};
  if(stringValue3 == 0.04){var effectName4 = 120};
  if(stringValue3 == 0.05){var effectName4 = 90};
  $gameScreen.startFlash([255,119,255,204], effectName4);
  var effectName10 = 'brainwashing';
  $gameMap.createFilter(effectName10,'shockwave',0,'screen');
  if(stringValue3 >= 0.04){
    $gameMap.setFilter(effectName10,[randomValue1,randomValue2,-1,200,300,1]);
    var seParams = ['ZH_sticky2',100,100];
    var effectName4 = getRandomIndex(26) + Number(seParams[2]);
    $gameScreen.startShake(7, 7, 60);
  } else {
    $gameMap.setFilter(effectName10,[randomValue1,randomValue2,-1,30,160,1]);
    var seParams = ['Saint1',75,50];
    var effectName4 = getRandomIndex(26) + Number(seParams[2]);
  };
  AudioManager.playSe({"name":seParams[0],"volume":Number(seParams[1]),"pitch":effectName4,"pan":0});
  $gameMap.setFilterAddiTime(effectName10,stringValue3);
};
if(filterTypeId == 3){
  AudioManager.playSe({"name":"Z_BlackOut","volume":80,"pitch":50,"pan":0});
  var effectName10 = 'gunya1';
  $gameMap.createFilter(effectName10,'twist',0,'screen');
  $gameMap.setFilter(effectName10,[randomValue1,randomValue2,0,0]);
  $gameMap.moveFilterQueue(effectName10,[randomValue1,randomValue2,1280,2],180);
  $gameMap.moveFilterQueue(effectName10,[randomValue1,randomValue2,1280,4],180);
  $gameMap.moveFilterQueue(effectName10,[randomValue1,randomValue2,1280,6],180);
  $gameMap.moveFilterQueue(effectName10,[randomValue1,randomValue2,1280,8],180);
  $gameMap.moveFilterQueue(effectName10,[randomValue1,randomValue2,1280,10],800);
};
if(filterTypeId == 4){
  var effectName10 = 'sepia';
  $gameMap.createFilter(effectName10,'oldfilm',0,'screen');
};
if(filterTypeId == 5){
  var effectName10 = 'noise1';
  $gameMap.createFilter(effectName10,'noise',0,'screen');
  $gameMap.setFilter(effectName10,[randomValue1]);
};
if(filterTypeId == 6){
  $gameMap.moveFilterQueue(effectName10,[randomValue1],randomValue2);
};
if(filterTypeId == 7){
  var effectName10 = 'bokasi';
  $gameMap.createFilter(effectName10,'blur',0,'screen');
  $gameMap.setFilter(effectName10,[randomValue1]);
};
if(filterTypeId == 8){
  $gameMap.moveFilterQueue(effectName10,[randomValue1],randomValue2);
};
if(filterTypeId == 9){
  var effectName10 = 'dokun';
  $gameMap.createFilter(effectName10,'zoomblur',0,'screen');
  $gameMap.setFilter(effectName10,[randomValue1,randomValue2,0,0.5]);
  $gameMap.moveFilterQueue(effectName10,[randomValue1,randomValue2,0,0],stringValue3);
  $gameMap.eraseFilterAfterMove(effectName10);
  var effectName4 = 100;
  if(stringValue3 <= 20){var effectName4 = 100};
  if(stringValue3 <= 10){var effectName4 = 150};
  if(stringValue3 >= 30){var effectName4 = 90};
  if(stringValue3 >= 40){var effectName4 = 80};
  if(stringValue3 >= 60){var effectName4 = 50};
  AudioManager.playSe({"name":'Z_HeartBeat',"volume":90,"pitch":effectName4,"pan":0});
  $gameScreen.startFlash([255,255,255,effectName4], stringValue3);
};
if(filterTypeId == 10){
  var effectName10 = 'glitch1';
  var effectName4 = 2;//getRandomIndex(11) + 5;
  if(randomValue1 == 1000){var effectName5 = getRandomIndex(360)}else{var effectName5 = randomValue1};
  if(randomValue2 == 1000){var effectName6 = getRandomIndex(11)}else{var effectName6 = randomValue2};
  $gameMap.createFilter(effectName10,'glitch',0,'screen');
  //$gameMap.setFilter(effectName10,[effectName4,100,effectName5,effectName6,0]);
  $gameMap.moveFilterQueue(effectName10,[effectName4,100,effectName5,effectName6,0],stringValue3);
  $gameMap.eraseFilterAfterMove(effectName10);
  AudioManager.playSe({"name":"Z_CGDispray","volume":20,"pitch":150,"pan":0});
};

};

//属性によるパーティクル発生
element_particleSet = function(elementParticleTypeId,parallaxName1,parallaxName2,effectName5){

  if(elementParticleTypeId == 0){
    picture_fade1(parallaxName1-1,"fadeOut",'102',60,5);
    picture_fade1(parallaxName1+1,"fadeOut",'102',60,5);
    var particleNamesToClear = ['sparks_w2','petal_w','lines_width3','stardust_w','bubble_w','diamonddust_w','black_particle_w','ether_sp'];
    for (var i = 0; i <= particleNamesToClear.length-1; i++) {
      $gameScreen._particle.particleClear(particleNamesToClear[i]);
    };
  };
  if(elementParticleTypeId == 1){
    var parallaxName3 = 'ether_sp';
    if(parallaxName2 == 51 || parallaxName2 == 3){var parallaxName3 = 'sparks_w2'};
    if(parallaxName2 == 52 || parallaxName2 == 4){var parallaxName3 = 'petal_w'};
    if(parallaxName2 == 53 || parallaxName2 == 5){var parallaxName3 = 'stardust_w'};
    if(parallaxName2 == 54 || parallaxName2 == 6){var parallaxName3 = 'bubble_w'};
    if(parallaxName2 == 55 || parallaxName2 == 7){var parallaxName3 = 'diamonddust_w'};
    if(parallaxName2 == 56 || parallaxName2 == 8){var parallaxName3 = 'black_particle_w'};
    if(parallaxName2 == 57 || parallaxName2 == 9){var parallaxName3 = 'ether_sp'};
    $gameScreen._particle.particleSet(0,parallaxName3,'screen','def','spriteset');
  };
  if(elementParticleTypeId == 2){
    if(parallaxName2 >= 1){
      var parallaxName3 = '/img/parallaxes/Scene_Element_' + parallaxName2;
      $gameScreen.showPicture(parallaxName1-1,parallaxName3,1,640,384+effectName5,100,100,200,1);
      picture_fade1(parallaxName1-1,"fadeIn",'102',60,5);
      hcg_piston(parallaxName1-1,7,1,2);
      $gameScreen.showPicture(parallaxName1+1,parallaxName3,1,640,384+effectName5,100,100,50,1);
      picture_fade1(parallaxName1+1,"fadeIn",'102',60,5);
      hcg_piston(parallaxName1+1,7,1,2);
    };
  };

};

//gabによるパーティクル発生
gab_wordParticle = function(gabText){

AudioManager.playSe({"name":'Chime2',"volume":90,"pitch":100,"pan":0});
var effectName1 = 'text_dispray2';
$gameScreen._particle.particleClear(effectName1);
var scene = SceneManager._scene;
if(!scene) return;
if (scene._gabWindow) scene.clearGabWindow();
$gameScreen._particle.particlePlay(0,effectName1,'screen','def','screen');
//$gameScreen._particle.particleUpdate([effectName1,'pos',-600,-260]);
$gameScreen._particle.particleExceed(effectName1,0.3);
var gabData = [`　　　${gabText}`,'',0,0,'',0];
if (scene._gabWindow) scene.startGabWindow(gabData);

};

//Hランク上昇任意hSkill_rankUpWordDirect(1,1,671,1);//1が最初2が文字で0で締め,ｱｸﾀｰ,ｽｷﾙid,ﾗﾝｸｾｯﾄ
hSkill_rankUpWordDirect = function(messageTypeId,actorIdOrMessageText,skillId,masteryLevel){

if(messageTypeId == 1){
  var actor = $gameActors.actor(actorIdOrMessageText);
  if(!$gameSwitches.value(29)){actor.setSkillMasteryLevel(skillId, masteryLevel)};
  valueWordSet0 = `\\C[26]${actor.name()}\\C[0]の\\C[27]<\\sin[${skillId}]>\\C[0]ランクが\\C[10]${masteryLevel}\\C[0]になった…。`;
  adv_partDirectPlay(19);
};
if(messageTypeId == 2){
  valueWordSet0 = actorIdOrMessageText;
  adv_partDirectPlay(19);
};
if(messageTypeId == 0){
  adv_partDirectPlay(0);
  picture_fade1(108,"fadeOut",'Hscene005',120,5);
  $gameScreen.movePicture(109,1,640-200,384,100,100,0,0,120);
  $gameScreen.movePicture(110,1,640-200,384,100,100,0,0,120);
};

};

//獲得物の簡易表示get_infoDirect(0,51,0,1);
get_infoDirect = function(databaseTypeId,databaseEntryId,actorId,itemAmount){

var seParams = ['Saint5',75,50];
if(databaseTypeId == 0){var gameSwitchValue1 = `\\C[2]＜\x1bIIN[${databaseEntryId}]＞\\C[0]`;var databaseEntries = $dataItems;var stringValue2 = `を入手した！`};
if(databaseTypeId == 1){var gameSwitchValue1 = `\\C[2]＜\x1bWIN[${databaseEntryId}]＞\\C[0]`;var databaseEntries = $dataWeapons;var stringValue2 = `を入手した！`};
if(databaseTypeId == 2){var gameSwitchValue1 = `\\C[2]＜\x1bAIN[${databaseEntryId}]＞\\C[0]`;var databaseEntries = $dataArmors;var stringValue2 = `を入手した！`};
if(databaseTypeId == 3){var gameSwitchValue1 = `\\C[2]＜\x1bSIN[${databaseEntryId}]＞\\C[0]`;var databaseEntries = $dataSkills;var stringValue2 = `獲得した！`};
if(databaseTypeId == 4){var gameSwitchValue1 = `\\C[6]${databaseEntryId.toLocaleString()}\G\\C[0]`;var databaseEntries = $dataSkills;var stringValue2 = `入手した！`};
if(databaseTypeId == 5){var gameSwitchValue1 = `\\C[2]＜\x1bJ[${databaseEntryId}]＞\\C[0]`;var databaseEntries = $dataClasses;var stringValue2 = `が解放された！`};
if(databaseEntryId <= -1 && databaseTypeId == 4){var stringValue2 = `失った…。`};
if([0,1,2].some(function(id){return databaseTypeId == id})){
  if(itemAmount <= -1){
    var stringValue2 = `を失った…。`;
}};
if(databaseTypeId == 4){
  var gameSwitchValue5 = 100;
  if(databaseEntryId >= 10000 && databaseEntryId <= 30000){var gameSwitchValue5 = 90};
  if(databaseEntryId >= 30001 && databaseEntryId <= 60000){var gameSwitchValue5 = 80};
  if(databaseEntryId >= 60001 && databaseEntryId <= 100000){var gameSwitchValue5 = 70};
  if(databaseEntryId >= 100001 && databaseEntryId <= 200000){var gameSwitchValue5 = 60};
  if(databaseEntryId >= 200001){var gameSwitchValue5 = 50};
  var seParams = ['Shop1',100,gameSwitchValue5];
  if(!$gameSwitches.value(29)){$gameParty.gainGold(databaseEntryId)};
} else {
  if(!databaseEntries[databaseEntryId]) return;
  if(databaseEntries[databaseEntryId].meta['EICSwitch']){
    if(Number(databaseEntries[databaseEntryId].meta['EICSwitch']) == 104){
      var gameSwitchValue1 = `\\C[17]称号:\\C[0]`　+ gameSwitchValue1;
    };
    if(Number(databaseEntries[databaseEntryId].meta['EICSwitch']) == 105){
      var gameSwitchValue1 = `\\C[27]Ｈ称号:\\C[0]`　+ gameSwitchValue1;
      var seParams = ['ZH_Sexy',50,150];
    };
    if(Number(databaseEntries[databaseEntryId].meta['EICSwitch']) == 108){
      var gameSwitchValue1 = `\\C[20]クエスト:\\C[0]`　+ gameSwitchValue1;
    };
  };
  if(databaseTypeId == 3){
    var gameSwitchValue1 = `${$dataSystem.skillTypes[databaseEntries[databaseEntryId].stypeId]}:` + gameSwitchValue1;
    if(databaseEntries[databaseEntryId].stypeId == 14 || databaseEntries[databaseEntryId].stypeId == 15){
      var stringValue2 = `を獲得した………。`;
      var seParams = ['ZH_Sexy',50,150];
    };
  };
  if(databaseTypeId == 5){
    if(databaseEntries[databaseEntryId].meta['Subclass Only']){
      var gameVarValue4 = `\\C[17]サブジョブ \\C[0]`;
    } else {
      var gameVarValue4 = `\\C[20]メインジョブ \\C[0]`;
    };
    if(databaseEntries[databaseEntryId].meta['classRank']){
      if(Number(databaseEntries[databaseEntryId].meta['classRank']) == 1){gameVarValue4 += `Class\\C[10]Ⅰ\\C[0]`};
      if(Number(databaseEntries[databaseEntryId].meta['classRank']) == 2){gameVarValue4 += `Class\\C[10]Ⅱ\C[0]`};
      if(Number(databaseEntries[databaseEntryId].meta['classRank']) == 3){gameVarValue4 += `Class\\C[10]Ⅲ\\C[0]`};
      if(Number(databaseEntries[databaseEntryId].meta['classRank']) == 4){gameVarValue4 += `Class\\C[10]Ⅳ\\C[0]`};
    };
    var gameSwitchValue1 = `${gameVarValue4}:`　+ gameSwitchValue1;
  };
  if(databaseTypeId <= 2){
    if(!$gameSwitches.value(29)){$gameParty.gainItem(databaseEntries[databaseEntryId], itemAmount)};
  };
  if(databaseTypeId == 3){
    if(actorId == 0){
      var gameVarValue4 = $gameVariables.value(2);
    } else {
      var gameVarValue4 = actorId;
    };
    var actor = $gameActors.actor(gameVarValue4);
    if(!!actor && !actor.isLearnedSkill(databaseEntryId)){
      if(!$gameSwitches.value(29)){actor.learnSkill(databaseEntryId)};
    };
    var gameSwitchValue1 = `\x1bN[${gameVarValue4}]が`　+ gameSwitchValue1;
  };
  if(databaseTypeId == 5){
    if(actorId == 0){
      var gameVarValue4 = $gameVariables.value(2);
    } else {
      var gameVarValue4 = actorId;
    };
    var actor = $gameActors.actor(gameVarValue4);
    if(!!actor && !actor._unlockedClasses.contains(databaseEntryId)){
      if(!$gameSwitches.value(29)){actor.unlockClass(databaseEntryId)};
    };
    var gameSwitchValue1 = `\x1bN[${gameVarValue4}]の`　+ gameSwitchValue1;
  };
};
if([0,1,2].some(function(id){return databaseTypeId == id})){
  var gameSwitchValue1 = gameSwitchValue1 + `×${itemAmount} `
};
var gameSwitchValue3 = `　　${gameSwitchValue1} ${stringValue2}`;
TickerManager.show(gameSwitchValue3);
if($gameSwitches.value(124)){
  if([0,1,2,3].some(function(id){return databaseTypeId == id})){
    var descriptionLines = databaseEntries[databaseEntryId].description.split("\n");
    if(descriptionLines[0] == 0){}else{TickerManager.show(`　　　解説文:${descriptionLines[0]}`)};
    if(descriptionLines[1] == 0){}else{TickerManager.show(`　　　${descriptionLines[1]}`)};
  };
};
AudioManager.playSe({"name":seParams[0],"volume":Number(seParams[1]),"pitch":Number(seParams[2]),"pan":0});
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
direct_staging1 = function(stagingTypeId,valuePic1,scratchValue2,scratchValue3){

if(stagingTypeId == 1){//1絶望的な回想
  pic_1(2,valuePic1,scratchValue2,0,100,255,60,1280,768,scratchValue3,0);
  $gameScreen.startFlash([255,255,255,170], 60);
  filter_direct(9,640,384,60);
  filter_direct(10,1000,1000,60);
  filter_direct(4,0,0,0);
  filter_direct(5,0.1,0,0);
};
if(stagingTypeId == 2){

};

};

//}());