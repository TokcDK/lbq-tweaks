/*:
* @plugindesc このゲーム専用プラグイン
* @author 作者名
* @help ゲーム専用に作成された初期読み込み用プラグイン
*/

//(function(){

//開発度ランク(1-6)を色付きラベルにする。6以上は全てS。
const MASTERY_RANK_LABELS = [`\\C[4][E]\\C[0]`, `\\C[12][D]\\C[0]`, `\\C[5][C]\\C[0]`, `\\C[13][B]\\C[0]`, `\\C[27][A]\\C[0]`, `\\C[30][S]\\C[0]`];
masteryRankLabel = function (masteryLevel) {
  return MASTERY_RANK_LABELS[Math.max(0, Math.min(masteryLevel, 6) - 1)];
};

//性欲表示用の文章を1行追加し、ページ行数に達したら次のvalueWordSetへ送る。
appendHStateMessage = function (messageText, linesPerPage, pageHeaderText) {
  window['valueWordSet' + valueCountSet2] += messageText;
  valueCountSet1 += 1;
  if ((valueCountSet1 % linesPerPage) != 0) return;
  valueCountSet2 += 1;
  window['valueWordSet' + valueCountSet2] = pageHeaderText || `\\C[10]H-Passive[${valueCountSet2}]\\C[0]\n`;
};

//メタ値"a,b"のindex番目を数値で返す。index省略時は全体を数値化。
metaNumberAt = function (meta, key, index, fallback) {
  const raw = meta[key];
  if (!raw) return fallback;
  if (index === undefined) return Number(raw);
  return Number(raw.split(',')[index]);
};

//中だし判定用のコイン投げ（1が出れば中だし）
const COIN_FLIP_VALUES = [1, 0, 1, 0, 1, 1];

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
  for (let actorId = 1; actorId <= 20; actorId++) {
    const actor = $gameActors.actor(actorId);
    if (!isGirl(actor)) continue;
    const hRecords = $gameVariables.value(actorId + 380);
    if (hRecords[61] >= 10) {
      hRecords[62] += 1;//1日Ｈ回数１０回以上
    };
    if (hRecords[1] >= 499) {
      hRecords[64] = hRecords[61] == 0 ? hRecords[64] + 1 : 0;
    };
    hRecords[61] = 0;//H回数リセット
  };

};

h_BattleEcstasyDirect = function () {

  adv_HpartDirectPlay(3);
  const actorId = $gameVariables.value(20);
  const actorData = $dataActors[actorId];
  if (!actorData || !actorData.meta['SexualZettyouLow']) return;
  const actor = $gameActors.actor(actorId);
  const ecstasyLevelTag = 'Low'; const ecstasyRank = 1;
  //if(actor.isLearnedSkill(62)){var ecstasyLevelTag = 'Middle';var ecstasyRank = 2};
  //if(actor.isLearnedSkill(65)){var ecstasyLevelTag = 'Hi';var ecstasyRank = 3};
  const ecstasyCandidateValues = actorData.meta['SexualZettyou' + ecstasyLevelTag].split(',');
  const ecstasyValue = ecstasyCandidateValues[getRandomIndex(ecstasyCandidateValues.length)];
  $gameVariables.setValue(21, `\\nw[${actor.name()}]${ecstasyValue}`);
  const ecstasyPictureName = 'Zev_BattleEcstasy' + actorId + '_' + ecstasyRank;
  pic_1(0, 57, ecstasyPictureName, 0, 100, 255, 60, 1280, 768, 0, 0);
  const ecstasyPictureId = 51;
  const ecstasyPictureBaseName = 'ScreenBattleEcstasySell5';
  picture_anime1(ecstasyPictureId, ecstasyPictureBaseName, 5, 1, "横", 10, 1, true, [1, 2]);
  $gameScreen.movePicture(ecstasyPictureId, 1, 640, 384, 100, 100, 150, 0, 30);

};

//相手とＨ済みの場合に表示するためのスクリプト
h_keikenhyouji1 = function (resultVarId, partnerWeaponId) {

  const partnerWeapon = $dataWeapons[partnerWeaponId];
  const partnerActor = $gameActors.actor(21);
  if (!partnerWeapon || !partnerActor) return;
  const partnerNameOverride = $gameVariables.value(353)[partnerWeaponId - 300];
  if (partnerNameOverride != 0) {
    partnerActor.setName(`\x1bnnp[${partnerWeaponId}]`);
  } else {
    partnerActor.setName(partnerWeapon.name);
  };
  valueScenePartnerId = partnerWeaponId;
  const partnerHRecords = $gameVariables.value($gameVariables.value(20) + 360);
  if (!(partnerHRecords[partnerWeaponId - 100] >= 1)) {
    $gameVariables.setValue(resultVarId, 0);
    return;
  };
  h_partnerFullName(22, partnerWeaponId);
  const partnerDescription = partnerWeapon.description;
  let partnerInfoText = partnerDescription == 0 ? `\n` : `${partnerDescription}\n`;
  const partnerName = $gameVariables.value(22);
  partnerInfoText += `\n${partnerName}との\\C[27]Ｈ回数：${partnerHRecords[partnerWeaponId - 100]}\\C[0]`
  if (partnerHRecords[partnerWeaponId + 100] >= 1) {
    partnerInfoText += `　${partnerName}との子${partnerHRecords[partnerWeaponId + 100]}人`
  };
  if (partnerHRecords[partnerWeaponId] >= 1) {
    partnerInfoText += `　${partnerName}の子を宿しているかも知れない…。`
  };
  $gameVariables.setValue(resultVarId, `【${partnerInfoText}】`);

};

//相手とＨ済みの場合に表示するためのスクリプト
h_keikenhyouji2 = function (textVarId, showFlag) {

  if (textVarId != 0 && showFlag == 1 && $gameVariables.value(textVarId) != 0) {
    $gameScreen.dWindowFrame = 'ON';
    $gameScreen.setDTextPicture($gameVariables.value(textVarId), 25);
    $gameScreen.showPicture(150, "", 0, 100, 100, 100, 100, 0, 0);
    $gameScreen.movePicture(150, 0, 10, 100, 100, 100, 255, 0, 30);
  };
  if (showFlag == 0) {
    pic_move1(150, -100, 100, 100, 100, 0, 60);
  };

};

//固有相手とのＨ経験回数リスト
h_hennreki = function () {

  for (let varId = 801; varId <= 810; varId++) { $gameVariables.setValue(varId, 0) };
  const partnerHRecords = $gameVariables.value($gameVariables.value(20) + 360);
  let listVarId = 801;
  let pageText = `一覧\n`;
  let entryCount = 0;
  for (let partnerIndex = 1; partnerIndex <= 100; partnerIndex++) {
    const hCount = partnerHRecords[partnerIndex];
    if (hCount < 1) continue;
    let entryLineText = ` `;
    entryLineText += `${$dataWeapons[partnerIndex + 300].name}：`
    entryLineText += `${hCount}回`
    if (partnerHRecords[partnerIndex + 200] >= 1) {
      entryLineText += `【${partnerHRecords[partnerIndex + 200]}人】`
    };
    entryLineText += `\n`
    pageText += entryLineText;
    entryCount += 1;
    if ((entryCount % 10) == 0) {
      $gameVariables.setValue(listVarId, pageText);
      listVarId += 1;
      pageText = `　\n`;
    };
  };
  $gameVariables.setValue(listVarId, pageText);

};

//h_partnerFullName(22,$gameVariables.value(340)); //代入変数id,相手id指定変数
h_partnerFullName = function (resultVarId, partnerWeaponId) {

  const partnerWeapon = $dataWeapons[partnerWeaponId];
  const partnerMeta = partnerWeapon.meta;
  let partnerNameText = `\\C[23]${partnerWeapon.name}\\C[0]`;
  if (partnerMeta['FamilyName']) {
    partnerNameText += `\\C[23]=${partnerMeta['FamilyName']}\\C[0]`;
  };
  if (partnerMeta['FamilyNameKanji']) {
    partnerNameText = `\\C[23]${partnerMeta['FamilyNameKanji']}\\C[0] ${partnerNameText}`;
  };
  if (partnerMeta['SubstitutionActorId']) {
    partnerNameText = `\x1bSET[${Number(partnerMeta['SubstitutionActorId'])}]`;
  };
  $gameVariables.setValue(resultVarId, partnerNameText);

};

//Ｈ経験値更新
h_exp = function (actorId, pictureName, partnerWeaponId, hideFlag, simpleFlag, pastSceneFlag) {

  $gameVariables.setValue(339, 0);
  $gameVariables.setValue(20, actorId);
  $gameVariables.setValue(193, pictureName);
  $gameVariables.value(actorId + 380)[46] = pictureName;
  $gameSwitches.setValue(121, hideFlag);//非表示
  $gameSwitches.setValue(122, simpleFlag);//性欲性感のみ簡易主にアイテム使用時
  $gameSwitches.setValue(123, pastSceneFlag);//過去シーンならオン
  $gameVariables.setValue(340, partnerWeaponId);//301汎用
  $gameVariables.setValue(94, $gameActors.actor(actorId).name());
  const partnerWeapon = $dataWeapons[partnerWeaponId];
  $gameVariables.setValue(22, partnerWeapon.name);
  if (partnerWeapon.meta['NumberOfPeople']) {
    $gameVariables.setValue(339, Number(partnerWeapon.meta['NumberOfPeople']));
  };

};

//性経験値加算式
h_exp1 = function (vaginalCount, partnerCount, fellatioCount, analCount, masturbationCount, orgasmCount) {

  $gameVariables.setValue(406, vaginalCount);
  $gameVariables.setValue(409, partnerCount);
  $gameVariables.setValue(408, fellatioCount);
  $gameVariables.setValue(407, analCount);
  $gameVariables.setValue(413, masturbationCount);
  $gameVariables.setValue(414, orgasmCount);

};

