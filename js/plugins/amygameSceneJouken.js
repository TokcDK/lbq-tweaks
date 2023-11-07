/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){
//中身スクリプト
scene_joukenNakami = function(id1,i,value23,value24,value25,value26){

if ($dataItems[i].name.length === 0) return;

//console.warn(`Debug. Run scene_joukenNakami`)

let dataItem = $dataItems[i];
//let actor = $gameActors.actor($gameVariables.value(2));
let conditionPrefixText = `発生条件:`;
let conditionCount = 0;//条件成立回数。使わない？
let unmetConditionCount = 0;//発生条件。未成立でも加算
let metConditionCount = 0;//発生条件。成立で加算
let messageText = ``;
let requirement = 0;//条件用
let textSubst = 0;//一時代入用
let marGenScene1  = 0;//1でマップ発生シーン
let eventSceneMissing = 1;//0でEventSetSceneが存在しないかメインクエスト進行が足りないかアクターが存在しない
let tempAssignSceneOccurText = `　`;//発生シーン表示の一時代入
let eventSceneNotExists = 0;//EventSetSceneが存在しない場合に1
let insufficientMainQuest = 0;//メインクエスト進行が足りない場合に1
let cannotExecute = 0;//実行不可の場合に1
let inBattle = 0;//戦闘中か否か
let mainQuestProgress = 0;//メインクエスト進行度代入用
let lineBreakCount = 4;//改行指定数
let lineCount = 0;//行数カウント
let showMapName = 0;//？？？表記の時にマップ名表示
let actorNotJoined = 0;//アクターが加入していない
let valueCountDefeatSwitch1 = 0;//全滅スイッチ判定

const onStatusString = `\\C[14]〇\\C[0]`;
const offStatusString = `\\C[12]×\\C[0]`;

//行数超過する場合にここでid毎に対応
//if(i == 401){let value42 = 4};

if(dataItem.meta['EventSetBattle']){
    inBattle = Number(dataItem.meta['EventSetBattle']); 
    if(inBattle == 1){
      conditionCount += 1;
      messageText += `[戦闘]`;
      marGenScene1 += 1;//1でマップ発生シーン
      unmetConditionCount += 1;
      metConditionCount += 1;
    }
}

//場所による条件設定value11
if(dataItem.meta['EventSetMap']){
  let value11 = Number(dataItem.meta['EventSetMap']);
  if(value11 == 0){
    value11 = 2;//EventSetMapが0の場合の代替スイッチ。変更の可能性あり？？？
    showMapName = `[何処でも]`;
    messageText += showMapName;
  } else {
    conditionCount += 1;
    const itemMetaEventSetMapNum = $dataSystem.switches[Number(dataItem.meta['EventSetMap'])];
    messageText += `[${itemMetaEventSetMapNum}]`;
    showMapName = `[${itemMetaEventSetMapNum}]`;
  }
  lineCount += 1;
  if($gameSwitches.value(Number(dataItem.meta['EventSetMap']))){
    marGenScene1 += 1;//1でマップ発生シーン
    unmetConditionCount += 1;
    metConditionCount += 1;
  } else {
    unmetConditionCount += 1;
  }
  if($gameSwitches.value(433)){
    marGenScene1 += 1;//ヒント提示のために場所での区分けを無くしている。
  }
}

//自動起動かどうか
if(dataItem.meta['AutoStart']){
  const dataItemAutoStartNum = Number(dataItem.meta['AutoStart']);
  if (dataItemAutoStartNum == 1){
    messageText += `[自動発生]`;
    lineCount += 1;
  }
  else if (dataItemAutoStartNum == 2){
    messageText += `[朝自動発生]`;
    lineCount += 1;
  }
  else if (dataItemAutoStartNum == 3){
    messageText += `[宿泊時に自動発生]`;
    lineCount += 1;
  }
}

//メインクエスト中に発生
if(dataItem.meta['EventSetOccurrenceMain']){
  if(Number(dataItem.meta['EventSetOccurrenceMain']) >= 1){
    messageText += `[メイン[${dataItem.meta['EventSetOccurrenceMain']}]進行中に発生]`;
    lineCount += 1;
  }
}
if(dataItem.meta['NoteWord']){
  messageText += `[${dataItem.meta['NoteWord']}]`;
  lineCount += 1;
}
if(lineCount >= lineBreakCount){messageText += `\n`;lineCount = 0};

//視点が誰か441
if(dataItem.meta['EventSetPerspective']){
  let value6 = Number(dataItem.meta['EventSetPerspective']); 
    if(value6 >= 1){
      conditionCount += 1;
      if(value6 == $gameVariables.value(2)){}else{
        messageText += `[${$gameActors.actor(value6).name()}視点`;
        lineCount += 1;
      }
    }
    if($gameSwitches.value(value6+440)){
      unmetConditionCount += 1;
      metConditionCount += 1;
      if(value6 == $gameVariables.value(2)){}else{messageText += onStatusString};
    } else {
      unmetConditionCount += 1;
      if(value6 == $gameVariables.value(2)){}else{messageText += offStatusString};
      if(!$gameActors.actor(value6).isLearnedSkill(407)){
        eventSceneMissing = 0;
        //value41 += `[要:未加入キャラ]`;
        actorNotJoined = 1;
      }
    }
}
if(lineCount >= lineBreakCount){messageText += `\n`;lineCount = 0};

  // merged code of 2 code blocks EventSetSwi and EventNotSetSwi
  event_set_swi = function (metaName, num1, prefix, isSet) {
    if (dataItem.meta[metaName]) {
      let arr = dataItem.meta[metaName].split(',');
      for (let id = 0; id < arr.length; id++) {
        if (arr[id] == 0) {
          arr[id] = num1;
        } else {
          conditionCount += 1;
          textSubst = $dataSystem.switches[Number(arr[id])];
          textSubst = textSubst.replace("[daysReset]", "");
          textSubst = textSubst.replace("[NoReset]", "");
          textSubst = textSubst.replace("[夜自動]", "");
          textSubst = textSubst.replace("[シーン達成]", "");
          textSubst = textSubst.replace("[挿話達成]", "");
          messageText += `[${prefix}${textSubst}`;
          lineCount += 1;
        }
        const switchId = Number(arr[id]);
        const isSwitch = $gameSwitches.value(switchId);
        if ((isSet && isSwitch) || (!isSet && !isSwitch)) {
          if (isSet && switchId == 83) {//全滅スイッチ
            valueCountDefeatSwitch1 = i;
          };
          unmetConditionCount += 1;
          metConditionCount += 1;
          messageText += onStatusString;
        } else {
          unmetConditionCount += 1;
          messageText += offStatusString;
        }
      }
    }
    if (lineCount >= lineBreakCount) { messageText += `\n`; lineCount = 0; }
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
      conditionCount += 1;
      messageText += `[${$gameActors.actor(Number(arr[id])).name()}]`;
      lineCount += 1;
    };
    requirement = $gameActors.actor(Number(arr[id])).isLearnedSkill(18) && !$gameActors.actor(Number(arr[id])).isStateAffected(valueDollStateId);
    if(requirement){
      unmetConditionCount += 1;
      metConditionCount += 1;
      messageText += onStatusString;
    } else {
      unmetConditionCount += 1;
      messageText += offStatusString;
      if(!$gameActors.actor(Number(arr[id])).isLearnedSkill(407)){
        eventSceneMissing = 0;
        //value41 += `[要:未加入キャラ]`;
        actorNotJoined = 1;
      }
    }
  }
}
if(lineCount >= lineBreakCount){messageText += `\n`;lineCount = 0};

