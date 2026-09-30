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
    SUCCESS: '\\C[14]〇\\C[0]',
    FAILURE: '\\C[12]×\\C[0]',
    ACHIEVED: '\\C[10]達成\\C[0]',
    NOT_ACHIEVED: '\\C[1]未達成\\C[0]',
    CAN_DELIVER: '\\C[10]納品可能\\C[0]',
    CANNOT_DELIVER: '\\C[1]納品不可\\C[0]',
    LEARNED: '\\C[10]習得\\C[0]',
    NOT_LEARNED: '\\C[1]未習得\\C[0]',
    EQUIPPED: '\\C[10]装着\\C[0]',
    NOT_EQUIPPED: '\\C[1]未装着\\C[0]',
    GRANTED: '\\C[10]付与\\C[0]',
    NOT_GRANTED: '\\C[1]未付与\\C[0]'
  };

  var HEADERS = {
    COMPLETION: '\\C[16]●達成条件\\C[0]\n',
    START: '\\C[16]●発生条件\\C[0]\n',
    NO_COMPLETION: '\\C[16]●達成条件なし\\C[0]'
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
    return $gameVariables.value(2);
  }

  function getCurrentActor() {
    return $gameActors.actor(getCurrentActorId());
  }

  function getActorById(actorId) {
    var id = Number(actorId);
    if (id === 0) id = getCurrentActorId();
    return $gameActors.actor(id);
  }

  function parseMetaArray(metaValue) {
    return String(metaValue).split(',');
  }

  function getItemsCollection(type) {
    var typeNum = Number(type);
    if (typeNum === 1) return $dataWeapons;
    if (typeNum === 2) return $dataArmors;
    return $dataItems;
  }

  function isActorAvailable(actor) {
    if (!actor) return false;
    return actor.isLearnedSkill(18) && !actor.isStateAffected(valueDollStateId);
  }

  //変数が未設定/配列でない場合に index アクセスで落ちないためのヘルパ
  //未設定時の比較結果は従来(例外)ではなく undefined になる
  function getArrayValue(varId, index) {
    var arr = $gameVariables.value(varId);
    if (!Array.isArray(arr)) return undefined;
    return arr[index];
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
      completionTextInitial: HEADERS.COMPLETION,
      tempValue13: 0,
      tempValue14: 0
    };
  }

  function appendConditionResult(ctx, type, isMet, text) {
    if (type === 'start') {
      ctx.startText += text;
      ctx.startTotal++;
      if (isMet) ctx.startMet++;
    } else {
      ctx.completionText += text;
      ctx.completionTotal++;
      if (isMet) ctx.completionMet++;
    }
  }

  // ============================================================
  // START CONDITION HANDLERS REGISTRY
  // ============================================================
  
  var startConditionHandlers = [];

  // Handler: Adventurer Rank (QuestSetRank)
  startConditionHandlers.push({
    name: 'QuestSetRank',
    process: function(item, ctx) {
      if (!item.meta['QuestSetRank']) return;

      var rankValue = Number(item.meta['QuestSetRank']);
      if (rankValue < 1) return;
      
      ctx.startText += '\\C[10]【ランク制限】\\C[0]';
      
      var itemId = 693;
      if (rankValue >= 2) itemId = 694;
      if (rankValue >= 3) itemId = 695;
      
      var rankItem = $dataItems[itemId];
      if (!rankItem) return;
      var isMet = $gameParty.hasItem(rankItem, true);
      ctx.startTotal++;
      if (isMet) ctx.startMet++;
      ctx.startText += isMet ? MARKERS.SUCCESS + '\n' : MARKERS.FAILURE + '\n';
    }
  });

  // Handler: Perspective (QuestSetPerspective)
  startConditionHandlers.push({
    name: 'QuestSetPerspective',
    process: function(item, ctx) {
      if (!item.meta['QuestSetPerspective']) return;
      
      var perspectiveId = Number(item.meta['QuestSetPerspective']);
      var perspectiveActor = perspectiveId >= 1 ? $gameActors.actor(perspectiveId) : null;
      if (perspectiveId >= 1 && perspectiveId !== getCurrentActorId() && perspectiveActor) {
        ctx.startText += '[' + perspectiveActor.name() + '視点]\n';
      }
      
      var isMet = $gameSwitches.value(perspectiveId + 440);
      ctx.startTotal++;
      if (isMet) ctx.startMet++;
    }
  });

  // Handler: Note Word (NoteWord)
  startConditionHandlers.push({
    name: 'NoteWord',
    process: function(item, ctx) {
      if (!item.meta['NoteWord']) return;
      ctx.startText += '[' + item.meta['NoteWord'] + ']';
    }
  });

  // Handler: Actor Exists (QuestSetActor)
  startConditionHandlers.push({
    name: 'QuestSetActor',
    process: function(item, ctx) {
      if (!item.meta['QuestSetActor']) return;
      
      var arr = parseMetaArray(item.meta['QuestSetActor']);
      var hasExternalActor = false;
      
      for (var id = 0; id < arr.length; id++) {
        var actorId = Number(arr[id]);
        if (actorId === 0) actorId = getCurrentActorId();
        
        var actor = $gameActors.actor(actorId);
        if (!actor) continue;
        
        if (actorId !== getCurrentActorId()) {
          ctx.startText += '[' + actor.name() + ']';
          hasExternalActor = true;
        }
        
        var isMet = isActorAvailable(actor);
        ctx.startTotal++;
        if (isMet) ctx.startMet++;
        ctx.startText += isMet ? MARKERS.SUCCESS : MARKERS.FAILURE;
      }
      
      if (hasExternalActor) ctx.startText += '\n';
      ctx.tempValue14 = 0;
    }
  });

  // Handler: Map Condition (QuestSetMap)
  startConditionHandlers.push({
    name: 'QuestSetMap',
    process: function(item, ctx) {
      if (!item.meta['QuestSetMap']) return;
      
      var mapId = Number(item.meta['QuestSetMap']);
      if (mapId === 0) mapId = DEFAULT_VALUES.SWITCH_ID;
      
      var isMet = $gameSwitches.value(mapId);
      ctx.startTotal++;
      if (isMet) ctx.startMet++;
    }
  });

  // Handler: Switch Condition (QuestSetSwi)
  startConditionHandlers.push({
    name: 'QuestSetSwi',
    process: function(item, ctx) {
      if (!item.meta['QuestSetSwi']) return;
      
      var switchId = Number(item.meta['QuestSetSwi']);
      if (switchId === 0) switchId = DEFAULT_VALUES.SWITCH_ID;
      
      if (switchId !== DEFAULT_VALUES.SWITCH_ID) {
        var switchName = cleanSystemName($dataSystem.switches[switchId]);
        ctx.startText += '【' + switchName;
      }
      
      var isMet = $gameSwitches.value(switchId);
      ctx.startTotal++;
      if (isMet) ctx.startMet++;
      ctx.startText += isMet ? MARKERS.SUCCESS + '】\n' : MARKERS.FAILURE + '】\n';
    }
  });

  // Handler: Main Quest Progress (QuestSetMainRoot)
  startConditionHandlers.push({
    name: 'QuestSetMainRoot',
    process: function(item, ctx) {
      if (!item.meta['QuestSetMainRoot']) return;
      
      var arr = parseMetaArray(item.meta['QuestSetMainRoot']);
      var varId = Number(arr[0]) || DEFAULT_VALUES.MAIN_ROOT_VAR;
      var targetValue = Number(arr[1]);
      
      if (targetValue !== 0) {
        ctx.startText += '【メインクエスト進行[' + targetValue + ']以上';
      }
      
      var isMet = $gameVariables.value(varId) >= targetValue;
      ctx.startTotal++;
      if (isMet) ctx.startMet++;
      ctx.startText += isMet ? MARKERS.SUCCESS + '】\n' : MARKERS.FAILURE + '】\n';
    }
  });

  // Handler: Variable Conditions (QuestSetVal1-9)
  startConditionHandlers.push({
    name: 'QuestSetVal',
    process: function(item, ctx) {
      for (var id = 1; id <= 9; id++) {
        var metaKey = 'QuestSetVal' + id;
        if (!item.meta[metaKey]) continue;
        
        var arr = parseMetaArray(item.meta[metaKey]);
        var varId = Number(arr[0]) || DEFAULT_VALUES.VARIABLE_ID;
        var targetValue = Number(arr[1]);
        
        if (varId !== DEFAULT_VALUES.VARIABLE_ID) {
          var varName = cleanSystemName($dataSystem.variables[varId]);
          ctx.startText += '【' + varName + ' ' + $gameVariables.value(varId) + '/' + targetValue;
          
          var isMet = $gameVariables.value(varId) >= targetValue;
          ctx.startTotal++;
          if (isMet) ctx.startMet++;
          ctx.startText += isMet ? MARKERS.SUCCESS + '】\n' : MARKERS.FAILURE + '】\n';
        }
      }
    }
  });

  // Handler: H-Exp Array Conditions (QuestSetHexpArr1-9)
  startConditionHandlers.push({
    name: 'QuestSetHexpArr',
    process: function(item, ctx) {
      for (var id = 1; id <= 9; id++) {
        var metaKey = 'QuestSetHexpArr' + id;
        if (!item.meta[metaKey]) continue;
        
        var arr = parseMetaArray(item.meta[metaKey]);
        var actorId = Number(arr[0]);
        var paramType = Number(arr[1]);
        var targetValue = Number(arr[2]);
        var actor = $gameActors.actor(actorId);
        if (!actor) continue;
        var currentValue = getArrayValue(actorId + 380, paramType);
        var isMet;
        
        if (paramType === 4) { // 露出度 - less than or equal
          isMet = currentValue <= targetValue;
          ctx.startText += '[\\C[27]' + actor.name() + '\\C[0]' + $dataSystem.variables[paramType + 400] + targetValue + '以下';
        } else {
          isMet = currentValue >= targetValue;
          ctx.startText += '[\\C[27]' + actor.name() + '\\C[0]' + $dataSystem.variables[paramType + 400] + targetValue + '以上';
        }
        
        ctx.startTotal++;
        if (isMet) ctx.startMet++;
        ctx.startText += isMet ? MARKERS.SUCCESS + '】\n' : MARKERS.FAILURE + '】\n';
      }
    }
  });

  // Handler: Skill Condition (QuestSetSkill)
  startConditionHandlers.push({
    name: 'QuestSetSkill',
    process: function(item, ctx) {
      if (!item.meta['QuestSetSkill']) return;
      
      var arr = parseMetaArray(item.meta['QuestSetSkill']);
      var actorId = Number(arr[0]);
      var skillId = Number(arr[1]) || DEFAULT_VALUES.SKILL_ID;
      var actor = actorId >= 1 ? $gameActors.actor(actorId) : getCurrentActor();
      if (!actor) return;
      var skill = $dataSkills[skillId];
      if (!skill) return;
      
      if (skillId !== DEFAULT_VALUES.SKILL_ID) {
        var prefix = (actorId === getCurrentActorId()) ? '' : actor.name() + 'が';
        ctx.startText += '【' + prefix + skill.name + '習得';
      }
      
      var isMet = actor.isLearnedSkill(skillId);
      ctx.startTotal++;
      if (isMet) ctx.startMet++;
      ctx.startText += isMet ? MARKERS.SUCCESS + '】\n' : MARKERS.FAILURE + '】\n';
    }
  });

  // Handler: Skill Equip Condition (QuestSetSkillEquip)
  startConditionHandlers.push({
    name: 'QuestSetSkillEquip',
    process: function(item, ctx) {
      if (!item.meta['QuestSetSkillEquip']) return;
      
      var arr = parseMetaArray(item.meta['QuestSetSkillEquip']);
      var actorId = Number(arr[0]) || getCurrentActorId();
      var skillId = Number(arr[1]) || DEFAULT_VALUES.SKILL_ID;
      var actor = $gameActors.actor(actorId);
      if (!actor) return;
      var skill = $dataSkills[skillId];
      if (!skill) return;
      
      if (skillId !== DEFAULT_VALUES.SKILL_ID) {
        var prefix = (actorId === getCurrentActorId()) ? '' : actor.name() + 'が';
        ctx.startText += '【' + prefix + skill.name + '装着';
      }
      
      var isMet = actor.battleSkillsRaw().includes(skillId);
      ctx.startTotal++;
      if (isMet) ctx.startMet++;
      ctx.startText += isMet ? MARKERS.SUCCESS + '】\n' : MARKERS.FAILURE + '】\n';
    }
  });

  // Handler: Skill Rank Condition (QuestSetSkillRank)
  startConditionHandlers.push({
    name: 'QuestSetSkillRank',
    process: function(item, ctx) {
      if (!item.meta['QuestSetSkillRank']) return;
      
      var arr = parseMetaArray(item.meta['QuestSetSkillRank']);
      var actorId = Number(arr[0]);
      var skillId = Number(arr[1]) || DEFAULT_VALUES.SKILL_ID;
      var requiredRank = Number(arr[2]);
      var actor = actorId >= 1 ? $gameActors.actor(actorId) : getCurrentActor();
      if (!actor) return;
      var skill = $dataSkills[skillId];
      if (!skill) return;
      
      if (skillId !== DEFAULT_VALUES.SKILL_ID) {
        var prefix = (actorId === getCurrentActorId()) ? '' : actor.name() + 'が';
        ctx.startText += '【' + prefix + skill.name + 'ランク' + requiredRank + '以上';
      }
      
      var isMet = actor.isLearnedSkill(skillId) && actor.skillMasteryLevel(skillId) >= requiredRank;
      ctx.startTotal++;
      if (isMet) ctx.startMet++;
      ctx.startText += isMet ? MARKERS.SUCCESS + '】\n' : MARKERS.FAILURE + '】\n';
    }
  });

  // Handler: State Condition (QuestSetState)
  startConditionHandlers.push({
    name: 'QuestSetState',
    process: function(item, ctx) {
      if (!item.meta['QuestSetState']) return;
      
      var arr = parseMetaArray(item.meta['QuestSetState']);
      var actorId = Number(arr[0]) || getCurrentActorId();
      var stateId = Number(arr[1]) || DEFAULT_VALUES.STATE_ID;
      var actor = $gameActors.actor(actorId);
      if (!actor) return;
      
      if (stateId !== DEFAULT_VALUES.STATE_ID) {
        var prefix = (actorId === getCurrentActorId()) ? '' : actor.name() + 'が';
        ctx.startText += '【' + prefix + '\\x1bSIM[' + stateId + ']';
      }
      
      var isMet = actor.isStateAffected(stateId);
      ctx.startTotal++;
      if (isMet) ctx.startMet++;
      ctx.startText += isMet ? MARKERS.SUCCESS + '】\n' : MARKERS.FAILURE + '】\n';
    }
  });

  // Handler: Item Condition (QuestSetItem)
  startConditionHandlers.push({
    name: 'QuestSetItem',
    process: function(item, ctx) {
      if (!item.meta['QuestSetItem']) return;
      
      var arr = parseMetaArray(item.meta['QuestSetItem']);
      var itemType = Number(arr[0]);
      var itemId = Number(arr[1]) || DEFAULT_VALUES.ITEM_ID;
      var requiredAmount = Number(arr[2]);
      var itemsCollection = getItemsCollection(itemType);
      var targetItem = itemsCollection[itemId];
      if (!targetItem) return;
      
      if (itemId !== DEFAULT_VALUES.ITEM_ID) {
        ctx.startText += '【' + targetItem.name + '所持';
      }
      
      var isMet = $gameParty.numItems(targetItem) >= requiredAmount;
      ctx.startTotal++;
      if (isMet) ctx.startMet++;
      ctx.startText += isMet ? MARKERS.SUCCESS + '】\n' : MARKERS.FAILURE + '】\n';
    }
  });

  // Handler: Subjugation Condition (QuestSetSubjugation)
  startConditionHandlers.push({
    name: 'QuestSetSubjugation',
    process: function(item, ctx) {
      if (!item.meta['QuestSetSubjugation']) return;
      
      var arr = parseMetaArray(item.meta['QuestSetSubjugation']);
      var subjugationId = Number(arr[0]) || DEFAULT_VALUES.SUBJUGATION_VAR;
      var targetCount = Number(arr[1]);
      var currentCount = getArrayValue(52, subjugationId);
      
      if (subjugationId >= 3) {
        ctx.startText += '【\\x1bSIM[' + subjugationId + ']\\C[10]' + targetCount + '\\C[0]体討伐';
      } else if (subjugationId === 1) {
        ctx.startText += '【\\C[2]当日魔物討伐数\\C[0]:' + currentCount + '/' + targetCount;
      } else if (subjugationId === 2) {
        ctx.startText += '【\\C[2]総魔物討伐数\\C[0]:' + currentCount + '/' + targetCount;
      }
      
      var isMet = currentCount >= targetCount;
      ctx.startTotal++;
      if (isMet) ctx.startMet++;
      ctx.startText += isMet ? MARKERS.SUCCESS + '】\n' : MARKERS.FAILURE + '】\n';
    }
  });

  // Handler: Item Array Condition (QuestSetItemArr)
  startConditionHandlers.push({
    name: 'QuestSetItemArr',
    process: function(item, ctx) {
      if (!item.meta['QuestSetItemArr']) return;
      
      var arr = parseMetaArray(item.meta['QuestSetItemArr']);
      
      for (var id = 0; id < arr.length; id++) {
        var itemId = Number(arr[id]) || DEFAULT_VALUES.ITEM_ID;
        if (itemId === DEFAULT_VALUES.ITEM_ID) continue;
        
        var targetItem = $dataItems[itemId];
        if (!targetItem) continue;
        
        if (targetItem.meta['EICSwitch']) {
          var eicSwitch = Number(targetItem.meta['EICSwitch']);
          if (eicSwitch === 102) ctx.startText += '【挿話:';
          else if (eicSwitch === 103) ctx.startText += '【シーン:';
          else if (eicSwitch === 104) ctx.startText += '【称号:';
          else if (eicSwitch === 105) ctx.startText += '【H称号:';
        } else if (targetItem.meta['SG種別'] && Number(targetItem.meta['SG種別']) === 1) {
          ctx.startText += '【クエスト:';
        } else {
          ctx.startText += '【';
        }
        
        ctx.startText += '\\x1bIIN[' + itemId + ']';
        
        var isMet = $gameParty.hasItem(targetItem, true);
        ctx.startTotal++;
        if (isMet) ctx.startMet++;
        ctx.startText += isMet ? MARKERS.SUCCESS + '】\n' : MARKERS.FAILURE + '】\n';
      }
    }
  });

  // ============================================================
  // COMPLETION CONDITION HANDLERS REGISTRY
  // ============================================================
  
  var completionConditionHandlers = [];

  // Handler: Perspective (QuestCompPerspective)
  completionConditionHandlers.push({
    name: 'QuestCompPerspective',
    process: function(item, ctx) {
      if (!item.meta['QuestCompPerspective']) return;
      
      var perspectiveId = Number(item.meta['QuestCompPerspective']);
      var perspectiveActor = perspectiveId >= 1 ? $gameActors.actor(perspectiveId) : null;
      if (perspectiveId >= 1 && perspectiveId !== getCurrentActorId() && perspectiveActor) {
        ctx.completionText += '[' + perspectiveActor.name() + '視点';
      }
      
      var isMet = $gameSwitches.value(perspectiveId + 440);
      ctx.completionTotal++;
      if (isMet) ctx.completionMet++;
      ctx.completionText += isMet ? MARKERS.SUCCESS + ']\n' : MARKERS.FAILURE + ']\n';
    }
  });

  // Handler: Actor Exists (QuestCompActor)
  completionConditionHandlers.push({
    name: 'QuestCompActor',
    process: function(item, ctx) {
      if (!item.meta['QuestCompActor']) return;
      
      var arr = parseMetaArray(item.meta['QuestCompActor']);
      var hasExternalActor = false;
      
      for (var id = 0; id < arr.length; id++) {
        var actorId = Number(arr[id]) || getCurrentActorId();
        var actor = $gameActors.actor(actorId);
        if (!actor) continue;
        
        ctx.completionText += '[' + actor.name();
        hasExternalActor = true;
        
        var isMet = isActorAvailable(actor);
        ctx.completionTotal++;
        if (isMet) ctx.completionMet++;
        ctx.completionText += isMet ? MARKERS.SUCCESS + ']' : MARKERS.FAILURE + ']';
      }
      
      if (hasExternalActor) ctx.startText += '\n';
    }
  });

  // Handler: Subjugation Completion (QuestCompSubjugation1-9)
  completionConditionHandlers.push({
    name: 'QuestCompSubjugation',
    process: function(item, ctx) {
      for (var id = 1; id <= 9; id++) {
        var metaKey = 'QuestCompSubjugation' + id;
        if (!item.meta[metaKey]) continue;
        
        var arr = parseMetaArray(item.meta[metaKey]);
        var subjugationId = Number(arr[0]);
        var targetCount = Number(arr[1]);
        var currentCount = getArrayValue(52, subjugationId);
        
        if (subjugationId <= 5) {
          if (subjugationId === 1) {
            ctx.completionText += '【\\C[2]当日魔物討伐数\\C[0]:' + currentCount + '/' + targetCount;
          } else if (subjugationId === 2) {
            ctx.completionText += '【\\C[2]総魔物討伐数\\C[0]:' + currentCount + '/' + targetCount;
          }
        } else {
          ctx.completionText += '【\\C[2]\\x1bSIM[' + subjugationId + ']\\C[0]:' + currentCount + '/' + targetCount;
        }
        
        var isMet = currentCount >= targetCount;
        ctx.completionTotal++;
        if (isMet) ctx.completionMet++;
        ctx.completionText += isMet ? MARKERS.ACHIEVED + '】\n' : MARKERS.NOT_ACHIEVED + '】\n';
      }
    }
  });

  // Handler: Item Collection (QuestCompcollect1-9)
  completionConditionHandlers.push({
    name: 'QuestCompcollect',
    process: function(item, ctx) {
      for (var id = 1; id <= 9; id++) {
        var metaKey = 'QuestCompcollect' + id;
        if (!item.meta[metaKey]) continue;
        
        var arr = parseMetaArray(item.meta[metaKey]);
        var itemId = Number(arr[0]) || DEFAULT_VALUES.ITEM_ID;
        var itemType = Number(arr[1]);
        var requiredAmount = Number(arr[2]);
        var itemsCollection = getItemsCollection(itemType);
        
        // Update global quest array
        if (itemType === 0) valueQuestArray1[itemId] = [1, ctx.index];
        else if (itemType === 1) valueQuestArray1[itemId + 2000] = [2, ctx.index];
        else if (itemType === 2) valueQuestArray1[itemId + 3000] = [3, ctx.index];
        
        if (itemId === DEFAULT_VALUES.ITEM_ID) continue;
        
        var collectItem = itemsCollection[itemId];
        if (!collectItem) continue;
        var currentAmount = $gameParty.numItems(collectItem);
        ctx.completionText += '【\\C[2]' + collectItem.name + '\\C[0]:' + currentAmount + '/' + requiredAmount;
        
        var isMet = currentAmount >= requiredAmount;
        ctx.completionTotal++;
        if (isMet) ctx.completionMet++;
        ctx.completionText += isMet ? MARKERS.ACHIEVED + '】\n' : MARKERS.NOT_ACHIEVED + '】\n';
      }
    }
  });

  // Handler: Item Delivery (QuestCompDelivery1-9)
  completionConditionHandlers.push({
    name: 'QuestCompDelivery',
    process: function(item, ctx) {
      for (var id = 1; id <= 9; id++) {
        var metaKey = 'QuestCompDelivery' + id;
        if (!item.meta[metaKey]) continue;
        
        var arr = parseMetaArray(item.meta[metaKey]);
        var itemId = Number(arr[0]) || DEFAULT_VALUES.ITEM_ID;
        var itemType = Number(arr[1]);
        var requiredAmount = Number(arr[2]);
        var itemsCollection = getItemsCollection(itemType);
        
        // Update global quest array
        if (itemType === 0) valueQuestArray1[itemId] = [1, ctx.index];
        else if (itemType === 1) valueQuestArray1[itemId + 2000] = [2, ctx.index];
        else if (itemType === 2) valueQuestArray1[itemId + 3000] = [3, ctx.index];
        
        if (itemId === DEFAULT_VALUES.ITEM_ID) continue;
        
        var deliveryItem = itemsCollection[itemId];
        if (!deliveryItem) continue;
        var currentAmount = $gameParty.numItems(deliveryItem);
        ctx.completionText += '【\\C[2]' + deliveryItem.name + '\\C[0]:' + currentAmount + '/' + requiredAmount;
        
        var isMet = currentAmount >= requiredAmount;
        ctx.completionTotal++;
        if (isMet) ctx.completionMet++;
        ctx.completionText += isMet ? MARKERS.CAN_DELIVER + '】\n' : MARKERS.CANNOT_DELIVER + '】\n';
      }
    }
  });

  // Handler: Variable Completion (QuestCompVal1-9)
  completionConditionHandlers.push({
    name: 'QuestCompVal',
    process: function(item, ctx) {
      for (var id = 1; id <= 9; id++) {
        var metaKey = 'QuestCompVal' + id;
        if (!item.meta[metaKey]) continue;
        
        var arr = parseMetaArray(item.meta[metaKey]);
        var varId = Number(arr[0]) || DEFAULT_VALUES.VARIABLE_ID;
        var targetValue = Number(arr[1]);
        
        if (varId === DEFAULT_VALUES.VARIABLE_ID) continue;
        
        var varName = cleanSystemName($dataSystem.variables[varId]);
        var currentValue = $gameVariables.value(varId);
        ctx.completionText += '【\\C[2]' + varName + '\\C[0]:' + currentValue + '/' + targetValue;
        
        var isMet = currentValue >= targetValue;
        ctx.completionTotal++;
        if (isMet) ctx.completionMet++;
        ctx.completionText += isMet ? MARKERS.ACHIEVED + '】\n' : MARKERS.NOT_ACHIEVED + '】\n';
      }
    }
  });

  // Handler: Array Variable Completion (QuestCompArray1-9)
  completionConditionHandlers.push({
    name: 'QuestCompArray',
    process: function(item, ctx) {
      for (var id = 1; id <= 9; id++) {
        var metaKey = 'QuestCompArray' + id;
        if (!item.meta[metaKey]) continue;
        
        var arr = parseMetaArray(item.meta[metaKey]);
        var varId = Number(arr[0]) || DEFAULT_VALUES.VARIABLE_ID;
        var arrayIndex = Number(arr[1]);
        var targetValue = Number(arr[2]);
        
        if (varId === DEFAULT_VALUES.VARIABLE_ID) continue;
        
        var currentValue = getArrayValue(varId, arrayIndex);
        ctx.completionText += '【\\C[2]' + $dataSystem.variables[varId] + '\\C[0]:' + currentValue + '/' + targetValue;
        
        var isMet = currentValue >= targetValue;
        ctx.completionTotal++;
        if (isMet) ctx.completionMet++;
        ctx.completionText += isMet ? MARKERS.ACHIEVED + '】\n' : MARKERS.NOT_ACHIEVED + '】\n';
      }
    }
  });

  // Handler: Skill Learning Completion (QuestCompSkill1-9)
  completionConditionHandlers.push({
    name: 'QuestCompSkill',
    process: function(item, ctx) {
      for (var id = 1; id <= 9; id++) {
        var metaKey = 'QuestCompSkill' + id;
        if (!item.meta[metaKey]) continue;
        
        var arr = parseMetaArray(item.meta[metaKey]);
        var actorId = Number(arr[0]);
        var skillId = Number(arr[1]) || DEFAULT_VALUES.SKILL_ID;
        var actor = actorId >= 1 ? $gameActors.actor(actorId) : getCurrentActor();
        if (!actor) continue;
        var skill = $dataSkills[skillId];
        if (!skill) continue;
        
        if (skillId === DEFAULT_VALUES.SKILL_ID) continue;
        
        var prefix = (actorId === getCurrentActorId()) ? '' : actor.name() + 'が';
        ctx.completionText += '【' + prefix + '\\C[2]' + skill.name + '\\C[0]:';
        
        var isMet = actor.isLearnedSkill(skillId);
        ctx.completionTotal++;
        if (isMet) ctx.completionMet++;
        ctx.completionText += isMet ? MARKERS.LEARNED + '】\n' : MARKERS.NOT_LEARNED + '】\n';
      }
    }
  });

  // Handler: Skill Equip Completion (QuestCompSkillEquip1-9)
  completionConditionHandlers.push({
    name: 'QuestCompSkillEquip',
    process: function(item, ctx) {
      for (var id = 1; id <= 9; id++) {
        var metaKey = 'QuestCompSkillEquip' + id;
        if (!item.meta[metaKey]) continue;
        
        var arr = parseMetaArray(item.meta[metaKey]);
        var actorId = Number(arr[0]);
        var skillId = Number(arr[1]) || DEFAULT_VALUES.SKILL_ID;
        var actor = actorId >= 1 ? $gameActors.actor(actorId) : getCurrentActor();
        if (!actor) continue;
        var skill = $dataSkills[skillId];
        if (!skill) continue;
        
        if (skillId === DEFAULT_VALUES.SKILL_ID) continue;
        
        var prefix = (actorId === getCurrentActorId()) ? '' : actor.name() + 'が';
        ctx.completionText += '【' + prefix + '\\C[2]' + skill.name + '\\C[0]:';
        
        var isMet = actor.battleSkillsRaw().includes(skillId);
        ctx.completionTotal++;
        if (isMet) ctx.completionMet++;
        ctx.completionText += isMet ? MARKERS.EQUIPPED + '】\n' : MARKERS.NOT_EQUIPPED + '】\n';
      }
    }
  });

  // Handler: Skill Rank Completion (QuestCompSkillRank1-9)
  completionConditionHandlers.push({
    name: 'QuestCompSkillRank',
    process: function(item, ctx) {
      for (var id = 1; id <= 9; id++) {
        var metaKey = 'QuestCompSkillRank' + id;
        if (!item.meta[metaKey]) continue;
        
        var arr = parseMetaArray(item.meta[metaKey]);
        var actorId = Number(arr[0]);
        var skillId = Number(arr[1]) || DEFAULT_VALUES.SKILL_ID;
        var requiredRank = Number(arr[2]);
        var actor = actorId >= 1 ? $gameActors.actor(actorId) : getCurrentActor();
        if (!actor) continue;
        var skill = $dataSkills[skillId];
        if (!skill) continue;
        
        if (skillId === DEFAULT_VALUES.SKILL_ID) continue;
        
        var prefix = (actorId === getCurrentActorId()) ? '' : actor.name() + 'が';
        ctx.completionText += '【' + prefix + '\\C[2]' + skill.name + '\\C[0]ランク' + requiredRank + ':';
        
        var isMet = actor.skillMasteryLevel(skillId) >= requiredRank;
        ctx.completionTotal++;
        if (isMet) ctx.completionMet++;
        ctx.completionText += isMet ? MARKERS.ACHIEVED + '】\n' : MARKERS.NOT_ACHIEVED + '】\n';
      }
    }
  });

  // Handler: State Completion (QuestCompState1-9)
  completionConditionHandlers.push({
    name: 'QuestCompState',
    process: function(item, ctx) {
      for (var id = 1; id <= 9; id++) {
        var metaKey = 'QuestCompState' + id;
        if (!item.meta[metaKey]) continue;
        
        var arr = parseMetaArray(item.meta[metaKey]);
        var actorId = Number(arr[0]);
        var stateId = Number(arr[1]) || DEFAULT_VALUES.STATE_ID;
        var actor = actorId >= 1 ? $gameActors.actor(actorId) : getCurrentActor();
        if (!actor) continue;
        
        if (stateId === DEFAULT_VALUES.STATE_ID) continue;
        
        var prefix = (actorId === getCurrentActorId()) ? '' : actor.name() + 'が';
        ctx.completionText += '【' + prefix + '\\C[2]\\x1bSIM[' + stateId + ']\\C[0]:';
        
        var isMet = actor.isStateAffected(stateId);
        ctx.completionTotal++;
        if (isMet) ctx.completionMet++;
        ctx.completionText += isMet ? MARKERS.GRANTED + '】\n' : MARKERS.NOT_GRANTED + '】\n';
      }
    }
  });

  // Handler: Switch Completion (QuestCompSwi)
  completionConditionHandlers.push({
    name: 'QuestCompSwi',
    process: function(item, ctx) {
      if (!item.meta['QuestCompSwi']) return;
      
      var switchId = Number(item.meta['QuestCompSwi']);
      if (switchId === 0) switchId = DEFAULT_VALUES.SWITCH_ID;
      if (switchId === DEFAULT_VALUES.SWITCH_ID) return;
      
      var switchName = cleanSystemName($dataSystem.switches[switchId]);
      ctx.completionText += '【\\C[2]' + switchName + '\\C[0]:';
      
      var isMet = $gameSwitches.value(switchId);
      ctx.completionTotal++;
      if (isMet) ctx.completionMet++;
      ctx.completionText += isMet ? MARKERS.ACHIEVED + '】\n' : MARKERS.NOT_ACHIEVED + '】\n';
    }
  });

  // Handler: Money/Donation (QuestCompMoney) - Processed at the end
  completionConditionHandlers.push({
    name: 'QuestCompMoney',
    process: function(item, ctx) {
      if (!item.meta['QuestCompMoney']) return;
      
      var requiredMoney = Number(item.meta['QuestCompMoney']);
      if (requiredMoney < 1) return;
      
      ctx.completionText += '【\\C[2]' + requiredMoney + '\\G';
      
      var isMet = $gameParty.gold() >= requiredMoney;
      ctx.completionTotal++;
      if (isMet) ctx.completionMet++;
      ctx.completionText += isMet ? MARKERS.SUCCESS + '】\n' : MARKERS.FAILURE + '】\n';
    }
  });

  // ============================================================
  // MAIN PROCESSING FUNCTION
  // ============================================================
  
  function processQuests(rangeConfigId) {
    var config = RANGE_CONFIGS[rangeConfigId];
    if (!config) return;
    
    // Initialize global array if needed
    if (config.initArray) {
      valueQuestArray1 = Array(config.arraySize).fill([]);
    }
    
    var start = config.start;
    var end = config.end;
    var offset = config.offset;
    
    for (var i = start; i <= end; i++) {
      if (!$dataItems[i] || $dataItems[i].name === '') continue;
      
      var item = $dataItems[i];
      var ctx = createConditionContext(item, i, offset);
      
      // Process all start conditions
      startConditionHandlers.forEach(function(handler) {
        handler.process(item, ctx);
      });
      
      // Process all completion conditions
      completionConditionHandlers.forEach(function(handler) {
        handler.process(item, ctx);
      });
      
      // Finalize texts
      if (ctx.completionText === ctx.completionTextInitial) {
        ctx.completionText = HEADERS.NO_COMPLETION;
      }
      
      if (ctx.startText === ctx.startTextInitial) {
        ctx.startText += '【なし】\n';
      }
      
      // Set global arrays
      valueQuestArray7[i - offset] = ctx.startText;
      valueQuestArray4[i - offset] = $dataItems[i].description + '\n';
      
      // Add supplement if exists
      if (item.meta['QuestSupplement']) {
        valueQuestArray4[i - offset] += item.meta['QuestSupplement'];
      }
    }
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
      startConditionHandlers = startConditionHandlers.filter(function(h) {
        return h.name !== name;
      });
    },
    
    removeCompletionConditionHandler: function(name) {
      completionConditionHandlers = completionConditionHandlers.filter(function(h) {
        return h.name !== name;
      });
    },
    
    // Expose constants for external use
    MARKERS: MARKERS,
    HEADERS: HEADERS,
    DEFAULT_VALUES: DEFAULT_VALUES
  };
})();