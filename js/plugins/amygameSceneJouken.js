/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){
//中身スクリプト
scene_joukenNakami = function(id1,i,value23,value24,value25,value26){

if ($dataItems[i].name.length === 0) return;

let dataItem = $dataItems[i];
let actor = $gameActors.actor($gameVariables.value(2));
let value1 = `発生条件:`;
let value2 = 0;//条件成立回数。使わない？
let value3 = 0;//発生条件。未成立でも加算
let value4 = 0;//発生条件。成立で加算
let value5 = ``;
let value6 = 0;//条件用
let value7 = 0;//一時代入用
let value12  = 0;//1でマップ発生シーン
let value13 = 1;//0でEventSetSceneが存在しないかメインクエスト進行が足りないかアクターが存在しない
let value14 = `　`;//発生シーン表示の一時代入
let value16 = 0;//EventSetSceneが存在しない場合に1
let value17 = 0;//メインクエスト進行が足りない場合に1
let value31 = 0;//実行不可の場合に1
let value40 = 0;//戦闘中か否か
let value41 = 0;//メインクエスト進行度代入用
let value42 = 4;//改行指定数
let value43 = 0;//行数カウント
let value44 = 0;//？？？表記の時にマップ名表示
let value45 = 0;//アクターが加入していない
let valueCountDefeadSwitche1 = 0;//全滅スイッチ判定

const onStatusString = `\\C[14]〇\\C[0]]`;
const offStatusString = `\\C[12]×\\C[0]]`;

//行数超過する場合にここでid毎に対応
//if(i == 401){let value42 = 4};

if(dataItem.meta['EventSetBattle']){
    value40 = Number(dataItem.meta['EventSetBattle']); 
    if(value40 == 1){
      value2 += 1;
      value5 += `[戦闘]`;
      value12 += 1;//1でマップ発生シーン
      value3 += 1;
      value4 += 1;
    }
}

//場所による条件設定value11
if(dataItem.meta['EventSetMap']){
  let value11 = Number(dataItem.meta['EventSetMap']);
  if(value11 == 0){
    value11 = 2;//EventSetMapが0の場合の代替スイッチ。変更の可能性あり？？？
    value5 += `[何処でも]`;
    value44 = `[何処でも]`;
  } else {
    value2 += 1;
    value5 += `[${$dataSystem.switches[Number(dataItem.meta['EventSetMap'])]}]`;
    value44 = `[${$dataSystem.switches[Number(dataItem.meta['EventSetMap'])]}]`;
  }
  value43 += 1;
  if($gameSwitches.value(Number(dataItem.meta['EventSetMap']))){
    value12 += 1;//1でマップ発生シーン
    value3 += 1;
    value4 += 1;
  } else {
    value3 += 1;
  }
  if($gameSwitches.value(433)){
    value12 += 1;//ヒント提示のために場所での区分けを無くしている。
  }
}

//自動起動かどうか
if(dataItem.meta['AutoStart']){
  if(Number(dataItem.meta['AutoStart']) == 1){
    value5 += `[自動発生]`;
    value43 += 1;
  }
  if(Number(dataItem.meta['AutoStart']) == 2){
    value5 += `[朝自動発生]`;
    value43 += 1;
  }
  if(Number(dataItem.meta['AutoStart']) == 3){
    value5 += `[宿泊時に自動発生]`;
    value43 += 1;
  }
}

//メインクエスト中に発生
if(dataItem.meta['EventSetOccurrenceMain']){
  if(Number(dataItem.meta['EventSetOccurrenceMain']) >= 1){
    value5 += `[メイン[${dataItem.meta['EventSetOccurrenceMain']}]進行中に発生]`;
    value43 += 1;
  }
}
if(dataItem.meta['NoteWord']){
  value5 += `[${dataItem.meta['NoteWord']}]`;
  value43 += 1;
}
if(value43 >= value42){value5 += `\n`;value43 = 0};

//視点が誰か441
if(dataItem.meta['EventSetPerspective']){
  let value6 = Number(dataItem.meta['EventSetPerspective']); 
    if(value6 >= 1){
      value2 += 1;
      if(value6 == $gameVariables.value(2)){}else{
        value5 += `[${$gameActors.actor(value6).name()}視点`;
        value43 += 1;
      }
    }
    if($gameSwitches.value(value6+440)){
      value3 += 1;
      value4 += 1;
      if(value6 == $gameVariables.value(2)){}else{value5 += onStatusString};
    } else {
      value3 += 1;
      if(value6 == $gameVariables.value(2)){}else{value5 += offStatusString};
      if(!$gameActors.actor(value6).isLearnedSkill(407)){
        value13 = 0;
        //value41 += `[要:未加入キャラ]`;
        value45 = 1;
      }
    }
}
if(value43 >= value42){value5 += `\n`;value43 = 0};

  // merged code of 2 code blocks EventSetSwi and EventNotSetSwi
  event_set_swi = function (metaName, num1, prefix, isSet) {
    if (dataItem.meta[metaName]) {
      let arr = dataItem.meta[metaName].split(',');
      for (let id = 0; id < arr.length; id++) {
        if (arr[id] == 0) {
          arr[id] = num1;
        } else {
          value2 += 1;
          value7 = $dataSystem.switches[Number(arr[id])];
          value7 = value7.replace("[daysReset]", "");
          value7 = value7.replace("[NoReset]", "");
          value7 = value7.replace("[夜自動]", "");
          value7 = value7.replace("[シーン達成]", "");
          value7 = value7.replace("[挿話達成]", "");
          value5 += `[${prefix}${value7}`;
          value43 += 1;
        }
        const switchId = Number(arr[id]);
        const isSwitch = $gameSwitches.value(switchId);
        if ((isSet && isSwitch) || (!isSet && !isSwitch)) {
          if (isSet && switchId == 83) {//全滅スイッチ
            valueCountDefeadSwitche1 = i;
          };
          value3 += 1;
          value4 += 1;
          value5 += onStatusString;
        } else {
          value3 += 1;
          value5 += offStatusString;
        }
      }
    }
    if (value43 >= value42) { value5 += `\n`; value43 = 0; }
  }

  for (const swiData of [['EventSetSwi', 2, ``, true]/*スイッチ条件*/, ['EventNotSetSwi', 1, `不可:`, false]/*スイッチoff条件。記述はスイッチを使うつど*/]){
    event_set_swi(swiData[0], swiData[1], swiData[2], swiData[3]);
  }

//アクターが存在するか
if(dataItem.meta['EventSetActor']){
let arr = dataItem.meta['EventSetActor'].split(',');
  for (let id = 0; id <= arr.length-1; id++) {
    if(Number(arr[id]) == 0){
      arr[id] = $gameVariables.value(11);//誰でもいいアクター
    } else {
      value2 += 1;
      value5 += `[${$gameActors.actor(Number(arr[id])).name()}]`;
      value43 += 1;
    };
    value6 = $gameActors.actor(Number(arr[id])).isLearnedSkill(18) && !$gameActors.actor(Number(arr[id])).isStateAffected(valueDollStateId);
    if(value6){
      value3 += 1;
      value4 += 1;
      value5 += onStatusString;
    } else {
      value3 += 1;
      value5 += offStatusString;
      if(!$gameActors.actor(Number(arr[id])).isLearnedSkill(407)){
        value13 = 0;
        //value41 += `[要:未加入キャラ]`;
        value45 = 1;
      }
    }
  }
}
if(value43 >= value42){value5 += `\n`;value43 = 0};

//アイテムが存在するか
if(dataItem.meta['ItemSetScene']){
let arr = dataItem.meta['ItemSetScene'].split(',');
  for (let id = 0; id <= arr.length-1; id++) {
    if(arr[id] != 0){
      value2 += 1;
      if($dataItems[Number(arr[id])].meta['EICSwitch']){
        if(Number($dataItems[Number(arr[id])].meta['EICSwitch']) == 102){
          value5 += `[挿話集:`;
        };
        if(Number($dataItems[Number(arr[id])].meta['EICSwitch']) == 103){
          value5 += `[シーン:`;
        };
        if(Number($dataItems[Number(arr[id])].meta['EICSwitch']) == 104){
          value5 += `[タイトル:`;
        };
        if(Number($dataItems[Number(arr[id])].meta['EICSwitch']) == 105){
          value5 += `[H'タイトル:`;
        };
      } else {
        if($dataItems[Number(arr[id])].meta['SG種別']){
          if(Number($dataItems[Number(arr[id])].meta['SG種別']) == 1){
            value5 += `[クエスト達成:`;
          };
        } else {
          value5 += `[`;
        };
      };
      value5 += `\x1bIIN[${Number(arr[id])}]`;
      value43 += 1;
      value7 = $gameParty.hasItem($dataItems[Number(arr[id])]);
      if($dataItems[Number(arr[id])].meta['EICSwitch']){
        if(Number($dataItems[Number(arr[id])].meta['EICSwitch']) == 103){
          value7 = $gameSwitches.value(Number(arr[id]) + 600);
        };
        if(Number($dataItems[Number(arr[id])].meta['EICSwitch']) == 102){
          value7 = $gameSwitches.value(Number(arr[id]) + 900);
        };
      };
      if(value7){
        value3 += 1;
        value4 += 1;
        value5 += onStatusString;
      } else {
        value3 += 1;
        value5 += offStatusString;
        value13 = 0;
        value16 = 1;
      };
    };
}};
if(value43 >= value42){value5 += `\n`;value43 = 0};

//スキルランクが条件
for (let id = 1; id < 10; id++) {
  if(dataItem.meta['EventSetSkillRank'+id]){
    let arr = dataItem.meta['EventSetSkillRank'+id].split(',');
    actor = $gameActors.actor($gameVariables.value(2));
    if(arr[1] == 0){arr[1] = 18};
    if(arr[0] == 0){
      arr[0] = $gameVariables.value(2);//基準となるアクター
    }
    actor = $gameActors.actor(Number(arr[0]));
    value2 += 1;
    if(!$gameSwitches.value(435) && !actor.isLearnedSkill(Number(arr[1]))){
      value5 += `[${$gameActors.actor(Number(arr[0])).name()}が特定スキルランク${Number(arr[2])}↑]`;
    } else {
      if(arr[0] == $gameVariables.value(2)){
        value5 += `[${$dataSkills[Number(arr[1])].name}:Rank${Number(arr[2])}↑`;
      } else {
        value5 += `[${$gameActors.actor(Number(arr[0])).name()}が${$dataSkills[Number(arr[1])].name}:Rank${Number(arr[2])}↑`;
      };
    }
    value43 += 1;
    if(actor.isLearnedSkill(Number(arr[1])) && actor.skillMasteryLevel(Number(arr[1])) >= Number(arr[2]) ){
      value3 += 1;
      value4 += 1;
      value5 += onStatusString;
    } else {
      value3 += 1;
      value5 += offStatusString;
    }
  }
}
if(value43 >= value42){value5 += `\n`;value43 = 0};

//スキルが条件
for (let id = 1; id < 10; id++) {
  if(dataItem.meta['EventSetSkill'+id]){
    let arr = dataItem.meta['EventSetSkill'+id].split(',');
    actor = $gameActors.actor($gameVariables.value(2));
    if(arr[1] == 0){arr[1] = 18};
    if(arr[0] == 0){
      arr[0] = $gameVariables.value(2);//基準となるアクター
    }
    actor = $gameActors.actor(Number(arr[0]));
    value2 += 1;
    if(!$gameSwitches.value(435) && !actor.isLearnedSkill(Number(arr[1]))){
      value5 += `[${$gameActors.actor(Number(arr[0])).name()}が特定スキル習得`;
    } else {
      if(arr[0] == $gameVariables.value(2)){
        value5 += `[${$dataSkills[Number(arr[1])].name}習得`;
      } else {
        value5 += `[${$gameActors.actor(Number(arr[0])).name()}が${$dataSkills[Number(arr[1])].name}習得`;
      }
    }
    value43 += 1;
    if(actor.isLearnedSkill(Number(arr[1]))){
      value3 += 1;
      value4 += 1;
      value5 += onStatusString;
    } else {
      value3 += 1;
      value5 += offStatusString;
    }
  }
}
if(value43 >= value42){value5 += `\n`;value43 = 0};

//スキル装着が条件
for (let id = 1; id < 10; id++) {
  if(dataItem.meta['EventSetSkillEquip'+id]){
    let arr = dataItem.meta['EventSetSkillEquip'+id].split(',');
    actor = $gameActors.actor(arr[0]);
    if(arr[0] == 0){arr[0] = $gameVariables.value(2)};
    actor = $gameActors.actor(Number(arr[0]));
    value2 += 1;
    if(!$gameSwitches.value(435) && !actor.isLearnedSkill(Number(arr[1]))){
      value5 += `[${$gameActors.actor(Number(arr[0])).name()}が特定スキル装着`;
    } else {
      if(arr[0] == $gameVariables.value(2)){
        value5 += `[${$dataSkills[Number(arr[1])].name}装着`;
      } else {
        value5 += `[${$gameActors.actor(Number(arr[0])).name()}が${$dataSkills[Number(arr[1])].name}装着`;
      }
    }
    value43 += 1;
    if(actor.battleSkillsRaw().includes(Number(arr[1]))){
      value3 += 1;
      value4 += 1;
      value5 += onStatusString;
    } else {
      value3 += 1;
      value5 += offStatusString;
    }
  }
}
if(value43 >= value42){value5 += `\n`;value43 = 0};

//ステート付与が条件
for (let id = 1; id < 10; id++) {
  if(dataItem.meta['EventSetState'+id]){
    let arr = dataItem.meta['EventSetState'+id].split(',');
    actor = $gameActors.actor(arr[0]);
    if(arr[0] == 0){arr[0] = $gameVariables.value(2)};
    actor = $gameActors.actor(Number(arr[0]));
    value2 += 1;
    if(arr[0] == $gameVariables.value(2)){
      value5 += `State:[\x1bSIM[${Number(arr[1])}]`;
    } else {
      value5 += `[${$gameActors.actor(Number(arr[0])).name()}がステート:\x1bSIM[${Number(arr[1])}]`;
    }
    value43 += 1;
    if(actor.isStateAffected(Number(arr[1]))){
      value3 += 1;
      value4 += 1;
      value5 += onStatusString;
    } else {
      value3 += 1;
      value5 += offStatusString;
    }
  }
}
if(value43 >= value42){value5 += `\n`;value43 = 0};

//ジョブが条件
for (let id = 1; id < 10; id++) {
  if(dataItem.meta['EventSetJob'+id]){
    let arr = dataItem.meta['EventSetJob'+id].split(',');
    actor = $gameActors.actor(arr[0]);
    if(arr[0] == 0){arr[0] = $gameVariables.value(2)};
    actor = $gameActors.actor(Number(arr[0]));
    value2 += 1;
    value6 = 18; 
    if(!$gameSwitches.value(435) && !actor._unlockedClasses.contains(Number(arr[1]))){
      value5 += `[${$gameActors.actor(Number(arr[0])).name()}が特定ジョブ`;
    } else {
      value5 += `[${$gameActors.actor(Number(arr[0])).name()}がジョブ:\x1bJ[${Number(arr[1])}]`;
    }
    value43 += 1;
    if(actor.subclass()){
      if(actor._subclassId == Number(arr[1])){
        value3 += 1;
        value4 += 1;
        value5 += onStatusString;
      } else {
        value3 += 1;
        value5 += offStatusString;
      }
    } else {
      value3 += 1;
    }
  }
}
if(value43 >= value42){value5 += `\n`;value43 = 0};

//討伐数が条件
for (let id = 1; id < 10; id++) {
  if(dataItem.meta['EventSetSubjugation'+id]){
    let arr = dataItem.meta['EventSetSubjugation'+id].split(',');
    value5 += `[\\C[2]\x1bSIM[${Number(arr[0])}]\\C[0]:\\C[10]${$gameVariables.value(52)[Number(arr[0])]}\\C[0]/${Number(arr[1])}`;
    value43 += 1;
    if($gameVariables.value(52)[Number(arr[0])] >= Number(arr[1])){
      value3 += 1;
      value4 += 1;
      value5 += onStatusString;
    } else {
      value3 += 1;
      value5 += offStatusString;
    }
  }
}
if(value43 >= value42){value5 += `\n`;value43 = 0};
if(dataItem.meta['RegistrationC1']){
  value5 += `[条件付き選択肢を選ぶ事で回想登録]`;
  value43 += 1;
}

//EventSetMoney
if(dataItem.meta['EventSetMoney']){
  let value7 = Number(dataItem.meta['EventSetMoney']);
  if(value7 != 0){
    value2 += 1;
    value5 += `[${value7}\\G`;
    if($gameParty.gold() >= value7){
      value3 += 1;
      value4 += 1;
      value5 += onStatusString;
    } else {
      value3 += 1;
      value5 += offStatusString;
    }
  }
}
//if(value43 >= value42){value5 += `\n`;value43 = 0};

for (let id = 1; id < 10; id++) {
  if(dataItem.meta['EventSetHexpArr' + id]){
    let arr = dataItem.meta['EventSetHexpArr' + id].split(',');
    actor = $gameActors.actor(Number(arr[0]));
    value2 += 1;
    if(Number(arr[1]) == 4){//露出度
      value7 = $gameVariables.value(Number(arr[0]) + 380)[Number(arr[1])] <= Number(arr[2])
      value5 += `[\\C[27]${actor.name()}\\C[0]${$dataSystem.variables[Number(arr[1]) + 400]}${Number(arr[2])}以下`;
    } else {
      value7 = $gameVariables.value(Number(arr[0]) + 380)[Number(arr[1])] >= Number(arr[2])
      value5 += `[\\C[27]${actor.name()}\\C[0]${$dataSystem.variables[Number(arr[1]) + 400]}${Number(arr[2])}以上`;
    };
    value43 += 1;
    if(value7){
      value3 += 1;
      value4 += 1;
      value5 += onStatusString;
    } else {
      value3 += 1;
      value5 += offStatusString;
    }
  }
}
if(value43 >= value42){value5 += `\n`;value43 = 0};

for (let id = 1; id < 10; id++) {
  if(dataItem.meta['EventSetClothArr' + id]){
    let arr = dataItem.meta['EventSetClothArr' + id].split(',');
    let actor = $gameActors.actor(Number(arr[0]));
    value2 += 1;
    if(Number(arr[1]) == 41){
      for (let j = 1; j <= $dataItems.length-1; j++) {
        if($dataItems[j].meta['TotalCloth']){
          if(Number($dataItems[j].meta['TotalCloth']) == Number(arr[2])){
            if(Number($dataItems[j].meta['EICSwitch']) == 380+Number(arr[0])){
              value5 += `[${actor.name()}が${$dataItems[j].name}着用`;
              break;
            }
          }
        }
      }
    } else {
      if(Number(arr[1]) == 0){
        value5 += `[${actor.name()}が${$dataItems[Number(arr[2])].name}着用`;
      } else {
        value5 += `[${actor.name()}の${$dataSystem.switches[Number(arr[1])+460]}に特定衣装`;
      };
    }
    value43 += 2;
    if($gameVariables.value(Number(arr[0]) + 440)[Number(arr[1])] == Number(arr[2])){
      value3 += 1;
      value4 += 1;
      value5 += onStatusString;
    } else {
      value3 += 1;
      value5 += offStatusString;
    }
  }
}
if(value43 >= value42){value5 += `\n`;value43 = 0};

//EventSetMainRoot
if(dataItem.meta['EventSetMainRoot']){
let arr = dataItem.meta['EventSetMainRoot'].split(',');
  if(arr[1] != 0){
    if(arr[0] == 0){
      arr[0] = 135;
    } else {
      value2 += 1;
      if(Number(arr[1]) == 49){
        value5 += `[メインクエスト完了後`;
      } else {
        value5 += `[メイン進行[${Number(arr[1])}]↑`;
      };
      value43 += 1;
    }
      if($gameVariables.value(Number(arr[0])) >= Number(arr[1])){
        value3 += 1;
        value4 += 1;
        value5 += onStatusString;
      } else {
        value3 += 1;
        value5 += offStatusString;
        value13 = 0;
        value17 = 1;
        //value41 += `[メイン進行${Number(arr[1])}↑]`;
      }
  }
}
//if(value43 >= value42){value5 += `\n`;let value43 = 0};

//変数条件
for (let id = 1; id < 10; id++) {
  if(dataItem.meta['EventSetVal' + id]){
    let arr = dataItem.meta['EventSetVal' + id].split(',');
    if(arr[0] == 0){
      arr[0] = 2;
    } else {
      value2 += 1;
      if(54 == Number(arr[0]) || 1 == Number(arr[1])){
        value5 += `[単独行動`;
      } else {
        if(621 <= Number(arr[0]) &&  Number(arr[0]) <= 624){//621からパーティ一人目のアクターID
          value5 += `[${Number(arr[0])-620}番目:${$gameActors.actor(Number(arr[1])).name()}`;
        } else {
          value7 = $dataSystem.variables[Number(arr[0])];
          value7 = value7.replace("[daysReset]", "");
          value7 = value7.replace("[NoReset]", "");
          value7 = value7.replace("[夜自動]", "");
          value7 = value7.replace("[シーン達成]", "");
          value7 = value7.replace("[挿話達成]", "");
          value5 += `[${value7}:${Number(arr[1])}↑`;
        }
      }
    }
    value43 += 1;
    if($gameVariables.value(Number(arr[0])) >= Number(arr[1])){
      value3 += 1;
      value4 += 1;
      value5 += onStatusString;
    } else {
      value3 += 1;
      value5 += offStatusString;
    }
  }
}
if(value43 >= value42){value5 += `\n`;value43 = 0};

//アイテム数
for (let id = 1; id < 10; id++) {
  if(dataItem.meta['EventSetItem' + id]){
    let arr = dataItem.meta['EventSetItem' + id].split(',');
    if(arr[0] == 0){
      arr[0] = 11;
    } else {
      value2 += 1;
    };
    value43 += 1;
      value5 += `\x1bIIN[${Number(arr[0])}:\\C[2]${Number(arr[1])}\\C[0]]`;
    if($gameParty.numItems($dataItems[Number(arr[0])]) >= Number(arr[1])){  
      value3 += 1; 
      value4 += 1;
      value5 += onStatusString;
    } else {
      value3 += 1;
      value5 += offStatusString;
    }
  }
}
if(value43 >= value42){value5 += `\n`;value43 = 0};

//アクターが存在するか
if(dataItem.meta['EventEraseActor']){
  const arr = dataItem.meta['EventEraseActor'].split(',');
  value7 = ` `;
  for (let id = 0; id <= arr.length-1; id++) {
    if(Number(arr[id]) == 0){
      arr[id] = 20;//存在しないアクター
    } else {
      if($gameActors.actor(Number(arr[id])).isLearnedSkill(407)){
        value7 = `${$gameActors.actor(Number(arr[id])).name()}`;
      } else {
        value7 = `？？？`;
      };
      value2 += 1;
    };
    value6 = $gameActors.actor(Number(arr[id])).isLearnedSkill(18) && !$gameActors.actor(Number(arr[id])).isStateAffected(valueDollStateId);
    if(arr[id] != 20){
      if(value6){
        value31 = 1;
        value5 += `[＜${value7}＞が仲間のため発生不可]`;
      } else {
        value5 += `[＜${value7}＞が仲間の場合に発生不可]`;;
      }
      value43 += 1;
    }
  }
}
if(value43 >= value42){value5 += `\n`;value43 = 0};

if(dataItem.meta['EventEraseSwi']){
  value6 = Number(dataItem.meta['EventEraseSwi']); 
  if(value6 >= 1){
    value7 = $dataSystem.switches[value6];
    value7 = value7.replace("[daysReset]", "");
    value7 = value7.replace("[NoReset]", "");
    value7 = value7.replace("[夜自動]", "");
    value7 = value7.replace("[シーン達成]", "");
    value7 = value7.replace("[挿話達成]", "");
    if($gameSwitches.value(value6)){
      value31 = 1;
      value5 += `[${value7}につき発生不可]`;
    } else {
      value5 += `[${value7}で発生不可]`;
    }
    value43 += 1;
  }
}
if(value43 >= value42){value5 += `\n`;value43 = 0};

if(dataItem.meta['EventEraseMain']){
  const arr1 = Number(dataItem.meta['EventEraseMain'].split(',')[0]); 
  const arr2 = Number(dataItem.meta['EventEraseMain'].split(',')[1]); 
  if(arr2 >= 1){
    if( $gameVariables.value(arr1) > arr2 ){
      value31 = 1;
      value5 += `[メインクエスト進行につき発生不可]`;
    } else {
      value5 += `[メインクエスト進行＜${arr2}＞で発生不可]`;
    }
    value43 += 1;
  }
}
if(value43 >= value42){value5 += `\n`;value43 = 0};

if(dataItem.meta['EventEraseVal']){
  const arr1 = Number(dataItem.meta['EventEraseVal'].split(',')[0]); 
  const arr2 = Number(dataItem.meta['EventEraseVal'].split(',')[1]); 
  if(arr1 >= 1){
    value7 = $dataSystem.variables[arr1];
    value7 = value7.replace("[daysReset]", "");
    value7 = value7.replace("[NoReset]", "");
    value7 = value7.replace("[夜自動]", "");
    value7 = value7.replace("[シーン達成]", "");
    value7 = value7.replace("[挿話達成]", "");
    if($gameVariables.value(arr1) > arr2){
      value31 = 1;
      value5 += `[${value7}一定につき発生不可]`;
    } else {
      value5 += `[${value7}一定で発生不可]`;
    };
    value43 += 1;
  }
}

value1 += `${value5}`;
if(dataItem.meta['NoAddDescription']){}else{
  $dataItems[i].description = `${value1}`;
}
j += 1;
valueSceneName1 = `${$dataItems[i].name}`;
let valueSceneDescription1 = `${$dataItems[i].description}`;
if(value3 != value4){
  valueSceneName1 = `？？？`;
}
if(value16 >= 1 || value17 >= 1 || value13 == 0){
  valueSceneDescription1 = `？？？？？？？？？？？？\n`;
  if(value44 != 0){
    valueSceneDescription1 += `${value44}`;
  }
}
if(value16 >= 1){
  valueSceneDescription1 += `[要:前提シーン] `;
}
if(value17 >= 1){
  valueSceneDescription1 += `[要:メインクエスト一定進行] `;
}
if(value45 >= 1){
  valueSceneDescription1 += `[要:未加入キャラ] `;
}
if(value41 != 0){
  if($gameVariables.value(356)[value11] != 0 || value11 == 2){
    valueSceneDescription1 += `${value41}`;
  } else {
    valueSceneDescription1 += `[未到達マップ]`;
  }
} else {

if($gameSwitches.value(value24 + i)){// || $gameSwitches.value(435) && !$gameParty.hasItem($dataItems[i])
  value10 += 1;

} else {

if(value12 >= 1 && value31 == 0){

  if(value12 >= 1){
    if(id1 ==1){$gameSwitches.setValue(479,true)};
    if(id1 ==2){$gameSwitches.setValue(480,true)};
  }
  if(value40 == 1 && $gameParty.inBattle()){
    BattleManager._logWindow.push(`addText`, value1);
  }

  value10 += 1;
  let value14 = `${valueSceneName1}\n${valueSceneDescription1}\n`;
  let value15 = 1; //WARN not using?
  if (value10 >= 81) { value15 = 10 }
  else if (value10 >= 71) { value15 = 9 }
  else if (value10 >= 61) { value15 = 8 }
  else if (value10 >= 51) { value15 = 7 }
  else if (value10 >= 41) { value15 = 6 }
  else if (value10 >= 31) { value15 = 4 }
  else if (value10 >= 21) { value15 = 3 }
  else if (value10 >= 11) { value15 = 2 }
    if(value3 == value4){
      var value0 = `${value14}`;
      eval("valueWordSet" + valueCountSet2 +" += value0");
      valueCountSet1 += 1;
        if((valueCountSet1 %10) == 0){
          valueCountSet2 += 1;
          eval("valueWordSet" + valueCountSet2 +" = value46");
        };
      $gameSwitches.setValue(i+value23,true);//発生用スイッチ
        if(valueCountDefeadSwitche1 >= 1){
          valueCountDefeadSwitche2 = i;
        };
        if(dataItem.meta['AutoStart']){//自動起動かどうか
          if(Number(dataItem.meta['AutoStart']) == 1 && $gameSwitches.value(477)){//マップ最初並列イベコモン時にオンオフ自動
            $gameSwitches.setValue(474,true);
            valueCountDefeadSwitche2 = i;
          };
          if(Number(dataItem.meta['AutoStart']) == 2 && $gameSwitches.value(472)){//朝並列スイッチ
            $gameSwitches.setValue(474,true);
            valueCountDefeadSwitche2 = i;
          };
        };
          if($gameParty.inBattle()){
            if(value40 ==1){
              $gameVariables.setValue(value25,$gameVariables.value(value25)+1);
            };
          } else{ 
            $gameVariables.setValue(value25,$gameVariables.value(value25)+1);
          };
    } else {
      var value0 = `\\C[5]${value14}\\C[0]`;
      eval("valueWordSet" + valueCountSet2 +" += value0");
      valueCountSet1 += 1;
        if((valueCountSet1 %10) == 0){
          valueCountSet2 += 1;
          eval("valueWordSet" + valueCountSet2 +" = value46");
        };
      $gameSwitches.setValue(i+value23,false);//発生用スイッチ

        if($gameParty.inBattle()){
          if(value40 ==1){
            $gameVariables.setValue(value26,$gameVariables.value(value26)+1);
          }
        } else{ 
            $gameVariables.setValue(value26,$gameVariables.value(value26)+1);
        };

     };

} else {
      var value0 = `\\C[1]${value14}\\C[0]`;
      eval("valueWordSet" + valueCountSet2 +" += value0");
      valueCountSet1 += 1;
        if((valueCountSet1 %10) == 0){
          valueCountSet2 += 1;
          eval("valueWordSet" + valueCountSet2 +" = value46");
        };
  if(!dataItem.meta['RepeatScene']){
    $gameSwitches.setValue(i+value23,false);//発生用スイッチ
  }
}
}
}

}

//回想挿話発生条件式。回想scene_jouken(2);。挿話scene_jouken(1);
//☆☆☆条件追加。<EventSetVal1:0,0>
scene_joukensettei = function(id1){

$gameVariables.setValue(195, 0);//表示時の個数を入れる事でコモンイベントのウィンド数を抑制

for(var i = 621; i <= 624; i++){$gameVariables.setValue(i, 0)};

for (var i = 0; i < $gameParty.battleMembers().length; i++) { //621-624のみ表記を変更。`${n-620}番目:${$gameActors.actor(n).name()}`
  var value1 = $gameParty.battleMembers()[i].actorId();
  $gameVariables.setValue(621 + i, value1);
};
$gameVariables.setValue(54, $gameParty.battleMembers().length);//パーティ人数。1の時は[単独行動]表記

valueCountSet1 = 0;
valueCountSet2 = 1;
value46 = ` `;
eval("valueWordSet" + valueCountSet2 +" = value46");
value10 = 0;//そのマップで発生するシーン数
//value15 = 1;//変数800+value15で表示するための変数
j = 0;//配列を番号順に居れるため

if(id1 == 1){
  $gameSwitches.setValue(479,false);
  $gameSwitches.setValue(367,false);
  var start = 401;
  var end = 500;
  var value23 = 800;
  var value24 = 900;
  var value25 = 517;//成立数変数
  var value26 = 518;//未成立数変数
  $gameVariables.setValue(517, 0);
  $gameVariables.setValue(518, 0);
};
if(id1 == 2){
  $gameSwitches.setValue(480,false);
  $gameSwitches.setValue(369,false);
  var start = 501;
  var end = 600;
  var value23 = 500;
  var value24 = 600;
  var value25 = 504;//成立数変数
  var value26 = 505;//未成立数変数
  $gameVariables.setValue(504, 0);
  $gameVariables.setValue(505, 0);
};
for (var i = start; i <= end; i++) {
  scene_joukenNakami(id1,i,value23,value24,value25,value26);
};

if(id1 == 1){
  var value25 = 517;//成立数変数
  var value26 = 518;//未成立数変数
  var arrAdd = valueSouwasceneAddId;
};
if(id1 == 2){
  var value25 = 504;//成立数変数
  var value26 = 505;//未成立数変数
  var arrAdd = valueHsceneAddId;
}
//アイテムID<HsceneItem><SouwaItem>
var list = arrAdd;
list.forEach(function(i) {
  var value = $dataItems[i];
  var value23 = Number(value.meta['AddEventIncidenceSwi']);//発生スイッチ。リセットなしの1601-1700の間に実行。
  var value24 = Number(value.meta['AddEventCompSwi']);//達成スイッチ
  var value33 = Number(value.meta['AddAddEventCommonId']);//コモID。並列スイッチも逆算して代入。スクリプト内では使わない
  var value34 = Number(value.meta['AddEventParallelSwi']);//並列スイッチ
  scene_joukenNakami(id1,i,value23,value24,value25,value26,value33,value34);
}, this);

$gameVariables.setValue(195,valueCountSet1);//表示時の個数を入れる事でコモンイベントのウィンド数を抑制

if($gameVariables.value(517) >= 1){
  $gameSwitches.setValue(367,true);//挿話ナヴィ発生スイッチ
};
if($gameVariables.value(504) >= 1){
  $gameSwitches.setValue(369,true);//シーンナヴィ発生スイッチ
};


}

//☆☆☆条件追加。<EventSetVal1:0,0>
scene_commonIdRec = function(value1){

if($dataItems[value1].meta['AddAddEventCommonId']) {
  var value2 = Number($dataItems[value1].meta['AddAddEventCommonId']);
} else {
  var value2 = value1;
};
if(value2 >= 2){
  event_pararelStarting(1,value1,1)
} else {
  if($gameSwitches.value(29)){
    TickerManager.show('無効なIDが選択されました。ホームに帰還します。');
    for(var i = 101; i <= 110; i++){$gameSwitches.setValue(i,false)};
    set_playerPosition2(168);
  } else {
    TickerManager.show('無効なIDが選択されました。処理を中断します。');
  };
};

};

//イベントから挿話シーン発生event_pararelSet(this._eventId,0,1,8);
event_pararelSet = function(id1,id2,id3,id4){

event_charaPreset(id1);
event_charaRoot(id1);
var event = $gameMap.event(id1);
var value2 = event._realX
var value3 = event._realY
$gameVariables.setValue(161,[$gameMap.mapId(),value2+id2,value3+id3]);
set_playerPosition2(161);
if(id4 >= 1){$gamePlayer.setDirection(id4)};
if ($gameMap.event(id1).event().meta['EvSceneSet']){
  var arr1 = $gameMap.event(id1).event().meta['EvSceneSet'].split(',');
  var value1 = Number(arr1[0]);
  event_pararelStarting(1,value1,id1);
};

};

//並列イベントスイッチオン。id1が0でﾒｲﾝ1でｼｰﾝ挿話,event_pararelStarting(1,501,this._eventId);
event_pararelStarting = function(id1,id2,id3){

var value1 = 0;
valueCountDefeadSwitche2 = 0;//全滅スイッチオン時に成立判定
//本体では0に出来ないためここでやっている
var array = $gameMap._commonEvents.filter(function (event) {
    return event.isActive();
}).map(function (event) {
    return event.event().id;
});
for (var i = 0; i <= array.length-1; i++) {
  if(array[i] >= 2){
    if($dataCommonEvents[array[i]].switchId){
      if([119,125,429,481].some(function(id){return id == $dataCommonEvents[array[i]].switchId})){}else{
        var value1 = 1;
        break;
}}}};
if(value1 == 0){
  valueParallelEventId = id3;
    if(id1 == 0){
      $gameSwitches.setValue($dataCommonEvents[id2].switchId,true);
    } else {
      if(id2 >= 401 && id2 <= 600){
        $gameSwitches.setValue($dataCommonEvents[id2].switchId,true);
      } else {
        if($dataItems[id2].meta['AddEventParallelSwi']){
          $gameSwitches.setValue($dataCommonEvents[Number($dataItems[id2].meta['AddEventParallelSwi'])].switchId,true);
        };
      };
    };
};

if(!$gameSwitches.value(29)){
  $gameVariables.value(163)[id2] = [0,0,0,0,0,0,0,0,0,0,0,0];
  $gameVariables.value(163)[id2][0] = $gameMap.mapId();
  $gameVariables.value(163)[id2][1] = $gamePlayer.characterName();
  $gameVariables.value(163)[id2][2] = $gamePlayer.characterIndex();
  $gameVariables.value(163)[id2][3] = $gamePlayer._realX;
  $gameVariables.value(163)[id2][4] = $gamePlayer._realY;
  $gameVariables.value(163)[id2][5] = $gamePlayer.direction();
  if(id3 != 0) {
    if(!!$gameMap.event(id3)) {
      var event = $gameMap.event(id3);
      $gameVariables.value(163)[id2][6] = event.characterName();
      $gameVariables.value(163)[id2][7] = event.characterIndex();
      $gameVariables.value(163)[id2][8] = event._realX;
      $gameVariables.value(163)[id2][9] = event._realY;
      $gameVariables.value(163)[id2][10] = event.direction();
      $gameVariables.value(163)[id2][11] = event.pattern();
    };
  };
};
$gameVariables.setValue(171,[$gameMap.mapId(),$gamePlayer._realX,$gamePlayer._realY]);

};

//一時的にキャラグラ記憶ともろもろ設定,id2が0でスタート。1で終了
Npc_TemporarilySave = function(id1,id2){

if(id2 == 0){
  valueNpcGuraTemporarilySave = Array(12).fill(0);
  valueNpcGuraTemporarilySave[0] = $gameMap.mapId();
  valueNpcGuraTemporarilySave[1] = $gamePlayer.characterName();
  valueNpcGuraTemporarilySave[2] = $gamePlayer.characterIndex();
  valueNpcGuraTemporarilySave[3] = $gamePlayer._realX;
  valueNpcGuraTemporarilySave[4] = $gamePlayer._realY;
  valueNpcGuraTemporarilySave[5] = $gamePlayer.direction();
  if(!!$gameMap.event(id1)) {
    var event = $gameMap.event(id1);
    valueNpcGuraTemporarilySave[6] = event.characterName();
    valueNpcGuraTemporarilySave[7] = event.characterIndex();
    valueNpcGuraTemporarilySave[8] = event._realX;
    valueNpcGuraTemporarilySave[9] = event._realY;
    valueNpcGuraTemporarilySave[10] = event.direction();
    valueNpcGuraTemporarilySave[11] = event.pattern();
  };
  $gameVariables.setValue(292,Array(21).fill(0));
  for (var i = 13; i <= 15; i++) {
    if($gameSwitches.value(i)){$gameVariables.setValue(320,i)};
  };
};
if(id2 == 1){
  if($gameVariables.value(320) >= 1){
    for (var i = 13; i <= 15; i++) {$gameSwitches.setValue(i,false)};
    $gameSwitches.setValue($gameVariables.value(320),true);
  };
  $gameVariables.setValue(320,0);
  $gameVariables.setValue(292,Array(21).fill(0));
};

};

//段階シーンを選択肢で表示
scene_choiceDecision = function(arr1,value6){//scene_choiceDecision([503,502,501],161);

$gameSwitches.setValue(value6,false);
var value2 = 0;
var value5 = ` `;
var list = arr1;
list.forEach(function(value1) {
  if(value1 >= 401 && value1 <= 500){
    var value3 = value1+800;
    var value4 = value1+900;
  };
  if(value1 >= 501 && value1 <= 600){
    var value3 = value1+500;
    var value4 = value1+600;
  };
  if($dataItems[value1].meta['AddEventIncidenceSwi']){
    var value3 = Number($dataItems[value1].meta['AddEventIncidenceSwi']);
  };
  if($dataItems[value1].meta['AddEventCompSwi']){
    var value4 = Number($dataItems[value1].meta['AddEventCompSwi']);
  };
  if(!$gameSwitches.value(value4)){
    var value5 = `\x1bIIN[${value1}]\n${$dataItems[value1].description}`;
  };
  if($gameSwitches.value(value3) && !$gameSwitches.value(value4)){
    $gameSwitches.setValue(value6,true);
    var value2 = value1;
  };
}, this);
valueCountSet1 = value2;
$gameVariables.setValue(22,value5);

};

//挿話選択肢発生スクリプト
scene_choiceSouwa = function(){

$gameVariables.setValue(19,0);
valueScriptArray1 = [];
var start = 1201;
var end = 1300;
for (var i = start; i <= end; i++) {
  if($gameSwitches.value(i) && !$gameParty.hasItem(i-800) && !$gameSwitches.value(i+100)){
    if($dataItems[i-800].meta['singleSouwaIncidence']){}else{
      //valueScriptArray1.push(i+300);
valueScriptArray1.push(i-800);
      $gameVariables.setValue(19,1);
}}};
for (var i = 1; i <= $dataItems.length-1; i++) {
  if($dataItems[i].meta['AddEventIncidenceSwi']){
    if(Number($dataItems[i].meta['EICSwitch']) == 102){
      if($gameSwitches.value(Number($dataItems[i].meta['AddEventIncidenceSwi'])) && !$gameParty.hasItem(i) && 
      !$gameSwitches.value(Number($dataItems[i].meta['AddEventCompSwi']))){
        if($dataItems[i].meta['singleSouwaIncidence']){}else{
          valueScriptArray1.push(Number($dataItems[i].meta['AddEventParallelSwi']));//未完成
          $gameVariables.setValue(19,1);
}}}}};
if($gameVariables.value(19) >= 1){
  for(var i = 0; i <= valueScriptArray1.length-1; i++){
    var value1 = $dataItems[valueScriptArray1[i]].name
    const id = 1; 
    const choiceParams = {
    text: `${value1}`,
    value: valueScriptArray1[i]};
    $gameSystem.addCustomChoice(id, choiceParams);
  };
};
/*:
if($gameVariables.value(19) >= 1){
  for(var i = 0; i <= valueScriptArray1.length-1; i++){
    var value1 = `？？？`;
    for (var j = 1; j <= $dataCommonEvents.length-1; j++) {
      if($dataCommonEvents[j].switchId == valueScriptArray1[i]){
        var value1 = $dataCommonEvents[j].name
        const id = 1; 
        const choiceParams = {
        text: `${value1}`,
        value: valueScriptArray1[i]};
        $gameSystem.addCustomChoice(id, choiceParams);
      };
    };
  };
};
*/

};

//オールナビスクリプト
scene_allNavigation = function(){

valueScriptArray1 = [];
var value2 = 103;
var value4 = 101;
if($gameVariables.value(19) == 1){var value2 = 102};
for (var i = 1; i <= $dataItems.length-1; i++) {
  if($dataItems[i].meta['EICSwitch']){
    if(Number($dataItems[i].meta['EICSwitch']) == value2){
      valueScriptArray1.push(i);
    };
  };
};
if(valueScriptArray1.length >= 1){
  for(var i = 0; i <= valueScriptArray1.length-1; i++){
    var value1 = $dataItems[valueScriptArray1[i]].name;
    const id = 1; 
    const choiceParams = {
    text: `${value1}`,
    value: 0};
    $gameSystem.addCustomChoice(id, choiceParams);
    var value3 = `${$dataItems[valueScriptArray1[i]].description}`;
    $gameScreen.setDTextPicture(value3, 28);
    $gameScreen.dWindowFrame = 'ON';
    $gameScreen.showPicture(value4,'',0,10,606,100,100,0,0);
    $gameMessage.setSelectPictureId(i, value4);
    value4 += 1;
  };
};


};

//}());
