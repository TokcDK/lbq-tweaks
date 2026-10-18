/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){

menu_particleSet = function () {//メニューパーティクル設定

  const CHARM_FREQUENCY_BY_SKILL_ID = { 61: 0.09, 62: 0.08, 63: 0.07, 64: 0.06, 65: 0.05, 66: 0.04, 67: 0.03, 68: 0.02, 69: 0.01, 70: 0.01 };

  let particleName = 'particle_w';
  if ($gameSwitches.value(15)) { particleName = 'particle_w1' };
  let particleZ = 'above';
  const actor = $gameParty.members()[0];
  if (!actor) return;
  if (actor.isStateAffected(61)) { particleName = 'charm_bw2'; particleZ = 'above' };
  if (actor._subclassId == 41 || actor._subclassId == 42) { particleName = 'romantic_mood'; particleZ = 'below' };
  const particle = $gameScreen._particle;
  particle.particleSet(0, 'menu', 'Scene_Menu', particleName, particleZ);
  if (actor._subclassId != 41 && actor._subclassId != 42) {
    if (actor.isStateAffected(61)) {
      let frequency = 0.1;
      let colorTo = '#ffffff';
      for (let skillId = 61; skillId <= 70; skillId++) {
        if (actor.isLearnedSkill(skillId)) {
          frequency = CHARM_FREQUENCY_BY_SKILL_ID[skillId];
          if (skillId == 65) { colorTo = '#ff003b' };
        };
      };
      particle.particleUpdate(['menu', 'frequency', String(frequency)]);
      particle.particleUpdate(['menu', 'color', '#e200ff', colorTo]);
    } else {
      if ($gameSwitches.value(201)) {
        particle.particleUpdate(['menu', 'acceleration', '0', '-20']);
        particle.particleUpdate(['menu', 'color', '#ff77b6', '#fffdb9']);
      };
    };
  };
  particle.particleExceed('menu', 60);

};

//天候設定
weather_set = function () {

  valueWeather = Array(51).fill(0);
  const pickFrom = (candidates) => candidates[getRandomIndex(candidates.length)];

  valueWeather[1] = pickFrom([0.1, 0.15, 0.20, 0.25, 0.30]);//暗闇の視界制限
  valueWeather[2] = getRandomIndex(6) + 1;
  valueWeather[3] = pickFrom([0.3, 0.4, 0.5]);//六色ネオン
  valueWeather[4] = pickFrom([0.02, 0.03, 0.04, 0.05, 0.06]);//薄いフォグ
  valueWeather[5] = getRandomIndex(6) + 5;
  valueWeather[6] = getRandomIndex(51) + 50;
  valueWeather[7] = pickFrom([0.05, 0.06, 0.07, 0.08, 0.09]);//モヤの影
  valueWeather[8] = getRandomIndex(51) + 50;//速度
  valueWeather[9] = getRandomIndex(6) + 5;//スケール
  valueWeather[10] = pickFrom([-500, 0, 600]);//全体マップ
  valueWeather[11] = pickFrom([0.25, 0.30, 0.35, 0.40]);
  valueWeather[12] = getRandomIndex(5) + 6;
  valueWeather[13] = getRandomIndex(26) + 25;//天候:雲
  valueWeather[14] = pickFrom([0.30, 0.31, 0.32, 0.33, 0.35, 0.35, 0.36, 0.37, 0.38, 0.39, 0.40, 0.45]);//雲透明
  valueWeather[15] = getRandomIndex(76) + 25;//雲の影
  valueWeather[16] = pickFrom([0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40]);//透明度
  valueWeather[17] = pickFrom([0.1, 0.11, 0.12, 0.13, 0.14, 0.15]);//木漏れ日[weather]
  valueWeather[18] = getRandomIndex(8) + 7;
  valueWeather[19] = getRandomIndex(10) + 15;
  valueWeather[20] = getRandomIndex(5) + 0;
  valueWeather[21] = pickFrom([-500, 0, 600]);//太陽光のフレア
  valueWeather[22] = pickFrom([0.5, 0.6, 0.7, 0.8, 0.9, 1.0]);
  valueWeather[23] = getRandomIndex(3) + 4;
  valueWeather[24] = pickFrom([0.05, 0.06, 0.07]);//淡いライトリーク。夜の街。
  valueWeather[25] = getRandomIndex(41) + 10;
  valueWeather[26] = pickFrom([0.06, 0.07, 0.08, 0.09, 0.05]);//青&緑のライトリーク
  valueWeather[27] = getRandomIndex(5) + 1;
  valueWeather[28] = pickFrom([0.08, 0.09, 0.10, 0.11, 0.12]);//fog_battle_front
  valueWeather[29] = getRandomIndex(71) + 30;
  const sharedValue = getRandomIndex(81) + 20;//particle_w2
  valueWeather[30] = sharedValue;
  valueWeather[31] = sharedValue;
  valueWeather[32] = sharedValue;
  valueWeather[33] = sharedValue;

  valueWeather[46] = getRandomIndex(51) + 150;
  valueWeather[47] = getRandomIndex(51) + 100;//ダンジョン暗さ
  valueWeather[48] = [1, 2, 3, 4, 5, 6][getRandomIndex(6)];//空夜パターン
  valueWeather[49] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10][getRandomIndex(10)];//空パターン
  valueWeather[50] = [-1, -2, -3, -4, -5][getRandomIndex(5)];//xスクロール

};

//マップの環境パーティクル設定と色調と遠景
map_weatherSet1 = function () {

  let valueDarkness = 0;
  let valueLightChara = 0;
  let lightCharaValues;
  if ($gameMap.parallaxName() === "BlueSky" && $gameSwitches.value(15)) {
    $gameMap.changeParallax("StarlitSky", true, false, 1, 0);
  };
  if ($dataMap.meta['LightChara']) {//<LightChara:1, 3, 200, 0.1>
    lightCharaValues = $dataMap.meta['LightChara'].split(',');
    valueLightChara = Number(lightCharaValues[0]);
  };
  if (!$gameSwitches.value(212)) {
    if ($gameSwitches.value(15)) {
      valueDarkness = valueWeather[46];
    };
    if ($gameSwitches.value(207) && $gameSwitches.value(204)) {//屋内ダンジョン
      valueDarkness = valueWeather[47];
    };
  };
  if ($dataMap.meta['DarkSource']) {
    valueDarkness = Number($dataMap.meta['DarkSource']);
  };
  if ($gameSwitches.value(209) || $gameSwitches.value(227)) {
    let skyPatternValue;
    if ($gameSwitches.value(15)) {
      $gameVariables.setValue(197, "SkyPatternNight");
      skyPatternValue = valueWeather[48];
    } else {
      $gameVariables.setValue(197, "SkyPattern");
      skyPatternValue = valueWeather[49];
    };
    const skyScrollValue = valueWeather[50];
    $gameMap.changeParallax($gameVariables.value(197) + skyPatternValue, true, false, skyScrollValue, 0);
  };
  if (valueDarkness >= 1) {
    $gameMap.darknessOpacity = valueDarkness;
  };
  if (valueLightChara >= 1) {
    $gamePlayer.moveLight(Number(lightCharaValues[0]), Number(lightCharaValues[1]), Number(lightCharaValues[2]), Number(lightCharaValues[3]));
  };
  if (!$gameSwitches.value(46)) {
    map_weatherSet2();
  };
  map_regionSet();
};