h_exp1ex = function (id) {

  const ecstasySlotCandidates = [6, 6, 6, 6, 7, 8, 8];
  for (let i = 1; i <= id; i++) {
    const randomArrIndex = ecstasySlotCandidates[getRandomIndex(ecstasySlotCandidates.length)];
    $gameVariables.setValue(400 + randomArrIndex, $gameVariables.value(400 + randomArrIndex) + 1);
  };

};

h_exp2 = function (consensualCount, rapeCount, interspeciesCount, gangRapeCount, orgyCount, exposureCount) {

  $gameVariables.setValue(417, consensualCount);
  $gameVariables.setValue(418, rapeCount);
  $gameVariables.setValue(420, interspeciesCount);
  $gameVariables.setValue(419, gangRapeCount);
  $gameVariables.setValue(430, orgyCount);
  $gameVariables.setValue(410, exposureCount);

};

h_exp3 = function (harassmentCount, breastKneadCount, buttKneadCount, incontinenceCount, squirtingCount, prostitutionCount, pregnancyCount, childCount, vaginalEjaculationCount, analEjaculationCount, oralDrinkCount) {

  $gameVariables.setValue(421, harassmentCount);
  $gameVariables.setValue(422, breastKneadCount);
  $gameVariables.setValue(423, buttKneadCount);
  $gameVariables.setValue(424, incontinenceCount);
  $gameVariables.setValue(425, squirtingCount);
  $gameVariables.setValue(426, prostitutionCount);
  $gameVariables.setValue(415, pregnancyCount);
  $gameVariables.setValue(428, childCount);
  $gameVariables.setValue(411, vaginalEjaculationCount);
  $gameVariables.setValue(412, analEjaculationCount);
  $gameVariables.setValue(416, oralDrinkCount);

};

h_exp4 = function (vaginalDevelopment, analDevelopment, oralDevelopment, sensualityDevelopment, exposureDevelopment, semenExp, sexualPlayExp, serviceExp, prostitutionEarnings) {

  $gameVariables.setValue(431, vaginalDevelopment);
  $gameVariables.setValue(432, analDevelopment);
  $gameVariables.setValue(433, oralDevelopment);
  $gameVariables.setValue(434, sensualityDevelopment);
  $gameVariables.setValue(435, exposureDevelopment);
  $gameVariables.setValue(436, semenExp);
  $gameVariables.setValue(437, sexualPlayExp);
  $gameVariables.setValue(438, serviceExp);
  $gameVariables.setValue(427, prostitutionEarnings);

};

//☆☆アクター変数20の開発度表示2
actor_Hstateshyouji2 = function () {

  const actorId = $gameVariables.value(20);
  const actor = $gameActors.actor(actorId);
  const exposureSkillId = 50;//性欲発展度
  const developmentRate = $gameVariables.value(actorId + 380)[1];
  let statusText = `\\fs[25]性欲発展度`;

  const noneStatus = `皆無`;
  if (!actor.isLearnedSkill(exposureSkillId)) {
    statusText += `:\\C[1]${noneStatus}\\C[0]\n`;
  } else {
    //発展度は100ごとに1ランク、901以上はSSS
    const rankLabels = [`\\C[4][圏外]\\C[0]`, `\\C[12][${noneStatus}]\\C[0]`, `\\C[4][E]\\C[0]`, `\\C[12][D]\\C[0]`, `\\C[5][C]\\C[0]`, `\\C[13][B]\\C[0]`, `\\C[27][A]\\C[0]`, `\\C[30][S]\\C[0]`, `\\C[30][SS]\\C[0]`, `\\C[31][SSS]\\C[0]`];
    let hRank = 0;
    for (let rank = 1; rank <= 9; rank++) {
      if (developmentRate >= rank * 100 + 1) hRank = rank;
    };
    statusText += rankLabels[hRank];
    if (hRank >= 1) {
      statusText += `:\\C[27]<${$dataSkills[hRank + 60].name}>\\C[0]\n`;
    } else {
      statusText += `\n`;
    };
  };
  for (let skillId = 51; skillId <= 59; skillId++) {
    statusText += `${$dataSkills[skillId].name}`;
    if (!actor.isLearnedSkill(skillId)) {
      statusText += `:\\C[1]未開発\\C[0]\n`;
      continue;
    };
    statusText += masteryRankLabel(actor.skillMasteryLevel(skillId));
    for (const suppressionSkillId of valueHstaSuppression) {
      if (!actor.isLearnedSkill(suppressionSkillId)) continue;
      const suppressionMeta = $dataSkills[suppressionSkillId].meta;
      if (actor.isLearnedSkill(Number(suppressionMeta['Hide if Learned Skill']))) continue;
      const suppressionTarget = Number(suppressionMeta['HstaSuppression'].split(',')[0]);
      const suppressionParam = Number(suppressionMeta['HstaSuppression'].split(',')[1]);
      if (suppressionTarget == 0) {
        for (let target = 431; target <= 439; target++) {
          if (target - 380 == suppressionSkillId && actor.skillMasteryLevel(skillId) == suppressionParam) {
            statusText += `[ランク制限]`;
          };
        };
      } else if (suppressionTarget - 380 == suppressionSkillId && actor.skillMasteryLevel(skillId) == suppressionParam) {
        statusText += `[ランク制限]`;
      };
    };
    statusText += `(${actor.skillMasteryUses(skillId)}/${actor.skillMasteryUsageMax(skillId)}):`;
    statusText += `${$dataSkills[skillId].meta['RankSetWord' + actor.skillMasteryLevel(skillId)]}\n`;
  };
  WindowManager.show(1, 0, 200, 768, 386);
  WindowManager.drawText(1, statusText);

};

//☆☆アクター変数20のＨステータス表示1
actor_Hstateshyouji1 = function () {

  const isCompactDisplay = !$gameSwitches.value(496) && !$gameSwitches.value(130) && $gameVariables.value(193) == 0;
  const windowYOffset = isCompactDisplay ? 128 : 0;
  if (isCompactDisplay) { $gameVariables.setValue(313, 128); };
  WindowManager.show(1, windowYOffset, 200, 379, 390);
  WindowManager.show(2, 379 + windowYOffset, 200, 389, 390);
  const actorId = $gameVariables.value(20);
  const actor = $gameActors.actor(actorId);
  const hStateValues = $gameVariables.value(actorId + 380);
  const masteryVarOffset = 400;
  //性欲度表示用情報を書き込み
  for (let i = 1; i <= 40; i++) {
    const statValue = $gameVariables.value(masteryVarOffset + i);
    window['valueWordSet' + i] = statValue >= 1 ? `\\C[2]+${statValue}\\C[0]` : '　';
  };

  const cnt = '回';

  let displayText = `\\fs[24]`;
  for (const i of [6, 7, 8, 9, 10, 11, 12, 16, 13, 14, 15]) {
    displayText += `\\C[27]${$dataSystem.variables[masteryVarOffset + i]}\\C[0]${hStateValues[i]}${cnt}${window['valueWordSet' + i]}\n`;
  };
  WindowManager.drawText(1, displayText);

  let stateDisplayText = `\\fs[24]`;
  for (const i of [17, 18, 19, 30, 20, 21, 22, 23, 24, 25, 26, 28]) {
    stateDisplayText += `\\C[27]${$dataSystem.variables[masteryVarOffset + i]}\\C[0]${hStateValues[i]}${cnt}${window['valueWordSet' + i]}\n`;
  };
  WindowManager.drawText(2, stateDisplayText);

  if (!$gameSwitches.value(130)) {
    const masteryTextBySlot = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];//開発度ランク0では未開発表示
    for (let skillId = 51; skillId <= 59; skillId++) {
      if (actor.skillMasteryLevel(skillId) >= 1 && actor.isLearnedSkill(skillId)) {
        const rankLabel = masteryRankLabel(actor.skillMasteryLevel(skillId));
        masteryTextBySlot[skillId - 50] = `\x1bI[${$dataSkills[skillId].iconIndex}]${rankLabel}:${actor.skillMasteryUses(skillId)}${window['valueWordSet' + (skillId - 20)]}`;
      } else {
        const text = colorTaggedText(1, `未開発`);
        masteryTextBySlot[skillId - 50] = `${text}\\I[0] `;
      };
    };
    const masteryWindowY = isCompactDisplay ? 430 + 128 : 430;
    WindowManager.show(3, masteryWindowY, 0, 338, 202);
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
    window['valueWordSet' + i] = statDisplay;
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
    actorInfoText += `\\C[27]${$dataSystem.variables[baseIndex + 1]}\\C[0]${actorStateValues[1]}${firstStateDisplay}${window['valueWordSet' + 1]}`;
    actorInfoText += `\\C[27]${$dataSystem.variables[baseIndex + 2]}\\C[0]${actorStateValues[2]}${window['valueWordSet' + 2]}\n`;
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
  const exposureLimitVarId = 405; // 400 + 5
  //露出開発度(スキル55)のランク別上限値
  const exposureLimitByRank = [100, 90, 70, 50, 30, 10, 0];
  const exposureLimit = exposureLimitByRank[Math.min(gameActor.skillMasteryLevel(55), 6)];
  $gameVariables.setValue(exposureLimitVarId, exposureLimit);
  $gameVariables.value(gameActor.actorId() + 380)[5] = exposureLimit;
  $gameVariables.setValue(exposureLimitVarId, 0);

  seiyoku_jougenn1(gameActor);

};

