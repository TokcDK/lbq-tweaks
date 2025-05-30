﻿/*
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
tachie_syoukyo1($gameVariables.value(300));
//$gameVariables.setValue(20,1);
kisekae_tyokusetusitei(1324,23);
tachie_syoukyo1($gameVariables.value(300));
this.wait(60);//ここでスクリプト切る
$gameSwitches.setValue(42,true);
tachie_hyouji1($gameVariables.value(20));
var args = new Array(String($gameVariables.value(300)),'71','2','ON')
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
tachie_clothReflect = function(id1){

if(!$gameSwitches.value(29)){
  const arr = $gameVariables.value(id1 + 540);
  const arr1 = $gameVariables.value(id1 + 440);
  for (var i = 0; i <= 42; i++) {
    arr[i] = arr1[i];
  }
}

};

//立ち絵ムーブ。
picTachie_move1 = function(picId,id2,id3,id4,id5,id6,id7){

if($gameScreen.picture(picId)){
  const gameScreenPicture = gameScreen.picture(picId);
  const x = gameScreenPicture.x() + id2;
  const y = gameScreenPicture.y() + id3;
  const scaleX = gameScreenPicture.scaleX() + id4;
  const scaleY = gameScreenPicture.scaleY() + id5;
  const origin = gameScreenPicture.origin();
  $gameScreen.movePicture(picId,origin,x,y,scaleX,scaleY,id6,0,id7);
}

};

//衣装状態でスイッチオンオフ.<EvStartCloth:1,1>と併用
tachie_switchOnOff = function(id){

if (id == 1) {
  $gameSwitches.setValue(601, $gameVariables.value(440 + id)[20] == 0);
}

};

//立ち絵演出クリアも。1実行0終了
tachie_partDirectSet = function(id3,id2,id1){

if(id2 == 1){
    if(id1 == 1){
      $gameScreen.startFlash([255,255,255,200], 120);
      AudioManager.playSe({ "name": "Up1","volume":90,"pitch":110,"pan":0});
      $gameScreen._particle.particleSet(0, 'actor_particleLight','picture:' + id3,'def','screen');
    }
    else if(id1 == 2){
      $gameScreen.startFlash([0,0,0,200], 120);
      AudioManager.playSe({ "name": "Down4","volume":90,"pitch":90,"pan":0});
      $gameScreen._particle.particleSet(0, 'enemy_particleDark','picture:' + id3,'def','screen');
    }
} else {
    if(id1 == 1){
      $gameScreen._particle.particleClear('actor_particleLight');
    }
    else if(id1 == 2){
      $gameScreen._particle.particleClear('enemy_particleDark');
    }
}

};

//ピクチャの動き方設定
picture_easingConfiguration = function(value1){

$gameTemp._easingX = value1;
$gameTemp._easingY = value1;
$gameTemp._easingSx = value1;
$gameTemp._easingSy = value1;
$gameTemp._easingOp = value1;

};

//☆立ち絵会話最初の設定
tachie_kaiwastart = function(id1,id2,id3,id4){

$gameSwitches.setValue(127,id1);//急ぎtrue通常false
$gameSwitches.setValue(126,id2)//拡大true通常false
$gameVariables.setValue(152,id4);//右登場人数
$gameVariables.setValue(153,id3);//左登場人数
$gameSwitches.setValue(5,false);//スキップon。手前のコモンでスイッチonにしているため
$gameScreen.showPicture(5,'ScreenBlackOut',1,640,384,100,100,25,0);
picture_fade1(5,"fadeIn",valueWipeImg,60,5);


};

//☆立ち絵会話衣装破損設定//ｱｸﾀｰID,破損部位,ﾋﾟｸID,1で全損0で破損、101は破損CG表示ﾋﾟｸID始点,id5が1で破損、0で脱衣
tachie_clothesHason = function(id1,id2,id3,id4,id5){

$gameVariables.setValue(20,id1);
clothes_hason1([id2],id4);
$gameSwitches.setValue(143,false);
if($gameVariables.value(244) >= 1){
  clothes_hason2(id3,id5);
  if(id5 == 1){
    $gameScreen.startFlash([255,255,255,170], 20);
    AudioManager.playSe({ "name": "Collapse2","volume":50,"pitch":130,"pan":0});
    $gameScreen.shakePicture(id3, 3, 9, 0, 20);
  }
  else if(id5 == 0){
    AudioManager.playSe({ "name": "Z_ClothesTakeOff","volume":150,"pitch":110,"pan":0});
  }
}

};

// ☆☆立ち絵会話動作用
tachie_dousa = function (
  actionType, mode, expressionId, targetPicId, sourcePicId,
  param6, duration, param8, param9
) {
  console.warn(`tachie_dousa Run!`);

  // Game state management
  $gameSwitches.setValue(97, true);
  const SWITCH_126 = $gameSwitches.value(126);
  const SWITCH_127 = $gameSwitches.value(127);

  // Initialize motion parameters
  let motionDuration = SWITCH_127 ? 40 : 60;
  picture_motion1("smooth", [0]);

  // Determine scale and position parameters
  let scaleX, scaleY, yPos;
  const processMode = () => {
    const modeStr = String(mode);
    if (mode >= 0) {
      $gameVariables.setValue(20, mode);
      $gameVariables.setValue(300, param6);
      $gameVariables.setValue(151, expressionId);

      if (!SWITCH_126) {
        scaleX = 50; scaleY = 50; yPos = 550;
      }
    } else {
      if (SWITCH_126) {
        scaleX = 200; scaleY = 200; yPos = 700;
      } else {
        scaleX = 100; scaleY = 100; yPos = 400;
      }

      if (modeStr.includes('SS')) {
        [scaleX, scaleY, yPos] = SWITCH_126 ? [70, 70, 700] : [50, 50, 550];
      }
      if (modeStr.includes('Upper')) yPos = 384;
      if (modeStr.includes('Scale')) { scaleX = 100; yPos = 384; }
      if (modeStr.includes('State')) { scaleX = 100; scaleY = 100; yPos = 384; }
    }
  };
  processMode();

  // Check character state
  const actor = $gameActors.actor($gameVariables.value(20));
  const isDollState = [1, 3, 4, 5].includes(actionType) &&
    actor?.isStateAffected(valueDollStateId);

  if (!isDollState) {
    const handleAction = {
      0: () => { /* 0: 会話用立ち絵変更表示 */
        let fadeDuration, moveDuration;
        if (duration === 0) {
          fadeDuration = 60;
          moveDuration = 30;
        } else {
          fadeDuration = duration * 2;
          moveDuration = duration;
        }

        let picProps = getPicProps(sourcePicId) || {};
        if (valueTacieSet[0] >= 1) {
          picProps = { ...valueTacieSet };
          valueTacieSet = [0, 0, 0, 0, 0, 0];
        }

        if (mode >= 1) {
          param6 >= 1 ? kisekae_tyokusetusitei(param6, expressionId) : tachie_settei2();
          const pic = $gameScreen.picture(targetPicId);
          if (pic) Object.assign(pic, picProps);
        } else {
          $gameScreen.erasePicture(targetPicId);
          $gameScreen.showPicture(
            targetPicId,
            `/img/tachies/${mode}`,
            picProps.origin || 0,
            picProps.x || 0,
            picProps.y || 0,
            picProps.scaleX || 100,
            picProps.scaleY || 100,
            0,
            0
          );
        }

        const movePic = (id, opacity, duration) =>
          $gameScreen.movePicture(id, picProps.origin, picProps.x, picProps.y,
            picProps.scaleX, picProps.scaleY, opacity, 0, duration);

        if (param8 >= 1) {
          if (targetPicId >= sourcePicId) {
            movePic(targetPicId, 255, moveDuration);
            picture_fade1(targetPicId, "fadeIn", 'Hpicture2', moveDuration, 5);
            movePic(sourcePicId, 0, fadeDuration);
          } else {
            movePic(targetPicId, 255, moveDuration);
            picture_fade1(sourcePicId, "fadeOut", 'Hpicture2', fadeDuration, 5);
          }
        } else {
          movePic(targetPicId, 255, moveDuration);
          movePic(sourcePicId, 0, fadeDuration);
        }

        if (SWITCH_126) tachie_bless(targetPicId, 0);
        updateEventImage();
      },

      1: () => { /* 1: 会話用立ち絵表示 */
        const opacity = param6 || $gameVariables.value(159);
        $gameScreen.showPicture(targetPicId, `/img/tachies/${mode}`, 1, 0, yPos, scaleX, scaleY, 0, 0);

        const pic = $gameScreen.picture(targetPicId);
        Object.assign(pic, { _origin: 1, _y: yPos, _scaleY: scaleY, _opacity: 0 });

        let xPos = 640;
        if (sourcePicId === 1) {
          xPos = $gameVariables.value(152) === 0 ? 1124 :
            1280 - xPos + $gameVariables.value(164) - ($gameVariables.value(152) * 80);
          xPos += SWITCH_126 ? 50 : 0;
          $gameVariables.setValue(164, $gameVariables.value(164) + 150);
        } else if (sourcePicId === 2) {
          xPos += $gameVariables.value(165) + ($gameVariables.value(153) * 80);
          $gameVariables.setValue(165, $gameVariables.value(165) - 150);
        }

        $gameScreen.movePicture(targetPicId, 1, xPos, yPos, scaleX, scaleY, opacity, 0, motionDuration);
        if (SWITCH_126) tachie_bless(targetPicId, 0);
      },

      2: () => { /* 2: 着せ替え/表情変更処理 */
        if ($gameScreen.picture(targetPicId)) {
          const pic = $gameScreen.picture(targetPicId);
          valueTacieSet = [pic.origin(), pic.x(), pic.y(), pic.scaleX(), pic.scaleY(), pic.opacity()];
        }

        duration >= 1 ? kisekae_tyokusetusitei(duration, param8) : tachie_settei2();
        updateEventImage();
      },

      3: () => { /* 3: 立ち絵再表示 */
        const tachieNum = Math.max(0, parseInt(targetPicId, 10) - 1);
        if (tachieNum < $TKMvar.tachie.PicData.length) {
          const data = $TKMvar.tachie.PicData[tachieNum];
          if (data?.char) {
            $gameScreen.showPicture(
              data.picNum,
              `TKMtachie_${data.char}_`,
              0,
              data.x,
              data.y,
              85,
              85,
              0,
              0
            );
          }
        }
        pic_set(targetPicId, 1, 255, 10);
        valueTacieSet = [0, 0, 0, 0, 0, 0];
      }
    };

    handleAction[actionType]?.();
  }

  $gameSwitches.setValue(97, false);

  // Helper functions
  function updateEventImage() {
    const eventId = $gameVariables.value(292)?.[$gameVariables.value(20)];
    if (eventId >= 1) {
      const event = $gameMap.event(eventId);
      const actor = $gameActors.actor($gameVariables.value(20));
      event?.setImage(actor.characterName(), actor.characterIndex());
    }
  }

  getPicProps = function (id) {
    const pic = $gameScreen.picture(id);
    return pic ? {
      origin: pic.origin(),
      x: pic.x(),
      y: pic.y(),
      scaleX: pic.scaleX(),
      scaleY: pic.scaleY(),
      opacity: pic.opacity()
    } : null;
  }
};

