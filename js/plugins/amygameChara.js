/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){

//☆☆キャラチップに一言台詞chara_oneWord(ピクチャID,イベントID,テキストピクチャID,待機F,X揺れ配列,Y揺れ配列,台詞配列[,フォントサイズ]);
chara_oneWord = function (pictureId, eventId, textPictureId, waitFrames, randomXOffsets, randomYOffsets, lineCandidates, fontSize) {

  picture_motion1("smooth", [0]);

  const randomLine = lineCandidates[getRandomIndex(lineCandidates.length)];
  $gameScreen.setDTextPicture(randomLine, textPictureId);
  $gameScreen.dWindowFrame = 'ON';
  if (fontSize != 0) $gameScreen.setDtextFont(fontSize);
  $gameScreen.dTextAlign = 1;

  const anchor = charaSpeechAnchor(eventId);
  const offsetX = randomXOffsets[getRandomIndex(randomXOffsets.length)];
  const offsetY = randomYOffsets[getRandomIndex(randomYOffsets.length)];
  const pictureX = anchor.x + offsetX;
  const pictureY = anchor.y + offsetY;
  $gameScreen.showPicture(pictureId, "", 1, pictureX, pictureY, 50, 50, 255, 0);
  $gameScreen.movePicture(pictureId, 1, pictureX, pictureY, 150, 150, 0, 0, waitFrames);

};

//プレイヤー（イベント）の向き対応座標x,y,id1が2で正面,8が背後,4が左,6が右
// Returns the tile directly in front of `event` for the requested facing id as
// [x, y]. facingId is a direction constant (2/4/6/8); any other value leaves the
// point on the event's own tile.
// valueDirectionPointX / valueDirectionPointY are still assigned because
// amygameSettei.js declares them as part of the project's shared value* state.
// x/y deltas for "the tile facingId looks at", per the event's own facing.
const CHARA_DIRECTION_DELTAS = {
  2: { 2: [0, 1], 4: [-1, 0], 6: [1, 0], 8: [0, -1] },
  8: { 2: [0, -1], 4: [1, 0], 6: [-1, 0], 8: [0, 1] },
  4: { 2: [1, 0], 4: [0, 1], 6: [0, -1], 8: [-1, 0] },
  6: { 2: [-1, 0], 4: [0, -1], 6: [0, 1], 8: [1, 0] }
};
event_charaDirectionPoint = function (event, facingId) {

  const facingDeltas = CHARA_DIRECTION_DELTAS[facingId];
  const delta = facingDeltas ? facingDeltas[event.direction()] : null;
  const pointX = event._realX + (delta ? delta[0] : 0);
  const pointY = event._realY + (delta ? delta[1] : 0);
  valueDirectionPointX = pointX;
  valueDirectionPointY = pointY;
  return [pointX, pointY];

};

//マップイベントのリセット
//リスポーンイベントは消去し、セルフスイッチC/Dを戻す
map_reset1 = function () {

  const mapId = $gameMap.mapId();
  $gameSystem.savePrefabEventCondition(mapId);
  $gameSwitches.setValue(140, false);
  $gameSwitches.setValue(156, false);
  for (const event of $gameMap.events()) {
    const eventId = event.eventId();
    const eventData = event.event();
    if (eventData && eventData.meta['Respawn']) {
      $gameMap.eraseEvent(eventId);
      continue;
    }
    $gameSelfSwitches.setValue([mapId, eventId, "C"], false);
    $gameSelfSwitches.setValue([mapId, eventId, "D"], false);
  }

};

//主観イベントの現在位置にプレイヤーを設置してシーン終了event_PlayerArrangement($gameVariables.value(530));
event_PlayerArrangement = function (eventIndex) {

  const speakerEvent = charaEventFromSlot(eventIndex);
  if (speakerEvent && !$gameSwitches.value(29)) {
    const directionPoint = event_charaDirectionPoint(speakerEvent, 0);
    $gamePlayer.setDirection(speakerEvent.direction());
    $gameVariables.setValue(171, [$gameMap.mapId(), directionPoint[0], directionPoint[1]]);
  } else {
    $gameVariables.setValue(171, 0);
  }
  $gameVariables.setValue(528, 100);

};

event_charaZanzou = function (sourceEventId, charaSlotId) {

  const sourceEvent = $gameMap.event(sourceEventId);
  if (!sourceEvent) return;
  const graphicName = sourceEvent.characterName();
  const graphicIndex = Number(sourceEvent.characterIndex());
  const sourceDirection = Number(sourceEvent.direction());
  $gameMap.spawnEvent(195, Number(sourceEvent._realX), Number(sourceEvent._realY), true);
  const ghostEventId = $gameMap.getLastSpawnEventId();
  const ghostEvent = ghostEventId ? $gameMap.event(ghostEventId) : null;
  if (!ghostEvent) return;
  ghostEvent.setImage(graphicName, graphicIndex);
  ghostEvent.setDirection(sourceDirection);
  ghostEvent.setTone(30, 30, 255);
  ghostEvent.setOpacity(200);
  ghostEvent.setBlendMode(1);
  charaSetSlotEventId(charaSlotId, ghostEventId);

};

//キャラをその場に固定event_charaRoot(this._eventId)
event_charaRoot = function (eventId) {

  const char = $gameMap.event(eventId);
  if (!char) return;
  char.forceMoveRoute({
    "list": [{ "code": 15, "parameters": [600] }, { "code": 0 }],
    "repeat": true,
    "skippable": true
  });

};

//キャラのインディケーター消去とアクティブメッセージ停止event_charaPreset(this._eventId)
event_charaPreset = function (eventId) {

  const char = $gameMap.event(eventId);
  if (!char) return;
  char.clearIndicators();
  char._indData.ref = true;
  $gameSystem.setMapActiveMessageEnabled(false);

};

//NPCグラ設定
map_npcGraphicSet = function () {

  const npcGraphic = {
    name: 'npc',
    index: getRandomIndex(6) + 1,
    moveSpeed: getRandomIndex(3) + 2,
    moveType: 5,
    patterns: [0, 8]
  };
  if ($gameSwitches.value(203)) applyOutdoorNpcGraphic(npcGraphic);//屋外
  if ($gameSwitches.value(282)) setNpcGraphicKind(npcGraphic, 'npcSwimsuit', getRandomIndex(4) + 1, getRandomIndex(3) + 2);//浜辺
  if ($gameSwitches.value(242)) applyCastleNpcGraphic(npcGraphic);//城
  if ($gameSwitches.value(276)) setNpcGraphicKind(npcGraphic, 'npcOrder', 1, getRandomIndex(2) + 2);//城終盤
  if ($gameSwitches.value(261)) setNpcGraphicKind(npcGraphic, 'npcOrder', 1, getRandomIndex(2) + 2);//秩序
  if ($gameSwitches.value(246)) setNpcGraphicKind(npcGraphic, 'npcMaid', 1, getRandomIndex(2) + 2);//貴族
  if ($gameSwitches.value(300)) setNpcGraphicKind(npcGraphic, 'npcDoctor', 1, getRandomIndex(2) + 2);//病院
  if ($gameSwitches.value(235) || $gameSwitches.value(237)) {
    setNpcGraphicKind(npcGraphic, 'Actor', getRandomIndex(3) + 1, getRandomIndex(2) + 2);//ギルドと武器防具屋
  }
  if ($gameSwitches.value(232)) {//富豪
    setNpcGraphicKind(npcGraphic, 'npcFugou', 3, getRandomIndex(2) + 2);
    npcGraphic.patterns = [0, 4];
  }
  if ($gameSwitches.value(230)) setNpcGraphicKind(npcGraphic, 'BB_akunin', 5, getRandomIndex(2) + 2);//スラム悪人
  writeNpcGraphic(npcGraphic);

  if (!$gameSwitches.value(15)) return;//夜
  $gameVariables.setValue(241, $gameSwitches.value(203) ? getRandomIndex(5) + 1 : 0);//屋外のみ

};

//全体マップで消去が必要な場合
worldMap_eraseSelect = function () {

  const mainQuestProgress = Number($gameVariables.value(135));
  const questProgressValues = $gameVariables.value(173);
  if (!Array.isArray(questProgressValues)) return;
  if (!Number.isInteger(mainQuestProgress)) return;
  if (mainQuestProgress < 0 || mainQuestProgress >= questProgressValues.length) return;

  const mapId = $gameMap.mapId();
  for (const eventData of $gameMap.events()) {
    const event = eventData.event();
    if (!event || event.meta['WorldNotErase']) continue;
    const eventMQProgress = event.meta['MQProgress'];
    if (eventMQProgress && Number(eventMQProgress) === mainQuestProgress) continue;
    $gameSelfSwitches.setValue([mapId, eventData.eventId(), 'C'], true);
  }

};

//マップNPC配置セット
//NPCの位置設定。変数173へのpush順はCommonEvent 299の判定順に影響するため
//降順(IDの大きい方から)を保つ。
map_npcPositionSet = function () {

  $gameVariables.setValue(173, []);
  const mapId = $gameMap.mapId();
  const npcEventIds = $gameMap.events().map(function (event) {
    return event.eventId();
  }).sort(function (idA, idB) {
    return idB - idA;
  });
  for (const npcEventId of npcEventIds) {
    map_npcPositionSetEvent(npcEventId, mapId);
  }

};

map_npcPositionSetEvent = function (id, mapId) {
  const event = $gameMap.event(id);
  if (!event) return;
  const eventData = event.event();
  if (!eventData) return;

  if (eraseClearedNpcEvent(event, eventData, id, mapId)) return;
  const meta = eventData.meta;
  if (meta['MQProgress']) $gameVariables.value(173).push(Number(meta['MQProgress']));
  applyNpcDecorationGraphic(event, meta);

  // The remaining rules only apply to events that actually show a graphic.
  if (!event.characterName()) return;
  applyNpcBossGraphic(event, meta);
  applyNpcCharalight(event, eventData, meta);
  applyQuestSelfSwitches(meta, mapId, id);
  if (npcShouldErase(event, meta)) {
    $gameMap.eraseEvent(id);
    return;
  }
  applyNpcPlacement(event, meta, id);
};

//ボスマップのキャラグラをＣＧで設定
const BOSS_CHARA_GURA_SCALE_STEPS = [-1, 0, 1, 0];
boss_charaGuraCGSet = function (valueBossCharaGura) {

  const bossCharaEvent = $gameMap.event(valueBossCharaGura[0]);
  if (!bossCharaEvent) return;
  bossCharaEvent.changeImage(valueBossCharaGura[1]);
  bossCharaEvent.forceMoveRoute({
    "list": buildBossCharaGuraRoute(valueBossCharaGura),
    "repeat": true,
    "skippable": true
  });

};

const NPC_RESPAWN_DIRECTIONS = [2, 4, 6, 8];//生成したNPCの初期向き候補
//NPC動的生成。0マップ最初。1任意タイミング
const NPC_RESPAWN_SOURCE_EVENT_IDS = [52, 55];//テンプレ元イベントID
map_npcRespawn = function (respawnModeId, requestedSourceEventId) {

  if (valueRegionMapArray[1] < 1) return;
  const spawnCount = resolveNpcRespawnCount(respawnModeId);
  if (!canSpawnOnCurrentMap(spawnCount)) return;

  let skipAccumulator = 0;
  for (let spawnIndex = 1; spawnIndex <= spawnCount; spawnIndex++) {
    let sourceEventId = requestedSourceEventId;
    if (sourceEventId == 0) {
      map_npcGraphicSet();
      sourceEventId = NPC_RESPAWN_SOURCE_EVENT_IDS[getRandomIndex(2)];
    }
    const spawnedNpcEvent = spawnRandomNpcEvent(sourceEventId);
    if (!spawnedNpcEvent) continue;
    applyNpcRespawnSettings(spawnedNpcEvent, respawnModeId, sourceEventId);
    $gameVariables.setValue(235, $gameVariables.value(235) + 1);
    skipAccumulator += [1, 2, 1, 2, 1, 1, 2][getRandomIndex(7)];
    if (spawnIndex + skipAccumulator >= spawnCount) break;
  }

};

//エネミー動的生成。0通常。1エロ。map_enemyRespawn(0);
const ENEMY_RESPAWN_SETTINGS = [
  { sourceEventId: 16, maxCountVarId: 224, appearanceVarId: 222 },
  { sourceEventId: 17, maxCountVarId: 227, appearanceVarId: 226 }
];
map_enemyRespawn = function (respawnModeId) {

  if (valueRegionMapArray[1] < 1) return;
  resetEnemyKillCounterIfFull();
  const settings = ENEMY_RESPAWN_SETTINGS[respawnModeId == 0 ? 0 : 1];
  const spawnCount = resolveEnemyRespawnCount(respawnModeId, settings);
  if (!canSpawnOnCurrentMap(spawnCount)) return;

  for (let spawnIndex = 1; spawnIndex <= spawnCount; spawnIndex++) {
    const spawnedEnemyEvent = spawnRandomEnemyEvent(settings.sourceEventId);
    if (!spawnedEnemyEvent) continue;
    const enemyGraphic = dungeonEnemyGraphic();
    if (!enemyGraphic) continue;
    applyEnemyRespawnSettings(spawnedEnemyEvent, enemyGraphic, respawnModeId);
    const enemySpawnIds = $gameVariables.value(537);
    if (Array.isArray(enemySpawnIds)) enemySpawnIds.push(spawnedEnemyEvent.eventId());
    const appearanceVarId = settings.appearanceVarId;
    $gameVariables.setValue(appearanceVarId, $gameVariables.value(appearanceVarId) + 1);
  }

};

//動物動的生成設定
const ANIMAL_NIGHT_OWL_GROUPS = [
  { regionIndex: 1, graphics: ["ZanimalForestNightOwl1"], conditions: [62, [3, 4], [5], 0, 0, 3, [0], [1]] },
  { regionIndex: 2, graphics: ["ZanimalForestNightOwl2"], conditions: [63, [1], [1], 0, 0, 3, [0], [2]] }
];
const ANIMAL_WATERSIDE_GROUP = { graphics: ["ZannimalWatersideCrab1", "ZannimalWatersideFrog2"], conditions: [59, [3, 4], [2, 3], 0, 0, 3, [3], [3]] };
const ANIMAL_WILD_GROUP = {
  graphics: ["ZanimalWildCow1", "ZanimalWilddeer1", "ZanimalWildMonkey1", "ZanimalWildBoar1", "ZanimalWildBigCat1", "ZanimalWildGoat1", "ZanimalWildBear1"],
  conditions: [58, [3, 4], [2, 3, 4], 1, 0, 3, [0], [1]]
};
const ANIMAL_LIVESTOCK_GROUP = {
  graphics: ["ZanimalLivestockPig1", "ZanimalLivestockHorse1", "ZanimalLivestockCow1", "ZanimalLivestockCow2", "ZanimalLivestockGoat1", "ZanimalLivestockSheep1", "ZanimalLivestockChicken1"],
  conditions: [57, [3, 4], [2, 3, 4], 1, 0, 3, [0], [4]]
};
const ANIMAL_FISH_GROUP = { graphics: ["Zanimaltinyfish"], conditions: [47, [3, 4, 5], [4, 5], 0, 0, 3, [3], [3]] };
const ANIMAL_NIGHT_TOWN_GROUP = { graphics: ["ZanimalNight"], conditions: [56, [1, 2], [1, 2], 0, 0, 3, [0], [2]] };
const ANIMAL_BIRD_GROUP = { graphics: ["!flyingsmallbirds"], conditions: [44, [3, 4], [5], 1, 0, 3, [0], [1]] };
const ANIMAL_PET_GROUP = { graphics: ["ZanimalCat1", "ZanimalCat2", "ZanimalDog1", "ZanimalDog2", "ZanimalCat3"], conditions: [45, [2, 3, 4], [2, 3, 4], 1, 0, 3, [0], [1]] };
const ANIMAL_BUTTERFLY_GROUP = { graphics: ["ZanimalButterflys"], conditions: [46, [2, 3, 4], [5], 1, 0, 3, [0], [1]] };

map_animalGraphicSet = function (enabledFlag) {

  if (enabledFlag !== 0) return;
  const isNight = $gameSwitches.value(15);
  spawnNightOwlAnimals(enabledFlag, isNight);
  if ($gameSwitches.value(365) && valueRegionMapArray[3] >= 1) spawnAnimalGroup(enabledFlag, ANIMAL_WATERSIDE_GROUP);//水棲
  if ($gameSwitches.value(364) && valueRegionMapArray[1] >= 1) spawnAnimalGroup(enabledFlag, ANIMAL_WILD_GROUP);//野生動物
  if (valueRegionMapArray[4] >= 1) spawnAnimalGroup(enabledFlag, ANIMAL_LIVESTOCK_GROUP);//家畜動物
  if ($gameSwitches.value(362) && !isNight && valueRegionMapArray[3] >= 1) spawnAnimalGroup(enabledFlag, ANIMAL_FISH_GROUP);//魚
  spawnTownAnimals(enabledFlag, isNight);

};

//メモで指定したオブジェクト動的生成設定
const OBJECT_WARP_POINT_EVENT_ID = 131;//ワープ魔方陣<warpPoint1:1,1,1>
const OBJECT_WARP_START_EVENT_ID = 132;//ワープ魔方陣。入口<warpStart:1,1,1>
const OBJECT_RARE_CHEST_EVENT_ID = 113;//レア宝箱
map_objectMemoSet = function () {

  const objectItem = objectMemoSourceItem();
  if (!objectItem) return;
  if (!$gameSwitches.value(201)) return;
  spawnWarpPointObjects(objectItem);
  spawnWarpStartObject(objectItem);
  spawnRareChestObject(objectItem);

};

//オブジェクト動的生成設定
const OBJECT_COIN_SPAWN_CONDITIONS = [18, [1], [1], 1, 0, 3, [0], [1]];//小銭生成
const OBJECT_WARP_SPAWN_CONDITIONS = [43, [1], [1], 1, 0, 0, [0], [1]];//転送先
const OBJECT_TREASURE_SPAWN_CONDITIONS = [86, [1], [1], 1, 0, 0, [0], [8]];
const OBJECT_TRAP_SPAWN_CONDITIONS = [20, [1], [1], 1, 0, 0, [0], [1]];//トラップ。エネミーレベル20以上
const OBJECT_CORPSE_EVENT_IDS = [70, 93, 85, 92, 91, 94, 88, 89, 95, 96];//亡骸
const OBJECT_CORPSE_SPAWN_CONDITIONS = [1, [1], [1], 1, 0, 0, [0], [1]];
const OBJECT_MATERIAL_EVENT_IDS = [-1, 78, 42, 5, 103, 104, 105, 126, 127, 128, 129];//-1 keeps slot 10 unchanged
const OBJECT_MATERIAL_WATER_SLOT_ID = 7;
const OBJECT_MATERIAL_WATER_CONDITIONS = [1, [1], [1], 1, 0, 3, [3], [3]];
const OBJECT_MATERIAL_LAND_CONDITIONS = [1, [1], [1], 1, 0, 3, [0], [1]];

map_objectGraphicSet = function () {

  if ($gameSwitches.value(124) && $gameSwitches.value(238)) return;//イベント進行時と動的生成停止
  spawnCoinObjects();
  if ($gameSwitches.value(201)) {//戦闘マップ
    spawnWarpObject();
    spawnTreasureObjects();
    spawnTrapObjects();
  }
  spawnCorpseObjects();
  spawnMaterialObjects();

};

//色々動的生成設定
//const map_otherGraphicSetEndNowArray = [1, 2, 1, 1, 1, 1, 1];
//const map_otherGraphicSetEndNowArrayLen = map_otherGraphicSetEndNowArray.length;
map_otherGraphicSet = function (spawnCount, graphicNames, spawnConditions) {

  if (!spawnConditions || spawnConditions.length == 0) return null;

  let skipAccumulator = 0;
  let lastSpawnedId = null;
  const spawnedEventIds = $gameVariables.value(210);
  const end = spawnCount == 0 ? $gameVariables.value(238) : spawnCount;
  for (let i = 1; i <= end; i++) {
    const event = spawnGraphicEvent(graphicNames, spawnConditions);
    if (!event) continue;
    lastSpawnedId = event.eventId();
    spawnedEventIds.push(lastSpawnedId);
    skipAccumulator += Math.random() < 0.14 ? 2 : 1; // 14% 1 of 7
    if (i + skipAccumulator >= end) break;
  }
  return lastSpawnedId;

};

//マップイベント消去メモタグで指定
//メモタグで指定したイベントを消去。eraseEventは_eventsを書き換えるので
//events()の戻り値(毎回作られるコピー)を回す。
map_eventErase = function (metaKey) {

  for (const event of $gameMap.events()) {
    const eventData = event.event();
    if (eventData && eventData.meta[metaKey]) $gameMap.eraseEvent(event.eventId());
  }

};

//シーン時にアクターイベント生成とＩＤ記憶
//アクターを指定位置に出現。0プレイヤー用イベントID(20+actorId)
event_respawnSetA = function (charaSlotId, posX, posY, zoomFlag, direction) {

  const actor = $gameActors.actor(charaSlotId);
  if (!actor) return;
  event_respawnSetAN(charaSlotId, posX, posY, zoomFlag, direction, charaSlotId + 20, actor.characterName(), actor.characterIndex(), 0);

};

//シーン時にＮＰＣイベント生成とＩＤ記憶event_respawnSetN(11,x,y,0,'People1',0);
//NPCを指定位置に出現。0NPC用イベントID(40)
event_respawnSetN = function (charaSlotId, posX, posY, zoomFlag, imageName, imageIndex, direction) {

  event_respawnSetAN(charaSlotId, posX, posY, zoomFlag, direction, 40, imageName, imageIndex, 1);

};

/*:
 * Merged code of event_respawnSetA and event_respawnSetN
 * @function
 * @param {integer} an
*/
// an: 0 = actor (listener + zoom), 1 = NPC
event_respawnSetAN = function (charaSlotId, posX, posY, zoomFlag, direction, id0, imageName, imageIndex, an) {

  eraseEventAtPosition(posX, posY, an);

  $gameMap.spawnEvent(id0, posX, posY, true);
  const spawnedEventId = $gameMap.getLastSpawnEventId();
  charaSetSlotEventId(charaSlotId, spawnedEventId);
  const event = spawnedEventId ? $gameMap.event(spawnedEventId) : null;
  if (!event) return;

  event.setImage(imageName, imageIndex);
  if ([2, 4, 6, 8].some(function (directionValue) { return direction == directionValue; })) {
    event.setDirection(direction);
  }
  if (zoomFlag != 1) return;
  drowsepost.camera.zoom(1, 60, spawnedEventId);
  if (an === 0) $gameSystem._listenerEvent = spawnedEventId;

};

//シーン時に道具イベント生成。0一時指定ID-生成済みID指定で生成省略,1ﾌｧｲﾙ名2ｲﾝﾃﾞｯｸｽ3方向4ﾊﾟﾀｰﾝ5x6y
//シーン時に道具イベント生成。0一時指定ID-生成済みID指定で生成省略
goodsEvent_respawn = function (charaSlotId, imageName, imageIndex, direction, pattern, posX, posY) {

  const slotEventIds = charaSlotEventIds();
  let eventId = slotEventIds[charaSlotId];
  if (eventId == 0) {
    $gameMap.spawnEvent(102, posX, posY, true);
    eventId = $gameMap.getLastSpawnEventId();
    slotEventIds[charaSlotId] = eventId;
  }
  goodsEvent_imageChange(eventId, imageName, imageIndex, direction, pattern);

};

//イベントを指定してグラ変更id1ﾌｧｲﾙ名id2ｲﾝﾃﾞｯｸｽid3方向id4ﾊﾟﾀｰﾝ
//goodsEvent_imageChange(this._eventId,'Goods7',5,8,1);
//イベントの画像を向き固定で変更
goodsEvent_imageChange = function (eventId, imageName, imageIndex, direction, pattern) {

  const event = $gameMap.event(eventId);
  if (!event) return;
  applyDirectionFixedGraphic(event, imageName, imageIndex, direction, pattern);

};

//パーティメンバーのキャラチップを主人公の周囲に出現させる。16人分。集合させないキャラ用に$dataActorsメタに記述<NoPartyEntry>
const CHARA_PARTY_OFFSETS = [[1, 1], [1, -1], [1, 2], [1, -2], [-1, 1], [-1, -1], [-1, 2], [-1, -2], [2, 1], [2, -1], [2, 2], [2, -2], [-2, 1], [-2, -1], [-2, 2], [-2, -2]];
event_partyCharaEntry = function () {

  const slotEventIds = charaSlotEventIds();
  const availableOffsets = CHARA_PARTY_OFFSETS.slice();
  const firstActorId = $gameVariables.value(75);
  const lastActorId = $gameVariables.value(76);
  const leaderActorId = $gameVariables.value(530);
  for (let actorId = firstActorId; actorId <= lastActorId; actorId++) {
    const actor = $gameActors.actor(actorId);
    if (!actor || leaderActorId === actorId || !actor.isLearnedSkill(18)) continue;
    if (leaderActorId == 0) {
      placePartyCharaAroundPlayer(actorId, availableOffsets);
      continue;
    }
    placePartyCharaAroundLeader(actorId, leaderActorId, slotEventIds, availableOffsets);
  }

};

//パーティメンバーキャラチップを一括で同じ動作event_partyCharaMove(3,0); event_partyCharaMove(45,"UP: 10;");
event_partyCharaMove = function (moveRouteCode, moveRouteParameters) {

  const slotEventIds = $gameVariables.value(292);
  if (!Array.isArray(slotEventIds)) return;
  for (let slot = 1; slot <= 15; slot++) {
    const eventId = slotEventIds[slot];
    if (!(eventId >= 1)) continue;
    event_partyMoveEventForceMoveRoute(moveRouteCode, moveRouteParameters, eventId, 'Actor');
  }

};

//メモタグ指定で一括で同じ動作event_NpcCharaMove(3,0,'Actor'); event_NpcCharaMove(45,"UP: 10;",'Actor');
event_NpcCharaMove = function (moveRouteCode, moveRouteParameters, metaName) {

  for (const event of $gameMap.events()) {
    event_partyMoveEventForceMoveRoute(moveRouteCode, moveRouteParameters, event.eventId(), metaName);
  }

};

// merged forceMoveRoute of event_partyCharaMove and event_NpcCharaMove and event_NpcCharaMoveId
event_partyMoveEventForceMoveRoute = function (moveRouteCode, moveRouteParameters, eventId, metaName) {

  const event = $gameMap.event(eventId);
  if (!event) return;
  const eventData = event.event();
  if (!eventData) return;
  if (metaName !== '' && !eventData.meta[metaName]) return;

  event.forceMoveRoute({
    "list": [
      { "code": moveRouteCode, "parameters": [moveRouteParameters] },
      { "code": 0 }], "repeat": false, "skippable": true
  });

};

//id配列を指定して一括で同じ動作event_NpcCharaMoveId(3,0,eventIdArray)
event_NpcCharaMoveId = function (moveRouteCode, moveRouteParameters, eventIds) {

  if (!Array.isArray(eventIds)) return;
  for (const eventId of eventIds) {
    event_partyMoveEventForceMoveRoute(moveRouteCode, moveRouteParameters, eventId, '');
  }

};

//パーティメンバーを一括消去
event_partyCharaErase = function () {

  const slotEventIds = $gameVariables.value(292);
  if (!Array.isArray(slotEventIds)) return;
  for (let slot = 1; slot <= 15; slot++) {
    const eventId = slotEventIds[slot];
    if (!(eventId >= 1)) continue;
    if (!$gameMap.event(eventId)) continue;
    $gameMap.eraseEvent(eventId);
  }

};

//扉チップの開閉event_doorOpenClose(1,5);event_doorOpenClose(2,5);
event_doorOpenClose = function (isOpenFlag, eventId) {

  const doorEvent = $gameMap.event(eventId);
  if (!doorEvent) return;
  doorEvent.forceMoveRoute({
    "list": buildDoorMoveRoute(isOpenFlag == 1),
    "repeat": false,
    "skippable": false
  });
  event_doorOpenCloseSe(isOpenFlag, eventId);

};

//扉チップの開閉の際の効果音
event_doorOpenCloseSe = function (isOpenFlag, eventId) {

  const doorEvent = $gameMap.event(eventId);
  if (!doorEvent) return;
  const seParams = doorSeParameters(doorEvent.characterName(), doorEvent.characterIndex(), isOpenFlag == 1);
  AudioManager.playSe({ "name": seParams[0], "volume": seParams[1], "pitch": seParams[2], "pan": 0 });

};

//そのマップのNPC死体任意位置作成。ランダムはコモン162
people_bloodBodySet = function (posX, posY) {

  map_npcGraphicSet();
  $gameMap.spawnEvent(74, posX, posY, true);
  const bodyEventId = $gameMap.getLastSpawnEventId();
  const bodyEvent = bodyEventId ? $gameMap.event(bodyEventId) : null;
  if (!bodyEvent) return;
  // The original set a random 'Damage2' pattern here and then replaced it with the
  // NPC graphic; the draw is kept so the random sequence stays identical.
  getRandomIndex(2);
  applyRandomStandImageFromVariables(bodyEvent);
  bodyEvent.setDirectionFix(false);
  bodyEvent.setDirection(8);
  bodyEvent.setDirectionFix(true);
  $gameMap.spawnEvent(99, posX, posY, true);//血痕

};

//イベントメモタグでまとめてセルフスイッチevent_togetherSelf(this._eventId,'B');
//<CharaNameId>が同じイベントのセルフスイッチをまとめてONevent_togetherSelf(1,'C')
const CHARA_TOGETHER_EXCLUDED_EVENT_IDS = [301, 302, 303, 304, 305, 306, 307, 308, 309, 310];
event_togetherSelf = function (eventId, selfSwitchKey) {

  const sourceEvent = $gameMap.event(eventId);
  if (!sourceEvent) return;
  const sourceEventData = sourceEvent.event();
  if (!sourceEventData) return;
  const sourceCharaNameId = Number(sourceEventData.meta['CharaNameId']);
  const mapId = $gameMap.mapId();

  for (const event of $gameMap.events()) {
    const id = event.eventId();
    if (id == eventId) continue;
    if (CHARA_TOGETHER_EXCLUDED_EVENT_IDS.some(function (excludedEventId) { return id == excludedEventId; })) continue;
    const eventData = event.event();
    if (!eventData) continue;
    const evCharaNameId = eventData.meta['CharaNameId'];
    if (!evCharaNameId) continue;
    if (sourceCharaNameId != Number(evCharaNameId)) continue;
    $gameSelfSwitches.setValue([mapId, id, selfSwitchKey], true);
  }

};

//ｲﾝｼﾞｹｰﾀｰ発生消去event_charaIndicators(1,this._eventId,'Arrow',0,-10,3,10);
//0で0消去1ｱﾆﾒ発生,1ｲﾍﾞﾝﾄid,2ﾌｧｲﾙ名,3x4y,5枚数,6速度
//0で消去,1ｱﾆﾒ発生
event_charaIndicators = function (modeId, eventId, indicatorIcon, indicatorX, indicatorY, frameStart, frameEnd) {

  const char = $gameMap.event(eventId);
  if (!char) return;
  if (modeId == 0) {
    char.clearIndicators();
    char._indData.ref = true;
    return;
  }
  if (modeId != 1) return;
  charaSetAnimatedIndicator(char, indicatorIcon, indicatorX, indicatorY, [0, frameStart, 0, frameEnd]);

};


//動物食材指定
//動物食材指定。名前のパターン順に判定する。
const ANIMAL_DEFAULT_DROP_ITEM_ID = 1271;
const ANIMAL_SACRED_LAND_SWITCH_ID = 258;//忘れられた聖域[入口]
const ANIMAL_DROP_RULES = [
  { pattern: /Pig/, itemId: 1272 },
  { pattern: /Horse/, itemId: 1273 },
  { pattern: /Cow/, itemId: 1274 },
  { pattern: /Sheep/, itemId: 1275 },
  { pattern: /Chicken/, itemId: 1276 },
  { pattern: /Goat/, itemId: 1277 },
  { pattern: /Monkey/, itemId: 1283 },
  { pattern: /Bear/, itemId: 1278 },
  { pattern: /Deer/, itemId: 1279 },
  { pattern: /Boar/, itemId: 1280 },
  { pattern: /BigCat/, itemId: 1283 },
  { pattern: /Crab/, itemId: 1281 },
  { pattern: /Frog/, itemId: 1282 },
  { pattern: /fish/, itemId: 1286 }
];
animal_IngredientsSelect = function (eventId) {

  const animalEvent = $gameMap.event(eventId);
  if (!animalEvent) return;
  valueDropItems = animalDropItemId(animalEvent._characterName);
  valueanimalEventId = eventId;

};

//動物反応指定
const ANIMAL_REACTION_RULES = [
  { pattern: /Pig/, text: 'ブヒっ' },
  { pattern: /Horse/, se: 'Horse', pitch: 100 },
  { pattern: /Cow/, se: 'Cow', pitch: 100 },
  { pattern: /Sheep/, text: 'メェっ…' },
  { pattern: /Chicken/, se: 'Chicken', pitch: 100 },
  { pattern: /Goat/, text: 'メェ～～っ' },
  { pattern: /Monkey/, text: 'ウキィっ！' },
  { pattern: /Bear/, se: 'Monster6', pitch: 80 },
  { pattern: /Deer/, text: 'ピィっ' },
  { pattern: /Boar/, text: 'ブルルゥっ！' },
  { pattern: /BigCat/, se: 'Monster1', pitch: 120 },
  { pattern: /Crab/, text: 'カニィっ' },
  { pattern: /Frog/, se: 'Frog', pitch: 100 },
  { pattern: /fish/ }//魚はリアクション無し
];
animal_ActionSelect = function (eventId) {

  const animalEvent = $gameMap.event(eventId);
  if (!animalEvent) return;
  const reaction = findAnimalReaction(animalEvent._characterName);
  if (!reaction) return;
  if (reaction.se) AudioManager.playSe({ "name": reaction.se, "volume": 70, "pitch": reaction.pitch, "pan": 0 });
  if (reaction.text) valueanimalEvent2Id = reaction.text;

};

//エネミーステートでドロップ
//enemy_drop = function(user,enemy){

//};

//}());


// ---------------------------------------------------------------------------
// 共通ヘルパー (最適化版で追加)
// ---------------------------------------------------------------------------
// Screen anchor for the character speech pictures: 70 px above the event, or the
// screen centre when the event id does not exist.
const CHARA_SPEECH_OFFSET_Y = 70;
const CHARA_SPEECH_FALLBACK_X = 640;
const CHARA_SPEECH_FALLBACK_Y = 384;
function charaSpeechAnchor(eventId) {
  const event = $gameMap.event(eventId);
  if (!event) return { x: CHARA_SPEECH_FALLBACK_X, y: CHARA_SPEECH_FALLBACK_Y };
  const zoomScale = $gameScreen.zoomScale();
  return { x: event.screenX() * zoomScale, y: (event.screenY() - CHARA_SPEECH_OFFSET_Y) * zoomScale };
}

// Variable 292 keeps the spawned event id per character slot.
const CHARA_SLOT_COUNT = 51;
function charaSlotEventIds() {
  const slotEventIds = $gameVariables.value(292);
  if (Array.isArray(slotEventIds)) return slotEventIds;
  const newSlotEventIds = Array(CHARA_SLOT_COUNT).fill(0);
  $gameVariables.setValue(292, newSlotEventIds);
  return newSlotEventIds;
}
function charaSetSlotEventId(charaSlotId, eventId) {
  charaSlotEventIds()[charaSlotId] = eventId;
}
function charaEventFromSlot(charaSlotId) {
  const slotEventIds = $gameVariables.value(292);
  if (!Array.isArray(slotEventIds)) return null;
  return $gameMap.event(slotEventIds[charaSlotId]);
}

// NPC graphic state lives in variables 33 (name), 35 (index), 37 (move speed),
// 34 (move type) and 36 ([pattern base, pattern count]).
function setNpcGraphicKind(npcGraphic, name, index, moveSpeed) {
  npcGraphic.name = name;
  npcGraphic.index = index;
  npcGraphic.moveSpeed = moveSpeed;
}
function writeNpcGraphic(npcGraphic) {
  $gameVariables.setValue(33, npcGraphic.name);
  $gameVariables.setValue(35, npcGraphic.index);
  $gameVariables.setValue(37, npcGraphic.moveSpeed);
  $gameVariables.setValue(34, npcGraphic.moveType);
  $gameVariables.setValue(36, npcGraphic.patterns);
}
// 屋外: one in eleven NPCs wears the castle costume.
function applyOutdoorNpcGraphic(npcGraphic) {
  if (getRandomIndex(11) < 9) return;
  setNpcGraphicKind(npcGraphic, 'npcCastle', 1, getRandomIndex(3) + 2);
}
// 城: half castle servants, half maids.
function applyCastleNpcGraphic(npcGraphic) {
  if ([1, 2][getRandomIndex(2)] == 1) {
    setNpcGraphicKind(npcGraphic, 'npcCastle', getRandomIndex(2) + 1, getRandomIndex(2) + 2);
    return;
  }
  setNpcGraphicKind(npcGraphic, 'npcMaid', 1, getRandomIndex(2) + 2);
}
// Random stand-still graphic from the NPC graphic variables set by map_npcGraphicSet.
function applyRandomStandImageFromVariables(event) {
  const graphicKind = $gameVariables.value(33);
  const graphicIndex = $gameVariables.value(35);
  const patternBase = $gameVariables.value(36);
  const graphicPattern = Math.floor(Math.random() * patternBase[1]) + patternBase[0];
  event.setImage(graphicKind + graphicIndex, graphicPattern);
}

// ---------------------------------------------------------------------------
// map_npcPositionSetEvent helpers
// ---------------------------------------------------------------------------
// Cleared events (self switch A) are erased unless switch 209 shows the whole map
// or the event carries <NoAClear>.
function eraseClearedNpcEvent(event, eventData, id, mapId) {
  if (!$gameSelfSwitches.value([mapId, id, 'A']) || $gameSwitches.value(209)) return false;
  if (!eventData.meta['NoAClear']) $gameMap.eraseEvent(id);
  return true;
}
function applyNpcBossGraphic(event, meta) {
  if (meta['BossGura']) applyNpcBossEnemyGraphic(event, meta['BossGura']);
  if (meta['BossGura2']) applyNpcBossGura2(event, meta['BossGura2']);
}
// <BossGura:...,enemyId> uses the enemy's <BossGura> note (or 20,30,0.2) and the
// enemy's <BossEnemy> costume name.
function applyNpcBossEnemyGraphic(event, bossGuraMeta) {
  const bossGuraValues = bossGuraMeta.split(',');
  const enemyData = $dataEnemies[Number(bossGuraValues[1])];
  if (!enemyData || !enemyData.meta['BossEnemy']) return;
  const enemyBossGuraValues = enemyData.meta['BossGura'] ? enemyData.meta['BossGura'].split(',') : [20, 30, 0.2];
  valueBossCharaGura = [
    event.eventId(),
    enemyData.meta['BossEnemy'].split(',')[2],
    Number(enemyBossGuraValues[0]),
    Number(enemyBossGuraValues[1]),
    Number(enemyBossGuraValues[2])
  ];
  boss_charaGuraCGSet(valueBossCharaGura);
}
// <BossGura2:image,scale,wait,delta>
function applyNpcBossGura2(event, bossGura2Meta) {
  const bossGura2Values = bossGura2Meta.split(',');
  valueBossCharaGura = [
    event.eventId(),
    bossGura2Values[0],
    Number(bossGura2Values[1]),
    Number(bossGura2Values[2]),
    Number(bossGura2Values[3])
  ];
  boss_charaGuraCGSet(valueBossCharaGura);
}
// <Charalight:r,g,b,radius>. The original called moveLight on the immutable map
// data object (event.event()), which throws because the lighting plugin only
// patches Game_Event; the fallback keeps a data-object patch working.
function applyNpcCharalight(event, eventData, meta) {
  if (!meta['Charalight']) return;
  const lightValues = meta['Charalight'].split(',');
  const lightTarget = typeof event.moveLight === 'function' ? event : eventData;
  lightTarget.moveLight(Number(lightValues[0]), Number(lightValues[1]), Number(lightValues[2]), Number(lightValues[3]));
}

// ---------------------------------------------------------------------------
// Decoration graphics (food, alcohol, plates, prostitutes, stand NPCs, corpses)
// ---------------------------------------------------------------------------
// [sheetIndex, pattern, direction, patternIndex] for the shared 'food_' sheets;
// the alcohol sheet is fixed, so its tuples are [pattern, direction, patternIndex].
const NPC_DECORATION_RULES = [
  { metaKey: 'decorationFood', imagePrefix: 'food_', sheetFromTuple: true, charaparas: [[1, 5, 8, 1], [1, 5, 8, 2], [1, 6, 8, 0], [1, 6, 8, 1], [2, 0, 2, 1], [2, 1, 2, 2], [2, 0, 6, 0], [2, 0, 6, 1]] },
  { metaKey: 'Alcol', imagePrefix: 'food_2', sheetFromTuple: false, charaparas: [[0, 6, 0], [0, 6, 1], [0, 6, 2], [1, 4, 1], [1, 4, 2], [2, 4, 0], [2, 4, 1]] },
  { metaKey: 'foodPlate', imagePrefix: 'food_', sheetFromTuple: true, charaparas: [[2, 0, 8, 0], [2, 0, 8, 1], [2, 0, 8, 1], [2, 1, 8, 0], [2, 1, 8, 1], [2, 1, 8, 2], [2, 2, 8, 0], [2, 2, 8, 1]] }
];
const NPC_BLOOD_ANGLES = [45, 135, -45, -135];
const NPC_BLOOD_SPRITE_OFFSETS = { 45: [20, 20], 135: [20, 40], '-45': [-20, 20], '-135': [-20, 40] };
const NPC_BLOOD_SPAWN_EVENT_ID = 99;

function applyNpcDecorationGraphic(event, meta) {
  if (meta['foodC']) {
    applyNpcFoodRandomGraphic(event);
    return;
  }
  for (const rule of NPC_DECORATION_RULES) {
    if (!meta[rule.metaKey]) continue;
    applyNpcCharaparaGraphic(event, rule, rule.charaparas[getRandomIndex(rule.charaparas.length)]);
    return;
  }
  if (meta['NpcProstitute']) {
    event.setImage('npcNakidWoman' + (getRandomIndex(3) + 1), getRandomIndex(7) + 0);
    return;
  }
  if (meta['NpcProstituteGuest']) {
    event.setImage('npcFugou1', getRandomIndex(4) + 4);
    return;
  }
  if (meta['StandNPC']) {
    map_npcGraphicSet();
    applyRandomStandImageFromVariables(event);
    return;
  }
  if (meta['BloodBody']) applyNpcBloodBody(event);
}
// <foodC>: random food pattern, facing and animation pattern (no un-fix first).
function applyNpcFoodRandomGraphic(event) {
  const foodImageName = 'food_1';
  const foodPattern = getRandomIndex(7) + 0;
  event.setImage(foodImageName, foodPattern);
  event.setDirection([2, 4, 6, 8][getRandomIndex(4)]);
  const pattern = [0, 1, 2][getRandomIndex(3)];
  event.setPattern(pattern);
  event._originalPattern = pattern;
  event.setDirectionFix(true);
}
// Direction-fixed decoration sprite from a per-rule tuple; the actual sprite update
// is delegated to applyDirectionFixedGraphic (shared with goodsEvent_imageChange).
function applyNpcCharaparaGraphic(event, rule, charapara) {
  const imageName = rule.sheetFromTuple ? rule.imagePrefix + charapara[0] : rule.imagePrefix;
  const imageIndex = rule.sheetFromTuple ? charapara[1] : charapara[0];
  const direction = rule.sheetFromTuple ? charapara[2] : charapara[1];
  const pattern = rule.sheetFromTuple ? charapara[3] : charapara[2];
  applyDirectionFixedGraphic(event, imageName, imageIndex, direction, pattern);
}
function applyDirectionFixedGraphic(event, imageName, imageIndex, direction, pattern) {
  event.setDirectionFix(false);
  event.setImage(imageName, imageIndex);
  event.setDirection(direction);
  event.setPattern(pattern);
  event._originalPattern = pattern;
  event.setDirectionFix(true);
}
// <BloodBody>: stand graphic plus a blood splash event offset by the body angle.
function applyNpcBloodBody(event) {
  map_npcGraphicSet();
  applyRandomStandImageFromVariables(event);
  const bloodAngle = NPC_BLOOD_ANGLES[getRandomIndex(NPC_BLOOD_ANGLES.length)];
  event.setAngle(bloodAngle);
  event.setDirection(8);
  $gameMap.spawnEvent(NPC_BLOOD_SPAWN_EVENT_ID, event.x, event.y, true);
  const bloodEventId = $gameMap.getLastSpawnEventId();
  const bloodEvent = bloodEventId ? $gameMap.event(bloodEventId) : null;
  if (!bloodEvent) return;
  // YEP sprite offsets are applied to the blood event directly (no implicit globals).
  const spriteOffset = NPC_BLOOD_SPRITE_OFFSETS[bloodAngle] || [0, 0];
  bloodEvent._spriteOffsetX = (bloodEvent._spriteOffsetX || 0) + spriteOffset[0];
  bloodEvent._spriteOffsetY = (bloodEvent._spriteOffsetY || 0) + spriteOffset[1];
}

// ---------------------------------------------------------------------------
// Erase rules
// ---------------------------------------------------------------------------
function npcShouldErase(event, meta) {
  return isNpcHiddenByPerspective(meta)
    || applyNpcSceneIndicator(event, meta)
    || isNpcHiddenByStartSwitches(meta)
    || isNpcHiddenByEndSwitches(meta)
    || isNpcHiddenByStartCloth(meta)
    || isNpcHiddenByStartValue(meta)
    || isNpcHiddenByEndValue(meta)
    || isNpcHiddenByEraseMain(meta)
    || isNpcHiddenByEssOn(meta)
    || isNpcHiddenByEraseItem(meta);
}
// Shared "erase while all listed switches are off" predicate used by both the
// <PerspectiveA> (ids offset by 440, 0 = unused slot) and <EvStartSw> (ids <= 1
// unused) tags. The event stays as soon as one entry is unused or its switch is on.
function isNpcHiddenBySwitchList(metaValue, unusedUpTo, switchIdOffset) {
  if (!metaValue) return false;
  for (const entry of metaValue.split(',')) {
    const switchValue = Number(entry);
    if (switchValue <= unusedUpTo) return false;
    if ($gameSwitches.value(switchValue + switchIdOffset)) return false;
  }
  return true;
}
// <PerspectiveA:...>
function isNpcHiddenByPerspective(meta) {
  return isNpcHiddenBySwitchList(meta['PerspectiveA'], 0, 440);
}
// <EvSceneSet:itemId,keepOnComplete,indicatorKind>. Returns true when the event is
// erased; otherwise shows the requested indicator (♡ / 笑 / ! / …).
const NPC_SCENE_INDICATORS = { 0: 'h', 1: 'h1', 2: 't', 3: 'e' };
const NPC_SCENE_DEFAULT_INDICATOR = 'h';//不明な番号は元コード同様 'h'
function applyNpcSceneIndicator(event, meta) {
  const evSceneSet = meta['EvSceneSet'];
  if (!evSceneSet) return false;
  const sceneValues = evSceneSet.split(',');
  const sceneItemId = Number(sceneValues[0]);
  let incidenceSwitchId = 0;
  let completionSwitchId = 0;
  if (sceneItemId >= 401 && sceneItemId <= 500) {
    incidenceSwitchId = sceneItemId + 800;
    completionSwitchId = sceneItemId + 900;
  }
  if (sceneItemId >= 501 && sceneItemId <= 600) {
    incidenceSwitchId = sceneItemId + 500;
    completionSwitchId = sceneItemId + 600;
  }
  const sceneItem = $dataItems[sceneItemId];
  if (sceneItem) {
    if (sceneItem.meta['AddEventIncidenceSwi']) incidenceSwitchId = Number(sceneItem.meta['AddEventIncidenceSwi']);
    if (sceneItem.meta['AddEventCompSwi']) completionSwitchId = Number(sceneItem.meta['AddEventCompSwi']);
  } else {
    incidenceSwitchId = 0;
  }
  let isHidden = incidenceSwitchId <= 1 || $gameSwitches.value(incidenceSwitchId);
  if (Number(sceneValues[1]) == 1 && $gameSwitches.value(completionSwitchId)) isHidden = false;
  if (!isHidden) return true;

  const indicatorIconKind = Number(sceneValues[2]);
  const indicatorIcon = indicatorIconKind == -1 ? null : (NPC_SCENE_INDICATORS[indicatorIconKind] || NPC_SCENE_DEFAULT_INDICATOR);
  if (indicatorIcon) charaSetAnimatedIndicator(event, indicatorIcon, 0, -10, [0, 5, 0, 5]);
  return false;
}
// <EvStartSw:...>
function isNpcHiddenByStartSwitches(meta) {
  return isNpcHiddenBySwitchList(meta['EvStartSw'], 1, 0);
}
// <EvEndSw:...> erased when any listed switch is on.
function isNpcHiddenByEndSwitches(meta) {
  const endSwitchValues = meta['EvEndSw'];
  if (!endSwitchValues) return false;
  return endSwitchValues.split(',').some(function (endSwitchValue) {
    const switchId = Number(endSwitchValue);
    return switchId >= 1 && $gameSwitches.value(switchId);
  });
}
// <EvStartCloth:slot,clothId>: erased when the outfit slot does not match.
function isNpcHiddenByStartCloth(meta) {
  const startClothValues = meta['EvStartCloth'];
  if (!startClothValues) return false;
  const clothValues = startClothValues.split(',');
  const clothSlot = Number(clothValues[0]);
  if (clothSlot < 1) return false;
  return npcOutfitSlotValue(clothSlot, 41) != Number(clothValues[1]);
}
function npcOutfitSlotValue(clothSlot, index) {
  const outfitData = $gameVariables.value(440 + clothSlot);
  if (!Array.isArray(outfitData)) return undefined;
  return outfitData[index];
}
// <EvStartVal:variableId,minimum>.
function isNpcHiddenByStartValue(meta) {
  const startValue = meta['EvStartVal'];
  if (!startValue) return false;
  const startValueValues = startValue.split(',');
  const variableId = Number(startValueValues[0]);
  if (variableId < 1) return false;
  return $gameVariables.value(variableId) < Number(startValueValues[1]);
}
// <EvEndVal:variableId,threshold>.
function isNpcHiddenByEndValue(meta) {
  const endValue = meta['EvEndVal'];
  if (!endValue) return false;
  const endValueValues = endValue.split(',');
  const variableId = Number(endValueValues[0]);
  if (variableId < 1) return false;
  return $gameVariables.value(variableId) >= Number(endValueValues[1]);
}
// <EvEraseMain:progress,...> erased when the main quest progress is listed.
function isNpcHiddenByEraseMain(meta) {
  const eraseMainValues = meta['EvEraseMain'];
  if (!eraseMainValues) return false;
  const mainQuestProgress = $gameVariables.value(135);
  return eraseMainValues.split(',').some(function (eraseMainValue) {
    return Number(eraseMainValue) >= 1 && mainQuestProgress == Number(eraseMainValue);
  });
}
// <EvESSOn:itemId,...> erased while a scene is started but not completed.
function isNpcHiddenByEssOn(meta) {
  const essOnValues = meta['EvESSOn'];
  if (!essOnValues) return false;
  return essOnValues.split(',').some(function (essOnValue) {
    const sceneItemId = Number(essOnValue);
    if (sceneItemId >= 501 && sceneItemId <= 600) {
      return $gameSwitches.value(sceneItemId + 500) && !$gameSwitches.value(sceneItemId + 600);
    }
    if (sceneItemId >= 401 && sceneItemId <= 500) {
      return $gameSwitches.value(sceneItemId + 800) && !$gameSwitches.value(sceneItemId + 900);
    }
    return false;
  });
}
// <EvEraseItem:itemId,...> erased while the party holds any listed item.
function isNpcHiddenByEraseItem(meta) {
  const eraseItemValues = meta['EvEraseItem'];
  if (!eraseItemValues) return false;
  return eraseItemValues.split(',').some(function (eraseItemValue) {
    const itemId = Number(eraseItemValue);
    if (itemId < 1) return false;
    return $gameParty.hasItem($dataItems[itemId], true);
  });
}
// <QuestSet:itemId> mirrors the quest arrays into self switches A (held) and B (available).
function applyQuestSelfSwitches(meta, mapId, id) {
  const questItemId = meta['QuestSet'];
  if (!questItemId) return;
  const questIndex = questItemId - 800;
  const isQuestAvailable = Array.isArray(valueQuestArray5) && valueQuestArray5[questIndex] == 1;
  $gameSelfSwitches.setValue([mapId, id, 'B'], isQuestAvailable);
  $gameSelfSwitches.setValue([mapId, id, 'A'], $gameParty.hasItem($dataItems[Number(questItemId)], true));
}

// ---------------------------------------------------------------------------
// Placement rules (only for events that stay on the map)
// ---------------------------------------------------------------------------
const NPC_INDICATOR_SLOT_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
function applyNpcPlacement(event, meta, id) {
  applyNpcFixedPosition(event, meta);
  applyNpcActiveMessage(event, meta, id);
  applyNpcSwitchIndicators(event, meta);
}
// <PSet:x,y>
function applyNpcFixedPosition(event, meta) {
  if (!meta['PSet']) return;
  const positionValues = meta['PSet'].split(',');
  event.locate(Number(positionValues[0]), Number(positionValues[1]));
}
// <Amassage:variableId,text>
function applyNpcActiveMessage(event, meta, id) {
  if (!meta['Amassage']) return;
  const messageValues = meta['Amassage'].split(',');
  $gameVariables.setValue(Number(messageValues[0]), messageValues[1]);
  $gameMap.forceDisplayActiveMessage(id);
}
// <Hsw1:x,y> / <H1sw1:x,y> ... <Hsw9>/<H1sw9>: indicator icon while the target
// switch is on and the blocking switch is off.
function applyNpcSwitchIndicators(event, meta) {
  for (const indicatorVariant of ['', '1']) {
    if (!meta['H' + indicatorVariant + 'sw1']) continue;
    for (const indicatorSlotId of NPC_INDICATOR_SLOT_IDS) {
      const indicatorMeta = meta['H' + indicatorVariant + 'sw' + indicatorSlotId];
      if (!indicatorMeta) continue;
      const indicatorSwitchValues = indicatorMeta.split(',');
      const targetSwitchId = Number(indicatorSwitchValues[0]);
      const blockingSwitchId = Number(indicatorSwitchValues[1]);
      if (!$gameSwitches.value(targetSwitchId) || $gameSwitches.value(blockingSwitchId)) continue;
      charaSetAnimatedIndicator(event, 'h' + indicatorVariant, 0, -20, [0, 5, 0, 5]);
    }
  }
}
// Shared indicator setup used by the NPC tags and event_charaIndicators.
function charaSetAnimatedIndicator(event, indicatorIcon, indicatorX, indicatorY, frames) {
  event.setIndicators(indicatorIcon, 0, false, 0, 0, "", 0, false, false, 0, true, indicatorX, indicatorY);
  event._indData.ref = true;
  event._indData.fontSize = 28;
  event._indData.animated = true;
  event._indData.frames = frames;
}

// The scale script used to read the mutable global array at run time; the numbers
// are baked in now so a later reassignment cannot change a running route.
function buildBossCharaGuraRoute(bossCharaGura) {
  const eventId = bossCharaGura[0];
  const baseScale = bossCharaGura[2];
  const waitFrames = bossCharaGura[3];
  const scaleDelta = bossCharaGura[4];
  const list = [];
  for (const scaleStep of BOSS_CHARA_GURA_SCALE_STEPS) {
    const scaledSize = baseScale + scaleDelta * scaleStep;
    list.push({ "code": 45, "parameters": [bossCharaGuraScaleScript(eventId, waitFrames, scaledSize)] });
    list.push({ "code": 15, "parameters": [waitFrames] });
  }
  list.push({ "code": 0 });
  return list;
}
function bossCharaGuraScaleScript(eventId, waitFrames, scaledSize) {
  return '$gameMap.event(' + eventId + ').startScale(' + waitFrames + ',' + scaledSize + ',' + scaledSize + ');';
}

// Spawn budget for mode 0 (map entry). Variable 241 is the map's pedestrian
// setting; holidays add 1-3, daytime adds 0-2 and night uses a tenth of it.
function resolveNpcRespawnCount(respawnModeId) {
  if (respawnModeId != 0) return 1;
  const mapPedestrianCount = $gameVariables.value(241);
  let spawnCount = mapPedestrianCount;
  if ($gameSwitches.value(16)) spawnCount += getRandomIndex(3) + 1;//休日
  if ($gameSwitches.value(14)) spawnCount += getRandomIndex(3);//昼
  if ($gameSwitches.value(15)) spawnCount = Math.round(mapPedestrianCount / 10);//夜
  if ($gameVariables.value(235) > spawnCount) spawnCount = 0;
  return spawnCount;
}
// Shared gate for NPC and enemy respawning: map setup finished, not in battle,
// something to spawn and the map not listed in variable 202.
function canSpawnOnCurrentMap(spawnCount) {
  if (!$gameSwitches.value(140)) return false;//マップ最初の処理終了
  if ($gameParty.inBattle()) return false;
  if (spawnCount < 1) return false;
  return !isDynamicSpawnDisabledMap();
}
function isDynamicSpawnDisabledMap() {
  const disabledMapIds = $gameVariables.value(202);
  if (!Array.isArray(disabledMapIds)) return false;
  const mapId = $gameMap.mapId();
  return disabledMapIds.some(function (disabledMapId) { return disabledMapId == mapId; });
}
function spawnRandomNpcEvent(sourceEventId) {
  const conditionMap = {};
  conditionMap.passable = 1;
  conditionMap.screen = 0;
  conditionMap.collided = 3;
  conditionMap.terrainTags = [0];
  conditionMap.regionIds = [1];
  const spawnedEventId = $gameMap.spawnEventRandom(sourceEventId, conditionMap, true);
  if (!spawnedEventId) return null;
  return $gameMap.event(spawnedEventId) || null;
}
function applyNpcRespawnSettings(npcEvent, respawnModeId, sourceEventId) {
  if ($gameSwitches.value(377)) npcEvent._priorityType = 1;//茂み属性反映
  const graphicKind = $gameVariables.value(33);//キャラグラ名
  const graphicIndex = $gameVariables.value(35);//キャラグラ番号
  const patternBase = $gameVariables.value(36);
  npcEvent.setImage(graphicKind + graphicIndex, Math.floor(Math.random() * patternBase[1]) + patternBase[0]);
  npcEvent.setDirection(NPC_RESPAWN_DIRECTIONS[getRandomIndex(NPC_RESPAWN_DIRECTIONS.length)]);
  // Mode 0 keeps pedestrians invisible until they fade in on the map.
  npcEvent.setOpacity(respawnModeId == 0 ? 0 : 255);
  npcEvent.setMoveSpeed($gameVariables.value(37));//移動速度
  // Template event 52 walks straight, the other template uses the map default.
  const moveFrequency = sourceEventId == 52 ? [3, 4, 5][getRandomIndex(3)] : $gameVariables.value(34);
  npcEvent.setMoveFrequency(moveFrequency);
}

// Variable 335 (killed) resets once the dungeon quota (334) is reached, unless the
// same-map switch keeps the count.
function resetEnemyKillCounterIfFull() {
  if (!$gameSwitches.value(655)) return;
  if ($gameSwitches.value(216)) return;
  if ($gameVariables.value(335) < $gameVariables.value(334)) return;
  $gameVariables.setValue(335, 0);
}
// Remaining quota: max (224/227) minus current (222/226), capped by the dungeon
// quota and by the night-only (mode 1) switch held in variable 236.
function resolveEnemyRespawnCount(respawnModeId, settings) {
  const maxOccurNum = $gameVariables.value(settings.maxCountVarId);
  const appearance = $gameVariables.value(settings.appearanceVarId);
  let spawnCount = maxOccurNum - appearance;
  if (appearance > maxOccurNum) spawnCount = 0;
  if ($gameVariables.value(335) + appearance >= $gameVariables.value(334)) spawnCount = 0;
  if (respawnModeId == 1 && !$gameSwitches.value($gameVariables.value(236))) spawnCount = 0;
  return spawnCount;
}
function dungeonEnemyGraphic() {
  const dungeonItem = $dataItems[$gameVariables.value(240)];
  return dungeonItem ? dungeonItem.meta.EnemyGraphic : null;
}
function spawnRandomEnemyEvent(sourceEventId) {
  const conditionMap = {};
  conditionMap.passable = 1;
  conditionMap.screen = 0;
  conditionMap.collided = 3;
  conditionMap.terrainTags = [1];
  conditionMap.regionIds = [1];
  const spawnedEventId = $gameMap.spawnEventRandom(sourceEventId, conditionMap, true);
  if (!spawnedEventId) return null;
  return $gameMap.event(spawnedEventId) || null;
}
function applyEnemyRespawnSettings(enemyEvent, enemyGraphic, respawnModeId) {
  const graphicValues = enemyGraphic.split(',');
  enemyEvent._trigger = 2;//event touch
  enemyEvent.setImage(graphicValues[0], Number(graphicValues[1]));
  enemyEvent.setOpacity(255);
  if ($dataItems[$gameVariables.value(240)].meta.BigEnemyGraphic) enemyEvent.setScale(150, 150);
  const movement = rollEnemyMovementRates();
  enemyEvent.setMoveSpeed(movement.speed);
  enemyEvent.setMoveFrequency(movement.frequency);
  if ($gameSwitches.value(360)) enemyEvent.setScale(150, 150);
  if (respawnModeId == 1) enemyEvent.setTone(50, -100, 50);
  applyEnemyRespawnMoveRoute(enemyEvent, respawnModeId);
  if ($gameSwitches.value(207) && (!$gameSwitches.value(236) || !$gameSwitches.value(155))) {
    enemyEvent.requestAnimation(226);
  }
}
function rollEnemyMovementRates() {
  let speed = getRandomIndex(4) + 1;
  let frequency = getRandomIndex(4) + 1;
  if ($gameSwitches.value(363)) {//移動速度早い
    speed = getRandomIndex(3) + 3;
    frequency = getRandomIndex(3) + 3;
  }
  if ($gameSwitches.value(368)) {//移動速度遅い
    speed = getRandomIndex(2) + 1;
    frequency = getRandomIndex(2) + 1;
  }
  return { speed: speed, frequency: frequency };
}
// The route code is drawn before the mode checks so the random sequence stays
// identical to the original, even for the chase-mode enemies that ignore it.
function applyEnemyRespawnMoveRoute(enemyEvent, respawnModeId) {
  const moveRouteCode = rollEnemyMoveRouteCode();
  if (respawnModeId == 1 || $gameSwitches.value(493)) return;
  if ($gameSwitches.value(228)) {//エネミー移動固定
    enemyEvent.forceMoveRoute({
      "list": [{ "code": 15, "parameters": [600] }, { "code": 0 }], "repeat": true, "skippable": true
    });
    return;
  }
  enemyEvent.forceMoveRoute({
    "list": [{ "code": moveRouteCode }, { "code": 0 }], "repeat": true, "skippable": true
  });
}
function rollEnemyMoveRouteCode() {
  const moveRouteRandom = getRandomIndex(11);
  if (moveRouteRandom >= 9) return 10;
  if (moveRouteRandom <= 1) return 11;
  return 9;
}

function spawnAnimalGroup(enabledFlag, animalGroup) {
  map_otherGraphicSet(enabledFlag, animalGroup.graphics, animalGroup.conditions);
}
// 森梟: one random forest region decides between the two owl sheets; only at night.
function spawnNightOwlAnimals(enabledFlag, isNight) {
  if (!$gameSwitches.value(366)) return;
  const owlGroup = ANIMAL_NIGHT_OWL_GROUPS[getRandomIndex(2)];
  if (valueRegionMapArray[owlGroup.regionIndex] < 1) return;
  if (isNight) spawnAnimalGroup(enabledFlag, owlGroup);
}
// 街中・町屋外: night animals, or daytime birds plus pets and butterflies.
function spawnTownAnimals(enabledFlag, isNight) {
  if (!$gameSwitches.value(202) || !$gameSwitches.value(203) || $gameVariables.value(238) < 2) return;
  if (isNight) {
    if (valueRegionMapArray[2] >= 1) spawnAnimalGroup(enabledFlag, ANIMAL_NIGHT_TOWN_GROUP);
    return;
  }
  if (valueRegionMapArray[1] < 1) return;
  spawnAnimalGroup(enabledFlag, ANIMAL_BIRD_GROUP);//鳥
  if ($gameSwitches.value(361)) return;//動物犬猫生成カット
  spawnAnimalGroup(enabledFlag, ANIMAL_PET_GROUP);//犬猫
  spawnAnimalGroup(enabledFlag, ANIMAL_BUTTERFLY_GROUP);//蝶
}

// The dungeon information item (variable 240) wins over the town item (230).
function objectMemoSourceItem() {
  const townItemId = $gameVariables.value(230);
  const dungeonItemId = $gameVariables.value(240);
  const weaponItem = townItemId >= 1 ? $dataWeapons[townItemId] : null;
  const dungeonItem = dungeonItemId >= 1 ? $dataItems[dungeonItemId] : null;
  return dungeonItem || weaponItem || null;
}
// Spawns `eventId` only when the memo targets the current map.
function spawnMemoObjectOnCurrentMap(eventId, memoValues) {
  if (Number(memoValues[0]) != $gameMap.mapId()) return null;
  $gameMap.spawnEvent(eventId, Number(memoValues[1]), Number(memoValues[2]), true);
  return $gameMap.getLastSpawnEventId();
}
// <warpPoint1..9:mapId,x,y> - the self switch A of an already-used warp point
// comes from variable 211, indexed by the dungeon item (240).
function spawnWarpPointObjects(objectItem) {
  for (let warpPointIndex = 1; warpPointIndex <= 9; warpPointIndex++) {
    const warpPointMeta = objectItem.meta['warpPoint' + warpPointIndex];
    if (!warpPointMeta) continue;
    const warpEventId = spawnMemoObjectOnCurrentMap(OBJECT_WARP_POINT_EVENT_ID, warpPointMeta.split(','));
    if (!warpEventId) continue;
    if (objectMemoFlagValue(211, warpPointIndex) == 1) {
      $gameSelfSwitches.setValue([$gameMap.mapId(), warpEventId, 'A'], true);
    }
  }
}
// <warpStart:mapId,x,y>
function spawnWarpStartObject(objectItem) {
  if (!objectItem.meta['warpStart']) return;
  spawnMemoObjectOnCurrentMap(OBJECT_WARP_START_EVENT_ID, objectItem.meta['warpStart'].split(','));
}
// <TchestOnly:mapId,x,y> - opened state comes from variable 212.
function spawnRareChestObject(objectItem) {
  if (!objectItem.meta['TchestOnly']) return;
  const chestEventId = spawnMemoObjectOnCurrentMap(OBJECT_RARE_CHEST_EVENT_ID, objectItem.meta['TchestOnly'].split(','));
  if (!chestEventId) return;
  if (objectMemoFlagValue(212) == 1) {
    $gameSelfSwitches.setValue([$gameMap.mapId(), chestEventId, 'A'], true);
  }
}
// Reads `variableArrayId[dungeonItemId]` (and then `[index]` when given), tolerating
// missing tables - variables 211/212 are objects keyed by the dungeon item id.
function objectMemoFlagValue(variableArrayId, index) {
  const flagTable = $gameVariables.value(variableArrayId);
  if (!flagTable || typeof flagTable !== 'object') return undefined;
  const flags = flagTable[$gameVariables.value(240)];
  if (flags === undefined || flags === null) return undefined;
  if (index === undefined) return flags;
  return flags[index];
}

// Battle maps carry coins for both shop kinds while the map is big enough.
function spawnCoinObjects() {
  if ($gameVariables.value(238) < 1 || valueRegionMapArray[1] < 1) return;
  for (const shopOffset of [0, 1]) {
    if (!$gameSwitches.value(201 + shopOffset)) continue;
    const coinSpawnConditions = OBJECT_COIN_SPAWN_CONDITIONS.slice();
    coinSpawnConditions[0] = OBJECT_COIN_SPAWN_CONDITIONS[0] + shopOffset;
    map_otherGraphicSet(rollSpawnCountAroundMapSize(), 0, coinSpawnConditions);
  }
}
// Map size (variable 238) plus a -2..+1 jitter, never below one object.
function rollSpawnCountAroundMapSize() {
  const mapSize = $gameVariables.value(238);
  const candidates = [mapSize - 2, mapSize - 1, mapSize, mapSize + 1];
  const spawnCount = candidates[getRandomIndex(candidates.length)];
  return spawnCount < 1 ? 1 : spawnCount;
}
function spawnWarpObject() {
  if (valueRegionMapArray[1] < 1) return;
  map_otherGraphicSet(1, 0, OBJECT_WARP_SPAWN_CONDITIONS);
}
// Chests: one per 217 chests of the dungeon list, capped by region 8.
function spawnTreasureObjects() {
  $gameVariables.setValue(536, []);//宝箱生成Id配列
  const dungeonItemId = $gameVariables.value(240);
  const chestItemIds = $gameVariables.value(215);
  if (!Array.isArray(chestItemIds)) return;
  const dungeonChestItemIds = chestItemIds[dungeonItemId];
  if (!Array.isArray(dungeonChestItemIds) || dungeonChestItemIds.length < 1) return;
  if (valueRegionMapArray[8] < 1) return;
  const chestsPerMap = $gameVariables.value(217);
  let treasureSpawnCount = Math.ceil(dungeonChestItemIds.length / chestsPerMap);
  if (treasureSpawnCount > valueRegionMapArray[8]) treasureSpawnCount = valueRegionMapArray[8];
  const spawnedTreasureEventId = map_otherGraphicSet(treasureSpawnCount, 0, OBJECT_TREASURE_SPAWN_CONDITIONS);
  if (spawnedTreasureEventId) $gameVariables.value(536).push(spawnedTreasureEventId);
}
function spawnTrapObjects() {
  if (!$gameSwitches.value(207)) return;
  if ($gameVariables.value(238) < 3 || $gameVariables.value(270) < 20) return;
  if (valueRegionMapArray[1] < 1) return;
  map_otherGraphicSet(rollSpawnCountAroundMapSize(), 0, OBJECT_TRAP_SPAWN_CONDITIONS);
}
// 亡骸: variable 260 corpses plus half the map size, jittered by -2..+1.
function spawnCorpseObjects() {
  if ($gameVariables.value(260) < 1 || valueRegionMapArray[1] < 1) return;
  let corpseSpawnCount = $gameVariables.value(260);
  corpseSpawnCount += Math.round($gameVariables.value(238) / 2);
  corpseSpawnCount += getRandomIndex(4) - 2;
  if (corpseSpawnCount < 1) return;
  for (let corpseIndex = 1; corpseIndex <= corpseSpawnCount; corpseIndex++) {
    const corpseSpawnConditions = OBJECT_CORPSE_SPAWN_CONDITIONS.slice();
    corpseSpawnConditions[0] = OBJECT_CORPSE_EVENT_IDS[getRandomIndex(OBJECT_CORPSE_EVENT_IDS.length)];
    map_otherGraphicSet(1, 0, corpseSpawnConditions);
  }
}
// 固有素材: slots 1..10 of variable 259 place their material events.
function spawnMaterialObjects() {
  const materialValues = $gameVariables.value(259);
  if (!Array.isArray(materialValues)) return;
  const mapSize = $gameVariables.value(238);
  for (let materialSlotId = 1; materialSlotId <= 10; materialSlotId++) {
    if (!(materialValues[materialSlotId] >= 1)) continue;
    const materialSpawnCount = Math.round(mapSize) + getRandomIndex(6) + 5;
    if (materialSpawnCount < 1) continue;
    const materialId = OBJECT_MATERIAL_EVENT_IDS[materialSlotId];
    if (materialSlotId == OBJECT_MATERIAL_WATER_SLOT_ID) {
      if (valueRegionMapArray[3] < 1) continue;
      const waterConditions = OBJECT_MATERIAL_WATER_CONDITIONS.slice();
      waterConditions[0] = materialId;
      map_otherGraphicSet(materialSpawnCount, 0, waterConditions);
      continue;
    }
    if (valueRegionMapArray[1] < 1) continue;
    const landConditions = OBJECT_MATERIAL_LAND_CONDITIONS.slice();
    landConditions[0] = materialId;
    map_otherGraphicSet(materialSpawnCount, 0, landConditions);
  }
}

// Spawns one event and applies the graphic/speed/frequency of `spawnConditions`.
// Returns null when no position was found (callers must not record the id).
function spawnGraphicEvent(graphicNames, spawnConditions) {
  const conditionMap = {};
  conditionMap.passable = spawnConditions[3];
  conditionMap.screen = spawnConditions[4];
  conditionMap.collided = spawnConditions[5];
  conditionMap.terrainTags = spawnConditions[6];
  conditionMap.regionIds = spawnConditions[7];
  const spawnedEventId = $gameMap.spawnEventRandom(spawnConditions[0], conditionMap, true);
  if (!spawnedEventId) return null;
  const event = $gameMap.event(spawnedEventId);
  if (!event) return null;
  if (graphicNames) {
    event.setImage(graphicNames[getRandomIndex(graphicNames.length)], getRandomIndex(8) + 0);
  }
  event.setMoveSpeed(spawnConditions[1][Math.floor(Math.random() * spawnConditions[1].length)]);//1-6
  event.setMoveFrequency(spawnConditions[2][Math.floor(Math.random() * spawnConditions[2].length)]);//1-5
  return event;
}

// Removes a plain map event standing on the target tile so the new one fits.
function eraseEventAtPosition(posX, posY, an) {
  const existingEventId = $gameMap.eventIdXy(posX, posY);
  if (existingEventId < 1) return;
  const existingEvent = $gameMap.event(existingEventId);
  if (!existingEvent) return;
  const existingEventData = existingEvent.event();
  if (!existingEventData || existingEventData.meta['Respawn']) return;
  if (an === 0 || !existingEvent.isThrough()) $gameMap.eraseEvent(existingEventId);
}

// Removes one random offset from the pool, so no two party members share a tile.
function takeRandomOffset(availableOffsets) {
  return availableOffsets.splice(getRandomIndex(availableOffsets.length), 1)[0];
}
function placePartyCharaAroundPlayer(actorId, availableOffsets) {
  if (availableOffsets.length < 1) return;
  const positionOffset = takeRandomOffset(availableOffsets);
  event_respawnSetA(actorId, $gamePlayer.x + positionOffset[0], $gamePlayer.y + positionOffset[1], 0, 0);
}
// Tries up to 11 times to find a terrain tag 1 tile around the leader event.
function placePartyCharaAroundLeader(actorId, leaderActorId, slotEventIds, availableOffsets) {
  for (let attempt = 0; attempt <= 10; attempt++) {
    if (availableOffsets.length < 1) return;
    const leaderEvent = $gameMap.event(slotEventIds[leaderActorId]);
    if (!leaderEvent) return;
    const positionOffset = takeRandomOffset(availableOffsets);
    const targetX = leaderEvent.x + positionOffset[0];
    const targetY = leaderEvent.y + positionOffset[1];
    if ($gameMap.terrainTag(targetX, targetY) != 1) continue;
    event_respawnSetA(actorId, targetX, targetY, 0, 0);
    return;
  }
}

// Door animation: turn sideways twice, face the opening then turn back.
function buildDoorMoveRoute(isOpen) {
  const turnSideCodeA = isOpen ? 17 : 18;
  const turnSideCodeB = isOpen ? 18 : 17;
  const turnFacingCode = isOpen ? 19 : 16;
  return [
    { "code": 36 }, { "code": turnSideCodeA }, { "code": 15, "parameters": [5] },
    { "code": turnSideCodeB }, { "code": 15, "parameters": [5] },
    { "code": turnFacingCode }, { "code": 15, "parameters": [5] },
    { "code": 35 }, { "code": 15, "parameters": [5] },
    { "code": 0 }
  ];
}
const DOOR_SE_HEAVY_GATE_GRAPHICS = ['!$SF_Gate1', '!$SF_Gate3'];
const DOOR_SE_GATE_GRAPHICS = ['!$Gate1', '!$Gate2'];
const DOOR_SE_CLOTHES_GRAPHICS = ['!$fsm_Door06'];
// [name, volume, pitch] per door graphic; gates use gatePitch, everything else
// the open/close pitch of the door sound.
function doorSeParameters(characterName, characterIndex, isOpen) {
  const openPitch = isOpen ? 100 : 150;
  const gatePitch = isOpen ? 100 : 70;
  const actionName = isOpen ? 'Open' : 'Close';
  if (DOOR_SE_CLOTHES_GRAPHICS.indexOf(characterName) >= 0) return ['Z_clothesTakeOff', 100, 80];
  if (characterName == '!Door1' && characterIndex == 5) return ['Z_clothesTakeOff', 100, 80];
  if (characterName == '!Door1' && characterIndex == 6) return ['Door2', 90, openPitch];
  if (DOOR_SE_HEAVY_GATE_GRAPHICS.indexOf(characterName) >= 0) return [actionName + '3', 90, gatePitch];
  if (DOOR_SE_GATE_GRAPHICS.indexOf(characterName) >= 0) return [actionName + '3', 90, gatePitch];
  if (characterName == '!$SF_Gate2') return ['door6AutoDoorHeavy', 90, openPitch];
  return [actionName + '1', 90, openPitch];
}

// First matching animal rule wins. The original had a trailing, unreachable
// `switch 258 && /Cow/ -> 1288` branch (the generic Cow branch above always won);
// it is dropped here, so cows keep dropping 1274. Set a sacredLandItemId on the
// Cow rule to enable 1288 in the forgotten sanctuary.
function animalDropItemId(characterName) {
  const graphicName = characterName || '';
  for (const rule of ANIMAL_DROP_RULES) {
    if (!rule.pattern.test(graphicName)) continue;
    if (rule.sacredLandItemId && $gameSwitches.value(ANIMAL_SACRED_LAND_SWITCH_ID)) return rule.sacredLandItemId;
    return rule.itemId;
  }
  return ANIMAL_DEFAULT_DROP_ITEM_ID;
}
function findAnimalReaction(characterName) {
  const graphicName = characterName || '';
  for (const rule of ANIMAL_REACTION_RULES) {
    if (rule.pattern.test(graphicName)) return rule;
  }
  return null;
}
