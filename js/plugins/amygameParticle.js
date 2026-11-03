/*:
 * @plugindesc Game-specific particle, weather and presentation helpers (refactored).
 * @author Original game authors; maintenance refactor
 * @help
 * Replace amygameParticle.js with this plugin; never enable both copies.
 * Keep the original plugin order and all dependencies. RPG Maker MV / ES2015.
 * Existing global script calls and shared value* globals are retained.
 * Dependencies: the project's particle, lighting, dynamic-event, filter, audio,
 * text-picture, ticker, class/mastery and picture helper plugins.
 * System.json switch/variable labels are documented beside their IDs below.
 */
(function (global) {
  "use strict";
  const SWITCH = {
    MORNING: 13, // 朝
    DAYTIME: 14, // 昼
    NIGHT: 15, // 夜
    RECOLLECTION_SKIP: 29, // 回想時スキップスイッチ
    DISABLE_MAP_EFFECTS: 46, // マップエフェクトカット
    SHOW_REWARD_DESCRIPTION: 124, // イベント進行時onoff()
    BATTLE_MAP: 201, // 戦闘マップ
    OUTDOORS: 203, // 屋外
    INDOORS: 204, // 屋内
    FIELD: 205, // フィールド
    BASE: 206, // 拠点
    DUNGEON: 207, // ダンジョン
    WORLD_MAP: 209, // 全体マップ
    BRIGHT_AT_NIGHT: 212, // 夜でも明るいマップダンジョン以外
    BRIDGE: 227, // 艦橋
    BUST_UP_DISPLAY: 436 // 文章表示時バストアップ表示onoff
  };
  const VARIABLE = {
    PROTAGONIST_ACTOR_ID: 2, // 真の主人公ＩＤ
    PROCESSED_ENTRY_ID: 19, // アイテム処理時代入変数
    SELECTED_ACTOR_ID: 20, // アクター選択肢代入変数
    GENERAL_RANDOM_2: 22, // 乱数汎用2
    PARALLAX_PREFIX: 197, // 遠景指定変数
    NIGHT_WEATHER: 251, // 夜の特殊天候決定変数
    DAY_WEATHER: 256, // 昼の特殊天候決定変数
    DYNAMIC_EVENT_IDS: 292, // イベント用動的生成ID配列
    BASE_ACTIVATION_RECORDS: 327, // 拠点アクティベート記録配列
    EVENT_SUBJECT_INDEX: 530, // イベント進行時主格キャラ指定変数
    RECOLLECTION_ITEM_ID: 535 // 挿話回想進行時アイテムID指定
  };
  const WEATHER = {
    DARKNESS_ALPHA: 1,
    DARKNESS_SPEED: 2,
    NEON_ALPHA: 3,
    FOG_ALPHA: 4,
    FOG_SCALE: 5,
    FOG_SPEED: 6,
    FOG_SHADOW_ALPHA: 7,
    FOG_SHADOW_SPEED: 8,
    FOG_SHADOW_SCALE: 9,
    FLASH_X: 10,
    FLASH_ALPHA: 11,
    FLASH_SCALE: 12,
    CLOUD_SPEED: 13,
    CLOUD_ALPHA: 14,
    CLOUD_SHADOW_SPEED: 15,
    CLOUD_SHADOW_ALPHA: 16,
    DAPPLED_ALPHA: 17,
    DAPPLED_MIN_SCALE: 18,
    DAPPLED_MAX_SCALE: 19,
    DAPPLED_SPEED: 20,
    FLARE_X: 21,
    FLARE_ALPHA: 22,
    FLARE_SCALE: 23,
    NIGHT_LEAK_ALPHA: 24,
    NIGHT_LEAK_SCALE: 25,
    COLORED_LEAK_ALPHA: 26,
    COLORED_LEAK_SCALE: 27,
    BATTLE_FRONT_FOG_ALPHA: 28,
    BATTLE_FRONT_FOG_SPEED: 29,
    FLOATING_SPEED: 30,
    FLOATING_SPEED_2: 31,
    FLOATING_SPEED_3: 32,
    FLOATING_SPEED_4: 33,
    NIGHT_DARKNESS: 46,
    DUNGEON_DARKNESS: 47,
    NIGHT_SKY_PATTERN: 48,
    DAY_SKY_PATTERN: 49,
    SKY_SCROLL_X: 50
  };

  function saveAndDimScreen(gray) {
    const screen = $gameScreen;
    if (Array.isArray(screen._tone_temp)) return;
    screen._tone_temp = screen.tone().slice();
    screen.startTint([-100, -100, -100, gray], 10);
  }

  function restoreScreenTone() {
    const screen = $gameScreen;
    if (Array.isArray(screen._tone_temp))
      screen.startTint(screen._tone_temp, 10);
    screen._tone_temp = 0;
  }

  function getMessageHeightScale(message) {
    return String(message == null ? "" : message).split("\n").length * 100;
  }

  function withBustUpDisplay(pictureId, x, y, duration) {
    $gameSwitches.setValue(SWITCH.BUST_UP_DISPLAY, true);
    try {
      battle_bustUp(pictureId, x, y, duration);
    } finally {
      $gameSwitches.setValue(SWITCH.BUST_UP_DISPLAY, false);
    }
  }

  function updateCharmMenuParticles(particle, actor) {
    let frequency = 0.1;
    let endColor = "#ffffff";
    for (let skillId = 61; skillId <= 70; skillId++) {
      if (!actor.isLearnedSkill(skillId)) continue;
      frequency = Math.max(0.01, (70 - skillId) / 100);
      if (skillId === 65) endColor = "#ff003b";
    }
    particle.particleUpdate(["menu", "frequency", String(frequency)]);
    particle.particleUpdate(["menu", "color", "#e200ff", endColor]);
  }

  function menu_particleSet() {
    const actor = $gameParty.members()[0];
    if (!actor) return;
    const particle = $gameScreen._particle;
    const subclassId = Number(actor._subclassId);
    const isRomanticSubclass = subclassId === 41 || subclassId === 42;
    const isCharmed = actor.isStateAffected(61);
    const isNight = $gameSwitches.value(SWITCH.NIGHT);
    const preset = isRomanticSubclass
      ? "romantic_mood"
      : isCharmed
        ? "charm_bw2"
        : isNight
          ? "particle_w1"
          : "particle_w";
    particle.particleSet(
      0,
      "menu",
      "Scene_Menu",
      preset,
      isRomanticSubclass ? "below" : "above"
    );
    if (!isRomanticSubclass && isCharmed)
      updateCharmMenuParticles(particle, actor);
    if (
      !isRomanticSubclass &&
      !isCharmed &&
      $gameSwitches.value(SWITCH.BATTLE_MAP)
    ) {
      particle.particleUpdate(["menu", "acceleration", "0", "-20"]);
      particle.particleUpdate(["menu", "color", "#ff77b6", "#fffdb9"]);
    }
    particle.particleExceed("menu", 60);
  }

  //天候設定
  function weather_set() {
    global.valueWeather = Array(51).fill(0);
    const pickFrom = (candidates) =>
      candidates[getRandomIndex(candidates.length)];

    randomizeDarknessAndFog(global.valueWeather, pickFrom);
    randomizeSkyAndDappledLight(global.valueWeather, pickFrom);
    randomizeFlareAndNightParticles(global.valueWeather, pickFrom);
    randomizeDarknessAndSkyPatterns(global.valueWeather);
  }

  function randomizeDarknessAndFog(weatherValues, pickFrom) {
    weatherValues[WEATHER.DARKNESS_ALPHA] = pickFrom([
      0.1, 0.15, 0.2, 0.25, 0.3
    ]); //暗闇の視界制限
    weatherValues[WEATHER.DARKNESS_SPEED] = getRandomIndex(6) + 1;
    weatherValues[WEATHER.NEON_ALPHA] = pickFrom([0.3, 0.4, 0.5]); //六色ネオン
    weatherValues[WEATHER.FOG_ALPHA] = pickFrom([0.02, 0.03, 0.04, 0.05, 0.06]); //薄いフォグ
    weatherValues[WEATHER.FOG_SCALE] = getRandomIndex(6) + 5;
    weatherValues[WEATHER.FOG_SPEED] = getRandomIndex(51) + 50;
    weatherValues[WEATHER.FOG_SHADOW_ALPHA] = pickFrom([
      0.05, 0.06, 0.07, 0.08, 0.09
    ]); //モヤの影
    weatherValues[WEATHER.FOG_SHADOW_SPEED] = getRandomIndex(51) + 50; //速度
    weatherValues[WEATHER.FOG_SHADOW_SCALE] = getRandomIndex(6) + 5; //スケール
  }

  function randomizeSkyAndDappledLight(weatherValues, pickFrom) {
    weatherValues[WEATHER.FLASH_X] = pickFrom([-500, 0, 600]); //全体マップ
    weatherValues[WEATHER.FLASH_ALPHA] = pickFrom([0.25, 0.3, 0.35, 0.4]);
    weatherValues[WEATHER.FLASH_SCALE] = getRandomIndex(5) + 6;
    weatherValues[WEATHER.CLOUD_SPEED] = getRandomIndex(26) + 25; //天候:雲
    weatherValues[WEATHER.CLOUD_ALPHA] = pickFrom([
      0.3, 0.31, 0.32, 0.33, 0.35, 0.35, 0.36, 0.37, 0.38, 0.39, 0.4, 0.45
    ]); //雲透明
    weatherValues[WEATHER.CLOUD_SHADOW_SPEED] = getRandomIndex(76) + 25; //雲の影
    weatherValues[WEATHER.CLOUD_SHADOW_ALPHA] = pickFrom([
      0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4
    ]); //透明度
    weatherValues[WEATHER.DAPPLED_ALPHA] = pickFrom([
      0.1, 0.11, 0.12, 0.13, 0.14, 0.15
    ]); //木漏れ日[weather]
    weatherValues[WEATHER.DAPPLED_MIN_SCALE] = getRandomIndex(8) + 7;
    weatherValues[WEATHER.DAPPLED_MAX_SCALE] = getRandomIndex(10) + 15;
    weatherValues[WEATHER.DAPPLED_SPEED] = getRandomIndex(5) + 0;
  }

  function randomizeFlareAndNightParticles(weatherValues, pickFrom) {
    weatherValues[WEATHER.FLARE_X] = pickFrom([-500, 0, 600]); //太陽光のフレア
    weatherValues[WEATHER.FLARE_ALPHA] = pickFrom([
      0.5, 0.6, 0.7, 0.8, 0.9, 1.0
    ]);
    weatherValues[WEATHER.FLARE_SCALE] = getRandomIndex(3) + 4;
    weatherValues[WEATHER.NIGHT_LEAK_ALPHA] = pickFrom([0.05, 0.06, 0.07]); //淡いライトリーク。夜の街。
    weatherValues[WEATHER.NIGHT_LEAK_SCALE] = getRandomIndex(41) + 10;
    weatherValues[WEATHER.COLORED_LEAK_ALPHA] = pickFrom([
      0.06, 0.07, 0.08, 0.09, 0.05
    ]); //青&緑のライトリーク
    weatherValues[WEATHER.COLORED_LEAK_SCALE] = getRandomIndex(5) + 1;
    weatherValues[WEATHER.BATTLE_FRONT_FOG_ALPHA] = pickFrom([
      0.08, 0.09, 0.1, 0.11, 0.12
    ]); //fog_battle_front
    weatherValues[WEATHER.BATTLE_FRONT_FOG_SPEED] = getRandomIndex(71) + 30;
    const floatingParticleSpeed = getRandomIndex(81) + 20; //particle_w2
    weatherValues[WEATHER.FLOATING_SPEED] = floatingParticleSpeed;
    weatherValues[WEATHER.FLOATING_SPEED_2] = floatingParticleSpeed;
    weatherValues[WEATHER.FLOATING_SPEED_3] = floatingParticleSpeed;
    weatherValues[WEATHER.FLOATING_SPEED_4] = floatingParticleSpeed;
  }

  function randomizeDarknessAndSkyPatterns(weatherValues) {
    weatherValues[WEATHER.NIGHT_DARKNESS] = getRandomIndex(51) + 150;
    weatherValues[WEATHER.DUNGEON_DARKNESS] = getRandomIndex(51) + 100; //ダンジョン暗さ
    weatherValues[WEATHER.NIGHT_SKY_PATTERN] = [1, 2, 3, 4, 5, 6][
      getRandomIndex(6)
    ]; //空夜パターン
    weatherValues[WEATHER.DAY_SKY_PATTERN] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10][
      getRandomIndex(10)
    ]; //空パターン
    weatherValues[WEATHER.SKY_SCROLL_X] = [-1, -2, -3, -4, -5][
      getRandomIndex(5)
    ]; //xスクロール
  }
  function getMapDarkness(mapMeta, isNight) {
    let darknessOpacity = 0;
    if (!$gameSwitches.value(SWITCH.BRIGHT_AT_NIGHT)) {
      if (isNight)
        darknessOpacity = global.valueWeather[WEATHER.NIGHT_DARKNESS];
      if (
        $gameSwitches.value(SWITCH.DUNGEON) &&
        $gameSwitches.value(SWITCH.INDOORS)
      ) {
        darknessOpacity = global.valueWeather[WEATHER.DUNGEON_DARKNESS];
      }
    }
    if (mapMeta.DarkSource !== undefined) {
      const taggedOpacity = Number(mapMeta.DarkSource);
      if (Number.isFinite(taggedOpacity)) darknessOpacity = taggedOpacity;
    }
    return darknessOpacity;
  }

  function applyMapParallax(map, isNight) {
    if (map.parallaxName() === "BlueSky" && isNight) {
      map.changeParallax("StarlitSky", true, false, 1, 0);
    }
    const isWorldMap = $gameSwitches.value(SWITCH.WORLD_MAP);
    const isBridge = $gameSwitches.value(SWITCH.BRIDGE);
    if (!isWorldMap && !isBridge) return;
    const skyPrefix = isNight ? "SkyPatternNight" : "SkyPattern";
    const skyPattern =
      global.valueWeather[
      isNight ? WEATHER.NIGHT_SKY_PATTERN : WEATHER.DAY_SKY_PATTERN
      ];
    $gameVariables.setValue(VARIABLE.PARALLAX_PREFIX, skyPrefix);
    map.changeParallax(
      skyPrefix + skyPattern,
      true,
      false,
      global.valueWeather[WEATHER.SKY_SCROLL_X],
      0
    );
  }

  function applyPlayerLight(mapMeta) {
    if (typeof mapMeta.LightChara !== "string") return;
    const lightParameters = mapMeta.LightChara.split(",").map(Number);
    if (lightParameters.length < 4 || !lightParameters.every(Number.isFinite))
      return;
    if (lightParameters[0] < 1) return;
    $gamePlayer.moveLight(
      lightParameters[0],
      lightParameters[1],
      lightParameters[2],
      lightParameters[3]
    );
  }

  function map_weatherSet1() {
    const map = $gameMap;
    const mapMeta = $dataMap.meta || {};
    const isNight = $gameSwitches.value(SWITCH.NIGHT);
    applyMapParallax(map, isNight);
    const darknessOpacity = getMapDarkness(mapMeta, isNight);
    // Explicit zero is meaningful: remove darkness left by the previous setup.
    map.darknessOpacity = Math.max(0, Math.min(255, darknessOpacity));
    applyPlayerLight(mapMeta);
    if (!$gameSwitches.value(SWITCH.DISABLE_MAP_EFFECTS))
      global.map_weatherSet2();
    global.map_regionSet();
  }

  //マップの環境パーティクル設定と色調と遠景
  function map_weatherSet2() {
    const particle = $gameScreen._particle;
    let particleTarget = "weather";
    if ($gameParty.inBattle()) {
      particleTarget = "battleWeather";
    }
    particle.particleSet(0, "click", "click", "def", "above");
    // Retain the original click preset while giving the second target its own ID.
    particle.particleSet(0, "click2", "click2", "click", "above");
    if (
      !$gameSwitches.value(SWITCH.BATTLE_MAP) &&
      $gameSwitches.value(SWITCH.FIELD)
    ) {
      particle.particleSet(0, "dust_walk", "walk:player", "def", "below");
    }
    let suppressAmbientWeather = false;
    const isNight = $gameSwitches.value(SWITCH.NIGHT);
    const weatherTypeId = $gameVariables.value(
      isNight ? VARIABLE.NIGHT_WEATHER : VARIABLE.DAY_WEATHER
    );
    $gameSystem.setBgsFadeForSe(10);

    switch (weatherTypeId) {
      case 1: {
        suppressAmbientWeather = setDarknessWeather(particle, particleTarget);
        break;
      }
      case 2: {
        suppressAmbientWeather = setRainMistWeather(particle, particleTarget);
        break;
      }
      case 3: {
        suppressAmbientWeather = setRuinsDustWeather(particle, particleTarget);
        break;
      }
      case 4: {
        suppressAmbientWeather = setLightRainWeather(particle, particleTarget);
        break;
      }
      case 5: {
        suppressAmbientWeather = setHeavyRainWeather(particle, particleTarget);
        break;
      }
      case 6: {
        suppressAmbientWeather = setDownpourWeather(particle, particleTarget);
        break;
      }
      case 7: {
        suppressAmbientWeather = setSnowWeather(particle, particleTarget);
        break;
      }
      case 8: {
        suppressAmbientWeather = setBlizzardWeather(particle, particleTarget);
        break;
      }
      case 9: {
        suppressAmbientWeather = setWhiteThunderWeather(
          particle,
          particleTarget
        );
        break;
      }
      case 10: {
        suppressAmbientWeather = setYellowThunderWeather(
          particle,
          particleTarget
        );
        break;
      }
      case 11: {
        suppressAmbientWeather = setFireWeather(particle, particleTarget);
        break;
      }
      case 12: {
        suppressAmbientWeather = setUnderwaterWeather(particle, particleTarget);
        break;
      }
      case 13: {
        suppressAmbientWeather = setDesertFlareWeather(
          particle,
          particleTarget
        );
        break;
      }
      case 14: {
        suppressAmbientWeather = setNeonWeather(particle, particleTarget);
        break;
      }
    }
    if (suppressAmbientWeather) {
      for (const particleName of [
        "fog_w",
        "fog_shadow_w",
        "flash_s",
        "cloud_w",
        "stardust_w",
        "cloud_shadow_w",
        "dappled_r1",
        "flare_s",
        "light_leak_s",
        "light_leak_s2"
      ]) {
        if (weatherTypeId === 12 && particleName === "fog_w") continue;
        if (weatherTypeId === 13 && particleName === "flare_s") continue;
        particle.particleClear(particleName);
      }
    }
    if (suppressAmbientWeather) return;
    setAmbientMapWeather(particle, particleTarget);
  }

  // Region tiles are indexed once per setup, in the original y/x spawn order.
  // No persistent cache: runtime region edits and loaded saves remain correct.
  const REGION_SPAWNS = [
    [112, 246],
    [111, 245],
    [110, 244],
    [109, 241],
    [108, 99],
    [107, 73],
    [106, 83],
    [105, 82],
    [104, 81],
    [101, 241],
    [102, 241],
    [103, 241],
    [18, 203],
    [94, 200],
    [95, 199],
    [17, 186],
    [60, 183],
    [69, 90],
    [70, 165],
    [71, 162],
    [72, 159],
    [73, 158],
    [74, 154],
    [93, 135],
    [92, 134],
    [90, 67],
    [89, 77],
    [88, 87],
    [87, 2],
    [86, 61],
    [85, 100],
    [84, 49],
    [83, 60],
    [82, 54],
    [81, 66],
    [80, 50],
    [79, 51],
    [78, 65],
    [77, 97],
    [76, 101],
    [75, 115],
    [29, 123],
    [28, 119],
    [20, 117],
    [19, 138],
    [16, 231],
    [7, 48],
    [6, 116]
  ];
  const REGION_PARTICLES = [
    [30, ["dappled_r"], "above"],
    [31, ["light_pillar_r"], "above"],
    [32, ["light_floor_r"], "below"],
    [33, ["bubble_cp"], "above"],
    [34, ["darkness_r"], "above"],
    [35, ["poison_r"], "below"],
    [36, ["dark_hole_r", "dark_hole_r_2", "dark_hole_r_3"], "above"],
    [37, ["magma_r"], "below"],
    [38, ["ripple_r"], "below"]
  ];

  function indexMapRegions(map) {
    const counts = Array(256).fill(0);
    const positions = Array(256);
    const width = map.width();
    const height = map.height();
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const regionId = map.regionId(x, y);
        if (!Number.isInteger(regionId) || regionId < 1 || regionId > 255)
          continue;
        counts[regionId]++;
        if (!positions[regionId]) positions[regionId] = [];
        positions[regionId].push({ x: x, y: y });
      }
    }
    global.valueRegionMapArray = counts;
    return { counts: counts, positions: positions };
  }

  function map_regionCountSet() {
    return indexMapRegions($gameMap).counts;
  }

  const previousOnMapLoaded = Scene_Map.prototype.onMapLoaded;
  Scene_Map.prototype.onMapLoaded = function () {
    previousOnMapLoaded.apply(this, arguments);
    if ($gameMap) global.map_regionCountSet();
  };

  function setRegionParticles(particle, counts) {
    for (const setting of REGION_PARTICLES) {
      const regionId = setting[0];
      if (!counts[regionId]) continue;
      for (const particleName of setting[1]) {
        particle.particleSet(
          0,
          particleName,
          "region:" + regionId,
          "def",
          setting[2]
        );
      }
    }
    if (!counts[3]) return;
    particle.particleSet(0, "splash_walk", "walk:player:3", "def", "below");
    particle.particleSet(0, "ripple_walk", "walk:player:3", "def", "below");
  }

  function spawnEventsAtRegion(
    map,
    positions,
    regionId,
    sourceEventId,
    direction
  ) {
    const tiles = positions[regionId];
    if (!tiles) return;
    for (const tile of tiles) {
      map.spawnEvent(sourceEventId, tile.x, tile.y, true);
      if (!direction) continue;
      const eventId = map.getLastSpawnEventId();
      const spawnedEvent = map.event(eventId);
      if (spawnedEvent) spawnedEvent.setDirection(direction);
    }
  }

  function spawnMappedRegionEvents(map, positions) {
    for (const setting of REGION_SPAWNS) {
      spawnEventsAtRegion(map, positions, setting[0], setting[1]);
    }
  }

  function spawnStandingNpcs(map, positions, isNight) {
    const firstRegionId = isNight ? 41 : 24;
    const sourceEventId = isNight ? 191 : 111;
    const directions = [2, 4, 6, 8];
    for (
      let directionIndex = 0;
      directionIndex < directions.length;
      directionIndex++
    ) {
      spawnEventsAtRegion(
        map,
        positions,
        firstRegionId + directionIndex,
        sourceEventId,
        directions[directionIndex]
      );
    }
  }

  function spawnFoodEvents(map, positions, isNight) {
    spawnEventsAtRegion(map, positions, 21, 118);
    // Preserve the source's cumulative night ban: both regions 22 AND 23 are excluded.
    if (isNight) return;
    spawnEventsAtRegion(map, positions, 22, 121);
    spawnEventsAtRegion(map, positions, 23, 120);
  }

  function spawnCanopyBeds(map, positions) {
    const bedTiles = positions[96];
    if (!bedTiles) return;
    for (const tile of bedTiles) {
      map.spawnEvent(213, tile.x, tile.y, true);
      map.spawnEvent(214, tile.x, tile.y, true);
      map.spawnEvent(215, tile.x, tile.y, true);
    }
  }

  function map_regionSet() {
    const map = $gameMap;
    const regionIndex = indexMapRegions(map);
    const isNight = $gameSwitches.value(SWITCH.NIGHT);
    setRegionParticles($gameScreen._particle, regionIndex.counts);
    spawnMappedRegionEvents(map, regionIndex.positions);
    spawnStandingNpcs(map, regionIndex.positions, isNight);
    spawnFoodEvents(map, regionIndex.positions, isNight);
    spawnCanopyBeds(map, regionIndex.positions);
  }

  //ADVパート演出
  const advPartDirectClearNames = [
    "gloom_sp",
    "glitter_sp",
    "hearts_sp",
    "questions_sp",
    "feather_sp",
    "ether_sp",
    "lines_sp",
    "direct_screenRing",
    "direct_screenDiffusion1",
    "text_dispray1",
    "direct_screenDiffusion2",
    "direct_screenDiffusion3",
    "direct_screenSquare",
    "direct_screenDiffusionH",
    "htext_dispray1",
    "htext_dispray2",
    "explode_cp_4"
  ];
  function adv_partDirectPlay(effectTypeId) {
    const particle = $gameScreen._particle;

    switch (effectTypeId) {
      case 0: {
        clearAdventureEffects(particle);
        break;
      }
      case 1: {
        playGloomEffect(particle);
        break;
      }
      case 2: {
        playGlitterEffect(particle);
        break;
      }
      case 3: {
        playHeartsEffect(particle);
        break;
      }
      case 4: {
        playQuestionEffect(particle);
        break;
      }
      case 5: {
        playRareTreasureEffect(particle);
        break;
      }
      case 6: {
        playDefeatReturnEffect(particle);
        break;
      }
      case 7: {
        playConcentrationEffect(particle);
        break;
      }
      case 8: {
        playTreasureAnnouncement(particle);
        break;
      }
      case 9: {
        playActorJoinAnnouncement(particle);
        break;
      }
      case 10: {
        playWarpActivation(particle);
        break;
      }
      case 11: {
        playBaseActivation(particle);
        break;
      }
      case 12: {
        playAutomaticEventAnnouncement(particle);
        break;
      }
      case 13: {
        playSceneTitleAnnouncement(particle);
        break;
      }
      case 14:
      case 15:
      case 16: {
        playEntryAcquisitionAnnouncement(particle, effectTypeId);
        break;
      }
      case 17: {
        playMessageWithPortrait(particle);
        break;
      }
      case 18: {
        playMessageWithoutPortrait(particle);
        break;
      }
      case 19: {
        playAdultMessageAnnouncement(particle);
        break;
      }
      case 20: {
        playSleepInductionEffect(particle);
        break;
      }
      case 21: {
        playDrowsinessEffect(particle);
        break;
      }
      case 22: {
        playAdultTextEffect(particle);
        break;
      }
      case 23: {
        playHypnosisEffect(particle);
        break;
      }
    }
  }

  //ADVパート演出クリアも。0でクリア
  function adv_partDirectSet(effectTypeId) {
    const particle = $gameScreen._particle;
    if (effectTypeId !== 0 && effectTypeId !== 6 && effectTypeId !== 9)
      saveAndDimScreen(100);
    switch (effectTypeId) {
      case 0: {
        clearPersistentAdventureEffects(particle);
        break;
      }
      case 1: {
        setHorizontalSpeedLines(particle);
        break;
      }
      case 2: {
        setVerticalSpeedLines(particle);
        break;
      }
      case 3: {
        setRisingParticles(particle);
        break;
      }
      case 4: {
        setPersistentConcentrationLines(particle);
        break;
      }
      case 5: {
        setShowerEffect(particle);
        break;
      }
      case 6: {
        setForegroundClouds(particle);
        break;
      }
      case 7: {
        setActorLightParticles(particle);
        break;
      }
      case 8: {
        setEnemyDarkParticles(particle);
        break;
      }
      case 9: {
        setWeatherClouds(particle);
        break;
      }
      case 10: {
        setLifeStormEffect(particle);
        break;
      }
    }
  }

  //フィルター演出filter_direct(1,640,384,0.01);//種類.x軸,y軸,強さ
  const FLASH_DURATION_BY_STRENGTH = {
    0.02: 180,
    0.03: 150,
    0.04: 120,
    0.05: 90
  };
  function filter_direct(filterTypeId, xValue, yValue, strengthValue) {
    switch (filterTypeId) {
      case 0: {
        clearStagingFilters();
        break;
      }
      case 1: {
        playClimaxShockwave(xValue, yValue, strengthValue);
        break;
      }
      case 2: {
        playBrainwashingShockwave(xValue, yValue, strengthValue);
        break;
      }
      case 3: {
        playTwistFilter(xValue, yValue);
        break;
      }
      case 4: {
        setOldFilmFilter();
        break;
      }
      case 5: {
        setNoiseFilter(xValue);
        break;
      }
      case 6: {
        animateNoiseFilter(xValue, yValue);
        break;
      }
      case 7: {
        setBlurFilter(xValue);
        break;
      }
      case 8: {
        animateBlurFilter(xValue, yValue);
        break;
      }
      case 9: {
        playHeartbeatFilter(xValue, yValue, strengthValue);
        break;
      }
      case 10: {
        playGlitchFilter(xValue, yValue, strengthValue);
        break;
      }
    }
  }

  //属性によるパーティクル発生
  //パッシブステートID(51-57)と、同一効果を指す省略ID(3-9)の粒子対応
  const PARTICLE_NAME_BY_PASSIVE_STATE_ID = {
    3: "sparks_w2",
    51: "sparks_w2",
    4: "petal_w",
    52: "petal_w",
    5: "stardust_w",
    53: "stardust_w",
    6: "bubble_w",
    54: "bubble_w",
    7: "diamonddust_w",
    55: "diamonddust_w",
    8: "black_particle_w",
    56: "black_particle_w",
    9: "ether_sp",
    57: "ether_sp"
  };

  function element_particleSet(
    elementParticleTypeId,
    pictureId,
    passiveStateId,
    pictureYOffset
  ) {
    const particle = $gameScreen._particle;

    switch (elementParticleTypeId) {
      case 0: {
        clearElementPresentation(particle, pictureId);
        break;
      }
      case 1: {
        setPassiveElementParticle(particle, passiveStateId);
        break;
      }
      case 2: {
        showElementParallaxPictures(pictureId, passiveStateId, pictureYOffset);
        break;
      }
    }
  }

  //gabによるパーティクル発生
  //gabによるパーティクル発生
  function gab_wordParticle(gabText) {
    AudioManager.playSe({ name: "Chime2", volume: 90, pitch: 100, pan: 0 });
    const particleName = "text_dispray2";
    const particle = $gameScreen._particle;
    particle.particleClear(particleName);
    const scene = SceneManager._scene;
    if (!scene) return;
    if (scene._gabWindow) scene.clearGabWindow();
    particle.particlePlay(0, particleName, "screen", "def", "screen");
    particle.particleExceed(particleName, 0.3);
    const gabData = [`　　　${gabText}`, "", 0, 0, "", 0];
    if (scene._gabWindow) scene.startGabWindow(gabData);
  }

  //Hランク上昇任意hSkill_rankUpWordDirect(1,1,671,1);//1が最初2が文字で0で締め,ｱｸﾀｰ,ｽｷﾙid,ﾗﾝｸｾｯﾄ
  function hSkill_rankUpWordDirect(
    messageTypeId,
    actorIdOrMessageText,
    skillId,
    masteryLevel
  ) {
    switch (messageTypeId) {
      case 1: {
        announceSkillMasteryRank(actorIdOrMessageText, skillId, masteryLevel);
        break;
      }
      case 2: {
        announceCustomMasteryMessage(actorIdOrMessageText);
        break;
      }
      case 0: {
        finishMasteryAnnouncement();
        break;
      }
    }
  }

  //獲得物の簡易表示get_infoDirect(0,51,0,1);
  const REWARD_TYPE = {
    ITEM: 0,
    WEAPON: 1,
    ARMOR: 2,
    SKILL: 3,
    GOLD: 4,
    CLASS: 5
  };
  const CLASS_RANK_NUMERALS = ["", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ"];

  function getRewardDefinition(databaseTypeId, databaseEntryId, itemAmount) {
    let databaseEntries;
    let escapeCode;
    let actionText = itemAmount < 0 ? "失った…。" : "を入手した！";
    switch (databaseTypeId) {
      case REWARD_TYPE.ITEM:
        databaseEntries = $dataItems;
        escapeCode = "IIN";
        break;
      case REWARD_TYPE.WEAPON:
        databaseEntries = $dataWeapons;
        escapeCode = "WIN";
        break;
      case REWARD_TYPE.ARMOR:
        databaseEntries = $dataArmors;
        escapeCode = "AIN";
        break;
      case REWARD_TYPE.SKILL:
        databaseEntries = $dataSkills;
        escapeCode = "SIN";
        actionText = "獲得した！";
        break;
      case REWARD_TYPE.CLASS:
        databaseEntries = $dataClasses;
        escapeCode = "J";
        actionText = "が解放された！";
        break;
      case REWARD_TYPE.GOLD:
        return {
          nameText: colorTaggedText(
            6,
            `${databaseEntryId.toLocaleString()}\\G`
          ),
          actionText: databaseEntryId < 0 ? "失った…。" : "入手した！",
          entry: null,
          sound: {
            name: "Shop1",
            volume: 100,
            pitch: getGoldRewardPitch(databaseEntryId),
            pan: 0
          }
        };
      default:
        return null;
    }
    const entry = databaseEntries[databaseEntryId];
    if (!entry) return null;
    return {
      nameText: colorTaggedText(2, `＜\x1b${escapeCode}[${databaseEntryId}]＞`),
      actionText: actionText,
      entry: entry,
      sound: { name: "Saint5", volume: 75, pitch: 50, pan: 0 }
    };
  }

  function getGoldRewardPitch(goldAmount) {
    if (goldAmount >= 200001) return 50;
    if (goldAmount >= 100001) return 60;
    if (goldAmount >= 60001) return 70;
    if (goldAmount >= 30001) return 80;
    if (goldAmount >= 10000) return 90;
    return 100;
  }

  function decorateRewardCategory(reward) {
    const meta = reward.entry.meta || {};
    switch (Number(meta.EICSwitch)) {
      case 104:
        reward.nameText = colorTaggedText(17, "称号") + ":" + reward.nameText;
        break;
      case 105:
        reward.nameText = colorTaggedText(27, "Ｈ称号") + ":" + reward.nameText;
        reward.sound = { name: "ZH_Sexy", volume: 50, pitch: 150, pan: 0 };
        break;
      case 108:
        reward.nameText =
          colorTaggedText(20, "クエスト") + ":" + reward.nameText;
        break;
    }
  }

  function decorateSkillReward(reward) {
    const skillTypeId = reward.entry.stypeId;
    reward.nameText =
      $dataSystem.skillTypes[skillTypeId] + ":" + reward.nameText;
    switch (skillTypeId) {
      case 14:
      case 15:
        reward.actionText = "を獲得した………。";
        reward.sound = { name: "ZH_Sexy", volume: 50, pitch: 150, pan: 0 };
        break;
    }
  }

  function decorateClassReward(reward) {
    const meta = reward.entry.meta || {};
    let jobTypeText = meta["Subclass Only"]
      ? colorTaggedText(17, "サブジョブ") + " "
      : colorTaggedText(20, "メインジョブ") + " ";
    const rankNumeral = CLASS_RANK_NUMERALS[Number(meta.classRank)];
    if (rankNumeral) jobTypeText += `Class\\C[10]${rankNumeral}\\C[0]`;
    reward.nameText = jobTypeText + ":" + reward.nameText;
  }

  function applyActorReward(
    databaseTypeId,
    databaseEntryId,
    targetActorId,
    skipMutation
  ) {
    const actor = $gameActors.actor(targetActorId);
    if (!actor || skipMutation) return;
    switch (databaseTypeId) {
      case REWARD_TYPE.SKILL:
        if (!actor.isLearnedSkill(databaseEntryId))
          actor.learnSkill(databaseEntryId);
        break;
      case REWARD_TYPE.CLASS:
        if (
          actor._unlockedClasses &&
          actor._unlockedClasses.indexOf(databaseEntryId) !== -1
        )
          return;
        actor.unlockClass(databaseEntryId);
        break;
    }
  }

  function processReward(
    reward,
    databaseTypeId,
    databaseEntryId,
    actorId,
    itemAmount
  ) {
    const skipMutation = $gameSwitches.value(SWITCH.RECOLLECTION_SKIP);
    if (databaseTypeId === REWARD_TYPE.GOLD) {
      if (!skipMutation) $gameParty.gainGold(databaseEntryId);
      return;
    }
    decorateRewardCategory(reward);
    switch (databaseTypeId) {
      case REWARD_TYPE.ITEM:
      case REWARD_TYPE.WEAPON:
      case REWARD_TYPE.ARMOR:
        if (!skipMutation) $gameParty.gainItem(reward.entry, itemAmount);
        reward.nameText += `×${itemAmount} `;
        return;
      case REWARD_TYPE.SKILL:
        decorateSkillReward(reward);
        break;
      case REWARD_TYPE.CLASS:
        decorateClassReward(reward);
        break;
    }
    const targetActorId =
      actorId === 0
        ? $gameVariables.value(VARIABLE.PROTAGONIST_ACTOR_ID)
        : actorId;
    applyActorReward(
      databaseTypeId,
      databaseEntryId,
      targetActorId,
      skipMutation
    );
    const actorParticle = databaseTypeId === REWARD_TYPE.SKILL ? "が" : "の";
    reward.nameText =
      `\x1bN[${targetActorId}]${actorParticle}` + reward.nameText;
  }

  function showRewardDescription(entry) {
    if (!entry || !$gameSwitches.value(SWITCH.SHOW_REWARD_DESCRIPTION)) return;
    const lines = String(entry.description || "").split("\n");
    if (lines[0] && lines[0] != 0)
      TickerManager.show("　　　解説文:" + lines[0]);
    if (lines[1] && lines[1] != 0) TickerManager.show("　　　" + lines[1]);
  }

  function animateRewardRecipient() {
    if ($gameParty.inBattle()) return;
    const eventSubjectIndex = $gameVariables.value(
      VARIABLE.EVENT_SUBJECT_INDEX
    );
    if (eventSubjectIndex === 0) {
      $gamePlayer.requestAnimation(229);
      return;
    }
    const dynamicEventIds = $gameVariables.value(VARIABLE.DYNAMIC_EVENT_IDS);
    if (!dynamicEventIds) return;
    const targetEventId = dynamicEventIds[eventSubjectIndex];
    if (!(targetEventId >= 1)) return;
    const targetEvent = $gameMap.event(targetEventId);
    if (targetEvent) targetEvent.requestAnimation(229);
  }

  function get_infoDirect(
    databaseTypeId,
    databaseEntryId,
    actorId,
    itemAmount
  ) {
    const reward = getRewardDefinition(
      databaseTypeId,
      databaseEntryId,
      itemAmount
    );
    if (!reward) return;
    processReward(reward, databaseTypeId, databaseEntryId, actorId, itemAmount);
    TickerManager.show(`　　${reward.nameText} ${reward.actionText}`);
    if (databaseTypeId <= REWARD_TYPE.SKILL)
      showRewardDescription(reward.entry);
    AudioManager.playSe(reward.sound);
    animateRewardRecipient();
    itemGet_afterProcess();
  }

  //直接的演出指定
  function direct_staging1(
    stagingTypeId,
    pictureName,
    pictureX,
    pictureEffect
  ) {
    switch (stagingTypeId) {
      case 1: //1絶望的な回想
        pic_1(
          2,
          pictureName,
          pictureX,
          0,
          100,
          255,
          60,
          1280,
          768,
          pictureEffect,
          0
        );
        $gameScreen.startFlash([255, 255, 255, 170], 60);
        global.filter_direct(9, 640, 384, 60);
        global.filter_direct(10, 1000, 1000, 60);
        global.filter_direct(4, 0, 0, 0);
        global.filter_direct(5, 0.1, 0, 0);
        break;
      case 2:
        break;
    }
  }

  global.adv_partDirectPlay = adv_partDirectPlay;
  global.adv_partDirectSet = adv_partDirectSet;
  global.direct_staging1 = direct_staging1;
  global.element_particleSet = element_particleSet;
  global.filter_direct = filter_direct;
  global.gab_wordParticle = gab_wordParticle;
  global.get_infoDirect = get_infoDirect;
  global.hSkill_rankUpWordDirect = hSkill_rankUpWordDirect;
  global.map_regionCountSet = map_regionCountSet;
  global.map_regionSet = map_regionSet;
  global.map_weatherSet1 = map_weatherSet1;
  global.map_weatherSet2 = map_weatherSet2;
  global.menu_particleSet = menu_particleSet;
  global.weather_set = weather_set;

  function setDarknessWeather(particle, particleTarget) {
    const darknessSpeed = global.valueWeather[WEATHER.DARKNESS_SPEED];
    //暗闇の視界制限
    const particleName = "darkness_s";
    particle.particleSet(0, particleName, particleTarget, "def", "99");
    particle.particleUpdate([
      particleName,
      "alpha",
      "0",
      global.valueWeather[WEATHER.DARKNESS_ALPHA] + "@0.5",
      "0"
    ]);
    particle.particleUpdate([
      particleName,
      "speed",
      String(darknessSpeed),
      String(darknessSpeed)
    ]);

    return false;
  }

  function setRainMistWeather(particle, particleTarget) {
    //雨天時のモヤ
    const particleName = "rain_fog_w";
    particle.particleSet(0, particleName, particleTarget, "def", "99");

    return true;
  }

  function setRuinsDustWeather(particle, particleTarget) {
    //薄暗い廃墟など
    const particleName = "dust_w";
    particle.particleSet(0, particleName, particleTarget, "def", "99");

    return true;
  }

  function setLightRainWeather(particle, particleTarget) {
    //しとしと雨
    particle.particleSet(0, "rain_w", particleTarget, "def", "99");
    particle.particleSet(0, "rain_fog_w", particleTarget, "def", "99"); //雨天時のモヤ
    $gameSystem.setBgsLine(10);
    AudioManager.playBgs({ name: "11_Drips", volume: 25, pitch: 100, pan: 0 });

    return false;
  }

  function setHeavyRainWeather(particle, particleTarget) {
    //強めの雨
    particle.particleSet(0, "rain_w2", particleTarget, "def", "99");
    particle.particleSet(0, "rain_fog_w", particleTarget, "def", "99"); //雨天時のモヤ
    $gameSystem.setBgsLine(10);
    AudioManager.playBgs({ name: "11_Storm1", volume: 20, pitch: 150, pan: 0 });

    return true;
  }

  function setDownpourWeather(particle, particleTarget) {
    //本降りの雨
    particle.particleSet(0, "rain_w3", particleTarget, "def", "99");
    $gameSystem.setBgsLine(10);
    AudioManager.playBgs({ name: "11_Storm1", volume: 25, pitch: 100, pan: 0 });

    return true;
  }

  function setSnowWeather(particle, particleTarget) {
    //うっすらと降る雪
    particle.particleSet(0, "snow_w", particleTarget, "def", "99");
    particle.particleSet(0, "snow_w2", particleTarget, "def", "99"); //雪の結晶

    return false;
  }

  function setBlizzardWeather(particle, particleTarget) {
    //吹雪
    particle.particleSet(0, "blizard_w", particleTarget, "def", "99");
    $gameSystem.setBgsLine(10);
    AudioManager.playBgs({ name: "11_Wind", volume: 25, pitch: 50, pan: 0 });

    return true;
  }

  function setWhiteThunderWeather(particle, particleTarget) {
    //ピカッと一瞬光る稲妻
    particle.particleSet(0, "thunder_w", particleTarget, "def", "99");
    $gameSystem.setBgsLine(10);
    AudioManager.playBgs({
      name: "11_Thunder",
      volume: 50,
      pitch: 150,
      pan: 0
    });

    return false;
  }

  function setYellowThunderWeather(particle, particleTarget) {
    //黄色の稲妻
    particle.particleSet(0, "thunder_w2", particleTarget, "def", "99");
    $gameSystem.setBgsLine(10);
    AudioManager.playBgs({
      name: "11_Thunder",
      volume: 50,
      pitch: 100,
      pan: 0
    });

    return false;
  }

  function setFireWeather(particle, particleTarget) {
    //火事現場
    particle.particleSet(0, "dust_w", particleTarget, "def", "spriteset");
    particle.particleSet(0, "particle_w", particleTarget, "def", "spriteset");
    particle.particleSet(0, "sparks_w", particleTarget, "def", "spriteset");
    particle.particleSet(0, "sparks_w2", particleTarget, "def", "spriteset");
    particle.particleGroupSet(0, "narration_fire_s", particleTarget);
    $gameScreen.startTint([68, -34, -34, 68], 10);
    $gameSystem.setBgsLine(10);
    AudioManager.playBgs({ name: "11_fire", volume: 25, pitch: 80, pan: 0 });

    return true;
  }

  function setUnderwaterWeather(particle, particleTarget) {
    const screen = $gameScreen;
    //海底
    particle.particleSet(0, "bubble_w", particleTarget, "def", "spriteset");
    particle.particleSet(0, "fog_w", particleTarget, "def", "spriteset");
    particle.particleSet(0, "fish_w", particleTarget, "def", "spriteset");
    particle.particleSet(
      0,
      "light_pillar_w",
      particleTarget,
      "def",
      "spriteset"
    );
    screen.startTint([-100, -30, 0, 0], 10);
    screen.startDisplacementFilter(2, 2, 10, "DisplacementMap");
    particle.particleSet(0, "bubble_c", "attach:player", "def", "99");
    $gameSystem.setBgsLine(10);
    AudioManager.playBgs({ name: "11_Sea", volume: 25, pitch: 50, pan: 0 });

    return true;
  }

  function setDesertFlareWeather(particle, particleTarget) {
    //太陽光のフレア//砂漠
    const particleName = "flare_s";
    particle.particleSet(0, particleName, particleTarget, "def", "99");
    const flareX = [-500, 0, 600][getRandomIndex(3)];
    particle.particleUpdate([particleName, "pos", String(flareX), -600]);
    const flareAlpha = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0][getRandomIndex(6)];
    particle.particleUpdate([
      particleName,
      "alpha",
      "0",
      flareAlpha + "@0.2",
      flareAlpha + "@0.8",
      "0"
    ]);
    particle.particleUpdate([particleName, "scale", "10", "10"]);

    return true;
  }

  function setNeonWeather(particle, particleTarget) {
    //六色ネオン
    const particleName = "light_leak_s3";
    particle.particleSet(0, particleName, particleTarget, "def", "99");
    particle.particleUpdate([
      particleName,
      "alpha",
      "0",
      global.valueWeather[WEATHER.NEON_ALPHA] + "@0.5",
      "0"
    ]);

    return true;
  }

  function clearAdventureEffects(particle) {
    //クリア
    restoreScreenTone();
    for (const particleName of advPartDirectClearNames) {
      particle.particleClear(particleName);
    }
  }

  function playGloomEffect(particle) {
    //どんより
    const particleName = "gloom_sp";
    const seName = "Down3";
    AudioManager.playSe({ name: seName, volume: 90, pitch: 70, pan: 0 });
    $gameScreen.startFlash([0, 0, 0, 200], 120);
    particle.particlePlay(0, particleName, "screen", "def", "screen");
  }

  function playGlitterEffect(particle) {
    const particleName = "glitter_sp";
    $gameScreen.startFlash([255, 255, 255, 200], 120);
    const seName = "Up3";
    AudioManager.playSe({ name: seName, volume: 90, pitch: 100, pan: 0 });
    particle.particlePlay(0, particleName, "screen", "def", "screen");
  }

  function playHeartsEffect(particle) {
    const particleName = "hearts_sp";
    $gameScreen.startFlash([255, 119, 255, 200], 120);
    const meName = "11_Sexy";
    AudioManager.playMe({ name: meName, volume: 90, pitch: 150, pan: 0 });
    particle.particlePlay(0, particleName, "screen", "def", "screen");
  }

  function playQuestionEffect(particle) {
    const particleName = "questions_sp";
    $gameScreen.startFlash([255, 255, 255, 200], 120);
    const seName = "Saint1";
    AudioManager.playSe({ name: seName, volume: 90, pitch: 70, pan: 0 });
    particle.particlePlay(0, particleName, "screen", "def", "screen");
  }

  function playRareTreasureEffect(particle) {
    const particleName = "feather_sp";
    const seName = "Z11_RareTreasureBox";
    AudioManager.playSe({ name: seName, volume: 60, pitch: 100, pan: 0 });
    particle.particlePlay(0, particleName, "screen", "def", "screen");
  }

  function playDefeatReturnEffect(particle) {
    //戦闘敗北時
    const particleName = "ether_sp";
    const seName = "Z_Summoning";
    AudioManager.playSe({ name: seName, volume: 60, pitch: 120, pan: 0 });
    particle.particlePlay(0, particleName, "screen", "def", "spriteset");
    const tickerText = `拠点に強制帰還されます…。`;
    TickerManager.show(tickerText);
  }

  function playConcentrationEffect(particle) {
    //集中線
    const particleName = "lines_sp";
    $gameScreen.startFlash([255, 255, 255, 200], 120);
    const seName = "Wind1";
    AudioManager.playSe({ name: seName, volume: 90, pitch: 120, pan: 0 });
    particle.particlePlay(0, particleName, "screen", "def", "screen");
  }

  function playTreasureAnnouncement(particle) {
    //宝箱レア演出。元コモンで色調変更
    $gameScreen.startFlash([255, 255, 255, 200], 30);
    saveAndDimScreen(150);
    picture_motion1("smooth", [0]);
    let pictureId = 100; //文字ピクチャ。元コモンで実行している。
    $gameScreen.showPicture(pictureId, "", 1, 640 + 200, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 100, 255, 0, 60);
    pictureId = 99;
    const titlePictureName = "ScreenCenterTextDisPray";
    $gameScreen.showPicture(
      pictureId,
      titlePictureName,
      1,
      640 + 200,
      384,
      100,
      0,
      0,
      0
    );
    $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 50, 200, 0, 60);
    particle.particlePlay(0, "direct_screenRing", "screen", "def", "screen");
    particle.particlePlay(
      0,
      "direct_screenDiffusion1",
      "screen",
      "def",
      "screen"
    );
  }

  function playActorJoinAnnouncement(particle) {
    //仲間加入
    $gameScreen.startFlash([255, 255, 255, 200], 30);
    saveAndDimScreen(150);
    picture_motion1("smooth", [0]);
    let pictureId = 99;
    const titlePictureName = "ScreenCenterTextDisPray";
    $gameScreen.showPicture(
      pictureId,
      titlePictureName,
      1,
      640 + 200,
      384,
      100,
      0,
      0,
      0
    );
    $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 50, 200, 0, 30);
    const particleName = "text_dispray1"; //仲間加入
    particle.particleSet(0, particleName, "screen", "def", "screen");
    particle.particleUpdate([particleName, "pos", -600, 20]);
    const selectedActorId = $gameVariables.value(VARIABLE.SELECTED_ACTOR_ID);
    const selectedActorData = $dataActors[selectedActorId];
    if (
      selectedActorData &&
      selectedActorData.meta &&
      selectedActorData.meta.NpcChara
    ) {
      particle.particleUpdate([particleName, "color", "#e59fff", "#6d80ff"]);
    }
    const actorName = `\\V[53]\\V[49]`;
    const joinMessageText = `${actorName}がパーティに加わった！`;
    $gameScreen.setDTextPicture(joinMessageText, 28);
    pictureId = 100;
    $gameScreen.showPicture(pictureId, "", 1, 640, 384, 100, 100, 0, 0);
    const joinActor = $gameActors.actor(selectedActorId);
    if (!!joinActor && isGirl(joinActor)) {
      $gameScreen.movePicture(
        pictureId,
        1,
        640 - 200,
        384,
        100,
        100,
        255,
        0,
        30
      );
    } else {
      $gameScreen.movePicture(
        pictureId,
        1,
        640 - 50,
        384,
        100,
        100,
        255,
        0,
        30
      );
    }
    const facePictureCandidates = [2, 6];
    global.valueFaceSelect =
      facePictureCandidates[getRandomIndex(facePictureCandidates.length)];
    withBustUpDisplay(101, 550, 0, 40);
  }

  function playWarpActivation(particle) {
    //ワープポイントアクティベート
    const seName = "Item4";
    AudioManager.playSe({ name: seName, volume: 50, pitch: 50, pan: 0 });
    $gameScreen.startFlash([255, 255, 255, 200], 30);
    saveAndDimScreen(150);
    picture_motion1("smooth", [0]);
    let pictureId = 100; //文字ピクチャ。。元コモンで実行している。
    $gameScreen.showPicture(pictureId, "", 1, 640, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 100, 255, 0, 60);
    pictureId = 99;
    const titlePictureName = "ScreenCenterTextDisPray";
    $gameScreen.showPicture(
      pictureId,
      titlePictureName,
      1,
      640 + 200,
      384,
      100,
      0,
      0,
      0
    );
    $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 50, 200, 0, 60);
    particle.particlePlay(0, "direct_screenRing", "screen", "def", "screen");
    particle.particlePlay(
      0,
      "direct_screenDiffusion2",
      "screen",
      "def",
      "screen"
    );
  }

  function playBaseActivation(particle) {
    //拠点アクティベート
    const seName = "Item4";
    AudioManager.playSe({ name: seName, volume: 50, pitch: 50, pan: 0 });
    $gameScreen.startFlash([255, 255, 255, 200], 30);
    saveAndDimScreen(150);
    picture_motion1("smooth", [0]);
    let pictureId = 100; //文字ピクチャ。。元コモンで実行している。
    $gameScreen.showPicture(pictureId, "", 1, 640, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 100, 255, 0, 60);
    pictureId = 99;
    const titlePictureName = "ScreenCenterTextDisPray";
    $gameScreen.showPicture(
      pictureId,
      titlePictureName,
      1,
      640 + 200,
      384,
      100,
      0,
      0,
      0
    );
    $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 50, 200, 0, 60);
    particle.particlePlay(0, "direct_screenRing", "screen", "def", "screen");
    particle.particlePlay(
      0,
      "direct_screenDiffusion3",
      "screen",
      "def",
      "screen"
    );
  }

  function playAutomaticEventAnnouncement(particle) {
    //夜シーン強制
    picture_motion1("smooth", [0]);
    particle.particlePlay(0, "direct_screenSquare", "screen", "def", "screen");
    $gameScreen.setDTextPicture(`イベント自動発生`, 28);
    $gameScreen.dWindowFrame = "ON";
    const pictureId = 100;
    $gameScreen.showPicture(pictureId, "", 1, 640 + 50, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 100, 255, 0, 20);
  }

  function playSceneTitleAnnouncement(particle) {
    //シーンタイトル通知
    picture_motion1("smooth", [0]);
    let pictureId = 102;
    const titlePictureName = "ScreenCenterTextDisPrayTitle";
    $gameScreen.showPicture(
      pictureId,
      titlePictureName,
      1,
      640 - 100,
      384 - 200,
      100,
      80,
      0,
      0
    );
    $gameScreen.movePicture(pictureId, 1, 640, 384 - 200, 100, 80, 200, 0, 30);
    const particleName = "text_dispray1";
    particle.particlePlay(0, particleName, "screen", "def", "screen");
    particle.particleUpdate([particleName, "pos", -700, -200]);
    const titleText = `──\\V[142]──`;
    if ($gameVariables.value(VARIABLE.RECOLLECTION_ITEM_ID) >= 1) {
      $gameScreen.setDTextPicture(`\\f[b]\\C[13]${titleText}\\C[0]`, 28);
    } else {
      $gameScreen.setDTextPicture(`\\f[b]\\C[16]${titleText}\\C[0]`, 28);
    }
    pictureId = 103;
    $gameScreen.showPicture(pictureId, "", 0, 10, 170, 0, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 0, 50, 170, 100, 100, 255, 0, 30);
  }

  function playEntryAcquisitionAnnouncement(particle, effectTypeId) {
    const selectedActorId = $gameVariables.value(VARIABLE.SELECTED_ACTOR_ID);
    const processedEntryId = $gameVariables.value(VARIABLE.PROCESSED_ENTRY_ID);
    const actor = $gameActors.actor(selectedActorId);
    global.valueItems = effectTypeId === 14 ? $dataItems : $dataSkills;
    const entry = global.valueItems[processedEntryId];
    if (!entry) return;
    const entryMeta = entry.meta || {};
    const isAdultAnnouncement =
      effectTypeId === 14
        ? Number(entryMeta.EICSwitch) !== 104
        : entry.stypeId === 14 || entry.stypeId === 15;
    playAcquisitionSoundAndFlash(isAdultAnnouncement);
    saveAndDimScreen(150);
    showAcquisitionPictures(particle, isAdultAnnouncement);
    const messageText = getEntryAnnouncementText(
      effectTypeId,
      processedEntryId,
      entry
    );
    $gameScreen.setDTextPicture(messageText, 28);
    $gameScreen.showPicture(60, "", 1, 640, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(60, 1, 540, 384, 100, 100, 255, 0, 60);
    applyAcquisitionChange(effectTypeId, actor, entry, processedEntryId);
    const faceCandidates = getAcquisitionFaceCandidates(
      actor,
      selectedActorId,
      isAdultAnnouncement
    );
    global.valueFaceSelect =
      faceCandidates[getRandomIndex(faceCandidates.length)];
    withBustUpDisplay(52, 550, 0, 120);
    global.valueWordSet0 = "解説文:\n" + (entry.description || "");
  }

  function playAcquisitionSoundAndFlash(isAdultAnnouncement) {
    if (isAdultAnnouncement) {
      AudioManager.playSe({ name: "ZH_Sexy", volume: 45, pitch: 100, pan: 0 });
      $gameScreen.startFlash([255, 119, 255, 204], 30);
      $gameVariables.setValue(VARIABLE.GENERAL_RANDOM_2, 242);
      return;
    }
    AudioManager.playMe({
      name: "21_SkillLearn",
      volume: 60,
      pitch: 100,
      pan: 0
    });
    $gameScreen.startFlash([255, 255, 255, 200], 30);
    $gameVariables.setValue(VARIABLE.GENERAL_RANDOM_2, 300);
  }

  function showAcquisitionPictures(particle, isAdultAnnouncement) {
    picture_motion1("smooth", [0]);
    $gameScreen.showPicture(
      51,
      "ScreenCenterTextDisPrayOneRow",
      1,
      840,
      384,
      100,
      0,
      0,
      0
    );
    $gameScreen.movePicture(51, 1, 640, 384, 100, 100, 250, 0, 60);
    particle.particleSet(0, "direct_screenRing", "screen", "def", "screen");
    particle.particleUpdate([
      "direct_screenRing",
      "color",
      isAdultAnnouncement ? "#dc7dff" : "#8fceff",
      "#ffffff"
    ]);
    const diffusionPreset = isAdultAnnouncement
      ? "direct_screenDiffusionH"
      : "direct_screenDiffusion2";
    particle.particleSet(0, diffusionPreset, "screen", "def", "screen");
    if (!isAdultAnnouncement)
      particle.particleUpdate([diffusionPreset, "color", "#8fceff", "#ffffff"]);
  }

  function applyAcquisitionChange(effectTypeId, actor, entry, entryId) {
    if ($gameSwitches.value(SWITCH.RECOLLECTION_SKIP)) return;
    switch (effectTypeId) {
      case 14:
        $gameParty.gainItem(entry, 1);
        break;
      case 15:
        if (actor) actor.learnSkill(entryId);
        break;
      case 16:
        if (actor) actor.forgetSkill(entryId);
        break;
    }
  }

  function getAcquisitionFaceCandidates(
    actor,
    selectedActorId,
    isAdultAnnouncement
  ) {
    if (isAdultAnnouncement) {
      return actor && actor.isLearnedSkill(65)
        ? [27, 28, 29, 30, 31, 32, 39, 40, 41]
        : [21, 22, 23, 24, 25];
    }
    return selectedActorId === 1 ? [2, 6, 53] : [2, 6];
  }

  function playMessageWithPortrait(particle) {
    //汎用演出。valueWordSet0に文章入れておく。
    $gameScreen.startFlash([255, 255, 255, 200], 30);
    saveAndDimScreen(150);
    picture_motion1("smooth", [0]);
    let pictureId = 51;
    const titlePictureName = "ScreenCenterTextDisPrayOneRow";
    let textScale = 100;
    textScale = getMessageHeightScale(global.valueWordSet0);
    $gameScreen.showPicture(
      pictureId,
      titlePictureName,
      1,
      640 + 200,
      384,
      100,
      0,
      0,
      0
    );
    $gameScreen.movePicture(pictureId, 1, 640, 384, 100, textScale, 250, 0, 60);
    particle.particleSet(0, "direct_screenRing", "screen", "def", "screen");
    particle.particleUpdate([
      "direct_screenRing",
      "color",
      "#007bff",
      "#f7ff76"
    ]);
    particle.particleSet(
      0,
      "direct_screenDiffusion2",
      "screen",
      "def",
      "screen"
    );
    particle.particleUpdate([
      "direct_screenDiffusion2",
      "color",
      "#007bff",
      "#f7ff76"
    ]);
    $gameScreen.setDTextPicture(global.valueWordSet0, 28);
    pictureId = 60;
    $gameScreen.showPicture(pictureId, "", 1, 640, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 200, 384, 100, 100, 255, 0, 60);
    const facePictureCandidates = [2, 6];
    if ($gameVariables.value(VARIABLE.SELECTED_ACTOR_ID) == 1) {
      facePictureCandidates.push(53);
    } //りしゃぶる。リーシャ。ドヤ顔
    global.valueFaceSelect =
      facePictureCandidates[getRandomIndex(facePictureCandidates.length)];
    withBustUpDisplay(52, 550, 0, 120);
  }

  function playMessageWithoutPortrait(particle) {
    //汎用演出顔グラなし。valueWordSet0に文章入れておく。
    $gameScreen.startFlash([255, 255, 255, 200], 30);
    saveAndDimScreen(150);
    picture_motion1("smooth", [0]);
    let pictureId = 51;
    const titlePictureName = "ScreenCenterTextDisPrayOneRow";
    let textScale = 100;
    textScale = getMessageHeightScale(global.valueWordSet0);
    $gameScreen.showPicture(
      pictureId,
      titlePictureName,
      1,
      640 + 200,
      384,
      100,
      0,
      0,
      0
    );
    $gameScreen.movePicture(pictureId, 1, 640, 384, 100, textScale, 250, 0, 60);
    particle.particleSet(0, "direct_screenRing", "screen", "def", "screen");
    particle.particleUpdate([
      "direct_screenRing",
      "color",
      "#007bff",
      "#f7ff76"
    ]);
    particle.particleUpdate(["direct_screenRing", "colorMode", "0"]);
    particle.particleSet(
      0,
      "direct_screenDiffusion2",
      "screen",
      "def",
      "screen"
    );
    particle.particleUpdate([
      "direct_screenDiffusion2",
      "color",
      "#007bff",
      "#f7ff76"
    ]);
    particle.particleUpdate(["direct_screenDiffusion2", "colorMode", "0"]);
    $gameScreen.setDTextPicture(global.valueWordSet0, 28);
    pictureId = 60;
    $gameScreen.showPicture(pictureId, "", 1, 640, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 100, 255, 0, 60);
  }

  function playAdultMessageAnnouncement(particle) {
    //汎用2行まで演出顔グラなしH。valueWordSet0に文章入れておく。
    const voicePitch = getRandomIndex(51) + 100;
    AudioManager.playSe({
      name: "ZH_SexyVoice",
      volume: 50,
      pitch: voicePitch,
      pan: 0
    });
    $gameScreen.startFlash([255, 119, 255, 200], 60);
    saveAndDimScreen(150);
    picture_motion1("smooth", [0]);
    let pictureId = 108;
    const backPictureName = "ScreenWordBackH";
    let backOpacity = 50;
    const protagonistActorId = $gameVariables.value(
      VARIABLE.PROTAGONIST_ACTOR_ID
    );
    const actor = $gameActors.actor(protagonistActorId);
    if (actor && actor.isLearnedSkill(63)) {
      backOpacity = 100;
    }
    if (actor && actor.isLearnedSkill(65)) {
      backOpacity = 150;
    }
    if (actor && actor.isLearnedSkill(68)) {
      backOpacity = 200;
    }
    $gameScreen.showPicture(
      pictureId,
      backPictureName,
      1,
      640,
      384,
      100,
      100,
      backOpacity,
      0
    );
    picture_fade1(pictureId, "fadeIn", "Hscene005", 120, 5);
    pictureId = 109;
    const titlePictureName = "ScreenCenterTextDisPrayOneRow";
    let textScale = 100;
    textScale = getMessageHeightScale(global.valueWordSet0);
    $gameScreen.showPicture(
      pictureId,
      titlePictureName,
      1,
      640 + 200,
      384,
      100,
      0,
      0,
      0
    );
    $gameScreen.movePicture(pictureId, 1, 640, 384, 100, textScale, 250, 0, 60);
    particle.particleSet(0, "direct_screenRing", "screen", "def", "screen");
    particle.particleUpdate([
      "direct_screenRing",
      "color",
      "#dc7dff",
      "#ffffff"
    ]);
    particle.particleSet(
      0,
      "direct_screenDiffusion2",
      "screen",
      "def",
      "screen"
    );
    particle.particleUpdate([
      "direct_screenDiffusion2",
      "color",
      "#dc7dff",
      "#ffffff"
    ]);
    $gameScreen.setDTextPicture(global.valueWordSet0, 28);
    pictureId = 110;
    $gameScreen.showPicture(pictureId, "", 1, 640, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 100, 255, 0, 60);
  }

  function playSleepInductionEffect(particle) {
    //睡眠誘導光
    const particleName = "ether_sp";
    particle.particlePlay(0, particleName, "screen", "def", "screen");
    particle.particleUpdate([particleName, "color", "#dd00ff", "#86e3ff"]);
    particle.particleUpdate([particleName, "emitterLifetime", "3"]);
    particle.particleUpdate([particleName, "frequency", "0.01"]);
    $gameScreen.startFlash([255, 119, 255, 200], 60);
    const seName = "Saint2";
    const sePitch = getRandomIndex(26) + 50;
    AudioManager.playSe({ name: seName, volume: 90, pitch: sePitch, pan: 0 });
  }

  function playDrowsinessEffect(particle) {
    //眠気の兆候
    const particleName = "bubble_w";
    particle.particlePlay(0, particleName, "screen", "def", "screen");
    particle.particleUpdate([particleName, "color", "#ff00e9", "#86e3ff"]);
    particle.particleUpdate([particleName, "frequency", "0.05"]);
    particle.particleUpdate([particleName, "emitterLifetime", "3"]);
    particle.particleUpdate([particleName, "fluctuation", "45", "0.5"]);
    particle.particleUpdate([
      particleName,
      "scale",
      "0",
      "0.3@0.2",
      "2@0.95",
      "0.8"
    ]);
    particle.particleUpdate([particleName, "lifetime", "5", "7"]);
    particle.particleUpdate([particleName, "blendMode", "0"]);
    $gameScreen.startFlash([85, 200, 255, 200], 60);
    const seName = "Saint1";
    const sePitch = getRandomIndex(26) + 50;
    AudioManager.playSe({ name: seName, volume: 90, pitch: sePitch, pan: 0 });
  }

  function playAdultTextEffect(particle) {
    const seName = "Magic2";
    AudioManager.playSe({ name: seName, volume: 100, pitch: 70, pan: 0 });
    $gameScreen.startFlash([136, 0, 0, 150], 60);
    particle.particlePlay(0, "htext_dispray1", "screen", "def", "screen");
    particle.particlePlay(0, "htext_dispray2", "screen", "def", "screen");
  }

  function playHypnosisEffect(particle) {
    //催眠掛かる
    $gameScreen.startFlash([255, 119, 255, 204], 60);
    const seName = "Saint1";
    AudioManager.playSe({ name: seName, volume: 100, pitch: 130, pan: 0 });
    $gameScreen.startFlash([136, 0, 0, 150], 60);
    const particleName = "explode_cp_4";
    particle.particlePlay(0, particleName, "screen", "def", "spriteset");
    particle.particleUpdate([particleName, "color", "#242fff", "#f1ff59"]);
    particle.particleUpdate([particleName, "scale", "1", "0.7"]);
    particle.particleUpdate([particleName, "particlesPerWave", "10"]);
    particle.particleUpdate([particleName, "ring", 0, 0, 1280, 0]);
    global.filter_direct(10, 360, 10, 60);
  }

  function clearPersistentAdventureEffects(particle) {
    //クリア
    restoreScreenTone();
    const particleNamesToClear = [
      "lines_width1",
      "lines_width2",
      "lines_width3",
      "lines_width4",
      "lines_height1",
      "lines_height2",
      "lines_height3",
      "lines_height4",
      "lines_heightSB",
      "lines_heightS",
      "lines_sp1",
      "shower_event",
      "cloud_w_front",
      "actor_particleLight",
      "enemy_particleDark",
      "cloud_w",
      "hologram_screen",
      "lifeStorm_screen"
    ];
    for (const particleName of particleNamesToClear) {
      particle.particleClear(particleName);
    }
  }

  function setHorizontalSpeedLines(particle) {
    particle.particleSet(0, "lines_width1", "screen", "def", "above");
    particle.particleSet(0, "lines_width4", "screen", "def", "screen");
    particle.particleSet(0, "lines_width2", "screen", "def", "screen");
    particle.particleSet(0, "lines_width3", "screen", "def", "spriteset");
  }

  function setVerticalSpeedLines(particle) {
    particle.particleSet(0, "lines_height1", "screen", "def", "spriteset");
    particle.particleSet(0, "lines_height4", "screen", "def", "spriteset");
    particle.particleSet(0, "lines_height2", "screen", "def", "spriteset");
    particle.particleSet(0, "lines_height3", "screen", "def", "spriteset");
  }

  function setRisingParticles(particle) {
    //下から粒子
    particle.particleSet(0, "lines_heightSB", "screen", "def", "spriteset"); //下から粒子
    particle.particleSet(0, "lines_heightS", "screen", "def", "spriteset"); //下から粒子
  }

  function setPersistentConcentrationLines(particle) {
    //集中線永続
    const particleName = "lines_sp1"; //集中線永続
    $gameScreen.startFlash([255, 255, 255, 200], 120);
    const seName = "Wind1";
    AudioManager.playSe({ name: seName, volume: 90, pitch: 120, pan: 0 });
    particle.particleSet(0, particleName, "screen", "def", "spriteset");
  }

  function setShowerEffect(particle) {
    //シャワー
    const particleName = "shower_event"; //シャワー
    const seName = "z_Shower";
    AudioManager.playSe({ name: seName, volume: 90, pitch: 120, pan: 0 });
    particle.particleSet(0, particleName, "screen", "def", "spriteset");
  }

  function setForegroundClouds(particle) {
    particle.particleSet(0, "cloud_w_front", "weather", "def", "spriteset");
  }

  function setActorLightParticles(particle) {
    $gameScreen.startFlash([255, 255, 255, 200], 120);
    const seName = "Up1";
    AudioManager.playSe({ name: seName, volume: 90, pitch: 110, pan: 0 });
    const particleName = "actor_particleLight";
    particle.particleSet(0, particleName, "weather", "def", "spriteset");
    particle.particleUpdate([particleName, "rect", -700, 400, 1300, 768]);
  }

  function setEnemyDarkParticles(particle) {
    $gameScreen.startFlash([0, 0, 0, 200], 120);
    const seName = "Down4";
    AudioManager.playSe({ name: seName, volume: 90, pitch: 90, pan: 0 });
    const particleName = "enemy_particleDark";
    particle.particleSet(0, particleName, "weather", "def", "spriteset");
    particle.particleUpdate([particleName, "rect", -700, 400, 1300, 768]);
  }

  function setWeatherClouds(particle) {
    //天候:雲
    particle.particleSet(0, "cloud_w", "weather", "def", "spriteset"); //天候:雲
  }

  function setLifeStormEffect(particle) {
    //生命の嵐
    particle.particleSet(0, "hologram_screen", "screen", "def", "spriteset");
    particle.particleSet(0, "lifeStorm_screen", "screen", "def", "spriteset");
  }

  function clearStagingFilters() {
    //消去
    const filterNamesToClear = [
      "zettyou",
      "brainwashing",
      "sepia",
      "gunya1",
      "noise1",
      "bokasi",
      "dokun",
      "glitch1"
    ];
    for (const filterName of filterNamesToClear) {
      $gameMap.eraseFilter(filterName);
    }
  }

  function playClimaxShockwave(xValue, yValue, strengthValue) {
    const map = $gameMap;

    //絶頂
    $gameScreen.startFlash([255, 119, 255, 204], 60);
    const filterName = "zettyou";
    map.createFilter(filterName, "shockwave", 0, "screen");
    map.setFilter(filterName, [xValue, yValue, -1, 50, 200, 1.3]);
    map.setFilterAddiTime(filterName, strengthValue);
    map.eraseFilterAfterMove(filterName);
  }

  function playBrainwashingShockwave(xValue, yValue, strengthValue) {
    const map = $gameMap;

    //洗脳
    $gameScreen.startFlash(
      [255, 119, 255, 204],
      FLASH_DURATION_BY_STRENGTH[strengthValue] || 180
    );
    const filterName = "brainwashing";
    map.createFilter(filterName, "shockwave", 0, "screen");
    let seParams;
    let sePitch;
    if (strengthValue >= 0.04) {
      map.setFilter(filterName, [xValue, yValue, -1, 200, 300, 1]);
      seParams = ["ZH_sticky2", 100, 100];
      sePitch = getRandomIndex(26) + Number(seParams[2]);
      $gameScreen.startShake(7, 7, 60);
    } else {
      map.setFilter(filterName, [xValue, yValue, -1, 30, 160, 1]);
      seParams = ["Saint1", 75, 50];
      sePitch = getRandomIndex(26) + Number(seParams[2]);
    }
    AudioManager.playSe({
      name: seParams[0],
      volume: Number(seParams[1]),
      pitch: sePitch,
      pan: 0
    });
    map.setFilterAddiTime(filterName, strengthValue);
  }

  function playTwistFilter(xValue, yValue) {
    const map = $gameMap;

    //グニャ～
    AudioManager.playSe({ name: "Z_BlackOut", volume: 80, pitch: 50, pan: 0 });
    const filterName = "gunya1";
    map.createFilter(filterName, "twist", 0, "screen");
    map.setFilter(filterName, [xValue, yValue, 0, 0]);
    for (const twistOffset of [2, 4, 6, 8, 10]) {
      map.moveFilterQueue(
        filterName,
        [xValue, yValue, 1280, twistOffset],
        twistOffset == 10 ? 800 : 180
      );
    }
  }

  function setOldFilmFilter() {
    //oldfilm
    const filterName = "sepia";
    $gameMap.createFilter(filterName, "oldfilm", 0, "screen");
  }

  function setNoiseFilter(xValue) {
    const map = $gameMap;

    //ノイズ発生
    const filterName = "noise1";
    map.createFilter(filterName, "noise", 0, "screen");
    map.setFilter(filterName, [xValue]);
  }

  function animateNoiseFilter(xValue, yValue) {
    //ノイズ濃さ
    $gameMap.moveFilterQueue("noise1", [xValue], yValue);
  }

  function setBlurFilter(xValue) {
    const map = $gameMap;

    //ぼかし
    const filterName = "bokasi";
    map.createFilter(filterName, "blur", 0, "screen");
    map.setFilter(filterName, [xValue]);
  }

  function animateBlurFilter(xValue, yValue) {
    //ぼかし濃さ
    $gameMap.moveFilterQueue("bokasi", [xValue], yValue);
  }

  function playHeartbeatFilter(xValue, yValue, strengthValue) {
    const map = $gameMap;

    //
    const filterName = "dokun";
    map.createFilter(filterName, "zoomblur", 0, "screen");
    map.setFilter(filterName, [xValue, yValue, 0, 0.5]);
    map.moveFilterQueue(filterName, [xValue, yValue, 0, 0], strengthValue);
    map.eraseFilterAfterMove(filterName);
    let sePitch = 100;
    if (strengthValue <= 10) {
      sePitch = 150;
    } else if (strengthValue >= 60) {
      sePitch = 50;
    } else if (strengthValue >= 40) {
      sePitch = 80;
    } else if (strengthValue >= 30) {
      sePitch = 90;
    }
    AudioManager.playSe({
      name: "Z_HeartBeat",
      volume: 90,
      pitch: sePitch,
      pan: 0
    });
    $gameScreen.startFlash([255, 255, 255, sePitch], strengthValue);
  }

  function playGlitchFilter(xValue, yValue, strengthValue) {
    const map = $gameMap;

    //グリッチｳｪｲﾄのみ
    const filterName = "glitch1";
    const seedValue = 2; //getRandomIndex(11) + 5;
    const offsetValue = xValue == 1000 ? getRandomIndex(360) : xValue;
    const scaleValue = yValue == 1000 ? getRandomIndex(11) : yValue;
    map.createFilter(filterName, "glitch", 0, "screen");
    map.moveFilterQueue(
      filterName,
      [seedValue, 100, offsetValue, scaleValue, 0],
      strengthValue
    );
    map.eraseFilterAfterMove(filterName);
    AudioManager.playSe({
      name: "Z_CGDispray",
      volume: 20,
      pitch: 150,
      pan: 0
    });
  }

  function clearElementPresentation(particle, pictureId) {
    //消去
    picture_fade1(pictureId - 1, "fadeOut", "102", 60, 5);
    picture_fade1(pictureId + 1, "fadeOut", "102", 60, 5);
    const particleNamesToClear = [
      "sparks_w2",
      "petal_w",
      "lines_width3",
      "stardust_w",
      "bubble_w",
      "diamonddust_w",
      "black_particle_w",
      "ether_sp"
    ];
    for (const particleName of particleNamesToClear) {
      particle.particleClear(particleName);
    }
  }

  function setPassiveElementParticle(particle, passiveStateId) {
    //ステート対応粒子
    const particleName =
      PARTICLE_NAME_BY_PASSIVE_STATE_ID[passiveStateId] || "ether_sp";
    particle.particleSet(0, particleName, "screen", "def", "spriteset");
  }

  function showElementParallaxPictures(
    pictureId,
    passiveStateId,
    pictureYOffset
  ) {
    const screen = $gameScreen;

    //遠景画像
    if (passiveStateId >= 1) {
      const parallaxPath = "/img/parallaxes/Scene_Element_" + passiveStateId;
      screen.showPicture(
        pictureId - 1,
        parallaxPath,
        1,
        640,
        384 + pictureYOffset,
        100,
        100,
        200,
        1
      );
      picture_fade1(pictureId - 1, "fadeIn", "102", 60, 5);
      hcg_piston(pictureId - 1, 7, 1, 2);
      screen.showPicture(
        pictureId + 1,
        parallaxPath,
        1,
        640,
        384 + pictureYOffset,
        100,
        100,
        50,
        1
      );
      picture_fade1(pictureId + 1, "fadeIn", "102", 60, 5);
      hcg_piston(pictureId + 1, 7, 1, 2);
    }
  }

  function announceSkillMasteryRank(
    actorIdOrMessageText,
    skillId,
    masteryLevel
  ) {
    //最初
    const actor = $gameActors.actor(actorIdOrMessageText);
    if (!actor) return;
    if (!$gameSwitches.value(SWITCH.RECOLLECTION_SKIP)) {
      actor.setSkillMasteryLevel(skillId, masteryLevel);
    }
    const actorName = colorTaggedText(26, actor.name());
    const skillName = colorTaggedText(27, `<\\sin[${skillId}]>`);
    const skillLevel = colorTaggedText(10, `${masteryLevel}`);
    global.valueWordSet0 = `${actorName}の${skillName}ランクが${skillLevel}になった…。`;
    global.adv_partDirectPlay(19);
  }

  function announceCustomMasteryMessage(actorIdOrMessageText) {
    //文字列
    global.valueWordSet0 = actorIdOrMessageText;
    global.adv_partDirectPlay(19);
  }

  function finishMasteryAnnouncement() {
    const screen = $gameScreen;

    //締め
    global.adv_partDirectPlay(0);
    picture_fade1(108, "fadeOut", "Hscene005", 120, 5);
    screen.movePicture(109, 1, 640 - 200, 384, 100, 100, 0, 0, 120);
    screen.movePicture(110, 1, 640 - 200, 384, 100, 100, 0, 0, 120);
  }
  function setAmbientMapWeather(particle, particleTarget) {
    const isDungeon = $gameSwitches.value(SWITCH.DUNGEON);
    const isOutdoors = $gameSwitches.value(SWITCH.OUTDOORS);
    const isNight = $gameSwitches.value(SWITCH.NIGHT);

    if (isDungeon && $gameSwitches.value(SWITCH.INDOORS)) {
      setIndoorDungeonFog(particle, particleTarget);
    }
    if (isDungeon && isOutdoors) {
      setOutdoorDungeonFogShadow(particle, particleTarget);
    }
    if (
      $gameSwitches.value(SWITCH.WORLD_MAP) ||
      $gameSwitches.value(SWITCH.BRIDGE)
    ) {
      setWorldMapSkyParticles(particle, particleTarget);
    } else {
      if ($gameSwitches.value(SWITCH.MORNING) && isOutdoors) {
        setMorningCloudShadows(particle, particleTarget);
      }
    }
    if ($gameSwitches.value(SWITCH.FIELD) && isNight) {
      const particleName = "stardust_w"; //スターダスト。野外屋外フィールド
      particle.particleSet(0, particleName, particleTarget, "def", "99");
    }
    if ($gameSwitches.value(SWITCH.DAYTIME) && isOutdoors) {
      setDaytimeSunFlare(particle, particleTarget);
    }
    if (isNight && isOutdoors) {
      setNightLightLeaks(particle, particleTarget);
    }
  }

  function setIndoorDungeonFog(particle, particleTarget) {
    const fogAlpha = global.valueWeather[WEATHER.FOG_ALPHA];
    const fogScale = global.valueWeather[WEATHER.FOG_SCALE];
    const fogSpeed = global.valueWeather[WEATHER.FOG_SPEED];

    const particleName = "fog_w"; //薄いフォグ
    particle.particleSet(0, particleName, particleTarget, "def", "99");
    particle.particleUpdate([
      particleName,
      "alpha",
      "0",
      fogAlpha + "@0.05",
      fogAlpha + "@0.9",
      "0"
    ]);
    particle.particleUpdate([
      particleName,
      "scale",
      String(fogScale),
      fogScale + "@0.5",
      String(fogScale)
    ]);
    particle.particleUpdate([
      particleName,
      "speed",
      String(fogSpeed),
      String(fogSpeed)
    ]);
  }

  function setOutdoorDungeonFogShadow(particle, particleTarget) {
    const fogShadowAlpha = global.valueWeather[WEATHER.FOG_SHADOW_ALPHA];
    const fogShadowSpeed = global.valueWeather[WEATHER.FOG_SHADOW_SPEED];
    const fogShadowScale = global.valueWeather[WEATHER.FOG_SHADOW_SCALE];

    const particleName = "fog_shadow_w"; //モヤの影
    particle.particleSet(0, particleName, particleTarget, "def", "99");
    particle.particleUpdate([
      particleName,
      "alpha",
      "0",
      fogShadowAlpha + "@0.05",
      fogShadowAlpha + "@0.9",
      "0"
    ]);
    particle.particleUpdate([
      particleName,
      "speed",
      String(fogShadowSpeed),
      String(fogShadowSpeed)
    ]);
    particle.particleUpdate([
      particleName,
      "scale",
      String(fogShadowScale),
      fogShadowScale + "@0.5",
      String(fogShadowScale)
    ]);
  }

  function setWorldMapSkyParticles(particle, particleTarget) {
    const flashScale = global.valueWeather[WEATHER.FLASH_SCALE];
    const cloudSpeed = global.valueWeather[WEATHER.CLOUD_SPEED];
    const cloudAlpha = global.valueWeather[WEATHER.CLOUD_ALPHA];

    //全体マップと艦橋マップ
    let particleName = "flash_s"; //太陽光のフラッシュ
    particle.particleSet(0, particleName, particleTarget, "def", "99");
    particle.particleUpdate([
      particleName,
      "pos",
      String(global.valueWeather[WEATHER.FLASH_X]),
      -600
    ]);
    particle.particleUpdate([
      particleName,
      "alpha",
      "0",
      global.valueWeather[WEATHER.FLASH_ALPHA] + "@0.2",
      "0"
    ]);
    particle.particleUpdate([
      particleName,
      "scale",
      String(flashScale),
      String(flashScale)
    ]);
    particleName = "cloud_w"; //天候:雲
    particle.particleSet(0, particleName, particleTarget, "def", "99");
    particle.particleUpdate([
      particleName,
      "speed",
      String(cloudSpeed),
      String(cloudSpeed)
    ]);
    particle.particleUpdate([
      particleName,
      "alpha",
      "0",
      cloudAlpha + "@0.05",
      cloudAlpha + "@0.9",
      "0"
    ]);
    particleName = "particle_w2"; //空域図浮遊パーティクル
    particle.particleSet(0, particleName, particleTarget, "def", "99");
    particle.particleUpdate([
      particleName,
      "speed",
      String(global.valueWeather[WEATHER.FLOATING_SPEED]),
      "10"
    ]);
  }

  function setDaytimeSunFlare(particle, particleTarget) {
    const flareAlpha = global.valueWeather[WEATHER.FLARE_ALPHA];
    const flareScale = global.valueWeather[WEATHER.FLARE_SCALE];

    const particleName = "flare_s"; //太陽光のフレア
    particle.particleSet(0, particleName, particleTarget, "def", "99");
    particle.particleUpdate([
      particleName,
      "pos",
      String(global.valueWeather[WEATHER.FLARE_X]),
      -600
    ]);
    particle.particleUpdate([
      particleName,
      "alpha",
      "0",
      flareAlpha + "@0.2",
      flareAlpha + "@0.8",
      "0"
    ]);
    particle.particleUpdate([
      particleName,
      "scale",
      String(flareScale),
      String(flareScale)
    ]);
  }

  function setNightLightLeaks(particle, particleTarget) {
    const nightLeakScale = global.valueWeather[WEATHER.NIGHT_LEAK_SCALE];
    const coloredLeakScale = global.valueWeather[WEATHER.COLORED_LEAK_SCALE];

    let particleName = "light_leak_s"; //淡いライトリーク。夜の街。
    particle.particleSet(0, particleName, particleTarget, "def", "99");
    particle.particleUpdate([
      particleName,
      "alpha",
      "0",
      global.valueWeather[WEATHER.NIGHT_LEAK_ALPHA] + "@0.1",
      "0"
    ]);
    particle.particleUpdate([
      particleName,
      "scale",
      String(nightLeakScale),
      String(nightLeakScale)
    ]);
    particleName = "light_leak_s2"; //青&緑のライトリーク
    particle.particleSet(0, particleName, particleTarget, "def", "99");
    particle.particleUpdate([
      particleName,
      "alpha",
      "0",
      global.valueWeather[WEATHER.COLORED_LEAK_ALPHA] + "@0.1",
      "0"
    ]);
    particle.particleUpdate([
      particleName,
      "scale",
      String(coloredLeakScale),
      coloredLeakScale + "@0.5",
      String(coloredLeakScale)
    ]);
  }

  function getEntryAnnouncementText(effectTypeId, entryId, entry) {
    const escapeCode = effectTypeId === 14 ? "IIN" : "SIN";
    const entryName = colorTaggedText(
      2,
      "\x1b" + escapeCode + "[" + entryId + "]"
    );
    const title = colorTaggedText(
      16,
      effectTypeId === 14 ? "称号" : $dataSystem.skillTypes[entry.stypeId]
    );
    switch (effectTypeId) {
      case 14:
      case 15:
        return title + `＜${entryName}＞獲得！`;
      case 16:
        return title + `＜${entryName}＞忘却…`; 
      default:
        return "";
    }
  }
  function setMorningCloudShadows(particle, particleTarget) {
    const cloudShadowSpeed = global.valueWeather[WEATHER.CLOUD_SHADOW_SPEED];
    const cloudShadowAlpha = global.valueWeather[WEATHER.CLOUD_SHADOW_ALPHA];
    const dappledAlpha = global.valueWeather[WEATHER.DAPPLED_ALPHA];
    const dappledSpeed = global.valueWeather[WEATHER.DAPPLED_SPEED];

    let particleName = "cloud_shadow_w"; //雲の影
    particle.particleSet(0, particleName, particleTarget, "def", "99");
    particle.particleUpdate([
      particleName,
      "speed",
      String(cloudShadowSpeed),
      String(cloudShadowSpeed)
    ]);
    particle.particleUpdate([
      particleName,
      "alpha",
      "0",
      cloudShadowAlpha + "@0.05",
      cloudShadowAlpha + "@0.9",
      "0"
    ]);
    particleName = "dappled_r1"; //木漏れ日[weather]
    particle.particleSet(0, particleName, particleTarget, "def", "99");
    particle.particleUpdate([
      particleName,
      "alpha",
      "0",
      dappledAlpha + "@0.4",
      dappledAlpha + "@0.6",
      "0"
    ]);
    particle.particleUpdate([
      particleName,
      "scale",
      String(global.valueWeather[WEATHER.DAPPLED_MIN_SCALE]),
      String(global.valueWeather[WEATHER.DAPPLED_MAX_SCALE])
    ]);
    particle.particleUpdate([
      particleName,
      "speed",
      String(dappledSpeed),
      String(dappledSpeed)
    ]);
  }
})(this);