//マップの環境パーティクル設定と色調と遠景
map_weatherSet2 = function () {

  const particle = $gameScreen._particle;
  let particleTarget = 'weather';
  if ($gameParty.inBattle()) { particleTarget = 'battleWeather' };
  particle.particleSet(0, 'click', 'click', 'def', 'above');
  particle.particleSet(0, 'click', 'click2', 'def', 'above');
  if (!$gameSwitches.value(201) && $gameSwitches.value(205)) {
    particle.particleSet(0, 'dust_walk', 'walk:player', 'def', 'below');
  };
  let clearOtherParticles = 0;
  let weatherTypeId;
  if ($gameSwitches.value(15)) {
    weatherTypeId = $gameVariables.value(251);
  } else {
    weatherTypeId = $gameVariables.value(256);
  };
  $gameSystem.setBgsFadeForSe(10);

  switch (weatherTypeId) {
    case 1: {//暗闇の視界制限
      const particleName = 'darkness_s';
      particle.particleSet(0, particleName, particleTarget, 'def', '99');
      particle.particleUpdate([particleName, 'alpha', '0', valueWeather[1] + '@0.5', '0']);
      particle.particleUpdate([particleName, 'speed', String(valueWeather[2]), String(valueWeather[2])]);
      break;
    }
    case 2: {//雨天時のモヤ
      const particleName = 'rain_fog_w';
      particle.particleSet(0, particleName, particleTarget, 'def', '99');
      clearOtherParticles = 1;
      break;
    }
    case 3: {//薄暗い廃墟など
      const particleName = 'dust_w';
      particle.particleSet(0, particleName, particleTarget, 'def', '99');
      clearOtherParticles = 1;
      break;
    }
    case 4: {//しとしと雨
      particle.particleSet(0, 'rain_w', particleTarget, 'def', '99');
      particle.particleSet(0, 'rain_fog_w', particleTarget, 'def', '99');//雨天時のモヤ
      //var clearOtherParticles = 1;他と共存させる。
      $gameSystem.setBgsLine(10);
      AudioManager.playBgs({ "name": "11_Drips", "volume": 25, "pitch": 100, "pan": 0 });
      break;
    }
    case 5: {//強めの雨
      particle.particleSet(0, 'rain_w2', particleTarget, 'def', '99');
      particle.particleSet(0, 'rain_fog_w', particleTarget, 'def', '99');//雨天時のモヤ
      $gameSystem.setBgsLine(10);
      AudioManager.playBgs({ "name": "11_Storm1", "volume": 20, "pitch": 150, "pan": 0 });
      clearOtherParticles = 1;
      break;
    }
    case 6: {//本降りの雨
      particle.particleSet(0, 'rain_w3', particleTarget, 'def', '99');
      $gameSystem.setBgsLine(10);
      AudioManager.playBgs({ "name": "11_Storm1", "volume": 25, "pitch": 100, "pan": 0 });
      clearOtherParticles = 1;
      break;
    }
    case 7: {//うっすらと降る雪
      particle.particleSet(0, 'snow_w', particleTarget, 'def', '99');
      particle.particleSet(0, 'snow_w2', particleTarget, 'def', '99');//雪の結晶
      break;
    }
    case 8: {//吹雪
      particle.particleSet(0, 'blizard_w', particleTarget, 'def', '99');
      $gameSystem.setBgsLine(10);
      AudioManager.playBgs({ "name": "11_Wind", "volume": 25, "pitch": 50, "pan": 0 });
      clearOtherParticles = 1;
      break;
    }
    case 9: {//ピカッと一瞬光る稲妻
      particle.particleSet(0, 'thunder_w', particleTarget, 'def', '99');
      $gameSystem.setBgsLine(10);
      AudioManager.playBgs({ "name": "11_Thunder", "volume": 50, "pitch": 150, "pan": 0 });
      break;
    }
    case 10: {//黄色の稲妻
      particle.particleSet(0, 'thunder_w2', particleTarget, 'def', '99');
      $gameSystem.setBgsLine(10);
      AudioManager.playBgs({ "name": "11_Thunder", "volume": 50, "pitch": 100, "pan": 0 });
      break;
    }
    case 11: {//火事現場
      particle.particleSet(0, 'dust_w', particleTarget, 'def', 'spriteset');
      particle.particleSet(0, 'particle_w', particleTarget, 'def', 'spriteset');
      particle.particleSet(0, 'sparks_w', particleTarget, 'def', 'spriteset');
      particle.particleSet(0, 'sparks_w2', particleTarget, 'def', 'spriteset');
      particle.particleGroupSet(0, 'narration_fire_s', particleTarget);
      $gameScreen.startTint([68, -34, -34, 68], 10);
      $gameSystem.setBgsLine(10);
      AudioManager.playBgs({ "name": "11_fire", "volume": 25, "pitch": 80, "pan": 0 });
      clearOtherParticles = 1;
      break;
    }
    case 12: {//海底
      particle.particleSet(0, 'bubble_w', particleTarget, 'def', 'spriteset');
      particle.particleSet(0, 'fog_w', particleTarget, 'def', 'spriteset');
      particle.particleSet(0, 'fish_w', particleTarget, 'def', 'spriteset');
      particle.particleSet(0, 'light_pillar_w', particleTarget, 'def', 'spriteset');
      $gameScreen.startTint([-100, -30, 0, 0], 10);
      $gameScreen.startDisplacementFilter(2, 2, 10, 'DisplacementMap');
      particle.particleSet(0, 'bubble_c', 'attach:player', 'def', '99');
      $gameSystem.setBgsLine(10);
      AudioManager.playBgs({ "name": "11_Sea", "volume": 25, "pitch": 50, "pan": 0 });
      clearOtherParticles = 1;
      break;
    }
    case 13: {//太陽光のフレア//砂漠
      const particleName = 'flare_s';
      particle.particleSet(0, particleName, particleTarget, 'def', '99');
      const flareX = [-500, 0, 600][getRandomIndex(3)];
      particle.particleUpdate([particleName, 'pos', String(flareX), -600]);
      const flareAlpha = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0][getRandomIndex(6)];
      particle.particleUpdate([particleName, 'alpha', '0', flareAlpha + '@0.2', flareAlpha + '@0.8', '0']);
      particle.particleUpdate([particleName, 'scale', '10', '10']);
      clearOtherParticles = 1;
      break;
    }
    case 14: {//六色ネオン
      const particleName = 'light_leak_s3';
      particle.particleSet(0, particleName, particleTarget, 'def', '99');
      particle.particleUpdate([particleName, 'alpha', '0', valueWeather[3] + '@0.5', '0']);
      clearOtherParticles = 1;
      break;
    }
  }
  if (clearOtherParticles >= 1) {
    for (const particleName of ['fog_w', 'fog_shadow_w', 'flash_s', 'cloud_w', 'stardust_w', 'cloud_shadow_w',
      'dappled_r1', 'flare_s', 'light_leak_s', 'light_leak_s2']) {
      particle.particleClear(particleName);
    };
  };
  if (clearOtherParticles == 0) {
    if ($gameSwitches.value(207) && $gameSwitches.value(204)) {
      const particleName = 'fog_w';//薄いフォグ
      particle.particleSet(0, particleName, particleTarget, 'def', '99');
      particle.particleUpdate([particleName, 'alpha', '0', valueWeather[4] + '@0.05', valueWeather[4] + '@0.9', '0']);
      particle.particleUpdate([particleName, 'scale', String(valueWeather[5]), valueWeather[5] + '@0.5', String(valueWeather[5])]);
      particle.particleUpdate([particleName, 'speed', String(valueWeather[6]), String(valueWeather[6])]);
    };
    if ($gameSwitches.value(207) && $gameSwitches.value(203)) {
      const particleName = 'fog_shadow_w';//モヤの影
      particle.particleSet(0, particleName, particleTarget, 'def', '99');
      particle.particleUpdate([particleName, 'alpha', '0', valueWeather[7] + '@0.05', valueWeather[7] + '@0.9', '0']);
      particle.particleUpdate([particleName, 'speed', String(valueWeather[8]), String(valueWeather[8])]);
      particle.particleUpdate([particleName, 'scale', String(valueWeather[9]), valueWeather[9] + '@0.5', String(valueWeather[9])]);
    };
    if ($gameSwitches.value(209) || $gameSwitches.value(227)) {//全体マップと艦橋マップ
      let particleName = 'flash_s';//太陽光のフラッシュ
      particle.particleSet(0, particleName, particleTarget, 'def', '99');
      particle.particleUpdate([particleName, 'pos', String(valueWeather[10]), -600]);
      particle.particleUpdate([particleName, 'alpha', '0', valueWeather[11] + '@0.2', '0']);
      particle.particleUpdate([particleName, 'scale', String(valueWeather[12]), String(valueWeather[12])]);
      particleName = 'cloud_w';//天候:雲
      particle.particleSet(0, particleName, particleTarget, 'def', '99');
      particle.particleUpdate([particleName, 'speed', String(valueWeather[13]), String(valueWeather[13])]);
      particle.particleUpdate([particleName, 'alpha', '0', valueWeather[14] + '@0.05', valueWeather[14] + '@0.9', '0']);
      particleName = 'particle_w2';//空域図浮遊パーティクル
      particle.particleSet(0, particleName, particleTarget, 'def', '99');
      particle.particleUpdate([particleName, 'speed', String(valueWeather[30]), '10']);
    } else {
      if ($gameSwitches.value(13) && $gameSwitches.value(203)) {
        let particleName = 'cloud_shadow_w';//雲の影
        particle.particleSet(0, particleName, particleTarget, 'def', '99');
        particle.particleUpdate([particleName, 'speed', String(valueWeather[15]), String(valueWeather[15])]);
        particle.particleUpdate([particleName, 'alpha', '0', valueWeather[16] + '@0.05', valueWeather[16] + '@0.9', '0']);
        particleName = 'dappled_r1';//木漏れ日[weather]
        particle.particleSet(0, particleName, particleTarget, 'def', '99');
        particle.particleUpdate([particleName, 'alpha', '0', valueWeather[17] + '@0.4', valueWeather[17] + '@0.6', '0']);
        particle.particleUpdate([particleName, 'scale', String(valueWeather[18]), String(valueWeather[19])]);
        particle.particleUpdate([particleName, 'speed', String(valueWeather[20]), String(valueWeather[20])]);
      };
    };
    if ($gameSwitches.value(205) && $gameSwitches.value(15)) {
      const particleName = 'stardust_w';//スターダスト。野外屋外フィールド
      particle.particleSet(0, particleName, particleTarget, 'def', '99');
    };
    if ($gameSwitches.value(14) && $gameSwitches.value(203)) {
      let particleName = 'flare_s';//太陽光のフレア
      particle.particleSet(0, particleName, particleTarget, 'def', '99');
      particle.particleUpdate([particleName, 'pos', String(valueWeather[21]), -600]);
      particle.particleUpdate([particleName, 'alpha', '0', valueWeather[22] + '@0.2', valueWeather[22] + '@0.8', '0']);
      particle.particleUpdate([particleName, 'scale', String(valueWeather[23]), String(valueWeather[23])]);
    };
    if ($gameSwitches.value(15) && $gameSwitches.value(203)) {
      let particleName = 'light_leak_s';//淡いライトリーク。夜の街。
      particle.particleSet(0, particleName, particleTarget, 'def', '99');
      particle.particleUpdate([particleName, 'alpha', '0', valueWeather[24] + '@0.1', '0']);
      particle.particleUpdate([particleName, 'scale', String(valueWeather[25]), String(valueWeather[25])]);
      particleName = 'light_leak_s2';//青&緑のライトリーク
      particle.particleSet(0, particleName, particleTarget, 'def', '99');
      particle.particleUpdate([particleName, 'alpha', '0', valueWeather[26] + '@0.1', '0']);
      particle.particleUpdate([particleName, 'scale', String(valueWeather[27]), valueWeather[27] + '@0.5', String(valueWeather[27])]);
    };
  };

};