//アイテムが存在するか
if(dataItem.meta['ItemSetScene']){
let arr = dataItem.meta['ItemSetScene'].split(',');
  for (let id = 0; id <= arr.length-1; id++) {
    if(!arr[id]) continue;

    conditionCount += 1;
    const arrIdNum = Number(arr[id]);
      const item = $dataItems[arrIdNum];
      const itemMetaEICSwitch = item.meta['EICSwitch'];
      if (itemMetaEICSwitch){
        const itemMetaEICSwitchNum = Number(itemMetaEICSwitch);
        if (itemMetaEICSwitchNum == 102){
          messageText += `[挿話集:`;
        }
        else if (itemMetaEICSwitchNum == 103){
          messageText += `[シーン:`;
        }
        else if (itemMetaEICSwitchNum == 104){
          messageText += `[タイトル:`;
        }
        else if (itemMetaEICSwitchNum == 105){
          messageText += `[H'タイトル:`;
        }
      } else {
        if(item.meta['SG種別']){
          if(Number(item.meta['SG種別']) == 1){
            messageText += `[クエスト達成:`;
          };
        } else {
          messageText += `[`;
        };
      };
      messageText += `\x1bIIN[${arrIdNum}]`;
      lineCount += 1;
      textSubst = $gameParty.hasItem(item);
      if (itemMetaEICSwitch) {
        const itemMetaEICSwitchNum = Number(itemMetaEICSwitch);
        if (itemMetaEICSwitchNum == 103){
          textSubst = $gameSwitches.value(arrIdNum + 600);
        }
        else if (itemMetaEICSwitchNum == 102){
          textSubst = $gameSwitches.value(arrIdNum + 900);
        }
      }
      if(textSubst){
        unmetConditionCount += 1;
        metConditionCount += 1;
        messageText += onStatusString;
      } else {
        unmetConditionCount += 1;
        messageText += offStatusString;
        eventSceneMissing = 0;
        eventSceneNotExists = 1;
      }
  }
}
if(lineCount >= lineBreakCount){messageText += `\n`;lineCount = 0};

