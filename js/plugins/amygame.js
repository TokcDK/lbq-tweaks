/*:
* @plugindesc このゲーム専用プラグイン
* @author 作者名
* @help ゲーム専用に作成された初期読み込み用プラグイン
*/

(function () {
  const GAME_VARIABLE = {
    TRUE_PROTAGONIST_ACTOR_ID: 2, // 真の主人公ＩＤ
    PORTRAIT_ACTOR_ID: 3, // 変数で立ち絵判断
    PROCESSED_ITEM_ID: 19, // アイテム処理時代入変数
    SELECTED_ACTOR_ID: 20, // アクター選択肢代入変数
    WEEKDAY: 55, // Weeks:
    ELAPSED_DAYS: 58, // Days:
    FIRST_HEROINE_ACTOR_ID: 73, // ヒロインキャラ指定変数始点
    LAST_HEROINE_ACTOR_ID: 74, // ヒロインキャラ指定変数終点
    FIRST_DEPLOYED_ACTOR_ID: 75, // 登場キャラ指定変数始点
    LAST_DEPLOYED_ACTOR_ID: 76, // 登場キャラ指定変数終点
    CHOICE_COLUMN_COUNT: 177, // 選択肢列数操作変数
    DUNGEON_WARP_POINTS: 211, // ダンジョンワープ魔方陣用２次配列
    DUNGEON_INFO_ITEM_ID: 240, // ダンジョン毎情報アイテム指定変数
    HEROINE_ACTOR_IDS: 247, // ヒロインID配列
    CHARACTER_ACTOR_IDS: 248, // キャラID配列
    ACTOR_WEAPON_PARAMETERS: 287, // 各アクター専用武器変数配列
    DYNAMIC_EVENT_IDS: 292, // イベント用動的生成ID配列
    TRAINING_DOLL_PRESET: 293, // 訓練人形事前設定配列
    PERSONAL_TITLE_ACTOR_IDS: 297, // 個人用の称号を獲得したアクターID配列
    SCENE_PREVIOUS_TIME_SWITCH_ID: 320, // イベント時朝昼夜スイッチ番号代入変数
    CONFINED_ACTOR_RECORDS: 333, // 監禁時アクター記憶配列
    ENEMY_PRESET_STATES: 345, // エネミー付与ステート事前設定配列
    BOSS_ACTIONS: 346, // ボス行動パターン配列
    BOSS_SPECIAL_ACTIONS: 347, // ボス特殊行動パターン配列
    MAP_ENEMY_SPECIAL_STATES: 350, // マップ毎のエネミー特殊ステート
    LEARNED_SKILL_ARRAYS: 351, // スキル習得配列
    NPC_PROFESSIONS: 353, // NPC役職名配列
    NPC_SURNAMES: 354, // NPC苗字配列
    OUTFIT_PRESETS: 355, // 衣装プリセット配列
    MENU_BACKGROUND_NAME: 508, // メニュー背景
    DAY_END_INFO_TEXT: 539, // 一日終了時情報表示文字列変数
    DAY_END_INFO_LINE_COUNT: 540, // 一日終了時情報表示カウント変数
    MEAL_BUFF_EFFECTS: 620, // 食事バフ配列
    SCENE_KIND: 626, // メイン/シーン/挿話
    BOSS_GUARANTEED_DROPS: 628, // ボス確定ドロップ配列自動
    SCENE_END_TIME_ADVANCE: 630, // シーン終了時時間経過指定変数
    FAITH_TOTAL: 631, // [NoReset]喜捨総額
    TEMPORARY_TEXT: 801 // 一時テキスト変数
  };
  const GAME_SWITCH = {
    MORNING: 13, // 朝
    DAYTIME: 14, // 昼
    NIGHT: 15, // 夜
    RECOLLECTION_SKIP: 29, // 回想時スキップスイッチ
    SCENE_GLOSSARY_DISABLED: 160, // シーングローサリー使用不可スイッチ
    BATTLE_MAP: 201, // 戦闘マップ
    WORLD_MAP: 209, // 全体マップ
    TEMPORARY_RESULT: 380, // 汎用一時onoff自動スイッチ
    DIRECT_ENEMY_BOSS: 426 // 特殊条件ボス戦自動onoff
  };

  // Deliberately non-strict: public event functions and documented work globals are shared with other plugins.

  function clearSelfSwitchVariableRange(mapId, eventId, lastVariableId) {
    for (let variableId = 1; variableId <= lastVariableId; variableId++) {
      $gameSelfSwitches.setVariableValue([mapId, eventId, variableId], 0);
    }
  }

  function initializeGameVariableArrays(
    gameVariables,
    firstVariableId,
    lastVariableId,
    arrayLength
  ) {
    for (
      let variableId = firstVariableId;
      variableId <= lastVariableId;
      variableId++
    ) {
      gameVariables.setValue(variableId, Array(arrayLength).fill(0));
    }
  }

  amygame_startUpArrangement = function () {
    clearSelfSwitchVariableRange(4, 11, 2000);
    clearSelfSwitchVariableRange(4, 12, 1000);
    clearSelfSwitchVariableRange(4, 13, 1000);
    const gameVariables = $gameVariables;
    gameVariables.setValue(356, Array(501).fill(0));
    const firstHeroineId = gameVariables.value(
      GAME_VARIABLE.FIRST_HEROINE_ACTOR_ID
    );
    const lastHeroineId = gameVariables.value(
      GAME_VARIABLE.LAST_HEROINE_ACTOR_ID
    );
    initializeHeroineOutfitPresets(
      gameVariables,
      firstHeroineId,
      lastHeroineId
    );
    initializeCoreGameRecordArrays(
      gameVariables,
      firstHeroineId,
      lastHeroineId
    );
    initializeDungeonRecordArrays(gameVariables);
    initializeActorProgressArrays(gameVariables);
  };

  amygame_startUp = function () {
    initializeStartupDatabaseNames();
    const gameVariables = $gameVariables;
    initializeViewpointSwitchNames(gameVariables);
    initializeStartupItemNames(gameVariables);
    // Descriptions must be built before resistance traits are appended.
    [4, 1, 2, 3, 5, 0].forEach((databaseType) =>
      various_description(databaseType)
    );
    initializeStartupResistanceTraits();
    enemy_troopPosition1();
    appendUniqueMaterialLocationDescriptions();
    attack_addKaisetu1();
    class_addKaisetu1();
    restoreDeployedActorSurnames(gameVariables);
    initializeSpecialMapNames();
  };

  //ステート付与されているかどうか。名前21に全員の名前、変数21に人数、変数22にid
  actor_stateCheck = function (stateId) {
    const affectedActorIds = [];
    const affectedActorNames = [];
    const firstActorId = $gameVariables.value(
      GAME_VARIABLE.FIRST_DEPLOYED_ACTOR_ID
    );
    const lastActorId = $gameVariables.value(
      GAME_VARIABLE.LAST_DEPLOYED_ACTOR_ID
    );
    const mapId = $gameMap.mapId();
    for (let actorId = firstActorId; actorId <= lastActorId; actorId++) {
      const gameActor = $gameActors.actor(actorId);
      if (!gameActor || !gameActor.isStateAffected(stateId)) continue;
      affectedActorIds.push(actorId);
      affectedActorNames.push(gameActor.name());
    }
    if (stateId == 83)
      affectedActorIds.forEach((actorId) =>
        $gameSelfSwitches.setValue([mapId, actorId, "A"], true)
      );
    let stateAffectedNames = affectedActorNames.join(" ");
    if (affectedActorNames.length) stateAffectedNames += " ";
    if (affectedActorIds.length >= 2) stateAffectedNames += `達`;
    const nameCarrierActor = $gameActors.actor(21);
    if (nameCarrierActor) nameCarrierActor.setName(stateAffectedNames);
    $gameVariables.setValue(21, affectedActorIds.length - 1);
    $gameVariables.setValue(22, affectedActorIds);
  };

  //役職名を変更する。Profession_CharaChange(0,1,`\\wn[314]の恋人`,0);//0がｱｸﾀｰで1NPC,id,役職名,0で表示1でｻｲﾚﾝﾄ
  Profession_CharaChange = function (
    targetTypeId,
    targetId,
    professionName,
    displayModeId
  ) {
    if (!$gameSwitches.value(GAME_SWITCH.RECOLLECTION_SKIP)) {
      let actorName = "";
      if (targetTypeId == 0) {
        $gameVariables.value(380 + targetId)[59] = `${professionName}`;
        actorName = $gameActors.actor(targetId).name();
      } else {
        $gameVariables.value(GAME_VARIABLE.NPC_PROFESSIONS)[targetId - 300] =
          `${professionName}`; //スタートリセットコモンで初期実行
        actorName = $dataWeapons[targetId].name;
      }
      if (displayModeId == 0) {
        $gameScreen.startAnimation(100, 150, 300, false);
        const actor = colorTaggedText(1, actorName);
        const job = colorTaggedText(2, professionName);
        TickerManager.show(
          `　　` + `${actor}の役職名が${job}に変更されました。`
        );
      }
    }
  };

  //役職名を基本に戻す
  Profession_basicReturn = function (actorId) {
    if ($gameSwitches.value(GAME_SWITCH.RECOLLECTION_SKIP)) return; // Exit early if switch 29 is on

    const dataActor = $dataActors[actorId];
    if (!dataActor) return;
    const actorRecords = $gameVariables.value(380 + actorId);
    if (!Array.isArray(actorRecords)) return;
    //const actor = $dataActors[actorId]; // was set by default
    let defaultProfession = `${dataActor.meta["Profession"]}`;
    let newProfession = defaultProfession;

    newProfession = chooseActorProfession(dataActor.meta, defaultProfession);
    const currentProfession = actorRecords[59];

    // Only update if profession has changed
    if (currentProfession === newProfession) return;

    if (!$gameSwitches.value(GAME_SWITCH.TEMPORARY_RESULT)) {
      const actorName = `\\N[${actorId}]`;
      const actor = colorTaggedText(1, actorName);
      const jobCur = "<" + colorTaggedText(1, currentProfession) + ">";
      const jobNew = "<" + colorTaggedText(2, newProfession) + ">";
      const professionChangeMessage =
        `　　` + `${actor}の役職名${jobCur}から${jobNew}に変更されました。`;
      TickerManager.show(professionChangeMessage);
    }

    actorRecords[59] = newProfession;
  };

  message_popup2 = function (
    popupEventId,
    popupPosition,
    messageRow,
    displayModeId
  ) {
    if (displayModeId == 0) {
      valueAutoSkipPicX = 0;
      $gameSystem.clearMessagePopupFree();
      $gameSystem.clearMessagePopup();
      $gameMessage.setMessageRow(4);
      return;
    }
    if (displayModeId != 1) return;

    valueAutoSkipPicX = 1000;
    $gameSystem.clearMessagePopupFree();
    if (popupEventId == 0) {
      $gameSystem.setMessagePopupFree(popupPosition[0], popupPosition[1]);
    } else {
      $gameSystem.setMessagePopup(popupEventId);
      switch (popupPosition) {
        case 1:
          $gameSystem.setPopupFixUpper(popupEventId);
          break;
        case 2:
          $gameSystem.setPopupFixLower(popupEventId);
          break;
      }
    }
    $gameMessage.setMessageRow(messageRow);
  };

  //配列に記録して控えメンバー0外す/1加える
  submember_saveAddRemove = function (changeModeId) {
    if (changeModeId == 0) {
      $gameParty.members().forEach(function (actor) {
        if (!!actor.isBattleMember()) return;

        $gameVariables.value(154).push(actor._actorId);
        $gameParty.removeActor(actor._actorId);
      }, this);
    } else {
      if ($gameVariables.value(154) != 0) {
        $gameParty.addActor(23);
        $gameParty.addActor(24);
        $gameParty.addActor(25);
        //$gameParty.changeBattleMax($gameParty.battleMembers().length);
        var list = $gameVariables.value(154);
        list.forEach(function (id) {
          const actor = $gameActors.actor(id);
          if (
            !$gameParty.members().contains(actor) &&
            actor.isLearnedSkill(18) &&
            !actor.isStateAffected(valueDollStateId)
          ) {
            $gameParty.addActor(id);
          }
        }, this);
        $gameVariables.setValue(154, []);
        //$gameParty.changeBattleMax(4);
        $gameParty.removeActor(23);
        $gameParty.removeActor(24);
        $gameParty.removeActor(25);
      }
    }
  };

  //プレイヤー位置記憶した場所に戻る。スイッチ140はそれぞれのコモンなりでoffにする
  set_playerPosition2 = function (varId) {
    const savedPosition = $gameVariables.value(varId);
    const mapId = Number(savedPosition[0]);
    const x = Number(savedPosition[1]);
    const y = Number(savedPosition[2]);
    $gamePlayer.reserveTransfer(mapId, x, y, 0, 2);
    SceneManager.goto(Scene_Map);
    //this.popScene();
    //$gamePlayer.setTransparent(false);
    //$gamePlayer.performTransfer();
    //console.log(`${arr1}`);
  };

  //プレイヤー位置記憶
  set_playerPosition1 = function (varId) {
    $gameVariables.setValue(varId, [
      $gameMap.mapId(),
      $gamePlayer._realX,
      $gamePlayer._realY
    ]);
    //$gamePlayer.setTransparent(true);
  };

  //拠点強制帰還位置指定移動
  set_homeMoveForced = function () {
    $gameSwitches.setValue(140, false);
    $gameSwitches.setValue(486, true);
    var homeWeaponId = 22;
    for (var i = 1; i <= 100; i++) {
      if (!($gameVariables.value(327)[i] == 2)) continue;

      var homeWeaponId = i;
      break;
    }
    const homePositionValues =
      $dataWeapons[homeWeaponId].meta["HomePosition"].split(",");
    $gameVariables.setValue(161, [
      Number(homePositionValues[0]),
      Number(homePositionValues[1]),
      Number(homePositionValues[2])
    ]);
    set_playerPosition2(161);
  };

  //時計表示
  time_settei = function () {
    scene_joukensettei(1);
    scene_joukensettei(2);
    const isInBattle = $gameParty.inBattle();
    let statusIconText =
      $gameVariables.value(504) >= 1
        ? `\\I[383]`
        : $gameVariables.value(505) >= 1
          ? `\\I[382]`
          : `\\I[16]`;

    if (isInBattle) {
      if ($gameSwitches.value(95)) {
        statusIconText += `\\I[427]`;
      } else {
        statusIconText += `\\I[317]`;
      }
    } else {
      if ($gameVariables.value(517) >= 1) {
        statusIconText += `\\I[535]`;
      } else {
        if ($gameVariables.value(518) >= 1) {
          statusIconText += `\\I[625]`;
        } else {
          statusIconText += `\\I[16]`;
        }
      }
    }
    if (isInBattle) {
      if ($gameSwitches.value(146)) {
        statusIconText += `\\I[126]`;
      } else {
        statusIconText += `\\I[16]`;
      }
    }
    if ($gameSwitches.value(GAME_SWITCH.NIGHT)) {
      statusIconText += `\\I[418]`;
    } else {
      if ($gameSwitches.value(GAME_SWITCH.DAYTIME)) {
        statusIconText += `\\I[417]`;
      } else {
        statusIconText += `\\I[416]`;
      }
    }
    let messageText = "";
    let pictureY = 680;

    if (!$gameSwitches.value(GAME_SWITCH.WORLD_MAP)) {
      //全体マップ以外で表示10
      if (isInBattle) {
        messageText = `${statusIconText}:+\\V[290,3]\\I[75]:\\V[263]\n\\I[176]:\\V[190]/\\V[189]\\V[332]\\I[127]:${valueMaxEnemyLv}\n`;
        const battleMembers2 = $gameParty.battleMembers();
        const heroineStatus = buildBattleHeroineStatus(battleMembers2);
        messageText += heroineStatus.text;
        pictureY -= heroineStatus.rowCount * 28;
        if (!$gameSwitches.value(211)) {
          const enemyStatus = buildEnemyStateIconRows($gameTroop.members());
          messageText += enemyStatus.text;
          pictureY -= enemyStatus.rowCount * 28;
        }
      } else {
        messageText = `${statusIconText}:\\V[56,3]`;
        if (!isInBattle && $gameSwitches.value(GAME_SWITCH.BATTLE_MAP)) {
          messageText += ` [\\C[10]\\V[335,2]\\C[0]/\\C[1]\\V[334,2]\\C[0]]`;
        }
      }
      $gameScreen.setDTextPicture(messageText, 25);
      if ($gameSwitches.value(GAME_SWITCH.BATTLE_MAP) && !isInBattle) {
        $gameScreen.dTextRealTime = "ON";
      }
      if (isInBattle) {
        $gameScreen.dTextAlign = 0;
        $gameScreen.dWindowFrame = "ON";
        $gameScreen.showPicture(50, "", 0, 1010, pictureY, 80, 80, 250, 0);
        /*       if($gameSwitches.value(211)){
                       
                     } else {
                       //$gameScreen.showPicture(50,"",0,10,10,80,80,250,0);
                     }; */
      } else {
        $gameScreen.dTextAlign = 1;
        const isBattleMap = $gameSwitches.value(GAME_SWITCH.BATTLE_MAP);
        const picId = isBattleMap ? 760 : 860;
        $gameScreen.showPicture(50, "", 0, picId, 10, 100, 100, 255, 0);
        const picName = isBattleMap ? "PictureBottan49d" : "PictureBottan49";
        $gameScreen.showPicture(49, picName, 0, 0, -5, 100, 100, 250, 0);
      }
    }
  };

  //エリクシール設定コンティニュー
  continue_settei = function (itemId) {
    const item = $dataItems[itemId];
    const itemMetaSwitchOnOffUseNum = Number(item.meta.SwicthOnOffUse);
    const isOn = $gameSwitches.value(itemMetaSwitchOnOffUseNum);
    const hasItemOn = $gameParty.hasItem(item) && isOn;

    item.name = hasItemOn ? item.meta.SwicthOnName : item.meta.SwicthOffName;
    $gameSwitches.setValue(itemMetaSwitchOnOffUseNum, hasItemOn); // correct value based on the item in inventory
    $gameParty.members().forEach(function (actor) {
      if (hasItemOn) actor.addState(25);
      else actor.removeState(25);
    });
  };

  //主人公パッシブ獲得
  actor_skilllearn1 = function (actorId) {
    const actor = $gameActors.actor(actorId);
    if (!actor) return;
    for (const skillId of valueHeroGetSkill || []) {
      if (actor.isLearnedSkill(skillId)) continue;
      const skillData = $dataSkills[skillId];
      if (!skillData || !heroineSkillConditionMet(actor, skillData.meta))
        continue;
      if (!$gameSwitches.value(GAME_SWITCH.RECOLLECTION_SKIP))
        actor.learnSkill(skillId);
      $gameVariables.setValue(GAME_VARIABLE.PROCESSED_ITEM_ID, skillId);
      return;
    }
    teachCompositeActorSkill(actor, valueIdentifySkillId, [
      { skillId: valueAppraisalSkillId },
      { skillId: valueHarvestingSkillId, minRank: 3 }
    ]);
    teachCompositeActorSkill(actor, valueMassGatheringSkillId, [
      { skillId: valueHuntingSkillId, minRank: 2 },
      { skillId: valueHarvestingSkillId, minRank: 2 }
    ]);
  };

  //パーティメンバーが通常攻撃派生スキル獲得。対象スキル範囲は101-200
  actor_skilllearn2 = function (actorId) {
    const learnAnimationId = 300;
    const learnMeName = "21_SkillLearn";
    const actor = $gameActors.actor(actorId);
    const start = 101;
    const end = 200;
    for (var skillId = start; skillId <= end; skillId++) {
      const skill = $dataSkills[skillId];
      if (skill.name === "") {
        continue;
      }
      const skillMetaNormalAttackDerived = skill.meta["NormalAttackDerived"];
      if (!skillMetaNormalAttackDerived) {
        continue;
      }

      var normalAttackDerivedValues = skillMetaNormalAttackDerived.split(",");
      var derivedSkillId = Number(normalAttackDerivedValues[1]);
      var masteryThreshold = Number(normalAttackDerivedValues[0]);
      if (
        !actor.isLearnedSkill(derivedSkillId) &&
        actor.skillMasteryLevel(skillId) >= masteryThreshold
      ) {
        actor.learnSkill(derivedSkillId);
        if (!$gameParty.inBattle()) {
          $gamePlayer.requestAnimation(learnAnimationId);
        } else {
          $gameParty
            .members()
            [actor.index()].startAnimation(learnAnimationId, false, 0);
        }
        AudioManager.playMe({
          name: learnMeName,
          volume: 60,
          pitch: 120,
          pan: 0
        });
        const actorName = actor.name();
        const displayText = `\x1bSIN[${skillId}]`;
        const displayText2 = `\x1bSIN[${derivedSkillId}]`;
        var learnMessage = `${actorName}の${displayText}がRank${masteryThreshold}に到達し、${displayText2}が派生した！`;
        if ($gameParty.inBattle()) {
          BattleManager._logWindow.push(`addText`, learnMessage);
        } else {
          gab_wordParticle(learnMessage);
        }
      }
    }
  };

  //パーソナルスキルのonoffロード時
  skill_personalonoffload = function (itemId, valueItemsType) {
    if (valueItemsType > 1) return;

    valueItems = valueItemsType == 0 ? $dataSkills : $dataItems;

    const item = valueItems[itemId];
    const skillSwitchId = Number(item.meta.SwicthOnOffUse);
    const switchStateValue = $gameSwitches.value(skillSwitchId);

    // set effect switch by skill name
    //if (!$gameSwitches.value(19)) {
    item.name = switchStateValue
      ? item.meta.SwicthOnName
      : item.meta.SwicthOffName;
    $gameSwitches.setValue(skillSwitchId, switchStateValue);
    //}
  };

  //パーソナルスキルのonoff
  skill_personalonoff = function (actorA, actorB, itemId, valueItemsType) {
    if (actorB.actorId() !== actorA.actorId()) return;
    if (valueItemsType > 1) return;

    valueItems = valueItemsType == 0 ? $dataSkills : $dataItems;

    const item = valueItems[itemId];
    const skillSwitchId = Number(item.meta.SwicthOnOffUse);
    const switchStateValue = $gameSwitches.value(skillSwitchId);

    // revers switch state
    item.name = switchStateValue
      ? item.meta.SwicthOffName
      : item.meta.SwicthOnName;
    $gameSwitches.setValue(skillSwitchId, !switchStateValue);

    // show new state name
    const s = valueItemsType == 0 ? "S" : "I";
    const switchStateName = `\\C[2]\x1b${s}IN[${itemId}]\\C[0]`;
    TickerManager.show(`<${switchStateName}>に変更しました`);
  };

  //パーソナルスキルの所持者不在時にスイッチ自動off
  skill_personalonoffAutoOff = function (itemId, itemOrSkillType) {
    valueItems = itemOrSkillType == 0 ? $dataSkills : $dataItems;
    $gameSwitches.setValue(
      Number(valueItems[itemId].meta.SwicthOnOffUse),
      false
    );
  };

  //主人公がパーソナルスキルを道具で習得
  actor_personalskilllearn = function (
    sourceActor,
    targetActor,
    itemId,
    itemOrSkillTypeId,
    skillId
  ) {
    const actor = $gameActors.actor(
      $gameVariables.value(GAME_VARIABLE.TRUE_PROTAGONIST_ACTOR_ID)
    );
    if (targetActor.actorId() == sourceActor.actorId()) {
      if (actor.isLearnedSkill(skillId)) {
        const actorName = `\\C[16]${actor.name()}\\C[0]`;
        const skillName = `\\C[2]\x1bSIN[${skillId}]\\C[0]`;
        switch (numericCaseValue(itemOrSkillTypeId)) {
          case 2:
            {
              TickerManager.show(
                `${actorName}は既に${skillName}を習得済みのため効果は無かった。`
              );
            }
            break;
          case 1:
            {
              if (
                actor.skillMasteryLevel(skillId) >=
                Number($dataSkills[skillId].meta["Max Mastery Level"])
              ) {
                TickerManager.show(
                  `${actorName}の${skillName}は最高ランクに到達しています…。`
                );
              } else {
                const skillRankNum = 10 * $gameVariables.value(203);
                actor.gainSkillMasteryUses(skillId, skillRankNum); //変更熟練度
                const skillRank = `\\C[3]${skillRankNum}\\C[0]`;
                TickerManager.show(
                  `${actorName}の${skillName}熟練度を${skillRank}獲得した！`
                );
                const skillMasteryLevel = actor.skillMasteryLevel(skillId);
                const skillMasteryUses = `\\C[2]${actor.skillMasteryUses(skillId)}`;
                const skillMasteryUsageMax = `${actor.skillMasteryUsageMax(skillId)}\\C[0]`;
                TickerManager.show(
                  `Rank:${skillMasteryLevel} /熟練度${skillMasteryUses}(${skillMasteryUsageMax})`
                );
                $gameParty.loseItem($dataItems[itemId], 1);
              }
            }
            break;
        }
      } else {
        actor.learnSkill(skillId);
        actor.setSkillMasteryLevel(skillId, 1);
        AudioManager.playMe({
          name: "21_SkillLearn",
          volume: 60,
          pitch: 120,
          pan: 0
        });
        const actorName = `\\C[16]${actor.name()}\\C[0]`;
        const skillName = `\\C[2]\x1bSIN[${skillId}]\\C[0]`;
        TickerManager.show(`${actorName}は${skillName}を習得した！`);
        $gameParty.loseItem($dataItems[itemId], 1);
      }
    }
  };

  //ステートオンオフ
  skill_stateonoff = function (actorA, actorB, skillId, stateId) {
    if (actorB.actorId() !== actorA.actorId()) return;

    const skill = $dataSkills[skillId];
    stateId = Number(skill.meta["SkillStateAddRemove"]); // re set stateId, all using of skill_stateonoff use 0 value for stateId

    const actor = $gameActors.actor(actorB._actorId);
    const isStateAffected =
      $dataStates[stateId] !== null && actor.isStateAffected(stateId);
    if (isStateAffected) actor.removeState(stateId);
    else if ($dataStates[stateId] !== null) actor.addState(stateId);
    const animationId = isStateAffected ? 289 : 282;
    if ($gameParty.inBattle()) {
      actorB.startAnimation(animationId, true, 0);
    }
    if (skill.meta["TachieChangeSet"]) {
      //たぶん使ってない isStateAffected
      actor.addState(20);
      $gameSwitches.setValue(96, true);
    }

    const actorName = `\\C[16]${actorB.name()}\\C[0]`;
    const skillName = `\\C[2]\x1bSIN[${skillId}]\\C[0]`;
    const message = isStateAffected
      ? `${actorName}の${skillName}が解除された。`
      : `${actorName}に${skillName}が付与された。`;
    TickerManager.show(message);
  };

  //スキルアイテム使用時に立ち絵が変化する場合。事前に$gameVariables.setValue(20,b.actorId());
  tachie_usedChange1 = function (gameActor) {
    const gameActorData = gameActor.actor();
    if (!gameActorData || !gameActorData.meta["Heroine"]) return;

    if (!$gameSwitches.value(131) || !$gameParty.inBattle()) {
      if (
        $gameSwitches.value(42) &&
        $gameVariables.value(GAME_VARIABLE.PORTRAIT_ACTOR_ID) ==
          gameActor.actorId()
      ) {
        const tachiePicId = gameActor.actor().meta["TachiePicId"];
        tachie_syoukyo1(tachiePicId); // getPreviousTachiePicId();
        tachie_settei3(gameActor);
        $gameVariables.setValue(
          GAME_VARIABLE.SELECTED_ACTOR_ID,
          $gameVariables.value(GAME_VARIABLE.PORTRAIT_ACTOR_ID)
        );
        tachie_hyouji2(gameActor);
      } else {
        tachie_settei3(gameActor);
      }
    } else {
      tachie_settei3(gameActor);
    }
  };

  //スキルアイテム使用でのぶっかけ付与。
  bukkake_addSemen1 = function (user, target, itemId, valueItemsType) {
    const sourceEntries = valueItemsType == 0 ? $dataSkills : $dataItems;
    const heroineName = target.name();
    if ($dataActors[target.actorId()].meta["Heroine"]) {
      target.addState(86);
      $gameVariables.setValue(
        GAME_VARIABLE.SELECTED_ACTOR_ID,
        target.actorId()
      );
      tachie_usedChange1(target);

      TickerManager.show(`${heroineName}はぶっかけられた！`);
    } else {
      TickerManager.show(
        `${heroineName}は対象キャラでは無いため、効果が無かった…。`
      );

      if (valueItemsType == 1) {
        $gameParty.gainItem(sourceEntries[itemId], +1);
      }
    }
  };

  //スキルアイテム使用での精液回復。実際のステート回復は<Remove 1 State Category: StateSemen>で実施
  semen_reflesh1 = function (user, target, itemId, itemOrSkillTypeId) {
    const sourceEntries = itemOrSkillTypeId == 0 ? $dataSkills : $dataItems;
    const stateCategoryName = "StateSemen";
    let semenCount = 0;

    const itemMetaSemenRemove = sourceEntries[itemId].meta["SemenRemove"];
    let end = itemMetaSemenRemove ? Number(itemMetaSemenRemove) : 1;

    const semenItem = $dataItems[120];
    for (let i = 1; i <= end; i++) {
      if (!target.isStateCategoryAffected(stateCategoryName)) continue;

      target.removeStateCategory(stateCategoryName, 1);
      $gameParty.gainItem(semenItem, 1); //白濁瓶
      semenCount += 1;
    }

    const targetName = target.name();
    const cnt = `(${semenCount})`;
    const itemName = `\\iin[120]`;
    const txtObtained = cnt + `${itemName}を入手`;
    const nonEmptyMessage = `${targetName}は白濁を洗浄した。` + txtObtained;
    const emptyMessage = `${targetName}には効果が無かった`;
    const messageText = semenCount >= 1 ? nonEmptyMessage : emptyMessage;
    showMessage(messageText);
    target.addState(71);
    showMessage(`${targetName}は濡れてしまった`);

    $gameVariables.setValue(GAME_VARIABLE.SELECTED_ACTOR_ID, target.actorId());
    tachie_usedChange1(target);
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
    }
  };

  //スキルアイテム使用での衣装修復
  cloth_repair1 = function (user, target, itemId, itemsToReturn) {
    if (!target) return;
    const sourceDatabase = itemsToReturn == 0 ? $dataSkills : $dataItems;
    const sourceEntry = sourceDatabase[itemId];
    const targetName = target.name();
    if (target.isStateAffected(23)) {
      refundClothingRepairItem(sourceEntry, itemsToReturn);
      showMessage(`現在の${targetName}は衣装修復対象ではありません。`);
      return;
    }
    const actorData = target.isActor() ? target.actor() : null;
    if (actorData)
      $gameVariables.setValue(
        GAME_VARIABLE.SELECTED_ACTOR_ID,
        target.actorId()
      );
    const actorMeta = actorData && actorData.meta;
    const mainClothId = actorMeta && Number(actorMeta.MainCloth);
    if (!actorMeta || !actorMeta.Heroine || !Number.isFinite(mainClothId)) {
      refundClothingRepairItem(sourceEntry, itemsToReturn);
      showMessage(`${targetName}は衣装修復の対象ではありません。`);
      return;
    }
    target.removeState(70);
    $gameVariables.setValue(GAME_VARIABLE.PROCESSED_ITEM_ID, mainClothId);
    kisekae_tyokusetusitei(mainClothId, 0);
    tachie_usedChange1(target);
    showMessage(`${targetName}の衣装を修復しました。`);
  };

  //スキルアイテム使用での状態異常クリア//0スキル1アイテム<abNomalClearCount:5>
  //<abNomalClearCountPlus:200>mat200につき1プラス,修正一律で300
  abNomal_Clear = function (
    sourceActor,
    targetActor,
    itemId,
    itemOrSkillTypeId
  ) {
    const database = getItemsSourceSkillsItemsStates(itemOrSkillTypeId);
    const sourceEntry = database && database[itemId];
    if (!sourceEntry || !sourceActor || !targetActor) return;
    const meta = sourceEntry.meta;
    let remainingCount = meta.abNomalClearCount
      ? Number(meta.abNomalClearCount)
      : 1;
    const normalOnly = !!meta.StateabNomalOnly;
    const normalCount =
      targetActor.getStateCategoryAffectedCount("StateabNomal");
    const affectedCount =
      normalCount +
      (normalOnly
        ? 0
        : targetActor.getStateCategoryAffectedCount("StateSPabNomal"));
    if (affectedCount == 0) {
      if (sourceActor.isActor()) {
        const targetName = targetActor.name();
        const messageText = normalOnly
          ? `${targetName}は基本状態異常を付与されていない為、効果が無かった。`
          : `${targetName}は基本特殊状態異常を付与されていない為、効果が無かった。`;
        showMessage(messageText);
      }
      // Preserve the original refund: only normal-only item recovery refunds here.
      if (normalOnly && itemOrSkillTypeId == 1)
        $gameParty.gainItem(sourceEntry, 1);
      return;
    }
    remainingCount += stateRemovalMagicBonus(
      sourceActor,
      meta.abNomalClearCountPlus,
      "recovery"
    );
    remainingCount = removeStateCategoryWithMessage(
      targetActor,
      "StateabNomal",
      remainingCount,
      "normal"
    );
    if (remainingCount < 1 || normalOnly) return;
    removeStateCategoryWithMessage(
      targetActor,
      "StateSPabNomal",
      remainingCount,
      "special"
    );
  };

  powerUp_dispel = function (
    sourceActor,
    targetActor,
    itemId,
    itemOrSkillTypeId
  ) {
    if (!sourceActor || !targetActor) return;
    if (activateDispelGuard(targetActor)) return;
    const database = getItemsSourceSkillsItemsStates(itemOrSkillTypeId);
    const sourceEntry = database && database[itemId];
    if (!sourceEntry) return;
    const meta = sourceEntry.meta;
    let remainingCount = meta.dispelCount ? Number(meta.dispelCount) : 1;
    if (
      sourceActor.isActor() &&
      targetActor.getStateCategoryAffectedCount("PowerUp") == 0
    ) {
      const targetName = targetActor.name();
      const messageText = `${targetName}は強化状態を付与されていない為、効果が無かった。`;
      showMessage(messageText);
    }
    // Retain the source's bonus notification even when no power-up state is present.
    remainingCount += stateRemovalMagicBonus(
      sourceActor,
      meta.dispelCountPlus,
      "dispel"
    );
    removeStateCategoryWithMessage(
      targetActor,
      "PowerUp",
      remainingCount,
      "powerUp"
    );
  };

  const masteryLevel5R100Map = {
    1: `[D]`,
    2: `[C]`,
    3: `[B]`,
    4: `[A]`,
    5: `[S]`
  };
  const masteryLevel5Map = {
    1: "[E]",
    2: "[D]",
    3: "[C]",
    4: "[B]",
    5: "[A]"
  };
  const masteryLevel6Map = {
    1: `[E]`,
    2: `[D]`,
    3: `[C]`,
    4: `[B]`,
    5: `[A]`,
    6: `[S]`
  };
  const masteryLevel10R100Map = {
    1: "[D]",
    2: "[D]",
    3: "[C]",
    4: "[C]",
    5: "[B]",
    6: "[B]",
    7: "[A]",
    8: "[A]",
    9: "[S]",
    10: "[S]"
  };
  const masteryLevel10Map = {
    1: "[E]",
    2: "[E]",
    3: "[D]",
    4: "[D]",
    5: "[C]",
    6: "[C]",
    7: "[B]",
    8: "[B]",
    9: "[A]",
    10: "[A]"
  };
  //スキルアイテム使用での二つ名変更//0スキル1アイテムskillItem_titles(a,b,this.item().id,0);
  skillItem_titles = function (sourceActor, targetActor, itemId, ItemType) {
    // Only process if target is same as source actor
    if (targetActor.actorId() !== sourceActor.actorId()) return;

    const itemsData = ItemType == 0 ? $dataSkills : $dataItems;
    const itemData = itemsData[itemId];

    // Get appropriate sound effect parameters based on item type
    const soundEffectParams = getSoundEffectParamsSkillItemTitles(
      itemData,
      ItemType
    );

    // Get rank label based on item mastery level
    const skillRankLabel = getSkillRankLabelSkillItemTitles(
      targetActor,
      itemData,
      itemId,
      ItemType
    );

    // Update actor's title and display notification
    updateActorTitleSkillItemTitles(
      targetActor,
      itemData,
      skillRankLabel,
      soundEffectParams,
      ItemType,
      itemId
    );
  };

  // Determine appropriate sound effect based on item type and category
  function getSoundEffectParamsSkillItemTitles(itemData, ItemType) {
    // Default sound effect for title changes
    let soundEffectParams = ["Z11_NickNameChange", 50, 110, 0];

    const itemMeta = itemData.meta;

    // Check Menu Category for H titles
    if (
      itemMeta["Menu Category"] &&
      itemMeta["Menu Category"] === " H'sTitle"
    ) {
      soundEffectParams = ["Z_Suspicious", 50, 150, 0];
    }

    // Check skill type for special skills (type 15)
    if (ItemType === 0 && itemData.stypeId === 15) {
      soundEffectParams = ["Z_Suspicious", 50, 150, 0];
    }

    return soundEffectParams;
  }

  // Determine rank label based on skill mastery level and configuration
  function getSkillRankLabelSkillItemTitles(actor, itemData, itemId, ItemType) {
    // Special case for libido-related skill (ID 50)
    if (ItemType === 0 && itemId === 50) {
      const libidoValue = $gameVariables.value(actor.actorId() + 380)[1];
      return getLibidoRankLabelSkillItemTitles(libidoValue);
    }

    const itemMeta = itemData.meta;
    if (!itemMeta["RankUpPoint"]) return "";

    const masteryLevel = actor.skillMasteryLevel(itemId);
    const maxMasteryLevel = Number(itemMeta["Max Mastery Level"]);
    const rankUpPoint = Number(itemMeta["RankUpPoint"]);

    // Select appropriate rank label based on max mastery level and rank up point
    switch (maxMasteryLevel) {
      case 6:
        return masteryLevel6Map[masteryLevel] || "";
      case 5:
        return (
          (rankUpPoint >= 100
            ? masteryLevel5R100Map[masteryLevel]
            : masteryLevel5Map[masteryLevel]) || ""
        );
      case 10:
        return (
          (rankUpPoint >= 100
            ? masteryLevel10R100Map[masteryLevel]
            : masteryLevel10Map[masteryLevel]) || ""
        );
      default:
        return "";
    }
  }

  // Update actor's title and display notification to player
  function updateActorTitleSkillItemTitles(
    actor,
    itemData,
    skillRankLabel,
    soundEffectParams,
    ItemType,
    itemId
  ) {
    const actorName = actor.name();
    const nickname = $dataActors[actor._actorId].nickname;

    // Handle special case for default title item (ID 600)
    if (ItemType === 1 && itemId === 600) {
      $gameActors.actor(actor._actorId).setNickname(`${nickname}`);
      TickerManager.show(`${actorName}の二つ名が${nickname}になった！`);
    } else {
      // Regular title update with rank label
      const newTitle = itemData.name + skillRankLabel;
      $gameActors.actor(actor._actorId).setNickname(`＜${newTitle}＞`);
      TickerManager.show(`${actorName}の二つ名が＜${newTitle}＞になった！`);
    }

    // Play sound effect
    AudioManager.playSe({
      name: soundEffectParams[0],
      volume: Number(soundEffectParams[1]),
      pitch: Number(soundEffectParams[2]),
      pan: Number(soundEffectParams[3])
    });
  }

  // Special pattern for the libido-related skill
  // Helper function to determine rank label for libido level
  function getLibidoRankLabelSkillItemTitles(libidoValue) {
    if (libidoValue > 900) return "[SSS]";
    if (libidoValue > 800) return "[SS]";
    if (libidoValue > 600) return "[A]";
    if (libidoValue > 500) return "[B]";
    if (libidoValue > 400) return "[C]";
    if (libidoValue > 300) return "[D]";
    if (libidoValue > 200) return "[E]";
    return "[圏外]"; // Default for values 200 and below
  }

  //コモンイベントでスクリプト実行前に代入
  common_script1 = function (
    commonVar14,
    commonVar121,
    commonVar122,
    commonVar123,
    commonVar124,
    commonVar125,
    commonVar126,
    commonVar127,
    commonVar128,
    commonVar129
  ) {
    $gameVariables.setValue(14, commonVar14);
    $gameVariables.setValue(121, commonVar121);
    $gameVariables.setValue(122, commonVar122);
    $gameVariables.setValue(123, commonVar123);
    $gameVariables.setValue(124, commonVar124);
    $gameVariables.setValue(125, commonVar125);
    $gameVariables.setValue(126, commonVar126);
    $gameVariables.setValue(127, commonVar127);
    $gameVariables.setValue(128, commonVar128);
    $gameVariables.setValue(129, commonVar129);
  };

  //スキル複数選択肢1スキル用
  skill_sentaku = function (skillId, unusedValue) {
    // Cache meta for performance.
    const skill = $dataSkills[skillId];
    const meta = skill.meta;
    const varId = Number(meta.VariableChangeUse);

    if (!$gameSwitches.value(19)) {
      $gameVariables.setValue(
        varId,
        getVariableValueSkillSentaku($gameVariables.value(varId), meta)
      );
    }

    skill.name = getUpdatedSkillNameSkillSentaku(
      $gameVariables.value(varId),
      meta,
      skill.name
    );
  };

  function getUpdatedSkillNameSkillSentaku(val, meta, def) {
    switch (val) {
      case 1:
        return meta.ValChangeName1;
      case 2:
        return meta.ValChangeName2;
      case 3:
        return meta.ValChangeName3;
      case 4:
        return meta.ValChangeName4;
      case 5:
        return meta.ValChangeName5;
      default:
        return def;
    }
  }

  function getVariableValueSkillSentaku(currentValue, meta) {
    switch (currentValue) {
      case 1:
        return 2;
      case 2:
        return 3;
      case 3:
        return meta.ValChangeName4 ? 4 : 1;
      case 4:
        return meta.ValChangeName5 ? 5 : 1;
      case 5:
        return 1;
      default:
        return currentValue;
    }
  }

  //苗字取得
  family_name = function (actorId, resultVarId) {
    $gameVariables.setValue(
      resultVarId,
      $gameVariables.value(actorId + 380)[50]
    );
  };

  //ウィンドウカラー変更
  const windowColor1Map = {
    0: [0, 0, 0], // Default
    1: [170, 0, 170], // H関係
    2: [-34, 153, 68], // 一人称視点
    3: [170, 170, 0], // その他（白と黄の間？）
    4: [-255, 170, 34] // その他（薄水色）
  };
  window_color1 = function (colorToneId) {
    const tone = windowColor1Map[colorToneId] || [0, 0, 0]; // Default to [0, 0, 0] if id1 is not in the map
    $gameSystem.setWindowTone(tone);
  };

  const xOffsetOptions = [-30, -20, -10, 0, 10, 20, 30];
  const yNegativeOffsetOptions = [-30, -25, -20, -10, -5, 0];
  const yPositiveOffsetOptions = [30, 25, 20, 10, 5, 0];
  //エネミーグループ設定$gameVariables.value(270)//$gameVariables.value(232)
  enemy_troopPush = function () {
    if ($gameVariables.value(220) === 0) return; // have empty common enemy's pool

    const chestItemMeta =
      $dataItems[$gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID)].meta;
    let spawnChanceOffset = 0;
    for (let troopId = 11; troopId <= 20; troopId++) {
      const enemyTroop = $dataTroops[troopId];
      enemyTroop.name = chestItemMeta["TroopName"];
      enemyTroop.members = []; //グループのメンバーを空に

      // get enemy count to spawn
      const enemyCountToSpawn =
        calculateEnemyCountToSpawnEnemyTroopPush(chestItemMeta);

      // get enemy spawn pool
      const spawnResult = calculateSpawnPoolEnemyTroopPush(spawnChanceOffset);
      let spawnPool = spawnResult.pool;
      spawnChanceOffset = spawnResult.spawnChanceOffset;

      // add enemies to enemy troop
      const spawnPoolLength = spawnPool.length;
      const spawnTracker = { hasSpawned27: false, hasSpawned28: false };
      for (let spawnIndex = 1; spawnIndex <= enemyCountToSpawn; spawnIndex++) {
        // get enemy data
        const enemySpawnId = resolveEnemySpawnIdEnemyTroopPush(
          spawnPool,
          spawnPoolLength,
          spawnTracker
        );
        const { spawnX, spawnY } = getSpawnCoordinatesEnemyTroopPush(
          spawnIndex,
          enemyCountToSpawn,
          xOffsetOptions,
          yNegativeOffsetOptions,
          yPositiveOffsetOptions
        );
        let isHidden =
          spawnIndex >= enemyCountToSpawn && enemyCountToSpawn != 1
            ? true
            : false; //ラスト一人を隠している。エネミー一人の時は除外

        // add enemy
        const enemy = {
          enemyId: enemySpawnId,
          x: spawnX,
          y: spawnY,
          hidden: isHidden
        }; //追加するエネミーの設定(ID1、座標(100,100)、表示有)
        enemyTroop.members.push(enemy); //設定したエネミーをグループに追加
      }
    }
    $gameSwitches.setValue(357, true);
  };

  function calculateSpawnPoolEnemyTroopPush(spawnChanceOffset) {
    let pool = $gameVariables.value(220);
    const specialPool = $gameVariables.value(242);
    if (specialPool != 0) {
      for (let index = 0; index < specialPool.length; index++) {
        let chanceRoll = getRandomIndex(101);
        chanceRoll -= spawnChanceOffset;
        if ($gameParty.membersState(304)) {
          chanceRoll += 10;
        }
        if ($gameParty.membersState(305)) {
          chanceRoll += 10;
        }
        if ($gameParty.membersState(306)) {
          chanceRoll += 10;
        }
        if (chanceRoll >= 80) {
          pool = pool.concat(specialPool);
          spawnChanceOffset += 10;
        }
      }
    }
    return { pool, spawnChanceOffset };
  }

  function calculateEnemyCountToSpawnEnemyTroopPush(troopMeta) {
    const battleEnemyPopOptions = troopMeta["BattleEnemyPopC"].split(",");
    let enemyCountToSpawn = Number(
      battleEnemyPopOptions[getRandomIndex(battleEnemyPopOptions.length)]
    );
    if ($gameVariables.value(232) >= 2) {
      let additionalSpawnOffset = Math.floor(
        Math.random() * $gameVariables.value(232)
      );
      enemyCountToSpawn += additionalSpawnOffset;
      if ($gameVariables.value(270) >= 11) {
        let bonusChance = getRandomIndex(101);
        if ($gameVariables.value(270) >= bonusChance) {
          enemyCountToSpawn += 1;
        }
      }
    }
    if (enemyCountToSpawn >= 9) {
      enemyCountToSpawn = 8;
    }
    return enemyCountToSpawn;
  }

  function resolveEnemySpawnIdEnemyTroopPush(
    spawnPool,
    spawnPoolLength,
    tracker
  ) {
    let enemySpawnId = Number(spawnPool[getRandomIndex(spawnPoolLength)]); // 出現エネミースポーン
    if (enemySpawnId === 27 && tracker.hasSpawned27 === true) {
      enemySpawnId = 21;
    }
    if (enemySpawnId === 27) {
      tracker.hasSpawned27 = true;
    } // id27を１体だけにする
    if (enemySpawnId === 28 && tracker.hasSpawned28 === true) {
      enemySpawnId = 22;
    }
    if (enemySpawnId === 28) {
      tracker.hasSpawned28 = true;
    } // id28を１体だけにする
    return enemySpawnId;
  }

  function getSpawnCoordinatesEnemyTroopPush(
    spawnIndex,
    enemyCountToSpawn,
    xOffsetOptions,
    yNegativeOffsetOptions,
    yPositiveOffsetOptions
  ) {
    let spawnX, spawnY;
    switch (spawnIndex) {
      case 1:
        spawnX = 450;
        spawnY = 350;
        break;
      case 2:
        spawnX = 400;
        spawnY = 500;
        break;
      case 3:
        spawnX = 350;
        spawnY = 350;
        break;
      case 4:
        spawnX = 300;
        spawnY = 500;
        break;
      case 5:
        spawnX = 250;
        spawnY = 350;
        break;
      case 6:
        spawnX = 200;
        spawnY = 500;
        break;
      case 7:
        spawnX = 150;
        spawnY = 350;
        break;
      case 8:
        spawnX = 100;
        spawnY = 500;
        break;
    }

    if (spawnIndex >= 2 && spawnIndex <= 6) {
      spawnX += Number(xOffsetOptions[getRandomIndex(xOffsetOptions.length)]);
    }
    if (
      spawnIndex == 2 ||
      spawnIndex == 4 ||
      spawnIndex == 6 ||
      spawnIndex == 8
    ) {
      spawnY += Number(
        yNegativeOffsetOptions[getRandomIndex(yNegativeOffsetOptions.length)]
      );
    } else {
      spawnY += Number(
        yPositiveOffsetOptions[getRandomIndex(yPositiveOffsetOptions.length)]
      );
    }
    switch (enemyCountToSpawn) {
      case 2:
        if (spawnIndex == 2) {
          spawnX -= 200;
        }
        break;
      case 3:
        if (spawnIndex == 2) {
          spawnX -= 100;
        }
        if (spawnIndex == 3) {
          spawnX -= 100;
        }
        break;
      case 4:
        if (spawnIndex == 2) {
          spawnX -= 100;
        }
        if (spawnIndex == 3) {
          spawnX -= 100;
        }
        if (spawnIndex == 4) {
          spawnX -= 200;
        }
        break;
      case 5:
        if (spawnIndex == 3) {
          spawnX -= 100;
          spawnY += 50;
        }
        if (spawnIndex == 4) {
          spawnX -= 200;
        }
        if (spawnIndex == 5) {
          spawnX -= 100;
        }
        break;
    }
    spawnY -= 80; // Adjust according to battle background
    return { spawnX, spawnY };
  }

  henemy_troopPush = function () {
    const spawnPoolH = $gameVariables.value(228);
    // Hエネミーが出現しないダンジョンではプールが空配列のまま。旧ガード(=== 0)は
    // 空配列を素通りするため、H専用メタを持たないデータで split が落ちていた。
    if (!spawnPoolH || spawnPoolH.length === 0) return;

    const troopId = 10; //グループIDを指定
    const enemyTroopH = $dataTroops[troopId];
    const troopMeta =
      $dataItems[$gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID)].meta;
    // H専用メタを持たないダンジョンもあるため、通常版のキーへフォールバックする
    enemyTroopH.name = troopMeta["TroopNameH"] || troopMeta["TroopName"];
    enemyTroopH.members = []; //グループのメンバーを空に
    const spawnPoolHLength = spawnPoolH.length;

    // add enemies to enemy troop
    const battleEnemyPopHOptions = (
      troopMeta["BattleEnemyPopCH"] || troopMeta["BattleEnemyPopC"]
    ).split(",");
    const enemyCountToSpawn = Number(
      battleEnemyPopHOptions[getRandomIndex(battleEnemyPopHOptions.length)]
    );
    for (let spawnIndex = 1; spawnIndex <= enemyCountToSpawn; spawnIndex++) {
      // get enemy data
      let enemySpawnId =
        Number(spawnPoolH[getRandomIndex(spawnPoolHLength)]) || 0; //出現エネミースポーン
      const { spawnX, spawnY } = getSpawnCoordinatesHEnemyTroopPush(
        spawnIndex,
        enemyCountToSpawn,
        xOffsetOptions,
        yNegativeOffsetOptions,
        yPositiveOffsetOptions
      );

      // add enemy
      // 元コードでも hidden は常に false 固定(算出していた value5 はコメントアウトされていた)
      const enemy = {
        enemyId: enemySpawnId,
        x: spawnX,
        y: spawnY,
        hidden: false
      }; //追加するエネミーの設定(ID1、座標(100,100)、表示有)
      enemyTroopH.members.push(enemy); //設定したエネミーをグループに追加
    }
  };

  // Base position mapping for spawn indexes
  const spawnCoordinateBasePositions = {
    1: { x: 450, y: 350 },
    2: { x: 400, y: 500 },
    3: { x: 350, y: 350 },
    4: { x: 300, y: 500 },
    5: { x: 250, y: 350 },
    6: { x: 200, y: 500 },
    7: { x: 150, y: 350 },
    8: { x: 100, y: 500 }
  };

  function getSpawnCoordinatesHEnemyTroopPush(
    spawnIndex,
    enemyCountToSpawn,
    xOffsetOptions,
    yNegativeOffsetOptions,
    yPositiveOffsetOptions
  ) {
    // Special case for single enemy
    if (enemyCountToSpawn === 1 && spawnIndex === 1) {
      return { spawnX: 350, spawnY: 420 };
    }

    // Get base position or default to {0, 0}
    const basePosition = spawnCoordinateBasePositions[spawnIndex] || {
      x: 0,
      y: 0
    };
    let spawnX = basePosition.x;
    let spawnY = basePosition.y;

    // Apply random X offset for middle positions
    if (spawnIndex >= 2 && spawnIndex <= 6) {
      spawnX += Number(xOffsetOptions[getRandomIndex(xOffsetOptions.length)]);
    }

    // Apply random Y offset based on even/odd spawn index
    const isEven = spawnIndex % 2 === 0;
    const yOffsetOptions = isEven
      ? yNegativeOffsetOptions
      : yPositiveOffsetOptions;
    spawnY += Number(yOffsetOptions[getRandomIndex(yOffsetOptions.length)]);

    // Apply positioning adjustments based on enemy count
    switch (enemyCountToSpawn) {
      case 2:
        if (spawnIndex === 2) spawnX -= 200;
        break;
      case 3:
        if (spawnIndex === 2) spawnX -= 100;
        if (spawnIndex === 3) spawnX -= 100;
        break;
      case 4:
        if (spawnIndex === 2) spawnX -= 100;
        if (spawnIndex === 3) spawnX -= 100;
        if (spawnIndex === 4) spawnX -= 200;
        break;
      case 5:
        if (spawnIndex === 3) {
          spawnX -= 100;
          spawnY += 50;
        }
        if (spawnIndex === 4) spawnX -= 200;
        if (spawnIndex === 5) spawnX -= 100;
        break;
    }

    return { spawnX, spawnY };
  }

  // Pre-define position mappings for different troop name patterns
  const enemyBossTroopPositionMappings = {
    バハムート: { x: 150, y: 600 },
    768: { x: 250, y: 768 },
    600: { x: 250, y: 600 },
    500: { x: 250, y: 500 },
    big: { x: 250, y: 400 },
    one: { x: 250, y: 330 }
  };
  //エネミーグループ配置設定。bosssetup時に実行
  enemy_troopPosition1 = function () {
    // Process each troop in the database
    const troopsLength = $dataTroops.length;
    for (let i = 1; i < troopsLength; i++) {
      const troop = $dataTroops[i];

      // Skip invalid troops or those without members
      if (!troop || !troop.members || troop.members.length === 0) continue;

      // Find matching pattern and apply position
      for (const [pattern, position] of Object.entries(
        enemyBossTroopPositionMappings
      )) {
        if (!troop.name.match(pattern)) continue;

        troop.members[0].x = position.x;
        troop.members[0].y = position.y;
        break; // Exit the loop once a match is found
      }
    }
  };

  //図鑑のテキスト代入
  scene_Glossarytext1 = function (itemId, variableId) {
    const gameVariables = $gameVariables;
    const dataItems = $dataItems;
    const dataStates = $dataStates;
    const dataEnemies = $dataEnemies;

    const itemData = dataItems[itemId];
    const itemMeta = itemData.meta;

    const enemyElementMetadata = itemMeta.EnemyElement;
    // Handle enemy element and level data
    const enemyElementArray = enemyElementMetadata
      ? enemyElementMetadata.split(",")
      : [0];
    const enemyLevelRange = itemMeta["EnemyLV"]
      ? itemMeta["EnemyLV"].split(",")
      : [0];
    const maxEnemyLevel = Math.max(...enemyLevelRange);
    const minEnemyLevel = Math.min(...enemyLevelRange);

    // Check if it's a dungeon map
    let isDungeonMap =
      itemMeta["OnSwitch"] &&
      itemMeta["OnSwitch"].split(",").map(Number).includes(207);

    // Build header text
    const locationType = isDungeonMap ? "ダンジョン" : "フィールド";
    const glossaryText = [];

    glossaryText.push(
      `${colorTaggedText(16, `＜${locationType}マップ情報＞`)}\n`
    );
    glossaryText.push(`${itemData.description}\n`);
    const enemyLv = colorTaggedText(16, `エネミーLV：`);
    const minLv = colorTaggedText(10, `${minEnemyLevel}`);
    const maxLv = colorTaggedText(10, `${maxEnemyLevel}`);
    glossaryText.push(`${enemyLv}${minLv}～${maxLv}　`);

    // Add element info
    glossaryText.push(`　　${colorTaggedText(16, `属性：`)}`);
    if (!enemyElementMetadata || Number(enemyElementMetadata) === 0) {
      glossaryText.push(`？？？`);
    } else {
      enemyElementArray.forEach((elem) => {
        const stateData = dataStates[Number(elem)];
        if (!stateData) return;
        glossaryText.push(`【\\C[13]${stateData.name}\\C[0]】　`);
      });
    }

    // Add annihilation count
    const annCount = gameVariables.value(257)[itemId];
    if (annCount >= 1) {
      const annihilated = colorTaggedText(16, `殲滅回数：`);
      const cnt = colorTaggedText(10, `${annCount}`);
      glossaryText.push(`${annihilated}${cnt}　\n`);
    } else {
      glossaryText.push(`\n`);
    }

    // Add first annihilation reward
    if (itemMeta["firstAnnihilationItem"] && annCount >= 1) {
      const firstAnnihilationItemArray =
        itemMeta["firstAnnihilationItem"].split(",");
      const itemType = Number(firstAnnihilationItemArray[0]);
      const rewardItems =
        itemType === 0
          ? dataItems
          : itemType === 1
            ? $dataWeapons
            : $dataArmors;
      const rewardItemName =
        rewardItems[Number(firstAnnihilationItemArray[1])].name;
      glossaryText.push(
        `${colorTaggedText(16, `初回殲滅報酬：`)}${colorTaggedText(10, `${rewardItemName}`)}　\n`
      );
    }

    // Add treasure chest info
    if (itemMeta["TchestOnly"] && gameVariables.value(212)[itemId] >= 1) {
      const treasureChestArray = itemMeta["TchestOnly"].split(",");
      const itemType = Number(treasureChestArray[3]);
      const treasureItems =
        itemType === 0
          ? dataItems
          : itemType === 1
            ? $dataWeapons
            : $dataArmors;
      const treasureItemName =
        treasureItems[Number(treasureChestArray[4])].name;
      glossaryText.push(
        `${colorTaggedText(16, `白箱：`)}${colorTaggedText(10, `${treasureItemName}`)}　\n`
      );
    }

    // Add unique materials
    glossaryText.push(Glossarytext1AddUniqueMaterials(itemMeta, dataItems));

    // Add enemy information
    glossaryText.push(`${colorTaggedText(16, `・出現エネミー`)}\n`);
    const enemyPopArray = [];

    // Collect enemy info
    for (let i = 1; i <= 8; i++) {
      if (!itemMeta["PopEnemy" + i]) continue;

      const enemyInfo = itemMeta["PopEnemy" + i].split(",");
      enemyPopArray.push(enemyInfo);

      glossaryText.push(`【\\C[2]${enemyInfo[1]}\\C[0]】`);
      if (i % 2 === 0) {
        glossaryText.push(`\n`);
      }
    }
    glossaryText.push(`\n`);

    // Process enemy data
    glossaryText.push(
      Glossarytext1ProcessEnemyData(
        enemyPopArray,
        dataEnemies,
        dataStates,
        itemMeta
      )
    );

    // Store result in variable
    gameVariables.value(variableId)[itemId] = glossaryText.join("");
  };

  // Helper function to process unique materials
  function Glossarytext1AddUniqueMaterials(itemMeta, dataItems) {
    const materialTextArray = [];
    let materialCount = 0;

    for (let i = 1; i <= 10; i++) {
      if (!itemMeta["UniqueMaterial" + i]) continue;

      if (materialCount === 0) {
        materialTextArray.push(`\n${colorTaggedText(16, `・希少採取素材`)}`);
      }

      const uniqueMaterialArray = itemMeta["UniqueMaterial" + i].split(",");
      if (uniqueMaterialArray[0] >= 1) {
        const materialItemName = dataItems[Number(uniqueMaterialArray[0])].name;
        materialTextArray.push(`【\\C[3]${materialItemName}\\C[0]】`);
        materialCount += 1;

        if (materialCount % 3 === 0) {
          materialTextArray.push(`\n`);
        }
      }
    }

    return materialTextArray.join("") + `\n`;
  }

  // Helper function to process enemy data
  function Glossarytext1ProcessEnemyData(
    enemyPopArray,
    dataEnemies,
    dataStates,
    itemMeta
  ) {
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
      if (baseEnemy.meta["Passive State"]) {
        const passiveStateArray = baseEnemy.meta["Passive State"].split(",");
        passiveStateArray.forEach((stateId) => {
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
    if (itemMeta["EnemySpecialState"]) {
      const specialStateArray = itemMeta["EnemySpecialState"].split(",");
      specialStateArray.forEach((stateId) => {
        const stateIdNum = Number(stateId);
        if (stateIdNum >= 1) {
          processedText.push(`${dataStates[stateIdNum].description}\n`);
        }
      });
    }

    // Process conditional states
    processedText.push(`\n`);
    let conditionStateCount = 0;

    for (let enemyId = 21; enemyId < 21 + stateCount; enemyId++) {
      const enemy = dataEnemies[enemyId];
      if (!enemy) continue;

      valueEnemyAddState.forEach((stateId) => {
        const state = dataStates[stateId];

        // Check name-based conditions
        if (state.meta["NameCondiAddState"]) {
          const nameConditions = state.meta["NameCondiAddState"].split(",");
          const nameMatch = nameConditions.some((cond) =>
            enemy.name.match(cond)
          );

          if (nameMatch && !processedStateNames.has(state.name)) {
            processedText.push(`【\\C[14]${state.name}\\C[0]】`);
            processedStateNames.add(state.name);
            conditionStateCount += 1;

            if (conditionStateCount % 3 === 0) {
              processedText.push(`\n`);
            }
          }
        }

        // Check graphic-based conditions
        if (state.meta["GraphicNameCondiAddState"]) {
          const graphicConditions =
            state.meta["GraphicNameCondiAddState"].split(",");
          const graphicMatch = graphicConditions.some((cond) =>
            enemy.battlerName.match(cond)
          );

          if (graphicMatch && !processedStateNames.has(state.name)) {
            processedText.push(`【\\C[14]${state.name}\\C[0]】`);
            processedStateNames.add(state.name);
            conditionStateCount += 1;

            if (conditionStateCount % 3 === 0) {
              processedText.push(`\n`);
            }
          }
        }
      });
    }

    return processedText.join("");
  }

  //図鑑のテキスト代入ボス分$gameVariables.value(305)[id]
  scene_Glossarytext2 = function (itemId, variableId) {
    const itemData = $dataItems[itemId];
    const glossaryText = [`${colorTaggedText(16, `＜ボス情報＞`)}\n`];

    if (itemData.meta["BossEnemy"]) {
      const bossInfo = itemData.meta["BossEnemy"].split(",");
      const bossName = bossInfo[1];
      const bossDefeated = $gameVariables.value(305)[itemId] >= 1;

      if (bossDefeated) {
        const bossLevel = Number(itemData.meta["BossLV"]);
        const defeatedCount = $gameVariables.value(305)[itemId];

        glossaryText.push(
          `${colorTaggedText(16, `名前：`)}${bossName}　ＬＶ：${bossLevel}　`
        );
        glossaryText.push(
          `${colorTaggedText(16, `討伐回数：`)}${colorTaggedText(10, `${defeatedCount}`)} \n`
        );

        const normalAttackId = Number(bossInfo[4]);
        const normalAttackSkill = $dataSkills[normalAttackId];
        glossaryText.push(
          `${colorTaggedText(16, `通常攻撃`)}\\I[${normalAttackSkill.iconIndex}]${normalAttackSkill.name} `
        );

        if (itemData.meta["BossAddAttack"]) {
          const additionalAttacks = itemData.meta["BossAddAttack"].split(",");

          for (let i = 0; i < additionalAttacks.length; i++) {
            const skillId = Number(additionalAttacks[i]);
            const attackSkill = $dataSkills[skillId];
            glossaryText.push(
              `\\I[${attackSkill.iconIndex}]${attackSkill.name} `
            );
          }
        }

        glossaryText.push(`\n`);

        const abilityId = Number(bossInfo[5]);
        const abilitySkill = $dataSkills[abilityId];
        glossaryText.push(
          `${colorTaggedText(16, `アビリティ`)}\\I[${abilitySkill.iconIndex}]${abilitySkill.name}\n`
        );

        let abilityDescription = abilitySkill.description;
        abilityDescription = abilityDescription.replace(
          "[\\C[2]戦闘中1回\\C[0]]",
          ""
        );
        glossaryText.push(`${abilityDescription}\n`);

        if (itemData.meta["BossAddSkill"]) {
          const additionalSkills = itemData.meta["BossAddSkill"].split(",");

          for (let i = 0; i < additionalSkills.length; i++) {
            const skillId = Number(additionalSkills[i]);
            const skill = $dataSkills[skillId];
            glossaryText.push(`\\I[${skill.iconIndex}]${skill.name}\n`);
          }
        }

        const ultimateId = Number(bossInfo[6]);
        const ultimateSkill = $dataSkills[ultimateId];
        glossaryText.push(
          `${colorTaggedText(16, `奥義`)}\\I[${ultimateSkill.iconIndex}]${ultimateSkill.name}\n`
        );

        let ultimateDescription = ultimateSkill.description;
        ultimateDescription = ultimateDescription.replace(
          "[\\C[2]戦闘中1回\\C[0]]",
          ""
        );
        glossaryText.push(`${ultimateDescription}\n`);

        if (itemData.meta["BossStateInformation"]) {
          glossaryText.push(`\n`);
          const stateInfos = itemData.meta["BossStateInformation"].split(",");

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

    $gameVariables.value(variableId)[itemId] = glossaryText.join("");
  };

  //図鑑のテキスト代入ボス特殊行動
  scene_Glossarytext3 = function (itemId, variableId) {
    const glossaryText = [];
    const itemData = $dataItems[itemId];
    let specialActionCount = 0;

    glossaryText.push(`${colorTaggedText(16, `＜ボス特殊行動一覧＞`)}\n`);

    // If boss hasn't been defeated yet, show placeholder text
    if ($gameVariables.value(305)[itemId] < 1) {
      glossaryText.push(`情報なし。討伐後に情報更新。`);
      $gameVariables.value(variableId)[itemId] = glossaryText.join("");
      return;
    }

    // Process all possible special actions
    for (let actionIndex = 1; actionIndex <= 15; actionIndex++) {
      const metaKey = "BossSpecialAction" + actionIndex;
      if (!itemData.meta[metaKey]) continue;

      specialActionCount++;
      const actionData = itemData.meta[metaKey].split(",");
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

    $gameVariables.value(variableId)[itemId] = glossaryText.join("");
  };

  // Helper function to get trigger text based on type and value
  function getTriggerText(triggerType, triggerValue) {
    switch (triggerType) {
      case 0:
      case 9:
        const effectAmount = colorTaggedText(2, `HP${triggerValue}%`);
        return `<${effectAmount}以下で発動>\n`;
      case 1:
        const effectAmount2 = colorTaggedText(2, `MP${triggerValue}%`);
        return `<${effectAmount2}以下で発動>\n`;
      case 2:
        const effectAmount3 = colorTaggedText(2, `${triggerValue}%`);
        return `<${effectAmount3}ターン毎に発動>\n`;
      case 3:
        const effectName = colorTaggedText(2, `オーバードライブ`);
        return `<${effectName}時に発動>\n`;
      default:
        const effectName2 = colorTaggedText(2, `特殊条件`);
        return `<${effectName2}で発動>\n`;
    }
  }

  //マップ情報を代入
  const jouhouMapResetVariableIds = [
    37, 81, 82, 197, 207, 222, 224, 226, 227, 232, 230, 235, 236, 240, 241, 251,
    256, 260, 266, 329, 507, 508
  ];
  jouhou_map = function () {
    // Run on every map loading

    const gameVariables = $gameVariables;
    const gameSwitches = $gameSwitches;
    const dataMap = $dataMap;

    // Reset map-related switches and variables
    for (let i = 201; i <= 377; i++) {
      gameSwitches.setValue(i, false);
    }

    jouhouMapResetVariableIds.forEach((varId) => {
      gameVariables.setValue(varId, 0);
    });

    // Process conditional map switches
    const conditionalMapSwitches = gameVariables.value(356);
    const foundMapSwitch = processMapConditionalSwitches(
      dataMap,
      gameSwitches,
      gameVariables,
      conditionalMapSwitches
    );

    // Apply default map switches if no conditions matched
    if (foundMapSwitch === 0 && dataMap.meta["MapSwi"]) {
      const switchIds = dataMap.meta["MapSwi"].split(",").map(Number);
      switchIds.forEach((switchId) => {
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
    const mapInfo = determineMapInfoSource(
      dataMap,
      gameVariables,
      gameSwitches
    );

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
    setupMapBattlebacksAndParallax(
      mapInfo,
      dataMap,
      gameVariables,
      gameSwitches,
      $gameMap
    );

    // Configure BGS and BGM
    setupMapBackgroundAudio(mapInfo, dataMap, gameVariables, gameSwitches);
  };

  // Helper Functions

  processMapConditionalSwitches = function (
    dataMap,
    gameSwitches,
    gameVariables,
    conditionalMapSwitches
  ) {
    let foundMapSwitch = 0;
    const dataMapMeta = dataMap.meta;

    // Check variable-based conditional switches
    for (let i = 9; i > 0; i--) {
      const varKey = "ChangeMapVal" + i;
      const switchKey = "MapSwiCVal" + i;

      if (!dataMapMeta[varKey] || !dataMapMeta[switchKey]) continue;

      const [varId, varValue] = dataMapMeta[varKey].split(",").map(Number);
      if (gameVariables.value(varId) < varValue) continue;

      mapActivateConditionalSwitches(
        dataMapMeta[switchKey],
        gameSwitches,
        conditionalMapSwitches
      );
      foundMapSwitch = 1;
      break;
    }

    // Check switch-based conditional switches if no variable conditions matched
    if (foundMapSwitch === 0) {
      for (let i = 9; i > 0; i--) {
        const switchCondKey = "ChangeMapSwi" + i;
        const targetSwitchKey = "MapSwiCSwi" + i;

        if (!dataMapMeta[switchCondKey] || !dataMapMeta[targetSwitchKey])
          continue;

        const condSwitchId = Number(dataMapMeta[switchCondKey]);
        if (!gameSwitches.value(condSwitchId)) continue;

        mapActivateConditionalSwitches(
          dataMapMeta[targetSwitchKey],
          gameSwitches,
          conditionalMapSwitches
        );
        foundMapSwitch = 1;
        break;
      }
    }

    return foundMapSwitch;
  };

  mapActivateConditionalSwitches = function (
    switchIdString,
    gameSwitches,
    conditionalMapSwitches
  ) {
    const switchIds = switchIdString.split(",").map(Number);

    switchIds.forEach((switchId) => {
      if (switchId === 0) return;

      gameSwitches.setValue(switchId, true);

      if (conditionalMapSwitches[switchId] !== 0) {
        conditionalMapSwitches[switchId] = 1;
      }
    });
  };

  extractMapMetadata = function (dataMap) {
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

    if (dataMapMeta["OutIn_Froor"]) {
      const [type, value] = dataMapMeta["OutIn_Froor"].split(",").map(Number);
      mapMeta.outInFloorType = type;
      mapMeta.outInFloorValue = value;
    }

    if (dataMapMeta["NPC"]) mapMeta.npcType = Number(dataMapMeta["NPC"]);
    if (dataMapMeta["Home"]) mapMeta.homeType = Number(dataMapMeta["Home"]);
    if (dataMapMeta["Animal"])
      mapMeta.animalType = Number(dataMapMeta["Animal"]);

    return mapMeta;
  };

  setMapTypeSwitches = function (mapMeta, gameSwitches, gameVariables) {
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

  setMapLocationInfo = function (gameSwitches, gameVariables) {
    // Check town locations
    const dataWeapons = $dataWeapons;
    valueJouhouTown.forEach((weaponId) => {
      const switchId = Number(dataWeapons[weaponId].meta["MapSwitch"]);
      if (gameSwitches.value(switchId)) {
        gameVariables.setValue(230, weaponId);
        gameSwitches.setValue(202, true);
      }
    });

    // Check battle map locations
    const dataItems = $dataItems;
    valueJouhouBattleMap.forEach((itemId) => {
      const switchId = Number(dataItems[itemId].meta["MapSwitch"]);
      if (gameSwitches.value(switchId)) {
        gameVariables.setValue(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID, itemId);
        gameSwitches.setValue(GAME_SWITCH.BATTLE_MAP, true);
      }
    });
  };

  determineMapInfoSource = function (dataMap, gameVariables, gameSwitches) {
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
    if (gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID) >= 1) {
      const battleMapId = gameVariables.value(
        GAME_VARIABLE.DUNGEON_INFO_ITEM_ID
      );
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

  mapPlayStartSoundEffect = function (mapInfo, gameSwitches) {
    const seKey = gameSwitches.value(GAME_SWITCH.NIGHT)
      ? "StartSeN"
      : "StartSe";

    if (!mapInfo.meta[seKey]) return;

    const [seName, seVolume, sePitch] = mapInfo.meta[seKey].split(",");
    AudioManager.playSe({
      name: seName,
      volume: Number(seVolume),
      pitch: Number(sePitch),
      pan: 0
    });
  };

  setupMapEnemyVariables = function (mapInfo, gameVariables) {
    // Cache map meta data
    const mapInfoMeta = mapInfo.meta;

    // Initialize special state array
    gameVariables.setValue(GAME_VARIABLE.MAP_ENEMY_SPECIAL_STATES, []);
    const specialStates = gameVariables.value(
      GAME_VARIABLE.MAP_ENEMY_SPECIAL_STATES
    );

    // Add enemy special states if available
    if (mapInfoMeta["EnemySpecialState"]) {
      const stateIds = mapInfoMeta["EnemySpecialState"].split(",").map(Number);
      stateIds.forEach((stateId) => {
        if (stateId >= 1) {
          specialStates.push(stateId);
        }
      });
    }

    // Set various map-specific variables
    if (mapInfoMeta["getWaterItem"]) {
      gameVariables.setValue(266, Number(mapInfoMeta["getWaterItem"]));
    }

    if (mapInfoMeta["weatherSetP"]) {
      gameVariables.setValue(256, Number(mapInfoMeta["weatherSetP"]));
    }

    const weatherKey = "weatherSetPN";
    if (mapInfoMeta[weatherKey]) {
      gameVariables.setValue(251, Number(mapInfoMeta[weatherKey]));
    } else if ($dataMap.meta[weatherKey]) {
      gameVariables.setValue(251, Number($dataMap.meta[weatherKey]));
    }

    applyNumericMetadataVariables(mapInfoMeta, gameVariables, [
      ["MapCount", 217],
      ["MapEnemyMaxPop", 334],
      ["MapEnemyPopC", 224],
      ["MapEnemyPopCH", 227],
      ["HEnemyPopSwi", 236],
      ["DeadBody", 260]
    ]);
    // Set enemy level variable
    if (mapInfoMeta["EnemyLV"]) {
      gameVariables.setValue(270, Number(mapInfoMeta["EnemyLV"].split(",")[0]));
    }

    // Set switches from OnSwitch metadata
    const gameSwitches = $gameSwitches;
    if (mapInfoMeta["OnSwitch"]) {
      const switchIds = mapInfoMeta["OnSwitch"].split(",").map(Number);
      switchIds.forEach((switchId) => {
        if (switchId >= 1) {
          gameSwitches.setValue(switchId, true);
        }
      });
    }
  };

  setupMapPositions = function (mapInfo, gameVariables) {
    const mapInfoMeta = mapInfo.meta;
    const positions = gameVariables.value(204);

    // Set escape position
    if (mapInfoMeta["EscapeMapID"]) {
      const [mapId, x, y] = mapInfoMeta["EscapeMapID"].split(",").map(Number);
      positions[0] = mapId;
      positions[1] = x;
      positions[2] = y;
    }

    // Set move position
    if (mapInfoMeta["MoveMapID"]) {
      const [mapId, x, y] = mapInfoMeta["MoveMapID"].split(",").map(Number);
      positions[0] = mapId;
      positions[1] = x;
      positions[2] = y;
    }

    // Set permission cloth
    const clothKey = "PermissionCloth";
    if (mapInfoMeta[clothKey]) {
      gameVariables.setValue(207, Number(mapInfoMeta[clothKey]));
    } else if ($dataMap.meta[clothKey]) {
      gameVariables.setValue(207, Number($dataMap.meta[clothKey]));
    }
  };

  setupUniqueMaterials = function (mapInfo, gameVariables) {
    // Initialize unique material slots array
    gameVariables.setValue(259, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    const mapInfoMeta = mapInfo.meta;
    // Process unique materials and backgrounds
    for (let idx = 1; idx <= 9; idx++) {
      // Preload background images
      if (mapInfoMeta["BG" + idx]) {
        Galv.CACHE.load("parallaxes", mapInfoMeta["BG" + idx].split(",")[0]);
      }

      if (mapInfoMeta["BGN" + idx]) {
        Galv.CACHE.load("parallaxes", mapInfoMeta["BGN" + idx].split(",")[0]);
      }

      // Set unique material IDs
      if (mapInfoMeta["UniqueMaterial" + idx]) {
        const materialId = Number(
          mapInfoMeta["UniqueMaterial" + idx].split(",")[0]
        );
        gameVariables.value(259)[idx] = materialId;
      }
    }
  };

  setupMapEnemiesAndBoss = function (mapInfo) {
    // Setup enemies if defined
    if (mapInfo.meta["PopEnemy1"] || mapInfo.meta["PopEnemy9"]) {
      popEnemy_setUp(mapInfo);
      enemy_troopPush();
      henemy_troopPush();
    }

    // Setup boss if defined
    if (mapInfo.meta["BossEnemy"]) {
      boss_setup1(1, 0);
    }
  };

  setupMapBattlebacksAndParallax = function (
    mapInfo,
    dataMap,
    gameVariables,
    gameSwitches,
    gameMap
  ) {
    const backgrounds = configureMapEnvironmentBattlebacks(
      mapInfo.meta,
      gameVariables,
      gameSwitches,
      gameMap
    );
    if (backgrounds.backgroundKey)
      setMapBgVariables(gameVariables, mapInfo, backgrounds.backgroundKey);
    parallaxesSound_switchChange(1);
    applyMapBackgroundOverrides(
      dataMap,
      backgrounds,
      gameVariables,
      gameSwitches,
      gameMap
    );
    applyMapMetadataParallax(dataMap.meta, gameVariables, gameMap);
  };

  setupMapBackgroundAudio = function (
    mapInfo,
    dataMap,
    gameVariables,
    gameSwitches
  ) {
    // Set up BGS (background sound)
    const bgsKey = gameSwitches.value(GAME_SWITCH.NIGHT) ? "BGSN" : "BGS";
    let currentMapInfo = determineAudioMapInfoSource(
      mapInfo,
      dataMap,
      gameVariables,
      bgsKey
    );

    if (currentMapInfo.meta[bgsKey]) {
      const [bgsName, bgsVolume, bgsPitch, bgsPan] =
        currentMapInfo.meta[bgsKey].split(",");

      if (bgsName !== valueMapBGS[0]) {
        valueMapBGS = [
          bgsName,
          Number(bgsVolume),
          Number(bgsPitch),
          Number(bgsPan)
        ];

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
    const bgmKey = gameSwitches.value(GAME_SWITCH.NIGHT) ? "BGMN" : "BGM";
    currentMapInfo = determineAudioMapInfoSource(
      mapInfo,
      dataMap,
      gameVariables,
      bgmKey
    );

    if (currentMapInfo.meta[bgmKey]) {
      const [bgmName, bgmVolume, bgmPitch, bgmPan] =
        currentMapInfo.meta[bgmKey].split(",");
      valueMapBGM = [
        bgmName,
        Number(bgmVolume),
        Number(bgmPitch),
        Number(bgmPan)
      ];

      parallaxesSound_switchChange(2);

      if (!gameSwitches.value(124)) {
        if (bgmName === "NoMusic") {
          AudioManager.fadeOutBgm(10);
        } else if (AudioManager.saveBgm().name !== bgmName) {
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

  determineAudioMapInfoSource = function (
    mapInfo,
    dataMap,
    gameVariables,
    metaKey
  ) {
    // Reset to base map info
    let currentMapInfo = mapInfo;

    // Check if battle map info should be used
    if (gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID) >= 1) {
      currentMapInfo =
        $dataItems[gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID)];
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
      const bgMeta = mapInfo.meta[bgKey].split(",");
      gameVariables.setValue(GAME_VARIABLE.MENU_BACKGROUND_NAME, bgMeta[0]);
      gameVariables.setValue(81, Number(bgMeta[1]));
      gameVariables.setValue(82, Number(bgMeta[2]));
    }
  };

  //スイッチに応じて遠景と音楽設定スクリプト
  //スイッチID -> メニュー背景名(parallaxesSound_switchChange用)
  const PARALLAX_BG_BY_SWITCH_ID = [
    { switchId: 233, backgroundName: "BG_Temple" },
    { switchId: 234, backgroundName: "BG_Shop1Items" },
    { switchId: 235, backgroundName: "BG_Shop3Weapons" },
    { switchId: 237, backgroundName: "BG_Shop3Weapons" }
  ];

  parallaxesSound_switchChange = function (switchStateId) {
    switch (switchStateId) {
      case 2:
        if ($gameSwitches.value(233)) {
          //結果を渡すためにverは付けない
          if (!$gameSwitches.value(GAME_SWITCH.NIGHT)) {
            valueMapBGM = ["41_TownTemple", 50, 100, 0];
          }
        }
        if ($gameSwitches.value(237)) {
          if (!$gameSwitches.value(GAME_SWITCH.NIGHT)) {
            valueMapBGM = ["41_Guild", 50, 100, 0];
          }
        }
        break;
      case 1:
        for (const bgmEntry of PARALLAX_BG_BY_SWITCH_ID) {
          if (!$gameSwitches.value(bgmEntry.switchId)) continue;

          $gameVariables.setValue(
            GAME_VARIABLE.MENU_BACKGROUND_NAME,
            bgmEntry.backgroundName
          );
          $gameVariables.setValue(81, 0);
          $gameVariables.setValue(82, 0);
          if ($gameSwitches.value(GAME_SWITCH.NIGHT)) {
            $gameVariables.setValue(
              GAME_VARIABLE.MENU_BACKGROUND_NAME,
              $gameVariables.value(GAME_VARIABLE.MENU_BACKGROUND_NAME) + "N"
            );
          }
        }
        break;
    }
  };

  //雑魚エネミー設定スクリプト
  popEnemy_setUp = function (mapInfo) {
    const gameVariables = $gameVariables;
    const normalEnemyIds = [];
    const hEnemyIds = [];
    const rareEnemyIds = [];
    const enemyPresetStates = Array.from({ length: 11 }, () => []);
    gameVariables.setValue(220, normalEnemyIds);
    gameVariables.setValue(228, hEnemyIds);
    gameVariables.setValue(242, rareEnemyIds);
    gameVariables.setValue(
      GAME_VARIABLE.ENEMY_PRESET_STATES,
      enemyPresetStates
    );
    if (!mapInfo || !mapInfo.meta) return;
    for (let spawnSlot = 1; spawnSlot <= 10; spawnSlot++) {
      const spawnDefinition = mapInfo.meta["PopEnemy" + spawnSlot];
      if (!spawnDefinition) continue;
      const spawnValues = spawnDefinition.split(",");
      const sourceEnemy = $dataEnemies[Number(spawnValues[0])];
      if (!sourceEnemy) continue;
      const enemyId = 20 + spawnSlot;
      const enemyData = copyEnemySpawnData(sourceEnemy);
      $dataEnemies[enemyId] = enemyData;
      configureMapEnemySpawnData(enemyData, spawnValues);
      const addedStateIds = enemyPresetStates[spawnSlot];
      appendEnemyNameConditionStates(enemyData, addedStateIds);
      switch (spawnSlot) {
        case 9:
          hEnemyIds.push(enemyId);
          break;
        case 7:
        case 8:
          rareEnemyIds.push(enemyId);
          addedStateIds.push(480);
          break;
        default:
          normalEnemyIds.push(enemyId);
          break;
      }
    }
  };

  //簡易戦闘報酬設定スクリプト
  actor1_setup1 = function (mapInfo, enemyLevel) {
    const actor20 = $gameActors.actor(20);
    if (!actor20) return;
    actor20.addState(610);
    if (!mapInfo || !mapInfo.meta) return;
    let stateIdValues = [];
    for (let j = 1; j <= 10; j++) {
      if (mapInfo.meta["PopEnemy" + j]) {
        stateIdValues.push(Number(mapInfo.meta["PopEnemy" + j].split(",")[0]));
      }
    }
    let enemyId = stateIdValues[getRandomIndex(stateIdValues.length)];
    const enemyData = $dataEnemies[enemyId];
    if (!enemyData) return;
    const passiveStateIds = [];
    if (enemyData.meta["Passive State"]) {
      stateIdValues = enemyData.meta["Passive State"].split(",");
      for (
        let stateIndex = 0;
        stateIndex < stateIdValues.length;
        stateIndex++
      ) {
        passiveStateIds.push(Number(stateIdValues[stateIndex]));
      }
    }

    if (passiveStateIds != 0) {
      for (let j = 0; j < passiveStateIds.length; j++) {
        actor20.addState(passiveStateIds[j]);
      }
    }
    const enemyPresetStates = $gameVariables.value(
      GAME_VARIABLE.ENEMY_PRESET_STATES
    );
    if (Array.isArray(enemyPresetStates)) {
      const firstEnemyPresetStates = enemyPresetStates[1] || [];
      for (let i = 0; i <= firstEnemyPresetStates.length - 1; i++) {
        if (firstEnemyPresetStates[i] >= 1) {
          actor20.addState(firstEnemyPresetStates[i]);
        }
      }
      const secondEnemyPresetStates = enemyPresetStates[2] || [];
      for (let i = 0; i <= secondEnemyPresetStates.length - 1; i++) {
        if (secondEnemyPresetStates[i] >= 1) {
          actor20.addState(secondEnemyPresetStates[i]);
        }
      }
    }
    const mapEnemySpecialStates = $gameVariables.value(
      GAME_VARIABLE.MAP_ENEMY_SPECIAL_STATES
    );
    if (mapEnemySpecialStates) {
      for (let i = 0; i < mapEnemySpecialStates.length; i++) {
        let stateId = mapEnemySpecialStates[i];
        if (stateId == 885) {
          let stateIdMult = 11;
          if (enemyLevel >= 30 && enemyLevel <= 60) stateIdMult = 21;
          else if (enemyLevel >= 61) stateIdMult = 31;

          stateId = getRandomIndex(stateIdMult) + 885;
          actor20.addState(stateId);
        } else {
          actor20.addState(stateId);
        }
      }
    }
    if (mapInfo.meta["EnemyElement"]) {
      const enemyElementValues = mapInfo.meta["EnemyElement"].split(",");
      const stateId = Number(
        enemyElementValues[getRandomIndex(enemyElementValues.length)]
      );
      actor20.addState(stateId);
    }
    //console.log($gameActors.actor(20));
  };

  //ボス設定スクリプト
  boss_setup1 = function (bossConfigId, bossEnemyId) {
    if (bossConfigId != 1 && bossConfigId != 2) return;
    $gameSwitches.setValue(GAME_SWITCH.DIRECT_ENEMY_BOSS, false);
    var bossEnemyValues = 0;
    $gameVariables.setValue(303, 0);
    $gameVariables.setValue(
      GAME_VARIABLE.BOSS_GUARANTEED_DROPS,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    );
    $gameVariables.setValue(
      GAME_VARIABLE.BOSS_ACTIONS,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    );
    $gameVariables.setValue(
      GAME_VARIABLE.BOSS_SPECIAL_ACTIONS,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    );
    const bossActionValues = $gameVariables.value(GAME_VARIABLE.BOSS_ACTIONS);
    const bossSpecialActionValues = $gameVariables.value(
      GAME_VARIABLE.BOSS_SPECIAL_ACTIONS
    );
    //ボス行動は変数346に配列で設定する。
    //特殊行動は347に2次配列
    switch (numericCaseValue(bossConfigId)) {
      case 1:
        {
          const dungeonInfoItemId = $gameVariables.value(
            GAME_VARIABLE.DUNGEON_INFO_ITEM_ID
          );
          value = $dataItems[dungeonInfoItemId];
          valueBossEnemyId = dungeonInfoItemId;
        }
        break;
      case 2:
        {
          value = $dataEnemies[bossEnemyId];
          $gameSwitches.setValue(GAME_SWITCH.DIRECT_ENEMY_BOSS, true);
          valueBossEnemyId = bossEnemyId;
        }
        break;
    }
    if (!value || !value.meta) return;
    const bossMeta = value.meta;
    configureBossGuaranteedDrops(bossMeta);
    if (bossMeta["BossEnemy"]) {
      var bossEnemyValues = bossMeta["BossEnemy"].split(",");
    }
    if (bossEnemyValues != 0) {
      if (bossConfigId == 2) {
        $gameVariables.setValue(303, bossEnemyId);
      } else {
        $gameVariables.setValue(303, Number(bossEnemyValues[0]));
      }
      const bossEnemySource = $dataEnemies[$gameVariables.value(303)];
      if (!bossEnemySource) return;
      $dataEnemies[valueBossEnemiesId] = copyEnemySpawnData(bossEnemySource);
      var bossEnemyData = $dataEnemies[valueBossEnemiesId];
      configureBossActionData(
        bossEnemyData,
        bossMeta,
        bossEnemyValues,
        bossActionValues,
        bossSpecialActionValues
      );
      configureBossActionDisplay(
        bossConfigId,
        bossActionValues,
        bossSpecialActionValues
      );
      if (bossMeta["FrontBoss"]) {
        $dataSystem.optSideView = false;
      }
      configureBossTroop(bossMeta, bossEnemyData, bossEnemyValues);
    }
    if (!bossEnemyData) return; //'<BossEnemy>'未有時の下部処理回避
    applyBossInformationStates.call(this, bossMeta, bossEnemyData);
  };

  //戦闘グループでボスステ付与
  troop_bossState = function () {
    if ($gameSwitches.value(211)) {
      const members2 = $gameTroop.members();
      var enemy = members2[0];
      enemy.addState(410);
      //エネミー隊列変更
      var start = 0;
      var end = members2.length - 1;
      for (var i = start; i <= end; i++) {
        var troopX = $gameTroop.getX(i + 1);
        if (troopX <= 200) {
          members2[i].setRow(2);
        }
      }
      //獲得戦果
      if (enemy.isStateAffected(410)) {
        //ボスステートで戦果
        var dropItemId = 10;
        var dropCount = getRandomIndex(10) + 1;
        if (enemy.isStateAffected(411)) {
          dropCount += getRandomIndex(10) + 1;
        }
        if (enemy.isStateAffected(412)) {
          dropCount += getRandomIndex(20) + 10;
        }
        if (enemy.isStateAffected(413)) {
          dropCount += getRandomIndex(30) + 20;
        }
        if (enemy.isStateAffected(414)) {
          dropCount += getRandomIndex(100) + 1;
        }
        for (var j = 0; j <= dropCount; j++) {
          $gameTroop.addDropItem($dataItems[dropItemId]);
        }
      }
    }
  };

  //ヒント種別(EICSwitch値)ごとの見出し。CommonEvent 178の設計に合わせた
  //定義。分岐(switch)で持つと、実際には呼ばれない種別が到達不能なcaseと
  //して残るため、表として持つ。
  const HINT_TYPE_HEADERS = {
    102: `未発生挿話`,
    103: `未発生シーン`,
    104: `未回収タイトル`,
    105: `未回収Ｈタイトル`,
    108: `未発生クエスト`
  };

  //代入して全般ヒントとして作成
  hint1_zenpan = function (hintTypeId) {
    //呼び出し元(CommonEvent 178)は$gameVariables.value(19)を渡す。変数に
    //入っているのが数値とは限らないので、比較が崩れないように数値化する。
    const hintType = Number(hintTypeId);

    const uncollectedHeader = `${HINT_TYPE_HEADERS[hintType] || "　"}\n`;
    window["valueWordSet" + valueCountSet2] = uncollectedHeader;

    valueCountSet1 = 0;
    valueCountSet2 = 1;
    const max = $dataItems.length - 1;
    for (var itemId = 1; itemId < max; itemId++) {
      const item = $dataItems[itemId];
      if (!item.meta["EICSwitch"]) {
        continue;
      }
      if (
        Number(item.meta["EICSwitch"]) !== hintType ||
        $gameParty.hasItem(item)
      ) {
        continue;
      }

      var hintLineText = `\\C[2]${item.name}\\C[0]\n${item.description}\n`;
      window["valueWordSet" + valueCountSet2] += hintLineText;
      valueCountSet1 += 1;
      if (valueCountSet1 % 6 == 0) {
        valueCountSet2 += 1;
        window["valueWordSet" + valueCountSet2] = uncollectedHeader;
      }
    }
  };

  //怒りのツッコミ演出
  ensyutu_ikari = function (effectDurationFrames, seName) {
    const shakePower = getRandomIndex(3) + 6;
    $gameScreen.startShake(shakePower, shakePower, effectDurationFrames);
    const sePitch = getRandomIndex(41) + 80;
    AudioManager.playSe({ name: seName, volume: 90, pitch: sePitch, pan: 0 });
    var flashColor = [255, 255, 255];
    if (seName == "Explosion2") {
      var flashColor = [255, 50, 50];
    }
    const flashColorAlpha = getRandomIndex(41) + 150;
    $gameScreen.startFlash(
      [flashColor[0], flashColor[1], flashColor[2], flashColorAlpha],
      effectDurationFrames
    );
  };

  //オブジェクト探知(79)とトラップ視認(135)が表示するアイコンのメタ。
  //1つのイベントが両方のメタを持つことがあるので、まとめて扱う。
  const EVENT_ICON_METAS = [
    { meta: "IconDisplay", switchId: 79 },
    { meta: "TrapDisplay", switchId: 135 }
  ];

  //オブジェクト探知とトラップ視認実行
  search_object = function () {
    //IDの上限(100/200)で打ち切ると、それを超えるIDのイベントを取りこぼす
    //(Map003は247イベントあり、生成イベントはさらに大きいIDを取る)。
    //実在するイベントをそのまま回す。
    for (const event of $gameMap.events()) {
      const eventData = event.event();
      if (!eventData) {
        continue;
      }
      if ($gameSelfSwitches.value([$gameMap.mapId(), event.eventId(), "B"])) {
        continue;
      }

      //メタごとにスイッチを見てアイコンを反映する。片方のメタのスイッチが
      //OFFというだけで、もう片方が表示したアイコンまで消してしまわない
      //ように、表示したものが1つも無いときだけ消去する。
      let iconMetaFound = false;
      let iconShown = false;
      for (const iconDefinition of EVENT_ICON_METAS) {
        const eventMeta = eventData.meta[iconDefinition.meta];
        if (!eventMeta) continue;
        iconMetaFound = true;
        if (!$gameSwitches.value(iconDefinition.switchId)) continue;
        event.setIconOnEvent(Number(eventMeta));
        iconShown = true;
      }
      if (iconMetaFound && !iconShown) {
        event.clearIconOnEvent();
      }
    }
  };

  //タイトル入手
  item_titleget = function (unusedArg1, unusedArg2) {
    const achievementRecords = collectTitleAchievementRecords();
    const items = $dataItems;
    for (let itemId = 1; itemId < items.length; itemId++) {
      const item = items[itemId];
      if (!item || !item.meta.EICSwitch) continue;
      const titleCategoryId = Number(item.meta.EICSwitch);
      if (titleCategoryId !== 104 && titleCategoryId !== 105) continue;
      if (item.name === "" || $gameParty.hasItem(item)) continue;
      const result = evaluateTitleCandidate(item, achievementRecords);
      if (!result.eligible) continue;
      applyTitleAward(item, itemId, result.actorId);
      break;
    }
  };

  //戦闘マップ殲滅回数による称号獲得
  title_battleMapannihilation = function () {
    const gameVar257 = $gameVariables.value(257);
    for (var itemId = 1; itemId <= $dataItems.length - 1; itemId++) {
      const item = $dataItems[itemId];
      if (item.meta["annihilationTitle"]) {
        if (!$gameParty.hasItem(item, true)) {
          var annihilationTitleValues =
            item.meta["annihilationTitle"].split(",");
          if (Number(annihilationTitleValues[0]) >= 20) {
            if (gameVar257[Number(annihilationTitleValues[0])] >= 1) {
              $gameVariables.setValue(GAME_VARIABLE.PROCESSED_ITEM_ID, itemId);
            }
          }
          if (Number(annihilationTitleValues[0]) == 1) {
            var annihilationCount = 0;
            for (var itemId2 = 1; itemId2 <= 100; itemId2++) {
              annihilationCount += gameVar257[itemId2];
            }
            if (annihilationCount >= Number(annihilationTitleValues[1])) {
              $gameVariables.setValue(GAME_VARIABLE.PROCESSED_ITEM_ID, itemId);
            }
          }
          if (Number(annihilationTitleValues[0]) == 2) {
            var annihilationCount = 0;
            for (var itemId2 = 1; itemId2 <= 100; itemId2++) {
              const itemJ = $dataItems[itemId2];
              if (!itemJ.meta["OnSwitch"]) {
                continue;
              }
              var onSwitchValues = itemJ.meta["OnSwitch"].split(",");
              for (
                var switchIndex = 0;
                switchIndex <= onSwitchValues.length - 1;
                switchIndex++
              ) {
                if (!(Number(onSwitchValues[switchIndex]) == 207)) continue;

                annihilationCount += gameVar257[itemId2];
                break;
              }
            }
            if (annihilationCount >= Number(annihilationTitleValues[1])) {
              $gameVariables.setValue(GAME_VARIABLE.PROCESSED_ITEM_ID, itemId);
              $gameParty.gainItem(item, 1);
            }
          }
        }
      }
    }
    if (
      $gameParty.hasItem(
        $dataItems[$gameVariables.value(GAME_VARIABLE.PROCESSED_ITEM_ID)],
        true
      )
    ) {
      $gameVariables.setValue(GAME_VARIABLE.PROCESSED_ITEM_ID, 0);
    }
  };

  //曜日変更と日数経過時の処理
  weeks_toggleOther = function () {
    let start = $gameVariables.value(73);
    let end = $gameVariables.value(74);
    for (var i = start; i <= end; i++) {
      $gameVariables.value(i + 380)[46] = 0;
    } //直前のＨＣＧ
    const list = valueOneDayLimitItem;
    list.forEach(function (id) {
      const itemData = $dataItems[id];
      if (itemData.meta.SkillCostToday) {
        $gameParty.gainItem(itemData, 1);
      }
    }, this);
    $gameVariables.setValue(
      GAME_VARIABLE.ELAPSED_DAYS,
      $gameVariables.value(GAME_VARIABLE.ELAPSED_DAYS) + 1
    ); //経過日数
    if ($gameParty.loseGoldSum > $gameVariables.value(341)) {
      const goldCalc = $gameParty.loseGoldSum - $gameVariables.value(341);
      const gold = `\\C[2]${goldCalc.toLocaleString()}\\C[0]\n`;
      $gameVariables.setValue(
        GAME_VARIABLE.DAY_END_INFO_TEXT,
        $gameVariables.value(GAME_VARIABLE.DAY_END_INFO_TEXT) +
          `本日消費\\G:${gold}\n`
      );
      $gameVariables.setValue(
        GAME_VARIABLE.DAY_END_INFO_LINE_COUNT,
        $gameVariables.value(GAME_VARIABLE.DAY_END_INFO_LINE_COUNT) + 1
      );
    }
    if ($gameParty.gainGoldSum > $gameVariables.value(342)) {
      const goldCalc = $gameParty.gainGoldSum - $gameVariables.value(342);
      const gold = `\\C[2]${goldCalc.toLocaleString()}\\C[0]\n`;
      $gameVariables.setValue(
        GAME_VARIABLE.DAY_END_INFO_TEXT,
        $gameVariables.value(GAME_VARIABLE.DAY_END_INFO_TEXT) +
          `本日獲得\\G:${gold}\n`
      );
      $gameVariables.setValue(
        GAME_VARIABLE.DAY_END_INFO_LINE_COUNT,
        $gameVariables.value(GAME_VARIABLE.DAY_END_INFO_LINE_COUNT) + 1
      );
    }
    $gameVariables.setValue(341, $gameParty.loseGoldSum); //一日の消費金額
    $gameVariables.setValue(342, $gameParty.gainGoldSum); //一日の獲得金額
    let levelUpActorCount = 0;
    start = $gameVariables.value(GAME_VARIABLE.FIRST_DEPLOYED_ACTOR_ID);
    end = $gameVariables.value(GAME_VARIABLE.LAST_DEPLOYED_ACTOR_ID);
    for (let actorId = start; actorId <= end; actorId++) {
      const actor = $gameActors.actor(actorId);
      if (actor.currentExp() > $gameVariables.value(actorId + 380)[65]) {
        const expCalc =
          actor.currentExp() - $gameVariables.value(actorId + 380)[65];
        const exp = `\\C[2]${expCalc.toLocaleString()}\\C[0]　`;
        const actorName = actor.name();
        $gameVariables.setValue(
          GAME_VARIABLE.DAY_END_INFO_TEXT,
          $gameVariables.value(GAME_VARIABLE.DAY_END_INFO_TEXT) +
            `${actorName}本日獲得経験値:${exp}`
        );
        levelUpActorCount += 1;
        if (levelUpActorCount % 2 == 0) {
          $gameVariables.setValue(
            GAME_VARIABLE.DAY_END_INFO_TEXT,
            $gameVariables.value(GAME_VARIABLE.DAY_END_INFO_TEXT) + `\n`
          );
          $gameVariables.setValue(
            GAME_VARIABLE.DAY_END_INFO_LINE_COUNT,
            $gameVariables.value(GAME_VARIABLE.DAY_END_INFO_LINE_COUNT) + 1
          );
        }
      }
      $gameVariables.value(actorId + 380)[65] = actor.currentExp();
    }
    if (
      levelUpActorCount == 1 ||
      levelUpActorCount == 3 ||
      levelUpActorCount == 5 ||
      levelUpActorCount == 7
    ) {
      $gameVariables.setValue(
        GAME_VARIABLE.DAY_END_INFO_TEXT,
        $gameVariables.value(GAME_VARIABLE.DAY_END_INFO_TEXT) + `\n`
      );
      $gameVariables.setValue(
        GAME_VARIABLE.DAY_END_INFO_LINE_COUNT,
        $gameVariables.value(GAME_VARIABLE.DAY_END_INFO_LINE_COUNT) + 1
      );
    }
    for (var i = 16; i <= 17; i++) {
      $gameSwitches.setValue(i, false);
    }
    for (var i = 6; i <= 12; i++) {
      $gameSwitches.setValue(i, false);
    }

    const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];
    const currentDay = $gameVariables.value(GAME_VARIABLE.WEEKDAY);

    const maxDaysInWeek = daysOfWeek.length;
    for (let i = 0; i < maxDaysInWeek; i++) {
      if (currentDay === daysOfWeek[i]) {
        const nextDay = daysOfWeek[(i + 1) % maxDaysInWeek]; // will be 0 (日) when will reach max (土) day
        $gameVariables.setValue(GAME_VARIABLE.WEEKDAY, nextDay);
        $gameSwitches.setValue(i + 6, true);
        $gameSwitches.setValue(i < 5 ? 17 : 16, true); // 16 for last 2 days (休日) and 17 for 1st 5 (平日)
        break;
      }
    }
  };

  //ガチャスクリプト
  item_gacha = function () {
    const RARITY_COLOR_TAG_INFOS = {
      1: [0, 473],
      2: [2, 473],
      3: [22, 473],
      4: [21, 473],
      5: [29, 473],
      6: [28, 474],
      7: [24, 475],
      8: [26, 476],
      9: [27, 477],
      10: [25, 478]
    };

    //内容のほうで開始時点ではレアリティを8に制限
    gacha_naiyou(3, 0);
    if (valueGachaId >= 1) {
      const databaseEntry = valueItems[valueGachaId];
      $gameParty.gainItem(databaseEntry, 1);
      var lotteryRarity = Number(databaseEntry.meta["LotteryRearity"]);
      if ($gameVariables.value(23) < lotteryRarity) {
        $gameVariables.setValue(23, lotteryRarity);
      }

      const colorCode = RARITY_COLOR_TAG_INFOS[lotteryRarity][0];
      const itemIndex = RARITY_COLOR_TAG_INFOS[lotteryRarity][1];
      var rarityColorTag = colorTaggedText(
        colorCode,
        `<Rarity:\\I[${itemIndex}]`
      );

      switch (valueItems) {
        case $dataItems:
          var itemTypePrefix = `\\iin`;
          break;
        case $dataWeapons:
          var itemTypePrefix = `\\win`;
          break;
        case $dataArmors:
          var itemTypePrefix = `\\ain`;
          break;
      }
      var prefixGacha = colorTaggedText(
        16,
        `${itemTypePrefix}[${valueGachaId}]`
      );
      var gacha = rarityColorTag + prefixGacha;
      var gachaResultMessage = `${gacha}が排出されました！`;

      if ($gameSwitches.value(GAME_SWITCH.TEMPORARY_RESULT)) {
        $gameVariables.setValue(21, $gameVariables.value(21) + 1);
        $gameVariables.setValue(
          22,
          $gameVariables.value(22) + `${gachaResultMessage}\n`
        );
      } else {
        $gameVariables.setValue(22, gachaResultMessage);
      }
    }
  };

  //アイテム武器防具抽選スクリプト。id12アイテム1武器2防具3all
  //id13がall。10まで。value1としてid決定
  const DEFAULT_RARITY_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  gacha_naiyou = function (valueItemsType, rarity) {
    if (
      (valueItemsType || valueItemsType === 0) &&
      valueItemsType > -1 &&
      valueItemsType < 3
    ) {
      valueItems = getItemEquipmentSource(valueItemsType);
    } else {
      const randomValueItemsType = getRandomIndex(11);
      valueItems = getItemEquipmentSource(
        randomValueItemsType > 1 ? 2 : randomValueItemsType
      );
    }

    let chosenRarity = rarity;
    if (rarity < 1) {
      let rarityArray = DEFAULT_RARITY_LIST.slice();
      for (let i = 1; i <= 50; i++) {
        rarityArray.push(1);
        if (i > 45) continue;

        addRarityCheckValues(rarityArray, i);
      }
      chosenRarity = rarityArray[getRandomIndex(rarityArray.length)];
      //ガチャ称号取得でＵＲ，ＬＲ解放
      if (!$gameParty.hasItem($dataItems[657], true) && chosenRarity >= 9) {
        chosenRarity = 8;
      }
      if (!$gameParty.hasItem($dataItems[656], true) && chosenRarity >= 8) {
        chosenRarity = 7;
      }
    }

    let selectedItemIndex;
    if ($gameParty.inBattle()) {
      selectedItemIndex = 71; //仮指定。ポーションのみ
    } else {
      let eligibleItemIndices = [0];
      const itemsLength = valueItems.length;
      for (let i = 1; i < itemsLength; i++) {
        const currentItem = valueItems[i];
        if (!currentItem) continue;

        if (currentItem.meta["GatchaOutOfRange"]) continue;
        if ($gameParty.hasItem(currentItem)) {
          const maxItemLimit = currentItem.meta["Max Item"];
          if (maxItemLimit && Number(maxItemLimit) == 1) continue;
        } else if (currentItem.meta["GatchaHasRange"]) continue;

        const lotteryRearity = currentItem.meta["LotteryRearity"];
        if (!lotteryRearity) continue;
        if (Number(lotteryRearity) !== chosenRarity) continue;

        eligibleItemIndices.push(i);
      }
      selectedItemIndex =
        eligibleItemIndices[getRandomIndex(eligibleItemIndices.length)];
      if (selectedItemIndex === 0) {
        //レアリティ1でmax1アイテムを作らない。
        eligibleItemIndices = [];
        chosenRarity = 1;
        for (let i = 1; i < itemsLength; i++) {
          const currentItem = valueItems[i];
          if (!currentItem) continue;
          if (currentItem.meta["GatchaOutOfRange"]) continue;
          if (
            currentItem.meta["GatchaHasRange"] &&
            !$gameParty.hasItem(currentItem)
          )
            continue;

          const lotteryRearity = currentItem.meta["LotteryRearity"];
          if (!lotteryRearity) continue;
          if (Number(lotteryRearity) !== chosenRarity) continue;

          eligibleItemIndices.push(i);
        }
        valueGachaId =
          eligibleItemIndices[getRandomIndex(eligibleItemIndices.length)];
        return;
      }
    }

    valueGachaId = selectedItemIndex;
  };

  const rarityChecks = [
    { threshold: 45, value: 2 },
    { threshold: 40, value: 3 },
    { threshold: 35, value: 4 },
    { threshold: 30, value: 5 },
    { threshold: 9, value: 6 },
    { threshold: 7, value: 7 },
    { threshold: 5, value: 8 },
    { threshold: 3, value: 9 }
  ];
  function addRarityCheckValues(rarityArray, currentValue) {
    rarityChecks.forEach((check) => {
      if (currentValue <= check.threshold) {
        rarityArray.push(check.value);
      }
    });
  }

  //レアリティ一覧作成
  item_gachaitiran1 = function (lotteryRarity) {
    let choiceIndex = 1;
    let pictureSlot = 1;

    const info = $gameVariables.value(801);
    for (var j = 0; j <= 2; j++) {
      valueItems = j == 0 ? $dataItems : j == 1 ? $dataWeapons : $dataArmors; // 2=armors
      const start = 1;
      const end = valueItems.length;
      for (var i = start; i < end; i++) {
        let isItemExcluded = 0;
        const databaseEntry = valueItems[i];
        if (!databaseEntry) continue;
        if (!databaseEntry.meta["LotteryRearity"]) continue;

        if (Number(databaseEntry.meta["LotteryRearity"]) !== lotteryRarity)
          continue;

        if (databaseEntry.meta["Max Item"]) {
          if (
            Number(databaseEntry.meta["Max Item"]) == 1 &&
            $gameParty.hasItem(databaseEntry)
          ) {
            isItemExcluded = 1;
          }
        }
        if (databaseEntry.meta["GatchaHasRange"]) {
          if (!$gameParty.hasItem(databaseEntry)) {
            isItemExcluded = 1;
          }
        }
        if (databaseEntry.meta["GatchaOutOfRange"]) {
          isItemExcluded = 1;
        }
        if (isItemExcluded !== 0) continue;

        const descriptionText = `${databaseEntry.description}`;
        item_priceinfo(j, i);
        const customChoiceId = 1;
        const itemName = `\x1bI[${databaseEntry.iconIndex}]${databaseEntry.name}`;
        const choiceParams = {
          text: `${itemName}`,
          value: choiceIndex
        };
        $gameSystem.addCustomChoice(customChoiceId, choiceParams);
        $gameScreen.setDTextPicture(descriptionText, 28);
        $gameScreen.dWindowFrame = "ON";
        $gameScreen.showPicture(
          pictureSlot + 100,
          "",
          0,
          20,
          10,
          100,
          100,
          0,
          0
        );
        $gameMessage.setSelectPictureId(choiceIndex, pictureSlot + 100);
        const message =
          `　　　　　　` +
          colorTaggedText(14, `──詳細情報──`) +
          `　　　　　　　　` +
          `\n${info}`;
        $gameScreen.setDTextPicture(message, 28);
        $gameScreen.dWindowFrame = "ON";
        $gameScreen.showPicture(
          pictureSlot + 100 + 1,
          "",
          0,
          640,
          110,
          100,
          100,
          0,
          0
        );
        $gameMessage.setSelectPictureId(choiceIndex, pictureSlot + 100 + 1);
        choiceIndex += 1;
        pictureSlot += 2;
      }
    }
  };

  //ダンジョンランダム宝箱中身処理
  danjon_treasure = function () {
    const chestId = $gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID);
    const chestMeta = $dataItems[chestId].meta;
    const treasureIndices = $gameVariables.value(215)[chestId];
    const entryCategoryIndices = $gameVariables.value(216)[chestId];
    if (treasureIndices != 0) {
      var treasureItemIndex =
        treasureIndices[getRandomIndex(treasureIndices.length)];
      let index = treasureIndices.findIndex(
        (candidateIndex) => candidateIndex == treasureItemIndex
      );
      var sourceEntries = getItemEquipmentSource(entryCategoryIndices[index]);
      if (chestMeta["TchestRere"]) {
        if (treasureItemIndex == Number(chestMeta["TchestRere"])) {
          $gameSwitches.setValue(439, true);
        }
      }
      const gainedItem = sourceEntries[treasureItemIndex];
      $gameParty.gainItem(gainedItem, 1);
      const itemName = colorTaggedText(
        24,
        `\x1bI[${gainedItem.iconIndex}]${gainedItem.name}`
      );
      var treasureMessage = `${itemName}を入手した！`;
      if (!$gameSwitches.value(440)) {
        if (index >= 0) {
          treasureIndices.splice(index, 1);
          entryCategoryIndices.splice(index, 1);
        }
      }
    } else {
      var treasureMessage = `宝箱の中身は空だった…。`;
      $gameSwitches.setValue(GAME_SWITCH.TEMPORARY_RESULT, true);
    }
    if ($gameSwitches.value(439)) {
      var treasureItemIndex = 28;
      $gameScreen.setDTextPicture(treasureMessage, treasureItemIndex);
    } else {
      CommonPopupManager.showInfo({}, treasureMessage, null);
    }
  };

  //ランダム表情index -> 顔グラID(actor_choicePre1用)
  const FACE_IDS_BY_RANDOM_INDEX = [1, 2, 5, 15, 40, 39, 38, 41];

  //アクター選択肢準備
  actor_choicePre1 = function () {
    const partyMembers = $gameParty.members();
    let choiceOrder = 0;
    let choicePictureId = 101;
    const start = 0;
    const end = partyMembers.length - 1;
    for (var memberIndex = start; memberIndex <= end; memberIndex++) {
      if (memberIndex >= 1) {
        choiceOrder += 1;
      }
      const gameActor = partyMembers[memberIndex];
      var actorId = gameActor.actorId();
      $gameVariables.setValue(GAME_VARIABLE.SELECTED_ACTOR_ID, actorId);
      const customChoiceId = 1;
      const choiceParams = { text: gameActor.name(), value: actorId };
      $gameSystem.addCustomChoice(customChoiceId, choiceParams);
      if (isGirl(gameActor)) {
        valueFaceSelect = 6;
        const randomFaceIndex = getRandomIndex(8);
        //index4-7はスキル66習得時のみ。習得していなければデフォルトの6
        if (randomFaceIndex <= 3 || gameActor.isLearnedSkill(66)) {
          valueFaceSelect = FACE_IDS_BY_RANDOM_INDEX[randomFaceIndex];
        }

        battle_bustUp1(gameActor, choicePictureId, 0, 0, 10);
        for (var j = 0; j <= 7; j++) {
          if ($gameScreen.picture(choicePictureId + j)) {
            $gameMessage.setSelectPictureId(choiceOrder, choicePictureId + j);
          }
        }
      } else {
        //$gameScreen.showPicture(id3,$gameVariables.value(20)+"Actor1_s0",0,0,0,100,100,0,0);
        //$gameMessage.setSelectPictureId(id2, id3);
      }
      choicePictureId += 10;
    }
  };

  //エネミーのデータベースパラメータ設定
  enemy_dataBaseSettei = function () {
    const start = 31;
    const end = 300;
    for (var enemyId = start; enemyId <= end; enemyId++) {
      const enemyData = $dataEnemies[enemyId];
      if (enemyData.meta["BaseStates"]) {
        var baseStateValues = enemyData.meta["BaseStates"].split(",");
        var baseParamValue = Number(baseStateValues[0]);
        //var arr2 = [baseParamValue-5,baseParamValue-4,baseParamValue-3,baseParamValue-2,baseParamValue-2,baseParamValue,baseParamValue+1,baseParamValue+2,baseParamValue+3,baseParamValue+4,baseParamValue+5];
        var statVarianceCandidates = [
          baseParamValue - 10,
          baseParamValue - 5,
          baseParamValue,
          baseParamValue + 5,
          baseParamValue + 10
        ];
        var randomParam =
          statVarianceCandidates[getRandomIndex(statVarianceCandidates.length)];
        enemyData.params[0] = randomParam;
        for (var j = 1; j <= 7; j++) {
          var secondBaseValue = Number(baseStateValues[1]);
          var randomStatValue = getRandomIndex(5) + (secondBaseValue - 3);
          //var randomStatValue = secondBaseValue;//getRandomIndex(5) + (secondBaseValue - 3);
          enemyData.params[j] = randomStatValue;
        }
        enemyData.exp = Math.round(randomParam / 10);
        var goldDivisor = getRandomIndex(4) + 8;
        enemyData.gold = Math.round(randomParam / goldDivisor);
      }
    }
  };

  //メニュー画面で付与ステートの解説分表示
  state_menuDisprayDescription = function () {
    valueCountSet1 = 0;
    valueCountSet2 = 1;
    const headerText = `付与ステート一覧\n`;
    window["valueWordSet" + valueCountSet2] = headerText;
    const states = $dataStates;
    const partyMembers = $gameParty.members();
    for (let stateId = 1; stateId < states.length; stateId++) {
      if (!$gameParty.membersState(stateId)) continue;
      const stateData = states[stateId];
      if (
        !stateData ||
        !(stateData.iconIndex >= 1) ||
        stateData.name === "" ||
        stateData.description === ""
      )
        continue;
      const pageKey = "valueWordSet" + valueCountSet2;
      window[pageKey] += partyStateDescription(
        stateId,
        stateData,
        partyMembers
      );
      valueCountSet1++;
      if (valueCountSet1 % 6 !== 0) continue;
      valueCountSet2++;
      window["valueWordSet" + valueCountSet2] = headerText;
    }
  };

  //キャラ初期セットアップ。ＬＶリセットにも実行。この後レアリティコモン実行。
  actor_StartSetUp = function (actorId) {
    const actor2 = $gameActors.actor(actorId);
    const actor = actor2;
    //主人公にタイトルセットと存在フラグとレベルフラグと視点変更スキル
    if (
      actorId == $gameVariables.value(GAME_VARIABLE.TRUE_PROTAGONIST_ACTOR_ID)
    ) {
      //actor.learnSkill(23);//タイトルセット。不要
      //actor.learnSkill(24);//性欲度関連に合わせて習得させる。性欲度ランク1で習得
      //actor.learnSkill(42);//視点変更
      actor.learnSkill(407);
      actor.learnSkill(18);
    }
    //デバッグ時に全員に存在フラグとレベルフラグ
    //if($gameSwitches.value(53)){
    //actor.learnSkill(407);
    //actor.learnSkill(18);
    //};
    //初期装備とスキル付与
    const actorData = $dataActors[actorId];
    if (actorData.meta["JoinEquipWeapons"]) {
      var metaFlagValue = Number(actorData.meta["JoinEquipWeapons"]);
      $gameParty.gainItem($dataWeapons[metaFlagValue], 1, false);
      actor.changeEquipById(1, metaFlagValue);
    }
    var list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    list.forEach(function (id) {
      const actorData = $dataActors[actorId];
      if (!actorData.meta["JoinEquipArmors" + id]) return;

      const metaFlagValue = Number(actorData.meta["JoinEquipArmors" + id]);
      $gameParty.gainItem($dataArmors[metaFlagValue], 1, false);
      actor.changeEquipById(3, metaFlagValue);
    }, this);
    if (actorData.meta["JoinSkillLearn"]) {
      var joinSkillValues = actorData.meta["JoinSkillLearn"].split(",");
      for (var j = 0; j <= joinSkillValues.length - 1; j++) {
        actor2.learnSkill(Number(joinSkillValues[j]));
      }
    }
    //初期レアリティ設定。スキルとしてはJoinSkillLearnで付与
    reality_setUp(actorId);
    //主人公確定
    var metaFlagValue = actorData.meta["Mcharacter"];
    if (metaFlagValue) {
      actor.addState(601);
    } else {
      actor.removeState(601);
    }
    //主人公と女・男用ステート↓
    var metaFlagValue = actorData.meta["Heroine"];
    if (metaFlagValue) {
      actor.addState(602);
    } else {
      actor.addState(603);
    }
    //立ち絵変更あり男に全裸スキル
    var metaFlagValue = actorData.meta["MultipleTachie"];
    if (metaFlagValue) {
      actor.learnSkill(45);
    }
    //全員に通常攻撃十種基本スキル付与。
    var list = [101, 111, 121, 131, 141, 151, 161, 171, 181, 191];
    list.forEach(function (id) {
      actor.learnSkill(id);
    }, this);
    //初期JP
    actor.gainJp(100);
    //苗字代入
    if (actorData.meta["SecondName"]) {
      var joinSkillValues = actorData.meta["SecondName"].split(",");
      const weaponData = $dataWeapons[actorId + 200];
      weaponData.name = joinSkillValues[1];
      $gameVariables.value(actorId + 380)[50] = weaponData.name;
    }
  };

  const ACTOR_RARITY_RANK_DATA = {
    // rarityRank: [skillId, rankLv, code, maxLevel]
    0: { skillId: 406, rankLv: 0, code: "N", maxLv: 9 },
    1: { skillId: 405, rankLv: 1, code: "R", maxLv: 39 },
    2: { skillId: 404, rankLv: 2, code: "SR", maxLv: 59 },
    3: { skillId: 403, rankLv: 3, code: "SSR", maxLv: 79 },
    4: { skillId: 402, rankLv: 4, code: "UR", maxLv: 98 },
    5: { skillId: 401, rankLv: 5, code: "LR", maxLv: 998 }
  };

  /*
   * Get actor rarity rank data
   */
  getRarityRank = function (actor) {
    for (var rarityRank in ACTOR_RARITY_RANK_DATA) {
      var rank = ACTOR_RARITY_RANK_DATA[rarityRank];
      if (actor.isLearnedSkill(rank.skillId)) {
        return rank;
      }
    }
  };

  //レアリティを設定
  reality_setUp = function (actorId) {
    const actor = $gameActors.actor(actorId);
    if (!actor) return;
    const rank = getRarityRank(actor);
    if (!rank) return;

    actor.gainMaxLevel(-999);
    actor.gainMaxLevel(rank.maxLv);
    actor.setupCssbgi(
      1,
      "actorreality" + (valueCountSet1 = rank.code),
      0,
      0,
      0,
      0,
      0
    );
    actor.setFaceImage("Actor_" + actorId, rank.rankLv);
  };

  const ACTOR_RARITY_RANK_SKILLS_DATA = {
    // rarityRank: { skillId, forgetSkillIds: [], learnSkillIds: [] }
    5: { skillId: 401, forgetSkillIds: [], learnSkillIds: [] },
    4: { skillId: 402, forgetSkillIds: [402], learnSkillIds: [401] },
    3: { skillId: 403, forgetSkillIds: [403], learnSkillIds: [402] },
    2: { skillId: 404, forgetSkillIds: [404], learnSkillIds: [403] },
    1: { skillId: 405, forgetSkillIds: [405], learnSkillIds: [404] },
    0: { skillId: 406, forgetSkillIds: [406], learnSkillIds: [405] }
  };

  //レアリティアップ
  reality_Up = function (actorId) {
    const gameActor = $gameActors.actor(actorId);
    if (!gameActor) return;
    for (const rankKey of Object.keys(ACTOR_RARITY_RANK_SKILLS_DATA)) {
      const rankData = ACTOR_RARITY_RANK_SKILLS_DATA[rankKey];
      if (!gameActor.isLearnedSkill(rankData.skillId)) continue;
      applyRaritySkillTransition(gameActor, rankData);
      // Exactly one promotion: newly learned flags must not trigger later ranks in this loop.
      return;
    }
  };

  const RANK_BY_PROMOTION_DATA = {
    // rankLv: { promotionValue, promotionCode, cost }
    0: { promotionValue: 402, promotionCode: "LR", cost: 1000000 },
    1: { promotionValue: 403, promotionCode: "UR", cost: 100000 },
    2: { promotionValue: 404, promotionCode: "SSR", cost: 50000 },
    3: { promotionValue: 405, promotionCode: "SR", cost: 10000 },
    4: { promotionValue: 406, promotionCode: "R", cost: 1000 }
  };

  //レアリティの昇格計算
  // 昇格に必要な素材の作業配列。CommonEvent 235 が mode 1 → 2 → 0 の順で
  // 呼ぶ前提で、mode 1 が詰めて mode 2/0 が読む。宣言が無いと window を汚し、
  // mode 1 を経ずに呼ばれた場合は undefined.length で落ちる。
  let promotionMaterialItemIds = [];
  let promotionMaterialQuantities = [];
  let preparedPromotionActorId = 0;
  reality_setPromotion = function (promotionModeId, actorId) {
    switch (promotionModeId) {
      case 1:
        prepareRarityPromotion(actorId);
        break;
      case 2:
        $gameSwitches.setValue(
          GAME_SWITCH.TEMPORARY_RESULT,
          canPayRarityPromotion(actorId)
        );
        break;
      case 0:
        payRarityPromotionMaterials(actorId);
        break;
    }
  };

  //監禁、奴隷化時にレアリティと装備を記憶。レアリティダウンを実行するかはid3が1で実行
  reality_setRelegation = function (rarityModeId, actorId, isRarityDownFlag) {
    const actor = $gameActors.actor(actorId);
    const stateData93 = $dataStates[93];
    let equipData = $gameVariables.value(GAME_VARIABLE.CONFINED_ACTOR_RECORDS)[
      actorId
    ];
    const actorName = actor.name();
    const stateName = stateData93.name;
    const stateIcon = stateData93.iconIndex;

    switch (rarityModeId) {
      case 0:
        {
          for (let i = 0; i < 10; i++) {
            if (!(equipData[i] >= 1)) continue;

            actor.changeEquipById(i + 1, equipData[i]);
            equipData[i] = 0;
          }
          const recoverMessage = `${actorName}は装備を取り戻した！`;
          CommonPopupManager.showInfo({}, recoverMessage, null);

          if (actor.isStateAffected(93) && equipData[11] >= 1) {
            for (let i = 401; i <= 406; i++) {
              actor.forgetSkill(i);
            }
            actor.learnSkill(equipData[11]);
            reality_setUp(actorId);
            actor.removeState(93);
            const stateRemoveMessage = `${actorName}の\x1bI[${stateIcon}]${stateName}が解除された！`;
            CommonPopupManager.showInfo({}, stateRemoveMessage, null);
            actor.changeExp(equipData[12] + actor.currentExp(), false);
            if (equipData[13] >= 1) {
              actor.changeSubclass(equipData[13]);
              const restoredClassName = $dataClasses[equipData[13]].name;
              const effectName = colorTaggedText(14, `${restoredClassName}`);
              const subclassMessage = `${actorName}のサブジョブが${effectName}に戻った！`;
              CommonPopupManager.showInfo({}, subclassMessage, null);
            }
            equipData[11] = 0;
            equipData[12] = 0;
            equipData[13] = 0;
          }
        }
        break;
      case 1:
        {
          $gameVariables.value(GAME_VARIABLE.CONFINED_ACTOR_RECORDS)[actorId] =
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 0-10: 装備, 11: レアリティスキル, 12: 経験値, 13: サブジョブ
          equipData = $gameVariables.value(
            GAME_VARIABLE.CONFINED_ACTOR_RECORDS
          )[actorId];
          let learnedSkill = 401;
          for (let i = 401; i <= 406; i++) {
            if (actor.isLearnedSkill(i)) {
              learnedSkill = i;
            }
          }
          equipData[11] = learnedSkill;

          const equips = actor.equips();
          for (let i = 0; i < equips.length; i++) {
            if (!equips[i]) continue;

            equipData[i] = equips[i].id;
            actor.changeEquipById(i + 1, 0);
          }
          const stealMessage = `${actorName}は装備を奪われた…`;
          CommonPopupManager.showInfo({}, stealMessage, null);

          if (isRarityDownFlag === 1 && !actor.isStateAffected(93)) {
            equipData[12] = actor.currentExp();
            for (let i = 401; i <= 406; i++) {
              actor.forgetSkill(i);
            }
            actor.learnSkill(406);
            reality_setUp(actorId);
            actor.addState(93);
            const stateApplyMessage = `${actorName}は\x1bI[${stateIcon}]${stateName}を受けた…`;
            CommonPopupManager.showInfo({}, stateApplyMessage, null);
            equipData[13] = actor._subclassId;
            actor.changeSubclass(42);
            const dataClass = $dataClasses[actor._subclassId];
            const effectName2 = colorTaggedText(27, `${dataClass.name}`);
            const subclassAppliedMessage = `${actorName}のサブジョブが${effectName2}になった…`;
            CommonPopupManager.showInfo({}, subclassAppliedMessage, null);
          }
        }
        break;
    }
  };

  //換金時にアイテム没収/解放時に放出スクリプト.1で実行 2で解除
  item_confinementScript = function (confinementModeId) {
    if (confinementModeId == 1) {
      if ($gameVariables.value(316)[0] == 0) {
        $gameVariables.setValue(316, Array(4).fill(0));
        const newConfinementSlots = $gameVariables.value(316);
        for (var j = 0; j <= 3; j++) {
          newConfinementSlots[j] = Array(2001).fill(0);
        }
        newConfinementSlots[3] = 0;
      }
    }
    const confinementSlots = $gameVariables.value(316);
    if (confinementModeId == 1) {
      const partyGold = $gameParty.gold();
      if (partyGold >= 1) {
        const effectName = colorTaggedText(1, `${partyGold.toLocaleString()}`);
        var confinementValue = `アイテム類と所持金${effectName}を奪われた…`;
        CommonPopupManager.showInfo({}, confinementValue, null);
        confinementSlots[3] += partyGold;
        $gameParty.loseGold(partyGold);
      }
    } else {
      if (confinementSlots[3] >= 1) {
        const effectName2 = colorTaggedText(
          5,
          `${confinementSlots[3].toLocaleString()}`
        );
        var confinementValue = `アイテム類と所持金${effectName2}を取り戻した！`;
        CommonPopupManager.showInfo({}, confinementValue, null);
        $gameParty.gainGold(confinementSlots[3]);
        confinementSlots[3] = 0;
      }
    }
    for (let categoryId = 0; categoryId <= 2; categoryId++)
      transferConfinementCategory(
        confinementSlots,
        categoryId,
        confinementModeId == 1
      );
    if (confinementModeId == 0) {
      $gameVariables.setValue(316, Array(4).fill(0));
    }
  };

  //初めて来る街でマップ名表示
  map_centerDispray = function (pictureId, mapTitleText) {
    const screenPictureId = pictureId;
    var backgroundPictureName = "ScreenBlackOut";
    $gameScreen.showPicture(
      screenPictureId,
      backgroundPictureName,
      1,
      640,
      384,
      100,
      100,
      0,
      0
    );
    $gameScreen.movePicture(screenPictureId, 1, 640, 384, 100, 100, 150, 0, 30);
    var backgroundPictureName = "ScreenCenterTextDisPray";
    $gameScreen.showPicture(
      screenPictureId + 1,
      backgroundPictureName,
      1,
      640,
      384,
      100,
      0,
      0,
      0
    );
    $gameScreen.movePicture(
      screenPictureId + 1,
      1,
      640,
      384,
      100,
      100,
      255,
      0,
      30
    );
    const centerDisplayText = mapTitleText;
    $gameScreen.setDTextPicture(`\\f[b]${centerDisplayText}`, 40);
    $gameScreen.setDtextFont("ＭＳ Ｐ明朝");
    pic_1(2, screenPictureId + 3, "", 3, 100, 255, 90, 1280, 768, 0, 0);
  };

  //右横256とメニュー背景設定 backGraund_menuMapSelect(2,'BG_Shower',0,0);
  //右横256とメニュー背景設定 backGraund_menuMapSelect(2,'BG_Shower',0,0);
  backGraund_menuMapSelect = function (
    backgroundVariantId,
    backgroundName,
    horizontalScrollSpeed,
    verticalScrollSpeed
  ) {
    h_keikenhyouji2(521, 0);
    $gameScreen.erasePicture(6);
    $gameScreen.erasePicture(70);
    if ($gameVariables.value(GAME_VARIABLE.MENU_BACKGROUND_NAME) == 0) {
      $gameVariables.setValue(GAME_VARIABLE.MENU_BACKGROUND_NAME, "BlueSky");
      $gameVariables.setValue(81, 0.3); //メニュー背景横スク
      $gameVariables.setValue(82, 0); //メニュー背景縦スク
    }
    if ($gameSwitches.value(206)) {
      if ($gameSwitches.value(GAME_SWITCH.NIGHT)) {
        $gameVariables.setValue(
          GAME_VARIABLE.MENU_BACKGROUND_NAME,
          "BG_MyRoomN"
        );
        $gameVariables.setValue(81, 0); //メニュー背景横スク
        $gameVariables.setValue(82, 0.4); //メニュー背景縦スク
      } else {
        $gameVariables.setValue(
          GAME_VARIABLE.MENU_BACKGROUND_NAME,
          "BG_MyRoom"
        );
        $gameVariables.setValue(81, 0.3); //メニュー背景横スク
        $gameVariables.setValue(82, 0); //メニュー背景縦スク
      }
    }
    if (backgroundName != 0) {
      $gameVariables.setValue(
        GAME_VARIABLE.MENU_BACKGROUND_NAME,
        backgroundName
      );
      $gameVariables.setValue(81, horizontalScrollSpeed); //メニュー背景横スク
      $gameVariables.setValue(82, verticalScrollSpeed); //メニュー背景縦スク
    }
    if ($gameVariables.value(GAME_VARIABLE.MENU_BACKGROUND_NAME) != 0) {
      const menuBackgroundName = $gameVariables.value(
        GAME_VARIABLE.MENU_BACKGROUND_NAME
      );
      const hScrollSpeed = $gameVariables.value(81);
      const vScrollSpeed = $gameVariables.value(82);
      const hScrollEnabled = hScrollSpeed != 0;
      const vScrollEnabled = vScrollSpeed != 0;
      Galv.CACHE.load("parallaxes", menuBackgroundName);
      $gameSystem._backgroundName = menuBackgroundName;
      if ($gameSwitches.value(468)) {
        $gameMap.changeParallax(
          menuBackgroundName,
          hScrollEnabled,
          vScrollEnabled,
          hScrollSpeed,
          vScrollSpeed
        );
      }
      if (
        $gameSwitches.value(GAME_SWITCH.WORLD_MAP) ||
        $gameSwitches.value(227)
      ) {
      } else {
        //全体マップと艦橋ではない場合
        const parallaxYOffset = ["Dungeon2_2"].some(function (id) {
          return menuBackgroundName == id;
        })
          ? -355
          : 0;
        $gameScreen.showPicture(
          6,
          "/img/parallaxes/" + menuBackgroundName,
          0,
          1024,
          parallaxYOffset + 50,
          100,
          100,
          0,
          0
        );
        $gameScreen.movePicture(
          6,
          0,
          1024,
          parallaxYOffset,
          100,
          100,
          250,
          0,
          60
        );
        if (backgroundVariantId == 2) {
          $gameScreen.showPicture(
            70,
            "/img/parallaxes/" + menuBackgroundName,
            0,
            1024,
            parallaxYOffset + 50,
            100,
            100,
            0,
            0
          );
          $gameScreen.movePicture(
            70,
            0,
            1024,
            parallaxYOffset,
            100,
            100,
            255,
            0,
            60
          );
        }
      }
    }
  };

  //遠景をアイテム武器ＩＤで指定
  //遠景をアイテム武器ＩＤで指定
  setMap_parallaxSelect = function (
    databaseTypeId,
    paramItemId,
    paramInOutFlag
  ) {
    var parallaxKey = 0;
    var metaSource;
    switch (databaseTypeId) {
      case 0:
        metaSource = $dataItems[paramItemId];
        break;
      case 1:
        metaSource = $dataWeapons[paramItemId];
        if (paramInOutFlag == 0) {
          if (metaSource.meta["BG_in"]) {
            var parallaxKey = "BG_in";
          }
        }
        if (paramInOutFlag == 1) {
          if (metaSource.meta["BG_out"]) {
            var parallaxKey = "BG_out";
          }
        }
        if ($gameSwitches.value(GAME_SWITCH.NIGHT)) {
          switch (numericCaseValue(paramInOutFlag)) {
            case 0:
              {
                if (metaSource.meta["BG_inN"]) {
                  var parallaxKey = "BG_inN";
                }
              }
              break;
            case 1:
              {
                if (metaSource.meta["BG_outN"]) {
                  var parallaxKey = "BG_outN";
                }
              }
              break;
          }
        }
        break;
    }
    if (databaseTypeId == 0) {
      if (metaSource.meta["BG2"]) {
        var parallaxKey = "BG2";
      }
      if ($gameSwitches.value(GAME_SWITCH.NIGHT)) {
        if (metaSource.meta["BGN2"]) {
          var parallaxKey = "BGN2";
        }
      }
    }
    if (!(parallaxKey != 0)) return;

    const parallaxValues = metaSource.meta[parallaxKey].split(",");
    if (Number(parallaxValues[1]) == 0) {
      var hScrollEnabled = false;
    } else {
      var hScrollEnabled = true;
    }
    if (Number(parallaxValues[2]) == 0) {
      var vScrollEnabled = false;
    } else {
      var vScrollEnabled = true;
    }
    $gameMap.changeParallax(
      parallaxValues[0],
      hScrollEnabled,
      vScrollEnabled,
      Number(parallaxValues[1]),
      Number(parallaxValues[2])
    );
    $gameVariables.setValue(
      GAME_VARIABLE.MENU_BACKGROUND_NAME,
      parallaxValues[0]
    );
    $gameVariables.setValue(81, 0); //メニュー背景横スク
    $gameVariables.setValue(82, 0); //メニュー背景縦スク
  };

  //BGMをjouhouで設定した配列で指定。BGMの保存も実行
  setMap_musicSelect2 = function () {
    AudioManager.playBgm({
      name: valueMapBGM[0],
      volume: valueMapBGM[1],
      pitch: valueMapBGM[2],
      pan: valueMapBGM[3]
    });
    $gameSystem.saveBgm();
  };

  //BGMをアイテム武器ＩＤで指定
  //BGMをアイテム武器ＩＤで指定
  setMap_musicSelect = function (databaseTypeId, paramItemId, paramInOutFlag) {
    let mapInfo;
    switch (databaseTypeId) {
      case 0:
        mapInfo = $dataItems[paramItemId];
        break;
      case 1:
        mapInfo = $dataWeapons[paramItemId];
        break;
    }
    if ($dataMap.meta.BGM) mapInfo = $dataMap;
    if (!mapInfo) return;
    const mapMeta = mapInfo.meta;
    if (!mapMeta.BGM) return;
    const bgmKey =
      $gameSwitches.value(GAME_SWITCH.NIGHT) && mapMeta.BGMN ? "BGMN" : "BGM";
    const bgmValues = mapMeta[bgmKey].split(",");
    AudioManager.playBgm({
      name: bgmValues[0],
      volume: bgmValues[1],
      pitch: bgmValues[2],
      pan: bgmValues[3]
    });
    $gameSystem.saveBgm();
  };

  //サブクエなどのイベント開始と終了時スクリプト
  otherScene_StartEnd = function (scenePhaseId, unusedArg2) {
    const gameVariables = $gameVariables;
    const gameSwitches = $gameSwitches;
    const isInBattle = $gameParty.inBattle();
    const gamePlayer = $gamePlayer;
    if (scenePhaseId == 1) {
      if (gameVariables.value(528) == 0) {
        gamePlayer.setTransparent(true);
        gameVariables.setValue(
          GAME_VARIABLE.DYNAMIC_EVENT_IDS,
          Array(21).fill(0)
        );
        if (!isInBattle) {
          $gameTemp.stopMapPlayerMovement();
        }
        if (!isInBattle) {
          gamePlayer.setStealthMode(true);
        }
        //gameSwitches.setValue(71,true);//ﾌﾟﾚｲﾔ移動禁止
        gameSwitches.setValue(124, true); //イベント進行時onoff
        gameSwitches.setValue(468, true); //ﾏｯﾌﾟﾌｪｰﾄﾞと他イベント進行禁止
        gameSwitches.setValue(467, true); //NPC消滅スイッチon
        if (gameVariables.value(320) == 0) {
          if (valueWeatherSceneSet != 0) {
            for (var i = 13; i <= 15; i++) {
              if (!gameSwitches.value(i)) continue;

              gameSwitches.setValue(i, false);
              gameVariables.setValue(320, i);
            }
            gameSwitches.setValue(valueWeatherSceneSet, true);
          }
        }
        var activeCommonEventIds = $gameMap._commonEvents
          .filter(function (event) {
            return event.isActive();
          })
          .map(function (event) {
            return event.event().id;
          });
        const dataCommonEvents = $dataCommonEvents;
        const eventsCount = activeCommonEventIds.length;
        for (var i = 0; i < eventsCount; i++) {
          const eventId = activeCommonEventIds[i];
          if (activeCommonEventIds[i] >= 2) {
            if (dataCommonEvents[eventId].switchId) {
              gameVariables.setValue(529, dataCommonEvents[eventId].switchId);
            }
          }
        }
        if (gameVariables.value(529) == 0) {
          gameVariables.setValue(
            529,
            dataCommonEvents[gameVariables.value(201)].switchId
          );
        }
      }
    } else if (scenePhaseId == 0) {
      if (gameVariables.value(528) >= 101) {
        const max = gameVariables.value(GAME_VARIABLE.DYNAMIC_EVENT_IDS).length;
        const gameMap = $gameMap;
        for (var i = 0; i < max; i++) {
          if (!(gameVariables.value(GAME_VARIABLE.DYNAMIC_EVENT_IDS)[i] >= 1))
            continue;

          if (
            !!gameMap.event(
              gameVariables.value(GAME_VARIABLE.DYNAMIC_EVENT_IDS)[i]
            )
          ) {
            if (!isInBattle) {
              gameMap.eraseEvent(
                gameVariables.value(GAME_VARIABLE.DYNAMIC_EVENT_IDS)[i]
              );
            }
          }
        }
        if (gameVariables.value(320) >= 1) {
          for (var i = 13; i <= 15; i++) {
            gameSwitches.setValue(i, false);
          }
          gameSwitches.setValue(gameVariables.value(320), true);
        }
        gameVariables.setValue(320, 0);
        gameVariables.setValue(
          GAME_VARIABLE.DYNAMIC_EVENT_IDS,
          Array(21).fill(0)
        );
        if (!isInBattle) {
          gamePlayer.setStealthMode(false);
        }
        if (!isInBattle) {
          gamePlayer.setThrough(false);
          $gameTemp.allowMapPlayerMovement();
        }
        //gameSwitches.setValue(71,false);//ﾌﾟﾚｲﾔ移動禁止
        gameSwitches.setValue(124, false); //イベント進行時onoff
        gameSwitches.setValue(467, false); //NPC消滅スイッチoff。
        gameSwitches.setValue(506, false); //通行人消滅スイッチoff。任意
        gameSwitches.setValue(473, false); //天候反映なし。任意
        gameSwitches.setValue(468, false); //ﾏｯﾌﾟﾌｪｰﾄﾞと他イベント進行禁止
        gameSwitches.setValue(180, true); //自動実行トリガー
        if (!isInBattle) {
          drowsepost.camera.zoom(1, 60, gamePlayer);
          gamePlayer.setTransparent(false);
        }
        itemGet_afterProcess();
        fade_wipeDirect(1);
        if (gameVariables.value(529) >= 2) {
          gameSwitches.setValue(gameVariables.value(529), false);
        }
      }
    }
  };

  //イベント開始と終了時スクリプト
  eventScene_StartEnd = function (
    startEndFlag,
    selectionSwitchId,
    sceneParamValue,
    eventItemId
  ) {
    var i; // Preserve the legacy eval-visible binding after moving the phase loops.
    valueCountSet1 = 0;
    const startSceneActor = $gameActors.actor($gameVariables.value(11));
    if (startSceneActor) {
      $gameVariables.setValue(49, startSceneActor.name());
    }
    $gameVariables.setValue(525, 0); //達成スイッチid変数
    if (eventItemId >= 401) {
      const eventItemMeta = $dataItems[eventItemId].meta;
      if (eventItemMeta["AddEventCompSwi"]) {
        var completionSwitchId = Number(eventItemMeta["AddEventCompSwi"]);
      } else {
        if ($gameVariables.value(GAME_VARIABLE.SCENE_KIND) == 1) {
          //挿話
          var completionSwitchId = eventItemId + 900;
        }
        if ($gameVariables.value(GAME_VARIABLE.SCENE_KIND) == 2) {
          //Ｈ
          var completionSwitchId = eventItemId + 600;
        }
      }
      $gameVariables.setValue(525, completionSwitchId);
      valueCountSet1 += completionSwitchId;
      if (
        startEndFlag == 1 &&
        !$gameSwitches.value(GAME_SWITCH.RECOLLECTION_SKIP) &&
        !$gameSwitches.value(503) &&
        !$gameSwitches.value(505)
      ) {
        let registrationFlag = 0;
        var conditionExpression;
        for (const conditionMetaKey of [
          "RegistrationC1",
          "RegistrationC2",
          "RegistrationC3"
        ]) {
          conditionExpression = eventItemMeta[conditionMetaKey];
          if (conditionExpression) {
            if (eval(conditionExpression)) {
              //データドリブン条件式のためevalを使用(意図的)
              registrationFlag = 1;
            }
          }
        }
        if (registrationFlag == 0) {
          $gameParty.gainItem($dataItems[eventItemId], 1);
        }
        $gameSwitches.setValue(completionSwitchId, true);
      }
    } else {
      if (
        startEndFlag == 1 &&
        !$gameSwitches.value(GAME_SWITCH.RECOLLECTION_SKIP) &&
        !$gameSwitches.value(503) &&
        !$gameSwitches.value(504) &&
        !$gameSwitches.value(505)
      ) {
        //135-140
        if ($gameSwitches.value(61)) {
          $gameVariables.setValue(135, $gameVariables.value(135) + 1);
        }
        if ($gameSwitches.value(62)) {
          $gameVariables.setValue(136, $gameVariables.value(136) + 1);
        }
        if ($gameSwitches.value(63)) {
          $gameVariables.setValue(137, $gameVariables.value(137) + 1);
        }
        if ($gameSwitches.value(64)) {
          $gameVariables.setValue(138, $gameVariables.value(138) + 1);
        }
        if ($gameSwitches.value(65)) {
          $gameVariables.setValue(139, $gameVariables.value(139) + 1);
        }
        if ($gameSwitches.value(66)) {
          $gameVariables.setValue(140, $gameVariables.value(140) + 1);
        }
      }
      $gameSwitches.setValue(504, false);
    }
    if (startEndFlag == 0)
      beginRegisteredEventScene(sceneParamValue, eventItemId);
    else finishRegisteredEventScene(selectionSwitchId);
  };

  //隊列順で次の表示者を決定formation_orderSelect(20,0);
  formation_orderSelect = function (targetVarId, stepDirectionId) {
    const members2 = $gameParty.members();
    const partyMembers = members2;
    const maxPartyMembersIndex = members2.length - 1;

    let partyMemberIndex1;
    let partyMemberIndex2;
    if (stepDirectionId == 0) {
      partyMemberIndex1 = maxPartyMembersIndex;
      partyMemberIndex2 = 0;
    } else {
      partyMemberIndex1 = 0;
      partyMemberIndex2 = maxPartyMembersIndex;
    }

    for (
      let memberIndex = 0;
      memberIndex <= maxPartyMembersIndex;
      memberIndex++
    ) {
      if (
        partyMembers[memberIndex].actorId() == $gameVariables.value(targetVarId)
      ) {
        if (memberIndex == partyMemberIndex1) {
          $gameVariables.setValue(
            targetVarId,
            partyMembers[partyMemberIndex2].actorId()
          );
        } else {
          let index = memberIndex + (stepDirectionId == 0 ? 1 : -1);
          $gameVariables.setValue(targetVarId, partyMembers[index].actorId());
        }
        break;
      }
    }
  };

  //隊列順で次のヒロインを決定formation_orderSelectH(20,0);//formation_orderSelectH(167,2);
  formation_orderSelectH = function (targetVarId, listModeId) {
    if (listModeId == 2) {
      const partyMembers = $gameParty.members();
      valueHeroineCoice = [];
      for (
        var memberIndex = 0;
        memberIndex <= partyMembers.length - 1;
        memberIndex++
      ) {
        if (isGirl(partyMembers[memberIndex])) {
          valueHeroineCoice.push(partyMembers[memberIndex].actorId());
        }
      }
      if (valueHeroineCoice.length >= 2) {
        $gameSwitches.setValue(targetVarId, true);
      }
    } else {
      let actorIndex1;
      let actorIndexShift;
      if (listModeId == 0) {
        actorIndex1 = valueHeroineCoice.length - 1;
        //var value4 = 0;
        actorIndexShift = 1;
      } else {
        actorIndex1 = 0;
        //var value4 = valueHeroineCoice.length-1;
        actorIndexShift = -1;
      }

      const trySetActorIndex = (index) => {
        const actorIndex = valueHeroineCoice[index];
        const actor = $gameActors.actor(actorIndex);
        if (isGirl(actor)) {
          $gameVariables.setValue(targetVarId, actorIndex);
          return true;
        }
        return false;
      };

      const len = valueHeroineCoice.length;
      const partyMembers = $gameParty.members();
      for (let i = 0; i < len; i++) {
        const currentHeroineId = valueHeroineCoice[i];
        if (currentHeroineId !== $gameVariables.value(targetVarId)) continue;
        if (currentHeroineId == valueHeroineCoice[actorIndex1]) {
          if (listModeId == 0) {
            for (var j = 0; j < len; j++) if (trySetActorIndex(j)) break;
            break;
          } else if (listModeId == 1) {
            const maxIndex = valueHeroineCoice.length - 1;
            for (var j = maxIndex; j >= 0; j--) if (trySetActorIndex(j)) break;
            break;
          }
        } else {
          const actorIndex =
            $gameActors.actor(valueHeroineCoice[i]).index() + actorIndexShift;
          const actor = partyMembers[actorIndex];
          if (actor && isGirl(actor)) {
            $gameVariables.setValue(targetVarId, actor.actorId());
            break;
          }
        }
      }
    }
  };

  //初期解説コモン+tips選択肢作成
  start_commentary = function (
    switchId,
    choiceText,
    displayType,
    displayText,
    firstPictureData,
    firstTextData,
    secondPictureData,
    secondTextData
  ) {
    if ($gameSwitches.value(427))
      showCommentaryChoice(choiceText, displayType, displayText, firstTextData);
    else unlockCommentaryEntry(switchId, choiceText, displayType, displayText);
    if (firstPictureData != "Npic") {
      valueStartCommentary2P[valueStartCommentary0] = firstPictureData;
    }
    if (firstTextData != "Nda") {
      valueStartCommentary2[valueStartCommentary0] = firstTextData;
    }
    if (secondPictureData != "Npic") {
      valueStartCommentary3P[valueStartCommentary0] = secondPictureData;
    }
    if (secondTextData != "Nda") {
      valueStartCommentary3[valueStartCommentary0] = secondTextData;
    }
    valueStartCommentary0 += 1;
    valueWordSet0 = choiceText;
  };

  //スキル習得時のコスト（反応）skill_learnFeedback(user,skill.id);
  skill_learnFeedback = function (user, skillId) {
    let feedbackMessage = ` `;
    //if($dataSkills[skillId].meta['RankMaxLearning']){
    //  feedbackMessage += `${user.name()}は\\C[16]\x1bSIN[${skillId}]\\C[0]を習得した！`;
    //  var feedbackAnimationId = 296;
    //}else{
    let feedbackAnimationId = 0;
    const maxMasteryLevel = $dataSkills[skillId].meta["Max Mastery Level"];
    const userName = user.name();
    if (maxMasteryLevel) {
      if (user.skillMasteryLevel(skillId) < 1) {
        feedbackAnimationId = 296;
      } else {
        feedbackAnimationId = 297;
      }
      if (user.skillMasteryLevel(skillId) < 1) {
        const effectName = colorTaggedText(16, `${`\x1bSIN[${skillId}]`}`);
        feedbackMessage += `${userName}は${effectName}を習得した！`;
      } else {
        const effectName2 = colorTaggedText(16, `${`\x1bSIN[${skillId}]`}`);
        feedbackMessage += `${userName}の${effectName2}がランクアップ！`;
      }
      user.gainSkillMasteryLevel(skillId, +1);
      const skillLevel = user.skillMasteryLevel(skillId);
      const maxSkillLevel = Number(maxMasteryLevel);
      feedbackMessage += ` [\\C[2]${skillLevel}/${maxSkillLevel}\\C[0]]`;
      if (skillLevel >= maxSkillLevel) {
        feedbackMessage += `${colorTaggedText(10, `<ランクマックス！>`)}`;
      }
    } else {
      const effectName3 = colorTaggedText(16, `${`\x1bSIN[${skillId}]`}`);
      feedbackMessage += `${userName}は${effectName3}を習得した！`;
      feedbackAnimationId = 296;
    }
    //};
    TickerManager.show(feedbackMessage);
    user.startAnimation(feedbackAnimationId, true, 0); //変更。アニメ追加
    passive_addCondition(user); //パッシブ
    title_battleUp(user); //タイトル
    user.refresh();
  };

  //スキル習得時のＪＰコストskill_learnJPCost(user,skill.id);
  skill_learnJPCost = function (user, skillId) {
    const rankUpPoint = Number($dataSkills[skillId].meta.RankUpPoint);
    const skillMasteryUses = user.skillMasteryUses(skillId);
    valueSkillLearnJPCost =
      rankUpPoint +
      user.skillMasteryLevel(skillId) * rankUpPoint -
      skillMasteryUses;
  };

  //クラスランク -> 解放資金(job_releaseUnlockEvent/job_releaseCostEvent用)
  const RELEASE_COST_BY_CLASS_RANK = {
    1: 3000,
    2: 10000,
    3: 100000
  };

  //クラスランク -> 要求レベル(job_releaseUnlockEvent用)
  const REQUIRED_LEVEL_BY_CLASS_RANK = {
    2: 20,
    3: 30
  };

  //クラス毎ジョブ解放スクリプト。途中セーブ禁止！
  job_releaseUnlockEvent = function (firstClassId, lastClassId) {
    const actor = $gameActors.actor(
      $gameVariables.value(GAME_VARIABLE.SELECTED_ACTOR_ID)
    );
    showActorClassReleaseOverview(actor);
    const unlockedClasses = actor.unlockedClasses();
    const costContext = { releaseCost: undefined, requiredLevel: undefined };
    let choiceIndex = 1;
    for (let classId = firstClassId; classId <= lastClassId; classId++) {
      if (unlockedClasses.some((unlockedId) => unlockedId == classId)) continue;
      addJobReleaseClassChoice(
        actor,
        classId,
        choiceIndex,
        100 + choiceIndex,
        costContext
      );
      choiceIndex++;
    }
  };

  //クラス毎ジョブ解放スクリプト。コスト支払い
  job_releaseCostEvent = function (classId) {
    const classRankIndex = Number($dataClasses[classId].meta["classRank"]);

    const goldValue = RELEASE_COST_BY_CLASS_RANK[classRankIndex];

    const soundFileName =
      classRankIndex == 3 ? "21_ClassRelease2" : "21_ClassRelease";
    AudioManager.playMe({
      name: soundFileName,
      volume: 90,
      pitch: 100,
      pan: 0
    });

    $gameParty.loseGold(goldValue);
    const effectName = colorTaggedText(2, `${goldValue}`);
    const messageText = `所持金:-${effectName}\\G`;
    CommonPopupManager.showInfo({}, messageText, null);

    let itemIndex = 0;
    if (classRankIndex >= 1) {
      for (var itemId = 1; itemId <= $dataItems.length - 1; itemId++) {
        if (!$dataItems[itemId].meta["class" + classRankIndex + "JobReleaseM"])
          continue;

        itemIndex = itemId;
        break;
      }
    }

    if (itemIndex >= 1) {
      const item = $dataItems[itemIndex];
      $gameParty.loseItem(item, 3);

      const itemName = colorTaggedText(2, `${item.name}`);
      const messageText = `アイテム:-${itemName}`;
      CommonPopupManager.showInfo({}, messageText, null);
    }

    const actor = $gameActors.actor(
      $gameVariables.value(GAME_VARIABLE.SELECTED_ACTOR_ID)
    );
    actor.unlockClass(classId);
    $gameSwitches.setValue(424, true); //初めてジョブ解放したスイッチ
  };

  //パーティ全体のアンロッククラス数,コモン43で実行
  actors_unlockedClassHit = function () {
    const classIds = new Set();
    for (const actor of $gameParty.members())
      for (const classId of actor.unlockedClasses()) classIds.add(classId);
    const groups = [
      { first: 51, last: 60, switchId: 423 },
      { first: 61, last: 70, switchId: 613 },
      { first: 71, last: 80, switchId: 614 }
    ];
    for (const group of groups)
      if (countUnlockedClassRange(classIds, group.first, group.last) >= 10)
        $gameSwitches.setValue(group.switchId, true);
  };

  //変数やスイッチのタイトル効果
  title_EffectConfi = function () {
    const items = $dataItems;
    for (let itemId = 1; itemId < items.length; itemId++) {
      const item = items[itemId];
      const resetSwitch = item && item.meta.titleEffectConfiSwi;
      if (resetSwitch) $gameSwitches.setValue(Number(resetSwitch), false);
    }
    const equippedTitleIds = $gameVariables.value(288) || [];
    for (const storedId of equippedTitleIds) {
      const itemId = Number(storedId);
      if (!(itemId >= 1)) continue;
      const item = items[itemId];
      if (item) applyTitleConfiguration(item.meta, true);
    }
    for (const storedId of valueTitleSetItemsNoSetEffect || []) {
      const item = items[Number(storedId)];
      if (!item) continue;
      const isOwned = $gameParty.hasItem(item);
      applyTitleConfiguration(item.meta, !!isOwned);
    }
  };

  //フェードインアウトワイプ演出。0消去1汎用2ワープ
  fade_wipeDirect = function (wipeTypeId) {
    var wipeImageName;
    switch (wipeTypeId) {
      case 0:
        $gameScreen._useGWTrans = "off";
        break;
      case 1:
        var wipeImageCandidates;
        if ($gameSwitches.value(GAME_SWITCH.BATTLE_MAP)) {
          wipeImageCandidates = [
            "Dunjon004",
            "Dunjon008",
            "Dunjon012",
            "Dunjon036",
            "Dunjon052",
            "Dunjon100",
            "Dunjon104",
            "Dunjon118",
            "Dunjon153",
            "Dunjon999"
          ];
        } else {
          wipeImageCandidates = [
            "Town048",
            "Town084",
            "Town092",
            "Town129",
            "Town131",
            "Town225",
            "Town309",
            "Town310",
            "Town001",
            "Town013",
            "Town014",
            "Town032",
            "Town033",
            "Town039",
            "Town041",
            "Town046"
          ];
        }
        wipeImageName =
          wipeImageCandidates[getRandomIndex(wipeImageCandidates.length)];
        break;
      case 2:
        wipeImageName = "Town129";
        break;
    }
    if (!(wipeTypeId >= 1)) return;

    $gameScreen._GWInImg = wipeImageName;
    $gameScreen._GWOutImg = wipeImageName;
    valueWipeImg = wipeImageName;
    Galv.CACHE.load("transitions", wipeImageName);
  };

  //トラップ設定
  trap_setUp = function (unusedArg1) {
    $gameSwitches.setValue(GAME_SWITCH.TEMPORARY_RESULT, false);
    const partyMembers = $gameParty.members();
    let canEvade = partyHasTrapEvasionSkill(partyMembers);
    if (!canEvade) {
      const evasionItem = findTrapEvasionItem();
      if (evasionItem) {
        $gameSwitches.setValue(GAME_SWITCH.TEMPORARY_RESULT, true);
        $gameParty.gainItem(evasionItem, -1);
        canEvade = true;
      }
    } else {
      $gameSwitches.setValue(GAME_SWITCH.TEMPORARY_RESULT, true);
    }
    if (!canEvade) return;
    showTrapEvasionAfterimage(partyMembers[0]);
  };

  function getScaledTrapValue(enemyLevelValues, multiplier) {
    const baseValue =
      Number(enemyLevelValues[getRandomIndex(enemyLevelValues.length)]) *
      multiplier;
    return Math.floor(Math.random() * (baseValue * 10)) + (baseValue + 1);
  }

  // トラップカテゴリ(valueCountSet1)→状態ID(valueCountSet2)対応表
  const TRAP_STATE_IDS_BY_CATEGORY = {
    0: 1,
    1: 1,
    2: 4, //毒
    3: 5, //暗闇
    4: 6, //沈黙
    5: 1, //激高
    6: 8, //混乱
    7: 9, //魅了
    8: 10, //睡眠
    9: 1, //スタン
    10: 0, //爆破。ＨＰダメージ
    11: 0, //吸収。ＭＰダメージ
    12: 0, //脱力。ＴＰダメージ
    13: 0 //転移。valueCountSet2に転送先のイベID
  };

  trap_starting1 = function (trapModeId, eventId) {
    const event = $gameMap.event(eventId);
    if (trapModeId == 1) {
      valueCountSet1 = getRandomIndex(13);
      const trapStateId = TRAP_STATE_IDS_BY_CATEGORY[valueCountSet1];
      if (trapStateId !== undefined) valueCountSet2 = trapStateId;
    }
    if (trapModeId != 2) return;
    const members = $gameParty.members();
    if (valueCountSet2 == 1) showClothingDamageTrap(members[0]);
    if ([4, 5, 6, 8, 9, 10].some((stateId) => valueCountSet2 == stateId))
      applyPartyStateTrap(members, valueCountSet2);
    switch (valueCountSet1) {
      case 5:
      case 9: {
        $gamePlayer.requestBalloon(2);
        const messageText = `しかし何も起こらなかった…。`;
        CommonPopupManager.showInfo({}, messageText, null);
        break;
      }
      case 10:
      case 11:
      case 12:
        applyPartyResourceTrap(members, event, valueCountSet1);
        break;
      case 13:
        activateWarpTrap();
        break;
    }
  };

  //フラッシュモブ演出flashmob_wordDirect(1,55,56,100,'Tamanegiv6',`!?`);
  flashmob_wordDirect = function (
    displayModeId,
    bannerPictureId,
    messagePictureId,
    messageText,
    fontName,
    textPictureId
  ) {
    if (displayModeId == 0) {
      $gameScreen.erasePicture(bannerPictureId);
      $gameScreen.erasePicture(messagePictureId);
    } else {
      switch (displayModeId) {
        case 1:
          var pictureName = "Screen_mobFlash";
          break;
        case 2:
          var pictureName = "Screen_hukidasi";
          break;
        case 3:
          var pictureName = "Screen_hukidasiIkari";
          break;
      }
      var pictureId = bannerPictureId;
      if (displayModeId == 1 || displayModeId == 2) {
        pic_1(2, pictureId, pictureName, 0, 100, 250, 60, 1280, 768, 0, 0);
      }
      if (displayModeId == 3) {
        pic_1(2, pictureId, pictureName, 0, 100, 255, 40, 1280, 768, 0, 0);
      }
      var pictureId = textPictureId;
      var pictureName = messageText;
      $gameScreen.setDTextPicture(`\\oc[15]\\C[15]${pictureId}`, pictureName); //\\f[b]
      $gameScreen.setDtextFont(fontName);
      var pictureId = messagePictureId;
      if (displayModeId == 1 || displayModeId == 2) {
        $gameScreen.showPicture(
          pictureId,
          "",
          1,
          640 - 240 + 60,
          384 - 80,
          100,
          100,
          0,
          0
        );
        $gameScreen.movePicture(
          pictureId,
          1,
          640 - 240,
          384 - 80,
          100,
          100,
          255,
          0,
          60
        );
      }
      if (displayModeId == 3) {
        adv_partDirectPlay(7);
        $gameScreen.dTextAlign = 1;
        $gameScreen.showPicture(pictureId, "", 1, 640, 384, 300, 300, 0, 0);
        $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 100, 255, 0, 40);
      }
      if (displayModeId == 1 || displayModeId == 3) {
        ensyutu_ikari(60, "Thunder9");
      }
    }
  };

  //獲得物等一覧表示
  get_loopListDisplay = function () {
    const windowY = valueCountSet1 <= 3 ? 250 - valueCountSet1 * 40 : 50;
    drawPagedListTextWindow(windowY, 768 - windowY);
  };

  //獲得物等一覧表示全画面
  get_loopListDisplay2 = function () {
    drawPagedListTextWindow(70, 698);
  };

  //獲得物等一覧表示２面仕様valueCountSet3 = 0;から始める
  get_loopListDisplay3 = function (isBulkSellFlag) {
    const listKindId = numericCaseValue(isBulkSellFlag);
    const rowsPerPage =
      listKindId === 1 ? 20 : listKindId === 2 ? 15 : undefined;
    const fontSize = listKindId === 1 ? 23 : listKindId === 2 ? 32 : undefined;
    let pageIndex = 1;
    let leftDisplayText = "";
    let rightDisplayText = "";
    let accumulatedText = "";
    const rows = valueIkkatuArray;
    for (let rowIndex = valueCountSet3; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      // Advance across empty slots too: otherwise the next call repeats sold rows/totals.
      valueCountSet3 = rowIndex + 1;
      if (row != 0) {
        accumulatedText += formatLoopListRow(row, listKindId);
        if (pageIndex === 1) leftDisplayText = accumulatedText;
        else rightDisplayText = accumulatedText;
      }
      if (valueCountSet3 % rowsPerPage !== 0) continue;
      if (pageIndex === 2) break;
      pageIndex = 2;
      accumulatedText = "";
    }
    WindowManager.show(1, 0, 70, 640, 698);
    WindowManager.drawText(1, `\x1bfs[${fontSize}]${leftDisplayText}`);
    if (rightDisplayText == 0) return;
    WindowManager.show(2, 640, 70, 1280, 698);
    WindowManager.drawText(2, `\x1bfs[${fontSize}]${rightDisplayText}`);
  };

  //選択肢でアイテム表示item_price()合わせて3面表示//選択肢のvalueは1からで選択肢ﾋﾟｸﾁｬは0からvalueWordArray
  get_loopChoiceDisplay1 = function (listKindId, entryCategoryId, columnCount) {
    //get_loopChoiceDisplay1(1,0,1);//クエストid1は種類 id2が0道具1武器2防具 id3が列数WindowManager.hide(0);
    //get_loopChoiceDisplay1(2,0,2);//一括売却
    //get_loopChoiceDisplay1(3,0,2);//一括売却

    //picture_motion1("linear",[0]);
    $gameVariables.setValue(GAME_VARIABLE.CHOICE_COLUMN_COUNT, columnCount);
    if (listKindId == 1) {
      //クエスト掲示
      WindowManager.show(0, 0, 0, 1280, 110);
      var titleText =
        `　　　　　　　　　　　　　　　　　　　` + `クエスト掲示板`;
      WindowManager.drawText(0, titleText);
      var choicePromptText = `　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　`;
    }
    if (listKindId == 2 || listKindId == 3) {
      //一括売却
      const selectionPromptFont = "\\FS[25]";
      const selectionPromptText =
        "対象を選択して下さい　　　　　　　　　　　　　　　　　　　　　　　　　　　";
      var choicePromptText = selectionPromptFont + selectionPromptText;
    }
    let choiceIndex = 1;
    if (listKindId == 2 || listKindId == 3) {
      const customChoiceId = 1;
      const choiceParams = {
        text: choicePromptText,
        value: -1
      };
      $gameSystem.addCustomChoice(customChoiceId, choiceParams);
    }
    let choiceText = "";
    let detailsText = "";
    valueCountArray3 = [];
    const entryIds = valueCountArray;
    const columnLayout = COLUMN_LAYOUT_BY_COUNT[columnCount];
    for (let entryIndex = 0; entryIndex < entryIds.length; entryIndex++) {
      const entryId = entryIds[entryIndex];
      if (valueWordArray != 0) choiceText = `${valueWordArray[entryIndex]}`;
      else {
        const categoryId =
          listKindId == 3 ? valueCountArray2[entryIndex] : entryCategoryId;
        choiceText = loopChoiceEntryLabel(entryId, categoryId, choiceText);
      }
      const details = loopChoiceEntryDetails(
        listKindId,
        entryCategoryId,
        entryId,
        entryIndex,
        choiceText,
        detailsText
      );
      choiceText = details.label;
      detailsText = details.text;
      $gameSystem.addCustomChoice(1, { text: choiceText, value: entryIndex });
      valueCountArray3.push(entryId);
      showLoopChoicePicture(
        listKindId,
        columnCount,
        columnLayout,
        choiceIndex,
        detailsText
      );
      choiceIndex++;
    }
  };

  //カラム数 -> 選択肢画像の座標(get_loopChoiceDisplay1用)
  const COLUMN_LAYOUT_BY_COUNT = {
    1: { x: 700, y: 120 },
    2: { x: 1000, y: 10 }
  };

  //リセット項目を表示
  reset_exeDisplay = function () {
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
    const resetFlags = $gameVariables.value(183);
    const RESET_OPTION_LABELS = {
      1: `Ｈシーンフラグ`,
      2: `挿話シーンフラグ`,
      3: `Ｈ回想履歴`,
      4: `挿話回想履歴`,
      5: `クエスト達成状況`,
      6: `各種族討伐数`,
      7: `マップ情報`,
      8: `戦闘レコード`
    };
    for (let entryIndex = 1; entryIndex <= 8; entryIndex++) {
      const label = RESET_OPTION_LABELS[entryIndex];
      const optionText =
        resetFlags[entryIndex] == 0
          ? `${label}をリセットする`
          : `${label}をリセットしない`;
      $gameVariables.setValue(800 + entryIndex, optionText);
    }
  };

  //リセット時に実行
  reset_exe1 = function () {
    resetSystemEntriesByName(
      401,
      501,
      (label) => !/NoReset|QReset|OReset|SReset/.test(label)
    );
    const resetFlags = $gameVariables.value(183);
    if (!Array.isArray(resetFlags)) return;
    if (resetFlags[1] == 0) {
      resetSystemEntriesByName(1, 1, (label) =>
        /シーン達成|SReset/.test(label)
      );
      resetFactorData("SceneFactorClearReset", true);
    }
    if (resetFlags[2] == 0)
      resetSystemEntriesByName(1, 1, (label) => /挿話達成|OReset/.test(label));
    if (resetFlags[3] == 0) removeInventoryItemsByMetaValue("EICSwitch", 103);
    if (resetFlags[4] == 0) removeInventoryItemsByMetaValue("EICSwitch", 102);
    if (resetFlags[5] == 0) {
      removeInventoryItemsByMetaValue("SG種別", 1);
      resetSystemEntriesByName(1, 1, (label) => /QReset/.test(label));
    }
    if (resetFlags[6] == 0) $gameVariables.setValue(52, Array(1001).fill(0));
    if (resetFlags[7] == 0)
      removeDatabaseItemsByMetadata(
        $dataItems,
        ["BattleMapInformation"],
        -9999
      );
    if (resetFlags[8] == 0) {
      $gameParty.clearRecord();
      deployedActorsForReset().forEach((gameActor) =>
        gameActor.clearBattleRecord()
      );
    }
    resetFactorData("EventFactorClearReset", false);
  };

  //バトルレコード一覧
  //スキルタイプ -> 戦績レコードindex(actor_battleRecordDisplay1用)
  const BATTLE_RECORD_SKILL_TYPE_IDS = [2, 5, 6, 7, 8, 12, 13];

  actor_battleRecordDisplay1 = function () {
    valueBattleRecordMVP = Array(11).fill(0);
    const partyMembers = $gameParty.members();
    updatePartyBattleRecordMvp(partyMembers);
    let recordHeaderText = `\\C[10]☆Battle Record\\C[0]\nTotalKill\nMaxAssalt\nTotalAssalt\nCritical\nOverKill\nMaxDamage\nTotalDamage\nDefead\n`;
    recordHeaderText += `\\C[10]☆Skill Count\\C[0]\nAttack\nS-Ability\nA-Ability\nW-Ability\nR-Ability\nBurst!\nChain!`;
    WindowManager.show(1, 10, 100, 250, 668);
    WindowManager.drawText(1, recordHeaderText);

    for (
      let memberIndex = 0;
      memberIndex < partyMembers.length && memberIndex < 4;
      memberIndex++
    )
      showActorBattleRecord(
        partyMembers[memberIndex],
        memberIndex,
        2 + memberIndex * 2,
        260 + memberIndex * 250
      );
  };

  //コンフィグ時に全般情報表示
  config_display = function () {
    const variableText = "\\V[58]";
    const variableText2 = "\\V[55]";
    const variableText3 = "\\V[141]";
    const partyRecordText = `${variableText}日目<${variableText2}> ${variableText3}\n`;
    let partyInfoText = `\\C[16]Party Record\\C[0]\n`;
    partyInfoText += `\\I[266]\\V[16]/\\V[13]\n`;
    partyInfoText += `F.Seed   :\\V[57]\n`;
    let cur = $gameVariables.value(321)[0];
    let max = $gameVariables.value(321)[1];
    partyInfoText += `S.Scene  :${cur}/${max}\n`;
    cur = $gameVariables.value(322)[0];
    max = $gameVariables.value(322)[1];
    partyInfoText += `H.Scene  :${cur}/${max}\n`;
    cur = $gameVariables.value(323)[0];
    max = $gameVariables.value(323)[1];
    partyInfoText += `Title    :${cur}/${max}\n`;
    cur = $gameVariables.value(324)[0];
    max = $gameVariables.value(324)[1];
    partyInfoText += `H.Title  :${cur}/${max}\n`;
    cur = $gameVariables.value(325)[0];
    max = $gameVariables.value(325)[1];
    partyInfoText += `Quest    :${cur}/${max}\n`;
    partyInfoText += `PartySize:\\V[54]\n`;
    partyInfoText += `Battle   :\\V[46]\n`;
    partyInfoText += `Victory  :\\V[47]\n`;
    partyInfoText += `Defeat   :\\V[48]\n`;
    cur = $gameSystem.escapeCount();
    partyInfoText += `Escape   :${cur}\n`;
    partyInfoText += `TotalKill:\\V[43]\n\n`;

    let miscInfoText = `${colorTaggedText(16, `[発動中の称号効果]`)}\n`;
    const itemIndexesCount = $gameVariables.value(289);
    const ItemIndexes = $gameVariables.value(288);
    for (let i = 0; i < itemIndexesCount; i++) {
      const itemIndex = ItemIndexes[i];
      if (itemIndex == 0) {
        miscInfoText += `Empty\n`;
      } else {
        const itemName = $dataItems[itemIndex].name;
        miscInfoText += `\\C[2]${itemName}\\C[0]\n`;
      }
    }

    WindowManager.show(1, 0, 0, 800, 68);
    WindowManager.drawText(1, `\\fs[25]${partyRecordText}`);
    WindowManager.show(2, 410, 68, 390, 520);
    WindowManager.drawText(2, miscInfoText);

    const partyInfoPictureId = 101;
    $gameScreen.setDTextPicture(partyInfoText, 25);
    $gameScreen.dWindowFrame = "ON";
    $gameScreen.showPicture(
      partyInfoPictureId,
      "",
      0,
      810,
      80,
      100,
      100,
      255,
      0
    );
    $gameMessage.setSelectPictureId(0, 101);
  };

  //会話時に実行
  talk_script = function () {
    const facePictureId = 86;
    const picture2 = $gameScreen.picture(facePictureId);
    if (picture2) {
      var faceName = picture2.name();
      var faceName = faceName.replace("/img/talkface/", "");
      var actorIdCode = faceName.charAt(0);
      var secondChar = faceName.charAt(1);
      if (Number(secondChar)) {
        actorIdCode += String(secondChar);
      }
    } else {
      var actorIdCode = $gameVariables.value(GAME_VARIABLE.SELECTED_ACTOR_ID);
    }
    const picMoveParam = $gameMessage._IZSTPicMoveParam[1];
    if (
      Number(actorIdCode) ==
      $gameVariables.value(GAME_VARIABLE.SELECTED_ACTOR_ID)
    ) {
      var faceName =
        $gameVariables.value(GAME_VARIABLE.SELECTED_ACTOR_ID) +
        "Actor_" +
        valueFaceSelect;
      pic_locationSet(91, 91, "/img/talkface/" + faceName, 1, 0);
      //$gameSwitches.setValue(436,true);
      //battle_bustUp(id1,$gameMessage._IZSTPicMoveParam[0]-640,picMoveParam-384,1);
      //$gameSwitches.setValue(436,false);
    } else {
      $gameSwitches.setValue(436, true);
      battle_bustUp(101, 100, picMoveParam - 384, 30);
      $gameSwitches.setValue(436, false);
    }
  };

  //変動する特徴設定
  trait_changeSetting = function (stateId) {
    switch (numericCaseValue(stateId)) {
      case 106:
        configureFaithBuff(stateId);
        break;
      case 107:
        configureMealBuff(stateId);
        break;
    }
    $gamePlayer.refresh();
  };

  //ミニステでインフォＹ軸補正値変更info_SetY($gameVariables.value(200));
  info_SetY = function (positionPresetId) {
    switch (positionPresetId) {
      case 1:
        valueInfoY = 0;
        break;
      case 2:
      case 3:
      case 4:
        valueInfoY = -100;
        break;
      case 5:
        valueInfoY = 0;
        break;
    }
  };

  //tipsを纏めて閲覧
  tips_select = function () {
    const tipNames = $gameVariables.value(532);
    const tipDescriptions = $gameVariables.value(533);
    const tipPictures = $gameVariables.value(534);
    let basePictureId = 101;
    for (var i = 0; i <= tipNames.length - 1; i++) {
      const customChoiceId = 1;
      var tipName = tipNames[i];
      if (tipName.length >= 14) {
        var tipName = tipName.substring(0, 14);
      }
      const choiceParams = {
        text: `\\fs[20]${tipName}\\fs[28]`,
        value: i + 1
      };
      $gameSystem.addCustomChoice(customChoiceId, choiceParams);
      const tipDescription = tipDescriptions[i];
      if (tipDescription != 0) {
        $gameScreen.setDTextPicture(
          `\\C[16]${tipNames[i]}\\C[0]:\n${tipDescription}`,
          28
        );
        $gameScreen.dWindowFrame = "ON";
        $gameScreen.showPicture(
          i + basePictureId + 1,
          "",
          0,
          334,
          10,
          100,
          100,
          255,
          0
        );
        $gameMessage.setSelectPictureId(i, i + basePictureId + 1);
      }
      const tipPicture = tipPictures[i];
      if (tipPicture && tipPicture[0] != 0) {
        //$gameScreen.showPicture(i + basePictureId,$gameVariables.value(534)[i][0],$gameVariables.value(534)[i][1],
        //$gameVariables.value(534)[i][2]+334-100-50,$gameVariables.value(534)[i][3],
        //$gameVariables.value(534)[i][4],$gameVariables.value(534)[i][5],$gameVariables.value(534)[i][6],0);
        $gameScreen.showPicture(
          i + basePictureId,
          tipPicture[0],
          0,
          334,
          0,
          100,
          100,
          255,
          0
        );
        $gameMessage.setSelectPictureId(i, i + basePictureId);
      }
      basePictureId += 2;
    }
  };

  //ダンジョンから脱出スクリプト
  dungeon_escape = function () {
    if ($gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID) >= 1) {
      var escapePositionValues =
        $dataItems[
          $gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID)
        ].meta["EscapeMapID"].split(",");
      $gameVariables.setValue(161, [
        Number(escapePositionValues[0]),
        Number(escapePositionValues[1]),
        Number(escapePositionValues[2])
      ]);
      set_playerPosition2(161);
    } else {
      $gameVariables.setValue(161, [14, 26, 7]);
      set_playerPosition2(161);
    }
  };

  //街から外に出るスクリプト
  town_escape = function () {
    $gameVariables.setValue(520, Array(21).fill(0));
    const members = $gameParty.members();
    for (var i = 0; i < members.length; i++) {
      if (isGirl(members[i])) {
        const girlActorId = members[i].actorId();
        const permissionWeaponId = $gameVariables.value(230);
        if (permissionWeaponId >= 1) {
          const permissionClothMeta =
            $dataWeapons[permissionWeaponId].meta["PermissionCloth"];
          if (permissionClothMeta) {
            if (
              $gameVariables.value(440 + girlActorId)[41] ==
              Number(permissionClothMeta)
            ) {
              const actorRecords = $gameVariables.value(380 + girlActorId);
              if (actorRecords[5] > actorRecords[4]) {
                $gameVariables.value(520)[girlActorId] =
                  Number(permissionClothMeta);
              }
            }
          }
        }
      }
    }
    const escapeSourceVarId = 204;
    const escapeSource = $gameVariables.value(escapeSourceVarId);
    const escapeMapId = escapeSource[0];
    const escapeMapX = escapeSource[1];
    const escapeMapY = escapeSource[2];
    if (escapeMapId >= 1) {
      $gamePlayer.reserveTransfer(escapeMapId, escapeMapX, escapeMapY, 2, 2);
    } else {
      $gamePlayer.reserveTransfer(14, 2, 2, 2, 2);
    }
  };

  //指定衣装OKな町から出た後、次マップで露出超過なら通常衣装に戻すスクリプト。マップ最初イベントで実行
  town_startPermissionClothChange = function () {
    const actorIds = $gameVariables.value(520) || [];
    const permissionWeaponId = $gameVariables.value(230);
    const permissionWeapon =
      permissionWeaponId >= 1 ? $dataWeapons[permissionWeaponId] : null;
    const permissionActor =
      permissionWeapon && permissionWeapon.meta.PermissionCloth;
    const hasPermission =
      !!permissionActor &&
      actorIds.some(
        (actorId) => actorId >= 1 && actorId == Number(permissionActor)
      );
    if (!hasPermission)
      for (const actorId of actorIds)
        if (actorId >= 1) restoreActorTownClothing(actorId);
    $gameVariables.setValue(520, Array(21).fill(0));
  };

  //ダンジョンワプ機能スクリプト<warpShare:1>
  dungeon_warpscript = function (warpModeId) {
    if (warpModeId == 1) {
      $gameSwitches.setValue(GAME_SWITCH.TEMPORARY_RESULT, false);
      const chestId = $gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID);
      const chestMeta = $dataItems[chestId].meta;
      if (chestMeta["warpShare"]) {
        const warpShareGroupId = Number(chestMeta["warpShare"]);
        const warpPointFlags = $gameVariables.value(211);
        for (var itemId = 1; itemId <= $dataWeapons.length - 1; itemId++) {
          const itemData = $dataItems[itemId];
          if (itemData.meta["warpShare"]) {
            if (Number(itemData.meta["warpShare"]) == warpShareGroupId) {
              if (itemData.meta["warpStart"]) {
                valueScriptArray1.push(itemData.meta["warpStart"].split(","));
              }
              for (var i = 1; i <= 9; i++) {
                if (itemData.meta["warpPoint" + i]) {
                  if (warpPointFlags[itemId][i] == 1) {
                    valueScriptArray1.push(
                      itemData.meta["warpPoint" + i].split(",")
                    );
                    $gameSwitches.setValue(GAME_SWITCH.TEMPORARY_RESULT, true);
                  }
                }
              }
            }
          }
        }
      } else {
        if (chestMeta["warpStart"]) {
          valueScriptArray1.push(chestMeta["warpStart"].split(","));
        }
        const warpPointFlags = $gameVariables.value(211)[chestId];
        for (var i = 1; i <= 9; i++) {
          if (chestMeta["warpPoint" + i]) {
            if (warpPointFlags[i] == 1) {
              valueScriptArray1.push(chestMeta["warpPoint" + i].split(","));
              $gameSwitches.setValue(GAME_SWITCH.TEMPORARY_RESULT, true);
            }
          }
        }
      }
    }
  };
  function createRandomWordSegment(
    wordHeadCandidates,
    wordBodyCandidates,
    wordTailCandidates,
    shakeOffsetCandidates
  ) {
    const wordHead =
      wordHeadCandidates[getRandomIndex(wordHeadCandidates.length)];
    const wordBody =
      wordBodyCandidates[getRandomIndex(wordBodyCandidates.length)];
    const fontSize =
      wordTailCandidates[getRandomIndex(wordTailCandidates.length)];
    let shakeOffset;

    if (wordBody == ` `) {
      shakeOffset = -getRandomIndex(11);
    } else if (wordBody == `\\C[27]♥\\C[0]` || wordBody == `\\C[27]♡\\C[0]`) {
      shakeOffset = getRandomIndex(6);
    } else {
      shakeOffset =
        shakeOffsetCandidates[getRandomIndex(shakeOffsetCandidates.length)];
      if (fontSize >= 40) {
        shakeOffset += Math.ceil(fontSize / 4);
      }
    }

    return `\x1bfs[${fontSize}]${wordHead}${wordBody}\\MX[${-shakeOffset}]`;
  }

  function appendRandomWordSegments(
    targetVarId,
    count,
    wordHeadCandidates,
    wordBodyCandidates,
    wordTailCandidates,
    shakeOffsetCandidates
  ) {
    let generatedText = $gameVariables.value(targetVarId);
    for (let index = 0; index < count; index++) {
      generatedText += createRandomWordSegment(
        wordHeadCandidates,
        wordBodyCandidates,
        wordTailCandidates,
        shakeOffsetCandidates
      );
    }
    $gameVariables.setValue(targetVarId, generatedText);
  }

  //文字ランダム作成
  text_randumWord = function (
    targetVarId,
    actorIdCode,
    wordRepeatCount,
    wordHeadCandidates,
    wordBodyCandidates,
    wordTailCandidates,
    shakeOffsetCandidates
  ) {
    $gameVariables.setValue(targetVarId, `\\AT[${actorIdCode}]`);
    //var wordPart1 = `${wordPart1}\\MY[0]`;
    appendRandomWordSegments(
      targetVarId,
      wordRepeatCount,
      wordHeadCandidates,
      wordBodyCandidates,
      wordTailCandidates,
      shakeOffsetCandidates
    ); //
    if (!(wordRepeatCount >= 20)) return;

    $gameVariables.setValue(
      targetVarId,
      $gameVariables.value(targetVarId) + `\n`
    );
    appendRandomWordSegments(
      targetVarId,
      wordRepeatCount,
      wordHeadCandidates,
      wordBodyCandidates,
      wordTailCandidates,
      shakeOffsetCandidates
    ); //
    //Graphics.loadFont("GameFont","fonts/eromangasimaji.otf");
  };

  //２回目以降殲滅時にボーナス
  annihilationItem_bonus = function () {
    const chestId = Number(
      $gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID)
    );
    const chestData = $dataItems[chestId];
    if (!chestData) return;
    const chestMeta = chestData.meta;

    if (!chestMeta["TchestType"]) return;

    const chestOptions = collectChestOptions(chestMeta);
    const selectedOption = selectRandomChestOption(chestOptions);

    if (!selectedOption) return;

    const itemData = getItemAndAwardToPlayer(selectedOption);

    if (!itemData) return;
    // displayBonusMessage

    const itemName = `\\C[24]\x1bI[${itemData.iconIndex}]${itemData.name}\\C[0]`;
    valueWordSet1 = `全滅ボーナスとして${itemName}を入手した！`;

    checkForRareItemFlags(chestMeta, selectedOption.itemIndex);
  };

  // Collects all possible chest reward options from the chest metadata
  collectChestOptions = function (chestMeta) {
    const options = [];

    // Add standard chest items
    if (chestMeta["TchestType"] && chestMeta["Tchest"]) {
      const types = chestMeta["TchestType"].split(",");
      const indices = chestMeta["Tchest"].split(",");

      for (let i = 0; i < types.length; i++) {
        options.push({
          type: Number(types[i]),
          itemIndex: Number(indices[i])
        });
      }
    }

    // Add first annihilation item if present
    if (chestMeta["firstAnnihilationItem"]) {
      const [type, index] = chestMeta["firstAnnihilationItem"].split(",");
      options.push({
        type: Number(type),
        itemIndex: Number(index)
      });
    }

    // Add chest-only bonus item if present
    if (chestMeta["TchestOnly"]) {
      const [, , , type, index] = chestMeta["TchestOnly"].split(",");
      options.push({
        type: Number(type),
        itemIndex: Number(index)
      });
    }

    return options.filter((option) => {
      const database = getItemEquipmentSource(option.type);
      return (
        Number.isInteger(option.type) &&
        option.type >= 0 &&
        option.type <= 2 &&
        Number.isInteger(option.itemIndex) &&
        option.itemIndex > 0 &&
        !!database[option.itemIndex]
      );
    });
  };

  // Selects a random option from the available chest options
  selectRandomChestOption = function (options) {
    if (options.length === 0) return null;
    return options[getRandomIndex(options.length)];
  };

  // Retrieves the item based on type and index, then gives it to the player
  getItemAndAwardToPlayer = function (option) {
    if (!option) return null;
    const itemArray = getItemEquipmentSource(option.type);
    const item = itemArray[option.itemIndex];

    if (!item) return null;
    $gameParty.gainItem(item, 1);

    return {
      item: item,
      iconIndex: item.iconIndex,
      name: item.name
    };
  };

  // Checks if the selected item is a rare item and sets appropriate flags
  checkForRareItemFlags = function (chestMeta, selectedItemIndex) {
    // Check standard rare item flag
    if (
      chestMeta["TchestRere"] &&
      selectedItemIndex == Number(chestMeta["TchestRere"])
    ) {
      $gameSwitches.setValue(439, true);
      return;
    }
    // Check first annihilation rare item flag
    if (chestMeta["firstAnnihilationItem"]) {
      const firstAnnihilationIndex = Number(
        chestMeta["firstAnnihilationItem"].split(",")[1]
      );
      if (selectedItemIndex == firstAnnihilationIndex) {
        $gameSwitches.setValue(439, true);
        return;
      }
    }

    // Check chest-only rare item flag
    if (chestMeta["TchestOnly"]) {
      const chestOnlyIndex = Number(chestMeta["TchestOnly"].split(",")[4]);
      if (selectedItemIndex == chestOnlyIndex) {
        $gameSwitches.setValue(439, true);
        return;
      }
    }
  };

  //文字ピクチャを座標指定して表示しっぱなしpictureText_SetUp(1,100,`ジュク…っ\\I[12]`,28,640,384,180,'eromangasimaji')
  pictureText_SetUp = function (
    setupType,
    pictureId,
    displayText,
    textSetting,
    posX,
    posY,
    moveDuration,
    fontName
  ) {
    if (setupType == 1) {
      curveFunctions.patternScaleX = curveFunctions.getPattern("jump", [100]);
      curveFunctions.patternScaleY = curveFunctions.getPattern("jump", [100]);
      if (fontName != 0) {
        $gameScreen.setDtextFont(fontName);
      }
      $gameScreen.dTextAlign = 0;
      $gameScreen.dWindowFrame = "ON";
      $gameScreen.dTextRealTime = "ON";
      $gameScreen.setDTextPicture(displayText, textSetting);
      $gameScreen.showPicture(pictureId, "", 1, posX, posY, 0, 0, 0, 0);
      $gameScreen.movePicture(
        pictureId,
        1,
        posX,
        posY,
        100,
        100,
        255,
        0,
        moveDuration
      );
    } else {
      $gameScreen.setDtextFont("ＭＳ Ｐ明朝");
      picture_motion1("smooth", [0]);
      pic_eraseP(0, [pictureId]);
    }
  };

  //エネミーステートでドロップ
  //enemy_drop = function(user,enemy){
  //};

  learn_show_eval_is_notlearned_added_contains = function (user, skillId) {
    return (
      !user.isLearnedSkill(skillId) && user.addedSkills().contains(skillId)
    );
  };

  learn_show_eval_mastery_moreorequalof = function (
    user,
    skillId,
    minSkillMasteryLevel
  ) {
    return user.skillMasteryLevel(skillId) >= minSkillMasteryLevel;
  };

  learn_show_eval_notmax_or_islearned = function (user, skillId) {
    return (
      user.skillMasteryLevel(skillId) <
        Number($dataSkills[skillId].meta["Max Mastery Level"]) &&
      user.isLearnedSkill(skillId)
    );
  };

  learn_show_eval_is_notlearned_max_addedcontains_reqskill = function (
    user,
    skillId,
    reqSkillId
  ) {
    return (
      !user.isLearnedSkill(skillId) &&
      user.skillMasteryLevel(skillId) >=
        Number($dataSkills[skillId].meta["Max Mastery Level"]) &&
      user.addedSkills().contains(skillId) &&
      user.isLearnedSkill(reqSkillId)
    );
  };

  triggerParallelEventIfQuestAndMapMatch0 = function (
    questProgress,
    mapId,
    event_pararelStarting_param2
  ) {
    triggerParallelEventIfQuestAndMapMatch(
      questProgress,
      mapId,
      event_pararelStarting_param2,
      true,
      -1
    );
  };

  triggerParallelEventIfQuestAndMapMatch1 = function (
    questProgress,
    mapId,
    switchId,
    event_pararelStarting_param2
  ) {
    triggerParallelEventIfQuestAndMapMatch(
      questProgress,
      mapId,
      event_pararelStarting_param2,
      false,
      switchId
    );
  };

  // Renamed from triggerParallelEventIfQuestAndMapMatch
  triggerParallelEventIfQuestAndMapMatch = function (
    questProgress,
    mapId,
    eventParallelParam,
    skipGuardCheck,
    switchId
  ) {
    if ($gameVariables.value(135) != questProgress) return;
    if ($gameMap.mapId() != mapId) return;
    if (!skipGuardCheck && !$gameSwitches.value(switchId)) return; // Guard win condition check

    event_pararelStarting(0, eventParallelParam, 0);
    $gameSwitches.setValue(474, true);
  };

  scene_joukenNakami_clean_prefixes = function (text) {
    return text
      .replace("[daysReset]", "")
      .replace("[NoReset]", "")
      .replace("[夜自動]", "")
      .replace("[シーン達成]", "")
      .replace("[挿話達成]", "");
  };

  getItemEquipmentSource = function (id) {
    switch (Number(id)) {
      case 1:
        return $dataWeapons;
      case 2:
        return $dataArmors;
      default:
        return $dataItems;
    }
  };

  getItemsSourceSkillsItemsStates = function (id) {
    switch (Number(id)) {
      case 0:
        return $dataSkills;
      case 1:
        return $dataItems;
      case 2:
        return $dataStates;
      default:
        console.error(
          `getItemsSourceSkillsItemsStates: id(${id}) is not 0,1,2!`
        );
        return null;
    }
  };

  getRandomIndex = function (length) {
    return Math.floor(Math.random() * length);
  };

  getPreviousTachiePicId = function () {
    return $gameVariables.value(300);
  };

  isHEnemyOrNonAuto = function () {
    return $gameSwitches.value(370);
  };

  isGirl = function (gameActor) {
    return !!gameActor && gameActor.isStateAffected(602);
  };

  // CommonEvents
  configureCommonEvents = function (start, end, switchIdOffset) {
    for (let itemId = start; itemId <= end; itemId++) {
      const cEv = $dataCommonEvents[itemId];
      cEv.trigger = 2;
      if ($dataItems[itemId].meta["AutoEvent"]) cEv.trigger = 1;
      cEv.switchId = switchIdOffset + itemId;
    }
  };

  initializeVersionSettings = function () {
    //$gameSwitches.setValue(4,true)//体験版on
    $gameSwitches.setValue(4, false); //製品版on
    //$gameSwitches.setValue(53,true)//デバッグon
    //$gameSwitches.setValue(53,false)//デバッグoff
    $gameVariables.setValue(61, "りしゃぶるVer1.49");
  };

  setNPCInfo = function (gameVarId, metaKey, substitutionCallback) {
    $gameVariables.setValue(gameVarId, Array(101).fill(0));
    populateNPCInformation(
      $gameVariables.value(gameVarId),
      metaKey,
      substitutionCallback
    );
  };
  setNPCFamilyName = function () {
    setNPCInfo(354, "FamilyName", function (actorId) {
      return $dataWeapons[actorId + 200].name;
    });
  };
  setNPCProfession = function () {
    setNPCInfo(353, "Profession", function (actorId) {
      return $gameVariables.value(actorId + 380)[59];
    });
  };
  setItemSGType2GlossaryText123 = function () {
    const start = 1;
    const end = $dataItems.length - 1;
    for (var itemId = start; itemId <= end; itemId++) {
      let itemMeta = $dataItems[itemId].meta["SG種別"];
      if (itemMeta && Number(itemMeta) === 2) {
        scene_Glossarytext1(itemId, 218);
        scene_Glossarytext2(itemId, 213);
        scene_Glossarytext3(itemId, 219);
      }
    }
  };

  /* Checks if the scene glossary functionality is disabled.
   *
   * This function uses switch 160("シーングローサリー使用不可スイッチ") to determine if the scene glossary
   * feature should be prevented from use. When the switch is active(true), the scene glossary is disabled.
   *
   * @function isSceneGlossaryDisabled
   */
  isSceneGlossaryDisabled = function () {
    const statesCount = $dataStates.length;
    const partyMembers = $gameParty.members();
    const partyMembersCount = partyMembers.length;
    const gameSwitches = $gameSwitches;
    for (let i = 1; i < statesCount; i++) {
      for (
        let memberIndex = 0;
        memberIndex < partyMembersCount;
        memberIndex++
      ) {
        const partyMember = partyMembers[memberIndex];
        if (partyMember.getStateCounter(i) != undefined) {
          gameSwitches.setValue(GAME_SWITCH.SCENE_GLOSSARY_DISABLED, true);
          return;
        }
      }
    }

    gameSwitches.setValue(GAME_SWITCH.SCENE_GLOSSARY_DISABLED, false);
  };

  isSceneGlossaryDisabledv2 = function () {
    const stateIds = $gameVariables.value(214);
    if (!Array.isArray(stateIds) || !stateIds.length) {
      $gameSwitches.setValue(GAME_SWITCH.SCENE_GLOSSARY_DISABLED, false);
      return;
    }

    const gameSwitches = $gameSwitches;
    const gameParty = $gameParty;
    const partyMembers = gameParty.members();

    const partyMinIndex = partyMembers.length - 1;

    // Process in reverse order for potentially earlier exit
    for (let i = stateIds.length - 1; i >= 0; i--) {
      const stateId = stateIds[i];
      if (!gameParty.membersState(stateId)) continue;

      for (let memberIndex = partyMinIndex; memberIndex >= 0; memberIndex--) {
        const actor = partyMembers[memberIndex];

        if (
          actor.isStateAffected(stateId) &&
          actor.getStateCounter(stateId) !== undefined
        ) {
          gameSwitches.setValue(GAME_SWITCH.SCENE_GLOSSARY_DISABLED, true);
          return;
        }
      }
    }

    // If we get here, no matches were found
    gameSwitches.setValue(GAME_SWITCH.SCENE_GLOSSARY_DISABLED, false);
  };

  setupDateTime = function () {
    const timeget = new Date();
    const year = timeget.getFullYear();
    const month = timeget.getMonth() + 1;
    const day = timeget.getDate(); //日(1-31)。getDay()は曜日(0-6)なので使わない
    const hour = timeget.getHours();
    const min = timeget.getMinutes();
    const sec = timeget.getSeconds();
    $gameVariables.setValue(
      67,
      year + "/" + month + "/" + day + " T" + hour + ":" + min + ":" + sec
    );
  };

  showMapName = function () {
    const displayName = $gameMap.displayName();
    if (!displayName) return;
    const mapId = $gameMap.mapId();
    const specialMapName = valueMapNameSpecialStaging[mapId];
    const hasSpecialName =
      specialMapName !== undefined &&
      specialMapName !== null &&
      specialMapName !== 0;
    const mapName = hasSpecialName ? specialMapName : displayName;
    if (hasSpecialName) $dataMap.displayName = mapName;
    const nameColorId = $gameSwitches.value(GAME_SWITCH.BATTLE_MAP) ? 10 : 3;
    const coloredMapName = colorTaggedText(nameColorId, mapName);
    const messageText = `～～${coloredMapName}～～`;
    CommonPopupManager.showInfo({}, messageText, null);
  };

  evStateCleanFromActors = function (actorInitId, actorEndId, stateId) {
    for (let actorId = actorInitId; actorId <= actorEndId; actorId++) {
      const gameActor = $gameActors.actor(actorId);
      if (!gameActor) continue;
      gameActor.removeState(stateId);
    }
  };

  //#region cev 296
  ev296RemoveTempState = function (
    valueTachieChangeStateTemporary,
    parentList
  ) {
    const firstActorId = $gameVariables.value(
      GAME_VARIABLE.FIRST_DEPLOYED_ACTOR_ID
    );
    const lastActorId = $gameVariables.value(
      GAME_VARIABLE.LAST_DEPLOYED_ACTOR_ID
    );
    valueTachieChangeStateTemporary.forEach((stateId) =>
      evStateCleanFromActors(firstActorId, lastActorId, stateId)
    );
    restorePartyHeroineOutfits(() => tachie_settei2());
    parentList.setupChild($dataCommonEvents[19].list, 0);
  };
  //#endregion

  //#region cev23
  ev23StateReleaseOverTime = function (parent) {
    const firstActorId = $gameVariables.value(
      GAME_VARIABLE.FIRST_DEPLOYED_ACTOR_ID
    );
    const lastActorId = $gameVariables.value(
      GAME_VARIABLE.LAST_DEPLOYED_ACTOR_ID
    );
    const gameVariables = $gameVariables;

    // Process each state that has the timeRemove flag
    for (let stateId = 1; stateId < $dataStates.length; stateId++) {
      const state = $dataStates[stateId];
      if (!state.meta["timeRemove"]) continue;

      // If any party member has this state, log its removal
      if ($gameParty.membersState(stateId)) {
        const itemName = state.name;
        parent.sVal(
          539,
          gameVariables.value(GAME_VARIABLE.DAY_END_INFO_TEXT) +
            `${itemName}が解除された。\n`
        );
        parent.sVal(
          540,
          gameVariables.value(GAME_VARIABLE.DAY_END_INFO_LINE_COUNT) + 1
        );
      }

      // Remove the state from all actors
      evStateCleanFromActors(firstActorId, lastActorId, stateId);
    }
  };

  ev23DecreaseTPby30 = function (parent) {
    const actorIds = $gameVariables.value(GAME_VARIABLE.CHARACTER_ACTOR_IDS);
    const gameVariables = $gameVariables;

    // Reduce TP for each party member
    actorIds.forEach((actorId) => {
      $gameActors.actor(actorId).gainTp(-30);
    });

    // Log the TP reduction
    parent.sVal(
      539,
      gameVariables.value(GAME_VARIABLE.DAY_END_INFO_TEXT) +
        `パーティメンバーのTP-30\n`
    );
    parent.sVal(
      540,
      gameVariables.value(GAME_VARIABLE.DAY_END_INFO_LINE_COUNT) + 1
    );
  };
  //#endregion

  ev23MorningDayEveningNightSwitch = function (parent) {
    const gameSwitches = $gameSwitches;
    const wasNight = gameSwitches.value(GAME_SWITCH.NIGHT);
    const wasDay = gameSwitches.value(GAME_SWITCH.DAYTIME);
    for (let switchId = 13; switchId <= 15; switchId++)
      gameSwitches.setValue(switchId, false);
    if (wasNight) {
      appendDayEndInformation(parent, `朝になりました。\n`);
      gameSwitches.setValue(GAME_SWITCH.MORNING, true);
      return;
    }
    if (wasDay) {
      appendDayEndInformation(parent, `夜になりました。\n`);
      gameSwitches.setValue(GAME_SWITCH.NIGHT, true);
      return;
    }
    gameSwitches.setValue(GAME_SWITCH.DAYTIME, true);
  };

  ev23zsumaho = function () {
    WindowManager.show(
      1,
      0,
      100,
      1024,
      120 + $gameVariables.value(GAME_VARIABLE.DAY_END_INFO_LINE_COUNT) * 60
    );
  };

  ev23showElapsedMessage = function () {
    const dayNumber = $gameVariables.value(GAME_VARIABLE.ELAPSED_DAYS);
    const weekdayNumber = $gameVariables.value(GAME_VARIABLE.WEEKDAY);
    TickerManager.show(`──${dayNumber}日目(${weekdayNumber}曜日)経過──`);
  };

  resetChildEventAppearance = function () {
    const eventIds = $gameVariables.value(GAME_VARIABLE.DYNAMIC_EVENT_IDS);
    for (let eventId = 11; eventId <= 13; eventId++) {
      const childEventId = eventIds[eventId]; // this._eventId
      const mapEvent = $gameMap.event(childEventId);
      if (mapEvent) {
        mapEvent.setStepAnime(false);
        mapEvent.setWalkAnime(false);
        mapEvent.setDirection(2);
        mapEvent.resetPattern();
        mapEvent._originalPattern = 1;
        mapEvent.setAngle(45);
        mapEvent._spriteOffsetX = -12;
        mapEvent._spriteOffsetY = -12;
        if (mapEvent._kageM) mapEvent._kageM.clear();
        mapEvent.setFace(6, true, true); // For child events: mapEvent.setFace(6, true, true, 0, 6, 0, 6);
      }
    }
  };

  prepareDarknessTransition = function () {
    $gameMap.darknessOpacity = 200;
    const eventId = $gameVariables.value(GAME_VARIABLE.DYNAMIC_EVENT_IDS)[5]; // this._eventId
    const mapEvent = $gameMap.event(eventId);
    if (!mapEvent) return;

    mapEvent.setStepAnime(true);
    mapEvent.setWalkAnime(true);
    mapEvent.setAngle(0);
    mapEvent._spriteOffsetX = 0;
    mapEvent._spriteOffsetY = 0;
    mapEvent._kageM = new Game_KageMaster(mapEvent);
    mapEvent.removeFace();
    mapEvent.setOpacity(0);
  };

  updateDefaultPortraitOutsideBattle = function () {
    if (!!$gameParty.inBattle()) return;

    $gameVariables.setValue(
      GAME_VARIABLE.SELECTED_ACTOR_ID,
      $gameVariables.value(GAME_VARIABLE.PORTRAIT_ACTOR_ID)
    );
    tachie_settei2();
  };

  updateBattleGirlsPortrait = function () {
    const gamePartyBattleMembers = $gameParty.battleMembers();
    for (
      let memberIndex = 0, max = gamePartyBattleMembers.length - 1;
      memberIndex <= max;
      memberIndex++
    ) {
      const actor = gamePartyBattleMembers[memberIndex];
      if (isGirl(actor)) {
        $gameVariables.setValue(
          GAME_VARIABLE.SELECTED_ACTOR_ID,
          actor.actorId()
        );
        tachie_settei3(actor);
      }
    }
  };

  syncAndUpdateActorPortrait = function () {
    restorePartyHeroineOutfits((gameActor) => tachie_settei3(gameActor));
  };

  clearTemporaryActorState = function (parent) {
    const actorIds = $gameVariables.value(GAME_VARIABLE.CHARACTER_ACTOR_IDS);
    actorIds.forEach(function (actorId) {
      $gameActors.actor(actorId).removeState(39);
      $gameVariables.value(380 + actorId)[58] = 0;
    }, parent);
  };

  updateNPCWeaponNamesFromVariables = function (parent) {
    const actorIds = $gameVariables.value(GAME_VARIABLE.CHARACTER_ACTOR_IDS);
    actorIds.forEach(function (actorId) {
      $dataWeapons[actorId + 200].name = $gameVariables.value(
        actorId + 380
      )[50];
    }, parent);
  };

  setNPCFamilyNames = function (parent) {
    setNPCInformation(parent, 354, "FamilyName", function (actorId) {
      return $dataWeapons[actorId + 200].name;
    });
  };

  //#region setNPCInformation
  setNPCProfessions = function (parent) {
    setNPCInformation(parent, 353, "Profession", function (actorId) {
      return $gameVariables.value(actorId + 380)[59];
    });
  };

  /**
   * Sets NPC information based on substitution actor or direct metadata.
   * @param {*} parent - The parent object (for sVal method access)
   * @param {number} gameVarId - Target game variable ID to store data (353 for Profession, 354 for FamilyName)
   * @param {string} metaKey - The metadata key to look for ('Profession' or 'FamilyName')
   * @param {Function} substitutionCallback - Function that returns value for substitution actors
   */
  setNPCInformation = function (
    parent,
    gameVarId,
    metaKey,
    substitutionCallback
  ) {
    parent.sVal(gameVarId, Array(101).fill(0));
    populateNPCInformation(
      $gameVariables.value(gameVarId),
      metaKey,
      substitutionCallback
    );
  };
  //#endregion

  /* Private implementation stages: public event entry points stay unchanged. */
  function initializeStartupDatabaseNames() {
    let start = 1;
    let end = $dataWeapons.length;
    for (let weaponId = start; weaponId < end; weaponId++) {
      const weaponData = $dataWeapons[weaponId];
      if (weaponData && weaponData.name == "") {
        weaponData.name = weaponId;
      }
    }

    //操作用などの名称を変更
    //var start = 1;
    end = $dataStates.length;
    for (let stateId = start; stateId < end; stateId++) {
      const state = $dataStates[stateId];
      if (!state) continue;
      if (state.meta["起動時名前改変"]) {
        state.name = state.meta["起動時名前改変"];
      }
    }
  }

  function initializeViewpointSwitchNames(gameVariables) {
    const switches = $dataSystem.switches;
    const switchesLen = switches.length;
    const list = gameVariables.value(GAME_VARIABLE.CHARACTER_ACTOR_IDS);
    if (!Array.isArray(list)) return;
    list.forEach(function (id) {
      const gameActor = $gameActors.actor(id);
      if (!gameActor) return;
      const actorName = gameActor.name();
      switches[440 + id] = `${actorName}視点`;
    }, this);
    for (let switchId = 1; switchId < switchesLen; switchId++) {
      if (switches[switchId].match(/Battle/)) {
        switches[switchId] = switches[switchId].replace("[Battle]", "");
      }
    }
  }

  function initializeStartupItemNames(gameVariables) {
    const switches = $dataSystem.switches;
    initializeMapWeaponNames(switches);
    const numbering = {
      episode: 1,
      scene: 1,
      title: 1,
      quest: 1,
      dailyQuest: 1
    };
    const achieverActorIds = gameVariables.value(
      GAME_VARIABLE.PERSONAL_TITLE_ACTOR_IDS
    );
    const items = $dataItems;
    for (let itemId = 1; itemId < items.length; itemId++) {
      const itemData = items[itemId];
      if (!itemData || itemData.name === "") continue;
      applyStartupItemNameMetadata(itemData, switches);
      applyStartupItemNumbering(itemData, itemId, numbering, achieverActorIds);
    }
  }

  function initializeStartupResistanceTraits() {
    const normalResistStateIds = [];
    const spResistStateIds = [];
    //var start = 1;
    const end = $dataStates.length;
    for (let stateId = 1; stateId < end; stateId++) {
      const stateData = $dataStates[stateId];
      if (!stateData) continue;
      const stateCategory = stateData.meta["Category"];
      if (stateCategory == " StateNomal") {
        normalResistStateIds.push(stateId);
      } else if (stateCategory == " StateabNomal") {
        spResistStateIds.push(stateId);
      }
    }

    const pushItemTrait = (databaseEntry, meta, list) => {
      if (!meta) return;

      const resistPercent = Number(meta);
      const code = resistPercent == 0 ? 14 : 13;
      const resistRate = resistPercent == 0 ? 1 : 1 - resistPercent / 100;
      list.forEach(function (id) {
        databaseEntry.traits.push({
          code: code,
          dataId: id,
          value: resistRate
        });
      }, this);
    };

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
      const databaseLength = valueItems.length;
      for (let i = 1; i < databaseLength; i++) {
        const databaseEntry = valueItems[i];
        if (!databaseEntry) continue; // armors(possibly other) have undefined values in list

        const valueItemMeta = databaseEntry.meta;

        pushItemTrait(
          databaseEntry,
          valueItemMeta["StateabNomalResist"],
          normalResistStateIds
        );
        pushItemTrait(
          databaseEntry,
          valueItemMeta["StateSPabNomalResist"],
          spResistStateIds
        );
        if (valueItemMeta["elementRegist6"]) {
          const resistPercent = Number(valueItemMeta["elementRegist6"]);
          const elementResistRate =
            resistPercent == 0 ? 0 : 1 - resistPercent / 100;
          for (let dataId = 3; dataId <= 8; dataId++) {
            databaseEntry.traits.push({
              code: 11,
              dataId: dataId,
              value: elementResistRate
            });
          }
        }
        if (valueItemMeta["elementRegist9"]) {
          const resistPercent = Number(valueItemMeta["elementRegist9"]);
          const elementResistRate =
            resistPercent == 0 ? 0 : 1 - resistPercent / 100;
          for (let dataId = 3; dataId <= 9; dataId++) {
            databaseEntry.traits.push({
              code: 11,
              dataId: dataId,
              value: elementResistRate
            });
          }
          databaseEntry.traits.push({
            code: 11,
            dataId: 16,
            value: elementResistRate
          });
          databaseEntry.traits.push({
            code: 11,
            dataId: 17,
            value: elementResistRate
          });
        }
      }
    }
  }

  function appendUniqueMaterialLocationDescriptions() {
    const itemsCount = $dataItems.length;
    const switches = $dataSystem.switches;
    for (let i = 1; i <= 9; i++) {
      for (let itemId = 1; itemId < itemsCount; itemId++) {
        const item = $dataItems[itemId];
        if (!item) continue;
        const itemMeta = item.meta;
        if (itemMeta["UniqueMaterial" + i]) {
          const uniqueMaterials = itemMeta["UniqueMaterial" + i].split(",");
          if (itemMeta["MapSwitch"]) {
            const material = switches[Number(itemMeta["MapSwitch"])];
            $dataItems[Number(uniqueMaterials[0])].description +=
              ` ${colorTaggedText(2, `[${material}で希少採取]`)}`;
          }
        }
      }
    }
  }

  function restoreDeployedActorSurnames(gameVariables) {
    const firstActorId = gameVariables.value(
      GAME_VARIABLE.FIRST_DEPLOYED_ACTOR_ID
    );
    const lastActorId = gameVariables.value(
      GAME_VARIABLE.LAST_DEPLOYED_ACTOR_ID
    );
    for (let i = firstActorId; i <= lastActorId; i++) {
      const surnameWeapon = $dataWeapons[i + 200];
      const actorRecords = gameVariables.value(i + 380);
      if (!surnameWeapon || !Array.isArray(actorRecords)) continue;
      surnameWeapon.name = actorRecords[50];
    }
  }

  function initializeSpecialMapNames() {
    const switches = $dataSystem.switches;
    if ($dataSystem.variables[61].match(/りしゃぶる/)) {
      let familyName = $dataWeapons[315].meta["FamilyName"];
      if (familyName) {
        switches[279] = `喫茶 <${familyName}カフェ>`;
        valueMapNameSpecialStaging[200] = switches[279];
      }
      familyName = $dataWeapons[311].meta["FamilyName"];
      if (familyName) {
        switches[275] = `書店 <${familyName}古書店>`;
        valueMapNameSpecialStaging[95] = switches[275];
      }
      familyName = $dataWeapons[316].meta["FamilyName"];
      if (familyName) {
        switches[274] = `民家 <${familyName}家>`;
        valueMapNameSpecialStaging[25] = switches[274];
      }

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
    }
  }

  function populateNPCInformation(
    npcInformation,
    metaKey,
    substitutionCallback
  ) {
    const weapons = $dataWeapons;
    for (let weaponId = 301; weaponId <= 400; weaponId++) {
      const weaponData = weapons[weaponId];
      if (!weaponData || weaponData.name === "") continue;
      const weaponMeta = weaponData.meta;
      if (weaponMeta.SubstitutionActorId) {
        npcInformation[weaponId - 300] = substitutionCallback(
          Number(weaponMeta.SubstitutionActorId)
        );
      }
      if (weaponMeta[metaKey])
        npcInformation[weaponId - 300] = weaponMeta[metaKey];
    }
  }

  function restorePartyHeroineOutfits(updatePortrait) {
    const variables = $gameVariables;
    const heroineIds = variables.value(247);
    if (!Array.isArray(heroineIds)) return;
    const partyMembers = new Set($gameParty.members());
    heroineIds.forEach(function (actorId) {
      const gameActor = $gameActors.actor(actorId);
      if (!gameActor || !partyMembers.has(gameActor)) return;
      const currentOutfit = variables.value(actorId + 440);
      const savedOutfit = variables.value(actorId + 540);
      if (!Array.isArray(currentOutfit) || !Array.isArray(savedOutfit)) return;
      for (let outfitIndex = 0; outfitIndex <= 42; outfitIndex++) {
        currentOutfit[outfitIndex] = savedOutfit[outfitIndex];
      }
      variables.setValue(20, actorId);
      updatePortrait(gameActor);
    });
  }

  function appendDayEndInformation(parent, messageText) {
    parent.sVal(
      539,
      $gameVariables.value(GAME_VARIABLE.DAY_END_INFO_TEXT) + messageText
    );
    parent.sVal(
      540,
      $gameVariables.value(GAME_VARIABLE.DAY_END_INFO_LINE_COUNT) + 1
    );
  }

  function applyNumericMetadataVariables(meta, gameVariables, assignments) {
    assignments.forEach(function (assignment) {
      const metaKey = assignment[0];
      const variableId = assignment[1];
      if (meta[metaKey])
        gameVariables.setValue(variableId, Number(meta[metaKey]));
    });
  }

  function removeStateCategoryWithMessage(
    targetActor,
    category,
    remainingCount,
    messageKind
  ) {
    if (!targetActor.isStateCategoryAffected(category)) return remainingCount;
    const affectedCount = targetActor.getStateCategoryAffectedCount(category);
    const removedCount = Math.min(affectedCount, remainingCount);
    targetActor.removeStateCategory(category, removedCount);
    const targetName = targetActor.name();
    const removedAmount = colorTaggedText(3, removedCount);
    let messageText;
    switch (messageKind) {
      case "normal":
        messageText = `${targetName}の基本状態異常を${removedAmount}個回復した！`;
        break;
      case "special":
        messageText = `${targetName}の特殊状態異常を${removedAmount}個回復した！`;
        break;
      case "powerUp":
        messageText = `${targetName}の強化状態を${removedAmount}個消去した！`;
        break;
    }
    showMessage(messageText);
    return remainingCount - removedCount;
  }

  function stateRemovalMagicBonus(sourceActor, enabled, messageKind) {
    if (!enabled) return 0;
    const bonusCount = Math.floor(sourceActor.param(4) / 300);
    if (bonusCount < 1) return 0;
    if (sourceActor.isActor()) {
      const actorName = sourceActor.name();
      const magicName = colorTaggedText(16, "Magic");
      const bonusAmount = colorTaggedText(3, "+" + bonusCount);
      const messageText =
        messageKind === "recovery"
          ? `${actorName}の${magicName}により回復数${bonusAmount}！`
          : `${actorName}の${magicName}により消去数${bonusAmount}！`;
      showMessage(messageText);
    }
    return bonusCount;
  }

  function activateDispelGuard(targetActor) {
    for (
      let guardIndex = 0;
      guardIndex < valueDispelGuardState.length;
      guardIndex++
    ) {
      if (!targetActor.isStateAffected(valueDispelGuardState[guardIndex]))
        continue;
      const targetName = targetActor.name();
      const messageText = `${targetName}のディスペル・ガード効果が発動！　強化消去を無効化した。`;
      showMessage(messageText);
      if ($gameParty.inBattle()) targetActor.startAnimation(286, true, 0);
      return true;
    }
    return false;
  }

  function findTrapEvasionItem() {
    const items = $dataItems;
    for (let itemId = 1; itemId < items.length; itemId++) {
      const itemData = items[itemId];
      if (
        !itemData ||
        !itemData.meta.trapEvasion ||
        !$gameParty.hasItem(itemData)
      )
        continue;
      return itemData;
    }
    return null;
  }

  function partyHasTrapEvasionSkill(partyMembers) {
    const evasionSkillIds = new Set();
    for (let skillId = 1; skillId < $dataSkills.length; skillId++) {
      const skillData = $dataSkills[skillId];
      if (skillData && skillData.meta.trapEvasion) evasionSkillIds.add(skillId);
    }
    // Only one battleSkillsRaw call per actor; stop as soon as protection is found.
    return partyMembers.some((gameActor) =>
      gameActor
        .battleSkillsRaw()
        .some((skillId) => evasionSkillIds.has(skillId))
    );
  }

  function showTrapEvasionAfterimage(gameActor) {
    if (!gameActor) return;
    const gameMap = $gameMap;
    const player = $gamePlayer;
    gameMap.spawnEvent(136, player._realX, player._realY, true);
    const mapEvent = gameMap.event(gameMap.getLastSpawnEventId());
    if (!mapEvent) return;
    mapEvent.setImage(gameActor.characterName(), gameActor.characterIndex());
    mapEvent.setDirection(player._direction);
    mapEvent.setPattern(1);
    mapEvent._originalPattern = 1;
    mapEvent.setOpacity(250);
    mapEvent.setBlendMode(1);
    const actorName = colorTaggedText(16, gameActor.name());
    const trapName = colorTaggedText(10, "トラップ");
    const messageText = `${actorName}は${trapName}を回避した！`;
    CommonPopupManager.showInfo({}, messageText, null);
  }

  function prepareRarityPromotion(actorId) {
    promotionMaterialItemIds = [];
    promotionMaterialQuantities = [];
    preparedPromotionActorId = 0;
    const gameActor = $gameActors.actor(actorId);
    if (!gameActor) return;
    let raritySkillId = 401;
    for (let skillId = 401; skillId <= 406; skillId++) {
      if (!gameActor.isLearnedSkill(skillId)) continue;
      raritySkillId = skillId;
      break;
    }
    valueCountSet1 = raritySkillId;
    if (raritySkillId === 401) {
      valueCountSet2 = 0;
      return;
    }
    const rankKeys = Object.keys(RANK_BY_PROMOTION_DATA);
    const rankData = rankKeys
      .map((key) => RANK_BY_PROMOTION_DATA[key])
      .find((rank) => rank.promotionValue == raritySkillId);
    if (!rankData) return;
    const promotionCodeText = rankData.promotionCode;
    valueWordSet2 = `<${promotionCodeText}>昇格`;
    valueWordSet1 = rankData.promotionCode + "promotionM"; // Metadata key, not translated.
    valueCountSet2 = rankData.cost;
    for (let itemId = 1; itemId < $dataItems.length; itemId++) {
      const itemData = $dataItems[itemId];
      if (!itemData || !itemData.meta[valueWordSet1]) continue;
      promotionMaterialItemIds.push(itemId);
      promotionMaterialQuantities.push(Number(itemData.meta[valueWordSet1]));
    }
    preparedPromotionActorId = actorId;
    showRarityPromotionRequirements();
  }

  function showRarityPromotionRequirements() {
    let messageText = `${valueWordSet2}\n`;
    for (
      let materialIndex = 0;
      materialIndex < promotionMaterialItemIds.length;
      materialIndex++
    ) {
      const itemId = promotionMaterialItemIds[materialIndex];
      const itemData = $dataItems[itemId];
      const itemName = `\x1bIIN[${itemId}]`;
      const requiredAmount = colorTaggedText(
        10,
        promotionMaterialQuantities[materialIndex]
      );
      const ownedItemCount = $gameParty.numItems(itemData);
      messageText += `${itemName}:${requiredAmount}個<${ownedItemCount}>\n`;
    }
    const requiredGold = colorTaggedText(10, valueCountSet2.toLocaleString());
    const currentGold = $gameParty.gold().toLocaleString();
    const goldIcon = "\\G";
    messageText += `${requiredGold}${goldIcon}<${currentGold}${goldIcon}>`;
    $gameScreen.setDTextPicture(messageText, 28);
    $gameScreen.dWindowFrame = "ON";
    $gameScreen.showPicture(100, "", 0, 150, 100, 100, 100, 0, 0);
    $gameScreen.movePicture(100, 0, 50, 100, 100, 100, 255, 0, 60);
  }

  function canPayRarityPromotion() {
    if (!preparedPromotionActorId) return false;
    if ($gameParty.gold() < valueCountSet2) return false;
    return promotionMaterialItemIds.every(
      (itemId, materialIndex) =>
        $gameParty.numItems($dataItems[itemId]) >=
        promotionMaterialQuantities[materialIndex]
    );
  }

  function payRarityPromotionMaterials(actorId) {
    if (!canPayRarityPromotion(actorId)) return;
    promotionMaterialItemIds.forEach(function (itemId, materialIndex) {
      const itemData = $dataItems[itemId];
      const quantity = promotionMaterialQuantities[materialIndex];
      $gameParty.loseItem(itemData, quantity);
      const itemName = `\x1bIIN[${itemId}]`;
      const requiredAmount = colorTaggedText(10, quantity);
      const messageText = `${itemName}を${requiredAmount}個捧げた…`;
      TickerManager.show(messageText);
    });
    $gameParty.loseGold(valueCountSet2);
    const requiredGold = colorTaggedText(10, valueCountSet2.toLocaleString());
    const goldIcon = "\\G";
    const messageText = `${requiredGold}${goldIcon}捧げた…`;
    TickerManager.show(messageText);
    preparedPromotionActorId = 0;
  }

  function describeMealBuffEffect(effectValues) {
    const effectTypeId = Number(effectValues[0]);
    const parameterId = Number(effectValues[1]);
    const effectStrength = Number(effectValues[2]);
    let traitRate = effectStrength;
    let traitLineText = "";
    switch (effectTypeId) {
      case 0:
      case 1:
      case 2: {
        const parameterName = mealBuffParameterName(effectTypeId, parameterId);
        const amount = effectStrength * 100;
        const rateText = colorTaggedText(10, `${amount}%`);
        traitLineText = parameterName + `${rateText}UP!`;
        break;
      }
      case 3: {
        const elementName = $dataSystem.elements[parameterId];
        const isIncrease = effectStrength >= 0;
        const changeText = isIncrease
          ? `${effectStrength}%UP!`
          : `${effectStrength}%DOWN!`;
        traitLineText =
          `${elementName}威力` +
          colorTaggedText(isIncrease ? 10 : 1, changeText);
        break;
      }
      case 4: {
        const elementName = $dataSystem.elements[parameterId];
        const useDirectRate =
          [10, 11, 12, 15, 20, 38, 39, 40, 41].indexOf(parameterId) >= 0;
        const isIncrease = useDirectRate ? traitRate >= 0 : !(traitRate <= 0);
        traitLineText = `${elementName}`;
        if (!useDirectRate) {
          traitLineText += `耐性`;
          if (traitRate <= 0) traitRate = traitRate - traitRate - traitRate;
        }
        const amount = effectStrength * (parameterId === 11 ? 10 : 100);
        const rateText = colorTaggedText(isIncrease ? 10 : 1, `${amount}%`);
        traitLineText += isIncrease ? `${rateText}UP!` : `${rateText}DOWN!`;
        break;
      }
    }
    return { traitRate: traitRate, traitLineText: traitLineText };
  }

  function applyMealBuffEffect(stateData, effectValues, traitRate) {
    const effectTypeId = Number(effectValues[0]);
    const effectParameterId = Number(effectValues[1]);
    const effectStrength = Number(effectValues[2]);

    switch (effectTypeId) {
      case 0:
        stateData.traits.push({
          code: 21,
          dataId: effectParameterId,
          value: 1 + traitRate
        });
        break;
      case 1:
        stateData.traits.push({
          code: 22,
          dataId: effectParameterId,
          value: traitRate
        });
        break;
      case 2:
        stateData.traits.push({
          code: 23,
          dataId: effectParameterId,
          value: 1 + traitRate
        });
        break;
      case 3:
        $gameParty.members().forEach(function (partyMember) {
          valueAttackAmplifysActorId[partyMember.actorId()][
            effectParameterId
          ] += effectStrength;
        });
        break;
      case 4:
        var traitRate = traitRate - traitRate - traitRate;
        stateData.traits.push({
          code: 11,
          dataId: effectParameterId,
          value: 1 + traitRate
        });
        break;
    }
  }

  function configureFaithBuff(stateId) {
    const stateData = $dataStates[stateId];
    stateData.traits = [];
    const traitRate = $gameVariables.value(GAME_VARIABLE.FAITH_TOTAL) / 100000;
    for (var i = 2; i <= 7; i++) {
      stateData.traits.push({ code: 21, dataId: i, value: 1 + traitRate });
    }
    if (!stateData.meta["Help Description"]) return;

    if (stateData.meta["AddDWord"]) {
      var traitText = `${stateData.meta["AddDWord"]}`;
    } else {
      var traitText = ` `;
    }
    stateData.description = `\\sim[${stateId}]:${traitText}\n\\I[659]+${traitRate * 100}%`;
  }

  function configureMealBuff(stateId) {
    const stateData = $dataStates[stateId];
    stateData.traits = [];
    const effectEntries = $gameVariables.value(GAME_VARIABLE.MEAL_BUFF_EFFECTS);
    let traitLineCount = 0;
    let descBuilder = ``;
    if (effectEntries.length >= 1) {
      for (var i = 0; i <= effectEntries.length - 1; i++) {
        var effectValues = effectEntries[i];
        if (!Array.isArray(effectValues)) continue;
        var traitRate = Number(effectValues[2]);
        var traitLineText = ``;
        const effectDescription = describeMealBuffEffect(effectValues);
        traitRate = effectDescription.traitRate;
        traitLineText = effectDescription.traitLineText;
        applyMealBuffEffect(stateData, effectValues, traitRate);
        descBuilder += `[${traitLineText}] `;
        traitLineCount += 1;
        if (traitLineCount % 5 == 0) {
          descBuilder += `\n`;
        }
      }
      const effectNote = `時間経過で解除。`;
      stateData.description = `\\sim[${stateId}]:${effectNote}\n${descBuilder}`;
    }
  }

  function numericCaseValue(value) {
    // Numeric loose comparisons previously accepted booleans/numeric strings, but not null.
    return value == null ? value : Number(value);
  }

  function copyEnemySpawnData(sourceEnemy) {
    const enemyData = Object.assign({}, sourceEnemy);
    enemyData.actions = (sourceEnemy.actions || []).map((action) =>
      Object.assign({}, action)
    );
    while (enemyData.actions.length < 4) enemyData.actions.push({ skillId: 0 });
    return enemyData;
  }

  function takeRandomSpawnOffset(offsets) {
    // Keep one RNG draw even for an exhausted offset pool, matching existing spawn order.
    const index = getRandomIndex(offsets.length);
    return offsets.splice(index, 1)[0];
  }

  function configureBossGuaranteedDrops(bossMeta) {
    const guaranteedDrops = $gameVariables.value(
      GAME_VARIABLE.BOSS_GUARANTEED_DROPS
    );
    if (!bossMeta["BossConfirmDrop"]) return;

    const guaranteedDropValues = bossMeta["BossConfirmDrop"].split(",");
    for (var i = 0; i <= 9; i++) {
      guaranteedDrops[i] = Number(guaranteedDropValues[i]);
    }
  }

  function configureBossActionData(
    bossEnemyData,
    bossMeta,
    bossEnemyValues,
    bossActionValues,
    bossSpecialActionValues
  ) {
    bossEnemyData.name = bossEnemyValues[1];
    if (!bossMeta["Sideview Battler"]) {
      bossEnemyData.battlerName = String(bossEnemyValues[2]);
    }
    bossEnemyData.battlerHue = Number(bossEnemyValues[3]);
    const actions = bossEnemyData.actions;
    for (let actionIndex = 0; actionIndex < 4; actionIndex++) {
      actions[actionIndex].skillId = actionIndex === 0 ? 900 : 0;
      bossActionValues[actionIndex] = Number(bossEnemyValues[4 + actionIndex]);
    }
    assignBossAlternateActions(
      bossActionValues,
      4,
      bossMeta.BossAddAttack,
      bossActionValues[0]
    );
    assignBossAlternateActions(
      bossActionValues,
      7,
      bossMeta.BossAddSkill,
      bossActionValues[1]
    );
    for (let actionIndex = 1; actionIndex <= 15; actionIndex++) {
      const specialActionMetadata = bossMeta["BossSpecialAction" + actionIndex];
      if (!specialActionMetadata) continue;

      const actionRow = [0, 0, 0];
      bossSpecialActionValues[actionIndex] = actionRow;
      const specialActionValues = specialActionMetadata.split(",");
      for (let fieldIndex = 0; fieldIndex < 3; fieldIndex++)
        actionRow[fieldIndex] = Number(specialActionValues[fieldIndex]);
    }
  }

  function configureBossActionDisplay(
    bossConfigId,
    bossActionValues,
    bossSpecialActionValues
  ) {
    $gameVariables.setValue(343, []);
    const addedStateIds = $gameVariables.value(343);
    const normalSkillIds = bossActionValues
      .slice(0, 10)
      .filter((skillId) => skillId >= 1);
    const specialSkillIds = [];
    for (let actionIndex = 1; actionIndex <= 15; actionIndex++) {
      const actionValues = bossSpecialActionValues[actionIndex];
      if (actionValues && actionValues[2] >= 1)
        specialSkillIds.push(actionValues[2]);
    }
    let wasDefeated = false;
    switch (numericCaseValue(bossConfigId)) {
      case 1:
        wasDefeated =
          $gameVariables.value(305)[
            $gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID)
          ] >= 1;
        break;
      case 2:
        wasDefeated = $gameVariables.value(304)[valueBossEnemyId] >= 1;
        break;
    }
    const displayedSkillIds = wasDefeated
      ? Array.from(new Set(normalSkillIds.concat(specialSkillIds)))
      : normalSkillIds;
    displayedSkillIds.forEach(function (skillId, displayIndex) {
      const skillData = $dataSkills[skillId];
      const stateId = 750 + displayIndex;
      const stateData = $dataStates[stateId];
      if (!skillData || !stateData) return;
      stateData.iconIndex = skillData.iconIndex;
      const skillName = skillData.name;
      stateData.name = `[行動]${skillName}`;
      stateData.description = skillData.description;
      addedStateIds.push(stateId);
    });
  }

  function configureBossTroop(bossMeta, bossEnemyData, bossEnemyValues) {
    const troopSetting = bossMeta.BossTroop;
    if (!troopSetting) return;
    const troopValues = troopSetting.split(",");
    const troopId = Number(troopValues[0]);
    valueTroopId = troopId;
    const troop = $dataTroops[troopId];
    const originalLeader = troop.members[0];
    let previousSpawnX = originalLeader.x;
    const bossMember = {
      enemyId: valueBossEnemiesId,
      x: previousSpawnX,
      y: originalLeader.y,
      hidden: false
    };
    troop.members = [];
    const troopMembers = troop.members;
    troop.name = bossEnemyData.name;
    troopMembers.push(bossMember);
    if (Number(troopValues[1]) !== 0) bossMember.x -= 150;
    if (bossMeta["Sideview Battler"]) bossMember.y -= 50;
    if (bossMeta.cloneShadow1)
      previousSpawnX = appendBossShadowMembers(troopMembers, bossEnemyValues);
    appendBossEntourageMembers(troopMembers, bossMeta, previousSpawnX);
  }

  function applyBossInformationStates(bossMeta, bossEnemyData) {
    const bossEnemyValues = bossMeta["BossStateInformation"]
      ? bossMeta["BossStateInformation"].split(",")
      : []; //
    const addedStateIds = $gameVariables.value(343);
    for (const stateValue of bossEnemyValues) {
      const stateId = Number(stateValue);
      if (!(stateId >= 1)) continue;
      const stateData = $dataStates[stateId];
      const bgmMetadata = stateData && stateData.meta.valueBossBgm;
      if (bgmMetadata) {
        const bgmValues = bgmMetadata.split(",");
        $gameVariables.setValue(337, [
          bgmValues[0],
          Number(bgmValues[1]),
          Number(bgmValues[2]),
          Number(bgmValues[3])
        ]);
      }
      addedStateIds.push(stateId);
    }
    appendEnemyNameConditionStates(bossEnemyData, addedStateIds);
  }

  function appendEnemyNameConditionStates(enemyData, targetStateIds) {
    valueEnemyAddState.forEach(function (stateId) {
      const stateData = $dataStates[stateId];
      if (!stateData) return;
      const meta = stateData.meta;
      if (meta.NameCondiAddState) {
        meta.NameCondiAddState.split(",").forEach(function (namePattern) {
          if (!enemyData.name.match(namePattern)) return;
          if (meta.battlerHue1) enemyData.battlerHue = Number(meta.battlerHue1);
          targetStateIds.push(stateId);
        });
      }
      if (!meta.GraphicNameCondiAddState) return;
      meta.GraphicNameCondiAddState.split(",").forEach(function (namePattern) {
        if (enemyData.battlerName.match(namePattern))
          targetStateIds.push(stateId);
      });
    });
  }

  function configureMapEnemySpawnData(enemyData, spawnValues) {
    enemyData.name = spawnValues[1];
    enemyData.battlerName = spawnValues[2];
    Galv.CACHE.load("sv_enemies", spawnValues[2]);
    enemyData.battlerHue = Number(spawnValues[3]);
    for (let actionIndex = 0; actionIndex < 4; actionIndex++) {
      enemyData.actions[actionIndex].skillId = Number(
        spawnValues[4 + actionIndex]
      );
    }
  }

  function chooseActorProfession(actorMeta, defaultProfession) {
    let newProfession = defaultProfession;
    // Check all possible profession alternatives (up to 9)
    for (let i = 1; i <= 9; i++) {
      const professionMetaKey = "Profession" + i;

      if (!actorMeta[professionMetaKey]) continue;

      const professionData = actorMeta[professionMetaKey].split(",");
      const professionName = professionData[0];
      const switchId = Number(professionData[1]);
      const variableId = Number(professionData[2]);
      const requiredValue = Number(professionData[3]);
      const requiredItemId = Number(professionData[4]);

      // Check switch condition
      if (switchId >= 1 && $gameSwitches.value(switchId)) {
        newProfession = professionName;
        continue;
      }

      // Check variable threshold condition
      if (
        variableId >= 1 &&
        $gameVariables.value(variableId) >= requiredValue
      ) {
        newProfession = professionName;
        continue;
      }

      // Check item possession condition
      if (
        requiredItemId >= 1 &&
        $gameParty.hasItem($dataItems[requiredItemId], true)
      ) {
        newProfession = professionName;
        continue;
      }
    }

    return newProfession;
  }

  function drawPagedListTextWindow(windowY, windowHeight) {
    WindowManager.show(1, 0, windowY, 1280, windowHeight);
    const pageText = window["valueWordSet" + valueCountSet3];
    const messageFont = "\\fs[28]";
    WindowManager.drawText(1, messageFont + pageText);
    valueCountSet3 += 1;
  }
  function applyRaritySkillTransition(gameActor, rankData) {
    rankData.forgetSkillIds.forEach((skillId) =>
      gameActor.forgetSkill(skillId)
    );
    rankData.learnSkillIds.forEach((skillId) => gameActor.learnSkill(skillId));
  }

  function initializeMapWeaponNames(switches) {
    const weapons = $dataWeapons;
    for (let weaponId = 1; weaponId < weapons.length; weaponId++) {
      const weaponData = weapons[weaponId];
      if (!weaponData || weaponData.name === "" || !weaponData.meta.MapSwitch)
        continue;
      weaponData.name = String(switches[Number(weaponData.meta.MapSwitch)]);
    }
  }
  function startupReferencedName(sourceTypeId, entryId, switches) {
    let database;
    switch (sourceTypeId) {
      case 0:
        database = $dataItems;
        break;
      case 1:
        database = $dataWeapons;
        break;
      case 2:
        database = $dataArmors;
        break;
      case 3:
      case 5:
        database = $dataStates;
        break;
      case 4:
        database = $dataSkills;
        break;
      case 6:
        return switches[entryId];
      default:
        return undefined;
    }
    const entryData = database[entryId];
    return entryData ? entryData.name : undefined;
  }
  function applyStartupItemNameMetadata(itemData, switches) {
    const meta = itemData.meta;
    if (meta.ItemNameAddSet) {
      const nameSettings = meta.ItemNameAddSet.split(",");
      const referenceName = startupReferencedName(
        Number(nameSettings[0]),
        Number(nameSettings[1]),
        switches
      );
      if (referenceName !== undefined) {
        itemData.name =
          Number(nameSettings[2]) === 0
            ? referenceName + itemData.name
            : itemData.name + referenceName;
      }
    }
    if (meta.annihilationTitle) {
      const targetItemId = Number(meta.annihilationTitle.split(",")[0]);
      const targetItem = $dataItems[targetItemId];
      if (targetItemId >= 20 && targetItem) {
        const targetName = targetItem.name;
        itemData.name = `${targetName}を殲滅せし者`;
      }
    }
    if (meta.MapSwitch)
      itemData.name = String(switches[Number(meta.MapSwitch)]);
  }
  function numberCommonEventItem(
    itemData,
    itemId,
    sequenceNumber,
    rangeOffset
  ) {
    const commonEvent = $dataCommonEvents[itemId];
    if (
      itemData.meta["追加コモンID"] ||
      (itemId >= 401 + rangeOffset && itemId <= 500 + rangeOffset)
    ) {
      if (commonEvent) itemData.name = commonEvent.name;
      return;
    }
    itemData.name = "[" + sequenceNumber + "]" + itemData.name;
  }
  function copyCompletedQuestItem(itemData, itemId, sequenceNumber, offset) {
    itemData.name = "[" + sequenceNumber + "]" + itemData.name;
    const completedItem = $dataItems[itemId + offset];
    if (!completedItem) return;
    completedItem.iconIndex = itemData.iconIndex;
    const itemName = itemData.name;
    completedItem.name = `${itemName}[了]`;
    completedItem.description = itemData.description;
  }
  function applyStartupItemNumbering(
    itemData,
    itemId,
    numbering,
    achieverActorIds
  ) {
    const meta = itemData.meta;
    if (!meta.EICSwitch) return;
    switch (Number(meta.EICSwitch)) {
      case 102:
        numberCommonEventItem(itemData, itemId, numbering.episode++, 0);
        break;
      case 103:
        numberCommonEventItem(itemData, itemId, numbering.scene++, 100);
        break;
      case 104:
      case 105:
        itemData.description =
          "[" + numbering.title++ + "]" + itemData.description;
        appendPersonalTitleAchiever(itemData, itemId, achieverActorIds);
        break;
      case 108:
        switch (meta["SGカテゴリ"]) {
          case "受注クエスト":
          case "ＥＸ受注クエスト":
            copyCompletedQuestItem(itemData, itemId, numbering.quest++, 100);
            break;
          case "デイリークエスト":
            copyCompletedQuestItem(
              itemData,
              itemId,
              numbering.dailyQuest++,
              50
            );
            break;
        }
        break;
    }
  }
  function appendPersonalTitleAchiever(itemData, itemId, achieverActorIds) {
    if (!itemData.meta.KojinTitle || !Array.isArray(achieverActorIds)) return;
    const achieverActorId = achieverActorIds[itemId];
    if (!(achieverActorId >= 1)) return;
    const gameActor = $gameActors.actor(achieverActorId);
    if (!gameActor) return;
    const achieverName = gameActor.name();
    itemData.description += `[達成者:${achieverName}]`;
  }
  function resetSystemEntriesByName(
    firstSwitchId,
    firstVariableId,
    shouldReset
  ) {
    const switchNames = $dataSystem.switches;
    const variableNames = $dataSystem.variables;
    for (
      let switchId = firstSwitchId;
      switchId < switchNames.length;
      switchId++
    ) {
      const switchName = switchNames[switchId];
      if (typeof switchName === "string" && shouldReset(switchName))
        $gameSwitches.setValue(switchId, false);
    }
    for (
      let variableId = firstVariableId;
      variableId < variableNames.length;
      variableId++
    ) {
      const variableName = variableNames[variableId];
      if (typeof variableName === "string" && shouldReset(variableName))
        $gameVariables.setValue(variableId, 0);
    }
  }
  function deployedActorsForReset() {
    const firstActorId = $gameVariables.value(
      GAME_VARIABLE.FIRST_DEPLOYED_ACTOR_ID
    );
    const lastActorId = $gameVariables.value(
      GAME_VARIABLE.LAST_DEPLOYED_ACTOR_ID
    );
    const actors = [];
    if (
      !Number.isInteger(firstActorId) ||
      !Number.isInteger(lastActorId) ||
      firstActorId < 1
    )
      return actors;
    for (let actorId = firstActorId; actorId <= lastActorId; actorId++) {
      const gameActor = $gameActors.actor(actorId);
      if (gameActor) actors.push(gameActor);
    }
    return actors;
  }
  function resetActorFactors(metaKey, actors) {
    const skills = $dataSkills;
    const states = $dataStates;
    for (let skillId = 1; skillId < skills.length; skillId++) {
      const skillData = skills[skillId];
      if (!skillData || !skillData.meta[metaKey]) continue;
      actors.forEach(function (gameActor) {
        if (!gameActor.isLearnedSkill(skillId)) return;
        if (skillData.meta["Max Mastery Level"])
          gameActor.setSkillMasteryLevel(skillId, 0);
        gameActor.forgetSkill(skillId);
      });
    }
    for (let stateId = 1; stateId < states.length; stateId++) {
      const stateData = states[stateId];
      if (!stateData || !stateData.meta[metaKey]) continue;
      actors.forEach(function (gameActor) {
        if (gameActor.isStateAffected(stateId)) gameActor.removeState(stateId);
      });
    }
  }
  function removeDatabaseItemsByMetadata(
    database,
    metaKeys,
    amount,
    lastEntryId
  ) {
    const lastId =
      lastEntryId === undefined
        ? database.length - 1
        : Math.min(lastEntryId, database.length - 1);
    for (let entryId = 1; entryId <= lastId; entryId++) {
      const entryData = database[entryId];
      if (!entryData) continue;
      // Checks are intentionally cumulative: two matching flags still produce two calls.
      metaKeys.forEach(function (metaKey) {
        if (entryData.meta[metaKey]) $gameParty.gainItem(entryData, amount);
      });
    }
  }
  function resetFactorData(metaKey, includeDungeonInformation) {
    resetActorFactors(metaKey, deployedActorsForReset());
    const itemMetaKeys = includeDungeonInformation
      ? ["DungeonInformation", metaKey]
      : [metaKey];
    removeDatabaseItemsByMetadata($dataItems, itemMetaKeys, -9999);
    removeDatabaseItemsByMetadata($dataWeapons, [metaKey], -9999);
    const lastArmorId =
      typeof valueArmorsLength === "number"
        ? valueArmorsLength
        : $dataArmors.length - 1;
    removeDatabaseItemsByMetadata($dataArmors, [metaKey], -9999, lastArmorId);
  }
  function removeInventoryItemsByMetaValue(metaKey, requiredValue) {
    const items = $dataItems;
    for (let itemId = 1; itemId < items.length; itemId++) {
      const itemData = items[itemId];
      if (
        !itemData ||
        !itemData.meta[metaKey] ||
        Number(itemData.meta[metaKey]) !== requiredValue
      )
        continue;
      $gameParty.gainItem(itemData, -1);
    }
  }
  function buildBattleHeroineStatus(battleMembers) {
    let text = "";
    let rowCount = 0;
    battleMembers.forEach(function (gameActor) {
      if (!isGirl(gameActor)) return;
      const actorId = gameActor.actorId();
      const actorRecords = $gameVariables.value(actorId + 380);
      const statusCount = actorRecords && actorRecords[2];
      if (!(statusCount >= 1)) return;
      if (rowCount === 0) text += "\\I[376] ";
      const actorData = $dataActors[actorId];
      const iconIndex = actorData && actorData.meta.IconGura;
      const actorLabel = iconIndex
        ? "\x1bI[" + Number(iconIndex) + "]"
        : gameActor.name();
      text += actorLabel + statusCount + " ";
      rowCount++;
    });
    if (rowCount) text += "\n";
    return { text: text, rowCount: rowCount };
  }
  function buildEnemyStateIconRows(enemies) {
    const uniqueStateIds = new Set();
    enemies.forEach(function (enemy) {
      enemy._states.forEach((stateId) => uniqueStateIds.add(stateId));
    });
    let text = "";
    let iconCount = 0;
    uniqueStateIds.forEach(function (stateId) {
      const stateData = $dataStates[stateId];
      if (!stateData || !(stateData.iconIndex >= 1) || stateData.name === "")
        return;
      text += "\x1bI[" + stateData.iconIndex + "]";
      iconCount++;
      if (iconCount % 9 === 0) text += "\n";
    });
    return { text: text, rowCount: Math.floor(iconCount / 9) };
  }
  function refundClothingRepairItem(sourceEntry, itemsToReturn) {
    if (itemsToReturn == 1 && sourceEntry) $gameParty.gainItem(sourceEntry, 1);
  }

  function initializeCoreGameRecordArrays(
    gameVariables,
    firstHeroineId,
    lastHeroineId
  ) {
    //各アクターの装備スキル配列記憶用
    gameVariables.setValue(
      GAME_VARIABLE.LEARNED_SKILL_ARRAYS,
      Array.from({ length: 21 }, () => [])
    );
    //各ステート毎の討伐数設定。主に種族対象,1が当日魔物討伐数,2が総魔物討伐数
    gameVariables.setValue(52, Array(1001).fill(0));
    //Tipsタイトルと内容配列。
    gameVariables.setValue(532, []);
    gameVariables.setValue(533, []);
    gameVariables.setValue(534, []);
    //イベントのプレイヤーの位置記憶。
    gameVariables.setValue(163, Array(1001).fill(0));
    //個別リセットフラグonoff
    gameVariables.setValue(183, [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0]); //10
    //各キャラの性欲度初期配列↓
    initializeGameVariableArrays(gameVariables, 381, 400, 101);
    //0は性欲度上限。41は初体験相手,42,43,44,45は妊娠時サイズ増加。妊娠時に計測。
    //46に直前のHｼｰﾝﾋﾟｸﾁｬ,49に初出産相手。50は苗字、51,52,53,54,55は身長体重スリーサイズ
    //56がカップ数,58はポーション耐性59は役職
    //61は当日Ｈ回数、62は当日Ｈ回数10以上の時に記録。
    //63は性欲薬使用回数(代入する)、64は日数経過時に性欲499で61が0の時。
    //65は当日獲得経験値
    //66リザルト67ｵｰﾊﾞｰｷﾙ68会心
    //71当日強姦回数、翌日凌辱事後付与。リセットはｺﾓﾝ24で個別で実行

    //46に直前のHｼｰﾝﾋﾟｸﾁｬ
    for (let actorId = firstHeroineId; actorId <= lastHeroineId; actorId++) {
      gameVariables.value(actorId + 380)[46] = 0;
    }

    //各キャラの衣装初期配列↓
    initializeGameVariableArrays(gameVariables, 441, 460, 43);
    initializeGameVariableArrays(gameVariables, 541, 560, 43);
    //計43。0は統合時のアイテムID。41は会話立ち絵用衣装指定変数代入用(TotalCloth)
    //42は露出超過回数

    //NPCのキャラごとＨ回数。
    initializeGameVariableArrays(gameVariables, 361, 380, 301);
    //計301.対応する相手とのH回数。101～200は受精した状態で1。
    //201～300は子供の数。301～400は現在の役職名。0は使用しない。
  }

  function initializeDungeonRecordArrays(gameVariables) {
    //召喚石強化配列
    gameVariables.setValue(352, Array(51).fill(0));
    //ダンジョン情報配列//計55.
    gameVariables.setValue(218, Array(55).fill(0));
    gameVariables.setValue(219, Array(55).fill(`？？？`));
    gameVariables.setValue(213, Array(55).fill(`？？？`));
    //特殊ボス討伐情報配列。情報確認用なのでリセットしない
    gameVariables.setValue(304, Array(201).fill(0));
    //ダンジョンボス討伐情報配列。情報確認用なのでリセットしない
    gameVariables.setValue(305, Array(101).fill(0));
    //宝箱の中身と種類
    gameVariables.setValue(212, Array(101).fill(0)); //<TchestOnly:1,1,1,2,21>レア宝箱用
    gameVariables.setValue(215, Array(101).fill(0));
    gameVariables.setValue(216, Array(101).fill(0));
    //ダンジョンワープ魔方陣指定
    gameVariables.setValue(
      GAME_VARIABLE.DUNGEON_WARP_POINTS,
      Array(101).fill(0)
    );
    initializeVariableRows(
      gameVariables.value(GAME_VARIABLE.DUNGEON_WARP_POINTS),
      0,
      100,
      11,
      0
    );
  }

  function initializeActorProgressArrays(gameVariables) {
    //監禁時にアクターの記憶配列。２次配列で記憶させる。0レアリティ1-10装備
    gameVariables.setValue(
      GAME_VARIABLE.CONFINED_ACTOR_RECORDS,
      Array(21).fill(0)
    );
    //収集アイテム表示用配列
    gameVariables.setValue(284, [0, 0, 0, 0, 0]);
    //簡易Hステ表示用配列
    gameVariables.setValue(283, [0, 0, 0, 0, 0]);
    //タイトル設定したIDの配列
    gameVariables.setValue(288, Array(21).fill(0));
    gameVariables.setValue(294, Array(21).fill(0));
    //くるりんドロップ動作用配列
    gameVariables.setValue(160, Array(11).fill(0));
    //各キャラ専用武器パラメータ配列//8番目は通常攻撃決定数値。9番目は奥義。10番目は強化段階
    //gameVariables.setValue(287,Array(21).fill(0));
    let weaponParameterRows = gameVariables.value(
      GAME_VARIABLE.ACTOR_WEAPON_PARAMETERS
    );
    if (!Array.isArray(weaponParameterRows)) {
      gameVariables.setValue(
        GAME_VARIABLE.ACTOR_WEAPON_PARAMETERS,
        Array(22).fill(0)
      );
      weaponParameterRows = gameVariables.value(
        GAME_VARIABLE.ACTOR_WEAPON_PARAMETERS
      );
    }
    initializeVariableRows(weaponParameterRows, 0, 21, 11, 21);
    //マスターノート入手用配列↓21まで。1から始める//計20.
    gameVariables.setValue(249, Array(20).fill(0));
    //訓練人形事前設定配列
    gameVariables.setValue(
      GAME_VARIABLE.TRAINING_DOLL_PRESET,
      Array(31).fill(1)
    ); //11から-10のｱｸﾀｰのその訓練時のトータルダメージ
    //10にターン数
    const trainingDollSettings = gameVariables.value(
      GAME_VARIABLE.TRAINING_DOLL_PRESET
    );
    trainingDollSettings[3] = 100;
    trainingDollSettings[4] = 100;
    trainingDollSettings[6] = 0; //種族指定
    //街ごと賞金額
    gameVariables.setValue(501, Array(101).fill(0));
  }

  function beginRegisteredEventScene(sceneParamValue, eventItemId) {
    if (
      $gameVariables.value(GAME_VARIABLE.SCENE_PREVIOUS_TIME_SWITCH_ID) == 0
    ) {
      for (var i = 13; i <= 15; i++) {
        if ($gameSwitches.value(i)) {
          $gameVariables.setValue(
            GAME_VARIABLE.SCENE_PREVIOUS_TIME_SWITCH_ID,
            i
          );
        }
      }
    }
    if (valueWeatherSceneSet != 0) {
      $gameSwitches.setValue(GAME_SWITCH.MORNING, false);
      $gameSwitches.setValue(GAME_SWITCH.DAYTIME, false);
      $gameSwitches.setValue(GAME_SWITCH.NIGHT, false);
      $gameSwitches.setValue(valueWeatherSceneSet, true);
    }
    if (!$gameParty.inBattle()) {
      $gamePlayer.setThrough(true);
    }
    if (!$gameParty.inBattle()) {
      $gamePlayer.setStealthMode(true);
    }
    if (eventItemId >= 1) {
      if ($gameSwitches.value(GAME_SWITCH.RECOLLECTION_SKIP)) {
        valueSceneConditions1 = true;
        valueSceneConditions2 = true;
        valueSceneConditions3 = true;
      } else {
        const eventItemMeta = $dataItems[eventItemId].meta;
        if (eventItemMeta["RegistrationC1"]) {
          valueSceneConditions1 = eventItemMeta["RegistrationC1"];
        }
        if (eventItemMeta["RegistrationC2"]) {
          valueSceneConditions2 = eventItemMeta["RegistrationC2"];
        }
        if (eventItemMeta["RegistrationC3"]) {
          valueSceneConditions3 = eventItemMeta["RegistrationC3"];
        }
      }
    }
    //$gamePlayer.setTransparent(true);//効果なし。コモンで実行
    $gameSwitches.setValue(467, true); //NPC消滅スイッチon
    $gameSwitches.setValue(468, true);
    $gameSwitches.setValue(124, true);
    $gameVariables.setValue(GAME_VARIABLE.DYNAMIC_EVENT_IDS, Array(21).fill(0));
    $gameVariables.setValue(530, sceneParamValue);
    //$gameSwitches.setValue(71,true);//ﾌﾟﾚｲﾔ移動禁止未使用
    if (!$gameParty.inBattle()) {
      $gameTemp.stopMapPlayerMovement();
    }
  }

  function finishRegisteredEventScene(selectionSwitchId) {
    restoreRegisteredSceneTime();
    if (!$gameParty.inBattle()) {
      $gamePlayer.setThrough(false);
    }
    if (!$gameParty.inBattle()) {
      $gamePlayer.setStealthMode(false);
    }
    $gameSwitches.setValue(124, false); //イベント進行時onoff
    $gameSwitches.setValue(473, false);
    $gameSwitches.setValue(505, false); //選択肢でシーン達成なし続行
    if (!$gameParty.inBattle()) {
      $gameTemp.allowMapPlayerMovement();
      $gameTemp.allowMapEventMovement();
    }
    $gameSwitches.setValue(467, false); //NPC消滅スイッチoff
    $gameSwitches.setValue(506, false); //通行人消滅スイッチoff。任意
    eraseRegisteredSceneEvents();
    valueWeatherSceneSet = 0;
    valueSceneConditions1 = true;
    valueSceneConditions2 = true;
    valueSceneConditions3 = true;
    $gameVariables.setValue(GAME_VARIABLE.DYNAMIC_EVENT_IDS, Array(21).fill(0));
    $gameVariables.setValue(530, 0);
    $gameVariables.setValue(528, 0);
    if (!$gameSwitches.value(GAME_SWITCH.RECOLLECTION_SKIP)) {
      $gamePlayer.setTransparent(false);
      if ($gameSwitches.value(412)) {
        //挿話
        $gameSwitches.setValue(412, false);
      }
      if ($gameSwitches.value(469)) {
        //Ｈ
        $gameSwitches.setValue(469, false);
      }
    }
    if (!$gameParty.inBattle()) {
      drowsepost.camera.zoom(1, 60, $gamePlayer);
    }
    if (selectionSwitchId >= 2) {
      valueCountSet2 = selectionSwitchId;
      //$gameSwitches.setValue(selectionSwitchId,false);
    }
  }

  function collectTitleAchievementRecords() {
    const firstActorId = $gameVariables.value(
      GAME_VARIABLE.FIRST_DEPLOYED_ACTOR_ID
    );
    const lastActorId = $gameVariables.value(
      GAME_VARIABLE.LAST_DEPLOYED_ACTOR_ID
    );
    const criticalHitRecord = [16, 0, 0]; //会心回数
    const maxDamageDealtRecord = [2, 0, 0]; //最大与えダメージ
    const maxDamageTakenRecord = [5, 0, 0]; //最大受けダメージ
    const koCountRecord = [7, 0, 0]; //戦闘不能回数

    const customAchievementIds = [8, 9, 10, 11, 12, 13, 14];
    const skillTypeIds = BATTLE_RECORD_SKILL_TYPE_IDS;
    const topActorIds = [0, 0, 0, 0, 0, 0, 0];
    const topUseCounts = [0, 0, 0, 0, 0, 0, 0];
    for (let actorId = firstActorId; actorId <= lastActorId; actorId++) {
      const actor = $gameActors.actor(actorId);
      if (!actor) continue;
      const actorRecordId = actor.actorId();
      const actorRecords = $gameVariables.value(380 + actorRecordId);
      updateTitleAchievementLeader(
        criticalHitRecord,
        actorRecordId,
        actorRecords[68]
      );
      updateTitleAchievementLeader(
        maxDamageDealtRecord,
        actorRecordId,
        actor.attackDamageMax
      );
      updateTitleAchievementLeader(
        maxDamageTakenRecord,
        actorRecordId,
        actor.acceptDamageMax
      );
      updateTitleAchievementLeader(
        koCountRecord,
        actorRecordId,
        actor.deadCounter
      );
      //獲得実績自己設定ID
      //スキルタイプid
      //アクターID
      const useCounts = collectActorTitleSkillUses(actor, skillTypeIds);
      for (
        var skillId = 0;
        skillId <= customAchievementIds.length - 1;
        skillId++
      ) {
        if (!(useCounts[skillId] > topUseCounts[skillId])) continue;

        topUseCounts[skillId] = useCounts[skillId];
        topActorIds[skillId] = actorRecordId;
      }
    }

    var actor = $gameActors;
    const partyKillRecord = [1, 0, actor.getAllKillEnemyCounter()];
    const partyDamageDealtRecord = [3, 0, actor.attackDamageSum];
    const partyDamageTakenRecord = [6, 0, actor.acceptDamageSum];
    const partyDeathRecord = [15, 0, actor.deadCounter];

    const partyOverkillRecord = [4, 0, 0]; //全員のオーバーキル回数
    for (var itemId = firstActorId; itemId <= lastActorId; itemId++) {
      partyOverkillRecord[2] += $gameVariables.value(380 + itemId)[67];
    }

    return {
      customAchievementIds: customAchievementIds,
      topActorIds: topActorIds,
      topUseCounts: topUseCounts,
      criticalHitRecord: criticalHitRecord,
      maxDamageDealtRecord: maxDamageDealtRecord,
      maxDamageTakenRecord: maxDamageTakenRecord,
      koCountRecord: koCountRecord,
      partyKillRecord: partyKillRecord,
      partyDamageDealtRecord: partyDamageDealtRecord,
      partyDamageTakenRecord: partyDamageTakenRecord,
      partyDeathRecord: partyDeathRecord,
      partyOverkillRecord: partyOverkillRecord
    };
  }

  function evaluateTitleCandidate(item, achievementRecords) {
    const itemMeta = item.meta;
    var titleCheckId = 2; //スイッチID。最初にtrueにして成立しない場合は途中でfalse
    var titleCheckVarId = 2; //変数id若しくは$gameVariables.value(380 + $gameVariables.value(2))の主人公Ｈ配列id
    var titleCheckThreshold = 0; //value2の値.
    var titleCheckResult = true; //
    //var value5 = 0;//汎用。必要な時に0から始める
    var titleMvpActorId = 0; //個人記録のＭＶＰアクター
    if (itemMeta["annihilationTitle"]) {
      titleCheckId = 1;
    }
    if (itemMeta["titleGetSwitch"]) {
      titleCheckId = Number(itemMeta["titleGetSwitch"]);
      //var titleCheckResult = $gameSwitches.value(titleCheckId);
    }
    if (itemMeta["titleGetVariable"]) {
      const titleGetVariableValues = itemMeta["titleGetVariable"].split(",");
      titleCheckVarId = Number(titleGetVariableValues[0]);
      titleCheckThreshold = Number(titleGetVariableValues[1]);
      titleCheckResult =
        $gameVariables.value(titleCheckVarId) >= titleCheckThreshold;
    }
    if (itemMeta["titleGetArray"]) {
      const titleGetArrayValues = itemMeta["titleGetArray"].split(",");
      titleCheckVarId = Number(titleGetArrayValues[0]);
      titleCheckThreshold = Number(titleGetArrayValues[2]);
      titleCheckResult =
        $gameVariables.value(titleCheckVarId)[Number(titleGetArrayValues[1])] >=
        titleCheckThreshold;
    }
    if (itemMeta["titleGetItems"]) {
      const titleGetItemsValues = itemMeta["titleGetItems"].split(",");
      titleCheckVarId = Number(titleGetItemsValues[0]);
      titleCheckThreshold = Number(titleGetItemsValues[1]);
      titleCheckResult =
        $gameParty.numItems($dataItems[titleCheckVarId]) >= titleCheckThreshold;
    }
    if (itemMeta["HtitleGetArray"]) {
      //主人公のみ
      const htitleGetArrayValues = itemMeta["HtitleGetArray"].split(",");
      titleCheckVarId = Number(htitleGetArrayValues[0]);
      titleCheckThreshold = Number(htitleGetArrayValues[1]);
      titleCheckResult =
        $gameVariables.value(
          380 + $gameVariables.value(GAME_VARIABLE.TRUE_PROTAGONIST_ACTOR_ID)
        )[titleCheckVarId] >= titleCheckThreshold;
    }
    if (itemMeta["titleGetSkillRank"]) {
      const titleGetSkillRankValues = itemMeta["titleGetSkillRank"].split(",");
      const members2 = $gameParty.members();
      for (var skillId = 0; skillId <= members2.length - 1; skillId++) {
        const actor = members2[skillId];
        titleCheckVarId = Number(titleGetSkillRankValues[0]);
        titleCheckThreshold = Number(titleGetSkillRankValues[1]);
        titleCheckResult =
          actor.skillMasteryLevel(titleCheckVarId) >= titleCheckThreshold;
        if (titleCheckResult) {
          titleMvpActorId = actor.actorId();
          break;
        }
      }
    }
    if (itemMeta.titleGetAchievement) {
      titleCheckId = 1;
      const achievementValues = itemMeta.titleGetAchievement.split(",");
      const achievementTypeId = Number(achievementValues[0]);
      const record = titleAchievementRecord(
        achievementRecords,
        achievementTypeId
      );
      if (record && achievementValues[1] <= record[2]) {
        titleCheckId = 2;
        if (
          achievementTypeId !== 1 &&
          achievementTypeId !== 3 &&
          achievementTypeId !== 4 &&
          achievementTypeId !== 6 &&
          achievementTypeId !== 15
        )
          titleMvpActorId = record[1];
      }
    }

    return {
      eligible: $gameSwitches.value(titleCheckId) && titleCheckResult,
      actorId: titleMvpActorId
    };
  }

  function applyTitleAward(item, itemId, titleMvpActorId) {
    $gameVariables.setValue(GAME_VARIABLE.PROCESSED_ITEM_ID, itemId);
    const titleMeta = item.meta;
    const coinAward = titleMeta.titleSenkaGet;
    if (coinAward) {
      if (!$gameSwitches.value(GAME_SWITCH.RECOLLECTION_SKIP))
        $gameParty.gainItem($dataItems[10], Number(coinAward));
      const coinCount = Number(coinAward);
      const titleName = `\x1bIIN[10]${coinCount}`;
      valueWordSetEx = `${titleName}枚獲得！`;
    }
    if (
      !(titleMvpActorId >= 1) ||
      $gameSwitches.value(GAME_SWITCH.RECOLLECTION_SKIP)
    )
      return;
    const titleOwners = $gameVariables.value(
      GAME_VARIABLE.PERSONAL_TITLE_ACTOR_IDS
    );
    titleOwners[itemId] = titleMvpActorId;
    const actorName =
      colorTaggedText(2, $gameActors.actor(titleMvpActorId).name()) + "]";
    valueWordSetEx = `\n[達成者:${actorName}`;
  }

  function appendBossShadowMembers(troopMembers, bossEnemyValues) {
    const shadowEnemyId = 57;
    const sourceEnemy = $dataEnemies[Number(bossEnemyValues[0])];
    $dataEnemies[shadowEnemyId] = copyEnemySpawnData(sourceEnemy);
    const shadowEnemy = $dataEnemies[shadowEnemyId];
    shadowEnemy.name = bossEnemyValues[1];
    shadowEnemy.battlerName = String(bossEnemyValues[2]) + "[影]";
    shadowEnemy.battlerHue = 190;
    const actions = shadowEnemy.actions;
    for (let actionIndex = 0; actionIndex < 4; actionIndex++)
      actions[actionIndex].skillId = Number(bossEnemyValues[4 + actionIndex]);
    const availableXs = [50, 100, 150, 200, -50, -100, -150];
    const availableYs = [-50, 0, 50, 100, 150, 200, 250];
    let lastSpawnX;
    for (let memberIndex = 1; memberIndex <= 7; memberIndex++) {
      lastSpawnX = takeRandomSpawnOffset(availableXs);
      const y = takeRandomSpawnOffset(availableYs);
      troopMembers.push({
        enemyId: shadowEnemyId,
        x: lastSpawnX,
        y: y,
        hidden: true
      });
    }
    return lastSpawnX;
  }

  function appendBossEntourageMembers(troopMembers, bossMeta, previousSpawnX) {
    const frontRowXs = [400, 380, 360, 340, 320, 300, 280];
    const backRowXs = [150, 140, 130, 120, 110, 100, 90, 70];
    const availableYs = [200, 220, 250, 400, 450, 470, 500];
    for (let memberIndex = 1; memberIndex <= 7; memberIndex++) {
      const metadata = bossMeta["EnemyEntourage" + memberIndex];
      if (!metadata) continue;
      const memberValues = metadata.split(",");
      const enemyId = Number(memberValues[0]);
      switch (Number(memberValues[1])) {
        case 0:
          previousSpawnX = takeRandomSpawnOffset(frontRowXs);
          break;
        case 1:
          previousSpawnX = takeRandomSpawnOffset(backRowXs);
          break;
      }
      const y = takeRandomSpawnOffset(availableYs);
      const hidden = Number(memberValues[2]) === 1;
      troopMembers.push({
        enemyId: enemyId,
        x: previousSpawnX,
        y: y,
        hidden: hidden
      });
    }
  }

  function initializeVariableRows(
    rows,
    firstRow,
    lastRow,
    columnCount,
    initialValue
  ) {
    for (let rowIndex = firstRow; rowIndex <= lastRow; rowIndex++)
      rows[rowIndex] = Array(columnCount).fill(initialValue);
  }
  function createActorOutfitPresets(presetBaseName) {
    const actorPresets = [0];
    for (let presetIndex = 1; presetIndex <= 4; presetIndex++) {
      const preset = Array(51).fill(0);
      preset[50] = `${presetBaseName}${presetIndex}`;
      actorPresets.push(preset);
    }
    return actorPresets;
  }
  function initializeHeroineOutfitPresets(
    gameVariables,
    firstActorId,
    lastActorId
  ) {
    gameVariables.setValue(GAME_VARIABLE.OUTFIT_PRESETS, Array(21).fill(0));
    const outfitPresets = gameVariables.value(GAME_VARIABLE.OUTFIT_PRESETS);
    const presetBaseName = `プリセット`;
    for (let actorId = firstActorId; actorId <= lastActorId; actorId++)
      outfitPresets[actorId] = createActorOutfitPresets(presetBaseName);
  }
  function titleAchievementRecord(records, achievementTypeId) {
    switch (achievementTypeId) {
      case 1:
        return records.partyKillRecord;
      case 2:
        return records.maxDamageDealtRecord;
      case 3:
        return records.partyDamageDealtRecord;
      case 4:
        return records.partyOverkillRecord;
      case 5:
        return records.maxDamageTakenRecord;
      case 6:
        return records.partyDamageTakenRecord;
      case 7:
        return records.koCountRecord;
      case 15:
        return records.partyDeathRecord;
      case 16:
        return records.criticalHitRecord;
      default: {
        const skillTypeIndex =
          records.customAchievementIds.indexOf(achievementTypeId);
        if (skillTypeIndex < 0) return null;
        return [
          achievementTypeId,
          records.topActorIds[skillTypeIndex],
          records.topUseCounts[skillTypeIndex]
        ];
      }
    }
  }
  function collectActorTitleSkillUses(actor, skillTypeIds) {
    const useCounts = Array(skillTypeIds.length).fill(0);
    const skills = $dataSkills;
    for (let skillId = 1; skillId < skills.length; skillId++) {
      const skill = skills[skillId];
      if (!skill || skill.name === "") continue;
      const skillTypeIndex = skillTypeIds.findIndex(
        (typeId) => skill.stypeId == typeId
      );
      if (skillTypeIndex < 0) continue;
      useCounts[skillTypeIndex] += actor.getSkillUseCounter(skillId);
    }
    return useCounts;
  }
  function showClothingDamageTrap(actor) {
    if (actor && isGirl(actor)) {
      actor.addState(62);
      if (actor.isStateAffected(62)) {
        $gamePlayer.requestAnimation(624);
        $gameVariables.setValue(
          GAME_VARIABLE.SELECTED_ACTOR_ID,
          actor.actorId()
        );
        const messageText = `衣装破損トラップが発生した！`;
        CommonPopupManager.showInfo({}, messageText, null);
        return;
      }
    }
    $gamePlayer.requestBalloon(2);
    const trapResult = colorTaggedText(3, `衣装破損トラップ未発生`);
    const messageText = `しかし何も起こらなかった…。（${trapResult}）`;
    CommonPopupManager.showInfo({}, messageText, null);
  }
  function applyPartyStateTrap(members, stateId) {
    $gamePlayer.requestAnimation(valueStateAnimeArr[stateId]);
    for (const actor of members)
      state_addFormula1([stateId, 50, actor, actor, actor.mdf, actor.luk]);
  }
  function resourceTrapProfile(trapTypeId) {
    switch (trapTypeId) {
      case 10:
        return {
          stat: "agi",
          gainMethod: "gainHp",
          resourceName: "ＨＰ",
          animationId: 623,
          hitAnimationId: 131,
          damageScale: 10,
          messageText: `足元の魔法陣から爆発が発生した！`
        };
      case 11:
        return {
          stat: "mat",
          gainMethod: "gainMp",
          resourceName: "ＭＰ",
          animationId: 625,
          hitAnimationId: 58,
          damageScale: 1,
          messageText: `吸収の魔法陣が発動した！`
        };
      case 12:
        return {
          stat: "mdf",
          gainMethod: "gainTp",
          resourceName: "ＴＰ",
          animationId: 626,
          hitAnimationId: 58,
          damageScale: 0,
          messageText: `脱力の魔法陣が発動した！`
        };
    }
    return null;
  }
  function readTrapEnemyLevels() {
    const dungeonItemId = $gameVariables.value(
      GAME_VARIABLE.DUNGEON_INFO_ITEM_ID
    );
    if (!(dungeonItemId >= 1)) return null;
    const dungeonItem = $dataItems[dungeonItemId];
    const enemyLevels = dungeonItem && dungeonItem.meta.EnemyLV;
    return enemyLevels ? enemyLevels.split(",") : null;
  }
  function showResourceTrapResult(
    actor,
    profile,
    evasionThreshold,
    randomRoll,
    damageAmount
  ) {
    const actorName = colorTaggedText(16, `${actor.name()}`);
    const evasionText = colorTaggedText(4, `${evasionThreshold}`);
    const rollText = colorTaggedText(10, `${randomRoll}`);
    if (randomRoll > evasionThreshold) {
      const damageText = colorTaggedText(10, `${damageAmount}`);
      const resourceName = profile.resourceName;
      const messageText = `${actorName}は${damageText}の${resourceName}ダメージを受けた！（判定：${evasionText} > ${rollText}）`;
      CommonPopupManager.showInfo({}, messageText, null);
      return;
    }
    const evasionResult = colorTaggedText(2, `回避`);
    const messageText = `${actorName}は${evasionResult}に成功した！（判定：${evasionText} > ${rollText}）`;
    CommonPopupManager.showInfo({}, messageText, null);
  }
  function applyActorResourceTrap(actor, profile, enemyLevelValues) {
    const evasionThreshold = Math.round(
      (actor[profile.stat] * 2 + actor.luk / 10) * actor.xparam(0)
    );
    // Always consume both default rolls before metadata overrides, preserving RNG order.
    let randomRoll = getRandomIndex(900) + 101;
    let damageAmount = profile.damageScale
      ? getRandomIndex(900) + 101
      : getRandomIndex(90) + 11;
    if (enemyLevelValues) {
      randomRoll = getScaledTrapValue(enemyLevelValues, 10);
      if (profile.damageScale)
        damageAmount = getScaledTrapValue(
          enemyLevelValues,
          profile.damageScale
        );
    }
    if (randomRoll > evasionThreshold) {
      $gamePlayer.requestAnimation(profile.hitAnimationId);
      actor[profile.gainMethod](-damageAmount);
    } else $gamePlayer.requestAnimation(129);
    showResourceTrapResult(
      actor,
      profile,
      evasionThreshold,
      randomRoll,
      damageAmount
    );
  }
  function applyPartyResourceTrap(members, event, trapTypeId) {
    const profile = resourceTrapProfile(trapTypeId);
    // HP announces after its animation; MP/TP announce before it. TP animates the event.
    if (trapTypeId === 10) $gamePlayer.requestAnimation(profile.animationId);
    CommonPopupManager.showInfo({}, profile.messageText, null);
    if (trapTypeId !== 10)
      (trapTypeId === 12 ? event : $gamePlayer).requestAnimation(
        profile.animationId
      );
    const enemyLevelValues = readTrapEnemyLevels();
    for (const actor of members)
      applyActorResourceTrap(actor, profile, enemyLevelValues);
  }
  function activateWarpTrap() {
    $gameVariables.setValue(161, 0);
    // Search actual event IDs, not a fixed database limit; newest/highest ID wins.
    const warpEvents = $gameMap
      .events()
      .slice()
      .sort(
        (firstEvent, secondEvent) =>
          secondEvent.eventId() - firstEvent.eventId()
      );
    for (const warpEvent of warpEvents) {
      const eventData = warpEvent.event();
      if (!eventData || !eventData.meta.warpTrap) continue;
      valueCountSet2 = warpEvent.eventId();
      $gameVariables.setValue(161, [
        $gameMap.mapId(),
        warpEvent.x,
        warpEvent.y
      ]);
      break;
    }
    const messageText = `転送トラップが発動した！`;
    CommonPopupManager.showInfo({}, messageText, null);
  }
  function isConfinementEntryEligible(entry, categoryId) {
    const entryMeta = entry.meta;
    switch (categoryId) {
      case 0:
        return (
          !!entryMeta.EICSwitch &&
          [101, 106, 109].indexOf(Number(entryMeta.EICSwitch)) >= 0
        );
      case 1:
        return true;
      case 2:
        return !!entryMeta["Not Independent item"];
      default:
        return false;
    }
  }
  function transferConfinementEntry(
    entry,
    entryId,
    storedCounts,
    isConfiscating
  ) {
    if (isConfiscating) {
      storedCounts[entryId] += $gameParty.numItems(entry);
      $gameParty.loseItem(entry, storedCounts[entryId]);
      return;
    }
    $gameParty.gainItem(entry, storedCounts[entryId]);
    storedCounts[entryId] = 0;
  }
  function transferConfinementCategory(
    confinementSlots,
    categoryId,
    isConfiscating
  ) {
    const entries = getItemEquipmentSource(categoryId);
    const lastEntryId =
      categoryId === 2 ? valueArmorsLength : entries.length - 1;
    const storedCounts = confinementSlots[categoryId];
    for (let entryId = 1; entryId <= lastEntryId; entryId++) {
      const entry = entries[entryId];
      if (!entry) continue;
      const shouldTransfer = isConfiscating
        ? $gameParty.hasItem(entry, true)
        : storedCounts[entryId];
      if (!shouldTransfer || !isConfinementEntryEligible(entry, categoryId))
        continue;
      transferConfinementEntry(entry, entryId, storedCounts, isConfiscating);
    }
  }
  function formatDefeatCountRow(row) {
    let entryName = row[0];
    if (entryName.length <= 8) {
      for (let columnIndex = entryName.length; columnIndex <= 9; columnIndex++)
        entryName += `　`;
      row[0] = entryName;
    }
    const nameText = colorTaggedText(16, `${entryName}`);
    const defeatCount = row[1];
    const countText = colorTaggedText(2, `${defeatCount}体`);
    return `　　${nameText}:${countText} \n`;
  }
  function formatBulkSaleRewards(row) {
    let rewardText = "";
    for (let rewardIndex = 2; rewardIndex <= 4; rewardIndex++) {
      const rewardAmount = row[rewardIndex];
      if (rewardAmount == 0) continue;
      const amountText = rewardAmount.toLocaleString();
      rewardText +=
        rewardIndex === 2 ? `[+${amountText}\\G]` : `[+\\I[1]${amountText}]`;
      switch (rewardIndex) {
        case 2:
          valueCountSet5 += rewardAmount;
          break;
        case 3:
          valueCountSet6 += rewardAmount;
          break;
        case 4:
          valueCountSet7 += rewardAmount;
          break;
      }
    }
    return rewardText;
  }
  function formatBulkSaleRow(row) {
    const entryName = row[0];
    const soldCount = row[1];
    valueCountSet4 += soldCount;
    const rewardText = formatBulkSaleRewards(row);
    return `${entryName}:${soldCount}個売却 ` + rewardText + "\n";
  }
  function formatLoopListRow(row, listKindId) {
    switch (listKindId) {
      case 1:
        return formatBulkSaleRow(row);
      case 2:
        return formatDefeatCountRow(row);
      default:
        return "";
    }
  }
  function loopChoiceEntryLabel(entryId, categoryId, previousLabel) {
    // Categories were strict switch cases; do not coerce a string category here.
    switch (categoryId) {
      case 0:
        return `\x1bIIN[${entryId}]`;
      case 1:
        return `\x1bWIN[${entryId}]`;
      case 2:
        return `\x1bAIN[${entryId}]`;
      default:
        return previousLabel;
    }
  }
  function loopChoiceEntryDetails(
    listKindId,
    entryCategoryId,
    entryId,
    entryIndex,
    choiceText,
    previousDetails
  ) {
    switch (numericCaseValue(listKindId)) {
      case 1: {
        const questIndex = entryId - 800;
        if (valueWordArray[entryIndex] !== `？？？`)
          return { label: choiceText, text: valueQuestArray4[questIndex] };
        const unavailableText = colorTaggedText(1, `受注不可`);
        const iconIndex = $dataItems[entryId].iconIndex;
        const unknownText = `？？？`;
        return {
          label: "[" + unavailableText + `]\x1bI[${iconIndex}]` + unknownText,
          text: valueQuestArray7[questIndex]
        };
      }
      case 2:
        item_priceinfo(entryCategoryId, entryId);
        return {
          label: choiceText,
          text: $gameVariables.value(GAME_VARIABLE.TEMPORARY_TEXT)
        };
      default:
        return { label: choiceText, text: previousDetails };
    }
  }
  function showLoopChoicePicture(
    listKindId,
    columnCount,
    columnLayout,
    choiceIndex,
    detailsText
  ) {
    if (
      !(columnCount <= 2) ||
      choiceIndex > 240 ||
      !(listKindId == 1 || listKindId == 2)
    )
      return;
    const picturePosX = columnLayout && columnLayout.x;
    const picturePosY = columnLayout && columnLayout.y;
    const selectPictureId = listKindId == 2 ? choiceIndex : choiceIndex - 1;
    const pictureId = choiceIndex + 10;
    showChoiceDescriptionPicture(
      pictureId,
      selectPictureId,
      detailsText,
      22,
      picturePosX,
      picturePosY
    );
  }
  function assignBossAlternateActions(
    actionValues,
    firstSlot,
    metadata,
    fallbackSkillId
  ) {
    const metadataValues = metadata ? metadata.split(",") : null;
    for (let offset = 0; offset < 3; offset++)
      actionValues[firstSlot + offset] = metadataValues
        ? Number(metadataValues[offset])
        : fallbackSkillId;
  }
  function restoreActorTownClothing(actorId) {
    $gameVariables.setValue(GAME_VARIABLE.SELECTED_ACTOR_ID, actorId);
    const actor = $gameActors.actor(actorId);
    const actorMeta = $dataActors[actorId].meta;
    if (!actorMeta.MainCloth) return;
    $gameVariables.setValue(
      GAME_VARIABLE.PROCESSED_ITEM_ID,
      Number(actorMeta.MainCloth)
    );
    kisekae_tyokusetusitei(
      $gameVariables.value(GAME_VARIABLE.PROCESSED_ITEM_ID),
      0
    );
    const actorName = actor.name();
    const processedEntryId = $gameVariables.value(
      GAME_VARIABLE.PROCESSED_ITEM_ID
    );
    const itemName = `\x1bIIN[${processedEntryId}]`;
    const messageText = `${actorName}は${itemName}着替えた。`;
    CommonPopupManager.showInfo({}, messageText, null);
  }
  function heroineSkillConditionMet(actor, skillMeta) {
    const switchCondition = skillMeta.MCharacterSkillLearnSwith;
    if (switchCondition && $gameSwitches.value(Number(switchCondition)))
      return true;
    const skillCondition = skillMeta.MCharacterSkillLearnSkill;
    if (skillCondition && actor.isLearnedSkill(Number(skillCondition)))
      return true;
    const rankCondition = skillMeta.MCharacterSkillLearnSRank;
    if (!rankCondition) return false;
    const rankValues = rankCondition.split(",");
    return (
      actor.skillMasteryLevel(Number(rankValues[0])) >= Number(rankValues[1])
    );
  }
  function teachCompositeActorSkill(actor, skillId, requirements) {
    if (actor.isLearnedSkill(skillId)) return;
    if (
      !requirements.every((requirement) =>
        requirement.minRank === undefined
          ? actor.isLearnedSkill(requirement.skillId)
          : actor.skillMasteryLevel(requirement.skillId) >= requirement.minRank
      )
    )
      return;
    actor.learnSkill(skillId);
    $gameVariables.setValue(GAME_VARIABLE.PROCESSED_ITEM_ID, skillId);
  }
  function configureMapEnvironmentBattlebacks(
    mapMeta,
    gameVariables,
    gameSwitches,
    gameMap
  ) {
    const isNight = gameSwitches.value(GAME_SWITCH.NIGHT);
    let backgroundKey = 0;
    let battlefrontKey = 0;
    let battlebackKey = isNight ? "StarlitSkyBattle" : "BlueSkyBattle";
    if (gameVariables.value(230) >= 1) {
      const nightSuffix = isNight ? "N" : "";
      if (gameSwitches.value(203)) {
        backgroundKey = "BG_out" + nightSuffix;
        battlefrontKey = "TownOutdoor" + nightSuffix;
      } else if (gameSwitches.value(204)) {
        backgroundKey = "BG_in" + nightSuffix;
        battlefrontKey = "TownIndoor" + nightSuffix;
      }
      if (battlefrontKey)
        gameMap.changeBattleback(battlebackKey, battlefrontKey);
    }
    if (gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID) >= 1) {
      if (mapMeta.BG2) backgroundKey = battlefrontKey = "BG2";
      if (mapMeta.BG1) battlebackKey = "BG1";
      if (isNight) {
        if (mapMeta.BGN2) backgroundKey = battlefrontKey = "BGN2";
        if (mapMeta.BGN1) battlebackKey = "BGN1";
      }
      const backMetadata = mapMeta[battlebackKey];
      const frontMetadata = mapMeta[battlefrontKey];
      if (battlefrontKey && backMetadata && frontMetadata)
        gameMap.changeBattleback(
          backMetadata.split(",")[0],
          frontMetadata.split(",")[0]
        );
    }
    return {
      backgroundKey: backgroundKey,
      battlebackKey: battlebackKey,
      battlefrontKey: battlefrontKey
    };
  }
  function applyMapBackgroundOverrides(
    dataMap,
    backgrounds,
    gameVariables,
    gameSwitches,
    gameMap
  ) {
    const meta = dataMap.meta;
    const nightSuffix = gameSwitches.value(GAME_SWITCH.NIGHT) ? "N" : "";
    const backgroundKey = "BGchange" + nightSuffix;
    const backOverride = meta["BattleBGChange1" + nightSuffix];
    const frontOverride = meta["BattleBGChange2" + nightSuffix];
    if (meta[backgroundKey])
      setMapBgVariables(gameVariables, dataMap, backgroundKey);
    if (!backOverride && !frontOverride) return;
    const battlebackName = backOverride
      ? backOverride.split(",")[0]
      : backgrounds.battlebackKey;
    const battlefrontName = frontOverride
      ? frontOverride.split(",")[0]
      : backgrounds.battlefrontKey;
    gameMap.changeBattleback(battlebackName, battlefrontName);
  }
  function applyMapMetadataParallax(mapMeta, gameVariables, gameMap) {
    const backgroundName = gameVariables.value(
      GAME_VARIABLE.MENU_BACKGROUND_NAME
    );
    if (backgroundName === 0 || !mapMeta.ParallaxSet) return;
    const scrollSpeedX = gameVariables.value(81);
    const scrollSpeedY = gameVariables.value(82);
    gameMap.changeParallax(
      backgroundName,
      scrollSpeedX !== 0,
      scrollSpeedY !== 0,
      scrollSpeedX,
      scrollSpeedY
    );
  }

  function applyTitleConfiguration(titleMeta, isActive) {
    const variableEffect = titleMeta.titleEffectConfiVal;
    if (isActive && variableEffect) {
      const effectValues = variableEffect.split(",");
      const variableId = Number(effectValues[0]);
      $gameVariables.setValue(
        variableId,
        $gameVariables.value(variableId) + Number(effectValues[1])
      );
    }
    const switchEffect = titleMeta.titleEffectConfiSwi;
    if (switchEffect) $gameSwitches.setValue(Number(switchEffect), isActive);
  }
  function partyStateDescription(stateId, stateData, partyMembers) {
    let actorText = "";
    for (const actor of partyMembers) {
      if (!actor.isStateAffected(stateId)) continue;
      const actorName = actor.name();
      actorText += colorTaggedText(16, `[${actorName}]`);
    }
    const description = stateData.description;
    return actorText + `\n${description}\n`;
  }
  function countUnlockedClassRange(classIds, firstClassId, lastClassId) {
    let count = 0;
    for (const classId of classIds)
      if (classId >= firstClassId && classId <= lastClassId) count++;
    return count;
  }
  function collectActorBattleMetrics(actor, actorId) {
    const killCount = actor.getAllKillEnemyCounter();
    const attackDamageMax = actor.attackDamageMax;
    const attackDamageSum = actor.attackDamageSum;
    const actorRecords = $gameVariables.value(380 + actorId);
    return [
      killCount,
      attackDamageMax,
      attackDamageSum,
      actorRecords[68],
      actorRecords[67],
      actor.acceptDamageMax,
      actor.acceptDamageSum,
      actor.deadCounter
    ];
  }
  function updatePartyBattleRecordMvp(partyMembers) {
    const metricColumns = Array.from({ length: 8 }, () => []);
    for (const member of partyMembers) {
      const actorId = member._actorId;
      const actor = $gameActors.actor(actorId);
      const metrics = collectActorBattleMetrics(actor, actorId);
      for (let metricIndex = 0; metricIndex < 8; metricIndex++)
        metricColumns[metricIndex].push(metrics[metricIndex]);
    }
    for (let metricIndex = 0; metricIndex < 8; metricIndex++) {
      const maximum = metricColumns[metricIndex].reduce((best, value) =>
        Math.max(best, value)
      );
      valueBattleRecordMVP[metricIndex + 1] =
        metricIndex === 4 ? maximum / 2 : maximum;
    }
  }
  function buildActorBattleRecord(actor) {
    const battleRecord = Array(21).fill(-1);
    battleRecord[0] = colorTaggedText(1, actor.name()) + "\n";
    const metrics = collectActorBattleMetrics(actor, actor.actorId());
    for (let metricIndex = 0; metricIndex < 8; metricIndex++)
      battleRecord[metricIndex + 1] = metrics[metricIndex];
    battleRecord[5] /= 2;
    battleRecord[10] = `────`;
    const skillUseCounts = collectActorTitleSkillUses(
      actor,
      BATTLE_RECORD_SKILL_TYPE_IDS
    );
    for (let typeIndex = 0; typeIndex < skillUseCounts.length; typeIndex++)
      battleRecord[11 + typeIndex] = skillUseCounts[typeIndex];
    return battleRecord;
  }
  function formatActorBattleRecord(battleRecord) {
    let text = battleRecord[0];
    for (let recordIndex = 1; recordIndex <= 20; recordIndex++) {
      const recordValue = battleRecord[recordIndex];
      if (recordValue == -1) continue;
      if (
        recordIndex <= 8 &&
        recordValue >= 1 &&
        recordValue >= valueBattleRecordMVP[recordIndex]
      )
        text += `\\I[676]\\C[2]`;
      const amountText = recordValue.toLocaleString();
      text +=
        recordValue >= 1000000000
          ? `\\fs[22]${amountText}\\C[0]\\fs[28]\n`
          : `${amountText}\\C[0]\n`;
    }
    return text;
  }
  function showActorBattleRecord(actor, memberIndex, windowId, windowX) {
    const battleRecord = buildActorBattleRecord(actor);
    window["valueBattleRecord_" + memberIndex] = battleRecord;
    battleRecord[0] = formatActorBattleRecord(battleRecord);
    WindowManager.show(windowId, windowX, 100, 250, 668);
    WindowManager.drawText(windowId, battleRecord[0]);
    WindowManager.show(windowId + 1, windowX + 40, 20, 170, 80);
    WindowManager.drawPicture(
      windowId + 1,
      "/img/battlehud/Face_" + actor.actorId()
    );
  }

  function showCommentaryChoice(
    choiceText,
    displayType,
    displayText,
    firstTextData
  ) {
    const customChoiceId = 1;
    const choiceParams = {
      text: `${choiceText}`,
      value: valueStartCommentary0
    };
    $gameSystem.addCustomChoice(customChoiceId, choiceParams);
    if (displayType == "Dpic") {
    } else {
      if (firstTextData == "Nda") {
      } else {
        displayText += `\\I[535]`;
      }
      $gameScreen.setDTextPicture(displayText, 28);
      $gameScreen.dWindowFrame = "ON";
      var pictureId = 150 + valueStartCommentary1 + valueStartCommentary0;
      var pictureName = "";
      $gameScreen.showPicture(
        pictureId,
        pictureName,
        0,
        10,
        606,
        100,
        100,
        0,
        0
      );
      $gameMessage.setSelectPictureId(valueStartCommentary0 - 1, pictureId);
    }
    if (displayType == "Npic") {
    } else {
      if (displayType == "Dpic") {
        var pictureName = "";
        $gameScreen.setDTextPicture(displayText, 28);
        $gameScreen.dWindowFrame = "ON";
        var pictureY = 100;
        var pictureX = 334;
      } else {
        var pictureName = "/img/tips/" + displayType;
        var pictureY = 0;
        var pictureX = 334;
      }
      var pictureId = 100 + valueStartCommentary1 + valueStartCommentary0;
      $gameScreen.showPicture(
        pictureId,
        pictureName,
        0,
        pictureX,
        pictureY,
        100,
        100,
        0,
        0
      );
      $gameMessage.setSelectPictureId(valueStartCommentary0 - 1, pictureId);
    }
  }

  function unlockCommentaryEntry(
    switchId,
    choiceText,
    displayType,
    displayText
  ) {
    $gameVariables.setValue(21, 0);
    $gameVariables.setValue(22, 0);
    if (!$gameSwitches.value(switchId)) {
      if (switchId >= 1) {
        $gameSwitches.setValue(switchId, true);
      }
      AudioManager.playSe({ name: "Chime1", volume: 90, pitch: 100, pan: 0 });
      $gameVariables.setValue(21, switchId);
      valueStartCommentary0 = 1;
      if (displayType == "Npic" || displayType == "Dpic") {
        var pictureName = "";
        $gameScreen.setDTextPicture(`${choiceText}\n${displayText}`, 28);
        $gameScreen.dWindowFrame = "ON";
        $gameScreen.showPicture(102, pictureName, 0, 110, 100, 100, 100, 0, 0);
      } else {
        var pictureName = "/img/tips/" + displayType;
        $gameScreen.showPicture(102, pictureName, 0, 110, 100, 100, 100, 0, 0);
        $gameVariables.setValue(22, displayText);
      }
      $gameScreen.movePicture(102, 0, 10, 10, 100, 100, 255, 0, 60);
      $gameScreen.showPicture(
        101,
        "ScreenBlackOut",
        1,
        640,
        384,
        100,
        100,
        0,
        0
      );
      $gameScreen.movePicture(101, 1, 640, 384, 100, 100, 200, 0, 60);
    }
  }

  function showChoiceDescriptionPicture(
    pictureId,
    choiceIndex,
    text,
    fontSize,
    x,
    y
  ) {
    $gameScreen.setDTextPicture(text, fontSize);
    $gameScreen.dWindowFrame = "ON";
    $gameScreen.showPicture(pictureId, "", 0, x, y, 100, 100, 0, 0);
    $gameMessage.setSelectPictureId(choiceIndex, pictureId);
  }
  function showActorClassReleaseOverview(actor) {
    const actorName = actor.name();
    $gameSystem.addCustomChoice(1, { text: `${actorName}→`, value: 0 });
    const classId = actor._classId;
    const classData = $dataClasses[classId];
    const learnings = classData.learnings;
    let learningText = "";
    let shownCount = 0;
    for (const learning of learnings) {
      if (!learning || !(learning.level >= actor.level)) continue;
      const skillId = learning.skillId;
      const level = learning.level;
      const skillDescription = $dataSkills[skillId].description;
      learningText +=
        colorTaggedText(17, `[Lv${level}]`) +
        `\x1bSIN[${skillId}]\n${skillDescription}\n`;
      if (++shownCount >= 6) break;
    }
    const className = colorTaggedText(23, `<${classData.name}>`);
    const description = classData.description;
    const additionalDescription = valueAddDescriptionClass[classId];
    const text =
      `${className}\n${description}\n${additionalDescription}\n` + learningText;
    showChoiceDescriptionPicture(100, 0, text, 22, 300, 20);
  }
  function classReleaseSkillList(classId) {
    const heading = colorTaggedText(14, `習得可能スキル`);
    let text = heading + "\n";
    const skills = $dataSkills;
    for (let skillId = 1; skillId <= 888; skillId++) {
      const skill = skills[skillId];
      const learningClass = skill.meta.SkillLearningClass;
      if (!learningClass || Number(learningClass) != classId) continue;
      const skillDescription = skill.description;
      text += `\x1bSIN[${skillId}]\n${skillDescription}\n`;
    }
    return text;
  }
  function classReleaseGoldRequirement(releaseCost) {
    const heading = colorTaggedText(14, `解放資金`);
    const costText = releaseCost.toLocaleString();
    const currentGold = $gameParty.gold();
    const goldText = currentGold.toLocaleString();
    const amountText = `（現在所持金:${goldText}）`;
    const blocked = !(currentGold >= releaseCost);
    const holdingText = blocked ? colorTaggedText(10, amountText) : amountText;
    return { text: `${heading}:${costText}${holdingText}\n`, blocked: blocked };
  }
  function classReleaseMaterialRequirement(classRank) {
    const heading = colorTaggedText(14, `解放素材`);
    let text = heading + ":";
    let requiredItem = null;
    if (classRank >= 1) {
      const metadataKey = "class" + classRank + "JobReleaseM";
      const items = $dataItems;
      for (let itemId = 1; itemId < items.length; itemId++) {
        const item = items[itemId];
        if (!item.meta[metadataKey]) continue;
        requiredItem = item;
        break;
      }
    }
    if (!requiredItem) return { text: text + `なし\n`, blocked: false };
    const itemName = requiredItem.name;
    text += `${itemName} 3個`;
    const ownedItemCount = $gameParty.numItems(requiredItem);
    if (ownedItemCount >= 1)
      return {
        text: text + `（所持数:${ownedItemCount}）\n`,
        blocked: !(ownedItemCount >= 3)
      };
    const missingText = colorTaggedText(10, `（未所持）`);
    return { text: text + missingText + "\n", blocked: true };
  }
  function classReleaseLevelRequirement(actor, classId, requiredLevel) {
    const heading = colorTaggedText(14, `解放条件`);
    const parentClassId = classId - 10;
    const className = $dataClasses[parentClassId].name;
    const currentLevel = actor.classLevel(parentClassId);
    const blocked = !(currentLevel >= requiredLevel);
    const resultText = blocked ? colorTaggedText(10, `<未達成>`) : `<達成>`;
    return {
      text: `${heading}:${className}LV:${currentLevel}${resultText}\n`,
      blocked: blocked
    };
  }
  function buildJobReleaseChoiceDetails(
    actor,
    classId,
    classData,
    costContext
  ) {
    const classRank = Number(classData.meta.classRank);
    // Preserve the legacy carry-forward values for ranks without a table entry.
    costContext.releaseCost =
      RELEASE_COST_BY_CLASS_RANK[classRank] || costContext.releaseCost;
    const gold = classReleaseGoldRequirement(costContext.releaseCost);
    const materials = classReleaseMaterialRequirement(classRank);
    let text = classReleaseSkillList(classId) + gold.text + materials.text;
    let blocked = gold.blocked || materials.blocked;
    if (classRank >= 2) {
      costContext.requiredLevel =
        REQUIRED_LEVEL_BY_CLASS_RANK[classRank] || costContext.requiredLevel;
      const level = classReleaseLevelRequirement(
        actor,
        classId,
        costContext.requiredLevel
      );
      text += level.text;
      blocked = blocked || level.blocked;
    }
    return { text: text, blocked: blocked };
  }
  function addJobReleaseClassChoice(
    actor,
    classId,
    choiceIndex,
    pictureId,
    costContext
  ) {
    const classData = $dataClasses[classId];
    const details = buildJobReleaseChoiceDetails(
      actor,
      classId,
      classData,
      costContext
    );
    if (!details.blocked) valueJobReleaseTorF1[classId] = 1;
    const className = classData.name;
    const label = details.blocked
      ? colorTaggedText(7, className)
      : `${className}`;
    $gameSystem.addCustomChoice(1, { text: label, value: choiceIndex });
    const description = classData.description;
    const additionalDescription = valueAddDescriptionClass[classId];
    const text = `${description}\n${additionalDescription}\n` + details.text;
    showChoiceDescriptionPicture(pictureId, choiceIndex, text, 22, 300, 20);
    valueJobReleaseTorF2[choiceIndex] = classId;
  }

  function restoreRegisteredSceneTime() {
    if (
      $gameVariables.value(GAME_VARIABLE.SCENE_PREVIOUS_TIME_SWITCH_ID) >= 1
    ) {
      for (var i = 13; i <= 15; i++) {
        $gameSwitches.setValue(i, false);
      }
      $gameSwitches.setValue(
        $gameVariables.value(GAME_VARIABLE.SCENE_PREVIOUS_TIME_SWITCH_ID),
        true
      );
    }
    $gameVariables.setValue(GAME_VARIABLE.SCENE_PREVIOUS_TIME_SWITCH_ID, 0);
    const sceneTimeAdvance = $gameVariables.value(
      GAME_VARIABLE.SCENE_END_TIME_ADVANCE
    );
    if (sceneTimeAdvance >= 1) {
      for (var i = 13; i <= 15; i++) {
        $gameSwitches.setValue(i, false);
      }
      switch (sceneTimeAdvance) {
        case 1:
          $gameSwitches.setValue(GAME_SWITCH.MORNING, true);
          break;
        case 2:
          $gameSwitches.setValue(GAME_SWITCH.DAYTIME, true);
          break;
        case 3:
          $gameSwitches.setValue(GAME_SWITCH.NIGHT, true);
          break;
      }
      $gameVariables.setValue(GAME_VARIABLE.SCENE_END_TIME_ADVANCE, 0);
    }
  }

  function eraseRegisteredSceneEvents() {
    const spawnedEventIds = $gameVariables.value(
      GAME_VARIABLE.DYNAMIC_EVENT_IDS
    );
    for (const spawnedEventId of spawnedEventIds || []) {
      if (!(spawnedEventId >= 1)) continue;
      const spawnedEvent = $gameMap.event(spawnedEventId);
      if (!spawnedEvent || $gameParty.inBattle()) continue;
      $gameMap.eraseEvent(spawnedEventId);
    }
  }

  function mealBuffParameterName(effectTypeId, parameterId) {
    switch (effectTypeId) {
      case 0:
        return TextManager.param(parameterId);
      case 1:
        return FTKR.CSS.cssStatus.xparam[parameterId];
      case 2:
        return FTKR.CSS.cssStatus.sparam[parameterId];
    }
    return "";
  }
  function updateTitleAchievementLeader(record, actorId, score) {
    if (!(score > record[2])) return;
    record[1] = actorId;
    record[2] = score;
  }
})();
