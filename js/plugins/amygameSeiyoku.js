/*:
* @plugindesc このゲーム専用プラグイン
* @author 作者名
* @help ゲーム専用に作成された初期読み込み用プラグイン
*/

//(function(){

//380-400の変数配列に名称設定。
Hentai380_ArrangementNameSet = function () {

  valueHentaiArrangement = Array(71).fill(`H回数`);
  valueHentaiArrangement[1] = `性欲度`;
  valueHentaiArrangement[41] = `初体験相手`;
  valueHentaiArrangement[49] = `初出産相手`;
  valueHentaiArrangement[61] = `当日Ｈ回数`;
  valueHentaiArrangement[62] = `一日のＨ回数が10回以上`;
  valueHentaiArrangement[63] = `性欲薬使用回数`;
  valueHentaiArrangement[64] = `性欲499以上でＨ回数0の連続日数`;
  valueHentaiArrangement[71] = `当日強姦回数`;

};

//Ｈ経験値１日経過時更新
weeks_toggleOtherH = function () {

  //61は当日Ｈ回数、62は当日Ｈ回数10以上の時に記録。64は性欲499以上でＨ回数0の連続日数
  for (var i = 1; i <= 20; i++) {
    if (isGirl($gameActors.actor(i))) {
      var actor = $gameActors.actor(i);
      if ($gameVariables.value(i + 380)[61] >= 10) {
        $gameVariables.value(i + 380)[62] += 1;//1日Ｈ回数１０回以上
      };
      if ($gameVariables.value(i + 380)[1] >= 499) {
        if ($gameVariables.value(i + 380)[61] == 0) {
          $gameVariables.value(i + 380)[64] += 1;
        } else {
          $gameVariables.value(i + 380)[64] = 0;
        };
      };
      $gameVariables.value(i + 380)[61] = 0;//H回数リセット
    };
  };

};

h_BattleEcstasyDirect = function () {

  adv_HpartDirectPlay(3);
  var actorData = $dataActors[$gameVariables.value(20)];
  if (actorData && actorData.meta['SexualZettyouLow']) {
    var actor = $gameActors.actor($gameVariables.value(20));
    var ecstasyLevelTag = 'Low'; var ecstasyRank = 1;
    //if($gameActors.actor($gameVariables.value(20)).isLearnedSkill(62)){var ecstasyLevelTag = 'Middle';var ecstasyRank = 2};
    //if($gameActors.actor($gameVariables.value(20)).isLearnedSkill(65)){var ecstasyLevelTag = 'Hi';var ecstasyRank = 3};
    var ecstasyCandidateValues = $dataActors[$gameVariables.value(20)].meta['SexualZettyou' + ecstasyLevelTag].split(',');
    var ecstasyValue = ecstasyCandidateValues[getRandomIndex(ecstasyCandidateValues.length)];
    var ecstasyName = `${actor.name()}`;
    $gameVariables.setValue(21, `\\nw[${ecstasyName}]${ecstasyValue}`);
    var ecstasyValue = 'Zev_BattleEcstasy' + $gameVariables.value(20) + '_' + ecstasyRank;
    pic_1(0, 57, ecstasyValue, 0, 100, 255, 60, 1280, 768, 0, 0);
    var ecstasyValue = 51;
    var ecstasyName = 'ScreenBattleEcstasySell5';
    picture_anime1(ecstasyValue, ecstasyName, 5, 1, "横", 10, 1, true, [1, 2]);
    $gameScreen.movePicture(ecstasyValue, 1, 640, 384, 100, 100, 150, 0, 30);
  };

};

//相手とＨ済みの場合に表示するためのスクリプト
h_keikenhyouji1 = function (resultVarId, requestedPartnerWeaponId) {

var partnerWeaponId = requestedPartnerWeaponId;
  if (!$dataWeapons[requestedPartnerWeaponId] || !$gameActors.actor(21)) return;
  if ($gameVariables.value(353)[requestedPartnerWeaponId - 300] != 0) {
    $gameActors.actor(21).setName(`\x1bnnp[${requestedPartnerWeaponId}]`);
  } else {
    $gameActors.actor(21).setName($dataWeapons[requestedPartnerWeaponId].name);
  };
  valueScenePartnerId = requestedPartnerWeaponId;
  if ($gameVariables.value($gameVariables.value(20) + 360)[partnerWeaponId - 100] >= 1) {
    h_partnerFullName(22, partnerWeaponId);
    var partnerDescription = $dataWeapons[requestedPartnerWeaponId].description;
    if (partnerDescription == 0) {
      var partnerInfoText = `\n`;
    } else {
      var partnerInfoText = `${$dataWeapons[requestedPartnerWeaponId].description}\n`;
    };
    var partnerName = $gameVariables.value(22);
    partnerInfoText += `\n${partnerName}との\\C[27]Ｈ回数：${$gameVariables.value($gameVariables.value(20) + 360)[partnerWeaponId - 100]}\\C[0]`
    if ($gameVariables.value($gameVariables.value(20) + 360)[partnerWeaponId + 100] >= 1) {
      partnerInfoText += `　${partnerName}との子${$gameVariables.value($gameVariables.value(20) + 360)[partnerWeaponId + 100]}人`
    };
    if ($gameVariables.value($gameVariables.value(20) + 360)[partnerWeaponId] >= 1) {
      partnerInfoText += `　${partnerName}の子を宿しているかも知れない…。`
    };
    $gameVariables.setValue(resultVarId, `【${partnerInfoText}】`);
  } else {
    $gameVariables.setValue(resultVarId, 0);
  };

};

//相手とＨ済みの場合に表示するためのスクリプト
h_keikenhyouji2 = function (textVarId, showFlag) {

  if (textVarId != 0) {
    if (showFlag == 1) {
      if ($gameVariables.value(textVarId) != 0) {
        $gameScreen.dWindowFrame = 'ON';
        $gameScreen.setDTextPicture($gameVariables.value(textVarId), 25);
        $gameScreen.showPicture(150, "", 0, 100, 100, 100, 100, 0, 0);
        $gameScreen.movePicture(150, 0, 10, 100, 100, 100, 255, 0, 30);
      };
    };
  };
  if (showFlag == 0) {
    pic_move1(150, -100, 100, 100, 100, 0, 60);
  };


};

//固有相手とのＨ経験回数リスト
h_hennreki = function () {

  for (var i = 801; i <= 810; i++) { $gameVariables.setValue(i, 0) };
  var entryCount = 0;
  var listVarId = 801;
  $gameVariables.setValue(listVarId, `一覧\n`);
  var start = 1;
  var end = 100;
  for (var i = start; i <= end; i++) {
    if ($gameVariables.value($gameVariables.value(20) + 360)[i] >= 1) {
      var entryLineText = ` `
      entryLineText += `${$dataWeapons[i + 300].name}：`
      entryLineText += `${$gameVariables.value($gameVariables.value(20) + 360)[i]}回`
      if ($gameVariables.value($gameVariables.value(20) + 360)[i + 200] >= 1) {
        entryLineText += `【${$gameVariables.value($gameVariables.value(20) + 360)[i + 200]}人】`
      };
      entryLineText += `\n`
      $gameVariables.setValue(listVarId, $gameVariables.value(listVarId) + entryLineText);
      entryCount += 1;
      if ((entryCount % 10) == 0) {
        listVarId += 1;
        $gameVariables.setValue(listVarId, `　\n`);
      };
    }
  };

};

//h_partnerFullName(22,$gameVariables.value(340)); //代入変数id,相手id指定変数
h_partnerFullName = function (resultVarId, partnerWeaponId) {

  var partnerNameText = `\\C[23]${$dataWeapons[partnerWeaponId].name}\\C[0]`;
  if ($dataWeapons[partnerWeaponId].meta['FamilyName']) {
    partnerNameText += `\\C[23]=${$dataWeapons[partnerWeaponId].meta['FamilyName']}\\C[0]`;
  };
  if ($dataWeapons[partnerWeaponId].meta['FamilyNameKanji']) {
    var partnerNameText = `\\C[23]${$dataWeapons[partnerWeaponId].meta['FamilyNameKanji']}\\C[0] ${partnerNameText}`;
  };
  if ($dataWeapons[partnerWeaponId].meta['SubstitutionActorId']) {
    var substitutionActorId = Number($dataWeapons[partnerWeaponId].meta['SubstitutionActorId']);
    var partnerNameText = `\x1bSET[${substitutionActorId}]`;
  };
  $gameVariables.setValue(resultVarId, partnerNameText);

};

//Ｈ経験値更新
h_exp = function (actorId, picname, partnerWeaponId, hideFlag, simpleFlag, pastSceneFlag) {

  $gameVariables.setValue(339, 0);
  $gameVariables.setValue(20, actorId);
  $gameVariables.setValue(193, picname);
  $gameVariables.value($gameVariables.value(20) + 380)[46] = $gameVariables.value(193);
  $gameSwitches.setValue(121, hideFlag);//非表示
  $gameSwitches.setValue(122, simpleFlag);//性欲性感のみ簡易主にアイテム使用時
  $gameSwitches.setValue(123, pastSceneFlag);//過去シーンならオン
  $gameVariables.setValue(340, partnerWeaponId);//301汎用
  $gameVariables.setValue(94, $gameActors.actor($gameVariables.value(20)).name());
  $gameVariables.setValue(22, $dataWeapons[$gameVariables.value(340)].name);
  if ($dataWeapons[$gameVariables.value(340)].meta['NumberOfPeople']) {
    $gameVariables.setValue(339, Number($dataWeapons[$gameVariables.value(340)].meta['NumberOfPeople']));
  };

};

//性経験値加算式
h_exp1 = function (expVar406, expVar409, expVar408, expVar407, expVar413, expVar414) {

  $gameVariables.setValue(406, expVar406);
  $gameVariables.setValue(409, expVar409);
  $gameVariables.setValue(408, expVar408);
  $gameVariables.setValue(407, expVar407);
  $gameVariables.setValue(413, expVar413);
  $gameVariables.setValue(414, expVar414);

};

h_exp1ex = function (id) {

  for (var i = 1; i <= id; i++) {
    var ecstasySlotCandidates = [6, 6, 6, 6, 7, 8, 8];
    var randomArrIndex = ecstasySlotCandidates[getRandomIndex(ecstasySlotCandidates.length)];
    $gameVariables.setValue(400 + randomArrIndex, $gameVariables.value(400 + randomArrIndex) + 1);
  };

};

h_exp2 = function (expVar417, expVar418, expVar420, expVar419, expVar430, expVar410) {

  $gameVariables.setValue(417, expVar417);
  $gameVariables.setValue(418, expVar418);
  $gameVariables.setValue(420, expVar420);
  $gameVariables.setValue(419, expVar419);
  $gameVariables.setValue(430, expVar430);
  $gameVariables.setValue(410, expVar410);

};

h_exp3 = function (expVar421, expVar422, expVar423, expVar424, expVar425, expVar426, expVar415, expVar428, expVar411, expVar412, expVar416) {

  $gameVariables.setValue(421, expVar421);
  $gameVariables.setValue(422, expVar422);
  $gameVariables.setValue(423, expVar423);
  $gameVariables.setValue(424, expVar424);
  $gameVariables.setValue(425, expVar425);
  $gameVariables.setValue(426, expVar426);
  $gameVariables.setValue(415, expVar415);
  $gameVariables.setValue(428, expVar428);
  $gameVariables.setValue(411, expVar411);
  $gameVariables.setValue(412, expVar412);
  $gameVariables.setValue(416, expVar416);

};

h_exp4 = function (expVar431, expVar432, expVar433, expVar434, expVar435, expVar436, expVar437, expVar438, expVar427) {

  $gameVariables.setValue(431, expVar431);
  $gameVariables.setValue(432, expVar432);
  $gameVariables.setValue(433, expVar433);
  $gameVariables.setValue(434, expVar434);
  $gameVariables.setValue(435, expVar435);
  $gameVariables.setValue(436, expVar436);
  $gameVariables.setValue(437, expVar437);
  $gameVariables.setValue(438, expVar438);
  $gameVariables.setValue(427, expVar427);

};

//☆☆アクター変数20の開発度表示2
actor_Hstateshyouji2 = function () {

  var actor = $gameActors.actor($gameVariables.value(20));
  var displaySkillId = 50;
  var displaySkillParam = $gameVariables.value(actor.actorId() + 380)[1];
  var statusText = `\\fs[25]性欲発展度`;

  if (!actor.isLearnedSkill(displaySkillId)) { statusText += `:\\C[1]皆無\\C[0]\n` };
  if (actor.isLearnedSkill(displaySkillId)) {
    if (displaySkillParam <= 100) { statusText += `\\C[4][圏外]\\C[0]`; var hRank = 0 };
    if (displaySkillParam >= 101 && displaySkillParam <= 200) { statusText += `\\C[12][圏外]\\C[0]`; var hRank = 1 };
    if (displaySkillParam >= 201 && displaySkillParam <= 300) { statusText += `\\C[4][E]\\C[0]`; var hRank = 2 };
    if (displaySkillParam >= 301 && displaySkillParam <= 400) { statusText += `\\C[12][D]\\C[0]`; var hRank = 3 };
    if (displaySkillParam >= 401 && displaySkillParam <= 500) { statusText += `\\C[5][C]\\C[0]`; var hRank = 4 };
    if (displaySkillParam >= 501 && displaySkillParam <= 600) { statusText += `\\C[13][B]\\C[0]`; var hRank = 5 };
    if (displaySkillParam >= 601 && displaySkillParam <= 700) { statusText += `\\C[27][A]\\C[0]`; var hRank = 6 };
    if (displaySkillParam >= 701 && displaySkillParam <= 800) { statusText += `\\C[30][S]\\C[0]`; var hRank = 7 };
    if (displaySkillParam >= 801 && displaySkillParam <= 900) { statusText += `\\C[30][SS]\\C[0]`; var hRank = 8 };
    if (displaySkillParam >= 901) { statusText += `\\C[31][SSS]\\C[0]`; var hRank = 9 };
    if (hRank >= 1) {
      statusText += `:\\C[27]<${$dataSkills[hRank + 60].name}>\\C[0]\n`;
    } else {
      statusText += `\n`;
    };
  };
  var start = 51; var end = 59;
  for (var i = start; i <= end; i++) {
    statusText += `${$dataSkills[i].name}`;
    if (!actor.isLearnedSkill(i)) { statusText += `:\\C[1]未開発\\C[0]\n` };
    if (actor.isLearnedSkill(i)) {
      if (actor.skillMasteryLevel(i) <= 1) { statusText += `\\C[4][E]\\C[0]` };
      if (actor.skillMasteryLevel(i) == 2) { statusText += `\\C[12][D]\\C[0]` };
      if (actor.skillMasteryLevel(i) == 3) { statusText += `\\C[5][C]\\C[0]` };
      if (actor.skillMasteryLevel(i) == 4) { statusText += `\\C[13][B]\\C[0]` };
      if (actor.skillMasteryLevel(i) == 5) { statusText += `\\C[27][A]\\C[0]` };
      if (actor.skillMasteryLevel(i) >= 6) { statusText += `\\C[30][S]\\C[0]` };
      var list = valueHstaSuppression;
      list.forEach(function (id) {
        if (actor.isLearnedSkill(id) && !actor.isLearnedSkill(Number($dataSkills[id].meta['Hide if Learned Skill']))) {
          var displaySkillId = Number($dataSkills[id].meta['HstaSuppression'].split(',')[0]);
          var displaySkillParam = Number($dataSkills[id].meta['HstaSuppression'].split(',')[1]);
          if (displaySkillId == 0) {
            for (var displaySkillId = 431; displaySkillId <= 439; displaySkillId++) {
              if (displaySkillId - 380 == id && actor.skillMasteryLevel(i) == displaySkillParam) {
                statusText += `[ランク制限]`;
              };
            };
          };
          if (displaySkillId >= 431 && displaySkillId <= 439) {
            if (displaySkillId - 380 == id && actor.skillMasteryLevel(i) == displaySkillParam) {
              statusText += `[ランク制限]`;
            };
          };
        };
      }, this);
      statusText += `(${actor.skillMasteryUses(i)}/${actor.skillMasteryUsageMax(i)}):`;
      statusText += `${$dataSkills[i].meta['RankSetWord' + actor.skillMasteryLevel(i)]}\n`;
    };
  };
  WindowManager.show(1, 0, 200, 768, 386);
  WindowManager.drawText(1, statusText);

};

//☆☆アクター変数20のＨステータス表示1
actor_Hstateshyouji1 = function () {

  if (!$gameSwitches.value(496) && !$gameSwitches.value(130) && $gameVariables.value(193) == 0) {
    var displayValue = 0 + 128; var windowPos2 = 379 + 128;
    $gameVariables.setValue(313, 128);
  } else {
    var displayValue = 0; var windowPos2 = 379;
  };
  WindowManager.show(1, displayValue, 200, 379, 390);
  WindowManager.show(2, windowPos2, 200, 389, 390);
  var actor = $gameActors.actor($gameVariables.value(20));
  var value = $gameVariables.value($gameVariables.value(20) + 380);
  var masteryVarOffset = 400;
  //性欲度表示用情報を書き込み
  var start = 1; var end = 40;
  for (var i = start; i <= end; i++) {
    if ($gameVariables.value(masteryVarOffset + i) >= 1) {
      var displayValue = `\\C[2]+${$gameVariables.value(masteryVarOffset + i)}\\C[0]`;
    } else {
      var displayValue = '　';
    }
    eval("valueWordSet" + i + " = displayValue");
  };
  var displayText = `\\fs[24]`;
  var list = [6, 7, 8, 9, 10, 11, 12, 16, 13, 14, 15];
  list.forEach(function (i) {
    displayText += `\\C[27]${$dataSystem.variables[masteryVarOffset + i]}\\C[0]${value[i]}回${eval("valueWordSet" + i)}\n`;
  }, this);
  WindowManager.drawText(1, displayText);

  var stateDisplayText = `\\fs[24]`;
  var list = [17, 18, 19, 30, 20, 21, 22, 23, 24, 25, 26, 28];
  list.forEach(function (i) {
    stateDisplayText += `\\C[27]${$dataSystem.variables[masteryVarOffset + i]}\\C[0]${value[i]}回${eval("valueWordSet" + i)}\n`;
  }, this);
  WindowManager.drawText(2, stateDisplayText);

  if (!$gameSwitches.value(130)) {
    var masteryTextBySlot = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];//開発度ランク0では未開発表示
    var start = 51; var end = 59;
    for (var i = start; i <= end; i++) {
      if (actor.skillMasteryLevel(i) >= 1 && actor.isLearnedSkill(i)) {
        if (actor.skillMasteryLevel(i) <= 1) { var stateDisplayText = `\\C[4][E]\\C[0]` };
        if (actor.skillMasteryLevel(i) == 2) { var stateDisplayText = `\\C[12][D]\\C[0]` };
        if (actor.skillMasteryLevel(i) == 3) { var stateDisplayText = `\\C[5][C]\\C[0]` };
        if (actor.skillMasteryLevel(i) == 4) { var stateDisplayText = `\\C[13][B]\\C[0]` };
        if (actor.skillMasteryLevel(i) == 5) { var stateDisplayText = `\\C[27][A]\\C[0]` };
        if (actor.skillMasteryLevel(i) >= 6) { var stateDisplayText = `\\C[30][S]\\C[0]` };
        var displayValue = i - 20;
        masteryTextBySlot[i - 50] = `\x1bI[${$dataSkills[i].iconIndex}]${stateDisplayText}:${actor.skillMasteryUses(i)}${eval("valueWordSet" + displayValue)}`;
      } else {
        masteryTextBySlot[i - 50] = `\\C[1]未開発\\C[0]\\I[0] `;
      };
    };
    if (!$gameSwitches.value(496) && !$gameSwitches.value(130) && $gameVariables.value(193) == 0) {
      var displayText = 430 + 128;
    } else {
      var displayText = 430;
    };
    WindowManager.show(3, displayText, 0, 338, 202);
    WindowManager.drawText(3, `\\fs[22][開発度]\\I[0]${masteryTextBySlot[1]}
${masteryTextBySlot[2]} ${masteryTextBySlot[3]}
${masteryTextBySlot[4]} ${masteryTextBySlot[5]}
${masteryTextBySlot[6]} ${masteryTextBySlot[7]}
${masteryTextBySlot[8]} ${masteryTextBySlot[9]}`);
  };
};