//スキルランクが条件
for (let id = 1; id < 10; id++) {
  if(dataItem.meta['EventSetSkillRank'+id]){
    let arr = dataItem.meta['EventSetSkillRank'+id].split(',');
    if(!arr[1]){arr[1] = 18};
    if(!arr[0]){
      arr[0] = $gameVariables.value(2);//基準となるアクター
    }
    const actor = $gameActors.actor(Number(arr[0]));
    const skillId = Number(arr[1]);
    const rankNum = Number(arr[2]);
    conditionCount += 1;
    if (!$gameSwitches.value(435) && !actor.isLearnedSkill(skillId)){
      messageText += `[${actor.name()}が特定スキルランク${rankNum}↑]`;
    } else {
      const skill = $dataSkills[skillId];
      if(arr[0] == $gameVariables.value(2)){
        messageText += `[${skill.name}:Rank${rankNum}↑`;
      } else {
        messageText += `[${actor.name()}が${skill.name}:Rank${rankNum}↑`;
      };
    }
    lineCount += 1;
    if (actor.isLearnedSkill(skillId) && actor.skillMasteryLevel(skillId) >= rankNum ){
      unmetConditionCount += 1;
      metConditionCount += 1;
      messageText += onStatusString;
    } else {
      unmetConditionCount += 1;
      messageText += offStatusString;
    }
  }
}
if(lineCount >= lineBreakCount){messageText += `\n`;lineCount = 0};

//スキルが条件
for (let id = 1; id < 10; id++) {
  if(dataItem.meta['EventSetSkill'+id]){
    let arr = dataItem.meta['EventSetSkill'+id].split(',');
    if(!arr[1]){arr[1] = 18};
    if(!arr[0]){
      arr[0] = $gameVariables.value(2);//基準となるアクター
    }
    const actorId = Number(arr[0]);
    const skillId = Number(arr[1]);
    const actor = $gameActors.actor(actorId);
    conditionCount += 1;
    if (!$gameSwitches.value(435) && !actor.isLearnedSkill(skillId)){
      messageText += `[${actor.name()}が特定スキル習得`;
    } else {
      const skill = $dataSkills[skillId];
      if(arr[0] == $gameVariables.value(2)){
        messageText += `[${skill.name}習得`;
      } else {
        messageText += `[${actor.name()}が${skill.name}習得`;
      }
    }
    lineCount += 1;
    if (actor.isLearnedSkill(skillId)){
      unmetConditionCount += 1;
      metConditionCount += 1;
      messageText += onStatusString;
    } else {
      unmetConditionCount += 1;
      messageText += offStatusString;
    }
  }
}
if(lineCount >= lineBreakCount){messageText += `\n`;lineCount = 0};