//☆☆現在露出度計上
//露出度計算の対象になる衣装スイッチ変数の範囲(ClothSwitch + 460)
const CLOTH_SWITCH_VAR_ID_MIN = 461;
const CLOTH_SWITCH_VAR_ID_MAX = 500;
rosyutu_genzai = function () {
  const actorId = $gameVariables.value(20);
  rosyutu_genzai1(actorId);
}
rosyutu_genzai1 = function (actorId) {

  $gameVariables.setValue(404, 0);
  const actorEicSwitchId1 = actorId + 180;
  const actorEicSwitchId2 = actorId + 380;
  const itemsLen = $dataItems.length;
  let exposureTotal = 0;
  for (let i = 1201; i < itemsLen; i++) {
    const itemMeta = $dataItems[i].meta;
    if (itemMeta['TotalCloth']) continue;
    //着用者(EICSwitch)が本人か共通(200)の物だけ対象
    const eicSwitchId = Number(itemMeta['EICSwitch']);
    if (eicSwitchId !== actorEicSwitchId1 && eicSwitchId !== actorEicSwitchId2 && eicSwitchId !== 200) continue;
    const clothSwitchVarId = Number(itemMeta['ClothSwitch']) + 460;
    if (clothSwitchVarId < CLOTH_SWITCH_VAR_ID_MIN || clothSwitchVarId > CLOTH_SWITCH_VAR_ID_MAX) continue;
    if ($gameVariables.value(clothSwitchVarId) !== Number(itemMeta['ClothAllocationNumber'])) continue;
    exposureTotal += Number(itemMeta['ClothUncoverCount']);
  }
  $gameVariables.setValue(404, exposureTotal);
  $gameVariables.value(actorId + 380)[4] = exposureTotal;
  $gameVariables.setValue(404, 0);
};

//受精するかどうかの計算
jusei_keisan = function () {

  const fertilizationBase = 11;
  const actorId = $gameVariables.value(20);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;
  if (actor.isStateAffected(83) || !actor.isLearnedSkill(65)) return;
  if (!($gameVariables.value(400 + fertilizationBase) >= 1)) return;
  const fertilizationRate = $gameVariables.value(actorId + 380)[3];
  if (!(fertilizationRate >= 1)) return;
  const battleSkills = actor.battleSkillsRaw();
  const fertilizationRoll = getRandomIndex(101);
  if (!(fertilizationRate >= fertilizationRoll) && !battleSkills.includes(873) && !actor.isStateAffected(75)) return;
  if (battleSkills.includes(874) || actor.isStateAffected(76)) {
    const skillName = colorTaggedText(27, $dataSkills[874].name);//変更: ${}がテンプレート外にあり構文エラーになっていた
    CommonPopupManager.showInfo({}, `${actor.name()}は${skillName}の効果により受精を退けた。`, null);
    return;
  };
  actor.addState(79);
  const partnerWeaponId = $gameVariables.value(340);
  if (partnerWeaponId >= 1) {
    const pregnancyPartnerSlot = partnerWeaponId - 200;//101-200の間
    $gameVariables.value(actorId + 360)[pregnancyPartnerSlot] += 1;
  };

};

//受精してるキャラ以外の受精相手記録を消滅
jusei_clear = function () {

  const heroineIds = $gameVariables.value(247);
  if (!heroineIds) return;
  for (const actorId of heroineIds) {
    $gameVariables.setValue(20, actorId);
    const actor = $gameActors.actor(actorId);
    if (!actor) continue;
    actor.removeState(79);//受精前段階ステート消滅
    if (actor.isStateAffected(82)) continue;
    const partnerHRecords = $gameVariables.value(actorId + 360);
    for (let i = 101; i <= 200; i++) {
      if (partnerHRecords[i] >= 1) {
        partnerHRecords[i] = 0;
      };
    };
  };

};

//☆☆Ｈステのうち、身長等
const CUP_SIZE_LABELS = [`AAAAA`, `AAAA`, `AAA`, `AA`, `A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`];
hstates_heights = function (id, resultVarId) {

  const gameActor = $gameActors.actor(id);
  if (!gameActor || !isGirl(gameActor)) {
    const actorData = $dataActors[id];
    if (actorData && actorData.meta['BodyStyle']) {
      $gameVariables.setValue(resultVarId, `\\C[21][${actorData.meta['BodyStyle']}]\\C[0]`);
    } else {
      $gameVariables.setValue(resultVarId, `NoData`);
    };
    return;
  };
  const actorData = $dataActors[id];
  if (!actorData || !actorData.meta['HeightEtc']) return;
  const reproductionRate = gameActor.elementRate(37);
  const reproductionLabel = reproductionRate >= 1.1 ? `\\fs[25]Reproduction:${Math.round(reproductionRate)}%` : ``;
  const heightCm = Number(actorData.meta['HeightEtc'].split(',')[0]);//身長
  let weightKg = Number(actorData.meta['HeightEtc'].split(',')[1]);//体重
  let bustCm = Number(actorData.meta['HeightEtc'].split(',')[2]);//バスト
  let waistCm = Number(actorData.meta['HeightEtc'].split(',')[3]);//ウェスト
  let hipCm = Number(actorData.meta['HeightEtc'].split(',')[4]);//ヒップ
  let physiqueChangeCount = 0;//体型変化による影響数値
  //スキルによる増加valuePhysiquUp
  const physiqueSkills = gameActor.battleSkillsRaw();
  for (const physiqueSkillId of valuePhysiquUp) {
    const physiqueMeta = $dataSkills[physiqueSkillId].meta;
    if (physiqueMeta['BodyWeightChange'] && physiqueSkills.includes(physiqueSkillId)) {
      weightKg += Number(physiqueMeta['BodyWeightChange']);
      physiqueChangeCount += 1;
    };
    if (physiqueMeta['BustSizeChange'] && physiqueSkills.includes(physiqueSkillId)) {
      bustCm += Number(physiqueMeta['BustSizeChange']);
      physiqueChangeCount += 1;
    };
    if (physiqueMeta['WaistSizeChange'] && physiqueSkills.includes(physiqueSkillId)) {
      waistCm += Number(physiqueMeta['WaistSizeChange']);
      physiqueChangeCount += 1;
    };
    if (physiqueMeta['HipSizeChange'] && physiqueSkills.includes(physiqueSkillId)) {
      hipCm += Number(physiqueMeta['HipSizeChange']);
      physiqueChangeCount += 1;
    };
  };
  //妊娠時の増加
  const hStateValues = $gameVariables.value(id + 380);
  weightKg += hStateValues[42];
  bustCm += hStateValues[43];
  waistCm += hStateValues[44];
  hipCm += hStateValues[45];
  const cupSizeValue = (bustCm - (heightCm * 0.435 - (heightCm * 0.38 - waistCm))) + 2;//カップサイズ測定。最後に+2を独自挿入
  //カップ測定。2.5刻みでA～T、60以上は測定不能。
  const cupIndex = Math.max(1, Math.floor(cupSizeValue / 2.5) + 1);
  const cupSize = cupIndex > CUP_SIZE_LABELS.length ? `──` : CUP_SIZE_LABELS[cupIndex - 1];
  let bodyStyleLabel = ``;
  const physiqueUpCount = valuePhysiquUp.length;
  if (actorData.meta['BodyStyle']) {
    if (physiqueChangeCount >= physiqueUpCount * 2) {
      bodyStyleLabel += `\\C[27][${$dataItems[742].name}]\\C[0]`;
      if (id == $gameVariables.value(2)) { $gameVariables.setValue(612, physiqueUpCount * 2) };
    } else if (physiqueChangeCount >= physiqueUpCount) {
      bodyStyleLabel += `\\C[27][${$dataItems[741].name}]\\C[0]`;
      if (id == $gameVariables.value(2)) { $gameVariables.setValue(611, physiqueUpCount) };
    } else if (physiqueChangeCount >= physiqueUpCount / 2) {
      bodyStyleLabel += `\\C[21][${actorData.meta['BodyStyle']}]\\C[0]`;
    };
  };
  let virginLabel = colorTaggedText(27, '[' + `処女ヒロイン` + ']');
  if (hStateValues[6] >= 1000) {
    virginLabel = colorTaggedText(30, '[' + `中古` + ']');
  } else if (hStateValues[6] >= 100) {
    virginLabel = colorTaggedText(31, '[' + `中古ヒロイン` + ']');
  } else if (hStateValues[6] >= 1) {
    virginLabel = colorTaggedText(0, '[' + `非処女ヒロイン` + ']');
  };
  $gameVariables.setValue(resultVarId,
    `\\fs[25]\\C[16]HT:\\C[0]${heightCm}\\C[16]cm\\C[0]　\\C[16]WT:\\C[0]${weightKg}\\C[16]kg\\C[0]
\\C[16]Cup:\\C[0][${cupSize}] \\C[16]B:\\C[0]${bustCm} \\C[16]W:\\C[0]${waistCm} \\C[16]H:\\C[0]${hipCm}
${bodyStyleLabel}
${virginLabel}
${reproductionLabel}`);
  hStateValues[51] = heightCm;
  hStateValues[52] = weightKg;
  hStateValues[53] = bustCm;
  hStateValues[54] = waistCm;
  hStateValues[55] = hipCm;
  hStateValues[56] = cupSize;

};