//☆☆着せ替え直接指定
kisekae_tyokusetusitei = function(id1,id2){

$gameVariables.setValue(19,id1);
if(!$gameParty.hasItem($dataItems[id1])){
  $gameParty.gainItem($dataItems[id1], 1);
  for (var i = 1; i <= 9; i++) {
    if($dataItems[id1].meta['SubstituteGetItem' + 1]){
      $gameParty.gainItem($dataItems[Number($dataItems[id1].meta['SubstituteGetItem' + 1])], 1);
    };
  };
  if($dataItems[id1].meta['TotalCloth'] && $dataItems[id1].meta['subCategory'] && $dataItems[id1].meta['ClothType']){
    clothes_get($gameVariables.value(20),$dataItems[id1].meta['subCategory'],$dataItems[id1].meta['ClothType']);
  };
};
//現在衣装を呼び出し
  var start = 1; var end = 40;
  for (var i = start; i <= end; i++) {
    $gameVariables.setValue(i+460,$gameVariables.value($gameVariables.value(20)+440)[i]);
  };

if($dataItems[$gameVariables.value(19)].meta['ClothSpecify']){
  $gameVariables.value($gameVariables.value(20)+440)[41] = Number($dataItems[$gameVariables.value(19)].meta['TotalCloth']);
  $gameVariables.value($gameVariables.value(20)+440)[0] = $gameVariables.value(19);
  //現在衣装を初期化
    var start = 1; var end = 40;
      for (var i = start; i <= end; i++) {
        $gameVariables.setValue(i+460,0);
      };
      $gameVariables.setValue(465,Number($dataItems[$gameVariables.value(19)].meta['ClothSpecify']));
      if(id2 >= 1){
        $gameVariables.setValue(493,id2);
      };
      $gameActors.actor($gameVariables.value(20)).addState(23);
} else {
  $gameActors.actor($gameVariables.value(20)).removeState(23);
  kisekae_naibusyori1();
};

//衣装情報を更新
var start = 1; var end = 40;
  for (var i = start; i <= end; i++) {
    $gameVariables.value($gameVariables.value(20)+440)[i] = $gameVariables.value(i+460);
  }
tachie_settei2();

};

//☆☆着せ替え内部処理一部
kisekae_naibusyori1 = function(){

  const gameVar20 = $gameVariables.value(20);
  const gameVar20_440 = gameVar20 + 440;
  const gameVar19 = $gameVariables.value(19);
  const item_gameVar19 = $dataItems[gameVar19];
  const clothTypeId460 = 460;

  $gameVariables.value(gameVar20_440)[0] = 0;
  if(item_gameVar19.meta['TotalCloth']){
    $gameVariables.value(gameVar20_440)[41] = Number(item_gameVar19.meta['TotalCloth']);
    $gameVariables.value(gameVar20_440)[0] = gameVar19;
    //現在衣装を初期化
    for (var i = 1; i <= 40; i++) if (i !== 4) $gameVariables.setValue(i + clothTypeId460, 0);

    if(item_gameVar19.meta['subCategory'] !== '全裸'){
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
              const value1 = Number(item.meta['ClothSwitch']);
              const value2 = Number(item.meta['ClothAllocationNumber']);
              $gameVariables.setValue(clothTypeId460 + value1, value2);
            }
          }
        };
      }
    };
  } else {
    const value1 = Number(item_gameVar19.meta['ClothSwitch']);
    const value2 = Number(item_gameVar19.meta['ClothAllocationNumber']);
    $gameVariables.setValue(clothTypeId460 + value1, $gameVariables.value(clothTypeId460 + value1) == value2 ? 0 : value2);
  };

};