//MVP計算用
battlerecord_mvp = function (unusedParam) {

  const killEnemyCounters = [];
  const maxAttackDamageArr = [];
  const totalAttackDamageArr = [];
  const skillAcquisitionSequenceValues = [];
  const maxAcceptedDamageArr = [];
  const totalAcceptedDamageArr = [];
  const deadCounters = [];
  const gameVar298Values = [];
  const partyMembers = $gameParty.members();
  if (partyMembers.length === 0) return;
  const skillAcquisitionSequence = $gameVariables.value(351);
  const var298Array = $gameVariables.value(298);
  for (let index = 0, lastIndex = partyMembers.length - 1; index <= lastIndex; index++) {
    const actorId = partyMembers[index]._actorId;
    const actor = $gameActors.actor(actorId);

    killEnemyCounters.push(actor.getAllKillEnemyCounter());
    maxAttackDamageArr.push(actor.attackDamageMax);
    totalAttackDamageArr.push(actor.attackDamageSum);
    skillAcquisitionSequenceValues.push(skillAcquisitionSequence[actorId]);
    maxAcceptedDamageArr.push(actor.acceptDamageMax);
    totalAcceptedDamageArr.push(actor.acceptDamageSum);
    deadCounters.push(actor.deadCounter);
    gameVar298Values.push(var298Array[actorId]);
  };

  const mvpKillCounter = killEnemyCounters.reduce(function (acc, val) {
    return Math.max(acc, val);
  });
  const mvp = $gameVariables.value(350);
  mvp[1] = mvpKillCounter;
  const mvpMaxAttackDamage = maxAttackDamageArr.reduce((acc, val) => Math.max(acc, val));
  mvp[2] = mvpMaxAttackDamage;
  const mvpTotalAttackDamage = totalAttackDamageArr.reduce((acc, val) => Math.max(acc, val));
  mvp[3] = mvpTotalAttackDamage;
  const mvpGameVar351 = skillAcquisitionSequenceValues.reduce((acc, val) => Math.max(acc, val));
  mvp[4] = mvpGameVar351;
  const mvpMaxAcceptedDamage = maxAcceptedDamageArr.reduce((acc, val) => Math.max(acc, val));
  mvp[5] = mvpMaxAcceptedDamage;
  const mvpTotalAcceptedDamage = totalAcceptedDamageArr.reduce((acc, val) => Math.max(acc, val));
  mvp[6] = mvpTotalAcceptedDamage;
  const mvpDeadCounter = deadCounters.reduce((acc, val) => Math.max(acc, val));
  mvp[7] = mvpDeadCounter;
  const mvpGameVar298 = gameVar298Values.reduce((acc, val) => Math.max(acc, val));
  mvp[8] = mvpGameVar298;

};

//☆☆アクター変数20の通常ステータス表示,0と4ウィンド使用
actor_stateshyouji = function () {
  const actorId = $gameVariables.value(20);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;

  updateActorHStateDisplayActorStateshyouji(actor, actorId);
  displayBattleRecordActorStateshyouji(actor, actorId);
  displaySkillRecordActorStateshyouji(actor);
};

// Process MVP indicators for battle statistics
function setupMvpIndicatorActorStateshyouji(value, actorValue, isMvp) {
  if (value === 0) return '';
  if (value === actorValue) {
    return isMvp ? '\\C[17][MVP!]\\C[0]' : '\\C[10][WORST…]\\C[0]';
  }
  return '';
}

function updateActorHStateDisplayActorStateshyouji(actor, actorId) {
  let windowYOffset;
  if (!$gameSwitches.value(496) && !$gameSwitches.value(130) && $gameVariables.value(193) === 0) {
    windowYOffset = 128;
  } else {
    windowYOffset = 0;
  }
  WindowManager.show(0, windowYOffset, 0, 430, 202);
  actorId = actorId || actor.actorId();

  seiyoku_jougenn1(actor);

  const actorStateValues = $gameVariables.value(actorId + 380);
  const baseIndex = 400;

  // 性欲度表示用情報を書き込み
  const displayStart = 1, displayEnd = 40;
  for (let i = displayStart; i <= displayEnd; i++) {
    let statDisplay;
    if ($gameVariables.value(baseIndex + i) >= 1) {
      statDisplay = `\\C[2]+${$gameVariables.value(baseIndex + i)}\\C[0]`;
    } else {
      statDisplay = '　';
    }
    eval("valueWordSet" + i + " = statDisplay");
  }

  // 現在のＨステートを変数643に代入
  $gameVariables.setValue(643, `\\I[16]`);
  const stateDisplayList = valueHstateDisplay; // assumed defined globally
  stateDisplayList.forEach(function (stateId) {
    if (actor.isStateAffected(stateId)) {
      $gameVariables.setValue(643, $gameVariables.value(643) + `\\I[${$dataStates[stateId].iconIndex}]`);
    }
  });

  let stateThreshold;
  if (actor.isLearnedSkill(74)) {
    stateThreshold = 500;
  } else if (actor.isLearnedSkill(72)) {
    stateThreshold = 200;
  }

  let actorInfoText = `\\fs[24]\\C[1]${actor.nickname()}\\C[0]\n`;
  actorInfoText += `\x1bSET[${actor.actorId()}]\n`;
  if (isGirl(actor)) {
    let firstStateDisplay;
    if (actorStateValues[0] === 0) {
      firstStateDisplay = ` `;
    } else {
      firstStateDisplay = `<${actorStateValues[0]}>`;
    }
    actorInfoText += `\\C[27]${$dataSystem.variables[baseIndex + 1]}\\C[0]${actorStateValues[1]}${firstStateDisplay}${eval("valueWordSet" + 1)}`;
    actorInfoText += `\\C[27]${$dataSystem.variables[baseIndex + 2]}\\C[0]${actorStateValues[2]}${eval("valueWordSet" + 2)}\n`;
    actorInfoText += `\\C[27]${$dataSystem.variables[baseIndex + 4]}\\C[0]${actorStateValues[4]}<${actorStateValues[5]}>`;
    if (actor.isLearnedSkill(65)) {
      actorInfoText += `\\C[27]${$dataSystem.variables[baseIndex + 3]}\\C[0]${actorStateValues[3]}%　\n`;
    } else {
      actorInfoText += `\\C[27]${$dataSystem.variables[baseIndex + 3]}\\C[0]───%　\n`;
    }
    actorInfoText += `\\V[643]`;
  }
  WindowManager.drawText(0, actorInfoText);
}

function displayBattleRecordActorStateshyouji(actor, actorId) {
  if (!$gameSwitches.value(130)) {
    return;
  }

  const totalKillValue = $gameVariables.value(351)[actorId];
  const totalDamageValue = $gameVariables.value(298)[actorId];

  const mvpStats = $gameVariables.value(350);
  let mvpKill = mvpStats[1];
  let mvpAttackMax = mvpStats[2];
  let mvpAttackSum = mvpStats[3];
  let mvpCritical = mvpStats[4];
  let mvpAcceptMax = mvpStats[5];
  let mvpAcceptSum = mvpStats[6];
  let mvpDead = mvpStats[7];
  let mvpDefeatValue = mvpStats[8];

  // Set MVP indicators for each stat
  mvpKill = setupMvpIndicatorActorStateshyouji(mvpKill, actor.getAllKillEnemyCounter(), true);
  mvpAttackMax = setupMvpIndicatorActorStateshyouji(mvpAttackMax, actor.attackDamageMax, true);
  mvpAttackSum = setupMvpIndicatorActorStateshyouji(mvpAttackSum, actor.attackDamageSum, true);
  mvpDefeatValue = setupMvpIndicatorActorStateshyouji(mvpDefeatValue, totalDamageValue, true);
  mvpCritical = setupMvpIndicatorActorStateshyouji(mvpCritical, totalKillValue / 2, true); // using totalKillValue/2 for OverKill
  mvpAcceptMax = setupMvpIndicatorActorStateshyouji(mvpAcceptMax, actor.acceptDamageMax, true);
  mvpAcceptSum = setupMvpIndicatorActorStateshyouji(mvpAcceptSum, actor.acceptDamageSum, true);
  mvpDead = setupMvpIndicatorActorStateshyouji(mvpDead, actor.deadCounter, false);

  const battleRecordText = `\\C[16]<Battle Record!>\\C[0]
TotalKill  :\\C[10]${actor.getAllKillEnemyCounter()}\\C[0]${mvpKill}
MaxAssalt  :\\C[10]${actor.attackDamageMax}\\C[0]${mvpAttackMax}
TotalAssalt:\\C[10]${actor.attackDamageSum}\\C[0]${mvpAttackSum}
Critical   :\\C[10]${totalDamageValue}\\C[0]${mvpDefeatValue}
OverKill   :\\C[10]${totalKillValue / 2}\\C[0]${mvpCritical}
MaxDamage  :\\C[1]${actor.acceptDamageMax}\\C[0]${mvpAcceptMax}
TotalDamage:\\C[1]${actor.acceptDamageSum}\\C[0]${mvpAcceptSum}
Defead     :\\C[1]${actor.deadCounter}\\C[0]${mvpDead}
`;
  WindowManager.show(1, 0, 200, 500, 389);
  WindowManager.drawText(1, battleRecordText);
}

// New function to display the skill record
function displaySkillRecordActorStateshyouji(actor) {
  let attackUsageTotal = 0,
    sAbilityUsageTotal = 0,
    aAbilityUsageTotal = 0,
    wAbilityUsageTotal = 0,
    rAbilityUsageTotal = 0,
    burstUsageTotal = 0,
    chainUsageTotal = 0;

  for (let skillId = 1; skillId <= $dataSkills.length - 1; skillId++) {
    if (!$dataSkills[skillId] || $dataSkills[skillId].name === '') { // Skip skills with empty names
      continue;
    }

    switch ($dataSkills[skillId].stypeId) {
      case 2:
        attackUsageTotal += actor.getSkillUseCounter(skillId);
        break;
      case 5:
        sAbilityUsageTotal += actor.getSkillUseCounter(skillId);
        break;
      case 6:
        aAbilityUsageTotal += actor.getSkillUseCounter(skillId);
        break;
      case 7:
        wAbilityUsageTotal += actor.getSkillUseCounter(skillId);
        break;
      case 8:
        rAbilityUsageTotal += actor.getSkillUseCounter(skillId);
        break;
      case 12:
        burstUsageTotal += actor.getSkillUseCounter(skillId);
        break;
      case 13:
        chainUsageTotal += actor.getSkillUseCounter(skillId);
        break;
      default:
        break;
    }
  }

  const skillRecordText = `\\C[16]<Skill Record!>\\C[0]
Attack   :${attackUsageTotal}
S-Ability:${sAbilityUsageTotal}
A-Ability:${aAbilityUsageTotal}
W-Ability:${wAbilityUsageTotal}
R-Ability:${rAbilityUsageTotal}
Burst!   :${burstUsageTotal}
Chain!   :${chainUsageTotal}
`;

  WindowManager.show(2, 500, 200, 268, 389);
  WindowManager.drawText(2, skillRecordText);

  if ($gameSwitches.value(130)) {
    WindowManager.show(4, 430, 0, 340, 202);
    hstates_heights($gameVariables.value(20), 253);
    WindowManager.drawText(4, `\\V[253]`);
  }
}

//☆☆性欲度上限計算。露出計算時とＨプロフ表示時に一緒にやっておく
seiyoku_jougenn = function () {
  const actorId = $gameVariables.value(20);
  const gameActor = $gameActors.actor(actorId);
  seiyoku_jougenn1(gameActor);
}
seiyoku_jougenn1 = function (gameActor) {

  if (!gameActor) return;
  const actorVariableIndex = gameActor.actorId() + 380;
  const actorSuppressionValues = $gameVariables.value(actorVariableIndex);
  actorSuppressionValues[0] = 0;
  for (const requiredSkillId of valueHstaSuppression) {
    if (!gameActor.isLearnedSkill(requiredSkillId)) continue;
    const suppressionSkill = $dataSkills[requiredSkillId];
    const hideIfLearnedSkillId = suppressionSkill.meta['Hide if Learned Skill']; // 'Hide if Learned Skill' is missing in meta
    if (hideIfLearnedSkillId && gameActor.isLearnedSkill(Number(hideIfLearnedSkillId))) continue;

    const suppressionParamsRaw = suppressionSkill.meta['HstaSuppression'];
    if (!suppressionParamsRaw) continue;
    const suppressionParams = suppressionParamsRaw.split(',');
    const suppressionType = Number(suppressionParams[0]);
    if (suppressionType == 0 || suppressionType == 401) {
      const suppressionThreshold = Number(suppressionParams[1]) * 100;
      if (actorSuppressionValues[0] == 0 || suppressionThreshold <= actorSuppressionValues[0]) {
        actorSuppressionValues[0] = suppressionThreshold - 1;
      }
    }
  }

};

//☆☆限界露出値計算
//const rosyutu_genkai_id1 = 400
//const rosyutu_genkai_id2 = 55;
rosyutu_genkai = function () {
  const actorId = $gameVariables.value(20);
  const gameActor = $gameActors.actor(actorId);
  rosyutu_genkai1(gameActor);
}
rosyutu_genkai1 = function (gameActor) {

  if (!gameActor) return;
  const id = 405; // 400 + 5
  $gameVariables.setValue(id, 100);
  const actorSkillLevel = gameActor.skillMasteryLevel(55);
  switch (actorSkillLevel) {
    case 1:
      $gameVariables.setValue(id, 90);
      break;
    case 2:
      $gameVariables.setValue(id, 70);
      break;
    case 3:
      $gameVariables.setValue(id, 50);
      break;
    case 4:
      $gameVariables.setValue(id, 30);
      break;
    case 5:
      $gameVariables.setValue(id, 10);
      break;
    case 6:
      $gameVariables.setValue(id, 0);
      break;
    default:
      break;
  }
  $gameVariables.value(gameActor.actorId() + 380)[5] = $gameVariables.value(id);
  $gameVariables.setValue(id, 0);

  seiyoku_jougenn1(gameActor);

};

//☆☆現在露出度計上
const rosyutu_genzai_ids = [
  461, 462, 463, 464, 465, 466, 467, 468, 469, 470,
  471, 472, 473, 474, 475, 476, 477, 478, 479, 480,
  481, 482, 483, 484, 485, 486, 487, 488, 489, 490,
  491, 492, 493, 494, 495, 496, 497, 498, 499, 500];
rosyutu_genzai = function () {
  const actorId = $gameVariables.value(20);
  rosyutu_genzai1(actorId);
}
rosyutu_genzai1 = function (actorId) {

  $gameVariables.setValue(404, 0);
  const actorId_180 = actorId + 180;
  const actorId_380 = actorId + 380;
  const itemsLen = $dataItems.length;
  for (var i = 1201; i < itemsLen; i++) {
    const item = $dataItems[i];
    if (item.meta['TotalCloth']) continue;

    const itemMetaEICSwitchNum = Number(item.meta['EICSwitch']);
    const itemMetaClothSwitchNum_460 = Number(item.meta['ClothSwitch']) + 460;
    const itemMetaClothAllocationNumberNum = Number(item.meta['ClothAllocationNumber']);
    const itemMetaClothUncoverCountNum = Number(item.meta['ClothUncoverCount']);
    for (const id of rosyutu_genzai_ids) {
      switch (itemMetaEICSwitchNum) {
        case actorId_180:
        case actorId_380:
        case 200:
          break;
        default:
          continue;
      }

      if (id !== itemMetaClothSwitchNum_460
        || $gameVariables.value(id) !== itemMetaClothAllocationNumberNum) continue;

      $gameVariables.setValue(404, $gameVariables.value(404) + itemMetaClothUncoverCountNum);
    }
  }

  $gameVariables.value(actorId_380)[4] = $gameVariables.value(404);
  $gameVariables.setValue(404, 0);
};

//受精するかどうかの計算
jusei_keisan = function () {

  var fertilizationBase = 11;
  var actor = $gameActors.actor($gameVariables.value(20));
  if (!actor) return;
  if (!actor.isStateAffected(83) && actor.isLearnedSkill(65)) {
    if ($gameVariables.value(400 + fertilizationBase) >= 1) {
      var fertilizationRate = $gameVariables.value($gameVariables.value(20) + 380)[3];
      if (fertilizationRate >= 1) {
        var fertilizationRoll = getRandomIndex(101);
        if (fertilizationRate >= fertilizationRoll || actor.battleSkillsRaw().includes(873) || actor.isStateAffected(75)) {
          if (actor.battleSkillsRaw().includes(874) || actor.isStateAffected(76)) {
            var rejectionMessage = `${actor.name()}は\\C[27]${$dataSkills[874].name}\\C[0]の効果により受精を退けた。`;
            CommonPopupManager.showInfo({}, rejectionMessage, null);
          } else {
            actor.addState(79);
            if ($gameVariables.value(340) >= 1) {
              var pregnancyPartnerSlot = $gameVariables.value(340) - 200;//101-200の間
              $gameVariables.value($gameVariables.value(20) + 360)[pregnancyPartnerSlot] += 1;
            };
          };
        }
      }
    }
  };

};

//受精してるキャラ以外の受精相手記録を消滅
jusei_clear = function () {

  var list = $gameVariables.value(247);
  if (!list) return;
  list.forEach(function (id) {
    $gameVariables.setValue(20, id);
    var actor = $gameActors.actor(id);
    if (!actor) return;
    actor.removeState(79);//受精前段階ステート消滅
    if (!actor.isStateAffected(82)) {
      for (var i = 101; i <= 200; i++) {
        if ($gameVariables.value($gameVariables.value(20) + 360)[i] >= 1) {
          $gameVariables.value($gameVariables.value(20) + 360)[i] = 0;
        }
      }
    };
  }, this);

};