//☆☆Hスキル習得通常パターン
const H_PASSIVE_PAGE_HEADER = `\\FS[28]\\C[10]<H-Passive Expression!>\\FS[25]\\C[0]\n`;
hskill_learn = function (learnModeId) {

  const actorId = $gameVariables.value(20);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;
  for (const skillId of valueGetHskillLearn) {
    const skillMeta = $dataSkills[skillId].meta;
    const isLearned = actor.isLearnedSkill(skillId);
    const shouldLearn = learnModeId == 1 ? !isLearned : (learnModeId == 2 ? isLearned : false);
    if (!shouldLearn) {
      //リセット時のみ実行。スキル忘却
      if (skillMeta['LostHSkill'] && skillMeta['PremiseVariable1']) {
        const premiseVarId = Number(skillMeta['PremiseVariable1'].split(',')[0]);
        const premiseThreshold = Number(skillMeta['PremiseVariable1'].split(',')[1]);
        if ($gameVariables.value(premiseVarId) < premiseThreshold) {
          actor.forgetSkill(skillId);
        };
      };
      continue;
    };
    $gameVariables.setValue(641, 0);
    const partnerWeaponId = $gameVariables.value(340);
    const partnerHRecords = $gameVariables.value(actorId + 360);
    const hStateValues = $gameVariables.value(actorId + 380);
    if (partnerWeaponId >= 1) {
      $gameVariables.setValue(641, partnerHRecords[partnerWeaponId - 300]);
    };
    hStateValues[63] = partnerHRecords[6];//武器ID306の性欲薬使用回数を計上
    const premiseSkillIds = [1, 2, 3].map((n) => metaNumberAt(skillMeta, 'PremiseSkill' + n, undefined, 407));
    const premiseRankSkillIds = [1, 2, 3].map((n) => metaNumberAt(skillMeta, 'PremiseSkillRank' + n, 0, 407));
    const premiseRankThresholds = [1, 2, 3].map((n) => metaNumberAt(skillMeta, 'PremiseSkillRank' + n, 1, 0));
    const premiseVarIds = [1, 2, 3].map((n) => metaNumberAt(skillMeta, 'PremiseVariable' + n, 0, 2));
    const premiseVarThresholds = [1, 2, 3].map((n) => metaNumberAt(skillMeta, 'PremiseVariable' + n, 1, 0));
    const premiseArrangementIndexes = [1, 2, 3].map((n) => metaNumberAt(skillMeta, 'PremiseArrangement' + n, 0, 0));
    const premiseArrangementThresholds = [1, 2, 3].map((n) => metaNumberAt(skillMeta, 'PremiseArrangement' + n, 1, 0));
    let mainCharaId = skillMeta['MainCharaPremise'] ? $gameVariables.value(2) : 0;
    if (skillMeta['SkillLearningClass']) { mainCharaId = 100 };//あったらここでは習得させない
    if (mainCharaId != 0 && mainCharaId != actorId) continue;
    const meetsPremise =
      actor.isLearnedSkill(premiseSkillIds[0]) &&
      actor.isLearnedSkill(premiseSkillIds[1]) &&
      actor.isLearnedSkill(premiseSkillIds[2]) &&
      actor.skillMasteryLevel(premiseRankSkillIds[0]) >= premiseRankThresholds[0] &&
      actor.skillMasteryLevel(premiseRankSkillIds[1]) >= premiseRankThresholds[1] &&
      actor.skillMasteryLevel(premiseRankSkillIds[2]) >= premiseRankThresholds[2] &&
      $gameVariables.value(premiseVarIds[0]) >= premiseVarThresholds[0] &&
      $gameVariables.value(premiseVarIds[1]) >= premiseVarThresholds[1] &&
      $gameVariables.value(premiseVarIds[2]) >= premiseVarThresholds[2] &&
      hStateValues[premiseArrangementIndexes[0]] >= premiseArrangementThresholds[0] &&
      hStateValues[premiseArrangementIndexes[1]] >= premiseArrangementThresholds[1] &&
      hStateValues[premiseArrangementIndexes[2]] >= premiseArrangementThresholds[2];
    if (!meetsPremise) {
      //リセット時のみ実行。スキル忘却
      if (learnModeId == 2) {
        actor.forgetSkill(skillId);
        CommonPopupManager.showInfo({}, `──${$dataSkills[skillId].name}忘却…──`, null);
      };
      continue;
    };
    actor.learnSkill(skillId);
    appendHStateMessage(`──\\C[2]H-Passive\\C[0]\\C[27]\x1bSIN[${skillId}]\\C[0]Expression…──\n${$dataSkills[skillId].description}\\C[0]\n`, 6, H_PASSIVE_PAGE_HEADER);
  };
  if (valueHskillLearnArr.length > 0 && learnModeId == 1) {
    for (const learnedSkillId of valueHskillLearnArr) {
      appendHStateMessage(`──\\C[2]H-Passive\\C[0]\\C[27]\x1bSIN[${learnedSkillId}]\\C[0]RankUp!──\n${$dataSkills[learnedSkillId].description}\\C[0]\n`, 6, H_PASSIVE_PAGE_HEADER);
    };
  };
  if (learnModeId == 1) {
    hskill_learn2();
  };

};

//☆☆Hスキル習得やアイテム入手特殊パターン
hskill_learn2 = function () {

  const actor = $gameActors.actor($gameVariables.value(20));
  if (!actor) return;
  const exposureSkillId = 55;//露出開発度
  const exposureRank = actor.skillMasteryLevel(exposureSkillId);
  //指定ランク到達で衣装アイテムを1個だけ取得する
  const grantClothItem = (itemId, rankThreshold) => {
    const clothItem = $dataItems[itemId];
    if (!clothItem || exposureRank < rankThreshold || $gameParty.hasItem(clothItem)) return;
    $gameParty.gainItem(clothItem, 1);
    const exposureSkill = colorTaggedText(2, $dataSkills[exposureSkillId].name);
    const itemName = colorTaggedText(27, `\x1bIIN[${itemId}]`);
    appendHStateMessage(`──${exposureSkill}が${rankThreshold}到達！　${itemName}Get!──` + `\n${clothItem.description}\\C[0]\n`, 6, H_PASSIVE_PAGE_HEADER);
  };
  grantClothItem(zenravalueId, 1);//全裸
  grantClothItem(clothPartsChoice, 2);//パーツ指定
  //同カテゴリのClothType衣装を1着だけ取得（ランク3: ClothBreakage / ランク4: 改）
  const grantClothByType = (clothType, rankThreshold) => {
    if (exposureRank < rankThreshold) return;
    for (let i = 1; i <= $dataItems.length - 1; i++) {
      const ownedMeta = $dataItems[i].meta;
      if (!ownedMeta['subCategory'] || !ownedMeta['ClothType'] || !ownedMeta['TotalCloth']) continue;
      if (!$gameParty.hasItem($dataItems[i])) continue;
      for (let j = 1; j <= $dataItems.length - 1; j++) {
        const candidateMeta = $dataItems[j].meta;
        if (!candidateMeta['subCategory'] || !candidateMeta['ClothType']) continue;
        if (ownedMeta['subCategory'] != candidateMeta['subCategory']) continue;
        if (candidateMeta['ClothType'] != clothType) continue;
        if ($gameParty.hasItem($dataItems[j])) break;
        clothes_get($gameVariables.value(20), candidateMeta['subCategory'], candidateMeta['ClothType']);
        const exposureSkill = colorTaggedText(2, `${$dataSkills[exposureSkillId].name}:Rank${rankThreshold}`);
        const itemName = colorTaggedText(27, `\x1bIIN[${j}]`);
        appendHStateMessage(`──${exposureSkill}の効果により、${itemName}Get!──` + `\n`, 6, H_PASSIVE_PAGE_HEADER);
        break;
      };
    };
  };
  grantClothByType('ClothBreakage', 3);
  grantClothByType('改', 4);
  if (!$gameSwitches.value(604) && exposureRank >= 5) {
    $gameSwitches.setValue(604, true);
    const exposureSkill = colorTaggedText(2, $dataSkills[exposureSkillId].name);
    const menuName = colorTaggedText(27, `着せ替え`);
    appendHStateMessage(`──${exposureSkill}が5到達！　メニュー画面に${menuName}出現──` + `\n\n`, 6, H_PASSIVE_PAGE_HEADER);
  };
  const allDevelopmentSkillId = 875;//９種組み合わせ
  if (actor.isLearnedSkill(allDevelopmentSkillId)) return;
  for (let rankSkillId = 51; rankSkillId <= 59; rankSkillId++) {
    if (actor.skillMasteryLevel(rankSkillId) < 6) return;
  };
  actor.learnSkill(allDevelopmentSkillId);
  const devPoints = colorTaggedText(2, `全開発度(経験値)`)
  appendHStateMessage(`──${devPoints}\\C[10]Max\\C[0]！　\\C[27]\x1bSIN[${allDevelopmentSkillId}]\\C[0]Expression!──\n${$dataSkills[allDevelopmentSkillId].description}\\C[0]\n`, 6, H_PASSIVE_PAGE_HEADER);

};

//☆☆Ｈパッシブ未収得分の条件提示
actor_HpassiveConditions = function (a, b, itemId) {

  if ($gameSwitches.value(115)) {
    $gameSwitches.setValue(115, false)
    WindowManager.hide(1);
    return;
  };
  const actor = $gameActors.actor(b.actorId());
  if (!isGirl(actor)) {
    TickerManager.show(`${actor.name()}は対象キャラではありません…。`);
    return;
  };
  $gameSwitches.setValue(115, true)
  const h_passive = colorTaggedText(27, '<' + `H-Passive` + '>');
  let unlearnedText = `${actor.name()}の未収得${h_passive}` + `\n`
  let unlearnedCount = 0;
  for (let skillId = 1; skillId <= $dataSkills.length - 1; skillId++) {
    const skillMeta = $dataSkills[skillId].meta;
    if (!skillMeta['HSkillLearn'] || actor.isLearnedSkill(skillId)) continue;
    unlearnedText += `\\C[27]${$dataSkills[skillId].name}\\C[0]\n`;
    unlearnedText += `${skillMeta['ADDescription']}\n`;
    unlearnedCount += 1;
  };
  if (unlearnedCount < 1) {
    WindowManager.show(1, 0, 100, 1024, 180);
    WindowManager.drawText(1, `\\C[27]\\fs[28]H-Passive Complete!\\C[0]`);
    return;
  };
  WindowManager.show(1, 0, 0, 1280, unlearnedCount * 60);
  WindowManager.drawText(1, `\\fs[28]${unlearnedText}`);

};