//☆☆立ち絵設定。本体
tachie_settei2 = function(){

for (let i = 561; i <= 600; i++) { $gameVariables.setValue(i, 0) };

const gameVar20 = $gameVariables.value(20);
const gameVar20_440_id = gameVar20 + 440;
const actorGameVar20 = $gameActors.actor(gameVar20);
const gameVar20_440 = $gameVariables.value(gameVar20_440_id);

//現在衣装を呼び出し
for (let i = 1; i <= 40; i++) {
  $gameVariables.setValue(i + 460, gameVar20_440[i]);
};
  if (is_girl(actorGameVar20)){
    if (actorGameVar20.isStateAffected(valueDollStateId)){
      for (let i = 1; i <= 40; i++) {
        $gameVariables.setValue(i+560,$gameVariables.value(i+460));
      };
      for (let i = 1; i <= 40; i++) {
        $gameVariables.setValue(i+460,0);
      };
      $gameVariables.setValue(1+460,3);
    } else {
      rosyutu_genkai();
      rosyutu_genzai();
      if (!actorGameVar20.isStateAffected(23)) tachie_settei1();
    }
  };

tachie_naibusyori2();

//一時代入した仮情報を立ち絵指定後に反映
for (let i = 1; i <= 40; i++) {
  const gameVar_i560 = $gameVariables.value(i + 560);
  if (gameVar_i560 >= 1){
    $gameVariables.setValue(i + 460, gameVar_i560);
}};

//衣装情報を更新
for (let i = 1; i <= 40; i++) {
  gameVar20_440[i] = $gameVariables.value(i + 460);
}

charagra_henkou1(gameVar20);
if(is_girl(actorGameVar20)){
  valueLiningCloth[gameVar20] = gameVar20_440[2];
  valueBackHairCloth[gameVar20] = actorGameVar20.isStateAffected(23) ? 1 : gameVar20_440[4];
  valueCoatCloth[gameVar20] = gameVar20_440[28];
  valueFrontHairCloth[gameVar20] = gameVar20_440[32];
  valueBustUpCloth[gameVar20] = gameVar20_440[41];
  valueBustUpCloth2[gameVar20] = valueBustUpCloth[gameVar20];
};

};

//☆☆キャラグラ変更。
charagra_henkou1 = function(id2){

  if (id2 >= 1) {
  const actor = $gameActors.actor(id2);
    if (is_girl(actor)){
    charagra_choice1(id2);
    isyou_senyouLisciaBlueOnly(id2); //りしゃぶるのみの処理
    actor.setCharacterImage(id2 + '_' + $gameVariables.value(21), $gameVariables.value(22));
    actor.setBattlerImage(id2 + '_' + $gameVariables.value(23));
      if(!$gameSwitches.value(30)){
        $gameSwitches.setValue(148,true);
      };
}};

};

// for charagra_choice1
set_charachip_graphics = function(itemMeta){
	$gameVariables.setValue(21, Number(itemMeta['CharaChip1']));//1102は全裸指定
	$gameVariables.setValue(22, Number(itemMeta['CharaChip2']));
	$gameVariables.setValue(23, Number(itemMeta['CharaChipsv']));
}

//☆☆キャラチップ決定用計算
charagra_choice1 = function(id1){

const actor = $gameActors.actor(id1);

if(actor.isStateAffected(23)){
  const itemMeta = $dataItems[$gameVariables.value(id1 + 440)[0]].meta;
  set_charachip_graphics(itemMeta);
  
} else {
  const value5 = $gameVariables.value(id1+380)[4];
  let value1 = $gameVariables.value(id1+440)[0];//0アイテムID
  //var value2 = $gameVariables.value(id1+440)[41];//41会話グラ用指定ID
  set_charachip_graphics($dataItems[zenravalueId].meta);
  
  if(value5 <= 9){
    const charachipDataArr = $gameVariables.value(id1 + 440);
    charachipDataArr[0] = 0;
    charachipDataArr[41] = 1;
    value1 = 0;
  };
  if(value1 == 0 && value5 >= 26){
  //現在衣装を呼び出し
    for (let i = 1; i <= 40; i++) {
      $gameVariables.setValue(i+460,[i]);
    };
    let array = Array(21).fill(0);//21
	  const itemsCount = $dataItems.length;
    for (let id = 461;id<=500;id++){
      for(let i=1331; i < itemsCount; i ++){
        const itemMeta = $dataItems[i].meta;
        if(itemMeta['TotalCloth']) continue;
        
        const itemEICSwitchNum = Number(itemMeta['EICSwitch']);
        let isBreak = false;
        switch(itemEICSwitchNum) {
          case 200:
          case id1 + 180:
          case id1 + 380: {
            if(id == Number(itemMeta['ClothSwitch']) + 460) break;
            if($gameVariables.value(id) != Number(itemMeta['ClothAllocationNumber'])) break;

            //if(itemMeta['SingleCloth']){}else{
            array[Number(itemMeta['subCategory'])] += Number(itemMeta['ClothUncoverCount']);//露出度で加算
            isBreak = true;
          }
        }
        if (isBreak) break;
      }
    }
    const max = array.reduce(function(a,b){  
      return Math.max(a,b);
    });
    let index = array.findIndex(array => array === max); 
    if(index >= 0){
		const itemsCount = $dataItems.length;
        for (let i = 1331; i < itemsCount; i++) {
          const itemMeta = $dataItems[i].meta;
          if (!itemMeta['TotalCloth']) continue;
		  
          const itemEICSwitchNum = Number(itemMeta['EICSwitch']);
          let isBreak = false;
          switch(itemEICSwitchNum) {
            case 400:
            case id1 + 380: {
              if(index != Number(itemMeta['subCategory'])) break;
              
              set_charachip_graphics(itemMeta);

              $gameVariables.value(id1+440)[0] = i;
              $gameVariables.value(id1+440)[41] = Number(itemMeta['TotalCloth']);
              isBreak = true;
            }
          }
          if (isBreak) break;
		    }
	  }
  }
  
  if(value1 >= 1){
    set_charachip_graphics($dataItems[value1].meta);
  }
};
tachie_switchOnOff();

};