//リージョンごとのタイル数を数えて valueRegionMapArray を更新する。
//マップデータのみで決まる値なので、リージョン指定のパーティクル設定とは独立に扱える。
map_regionCountSet = function () {

  const regionEventCounts = Array(151).fill(0);
  const mapWidth = $gameMap.width();
  const mapHeight = $gameMap.height();
  for (let x = 0; x < mapWidth; x++) {
    for (let y = 0; y < mapHeight; y++) {
      const regionId = $gameMap.regionId(x, y);
      if (regionId < 1) continue;
      regionEventCounts[regionId] += 1;
    }
  };
  valueRegionMapArray = regionEventCounts;
  return regionEventCounts;
};

//リージョン数の更新はイベントに頼らず、マップ読み込みのたびに確実に行う。
//(以前はマップ最初のイベントからのみ更新していたため、そのイベントが実行されない
// セーブ読み込み時などには前のマップの値が残り、存在しないリージョンのイベントを
//  生成しようとして「座標の取得に失敗」していた)
var _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
Scene_Map.prototype.onMapLoaded = function () {
  _Scene_Map_onMapLoaded.apply(this, arguments);
  if ($gameMap) map_regionCountSet();
};

//特定リージョンに対応したパーティクルと動的生成その他
map_regionSet = function () {

  const particle = $gameScreen._particle;
  //if($gameMap.regionId($gamePlayer._realX, $gamePlayer._realY+1) == 91){
  //$gameSwitches.setValue(206,true);
  //};
  const regionEventCounts = map_regionCountSet();
  const REGION_PARTICLE_SETTINGS = [
    { regionId: 30, particleNames: ['dappled_r'], z: 'above' },
    { regionId: 31, particleNames: ['light_pillar_r'], z: 'above' },
    { regionId: 32, particleNames: ['light_floor_r'], z: 'below' },
    { regionId: 33, particleNames: ['bubble_cp'], z: 'above' },
    { regionId: 34, particleNames: ['darkness_r'], z: 'above' },
    { regionId: 35, particleNames: ['poison_r'], z: 'below' },
    { regionId: 36, particleNames: ['dark_hole_r', 'dark_hole_r_2', 'dark_hole_r_3'], z: 'above' },
    { regionId: 37, particleNames: ['magma_r'], z: 'below' },
    { regionId: 38, particleNames: ['ripple_r'], z: 'below' },
  ];
  for (const setting of REGION_PARTICLE_SETTINGS) {
    if (regionEventCounts[setting.regionId] < 1) continue;
    for (const particleName of setting.particleNames) {
      particle.particleSet(0, particleName, 'region:' + setting.regionId, 'def', setting.z);
    };
  };
  if (regionEventCounts[3] >= 1) {
    particle.particleSet(0, 'splash_walk', 'walk:player:3', 'def', 'below');
    particle.particleSet(0, 'ripple_walk', 'walk:player:3', 'def', 'below');
  };
  //135拠点着替え 134拠点宿泊 133拠点クリスタルなし 123死体 119火災 130回復魔方陣 87滝下 2滝上
  const sourceEventIds = [246, 245, 244, 241, 99, 73, 83, 82, 81, 241, 241, 241, 203, 200, 199, 186, 183, 90, 165, 162, 159, 158, 154, 135, 134, 67, 77, 87, 2, 61, 100, 49, 60, 54, 66, 50, 51, 65, 97, 101, 115, 123, 119, 117, 138, 231, 48, 116];//動的生成元イベントID
  const regionIds = [112, 111, 110, 109, 108, 107, 106, 105, 104, 101, 102, 103, 18, 94, 95, 17, 60, 69, 70, 71, 72, 73, 74, 93, 92, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77, 76, 75, 29, 28, 20, 19, 16, 7, 6];//リージョンID
  for (let i = 0; i < sourceEventIds.length; i++) {
    const sourceEventId = Number(sourceEventIds[i]);//死体。npc配置で血痕
    const regionId = Number(regionIds[i]);
    if (regionEventCounts[regionId] < 1) continue;
    const mapWidth = $gameMap.width();
    const mapHeight = $gameMap.height();
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        if ($gameMap.regionId(x, y) != regionId) continue;
        $gameMap.spawnEvent(sourceEventId, x, y, true);
        if (regionId == 91 && $gameVariables.value(327)[$gameMap.mapId()] >= 1) {
          $gameSelfSwitches.setValue([$gameMap.mapId(), $gameMap.getLastSpawnEventId(), 'A'], true);
        };
      }
    };
  };
  const DIRECTION_BY_STANDING_REGION_ID = { 24: 2, 25: 4, 26: 6, 27: 8, 41: 2, 42: 4, 43: 6, 44: 8 };
  const spawnStandingNpc = (sourceEventId, regionId) => {
    if (regionEventCounts[regionId] < 1) return;
    const mapWidth = $gameMap.width();
    const mapHeight = $gameMap.height();
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        if ($gameMap.regionId(x, y) != regionId) continue;
        $gameMap.spawnEvent(sourceEventId, x, y, true);
        const event = $gameMap.event($gameMap.getLastSpawnEventId());
        event.setDirection(DIRECTION_BY_STANDING_REGION_ID[regionId]);//2,4,6,8
      }
    };
  };
  if (!$gameSwitches.value(15)) {    //夜に勝手に作成されるので、スクリプト夜生成禁止にする
    for (const regionId of [24, 25, 26, 27]) {
      spawnStandingNpc(111, regionId);//立ちNPC
    };
  };
  if ($gameSwitches.value(15)) {
    for (const regionId of [41, 42, 43, 44]) {
      spawnStandingNpc(191, regionId);//立ちNPC
    };
  };
  //食べ物全日。npc配置で湯気
  const FOOD_EVENT_ID_BY_REGION_ID = { 21: 118, 22: 121, 23: 120 };
  let nightBanActive = true;
  for (const regionId of [21, 22, 23]) {
    if (regionId == 22 && $gameSwitches.value(15)) { nightBanActive = false };
    if (!nightBanActive) continue;
    if (regionEventCounts[regionId] < 1) continue;
    const sourceEventId = FOOD_EVENT_ID_BY_REGION_ID[regionId];
    const mapWidth = $gameMap.width();
    const mapHeight = $gameMap.height();
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        if ($gameMap.regionId(x, y) != regionId) continue;
        $gameMap.spawnEvent(sourceEventId, x, y, true);
      }
    };
  };
  const canopyBedEventId = 213;//天蓋つきベッド
  const canopyBedRegionId = 96;
  if (regionEventCounts[canopyBedRegionId] >= 1) {
    const mapWidth = $gameMap.width();
    const mapHeight = $gameMap.height();
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        if ($gameMap.regionId(x, y) != canopyBedRegionId) continue;
        $gameMap.spawnEvent(canopyBedEventId, x, y, true);
        $gameMap.spawnEvent(canopyBedEventId + 1, x, y, true);
        $gameMap.spawnEvent(canopyBedEventId + 2, x, y, true);
      }
    };
  };
};

//ADVパート演出
// PERF: the clear-list was rebuilt as an array literal on every call; it is
// read-only, so it is hoisted to module scope.
const advPartDirectClearNames = ['gloom_sp', 'glitter_sp', 'hearts_sp', 'questions_sp', 'feather_sp', 'ether_sp', 'lines_sp', 'direct_screenRing',
  'direct_screenDiffusion1', 'text_dispray1', 'direct_screenRing', 'direct_screenDiffusion2', 'direct_screenDiffusion3',
  'direct_screenSquare'];