//☆スキルアイテムステート性経験値補正
hStates_up1 = function (id) {

  let databaseEntries, metaList;
  switch (id) {
    case 1:
      databaseEntries = $dataSkills; metaList = valueHStatesUp1;
      break;
    case 2:
      databaseEntries = $dataItems; metaList = valueHStatesUp2;
      break;
    case 3:
      databaseEntries = $dataStates; metaList = valueHStatesUp3;
      break;
    default:
      return;
  };
  const actor = $gameActors.actor($gameVariables.value(20));
  if (!actor) return;
  const battleSkills = actor.battleSkillsRaw();
  for (const entryId of metaList) {
    const entryMeta = databaseEntries[entryId].meta;
    if (entryMeta['HexpReflectionSkill'] && battleSkills.includes(entryId)) {
      const activateSwitchId = entryMeta['HexpActivateSwi'] ? Number(entryMeta['HexpActivateSwi']) : 2;
      if ($gameSwitches.value(activateSwitchId)) {
        const reflectionSkillId = entryMeta['HexpReflectionSkill'] ? Number(entryMeta['HexpReflectionSkill']) : 0;
        const activateVarId = entryMeta['HexpActivateVal'] ? Number(entryMeta['HexpActivateVal']) : 0;
        const reflectionVarId = entryMeta['HexpReflectionVal'] ? Number(entryMeta['HexpReflectionVal']) : 0;
        const reflectionSkillRank = entryMeta['HexpReflectionSkillRank'] ? Number(entryMeta['HexpReflectionSkillRank']) : 0;
        if (activateVarId >= 1 && $gameVariables.value(activateVarId) >= 1) {
          const reflectionGain = $gameVariables.value(activateVarId) * actor.skillMasteryLevel(reflectionSkillId) * reflectionSkillRank;
          $gameVariables.setValue(reflectionVarId, $gameVariables.value(reflectionVarId) + reflectionGain);
      const activation = `発動`;
          appendHStateMessage(`\\C[27]<${databaseEntries[entryId].name}>\\C[0]${activation}\\C[31](+${reflectionGain})\\C[0]\\I[12]\n`, 3);
        };
      };
    };
    if (entryMeta['ProstitutionMoneyUp'] && battleSkills.includes(entryId)) {
      if ($gameVariables.value(427) >= 1) {
        const prostitutionMoneyRate = Number(entryMeta['ProstitutionMoneyUp']);
        $gameVariables.setValue(427, $gameVariables.value(427) * prostitutionMoneyRate);
    const activation = `発動`;
        appendHStateMessage(`\\C[27]<${databaseEntries[entryId].name}>\\C[0]${activation}\\C[31](×${prostitutionMoneyRate}\\G)\\C[0]\\I[12]\n`, 3);
      };
    };
  };
  if (id == 3) {
    //売春額一時記憶と娼婦ジョブ経験値取得
    valueProstitutionMoney = $gameVariables.value(427);
    if (valueProstitutionMoney >= 1 && actor.subclass() && actor._subclassId == 41) {
      actor.gainExpSubclass(Math.ceil(valueProstitutionMoney / 10));
      appendHStateMessage(`ジョブ:\\C[27][\x1bJ[41]]\\C[0]に\\C[31]${Math.ceil(valueProstitutionMoney / 10)}\\C[0]expを取得\\I[12]\n`, 3);
    };
    //奴隷ジョブの時に奴隷ジョブ経験値取得
    if (actor.subclass() && actor._subclassId == 42) {
      let reflectionSkillId = 0;
      for (let i = 401; i <= 440; i++) {
        if ($gameVariables.value(i) >= 1) {
          reflectionSkillId += $gameVariables.value(i);
        };
      };
      actor.gainExpSubclass(Math.ceil(reflectionSkillId));
      appendHStateMessage(`ジョブ:\\C[27][\x1bJ[42]]\\C[0]に\\C[31]${Math.ceil(reflectionSkillId)}\\C[0]expを取得\\I[12]\n`, 3);
    };
  };

};

//☆☆性欲度上限比較
seiyoku_genkai = function () {

  seiyoku_jougenn();
  const actorId = $gameVariables.value(20);
  const hStateValues = $gameVariables.value(actorId + 380);
  if ($gameVariables.value(401) + hStateValues[1] >= hStateValues[0] && hStateValues[0] >= 1) {
    if ($gameSwitches.value(475)) {
      TickerManager.show(`性欲度上限のため、性欲度上昇が抑制された。`);
    } else {
      $gameVariables.setValue(506, $gameVariables.value(506) + `\n性欲度上限のため、性欲度上昇が抑制された。`);
    };
    hStateValues[1] = hStateValues[0];
    $gameVariables.setValue(401, 0);
  };
  if ($gameVariables.value(402) >= 100) {
    hStateValues[2] = 100;
    $gameVariables.setValue(402, 0);
  };

};

//☆☆性欲度以外のランク制限を実施
hstates_rankSeigen = function () {

  const actorId = $gameVariables.value(20);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;
  const hStateValues = $gameVariables.value(actorId + 380);
  let suppressionResult = `　`;
  for (const suppressionSkillId of valueHstaSuppression) {
    const suppressionMeta = $dataSkills[suppressionSkillId].meta;
    if (!actor.isLearnedSkill(suppressionSkillId)) continue;
    if (actor.isLearnedSkill(Number(suppressionMeta['Hide if Learned Skill']))) continue;
    const suppressionParams = suppressionMeta['HstaSuppression'].split(',');
    const suppressionTarget = Number(suppressionParams[0]);
    const suppressionParam = Number(suppressionParams[1]);
  const skillName = `\n${$dataSkills[suppressionSkillId].name}`;
    const suppressionNote = `${skillName}の影響により`;
    //対象0は開発度431-439をまとめて判定
    const targetVarIds = suppressionTarget == 0
      ? [431, 432, 433, 434, 435, 436, 437, 438, 439]
      : [suppressionTarget];
    let limitCount = 0;
    for (const targetVarId of targetVarIds) {
      if (!($gameVariables.value(targetVarId) >= 1)) continue;
      if (actor.skillMasteryLevel(targetVarId - 380) != suppressionParam) continue;
      const usageTotal = $gameVariables.value(targetVarId) + hStateValues[targetVarId - 400];
      if (!(usageTotal >= actor.skillMasteryUsageMax(targetVarId - 380))) continue;
      $gameVariables.setValue(targetVarId, 0);
      suppressionResult += `\\C[1][${$dataSkills[targetVarId - 380].name}]\\C[0]`;
      limitCount += 1;
    };
    if (limitCount >= 1) {
      if ($gameSwitches.value(122)) {
        TickerManager.show(suppressionNote + suppressionResult + `上昇抑制`);
      } else {
        $gameVariables.setValue(506, $gameVariables.value(506) + suppressionNote + suppressionResult + `上昇抑制`);
      };
    };
  };

};