//☆☆立ち絵内部処理。本体
tachie_naibusyori2 = function(){

$gameVariables.setValue(118,'actor' + $gameVariables.value(20));//戦闘用立ち絵がある場合はここを改修
if($gameSwitches.value(90)){
  $gameVariables.setValue(117,$gameVariables.value(300));
} else {
  $gameVariables.setValue(117,Number($dataActors[$gameVariables.value(20)].meta['tachiePicId']));
};
if($gameSwitches.value(20)){
  var start = 1; var end = 40;
  for (var j = start; j <= end; j++) {
    if ($gameVariables.value(j+460) >= 0){
      var args = new Array(String($gameVariables.value(118)),String(j),String($gameVariables.value(j+460)));
      tachie_naibusyori1(args);
  }};
  var tachieNum = parseInt($gameVariables.value(117), 10) || 0; // 立ち絵1か2か、それとも…
  tachieNum--; // データ上は0から
  //console.log(tachieNum);
  if(tachieNum === -1) {}else{
    if($TKMvar.tachie.PicData.length <= tachieNum) {}else{
      $gameScreen.erasePicture($TKMvar.tachie.PicData[tachieNum]["picNum"]);
      // $TKMvar.tachie.PicData[tachieNum]["char"] = "";
  }};
  var charName = $gameVariables.value(118);
  // 取得
  var CharList = $TKMvar.tachie.CharList;
  var MaxLayer = $TKMvar.tachie.MaxLayer;
  CharList[charName] = []; // 新しいキャラのパーツ番号の配列を作る
  for(var i = 0; i < MaxLayer; i++) {
    CharList[charName][i] = 0; // すべてのパーツのデフォルト値は0
  };
};
if($gameActors.actor($gameVariables.value(20)).isStateAffected(19)){
  tachie_clear($gameVariables.value(117));
  var start = 1; var end = 40;
  for (var j = start; j <= end; j++) {
    var args = new Array(String($gameVariables.value(118)),String(j),"0");
    tachie_naibusyori1(args);
  };
} else {
  var start = 1; var end = 40;
  for (var j = start; j <= end; j++) {
    var args = new Array(String($gameVariables.value(118)),String(j),String($gameVariables.value(j+460)));
    tachie_naibusyori1(args);
  };
};
var args = new Array(String($gameVariables.value(117)),String($gameVariables.value(118)));
var tachieNum = parseInt(args[0], 10) || 0; // 立ち絵1か2か、それとも…
tachieNum--; // データ上は0から
if(tachieNum === -1) {}else{
  // 取得
  var CharList = $TKMvar.tachie.CharList;
  var MaxLayer = $TKMvar.tachie.MaxLayer;
  var PicData = $TKMvar.tachie.PicData;
  if($TKMvar.tachie.PicData[tachieNum]["char"] === args[1]) {}else{ // キャラが同じなら変更する必要ない
    if( args[1] in CharList ) {
      if(PicData.length > tachieNum) {
        PicData[tachieNum]["char"] = args[1];
        PicData[tachieNum]["bitmap"] = null;
        PicData[tachieNum]["bitmap"] = [];
        // preload bitmap
/*
var partList= $TKMvar.tachie.CharList[args[1]];
for(var i = 0; i < $TKMvar.tachie.MaxLayer; i++) {
if(partList[i] === 0) {
$TKMvar.tachie.PicData[tachieNum]["bitmap"][i] = null;
continue;
}
else {
$TKMvar.tachie.PicData[tachieNum]["bitmap"][i] = ImageManager.loadPicture("/img/tachies/" + args[1] + "_" + $TKMvar.tachie.partsNameArr[i] + "_" + partList[i], 0);
}
}*/
$TKMvar.tachie.preloadBitmap(tachieNum);
}};
}};
var tachieNum = parseInt($gameVariables.value(117), 10) || 0; // 立ち絵1か2か、それとも…
tachieNum--; // データ上は0から
if(tachieNum === -1) {}else{
  if($TKMvar.tachie.PicData.length <= tachieNum) {}else{
    if(!$TKMvar.tachie.PicData[tachieNum]["char"]) {}else{
      var CharList = $TKMvar.tachie.CharList;
      var MaxLayer = $TKMvar.tachie.MaxLayer;
      var PicData = $TKMvar.tachie.PicData;
      var pictureId = PicData[tachieNum]["picNum"];
      var char = PicData[tachieNum]["char"];
      var name = "TKMtachie_" + char + "_";
      var partList = CharList[char];
      var x = $TKMvar.tachie.PicData[tachieNum]["x"];
      var y = $TKMvar.tachie.PicData[tachieNum]["y"];
      $gameScreen.showPicture(pictureId, name, 0, x, y, 85, 85, 0, 0);
}}};

};

//☆☆立ち絵内部処理CP一つずつ
tachie_naibusyori1 = function(args){
if( !(args[0] in $TKMvar.tachie.CharList) ) {}else{ // そんなキャラ名が登録されなかったら無視する
  var CharList = $TKMvar.tachie.CharList;
  var MaxLayer = $TKMvar.tachie.MaxLayer;
  var PicData = $TKMvar.tachie.PicData;
// パーツの名前に対応するレイヤーを探す
  var layerNum = -1;
    for(var i = 0; i < MaxLayer; i++) {
      if($TKMvar.tachie.partsNameArr[i] === args[1]) {
        layerNum = i; 
      break;
      };
    };
  if(layerNum === -1)  {}else{  // そんなレイヤー名がなかったら無視する

    var partNum = parseInt(args[2], 10) || 0;
      if(CharList[args[0]][layerNum] === partNum) {}else{ // パーツが同じなら変更する必要ない
        CharList[args[0]][layerNum] = partNum;
   
// ついでにそのパーツのbitmapをキャッシュしよう
        for(var i = 0; i < PicData.length; i++) {
          if(PicData[i]["char"] == args[0]) {
// bitmap [] の存在確認
          if(!PicData[i]["bitmap"]) $TKMvar.tachie.preloadBitmap(i);
            if(partNum === 0) PicData[i]["bitmap"][layerNum] = null;
              else PicData[i]["bitmap"][layerNum] = 
                ImageManager.loadPicture("/img/tachies/" + args[0] + "_" + $TKMvar.tachie.partsNameArr[layerNum] + "_" + partNum, 0);
                  if(partNum >= 1){
                    Galv.CACHE.load('tachies',args[0] + "_" + $TKMvar.tachie.partsNameArr[layerNum] + "_" + partNum);
                  };
            };
          };
}}};

};

//☆☆立ち絵消去
tachie_syoukyo1 = function(id2){

if($gameScreen.picture(id2)){
  pic_eraseP(0,[id2]);
};
if($gameScreen.picture(7)){
  UTSU.PictureBreath.off([7]);
  $gameScreen.erasePicture(7);
};
if($gameScreen.picture(45)){
  UTSU.PictureBreath.off([45]);
  $gameScreen.erasePicture(45);
};
$gameSwitches.setValue(31,true);
//$gameVariables.setValue(300,0);
};

// using in tachie_hyouji1
const hatIds = [4,31,32,35,    36];
const coatCollarIds = [28,            29];
const nippleIds = [               11];
const armsIds = [17,21,23,24,25,26];
const underwearIds = [7,14,20,       22];
const shoesIds = [18,            27];
hasAnyId = function(array, inputId){
	return array.some(function(id) {return inputId == id});
}
tachie_hyouji1GetSlotMod = function(value1){		
	if(hasAnyId(shoesIds, value1)) {return -1000}//靴
	else if(hasAnyId(underwearIds, value1)) {return -500}//服下
	else if(hasAnyId(armsIds, value1)) {return -300}//腕
	else if(hasAnyId(nippleIds, value1)) {return -200}//乳首
	else if(hasAnyId(coatCollarIds, value1)) {return -100}//コート、首輪
	else if(hasAnyId(hatIds, value1)) { return 100 }//帽子
	
	return 0;
}

