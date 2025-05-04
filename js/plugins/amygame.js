/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

(function () {

amygame_startUpArrangement = function(){

//一括売却設定のため
for (let i = 1; i <= 2000; i++) {
  $gameSelfSwitches.setVariableValue([4, 11, i],0);
};
for (let i = 1; i <= 1000; i++) {
  $gameSelfSwitches.setVariableValue([4, 12, i],0);
};
for (let i = 1; i <= 1000; i++) {
  $gameSelfSwitches.setVariableValue([4, 13, i],0);
};

const gameVariables = $gameVariables;
//マップ行った事があるか判定配列.総数500以下で設定
gameVariables.setValue(356,Array(501).fill(0));
//各アクターの衣装プリセット配列
gameVariables.setValue(355,Array(21).fill(0));
let start = gameVariables.value(73);
let end = gameVariables.value(74);
const gameVariables355 = gameVariables.value(355);
for(let i = start; i <= end; i++){
  gameVariables355[i] = [0,Array(51).fill(0),Array(51).fill(0),Array(51).fill(0),Array(51).fill(0)];
  gameVariables355[i][1][50] = 'プリセット1';
  gameVariables355[i][2][50] = 'プリセット2';
  gameVariables355[i][3][50] = 'プリセット3';
  gameVariables355[i][4][50] = 'プリセット4';
};
//各アクターの装備スキル配列記憶用
gameVariables.setValue(351,Array(21).fill([]));
//各ステート毎の討伐数設定。主に種族対象,1が当日魔物討伐数,2が総魔物討伐数
gameVariables.setValue(52,Array(1001).fill(0));
//Tipsタイトルと内容配列。
gameVariables.setValue(532,[]);
gameVariables.setValue(533,[]);
gameVariables.setValue(534,[]);
//イベントのプレイヤーの位置記憶。
gameVariables.setValue(163,Array(1001).fill(0));
//個別リセットフラグonoff
gameVariables.setValue(183,[0,0,0,1,1,0,0,0,0,0,0]);//10
//各キャラの性欲度初期配列↓
for(let i = 381; i <= 400; i++){gameVariables.setValue(i,Array(101).fill(0))};
//0は性欲度上限。41は初体験相手,42,43,44,45は妊娠時サイズ増加。妊娠時に計測。
//46に直前のHｼｰﾝﾋﾟｸﾁｬ,49に初出産相手。50は苗字、51,52,53,54,55は身長体重スリーサイズ
//56がカップ数,58はポーション耐性59は役職
//61は当日Ｈ回数、62は当日Ｈ回数10以上の時に記録。
//63は性欲薬使用回数(代入する)、64は日数経過時に性欲499で61が0の時。
//65は当日獲得経験値
//66リザルト67ｵｰﾊﾞｰｷﾙ68会心
//71当日強姦回数、翌日凌辱事後付与。リセットはｺﾓﾝ24で個別で実行

//46に直前のHｼｰﾝﾋﾟｸﾁｬ
for(let i = start; i <= end; i++){gameVariables.value(i+380)[46] = 0};

//各キャラの衣装初期配列↓
for(let i = 441; i <= 460; i++){gameVariables.setValue(i,Array(43).fill(0))};
for(let i = 541; i <= 560; i++){gameVariables.setValue(i,Array(43).fill(0))};
//計43。0は統合時のアイテムID。41は会話立ち絵用衣装指定変数代入用(TotalCloth)
//42は露出超過回数

//NPCのキャラごとＨ回数。
for(let i = 361; i <= 380; i++){gameVariables.setValue(i,Array(301).fill(0))};
//計301.対応する相手とのH回数。101～200は受精した状態で1。
//201～300は子供の数。301～400は現在の役職名。0は使用しない。

//召喚石強化配列
gameVariables.setValue(352,Array(51).fill(0));
//ダンジョン情報配列//計55.
gameVariables.setValue(218,Array(55).fill(0));
gameVariables.setValue(219,Array(55).fill(`？？？`));
gameVariables.setValue(213,Array(55).fill(`？？？`));
//特殊ボス討伐情報配列。情報確認用なのでリセットしない
gameVariables.setValue(304,Array(201).fill(0));
//ダンジョンボス討伐情報配列。情報確認用なのでリセットしない
gameVariables.setValue(305,Array(101).fill(0));
//宝箱の中身と種類
gameVariables.setValue(212,Array(101).fill(0));//<TchestOnly:1,1,1,2,21>レア宝箱用
gameVariables.setValue(215,Array(101).fill(0));
gameVariables.setValue(216,Array(101).fill(0));
//ダンジョンワープ魔方陣指定
gameVariables.setValue(211,Array(101).fill(0));
let defaultArray = Array(11).fill(0);
for(let i = 0; i <= 100; i++){gameVariables.value(211)[i] = [...defaultArray]};
//監禁時にアクターの記憶配列。２次配列で記憶させる。0レアリティ1-10装備
gameVariables.setValue(333,Array(21).fill(0));
//収集アイテム表示用配列
gameVariables.setValue(284,[0,0,0,0,0]);
//簡易Hステ表示用配列
gameVariables.setValue(283,[0,0,0,0,0]);
//タイトル設定したIDの配列
gameVariables.setValue(288,Array(21).fill(0));
gameVariables.setValue(294,Array(21).fill(0));
//くるりんドロップ動作用配列
gameVariables.setValue(160,Array(11).fill(0));
//各キャラ専用武器パラメータ配列//8番目は通常攻撃決定数値。9番目は奥義。10番目は強化段階
//gameVariables.setValue(287,Array(21).fill(0));
start = 0; 
end = 21; 
defaultArray = Array(11).fill(21);
for (let i = start; i <= end; i++) {gameVariables.value(287)[i] = [...defaultArray]};
//マスターノート入手用配列↓21まで。1から始める//計20.
gameVariables.setValue(249,Array(20).fill(0));
//訓練人形事前設定配列
gameVariables.setValue(293,Array(31).fill(1));//11から-10のｱｸﾀｰのその訓練時のトータルダメージ
//10にターン数
gameVariables.value(293)[3] = 100;
gameVariables.value(293)[4] = 100;
gameVariables.value(293)[6] = 0;//種族指定
//街ごと賞金額
gameVariables.setValue(501,Array(101).fill(0));

};

amygame_startUp = function(){

let start = 1;
let end = $dataWeapons.length;
for (let i = start; i < end; i++) {
  if($dataWeapons[i].name == '') {
    $dataWeapons[i].name = i;
}};

//操作用などの名称を変更
//var start = 1;
end = $dataStates.length;
for (let i = start; i < end; i++) {
  const state = $dataStates[i];
  if (state.meta['起動時名前改変']) {
    state.name = state.meta['起動時名前改変'];
}};

const gameVariables = $gameVariables;

//視点スイッチにアクター名付与
const switches = $dataSystem.switches;
const switchesLen = switches.length;
const list = gameVariables.value(248);
list.forEach(function(id) {
  const actorName = $gameActors.actor(id).name();
  switches[440+id] = `${actorName}視点`;
}, this);
for (let i = 1; i < switchesLen; i++) {
  if(switches[i].match(/Battle/)){
    switches[i] = switches[i].replace("[Battle]", "")
  }
};

//各アイテムに連番を付与
let itemPrefix = 1;
let itemPrefix2 = 1;
let value3 = 1;
//var value4 = 1;
let x100 = 1;
let x50 = 1;

const weaponsLen = $dataWeapons.length;
for (let i = 1; i < weaponsLen; i++) {
  const weapon = $dataWeapons[i];
  if(!weapon.name == '') {
	const weaponMapSwitch = weapon.meta['MapSwitch'];
    if(weaponMapSwitch) {
      weapon.name = `${switches[Number(weaponMapSwitch)]}`;
    };
  };
};

const copyItem = (item, itemIndex, x) => {
	item.name = '[' + itemIndex + ']' + item.name;
	
	const itemX = $dataItems[i+x];
	itemX.iconIndex = item.iconIndex;
	itemX.name = `${item.name}[了]`;
	itemX.description = item.description;
};
const setItemName = (item, itemIndex, i, x) => {
	if(item.meta['追加コモンID'] || (i >= (401 + x) && i <= (500 + x))){
		item.name = $dataCommonEvents[i].name;
	}
	else {
		item.name = '[' + itemIndex + ']' + item.name;
	}
};

const itemsCount = $dataItems.length;
const achieverIndexes = gameVariables.value(297);
for (let i = 1; i < itemsCount; i++) {
  let item = $dataItems[i];
  if(item.name !== '') {
	const itemMeta = item.meta;
    if(itemMeta['ItemNameAddSet']) {
      const arr1 = itemMeta['ItemNameAddSet'].split(',');
      const index = Number(arr1[0]);
	  const Index1 = Number(arr1[1]);
	  let valueItems;	  
	  switch (index) {
		  case 0: 
			valueItems = $dataItems[Index1].name;
			break;
		  case 1:
		    valueItems = $dataWeapons[Index1].name;
			break;
		  case 2:
			valueItems = $dataArmors[Index1].name;
			break;
		  case 3:
			valueItems = $dataStates[Index1].name;
			break;
		  case 4:
			valueItems = $dataSkills[Index1].name;
			break;
		  case 5:
			valueItems = $dataStates[Index1].name;
			break;
		  case 6:
			valueItems = switches[Index1];
			break;
	  }
      if(Number(arr1[2]) == 0){
        item.name = `${valueItems}${item.name}`;
      } else {
        item.name = `${item.name}${valueItems}`;
      };
    };
    if(itemMeta['annihilationTitle']) {
      if(Number(itemMeta['annihilationTitle'].split(',')[0]) >= 20) {
        item.name = `${$dataItems[Number(itemMeta['annihilationTitle'].split(',')[0])].name}を殲滅せし者`;
      };
    };
    if(itemMeta['MapSwitch']) {
      item.name = `${switches[Number(itemMeta['MapSwitch'])]}`;
    };
    const itemEICSwitch = itemMeta['EICSwitch'];
    if (itemEICSwitch) {
      const itemEICSwitchNumber = Number(itemEICSwitch);
      if(itemEICSwitchNumber == 102) {
		setItemName(item, itemPrefix, i, 0);
        itemPrefix += 1;
      }
      else if(itemEICSwitchNumber == 103) {
		setItemName(item, itemPrefix2, i, 100);
        itemPrefix2 += 1;
      }
      else if(itemEICSwitchNumber == 104 || itemEICSwitchNumber == 105) {//二つ名は説明の方に連番を付与する
        item.description = '[' + value3 + ']' + item.description;
        value3 += 1;
          if (itemMeta['KojinTitle']) {
			const achieverIndex = achieverIndexes[i];
            if(achieverIndex >= 1){
			  const achieverName = $gameActors.actor(achieverIndex).name();
              item.description += `[達成者:${achieverName}]`;
            }
          };
      }
      else if(itemEICSwitchNumber == 108) {
        const itemCategory = itemMeta['SGカテゴリ'];
        if(itemCategory == '受注クエスト' || itemCategory == 'ＥＸ受注クエスト') {//特別クエスト使わない。クエスト801～を901に名前と解説とアイコンをコピーする
          copyItem(item, x100, 100);
		  x100 += 1;
        }
        else if(itemCategory == 'デイリークエスト') {
	      copyItem(item, x50, 50);
		  x50 += 1;
        };
      };
}}};

//不用なクエスト完了削除。辞典に反映させないため
// for (let i = 1; i < itemsCount; i++) {
//   const item = $dataItems[i];
//   if (itemEICSwitchNumber == 108) {
//     if(item.name == '') {
//       if(i >= 801 && i <= 900){
//         //const obj1 = $dataItems[2];
//         //$dataItems[i+100] = Object.assign({}, obj1);
//       }
//       else if(i >= 1001 && i <= 1050){
//         //const obj1 = $dataItems[2];
//         //$dataItems[i+50] = Object.assign({}, obj1);
//       };
// }}};

//ステート武器防具スキルに説明文追加。状態異常耐性付与の先に実行。反映させないため
various_description(4);//ステートは最初
various_description(1);
various_description(2);
various_description(3);
various_description(5);
various_description(0);

//状態異常耐性の特徴をステート武器防具クラスに付与
const arr1 = [];
const arr2 = [];
//var start = 1;
end = $dataStates.length;
for (let i = start; i < end; i++) {
  const stateCategory = $dataStates[i].meta['Category'];
  if (stateCategory == ' StateNomal'){
      arr1.push(i);
  }
  else if (stateCategory == ' StateabNomal'){
    arr2.push(i);
  };
};

const pushItemTrait = (valueItem, meta, list) => {
  if(!meta) return;
  
  const res = Number(meta);
  const code = res == 0 ? 14 : 13;
  const value = res == 0 ? 1 : 1 - (res / 100);
  list.forEach(function (id) {
	valueItem.traits.push({ code: code, dataId: id, value: value });
  }, this);
}

for (let j = 1; j <= 4; j++) {
  switch (j) {
	  case 1:
		valueItems = $dataStates;
		break;
	  case 2: 
		valueItems = $dataWeapons;
		break;
	  case 3: 
		valueItems = $dataArmors;
		break;
	  case 4: 
		valueItems = $dataClasses;
		break;
  }
  
  //var start = 1;
  end = valueItems.length;
  for (let i = start; i < end; i++) {
    const valueItem = valueItems[i];
	if(!valueItem) continue; // armors(possibly other) have undefined values in list
	
	const valueItemMeta = valueItem.meta;
	
	pushItemTrait(valueItem, valueItemMeta['StateabNomalResist'], arr1);
	pushItemTrait(valueItem, valueItemMeta['StateSPabNomalResist'], arr2);	
    if(valueItemMeta['elementRegist6']){
      const value1 = Number(valueItemMeta['elementRegist6']);
      const value = value1 == 0 ? 0 : 1 - (value1 / 100);
      for (let dataId = 3; dataId <= 8; dataId++) {
        valueItem.traits.push({ code: 11, dataId: dataId, value: value });
      }
    };
    if(valueItemMeta['elementRegist9']){
      const value1 = Number(valueItemMeta['elementRegist9']);
      const value = value1 == 0 ? 0 : 1 - (value1 / 100);
      for (let dataId = 3; dataId <= 9; dataId++) {
        valueItem.traits.push({ code: 11, dataId: dataId, value: value });
      }
      valueItem.traits.push({ code: 11, dataId: 16, value: value });
      valueItem.traits.push({ code: 11, dataId: 17, value: value });
    };
  };
};
//エネミーグループ<one>最初のエネミーを適切な位置に配置
//エネミーグループ<big>最初のエネミーを適切な位置y+100に配置
enemy_troopPosition1();

//ダンジョンユニーク採取品の解説文にマップ名追記
for (let i = 1; i <= 9; i++) {
  for (let j = 1; j < itemsCount; j++) {
    const item = $dataItems[j];
	const itemMeta = item.meta;
    if(itemMeta['UniqueMaterial' + i]){
      const uniqueMaterials = itemMeta['UniqueMaterial' + i].split(',');
      if(itemMeta['MapSwitch']){
		const material = switches[Number(itemMeta['MapSwitch'])];
        $dataItems[Number(uniqueMaterials[0])].description += ` \\C[2][${material}で希少採取]\\C[0]`;
      };
    };
  };
};

//通常攻撃追加解説に条件で文言を加えるための配列
attack_addKaisetu1();

//ジョブ追加説明文に条件で文言を加えるための配列
class_addKaisetu1();
//苗字代入
start = gameVariables.value(75);
end = gameVariables.value(76);
for (let i = start; i <= end; i++) {
  $dataWeapons[i + 200].name = gameVariables.value(i+380)[50];
};
//特定場所スイッチ変更.マップ名表示処理も含める。コモン288で実行
if($dataSystem.variables[61].match(/りしゃぶる/)){
  let familyName = $dataWeapons[315].meta['FamilyName'];
  if (familyName){
    switches[279] = `喫茶 <${familyName}カフェ>`;
    valueMapNameSpecialStaging[200] = switches[279];
  };
  familyName = $dataWeapons[311].meta['FamilyName'];
  if (familyName){
    switches[275] = `書店 <${familyName}古書店>`;
    valueMapNameSpecialStaging[95] = switches[275];
  };
  familyName = $dataWeapons[316].meta['FamilyName'];
  if (familyName){
    switches[274] = `民家 <${familyName}家>`;
    valueMapNameSpecialStaging[25] = switches[274];
  };
  
  const switch341 = switches[341];
  valueMapNameSpecialStaging[146] = `${switch341}-[B1F]`;
  valueMapNameSpecialStaging[147] = `${switch341}-[B2F]`;
  valueMapNameSpecialStaging[148] = `${switch341}-[B3F]`;
  valueMapNameSpecialStaging[149] = `${switch341}-[B4F]`;
  valueMapNameSpecialStaging[150] = `${switch341}-[B5F]`;
  
  const switch342 = switches[342];
  valueMapNameSpecialStaging[152] = `${switch342}-[B6F]`;
  valueMapNameSpecialStaging[153] = `${switch342}-[B7F]`;
  valueMapNameSpecialStaging[154] = `${switch342}-[B8F]`;
  valueMapNameSpecialStaging[155] = `${switch342}-[B9F]`;
  valueMapNameSpecialStaging[156] = `${switch342}-[B10F]`;
  
  const switch343 = switches[343];
  valueMapNameSpecialStaging[172] = `${switch343}-[B11F]`;
  valueMapNameSpecialStaging[173] = `${switch343}-[B12F]`;
  valueMapNameSpecialStaging[174] = `${switch343}-[B13F]`;
  valueMapNameSpecialStaging[175] = `${switch343}-[B14F]`;
  valueMapNameSpecialStaging[176] = `${switch343}-[B15F]`;
  
  const switch344 = switches[344];
  valueMapNameSpecialStaging[164] = `${switch344}-[B16F]`;
  valueMapNameSpecialStaging[188] = `${switch344}-[B17F]`;
  valueMapNameSpecialStaging[168] = `${switch344}-[B18F]`;
  valueMapNameSpecialStaging[75] = `${switch344}-[B19F]`;
  valueMapNameSpecialStaging[92] = `${switch344}-[B20F]`;
  
  const switch345 = switches[345];
  valueMapNameSpecialStaging[177] = `${switch345}-[B21F]`;
  valueMapNameSpecialStaging[178] = `${switch345}-[B22F]`;
  valueMapNameSpecialStaging[179] = `${switch345}-[B23F]`;
  valueMapNameSpecialStaging[180] = `${switch345}-[B24F]`;
  valueMapNameSpecialStaging[181] = `${switch345}-[B25F]`;
  
  valueMapNameSpecialStaging[161] = `${switches[346]}`;
  valueMapNameSpecialStaging[162] = `${switches[347]}`;
  valueMapNameSpecialStaging[211] = `${switches[348]}`;
  valueMapNameSpecialStaging[160] = `${switches[349]}`;
  valueMapNameSpecialStaging[163] = `${switches[350]}`;
  valueMapNameSpecialStaging[159] = `${switches[351]}`;
};

  };

//ステート付与されているかどうか。名前21に全員の名前、変数21に人数、変数22にid
actor_stateCheck = function(id1){

var array = [];
var value1 = ``;
var start = $gameVariables.value(75);
var end = $gameVariables.value(76);
for(var i = start; i <= end; i++){
  actor = $gameActors.actor(i);
  if(actor.isStateAffected(id1)){
    array.push(i);
}};
for(var i = 0; i <= array.length-1; i++){
  if(id1 == 83){$gameSelfSwitches.setValue([$gameMap.mapId(), array[i], 'A'], true)};
  value1 += `${$gameActors.actor(array[i]).name()} `;
};
if(array.length >= 2){
  value1 += `達`;
};
$gameActors.actor(21).setName(value1);
$gameVariables.setValue(21,array.length-1);
$gameVariables.setValue(22,array);

};

//役職名を変更する。Profession_CharaChange(0,1,`\\wn[314]の恋人`,0);//0がｱｸﾀｰで1NPC,id,役職名,0で表示1でｻｲﾚﾝﾄ
Profession_CharaChange = function(id1,id2,id3,id4){

if(!$gameSwitches.value(29)){
  let actorName = '';
  if(id1 == 0){
    $gameVariables.value(380 + id2)[59] = `${id3}`;
    actorName = $gameActors.actor(id2).name();
  } else {
    $gameVariables.value(353)[id2-300] = `${id3}`;//スタートリセットコモンで初期実行
    actorName = $dataWeapons[id2].name;
  };
  if(id4 == 0){
    $gameScreen.startAnimation(100, 150, 300, false);
    TickerManager.show(`　　\\C[1]${actorName}\\C[0]の役職名が\\C[2]${id3}\\C[0]に変更されました。`);
  };
};

};

//役職名を基本に戻す
Profession_basicReturn = function(actorId) {
  if($gameSwitches.value(29)) return; // Exit early if switch 29 is on
  
  const actor = $gameActors.actor(actorId);
  if (!actor) actor = $dataActors[actorId]; // extra resetup from database actor if saved game actor is not exists
  //const actor = $dataActors[actorId]; // was set by default
  let defaultProfession = `${actor.meta['Profession']}`;
  let newProfession = defaultProfession;
  
  // Check all possible profession alternatives (up to 9)
  for(let i = 1; i <= 9; i++) {
    const professionMetaKey = 'Profession' + i;
    
    if (!actor.meta[professionMetaKey]) continue;
    
    const professionData = actor.meta[professionMetaKey].split(',');
    const professionName = professionData[0];
    const switchId = Number(professionData[1]);
    const variableId = Number(professionData[2]);
    const requiredValue = Number(professionData[3]);
    const requiredItemId = Number(professionData[4]);
    
    // Check switch condition
    if(switchId >= 1 && $gameSwitches.value(switchId)) {
      newProfession = professionName;
      continue;
    }
    
    // Check variable threshold condition
    if(variableId >= 1 && $gameVariables.value(variableId) >= requiredValue) {
      newProfession = professionName;
      continue;
    }
    
    // Check item possession condition
    if(requiredItemId >= 1 && $gameParty.hasItem($dataItems[requiredItemId], true)) {
      newProfession = professionName;
      continue;
    }
  }

  const currentProfession = $gameVariables.value(380 + actorId)[59];
  
  // Only update if profession has changed
  if (currentProfession !== newProfession) {
    if(!$gameSwitches.value(380)) {
      const actorName = `\\N[${actorId}]`;
      const professionChangeMessage = 
        `　　${actorName}の役職名が\\C[1]<${currentProfession}>\\C[0]から\\C[2]<${newProfession}>\\C[0]に変更されました。`;
      TickerManager.show(professionChangeMessage);
    }
    
    $gameVariables.value(380 + actorId)[59] = newProfession;
  }
};

message_popup2 = function(value1,value2,value3,id1) {

if(id1 == 0){
  valueAutoSkipPicX = 0;
  $gameSystem.clearMessagePopupFree();
  $gameSystem.clearMessagePopup();
  $gameMessage.setMessageRow(4);
};
if(id1 == 1){
  valueAutoSkipPicX = 1000;
  $gameSystem.clearMessagePopupFree();
  if(value1 == 0){
    $gameSystem.setMessagePopupFree(value2[0], value2[1]);
  } else {
    var eventId = value1;
    if (isNaN(eventId)) {
      eventId = eventId;
    }
    $gameSystem.setMessagePopup(eventId);
    var windowPosition;
    windowPosition = value2;
    if (windowPosition === 1) {
      $gameSystem.setPopupFixUpper(eventId);
    } else {
      if (windowPosition === 2) {
        $gameSystem.setPopupFixLower(eventId);
      };
    };
  };
  $gameMessage.setMessageRow(value3);
};

};

//配列に記録して控えメンバー0外す/1加える
submember_saveAddRemove = function(id1){

if(id1 == 0){
  $gameParty.members().forEach(function(actor) {
    if(!actor.isBattleMember()){
      $gameVariables.value(154).push(actor._actorId);
      $gameParty.removeActor(actor._actorId)
    };
  }, this);
} else {
  if($gameVariables.value(154) != 0){
    $gameParty.addActor(23);
    $gameParty.addActor(24);
    $gameParty.addActor(25);
    //$gameParty.changeBattleMax($gameParty.battleMembers().length);
    var list = $gameVariables.value(154);
    list.forEach(function(id) {
      var actor = $gameActors.actor(id);
        if(!$gameParty.members().contains(actor) && actor.isLearnedSkill(18) && !actor.isStateAffected(valueDollStateId)){
          $gameParty.addActor(id);
        };
    }, this);
    $gameVariables.setValue(154,[]); 
    //$gameParty.changeBattleMax(4);
    $gameParty.removeActor(23);
    $gameParty.removeActor(24);
    $gameParty.removeActor(25);
  };
};

};

//プレイヤー位置記憶した場所に戻る。スイッチ140はそれぞれのコモンなりでoffにする
set_playerPosition2 = function(id1){

var arr1 = $gameVariables.value(id1);
var value1 = Number(arr1[0]);
var value2 = Number(arr1[1]);
var value3 = Number(arr1[2]);
$gamePlayer.reserveTransfer(value1, value2, value3,0,2);
SceneManager.goto(Scene_Map);
//this.popScene();
//$gamePlayer.setTransparent(false);
//$gamePlayer.performTransfer();
//console.log(`${arr1}`);

};

//プレイヤー位置記憶
set_playerPosition1 = function(id1){

$gameVariables.setValue(id1,[$gameMap.mapId(),$gamePlayer._realX,$gamePlayer._realY]);
//$gamePlayer.setTransparent(true);

};

//拠点強制帰還位置指定移動
set_homeMoveForced = function(){

$gameSwitches.setValue(140,false);
$gameSwitches.setValue(486,true);
var value1 = 22;
for (var i = 1; i <= 100; i++) {
  if($gameVariables.value(327)[i] == 2){
    var value1 = i;
    break;
  };
};
var arr1 = $dataWeapons[value1].meta['HomePosition'].split(',');
$gameVariables.setValue(161,[Number(arr1[0]),Number(arr1[1]),Number(arr1[2])]);
set_playerPosition2(161);

};

//時計表示
time_settei = function(){

scene_joukensettei(1);
scene_joukensettei(2);
let value2 = $gameVariables.value(504) >= 1 ? `\\I[383]` : $gameVariables.value(505) >= 1 ? `\\I[382]`:`\\I[16]`;

if($gameParty.inBattle()){
  if($gameSwitches.value(95)){
    value2 += `\\I[427]`;
  } else {
    value2 += `\\I[317]`;
  };
} else {
  if($gameVariables.value(517) >= 1){
    value2 += `\\I[535]`;
  } else {
    if($gameVariables.value(518) >= 1){
      value2 += `\\I[625]`;
    } else {
      value2 += `\\I[16]`;
  }};
};
if($gameParty.inBattle()){
  if($gameSwitches.value(146)){
    value2 += `\\I[126]`;
  } else {
    value2 += `\\I[16]`;
  };
};
if($gameSwitches.value(15)){
  value2 += `\\I[418]`;
} else {
  if($gameSwitches.value(14)){
    value2 += `\\I[417]`;
  } else {
    value2 += `\\I[416]`;
}};
let messageText = '';
let value10 = 680;
let value11 = 0;
if(!$gameSwitches.value(209)){//全体マップ以外で表示10
  if($gameParty.inBattle()){
    messageText = `${value2}:+\\V[290,3]\\I[75]:\\V[263]\n\\I[176]:\\V[190]/\\V[189]\\V[332]\\I[127]:${valueMaxEnemyLv}\n`;
    for (let i = 0; i < $gameParty.battleMembers().length; i++) {
      const actor = $gameParty.battleMembers()[i];
      if(is_girl(actor)){
        if($gameVariables.value(actor.actorId() + 380)[2] >= 1){
          if(value11 == 0){messageText += `\\I[376] `; value11 = 1};
          if($dataActors[actor.actorId()].meta['IconGura']){
            messageText += `\x1bI[${Number($dataActors[actor.actorId()].meta['IconGura'])}]`;
          } else {
            messageText += `${actor.name()}`;
          };
          messageText += `${$gameVariables.value(actor.actorId() + 380)[2]} `;
          value10 -= 28;
        };
      };
    };
    if(value11 == 1){messageText += `\n`};
    if(!$gameSwitches.value(211)){
    let arr1 = [];
      for (let i = 0; i < $gameTroop.members().length; i++) {
        const enemy = $gameTroop.members()[i];
        const arr2 = enemy._states;
        arr1 = arr1.concat(arr2);
      };
      const arr3 = arr1.filter(function (x, i, self) {
        return self.indexOf(x) === i;
      });
      let j = 0;
        for (var i = 0; i <= arr3.length-1; i++) {
          const id1 = arr3[i];
            if($dataStates[id1].iconIndex >= 1 && !$dataStates[id1].name == ''){
              messageText += `\x1bI[${$dataStates[id1].iconIndex}]`;
              j += 1;
                if((j %9) == 0){
                  messageText += `\n`;
                  value10 -= 28;
                };
        }};
    };
  } else {
    messageText = `${value2}:\\V[56,3]`;
    if(!$gameParty.inBattle() && $gameSwitches.value(201)){messageText += ` [\\C[10]\\V[335,2]\\C[0]/\\C[1]\\V[334,2]\\C[0]]`};
  };
  $gameScreen.setDTextPicture(messageText, 25);
  if($gameSwitches.value(201) && !$gameParty.inBattle()){
    $gameScreen.dTextRealTime = 'ON';
  };
  if($gameParty.inBattle()){
    $gameScreen.dTextAlign = 0;
    $gameScreen.dWindowFrame = 'ON';
    $gameScreen.showPicture(50,"",0,1010,value10,80,80,250,0);
/*       if($gameSwitches.value(211)){
        
      } else {
        //$gameScreen.showPicture(50,"",0,10,10,80,80,250,0);
      }; */
  } else {
    $gameScreen.dTextAlign = 1;
    const var201 = $gameSwitches.value(201);
    const picId = var201 ? 760 : 860;
    $gameScreen.showPicture(50, "", 0, picId, 10, 100, 100, 255, 0);
    const picName = var201 ? "PictureBottan49d" : "PictureBottan49";
    $gameScreen.showPicture(49,picName,0,0,-5,100,100,250,0);
  };
};

};

//エリクシール設定コンティニュー
continue_settei = function(id){

const item = $dataItems[id];
const itemMetaSwitchOnOffUseNum = Number(item.meta.SwicthOnOffUse);
const isOn = $gameSwitches.value(itemMetaSwitchOnOffUseNum);
const hasItemOn = $gameParty.hasItem(item) && isOn; 

item.name = hasItemOn ? item.meta.SwicthOnName : item.meta.SwicthOffName;
$gameSwitches.setValue(itemMetaSwitchOnOffUseNum, hasItemOn); // correct value based on the item in inventory
$gameParty.members().forEach(function (actor) {
  if (hasItemOn) actor.addState(25); else actor.removeState(25);
});

};

//主人公パッシブ獲得
actor_skilllearn1 = function(id1){

let value5 = 0;
//var value6 = 0;
const actor = $gameActors.actor(id1);  
  const max = valueHeroGetSkill.length;
  for (var i = 0; i < max; i++) {
    if (value5 !== 0) break;
    
    const heroSkill = valueHeroGetSkill[i];
    if (!actor.isLearnedSkill(heroSkill)) {
      const dataSkill = $dataSkills[heroSkill];
      const mCharacterSkillLearnSwith = dataSkill.meta['MCharacterSkillLearnSwith'];
      if (mCharacterSkillLearnSwith) {
        var value3 = Number(mCharacterSkillLearnSwith);
        if ($gameSwitches.value(value3)) {
          value5 = 1;
          break;
        };
      };
      const mCharacterSkillLearnSkill = dataSkill.meta['MCharacterSkillLearnSkill'];
      if (mCharacterSkillLearnSkill) {
        const value3 = Number(mCharacterSkillLearnSkill);
        if (actor.isLearnedSkill(value3)) {
          value5 = 1;
          break;
        };
      };
      const mCharacterSkillLearnSRank = dataSkill.meta['MCharacterSkillLearnSRank'];
      if (mCharacterSkillLearnSRank) {
        const mCharacterSkillLearnSRankArray = mCharacterSkillLearnSRank.split(',');
        const value3 = Number(mCharacterSkillLearnSRankArray[0]);
        const value4 = Number(mCharacterSkillLearnSRankArray[1]);
        if (actor.skillMasteryLevel(value3) >= value4) {
          value5 = 1;
          break;
        };
      };
    };
    if (value5 >= 1) {
      if (!$gameSwitches.value(29)) {
        actor.learnSkill(valueHeroGetSkill[i]);
      };
      $gameVariables.setValue(19, valueHeroGetSkill[i]);
    };
};
//複合スキル
if(value5 == 0){//797見極め習得
  var id = valueIdentifySkillId;
  console.log("valueIdentifySkillId 1:" + valueIdentifySkillId);
  if(!actor.isLearnedSkill(id)){ 
    let value2 = 766;
    const value3 = 764;
    let value4 = 3;
    if(actor.isLearnedSkill(value2) && actor.skillMasteryLevel(value3) >= value4){
      actor.learnSkill(id);
      $gameVariables.setValue(19,id);
    };
  };
};
if(value5 == 0){//799大量採取
  var id = valueIdentifySkillId;
  console.log("valueIdentifySkillId 2:" + valueIdentifySkillId);
  if(!actor.isLearnedSkill(id)){ 
    value2 = 763;
    var value3 = 764;
    value4 = 2;
    if(actor.skillMasteryLevel(value2) >= value4 && actor.skillMasteryLevel(value3) >= value4){
      actor.learnSkill(id);
      $gameVariables.setValue(19,id);
    };
  };
};

};

//パーティメンバーが通常攻撃派生スキル獲得。対象スキル範囲は101-200
actor_skilllearn2 = function(id1){

var value5 = 300;
var value = "21_SkillLearn";
var actor = $gameActors.actor(id1);
var start = 101;
var end = 200;
for (var i = start; i <= end; i++) {
  const skill = $dataSkills[i];
  if (skill.name !== '') {
    const skillMetaNormalAttackDerived = skill.meta['NormalAttackDerived'];
    if(skillMetaNormalAttackDerived){
      var arr1 = skillMetaNormalAttackDerived.split(',');
      var value1 = Number(arr1[1]);
      var value2 = Number(arr1[0]);
      if(!actor.isLearnedSkill(value1) && actor.skillMasteryLevel(i) >= value2 ){
        actor.learnSkill(value1);
        if(!$gameParty.inBattle()){
          $gamePlayer.requestAnimation(value5)
        } else {
          $gameParty.members()[actor.index()].startAnimation(value5, false, 0);
        };
        AudioManager.playMe({"name":value,"volume":60,"pitch":120,"pan":0});
        var value3 = `${actor.name()}の\x1bSIN[${i}]がRank${value2}に到達し、\x1bSIN[${value1}]が派生した！`;
        if($gameParty.inBattle()){
          BattleManager._logWindow.push(`addText`, value3);
        } else {
          gab_wordParticle(value3);
        };
}}}};

};

//パーソナルスキルのonoffロード時
skill_personalonoffload = function(itemId,valueItemsType){
  if (valueItemsType > 1) return;

  valueItems = valueItemsType == 0 ? $dataSkills : $dataItems;

  const item = valueItems[itemId];
  const skillSwitchId = Number(item.meta.SwicthOnOffUse);
  const switchStateValue = $gameSwitches.value(skillSwitchId);

  // set effect switch by skill name
  //if (!$gameSwitches.value(19)) {
    item.name = switchStateValue ? item.meta.SwicthOnName : item.meta.SwicthOffName;
    $gameSwitches.setValue(skillSwitchId, switchStateValue);
  //}
};

//パーソナルスキルのonoff
skill_personalonoff = function(actorA,actorB,itemId,valueItemsType){
  
  if (actorB.actorId() !== actorA.actorId()) return;
  if (valueItemsType > 1) return;

  valueItems = valueItemsType == 0 ? $dataSkills : $dataItems;
  
  const item = valueItems[itemId];
  const skillSwitchId = Number(item.meta.SwicthOnOffUse);
  const switchStateValue = $gameSwitches.value(skillSwitchId);

  // revers switch state
  item.name = switchStateValue ? item.meta.SwicthOffName : item.meta.SwicthOnName;
  $gameSwitches.setValue(skillSwitchId, !switchStateValue);

  // show new state name
  const s = valueItemsType == 0 ? "S" : "I";
  const switchStateName = `\\C[2]\x1b${s}IN[${itemId}]\\C[0]`;
  TickerManager.show(`<${switchStateName}>に変更しました`);
};

//パーソナルスキルの所持者不在時にスイッチ自動off
skill_personalonoffAutoOff = function(itemId,value1){
  valueItems = value1 == 0 ? $dataSkills : $dataItems;
  $gameSwitches.setValue(Number(valueItems[itemId].meta.SwicthOnOffUse), false);
};

//主人公がパーソナルスキルを道具で習得
actor_personalskilllearn = function(a,b,itemId,id2,id1){

const actor = $gameActors.actor($gameVariables.value(2));
if(b.actorId() == a.actorId()){
  if (actor.isLearnedSkill(id1)) {
    const actorName = `\\C[16]${actor.name()}\\C[0]`;
    const skillName = `\\C[2]\x1bSIN[${id1}]\\C[0]`;
    if(id2 == 2){
      TickerManager.show(`${actorName}は既に${skillName}を習得済みのため効果は無かった。`);
    };
    if(id2 == 1){
      if(actor.skillMasteryLevel(id1) >= Number($dataSkills[id1].meta['Max Mastery Level'])){
        TickerManager.show(`${actorName}の${skillName}は最高ランクに到達しています…。`);
      } else {
        const skillRankNum = 10 * $gameVariables.value(203);
        actor.gainSkillMasteryUses(id1, skillRankNum);//変更熟練度
        const skillRank = `\\C[3]${skillRankNum}\\C[0]`;
        TickerManager.show(`${actorName}の${skillName}熟練度を${skillRank}}獲得した！`);
        const skillMasteryLevel = actor.skillMasteryLevel(id1);
        const skillMasteryUses = `\\C[2]${actor.skillMasteryUses(id1)}`;
        const skillMasteryUsageMax = `${actor.skillMasteryUsageMax(id1)}\\C[0]`;
        TickerManager.show(`Rank:${skillMasteryLevel} /熟練度${skillMasteryUses}(${skillMasteryUsageMax})`);
        $gameParty.loseItem($dataItems[itemId], 1);
      };
    };
  } else {
    actor.learnSkill(id1);
    actor.setSkillMasteryLevel(id1, 1);
    AudioManager.playMe({ "name": "21_SkillLearn","volume":60,"pitch":120,"pan":0});
    const actorName = `\\C[16]${actor.name()}\\C[0]`;
    const skillName = `\\C[2]\x1bSIN[${id1}]\\C[0]`;
    TickerManager.show(`${actorName}は${skillName}を習得した！`);
    $gameParty.loseItem($dataItems[itemId], 1);
}};

};

//ステートオンオフ
skill_stateonoff = function (actorA, actorB, skillId, stateId) {

  if (actorB.actorId() !== actorA.actorId()) return;

  const skill = $dataSkills[skillId];
  stateId = Number(skill.meta['SkillStateAddRemove']); // re set stateId, all using of skill_stateonoff use 0 value for stateId

  const actor = $gameActors.actor(actorB._actorId);
  const isStateAffected = $dataStates[stateId] !== null && actor.isStateAffected(stateId);
  if (isStateAffected) actor.removeState(stateId); else if ($dataStates[stateId] !== null) actor.addState(stateId);
  const animationId = isStateAffected ? 289 : 282;
  if ($gameParty.inBattle()) { actorB.startAnimation(animationId, true, 0) };
  if (skill.meta['TachieChangeSet']) {//たぶん使ってない isStateAffected
    actor.addState(20);
    $gameSwitches.setValue(96, true);
  };

  const actorName = `\\C[16]${actorB.name()}\\C[0]`;
  const skillName = `\\C[2]\x1bSIN[${skillId}]\\C[0]`;
  const message = isStateAffected ? `${actorName}の${skillName}が解除された。` : `${actorName}に${skillName}が付与された。`;
  TickerManager.show(message);
};

//スキルアイテム使用時に立ち絵が変化する場合。事前に$gameVariables.setValue(20,b.actorId());
tachie_usedChange1 = function(){

if(!$dataActors[$gameVariables.value(20)].meta['Heroine']) return;

  if(!$gameSwitches.value(131) || !$gameParty.inBattle()){
    if($gameSwitches.value(42) && $gameVariables.value(3) == $gameVariables.value(20)){
      tachie_syoukyo1($gameVariables.value(300));
      tachie_settei2();
      $gameVariables.setValue(20,$gameVariables.value(3));
      tachie_hyouji1($gameVariables.value(20));
    } else {
      tachie_settei2();
    };
  } else {
    tachie_settei2();
  };
};

//スキルアイテム使用でのぶっかけ付与。
bukkake_addSemen1 = function(user,target,itemId,valueItemsType){

var valueItems = valueItemsType == 0 ? $dataSkills : $dataItems;
const heroineName = target.name();
if($dataActors[target.actorId()].meta['Heroine']){
  target.addState(86);
  $gameVariables.setValue(20,target.actorId());
  tachie_usedChange1();

  TickerManager.show(heroineName + 'はぶっかけられた！');
} else {  
  TickerManager.show(heroineName + 'は対象キャラでは無いため、効果が無かった…。');

  if(valueItemsType == 1){
    $gameParty.gainItem(valueItems[itemId], +1);
  };
};

};

//スキルアイテム使用での精液回復。実際のステート回復は<Remove 1 State Category: StateSemen>で実施
semen_reflesh1 = function(user,target,itemId,id1){

var valueItems = id1 == 0 ? $dataSkills : $dataItems;
const stateCategoryName = 'StateSemen';
let semenCount = 0;

const itemMetaSemenRemove = valueItems[itemId].meta['SemenRemove'];
let end = itemMetaSemenRemove ? Number(itemMetaSemenRemove) : 1;

const semenItem = $dataItems[120];
for (let i = 1; i <= end; i++) {
  if(target.isStateCategoryAffected(stateCategoryName)){
    target.removeStateCategory(stateCategoryName, 1);
    $gameParty.gainItem(semenItem, 1);//白濁瓶
    semenCount += 1;
  };
};

const messageText = target.name() + (semenCount >= 1 ? 'は白濁を洗浄した。(' + semenCount + ')\\iin[120]を入手' : 'には効果が無かった');
showMessage(messageText);
target.addState(71);
showMessage(target.name() + 'は濡れてしまった');

$gameVariables.setValue(20,target.actorId());
tachie_usedChange1();

};

/*:
 * Show message text depend on where is party is in battle or not.
 * @function
 * @param {*} messageText
*/
showMessage = function (messageText) {
  if ($gameParty.inBattle()) {
    BattleManager._logWindow.push(`addText`, messageText);
  } else {
    TickerManager.show(messageText);
  };
}

//スキルアイテム使用での衣装修復
cloth_repair1 = function(user,target,itemId,id1){

let valueItems = id1 == 0 ? $dataSkills : $dataItems;
if(target.isStateAffected(23)){
  if (id1 == 1) $gameParty.gainItem(valueItems[id3], +1);
  showMessage('現在の' + target.name() + 'は衣装修復対象ではありません。');
} else {
  $gameVariables.setValue(20,target.actorId());
  const actor = $dataActors[$gameVariables.value(20)];
  if (actor.meta['Heroine']){  
    target.removeState(70);
    $gameVariables.setValue(19, Number(actor.meta['MainCloth']));
    kisekae_tyokusetusitei($gameVariables.value(19),0);
    tachie_usedChange1();
    showMessage(target.name() + 'の衣装を修復しました。');
  } else {
    if (id1 == 1) $gameParty.gainItem(valueItems[itemId], +1);
    showMessage(target.name() + 'は衣装修復の対象ではありません。');
  };
};

};

//スキルアイテム使用での状態異常クリア//0スキル1アイテム<abNomalClearCount:5>
//<abNomalClearCountPlus:200>mat200につき1プラス,修正一律で300
abNomal_Clear = function(a,b,itemId,id1){

var value3 = 0;
var valueItems = get_valueItems_sis(id1);
if(valueItems[itemId].meta['abNomalClearCount']){
  var value1 = Number(valueItems[itemId].meta['abNomalClearCount']);
} else {
  var value1 = 1;
};
if(valueItems[itemId].meta['StateabNomalOnly']){
  var value2 = b.getStateCategoryAffectedCount('StateabNomal');
  if(value2 == 0){
    var value5 = `${b.name()}は基本状態異常を付与されていない為、効果が無かった。`;
    if(a.isActor()){
      if($gameParty.inBattle()){
        BattleManager._logWindow.push(`addText`, value5);
      } else {
        TickerManager.show(value5);
      };
    };
    if(id1 == 1){
      $gameParty.gainItem(valueItems[itemId], +1);
    };
    var value3 = 1;
  };
} else {
  var value2 = b.getStateCategoryAffectedCount('StateabNomal') + b.getStateCategoryAffectedCount('StateSPabNomal');
  if(value2 == 0){
    var value5 = `${b.name()}は基本特殊状態異常を付与されていない為、効果が無かった。`;
    if(a.isActor()){
      if($gameParty.inBattle()){
        BattleManager._logWindow.push(`addText`, value5);
      } else {
        TickerManager.show(value5);
      };
    };
    //if(id1 == 1){
      //$gameParty.gainItem(valueItems[itemId], +1);
    //};
    var value3 = 1;
  };
};
if(value3 == 0){
  if(valueItems[itemId].meta['abNomalClearCountPlus']){
    var value2 = Math.floor(a.param(4) / 300);
    if(value2 >= 1){
      var value5 = `${a.name()}の\\C[16]Magic\\C[0]により回復数\\C[3]+${value2}\\C[0]！`;
      if(a.isActor()){
        if($gameParty.inBattle()){
          BattleManager._logWindow.push(`addText`, value5);
        } else {
          TickerManager.show(value5);
        };
      };
      var value1 = value1 + value2;
    };
  };
  var value2 = 'StateabNomal';
    if(b.isStateCategoryAffected(value2)){
      var value3 = b.getStateCategoryAffectedCount(value2);
      if(value3 >= value1){
        var value4 = value1;
        var value1 = 0;
      } else {
        var value4 = value3;
        var value1 = value1 - value3;
      };
      b.removeStateCategory(value2, value4);
      var value5 = `${b.name()}の基本状態異常を\\C[3]${value4}\\C[0]個回復した！`;
      if($gameParty.inBattle()){
        BattleManager._logWindow.push(`addText`, value5);
      } else {
        TickerManager.show(value5);
      };
    };
  if(value1 >= 1  &&  !valueItems[itemId].meta['StateabNomalOnly']){
    var value2 = 'StateSPabNomal';
    if(b.isStateCategoryAffected(value2)){
      var value3 = b.getStateCategoryAffectedCount(value2);
      if(value3 >= value1){
        var value4 = value1;
        var value1 = 0;
      } else {
        var value4 = value3;
        var value1 = value1 - value3;
      };
      b.removeStateCategory(value2, value4);
      var value5 = `${b.name()}の特殊状態異常を\\C[3]${value4}\\C[0]個回復した！`;
      showMessage(value5);
    };
  };
/*
if(value1 >= 1){
  var value2 = 'StateUnique';
  if(b.isStateCategoryAffected(value2)){
    var value3 = b.getStateCategoryAffectedCount(value2);
      if(value3 >= value1){
        var value4 = value1;
        var value1 = 0;
      } else {
        var value4 = value3;
        var value1 = value1 - value3;
      };
    b.removeStateCategory(value2, value4);
    var value5 = `${b.name()}の固有状態異常を\\C[3]${value4}\\C[0]個回復した！`;
    if($gameParty.inBattle()){
      BattleManager._logWindow.push(`addText`, value5);
    } else {
      TickerManager.show(value5);
    };
  };
};
*/
};

};

powerUp_dispel = function(a,b,itemId,id1){

var value1 = 0;
for (var i = 0; i < valueDispelGuardState.length; i++) {
  if(b.isStateAffected(valueDispelGuardState[i])){
    var value1 = 1;
    var value5 = `${b.name()}のディスペル・ガード効果が発動！　強化消去を無効化した。`;
    showMessage(value5);
    if ($gameParty.inBattle()) b.startAnimation(286, true, 0);
    break;
  };
};
if(value1 == 0){
  var value3 = 0;
  var valueItems = get_valueItems_sis(id1);
  if(valueItems[itemId].meta['dispelCount']){
    var value1 = Number(valueItems[itemId].meta['dispelCount']);
  } else {
    var value1 = 1;
  };
  var value2 = b.getStateCategoryAffectedCount('PowerUp');
  if(value2 == 0){
    var value5 = `${b.name()}は強化状態を付与されていない為、効果が無かった。`;
    if(a.isActor()){
      if($gameParty.inBattle()){
        BattleManager._logWindow.push(`addText`, value5);
      } else {
        TickerManager.show(value5);
      };
    };
    //if(id1 == 1){
      //$gameParty.gainItem(valueItems[itemId], +1);
    //};
    var value3 = 1;
  };
  if(valueItems[itemId].meta['dispelCountPlus']){
    var value2 = Math.floor(a.param(4) / 300);
    if(value2 >= 1){
      var value5 = `${a.name()}の\\C[16]Magic\\C[0]により消去数\\C[3]+${value2}\\C[0]！`;
      if(a.isActor()){
        if($gameParty.inBattle()){
          BattleManager._logWindow.push(`addText`, value5);
        } else {
          TickerManager.show(value5);
        };
      };
      var value1 = value1 + value2;
    };
  };
  var value2 = 'PowerUp';
  if(b.isStateCategoryAffected(value2)){
    var value3 = b.getStateCategoryAffectedCount(value2);
    if(value3 >= value1){
      var value4 = value1;
      var value1 = 0;
    } else {
      var value4 = value3;
      var value1 = value1 - value3;
    };
    b.removeStateCategory(value2, value4);
    var value5 = `${b.name()}の強化状態を\\C[3]${value4}\\C[0]個消去した！`;
    if($gameParty.inBattle()){
      BattleManager._logWindow.push(`addText`, value5);
    } else {
      TickerManager.show(value5);
    };
  };
};

};

//スキルアイテム使用での二つ名変更//0スキル1アイテムskillItem_titles(a,b,this.item().id,0);
skillItem_titles = function(a,b,itemId,id1){

if(b.actorId() == a.actorId()){
  if(id1 == 0){
    var valueItems = $dataSkills;
  } else {
    var valueItems = $dataItems;
  };
  var arr1 = ["Z11_NickNameChange",50,110,0];//se
  var value1 = ``;//ランク
    if(valueItems[itemId].meta['Menu Category']){
      if(valueItems[itemId].meta['Menu Category'] == " H'sTitle"){var arr1 = ["Z_Suspicious",50,150,0]};
    };
    if(id1 == 0){
      if(valueItems[itemId].stypeId == 15){var arr1 = ["Z_Suspicious",50,150,0]};
    };
      if(valueItems[itemId].meta['RankUpPoint']){
        if(Number(valueItems[itemId].meta['Max Mastery Level']) == 6){
          if(b.skillMasteryLevel(itemId) == 1){var value1 = `[E]`};
          if(b.skillMasteryLevel(itemId) == 2){var value1 = `[D]`};
          if(b.skillMasteryLevel(itemId) == 3){var value1 = `[C]`};
          if(b.skillMasteryLevel(itemId) == 4){var value1 = `[B]`};
          if(b.skillMasteryLevel(itemId) == 5){var value1 = `[A]`};
          if(b.skillMasteryLevel(itemId) == 6){var value1 = `[S]`};
        };
        if(Number(valueItems[itemId].meta['Max Mastery Level']) == 5){
          if(Number(valueItems[itemId].meta['RankUpPoint']) >= 100){
            if(b.skillMasteryLevel(itemId) == 1){var value1 = `[D]`};
            if(b.skillMasteryLevel(itemId) == 2){var value1 = `[C]`};
            if(b.skillMasteryLevel(itemId) == 3){var value1 = `[B]`};
            if(b.skillMasteryLevel(itemId) == 4){var value1 = `[A]`};
            if(b.skillMasteryLevel(itemId) == 5){var value1 = `[S]`};
          } else {
            if(b.skillMasteryLevel(itemId) == 1){var value1 = `[E]`};
            if(b.skillMasteryLevel(itemId) == 2){var value1 = `[D]`};
            if(b.skillMasteryLevel(itemId) == 3){var value1 = `[C]`};
            if(b.skillMasteryLevel(itemId) == 4){var value1 = `[B]`};
            if(b.skillMasteryLevel(itemId) == 5){var value1 = `[A]`};
          };
        };
        if(Number(valueItems[itemId].meta['Max Mastery Level']) == 10){
          if(Number(valueItems[itemId].meta['RankUpPoint']) >= 100){
            if(b.skillMasteryLevel(itemId) == 1 || b.skillMasteryLevel(itemId) == 2){var value1 = `[D]`};
            if(b.skillMasteryLevel(itemId) == 3 || b.skillMasteryLevel(itemId) == 4){var value1 = `[C]`};
            if(b.skillMasteryLevel(itemId) == 5 || b.skillMasteryLevel(itemId) == 6){var value1 = `[B]`};
            if(b.skillMasteryLevel(itemId) == 7 || b.skillMasteryLevel(itemId) == 8){var value1 = `[A]`};
            if(b.skillMasteryLevel(itemId) == 9 || b.skillMasteryLevel(itemId) == 10){var value1 = `[S]`};
          } else {
            if(b.skillMasteryLevel(itemId) == 1 || b.skillMasteryLevel(itemId) == 2){var value1 = `[E]`};
            if(b.skillMasteryLevel(itemId) == 3 || b.skillMasteryLevel(itemId) == 4){var value1 = `[D]`};
            if(b.skillMasteryLevel(itemId) == 5 || b.skillMasteryLevel(itemId) == 6){var value1 = `[C]`};
            if(b.skillMasteryLevel(itemId) == 7 || b.skillMasteryLevel(itemId) == 8){var value1 = `[B]`};
            if(b.skillMasteryLevel(itemId) == 9 || b.skillMasteryLevel(itemId) == 10){var value1 = `[A]`};
          };
        };
      };
        //性欲度スキルのみの特殊パターン
        if(id1 == 0 && itemId == 50){
          var value2 = $gameVariables.value(b.actorId()+380)[1];
          if(value2 <= 100){var value1 = `[圏外]`};
          if(value2 <= 200 && value2 >= 101){var value1 = `[圏外]`};
          if(value2 <= 300 && value2 >= 201){var value1 = `[E]`};
          if(value2 <= 400 && value2 >= 301){var value1 = `[D]`};
          if(value2 <= 500 && value2 >= 401){var value1 = `[C]`};
          if(value2 <= 600 && value2 >= 501){var value1 = `[B]`};
          if(value2 <= 700 && value2 >= 601){var value1 = `[A]`};
          if(value2 <= 800 && value2 >= 701){var value1 = `[S]`};
          if(value2 <= 900 && value2 >= 801){var value1 = `[SS]`};
          if(value2 >= 901){var value1 = `[SSS]`};
        };
  if(id1 == 1 && itemId == 600){//タイトルデフォルト設定アイテム。現状は不採用
    $gameActors.actor(b._actorId).setNickname(`${$dataActors[b._actorId].nickname}`);
    TickerManager.show(`${b.name()}の二つ名が${$dataActors[b._actorId].nickname}になった！`);
    AudioManager.playSe({"name":arr1[0],"volume":Number(arr1[1]),"pitch":Number(arr1[2]),"pan":Number(arr1[3])});
  } else {
    $gameActors.actor(b._actorId).setNickname(`＜${valueItems[itemId].name+value1}＞`);
    TickerManager.show(`${b.name()}の二つ名が＜${valueItems[itemId].name+value1}＞になった！`);
    AudioManager.playSe({"name":arr1[0],"volume":Number(arr1[1]),"pitch":Number(arr1[2]),"pan":Number(arr1[3])});
  };
};

};



//コモンイベントでスクリプト実行前に代入
common_script1 = function(id1,id2,id3,id4,id5,id6,id7,id8,id9,id10){

$gameVariables.setValue(14,id1);
$gameVariables.setValue(121,id2);
$gameVariables.setValue(122,id3);
$gameVariables.setValue(123,id4);
$gameVariables.setValue(124,id5);
$gameVariables.setValue(125,id6);
$gameVariables.setValue(126,id7);
$gameVariables.setValue(127,id8);
$gameVariables.setValue(128,id9);
$gameVariables.setValue(129,id10);

};

//スキル複数選択肢1スキル用
skill_sentaku = function(id,value1){

if(!$gameSwitches.value(19)){
  if($gameVariables.value(Number($dataSkills[id].meta.VariableChangeUse)) == 1){
    $gameVariables.setValue(Number($dataSkills[id].meta.VariableChangeUse),2);
  } else {
    if($gameVariables.value(Number($dataSkills[id].meta.VariableChangeUse)) == 2){
      $gameVariables.setValue(Number($dataSkills[id].meta.VariableChangeUse),3);
    } else {
      if($gameVariables.value(Number($dataSkills[id].meta.VariableChangeUse)) == 3){
        if($dataSkills[id].meta.ValChangeName4){
          $gameVariables.setValue(Number($dataSkills[id].meta.VariableChangeUse),4);
        } else {
          $gameVariables.setValue(Number($dataSkills[id].meta.VariableChangeUse),1);
        };
      } else {
        if($gameVariables.value(Number($dataSkills[id].meta.VariableChangeUse)) == 4){
          if($dataSkills[id].meta.ValChangeName5){
            $gameVariables.setValue(Number($dataSkills[id].meta.VariableChangeUse),5);
          } else {
            $gameVariables.setValue(Number($dataSkills[id].meta.VariableChangeUse),1);
          };
        } else {
          if($gameVariables.value(Number($dataSkills[id].meta.VariableChangeUse)) == 5){
            $gameVariables.setValue(Number($dataSkills[id].meta.VariableChangeUse),1);
          };
}}}}};
if($gameVariables.value(Number($dataSkills[id].meta.VariableChangeUse)) == 1){
  $dataSkills[id].name = $dataSkills[id].meta.ValChangeName1;
} else {
  if($gameVariables.value(Number($dataSkills[id].meta.VariableChangeUse)) == 2){
    $dataSkills[id].name = $dataSkills[id].meta.ValChangeName2;
  } else {
    if($gameVariables.value(Number($dataSkills[id].meta.VariableChangeUse)) == 3){
      $dataSkills[id].name = $dataSkills[id].meta.ValChangeName3;
    } else {
      if($gameVariables.value(Number($dataSkills[id].meta.VariableChangeUse)) == 4){
        $dataSkills[id].name = $dataSkills[id].meta.ValChangeName4;
      } else {
        if($gameVariables.value(Number($dataSkills[id].meta.VariableChangeUse)) == 5){
          $dataSkills[id].name = $dataSkills[id].meta.ValChangeName5;
        };
}}}};

};

//苗字取得
family_name = function(id1,id2){

$gameVariables.setValue(id2,$gameVariables.value(id1+380)[50]);

};

//ウィンドウカラー変更
window_color1 = function(id1){

if(id1 == 0){
  $gameSystem.setWindowTone([0,0,0]);
};
if(id1 == 1){
  $gameSystem.setWindowTone([170,0,170]);//H関係
};
if(id1 == 2){
  $gameSystem.setWindowTone([-34,153,68]);//一人称視点
};
if(id1 == 3){
  $gameSystem.setWindowTone([170,170,0]);//その他（白と黄の間？）
};
if(id1 == 4){
  $gameSystem.setWindowTone([-255,170,34]);//その他（薄水色）
};

};

//エネミーグループ設定$gameVariables.value(270)//$gameVariables.value(232)
enemy_troopPush = function(){

var value11 = 0;
for (var j = 11; j <= 20; j++) {
var value12 = 0;
var value13 = 0;
  if($gameVariables.value(220) != 0){
    var array = $gameVariables.value(220);
    var troopsId = j; //グループIDを指定
    $dataTroops[troopsId].name = $dataItems[$gameVariables.value(240)].meta['TroopName'];
    $dataTroops[troopsId].members = []; //グループのメンバーを空に
    var arr = $dataItems[$gameVariables.value(240)].meta['BattleEnemyPopC'].split(',');
    var value10 = arr[Math.floor(Math.random() * arr.length)];
    var value10 =  Number(value10);
    if($gameVariables.value(232) >= 2){
      var value2 = Math.floor( Math.random() * $gameVariables.value(232));
      value10 += value2;
      if($gameVariables.value(270) >= 11){
        var value3 = Math.floor( Math.random() * 101);
        if($gameVariables.value(270) >= value3){
          value10 += 1;
        };
      };
    };
      if($gameVariables.value(242) != 0){
        for (var j1 = 0; j1 <= $gameVariables.value(242).length-1; j1++) {
          var value1 = Math.floor( Math.random() * 101);
          value1 -= value11;
          if($gameParty.membersState(304)){value1 += 10};
          if($gameParty.membersState(305)){value1 += 10};
          if($gameParty.membersState(306)){value1 += 10};
          if(value1 >= 80){
            //var value2 = $gameVariables.value(242)[Math.floor(Math.random() * $gameVariables.value(242).length)];
            //array.push(value2);
            var array = array.concat($gameVariables.value(242));
            value11 += 10;
          };
        };
      };
    if(value10 >= 9){var value10 = 8};
    //var value10 = Math.max(...arr);
      for (var i = 1; i <= value10; i++) {
        var value1 = Number(array[Math.floor(Math.random() * array.length)]); //出現エネミースポーン
        if(value1 == 27 && value12 == 1){var value1 = 21};
        if(value1 == 27){var value12 = 1};//id27を１体だけにする
        if(value1 == 28 && value13 == 1){var value1 = 22};
        if(value1 == 28){var value13 = 1};//id28を１体だけにする
        if(i >= value10 && value10 != 1){var value5 = true }else{var value5 = false};//ラスト一人を隠している。エネミー一人の時は除外
        if(i == 1){var value2 = 450; var value3 = 350};
        if(value10 == 1){var value2 = 350; var value3 = 420};
        if(i == 2){var value2 = 400; var value3 = 500};
        if(i == 3){var value2 = 350; var value3 = 350};
        if(i == 4){var value2 = 300; var value3 = 500};
        if(i == 5){var value2 = 250; var value3 = 350};
        if(i == 6){var value2 = 200; var value3 = 500};
        if(i == 7){var value2 = 150; var value3 = 350};
        if(i == 8){var value2 = 100; var value3 = 500};
        var arr2 = [-30,-20,-10,0,10,20,30];
        var arr3 = [-30,-25,-20,-10,-5,0];
        var arr4 = [30,25,20,10,5,0];
          if(i >= 2 && i <= 6){
            var value2 = value2 + Number(arr2[Math.floor(Math.random() * arr2.length)]);
          };
          if(i == 2 || i == 4 || i == 6 || i == 8){
            var value3 = value3 + Number(arr3[Math.floor(Math.random() * arr3.length)]);
          } else {
            var value3 = value3 + Number(arr4[Math.floor(Math.random() * arr4.length)]);
          };
          if(value10 == 2){
            if(i == 2){var value2 = value2 - 200};
          };
          if(value10 == 3){
            if(i == 2){var value2 = value2 - 100};
            if(i == 3){var value2 = value2 - 100};
          };
          if(value10 == 4){
            if(i == 2){var value2 = value2 - 100};
            if(i == 3){var value2 = value2 - 100};
            if(i == 4){var value2 = value2 - 200};
          };
          if(value10 == 5){
            //if(i == 2){var value2 = value2 - 100};
            if(i == 3){var value2 = value2 - 100;var value3 = value3 + 50};
            if(i == 4){var value2 = value2 - 200};
            if(i == 5){var value2 = value2 - 100};
          };
          var value3 = value3 - 80;//戦闘背景に併せてy軸を変更
          var enemy = {enemyId:value1, x:value2, y:value3, hidden:value5}; //追加するエネミーの設定(ID1、座標(100,100)、表示有)value5
          $dataTroops[troopsId].members.push(enemy); //設定したエネミーをグループに追加
      };
  };
};
$gameSwitches.setValue(357,true);
};

//エロエネミーグループ設定
henemy_troopPush = function(){

if($gameVariables.value(228) != 0){
  var array = $gameVariables.value(228);
  var troopsId = 10; //グループIDを指定
  $dataTroops[troopsId].name = $dataItems[$gameVariables.value(240)].meta['TroopNameH'];
  $dataTroops[troopsId].members = []; //グループのメンバーを空に
  var arr = $dataItems[$gameVariables.value(240)].meta['BattleEnemyPopCH'].split(',');
  var value10 = Number(arr[Math.floor(Math.random() * arr.length)]);
    for (var i = 1; i <= value10; i++) {
      var value1 = Number(array[Math.floor(Math.random() * array.length)]); //出現エネミースポーン
      if(i >= value10){var value5 = true }else{var value5 = false};
      if(i == 1){var value2 = 450; var value3 = 350};
      if(value10 == 1){var value2 = 350; var value3 = 420};
      if(i == 2){var value2 = 400; var value3 = 500};
      if(i == 3){var value2 = 350; var value3 = 350};
      if(i == 4){var value2 = 300; var value3 = 500};
      if(i == 5){var value2 = 250; var value3 = 350};
      if(i == 6){var value2 = 200; var value3 = 500};
      if(i == 7){var value2 = 150; var value3 = 350};
      if(i == 8){var value2 = 100; var value3 = 500};
      var arr2 = [-30,-20,-10,0,10,20,30];
      var arr3 = [-30,-25,-20,-10,-5,0];
      var arr4 = [30,25,20,10,5,0];
        if(i >= 2 && i <= 6){
          value2 = value2 + Number(arr2[Math.floor(Math.random() * arr2.length)]);
        };
        if(i == 2 || i == 4 || i == 6 || i == 8){
          value3 = value3 + Number(arr3[Math.floor(Math.random() * arr3.length)]);
        } else {
          value3 = value3 + Number(arr4[Math.floor(Math.random() * arr4.length)]);
        };
        if(value10 == 2){
          if(i == 2){value2 = value2 - 200};
        };
        if(value10 == 3){
          if(i == 2){value2 = value2 - 100};
          if(i == 3){value2 = value2 - 100};
        };
        if(value10 == 4){
          if(i == 2){value2 = value2 - 100};
          if(i == 3){value2 = value2 - 100};
          if(i == 4){value2 = value2 - 200};
        };
        if(value10 == 5){
          //if(i == 2){value2 = value2 - 100};
          if(i == 3){value2 = value2 - 100;value3 = value3 + 50};
          if(i == 4){value2 = value2 - 200};
          if(i == 5){value2 = value2 - 100};
        };
        //value3 = value3 - 80;//戦闘背景に併せてy軸を変更
        var enemy = {enemyId:value1, x:value2, y:value3, hidden:false};//value5 //追加するエネミーの設定(ID1、座標(100,100)、表示有)
        $dataTroops[troopsId].members.push(enemy); //設定したエネミーをグループに追加
    };
};

};

//エネミーグループ配置設定。bosssetup時に実行
enemy_troopPosition1 = function(){

var start = 1;
var end = $dataTroops.length-1;
for (var i = start; i <= end; i++) {
  if($dataTroops[i].name.match(/one/)){
    var value2 = 250; 
    var value3 = 330;
    $dataTroops[i].members[0].x = value2;
    $dataTroops[i].members[0].y = value3;
  };
  if($dataTroops[i].name.match(/big/)){
    var value2 = 250; 
    var value3 = 400;
    $dataTroops[i].members[0].x = value2;
    $dataTroops[i].members[0].y = value3;
  };
  if($dataTroops[i].name.match(/500/)){
    var value2 = 250; 
    var value3 = 500;
    $dataTroops[i].members[0].x = value2;
    $dataTroops[i].members[0].y = value3;
  };
  if($dataTroops[i].name.match(/600/)){
    var value2 = 250; 
    var value3 = 600;
    $dataTroops[i].members[0].x = value2;
    $dataTroops[i].members[0].y = value3;
  };
  if($dataTroops[i].name.match(/768/)){
    var value2 = 250; 
    var value3 = 768;
    $dataTroops[i].members[0].x = value2;
    $dataTroops[i].members[0].y = value3;
  };
  if($dataTroops[i].name.match(/バハムート/)){
    var value2 = 150; 
    var value3 = 600;
    $dataTroops[i].members[0].x = value2;
    $dataTroops[i].members[0].y = value3;
  };
};

}

//図鑑のテキスト代入
scene_Glossarytext1 = function(itemId, variableId) {
  const gameVariables = $gameVariables;
  const dataItems = $dataItems;
  const dataStates = $dataStates;
  const dataEnemies = $dataEnemies;

  const itemData = dataItems[itemId];
  const itemMeta = itemData.meta;

  // Handle enemy element and level data
  const enemyElementArray = itemMeta['EnemyElement'] ? itemMeta['EnemyElement'].split(',') : [0];
  const enemyLevelRange = itemMeta['EnemyLV'] ? itemMeta['EnemyLV'].split(',') : [0];
  const maxEnemyLevel = Math.max(...enemyLevelRange);
  const minEnemyLevel = Math.min(...enemyLevelRange);

  // Check if it's a dungeon map
  let isDungeonMap = itemMeta['OnSwitch'] && itemMeta['OnSwitch'].split(',').map(Number).includes(207);

  // Build header text
  const locationType = isDungeonMap ? 'ダンジョン' : 'フィールド';
  const glossaryText = [];
  
  glossaryText.push(`\\C[16]＜${locationType}マップ情報＞\\C[0]\n`);
  glossaryText.push(`${itemData.description}\n`);
  glossaryText.push(`\\C[16]エネミーLV：\\C[0]\\C[10]${minEnemyLevel}\\C[0]～\\C[10]${maxEnemyLevel}\\C[0]　`);

  // Add element info
  glossaryText.push(`　　\\C[16]属性：\\C[0]`);
  if (Number(itemMeta['EnemyElement']) === 0) {
    glossaryText.push(`？？？`);
  } else {
    enemyElementArray.forEach(elem => {
      const item = dataStates[Number(elem)].name;
      glossaryText.push(`【\\C[13]${item}\\C[0]】　`);
    });
  }

  // Add annihilation count
  const annCount = gameVariables.value(257)[itemId];
  if (annCount >= 1) {
    glossaryText.push(`\\C[16]殲滅回数：\\C[0]\\C[10]${annCount}\\C[0]　\n`);
  } else {
    glossaryText.push(`\n`);
  }

  // Add first annihilation reward
  if (itemMeta['firstAnnihilationItem'] && annCount >= 1) {
    const firstAnnihilationItemArray = itemMeta['firstAnnihilationItem'].split(',');
    const itemType = Number(firstAnnihilationItemArray[0]);
    const rewardItems = itemType === 0 ? dataItems : itemType === 1 ? $dataWeapons : $dataArmors;
    const item = rewardItems[Number(firstAnnihilationItemArray[1])].name;
    glossaryText.push(`\\C[16]初回殲滅報酬：\\C[0]\\C[10]${item}\\C[0]　\n`);
  }

  // Add treasure chest info
  if (itemMeta['TchestOnly'] && gameVariables.value(212)[itemId] >= 1) {
    const treasureChestArray = itemMeta['TchestOnly'].split(',');
    const itemType = Number(treasureChestArray[3]);
    const treasureItems = itemType === 0 ? dataItems : itemType === 1 ? $dataWeapons : $dataArmors;
    const item = treasureItems[Number(treasureChestArray[4])].name;
    glossaryText.push(`\\C[16]白箱：\\C[0]\\C[10]${item}\\C[0]　\n`);
  }

  // Add unique materials
  glossaryText.push(Glossarytext1AddUniqueMaterials(itemMeta, dataItems));

  // Add enemy information
  glossaryText.push(`\\C[16]・出現エネミー\\C[0]\n`);
  let enemyCount = 0;
  const enemyPopArray = [];

  // Collect enemy info
  for (let i = 1; i <= 8; i++) {
    if (!itemMeta['PopEnemy' + i]) continue;

    const enemyInfo = itemMeta['PopEnemy' + i].split(',');
    enemyPopArray.push(enemyInfo);

    glossaryText.push(`【\\C[2]${enemyInfo[1]}\\C[0]】`);
    enemyCount += 1;
    if ((i % 2) === 0) {
      glossaryText.push(`\n`);
    }
  }
  glossaryText.push(`\n`);

  // Process enemy data
  glossaryText.push(Glossarytext1ProcessEnemyData(enemyPopArray, dataEnemies, dataStates, itemMeta));

  // Store result in variable
  gameVariables.value(variableId)[itemId] = glossaryText.join('');
};

// Helper function to process unique materials
function Glossarytext1AddUniqueMaterials(itemMeta, dataItems) {
  const materialTextArray = [];
  let materialCount = 0;

  for (let i = 1; i <= 10; i++) {
    if (!itemMeta['UniqueMaterial' + i]) continue;

    if (materialCount === 0) {
      materialTextArray.push(`\n\\C[16]・希少採取素材\\C[0]`);
    }

    const uniqueMaterialArray = itemMeta['UniqueMaterial' + i].split(',');
    if (uniqueMaterialArray[0] >= 1) {
      const item = dataItems[Number(uniqueMaterialArray[0])].name;
      materialTextArray.push(`【\\C[3]${item}\\C[0]】`);
      materialCount += 1;

      if ((materialCount % 3) === 0) {
        materialTextArray.push(`\n`);
      }
    }
  }

  return materialTextArray.join('') + `\n`;
}

// Helper function to process enemy data
function Glossarytext1ProcessEnemyData(enemyPopArray, dataEnemies, dataStates, itemMeta) {
  const processedText = [];
  let stateCount = 0;
  const processedStateNames = new Set();
  
  // Clone enemies and extract state info
  enemyPopArray.forEach((enemyInfo, index) => {
    const enemyId = Number(enemyInfo[0]);
    const baseEnemy = dataEnemies[enemyId];
    
    // Clone enemy for processing
    dataEnemies[index + 21] = Object.assign({}, baseEnemy);
    const clonedEnemy = dataEnemies[index + 21];
    clonedEnemy.name = enemyInfo[1];
    clonedEnemy.battlerName = enemyInfo[2];
    clonedEnemy.battlerHue = Number(enemyInfo[3]);
    
    // Set skills
    const actions = clonedEnemy.actions;
    actions[0].skillId = Number(enemyInfo[4]);
    actions[1].skillId = Number(enemyInfo[5]);
    actions[2].skillId = Number(enemyInfo[6]);
    actions[3].skillId = Number(enemyInfo[7]);
    
    // Process passive states
    if (baseEnemy.meta['Passive State']) {
      const passiveStateArray = baseEnemy.meta['Passive State'].split(',');
      passiveStateArray.forEach(stateId => {
        const stateIdNum = Number(stateId);
        const state = dataStates[stateIdNum];
        if (!processedStateNames.has(state.name)) {
          processedText.push(`${state.description}\n`);
          processedStateNames.add(state.name);
        }
      });
    }
    
    stateCount += 1;
  });
  
  // Process enemy special states
  if (itemMeta['EnemySpecialState']) {
    const specialStateArray = itemMeta['EnemySpecialState'].split(',');
    specialStateArray.forEach(stateId => {
      const stateIdNum = Number(stateId);
      if (stateIdNum >= 1) {
        processedText.push(`${dataStates[stateIdNum].description}\n`);
      }
    });
  }
  
  // Process conditional states
  processedText.push(`\n`);
  let conditionStateCount = 0;
  
  for (let enemyId = 21; enemyId <= 21 + stateCount; enemyId++) {
    const enemy = dataEnemies[enemyId];
    if (!enemy) continue;
    
    valueEnemyAddState.forEach(stateId => {
      const state = dataStates[stateId];
      
      // Check name-based conditions
      if (state.meta['NameCondiAddState']) {
        const nameConditions = state.meta['NameCondiAddState'].split(',');
        const nameMatch = nameConditions.some(cond => enemy.name.match(cond));
        
        if (nameMatch && !processedStateNames.has(state.name)) {
          processedText.push(`【\\C[14]${state.name}\\C[0]】`);
          processedStateNames.add(state.name);
          conditionStateCount += 1;
          
          if ((conditionStateCount % 3) === 0) {
            processedText.push(`\n`);
          }
        }
      }
      
      // Check graphic-based conditions
      if (state.meta['GraphicNameCondiAddState']) {
        const graphicConditions = state.meta['GraphicNameCondiAddState'].split(',');
        const graphicMatch = graphicConditions.some(cond => enemy.battlerName.match(cond));
        
        if (graphicMatch && !processedStateNames.has(state.name)) {
          processedText.push(`【\\C[14]${state.name}\\C[0]】`);
          processedStateNames.add(state.name);
          conditionStateCount += 1;
          
          if ((conditionStateCount % 3) === 0) {
            processedText.push(`\n`);
          }
        }
      }
    });
  }
  
  return processedText.join('');
}

//図鑑のテキスト代入ボス分$gameVariables.value(305)[id]
scene_Glossarytext2 = function(itemId, variableId) {
  const itemData = $dataItems[itemId];
  const glossaryText = [`\\C[16]＜ボス情報＞\\C[0]\n`];

  if (itemData.meta['BossEnemy']) {
    const bossInfo = itemData.meta['BossEnemy'].split(',');
    const bossName = bossInfo[1];
    const bossDefeated = $gameVariables.value(305)[itemId] >= 1;

    if (bossDefeated) {
      const bossLevel = Number(itemData.meta['BossLV']);
      const defeatedCount = $gameVariables.value(305)[itemId];

      glossaryText.push(`\\C[16]名前：\\C[0]${bossName}　ＬＶ：${bossLevel}　`);
      glossaryText.push(`\\C[16]討伐回数：\\C[0]\\C[10]${defeatedCount}\\C[0] \n`);

      const normalAttackId = Number(bossInfo[4]);
      const normalAttackSkill = $dataSkills[normalAttackId];
      glossaryText.push(`\\C[16]通常攻撃\\C[0]\\I[${normalAttackSkill.iconIndex}]${normalAttackSkill.name} `);

      if (itemData.meta['BossAddAttack']) {
        const additionalAttacks = itemData.meta['BossAddAttack'].split(',');

        for (let i = 0; i < additionalAttacks.length; i++) {
          const skillId = Number(additionalAttacks[i]);
          const attackSkill = $dataSkills[skillId];
          glossaryText.push(`\\I[${attackSkill.iconIndex}]${attackSkill.name} `);
        }
      }

      glossaryText.push(`\n`);

      const abilityId = Number(bossInfo[5]);
      const abilitySkill = $dataSkills[abilityId];
      glossaryText.push(`\\C[16]アビリティ\\C[0]\\I[${abilitySkill.iconIndex}]${abilitySkill.name}\n`);

      let abilityDescription = abilitySkill.description;
      abilityDescription = abilityDescription.replace("[\\C[2]戦闘中1回\\C[0]]", "");
      glossaryText.push(`${abilityDescription}\n`);

      if (itemData.meta['BossAddSkill']) {
        const additionalSkills = itemData.meta['BossAddSkill'].split(',');

        for (let i = 0; i < additionalSkills.length; i++) {
          const skillId = Number(additionalSkills[i]);
          const skill = $dataSkills[skillId];
          glossaryText.push(`\\I[${skill.iconIndex}]${skill.name}\n`);
        }
      }

      const ultimateId = Number(bossInfo[6]);
      const ultimateSkill = $dataSkills[ultimateId];
      glossaryText.push(`\\C[16]奥義\\C[0]\\I[${ultimateSkill.iconIndex}]${ultimateSkill.name}\n`);

      let ultimateDescription = ultimateSkill.description;
      ultimateDescription = ultimateDescription.replace("[\\C[2]戦闘中1回\\C[0]]", "");
      glossaryText.push(`${ultimateDescription}\n`);

      if (itemData.meta['BossStateInformation']) {
        glossaryText.push(`\n`);
        const stateInfos = itemData.meta['BossStateInformation'].split(',');

        const primaryStateId = Number(stateInfos[0]);
        if (!isNaN(primaryStateId)) {
          glossaryText.push(`${$dataStates[primaryStateId].description}\n`);
        }

        for (let i = 1; i < stateInfos.length; i++) {
          if (stateInfos[i]) {
            const stateId = Number(stateInfos[i]);
            if (!isNaN(stateId) && stateId !== 0) {
              glossaryText.push(`${$dataStates[stateId].description}\n`);
            }
          }
        }
      }
    } else {
      glossaryText.push(`情報なし。討伐後に情報更新。`);
    }
  } else {
    glossaryText.push(`※ ボス不在。`);
  }

  $gameVariables.value(variableId)[itemId] = glossaryText.join('');
};

//図鑑のテキスト代入ボス特殊行動
scene_Glossarytext3 = function(itemId, variableId) {
  const glossaryText = [];
  const itemData = $dataItems[itemId];
  let specialActionCount = 0;

  glossaryText.push(`\\C[16]＜ボス特殊行動一覧＞\\C[0]\n`);

  // If boss hasn't been defeated yet, show placeholder text
  if ($gameVariables.value(305)[itemId] < 1) {
    glossaryText.push(`情報なし。討伐後に情報更新。`);
    $gameVariables.value(variableId)[itemId] = glossaryText.join('');
    return;
  }

  // Process all possible special actions
  for (let actionIndex = 1; actionIndex <= 15; actionIndex++) {
    const metaKey = 'BossSpecialAction' + actionIndex;
    if (!itemData.meta[metaKey]) continue;
    
    specialActionCount++;
    const actionData = itemData.meta[metaKey].split(',');
    const triggerType = Number(actionData[0]);
    const triggerValue = Number(actionData[1]);
    const skillId = Number(actionData[2]);

    // Add trigger condition text
    glossaryText.push(getTriggerText(triggerType, triggerValue));
    
    // Add skill information
    glossaryText.push(`\\C[10]\x1bSIN[${skillId}]\\C[0]\n`);
    glossaryText.push(`${$dataSkills[skillId].description}\n`);
  }

  // If no special actions found
  if (specialActionCount === 0) {
    glossaryText.push(`なし`);
  }

  $gameVariables.value(variableId)[itemId] = glossaryText.join('');
};

// Helper function to get trigger text based on type and value
function getTriggerText(triggerType, triggerValue) {
  switch (triggerType) {
    case 0:
    case 9:
      return `<\\C[2]HP${triggerValue}%\\C[0]以下で発動>\n`;
    case 1:
      return `<\\C[2]MP${triggerValue}%\\C[0]以下で発動>\n`;
    case 2:
      return `<\\C[2]${triggerValue}%\\C[0]ターン毎に発動>\n`;
    case 3:
      return `<\\C[2]オーバードライブ\\C[0]時に発動>\n`;
    default:
      return `<\\C[2]特殊条件\\C[0]で発動>\n`;
  }
}

  //マップ情報を代入
const jouhouMapResetVariableIds = [37, 81, 82, 197, 207, 222, 224, 226, 227, 232, 230, 235, 236, 240, 241, 251, 256, 260, 266, 329, 507, 508];
jouhou_map = function() {
  // Run on every map loading

  const gameVariables = $gameVariables;
  const gameSwitches = $gameSwitches;
  const dataMap = $dataMap;

  // Reset map-related switches and variables
  for (let i = 201; i <= 377; i++) {
    gameSwitches.setValue(i, false);
  }
  
  jouhouMapResetVariableIds.forEach(varId => {
    gameVariables.setValue(varId, 0);
  });

  // Process conditional map switches
  const conditionalMapSwitches = gameVariables.value(356);
  const foundMapSwitch = processMapConditionalSwitches(dataMap, gameSwitches, gameVariables, conditionalMapSwitches);
  
  // Apply default map switches if no conditions matched
  if (foundMapSwitch === 0 && dataMap.meta['MapSwi']) {
    const switchIds = dataMap.meta['MapSwi'].split(',').map(Number);
    switchIds.forEach(switchId => {
      if (switchId !== 0) {
        gameSwitches.setValue(switchId, true);
      }
    });
  }

  // Extract map metadata
  const mapMeta = extractMapMetadata(dataMap);
  
  // Set basic map type switches
  setMapTypeSwitches(mapMeta, gameSwitches, gameVariables);

  // Set town and battle map info
  setMapLocationInfo(gameSwitches, gameVariables);

  // Determine current map info source
  const mapInfo = determineMapInfoSource(dataMap, gameVariables, gameSwitches);

  // Play start sound effect
  mapPlayStartSoundEffect(mapInfo, gameSwitches);

  // Set up enemy states and map variables
  setupMapEnemyVariables(mapInfo, gameVariables);

  // Set up escape and move positions
  setupMapPositions(mapInfo, gameVariables);

  // Process unique material slots
  setupUniqueMaterials(mapInfo, gameVariables);

  // Configure enemy and boss setup
  setupMapEnemiesAndBoss(mapInfo);

  // Set up battlebacks and parallax
  setupMapBattlebacksAndParallax(mapInfo, dataMap, gameVariables, gameSwitches, $gameMap);

  // Configure BGS and BGM
  setupMapBackgroundAudio(mapInfo, dataMap, gameVariables, gameSwitches);
};

// Helper Functions

processMapConditionalSwitches = function(dataMap, gameSwitches, gameVariables, conditionalMapSwitches) {
  let foundMapSwitch = 0;
  const dataMapMeta = dataMap.meta;
  
  // Check variable-based conditional switches
  for (let i = 9; i > 0; i--) {
    const varKey = 'ChangeMapVal' + i;
    const switchKey = 'MapSwiCVal' + i;
    
    if (!dataMapMeta[varKey] || !dataMapMeta[switchKey]) continue;
    
    const [varId, varValue] = dataMapMeta[varKey].split(',').map(Number);
    if (gameVariables.value(varId) < varValue) continue;
    
    mapActivateConditionalSwitches(dataMapMeta[switchKey], gameSwitches, conditionalMapSwitches);
    foundMapSwitch = 1;
    break;
  }
  
  // Check switch-based conditional switches if no variable conditions matched
  if (foundMapSwitch === 0) {
    for (let i = 9; i > 0; i--) {
      const switchCondKey = 'ChangeMapSwi' + i;
      const targetSwitchKey = 'MapSwiCSwi' + i;
      
      if (!dataMapMeta[switchCondKey] || !dataMapMeta[targetSwitchKey]) continue;
      
      const condSwitchId = Number(dataMapMeta[switchCondKey]);
      if (!gameSwitches.value(condSwitchId)) continue;
      
      mapActivateConditionalSwitches(dataMapMeta[targetSwitchKey], gameSwitches, conditionalMapSwitches);
      foundMapSwitch = 1;
      break;
    }
  }
  
  return foundMapSwitch;
};

mapActivateConditionalSwitches = function(switchIdString, gameSwitches, conditionalMapSwitches) {
  const switchIds = switchIdString.split(',').map(Number);
  
  switchIds.forEach(switchId => {
    if (switchId === 0) return;
    
    gameSwitches.setValue(switchId, true);
    
    if (conditionalMapSwitches[switchId] !== 0) {
      conditionalMapSwitches[switchId] = 1;
    }
  });
};

extractMapMetadata = function(dataMap) {
  const mapMeta = {
    outInFloorType: 0,
    outInFloorValue: 0,
    homeType: 0,
    animalType: 0,
    npcType: 0,
    mapHeight: dataMap.height,
    mapWidth: dataMap.width
  };

  const dataMapMeta = dataMap.meta;
  
  if (dataMapMeta['OutIn_Froor']) {
    const [type, value] = dataMapMeta['OutIn_Froor'].split(',').map(Number);
    mapMeta.outInFloorType = type;
    mapMeta.outInFloorValue = value;
  }
  
  if (dataMapMeta['NPC']) mapMeta.npcType = Number(dataMapMeta['NPC']);
  if (dataMapMeta['Home']) mapMeta.homeType = Number(dataMapMeta['Home']);
  if (dataMapMeta['Animal']) mapMeta.animalType = Number(dataMapMeta['Animal']);
  
  return mapMeta;
};

setMapTypeSwitches = function(mapMeta, gameSwitches, gameVariables) {
  // Set indoor/outdoor switch
  if (mapMeta.outInFloorType >= 1) {
    gameSwitches.setValue(203, true);
  } else {
    gameSwitches.setValue(204, true);
  }
  
  // Set floor value if available
  if (mapMeta.outInFloorValue >= 1) {
    gameVariables.setValue(232, mapMeta.outInFloorValue);
  }
  
  // Set NPC type if available
  if (mapMeta.npcType >= 1) {
    gameVariables.setValue(241, mapMeta.npcType);
  }
  
  // Set home switches if applicable
  if (mapMeta.homeType === 1) gameSwitches.setValue(206, true);
  if (mapMeta.homeType === 2) gameSwitches.setValue(231, true);
  
  // Calculate map size variable
  gameVariables.setValue(238, (mapMeta.mapHeight + mapMeta.mapWidth) / 20);
  
  // Set animal switch if applicable
  if (mapMeta.animalType >= 1) gameSwitches.setValue(208, true);
};

setMapLocationInfo = function(gameSwitches, gameVariables) {
  // Check town locations
  const dataWeapons = $dataWeapons;
  valueJouhouTown.forEach(weaponId => {
    const switchId = Number(dataWeapons[weaponId].meta['MapSwitch']);
    if (gameSwitches.value(switchId)) {
      gameVariables.setValue(230, weaponId);
      gameSwitches.setValue(202, true);
    }
  });
  
  // Check battle map locations
  const dataItems = $dataItems;
  valueJouhouBattleMap.forEach(itemId => {
    const switchId = Number(dataItems[itemId].meta['MapSwitch']);
    if (gameSwitches.value(switchId)) {
      gameVariables.setValue(240, itemId);
      gameSwitches.setValue(201, true);
    }
  });
};

determineMapInfoSource = function(dataMap, gameVariables, gameSwitches) {
  let mapInfo = dataMap;
  
  // Town map info
  if (gameVariables.value(230) >= 1) {
    const townId = gameVariables.value(230);
    mapInfo = $dataWeapons[townId];
    
    // Check if this is a repeated visit to the same town
    const visitMemory = gameVariables.value(237);
    if (townId === visitMemory[1] && visitMemory[0] === 1) {
      gameSwitches.setValue(216, true);
    } else {
      gameVariables.setValue(237, [1, townId]);
      gameSwitches.setValue(216, false);
    }
  }
  
  // Battle map info
  if (gameVariables.value(240) >= 1) {
    const battleMapId = gameVariables.value(240);
    mapInfo = $dataItems[battleMapId];
    
    // Check if this is a repeated visit to the same battle map
    const visitMemory = gameVariables.value(237);
    if (battleMapId === visitMemory[1] && visitMemory[0] === 2) {
      gameSwitches.setValue(216, true);
    } else {
      gameVariables.setValue(237, [2, battleMapId]);
      gameSwitches.setValue(216, false);
    }
  }
  
  return mapInfo;
};

mapPlayStartSoundEffect = function(mapInfo, gameSwitches) {
  const seKey = gameSwitches.value(15) ? 'StartSeN' : 'StartSe';
  
  if (!mapInfo.meta[seKey]) return;
  
  const [seName, seVolume, sePitch] = mapInfo.meta[seKey].split(',');
  AudioManager.playSe({
    name: seName,
    volume: Number(seVolume),
    pitch: Number(sePitch),
    pan: 0
  });
};

setupMapEnemyVariables = function(mapInfo, gameVariables) {
  // Cache map meta data
  const mapInfoMeta = mapInfo.meta;
  
  // Initialize special state array
  gameVariables.setValue(350, []);
  const specialStates = gameVariables.value(350);
  
  // Add enemy special states if available
  if (mapInfoMeta['EnemySpecialState']) {
    const stateIds = mapInfoMeta['EnemySpecialState'].split(',').map(Number);
    stateIds.forEach(stateId => {
      if (stateId >= 1) {
        specialStates.push(stateId);
      }
    });
  }
  
  // Set various map-specific variables
  if (mapInfoMeta['getWaterItem']) {
    gameVariables.setValue(266, Number(mapInfoMeta['getWaterItem']));
  }
  
  if (mapInfoMeta['weatherSetP']) {
    gameVariables.setValue(256, Number(mapInfoMeta['weatherSetP']));
  }
  
  const weatherKey = 'weatherSetPN';
  if (mapInfoMeta[weatherKey]) {
    gameVariables.setValue(251, Number(mapInfoMeta[weatherKey]));
  } else if ($dataMap.meta[weatherKey]) {
    gameVariables.setValue(251, Number($dataMap.meta[weatherKey]));
  }
  
  // Set mob related variables
  if (mapInfoMeta['MapCount']) {
    gameVariables.setValue(217, Number(mapInfoMeta['MapCount']));
  }
  
  if (mapInfoMeta['MapEnemyMaxPop']) {
    gameVariables.setValue(334, Number(mapInfoMeta['MapEnemyMaxPop']));
  }
  
  if (mapInfoMeta['MapEnemyPopC']) {
    gameVariables.setValue(224, Number(mapInfoMeta['MapEnemyPopC']));
  }
  
  if (mapInfoMeta['MapEnemyPopCH']) {
    gameVariables.setValue(227, Number(mapInfoMeta['MapEnemyPopCH']));
  }
  
  if (mapInfoMeta['HEnemyPopSwi']) {
    gameVariables.setValue(236, Number(mapInfoMeta['HEnemyPopSwi']));
  }
  
  if (mapInfoMeta['DeadBody']) {
    gameVariables.setValue(260, Number(mapInfoMeta['DeadBody']));
  }
  
  // Set enemy level variable
  if (mapInfoMeta['EnemyLV']) {
    gameVariables.setValue(270, Number(mapInfoMeta['EnemyLV'].split(',')[0]));
  }
  
  // Set switches from OnSwitch metadata
  const gameSwitches = $gameSwitches;
  if (mapInfoMeta['OnSwitch']) {
    const switchIds = mapInfoMeta['OnSwitch'].split(',').map(Number);
    switchIds.forEach(switchId => {
      if (switchId >= 1) {
        gameSwitches.setValue(switchId, true);
      }
    });
  }
};

setupMapPositions = function(mapInfo, gameVariables) {
  const mapInfoMeta = mapInfo.meta;
  const positions = gameVariables.value(204);
  
  // Set escape position
  if (mapInfoMeta['EscapeMapID']) {
    const [mapId, x, y] = mapInfoMeta['EscapeMapID'].split(',').map(Number);
    positions[0] = mapId;
    positions[1] = x;
    positions[2] = y;
  }
  
  // Set move position
  if (mapInfoMeta['MoveMapID']) {
    const [mapId, x, y] = mapInfoMeta['MoveMapID'].split(',').map(Number);
    positions[0] = mapId;
    positions[1] = x;
    positions[2] = y;
  }
  
  // Set permission cloth
  const clothKey = 'PermissionCloth';
  if (mapInfoMeta[clothKey]) {
    gameVariables.setValue(207, Number(mapInfoMeta[clothKey]));
  } else if ($dataMap.meta[clothKey]) {
    gameVariables.setValue(207, Number($dataMap.meta[clothKey]));
  }
};

setupUniqueMaterials = function(mapInfo, gameVariables) {
  // Initialize unique material slots array
  gameVariables.setValue(259, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  
  const mapInfoMeta = mapInfo.meta;
  // Process unique materials and backgrounds
  for (let idx = 1; idx <= 9; idx++) {
    // Preload background images
    if (mapInfoMeta['BG' + idx]) {
      Galv.CACHE.load('parallaxes', mapInfoMeta['BG' + idx].split(',')[0]);
    }
    
    if (mapInfoMeta['BGN' + idx]) {
      Galv.CACHE.load('parallaxes', mapInfoMeta['BGN' + idx].split(',')[0]);
    }
    
    // Set unique material IDs
    if (mapInfoMeta['UniqueMaterial' + idx]) {
      const materialId = Number(mapInfoMeta['UniqueMaterial' + idx].split(',')[0]);
      gameVariables.value(259)[idx] = materialId;
    }
  }
};

setupMapEnemiesAndBoss = function(mapInfo) {
  // Setup enemies if defined
  if (mapInfo.meta['PopEnemy1'] || mapInfo.meta['PopEnemy9']) {
    popEnemy_setUp(mapInfo);
    enemy_troopPush();
    henemy_troopPush();
  }
  
  // Setup boss if defined
  if (mapInfo.meta['BossEnemy']) {
    boss_setup1(1, 0);
  }
};

setupMapBattlebacksAndParallax = function(mapInfo, dataMap, gameVariables, gameSwitches, gameMap) {
  // Initialize background related variables
  let bgKey = 0;
  let battleBgKey = 0;
  let battleBgName = gameSwitches.value(15) ? 'StarlitSkyBattle' : 'BlueSkyBattle';
  let battleBg1 = 0;
  let battleBg2 = 0;
  
  // Determine background keys based on environment
  if (gameVariables.value(230) >= 1) {
    if (gameSwitches.value(203)) {
      if (gameSwitches.value(15)) {
        bgKey = 'BG_outN';
        battleBgKey = 'TownOutdoorN';
      } else {
        bgKey = 'BG_out';
        battleBgKey = 'TownOutdoor';
      }
    } else if (gameSwitches.value(204)) {
      if (gameSwitches.value(15)) {
        bgKey = 'BG_inN';
        battleBgKey = 'TownIndoorN';
      } else {
        bgKey = 'BG_in';
        battleBgKey = 'TownIndoor';
      }
    }
    
    // Set battleback if a key was determined
    if (battleBgKey) {
      gameMap.changeBattleback(battleBgName, battleBgKey);
    }
  }

  const mapInfoMeta = mapInfo.meta;

  // Handle battle map backgrounds
  if (gameVariables.value(240) >= 1) {
    // Determine background keys
    if (mapInfoMeta['BG2']) { 
      bgKey = 'BG2';
      battleBgKey = 'BG2';
    }
    if (mapInfoMeta['BG1']) {
      battleBgName = 'BG1';
    }
    // Night versions
    if (gameSwitches.value(15)) {
      if (mapInfoMeta['BGN2']) {
        bgKey = 'BGN2';
        battleBgKey = 'BGN2';
      }
      if (mapInfoMeta['BGN1']) {
        battleBgName = 'BGN1';
      }
    }
    // Set battleback if keys are available
    if (battleBgKey) {
      const bg1 = mapInfoMeta[battleBgName].split(',')[0];
      const bg2 = mapInfoMeta[battleBgKey].split(',')[0];
      gameMap.changeBattleback(bg1, bg2);
    }
  }
  
  // Set background variables if a key was determined
  if (bgKey) {
    setMapBgVariables(gameVariables, mapInfo, bgKey);
  }
  
  // Apply parallax settings changes
  parallaxesSound_switchChange(1);

  const dataMapMeta = dataMap.meta;

  // Override backgrounds from map metadata if specified
  if (gameSwitches.value(15)) {
    if (dataMapMeta['BGchangeN']) {
      mapInfo = dataMap;
      bgKey = 'BGchangeN';
      battleBg1 = 1;
    }
    if (dataMapMeta['BattleBGChange1N']) {
      mapInfo = dataMap;
      battleBgName = dataMapMeta['BattleBGChange1N'].split(',')[0];
      battleBg2 = 1;
    }
    if (dataMapMeta['BattleBGChange2N']) {
      mapInfo = dataMap;
      battleBgKey = dataMapMeta['BattleBGChange2N'].split(',')[0];
      battleBg2 = 1;
    }
  } else {
    if (dataMapMeta['BGchange']) {
      mapInfo = dataMap;
      bgKey = 'BGchange';
      battleBg1 = 1;
    }
    if (dataMapMeta['BattleBGChange1']) {
      mapInfo = dataMap;
      battleBgName = dataMapMeta['BattleBGChange1'].split(',')[0];
      battleBg2 = 1;
    }
    if (dataMapMeta['BattleBGChange2']) {
      mapInfo = dataMap;
      battleBgKey = dataMapMeta['BattleBGChange2'].split(',')[0];
      battleBg2 = 1;
    }
  }
  
  // Apply override background settings
  if (battleBg1) {
    setMapBgVariables(gameVariables, mapInfo, bgKey);
  }
  if (battleBg2) {
    gameMap.changeBattleback(battleBgName, battleBgKey);
  }
  
  // Set up parallax if defined
  if (gameVariables.value(508) !== 0 && dataMapMeta['ParallaxSet']) {
    const parallaxScrollX = gameVariables.value(81) !== 0;
    const parallaxScrollY = gameVariables.value(82) !== 0;
    gameMap.changeParallax(
      gameVariables.value(508),
      parallaxScrollX,
      parallaxScrollY,
      gameVariables.value(81),
      gameVariables.value(82)
    );
  }
};

setupMapBackgroundAudio = function(mapInfo, dataMap, gameVariables, gameSwitches) {
  // Set up BGS (background sound)
  const bgsKey = gameSwitches.value(15) ? 'BGSN' : 'BGS';
  let currentMapInfo = determineAudioMapInfoSource(mapInfo, dataMap, gameVariables, bgsKey);
  
  if (currentMapInfo.meta[bgsKey]) {
    const [bgsName, bgsVolume, bgsPitch, bgsPan] = currentMapInfo.meta[bgsKey].split(',');
    
    if (bgsName !== valueMapBGS[0]) {
      valueMapBGS = [bgsName, Number(bgsVolume), Number(bgsPitch), Number(bgsPan)];
      
      AudioManager.playBgs({
        name: valueMapBGS[0],
        volume: valueMapBGS[1],
        pitch: valueMapBGS[2],
        pan: valueMapBGS[3]
      });
    }
  } else {
    AudioManager.fadeOutBgs(1);
    valueMapBGS = [0, 0, 0, 0];
  }
  
  // Set up BGM (background music)
  const bgmKey = gameSwitches.value(15) ? 'BGMN' : 'BGM';
  currentMapInfo = determineAudioMapInfoSource(mapInfo, dataMap, gameVariables, bgmKey);
  
  if (currentMapInfo.meta[bgmKey]) {
    const [bgmName, bgmVolume, bgmPitch, bgmPan] = currentMapInfo.meta[bgmKey].split(',');
    valueMapBGM = [bgmName, Number(bgmVolume), Number(bgmPitch), Number(bgmPan)];
    
    parallaxesSound_switchChange(2);
    
    if (!gameSwitches.value(124)) {
      if (bgmName === 'NoMusic') {
        AudioManager.fadeOutBgm(10);
      } else if (AudioManager.saveBgm() !== bgmName) {
        AudioManager.playBgm({
          name: valueMapBGM[0],
          volume: valueMapBGM[1],
          pitch: valueMapBGM[2],
          pan: valueMapBGM[3]
        });
      }
    } else {
      AudioManager.fadeOutBgm(3);
    }
  } else {
    AudioManager.stopBgm();
  }
};

determineAudioMapInfoSource = function(mapInfo, dataMap, gameVariables, metaKey) {
  // Reset to base map info
  let currentMapInfo = mapInfo;
  
  // Check if battle map info should be used
  if (gameVariables.value(240) >= 1) {
    currentMapInfo = $dataItems[gameVariables.value(240)];
  }
  
  // Check if town map info should be used
  if (gameVariables.value(230) >= 1) {
    currentMapInfo = $dataWeapons[gameVariables.value(230)];
  }
  
  // If data map has the key, use that (highest priority)
  if (dataMap.meta[metaKey]) {
    currentMapInfo = dataMap;
  }
  
  return currentMapInfo;
};

// Helper function to set BG variables from meta
setMapBgVariables = function (gameVariables, mapInfo, bgKey) {
  if (mapInfo.meta[bgKey]) {
    const bgMeta = mapInfo.meta[bgKey].split(',');
    gameVariables.setValue(508, bgMeta[0]);
    gameVariables.setValue(81, Number(bgMeta[1]));
    gameVariables.setValue(82, Number(bgMeta[2]));
  }
}

//スイッチに応じて遠景と音楽設定スクリプト
parallaxesSound_switchChange = function(id1){

  if(id1 == 2){
    if($gameSwitches.value(233)){//結果を渡すためにverは付けない
      if(!$gameSwitches.value(15)){
        valueMapBGM = ['41_TownTemple',50,100,0];
      };
    };
    if($gameSwitches.value(237)){
      if(!$gameSwitches.value(15)){
        valueMapBGM = ['41_Guild',50,100,0];
      };
    };
  };
  if(id1 == 1){
    if($gameSwitches.value(233)){
        $gameVariables.setValue(508,'BG_Temple');
        $gameVariables.setValue(81,0);
        $gameVariables.setValue(82,0);
          if($gameSwitches.value(15)){
            $gameVariables.setValue(508,$gameVariables.value(508) + 'N');
          };
    };
    if($gameSwitches.value(234)){
        $gameVariables.setValue(508,'BG_Shop1Items');
        $gameVariables.setValue(81,0);
        $gameVariables.setValue(82,0);
          if($gameSwitches.value(15)){
            $gameVariables.setValue(508,$gameVariables.value(508) + 'N');
          };
    };
    if($gameSwitches.value(235)){
        $gameVariables.setValue(508,'BG_Shop3Weapons');
        $gameVariables.setValue(81,0);
        $gameVariables.setValue(82,0);
          if($gameSwitches.value(15)){
            $gameVariables.setValue(508,$gameVariables.value(508) + 'N');
          };
    };
    if($gameSwitches.value(237)){
        $gameVariables.setValue(508,'BG_Shop3Weapons');
        $gameVariables.setValue(81,0);
        $gameVariables.setValue(82,0);
          if($gameSwitches.value(15)){
            $gameVariables.setValue(508,$gameVariables.value(508) + 'N');
          };
    };
  };

};

//雑魚エネミー設定スクリプト
popEnemy_setUp = function(value){

  $gameVariables.setValue(220,[]);//そのダンジョンに出現するエネミーID
  $gameVariables.setValue(228,[]);//そのダンジョンに出現するエロエネミーID
  $gameVariables.setValue(242,[]);//そのダンジョンに出現するレアエネミーID
  $gameVariables.setValue(345,[[],[],[],[],[],[],[],[],[],[],[]]);
  var arr1 = [];
  var start = 1; 
  var end = 10; 
  for (var i = start; i <= end; i++) {
    if(value.meta['PopEnemy' + i]){
      var value2 = value.meta['PopEnemy' + i];
      const obj1 = $dataEnemies[Number(value2.split(',')[0])];
      //var obj1 = $dataEnemies[Number(value2.split(',')[0])];
      $dataEnemies[i+20] = Object.assign({}, obj1);
      var value3 = $dataEnemies[i+20];
      value3.name = value2.split(',')[1];
      value3.battlerName = value2.split(',')[2];
      Galv.CACHE.load('sv_enemies',value2.split(',')[2]);
      value3.battlerHue = Number(value2.split(',')[3]);
      value3.actions[0].skillId = Number(value2.split(',')[4]);
      value3.actions[1].skillId = Number(value2.split(',')[5]);
      value3.actions[2].skillId = Number(value2.split(',')[6]);
      value3.actions[3].skillId = Number(value2.split(',')[7]);
      var list = valueEnemyAddState;
      list.forEach(function(id) {
        if($dataStates[id].meta['NameCondiAddState']){
          var arr3 = $dataStates[id].meta['NameCondiAddState'].split(',');
          for (var j = 0; j <= arr3.length-1; j++) {
            if (value3.name.match(arr3[j])) {
              if($dataStates[id].meta['battlerHue1']){
                value3.battlerHue = Number($dataStates[id].meta['battlerHue1']);//ボス設定でも同様に実行
              };
              $gameVariables.value(345)[i].push(id);
         }}};
           if($dataStates[id].meta['GraphicNameCondiAddState']){
             var arr4 = $dataStates[id].meta['GraphicNameCondiAddState'].split(',');
               for (var j = 0; j <= arr4.length-1; j++) {
                 if (value3.battlerName.match(arr4[j])) {
                   $gameVariables.value(345)[i].push(id);
           }}};
      }, this);
      if(i == 9){
        $gameVariables.value(228).push(i+20);
      } else {
        if(i == 7 || i == 8){
          $gameVariables.value(242).push(i+20);
          $gameVariables.value(345)[i].push(480);//希少種指定
        } else {
          $gameVariables.value(220).push(i+20);
        };
      };
    }
  };
};

//簡易戦闘報酬設定スクリプト  
actor1_setup1 = function(value,id1){

var actor20 = $gameActors.actor(20);
actor20.addState(610);
let arr2 = [];
for (let j = 1; j <= 10; j++) {
  if(value.meta['PopEnemy' + j]){
    arr2.push(Number(value.meta['PopEnemy' + j].split(',')[0]));
  };
};
let enemyId = arr2[Math.floor(Math.random() * arr2.length)];
const arr1 = [];
if($dataEnemies[enemyId].meta['Passive State']){
  arr2 = $dataEnemies[enemyId].meta['Passive State'].split(',');
  for (let j1 = 0; j1 < arr2.length; j1++) {
    arr1.push(Number(arr2[j1]));
  };
};

if(arr1 != 0){
  for (let j = 0; j < arr1.length; j++) {
    actor20.addState(arr1[j]);
  };
};
const gameVar345 = $gameVariables.value(345);
if(gameVar345){
  const gameVar345_1 = gameVar345[1];
  for (let i = 0; i <= gameVar345_1.length-1; i++) {
    if (gameVar345_1[i] >= 1){
      actor20.addState(gameVar345_1[i]);
    };
  };
  const gameVar345_2 = gameVar345[2];
  for (let i = 0; i <= gameVar345_2.length-1; i++) {
    if (gameVar345_2[i] >= 1){
      actor20.addState(gameVar345_2[i]);
    };
  };
};
const gameVar350 = $gameVariables.value(350);
if(gameVar350){
  for (let i = 0; i < gameVar350.length; i++) {
    let stateId = gameVar350[i];
    if (stateId == 885){
      let stateIdMult = 11;
      if (id1 >= 30 && id1 <= 60) stateIdMult = 21;
      else if (id1 >= 61) stateIdMult = 31;

      stateId = Math.floor( Math.random() * stateIdMult) + 885;
      actor20.addState(stateId);
    } else {
      actor20.addState(stateId);
    };
  };
};
if(value.meta['EnemyElement']){
  const arr1 = value.meta['EnemyElement'].split(',');
  const stateId = Number(arr1[Math.floor(Math.random() * arr1.length)]);
  actor20.addState(stateId);
};
//console.log($gameActors.actor(20));

};

//ボス設定スクリプト  
boss_setup1 = function(id1,id2){

valueSpecialBossId = 0;
$gameSwitches.setValue(426,false);
var arr1 = 0;
$gameVariables.setValue(303,0);
$gameVariables.setValue(628,[0,0,0,0,0,0,0,0,0,0,0]);
$gameVariables.setValue(346,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
$gameVariables.setValue(347,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
//ボス行動は変数346に配列で設定する。
//特殊行動は347に2次配列
if(id1 == 1){
  value = $dataItems[$gameVariables.value(240)];
  valueBossEnemyId = $gameVariables.value(240);
};
if(id1 == 2){
  value = $dataEnemies[id2];
  $gameSwitches.setValue(426,true);
  valueBossEnemyId = id2;
};
if(value.meta['BossConfirmDrop']){
  var arr1 = value.meta['BossConfirmDrop'].split(',');
  for (var i = 0; i <= 9; i++) {
    $gameVariables.value(628)[i] = Number(arr1[i]);
  };
};
if(value.meta['BossEnemy']){
  var arr1 = value.meta['BossEnemy'].split(',');
};
if(arr1 != 0){
  if(id1 == 2){
    $gameVariables.setValue(303,id2);
  } else {
    $gameVariables.setValue(303,Number(arr1[0]));
  };
  const obj1 = $dataEnemies[$gameVariables.value(303)];
  $dataEnemies[valueBossEnemiesId] = Object.assign({}, obj1);
  var value3 = $dataEnemies[valueBossEnemiesId];
  value3.name = arr1[1];
  if(value.meta['Sideview Battler']){}else{
    value3.battlerName = String(arr1[2]);
  };
  value3.battlerHue = Number(arr1[3]);
  value3.actions[0].skillId = 900;
  value3.actions[1].skillId = 0;
  value3.actions[2].skillId = 0;
  value3.actions[3].skillId = 0;
  $gameVariables.value(346)[0] = Number(arr1[4]);//通常攻撃
  $gameVariables.value(346)[1] = Number(arr1[5]);//スキル
  $gameVariables.value(346)[2] = Number(arr1[6]);//必殺技
  $gameVariables.value(346)[3] = Number(arr1[7]);//ＯＤ必殺技
  if(value.meta['BossAddAttack']){
    var arr2 = value.meta['BossAddAttack'].split(',');
    $gameVariables.value(346)[4] = Number(arr2[0]);
    $gameVariables.value(346)[5] = Number(arr2[1]);
    $gameVariables.value(346)[6] = Number(arr2[2]);
  } else {
    $gameVariables.value(346)[4] = Number(arr1[4]);
    $gameVariables.value(346)[5] = Number(arr1[4]);
    $gameVariables.value(346)[6] = Number(arr1[4]);
  };
  if(value.meta['BossAddSkill']){
    var arr2 = value.meta['BossAddSkill'].split(',');
    $gameVariables.value(346)[7] = Number(arr2[0]);
    $gameVariables.value(346)[8] = Number(arr2[1]);
    $gameVariables.value(346)[9] = Number(arr2[2]);
  } else {
    $gameVariables.value(346)[7] = Number(arr1[5]);
    $gameVariables.value(346)[8] = Number(arr1[5]);
    $gameVariables.value(346)[9] = Number(arr1[5]);
  };
  var start = 1; 
  var end = 15; 
    for (var i = start; i <= end; i++) {
      if(value.meta['BossSpecialAction' + i]){
        $gameVariables.value(347)[i] = [0,0,0];
        var arr1 = value.meta['BossSpecialAction' + i].split(',');
        $gameVariables.value(347)[i][0] = Number(arr1[0]);
        $gameVariables.value(347)[i][1] = Number(arr1[1]);
        $gameVariables.value(347)[i][2] = Number(arr1[2]);
    }};
  $gameVariables.setValue(343,[]);//付与ステートリセット$dataItems[i+100].iconIndex
  var arr3 = [];
  var arr4 = [];
  for (var i = 0; i <= 9; i++) {
    if($gameVariables.value(346)[i] >= 1){
      arr3.push($gameVariables.value(346)[i]);
    };
  };
  for (var i = 1; i <= 15; i++) {
    if($gameVariables.value(347)[i][2] >= 1){
      arr4.push($gameVariables.value(347)[i][2]);
    };
  };
  var value1 = 0;
  if(id1 == 1){
    if($gameVariables.value(305)[$gameVariables.value(240)] >= 1){
      var value1 = 1;
      var arr3 = arr3.concat(arr4);
      arr4 = arr3.filter(function(val, i, array){
	return (array.indexOf(val) === i);
      });
    };
  };
  if(id1 == 2){
    if($gameVariables.value(304)[valueBossEnemyId] >= 1){
      var value1 = 1;
      var arr3 = arr3.concat(arr4);
      arr4 = arr3.filter(function(val, i, array){
	return (array.indexOf(val) === i);
      });
    };
  };
  if(value1 == 1){
    var arr5 = arr4;
  } else {
    var arr5 = arr3;
  };
  var value1 = 750;
  for (var i = 0; i <= arr5.length-1; i++) {
    $dataStates[value1 + i].iconIndex = $dataSkills[arr5[i]].iconIndex;
    $dataStates[value1 + i].name = `[行動]${$dataSkills[arr5[i]].name}`;
    $dataStates[value1 + i].description = $dataSkills[arr5[i]].description;
    $gameVariables.value(343).push(value1 + i);
  };
    //$gameVariables.setValue(343,$gameVariables.value(343).concat(arr3));
  if(value.meta['FrontBoss']){
    $dataSystem.optSideView = false;
  };
  var troopsId = 21;
  if(value.meta['BossTroop']){
    var arr2 = value.meta['BossTroop'].split(',');
    var troopsId = Number(arr2[0]);//グループIDを指定
    valueTroopId = troopsId;
    var value1 = $dataTroops[troopsId].members[0].y;
    var value2 = $dataTroops[troopsId].members[0].x;
    $dataTroops[troopsId].members = [];
    $dataTroops[troopsId].name = value3.name;
    var enemy = {enemyId:valueBossEnemiesId, x:value2, y:value1, hidden:false}; //追加するエネミーの設定(ID1、座標(100,100)、表示有)
    $dataTroops[troopsId].members.push(enemy); //設定したエネミーをグループに追加
    if(Number(arr2[1]) == 0){//前衛後衛の位置設定
      //$dataTroops[troopsId].members[0].x = 500;
    } else {
      $dataTroops[troopsId].members[0].x -= 150;
    };
    if(value.meta['Sideview Battler']){
      $dataTroops[troopsId].members[0].y -= 50;
    };
    if(value.meta['cloneShadow1']){//十天用
      var value1 = 57;
      const obj1 = $dataEnemies[Number(arr1[0])];
      $dataEnemies[value1] = Object.assign({}, obj1);
      var value6 = $dataEnemies[value1];
      value6.name = arr1[1];
      value6.battlerName = String(arr1[2]) + '[影]';
      value6.battlerHue = 190;
      value6.actions[0].skillId = Number(arr1[4]);//通常攻撃
      value6.actions[1].skillId = Number(arr1[5]);//スキル
      value6.actions[2].skillId = Number(arr1[6]);//必殺技
      value6.actions[3].skillId = Number(arr1[7]);//ＯＤ必殺技
      var arr3 = [50,100,150,200,-50,-100,-150];//前衛x
      var arr5 = [-50,0,50,100,150,200,250];//y
      for (var i = 1; i <= 7; i++) {
        var value2 = arr3[Math.floor(Math.random() * arr3.length)];
        var index = arr3.findIndex(arr3 => arr3 == value2); 
        if(index >= 0){
          arr3.splice(index, 1);
        };
        var value4 = arr5[Math.floor(Math.random() * arr5.length)];
        var index = arr5.findIndex(arr5 => arr5 == value4); 
        if(index >= 0){
          arr5.splice(index, 1);
        };
        var value5 = true;
        var enemy = {enemyId:value1, x:value2, y:value4, hidden:value5}; //追加するエネミーの設定(ID1、座標(100,100)、表示有)
        $dataTroops[troopsId].members.push(enemy); //設定したエネミーをグループに追加
      };
    };
    var arr3 = [400,380,360,340,320,300,280];//前衛x
    var arr4 = [150,140,130,120,110,100,90,70];//後衛x
    var arr5 = [200,220,250,400,450,470,500];//y
    for (var i = 1; i <= 7; i++) {//<EnemyEntourage1:21,0,0>21-27,0前衛1後衛,0表示1非表示
      if(value.meta['EnemyEntourage' + i]){
        var arr2 = value.meta['EnemyEntourage' + i].split(',');
        var value1 =  Number(arr2[0]);
        if(Number(arr2[1]) == 0){
          var value2 = arr3[Math.floor(Math.random() * arr3.length)];
          var index = arr3.findIndex(arr3 => arr3 == value2); 
          if(index >= 0){arr3.splice(index, 1)};
        };
        if(Number(arr2[1]) == 1){
          var value2 = arr4[Math.floor(Math.random() * arr4.length)];
          var index = arr4.findIndex(arr4 => arr4 == value2); 
          if(index >= 0){arr4.splice(index, 1)};
        };
        var value4 = arr5[Math.floor(Math.random() * arr5.length)];
        var index = arr5.findIndex(arr5 => arr5 == value4); 
        if(index >= 0){arr5.splice(index, 1)};
        if(Number(arr2[2]) == 1){var value5 = true }else{var value5 = false};
        var enemy = {enemyId:value1, x:value2, y:value4, hidden:value5}; //追加するエネミーの設定(ID1、座標(100,100)、表示有)
        $dataTroops[troopsId].members.push(enemy); //設定したエネミーをグループに追加
      };
    };
  };
};
var arr1 = value.meta['BossStateInformation'].split(',');//
    for (var i = 0; i <= arr1.length-1; i++) {
    if(Number(arr1[i]) >= 1){
      if($dataStates[Number(arr1[i])].meta['valueBossBgm']){
        var arr2 = $dataStates[Number(arr1[i])].meta['valueBossBgm'].split(',');
        $gameVariables.setValue(337,[arr2[0],Number(arr2[1]),Number(arr2[2]),Number(arr2[3])]);
      };
      $gameVariables.value(343).push(Number(arr1[i]));
    };
  };
var list = valueEnemyAddState;
list.forEach(function(id) {
  if($dataStates[id].meta['NameCondiAddState']){
    var arr3 = $dataStates[id].meta['NameCondiAddState'].split(',');
      for (var j = 0; j <= arr3.length-1; j++) {
        if (value3.name.match(arr3[j])) {
          if($dataStates[id].meta['battlerHue1']){
            value3.battlerHue = Number($dataStates[id].meta['battlerHue1']);
          };
          $gameVariables.value(343).push(id);
        };
  }};
  if($dataStates[id].meta['GraphicNameCondiAddState']){
    var arr4 = $dataStates[id].meta['GraphicNameCondiAddState'].split(',');
      for (var j = 0; j <= arr4.length-1; j++) {
        if (value3.battlerName.match(arr4[j])) {
          $gameVariables.value(343).push(id);
        };
  }};
}, this);

};

//戦闘グループでボスステ付与
troop_bossState = function(){

if($gameSwitches.value(211)){
  var enemy = $gameTroop.members()[0];
  enemy.addState(410);
  //エネミー隊列変更
  var start = 0; var end = $gameTroop.members().length-1;
  for (var i = start; i <= end; i++) {
    var troopId = $gameVariables.value(229);
    var value1 =  $gameTroop.getX(i+1);
    if(value1 <= 200){
      $gameTroop.members()[i].setRow(2);
    };
  };
  //獲得戦果
  if(enemy.isStateAffected(410)){//ボスステートで戦果
    var value12 = 10;
    var value11 = Math.floor( Math.random() * 10) + 1;
    if(enemy.isStateAffected(411)){value11 += Math.floor( Math.random() * 10) + 1};
    if(enemy.isStateAffected(412)){value11 += Math.floor( Math.random() * 20) + 10};
    if(enemy.isStateAffected(413)){value11 += Math.floor( Math.random() * 30) + 20};
    if(enemy.isStateAffected(414)){value11 += Math.floor( Math.random() * 100) + 1};
    for (var j = 0; j <= value11; j++) {
      $gameTroop.addDropItem($dataItems[value12]);
    };
  };
};

};

//代入して全般ヒントとして作成
hint1_zenpan = function(id1){

var value1 = `　\n`;
if(id1 == 102){value1 = `未発生挿話\n`}
else if(id1 == 103){value1 = `未発生シーン\n`}
else if(id1 == 104){value1 = `未回収タイトル\n`}
else if(id1 == 105){value1 = `未回収Ｈタイトル\n`}
else if(id1 == 108){value1 = `未発生クエスト\n`};
eval("valueWordSet" + valueCountSet2 + " = value1");

valueCountSet1 = 0;
valueCountSet2 = 1;
const max = $dataItems.length - 1;
for (var i = 1; i < max; i++) {
  const item = $dataItems[i];
  if(item.meta['EICSwitch']){
    if(Number(item.meta['EICSwitch']) == id1 && !$gameParty.hasItem(item)){
      var value0 = `\\C[2]${item.name}\\C[0]\n${item.description}\n`;
      eval("valueWordSet" + valueCountSet2 +" += value0");
      valueCountSet1 += 1;
        if((valueCountSet1 %6) == 0){
          valueCountSet2 += 1;
          eval("valueWordSet" + valueCountSet2 +" = value1");
        };
    };
  };
};

};

//怒りのツッコミ演出
ensyutu_ikari = function(id,id2){

var value1 = Math.floor( Math.random() * 3) + 6;
$gameScreen.startShake(value1, value1, id);
var value2 = Math.floor(Math.random() * 41) + 80;
AudioManager.playSe({"name":id2,"volume":90,"pitch":value2,"pan":0});
var arr1 = [255,255,255];
if (id2 == 'Explosion2') { var arr1 = [255, 50, 50] };
var value3 = Math.floor(Math.random() * 41) + 150;
$gameScreen.startFlash([arr1[0],arr1[1],arr1[2],value3], id);

};

//オブジェクト探知とトラップ視認実行
search_object = function(){

  const max = $gameMap.events().length >= 50 ? 200 : 100;
  for (var id = max; id > 0; id--) {
    const event = $gameMap.event(id);
    if (!!event) {
      //if(!$gameSelfSwitches.value([$gameMap.mapId(), event, 'B'])){
      if (!$gameSelfSwitches.value([$gameMap.mapId(), id, 'B'])) {
        if (event.event().meta['IconDisplay']) {
          var target = event;
          if ($gameSwitches.value(79)) {
            target.setIconOnEvent(Number(event.event().meta['IconDisplay']));
          } else {
            target.clearIconOnEvent();
          }
        };
        if (event.event().meta['TrapDisplay']) {
          var target = event;
          if ($gameSwitches.value(135)) {
            target.setIconOnEvent(Number(event.event().meta['TrapDisplay']));
          } else {
            target.clearIconOnEvent();
          }
        };
      }
    };
  };
};

//タイトル入手
item_titleget = function(id1,id2){

var arr2 = [16,0,0];//会心回数
var arr3 = [2,0,0];//最大与えダメージ
var arr4 = [5,0,0];//最大受けダメージ
var arr5 = [7,0,0];//戦闘不能回数

  for (var i = $gameVariables.value(75); i <= $gameVariables.value(76); i++) {
    var actor = $gameActors.actor(i);
      if($gameVariables.value(380 + actor.actorId())[68] > arr2[2]){//会心回数
        var arr2 = [16,actor.actorId(),$gameVariables.value(380 + actor.actorId())[68]];
      };    
      if(actor.attackDamageMax > arr3[2]){
        var arr3 = [2,actor.actorId(),actor.attackDamageMax];
      };
      if(actor.acceptDamageMax > arr4[2]){
        var arr4 = [5,actor.actorId(),actor.acceptDamageMax];
      };
      if(actor.deadCounter > arr5[2]){
        var arr5 = [7,actor.actorId(),actor.deadCounter];
      };
      var arr6 = [8,9,10,11,12,13,14];//獲得実績自己設定ID
      var arr7 = [2,5,6,7,8,12,13];//スキルタイプid
      var arr8 = [0,0,0,0,0,0,0];//アクターID
      var arr9 = [0,0,0,0,0,0,0];//累計回数。
      var arr10 = [0,0,0,0,0,0,0];//累計トップ
    for (var j = 1; j <= $dataSkills.length - 1; j++) {
      const skill = $dataSkills[j];
      for (var value1 = 0; value1 <= arr6.length-1; value1++) {
          if (!skill.name == '') {
            if (skill.stypeId == arr7[value1]){
              arr9[value1] += actor.getSkillUseCounter(j);
          }};
      }};
      for (var j = 0; j <= arr6.length-1; j++) {
        if(arr9[j] > arr10[j]){
          arr10[j] = arr9[j];
          arr8 = actor.actorId();
      }};
  };

  var actor = $gameActors;
  var arr11 = [1,0,actor.getAllKillEnemyCounter()];
  var arr12 = [3,0,actor.attackDamageSum];
  var arr13 = [6,0,actor.acceptDamageSum];
  var arr14 = [15,0,actor.deadCounter];

  var arr15 = [4,0,0];//全員のオーバーキル回数
  for (var i = $gameVariables.value(75); i <= $gameVariables.value(76); i++) {
    arr15[2] += $gameVariables.value(380 + i)[67];
  };

for (var i = 1; i <= $dataItems.length-1; i++) {
  const item = $dataItems[i];
if(item.meta['EICSwitch']){
if(Number(item.meta['EICSwitch']) == 104 || Number(item.meta['EICSwitch']) == 105){
  if (!item.name == '' && !$gameParty.hasItem(item)) {
    var value1 = 2;//スイッチID。最初にtrueにして成立しない場合は途中でfalse
    var value2 = 2;//変数id若しくは$gameVariables.value(380 + $gameVariables.value(2))の主人公Ｈ配列id
    var value3 = 0;//value2の値.
    var value4 = true;//
    //var value5 = 0;//汎用。必要な時に0から始める
    var value6 = 0;//個人記録のＭＶＰアクター
    if(item.meta['annihilationTitle']){
      value1 = 1;
    };
    if(item.meta['titleGetSwitch']){
      value1 = Number(item.meta['titleGetSwitch']);
      //var value4 = $gameSwitches.value(value1);
    };
    if(item.meta['titleGetVariable']){
      const arr = item.meta['titleGetVariable'].split(',');
      value2 = Number(arr[0]);
      value3 = Number(arr[1]);
      value4 = $gameVariables.value(value2) >= value3;
    };
    if (item.meta['titleGetArray']) {
      const arr = item.meta['titleGetArray'].split(',');
      value2 = Number(arr[0]);
      value3 = Number(arr[2]);
      value4 = $gameVariables.value(value2)[Number(item.meta['titleGetArray'].split(',')[1])] >= value3;
    };
    if (item.meta['titleGetItems']) {
      const arr = item.meta['titleGetItems'].split(',');
      value2 = Number(arr[0]);
      value3 = Number(arr[1]);
      value4 = $gameParty.numItems($dataItems[value2]) >= value3;
    };
    if (item.meta['HtitleGetArray']) {//主人公のみ
      const arr = item.meta['HtitleGetArray'].split(',');
      value2 = Number(arr[0]);
      value3 = Number(arr[1]);
      value4 = $gameVariables.value(380 + $gameVariables.value(2) )[value2] >= value3;      
    };
    if (item.meta['titleGetSkillRank']) {
      const arr = item.meta['titleGetSkillRank'].split(',');
      for (var j = 0; j <= $gameParty.members().length-1; j++) {
        const actor = $gameParty.members()[j];
        value2 = Number(arr[0]);
        value3 = Number(arr[1]);
        value4 = actor.skillMasteryLevel(value2) >= value3;
        if(value4){
          value6 = j;
          break;
        };
      };
    };
    if(item.meta['titleGetAchievement']){
      var value1 = 1;//獲得実績メタがある場合は、最初に条件をfalseにする。
      var arr1 = item.meta['titleGetAchievement'].split(',');
      //全員の場合
      if(arr1[0] == arr11[0] && arr1[1] <= arr11[2]){value1 = 2};
      if(arr1[0] == arr12[0] && arr1[1] <= arr12[2]){value1 = 2};
      if(arr1[0] == arr13[0] && arr1[1] <= arr13[2]){value1 = 2};
      if(arr1[0] == arr14[0] && arr1[1] <= arr14[2]){value1 = 2};
      if(arr1[0] == arr15[0] && arr1[1] <= arr15[2]){value1 = 2};
      //パーティの中で一番高い
      if(arr1[0] == arr2[0] && arr1[1] <= arr2[2]){value1 = 2; value6 = arr2[1]};
      if(arr1[0] == arr3[0] && arr1[1] <= arr3[2]){value1 = 2; value6 = arr3[1]};
      if(arr1[0] == arr4[0] && arr1[1] <= arr4[2]){ value1 = 2; value6 = arr4[1]};
      if(arr1[0] == arr5[0] && arr1[1] <= arr5[2]){ value1 = 2; value6 = arr5[1]};
      //スキルタイプ毎の個人使用回数
      const max = arr6.length;
      for (var j = 0; j < max; j++) {
        if(arr1[0] == arr6[j] && arr1[1] <= arr10[j]){ value1 = 2; value6 = arr8[j]};
      };
    };
    if($gameSwitches.value(value1) && value4){
      $gameVariables.setValue(19,i);
      if(item.meta['titleSenkaGet']){
        if(!$gameSwitches.value(29)){
          $gameParty.gainItem($dataItems[10], Number(item.meta['titleSenkaGet']));//アイテムID10は戦貨
        };
        const titleName = `\x1bIIN[10]${Number(item.meta['titleSenkaGet'])}`;
        valueWordSetEx = `${titleName}枚獲得！`;
      };
      if(value6 >= 1){
        if(!$gameSwitches.value(29)){
          $gameVariables.value(297)[i] = value6;
          const actorName = `\\C[2]${$gameActors.actor($gameVariables.value(297)[i]).name()}\\C[0]]`;
          valueWordSetEx = `\n[達成者:${actorName}`;
        };
      };
      break;
    };
}}}};

};

//戦闘マップ殲滅回数による称号獲得
title_battleMapannihilation = function(){

const gameVar257 = $gameVariables.value(257);
for (var i = 1; i <= $dataItems.length-1; i++) {
  const item = $dataItems[i];
  if(item.meta['annihilationTitle']){
    if(!$gameParty.hasItem(item,true)){
      var arr1 = item.meta['annihilationTitle'].split(',');
      if(Number(arr1[0]) >= 20){
        if(gameVar257[Number(arr1[0])] >= 1){
          $gameVariables.setValue(19,i);
        };
      };
      if(Number(arr1[0]) == 1){
        var value1 = 0;
        for (var j = 1; j <= 100; j++) {
          value1 += gameVar257[j];
        };
        if(value1 >= Number(arr1[1])){
          $gameVariables.setValue(19,i);
        };
      };
      if(Number(arr1[0]) == 2){
        var value1 = 0;
        for (var j = 1; j <= 100; j++) {
          const itemJ = $dataItems[j];
          if (itemJ.meta['OnSwitch']){
            var arr2 = itemJ.meta['OnSwitch'].split(',');
            for (var id1 = 1; id1 <= arr2.length-1; id1++) {
              if(Number(arr2[id1]) == 207){
                value1 += gameVar257[j];
                break;
              };
            };
          };
        };
        if(value1 >= Number(arr1[1])){
          $gameVariables.setValue(19,i);
          $gameParty.gainItem(item, 1);
        };
      };
    };
  };
};
if($gameParty.hasItem($dataItems[$gameVariables.value(19)],true)){
$gameVariables.setValue(19,0);
};

};

//曜日変更と日数経過時の処理
weeks_toggleOther = function(){

let start = $gameVariables.value(73);
let end = $gameVariables.value(74);
for(var i = start; i <= end; i++){$gameVariables.value(i+380)[46] = 0};//直前のＨＣＧ
const list = valueOneDayLimitItem;
list.forEach(function(id) {
  if($dataItems[id].meta.SkillCostToday){
    $gameParty.gainItem($dataItems[id], 1);
  };
}, this);
$gameVariables.setValue(58,$gameVariables.value(58) + 1);//経過日数
if($gameParty.loseGoldSum > $gameVariables.value(341)){
  const goldCalc = $gameParty.loseGoldSum - $gameVariables.value(341);
  const gold = `\\C[2]${goldCalc.toLocaleString()}\\C[0]\n`;
  $gameVariables.setValue(539, $gameVariables.value(539) + `本日消費\\G:${gold}\n`);
  $gameVariables.setValue(540,$gameVariables.value(540) + 1);
};
if($gameParty.gainGoldSum > $gameVariables.value(342)){
  const goldCalc = $gameParty.gainGoldSum - $gameVariables.value(342);
  const gold = `\\C[2]${goldCalc.toLocaleString()}\\C[0]\n`;
  $gameVariables.setValue(539, $gameVariables.value(539) + `本日獲得\\G:${gold}\n`);
  $gameVariables.setValue(540,$gameVariables.value(540) + 1);
};
$gameVariables.setValue(341,$gameParty.loseGoldSum.toLocaleString());//一日の消費金額
$gameVariables.setValue(342,$gameParty.gainGoldSum.toLocaleString());//一日の獲得金額
let value2 = 0;
start = $gameVariables.value(75);
end = $gameVariables.value(76);
for(var i = start; i <= end; i++){
  actor = $gameActors.actor(i);
  if(actor.currentExp() > $gameVariables.value(i+380)[65]){
    const expCalc = actor.currentExp() - $gameVariables.value(i+380)[65];
    const exp = `\\C[2]${expCalc.toLocaleString()}\\C[0]　`
    $gameVariables.setValue(539, $gameVariables.value(539) + `${actor.name()}本日獲得経験値:${exp}`);
    value2 += 1;
    if((value2 %2) == 0){
      $gameVariables.setValue(539,$gameVariables.value(539) + `\n`);
      $gameVariables.setValue(540,$gameVariables.value(540) + 1);
    };
  };
  $gameVariables.value(i+380)[65] = actor.currentExp();
};
if(value2 == 1 || value2 == 3 || value2 == 5 || value2 == 7){
  $gameVariables.setValue(539,$gameVariables.value(539) + `\n`);
  $gameVariables.setValue(540,$gameVariables.value(540) + 1);
};
for(var i = 16; i <= 17; i++){$gameSwitches.setValue(i,false)};
for(var i = 6; i <= 12; i++){$gameSwitches.setValue(i,false)};

var daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];
var currentDay = $gameVariables.value(55);

const maxDaysInWeek = daysOfWeek.length;
for (let i = 0; i < maxDaysInWeek; i++) {
  if (currentDay === daysOfWeek[i]) {
    const nextDay = daysOfWeek[(i + 1) % maxDaysInWeek]; // will be 0 (日) when will reach max (土) day
    $gameVariables.setValue(55, nextDay);
    $gameSwitches.setValue(i + 6, true);
    $gameSwitches.setValue(i < 5 ? 17 : 16, true); // 16 for last 2 days (休日) and 17 for 1st 5 (平日)
    break;
  }
}

};

//ガチャスクリプト
item_gacha = function(){

//内容のほうで開始時点ではレアリティを8に制限
gacha_naiyou(3,0);
if(valueGachaId >= 1){
  $gameParty.gainItem(valueItems[valueGachaId], 1);
  var value4 = Number(valueItems[valueGachaId].meta['LotteryRearity']);
  if($gameVariables.value(23) < value4){
    $gameVariables.setValue(23,value4);
  };
  if(value4 == 1){var value5 = `\\C[0]<Rarity:\\I[473]>\\C[0]`};
  if(value4 == 2){var value5 = `\\C[2]<Rarity:\\I[473]>\\C[0]`};
  if(value4 == 3){var value5 = `\\C[22]<Rarity:\\I[473]>\\C[0]`};
  if(value4 == 4){var value5 = `\\C[21]<Rarity:\\I[473]>\\C[0]`};
  if(value4 == 5){var value5 = `\\C[29]<Rarity:\\I[473]>\\C[0]`};
  if(value4 == 6){var value5 = `\\C[28]<Rarity:\\I[474]>\\C[0]`};
  if(value4 == 7){var value5 = `\\C[24]<Rarity:\\I[475]>\\C[0]`};
  if(value4 == 8){var value5 = `\\C[26]<Rarity:\\I[476]>\\C[0]`};
  if(value4 == 9){var value5 = `\\C[14]<Rarity:\\I[477]>\\C[0]`};
  if(value4 == 10){var value5 = `\\C[17]<Rarity:\\I[478]>\\C[0]`};
  if(valueItems == $dataItems){var value3 = `${value5}\\C[16]\\iin[${valueGachaId}]\\C[0]が排出されました！`};
  if(valueItems == $dataWeapons){var value3 = `${value5}\\C[16]\\win[${valueGachaId}]\\C[0]が排出されました！`};
  if(valueItems == $dataArmors){var value3 = `${value5}\\C[16]\\ain[${valueGachaId}]\\C[0]が排出されました！`};
  if($gameSwitches.value(380)){
    $gameVariables.setValue(21,$gameVariables.value(21) + 1);
    $gameVariables.setValue(22,$gameVariables.value(22) + `${value3}\n`);
  } else {
    $gameVariables.setValue(22,value3);
  };
};

};

//アイテム武器防具抽選スクリプト。id12アイテム1武器2防具3all
//id13がall。10まで。value1としてid決定
gacha_naiyou = function(valueItemsType,id13){

if (valueItemsType && valueItemsType > -1 && valueItemsType < 3) {
  valueItems = get_valueItems_iwa(valueItemsType);
}
else {
  const valueItemsTypeRnd = Math.floor(Math.random() * 11);
  valueItems = get_valueItems_iwa(valueItemsTypeRnd > 1 ? 2 : valueItemsTypeRnd);
}

let value7 = id13;
if(id13 < 1) {
  let arr = [1,2,3,4,5,6,7,8,9,10];
    for (let i = 1; i <= 50; i++) {
      arr.push(1);
      if (i > 45) continue;

      if(i <= 45){arr.push(2)};
      if(i <= 40){arr.push(3)};
      if(i <= 35){arr.push(4)};
      if(i <= 30){arr.push(5)};
      if(i <= 9){arr.push(6)};
      if(i <= 7){arr.push(7)};
      if(i <= 5){arr.push(8)};
      if(i <= 3){arr.push(9)};
    }
    value7 = arr[Math.floor(Math.random() * arr.length)];
    //ガチャ称号取得でＵＲ，ＬＲ解放
    if(!$gameParty.hasItem($dataItems[657],true) && value7 >= 9){
      value7 = 8;
    };
    if(!$gameParty.hasItem($dataItems[656],true) && value7 >= 8){
      value7 = 7;
    };
};
if($gameParty.inBattle()){
  var value1 = 71;//仮指定。ポーションのみ
} else {
  let array = [0];
  const end = valueItems.length;
  for (let i = 1; i < end; i++) {
      const valueItem = valueItems[i];
      if (!valueItem) continue;	  
	  
      if (valueItem.meta['GatchaOutOfRange']) continue;
      if ($gameParty.hasItem(valueItem)) {
        const maxItem = valueItem.meta['Max Item'];
        if (maxItem && Number(maxItem) == 1) continue;
      }
      else if (valueItem.meta['GatchaHasRange']) continue;

      const lotteryRearity = valueItem.meta['LotteryRearity'];
      if (!lotteryRearity) continue;
      if (Number(lotteryRearity) !== value7) continue;

      array.push(i);
    };
  var value1 = array[Math.floor(Math.random() * array.length)];
  if(value1 == 0){ //レアリティ1でmax1アイテムを作らない。
    array = [];
    value7 = 1;
      for (let i = 1; i <= end; i++) {
        const valueItem = valueItems[i];
        if (valueItem.meta['GatchaOutOfRange']) continue;
        if (valueItem.meta['GatchaHasRange'] 
        && !$gameParty.hasItem(valueItem)) continue;

        const lotteryRearity = valueItem.meta['LotteryRearity'];
        if (!lotteryRearity) continue;
        if (Number(lotteryRearity) !== value7) continue;

        array.push(i);
      };
    valueGachaId = array[Math.floor(Math.random() * array.length)];
  } else {
    valueGachaId = value1;
  };
};

};

//レアリティ一覧作成
item_gachaitiran1 = function(id2){

let choiceIndex = 1;
let value14 = 1;

const info = $gameVariables.value(801)
for (var j = 0; j <= 2; j++) {

  valueItems = j == 0 ? $dataItems : j == 1 ? $dataWeapons : $dataArmors; // 2=armors
  const start = 1;
  const end = valueItems.length;
    for (var i = start; i < end; i++) {
      let value11 = 0;
      const valueItem = valueItems[i];
      if (!valueItem) continue;
      if(!valueItem.meta['LotteryRearity']) continue;

      if (Number(valueItem.meta['LotteryRearity']) !== id2) continue;

      if (valueItem.meta['Max Item']) {
        if (Number(valueItem.meta['Max Item']) == 1 && $gameParty.hasItem(valueItem)) {
          value11 = 1;
        }
      };
      if (valueItem.meta['GatchaHasRange']) {
        if (!$gameParty.hasItem(valueItem)) {
          value11 = 1;
        }
      };
      if (valueItem.meta['GatchaOutOfRange']) {
        value11 = 1;
      };
      if (value11 !== 0) continue;

      const descriptionText = `${valueItem.description}`;
      item_priceinfo(j, i);
      const id = 1;
      const itemName = `\x1bI[${valueItem.iconIndex}]${valueItem.name}`;
      const choiceParams = {
        text: `${itemName}`,
        value: choiceIndex
      };
      $gameSystem.addCustomChoice(id, choiceParams);
      $gameScreen.setDTextPicture(descriptionText, 28);
      $gameScreen.dWindowFrame = 'ON';
      $gameScreen.showPicture(value14 + 100, '', 0, 20, 10, 100, 100, 0, 0);
      $gameMessage.setSelectPictureId(choiceIndex, value14 + 100);
      const message = `　　　　　　\\C[14]──詳細情報──\\C[0]　　　　　　　　\n${info}`;
      $gameScreen.setDTextPicture(message, 28);
      $gameScreen.dWindowFrame = 'ON';
      $gameScreen.showPicture(value14 + 100 + 1, '', 0, 640, 110, 100, 100, 0, 0);
      $gameMessage.setSelectPictureId(choiceIndex, value14 + 100 + 1);
      choiceIndex += 1;
      value14 += 2;
    }
};

};

//ダンジョンランダム宝箱中身処理
danjon_treasure = function(){

var arr3 = $gameVariables.value(215)[$gameVariables.value(240)];
var arr4 = $gameVariables.value(216)[$gameVariables.value(240)];
if(arr3 != 0){
  var value2 = arr3[Math.floor(Math.random() * arr3.length)];
  let index = arr3.findIndex(arr3 => arr3 == value2);
  var valueItems = get_valueItems_iwa(arr4[index]);
  if($dataItems[$gameVariables.value(240)].meta['TchestRere']){
    if( value2 == Number($dataItems[$gameVariables.value(240)].meta['TchestRere']) ){
      $gameSwitches.setValue(439,true);
  }};
  $gameParty.gainItem(valueItems[value2], 1);
  var value1 = `\\C[24]\x1bI[${valueItems[value2].iconIndex}]${valueItems[value2].name}\\C[0]を入手した！`;
  if(!$gameSwitches.value(440)){
    if(index >= 0){
      arr3.splice(index, 1);
      arr4.splice(index, 1);
    };
  };
} else {
  var value1 = `宝箱の中身は空だった…。`;
  $gameSwitches.setValue(380,true);
};
if($gameSwitches.value(439)){
  var value2 = 28;
  $gameScreen.setDTextPicture(value1, value2);
} else {
  CommonPopupManager.showInfo({},value1,null);
};

};

//アクター選択肢準備
actor_choicePre1 = function(){

var id2 = 0;
var id3 = 101;
var start = 0;
var end = $gameParty.members().length-1;
for (var i = start; i <= end; i++) {
  if(i >= 1){id2 += 1};
  $gameVariables.setValue(20,$gameParty.members()[i].actorId());
  var actor = $gameActors.actor($gameVariables.value(20));
  var id4 = $gameParty.members()[i].actorId();
  const id = 1; 
  const choiceParams = {text: actor.name(),value: id4};
  $gameSystem.addCustomChoice(id, choiceParams);
  if(is_girl(actor)){
    valueFaceSelect = 6;
    var value1 = Math.floor( Math.random() * 8);
    if(value1 == 0){valueFaceSelect = 1};//通常
    if(value1 == 1){valueFaceSelect = 2};//笑顔
    if(value1 == 2){valueFaceSelect = 5};//真顔
    if(value1 == 3){valueFaceSelect = 15};//目を瞑る
    if(actor.isLearnedSkill(66)){
      if(value1 == 4){valueFaceSelect = 40};//頬染め
      if(value1 == 5){valueFaceSelect = 39};//頬染めウィンク
      if(value1 == 6){valueFaceSelect = 38};//頬染め挑発的
      if(value1 == 7){valueFaceSelect = 41};//頬染め目にハート
    };
    battle_bustUp(id3,0,0,10);
    for (var j = 0; j <= 7; j++) {
      if($gameScreen.picture(id3+j)){
        $gameMessage.setSelectPictureId(id2, id3+j);
      };
    };
} else {
//$gameScreen.showPicture(id3,$gameVariables.value(20)+"Actor1_s0",0,0,0,100,100,0,0);
//$gameMessage.setSelectPictureId(id2, id3);
};
id3 += 10;
};

};

//エネミーのデータベースパラメータ設定
enemy_dataBaseSettei = function(){

var start = 31;
var end =   300;
for (var i = start; i <= end; i++) {
  if($dataEnemies[i].meta['BaseStates']){
    var arr1 = $dataEnemies[i].meta['BaseStates'].split(',');
    var value1 = Number(arr1[0]);
    //var arr2 = [value1-5,value1-4,value1-3,value1-2,value1-2,value1,value1+1,value1+2,value1+3,value1+4,value1+5];
    var arr2 = [value1-10,value1-5,value1,value1+5,value1+10];
    var value2 = arr2[Math.floor(Math.random() * arr2.length)];
    $dataEnemies[i].params[0] = value2;
    for (var j = 1; j <= 7; j++) {
      var value3 = Number(arr1[1]);
      var value4 = Math.floor( Math.random() * 5) + (value3 - 3);
      //var value4 = value3;//Math.floor( Math.random() * 5) + (value3 - 3);
      $dataEnemies[i].params[j] = value4;
    };
    $dataEnemies[i].exp = Math.round(value2 / 10);
    var value5 = Math.floor( Math.random() * 4) + 8;
    $dataEnemies[i].gold = Math.round(value2 / value5);
  }; 
};

};

//メニュー画面で付与ステートの解説分表示
state_menuDisprayDescription = function(){

valueCountSet1 = 0;
valueCountSet2 = 1;
var value3 = `付与ステート一覧\n`;
eval("valueWordSet" + valueCountSet2 +" = value3");
var value1 = 1;
var value2 = 0;
var start = 1;
var end = $dataStates.length-1;
for (var i = start; i <= end; i++) {
  if($gameParty.membersState(i) && $dataStates[i].iconIndex >= 1 && !$dataStates[i].name == '' && !$dataStates[i].description == ''){
    for (var id1 = 0; id1 <= $gameParty.members().length-1; id1++) {
      if($gameParty.members()[id1].isStateAffected(i)){
        var actor = $gameParty.members()[id1];
        var value0 = `\\C[16][${actor.name()}]\\C[0]`;
        eval("valueWordSet" + valueCountSet2 +" += value0");
      };
    };
      var value0 = `\n${$dataStates[i].description}\n`;
      eval("valueWordSet" + valueCountSet2 +" += value0");
      valueCountSet1 += 1;
        if((valueCountSet1 %6) == 0){
          valueCountSet2 += 1;
          eval("valueWordSet" + valueCountSet2 +" = value3");
        };
  };
};

};

//キャラ初期セットアップ。ＬＶリセットにも実行。この後レアリティコモン実行。
actor_StartSetUp = function(i){

var actor = $gameActors.actor(i);
//主人公にタイトルセットと存在フラグとレベルフラグと視点変更スキル
if(i == $gameVariables.value(2)){
//actor.learnSkill(23);//タイトルセット。不要
//actor.learnSkill(24);//性欲度関連に合わせて習得させる。性欲度ランク1で習得
//actor.learnSkill(42);//視点変更
  actor.learnSkill(407);
  actor.learnSkill(18);
};
//デバッグ時に全員に存在フラグとレベルフラグ
//if($gameSwitches.value(53)){
//actor.learnSkill(407);
//actor.learnSkill(18);
//};
//初期装備とスキル付与
if($dataActors[i].meta['JoinEquipWeapons']){
  var value1 = Number($dataActors[i].meta['JoinEquipWeapons']);
  $gameParty.gainItem($dataWeapons[value1], 1, false);
  actor.changeEquipById(1, value1);
};
  var list = [1,2,3,4,5,6,7,8,9];
  list.forEach(function(id) {
    if($dataActors[i].meta['JoinEquipArmors'+id]){
      var value1 = Number($dataActors[i].meta['JoinEquipArmors'+id]);
      $gameParty.gainItem($dataArmors[value1], 1, false);
      actor.changeEquipById(3, value1);
    };
  }, this);
if($dataActors[i].meta['JoinSkillLearn']){
  var arr1 = $dataActors[i].meta['JoinSkillLearn'].split(',');
    for (var j = 0; j <= arr1.length-1; j++) {
      $gameActors.actor(i).learnSkill(Number(arr1[j]));
    };
};
//初期レアリティ設定。スキルとしてはJoinSkillLearnで付与
  reality_setUp(i);
//主人公確定
  var value1 = $dataActors[i].meta['Mcharacter'];
  if (value1) {
    actor.addState(601);
  }else{
    actor.removeState(601);
  };
//主人公と女・男用ステート↓
  var value1 = $dataActors[i].meta['Heroine'];
  if (value1) {
    actor.addState(602);
  }else{
    actor.addState(603);
  };
//立ち絵変更あり男に全裸スキル
  var value1 = $dataActors[i].meta['MultipleTachie'];
  if (value1) {
    actor.learnSkill(45);
  };
//全員に通常攻撃十種基本スキル付与。
  var list = [101,111,121,131,141,151,161,171,181,191];
  list.forEach(function(id) {
    actor.learnSkill(id);
  }, this);
//初期JP  
  actor.gainJp(100);
//苗字代入
  if($dataActors[i].meta['SecondName']){
    var arr1 = $dataActors[i].meta['SecondName'].split(',');
    $dataWeapons[i + 200].name = arr1[1];
    $gameVariables.value(i+380)[50] = $dataWeapons[i + 200].name;
  };
};
//レアリティを設定
reality_setUp = function(id1){

var actor = $gameActors.actor(id1);
if(actor.isLearnedSkill(401)){var value1 = 5;var value2 = 'LR';var value3 = 998};
if(actor.isLearnedSkill(402)){var value1 = 4;var value2 = 'UR';var value3 = 98};
if(actor.isLearnedSkill(403)){var value1 = 3;var value2 = 'SSR';var value3 = 79};
if(actor.isLearnedSkill(404)){var value1 = 2;var value2 = 'SR';var value3 = 59};
if(actor.isLearnedSkill(405)){var value1 = 1;var value2 = 'R';var value3 = 39};
if(actor.isLearnedSkill(406)){var value1 = 0;var value2 = 'N';var value3 = 9};
valueCountSet1 = value2;
actor.gainMaxLevel(-999);
actor.gainMaxLevel(value3);
actor.setupCssbgi(1,'actorreality' + value2,0,0,0,0,0);
actor.setFaceImage("Actor_"+id1, value1);

};

//レアリティアップ
reality_Up = function(id1){

var actor = $gameActors.actor(id1);
if(actor.isLearnedSkill(401)){};
if(actor.isLearnedSkill(402)){actor.forgetSkill(402);actor.learnSkill(401)};
if(actor.isLearnedSkill(403)){actor.forgetSkill(403);actor.learnSkill(402)};
if(actor.isLearnedSkill(404)){actor.forgetSkill(404);actor.learnSkill(403)};
if(actor.isLearnedSkill(405)){actor.forgetSkill(405);actor.learnSkill(404)};
if(actor.isLearnedSkill(406)){actor.forgetSkill(406);actor.learnSkill(405)};

};

//レアリティの昇格計算
reality_setPromotion = function(id2,id1){

if(id2 == 1){
  var value1 = 401;
  var actor = $gameActors.actor(id1);
  arr1 = [];
  arr2 = [];
  for (var i = 401; i <= 406; i++) {
    if(actor.isLearnedSkill(i)){
      var value1 = i;
      break;
  }};
  if(valueCountSet1 == 401){
//最高レアのため昇格不可
  } else {
    if(value1 == 402){valueWordSet2 = '<LR>昇格';valueWordSet1 = 'LRpromotionM';valueCountSet2 = 1000000};
    if(value1 == 403){valueWordSet2 = '<UR>昇格';valueWordSet1 = 'URpromotionM';valueCountSet2 = 100000};
    if(value1 == 404){valueWordSet2 = '<SSR>昇格';valueWordSet1 = 'SSRpromotionM';valueCountSet2 = 50000};
    if(value1 == 405){valueWordSet2 = '<SR>昇格';valueWordSet1 = 'SRpromotionM';valueCountSet2 = 10000};
    if(value1 == 406){valueWordSet2 = '<R>昇格';valueWordSet1 = 'RpromotionM';valueCountSet2 = 1000};
      for (var i = 1; i <= $dataItems.length-1; i++) {
        if($dataItems[i].meta[valueWordSet1]){
          arr1.push(i);
          arr2.push(Number($dataItems[i].meta[valueWordSet1]));
        };
      };
    var value2 = `${valueWordSet2}\n`;
    for (var i = 0; i <= arr1.length-1; i++) {
      value2 += `\x1bIIN[${arr1[i]}]:\\C[10]${arr2[i]}\\C[0]個<${$gameParty.numItems($dataItems[arr1[i]])}>\n`;
    };
    value2 += `\\C[10]${valueCountSet2.toLocaleString()}\\C[0]\\G<${$gameParty.gold().toLocaleString()}\\G>`;
    $gameScreen.setDTextPicture(value2, 28);
    $gameScreen.dWindowFrame = 'ON';
    var value3 = 100;
    var value2 = '';
    $gameScreen.showPicture(value3,value2,0,50+100,100,100,100,0,0);
    $gameScreen.movePicture(value3,0,50,100,100,100,255,0,60);
  };
  valueCountSet1 = value1;
};
if(id2 == 2){
  var value1 = 0;
  for (var i = 0; i <= arr1.length-1; i++) {
    if($gameParty.numItems($dataItems[arr1[i]]) < arr2[i]){
      var value1 = 1;
    };
  };
  if($gameParty.gold() < valueCountSet2){
    var value1 = 1;
  };
  if(value1 == 0){
    $gameSwitches.setValue(380,true);
  } else {
    $gameSwitches.setValue(380,false);
  };
};

if(id2 == 0){
  for (var i = 0; i <= arr1.length-1; i++) {
    $gameParty.loseItem($dataItems[arr1[i]], arr2[i]);
    var value1 = `\x1bIIN[${arr1[i]}]を\\C[10]${arr2[i]}\\C[0]個捧げた…`;
    TickerManager.show(value1);
  };
  $gameParty.loseGold(valueCountSet2);
  var value1 = `\\C[10]${valueCountSet2.toLocaleString()}\\C[0]\\G捧げた…`;
  TickerManager.show(value1);
};

};

//監禁、奴隷化時にレアリティと装備を記憶。レアリティダウンを実行するかはid3が1で実行
reality_setRelegation = function(id2,id1,id3){
  const actor = $gameActors.actor(id1);
  const stateData93 = $dataStates[93];
  const classData1 = $dataClasses[1];
  let equipData = $gameVariables.value(333)[id1];
  const actorName = actor.name();
  const stateName = stateData93.name;
  const stateIcon = stateData93.iconIndex;
  const baseClassName = classData1.name;

  if (id2 === 0) {
    for (let i = 0; i < 10; i++) {
      if (equipData[i] >= 1) {
        actor.changeEquipById(i + 1, equipData[i]);
        equipData[i] = 0;
      }
    }
    const recoverMessage = `${actorName}は装備を取り戻した！`;
    CommonPopupManager.showInfo({}, recoverMessage, null);

    if (actor.isStateAffected(93) && equipData[11] >= 1) {
      for (let i = 401; i <= 406; i++) {
        actor.forgetSkill(i);
      }
      actor.learnSkill(equipData[11]);
      reality_setUp(id1);
      actor.removeState(93);
      const stateRemoveMessage = `${actorName}の\x1bI[${stateIcon}]${stateName}が解除された！`;
      CommonPopupManager.showInfo({}, stateRemoveMessage, null);
      actor.changeExp(equipData[12] + actor.currentExp(), false);
      if (equipData[13] >= 1) {
        actor.changeSubclass(equipData[13]);
        const subclassMessage = `${actorName}のサブジョブが\\C[14]${baseClassName}\\C[0]に戻った！`;
        CommonPopupManager.showInfo({}, subclassMessage, null);
      }
      equipData[11] = 0;
      equipData[12] = 0;
      equipData[13] = 0;
    }
  } else if (id2 === 1) {
    $gameVariables.value(333)[id1] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 0-10: 装備, 11: レアリティスキル, 12: 経験値, 13: サブジョブ
    equipData = $gameVariables.value(333)[id1];
    let learnedSkill = 401;
    for (let i = 401; i <= 406; i++) {
      if (actor.isLearnedSkill(i)) {
        learnedSkill = i;
      }
    }
    equipData[11] = learnedSkill;

    const equips = actor.equips();
    for (let i = 0; i < equips.length; i++) {
      if (equips[i]) {
        equipData[i] = equips[i].id;
        actor.changeEquipById(i + 1, 0);
      }
    }
    const stealMessage = `${actorName}は装備を奪われた…`;
    CommonPopupManager.showInfo({}, stealMessage, null);

    if (id3 === 1 && !actor.isStateAffected(93)) {
      equipData[12] = actor.currentExp();
      for (let i = 401; i <= 406; i++) {
        actor.forgetSkill(i);
      }
      actor.learnSkill(406);
      reality_setUp(id1);
      actor.addState(93);
      const stateApplyMessage = `${actorName}は\x1bI[${stateIcon}]${stateName}を受けた…`;
      CommonPopupManager.showInfo({}, stateApplyMessage, null);
      equipData[13] = actor._subclassId;
      actor.changeSubclass(42);
      const dataClass = $dataClasses[actor._subclassId];
      const subclassAppliedMessage = `${actorName}のサブジョブが\\C[27]${dataClass.name}\\C[0]になった…`;
      CommonPopupManager.showInfo({}, subclassAppliedMessage, null);
    }
  }
}

//換金時にアイテム没収/解放時に放出スクリプト.1で実行 2で解除
item_confinementScript = function(id1){

if(id1 == 1){
  if($gameVariables.value(316)[0] == 0){
    $gameVariables.setValue(316,Array(4).fill(0));
    for(var j = 0; j <= 3; j++){
      $gameVariables.value(316)[j] = [];
      for(var j2 = 0; j2 <= 2000; j2++){
        $gameVariables.value(316)[j].push(0);
      };
    };
    $gameVariables.value(316)[3] = 0;
  };
};
if(id1 == 1){
  if($gameParty.gold() >= 1){
    var value1 = `アイテム類と所持金\\C[1]${$gameParty.gold().toLocaleString()}\\C[0]を奪われた…`;
    CommonPopupManager.showInfo({},value1,null);
    $gameVariables.value(316)[3] += $gameParty.gold();
    $gameParty.loseGold($gameParty.gold());
  };
} else {
  if($gameVariables.value(316)[3] >= 1){
    var value1 = `アイテム類と所持金\\C[5]${$gameVariables.value(316)[3].toLocaleString()}\\C[0]を取り戻した！`;
    CommonPopupManager.showInfo({},value1,null);
    $gameParty.gainGold($gameVariables.value(316)[3]);
    $gameVariables.value(316)[3] = 0;
  };
};
for (var j = 0; j <= 2; j++) {
  var valueItems = get_valueItems_iwa(j);
  var start = 1;
  if(j == 2){
    var end = valueArmorsLength;
  } else {
    var end = valueItems.length-1;
  };
  for (var i = start; i <= end; i++) {
    if(id1 == 1){
      var value1 = $gameParty.hasItem(valueItem,true);
    } else {
      var value1 = $gameVariables.value(316)[j][i];
    };
    if(value1){
      if(j == 0){
        if(valueItem.meta['EICSwitch']){
          if([101,106,109].some(function(id){return Number(valueItem.meta['EICSwitch']) == id})){
            if(id1 == 1){
              $gameVariables.value(316)[j][i] += $gameParty.numItems(valueItem);
              $gameParty.loseItem(valueItem, $gameVariables.value(316)[j][i]);
            } else {
              $gameParty.gainItem(valueItem, $gameVariables.value(316)[j][i]);
              $gameVariables.value(316)[j][i] = 0;
            };
          };
        };
      };
      if(j == 1){
        if(id1 == 1){
          $gameVariables.value(316)[j][i] += $gameParty.numItems(valueItem);
          $gameParty.loseItem(valueItem, $gameVariables.value(316)[j][i]);
        } else {
          $gameParty.gainItem(valueItem, $gameVariables.value(316)[j][i]);
          $gameVariables.value(316)[j][i] = 0;
        };
      };
      if(j == 2){
        if(valueItem.meta['Not Independent item']){
          if(id1 == 1){
            $gameVariables.value(316)[j][i] += $gameParty.numItems(valueItem);
            $gameParty.loseItem(valueItem, $gameVariables.value(316)[j][i]);
          } else {
            $gameParty.gainItem(valueItem, $gameVariables.value(316)[j][i]);
            $gameVariables.value(316)[j][i] = 0;
          };
        };
      };
    };
  };
};
if(id1 == 0){
  $gameVariables.setValue(316,Array(4).fill(0));
};

};

//初めて来る街でマップ名表示
map_centerDispray = function(id1,id2){

var value1 = id1;
var value2 = 'ScreenBlackOut';
$gameScreen.showPicture(value1,value2,1,640,384,100,100,0,0);
$gameScreen.movePicture(value1,1,640,384,100,100,150,0,30);
var value2 = 'ScreenCenterTextDisPray';
$gameScreen.showPicture(value1+1,value2,1,640,384,100,0,0,0);
$gameScreen.movePicture(value1+1,1,640,384,100,100,255,0,30);
var value3 = id2;
$gameScreen.setDTextPicture(`\\f[b]${value3}`, 40);
$gameScreen.setDtextFont('ＭＳ Ｐ明朝');
pic_1(2,value1+3,'',3,100,255,90,1280,768,0,0);

};

//右横256とメニュー背景設定 backGraund_menuMapSelect(2,'BG_Shower',0,0);
backGraund_menuMapSelect = function(id1,id2,id3,id4){

h_keikenhyouji2(521,0);
$gameScreen.erasePicture(6);
$gameScreen.erasePicture(70);
if($gameVariables.value(508) == 0){
  $gameVariables.setValue(508,'BlueSky');
  $gameVariables.setValue(81,0.3);//メニュー背景横スク
  $gameVariables.setValue(82,0);//メニュー背景縦スク
};
if($gameSwitches.value(206)){
  if($gameSwitches.value(15)){
    $gameVariables.setValue(508,'BG_MyRoomN');
    $gameVariables.setValue(81,0);//メニュー背景横スク
    $gameVariables.setValue(82,0.4);//メニュー背景縦スク
  } else {
    $gameVariables.setValue(508,'BG_MyRoom');
    $gameVariables.setValue(81,0.3);//メニュー背景横スク
    $gameVariables.setValue(82,0);//メニュー背景縦スク
  };
};
if(id2 != 0){
  $gameVariables.setValue(508,id2);
  $gameVariables.setValue(81,id3);//メニュー背景横スク
  $gameVariables.setValue(82,id4);//メニュー背景縦スク
};
if($gameVariables.value(508) != 0){
  Galv.CACHE.load('parallaxes',$gameVariables.value(508));
  $gameSystem._backgroundName = $gameVariables.value(508);
  if($gameVariables.value(81) != 0){var value6 = true}else{var value6 = false};
  if($gameVariables.value(82) != 0){var value7 = true}else{var value7 = false};
  if($gameSwitches.value(468)){
    $gameMap.changeParallax($gameVariables.value(508),value6,value7,$gameVariables.value(81),$gameVariables.value(82));
  };
  if($gameSwitches.value(209) || $gameSwitches.value(227)){}else{//全体マップと艦橋ではない場合
    if(['Dungeon2_2'].some(function(id){return $gameVariables.value(508) == id})){
      var value1 = -355;
    } else {
      var value1 = 0;
    };
    $gameScreen.showPicture(6,'/img/parallaxes/' + $gameVariables.value(508),0,1024,value1+50,100,100,0,0);
    $gameScreen.movePicture(6,0,1024,value1,100,100,250,0,60);
    if(id1 == 2){
      $gameScreen.showPicture(70,'/img/parallaxes/' + $gameVariables.value(508),0,1024,value1+50,100,100,0,0);
      $gameScreen.movePicture(70,0,1024,value1,100,100,255,0,60);
    };
  };
};

};

//遠景をアイテム武器ＩＤで指定
setMap_parallaxSelect = function(id1,value1,value2){

var value3 = 0;
if(id1 == 0){var valueItems = $dataItems[value1]};
if(id1 == 1){var valueItems = $dataWeapons[value1]};
if(id1 == 1){
  if(value2 == 0){
    if(valueItems.meta['BG_in']){var value3 = 'BG_in'};
  };
  if(value2 == 1){
    if(valueItems.meta['BG_out']){var value3 = 'BG_out'};
  };
  if($gameSwitches.value(15)){
    if(value2 == 0){
      if(valueItems.meta['BG_inN']){var value3 = 'BG_inN'};
    };
    if(value2 == 1){
      if(valueItems.meta['BG_outN']){var value3 = 'BG_outN'};
    };
  };
};
if(id1 == 0){
  if(valueItems.meta['BG2']){var value3 = 'BG2'};
  if($gameSwitches.value(15)){
    if(valueItems.meta['BGN2']){var value3 = 'BGN2'};
  };
};
if(value3 != 0){
  var arr1 = valueItems.meta[value3].split(',');
  if(Number(arr1[1]) == 0){
    var value4 = false
  } else {
    var value4 = true;
  };
  if(Number(arr1[2]) == 0){
    var value5 = false
  } else {
    var value5 = true;
  };
  $gameMap.changeParallax(arr1[0],value4,value5,Number(arr1[1]),Number(arr1[2]));
  $gameVariables.setValue(508,arr1[0]);
  $gameVariables.setValue(81,0);//メニュー背景横スク
  $gameVariables.setValue(82,0);//メニュー背景縦スク
};

};

//BGMをjouhouで設定した配列で指定。BGMの保存も実行
setMap_musicSelect2 = function(){

AudioManager.playBgm({name:valueMapBGM[0],volume:valueMapBGM[1],pitch:valueMapBGM[2],pan:valueMapBGM[3]});
$gameSystem.saveBgm();

};

//BGMをアイテム武器ＩＤで指定
setMap_musicSelect = function(id1,value1,value2){

if(id1 == 0){var valueItems = $dataItems[value1]};
if(id1 == 1){var valueItems = $dataWeapons[value1]};
if($dataMap.meta['BGM']){var valueItems = $dataMap};
if(valueItems.meta['BGM']){
  if($gameSwitches.value(15)){
    if(valueItems.meta['BGMN']){var value3 = 'BGMN'};
  } else {
    var value3 = 'BGM';
  };
  var arr1 = valueItems.meta[value3].split(',');
  AudioManager.playBgm({name:arr1[0],volume:arr1[1],pitch:arr1[2],pan:arr1[3]});
  $gameSystem.saveBgm();
};

};

//サブクエなどのイベント開始と終了時スクリプト
otherScene_StartEnd = function(id1,id2){

const gameVariables = $gameVariables;
const gameSwitches = $gameSwitches;
const isInBattle = isInBattle;
const gamePlayer = $gamePlayer;
if(id1 == 1){
  if(gameVariables.value(528) == 0){
    gamePlayer.setTransparent(true);
    gameVariables.setValue(292,Array(21).fill(0));
    if(!isInBattle){$gameTemp.stopMapPlayerMovement()};
    if(!isInBattle){gamePlayer.setStealthMode(true)};
    //gameSwitches.setValue(71,true);//ﾌﾟﾚｲﾔ移動禁止
    gameSwitches.setValue(124,true);//イベント進行時onoff
    gameSwitches.setValue(468,true);//ﾏｯﾌﾟﾌｪｰﾄﾞと他イベント進行禁止
    gameSwitches.setValue(467,true);//NPC消滅スイッチon
    if(gameVariables.value(320) == 0){
      if(valueWeatherSceneSet != 0){
        for (var i = 13; i <= 15; i++) {
          if(gameSwitches.value(i)){
            gameSwitches.setValue(i,false);
            gameVariables.setValue(320,i);
          };
        };
        gameSwitches.setValue(valueWeatherSceneSet,true);
      };
    };
    var array = $gameMap._commonEvents.filter(function (event) {
        return event.isActive();
    }).map(function (event) {
        return event.event().id;
    });
	const dataCommonEvents = $dataCommonEvents;
	const eventsCount = array.length;
    for (var i = 0; i < eventsCount; i++) {
      const eventId = array[i];
      if(array[i] >= 2){
        if(dataCommonEvents[eventId].switchId){
          gameVariables.setValue(529,dataCommonEvents[eventId].switchId);
		}
	  }
	}
    if(gameVariables.value(529) == 0){
      gameVariables.setValue(529,dataCommonEvents[gameVariables.value(201)].switchId);
    };
  };
}
else if(id1 == 0){
  if(gameVariables.value(528) >= 101){
	const max = gameVariables.value(292).length;
	const gameMap = $gameMap;
    for (var i = 0; i < max; i++) {
      if(gameVariables.value(292)[i] >= 1){
        if(!!gameMap.event(gameVariables.value(292)[i])) {
          if(!isInBattle){gameMap.eraseEvent(gameVariables.value(292)[i])};
        };
      };
    };
    if(gameVariables.value(320) >= 1){
      for (var i = 13; i <= 15; i++) {
        gameSwitches.setValue(i,false);
      };
      gameSwitches.setValue(gameVariables.value(320),true);
    };
    gameVariables.setValue(320,0);
    gameVariables.setValue(292,Array(21).fill(0));
    if(!isInBattle){gamePlayer.setStealthMode(false)};
    if(!isInBattle){
      gamePlayer.setThrough(false);
      $gameTemp.allowMapPlayerMovement();
    };
    //gameSwitches.setValue(71,false);//ﾌﾟﾚｲﾔ移動禁止
    gameSwitches.setValue(124,false);//イベント進行時onoff
    gameSwitches.setValue(467,false);//NPC消滅スイッチoff。
    gameSwitches.setValue(506,false);//通行人消滅スイッチoff。任意
    gameSwitches.setValue(473,false);//天候反映なし。任意
    gameSwitches.setValue(468,false);//ﾏｯﾌﾟﾌｪｰﾄﾞと他イベント進行禁止
    gameSwitches.setValue(180,true);//自動実行トリガー
    if(!isInBattle){
      drowsepost.camera.zoom(1, 60, gamePlayer);
      gamePlayer.setTransparent(false);
    };
    itemGet_afterProcess();
    fade_wipeDirect(1);
    if(gameVariables.value(529) >= 2){
      gameSwitches.setValue(gameVariables.value(529),false);
    };
  };
};

};

//イベント開始と終了時スクリプト
eventScene_StartEnd = function(value1,value2,value3,value4){

valueCountSet1 = 0;
$gameVariables.setValue(49,$gameActors.actor($gameVariables.value(11)).name());
$gameVariables.setValue(525,0); //達成スイッチid変数
if(value4 >= 401){
  if($dataItems[value4].meta['AddEventCompSwi']){
    var value5 = Number($dataItems[value4].meta['AddEventCompSwi']);
  } else {
    if($gameVariables.value(626) == 1){//挿話
      var value5 = value4+900
    };
    if($gameVariables.value(626) == 2){//Ｈ
      var value5 = value4+600
    };
  };
  $gameVariables.setValue(525,value5);
  valueCountSet1 += value5;
    if(value1 == 1 && !$gameSwitches.value(29) && !$gameSwitches.value(503) && !$gameSwitches.value(505)){
      var value6 = 0;
      if($dataItems[value4].meta['RegistrationC1']){
        var value7 = $dataItems[value4].meta['RegistrationC1'];
        if(eval(value7)){
          var value6 = 1;
        };
      };
      if($dataItems[value4].meta['RegistrationC2']){
        var value7 = $dataItems[value4].meta['RegistrationC2'];
        if(eval(value7)){
          var value6 = 1;
        };
      };
      if($dataItems[value4].meta['RegistrationC3']){
        var value7 = $dataItems[value4].meta['RegistrationC3'];
        if(eval(value7)){
          var value6 = 1;
        };
      };
      if(value6 == 0){$gameParty.gainItem($dataItems[value4], 1)};
      $gameSwitches.setValue(value5,true);
  };
} else {
  if(value1 == 1 && !$gameSwitches.value(29) && !$gameSwitches.value(503) && !$gameSwitches.value(504) && !$gameSwitches.value(505)){ //135-140
    if($gameSwitches.value(61)){$gameVariables.setValue(135,$gameVariables.value(135) + 1)};
    if($gameSwitches.value(62)){$gameVariables.setValue(136,$gameVariables.value(136) + 1)};
    if($gameSwitches.value(63)){$gameVariables.setValue(137,$gameVariables.value(137) + 1)};
    if($gameSwitches.value(64)){$gameVariables.setValue(138,$gameVariables.value(138) + 1)};
    if($gameSwitches.value(65)){$gameVariables.setValue(139,$gameVariables.value(139) + 1)};
    if($gameSwitches.value(66)){$gameVariables.setValue(140,$gameVariables.value(140) + 1)};
  };
  $gameSwitches.setValue(504,false);
};
if(value1 == 0){
  if($gameVariables.value(320) == 0){
    for (var i = 13; i <= 15; i++) {
      if($gameSwitches.value(i)){
        $gameVariables.setValue(320,i);
      };
    };
  };
  if(valueWeatherSceneSet != 0){
    $gameSwitches.setValue(13,false);
    $gameSwitches.setValue(14,false);
    $gameSwitches.setValue(15,false);
    $gameSwitches.setValue(valueWeatherSceneSet,true);
  };
  if(!$gameParty.inBattle()){$gamePlayer.setThrough(true)};
  if(!$gameParty.inBattle()){$gamePlayer.setStealthMode(true)};
  if(value4 >= 1){
    if($gameSwitches.value(29)){
      valueSceneConditions1 = true;
      valueSceneConditions2 = true;
      valueSceneConditions3 = true;
    } else {
      if($dataItems[value4].meta['RegistrationC1']){
        valueSceneConditions1 = $dataItems[value4].meta['RegistrationC1'];
      };
      if($dataItems[value4].meta['RegistrationC2']){
        valueSceneConditions2 = $dataItems[value4].meta['RegistrationC2'];
      };
      if($dataItems[value4].meta['RegistrationC3']){
        valueSceneConditions3 = $dataItems[value4].meta['RegistrationC3'];
      };
    };
  };
  //$gamePlayer.setTransparent(true);//効果なし。コモンで実行
  $gameSwitches.setValue(467,true);//NPC消滅スイッチon
  $gameSwitches.setValue(468,true);
  $gameSwitches.setValue(124,true);
  $gameVariables.setValue(292,Array(21).fill(0));
  $gameVariables.setValue(530,value3);
  //$gameSwitches.setValue(71,true);//ﾌﾟﾚｲﾔ移動禁止未使用
  if(!$gameParty.inBattle()){$gameTemp.stopMapPlayerMovement()};
} else {
  if($gameVariables.value(320) >= 1){
    for (var i = 13; i <= 15; i++) {
      $gameSwitches.setValue(i,false);
    };
    $gameSwitches.setValue($gameVariables.value(320),true);
  };
  $gameVariables.setValue(320,0);
  if($gameVariables.value(630) >= 1){
    for (var i = 13; i <= 15; i++) {
      $gameSwitches.setValue(i,false);
    };
    if($gameVariables.value(630) == 1){$gameSwitches.setValue(13,true)};
    if($gameVariables.value(630) == 2){$gameSwitches.setValue(14,true)};
    if($gameVariables.value(630) == 3){$gameSwitches.setValue(15,true)};
    $gameVariables.setValue(630,0);
  };
  if(!$gameParty.inBattle()){$gamePlayer.setThrough(false)};
  if(!$gameParty.inBattle()){$gamePlayer.setStealthMode(false)};
  $gameSwitches.setValue(124,false);//イベント進行時onoff
  $gameSwitches.setValue(473,false);
  $gameSwitches.setValue(505,false);//選択肢でシーン達成なし続行
  if(!$gameParty.inBattle()){
    $gameTemp.allowMapPlayerMovement();
    $gameTemp.allowMapEventMovement();
  };
  $gameSwitches.setValue(467,false);//NPC消滅スイッチoff
  $gameSwitches.setValue(506,false);//通行人消滅スイッチoff。任意
  for (var i = 0; i <= $gameVariables.value(292).length-1; i++) {
    if($gameVariables.value(292)[i] >= 1){
      if(!!$gameMap.event($gameVariables.value(292)[i])) {
        if(!$gameParty.inBattle()){$gameMap.eraseEvent($gameVariables.value(292)[i])};
      };
    };
  };
  valueWeatherSceneSet = 0;
  valueSceneConditions1 = true;
  valueSceneConditions2 = true;
  valueSceneConditions3 = true;
  $gameVariables.setValue(292,Array(21).fill(0));
  $gameVariables.setValue(530,0);
  $gameVariables.setValue(528,0);
  if(!$gameSwitches.value(29)){
    $gamePlayer.setTransparent(false);
    if($gameSwitches.value(412)){//挿話
      $gameSwitches.setValue(412,false);
    };
    if($gameSwitches.value(469)){//Ｈ
      $gameSwitches.setValue(469,false);
    };
  };
  if(!$gameParty.inBattle()){
    drowsepost.camera.zoom(1, 60, $gamePlayer);
  };
  if(value2 >= 2){
    valueCountSet2 = value2;
    //$gameSwitches.setValue(value2,false);
  };
};

};

//隊列順で次の表示者を決定formation_orderSelect(20,0);
formation_orderSelect = function(value2,id1){

const partyMembers = $gameParty.members();
const maxPartyMembersIndex = $gameParty.members().length-1;

let partyMemberIndex1;
let partyMemberIndex2;
if(id1 == 0){
  partyMemberIndex1 = maxPartyMembersIndex;
  partyMemberIndex2 = 0;
} else {
  partyMemberIndex1 = 0;
  partyMemberIndex2 = maxPartyMembersIndex;
};

for (let i = 0; i <= maxPartyMembersIndex; i++) {
    if(partyMembers[i].actorId() == $gameVariables.value(value2)){
      if(i == partyMemberIndex1){
        $gameVariables.setValue(value2,partyMembers[partyMemberIndex2].actorId());
      } else {
		let index = i + (id1 == 0 ? 1 : -1);
        $gameVariables.setValue(value2,partyMembers[index].actorId());
      };
      break;
}};

};

//隊列順で次のヒロインを決定formation_orderSelectH(20,0);//formation_orderSelectH(167,2);
formation_orderSelectH = function(value2,id1){

if(id1 == 2){
  valueHeroineCoice = [];
    for (var i = 0; i <= $gameParty.members().length-1; i++) {
      if(is_girl($gameParty.members()[i])){
        valueHeroineCoice.push($gameParty.members()[i].actorId());
      };
    };
  if(valueHeroineCoice.length >= 2){
    $gameSwitches.setValue(value2,true);
  };
} else {
let actorIndex1;
let actorIndexShift;
if(id1 == 0){
  actorIndex1 = valueHeroineCoice.length-1;
  //var value4 = 0;
  actorIndexShift = 1;
} else {
  actorIndex1 = 0;
  //var value4 = valueHeroineCoice.length-1;
  actorIndexShift = -1;
};

const trySetActorIndex = (index) => {
	const actorIndex = valueHeroineCoice[index];
	const actor = $gameActors.actor(actorIndex);
	if(is_girl(actor)){
	  $gameVariables.setValue(value2,actorIndex);
	  return true;
	};
	return false;
}

  const len = valueHeroineCoice.length;
  for (let i = 0; i < len; i++) {
    const value1 = valueHeroineCoice[i];
    if(value1 !== $gameVariables.value(value2)) continue;
      if(value1 == valueHeroineCoice[actorIndex1]){
        if(id1 == 0){
          for (var j = 0; j < len; j++) if(trySetActorIndex(j)) break;
          break;
        }
        else if(id1 == 1){
		  const maxIndex = valueHeroineCoice.length-1;
          for (var j = maxIndex; j >= 0 ; j--) if(trySetActorIndex(j)) break;
          break;
        }
      } else {
		const actorIndex = $gameActors.actor(valueHeroineCoice[i]).index() + actorIndexShift;
		const actor = $gameParty.members()[actorIndex];
        if(is_girl(actor)){
          $gameVariables.setValue(value2,actor.actorId());
          break;
        }
      }
  }
}

};

//初期解説コモン+tips選択肢作成
start_commentary = function(value1,value2,value3,value4,value5,value6,value7,value8){

if($gameSwitches.value(427)){
  const id = 1; 
  const choiceParams = {
  text: `${value2}`,
  value: valueStartCommentary0};
  $gameSystem.addCustomChoice(id, choiceParams);
    if(value3 == 'Dpic'){}else{
      if(value6 == 'Nda'){}else{value4 += `\\I[535]`};
        $gameScreen.setDTextPicture(value4, 28);
        $gameScreen.dWindowFrame = 'ON';
        var value9 = 150+valueStartCommentary1+valueStartCommentary0;
        var value10 = '';
        $gameScreen.showPicture(value9,value10,0,10,606,100,100,0,0);
        $gameMessage.setSelectPictureId(valueStartCommentary0-1, value9);
    };
      if(value3 == 'Npic'){}else{
        if(value3 == 'Dpic'){
          var value10 = '';
          $gameScreen.setDTextPicture(value4, 28);
          $gameScreen.dWindowFrame = 'ON';
          var value11 = 100;
          var value12 = 334;
        } else {
          var value10 = '/img/tips/' + value3;
          var value11 = 0;
          var value12 = 334;
        }
        var value9 = 100+valueStartCommentary1+valueStartCommentary0;
        $gameScreen.showPicture(value9,value10,0,value12,value11,100,100,0,0);
        $gameMessage.setSelectPictureId(valueStartCommentary0-1, value9);
      };
} else {
  $gameVariables.setValue(21,0);
  $gameVariables.setValue(22,0);
  if(!$gameSwitches.value(value1)){
    if(value1 >= 1){
      $gameSwitches.setValue(value1,true);
    };
    AudioManager.playSe({"name":'Chime1',"volume":90,"pitch":100,"pan":0});
    $gameVariables.setValue(21,value1);
    valueStartCommentary0 = 1;
    if(value3 == 'Npic' || value3 == 'Dpic'){
      var value10 = '';
      $gameScreen.setDTextPicture(`${value2}\n${value4}`, 28);
      $gameScreen.dWindowFrame = 'ON';
      $gameScreen.showPicture(102,value10,0,110,100,100,100,0,0);
    } else {
      var value10 = '/img/tips/' + value3;
      $gameScreen.showPicture(102,value10,0,110,100,100,100,0,0);
      $gameVariables.setValue(22,value4);
    };
    $gameScreen.movePicture(102,0,10,10,100,100,255,0,60);
    $gameScreen.showPicture(101,'ScreenBlackOut',1,640,384,100,100,0,0);
    $gameScreen.movePicture(101,1,640,384,100,100,200,0,60);
  };
};
  if(value5 == 'Npic'){}else{
    valueStartCommentary2P[valueStartCommentary0] = value5;
  };
  if(value6 == 'Nda'){}else{
    valueStartCommentary2[valueStartCommentary0] = value6;
  };
  if(value7 == 'Npic'){}else{
    valueStartCommentary3P[valueStartCommentary0] = value7;
  };
  if(value8 == 'Nda'){}else{
    valueStartCommentary3[valueStartCommentary0] = value8;
  };
  valueStartCommentary0 += 1;
  valueWordSet0 = value2;

};

//スキル習得時のコスト（反応）skill_learnFeedback(user,skill.id);
skill_learnFeedback = function(user,skillId){

var value2 = ` `;
//if($dataSkills[skillId].meta['RankMaxLearning']){
//  value2 += `${user.name()}は\\C[16]\x1bSIN[${skillId}]\\C[0]を習得した！`;
//  var value1 = 296;
//}else{
let value1 = 0;
  const maxMasteryLevel = $dataSkills[skillId].meta["Max Mastery Level"];
  const userName = user.name();
  if(maxMasteryLevel){
    if(user.skillMasteryLevel(skillId) < 1){
      value1 = 296;
    } else {
      value1 = 297;
    };
    if(user.skillMasteryLevel(skillId) < 1){
      value2 += `${userName}は\\C[16]\x1bSIN[${skillId}]\\C[0]を習得した！`;
    } else {
      value2 += `${userName}の\\C[16]\x1bSIN[${skillId}]\\C[0]がランクアップ！`;
    };
    user.gainSkillMasteryLevel(skillId, +1);
	const skillLevel = user.skillMasteryLevel(skillId);
	const maxSkillLevel = Number(maxMasteryLevel);
    value2 += ` [\\C[2]${skillLevel}/${maxSkillLevel}\\C[0]]`;
    if(skillLevel >= maxSkillLevel){
      value2 += `\\C[10]<ランクマックス！>\\C[0]`;
    };
  } else {
    value2 += `${userName}は\\C[16]\x1bSIN[${skillId}]\\C[0]を習得した！`;
    value1 = 296;
  };
//};
TickerManager.show(value2);
user.startAnimation(value1, true, 0);//変更。アニメ追加
passive_addCondition(user);//パッシブ
title_battleUp(user);//タイトル
user.refresh();

};

//スキル習得時のＪＰコストskill_learnJPCost(user,skill.id);
skill_learnJPCost = function(user,skillId){

var value1 = Number($dataSkills[skillId].meta.RankUpPoint);
var value2 = user.skillMasteryUses(skillId);
valueSkillLearnJPCost = (value1 + user.skillMasteryLevel(skillId) * value1) - value2;

};

//クラス毎ジョブ解放スクリプト。途中セーブ禁止！
job_releaseUnlockEvent = function(id1,id2){

var actor = $gameActors.actor($gameVariables.value(20));
var value3 = 101;
var value4 = 1;
//var value5 = $gameMap.event(1).screenX()*$gameScreen.zoomScale();
//var value6 = $gameMap.event(1).screenY()*$gameScreen.zoomScale();
const id = 1; 
const choiceParams = {
text: `${actor.name()}→`,value: 0};
$gameSystem.addCustomChoice(id, choiceParams);
var value2 = ``;
var start = 0;
var end = $dataClasses[actor._classId].learnings.length-1;
var value7 = 0;
for (var i = start; i <= end; i++) {
  if($dataClasses[actor._classId].learnings[i]){
    var value1 = $dataClasses[actor._classId].learnings[i].skillId;
    if($dataClasses[actor._classId].learnings[i].level >= actor.level){
      value2 += `\\C[17][Lv${$dataClasses[actor._classId].learnings[i].level}]\\C[0]`;
      value2 += `\x1bSIN[${value1}]\n`;
      value2 += `${$dataSkills[value1].description}\n`;
      value7 += 1
    };
  };
  if(value7 >= 6){
    break;
  };
};
var value15 = `\\C[23]<${$dataClasses[actor._classId].name}>\\C[0]\n${$dataClasses[actor._classId].description}\n${valueAddDescriptionClass[actor._classId]}\n`;
$gameScreen.setDTextPicture(`${value15+value2}`, 22);
$gameScreen.dWindowFrame = 'ON';
$gameScreen.showPicture(value3-1,'',0,300,20,100,100,0,0);
$gameMessage.setSelectPictureId(0, value3-1);
for (var j = id1; j <= id2; j++) {
  var value1 = j;
  var value7 = 0;
  var value9 = 0;
  var value13 = 0;
  var value2 = `\\C[14]習得可能スキル\\C[0]\n`;
  for (var i = 0; i < actor.unlockedClasses().length; ++i) {
    if(actor.unlockedClasses()[i] == value1){
      var value7 = 1;
      break;
  }};
  if(value7 == 0){
    var start = 1;
    var end = 888;//$dataSkills.length-1;エネミースキル除外のため
    for (var i = start; i <= end; i++) {
      if($dataSkills[i].meta['SkillLearningClass']){
        if(Number($dataSkills[i].meta['SkillLearningClass']) == value1){
          value2 += `\x1bSIN[${i}]\n`;
          value2 += `${$dataSkills[i].description}\n`;
    }}};
    var value8 = Number($dataClasses[value1].meta['classRank']);
    if(value8 == 1){var value10 = 3000};
    if(value8 == 2){var value10 = 10000};
    if(value8 == 3){var value10 = 100000};
    value2 += `\\C[14]解放資金\\C[0]:${value10.toLocaleString()}`;
    var value11 = $gameParty.gold();
    if(value11 >= value10){
      value2 += `（現在所持金:${value11.toLocaleString()}）\n`;
    } else {
      value2 += `\\C[10]（現在所持金:${value11.toLocaleString()}）\\C[0]\n`;
      var value13 = 1;
    };
    value2 += `\\C[14]解放素材\\C[0]:`;
    if(value8 >= 1){
      for (var i = 1; i <= $dataItems.length-1; i++) {
        if($dataItems[i].meta['class'+value8+'JobReleaseM']){
          var value9 = i;
          break;
    }}};
    if(value9 >= 1){
      value2 += `${$dataItems[value9].name} 3個`;
      if($gameParty.numItems($dataItems[value9]) >= 1){
        value2 += `（所持数:${$gameParty.numItems($dataItems[value9])}）\n`;
        if($gameParty.numItems($dataItems[value9]) >= 3){}else{
          var value13 = 1;
        };
      } else {
        value2 += `\\C[10]（未所持）\\C[0]\n`;
        var value13 = 1;
      };
    } else {
      value2 += `なし\n`;
    };
    if(value8 >= 2){
      if(value8 == 2){var value12 = 20};
      if(value8 == 3){var value12 = 30};
      value2 += `\\C[14]解放条件\\C[0]:`;
      value2 += `${$dataClasses[value1-10].name}LV:${actor.classLevel(value1-10)}`;
      if(actor.classLevel(value1-10) >= value12){
        value2 += `<達成>\n`;      
      } else {
        value2 += `\\C[10]<未達成>\\C[0]\n`;  
        var value13 = 1;
      };
    };
    if(value13 == 0){
      valueJobReleaseTorF1[value1] = 1;
      var value14 = `${$dataClasses[value1].name}`;
    } else {
      var value14 = `\\C[7]${$dataClasses[value1].name}\\C[0]`;
    };
    const id = 1; 
    const choiceParams = {
    text: `${value14}`,
    value: value4};
    $gameSystem.addCustomChoice(id, choiceParams);
    var value15 = `${$dataClasses[value1].description}\n${valueAddDescriptionClass[value1]}\n`;
    $gameScreen.setDTextPicture(`${value15+value2}`, 22);
    $gameScreen.dWindowFrame = 'ON';
    $gameScreen.showPicture(value3,'',0,300,20,100,100,0,0);
    $gameMessage.setSelectPictureId(value4, value3);
    valueJobReleaseTorF2[value4] = value1;
    value3 += 1;
    value4 += 1;
  };
};

};

//クラス毎ジョブ解放スクリプト。コスト支払い
job_releaseCostEvent = function(classId){

var classRankIndex = Number($dataClasses[classId].meta['classRank']);

  if(classRankIndex == 1){var goldValue = 3000}
  else if(classRankIndex == 2){var goldValue = 10000}
  else if (classRankIndex == 3) { var goldValue = 100000 };

  var soundFileName = classRankIndex == 3 ? '21_ClassRelease2' : '21_ClassRelease';
  AudioManager.playMe({"name":soundFileName,"volume":90,"pitch":100,"pan":0});

  $gameParty.loseGold(goldValue);
  var messageText = `所持金:-\\C[2]${goldValue}\\C[0]\\G`;
  CommonPopupManager.showInfo({}, messageText, null);

  let itemIndex = 0;
  if(classRankIndex >= 1){
    for (var i = 1; i <= $dataItems.length-1; i++) {
      if ($dataItems[i].meta['class' + classRankIndex + 'JobReleaseM']) {
        itemIndex = i;
        break;
  }}};

  if(itemIndex >= 1){
    const item = $dataItems[itemIndex];
    $gameParty.loseItem(item, 3);

    const messageText = `アイテム:-\\C[2]${item.name}\\C[0]`;
    CommonPopupManager.showInfo({},messageText,null);
  };

var actor = $gameActors.actor($gameVariables.value(20));
actor.unlockClass(classId);
$gameSwitches.setValue(424,true);//初めてジョブ解放したスイッチ

};

//パーティ全体のアンロッククラス数,コモン43で実行
actors_unlockedClassHit = function(){

var arr1 = [];
for (var i = 0; i < $gameParty.members().length; i++) {
  var actor = $gameParty.members()[i];
  var arr2 = actor.unlockedClasses();
  var arr1 = arr1.concat(arr2);
};
arr1.filter(function (x, i, self) {
  return self.indexOf(x) === i;
});
var value1 = 0;
var value2 = 0;
var value3 = 0;
for (var i = 0; i < arr1.length; i++) {
  if(arr1[i] >= 51 && arr1[i] <= 60){
    value1 += 1;
  };
  if(arr1[i] >= 61 && arr1[i] <= 70){
    value2 += 1;
  };
  if(arr1[i] >= 71 && arr1[i] <= 80){
    value3 += 1;
  };
};
if(value1 >= 10){
  $gameSwitches.setValue(423,true);
};
if(value2 >= 10){
  $gameSwitches.setValue(613,true);
};
if(value3 >= 10){
  $gameSwitches.setValue(614,true);
};

};

//変数やスイッチのタイトル効果
title_EffectConfi = function(){

for (var i = 1; i <= $dataItems.length-1; i++) {
  if($dataItems[i].meta['titleEffectConfiSwi']){
    var value1 = Number($dataItems[i].meta['titleEffectConfiSwi']);
    var value2 = false;
    $gameSwitches.setValue(value1,value2);
  };
};

//var list = [288,295];//通常タイトルとＨタイトルのセットして変数配列の変数id
var list = [288];//Hタイトル枠削除
list.forEach(function(id1) {
  var arr1 = $gameVariables.value(id1);
  for (var i = 0; i <= arr1.length-1; i++) {
    if(Number(arr1[i]) >= 1){
      if($dataItems[Number(arr1[i])].meta['titleEffectConfiVal']){
        var arr2 = $dataItems[Number(arr1[i])].meta['titleEffectConfiVal'].split(',');
        $gameVariables.setValue(Number(arr2[0]),$gameVariables.value(Number(arr2[0])) + Number(arr2[1]));
    }};
      if(Number(arr1[i]) >= 1){
        if($dataItems[Number(arr1[i])].meta['titleEffectConfiSwi']){
          var value1 = Number($dataItems[Number(arr1[i])].meta['titleEffectConfiSwi']);
          var value2 = true;
        $gameSwitches.setValue(value1,value2);
      }};
  };
}, this);

  var arr1 = valueTitleSetItemsNoSetEffect;
  for (var i = 0; i <= arr1.length-1; i++) {
    if($gameParty.hasItem($dataItems[Number(arr1[i])])){
      if($dataItems[Number(arr1[i])].meta['titleEffectConfiVal']){
        var arr2 = $dataItems[Number(arr1[i])].meta['titleEffectConfiVal'].split(',');
        $gameVariables.setValue(Number(arr2[0]),$gameVariables.value(Number(arr2[0])) + Number(arr2[1]));
      };
    };
      if($dataItems[Number(arr1[i])].meta['titleEffectConfiSwi']){
        var value1 = Number($dataItems[Number(arr1[i])].meta['titleEffectConfiSwi']);
        var value2 = false;
        if($gameParty.hasItem($dataItems[Number(arr1[i])])){var value2 = true};
        $gameSwitches.setValue(value1,value2);
      };
  };

};

//フェードインアウトワイプ演出。0消去1汎用2ワープ
fade_wipeDirect = function(id1){

if(id1 == 0){
  $gameScreen._useGWTrans = 'off';
};
if(id1 == 1){
  if($gameSwitches.value(201)){
    var arr1 = ['Dunjon004','Dunjon008','Dunjon012','Dunjon036','Dunjon052','Dunjon100','Dunjon104','Dunjon118','Dunjon153','Dunjon999'];
  } else {
    var arr1 = ['Town048','Town084','Town092','Town129','Town131','Town225','Town309','Town310','Town001','Town013','Town014','Town032','Town033','Town039','Town041','Town046'];
  };
  var value1 =  arr1[Math.floor(Math.random() * arr1.length)];
};
if(id1 == 2){
  var value1 = 'Town129';
};
if(id1 >= 1){
  $gameScreen._GWInImg = value1;
  $gameScreen._GWOutImg = value1;
  valueWipeImg = value1;
  Galv.CACHE.load('transitions',value1);
};

};

//トラップ設定
trap_setUp = function(id1){

$gameSwitches.setValue(380,false);
var arr1 = [];
var start = 1;
var end = $dataSkills.length-1;
for (var i = start; i <= end; i++) {
  if ($dataSkills[i].meta['trapEvasion']) {
    arr1.push(i);
}};
for (var i = 0; i <= $gameParty.members().length-1; i++) {
  var actor = $gameParty.members()[i];
    for (var id = 0; id <= arr1.length-1; id++) {
      if(actor.battleSkillsRaw().includes(arr1[id])){
        $gameSwitches.setValue(380,true);
        break;
      };
    };
};
if(!$gameSwitches.value(380)){
  var arr1 = [];
  var start = 1;
  var end = $dataItems.length-1;
    for (var i = start; i <= end; i++) {
      if($dataItems[i].meta['trapEvasion']) {
        arr1.push(i);
    }};
    for (var i = 0; i <= arr1.length-1; i++) {
      if($gameParty.hasItem($dataItems[arr1[i]])){
        $gameSwitches.setValue(380,true);
        $gameParty.gainItem($dataItems[arr1[i]], -1);
        break;
      };
    };
};
if($gameSwitches.value(380)){
  $gameMap.spawnEvent(136, $gamePlayer._realX, $gamePlayer._realY, true);
  var event = $gameMap.event($gameMap.getLastSpawnEventId());
  var actor = $gameParty.members()[0];
  event.setImage(actor.characterName(), actor.characterIndex());
  event.setDirection($gamePlayer._direction);
  event.setPattern(1);
  event._originalPattern = 1;
  event.setOpacity(250);
  event.setBlendMode(1);
  var value1 = `\\C[16]${actor.name()}\\C[0]は\\C[10]トラップ\\C[0]を回避した！`;
  CommonPopupManager.showInfo({},value1,null);
};

};

trap_starting1 = function(id2,id1){

  var event = $gameMap.event(id1);
  if(id2 == 1){
    valueCountSet1 = Math.floor( Math.random() * 13);
    //valueCountSet1 = 13;//テスト用
    if(valueCountSet1 <= 1){valueCountSet2 = 1};
    if(valueCountSet1 == 2){valueCountSet2 = 4};//毒
    if(valueCountSet1 == 3){valueCountSet2 = 5};//暗闇
    if(valueCountSet1 == 4){valueCountSet2 = 6};//沈黙
    if(valueCountSet1 == 5){valueCountSet2 = 1};//激高
    if(valueCountSet1 == 6){valueCountSet2 = 8};//混乱
    if(valueCountSet1 == 7){valueCountSet2 = 9};//魅了
    if(valueCountSet1 == 8){valueCountSet2 = 10};//睡眠
    if(valueCountSet1 == 9){valueCountSet2 = 1};//スタン
    if(valueCountSet1 == 10){valueCountSet2 = 0};//爆破。ＨＰダメージ623user.gainMp(-value2);
    if(valueCountSet1 == 11){valueCountSet2 = 0};//吸収。ＭＰダメージ625
    if(valueCountSet1 == 12){valueCountSet2 = 0};//脱力。TＰダメージ626
    if(valueCountSet1 == 13){valueCountSet2 = 0};//転移。valueCountSet2に転送先のイベID
  };
  if(id2 == 2){
    if(valueCountSet2 == 1){
      var actor = $gameParty.members()[0];
      if(is_girl(actor)){
        actor.addState(62);
        if(actor.isStateAffected(62)){
          $gamePlayer.requestAnimation(624);
          $gameVariables.setValue(20,actor.actorId());
          var value1 = `衣装破損トラップが発生した！`;
        } else {
          $gamePlayer.requestBalloon(2);
          var value1 = `しかし何も起こらなかった…。（\\C[3]衣装破損トラップ未発生\\C[0]）`;
        };
      };
      CommonPopupManager.showInfo({},value1,null);
    };
    if([4,5,6,8,9,10].some(function(id){return valueCountSet2 == id})){
      $gamePlayer.requestAnimation(valueStateAnimeArr[valueCountSet2]);
      for (var i = 0; i <= $gameParty.members().length-1; i++) {
        var actor = $gameParty.members()[i];
        state_addFormula1([valueCountSet2,50,actor,actor,actor.mdf,actor.luk]);
      };
    };
    if(valueCountSet1 == 5 || valueCountSet1 == 9){
      $gamePlayer.requestBalloon(2);
      var value1 = `しかし何も起こらなかった…。`;
      CommonPopupManager.showInfo({},value1,null);
    };
    if(valueCountSet1 == 10){
      $gamePlayer.requestAnimation(623);
      var value1 = `足元の魔法陣から爆発が発生した！`;
      CommonPopupManager.showInfo({},value1,null);
      for (var i = 0; i <= $gameParty.members().length-1; i++) {
        var actor = $gameParty.members()[i];
        //agi,luk,actor.xparam(0)*100。Math.round((actor.agi * 2 + actor.luk /10) * (actor.xparam(0)*100))
        var value2 = Math.round((actor.agi * 2 + actor.luk /10) * (actor.xparam(0)));
        var value3 = Math.floor( Math.random() * 900) + 101;
        var value4 = Math.floor( Math.random() * 900) + 101;
        if($gameVariables.value(240) >= 1){
          var arr1 = $dataItems[$gameVariables.value(240)].meta['EnemyLV'].split(',');
          var value3 = arr1[Math.floor(Math.random() * arr1.length)] * 10;
          var value3 = Math.floor( Math.random() * (value3 * 10)) + (value3 + 1);
          var value4 = arr1[Math.floor(Math.random() * arr1.length)] * 10;
          var value4 = Math.floor( Math.random() * (value4 * 10)) + (value4 + 1);
        };
        if(value3 > value2){
          $gamePlayer.requestAnimation(131);
          actor.gainHp(-value4);
          var value1 = `\\C[16]${actor.name()}\\C[0]は\\C[10]${value4}\\C[0]のＨＰダメージを受けた！（判定：\\C[4]${value2}\\C[0] > \\C[10]${value3}\\C[0]）`;
          CommonPopupManager.showInfo({},value1,null);
        } else {
          $gamePlayer.requestAnimation(129);
          var value1 = `\\C[16]${actor.name()}\\C[0]は\\C[2]回避\\C[0]に成功した！（判定：\\C[4]${value2}\\C[0] > \\C[10]${value3}\\C[0]）`;
          CommonPopupManager.showInfo({},value1,null);
        };
      };
    };
    if(valueCountSet1 == 11){
      var value1 = `吸収の魔法陣が発動した！`;
      CommonPopupManager.showInfo({},value1,null);
      $gamePlayer.requestAnimation(625);
      for (var i = 0; i <= $gameParty.members().length-1; i++) {
        var actor = $gameParty.members()[i];
        var value2 = Math.round((actor.mat * 2 + actor.luk /10) * (actor.xparam(0)));
        var value3 = Math.floor( Math.random() * 900) + 101;
        var value4 = Math.floor( Math.random() * 900) + 101;
        if($gameVariables.value(240) >= 1){
          var arr1 = $dataItems[$gameVariables.value(240)].meta['EnemyLV'].split(',');
          var value3 = arr1[Math.floor(Math.random() * arr1.length)] * 10;
          var value3 = Math.floor( Math.random() * (value3 * 10)) + (value3 + 1);
          var value4 = arr1[Math.floor(Math.random() * arr1.length)] * 1;
          var value4 = Math.floor( Math.random() * (value4 * 10)) + (value4 + 1);
        };
        if(value3 > value2){
          $gamePlayer.requestAnimation(58);
          actor.gainMp(-value4);
          var value1 = `\\C[16]${actor.name()}\\C[0]は\\C[10]${value4}\\C[0]のＭＰダメージを受けた！（判定：\\C[4]${value2}\\C[0] > \\C[10]${value3}\\C[0]）`;
          CommonPopupManager.showInfo({},value1,null);
        } else {
          $gamePlayer.requestAnimation(129);
          var value1 = `\\C[16]${actor.name()}\\C[0]は\\C[2]回避\\C[0]に成功した！（判定：\\C[4]${value2}\\C[0] > \\C[10]${value3}\\C[0]）`;
          CommonPopupManager.showInfo({},value1,null);
        };
      };
    };
    if(valueCountSet1 == 12){
      var value1 = `脱力の魔法陣が発動した！`;
      CommonPopupManager.showInfo({},value1,null);
      event.requestAnimation(626);
      for (var i = 0; i <= $gameParty.members().length-1; i++) {
        var actor = $gameParty.members()[i];
        var value2 = Math.round((actor.mdf * 2 + actor.luk /10) * (actor.xparam(0)));
        var value3 = Math.floor( Math.random() * 900) + 101;
        var value4 = Math.floor( Math.random() * 90) + 11;
        if($gameVariables.value(240) >= 1){
          var arr1 = $dataItems[$gameVariables.value(240)].meta['EnemyLV'].split(',');
          var value3 = arr1[Math.floor(Math.random() * arr1.length)] * 10;
          var value3 = Math.floor( Math.random() * (value3 * 10)) + (value3 + 1);
        };
        if(value3 > value2){
          $gamePlayer.requestAnimation(58);
          actor.gainTp(-value4);
          var value1 = `\\C[16]${actor.name()}\\C[0]は\\C[10]${value4}\\C[0]のＴＰダメージを受けた！（判定：\\C[4]${value2}\\C[0] > \\C[10]${value3}\\C[0]）`;
          CommonPopupManager.showInfo({},value1,null);
        } else {
          $gamePlayer.requestAnimation(129);
          var value1 = `\\C[16]${actor.name()}\\C[0]は\\C[2]回避\\C[0]に成功した！（判定：\\C[4]${value2}\\C[0] > \\C[10]${value3}\\C[0]）`;
          CommonPopupManager.showInfo({},value1,null);
        };
      };
    };
    if(valueCountSet1 == 13){
      $gameVariables.setValue(161,0);
      var value1 = $gameMap.events().length;
      if(value1 >= 50){
        var value11 = 200;
      } else {
        var value11 = 100;
      };
      for (var id = value11; id > 0; id--) {
        if(!!$gameMap.event(id)) {
          if ($gameMap.event(id).event().meta['warpTrap']){
            valueCountSet2 = id;
            $gameVariables.setValue(161,[$gameMap.mapId(),$gameMap.event(id).x,$gameMap.event(id).y]);
            break;
      }}};
      var value1 = `転送トラップが発動した！`;
      CommonPopupManager.showInfo({},value1,null);
    };
  };

};

//フラッシュモブ演出flashmob_wordDirect(1,55,56,100,'Tamanegiv6',`!?`);
flashmob_wordDirect = function(id5,id1,id2,id3,id6,id4){
if(id5 == 0){
  $gameScreen.erasePicture(id1);
  $gameScreen.erasePicture(id2);
} else {
  if(id5 == 1){var value2 = 'Screen_mobFlash'};
  if(id5 == 2){var value2 = 'Screen_hukidasi'};
  if(id5 == 3){var value2 = 'Screen_hukidasiIkari'};
  var value1 = id1;
  if(id5 == 1 || id5 == 2){
    pic_1(2,value1,value2,0,100,250,60,1280,768,0,0);
  };
  if(id5 == 3){
    pic_1(2,value1,value2,0,100,255,40,1280,768,0,0);
  };
  var value1 = id4;
  var value2 = id3;
  $gameScreen.setDTextPicture(`\\oc[15]\\C[15]${value1}`, value2);//\\f[b]
  $gameScreen.setDtextFont(id6);
  var value1 = id2;
  if(id5 == 1 || id5 == 2){
    $gameScreen.showPicture(value1,"",1,640-240+60,384-80,100,100,0,0);
    $gameScreen.movePicture(value1,1,640-240,384-80,100,100,255,0,60);
  };
  if(id5 == 3){
    adv_partDirectPlay(7);
    $gameScreen.dTextAlign = 1;
    $gameScreen.showPicture(value1,"",1,640,384,300,300,0,0);
    $gameScreen.movePicture(value1,1,640,384,100,100,255,0,40);
  };
  if(id5 == 1 || id5 == 3){
    ensyutu_ikari(60,'Thunder9');
  };
};

};

//獲得物等一覧表示
get_loopListDisplay = function(){

var value2 = 0;
if(valueCountSet2 >= 2){
  value2 += 6 * 3 * 38;
} else {
  value2 += valueCountSet1 * 3 * 38 + 60;
};
var value1 = 50;
if(valueCountSet1 <= 3){
  value1 = 250 - (valueCountSet1 * 40);
};
WindowManager.show(1, 0, value1, 1280, 768-value1);
WindowManager.drawText(1, `\\fs[28]${eval("valueWordSet" + valueCountSet3)}`);
valueCountSet3 += 1;

};

//獲得物等一覧表示全画面
get_loopListDisplay2 = function(){

WindowManager.show(1, 0, 70, 1280, 698);
WindowManager.drawText(1, `\\fs[28]${eval("valueWordSet" + valueCountSet3)}`);
valueCountSet3 += 1;

};

//獲得物等一覧表示２面仕様valueCountSet3 = 0;から始める
get_loopListDisplay3 = function(id1){

//id1で一括売却実行//arr1[0];//名前//arr1[1];//数//arr1[2];//\G
//arr1[3];//変数57//arr1[4];//ｱｲﾃﾑID270//valueIkkatuArray[j];
  var value3 = 1;
  var value1 = ``;
  var value2 = ``;
  var value5 = ``;
  if(id1 == 1){var value6 = 20;var value7 = 23};
  if(id1 == 2){var value6 = 15;var value7 = 32};
  for (var i = valueCountSet3; i <= valueIkkatuArray.length-1; i++) {
    if(valueIkkatuArray[i] != 0){
      if(id1 == 2){//種族討伐数表示
        if(valueIkkatuArray[i][0].length <= 8){
          for (var j = valueIkkatuArray[i][0].length; j <= 9; j++) {
            valueIkkatuArray[i][0] += `　`; 
          };
        };
        value5 += `　　\\C[16]${valueIkkatuArray[i][0]}\\C[0]:\\C[2]${valueIkkatuArray[i][1]}体\\C[0] `;
        value5 += `\n`;
        eval("value" + value3 + " = value5");
      };
      if(id1 == 1){//一括売却実行用
        value5 += `${valueIkkatuArray[i][0]}:${valueIkkatuArray[i][1]}個売却 `;
        valueCountSet4 += valueIkkatuArray[i][1];
        if(valueIkkatuArray[i][2] != 0){
          var value4 = valueIkkatuArray[i][2].toLocaleString();
          value5 += `[+${value4}\G]`;
          valueCountSet5 += valueIkkatuArray[i][2];
        };
        if(valueIkkatuArray[i][3] != 0){
          var value4 = valueIkkatuArray[i][3].toLocaleString();
          value5 += `[+\\I[1]${value4}]`;
          valueCountSet6 += valueIkkatuArray[i][3];
        };
        if(valueIkkatuArray[i][4] != 0){
          var value4 = valueIkkatuArray[i][4].toLocaleString();
          value5 += `[+\\I[1]${value4}]`;
          valueCountSet7 += valueIkkatuArray[i][4];
        };
        value5 += `\n`;
        eval("value" + value3 + " = value5");
      };
      valueCountSet3 += 1;
      if( (valueCountSet3 %value6) == 0 ){
        if(value3 == 2){
          break;
        };
        var value3 = 2;
        var value5 = ``;
      };
    };
  };
  WindowManager.show(1, 0, 70, 640, 698);
  WindowManager.drawText(1, `\x1bfs[${value7}]${value1}`);
  if(value2 != 0){
    WindowManager.show(2, 640, 70, 1280, 698);
    WindowManager.drawText(2, `\x1bfs[${value7}]${value2}`);
  };

};

//選択肢でアイテム表示item_price()合わせて3面表示//選択肢のvalueは1からで選択肢ﾋﾟｸﾁｬは0からvalueWordArray
get_loopChoiceDisplay1 = function(id1,id2,id3){
//get_loopChoiceDisplay1(1,0,1);//クエストid1は種類 id2が0道具1武器2防具 id3が列数WindowManager.hide(0);
//get_loopChoiceDisplay1(2,0,2);//一括売却
//get_loopChoiceDisplay1(3,0,2);//一括売却

var valueItems = get_valueItems_iwa(id2);
//picture_motion1("linear",[0]);
$gameVariables.setValue(177,id3);
if(id1 == 1){//クエスト掲示
  WindowManager.show(0, 0, 0, 1280, 110);
  var value4 = `　　　　　　　　　　　　　　　　　　　クエスト掲示板`;
  WindowManager.drawText(0, value4);
  var value7 = `　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　`;
};
if(id1 == 2 || id1 == 3){//一括売却
  var value7 = `\\FS[25]対象を選択して下さい　　　　　　　　　　　　　　　　　　　　　　　　　　　`;
};
var value1 = 1;
if(id1 == 2 || id1 == 3){
  const id = 1; 
  const choiceParams = {
  text: value7,
  value: -1};
  $gameSystem.addCustomChoice(id, choiceParams);
};
var value2 = ``;//選択肢表示分
var value3 = ``;//item_price()の表示分
valueCountArray3 = [];
for (var i = 0; i <= valueCountArray.length-1; i++) {
  if(valueWordArray != 0){
    var value2 = `${valueWordArray[i]}`;
  } else {
    if(id1 == 3){
      if(valueCountArray2[i] == 0){var value2 = `\x1bIIN[${valueCountArray[i]}]`};
      if(valueCountArray2[i] == 1){var value2 = `\x1bWIN[${valueCountArray[i]}]`};
      if(valueCountArray2[i] == 2){var value2 = `\x1bAIN[${valueCountArray[i]}]`};
    } else {
      if(id2 == 0){var value2 = `\x1bIIN[${valueCountArray[i]}]`};
      if(id2 == 1){var value2 = `\x1bWIN[${valueCountArray[i]}]`};
      if(id2 == 2){var value2 = `\x1bAIN[${valueCountArray[i]}]`};
    };
  };
  if(id1 == 1){//クエスト
    if(valueWordArray[i] == `？？？`){
      var value2 = `\\C[1][受注不可]\\C[0]\x1bI[${$dataItems[valueCountArray[i]].iconIndex}]？？？`
      var value3 = valueQuestArray7[valueCountArray[i] - 800];
    } else {
      var value3 = valueQuestArray4[valueCountArray[i] - 800];
    };
  };
  if(id1 == 2){//一括売却
    item_priceinfo(id2,valueCountArray[i]);
    var value3 = $gameVariables.value(801);
  };
  const id = 1; 
  const choiceParams = {
  text: value2,
  value: i};
  $gameSystem.addCustomChoice(id, choiceParams);
  valueCountArray3.push(valueCountArray[i]);
  if(id3 <= 2 && value1 <= 240){
    if(id3 == 2){var value5 = 1000};
    if(id3 == 1){var value5 = 700};
    if(id3 == 2){var value6 = 10};
    if(id3 == 1){var value6 = 120};
    var value8 = value1 - 1;
    if(id1 == 2){var value8 = value1};
    if(id1 == 1 || id1 == 2){//クエストと一括対象選択のみ。
      $gameScreen.setDTextPicture(value3, 22);
      $gameScreen.dWindowFrame = 'ON';
      var value10 = '';
      $gameScreen.showPicture(value1+10,value10,0,value5,value6,100,100,0,0);
      $gameMessage.setSelectPictureId(value8, value1+10);
    };
  };
  value1 += 1;
};

};

//リセット項目を表示
reset_exeDisplay = function(){

//0がリセットする。1がリセットしない
//スタートコモンで実行$gameVariables.setValue(183,[0,0,0,1,1,0,0,0,0,0,0]);//10
//1Ｈシーンフラグをリセットする
//2挿話フラグをリセットする
//3Ｈ回想履歴をリセットしない
//4挿話回想履歴をリセットしない
//5クエスト達成状況をリセットする
//6種族討伐数をリセットする
//7マップ情報をリセットする
//8戦績情報をクリアする
var value1 = 1;
if($gameVariables.value(183)[value1] == 0){
  $gameVariables.setValue(800 + value1,`Ｈシーンフラグをリセットする`);
} else {
  $gameVariables.setValue(800 + value1,`Ｈシーンフラグをリセットしない`);
};
var value1 = 2;
if($gameVariables.value(183)[value1] == 0){
  $gameVariables.setValue(800 + value1,`挿話シーンフラグをリセットする`);
} else {
  $gameVariables.setValue(800 + value1,`挿話シーンフラグをリセットしない`);
};
var value1 = 3;
if($gameVariables.value(183)[value1] == 0){
  $gameVariables.setValue(800 + value1,`Ｈ回想履歴をリセットする`);
} else {
  $gameVariables.setValue(800 + value1,`Ｈ回想履歴をリセットしない`);
};
var value1 = 4;
if($gameVariables.value(183)[value1] == 0){
  $gameVariables.setValue(800 + value1,`挿話回想履歴をリセットする`);
} else {
  $gameVariables.setValue(800 + value1,`挿話回想履歴をリセットしない`);
};
var value1 = 5;
if($gameVariables.value(183)[value1] == 0){
  $gameVariables.setValue(800 + value1,`クエスト達成状況をリセットする`);
} else {
  $gameVariables.setValue(800 + value1,`クエスト達成状況をリセットしない`);
};
var value1 = 6;
if($gameVariables.value(183)[value1] == 0){
  $gameVariables.setValue(800 + value1,`各種族討伐数をリセットする`);
} else {
  $gameVariables.setValue(800 + value1,`各種族討伐数をリセットしない`);
};
var value1 = 7;
if($gameVariables.value(183)[value1] == 0){
  $gameVariables.setValue(800 + value1,`マップ情報をリセットする`);
} else {
  $gameVariables.setValue(800 + value1,`マップ情報をリセットしない`);
};
var value1 = 8;
if($gameVariables.value(183)[value1] == 0){
  $gameVariables.setValue(800 + value1,`戦闘レコードをリセットする`);
} else {
  $gameVariables.setValue(800 + value1,`戦闘レコードをリセットしない`);
};

};

//リセット時に実行
reset_exe1 = function(){

const gameSwitches = $gameSwitches;
const gameVariables = $gameVariables;
const gameParty = $gameParty;
const gameActors = $gameActors;

const dataSystem = $dataSystem;
const dataSystemSwitches = dataSystem.switches;
const dataSystemVariables = $dataSystem.variables;
const dataSystemSwitchesCount = dataSystemSwitches.length;
const dataSystemVariablesCount = dataSystemVariables.length;
const dataSkills = $dataSkills;
const dataSkillsCount = dataSkills.length;
const dataItems = $dataItems;
const dataItemsCount = dataItems.length;
const dataWeapons = $dataWeapons;
const dataWeaponsCount = dataWeapons.length;
const dataArmors = $dataArmors;
//const dataArmorsCount = dataArmors.length;
const dataStates = $dataStates;
const dataStatesCount = dataStates.length;

for (let i = 401; i < dataSystemSwitchesCount; i++) {
  const value1 = dataSystemSwitches[i];
  if( value1.match(/NoReset/) || value1.match(/QReset/) || value1.match(/OReset/) || value1.match(/SReset/) ){}else{
    gameSwitches.setValue(i,false);
}};
for (let i = 501; i < dataSystemVariablesCount; i++) {
  const value1 = dataSystemVariables[i];
  if( value1.match(/NoReset/) || value1.match(/QReset/) || value1.match(/OReset/) || value1.match(/SReset/) ){}else{
    gameVariables.setValue(i,0);
}};
if(gameVariables.value(183)[1] == 0){
  for (let i = 1; i < dataSystemSwitchesCount; i++) {
    if(dataSystemSwitches[i].match(/シーン達成/) || dataSystemSwitches[i].match(/SReset/)){
      gameSwitches.setValue(i,false);
  }};
  for (let i = 1; i < dataSystemVariablesCount; i++) {
    if(dataSystemVariables[i].match(/シーン達成/) || dataSystemVariables[i].match(/SReset/)){
      gameVariables.setValue(i,0);
  }};
  for (let i = 1; i < dataSkillsCount; i++) {
    if(dataSkills[i].meta['SceneFactorClearReset']){
      for (let j = gameVariables.value(75); j <= gameVariables.value(76); j++) {
        const actor = gameActors.actor(j);
        if(actor.isLearnedSkill(i)){
          if(dataSkills[i].meta['Max Mastery Level']){
            actor.setSkillMasteryLevel(i, 0);
          };
          actor.forgetSkill(i);
  }}}};
  for (let i = 1; i < dataStatesCount; i++) {
    if(dataSkills[i].meta['SceneFactorClearReset']){
      for (let j = gameVariables.value(75); j <= gameVariables.value(76); j++) {
        const actor = gameActors.actor(j);
        if(actor.isStateAffected(i)){
          actor.removeState(i);
  }}}};
  for (let i = 1; i <= dataItems.length-1; i++) {
    if(dataItems[i].meta['DungeonInformation']){
      gameParty.gainItem(dataItems[i], -9999);
    };
    if(dataItems[i].meta['SceneFactorClearReset']){
      gameParty.gainItem(dataItems[i], -9999);
    };
  };
  for (let i = 1; i < dataWeaponsCount; i++) {
    if(dataWeapons[i].meta['SceneFactorClearReset']){
      gameParty.gainItem(dataWeapons[i], -9999);
    };
  };
  for (let i = 1; i <= valueArmorsLength; i++) {
    if(dataArmors[i].meta['SceneFactorClearReset']){
      gameParty.gainItem(dataArmors[i], -9999);
  }};
};
if(gameVariables.value(183)[2] == 0){
  for (let i = 1; i < dataSystemSwitchesCount; i++) {
    if(dataSystemSwitches[i].match(/挿話達成/) || dataSystemSwitches[i].match(/OReset/)){
      gameSwitches.setValue(i,false);
  }};
  for (let i = 1; i < dataSystemVariablesCount; i++) {
    if(dataSystemVariables[i].match(/挿話達成/) || dataSystemVariables[i].match(/OReset/)){
      gameVariables.setValue(i,0);
  }};
};
if(gameVariables.value(183)[3] == 0){
  for (let i = 1; i < dataItemsCount; i++) {
    if(dataItems[i].meta['EICSwitch']){
      if(Number(dataItems[i].meta['EICSwitch']) == 103){
        gameParty.gainItem(dataItems[i], -1);
}}}};
if(gameVariables.value(183)[4] == 0){
  for (let i = 1; i < dataItemsCount; i++) {
    if(dataItems[i].meta['EICSwitch']){
      if(Number(dataItems[i].meta['EICSwitch']) == 102){
        gameParty.gainItem(dataItems[i], -1);
}}}};
if(gameVariables.value(183)[5] == 0){
  for (let i = 1; i < dataItemsCount; i++) {
    if(dataItems[i].meta['SG種別']){
      if(Number(dataItems[i].meta['SG種別']) == 1){
        gameParty.gainItem(dataItems[i], -1);
  }}};
  for (let i = 1; i < dataSystemSwitchesCount; i++) {
    if(dataSystemSwitches[i].match(/QReset/)){
      gameSwitches.setValue(i,false);
  }};
  for (let i = 1; i < dataSystemVariablesCount; i++) {
    if(dataSystemVariables[i].match(/QReset/)){
      gameVariables.setValue(i,0);
  }};
};
if(gameVariables.value(183)[6] == 0){
  gameVariables.setValue(52,Array(1001).fill(0));
};
if(gameVariables.value(183)[7] == 0){
  for (let i = 1; i < dataItemsCount; i++) {
    if(dataItems[i].meta['BattleMapInformation']){
      gameParty.gainItem(dataItems[i], -9999);
}}};
const var75 = gameVariables.value(75);
const var76 = gameVariables.value(76);
if(gameVariables.value(183)[8] == 0){
  gameParty.clearRecord();
  for (let j = var75; j <= var76; j++) {
    gameActors.actor(j).clearBattleRecord();
  };
};
//<EventFactorClearReset>
for (let i = 1; i < dataSkillsCount; i++) {
  if(dataSkills[i].meta['EventFactorClearReset']){
    for (let j = var75; j <= var76; j++) {
      const actor = gameActors.actor(j);
      if(actor.isLearnedSkill(i)){
        if(dataSkills[i].meta['Max Mastery Level']){
          actor.setSkillMasteryLevel(i, 0);
        };
        actor.forgetSkill(i);
      };
}}};
for (let i = 1; i < dataStatesCount; i++) {
  if(dataStates[i].meta['EventFactorClearReset']){
    for (let j = var75; j <= var76; j++) {
      const actor = gameActors.actor(j);
      if(actor.isStateAffected(i)){
        actor.removeState(i);
      };
}}};
for (let i = 1; i < dataItemsCount; i++) {
  if(dataItems[i].meta['EventFactorClearReset']){
    gameParty.gainItem(dataItems[i], -9999);
}};
for (let i = 1; i < dataWeaponsCount; i++) {
  if(dataWeapons[i].meta['EventFactorClearReset']){
    gameParty.gainItem(dataWeapons[i], -9999);
}};
for (let i = 1; i <= valueArmorsLength; i++) {
  if(dataArmors[i].meta['EventFactorClearReset']){
    gameParty.gainItem(dataArmors[i], -9999);
}};

};

//バトルレコード一覧
actor_battleRecordDisplay1 = function(){

valueBattleRecordMVP = Array(11).fill(0);
var arr1 = [];var arr2 = [];var arr3 = [];var arr4 = [];
var arr5 = [];var arr6 = [];var arr7 = [];var arr8 = [];
for (var i = 0; i <= $gameParty.members().length-1; i++) {
  var value1 = $gameParty.members()[i]._actorId;
  var actor = $gameActors.actor(value1);
  arr1.push(actor.getAllKillEnemyCounter());
  arr2.push(actor.attackDamageMax);
  arr3.push(actor.attackDamageSum);
  arr4.push($gameVariables.value(380 + value1)[68]);
  arr5.push($gameVariables.value(380 + value1)[67]);
  arr6.push(actor.acceptDamageMax);
  arr7.push(actor.acceptDamageSum);
  arr8.push(actor.deadCounter);
};
var max1 = arr1.reduce(function(a,b){  
return Math.max(a,b);
});
valueBattleRecordMVP[1] = max1;
var max2 = arr2.reduce(function(a,b){  
return Math.max(a,b);
});
valueBattleRecordMVP[2] = max2;
var max3 = arr3.reduce(function(a,b){  
return Math.max(a,b);
});
valueBattleRecordMVP[3] = max3;
var max4 = arr4.reduce(function(a,b){  
return Math.max(a,b);
});
valueBattleRecordMVP[4] = max4;
var max5 = arr5.reduce(function(a,b){  
return Math.max(a,b);
});
valueBattleRecordMVP[5] = max5 /2;
var max6 = arr6.reduce(function(a,b){  
return Math.max(a,b);
});
valueBattleRecordMVP[6] = max6;
var max7 = arr7.reduce(function(a,b){  
return Math.max(a,b);
});
valueBattleRecordMVP[7] = max7;
var max8 = arr8.reduce(function(a,b){  
return Math.max(a,b);
});
valueBattleRecordMVP[8] = max8;

var value1 = `\\C[10]☆Battle Record\\C[0]\nTotalKill\nMaxAssalt\nTotalAssalt\nCritical\nOverKill\nMaxDamage\nTotalDamage\nDefead\n`;
value1 += `\\C[10]☆Skill Count\\C[0]\nAttack\nS-Ability\nA-Ability\nW-Ability\nR-Ability\nBurst!\nChain!`;
WindowManager.show(1, 10, 100, 250, 668);
WindowManager.drawText(1, value1);
var value2 = 2;
var value3 = 260;
const dataSkillsCount = $dataSkills.length;
const gamePartyMembersCount = $gameParty.members().length;
const partyMembers = $gameParty.members();
  for (var i = 0; i < gamePartyMembersCount; i++) {
    if(i == 4) break;
	const valueBattleRecord_i = "valueBattleRecord_" + i;
    eval("valueBattleRecord_" + i + " = Array(21).fill(-1)");
    var actor = partyMembers[i];
	const evalValueBattleRecord_i = eval("valueBattleRecord_" + i);
    evalValueBattleRecord_i[0] = `\\C[1]${actor.name()}\\C[0]\n`;
    evalValueBattleRecord_i[1] = actor.getAllKillEnemyCounter();
    evalValueBattleRecord_i[2] = actor.attackDamageMax;
    evalValueBattleRecord_i[3] = actor.attackDamageSum;
    evalValueBattleRecord_i[4] = $gameVariables.value(380 + actor.actorId())[68];
    evalValueBattleRecord_i[5] = $gameVariables.value(380 + actor.actorId())[67] / 2;
    evalValueBattleRecord_i[6] = actor.acceptDamageMax;
    evalValueBattleRecord_i[7] = actor.acceptDamageSum;
    evalValueBattleRecord_i[8] = actor.deadCounter;
    evalValueBattleRecord_i[10] = `────`
    for (var j = 11; j <= 17; j++) {evalValueBattleRecord_i[j] = 0};
      for (var j = 1; j < dataSkillsCount; j++) {
        if (!$dataSkills[j].name == '') {
		  const skillStypeId = $dataSkills[j].stypeId; 
          if(skillStypeId == 2){evalValueBattleRecord_i[11] += actor.getSkillUseCounter(j)};
          if(skillStypeId == 5){evalValueBattleRecord_i[12] += actor.getSkillUseCounter(j)};
          if(skillStypeId == 6){evalValueBattleRecord_i[13] += actor.getSkillUseCounter(j)};
          if(skillStypeId == 7){evalValueBattleRecord_i[14] += actor.getSkillUseCounter(j)};
          if(skillStypeId == 8){evalValueBattleRecord_i[15] += actor.getSkillUseCounter(j)};
          if(skillStypeId == 12){evalValueBattleRecord_i[16] += actor.getSkillUseCounter(j)};
          if(skillStypeId == 13){evalValueBattleRecord_i[17] += actor.getSkillUseCounter(j)};
        };
      };
      for (var j = 1; j <= 20; j++) {
        if(evalValueBattleRecord_i[j] != -1){
　　  　 if(j >= 1 && j <= 8){
           if(evalValueBattleRecord_i[j] >= 1 && evalValueBattleRecord_i[j] >= valueBattleRecordMVP[j]){
             evalValueBattleRecord_i[0] += `\\I[676]\\C[2]`;
           };
         };
          if(evalValueBattleRecord_i[j] >= 1000000000){
            evalValueBattleRecord_i[0] += `\\fs[22]${evalValueBattleRecord_i[j].toLocaleString()}\\C[0]\\fs[28]\n`;
          } else {
            evalValueBattleRecord_i[0] += `${evalValueBattleRecord_i[j].toLocaleString()}\\C[0]\n`;
          };
        };
      };
    WindowManager.show(value2, value3, 100, 250, 668);
    WindowManager.drawText(value2, evalValueBattleRecord_i[0]);
    WindowManager.show(value2+1, value3+10+30, 20, 170, 80);
    WindowManager.drawPicture(value2+1, "/img/battlehud/Face_" + actor.actorId());
    value2 += 2;
    value3 += 250;
};

};

//コンフィグ時に全般情報表示
config_display = function() {
var value2 = `\\V[58]日目<\\V[55]> \\V[141]\n`;
var value1 = `\\C[16]Party Record\\C[0]\n`;
value1 += `\\I[266]\\V[16]/\\V[13]\n`;
value1 += `F.Seed   :\\V[57]\n`;
let cur = $gameVariables.value(321)[0];
let max = $gameVariables.value(321)[1];
value1 += `S.Scene  :${cur}/${max}\n`;
cur = $gameVariables.value(322)[0];
max = $gameVariables.value(322)[1];
value1 += `H.Scene  :${cur}/${max}\n`;
cur = $gameVariables.value(323)[0];
max = $gameVariables.value(323)[1];
value1 += `Title    :${cur}/${max}\n`;
cur = $gameVariables.value(324)[0];
max = $gameVariables.value(324)[1];
value1 += `H.Title  :${cur}/${max}\n`;
cur = $gameVariables.value(325)[0];
max = $gameVariables.value(325)[1];
value1 += `Quest    :${cur}/${max}\n`;
value1 += `PartySize:\\V[54]\n`;
value1 += `Battle   :\\V[46]\n`;
value1 += `Victory  :\\V[47]\n`;
value1 += `Defeat   :\\V[48]\n`;
cur = $gameSystem.escapeCount();
value1 += `Escape   :${cur}\n`;
value1 += `TotalKill:\\V[43]\n\n`;

var value3 = `\\C[16][発動中の称号効果]\\C[0]\n`;
const itemIndexesCount = $gameVariables.value(289);
const ItemIndexes = $gameVariables.value(288);
for (let i = 0; i < itemIndexesCount; i++) {
	const itemIndex = ItemIndexes[i];
	if (itemIndex == 0) {
		value3 += `Empty\n`;
	} else {
		const itemName = $dataItems[itemIndex].name;
		value3 += `\\C[2]${itemName}\\C[0]\n`;
	}
}

WindowManager.show(1, 0, 0, 800, 68);
WindowManager.drawText(1, `\\fs[25]${value2}`);
WindowManager.show(2, 410, 68, 390, 520);
WindowManager.drawText(2, value3);

const id1 = 101;
$gameScreen.setDTextPicture(value1, 25);
$gameScreen.dWindowFrame = 'ON';
$gameScreen.showPicture(id1, "", 0, 810, 80, 100, 100, 255, 0);
$gameMessage.setSelectPictureId(0, 101);
};

//会話時に実行
talk_script = function(){

var id1 = 86;
if($gameScreen.picture(id1)){
  var value1 = $gameScreen.picture(id1).name();
  var value1 = value1.replace("/img/talkface/", "")
  var value2 = value1.charAt(0);
  var value3 = value1.charAt(1);
    if(Number(value3)){
      value2 += String(value3);
    };
} else {
  var value2 = $gameVariables.value(20);
};
var value4 = $gameMessage._IZSTPicMoveParam[1];
if(Number(value2) == $gameVariables.value(20)){
  var value1 = $gameVariables.value(20)+'Actor_' + valueFaceSelect;
  pic_locationSet(91,91,"/img/talkface/"+value1,1,0);
  //$gameSwitches.setValue(436,true);
  //battle_bustUp(id1,$gameMessage._IZSTPicMoveParam[0]-640,value4-384,1);
  //$gameSwitches.setValue(436,false);
} else {
  $gameSwitches.setValue(436,true);
  battle_bustUp(101,100,value4-384,30);
  $gameSwitches.setValue(436,false);
};

};

//変動する特徴設定
trait_changeSetting = function(id1){

if(id1 == 106){//信仰バフ
  var valueItems = $dataStates[id1];
  valueItems.traits = [];
  var value1 = $gameVariables.value(631) / 100000;
    for (var i = 2; i <= 7; i++) {
      valueItems.traits.push({code: 21, dataId: i, value: 1 + value1});
    };
    if(valueItems.meta['Help Description']){
      if(valueItems.meta['AddDWord']){
        var value2 = `${valueItems.meta['AddDWord']}`;
      } else {
        var value2 = ` `;
      };
      valueItems.description = `\\sim[${id1}]:${value2}\n\\I[659]+${value1 * 100}%`;
    };
};
if(id1 == 107){//食事バフ,10まで
  var valueItems = $dataStates[id1];
  valueItems.traits = [];
  var arr2 = $gameVariables.value(620);
  var value3 = 0;
  var value4 = ``;
  if(arr2.length >= 1){
    for (var i = 0; i <= arr2.length-1; i++) {
      var arr1 = arr2[i];
      var value1 = Number(arr1[2]);
      var value10 = ``;
      if(Number(arr1[0])==0){
        value10 += TextManager.param(Number(arr1[1]));
        value10 += `\\C[10]${Number(arr1[2])*100}%\\C[0]UP!`;
      };
      if(Number(arr1[0])==1){
        value10 += FTKR.CSS.cssStatus.xparam[Number(arr1[1])];
        value10 += `\\C[10]${Number(arr1[2])*100}%\\C[0]UP!`;
      };
      if(Number(arr1[0])==2){
        value10 += FTKR.CSS.cssStatus.sparam[Number(arr1[1])];
        value10 += `\\C[10]${Number(arr1[2])*100}%\\C[0]UP!`;
      };
      if(Number(arr1[0])==3){
        value10 += `${$dataSystem.elements[Number(arr1[1])]}威力`;
        if(Number(arr1[2])>=0){
          value10 += `\\C[10]${Number(arr1[2])}%UP!\\C[0]`;
        }else{
          value10 += `\\C[1]${Number(arr1[2])}%DOWN!\\C[0]`;
        };
       };
       if(Number(arr1[0])==4){
         value10 += `${$dataSystem.elements[Number(arr1[1])]}`;
         if([10,11,12,15,20,38,39,40,41].some(function(id1){return id1 == Number(arr1[1])})){
           if(Number(arr1[1])==11){
             var value2 = `10`;
           }else{
             var value2 = `100`;
           };
           if(value1>=0){
             value10 += `\\C[10]${Number(arr1[2])*value2}%\\C[0]UP!`;
           }else{
             value10 += `\\C[1]${Number(arr1[2])*value2}%\\C[0]DOWN!`;
           };
        }else{
          value10 += `耐性`;
          if(Number(arr1[1])==11){
            var value2 = `10`;
          }else{
            var value2 = `100`;
          };
          if(value1<=0){
            var value1 = value1 - value1 - value1;
            value10 += `\\C[1]${Number(arr1[2])*value2}%\\C[0]DOWN!`;
          }else{
            value10 += `\\C[10]${Number(arr1[2])*value2}%\\C[0]UP!`;
          };
        };
      };
      if(Number(arr1[0])==0){
        valueItems.traits.push({code:21,dataId:Number(arr1[1]),value:1+value1});
      };
      if(Number(arr1[0])==1){
        valueItems.traits.push({code:22,dataId:Number(arr1[1]),value:value1});
      };
      if(Number(arr1[0])==2){
        valueItems.traits.push({code:23,dataId:Number(arr1[1]),value:1+value1});
      };
      if(Number(arr1[0])==3){valueAttackAmplifysActorId[actor.actorId()][Number(arr1[1])]+=Number(arr1[2])};
      if(Number(arr1[0])==4){
        var value1 = value1 - value1 - value1;
        valueItems.traits.push({code:11,dataId:Number(arr1[1]),value:1+value1});
      };
      value4 += `[${value10}] `;
      value3 += 1;
      if((value3 %5) == 0){
        value4 += `\n`;
      };
    };
    valueItems.description = `\\sim[${id1}]:時間経過で解除。\n${value4}`;
  };
};
$gamePlayer.refresh();

};

//ミニステでインフォＹ軸補正値変更info_SetY($gameVariables.value(200));
info_SetY = function(id1){

if(id1 == 1){valueInfoY = 0}
else if(id1 == 2){valueInfoY = -100}
else if(id1 == 3){valueInfoY = -100}
else if(id1 == 4){valueInfoY = -100}
else if(id1 == 5){valueInfoY = 0};

};

//tipsを纏めて閲覧
tips_select = function(){

var value1 = 101;
for (var i = 0; i <= $gameVariables.value(532).length-1; i++) {
  var arr1 = $gameVariables.value(532);
  const id = 1; 
  var value3 = arr1[i];
  if(value3.length >= 14){
    var value3 = value3.substring(0, 14);
  };
  const choiceParams = {
  text: `\\fs[20]${value3}\\fs[28]`,
  value: i+1};
  $gameSystem.addCustomChoice(id, choiceParams);
  if($gameVariables.value(533)[i] != 0){
    $gameScreen.setDTextPicture(`\\C[16]${arr1[i]}\\C[0]:\n${$gameVariables.value(533)[i]}`, 28);
    $gameScreen.dWindowFrame = 'ON';
    $gameScreen.showPicture(i + value1 + 1,'',0,334,10,100,100,255,0);
    $gameMessage.setSelectPictureId(i, i + value1 + 1);
  };
  if($gameVariables.value(534)[i][0] != 0){
    //$gameScreen.showPicture(i + value1,$gameVariables.value(534)[i][0],$gameVariables.value(534)[i][1],
    //$gameVariables.value(534)[i][2]+334-100-50,$gameVariables.value(534)[i][3],
    //$gameVariables.value(534)[i][4],$gameVariables.value(534)[i][5],$gameVariables.value(534)[i][6],0);
    $gameScreen.showPicture(i + value1,$gameVariables.value(534)[i][0],0,334,0,100,100,255,0);
    $gameMessage.setSelectPictureId(i, i + value1);
  };
  value1 += 2;
};

};

//ダンジョンから脱出スクリプト
dungeon_escape = function(){

if($gameVariables.value(240) >= 1){
  var arr1 = $dataItems[$gameVariables.value(240)].meta['EscapeMapID'].split(',');
  $gameVariables.setValue(161,[Number(arr1[0]),Number(arr1[1]),Number(arr1[2])]);
  set_playerPosition2(161);
} else {
  $gameVariables.setValue(161,[14,26,7]);
  set_playerPosition2(161);
};

};

//街から外に出るスクリプト
town_escape = function(){

$gameVariables.setValue(520,Array(21).fill(0));
for (var i = 0; i < $gameParty.members().length; i++) {
  if(is_girl($gameParty.members()[i])){
    var value1 = $gameParty.members()[i].actorId();
    if($gameVariables.value(230) >= 1){
      if($dataWeapons[$gameVariables.value(230)].meta['PermissionCloth']){
        if($gameVariables.value(440 + value1)[41] == Number($dataWeapons[$gameVariables.value(230)].meta['PermissionCloth'])){
          if($gameVariables.value(380 + value1)[5] > $gameVariables.value(380 + value1)[4]){
            $gameVariables.value(520)[value1] = Number($dataWeapons[$gameVariables.value(230)].meta['PermissionCloth']);
}}}}}};
var value4 = 204;
var value1 = $gameVariables.value(value4)[0];
var value2 = $gameVariables.value(value4)[1];
var value3 = $gameVariables.value(value4)[2];
if(value1 >= 1){
  $gamePlayer.reserveTransfer(value1, value2, value3, 2, 2);
} else {
  $gamePlayer.reserveTransfer(14, 2, 2, 2, 2);
};

};

//指定衣装OKな町から出た後、次マップで露出超過なら通常衣装に戻すスクリプト。マップ最初イベントで実行
town_startPermissionClothChange = function(){

var value1 = 0;
for (var i = 0; i < $gameVariables.value(520).length; i++) {
  if($gameVariables.value(520)[i] >= 1){
    if($gameVariables.value(230) >= 1){
      if($dataWeapons[$gameVariables.value(230)].meta['PermissionCloth']){
        if($gameVariables.value(520)[i] == Number($dataWeapons[$gameVariables.value(230)].meta['PermissionCloth'])){
          var value1 = 1;
          break;
}}}}};
if(value1 == 0){
  for (var i = 0; i < $gameVariables.value(520).length; i++) {
    if($gameVariables.value(520)[i] >= 1){
      var value2 = $gameVariables.value(520)[i];
      $gameVariables.setValue(20,value2);
      var actor = $gameActors.actor($gameVariables.value(20));
      if($dataActors[$gameVariables.value(20)].meta['MainCloth']){
        $gameVariables.setValue(19,Number($dataActors[$gameVariables.value(20)].meta['MainCloth']));
        kisekae_tyokusetusitei($gameVariables.value(19),0);
        var value3 = `${actor.name()}は\x1bIIN[${$gameVariables.value(19)}]に着替えた。`;
        CommonPopupManager.showInfo({},value3,null);
      };
}}};
$gameVariables.setValue(520,Array(21).fill(0));

};

//ダンジョンワプ機能スクリプト<warpShare:1>
dungeon_warpscript = function(id1){

if(id1 == 1){
  $gameSwitches.setValue(380,false);
  if($dataItems[$gameVariables.value(240)].meta['warpShare']){
    for (var j = 1; j <= $dataWeapons.length-1; j++) {
      if($dataItems[j].meta['warpShare']){
        if(Number($dataItems[j].meta['warpShare']) == Number($dataItems[$gameVariables.value(240)].meta['warpShare'])){
          if($dataItems[j].meta['warpStart']){
            valueScriptArray1.push($dataItems[j].meta['warpStart'].split(','));      
          };
          for (var i = 1; i <= 9; i++) {
            if($dataItems[j].meta['warpPoint' + i]){
              if($gameVariables.value(211)[j][i] == 1){
                valueScriptArray1.push($dataItems[j].meta['warpPoint' + i].split(','));      
                $gameSwitches.setValue(380,true);
            }};
          };
        };
      };
    };
  } else {
    if($dataItems[$gameVariables.value(240)].meta['warpStart']){
      valueScriptArray1.push($dataItems[$gameVariables.value(240)].meta['warpStart'].split(','));      
    };
    for (var i = 1; i <= 9; i++) {
      if($dataItems[$gameVariables.value(240)].meta['warpPoint' + i]){
        if($gameVariables.value(211)[$gameVariables.value(240)][i] == 1){
          valueScriptArray1.push($dataItems[$gameVariables.value(240)].meta['warpPoint' + i].split(','));
          $gameSwitches.setValue(380,true);
      }};
    };
  };
};

};

//文字ランダム作成
text_randumWord = function(id3,id1,id2,arr1,arr2,arr3,arr4){

$gameVariables.setValue(id3,`\\AT[${id1}]`);
for (var i = 1; i <= id2; i++) {
  var value1 = arr1[Math.floor(Math.random() * arr1.length)];
  var value2 = arr2[Math.floor(Math.random() * arr2.length)];
  var value3 = arr3[Math.floor(Math.random() * arr3.length)];
  if(value2 == ` `){
    var value4 = Math.floor( Math.random() * 11);
    var value4 = -value4;
  } else {
    if(value2 == `\\C[27]♥\\C[0]` || value2 == `\\C[27]♡\\C[0]`){
      var value4 = Math.floor( Math.random() * 6);
    } else {
      var value4 = arr4[Math.floor(Math.random() * arr4.length)];
      if(value3 >= 40){
        value4 += Math.ceil(value3 / 4);
      };
    };
  };
  //var value1 = `${value1}\\MY[0]`;
  $gameVariables.setValue(id3,$gameVariables.value(id3) + `\x1bfs[${value3}]${value1}${value2}\\MX[${-value4}]`);//
};
if(id2 >= 20){
  $gameVariables.setValue(id3,$gameVariables.value(id3) + `\n`);
  for (var i = 1; i <= id2; i++) {
    var value1 = arr1[Math.floor(Math.random() * arr1.length)];
    var value2 = arr2[Math.floor(Math.random() * arr2.length)];
    var value3 = arr3[Math.floor(Math.random() * arr3.length)];
  if(value2 == ` `){
    var value4 = Math.floor( Math.random() * 11);
    var value4 = -value4;
  } else {
    if(value2 == `\\C[27]♥\\C[0]` || value2 == `\\C[27]♡\\C[0]`){
      var value4 = Math.floor( Math.random() * 6);
    } else {
      var value4 = arr4[Math.floor(Math.random() * arr4.length)];
      if(value3 >= 40){
        value4 += Math.ceil(value3 / 4);
      };
    };
  };
  $gameVariables.setValue(id3,$gameVariables.value(id3) + `\x1bfs[${value3}]${value1}${value2}\\MX[${-value4}]`);//
  };
};
//Graphics.loadFont("GameFont","fonts/eromangasimaji.otf");

};

//２回目以降殲滅時にボーナス
annihilationItem_bonus = function(){

if($dataItems[$gameVariables.value(240)].meta['TchestType']){
  var arr1 = [];
  var arr2 = [];
  //arr1.push($dataItems[$gameVariables.value(240)].meta['TchestType'].split(','));
  //arr2.push($dataItems[$gameVariables.value(240)].meta['Tchest'].split(','));
  arr1 = arr1.concat($dataItems[$gameVariables.value(240)].meta['TchestType'].split(','));
  arr2 = arr2.concat($dataItems[$gameVariables.value(240)].meta['Tchest'].split(','));
  if($dataItems[$gameVariables.value(240)].meta['firstAnnihilationItem']){
    var arr3 = $dataItems[$gameVariables.value(240)].meta['firstAnnihilationItem'].split(',');
    //arr1.push(Number(arr3[0]));
    //arr2.push(Number(arr3[1]));
    arr1 = arr1.concat(Number(arr3[0]));
    arr2 = arr2.concat(Number(arr3[1]));
  };
  if($dataItems[$gameVariables.value(240)].meta['TchestOnly']){
    var arr4 = $dataItems[$gameVariables.value(240)].meta['TchestOnly'].split(',');
    //arr1.push(Number(arr4[3]));
    //arr2.push(Number(arr4[4]));
    arr1 = arr1.concat(Number(arr4[3]));
    arr2 = arr2.concat(Number(arr4[4]));
  };
  var value1 = arr2[Math.floor(Math.random() * arr2.length)];
  let index = arr2.findIndex(arr2 => arr2 == value1); 
  const valueItems = get_valueItems_iwa(arr1[index]);
  $gameParty.gainItem(valueItems[Number(arr2[index])], 1);
  valueWordSet1 = `全滅ボーナスとして\\C[24]\x1bI[${valueItems[Number(arr2[index])].iconIndex}]${valueItems[Number(arr2[index])].name}\\C[0]を入手した！`;
  if($dataItems[$gameVariables.value(240)].meta['TchestRere']){
    if( Number(arr2[index]) == Number($dataItems[$gameVariables.value(240)].meta['TchestRere']) ){
      $gameSwitches.setValue(439,true);
  }};
  if($dataItems[$gameVariables.value(240)].meta['firstAnnihilationItem']){
    if( Number(arr2[index]) == Number(arr3[1]) ){
      $gameSwitches.setValue(439,true);
  }};
  if($dataItems[$gameVariables.value(240)].meta['TchestOnly']){
    if( Number(arr2[index]) == Number(arr4[4]) ){
      $gameSwitches.setValue(439,true);
  }};
};

};

//文字ピクチャを座標指定して表示しっぱなしpictureText_SetUp(1,100,`ジュク…っ\\I[12]`,28,640,384,180,'eromangasimaji')
pictureText_SetUp = function(id1,value1,value2,value3,value4,value5,value6,value7){

if(id1 == 1){
  curveFunctions.patternScaleX = curveFunctions.getPattern('jump', [100]);
  curveFunctions.patternScaleY = curveFunctions.getPattern('jump', [100]);
  if(value7 != 0){
    $gameScreen.setDtextFont(value7);
  };
  $gameScreen.dTextAlign = 0;
  $gameScreen.dWindowFrame = 'ON';
  $gameScreen.dTextRealTime = 'ON';
  $gameScreen.setDTextPicture(value2, value3);
  $gameScreen.showPicture(value1,'',1,value4,value5,0,0,0,0);
  $gameScreen.movePicture(value1,1,value4,value5,100,100,255,0,value6);
} else {
  $gameScreen.setDtextFont('ＭＳ Ｐ明朝');
  picture_motion1("smooth",[0]);
  pic_eraseP(0,[value1]);
};

};

//エネミーステートでドロップ
//enemy_drop = function(user,enemy){
//};

  learn_show_eval_is_notlearned_added_contains = function (user, skillId) {
    return !user.isLearnedSkill(skillId) && user.addedSkills().contains(skillId);
  };

  learn_show_eval_mastery_moreorequalof = function (user, skillId, minSkillMasteryLevel) {
    return user.skillMasteryLevel(skillId) >= minSkillMasteryLevel;
  };

  learn_show_eval_notmax_or_islearned = function (user, skillId) {
    if (user.skillMasteryLevel(skillId) >= Number($dataSkills[skillId].meta['Max Mastery Level'])) {
      return false;
    } else return user.isLearnedSkill(skillId);
  };

  learn_show_eval_is_notlearned_max_addedcontains_reqskill = function (user, skillId, reqSkillId) {
    if (user.isLearnedSkill(skillId)) {
      return false;
    } else {
      if (user.skillMasteryLevel(skillId) >= Number($dataSkills[skillId].meta['Max Mastery Level']) &&
        user.addedSkills().contains(skillId) && user.isLearnedSkill(reqSkillId)) {
        return true;
      } else {
        return false;
      };
    };
  };

  commonEvents_setVar474_by_var135_mapId = function (var135val, mapId, event_pararelStarting_param2) {
    if ($gameVariables.value(135) == var135val) {
      if ($gameMap.mapId() == mapId) {
        event_pararelStarting(0, event_pararelStarting_param2, 0);
        $gameSwitches.setValue(474, true);
      };
    };
  };

  commonEvents_setVar474_by_var135_mapId_1 = function (var135val, mapId, switchId, event_pararelStarting_param2) {
    if ($gameVariables.value(135) == var135val) {
      if ($gameMap.mapId() == mapId) {
        if ($gameSwitches.value(switchId)) {//ｶﾞｰﾃﾞｨｱﾝ勝利
          event_pararelStarting(0, event_pararelStarting_param2, 0);
          $gameSwitches.setValue(474, true);
        }
      }
    }
  }

  scene_joukenNakami_clean_prefixes = function (text) {

    return text
      .replace("[daysReset]", "")
      .replace("[NoReset]", "")
      .replace("[夜自動]", "")
      .replace("[シーン達成]", "")
      .replace("[挿話達成]", "");
  }

  get_valueItems_iwa = function (id) {
    switch (Number(id)) {
      case 1:
        return $dataWeapons;
      case 2:
        return $dataArmors;
      default:
        return $dataItems;
    }
  }

  get_valueItems_sis = function (id) {
    switch (Number(id)) {
      case 0:
        return $dataSkills;
      case 1:
        return $dataItems;
      case 2:
        return $dataStates;
      default:
        console.error(`get_valueItems_sis: id(${id}}) is not 0,1,2!`);
        return null;
    }
  }

  is_girl = function (actor) {
    return actor.isStateAffected(602);
  }

  isInBattle = function () {

    const inBattleSwitch = $gameSwitches.value(30);
    if ($gameParty.inBattle() == inBattleSwitch){
      console.warn(`isInBattle: inBattleSwitch is ${inBattleSwitch} and is equal to $gameParty.inBattle()!`);
    }
    else{
      console.warn(`isInBattle: inBattleSwitch is ${inBattleSwitch} and is NOT equal to $gameParty.inBattle()!`);
    }

    return inBattleSwitch; // in battle game switch, for some reason using instead of $gameParty.inBattle();
  }

  // CommonEvents
  configureCommonEvents = function (start, end, switchIdOffset) {
    for (let i = start; i <= end; i++) {
      const cEv = $dataCommonEvents[i];
      cEv.trigger = 2;
      if ($dataItems[i].meta['AutoEvent']) cEv.trigger = 1;
      cEv.switchId = switchIdOffset + i;
    }
  }
  
  initializeVersionSettings = function () {
    //$gameSwitches.setValue(4,true)//体験版on
    $gameSwitches.setValue(4, false)//製品版on
    //$gameSwitches.setValue(53,true)//デバッグon
    //$gameSwitches.setValue(53,false)//デバッグoff
    $gameVariables.setValue(61, 'りしゃぶるVer1.49')
  }

  setNPCInfo = function (gameVarId, metaKey, substitutionCallback) {
    // Initialize the game variable array with 101 zeroes.
    $gameVariables.setValue(gameVarId, Array(101).fill(0));

    // Loop over the weapons indices 301–400.
    for (let i = 301; i <= 400; i++) {
      // Only process if the weapon has a non‐empty name.
      const weapon = $dataWeapons[i];
      if (weapon.name !== '') {
        // If there is a substitution actor id, use the provided callback.
        if (weapon.meta['SubstitutionActorId']) {
          const value1 = Number(weapon.meta['SubstitutionActorId']);
          $gameVariables.value(gameVarId)[i - 300] = substitutionCallback(value1);
        }
        // If the override meta value exists, it takes precedence.
        if (weapon.meta[metaKey]) {
          $gameVariables.value(gameVarId)[i - 300] = weapon.meta[metaKey];
        }
      }
    }
  }
  SetNPCFamilyName = function () {
    setNPCInfo(354, 'FamilyName', function (actorId) { return $dataWeapons[actorId + 200].name; });
  }
  SetNPCProfession = function () {
    setNPCInfo(353, 'Profession', function (actorId) { return $gameVariables.value(actorId + 380)[59]; });
  }
  setItemSGType2GlossaryText123 = function () {
    var start = 1;
    var end = $dataItems.length - 1;
    for (var i = start; i <= end; i++) {
      let itemMeta = $dataItems[i].meta['SG種別'];
      if (itemMeta && Number(itemMeta) === 2) {
        scene_Glossarytext1(i, 218);
        scene_Glossarytext2(i, 213);
        scene_Glossarytext3(i, 219);
      }
    };
  }
  
  setPartyMembersStateSwitch160 = function () {
    const statesCount = $dataStates.length;
    const partyMembers = $gameParty.members();
    const partyMembersCount = partyMembers.length;
    const gameSwitches = $gameSwitches;
    for (let i = 1; i < statesCount; i++) {
      for (let j = 0; j < partyMembersCount; j++) {
        const partyMember = partyMembers[j];
        if (partyMember.getStateCounter(i) != undefined) {
          gameSwitches.setValue(160, true);
          return;
        }
      }
    };
  }
  
  setPartyMembersStateSwitch160v2 = function () {
    const partyMembers = $gameParty.members();
    const gameSwitches = $gameSwitches;
    const stateIds = $gameVariables.value(214);

    for (let i = 0; i < stateIds.length; i++) {
      const stateId = stateIds[i];
      if (!$gameParty.membersState(stateId)) continue;

      for (let j = 0; j < partyMembers.length; j++) {
        const actor = partyMembers[j];
        if (actor.isStateAffected(stateId) && actor.getStateCounter(stateId) !== undefined) {
          gameSwitches.setValue(160, true);
          return; // Early exit for performance
        }
      }
    }
  }
  
  setupDateTime = function () {
    const timeget = new Date();
    const year = timeget.getFullYear();
    const month = timeget.getMonth() + 1;
    const day = timeget.getDay();//
    //var date = timeget.getDate();
    const hour = timeget.getHours();
    const min = timeget.getMinutes();
    const sec = timeget.getSeconds();
    $gameVariables.setValue(67, year + '/' + month + '/' + day + ' T' + hour + ':' + min + ':' + sec);
  }
  
  showMapName = function () {
    const displayName = $gameMap.displayName();
    if (displayName) {
      let name;
      const id = $gameMap.mapId();
      if (valueMapNameSpecialStaging[id] == 0) {
        name = displayName;
      } else {
        name = valueMapNameSpecialStaging[id];
        $dataMap.displayName = name;
      };
      
      const num = $gameSwitches.value(201) ? 10 : 3;
      const infoMessage = `～～\\C[${num}]${name}\\C[0]～～`;
      CommonPopupManager.showInfo({}, infoMessage, null);
    };
  }

  evStateCleanFromActors = function (actorInitId, actorEndId, stateId) {
    for (let actorId = actorInitId; actorId <= actorEndId; actorId++) {
      $gameActors.actor(actorId).removeState(stateId);
    }
  };

  //#region cev 296
  ev296RemoveTempState = function (valueTachieChangeStateTemporary, parentList) {
    const stateIds = valueTachieChangeStateTemporary;
    const start = $gameVariables.value(75);
    const end = $gameVariables.value(76);
    const gameVariables = $gameVariables;
    const members = $gameParty.members();

    // Remove temporary states from all actors
    stateIds.forEach(stateId => {
      evStateCleanFromActors(start, end, stateId);
    });

    // Restore outfit settings for party members
    const actorIds = gameVariables.value(247);
    actorIds.forEach(id => {
      const actor = $gameActors.actor(id);
      
      if (!members.contains(actor)) return;
      
      // Restore outfit variables
      for (let i = 0; i <= 42; i++) {
        gameVariables.value(id + 440)[i] = gameVariables.value(id + 540)[i];
      }

      // Update character appearance
      gameVariables.setValue(20, id);
      tachie_settei2();
    });

    // Ensure standing picture common event is properly terminated
    parentList.setupChild($dataCommonEvents[19].list, 0);
  };
  //#endregion

  //#region cev23
  ev23StateReleaseOverTime = function (parent) {
    const start = $gameVariables.value(75);
    const end = $gameVariables.value(76);
    const gameVariables = $gameVariables;

    // Process each state that has the timeRemove flag
    for (let stateId = 1; stateId < $dataStates.length; stateId++) {
      const state = $dataStates[stateId];
      if (!state.meta['timeRemove']) continue;
      
      // If any party member has this state, log its removal
      if ($gameParty.membersState(stateId)) {
        parent.sVal(539, gameVariables.value(539) + `${state.name}が解除された。\n`);
        parent.sVal(540, gameVariables.value(540) + 1);
      }
      
      // Remove the state from all actors
      evStateCleanFromActors(start, end, stateId);
    }
  };

  ev23DecreaseTPby30 = function (parent) {
    const actorIds = $gameVariables.value(248);
    const gameVariables = $gameVariables;
    
    // Reduce TP for each party member
    actorIds.forEach(actorId => {
      $gameActors.actor(actorId).gainTp(-30);
    });

    // Log the TP reduction
    parent.sVal(539, gameVariables.value(539) + `パーティメンバーのTP-30\n`);
    parent.sVal(540, gameVariables.value(540) + 1);
  };
  //#endregion

  ev23MorningDayEveningNightSwitch = function (parent) {
    // First reset all time switches
    for (let i = 13; i <= 15; i++) {
      $gameSwitches.setValue(i, false);
    }
    
    // Determine the next time of day
    let nextTimeOfDay;
    if ($gameSwitches.value(15)) {
      nextTimeOfDay = 13; // Morning (after Night)
      parent.sVal(539, $gameVariables.value(539) + `夜になりました。\n`);
      parent.sVal(540, $gameVariables.value(540) + 1);
    } else if ($gameSwitches.value(14)) {
      nextTimeOfDay = 15; // Night (after Day)
      parent.sVal(539, $gameVariables.value(539) + `昼になりました。\n`);
      parent.sVal(540, $gameVariables.value(540) + 1);
    } else {
      nextTimeOfDay = 14; // Day (after Morning)
    }
    
    // Set the next time of day
    $gameSwitches.setValue(nextTimeOfDay, true);
  };

  ev23zsumaho = function () {
    WindowManager.show(1, 0, 100, 1024, (120 + $gameVariables.value(540) * 60));
  }

  ev23showElapsedMessage = function () {
    const dayNum = $gameVariables.value(58);
    const weekNum = $gameVariables.value(55);
    TickerManager.show(`──${dayNum}日目(${weekNum}曜日)経過──`);
  }
  //#endregion

}());
