/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){

//クエスト報酬設定。クエストで変数21-23は報酬で使っているので使用不可。
quest_housyuukeisan = function(id1){

valueCountSet1 = 0;
valueCountSet2 = 0;
valueCountSet3 = `\n\\C[16]●追加報酬\\C[0]\n`;
var id2 = Number(valueQuestRankD[1]);
var id3 = Number(valueQuestRankD[2]);
var id4 = $dataItems[id1].iconIndex;
if(id4 == 422){//C
  var id2 = Number(valueQuestRankC[1]);
  var id3 = Number(valueQuestRankC[2]);
};
if(id4 == 426){//EX,C報酬
  var id2 = Number(valueQuestRankC[1]);
  var id3 = Number(valueQuestRankC[2]);
};
if(id4 == 423){//B
  var id2 = Number(valueQuestRankB[1]);
  var id3 = Number(valueQuestRankB[2]);
};
if(id4 == 424){//A
  var id2 = Number(valueQuestRankA[1]);
  var id3 = Number(valueQuestRankA[2]);
};
if(id4 == 425){//S
  var id2 = Number(valueQuestRankS[1]);
  var id3 = Number(valueQuestRankS[2]);
};
valueCountSet1 += id2;
valueCountSet2 += id3;
var j = 0;
for (var i1 = 1; i1 <= 9; i1++) {
  if($dataItems[id1].meta['QuestSpcialPrice'+i1]){
    var arr1 = $dataItems[id1].meta['QuestSpcialPrice'+i1].split(',');
    if(Number(arr1[0]) == 0){
      if($gameSwitches.value(518)){$gameParty.gainItem($dataItems[Number(arr1[1])], Number(arr1[2]))};
      valueCountSet3 += `[\x1bIIN[${Number(arr1[1])}]+${Number(arr1[2])}] `;
      j += 1;if((j %3) == 0){valueCountSet3 += `\n`};
    };
    if(Number(arr1[0]) == 1){
      if($gameSwitches.value(518)){$gameParty.gainItem($dataWeapons[Number(arr1[1])], Number(arr1[2]))};
      valueCountSet3 += `[\x1bWIN[${Number(arr1[1])}]+${Number(arr1[2])}] `;
      j += 1;if((j %3) == 0){valueCountSet3 += `\n`};
    };
    if(Number(arr1[0]) == 2){
      if($gameSwitches.value(518)){$gameParty.gainItem($dataArmors[Number(arr1[1])], Number(arr1[2]))};
      valueCountSet3 += `[\x1bAIN[${Number(arr1[1])}]+${Number(arr1[2])}] `;
      j += 1;if((j %3) == 0){valueCountSet3 += `\n`};
    };
    if(Number(arr1[0]) == 3){
      if($gameSwitches.value(518)){$gameParty.gainGold(Number(arr1[2]))};
      valueCountSet3 += `[\\C[2]${Number(arr1[2])}\\C[0]\\G] `;
      j += 1;if((j %3) == 0){valueCountSet3 += `\n`};
    };
    if(Number(arr1[0]) == 4){
      if($gameSwitches.value(518)){$gameParty.gainItem($dataItems[10], Number(arr1[2]))};
      valueCountSet3 += `[${$dataItems[10].name}:\\C[2]+${Number(arr1[2])}\\C[0]] `;
      j += 1;if((j %3) == 0){valueCountSet3 += `\n`};
    };
  };
};

};

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

  for (var i = start; i <= end; i++) {
    quest_settei_item($dataItems[i], id6);
  }

}