//☆☆Ｈステのうち、身長等
hstates_heights = function (id, resultVarId) {

  var actor1 = $gameActors.actor(id);
  if (actor1 && isGirl(actor1)) {
    var actor = $dataActors[id];
    if (!actor || !actor.meta['HeightEtc']) return;
    if (actor1.elementRate(37) >= 1.1) {
      var reproductionLabel = `\\fs[25]Reproduction:${Math.round(actor1.elementRate(37))}%`;
    } else {
      var reproductionLabel = ``;
    };
    var heightCm = Number(actor.meta['HeightEtc'].split(',')[0]);//身長
    var weightKg = Number(actor.meta['HeightEtc'].split(',')[1]);//体重
    var bustCm = Number(actor.meta['HeightEtc'].split(',')[2]);//バスト
    var waistCm = Number(actor.meta['HeightEtc'].split(',')[3]);//ウェスト
    var hipCm = Number(actor.meta['HeightEtc'].split(',')[4]);//ヒップ
    var physiqueChangeCount = 0;//体型変化による影響数値
    //スキルによる増加valuePhysiquUp
    var list = valuePhysiquUp;
    list.forEach(function (i) {
      if ($dataSkills[i].meta['BodyWeightChange'] && $gameActors.actor(id).battleSkillsRaw().includes(i)) {
        weightKg += Number($dataSkills[i].meta['BodyWeightChange']);
        physiqueChangeCount += 1;
      };
      if ($dataSkills[i].meta['BustSizeChange'] && $gameActors.actor(id).battleSkillsRaw().includes(i)) {
        bustCm += Number($dataSkills[i].meta['BustSizeChange']);
        physiqueChangeCount += 1;
      };
      if ($dataSkills[i].meta['WaistSizeChange'] && $gameActors.actor(id).battleSkillsRaw().includes(i)) {
        waistCm += Number($dataSkills[i].meta['WaistSizeChange']);
        physiqueChangeCount += 1;
      };
      if ($dataSkills[i].meta['HipSizeChange'] && $gameActors.actor(id).battleSkillsRaw().includes(i)) {
        hipCm += Number($dataSkills[i].meta['HipSizeChange']);
        physiqueChangeCount += 1;
      };
    }, this);
    //妊娠時の増加
    weightKg += $gameVariables.value(id + 380)[42];
    bustCm += $gameVariables.value(id + 380)[43];
    waistCm += $gameVariables.value(id + 380)[44];
    hipCm += $gameVariables.value(id + 380)[45];
    var cupSize = (bustCm - (heightCm * 0.435 - (heightCm * 0.38 - waistCm))) + 2;//カップサイズ測定。最後に+2を独自挿入
    //カップ測定
    if (cupSize <= 2.49) { cupSize = `AAAAA` };
    if (cupSize <= 4.99) { cupSize = `AAAA` };
    if (cupSize <= 7.49) { cupSize = `AAA` };
    if (cupSize <= 9.99) { cupSize = `AA` };
    if (cupSize <= 12.49) { cupSize = `A` };
    if (cupSize <= 14.99) { cupSize = `B` };
    if (cupSize <= 17.49) { cupSize = `C` };
    if (cupSize <= 19.99) { cupSize = `D` };
    if (cupSize <= 22.49) { cupSize = `E` };
    if (cupSize <= 24.99) { cupSize = `F` };
    if (cupSize <= 27.49) { cupSize = `G` };
    if (cupSize <= 29.99) { cupSize = `H` };
    if (cupSize <= 32.49) { cupSize = `I` };
    if (cupSize <= 34.99) { cupSize = `J` };
    if (cupSize <= 37.49) { cupSize = `K` };
    if (cupSize <= 39.99) { cupSize = `L` };
    if (cupSize <= 42.49) { cupSize = `M` };
    if (cupSize <= 44.99) { cupSize = `N` };
    if (cupSize <= 47.49) { cupSize = `O` };
    if (cupSize <= 49.99) { cupSize = `P` };
    if (cupSize <= 52.49) { cupSize = `Q` };
    if (cupSize <= 54.99) { cupSize = `R` };
    if (cupSize <= 57.49) { cupSize = `S` };
    if (cupSize <= 59.99) { cupSize = `T` };
    if (cupSize >= 60) { cupSize = `──` };
    var bodyStyleLabel = ``;
    var physiqueUpCount = valuePhysiquUp.length;
    if ($dataActors[id].meta['BodyStyle']) {
      if (physiqueChangeCount >= physiqueUpCount * 2) {
        bodyStyleLabel += `\\C[27][${$dataItems[742].name}]\\C[0]`;
        if (id == $gameVariables.value(2)) { $gameVariables.setValue(612, physiqueUpCount * 2) };
      } else {
        if (physiqueChangeCount >= physiqueUpCount) {
          bodyStyleLabel += `\\C[27][${$dataItems[741].name}]\\C[0]`;
          if (id == $gameVariables.value(2)) { $gameVariables.setValue(611, physiqueUpCount) };
        } else {
          if (physiqueChangeCount >= physiqueUpCount / 2) {
            //bodyStyleLabel += `\\V[27][Ｈな${$dataActors[id].meta['BodyStyle']}]\\C[0]`;
            bodyStyleLabel += `\\C[21][${$dataActors[id].meta['BodyStyle']}]\\C[0]`;
          }
        }
      }
    };
    var virginLabel = `\\C[27][処女ヒロイン]\\C[0]`
    if ($gameVariables.value(id + 380)[6] >= 1) {
      var virginLabel = `\\C[0][非処女ヒロイン]\\C[0]`
    };
    if ($gameVariables.value(id + 380)[6] >= 100) {
      var virginLabel = `\\C[31][中古ヒロイン]\\C[0]`
    };
    if ($gameVariables.value(id + 380)[6] >= 1000) {
      var virginLabel = `\\C[30][中古]\\C[0]`
    };
    $gameVariables.setValue(resultVarId,
      `\\fs[25]\\C[16]HT:\\C[0]${heightCm}\\C[16]cm\\C[0]　\\C[16]WT:\\C[0]${weightKg}\\C[16]kg\\C[0]
\\C[16]Cup:\\C[0][${cupSize}] \\C[16]B:\\C[0]${bustCm} \\C[16]W:\\C[0]${waistCm} \\C[16]H:\\C[0]${hipCm}
${bodyStyleLabel}
${virginLabel}
${reproductionLabel}`);
    $gameVariables.value(id + 380)[51] = heightCm;
    $gameVariables.value(id + 380)[52] = weightKg;
    $gameVariables.value(id + 380)[53] = bustCm;
    $gameVariables.value(id + 380)[54] = waistCm;
    $gameVariables.value(id + 380)[55] = hipCm;
    $gameVariables.value(id + 380)[56] = cupSize;
  } else {
    if ($dataActors[id] && $dataActors[id].meta['BodyStyle']) {
      $gameVariables.setValue(resultVarId, `\\C[21][${$dataActors[id].meta['BodyStyle']}]\\C[0]`);
    } else {
      $gameVariables.setValue(resultVarId, `NoData`);
    };
  };

};

//☆☆Hスキル習得通常パターン
hskill_learn = function (learnModeId) {

  var actor = $gameActors.actor($gameVariables.value(20));
  if (!actor) return;
  var list = valueGetHskillLearn;
  list.forEach(function (i) {
    if (learnModeId == 1) { var valueLearn = !actor.isLearnedSkill(i) };
    if (learnModeId == 2) { var valueLearn = actor.isLearnedSkill(i) };
    if (valueLearn) {
      $gameVariables.setValue(641, 0);
      if ($gameVariables.value(340) >= 1) {
        var hskValue1 = $gameVariables.value(340) - 300;
        var hskValue2 = $gameVariables.value($gameVariables.value(20) + 360)[hskValue1];
        $gameVariables.setValue(641, hskValue2);
      };
      $gameVariables.value($gameVariables.value(20) + 380)[63] = $gameVariables.value($gameVariables.value(20) + 360)[6];//武器ID306の性欲薬使用回数を計上
      if ($dataSkills[i].meta['PremiseSkill1']) { var hskValue1 = Number($dataSkills[i].meta['PremiseSkill1']) } else { var hskValue1 = 407 };
      if ($dataSkills[i].meta['PremiseSkill2']) { var hskValue2 = Number($dataSkills[i].meta['PremiseSkill2']) } else { var hskValue2 = 407 };
      if ($dataSkills[i].meta['PremiseSkill3']) { var hskValue3 = Number($dataSkills[i].meta['PremiseSkill3']) } else { var hskValue3 = 407 };
      if ($dataSkills[i].meta['PremiseSkillRank1']) { var hskValue4 = Number($dataSkills[i].meta['PremiseSkillRank1'].split(',')[0]) } else { var hskValue4 = 407 };
      if ($dataSkills[i].meta['PremiseSkillRank2']) { var hskValue5 = Number($dataSkills[i].meta['PremiseSkillRank2'].split(',')[0]) } else { var hskValue5 = 407 };
      if ($dataSkills[i].meta['PremiseSkillRank3']) { var hskValue6 = Number($dataSkills[i].meta['PremiseSkillRank3'].split(',')[0]) } else { var hskValue6 = 407 };
      if ($dataSkills[i].meta['PremiseSkillRank1']) { var hskValue7 = Number($dataSkills[i].meta['PremiseSkillRank1'].split(',')[1]) } else { var hskValue7 = 0 };
      if ($dataSkills[i].meta['PremiseSkillRank2']) { var hskValue8 = Number($dataSkills[i].meta['PremiseSkillRank2'].split(',')[1]) } else { var hskValue8 = 0 };
      if ($dataSkills[i].meta['PremiseSkillRank3']) { var hskValue9 = Number($dataSkills[i].meta['PremiseSkillRank3'].split(',')[1]) } else { var hskValue9 = 0 };
      if ($dataSkills[i].meta['PremiseVariable1']) { var hskValue10 = Number($dataSkills[i].meta['PremiseVariable1'].split(',')[0]) } else { var hskValue10 = 2 };
      if ($dataSkills[i].meta['PremiseVariable2']) { var hskValue11 = Number($dataSkills[i].meta['PremiseVariable2'].split(',')[0]) } else { var hskValue11 = 2 };
      if ($dataSkills[i].meta['PremiseVariable3']) { var hskValue12 = Number($dataSkills[i].meta['PremiseVariable3'].split(',')[0]) } else { var hskValue12 = 2 };
      if ($dataSkills[i].meta['PremiseVariable1']) { var hskValue13 = Number($dataSkills[i].meta['PremiseVariable1'].split(',')[1]) } else { var hskValue13 = 0 };
      if ($dataSkills[i].meta['PremiseVariable2']) { var hskValue14 = Number($dataSkills[i].meta['PremiseVariable2'].split(',')[1]) } else { var hskValue14 = 0 };
      if ($dataSkills[i].meta['PremiseVariable3']) { var hskValue15 = Number($dataSkills[i].meta['PremiseVariable3'].split(',')[1]) } else { var hskValue15 = 0 };
      if ($dataSkills[i].meta['PremiseArrangement1']) { var hskValue16 = Number($dataSkills[i].meta['PremiseArrangement1'].split(',')[0]) } else { var hskValue16 = 0 };
      if ($dataSkills[i].meta['PremiseArrangement2']) { var hskValue17 = Number($dataSkills[i].meta['PremiseArrangement2'].split(',')[0]) } else { var hskValue17 = 0 };
      if ($dataSkills[i].meta['PremiseArrangement3']) { var hskValue18 = Number($dataSkills[i].meta['PremiseArrangement3'].split(',')[0]) } else { var hskValue18 = 0 };
      if ($dataSkills[i].meta['PremiseArrangement1']) { var hskValue19 = Number($dataSkills[i].meta['PremiseArrangement1'].split(',')[1]) } else { var hskValue19 = 0 };
      if ($dataSkills[i].meta['PremiseArrangement2']) { var hskValue20 = Number($dataSkills[i].meta['PremiseArrangement2'].split(',')[1]) } else { var hskValue20 = 0 };
      if ($dataSkills[i].meta['PremiseArrangement3']) { var hskValue21 = Number($dataSkills[i].meta['PremiseArrangement3'].split(',')[1]) } else { var hskValue21 = 0 };
      if ($dataSkills[i].meta['MainCharaPremise']) { var hskValue22 = $gameVariables.value(2) } else { var hskValue22 = 0 };
      if ($dataSkills[i].meta['SkillLearningClass']) { var hskValue22 = 100 };//あったらここでは習得させない
      if (hskValue22 == 0 || hskValue22 == $gameVariables.value(20)) {
        if (actor.isLearnedSkill(hskValue1) &&
          actor.isLearnedSkill(hskValue2) &&
          actor.isLearnedSkill(hskValue3) &&
          actor.skillMasteryLevel(hskValue4) >= hskValue7 &&
          actor.skillMasteryLevel(hskValue5) >= hskValue8 &&
          actor.skillMasteryLevel(hskValue6) >= hskValue9 &&
          $gameVariables.value(hskValue10) >= hskValue13 &&
          $gameVariables.value(hskValue11) >= hskValue14 &&
          $gameVariables.value(hskValue12) >= hskValue15 &&
          $gameVariables.value(380 + $gameVariables.value(20))[hskValue16] >= hskValue19 &&
          $gameVariables.value(380 + $gameVariables.value(20))[hskValue17] >= hskValue20 &&
          $gameVariables.value(380 + $gameVariables.value(20))[hskValue18] >= hskValue21
        ) {
          actor.learnSkill(i);
          var hskValue0 = `──\\C[2]H-Passive\\C[0]\\C[27]\x1bSIN[${i}]\\C[0]Expression…──\n`;
          hskValue0 += `${$dataSkills[i].description}\\C[0]\n`;
          eval("valueWordSet" + valueCountSet2 + " += hskValue0");
          valueCountSet1 += 1;
          if ((valueCountSet1 % 6) == 0) {
            valueCountSet2 += 1;
            var hskValue1 = `\\FS[28]\\C[10]<H-Passive Expression!>\\FS[25]\\C[0]\n`;
            eval("valueWordSet" + valueCountSet2 + " = hskValue1");
          };
        } else {
          //リセット時のみ実行。スキル忘却
          if (learnModeId == 2) {
            actor.forgetSkill(i);
            var hskValue1 = `──${$dataSkills[i].name}忘却…──`;
            CommonPopupManager.showInfo({}, hskValue1, null);
          };
        };
      };
    } else {
      if ($dataSkills[i].meta['LostHSkill']) {
        if ($dataSkills[i].meta['PremiseVariable1']) {
          if ($gameVariables.value(Number($dataSkills[i].meta['PremiseVariable1'].split(',')[0])) < Number($dataSkills[i].meta['PremiseVariable1'].split(',')[1])) {
            actor.forgetSkill(i);
          };
        };
      };
    };
  }, this);
  if (valueHskillLearnArr.length > 0 && learnModeId == 1) {
    for (var i = 0; i <= valueHskillLearnArr.length - 1; i++) {
      var hskValue0 = `──\\C[2]H-Passive\\C[0]\\C[27]\x1bSIN[${valueHskillLearnArr[i]}]\\C[0]RankUp!──\n`;
      hskValue0 += `${$dataSkills[valueHskillLearnArr[i]].description}\\C[0]\n`;
      eval("valueWordSet" + valueCountSet2 + " += hskValue0");
      valueCountSet1 += 1;
      if ((valueCountSet1 % 6) == 0) {
        valueCountSet2 += 1;
        var hskValue1 = `\\FS[28]\\C[10]<H-Passive Expression!>\\FS[25]\\C[0]\n`;
        eval("valueWordSet" + valueCountSet2 + " = hskValue1");
      };
    };
  };
  if (learnModeId == 1) {
    hskill_learn2();
  };

};

//☆☆Hスキル習得やアイテム入手特殊パターン
hskill_learn2 = function () {

  var actor = $gameActors.actor($gameVariables.value(20));
  if (!actor) return;
  var exposureSkillId = 55;//露出開発度
  var itemOrClothId = zenravalueId;//全裸
  var rankThreshold = 1;
  if ($dataItems[itemOrClothId] && actor.skillMasteryLevel(exposureSkillId) >= rankThreshold && !$gameParty.hasItem($dataItems[itemOrClothId])) {
    $gameParty.gainItem($dataItems[itemOrClothId], 1);
    var learnMessage = `──\\C[2]${$dataSkills[exposureSkillId].name}\\C[0]が${rankThreshold}到達！　\\C[27]\x1bIIN[${itemOrClothId}]\\C[0]Get!──\n`;
    learnMessage += `${$dataItems[itemOrClothId].description}\\C[0]\n`;
    eval("valueWordSet" + valueCountSet2 + " += learnMessage");
    valueCountSet1 += 1;
    if ((valueCountSet1 % 6) == 0) {
      valueCountSet2 += 1;
      var itemOrClothId = `\\FS[28]\\C[10]<H-Passive Expression!>\\FS[25]\\C[0]\n`;
      eval("valueWordSet" + valueCountSet2 + " = itemOrClothId");
    };
  };
  var itemOrClothId = clothPartsChoice;//パーツ指定
  var rankThreshold = 2;
  if ($dataItems[itemOrClothId] && actor.skillMasteryLevel(exposureSkillId) >= rankThreshold && !$gameParty.hasItem($dataItems[itemOrClothId])) {
    $gameParty.gainItem($dataItems[itemOrClothId], 1);
    var learnMessage = `──\\C[2]${$dataSkills[exposureSkillId].name}\\C[0]が${rankThreshold}到達！　\\C[27]\x1bIIN[${itemOrClothId}]\\C[0]Get!──\n`;
    learnMessage += `${$dataItems[itemOrClothId].description}\\C[0]\n`;
    eval("valueWordSet" + valueCountSet2 + " += learnMessage");
    valueCountSet1 += 1;
    if ((valueCountSet1 % 6) == 0) {
      valueCountSet2 += 1;
      var itemOrClothId = `\\FS[28]\\C[10]<H-Passive Expression!>\\FS[25]\\C[0]\n`;
      eval("valueWordSet" + valueCountSet2 + " = itemOrClothId");
    };
  };
  var itemOrClothId = 'ClothBreakage';//ClothType指定
  var rankThreshold = 3;
  if (actor.skillMasteryLevel(exposureSkillId) >= rankThreshold) {
    for (var i = 1; i <= $dataItems.length - 1; i++) {
      if ($dataItems[i].meta['subCategory'] && $dataItems[i].meta['ClothType'] && $dataItems[i].meta['TotalCloth']) {
        if ($gameParty.hasItem($dataItems[i])) {
          for (var j = 1; j <= $dataItems.length - 1; j++) {
            if ($dataItems[j].meta['subCategory'] && $dataItems[j].meta['ClothType']) {
              if ($dataItems[i].meta['subCategory'] == $dataItems[j].meta['subCategory']) {
                if ($dataItems[j].meta['ClothType'] == itemOrClothId) {
                  if (!$gameParty.hasItem($dataItems[j])) {
                    clothes_get($gameVariables.value(20), $dataItems[j].meta['subCategory'], $dataItems[j].meta['ClothType']);
                    var learnMessage = `──\\C[2]${$dataSkills[exposureSkillId].name}:Rank${rankThreshold}\\C[0]の効果により、\\C[27]\x1bIIN[${j}]\\C[0]Get!──\n`;
                    eval("valueWordSet" + valueCountSet2 + " += learnMessage");
                    valueCountSet1 += 1;
                    if ((valueCountSet1 % 6) == 0) {
                      valueCountSet2 += 1;
                      var itemOrClothId = `\\FS[28]\\C[10]<H-Passive Expression!>\\FS[25]\\C[0]\n`;
                      eval("valueWordSet" + valueCountSet2 + " = itemOrClothId");
                    };
                    break;
                  } else {
                    break;
                  };
                }
              }
            }
          }
        }
      }
    }
  };
  var itemOrClothId = '改';//ClothType指定
  var rankThreshold = 4;
  if (actor.skillMasteryLevel(exposureSkillId) >= rankThreshold) {
    for (var i = 1; i <= $dataItems.length - 1; i++) {
      if ($dataItems[i].meta['subCategory'] && $dataItems[i].meta['ClothType'] && $dataItems[i].meta['TotalCloth']) {
        if ($gameParty.hasItem($dataItems[i])) {
          for (var j = 1; j <= $dataItems.length - 1; j++) {
            if ($dataItems[j].meta['subCategory'] && $dataItems[j].meta['ClothType']) {
              if ($dataItems[i].meta['subCategory'] == $dataItems[j].meta['subCategory']) {
                if ($dataItems[j].meta['ClothType'] == itemOrClothId) {
                  if (!$gameParty.hasItem($dataItems[j])) {
                    clothes_get($gameVariables.value(20), $dataItems[j].meta['subCategory'], $dataItems[j].meta['ClothType']);
                    var learnMessage = `──\\C[2]${$dataSkills[exposureSkillId].name}:Rank${rankThreshold}\\C[0]の効果により、\\C[27]\x1bIIN[${j}]\\C[0]Get!──\n`;
                    eval("valueWordSet" + valueCountSet2 + " += learnMessage");
                    valueCountSet1 += 1;
                    if ((valueCountSet1 % 6) == 0) {
                      valueCountSet2 += 1;
                      var itemOrClothId = `\\FS[28]\\C[10]<H-Passive Expression!>\\FS[25]\\C[0]\n`;
                      eval("valueWordSet" + valueCountSet2 + " = itemOrClothId");
                    };
                    break;
                  } else {
                    break;
                  };
                }
              }
            }
          }
        }
      }
    }
  };
  var rankThreshold = 5;
  if (!$gameSwitches.value(604)) {
    if (actor.skillMasteryLevel(exposureSkillId) >= rankThreshold) {
      $gameSwitches.setValue(604, true);
      var learnMessage = `──\\C[2]${$dataSkills[exposureSkillId].name}\\C[0]が${rankThreshold}到達！　メニュー画面に\\C[27]着せ替え\\C[0]出現──\n`;
      learnMessage += `\n`;
      eval("valueWordSet" + valueCountSet2 + " += learnMessage");
      valueCountSet1 += 1;
      if ((valueCountSet1 % 6) == 0) {
        valueCountSet2 += 1;
        var itemOrClothId = `\\FS[28]\\C[10]<H-Passive Expression!>\\FS[25]\\C[0]\n`;
        eval("valueWordSet" + valueCountSet2 + " = itemOrClothId");
      };
    };
  };

  var itemOrClothId = 875;//９種組み合わせ
  if (!actor.isLearnedSkill(itemOrClothId)) {
    if (actor.skillMasteryLevel(51) >= 6 &&
      actor.skillMasteryLevel(52) >= 6 &&
      actor.skillMasteryLevel(53) >= 6 &&
      actor.skillMasteryLevel(54) >= 6 &&
      actor.skillMasteryLevel(55) >= 6 &&
      actor.skillMasteryLevel(56) >= 6 &&
      actor.skillMasteryLevel(57) >= 6 &&
      actor.skillMasteryLevel(58) >= 6 &&
      actor.skillMasteryLevel(59) >= 6) {
      actor.learnSkill(itemOrClothId);
      var learnMessage = `──\\C[2]全開発度(経験値)\\C[0]\\C[10]Max\\C[0]！　\\C[27]\x1bSIN[${itemOrClothId}]\\C[0]Expression!──\n`;
      learnMessage += `${$dataSkills[itemOrClothId].description}\\C[0]\n`;
      eval("valueWordSet" + valueCountSet2 + " += learnMessage");
      valueCountSet1 += 1;
      if ((valueCountSet1 % 6) == 0) {
        valueCountSet2 += 1;
        var itemOrClothId = `\\FS[28]\\C[10]<H-Passive Expression!>\\FS[25]\\C[0]\n`;
        eval("valueWordSet" + valueCountSet2 + " = itemOrClothId");
      };
    };
  };

};

