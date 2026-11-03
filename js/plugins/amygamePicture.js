/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){

// ---------------------------------------------------------------------------
// 元コードで未宣言のまま暗黙のグローバルになっていた変数。
// amygameSettei.js / amygameHelper.js も同じ名前を読み書きするので、名前は変えない。
// 初期値は設定しない(先に読み込まれた値を壊さないため)。
// ---------------------------------------------------------------------------
var valueParallelPic1;
var valueParallelPic2;
var valueParallelPic3;
var valueParallelPic4;
var valuePicArr1;
var valuePicWait;
var valueTachieBless;
var valueTachieBless2;
var valueTachieBless3;
var valueTachieBless4;
var valueTachieBless5;
var valueTachieBless6;
var valueCharaWaitCountarray1;
var valueCharaWaitCountarray2;

//#region common
// ピクチャの走査範囲(RPG Maker MV のピクチャ ID 上限)
const PIC_SCAN_LAST_ID = 250;

// picture_fade1 の GWInfo を作らないスイッチ
const PICTURE_FADE_GWINFO_SWITCH_ID = 651;

// 高演出カットのスイッチ(呼吸・ピストン演出を止める)
const BREATH_CUT_SWITCH_ID = 45;
const PISTON_CUT_SWITCH_ID = 43;
// ブレスON/OFF の対象レイヤー数(valueTachieBless〜valueTachieBless6)
const BREATH_LAYER_LAST_ID = 6;

// 呼吸(ブレス)設定配列の並び: [揺れx, 揺れy, 頻度, 拡縮度x, 拡縮度y]
const BREATH_SETTINGS_INDEX = { offsetX: 0, offsetY: 1, frequency: 2, scaleX: 3, scaleY: 4 };

// 6 系統の呼吸コントローラ(UTSU プラグイン)。読み込み順に依存するので毎回引き直す。
function pictureBreathControllers() {
  return [UTSU.PictureBreath, UTSU.PictureBreath2, UTSU.PictureBreath3,
    UTSU.PictureBreath4, UTSU.PictureBreath5, UTSU.PictureBreath6];
}

// レイヤー番号(1〜6)に対応する呼吸コントローラ。範囲外は null。
// 引数は数値で渡される想定なので、文字列等でも動くよう数値化してから判定する。
function pictureBreathController(breathLayerId) {
  const layerId = Number(breathLayerId);
  if (!(layerId >= 1 && layerId <= BREATH_LAYER_LAST_ID)) return null;
  return pictureBreathControllers()[layerId - 1];
}

// ピクチャ 1 枚の呼吸を 6 系統すべて止める。
function disableAllPictureBreath(pictureId, picture) {
  const breathControllers = pictureBreathControllers();
  const activeFlags = [picture._breathActive, picture._breathActive2, picture._breathActive3,
    picture._breathActive4, picture._breathActive5, picture._breathActive6];

  for (let breathLayerId = 1; breathLayerId <= BREATH_LAYER_LAST_ID; breathLayerId++) {
    if (!activeFlags[breathLayerId - 1]) continue;
    breathControllers[breathLayerId - 1].off([pictureId]);
  }
}

// 呼吸設定をレイヤー別のグローバルへ保存する(他プラグインが valueTachieBlessN を読む)。
function setBreathSettings(breathLayerId, breathParams) {
  switch (Number(breathLayerId)) {
    case 1: valueTachieBless = breathParams; break;
    case 2: valueTachieBless2 = breathParams; break;
    case 3: valueTachieBless3 = breathParams; break;
    case 4: valueTachieBless4 = breathParams; break;
    case 5: valueTachieBless5 = breathParams; break;
    case 6: valueTachieBless6 = breathParams; break;
    default: break;
  }
}

// 呼吸設定を保存して、指定レイヤーの呼吸を ON にする。レイヤー範囲外なら false。
function applyBreathToLayer(pictureId, breathLayerId, breathParams) {
  const breathController = pictureBreathController(breathLayerId);
  if (!breathController) return false;

  setBreathSettings(breathLayerId, breathParams);
  breathController.on([pictureId], breathParams[BREATH_SETTINGS_INDEX.frequency]);
  return true;
}

// 1〜250 のピクチャ ID のうち、実際に表示されているものを集める。
function collectExistingPictureIds() {
  const pictureIds = [];
  for (let pictureId = 1; pictureId <= PIC_SCAN_LAST_ID; pictureId++) {
    if ($gameScreen.picture(pictureId)) pictureIds.push(pictureId);
  }
  return pictureIds;
}

// ピクチャ表示時の効果音(ピクチャ更新時の音演出と同じ音源)
const CG_DISPRAY_SE_NAME = 'Z_CGDispray';
const CG_DISPRAY_SE_PITCH = 150;
const CG_DISPRAY_SE_VOLUME_ENTRY = 20;
const CG_DISPRAY_SE_VOLUME_UPDATE = 25;

function createCgDispraySe(volume) {
  return { "name": CG_DISPRAY_SE_NAME, "volume": volume, "pitch": CG_DISPRAY_SE_PITCH, "pan": 0 };
}
//#endregion

//#region motion
//picture_motion1("smooth",[0]);
picture_motion1 = function (motionType, motionParams) {

  // 5 つのカーブ(patternX〜patternOpacity)に同じパターンを入れる。
  // getPattern は生成時の定数だけを閉じ込めた関数を返すので、1 回取得して使い回せる。
  const motionPattern = curveFunctions.getPattern(motionType, motionParams);
  curveFunctions.patternX = motionPattern;
  curveFunctions.patternY = motionPattern;
  curveFunctions.patternScaleX = motionPattern;
  curveFunctions.patternScaleY = motionPattern;
  curveFunctions.patternOpacity = motionPattern;

}

//#endregion

//#region preload
// 起動時に読み込んでおく画像(Galv の画像キャッシュ)
const PRELOAD_PICTURE_NAMES = [
  'actorrealityN', 'actorrealityR', 'actorrealitySR',
  'actorrealitySSR', 'actorrealityUR', 'actorrealityLR'
];
const PRELOAD_SYSTEM_NAMES = [
  'Window', 'Window1', 'Window2', 'Window3',
  'IconSet', 'Balloon', 'Shadow1', 'Shadow2', 'Damage', 'Damage2', 'States'
];
const PRELOAD_SYSTEM_WEAPON_PREFIX = 'Weapons';
const PRELOAD_SYSTEM_WEAPON_LAST_ID = 58;
const PRELOAD_SYSTEM_TRAILING_NAMES = ['ButtonSet', 'WindowCursor', 'Dust1', 'ActiveMessageSkin'];

picture_preload1 = function () {

  for (const pictureName of PRELOAD_PICTURE_NAMES) Galv.CACHE.load('pictures', pictureName);
  for (const systemName of PRELOAD_SYSTEM_NAMES) Galv.CACHE.load('system', systemName);

  for (let weaponId = 1; weaponId <= PRELOAD_SYSTEM_WEAPON_LAST_ID; weaponId++) {
    Galv.CACHE.load('system', PRELOAD_SYSTEM_WEAPON_PREFIX + weaponId);
  }

  for (const systemName of PRELOAD_SYSTEM_TRAILING_NAMES) Galv.CACHE.load('system', systemName);

}

//#endregion

//#region pic_1
// 登場演出(entryTypeId)の種類
const PIC_ENTRY_TYPE_MAX = 3;      // これ以下は「拡大して登場」演出
const PIC_ENTRY_TYPE_RANDOM = 3;   // 乱数で上下左右のどれかへずらして登場(いずれも 3)
const PIC_FLASH_TYPE_WHITE = 3;    // 白フラッシュ扱いの flashTypeId

// 画面外からスライドして入る時の移動軸と符号(entryTypeId 4〜7)
const PIC_ENTRY_SLIDE_DIRECTIONS = {
  4: { axis: 'y', sign: 1 },  //下から
  5: { axis: 'x', sign: -1 }, //右から
  6: { axis: 'x', sign: 1 },  //左から
  7: { axis: 'y', sign: -1 }  //上から
};
// flashTypeId が 3 以下の時は常に 100px ずらす
const PIC_SLIDE_DEFAULT_OFFSET = 100;
// flashTypeId 4 以上は「ずらす量 = flashTypeId」
const PIC_FLASH_TYPE_SLIDE_DISTANCE_MIN = 4;

const PIC_ENTRY_SCALE_NONE = 0;
const PIC_ENTRY_SCALE_NORMAL = 1;
const PIC_ENTRY_SCALE_LARGE = 2;
const PIC_ENTRY_SCALE_EXTRA = 5;
const PIC_ENTRY_SCALE_OVERRIDES = { 1: PIC_ENTRY_SCALE_NONE, 2: PIC_ENTRY_SCALE_NORMAL };
// 待ち時間が 61 フレーム以上なら大きく出して寄せる
const PIC_ENTRY_LONG_WAIT_FRAMES = 61;

// entryTypeId==3 の乱数方向ずらし量。
//NOTE: 乱数の上限は元コードと同じ 3 にする(表の 4 番目(index 3)は到達しない)
const PIC_RANDOM_ENTRY_DIRECTION_COUNT = 3;
const PIC_RANDOM_ENTRY_OFFSETS = [
  { x: 50, y: 0 },
  { x: -50, y: 0 },
  { x: 0, y: 50 },
  { x: 0, y: -50 }
];

// 残像(ゴースト)ピクチャ。id-1 に半透明で出す
const PIC_ENTRY_GHOST_HUE_DEFAULT = 200;
const PIC_ENTRY_GHOST_OPACITY_DURATION_OFFSET = 20;
const PIC_ENTRY_GHOST_START_OPACITY = 0;
const PIC_ENTRY_GHOST_OPACITY = 150;

// 登場時のフラッシュ/揺れ
const PIC_ENTRY_FLASH_WAIT_LIMIT = 60;
const PIC_ENTRY_FLASH_EFFECTS = {
  1: { color: [255, 255, 255, 204], shake: 7 },
  0: { color: [255, 119, 255, 204], shake: 5 }
};

//ピクチャ表示（通常のピクチャ表示のみ！）
pic_1 = function (flashTypeId, pictureId, pictureName, entryTypeId, scale, opacity, waitFrames, width, height, baseWidth, baseHeight) {

  // 表示位置は「画面中央 + 画像の半分」。baseWidth/baseHeight は画像の実サイズ
  const centerX = width / 2 + baseWidth / 2;
  const centerY = height / 2 + baseHeight / 2;

  const scaleMultiplier = resolvePicEntryScaleMultiplier(flashTypeId, entryTypeId, waitFrames);
  const entryOffset = resolvePicEntryOffset(flashTypeId, entryTypeId);

  // entryTypeId 3 以上は「残像付き」で、id-1 がまだ無い時だけ残像を作る
  if (entryTypeId >= PIC_ENTRY_TYPE_RANDOM) {
    showPicEntryGhost(pictureId, pictureName, centerX, centerY, entryOffset, scale * scaleMultiplier, scale, waitFrames);
  }

  $gameScreen.showPicture(pictureId, pictureName, 1,
    centerX + entryOffset.x, centerY + entryOffset.y,
    scale * scaleMultiplier, scale * scaleMultiplier, 0, 0);
  $gameScreen.movePicture(pictureId, 1, centerX, centerY, scale, scale, opacity, 0, waitFrames);

  playPicEntryFlash(flashTypeId, waitFrames);

}

// entryTypeId から倍率を決める。大きく出して寄せる演出の倍率。
function resolvePicEntryScaleMultiplier(flashTypeId, entryTypeId, waitFrames) {
  let scaleMultiplier = PIC_ENTRY_SCALE_NORMAL;

  if (entryTypeId <= PIC_ENTRY_TYPE_MAX) {
    scaleMultiplier = PIC_ENTRY_SCALE_LARGE;
    if (flashTypeId == PIC_FLASH_TYPE_WHITE) scaleMultiplier = PIC_ENTRY_SCALE_EXTRA;
  }
  if (waitFrames >= PIC_ENTRY_LONG_WAIT_FRAMES && entryTypeId <= PIC_ENTRY_TYPE_MAX) {
    scaleMultiplier = PIC_ENTRY_SCALE_EXTRA;
  }

  // 乱数で斜めに登場する時は等倍(元コードと同じく最後に上書き)
  if (entryTypeId == PIC_ENTRY_TYPE_RANDOM) return PIC_ENTRY_SCALE_NORMAL;

  // entryTypeId 1/2 は倍率を固定する(1 は 0 倍スタート)
  const fixedScaleMultiplier = PIC_ENTRY_SCALE_OVERRIDES[entryTypeId];
  if (fixedScaleMultiplier !== undefined) return fixedScaleMultiplier;
  return scaleMultiplier;
}

// entryTypeId から表示位置のずらし量を決める。
function resolvePicEntryOffset(flashTypeId, entryTypeId) {
  // 乱数方向(3)と画面外からのスライド(4〜7)は同時に成立しないので、そのまま振り分ける。
  if (entryTypeId == PIC_ENTRY_TYPE_RANDOM) return resolveRandomEntryOffset();
  return resolvePicSlideOffset(flashTypeId, entryTypeId);
}

// entryTypeId==3: 上下左右のどれかへ 50px ずらす。
function resolveRandomEntryOffset() {
  const randomDirectionIndex = getRandomIndex(PIC_RANDOM_ENTRY_DIRECTION_COUNT);
  return PIC_RANDOM_ENTRY_OFFSETS[randomDirectionIndex];
}

// entryTypeId 4〜7: 画面外から 100px(または flashTypeId)ずらした位置から入る。
function resolvePicSlideOffset(flashTypeId, entryTypeId) {
  const slideDirection = PIC_ENTRY_SLIDE_DIRECTIONS[entryTypeId];
  if (!slideDirection) return { x: 0, y: 0 };

  const slideDistance = flashTypeId >= PIC_FLASH_TYPE_SLIDE_DISTANCE_MIN
    ? flashTypeId
    : PIC_SLIDE_DEFAULT_OFFSET;

  const offsetAmount = slideDistance * slideDirection.sign;
  if (slideDirection.axis == 'x') return { x: offsetAmount, y: 0 };
  return { x: 0, y: offsetAmount };
}

// 残像ピクチャ(id-1)の表示。NOTE: 元コード同様、初期位置だけ offset を 2 倍にする。
function showPicEntryGhost(pictureId, pictureName, centerX, centerY, entryOffset, startScale, targetScale, waitFrames) {
  const ghostPictureId = pictureId - 1;
  if ($gameScreen.picture(ghostPictureId)) return;

  picture_motion1("smooth", [0]);

  $gameScreen.showPicture_hue(ghostPictureId, pictureName, resolveTachieHue(), 1,
    centerX + entryOffset.x * 2, centerY + entryOffset.y * 2,
    startScale, startScale, PIC_ENTRY_GHOST_START_OPACITY, 0);
  $gameScreen.movePicture(ghostPictureId, 1, centerX, centerY, targetScale, targetScale,
    PIC_ENTRY_GHOST_OPACITY, 0, waitFrames + PIC_ENTRY_GHOST_OPACITY_DURATION_OFFSET);
}

// 残像の色相。変数20(操作中アクター)に <tachieHue> があればその値。
function resolveTachieHue() {
  const actorId = $gameVariables.value(20);
  if (actorId < 1) return PIC_ENTRY_GHOST_HUE_DEFAULT;

  const actor = $dataActors[actorId];
  if (!actor || !actor.meta['tachieHue']) return PIC_ENTRY_GHOST_HUE_DEFAULT;
  return Number(actor.meta['tachieHue']);
}

// 登場時の効果音・フラッシュ・画面揺れ(flashTypeId 0/1 かつ短い待ち時間のみ)
function playPicEntryFlash(flashTypeId, waitFrames) {
  if (flashTypeId > 1) return;
  if (waitFrames > PIC_ENTRY_FLASH_WAIT_LIMIT) return;

  AudioManager.playSe(createCgDispraySe(CG_DISPRAY_SE_VOLUME_ENTRY));

  const flashEffect = PIC_ENTRY_FLASH_EFFECTS[flashTypeId];
  if (!flashEffect) return;

  $gameScreen.startFlash(flashEffect.color, waitFrames);
  $gameScreen.startShake(flashEffect.shake, flashEffect.shake, waitFrames / 2);
}

//#endregion

//#region pic_setArray
// valuePicArr1 の並び(他プラグインは配列そのものだけを使うので順番は変えない)
const PIC_ARRAY_INDEX = {
  pictureId: 0,
  origin: 1,
  x: 2,
  y: 3,
  scaleX: 4,
  scaleY: 5,
  opacity: 6,
  blendMode: 7,
  jitterX: 8,
  jitterY: 9,
  waitFrames: 10,
  pictureName: 11,
  ghostOpacity: 12,
  scaleAmount: 13
};
const PIC_ARRAY_LENGTH = 15;
const PIC_PARALLEL_SLOT_FIRST = 1;
// 残像ピクチャの色相と不透明度(透明度 - (100〜150) で残像を薄く見せる)
const PIC_ARRAY_GHOST_HUE = 283;
const PIC_ARRAY_GHOST_OPACITY_MIN = 100;
const PIC_ARRAY_GHOST_OPACITY_RANGE = 51;

//ピクチャ指定して配列に代入
pic_setArray = function (parallelSlotId, pictureId, jitterX, jitterY, scaleAmount, waitFrames) {

  if (parallelSlotId <= 0) {
    resetParallelPictures();
    picture_motion1("smooth", [0]);
  }

  valuePicArr1 = Array(PIC_ARRAY_LENGTH).fill(0);
  assignParallelSlotPictureId(parallelSlotId, pictureId);

  const picture = $gameScreen.picture(pictureId);
  if (!picture) return;

  const pictureState = valuePicArr1;
  pictureState[PIC_ARRAY_INDEX.pictureId] = pictureId;
  pictureState[PIC_ARRAY_INDEX.pictureName] = picture.name();
  pictureState[PIC_ARRAY_INDEX.origin] = picture.origin();
  pictureState[PIC_ARRAY_INDEX.x] = picture.x();
  pictureState[PIC_ARRAY_INDEX.y] = picture.y();
  pictureState[PIC_ARRAY_INDEX.scaleX] = picture.scaleX();
  pictureState[PIC_ARRAY_INDEX.scaleY] = picture.scaleY();
  pictureState[PIC_ARRAY_INDEX.opacity] = picture.opacity();
  pictureState[PIC_ARRAY_INDEX.blendMode] = picture.blendMode();
  pictureState[PIC_ARRAY_INDEX.jitterX] = jitterX;
  pictureState[PIC_ARRAY_INDEX.jitterY] = jitterY;
  pictureState[PIC_ARRAY_INDEX.waitFrames] = waitFrames;
  pictureState[PIC_ARRAY_INDEX.ghostOpacity] = getRandomIndex(PIC_ARRAY_GHOST_OPACITY_RANGE) + PIC_ARRAY_GHOST_OPACITY_MIN;
  pictureState[PIC_ARRAY_INDEX.scaleAmount] = scaleAmount;

  // 残像ピクチャ(1 つ手前の ID)は薄く表示しておく
  $gameScreen.showPicture_hue(pictureId - 1, pictureState[PIC_ARRAY_INDEX.pictureName], PIC_ARRAY_GHOST_HUE,
    pictureState[PIC_ARRAY_INDEX.origin], pictureState[PIC_ARRAY_INDEX.x], pictureState[PIC_ARRAY_INDEX.y],
    pictureState[PIC_ARRAY_INDEX.scaleX], pictureState[PIC_ARRAY_INDEX.scaleY],
    pictureState[PIC_ARRAY_INDEX.opacity] - pictureState[PIC_ARRAY_INDEX.ghostOpacity], 0);

}

// 並列処理のスロット(1〜4)へピクチャ ID を登録する。
function assignParallelSlotPictureId(parallelSlotId, pictureId) {
  switch (Number(parallelSlotId)) {
    case 2: valueParallelPic2 = pictureId; break;
    case 3: valueParallelPic3 = pictureId; break;
    case 4: valueParallelPic4 = pictureId; break;
    default:
      if (parallelSlotId <= PIC_PARALLEL_SLOT_FIRST) valueParallelPic1 = pictureId;
      break;
  }
}

// 並列処理をすべて解除する。
function resetParallelPictures() {
  valueParallelPic1 = 0;
  valueParallelPic2 = 0;
  valueParallelPic3 = 0;
  valueParallelPic4 = 0;
}

// 対象のピクチャが並列処理スロットのどれかに登録されているか。
function isParallelPictureSelected(pictureId) {
  return pictureId == valueParallelPic1 || pictureId == valueParallelPic2
    || pictureId == valueParallelPic3 || pictureId == valueParallelPic4;
}

//ピクチャ指定して配列に代入したものを並列処理
const PIC_JITTER_RANDOM_RANGE = 5;      // 揺れのばらつき(±)
const PIC_JITTER_CENTER_RANGE = 7;      // 揺れ指定なしの時の範囲
const PIC_JITTER_CENTER_OFFSET = 3;     // その中心(MIN は -3)
const PIC_SCALE_JITTER_RANGE = 3;       // 拡縮のばらつき
const PIC_MOVE_WAIT_JITTER_RANGE = 5;   // 移動フレームのばらつき
const PIC_GHOST_LEAD_RANGE = 4;         // 残像を先に動かすフレーム数
const PIC_GHOST_LEAD_MIN = 1;
const PIC_GHOST_MIN_WAIT_FRAMES = 2;

pic_setArrayParallel1 = function (pictureId) {

  valuePicWait = 0;
  if (!isParallelPictureSelected(pictureId)) return;
  if (!$gameScreen.picture(pictureId)) return;

  const pictureState = valuePicArr1;
  // 揺れ量。乱数は x→y の順に消費するので、まとめて 1 回だけ計算する。
  const jitterOffset = resolveParallelOffset(
    pictureState[PIC_ARRAY_INDEX.jitterX], pictureState[PIC_ARRAY_INDEX.jitterY]);
  const offsetX = jitterOffset.x;
  const offsetY = jitterOffset.y;

  // 拡縮の揺れ幅も x 用と y 用で別々に乱数を引く(元コードと同じ消費順)
  const scaleShiftX = resolveParallelScaleShift(pictureState[PIC_ARRAY_INDEX.scaleAmount]);
  const scaleShiftY = resolveParallelScaleShift(pictureState[PIC_ARRAY_INDEX.scaleAmount]);

  const baseX = pictureState[PIC_ARRAY_INDEX.x];
  const baseY = pictureState[PIC_ARRAY_INDEX.y];

  // 位置はスプライン、拡縮は jump のカーブで揺らす
  curveFunctions.patternX = curveFunctions.getPattern('spline', [baseX, baseX + offsetX, baseX + scaleShiftX, baseX]);
  curveFunctions.patternY = curveFunctions.getPattern('spline', [baseY, baseY + offsetY, baseY + scaleShiftY, baseY]);
  curveFunctions.patternScaleX = curveFunctions.getPattern('jump', [scaleShiftX]);
  curveFunctions.patternScaleY = curveFunctions.getPattern('jump', [scaleShiftY]);

  valuePicWait += pictureState[PIC_ARRAY_INDEX.waitFrames] - getRandomIndex(PIC_MOVE_WAIT_JITTER_RANGE);
  $gameScreen.movePicture(pictureState[PIC_ARRAY_INDEX.pictureId], pictureState[PIC_ARRAY_INDEX.origin],
    baseX, baseY,
    pictureState[PIC_ARRAY_INDEX.scaleX], pictureState[PIC_ARRAY_INDEX.scaleY],
    pictureState[PIC_ARRAY_INDEX.opacity], pictureState[PIC_ARRAY_INDEX.blendMode], valuePicWait);

  //NOTE: 残像用の乱数は対象外のピクチャでも必ず 1 回消費する(元コードと同じ消費順)
  const ghostLeadFrames = getRandomIndex(PIC_GHOST_LEAD_RANGE) + PIC_GHOST_LEAD_MIN;
  let ghostWaitFrames = valuePicWait - ghostLeadFrames;
  if (ghostWaitFrames <= 1) ghostWaitFrames = PIC_GHOST_MIN_WAIT_FRAMES;

  moveParallelGhostPicture(pictureId, pictureState, ghostWaitFrames);

}

// 揺れ量。NOTE: 元コードの乱数消費順(まず x と y の符号付き、次に 0 指定の分)を保つ。
function resolveParallelOffset(jitterX, jitterY) {
  const signedX = resolveJitterShift(jitterX);
  const signedY = resolveJitterShift(jitterY);
  const centeredX = resolveCenterJitterShift(jitterX);
  const centeredY = resolveCenterJitterShift(jitterY);

  return {
    x: signedX !== 0 ? signedX : centeredX,
    y: signedY !== 0 ? signedY : centeredY
  };
}

// 揺れ指定が ±1 以上の時: 指定値から 0〜4 を引き/足しして揺らす。
function resolveJitterShift(jitterValue) {
  if (jitterValue >= 1) return jitterValue - getRandomIndex(PIC_JITTER_RANDOM_RANGE);
  if (jitterValue <= -1) return jitterValue + getRandomIndex(PIC_JITTER_RANDOM_RANGE);
  return 0;
}

// 揺れ指定が 0 の時: -3〜+3 の範囲でランダムに揺らす。
function resolveCenterJitterShift(jitterValue) {
  if (jitterValue != 0) return 0;
  return getRandomIndex(PIC_JITTER_CENTER_RANGE) - PIC_JITTER_CENTER_OFFSET;
}

// 拡縮の揺れ幅。指定が 0 なら 0〜2 のランダム。
function resolveParallelScaleShift(scaleAmount) {
  if (scaleAmount == 0) return getRandomIndex(PIC_SCALE_JITTER_RANGE);
  return scaleAmount;
}

// 残像ピクチャはスロット1のピクチャの時だけ、本体より先に動かす。
function moveParallelGhostPicture(pictureId, pictureState, ghostWaitFrames) {
  if (pictureId != valueParallelPic1) return;

  const ghostPictureId = pictureId - 1;
  if (!$gameScreen.picture(ghostPictureId)) return;

  $gameScreen.movePicture(ghostPictureId, pictureState[PIC_ARRAY_INDEX.origin],
    pictureState[PIC_ARRAY_INDEX.x], pictureState[PIC_ARRAY_INDEX.y],
    pictureState[PIC_ARRAY_INDEX.scaleX], pictureState[PIC_ARRAY_INDEX.scaleY],
    pictureState[PIC_ARRAY_INDEX.opacity] - pictureState[PIC_ARRAY_INDEX.ghostOpacity], 0, ghostWaitFrames);
}

//#endregion

//#region pic_set / pic_move1 / pic_locationSet
// setTargetId(どの値を使うか)
const PIC_SET_TARGET = { opacity: 1, offsetX: 2, offsetY: 3, scale: 4, blendMode: 5 };

//ピクチャ指定して表示pic_set(51,1,255,60);
//id1ﾋﾟｸﾁｬid2が1透明2x3y4拡大5合成,id3で指定値,id4ウェイト
pic_set = function (pictureId, setTargetId, targetValue, waitFrames) {

  const picture = $gameScreen.picture(pictureId);
  if (!picture) return;

  const pictureOrigin = picture.origin();
  let pictureX = picture.x();
  let pictureY = picture.y();
  let scaleX = picture.scaleX();
  let scaleY = picture.scaleY();
  let opacity = picture.opacity();
  let blendMode = picture.blendMode();

  switch (Number(setTargetId)) {
    case PIC_SET_TARGET.opacity: opacity = targetValue; break;
    case PIC_SET_TARGET.offsetX: pictureX = targetValue + pictureX; break;
    case PIC_SET_TARGET.offsetY: pictureY = targetValue + pictureY; break;
    case PIC_SET_TARGET.scale:
      scaleX = targetValue;
      scaleY = targetValue;
      break;
    case PIC_SET_TARGET.blendMode: blendMode = targetValue; break;
    default: break;
  }

  $gameScreen.movePicture(pictureId, pictureOrigin, pictureX, pictureY, scaleX, scaleY, opacity, blendMode, waitFrames);

}

//元位置記してピクチャムーブ。pic_move1(88,-300,0,100,100,0,90);//0id,1x,2y,3拡x,4拡y,5opa,6wait
pic_move1 = function (pictureId, x, y, scaleX, scaleY, opacity, waitFrames) {

  const picture = $gameScreen.picture(pictureId);
  if (!picture) return;

  // 透明にする時は呼吸(ブレス)を止める
  if (opacity == 0) disableAllPictureBreath(pictureId, picture);

  const pictureOrigin = picture.origin();
  $gameScreen.movePicture(pictureId, pictureOrigin, picture.x() + x, picture.y() + y,
    scaleX, scaleY, opacity, 0, waitFrames);

}

//ピクid1の位置情報をもとにピクチャid2表示.id1元ﾋﾟｸ,id2表示ﾋﾟｸ,画像名,表示ｳｪｲﾄ,id5が1で元ﾋﾟｸ消去で0で無効
pic_locationSet = function (sourcePictureId, targetPictureId, pictureName, waitFrames, isAlsoFadeOut) {

  const sourcePicture = $gameScreen.picture(sourcePictureId);
  if (!sourcePicture) return;

  const pictureOrigin = sourcePicture.origin();
  const pictureX = sourcePicture.x();
  const pictureY = sourcePicture.y();
  const scaleX = sourcePicture.scaleX();
  const scaleY = sourcePicture.scaleY();
  const opacity = sourcePicture.opacity();
  const blendMode = sourcePicture.blendMode();

  $gameScreen.showPicture(targetPictureId, pictureName, pictureOrigin,
    pictureX, pictureY, scaleX, scaleY, 0, blendMode);
  $gameScreen.movePicture(targetPictureId, pictureOrigin,
    pictureX, pictureY, scaleX, scaleY, opacity, blendMode, waitFrames);

  if (isAlsoFadeOut != 1) return;

  // 元のピクチャは 2 倍の時間をかけて消す
  $gameScreen.movePicture(sourcePictureId, pictureOrigin,
    pictureX, pictureY, scaleX, scaleY, 0, blendMode, waitFrames * 2);

}

//#endregion

//#region animation / fade
//ピクチャアニメ
picture_anime1 = function (pictureId, pictureName, animationFrameCount, animationSpeed, animationPattern,
  animationWaitFrames, startFrameId, isLoopFrame, animationCellPattern) {

  $gameScreen.setPicturesAnimation(animationFrameCount, animationSpeed, animationPattern, animationWaitFrames);
  $gameScreen.showPicture(pictureId, pictureName, 1, 640, 384, 100, 100, 0, 0);
  $gameScreen.picture(pictureId).startAnimationFrame(startFrameId, isLoopFrame, animationCellPattern);

}

//ピクチャアニメセル指定
picture_anime2 = function (pictureId, pictureName, animationFrameCount, animationSpeed, animationPattern,
  animationWaitFrames, cellIndex) {

  if (!$gameScreen.picture(pictureId)) {
    $gameScreen.setPicturesAnimation(animationFrameCount, animationSpeed, animationPattern, animationWaitFrames);
    $gameScreen.showPicture(pictureId, pictureName, 1, 640, 384, 100, 100, 0, 0);
  }
  $gameScreen.picture(pictureId).cell = cellIndex;

}

//ピクチャに対してアニメーション
picture_animation1 = function (pictureId, offsetX, offsetY, animationId) {

  const picture = $gameScreen.picture(pictureId);
  if (!picture) return;

  $gameScreen.startAnimation(offsetX + picture.x(), offsetY + picture.y(), animationId, false);

}

//ピクチャフェードインアウト
picture_fade1 = function (pictureId, fadeType, fadeGlowA, fadeWaitFrames, fadeGlowB) {

  const picture = $gameScreen.picture(pictureId);
  if (!picture) return;

  //NOTE: 元コード同様、スイッチ651 が ON の時は GWInfo を作らない
  if (!$gameSwitches.value(PICTURE_FADE_GWINFO_SWITCH_ID)) {
    picture._GWInfo = $gameScreen.createGWInfo([fadeType, fadeGlowA, fadeWaitFrames, fadeGlowB]);
  }

  if (fadeType !== "fadeOut") return;

  disableAllPictureBreath(pictureId, picture);

  // 位置・拡大率・合成方法は現在値のまま、不透明度だけ 0 にする
  $gameScreen.movePicture(pictureId, picture.origin(), picture.x(), picture.y(),
    picture.scaleX(), picture.scaleY(), 0, 0, fadeWaitFrames);

}

//#endregion

//#region erase
// 消去スタイル(0:即時, 1:ランダム方向へ飛ばして消す, 2:決め打ちで遅らせて消す)
const PIC_ERASE_STYLE_RANDOM = 1;
const PIC_ERASE_STYLE_DELAYED = 2;
const PIC_ERASE_RANDOM_WAIT_RANGE = 21;
const PIC_ERASE_RANDOM_WAIT_MIN = 40;
const PIC_ERASE_DELAYED_WAIT_FRAMES = 60;
const PIC_ERASE_OFFSET = 50;
// ランダム方向(0:右 1:下 2:左 3:上)
const PIC_ERASE_RANDOM_DIRECTIONS = [
  { x: PIC_ERASE_OFFSET, y: 0 },
  { x: 0, y: PIC_ERASE_OFFSET },
  { x: -PIC_ERASE_OFFSET, y: 0 },
  { x: 0, y: -PIC_ERASE_OFFSET }
];

//ピクチャ指定消去
pic_eraseP = function (eraseStyleId, pictureIds) {

  picture_motion1("smooth", [0]);
  const eraseStyle = resolvePictureEraseStyle(eraseStyleId);

  for (const pictureId of pictureIds) {
    const picture = $gameScreen.picture(pictureId);
    if (!picture) continue;

    disableAllPictureBreath(pictureId, picture);

    if (picture.isParallaxBase()) $gameScreen.eraseParallax(pictureId);

    // スタイル 1/2 は少し動かしてから消す(スタイル 0 と範囲外は即時消去)
    if (eraseStyleId >= PIC_ERASE_STYLE_RANDOM) {
      $gameScreen.movePicture(pictureId, picture.origin(),
        picture.x() + eraseStyle.offsetX, picture.y() + eraseStyle.offsetY,
        picture.scaleX(), picture.scaleY(), 0, 0, eraseStyle.waitFrames);
      continue;
    }

    $gameScreen.erasePicture(pictureId);
  }

}

// 消去スタイルから待ち時間とズレ量を決める。
//NOTE: 元コードはスタイル 1/2 以外で未定義のまま movePicture に渡していた(NaN 移動)。
//      即時消去と同じ扱いにしている。
function resolvePictureEraseStyle(eraseStyleId) {
  if (eraseStyleId == PIC_ERASE_STYLE_RANDOM) {
    const waitFrames = getRandomIndex(PIC_ERASE_RANDOM_WAIT_RANGE) + PIC_ERASE_RANDOM_WAIT_MIN;
    const randomDirectionIndex = getRandomIndex(PIC_ERASE_RANDOM_DIRECTIONS.length);
    const randomDirection = PIC_ERASE_RANDOM_DIRECTIONS[randomDirectionIndex];
    return { waitFrames: waitFrames, offsetX: randomDirection.x, offsetY: randomDirection.y };
  }
  if (eraseStyleId == PIC_ERASE_STYLE_DELAYED) {
    return { waitFrames: PIC_ERASE_DELAYED_WAIT_FRAMES, offsetX: 0, offsetY: 0 };
  }
  return { waitFrames: 0, offsetX: 0, offsetY: 0 };
}

// 消去しないピクチャ ID(1:タイトル系など残すもの, それ以外:ピクチャ0 のみ除外)
const PIC_ERASE_EXEMPT_PICTURE_IDS = new Set([1, 2, 3, 4, 6, 9, 10, 47, 48, 49, 50, 94, 95]);
const PIC_ERASE_EXEMPT_PICTURE_IDS_DEFAULT = new Set([0]);

//ピクチャ一括消去
pic_erase = function (eraseModeId) {

  const exemptPictureIds = eraseModeId == 1
    ? PIC_ERASE_EXEMPT_PICTURE_IDS
    : PIC_ERASE_EXEMPT_PICTURE_IDS_DEFAULT;

  for (let pictureId = 1; pictureId <= PIC_SCAN_LAST_ID; pictureId++) {
    if (exemptPictureIds.has(pictureId)) continue;

    const picture = $gameScreen.picture(pictureId);
    if (!picture) continue;

    disableAllPictureBreath(pictureId, picture);
    if (picture.isParallaxBase()) $gameScreen.eraseParallax(pictureId);
    $gameScreen.erasePicture(pictureId);
  }

}

//ピクチャブレスオフ
pic_blessoff = function () {

  const pictureIds = collectExistingPictureIds();
  for (const breathController of pictureBreathControllers()) {
    breathController.off(pictureIds);
  }

}

//bless_erase();
bless_erase = function () {

  for (let pictureId = 1; pictureId <= PIC_SCAN_LAST_ID; pictureId++) {
    const picture = $gameScreen.picture(pictureId);
    if (!picture) continue;
    disableAllPictureBreath(pictureId, picture);
  }

}

//#endregion

//#region picture button
// ピクチャボタンの位置・サイズを変数へ書き出す
const PICTURE_BUTTON_VARIABLE_ID = 281;        // 対象ピクチャ ID
const PICTURE_BUTTON_STATE_VARIABLE_ID = 282;  // 位置・サイズ・倍率
const PICTURE_BUTTON_STATE_LENGTH = 11;
// 変数282 の並び
const PICTURE_BUTTON_STATE_INDEX = { x: 2, y: 3, width: 4, height: 5, scalePercent: 6 };
const PICTURE_BUTTON_SCALE_PERCENT = 95;
const PICTURE_BUTTON_OFFSET_Y = -10;
const PICTURE_BUTTON_MOVE_FRAMES = 2;

//ピクチャボタン動作
picture_bottan1 = function (buttonPictureId) {

  $gameVariables.setValue(PICTURE_BUTTON_VARIABLE_ID, buttonPictureId);
  $gameVariables.setValue(PICTURE_BUTTON_STATE_VARIABLE_ID, Array(PICTURE_BUTTON_STATE_LENGTH).fill(0));

  const pictureId = $gameVariables.value(PICTURE_BUTTON_VARIABLE_ID);
  const buttonState = $gameVariables.value(PICTURE_BUTTON_STATE_VARIABLE_ID);
  const picture = $gameScreen.picture(pictureId);
  if (!picture) return;

  buttonState[PICTURE_BUTTON_STATE_INDEX.x] = picture.x();
  buttonState[PICTURE_BUTTON_STATE_INDEX.y] = picture.y();

  const buttonSprite = findPictureSprite(pictureId);
  if (!buttonSprite) return;

  buttonState[PICTURE_BUTTON_STATE_INDEX.width] = buttonSprite.width;
  buttonState[PICTURE_BUTTON_STATE_INDEX.height] = buttonSprite.height;
  buttonState[PICTURE_BUTTON_STATE_INDEX.scalePercent] = PICTURE_BUTTON_SCALE_PERCENT;

  // 縮小した分だけ中心を合わせ、少し上へずらす
  const scalePercent = PICTURE_BUTTON_SCALE_PERCENT;
  const halfWidthOffset = (buttonState[PICTURE_BUTTON_STATE_INDEX.width] / 2) * (100 - scalePercent) / 100;
  const halfHeightOffset = (buttonState[PICTURE_BUTTON_STATE_INDEX.height] / 2) * (100 - scalePercent) / 100;
  const targetX = buttonState[PICTURE_BUTTON_STATE_INDEX.x] + halfWidthOffset;
  const targetY = buttonState[PICTURE_BUTTON_STATE_INDEX.y] + halfHeightOffset;

  $gameScreen.movePicture(pictureId, 1, targetX, targetY + PICTURE_BUTTON_OFFSET_Y,
    scalePercent, scalePercent, 255, 0, PICTURE_BUTTON_MOVE_FRAMES);

}

// ピクチャ ID から実際のスプライト(大きさの取得用)を探す。
function findPictureSprite(pictureId) {
  const pictureSprites = SceneManager._scene._spriteset._pictureContainer.children;
  return pictureSprites.find(function (pictureSprite) {
    return pictureSprite._pictureId === pictureId;
  });
}
//#endregion

//#region tachie_bless / hcg_piston
// 呼吸設定の初期値: [揺れx, 揺れy, 頻度, 拡縮度x, 拡縮度y]
const TACHIE_BLESS_DEFAULT_SETTINGS = [100, 100, 250, 0.004, 0.003];
const TACHIE_BLESS_EXCITED_STATE_ID = 61;   //発情状態
const TACHIE_BLESS_EXCITED_FREQUENCY = 150;
const TACHIE_BLESS_EXCITED_SCALE_X = 0.005;
const TACHIE_BLESS_EXCITED_SCALE_Y = 0.004;
const TACHIE_BLESS_BATTLE_FREQUENCY = 200;
const TACHIE_BLESS_AURA_PICTURE_ID = 45;    //立ち絵の後ろのオーラ
const TACHIE_BLESS_TYPE_TACHIE = 1;         //立ち絵(状態や戦闘で設定が変わる)

//息継ぎ設定getPreviousTachiePicId()
//[0]息遣いx軸[1]y軸,立ち絵x100y100[2]頻度,平時250戦時150[3]拡縮度x,立ち絵0.005[4]拡縮度y,立ち絵0.004
tachie_bless = function (pictureId, blessType) {

  // 0 は呼吸停止
  if (blessType === 0) {
    UTSU.PictureBreath.off([pictureId]);
    return;
  }

  if ($gameSwitches.value(BREATH_CUT_SWITCH_ID)) return;

  const breathSettings = buildTachieBreathSettings(blessType);
  if (!applyBreathToLayer(pictureId, blessType, breathSettings)) return;

  // 立ち絵(レイヤー1)はオーラのピクチャにも同じ頻度で呼吸をかける
  if (blessType != TACHIE_BLESS_TYPE_TACHIE) return;
  if (!$gameScreen.picture(TACHIE_BLESS_AURA_PICTURE_ID)) return;

  UTSU.PictureBreath.on([TACHIE_BLESS_AURA_PICTURE_ID], breathSettings[BREATH_SETTINGS_INDEX.frequency]);

}

// 呼吸設定を作る。立ち絵(1)だけ発情状態や戦闘で頻度・拡縮度が変わる。
function buildTachieBreathSettings(blessType) {
  const breathSettings = TACHIE_BLESS_DEFAULT_SETTINGS.slice();
  if (blessType != TACHIE_BLESS_TYPE_TACHIE) return breathSettings;

  const actor = $gameActors.actor($gameVariables.value(20));
  if (actor && actor.isStateAffected(TACHIE_BLESS_EXCITED_STATE_ID)) {
    breathSettings[BREATH_SETTINGS_INDEX.frequency] = TACHIE_BLESS_EXCITED_FREQUENCY;
    breathSettings[BREATH_SETTINGS_INDEX.scaleX] = TACHIE_BLESS_EXCITED_SCALE_X;
    breathSettings[BREATH_SETTINGS_INDEX.scaleY] = TACHIE_BLESS_EXCITED_SCALE_Y;
    return breathSettings;
  }
  if ($gameParty.inBattle()) {
    breathSettings[BREATH_SETTINGS_INDEX.frequency] = TACHIE_BLESS_BATTLE_FREQUENCY;
  }
  return breathSettings;
}

//CGでピストン表現hcg_piston(value1,7,1,1);
// 呼吸設定 [揺れx, 揺れy, 頻度, 拡縮度x, 拡縮度y]
const PISTON_BREATH_PARAMS = {
  1: {//右横
    1: [-1, 3, 100, 0.015, 0.001],
    2: [-1, 3, 60, 0.020, 0.001],
    3: [-1, 3, 40, 0.025, 0.001]
  },
  2: {//左横
    1: [-1, 3, 100, -0.015, 0.001],
    2: [-1, 3, 60, -0.020, 0.001],
    3: [-1, 3, 40, -0.025, 0.001]
  },
  3: {//左斜め
    1: [1, 1, 100, 0.015, 0.015],
    2: [1, 1, 50, 0.02, 0.02],
    3: [1, 1, 20, 0.03, 0.03]
  },
  4: {//右斜め
    1: [-1, 1, 100, 0.015, 0.015],
    2: [-1, 1, 50, 0.02, 0.02],
    3: [-1, 1, 20, 0.03, 0.03]
  },
  5: {//正面
    1: [100, 100, 100, 0.005, 0.004],
    2: [150, 150, 50, 0.005, 0.004],
    3: [200, 200, 20, 0.020, 0.015]
  },
  6: {//正面痙攣（事後）
    1: [100, 100, 200, 0.003, 0.002],
    2: [100, 100, 100, 0.003, 0.002],
    3: [100, 100, 20, 0.003, 0.002]
  },
  7: {//縦
    1: [100, 100, 100, 0.015, 0.02],
    2: [100, 100, 50, 0.015, 0.04],
    3: [100, 100, 20, 0.015, 0.05]
  },
  8: {//横左右に身動ぎ
    1: [100, 100, 150, 0.01, 0.005],
    2: [100, 100, 100, 0.02, 0.015],
    3: [100, 100, 50, 0.03, 0.020]
  },
  9: {//プロフィール乳揺れ正面
    1: [100, 100, 150, 0.015, 0.03],
    2: [100, 100, 50, 0.020, 0.04],
    3: [100, 100, 20, 0.025, 0.05]
  },
  10: {//顔グラ乳揺れ正面
    1: [100, 100, 150, 0.010, 0.02],
    2: [100, 100, 100, 0.020, 0.04],
    3: [100, 100, 50, 0.025, 0.05]
  }
};

hcg_piston = function (pictureId, breathTypeId, breathPresetId, breathLayerId) {

  if ($gameSwitches.value(PISTON_CUT_SWITCH_ID)) return;

  const breathTypeParams = PISTON_BREATH_PARAMS[breathTypeId];
  const breathParams = breathTypeParams ? breathTypeParams[breathPresetId] : null;
  if (!breathParams) return;

  applyBreathToLayer(pictureId, breathLayerId, breathParams);

}

//#endregion

//#region parallax / rotate / se
//パララックススクロール
parallax_scroll = function (parallaxIndex, parallaxName, parallaxX, fadeOpacity, scrollX, scrollY, fadeWaitFrames) {

  $gameScreen.showParallax(parallaxIndex, parallaxName, 0, parallaxX);
  $gameScreen.fadeParallax(parallaxIndex, fadeWaitFrames, fadeOpacity);
  $gameScreen.scrollParallax(parallaxIndex, scrollX, scrollY);

}

//集中線真ん中picture_rotate(74,"ScreenConcentratedLineCenter",640,384,200,1,30);
const PICTURE_ROTATE_FADE_FRAMES = 20;
const PICTURE_ROTATE_SCALE = 100;
const PICTURE_ROTATE_FLASH_COLOR = [255, 255, 255, 200];
const PICTURE_ROTATE_FLASH_DURATION = 60;

picture_rotate = function (pictureId, pictureName, x, y, opacity, blendMode, rotationDegrees) {

  $gameScreen.showPicture(pictureId, pictureName, 1, x, y, 0, 0, 0, 1);
  $gameScreen.movePicture(pictureId, 1, x, y,
    PICTURE_ROTATE_SCALE, PICTURE_ROTATE_SCALE, opacity, blendMode, PICTURE_ROTATE_FADE_FRAMES);
  $gameScreen.rotatePicture(pictureId, rotationDegrees);
  $gameScreen.startFlash(PICTURE_ROTATE_FLASH_COLOR, PICTURE_ROTATE_FLASH_DURATION);

}

//ピクチャ更新時の音演出
picture_se1 = function () {

  AudioManager.playSe(createCgDispraySe(CG_DISPRAY_SE_VOLUME_UPDATE));

}

//#endregion

//#region skill mastery log
// 熟練度獲得ログの変数(\V[203] は変数 203 の値)
const SKILL_MASTERY_ACTOR_VARIABLE_ID = 11;
const SKILL_MASTERY_VALUE_VARIABLE_ID = 203;

//主人公パッシブ獲得
actor_skillMasteryGet = function (skillId, logVarId) {

  const masteryUses = $gameVariables.value(SKILL_MASTERY_VALUE_VARIABLE_ID);
  const actor = $gameActors.actor($gameVariables.value(SKILL_MASTERY_ACTOR_VARIABLE_ID));
  if (actor) actor.gainSkillMasteryUses(skillId, masteryUses);//変更熟練度

  // 色タグと変数参照は翻訳対象の外で組み立てる
  const skillName = colorTaggedText(1, `＜${$dataSkills[skillId].name}＞`);
  const masteryValueText = colorTaggedText(10, masteryUses);
  const masteryText = `${skillName}熟練度${masteryValueText}獲得！\n`;

  $gameVariables.setValue(logVarId, $gameVariables.value(logVarId) + masteryText);

}
//#endregion

//#region status scene
// 現状確認時に出す状態 CG の設定
const STATUS_PICTURE_ID_BASE = 50;            // 表示は 51 から 2 枚ずつ
const STATUS_ACTOR_VARIABLE_ID_BASE = 380;    // アクター別状態変数(380 + actorId)
const STATUS_STATE_PICTURE_INDEX = 46;        // [46] = 専用 CG のピクチャ ID(0 なら自動)
const STATUS_LEVEL_VARIABLE_ID = 191;         // 状態段階(1〜6)を入れる変数
const STATUS_PICTURE_FADE_FRAMES = 20;
const STATUS_PICTURE_START_OFFSET_X = 500;
const STATUS_PICTURE_START_OFFSET_X_STATE = -200;
const STATUS_TWO_MEMBER_OFFSET_X = 512;
const STATUS_MULTI_MEMBER_SCALE = 50;
// 堕落スキル → 状態段階。上から順に判定し、最後に一致したものが残る(=元コードの上書き順)
const STATUS_LEVEL_SKILLS = [[62, 2], [64, 3], [66, 4], [68, 5], [70, 6]];
//NOTE: 元コードのまま。3 人以上の時の位置指定は id 2〜8 を判定しており、
//      ループ範囲(50〜)と一致しないため実際には適用されない。
const STATUS_MULTI_MEMBER_POSITIONS = {
  2: [256, 384], 3: [0, 384], 4: [256, 384], 5: [512, 0],
  6: [768, 384], 7: [512, 384], 8: [768, 384]
};

//現状確認時直前シーンCG表示
genjou_tyokuzenScene = function () {

  const pictureCounter = showStatusScenePictures($gameParty.members());

  if (pictureCounter == 2) moveStatusTwoMemberPictures();
  if (pictureCounter >= 3) layoutStatusMultiMemberPictures(pictureCounter);

}

// パーティメンバー分の状態 CG を並べ、表示できた人数を返す。
function showStatusScenePictures(members) {
  const firstActorId = $gameVariables.value(73);
  const lastActorId = $gameVariables.value(74);
  let pictureCounter = 0;

  for (let actorId = firstActorId; actorId <= lastActorId; actorId++) {
    // 変数20 は他のプラグインが「操作中アクター」として参照する
    $gameVariables.setValue(20, actorId);

    const actor = $gameActors.actor(actorId);
    if (!members.contains(actor)) continue;

    const pictureId = STATUS_PICTURE_ID_BASE + 1 + pictureCounter * 2;
    const statePictureId = $gameVariables.value(STATUS_ACTOR_VARIABLE_ID_BASE + actorId)[STATUS_STATE_PICTURE_INDEX];
    if (statePictureId == 0) {
      showStatusBackgroundPicture(pictureId, actor);
    } else {
      showStatusStatePicture(pictureId, statePictureId);
    }
    pictureCounter += 1;
  }

  return pictureCounter;
}

// [46] が 0 の時: 状態段階に応じた背景とフレームを出す。
function showStatusBackgroundPicture(firstPictureId, actor) {
  const statusLevel = resolveStatusLevel(actor);
  const backgroundName = "HstatesBackGround" + statusLevel;

  $gameScreen.showPicture(firstPictureId, backgroundName, 0, STATUS_PICTURE_START_OFFSET_X, 0, 100, 100, 0, 0);
  $gameScreen.showPicture(firstPictureId + 1, "HstatesFrame", 0, STATUS_PICTURE_START_OFFSET_X, 0, 100, 100, 0, 0);
  $gameScreen.movePicture(firstPictureId, 0, 0, 0, 100, 100, 255, 0, STATUS_PICTURE_FADE_FRAMES);
  $gameScreen.movePicture(firstPictureId + 1, 0, 0, 0, 100, 100, 255, 0, STATUS_PICTURE_FADE_FRAMES);
}

// [46] に専用 CG が入っている時: そのピクチャを出す。
function showStatusStatePicture(pictureId, statePictureId) {
  $gameScreen.showPicture(pictureId, statePictureId, 0, STATUS_PICTURE_START_OFFSET_X_STATE, 0, 100, 100, 0, 0);
  $gameScreen.movePicture(pictureId, 0, 0, 0, 100, 100, 255, 0, STATUS_PICTURE_FADE_FRAMES);
}

// 状態段階を判定して変数191 へ入れる(元コードと同じ順で上書きする)。
function resolveStatusLevel(actor) {
  let statusLevel = 1;
  $gameVariables.setValue(STATUS_LEVEL_VARIABLE_ID, statusLevel);

  for (const [skillId, level] of STATUS_LEVEL_SKILLS) {
    if (!actor.isLearnedSkill(skillId)) continue;
    statusLevel = level;
    $gameVariables.setValue(STATUS_LEVEL_VARIABLE_ID, statusLevel);
  }

  return statusLevel;
}

// 2 人分の時は 2 人目を右側へ寄せる。
function moveStatusTwoMemberPictures() {
  // 2 人目の 2 枚(51,52 の次)を右へ寄せる
  const secondMemberPictureId = STATUS_PICTURE_ID_BASE + 3;
  for (let pictureId = secondMemberPictureId; pictureId <= secondMemberPictureId + 1; pictureId++) {
    $gameScreen.movePicture(pictureId, 0, STATUS_TWO_MEMBER_OFFSET_X, 0, 100, 100, 255, 0, STATUS_PICTURE_FADE_FRAMES);
  }
}

// 3 人以上の時は全部を縮小して並べる。
function layoutStatusMultiMemberPictures(pictureCounter) {
  const lastPictureId = STATUS_PICTURE_ID_BASE + pictureCounter;

  for (let pictureId = STATUS_PICTURE_ID_BASE; pictureId <= lastPictureId; pictureId++) {
    const picture = $gameScreen.picture(pictureId);
    if (!picture) continue;

    picture._scaleX = STATUS_MULTI_MEMBER_SCALE;
    picture._scaleY = STATUS_MULTI_MEMBER_SCALE;

    const gridPosition = STATUS_MULTI_MEMBER_POSITIONS[pictureId];
    if (!gridPosition) continue;

    picture._x = gridPosition[0];
    picture._y = gridPosition[1];
  }
}
//#endregion

//#region parallel move
// 移動ルートでピクチャを動かす。ルートのスクリプトは
// valueCharaWaitCountarray1/2(開始値/目標値)を参照するので配列の中身は変えない。
const PARALLEL_MOVE_EVENT_ID = 1;             // ルートを流すイベント
const PARALLEL_MOVE_ARRAY_LENGTH = 11;
const PARALLEL_MOVE_WAIT_JITTER_RANGE = 11;   // 待ちフレームのばらつき ±5
const PARALLEL_MOVE_WAIT_OFFSET = 5;
const PARALLEL_MOVE_CODE_SCRIPT = 45;
const PARALLEL_MOVE_CODE_WAIT = 15;
const PARALLEL_MOVE_CODE_END = 0;
// valueCharaWaitCountarray1/2 の並び
const CHARA_WAIT_ARRAY_INDEX = {
  pictureId: 1, x: 2, y: 3, scaleX: 4, scaleY: 5, opacity: 6, blendMode: 7, waitFrames: 8
};

// 1 回目の移動スクリプト(現在値へ戻す)
const PARALLEL_MOVE_SCRIPT_CURRENT =
  'if($gameScreen.picture(valueCharaWaitCountarray1[1])){$gameScreen.movePicture(valueCharaWaitCountarray1[1],1,' +
  'valueCharaWaitCountarray1[2],valueCharaWaitCountarray1[3],valueCharaWaitCountarray1[4],' +
  'valueCharaWaitCountarray1[5],valueCharaWaitCountarray1[6],valueCharaWaitCountarray1[7],' +
  'valueCharaWaitCountarray1[8] + (getRandomIndex(11) - 5))}';
// 2 回目の移動スクリプト(目標値 + 小さなばらつき)
//NOTE: ばらつき(±2)はイベントコマンドのスクリプト文字列なので、ここへ直接書く必要がある。
const PARALLEL_MOVE_SCRIPT_TARGET =
  'if($gameScreen.picture(valueCharaWaitCountarray1[1])){$gameScreen.movePicture(valueCharaWaitCountarray1[1],1,' +
  'valueCharaWaitCountarray2[2] + (getRandomIndex(3) - 2),valueCharaWaitCountarray2[3] + (getRandomIndex(3) - 2),' +
  'valueCharaWaitCountarray2[4] + (getRandomIndex(3) - 2),valueCharaWaitCountarray2[5] + (getRandomIndex(3) - 2),' +
  'valueCharaWaitCountarray2[6],valueCharaWaitCountarray2[7],' +
  'valueCharaWaitCountarray1[8] + (getRandomIndex(11) - 5))}';

//移動ルートでピクチャ処理//ﾋﾟｸid,x,y,scale,opa,wait
picture_ParallelMove = function (pictureId, offsetX, offsetY, offsetScale, opacity, waitFrames) {

  valueCharaWaitCountarray1 = Array(PARALLEL_MOVE_ARRAY_LENGTH).fill(0);
  valueCharaWaitCountarray2 = Array(PARALLEL_MOVE_ARRAY_LENGTH).fill(0);

  const picture = $gameScreen.picture(pictureId);
  if (!picture) return;

  storeParallelMoveStartState(pictureId, picture, opacity, waitFrames);
  storeParallelMoveTargetState(picture, offsetX, offsetY, offsetScale);

  const moveRouteEvent = $gameMap.event(PARALLEL_MOVE_EVENT_ID);
  if (!moveRouteEvent) return;

  moveRouteEvent.forceMoveRoute(buildParallelMoveRoute());

}

// 現在値を valueCharaWaitCountarray1 へ保存する。
function storeParallelMoveStartState(pictureId, picture, opacity, waitFrames) {
  const startState = valueCharaWaitCountarray1;
  startState[CHARA_WAIT_ARRAY_INDEX.pictureId] = pictureId;
  startState[CHARA_WAIT_ARRAY_INDEX.x] = picture.x();
  startState[CHARA_WAIT_ARRAY_INDEX.y] = picture.y();
  startState[CHARA_WAIT_ARRAY_INDEX.scaleX] = picture.scaleX();
  startState[CHARA_WAIT_ARRAY_INDEX.scaleY] = picture.scaleY();
  startState[CHARA_WAIT_ARRAY_INDEX.opacity] = opacity;
  startState[CHARA_WAIT_ARRAY_INDEX.blendMode] = picture.blendMode();
  startState[CHARA_WAIT_ARRAY_INDEX.waitFrames] = waitFrames;
}

// 目標値を valueCharaWaitCountarray2 へ保存する。
//NOTE: 不透明度は引数の opacity ではなく現在の不透明度を入れている(元コードのまま)。
function storeParallelMoveTargetState(picture, offsetX, offsetY, offsetScale) {
  const targetState = valueCharaWaitCountarray2;
  targetState[CHARA_WAIT_ARRAY_INDEX.x] = picture.x() + offsetX;
  targetState[CHARA_WAIT_ARRAY_INDEX.y] = picture.y() + offsetY;
  targetState[CHARA_WAIT_ARRAY_INDEX.scaleX] = picture.scaleX() + offsetScale;
  targetState[CHARA_WAIT_ARRAY_INDEX.scaleY] = picture.scaleY() + offsetScale;
  targetState[CHARA_WAIT_ARRAY_INDEX.opacity] = picture.opacity();
  targetState[CHARA_WAIT_ARRAY_INDEX.blendMode] = picture.blendMode();
}

// 移動ルート(現在値 → 目標値)を組み立てる。待ちフレームの乱数は元コードと同じ順で消費する。
function buildParallelMoveRoute() {
  return {
    "list": [
      { "code": PARALLEL_MOVE_CODE_SCRIPT, "parameters": [PARALLEL_MOVE_SCRIPT_CURRENT] },
      { "code": PARALLEL_MOVE_CODE_WAIT, "parameters": [resolveParallelMoveWaitFrames()] },
      { "code": PARALLEL_MOVE_CODE_SCRIPT, "parameters": [PARALLEL_MOVE_SCRIPT_TARGET] },
      { "code": PARALLEL_MOVE_CODE_WAIT, "parameters": [resolveParallelMoveWaitFrames()] },
      { "code": PARALLEL_MOVE_CODE_END }
    ], "repeat": true, "skippable": true
  };
}

// 待ちフレーム(基準値 ± 5)。
function resolveParallelMoveWaitFrames() {
  return valueCharaWaitCountarray1[CHARA_WAIT_ARRAY_INDEX.waitFrames]
    + (getRandomIndex(PARALLEL_MOVE_WAIT_JITTER_RANGE) - PARALLEL_MOVE_WAIT_OFFSET);
}
//#endregion

//#region pic_showMove1
//ﾋﾟｸid,ﾌｧｲﾙ,x,y,scale,wait,0そのまま1横ズレ2拡縮,最後は変更数値
const PIC_SHOW_MOVE_AXIS = { none: 0, xOffset: 1, yOffsetAndScale: 2 };

pic_showMove1 = function (pictureId, pictureName, x, y, scale, waitFrames, offsetAxisId, offsetAmount) {

  let offsetX = 0;
  let offsetY = 0;

  switch (Number(offsetAxisId)) {
    case PIC_SHOW_MOVE_AXIS.xOffset: offsetX = offsetAmount; break;
    case PIC_SHOW_MOVE_AXIS.yOffsetAndScale: offsetY = offsetAmount; break;
    default: break;
  }

  //NOTE: 元コード同様、y は offset の影響を受けず、拡大率は offsetY の分だけ変わる
  $gameScreen.showPicture(pictureId, pictureName, 1,
    x + offsetX, y, scale + offsetY, scale + offsetY, 0, 0);
  $gameScreen.movePicture(pictureId, 1, x, y, scale, scale, 255, 0, waitFrames);

}

//#endregion

//エネミーステートでドロップ
//enemy_drop = function(user,enemy){

//}

//}());