adv_partDirectPlay = function (effectTypeId) {

  const particle = $gameScreen._particle;

  switch (effectTypeId) {
    case 0: {//クリア
      if ($gameScreen._tone_temp != 0) {
        $gameScreen.startTint($gameScreen._tone_temp, 10);
        $gameScreen._tone_temp = 0;
      };
      for (const particleName of advPartDirectClearNames) {
        particle.particleClear(particleName);
      };
      break;
    }
    case 1: {//どんより
      const particleName = 'gloom_sp';
      const seName = "Down3";
      AudioManager.playSe({ "name": seName, "volume": 90, "pitch": 70, "pan": 0 });
      $gameScreen.startFlash([0, 0, 0, 200], 120);
      particle.particlePlay(0, particleName, 'screen', 'def', 'screen');
      break;
    }
    case 2: {
      const particleName = 'glitter_sp';
      $gameScreen.startFlash([255, 255, 255, 200], 120);
      const seName = "Up3";
      AudioManager.playSe({ "name": seName, "volume": 90, "pitch": 100, "pan": 0 });
      particle.particlePlay(0, particleName, 'screen', 'def', 'screen');
      break;
    }
    case 3: {
      const particleName = 'hearts_sp';
      $gameScreen.startFlash([255, 119, 255, 200], 120);
      const meName = "11_Sexy";
      AudioManager.playMe({ "name": meName, "volume": 90, "pitch": 150, "pan": 0 });
      particle.particlePlay(0, particleName, 'screen', 'def', 'screen');
      break;
    }
    case 4: {
      const particleName = 'questions_sp';
      $gameScreen.startFlash([255, 255, 255, 200], 120);
      const seName = "Saint1";
      AudioManager.playSe({ "name": seName, "volume": 90, "pitch": 70, "pan": 0 });
      particle.particlePlay(0, particleName, 'screen', 'def', 'screen');
      break;
    }
    case 5: {
      const particleName = 'feather_sp';
      const seName = "Z11_RareTreasureBox";
      AudioManager.playSe({ "name": seName, "volume": 60, "pitch": 100, "pan": 0 });
      particle.particlePlay(0, particleName, 'screen', 'def', 'screen');
      break;
    }
    case 6: {//戦闘敗北時
      const particleName = 'ether_sp';
      const seName = "Z_Summoning";
      AudioManager.playSe({ "name": seName, "volume": 60, "pitch": 120, "pan": 0 });
      particle.particlePlay(0, particleName, 'screen', 'def', 'spriteset');
      const tickerText = `拠点に強制帰還されます…。`;
      TickerManager.show(tickerText);
      break;
    }
    case 7: {//集中線
      const particleName = 'lines_sp';
      $gameScreen.startFlash([255, 255, 255, 200], 120);
      const seName = "Wind1";
      AudioManager.playSe({ "name": seName, "volume": 90, "pitch": 120, "pan": 0 });
      particle.particlePlay(0, particleName, 'screen', 'def', 'screen');
      break;
    }
    case 8: {//宝箱レア演出。元コモンで色調変更
      $gameScreen.startFlash([255, 255, 255, 200], 30);
      if ($gameScreen._tone_temp == 0) {
        $gameScreen._tone_temp = $gameScreen.tone().concat();
        $gameScreen.startTint([-100, -100, -100, 150], 10);
      };
      picture_motion1("smooth", [0]);
      let pictureId = 100;//文字ピクチャ。元コモンで実行している。
      $gameScreen.showPicture(pictureId, "", 1, 640 + 200, 384, 100, 100, 0, 0);
      $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 100, 255, 0, 60);
      pictureId = 99;
      const titlePictureName = 'ScreenCenterTextDisPray';
      $gameScreen.showPicture(pictureId, titlePictureName, 1, 640 + 200, 384, 100, 0, 0, 0);
      $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 50, 200, 0, 60);
      particle.particlePlay(0, 'direct_screenRing', 'screen', 'def', 'screen');
      particle.particlePlay(0, 'direct_screenDiffusion1', 'screen', 'def', 'screen');
      break;
    }
    case 9: {//仲間加入
      $gameScreen.startFlash([255, 255, 255, 200], 30);
      if ($gameScreen._tone_temp == 0) {
        $gameScreen._tone_temp = $gameScreen.tone().concat();
        $gameScreen.startTint([-100, -100, -100, 150], 10);
      };
      picture_motion1("smooth", [0]);
      let pictureId = 99;
      const titlePictureName = 'ScreenCenterTextDisPray';
      $gameScreen.showPicture(pictureId, titlePictureName, 1, 640 + 200, 384, 100, 0, 0, 0);
      $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 50, 200, 0, 30);
      const particleName = 'text_dispray1';//仲間加入
      particle.particleSet(0, particleName, 'screen', 'def', 'screen');
      particle.particleUpdate([particleName, 'pos', -600, 20]);
      if ($dataActors[$gameVariables.value(20)] && $dataActors[$gameVariables.value(20)].meta['NpcChara']) {
        particle.particleUpdate([particleName, 'color', '#e59fff', '#6d80ff']);
      };
      const actorName = `\\V[53]\\V[49]`;
      const joinMessageText = `${actorName}がパーティに加わった！`;
      $gameScreen.setDTextPicture(joinMessageText, 28);
      pictureId = 100;
      $gameScreen.showPicture(pictureId, "", 1, 640, 384, 100, 100, 0, 0);
      const joinActor = $gameActors.actor($gameVariables.value(20));
      if (!!joinActor && isGirl(joinActor)) {
        $gameScreen.movePicture(pictureId, 1, 640 - 200, 384, 100, 100, 255, 0, 30);
      } else {
        $gameScreen.movePicture(pictureId, 1, 640 - 50, 384, 100, 100, 255, 0, 30);
      };
      const facePictureCandidates = [2, 6];
      valueFaceSelect = facePictureCandidates[getRandomIndex(facePictureCandidates.length)];
      $gameSwitches.setValue(436, true);
      battle_bustUp(101, 550, 0, 40);
      $gameSwitches.setValue(436, false);
      break;
    }
    case 10: {//ワープポイントアクティベート
      const seName = "Item4";
      AudioManager.playSe({ "name": seName, "volume": 50, "pitch": 50, "pan": 0 });
      $gameScreen.startFlash([255, 255, 255, 200], 30);
      if ($gameScreen._tone_temp == 0) {
        $gameScreen._tone_temp = $gameScreen.tone().concat();
        $gameScreen.startTint([-100, -100, -100, 150], 10);
      };
      picture_motion1("smooth", [0]);
      let pictureId = 100;//文字ピクチャ。。元コモンで実行している。
      $gameScreen.showPicture(pictureId, "", 1, 640, 384, 100, 100, 0, 0);
      $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 100, 255, 0, 60);
      pictureId = 99;
      const titlePictureName = 'ScreenCenterTextDisPray';
      $gameScreen.showPicture(pictureId, titlePictureName, 1, 640 + 200, 384, 100, 0, 0, 0);
      $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 50, 200, 0, 60);
      particle.particlePlay(0, 'direct_screenRing', 'screen', 'def', 'screen');
      particle.particlePlay(0, 'direct_screenDiffusion2', 'screen', 'def', 'screen');
      break;
    }
    case 11: {//拠点アクティベート
      const seName = "Item4";
      AudioManager.playSe({ "name": seName, "volume": 50, "pitch": 50, "pan": 0 });
      $gameScreen.startFlash([255, 255, 255, 200], 30);
      if ($gameScreen._tone_temp == 0) {
        $gameScreen._tone_temp = $gameScreen.tone().concat();
        $gameScreen.startTint([-100, -100, -100, 150], 10);
      };
      picture_motion1("smooth", [0]);
      let pictureId = 100;//文字ピクチャ。。元コモンで実行している。
      $gameScreen.showPicture(pictureId, "", 1, 640, 384, 100, 100, 0, 0);
      $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 100, 255, 0, 60);
      pictureId = 99;
      const titlePictureName = 'ScreenCenterTextDisPray';
      $gameScreen.showPicture(pictureId, titlePictureName, 1, 640 + 200, 384, 100, 0, 0, 0);
      $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 50, 200, 0, 60);
      particle.particlePlay(0, 'direct_screenRing', 'screen', 'def', 'screen');
      particle.particlePlay(0, 'direct_screenDiffusion3', 'screen', 'def', 'screen');
      break;
    }
    case 12: {//夜シーン強制
      picture_motion1("smooth", [0]);
      particle.particlePlay(0, 'direct_screenSquare', 'screen', 'def', 'screen');
      $gameScreen.setDTextPicture(`イベント自動発生`, 28);
      $gameScreen.dWindowFrame = 'ON';
      let pictureId = 100;
      $gameScreen.showPicture(pictureId, "", 1, 640 + 50, 384, 100, 100, 0, 0);
      $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 100, 255, 0, 20);
      break;
    }
    case 13: {//シーンタイトル通知
      picture_motion1("smooth", [0]);
      let pictureId = 102;
      const titlePictureName = 'ScreenCenterTextDisPrayTitle';
      $gameScreen.showPicture(pictureId, titlePictureName, 1, 640 - 100, 384 - 200, 100, 80, 0, 0);
      $gameScreen.movePicture(pictureId, 1, 640, 384 - 200, 100, 80, 200, 0, 30);
      const particleName = 'text_dispray1';
      particle.particlePlay(0, particleName, 'screen', 'def', 'screen');
      particle.particleUpdate([particleName, 'pos', -700, -200]);
      const titleText = `──\\V[142]──`;
      if ($gameVariables.value(535) >= 1) {
        $gameScreen.setDTextPicture(`\\f[b]\\C[13]${titleText}\\C[0]`, 28);
      } else {
        $gameScreen.setDTextPicture(`\\f[b]\\C[16]${titleText}\\C[0]`, 28);
      };
      pictureId = 103;
      $gameScreen.showPicture(pictureId, "", 0, 10, 170, 0, 100, 0, 0);
      $gameScreen.movePicture(pictureId, 0, 50, 170, 100, 100, 255, 0, 30);
      break;
    }
    case 14:
    case 15:
    case 16: {//アイテムスキル称号獲得忘却。Ｈ通常どちらも。
      const actorId = $gameVariables.value(20);
      const dbEntryId = $gameVariables.value(19);
      const actor = $gameActors.actor(actorId);
      if (effectTypeId == 14) { valueItems = $dataItems };
      if (effectTypeId == 15 || effectTypeId == 16) { valueItems = $dataSkills };
      let hModeLevel;
      if (effectTypeId == 14) {
        hModeLevel = Number(valueItems[dbEntryId].meta['EICSwitch']) == 104 ? 1 : 2;//通常
      } else {
        hModeLevel = valueItems[dbEntryId].stypeId == 14 || valueItems[dbEntryId].stypeId == 15 ? 2 : 1;//Hスキル
      };
      if (hModeLevel == 1) {//通常
        AudioManager.playMe({ "name": "21_SkillLearn", "volume": 60, "pitch": 100, "pan": 0 });
        $gameScreen.startFlash([255, 255, 255, 200], 30);
        $gameVariables.setValue(22, 300);
      } else {
        AudioManager.playSe({ "name": "ZH_Sexy", "volume": 45, "pitch": 100, "pan": 0 });
        $gameScreen.startFlash([255, 119, 255, 204], 30);
        $gameVariables.setValue(22, 242);
      };
      if ($gameScreen._tone_temp == 0) {
        $gameScreen._tone_temp = $gameScreen.tone().concat();
        $gameScreen.startTint([-100, -100, -100, 150], 10);
      };
      picture_motion1("smooth", [0]);
      let pictureId = 51;
      const titlePictureName = 'ScreenCenterTextDisPrayOneRow';
      $gameScreen.showPicture(pictureId, titlePictureName, 1, 640 + 200, 384, 100, 0, 0, 0);
      $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 100, 250, 0, 60);
      const particleName = 'direct_screenRing';
      particle.particleSet(0, particleName, 'screen', 'def', 'screen');
      if (hModeLevel == 1) {
        particle.particleUpdate([particleName, 'color', '#8fceff', '#ffffff']);//通常
      } else {
        particle.particleUpdate([particleName, 'color', '#dc7dff', '#ffffff']);//H関係
      };
      let diffusionParticleName;
      if (hModeLevel == 1) {
        diffusionParticleName = 'direct_screenDiffusion2';
      } else {
        diffusionParticleName = 'direct_screenDiffusionH';
      };
      particle.particleSet(0, diffusionParticleName, 'screen', 'def', 'screen');
      if (hModeLevel == 1) {
        particle.particleUpdate([diffusionParticleName, 'color', '#8fceff', '#ffffff']);//通常
      };
      const itemName = colorTaggedText(2, `\x1bIIN[${dbEntryId}]`);
      let messageText;
      if (effectTypeId == 14) {
		const prefix = colorTaggedText(16, `称号`);
		const name = `${title}＜${itemName}＞`;
        messageText = `${name}獲得！`;
      } else if (effectTypeId == 15) {
		const title = colorTaggedText(16, $dataSystem.skillTypes[valueItems[dbEntryId].stypeId]);
		const name = `${title}＜${itemName}＞`;
        messageText = `${name}獲得！`;
      } else {
		const title = colorTaggedText(16, $dataSystem.skillTypes[valueItems[dbEntryId].stypeId]);
		const name = `${title}＜${itemName}＞`;
        messageText = `${name}忘却…`;
      };
      $gameScreen.setDTextPicture(messageText, 28);
      pictureId = 60;
      $gameScreen.showPicture(pictureId, "", 1, 640, 384, 100, 100, 0, 0);
      $gameScreen.movePicture(pictureId, 1, 640 - 100, 384, 100, 100, 255, 0, 60);
      if (!$gameSwitches.value(29)) {
        if (effectTypeId == 14) { $gameParty.gainItem(valueItems[dbEntryId], 1) };
        if (effectTypeId == 15 && !!actor) { actor.learnSkill(dbEntryId) };
        if (effectTypeId == 16 && !!actor) { actor.forgetSkill(dbEntryId) };
      };
      let facePictureCandidates;
      if (hModeLevel == 1) {//通常
        facePictureCandidates = [2, 6];
        if (actorId == 1) { facePictureCandidates.push(53) };
      } else {
        if (!!actor && actor.isLearnedSkill(65)) {
          facePictureCandidates = [27, 28, 29, 30, 31, 32, 39, 40, 41];
        } else {
          facePictureCandidates = [21, 22, 23, 24, 25];
        };
      };
      valueFaceSelect = facePictureCandidates[getRandomIndex(facePictureCandidates.length)];
      $gameSwitches.setValue(436, true);
      battle_bustUp(52, 550, 0, 120);
      $gameSwitches.setValue(436, false);
      valueWordSet0 = `解説文` + `:` + `\n${valueItems[dbEntryId].description}`;
      break;
    }
    case 17: {//汎用演出。valueWordSet0に文章入れておく。
      //console.log(`顔グラピクID変更の為にピクID変更の必要ありamygameParticle787行`);
      const actor = $gameActors.actor($gameVariables.value(20));
      $gameScreen.startFlash([255, 255, 255, 200], 30);
      if ($gameScreen._tone_temp == 0) {
        $gameScreen._tone_temp = $gameScreen.tone().concat();
        $gameScreen.startTint([-100, -100, -100, 150], 10);
      };
      picture_motion1("smooth", [0]);
      let pictureId = 51;
      const titlePictureName = 'ScreenCenterTextDisPrayOneRow';
      let textScale = 100;
      if (valueWordSet0.match(/\n/)) {
        textScale = textScale * (valueWordSet0.split('\n').length);
      };
      $gameScreen.showPicture(pictureId, titlePictureName, 1, 640 + 200, 384, 100, 0, 0, 0);
      $gameScreen.movePicture(pictureId, 1, 640, 384, 100, textScale, 250, 0, 60);
      particle.particleSet(0, 'direct_screenRing', 'screen', 'def', 'screen');
      particle.particleUpdate(['direct_screenRing', 'color', '#007bff', '#f7ff76']);
      particle.particleSet(0, 'direct_screenDiffusion2', 'screen', 'def', 'screen');
      particle.particleUpdate(['direct_screenDiffusion2', 'color', '#007bff', '#f7ff76']);
      $gameScreen.setDTextPicture(valueWordSet0, 28);
      pictureId = 60;
      $gameScreen.showPicture(pictureId, "", 1, 640, 384, 100, 100, 0, 0);
      $gameScreen.movePicture(pictureId, 1, 640 - 200, 384, 100, 100, 255, 0, 60);
      const facePictureCandidates = [2, 6];
      if ($gameVariables.value(20) == 1) { facePictureCandidates.push(53) };//りしゃぶる。リーシャ。ドヤ顔
      valueFaceSelect = facePictureCandidates[getRandomIndex(facePictureCandidates.length)];
      $gameSwitches.setValue(436, true);
      battle_bustUp(52, 550, 0, 120);
      $gameSwitches.setValue(436, false);
      break;
    }
    case 18: {//汎用演出顔グラなし。valueWordSet0に文章入れておく。
      $gameScreen.startFlash([255, 255, 255, 200], 30);
      if ($gameScreen._tone_temp == 0) {
        $gameScreen._tone_temp = $gameScreen.tone().concat();
        $gameScreen.startTint([-100, -100, -100, 150], 10);
      };
      picture_motion1("smooth", [0]);
      let pictureId = 51;
      const titlePictureName = 'ScreenCenterTextDisPrayOneRow';
      let textScale = 100;
      if (valueWordSet0.match(/\n/)) {
        textScale = textScale * (valueWordSet0.split('\n').length);
      };
      $gameScreen.showPicture(pictureId, titlePictureName, 1, 640 + 200, 384, 100, 0, 0, 0);
      $gameScreen.movePicture(pictureId, 1, 640, 384, 100, textScale, 250, 0, 60);
      particle.particleSet(0, 'direct_screenRing', 'screen', 'def', 'screen');
      particle.particleUpdate(['direct_screenRing', 'color', '#007bff', '#f7ff76']);
      particle.particleUpdate(['direct_screenRing', 'colorMode', '0']);
      particle.particleSet(0, 'direct_screenDiffusion2', 'screen', 'def', 'screen');
      particle.particleUpdate(['direct_screenDiffusion2', 'color', '#007bff', '#f7ff76']);
      particle.particleUpdate(['direct_screenDiffusion2', 'colorMode', '0']);
      $gameScreen.setDTextPicture(valueWordSet0, 28);
      pictureId = 60;
      $gameScreen.showPicture(pictureId, "", 1, 640, 384, 100, 100, 0, 0);
      $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 100, 255, 0, 60);
      break;
    }
    case 19: {//汎用2行まで演出顔グラなしH。valueWordSet0に文章入れておく。
      //hSkill_rankUpWordDirect(1,1,671,1);で使用
      const voicePitch = getRandomIndex(51) + 100;
      AudioManager.playSe({ "name": 'ZH_SexyVoice', "volume": 50, "pitch": voicePitch, "pan": 0 });
      $gameScreen.startFlash([255, 119, 255, 200], 60);
      if ($gameScreen._tone_temp == 0) {
        $gameScreen._tone_temp = $gameScreen.tone().concat();
        $gameScreen.startTint([-100, -100, -100, 150], 10);
      };
      picture_motion1("smooth", [0]);
      let pictureId = 108;
      const backPictureName = 'ScreenWordBackH';
      let backOpacity = 50;
      const actor = $gameActors.actor($gameVariables.value(2));
      if (actor.isLearnedSkill(63)) { backOpacity = 100 };
      if (actor.isLearnedSkill(65)) { backOpacity = 150 };
      if (actor.isLearnedSkill(68)) { backOpacity = 200 };
      $gameScreen.showPicture(pictureId, backPictureName, 1, 640, 384, 100, 100, backOpacity, 0);
      picture_fade1(pictureId, "fadeIn", 'Hscene005', 120, 5);
      pictureId = 109;
      const titlePictureName = 'ScreenCenterTextDisPrayOneRow';
      let textScale = 100;
      if (valueWordSet0.match(/\n/)) {
        textScale = textScale * (valueWordSet0.split('\n').length);
      };
      $gameScreen.showPicture(pictureId, titlePictureName, 1, 640 + 200, 384, 100, 0, 0, 0);
      $gameScreen.movePicture(pictureId, 1, 640, 384, 100, textScale, 250, 0, 60);
      particle.particleSet(0, 'direct_screenRing', 'screen', 'def', 'screen');
      particle.particleUpdate(['direct_screenRing', 'color', '#dc7dff', '#ffffff']);
      particle.particleSet(0, 'direct_screenDiffusion2', 'screen', 'def', 'screen');
      particle.particleUpdate(['direct_screenDiffusion2', 'color', '#dc7dff', '#ffffff']);
      $gameScreen.setDTextPicture(valueWordSet0, 28);
      pictureId = 110;
      $gameScreen.showPicture(pictureId, "", 1, 640, 384, 100, 100, 0, 0);
      $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 100, 255, 0, 60);
      break;
    }
    case 20: {//睡眠誘導光
      const particleName = 'ether_sp';
      particle.particlePlay(0, particleName, 'screen', 'def', 'screen');
      particle.particleUpdate([particleName, 'color', '#dd00ff', '#86e3ff']);
      particle.particleUpdate([particleName, 'emitterLifetime', '3']);
      particle.particleUpdate([particleName, 'frequency', '0.01']);
      $gameScreen.startFlash([255, 119, 255, 200], 60);
      const seName = "Saint2";
      const sePitch = getRandomIndex(26) + 50;
      AudioManager.playSe({ "name": seName, "volume": 90, "pitch": sePitch, "pan": 0 });
      break;
    }
    case 21: {//眠気の兆候
      const particleName = 'bubble_w';
      particle.particlePlay(0, particleName, 'screen', 'def', 'screen');
      particle.particleUpdate([particleName, 'color', '#ff00e9', '#86e3ff']);
      particle.particleUpdate([particleName, 'frequency', '0.05']);
      particle.particleUpdate([particleName, 'emitterLifetime', '3']);
      particle.particleUpdate([particleName, 'fluctuation', '45', '0.5']);
      particle.particleUpdate([particleName, 'scale', '0', '0.3@0.2', '2@0.95', '0.8']);
      particle.particleUpdate([particleName, 'lifetime', '5', '7']);
      particle.particleUpdate([particleName, 'blendMode', '0']);
      $gameScreen.startFlash([85, 200, 255, 200], 60);
      const seName = "Saint1";
      const sePitch = getRandomIndex(26) + 50;
      AudioManager.playSe({ "name": seName, "volume": 90, "pitch": sePitch, "pan": 0 });
      break;
    }
    case 22: {
      const seName = "Magic2";
      AudioManager.playSe({ "name": seName, "volume": 100, "pitch": 70, "pan": 0 });
      $gameScreen.startFlash([136, 0, 0, 150], 60);
      particle.particlePlay(0, 'htext_dispray1', 'screen', 'def', 'screen');
      particle.particlePlay(0, 'htext_dispray2', 'screen', 'def', 'screen');
      break;
    }
    case 23: {//催眠掛かる
      $gameScreen.startFlash([255, 119, 255, 204], 60);
      const seName = "Saint1";
      AudioManager.playSe({ "name": seName, "volume": 100, "pitch": 130, "pan": 0 });
      $gameScreen.startFlash([136, 0, 0, 150], 60);
      const particleName = 'explode_cp_4';
      particle.particlePlay(0, particleName, 'screen', 'def', 'spriteset');
      particle.particleUpdate([particleName, 'color', '#242fff', '#f1ff59']);
      particle.particleUpdate([particleName, 'scale', '1', '0.7']);
      particle.particleUpdate([particleName, 'particlesPerWave', '10']);
      particle.particleUpdate([particleName, 'ring', 0, 0, 1280, 0]);
      filter_direct(10, 360, 10, 60);
      break;
    }
  }

};