//☆☆Ｈパッシブ未収得分の条件提示
actor_HpassiveConditions = function (a, b, itemId) {

  if ($gameSwitches.value(115)) {
    $gameSwitches.setValue(115, false)
    WindowManager.hide(1);
  } else {
    if (isGirl($gameActors.actor(b.actorId()))) {
      $gameSwitches.setValue(115, true)
      var actor = $gameActors.actor(b.actorId());
      var value = `${actor.name()}の未収得\\C[27]<H-Passive>\\C[0]\n`
      var unlearnedCount = 0;
      var windowHeight = 0;
      var start = 1;
      var end = $dataSkills.length - 1;
      for (var i = start; i <= end; i++) {
        if ($dataSkills[i].meta['HSkillLearn'] && !actor.isLearnedSkill(i)) {
          value += `\\C[27]${$dataSkills[i].name}\\C[0]\n`;
          value += `${$dataSkills[i].meta['ADDescription']}\n`;
          unlearnedCount += 1;
        };
      };
      if (unlearnedCount >= 1) {
        windowHeight += unlearnedCount * 60;
        WindowManager.show(1, 0, 0, 1280, windowHeight);
        WindowManager.drawText(1, `\\fs[28]${value}`);
      } else {
        WindowManager.show(1, 0, 100, 1024, 180);
        WindowManager.drawText(1, `\\C[27]\\fs[28]H-Passive Complete!\\C[0]`);
      };
    } else {
      TickerManager.show(`${$gameActors.actor(b.actorId()).name()}は対象キャラではありません…。`);
    };
  };

};

//☆スキルアイテムステート性経験値補正
hStates_up1 = function (id) {

  if (id == 1) { var value = $dataSkills; var metaList = valueHStatesUp1 };
  if (id == 2) { var value = $dataItems; var metaList = valueHStatesUp2 };
  if (id == 3) { var value = $dataStates; var metaList = valueHStatesUp3 };
  var actor = $gameActors.actor($gameVariables.value(20));
  if (!actor || !value || !metaList) return;
  var list = metaList;
  list.forEach(function (i) {
    if (value[i].meta['HexpReflectionSkill'] && actor.battleSkillsRaw().includes(i)) {
      if (value[i].meta['HexpActivateSwi']) {
        var activateSwitchId = Number(value[i].meta['HexpActivateSwi']);
      } else {
        var activateSwitchId = 2;
      };
      if ($gameSwitches.value(activateSwitchId)) {
        var reflectionSkillId = 0;
        var activateVarId = 0;
        var reflectionVarId = 0;
        var reflectionSkillRank = 0;
        if (value[i].meta['HexpReflectionSkill']) { var reflectionSkillId = Number(value[i].meta['HexpReflectionSkill']) };
        if (value[i].meta['HexpActivateVal']) { var activateVarId = Number(value[i].meta['HexpActivateVal']) };
        if (value[i].meta['HexpReflectionVal']) { var reflectionVarId = Number(value[i].meta['HexpReflectionVal']) };
        if (value[i].meta['HexpReflectionSkillRank']) { var reflectionSkillRank = Number(value[i].meta['HexpReflectionSkillRank']) };
        if (activateVarId >= 1 && $gameVariables.value(activateVarId) >= 1) {
          var reflectionGain = $gameVariables.value(activateVarId) * actor.skillMasteryLevel(reflectionSkillId) * reflectionSkillRank;
          $gameVariables.setValue(reflectionVarId, $gameVariables.value(reflectionVarId) + reflectionGain);
          var gainMessage = `\\C[27]<${value[i].name}>\\C[0]発動\\C[31](+${reflectionGain})\\C[0]\\I[12]\n`;
          eval("valueWordSet" + valueCountSet2 + " += gainMessage");
          valueCountSet1 += 1;
          if ((valueCountSet1 % 3) == 0) {
            valueCountSet2 += 1
            var reflectionSkillId = `\\C[10]H-Passive[${valueCountSet2}]\\C[0]\n`;
            eval("valueWordSet" + valueCountSet2 + " = reflectionSkillId");
          };
        };
      };
    };
    if (value[i].meta['ProstitutionMoneyUp'] && actor.battleSkillsRaw().includes(i)) {
      if ($gameVariables.value(427) >= 1) {
        var prostitutionMoneyRate = Number(value[i].meta['ProstitutionMoneyUp']);
        $gameVariables.setValue(427, $gameVariables.value(427) * prostitutionMoneyRate);
        var gainMessage = `\\C[27]<${value[i].name}>\\C[0]発動\\C[31](×${prostitutionMoneyRate}\\G)\\C[0]\\I[12]\n`;
        eval("valueWordSet" + valueCountSet2 + " += gainMessage");
        valueCountSet1 += 1;
        if ((valueCountSet1 % 3) == 0) {
          valueCountSet2 += 1
          var reflectionSkillId = `\\C[10]H-Passive[${valueCountSet2}]\\C[0]\n`;
          eval("valueWordSet" + valueCountSet2 + " = reflectionSkillId");
        };
      };
    };
  }, this);
  if (id == 3) {
    //売春額一時記憶と娼婦ジョブ経験値取得
    valueProstitutionMoney = $gameVariables.value(427);
    if (valueProstitutionMoney >= 1) {
      if (actor.subclass()) {
        if (actor._subclassId == 41) {
          actor.gainExpSubclass(Math.ceil(valueProstitutionMoney / 10));
          var gainMessage = `ジョブ:\\C[27][\x1bJ[41]]\\C[0]に\\C[31]${Math.ceil(valueProstitutionMoney / 10)}\\C[0]expを取得\\I[12]\n`;
          eval("valueWordSet" + valueCountSet2 + " += gainMessage");
          valueCountSet1 += 1;
          if ((valueCountSet1 % 3) == 0) {
            valueCountSet2 += 1
            var reflectionSkillId = `\\C[10]H-Passive[${valueCountSet2}]\\C[0]\n`;
            eval("valueWordSet" + valueCountSet2 + " = reflectionSkillId");
          };
        };
      };
    };
    //奴隷ジョブの時に奴隷ジョブ経験値取得
    if (actor.subclass()) {
      if (actor._subclassId == 42) {
        var reflectionSkillId = 0;
        for (var i = 401; i <= 440; i++) {
          if ($gameVariables.value(i) >= 1) {
            reflectionSkillId += $gameVariables.value(i);
          };
        };
        actor.gainExpSubclass(Math.ceil(reflectionSkillId));
        var gainMessage = `ジョブ:\\C[27][\x1bJ[42]]\\C[0]に\\C[31]${Math.ceil(reflectionSkillId)}\\C[0]expを取得\\I[12]\n`;
        eval("valueWordSet" + valueCountSet2 + " += gainMessage");
        valueCountSet1 += 1;
        if ((valueCountSet1 % 3) == 0) {
          valueCountSet2 += 1
          var reflectionSkillId = `\\C[10]H-Passive[${valueCountSet2}]\\C[0]\n`;
          eval("valueWordSet" + valueCountSet2 + " = reflectionSkillId");
        };
      };
    };
  };

};

//☆☆性欲度上限比較
seiyoku_genkai = function () {

  seiyoku_jougenn();
  //var actor = $gameActors.actor($gameVariables.value(20));
  if ($gameVariables.value(401) + $gameVariables.value($gameVariables.value(20) + 380)[1] >= $gameVariables.value($gameVariables.value(20) + 380)[0] && $gameVariables.value($gameVariables.value(20) + 380)[0] >= 1) {
    if ($gameSwitches.value(475)) {
      TickerManager.show(`性欲度上限のため、性欲度上昇が抑制された。`);
    } else {
      $gameVariables.setValue(506, $gameVariables.value(506) + `\n性欲度上限のため、性欲度上昇が抑制された。`);
    };
    $gameVariables.value($gameVariables.value(20) + 380)[1] = $gameVariables.value($gameVariables.value(20) + 380)[0];
    $gameVariables.setValue(401, 0);
  };
  if ($gameVariables.value(402) >= 100) {
    $gameVariables.value($gameVariables.value(20) + 380)[2] = 100;
    $gameVariables.setValue(402, 0);
  };

};

//☆☆性欲度以外のランク制限を実施
hstates_rankSeigen = function () {

  var actor = $gameActors.actor($gameVariables.value(20));
  if (!actor) return;
  var suppressionResult = `　`;
  var list = valueHstaSuppression;
  list.forEach(function (id) {
    if (actor.isLearnedSkill(id) && !actor.isLearnedSkill(Number($dataSkills[id].meta['Hide if Learned Skill']))) {
      var limitCount = 0;
      var suppressionSkillId = Number($dataSkills[id].meta['HstaSuppression'].split(',')[0]);
      var suppressionParam = Number($dataSkills[id].meta['HstaSuppression'].split(',')[1]);
      var suppressionNote = `\n${$dataSkills[id].name}の影響により`;
      if (suppressionSkillId == 0) {
        for (var suppressionSkillId = 431; suppressionSkillId <= 439; suppressionSkillId++) {
          if ($gameVariables.value(suppressionSkillId) >= 1 && actor.skillMasteryLevel(suppressionSkillId - 380) == suppressionParam) {
            var usageTotal = $gameVariables.value(suppressionSkillId) + $gameVariables.value($gameVariables.value(20) + 380)[suppressionSkillId - 400];
            if (usageTotal >= actor.skillMasteryUsageMax(suppressionSkillId - 380)) {
              $gameVariables.setValue(suppressionSkillId, 0);
              suppressionResult += `\\C[1][${$dataSkills[suppressionSkillId - 380].name}]\\C[0]`;
              limitCount += 1;
            };
          };
        };
        if (limitCount >= 1) {
          var limitLabel = `上昇抑制`;
          if ($gameSwitches.value(122)) {
            TickerManager.show(suppressionNote + suppressionResult + limitLabel);
          } else {
            $gameVariables.setValue(506, $gameVariables.value(506) + suppressionNote + suppressionResult + limitLabel);
          };
        };
      } else {
        if ($gameVariables.value(suppressionSkillId) >= 1 && actor.skillMasteryLevel(suppressionSkillId - 380) == suppressionParam) {
          var usageTotal = $gameVariables.value(suppressionSkillId) + $gameVariables.value($gameVariables.value(20) + 380)[suppressionSkillId - 400];
          if (usageTotal >= actor.skillMasteryUsageMax(suppressionSkillId - 380)) {
            $gameVariables.setValue(suppressionSkillId, 0);
            suppressionResult += `\\C[1][${$dataSkills[suppressionSkillId - 380].name}]\\C[0]`;
            limitCount += 1;
          };
          if (limitCount >= 1) {
            var limitLabel = `上昇抑制`;
            if ($gameSwitches.value(122)) {
              TickerManager.show(suppressionNote + suppressionResult + limitLabel);
            } else {
              $gameVariables.setValue(506, $gameVariables.value(506) + suppressionNote + suppressionResult + limitLabel);
            };
          };
        };
      };
    };
  }, this);

};

//☆☆性欲上昇簡易表示
seiyoku_kanniHyouji = function () {

  if (!$gameSwitches.value(475)) {
    valueWordSet0 = `${$gameVariables.value(506)}\n`;
  };
  var actor = $gameActors.actor($gameVariables.value(20));
  if (!actor) return;
  var start = 401; var end = 440;
  for (var i = start; i <= end; i++) {
    var skipFlag = 0;
    if (i != 405) {
      if (!$gameVariables.value(i) == 0) {
        if (i >= 401 && i <= 430) {
          var statDisplayValue = $gameVariables.value($gameVariables.value(20) + 380)[i - 400];
        } else {
          var statDisplayValue = actor.skillMasteryUses(i - 380);
          if (!actor.isLearnedSkill(i - 380)) { var skipFlag = 1 };
        };
        if (skipFlag == 0) {
          var statName = $dataSystem.variables[i];
          var statName = statName.replace("　", "");
          var statName = statName.replace("　", "");
          var statName = statName.replace("　", "");
          var statName = statName.replace(" ", "");
          var statName = statName.replace(":", "");
          if ($gameVariables.value(i) >= 1) {
            valueWordSet0 += `${actor.name()}の${statName}\\C[2]+${$gameVariables.value(i)}！\\C[0](${statDisplayValue + $gameVariables.value(i)})\n`;
          } else {
            valueWordSet0 += `${actor.name()}の${statName}\\C[1]${$gameVariables.value(i)}！\\C[0](${statDisplayValue + $gameVariables.value(i)})\n`;
          };
          if ($gameSwitches.value(475)) {
            TickerManager.show(valueWordSet0);
          };
        };
      }
    }
  };
  if (!$gameSwitches.value(475)) {
    if ($gameSwitches.value(154)) {
      $gameVariables.setValue(539, `${valueWordSet0}\n`);
      $gameVariables.setValue(540, $gameVariables.value(540) + 1);
    } else {
      $gameScreen.setDTextPicture(valueWordSet0, 28);
    };
  };
  $gameSwitches.setValue(122, false);

};

