/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

(function () {
  // Keep this scope non-strict: event APIs and work globals are shared by plugins.
  // Variables 21–23 are reserved by quest callers and must not be used as scratch.
  const QUEST_VARIABLE = {
    COMPLETED_QUEST_COUNT: 50, // クエスト達成数
    DAILY_COMPLETION_COUNT: 150, // 当日デイリー達成数
    TOWN_INFORMATION_WEAPON_ID: 230 // 街情報アイテム指定変数
  };
  const QUEST_SWITCH = {
    AUTO_ACCEPT_DAILY_QUESTS: 128, // デイリー自動受注スイッチ
    TEMPORARY_RESULT: 380, // 汎用一時onoff自動スイッチ
    APPLY_REWARDS: 518, // クエスト報酬実計算時にonoff自動
    DAILY_QUESTS_ACCEPTED: 644 // [daysReset]デイリー受注
  };
  const NORMAL_CATEGORY = "受注クエスト";
  const DAILY_CATEGORY = "デイリークエスト";
  const EXTRA_CATEGORY = "ＥＸ受注クエスト";
  const QUEST_ITEM_CATEGORY_ID = 108;
  const WAR_COIN_ITEM_ID = 10;
  const DELIVERY_PLACEHOLDER_ITEM_ID = 5;

  function questTypeConfig(questTypeId) {
    if (questTypeId == null) return null;
    switch (Number(questTypeId)) {
      case 1:
        return { baseId: 800, markerOffset: 100, category: NORMAL_CATEGORY };
      case 2:
        return { baseId: 900, markerOffset: 50, category: DAILY_CATEGORY };
      default:
        return null;
    }
  }

  function questBaseId(questId) {
    return questId >= 1001 ? 900 : 800;
  }

  function flagIsSet(flags, index) {
    return !!flags && flags[index] == 1;
  }

  function validQuantity(value) {
    const quantity = Number(value);
    return Number.isInteger(quantity) && quantity >= 0 ? quantity : null;
  }

  function itemEquipmentDatabase(categoryId) {
    switch (categoryId) {
      case 0:
        return $dataItems;
      case 1:
        return $dataWeapons;
      case 2:
        return $dataArmors;
      default:
        return null;
    }
  }

  function questRankRewards(iconIndex) {
    switch (iconIndex) {
      case 422:
      case 426:
        return valueQuestRankC;
      case 423:
        return valueQuestRankB;
      case 424:
        return valueQuestRankA;
      case 425:
        return valueQuestRankS;
      default:
        return valueQuestRankD;
    }
  }

  function parseSpecialReward(metadata) {
    if (typeof metadata !== "string") return null;
    const fields = metadata.split(",");
    const categoryId = Number(fields[0]);
    const amount = validQuantity(fields[2]);
    if (amount === null || amount === 0) return null;
    if (categoryId === 3) return { item: null, amount: amount };
    const database =
      categoryId === 4 ? $dataItems : itemEquipmentDatabase(categoryId);
    const itemId = categoryId === 4 ? WAR_COIN_ITEM_ID : Number(fields[1]);
    const item = database && database[itemId];
    return item ? { item: item, amount: amount } : null;
  }

  function applySpecialReward(reward, party) {
    if (reward.item) party.gainItem(reward.item, reward.amount);
    else party.gainGold(reward.amount);
  }

  function specialRewardText(reward) {
    if (!reward.item) {
      const amountText = colorTaggedText(2, reward.amount);
      return `[${amountText}\\G] `;
    }
    const itemName = reward.item.name;
    const amountText = colorTaggedText(2, `+${reward.amount}`);
    return `[${itemName}:${amountText}] `;
  }

  function collectSpecialRewards(meta, applyRewards) {
    const lines = [];
    const party = $gameParty;
    for (const key of Object.keys(meta)) {
      // Keep the database's historical spelling and metadata enumeration order.
      if (key.indexOf("QuestSpcialPrice") !== 0) continue;
      const reward = parseSpecialReward(meta[key]);
      if (!reward) continue;
      if (applyRewards) applySpecialReward(reward, party);
      lines.push(specialRewardText(reward));
      if (lines.length % 3 === 0) lines[lines.length - 1] += "\n";
    }
    if (!lines.length) return " "; // The public completion routine's no-extra sentinel.
    const heading = colorTaggedText(16, "●追加報酬");
    return `\n${heading}\n` + lines.join("");
  }

  quest_housyuukeisan = function (questItemId) {
    // These three globals are read by quest_housyuu and external event scripts.
    rewardGoldAmount = 0;
    rewardItemAmount = 0;
    additionalCompletionText = " ";
    const item = $dataItems[questItemId];
    if (!item) return;
    const rank = questRankRewards(item.iconIndex);
    rewardGoldAmount = validQuantity(rank && rank[1]) || 0;
    rewardItemAmount = validQuantity(rank && rank[2]) || 0;
    const applyRewards = $gameSwitches.value(QUEST_SWITCH.APPLY_REWARDS);
    additionalCompletionText = collectSpecialRewards(
      item.meta || {},
      applyRewards
    );
  };

  quest_settei_getItemEquipmentSource = function (deliveryValues, questIndex) {
    if (!deliveryValues) return null;
    const itemId = Number(deliveryValues[0]);
    const categoryId = Number(deliveryValues[1]);
    const database = itemEquipmentDatabase(categoryId);
    if (!database || !Number.isInteger(itemId) || itemId < 0) {
      console.error(
        `quest_settei_getItemEquipmentSource: invalid item/category (${itemId}/${categoryId}).`
      );
      return null;
    }
    const indexOffset = categoryId === 0 ? 0 : categoryId === 1 ? 2000 : 3000;
    valueQuestArray1[itemId + indexOffset] = [categoryId + 1, questIndex];
    return database;
  };

  quest_settei = function (rangeConfigId) {
    QuestSystem.process(rangeConfigId);
  };

  function parseDelivery(metadata) {
    if (typeof metadata !== "string") return { invalid: true };
    const fields = metadata.split(",");
    const itemId = Number(fields[0]);
    // QuestSystem also maps 0 to 5, then ignores 5. It is not an actual delivery.
    if (itemId === 0 || itemId === DELIVERY_PLACEHOLDER_ITEM_ID) return null;
    const database = itemEquipmentDatabase(Number(fields[1]));
    const item = database && database[itemId];
    const amount = validQuantity(fields[2]);
    if (!item || amount === null) return { invalid: true };
    return { item: item, amount: amount };
  }

  function questPaymentPlan(meta) {
    const deliveries = [];
    let valid = true;
    for (let deliveryIndex = 1; deliveryIndex <= 9; deliveryIndex++) {
      const metadata = meta["QuestCompDelivery" + deliveryIndex];
      if (!metadata) continue;
      const delivery = parseDelivery(metadata);
      if (!delivery) continue;
      if (delivery.invalid) valid = false;
      else deliveries.push(delivery);
    }
    const hasMoneyPayment = !!meta.QuestCompMoney;
    const money = hasMoneyPayment ? validQuantity(meta.QuestCompMoney) : 0;
    return {
      deliveries: deliveries,
      money: money,
      hasMoneyPayment: hasMoneyPayment,
      valid: valid && money !== null
    };
  }

  function canPayQuest(plan, party) {
    if (plan.money > 0 && !(party.gold() >= plan.money)) return false;
    const totals = new Map();
    for (const delivery of plan.deliveries) {
      const item = delivery.item;
      totals.set(item, (totals.get(item) || 0) + delivery.amount);
    }
    for (const entry of totals) {
      if (!(party.numItems(entry[0]) >= entry[1])) return false;
    }
    return true;
  }

  function appendCompletionText(report, text) {
    report.text += text;
    // Preserve the existing cumulative popup convention and its phase order.
    if (report.usePopups) CommonPopupManager.showInfo({}, report.text, null);
  }

  function processQuestDelivery(report, delivery) {
    if (report.applyRewards)
      $gameParty.loseItem(delivery.item, delivery.amount);
    const itemName = colorTaggedText(2, delivery.item.name);
    const itemCount = colorTaggedText(1, delivery.amount);
    appendCompletionText(report, `${itemName}を${itemCount}個納品しました。\n`);
  }

  function processQuestPayments(report, plan) {
    for (const delivery of plan.deliveries)
      processQuestDelivery(report, delivery);
    if (!plan.hasMoneyPayment) return;
    if (report.applyRewards) $gameParty.loseGold(plan.money);
    const moneyAmount = colorTaggedText(2, plan.money) + "\\G";
    appendCompletionText(report, `${moneyAmount}を納めました。\n`);
  }

  function awardQuestBaseRewards(questItem, completionMarker) {
    const party = $gameParty;
    if (rewardGoldAmount >= 1) party.gainGold(rewardGoldAmount);
    if (rewardItemAmount >= 1)
      party.gainItem($dataItems[WAR_COIN_ITEM_ID], rewardItemAmount);
    party.loseItem(questItem, 1);
    party.gainItem(completionMarker, 1);
  }

  function questRewardSummary(questItem) {
    const questName = colorTaggedText(2, questItem.name);
    let text = `クエスト${questName}を達成した！＜報酬:`;
    if (rewardGoldAmount >= 1)
      text += colorTaggedText(14, rewardGoldAmount) + "\\G ";
    if (rewardItemAmount >= 1) {
      const coin = $dataItems[WAR_COIN_ITEM_ID];
      const coinName = coin ? coin.name : "";
      const amountText = colorTaggedText(14, rewardItemAmount);
      text += `${amountText}${coinName} `;
    }
    return text + "＞\n";
  }

  function incrementQuestCompletionCount(category) {
    if (!category) return;
    const variableId =
      category === NORMAL_CATEGORY || category === EXTRA_CATEGORY
        ? QUEST_VARIABLE.COMPLETED_QUEST_COUNT
        : QUEST_VARIABLE.DAILY_COMPLETION_COUNT;
    $gameVariables.setValue(variableId, $gameVariables.value(variableId) + 1);
  }

  function showCompletionPicture(text) {
    $gameScreen.setDTextPicture(text, 28);
    $gameScreen.dWindowFrame = "ON";
    $gameScreen.showPicture(102, "", 1, 590, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(102, 1, 640, 384, 100, 100, 255, 0, 60);
  }

  function finishQuestReport(report, questItem, completionType) {
    const questName = colorTaggedText(2, questItem.name);
    WindowManager.drawText(0, `クエスト${questName}を達成報告した。`);
    appendCompletionText(report, questRewardSummary(questItem));
    if (additionalCompletionText !== " ")
      appendCompletionText(report, additionalCompletionText + "\n");
    $gameSwitches.setValue(QUEST_SWITCH.TEMPORARY_RESULT, true);
    if (report.applyRewards)
      incrementQuestCompletionCount(questItem.meta["SGカテゴリ"]);
    if (!report.usePopups && completionType == 1)
      showCompletionPicture(report.text);
  }

  quest_housyuu = function (questId, completionType) {
    $gameSwitches.setValue(QUEST_SWITCH.TEMPORARY_RESULT, false);
    const questItem = $dataItems[questId];
    if (!questItem) return;
    const questName = colorTaggedText(2, questItem.name);
    if (!flagIsSet(valueQuestArray6, questId - questBaseId(questId))) {
      WindowManager.drawText(
        0,
        `クエスト${questName}は達成条件を満たしていない…。`
      );
      return;
    }
    const plan = questPaymentPlan(questItem.meta || {});
    const applyRewards = $gameSwitches.value(QUEST_SWITCH.APPLY_REWARDS);
    const markerOffset = questId >= 1001 ? 50 : 100;
    const completionMarker = $dataItems[Number(questId) + markerOffset];
    if (!validateQuestReport(plan, questItem, completionMarker, applyRewards))
      return;
    const report = {
      text: "",
      usePopups: completionType == 2,
      applyRewards: applyRewards
    };
    processQuestPayments(report, plan);
    // Keep this public call as an extension point, and its shared reward globals.
    quest_housyuukeisan(questId);
    if (applyRewards) awardQuestBaseRewards(questItem, completionMarker);
    finishQuestReport(report, questItem, completionType);
  };

  function questRewardDataAvailable(questItem, completionMarker) {
    if (!completionMarker) return false;
    const rank = questRankRewards(questItem.iconIndex);
    const coinAmount = validQuantity(rank && rank[2]);
    return !(coinAmount > 0) || !!$dataItems[WAR_COIN_ITEM_ID];
  }

  function validateQuestReport(
    plan,
    questItem,
    completionMarker,
    applyRewards
  ) {
    if (
      !plan.valid ||
      (applyRewards && !questRewardDataAvailable(questItem, completionMarker))
    ) {
      WindowManager.drawText(
        0,
        "報酬設定が不正なため、クエストを報告できません。"
      );
      return false;
    }
    if (applyRewards && !canPayQuest(plan, $gameParty)) {
      WindowManager.drawText(
        0,
        "納品アイテムまたは所持金が不足しているため、クエストを報告できません。"
      );
      return false;
    }
    return true;
  }

  function showQuestChoicePicture(choiceIndex, pictureId, text) {
    $gameScreen.setDTextPicture(text, 22);
    $gameScreen.dWindowFrame = "ON";
    $gameScreen.showPicture(pictureId, "", 0, 600, 100, 100, 100, 0, 0);
    $gameMessage.setSelectPictureId(choiceIndex, pictureId);
  }

  function addReportQuestChoice(questItem, questId, choiceIndex) {
    const index = questId - questBaseId(questId);
    const completed = flagIsSet(valueQuestArray6, index);
    const questName = questItem.name;
    const label = completed ? `[達成]${questName}` : `[未達]${questName}`;
    const choiceText = colorTaggedText(completed ? 2 : 16, label);
    $gameSystem.addCustomChoice(1, { text: choiceText, value: questId });
    const detailText = valueQuestArray2 && valueQuestArray2[index];
    showQuestChoicePicture(
      choiceIndex,
      101 + choiceIndex,
      detailText == null ? "" : String(detailText)
    );
  }

  quest_tasseiHoukoku = function (startQuestId, endQuestId) {
    const items = $dataItems;
    const party = $gameParty;
    let choiceIndex = 0;
    for (let questId = Number(startQuestId); questId <= endQuestId; questId++) {
      const questItem = items[questId];
      if (
        !questItem ||
        !party.hasItem(questItem) ||
        questItem.meta.singleQuestIncidence
      )
        continue;
      addReportQuestChoice(questItem, questId, choiceIndex++);
    }
  };

  function isStandardQuest(item, config) {
    if (!item || !item.name || !config) return false;
    const meta = item.meta || {};
    return (
      Number(meta.EICSwitch) === QUEST_ITEM_CATEGORY_ID &&
      meta["SGカテゴリ"] === config.category &&
      !meta.singleQuestIncidence
    );
  }

  function completionMarkerFor(questId, config) {
    return $dataItems[Number(questId) + config.markerOffset];
  }

  function canAcceptQuest(item, questId, config) {
    if (!isStandardQuest(item, config)) return false;
    if (!flagIsSet(valueQuestArray5, questId - config.baseId)) return false;
    const marker = completionMarkerFor(questId, config);
    return !!marker && !$gameParty.hasItem(marker);
  }

  function acceptQuest(item, questId, config) {
    if (!canAcceptQuest(item, questId, config)) return null;
    if ($gameParty.hasItem(item)) return "owned";
    $gameParty.gainItem(item, 1);
    return "new";
  }

  function acceptanceText(questId, isDaily) {
    const questName = colorTaggedText(2, `\x1bIIN[${questId}]`);
    return isDaily
      ? `デイリークエスト${questName}を受注しました。`
      : `クエスト${questName}を受注しました。`;
  }

  function showAcceptanceResult(status, questId, isDaily) {
    const messageText =
      status === "owned"
        ? "既にこのクエストは受注している…。"
        : acceptanceText(questId, isDaily);
    CommonPopupManager.showInfo({}, messageText, null);
  }

  quest_jutyuu = function (questTypeId, questId) {
    itemGet_afterProcess();
    $gameSwitches.setValue(QUEST_SWITCH.TEMPORARY_RESULT, false);
    const config = questTypeConfig(questTypeId);
    if (!config) return;
    const status = acceptQuest($dataItems[questId], questId, config);
    if (!status) return;
    if (status === "owned")
      $gameSwitches.setValue(QUEST_SWITCH.TEMPORARY_RESULT, true);
    showAcceptanceResult(status, questId, false);
    if (status !== "new") return;
    $gameSwitches.setValue(QUEST_SWITCH.TEMPORARY_RESULT, true);
    AudioManager.playSe({
      name: "Z_PaperBreak",
      volume: 100,
      pitch: 80,
      pan: 0
    });
  };

  function acceptQuestFromBulk(item, questId, config) {
    if (acceptQuest(item, questId, config) !== "new") return;
    showAcceptanceResult("new", questId, config.category === DAILY_CATEGORY);
    $gameSwitches.setValue(QUEST_SWITCH.TEMPORARY_RESULT, true);
  }

  quest_jutyuu2 = function (questTypeId) {
    itemGet_afterProcess();
    const config = questTypeConfig(questTypeId);
    if (config && config.category === DAILY_CATEGORY)
      $gameSwitches.setValue(QUEST_SWITCH.DAILY_QUESTS_ACCEPTED, true);
    $gameSwitches.setValue(QUEST_SWITCH.TEMPORARY_RESULT, false);
    if (!config) return;
    const items = $dataItems;
    for (let questId = 1; questId < items.length; questId++)
      acceptQuestFromBulk(items[questId], questId, config);
    showAutoAcceptDailySummary(config);
  };

  function showAutoAcceptDailySummary(config) {
    if (
      config.category !== DAILY_CATEGORY ||
      !$gameSwitches.value(QUEST_SWITCH.TEMPORARY_RESULT) ||
      !$gameSwitches.value(QUEST_SWITCH.AUTO_ACCEPT_DAILY_QUESTS)
    )
      return;
    CommonPopupManager.showInfo({}, "デイリークエストを受注しました。", null);
  }

  function currentTownQuestContext() {
    const townWeaponId = $gameVariables.value(
      QUEST_VARIABLE.TOWN_INFORMATION_WEAPON_ID
    );
    if (!(townWeaponId >= 1)) return null;
    const townWeapon = $dataWeapons[townWeaponId];
    return townWeapon
      ? { mapSwitchId: Number(townWeapon.meta.MapSwitch) }
      : null;
  }

  function questMatchesTown(meta, town) {
    if (!town || !meta.QuestSetMap) return false;
    const mapSwitchId = Number(meta.QuestSetMap);
    return mapSwitchId === 0 || mapSwitchId === town.mapSwitchId;
  }

  function questBoardLabel(item, questId, config, town) {
    if (!isStandardQuest(item, config) || !questMatchesTown(item.meta, town))
      return null;
    if (!flagIsSet(valueQuestArray5, questId - config.baseId)) return "？？？";
    const party = $gameParty;
    const marker = completionMarkerFor(questId, config);
    if (!marker || party.hasItem(marker) || party.hasItem(item)) return null;
    valueCountSet1 = 1;
    const statusText = colorTaggedText(2, "[受注可能]");
    const iconIndex = item.iconIndex;
    const questName = item.name;
    const itemName = `\x1bI[${iconIndex}]${questName}`;
    return statusText + itemName;
  }

  quest_jutyuuDisplay = function (questTypeId) {
    itemGet_afterProcess();
    // Publish empty results as well; callers must not reuse a previous town's list.
    valueWordArray = [];
    valueCountArray = [];
    valueCountSet1 = 0;
    const config = questTypeConfig(questTypeId);
    if (!config) return;
    const town = currentTownQuestContext();
    if (!town) return;
    const items = $dataItems;
    const labels = valueWordArray;
    const questIds = valueCountArray;
    for (let questId = 1; questId < items.length; questId++) {
      const label = questBoardLabel(items[questId], questId, config, town);
      if (label === null) continue;
      labels.push(label);
      questIds.push(questId);
      if (labels.length >= 12) break;
    }
  };

  function formatQuestStartConditions(conditions) {
    if (typeof conditions !== "string") return "";
    let text = "";
    let lineCount = 0;
    for (const line of conditions.split("\n")) {
      if (line == 0) continue;
      text += line;
      if (++lineCount % 2 === 0) text += "\n";
    }
    return text;
  }

  function showUnavailableQuestPicture(text) {
    $gameScreen.dWindowFrame = "ON";
    $gameScreen.setDTextPicture(text, 28);
    $gameScreen.showPicture(55, "", 1, 620, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(55, 1, 640, 384, 100, 100, 255, 0, 60);
  }

  quest_singleJutyuu = function (questItemId) {
    $gameSwitches.setValue(QUEST_SWITCH.TEMPORARY_RESULT, false);
    const item = $dataItems[questItemId];
    if (!item) return;
    const index = questItemId - questBaseId(questItemId);
    const available = flagIsSet(valueQuestArray5, index);
    const questName = available ? item.name : "？？？";
    const iconIndex = item.iconIndex;
    const itemIcon = `\x1bI[${iconIndex}]`;
    const conditions = valueQuestArray7 && valueQuestArray7[index];
    const infoText =
      itemIcon + `${questName}\n` + formatQuestStartConditions(conditions);
    if (available) $gameSwitches.setValue(QUEST_SWITCH.TEMPORARY_RESULT, true);
    else showUnavailableQuestPicture(infoText);
  };
})();