//ADVパート演出クリアも。0でクリア
adv_partDirectSet = function (effectTypeId) {

  const particle = $gameScreen._particle;
  if (effectTypeId != 0 && effectTypeId != 6 && effectTypeId != 9 && $gameScreen._tone_temp == 0) {
    $gameScreen._tone_temp = $gameScreen.tone().concat();
    $gameScreen.startTint([-100, -100, -100, 100], 10);//他より薄くしている
  };
  switch (effectTypeId) {
    case 0: {//クリア
      if ($gameScreen._tone_temp != 0) {
        $gameScreen.startTint($gameScreen._tone_temp, 10);
        $gameScreen._tone_temp = 0;
      };
      const particleNamesToClear = ['lines_width1', 'lines_width2', 'lines_width3', 'lines_width4', 'lines_height1', 'lines_height2', 'lines_height3', 'lines_height4',
      'lines_heightSB', 'lines_heightS', 'lines_sp1', 'shower_event', 'cloud_w_front', 'actor_particleLight', 'enemy_particleDark', 'cloud_w',
      'hologram_screen', 'lifeStorm_screen'];
      for (const particleName of particleNamesToClear) {
        particle.particleClear(particleName);
      };
      break;
    }
    case 1: {
      particle.particleSet(0, 'lines_width1', 'screen', 'def', 'above');
      particle.particleSet(0, 'lines_width4', 'screen', 'def', 'screen');
      particle.particleSet(0, 'lines_width2', 'screen', 'def', 'screen');
      particle.particleSet(0, 'lines_width3', 'screen', 'def', 'spriteset');
      break;
    }
    case 2: {
      particle.particleSet(0, 'lines_height1', 'screen', 'def', 'spriteset');
      particle.particleSet(0, 'lines_height4', 'screen', 'def', 'spriteset');
      particle.particleSet(0, 'lines_height2', 'screen', 'def', 'spriteset');
      particle.particleSet(0, 'lines_height3', 'screen', 'def', 'spriteset');
      break;
    }
    case 3: {//下から粒子
      particle.particleSet(0, 'lines_heightSB', 'screen', 'def', 'spriteset');//下から粒子
      particle.particleSet(0, 'lines_heightS', 'screen', 'def', 'spriteset');//下から粒子
      break;
    }
    case 4: {//集中線永続
      const particleName = 'lines_sp1';//集中線永続
      $gameScreen.startFlash([255, 255, 255, 200], 120);
      const seName = "Wind1";
      AudioManager.playSe({ "name": seName, "volume": 90, "pitch": 120, "pan": 0 });
      particle.particleSet(0, particleName, 'screen', 'def', 'spriteset');
      break;
    }
    case 5: {//シャワー
      const particleName = 'shower_event';//シャワー
      const seName = "z_Shower";
      AudioManager.playSe({ "name": seName, "volume": 90, "pitch": 120, "pan": 0 });
      particle.particleSet(0, particleName, 'screen', 'def', 'spriteset');
      break;
    }
    case 6: {
      particle.particleSet(0, 'cloud_w_front', 'weather', 'def', 'spriteset');
      break;
    }
    case 7: {
      $gameScreen.startFlash([255, 255, 255, 200], 120);
      const seName = "Up1";
      AudioManager.playSe({ "name": seName, "volume": 90, "pitch": 110, "pan": 0 });
      const particleName = 'actor_particleLight';
      particle.particleSet(0, particleName, 'weather', 'def', 'spriteset');
      particle.particleUpdate([particleName, 'rect', -700, 400, 1300, 768]);
      break;
    }
    case 8: {
      $gameScreen.startFlash([0, 0, 0, 200], 120);
      const seName = "Down4";
      AudioManager.playSe({ "name": seName, "volume": 90, "pitch": 90, "pan": 0 });
      const particleName = 'enemy_particleDark';
      particle.particleSet(0, particleName, 'weather', 'def', 'spriteset');
      particle.particleUpdate([particleName, 'rect', -700, 400, 1300, 768]);
      break;
    }
    case 9: {//天候:雲
      particle.particleSet(0, 'cloud_w', 'weather', 'def', 'spriteset');//天候:雲
      break;
    }
    case 10: {//生命の嵐
      particle.particleSet(0, 'hologram_screen', 'screen', 'def', 'spriteset');
      particle.particleSet(0, 'lifeStorm_screen', 'screen', 'def', 'spriteset');
      break;
    }
  }

};