//☆☆性欲度補正
seiyoku_hosei = function () {
  const actorId = $gameVariables.value(20);
  const actor = $gameActors.actor(actorId);

  //現在。限界露出度設定
  rosyutu_genkai1(actor);
  rosyutu_genzai1(actor.actorId());

  //発情値を設定
  $gameVariables.setValue(402, $gameVariables.value(401));

  //初体験時の相手をＨステ配列41に記録
  const initialExperienceIndex = 6;
  const recordPartnerIndex = 41;
  if ($gameVariables.value(actorId + 380)[initialExperienceIndex] == 0 && $gameVariables.value(400 + initialExperienceIndex) >= 1) {
    $gameVariables.value(actorId + 380)[recordPartnerIndex] = $gameVariables.value(22);
  };

  //相手が魔物場合に魔物姦回数+1.事前に数字が入っている場合は無視。
  if ($gameVariables.value(420) == 0) {
    if ($dataWeapons[$gameVariables.value(340)].meta['monster']) {
      $gameVariables.setValue(420, 1);
    };
  };

  //人数が指定されている場合、339に数が格納されているので経験人数に反映
  //同一人物の場合に経験人数上昇を抑制
  const partyMemberIndex = $gameVariables.value(340) - 300;
  if ($gameVariables.value(actorId + 360)[partyMemberIndex] == 0) {
    const experienceCountId = 9;
    $gameVariables.setValue(400 + experienceCountId, $gameVariables.value(400 + experienceCountId) + $gameVariables.value(339));
  };

  //各相手とのＨ回数を記録。
  const hCountIndex1 = 6;
  const hCountIndex2 = 7;
  const hCountIndex3 = 8;
  if ($gameVariables.value(400 + hCountIndex1) >= 1 ||
    $gameVariables.value(400 + hCountIndex2) >= 1 ||
    $gameVariables.value(400 + hCountIndex3) >= 1) {
    const partyMemberHIndex = $gameVariables.value(340) - 300;
    $gameVariables.value(actorId + 360)[partyMemberHIndex] += 1;
  };

  //膣姦の時に中だしか否か。膣射回数に数字を入れている場合はその数字をそのまま採用。
  const vaginalHCount = $gameVariables.value(406);
  const vaginalCounterVar = 411;
  let computedVaginalInternal = 0;
  if (vaginalHCount >= 1 && $gameVariables.value(vaginalCounterVar) == 0) {
    for (let vaginalIteration = 1; vaginalIteration <= vaginalHCount; vaginalIteration++) {
      const coinFlipArray = [1, 0, 1, 0, 1, 1];
      const coinFlipResult = coinFlipArray[getRandomIndex(coinFlipArray.length)];
      if (coinFlipResult == 1) {
        computedVaginalInternal += 1;
      };
    };
    if (actor.battleSkillsRaw().includes(871) || actor.isStateAffected(73)) {
      computedVaginalInternal = vaginalHCount;
    };
    if (actor.battleSkillsRaw().includes(872) || actor.isStateAffected(74)) {
      computedVaginalInternal = 0;
    };
    if (computedVaginalInternal >= 1) {
      $gameVariables.setValue(vaginalCounterVar, $gameVariables.value(vaginalCounterVar) + computedVaginalInternal);
    };
  };

  const actorBattleSkillRaw = actor.battleSkillsRaw();

  //尻姦の時に中だしか否か
  const analHCount = $gameVariables.value(407);
  const analCounterVar = 412;
  let computedAnalInternal = 0;
  if (analHCount >= 1 && $gameVariables.value(analCounterVar) == 0) {
    for (let analIteration = 1; analIteration <= analHCount; analIteration++) {
      const coinFlipArray = [1, 0, 1, 0, 1, 1];
      const coinFlipResult = coinFlipArray[getRandomIndex(coinFlipArray.length)];
      if (coinFlipResult == 1) {
        computedAnalInternal += 1;
      };
    };
    if (actorBattleSkillRaw.includes(871) || actor.isStateAffected(73)) {
      computedAnalInternal = analHCount;
    };
    if (actorBattleSkillRaw.includes(872) || actor.isStateAffected(74)) {
      computedAnalInternal = 0;
    };
    if (computedAnalInternal >= 1) {
      $gameVariables.setValue(analCounterVar, $gameVariables.value(analCounterVar) + computedAnalInternal);
    };
  };
  //フェラの時に中だしか否か
  const fellationCount = $gameVariables.value(408);
  const fellationCounterVar = 416;
  let computedFellationInternal = 0;
  if (fellationCount >= 1 && $gameVariables.value(fellationCounterVar) == 0) {
    for (let fellationIteration = 1; fellationIteration <= fellationCount; fellationIteration++) {
      const coinFlipArray = [1, 0, 1, 0, 1, 1];
      const coinFlipResult = coinFlipArray[getRandomIndex(coinFlipArray.length)];
      if (coinFlipResult == 1) {
        computedFellationInternal += 1;
      };
    };
    if (actorBattleSkillRaw.includes(871) || actor.isStateAffected(73)) {
      computedFellationInternal = fellationCount;
    };
    if (actorBattleSkillRaw.includes(872) || actor.isStateAffected(74)) {
      computedFellationInternal = 0;
    };
    if (computedFellationInternal >= 1) {
      $gameVariables.setValue(fellationCounterVar, $gameVariables.value(fellationCounterVar) + computedFellationInternal);
    };
  };
  //経験人数二人以上で輪姦
  const experienceThresholdVar = 409;
  const groupRapeVar = 419;
  if ($gameVariables.value(experienceThresholdVar) >= 2) {
    $gameVariables.setValue(groupRapeVar, 1);
  };

  //受精するかどうか
  jusei_keisan();

  //回数に応じて各開発度に＋
  const developmentSourceVars = [406, 407, 408, 410, 408, 408, 411, 412, 416, 413, 421, 426, 414];
  const developmentTargetVars = [431, 432, 433, 435, 438, 437, 436, 436, 436, 434, 434, 439, 434];
  const devStartIdx = 0;
  const devEndIdx = 12; //配列の数に応じて変更
  let reproductionAmplificationFlag = 0;
  for (let devIndex = devStartIdx; devIndex <= devEndIdx; devIndex++) {
    if ($gameVariables.value(developmentSourceVars[devIndex]) >= 1) {
      let baseDevelopmentValue = $gameVariables.value(developmentSourceVars[devIndex]);
      if (actor.elementRate(37) >= 1.1) {
        baseDevelopmentValue = $gameVariables.value(developmentSourceVars[devIndex]) + Math.round(actor.elementRate(37));
        reproductionAmplificationFlag = 1;
      };
      $gameVariables.setValue(developmentTargetVars[devIndex], $gameVariables.value(developmentTargetVars[devIndex]) + baseDevelopmentValue);
    };
  };
  if (reproductionAmplificationFlag == 1) {
    const reproductionMessage = `\\C[27]<Reproduction>\\C[0]補正。各開発度/経験度加算値に\\C[27]+${Math.round(actor.elementRate(37))}\\C[0]\n`;
    eval("valueWordSet" + valueCountSet2 + " += reproductionMessage");
    valueCountSet1 += 1;
    if ((valueCountSet1 % 3) == 0) {
      valueCountSet2 += 1;
      const passiveMessage = `\\C[10]H-Passive[${valueCountSet2}]\\C[0]\n`;
      eval("valueWordSet" + valueCountSet2 + " = passiveMessage");
    };
  };
  //ステート精液の付与
  const vaginalStateCheck = 411;
  if ($gameVariables.value(vaginalStateCheck) >= 1) { actor.addState(84); }
  const fellationStateCheck = 408;
  if ($gameVariables.value(fellationStateCheck) >= 1) { actor.addState(85); }
  const groupRapeStateCheck = 419;
  if ($gameVariables.value(groupRapeStateCheck) >= 1) { actor.addState(86); }
  //各開発度のランクに応じて回数上昇の時に開発度に補正
  const devSourceArray = [406, 407, 408, 410, 411, 412, 413, 413, 418, 419, 420];
  const devSkillIndices = [51, 52, 53, 55, 56, 56, 51, 52, 54, 54, 54];
  const devTargetArray = [434, 434, 434, 434, 434, 434, 431, 432, 434, 434, 434];
  const devSkillThresholds = [2, 3, 3, 2, 3, 4, 2, 4, 4, 5, 5];
  const devStartIdx2 = 0;
  const devEndIdx2 = 10;
  for (let j = devStartIdx2; j <= devEndIdx2; j++) {
    if (actor.skillMasteryLevel(devSkillIndices[j]) >= Number(devSkillThresholds[j]) && $gameVariables.value(devSourceArray[j]) >= 1) {
      const developmentAdjustment = $gameVariables.value(devSourceArray[j]) * actor.skillMasteryLevel(devSkillIndices[j]);
      $gameVariables.setValue(devTargetArray[j], $gameVariables.value(devTargetArray[j]) + developmentAdjustment);
    };
  };
  //開発度ランクに応じて回数上昇の時に乗算。スキル51-59。最後に実行
  const multiplyStartIdx = 1;
  const multiplyEndIdx = 9;
  for (let k = multiplyStartIdx; k <= multiplyEndIdx; k++) {
    if (actor.skillMasteryLevel(k + 50) >= 1 && $gameVariables.value(k + 430) >= 2) {
      const multipliedValue = $gameVariables.value(k + 430) * actor.skillMasteryLevel(k + 50);
      $gameVariables.setValue(k + 430, multipliedValue);
    };
  };
  //発情値を性感開発値で増幅
  if (actor.skillMasteryLevel(54) >= 1 && $gameVariables.value(402) >= 1) {
    const passionAmplification = $gameVariables.value(402) * actor.skillMasteryLevel(54);
    $gameVariables.setValue(402, $gameVariables.value(402) + passionAmplification);
  };
  //発情値100で絶頂回数+
  if ($gameVariables.value(402) >= 100) {
    $gameVariables.setValue(414, $gameVariables.value(414) + 1);
    if (actor.isLearnedSkill(65)) {//スケベっこ以上で膣アナルフェラ回数に応じて絶頂回数+
      let aggregateHCount = $gameVariables.value(406);
      aggregateHCount += $gameVariables.value(407);
      aggregateHCount += $gameVariables.value(408);
      const extraClimax = getRandomIndex(aggregateHCount); // maybe in the value below mast be append the extraClimax value instead of aggregateHCount
      $gameVariables.setValue(414, $gameVariables.value(414) + aggregateHCount);
    };
  };
  //性感開発度に応じて絶頂時に潮吹きと失禁回数+
  if (actor.skillMasteryLevel(54) >= 3) {
    if ($gameVariables.value(414) >= 1) {
      {
        let randomClimaxModifier = getRandomIndex(101);
        randomClimaxModifier = randomClimaxModifier + (actor.skillMasteryLevel(54) * 10);
        if (randomClimaxModifier >= 80) {
          $gameVariables.setValue(425, $gameVariables.value(425) + 1);
        };
      }
      {
        let randomClimaxModifier = getRandomIndex(101);
        randomClimaxModifier = randomClimaxModifier + (actor.skillMasteryLevel(54) * 10);
        if (randomClimaxModifier >= 110) {
          $gameVariables.setValue(424, $gameVariables.value(424) + 1);
        };
      }
    };
  };

};

//☆☆性欲度情報を更新
seiyoku_hanei = function () {

  var actor = $gameActors.actor($gameVariables.value(20));
  if (!actor) return;
  var start = 1; var end = 30;
  for (var i = start; i <= end; i++) {
    $gameVariables.value($gameVariables.value(20) + 380)[i] += $gameVariables.value(i + 400);
    if ($gameVariables.value($gameVariables.value(20) + 380)[i] < 0) {
      $gameVariables.value($gameVariables.value(20) + 380)[i] = 0;
    };
  };
  if ([406, 407, 417, 418, 419, 420].some(function (id) { return $gameVariables.value(id) >= 1 })) {
    $gameVariables.value($gameVariables.value(20) + 380)[61] += 1;
  };
  //売春時のゴールド獲得処理
  if ($gameVariables.value(427) >= 1) {
    $gameParty.gainGold(Math.ceil($gameVariables.value(427)));
  };
  //強姦時に当日強姦回数に+。戦闘中に放心付与
  if ($gameVariables.value(418) >= 1) {
    $gameVariables.value($gameVariables.value(20) + 380)[71] += 1;
    if ($gameParty.inBattle() && !actor.battleSkillsRaw().includes(846)) {
      actor.addState(64);
    };
  };
  if (!actor.battleSkillsRaw().includes(867)) {
    if (!$gameParty.inBattle() && $gameVariables.value(414) >= 1) {//絶頂で発情鎮静。戦闘中はコモン113で行う
      var calmValue = 0;
      if (actor.isLearnedSkill(61)) { calmValue += getRandomIndex(1) };
      if (actor.isLearnedSkill(62)) { calmValue += getRandomIndex(2) };
      if (actor.isLearnedSkill(63)) { calmValue += getRandomIndex(3) };
      if (actor.isLearnedSkill(64)) { calmValue += getRandomIndex(4) };
      if (actor.isLearnedSkill(65)) { calmValue += getRandomIndex(5) };
      if (actor.isLearnedSkill(66)) { calmValue += getRandomIndex(6) };
      if (actor.isLearnedSkill(67)) { calmValue += getRandomIndex(6) };
      if (actor.isLearnedSkill(68)) { calmValue += getRandomIndex(6) };
      if (actor.isLearnedSkill(69)) { calmValue += getRandomIndex(6) };
      $gameVariables.value($gameVariables.value(20) + 380)[2] = calmValue;
    };
  };
  if ($gameVariables.value($gameVariables.value(20) + 380)[2] >= 51) {
    if (!actor.isStateAffected(61)) {
      var calmValue = `${actor.name()}は\\C[27]発情\\C[0]している…。`;
      if ($gameSwitches.value(154)) {
        $gameVariables.setValue(539, `${calmValue}\n`);
        $gameVariables.setValue(540, $gameVariables.value(540) + 1);
      } else {
        TickerManager.show(calmValue);
      };
    };
    actor.addState(61);
  } else {
    if (actor.isStateAffected(61)) {
      var calmValue = `${actor.name()}の\\C[27]発情\\C[0]が静まった…。`;
      if ($gameSwitches.value(154)) {
        $gameVariables.setValue(539, `${calmValue}\n`);
        $gameVariables.setValue(540, $gameVariables.value(540) + 1);
      } else {
        TickerManager.show(calmValue);
      };
    };
    actor.removeState(61);
  };

  valueHskillLearnArr = [];
  var start = 1; var end = 9;
  for (var i = start; i <= end; i++) {
    var calmValue = actor.skillMasteryLevel(i + 50);
    actor.gainSkillMasteryUses(i + 50, $gameVariables.value(i + 430));
    var newMasteryLevel = actor.skillMasteryLevel(i + 50);
    if (calmValue != newMasteryLevel && calmValue >= 1) {
      valueHskillLearnArr.push(i + 50);
    };
  };
  var start = 1; var end = 30;
  for (var i = start; i <= end; i++) {
    $gameVariables.setValue(400 + i, $gameVariables.value($gameVariables.value(20) + 380)[i]);
  };

};

//☆☆スキルアイテム使用による性欲数値更新a,b,this.item().id,1
seiyoku_itemHanei = function (unusedArg1, targetItem, itemOrSkillId, isSkill) {

  if (isSkill == 1) {
    var databaseEntries = $dataSkills;
  } else {
    var databaseEntries = $dataItems;
  };
  $gameVariables.setValue(20, targetItem.actorId());
  var actor = $gameActors.actor($gameVariables.value(20));
  if (!actor) return;
  if ($dataActors[targetItem.actorId()] && $dataActors[targetItem.actorId()].meta['Heroine']) {
    //使用アイテム名表示。アイテム使用時はパッシブ反映しない。
    if (databaseEntries[itemOrSkillId].meta['性欲度使用制限']) {
      var libidoUseLimitSkill = Number(databaseEntries[itemOrSkillId].meta['性欲度使用制限']);
    } else {
      var libidoUseLimitSkill = 18;
    };
    if (!isGirl($gameActors.actor($gameVariables.value(20)))) {
      var libidoUseLimitSkill = 61;
    };
    if ($gameActors.actor($gameVariables.value(20)).isLearnedSkill(libidoUseLimitSkill)) {
      for (var i = 401; i <= 440; i++) { $gameVariables.setValue(i, 0) };
      h_exp($gameVariables.value(20), '0_1_0', 306, false, true, false);
      var itemMessage = databaseEntries[itemOrSkillId].meta['HitemJudgement'].split(',');
      $gameVariables.setValue(Number(itemMessage[0]), Number(itemMessage[1]));
      $gameSwitches.setValue(475, true);
      valueWordSet0 = ``;
      seiyoku_genkai();
      seiyoku_kanniHyouji();
      seiyoku_hanei();
      $gameVariables.setValue(339, 0);
      $gameVariables.setValue(340, 0);
      for (var i = 401; i <= 440; i++) { $gameVariables.setValue(i, 0) };
      $gameVariables.setValue(506, ' ');
      $gameSwitches.setValue(130, false);
      if (databaseEntries == $dataItems) {
        var itemMessage = `${databaseEntries[itemOrSkillId].name}：${$gameParty.numItems(databaseEntries[itemOrSkillId])}個`;
        TickerManager.show(itemMessage);
      };
    } else {
      $gameParty.gainItem(databaseEntries[itemOrSkillId], +1);
      var itemMessage = `条件を満たしていない為、${actor.name()}には使用する事が出来ない…。`;
      TickerManager.show(itemMessage);
    };
    $gameSwitches.setValue(475, false);
  } else {
    $gameParty.gainItem(databaseEntries[itemOrSkillId], +1);
    var itemMessage = `${actor.name()}には使用する事が出来ない…。`;
    TickerManager.show(itemMessage);
  };

};

//☆☆当日受精率設定
jusei_todayrate = function () {

  var fertilizationSkillId = 65;//スケベっこで解放
  var list = $gameVariables.value(247);
  if (!list) return;
  list.forEach(function (id) {
    var actor = $gameActors.actor(id);
    if (!actor) return;
    if (actor.isLearnedSkill(fertilizationSkillId)) {
      $gameVariables.value(id + 380)[3] = getRandomIndex(11);
      if (actor.battleSkillsRaw().includes(870)) {
        $gameVariables.value(id + 380)[3] += getRandomIndex(51);
      };
    } else {
      $gameVariables.value(id + 380)[3] = 0;
    };
  }, this);

};

//☆☆キャラの各種遍歴代入actor_Hhennreki(3);valueWordSet
actor_Hhennreki = function (unusedArg1) {

  var wordSetIndex = `付与されているHステート\n`;
  for (var i = 1; i <= 10; i++) { eval("valueWordSet" + i + " = wordSetIndex") };
  var wordSetIndex = 1;
  var actor = $gameActors.actor($gameVariables.value(20));
  if (!actor) return;
  var list = valueHstateDisplay;
  list.forEach(function (id) {
    if (actor.isStateAffected(id)) {
      var stateDescText = `${$dataStates[id].description}`;
      if (actor.getStateCounter(id) != undefined) {
        stateDescText += `\\C[27]進行度:${actor.getStateCounter(id)}\\C[0]`;
      };
      stateDescText += `\n`;
      eval("valueWordSet" + wordSetIndex + " += stateDescText");
      valueCountSet1 += 1;
      if (valueCountSet1 % 8 == 0) { wordSetIndex += 1 };
    };
  }, this);
};

//☆☆キャラの各種遍歴代入前実行2actor_Hhennreki2Before(4,5,6);
//選択肢番号は、実際の配列番号+1にしている。
actor_Hhennreki2Before = function (displayTypeId) {

  var actor = $gameActors.actor($gameVariables.value(20));
  if (!actor) return;
  if (4 == displayTypeId) {
    var historyHeaderText = `\\I[526]\\C[27]男性遍歴　　　　　　\\C[0]　　 　　　　　　　　　　　　　　　`;
  };
  if (5 == displayTypeId) {
    var historyHeaderText = `\\I[428]\\C[27]出産履歴　　　　　　\\C[0]　　 　　　　　　　　　　　　　　　`;
  };
  if (6 == displayTypeId) {
    var historyHeaderText = `\\I[556]\\C[27]シーン履歴（直近100件）\\C[0]　　　　　　　　　　　　　　　　`;
  };
  const id = 1;
  const choiceParams = {
    text: `\\FS[25]${historyHeaderText}`,
    value: 0
  };
  $gameSystem.addCustomChoice(id, choiceParams);
  if (4 == displayTypeId && $gameVariables.value($gameVariables.value(20) + 380)[41] != 0) {//41は名前を入れている
    if (actor.isLearnedSkill(67)) {
      var historyHeaderText = `\\C[27]初体験の相手:\\C[0]`;
    } else {
      var historyHeaderText = `\\C[30]処女を奪った相手:\\C[0]`;
    };
    historyHeaderText += `${$gameVariables.value($gameVariables.value(20) + 380)[41]}`;
    const id = 1;
    const choiceParams = {
      text: `\\FS[25]${historyHeaderText}`,
      value: 1
    };
    $gameSystem.addCustomChoice(id, choiceParams);
  };
  if (5 == displayTypeId && $gameVariables.value($gameVariables.value(20) + 380)[49] >= 1) {//49はidを入れている
    if (actor.isLearnedSkill(67)) {
      var historyHeaderText = `\\C[27]初子の父親:\\C[0]`;
    } else {
      var historyHeaderText = `\\C[30]初子を産んだ男:\\C[0]`;
    };
    historyHeaderText += `${$dataWeapons[$gameVariables.value($gameVariables.value(20) + 380)[49]].name}`;
    const id = 1;
    const choiceParams = {
      text: `\\FS[25]${historyHeaderText}`,
      value: 1
    };
    $gameSystem.addCustomChoice(id, choiceParams);
  };

};