//☆☆立ち絵表示
tachie_hyouji1 = function(id3){

const vars = $gameVariables;
vars.setValue(112,id3);
const actorId = vars.value(112);
const actorMeta = $dataActors[actorId].meta;
vars.setValue(300,Number(actorMeta['tachiePicId']));
let value5 = 1;
const actor = $gameActors.actor(actorId);
const isLearnedSkill65 = actor.isLearnedSkill(65);
const isLearnedSkill69 = actor.isLearnedSkill(69);
let list = valueTachieChangeState;
list.forEach(function(id1) {
  if(actor.isStateAffected(id1)){
    value5 += 1;
    const value2 = Math.floor( Math.random() * 51) + 384;
    const value3 = Math.floor( Math.random() * 61) + 40;
    let value4 = 1;
    if(isLearnedSkill65){value4 = 2};
    if(isLearnedSkill69){value4 = 3};
	
    let value6 = 1024;
	const stateMeta = $dataStates[id1].meta;
    if(stateMeta['TachieXline']){
      value6 += Number(stateMeta['TachieXline']);
    };
	
	let name = stateMeta['TachieSet']
    if(stateMeta['TachieActorSpecify']){
      name += actorId + '_' +  value4;
    }
	
	const picId = vars.value(300);
    $gameScreen.showPicture(picId, name, 1, value6, value2, 100, 100, 150, 0);
    if($gameScreen.picture(picId)){
      $gameScreen.movePicture(picId,1,value6,384,100,100,255,0,value3);
    };
  };
}, this);

if(value5 != 1) return;

  $gameSwitches.setValue(31,false);
  const var120value = vars.value(120);
  const var113value = var120value*9;
  vars.setValue(113,var113value);
  const var105value = 1130;
  vars.setValue(105,var105value);//x座標
  vars.setValue(106,var113value);//y座標60-700
  vars.setValue(107,var120value);//x拡大率
  vars.setValue(108,var120value);//y拡大率
  vars.setValue(102,var113value);
  vars.setValue(103,var120value);
  vars.setValue(104,var120value);
  vars.setValue(109,255);//透過率
  vars.setValue(110,40);//ウェイト
  vars.setValue(101,var105value +100);
  vars.setValue(149,0);//表示最初の透明度
let value32 = 0;//残像y軸。途中で数字を入れるためこれだけ先に実行
  if($gameSwitches.value(130)){
    vars.setValue(105,1030);//x座標
  };
  if($gameSwitches.value(200)){
	const var105Value = 780;
    vars.setValue(105,var105Value);//x座標
      if($gameSwitches.value(150)){
        let value1 = 40;
        vars.setValue(103,value1);//x拡大率
        vars.setValue(104,value1);//y拡大率
        vars.setValue(107,value1);//x拡大率
        vars.setValue(108,value1);//y拡大率
        vars.setValue(106,value1*9 +50);
        vars.setValue(102,value1*9 +50);
        vars.setValue(105,var105Value -100);
        vars.setValue(110,20);//ウェイト
      } else {
        let value1 = 100;
        vars.setValue(107,value1);//拡大率
        vars.setValue(108,value1);//拡大率
        vars.setValue(103,value1);//拡大率
        vars.setValue(104,value1);//拡大率
        vars.setValue(105,var105Value -50);
        vars.setValue(106,value1*9);
        vars.setValue(102,value1*9);
      };
      vars.setValue(101,vars.value(105) -50);
  };
  if($gameSwitches.value(200)){
	const itemId = vars.value(19);
    if(itemId >= 1){
      if(!$dataItems[itemId].meta['TotalCloth']){    
        vars.setValue(101,vars.value(105));
      }
    }
    //vars.setValue(110,60);
    else if(itemId == 0){
      vars.setValue(101,vars.value(105) +50);
      vars.setValue(102,vars.value(106));
    } else {
      if(!$gameSwitches.value(150)){
        vars.setValue(106,vars.value(106)-Number(actorMeta['TachiePoseYposition']));
		
		const itemClothSwitch = $dataItems[itemId].meta['ClothSwitch'];
        const value1 = itemClothSwitch ? Number(itemClothSwitch): 0;
        const value2 = tachie_hyouji1GetSlotMod(value1);
		
        
		if(value2 >= 1){value32 = -200};
        if(value2 <= -1){value32 = 200};
        vars.setValue(106,vars.value(106) + value2);
        if(!vars.value(111) == 0){vars.setValue(102,vars.value(111))};
        if(!vars.value(111) == 0){vars.setValue(110,60)};
        vars.setValue(111,vars.value(106));
      }
    }
  } else {
    vars.setValue(106,vars.value(106)-Number(actorMeta['TachiePoseYposition']));
    vars.setValue(102,vars.value(106));
  };
  if($gameSwitches.value(30)){
	const var105 = vars.value(105);
    vars.setValue(101,var105 + 100);//x軸始点
    vars.setValue(110,30);//ウェイト。※変化なし
    if(vars.value(263) >= 2){
      vars.setValue(101,var105 -100);//x軸始点
      vars.setValue(110,20);//ウェイト。※変化なし
    };
      if($gameSwitches.value(143)){
        vars.setValue(101,var105 -50);//x軸始点
        vars.setValue(110,20);//ウェイト。※変化なし
      };
      //vars.setValue(105,1180)//x座標
      //vars.setValue(105,vars.value(105)-50);//x座標
      //vars.setValue(101,vars.value(105) +50)
      //vars.setValue(106,vars.value(113));//y座標60-700
      //vars.setValue(107,vars.value(120));//x拡大率
      //vars.setValue(108,vars.value(120));//y拡大率
      //vars.setValue(109,255);//透過率
      //vars.setValue(110,30);//ウェイト
      //vars.setValue(102,vars.value(106));
      //vars.setValue(103,vars.value(107));
      //vars.setValue(104,vars.value(108));
      vars.setValue(149,50);//表示最初の透明度
  };
  let tachieNum = parseInt(vars.value(300), 10) || 0; // 立ち絵1か2か、それとも…
  tachieNum--; // データ上は0から
//if(tachieNum === -1) break;
//if($TKMvar.tachie.PicData.length <= tachieNum) break;
//if(!$TKMvar.tachie.PicData[tachieNum]["char"]) break;
  //let CharList = $TKMvar.tachie.CharList;
  //let MaxLayer = $TKMvar.tachie.MaxLayer;
const picData = $TKMvar.tachie.PicData;
const pictureId = picData[tachieNum]["picNum"];
const chr = picData[tachieNum]["char"];
const picName = "TKMtachie_" + chr + "_";
  //let partList = CharList[chr];
  //let x = $TKMvar.tachie.PicData[tachieNum]["x"];
  //let y = $TKMvar.tachie.PicData[tachieNum]["y"];
//if($gameActors.actor(vars.value(112)).isStateAffected(23)){
//if(vars.value(vars.value(112)+440)[0] >= 1){
//if($dataItems[vars.value(vars.value(112)+440)[0]].meta['Scale100'] ){
//vars.setValue(103,100);
//vars.setValue(104,100);
//vars.setValue(107,100);
//vars.setValue(108,100);
//vars.setValue(101,1024);
//vars.setValue(102,284);
//vars.setValue(105,1024);
//vars.setValue(106,384);
//}}};
//let value1 = 'easeInOutCubic';

const value31 = vars.value(101) >= vars.value(105) ? 200 : -200;
const value33 = $gameSwitches.value(30) || $gameSwitches.value(200) ? 50 : 100;

picture_motion1("smooth",[0]);
$gameScreen.showPicture(pictureId, picName, 1, 
vars.value(101), vars.value(102), 
vars.value(103), vars.value(104), vars.value(149), 0);
if(is_girl($gameActors.actor(actorId)) && !$gameSwitches.value(150)){
  $gameScreen.showPicture(7, "/img/tachies/" + 'actor' + actorId + '_1_3', 1, 
  vars.value(101)+value31, vars.value(102)+value32, 
  vars.value(103), vars.value(104), value33, 1);
};

const pictureIdDataList = [
	[pictureId, vars.value(109), 0, 0],
	[7, 0, 1, 20]
];
for(const pictureIdData of pictureIdDataList){
	if($gameScreen.picture(pictureIdData[0])){
	  $gameScreen.movePicture(
		  pictureIdData[0],
		  1,
		  vars.value(105),
		  vars.value(106),
		  vars.value(107),
		  vars.value(108),
		  pictureIdData[1],
		  pictureIdData[2],
		  vars.value(110) + pictureIdData[3]
	  );
	}
}

vars.setValue(20,actorId);

tachie_bless(pictureId,1);

if($gameSwitches.value(30)){
  tachie_aura();
}

}