//フィルター演出filter_direct(1,640,384,0.01);//種類.x軸,y軸,強さ
filter_direct = function (filterTypeId, xValue, yValue, strengthValue) {//0消去1絶頂2洗脳3グニャ～4oldfilm5ノイズ発生6ノイズ濃さ7ぼかし/8ぼかし濃さ/10グリッチｳｪｲﾄのみ

  const FLASH_DURATION_BY_STRENGTH = { 0.02: 180, 0.03: 150, 0.04: 120, 0.05: 90 };

  switch (filterTypeId) {
    case 0: {//消去
      const filterNamesToClear = ['zettyou', 'brainwashing', 'sepia', 'gunya1', 'noise1', 'bokasi', 'dokun'];
      for (const filterName of filterNamesToClear) {
        $gameMap.eraseFilter(filterName);
      };
      break;
    }
    case 1: {//絶頂
      $gameScreen.startFlash([255, 119, 255, 204], 60);
      const filterName = 'zettyou';
      $gameMap.createFilter(filterName, 'shockwave', 0, 'screen');
      $gameMap.setFilter(filterName, [xValue, yValue, -1, 50, 200, 1.3]);
      $gameMap.setFilterAddiTime(filterName, strengthValue);
      $gameMap.eraseFilterAfterMove(filterName);
      break;
    }
    case 2: {//洗脳
      $gameScreen.startFlash([255, 119, 255, 204], FLASH_DURATION_BY_STRENGTH[strengthValue] || 180);
      const filterName = 'brainwashing';
      $gameMap.createFilter(filterName, 'shockwave', 0, 'screen');
      let seParams;
      let sePitch;
      if (strengthValue >= 0.04) {
        $gameMap.setFilter(filterName, [xValue, yValue, -1, 200, 300, 1]);
        seParams = ['ZH_sticky2', 100, 100];
        sePitch = getRandomIndex(26) + Number(seParams[2]);
        $gameScreen.startShake(7, 7, 60);
      } else {
        $gameMap.setFilter(filterName, [xValue, yValue, -1, 30, 160, 1]);
        seParams = ['Saint1', 75, 50];
        sePitch = getRandomIndex(26) + Number(seParams[2]);
      };
      AudioManager.playSe({ "name": seParams[0], "volume": Number(seParams[1]), "pitch": sePitch, "pan": 0 });
      $gameMap.setFilterAddiTime(filterName, strengthValue);
      break;
    }
    case 3: {//グニャ～
      AudioManager.playSe({ "name": "Z_BlackOut", "volume": 80, "pitch": 50, "pan": 0 });
      const filterName = 'gunya1';
      $gameMap.createFilter(filterName, 'twist', 0, 'screen');
      $gameMap.setFilter(filterName, [xValue, yValue, 0, 0]);
      for (const twistOffset of [2, 4, 6, 8, 10]) {
        $gameMap.moveFilterQueue(filterName, [xValue, yValue, 1280, twistOffset], twistOffset == 10 ? 800 : 180);
      };
      break;
    }
    case 4: {//oldfilm
      const filterName = 'sepia';
      $gameMap.createFilter(filterName, 'oldfilm', 0, 'screen');
      break;
    }
    case 5: {//ノイズ発生
      const filterName = 'noise1';
      $gameMap.createFilter(filterName, 'noise', 0, 'screen');
      $gameMap.setFilter(filterName, [xValue]);
      break;
    }
    case 6: {//ノイズ濃さ
      //変更: 旧来はeffectName10が未定義のまま渡されていた
      $gameMap.moveFilterQueue('noise1', [xValue], yValue);
      break;
    }
    case 7: {//ぼかし
      const filterName = 'bokasi';
      $gameMap.createFilter(filterName, 'blur', 0, 'screen');
      $gameMap.setFilter(filterName, [xValue]);
      break;
    }
    case 8: {//ぼかし濃さ
      //変更: 旧来はeffectName10が未定義のまま渡されていた
      $gameMap.moveFilterQueue('bokasi', [xValue], yValue);
      break;
    }
    case 9: {//
      const filterName = 'dokun';
      $gameMap.createFilter(filterName, 'zoomblur', 0, 'screen');
      $gameMap.setFilter(filterName, [xValue, yValue, 0, 0.5]);
      $gameMap.moveFilterQueue(filterName, [xValue, yValue, 0, 0], strengthValue);
      $gameMap.eraseFilterAfterMove(filterName);
      let sePitch = 100;
      if (strengthValue <= 10) { sePitch = 150 } else if (strengthValue >= 60) { sePitch = 50 } else if (strengthValue >= 40) { sePitch = 80 } else if (strengthValue >= 30) { sePitch = 90 };
      AudioManager.playSe({ "name": 'Z_HeartBeat', "volume": 90, "pitch": sePitch, "pan": 0 });
      $gameScreen.startFlash([255, 255, 255, sePitch], strengthValue);
      break;
    }
    case 10: {//グリッチｳｪｲﾄのみ
      const filterName = 'glitch1';
      const seedValue = 2;//getRandomIndex(11) + 5;
      const offsetValue = xValue == 1000 ? getRandomIndex(360) : xValue;
      const scaleValue = yValue == 1000 ? getRandomIndex(11) : yValue;
      $gameMap.createFilter(filterName, 'glitch', 0, 'screen');
      //$gameMap.setFilter(filterName,[seedValue,100,offsetValue,scaleValue,0]);
      $gameMap.moveFilterQueue(filterName, [seedValue, 100, offsetValue, scaleValue, 0], strengthValue);
      $gameMap.eraseFilterAfterMove(filterName);
      AudioManager.playSe({ "name": "Z_CGDispray", "volume": 20, "pitch": 150, "pan": 0 });
      break;
    }
  }

};