//☆☆キャラの各種遍歴代入2actor_Hhennreki2(4,5,6);
actor_Hhennreki2 = function (displayTypeId) {

  if (4 == displayTypeId || 5 == displayTypeId) {
    var actor = $gameActors.actor($gameVariables.value(20));
    if (!actor) return;
    var hhennrekiNameEntries = [0];
    var hhennrekiCounts = $gameVariables.value(360 + $gameVariables.value(20));
    if (4 == displayTypeId) { var startIndex = 1; var nameOffset = 300; var reverseOffset = 100 };
    if (5 == displayTypeId) { var startIndex = 201; var nameOffset = 100; var reverseOffset = -100 };
    var j = 0;
    if (displayTypeId == 4 || displayTypeId == 5) {
      for (var i = startIndex; i <= startIndex + 99; i++) {
        j += 1;
        if (hhennrekiCounts[i] >= 1) {
          var entryText = `\\C[16]${$dataWeapons[i + nameOffset].name}\\C[0]:`;
          if ($dataWeapons[i + nameOffset].meta['Profession']) {
            var entryText = `[${$dataWeapons[i + nameOffset].meta['Profession']}]\\C[16]${$dataWeapons[i + nameOffset].name}\\C[0]:`;
          } else {
            if ($dataWeapons[i + nameOffset].meta['FamilyName']) {
              var entryText = `\\C[16]${$dataWeapons[i + nameOffset].name} = $dataWeapons[i+nameOffset].meta['FamilyName']\\C[0]:`;
            };
          };
          if (actor.isLearnedSkill(67)) {
            entryText += `\\C[27]${hhennrekiCounts[i]}\\C[0]回`;
          } else {
            entryText += `\\C[1]${hhennrekiCounts[i]}\\C[0]回`;
          };
          if ($gameSwitches.value(164)) {
            if (displayTypeId == 4) {
              if (hhennrekiCounts[i + reverseOffset] >= 1) {
                entryText += `\\I[374]？`;
              }
            }
          };
          const id = 1;
          const choiceParams = {
            text: `\\FS[25]${entryText}`,
            value: j + 1
          };
          $gameSystem.addCustomChoice(id, choiceParams);
        };
      };
    };
  };
  if (displayTypeId == 6) {
    var hhennrekiNameEntries = $gameVariables.value(174) ? $gameVariables.value(174)[$gameVariables.value(20)] : 0;
    if (hhennrekiNameEntries && hhennrekiNameEntries.length > 0) {
      for (var i = hhennrekiNameEntries.length - 1; i >= 1; i--) {
        const id = 1;
        const choiceParams = {
          text: `\\FS[25]${hhennrekiNameEntries[i]}`,
          value: i + 1
        };
        $gameSystem.addCustomChoice(id, choiceParams);
      };
    };
  };

};

//☆☆汎用Ｈシーン時に文字ＢＧＶ。<汎用シーン性感低:>scene_textBgv($gameVariables.value(318),640,384);
const defaultSexualEcstasyHi = [`「アッ…」`, `「ンっ…」`, `「ンンっ…」`, `（ピクっ…\\I[12]）`];
const defaultSexualEcstasyMiddle = [`「アッ…\\I[12]」`, `「ンっ…」`, `「ンンっ…\\I[12]」`, `（ピクっ…\\I[12]）`];
const defaultSexualEcstasyLow = ['「ヤァッ…！」', '「ダメっ…！」', '「ヤメッ…！」',
  '「アっ…、ァァ…」', '（ビクンッ）'];
const textWindowIdOptionsSceneTextBgv = [28, 29, 30, 31, 32, 33, 34, 35, 36];
const additionalXOffsetOptionsSceneTextBgv = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, -50, -60, -70, -80, -90, -100, -110, -120, -130, -140, -150];
scene_textBgv = function (actorId, baseX, baseY, offsetMode, waitMode, fontSetting) {

  const gameActor = $gameActors.actor(actorId);
  if (!gameActor) return;
  const dataActor = gameActor.actor();
  //const actorNickname = actor.nickname();
  let ecstasyPhrases = [];
  let combinedEcstasyArray = [];

  if ($gameSwitches.value(119)) {
    if (gameActor.isLearnedSkill(68)) {
      ecstasyPhrases = dataActor.meta['SexualEcstasyHi']
        ? dataActor.meta['SexualEcstasyHi'].split(',')
        : defaultSexualEcstasyHi;
    } else {
      if (gameActor.isLearnedSkill(65)) {
        ecstasyPhrases = dataActor.meta['SexualEcstasyMiddle']
          ? dataActor.meta['SexualEcstasyMiddle'].split(',')
          : defaultSexualEcstasyMiddle;
      } else {

        ecstasyPhrases = dataActor.meta['SexualEcstasyLow']
          ? dataActor.meta['SexualEcstasyLow'].split(',')
          : defaultSexualEcstasyLow;
      }
    }
  } else {
    combinedEcstasyArray = $gameVariables.value(707) || [];
  }
  if (ecstasyPhrases.length > 0) { combinedEcstasyArray = combinedEcstasyArray.concat(ecstasyPhrases); }
  const chosenPhrase = combinedEcstasyArray[getRandomIndex(combinedEcstasyArray.length)] || '';
  if ($gameVariables.value(299) == 0) {
    $gameVariables.setValue(299, [121, 122, 123, 124, 125, 126, 127, 128, 129, 130]);
  }
  let availablePictureIds = $gameVariables.value(299);
  if (!availablePictureIds || availablePictureIds.length === 0) {
    availablePictureIds = [121, 122, 123, 124, 125, 126, 127, 128, 129, 130];
    $gameVariables.setValue(299, availablePictureIds);
  }
  const chosenPictureId = availablePictureIds[getRandomIndex(availablePictureIds.length)]; //ID
  let foundIndex = availablePictureIds.findIndex(idItem => idItem === chosenPictureId);
  if (foundIndex >= 0) {
    availablePictureIds.splice(foundIndex, 1);
  }
  const offsetBaseX = baseX;
  const offsetBaseY = baseY;
  let xOffsetOptions, yOffsetOptions;
  if (offsetMode == 1) {
    xOffsetOptions = [50, 100, 150, 200, 0, -50, -100, -150, -200];
    yOffsetOptions = [100, 150, 200, 0, -100, -200, -300, -350];
  } else {
    xOffsetOptions = [100, 200, 300, 400, 0, -100, -200, -300, -400];
    yOffsetOptions = [100, 150, 200, 0, -100, -200, -300, -350];
  }
  const chosenXOffset = xOffsetOptions[getRandomIndex(xOffsetOptions.length)]; //x offset
  const chosenYOffset = yOffsetOptions[getRandomIndex(yOffsetOptions.length)]; //y offset
  let waitTimeOptions, chosenWaitTime;
  if (waitMode == 0) {
    waitTimeOptions = [80, 90, 100, 110, 120]; // wait durations
    chosenWaitTime = waitTimeOptions[getRandomIndex(waitTimeOptions.length)];
  } else {
    waitTimeOptions = [100, 110, 120, 130, 140, 150, 160];
    chosenWaitTime = waitTimeOptions[getRandomIndex(waitTimeOptions.length)];
  }
  const chosenTextWindowId = textWindowIdOptionsSceneTextBgv[getRandomIndex(textWindowIdOptionsSceneTextBgv.length)];
  $gameScreen.setDTextPicture(`${chosenPhrase}`, chosenTextWindowId);
  $gameScreen.dWindowFrame = 'ON';
  if (fontSetting == 0) { } else { $gameScreen.setDtextFont(fontSetting); }
  $gameScreen.dTextAlign = 1;
  if (waitMode == 0) {
    $gameScreen.showPicture(chosenPictureId, "", 1, offsetBaseX + chosenXOffset, offsetBaseY + chosenYOffset, 150, 150, 255, 0);
    $gameScreen.movePicture(chosenPictureId, 1, offsetBaseX + chosenXOffset, offsetBaseY + chosenYOffset, 100, 100, 0, 0, chosenWaitTime);
  } else {
    const additionalXOffset = additionalXOffsetOptionsSceneTextBgv[getRandomIndex(additionalXOffsetOptionsSceneTextBgv.length)];
    $gameScreen.showPicture(chosenPictureId, "", 1, offsetBaseX + chosenXOffset + additionalXOffset, offsetBaseY + chosenYOffset, 100, 100, 255, 0);
    $gameScreen.movePicture(chosenPictureId, 1, offsetBaseX + chosenXOffset, offsetBaseY + chosenYOffset, 100, 100, 0, 0, chosenWaitTime);
  }
};

//☆☆CGの一部分で一言台詞pic_oneWord(valueSerialPictureId,x,y,25,60,arr1);
pic_oneWord = function (pictureSlot, baseX, baseY, textMotionParam, moveDuration, textOptions, fontSetting) {

  picture_motion1(textMotionParam >= 100 ? "smooth" : "linear", [0]);
  //var arr2 = [-50, 0, 50, -100, 100];
  const randomXOffset = getRandomIndex(201) - 100;
  const randomYOffset = getRandomIndex(201) - 100;
  const chosenText = textOptions[getRandomIndex(textOptions.length)];
  $gameScreen.setDTextPicture(chosenText, textMotionParam);
  $gameScreen.dWindowFrame = 'ON';
  if (fontSetting !== 0) { $gameScreen.setDtextFont(fontSetting) };
  $gameScreen.dTextAlign = 1;
  const actualBaseX = baseX;
  const actualBaseY = baseY;
  $gameScreen.showPicture(pictureSlot, "", 1, actualBaseX + randomXOffset, actualBaseY + randomYOffset, 50, 50, 255, 0);
  $gameScreen.movePicture(pictureSlot, 1, actualBaseX + randomXOffset, actualBaseY + randomYOffset, 150, 150, 0, 0, moveDuration);

};

//出産時の計算式
actor_pregnancyCalculation = function (actorId) {

  $gameVariables.setValue(20, actorId);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;
  if (!actor.isStateAffected(83)) {
    return;
  };
  
  //actor.addStateCounter(83, +10);
  //const randomValue = getRandomIndex(101);
  if (true) {
    actor.removeState(83);
    actor.removeStateCounter(83);
    $gameVariables.setValue(94, actor.name());
  };
  if ( actor.isStateAffected(83)) {
    return;
  }

  //妊娠時の一時的なサイズ増量表現を消去させる
  const actorId380 = actorId + 380;
  const hRecordsCount = $gameVariables.value(actorId380);
  hRecordsCount[42] = 0;
  hRecordsCount[43] = 0;
  hRecordsCount[44] = 0;
  hRecordsCount[45] = 0;

  //妊娠相手を特定する
  const potentialPartners = [];
  const actorId360 = actorId + 360;
  const partnerHRecords = $gameVariables.value(actorId360);
  for (let partnerIndex = 101; partnerIndex <= 200; partnerIndex++) {
    if (partnerHRecords[partnerIndex] >= 1) {
      potentialPartners.push(partnerIndex);
    }
  };
  const selectedPartner = potentialPartners[getRandomIndex(potentialPartners.length)];
  const finalPartner = selectedPartner ? selectedPartner : 102;
  partnerHRecords[finalPartner + 100] += 1;
  if (hRecordsCount[49] == 0) {
    hRecordsCount[49] = finalPartner + 200;
  };

  //受精相手を特定するための配列を0にする。
  const startPartner = 101;
  const endPartner = 200;
  for (let partnerIndex = startPartner; partnerIndex <= endPartner; partnerIndex++) {
    if (partnerHRecords[partnerIndex] >= 1) {
      partnerHRecords[partnerIndex] = 0;
    }
  };
};

//☆☆Hプロフィール表示時立ち絵
const HSTATES_BACKGROUND1 = "HstatesBackGround1";
const HSTATES_FRAME = "HstatesFrame";
const HSTATES_ACTOR_BUST_WHITE = "HstatesActorBustWhite";
const HSTATES_ACTOR_BODY = "HstatesActorBody";
const HSTATES_ACTOR_BUST = "HstatesActorBust";
const HSTATES_ACTOR_HEAD = "HstatesActorHead";
const HSTATES_BG_SHINE1 = "hStates_bgShine1";
const HSTATES_BODY_SHINE1 = "hStates_bodyShine1";
const HSTATES_BACKGROUND = "HstatesBackGround"; // Used with variable suffix
const HSTATES_ACTOR_FACE = "HstatesActorFace";
const CACHED_ANIMATION_FRAMES = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 2, 1, 4, 5, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
const fadeDurationsMap = {
  2: 60,
  3: 50,
  4: 40
};
const faceVariantMap = {
  1: "a",
  5: "b"
};
actor_hStatesTachie = function (mode) {

  const actorId = $gameVariables.value(20);
  const gameActor = $gameActors.actor(actorId); // bad using global dinamic! but the function was called from common event
  if (!gameActor) return;
  if (!isGirl(gameActor)) {
    tachie_hyouji2(gameActor);
  } else {
    const basePicId = 111;
    if (mode == 1) {
      setupActorHStatesTachieMode1(basePicId, actorId, gameActor);
    } else {
      updateActorHStatesTachieMode2(basePicId, actorId);
    }
  }
};
function setupActorHStatesTachieMode1(basePicId, actorId, gameActor) {
  setActorStateBasedOnSkillsHStatesTachie(gameActor);
  setupHStatesPictures(basePicId, actorId);
  setupAnimatedActorBust(basePicId, actorId);
  setupActorHead(basePicId, actorId);
  animatePictures(basePicId);
  setupParticleEffects(gameActor.actor().meta);
}

function setupHStatesPictures(basePicId, actorId) {
  $gameScreen.showPicture(basePicId + 4, HSTATES_BACKGROUND1, 1, 1024, 384, 100, 100, 255, 0);
  $gameScreen.showPicture(basePicId + 6, HSTATES_ACTOR_BODY + actorId + "_" + $gameVariables.value(192), 1, 1024, 400, 100, 100, 0, 0);
  $gameScreen.showPicture(basePicId + 9, HSTATES_ACTOR_FACE + actorId, 1, 1024, 384, 100, 100, 0, 0);
  //let defaultHue = '#00d0ff';
  $gameScreen.showPicture(basePicId + 10, HSTATES_ACTOR_BUST_WHITE, 1, 1024, 384, 0, 0, 0, 0);
  $gameScreen.showPicture(basePicId + 11, HSTATES_FRAME, 1, 1024, 384, 100, 100, 255, 0);
  $gameScreen.showPicture(basePicId + 5, HSTATES_FRAME, 1, 1024, 384, 100, 100, 255, 0);
}

function setupAnimatedActorBust(basePicId, actorId) {
  let actorBustName = HSTATES_ACTOR_BUST + actorId;
  $gameScreen.setPicturesAnimation(5, 1, "横", 3);
  $gameScreen.showPicture(basePicId + 7, actorBustName, 1, 1024, 384, 100, 100, 255, 0);
  $gameScreen.picture(basePicId + 7).startAnimationFrame(3, true, CACHED_ANIMATION_FRAMES);
}

function setupActorHead(basePicId, actorId) {
  let headVariant;
  if ($gameVariables.value(actorId + 440)[32] == 2) {
    headVariant = 1;
  } else {
    headVariant = 2;
  }

  $gameScreen.showPicture(basePicId + 8, HSTATES_ACTOR_HEAD + actorId + "_" + headVariant, 1, 1024, 368, 100, 100, 0, 0);
}

function animatePictures(basePicId) {
  $gameScreen.movePicture(basePicId + 6, 1, 1024, 400, 100, 100, 255, 0, 10);
  $gameScreen.movePicture(basePicId + 7, 1, 1024, 384, 100, 100, 255, 0, 10);
  $gameScreen.movePicture(basePicId + 8, 1, 1024, 368, 100, 100, 255, 0, 10);
  $gameScreen.movePicture(basePicId + 9, 1, 1024, 384, 100, 100, 255, 0, 10);
  $gameScreen.movePicture(basePicId + 10, 1, 1024, 384, 100, 100, 200, 0, 30);

  for (let pictureId = basePicId + 6; pictureId <= basePicId + 9; pictureId++) {
    if ($gameScreen.picture(pictureId)) {
      tachie_bless(pictureId, 0);
    }
  }
}

function setupParticleEffects(gameActorMeta) {
  let actorHue = '#00d0ff';
  if (gameActorMeta['tachieHue2']) {
    actorHue = gameActorMeta['tachieHue2'];
  }

  $gameScreen._particle.particleSet(0, HSTATES_BG_SHINE1, 'picture:116', 'def', 'above'); //55
  $gameScreen._particle.particleSet(0, HSTATES_BODY_SHINE1, 'picture:118', 'def', 'above'); //58
  $gameScreen._particle.particleUpdate([HSTATES_BODY_SHINE1, 'pos', 0, 20]);
  $gameScreen._particle.particleUpdate([HSTATES_BODY_SHINE1, 'color', actorHue, actorHue + '@0.5', actorHue]);
  //scale1-15 alfa1-0 speed1-1 #eb00ff
}

