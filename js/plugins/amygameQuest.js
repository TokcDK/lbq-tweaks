/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

(function(){

//クエスト報酬設定。クエストで変数21-23は報酬で使っているので使用不可。
quest_housyuukeisan = function (id1) {
  //WARN: valueCountSet1 and valueCountSet2 is not changing here! Some init values?
  var valueCountSet1 = 0;
  var valueCountSet2 = 0;
  
  let valueCountSet3 = `\n\\C[16]●追加報酬\\C[0]\n`;
  let id2 = Number(valueQuestRankD[1]);
  let id3 = Number(valueQuestRankD[2]);
  const itemData = $dataItems[id1];
  const id4 = itemData.iconIndex;

  switch (id4) {
    case 422: // C
    case 426: // EX,C報酬
      id2 = Number(valueQuestRankC[1]);
      id3 = Number(valueQuestRankC[2]);
      break;
    case 423: // B
      id2 = Number(valueQuestRankB[1]);
      id3 = Number(valueQuestRankB[2]);
      break;
    case 424: // A
      id2 = Number(valueQuestRankA[1]);
      id3 = Number(valueQuestRankA[2]);
      break;
    case 425: // S
      id2 = Number(valueQuestRankS[1]);
      id3 = Number(valueQuestRankS[2]);
      break;
  }

  let j = 0;
  for (const i1 in itemData.meta) {
    if (!itemData.meta.hasOwnProperty(i1) || !i1.startsWith('QuestSpcialPrice')) continue;

    const arr1 = itemData.meta[i1].split(',');
    const itemType = Number(arr1[0]);

    let item;
    switch (itemType) {
      case 0:
        item = $dataItems[Number(arr1[1])];
        break;
      case 1:
        item = $dataWeapons[Number(arr1[1])];
        break;
      case 2:
        item = $dataArmors[Number(arr1[1])];
        break;
      case 4:
        item = $dataItems[10];
        break;
      default:
        continue;
    }

    if ($gameSwitches.value(518)) {
      $gameParty.gainItem(item, Number(arr1[2]));
    }

    if (itemType === 3) {
      valueCountSet3 += `[\\C[2]${Number(arr1[2])}\\C[0]\\G] `;
    } else {
      valueCountSet3 += `[${item.name}:\\C[2]+${Number(arr1[2])}\\C[0]] `;
    }

    j += 1;
    if (j % 3 === 0) {
      valueCountSet3 += `\n`;
    }
  }
};

quest_settei_get_valueItems_iwa = function (arr, i) {

  const id = Number(arr[1]);
  switch (id) {
    case 0:
      valueQuestArray1[arr[0]] = [1, i];
      return $dataItems;
    case 1:
      valueQuestArray1[arr[0] + 2000] = [2, i];
      return $dataWeapons;
    case 2:
      valueQuestArray1[arr[0] + 3000] = [3, i];
      return $dataArmors;
    default:
      console.error(`quest_settei_get_valueItems_iwa: id(${id}}) is not 0,1,2!`);
      return null;
  }
}

//クエストの解説、発生、達成の設定value12までで10が未使用value8
quest_settei = function (id5) {

  let start;
  let end;
  let id6;
  if (id5 == 1) {
    valueQuestArray1 = Array(4001).fill([]);//クエスト達成用アイテムごと表示用配列
    start = 801;
    end = 900;
    id6 = 800;
  }
  else if (id5 == 2) {
    start = 1001;
    end = 1050;
    id6 = 900;
  }
  else {
    console.error(`quest_settei: id5 is not 1 or 2. id5=${id5}!`);
    return;
  }

  for (let i = start; i <= end; i++) {
    quest_settei_item($dataItems[i], id6);
  }

}

quest_settei_item = function (item, id6) {

  if (!item || !item.name) return;

  let actor = $gameActors.actor($gameVariables.value(2));

  let questSetParsed = 0;//発生条件
  let questSetOn = 0;//発生条件
  let questSetMessageText = `\\C[16]●発生条件\\C[0]\n`;//発生条件

  let questCompMessageText = `\\C[16]●達成条件\\C[0]\n`;
  let questCompParsed = 0;//達成条件
  let questCompOn = 0;//達成条件
  
  const itemMeta = item.meta;

  //発生条件

  //冒険者ランクで発生
  if (itemMeta['QuestSetRank']) {
    const itemQuestSetRankId = Number(itemMeta['QuestSetRank']);
    if (itemQuestSetRankId >= 1) {
      //let value14 = valueQuestRankD[0];let arr1 = [valueQuestRankD[1],valueQuestRankD[2]];
      //if(value13 == 1){let value14 = valueQuestRankC[0];let arr1 = [valueQuestRankC[1],valueQuestRankC[2]]};
      //if(value13 == 2){let value14 = valueQuestRankB[0];let arr1 = [valueQuestRankB[1],valueQuestRankB[2]]};
      //if(value13 == 3){let value14 = valueQuestRankA[0];let arr1 = [valueQuestRankA[1],valueQuestRankA[2]]};
      //if(value13 == 4){let value14 = valueQuestRankS[0];let arr1 = [valueQuestRankS[1],valueQuestRankS[2]]};
      //value7 += `[\x1bSIN[${value14}]]\n\\C[2]報酬\\C[0]\n${arr1[0]}\\G\n${arr1[1]}${$dataItems[10].name}\n`;
      questSetMessageText += `\\C[10]【ランク制限】\\C[0]`;

      let itemId;
      if (itemQuestSetRankId >= 3) { itemId = 695 }
      else if (itemQuestSetRankId === 2) { itemId = 694 }
      else if (itemQuestSetRankId === 1) { itemId = 693 }

      if ($gameParty.hasItem($dataItems[itemId], true)) {
        questSetOn += 1;
        questSetMessageText += `\\C[14]〇\\C[0]\n`;
      } else {
        questSetMessageText += `\\C[12]×\\C[0]\n`;
      };
      questSetParsed += 1;
    };
  };

  //視点が誰か441
  if (itemMeta['QuestSetPerspective']) {
    const itemQuestSetPerspective = Number(itemMeta['QuestSetPerspective']);
    if (itemQuestSetPerspective >= 1) {
      if (itemQuestSetPerspective != $gameVariables.value(2)) {
        questSetMessageText += `[${$gameActors.actor(itemQuestSetPerspective).name()}視点]\n`;
      };
    };
    if ($gameSwitches.value(itemQuestSetPerspective + 440)) {
      questSetOn += 1;
    }
    questSetParsed += 1;
  };

  if (itemMeta['NoteWord']) {
    questSetMessageText += `[${itemMeta['NoteWord']}]`;
  };

  //アクターが存在するか
  let needNewLine = false;
  if (itemMeta['QuestSetActor']) {
    let arr = itemMeta['QuestSetActor'].split(',').map(Number);
    for (let id = 0, len = arr.length; id < len; id++) {
      if ((arr[id]) === 0) {
        arr[id] = $gameVariables.value(2);//誰でもいいアクター
      };
      const actor = $gameActors.actor((arr[id]));
      if ((arr[id]) != $gameVariables.value(2)) {
        questSetMessageText += `[${actor.name()}]`;
        needNewLine = true;
      };
      let value13 = actor.isLearnedSkill(18) && !actor.isStateAffected(valueDollStateId);
      if (value13) {
        questSetOn += 1;
        questSetMessageText += `\\C[14]〇\\C[0]`;
      } else {
        questSetMessageText += `\\C[12]×\\C[0]`;
      };

      questSetParsed += 1;
    }
  };
  if (needNewLine) { questSetMessageText += `\n` };

  //マップ発生条件Number(value2)
  if (itemMeta['QuestSetMap']) {
    let value2 = Number(itemMeta['QuestSetMap']);
    if (value2 == 0) { value2 = 2 };
    //amygameDescription.jsで実行。if(value2 == 2){}else{value.description += `【場所:${$dataSystem.switches[value2]}】`};
    if ($gameSwitches.value(value2)) {
      questSetOn += 1;
    }

    questSetParsed += 1;
  }

  //スイッチ発生条件Number(value2)
  if (itemMeta['QuestSetSwi']) {
    let value2 = Number(itemMeta['QuestSetSwi']);
    if (value2 == 0) { value2 = 2 };
    if (value2 !== 2) {
      const value13 = scene_joukenNakami_clean_prefixes($dataSystem.switches[value2]);
      questSetMessageText += `【${value13}`;
    };
    if ($gameSwitches.value(value2)) {
      questSetOn += 1;
      questSetMessageText += `\\C[14]〇\\C[0]】\n`;
    } else {
      questSetMessageText += `\\C[12]×\\C[0]】\n`;
    };

    questSetParsed += 1;
  }

  //メインクエスト進行度発生条件Number(arr[0])
  if (itemMeta['QuestSetMainRoot']) {
    let arr = itemMeta['QuestSetMainRoot'].split(',').map(Number);
    if ((arr[0]) == 0) { arr[0] = 135 };
    if ((arr[1]) == 0) { } else { questSetMessageText += `【メインクエスト進行[${(arr[1])}]以上` };
    if ($gameVariables.value((arr[0])) >= (arr[1])) {
      questSetOn += 1;
      questSetMessageText += `\\C[14]〇\\C[0]】\n`;
    } else {
      questSetMessageText += `\\C[12]×\\C[0]】\n`;
    };

    questSetParsed += 1;
  }

  //変数による発生条件Number(arr[0])
  for (let id = 1; id < 10; id++) {
    if (itemMeta['QuestSetVal' + id]) {
      const arr = itemMeta['QuestSetVal' + id].split(',').map(Number);
      if ((arr[0]) == 0) { arr[0] = 2 };
      if (arr[0] == 2) { } else {
        const value13 = scene_joukenNakami_clean_prefixes($dataSystem.variables[(arr[0])]);
        questSetMessageText += `【${value13} ${$gameVariables.value((arr[0]))}/${(arr[1])}`;
        if ($gameVariables.value((arr[0])) >= (arr[1])) {
          questSetOn += 1;
          questSetMessageText += `\\C[14]〇\\C[0]】\n`;
        } else {
          questSetMessageText += `\\C[12]×\\C[0]】\n`;
        };

        questSetParsed += 1;
      };
    };
  }

  //性欲度等による発生条件
  for (let id = 1; id < 10; id++) {
    if (itemMeta['QuestSetHexpArr' + id]) {
      const arr = itemMeta['QuestSetHexpArr' + id].split(',').map(Number);
      actor = $gameActors.actor((arr[0]));
      let value13;
      if ((arr[1]) == 4) {//露出度
        value13 = $gameVariables.value((arr[0]) + 380)[(arr[1])] <= (arr[2])
        questSetMessageText += `[\\C[27]${actor.name()}\\C[0]${$dataSystem.variables[(arr[1]) + 400]}${Number(arr[2])}以下`;
      } else {
        value13 = $gameVariables.value((arr[0]) + 380)[(arr[1])] >= (arr[2])
        questSetMessageText += `[\\C[27]${actor.name()}\\C[0]${$dataSystem.variables[(arr[1]) + 400]}${Number(arr[2])}以上`;
      };
      if (value13) {
        questSetOn += 1;
        questSetMessageText += `\\C[14]〇\\C[0]】\n`;
      } else {
        questSetMessageText += `\\C[12]×\\C[0]】\n`;
      };

      questSetParsed += 1;
    };
  }
  //スキルによる発生条件Number(arr[0])
  if (itemMeta['QuestSetSkill']) {
    actor = $gameActors.actor($gameVariables.value(2));
    const arr = itemMeta['QuestSetSkill'].split(',').map(Number);
    if ((arr[0]) >= 1) {
      actor = $gameActors.actor((arr[0]));
    };
    if ((arr[1]) === 0) { arr[1] = 18 };
    if ((arr[1]) !== 18) {
      if ((arr[0]) == $gameVariables.value(2)) {
        questSetMessageText += `【${$dataSkills[(arr[1])].name}習得`;
      } else {
        questSetMessageText += `【${actor.name()}が${$dataSkills[(arr[1])].name}習得`;
      };
    };
    if (actor.isLearnedSkill((arr[1]))) {
      questSetOn += 1;
      questSetMessageText += `\\C[14]〇\\C[0]】\n`;
    } else {
      questSetMessageText += `\\C[12]×\\C[0]】\n`;
    };

    questSetParsed += 1;
  };
  //actor.battleSkillsRaw().includes(Number(arr[1]))
  //スキル装着による発生条件Number(arr[0])
  if (itemMeta['QuestSetSkillEquip']) {
    const arr = itemMeta['QuestSetSkillEquip'].split(',').map(Number);
    if ((arr[0]) === 0) {
      arr[0] = $gameVariables.value(2);
    };
    actor = $gameActors.actor((arr[0]));
    if ((arr[1]) === 0) { arr[1] = 18 };
    if ((arr[1]) !== 18) {
      if ((arr[0]) == $gameVariables.value(2)) {
        questSetMessageText += `【${$dataSkills[(arr[1])].name}装着`;
      } else {
        questSetMessageText += `【${actor.name()}が${$dataSkills[(arr[1])].name}装着`;
      };
    };
    if (actor.battleSkillsRaw().includes((arr[1]))) {
      questSetOn += 1;
      questSetMessageText += `\\C[14]〇\\C[0]】\n`;
    } else {
      questSetMessageText += `\\C[12]×\\C[0]】\n`;
    };

    questSetParsed += 1;
  };
  //スキルランクによる発生条件Number(arr[0])
  if (itemMeta['QuestSetSkillRank']) {
    actor = $gameActors.actor($gameVariables.value(2));
    const arr = itemMeta['QuestSetSkillRank'].split(',').map(Number);
    if ((arr[0]) >= 1) {
      actor = $gameActors.actor((arr[0]));
    };
    if ((arr[1]) === 0) { arr[1] = 18 };
    if ((arr[1]) !== 18)  {
      if ((arr[0]) == $gameVariables.value(2)) {
        questSetMessageText += `【${$dataSkills[(arr[1])].name}ランク${(arr[2])}以上`;
      } else {
        questSetMessageText += `【${actor.name()}が${$dataSkills[(arr[1])].name}ランク${(arr[2])}以上`;
      };
    };
    if (actor.isLearnedSkill((arr[1])) && actor.skillMasteryLevel((arr[1])) >= (arr[2])) {
      questSetOn += 1;
      questSetMessageText += `\\C[14]〇\\C[0]】\n`;
    } else {
      questSetMessageText += `\\C[12]×\\C[0]】\n`;
    };

    questSetParsed += 1;
  };
  //ステート付与による発生条件Number(arr[0])actor.isStateAffected(61)
  if (itemMeta['QuestSetState']) {
    let arr = itemMeta['QuestSetState'].split(',').map(Number);
    if ((arr[0]) == 0) {
      arr[0] = $gameVariables.value(2);
    };
    actor = $gameActors.actor((arr[0]));
    if ((arr[1]) === 0) { arr[1] = 600 };
    if ((arr[1]) !== 600) {
      if ((arr[0]) === $gameVariables.value(2)) {
        questSetMessageText += `【\x1bSIM[${(arr[1])}]`;
      } else {
        questSetMessageText += `【${actor.name()}が\x1bSIM[${(arr[1])}]`;
      };
    };
    if (actor.isStateAffected((arr[1]))) {
      questSetOn += 1;
      questSetMessageText += `\\C[14]〇\\C[0]】\n`;
    } else {
      questSetMessageText += `\\C[12]×\\C[0]】\n`;
    };

    questSetParsed += 1;
  };
  //アイテムによる発生条件Number(arr[0])
  if (itemMeta['QuestSetItem']) {
    let arr = itemMeta['QuestSetItem'].split(',');
    const valueItems = get_valueItems_iwa((arr[0]));
    if ((arr[1]) === 0) arr[1] = 5;
    if ((arr[1]) !== 5) { questSetMessageText += `【${valueItems[(arr[1])].name}所持` };

    if ($gameParty.numItems(valueItems[(arr[1])]) >= (arr[2])) {
      questSetOn += 1;
      questSetMessageText += `\\C[14]〇\\C[0]】\n`;
    } else {
      questSetMessageText += `\\C[12]×\\C[0]】\n`;
    };

    questSetParsed += 1;
  };
  //討伐数による発生条件Number(arr[0])
  const gameVar52Array = $gameVariables.value(52);
  if (itemMeta['QuestSetSubjugation']) {
    let arr = itemMeta['QuestSetSubjugation'].split(',').map(Number);
    if ((arr[0]) == 0) { arr[0] = 421 };
    if (arr[0] >= 3) {
      questSetMessageText += `【\x1bSIM[${(arr[0])}]\\C[10]${(arr[1])}\\C[0]体討伐`;
    } else {
      if (arr[0] == 1) {
        questSetMessageText += `【\\C[2]当日魔物討伐数\\C[0]:${gameVar52Array[(arr[0])]}/${(arr[1])}`;
      }
      if (arr[0] == 2) {
        questSetMessageText += `【\\C[2]総魔物討伐数\\C[0]:${gameVar52Array[(arr[0])]}/${(arr[1])}`;
      };
    };
    if (gameVar52Array[(arr[0])] >= (arr[1])) {
      questSetOn += 1;
      questSetMessageText += `\\C[14]〇\\C[0]】\n`;
    } else {
      questSetMessageText += `\\C[12]×\\C[0]】\n`;
    };

    questSetParsed += 1;
  };
  //アイテム所持による発生条件Number(arr[0])SG種別
  if (itemMeta['QuestSetItemArr']) {
    let arr = itemMeta['QuestSetItemArr'].split(',').map(Number);
    for (let id = 0, len = arr.length; id < len; id++) {
      if ((arr[id]) == 0) { arr[id] = 5 };
      const itemId = arr[id];
      if (itemId !== 5) {
        const itemEICSwitch = $dataItems[itemId].meta['EICSwitch'];
        if (itemEICSwitch) {
          const itemEICSwitchId = Number(itemEICSwitch);
          if (itemEICSwitchId == 102) { questSetMessageText += `【挿話:` }
          else if (itemEICSwitchId == 103) { questSetMessageText += `【シーン:` }
          else if (itemEICSwitchId == 104) { questSetMessageText += `【称号:` }
          else if (itemEICSwitchId == 105) { questSetMessageText += `【H称号:` }

        } else {
          if ($dataItems[itemId].meta['SG種別']) {
            if (Number($dataItems[itemId].meta['SG種別']) == 1) { questSetMessageText += `【クエスト:` };
          } else {
            questSetMessageText += `【`;
          };
        };
        questSetMessageText += `\x1bIIN[${itemId}]`;
        if ($gameParty.hasItem($dataItems[itemId], true)) {
          questSetOn += 1;
          questSetMessageText += `\\C[14]〇\\C[0]】\n`;
        } else {
          questSetMessageText += `\\C[12]×\\C[0]】\n`;
        };

        questSetParsed += 1;
      };
    };
  };

  //ここから達成条件

  //視点が誰か441
  if (itemMeta['QuestCompPerspective']) {
    let value13 = Number(itemMeta['QuestCompPerspective']);
    if (value13 >= 1) {
      if (value13 != $gameVariables.value(2)) {
        questCompMessageText += `[${$gameActors.actor(value13).name()}視点`;
      };
    };
    if ($gameSwitches.value(value13 + 440)) {
      questCompOn += 1;
      questCompMessageText += `\\C[14]〇\\C[0]]\n`;
    } else {
      questCompMessageText += `\\C[12]×\\C[0]]\n`;
    };

    questCompParsed += 1;
  };
  //アクターが存在するか
  needNewLine = false;
  if (itemMeta['QuestCompActor']) {
    let arr = itemMeta['QuestCompActor'].split(',');
    for (let id = 0, len = arr.length; id < len; id++) {
      if ((arr[id]) == 0) {
        arr[id] = $gameVariables.value(2);//誰でもいいアクター
      };
      actor = $gameActors.actor((arr[id]));
      questCompMessageText += `[${actor.name()}`;
      needNewLine = true;
      let value13 = actor.isLearnedSkill(18) && !actor.isStateAffected(valueDollStateId);
      if (value13) {
        questCompOn += 1;
        questCompMessageText += `\\C[14]〇\\C[0]]`;
      } else {
        questCompMessageText += `\\C[12]×\\C[0]]`;
      };

      questCompParsed += 1;
    }
  };
  if (needNewLine) { questSetMessageText += `\n` };

  //討伐数による達成条件Number(arr[0])
  for (let id = 1; id < 10; id++) {
    if (itemMeta['QuestCompSubjugation' + id]) {
      let arr = itemMeta['QuestCompSubjugation' + id].split(',').map(Number);
      if (arr[0] <= 5) {
        if (arr[0] == 1) {
          questCompMessageText += `【\\C[2]当日魔物討伐数\\C[0]:${gameVar52Array[(arr[0])]}/${(arr[1])}`;
        }
        else if (arr[0] == 2) {
          questCompMessageText += `【\\C[2]総魔物討伐数\\C[0]:${gameVar52Array[(arr[0])]}/${(arr[1])}`;
        };
      } else {
        questCompMessageText += `【\\C[2]\x1bSIM[${(arr[0])}]\\C[0]:${gameVar52Array[(arr[0])]}/${(arr[1])}`;
      };
      if (gameVar52Array[(arr[0])] >= (arr[1])) {
        questCompOn += 1;
        questCompMessageText += `\\C[10]達成\\C[0]】\n`;
      } else {
        questCompMessageText += `\\C[1]未達成\\C[0]】\n`;
      };

      questCompParsed += 1;
    };
  }

  quest_settei_QuestComp1 = function (metaName, messageOn, messageOff) {
    for (let id = 1; id < 10; id++) {
      if (itemMeta[metaName + id]) {
        const arr = itemMeta[metaName + id].split(',');
        const valueItems = quest_settei_get_valueItems_iwa(arr, i);
        if (arr[0] == 0) arr[0] = 5;
        const itemId = arr[0];
        if (itemId != 5) {
          questCompMessageText += `【\\C[2]${valueItems[itemId].name}\\C[0]:${$gameParty.numItems(valueItems[itemId]) }/${arr[2]}`;
        };

        if ($gameParty.numItems(valueItems[itemId]) >= arr[2]) {
          questCompOn += 1;
          if (itemId != 5) questCompMessageText += `\\C[10]${messageOn}}\\C[0]】\n`;
        } else {
          if (itemId != 5) questCompMessageText += `\\C[1]${messageOff}\\C[0]】\n`;
        };

        questCompParsed += 1;
      };
    }
  }

  for (const questCompData of [
    ['QuestCompcollect', `達成`, `未達成`], //アイテム数による達成条件
    ['QuestCompDelivery', `納品可能`, `納品不可`] //アイテム数を納品による達成条件
  ]) { 
    quest_settei_QuestComp1(questCompData[0], questCompData[1], questCompData[2]);
  }

  //変数による達成条件Number(arr[0])
  for (let id = 1; id < 10; id++) {
    if (itemMeta['QuestCompVal' + id]) {
      const arr = itemMeta['QuestCompVal' + id].split(',').map(Number);
      if (arr[0] == 0) { arr[0] = 2 };
      if (arr[0] != 2) {
        const value13 = scene_joukenNakami_clean_prefixes($dataSystem.variables[(arr[0])]);
        questCompMessageText += `【\\C[2]${value13}\\C[0]:${$gameVariables.value((arr[0]))}/${(arr[1])}`;
        if ($gameVariables.value((arr[0])) >= (arr[1])) {
          questCompOn += 1;
          questCompMessageText += `\\C[10]達成\\C[0]】\n`;
        } else {
          questCompMessageText += `\\C[1]未達成\\C[0]】\n`;
        };

        questCompParsed += 1;
      };
    };
  }
  //変数配列による達成条件Number(arr[0])
  for (let id = 1; id < 10; id++) {
    if (itemMeta['QuestCompArray' + id]) {
      const arr = itemMeta['QuestCompArray' + id].split(',').map(Number);
      if ((arr[0]) == 0) { arr[0] = 2 };
      if (arr[0] == 2) { } else {
        questCompMessageText += `【\\C[2]${$dataSystem.variables[(arr[0])]}\\C[0]:${$gameVariables.value((arr[0]))[(arr[1])]}/${(arr[2])}`;
        if ($gameVariables.value((arr[0]))[(arr[1])] >= (arr[2])) {
          questCompOn += 1;
          questCompMessageText += `\\C[10]達成\\C[0]】\n`;
        } else {
          questCompMessageText += `\\C[1]未達成\\C[0]】\n`;
        };

        questCompParsed += 1;
      };
    };
  }
  //スキル習得による達成条件
  for (let id = 1; id < 10; id++) {
    if (itemMeta['QuestCompSkill' + id]) {
      actor = $gameActors.actor($gameVariables.value(2));
      const arr = itemMeta['QuestCompSkill' + id].split(',').map(Number);
      if ((arr[0]) >= 1) {
        actor = $gameActors.actor((arr[0]));
      };
      if ((arr[1]) == 0) { arr[1] = 18 };
      if (arr[1] !== 18) {
        if ((arr[0]) == $gameVariables.value(2)) {
          questCompMessageText += `【\\C[2]${$dataSkills[(arr[1])].name}\\C[0]:`;
        } else {
          questCompMessageText += `【${actor.name()}が\\C[2]${$dataSkills[(arr[1])].name}\\C[0]:`;
        };
        if (actor.isLearnedSkill((arr[1]))) {
          questCompOn += 1;
          questCompMessageText += `\\C[10]習得\\C[0]】\n`;
        } else {
          questCompMessageText += `\\C[1]未習得\\C[0]】\n`;
        };

        questCompParsed += 1;
      };
    };
  }
  //スキル装着による達成条件
  for (let id = 1; id < 10; id++) {
    if (itemMeta['QuestCompSkillEquip' + id]) {
      actor = $gameActors.actor($gameVariables.value(2));
      const arr = itemMeta['QuestCompSkillEquip' + id].split(',').map(Number);
      if ((arr[0]) >= 1) {
        actor = $gameActors.actor((arr[0]));
      };
      if ((arr[1]) == 0) { arr[1] = 18 };
      if (arr[1] != 18) {
        if ((arr[0]) == $gameVariables.value(2)) {
          questCompMessageText += `【\\C[2]${$dataSkills[(arr[1])].name}\\C[0]:`;
        } else {
          questCompMessageText += `【${actor.name()}が\\C[2]${$dataSkills[(arr[1])].name}\\C[0]:`;
        };
        if (actor.battleSkillsRaw().includes((arr[1]))) {
          questCompOn += 1;
          questCompMessageText += `\\C[10]装着\\C[0]】\n`;
        } else {
          questCompMessageText += `\\C[1]未装着\\C[0]】\n`;
        };

        questCompParsed += 1;
      };
    };
  }
  //スキルランクによる達成条件
  for (let id = 1; id < 10; id++) {
    if (itemMeta['QuestCompSkillRank' + id]) {
      actor = $gameActors.actor($gameVariables.value(2));
      const arr = itemMeta['QuestCompSkillRank' + id].split(',').map(Number);
      if ((arr[0]) >= 1) {
        actor = $gameActors.actor(Number(arr[0]));
      };
      if ((arr[1]) == 0) { arr[1] = 18 };
      if (arr[1] != 18) {
        if ((arr[0]) == $gameVariables.value(2)) {
          questCompMessageText += `【\\C[2]${$dataSkills[(arr[1])].name}\\C[0]ランク${(arr[2])}:`;
        } else {
          questCompMessageText += `【${actor.name()}が\\C[2]${$dataSkills[(arr[1])].name}\\C[0]ランク${Number(arr[2])}:`;
        };
        if (actor.skillMasteryLevel((arr[1])) >= (arr[2])) {
          questCompOn += 1;
          questCompMessageText += `\\C[10]達成\\C[0]】\n`;
        } else {
          questCompMessageText += `\\C[1]未達成\\C[0]】\n`;
        };

        questCompParsed += 1;
      };
    };
  }
  //ステート付与による達成条件
  for (let id = 1; id < 10; id++) {
    if (itemMeta['QuestCompState' + id]) {
      actor = $gameActors.actor($gameVariables.value(2));
      const arr = itemMeta['QuestCompState' + id].split(',').map(Number);
      const actorId = (arr[0]);
      if (actorId >= 1) {
        actor = $gameActors.actor(actorId);
      };
      if (arr[1] == 0) { arr[1] = 600 };
      if (arr[1] != 600) {
        if (actorId == $gameVariables.value(2)) {
          questCompMessageText += `【\\C[2]\x1bSIM[${(arr[1])}]\\C[0]:`;
        } else {
          questCompMessageText += `【${actor.name()}が\\C[2]\x1bSIM[${(arr[1])}]\\C[0]:`;
        };
        if (actor.isStateAffected((arr[1]))) {
          questCompOn += 1;
          questCompMessageText += `\\C[10]付与\\C[0]】\n`;
        } else {
          questCompMessageText += `\\C[1]未付与\\C[0]】\n`;
        };

        questCompParsed += 1;
      };
    };
  }
  //スイッチ達成条件Number(value8)
  if (itemMeta['QuestCompSwi']) {
    let switchId = Number(itemMeta['QuestCompSwi']);
    if (switchId === 0) { switchId = 2 };
    if (switchId !== 2) {
      const value13 = scene_joukenNakami_clean_prefixes($dataSystem.switches[switchId]);
      questCompMessageText += `【\\C[2]${value13}\\C[0]:`
      if ($gameSwitches.value(switchId)) {
        questCompOn += 1;
        questCompMessageText += `\\C[10]達成\\C[0]】\n`;
      } else {
        questCompMessageText += `\\C[1]未達成\\C[0]】\n`;
      };

      questCompParsed += 1;
    };
  };

  if (questCompMessageText == `\\C[16]●達成条件\\C[0]\n`) { questCompMessageText = `\\C[16]●達成条件なし\\C[0]` };
  if (questSetMessageText == `\\C[16]●発生条件\\C[0]\n`) { questSetMessageText += `【なし】\n` };
  valueQuestArray7[i - id6] = questSetMessageText;
  valueQuestArray4[i - id6] = `${$dataItems[i].description}\n`;
  if (itemMeta['QuestSupplement']) {
    let value9 = itemMeta['QuestSupplement'];
    valueQuestArray4[i - id6] += `${value9}`;
  };
  //寄付金
  if (itemMeta['QuestCompMoney']) {
    const value13 = Number(itemMeta['QuestCompMoney']);
    if (value13 >= 1) {
      if (value13 !== 0) {
        questCompMessageText += `【\\C[2]${value13}\\G`;
      };
    };
    if ($gameParty.gold() >= value13) {
      questCompOn += 1;
      questCompMessageText += `\\C[14]〇\\C[0]】\n`;
    } else {
      questCompMessageText += `\\C[12]×\\C[0]】\n`;
    };

    questCompParsed += 1;
  };

  //報酬算定。valueCountSet1,2.3に変更
  quest_housyuukeisan(i);
  //console.log(value1.length);
  const i_id6 = i - id6;
  valueQuestArray4[i_id6] += `\\C[16]●規定ランク報酬\\C[0]\n`;
  valueQuestArray4[i_id6] += `[\\C[2]${valueCountSet1}\\C[0]\\G][\\C[2]${valueCountSet2}\\C[0]${$dataItems[10].name}]${valueCountSet3}`;
  valueQuestArray4[i_id6] += `\n`;
  valueQuestArray4[i_id6] += `${questSetMessageText}`;
  //valueQuestArray4[i-id6] += `\n`;
  valueQuestArray4[i_id6] += `${questCompMessageText}`;

  valueQuestArray3[i_id6] = `\\FS[22]`;
  valueQuestArray3[i_id6] += `\\C[16]●規定ランク報酬\\C[0]\n`;
  valueQuestArray3[i_id6] += `[${valueCountSet1}\\G][${valueCountSet2}${$dataItems[10].name}]${valueCountSet3}`;
  valueQuestArray3[i_id6] += `\n`;
  valueQuestArray3[i_id6] += `${questSetMessageText}`;
  //valueQuestArray3[i-id6] += `\n`;
  valueQuestArray3[i_id6] += `${questCompMessageText}`;

  valueQuestArray2[i_id6] = `${questCompMessageText}`;

  if (questSetParsed == questSetOn) {
    valueQuestArray5[i_id6] = 1;
  } else {
    valueQuestArray5[i_id6] = 0;
  };
  if (questCompParsed == questCompOn) {
    valueQuestArray6[i_id6] = 1;
  } else {
    valueQuestArray6[i_id6] = 0;
  };


  //一つ分の処理終了
}

//クエスト報酬設定
quest_housyuu = function (questId, completionType) {
  const baseItemId = questId >= 1001 ? 900 : 800;
  const questRewardItem = questId >= 1001 ? $dataItems[questId + 50] : $dataItems[questId + 100];
  const questItem = $dataItems[questId];
  const questCategory = questItem.meta['SGカテゴリ'];

  const switch518Enabled = $gameSwitches.value(518);
  const completionTypeIs2 = completionType == 2;

  let completionMessage = ``;
  if (valueQuestArray6[questId - baseItemId] !== 1) {
    completionMessage = `クエスト\\C[2]${questItem.name}\\C[0]は達成条件を満たしていない…。`;

    WindowManager.drawText(0, completionMessage);
    return;
  }

  for (let deliveryId = 1; deliveryId < 10; deliveryId++) {
    if (!questItem.meta['QuestCompDelivery' + deliveryId]) continue;

    let deliveryArr = questItem.meta['QuestCompDelivery' + deliveryId].split(',');
    if (deliveryArr[0] == 0) {
      deliveryArr[0] = 5;
    }

    const deliveryItemCategory = get_valueItems_iwa(deliveryArr[1]);

    if (deliveryArr[0] == 5) continue;

    const deliveryItem = deliveryItemCategory[Number(deliveryArr[0])];
    if (switch518Enabled) {
      $gameParty.loseItem(deliveryItem, Number(deliveryArr[2]));
    }
    const itemName = `\\C[2]${deliveryItem.name}\\C[0]`;
    const itemCount = `\\C[1]${Number(deliveryArr[2])}\\C[0]`;
    completionMessage += `${itemName}を${itemCount}個納品しました。\n`;
    if (completionTypeIs2) {
      CommonPopupManager.showInfo({}, completionMessage, null);
    }
  }

  if (questItem.meta['QuestCompMoney']) {
    let moneyAmount = Number(questItem.meta['QuestCompMoney']);
    if (switch518Enabled) {
      $gameParty.loseGold(moneyAmount);
    }
    completionMessage += `\\C[2]${moneyAmount}\\C[0]\\Gを納めました。\n`;
    if (completionTypeIs2) {
      CommonPopupManager.showInfo({}, completionMessage, null);
    }
  }

  quest_housyuukeisan(questId);

  if (switch518Enabled) {
    if (rewardGoldAmount >= 1) {
      $gameParty.gainGold(rewardGoldAmount);
    }
    if (rewardItemAmount >= 1) {
      $gameParty.gainItem($dataItems[10], rewardItemAmount); //戦貨
    }
    $gameParty.loseItem(questItem, 1);
    $gameParty.gainItem(questRewardItem, 1);
  }

  completionMessage += `クエスト\\C[2]${questItem.name}\\C[0]を達成した！＜報酬:`;

  WindowManager.drawText(0, `クエスト\\C[2]${questItem.name}\\C[0]を達成報告した。`);

  if (rewardGoldAmount >= 1) {
    completionMessage += `\\C[14]${rewardGoldAmount}\\C[0]\\G `;
  }
  if (rewardItemAmount >= 1) {
    completionMessage += `\\C[14]${rewardItemAmount}\\C[0]${$dataItems[10].name} `;
  }

  completionMessage += `＞\n`;

  if (completionTypeIs2) {
    CommonPopupManager.showInfo({}, completionMessage, null);
  }

  if (additionalCompletionText !== ` `) {
    completionMessage += `${additionalCompletionText}\n`;

    if (completionTypeIs2) {
      CommonPopupManager.showInfo({}, completionMessage, null);
    }
  }

  $gameSwitches.setValue(380, true);

  if (switch518Enabled && questCategory) {
    if (questCategory == '受注クエスト' || questCategory == 'ＥＸ受注クエスト') {
      $gameVariables.setValue(50, $gameVariables.value(50) + 1);
    } else {
      $gameVariables.setValue(150, $gameVariables.value(150) + 1);
    }
  }

  if (!completionTypeIs2 && completionType == 1) {
    $gameScreen.setDTextPicture(completionMessage, 28);
    $gameScreen.dWindowFrame = 'ON';
    $gameScreen.showPicture(102, '', 1, 640 - 50, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(102, 1, 640, 384, 100, 100, 255, 0, 60);
  }
};

//クエスト達成報告準備
quest_tasseiHoukoku = function(id4,id5){

var id2 = 0;//選択肢順番
var id3 = 101;//ピクチャID
if(id4 >= 1001){
  var id6 = 900;
} else {
  var id6 = 800;
};
for (var i = id4; i <= id5; i++) {
  if($gameParty.hasItem($dataItems[i]) && !$dataItems[i].meta['singleQuestIncidence']){
    if(valueQuestArray6[i-id6] == 1){
      var value1 = `\\C[2][達成]${$dataItems[i].name}\\C[0]`;
    } else {
      var value1 = `\\C[16][未達]${$dataItems[i].name}\\C[0]`;
    };
    const id = 1; 
    const choiceParams = {text: value1,value: i};
    $gameSystem.addCustomChoice(id, choiceParams);
    var value1 = `${valueQuestArray2[i-id4+1]}`;
    $gameScreen.setDTextPicture(value1, 22);
    $gameScreen.dWindowFrame = 'ON';
    $gameScreen.showPicture(id3,"",0,600,100,100,100,0,0);
    $gameMessage.setSelectPictureId(id2, id3);
    id2 += 1;
    id3 += 1;
  };
};

};

//クエスト受注情報掲示
quest_jutyuuDisplay = function(id1){

itemGet_afterProcess();
var arr1 = [];
var arr2 = [];
var value3 = 0;
if(id1 == 1){var j = 800;var j1 = 100;var value2 = '受注クエスト'};
if(id1 == 2){var j = 900;var j1 = 50;var value2 = 'デイリークエスト'};
for (var i = 1; i <= $dataItems.length-1; i++) {
  var value1 = 0;
  var value4 = 0;
  if(!$dataItems[i].name == '') {
    if($dataItems[i].meta['EICSwitch']) {
      if(Number($dataItems[i].meta['EICSwitch']) == 108) {
        if($dataItems[i].meta['SGカテゴリ'] == value2) {
          if($dataItems[i].meta['singleQuestIncidence']){}else{
            if($dataItems[i].meta['QuestSetMap'] && $gameVariables.value(230) >= 1) {
              if(Number($dataItems[i].meta['QuestSetMap']) == Number($dataWeapons[$gameVariables.value(230)].meta['MapSwitch']) || Number($dataItems[i].meta['QuestSetMap']) == 0) {
                var value1 = `\x1bI[${$dataItems[i].iconIndex}]${$dataItems[i].name}`;
                if(valueQuestArray5[i-j] == 1){
                  if(!$gameParty.hasItem($dataItems[i+j1])){
                    if(!$gameParty.hasItem($dataItems[i])){
                      var value1 = `\\C[2][受注可能]\\C[0]${value1}`;
                      valueCountSet1 = 1;
                      value4 += 1;
                    } else {
                      var value1 = `\\C[16][受注中]\\C[0]${value1}`; 
                      //value4 += 1;
                    };
                  } else {
                    //var value1 = `\\C[10][完了]\\C[0]${value1}`; 
                  };
                } else {
                  var value1 = `？？？`; 
                      value4 += 1;
                };
              };
            };
            if(value4 >= 1){//if(value1 != 0){
              arr1.push(value1);
              arr2.push(i);
              value3 += 1;
              if(value3 >= 12){//12
                break;
              };
            };
}}}}}};
if(arr1 != 0){
valueWordArray = arr1;
valueCountArray = arr2;

};

};

//クエスト受注設定
quest_jutyuu = function(id1,i){

itemGet_afterProcess();
if(id1 == 1){var j = 800;var j1 = 100;var value2 = '受注クエスト'};
if(id1 == 2){var j = 900;var j1 = 50;var value2 = 'デイリークエスト'};
$gameSwitches.setValue(380,false);
  if(!$dataItems[i].name == '') {
    if($dataItems[i].meta['EICSwitch']) {
      if(Number($dataItems[i].meta['EICSwitch']) == 108) {
        if($dataItems[i].meta['SGカテゴリ'] == value2) {
          if(valueQuestArray5[i-j] == 1){
            if($dataItems[i].meta['singleQuestIncidence']){}else{
              if(!$gameParty.hasItem($dataItems[i+j1])){
                if(!$gameParty.hasItem($dataItems[i])){
                  $gameParty.gainItem($dataItems[i], 1);
                  var value1 = `クエスト\\C[2]\x1bIIN[${i}]\\C[0]を受注しました。`;
                  CommonPopupManager.showInfo({},value1,null); 
                  $gameSwitches.setValue(380,true);
                  AudioManager.playSe({"name":"Z_PaperBreak","volume":100,"pitch":80,"pan":0});
                } else {
                  $gameSwitches.setValue(380,true);
                  var value1 = `既にこのクエストは受注している…。`;
                  CommonPopupManager.showInfo({},value1,null); 
                };
}}}}}}};

};

//クエスト受注設定
quest_jutyuu2 = function(id1){

itemGet_afterProcess();
if(id1 == 1){var j = 800;var j1 = 100;var value2 = '受注クエスト'};
if(id1 == 2){var j = 900;var j1 = 50;var value2 = 'デイリークエスト';$gameSwitches.setValue(644,true)};
$gameSwitches.setValue(380,false);
for (var i = 1; i <= $dataItems.length-1; i++) {
  if(!$dataItems[i].name == '') {
    if($dataItems[i].meta['EICSwitch']) {
      if(Number($dataItems[i].meta['EICSwitch']) == 108) {
        if($dataItems[i].meta['SGカテゴリ'] == value2) {
          if(valueQuestArray5[i-j] == 1){
            if($dataItems[i].meta['singleQuestIncidence']){}else{
              if(!$gameParty.hasItem($dataItems[i+j1])){
                if(!$gameParty.hasItem($dataItems[i])){
                  $gameParty.gainItem($dataItems[i], 1);
                  if(id1 == 1){
                    var value1 = `クエスト\\C[2]\x1bIIN[${i}]\\C[0]を受注しました。`;
                    CommonPopupManager.showInfo({},value1,null); 
                  } else {
                    var value1 = `デイリークエスト\\C[2]\x1bIIN[${i}]\\C[0]を受注しました。`;
                    CommonPopupManager.showInfo({},value1,null); 
                  };
                $gameSwitches.setValue(380,true);
}}}}}}}}};
if($gameSwitches.value(380) && $gameSwitches.value(128) && id1 == 2){
  var value1 = `デイリークエストを受注しました。`;
  CommonPopupManager.showInfo({},value1,null); 
};

};

//単発クエスト発生条件達成しているか。いなかったら発生条件提示
quest_singleJutyuu = function(value1){

$gameSwitches.setValue(380,false);
var value2 = 900;

var value4 = 0;
if($dataItems[value1].meta['SGカテゴリ']){
  if($dataItems[value1].meta['SGカテゴリ'] == 'デイリークエスト'){
    var value2 = 900;
  } else {
    var value2 = 800;
  };
};
if(valueQuestArray5[value1-value2] == 0){
  var value3 = `\x1bI[${$dataItems[value1].iconIndex}]？？？\n`;
} else {
  var value3 = `\x1bI[${$dataItems[value1].iconIndex}]${$dataItems[value1].name}\n`;
  $gameSwitches.setValue(380,true);
};
var arr1 = valueQuestArray7[value1-value2].split("\n");
for (var i = 0; i <= arr1.length-1; i++) {
  if(arr1[i] == 0){}else{
    value3 += `${arr1[i]}`;
    value4 += 1;
    if((value4 %2) == 0){value3 += `\n`};
  };
};
if(!$gameSwitches.value(380)){
  $gameScreen.dWindowFrame = 'ON';
  $gameScreen.setDTextPicture(value3, 28);
  $gameScreen.showPicture(55,'',1,640-20,384,100,100,0,0);
  $gameScreen.movePicture(55,1,640,384,100,100,255,0,60);
};

};

}());