//スキル装着が条件
for (let id = 1; id < 10; id++) {
  if(dataItem.meta['EventSetSkillEquip'+id]){
    const arr = dataItem.meta['EventSetSkillEquip' + id].split(',');
    if (arr[0] == 0) { arr[0] = $gameVariables.value(2) };
    const actorId = Number(arr[0]);
    const skillId = Number(arr[1]);
    const actor = $gameActors.actor(actorId);
    conditionCount += 1;
    if(!$gameSwitches.value(435) && !actor.isLearnedSkill(skillId)){
      messageText += `[${actor.name()}が特定スキル装着`;
    } else {
      const skill = $dataSkills[skillId];
      if(arr[0] == $gameVariables.value(2)){
        messageText += `[${skill.name}装着`;
      } else {
        messageText += `[${actor.name()}が${skill.name}装着`;
      }
    }
    lineCount += 1;
    if(actor.battleSkillsRaw().includes(skillId)){
      unmetConditionCount += 1;
      metConditionCount += 1;
      messageText += onStatusString;
    } else {
      unmetConditionCount += 1;
      messageText += offStatusString;
    }
  }
}
if(lineCount >= lineBreakCount){messageText += `\n`;lineCount = 0};

//ステート付与が条件
for (let id = 1; id < 10; id++) {
  if(dataItem.meta['EventSetState'+id]){
    let arr = dataItem.meta['EventSetState'+id].split(',');
    if (arr[0] == 0) { arr[0] = $gameVariables.value(2) };
    const actorId = Number(arr[0]);
    const skillId = Number(arr[1]);
    const actor = $gameActors.actor(actorId);
    conditionCount += 1;
    if(arr[0] == $gameVariables.value(2)){
      messageText += `State:[\x1bSIM[${skillId}]`;
    } else {
      messageText += `[${actor.name()}がステート:\x1bSIM[${skillId}]`;
    }
    lineCount += 1;
    if(actor.isStateAffected(skillId)){
      unmetConditionCount += 1;
      metConditionCount += 1;
      messageText += onStatusString;
    } else {
      unmetConditionCount += 1;
      messageText += offStatusString;
    }
  }
}
if(lineCount >= lineBreakCount){messageText += `\n`;lineCount = 0};

//ジョブが条件
for (let id = 1; id < 10; id++) {
  if(dataItem.meta['EventSetJob'+id]){
    let arr = dataItem.meta['EventSetJob'+id].split(',');
    if (arr[0] == 0) { arr[0] = $gameVariables.value(2) };
    const actorId = Number(arr[0]);
    const skillId = Number(arr[1]);
    const actor = $gameActors.actor(actorId);
    conditionCount += 1;
    requirement = 18; 
    if(!$gameSwitches.value(435) && !actor._unlockedClasses.contains(skillId)){
      messageText += `[${actor.name()}が特定ジョブ`;
    } else {
      messageText += `[${actor.name()}がジョブ:\x1bJ[${skillId}]`;
    }
    lineCount += 1;
    if(actor.subclass()){
      if(actor._subclassId == skillId){
        unmetConditionCount += 1;
        metConditionCount += 1;
        messageText += onStatusString;
      } else {
        unmetConditionCount += 1;
        messageText += offStatusString;
      }
    } else {
      unmetConditionCount += 1;
    }
  }
}
if(lineCount >= lineBreakCount){messageText += `\n`;lineCount = 0};

//討伐数が条件
for (let id = 1; id < 10; id++) {
  if(dataItem.meta['EventSetSubjugation'+id]){
    let arr = dataItem.meta['EventSetSubjugation' + id].split(',');
    const actorId = Number(arr[0]);
    const skillId = Number(arr[1]);
    messageText += `[\\C[2]\x1bSIM[${actorId}]\\C[0]:\\C[10]${$gameVariables.value(52)[actorId]}\\C[0]/${skillId}`;
    lineCount += 1;
    if($gameVariables.value(52)[actorId] >= skillId){
      unmetConditionCount += 1;
      metConditionCount += 1;
      messageText += onStatusString;
    } else {
      unmetConditionCount += 1;
      messageText += offStatusString;
    }
  }
}
if(lineCount >= lineBreakCount){messageText += `\n`;lineCount = 0};
if(dataItem.meta['RegistrationC1']){
  messageText += `[条件付き選択肢を選ぶ事で回想登録]`;
  lineCount += 1;
}