//☆☆立ち絵設定
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const tachie_settei_base_id = 460;
tachie_settei1 = function(){

const actorId = $gameVariables.value(20);
const actor = $gameActors.actor(actorId);

//☆☆立ち絵内部処理前変数割当↓☆☆
for(const id of [1,2,3,5,6,8,9,10,12,13,15,16,19,24,26,30,34,37,38,39,40]) {
  $gameVariables.setValue(tachie_settei_base_id+id,0);
};
if ($gameVariables.value(tachie_settei_base_id + 4) == 0) {
  $gameVariables.setValue(tachie_settei_base_id + 4, 1)
}
for (const id of [5,9,10,15,31,33]) {
  $gameVariables.setValue(tachie_settei_base_id+id,1)
};
if(actor.isStateAffected(61) || actor.isStateAffected(694)){//発情で愛液
  $gameVariables.setValue(tachie_settei_base_id+8,2);
};
if(actor.isStateAffected(63)){//拘束で腕と男
  $gameVariables.setValue(tachie_settei_base_id+9,3);
  $gameVariables.setValue(tachie_settei_base_id+15,3);
  $gameVariables.setValue(tachie_settei_base_id+17,0);
  $gameVariables.setValue(tachie_settei_base_id+24,0);
  $gameVariables.setValue(tachie_settei_base_id+26,0);
  $gameVariables.setValue(tachie_settei_base_id+1,1);
  $gameVariables.setValue(tachie_settei_base_id+38,1);
};
if(actor.isStateAffected(71) || actor.isStateAffected(695)){//濡れた状態で汗
  $gameSwitches.setValue(100,true);
};
if(actor.isStateAffected(83) || actor.isStateAffected(696)){//妊娠でボテ腹
  $gameVariables.setValue(tachie_settei_base_id+12,1);
  if($gameVariables.value(tachie_settei_base_id+14) == 1 &&  actor.isStateAffected(83)){//臍ピアス妊娠有無で変化
    $gameVariables.setValue(tachie_settei_base_id+14,2);
  };
  //$gameVariables.setValue(value1+28,1);//衣装状態の変化も追加//露出によって設定する
};
if(actor.isStateAffected(84) || actor.isStateAffected(697)){//膣内射精
  $gameVariables.setValue(tachie_settei_base_id+8,1);
};
if(actor.isStateAffected(85) || actor.isStateAffected(698)){//顔射精
  $gameVariables.setValue(tachie_settei_base_id+40,1);
};
if(actor.isStateAffected(86) || actor.isStateAffected(699)){//ぶっかけ
  $gameVariables.setValue(tachie_settei_base_id+40,2);
};
//☆☆表情差分↓☆☆
//let value11 = 1;//基本表情
let value11 = getRandomElement([1,1,1,1,1,2,5,6,15]); //WARN:many code executing and value11 re:set many times when for good need to split all by 'else' condition to not run other code when run one time
if($gameSwitches.value(201) || $gameSwitches.value(239)){
  value11 = getRandomElement([4, 4, 4, 4, 5, 4, 4, 4, 4, 8]);
};
if($gameSwitches.value(30)){
   value11 = 4;
    if($gameVariables.value(276) == 1){
      value11 = 9;//被ダメージ表情変化
    };
    if($gameVariables.value(276) == 2){
      value11 = 8;//与ダメージ表情変化
    };
};
const nActorId380 = $gameVariables.value(actorId + 380);
const nActorId400 = $gameVariables.value(actorId + 400);
if(actor.isStateAffected(70)){//下で露出状態による差分変化を行う為に実行。
  if (nActorId400[0] >= 1 && nActorId380[4] <= 9){
      nActorId400[0] = 0;
}};
const n207 = $gameVariables.value(207);
  if (n207 == 101 || n207 >= 1 && n207 == nActorId400[41]){
  } else {
    if($gameSwitches.value(206)){
      } else {
      if (nActorId380[4] < nActorId380[5]){
        value11 = getRandomElement([17, 18, 19, 20, 21, 22, 23, 24]);
          $gameSwitches.setValue(100,true);
        };
      if (nActorId380[4] <= 49){
        if (nActorId380[1] >= 500 && actor.skillMasteryLevel(55) >= 4){
          value11 = getRandomElement([29, 30, 31, 32, 37, 38, 39, 40]);
        }
          $gameSwitches.setValue(100,true);
      }
    }
  }
  if([61,65,84,85,86].some(function(id){return actor.isStateAffected(id)})){//発情、自慰、精液
    // let value5 = 50; 
    // let value6 = 9; 
    // let value2 = 7; 
    // let value3 = 5; 
    // let value4 = 3;
    const nActorId380_1 = nActorId380[1];
    if (nActorId380_1 >= 900) {
      value11 = getRandomElement([29, 30, 31, 32, 37, 38, 39, 40, 41, 42, 43, 44]);
    } else if (nActorId380_1 >= 700) {
      value11 = getRandomElement([25, 26, 27, 28, 29, 30, 31, 32]);
    } else if (nActorId380_1 >= 500) {
      value11 = getRandomElement([21, 22, 23, 24, 25, 26, 27, 28]);
    } else if (nActorId380_1 >= 300) {
      value11 = getRandomElement([17, 18, 19, 20, 21, 22, 23, 24]);
    } else {
      value11 = getRandomElement([17, 18, 19, 20]);
    }
  //$gameSwitches.setValue(100,true);
  }
  if(actor.isStateAffected(63)){//拘束で腕と男
    let value5 = 50; 
    //let value6 = 9; 
    let value2 = 7; 
    //let value3 = 5; 
    //let value4 = 3;
      if(actor.skillMasteryLevel(value5) >= value2) {
        value11 = getRandomElement([37, 38, 39, 40, 41, 42, 43, 44]);
      }else{
        value11 = getRandomElement([17, 18, 19, 20]);
      };
  };
  if(!$gameSwitches.value(143) && actor.isStateAffected(83) || actor.isStateAffected(696)){//妊娠でボテ腹
    let value5 = 50; 
    //let value6 = 9; 
    let value2 = 7; 
    //let value3 = 5; 
    //let value4 = 3;
      if(actor.skillMasteryLevel(value5) < value2) {
        value11 = getRandomElement([21,22,23,24,25,26,27,28]);
      }
  }
  if(!$gameSwitches.value(143) && actor.isStateAffected(68)){//激情
    $gameSwitches.setValue(100,true);
  }
  if(!$gameSwitches.value(143) && $gameSwitches.value(30) && actor.tp >= 100){
    if($gameSwitches.value(100)){
      value11 = 48;
    }else{
      value11 = 47;
    }
  }
  if(actor.isStateAffected(693)){
    $gameSwitches.setValue(100,false);
  };
  if($gameSwitches.value(100)){//発汗
    let value5 = 50; 
    //let value6 = 9; 
    //let value2 = 7; 
    let value3 = 5; 
    //let value4 = 3;
    if(actor.skillMasteryLevel(value5) >= value3) {
      $gameVariables.setValue(tachie_settei_base_id+13,2);
    } else {
      $gameVariables.setValue(tachie_settei_base_id+13,1);
    };
  };
  if($gameSwitches.value(97)){
    value11 = $gameVariables.value(151);//立ち絵会話時
  };
  for (const id1 of valueTachieChangeState) {
    if(actor.isStateAffected(id1)){
      value11 = getRandomElement($dataStates[id1].meta['FaceChange'].split(','));
    }
  };

  $gameSwitches.setValue(100,false);
  $gameVariables.setValue(tachie_settei_base_id+33,value11);

//☆☆共通パーツ前段↓☆☆
if(actor.isStateAffected(22) || actor.isLearnedSkill(66)){}else{//右腕乳房露出時
  if($gameVariables.value(tachie_settei_base_id+21) == 0 && $gameVariables.value(tachie_settei_base_id+23) <= 3 &&
  $gameVariables.value(tachie_settei_base_id+25) == 0 && $gameVariables.value(tachie_settei_base_id+11) == 0){
    $gameVariables.setValue(tachie_settei_base_id+9,4);
  };
  if($gameVariables.value(tachie_settei_base_id+20) == 0 && $gameVariables.value(tachie_settei_base_id+22) == 0){//左腕股間露出時
    $gameVariables.setValue(tachie_settei_base_id+15,4);
  };
};
//発情＆性欲高い＆戦闘以外＆露出高いで腕グラビアポーズ
if(actor.isStateAffected(61) || actor.isStateAffected(694)){
  if (actor.isLearnedSkill(66) && !$gameSwitches.value(30) && $gameVariables.value(actorId + 380)[4] <= 9){
    $gameVariables.setValue(tachie_settei_base_id+15,0);
    $gameVariables.setValue(tachie_settei_base_id+9,2);
  };
};

//☆☆個別衣装設定↓☆☆
kobetu_isyousettei();

//☆☆共通パーツ後段↓☆☆
if($gameVariables.value(tachie_settei_base_id+9) == 4){//右腕乳房隠し時に乳房消去。注意。アムエスでは乳房差分変化なしなので処理変更
  $gameVariables.setValue(tachie_settei_base_id+10,0);
};
if($gameVariables.value(tachie_settei_base_id+19) >= 1  && $gameVariables.value(tachie_settei_base_id+23) == 0){//服下影服なしなら消去
  $gameVariables.setValue(tachie_settei_base_id+19,0);
};
if($gameVariables.value(tachie_settei_base_id+20) == 11){//奴隷ボンテージ。注意。アムエスではボンテージなしなので処理変更
  $gameVariables.setValue(tachie_settei_base_id+10,1);
  $gameVariables.setValue(tachie_settei_base_id+9,1);
  $gameVariables.setValue(tachie_settei_base_id+15,1);
  $gameVariables.setValue(tachie_settei_base_id+24,0);
  $gameVariables.setValue(tachie_settei_base_id+26,0);
};
if($gameVariables.value(tachie_settei_base_id+10) == 0 && $gameVariables.value(tachie_settei_base_id+11) == 1){//乳首ピアス乳房非表示時に隠す
  $gameVariables.setValue(tachie_settei_base_id+111,$gameVariables.value(tachie_settei_base_id+11));
  $gameVariables.setValue(tachie_settei_base_id+11,0);
};
if($gameVariables.value(tachie_settei_base_id+9) == 4){//右腕乳房露出時腕カバー消去
  $gameVariables.setValue(tachie_settei_base_id+117,$gameVariables.value(tachie_settei_base_id+17));
  $gameVariables.setValue(tachie_settei_base_id+17,0);
};
if($gameVariables.value(tachie_settei_base_id+15) == 4){//左腕股間露出時腕カバー消去
  $gameVariables.setValue(tachie_settei_base_id+126,$gameVariables.value(tachie_settei_base_id+26));
  $gameVariables.setValue(tachie_settei_base_id+26,0);
};
if(actor.isStateAffected(83)){//妊娠でボテ腹
  for (const id of [16, 17, 19, 20, 21, 22, 23, 24, 25, 26, 28]) {
    $gameVariables.setValue(tachie_settei_base_id+id+100,$gameVariables.value(tachie_settei_base_id+id));
    $gameVariables.setValue(tachie_settei_base_id+id,0);
  }
  $gameVariables.setValue(tachie_settei_base_id+9,1);
  $gameVariables.setValue(tachie_settei_base_id+10,1);
  $gameVariables.setValue(tachie_settei_base_id+15,1);
  $gameVariables.setValue(tachie_settei_base_id+12,2);
    //if($gameVariables.value(404) >= 5){
    if($gameVariables.value(380+actorId)[4] >= 5){
      $gameVariables.setValue(tachie_settei_base_id+28,1);
      $gameVariables.setValue(tachie_settei_base_id+12,1);
    };
  if($gameVariables.value(tachie_settei_base_id+14) == 1){//臍ピアス時に変化
    $gameVariables.setValue(tachie_settei_base_id+114,$gameVariables.value(tachie_settei_base_id+14));
    $gameVariables.setValue(tachie_settei_base_id+14,2);
  };
};
  if (actor.isStateAffected(83)) {//ぶっかけ腕の状態で変化
    if ([2, 3, 4].some(function (id) { return $gameVariables.value(tachie_settei_base_id + 9) == (id) })) {
      if ($gameVariables.value(tachie_settei_base_id + 40) == 2) {
        $gameVariables.setValue(tachie_settei_base_id + 40, 3);
      }
    }
}
for (const id1 of valueTachieChangeStateTemporary) {
  if(actor.isStateAffected(id1)){//ステートによってパーツに変化を促す一時ステート・その立ち絵会話期間のみ
    const arr = $dataStates[id1].meta['TachieChangeStateTemporary'].split(',');
    const n = tachie_settei_base_id + Number(arr[0]);
    $gameVariables.setValue(n,$gameVariables.value(n));
    $gameVariables.setValue(n,Number(arr[1]));
  };
}

};