//☆☆性欲上昇簡易表示
seiyoku_kanniHyouji = function () {

  if (!$gameSwitches.value(475)) {
    valueWordSet0 = `${$gameVariables.value(506)}\n`;
  };
  const actorId = $gameVariables.value(20);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;
  const hStateValues = $gameVariables.value(actorId + 380);
  for (let statVarId = 401; statVarId <= 440; statVarId++) {
    if (statVarId == 405) continue;
    const statValue = $gameVariables.value(statVarId);
    if (statValue == 0) continue;
    let statDisplayValue;
    if (statVarId >= 401 && statVarId <= 430) {
      statDisplayValue = hStateValues[statVarId - 400];
    } else {
      if (!actor.isLearnedSkill(statVarId - 380)) continue;
      statDisplayValue = actor.skillMasteryUses(statVarId - 380);
    };
    const statName = $dataSystem.variables[statVarId].replace("　", "").replace("　", "").replace("　", "").replace(" ", "").replace(":", "");
    if (statValue >= 1) {
      valueWordSet0 += `${actor.name()}: ${statName}\\C[2]+${statValue}！\\C[0](${statDisplayValue + statValue})\n`;
    } else {
      valueWordSet0 += `${actor.name()}: ${statName}\\C[1]${statValue}！\\C[0](${statDisplayValue + statValue})\n`;
    };
    if ($gameSwitches.value(475)) {
      TickerManager.show(valueWordSet0);
    };
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
  const hStateValues = $gameVariables.value(actorId + 380);
  if (hStateValues[initialExperienceIndex] == 0 && $gameVariables.value(400 + initialExperienceIndex) >= 1) {
    hStateValues[recordPartnerIndex] = $gameVariables.value(22);
  };

  //相手が魔物場合に魔物姦回数+1.事前に数字が入っている場合は無視。
  if ($gameVariables.value(420) == 0) {
    const partnerWeapon = $dataWeapons[$gameVariables.value(340)];
    if (partnerWeapon.meta['monster']) {
      $gameVariables.setValue(420, 1);
    };
  };

  //人数が指定されている場合、339に数が格納されているので経験人数に反映
  //同一人物の場合に経験人数上昇を抑制
  const partnerHRecords = $gameVariables.value(actorId + 360);
  const partyMemberIndex = $gameVariables.value(340) - 300;
  if (partnerHRecords[partyMemberIndex] == 0) {
    $gameVariables.setValue(409, $gameVariables.value(409) + $gameVariables.value(339));
  };

  //各相手とのＨ回数を記録。
  if ($gameVariables.value(406) >= 1 || $gameVariables.value(407) >= 1 || $gameVariables.value(408) >= 1) {
    partnerHRecords[partyMemberIndex] += 1;
  };

  //中だし判定。コイン投げで決め、スキル/ステートで上書きする。
  const actorBattleSkills = actor.battleSkillsRaw();
  const rollInternalCount = (hCount) => {
    let internalCount = 0;
    for (let i = 1; i <= hCount; i++) {
      if (COIN_FLIP_VALUES[getRandomIndex(COIN_FLIP_VALUES.length)] == 1) {
        internalCount += 1;
      };
    };
    if (actorBattleSkills.includes(871) || actor.isStateAffected(73)) {
      internalCount = hCount;
    };
    if (actorBattleSkills.includes(872) || actor.isStateAffected(74)) {
      internalCount = 0;
    };
    return internalCount;
  };
  //膣姦の時に中だしか否か。膣射回数に数字を入れている場合はその数字をそのまま採用。
  const vaginalHCount = $gameVariables.value(406);
  if (vaginalHCount >= 1 && $gameVariables.value(411) == 0) {
    const computedInternal = rollInternalCount(vaginalHCount);
    if (computedInternal >= 1) {
      $gameVariables.setValue(411, $gameVariables.value(411) + computedInternal);
    };
  };
  //尻姦の時に中だしか否か
  const analHCount = $gameVariables.value(407);
  if (analHCount >= 1 && $gameVariables.value(412) == 0) {
    const computedInternal = rollInternalCount(analHCount);
    if (computedInternal >= 1) {
      $gameVariables.setValue(412, $gameVariables.value(412) + computedInternal);
    };
  };
  //フェラの時に中だしか否か
  const fellationCount = $gameVariables.value(408);
  if (fellationCount >= 1 && $gameVariables.value(416) == 0) {
    const computedInternal = rollInternalCount(fellationCount);
    if (computedInternal >= 1) {
      $gameVariables.setValue(416, $gameVariables.value(416) + computedInternal);
    };
  };
  //経験人数二人以上で輪姦
  if ($gameVariables.value(409) >= 2) {
    $gameVariables.setValue(419, 1);
  };

  //受精するかどうか
  jusei_keisan();

  //回数に応じて各開発度に＋
  const developmentSourceVars = [406, 407, 408, 410, 408, 408, 411, 412, 416, 413, 421, 426, 414];
  const developmentTargetVars = [431, 432, 433, 435, 438, 437, 436, 436, 436, 434, 434, 439, 434];
  let reproductionAmplificationFlag = 0;
  const reproductionRate = actor.elementRate(37);
  for (let devIndex = 0; devIndex < developmentSourceVars.length; devIndex++) {
    const sourceValue = $gameVariables.value(developmentSourceVars[devIndex]);
    if (sourceValue < 1) continue;
    let baseDevelopmentValue = sourceValue;
    if (reproductionRate >= 1.1) {
      baseDevelopmentValue = sourceValue + Math.round(reproductionRate);
      reproductionAmplificationFlag = 1;
    };
    $gameVariables.setValue(developmentTargetVars[devIndex], $gameVariables.value(developmentTargetVars[devIndex]) + baseDevelopmentValue);
  };
  if (reproductionAmplificationFlag == 1) {
  const reproduction = colorTaggedText(27, '<' + `Reproduction` + '>');
  const bonusPts = colorTaggedText(27, `+${Math.round(reproductionRate)}`);
    appendHStateMessage(`${reproduction}補正。各開発度/経験度加算値に${bonusPts}` + '\n', 3);
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
      //変更: 旧来は未使用の乱数(getRandomIndex)を1回消費していた。加算値は
      //      膣穴(406)+アナル(407)+フェラ(408)回数で、上のコメントの仕様どおり。
      const aggregateHCount = $gameVariables.value(406) + $gameVariables.value(407) + $gameVariables.value(408);
      $gameVariables.setValue(414, $gameVariables.value(414) + aggregateHCount);
    };
  };
  //性感開発度に応じて絶頂時に潮吹きと失禁回数+
  if (actor.skillMasteryLevel(54) >= 3 && $gameVariables.value(414) >= 1) {
    const climaxSkillLevel = actor.skillMasteryLevel(54);
    let randomClimaxModifier = getRandomIndex(101) + (climaxSkillLevel * 10);
    if (randomClimaxModifier >= 80) {
      $gameVariables.setValue(425, $gameVariables.value(425) + 1);
    };
    randomClimaxModifier = getRandomIndex(101) + (climaxSkillLevel * 10);
    if (randomClimaxModifier >= 110) {
      $gameVariables.setValue(424, $gameVariables.value(424) + 1);
    };
  };

};

//☆☆性欲度情報を更新
seiyoku_hanei = function () {

  const actorId = $gameVariables.value(20);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;
  const hStateValues = $gameVariables.value(actorId + 380);
  for (let i = 1; i <= 30; i++) {
    hStateValues[i] += $gameVariables.value(i + 400);
    if (hStateValues[i] < 0) {
      hStateValues[i] = 0;
    };
  };
  if ([406, 407, 417, 418, 419, 420].some((id) => $gameVariables.value(id) >= 1)) {
    hStateValues[61] += 1;
  };
  //売春時のゴールド獲得処理
  if ($gameVariables.value(427) >= 1) {
    $gameParty.gainGold(Math.ceil($gameVariables.value(427)));
  };
  const battleSkills = actor.battleSkillsRaw();
  //強姦時に当日強姦回数に+。戦闘中に放心付与
  if ($gameVariables.value(418) >= 1) {
    hStateValues[71] += 1;
    if ($gameParty.inBattle() && !battleSkills.includes(846)) {
      actor.addState(64);
    };
  };
  if (!battleSkills.includes(867)) {
    if (!$gameParty.inBattle() && $gameVariables.value(414) >= 1) {//絶頂で発情鎮静。戦闘中はコモン113で行う
      let calmValue = 0;
      //スキル61-69の習得状況に応じて鎮静値が上がる
      const calmRandomMaxBySkill = [1, 2, 3, 4, 5, 6, 6, 6, 6];
      for (let skillIndex = 0; skillIndex < calmRandomMaxBySkill.length; skillIndex++) {
        if (actor.isLearnedSkill(61 + skillIndex)) { calmValue += getRandomIndex(calmRandomMaxBySkill[skillIndex]) };
      };
      hStateValues[2] = calmValue;
    };
  };
  if (hStateValues[2] >= 51) {
    if (!actor.isStateAffected(61)) {
    const estrus = colorTaggedText(27, `発情`)
      const calmMessage = `${actor.name()}は${estrus}している…。`;
      if ($gameSwitches.value(154)) {
        $gameVariables.setValue(539, `${calmMessage}\n`);
        $gameVariables.setValue(540, $gameVariables.value(540) + 1);
      } else {
        TickerManager.show(calmMessage);
      };
    };
    actor.addState(61);
  } else {
    if (actor.isStateAffected(61)) {
    const estrus = colorTaggedText(27, `発情`)
      const calmMessage = `${actor.name()}の${estrus}が静まった…。`;
      if ($gameSwitches.value(154)) {
        $gameVariables.setValue(539, `${calmMessage}\n`);
        $gameVariables.setValue(540, $gameVariables.value(540) + 1);
      } else {
        TickerManager.show(calmMessage);
      };
    };
    actor.removeState(61);
  };

  valueHskillLearnArr = [];
  for (let skillId = 51; skillId <= 59; skillId++) {
    const masteryLevelBefore = actor.skillMasteryLevel(skillId);
    actor.gainSkillMasteryUses(skillId, $gameVariables.value(skillId + 380));
    const masteryLevelAfter = actor.skillMasteryLevel(skillId);
    if (masteryLevelBefore != masteryLevelAfter && masteryLevelBefore >= 1) {
      valueHskillLearnArr.push(skillId);
    };
  };
  for (let i = 1; i <= 30; i++) {
    $gameVariables.setValue(400 + i, hStateValues[i]);
  };

};

//☆☆スキルアイテム使用による性欲数値更新a,b,this.item().id,1
seiyoku_itemHanei = function (unusedArg1, targetItem, itemOrSkillId, isSkill) {

  const databaseEntries = isSkill == 1 ? $dataSkills : $dataItems;
  const targetActorId = targetItem.actorId();
  $gameVariables.setValue(20, targetActorId);
  const actor = $gameActors.actor(targetActorId);
  if (!actor) return;
  const targetActorData = $dataActors[targetActorId];
  if (!targetActorData || !targetActorData.meta['Heroine']) {
    $gameParty.gainItem(databaseEntries[itemOrSkillId], +1);
    TickerManager.show(`${actor.name()}には使用する事が出来ない…。`);
    return;
  };
  //使用アイテム名表示。アイテム使用時はパッシブ反映しない。
  const itemMeta = databaseEntries[itemOrSkillId].meta;
  let libidoUseLimitSkill = itemMeta['性欲度使用制限'] ? Number(itemMeta['性欲度使用制限']) : 18;
  if (!isGirl(actor)) {
    libidoUseLimitSkill = 61;
  };
  if (!actor.isLearnedSkill(libidoUseLimitSkill)) {
    $gameParty.gainItem(databaseEntries[itemOrSkillId], +1);
    TickerManager.show(`条件を満たしていない為、${actor.name()}には使用する事が出来ない…。`);
    $gameSwitches.setValue(475, false);
    return;
  };
  for (let i = 401; i <= 440; i++) { $gameVariables.setValue(i, 0) };
  h_exp(targetActorId, '0_1_0', 306, false, true, false);
  const itemMessage = itemMeta['HitemJudgement'].split(',');
  $gameVariables.setValue(Number(itemMessage[0]), Number(itemMessage[1]));
  $gameSwitches.setValue(475, true);
  valueWordSet0 = ``;
  seiyoku_genkai();
  seiyoku_kanniHyouji();
  seiyoku_hanei();
  $gameVariables.setValue(339, 0);
  $gameVariables.setValue(340, 0);
  for (let i = 401; i <= 440; i++) { $gameVariables.setValue(i, 0) };
  $gameVariables.setValue(506, ' ');
  $gameSwitches.setValue(130, false);
  if (databaseEntries == $dataItems) {
    TickerManager.show(`${databaseEntries[itemOrSkillId].name}：${$gameParty.numItems(databaseEntries[itemOrSkillId])}個`);
  };
  $gameSwitches.setValue(475, false);

};