quest_settei_item = function (item, id6) {

  if (!item.name) return;
  var actor = $gameActors.actor($gameVariables.value(2));

  var value1 = `\\C[16]●達成条件\\C[0]\n`;
  var value11 = `\\C[16]●達成条件\\C[0]\n`;

  var value3 = 0;//達成条件
  var value4 = 0;//達成条件
  var value5 = 0;//発生条件
  var value6 = 0;//発生条件
  var value7 = `\\C[16]●発生条件\\C[0]\n`;//発生条件
  var value12 = `\\C[16]●発生条件\\C[0]\n`;
  var value13 = 0;//一時計算用
  var value14 = 0;//一時計算用

  //発生条件

  //冒険者ランクで発生
  if (item.meta['QuestSetRank']) {
    var value13 = Number(item.meta['QuestSetRank']);
    if (value13 >= 1) {
      //var value14 = valueQuestRankD[0];var arr1 = [valueQuestRankD[1],valueQuestRankD[2]];
      //if(value13 == 1){var value14 = valueQuestRankC[0];var arr1 = [valueQuestRankC[1],valueQuestRankC[2]]};
      //if(value13 == 2){var value14 = valueQuestRankB[0];var arr1 = [valueQuestRankB[1],valueQuestRankB[2]]};
      //if(value13 == 3){var value14 = valueQuestRankA[0];var arr1 = [valueQuestRankA[1],valueQuestRankA[2]]};
      //if(value13 == 4){var value14 = valueQuestRankS[0];var arr1 = [valueQuestRankS[1],valueQuestRankS[2]]};
      //value7 += `[\x1bSIN[${value14}]]\n\\C[2]報酬\\C[0]\n${arr1[0]}\\G\n${arr1[1]}${$dataItems[10].name}\n`;
      value7 += `\\C[10]【ランク制限】\\C[0]`;
      if (value13 >= 1) { var value14 = 693 };
      if (value13 >= 2) { var value14 = 694 };
      if (value13 >= 3) { var value14 = 695 };
      if ($gameParty.hasItem($dataItems[value14], true)) {
        value5 += 1;
        value6 += 1;
        value7 += `\\C[14]〇\\C[0]\n`;
      } else {
        value5 += 1;
        value7 += `\\C[12]×\\C[0]\n`;
      };
    };
  };

  //視点が誰か441
  if (item.meta['QuestSetPerspective']) {
    var value13 = Number(item.meta['QuestSetPerspective']);
    if (value13 >= 1) {
      if (value13 == $gameVariables.value(2)) { } else {
        value7 += `[${$gameActors.actor(value13).name()}視点]\n`;
      };
    };
    if ($gameSwitches.value(value13 + 440)) {
      value5 += 1;
      value6 += 1;
    } else {
      value5 += 1;
    };
  };

  if (item.meta['NoteWord']) {
    value7 += `[${item.meta['NoteWord']}]`;
  };

  //アクターが存在するか
  if (item.meta['QuestSetActor']) {
    var arr = item.meta['QuestSetActor'].split(',');
    for (var id = 0; id <= arr.length - 1; id++) {
      if (Number(arr[id]) == 0) {
        arr[id] = $gameVariables.value(2);//誰でもいいアクター
      };
      var actor = $gameActors.actor(Number(arr[id]));
      if (Number(arr[id]) != $gameVariables.value(2)) {
        value7 += `[${actor.name()}]`;
        var value14 = 1;
      };
      var value13 = actor.isLearnedSkill(18) && !actor.isStateAffected(valueDollStateId);
      if (value13) {
        value5 += 1;
        value6 += 1;
        value7 += `\\C[14]〇\\C[0]`;
      } else {
        value5 += 1;
        value7 += `\\C[12]×\\C[0]`;
      };
    }
  };
  if (value14 == 1) { value7 += `\n` };
  var value14 = 0;

  //マップ発生条件Number(value2)
  if (item.meta['QuestSetMap']) {
    var value2 = Number(item.meta['QuestSetMap']);
    if (value2 == 0) { value2 = 2 };
    //amygameDescription.jsで実行。if(value2 == 2){}else{value.description += `【場所:${$dataSystem.switches[value2]}】`};
    if ($gameSwitches.value(value2)) {
      value5 += 1;
      value6 += 1;
    } else {
      value5 += 1;
    };
  };
  //スイッチ発生条件Number(value2)
  if (item.meta['QuestSetSwi']) {
    var value2 = Number(item.meta['QuestSetSwi']);
    if (value2 == 0) { value2 = 2 };
    if (value2 == 2) { } else {
      var value13 = $dataSystem.switches[value2];
      var value13 = value13.replace("[daysReset]", "");
      var value13 = value13.replace("[NoReset]", "");
      var value13 = value13.replace("[夜自動]", "");
      var value13 = value13.replace("[シーン達成]", "");
      var value13 = value13.replace("[挿話達成]", "");
      value7 += `【${value13}`;
    };
    if ($gameSwitches.value(value2)) {
      value5 += 1;
      value6 += 1;
      value7 += `\\C[14]〇\\C[0]】\n`;
    } else {
      value5 += 1;
      value7 += `\\C[12]×\\C[0]】\n`;
    };
  };
  //メインクエスト進行度発生条件Number(arr[0])
  if (item.meta['QuestSetMainRoot']) {
    var arr = item.meta['QuestSetMainRoot'].split(',');
    if (Number(arr[0]) == 0) { arr[0] = 135 };
    if (Number(arr[1]) == 0) { } else { value7 += `【メインクエスト進行[${Number(arr[1])}]以上` };
    if ($gameVariables.value(Number(arr[0])) >= Number(arr[1])) {
      value5 += 1;
      value6 += 1;
      value7 += `\\C[14]〇\\C[0]】\n`;
    } else {
      value5 += 1;
      value7 += `\\C[12]×\\C[0]】\n`;
    };
  };
  //変数による発生条件Number(arr[0])
  var list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  list.forEach(function (id) {
    if (item.meta['QuestSetVal' + id]) {
      var arr = item.meta['QuestSetVal' + id].split(',');
      if (Number(arr[0]) == 0) { arr[0] = 2 };
      if (arr[0] == 2) { } else {
        var value13 = $dataSystem.variables[Number(arr[0])];
        var value13 = value13.replace("[daysReset]", "");
        var value13 = value13.replace("[NoReset]", "");
        var value13 = value13.replace("[夜自動]", "");
        var value13 = value13.replace("[シーン達成]", "");
        var value13 = value13.replace("[挿話達成]", "");
        value7 += `【${value13} ${$gameVariables.value(Number(arr[0]))}/${Number(arr[1])}`;
        if ($gameVariables.value(Number(arr[0])) >= Number(arr[1])) {
          value5 += 1;
          value6 += 1;
          value7 += `\\C[14]〇\\C[0]】\n`;
        } else {
          value5 += 1;
          value7 += `\\C[12]×\\C[0]】\n`;
        };
      };
    };
  }, this);
  //性欲度等による発生条件
  var list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  list.forEach(function (id) {
    if (item.meta['QuestSetHexpArr' + id]) {
      var arr = item.meta['QuestSetHexpArr' + id].split(',');
      var actor = $gameActors.actor(Number(arr[0]));
      if (Number(arr[1]) == 4) {//露出度
        var value13 = $gameVariables.value(Number(arr[0]) + 380)[Number(arr[1])] <= Number(arr[2])
        value7 += `[\\C[27]${actor.name()}\\C[0]${$dataSystem.variables[Number(arr[1]) + 400]}${Number(arr[2])}以下`;
      } else {
        var value13 = $gameVariables.value(Number(arr[0]) + 380)[Number(arr[1])] >= Number(arr[2])
        value7 += `[\\C[27]${actor.name()}\\C[0]${$dataSystem.variables[Number(arr[1]) + 400]}${Number(arr[2])}以上`;
      };
      if (value13) {
        value5 += 1;
        value6 += 1;
        value7 += `\\C[14]〇\\C[0]】\n`;
      } else {
        value5 += 1;
        value7 += `\\C[12]×\\C[0]】\n`;
      };
    };
  }, this);
  //スキルによる発生条件Number(arr[0])
  if (item.meta['QuestSetSkill']) {
    var actor = $gameActors.actor($gameVariables.value(2));
    var arr = item.meta['QuestSetSkill'].split(',');
    if (Number(arr[0]) >= 1) {
      var actor = $gameActors.actor(Number(arr[0]));
    };
    if (Number(arr[1]) == 0) { arr[1] = 18 };
    if (Number(arr[1]) == 18) { } else {
      if (Number(arr[0]) == $gameVariables.value(2)) {
        value7 += `【${$dataSkills[Number(arr[1])].name}習得`;
      } else {
        value7 += `【${actor.name()}が${$dataSkills[Number(arr[1])].name}習得`;
      };
    };
    if (actor.isLearnedSkill(Number(arr[1]))) {
      value5 += 1;
      value6 += 1;
      value7 += `\\C[14]〇\\C[0]】\n`;
    } else {
      value5 += 1;
      value7 += `\\C[12]×\\C[0]】\n`;
    };
  };
  //actor.battleSkillsRaw().includes(Number(arr[1]))
  //スキル装着による発生条件Number(arr[0])
  if (item.meta['QuestSetSkillEquip']) {
    var actor = $gameActors.actor($gameVariables.value(2));
    var arr = item.meta['QuestSetSkillEquip'].split(',');
    if (Number(arr[0]) == 0) {
      arr[0] = $gameVariables.value(2);
    };
    var actor = $gameActors.actor(Number(arr[0]));
    if (Number(arr[1]) == 0) { arr[1] = 18 };
    if (Number(arr[1]) == 18) { } else {
      if (Number(arr[0]) == $gameVariables.value(2)) {
        value7 += `【${$dataSkills[Number(arr[1])].name}装着`;
      } else {
        value7 += `【${actor.name()}が${$dataSkills[Number(arr[1])].name}装着`;
      };
    };
    if (actor.battleSkillsRaw().includes(Number(arr[1]))) {
      value5 += 1;
      value6 += 1;
      value7 += `\\C[14]〇\\C[0]】\n`;
    } else {
      value5 += 1;
      value7 += `\\C[12]×\\C[0]】\n`;
    };
  };
  //スキルランクによる発生条件Number(arr[0])
  if (item.meta['QuestSetSkillRank']) {
    var actor = $gameActors.actor($gameVariables.value(2));
    var arr = item.meta['QuestSetSkillRank'].split(',');
    if (Number(arr[0]) >= 1) {
      var actor = $gameActors.actor(Number(arr[0]));
    };
    if (Number(arr[1]) == 0) { arr[1] = 18 };
    if (Number(arr[1]) == 18) { } else {
      if (Number(arr[0]) == $gameVariables.value(2)) {
        value7 += `【${$dataSkills[Number(arr[1])].name}ランク${Number(arr[2])}以上`;
      } else {
        value7 += `【${actor.name()}が${$dataSkills[Number(arr[1])].name}ランク${Number(arr[2])}以上`;
      };
    };
    if (actor.isLearnedSkill(Number(arr[1])) && actor.skillMasteryLevel(Number(arr[1])) >= Number(arr[2])) {
      value5 += 1;
      value6 += 1;
      value7 += `\\C[14]〇\\C[0]】\n`;
    } else {
      value5 += 1;
      value7 += `\\C[12]×\\C[0]】\n`;
    };
  };
  //ステート付与による発生条件Number(arr[0])actor.isStateAffected(61)
  if (item.meta['QuestSetState']) {
    var actor = $gameActors.actor($gameVariables.value(2));
    var arr = item.meta['QuestSetState'].split(',');
    if (Number(arr[0]) == 0) {
      arr[0] = $gameVariables.value(2);
    };
    var actor = $gameActors.actor(Number(arr[0]));
    if (Number(arr[1]) == 0) { arr[1] = 600 };
    if (Number(arr[1]) == 600) { } else {
      if (Number(arr[0]) == $gameVariables.value(2)) {
        value7 += `【\x1bSIM[${Number(arr[1])}]`;
      } else {
        value7 += `【${actor.name()}が\x1bSIM[${Number(arr[1])}]`;
      };
    };
    if (actor.isStateAffected(Number(arr[1]))) {
      value5 += 1;
      value6 += 1;
      value7 += `\\C[14]〇\\C[0]】\n`;
    } else {
      value5 += 1;
      value7 += `\\C[12]×\\C[0]】\n`;
    };
  };
  //アイテムによる発生条件Number(arr[0])
  if (item.meta['QuestSetItem']) {
    var arr = item.meta['QuestSetItem'].split(',');
    if (Number(arr[1]) == 0) { arr[1] = 5 };
    if (Number(arr[0]) == 0) { var valueItems = $dataItems };
    if (Number(arr[0]) == 1) { var valueItems = $dataWeapons };
    if (Number(arr[0]) == 2) { var valueItems = $dataArmors };
    if (Number(arr[1]) == 5) { } else { value7 += `【${valueItems[Number(arr[1])].name}所持` };
    if ($gameParty.numItems(valueItems[Number(arr[1])]) >= Number(arr[2])) {
      value5 += 1;
      value6 += 1;
      value7 += `\\C[14]〇\\C[0]】\n`;
    } else {
      value5 += 1;
      value7 += `\\C[12]×\\C[0]】\n`;
    };
  };
  //討伐数による発生条件Number(arr[0])
  if (item.meta['QuestSetSubjugation']) {
    var arr = item.meta['QuestSetSubjugation'].split(',');
    if (Number(arr[0]) == 0) { arr[0] = 421 };
    if (arr[0] >= 3) {
      value7 += `【\x1bSIM[${Number(arr[0])}]\\C[10]${Number(arr[1])}\\C[0]体討伐`;
    } else {
      if (arr[0] == 1) {
        value7 += `【\\C[2]当日魔物討伐数\\C[0]:${$gameVariables.value(52)[Number(arr[0])]}/${Number(arr[1])}`;
      }
      if (arr[0] == 2) {
        value7 += `【\\C[2]総魔物討伐数\\C[0]:${$gameVariables.value(52)[Number(arr[0])]}/${Number(arr[1])}`;
      };
    };
    if ($gameVariables.value(52)[Number(arr[0])] >= Number(arr[1])) {
      value5 += 1;
      value6 += 1;
      value7 += `\\C[14]〇\\C[0]】\n`;
    } else {
      value5 += 1;
      value7 += `\\C[12]×\\C[0]】\n`;
    };
  };
  //アイテム所持による発生条件Number(arr[0])SG種別
  if (item.meta['QuestSetItemArr']) {
    var arr = item.meta['QuestSetItemArr'].split(',');
    for (var id = 0; id <= arr.length - 1; id++) {
      if (Number(arr[id]) == 0) { arr[id] = 5 };
      if (Number(arr[id]) == 5) { } else {
        if ($dataItems[Number(arr[id])].meta['EICSwitch']) {
          if (Number($dataItems[Number(arr[id])].meta['EICSwitch']) == 102) { value7 += `【挿話:` };
          if (Number($dataItems[Number(arr[id])].meta['EICSwitch']) == 103) { value7 += `【シーン:` };
          if (Number($dataItems[Number(arr[id])].meta['EICSwitch']) == 104) { value7 += `【称号:` };
          if (Number($dataItems[Number(arr[id])].meta['EICSwitch']) == 105) { value7 += `【H称号:` };
        } else {
          if ($dataItems[Number(arr[id])].meta['SG種別']) {
            if (Number($dataItems[Number(arr[id])].meta['SG種別']) == 1) { value7 += `【クエスト:` };
          } else {
            value7 += `【`;
          };
        };
        value7 += `\x1bIIN[${Number(arr[id])}]`;
        if ($gameParty.hasItem($dataItems[Number(arr[id])], true)) {
          value5 += 1;
          value6 += 1;
          value7 += `\\C[14]〇\\C[0]】\n`;
        } else {
          value5 += 1;
          value7 += `\\C[12]×\\C[0]】\n`;
        };
      };
    };
  };

  //ここから達成条件

  //視点が誰か441
  if (item.meta['QuestCompPerspective']) {
    var value13 = Number(item.meta['QuestCompPerspective']);
    if (value13 >= 1) {
      if (value13 == $gameVariables.value(2)) { } else {
        value1 += `[${$gameActors.actor(value13).name()}視点`;
      };
    };
    if ($gameSwitches.value(value13 + 440)) {
      value3 += 1;
      value4 += 1;
      value1 += `\\C[14]〇\\C[0]]\n`;
    } else {
      value3 += 1;
      value1 += `\\C[12]×\\C[0]]\n`;
    };
  };
  //アクターが存在するか
  if (item.meta['QuestCompActor']) {
    var arr = item.meta['QuestCompActor'].split(',');
    for (var id = 0; id <= arr.length - 1; id++) {
      if (Number(arr[id]) == 0) {
        arr[id] = $gameVariables.value(2);//誰でもいいアクター
      };
      var actor = $gameActors.actor(Number(arr[id]));
      value1 += `[${actor.name()}`;
      var value14 = 1;
      var value13 = actor.isLearnedSkill(18) && !actor.isStateAffected(valueDollStateId);
      if (value13) {
        value3 += 1;
        value4 += 1;
        value1 += `\\C[14]〇\\C[0]]`;
      } else {
        value3 += 1;
        value1 += `\\C[12]×\\C[0]]`;
      };
    }
  };
  if (value14 == 1) { value7 += `\n` };
  var value14 = 0;

  //討伐数による達成条件Number(arr[0])
  var list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  list.forEach(function (id) {
    if (item.meta['QuestCompSubjugation' + id]) {
      var arr = item.meta['QuestCompSubjugation' + id].split(',');
      if (arr[0] <= 5) {
        if (arr[0] == 1) {
          value1 += `【\\C[2]当日魔物討伐数\\C[0]:${$gameVariables.value(52)[Number(arr[0])]}/${Number(arr[1])}`;
        };
        if (arr[0] == 2) {
          value1 += `【\\C[2]総魔物討伐数\\C[0]:${$gameVariables.value(52)[Number(arr[0])]}/${Number(arr[1])}`;
        };
      } else {
        value1 += `【\\C[2]\x1bSIM[${Number(arr[0])}]\\C[0]:${$gameVariables.value(52)[Number(arr[0])]}/${Number(arr[1])}`;
      };
      if ($gameVariables.value(52)[Number(arr[0])] >= Number(arr[1])) {
        value3 += 1;
        value4 += 1;
        value1 += `\\C[10]達成\\C[0]】\n`;
      } else {
        value3 += 1;
        value1 += `\\C[1]未達成\\C[0]】\n`;
      };
    };
  }, this);
  //アイテム数による達成条件
  var list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  list.forEach(function (id) {
    if (item.meta['QuestCompcollect' + id]) {
      var arr = item.meta['QuestCompcollect' + id].split(',');
      if (arr[0] == 0) { arr[0] = 5 };
      if (arr[1] == 0) { var valueItems = $dataItems; valueQuestArray1[Number(arr[0])] = [1, i] };//0だと通常状態と区別ができない
      if (arr[1] == 1) { var valueItems = $dataWeapons; valueQuestArray1[Number(arr[0]) + 2000] = [2, i] };
      if (arr[1] == 2) { var valueItems = $dataArmors; valueQuestArray1[Number(arr[0]) + 3000] = [3, i] };
      if (arr[0] == 5) { } else {
        value1 += `【\\C[2]${valueItems[Number(arr[0])].name}\\C[0]:${$gameParty.numItems(valueItems[Number(arr[0])])}/${Number(arr[2])}`;
        if ($gameParty.numItems(valueItems[Number(arr[0])]) >= Number(arr[2])) {
          value3 += 1;
          value4 += 1;
          if (arr[0] == 5) { } else { value1 += `\\C[10]達成\\C[0]】\n` };
        } else {
          value3 += 1;
          if (arr[0] == 5) { } else { value1 += `\\C[1]未達成\\C[0]】\n` };
        };
      };
    };
  }, this);
  //アイテム数を納品による達成条件
  var list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  list.forEach(function (id) {
    if (item.meta['QuestCompDelivery' + id]) {
      var arr = item.meta['QuestCompDelivery' + id].split(',');
      if (arr[0] == 0) { arr[0] = 5 };
      if (arr[1] == 0) { var valueItems = $dataItems; valueQuestArray1[Number(arr[0])] = [1, i] };//0だと通常状態と区別ができない
      if (arr[1] == 1) { var valueItems = $dataWeapons; valueQuestArray1[Number(arr[0]) + 2000] = [2, i] };
      if (arr[1] == 2) { var valueItems = $dataArmors; valueQuestArray1[Number(arr[0]) + 3000] = [3, i] };
      if (arr[0] == 5) { } else {
        value1 += `【\\C[2]${valueItems[Number(arr[0])].name}\\C[0]:${$gameParty.numItems(valueItems[Number(arr[0])])}/${Number(arr[2])}`;
        if ($gameParty.numItems(valueItems[Number(arr[0])]) >= Number(arr[2])) {
          value3 += 1;
          value4 += 1;
          if (arr[0] == 5) { } else { value1 += `\\C[10]納品可能\\C[0]】\n` };
        } else {
          value3 += 1;
          if (arr[0] == 5) { } else { value1 += `\\C[1]納品不可\\C[0]】\n` };
        };
      };
    };
  }, this);
  //変数による達成条件Number(arr[0])
  var list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  list.forEach(function (id) {
    if (item.meta['QuestCompVal' + id]) {
      var arr = item.meta['QuestCompVal' + id].split(',');
      if (Number(arr[0]) == 0) { arr[0] = 2 };
      if (arr[0] == 2) { } else {
        var value13 = $dataSystem.variables[Number(arr[0])];
        var value13 = value13.replace("[daysReset]", "");
        var value13 = value13.replace("[NoReset]", "");
        var value13 = value13.replace("[夜自動]", "");
        var value13 = value13.replace("[シーン達成]", "");
        var value13 = value13.replace("[挿話達成]", "");
        value1 += `【\\C[2]${value13}\\C[0]:${$gameVariables.value(Number(arr[0]))}/${Number(arr[1])}`;
        if ($gameVariables.value(Number(arr[0])) >= Number(arr[1])) {
          value3 += 1;
          value4 += 1;
          value1 += `\\C[10]達成\\C[0]】\n`;
        } else {
          value3 += 1;
          value1 += `\\C[1]未達成\\C[0]】\n`;
        };
      };
    };
  }, this);
  //変数配列による達成条件Number(arr[0])
  var list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  list.forEach(function (id) {
    if (item.meta['QuestCompArray' + id]) {
      var arr = item.meta['QuestCompArray' + id].split(',');
      if (Number(arr[0]) == 0) { arr[0] = 2 };
      if (arr[0] == 2) { } else {
        value1 += `【\\C[2]${$dataSystem.variables[Number(arr[0])]}\\C[0]:${$gameVariables.value(Number(arr[0]))[Number(arr[1])]}/${Number(arr[2])}`;
        if ($gameVariables.value(Number(arr[0]))[Number(arr[1])] >= Number(arr[2])) {
          value3 += 1;
          value4 += 1;
          value1 += `\\C[10]達成\\C[0]】\n`;
        } else {
          value3 += 1;
          value1 += `\\C[1]未達成\\C[0]】\n`;
        };
      };
    };
  }, this);
  //スキル習得による達成条件
  var list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  list.forEach(function (id) {
    if (item.meta['QuestCompSkill' + id]) {
      var actor = $gameActors.actor($gameVariables.value(2));
      var arr = item.meta['QuestCompSkill' + id].split(',');
      if (Number(arr[0]) >= 1) {
        var actor = $gameActors.actor(Number(arr[0]));
      };
      if (Number(arr[1]) == 0) { arr[1] = 18 };
      if (arr[1] == 18) { } else {
        if (Number(arr[0]) == $gameVariables.value(2)) {
          value1 += `【\\C[2]${$dataSkills[Number(arr[1])].name}\\C[0]:`;
        } else {
          value1 += `【${actor.name()}が\\C[2]${$dataSkills[Number(arr[1])].name}\\C[0]:`;
        };
        if (actor.isLearnedSkill(Number(arr[1]))) {
          value3 += 1;
          value4 += 1;
          value1 += `\\C[10]習得\\C[0]】\n`;
        } else {
          value3 += 1;
          value1 += `\\C[1]未習得\\C[0]】\n`;
        };
      };
    };
  }, this);
  //スキル装着による達成条件
  var list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  list.forEach(function (id) {
    if (item.meta['QuestCompSkillEquip' + id]) {
      var actor = $gameActors.actor($gameVariables.value(2));
      var arr = item.meta['QuestCompSkillEquip' + id].split(',');
      if (Number(arr[0]) >= 1) {
        var actor = $gameActors.actor(Number(arr[0]));
      };
      if (Number(arr[1]) == 0) { arr[1] = 18 };
      if (arr[1] == 18) { } else {
        if (Number(arr[0]) == $gameVariables.value(2)) {
          value1 += `【\\C[2]${$dataSkills[Number(arr[1])].name}\\C[0]:`;
        } else {
          value1 += `【${actor.name()}が\\C[2]${$dataSkills[Number(arr[1])].name}\\C[0]:`;
        };
        if (actor.battleSkillsRaw().includes(Number(arr[1]))) {
          value3 += 1;
          value4 += 1;
          value1 += `\\C[10]装着\\C[0]】\n`;
        } else {
          value3 += 1;
          value1 += `\\C[1]未装着\\C[0]】\n`;
        };
      };
    };
  }, this);
  //スキルランクによる達成条件
  var list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  list.forEach(function (id) {
    if (item.meta['QuestCompSkillRank' + id]) {
      var actor = $gameActors.actor($gameVariables.value(2));
      var arr = item.meta['QuestCompSkillRank' + id].split(',');
      if (Number(arr[0]) >= 1) {
        var actor = $gameActors.actor(Number(arr[0]));
      };
      if (Number(arr[1]) == 0) { arr[1] = 18 };
      if (arr[1] == 18) { } else {
        if (Number(arr[0]) == $gameVariables.value(2)) {
          value1 += `【\\C[2]${$dataSkills[Number(arr[1])].name}\\C[0]ランク${Number(arr[2])}:`;
        } else {
          value1 += `【${actor.name()}が\\C[2]${$dataSkills[Number(arr[1])].name}\\C[0]ランク${Number(arr[2])}:`;
        };
        if (actor.skillMasteryLevel(Number(arr[1])) >= Number(arr[2])) {
          value3 += 1;
          value4 += 1;
          value1 += `\\C[10]達成\\C[0]】\n`;
        } else {
          value3 += 1;
          value1 += `\\C[1]未達成\\C[0]】\n`;
        };
      };
    };
  }, this);
  //ステート付与による達成条件
  var list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  list.forEach(function (id) {
    if (item.meta['QuestCompState' + id]) {
      var actor = $gameActors.actor($gameVariables.value(2));
      var arr = item.meta['QuestCompState' + id].split(',');
      if (Number(arr[0]) >= 1) {
        var actor = $gameActors.actor(Number(arr[0]));
      };
      if (Number(arr[1]) == 0) { arr[1] = 600 };
      if (arr[1] == 600) { } else {
        if (Number(arr[0]) == $gameVariables.value(2)) {
          value1 += `【\\C[2]\x1bSIM[${Number(arr[1])}]\\C[0]:`;
        } else {
          value1 += `【${actor.name()}が\\C[2]\x1bSIM[${Number(arr[1])}]\\C[0]:`;
        };
        if (actor.isStateAffected(Number(arr[1]))) {
          value3 += 1;
          value4 += 1;
          value1 += `\\C[10]付与\\C[0]】\n`;
        } else {
          value3 += 1;
          value1 += `\\C[1]未付与\\C[0]】\n`;
        };
      };
    };
  }, this);
  //スイッチ達成条件Number(value8)
  if (item.meta['QuestCompSwi']) {
    var value8 = Number(item.meta['QuestCompSwi']);
    if (value8 == 0) { value8 = 2 };
    if (value8 == 2) { } else {
      var value13 = $dataSystem.switches[value8];
      var value13 = value13.replace("[daysReset]", "");
      var value13 = value13.replace("[NoReset]", "");
      var value13 = value13.replace("[夜自動]", "");
      var value13 = value13.replace("[シーン達成]", "");
      var value13 = value13.replace("[挿話達成]", "");
      value1 += `【\\C[2]${value13}\\C[0]:`
      if ($gameSwitches.value(value8)) {
        value3 += 1;
        value4 += 1;
        value1 += `\\C[10]達成\\C[0]】\n`;
      } else {
        value3 += 1;
        value1 += `\\C[1]未達成\\C[0]】\n`;
      };
    };
  };

  if (value1 == value11) { value1 = `\\C[16]●達成条件なし\\C[0]` };
  if (value7 == value12) { value7 += `【なし】\n` };
  valueQuestArray7[i - id6] = value7;
  valueQuestArray4[i - id6] = `${$dataItems[i].description}\n`;
  if (item.meta['QuestSupplement']) {
    var value9 = item.meta['QuestSupplement'];
    valueQuestArray4[i - id6] += `${value9}`;
  };
  //寄付金
  if (item.meta['QuestCompMoney']) {
    var value13 = Number(item.meta['QuestCompMoney']);
    if (value13 >= 1) {
      if (value13 == 0) { } else {
        value1 += `【\\C[2]${value13}\\G`;
      };
    };
    if ($gameParty.gold() >= value13) {
      value3 += 1;
      value4 += 1;
      value1 += `\\C[14]〇\\C[0]】\n`;
    } else {
      value3 += 1;
      value1 += `\\C[12]×\\C[0]】\n`;
    };
  };

  //報酬算定。valueCountSet1,2.3に変更
  quest_housyuukeisan(i);
  //console.log(value1.length);
  valueQuestArray4[i - id6] += `\\C[16]●規定ランク報酬\\C[0]\n`;
  valueQuestArray4[i - id6] += `[\\C[2]${valueCountSet1}\\C[0]\\G][\\C[2]${valueCountSet2}\\C[0]${$dataItems[10].name}]${valueCountSet3}`;
  valueQuestArray4[i - id6] += `\n`;
  valueQuestArray4[i - id6] += `${value7}`;
  //valueQuestArray4[i-id6] += `\n`;
  valueQuestArray4[i - id6] += `${value1}`;

  valueQuestArray3[i - id6] = `\\FS[22]`;
  valueQuestArray3[i - id6] += `\\C[16]●規定ランク報酬\\C[0]\n`;
  valueQuestArray3[i - id6] += `[${valueCountSet1}\\G][${valueCountSet2}${$dataItems[10].name}]${valueCountSet3}`;
  valueQuestArray3[i - id6] += `\n`;
  valueQuestArray3[i - id6] += `${value7}`;
  //valueQuestArray3[i-id6] += `\n`;
  valueQuestArray3[i - id6] += `${value1}`;

  valueQuestArray2[i - id6] = `${value1}`;

  if (value5 == value6) {
    valueQuestArray5[i - id6] = 1;
  } else {
    valueQuestArray5[i - id6] = 0;
  };
  if (value3 == value4) {
    valueQuestArray6[i - id6] = 1;
  } else {
    valueQuestArray6[i - id6] = 0;
  };


  //一つ分の処理終了

}