//属性によるパーティクル発生
//パッシブステートID(51-57)と、同一効果を指す省略ID(3-9)の粒子対応
const PARTICLE_NAME_BY_PASSIVE_STATE_ID = {
  3: 'sparks_w2', 51: 'sparks_w2',
  4: 'petal_w', 52: 'petal_w',
  5: 'stardust_w', 53: 'stardust_w',
  6: 'bubble_w', 54: 'bubble_w',
  7: 'diamonddust_w', 55: 'diamonddust_w',
  8: 'black_particle_w', 56: 'black_particle_w',
  9: 'ether_sp', 57: 'ether_sp',
};

element_particleSet = function (elementParticleTypeId, pictureId, passiveStateId, pictureYOffset) {

  const particle = $gameScreen._particle;

  switch (elementParticleTypeId) {
    case 0: {//消去
      picture_fade1(pictureId - 1, "fadeOut", '102', 60, 5);
      picture_fade1(pictureId + 1, "fadeOut", '102', 60, 5);
      const particleNamesToClear = ['sparks_w2', 'petal_w', 'lines_width3', 'stardust_w', 'bubble_w', 'diamonddust_w', 'black_particle_w', 'ether_sp'];
      for (const particleName of particleNamesToClear) {
        particle.particleClear(particleName);
      };
      break;
    }
    case 1: {//ステート対応粒子
      const particleName = PARTICLE_NAME_BY_PASSIVE_STATE_ID[passiveStateId] || 'ether_sp';
      particle.particleSet(0, particleName, 'screen', 'def', 'spriteset');
      break;
    }
    case 2: {//遠景画像
      if (passiveStateId >= 1) {
        const parallaxPath = '/img/parallaxes/Scene_Element_' + passiveStateId;
        $gameScreen.showPicture(pictureId - 1, parallaxPath, 1, 640, 384 + pictureYOffset, 100, 100, 200, 1);
        picture_fade1(pictureId - 1, "fadeIn", '102', 60, 5);
        hcg_piston(pictureId - 1, 7, 1, 2);
        $gameScreen.showPicture(pictureId + 1, parallaxPath, 1, 640, 384 + pictureYOffset, 100, 100, 50, 1);
        picture_fade1(pictureId + 1, "fadeIn", '102', 60, 5);
        hcg_piston(pictureId + 1, 7, 1, 2);
      };
      break;
    }
  }

};

//gabによるパーティクル発生
//gabによるパーティクル発生
gab_wordParticle = function (gabText) {

  AudioManager.playSe({ "name": 'Chime2', "volume": 90, "pitch": 100, "pan": 0 });
  const particleName = 'text_dispray2';
  const particle = $gameScreen._particle;
  particle.particleClear(particleName);
  const scene = SceneManager._scene;
  if (!scene) return;
  if (scene._gabWindow) scene.clearGabWindow();
  particle.particlePlay(0, particleName, 'screen', 'def', 'screen');
  //$gameScreen._particle.particleUpdate([particleName,'pos',-600,-260]);
  particle.particleExceed(particleName, 0.3);
  const gabData = [`　　　${gabText}`, '', 0, 0, '', 0];
  if (scene._gabWindow) scene.startGabWindow(gabData);

};