//☆☆当日受精率設定
jusei_todayrate = function () {

  const fertilizationSkillId = 65;//スケベっこで解放
  const heroineIds = $gameVariables.value(247);
  if (!heroineIds) return;
  for (const actorId of heroineIds) {
    const actor = $gameActors.actor(actorId);
    if (!actor) continue;
    const hStateValues = $gameVariables.value(actorId + 380);
    if (!actor.isLearnedSkill(fertilizationSkillId)) {
      hStateValues[3] = 0;
      continue;
    };
    hStateValues[3] = getRandomIndex(11);
    if (actor.battleSkillsRaw().includes(870)) {
      hStateValues[3] += getRandomIndex(51);
    };
  };

};

//☆☆キャラの各種遍歴代入actor_Hhennreki(3);valueWordSet
actor_Hhennreki = function (unusedArg1) {

  const pageHeaderText = `付与されているHステート\n`;
  for (let i = 1; i <= 10; i++) { window['valueWordSet' + i] = pageHeaderText };
  let wordSetIndex = 1;
  const actor = $gameActors.actor($gameVariables.value(20));
  if (!actor) return;
  for (const stateId of valueHstateDisplay) {
    if (!actor.isStateAffected(stateId)) continue;
    let stateDescText = `${$dataStates[stateId].description}`;
    const stateCounter = actor.getStateCounter(stateId);
    if (stateCounter != undefined) {
    const progress =  '進行度';
      stateDescText += `\\C[27]${progress}:${stateCounter}\\C[0]`;
    };
    stateDescText += `\n`;
    window['valueWordSet' + wordSetIndex] += stateDescText;
    valueCountSet1 += 1;
    if (valueCountSet1 % 8 == 0) { wordSetIndex += 1 };
  };
};

//☆☆キャラの各種遍歴代入前実行2actor_Hhennreki2Before(4,5,6);
//選択肢番号は、実際の配列番号+1にしている。
const HISTORY_HEADERS = {
  4: `\\I[526]\\C[27]男性遍歴　　　　　　\\C[0]　　 　　　　　　　　　　　　　　　`,
  5: `\\I[428]\\C[27]出産履歴　　　　　　\\C[0]　　 　　　　　　　　　　　　　　　`,
  6: `\\I[556]\\C[27]シーン履歴（直近100件）\\C[0]　　　　　　　　　　　　　　　　`,
};
actor_Hhennreki2Before = function (displayTypeId) {

  const actorId = $gameVariables.value(20);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;
  const hStateValues = $gameVariables.value(actorId + 380);
  $gameSystem.addCustomChoice(1, { text: `\\FS[25]${HISTORY_HEADERS[displayTypeId]}`, value: 0 });
  if (displayTypeId == 4 && hStateValues[41] != 0) {//41は名前を入れている
    const firstPartnerLabel = actor.isLearnedSkill(67) ? `\\C[27]初体験の相手:\\C[0]` : `\\C[30]処女を奪った相手:\\C[0]`;
    $gameSystem.addCustomChoice(1, { text: `\\FS[25]${firstPartnerLabel}${hStateValues[41]}`, value: 1 });
  };
  if (displayTypeId == 5 && hStateValues[49] >= 1) {//49はidを入れている
    const firstChildLabel = actor.isLearnedSkill(67) ? `\\C[27]初子の父親:\\C[0]` : `\\C[30]初子を産んだ男:\\C[0]`;
    $gameSystem.addCustomChoice(1, { text: `\\FS[25]${firstChildLabel}${$dataWeapons[hStateValues[49]].name}`, value: 1 });
  };

};