function updateActorHStatesTachieMode2(basePicId, actorId) {
  const hStageSexualDesireMod = $gameVariables.value(191);

  //パーティクルの変化設定
  //Animate フレーム設定がシビアなので使えない
  //if(actor.isLearnedSkill(62)){$gameVariables.setValue(191,2)};//反抗
  //if(actor.isLearnedSkill(64)){$gameVariables.setValue(191,3)};//自失
  //if(actor.isLearnedSkill(66)){$gameVariables.setValue(191,4)};//卑猥
  //if(actor.isLearnedSkill(68)){$gameVariables.setValue(191,5);$gameVariables.setValue(192,2)};//通常目光
  //if(actor.isLearnedSkill(70)){$gameVariables.setValue(191,6)};//あへ

  if (hStageSexualDesireMod >= 1) {
    const alphaStart = '0.7';
    const alphaEnd = '0.3';
    $gameScreen._particle.particleUpdate([HSTATES_BODY_SHINE1, 'alpha', alphaStart, alphaEnd + '@0.5', '0']);
  }
  if (hStageSexualDesireMod >= 2) {
    $gameScreen.movePicture(basePicId + 10, 1, 1024, 384, 100, 100, 150, 0, 60);
    const speedStart = '0.5';
    const speedEnd = '0.5';
    $gameScreen._particle.particleUpdate([HSTATES_BODY_SHINE1, 'speed', speedStart, speedEnd + '@0.5', speedEnd]);
  }
  if (hStageSexualDesireMod >= 3) {
    $gameScreen.movePicture(basePicId + 10, 1, 1024, 384, 100, 100, 50, 0, 60);
    const scaleStart = '10';
    const scaleEnd = '6';
    $gameScreen._particle.particleUpdate([HSTATES_BODY_SHINE1, 'scale', scaleStart, scaleEnd + '@0.5', scaleEnd]);
    $gameScreen._particle.particleUpdate([HSTATES_BODY_SHINE1, 'color', '#eb00ff', '#eb00ff@0.1', '#ffffff']);
  }
  if (hStageSexualDesireMod >= 4) {
    $gameScreen._particle.particleUpdate([HSTATES_BODY_SHINE1, 'emitterLifetime', '1']);
  }
  if (hStageSexualDesireMod >= 4) {
    $gameScreen.movePicture(basePicId + 10, 1, 1024, 384, 100, 100, 0, 0, 60);
    $gameScreen._particle.particleClear(HSTATES_BG_SHINE1);
    $gameScreen._particle.particleSet(0, 'hStates_bgShine2', 'picture:57', 'def', 'blow');
  }

  //デバック用
  //$gameScreen.movePicture(debugPictureId+10,1,1024,384,100,100,0,0,60);
  //$gameScreen._particle.particleUpdate(['hStates_bodyShine1','emitterLifetime','1']);

  if (hStageSexualDesireMod >= 2) {
    const fadeDuration = hStageSexualDesireMod >= 5 ? 30 : fadeDurationsMap[hStageSexualDesireMod] || 0;
    $gameScreen.showPicture(basePicId + 13, HSTATES_BACKGROUND + hStageSexualDesireMod, 1, 1024, 384, 100, 100, 255, 0);
    picture_fade1(basePicId + 13, "fadeOut", "HscenePose054", fadeDuration, 5);
  }

  if (hStageSexualDesireMod >= 2) {
    $gameScreen.showPicture(basePicId + 3, HSTATES_BACKGROUND + hStageSexualDesireMod, 1, 1024, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(basePicId + 4, 1, 1024, 384, 100, 100, 0, 0, 120);
    $gameScreen.movePicture(basePicId + 3, 1, 1024, 384, 100, 100, 255, 0, 120);
  }

  bless_erase();

  let facePictureId = HSTATES_ACTOR_FACE + actorId + "_" + hStageSexualDesireMod;
  $gameScreen.setPicturesAnimation(5, 1, "横", 5);
  $gameScreen.showPicture(basePicId + 9, facePictureId, 1, 1024, 384, 100, 100, 255, 0);
  $gameScreen.picture(basePicId + 9).startAnimationFrame(1, false, [1]);

  if (hStageSexualDesireMod == 1 || hStageSexualDesireMod == 5) {
    let faceVariantSuffix = faceVariantMap[hStageSexualDesireMod];
    $gameScreen.showPicture(basePicId + 12, HSTATES_ACTOR_FACE + actorId + faceVariantSuffix, 1, 1024, 384, 100, 100, 0, 3);
    $gameScreen.movePicture(basePicId + 12, 1, 1024, 384, 100, 100, 150, 3, 180);
  }
  $gameScreen.movePicture(basePicId + 11, 1, 1024, 384, 100, 100, 0, 0, 60);
  for (let pictureId = basePicId + 6, max = basePicId + 9; pictureId <= max; pictureId++) {
    if ($gameScreen.picture(pictureId)) {
      tachie_bless(pictureId, 0);
    }
  }
  if ($gameScreen.picture(basePicId + 7)) {
    hcg_piston(basePicId + 7, 9, 1, 2);
  }
}

function setActorStateBasedOnSkillsHStatesTachie(actor) {
  $gameVariables.setValue(192, 1);

  switch (true) {
    case actor.isLearnedSkill(70):
      $gameVariables.setValue(191, 6); // あへ
      break;
    case actor.isLearnedSkill(68):
      $gameVariables.setValue(191, 5); // 通常目光
      $gameVariables.setValue(192, 2);
      break;
    case actor.isLearnedSkill(66):
      $gameVariables.setValue(191, 4); // 卑猥
      break;
    case actor.isLearnedSkill(64):
      $gameVariables.setValue(191, 3); // 自失
      break;
    case actor.isLearnedSkill(62):
      $gameVariables.setValue(191, 2); // 反抗
      break;
    default:
      $gameVariables.setValue(191, 1);
  }

  //$gameVariables.setValue(192,2);//デバッグ用
  //$gameVariables.setValue(191,3);
}

//☆☆性欲度情報をリセット
seiyoku_parameterReset = function (resetModeId) {

  var actor = $gameActors.actor($gameVariables.value(20));
  if (!actor) return;
  if (resetModeId == 1) {//選択肢作成
    var start = 401; var end = 440;
    for (var i = start; i <= end; i++) {
      if (i != 405) {
        if (i >= 401 && i <= 430) {
          $gameVariables.setValue(i, $gameVariables.value($gameVariables.value(20) + 380)[i - 400]);
        } else {
          $gameVariables.setValue(i, actor.skillMasteryLevel(i - 380));
          if (!actor.isLearnedSkill(i - 380)) { $gameVariables.setValue(i, 0) };
        };
      }
    };
    const id = 1;
    const choiceParams = {
      text: `一括で未経験に変更　　　　　　　　　　　　　　　　　　`,
      value: 0
    };
    $gameSystem.addCustomChoice(id, choiceParams);
    for (var i = 401; i <= 439; i++) {//431-439経験値
      //if(i != 402 || i != 403 || i != 404 || i != 405 || i != 428 || i != 429){
      if ([402, 403, 404, 405, 428, 429].some(function (excludedVarId) { return excludedVarId == i })) { } else {
        var variableNameText = $dataSystem.variables[i];
        //var variableNameText = variableNameText.replace("　", "");
        //var variableNameText = variableNameText.replace("　", "");
        //var variableNameText = variableNameText.replace("　", "");
        //var variableNameText = variableNameText.replace(" ", "");
        var variableNameText = `${variableNameText}${$gameVariables.value(i)}`;
        const id = 1;
        const choiceParams = {
          text: variableNameText,
          value: i
        };
        $gameSystem.addCustomChoice(id, choiceParams);
      };
    };
  };
  if (resetModeId == 2) {//反映
    var start = $gameVariables.value(19) - 400;
    var end = $gameVariables.value(19) - 400;
    if ($gameVariables.value(19) == 0) {
      var start = 1; var end = 30;
    };
    if ($gameVariables.value(19) == 0 || $gameVariables.value(19) - 400 >= 1 && $gameVariables.value(19) - 400 <= 30) {
      for (var i = start; i <= end; i++) {
        if ($gameVariables.value($gameVariables.value(20) + 380)[i] >= 1) {
          $gameVariables.value($gameVariables.value(20) + 380)[i] = 0;
          $gameVariables.setValue(i + 400, 0)
          var variableNameText = $dataSystem.variables[i + 400];
          var variableNameText = variableNameText.replace("　", "");
          var variableNameText = variableNameText.replace("　", "");
          var variableNameText = variableNameText.replace("　", "");
          var variableNameText = variableNameText.replace(" ", "");
          var variableNameText = variableNameText.replace(":", "");
          var resetMessage = `\\C[1]${variableNameText}\\C[0]がリセットされました…`;
          CommonPopupManager.showInfo({}, resetMessage, null);
          if (i == 6) {
            $gameVariables.value($gameVariables.value(20) + 380)[41] = 0;
            var resetMessage = `\\C[2]初体験相手\\C[0]がリセットされました…`;
            CommonPopupManager.showInfo({}, resetMessage, null);
          };
        };
      };
    };
    if ($gameVariables.value(19) == 0) {
      var start = 31; var end = 40;
    };
    if ($gameVariables.value(19) == 0 || $gameVariables.value(19) - 400 >= 31 && $gameVariables.value(19) - 400 <= 40) {
      for (var i = start; i <= end; i++) {
        if (actor.isLearnedSkill(i + 20)) {
          actor.setSkillMasteryUses(i + 20, 0);
          actor.setSkillMasteryLevel(i + 20, 0);
          actor.forgetSkill(i + 20);
          var resetMessage = `${$dataSkills[i + 20].name}忘却…`;
          CommonPopupManager.showInfo({}, resetMessage, null);
        };
      };
    };
    hskill_learn(2);//該当するHスキル忘却
  };

};

//☆☆拘束前のセクハラ演出
actor_battleSekughara1 = function () {

  var actor = $gameActors.actor($gameVariables.value(20));
  if (!actor) return;
  var secuharaStateId = 81;
  actor.addState(secuharaStateId);
  if (actor._stateCounter[secuharaStateId] >= 1) {
    actor.addStateCounter(secuharaStateId, +10);
  } else {
    actor.setStateCounter(secuharaStateId, 1);
  };
  var secuharaImageName = $gameVariables.value($gameVariables.value(20) + 380)[4];
  var currentExposure = $gameVariables.value($gameVariables.value(20) + 380)[1];
  var exposureThreshold = Math.ceil((currentExposure + 1) / 10);//0の場合の対策で+1
  var randomRoll = getRandomIndex(101);
  exposureThreshold += actor._stateCounter[secuharaStateId];
  if (exposureThreshold >= randomRoll) {
    $gameSwitches.setValue(437, true);
  };
  var secuharaStateId = 54;
  var secuharaImageName = 'Screen_Width512Black';//右側のみＨＣＧの際に使用
  $gameScreen.showPicture(secuharaStateId, secuharaImageName, 1, 1024 - 100, 384, 100, 100, 0, 0);
  $gameScreen.movePicture(secuharaStateId, 1, 1024 - 50, 384, 100, 100, 200, 0, 60);
  valuePic1 = 60;
  var exposureThreshold = $gameVariables.value(20);
  var randomRoll = $gameVariables.value($gameVariables.value(20) + 380)[1];
  var enemyType = 1;//相手によって変更.1ヒト2ゴブ3巨人
  if ($gameSwitches.value(248)) { var enemyType = 2 };
  var imageDuration = 180; var poseVariant = 1;
  if (randomRoll >= 200) { var imageDuration = 170; var poseVariant = 2 };
  if (randomRoll >= 400) { var imageDuration = 160; var poseVariant = 3 };
  if (randomRoll >= 600) { var imageDuration = 150; var poseVariant = 4 };
  if (randomRoll >= 800) { var imageDuration = 140; var poseVariant = 5 };
  if (randomRoll >= 1000) { var imageDuration = 120; var poseVariant = 6 };
  for (var i = 1; i < 10; i++) {
    var skipFlag = 0;
    if (i == 2 && $gameVariables.value($gameVariables.value(20) + 440)[18] == 0) { var skipFlag = 1 };
    if (i == 6 && poseVariant <= 3) { var skipFlag = 1 };
    if (i == 8 && !actor.isStateAffected(83)) { var skipFlag = 1 };
    if (i == 10 && poseVariant <= 3) { var skipFlag = 1 };
    if (skipFlag == 0) {
      if ([1, 2, 4, 5, 6, 8, 10].some(function (id) { return i == id })) { var poseVariant = 1 };
      if (i == 3 && poseVariant >= 5) { var poseVariant = 2 };
      if (i == 5 && $gameVariables.value($gameVariables.value(20) + 440)[32] >= 1) { var poseVariant = 2 };
      if (i != 9) {
        var secuharaImageName = 'Zev_BattleSekuharaActor' + exposureThreshold + '_' + i + '_' + poseVariant;
      } else {
        var poseVariant = enemyType
        $gameScreen.setPicturesAnimation(2, imageDuration, '連番', 30);
        var secuharaImageName = 'Zev_BattleSekuharaActor' + exposureThreshold + '_' + i + '_' + poseVariant + '_0';
      };
      $gameScreen.showPicture(valuePic1 + i, secuharaImageName, 1, 640 + 400, 384 + 50, 100, 100, 0, 0);
      if (i == 9) {
        $gameScreen.picture(valuePic1 + i).startAnimationFrame(1, true, [2, 3]);
      };
      $gameScreen.movePicture(valuePic1 + i, 1, 640 + 400, 384 + 20, 100, 100, 255, 0, 40);
      if (i == 9 || i == 4) {
        hcg_piston(valuePic1 + i, 9, 2, 2);
      } else {
        tachie_bless(valuePic1 + i, 1);
      };
    };
  };
  var secuharaStateId = $gameVariables.value(20);//文字HBGV
  $gameVariables.setValue(318, secuharaStateId);
  $gameVariables.setValue(706, [640 + 400, 384 + 20, 1, 60, 0, 0]);
  $gameSwitches.setValue(119, true);

};

//☆☆H時の音や効果 BGSライン。通常1,Ｈ2-9,天候10,Bgv10+アクターID//
sex_direction = function (actionType, pistonIntensity, patternVariant) {

  let voicePatternNum = 0;
  // PERF: variable 530 was read four times and variable 20 four times, and
  // $dataActors / $gameActors were looked up twice each; hoist them into
  // locals. setValue(20, ...) stores the raw value, so value(20) === actorId.
  const actorId = $gameVariables.value(530);
  if (actorId >= 1) {
    $gameVariables.setValue(20, actorId);
    const actorData = $dataActors[actorId];
    if (actorData && actorData.meta['HvoicePattern']) {
      voicePatternNum = Number(actorData.meta['HvoicePattern']);
      if (pistonIntensity == 0) {
        const actor = $gameActors.actor(actorId);
        if (actor && actor.isLearnedSkill(65)) {
          pistonIntensity = 2;
        } else {
          pistonIntensity = 1;
        }
      }
    }
  }

  // Delegate each actionType to a standalone function (with 'SexDirection' suffix)
  switch (actionType) {
    case 99:
      actionType99SexDirection();
      break;
    case 0:
      actionType0SexDirection();
      break;
    case 1: // ピストン弱
      actionType1SexDirection(pistonIntensity, patternVariant, voicePatternNum);
      break;
    case 2: // ピストン強
      actionType2SexDirection(pistonIntensity, patternVariant, voicePatternNum);
      break;
    case 3: // 愛液
      actionType3SexDirection(pistonIntensity, patternVariant, voicePatternNum);
      break;
    case 4: // キス
      actionType4SexDirection(pistonIntensity, patternVariant, voicePatternNum);
      break;
    case 5: // フェラ
      actionType5SexDirection(pistonIntensity, patternVariant, voicePatternNum);
      break;
    case 6: // 揉み
      actionType6SexDirection(pistonIntensity, patternVariant, voicePatternNum);
      break;
    case 7: // 機械振動
      actionType7SexDirection(pistonIntensity, patternVariant, voicePatternNum);
      break;
    case 8: // 機械振動激しく
      actionType8SexDirection(pistonIntensity, patternVariant, voicePatternNum);
      break;
    case 11: // 挿入
      actionType11SexDirection(pistonIntensity, patternVariant, voicePatternNum);
      break;
    case 12: // 射精
      actionType12SexDirection(pistonIntensity, patternVariant, voicePatternNum);
      break;
    case 13: // 射精以外で終了
      actionType13SexDirection(pistonIntensity, patternVariant, voicePatternNum);
      break;
    case 51: // 写真撮影
      actionType51SexDirection(pistonIntensity, patternVariant, voicePatternNum);
      break;
    case 52: // 眼パチ閉
      actionType52SexDirection(pistonIntensity, patternVariant, voicePatternNum);
      break;
    case 53: // 眼パチ開く
      actionType53SexDirection(pistonIntensity, patternVariant, voicePatternNum);
      break;
    case 54: // 薄くピンク点灯
      actionType54SexDirection(pistonIntensity, patternVariant, voicePatternNum);
      break;
    default:
      break;
  }
};

function actionType99SexDirection() {
  // (actionType 99)
  // Stop all BGS and set variable 194.
  AudioManager.stopAllBgs();
  $gameVariables.setValue(194, 1);
}

function actionType0SexDirection() {
  // (actionType 0)
  // Clear particles and start flash effect with direct particle setting.
  const directParticleNames = ['hScene_Direct1'];
  for (let i = 0; i < directParticleNames.length; i++) {
    $gameScreen._particle.particleClear(directParticleNames[i]);
  }
  let flashDuration = getRandomIndex(41) + 180;
  const flashIntensity = getRandomIndex(21) + 40;
  $gameScreen.startFlash([255, 119, 255, flashDuration], flashIntensity);
  const directParticleName = 'hScene_Direct1';
  $gameScreen._particle.particleSet(0, directParticleName, 'screen', 'def', 'screen');
}

class SexActionSoundEffectBase {
  constructor(pistonIntensity, patternVariant, voicePatternNum) {
    this.pistonIntensity = pistonIntensity;
    this.patternVariant = patternVariant;
    this.voicePatternNum = voicePatternNum;
  }

  // default values are for sex action 3, FluidSoundEffect

  // first play bgs getters
  get soundName() {
    return "21_LoveJuice";
  }
  get volumeRandomIndexMax() {
    return 31;
  }
  get volumeOffset() {
    return 80;
  }
  get pitchRandomIndexMax() {
    return 41;
  }
  get pitchOffset() {
    return 80;
  }

  // optional second play bgs getters
  get playSecond() {
    return true;
  }
  get soundName2() {
    return this.soundName;
  }
  get volumeRandomIndexMax2() {
    return this.volumeRandomIndexMax;
  }
  get volumeOffset2() {
    return this.volumeOffset;
  }
  get pitchRandomIndexMax2() {
    return this.pitchRandomIndexMax;
  }
  get pitchOffset2() {
    return 50;
  }

  updateBgsLineSetting() {
    // Automatically update the BGS line configuration variable
    $gameVariables.setValue(194, $gameVariables.value(194) + 1);
    $gameSystem.setBgsLine($gameVariables.value(194));
  }

  playBgs(soundName, volumeOffset, pitchOffset, volumeRandomIndexMax, pitchRandomIndexMax) {
    const sound = soundName;
    const volume = getRandomIndex(volumeRandomIndexMax) + volumeOffset;
    const pitch = getRandomIndex(pitchRandomIndexMax) + pitchOffset;
    AudioManager.playBgs({ "name": sound, "volume": volume, "pitch": pitch, "pan": 0 });
  }

  get patternStrength() {
    return 7;
  }
  get patternVolumeOffset() {
    return 70;
  }
  get patternPitchOffset() {
    return 100;
  }
  get patternVolumeRandomIndexMax() {
    return 21;
  }
  get patternPitchRandomIndexMax() {
    return 21;
  }
  get isValidToPlayPatternBgs() {
    return this.voicePatternNum >= 1 && this.pistonIntensity <= 9;
  }
  getPatternSoundName(patternOption) {
    return "51_pattern" + this.voicePatternNum + "_" + this._patternStrength + "_" + patternOption;
  }
  get patternOptions0() {
    return [1];
  }
  get patternOptions1() {
    return [1, 2, 3];
  }
  get patternOptions2() {
    return [1, 2];
  }

  getPatternOption() {
    $gameSystem.setBgsLine(10 + $gameVariables.value(20));
    let patternOptions = this.patternOptions0;
    this._patternStrength = this.patternStrength;
    
    if (this.patternVariant === 1) {
      patternOptions = this.patternOptions1;
    }
    if (this.pistonIntensity === 2) {
      this._patternStrength += 1;
      if (this.patternVariant === 1) {
        patternOptions = this.patternOptions2;
      }
    }
    return patternOptions[getRandomIndex(patternOptions.length)];
  }
  
  playPatternBGS() {
    if (!this.isValidToPlayPatternBgs) {
      return;
    }

    const patternName = this.getPatternSoundName(this.getPatternOption());
    const patternVolume = getRandomIndex(this.patternVolumeRandomIndexMax) + this.patternVolumeOffset;
    const patternPitch = getRandomIndex(this.patternPitchRandomIndexMax) + this.patternPitchOffset;
    AudioManager.playBgs({ "name": patternName, "volume": patternVolume, "pitch": patternPitch, "pan": 0 });
  }

  // Abstract method that must be implemented by subclasses
  play() {
    this.updateBgsLineSetting();
    this.playBgs(this.soundName, this.volumeOffset, this.pitchOffset, this.volumeRandomIndexMax, this.pitchRandomIndexMax);

    if (this.playSecond) {
      this.updateBgsLineSetting();
      this.playBgs(this.soundName2(), this.volumeOffset2(), this.pitchOffset2(), this.volumeRandomIndexMax2(), this.pitchRandomIndexMax2());
    }

    // Modified selection placeholder code:
    this.playPatternBGS();
  }
}

class FluidSoundEffect extends SexActionSoundEffectBase {
  // this params are using as default for base class
  constructor(pistonIntensity, patternVariant, voicePatternNum) {
    super(pistonIntensity, patternVariant, voicePatternNum);
  }
}

class Piston1SoundEffect extends SexActionSoundEffectBase {
  constructor(pistonIntensity, patternVariant, voicePatternNum) {
    super(pistonIntensity, patternVariant, voicePatternNum);
  }

  get soundName() {
    return "21_Piston1";
  }
  get volumeRandomIndexMax() {
    return 21;
  }
  get volumeOffset() {
    return 90;
  }
  get pitchRandomIndexMax() {
    return 31;
  }
  get pitchOffset() {
    return 90;
  }
  get playSecond() {
    return false;
  }
  get patternStrength() {
    return 5;
  }
  get patternOptions2() {
    return [1, 2, 3];
  }
  get patternVolumeOffset() {
    return 100;
  }
}
class Piston2SoundEffect extends Piston1SoundEffect {
  constructor(pistonIntensity, patternVariant, voicePatternNum) {
    super(pistonIntensity, patternVariant, voicePatternNum);
  }
  get pitchOffset() {
    return 120;
  }
  get playSecond() {
    return false;
  }
  get patternVolumeOffset() {
    return 70;
  }
  get patternPitchOffset() {
    return 110;
  }
}

class KissSoundEffect extends SexActionSoundEffectBase {
  constructor(pistonIntensity, patternVariant, voicePatternNum) {
    super(pistonIntensity, patternVariant, voicePatternNum);
  }

  _patternStrength = 1;
  get patternStrength() {
    return 1;
  }

  get patternOptions2() {
    return [1, 2, 3, 4, 5, 6];
  }

  get patternPitchRandomIndexMax() {
    return 31;
  }

  get patternPitchOffset() {
    return 90;
  }
}

class FellatioSoundEffect extends SexActionSoundEffectBase {
  constructor(pistonIntensity, patternVariant, voicePatternNum) {
    super(pistonIntensity, patternVariant, voicePatternNum);
  }

  get patternStrength() {
    return 3;
  }

  get patternOptions1() {
    return [1, 2, 3, 4, 5, 6, 7, 8];
  }

  get patternOptions2() {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }

  get isValidToPlayPatternBgs() {
    return this.voicePatternNum >= 1;
  }

  get patternPitchOffset() {
    return 90;
  }
}

class BustKneadSoundEffect extends SexActionSoundEffectBase {
  constructor(pistonIntensity, patternVariant, voicePatternNum) {
    super(pistonIntensity, patternVariant, voicePatternNum);
  }

  get soundName() {
    return "21_BustKnead";
  }
  get volumeRandomIndexMax() {
    return 11;
  }
  get volumeOffset() {
    return 10;
  }

  get playSecond() {
    return false;
  }
}

class HandyMassager2SoundEffect extends SexActionSoundEffectBase {
  constructor(pistonIntensity, patternVariant, voicePatternNum) {
    super(pistonIntensity, patternVariant, voicePatternNum);
  }

  get soundName() {
    return "21_HandyMassager2";
  }
  get volumeRandomIndexMax() {
    return 21;
  }
  get volumeOffset() {
    return 50;
  }
  get pitchRandomIndexMax() {
    return 21;
  }

  get playSecond() {
    return false;
  }
}

class VibratorSoundEffect extends SexActionSoundEffectBase {
  constructor(pistonIntensity, patternVariant, voicePatternNum) {
    super(pistonIntensity, patternVariant, voicePatternNum);
  }

  get soundName() {
    return "21_HandyMassager2";
  }
  get volumeRandomIndexMax() {
    return 21;
  }
  get volumeOffset() {
    return 60;
  }
  get pitchRandomIndexMax() {
    return 31;
  }
  get pitchOffset() {
    return 100;
  }

  get playSecond() {
    return false;
  }
}

function actionType1SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  // (actionType 1) ピストン弱
  const piston1SoundEffect = new Piston1SoundEffect(pistonIntensity, patternVariant, voicePatternNum);
  piston1SoundEffect.play();  
}