//EventSetMoney
if(dataItem.meta['EventSetMoney']){
  let value7 = Number(dataItem.meta['EventSetMoney']);
  if(value7 != 0){
    conditionCount += 1;
    messageText += `[${value7}\\G`;
    if($gameParty.gold() >= value7){
      unmetConditionCount += 1;
      metConditionCount += 1;
      messageText += onStatusString;
    } else {
      unmetConditionCount += 1;
      messageText += offStatusString;
    }
  }
}
//if(value43 >= value42){value5 += `\n`;value43 = 0};

for (let id = 1; id < 10; id++) {
  if(dataItem.meta['EventSetHexpArr' + id]){
    let arr = dataItem.meta['EventSetHexpArr' + id].split(',');
    const actorId = Number(arr[0]);
    const skillId = Number(arr[1]);
    const rankNum = Number(arr[2]);
    const actor = $gameActors.actor(actorId);
    conditionCount += 1;
    if(skillId == 4){//露出度
      textSubst = $gameVariables.value(actorId + 380)[skillId] <= rankNum
      messageText += `[\\C[27]${actor.name()}\\C[0]${$dataSystem.variables[skillId + 400]}${rankNum}以下`;
    } else {
      textSubst = $gameVariables.value(actorId + 380)[skillId] >= rankNum
      messageText += `[\\C[27]${actor.name()}\\C[0]${$dataSystem.variables[skillId + 400]}${rankNum}以上`;
    };
    lineCount += 1;
    if(textSubst){
      unmetConditionCount += 1;
      metConditionCount += 1;
      messageText += onStatusString;
    } else {
      unmetConditionCount += 1;
      messageText += offStatusString;
    }
  }
}
if(lineCount >= lineBreakCount){messageText += `\n`;lineCount = 0};

for (let id = 1; id < 10; id++) {
  if(dataItem.meta['EventSetClothArr' + id]){
    let arr = dataItem.meta['EventSetClothArr' + id].split(',');
    const actorId = Number(arr[0]);
    const skillId = Number(arr[1]);
    const rankNum = Number(arr[2]);
    const actor = $gameActors.actor(actorId);
    conditionCount += 1;
    if(skillId == 41){
      for (let j = 1; j <= $dataItems.length-1; j++) {
        const item = $dataItems[j];
        if (item.meta['TotalCloth']){
          if (Number(item.meta['TotalCloth']) == rankNum){
            if (Number(item.meta['EICSwitch']) == 380+actorId){
              messageText += `[${actor.name()}が${item.name}着用`;
              break;
            }
          }
        }
      }
    } else {
      if(skillId == 0){
        messageText += `[${actor.name()}が${$dataItems[rankNum].name}着用`;
      } else {
        messageText += `[${actor.name()}の${$dataSystem.switches[skillId+460]}に特定衣装`;
      };
    }
    lineCount += 2;
    if($gameVariables.value(actorId + 440)[skillId] == rankNum){
      unmetConditionCount += 1;
      metConditionCount += 1;
      messageText += onStatusString;
    } else {
      unmetConditionCount += 1;
      messageText += offStatusString;
    }
  }
}
if(lineCount >= lineBreakCount){messageText += `\n`;lineCount = 0};

//EventSetMainRoot
if(dataItem.meta['EventSetMainRoot']){
  let arr = dataItem.meta['EventSetMainRoot'].split(',');
  const actorId = Number(arr[0]);
  const skillId = Number(arr[1]);
  if(arr[1] != 0){
    if(arr[0] == 0){
      arr[0] = 135;
    } else {
      conditionCount += 1;
      if(skillId == 49){
        messageText += `[メインクエスト完了後`;
      } else {
        messageText += `[メイン進行[${skillId}]↑`;
      };
      lineCount += 1;
    }
      if($gameVariables.value(actorId) >= skillId){
        unmetConditionCount += 1;
        metConditionCount += 1;
        messageText += onStatusString;
      } else {
        unmetConditionCount += 1;
        messageText += offStatusString;
        eventSceneMissing = 0;
        insufficientMainQuest = 1;
        //value41 += `[メイン進行${skillId}↑]`;
      }
  }
}
//if(value43 >= value42){value5 += `\n`;let value43 = 0};