//☆☆キャラの各種遍歴代入2actor_Hhennreki2(4,5,6);
const HISTORY_LIST_SETTINGS = {
  4: { startIndex: 1, nameOffset: 300, reverseOffset: 100 },
  5: { startIndex: 201, nameOffset: 100, reverseOffset: -100 },
};
actor_Hhennreki2 = function (displayTypeId) {

  const listSettings = HISTORY_LIST_SETTINGS[displayTypeId];
  if (listSettings) {
    const actorId = $gameVariables.value(20);
    const actor = $gameActors.actor(actorId);
    if (!actor) return;
    const partnerHRecords = $gameVariables.value(actorId + 360);
    const knowsAll = actor.isLearnedSkill(67);
    let entryIndex = 0;
    for (let i = listSettings.startIndex; i <= listSettings.startIndex + 99; i++) {
      entryIndex += 1;
      if (!(partnerHRecords[i] >= 1)) continue;
      const partnerWeapon = $dataWeapons[i + listSettings.nameOffset];
      let entryText = `\\C[16]${partnerWeapon.name}\\C[0]:`;
      if (partnerWeapon.meta['Profession']) {
        entryText = `[${partnerWeapon.meta['Profession']}]\\C[16]${partnerWeapon.name}\\C[0]:`;
      } else if (partnerWeapon.meta['FamilyName']) {
        //変更: ${}が無く、姓が文字列として出力されていた
        entryText = `\\C[16]${partnerWeapon.name} = ${partnerWeapon.meta['FamilyName']}\\C[0]:`;
      };
      entryText += knowsAll ? `\\C[27]${partnerHRecords[i]}\\C[0]回` : `\\C[1]${partnerHRecords[i]}\\C[0]回`;
      if ($gameSwitches.value(164) && displayTypeId == 4 && partnerHRecords[i + listSettings.reverseOffset] >= 1) {
        entryText += `\\I[374]？`;
      };
      $gameSystem.addCustomChoice(1, { text: `\\FS[25]${entryText}`, value: entryIndex + 1 });
    };
    return;
  };
  if (displayTypeId != 6) return;
  const sceneHistory = $gameVariables.value(174) ? $gameVariables.value(174)[$gameVariables.value(20)] : 0;
  if (!sceneHistory || sceneHistory.length <= 0) return;
  for (let i = sceneHistory.length - 1; i >= 1; i--) {
    $gameSystem.addCustomChoice(1, { text: `\\FS[25]${sceneHistory[i]}`, value: i + 1 });
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
  const actorMeta = gameActor.actor().meta;
  let ecstasyPhrases = [];
  let combinedEcstasyArray = [];
  if ($gameSwitches.value(119)) {
    if (gameActor.isLearnedSkill(68)) {
      ecstasyPhrases = actorMeta['SexualEcstasyHi']
        ? actorMeta['SexualEcstasyHi'].split(',')
        : defaultSexualEcstasyHi;
    } else if (gameActor.isLearnedSkill(65)) {
      ecstasyPhrases = actorMeta['SexualEcstasyMiddle']
        ? actorMeta['SexualEcstasyMiddle'].split(',')
        : defaultSexualEcstasyMiddle;
    } else {
      ecstasyPhrases = actorMeta['SexualEcstasyLow']
        ? actorMeta['SexualEcstasyLow'].split(',')
        : defaultSexualEcstasyLow;
    };
  } else {
    combinedEcstasyArray = $gameVariables.value(707) || [];
  };
  if (ecstasyPhrases.length > 0) { combinedEcstasyArray = combinedEcstasyArray.concat(ecstasyPhrases); }
  const chosenPhrase = combinedEcstasyArray[getRandomIndex(combinedEcstasyArray.length)] || '';
  let availablePictureIds = $gameVariables.value(299);
  if (availablePictureIds == 0 || !availablePictureIds || availablePictureIds.length === 0) {
    availablePictureIds = [121, 122, 123, 124, 125, 126, 127, 128, 129, 130];
    $gameVariables.setValue(299, availablePictureIds);
  };
  const chosenPictureId = availablePictureIds[getRandomIndex(availablePictureIds.length)]; //ID
  const foundIndex = availablePictureIds.findIndex((idItem) => idItem === chosenPictureId);
  if (foundIndex >= 0) {
    availablePictureIds.splice(foundIndex, 1);
  }
  const xOffsetOptions = offsetMode == 1
    ? [50, 100, 150, 200, 0, -50, -100, -150, -200]
    : [100, 200, 300, 400, 0, -100, -200, -300, -400];
  const yOffsetOptions = [100, 150, 200, 0, -100, -200, -300, -350];
  const chosenXOffset = xOffsetOptions[getRandomIndex(xOffsetOptions.length)]; //x offset
  const chosenYOffset = yOffsetOptions[getRandomIndex(yOffsetOptions.length)]; //y offset
  const waitTimeOptions = waitMode == 0 ? [80, 90, 100, 110, 120] : [100, 110, 120, 130, 140, 150, 160];
  const chosenWaitTime = waitTimeOptions[getRandomIndex(waitTimeOptions.length)];
  const chosenTextWindowId = textWindowIdOptionsSceneTextBgv[getRandomIndex(textWindowIdOptionsSceneTextBgv.length)];
  $gameScreen.setDTextPicture(`${chosenPhrase}`, chosenTextWindowId);
  $gameScreen.dWindowFrame = 'ON';
  if (fontSetting != 0) { $gameScreen.setDtextFont(fontSetting); };
  $gameScreen.dTextAlign = 1;
  if (waitMode != 0) {
    const additionalXOffset = additionalXOffsetOptionsSceneTextBgv[getRandomIndex(additionalXOffsetOptionsSceneTextBgv.length)];
    $gameScreen.showPicture(chosenPictureId, "", 1, baseX + chosenXOffset + additionalXOffset, baseY + chosenYOffset, 100, 100, 255, 0);
    $gameScreen.movePicture(chosenPictureId, 1, baseX + chosenXOffset, baseY + chosenYOffset, 100, 100, 0, 0, chosenWaitTime);
    return;
  };
  $gameScreen.showPicture(chosenPictureId, "", 1, baseX + chosenXOffset, baseY + chosenYOffset, 150, 150, 255, 0);
  $gameScreen.movePicture(chosenPictureId, 1, baseX + chosenXOffset, baseY + chosenYOffset, 100, 100, 0, 0, chosenWaitTime);
};

//☆☆CGの一部分で一言台詞pic_oneWord(valueSerialPictureId,x,y,25,60,arr1);
pic_oneWord = function (pictureSlot, baseX, baseY, textMotionParam, moveDuration, textOptions, fontSetting) {

  picture_motion1(textMotionParam >= 100 ? "smooth" : "linear", [0]);
  const randomXOffset = getRandomIndex(201) - 100;
  const randomYOffset = getRandomIndex(201) - 100;
  const chosenText = textOptions[getRandomIndex(textOptions.length)];
  $gameScreen.setDTextPicture(chosenText, textMotionParam);
  $gameScreen.dWindowFrame = 'ON';
  if (fontSetting !== 0) { $gameScreen.setDtextFont(fontSetting) };
  $gameScreen.dTextAlign = 1;
  $gameScreen.showPicture(pictureSlot, "", 1, baseX + randomXOffset, baseY + randomYOffset, 50, 50, 255, 0);
  $gameScreen.movePicture(pictureSlot, 1, baseX + randomXOffset, baseY + randomYOffset, 150, 150, 0, 0, moveDuration);

};

//出産時の計算式
actor_pregnancyCalculation = function (actorId) {

  $gameVariables.setValue(20, actorId);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;
  if (!actor.isStateAffected(83)) {
    return;
  };
  //妊娠状態を解除して出産処理へ
  actor.removeState(83);
  actor.removeStateCounter(83);
  $gameVariables.setValue(94, actor.name());

  //妊娠時の一時的なサイズ増量表現を消去させる
  const hRecordsCount = $gameVariables.value(actorId + 380);
  hRecordsCount[42] = 0;
  hRecordsCount[43] = 0;
  hRecordsCount[44] = 0;
  hRecordsCount[45] = 0;

  //妊娠相手を特定する
  const partnerHRecords = $gameVariables.value(actorId + 360);
  const potentialPartners = [];
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
  for (let partnerIndex = 101; partnerIndex <= 200; partnerIndex++) {
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

  const actorId = $gameVariables.value(20);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;
  const hStateValues = $gameVariables.value(actorId + 380);
  if (resetModeId == 1) {//選択肢作成
    for (let i = 401; i <= 440; i++) {
      if (i == 405) continue;
      if (i <= 430) {
        $gameVariables.setValue(i, hStateValues[i - 400]);
        continue;
      };
      if (!actor.isLearnedSkill(i - 380)) {
        $gameVariables.setValue(i, 0);
        continue;
      };
      $gameVariables.setValue(i, actor.skillMasteryLevel(i - 380));
    };
    $gameSystem.addCustomChoice(1, { text: `一括で未経験に変更　　　　　　　　　　　　　　　　　　`, value: 0 });
    for (let i = 401; i <= 439; i++) {//431-439経験値
      if ([402, 403, 404, 405, 428, 429].includes(i)) continue;
      $gameSystem.addCustomChoice(1, { text: `${$dataSystem.variables[i]}${$gameVariables.value(i)}`, value: i });
    };
  };
  if (resetModeId != 2) return;//反映
  const selectedVarId = $gameVariables.value(19);
  let start, end;
  if (selectedVarId == 0 || (selectedVarId - 400 >= 1 && selectedVarId - 400 <= 30)) {
    start = selectedVarId == 0 ? 1 : selectedVarId - 400;
    end = selectedVarId == 0 ? 30 : selectedVarId - 400;
    for (let i = start; i <= end; i++) {
      if (!(hStateValues[i] >= 1)) continue;
      hStateValues[i] = 0;
      $gameVariables.setValue(i + 400, 0)
      const variableNameText = $dataSystem.variables[i + 400].replace("　", "").replace("　", "").replace("　", "").replace(" ", "").replace(":", "");
      CommonPopupManager.showInfo({}, `\\C[1]${variableNameText}\\C[0]がリセットされました…`, null);
      if (i == 6) {
        hStateValues[41] = 0;
        CommonPopupManager.showInfo({}, `\\C[2]初体験相手\\C[0]がリセットされました…`, null);
      };
    };
  };
  if (selectedVarId == 0 || (selectedVarId - 400 >= 31 && selectedVarId - 400 <= 40)) {
    start = selectedVarId == 0 ? 31 : selectedVarId - 400;
    end = selectedVarId == 0 ? 40 : selectedVarId - 400;
    for (let i = start; i <= end; i++) {
      if (!actor.isLearnedSkill(i + 20)) continue;
      actor.setSkillMasteryUses(i + 20, 0);
      actor.setSkillMasteryLevel(i + 20, 0);
      actor.forgetSkill(i + 20);
      CommonPopupManager.showInfo({}, `${$dataSkills[i + 20].name}忘却…`, null);
    };
  };
  hskill_learn(2);//該当するHスキル忘却

};

//☆☆拘束前のセクハラ演出
actor_battleSekughara1 = function () {

  const actorId = $gameVariables.value(20);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;
  const secuharaStateId = 81;
  actor.addState(secuharaStateId);
  if (actor._stateCounter[secuharaStateId] >= 1) {
    actor.addStateCounter(secuharaStateId, +10);
  } else {
    actor.setStateCounter(secuharaStateId, 1);
  };
  const hStateValues = $gameVariables.value(actorId + 380);
  const currentExposure = hStateValues[1];
  let exposureThreshold = Math.ceil((currentExposure + 1) / 10);//0の場合の対策で+1
  const randomRoll = getRandomIndex(101);
  exposureThreshold += actor._stateCounter[secuharaStateId];
  if (exposureThreshold >= randomRoll) {
    $gameSwitches.setValue(437, true);
  };
  const overlayPictureId = 54;
  const overlayPictureName = 'Screen_Width512Black';//右側のみＨＣＧの際に使用
  $gameScreen.showPicture(overlayPictureId, overlayPictureName, 1, 1024 - 100, 384, 100, 100, 0, 0);
  $gameScreen.movePicture(overlayPictureId, 1, 1024 - 50, 384, 100, 100, 200, 0, 60);
  valuePic1 = 60;
  const exposureValue = hStateValues[1];
  const enemyType = $gameSwitches.value(248) ? 2 : 1;//相手によって変更.1ヒト2ゴブ3巨人
  let imageDuration = 180;
  let poseVariant = 1;
  if (exposureValue >= 200) { imageDuration = 170; poseVariant = 2 };
  if (exposureValue >= 400) { imageDuration = 160; poseVariant = 3 };
  if (exposureValue >= 600) { imageDuration = 150; poseVariant = 4 };
  if (exposureValue >= 800) { imageDuration = 140; poseVariant = 5 };
  if (exposureValue >= 1000) { imageDuration = 120; poseVariant = 6 };
  const physiqueStateValues = $gameVariables.value(actorId + 440);
  for (let poseIndex = 1; poseIndex < 10; poseIndex++) {
    if (poseIndex == 2 && physiqueStateValues[18] == 0) continue;
    if (poseIndex == 6 && poseVariant <= 3) continue;
    if (poseIndex == 8 && !actor.isStateAffected(83)) continue;
    if ([1, 2, 4, 5, 6, 8].includes(poseIndex)) { poseVariant = 1 };
    if (poseIndex == 3 && poseVariant >= 5) { poseVariant = 2 };
    if (poseIndex == 5 && physiqueStateValues[32] >= 1) { poseVariant = 2 };
    let secuharaImageName;
    if (poseIndex == 9) {
      poseVariant = enemyType
      $gameScreen.setPicturesAnimation(2, imageDuration, '連番', 30);
      secuharaImageName = 'Zev_BattleSekuharaActor' + actorId + '_' + poseIndex + '_' + poseVariant + '_0';
    } else {
      secuharaImageName = 'Zev_BattleSekuharaActor' + actorId + '_' + poseIndex + '_' + poseVariant;
    };
    $gameScreen.showPicture(valuePic1 + poseIndex, secuharaImageName, 1, 640 + 400, 384 + 50, 100, 100, 0, 0);
    if (poseIndex == 9) {
      $gameScreen.picture(valuePic1 + poseIndex).startAnimationFrame(1, true, [2, 3]);
    };
    $gameScreen.movePicture(valuePic1 + poseIndex, 1, 640 + 400, 384 + 20, 100, 100, 255, 0, 40);
    if (poseIndex == 9 || poseIndex == 4) {
      hcg_piston(valuePic1 + poseIndex, 9, 2, 2);
    } else {
      tachie_bless(valuePic1 + poseIndex, 1);
    };
  };
  $gameVariables.setValue(318, actorId);//文字HBGV
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
      //変更: ゲッターを関数として呼んでいた為TypeErrorになっていた
      this.playBgs(this.soundName2, this.volumeOffset2, this.pitchOffset2, this.volumeRandomIndexMax2, this.pitchRandomIndexMax2);
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