//破損時第一段階
clothes_hason1 = function(array,id1){

  const gameVar20 = $gameVariables.value(20);
  if (id1 >= 1) {
    for (let i = 1; i <= 40; i++) {
      $gameVariables.setValue(i + 460, $gameVariables.value(gameVar20 + 440)[i]);
    };
  };
  $gameVariables.setValue(243, 0);
  $gameVariables.setValue(244, 0);
  const value1 = array[Math.floor(Math.random() * array.length)];
  if (value1 == 1) return;
  if ($gameVariables.value(460 + value1) < 1) return;

  const itemCount = $dataItems.length;
  for (let i = 1205; i < itemCount; i++) {
    const item = $dataItems[i];
    if (value1 != Number(item.meta['ClothSwitch'])) continue;
    if ($gameVariables.value(value1 + 460) != Number(item.meta['ClothAllocationNumber'])) continue;

    const itemEICSwitchNum = Number(item.meta['EICSwitch']);
    if (itemEICSwitchNum != 200 && gameVar20 != itemEICSwitchNum - 180 && gameVar20 != itemEICSwitchNum - 380) continue;

    $gameVariables.setValue(243, item.name);
    $gameVariables.setValue(244, i);
    $gameSwitches.setValue(143, true);
    if (item.meta['ClothBreakage']) {
      const itemClothBreakageNum = Number(item.meta['ClothBreakage']);
      if (itemClothBreakageNum != $gameVariables.value(460 + value1)) {
        $gameVariables.setValue(460 + value1, itemClothBreakageNum);
      }
    } else {
      $gameVariables.setValue(460 + value1, 0);
    }
    if (id1 >= 1) {
      $gameVariables.setValue(460 + value1, 0);
    }
    //衣装情報を更新
    for (let i = 1; i <= 40; i++) {
      $gameVariables.value(gameVar20 + 440)[i] = $gameVariables.value(i + 460)
    };
    break;
  }
};