//変数条件
for (let id = 1; id < 10; id++) {
  if(dataItem.meta['EventSetVal' + id]){
    let arr = dataItem.meta['EventSetVal' + id].split(',');
    const actorId = Number(arr[0]);
    const skillId = Number(arr[1]);
    if(arr[0] == 0){
      arr[0] = 2;
    } else {
      conditionCount += 1;
      if(54 == actorId || 1 == skillId){
        messageText += `[単独行動`;
      } else {
        if(621 <= actorId &&  actorId <= 624){//621からパーティ一人目のアクターID
          messageText += `[${actorId-620}番目:${$gameActors.actor(skillId).name()}`;
        } else {
          textSubst = $dataSystem.variables[actorId];
          textSubst = textSubst.replace("[daysReset]", "");
          textSubst = textSubst.replace("[NoReset]", "");
          textSubst = textSubst.replace("[夜自動]", "");
          textSubst = textSubst.replace("[シーン達成]", "");
          textSubst = textSubst.replace("[挿話達成]", "");
          messageText += `[${textSubst}:${skillId}↑`;
        }
      }
    }
    lineCount += 1;
    if($gameVariables.value(actorId) >= skillId){
      unmetConditionCount += 1;
      metConditionCount += 1;
      messageText += onStatusString;
    } else {
      unmetConditionCount += 1;
      messageText += offStatusString;
    }
  }
}
if(lineCount >= lineBreakCount){messageText += `\n`;lineCount = 0};

//アイテム数
for (let id = 1; id < 10; id++) {
  if(dataItem.meta['EventSetItem' + id]){
    let arr = dataItem.meta['EventSetItem' + id].split(',');
    const actorId = Number(arr[0]);
    const skillId = Number(arr[1]);
    if(arr[0] == 0){
      arr[0] = 11;
    } else {
      conditionCount += 1;
    };
    lineCount += 1;
      messageText += `\x1bIIN[${actorId}:\\C[2]${skillId}\\C[0]]`;
    if($gameParty.numItems($dataItems[actorId]) >= skillId){  
      unmetConditionCount += 1; 
      metConditionCount += 1;
      messageText += onStatusString;
    } else {
      unmetConditionCount += 1;
      messageText += offStatusString;
    }
  }
}
if(lineCount >= lineBreakCount){messageText += `\n`;lineCount = 0};

//アクターが存在するか
if(dataItem.meta['EventEraseActor']){
  const arr = dataItem.meta['EventEraseActor'].split(',');
  textSubst = ` `;
  for (let id = 0; id <= arr.length-1; id++) {
    if(Number(arr[id]) == 0){
      arr[id] = 20;//存在しないアクター
    } else {
      if($gameActors.actor(Number(arr[id])).isLearnedSkill(407)){
        textSubst = `${$gameActors.actor(Number(arr[id])).name()}`;
      } else {
        textSubst = `？？？`;
      };
      conditionCount += 1;
    };
    requirement = $gameActors.actor(Number(arr[id])).isLearnedSkill(18) && !$gameActors.actor(Number(arr[id])).isStateAffected(valueDollStateId);
    if(arr[id] != 20){
      if(requirement){
        cannotExecute = 1;
        messageText += `[＜${textSubst}＞が仲間のため発生不可]`;
      } else {
        messageText += `[＜${textSubst}＞が仲間の場合に発生不可]`;;
      }
      lineCount += 1;
    }
  }
}
if(lineCount >= lineBreakCount){messageText += `\n`;lineCount = 0};

if(dataItem.meta['EventEraseSwi']){
  requirement = Number(dataItem.meta['EventEraseSwi']); 
  if(requirement >= 1){
    textSubst = $dataSystem.switches[requirement];
    textSubst = textSubst.replace("[daysReset]", "");
    textSubst = textSubst.replace("[NoReset]", "");
    textSubst = textSubst.replace("[夜自動]", "");
    textSubst = textSubst.replace("[シーン達成]", "");
    textSubst = textSubst.replace("[挿話達成]", "");
    if($gameSwitches.value(requirement)){
      cannotExecute = 1;
      messageText += `[${textSubst}につき発生不可]`;
    } else {
      messageText += `[${textSubst}で発生不可]`;
    }
    lineCount += 1;
  }
}
if(lineCount >= lineBreakCount){messageText += `\n`;lineCount = 0};

