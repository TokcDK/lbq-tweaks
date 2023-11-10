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

//☆☆立ち絵会話動作用
tachie_dousa = function(id1,id2,id3,id4,id5,id6,id7,id8,id9){

console.warn(`tachie_dousa Run!`);
//基本数値。常に経由する。

  $gameSwitches.setValue(97, true);
  let value7 = id5 == 0 ? 50 : -50;
  let value1, value6;
  if($gameSwitches.value(127)){
    value1 = 'easeOutBack'; //WARN:not using, re:set below as int!
    value6 = 40;
    picture_motion1("smooth", [0]);
  } else {
    value1 = 'easeInOutQuad';
    value6 = 60;
    picture_motion1("smooth", [0]);
  };

  let value3; //this.sVal(149,100);
  let value4; //this.sVal(150,100);//拡縮x,拡縮y
  let value2; //this.sVal(157,900);//y座標
  //if(id2 >= 1 || id2 == 0){ //WARN: Any?! 0 and more of 1! temp replaced by next line 
  if(id2 >= 0){
    $gameVariables.setValue(20,id2);
    $gameVariables.setValue(300,id4);
    $gameVariables.setValue(151, id3);//表情代入

    if($gameSwitches.value(126)){
    } else {
      value3 = 50; //this.sVal(149,50);
      value4 = 50; //this.sVal(150,50);//拡縮x,拡縮y
      value2 = 550; //this.sVal(157,600);//y座標
    };
  } else {
    if($gameSwitches.value(126)){
      value3 = 200; //this.sVal(149,200);//拡縮x,拡縮y
      value4 = 200; //this.sVal(150,200);
      value2 = 700; //this.sVal(157,700);//y座標
    } else {
      value3 = 100; //this.sVal(149,100);//拡縮x,拡縮y
      value4 = 100; //this.sVal(150,100);
      value2 = 400; //this.sVal(157,450);//y座標384
    };
    if(id2.match(/SS/)){
      if($gameSwitches.value(126)){
        value3 = 70; //this.sVal(149,100);
        value4 = 70; //this.sVal(150,100);//拡縮x,拡縮y
        value2 = 700; //this.sVal(157,900);//y座標
      } else {
        value3 = 50; //this.sVal(149,50);
        value4 = 50; //this.sVal(150,50);//拡縮x,拡縮y
        value2 = 550; //this.sVal(157,600);//y座標
      };
    };
    if(id2.match(/Upper/)){
      value2 = 384; //this.sVal(157,450);//y座標
    };
    if(id2.match(/Scale/)){
      value3 = 100;
      value2 = 384; //this.sVal(157,450);//y座標
    };
    if(id2.match(/State/)){
      value3 = 100; //this.sVal(149,100);//拡縮x,拡縮y
      value4 = 100; //this.sVal(150,100);
      value2 = 384; //this.sVal(157,450);
    };
  };

value1 = 0; 
const actor = $gameActors.actor($gameVariables.value(20));
if([1,3,4,5].some(function(id){return id1 == id})){
  if(actor.isStateAffected(valueDollStateId)){
    value1 = 1; 
  }
}

if(value1 == 0){
//0会話用立ち絵変更表示。ピクチャを変更させて消去を見せないようにする。
if(id1 == 0){//tachie_dousa(0,1,2,12,13,1205,60,0,0);
  let value8;
  if(id7 == 0){
    value7 = 60;
    value8 = 30;
  } else {
    value7 = id7 + id7;
    value8 = id7;
  };
  let value1;
  let value2;
  let value3;
  let value4;
  let value5;
  let value6;
  if($gameScreen.picture(id5)){
    const pic = $gameScreen.picture(id5);
    value1 = pic.origin();
    value2 = pic.x();
    value3 = pic.y();
    value4 = pic.scaleX();
    value5 = pic.scaleY();
    value6 = pic.opacity();
  }
  if(valueTacieSet[0] >= 1){
    value1 = valueTacieSet[0];
    value2 = valueTacieSet[1];
    value3 = valueTacieSet[2];
    value4 = valueTacieSet[3];
    value5 = valueTacieSet[4];
    value6 = valueTacieSet[5];
    valueTacieSet = [0,0,0,0,0,0];
  }
  if(id2 >= 1){
    if(id6 >= 1){
      kisekae_tyokusetusitei(id6,id3);//立ち絵設定含んでいる1309,1328
    } else {
    //$gameVariables.setValue(151,id3);//表情代入
      tachie_settei2();
    };
    const pic = $gameScreen.picture(id4);
    pic._origin = value1;
    pic._x = value2;
    pic._y = value3;
    pic._scaleX = value4;
    pic._scaleY = value5;
    pic._opacity = 0;//value6;
  } else {
    if($gameScreen.picture(id4)){
      $gameScreen.erasePicture(id4);
    };
    $gameScreen.showPicture(id4,"/img/tachies/" + id2,value1,value2,value3,value4,value5,0,0);
  };
  if(id8 >= 1){
    if(id4 >= id5){
      $gameScreen.movePicture(id4,value1,value2,value3,value4,value5,value6, 0,value8);
      picture_fade1(id4,"fadeIn",'Hpicture2',value8,5);
      $gameScreen.movePicture(id5,value1,value2,value3,value4,value5,0, 0,value7);
      //picture_fade1(id5,"fadeOut",'Hpicture3',value7,5);
    } else {
      $gameScreen.movePicture(id4,value1,value2,value3,value4,value5,value6, 0,value8);
      picture_fade1(id5,"fadeOut",'Hpicture2',value7,5);
    };
  } else {
    $gameScreen.movePicture(id4,value1,value2,value3,value4,value5,value6, 0,value8);
    $gameScreen.movePicture(id5,value1,value2,value3,value4,value5,0, 0,value7);
  };
  if($gameSwitches.value(126)){
    tachie_bless(id4,0);
  };
  if($gameVariables.value(292) != 0){
    if($gameVariables.value(292)[$gameVariables.value(20)] >= 1){
      const event = $gameMap.event($gameVariables.value(292)[$gameVariables.value(20)]);
      const actor = $gameActors.actor($gameVariables.value(20));
      event.setImage(actor.characterName(), actor.characterIndex());
    };
  };
}
//1会話用立ち絵表示。変数164と165は会話立ち絵開始コモンで0にしている。
else if(id1 == 1){
  let value5 = id6;//this.sVal(160,$gameVariables.value(159));//透明度代入
    if(id2 >= 1){
      tachie_settei2();
    } else {
      $gameScreen.showPicture(id4,"/img/tachies/" + id2,1,value1,value2,value3,value4,0, 0);
    };
    $gameScreen.picture(id4)._origin = 1;
    $gameScreen.picture(id4)._y = value2;
    $gameScreen.picture(id4)._scaleY = value4;
    $gameScreen.picture(id4)._opacity = 0;
      if(id5 == 1){
        value1 = 300; //this.sVal(155,800);//this.sVal(156,300);//最初右x,左x
      } else {
        value1 = 100; //this.sVal(155,900);//this.sVal(156,200);//最初右x,左x
      };
      if(id5 == 0){
        value1 = 640;
        $gameScreen.picture(id4)._x = value1+50;
      };
      if(id5 == 1){
        if($gameVariables.value(152) == 0){
          value1 = 1024+100;
        } else {
          value1 = 1280 - value1 + $gameVariables.value(164) - ($gameVariables.value(152) * 80);
        };
        if($gameSwitches.value(126)){let value1 = value1 + 50};
        $gameScreen.picture(id4)._x = value1+100;
        $gameVariables.setValue(164,$gameVariables.value(164) + 150);
      };
      if(id5 == 2){
        value1 = value1 + $gameVariables.value(165) + ($gameVariables.value(153) * 80);
        $gameScreen.picture(id4)._x = value1-100;
        value3 = value3-value3-value3;
        $gameVariables.setValue(165,$gameVariables.value(165) - 150);
      };
      $gameScreen.picture(id4)._scaleX = value3;
      $gameScreen.movePicture(id4,1,value1,value2,value3,value4,value5, 0,value6);
      if($gameSwitches.value(126)){
        tachie_bless(id4,0);
      };
}
//着せ替えと表情変化内部処理。フェードアウトインはイベントコマンドで行う。
else if(id1 == 2){
//AudioManager.playSe({"name":"Z_ClothesTakeOff","volume":150,"pitch":50,"pan":value7});
  if($gameScreen.picture(id4)){
    const pic = $gameScreen.picture(id4);
    valueTacieSet = [pic.origin(),pic.x(),pic.y(),pic.scaleX(),pic.scaleY(),pic.opacity()];
  };
  if(id7 >= 1){
    kisekae_tyokusetusitei(id7,id8);//立ち絵設定含んでいる
  } else {
    tachie_settei2();
  };
  if($gameVariables.value(292)){
    if($gameVariables.value(292)[$gameVariables.value(20)] >= 1){
      let event = $gameMap.event($gameVariables.value(292)[$gameVariables.value(20)]);
      let actor = $gameActors.actor($gameVariables.value(20));
      event.setImage(actor.characterName(), actor.characterIndex());
    };
  };
  //$gameScreen.picture(id4)._opacity = 255;
  //$gameScreen.erasePicture(id4);
  //原因不明だがピクチャが初期化されるため、その対応↓
  const pic = $gameScreen.picture(id4);
  pic._origin = valueTacieSet[0];
  pic._x = valueTacieSet[1];
  pic._y = valueTacieSet[2];
  pic._scaleX = valueTacieSet[3];
  pic._scaleY = valueTacieSet[4];
  pic._opacity = valueTacieSet[5];
}
//3立ち絵再表示スクリプト。
else if(id1 == 3){
  let tachieNum = parseInt(id4, 10) || 0; // 立ち絵1か2か、それとも…
  tachieNum--; // データ上は0から
  if(tachieNum === -1) {}else{
    if($TKMvar.tachie.PicData.length <= tachieNum) {}else{
      if(!$TKMvar.tachie.PicData[tachieNum]["char"]) {}else{
        //let charList = $TKMvar.tachie.CharList;
        //let MaxLayer = $TKMvar.tachie.MaxLayer;
        const picData = $TKMvar.tachie.PicData;
        const pictureId = picData[tachieNum]["picNum"];
        const char = picData[tachieNum]["char"];
        const name = "TKMtachie_" + char + "_";
        //let partList = charList[char];
        const x = $TKMvar.tachie.PicData[tachieNum]["x"];
        const y = $TKMvar.tachie.PicData[tachieNum]["y"];
        $gameScreen.showPicture(pictureId, name, 0, x, y, 85, 85, 0, 0);
      }
    }
  }
  const pic = $gameScreen.picture(id4);
  pic._origin = valueTacieSet[0];
  pic._x = valueTacieSet[1];
  pic._y = valueTacieSet[2];
  pic._scaleX = valueTacieSet[3];
  pic._scaleY = valueTacieSet[4];
  pic._opacity = valueTacieSet[5];
  //$gameScreen.movePicture(id4,1,value1,value2,value3,value4,value5, 0,10);
  pic_set(id4,1,255,10);
  valueTacieSet = [0,0,0,0,0,0];
};
}//value1の条件分岐
$gameSwitches.setValue(97,false);

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
  if (actorGameVar20.isStateAffected(602)){
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
if(actorGameVar20.isStateAffected(602)){
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
    if (actor.isStateAffected(602)){
    charagra_choice1(id2);
    isyou_senyouLisciaBlueOnly(id2); //りしゃぶるのみの処理
    actor.setCharacterImage(id2 + '_' + $gameVariables.value(21), $gameVariables.value(22));
    actor.setBattlerImage(id2 + '_' + $gameVariables.value(23));
      if(!$gameSwitches.value(30)){
        $gameSwitches.setValue(148,true);
      };
}};

};

//☆☆キャラチップ決定用計算
charagra_choice1 = function(id1){

const actor = $gameActors.actor(id1);

if(actor.isStateAffected(23)){
  const item = $dataItems[$gameVariables.value(id1 + 440)[0]];
  $gameVariables.setValue(21, Number(item.meta['CharaChip1']));
  $gameVariables.setValue(22, Number(item.meta['CharaChip2']));
  $gameVariables.setValue(23, Number(item.meta['CharaChipsv']));
} else {
  var value5 = $gameVariables.value(id1+380)[4];
  var value1 = $gameVariables.value(id1+440)[0];//0アイテムID
  //var value2 = $gameVariables.value(id1+440)[41];//41会話グラ用指定ID
  const item_zenravalueId = $dataItems[zenravalueId];
  $gameVariables.setValue(21, Number(item_zenravalueId.meta['CharaChip1']));//1102は全裸指定
  $gameVariables.setValue(22, Number(item_zenravalueId.meta['CharaChip2']));
  $gameVariables.setValue(23, Number(item_zenravalueId.meta['CharaChipsv']));
  const gameVarid1440 = $gameVariables.value(id1 + 440);
  if(value5 <= 9){
    gameVarid1440[0] = 0;
    gameVarid1440[41] = 1;
    var value1 = 0;
  };
  if(value1 == 0 && value5 >= 26){
  //現在衣装を呼び出し
    for (var i = 1; i <= 40; i++) {
      $gameVariables.setValue(i+460,[i]);
    };
    let array = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];//21
    for (let id = 461;id<=500;id++){
      for(let i=1331; i < $dataItems.length; i ++){
        if(!$dataItems[i].meta['TotalCloth']){
          const item = $dataItems[i];
          const itemEICSwitchNum = Number(item.meta['EICSwitch']);
          if (id1 + 180 == itemEICSwitchNum ||
          id1 + 380 == itemEICSwitchNum ||
          200 == itemEICSwitchNum ){
            if(id == Number(item.meta['ClothSwitch']) + 460 &&
            $gameVariables.value(id) == Number(item.meta['ClothAllocationNumber'])) {
              //if(item.meta['SingleCloth']){}else{
              array[Number(item.meta['subCategory'])] += Number(item.meta['ClothUncoverCount']);//露出度で加算
              break;
            };
       }}};
    };
    const max = array.reduce(function(a,b){  
    return Math.max(a,b);
    });
    let index = array.findIndex(array => array === max); 
    if(index >= 0){
      if(index == 0){}else{
        for (let i = 1331; i < $dataItems.length; i++) {
          const item = $dataItems[i];
          if (item.meta['TotalCloth']) {
            const itemEICSwitchNum = Number(item.meta['EICSwitch']);
            if (id1 + 380 == itemEICSwitchNum ||
              400 == itemEICSwitchNum ){
                if(index == Number(item.meta['subCategory'])){
                  $gameVariables.setValue(21,Number(item.meta['CharaChip1']));
                  $gameVariables.setValue(22,Number(item.meta['CharaChip2']));
                  $gameVariables.setValue(23,Number(item.meta['CharaChipsv']));
                  $gameVariables.value(id1+440)[0] = i;
                  $gameVariables.value(id1+440)[41] = Number(item.meta['TotalCloth']);
                  break;
     }}}}}};

  };
  if(value1 >= 1){
    const item1 = $dataItems[value1];
    $gameVariables.setValue(21, Number(item1.meta['CharaChip1']));
    $gameVariables.setValue(22, Number(item1.meta['CharaChip2']));
    $gameVariables.setValue(23, Number(item1.meta['CharaChipsv']));
  };
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

//☆☆立ち絵表示
tachie_hyouji1 = function(id3){

$gameVariables.setValue(112,id3);
$gameVariables.setValue(300,Number($dataActors[$gameVariables.value(112)].meta['tachiePicId']));
var value5 = 1;
var actor = $gameActors.actor($gameVariables.value(112));
var list = valueTachieChangeState;
list.forEach(function(id1) {
  if(actor.isStateAffected(id1)){
    value5 += 1;
    var value2 = Math.floor( Math.random() * 51) + 384;
    var value3 = Math.floor( Math.random() * 61) + 40;
    var value4 = 1;
    if(actor.isLearnedSkill(65)){value4 += 1};
    if(actor.isLearnedSkill(69)){value4 += 1};
    var value6 = 1024;
    if($dataStates[id1].meta['TachieXline']){
      value6 += Number($dataStates[id1].meta['TachieXline']);
    };
    if($dataStates[id1].meta['TachieActorSpecify']){
      var name = $dataStates[id1].meta['TachieSet'] + $gameVariables.value(112) + '_' +  value4;
    } else {
      var name = $dataStates[id1].meta['TachieSet'];
    };
    $gameScreen.showPicture($gameVariables.value(300), name, 1, value6, value2, 100, 100, 150, 0);
    if($gameScreen.picture($gameVariables.value(300))){
      $gameScreen.movePicture($gameVariables.value(300),1,value6,384,100,100,255,0,value3);
    };
  };
}, this);
if(value5 == 1){
  $gameSwitches.setValue(31,false);
  $gameVariables.setValue(113,$gameVariables.value(120)*9);
  $gameVariables.setValue(105,1130);//x座標
  $gameVariables.setValue(106,$gameVariables.value(113));//y座標60-700
  $gameVariables.setValue(107,$gameVariables.value(120));//x拡大率
  $gameVariables.setValue(108,$gameVariables.value(120));//y拡大率
  $gameVariables.setValue(109,255);//透過率
  $gameVariables.setValue(110,40);//ウェイト
  $gameVariables.setValue(101,$gameVariables.value(105) +100);
  $gameVariables.setValue(102,$gameVariables.value(106));
  $gameVariables.setValue(103,$gameVariables.value(107));
  $gameVariables.setValue(104,$gameVariables.value(108));
  $gameVariables.setValue(149,0);//表示最初の透明度
  var value32 = 0;//残像y軸。途中で数字を入れるためこれだけ先に実行
  if($gameSwitches.value(130)){
    $gameVariables.setValue(105,1030);//x座標
  };
  if($gameSwitches.value(200)){
    $gameVariables.setValue(105,780);//x座標
      if($gameSwitches.value(150)){
        var value1 = 40;
        $gameVariables.setValue(103,value1);//x拡大率
        $gameVariables.setValue(104,value1);//y拡大率
        $gameVariables.setValue(107,value1);//x拡大率
        $gameVariables.setValue(108,value1);//y拡大率
        $gameVariables.setValue(106,$gameVariables.value(107)*9);
        $gameVariables.setValue(102,$gameVariables.value(107)*9);
        $gameVariables.setValue(105,$gameVariables.value(105) -100);
        $gameVariables.setValue(106,$gameVariables.value(106) +50);
        $gameVariables.setValue(102,$gameVariables.value(102) +50);
        $gameVariables.setValue(110,20);//ウェイト
      } else {
        var value1 = 100;
        $gameVariables.setValue(107,value1);//拡大率
        $gameVariables.setValue(108,value1);//拡大率
        $gameVariables.setValue(103,value1);//拡大率
        $gameVariables.setValue(104,value1);//拡大率
        $gameVariables.setValue(105,$gameVariables.value(105) -50);
        $gameVariables.setValue(106,$gameVariables.value(107)*9);
        $gameVariables.setValue(102,$gameVariables.value(107)*9);
      };
      $gameVariables.setValue(101,$gameVariables.value(105) -50);
  };
  if($gameSwitches.value(200)){
    if($gameVariables.value(19) >= 1){
      if(!$dataItems[$gameVariables.value(19)].meta['TotalCloth']){    
        $gameVariables.setValue(101,$gameVariables.value(105));
      };
    };
    //$gameVariables.setValue(110,60);
    if($gameVariables.value(19) == 0){
      $gameVariables.setValue(101,$gameVariables.value(105) +50);
      $gameVariables.setValue(102,$gameVariables.value(106));
    } else {
      if(!$gameSwitches.value(150)){
        $gameVariables.setValue(106,$gameVariables.value(106)-Number($dataActors[$gameVariables.value(112)].meta['TachiePoseYposition']));
          if($dataItems[$gameVariables.value(19)].meta['ClothSwitch']){
            var value1 = Number($dataItems[$gameVariables.value(19)].meta['ClothSwitch']);
          } else {
            var value1 = 0;
          };
        var value2 = 0;
        if([4,31,32,35,    36].some(function(id){return value1 == id})){value2 = 100};//帽子
        if([28,            29].some(function(id){return value1 == id})){value2 = -100};//コート、首輪
        if([               11].some(function(id){return value1 == id})){value2 = -200};//乳首
        if([17,21,23,24,25,26].some(function(id){return value1 == id})){value2 = -300};//腕
        if([7,14,20,       22].some(function(id){return value1 == id})){value2 = -500};//服下
        if([18,            27].some(function(id){return value1 == id})){value2 = -1000};//靴
        if(value2 >= 1){var value32 = -200};
        if(value2 <= -1){var value32 = 200};
        $gameVariables.setValue(106,$gameVariables.value(106) + value2);
        if(!$gameVariables.value(111) == 0){$gameVariables.setValue(102,$gameVariables.value(111))};
        if(!$gameVariables.value(111) == 0){$gameVariables.setValue(110,60)};
        $gameVariables.setValue(111,$gameVariables.value(106));
      } else {
      };
    };
  } else {
    $gameVariables.setValue(106,$gameVariables.value(106)-Number($dataActors[$gameVariables.value(112)].meta['TachiePoseYposition']));
    $gameVariables.setValue(102,$gameVariables.value(106));
  };
  if($gameSwitches.value(30)){
    $gameVariables.setValue(101,$gameVariables.value(105) + 100);//x軸始点
    $gameVariables.setValue(110,30);//ウェイト。※変化なし
    if($gameVariables.value(263) >= 2){
      $gameVariables.setValue(101,$gameVariables.value(105) -100);//x軸始点
      $gameVariables.setValue(110,20);//ウェイト。※変化なし
    };
      if($gameSwitches.value(143)){
        $gameVariables.setValue(101,$gameVariables.value(105) -50);//x軸始点
        $gameVariables.setValue(110,20);//ウェイト。※変化なし
      };
      //$gameVariables.setValue(105,1180)//x座標
      //$gameVariables.setValue(105,$gameVariables.value(105)-50);//x座標
      //$gameVariables.setValue(101,$gameVariables.value(105) +50)
      //$gameVariables.setValue(106,$gameVariables.value(113));//y座標60-700
      //$gameVariables.setValue(107,$gameVariables.value(120));//x拡大率
      //$gameVariables.setValue(108,$gameVariables.value(120));//y拡大率
      //$gameVariables.setValue(109,255);//透過率
      //$gameVariables.setValue(110,30);//ウェイト
      //$gameVariables.setValue(102,$gameVariables.value(106));
      //$gameVariables.setValue(103,$gameVariables.value(107));
      //$gameVariables.setValue(104,$gameVariables.value(108));
      $gameVariables.setValue(149,50);//表示最初の透明度
  };
  var tachieNum = parseInt($gameVariables.value(300), 10) || 0; // 立ち絵1か2か、それとも…
  tachieNum--; // データ上は0から
//if(tachieNum === -1) break;
//if($TKMvar.tachie.PicData.length <= tachieNum) break;
//if(!$TKMvar.tachie.PicData[tachieNum]["char"]) break;
  //var CharList = $TKMvar.tachie.CharList;
  //var MaxLayer = $TKMvar.tachie.MaxLayer;
  var PicData = $TKMvar.tachie.PicData;
  var pictureId = PicData[tachieNum]["picNum"];
  var char = PicData[tachieNum]["char"];
  var name = "TKMtachie_" + char + "_";
  //var partList = CharList[char];
  //var x = $TKMvar.tachie.PicData[tachieNum]["x"];
  //var y = $TKMvar.tachie.PicData[tachieNum]["y"];
//if($gameActors.actor($gameVariables.value(112)).isStateAffected(23)){
//if($gameVariables.value($gameVariables.value(112)+440)[0] >= 1){
//if($dataItems[$gameVariables.value($gameVariables.value(112)+440)[0]].meta['Scale100'] ){
//$gameVariables.setValue(103,100);
//$gameVariables.setValue(104,100);
//$gameVariables.setValue(107,100);
//$gameVariables.setValue(108,100);
//$gameVariables.setValue(101,1024);
//$gameVariables.setValue(102,284);
//$gameVariables.setValue(105,1024);
//$gameVariables.setValue(106,384);
//}}};
//var value1 = 'easeInOutCubic';
if($gameVariables.value(101) >= $gameVariables.value(105)){
  var value31 = 200;
} else {
  var value31 = -200;
};
if($gameSwitches.value(30)){
  //var value1 = 'easeInQuad';
  var value33 = 50;
} else {
  if($gameSwitches.value(200)){
    //var value1 = 'easeOutQuad';
    var value33 = 50;
  } else {
    //var value1 = 'easeInQuad';
    //var value1 = 'easeOutQuad';
    var value33 = 100;
  };
};
picture_motion1("smooth",[0]);
$gameScreen.showPicture(pictureId, name, 1, 
$gameVariables.value(101), $gameVariables.value(102), 
$gameVariables.value(103), $gameVariables.value(104), $gameVariables.value(149), 0);
if($gameActors.actor($gameVariables.value(112)).isStateAffected(602) && !$gameSwitches.value(150)){
  $gameScreen.showPicture(7, "/img/tachies/" + 'actor' + $gameVariables.value(112) + '_1_3', 1, 
  $gameVariables.value(101)+value31, $gameVariables.value(102)+value32, 
  $gameVariables.value(103), $gameVariables.value(104), value33, 1);
};
var value1 = pictureId;
if($gameScreen.picture(value1)){
  $gameScreen.movePicture(value1,1,
  $gameVariables.value(105),
  $gameVariables.value(106),
  $gameVariables.value(107),
  $gameVariables.value(108),
  $gameVariables.value(109),
  0,$gameVariables.value(110));
};
if($gameScreen.picture(7)){
  $gameScreen.movePicture(7,1,
  $gameVariables.value(105),
  $gameVariables.value(106),
  $gameVariables.value(107),
  $gameVariables.value(108),
  0,1,$gameVariables.value(110) + 20);
};
$gameVariables.setValue(20,$gameVariables.value(112));
tachie_bless(value1,1);
if($gameSwitches.value(30)){
  tachie_aura();
};
};

};

//☆☆立ち絵設定
tachie_settei1 = function(){

var value1 = 460;
const actorId = $gameVariables.value(20);
const actor = $gameActors.actor(actorId);

//☆☆立ち絵内部処理前変数割当↓☆☆
for(const id of [1,2,3,5,6,8,9,10,12,13,15,16,19,24,26,30,34,37,38,39,40]) {
  $gameVariables.setValue(value1+id,0);
};
if ($gameVariables.value(value1 + 4) == 0) {
  $gameVariables.setValue(value1 + 4, 1)
}
for (const id of [5,9,10,15,31,33]) {
  $gameVariables.setValue(value1+id,1)
};
if(actor.isStateAffected(61) || actor.isStateAffected(694)){//発情で愛液
  $gameVariables.setValue(value1+8,2);
};
if(actor.isStateAffected(63)){//拘束で腕と男
  $gameVariables.setValue(value1+9,3);
  $gameVariables.setValue(value1+15,3);
  $gameVariables.setValue(value1+17,0);
  $gameVariables.setValue(value1+24,0);
  $gameVariables.setValue(value1+26,0);
  $gameVariables.setValue(value1+1,1);
  $gameVariables.setValue(value1+38,1);
};
if(actor.isStateAffected(71) || actor.isStateAffected(695)){//濡れた状態で汗
  $gameSwitches.setValue(100,true);
};
if(actor.isStateAffected(83) || actor.isStateAffected(696)){//妊娠でボテ腹
  $gameVariables.setValue(value1+12,1);
  if($gameVariables.value(value1+14) == 1 &&  actor.isStateAffected(83)){//臍ピアス妊娠有無で変化
    $gameVariables.setValue(value1+14,2);
  };
  //$gameVariables.setValue(value1+28,1);//衣装状態の変化も追加//露出によって設定する
};
if(actor.isStateAffected(84) || actor.isStateAffected(697)){//膣内射精
  $gameVariables.setValue(value1+8,1);
};
if(actor.isStateAffected(85) || actor.isStateAffected(698)){//顔射精
  $gameVariables.setValue(value1+40,1);
};
if(actor.isStateAffected(86) || actor.isStateAffected(699)){//ぶっかけ
  $gameVariables.setValue(value1+40,2);
};
//☆☆表情差分↓☆☆
//let value11 = 1;
const arr = [1,1,1,1,1,2,5,6,15];//基本表情
let value11 = arr[Math.floor(Math.random() * arr.length)]; //WARN:many code executing and value11 re:set many times when for good need to split all by 'else' condition to not run other code when run one time
if($gameSwitches.value(201) || $gameSwitches.value(239)){
  const arr = [4,4,4,4,5,4,4,4,4,8];
  value11 = arr[Math.floor(Math.random() * arr.length)];
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
  const value2 = nActorId400[0];
  const value5 = nActorId380[4];
    if(value2 >= 1 && value5 <= 9){
      nActorId400[0] = 0;
}};
const n207 = $gameVariables.value(207);
  if (n207 == 101 || n207 >= 1 && n207 == nActorId400[41]){
  } else {
    if($gameSwitches.value(206)){
      } else {
      if (nActorId380[4] < nActorId380[5]){
          const arr = [17,18,19,20,21,22,23,24];
          value11 = arr[Math.floor(Math.random() * arr.length)];
          $gameSwitches.setValue(100,true);
        };
      if (nActorId380[4] <= 49){
        if (nActorId380[1] >= 500 && actor.skillMasteryLevel(55) >= 4){
              const arr = [29,30,31,32,37,38,39,40];
              value11 = arr[Math.floor(Math.random() * arr.length)];
            };
          $gameSwitches.setValue(100,true);
        };
}};
  if([61,65,84,85,86].some(function(id){return actor.isStateAffected(id)})){//発情、自慰、精液
    // let value5 = 50; 
    // let value6 = 9; 
    // let value2 = 7; 
    // let value3 = 5; 
    // let value4 = 3;
    const nActorId380_1 = nActorId380[1];
    if (nActorId380_1 >= 900) {
        const arr = [29,30,31,32,37,38,39,40,41,42,43,44];
        value11 = arr[Math.floor(Math.random() * arr.length)];
    } else if (nActorId380_1 >= 700) {
        const arr = [25, 26, 27, 28, 29, 30, 31, 32];
        value11 = arr[Math.floor(Math.random() * arr.length)];
    } else if (nActorId380_1 >= 500) {
        const arr = [21, 22, 23, 24, 25, 26, 27, 28];
        value11 = arr[Math.floor(Math.random() * arr.length)];
    } else if (nActorId380_1 >= 300) {
      const arr = [17, 18, 19, 20, 21, 22, 23, 24];
      value11 = arr[Math.floor(Math.random() * arr.length)];
    } else {
      const arr = [17, 18, 19, 20];
      value11 = arr[Math.floor(Math.random() * arr.length)];
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
        const arr = [37,38,39,40,41,42,43,44];
        value11 = arr[Math.floor(Math.random() * arr.length)];
      }else{
        const arr = [17,18,19,20];
        value11 = arr[Math.floor(Math.random() * arr.length)];
      };
  };
  if(!$gameSwitches.value(143) && actor.isStateAffected(83) || actor.isStateAffected(696)){//妊娠でボテ腹
    let value5 = 50; 
    //let value6 = 9; 
    let value2 = 7; 
    //let value3 = 5; 
    //let value4 = 3;
      if(actor.skillMasteryLevel(value5) >= value2) {
        }else{
        const arr = [21,22,23,24,25,26,27,28];
        value11 = arr[Math.floor(Math.random() * arr.length)];
      };
  };
  if(!$gameSwitches.value(143) && actor.isStateAffected(68)){//激情
    $gameSwitches.setValue(100,true);
  };
  if(!$gameSwitches.value(143) && $gameSwitches.value(30) && actor.tp >= 100){
    if($gameSwitches.value(100)){
      value11 = 48;
    }else{
      value11 = 47;
    };
  };
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
      $gameVariables.setValue(value1+13,2);
    } else {
      $gameVariables.setValue(value1+13,1);
    };
  };
  if($gameSwitches.value(97)){
    value11 = $gameVariables.value(151);//立ち絵会話時
  };
  for (const id1 of valueTachieChangeState) {
    if(actor.isStateAffected(id1)){
      const arr2 = $dataStates[id1].meta['FaceChange'].split(',');
      value11 = arr2[Math.floor(Math.random() * arr2.length)];
    }
  };

  $gameSwitches.setValue(100,false);
  $gameVariables.setValue(value1+33,value11);

//☆☆共通パーツ前段↓☆☆
if(actor.isStateAffected(22) || actor.isLearnedSkill(66)){}else{//右腕乳房露出時
  if($gameVariables.value(value1+21) == 0 && $gameVariables.value(value1+23) <= 3 &&
  $gameVariables.value(value1+25) == 0 && $gameVariables.value(value1+11) == 0){
    $gameVariables.setValue(value1+9,4);
  };
  if($gameVariables.value(value1+20) == 0 && $gameVariables.value(value1+22) == 0){//左腕股間露出時
    $gameVariables.setValue(value1+15,4);
  };
};
//発情＆性欲高い＆戦闘以外＆露出高いで腕グラビアポーズ
if(actor.isStateAffected(61) || actor.isStateAffected(694)){
  if (actor.isLearnedSkill(66) && !$gameSwitches.value(30) && $gameVariables.value(actorId + 380)[4] <= 9){
    $gameVariables.setValue(value1+15,0);
    $gameVariables.setValue(value1+9,2);
  };
};

//☆☆個別衣装設定↓☆☆
kobetu_isyousettei();

//☆☆共通パーツ後段↓☆☆
if($gameVariables.value(value1+9) == 4){//右腕乳房隠し時に乳房消去。注意。アムエスでは乳房差分変化なしなので処理変更
  $gameVariables.setValue(value1+10,0);
};
if($gameVariables.value(value1+19) >= 1  && $gameVariables.value(value1+23) == 0){//服下影服なしなら消去
  $gameVariables.setValue(value1+19,0);
};
if($gameVariables.value(value1+20) == 11){//奴隷ボンテージ。注意。アムエスではボンテージなしなので処理変更
  $gameVariables.setValue(value1+10,1);
  $gameVariables.setValue(value1+9,1);
  $gameVariables.setValue(value1+15,1);
  $gameVariables.setValue(value1+24,0);
  $gameVariables.setValue(value1+26,0);
};
if($gameVariables.value(value1+10) == 0 && $gameVariables.value(value1+11) == 1){//乳首ピアス乳房非表示時に隠す
  $gameVariables.setValue(value1+111,$gameVariables.value(value1+11));
  $gameVariables.setValue(value1+11,0);
};
if($gameVariables.value(value1+9) == 4){//右腕乳房露出時腕カバー消去
  $gameVariables.setValue(value1+117,$gameVariables.value(value1+17));
  $gameVariables.setValue(value1+17,0);
};
if($gameVariables.value(value1+15) == 4){//左腕股間露出時腕カバー消去
  $gameVariables.setValue(value1+126,$gameVariables.value(value1+26));
  $gameVariables.setValue(value1+26,0);
};
if(actor.isStateAffected(83)){//妊娠でボテ腹
  for (const id of [16, 17, 19, 20, 21, 22, 23, 24, 25, 26, 28]) {
    $gameVariables.setValue(value1+id+100,$gameVariables.value(value1+id));
    $gameVariables.setValue(value1+id,0);
  }
  $gameVariables.setValue(value1+9,1);
  $gameVariables.setValue(value1+10,1);
  $gameVariables.setValue(value1+15,1);
  $gameVariables.setValue(value1+12,2);
    //if($gameVariables.value(404) >= 5){
    if($gameVariables.value(380+actorId)[4] >= 5){
      $gameVariables.setValue(value1+28,1);
      $gameVariables.setValue(value1+12,1);
    };
  if($gameVariables.value(value1+14) == 1){//臍ピアス時に変化
    $gameVariables.setValue(value1+114,$gameVariables.value(value1+14));
    $gameVariables.setValue(value1+14,2);
  };
};
  if (actor.isStateAffected(83)) {//ぶっかけ腕の状態で変化
    if ([2, 3, 4].some(function (id) { return $gameVariables.value(value1 + 9) == (id) })) {
      if ($gameVariables.value(value1 + 40) == 2) {
        $gameVariables.setValue(value1 + 40, 3);
      }
    }
}
for (const id1 of valueTachieChangeStateTemporary) {
  if(actor.isStateAffected(id1)){//ステートによってパーツに変化を促す一時ステート・その立ち絵会話期間のみ
    const arr = $dataStates[id1].meta['TachieChangeStateTemporary'].split(',');
    const n = value1 + Number(arr[0]);
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
    if (actor.isStateAffected(602)) { // 女のみ, girls only
      $gameVariables.setValue(20, actor.actorId());
      tachie_settei2();
    }
  }
}

//}());

