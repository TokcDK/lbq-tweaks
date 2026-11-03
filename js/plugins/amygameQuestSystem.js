/**
 * Quest Configuration System
 * 
 * クエストの解説、発生、達成の設定
 */
var QuestSystem = (function() {
  'use strict';

  // ============================================================
  // CONSTANTS & CONFIGURATION
  // ============================================================
  
  var MARKERS = {
    SUCCESS: colorTaggedText(14, "〇"),
    FAILURE: colorTaggedText(12, "×"),
    ACHIEVED: colorTaggedText(10, "達成"),
    NOT_ACHIEVED: colorTaggedText(1, "未達成"),
    CAN_DELIVER: colorTaggedText(10, "納品可能"),
    CANNOT_DELIVER: colorTaggedText(1, "納品不可"),
    LEARNED: colorTaggedText(10, "習得"),
    NOT_LEARNED: colorTaggedText(1, "未習得"),
    EQUIPPED: colorTaggedText(10, "装着"),
    NOT_EQUIPPED: colorTaggedText(1, "未装着"),
    GRANTED: colorTaggedText(10, "付与"),
    NOT_GRANTED: colorTaggedText(1, "未付与")
  };

  var HEADERS = {
    COMPLETION: colorTaggedText(16, "●達成条件") + '\n',
    START: colorTaggedText(16, "●発生条件") + '\n',
    NO_COMPLETION: colorTaggedText(16, "●達成条件なし")
  };

  var DEFAULT_VALUES = {
    SKILL_ID: 18,
    VARIABLE_ID: 2,
    SWITCH_ID: 2,
    ITEM_ID: 5,
    STATE_ID: 600,
    SUBJUGATION_VAR: 421,
    MAIN_ROOT_VAR: 135
  };

  var SYSTEM_NAME_CLEANUP_PATTERNS = [
    "[daysReset]", "[NoReset]", "[夜自動]", "[シーン達成]", "[挿話達成]"
  ];

  // Range configurations - Easy to add or remove quest ranges
  var RANGE_CONFIGS = {
    1: { start: 801, end: 900, offset: 800, initArray: true, arraySize: 4001 },
    2: { start: 1001, end: 1050, offset: 900, initArray: false }
  };

  // ---- condition scopes ----------------------------------------
  var SCOPE_START = 'start';
  var SCOPE_COMPLETION = 'completion';

  // ---- variable / switch offsets used by the condition metas ----
  var PERSPECTIVE_SWITCH_OFFSET = 440;      // 視点スイッチ = perspectiveId + 440
  var ACTOR_EXPOSURE_VAR_OFFSET = 380;      // アクター露出度配列 = actorId + 380
  var CONDITION_LABEL_VAR_OFFSET = 400;     // 条件表示名の変数 = paramType + 400
  var SUBJUGATION_COUNT_VAR_ID = 52;        // 討伐数配列
  var MAX_NUMBERED_CONDITION = 9;           // QuestSetVal1..9 / QuestComp*1..9 の上限
  var RANK_ITEM_IDS = [693, 694, 695];      // ランク制限アイテム(1以上/2以上/3以上)
  var EXPOSURE_PARAM_TYPE = 4;              // 露出度パラメータ種別(以下の比較になる)

  // ---- item collection types (condition meta 2nd value) --------
  var ITEM_TYPE_ITEM = 0;
  var ITEM_TYPE_WEAPON = 1;
  var ITEM_TYPE_ARMOR = 2;

  // ---- valueQuestArray1 index offsets per collection type ------
  var QUEST_ARRAY_WEAPON_OFFSET = 2000;
  var QUEST_ARRAY_ARMOR_OFFSET = 3000;
  var QUEST_ARRAY_TYPE_ITEM = 1;
  var QUEST_ARRAY_TYPE_WEAPON = 2;
  var QUEST_ARRAY_TYPE_ARMOR = 3;

  // ---- rank reward text (kept identical to the pre-refactor strings) ----
  var REWARD_COIN_ITEM_ID = 10;                 // 戦貨アイテムID
  var RANK_REWARD_HEADER = colorTaggedText(16, "●規定ランク報酬") + '\n';
  var EXTRA_REWARD_HEADER = '\n' + colorTaggedText(16, '●追加報酬') + '\n';

  // ---- text fragments -----------------------------------------
  var NO_START_CONDITION_SUFFIX = '【なし】' + '\n';
  var QUEST_SUPPLEMENT_META_KEY = 'QuestSupplement';
  var START_CONDITION_HEADER_RANK = colorTaggedText(10, '【ランク制限】');
  var PERSPECTIVE_VIEW_SUFFIX = '視点';
  var SUBJUGATION_TODAY_LABEL = colorTaggedText(2, '当日魔物討伐数');
  var SUBJUGATION_TOTAL_LABEL = colorTaggedText(2, '総魔物討伐数');
  var SUBJUGATION_BODY_SUFFIX = '体討伐';

  // 挿話/シーン/称号/H称号/クエストの見出し(EICSwitch値とSG種別で決まる)
  var EIC_SWITCH_CATEGORY_MARKERS = {
    102: '【挿話:',
    103: '【シーン:',
    104: '【称号:',
    105: '【H称号:'
  };
  var EIC_SWITCH_QUEST_CATEGORY = 1;        // <SG種別>がクエストを意味する値
  var QUEST_CATEGORY_MARKER = '【クエスト:';
  var DEFAULT_CATEGORY_MARKER = '【';

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================
  
  function cleanSystemName(name) {
    if (!name) return '';

    var result = name;
    SYSTEM_NAME_CLEANUP_PATTERNS.forEach(function(pattern) {
      result = result.replace(pattern, "");
    });
    return result;
  }

  function getCurrentActorId() {
    return $gameVariables.value(DEFAULT_VALUES.VARIABLE_ID);
  }

  function getCurrentActor() {
    return $gameActors.actor(getCurrentActorId());
  }

  // actorId が 0(未指定)なら現在のアクターを使う
  function resolveConditionActor(actorId) {
    var id = Number(actorId);
    if (id >= 1) return $gameActors.actor(id);
    return getCurrentActor();
  }

  // 現在のアクター以外なら「名前が」を前置する
  function buildActorPrefix(actorId, actor) {
    if (Number(actorId) === getCurrentActorId()) return '';
    return actor.name() + 'が';
  }

  function parseMetaArray(metaValue) {
    return String(metaValue).split(',');
  }

  function getItemsCollection(type) {
    var typeNum = Number(type);
    if (typeNum === ITEM_TYPE_WEAPON) return $dataWeapons;
    if (typeNum === ITEM_TYPE_ARMOR) return $dataArmors;
    return $dataItems;
  }

  function isActorAvailable(actor) {
    if (!actor) return false;
    return actor.isLearnedSkill(DEFAULT_VALUES.SKILL_ID) && !actor.isStateAffected(valueDollStateId);
  }

  //変数が未設定/配列でない場合に index アクセスで落ちないためのヘルパ
  //未設定時の比較結果は従来(例外)ではなく undefined になる
  function getArrayValue(varId, index) {
    var arr = $gameVariables.value(varId);
    if (!Array.isArray(arr)) return undefined;
    return arr[index];
  }

  // QuestSetVal1..9 / QuestComp*1..9 のような連番メタを走査する
  function forEachNumberedMeta(item, metaPrefix, callback) {
    for (var id = 1; id <= MAX_NUMBERED_CONDITION; id++) {
      var metaValue = item.meta[metaPrefix + id];
      if (!metaValue) continue;
      callback(parseMetaArray(metaValue), id);
    }
  }

  // 条件の成否を該当スコープのカウンタへ反映する
  function recordCondition(ctx, scope, isMet) {
    if (scope === SCOPE_START) {
      ctx.startTotal++;
      if (isMet) ctx.startMet++;
      return;
    }
    ctx.completionTotal++;
    if (isMet) ctx.completionMet++;
  }

  // 条件の表示テキストを該当スコープへ追記する
  function appendConditionText(ctx, scope, text) {
    if (scope === SCOPE_START) {
      ctx.startText += text;
      return;
    }
    ctx.completionText += text;
  }

  // 条件1件分の「本文 + 成否マーカー + 閉じ」をまとめて出力する
  function appendConditionLine(ctx, scope, bodyText, isMet, metMarker, unmetMarker, closingText) {
    appendConditionText(ctx, scope, bodyText);
    recordCondition(ctx, scope, isMet);
    appendConditionText(ctx, scope, (isMet ? metMarker : unmetMarker) + closingText);
  }

  function createConditionContext(item, index, offset) {
    return {
      item: item,
      index: index,
      offset: offset,
      startTotal: 0,
      startMet: 0,
      completionTotal: 0,
      completionMet: 0,
      startText: HEADERS.START,
      completionText: HEADERS.COMPLETION,
      startTextInitial: HEADERS.START,
      completionTextInitial: HEADERS.COMPLETION
    };
  }

  // ============================================================
  // START CONDITION HANDLERS
  // ============================================================
  
  var startConditionHandlers = [];

  // Handler: Adventurer Rank (QuestSetRank)
  function processQuestSetRankCondition(item, ctx) {
    if (!item.meta['QuestSetRank']) return;

    var rankValue = Number(item.meta['QuestSetRank']);
    if (rankValue < 1) return;

    appendConditionText(ctx, SCOPE_START, START_CONDITION_HEADER_RANK);

    var rankItem = $dataItems[getRankRestrictionItemId(rankValue)];
    if (!rankItem) return;

    var isMet = $gameParty.hasItem(rankItem, true);
    appendConditionLine(ctx, SCOPE_START, '', isMet, MARKERS.SUCCESS, MARKERS.FAILURE, '\n');
  }

  // ランク制限値(1以上/2以上/3以上)に対応するアイテムID
  function getRankRestrictionItemId(rankValue) {
    for (var rankLevel = RANK_ITEM_IDS.length; rankLevel >= 1; rankLevel--) {
      if (rankValue >= rankLevel) return RANK_ITEM_IDS[rankLevel - 1];
    }
    return RANK_ITEM_IDS[0];
  }

  // Handler: Perspective (QuestSetPerspective)
  function processQuestSetPerspectiveCondition(item, ctx) {
    if (!item.meta['QuestSetPerspective']) return;

    var perspectiveId = Number(item.meta['QuestSetPerspective']);
    var perspectiveActor = perspectiveId >= 1 ? $gameActors.actor(perspectiveId) : null;
    if (perspectiveId >= 1 && perspectiveId !== getCurrentActorId() && perspectiveActor) {
      appendConditionText(ctx, SCOPE_START, '[' + perspectiveActor.name() + PERSPECTIVE_VIEW_SUFFIX + ']' + '\n');
    }

    var isMet = $gameSwitches.value(perspectiveId + PERSPECTIVE_SWITCH_OFFSET);
    recordCondition(ctx, SCOPE_START, isMet);
  }

  // Handler: Note Word (NoteWord)
  function processNoteWordCondition(item, ctx) {
    if (!item.meta['NoteWord']) return;

    appendConditionText(ctx, SCOPE_START, '[' + item.meta['NoteWord'] + ']');
  }

  // Handler: Actor Exists (QuestSetActor)
  function processQuestSetActorCondition(item, ctx) {
    if (!item.meta['QuestSetActor']) return;

    var actorIds = parseMetaArray(item.meta['QuestSetActor']);
    var currentActorId = getCurrentActorId();
    var hasExternalActor = false;

    for (var index = 0; index < actorIds.length; index++) {
      var actorId = Number(actorIds[index]);
      if (actorId === 0) actorId = currentActorId;

      var actor = $gameActors.actor(actorId);
      if (!actor) continue;

      if (actorId !== currentActorId) {
        appendConditionText(ctx, SCOPE_START, '[' + actor.name() + ']');
        hasExternalActor = true;
      }

      var isMet = isActorAvailable(actor);
      recordCondition(ctx, SCOPE_START, isMet);
      appendConditionText(ctx, SCOPE_START, isMet ? MARKERS.SUCCESS : MARKERS.FAILURE);
    }

    if (hasExternalActor) appendConditionText(ctx, SCOPE_START, '\n');
  }

  // Handler: Map Condition (QuestSetMap)
  function processQuestSetMapCondition(item, ctx) {
    if (!item.meta['QuestSetMap']) return;

    var switchId = Number(item.meta['QuestSetMap']);
    if (switchId === 0) switchId = DEFAULT_VALUES.SWITCH_ID;

    recordCondition(ctx, SCOPE_START, $gameSwitches.value(switchId));
  }

  // Handler: Switch Condition (QuestSetSwi)
  function processQuestSetSwiCondition(item, ctx) {
    if (!item.meta['QuestSetSwi']) return;

    var switchId = Number(item.meta['QuestSetSwi']);
    if (switchId === 0) switchId = DEFAULT_VALUES.SWITCH_ID;

    //既定スイッチ(2)は説明を出さないが、閉じ括弧だけは従来通り出力する
    if (switchId !== DEFAULT_VALUES.SWITCH_ID) {
      var switchName = cleanSystemName($dataSystem.switches[switchId]);
      appendConditionText(ctx, SCOPE_START, '【' + switchName);
    }

    appendConditionLine(ctx, SCOPE_START, '', $gameSwitches.value(switchId),
      MARKERS.SUCCESS, MARKERS.FAILURE, '】' + '\n');
  }

  // Handler: Main Quest Progress (QuestSetMainRoot)
  function processQuestSetMainRootCondition(item, ctx) {
    if (!item.meta['QuestSetMainRoot']) return;

    var mainRootMeta = parseMetaArray(item.meta['QuestSetMainRoot']);
    var varId = Number(mainRootMeta[0]) || DEFAULT_VALUES.MAIN_ROOT_VAR;
    var mainQuestProgressStage = Number(mainRootMeta[1]);

    var progressHeader = '';
    if (mainQuestProgressStage !== 0) {
      progressHeader = `【メインクエスト進行[${mainQuestProgressStage}]以上`;
    }

    appendConditionLine(ctx, SCOPE_START, progressHeader, $gameVariables.value(varId) >= mainQuestProgressStage,
      MARKERS.SUCCESS, MARKERS.FAILURE, '】' + '\n');
  }

  // Handler: Variable Conditions (QuestSetVal1-9)
  function processQuestSetValCondition(item, ctx) {
    forEachNumberedMeta(item, 'QuestSetVal', function(valMeta) {
      var varId = Number(valMeta[0]) || DEFAULT_VALUES.VARIABLE_ID;
      if (varId === DEFAULT_VALUES.VARIABLE_ID) return;

      var targetValue = Number(valMeta[1]);
      var currentValue = $gameVariables.value(varId);
      var varName = cleanSystemName($dataSystem.variables[varId]);
      var condText = '【' + varName + ' ' + currentValue + '/' + targetValue;

      appendConditionLine(ctx, SCOPE_START, condText, currentValue >= targetValue,
        MARKERS.SUCCESS, MARKERS.FAILURE, '】' + '\n');
    });
  }

  // Handler: H-Exp Array Conditions (QuestSetHexpArr1-9)
  function processQuestSetHexpArrCondition(item, ctx) {
    forEachNumberedMeta(item, 'QuestSetHexpArr', function(hexpMeta) {
      var actorId = Number(hexpMeta[0]);
      var paramType = Number(hexpMeta[1]);
      var targetValue = Number(hexpMeta[2]);

      var actor = $gameActors.actor(actorId);
      if (!actor) return;

      var currentValue = getArrayValue(actorId + ACTOR_EXPOSURE_VAR_OFFSET, paramType);
      var isExposure = paramType === EXPOSURE_PARAM_TYPE;
      var isMet = isExposure ? currentValue <= targetValue : currentValue >= targetValue;
      var comparisonSuffix = isExposure ? '以下' : '以上';

      var actorName = colorTaggedText(27, actor.name());
      var paramName = $dataSystem.variables[paramType + CONDITION_LABEL_VAR_OFFSET];
      var condText = '[' + actorName + paramName + targetValue + comparisonSuffix;

      appendConditionLine(ctx, SCOPE_START, condText, isMet, MARKERS.SUCCESS, MARKERS.FAILURE, '】' + '\n');
    });
  }

  // スキル系条件の共通部分(アクターとスキルの解決)
  function readSkillConditionTarget(actorId, skillId) {
    var actor = resolveConditionActor(actorId);
    if (!actor) return null;

    var skill = $dataSkills[skillId];
    if (!skill) return null;

    return { actor: actor, skill: skill, prefix: buildActorPrefix(actorId, actor) };
  }

  // Handler: Skill Condition (QuestSetSkill)
  function processQuestSetSkillCondition(item, ctx) {
    if (!item.meta['QuestSetSkill']) return;

    var meta = parseMetaArray(item.meta['QuestSetSkill']);
    var actorId = Number(meta[0]);
    var skillId = Number(meta[1]) || DEFAULT_VALUES.SKILL_ID;

    var target = readSkillConditionTarget(actorId, skillId);
    if (!target) return;

    var condText = '';
    if (skillId !== DEFAULT_VALUES.SKILL_ID) {
      condText = '【' + target.prefix + target.skill.name + '習得';
    }

    appendConditionLine(ctx, SCOPE_START, condText, target.actor.isLearnedSkill(skillId),
      MARKERS.SUCCESS, MARKERS.FAILURE, '】' + '\n');
  }

  // Handler: Skill Equip Condition (QuestSetSkillEquip)
  function processQuestSetSkillEquipCondition(item, ctx) {
    if (!item.meta['QuestSetSkillEquip']) return;

    var meta = parseMetaArray(item.meta['QuestSetSkillEquip']);
    var actorId = Number(meta[0]) || getCurrentActorId();
    var skillId = Number(meta[1]) || DEFAULT_VALUES.SKILL_ID;

    var target = readSkillConditionTarget(actorId, skillId);
    if (!target) return;

    var condText = '';
    if (skillId !== DEFAULT_VALUES.SKILL_ID) {
      condText = '【' + target.prefix + target.skill.name + '装着';
    }

    appendConditionLine(ctx, SCOPE_START, condText,
      target.actor.battleSkillsRaw().includes(skillId), MARKERS.SUCCESS, MARKERS.FAILURE, '】' + '\n');
  }

  // Handler: Skill Rank Condition (QuestSetSkillRank)
  function processQuestSetSkillRankCondition(item, ctx) {
    if (!item.meta['QuestSetSkillRank']) return;

    var meta = parseMetaArray(item.meta['QuestSetSkillRank']);
    var actorId = Number(meta[0]);
    var skillId = Number(meta[1]) || DEFAULT_VALUES.SKILL_ID;
    var requiredRank = Number(meta[2]);

    var target = readSkillConditionTarget(actorId, skillId);
    if (!target) return;

    var condText = '';
    if (skillId !== DEFAULT_VALUES.SKILL_ID) {
      condText = '【' + target.prefix + target.skill.name + 'ランク' + requiredRank + '以上';
    }

    var isMet = target.actor.isLearnedSkill(skillId) &&
      target.actor.skillMasteryLevel(skillId) >= requiredRank;

    appendConditionLine(ctx, SCOPE_START, condText, isMet, MARKERS.SUCCESS, MARKERS.FAILURE, '】' + '\n');
  }

  // Handler: State Condition (QuestSetState)
  function processQuestSetStateCondition(item, ctx) {
    if (!item.meta['QuestSetState']) return;

    var meta = parseMetaArray(item.meta['QuestSetState']);
    var actorId = Number(meta[0]) || getCurrentActorId();
    var stateId = Number(meta[1]) || DEFAULT_VALUES.STATE_ID;

    var actor = $gameActors.actor(actorId);
    if (!actor) return;

    var condText = '';
    if (stateId !== DEFAULT_VALUES.STATE_ID) {
      condText = '【' + buildActorPrefix(actorId, actor) + '\x1bSIM[' + stateId + ']';
    }

    appendConditionLine(ctx, SCOPE_START, condText, actor.isStateAffected(stateId),
      MARKERS.SUCCESS, MARKERS.FAILURE, '】' + '\n');
  }

  // Handler: Item Condition (QuestSetItem)
  function processQuestSetItemCondition(item, ctx) {
    if (!item.meta['QuestSetItem']) return;

    var meta = parseMetaArray(item.meta['QuestSetItem']);
    var itemType = Number(meta[0]);
    var itemId = Number(meta[1]) || DEFAULT_VALUES.ITEM_ID;
    var requiredAmount = Number(meta[2]);

    var targetItem = getItemsCollection(itemType)[itemId];
    if (!targetItem) return;

    var condText = '';
    if (itemId !== DEFAULT_VALUES.ITEM_ID) {
      condText = '【' + targetItem.name + '所持';
    }

    appendConditionLine(ctx, SCOPE_START, condText, $gameParty.numItems(targetItem) >= requiredAmount,
      MARKERS.SUCCESS, MARKERS.FAILURE, '】' + '\n');
  }

  // Handler: Subjugation Condition (QuestSetSubjugation)
  function processQuestSetSubjugationCondition(item, ctx) {
    if (!item.meta['QuestSetSubjugation']) return;

    var meta = parseMetaArray(item.meta['QuestSetSubjugation']);
    var subjugationId = Number(meta[0]) || DEFAULT_VALUES.SUBJUGATION_VAR;
    var targetCount = Number(meta[1]);
    var currentCount = getArrayValue(SUBJUGATION_COUNT_VAR_ID, subjugationId);

    appendConditionLine(ctx, SCOPE_START,
      buildSubjugationConditionText(subjugationId, targetCount, currentCount),
      currentCount >= targetCount, MARKERS.SUCCESS, MARKERS.FAILURE, '】' + '\n');
  }

  // 討伐条件の見出し(魔物ID指定 / 当日 / 総数)
  function buildSubjugationConditionText(subjugationId, targetCount, currentCount) {
    if (subjugationId === 1) {
      return '【' + SUBJUGATION_TODAY_LABEL + ':' + currentCount + '/' + targetCount;
    }
    if (subjugationId === 2) {
      return '【' + SUBJUGATION_TOTAL_LABEL + ':' + currentCount + '/' + targetCount;
    }
    if (subjugationId >= 3) {
      return '【\x1bSIM[' + subjugationId + ']' + colorTaggedText(10, targetCount) + SUBJUGATION_BODY_SUFFIX;
    }
    return '';
  }

  // Handler: Item Array Condition (QuestSetItemArr)
  function processQuestSetItemArrCondition(item, ctx) {
    if (!item.meta['QuestSetItemArr']) return;

    var itemIds = parseMetaArray(item.meta['QuestSetItemArr']);

    for (var index = 0; index < itemIds.length; index++) {
      var itemId = Number(itemIds[index]) || DEFAULT_VALUES.ITEM_ID;
      if (itemId === DEFAULT_VALUES.ITEM_ID) continue;

      var targetItem = $dataItems[itemId];
      if (!targetItem) continue;

      var condText = getItemCategoryMarker(targetItem) + '\x1bIIN[' + itemId + ']';
      appendConditionLine(ctx, SCOPE_START, condText, $gameParty.hasItem(targetItem, true),
        MARKERS.SUCCESS, MARKERS.FAILURE, '】' + '\n');
    }
  }

  // アイテムのカテゴリ見出し(挿話/シーン/称号/H称号/クエスト/その他)
  function getItemCategoryMarker(targetItem) {
    if (targetItem.meta['EICSwitch']) {
      var eicSwitch = Number(targetItem.meta['EICSwitch']);
      //対象外のEICSwitch(200等)は見出しを付けない(従来通り)
      return EIC_SWITCH_CATEGORY_MARKERS[eicSwitch] || '';
    }
    if (targetItem.meta['SG種別'] && Number(targetItem.meta['SG種別']) === EIC_SWITCH_QUEST_CATEGORY) {
      return QUEST_CATEGORY_MARKER;
    }
    return DEFAULT_CATEGORY_MARKER;
  }

  startConditionHandlers.push({ name: 'QuestSetRank', process: processQuestSetRankCondition });
  startConditionHandlers.push({ name: 'QuestSetPerspective', process: processQuestSetPerspectiveCondition });
  startConditionHandlers.push({ name: 'NoteWord', process: processNoteWordCondition });
  startConditionHandlers.push({ name: 'QuestSetActor', process: processQuestSetActorCondition });
  startConditionHandlers.push({ name: 'QuestSetMap', process: processQuestSetMapCondition });
  startConditionHandlers.push({ name: 'QuestSetSwi', process: processQuestSetSwiCondition });
  startConditionHandlers.push({ name: 'QuestSetMainRoot', process: processQuestSetMainRootCondition });
  startConditionHandlers.push({ name: 'QuestSetVal', process: processQuestSetValCondition });
  startConditionHandlers.push({ name: 'QuestSetHexpArr', process: processQuestSetHexpArrCondition });
  startConditionHandlers.push({ name: 'QuestSetSkill', process: processQuestSetSkillCondition });
  startConditionHandlers.push({ name: 'QuestSetSkillEquip', process: processQuestSetSkillEquipCondition });
  startConditionHandlers.push({ name: 'QuestSetSkillRank', process: processQuestSetSkillRankCondition });
  startConditionHandlers.push({ name: 'QuestSetState', process: processQuestSetStateCondition });
  startConditionHandlers.push({ name: 'QuestSetItem', process: processQuestSetItemCondition });
  startConditionHandlers.push({ name: 'QuestSetSubjugation', process: processQuestSetSubjugationCondition });
  startConditionHandlers.push({ name: 'QuestSetItemArr', process: processQuestSetItemArrCondition });

  // ============================================================
  // COMPLETION CONDITION HANDLERS
  // ============================================================
  
  var completionConditionHandlers = [];

  // Handler: Perspective (QuestCompPerspective)
  function processQuestCompPerspectiveCondition(item, ctx) {
    if (!item.meta['QuestCompPerspective']) return;

    var perspectiveId = Number(item.meta['QuestCompPerspective']);
    var perspectiveActor = perspectiveId >= 1 ? $gameActors.actor(perspectiveId) : null;

    var condText = '';
    if (perspectiveId >= 1 && perspectiveId !== getCurrentActorId() && perspectiveActor) {
      condText = '[' + perspectiveActor.name() + PERSPECTIVE_VIEW_SUFFIX;
    }

    appendConditionLine(ctx, SCOPE_COMPLETION, condText,
      $gameSwitches.value(perspectiveId + PERSPECTIVE_SWITCH_OFFSET),
      MARKERS.SUCCESS, MARKERS.FAILURE, ']' + '\n');
  }

  // Handler: Actor Exists (QuestCompActor)
  function processQuestCompActorCondition(item, ctx) {
    if (!item.meta['QuestCompActor']) return;

    var actorIds = parseMetaArray(item.meta['QuestCompActor']);
    var hasExternalActor = false;

    for (var index = 0; index < actorIds.length; index++) {
      var actorId = Number(actorIds[index]) || getCurrentActorId();

      var actor = $gameActors.actor(actorId);
      if (!actor) continue;

      appendConditionText(ctx, SCOPE_COMPLETION, '[' + actor.name());
      hasExternalActor = true;

      var isMet = isActorAvailable(actor);
      recordCondition(ctx, SCOPE_COMPLETION, isMet);
      appendConditionText(ctx, SCOPE_COMPLETION, isMet ? MARKERS.SUCCESS + ']' : MARKERS.FAILURE + ']');
    }

    //BUGFIX: 改行は達成条件側へ入れる(従来は発生条件側に入っていた)
    if (hasExternalActor) appendConditionText(ctx, SCOPE_COMPLETION, '\n');
  }

  // Handler: Subjugation Completion (QuestCompSubjugation1-9)
  function processQuestCompSubjugationCondition(item, ctx) {
    forEachNumberedMeta(item, 'QuestCompSubjugation', function(subjugationMeta) {
      var subjugationId = Number(subjugationMeta[0]);
      var targetCount = Number(subjugationMeta[1]);
      var currentCount = getArrayValue(SUBJUGATION_COUNT_VAR_ID, subjugationId);

      var condText = buildSubjugationCompletionText(subjugationId, targetCount, currentCount);
      appendConditionLine(ctx, SCOPE_COMPLETION, condText, currentCount >= targetCount,
        MARKERS.ACHIEVED, MARKERS.NOT_ACHIEVED, '】' + '\n');
    });
  }

  // 討伐達成条件の見出し(当日/総数/魔物ID指定)
  function buildSubjugationCompletionText(subjugationId, targetCount, currentCount) {
    if (subjugationId <= 5) {
      if (subjugationId === 1) {
        return '【' + SUBJUGATION_TODAY_LABEL + ':' + currentCount + '/' + targetCount;
      }
      if (subjugationId === 2) {
        return '【' + SUBJUGATION_TOTAL_LABEL + ':' + currentCount + '/' + targetCount;
      }
      //3〜5は本文なし(従来通り件数だけ数える)
      return '';
    }
    return '【' + colorTaggedText(2, '\x1bSIM[' + subjugationId + ']') +
      ':' + currentCount + '/' + targetCount;
  }

  // 個数系達成条件(収集/納品)の共通処理。marker だけが異なる
  function processItemCountCompletionCondition(item, ctx, metaPrefix, metMarker, unmetMarker) {
    forEachNumberedMeta(item, metaPrefix, function(collectMeta) {
      var itemId = Number(collectMeta[0]) || DEFAULT_VALUES.ITEM_ID;
      var itemType = Number(collectMeta[1]);
      var requiredAmount = Number(collectMeta[2]);
      var itemsCollection = getItemsCollection(itemType);

      // アイテム図鑑用にクエスト番号を登録(既定アイテムIDでも登録する)
      registerQuestItemReference(itemId, itemType, ctx.index);

      if (itemId === DEFAULT_VALUES.ITEM_ID) return;

      var targetItem = itemsCollection[itemId];
      if (!targetItem) return;

      var currentAmount = $gameParty.numItems(targetItem);
      var condText = '【' + colorTaggedText(2, targetItem.name) + ':' + currentAmount + '/' + requiredAmount;

      appendConditionLine(ctx, SCOPE_COMPLETION, condText, currentAmount >= requiredAmount,
        metMarker, unmetMarker, '】' + '\n');
    });
  }

  // valueQuestArray1[アイテムID(+種別オフセット)] = [種別, クエストID]
  function registerQuestItemReference(itemId, itemType, questIndex) {
    if (itemType === ITEM_TYPE_ITEM) {
      valueQuestArray1[itemId] = [QUEST_ARRAY_TYPE_ITEM, questIndex];
      return;
    }
    if (itemType === ITEM_TYPE_WEAPON) {
      valueQuestArray1[itemId + QUEST_ARRAY_WEAPON_OFFSET] = [QUEST_ARRAY_TYPE_WEAPON, questIndex];
      return;
    }
    if (itemType === ITEM_TYPE_ARMOR) {
      valueQuestArray1[itemId + QUEST_ARRAY_ARMOR_OFFSET] = [QUEST_ARRAY_TYPE_ARMOR, questIndex];
    }
  }

  // 収集/納品の達成条件ハンドラは成否マーカーだけが違うので共通生成する
  function createItemCountCompletionHandler(handlerName, metaPrefix, metMarker, unmetMarker) {
    return {
      name: handlerName,
      process: function(item, ctx) {
        processItemCountCompletionCondition(item, ctx, metaPrefix, metMarker, unmetMarker);
      }
    };
  }

  // Handler: Variable Completion (QuestCompVal1-9)
  function processQuestCompValCondition(item, ctx) {
    forEachNumberedMeta(item, 'QuestCompVal', function(valMeta) {
      var varId = Number(valMeta[0]) || DEFAULT_VALUES.VARIABLE_ID;
      if (varId === DEFAULT_VALUES.VARIABLE_ID) return;

      var targetValue = Number(valMeta[1]);
      var currentValue = $gameVariables.value(varId);
      var varName = cleanSystemName($dataSystem.variables[varId]);

      appendConditionLine(ctx, SCOPE_COMPLETION, buildVariableConditionText(varName, currentValue, targetValue),
        currentValue >= targetValue, MARKERS.ACHIEVED, MARKERS.NOT_ACHIEVED, '】' + '\n');
    });
  }

  // 【名前:現在値/目標値
  function buildVariableConditionText(displayName, currentValue, targetValue) {
    return '【' + colorTaggedText(2, displayName) + ':' + currentValue + '/' + targetValue;
  }

  // Handler: Array Variable Completion (QuestCompArray1-9)
  function processQuestCompArrayCondition(item, ctx) {
    forEachNumberedMeta(item, 'QuestCompArray', function(arrayMeta) {
      var varId = Number(arrayMeta[0]) || DEFAULT_VALUES.VARIABLE_ID;
      if (varId === DEFAULT_VALUES.VARIABLE_ID) return;

      var arrayIndex = Number(arrayMeta[1]);
      var targetValue = Number(arrayMeta[2]);
      var currentValue = getArrayValue(varId, arrayIndex);

      //NOTE: 配列版は従来通り変数名のクリーニングを行わない(表示テキスト維持のため)
      var condText = buildVariableConditionText($dataSystem.variables[varId], currentValue, targetValue);

      appendConditionLine(ctx, SCOPE_COMPLETION, condText, currentValue >= targetValue,
        MARKERS.ACHIEVED, MARKERS.NOT_ACHIEVED, '】' + '\n');
    });
  }

  // 達成条件のスキル見出し(【アクターが[色]スキル名[色] + 接尾辞)
  function buildSkillConditionText(target, headerSuffix) {
    return '【' + target.prefix + colorTaggedText(2, target.skill.name) + headerSuffix;
  }

  // Handler: Skill Learning Completion (QuestCompSkill1-9)
  function processQuestCompSkillCondition(item, ctx) {
    forEachNumberedMeta(item, 'QuestCompSkill', function(skillMeta) {
      var actorId = Number(skillMeta[0]);
      var skillId = Number(skillMeta[1]) || DEFAULT_VALUES.SKILL_ID;
      if (skillId === DEFAULT_VALUES.SKILL_ID) return;

      var target = readSkillConditionTarget(actorId, skillId);
      if (!target) return;

      var condText = buildSkillConditionText(target, ':');
      appendConditionLine(ctx, SCOPE_COMPLETION, condText, target.actor.isLearnedSkill(skillId),
        MARKERS.LEARNED, MARKERS.NOT_LEARNED, '】' + '\n');
    });
  }

  // Handler: Skill Equip Completion (QuestCompSkillEquip1-9)
  function processQuestCompSkillEquipCondition(item, ctx) {
    forEachNumberedMeta(item, 'QuestCompSkillEquip', function(skillMeta) {
      var actorId = Number(skillMeta[0]);
      var skillId = Number(skillMeta[1]) || DEFAULT_VALUES.SKILL_ID;
      if (skillId === DEFAULT_VALUES.SKILL_ID) return;

      var target = readSkillConditionTarget(actorId, skillId);
      if (!target) return;

      var condText = buildSkillConditionText(target, ':');
      appendConditionLine(ctx, SCOPE_COMPLETION, condText,
        target.actor.battleSkillsRaw().includes(skillId),
        MARKERS.EQUIPPED, MARKERS.NOT_EQUIPPED, '】' + '\n');
    });
  }

  // Handler: Skill Rank Completion (QuestCompSkillRank1-9)
  function processQuestCompSkillRankCondition(item, ctx) {
    forEachNumberedMeta(item, 'QuestCompSkillRank', function(skillMeta) {
      var actorId = Number(skillMeta[0]);
      var skillId = Number(skillMeta[1]) || DEFAULT_VALUES.SKILL_ID;
      var requiredRank = Number(skillMeta[2]);
      if (skillId === DEFAULT_VALUES.SKILL_ID) return;

      var target = readSkillConditionTarget(actorId, skillId);
      if (!target) return;

      var condText = buildSkillConditionText(target, 'ランク' + requiredRank + ':');
      appendConditionLine(ctx, SCOPE_COMPLETION, condText,
        target.actor.skillMasteryLevel(skillId) >= requiredRank,
        MARKERS.ACHIEVED, MARKERS.NOT_ACHIEVED, '】' + '\n');
    });
  }

  // Handler: State Completion (QuestCompState1-9)
  function processQuestCompStateCondition(item, ctx) {
    forEachNumberedMeta(item, 'QuestCompState', function(stateMeta) {
      var actorId = Number(stateMeta[0]);
      var stateId = Number(stateMeta[1]) || DEFAULT_VALUES.STATE_ID;
      if (stateId === DEFAULT_VALUES.STATE_ID) return;

      var actor = resolveConditionActor(actorId);
      if (!actor) return;

      var condText = '【' + buildActorPrefix(actorId, actor) +
        colorTaggedText(2, '\x1bSIM[' + stateId + ']') + ':';
      appendConditionLine(ctx, SCOPE_COMPLETION, condText, actor.isStateAffected(stateId),
        MARKERS.GRANTED, MARKERS.NOT_GRANTED, '】' + '\n');
    });
  }

  // Handler: Switch Completion (QuestCompSwi)
  function processQuestCompSwiCondition(item, ctx) {
    if (!item.meta['QuestCompSwi']) return;

    var switchId = Number(item.meta['QuestCompSwi']);
    if (switchId === 0) switchId = DEFAULT_VALUES.SWITCH_ID;
    if (switchId === DEFAULT_VALUES.SWITCH_ID) return;

    var switchName = cleanSystemName($dataSystem.switches[switchId]);
    var condText = '【' + colorTaggedText(2, switchName) + ':';

    appendConditionLine(ctx, SCOPE_COMPLETION, condText, $gameSwitches.value(switchId),
      MARKERS.ACHIEVED, MARKERS.NOT_ACHIEVED, '】' + '\n');
  }

  // Handler: Money/Donation (QuestCompMoney) - Processed at the end
  function processQuestCompMoneyCondition(item, ctx) {
    if (!item.meta['QuestCompMoney']) return;

    var requiredMoney = Number(item.meta['QuestCompMoney']);
    if (requiredMoney < 1) return;

    //NOTE: 金額は色タグを閉じない従来の書式を維持する
    var condText = '【' + colorTaggedText(2, requiredMoney) + '\\G';
    appendConditionLine(ctx, SCOPE_COMPLETION, condText, $gameParty.gold() >= requiredMoney,
      MARKERS.SUCCESS, MARKERS.FAILURE, '】' + '\n');
  }

  completionConditionHandlers.push({ name: 'QuestCompPerspective', process: processQuestCompPerspectiveCondition });
  completionConditionHandlers.push({ name: 'QuestCompActor', process: processQuestCompActorCondition });
  completionConditionHandlers.push({ name: 'QuestCompSubjugation', process: processQuestCompSubjugationCondition });
  completionConditionHandlers.push(createItemCountCompletionHandler(
    'QuestCompcollect', 'QuestCompcollect', MARKERS.ACHIEVED, MARKERS.NOT_ACHIEVED));
  completionConditionHandlers.push(createItemCountCompletionHandler(
    'QuestCompDelivery', 'QuestCompDelivery', MARKERS.CAN_DELIVER, MARKERS.CANNOT_DELIVER));
  completionConditionHandlers.push({ name: 'QuestCompVal', process: processQuestCompValCondition });
  completionConditionHandlers.push({ name: 'QuestCompArray', process: processQuestCompArrayCondition });
  completionConditionHandlers.push({ name: 'QuestCompSkill', process: processQuestCompSkillCondition });
  completionConditionHandlers.push({ name: 'QuestCompSkillEquip', process: processQuestCompSkillEquipCondition });
  completionConditionHandlers.push({ name: 'QuestCompSkillRank', process: processQuestCompSkillRankCondition });
  completionConditionHandlers.push({ name: 'QuestCompState', process: processQuestCompStateCondition });
  completionConditionHandlers.push({ name: 'QuestCompSwi', process: processQuestCompSwiCondition });
  completionConditionHandlers.push({ name: 'QuestCompMoney', process: processQuestCompMoneyCondition });

  // ============================================================
  // MAIN PROCESSING FUNCTION
  // ============================================================
  
  // クエストID範囲を1件ずつ処理する
  function processQuests(rangeConfigId) {
    var config = RANGE_CONFIGS[rangeConfigId];
    if (!config) return;

    if (config.initArray) {
      initializeQuestItemReferenceArray(config.arraySize);
    }

    for (var itemIndex = config.start; itemIndex <= config.end; itemIndex++) {
      var questItem = $dataItems[itemIndex];
      if (!questItem || questItem.name === '') continue;

      processQuestItem(questItem, itemIndex, config.offset);
    }
  }

  // アイテム図鑑参照用の配列を初期化する(各要素が独立した配列になるようにする)
  function initializeQuestItemReferenceArray(arraySize) {
    valueQuestArray1 = new Array(arraySize);
    for (var slotIndex = 0; slotIndex < arraySize; slotIndex++) {
      valueQuestArray1[slotIndex] = [];
    }
  }

  // 1クエスト分の発生/達成条件を組み立ててグローバル配列へ格納する
  function processQuestItem(questItem, itemIndex, offset) {
    var ctx = createConditionContext(questItem, itemIndex, offset);

    runConditionHandlers(startConditionHandlers, questItem, ctx);
    runConditionHandlers(completionConditionHandlers, questItem, ctx);

    var questSlotIndex = itemIndex - offset;
    var startText = finalizeStartConditionText(ctx);
    var completionText = finalizeCompletionConditionText(ctx);
    var rankReward = buildRankRewardText(itemIndex);

    // 掲示板/図鑑/達成報告が参照する配列は従来通り全て書き換える
    valueQuestArray7[questSlotIndex] = startText;
    valueQuestArray2[questSlotIndex] = completionText;
    valueQuestArray4[questSlotIndex] =
      buildQuestDescriptionText(questItem) + rankReward.colored + '\n' +
      startText + completionText;
    valueQuestArray3[questSlotIndex] =
      '\\FS[22]' + rankReward.plain + '\n' + startText + completionText;
    // 発生条件/達成条件が全て満たされているか(1=満たす, 0=未達)
    valueQuestArray5[questSlotIndex] = ctx.startTotal === ctx.startMet ? 1 : 0;
    valueQuestArray6[questSlotIndex] = ctx.completionTotal === ctx.completionMet ? 1 : 0;
  }

  // ハンドラ登録簿を順に実行する
  function runConditionHandlers(handlers, questItem, ctx) {
    for (var handlerIndex = 0; handlerIndex < handlers.length; handlerIndex++) {
      handlers[handlerIndex].process(questItem, ctx);
    }
  }

  function finalizeStartConditionText(ctx) {
    if (ctx.startText === ctx.startTextInitial) {
      return ctx.startText + NO_START_CONDITION_SUFFIX;
    }
    return ctx.startText;
  }

  // 達成条件が1件も無い場合のみ「達成条件なし」へ置き換える
  function finalizeCompletionConditionText(ctx) {
    if (ctx.completionText === ctx.completionTextInitial) {
      return HEADERS.NO_COMPLETION;
    }
    return ctx.completionText;
  }

  // 規定ランク報酬/追加報酬のグローバル値を最新化する。
  // quest_housyuukeisan()はamygameQuest.js側の公開関数なので、
  // 未読み込み時は従来と同じ空の追加報酬見出しで初期化する。
  function refreshQuestRewardValues(itemIndex) {
    if (typeof quest_housyuukeisan === 'function') quest_housyuukeisan(itemIndex);
  }

  // valueCountSet1..3 はamygameSettei.jsが初期化するゲーム共通変数
  function readQuestRewardValues() {
    return {
      gold: typeof valueCountSet1 === 'number' ? valueCountSet1 : 0,
      coin: typeof valueCountSet2 === 'number' ? valueCountSet2 : 0,
      extra: typeof valueCountSet3 === 'string' ? valueCountSet3 : EXTRA_REWARD_HEADER
    };
  }

  // 一覧用(色付き)と達成報告用(色なし)の規定ランク報酬テキストを作る
  function buildRankRewardText(itemIndex) {
    refreshQuestRewardValues(itemIndex);
    var values = readQuestRewardValues();
    var coinItem = $dataItems[REWARD_COIN_ITEM_ID];
    var coinName = coinItem ? coinItem.name : '';
    return {
      plain: RANK_REWARD_HEADER + '[' + values.gold + '\\G][' +
        values.coin + coinName + ']' + values.extra,
      colored: RANK_REWARD_HEADER + '[' + colorTaggedText(2, values.gold) + '\\G][' +
        colorTaggedText(2, values.coin) + coinName + ']' + values.extra
    };
  }

  // クエスト解説(説明 + 補足)
  function buildQuestDescriptionText(questItem) {
    var descriptionText = questItem.description + '\n';
    if (questItem.meta[QUEST_SUPPLEMENT_META_KEY]) {
      descriptionText += questItem.meta[QUEST_SUPPLEMENT_META_KEY];
    }
    return descriptionText;
  }

  // ============================================================
  // PUBLIC API
  // ============================================================
  
  return {
    process: processQuests,
    
    // Allow adding new range configurations
    addRangeConfig: function(id, config) {
      RANGE_CONFIGS[id] = config;
    },
    
    // Allow removing range configurations
    removeRangeConfig: function(id) {
      delete RANGE_CONFIGS[id];
    },
    
    // Allow adding new start condition handlers
    addStartConditionHandler: function(handler) {
      startConditionHandlers.push(handler);
    },
    
    // Allow adding new completion condition handlers
    addCompletionConditionHandler: function(handler) {
      completionConditionHandlers.push(handler);
    },
    
    // Allow removing handlers by name
    removeStartConditionHandler: function(name) {
      startConditionHandlers = startConditionHandlers.filter(function(handler) {
        return handler.name !== name;
      });
    },
    
    removeCompletionConditionHandler: function(name) {
      completionConditionHandlers = completionConditionHandlers.filter(function(handler) {
        return handler.name !== name;
      });
    },
    
    // Expose constants for external use
    MARKERS: MARKERS,
    HEADERS: HEADERS,
    DEFAULT_VALUES: DEFAULT_VALUES
  };
})();