//破損時切れ端ColorHue用
clothes_hason2 = function(id1,id2){

  const item = $dataItems[$gameVariables.value(244)];
  const itemClothSwitch = item.meta['ClothSwitch'];
  if (!itemClothSwitch) return;

  const value6 = $gameVariables.value(20);
  const value7 = Number(itemClothSwitch);
  let value1;
  if (id1 == 0) {
    value1 = Number($dataActors[$gameVariables.value(20)].meta['tachiePicId']);
  } else {
    value1 = id1;
  }
  const pic = $gameScreen.picture(value1);
  if (pic) {
    if (item.meta['EICSwitch']) {
      //let value6 = Number(item.meta['EICSwitch']);
      //if(value6-180 == $gameVariables.value(20)){value6 -= 180}else{value6 -= 200};
      if (item.meta['ClothAllocationNumber']) {
        let value2;
        //if (id1 == 0) {
          value2 = pic._x;//$gameVariables.value(105);
        //} else {
        //value2 = pic._x;
        //}
        const value3 = pic._y;
        const value4 = pic._scaleX;
        const value5 = pic._scaleY;

        const value8 = Number(item.meta['ClothAllocationNumber']);
        $gameScreen.showPicture(valueCountSet1, "/img/tachies/" + 'actor' + value6 + '_' + value7 + '_' + value8, 1, value2, value3, value4, value5, 255, 0);

        if (id2 == 1) {
          $gameScreen.movePicture(valueCountSet1, 1, value2, value3, value4 * 2, value5, 0, 0, 60);
          picture_fade1(valueCountSet1, "fadeOut", 'Hscene005', 60, 5);
        }
        if (id2 == 0) {
          $gameScreen.movePicture(valueCountSet1, 1, value2, value3 + value3, value4, value5, 0, 0, 60);
        }
        valueCountSet1 += 1;
      }
    }
  }

  // was outside of but moved inside of first because of repeating check
  if (id2 !== 1 /* || !itemClothSwitch */) return;
  if (value7 != 20 && value7 != 21 && value7 != 22 && value7 != 23 && value7 != 25) return;
  if (!pic) return;

  if (!item.meta['EICSwitch']) return;

  //let value6 = $gameVariables.value(20);
  //let value6 = Number(item.meta['EICSwitch']);
  //if(value6-180 == $gameVariables.value(20)){value6 -= 180}else{value6 -= 200};
  if (!item.meta['ClothAllocationNumber']) return;

  let value2;
  if (id1 == 0) {
    value2 = $gameVariables.value(105);
  } else {
    value2 = pic._x;
  }
  const value3 = pic._y;
  const value4 = pic._scaleX;
  const value5 = pic._scaleY;

  //let value8 = Number(item.meta['ClothAllocationNumber']);
  let value11 = 0;
  let value12 = 0;
  if (item.meta['ColorHue2']) {
    const itemColorHue2DataArray = item.meta['ColorHue2'].split(',');
    const value9 = Number(itemColorHue2DataArray[0]);
    const value10 = Number(itemColorHue2DataArray[1]);
    //let value14 = Number(item.meta['ColorHue2'].split(',')[2]);
    if (value9 == 1) {
      value11 = value10;
    } else {
      value12 = value10;
    }
    //Galv.CACHE.load('pictures','actor' + value6 + '_' + 42 + '_' + value7);
    //$gameScreen.showPicture_hue(valueCountSet1,'actor' + value6 + '_' + 42 + '_' + value7,value14,1,
    //value2+value11,value3+value12,value4-value4-value4,value5-value5-value5,255,0);
    $gameScreen.showPicture(valueCountSet1, "/img/tachies/" + 'actor' + value6 + '_' + 42 + '_' + value7, 1,
      value2 + value11, value3 + value12, value4 - value4 - value4, value5 - value5 - value5, 255, 0);
    if (id2 == 1) {
      $gameScreen.movePicture(valueCountSet1, 1, value2 + value11, value3 + value12, value4 - value4 - value4, value5 - value5 - value5, 0, 0, 60);
      picture_fade1(valueCountSet1, "fadeOut", 'Hscene005', 60, 5);
    }
    else if (id2 == 0) {
      $gameScreen.movePicture(valueCountSet1, 1, value2, value3 + value3, value4 - value4 - value4, value5 - value5 - value5, 0, 0, 60);
    }
    valueCountSet1 += 1;
  }
  if (item.meta['ColorHue']) {
    //let value13 = Number(item.meta['ColorHue']);
    //$gameScreen.showPicture_hue(valueCountSet1,'actor' + value6 + '_' + 42 + '_' + value7,value13,1,value2,value3,value4,value5,255,0);
    $gameScreen.showPicture(valueCountSet1, "/img/tachies/" + 'actor' + value6 + '_' + 42 + '_' + value7, 1, value2, value3, value4, value5, 255, 0);
  } else {
    $gameScreen.showPicture(valueCountSet1, "/img/tachies/" + 'actor' + value6 + '_' + 42 + '_' + value7, 1, value2, value3, value4, value5, 255, 0);
  }
  if (id2 == 1) {
    $gameScreen.movePicture(valueCountSet1, 1, value2, value3, value4, value5, 0, 0, 60);
    picture_fade1(valueCountSet1, "fadeOut", 'Hscene005', 60, 5);
  }
  else if (id2 == 0) {
    $gameScreen.movePicture(valueCountSet1, 1, value2, value3 + value3, value4, value5, 0, 0, 60);
  }
  valueCountSet1 += 1;
};

//着せ替え時統合衣装他処理
clothes_change1 = function(){

const id = 1;
const value1 = 380 + $gameVariables.value(20); 
const value2 = 400;
const itemsCount = $dataItems.length;

valueRandomSet = Array(101).fill(0);

let j = 1;
for(let i = 1; i < itemsCount; i ++){
  const item = $dataItems[i];
  if ($gameParty.hasItem(item)){
    const value3 = Number(item.meta['EICSwitch']);
      if(value3 == value1 || value3 == value2 ){
        const choiceParams = {
        text: item.name,
        value: i};
        $gameSystem.addCustomChoice(id, choiceParams);
        valueRandomSet[j] = i;
        j ++;
      }
  }
}

};

//着せ替え時単品目処理
clothes_change2 = function(){

const id = 2;
const actorId = $gameVariables.value(20);
const value1 = 380 + actorId; 
const value2 = 400;
const itemsCount = $dataItems.length;
const item19 = $dataItems[$gameVariables.value(19)];

$gameScreen.showPicture(100,'/img/tachies/actor' + actorId + '_5_99',1,1200,550,20,20,200,0);
valueRandomSet = Array(201).fill(0);

let j = 1;
for(let i=1; i < itemsCount; i ++){
  const item = $dataItems[i];
  if ($gameParty.hasItem(item) && 
    item19.meta['subCategory'] == item.meta['subCategory'] ){
    const itemEICSwitchNum = Number(item.meta['EICSwitch']);
      if(itemEICSwitchNum == value1 || itemEICSwitchNum == value2 || itemEICSwitchNum == value1-200 || itemEICSwitchNum == value2-200){
        const choiceParams = { text: item.name, value: i };
        $gameSystem.addCustomChoice(id, choiceParams);
        if(!item.meta['TotalCloth']){
          if(Number(item.meta['ClothAllocationNumber']) >= 1){
            $gameScreen.showPicture(j + 100, "/img/tachies/" + 'actor' + actorId + '_' + Number(item.meta['ClothSwitch']) + '_' + Number(item.meta['ClothAllocationNumber']),1,1200,550,20,20,0,0);
            $gameMessage.setSelectPictureId(j-1, j+100);
          };
        };
        valueRandomSet[j] = i;
        j++;
      }
  }
}

};

//衣装取得
clothes_get = function(id,value1,value2){

  $gameVariables.setValue(20,id); // replaced $gameVariables.value(20) below by id, get id is much faster than get variable value
  const items = $dataItems;
  const itemsCount = items.length;
  for(let i1=1301; i1 < itemsCount; i1 ++){
    const item = items[i1];
    const itemEICSwitchNum = Number(item.meta['EICSwitch']);
    if (id + 380 == itemEICSwitchNum || id + 180 == itemEICSwitchNum || 200 == itemEICSwitchNum || 400 == itemEICSwitchNum) {
      if (item.meta['subCategory'] == value1 && item.meta['ClothType'] == value2) {
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
    if (is_girl(actor)) { // 女のみ, girls only
      $gameVariables.setValue(20, actor.actorId());
      tachie_settei2();
    }
  }
}

//}());