//クエスト報酬設定
quest_housyuu = function(value21,value22){

if(value21 >= 1001){
var id6 = 900;
var value2 = $dataItems[value21+50];
} else {
var id6 = 800;
var value2 = $dataItems[value21+100];
};
var value1 = $dataItems[value21];

var value3 = ``;
if(valueQuestArray6[value21-id6] == 1){
//if(true){
  //アイテム数を納品による達成条件
  var list = [1,2,3,4,5,6,7,8,9];
  list.forEach(function(id) {
    if(value1.meta['QuestCompDelivery'+id]){
      var arr = value1.meta['QuestCompDelivery'+id].split(',');
      if( arr[0] == 0 ){ arr[0] = 5 };
      if(arr[1] == 0){var valueItems = $dataItems};
      if(arr[1] == 1){var valueItems = $dataWeapons};
      if(arr[1] == 2){var valueItems = $dataArmors};
      if(arr[0] == 5){}else{
        if($gameSwitches.value(518)){$gameParty.loseItem(valueItems[Number(arr[0])], Number(arr[2]))};
        value3 += `\\C[2]${valueItems[Number(arr[0])].name}\\C[0]を\\C[1]${Number(arr[2])}\\C[0]個納品しました。\n`;
        if(value22 == 2){CommonPopupManager.showInfo({},value3,null)};
      };
    };
  }, this);
  if(value1.meta['QuestCompMoney']){
    var arr = Number(value1.meta['QuestCompMoney']);
    if($gameSwitches.value(518)){$gameParty.loseGold(arr)};
    value3 += `\\C[2]${arr}\\C[0]\\Gを納めました。\n`;
    if(value22 == 2){CommonPopupManager.showInfo({},value3,null)};
  };
  quest_housyuukeisan(value21);
  if($gameSwitches.value(518)){
    if(valueCountSet1 >= 1){$gameParty.gainGold(valueCountSet1)};
    if(valueCountSet2 >= 1){$gameParty.gainItem($dataItems[10], valueCountSet2)};//戦貨
    $gameParty.loseItem(value1, 1);
    $gameParty.gainItem(value2, 1);
  };
  value3 += `クエスト\\C[2]${value1.name}\\C[0]を達成した！＜報酬:`;
  WindowManager.drawText(0, `クエスト\\C[2]${value1.name}\\C[0]を達成報告した。`);
  if(valueCountSet1 >= 1){value3 += `\\C[14]${valueCountSet1}\\C[0]\\G `};
  if(valueCountSet2 >= 1){value3 += `\\C[14]${valueCountSet2}\\C[0]${$dataItems[10].name} `};
  value3 += `＞\n`;
  if(value22 == 2){CommonPopupManager.showInfo({},value3,null)};
  if(valueCountSet3 != ` `){
    value3 += `${valueCountSet3}\n`
    if(value22 == 2){CommonPopupManager.showInfo({},value3,null)};
  };
  $gameSwitches.setValue(380,true);
  if($gameSwitches.value(518)){
    if($dataItems[value21].meta['SGカテゴリ']){
      if($dataItems[value21].meta['SGカテゴリ'] == '受注クエスト' || $dataItems[value21].meta['SGカテゴリ'] == 'ＥＸ受注クエスト'){
        $gameVariables.setValue(50,$gameVariables.value(50) + 1);
      } else {
        $gameVariables.setValue(150,$gameVariables.value(150) + 1);
      };
    };
  };
  if(value22 == 1){
    $gameScreen.setDTextPicture(value3, 28);
    $gameScreen.dWindowFrame = 'ON';
    $gameScreen.showPicture(102,'',1,640-50,384,100,100,0,0);
    $gameScreen.movePicture(102,1,640,384,100,100,255,0,60);
  };
} else {
  var value3 = `クエスト\\C[2]${value1.name}\\C[0]は達成条件を満たしていない…。`;
  //TickerManager.show(value3);
  WindowManager.drawText(0, value3);
};

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

//}());