if(dataItem.meta['EventEraseMain']){
  const arr1 = Number(dataItem.meta['EventEraseMain'].split(',')[0]); 
  const arr2 = Number(dataItem.meta['EventEraseMain'].split(',')[1]); 
  if(arr2 >= 1){
    if( $gameVariables.value(arr1) > arr2 ){
      cannotExecute = 1;
      messageText += `[メインクエスト進行につき発生不可]`;
    } else {
      messageText += `[メインクエスト進行＜${arr2}＞で発生不可]`;
    }
    lineCount += 1;
  }
}
if(lineCount >= lineBreakCount){messageText += `\n`;lineCount = 0};

if(dataItem.meta['EventEraseVal']){
  const arr1 = Number(dataItem.meta['EventEraseVal'].split(',')[0]); 
  const arr2 = Number(dataItem.meta['EventEraseVal'].split(',')[1]); 
  if(arr1 >= 1){
    textSubst = $dataSystem.variables[arr1];
    textSubst = textSubst.replace("[daysReset]", "");
    textSubst = textSubst.replace("[NoReset]", "");
    textSubst = textSubst.replace("[夜自動]", "");
    textSubst = textSubst.replace("[シーン達成]", "");
    textSubst = textSubst.replace("[挿話達成]", "");
    if($gameVariables.value(arr1) > arr2){
      cannotExecute = 1;
      messageText += `[${textSubst}一定につき発生不可]`;
    } else {
      messageText += `[${textSubst}一定で発生不可]`;
    };
    lineCount += 1;
  }
}