//Hランク上昇任意hSkill_rankUpWordDirect(1,1,671,1);//1が最初2が文字で0で締め,ｱｸﾀｰ,ｽｷﾙid,ﾗﾝｸｾｯﾄ
hSkill_rankUpWordDirect = function (messageTypeId, actorIdOrMessageText, skillId, masteryLevel) {

  switch (messageTypeId) {
    case 1: {//最初
      const actor = $gameActors.actor(actorIdOrMessageText);
      if (!$gameSwitches.value(29)) { actor.setSkillMasteryLevel(skillId, masteryLevel) };
      const actorName = colorTaggedText(26, actor.name());
      const skillName = colorTaggedText(27, `<\\sin[${skillId}]>`);
      const skillLevel = colorTaggedText(10, `${masteryLevel}`);
      valueWordSet0 = `${actorName}の${skillName}ランクが${skillLevel}になった…。`;
      adv_partDirectPlay(19);
      break;
    }
    case 2: {//文字列
      valueWordSet0 = actorIdOrMessageText;
      adv_partDirectPlay(19);
      break;
    }
    case 0: {//締め
      adv_partDirectPlay(0);
      picture_fade1(108, "fadeOut", 'Hscene005', 120, 5);
      $gameScreen.movePicture(109, 1, 640 - 200, 384, 100, 100, 0, 0, 120);
      $gameScreen.movePicture(110, 1, 640 - 200, 384, 100, 100, 0, 0, 120);
      break;
    }
  }

};

//獲得物の簡易表示get_infoDirect(0,51,0,1);
get_infoDirect = function (databaseTypeId, databaseEntryId, actorId, itemAmount) {

  let seParams = ['Saint5', 75, 50];
  let entryNameText;
  let databaseEntries;
  let actionText;
  //変更: 各caseにbreakを追加（旧来はbreakがなく後続のcaseまで順に実行されていた）
  switch (databaseTypeId) {
    case 0: {//アイテム
      entryNameText = colorTaggedText(2, `＜\x1bIIN[${databaseEntryId}]＞`);
      databaseEntries = $dataItems;
      actionText = itemAmount <= -1 ? `失った…。` : `を入手した！`;
      break;
    }
    case 1: {//武器
      entryNameText = colorTaggedText(2, `＜\x1bWIN[${databaseEntryId}]＞`);
      databaseEntries = $dataWeapons;
      actionText = itemAmount <= -1 ? `失った…。` : `を入手した！`;
      break;
    }
    case 2: {//防具
      entryNameText = colorTaggedText(2, `＜\x1bAIN[${databaseEntryId}]＞`);
      databaseEntries = $dataArmors;
      actionText = itemAmount <= -1 ? `失った…。` : `を入手した！`;
      break;
    }
    case 3: {//スキル
      entryNameText = colorTaggedText(2, `＜\x1bSIN[${databaseEntryId}]＞`);
      databaseEntries = $dataSkills;
      actionText = `獲得した！`;
      break;
    }
    case 4: {//お金
      entryNameText = colorTaggedText(6, `${databaseEntryId.toLocaleString()}\G`);
      databaseEntries = $dataSkills;
      actionText = databaseEntryId <= -1 ? `失った…。` : `入手した！`;
      break;
    }
    case 5: {//クラス
      entryNameText = colorTaggedText(2, `＜\x1bJ[${databaseEntryId}]＞`);
      databaseEntries = $dataClasses;
      actionText = `が解放された！`;
      break;
    }
  }

  if (databaseTypeId == 4) {
    let sePitch = 100;
    if (databaseEntryId >= 10000 && databaseEntryId <= 30000) { sePitch = 90 };
    if (databaseEntryId >= 30001 && databaseEntryId <= 60000) { sePitch = 80 };
    if (databaseEntryId >= 60001 && databaseEntryId <= 100000) { sePitch = 70 };
    if (databaseEntryId >= 100001 && databaseEntryId <= 200000) { sePitch = 60 };
    if (databaseEntryId >= 200001) { sePitch = 50 };
    seParams = ['Shop1', 100, sePitch];
    if (!$gameSwitches.value(29)) { $gameParty.gainGold(databaseEntryId) };
  } else {
    if (!databaseEntries[databaseEntryId]) return;
    const databaseEntry = databaseEntries[databaseEntryId];
    if (databaseEntry.meta['EICSwitch']) {
      switch (Number(databaseEntry.meta['EICSwitch'])) {
        case 104: {
          entryNameText = colorTaggedText(17, `称号`) + `:` + entryNameText;
          break;
        }
        case 105: {
          entryNameText = colorTaggedText(27, `Ｈ称号`) + `:` + entryNameText;
          seParams = ['ZH_Sexy', 50, 150];
          break;
        }
        case 108: {
          entryNameText = colorTaggedText(20, `クエスト`) + `:` + entryNameText;
          break;
        }
      }
    };
    if (databaseTypeId == 3) {
      entryNameText = `${$dataSystem.skillTypes[databaseEntry.stypeId]}:` + entryNameText;
      if (databaseEntry.stypeId == 14 || databaseEntry.stypeId == 15) {
        actionText = `を獲得した………。`;
        seParams = ['ZH_Sexy', 50, 150];
      };
    };
    if (databaseTypeId == 5) {
      let jobTypeText = databaseEntry.meta['Subclass Only'] ? colorTaggedText(17, `サブジョブ`) + ` ` : colorTaggedText(20, `メインジョブ`) + ` `;
      if (databaseEntry.meta['classRank']) {
        //変更: rank2の末尾\C[0]のみ一重バックスラッシュだったのを修正
        const CLASS_RANK_TEXT_BY_LEVEL = {
          1: `Class\\C[10]Ⅰ\\C[0]`,
          2: `Class\\C[10]Ⅱ\\C[0]`,
          3: `Class\\C[10]Ⅲ\\C[0]`,
          4: `Class\\C[10]Ⅳ\\C[0]`,
        };
        jobTypeText += CLASS_RANK_TEXT_BY_LEVEL[Number(databaseEntry.meta['classRank'])] || '';
      };
      entryNameText = `${jobTypeText}:` + entryNameText;
    };
    if (databaseTypeId <= 2) {
      if (!$gameSwitches.value(29)) { $gameParty.gainItem(databaseEntry, itemAmount) };
    };
    if (databaseTypeId == 3) {
      const targetActorId = actorId == 0 ? $gameVariables.value(2) : actorId;
      const actor = $gameActors.actor(targetActorId);
      if (!!actor && !actor.isLearnedSkill(databaseEntryId)) {
        if (!$gameSwitches.value(29)) { actor.learnSkill(databaseEntryId) };
      };
      entryNameText = `\x1bN[${targetActorId}]が` + entryNameText;
    };
    if (databaseTypeId == 5) {
      const targetActorId = actorId == 0 ? $gameVariables.value(2) : actorId;
      const actor = $gameActors.actor(targetActorId);
      if (!!actor && !actor._unlockedClasses.contains(databaseEntryId)) {
        if (!$gameSwitches.value(29)) { actor.unlockClass(databaseEntryId) };
      };
      entryNameText = `\x1bN[${targetActorId}]の` + entryNameText;
    };
  };
  if (databaseTypeId <= 2) {
    entryNameText = entryNameText + `×${itemAmount} `
  };
  TickerManager.show(`　　${entryNameText} ${actionText}`);
  if ($gameSwitches.value(124)) {
    if (databaseTypeId <= 3) {
      const descriptionLines = databaseEntries[databaseEntryId].description.split("\n");
      if (descriptionLines[0] != 0) { TickerManager.show(`　　　` + `解説文` + `:` + `${descriptionLines[0]}`) };
      if (descriptionLines[1] != 0) { TickerManager.show(`　　　${descriptionLines[1]}`) };
    };
  };
  AudioManager.playSe({ "name": seParams[0], "volume": Number(seParams[1]), "pitch": Number(seParams[2]), "pan": 0 });
  if (!$gameParty.inBattle()) {
    if ($gameVariables.value(530) == 0) {
      $gamePlayer.requestAnimation(229);
    } else {
      //変更: 旧来はevent比較(>= 1)が常にfalseで、アニメーション要求が阻止されていた
      const targetEventId = $gameVariables.value(292)[$gameVariables.value(530)];
      if (targetEventId >= 1) {
        const targetEvent = $gameMap.event(targetEventId);
        if (!!targetEvent) { targetEvent.requestAnimation(229) };
      };
    };
  };
  itemGet_afterProcess();
};

//直接的演出指定
direct_staging1 = function (stagingTypeId, valuePic1, scratchValue2, scratchValue3) {

  switch (stagingTypeId) {
    case 1://1絶望的な回想
      pic_1(2, valuePic1, scratchValue2, 0, 100, 255, 60, 1280, 768, scratchValue3, 0);
      $gameScreen.startFlash([255, 255, 255, 170], 60);
      filter_direct(9, 640, 384, 60);
      filter_direct(10, 1000, 1000, 60);
      filter_direct(4, 0, 0, 0);
      filter_direct(5, 0.1, 0, 0);
      break;
    case 2:
      break;
  };

};

//}());