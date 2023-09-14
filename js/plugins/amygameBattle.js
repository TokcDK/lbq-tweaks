/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function() {

//エネミー戦闘不能時にドロップ計算
enemy_dropSelection = function (user) {

    if ($gameSwitches.value(607) || $gameSwitches.value(608)) { } else {
        for (var i = 1; i <= valueSubjugationPoint.length - 1; i++) {//討伐数カウント
            if (user.isStateAffected(valueSubjugationPoint[i])) {
                $gameVariables.value(52)[valueSubjugationPoint[i]] += 1;
                if (!$gameParty.inBattle()) {
                    var value1 = `\x1bSIM[${valueSubjugationPoint[i]}]：討伐数\\C[10]+1\\C[0]\n`;
                    valueWordSet3 += `${value1}`;
                    $gameSystem.pushInfoLog(value1);
                    //CommonPopupManager.showInfo({},value1,null);
                };
            }
        };
        if (!user.isStateAffected(436)) {
            $gameVariables.value(52)[1] += 1;//ヒューマン以外の魔物当日討伐数
            $gameVariables.value(52)[2] += 1;//ヒューマン以外の魔物総合討伐数
        }
    };
    if (!$gameParty.inBattle()) {
        valueDropEnemyLevel = Math.ceil($gameActors.actor($gameVariables.value(11)).level / 2);
    } else {
        valueDropEnemyLevel = user.level;
    };
    var actor = $gameActors.actor($gameVariables.value(20));
    var arr1 = Array(51).fill(0);
    var j = 0;
    //if(user.isStateAffected(610) && $gameVariables.value(96) == 0){arr1[j] = [0,0,10];j += 1};
    //if(user.isStateAffected(610) && actor.isStateAffected(1)){arr1[j] = [0,0,10];j += 1};
    var value1 = 0;
    for (var i = 0; i < valueAddPowerCustomState.length; i++) {
        if (user.isStateAffected(valueAddPowerCustomState[i])) {
            value1 += Number($dataStates[valueAddPowerCustomState[i]].meta['AddPowerCustom']);
        }
    };
    if (value1 >= 1) {
        for (var i = 0; i < value1.length; i++) {
            arr1[j] = [6, 0, 153]; j += 1;
        };
    };
    if (user.isStateAffected(51)) { arr1[j] = [4, 0, 154]; j += 1 };
    if (user.isStateAffected(52)) { arr1[j] = [4, 0, 155]; j += 1 };
    if (user.isStateAffected(53)) { arr1[j] = [4, 0, 156]; j += 1 };
    if (user.isStateAffected(54)) { arr1[j] = [4, 0, 157]; j += 1 };
    if (user.isStateAffected(55)) { arr1[j] = [4, 0, 158]; j += 1 };
    if (user.isStateAffected(56)) { arr1[j] = [4, 0, 159]; j += 1 };
    if (user.isStateAffected(610)) { arr1[j] = [0, 0, 10]; j += 1 };
    if (user.isStateAffected(610)) { arr1[j] = [1, 0, 196]; j += 1 };
    if (user.isStateAffected(610)) { arr1[j] = [3, 0, 197]; j += 1 };
    if (user.isStateAffected(610)) { arr1[j] = [5, 0, 198]; j += 1 };
    if (user.isStateAffected(610)) { arr1[j] = [9, 0, 199]; j += 1 };
    if (user.isStateAffected(610)) { arr1[j] = [6, 0, 190]; j += 1 };
    if (user.isStateAffected(610)) { arr1[j] = [7, 0, 147]; j += 1 };
    if (user.isStateAffected(610)) { arr1[j] = [10, 0, 148]; j += 1 };
    if (user.isStateAffected(610)) { arr1[j] = [8, 0, 152]; j += 1 };
    if (user.isStateAffected(610)) { arr1[j] = [8, 0, 153]; j += 1 };
    if (user.isStateAffected(451)) { arr1[j] = [6, 0, 191]; j += 1 };
    if (user.isStateAffected(452)) { arr1[j] = [7, 0, 192]; j += 1 };
    if (user.isStateAffected(453)) { arr1[j] = [8, 0, 193]; j += 1 };
    if (user.isStateAffected(454)) { arr1[j] = [10, 0, 194]; j += 1 };
    if (user.isStateAffected(451)) { arr1[j] = [6, 0, 161]; j += 1 };
    if (user.isStateAffected(452)) { arr1[j] = [6, 0, 162]; j += 1 };
    if (user.isStateAffected(451)) { arr1[j] = [6, 0, 163]; j += 1 };
    if (user.isStateAffected(452)) { arr1[j] = [6, 0, 164]; j += 1 };
    if (user.isStateAffected(441)) { arr1[j] = [6, 0, 165]; j += 1 };
    if (user.isStateAffected(442)) { arr1[j] = [6, 0, 165]; j += 1 };
    if (user.isStateAffected(443)) { arr1[j] = [6, 0, 166]; j += 1 };
    if (user.isStateAffected(446)) { arr1[j] = [6, 0, 167]; j += 1 };
    if (user.isStateAffected(455)) { arr1[j] = [6, 0, 168]; j += 1 };
    if (user.isStateAffected(448)) { arr1[j] = [10, 0, 169]; j += 1 };
    if (user.isStateAffected(453)) { arr1[j] = [10, 0, 169]; j += 1 };
    if (user.isStateAffected(454)) { arr1[j] = [10, 0, 169]; j += 1 };
    if (user.isStateAffected(610)) { arr1[j] = [10, 0, 170]; j += 1 };
    if ([851, 852, 853, 854, 855, 856, 857, 858, 859, 860, 861, 862, 863, 864, 865, 866, 867, 868, 869, 870, 871, 872, 873, 874, 875, 876, 877, 878, 879, 880].some(function (id) { return user.isStateAffected(id) })) {
        arr1[j] = [6, 0, 170]; j += 1;
        arr1[j] = [6, 2, id - 780]; j += 1;
    };
    if (user.isStateAffected(410)) {
        arr1[j] = [6, 0, 185]; j += 1;
        arr1[j] = [7, 0, 186]; j += 1;
        arr1[j] = [8, 0, 187]; j += 1;
        arr1[j] = [10, 0, 188]; j += 1;
        arr1[j] = [5, 0, 1115]; j += 1;
        arr1[j] = [8, 0, 1117]; j += 1;
        if (valueDropEnemyLevel >= 1 && valueDropEnemyLevel <= 20) {
            arr1[j] = [2, 0, 1118]; j += 1;
            arr1[j] = [3, 0, 1119]; j += 1;
            arr1[j] = [4, 0, 1120]; j += 1;
            arr1[j] = [5, 0, 1121]; j += 1;
        };
        if (valueDropEnemyLevel >= 11) {
            arr1[j] = [6, 0, 1122]; j += 1;
            arr1[j] = [7, 0, 1123]; j += 1;
            arr1[j] = [8, 0, 1124]; j += 1;
            arr1[j] = [10, 0, 1125]; j += 1;
        };
    };
    if (user.isStateAffected(440)) { arr1[j] = [5, 0, 220]; j += 1 };//プライマル・アニマ
    if (user.isStateAffected(440)) { arr1[j] = [8, 0, 240]; j += 1 };
    if (user.isStateAffected(461)) { arr1[j] = [5, 0, 251]; j += 1 };//人型とうのドロップ
    if (user.isStateAffected(462)) { arr1[j] = [5, 0, 252]; j += 1 };
    if (user.isStateAffected(463)) { arr1[j] = [5, 0, 253]; j += 1 };
    if (user.isStateAffected(464)) { arr1[j] = [5, 0, 254]; j += 1 };
    if (user.isStateAffected(465)) { arr1[j] = [5, 0, 255]; j += 1 };
    if (user.isStateAffected(466)) { arr1[j] = [5, 0, 256]; j += 1 };
    if (user.isStateAffected(467)) { arr1[j] = [5, 0, 257]; j += 1 };
    if (user.isStateAffected(479)) { arr1[j] = [6, 0, 270]; j += 1 };//特殊ステートドロップ
    if (user.isStateAffected(479)) { arr1[j] = [5, 0, 269]; j += 1 };
    if (user.isStateAffected(465)) { arr1[j] = [3, 0, 1287]; j += 1 };//魔物肉
    if (user.isStateAffected(465) && user.isStateAffected(454)) { arr1[j] = [3, 0, 1289]; j += 1 };//神の肉,食材+神格
    if ([475].some(function (id) { return user.isStateAffected(id) })) { arr1[j] = [6, 0, 151]; j += 1 };
    for (var i = 421; i <= 439; i++) {
        if (user.isStateAffected(i)) {
            if ($dataStates[i].meta['RaceDropKind']) {
                var arr2 = $dataStates[i].meta['RaceDropKind'].split(',');
                for (var id1 = 0; id1 <= arr2.length - 1; id1++) {
                    if ($dataItems[Number(arr2[id1])].meta['RaceDropRarity']) {
                        arr1[j] = [Number($dataItems[Number(arr2[id1])].meta['RaceDropRarity']), 0, Number(arr2[id1])];
                        j += 1;
                    };
                };
            };
        };
    };
    for (var i = 0; i <= arr1.length - 1; i++) {
        if (arr1[i] != 0) {
            drop_probabilityCalculation2(user, Number(arr1[i][0]));
            if (valueDropCount1 == 1) {
                if (Number(arr1[i][1]) == 0) { valueItems = $dataItems; var value1 = 'ItemDrop_Items' };
                if (Number(arr1[i][1]) == 1) { valueItems = $dataWeapons; var value1 = 'ItemDrop_Weapons' };
                if (Number(arr1[i][1]) == 2) { valueItems = $dataArmors; var value1 = 'ItemDrop_Armors' };
                if ($gameParty.inBattle()) {
                    $gameTroop.addDropItem(valueItems[Number(arr1[i][2])]);
                    //var value1 = `\x1bI[${valueItems[Number(arr1[i][2])].iconIndex}]`;
                    var arr2 = [50, 75, 100, 125, 150, 175, 200];
                    var arr3 = [-50, -40, -30, -20, -10, 0, 10, 20];
                    var arr4 = [80, 85, 90, 95, 100];
                    var arr7 = [-50, -60, -70, -80, -90, -100, -110, -120, -130, -140, -150, -160, -170, -180, -190, -200];
                    var value2 = arr2[Math.floor(Math.random() * arr2.length)];//x
                    var value3 = arr3[Math.floor(Math.random() * arr3.length)];//y
                    var value4 = arr4[Math.floor(Math.random() * arr4.length)];//wait
                    var value5 = $gameTroop.getX(user.index() + 1);
                    var value6 = $gameTroop.getY(user.index() + 1);
                    var value7 = arr7[Math.floor(Math.random() * arr7.length)];//jump
                    picture_motion1("smooth", [0]);
                    //$gameScreen.setDTextPicture(value1, 32);//元から
                    $gameScreen.showPicture(valueDropEnemyPicId, value1, 1, value5, value6, 100, 100, 255, 0);
                    //curveFunctions.patternY = curveFunctions.getPattern('jump', [value7]);
                    //curveFunctions.patternOpacity = curveFunctions.getPattern('jump', [200]);
                    $gameScreen.movePicture(valueDropEnemyPicId, 1, value5 + value2, value6 + value3, 100, 100, 0, 0, value4);
                    valueDropEnemyPicId += 1;
                } else {
                    if ($gameSwitches.value(607) || $gameSwitches.value(608)) {
                        $gameVariables.setValue(22, Number(arr1[i][1]));
                        $gameVariables.setValue(23, Number(arr1[i][2]));
                        item_getSkillLevel(valueFootpadSkillId, $gameVariables.value(22), $gameVariables.value(23));
                    } else {
                        if (Number(arr1[i][2]) >= 1) {
                            $gameParty.gainItem(valueItems[Number(arr1[i][2])], 1);
                            var value11 = `\x1bI[${valueItems[Number(arr1[i][2])].iconIndex}]\\C[2]${valueItems[Number(arr1[i][2])].name}\\C[0]を\\C[2]1\\C[0]個入手！\n`;
                            valueWordSet1 += `${value11}`;
                            $gameSystem.pushInfoLog(value11);
                            //CommonPopupManager.showInfo({},value11,null);
                        };
                    };
                };
            };
        };
    };

};

allAnimeattack_move1 = function () {

    if (!$gameSwitches.value(464)) {
        if ($gameVariables.value(182) == 11) {
            var value1 = 100;
        } else {
            var value1 = 350;
        };
        $gameTroop.move(1, value1, 0, 20);
        $gameTroop.move(2, value1, 0, 20);
        $gameTroop.move(3, value1, 0, 20);
        $gameTroop.move(4, value1, 0, 20);
        $gameTroop.move(5, value1, 0, 20);
        $gameTroop.move(6, value1, 0, 20);
        $gameTroop.move(7, value1, 0, 20);
        $gameTroop.move(8, value1, 0, 20);
    } else {
        if ($gameVariables.value(182) == 11) {
            var value1 = -350;
        } else {
            var value1 = -200;
        };
        $gameParty.move(1, value1, 0, 20);
        $gameParty.move(2, value1, 0, 20);
        $gameParty.move(3, value1, 0, 20);
        $gameParty.move(4, value1, 0, 20);
    };

};

allAnimeattack_move2 = function () {

    if (!$gameSwitches.value(464)) {
        if ($gameVariables.value(182) == 11) {
            var value1 = -100;
        } else {
            var value1 = -350;
        };
        $gameTroop.move(1, value1, 0, 20);
        $gameTroop.move(2, value1, 0, 20);
        $gameTroop.move(3, value1, 0, 20);
        $gameTroop.move(4, value1, 0, 20);
        $gameTroop.move(5, value1, 0, 20);
        $gameTroop.move(6, value1, 0, 20);
        $gameTroop.move(7, value1, 0, 20);
        $gameTroop.move(8, value1, 0, 20);
    } else {
        if ($gameVariables.value(182) == 11) {
            var value1 = 350;
        } else {
            var value1 = 200;
        };
        $gameParty.move(1, value1, 0, 20);
        $gameParty.move(2, value1, 0, 20);
        $gameParty.move(3, value1, 0, 20);
        $gameParty.move(4, value1, 0, 20);
    };

};

//ダメージ時に計算。（変更が多いため先頭に置く）value4はstateId。value2未使用
damage_keisan1 = function (user, target, action, value, value1, value2, value3, value99) {

    if ($gameSwitches.value(141)) {
        for (var i = 1; i <= $gameVariables.value(526); i++) {
            if (action && value > 0 && valueSkillDamageType == 1) {
                if (i == 1) {
                    if (target.result().critical) {
                        if (user.isActor()) {
                            $gameVariables.value(380 + user.actorId())[68] += 1;
                        };
                        if (target.hp <= 0 && valueCollapseAnime >= 1) { } else {
                            target.startAnimation(value1, true, 0);
                        };
                    };
                    if (target.hp != 0 && valueTotalDamageCount2 == 0) {
                        battle_stateAnime1(target);
                    };
                };
                if (i == 1) {
                    if (target.isActor()) {
                        if (value >= target.mhp / 2) {
                            state_addFormula1([41, 25, user, target, user.mdf, target.luk]);//負傷ステート
                        };
                    };
                    if (value >= target.mhp / 10) {
                        if (target.isActor()) {
                            var valueTarget = $gameParty;
                            var value13 = -24;
                        } else {
                            var valueTarget = $gameTroop;
                            var value13 = -100;
                        };
                        var value10 = 'wave_' + target.index();
                        var value11 = valueTarget.getX(target.index() + 1);
                        var value12 = valueTarget.getY(target.index() + 1) + value13;
                        var value14 = 50;
                        var value15 = 30;
                        var value16 = 0.05;
                        if (value >= target.mhp / 10 * 3) {
                            var value14 = 100;
                            var value15 = 40;
                        };
                        if (value >= target.mhp / 2) {
                            var value14 = 150;
                            var value15 = 50;
                        };
                        if (value >= target.mhp) {
                            var value14 = 200;
                            var value16 = 0.06;
                        };
                        $gameMap.createFilter(value10, 'shockwave', 0, 'screen');
                        $gameMap.setFilter(value10, [value11, value12, -1, value15, value14, 1]);
                        $gameMap.setFilterAddiTime(value10, value16);
                    };
                    var value7 = 50;
                    var value8 = 10;
                    var value9 = 4;
                    if (target.mhp / 100 >= value) {
                        var value3 = 130;
                        value7 -= 50;
                        value8 -= 5;
                        value9 -= 3;
                    };
                    if (target.mhp <= value) {
                        value3 += 1;
                        value7 += 25;
                        value8 += 5;
                        value9 += 2;
                    };
                    if ($gameVariables.value(526) >= 2) {
                        value8 += $gameVariables.value(526) * 3;
                    };
                    if ($gameVariables.value(331) == 0) {
                        var arr1 = [200, 0, 0, value7];
                    } else {
                        var arr1 = $gameVariables.value(331);
                        arr1[3] = value7;
                    };
                    $gameScreen.startFlash(arr1, value8);
                    $gameScreen.startShake(1, value9, value8);
                };
                if (value3 >= 1) {
                    if (i >= 2) {
                        var value5 = $dataAnimations[value3].frames.length;
                        var value10 = 4;
                        if ($dataAnimations[value3].name.match(/!/)) { var value10 = 1 };
                        if ($dataAnimations[value3].name.match(/&/)) { var value10 = 2 };
                        if ($dataAnimations[value3].name.match(/$/)) { var value10 = 3 };
                        var value6 = Math.ceil((value5 * 4 / 5) * value10 / 4) * (i - 1);
                    } else {
                        var value6 = 0;
                    };
                };
                /*:
                    if(valueBattleAddAttack >= 1){//<BattleAddAttackSet:50>未使用	
                      var value1 = Math.round(value * valueBattleAddAttack / 100);
                      target.gainHp(-value1);
                      target.startDamagePopup();
                    };
                */
                if (i >= 2) {
                    var value5 = Math.floor(Math.random() * 41) - 20;
                    var value5 = Math.round(value * value5 / 100);
                    target.gainHp(-value - value5);
                    target.startDamagePopup();
                };
                if (i == 2) {
                    //if(target.hp <= 0 && valueCollapseAnime >= 1){}else{
                    $gameScreen.startFlash(arr1, value8);
                    $gameScreen.startShake(value9, value9, value8);
                    //};
                };
                if (value3 >= 1) {
                    //if(target.hp <= 0 && valueCollapseAnime >= 1){}else{
                    target.startAnimation(value3, true, value6);
                    //};
                };
                target.addStateCounter(value99, value);
                valueTotalDamageCount += value;
                valueTotalDamageCount2 += 1;
            }
        }
    };

};

//スキルパワー加算計算skill_addPowerSet(user,$dataSkills,1,1);
skill_addPowerSet = function (user, valueItems, id1, id2) {

    valueAddPowerCustom = 0;
    if (user.isActor()) {
        var arr1 = valueAddPowerCustomSkill;
        if (arr1 != 0) {
            for (var i = 0; i <= arr1.length - 1; i++) {
                if (user.isLearnedSkill(arr1[i]) && user.battleSkillsRaw().includes(arr1[i])) {
                    valueAddPowerCustom += Number($dataSkills[arr1[i]].meta['AddPowerCustom']);
                    if ($dataSkills[arr1[i]].meta['Max Mastery Level']) {
                        valueAddPowerCustom += user.skillMasteryLevel(arr1[i]);
                    };
                };
            }
        };
        var arr1 = valueAddPowerCustomWeapon;
        if (arr1 != 0) {
            for (var i = 0; i <= arr1.length - 1; i++) {
                if (user.hasWeapon($dataWeapons[arr1[i]])) { valueAddPowerCustom += Number($dataWeapons[Number(arr1[i])].meta['AddPowerCustom']) };
            }
        };
        var arr1 = valueAddPowerCustomArmor;
        if (arr1 != 0) {
            for (var i = 0; i <= arr1.length - 1; i++) {
                if (user.hasArmor($dataArmors[arr1[i]])) { valueAddPowerCustom += Number($dataArmors[arr1[i]].meta['AddPowerCustom']) };
            }
        };
    };
    var arr1 = valueAddPowerCustomState;
    if (arr1 != 0) {
        for (var i = 0; i <= arr1.length - 1; i++) {
            if (user.isStateAffected(arr1[i])) { valueAddPowerCustom += Number($dataStates[arr1[i]].meta['AddPowerCustom']) };
        }
    };
    if (id2 == 2) { } else {
        if (valueItems[id1].stypeId == 12) {
            if (user.isActor()) {
                if (valueItems[id1].meta['ユニーク']) {
                    if ($gameVariables.value(287)[user.actorId()][10] >= 1) {
                        valueAddPowerCustom += $gameVariables.value(287)[user.actorId()][10];
                    };
                } else {
                    if ($dataWeapons[user.equips()[0].id].meta['LotteryRearity']) {
                        valueAddPowerCustom += Number($dataWeapons[user.equips()[0].id].meta['LotteryRearity']);
                    };
                };
            } else {
                valueAddPowerCustom += Math.round(user.level / 10);
            };
        };
    };
    /*:
    valueBattleAddAttack = 0;//<BattleAddAttackSet:50>未使用	
    var arr1 = valueBattleAddAttackSet;
    for (var i = 0; i <= arr1.length-1; i++) {
      if(user.isStateAffected(arr1[i])){
        valueBattleAddAttack += Number($dataStates[arr1[i]].meta['BattleAddAttackSet']);
      };
    };
    */

};

//攻撃時に連撃計算とスキルID代入
attack_keisan1 = function (user, id1, id2) {

    if (id2 == 2) {
        valueItems = $dataItems;
    } else {
        valueItems = $dataSkills;
    };
    valueSkillSpecialDispel35 = 0;
    valueTotalDamageCount2 = 0;
    valueDropEnemyPicId = 101;
    valueMetalKiller = 0;
    tachie_syoukyo1($gameVariables.value(300));
    if ($gameScreen.picture(50)) {
        var value1 = $gameScreen.picture(50).origin();
        var value2 = $gameScreen.picture(50).x();
        var value3 = $gameScreen.picture(50).y();
        var value4 = $gameScreen.picture(50).scaleX();
        var value5 = $gameScreen.picture(50).scaleY();
        var value6 = $gameScreen.picture(50).opacity();
        $gameScreen.movePicture(50, value1, value2, value3, value4, value5, 0, 0, 40);
    };
    pic_eraseP(0, [51, 52, 53, 54, 55, 56, 57, 58, 86, 87, 88, 89, 90, 91, 92, 93, 98, 99]);
    var value1 = 96;
    if ($gameScreen.picture(value1)) {
        $gameScreen.movePicture(value1, 0, 450, 480, 100, 100, 0, 0, 120);
    };
    skill_addPowerSet(user, valueItems, id1, id2);
    $gameVariables.setValue(182, valueItems[id1].stypeId);
    $gameSwitches.setValue(141, true);//スキルアイテムでの攻撃か否か。ダメージスクリプトでoff
    $gameVariables.setValue(279, 10);//ステート付与アニメのディレイを初期化
    $gameVariables.setValue(91, user);
    $gameVariables.setValue(96, id1);
    valueSkillDamageType = valueItems[id1].damage.type;
    valueAttackCount = 0;
    valueTotalDamageCount = 0;//その行動時のトータルダメージ変数
    $gameVariables.setValue(331, []);//ダメージフラッシュ指定配列
    valueMultiAttackCount = 1;
    var value3 = user.elementRate(11) * 10;
    var value1 = Math.floor(Math.random() * 101);
    var value2 = value1 + Math.floor(Math.random() * 101);
    if (value3 >= value1) { valueMultiAttackCount += 1 };
    if (value3 >= value2) { valueMultiAttackCount += 2 };
    if (valueMultiAttackCount <= 1) {
        var arr1 = valueCertainlyDouble;
        for (var i = 0; i <= arr1.length - 1; i++) {
            if (user.isStateAffected(arr1[i])) {
                valueMultiAttackCount += 1
                break;
            };
        };
    };
    if (valueMultiAttackCount <= 2) {
        var arr1 = valueCertainlyTriple;
        for (var i = 0; i <= arr1.length - 1; i++) {
            if (user.isStateAffected(arr1[i])) {
                valueMultiAttackCount += 2
                break;
            };
        };
    };
    $gameVariables.setValue(181, valueItems[id1].animationId);
    var value4 = $dataAnimations[valueItems[id1].animationId].frames.length;
    var value10 = 4;
    if ($dataAnimations[valueItems[id1].animationId].name.match(/!/)) { var value10 = 1 };
    if ($dataAnimations[valueItems[id1].animationId].name.match(/&/)) { var value10 = 2 };
    if ($dataAnimations[valueItems[id1].animationId].name.match(/$/)) { var value10 = 3 };
    if (valueItems[id1].stypeId == 12) {
        $gameVariables.setValue(97, value4);
    } else {
        $gameVariables.setValue(97, Math.ceil((value4 * 4 / 5) * value10 / 4));
    };
    $gameVariables.setValue(93, 131);
    $gameVariables.setValue(526, 1);

    //valueAttackStates = [];
    //valueAttackStates = valueAttackStates.concat(user.attackStates());
    valueAttackStates = user.attackStates();
    for (var i = 0; i <= 19; i++) {
        if (valueItems[id1].effects[i]) {
            if (valueItems[id1].effects[i].code == 21) {
                if (valueItems[id1].effects[i].dataId >= 2) {
                    valueAttackStates.push(valueItems[id1].effects[i].dataId);
                };
            };
        };
    };
    if (user.isStateAffected(410)) {
        if (valueItems[id1].meta['LevelFluctuation']) {
            valueLevelFluctuation = Number(valueItems[id1].meta['LevelFluctuation']);
        } else {
            valueLevelFluctuation = 0;
        };
    };
    valueAttackElements = [];
    if (valueItems[id1].meta['Multiple Elements']) {
        valueAttackElements = valueItems[id1].meta['Multiple Elements'].split(',');
    };
    if (valueItems[id1].damage.elementId >= 1) {
        valueAttackElements = valueAttackElements.concat(valueItems[id1].damage.elementId);
    };
    valueAttackElements = valueAttackElements.concat(user.attackElements());
    //武器種によるダメージ描写を変更させる。
    if (valueItems[id1].meta['Multiple Elements']) {
        var value1 = 0;
        var value2 = 0;
        var arr1 = valueItems[id1].meta['Multiple Elements'].split(',');
        if (valueItems[id1].damage.elementId >= 1) {
            arr1.push(valueItems[id1].damage.elementId);
        };
        var value1 = arr1[Math.floor(Math.random() * arr1.length)];
        if (value1 >= 1) {
            if (value1 == 1) { $gameVariables.setValue(93, 131); $gameVariables.setValue(331, [255, 255, 255, 0]) };//[255,0,0]
            if (value1 == 2) { $gameVariables.setValue(93, 133); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 3) { $gameVariables.setValue(93, 135); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 4) { $gameVariables.setValue(93, 137); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 5) { $gameVariables.setValue(93, 139); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 6) { $gameVariables.setValue(93, 141); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 7) { $gameVariables.setValue(93, 143); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 8) { $gameVariables.setValue(93, 145); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 9) { $gameVariables.setValue(93, 147); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 10) { $gameVariables.setValue(93, 367); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 15) { $gameVariables.setValue(93, 369); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 16) { $gameVariables.setValue(93, 147); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 17) { $gameVariables.setValue(93, 149); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 21) { $gameVariables.setValue(93, 371); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 22) { $gameVariables.setValue(93, 373); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 23) { $gameVariables.setValue(93, 375); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 24) { $gameVariables.setValue(93, 377); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 25) { $gameVariables.setValue(93, 379); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 26) { $gameVariables.setValue(93, 381); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 27) { $gameVariables.setValue(93, 383); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 28) { $gameVariables.setValue(93, 385); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 29) { $gameVariables.setValue(93, 387); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 30) { $gameVariables.setValue(93, 389); $gameVariables.setValue(331, [255, 255, 255, 0]) };
            if (value1 == 34) { $gameVariables.setValue(93, 130); $gameVariables.setValue(331, [255, 255, 255, 0]) };
        };
    };

    var arr2 = [0];//所持７属性の中で威力50%以上で最も高いものでフラッシュ
    var arr1 = valueAttackElements;
    for (var i = 0; i <= arr1.length - 1; i++) {
        if (i == 35) { valueSkillSpecialDispel35 += 1 };
        if ([3, 4, 5, 6, 7, 8, 9].some(function (id) { return Number(arr1[i]) == id })) {
            if (user.elementAmplifyRate(Number(arr1[i])) >= 0.5) {
                arr2.push(arr1[i]);
            }
        }
    };
    if (arr2 == 0) { } else {
        var value1 = Math.max(...arr2);
        if (value1 == 3) { $gameVariables.setValue(331, [255, 102, 119, 0]) };
        if (value1 == 4) { $gameVariables.setValue(331, [119, 255, 119, 0]) };
        if (value1 == 5) { $gameVariables.setValue(331, [255, 187, 119, 0]) };
        if (value1 == 6) { $gameVariables.setValue(331, [85, 153, 255, 0]) };
        if (value1 == 7) { $gameVariables.setValue(331, [255, 255, 119, 0]) };
        if (value1 == 8) { $gameVariables.setValue(331, [68, 0, 68, 0]) };
        if (value1 == 9) { $gameVariables.setValue(331, [255, 255, 255, 0]) };
    };

    if (valueItems[id1].meta['moveReaction']) {
        $gameVariables.setValue(349, Number(valueItems[id1].meta['moveReaction']))
    } else {
        $gameVariables.setValue(349, 0);
    };
    if (valueItems[id1].meta['ProjectileSkill']) {
        $gameSwitches.setValue(462, false);
    } else {
        $gameSwitches.setValue(462, true);
    };
    if (user.isEnemy()) {
        if (!$dataEnemies[user.enemyId()].meta[`Sideview Battler`]) {
            $gameSwitches.setValue(462, false);
        }
    };

    if (user.isActor() && $gameVariables.value(182) == 2) {
        if (user.subclass() && user.equips()[0]) {
            var value1 = Number($dataClasses[user.subclass().id].meta['Icon']);
            var value2 = Number($dataWeapons[user.equips()[0].id].wtypeId);
            var value3 = 0;
            if (value1 == 97 && value2 == 1 || value2 == 7) { var value3 = 1 };
            if (value1 == 107 && value2 == 1 || value2 == 6) { var value3 = 1 };
            if (value1 == 108 && value2 == 4 || value2 == 6) { var value3 = 1 };
            if (value1 == 101 && value2 == 4 || value2 == 5) { var value3 = 1 };
            if (value1 == 115 && value2 == 2 || value2 == 8) { var value3 = 1 };
            if (value1 == 96 && value2 == 1 || value2 == 2) { var value3 = 1 };
            if (value1 == 106 && value2 == 5 || value2 == 7) { var value3 = 1 };
            if (value1 == 120 && value2 == 3 || value2 == 9) { var value3 = 1 };
            if (value1 == 102 && value2 == 8 || value2 == 9) { var value3 = 1 };
            if (value1 == 199 && value2 == 2 || value2 == 10) { var value3 = 1 };
            if (value1 == 43 && value2 == 7 || value2 == 7) { var value3 = 2 };
            if (value3 >= 1) {
                var value4 = Number($dataClasses[user.subclass().id].meta['classRank']);
                user.gainSkillMasteryUses(id1, value3 * value4);
            }
        }
    };
    if ($gameParty.members().contains($gameActors.actor(1)) && $gameActors.actor(1).isStateAffected(662)) {//リーシャのブレイブコマンド
        if ($gameVariables.value(182) == 5 && $gameActors.actor(1)._stateCounter[662][0] >= 0) {
            if ($gameActors.actor(1)._stateCounter[662][0] <= 4) {
                $gameActors.actor(1)._stateCounter[662][0] += 1;
            };
        };
        if ($gameVariables.value(182) == 6 && $gameActors.actor(1)._stateCounter[662][1] >= 0) {
            if ($gameActors.actor(1)._stateCounter[662][1] <= 4) {
                $gameActors.actor(1)._stateCounter[662][1] += 1;
            };
        };
        if ($gameVariables.value(182) == 7 && $gameActors.actor(1)._stateCounter[662][2] >= 0) {
            if ($gameActors.actor(1)._stateCounter[662][2] <= 4) {
                $gameActors.actor(1)._stateCounter[662][2] += 1;
            };
        };
        if ($gameVariables.value(182) == 8 && $gameActors.actor(1)._stateCounter[662][3] >= 0) {
            if ($gameActors.actor(1)._stateCounter[662][3] <= 4) {
                $gameActors.actor(1)._stateCounter[662][3] += 1;
            };
        };
    };
    if ($gameVariables.value(182) == 12) {
        $gameVariables.setValue(93, 367);
    };
    if ($gameVariables.value(182) == 13) {
        $gameVariables.setValue(93, 369);
    };
    if ($gameVariables.value(182) == 13) {
        $gameVariables.setValue(527, `\\C[18]＜${valueItems[id1].name}＞\\C[0]`);
    };
    if ($gameVariables.value(182) == 11) {
        $gameVariables.setValue(527, `\\C[10]＜${valueItems[id1].name}＞\\C[0]`);
    };
    if ($gameVariables.value(182) == 5) {
        $gameVariables.setValue(527, `\\C[17]＜${valueItems[id1].name}＞\\C[0]`);
        $gameVariables.setValue(93, 0);
    };
    if ($gameVariables.value(182) == 6) {
        $gameVariables.setValue(527, `\\C[10]＜${valueItems[id1].name}＞\\C[0]`);
    };
    if ($gameVariables.value(182) == 7) {
        $gameVariables.setValue(527, `\\C[9]＜${valueItems[id1].name}＞\\C[0]`);
        $gameVariables.setValue(93, 0);
    };
    if ($gameVariables.value(182) == 8) {
        $gameVariables.setValue(527, `\\C[3]＜${valueItems[id1].name}＞\\C[0]`);
        if (valueItems[id1].damage.type == 2) {
            $gameVariables.setValue(93, 249);//MP回復の場合
        } else {
            $gameVariables.setValue(93, 245);
        };
    };
    if (valueItems[id1].meta['SkillDamageAction']) {
        $gameVariables.setValue(93, Number(valueItems[id1].meta['SkillDamageAction']));
    };
    if (valueItems[id1].meta['Instant']) {
        $gameSwitches.setValue(91, true);
    } else {
        $gameSwitches.setValue(91, false);
    };
    if (valueItems[id1].meta['Repeat']) {
        $gameVariables.setValue(526, Number(valueItems[id1].meta['Repeat']));
    };
    if ($gameVariables.value(182) == 2) {
        var arr1 = valueNormalAttackHit;
        for (var i = 0; i <= arr1.length - 1; i++) {
            if (user.isStateAffected(arr1[i])) {
                $gameVariables.setValue(526, $gameVariables.value(526) + Number($dataStates[arr1[i]].meta['NormalAttackHit']));
            };
        };
    };
    if ($gameVariables.value(182) == 2 || $gameVariables.value(182) == 6) {
        var arr1 = valueAttackAbilityHit;
        for (var i = 0; i <= arr1.length - 1; i++) {
            if (user.isStateAffected(arr1[i])) {
                $gameVariables.setValue(526, $gameVariables.value(526) + Number($dataStates[arr1[i]].meta['AttackAbilityHit']));
            };
        };
    };
    /*:
    if([2,4,5,6].some(function(id){return valueItems[id1].scope == (id)})){
      $gameSwitches.setValue(463,true);
    };
    if($gameVariables.value(182) == 2 && user.isStateAffected(282)){//全体化
      $gameSwitches.setValue(463,true);
    };
    if($gameVariables.value(182) == 2 && user.isStateAffected(283)){//ランダム化
      $gameSwitches.setValue(463,true);
    };
    */
};

//属性耐性ダウン付与
Element_DebuffRateA = function (target, value100) {

    if (target._stateCounter[value100] >= 0.001) { } else {
        target.setStateCounter(value100, 0);
    };
    var value1 = 11;
    var value2 = Number($dataStates[value100].meta['ElementId']);
    var value3 = Number($dataStates[value100].meta['DebuffRate']);
    if (target.isEnemy()) {
        var target1 = $dataStates[490 + target.index()];
    } else {
        var target1 = $dataStates[486 + target.index()];
    };
    target1.traits.push({ code: value1, dataId: value2, value: 1 + (value3 / 100) });
    target.addStateCounter(value100, +(value3 / 100));

};

//属性耐性ダウン解除
Element_DebuffRateR = function (target, value100) {

    if (target._stateCounter[value100] >= 1) {
        var value1 = 11;
        var value2 = Number($dataStates[value100].meta['ElementId']);
        if (target.isEnemy()) {
            var target1 = $dataStates[490 + target.index()];
        } else {
            var target1 = $dataStates[486 + target.index()];
        };
        target1.traits.push({ code: value1, dataId: value2, value: 1 - target.getStateCounter[value100] });
        target.removeStateCounter(value100);
    };

};

//ステート付与時のアクション
state_addEffect1 = function (user, target, value100, id1) {

    if (!$gameTroop.isAllDead() && $gameParty.inBattle()) {
        if (target.isStateAffected(289)) {
            var value10 = 0.2;
        } else {
            var value10 = 0.1;
        };
        if ($dataStates[value100].meta['registUp']) {
            var value10 = Math.ceil(Number($dataStates[value100].meta['registUp']) / 100);
        };
        if (target.isEnemy()) {
            var target1 = $dataStates[490 + target.index()];
        } else {
            var target1 = $dataStates[486 + target.index()];
        };
        var arr1 = [255, 128, 0, 255, 256];
        if ($dataStates[value100].meta['Category']) {
            if ($dataStates[value100].meta['Category'] == ' StateabNomal' || $dataStates[value100].meta['Category'] == ' StateSPabNomal') {//耐性付与。強化は除外
                target1.traits.push({ code: 13, dataId: value100, value: 1 - value10 });
                var arr1 = [255, 0, 187, 189, 256];
            };
        } else {
            target1.traits.push({ code: 13, dataId: value100, value: 1 - value10 });
        };
        var arr2 = valueStateAddState; //<stateAddState:5,201,2>//反応するｽｷﾙﾀｲﾌﾟ,追加ｽﾃｰﾄ,追加回数
        for (var j = 0; j <= arr2.length - 1; j++) {
            if (target.isStateAffected(arr2[j])) {
                if (Number($dataStates[arr2[j]].meta['stateAddState'].split(',')[0]) == $gameVariables.value(182)) {
                    for (var id1 = 1; id1 <= Number($dataStates[arr2[j]].meta['stateAddState'].split(',')[2]); id1++) {
                        target.addState(Number($dataStates[arr2[j]].meta['stateAddState'].split(',')[1]));
                    };
                };
            };
        };
        if (ConfigManager.battleAniSpeed >= 3) {
            target.startAnimation(id1, false, $gameVariables.value(279));
            $gameVariables.setValue(279, $gameVariables.value(279) + $gameVariables.value(280));
            //target.startMessagePopup(`\x1bI[${$dataStates[value100].iconIndex}]`, arr1);
            target.startMessagePopup($dataStates[value100].name, arr1);
        };
    };

};

//ステート解除時のアクション
state_removeEffect1 = function (user, target, value100, id1) {

    user.removeStateCounter(value100);
    if (!$gameTroop.isAllDead() && $gameParty.inBattle()) {
        if (ConfigManager.battleAniSpeed >= 3) {
            var value1 = 0;
            var value2 = ` `;
            if ($dataStates[value100].meta['Category']) {
                if ($dataStates[value100].meta['Category'] == ' PowerUp') {
                    var value1 = 2;
                } else {
                    var value1 = 1;
                    var value2 = `…`;
                };
            }
            target.startAnimation(id1, false, $gameVariables.value(279));
            $gameVariables.setValue(279, $gameVariables.value(279) + $gameVariables.value(280));
            BattleManager._logWindow.push(`addText`, `${target.name()}の\\C[${value1}]${$dataStates[value100].name}\\C[0]が解除された${value2}`);
        }
    };

};

//特殊効果ステート発動時のアクション
activate_spcialState = function (user, id1) {

    if ($dataStates[id1].meta['activateRate']) {
        if (user.isLearnedSkill(746) && user.skillMasteryLevel(746) >= 1) {
            var value1 = Number($dataStates[id1].meta['activateRate']) - ((Number($dataStates[id1].meta['activateRate']) * user.skillMasteryLevel(746) / 10));
        } else {
            var value1 = Number($dataStates[id1].meta['activateRate']);
        };
        if (user.battleSkillsRaw().includes(747)) {
            var value1 = value1 - (value1 * 2 / 10);
        };
        if (user.battleSkillsRaw().includes(748)) {
            var value1 = value1 - (value1 * 49 / 100);
        };
        if (user.mpRate() >= value1) {
            user.startAnimation(615, true, 0)
            var dmg = Math.ceil(user.mmp * value1);
            user.gainMp(-dmg);
            user.startDamagePopup();
            user.clearResult();
        } else {
            var value2 = `${user.name()}はMPが足らず\\SIM[109]になった…`;
            BattleManager._logWindow.push(`addText`, value2);
            user.startAnimation(275, true, 0);
            user.addState(109);
        };
    };
    if ($dataStates[id1].meta['activatePoint']) {
        if (user.isLearnedSkill(746) && user.skillMasteryLevel(746) >= 1) {
            var value1 = Number($dataStates[id1].meta['activatePoint']) - (Number($dataStates[id1].meta['activatePoint']) * user.skillMasteryLevel(746) / 10);
        } else {
            var value1 = Number($dataStates[id1].meta['activatePoint']);
        };
        if (user.battleSkillsRaw().includes(747)) {
            var value1 = value1 - (value1 * 2 / 10);
        };
        if (user.battleSkillsRaw().includes(748)) {
            var value1 = value1 - (value1 * 49 / 100);
        };
        if (user.mp >= value1) {
            user.startAnimation(615, true, 0)
            var dmg = Math.ceil(value1);
            user.gainMp(-dmg);
            user.startDamagePopup();
            user.clearResult();
        } else {
            var value2 = `${user.name()}はMPが足らず\\SIM[19]になった…`;
            BattleManager._logWindow.push(`addText`, value2);
            user.startAnimation(275, true, 0);
            user.addState(109);
        };
    };

};

//チェインスキル実行267valueChainTotalStat,268valueChainMemberCount,30valueChainElement,29valueChainSkillId
chain_skill = function () {

    for (var i = 0; i < $gameParty.battleMembers().length; i++) {
        if ($gameParty.battleMembers()[i].isStateAffected(234) && !$gameParty.battleMembers()[i].isRestricted()) {
            valueChainMemberCount += 1;
            valueChainTotalStat += $gameParty.members()[i].atk;
            valueChainTotalStat += $gameParty.members()[i].mat;
        };
    };
    if (valueChainMemberCount >= 2) {
        for (var i = 0; i < $gameParty.battleMembers().length; i++) {
            var actor = $gameParty.battleMembers()[i];
            if (actor.isStateAffected(234)) {
                $gameVariables.setValue(20, actor.actorId());
                break;
            }
        };
        for (var i = 49; i < 57; i++) {
            var actor = $gameActors.actor($gameVariables.value(20));
            if (actor.isStateAffected(i)) {
                valueChainElement = i;
                break;
            }
        };
        if (valueChainElement == 0) {
            valueChainSkillId = 98;
        } else {
            valueChainSkillId = Number($dataStates[valueChainElement].meta['ChainID']);
        };
        if ($dataSkills[valueChainSkillId].meta['2rdChain'] || $dataSkills[valueChainSkillId].meta['3rdChain'] || $dataSkills[valueChainSkillId].meta['4thChain']) {
            if (valueChainMemberCount == 2) {
                $dataSkills[valueChainSkillId].name = $dataSkills[valueChainSkillId].meta['2rdChain'];
            };
            if (valueChainMemberCount == 3) {
                $dataSkills[valueChainSkillId].name = $dataSkills[valueChainSkillId].meta['3rdChain'];
            };
            if (valueChainMemberCount >= 4) {
                $dataSkills[valueChainSkillId].name = $dataSkills[valueChainSkillId].meta['4thChain'];
            };
        };
        $gameVariables.setValue(267, value1 + value2);
    };

};

//攻撃防御時バストアップ表示$gameVariables.setValue(20,1); $gameVariables.setValue(520, [1,7]); 520→valueFaceSelect = 1;
battle_bustUp = function (id1, id2, id3, id4) {

    if ($gameActors.actor($gameVariables.value(20)).isStateAffected(602)) {
        var value7 = 100;
        var value8 = 0;
        if ($gameSwitches.value(471)) {
            picture_motion1("linear", [0]);
            var value7 = 100;
            var value8 = 0;
        } else {
            picture_motion1("smooth", [0]);
            var value7 = 100;
            var value8 = 0;
            if ($gameVariables.value(276) == 2) {
                curveFunctions.patternScaleX = curveFunctions.getPattern('wave', [20, 0.5]);
                curveFunctions.patternScaleY = curveFunctions.getPattern('wave', [20, 0.5]);
                curveFunctions.patternX = curveFunctions.getPattern('jump', [-100]);
                curveFunctions.patternY = curveFunctions.getPattern('jump', [-10]);
                var value7 = 100;
                var value8 = 50;
            };
            if ($gameVariables.value(276) == 1) {
                curveFunctions.patternScaleX = curveFunctions.getPattern('damped', [5, -0.3, 5, 0, 1]);
                curveFunctions.patternScaleY = curveFunctions.getPattern('damped', [5, -0.3, 5, 0, 1]);
                curveFunctions.patternX = curveFunctions.getPattern('jump', [100]);
                var value7 = 100;
                var value8 = 0;
            };
        };
        var value1 = $gameVariables.value(20) + 'Actor_' + valueFaceSelect;
        if ($gameVariables.value(276) == 2) { var value2 = 800 };
        if ($gameVariables.value(276) == 1) { var value2 = 300 };
        if ($gameSwitches.value(436)) { var value2 = $gameMessage._IZSTPicMoveParam[0] - 640 };
        if ($gameSwitches.value(471)) { var value2 = 300 };
        var value4 = id2;
        var value5 = id3;
        var value6 = id4;
        for (var i = 0; i <= 7; i++) {
            var value10 = 1;
            if (i == 0) {
                if (valueLiningCloth[$gameVariables.value(20)] >= 1) {
                    var value1 = $gameVariables.value(20) + 'Actor' + "Lining" + valueLiningCloth[$gameVariables.value(20)];
                } else {
                    var value10 = 0;
                };
            };
            if (i == 1) {
                if (valueBackHairCloth[$gameVariables.value(20)] >= 1) {
                    var value1 = $gameVariables.value(20) + 'Actor' + "BackHair" + valueBackHairCloth[$gameVariables.value(20)];
                } else {
                    var value10 = 0;
                };
            };
            if (i == 2) {
                if (valueBustUpCloth[$gameVariables.value(20)] >= 0) {
                    var value1 = $gameVariables.value(20) + 'Actor' + "Cloth" + valueBustUpCloth[$gameVariables.value(20)];
                } else {
                    var value10 = 0;
                };
            };
            if (i == 3) {
                if (valueBustUpCloth2[$gameVariables.value(20)] >= 0) {
                    var value1 = $gameVariables.value(20) + 'Actor' + "BustUp" + valueBustUpCloth2[$gameVariables.value(20)];
                } else {
                    var value10 = 0;
                };
            };
            if (i == 4) {
                if (valueCoatCloth[$gameVariables.value(20)] >= 1) {
                    var value1 = $gameVariables.value(20) + 'Actor' + "Coat" + valueCoatCloth[$gameVariables.value(20)];
                } else {
                    var value10 = 0;
                };
            };
            if (i == 5) { var value1 = $gameVariables.value(20) + 'Actor_' + valueFaceSelect };
            if (i == 6) {
                var actor = $gameActors.actor($gameVariables.value(20));
                if (actor.isStateAffected(781) || actor.isStateAffected(783)) {
                    if (actor.isStateAffected(781)) { var value1 = $gameVariables.value(20) + 'Actor' + "CloudyEye1" };
                    if (actor.isStateAffected(783)) { var value1 = $gameVariables.value(20) + 'Actor' + "CloudyEye2" };
                    if (actor.isStateAffected(785)) { var value1 = $gameVariables.value(20) + 'Actor' + "CloudyEye4" };
                } else {
                    var value10 = 0;
                };
            };
            if (i == 7) {
                var actor = $gameActors.actor($gameVariables.value(20));
                if (actor.isStateAffected(784)) {
                    var value1 = $gameVariables.value(20) + 'Actor' + "CloudyEye3";
                } else {
                    if (valueFrontHairCloth[$gameVariables.value(20)] >= 0) {
                        var value1 = $gameVariables.value(20) + 'Actor' + "FrontHair" + valueFrontHairCloth[$gameVariables.value(20)];
                    } else {
                        var value10 = 0;
                    };
                };
            };
            if (value10 == 1) {
                $gameScreen.showPicture(id1 + i, "/img/talkface/" + value1, 1, 640 + value2, 384 + value8 + value5, value7, value7, 0, 0);
                if (!$gameSwitches.value(471)) {
                    $gameScreen.movePicture(id1 + i, 1, 640 + value4, 384 + value5, 100, 100, 255, 0, value6 + 10);
                };
                if (i == 3) {
                    if ($gameParty.inBattle()) {
                        hcg_piston(id1 + i, 10, 2, 4);
                    } else {
                        hcg_piston(id1 + i, 10, 1, 4);
                    };
                } else {
                    tachie_bless(id1 + i, 3);
                };
            };
        };
        if (!$gameSwitches.value(471)) {
            if ($gameActors.actor($gameVariables.value(20)).isStateAffected(782)) {
                if ($gameScreen.picture(99)) {
                    valueHypnosisCount = $gameActors.actor($gameVariables.value(20)).getStateCounter(782);//60,40,20
                    var value1 = $gameVariables.value(20) + 'Actor' + "HypnosisEye_0";
                    $gameScreen.setPicturesAnimation(2, 10, "連番", valueHypnosisCount);
                    $gameScreen.showPicture(99, "/img/talkface/" + value1, 1, 640 + value2, 384 + value8 + value5, value7, value7, 0, 0);
                    $gameScreen.movePicture(99, 1, 640 + value4, 384 + value5, 100, 100, 255, 0, value6 + 10);
                    $gameScreen.picture(99).startAnimationFrame(3, true, [1, 1, 1, 2]);
                };
            };
        };
        if ($gameVariables.value(276) >= 1) {
            picture_motion1("smooth", [0]);
        };
    };

};

//オーラ表現
tachie_aura = function () {

    if ($gameParty.inBattle() && $gameActors.actor($gameVariables.value(20)).tp >= 100 && $gameActors.actor($gameVariables.value(20)).isStateAffected(602)) {
        var value1 = Number($dataActors[$gameVariables.value(20)].meta['tachiePicId']);
        if ($gameScreen.picture(value1)) {
            var value2 = $gameVariables.value(105);
            var value3 = $gameVariables.value(106);
            var value4 = $gameVariables.value(107);
            var value5 = $gameVariables.value(108);
            //var value2 = $gameScreen.picture(value1)._x;
            //var value3 = $gameScreen.picture(value1)._y;
            //var value4 = $gameScreen.picture(value1)._scaleX;
            //var value5 = $gameScreen.picture(value1)._scaleY;
            var value6 = value1 - 20;
            var value7 = 0;

            //if($gameVariables.value(276) == 2){
            //var value7 = -50;
            //} else {
            //if($gameVariables.value(276) == 1){
            //var value7 = +200;
            //} else {
            //var value7 = 0;
            //}};

            if ($gameVariables.value(276) >= 1) {
                $gameScreen.showPicture(45, "/img/tachies/" + 'actor' + value6 + '_45_1', 1, value2 + value7, value3, value4, value5, 255, 1);
            } else {
                $gameScreen.showPicture(45, "/img/tachies/" + 'actor' + value6 + '_45_1', 1, value2 + value7, value3, 0, 0, 0, 1);
                $gameScreen.movePicture(45, 1, value2 + value7, value3, value4, value5, 255, 1, 60);
            };

        }
    };

};

//パーティメンバーが居る時に拘束解除。
actor_kousokukaijo1 = function (id) {

    for (var i = 0; i < $gameParty.battleMembers().length; i++) {
        var actor = $gameParty.battleMembers()[i];
        var value1 = $gameParty.battleMembers()[i].actorId();
        if (value1 == id || actor.isStateAffected(61) || actor.isStateAffected(63) || actor.isStateAffected(64) || actor.battleSkillsRaw().contains(80)) { } else {
            $gameActors.actor(value1).addState(89);
            var value2 = i + 1;
            if ($dataSystem.optSideView) {
                $gameVariables.setValue(705, [$gameParty.getX(value2), $gameParty.getY(value2)]);
                $gameParty.set(value2, $gameVariables.value(704)[0] + 50, $gameVariables.value(704)[1], 20);
            };
            break;
        }
    };

};

//パーティメンバーが居る時に拘束解除。
actor_kousokukaijo2 = function (id) {

    for (var i = 0; i < $gameParty.battleMembers().length; i++) {
        var actor = $gameParty.battleMembers()[i];
        if (actor.isStateAffected(89)) {
            var value1 = actor.index();
            $gameParty.members()[value1].startAnimation(351, false, 0);
            var array = $dataActors[$gameParty.battleMembers()[i].actorId()].meta['BindRemove'].split(',');
            $gameVariables.setValue(525, array[Math.floor(Math.random() * array.length)]);
            var value2 = actor.name() + 'は' + $gameActors.actor(id).name() + 'の拘束を解きに掛かった！';
            BattleManager._logWindow.push(`addText`, value2);
            $gameActors.actor(id).removeState(63);
        }
    };

};

//パーティメンバーが居る時に拘束解除時の反応。
actor_kousokukaijo3 = function (id) {

    for (var i = 0; i < $gameParty.battleMembers().length; i++) {
        var actor = $gameParty.battleMembers()[i];
        if (actor.isStateAffected(89)) {
            actor.removeState(89);
            if ($dataSystem.optSideView) {
                var value1 = $gameVariables.value(92) + 1;
                $gameTroop.set(value1, $gameVariables.value(703)[0], $gameVariables.value(703)[1], 30);
                var value2 = i + 1;
                $gameParty.set(value2, $gameVariables.value(705)[0], $gameVariables.value(705)[1], 30);
            };
            var value1 = Number($dataActors[id].meta['BindRemoveSuccessFace'].split(',')[0]);
            var value2 = Number($dataActors[id].meta['BindRemoveSuccessFace'].split(',')[1]);
            var array = $dataActors[id].meta['BindRemoveSuccess'].split(',');
            $gameVariables.setValue(525, array[Math.floor(Math.random() * array.length)]);
            var value3 = $gameActors.actor(id).name() + 'は拘束から助け出された！';
            BattleManager._logWindow.push(`addText`, value3);
            $gameActors.actor(id).removeState(69);
            $gameMessage.newPage();
            $gameMessage.setFaceImage(id + 'Actor' + value1, value2);
            $gameMessage.add(`\\V[525]`);
            $gameVariables.setValue(703, 0);
        }
    };

};

//アビリティ後にＣＧ消去
skill_after1 = function (user, id1) {

    if (valueAttackCount == 0) {
        pic_eraseP(0, [51, 52, 53, 54, 55, 56, 57, 86, 87, 88, 89, 90, 91, 92, 93, 98, 99]);
        if ($gameSwitches.value(91)) {
            if ($gameScreen.picture(50)) {
                var value1 = $gameScreen.picture(50).origin();
                var value2 = $gameScreen.picture(50).x();
                var value3 = $gameScreen.picture(50).y();
                var value4 = $gameScreen.picture(50).scaleX();
                var value5 = $gameScreen.picture(50).scaleY();
                var value6 = $gameScreen.picture(50).opacity();
                $gameScreen.movePicture(50, value1, value2, value3, value4, value5, 250, 0, 60);
            };
        };
        valueAttackCount = 1;
    };

};

//オーバーキル時のカウント
overkill_count = function () {

    $gameVariables.value(380 + $gameVariables.value(20))[67] += 1;

};

//戦闘時に各種特別能力値表示。縦に18
battle_xsarStatas = function (id1) {

    if (id1 == 20) {
        var user = $gameActors.actor($gameVariables.value(20));
    } else {
        var user = $gameTroop.members()[id1];
    };

    var value1 = `\\C[2]詳細能力値[1]\\C[0]\n`;
    value1 += `\\C[16]\\I[636]連撃率　  　:\\C[0]${Math.floor(user.elementRate(11) * 10)}%\n`;
    value1 += `\\C[16]\\I[637]回復率　　  :\\C[0]${Math.floor(user.elementRate(12) * 100)}%\n`;
    value1 += `\\C[16]\\I[630]命中率　　　:\\C[0]${Math.floor(user.xparam(0) * 100)}%\n`;
    value1 += `\\C[16]\\I[632]回避率　　　:\\C[0]${Math.floor(user.xparam(1) * 100)}%\n`;
    value1 += `\\C[16]\\I[631]会心率　　　:\\C[0]${Math.floor(user.xparam(2) * 100)}%\n`;
    //value1 += `会心回避率:${user.xparam(3)*100}%\n`;
    //value1 += `魔法回避率:${user.xparam(4)*100}%\n`;
    //value1 += `魔法反射率:${user.xparam(5)*100}%\n`;
    //value1 += `反撃率:${user.xparam(6)*100}%\n`;
    value1 += `\\C[16]\\I[640]HP再生率　　:\\C[0]${Math.floor(user.xparam(7) * 100)}%\n`;
    value1 += `\\C[16]\\I[641]MP再生率　　:\\C[0]${Math.floor(user.xparam(8) * 100)}%\n`;
    value1 += `\\C[16]\\I[642]TP再生率　　:\\C[0]${Math.floor(user.xparam(9) * 100)}%\n`;
    value1 += `\\C[16]\\I[633]狙われ率　　:\\C[0]${Math.floor(user.sparam(0) * 100)}%\n`;
    //value1 += `防御効果率:${user.sparam(1)*100}%\n`;
    //value1 += `回復効果率:${user.sparam(2)*100}%\n`;
    //value1 += `薬の効果:${user.sparam(3)*100}%\n`;
    value1 += `\\C[16]\\I[634]MP消費率　　:\\C[0]${Math.floor(user.sparam(4) * 100)}%\n`;
    value1 += `\\C[16]\\I[635]TPﾁｬｰｼﾞ率　 :\\C[0]${Math.floor(user.sparam(5) * 100)}%\n`;
    value1 += `\\C[16]\\I[638]物理ﾀﾞﾒｶｯﾄ率:\\C[0]${Math.floor(user.sparam(6) * 100)}%\n`;
    value1 += `\\C[16]\\I[639]魔法ﾀﾞﾒｶｯﾄ率:\\C[0]${Math.floor(user.sparam(7) * 100)}%\n`;
    //value1 += `床ダメージ率:${user.sparam(8)*100}%\n`;
    value1 += `\\C[16]\\I[656]経験獲得率　:\\C[0]${Math.floor(user.sparam(9) * 100)}%\n`;
    value1 += `\\C[16]\\I[624]ﾎﾟｰｼｮﾝ耐性率:\\C[0]${$gameVariables.value(380 + $gameVariables.value(20))[58]}%\n`;
    var value5 = '???';
    var value6 = '???';
    var value5 = Math.floor(user.stateRate(15) * 100);
    var value6 = Math.floor(user.stateRate(30) * 100);
    value1 += `\\C[16]\\I[683]通常異常耐性:\\C[0]${value5}%\n`;
    value1 += `\\C[16]\\I[684]特殊異常耐性:\\C[0]${value6}%\n`;

    var value2 = `\\C[2]詳細能力値[2]\\C[0]\n`;
    for (var i = 1; i <= 9; i++) {
        amygame_elementIcon(i);
        if (id1 >= 20) {
            var value5 = Math.floor(user.elementAmplifyRate(i) * 100) + valueAttackAmplifysActorId[$gameVariables.value(20)][i];
        } else {
            var value5 = Math.floor(user.elementAmplifyRate(i) * 100);
        };
        if (i == 1 || i == 2) {
            var value6 = `威力率　`;
        } else {
            var value6 = `属性威力率`;
        };
        value2 += `\\C[16]\x1bI[${valueElementIconArr[1]}]${$dataSystem.elements[i]}${value6}:\\C[0]${value5}%\n`;
    };
    for (var i = 1; i <= 9; i++) {
        amygame_elementIcon(i);
        if (i == 1 || i == 2) {
            var value6 = `耐性率　`;
        } else {
            var value6 = `属性耐性率`;
        };
        value2 += `\\C[16]\x1bI[${valueElementIconArr[1]}]${$dataSystem.elements[i]}${value6}:\\C[0]${Math.floor(user.elementRate(i) * 100)}%\n`;
    };

    var value3 = `\\C[2]詳細能力値[3]\\C[0]\n`;
    if (id1 >= 20) {
        skill_addPowerSet(user, $dataSkills, 1, 1);
        if (valueAddPowerCustom >= 1) {
            value3 += `\\C[16]\\I[666]スキル威力率:\\C[0]+${valueAddPowerCustom}\n`;
        };
        value3 += `\\C[16]\\I[31]奥義威力率　:\\C[0]${Math.floor(user.elementAmplifyRate(10) * 100) + valueAttackAmplifysActorId[$gameVariables.value(20)][10]}%\n`;
        value3 += `\\C[16]\\I[673]ｱﾋﾞﾘﾃｨ威力率:\\C[0]${Math.floor(user.elementAmplifyRate(20) * 100) + valueAttackAmplifysActorId[$gameVariables.value(20)][20]}%\n`;
        value3 += `\\C[16]\\I[78]会心威力率　:\\C[0]${Math.floor(user.criticalMultiplierBonus() * 100)}%\n`;
        value3 += `\\C[16]\\I[480]剣威力率　　:\\C[0]${Math.floor(user.elementAmplifyRate(21) * 100) + valueAttackAmplifysActorId[$gameVariables.value(20)][21]}%\n`;
        value3 += `\\C[16]\\I[481]短剣威力率　:\\C[0]${Math.floor(user.elementAmplifyRate(22) * 100) + valueAttackAmplifysActorId[$gameVariables.value(20)][22]}%\n`;
        value3 += `\\C[16]\\I[482]刀威力率　　:\\C[0]${Math.floor(user.elementAmplifyRate(23) * 100) + valueAttackAmplifysActorId[$gameVariables.value(20)][23]}%\n`;
        value3 += `\\C[16]\\I[483]杖威力率　　:\\C[0]${Math.floor(user.elementAmplifyRate(24) * 100) + valueAttackAmplifysActorId[$gameVariables.value(20)][24]}%\n`;
        value3 += `\\C[16]\\I[484]拳威力率　　:\\C[0]${Math.floor(user.elementAmplifyRate(25) * 100) + valueAttackAmplifysActorId[$gameVariables.value(20)][25]}%\n`;
        value3 += `\\C[16]\\I[485]槍威力率　　:\\C[0]${Math.floor(user.elementAmplifyRate(26) * 100) + valueAttackAmplifysActorId[$gameVariables.value(20)][26]}%\n`;
        value3 += `\\C[16]\\I[486]斧威力率　　:\\C[0]${Math.floor(user.elementAmplifyRate(27) * 100) + valueAttackAmplifysActorId[$gameVariables.value(20)][27]}%\n`;
        value3 += `\\C[16]\\I[487]銃威力率　　:\\C[0]${Math.floor(user.elementAmplifyRate(28) * 100) + valueAttackAmplifysActorId[$gameVariables.value(20)][28]}%\n`;
        value3 += `\\C[16]\\I[488]弓威力率　　:\\C[0]${Math.floor(user.elementAmplifyRate(29) * 100) + valueAttackAmplifysActorId[$gameVariables.value(20)][29]}%\n`;
        value3 += `\\C[16]\\I[489]楽器威力率　:\\C[0]${Math.floor(user.elementAmplifyRate(30) * 100) + valueAttackAmplifysActorId[$gameVariables.value(20)][30]}%\n`;
    } else {
        value3 += `\\C[16]\\I[31]奥義威力率　:\\C[0]${Math.floor(user.elementAmplifyRate(10) * 100)}%\n`;
        value3 += `\\C[16]\\I[673]ｱﾋﾞﾘﾃｨ威力率:\\C[0]${Math.floor(user.elementAmplifyRate(20) * 100)}%\n`;
        value3 += `\\C[16]\\I[78]会心威力率　:\\C[0]${Math.floor(user.criticalMultiplierBonus() * 100)}%\n`;
        value3 += `\\C[16]\\I[480]剣威力率　　:\\C[0]${Math.floor(user.elementAmplifyRate(21) * 100)}%\n`;
        value3 += `\\C[16]\\I[481]短剣威力率　:\\C[0]${Math.floor(user.elementAmplifyRate(22) * 100)}%\n`;
        value3 += `\\C[16]\\I[482]刀威力率　　:\\C[0]${Math.floor(user.elementAmplifyRate(23) * 100)}%\n`;
        value3 += `\\C[16]\\I[483]杖威力率　　:\\C[0]${Math.floor(user.elementAmplifyRate(24) * 100)}%\n`;
        value3 += `\\C[16]\\I[484]拳威力率　　:\\C[0]${Math.floor(user.elementAmplifyRate(25) * 100)}%\n`;
        value3 += `\\C[16]\\I[485]槍威力率　　:\\C[0]${Math.floor(user.elementAmplifyRate(26) * 100)}%\n`;
        value3 += `\\C[16]\\I[486]斧威力率　　:\\C[0]${Math.floor(user.elementAmplifyRate(27) * 100)}%\n`;
        value3 += `\\C[16]\\I[487]銃威力率　　:\\C[0]${Math.floor(user.elementAmplifyRate(28) * 100)}%\n`;
        value3 += `\\C[16]\\I[488]弓威力率　　:\\C[0]${Math.floor(user.elementAmplifyRate(29) * 100)}%\n`;
        value3 += `\\C[16]\\I[489]楽器威力率　:\\C[0]${Math.floor(user.elementAmplifyRate(30) * 100)}%\n`;
    };
    if (false) {//神聖邪悪耐性率表示
        if (user.elementAmplifyRate(16) * 100 >= 110) { value3 += `\\C[16]\\I[172]威力率:\\C[0]${Math.floor(user.elementAmplifyRate(16) * 100)}%\n` };
        if (user.elementAmplifyRate(17) * 100 >= 110) { value3 += `\\C[16]\\I[173]威力率:\\C[0]${Math.floor(user.elementAmplifyRate(17) * 100)}%\n` };
        if (user.elementRate(16) * 100 >= 110) { value3 += `\\C[16]\\I[172]耐性率:\\C[0]${Math.floor(user.elementRate(16) * 100)}%\n` };
        if (user.elementRate(17) * 100 >= 110) { value3 += `\\C[16]\\I[173]耐性率:\\C[0]${Math.floor(user.elementRate(17) * 100)}%\n` };
    };
    WindowManager.show(1, 0, 105, 300, 663);
    WindowManager.show(2, 300, 105, 300, 663);
    WindowManager.show(3, 600, 105, 300, 663);
    WindowManager.drawText(1, `\\fs[25]${value1}`);
    WindowManager.drawText(2, `\\fs[25]${value2}`);
    WindowManager.drawText(3, `\\fs[25]${value3}`);

    var value4 = `\\C[2]詳細能力値[4]\\C[0]\n`;
    var start = 1;
    var end = $dataStates.length - 1;
    for (var i = start; i <= end; i++) {
        if ($dataStates[i].meta['Category']) {
            if ($dataStates[i].meta['Category'] == ' StateabNomal' || $dataStates[i].meta['Category'] == ' StateSPabNomal') {
                if (user.isStateResist(i)) {
                    value4 += `\x1bI[${$dataStates[i].iconIndex}]${$dataStates[i].name}:\\C[2][無効化]\\C[0]\n`;
                } else {
                    if (user.stateRate(i) != 1.0) {
                        if ($dataStates[i].meta['Category'] == ' StateabNomal' && user.stateRate(i) == user.stateRate(15)) { } else {
                            if ($dataStates[i].meta['Category'] == ' StateSPabNomal' && user.stateRate(i) == user.stateRate(30)) { } else {
                                value4 += `\x1bI[${$dataStates[i].iconIndex}]${$dataStates[i].name}耐性率:${Math.floor(user.stateRate(i) * 100)}%\n`;
                            };
                        };
                    };
                };
            }
        }
    };

    if (id1 >= 20) {
        var arr1 = [18, 19, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80];
        var list = arr1;
        list.forEach(function (id) {
            if (user.elementAmplifyRate(id) != 0) {
                amygame_elementIcon(id);
                value4 += `\\C[16]\x1bI[${valueElementIconArr[0]}]特攻率:\\C[0]${Math.floor(user.elementAmplifyRate(id) * 100)}%\n`;
            };
        }, this);
    } else {
        for (var i = 1; i <= $dataSystem.elements.length - 1; i++) {
            if ([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17].some(function (id2) { return id2 == i })) { } else {
                if (user.elementRate(i) != 1) {
                    amygame_elementIcon(i);
                    if (valueElementIconArr[0] == 1) {
                        var value5 = `\\C[16]${$dataSystem.elements[i]}耐性率\\C[0]:`;
                    } else {
                        var value5 = `\\C[16]\\I[${valueElementIconArr[3]}]耐性率\\C[0]:`;
                    };
                    value4 += `${value5}${Math.floor(user.elementRate(i) * 100)}%\n`;
                }
            }
        };
    };
    var value5 = 900;
    if (value4 != `\\C[2]詳細能力値[4]\\C[0]\n`) {
        WindowManager.show(4, 900, 105, 380, 663);
        WindowManager.drawText(4, `\\fs[25]${value4}`);
        var value5 = 1280;
    } else {
        if (id1 == 20 && $gameParty.inBattle()) {
            $gameSwitches.setValue(375, true);
            title_battleUp(user);
            passive_addCondition(user);
            $gameSwitches.setValue(375, false);
        };
    };
    //名前、苗字、役職、二つ名、職業Profession
    if (id1 == 20) {
        if (user.subclass()) {
            var value2 = `[${$dataClasses[user._classId].name}/${$dataClasses[user._subclassId].name}]`;
        } else {
            var value2 = `${$dataClasses[user._classId].name}`;
        };
        if ($gameParty.inBattle()) {
            var value3 = `\\C[16]BuffLimit:\\C[0]${user.maxBuffLimit(2)} \\C[16]D.cap:\\C[0]${user.maximumDamage()} \\C[16]H.cap:\\C[0]${user.maximumHealing() - user.maximumHealing() - user.maximumHealing()}`;
        } else {
            var value3 = `役職:${$gameVariables.value(380 + $gameVariables.value(20))[59]}`;
        };
        var value1 = `${value2}${user.nickname()}\\set[${$gameVariables.value(20)}]\n${value3}`;
    } else {
        var value1 = `${user.name()}`;
    };
    WindowManager.show(0, 0, 0, value5, 105);
    WindowManager.drawText(0, `\\fs[25]${value1}`);

};

//エネミー撃破時にドロップボックス設定
enemywin_treasurebox1 = function (id1) {

    $gameVariables.value(160)[4] = 0;
    $gameVariables.value(160)[7] = 0;
    var value1 = Math.floor(Math.random() * 101);
    var value2 = 0;
    var value3 = 0;
    if ($gameVariables.value(270) >= 1) {
        var value3 = $gameVariables.value(270);
    };
    if ($gameSwitches.value(211)) {
        value2 += 20;
    };
    value1 += Math.round(value2 + ($gameVariables.value(270) / 10));
    if (value1 >= 100 && value3 >= 40) {
        $gameVariables.value(160)[4] = 3;
        $gameVariables.value(160)[5] = 21;
        $gameVariables.value(160)[6] = 5;
        $gameVariables.value(160)[7] = 1;
    } else {
        if (value1 >= 95 && value3 >= 20) {
            $gameVariables.value(160)[4] = 2;
            $gameVariables.value(160)[5] = 18;
            $gameVariables.value(160)[6] = 3;
            $gameVariables.value(160)[7] = 1;
        } else {
            if (value1 >= 85) {
                $gameVariables.value(160)[4] = 1;
                $gameVariables.value(160)[5] = 15;
                $gameVariables.value(160)[6] = 1;
                $gameVariables.value(160)[7] = 1;
            }
        }
    };

    //テストプレイ用
    //$gameVariables.value(160)[4] = 1;
    //$gameVariables.value(160)[5] = 15;
    //$gameVariables.value(160)[6] = 1;
    //$gameVariables.value(160)[7] = 1;

};

//エネミー撃破時にドロップボックス設定
enemywin_treasurebox2 = function (id1) {

    for (var i = 1; i <= 100; i++) {
        var value0 = 0;
        var value1 = $gameMap.event(id1).x;
        var value2 = $gameMap.event(id1).y;
        var value3 = $gamePlayer.x;//プレイヤー座標
        var value4 = $gamePlayer.y;
        var value6 = [-2, -1, 0, 1, 2][Math.floor(Math.random() * 5)];
        var value7 = [-2, -1, 0, 1, 2][Math.floor(Math.random() * 5)];
        value1 += value6;
        value2 += value7;
        value0 = $gameMap.eventIdXy(value1, value2);
        var value5 = $gameMap.terrainTag(value1, value2);
        if (value5 == 0) { value0 = 1 }
        if (value1 == value3 && value2 == value4) { value0 = 1 };
        if (value0 >= 1) {
            $gameVariables.value(160)[1] = 0;
            $gameVariables.value(160)[2] = 0;
        } else {
            $gameVariables.value(160)[1] = value6;
            $gameVariables.value(160)[2] = value7;
        };
        if ($gameVariables.value(160)[1] != 0) {
            break;
        }
    };

    var value1 = 4;
    if ($gameVariables.value(160)[1] == 0) {
        var conditionMap = {};
        conditionMap.passable = 1;
        conditionMap.screen = 0;
        conditionMap.collided = 3;
        conditionMap.terrainTags = [1];
        conditionMap.regionIds = [1];
        $gameMap.spawnEventRandom(value1, conditionMap, true);
    } else {
        $gameMap.spawnEvent(value1, $gameMap.event(id1).x, $gameMap.event(id1).y, true);
    };
    var value2 = $gameMap.getLastSpawnEventId();
    var event = $gameMap.event(value2);
    var value1 = 'chest_c3';
    $gameScreen._particle.particlePlay(value2, value1, 'attach:this', 'def', 'above');
    $gameScreen._particle.particleExceed(value1, 0.5);
    AudioManager.playSe({ "name": "Sound1", "volume": 75, "pitch": 150, "pan": 0 });
    event.jumpEx($gameVariables.value(160)[1], $gameVariables.value(160)[2], $gameVariables.value(160)[5], $gameVariables.value(160)[6]);
    event.controlSelfVariable(1, 0, $gameVariables.value(160)[4], true);

};

//戦闘背景をコントロール
battleback_change2 = function () {

    //戦闘中パーティクル
    var value1 = 'fog_battle_front';
    $gameScreen._particle.particleSet(0, value1, 'battleWeather', 'def', 'above');
    var value2 = valueWeather[28];
    $gameScreen._particle.particleUpdate([value1, 'alpha', '0', value2 + '@0.05', value2 + '@0.9', '0']);
    var value2 = valueWeather[29];
    $gameScreen._particle.particleUpdate([value1, 'speed', String(value2), String(value2)]);

    if ($gameVariables.value(230) >= 1 && $gameVariables.value(240) == 0) {
        var spriteset = SceneManager._scene._spriteset;
        var bitmap = ImageManager.loadBitmap("img/parallaxes/", "BG_TownBattle3", 0, true);
        spriteset.addNewBattleback(3, bitmap, 0, value4);
        spriteset.battlebackOpacity(3, 255);
    };

    var value10 = 0;
    if ($gameVariables.value(240) >= 1) {
        var arr1 = [-0.1, -0.2, -0.3, -0.4, -0.5, 0.1, 0.2, 0.3, 0.4, 0.5];
        var value = $dataItems[$gameVariables.value(240)];
        if (value.meta['BG1']) { var value10 = 'BG1' };
        if ($gameSwitches.value(15) && value.meta['BG1N']) {
            if (value.meta['BG1N']) { var value10 = 'BG1N' };
        };
    } else {
        var value = $dataMap;
    };
    if (value10 != 0) {
        var arr = value.meta[value10].split(',');
        var value1 = arr1[Math.floor(Math.random() * arr1.length)];
        var value2 = Math.floor(Math.random() * 56) + 200;
        var value3 = arr1[Math.floor(Math.random() * arr1.length)];
        var value4 = 120;
        var spriteset = SceneManager._scene._spriteset;
        if (Number(arr[1]) == 0) { } else {
            spriteset.setBattlebackScrollSpeedX(1, value1);
        };
        if (Number(arr[1]) >= 2) {
            spriteset.setBattlebackScrollSpeedX(1, Number(arr[1]));
        };
        if (Number(arr[2]) == 0) { } else {
            spriteset.setBattlebackScrollSpeedY(1, value3);
        };
        if (Number(arr[2]) >= 2) {
            spriteset.setBattlebackScrollSpeedX(1, Number(arr[2]));
        };
        //spriteset.battlebackOpacity(1, value2);
    };

    var value10 = 0;
    if (value.meta['BG3']) { var value10 = 'BG3' };
    if ($gameSwitches.value(15) && value.meta['BG3N']) {
        if (value.meta['BG3N']) { var value10 = 'BG3N' };
    };
    if (value10 != 0) {
        if (value.meta[value10]) {
            var arr = value.meta[value10].split(',');
            var value1 = arr1[Math.floor(Math.random() * arr1.length)];
            var value2 = Math.floor(Math.random() * 101) + 100;
            var value3 = arr1[Math.floor(Math.random() * arr1.length)];
            var bitmap = ImageManager.loadBitmap("img/parallaxes/", arr[0], Number(arr[4]), true);
            spriteset.addNewBattleback(3, bitmap, 0, value4);
            if (Number(arr[1]) == 0) { } else {
                spriteset.setBattlebackScrollSpeedX(3, value1);
            };
            if (Number(arr[1]) >= 2) {
                spriteset.setBattlebackScrollSpeedX(3, Number(arr[1]));
            };
            if (Number(arr[2]) == 0) { } else {
                spriteset.setBattlebackScrollSpeedY(3, value3);
            };
            if (Number(arr[2]) >= 2) {
                spriteset.setBattlebackScrollSpeedX(3, Number(arr[2]));
            };
            spriteset.battlebackOpacity(3, Number(arr[3]));
            spriteset.battlebackFadeIn(3, value4);
        };
    };

    var value10 = 0;
    if (value.meta['BG4']) { var value10 = 'BG4' };
    if ($gameSwitches.value(15) && value.meta['BG4N']) {
        if (value.meta['BG4N']) { var value10 = 'BG4N' };
    };
    if (value10 != 0) {
        if (value.meta[value10]) {
            var arr = value.meta[value10].split(',');
            var value1 = arr1[Math.floor(Math.random() * arr1.length)];
            var value2 = Math.floor(Math.random() * 101) + 100;
            var value3 = arr1[Math.floor(Math.random() * arr1.length)];
            var bitmap = ImageManager.loadBitmap("img/parallaxes/", arr[0], Number(arr[4]), true);
            spriteset.addNewBattleback(4, bitmap, 0, value4);
            if (Number(arr[1]) == 0) { } else {
                spriteset.setBattlebackScrollSpeedX(4, value1);
            };
            if (Number(arr[1]) >= 2) {
                spriteset.setBattlebackScrollSpeedX(4, Number(arr[1]));
            };
            if (Number(arr[2]) == 0) { } else {
                spriteset.setBattlebackScrollSpeedY(4, value3);
            };
            if (Number(arr[2]) >= 2) {
                spriteset.setBattlebackScrollSpeedX(4, Number(arr[2]));
            };
            spriteset.battlebackOpacity(4, Number(arr[3]));
            spriteset.battlebackFadeIn(4, value4);
        };
    };

    var value10 = 0;
    if (value.meta['BG5']) { var value10 = 'BG5' };
    if ($gameSwitches.value(15) && value.meta['BG5N']) {
        if (value.meta['BG5N']) { var value10 = 'BG5N' };
    };
    if (value10 != 0) {
        if (value.meta[value10]) {
            var arr = value.meta[value10].split(',');
            var value1 = arr1[Math.floor(Math.random() * arr1.length)];
            var value2 = Math.floor(Math.random() * 101) + 100;
            var value3 = arr1[Math.floor(Math.random() * arr1.length)];
            var bitmap = ImageManager.loadBitmap("img/parallaxes/", arr[0], Number(arr[4]), true);
            spriteset.addNewBattleback(5, bitmap, 0, value4);
            if (Number(arr[1]) == 0) { } else {
                spriteset.setBattlebackScrollSpeedX(5, value1);
            };
            if (Number(arr[1]) >= 2) {
                spriteset.setBattlebackScrollSpeedX(5, Number(arr[1]));
            };
            if (Number(arr[2]) == 0) { } else {
                spriteset.setBattlebackScrollSpeedY(5, value3);
            };
            if (Number(arr[2]) >= 2) {
                spriteset.setBattlebackScrollSpeedX(5, Number(arr[2]));
            };
            spriteset.battlebackOpacity(5, Number(arr[3]));
            spriteset.battlebackFadeIn(5, value4);
        };
    };

    var value10 = 0;
    if (value.meta['BG6']) { var value10 = 'BG6' };
    if ($gameSwitches.value(15) && value.meta['BG6N']) {
        if (value.meta['BG6N']) { var value10 = 'BG6N' };
    };
    if (value10 != 0) {
        if (value.meta[value10]) {
            var arr = value.meta[value10].split(',');
            var value1 = arr1[Math.floor(Math.random() * arr1.length)];
            var value2 = Math.floor(Math.random() * 101) + 100;
            var value3 = arr1[Math.floor(Math.random() * arr1.length)];
            var bitmap = ImageManager.loadBitmap("img/parallaxes/", arr[0], Number(arr[4]), true);
            spriteset.addNewBattleback(6, bitmap, 0, value4);
            if (Number(arr[1]) == 0) { } else {
                spriteset.setBattlebackScrollSpeedX(6, value1);
            };
            if (Number(arr[1]) >= 2) {
                spriteset.setBattlebackScrollSpeedX(6, Number(arr[1]));
            };
            if (Number(arr[2]) == 0) { } else {
                spriteset.setBattlebackScrollSpeedY(6, value3);
            };
            if (Number(arr[2]) >= 2) {
                spriteset.setBattlebackScrollSpeedX(6, Number(arr[2]));
            };
            spriteset.battlebackOpacity(6, Number(arr[3]));
            spriteset.battlebackFadeIn(6, value4);
        };
    };


};

//戦闘時一言集
battle_wordset = function (id1) {

    if (ConfigManager.battleAniSpeed >= 3) {

        var array0 = 0;
        var array1 = 0;
        var array2 = 0;
        if (id1 == 1) {
            if ($gameVariables.value(276) == 1) {
                if ($gameSwitches.value(464)) {
                    $gameVariables.setValue(20, $gameParty.battleMembers()[$gameVariables.value(20)].actorId());
                } else {
                    var enemy1 = $gameTroop.members()[$gameVariables.value(20)];
                    var enemy2 = $dataEnemies[$gameTroop.members()[$gameVariables.value(20)].enemyId()];
                    $gameVariables.setValue(20, $gameVariables.value(11));
                };
            };
        };

        $gameVariables.setValue(277, 0);//二言目台詞用。現在未使用
        $gameVariables.setValue(53, $gameActors.actor($gameVariables.value(20)).nickname());
        $gameVariables.setValue(625, $gameVariables.value(380 + $gameVariables.value(20))[59]);
        var actor = $gameActors.actor($gameVariables.value(20));
        var actor2 = $gameActors.actor($gameVariables.value(20)).name();
        var enemy1 = $gameTroop.members()[$gameVariables.value(92)];
        var enemy2 = $dataEnemies[$gameTroop.members()[$gameVariables.value(92)].enemyId()];
        if ($gameVariables.value(276) == 2) {

            valueFaceSelect = 8;
            if (actor.tp >= 100) {
                valueFaceSelect = 48;

            };
            var array2 = $dataActors[$gameVariables.value(20)].meta['BattleAttack'].split(',');
            if (actor.isStateAffected(61)) {
                var arr2 = [21, 22, 23, 24];
                var value2 = arr2[Math.floor(Math.random() * arr2.length)];
                valueFaceSelect = value2;
            };
            if (actor.isStateAffected(68)) {
                var arr1 = [17, 18, 19, 20];
                var value1 = arr1[Math.floor(Math.random() * arr1.length)];
                valueFaceSelect = value1;
            };
            if ($gameVariables.value(182) == 5) {
                //var array1 = $dataActors[$gameVariables.value(20)].meta['S-AbilityUse'].split(',');
                var array2 = $dataActors[$gameVariables.value(20)].meta['S-AbilityUse'].split(',');
                valueFaceSelect = 15;
            };
            if ($gameVariables.value(182) == 6) {
                //var array1 = $dataActors[$gameVariables.value(20)].meta['A-AbilityUse'].split(',');
                var array2 = $dataActors[$gameVariables.value(20)].meta['A-AbilityUse'].split(',');
                //フェイスは通常攻撃を流用
            };
            if ($gameVariables.value(182) == 7) {
                //var array1 = $dataActors[$gameVariables.value(20)].meta['W-AbilityUse'].split(',');
                var array2 = $dataActors[$gameVariables.value(20)].meta['W-AbilityUse'].split(',');
                valueFaceSelect = 13;
            };
            if ($gameVariables.value(182) == 8) {
                //var array1 = $dataActors[$gameVariables.value(20)].meta['R-AbilityUse'].split(',');
                var array2 = $dataActors[$gameVariables.value(20)].meta['R-AbilityUse'].split(',');
                valueFaceSelect = 6;
            };

        };

        if ($gameVariables.value(276) == 1) {

            valueFaceSelect = 9;
            var value1 = $gameVariables.value(514);
            var value2 = actor.hpRate() * 100;
            var array1 = $dataActors[$gameVariables.value(20)].meta['BattleDamage'].split(',');
            if (value1 == value2) {
                var array1 = $dataActors[$gameVariables.value(20)].meta['Battle0Damage'].split(',');
                valueFaceSelect = 6;
            };
            if (value1 - value2 <= 2) {
                var array1 = $dataActors[$gameVariables.value(20)].meta['BattleSmallDamage'].split(',');
                valueFaceSelect = 4;
            };
            if (value1 - value2 >= 50) {
                var array1 = $dataActors[$gameVariables.value(20)].meta['BattleBigDamage'].split(',');
                valueFaceSelect = 45;
            };

        };

        if ($gameVariables.value(276) == 0) {
            if ($gameVariables.value(263) >= 3) { //ターン数 
                var array0 = $dataActors[$gameVariables.value(20)].meta['BattleTurn2'].split(',');
            };
            if ([34, 35, 36].some(function (id) { return actor.isStateAffected(id) })) {  //疲労時
                var array0 = $dataActors[$gameVariables.value(20)].meta['BattleFatigue'].split(',');
            };
            if (actor.isStateAffected(37)) {  //ブラック
                var array0 = $dataActors[$gameVariables.value(20)].meta['BattleFatigueBlack'].split(',');
                var array2 = $dataActors[$gameVariables.value(20)].meta['BattleFatigueBlackAttack'].split(',');
                var array1 = $dataActors[$gameVariables.value(20)].meta['BattleFatigueBlackDamage'].split(',');
            };
            if (actor.hpRate() <= 0.3) {  //瀕死  
                var array0 = $dataActors[$gameVariables.value(20)].meta['BattleDying'].split(',');
            };
            if ($gameParty.battleMembers().length >= 2 && $gameParty.aliveMembers().length <= 1) {  //最後の一人
                var array0 = $dataActors[$gameVariables.value(20)].meta['BattleLastOne'].split(',');
            };

            if (actor.isStateAffected(61) && actor.isStateAffected(602)) {  //発情
                if (actor.isLearnedSkill(65)) {
                    var array0 = $dataActors[$gameVariables.value(20)].meta['BattleSexualExcitementMax'].split(',');
                    var array2 = $dataActors[$gameVariables.value(20)].meta['BattleSexualExcitementMaxAttack'].split(',');//攻撃
                    var array1 = $dataActors[$gameVariables.value(20)].meta['BattleSexualExcitementMaxDamage'].split(',');//ダメージ
                } else {
                    var array0 = $dataActors[$gameVariables.value(20)].meta['BattleSexualExcitement'].split(',');
                    var array2 = $dataActors[$gameVariables.value(20)].meta['BattleSexualExcitementAttack'].split(',');//攻撃
                    var array1 = $dataActors[$gameVariables.value(20)].meta['BattleSexualExcitementDamage'].split(',');//ダメージ
                };
            };
            if (actor.isStateAffected(63) && actor.isStateAffected(602)) {
                if (actor.isLearnedSkill(65)) {//拘束
                    var array0 = $dataActors[$gameVariables.value(20)].meta['BattleBindMax'].split(',');
                } else {
                    var array0 = $dataActors[$gameVariables.value(20)].meta['BattleBind'].split(',');
                };
            };
            if (actor.isStateAffected(68) && actor.isStateAffected(602)) {    //激情
                var array0 = $dataActors[$gameVariables.value(20)].meta['BattlePassion'].split(',');
            };
            if (actor.isStateAffected(64) && actor.isStateAffected(602)) {    //放心
                if (actor.isLearnedSkill(65)) {
                    var array0 = $dataActors[$gameVariables.value(20)].meta['BattleAbsentlyMax'].split(',');
                } else {
                    var array0 = $dataActors[$gameVariables.value(20)].meta['BattleAbsently'].split(',');
                };
            };
        };

        var value2 = 0;
        if (id1 == 0) {
            if (array0 != 0) {
                var value2 = actor2 + array0[Math.floor(Math.random() * array0.length)];
            };
        };

        if (id1 == 1) {
            if ($gameVariables.value(276) == 2) {
                if (array2 != 0) {
                    var array = $dataActors[$gameVariables.value(20)].meta['BattleAttack2Conbo'].split(',');
                    var value1 = array[Math.floor(Math.random() * array.length)];
                    valueWordSet9 = `${actor.name()}の\\C[2]2連撃\\C[0]！ ${value1}`;
                    var array = $dataActors[$gameVariables.value(20)].meta['BattleAttack3Conbo'].split(',');
                    var value1 = array[Math.floor(Math.random() * array.length)];
                    valueWordSet10 = `${actor.name()}の\\C[2]3連撃\\C[0]！ ${value1}`;
                    var value2 = actor2 + array2[Math.floor(Math.random() * array2.length)];
                    battle_bustUp(86, 500, 10, 20);
                };
            };
            if ($gameVariables.value(276) == 1) {
                var value2 = `${enemy1.name()}の\\C[3]＜${$dataSkills[$gameVariables.value(96)].name}＞\\C[0]！`;
                valueWordSet9 = `${enemy1.name()}の\\C[2]2連撃\\C[0]！`;
                valueWordSet10 = `${enemy1.name()}の\\C[2]3連撃\\C[0]！`;
            };
        };
        if (id1 == 2) {
            if ($gameVariables.value(276) == 2 && !$gameSwitches.value(464)) {
                if (enemy2.meta['EnemyDamageWord']) {
                    var array = enemy2.meta['EnemyDamageWord'].split(',');
                    var value2 = `${enemy1.name()}${array[Math.floor(Math.random() * array.length)]}`;
                } else {
                    var value2 = `${enemy1.name()}は攻撃を受けた！`;
                };
            };
            if ($gameVariables.value(276) == 1 || $gameSwitches.value(464)) {
                if (array1 != 0) {
                    var value2 = actor2 + array1[Math.floor(Math.random() * array1.length)];
                    battle_bustUp(86, 500, 10, 40);
                };
            };
            if ($gameVariables.value(276) == 1 && !$gameSwitches.value(464)) {
                var value2 = `${enemy1.name()}は${$dataSkills[$gameVariables.value(96)].name}を受けた！`;//攻撃時だが使用不可
            };
        };

        if (value2 != 0) {
            BattleManager._logWindow.push(`addText`, value2);
        };
        if ($gameVariables.value(277) != 0) {
            BattleManager._logWindow.push(`addText`, `\\V[277]`);
        };

        if ($gameVariables.value(276) == 2) {
            // $gameTroop.members()[$gameVariables.value(92)].hpRate()*100;
        } else {
            // $gameActors.actor($gameVariables.value(20)).hpRate()*100;
        };

    };

};

//戦闘開始時に称号効果
title_battleUp = function (actor) {

    var value11 = 0;
    var arr2 = [];
    if (!$gameVariables.value(288) == 0) {
        var valueItems = $dataItems;
        for (var id1 = 0; id1 <= $gameVariables.value(288).length - 1; id1++) {
            if ($gameVariables.value(288)[id1] == 0) { } else {
                var valueItems = $dataItems[$gameVariables.value(288)[id1]];
                if (valueItems.meta['titleEffect1']) {
                    var arr1 = valueItems.meta['titleEffect1'].split(',');
                    var value1 = Number(arr1[2]);
                    if ($gameSwitches.value(375)) {
                        var value10 = `\\C[6]【称号効果】\\C[0]\\C[2]${valueItems.name}\\C[0]:`;
                        value11 += 1;
                        if (Number(arr1[0]) == 0) {
                            value10 += TextManager.param(Number(arr1[1]));
                            value10 += `\\C[10]${Number(arr1[2]) * 100}%\\C[0]UP!`;
                        };
                        if (Number(arr1[0]) == 1) {
                            value10 += FTKR.CSS.cssStatus.xparam[Number(arr1[1])];
                            value10 += `\\C[10]${Number(arr1[2]) * 100}%\\C[0]UP!`;
                        };
                        if (Number(arr1[0]) == 2) {
                            value10 += FTKR.CSS.cssStatus.sparam[Number(arr1[1])];
                            value10 += `\\C[10]${Number(arr1[2]) * 100}%\\C[0]UP!`;
                        };
                        if (Number(arr1[0]) == 3) {
                            value10 += `${$dataSystem.elements[Number(arr1[1])]}威力`;
                            if (Number(arr1[2]) >= 0) {
                                value10 += `\\C[10]${Number(arr1[2])}%UP!\\C[0]`;
                            } else {
                                value10 += `\\C[1]${Number(arr1[2])}%DOWN!\\C[0]`;
                            };
                        };
                        if (Number(arr1[0]) == 4) {
                            value10 += `${$dataSystem.elements[Number(arr1[1])]}`;
                            if ([10, 11, 12, 15, 20, 38, 39, 40, 41].some(function (id1) { return id1 == Number(arr1[1]) })) {
                                if (Number(arr1[1]) == 11) {
                                    var value2 = `10`;
                                } else {
                                    var value2 = `100`;
                                };
                                if (value1 >= 0) {
                                    value10 += `\\C[10]${Number(arr1[2]) * value2}%\\C[0]UP!`;
                                } else {
                                    value10 += `\\C[1]${Number(arr1[2]) * value2}%\\C[0]DOWN!`;
                                };
                            } else {
                                value10 += `耐性`;
                                if (Number(arr1[1]) == 11) {
                                    var value2 = `10`;
                                } else {
                                    var value2 = `100`;
                                };
                                if (value1 <= 0) {
                                    var value1 = value1 - value1 - value1;
                                    value10 += `\\C[1]${Number(arr1[2]) * value2}%\\C[0]DOWN!`;
                                } else {
                                    value10 += `\\C[10]${Number(arr1[2]) * value2}%\\C[0]UP!`;
                                };
                            };
                        };
                        arr2.push(value10);
                        break;
                    } else {
                        if (Number(arr1[0]) == 0) {
                            actor.actor().traits.push({ code: 21, dataId: Number(arr1[1]), value: 1 + value1 });
                        };
                        if (Number(arr1[0]) == 1) {
                            actor.actor().traits.push({ code: 22, dataId: Number(arr1[1]), value: value1 });
                        };
                        if (Number(arr1[0]) == 2) {
                            actor.actor().traits.push({ code: 23, dataId: Number(arr1[1]), value: 1 + value1 });
                        };
                        if (Number(arr1[0]) == 3) { valueAttackAmplifysActorId[actor.actorId()][Number(arr1[1])] += Number(arr1[2]) };
                        if (Number(arr1[0]) == 4) {
                            actor.actor().traits.push({ code: 11, dataId: Number(arr1[1]), value: 1 + value1 });
                        };
                    };
                    //};
                }
            };
        };
        if ($gameSwitches.value(375) && value11 >= 1) {
            if ($gameParty.inBattle()) {
                for (var i = 0; i < $gameParty.battleMembers().length; i++) {
                    var user = $gameParty.battleMembers()[i];
                    var value1 = user.index() + 1;
                    $gameScreen._particle.particlePlay(0, 'aura_bp', 'attachParty:' + value1, 'def', 'above');
                };
            };
            for (var i = 0; i <= arr2.length - 1; i++) {
                valueGetInfoPointX = 900;
                CommonPopupManager.showInfo({}, arr2[i], null);
                BattleManager._logWindow.push(`addText`, arr2[i]);
            };
            valueGetInfoPointX = 0;
        };
    };

};

//パッシブ付与
passive_addCondition = function (user) {

    if (!$gameSwitches.value(375)) {
        valueAttackAmplifysActorId[user.actorId()] = Array(100).fill(0);
        user.actor().traits = [];
        //user.clearParamPlus();//戦闘中の一時強化にのみ使う
        //user.clearXParamPlus();
        //user.clearSParamPlus();
    };
    var value11 = 0;
    var array = [];
    var arr2 = [`\\C[10]${user.name()}\\C[0]発動G-Passive`];
    var list = valuePassiveAdd;
    list.forEach(function (id) {
        if ($dataSkills[id].meta['Max Mastery Level']) {
            if (user.skillMasteryLevel(id) >= 1 && user.battleSkillsRaw().includes(id) &&
                !user.isLearnedSkill(Number($dataSkills[id].meta['Hide if Learned Skill']))) {
                if (Number($dataSkills[id].meta['PassiveCondi'].split(',')[0]) == 1 && user.battleSkillsRaw().includes(id)) { array.push(id) };
                if (Number($dataSkills[id].meta['PassiveCondi'].split(',')[0]) == 2 && user.isWtypeEquipped(Number($dataSkills[id].meta['PassiveCondi'].split(',')[1]))) { array.push(id) };
                if (Number($dataSkills[id].meta['PassiveCondi'].split(',')[0]) == 3 && user.isStateAffected(Number($dataSkills[id].meta['PassiveCondi'].split(',')[1]))) { array.push(id) };
            } else {
                for (var j = 0; j <= Number($dataSkills[id].meta['Max Mastery Level']) - 1; j++) {
                    user.removeState(Number($dataSkills[id].meta['PassiveCondi'].split(',')[2]) + j);
                };
            };
        } else {
            if (!user.isLearnedSkill(Number($dataSkills[id].meta['Hide if Learned Skill'])) &&
                user.battleSkillsRaw().includes(id)) {
                if (Number($dataSkills[id].meta['PassiveCondi'].split(',')[0]) == 1 && user.battleSkillsRaw().includes(id)) { array.push(id) };
                if (Number($dataSkills[id].meta['PassiveCondi'].split(',')[0]) == 2 && user.isWtypeEquipped(Number($dataSkills[id].meta['PassiveCondi'].split(',')[1]))) { array.push(id) };
                if (Number($dataSkills[id].meta['PassiveCondi'].split(',')[0]) == 3 && user.isStateAffected(Number($dataSkills[id].meta['PassiveCondi'].split(',')[1]))) { array.push(id) };
            } else {
                user.removeState(Number($dataSkills[id].meta['PassiveCondi'].split(',')[2]));
            };
        };
    }, this);

    if (array == 0) { } else {
        var list = array;
        list.forEach(function (id) {
            if ($dataSkills[id].meta['Max Mastery Level']) {
                if ($gameSwitches.value(375)) {
                    var value10 = `\\C[2]${$dataSkills[id].name}\\C[0]:`;
                    value11 += 1;
                    if ($dataSkills[id].meta['PassiveLogDisplay']) {
                        value10 += `${$dataSkills[id].meta['PassiveLogDisplay'].split(',')[0]}\\C[10]${Number($dataSkills[id].meta['PassiveLogDisplay'].split(',')[1]) * user.skillMasteryLevel(id)}%\\C[0]UP!`;
                    } else {
                        value10 += `発動中`;
                    };
                    arr2.push(value10);
                } else {
                    user.addState(Number($dataSkills[id].meta['PassiveCondi'].split(',')[2]) + user.skillMasteryLevel(id) - 1);
                };
            } else {
                if ($gameSwitches.value(375)) {//スキルレベルが無いものだが、使用予定なし。通常パッシブに回す
                    var value10 = `\\C[2]${$dataSkills[id].name}\\C[0]:`;
                    value11 += 1;
                    if ($dataSkills[id].meta['PassiveLogDisplay']) {
                        value10 += `\\C[10]${$dataSkills[id].meta['PassiveLogDisplay'].split(',')[0]}\\C[0]!`;
                    } else {
                        value10 += `発動中`;
                    };
                    arr2.push(value10);
                } else {
                    user.addState(Number($dataSkills[id].meta['PassiveCondi'].split(',')[2]));
                };
            };
        }, this);
    };

    var list = valuePassivePlussSkill;
    list.forEach(function (id) {
        if (user.battleSkillsRaw().includes(id)) {
            var arr1 = $dataSkills[id].meta['PassivePlusEffect'].split(',');
            if ($dataSkills[id].meta['Max Mastery Level']) {
                var value1 = Number(arr1[2]) * user.skillMasteryLevel(id);
            } else {
                var value1 = Number(arr1[2]);
            };
            if ($gameSwitches.value(375)) {
                var value10 = `\\C[2]${$dataSkills[id].name}\\C[0]:`;
                value11 += 1;
                if (Number(arr1[0]) == 0) {
                    value10 += TextManager.param(Number(arr1[1]));
                    value10 += `\\C[10]${value1 * 100}%\\C[0]UP!`;
                };
                if (Number(arr1[0]) == 1) {
                    value10 += FTKR.CSS.cssStatus.xparam[Number(arr1[1])];
                    value10 += `\\C[10]${value1 * 100}%\\C[0]UP!`;
                };
                if (Number(arr1[0]) == 2) {
                    value10 += FTKR.CSS.cssStatus.sparam[Number(arr1[1])];
                    value10 += `\\C[10]${value1 * 100}%\\C[0]UP!`;
                };
                arr2.push(value10);
            } else {
                if (Number(arr1[0]) == 0) {
                    user.actor().traits.push({ code: 21, dataId: Number(arr1[1]), value: 1 + value1 });
                };
                if (Number(arr1[0]) == 1) {
                    user.actor().traits.push({ code: 22, dataId: Number(arr1[1]), value: value1 });
                };
                if (Number(arr1[0]) == 2) {
                    user.actor().traits.push({ code: 23, dataId: Number(arr1[1]), value: 1 + value1 });
                };
            };
        };
    }, this);

    var list = valuePassivePlussSkill2;
    list.forEach(function (id) {
        if (user.isLearnedSkill(id) &&
            user.battleSkillsRaw().includes(id) &&
            !user.isLearnedSkill(Number($dataSkills[id].meta['Hide if Learned Skill']))) {
            var arr1 = $dataSkills[id].meta['PassivePlusTrait'].split(',');
            if ($dataSkills[id].meta['Max Mastery Level']) {
                var value1 = Number(arr1[2]) * user.skillMasteryLevel(id);
            } else {
                var value1 = Number(arr1[2]);
            };
            if (Number(arr1[0]) == 11) {
                if ($gameSwitches.value(375)) {
                    var value10 = `\\C[2]${$dataSkills[id].name}\\C[0]:`;
                    value11 += 1;
                    value10 += `${$dataSystem.elements[Number(arr1[1])]}`;
                    if ([10, 11, 12, 15, 20, 38, 39, 40, 41].some(function (id1) { return id1 == Number(arr1[1]) })) {
                        if (Number(arr1[1]) == 11) {
                            var value2 = `10`;
                        } else {
                            var value2 = `100`;
                        };
                        if (value1 >= 0) {
                            value10 += `\\C[10]${value1 * value2}%\\C[0]UP!`;
                        } else {
                            value10 += `\\C[1]${value1 * value2}%\\C[0]DOWN!`;
                        };
                    } else {
                        value10 += `耐性`;
                        if (Number(arr1[1]) == 11) {
                            var value2 = `10`;
                        } else {
                            var value2 = `100`;
                        };
                        if (value1 <= 0) {
                            var value1 = value1 - value1 - value1;
                            value10 += `\\C[1]${value1 * value2}%\\C[0]DOWN!`;
                        } else {
                            value10 += `\\C[10]${value1 * value2}%\\C[0]UP!`;
                        };
                    };
                    arr2.push(value10);
                } else {
                    user.actor().traits.push({ code: Number(arr1[0]), dataId: Number(arr1[1]), value: 1 + value1 });
                };
            };
        };
    }, this);

    var list = valuePassiveElementP;//実際の効果はスキルフォーミュラで行っている。
    list.forEach(function (id) {
        if (user.isLearnedSkill(id) &&
            user.battleSkillsRaw().includes(id) &&
            !user.isLearnedSkill(Number($dataSkills[id].meta['Hide if Learned Skill']))) {
            var arr1 = $dataSkills[id].meta['PassiveElementP'].split(',');
            if ($dataSkills[id].meta['Max Mastery Level']) {
                var value1 = Number(arr1[1]) * user.skillMasteryLevel(id);
            } else {
                var value1 = Number(arr1[1]);
            };
            if ($gameSwitches.value(375)) {
                var value10 = `\\C[2]${$dataSkills[id].name}\\C[0]:`;
                value11 += 1;
                value10 += `${$dataSystem.elements[Number(arr1[0])]}威力`;
                if (value1 >= 1) {
                    value10 += `\\C[10]${value1}%UP!\\C[0]`;
                } else {
                    value10 += `\\C[1]${value1}%DOWN!\\C[0]`;
                };
                arr2.push(value10);
            } else {
                valueAttackAmplifysActorId[user.actorId()][Number(arr1[0])] += value1;
            };
        };
    }, this);

    var list = valueAddPowerCustomSkill;//スキル前計算で加算処理
    list.forEach(function (id) {
        if (user.isLearnedSkill(id) &&
            user.battleSkillsRaw().includes(id) &&
            !user.isLearnedSkill(Number($dataSkills[id].meta['Hide if Learned Skill']))) {
            var value1 = Number($dataSkills[id].meta['AddPowerCustom']);
            if ($dataSkills[id].meta['Max Mastery Level']) {
                value1 += user.skillMasteryLevel(id);
            };
            if ($gameSwitches.value(375)) {
                var value10 = `\\C[2]${$dataSkills[id].name}\\C[0]:`;
                value11 += 1;
                value10 += `\\I[666]`;
                if (value1 >= 1) {
                    value10 += `\\C[10]+${value1}!\\C[0]`;
                } else {
                    value10 += `\\C[1]-${value1}!\\C[0]`;
                };
                arr2.push(value10);
            };
        };
    }, this);

    //破損率等
    if (user.isLearnedSkill(61)) {
        var value10 = 10;
        if (user.isLearnedSkill(62)) { value10 += 10 };
        if (user.isLearnedSkill(63)) { value10 += 10 };
        if (user.isLearnedSkill(64)) { value10 += 10 };
        if (user.isLearnedSkill(65)) { value10 += 10 };
        if (user.isLearnedSkill(66)) { value10 += 10 };
        if (user.isLearnedSkill(67)) { value10 += 10 };
        if (user.isLearnedSkill(68)) { value10 += 10 };
        if (user.isLearnedSkill(69)) { value10 += 10 };
        if (user.isLearnedSkill(70)) { value10 += 10 };
        user.actor().traits.push({ code: 13, dataId: 62, value: 1 + value10 });
        user.actor().traits.push({ code: 13, dataId: 63, value: 1 + value10 });
    };

    if ($gameSwitches.value(375) && value11 >= 1) {
        for (var j = 0; j <= arr2.length - 1; j++) {
            //BattleManager._logWindow.push(`addText`, arr2[j]);
            valueGetInfoPointX = 900;
            CommonPopupManager.showInfo({}, arr2[j], null);
            //user.startMessagePopup(arr2[j], arr3);
        };
        valueGetInfoPointX = 0;
    };

};

//戦闘中に変動するステート特徴設定<traitBase1:21,0,1.5>traitBattle_changeSetting(user,stateId,0);
//ステート耐性。id3が0で基本特殊,1で基本,2で特殊でそれぞれ指定
traitBattle_changeSetting = function (user, id1, id6) {

    if (id6 != 0) {
        var valueItems = $dataStates[id1];
        valueItems.traits = [];
        var value2 = 0;
        for (var i = 1; i <= 9; i++) {
            if (valueItems.meta['traitBase' + i]) {
                var id2 = Number(valueItems.meta['traitBase' + i].split(',')[0]);
                var id3 = Number(valueItems.meta['traitBase' + i].split(',')[1]);
                var id4 = Math.round(Number(valueItems.meta['traitBase' + i].split(',')[2]) * id6);
                var value1 = `:`;
                var value4 = id4;
                if (id4 <= -0.01) { var value4 = id4 - id4 - id4 };
                if (id2 == 11) {
                    valueItems.traits.push({ code: id2, dataId: id3, value: 1 + id4 });
                    if ([10, 11, 12, 15, 20, 38, 39, 40, 41].some(function (id5) { return id5 == id3 })) {
                        if (id4 >= 0.01) {
                            var value3 = `\\C[2]+`;
                        } else {
                            var value3 = `\\C[1]-`;
                        };
                        if (id3 == 11) {
                            value1 += `\\C[16][${$dataSystem.elements[id3]}${value3}${value4 * 10}%]\\C[0]`;
                        } else {
                            value1 += `\\C[16][${$dataSystem.elements[id3]}${value3}${value4 * 100}%]\\C[0]`;
                        };
                    } else {
                        if (id4 >= 0.01) {
                            var value3 = `\\C[1]-`;
                        } else {
                            var value3 = `\\C[2]+`;
                        };
                        value1 += `\\C[16][${$dataSystem.elements[id3]}${value3}${(value) * 100}%耐性]\\C[0]`;
                    };
                };
                if (id2 == 13) {
                    if (id4 >= 0.01) {
                        var value3 = `\\C[1]-`;
                    } else {
                        var value3 = `\\C[2]+`;
                    };
                    for (var j = 1; j <= $dataStates.length - 1; j++) {
                        if (id3 == 0 || id3 == 1) {
                            if ($dataStates[j].meta[' StateabNomal']) {
                                valueItems.traits.push({ code: id2, dataId: j, value: 1 + id4 });
                            };
                        };
                        if (id3 == 0 || id3 == 2) {
                            if ($dataStates[j].meta[' StateSPabNomal']) {
                                valueItems.traits.push({ code: id2, dataId: j, value: 1 + id4 });
                            };
                        };
                        if (id3 == 0) {
                            if ($dataStates[j].meta[' StateUnique']) {
                                valueItems.traits.push({ code: id2, dataId: j, value: 1 + id4 });
                            };
                        };
                    };
                    if (id3 == 0) { value1 += `\\C[16][基本特殊固有状態異常耐性${value3}${value4 * 100}]\\C[0]` };
                    if (id3 == 1) { value1 += `\\C[16][基本状態異常耐性${value3}${value4 * 100}]\\C[0]` };
                    if (id3 == 2) { value1 += `\\C[16][特殊状態異常耐性${value3}${value4 * 100}]\\C[0]` };
                };
                if (id2 == 14) {
                    for (var j = 1; j <= $dataStates.length - 1; j++) {
                        if (id3 == 0 || id3 == 1) {
                            if ($dataStates[j].meta[' StateabNomal']) {
                                valueItems.traits.push({ code: id2, dataId: j, value: 0.1 });
                            };
                        };
                        if (id3 == 0 || id3 == 2) {
                            if ($dataStates[j].meta[' StateSPabNomal']) {
                                valueItems.traits.push({ code: id2, dataId: j, value: 0.1 });
                            };
                        };
                        if (id3 == 0) {
                            if ($dataStates[j].meta[' StateUnique']) {
                                valueItems.traits.push({ code: id2, dataId: j, value: 0.1 });
                            };
                        };
                    };
                    if (id3 == 0) { value1 += `\\C[16][基本特殊固有状態異常無効]\\C[0]` };
                    if (id3 == 1) { value1 += `\\C[16][基本状態異常耐性無効]\\C[0]` };
                    if (id3 == 2) { value1 += `\\C[16][特殊状態異常耐性無効]\\C[0]` };
                };
                if (id2 == 21) {
                    if (id4 >= 0.01) {
                        var value3 = `\\C[2]+`;
                    } else {
                        var value3 = `\\C[1]-`;
                    };
                    valueItems.traits.push({ code: id2, dataId: id3, value: 1 + id4 });
                    value1 += `\\C[16][${TextManager.param(id3)}${value3}${value4 * 100}%]\\C[0]`;
                };
                if (id2 == 22) {
                    if (id4 >= 0.01) {
                        var value3 = `\\C[2]+`;
                    } else {
                        var value3 = `\\C[1]-`;
                    };
                    valueItems.traits.push({ code: id2, dataId: id3, value: id4 });
                    value1 += `\\C[16][${FTKR.CSS.cssStatus.xparam[id3]}${value3}${value4 * 100}%]\\C[0]`;
                };
                if (id2 == 23) {
                    if (id4 >= 0.01) {
                        var value3 = `\\C[2]+`;
                    } else {
                        var value3 = `\\C[1]-`;
                    };
                    valueItems.traits.push({ code: id2, dataId: id3, value: 1 + id4 });
                    value1 += `\\C[16][${FTKR.CSS.cssStatus.sparam[id3]}${value3}${value4 * 100}%]\\C[0]`;
                };
                value2 += 1;
                if (value2 >= 3) { value1 += `\n` };
            };
        };
        if (valueItems.meta['Help Description']) {
            if (valueItems.meta['DescriptionWord']) {
                var value1 = `[${valueItems.meta['DescriptionWord']}]${value1}`;
            };
            if (valueItems.meta['Category']) {
                if (valueItems.meta['Category'] == ' InvalidDispel') {
                    value1 += `[${$dataStates[201].description}]`;
                };
                if (valueItems.meta['Category'] == ' PowerUp') {
                    value1 += `[${$dataStates[202].description}]`;
                };
                if (valueItems.meta['Category'] == ' StateSPabNomal') {
                    value1 += `[${$dataStates[30].description}]`;
                };
                if (valueItems.meta['Category'] == ' StateUnique') {
                    value1 += `[${$dataStates[40].description}]`;
                };
            };
            valueItems.description = value1;
        };
        user.refresh();
    };

};

//エネミーに様々なセッティング
enemy_battleSetting = function (id10) {

    var enemy = $gameTroop.members()[id10];
    var enemy1 = enemy._enemyId;
    if ($gameSwitches.value(426)) {
        var value = $dataEnemies[$gameTroop.members()[0]._enemyId];
    } else {
        var value = $dataItems[$gameVariables.value(240)];
    };
    if (value.meta['EnemyLV']) {
        var array = value.meta['EnemyLV'].split(',');
    } else {
        var array = [1, 1];
    };
    if (value.meta['EnemyElement']) {
        var arr1 = value.meta['EnemyElement'].split(',');
    } else {
        var arr1 = [0, 0];
    };
    var value1 = Number(array[Math.floor(Math.random() * array.length)]);

    if (enemy1 == 30) {
        if (value.meta['BossLV']) {
            var value1 = Number(value.meta['BossLV']);
        };
        if (value1 >= 30) {
            enemy.addState(310);//属性の極み
        };
    };
    if (value1 >= 1) {
        if (enemy1 == 30) {
            if (valueBossAddLevel >= 1) {
                value1 += valueBossAddLevel;
            };
            if ($gameSwitches.value(426)) {
                value1 += $gameVariables.value(304)[valueBossEnemyId] * 10;
            } else {
                value1 += $gameVariables.value(305)[$gameVariables.value(240)] * 5;
            };
        } else {
            if ($gameVariables.value(232) >= 2) {
                var value2 = Math.floor(Math.random() * $gameVariables.value(232));
                value1 += value2;
                if (value1 >= 11) {
                    var value2 = Math.floor(Math.random() * 101);
                    if (value1 >= value2) {
                        value1 += 1;
                    };
                };
            };
        };
        if (valueEnemyAddLevel >= 1) {
            value1 += valueEnemyAddLevel;
        };
        if ($gameVariables.value(240) >= 1) {
            value1 += $gameVariables.value(257)[$gameVariables.value(240)];
        };
        var value1 = Math.round(value1);
        enemy.changeLevel(value1);
    };
    if (value.meta['EnemyLV']) {
        if (Number(value.meta['EnemyLV']) == 0) {
            var value1 = $gameActors.actor($gameVariables.value(2)).level;
            enemy.changeLevel(value1);
        };
    }
    if ($gameVariables.value(350) != 0) {
        for (var i = 0; i <= $gameVariables.value(350).length - 1; i++) {
            if ($gameVariables.value(350)[i] == 885) {
                var value3 = 11;
                if (value1 >= 30 && value1 <= 60) { var value3 = 21 };
                if (value1 >= 61) { var value3 = 31 };
                var value2 = Math.floor(Math.random() * value3) + 885;
                enemy.addState(value2);
            } else {
                enemy.addState($gameVariables.value(350)[i]);
            };
        };
    };
    var value2 = Number(arr1[Math.floor(Math.random() * arr1.length)]);
    if (enemy1 == 30) {
        if (value.meta['BossElement']) {
            var value2 = Number(value.meta['BossElement'])
        };
    };
    if (value2 == 0) { } else {
        if ($dataEnemies[enemy1].meta['defaultState']) {
            if (Number($dataEnemies[enemy1].meta['defaultState']) != value2) {
                enemy.removeState(Number($dataEnemies[enemy1].meta['defaultState']));
            };
        }
        enemy.addState(value2);
    };
    if (enemy1 <= 29) {
        var arr2 = $gameVariables.value(345)[enemy1 - 20];
        for (var j = 0; j <= arr2.length - 1; j++) {
            enemy.addState(arr2[j]);
        };
    };
    if (enemy1 == 30 && $gameVariables.value(343) != 0) {//ボスステート処理
        var arr2 = $gameVariables.value(343);
        for (var j = 0; j <= arr2.length - 1; j++) {
            enemy.addState(arr2[j]);
        };
        if (value.meta['BossDrop1']) {
            for (var j = 1; j <= 9; j++) {
                if (value.meta['BossDrop' + j]) {
                    var arr2 = value.meta['BossDrop' + j].split(',');
                    if (Number(arr2[0]) == 0) { valueItems = $dataItems };
                    if (Number(arr2[0]) == 1) { valueItems = $dataWeapons };
                    if (Number(arr2[0]) == 2) { valueItems = $dataArmors };
                    if (Number(arr2[2]) >= Math.floor(Math.random() * 101)) {
                        $gameTroop.addDropItem(valueItems[Number(arr2[1])]);
                    };
                }
            }
        };
    };
    if ($dataEnemies[enemy1].meta['Man'] || $dataEnemies[enemy1].meta['Woman']) {
        if ($dataEnemies[enemy1].meta['Man']) { enemy.addState(459) };
        if ($dataEnemies[enemy1].meta['Woman']) { enemy.addState(460) };
    } else {
        if (!$dataEnemies[enemy1].meta['Nonsexual']) {
            if (!$gameSwitches.value(370) && Math.floor(Math.random() * 11) == 7) {
                enemy.addState(460);//雌
            } else {
                enemy.addState(459);//雄
            };
        };
    };
    if (enemy.level >= 60 && !enemy.isStateAffected(436)) {//人種以外
        enemy.addState(406);//魔性心威
    };
    if (enemy1 != 30) {
        if (enemy.level >= 40 && $gameTroop.aliveMembers().length == 1) {
            enemy.addState(475);//孤高
        };
    };
    /*://パッシブオーラで実行
    if(enemy.isStateAffected(443)){//指揮官
      for (var j = 0; j <= $gameTroop.members().length-1; j++) {
        var enemy2 = $gameTroop.members()[j];
        if(!enemy2.isStateAffected(443) && enemy2.isStateAffected(441)){
          enemy2.addState(444);//揮下戦士
        };
        if(!enemy2.isStateAffected(443) && enemy2.isStateAffected(442)){
          enemy2.addState(445);//揮下魔導士
    }}};
    if(enemy.isStateAffected(446)){//将器
      for (var j = 0; j <= $gameTroop.members().length-1; j++) {
        var enemy2 = $gameTroop.members()[j];
        var value1 = enemy._enemyId;
        var value2 = enemy2._enemyId;
        if(!enemy2.isStateAffected(446) && Number(dataEnemies[value1].meta['Passive State']) == Number(dataEnemies[value2].meta['Passive State'])){
          enemy2.addState(447);//将軍号令
    }}};
    if(enemy.isStateAffected(448)){//王権
      for (var j = 0; j <= $gameTroop.members().length-1; j++) {
        var enemy2 = $gameTroop.members()[j];
        var value1 = enemy._enemyId;
        var value2 = enemy2._enemyId;
        if(!enemy2.isStateAffected(448)){
          if(Number(dataEnemies[value1].meta['Passive State']) == Number(dataEnemies[value2].meta['Passive State'])){
            enemy2.addState(449);//王卒兵
          } else {
            enemy2.addState(450);//魔軍兵
    }}}};
    */
    if (enemy.isStateAffected(455)) {//捕食者
        enemy.appear();//非捕食者は常に出現させる。
        for (var j = 0; j <= $gameTroop.members().length - 1; j++) {
            var enemy2 = $gameTroop.members()[j];
            if (!enemy2.isStateAffected(455)) {
                if (enemy.level + 10 >= enemy2.level) {
                    enemy2.addState(456);//被捕食者
                };
            };
        };
        for (var j = 0; j <= $gameParty.battleMembers().length - 1; j++) {
            var actor = $gameParty.battleMembers()[j];
            if (!actor.isStateAffected(455)) {
                if (enemy.level + 10 >= actor.level) {
                    actor.addState(456);//被捕食者
                }
            }
        };
    };
    if (enemy1 == 30 && $gameVariables.value(628) != 0) {//ボス確定ドロップ
        for (var j = 0; j <= $gameVariables.value(628).length - 1; j++) {
            if ($gameVariables.value(628)[j] >= 1) {
                var value11 = $gameVariables.value(628)[j];
                $gameTroop.addDropItem($dataItems[value11]);
            }
        }
    };
    for (var j = 0; j <= valueStateGetItems.length - 1; j++) {
        if (enemy.isStateAffected(valueStateGetItems[j])) {
            var value11 = Number($dataStates[valueStateGetItems[j]].meta['SubjugationPointItem']);
            $gameTroop.addDropItem($dataItems[value11]);
        }
    };
    var value11 = 1;
    var arr4 = valueStateEnemyExpRate;
    for (var j = 0; j <= arr4.length - 1; j++) {
        if (enemy.isStateAffected(arr4[j]) && enemy.isAlive()) {
            if ($dataStates[arr4[j]].meta['EnemyExpRate']) {
                valueTotalexp += Number($dataStates[arr4[j]].meta['EnemyExpRate']);
            };
        };
    };
    var value11 = 1;
    var arr4 = valueStateEnemyGoldRate;
    for (var j = 0; j <= arr4.length - 1; j++) {
        if (enemy.isStateAffected(arr4[j]) && enemy.isAlive()) {
            if ($dataStates[arr4[j]].meta['EnemyGoldRate']) {
                valueTotalgold += Number($dataStates[arr4[j]].meta['EnemyGoldRate']);
            };
        };
    };
    var value11 = enemy.level;
    var value14 = Math.floor(Math.random() * 4);
    if (value14 >= 1) {
        for (var j = 1; j <= value14; j++) {
            drop_probabilityCalculation(value11);
            if (value13 >= 90) {
                var arr6 = [];
                drop_genericDropRate(0, arr6);
                $gameTroop.addDropItem($dataItems[valueDropItems]);
            };
        };
    };
    var value11 = enemy.level;
    drop_probabilityCalculation(value11);
    if (value13 >= 90) {
        var value14 = 0;
        var list = valueClassStateA;
        list.forEach(function (id11) {
            if (enemy.isStateAffected(id11)) { var value14 = id11 };
        }, this);
        if (value14 >= 1) {
            valueClassState = $dataStates[value14].meta['classStateDrop'].split(',');
            valueEnemyLevel = enemy.level;
            drop_JobStateWAget(1, 10);
            drop_JobStateWAget(2, 10);
        };
    };
    if (enemy.level >= valueMaxEnemyLv) {
        valueMaxEnemyLv = enemy.level;
    }

};

//エネミー簡易討伐
enemy_instantwin = function () {

    var actor1 = $gameActors.actor(20);
    var value = $dataItems[$gameVariables.value(240)];
    var value2 = 0;
    var value3 = 0;
    var value4 = 0.5;//rate
    var value5 = 20;//flat
    var value6 = 0.6;
    var value7 = 10;
    valueWordSet1 = ``;
    valueWordSet3 = ``;
    var arr1 = value.meta['EnemyLV'].split(',');
    var arr2 = value.meta['BattleEnemyPopC'].split(',');
    var arr3 = $gameVariables.value(220);
    actor1_setup1(value, arr1[Math.floor(Math.random() * arr1.length)]);
    //特殊ステート対応討伐カウント
    if ($gameVariables.value(350) != 0) {
        for (var i = 0; i <= $gameVariables.value(350).length - 1; i++) {
            for (var j = 1; j <= valueSubjugationPoint.length - 1; j++) {//討伐数カウント
                if ($gameVariables.value(350)[i] == valueSubjugationPoint[j]) {
                    //$gameVariables.value(52)[valueSubjugationPoint[j]] += 1;
                    //var value1 = `\x1bSIM[${valueSubjugationPoint[j]}]：討伐数\\C[10]+1\\C[0]`;
                    //CommonPopupManager.showInfo({},value1,null);
                };
            };
        };
    };
    //パッシブステート対応ドロップPopEnemy1
    for (var i = 1; i <= 9; i++) {
        if (value.meta['PopEnemy' + i]) {
            var arr5 = value.meta['PopEnemy' + i].split(',');
            var arr6 = $dataEnemies[Number(arr5[0])].meta['Passive State'].split(',');
            for (var j = 0; j <= arr6.length - 1; j++) {
                if ($dataStates[Number(arr6[j])].meta['SubjugationPoint']) {
                    //$gameVariables.value(52)[Number(arr6[j])] += 1;
                    //var value1 = `\x1bSIM[${Number(arr6[j])}]：討伐数\\C[10]+1\\C[0]`;
                    //CommonPopupManager.showInfo({},value1,null);
                };
            };
        };
    };
    arr4 = [];
    var start = 1;
    var end = Number(arr2[Math.floor(Math.random() * arr2.length)]);
    for (var i = start; i <= end; i++) {
        var value1 = Number(arr1[Math.floor(Math.random() * arr1.length)]);
        if (value1 == 0) { var value1 = 1 };

        var value8 = Number(arr3[Math.floor(Math.random() * arr3.length)]);
        value2 += Math.round($dataEnemies[value8].exp * (1 + (value1 - 1) * value4) + (value5 * (value1 - 1)));
        value3 += Math.round($dataEnemies[value8].gold * (1 + (value1 - 1) * value6) + (value7 * (value1 - 1)));
        enemy_dropSelection(actor1);
        drop_probabilityCalculation(value1);
        if (value13 < 90) continue;

        drop_enemyDropRate(0, arr4);//計算のみ。計算結果はarr4に蓄積。
        drop_genericDropRate(0, arr4);//valueDropItemsに格納
        var item = $dataItems[valueDropItems];
        var value1 = `\\C[24]\x1bI[${item.iconIndex}]${item.name}\\C[0]を獲得した。\n`;
        valueWordSet1 += `${value1}`;
        $gameSystem.pushInfoLog(value1);
        $gameParty.gainItem(item, 1);
    };

    var value1 = `\\C[2]BattleResult!\\C[0]\n経験値\\C[10]${value2}\\C[0]、\\C[14]${value3}\\C[0]\\Gを入手！ JPを1獲得した。`;
    $gameSystem.pushInfoLog(value1);
    valueWordSet2 = `${value1}\n`;
    //CommonPopupManager.showInfo({},value1,null);
    $gameParty.battleMembers().forEach(function (actor) {
        actor.changeExp(actor.currentExp() + value2, false);
        if (actor.subclass()) { actor.gainExpSubclass(value2) };
    });
    $gameParty.gainGold(value3);
    var value1 = 0;
    var value2 = 0;
    for (var i = 0; i <= valueWordSet1.length - 1; i++) {
        if (valueWordSet1.charAt(i) == `\n`) {
            value1 += 1;
        };
    };
    for (var i = 0; i <= valueWordSet3.length - 1; i++) {
        if (valueWordSet3.charAt(i) == `\n`) {
            value2 += 1;
        };
    };
    if (value1 + value2 <= 6) {
        $gameVariables.setValue(701, `${valueWordSet2}${valueWordSet1}${valueWordSet3}`);
    } else {
        $gameVariables.setValue(701, `${valueWordSet2}`);
        if (value1 >= 1) {
            $gameVariables.setValue(701, $gameVariables.value(701) + `ドロップ(\\C[2]+${value1}\\C[0])\n`);
        };
        if (value2 >= 1) {
            $gameVariables.setValue(701, $gameVariables.value(701) + `討伐カウント(\\C[2]+${value2}\\C[0])`);
        };
    };

};

//ドロップするかどうかの確率計算
drop_probabilityCalculation = function (value11) {

    value13 = Math.floor(Math.random() * 101);
    value13 += Math.round(value11 / 10);
    if ($gameVariables.value(54) == 1) { value13 += 5 };//パーティが一人の場合確率アップ
    if ($gameVariables.value(516) >= 100) { value13 += 1 };
    if ($gameVariables.value(516) >= 300) { value13 += 1 };
    if ($gameVariables.value(516) >= 500) { value13 += 1 };
    if ($gameVariables.value(516) >= 1000) { value13 += 1 };
    if ($gameParty.hasItem($dataItems[valueItemDropUpItem])) { value13 += 1 };
    if ($gameParty.membersState(296)) { value13 += 1 };
    if ($gameParty.membersState(297)) { value13 += 1 };
    if ($gameParty.membersState(298)) { value13 += 1 };

};

//ドロップするかどうかの確率計算2
drop_probabilityCalculation2 = function (user, id1) {

    valueDropCount1 = 0;
    var id2 = id1 * 20;
    if (id2 == 0) { var id2 = 999 };//0はレベル制限しない汎用ドロップ
    if (id2 >= 51) { var id2 = 999 };//レアリティが6以上なら制限なし
    var value14 = true;//id2 > valueDropEnemyLevel;//高レベルでドロップ制限はなし
    if (id1 >= 5) {
        if (id1 == 5) { var id2 = 20 };
        if (id1 == 6) { var id2 = 20 };
        if (id1 == 7) { var id2 = 30 };
        if (id1 == 8) { var id2 = 40 };
        if (id1 == 9) { var id2 = 50 };
        if (id1 >= 10) { var id2 = 50 };
        var value15 = id2 < valueDropEnemyLevel;
    } else {
        var value15 = true;
    };
    if (value14 && value15) {
        var value13 = Math.floor(Math.random() * 100) + 1;
        if (id1 == 0) { var value11 = 5 };
        if (id1 == 1) { var value11 = 10 }; if (id1 == 2) { var value11 = 9 }; if (id1 == 3) { var value11 = 8 };
        if (id1 == 4) { var value11 = 7 }; if (id1 == 5) { var value11 = 6 }; if (id1 == 6) { var value11 = 5 };
        if (id1 == 7) { var value11 = 4 }; if (id1 == 8) { var value11 = 3 }; if (id1 == 9) { var value11 = 2 };
        if (id1 == 10) { var value11 = 1 };
        var value12 = value11 / 3;
        value11 += value12 + (valueDropEnemyLevel / 10);
        if ($gameTroop.turnCount() <= 1) { value11 += value12 * 3 };
        if ($gameVariables.value(54) == 1) { value11 += value12 * 5 };//パーティが一人の場合確率アップ
        if ($gameVariables.value(516) >= 100) { value11 += value12 };
        if ($gameVariables.value(516) >= 300) { value11 += value12 };
        if ($gameVariables.value(516) >= 500) { value11 += value12 };
        if ($gameVariables.value(516) >= 1000) { value11 += value12 };
        if ($gameVariables.value(516) >= 1500) { value11 += value12 };
        if ($gameVariables.value(516) >= 2000) { value11 += value12 };
        if ($gameParty.hasItem($dataItems[valueItemDropUpItem])) { value11 += value12 * 3 };
        if ($gameParty.membersState(296)) { value11 += value12 * 2 };
        if ($gameParty.membersState(297)) { value11 += value12 * 2 };
        if ($gameParty.membersState(298)) { value11 += value12 * 2 };
        if (user.isStateAffected(186)) {
            if (user._stateCounter[186] >= 1) {
                value11 += value12 * user._stateCounter[186];
            };
        };
        if (value11 >= value13) { valueDropCount1 += 1 };
    };

};

//採取物の設定
harvesting_itemSelect = function () {

    var arr4 = [];
    var value1 = 0;
    drop_genericDropRate(1, arr4);
    $gameVariables.setValue(23, valueDropItems);
    if (valueDropItems == 0) {
        $gameVariables.setValue(23, 1191);//1191は石ころ
    };

};

//汎用財布ドロップ設定
drop_walletItemBoxGet = function (value12, id12) {

    var value3 = valueFootpadSkillId;
    var arr12 = [];
    var actor = $gameActors.actor($gameVariables.value(11));
    var value11 = 100;
    drop_probabilityCalculation(value11);

    if (actor.isLearnedSkill(value3) && actor.skillMasteryLevel(value3) >= 1) {
        value13 += actor.skillMasteryLevel(value3) * 3;
    };
    if (value13 < 90) return;

    if ($gameVariables.value(240) >= 1) {
        var value = $dataItems[$gameVariables.value(240)];
        if (value.meta.GenericDropRate) {
            var arr11 = value.meta.GenericDropRate.split(',');//直下のエネミー簡易討伐と採取物の設定で計算式同一
            var value11 = Number(arr11[Math.floor(Math.random() * arr11.length)]);
        } else {
            var value11 = 1;
        };
    } else {
        var value11 = value12;
    };

    var dataItemsLength = $dataItems.length;
    var type = id12 == 1 ? 'walletIn' : 'ItemBag';
    for (var i = 1; i < dataItemsLength; i++) {
        var dataItemsI = dataItems[i];
        if (!dataItemsI.meta[type]) continue;

        var list = dataItemsI.meta['DropRate'].split(',');
        list.forEach(function (id11) {
            if (id11 === value11) arr12.push(i);
        }, this);
    };

    var value2 = Math.floor(Math.random() * 3) + 1;
    var arr12Length = arr12.length;
    for (var i = 1; i <= value2; i++) {
        var value1 = Number(arr12[Math.floor(Math.random() * arr12Length)]);
        var item = $dataItems[value1];
        CommonPopupManager.showInfo({}, `\\C[24]\x1bI[${item.iconIndex}]${item.name}\\C[0]を獲得した。`, null);
        $gameParty.gainItem(item, 1);
    };
};

//汎用ドロップ設定
drop_genericDropRate = function (value12, arr12) {
    var value11 = 1;
    if ($gameVariables.value(240) >= 1) {
        var value = $dataItems[$gameVariables.value(240)];
        var valueMetaGenericDropRate = value.meta.GenericDropRate;
        if (valueMetaGenericDropRate) {
            var arr11 = valueMetaGenericDropRate.split(',');//直下のエネミー簡易討伐と採取物の設定で計算式同一
            value11 = Number(arr11[Math.floor(Math.random() * arr11.length)]);
        }
    }

    var valueItemDropRate1Length = valueItemDropRate1.length;
    for (var i = 0; i < valueItemDropRate1Length; i++) {
        var value14 = valueItemDropRate1[i];
        var value13 = value12 == 0 ? !$dataItems[value14].meta['NoBattleDrop'] : $gameSwitches.value(2);
        if (!value13) continue;

        var itemDropRate = $dataItems[value14].meta['DropRate'];
        if (!itemDropRate) continue;

        var value15 = 1;
        var itemDropLottery = $dataItems[value14].meta['DropLottery'];
        var list = $dataItems[value14].meta['DropRate'].split(',');
        list.forEach(function (id11) {
            if (id11 === value11) {
                if (itemDropLottery) value15 = Number(itemDropLottery);

                for (var j = 1; j <= value15; j++) {
                    arr12.push(value14);
                };
            }
        }, this);
    };
    valueDropItems = Number(arr12[Math.floor(Math.random() * arr12.length)]);
};

//汎用ドロップエネミー対象設定ダンジョンのみ。計算のみ計算結果はarr4に蓄積。簡易討伐時
drop_enemyDropRate = function (value12, arr4) {

    var value = $dataItems[$gameVariables.value(240)];
    var arrdrop1 = value.meta['EnemyLV'].split(',');
    var arrdrop3 = $gameVariables.value(220);
    var value11 = Number(arrdrop1[Math.floor(Math.random() * arrdrop1.length)]);
    var value18 = Number(arrdrop3[Math.floor(Math.random() * arrdrop3.length)]);

    var dataItemsLength = $dataItems.length;
    for (var i = 1; i < dataItemsLength; i++) {
        if (!$dataEnemies[value18].meta['Conditional Item ' + i + ' Drop']) continue;

        var dataItemsI = $dataItems[i];
        if (!dataItemsI.meta['LotteryRearity']) continue;

        var value19 = Number(dataItemsI.meta['LotteryRearity']);
        var value20 = 1; // 1,2
        if (value19 < 3) { }
        else if (value19 == 3) { value20 = 10 }
        else if (value19 == 4) { value20 = 20 }
        else if (value19 == 5) { value20 = 30 }
        else if (value19 == 6) { value20 = 30 }
        else if (value19 == 7) { value20 = 40 }
        else if (value19 == 8) { value20 = 40 }
        else if (value19 > 8) { value20 = 50 } // 9, 10

        if (value11 >= value20) { arr4.push(i); };
    };
};

//ジョブステートエネミーorジョブ持ち追いはぎスクリプト
//drop_JobStateWAget(1,10);//1武器2防具ダンジョン外の場合の想定レベル
drop_JobStateWAget = function (id11, value10) {

    var arr4 = [0];
    var isInBattle = $gameParty.inBattle();
    if (!isInBattle) {
        var valueClassState = 0;
        if ($gameMap.event(valueEnemyEventId).event().meta['classStateDrop']) {
            var valueClassState = $gameMap.event(valueEnemyEventId).event().meta['classStateDrop'].split(',');//<classStateDrop:1,7,13>
            if ($gameVariables.value(240) == 0) {
                var valueEnemyLevel = 30;//value10
            } else {
                var value = $dataItems[$gameVariables.value(240)];
                var arr1 = value.meta['EnemyLV'].split(',');
                var valueEnemyLevel = Number(arr1[Math.floor(Math.random() * arr1.length)]);
            };
        };
    };

    if (valueClassState === 0) return;

    var value11 = Number(valueClassState[0]);//使ってない＿？
    var value14 = Math.round(valueEnemyLevel / 10);
    if (value14 == 0) { value14 = 1 }
    else if (value14 >= 11) { value14 = 10 };

    var end = id11 == 2 ? valueArmorsLength : $dataWeapons.length - 1;
    var valueItems = id11 == 2 ? $dataArmors : $dataWeapons;
    var value12 = Number(id11 == 2 ? valueClassState[2] : valueClassState[1]);

    var start = 1;
    for (var i = start; i <= end; i++) {
        var item = valueItems[i];
        if (item.meta['GatchaOutOfRange']) continue;

        var itemLotteryRearity = item.meta['LotteryRearity'];
        if (!itemLotteryRearity) continue;

        var valueTypeId = id11 == 2 ? item.atypeId : item.wtypeId;
        if (value12 == valueTypeId && value14 >= Number(itemLotteryRearity)) {
            arr4.push(i);
        };
    };

    var value15 = Number(arr4[Math.floor(Math.random() * arr4.length)]);
    if (value15 === 0) return;

    if (isInBattle) {
        $gameTroop.addDropItem(valueItems[value15]);
    } else {
        CommonPopupManager.showInfo({}, `\\C[24]\x1bI[${valueItems[value15].iconIndex}]${valueItems[value15].name}\\C[0]を獲得した。`, null);
        $gameParty.gainItem(valueItems[value15], 1);
    };
};

//追いはぎ時の確率と武器防具入手
footpad_probabilityUp = function (id1) {

    var value2 = 10;
    var value1 = value2;

    if ($gameVariables.value(240) >= 1) {
        var value = $dataItems[$gameVariables.value(240)];
        var arr1 = value.meta['EnemyLV'].split(',');
        value1 = Number(arr1[Math.floor(Math.random() * arr1.length)]);
    };

    drop_probabilityCalculation(value1);

    var actor = $gameActors.actor($gameVariables.value(11));
    var value3 = valueFootpadSkillId;//追剥スキルID
    if (actor.isLearnedSkill(value3) && actor.skillMasteryLevel(value3) >= 1) {
        value13 += actor.skillMasteryLevel(value3) * 3;
    };
    if (value13 >= 90) {
        drop_JobStateWAget(id1, value1);
    };
};

//アイテムボックス開封
item_itemBoxOpen = function (a, b, itemId) {

    if (b.actorId() == a.actorId()) {
        if ($gameSwitches.value(115)) {
            $gameSwitches.setValue(115, false)
            WindowManager.hide(0);
        } else {
            $gameSwitches.setValue(115, true);
            $gameParty.loseItem($dataItems[itemId], 1);

            valueItemBoxOpen = `${$dataItems[itemId].name}の内訳（もう一度使用でウィンドウ閉じる）\n`;
            var value17 = 0;
            var value18 = 0;
            var value20 = !$dataItems[itemId].meta['SeiyokuItem'];
            var arr1 = [0, 0, 0, 1, 0, 0, 2, 0];


            var arr2 = $dataItems[itemId].meta['ItemBag'].split(',');
            var id2 = arr2[Math.floor(Math.random() * arr2.length)];
            for (var id3 = 0; id3 <= id2; id3++) {
                var id12 = arr1[Math.floor(Math.random() * arr1.length)];
                if (id12 == 0) { valueItems = $dataItems }
                else if (id12 == 1) { valueItems = $dataWeapons }
                else if (id12 == 2) { valueItems = $dataArmors };

                if ($dataItems[itemId].meta['HentaiBox']) {
                    valueItems = $dataItems;
                    var value20 = $dataItems[itemId].meta['SeiyokuItem'];
                };

                var end = valueItems == $dataArmors ? valueArmorsLength : valueItems.length - 1;
                var arr12 = [0];
                for (var i = 1; i <= end; i++) {
                    var value19 = 0;
                    var item = valueItems[i];
                    if (item.meta['GatchaOutOfRange']) {
                        value19 += 1;
                    };
                    if (item.meta['Max Item']) {
                        if (Number(item.meta['Max Item']) == 1 && $gameParty.hasItem(item)) {
                            value19 += 1;
                        };
                    };
                    if (value19 == 0) {
                        if ($dataItems[itemId].meta['HentaiBox']) {
                            var value20 = $dataItems[i].meta['SeiyokuItem'];
                        };
                        if (item.meta['LotteryRearity'] && value20) {
                            var value11 = Number(item.meta['LotteryRearity']);
                            var list = $dataItems[itemId].meta['ItemBagRearity'].split(',');
                            list.forEach(function (id11) {
                                if (id11 === value11) {
                                    for (var j = 10; j >= value11; j--) {
                                        arr12.push(i);
                                    };
                                };
                            }, this);
                        };
                    };
                };
                valueDropItems = Number(arr12[Math.floor(Math.random() * arr12.length)]);
                if (valueDropItems >= 1) {
                    var dropItem = valueItems[valueDropItems];
                    var value16 = 1;
                    if (id12 == 0) {
                        if (dropItem.price <= 1000) { var value16 = Math.floor(Math.random() * 6) + 1 };
                        if (dropItem.price <= 10000) { var value16 = Math.floor(Math.random() * 3) + 1 };
                        if (dropItem.price == 0) { var value16 = 1 };
                    };
                    $gameParty.gainItem(dropItem, value16);
                    valueItemBoxOpen += `[\x1bI[${dropItem.iconIndex}]${dropItem.name}×${value16}]`;
                    value17 += 1;
                    if ((value17 % 3) == 0) { valueItemBoxOpen += `\n` };
                };
            };
            WindowManager.show(0, 0, 0, 1280, 290);
            WindowManager.drawText(0, value17 == 0 ? `${valueItemBoxOpen}中身は空だった…。` : `${valueItemBoxOpen}`);
        };
    };

};

//アクターステートに応じて経験値Ｇレート設定
actor_stateExpGoldRate = function () {

    for (var id = 0; id <= valueStatePartyExpRate.length - 1; id++) {
        if ($gameParty.membersState(valueStatePartyExpRate[id])) {
            if ($dataStates[valueStatePartyExpRate[id]].meta['PartyExpRate']) {
                valueTotalexp += Number($dataStates[valueStatePartyExpRate[id]].meta['PartyExpRate']);
            };
        };
    };
    for (var id = 0; id <= valueStatePartyGoldRate.length - 1; id++) {
        if ($gameParty.membersState(valueStatePartyGoldRate[id])) {
            if ($dataStates[valueStatePartyGoldRate[id]].meta['PartyGoldRate']) {
                valueTotalexp += Number($dataStates[valueStatePartyGoldRate[id]].meta['PartyGoldRate']);
            };
        };
    };

};

//エネミー登場時にse
enemy_battleStartCry = function (user) {

    if (!$gameSwitches.value(157)) {
        var value5 = user._enemyId;
        if ($dataEnemies[value5].meta['EnemyEntrySe']) {
            var value2 = $dataEnemies[value5].meta['EnemyEntrySe'].split(',')[0];
            var value1 = Math.floor(Math.random() * 21) + Number($dataEnemies[value5].meta['EnemyEntrySe'].split(',')[1]);
            var value3 = Math.floor(Math.random() * 11) + Number($dataEnemies[value5].meta['EnemyEntrySe'].split(',')[2]);
            var value4 = Math.floor(Math.random() * -101);
            AudioManager.playSe({ "name": value2, "volume": value3, "pitch": value1, "pan": value4 });
            $gameSwitches.setValue(157, true);
        }
    };

};

//ソロコンビ設定
party_SoroCombiAddRemove = function () {

    if ($gameParty.battleMembers().length == 1) {
        $gameParty.battleMembers().forEach(function (actor) {
            actor.addState(203);
            actor.refresh();
        });
    } else {
        $gameParty.members().forEach(function (actor) {
            actor.removeState(203);
            actor.refresh();
        });
    };
    if ($gameParty.battleMembers().length == 2) {
        $gameParty.battleMembers().forEach(function (actor) {
            actor.addState(204);
            actor.refresh();
        });
    } else {
        $gameParty.members().forEach(function (actor) {
            actor.removeState(204);
            actor.refresh();
        });
    };

};

//特殊なステートの時にダメージの計算式をバトルログに出力。
attack_DamageFormula = function (user, target, id1) {
    if (!$gameSwitches.value(141)) return;

    var dataSkill = $dataSkills[id1];
    var formulaData = dataSkill.meta['DamageFormula2'].split(',');
    var coeff1 = Number(formulaData[0]);
    var coeff2 = Number(formulaData[1]);
    var coeff3 = Number(formulaData[2]);

    var damage = Math.max($attack1(coeff1, user, target, coeff2) * coeff3, user.mdf / 10);
    var baseDamageText = `基礎ダメージ値: \\C[10]${damage}\\C[0]`;
    BattleManager._logWindow.push('addText', baseDamageText);

    var attackElements = user.attackElements();
    var multipleElements = dataSkill.meta['Multiple Elements'];
    if (multipleElements) {
        var extraElements = multipleElements.split(',');
        attackElements = attackElements.concat(extraElements);
    }
    var skillElementId = dataSkill.damage.elementId;
    if (skillElementId >= 1) {
        attackElements.push(skillElementId);
    }

    var attribPrefix = `[属性] `;
    var attackElementsLength = attackElements.length;
    var elementInfo = '';
    for (var i = 0; i < attackElementsLength; i++) {
        var elementId = attackElements[i];
        var actorAmplifyRate = Math.round(valueAttackAmplifysActorId[user.actorId()][elementId]);
        actorAmplifyRate += Math.round(user.elementAmplifyRate(elementId) * 100 + 100);
        var elementRate = Math.round(target.elementRate(elementId) * 100);
        elementInfo += attribPrefix;
        amygame_elementIcon(elementId);

        var isValidCondition = actorAmplifyRate !== 100 && elementRate !== 100;
        if (isValidCondition) {
            elementInfo += `\x1bI[${valueElementIconArr[1]}]:${actorAmplifyRate}-${elementRate} `;
        }
    }

    if (elementInfo !== attribPrefix) {
        BattleManager._logWindow.push('addText', elementInfo);
    }

    if (target.result().critical) {
        var criticalMultiplier = user.criticalMultiplierBonus() * 100;
        var criticalInfo = `[会心発生！] 倍率${criticalMultiplier}%`;
        BattleManager._logWindow.push('addText', criticalInfo);
    }

    var variance = dataSkill.damage.variance;
    var varianceText = `[分散値] ${variance}`;
    BattleManager._logWindow.push('addText', varianceText);
};

//ボス行動パターン設定
boss_actionPattarn1 = function (a) {

    var value11 = 0;
    var value4 = 0;
    if (a.tp >= 100) {
        if (a.isStateAffected(416)) {
            var value2 = $gameVariables.value(346)[3];
        } else {
            if (a.meetsSkillConditions($dataSkills[$gameVariables.value(346)[2]])) {
                var value11 = $gameVariables.value(346)[2];
            };
        };
    };
    for (var i = 1; i <= 15; i++) {//$dataSkills[id].tpCost
        if ($gameVariables.value(347)[i] != 0) {
            if ($gameVariables.value(347)[i][0] == 0) {//HPトリガー
                if (a.hpRate() <= $gameVariables.value(347)[i][1] / 100) {
                    if (899 != $gameVariables.value(347)[i][2]) {
                        if (!$gameSwitches.value(470) && $dataSkills[$gameVariables.value(347)[i][2]].tpCost == 100) { a.gainTp(100) };
                        if (a.meetsSkillConditions($dataSkills[$gameVariables.value(347)[i][2]])) {
                            var value11 = $gameVariables.value(347)[i][2];
                            break;
                        };
                    };
                }
            };
            if ($gameVariables.value(347)[i][0] == 1) {//MPトリガー
                if (a.mpRate() <= $gameVariables.value(347)[i][1] / 100) {
                    if (!$gameSwitches.value(470) && $dataSkills[$gameVariables.value(347)[i][2]].tpCost == 100) { a.gainTp(100) };
                    if (a.meetsSkillConditions($dataSkills[$gameVariables.value(347)[i][2]])) {
                        var value11 = $gameVariables.value(347)[i][2];
                        break;
                    };
                }
            };
            if ($gameVariables.value(347)[i][0] == 2) {//ターン
                if (($gameVariables.value(263) % $gameVariables.value(347)[i][1]) == 0) {
                    if (!$gameSwitches.value(470) && $dataSkills[$gameVariables.value(347)[i][2]].tpCost == 100) { a.gainTp(100) };
                    if (a.meetsSkillConditions($dataSkills[$gameVariables.value(347)[i][2]])) {
                        var value11 = $gameVariables.value(347)[i][2];
                        break;
                    };
                }
            };
            if ($gameVariables.value(347)[i][0] == 3) {//オーバードライブなどステートによる変化
                if (a.isStateAffected($gameVariables.value(347)[i][1])) {
                    if (!$gameSwitches.value(470) && $dataSkills[$gameVariables.value(347)[i][2]].tpCost == 100) { a.gainTp(100) };
                    if (a.meetsSkillConditions($dataSkills[$gameVariables.value(347)[i][2]])) {
                        var value11 = $gameVariables.value(347)[i][2];
                        break;
                    };
                }
            };
            if ($gameVariables.value(347)[i][0] == 4) {//ＨＰによる通常攻撃変化
                if (a.hpRate() <= $gameVariables.value(347)[i][1] / 100) {
                    if (a.meetsSkillConditions($dataSkills[$gameVariables.value(347)[i][2]])) {
                        var value4 = $gameVariables.value(347)[i][2];
                        break;
                    };
                }
            };
        };
    };
    var arr1 = [$gameVariables.value(346)[0], $gameVariables.value(346)[3], $gameVariables.value(346)[4], $gameVariables.value(346)[5], $gameVariables.value(346)[6]];
    var value2 = arr1[Math.floor(Math.random() * arr1.length)];
    if (value2 == 0) {
        var value2 = $gameVariables.value(346)[0];
    };
    if (value4 >= 1) {
        var value2 = value4;
    };
    var value3 = value2;
    var value1 = Math.floor(Math.random() * 11);
    if (a.isStateAffected(29) && $dataSkills[$gameVariables.value(346)[0]].meta['Select Conditions']) {
        value1 += 2;//前衛アタック持ちが後衛の時にアビリティ使用確立アップ
    };
    if (value1 >= 5) {
        for (var i = 1; i <= 10; i++) {
            var arr1 = [$gameVariables.value(346)[1], $gameVariables.value(346)[7], $gameVariables.value(346)[8], $gameVariables.value(346)[9]];
            var value2 = arr1[Math.floor(Math.random() * arr1.length)];
            if (value2 == 0) {
                var value2 = $gameVariables.value(346)[1];
            };
            if (a.meetsSkillConditions($dataSkills[value2])) {
                break;
            };
        };
    }

    var value12 = value2;
    if (value11 >= 1) {
        if (!a.meetsSkillConditions($dataSkills[value11])) {
            var value11 = 0;
        };
    };
    if (!a.meetsSkillConditions($dataSkills[value12])) {
        var value12 = value3;
    };
    if ([101, 111, 121, 131, 141, 151, 161, 171, 181, 191, 901, 911, 921].some(function (id) { return value12 == id })) {
        var value1 = Math.floor(Math.random() * 101);
        if (a.level >= 30 && value1 >= 51) { value12 += 1 };
        var value1 = Math.floor(Math.random() * 101);
        if (a.level >= 50 && value1 >= 51) { value12 += 1 };
        var value1 = Math.floor(Math.random() * 101);
        if (a.level >= 100 && value1 >= 51) { value12 += 1 };
    };
    valueBossAction = value11;
    valueBossActionNormal = value12;
    if ($gameSwitches.value(470)) {
        if (valueBossAction >= 1) {
            boss_actionPredict(valueBossAction, 1);
        } else {
            boss_actionPredict(valueBossActionNormal, 2);
        };
    };
};

//ボス行動コモン内予測計算
boss_actionPredict = function (value1, id1) {

    var value3 = 777;//
    var enemy1 = $gameTroop.members()[0];
    var actor = $gameActors.actor($gameVariables.value(2));
    var value5 = actor.skillMasteryLevel(value3) * 10;
    var value2 = 1;
    if (id1 == 1) {
        if (actor.isStateAffected(292)) {
            if (value5 + actor.level > enemy1.level) {
                //if(true){
                var value2 = `${enemy1.name()}は\x1bSIN[${value1}]を発動するようだ…。`;
            } else {
                var value2 = `${enemy1.name()}の力が強大な為、行動を予測する事が出来ない…。`;
            };
        } else {
            var value2 = `${enemy1.name()}から大きな力の予兆を感じる…。。`;
        };
        if (value2 == 1) { } else {
            BattleManager._logWindow.push(`addText`, value2);
        };
    };
    if (id1 == 2) {
        if (actor.isStateAffected(292)) {
            if (value5 + actor.level > enemy1.level) {
                //if(true){
                var value2 = `${enemy1.name()}は\x1bSIN[${value1}]を使用するようだ…。`;
            } else {
                var value2 = `${enemy1.name()}の力が強大な為、行動を予測する事が出来ない…。`;
            };
            if (value2 == 1) { } else {
                BattleManager._logWindow.push(`addText`, value2);
            };
        };
    };
};

//エネミー仲間呼びスキル
enemy_reinforcement = function () {

    var value1 = 0;
    var value2 = 0;
    var enemies = $gameTroop.members();
    for (var i = 0, size = enemies.length; i < size; i = i + 1) {
        if (!enemies[i].isAppeared()) {
            this.iterateEnemyIndex(i, function (enemy) {
                enemy.appear();
                $gameTroop.makeUniqueNames();
            });
            var value1 = 1;
            var value2 = i;
            break;
        }
    }
    if (value1 == 1) {
        var value3 = $gameTroop.members()[value2]._enemyId;
        $gameVariables.setValue(21, $dataEnemies[value3].name);
        if ($gameVariables.value(240) >= 1) {
            enemy_battleSetting($gameVariables.value(334));
        };
        $gameSwitches.setValue(380, true);
    } else {
        $gameSwitches.setValue(380, false);
    };

};

//奥義召喚等追加効果設定id1対象が使用者のみなら1全員なら2敵単体なら3敵全体なら4 id2ステート付与なら1 id3は付与回数バフなど,id4ステート種類 id5アニメ
skill_additionalSet = function (user, target) {

    //<additionalSet1:1,1,2,206,651>
    if ($gameTroop.aliveMembers().length >= 1 && target.isAlive()) {
        var list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        list.forEach(function (id) {
            if ($dataSkills[$gameVariables.value(96)].meta['additionalSet' + id]) {
                var arr1 = $dataSkills[$gameVariables.value(96)].meta['additionalSet' + id].split(',');
                if (Number(arr1[4]) >= 1) {
                    if (Number(arr1[1]) == 1) {
                        var actor = $gameActors.actor($gameVariables.value(20));
                        actor.startAnimation(Number(arr1[4]), true, 1);
                    };
                    if (Number(arr1[1]) == 2) {
                        var actor = $gameActors.actor($gameVariables.value(20));
                        if ($dataAnimations[Number(arr1[4])].position() == 3) {
                            actor.startAnimation(Number(arr1[4]), true, 1);
                        } else {
                            for (var i = 0; i < $gameParty.battleMembers().length; i++) {
                                var actor = $gameParty.battleMembers()[i];
                                if (actor.isAlive()) {
                                    actor.startAnimation(Number(arr1[4]), true, 1);
                                };
                            };
                        };
                    };
                    if (Number(arr1[1]) == 3) {
                        var target1 = $gameTroop.members()[$gameVariables.value(92)];
                        target1.startAnimation(Number(arr1[4]), true, 1);
                    };
                    if (Number(arr1[1]) == 4) {
                        var target1 = $gameTroop.members()[$gameVariables.value(92)];
                        if ($dataAnimations[Number(arr1[4])].position() == 3) {
                            target1.startAnimation(Number(arr1[4]), true, 1);
                        } else {
                            for (var i = 0; i < $gameTroop.members().length; i++) {
                                var target1 = $gameTroop.members()[i];
                                target1.startAnimation(Number(arr1[4]), true, 1);
                            };
                        };
                    };
                };
                if (Number(arr1[1]) == 1) {//ステート付与
                    if (Number(arr1[0]) == 1) {
                        var actor = $gameActors.actor($gameVariables.value(20));
                        for (var i = 1; i <= Number(arr1[2]); i++) {
                            if (Number(arr1[3]) == 201) {
                                for (var j = 206; j <= 211; j++) {
                                    actor.addState(j);
                                };
                            } else {
                                actor.addState(Number(arr1[3]));
                            };
                        };
                    };
                    if (Number(arr1[0]) == 2) {
                        for (var i = 0; i < $gameParty.battleMembers().length; i++) {
                            var actor = $gameParty.battleMembers()[i];
                            if (actor.isAlive()) {
                                if (Number(arr1[3]) == 201) {
                                    for (var j = 206; j <= 211; j++) {
                                        actor.addState(j);
                                    };
                                } else {
                                    actor.addState(Number(arr1[3]));
                                };
                            };
                        };
                    };
                    if (Number(arr1[0]) == 3) {
                        var target1 = $gameTroop.members()[$gameVariables.value(92)];
                        if (target1.isAlive()) {
                            for (var i = 1; i <= Number(arr1[2]); i++) {
                                if (Number(arr1[3]) == 201) {
                                    for (var j = 206; j <= 211; j++) {
                                        state_addFormula1([j, 50, user, target1, user.mdf, target1.luk]);
                                    };
                                } else {
                                    state_addFormula1([Number(arr1[3]), 50, user, target1, user.mdf, target1.luk]);
                                };
                            };
                        };
                    };
                    if (Number(arr1[0]) == 4) {
                        for (var i = 0; i < $gameTroop.members().length; i++) {
                            var target1 = $gameTroop.members()[i];
                            if (target1.isAlive()) {
                                if (Number(arr1[3]) == 201) {
                                    for (var j = 206; j <= 210; j++) {
                                        state_addFormula1([j, 50, user, target1, user.mdf, target1.luk]);
                                    };
                                } else {
                                    state_addFormula1([Number(arr1[3]), 50, user, target1, user.mdf, target1.luk]);
                                };
                            };
                        };
                    };
                };
            };
        }, this);
    };

};

//スキル名表示。id2はid1が2の場合のみ名前を入れておく
skillWord_direction = function (id1, id2) {

    var value3 = 384 - 310;
    if (id1 == 2) {
        if ($gameParty.inBattle()) {
            if ($gameSwitches.value(211)) {
                $gameTemp._battler_bhp_temp[2] = true;
            } else {
                //$gameSystem.setTurnOrderDisplaySettings(false);
                //BattleManager.updateTurnOrderDisplayX();
            };
        };
        var value1 = id2;
        $gameScreen.dWindowFrame = 'ON';
        $gameScreen.dTextAlign = 1;
        $gameScreen.setDTextPicture(`${value1}`, 28);
        $gameScreen.showPicture(100, "", 1, 640 + 50, value3, 100, 100, 0, 0);
        $gameScreen.movePicture(100, 1, 640, value3, 100, 100, 255, 0, 30);
    };
    if (id1 == 0) {
        if ($gameParty.inBattle()) {
            if ($gameSwitches.value(211)) {
                $gameTemp._battler_bhp_temp[2] = true;
            } else {
                //$gameSystem.setTurnOrderDisplaySettings(false);
                //BattleManager.updateTurnOrderDisplayX();
            };
        };
        var value1 = $gameVariables.value(527);
        if ($dataSkills[$gameVariables.value(96)].meta['rubi']) {
            var value2 = $dataSkills[$gameVariables.value(96)].meta['rubi'];
            for (var i = 1; i <= 10; i++) {
                if (value2.match(/ /)) {
                    var value2 = value2.replace(' ', '');
                };
            };
            value3 += 40;
            $gameScreen.setDTextPicture(`${value2}`, 20);
        };
        $gameScreen.dWindowFrame = 'ON';
        $gameScreen.dTextAlign = 1;
        $gameScreen.setDTextPicture(`${value1}`, 28);
        $gameScreen.showPicture(100, "", 1, 640 + 50, value3, 100, 100, 0, 0);
        $gameScreen.movePicture(100, 1, 640, value3, 100, 100, 255, 0, 30);
    } else {
        if ($gameParty.inBattle()) {
            if ($gameSwitches.value(211)) {
                $gameTemp._battler_bhp_temp[2] = false;
            } else {
                //$gameSystem.setTurnOrderDisplaySettings(true);
            };
        };
        if ($gameScreen.picture(100)) { $gameScreen.movePicture(100, 1, 640 - 50, value3, 100, 100, 0, 0, 60) };
    };

};

//奥義名表示
ougiWord_direction = function (id1) {

    if (id1 == 0) {
        if (BattleManager._subject.isActor()) {
            var user = $gameActors.actor($gameVariables.value(20)).index();
        } else {
            var user = $gameVariables.value(92);
        };
        var value1 = `\x1bSIN[${$gameVariables.value(96)}]`;
        if (valueAddPowerCustom >= 1) {
            value1 += `＜\\I[666]\\C[10]+${valueAddPowerCustom}\\C[0]＞`
        };
        if (valueChainAddPower >= 1) {
            value1 += `＜\\C[10]Chain+${valueChainAddPower}\\C[0]＞`
        };
        if ($dataSkills[$gameVariables.value(96)].meta['rubi']) {
            var value2 = $dataSkills[$gameVariables.value(96)].meta['rubi'];
            for (var i = 1; i <= 10; i++) {
                if (value2.match(/ /)) {
                    var value2 = value2.replace(' ', '');
                };
            };
            $gameScreen.setDTextPicture(`${value2}`, 20);
        };
        $gameScreen.dWindowFrame = 'ON';
        $gameScreen.dTextAlign = 1;
        $gameScreen.setDTextPicture(`${value1}`, 28);
        if (BattleManager._subject.isActor()) {
            $gameScreen.showPicture(100, "", 1, $gameParty.getX(user + 1), $gameParty.getY(user + 1) - 200, 100, 100, 0, 0);
            $gameScreen.movePicture(100, 1, $gameParty.getX(user + 1), $gameParty.getY(user + 1) - 250, 100, 100, 255, 0, 20);
        } else {
            //$gameScreen.showPicture(100,"",1,$gameTroop.getX(user+1),$gameTroop.getY(user+1)-200,100,100,0,0);
            //$gameScreen.movePicture(100,1,$gameTroop.getX(user+1),$gameTroop.getY(user+1)-250,100,100,255,0,20);
            $gameScreen.showPicture(100, "", 1, 640, 80 - 100, 100, 100, 0, 0);
            $gameScreen.movePicture(100, 1, 640, 80, 100, 100, 255, 0, 20);
        };
    } else {
        if ($gameScreen.picture(100)) { $gameScreen.erasePicture(100) };
    };

};

//カットイン事前設定用
cutin_preparation = function (id1, id2) {

    //奥義0,角度
    //スキル90
    //チェイン180
    //会話-90
    if (id2 >= 1) {
        var actor = $gameActors.actor(id2);
    };
    if (id1 == 0) {
        var action = BattleManager._action;
        var value1 = BattleManager._action._item._itemId;
        if ($dataSkills[value1].meta["CutInSkillSet"]) {
            //var value3 = $gameTroop.members()[$gameVariables.value(92)]._enemyId;
            if ($dataEnemies[value3].meta[`Passive State`]) {
                //var value1 = Number($dataEnemies[value3].meta[`Passive State`]) - 420;
            };
            //var value4 = 'CutInCG_EnemyEntry' + value1; 
            //valueCutInSet1 = ["カットインエネミースキル",value4,0,4.5,4.5,25,40];
        };
    };
    if (id1 == 1) {
        var value6 = 0;
        if ($gameVariables.value(182) == 13) {
            var value1 = 91;
        } else {
            var action = BattleManager._action;
            var value1 = BattleManager._action._item._itemId;
        };
        if ($gameVariables.value(182) == 12) {
            var value6 = 1;
        };
        if ($gameVariables.value(182) == 13) {
            var value6 = 4;
        };
        if ($dataSkills[value1].meta["CutInSkillSet"]) {
            if ($gameVariables.value(182) == 12) {
                var value6 = 2;
            };
            //if([5,6,7,8].some(function(id){return $gameVariables.value(182) == (id)})){$gameVariables.setValue(21,2)};
        };
        if (value6 == 2) {
            if ($dataSkills[$gameVariables.value(96)].meta['HiQualityBurst']) {
                var value1 = "21_BattleOugiBest";
                AudioManager.playBgm({ "name": value1, "volume": 50, "pitch": 110, "pan": 0 });
            } else {
                var value1 = "21_BattleOugi";
                AudioManager.playBgm({ "name": value1, "volume": 50, "pitch": 110, "pan": 0 });
            };
        };
        if (value6 >= 1) {
            if ($dataActors[id2].meta['OugiUse']) {
                var arr2 = $dataActors[id2].meta['OugiUse'].split(',');
                var arr3 = arr2[Math.floor(Math.random() * arr2.length)];
                var arrNpcGab1 = [];
                arrNpcGab1.push([`${actor.name()}${arr3}`, 0, 0]);
                gabWord_exeScriptNoFace(arrNpcGab1);
            };
            if ($dataActors[id2].meta['Heroine']) {
                var value1 = $gameVariables.value(id2 + 380)[4];//露出度による変更
                if (value6 == 2 && value1 <= 5) {
                    var value6 = 3;
                };
                if (value6 == 4 && value1 <= 5) {
                    var value6 = 5;
                };
                if (value6 == 1) {
                    var arr1 = [0, 4.5, 4.5, 25, 20];
                    var value5 = '奥義'
                };
                if (value6 == 2 || value6 == 3) {
                    var arr1 = [90, 1.3, 1.3, 35, 60];
                    var value5 = 'スキル'
                };
                if (value6 == 4 || value6 == 5) {
                    var arr1 = [180, 6, 2, 25, 20];
                    var value5 = 'チェイン'
                };
                var value4 = 'CutInCG_Actor' + id2 + '_' + value6;
                var value3 = 'カットインアクター' + value5;
                valueCutInSet1 = [value3, value4, arr1[0], arr1[1], arr1[2], arr1[3], arr1[4]];
            };
        };
    };
    if (id1 == 2) {
        var value3 = 'CutInCG_PartyFirstStrike';
        var value1 = 'チェイン';
        var value2 = 'カットインアクター' + value1;
        valueCutInSet1 = [value2, value3, 180, 1.3, 1.3, 25, 20];
    };
    if (id1 == 3) {
        var value3 = 'CutInCG_EnemySurprise';
        var value2 = 'カットインエネミー演出色々';
        valueCutInSet1 = [value2, value3, 0, 2, 2, 25, 40];
    };
    if (id1 == 4) {
        var value3 = 'CutInCG_PartyChainBurst';
        var value1 = 'チェイン'
        var value2 = 'カットインアクター' + value1;
        valueCutInSet1 = [value2, value3, 180, 5, 5, 25, 40];
    };
    if (id1 == 5) {
        $gameSwitches.setValue(428, true);
        var value3 = 'CutInCG_Actor' + id2 + '_' + $gameVariables.value(21);
        if ($gameVariables.value(21) >= 11) { var value1 = '会話' };
        var value2 = 'カットインアクター' + value1;
        valueCutInSet1 = [value2, value3, -90, 2.5, 2.5, 25, 60];
    };
    if (id1 == 6) {
        var value4 = 'CutInCG_EnemyEntry' + valueCountSet1; //valueCountSet1はバトルコモンで数字を入れている
        valueCutInSet1 = ["カットインエネミー登場", value4, 180, 1.2, 1.2, 25, 40];
    };
    if (id1 == 7) {
        var value1 = 'N'
        if ($gameVariables.value(23) == 6) { var value1 = 'R' };
        if ($gameVariables.value(23) == 7) { var value1 = 'SR' };
        if ($gameVariables.value(23) == 8) { var value1 = 'SSR' };
        if ($gameVariables.value(23) == 9) { var value1 = 'UR' };
        if ($gameVariables.value(23) >= 10) { var value1 = 'LR' };
        var value4 = 'GachaDirect' + value1;
        valueCutInSet1 = ["ガチャ演出", value4, 270, 2, 1.5, 25, 60];
    };
    if (id1 == 8) {
        var value3 = 'CutInCG_EnemyAwaken';
        var value2 = 'カットインエネミースキル';
        valueCutInSet1 = [value2, value3, 0, 2, 2, 25, 40];
    };

};

//石召喚演出ピクチャsummon_directPicture1(1);
summon_directPicture1 = function (id1) {

    picture_motion1("smooth", [0]);
    //picture_motion1("linear",[0]);
    var value1 = 101;
    if (id1 == 0) {
        AudioManager.playSe({ "name": 'Ice7', "volume": 100, "pitch": 150, "pan": 0 });
        $gameScreen.startFlash([255, 255, 255, 170], 20);
        var value3 = 'summon_Direct1';
        var value4 = 'summon_Direct2';
        $gameScreen._particle.particleClear(value3);
        $gameScreen._particle.particleClear(value4);
        var value7 = $gameScreen.picture(value1).origin();
        var value2 = $gameScreen.picture(value1).x();
        var value3 = $gameScreen.picture(value1).y();
        var value4 = $gameScreen.picture(value1).scaleX();
        var value5 = $gameScreen.picture(value1).scaleY();
        var value6 = $gameScreen.picture(value1).opacity();
        $gameScreen.movePicture(value1, value7, value2, value3, value4, value5 + 100, 0, 0, 60);
        picture_fade1(value1, "fadeOut", 'Hscene005', 60, 5);
        UTSU.PictureBreath.off([value1]);
        $gameScreen.erasePicture(value1 + 1);
    };
    if (id1 == 1) {
        if ($gameParty.inBattle()) {
            valueWordSet10 = 'battlePicture:' + value1;
        } else {
            valueWordSet10 = 'picture:' + value1;
        };
        AudioManager.playSe({ "name": 'Z_Summoning', "volume": 50, "pitch": 120, "pan": 0 });
        if ($gameVariables.value(331) != 0) {
            $gameScreen.startFlash([$gameVariables.value(331)[0], $gameVariables.value(331)[1], $gameVariables.value(331)[2], 170], 20);
        } else {
            $gameScreen.startFlash([255, 255, 255, 170], 20);
        };
        var arr1 = $dataSkills[$gameVariables.value(96)].meta['picSize'].split(',');
        var value2 = "/img/sv_enemies/Summon_" + Number(arr1[0]);
        var value11 = Number(arr1[1]);
        var value5 = value11;
        var value14 = Number(arr1[2]);
        var value6 = value14;
        $gameScreen.showPicture(value1, value2, 1, 640 + 450 + value5, 384 + value6, -100, 100, 210, 0);
        //$gameScreen.movePicture(value1,1,640+500+value5,384+value6,-100,100,210,0,40);
        picture_fade1(value1, "fadeIn", '162', 60, 5);
        tachie_bless(value1);
        var value3 = 'summon_Direct1';
        $gameScreen._particle.particleSet(0, value3, valueWordSet10, 'def', 'screen');
        var value4 = 'summon_Direct2';
        $gameScreen._particle.particleSet(0, value4, valueWordSet10, 'def', 'screen');
        var value11 = Number(arr1[3]);
        var value12 = -value11 / 2 - 50;
        var value13 = value11 + 100;
        var value14 = Number(arr1[4]);
        var value15 = Math.round(value14 / 10);
        var value16 = Math.round(value14 / 5);
        $gameScreen._particle.particleUpdate([value3, 'rect', value12, value16, value13, 0]);
        $gameScreen._particle.particleUpdate([value4, 'rect', value12, value15, value13, 0]);
        if ($dataSkills[$gameVariables.value(96)].meta['Multiple Elements']) {
            var arr1 = $dataSkills[$gameVariables.value(96)].meta['Multiple Elements'].split(',');
            for (var i = 0; i <= arr1.length - 1; i++) {
                var value11 = Number(arr1[i]);
                var value12 = 0;
                if (value11 == 3) { var value12 = '#ff0000' };
                if (value11 == 4) { var value12 = '#1eff00' };
                if (value11 == 5) { var value12 = '#ff9500' };
                if (value11 == 6) { var value12 = '#00d0ff' };
                if (value11 == 7) { var value12 = '#ffffff' };
                if (value11 == 8) { var value12 = '#461260' };
                if (value12 != 0) {
                    $gameScreen._particle.particleUpdate([value3, 'color', String(value12), '#ffffff']);
                    $gameScreen._particle.particleUpdate([value3, 'colorMode', '1']);
                    $gameScreen._particle.particleUpdate([value4, 'color', String(value12), '#ffffff']);
                    $gameScreen._particle.particleUpdate([value4, 'colorMode', '1']);
                    break;
                };
            };
        };
        var value11 = 2;
        $gameScreen._particle.particleUpdate([value3, 'particlesPerWave', String(value11)]);
        $gameScreen._particle.particleUpdate([value4, 'particlesPerWave', String(value11)]);
        $gameScreen._particle.particleExceed(value3, 1.5);
        $gameScreen._particle.particleExceed(value4, 1.5);
    };
    if (id1 == 2) {
        var value2 = $gameScreen.picture(value1).x();
        var value3 = $gameScreen.picture(value1).y();
        $gameScreen.startAnimation(value2, value3, 301, false);
        var value11 = `\x1bSIN[${$gameVariables.value(96)}]`;
        if ($dataSkills[$gameVariables.value(96)].meta['rubi']) {
            var value12 = $dataSkills[$gameVariables.value(96)].meta['rubi'];
            for (var i = 1; i <= 10; i++) {
                if (value12.match(/ /)) {
                    var value12 = value12.replace(' ', '');
                };
            };
            $gameScreen.setDTextPicture(`${value12}`, 20);
        };
        $gameScreen.dWindowFrame = 'ON';
        $gameScreen.dTextAlign = 1;
        $gameScreen.setDTextPicture(`${value11}`, 28);
        $gameScreen.showPicture(value1 + 1, "", 1, value2, 384 - 250, 100, 100, 0, 0);
        $gameScreen.movePicture(value1 + 1, 1, value2, 384 - 350, 100, 100, 255, 0, 30);
    };

};

enemy_preSetup1 = function (id1) {

    if ($gameSwitches.value(370)) {
        var arr1 = ['21_Battle3', 45, 110, 0];
    } else {
        var arr1 = ['21_Battle1', 45, 100, 0];
    };
    $gameSystem.setBattleBgm({ "name": arr1[0], "volume": arr1[1], "pitch": arr1[2], "pan": arr1[3] });
    BattleManager._forceAdvantage = 'Neutral';
    $gameSwitches.setValue(30, true);
    if ($gameVariables.value(329) == 0) {
        if ($gameSwitches.value(41) || $gameSwitches.value(99)) {
            battle_simpleSubjugation(id1);
            if ($gameSwitches.value(98)) {
                valueVictoryResult = 0;
                $gameSwitches.setValue(98, false);
            };
        };
        if ($gamePlayer.isFacingAway($gameMap.event(id1)) && $gameMap.event(id1).isPositionBackOf($gamePlayer)) {
            BattleManager._forceAdvantage = 'Player';
        };
        if ($gameMap.event(id1).isFacingAway($gamePlayer) && $gamePlayer.isPositionBackOf($gameMap.event(id1))) {
            BattleManager._forceAdvantage = 'Enemy';
        };
        if ($gameSwitches.value(370)) {
            valueCountSet1 = 10;
        } else {
            valueCountSet1 = Math.floor(Math.random() * 9) + 11;
        };
        valueCountSet2 = true;
    } else {
        valueCountSet1 = $gameVariables.value(329);//直前に入れる戦闘グループ名
        valueCountSet2 = false;
    };

};

//戦闘マップでの簡易討伐
battle_simpleSubjugation = function (id1) {

    if ($gameSwitches.value(201)) {
        var actor = $gameActors.actor($gameVariables.value(11));
        var value = $dataItems[$gameVariables.value(240)];
        var array = value.meta['EnemyLV'].split(',');
        var max = array.reduce(function (a, b) {
            return Math.max(a, b);
        });
        var value1 = max;
        var value2 = actor.level;
        if (value2 >= value1 || $gameSwitches.value(41)) {
            $gameSwitches.setValue(98, true);
            enemy_instantwin();
            for (var i = 0; i < $gameParty.battleMembers().length; i++) {
                var actor = $gameParty.battleMembers()[i];
                actor.gainJp(1);
            };
        };
    };

};

//state_addbuffdebuff(1,2,user,target,stateId,271);
state_addbuffdebuff = function (id5, id6, id1, id2, id3, id4) {

    var value1 = id6;
    var turns = Math.floor(Math.random() * 3) + 3;
    if (id5 == 1) {
        id2.addBuff(value1, turns);
    } else {
        id2.addDebuff(value1, turns);
    };
    if (id2._stateCounter[id3] >= 5) { } else {
        state_addEffect1(id1, id2, id3, id4);
    };
    if (id2._stateCounter[id3] >= 1) {
        id2.addStateCounter(id3, +1);
    } else {
        id2.setStateCounter(id3, 1);
    };

};

//state_removebuffdebuff(1,2,user,target,stateId,271);
state_removebuffdebuff = function (id5, id6, id1, id2, id3, id4) {

    var value1 = id6;
    if ($gameTroop.isAllDead() || id2._buffs[value1] < 1) { } else {
        id2.removeState(id3);
        id2.removeBuff(value1);
        //BattleManager._logWindow.push(`addText`, id2.name() + `の`+$dataStates[id3].name+`が解除された`);
        state_removeEffect1(id1, id2, id3, id4);
    };

};

//state_turnEndbuffdebuff(1,2,user,target,stateId,271);
state_turnEndbuffdebuff = function (id5, id6, id1, id2, id3, id4) {

    id1.removeStateCounter(id3);
    var value1 = id6;
    if (id5 == 1) {
        var value2 = id2._buffs[value1] < 0;
    } else {
        var value2 = id2._buffs[value1] > 0;
    };
    if (value2) {
        id2.removeState(id3);
        //id2.removeBuff(value1);
        state_removeEffect1(id1, id2, id3, id4);
    };

};

//装備スキルの操作
skill_equipOperation = function (actor, b, itemId) {

    if (b.actorId() == actor.actorId()) {
        if (itemId == 427) {//記憶
            var arr1 = actor.battleSkillsRaw();
            $gameVariables.value(351)[actor.actorId()] = arr1.clone();
            TickerManager.show(`\\C[2]${actor.name()}\\C[0]のスキル装備状態を記録しました`);
        };
        if (itemId == 428) {//復元
            if ($gameVariables.value(351)[actor.actorId()] == 0) {
                TickerManager.show(`\\C[2]${actor.name()}\\C[0]はスキル装備状態を記録していません`);
            } else {
                actor.clearEquipBattleSkills();
                for (var i = 0; i <= $gameVariables.value(351)[actor.actorId()].length - 1; i++) {
                    actor.equipSkill($gameVariables.value(351)[actor.actorId()][i], i);
                };
                TickerManager.show(`\\C[2]${actor.name()}\\C[0]のスキル装備状態を復元しました`);
            };
        };
        if (itemId == 429) {//一括解除
            actor.clearEquipBattleSkills();
            TickerManager.show(`\\C[2]${actor.name()}\\C[0]のスキル装備状態を全て解除しました`);
        };
        if (itemId == 430) {//一括装着
            var arr1 = Array(actor.battleSkillsRaw().length).fill(0);
            var id1 = 0;
            var id2 = actor.battleSkillsRaw().length - 200;//10Ｇパッシブ
            var id3 = actor.battleSkillsRaw().length - 100;//15Hパッシブ
            actor.clearEquipBattleSkills();
            for (var i = 1; i <= $dataSkills.length - 1; i++) {
                if (!$dataSkills[i].name == '') {
                    if ($dataSkills[i].meta['Skill Tier']) {
                        if (actor.isLearnedSkill(i) || actor.addedSkills().contains(i)) {
                            if ($dataSkills[i].stypeId == 10) {
                                arr1[id2] = i;
                                id2 += 1;
                            } else {
                                if ($dataSkills[i].stypeId == 15) {
                                    arr1[id3] = i;
                                    id3 += 1;
                                } else {
                                    arr1[id1] = i;
                                    id1 += 1;
                                };
                            };
                        }
                    }
                }
            };
            for (var i = 0; i <= arr1.length - 1; i++) {
                if (arr1[i] != 0) {
                    if (actor.getEquipSkillTierCount(Number($dataSkills[arr1[i]].meta['Skill Tier'])) < actor.getEquipSkillTierMax(Number($dataSkills[arr1[i]].meta['Skill Tier']))) {
                        actor.equipSkill(arr1[i], i);
                    };
                };
            };
            TickerManager.show(`\\C[2]${actor.name()}\\C[0]は装備可能なスキルを全て装着しました。`);
        };
    };

};

//ステータス表示非表示
battleStatus_showHide = function (id1) {

    if (id1 == 0) {
        if (Imported.MOG_BattleHud) {
            $gameSystem._bhud_visible = true;
        } else {
            BattleManager._statusWindow.show();
        };
        var _bosshp_sprites = SceneManager._scene._bosshp_sprites;
        var isVar211 = _bosshp_sprites !== undefined && $gameSwitches.value(211);
        if (isVar211) { _bosshp_sprites.visible = true };
    } else {
        if (Imported.MOG_BattleHud) {
            $gameSystem._bhud_visible = false;
        } else {
            BattleManager._statusWindow.hide();
        };
        if (isVar211) { _bosshp_sprites.visible = false }; // add check for undefined
    };

};

//確率でステート付与state_addFormula1([4,50,user,target,user.mdf,target.luk]);
state_addFormula1 = function (arr10) {

    //arr10[0] = 4;arr10[1] = 50;arr10[2] = user;arr10[3] = target;arr10[4] = user.mdf;arr10[5] = target.luk;
    stateId4 = 0;
    if (arr10[2] != arr10[3]) {
        var stateId3 = `\\C[2]${arr10[2].name()}\\C[0]が\\C[10]${$dataStates[arr10[0]].name}\\C[0]を付与した！　`;
        if ($gameParty.inBattle()) {
            BattleManager._logWindow.push(`addText`, stateId3);
        } else {
            CommonPopupManager.showInfo({}, stateId3, null);
        };
    };
    if (!arr10[3].isStateResist(arr10[0])) {
        var stateId1 = Math.floor((1.0 + (arr10[4] - arr10[5]) * 0.01) * arr10[1]);
        var stateId2 = Math.floor(Math.random() * arr10[3].stateRate(arr10[0]) * 100);
        if (stateId1 > stateId2) {
            arr10[3].addState(arr10[0]);
            stateId4 += 1;
        };
    } else {
        var stateId3 = `\\C[16]${arr10[3].name()}\\C[0]は\\C[10]${$dataStates[arr10[0]].name}\\C[0]を無効化した！。（\\C[10]完全耐性\\C[0]）`;
    };
    if (stateId4 >= 1) {
        var stateId3 = `\\C[16]${arr10[3].name()}\\C[0]は\\C[10]${$dataStates[arr10[0]].name}\\C[0]を付与された…。（判定：\\C[4]${stateId2}\\C[0] > \\C[10]${stateId1}\\C[0]）`;
    } else {
        var stateId3 = `\\C[16]${arr10[3].name()}\\C[0]は\\C[10]${$dataStates[arr10[0]].name}\\C[0]を無効化した！（判定：\\C[4]${stateId2}\\C[0] > \\C[10]${stateId1}\\C[0]）`;
    };
    if ($gameParty.inBattle()) {
        BattleManager._logWindow.push(`addText`, stateId3);
    } else {
        CommonPopupManager.showInfo({}, stateId3, null);
    };

};

//トータルダメージ表示
battle_totalDamage = function () {

    if (valueTotalDamageCount2 >= 2) {
        var value1 = 96;
        var value2 = valueTotalDamageCount;
        var value3 = value2.toLocaleString();
        var value4 = 50;
        var value5 = 400;
        var value6 = 480;
        if (valueTotalDamageCount <= 9999) { var value4 = 45 };
        if (valueTotalDamageCount >= 100000) { var value4 = 55 };
        $gameScreen.setDtextFont('ＭＳ Ｐ明朝');
        if ($gameVariables.value(276) == 2) {
            $gameScreen.setDTextPicture(`\\f[b]\\oc[22]\\f[i]Total${valueTotalDamageCount2}Hit,\\C[10]${value3}\\C[17]Damage!\\C[0]`, value4);
        } else {
            $gameScreen.setDTextPicture(`\\f[b]\\oc[2]\\f[i]Total${valueTotalDamageCount2}Hit,\\C[10]${value3}\\C[17]Damage!\\C[0]`, value4);
        };
        $gameScreen.showPicture(value1, "", 0, value5 - 50, value6, 100, 100, 100, 0);
        $gameScreen.movePicture(value1, 0, value5, value6, 100, 100, 255, 0, 20);
    };

};

//ステート付与攻撃時にアニメ
battle_stateAnime1 = function (target) {

    if (valueAttackStates.length >= 1) {
        var value1 = 0;
        for (var i = 0; i <= valueAttackStates.length - 1; i++) {
            if (valueAttackStates[i] >= 1 && valueStateAnimeArr[valueAttackStates[i]] >= 1) {
                target.startAnimation(valueStateAnimeArr[valueAttackStates[i]], true, value1);
                value1 += 1;
            };
        };
    };

};

//パーティレベルを一時記憶/呼び出し
party_levelSaveLoad = function (id1) {

    if (id1 == 0) {
        valuePartyMainLv = Array(21).fill(0);
        valuePartySubLv = Array(21).fill(0);
        var start = $gameVariables.value(75);
        var end = $gameVariables.value(76);
        for (var i = start; i <= end; i++) {
            actor = $gameActors.actor(i);
            if ($gameParty.members().contains(actor)) {
                valuePartyMainLv[i] = actor.level;
                if (actor.subclass()) {
                    valuePartySubLv[i] = actor.classLevel(actor._subclassId);
                };
            };
        };
    };
    if (id1 == 1) {
        var value2 = 0;
        for (var i = 0; i <= valuePartyMainLv.length - 1; i++) {
            if (valuePartyMainLv[i] >= 1) {
                actor = $gameActors.actor(i);
                if (actor.level > valuePartyMainLv[i]) {
                    var value1 = `\\C[2]${actor.name()}\\C[0]のメインジョブ\\C[14]<${$dataClasses[actor._classId].name}>\\C[0]Lvが\\C[10]${actor.level - valuePartyMainLv[i]}\\C[0]上がった！ (${actor.level})`;
                    CommonPopupManager.showInfo({}, value1, null);
                    var value2 = 1;
                };
            };
        };
        if (value2 == 1) {
            $gamePlayer.requestAnimation(297);
        };
    };
    if (id1 == 2) {
        var value2 = 0;
        for (var i = 0; i <= valuePartyMainLv.length - 1; i++) {
            if (valuePartySubLv[i] >= 1) {
                actor = $gameActors.actor(i);
                if (actor.classLevel(actor._subclassId) > valuePartySubLv[i]) {
                    var value1 = `\\C[2]${actor.name()}\\C[0]のサブジョブ\\C[14]<${$dataClasses[actor._subclassId].name}>\\C[0]Lvが\\C[10]${actor.classLevel(actor._subclassId) - valuePartySubLv[i]}\\C[0]上がった！ (${actor.classLevel(actor._subclassId)})`;
                    CommonPopupManager.showInfo({}, value1, null);
                    var value2 = 1;
                };
            };
        };
        if (value2 == 1) {
            $gamePlayer.requestAnimation(297);
        };
    };

};

//ボス行動コモン内予測計算
//boss_actionPredict = function(value1){

//};

//})();