conditionPrefixText += `${messageText}`;
if(dataItem.meta['NoAddDescription']){}else{
  $dataItems[i].description = `${conditionPrefixText}`;
}
j += 1;
valueSceneName1 = `${$dataItems[i].name}`;
let valueSceneDescription1 = `${$dataItems[i].description}`;
if(unmetConditionCount != metConditionCount){
  valueSceneName1 = `？？？`;
}
if(eventSceneNotExists >= 1 || insufficientMainQuest >= 1 || eventSceneMissing == 0){
  valueSceneDescription1 = `？？？？？？？？？？？？\n`;
  if(showMapName != 0){
    valueSceneDescription1 += `${showMapName}`;
  }
}
if(eventSceneNotExists >= 1){
  valueSceneDescription1 += `[要:前提シーン] `;
}
if(insufficientMainQuest >= 1){
  valueSceneDescription1 += `[要:メインクエスト一定進行] `;
}
if(actorNotJoined >= 1){
  valueSceneDescription1 += `[要:未加入キャラ] `;
}
if(mainQuestProgress != 0){
  if($gameVariables.value(356)[value11] != 0 || value11 == 2){
    valueSceneDescription1 += `${mainQuestProgress}`;
  } else {
    valueSceneDescription1 += `[未到達マップ]`;
  }
} else {

if($gameSwitches.value(value24 + i)){// || $gameSwitches.value(435) && !$gameParty.hasItem($dataItems[i])
  value10 += 1;

} else {

if(marGenScene1 >= 1 && cannotExecute == 0){

  if(marGenScene1 >= 1){
    if(id1 ==1){$gameSwitches.setValue(479,true)};
    if(id1 ==2){$gameSwitches.setValue(480,true)};
  }
  if(inBattle == 1 && $gameParty.inBattle()){
    BattleManager._logWindow.push(`addText`, conditionPrefixText);
  }

  value10 += 1;
  let value14 = `${valueSceneName1}\n${valueSceneDescription1}\n`;
/*   let value15 = 1; //WARN not using? temp commented
  if (value10 >= 81) { value15 = 10 }
  else if (value10 >= 71) { value15 = 9 }
  else if (value10 >= 61) { value15 = 8 }
  else if (value10 >= 51) { value15 = 7 }
  else if (value10 >= 41) { value15 = 6 }
  else if (value10 >= 31) { value15 = 4 }
  else if (value10 >= 21) { value15 = 3 }
  else if (value10 >= 11) { value15 = 2 } */
    if(unmetConditionCount == metConditionCount){
      var value0 = `${value14}`;
      eval("valueWordSet" + valueCountSet2 +" += value0");
      valueCountSet1 += 1;
        if((valueCountSet1 %10) == 0){
          valueCountSet2 += 1;
          eval("valueWordSet" + valueCountSet2 +" = value46");
        };
      $gameSwitches.setValue(i+value23,true);//発生用スイッチ
        if(valueCountDefeatSwitch1 >= 1){
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
            if(inBattle ==1){
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
          if(inBattle ==1){
            $gameVariables.setValue(value26,$gameVariables.value(value26)+1);
          }
        } else{ 
            $gameVariables.setValue(value26,$gameVariables.value(value26)+1);
        };

     };

} else {
      var value0 = `\\C[1]${tempAssignSceneOccurText}\\C[0]`;
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

for(let i = 621; i <= 624; i++){$gameVariables.setValue(i, 0)};

const battlers = $gameParty.battleMembers();
const battlersCount = battlers.length;
for (let i = 0; i < battlersCount; i++) { //621-624のみ表記を変更。`${n-620}番目:${$gameActors.actor(n).name()}`
  let battlerId = battlers[i].actorId();
  $gameVariables.setValue(621 + i, battlerId);
};
$gameVariables.setValue(54, battlersCount);//パーティ人数。1の時は[単独行動]表記

valueCountSet1 = 0;
valueCountSet2 = 1;
value46 = ` `;
eval("valueWordSet" + valueCountSet2 +" = value46");
value10 = 0;//そのマップで発生するシーン数
//value15 = 1;//変数800+value15で表示するための変数
j = 0;//配列を番号順に居れるため

let start, end, value23, value24, value25, value26;
if(id1 == 1){
  $gameSwitches.setValue(479,false);
  $gameSwitches.setValue(367,false);
  start = 401;
  end = 500;
  value23 = 800;
  value24 = 900;
  value25 = 517;//成立数変数
  value26 = 518;//未成立数変数
  $gameVariables.setValue(517, 0);
  $gameVariables.setValue(518, 0);
}
else if(id1 == 2){
  $gameSwitches.setValue(480,false);
  $gameSwitches.setValue(369,false);
  start = 501;
  end = 600;
  value23 = 500;
  value24 = 600;
  value25 = 504;//成立数変数
  value26 = 505;//未成立数変数
  $gameVariables.setValue(504, 0);
  $gameVariables.setValue(505, 0);
}
else {
  console.warn(`id1 is ${id1}! must be 1 or 2!`);
}

for (let i = start; i <= end; i++) {
  scene_joukenNakami(id1,i,value23,value24,value25,value26);
}

let arrAdd;
if(id1 == 1){
  value25 = 517;//成立数変数
  value26 = 518;//未成立数変数
  arrAdd = valueSouwasceneAddId;
}
else if(id1 == 2){
  value25 = 504;//成立数変数
  value26 = 505;//未成立数変数
  arrAdd = valueHsceneAddId;
}
else{
  console.warn(`id1 is ${id1}! must be 1 or 2!`);
}

//アイテムID<HsceneItem><SouwaItem>
for (const id of arrAdd) {
  const item = $dataItems[id];
  const addEventIncidenceSwiNum = Number(item.meta['AddEventIncidenceSwi']);//発生スイッチ。リセットなしの1601-1700の間に実行。
  const addEventCompSwiNum = Number(item.meta['AddEventCompSwi']);//達成スイッチ
  const addAddEventCommonIdNum = Number(item.meta['AddAddEventCommonId']);//コモID。並列スイッチも逆算して代入。スクリプト内では使わない
  const addEventParallelSwiNum = Number(item.meta['AddEventParallelSwi']);//並列スイッチ
  scene_joukenNakami(id1,id,addEventIncidenceSwiNum,addEventCompSwiNum,value25,value26,addAddEventCommonIdNum,addEventParallelSwiNum);
}

$gameVariables.setValue(195,valueCountSet1);//表示時の個数を入れる事でコモンイベントのウィンド数を抑制

if($gameVariables.value(517) >= 1){
  $gameSwitches.setValue(367,true);//挿話ナヴィ発生スイッチ
}
if($gameVariables.value(504) >= 1){
  $gameSwitches.setValue(369,true);//シーンナヴィ発生スイッチ
}


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