function actionType2SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  // (actionType 2) ピストン強
  const piston2SoundEffect = new Piston2SoundEffect(pistonIntensity, patternVariant, voicePatternNum);
  piston2SoundEffect.play();
}

// Function for action type 3: 愛液 (Liquid/Erotic fluid effect)
// This function plays background sounds according to the given parameters and applies a secondary sound layer
function actionType3SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  // (actionType 3) 愛液
  const fluidSoundEffect = new FluidSoundEffect(pistonIntensity, patternVariant, voicePatternNum);
  fluidSoundEffect.play();
}

// Function for action type 4: キス (Kiss effect)
// This function plays background sounds for a kissing effect including primary and secondary sound layers,
// and then, if applicable, plays a patterned sound based on the input parameters.
function actionType4SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  const kissSoundEffect = new KissSoundEffect(pistonIntensity, patternVariant, voicePatternNum);
  kissSoundEffect.play();
}

function actionType5SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  // (actionType 5) フェラ
  const fellatioSoundEffect = new FellatioSoundEffect(pistonIntensity, patternVariant, voicePatternNum);
  fellatioSoundEffect.play();
}

function actionType6SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  // (actionType 6) 揉み
  const bustKneadSoundEffect = new BustKneadSoundEffect(pistonIntensity, patternVariant, voicePatternNum);
  bustKneadSoundEffect.play();
}

function actionType7SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  // (actionType 7) 機械振動
  const handyMassager2SoundEffect = new HandyMassager2SoundEffect(pistonIntensity, patternVariant, voicePatternNum);
  handyMassager2SoundEffect.play();
}

function actionType8SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  // (actionType 8) 機械振動激しく
  const vibratorSoundEffect = new VibratorSoundEffect(pistonIntensity, patternVariant, voicePatternNum);
  vibratorSoundEffect.play();
}
class InsertionSoundEffect {

  // Options used for sound effects
  get seOptions() { 
    return ['Z_zamen1', 'Z_zamen2'] 
  };

  get maxRandomIndexSexWait() {
    return 21;
  }

  get noWaitSePitch() {
    return getRandomIndex(41) + 80;
  }


  // Helper function to play a random sound effect
  playRandomSE(seName, seVolume, sePitch, seOptions) {
    seOptions = seOptions || this.seOptions;
    seName = seName || seOptions[getRandomIndex(seOptions.length)];
    seVolume = seVolume || getRandomIndex(21) + 100;
    sePitch = sePitch || getRandomIndex(41) + 80;
    AudioManager.playSe({ name: seName, volume: seVolume, pitch: sePitch, pan: 0 });
  };

  prePlay() {
    adv_partDirectPlay(7);
  };

  play() {
    this.prePlay();

    const flashDuration = getRandomIndex(41) + 160;
    const shakeIntensity = getRandomIndex(21) + 50;

    if (valueSexWait >= 1) {
      $gameScreen.startFlash([255, 119, 255, flashDuration], shakeIntensity);
      this.playRandomSE();
      this.playRandomSE();

      valueSexWait = 0;
    } else {
      // When no wait is set, play flash, shake and one SE, then update wait.
      const shakeDuration = getRandomIndex(5) + 6;
      $gameScreen.startFlash([255, 119, 255, flashDuration], shakeIntensity);
      $gameScreen.startShake(shakeDuration, shakeDuration, shakeIntensity);
      this.playRandomSE(null, null, this.noWaitSePitch, null);

      valueSexWait = getRandomIndex(this.maxRandomIndexSexWait) + 20;
    }
  }
}

class NoEjaculationSoundEffect extends InsertionSoundEffect {
  get maxRandomIndexSexWait() {
    return 11;
  }

  prePlay() {
    AudioManager.stopAllBgs();
    adv_partDirectSet(0);
    sex_direction(0); // 結束：集中線終了
  }
}

class EjaculationSoundEffect extends NoEjaculationSoundEffect {
  get seOptions() { 
    return ['Z_zamen'];
  }

  get noWaitSePitch() {
    return getRandomIndex(51) + 100;
  }
}

function actionType11SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  // (actionType 11) 挿入
  const insertionSE = new InsertionSoundEffect(pistonIntensity, patternVariant, voicePatternNum);
  insertionSE.play();
}

function actionType12SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  // (actionType 12) 射精
  const ejaculationSE = new EjaculationSoundEffect(pistonIntensity, patternVariant, voicePatternNum);
  ejaculationSE.play();
}

function actionType13SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  // (actionType 13) 射精以外で終了.
  const noEjaculationSE = new NoEjaculationSoundEffect(pistonIntensity, patternVariant, voicePatternNum);
  noEjaculationSE.prePlay();
}

function actionType51SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  // (actionType 51) 写真撮影
  const whiteOutPictureName = 'ScreenWhiteOut';
  $gameScreen.showPicture(pistonIntensity, whiteOutPictureName, 1, 640, 384, 100, 100, 250, 0);
  $gameScreen.movePicture(pistonIntensity, 1, 640, 384, 100, 100, 0, 0, 20);
  const photographSound = 'ZH_Photograph';
  AudioManager.playSe({ "name": photographSound, "volume": 100, "pitch": 100, "pan": 0 });
  valueSexWait = 30;
}

// Refactored helper function for both 眼パチ閉 and 眼パチ開く
function actionTypeEyesSexDirection(pistonIntensity, patternVariant, voicePatternNum, fadeType) {
  // fadeType: use "fadeIn" for 眼パチ閉, "fadeOut" for 眼パチ開く
  const blackOutPictureName = 'ScreenBlackOut';
  $gameScreen.showPicture(pistonIntensity, blackOutPictureName, 1, 640, 384, 100, 100, 255, 0);
  const sceneCloseOpenEyes = 'SceneCloseOpenEyes';
  picture_fade1(pistonIntensity, fadeType, sceneCloseOpenEyes, patternVariant, 5);
  valueSexWait = patternVariant;
}

// (actionType 52) 眼パチ閉
function actionType52SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  actionTypeEyesSexDirection(pistonIntensity, patternVariant, voicePatternNum, "fadeIn");
}

// (actionType 53) 眼パチ開く
function actionType53SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  actionTypeEyesSexDirection(pistonIntensity, patternVariant, voicePatternNum, "fadeOut");
}

function actionType54SexDirection(pistonIntensity, patternVariant, voicePatternNum) {
  // (actionType 54) 薄くピンク点灯
  $gameScreen.setPicturesAnimation(2, patternVariant / 2, "横", patternVariant);
  const pinkFlashPictureName = 'ScreenPinkFlash';
  $gameScreen.showPicture(111, pinkFlashPictureName, 1, 640, 384, 100, 100, pistonIntensity, 3);
  $gameScreen.picture(111).startAnimationFrame(1, true, [1, 1, 1, 2]);
}

//ADVＨパート演出クリアも。0実行1終了
adv_HpartDirectPlay = function (effectType) {
  switch (effectType) {
    case 0: {
      adv_HpartDirectPlay_Clear();
      break;
    }
    case 1: { // 感じる
      adv_HpartDirectPlay_Feel();
      break;
    }
    case 2: { // 激しく感じる
      adv_HpartDirectPlay_StrongFeel();
      break;
    }
    case 3: { // 絶頂激しく感じる永続クリア必須
      adv_HpartDirectPlay_ExtremeClimax();
      break;
    }
    case 4: { // 軽く感じる
      adv_HpartDirectPlay_LightFeel();
      break;
    }
    case 5: { // 乳見せ
      adv_HpartDirectPlay_ShowBreasts();
      break;
    }
    default: {
      // Do nothing for unknown effect types
      break;
    }
  }
};

function adv_HpartDirectPlay_Clear() {
  // Case 0: Clear particles
  const particleNamesToClear = ['Ecstasy_c1', 'lines_heightH1'];
  for (let index = 0; index < particleNamesToClear.length; index++) {
    $gameScreen._particle.particleClear(particleNamesToClear[index]);
  }
}

// Base class for ADV H part direct play effects
class AdvHPartDirectPlayEffect {
  constructor(options = {}) {
    this.particleName = 'Ecstasy_c1';
    // options: alpha (string), scaleUpdate (array of two strings), soundPitchOffset (number), filterDuration (number)
    this.alpha = options.alpha || '0.4';
    this.scaleUpdate = options.scaleUpdate; // e.g. ['10','40'] – if not given, no scale update is made.
    this.soundPitchOffset = options.soundPitchOffset || 60;
    this.filterDuration = options.filterDuration || 40;
  }

  get heartbeatSoundOptions(){
    return ['Z_HeartBeatDarty'];
  }
  
  final() {
    filter_direct(9, 640 - 128, 368, this.filterDuration);
  }
  
  play() {
    // Play the particle effect
    $gameScreen._particle.particlePlay(0, this.particleName, 'screen', 'def', 'spriteset');
    $gameScreen._particle.particleUpdate([this.particleName, 'alpha', this.alpha, '0']);
    if (this.scaleUpdate !== undefined) {
      $gameScreen._particle.particleUpdate([this.particleName, 'scale', this.scaleUpdate[0], this.scaleUpdate[1]]);
    }
    const heartbeatSoundOptions = this.heartbeatSoundOptions;
    const selectedHeartbeatSound = heartbeatSoundOptions[getRandomIndex(heartbeatSoundOptions.length)];
    const soundVolume = getRandomIndex(21) + 100;
    const soundPitch = getRandomIndex(41) + this.soundPitchOffset;
    AudioManager.playSe({ name: selectedHeartbeatSound, volume: soundVolume, pitch: soundPitch, pan: 0 });
    this.final();
  }
}

/*:
 * Function: adv_HpartDirectPlay_Feel
 * @description Case 1: 感じる
 */
class AdvHPartDirectPlay_FeelEffect extends AdvHPartDirectPlayEffect {
  constructor() {
    super({
      alpha: '0.4',         // set alpha to 0.4
      // No scale update needed for "感じる"
      soundPitchOffset: 60,   // sound pitch offset for Feel is 60
      filterDuration: 40      // filter duration set to 40
    });
  }
}

/*:
 * Function: adv_HpartDirectPlay_StrongFeel
 * @description Case 2: 激しく感じる
 */
class AdvHPartDirectPlay_StrongFeelEffect extends AdvHPartDirectPlayEffect {
  constructor() {
    super({
      alpha: '0.4',         // set alpha to 0.4
      scaleUpdate: ['10', '40'],  // update scale from 10 to 40
      soundPitchOffset: 40,   // sound pitch offset for Strong Feel is 40
      filterDuration: 60      // filter duration set to 60
    });
  }
}

/*:
 * Function: adv_HpartDirectPlay_LightFeel
 * @description Case 4: 軽く感じる
 */
class AdvHPartDirectPlay_LightFeelEffect extends AdvHPartDirectPlayEffect {
  constructor() {
    super({
      alpha: '0.3',         // lighter effect: set alpha to 0.3
      // No scale update needed for "軽く感じる"
      soundPitchOffset: 80,   // sound pitch offset for Light Feel is 80
      filterDuration: 30      // filter duration set to 30
    });
  }
}

/*:
 * Function: adv_HpartDirectPlay_ShowBreasts
 * @description Case 4: 乳見せ
 */
class Adv_HpartDirectPlay_ShowBreastsEffect extends AdvHPartDirectPlayEffect {
  constructor() {
    super({
      alpha: '0.2',         // lighter effect: set alpha to 0.3
      // No scale update needed for "軽く感じる"
      soundPitchOffset: 80,   // sound pitch offset for Light Feel is 80
      filterDuration: 0      // filter duration set to 0 , not using here
    });
  }

  get heartbeatSoundOptions() {
    return ['ZH_Knead1', 'ZH_Knead1', 'ZH_Knead1'];
  }

  final() {
    $gameScreen.startFlash([255, 119, 255, 200], 60); // override standart final action with own specific
  }
}

// Modified functions using the refactored base class and extended instances

function adv_HpartDirectPlay_Feel() {
  // Case 1: 感じる
  new AdvHPartDirectPlay_FeelEffect().play();
}

function adv_HpartDirectPlay_StrongFeel() {
  // Case 2: 激しく感じる
  new AdvHPartDirectPlay_StrongFeelEffect().play();
}

function adv_HpartDirectPlay_LightFeel() {
  // Case 4: 軽く感じる
  new AdvHPartDirectPlay_LightFeelEffect().play();
}

function adv_HpartDirectPlay_ShowBreasts() {
  // Case 5: 乳見せ
  new Adv_HpartDirectPlay_ShowBreastsEffect().play();
}

function adv_HpartDirectPlay_ExtremeClimax() {
  // Case 3: 絶頂激しく感じる永続クリア必須
  if (valueWordSet0 == '絶頂') {
    filter_direct(1, 640, 384, 0.03);
    valueWordSet0 = 0;
    adv_HpartDirectPlay_Clear();
    adv_partDirectSet(0);
    $gameScreen.eraseParallax(7);
    $gameScreen.erasePicture(51);
    $gameScreen.erasePicture(57);
  } else {
    valueWordSet0 = '絶頂';
    const pistonPictureId = 57;
    let pistonMultiplier;
    if ($gameActors.actor($gameVariables.value(20)) && $gameActors.actor($gameVariables.value(20)).isLearnedSkill(66)) {
      pistonMultiplier = 2;
    } else {
      pistonMultiplier = 1;
    }
    hcg_piston(pistonPictureId, 5, 1, 1);
    filter_direct(1, 640, 384, 0.01);
    adv_partDirectSet(2);
    const particleName = 'Ecstasy_c1';
    $gameScreen._particle.particlePlay(0, particleName, 'screen', 'def', 'spritset');
    $gameScreen._particle.particleUpdate([particleName, 'scale', '10', '20']);
    $gameScreen._particle.particleUpdate([particleName, 'alpha', '0.30', '0']);
  }
}

//☆☆性欲スキルで確立上昇最大50%
const skillRangeSeiyokuSkillProbabilityUp = [61, 62, 63, 64, 65, 66, 67, 68, 69, 70];
seiyoku_skillProbabilityUp = function () {
  const actorId = $gameVariables.value(20);
  if (actorId === 0) {
    $gameVariables.setValue(21, 1);
    return; // Early return if no valid actor
  }

  const gameActor = $gameActors.actor(actorId);

  seiyoku_skillProbabilityUp1(gameActor);
}
seiyoku_skillProbabilityUp1 = function (gameActor) {
  if (!gameActor) {
    valueCountSet3 = 0;
    return; // Protect against non-existent actor
  }

  // Define skill range
  
  // Calculate probability increase with a standard loop
  let totalProbabilityIncrease = 0;
  for (const skillId of skillRangeSeiyokuSkillProbabilityUp) {
    if (gameActor.isLearnedSkill(skillId)) {
      totalProbabilityIncrease += 5;
    }
  }
  
  // Store the result
  valueCountSet3 = totalProbabilityIncrease;
};

//☆☆エネミーステートでドロップ
//enemy_drop = function(user,enemy){



//};

//}());
