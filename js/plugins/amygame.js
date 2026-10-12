/*:
* @plugindesc このゲーム専用プラグイン
* @author 作者名
* @help ゲーム専用に作成された初期読み込み用プラグイン
*/

(function () {

    function clearSelfSwitchVariableRange(mapId, eventId, lastVariableId) {
        for (let variableId = 1; variableId <= lastVariableId; variableId++) {
            $gameSelfSwitches.setVariableValue([mapId, eventId, variableId], 0);
        }
    }

    function initializeGameVariableArrays(gameVariables, firstVariableId, lastVariableId, arrayLength) {
        for (let variableId = firstVariableId; variableId <= lastVariableId; variableId++) {
            gameVariables.setValue(variableId, Array(arrayLength).fill(0));
        }
    }

    amygame_startUpArrangement = function () {

        //一括売却設定のため
        clearSelfSwitchVariableRange(4, 11, 2000);
        clearSelfSwitchVariableRange(4, 12, 1000);
        clearSelfSwitchVariableRange(4, 13, 1000);

        const gameVariables = $gameVariables;
        //マップ行った事があるか判定配列.総数500以下で設定
        gameVariables.setValue(356, Array(501).fill(0));
        //各アクターの衣装プリセット配列
        gameVariables.setValue(355, Array(21).fill(0));
        let start = gameVariables.value(73);
        let end = gameVariables.value(74);
        const gameVariables355 = gameVariables.value(355);
        const presetBaseName = `プリセット`;
        for (let i = start; i <= end; i++) {
            gameVariables355[i] = [0, Array(51).fill(0), Array(51).fill(0), Array(51).fill(0), Array(51).fill(0)];

            gameVariables355[i][1][50] = `${presetBaseName}1`;
            gameVariables355[i][2][50] = `${presetBaseName}2`;
            gameVariables355[i][3][50] = `${presetBaseName}3`;
            gameVariables355[i][4][50] = `${presetBaseName}4`;
        };
        //各アクターの装備スキル配列記憶用
        gameVariables.setValue(351, Array.from({ length: 21 }, () => []));
        //各ステート毎の討伐数設定。主に種族対象,1が当日魔物討伐数,2が総魔物討伐数
        gameVariables.setValue(52, Array(1001).fill(0));
        //Tipsタイトルと内容配列。
        gameVariables.setValue(532, []);
        gameVariables.setValue(533, []);
        gameVariables.setValue(534, []);
        //イベントのプレイヤーの位置記憶。
        gameVariables.setValue(163, Array(1001).fill(0));
        //個別リセットフラグonoff
        gameVariables.setValue(183, [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0]);//10
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
        for (let i = start; i <= end; i++) { gameVariables.value(i + 380)[46] = 0 };

        //各キャラの衣装初期配列↓
        initializeGameVariableArrays(gameVariables, 441, 460, 43);
        initializeGameVariableArrays(gameVariables, 541, 560, 43);
        //計43。0は統合時のアイテムID。41は会話立ち絵用衣装指定変数代入用(TotalCloth)
        //42は露出超過回数

        //NPCのキャラごとＨ回数。
        initializeGameVariableArrays(gameVariables, 361, 380, 301);
        //計301.対応する相手とのH回数。101～200は受精した状態で1。
        //201～300は子供の数。301～400は現在の役職名。0は使用しない。

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
        gameVariables.setValue(212, Array(101).fill(0));//<TchestOnly:1,1,1,2,21>レア宝箱用
        gameVariables.setValue(215, Array(101).fill(0));
        gameVariables.setValue(216, Array(101).fill(0));
        //ダンジョンワープ魔方陣指定
        gameVariables.setValue(211, Array(101).fill(0));
        let defaultArray = Array(11).fill(0);
        for (let i = 0; i <= 100; i++) { gameVariables.value(211)[i] = [...defaultArray] };
        //監禁時にアクターの記憶配列。２次配列で記憶させる。0レアリティ1-10装備
        gameVariables.setValue(333, Array(21).fill(0));
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
        start = 0;
        end = 21;
        defaultArray = Array(11).fill(21);
        for (let i = start; i <= end; i++) { gameVariables.value(287)[i] = [...defaultArray] };
        //マスターノート入手用配列↓21まで。1から始める//計20.
        gameVariables.setValue(249, Array(20).fill(0));
        //訓練人形事前設定配列
        gameVariables.setValue(293, Array(31).fill(1));//11から-10のｱｸﾀｰのその訓練時のトータルダメージ
        //10にターン数
        gameVariables.value(293)[3] = 100;
        gameVariables.value(293)[4] = 100;
        gameVariables.value(293)[6] = 0;//種族指定
        //街ごと賞金額
        gameVariables.setValue(501, Array(101).fill(0));

    };

    amygame_startUp = function () {

        let start = 1;
        let end = $dataWeapons.length;
        for (let i = start; i < end; i++) {
            if ($dataWeapons[i].name == '') {
                $dataWeapons[i].name = i;
            }
        };

        //操作用などの名称を変更
        //var start = 1;
        end = $dataStates.length;
        for (let i = start; i < end; i++) {
            const state = $dataStates[i];
            if (state.meta['起動時名前改変']) {
                state.name = state.meta['起動時名前改変'];
            }
        };

        const gameVariables = $gameVariables;

        //視点スイッチにアクター名付与
        const switches = $dataSystem.switches;
        const switchesLen = switches.length;
        const list = gameVariables.value(248);
        list.forEach(function (id) {
            const actorName = $gameActors.actor(id).name();
            switches[440 + id] = `${actorName}視点`;
        }, this);
        for (let i = 1; i < switchesLen; i++) {
            if (switches[i].match(/Battle/)) {
                switches[i] = switches[i].replace("[Battle]", "")
            }
        };

        //各アイテムに連番を付与
        let itemPrefix = 1;
        let itemPrefix2 = 1;
        let titleNumber = 1;
        //var value4 = 1;
        let copyIndexFor100Offset = 1;
        let copyIndexFor50Offset = 1;

        const weaponsLen = $dataWeapons.length;
        for (let i = 1; i < weaponsLen; i++) {
            const weapon = $dataWeapons[i];
            if (weapon.name !== '') {
                const weaponMapSwitch = weapon.meta['MapSwitch'];
                if (weaponMapSwitch) {
                    weapon.name = `${switches[Number(weaponMapSwitch)]}`;
                };
            };
        };

        const copyItem = (item, sequenceNumber, databaseIndex, offset) => {
            item.name = '[' + sequenceNumber + ']' + item.name;

            const completedItem = $dataItems[databaseIndex + offset];
            completedItem.iconIndex = item.iconIndex;
            completedItem.name = `${item.name}[了]`;
            completedItem.description = item.description;
        };
        const setItemName = (item, itemIndex, i, x) => {
            if (item.meta['追加コモンID'] || (i >= (401 + x) && i <= (500 + x))) {
                item.name = $dataCommonEvents[i].name;
            }
            else {
                item.name = '[' + itemIndex + ']' + item.name;
            }
        };

        const itemsCount = $dataItems.length;
        const achieverIndexes = gameVariables.value(297);
        for (let i = 1; i < itemsCount; i++) {
            let item = $dataItems[i];
            if (item.name !== '') {
                const itemMeta = item.meta;
                if (itemMeta['ItemNameAddSet']) {
                    const itemNameAddSetValues = itemMeta['ItemNameAddSet'].split(',');
                    const index = Number(itemNameAddSetValues[0]);
                    const Index1 = Number(itemNameAddSetValues[1]);
                    let replacedName;
                    switch (index) {
                        case 0:
                            replacedName = $dataItems[Index1].name;
                            break;
                        case 1:
                            replacedName = $dataWeapons[Index1].name;
                            break;
                        case 2:
                            replacedName = $dataArmors[Index1].name;
                            break;
                        case 3:
                            replacedName = $dataStates[Index1].name;
                            break;
                        case 4:
                            replacedName = $dataSkills[Index1].name;
                            break;
                        case 5:
                            replacedName = $dataStates[Index1].name;
                            break;
                        case 6:
                            replacedName = switches[Index1];
                            break;
                    }
                    if (Number(itemNameAddSetValues[2]) == 0) {
                        item.name = `${replacedName}${item.name}`;
                    } else {
                        item.name = `${item.name}${replacedName}`;
                    };
                };
                if (itemMeta['annihilationTitle']) {
                    if (Number(itemMeta['annihilationTitle'].split(',')[0]) >= 20) {
                        var target = $dataItems[Number(itemMeta['annihilationTitle'].split(',')[0])].name;
                        item.name = `${target}を殲滅せし者`;
                    };
                };
                if (itemMeta['MapSwitch']) {
                    item.name = `${switches[Number(itemMeta['MapSwitch'])]}`;
                };
                const itemEICSwitch = itemMeta['EICSwitch'];
                if (itemEICSwitch) {
                    const itemEICSwitchNumber = Number(itemEICSwitch);
                    if (itemEICSwitchNumber == 102) {
                        setItemName(item, itemPrefix, i, 0);
                        itemPrefix += 1;
                    }
                    else if (itemEICSwitchNumber == 103) {
                        setItemName(item, itemPrefix2, i, 100);
                        itemPrefix2 += 1;
                    }
                    else if (itemEICSwitchNumber == 104 || itemEICSwitchNumber == 105) {//二つ名は説明の方に連番を付与する
                        item.description = '[' + titleNumber + ']' + item.description;
                        titleNumber += 1;
                        if (itemMeta['KojinTitle']) {
                            const achieverIndex = achieverIndexes[i];
                            if (achieverIndex >= 1) {
                                const achieverName = $gameActors.actor(achieverIndex).name();
                                item.description += `[達成者:${achieverName}]`;
                            }
                        };
                    }
                    else if (itemEICSwitchNumber == 108) {
                        const itemCategory = itemMeta['SGカテゴリ'];
                        if (itemCategory == '受注クエスト' || itemCategory == 'ＥＸ受注クエスト') {//特別クエスト使わない。クエスト801～を901に名前と解説とアイコンをコピーする
                            copyItem(item, copyIndexFor100Offset, i, 100);
                            copyIndexFor100Offset += 1;
                        }
                        else if (itemCategory == 'デイリークエスト') {
                            copyItem(item, copyIndexFor50Offset, i, 50);
                            copyIndexFor50Offset += 1;
                        };
                    };
                }
            }
        };

        //不用なクエスト完了削除。辞典に反映させないため
        // for (let i = 1; i < itemsCount; i++) {
        //   const item = $dataItems[i];
        //   if (itemEICSwitchNumber == 108) {
        //     if(item.name == '') {
        //       if(i >= 801 && i <= 900){
        //         //const obj1 = $dataItems[2];
        //         //$dataItems[i+100] = Object.assign({}, obj1);
        //       }
        //       else if(i >= 1001 && i <= 1050){
        //         //const obj1 = $dataItems[2];
        //         //$dataItems[i+50] = Object.assign({}, obj1);
        //       };
        // }}};

        //ステート武器防具スキルに説明文追加。状態異常耐性付与の先に実行。反映させないため
        various_description(4);//ステートは最初
        various_description(1);
        various_description(2);
        various_description(3);
        various_description(5);
        various_description(0);

        //状態異常耐性の特徴をステート武器防具クラスに付与
        const normalResistStateIds = [];
        const spResistStateIds = [];
        //var start = 1;
        end = $dataStates.length;
        for (let i = start; i < end; i++) {
            const stateCategory = $dataStates[i].meta['Category'];
            if (stateCategory == ' StateNomal') {
                normalResistStateIds.push(i);
            }
            else if (stateCategory == ' StateabNomal') {
                spResistStateIds.push(i);
            };
        };

        const pushItemTrait = (databaseEntry, meta, list) => {
            if (!meta) return;

            const res = Number(meta);
            const code = res == 0 ? 14 : 13;
            const value = res == 0 ? 1 : 1 - (res / 100);
            list.forEach(function (id) {
                databaseEntry.traits.push({ code: code, dataId: id, value: value });
            }, this);
        }

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
            end = valueItems.length;
            for (let i = start; i < end; i++) {
                const databaseEntry = valueItems[i];
                if (!databaseEntry) continue; // armors(possibly other) have undefined values in list

                const valueItemMeta = databaseEntry.meta;

                pushItemTrait(databaseEntry, valueItemMeta['StateabNomalResist'], normalResistStateIds);
                pushItemTrait(databaseEntry, valueItemMeta['StateSPabNomalResist'], spResistStateIds);
                if (valueItemMeta['elementRegist6']) {
                    const resistPercent = Number(valueItemMeta['elementRegist6']);
                    const value = resistPercent == 0 ? 0 : 1 - (resistPercent / 100);
                    for (let dataId = 3; dataId <= 8; dataId++) {
                        databaseEntry.traits.push({ code: 11, dataId: dataId, value: value });
                    }
                };
                if (valueItemMeta['elementRegist9']) {
                    const resistPercent = Number(valueItemMeta['elementRegist9']);
                    const value = resistPercent == 0 ? 0 : 1 - (resistPercent / 100);
                    for (let dataId = 3; dataId <= 9; dataId++) {
                        databaseEntry.traits.push({ code: 11, dataId: dataId, value: value });
                    }
                    databaseEntry.traits.push({ code: 11, dataId: 16, value: value });
                    databaseEntry.traits.push({ code: 11, dataId: 17, value: value });
                };
            };
        };
        //エネミーグループ<one>最初のエネミーを適切な位置に配置
        //エネミーグループ<big>最初のエネミーを適切な位置y+100に配置
        enemy_troopPosition1();

        //ダンジョンユニーク採取品の解説文にマップ名追記
        for (let i = 1; i <= 9; i++) {
            for (let j = 1; j < itemsCount; j++) {
                const item = $dataItems[j];
                const itemMeta = item.meta;
                if (itemMeta['UniqueMaterial' + i]) {
                    const uniqueMaterials = itemMeta['UniqueMaterial' + i].split(',');
                    if (itemMeta['MapSwitch']) {
                        const material = switches[Number(itemMeta['MapSwitch'])];
                        $dataItems[Number(uniqueMaterials[0])].description += ` \\C[2][${material}で希少採取]\\C[0]`;
                    };
                };
            };
        };

        //通常攻撃追加解説に条件で文言を加えるための配列
        attack_addKaisetu1();

        //ジョブ追加説明文に条件で文言を加えるための配列
        class_addKaisetu1();
        //苗字代入
        start = gameVariables.value(75);
        end = gameVariables.value(76);
        for (let i = start; i <= end; i++) {
            $dataWeapons[i + 200].name = gameVariables.value(i + 380)[50];
        };
        //特定場所スイッチ変更.マップ名表示処理も含める。コモン288で実行
        if ($dataSystem.variables[61].match(/りしゃぶる/)) {
            let familyName = $dataWeapons[315].meta['FamilyName'];
            if (familyName) {
                switches[279] = `喫茶 <${familyName}カフェ>`;
                valueMapNameSpecialStaging[200] = switches[279];
            };
            familyName = $dataWeapons[311].meta['FamilyName'];
            if (familyName) {
                switches[275] = `書店 <${familyName}古書店>`;
                valueMapNameSpecialStaging[95] = switches[275];
            };
            familyName = $dataWeapons[316].meta['FamilyName'];
            if (familyName) {
                switches[274] = `民家 <${familyName}家>`;
                valueMapNameSpecialStaging[25] = switches[274];
            };

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
        };

    };

    //ステート付与されているかどうか。名前21に全員の名前、変数21に人数、変数22にid
    actor_stateCheck = function (stateId) {

        const affectedActorIds = [];
        const firstActorId = $gameVariables.value(75);
        const lastActorId = $gameVariables.value(76);
        for (let actorId = firstActorId; actorId <= lastActorId; actorId++) {
            const gameActor = $gameActors.actor(actorId);
            if (gameActor.isStateAffected(stateId)) {
                affectedActorIds.push(actorId);
            }
        };

        const affectedActorNames = affectedActorIds.map(function (actorId) {
            if (stateId == 83) { $gameSelfSwitches.setValue([$gameMap.mapId(), actorId, 'A'], true) };
            return $gameActors.actor(actorId).name();
        });
        let stateAffectedNames = affectedActorNames.join(' ');
        if (affectedActorNames.length > 0) {
            stateAffectedNames += ` `;
        }
        if (affectedActorIds.length >= 2) {
            stateAffectedNames += `達`;
        };
        $gameActors.actor(21).setName(stateAffectedNames);
        $gameVariables.setValue(21, affectedActorIds.length - 1);
        $gameVariables.setValue(22, affectedActorIds);

    };

    //役職名を変更する。Profession_CharaChange(0,1,`\\wn[314]の恋人`,0);//0がｱｸﾀｰで1NPC,id,役職名,0で表示1でｻｲﾚﾝﾄ
    Profession_CharaChange = function (targetTypeId, targetId, professionName, displayModeId) {

        if (!$gameSwitches.value(29)) {
            let actorName = '';
            if (targetTypeId == 0) {
                $gameVariables.value(380 + targetId)[59] = `${professionName}`;
                actorName = $gameActors.actor(targetId).name();
            } else {
                $gameVariables.value(353)[targetId - 300] = `${professionName}`;//スタートリセットコモンで初期実行
                actorName = $dataWeapons[targetId].name;
            };
            if (displayModeId == 0) {
                $gameScreen.startAnimation(100, 150, 300, false);
                const actor = colorTaggedText(1, actorName);
                const job = colorTaggedText(2, professionName);
                TickerManager.show(`　　` + `${actor}の役職名が${job}に変更されました。`);
            };
        };

    };

    //役職名を基本に戻す
    Profession_basicReturn = function (actorId) {
        if ($gameSwitches.value(29)) return; // Exit early if switch 29 is on

        const dataActor = $dataActors[actorId];
        //const actor = $dataActors[actorId]; // was set by default
        let defaultProfession = `${dataActor.meta['Profession']}`;
        let newProfession = defaultProfession;

        // Check all possible profession alternatives (up to 9)
        for (let i = 1; i <= 9; i++) {
            const professionMetaKey = 'Profession' + i;

            if (!dataActor.meta[professionMetaKey]) continue;

            const professionData = dataActor.meta[professionMetaKey].split(',');
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
            if (variableId >= 1 && $gameVariables.value(variableId) >= requiredValue) {
                newProfession = professionName;
                continue;
            }

            // Check item possession condition
            if (requiredItemId >= 1 && $gameParty.hasItem($dataItems[requiredItemId], true)) {
                newProfession = professionName;
                continue;
            }
        }

        const currentProfession = $gameVariables.value(380 + actorId)[59];

        // Only update if profession has changed
        if (currentProfession === newProfession) return;

        if (!$gameSwitches.value(380)) {
            const actorName = `\\N[${actorId}]`;
            const actor = colorTaggedText(1, actorName);
            const jobCur = '<' + colorTaggedText(1, currentProfession) + '>';
            const jobNew = '<' + colorTaggedText(2, newProfession) + '>';
            const professionChangeMessage =
                `　　` + `${actor}の役職名${jobCur}から${jobNew}に変更されました。`;
            TickerManager.show(professionChangeMessage);
        }

        $gameVariables.value(380 + actorId)[59] = newProfession;
    };

    message_popup2 = function (popupEventId, popupPosition, messageRow, displayModeId) {

        if (displayModeId == 0) {
            valueAutoSkipPicX = 0;
            $gameSystem.clearMessagePopupFree();
            $gameSystem.clearMessagePopup();
            $gameMessage.setMessageRow(4);
            return;
        };
        if (displayModeId != 1) return;

        valueAutoSkipPicX = 1000;
        $gameSystem.clearMessagePopupFree();
        if (popupEventId == 0) {
            $gameSystem.setMessagePopupFree(popupPosition[0], popupPosition[1]);
        } else {
            $gameSystem.setMessagePopup(popupEventId);
            if (popupPosition === 1) {
                $gameSystem.setPopupFixUpper(popupEventId);
            } else if (popupPosition === 2) {
                $gameSystem.setPopupFixLower(popupEventId);
            };
        };
        $gameMessage.setMessageRow(messageRow);

    };

    //配列に記録して控えメンバー0外す/1加える
    submember_saveAddRemove = function (changeModeId) {

        if (changeModeId == 0) {
            $gameParty.members().forEach(function (actor) {
                if (!actor.isBattleMember()) {
                    $gameVariables.value(154).push(actor._actorId);
                    $gameParty.removeActor(actor._actorId)
                };
            }, this);
        } else {
            if ($gameVariables.value(154) != 0) {
                $gameParty.addActor(23);
                $gameParty.addActor(24);
                $gameParty.addActor(25);
                //$gameParty.changeBattleMax($gameParty.battleMembers().length);
                var list = $gameVariables.value(154);
                list.forEach(function (id) {
                    var actor = $gameActors.actor(id);
                    if (!$gameParty.members().contains(actor) && actor.isLearnedSkill(18) && !actor.isStateAffected(valueDollStateId)) {
                        $gameParty.addActor(id);
                    };
                }, this);
                $gameVariables.setValue(154, []);
                //$gameParty.changeBattleMax(4);
                $gameParty.removeActor(23);
                $gameParty.removeActor(24);
                $gameParty.removeActor(25);
            };
        };

    };

    //プレイヤー位置記憶した場所に戻る。スイッチ140はそれぞれのコモンなりでoffにする
    set_playerPosition2 = function (varId) {

        var savedPosition = $gameVariables.value(varId);
        var mapId = Number(savedPosition[0]);
        var x = Number(savedPosition[1]);
        var y = Number(savedPosition[2]);
        $gamePlayer.reserveTransfer(mapId, x, y, 0, 2);
        SceneManager.goto(Scene_Map);
        //this.popScene();
        //$gamePlayer.setTransparent(false);
        //$gamePlayer.performTransfer();
        //console.log(`${arr1}`);

    };

    //プレイヤー位置記憶
    set_playerPosition1 = function (varId) {

        $gameVariables.setValue(varId, [$gameMap.mapId(), $gamePlayer._realX, $gamePlayer._realY]);
        //$gamePlayer.setTransparent(true);

    };

    //拠点強制帰還位置指定移動
    set_homeMoveForced = function () {

        $gameSwitches.setValue(140, false);
        $gameSwitches.setValue(486, true);
        var homeWeaponId = 22;
        for (var i = 1; i <= 100; i++) {
            if ($gameVariables.value(327)[i] == 2) {
                var homeWeaponId = i;
                break;
            };
        };
        var homePositionValues = $dataWeapons[homeWeaponId].meta['HomePosition'].split(',');
        $gameVariables.setValue(161, [Number(homePositionValues[0]), Number(homePositionValues[1]), Number(homePositionValues[2])]);
        set_playerPosition2(161);

    };

    //時計表示
    time_settei = function () {

        scene_joukensettei(1);
        scene_joukensettei(2);
        let statusIconText = $gameVariables.value(504) >= 1 ? `\\I[383]` : $gameVariables.value(505) >= 1 ? `\\I[382]` : `\\I[16]`;

        if ($gameParty.inBattle()) {
            if ($gameSwitches.value(95)) {
                statusIconText += `\\I[427]`;
            } else {
                statusIconText += `\\I[317]`;
            };
        } else {
            if ($gameVariables.value(517) >= 1) {
                statusIconText += `\\I[535]`;
            } else {
                if ($gameVariables.value(518) >= 1) {
                    statusIconText += `\\I[625]`;
                } else {
                    statusIconText += `\\I[16]`;
                }
            };
        };
        if ($gameParty.inBattle()) {
            if ($gameSwitches.value(146)) {
                statusIconText += `\\I[126]`;
            } else {
                statusIconText += `\\I[16]`;
            };
        };
        if ($gameSwitches.value(15)) {
            statusIconText += `\\I[418]`;
        } else {
            if ($gameSwitches.value(14)) {
                statusIconText += `\\I[417]`;
            } else {
                statusIconText += `\\I[416]`;
            }
        };
        let messageText = '';
        let pictureY = 680;
        let girlIconAddedFlag = 0;
        if (!$gameSwitches.value(209)) {//全体マップ以外で表示10
            if ($gameParty.inBattle()) {
                messageText = `${statusIconText}:+\\V[290,3]\\I[75]:\\V[263]\n\\I[176]:\\V[190]/\\V[189]\\V[332]\\I[127]:${valueMaxEnemyLv}\n`;
                for (let i = 0; i < $gameParty.battleMembers().length; i++) {
                    const actor = $gameParty.battleMembers()[i];
                    if (isGirl(actor)) {
                        if ($gameVariables.value(actor.actorId() + 380)[2] >= 1) {
                            if (girlIconAddedFlag == 0) { messageText += `\\I[376] `; girlIconAddedFlag = 1 };
                            if ($dataActors[actor.actorId()].meta['IconGura']) {
                                messageText += `\x1bI[${Number($dataActors[actor.actorId()].meta['IconGura'])}]`;
                            } else {
                                messageText += `${actor.name()}`;
                            };
                            messageText += `${$gameVariables.value(actor.actorId() + 380)[2]} `;
                            pictureY -= 28;
                        };
                    };
                };
                if (girlIconAddedFlag == 1) { messageText += `\n` };
                if (!$gameSwitches.value(211)) {
                    let enemyStateIds = [];
                    for (let i = 0; i < $gameTroop.members().length; i++) {
                        const enemy = $gameTroop.members()[i];
                        const enemyStates = enemy._states;
                        enemyStateIds = enemyStateIds.concat(enemyStates);
                    };
                    const uniqueStateIds = enemyStateIds.filter(function (x, i, self) {
                        return self.indexOf(x) === i;
                    });
                    let j = 0;
                    for (var i = 0; i <= uniqueStateIds.length - 1; i++) {
                        const stateId = uniqueStateIds[i];
                        if ($dataStates[stateId].iconIndex >= 1 && $dataStates[stateId].name !== '') {
                            messageText += `\x1bI[${$dataStates[stateId].iconIndex}]`;
                            j += 1;
                            if ((j % 9) == 0) {
                                messageText += `\n`;
                                pictureY -= 28;
                            };
                        }
                    };
                };
            } else {
                messageText = `${statusIconText}:\\V[56,3]`;
                if (!$gameParty.inBattle() && $gameSwitches.value(201)) { messageText += ` [\\C[10]\\V[335,2]\\C[0]/\\C[1]\\V[334,2]\\C[0]]` };
            };
            $gameScreen.setDTextPicture(messageText, 25);
            if ($gameSwitches.value(201) && !$gameParty.inBattle()) {
                $gameScreen.dTextRealTime = 'ON';
            };
            if ($gameParty.inBattle()) {
                $gameScreen.dTextAlign = 0;
                $gameScreen.dWindowFrame = 'ON';
                $gameScreen.showPicture(50, "", 0, 1010, pictureY, 80, 80, 250, 0);
                /*       if($gameSwitches.value(211)){
                       
                     } else {
                       //$gameScreen.showPicture(50,"",0,10,10,80,80,250,0);
                     }; */
            } else {
                $gameScreen.dTextAlign = 1;
                const var201 = $gameSwitches.value(201);
                const picId = var201 ? 760 : 860;
                $gameScreen.showPicture(50, "", 0, picId, 10, 100, 100, 255, 0);
                const picName = var201 ? "PictureBottan49d" : "PictureBottan49";
                $gameScreen.showPicture(49, picName, 0, 0, -5, 100, 100, 250, 0);
            };
        };

    };

    //エリクシール設定コンティニュー
    continue_settei = function (id) {

        const item = $dataItems[id];
        const itemMetaSwitchOnOffUseNum = Number(item.meta.SwicthOnOffUse);
        const isOn = $gameSwitches.value(itemMetaSwitchOnOffUseNum);
        const hasItemOn = $gameParty.hasItem(item) && isOn;

        item.name = hasItemOn ? item.meta.SwicthOnName : item.meta.SwicthOffName;
        $gameSwitches.setValue(itemMetaSwitchOnOffUseNum, hasItemOn); // correct value based on the item in inventory
        $gameParty.members().forEach(function (actor) {
            if (hasItemOn) actor.addState(25); else actor.removeState(25);
        });

    };

    //主人公パッシブ獲得
    actor_skilllearn1 = function (actorId) {

        let skillLearnedFlag = 0;
        //var value6 = 0;
        const actor = $gameActors.actor(actorId);
        const max = valueHeroGetSkill.length;
        for (var i = 0; i < max; i++) {
            if (skillLearnedFlag !== 0) break;

            const heroSkill = valueHeroGetSkill[i];
            if (!actor.isLearnedSkill(heroSkill)) {
                const dataSkill = $dataSkills[heroSkill];
                const mCharacterSkillLearnSwith = dataSkill.meta['MCharacterSkillLearnSwith'];
                if (mCharacterSkillLearnSwith) {
                    var learnConditionId = Number(mCharacterSkillLearnSwith);
                    if ($gameSwitches.value(learnConditionId)) {
                        skillLearnedFlag = 1;
                        break;
                    };
                };
                const mCharacterSkillLearnSkill = dataSkill.meta['MCharacterSkillLearnSkill'];
                if (mCharacterSkillLearnSkill) {
                    const learnConditionId = Number(mCharacterSkillLearnSkill);
                    if (actor.isLearnedSkill(learnConditionId)) {
                        skillLearnedFlag = 1;
                        break;
                    };
                };
                const mCharacterSkillLearnSRank = dataSkill.meta['MCharacterSkillLearnSRank'];
                if (mCharacterSkillLearnSRank) {
                    const mCharacterSkillLearnSRankArray = mCharacterSkillLearnSRank.split(',');
                    const learnConditionId = Number(mCharacterSkillLearnSRankArray[0]);
                    const masteryThreshold = Number(mCharacterSkillLearnSRankArray[1]);
                    if (actor.skillMasteryLevel(learnConditionId) >= masteryThreshold) {
                        skillLearnedFlag = 1;
                        break;
                    };
                };
            };
            if (skillLearnedFlag >= 1) {
                if (!$gameSwitches.value(29)) {
                    actor.learnSkill(valueHeroGetSkill[i]);
                };
                $gameVariables.setValue(19, valueHeroGetSkill[i]);
            };
        };
        //複合スキル
        if (skillLearnedFlag == 0) {//797見極め習得
            var id = valueIdentifySkillId;
            if (!actor.isLearnedSkill(id)) {
                const learnConditionSkillId = valueAppraisalSkillId;
                const learnConditionId = valueHarvestingSkillId;
                const masteryThreshold = 3;
                if (actor.isLearnedSkill(learnConditionSkillId) && actor.skillMasteryLevel(learnConditionId) >= masteryThreshold) {
                    actor.learnSkill(id);
                    $gameVariables.setValue(19, id);
                };
            };
        };
        if (skillLearnedFlag == 0) {//799大量採取
            var id = valueMassGatheringSkillId;
            if (!actor.isLearnedSkill(id)) {
                const learnConditionSkillId = valueHuntingSkillId;
                const learnConditionId = valueHarvestingSkillId;
                const masteryThreshold = 2;
                if (actor.skillMasteryLevel(learnConditionSkillId) >= masteryThreshold && actor.skillMasteryLevel(learnConditionId) >= masteryThreshold) {
                    actor.learnSkill(id);
                    $gameVariables.setValue(19, id);
                };
            };
        };

    };

    //パーティメンバーが通常攻撃派生スキル獲得。対象スキル範囲は101-200
    actor_skilllearn2 = function (actorId) {

        var learnAnimationId = 300;
        var value = "21_SkillLearn";
        var actor = $gameActors.actor(actorId);
        var start = 101;
        var end = 200;
        for (var i = start; i <= end; i++) {
            const skill = $dataSkills[i];
            if (skill.name === '') {
                continue;
            }
            const skillMetaNormalAttackDerived = skill.meta['NormalAttackDerived'];
            if (!skillMetaNormalAttackDerived) {
                continue;
            }

            var normalAttackDerivedValues = skillMetaNormalAttackDerived.split(',');
            var derivedSkillId = Number(normalAttackDerivedValues[1]);
            var masteryThreshold = Number(normalAttackDerivedValues[0]);
            if (!actor.isLearnedSkill(derivedSkillId) && actor.skillMasteryLevel(i) >= masteryThreshold) {
                actor.learnSkill(derivedSkillId);
                if (!$gameParty.inBattle()) {
                    $gamePlayer.requestAnimation(learnAnimationId)
                } else {
                    $gameParty.members()[actor.index()].startAnimation(learnAnimationId, false, 0);
                };
                AudioManager.playMe({ "name": value, "volume": 60, "pitch": 120, "pan": 0 });
                var learnMessage = `${actor.name()}の\x1bSIN[${i}]がRank${masteryThreshold}に到達し、\x1bSIN[${derivedSkillId}]が派生した！`;
                if ($gameParty.inBattle()) {
                    BattleManager._logWindow.push(`addText`, learnMessage);
                } else {
                    gab_wordParticle(learnMessage);
                };
            }
        };

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
        item.name = switchStateValue ? item.meta.SwicthOnName : item.meta.SwicthOffName;
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
        item.name = switchStateValue ? item.meta.SwicthOffName : item.meta.SwicthOnName;
        $gameSwitches.setValue(skillSwitchId, !switchStateValue);

        // show new state name
        const s = valueItemsType == 0 ? "S" : "I";
        const switchStateName = `\\C[2]\x1b${s}IN[${itemId}]\\C[0]`;
        TickerManager.show(`<${switchStateName}>に変更しました`);
    };

    //パーソナルスキルの所持者不在時にスイッチ自動off
    skill_personalonoffAutoOff = function (itemId, itemOrSkillType) {
        valueItems = itemOrSkillType == 0 ? $dataSkills : $dataItems;
        $gameSwitches.setValue(Number(valueItems[itemId].meta.SwicthOnOffUse), false);
    };

    //主人公がパーソナルスキルを道具で習得
    actor_personalskilllearn = function (a, b, itemId, itemOrSkillTypeId, skillId) {

        const actor = $gameActors.actor($gameVariables.value(2));
        if (b.actorId() == a.actorId()) {
            if (actor.isLearnedSkill(skillId)) {
                const actorName = `\\C[16]${actor.name()}\\C[0]`;
                const skillName = `\\C[2]\x1bSIN[${skillId}]\\C[0]`;
                if (itemOrSkillTypeId == 2) {
                    TickerManager.show(`${actorName}は既に${skillName}を習得済みのため効果は無かった。`);
                };
                if (itemOrSkillTypeId == 1) {
                    if (actor.skillMasteryLevel(skillId) >= Number($dataSkills[skillId].meta['Max Mastery Level'])) {
                        TickerManager.show(`${actorName}の${skillName}は最高ランクに到達しています…。`);
                    } else {
                        const skillRankNum = 10 * $gameVariables.value(203);
                        actor.gainSkillMasteryUses(skillId, skillRankNum);//変更熟練度
                        const skillRank = `\\C[3]${skillRankNum}\\C[0]`;
                        TickerManager.show(`${actorName}の${skillName}熟練度を${skillRank}獲得した！`);
                        const skillMasteryLevel = actor.skillMasteryLevel(skillId);
                        const skillMasteryUses = `\\C[2]${actor.skillMasteryUses(skillId)}`;
                        const skillMasteryUsageMax = `${actor.skillMasteryUsageMax(skillId)}\\C[0]`;
                        TickerManager.show(`Rank:${skillMasteryLevel} /熟練度${skillMasteryUses}(${skillMasteryUsageMax})`);
                        $gameParty.loseItem($dataItems[itemId], 1);
                    };
                };
            } else {
                actor.learnSkill(skillId);
                actor.setSkillMasteryLevel(skillId, 1);
                AudioManager.playMe({ "name": "21_SkillLearn", "volume": 60, "pitch": 120, "pan": 0 });
                const actorName = `\\C[16]${actor.name()}\\C[0]`;
                const skillName = `\\C[2]\x1bSIN[${skillId}]\\C[0]`;
                TickerManager.show(`${actorName}は${skillName}を習得した！`);
                $gameParty.loseItem($dataItems[itemId], 1);
            }
        };

    };

    //ステートオンオフ
    skill_stateonoff = function (actorA, actorB, skillId, stateId) {

        if (actorB.actorId() !== actorA.actorId()) return;

        const skill = $dataSkills[skillId];
        stateId = Number(skill.meta['SkillStateAddRemove']); // re set stateId, all using of skill_stateonoff use 0 value for stateId

        const actor = $gameActors.actor(actorB._actorId);
        const isStateAffected = $dataStates[stateId] !== null && actor.isStateAffected(stateId);
        if (isStateAffected) actor.removeState(stateId); else if ($dataStates[stateId] !== null) actor.addState(stateId);
        const animationId = isStateAffected ? 289 : 282;
        if ($gameParty.inBattle()) { actorB.startAnimation(animationId, true, 0) };
        if (skill.meta['TachieChangeSet']) {//たぶん使ってない isStateAffected
            actor.addState(20);
            $gameSwitches.setValue(96, true);
        };

        const actorName = `\\C[16]${actorB.name()}\\C[0]`;
        const skillName = `\\C[2]\x1bSIN[${skillId}]\\C[0]`;
        const message = isStateAffected ? `${actorName}の${skillName}が解除された。` : `${actorName}に${skillName}が付与された。`;
        TickerManager.show(message);
    };

    //スキルアイテム使用時に立ち絵が変化する場合。事前に$gameVariables.setValue(20,b.actorId());
    tachie_usedChange1 = function (gameActor) {

        const gameActorData = gameActor.actor();
        if (!gameActorData || !gameActorData.meta['Heroine']) return;

        if (!$gameSwitches.value(131) || !$gameParty.inBattle()) {
            if ($gameSwitches.value(42) && $gameVariables.value(3) == gameActor.actorId()) {
                const tachiePicId = gameActor.actor().meta['TachiePicId'];
                tachie_syoukyo1(tachiePicId); // getPreviousTachiePicId();
                tachie_settei3(gameActor);
                $gameVariables.setValue(20, $gameVariables.value(3));
                tachie_hyouji2(gameActor);
            } else {
                tachie_settei3(gameActor);
            };
        } else {
            tachie_settei3(gameActor);
        };
    };

    //スキルアイテム使用でのぶっかけ付与。
    bukkake_addSemen1 = function (user, target, itemId, valueItemsType) {

        var sourceEntries = valueItemsType == 0 ? $dataSkills : $dataItems;
        const heroineName = target.name();
        if ($dataActors[target.actorId()].meta['Heroine']) {
            target.addState(86);
            $gameVariables.setValue(20, target.actorId());
            tachie_usedChange1(target);

            TickerManager.show(`${heroineName}はぶっかけられた！`);
        } else {
            TickerManager.show(`${heroineName}は対象キャラでは無いため、効果が無かった…。`);

            if (valueItemsType == 1) {
                $gameParty.gainItem(sourceEntries[itemId], +1);
            };
        };

    };

    //スキルアイテム使用での精液回復。実際のステート回復は<Remove 1 State Category: StateSemen>で実施
    semen_reflesh1 = function (user, target, itemId, itemOrSkillTypeId) {

        var sourceEntries = itemOrSkillTypeId == 0 ? $dataSkills : $dataItems;
        const stateCategoryName = 'StateSemen';
        let semenCount = 0;

        const itemMetaSemenRemove = sourceEntries[itemId].meta['SemenRemove'];
        let end = itemMetaSemenRemove ? Number(itemMetaSemenRemove) : 1;

        const semenItem = $dataItems[120];
        for (let i = 1; i <= end; i++) {
            if (target.isStateCategoryAffected(stateCategoryName)) {
                target.removeStateCategory(stateCategoryName, 1);
                $gameParty.gainItem(semenItem, 1);//白濁瓶
                semenCount += 1;
            };
        };

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

        $gameVariables.setValue(20, target.actorId());
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
        };
    }

    //スキルアイテム使用での衣装修復
    cloth_repair1 = function (user, target, itemId, itemsToReturn) {

        const itemsSource = itemsToReturn == 0 ? $dataSkills : $dataItems;
        const targetName = target.name();
        if (target.isStateAffected(23)) {
            if (itemsToReturn == 1) $gameParty.gainItem(itemsSource[itemId], +1);
            showMessage(`現在の${targetName}は衣装修復対象ではありません。`);
        } else {
            $gameVariables.setValue(20, target.actorId());
            //const target = target; //const actor = $dataActors[$gameVariables.value(20)];
            if (target.actor().meta['Heroine']) {
                target.removeState(70);
                $gameVariables.setValue(19, Number(target.meta['MainCloth']));
                kisekae_tyokusetusitei($gameVariables.value(19), 0);
                tachie_usedChange1(target);
                showMessage(`${targetName}の衣装を修復しました。`);
            } else {
                if (itemsToReturn == 1) $gameParty.gainItem(itemsSource[itemId], +1);
                showMessage(`${targetName}は衣装修復の対象ではありません。`);
            }
        }

    };

    //スキルアイテム使用での状態異常クリア//0スキル1アイテム<abNomalClearCount:5>
    //<abNomalClearCountPlus:200>mat200につき1プラス,修正一律で300
    abNomal_Clear = function (a, b, itemId, itemOrSkillTypeId) {

        var skipOrCountFlag = 0;
        var sourceEntries = getItemsSourceSkillsItemsStates(itemOrSkillTypeId);
        if (sourceEntries[itemId].meta['abNomalClearCount']) {
            var clearCountRemaining = Number(sourceEntries[itemId].meta['abNomalClearCount']);
        } else {
            var clearCountRemaining = 1;
        };
        if (sourceEntries[itemId].meta['StateabNomalOnly']) {
            var stateCategory = b.getStateCategoryAffectedCount('StateabNomal');
            if (stateCategory == 0) {
                const targetName = b.name();
                var resultMessage = `${targetName}は基本状態異常を付与されていない為、効果が無かった。`;
                if (a.isActor()) {
                    if ($gameParty.inBattle()) {
                        BattleManager._logWindow.push(`addText`, resultMessage);
                    } else {
                        TickerManager.show(resultMessage);
                    };
                };
                if (itemOrSkillTypeId == 1) {
                    $gameParty.gainItem(sourceEntries[itemId], +1);
                };
                var skipOrCountFlag = 1;
            };
        } else {
            var stateCategory = b.getStateCategoryAffectedCount('StateabNomal') + b.getStateCategoryAffectedCount('StateSPabNomal');
            if (stateCategory == 0) {
                const targetName = b.name();
                var resultMessage = `${targetName}は基本特殊状態異常を付与されていない為、効果が無かった。`;
                if (a.isActor()) {
                    if ($gameParty.inBattle()) {
                        BattleManager._logWindow.push(`addText`, resultMessage);
                    } else {
                        TickerManager.show(resultMessage);
                    };
                };
                //if(id1 == 1){
                //$gameParty.gainItem(valueItems[itemId], +1);
                //};
                var skipOrCountFlag = 1;
            };
        };
        if (skipOrCountFlag == 0) {
            if (sourceEntries[itemId].meta['abNomalClearCountPlus']) {
                var stateCategory = Math.floor(a.param(4) / 300);
                if (stateCategory >= 1) {
                    const targetName = a.name();
                    const magic = colorTaggedText(16, 'Magic');
                    const amount = colorTaggedText(3, '+' + stateCategory);
                    var resultMessage = `${targetName}の${magic}により回復数${amount}！`;
                    if (a.isActor()) {
                        if ($gameParty.inBattle()) {
                            BattleManager._logWindow.push(`addText`, resultMessage);
                        } else {
                            TickerManager.show(resultMessage);
                        };
                    };
                    var clearCountRemaining = clearCountRemaining + stateCategory;
                };
            };
            var stateCategory = 'StateabNomal';
            if (b.isStateCategoryAffected(stateCategory)) {
                var skipOrCountFlag = b.getStateCategoryAffectedCount(stateCategory);
                if (skipOrCountFlag >= clearCountRemaining) {
                    var removedStateCount = clearCountRemaining;
                    var clearCountRemaining = 0;
                } else {
                    var removedStateCount = skipOrCountFlag;
                    var clearCountRemaining = clearCountRemaining - skipOrCountFlag;
                };
                b.removeStateCategory(stateCategory, removedStateCount);
                const targetName = b.name();
                const cnt = colorTaggedText(3, removedStateCount);
                var resultMessage = `${targetName}の基本状態異常を${cnt}個回復した！`;
                if ($gameParty.inBattle()) {
                    BattleManager._logWindow.push(`addText`, resultMessage);
                } else {
                    TickerManager.show(resultMessage);
                };
            };
            if (clearCountRemaining >= 1 && !sourceEntries[itemId].meta['StateabNomalOnly']) {
                var stateCategory = 'StateSPabNomal';
                if (b.isStateCategoryAffected(stateCategory)) {
                    var skipOrCountFlag = b.getStateCategoryAffectedCount(stateCategory);
                    if (skipOrCountFlag >= clearCountRemaining) {
                        var removedStateCount = clearCountRemaining;
                        var clearCountRemaining = 0;
                    } else {
                        var removedStateCount = skipOrCountFlag;
                        var clearCountRemaining = clearCountRemaining - skipOrCountFlag;
                    };
                    b.removeStateCategory(stateCategory, removedStateCount);
                    const targetName = b.name();
                    const cnt = colorTaggedText(3, removedStateCount);
                    var resultMessage = `${targetName}の特殊状態異常を${cnt}個回復した！`;
                    showMessage(resultMessage);
                };
            };
            /*
            if(clearCountRemaining >= 1){
             var stateCategory = 'StateUnique';
             if(b.isStateCategoryAffected(stateCategory)){
               var skipOrCountFlag = b.getStateCategoryAffectedCount(stateCategory);
                 if(skipOrCountFlag >= clearCountRemaining){
                   var removedStateCount = clearCountRemaining;
                   var clearCountRemaining = 0;
                 } else {
                   var removedStateCount = skipOrCountFlag;
                   var clearCountRemaining = clearCountRemaining - skipOrCountFlag;
                 };
               b.removeStateCategory(stateCategory, removedStateCount);
               var resultMessage = `${b.name()}の固有状態異常を\\C[3]${removedStateCount}\\C[0]個回復した！`;
               if($gameParty.inBattle()){
                 BattleManager._logWindow.push(`addText`, resultMessage);
               } else {
                 TickerManager.show(resultMessage);
               };
             };
            };
            */
        };

    };

    powerUp_dispel = function (a, b, itemId, itemOrSkillTypeId) {

        var dispelCountRemaining = 0;
        for (var i = 0; i < valueDispelGuardState.length; i++) {
            if (b.isStateAffected(valueDispelGuardState[i])) {
                var dispelCountRemaining = 1;
                var resultMessage = `${b.name()}のディスペル・ガード効果が発動！　強化消去を無効化した。`;
                showMessage(resultMessage);
                if ($gameParty.inBattle()) b.startAnimation(286, true, 0);
                break;
            };
        };
        if (dispelCountRemaining == 0) {
            var skipOrCountFlag = 0;
            var sourceEntries = getItemsSourceSkillsItemsStates(itemOrSkillTypeId);
            if (sourceEntries[itemId].meta['dispelCount']) {
                var dispelCountRemaining = Number(sourceEntries[itemId].meta['dispelCount']);
            } else {
                var dispelCountRemaining = 1;
            };
            var stateCategory = b.getStateCategoryAffectedCount('PowerUp');
            if (stateCategory == 0) {
                const targetName = b.name();
                var resultMessage = `${targetName}は強化状態を付与されていない為、効果が無かった。`;
                if (a.isActor()) {
                    if ($gameParty.inBattle()) {
                        BattleManager._logWindow.push(`addText`, resultMessage);
                    } else {
                        TickerManager.show(resultMessage);
                    };
                };
                //if(id1 == 1){
                //$gameParty.gainItem(valueItems[itemId], +1);
                //};
                var skipOrCountFlag = 1;
            };
            if (sourceEntries[itemId].meta['dispelCountPlus']) {
                var stateCategory = Math.floor(a.param(4) / 300);
                if (stateCategory >= 1) {
                    const targetName = a.name();
                    const magic = colorTaggedText(16, `Magic`);
                    const amount = colorTaggedText(3, '+' + stateCategory)
                    var resultMessage = `${targetName}の${magic}により消去数${amount}！`;
                    if (a.isActor()) {
                        if ($gameParty.inBattle()) {
                            BattleManager._logWindow.push(`addText`, resultMessage);
                        } else {
                            TickerManager.show(resultMessage);
                        };
                    };
                    var dispelCountRemaining = dispelCountRemaining + stateCategory;
                };
            };
            var stateCategory = 'PowerUp';
            if (b.isStateCategoryAffected(stateCategory)) {
                var skipOrCountFlag = b.getStateCategoryAffectedCount(stateCategory);
                if (skipOrCountFlag >= dispelCountRemaining) {
                    var removedStateCount = dispelCountRemaining;
                    var dispelCountRemaining = 0;
                } else {
                    var removedStateCount = skipOrCountFlag;
                    var dispelCountRemaining = dispelCountRemaining - skipOrCountFlag;
                };
                b.removeStateCategory(stateCategory, removedStateCount);
                const targetName = b.name();
                const cnt = colorTaggedText(3, removedStateCount)
                var resultMessage = `${targetName}の強化状態を${cnt}個消去した！`;
                if ($gameParty.inBattle()) {
                    BattleManager._logWindow.push(`addText`, resultMessage);
                } else {
                    TickerManager.show(resultMessage);
                };
            };
        };

    };

    const masteryLevel5R100Map = {
        1: `[D]`,
        2: `[C]`,
        3: `[B]`,
        4: `[A]`,
        5: `[S]`
    };
    const masteryLevel5Map = {
        1: '[E]',
        2: '[D]',
        3: '[C]',
        4: '[B]',
        5: '[A]'
    };
    const masteryLevel6Map = {
        1: `[E]`,
        2: `[D]`,
        3: `[C]`,
        4: `[B]`,
        5: `[A]`,
        6: `[S]`
    };
    const masteryLevel10R100Map =
    {
        1: '[D]', 2: '[D]',
        3: '[C]', 4: '[C]',
        5: '[B]', 6: '[B]',
        7: '[A]', 8: '[A]',
        9: '[S]', 10: '[S]'
    };
    const masteryLevel10Map = {
        1: '[E]', 2: '[E]',
        3: '[D]', 4: '[D]',
        5: '[C]', 6: '[C]',
        7: '[B]', 8: '[B]',
        9: '[A]', 10: '[A]'
    };
    //スキルアイテム使用での二つ名変更//0スキル1アイテムskillItem_titles(a,b,this.item().id,0);
    skillItem_titles = function (sourceActor, targetActor, itemId, ItemType) {
        // Only process if target is same as source actor
        if (targetActor.actorId() !== sourceActor.actorId()) return;

        const itemsData = ItemType == 0 ? $dataSkills : $dataItems;
        const itemData = itemsData[itemId];

        // Get appropriate sound effect parameters based on item type
        const soundEffectParams = getSoundEffectParamsSkillItemTitles(itemData, ItemType);

        // Get rank label based on item mastery level
        const skillRankLabel = getSkillRankLabelSkillItemTitles(targetActor, itemData, itemId, ItemType);

        // Update actor's title and display notification
        updateActorTitleSkillItemTitles(targetActor, itemData, skillRankLabel, soundEffectParams, ItemType, itemId);
    };

    // Determine appropriate sound effect based on item type and category
    function getSoundEffectParamsSkillItemTitles(itemData, ItemType) {
        // Default sound effect for title changes
        let soundEffectParams = ["Z11_NickNameChange", 50, 110, 0];

        const itemMeta = itemData.meta;

        // Check Menu Category for H titles
        if (itemMeta['Menu Category'] && itemMeta['Menu Category'] === " H'sTitle") {
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
        if (!itemMeta['RankUpPoint']) return '';

        const masteryLevel = actor.skillMasteryLevel(itemId);
        const maxMasteryLevel = Number(itemMeta['Max Mastery Level']);
        const rankUpPoint = Number(itemMeta['RankUpPoint']);

        // Select appropriate rank label based on max mastery level and rank up point
        switch (maxMasteryLevel) {
            case 6:
                return masteryLevel6Map[masteryLevel] || '';
            case 5:
                return (rankUpPoint >= 100 ?
                    masteryLevel5R100Map[masteryLevel] :
                    masteryLevel5Map[masteryLevel]) || '';
            case 10:
                return (rankUpPoint >= 100 ?
                    masteryLevel10R100Map[masteryLevel] :
                    masteryLevel10Map[masteryLevel]) || '';
            default:
                return '';
        }
    }

    // Update actor's title and display notification to player
    function updateActorTitleSkillItemTitles(actor, itemData, skillRankLabel, soundEffectParams, ItemType, itemId) {
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
            "name": soundEffectParams[0],
            "volume": Number(soundEffectParams[1]),
            "pitch": Number(soundEffectParams[2]),
            "pan": Number(soundEffectParams[3])
        });
    }

    // Special pattern for the libido-related skill
    // Helper function to determine rank label for libido level
    function getLibidoRankLabelSkillItemTitles(libidoValue) {
        if (libidoValue > 900) return '[SSS]';
        if (libidoValue > 800) return '[SS]';
        if (libidoValue > 600) return '[A]';
        if (libidoValue > 500) return '[B]';
        if (libidoValue > 400) return '[C]';
        if (libidoValue > 300) return '[D]';
        if (libidoValue > 200) return '[E]';
        return '[圏外]'; // Default for values 200 and below
    }

    //コモンイベントでスクリプト実行前に代入
    common_script1 = function (commonVar14, commonVar121, commonVar122, commonVar123, commonVar124, commonVar125, commonVar126, commonVar127, commonVar128, commonVar129) {

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
            $gameVariables.setValue(varId, getVariableValueSkillSentaku($gameVariables.value(varId), meta));
        }

        skill.name = getUpdatedSkillNameSkillSentaku($gameVariables.value(varId), meta, skill.name);
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
        $gameVariables.setValue(resultVarId, $gameVariables.value(actorId + 380)[50]);
    };

    //ウィンドウカラー変更
    const windowColor1Map = {
        0: [0, 0, 0],                // Default
        1: [170, 0, 170],            // H関係
        2: [-34, 153, 68],           // 一人称視点
        3: [170, 170, 0],            // その他（白と黄の間？）
        4: [-255, 170, 34]           // その他（薄水色）
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

        let spawnChanceOffset = 0;
        for (let troopId = 11; troopId <= 20; troopId++) {
            const enemyTroop = $dataTroops[troopId];
            const troopMeta = $dataItems[$gameVariables.value(240)].meta;
            enemyTroop.name = troopMeta['TroopName'];
            enemyTroop.members = []; //グループのメンバーを空に

            // get enemy count to spawn
            enemyCountToSpawn = calculateEnemyCountToSpawnEnemyTroopPush(troopMeta);

            // get enemy spawn pool
            const spawnResult = calculateSpawnPoolEnemyTroopPush(spawnChanceOffset);
            let spawnPool = spawnResult.pool;
            spawnChanceOffset = spawnResult.spawnChanceOffset;

            // add enemies to enemy troop
            const spawnPoolLength = spawnPool.length;
            const spawnTracker = { hasSpawned27: false, hasSpawned28: false };
            for (let spawnIndex = 1; spawnIndex <= enemyCountToSpawn; spawnIndex++) {
                // get enemy data      
                const enemySpawnId = resolveEnemySpawnIdEnemyTroopPush(spawnPool, spawnPoolLength, spawnTracker);
                const { spawnX, spawnY } = getSpawnCoordinatesEnemyTroopPush(
                    spawnIndex,
                    enemyCountToSpawn,
                    xOffsetOptions,
                    yNegativeOffsetOptions,
                    yPositiveOffsetOptions
                );
                let isHidden = (spawnIndex >= enemyCountToSpawn && enemyCountToSpawn != 1) ? true : false; //ラスト一人を隠している。エネミー一人の時は除外

                // add enemy
                const enemy = { enemyId: enemySpawnId, x: spawnX, y: spawnY, hidden: isHidden }; //追加するエネミーの設定(ID1、座標(100,100)、表示有)
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
                if ($gameParty.membersState(304)) { chanceRoll += 10; }
                if ($gameParty.membersState(305)) { chanceRoll += 10; }
                if ($gameParty.membersState(306)) { chanceRoll += 10; }
                if (chanceRoll >= 80) {
                    pool = pool.concat(specialPool);
                    spawnChanceOffset += 10;
                }
            }
        }
        return { pool, spawnChanceOffset };
    }

    function calculateEnemyCountToSpawnEnemyTroopPush(troopMeta) {
        const battleEnemyPopOptions = troopMeta['BattleEnemyPopC'].split(',');
        let enemyCountToSpawn = Number(battleEnemyPopOptions[getRandomIndex(battleEnemyPopOptions.length)]);
        if ($gameVariables.value(232) >= 2) {
            let additionalSpawnOffset = Math.floor(Math.random() * $gameVariables.value(232));
            enemyCountToSpawn += additionalSpawnOffset;
            if ($gameVariables.value(270) >= 11) {
                let bonusChance = getRandomIndex(101);
                if ($gameVariables.value(270) >= bonusChance) {
                    enemyCountToSpawn += 1;
                }
            }
        }
        if (enemyCountToSpawn >= 9) { enemyCountToSpawn = 8; }
        return enemyCountToSpawn;
    }

    function resolveEnemySpawnIdEnemyTroopPush(spawnPool, spawnPoolLength, tracker) {
        let enemySpawnId = Number(spawnPool[getRandomIndex(spawnPoolLength)]); // 出現エネミースポーン
        if (enemySpawnId === 27 && tracker.hasSpawned27 === true) { enemySpawnId = 21; }
        if (enemySpawnId === 27) { tracker.hasSpawned27 = true; } // id27を１体だけにする
        if (enemySpawnId === 28 && tracker.hasSpawned28 === true) { enemySpawnId = 22; }
        if (enemySpawnId === 28) { tracker.hasSpawned28 = true; } // id28を１体だけにする
        return enemySpawnId;
    }

    function getSpawnCoordinatesEnemyTroopPush(spawnIndex, enemyCountToSpawn, xOffsetOptions, yNegativeOffsetOptions, yPositiveOffsetOptions) {
        let spawnX, spawnY;
        if (spawnIndex == 1) { spawnX = 450; spawnY = 350; }
        if (enemyCountToSpawn == 1) { spawnX = 350; spawnY = 420; }
        if (spawnIndex == 2) { spawnX = 400; spawnY = 500; }
        if (spawnIndex == 3) { spawnX = 350; spawnY = 350; }
        if (spawnIndex == 4) { spawnX = 300; spawnY = 500; }
        if (spawnIndex == 5) { spawnX = 250; spawnY = 350; }
        if (spawnIndex == 6) { spawnX = 200; spawnY = 500; }
        if (spawnIndex == 7) { spawnX = 150; spawnY = 350; }
        if (spawnIndex == 8) { spawnX = 100; spawnY = 500; }

        if (spawnIndex >= 2 && spawnIndex <= 6) {
            spawnX += Number(xOffsetOptions[getRandomIndex(xOffsetOptions.length)]);
        }
        if (spawnIndex == 2 || spawnIndex == 4 || spawnIndex == 6 || spawnIndex == 8) {
            spawnY += Number(yNegativeOffsetOptions[getRandomIndex(yNegativeOffsetOptions.length)]);
        } else {
            spawnY += Number(yPositiveOffsetOptions[getRandomIndex(yPositiveOffsetOptions.length)]);
        }
        if (enemyCountToSpawn == 2) {
            if (spawnIndex == 2) { spawnX -= 200; }
        }
        if (enemyCountToSpawn == 3) {
            if (spawnIndex == 2) { spawnX -= 100; }
            if (spawnIndex == 3) { spawnX -= 100; }
        }
        if (enemyCountToSpawn == 4) {
            if (spawnIndex == 2) { spawnX -= 100; }
            if (spawnIndex == 3) { spawnX -= 100; }
            if (spawnIndex == 4) { spawnX -= 200; }
        }
        if (enemyCountToSpawn == 5) {
            if (spawnIndex == 3) { spawnX -= 100; spawnY += 50; }
            if (spawnIndex == 4) { spawnX -= 200; }
            if (spawnIndex == 5) { spawnX -= 100; }
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
        const troopMeta = $dataItems[$gameVariables.value(240)].meta;
        // H専用メタを持たないダンジョンもあるため、通常版のキーへフォールバックする
        enemyTroopH.name = troopMeta['TroopNameH'] || troopMeta['TroopName'];
        enemyTroopH.members = []; //グループのメンバーを空に
        const spawnPoolHLength = spawnPoolH.length;

        // add enemies to enemy troop
        const battleEnemyPopHOptions = (troopMeta['BattleEnemyPopCH'] || troopMeta['BattleEnemyPopC']).split(',');
        const enemyCountToSpawn = Number(battleEnemyPopHOptions[getRandomIndex(battleEnemyPopHOptions.length)]);
        for (let spawnIndex = 1; spawnIndex <= enemyCountToSpawn; spawnIndex++) {
            // get enemy data
            let enemySpawnId = Number(spawnPoolH[getRandomIndex(spawnPoolHLength)]) || 0; //出現エネミースポーン
            const { spawnX, spawnY } = getSpawnCoordinatesHEnemyTroopPush(spawnIndex, enemyCountToSpawn, xOffsetOptions, yNegativeOffsetOptions, yPositiveOffsetOptions);

            // add enemy
            // 元コードでも hidden は常に false 固定(算出していた value5 はコメントアウトされていた)
            const enemy = { enemyId: enemySpawnId, x: spawnX, y: spawnY, hidden: false }; //追加するエネミーの設定(ID1、座標(100,100)、表示有)
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

    function getSpawnCoordinatesHEnemyTroopPush(spawnIndex, enemyCountToSpawn, xOffsetOptions, yNegativeOffsetOptions, yPositiveOffsetOptions) {

        // Special case for single enemy
        if (enemyCountToSpawn === 1 && spawnIndex === 1) {
            return { spawnX: 350, spawnY: 420 };
        }

        // Get base position or default to {0, 0}
        const basePosition = spawnCoordinateBasePositions[spawnIndex] || { x: 0, y: 0 };
        let spawnX = basePosition.x;
        let spawnY = basePosition.y;

        // Apply random X offset for middle positions
        if (spawnIndex >= 2 && spawnIndex <= 6) {
            spawnX += Number(xOffsetOptions[getRandomIndex(xOffsetOptions.length)]);
        }

        // Apply random Y offset based on even/odd spawn index
        const isEven = spawnIndex % 2 === 0;
        const yOffsetOptions = isEven ? yNegativeOffsetOptions : yPositiveOffsetOptions;
        spawnY += Number(yOffsetOptions[getRandomIndex(yOffsetOptions.length)]);

        // Apply positioning adjustments based on enemy count
        if (enemyCountToSpawn === 2) {
            if (spawnIndex === 2) spawnX -= 200;
        }
        else if (enemyCountToSpawn === 3) {
            if (spawnIndex === 2) spawnX -= 100;
            if (spawnIndex === 3) spawnX -= 100;
        }
        else if (enemyCountToSpawn === 4) {
            if (spawnIndex === 2) spawnX -= 100;
            if (spawnIndex === 3) spawnX -= 100;
            if (spawnIndex === 4) spawnX -= 200;
        }
        else if (enemyCountToSpawn === 5) {
            if (spawnIndex === 3) {
                spawnX -= 100;
                spawnY += 50;
            }
            if (spawnIndex === 4) spawnX -= 200;
            if (spawnIndex === 5) spawnX -= 100;
        }

        return { spawnX, spawnY };
    }

    // Pre-define position mappings for different troop name patterns
    const enemyBossTroopPositionMappings = {
        'バハムート': { x: 150, y: 600 },
        '768': { x: 250, y: 768 },
        '600': { x: 250, y: 600 },
        '500': { x: 250, y: 500 },
        'big': { x: 250, y: 400 },
        'one': { x: 250, y: 330 }
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
            for (const [pattern, position] of Object.entries(enemyBossTroopPositionMappings)) {
                if (troop.name.match(pattern)) {
                    troop.members[0].x = position.x;
                    troop.members[0].y = position.y;
                    break; // Exit the loop once a match is found
                }
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

        // Handle enemy element and level data
        const enemyElementArray = itemMeta['EnemyElement'] ? itemMeta['EnemyElement'].split(',') : [0];
        const enemyLevelRange = itemMeta['EnemyLV'] ? itemMeta['EnemyLV'].split(',') : [0];
        const maxEnemyLevel = Math.max(...enemyLevelRange);
        const minEnemyLevel = Math.min(...enemyLevelRange);

        // Check if it's a dungeon map
        let isDungeonMap = itemMeta['OnSwitch'] && itemMeta['OnSwitch'].split(',').map(Number).includes(207);

        // Build header text
        const locationType = isDungeonMap ? 'ダンジョン' : 'フィールド';
        const glossaryText = [];

        glossaryText.push(`\\C[16]＜${locationType}マップ情報＞\\C[0]\n`);
        glossaryText.push(`${itemData.description}\n`);
        glossaryText.push(`\\C[16]エネミーLV：\\C[0]\\C[10]${minEnemyLevel}\\C[0]～\\C[10]${maxEnemyLevel}\\C[0]　`);

        // Add element info
        glossaryText.push(`　　\\C[16]属性：\\C[0]`);
        if (!itemMeta['EnemyElement'] || Number(itemMeta['EnemyElement']) === 0) {
            glossaryText.push(`？？？`);
        } else {
            enemyElementArray.forEach(elem => {
                const stateData = dataStates[Number(elem)];
                if (!stateData) return;
                glossaryText.push(`【\\C[13]${stateData.name}\\C[0]】　`);
            });
        }

        // Add annihilation count
        const annCount = gameVariables.value(257)[itemId];
        if (annCount >= 1) {
            glossaryText.push(`\\C[16]殲滅回数：\\C[0]\\C[10]${annCount}\\C[0]　\n`);
        } else {
            glossaryText.push(`\n`);
        }

        // Add first annihilation reward
        if (itemMeta['firstAnnihilationItem'] && annCount >= 1) {
            const firstAnnihilationItemArray = itemMeta['firstAnnihilationItem'].split(',');
            const itemType = Number(firstAnnihilationItemArray[0]);
            const rewardItems = itemType === 0 ? dataItems : itemType === 1 ? $dataWeapons : $dataArmors;
            const item = rewardItems[Number(firstAnnihilationItemArray[1])].name;
            glossaryText.push(`\\C[16]初回殲滅報酬：\\C[0]\\C[10]${item}\\C[0]　\n`);
        }

        // Add treasure chest info
        if (itemMeta['TchestOnly'] && gameVariables.value(212)[itemId] >= 1) {
            const treasureChestArray = itemMeta['TchestOnly'].split(',');
            const itemType = Number(treasureChestArray[3]);
            const treasureItems = itemType === 0 ? dataItems : itemType === 1 ? $dataWeapons : $dataArmors;
            const item = treasureItems[Number(treasureChestArray[4])].name;
            glossaryText.push(`\\C[16]白箱：\\C[0]\\C[10]${item}\\C[0]　\n`);
        }

        // Add unique materials
        glossaryText.push(Glossarytext1AddUniqueMaterials(itemMeta, dataItems));

        // Add enemy information
        glossaryText.push(`\\C[16]・出現エネミー\\C[0]\n`);
        let enemyCount = 0;
        const enemyPopArray = [];

        // Collect enemy info
        for (let i = 1; i <= 8; i++) {
            if (!itemMeta['PopEnemy' + i]) continue;

            const enemyInfo = itemMeta['PopEnemy' + i].split(',');
            enemyPopArray.push(enemyInfo);

            glossaryText.push(`【\\C[2]${enemyInfo[1]}\\C[0]】`);
            enemyCount += 1;
            if ((i % 2) === 0) {
                glossaryText.push(`\n`);
            }
        }
        glossaryText.push(`\n`);

        // Process enemy data
        glossaryText.push(Glossarytext1ProcessEnemyData(enemyPopArray, dataEnemies, dataStates, itemMeta));

        // Store result in variable
        gameVariables.value(variableId)[itemId] = glossaryText.join('');
    };

    // Helper function to process unique materials
    function Glossarytext1AddUniqueMaterials(itemMeta, dataItems) {
        const materialTextArray = [];
        let materialCount = 0;

        for (let i = 1; i <= 10; i++) {
            if (!itemMeta['UniqueMaterial' + i]) continue;

            if (materialCount === 0) {
                materialTextArray.push(`\n\\C[16]・希少採取素材\\C[0]`);
            }

            const uniqueMaterialArray = itemMeta['UniqueMaterial' + i].split(',');
            if (uniqueMaterialArray[0] >= 1) {
                const item = dataItems[Number(uniqueMaterialArray[0])].name;
                materialTextArray.push(`【\\C[3]${item}\\C[0]】`);
                materialCount += 1;

                if ((materialCount % 3) === 0) {
                    materialTextArray.push(`\n`);
                }
            }
        }

        return materialTextArray.join('') + `\n`;
    }

    // Helper function to process enemy data
    function Glossarytext1ProcessEnemyData(enemyPopArray, dataEnemies, dataStates, itemMeta) {
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
            if (baseEnemy.meta['Passive State']) {
                const passiveStateArray = baseEnemy.meta['Passive State'].split(',');
                passiveStateArray.forEach(stateId => {
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
        if (itemMeta['EnemySpecialState']) {
            const specialStateArray = itemMeta['EnemySpecialState'].split(',');
            specialStateArray.forEach(stateId => {
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

            valueEnemyAddState.forEach(stateId => {
                const state = dataStates[stateId];

                // Check name-based conditions
                if (state.meta['NameCondiAddState']) {
                    const nameConditions = state.meta['NameCondiAddState'].split(',');
                    const nameMatch = nameConditions.some(cond => enemy.name.match(cond));

                    if (nameMatch && !processedStateNames.has(state.name)) {
                        processedText.push(`【\\C[14]${state.name}\\C[0]】`);
                        processedStateNames.add(state.name);
                        conditionStateCount += 1;

                        if ((conditionStateCount % 3) === 0) {
                            processedText.push(`\n`);
                        }
                    }
                }

                // Check graphic-based conditions
                if (state.meta['GraphicNameCondiAddState']) {
                    const graphicConditions = state.meta['GraphicNameCondiAddState'].split(',');
                    const graphicMatch = graphicConditions.some(cond => enemy.battlerName.match(cond));

                    if (graphicMatch && !processedStateNames.has(state.name)) {
                        processedText.push(`【\\C[14]${state.name}\\C[0]】`);
                        processedStateNames.add(state.name);
                        conditionStateCount += 1;

                        if ((conditionStateCount % 3) === 0) {
                            processedText.push(`\n`);
                        }
                    }
                }
            });
        }

        return processedText.join('');
    }

    //図鑑のテキスト代入ボス分$gameVariables.value(305)[id]
    scene_Glossarytext2 = function (itemId, variableId) {
        const itemData = $dataItems[itemId];
        const glossaryText = [`\\C[16]＜ボス情報＞\\C[0]\n`];

        if (itemData.meta['BossEnemy']) {
            const bossInfo = itemData.meta['BossEnemy'].split(',');
            const bossName = bossInfo[1];
            const bossDefeated = $gameVariables.value(305)[itemId] >= 1;

            if (bossDefeated) {
                const bossLevel = Number(itemData.meta['BossLV']);
                const defeatedCount = $gameVariables.value(305)[itemId];

                glossaryText.push(`\\C[16]名前：\\C[0]${bossName}　ＬＶ：${bossLevel}　`);
                glossaryText.push(`\\C[16]討伐回数：\\C[0]\\C[10]${defeatedCount}\\C[0] \n`);

                const normalAttackId = Number(bossInfo[4]);
                const normalAttackSkill = $dataSkills[normalAttackId];
                glossaryText.push(`\\C[16]通常攻撃\\C[0]\\I[${normalAttackSkill.iconIndex}]${normalAttackSkill.name} `);

                if (itemData.meta['BossAddAttack']) {
                    const additionalAttacks = itemData.meta['BossAddAttack'].split(',');

                    for (let i = 0; i < additionalAttacks.length; i++) {
                        const skillId = Number(additionalAttacks[i]);
                        const attackSkill = $dataSkills[skillId];
                        glossaryText.push(`\\I[${attackSkill.iconIndex}]${attackSkill.name} `);
                    }
                }

                glossaryText.push(`\n`);

                const abilityId = Number(bossInfo[5]);
                const abilitySkill = $dataSkills[abilityId];
                glossaryText.push(`\\C[16]アビリティ\\C[0]\\I[${abilitySkill.iconIndex}]${abilitySkill.name}\n`);

                let abilityDescription = abilitySkill.description;
                abilityDescription = abilityDescription.replace("[\\C[2]戦闘中1回\\C[0]]", "");
                glossaryText.push(`${abilityDescription}\n`);

                if (itemData.meta['BossAddSkill']) {
                    const additionalSkills = itemData.meta['BossAddSkill'].split(',');

                    for (let i = 0; i < additionalSkills.length; i++) {
                        const skillId = Number(additionalSkills[i]);
                        const skill = $dataSkills[skillId];
                        glossaryText.push(`\\I[${skill.iconIndex}]${skill.name}\n`);
                    }
                }

                const ultimateId = Number(bossInfo[6]);
                const ultimateSkill = $dataSkills[ultimateId];
                glossaryText.push(`\\C[16]奥義\\C[0]\\I[${ultimateSkill.iconIndex}]${ultimateSkill.name}\n`);

                let ultimateDescription = ultimateSkill.description;
                ultimateDescription = ultimateDescription.replace("[\\C[2]戦闘中1回\\C[0]]", "");
                glossaryText.push(`${ultimateDescription}\n`);

                if (itemData.meta['BossStateInformation']) {
                    glossaryText.push(`\n`);
                    const stateInfos = itemData.meta['BossStateInformation'].split(',');

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

        $gameVariables.value(variableId)[itemId] = glossaryText.join('');
    };

    //図鑑のテキスト代入ボス特殊行動
    scene_Glossarytext3 = function (itemId, variableId) {
        const glossaryText = [];
        const itemData = $dataItems[itemId];
        let specialActionCount = 0;

        glossaryText.push(`\\C[16]＜ボス特殊行動一覧＞\\C[0]\n`);

        // If boss hasn't been defeated yet, show placeholder text
        if ($gameVariables.value(305)[itemId] < 1) {
            glossaryText.push(`情報なし。討伐後に情報更新。`);
            $gameVariables.value(variableId)[itemId] = glossaryText.join('');
            return;
        }

        // Process all possible special actions
        for (let actionIndex = 1; actionIndex <= 15; actionIndex++) {
            const metaKey = 'BossSpecialAction' + actionIndex;
            if (!itemData.meta[metaKey]) continue;

            specialActionCount++;
            const actionData = itemData.meta[metaKey].split(',');
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

        $gameVariables.value(variableId)[itemId] = glossaryText.join('');
    };

    // Helper function to get trigger text based on type and value
    function getTriggerText(triggerType, triggerValue) {
        switch (triggerType) {
            case 0:
            case 9:
                return `<\\C[2]HP${triggerValue}%\\C[0]以下で発動>\n`;
            case 1:
                return `<\\C[2]MP${triggerValue}%\\C[0]以下で発動>\n`;
            case 2:
                return `<\\C[2]${triggerValue}%\\C[0]ターン毎に発動>\n`;
            case 3:
                return `<\\C[2]オーバードライブ\\C[0]時に発動>\n`;
            default:
                return `<\\C[2]特殊条件\\C[0]で発動>\n`;
        }
    }

    //マップ情報を代入
    const jouhouMapResetVariableIds = [37, 81, 82, 197, 207, 222, 224, 226, 227, 232, 230, 235, 236, 240, 241, 251, 256, 260, 266, 329, 507, 508];
    jouhou_map = function () {
        // Run on every map loading

        const gameVariables = $gameVariables;
        const gameSwitches = $gameSwitches;
        const dataMap = $dataMap;

        // Reset map-related switches and variables
        for (let i = 201; i <= 377; i++) {
            gameSwitches.setValue(i, false);
        }

        jouhouMapResetVariableIds.forEach(varId => {
            gameVariables.setValue(varId, 0);
        });

        // Process conditional map switches
        const conditionalMapSwitches = gameVariables.value(356);
        const foundMapSwitch = processMapConditionalSwitches(dataMap, gameSwitches, gameVariables, conditionalMapSwitches);

        // Apply default map switches if no conditions matched
        if (foundMapSwitch === 0 && dataMap.meta['MapSwi']) {
            const switchIds = dataMap.meta['MapSwi'].split(',').map(Number);
            switchIds.forEach(switchId => {
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
        const mapInfo = determineMapInfoSource(dataMap, gameVariables, gameSwitches);

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
        setupMapBattlebacksAndParallax(mapInfo, dataMap, gameVariables, gameSwitches, $gameMap);

        // Configure BGS and BGM
        setupMapBackgroundAudio(mapInfo, dataMap, gameVariables, gameSwitches);
    };

    // Helper Functions

    processMapConditionalSwitches = function (dataMap, gameSwitches, gameVariables, conditionalMapSwitches) {
        let foundMapSwitch = 0;
        const dataMapMeta = dataMap.meta;

        // Check variable-based conditional switches
        for (let i = 9; i > 0; i--) {
            const varKey = 'ChangeMapVal' + i;
            const switchKey = 'MapSwiCVal' + i;

            if (!dataMapMeta[varKey] || !dataMapMeta[switchKey]) continue;

            const [varId, varValue] = dataMapMeta[varKey].split(',').map(Number);
            if (gameVariables.value(varId) < varValue) continue;

            mapActivateConditionalSwitches(dataMapMeta[switchKey], gameSwitches, conditionalMapSwitches);
            foundMapSwitch = 1;
            break;
        }

        // Check switch-based conditional switches if no variable conditions matched
        if (foundMapSwitch === 0) {
            for (let i = 9; i > 0; i--) {
                const switchCondKey = 'ChangeMapSwi' + i;
                const targetSwitchKey = 'MapSwiCSwi' + i;

                if (!dataMapMeta[switchCondKey] || !dataMapMeta[targetSwitchKey]) continue;

                const condSwitchId = Number(dataMapMeta[switchCondKey]);
                if (!gameSwitches.value(condSwitchId)) continue;

                mapActivateConditionalSwitches(dataMapMeta[targetSwitchKey], gameSwitches, conditionalMapSwitches);
                foundMapSwitch = 1;
                break;
            }
        }

        return foundMapSwitch;
    };

    mapActivateConditionalSwitches = function (switchIdString, gameSwitches, conditionalMapSwitches) {
        const switchIds = switchIdString.split(',').map(Number);

        switchIds.forEach(switchId => {
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

        if (dataMapMeta['OutIn_Froor']) {
            const [type, value] = dataMapMeta['OutIn_Froor'].split(',').map(Number);
            mapMeta.outInFloorType = type;
            mapMeta.outInFloorValue = value;
        }

        if (dataMapMeta['NPC']) mapMeta.npcType = Number(dataMapMeta['NPC']);
        if (dataMapMeta['Home']) mapMeta.homeType = Number(dataMapMeta['Home']);
        if (dataMapMeta['Animal']) mapMeta.animalType = Number(dataMapMeta['Animal']);

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
        valueJouhouTown.forEach(weaponId => {
            const switchId = Number(dataWeapons[weaponId].meta['MapSwitch']);
            if (gameSwitches.value(switchId)) {
                gameVariables.setValue(230, weaponId);
                gameSwitches.setValue(202, true);
            }
        });

        // Check battle map locations
        const dataItems = $dataItems;
        valueJouhouBattleMap.forEach(itemId => {
            const switchId = Number(dataItems[itemId].meta['MapSwitch']);
            if (gameSwitches.value(switchId)) {
                gameVariables.setValue(240, itemId);
                gameSwitches.setValue(201, true);
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
        if (gameVariables.value(240) >= 1) {
            const battleMapId = gameVariables.value(240);
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
        const seKey = gameSwitches.value(15) ? 'StartSeN' : 'StartSe';

        if (!mapInfo.meta[seKey]) return;

        const [seName, seVolume, sePitch] = mapInfo.meta[seKey].split(',');
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
        gameVariables.setValue(350, []);
        const specialStates = gameVariables.value(350);

        // Add enemy special states if available
        if (mapInfoMeta['EnemySpecialState']) {
            const stateIds = mapInfoMeta['EnemySpecialState'].split(',').map(Number);
            stateIds.forEach(stateId => {
                if (stateId >= 1) {
                    specialStates.push(stateId);
                }
            });
        }

        // Set various map-specific variables
        if (mapInfoMeta['getWaterItem']) {
            gameVariables.setValue(266, Number(mapInfoMeta['getWaterItem']));
        }

        if (mapInfoMeta['weatherSetP']) {
            gameVariables.setValue(256, Number(mapInfoMeta['weatherSetP']));
        }

        const weatherKey = 'weatherSetPN';
        if (mapInfoMeta[weatherKey]) {
            gameVariables.setValue(251, Number(mapInfoMeta[weatherKey]));
        } else if ($dataMap.meta[weatherKey]) {
            gameVariables.setValue(251, Number($dataMap.meta[weatherKey]));
        }

        // Set mob related variables
        if (mapInfoMeta['MapCount']) {
            gameVariables.setValue(217, Number(mapInfoMeta['MapCount']));
        }

        if (mapInfoMeta['MapEnemyMaxPop']) {
            gameVariables.setValue(334, Number(mapInfoMeta['MapEnemyMaxPop']));
        }

        if (mapInfoMeta['MapEnemyPopC']) {
            gameVariables.setValue(224, Number(mapInfoMeta['MapEnemyPopC']));
        }

        if (mapInfoMeta['MapEnemyPopCH']) {
            gameVariables.setValue(227, Number(mapInfoMeta['MapEnemyPopCH']));
        }

        if (mapInfoMeta['HEnemyPopSwi']) {
            gameVariables.setValue(236, Number(mapInfoMeta['HEnemyPopSwi']));
        }

        if (mapInfoMeta['DeadBody']) {
            gameVariables.setValue(260, Number(mapInfoMeta['DeadBody']));
        }

        // Set enemy level variable
        if (mapInfoMeta['EnemyLV']) {
            gameVariables.setValue(270, Number(mapInfoMeta['EnemyLV'].split(',')[0]));
        }

        // Set switches from OnSwitch metadata
        const gameSwitches = $gameSwitches;
        if (mapInfoMeta['OnSwitch']) {
            const switchIds = mapInfoMeta['OnSwitch'].split(',').map(Number);
            switchIds.forEach(switchId => {
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
        if (mapInfoMeta['EscapeMapID']) {
            const [mapId, x, y] = mapInfoMeta['EscapeMapID'].split(',').map(Number);
            positions[0] = mapId;
            positions[1] = x;
            positions[2] = y;
        }

        // Set move position
        if (mapInfoMeta['MoveMapID']) {
            const [mapId, x, y] = mapInfoMeta['MoveMapID'].split(',').map(Number);
            positions[0] = mapId;
            positions[1] = x;
            positions[2] = y;
        }

        // Set permission cloth
        const clothKey = 'PermissionCloth';
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
            if (mapInfoMeta['BG' + idx]) {
                Galv.CACHE.load('parallaxes', mapInfoMeta['BG' + idx].split(',')[0]);
            }

            if (mapInfoMeta['BGN' + idx]) {
                Galv.CACHE.load('parallaxes', mapInfoMeta['BGN' + idx].split(',')[0]);
            }

            // Set unique material IDs
            if (mapInfoMeta['UniqueMaterial' + idx]) {
                const materialId = Number(mapInfoMeta['UniqueMaterial' + idx].split(',')[0]);
                gameVariables.value(259)[idx] = materialId;
            }
        }
    };

    setupMapEnemiesAndBoss = function (mapInfo) {
        // Setup enemies if defined
        if (mapInfo.meta['PopEnemy1'] || mapInfo.meta['PopEnemy9']) {
            popEnemy_setUp(mapInfo);
            enemy_troopPush();
            henemy_troopPush();
        }

        // Setup boss if defined
        if (mapInfo.meta['BossEnemy']) {
            boss_setup1(1, 0);
        }
    };

    setupMapBattlebacksAndParallax = function (mapInfo, dataMap, gameVariables, gameSwitches, gameMap) {
        // Initialize background related variables
        let bgKey = 0;
        let battleBgKey = 0;
        let battleBgName = gameSwitches.value(15) ? 'StarlitSkyBattle' : 'BlueSkyBattle';
        let battleBg1 = 0;
        let battleBg2 = 0;

        // Determine background keys based on environment
        if (gameVariables.value(230) >= 1) {
            if (gameSwitches.value(203)) {
                if (gameSwitches.value(15)) {
                    bgKey = 'BG_outN';
                    battleBgKey = 'TownOutdoorN';
                } else {
                    bgKey = 'BG_out';
                    battleBgKey = 'TownOutdoor';
                }
            } else if (gameSwitches.value(204)) {
                if (gameSwitches.value(15)) {
                    bgKey = 'BG_inN';
                    battleBgKey = 'TownIndoorN';
                } else {
                    bgKey = 'BG_in';
                    battleBgKey = 'TownIndoor';
                }
            }

            // Set battleback if a key was determined
            if (battleBgKey) {
                gameMap.changeBattleback(battleBgName, battleBgKey);
            }
        }

        const mapInfoMeta = mapInfo.meta;

        // Handle battle map backgrounds
        if (gameVariables.value(240) >= 1) {
            // Determine background keys
            if (mapInfoMeta['BG2']) {
                bgKey = 'BG2';
                battleBgKey = 'BG2';
            }
            if (mapInfoMeta['BG1']) {
                battleBgName = 'BG1';
            }
            // Night versions
            if (gameSwitches.value(15)) {
                if (mapInfoMeta['BGN2']) {
                    bgKey = 'BGN2';
                    battleBgKey = 'BGN2';
                }
                if (mapInfoMeta['BGN1']) {
                    battleBgName = 'BGN1';
                }
            }
            // Set battleback if keys are available
            if (battleBgKey && mapInfoMeta[battleBgName] && mapInfoMeta[battleBgKey]) {
                const battlebackName = mapInfoMeta[battleBgName].split(',')[0];
                const battlefrontName = mapInfoMeta[battleBgKey].split(',')[0];
                gameMap.changeBattleback(battlebackName, battlefrontName);
            }
        }

        // Set background variables if a key was determined
        if (bgKey) {
            setMapBgVariables(gameVariables, mapInfo, bgKey);
        }

        // Apply parallax settings changes
        parallaxesSound_switchChange(1);

        const dataMapMeta = dataMap.meta;

        // Override backgrounds from map metadata if specified
        if (gameSwitches.value(15)) {
            if (dataMapMeta['BGchangeN']) {
                mapInfo = dataMap;
                bgKey = 'BGchangeN';
                battleBg1 = 1;
            }
            if (dataMapMeta['BattleBGChange1N']) {
                mapInfo = dataMap;
                battleBgName = dataMapMeta['BattleBGChange1N'].split(',')[0];
                battleBg2 = 1;
            }
            if (dataMapMeta['BattleBGChange2N']) {
                mapInfo = dataMap;
                battleBgKey = dataMapMeta['BattleBGChange2N'].split(',')[0];
                battleBg2 = 1;
            }
        } else {
            if (dataMapMeta['BGchange']) {
                mapInfo = dataMap;
                bgKey = 'BGchange';
                battleBg1 = 1;
            }
            if (dataMapMeta['BattleBGChange1']) {
                mapInfo = dataMap;
                battleBgName = dataMapMeta['BattleBGChange1'].split(',')[0];
                battleBg2 = 1;
            }
            if (dataMapMeta['BattleBGChange2']) {
                mapInfo = dataMap;
                battleBgKey = dataMapMeta['BattleBGChange2'].split(',')[0];
                battleBg2 = 1;
            }
        }

        // Apply override background settings
        if (battleBg1) {
            setMapBgVariables(gameVariables, mapInfo, bgKey);
        }
        if (battleBg2) {
            gameMap.changeBattleback(battleBgName, battleBgKey);
        }

        // Set up parallax if defined
        if (gameVariables.value(508) !== 0 && dataMapMeta['ParallaxSet']) {
            const parallaxScrollX = gameVariables.value(81) !== 0;
            const parallaxScrollY = gameVariables.value(82) !== 0;
            gameMap.changeParallax(
                gameVariables.value(508),
                parallaxScrollX,
                parallaxScrollY,
                gameVariables.value(81),
                gameVariables.value(82)
            );
        }
    };

    setupMapBackgroundAudio = function (mapInfo, dataMap, gameVariables, gameSwitches) {
        // Set up BGS (background sound)
        const bgsKey = gameSwitches.value(15) ? 'BGSN' : 'BGS';
        let currentMapInfo = determineAudioMapInfoSource(mapInfo, dataMap, gameVariables, bgsKey);

        if (currentMapInfo.meta[bgsKey]) {
            const [bgsName, bgsVolume, bgsPitch, bgsPan] = currentMapInfo.meta[bgsKey].split(',');

            if (bgsName !== valueMapBGS[0]) {
                valueMapBGS = [bgsName, Number(bgsVolume), Number(bgsPitch), Number(bgsPan)];

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
        const bgmKey = gameSwitches.value(15) ? 'BGMN' : 'BGM';
        currentMapInfo = determineAudioMapInfoSource(mapInfo, dataMap, gameVariables, bgmKey);

        if (currentMapInfo.meta[bgmKey]) {
            const [bgmName, bgmVolume, bgmPitch, bgmPan] = currentMapInfo.meta[bgmKey].split(',');
            valueMapBGM = [bgmName, Number(bgmVolume), Number(bgmPitch), Number(bgmPan)];

            parallaxesSound_switchChange(2);

            if (!gameSwitches.value(124)) {
                if (bgmName === 'NoMusic') {
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

    determineAudioMapInfoSource = function (mapInfo, dataMap, gameVariables, metaKey) {
        // Reset to base map info
        let currentMapInfo = mapInfo;

        // Check if battle map info should be used
        if (gameVariables.value(240) >= 1) {
            currentMapInfo = $dataItems[gameVariables.value(240)];
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
            const bgMeta = mapInfo.meta[bgKey].split(',');
            gameVariables.setValue(508, bgMeta[0]);
            gameVariables.setValue(81, Number(bgMeta[1]));
            gameVariables.setValue(82, Number(bgMeta[2]));
        }
    }

    //スイッチに応じて遠景と音楽設定スクリプト
    parallaxesSound_switchChange = function (switchStateId) {

        if (switchStateId == 2) {
            if ($gameSwitches.value(233)) {//結果を渡すためにverは付けない
                if (!$gameSwitches.value(15)) {
                    valueMapBGM = ['41_TownTemple', 50, 100, 0];
                };
            };
            if ($gameSwitches.value(237)) {
                if (!$gameSwitches.value(15)) {
                    valueMapBGM = ['41_Guild', 50, 100, 0];
                };
            };
        };
        if (switchStateId == 1) {
            if ($gameSwitches.value(233)) {
                $gameVariables.setValue(508, 'BG_Temple');
                $gameVariables.setValue(81, 0);
                $gameVariables.setValue(82, 0);
                if ($gameSwitches.value(15)) {
                    $gameVariables.setValue(508, $gameVariables.value(508) + 'N');
                };
            };
            if ($gameSwitches.value(234)) {
                $gameVariables.setValue(508, 'BG_Shop1Items');
                $gameVariables.setValue(81, 0);
                $gameVariables.setValue(82, 0);
                if ($gameSwitches.value(15)) {
                    $gameVariables.setValue(508, $gameVariables.value(508) + 'N');
                };
            };
            if ($gameSwitches.value(235)) {
                $gameVariables.setValue(508, 'BG_Shop3Weapons');
                $gameVariables.setValue(81, 0);
                $gameVariables.setValue(82, 0);
                if ($gameSwitches.value(15)) {
                    $gameVariables.setValue(508, $gameVariables.value(508) + 'N');
                };
            };
            if ($gameSwitches.value(237)) {
                $gameVariables.setValue(508, 'BG_Shop3Weapons');
                $gameVariables.setValue(81, 0);
                $gameVariables.setValue(82, 0);
                if ($gameSwitches.value(15)) {
                    $gameVariables.setValue(508, $gameVariables.value(508) + 'N');
                };
            };
        };

    };

    //雑魚エネミー設定スクリプト
    popEnemy_setUp = function (value) {

        $gameVariables.setValue(220, []);//そのダンジョンに出現するエネミーID
        $gameVariables.setValue(228, []);//そのダンジョンに出現するエロエネミーID
        $gameVariables.setValue(242, []);//そのダンジョンに出現するレアエネミーID
        $gameVariables.setValue(345, [[], [], [], [], [], [], [], [], [], [], []]);
        var start = 1;
        var end = 10;
        for (var i = start; i <= end; i++) {
            if (value.meta['PopEnemy' + i]) {
                var popEnemyMeta = value.meta['PopEnemy' + i];
                const sourceEnemy = $dataEnemies[Number(popEnemyMeta.split(',')[0])];
                //var obj1 = $dataEnemies[Number(popEnemyMeta.split(',')[0])];
                $dataEnemies[i + 20] = Object.assign({}, sourceEnemy);
                var enemyData = $dataEnemies[i + 20];
                enemyData.name = popEnemyMeta.split(',')[1];
                enemyData.battlerName = popEnemyMeta.split(',')[2];
                Galv.CACHE.load('sv_enemies', popEnemyMeta.split(',')[2]);
                enemyData.battlerHue = Number(popEnemyMeta.split(',')[3]);
                enemyData.actions[0].skillId = Number(popEnemyMeta.split(',')[4]);
                enemyData.actions[1].skillId = Number(popEnemyMeta.split(',')[5]);
                enemyData.actions[2].skillId = Number(popEnemyMeta.split(',')[6]);
                enemyData.actions[3].skillId = Number(popEnemyMeta.split(',')[7]);
                var list = valueEnemyAddState;
                list.forEach(function (id) {
                    if ($dataStates[id].meta['NameCondiAddState']) {
                        var nameConditionValues = $dataStates[id].meta['NameCondiAddState'].split(',');
                        for (var j = 0; j <= nameConditionValues.length - 1; j++) {
                            if (enemyData.name.match(nameConditionValues[j])) {
                                if ($dataStates[id].meta['battlerHue1']) {
                                    enemyData.battlerHue = Number($dataStates[id].meta['battlerHue1']);//ボス設定でも同様に実行
                                };
                                $gameVariables.value(345)[i].push(id);
                            }
                        }
                    };
                    if ($dataStates[id].meta['GraphicNameCondiAddState']) {
                        var graphicNameConditionValues = $dataStates[id].meta['GraphicNameCondiAddState'].split(',');
                        for (var j = 0; j <= graphicNameConditionValues.length - 1; j++) {
                            if (enemyData.battlerName.match(graphicNameConditionValues[j])) {
                                $gameVariables.value(345)[i].push(id);
                            }
                        }
                    };
                }, this);
                if (i == 9) {
                    $gameVariables.value(228).push(i + 20);
                } else {
                    if (i == 7 || i == 8) {
                        $gameVariables.value(242).push(i + 20);
                        $gameVariables.value(345)[i].push(480);//希少種指定
                    } else {
                        $gameVariables.value(220).push(i + 20);
                    };
                };
            }
        };
    };

    //簡易戦闘報酬設定スクリプト  
    actor1_setup1 = function (value, enemyLevel) {

        var actor20 = $gameActors.actor(20);
        actor20.addState(610);
        let stateIdValues = [];
        for (let j = 1; j <= 10; j++) {
            if (value.meta['PopEnemy' + j]) {
                stateIdValues.push(Number(value.meta['PopEnemy' + j].split(',')[0]));
            };
        };
        let enemyId = stateIdValues[getRandomIndex(stateIdValues.length)];
        const passiveStateIds = [];
        if ($dataEnemies[enemyId].meta['Passive State']) {
            stateIdValues = $dataEnemies[enemyId].meta['Passive State'].split(',');
            for (let stateIndex = 0; stateIndex < stateIdValues.length; stateIndex++) {
                passiveStateIds.push(Number(stateIdValues[stateIndex]));
            };
        };

        if (passiveStateIds != 0) {
            for (let j = 0; j < passiveStateIds.length; j++) {
                actor20.addState(passiveStateIds[j]);
            };
        };
        const gameVar345 = $gameVariables.value(345);
        if (gameVar345) {
            const gameVar345_1 = gameVar345[1];
            for (let i = 0; i <= gameVar345_1.length - 1; i++) {
                if (gameVar345_1[i] >= 1) {
                    actor20.addState(gameVar345_1[i]);
                };
            };
            const gameVar345_2 = gameVar345[2];
            for (let i = 0; i <= gameVar345_2.length - 1; i++) {
                if (gameVar345_2[i] >= 1) {
                    actor20.addState(gameVar345_2[i]);
                };
            };
        };
        const gameVar350 = $gameVariables.value(350);
        if (gameVar350) {
            for (let i = 0; i < gameVar350.length; i++) {
                let stateId = gameVar350[i];
                if (stateId == 885) {
                    let stateIdMult = 11;
                    if (enemyLevel >= 30 && enemyLevel <= 60) stateIdMult = 21;
                    else if (enemyLevel >= 61) stateIdMult = 31;

                    stateId = getRandomIndex(stateIdMult) + 885;
                    actor20.addState(stateId);
                } else {
                    actor20.addState(stateId);
                };
            };
        };
        if (value.meta['EnemyElement']) {
            const enemyElementValues = value.meta['EnemyElement'].split(',');
            const stateId = Number(enemyElementValues[getRandomIndex(enemyElementValues.length)]);
            actor20.addState(stateId);
        };
        //console.log($gameActors.actor(20));

    };

    //ボス設定スクリプト  
    boss_setup1 = function (bossConfigId, bossEnemyId) {

        valueSpecialBossId = 0;
        $gameSwitches.setValue(426, false);
        var bossEnemyValues = 0;
        $gameVariables.setValue(303, 0);
        $gameVariables.setValue(628, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        $gameVariables.setValue(346, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        $gameVariables.setValue(347, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        //ボス行動は変数346に配列で設定する。
        //特殊行動は347に2次配列
        if (bossConfigId == 1) {
            value = $dataItems[$gameVariables.value(240)];
            valueBossEnemyId = $gameVariables.value(240);
        };
        if (bossConfigId == 2) {
            value = $dataEnemies[bossEnemyId];
            $gameSwitches.setValue(426, true);
            valueBossEnemyId = bossEnemyId;
        };
        if (value.meta['BossConfirmDrop']) {
            var bossEnemyValues = value.meta['BossConfirmDrop'].split(',');
            for (var i = 0; i <= 9; i++) {
                $gameVariables.value(628)[i] = Number(bossEnemyValues[i]);
            };
        };
        if (value.meta['BossEnemy']) {
            var bossEnemyValues = value.meta['BossEnemy'].split(',');
        };
        if (bossEnemyValues != 0) {
            if (bossConfigId == 2) {
                $gameVariables.setValue(303, bossEnemyId);
            } else {
                $gameVariables.setValue(303, Number(bossEnemyValues[0]));
            };
            const bossEnemySource = $dataEnemies[$gameVariables.value(303)];
            $dataEnemies[valueBossEnemiesId] = Object.assign({}, bossEnemySource);
            var bossEnemyData = $dataEnemies[valueBossEnemiesId];
            bossEnemyData.name = bossEnemyValues[1];
            if (value.meta['Sideview Battler']) { } else {
                bossEnemyData.battlerName = String(bossEnemyValues[2]);
            };
            bossEnemyData.battlerHue = Number(bossEnemyValues[3]);
            bossEnemyData.actions[0].skillId = 900;
            bossEnemyData.actions[1].skillId = 0;
            bossEnemyData.actions[2].skillId = 0;
            bossEnemyData.actions[3].skillId = 0;
            $gameVariables.value(346)[0] = Number(bossEnemyValues[4]);//通常攻撃
            $gameVariables.value(346)[1] = Number(bossEnemyValues[5]);//スキル
            $gameVariables.value(346)[2] = Number(bossEnemyValues[6]);//必殺技
            $gameVariables.value(346)[3] = Number(bossEnemyValues[7]);//ＯＤ必殺技
            if (value.meta['BossAddAttack']) {
                var bossMetaValues = value.meta['BossAddAttack'].split(',');
                $gameVariables.value(346)[4] = Number(bossMetaValues[0]);
                $gameVariables.value(346)[5] = Number(bossMetaValues[1]);
                $gameVariables.value(346)[6] = Number(bossMetaValues[2]);
            } else {
                $gameVariables.value(346)[4] = Number(bossEnemyValues[4]);
                $gameVariables.value(346)[5] = Number(bossEnemyValues[4]);
                $gameVariables.value(346)[6] = Number(bossEnemyValues[4]);
            };
            if (value.meta['BossAddSkill']) {
                var bossMetaValues = value.meta['BossAddSkill'].split(',');
                $gameVariables.value(346)[7] = Number(bossMetaValues[0]);
                $gameVariables.value(346)[8] = Number(bossMetaValues[1]);
                $gameVariables.value(346)[9] = Number(bossMetaValues[2]);
            } else {
                $gameVariables.value(346)[7] = Number(bossEnemyValues[5]);
                $gameVariables.value(346)[8] = Number(bossEnemyValues[5]);
                $gameVariables.value(346)[9] = Number(bossEnemyValues[5]);
            };
            var start = 1;
            var end = 15;
            for (var i = start; i <= end; i++) {
                if (value.meta['BossSpecialAction' + i]) {
                    $gameVariables.value(347)[i] = [0, 0, 0];
                    var bossEnemyValues = value.meta['BossSpecialAction' + i].split(',');
                    $gameVariables.value(347)[i][0] = Number(bossEnemyValues[0]);
                    $gameVariables.value(347)[i][1] = Number(bossEnemyValues[1]);
                    $gameVariables.value(347)[i][2] = Number(bossEnemyValues[2]);
                }
            };
            $gameVariables.setValue(343, []);//付与ステートリセット$dataItems[i+100].iconIndex
            var actionSkillIdsOrXs = [];
            var specialActionSkillIdsOrXs = [];
            for (var i = 0; i <= 9; i++) {
                if ($gameVariables.value(346)[i] >= 1) {
                    actionSkillIdsOrXs.push($gameVariables.value(346)[i]);
                };
            };
            for (var i = 1; i <= 15; i++) {
                if ($gameVariables.value(347)[i][2] >= 1) {
                    specialActionSkillIdsOrXs.push($gameVariables.value(347)[i][2]);
                };
            };
            var bossScratch = 0;
            if (bossConfigId == 1) {
                if ($gameVariables.value(305)[$gameVariables.value(240)] >= 1) {
                    var bossScratch = 1;
                    var actionSkillIdsOrXs = actionSkillIdsOrXs.concat(specialActionSkillIdsOrXs);
                    specialActionSkillIdsOrXs = actionSkillIdsOrXs.filter(function (val, i, mergedSkillIds) {
                        return (mergedSkillIds.indexOf(val) === i);
                    });
                };
            };
            if (bossConfigId == 2) {
                if ($gameVariables.value(304)[valueBossEnemyId] >= 1) {
                    var bossScratch = 1;
                    var actionSkillIdsOrXs = actionSkillIdsOrXs.concat(specialActionSkillIdsOrXs);
                    specialActionSkillIdsOrXs = actionSkillIdsOrXs.filter(function (val, i, mergedSkillIds) {
                        return (mergedSkillIds.indexOf(val) === i);
                    });
                };
            };
            if (bossScratch == 1) {
                var displayedSkillIdsOrYs = specialActionSkillIdsOrXs;
            } else {
                var displayedSkillIdsOrYs = actionSkillIdsOrXs;
            };
            var bossScratch = 750;
            for (var i = 0; i <= displayedSkillIdsOrYs.length - 1; i++) {
                $dataStates[bossScratch + i].iconIndex = $dataSkills[displayedSkillIdsOrYs[i]].iconIndex;
                $dataStates[bossScratch + i].name = `[行動]${$dataSkills[displayedSkillIdsOrYs[i]].name}`;
                $dataStates[bossScratch + i].description = $dataSkills[displayedSkillIdsOrYs[i]].description;
                $gameVariables.value(343).push(bossScratch + i);
            };
            //$gameVariables.setValue(343,$gameVariables.value(343).concat(arr3));
            if (value.meta['FrontBoss']) {
                $dataSystem.optSideView = false;
            };
            var troopsId = 21;
            if (value.meta['BossTroop']) {
                var bossMetaValues = value.meta['BossTroop'].split(',');
                var troopsId = Number(bossMetaValues[0]);//グループIDを指定
                valueTroopId = troopsId;
                var bossScratch = $dataTroops[troopsId].members[0].y;
                var enemySpawnX = $dataTroops[troopsId].members[0].x;
                $dataTroops[troopsId].members = [];
                $dataTroops[troopsId].name = bossEnemyData.name;
                var enemy = { enemyId: valueBossEnemiesId, x: enemySpawnX, y: bossScratch, hidden: false }; //追加するエネミーの設定(ID1、座標(100,100)、表示有)
                $dataTroops[troopsId].members.push(enemy); //設定したエネミーをグループに追加
                if (Number(bossMetaValues[1]) == 0) {//前衛後衛の位置設定
                    //$dataTroops[troopsId].members[0].x = 500;
                } else {
                    $dataTroops[troopsId].members[0].x -= 150;
                };
                if (value.meta['Sideview Battler']) {
                    $dataTroops[troopsId].members[0].y -= 50;
                };
                if (value.meta['cloneShadow1']) {//十天用
                    var bossScratch = 57;
                    const shadowEnemySource = $dataEnemies[Number(bossEnemyValues[0])];
                    $dataEnemies[bossScratch] = Object.assign({}, shadowEnemySource);
                    var shadowEnemyData = $dataEnemies[bossScratch];
                    shadowEnemyData.name = bossEnemyValues[1];
                    shadowEnemyData.battlerName = String(bossEnemyValues[2]) + '[影]';
                    shadowEnemyData.battlerHue = 190;
                    shadowEnemyData.actions[0].skillId = Number(bossEnemyValues[4]);//通常攻撃
                    shadowEnemyData.actions[1].skillId = Number(bossEnemyValues[5]);//スキル
                    shadowEnemyData.actions[2].skillId = Number(bossEnemyValues[6]);//必殺技
                    shadowEnemyData.actions[3].skillId = Number(bossEnemyValues[7]);//ＯＤ必殺技
                    var actionSkillIdsOrXs = [50, 100, 150, 200, -50, -100, -150];//前衛x
                    var displayedSkillIdsOrYs = [-50, 0, 50, 100, 150, 200, 250];//y
                    for (var i = 1; i <= 7; i++) {
                        var enemySpawnX = actionSkillIdsOrXs[getRandomIndex(actionSkillIdsOrXs.length)];
                        var index = actionSkillIdsOrXs.findIndex(candidateOffset => candidateOffset == enemySpawnX);
                        if (index >= 0) {
                            actionSkillIdsOrXs.splice(index, 1);
                        };
                        var enemySpawnY = displayedSkillIdsOrYs[getRandomIndex(displayedSkillIdsOrYs.length)];
                        var index = displayedSkillIdsOrYs.findIndex(candidateOffset => candidateOffset == enemySpawnY);
                        if (index >= 0) {
                            displayedSkillIdsOrYs.splice(index, 1);
                        };
                        var enemyHidden = true;
                        var enemy = { enemyId: bossScratch, x: enemySpawnX, y: enemySpawnY, hidden: enemyHidden }; //追加するエネミーの設定(ID1、座標(100,100)、表示有)
                        $dataTroops[troopsId].members.push(enemy); //設定したエネミーをグループに追加
                    };
                };
                var actionSkillIdsOrXs = [400, 380, 360, 340, 320, 300, 280];//前衛x
                var specialActionSkillIdsOrXs = [150, 140, 130, 120, 110, 100, 90, 70];//後衛x
                var displayedSkillIdsOrYs = [200, 220, 250, 400, 450, 470, 500];//y
                for (var i = 1; i <= 7; i++) {//<EnemyEntourage1:21,0,0>21-27,0前衛1後衛,0表示1非表示
                    if (value.meta['EnemyEntourage' + i]) {
                        var bossMetaValues = value.meta['EnemyEntourage' + i].split(',');
                        var bossScratch = Number(bossMetaValues[0]);
                        if (Number(bossMetaValues[1]) == 0) {
                            var enemySpawnX = actionSkillIdsOrXs[getRandomIndex(actionSkillIdsOrXs.length)];
                            var index = actionSkillIdsOrXs.findIndex(candidateOffset => candidateOffset == enemySpawnX);
                            if (index >= 0) { actionSkillIdsOrXs.splice(index, 1) };
                        };
                        if (Number(bossMetaValues[1]) == 1) {
                            var enemySpawnX = specialActionSkillIdsOrXs[getRandomIndex(specialActionSkillIdsOrXs.length)];
                            var index = specialActionSkillIdsOrXs.findIndex(candidateOffset => candidateOffset == enemySpawnX);
                            if (index >= 0) { specialActionSkillIdsOrXs.splice(index, 1) };
                        };
                        var enemySpawnY = displayedSkillIdsOrYs[getRandomIndex(displayedSkillIdsOrYs.length)];
                        var index = displayedSkillIdsOrYs.findIndex(candidateOffset => candidateOffset == enemySpawnY);
                        if (index >= 0) { displayedSkillIdsOrYs.splice(index, 1) };
                        if (Number(bossMetaValues[2]) == 1) { var enemyHidden = true } else { var enemyHidden = false };
                        var enemy = { enemyId: bossScratch, x: enemySpawnX, y: enemySpawnY, hidden: enemyHidden }; //追加するエネミーの設定(ID1、座標(100,100)、表示有)
                        $dataTroops[troopsId].members.push(enemy); //設定したエネミーをグループに追加
                    };
                };
            };
        };
        if (!bossEnemyData) return;//'<BossEnemy>'未有時の下部処理回避
        var bossEnemyValues = value.meta['BossStateInformation'] ? value.meta['BossStateInformation'].split(',') : [];//
        for (var i = 0; i <= bossEnemyValues.length - 1; i++) {
            if (Number(bossEnemyValues[i]) >= 1) {
                if ($dataStates[Number(bossEnemyValues[i])] && $dataStates[Number(bossEnemyValues[i])].meta['valueBossBgm']) {
                    var bossMetaValues = $dataStates[Number(bossEnemyValues[i])].meta['valueBossBgm'].split(',');
                    $gameVariables.setValue(337, [bossMetaValues[0], Number(bossMetaValues[1]), Number(bossMetaValues[2]), Number(bossMetaValues[3])]);
                };
                $gameVariables.value(343).push(Number(bossEnemyValues[i]));
            };
        };
        var list = valueEnemyAddState;
        list.forEach(function (id) {
            if ($dataStates[id].meta['NameCondiAddState']) {
                var nameConditionValues = $dataStates[id].meta['NameCondiAddState'].split(',');
                for (var j = 0; j <= nameConditionValues.length - 1; j++) {
                    if (bossEnemyData.name.match(nameConditionValues[j])) {
                        if ($dataStates[id].meta['battlerHue1']) {
                            bossEnemyData.battlerHue = Number($dataStates[id].meta['battlerHue1']);
                        };
                        $gameVariables.value(343).push(id);
                    };
                }
            };
            if ($dataStates[id].meta['GraphicNameCondiAddState']) {
                var graphicNameConditionValues = $dataStates[id].meta['GraphicNameCondiAddState'].split(',');
                for (var j = 0; j <= graphicNameConditionValues.length - 1; j++) {
                    if (bossEnemyData.battlerName.match(graphicNameConditionValues[j])) {
                        $gameVariables.value(343).push(id);
                    };
                }
            };
        }, this);

    };

    //戦闘グループでボスステ付与
    troop_bossState = function () {

        if ($gameSwitches.value(211)) {
            var enemy = $gameTroop.members()[0];
            enemy.addState(410);
            //エネミー隊列変更
            var start = 0; var end = $gameTroop.members().length - 1;
            for (var i = start; i <= end; i++) {
                var troopX = $gameTroop.getX(i + 1);
                if (troopX <= 200) {
                    $gameTroop.members()[i].setRow(2);
                };
            };
            //獲得戦果
            if (enemy.isStateAffected(410)) {//ボスステートで戦果
                var dropItemId = 10;
                var dropCount = getRandomIndex(10) + 1;
                if (enemy.isStateAffected(411)) { dropCount += getRandomIndex(10) + 1 };
                if (enemy.isStateAffected(412)) { dropCount += getRandomIndex(20) + 10 };
                if (enemy.isStateAffected(413)) { dropCount += getRandomIndex(30) + 20 };
                if (enemy.isStateAffected(414)) { dropCount += getRandomIndex(100) + 1 };
                for (var j = 0; j <= dropCount; j++) {
                    $gameTroop.addDropItem($dataItems[dropItemId]);
                };
            };
        };

    };

    //代入して全般ヒントとして作成
    hint1_zenpan = function (hintTypeId) {

        var uncollectedHeader = `　\n`;
        switch (hintTypeId) {
            case 102:
                uncollectedHeader = `未発生挿話` + `\n`;
                break;
            case 103:
                uncollectedHeader = `未発生シーン` + `\n`;
                break;
            case 104:
                uncollectedHeader = `未回収タイトル` + `\n`;
                break;
            case 105:
                uncollectedHeader = `未回収Ｈタイトル` + `\n`;
                break;
            case 108:
                uncollectedHeader = `未発生クエスト` + `\n`;
                break;
            default:
                break;
        }

        eval("valueWordSet" + valueCountSet2 + " = uncollectedHeader");

        valueCountSet1 = 0;
        valueCountSet2 = 1;
        const max = $dataItems.length - 1;
        for (var i = 1; i < max; i++) {
            const item = $dataItems[i];
            if (!item.meta['EICSwitch']) {
                continue;
            };
            if (Number(item.meta['EICSwitch']) !== hintTypeId || $gameParty.hasItem(item)) {
                continue;
            };

            var hintLineText = `\\C[2]${item.name}\\C[0]\n${item.description}\n`;
            eval("valueWordSet" + valueCountSet2 + " += hintLineText");
            valueCountSet1 += 1;
            if ((valueCountSet1 % 6) == 0) {
                valueCountSet2 += 1;
                eval("valueWordSet" + valueCountSet2 + " = uncollectedHeader");
            };
        };

    };

    //怒りのツッコミ演出
    ensyutu_ikari = function (id, seName) {

        var shakePower = getRandomIndex(3) + 6;
        $gameScreen.startShake(shakePower, shakePower, id);
        var sePitch = getRandomIndex(41) + 80;
        AudioManager.playSe({ "name": seName, "volume": 90, "pitch": sePitch, "pan": 0 });
        var flashColor = [255, 255, 255];
        if (seName == 'Explosion2') { var flashColor = [255, 50, 50] };
        var flashDuration = getRandomIndex(41) + 150;
        $gameScreen.startFlash([flashColor[0], flashColor[1], flashColor[2], flashDuration], id);

    };

    //オブジェクト探知とトラップ視認実行
    search_object = function () {

        const max = $gameMap.events().length >= 50 ? 200 : 100;
        for (var id = max; id > 0; id--) {
            const event = $gameMap.event(id);
            if (!event) {
                continue;
            };
            //if(!$gameSelfSwitches.value([$gameMap.mapId(), event, 'B'])){
            if ($gameSelfSwitches.value([$gameMap.mapId(), id, 'B'])) {
                continue;
            }

            setEventIcon(event, 'IconDisplay', 79);
            setEventIcon(event, 'TrapDisplay', 135);
        };
    };

    function setEventIcon(event, metaName, switchId) {
        const eventMeta = event.event().meta[metaName];
        if (!eventMeta) {
            return;
        }
        if ($gameSwitches.value(switchId)) {
            event.setIconOnEvent(Number(eventMeta));
        } else {
            event.clearIconOnEvent();
        }
    }

    //タイトル入手
    item_titleget = function (unusedArg1, unusedArg2) {

        var criticalHitRecord = [16, 0, 0];//会心回数
        var maxDamageDealtRecord = [2, 0, 0];//最大与えダメージ
        var maxDamageTakenRecord = [5, 0, 0];//最大受けダメージ
        var koCountRecord = [7, 0, 0];//戦闘不能回数

        for (var i = $gameVariables.value(75); i <= $gameVariables.value(76); i++) {
            var actor = $gameActors.actor(i);
            if ($gameVariables.value(380 + actor.actorId())[68] > criticalHitRecord[2]) {//会心回数
                var criticalHitRecord = [16, actor.actorId(), $gameVariables.value(380 + actor.actorId())[68]];
            };
            if (actor.attackDamageMax > maxDamageDealtRecord[2]) {
                var maxDamageDealtRecord = [2, actor.actorId(), actor.attackDamageMax];
            };
            if (actor.acceptDamageMax > maxDamageTakenRecord[2]) {
                var maxDamageTakenRecord = [5, actor.actorId(), actor.acceptDamageMax];
            };
            if (actor.deadCounter > koCountRecord[2]) {
                var koCountRecord = [7, actor.actorId(), actor.deadCounter];
            };
            var customAchievementIds = [8, 9, 10, 11, 12, 13, 14];//獲得実績自己設定ID
            var skillTypeIds = [2, 5, 6, 7, 8, 12, 13];//スキルタイプid
            var topActorIds = [0, 0, 0, 0, 0, 0, 0];//アクターID
            var useCounts = [0, 0, 0, 0, 0, 0, 0];//累計回数。
            var topUseCounts = [0, 0, 0, 0, 0, 0, 0];//累計トップ
            for (var j = 1; j <= $dataSkills.length - 1; j++) {
                const skill = $dataSkills[j];
                for (var titleCheckId = 0; titleCheckId <= customAchievementIds.length - 1; titleCheckId++) {
                    if (skill.name !== '') {
                        if (skill.stypeId == skillTypeIds[titleCheckId]) {
                            useCounts[titleCheckId] += actor.getSkillUseCounter(j);
                        }
                    };
                }
            };
            for (var j = 0; j <= customAchievementIds.length - 1; j++) {
                if (useCounts[j] > topUseCounts[j]) {
                    topUseCounts[j] = useCounts[j];
                    topActorIds[j] = actor.actorId();
                }
            };
        };

        var actor = $gameActors;
        var partyKillRecord = [1, 0, actor.getAllKillEnemyCounter()];
        var partyDamageDealtRecord = [3, 0, actor.attackDamageSum];
        var partyDamageTakenRecord = [6, 0, actor.acceptDamageSum];
        var partyDeathRecord = [15, 0, actor.deadCounter];

        var partyOverkillRecord = [4, 0, 0];//全員のオーバーキル回数
        for (var i = $gameVariables.value(75); i <= $gameVariables.value(76); i++) {
            partyOverkillRecord[2] += $gameVariables.value(380 + i)[67];
        };

        for (var i = 1; i <= $dataItems.length - 1; i++) {
            const item = $dataItems[i];
            if (item.meta['EICSwitch']) {
                if (Number(item.meta['EICSwitch']) == 104 || Number(item.meta['EICSwitch']) == 105) {
                    if (item.name !== '' && !$gameParty.hasItem(item)) {
                        var titleCheckId = 2;//スイッチID。最初にtrueにして成立しない場合は途中でfalse
                        var titleCheckVarId = 2;//変数id若しくは$gameVariables.value(380 + $gameVariables.value(2))の主人公Ｈ配列id
                        var titleCheckThreshold = 0;//value2の値.
                        var titleCheckResult = true;//
                        //var value5 = 0;//汎用。必要な時に0から始める
                        var titleMvpActorIndex = 0;//個人記録のＭＶＰアクター
                        if (item.meta['annihilationTitle']) {
                            titleCheckId = 1;
                        };
                        if (item.meta['titleGetSwitch']) {
                            titleCheckId = Number(item.meta['titleGetSwitch']);
                            //var titleCheckResult = $gameSwitches.value(titleCheckId);
                        };
                        if (item.meta['titleGetVariable']) {
                            const arr = item.meta['titleGetVariable'].split(',');
                            titleCheckVarId = Number(arr[0]);
                            titleCheckThreshold = Number(arr[1]);
                            titleCheckResult = $gameVariables.value(titleCheckVarId) >= titleCheckThreshold;
                        };
                        if (item.meta['titleGetArray']) {
                            const arr = item.meta['titleGetArray'].split(',');
                            titleCheckVarId = Number(arr[0]);
                            titleCheckThreshold = Number(arr[2]);
                            titleCheckResult = $gameVariables.value(titleCheckVarId)[Number(item.meta['titleGetArray'].split(',')[1])] >= titleCheckThreshold;
                        };
                        if (item.meta['titleGetItems']) {
                            const arr = item.meta['titleGetItems'].split(',');
                            titleCheckVarId = Number(arr[0]);
                            titleCheckThreshold = Number(arr[1]);
                            titleCheckResult = $gameParty.numItems($dataItems[titleCheckVarId]) >= titleCheckThreshold;
                        };
                        if (item.meta['HtitleGetArray']) {//主人公のみ
                            const arr = item.meta['HtitleGetArray'].split(',');
                            titleCheckVarId = Number(arr[0]);
                            titleCheckThreshold = Number(arr[1]);
                            titleCheckResult = $gameVariables.value(380 + $gameVariables.value(2))[titleCheckVarId] >= titleCheckThreshold;
                        };
                        if (item.meta['titleGetSkillRank']) {
                            const arr = item.meta['titleGetSkillRank'].split(',');
                            for (var j = 0; j <= $gameParty.members().length - 1; j++) {
                                const actor = $gameParty.members()[j];
                                titleCheckVarId = Number(arr[0]);
                                titleCheckThreshold = Number(arr[1]);
                                titleCheckResult = actor.skillMasteryLevel(titleCheckVarId) >= titleCheckThreshold;
                                if (titleCheckResult) {
                                    titleMvpActorIndex = j;
                                    break;
                                };
                            };
                        };
                        if (item.meta['titleGetAchievement']) {
                            var titleCheckId = 1;//獲得実績メタがある場合は、最初に条件をfalseにする。
                            var titleGetAchievementValues = item.meta['titleGetAchievement'].split(',');
                            //全員の場合
                            if (titleGetAchievementValues[0] == partyKillRecord[0] && titleGetAchievementValues[1] <= partyKillRecord[2]) { titleCheckId = 2 };
                            if (titleGetAchievementValues[0] == partyDamageDealtRecord[0] && titleGetAchievementValues[1] <= partyDamageDealtRecord[2]) { titleCheckId = 2 };
                            if (titleGetAchievementValues[0] == partyDamageTakenRecord[0] && titleGetAchievementValues[1] <= partyDamageTakenRecord[2]) { titleCheckId = 2 };
                            if (titleGetAchievementValues[0] == partyDeathRecord[0] && titleGetAchievementValues[1] <= partyDeathRecord[2]) { titleCheckId = 2 };
                            if (titleGetAchievementValues[0] == partyOverkillRecord[0] && titleGetAchievementValues[1] <= partyOverkillRecord[2]) { titleCheckId = 2 };
                            //パーティの中で一番高い
                            if (titleGetAchievementValues[0] == criticalHitRecord[0] && titleGetAchievementValues[1] <= criticalHitRecord[2]) { titleCheckId = 2; titleMvpActorIndex = criticalHitRecord[1] };
                            if (titleGetAchievementValues[0] == maxDamageDealtRecord[0] && titleGetAchievementValues[1] <= maxDamageDealtRecord[2]) { titleCheckId = 2; titleMvpActorIndex = maxDamageDealtRecord[1] };
                            if (titleGetAchievementValues[0] == maxDamageTakenRecord[0] && titleGetAchievementValues[1] <= maxDamageTakenRecord[2]) { titleCheckId = 2; titleMvpActorIndex = maxDamageTakenRecord[1] };
                            if (titleGetAchievementValues[0] == koCountRecord[0] && titleGetAchievementValues[1] <= koCountRecord[2]) { titleCheckId = 2; titleMvpActorIndex = koCountRecord[1] };
                            //スキルタイプ毎の個人使用回数
                            const max = customAchievementIds.length;
                            for (var j = 0; j < max; j++) {
                                if (titleGetAchievementValues[0] == customAchievementIds[j] && titleGetAchievementValues[1] <= topUseCounts[j]) { titleCheckId = 2; titleMvpActorIndex = topActorIds[j] };
                            };
                        };
                        if ($gameSwitches.value(titleCheckId) && titleCheckResult) {
                            $gameVariables.setValue(19, i);
                            if (item.meta['titleSenkaGet']) {
                                if (!$gameSwitches.value(29)) {
                                    $gameParty.gainItem($dataItems[10], Number(item.meta['titleSenkaGet']));//アイテムID10は戦貨
                                };
                                const titleName = `\x1bIIN[10]${Number(item.meta['titleSenkaGet'])}`;
                                valueWordSetEx = `${titleName}枚獲得！`;
                            };
                            if (titleMvpActorIndex >= 1) {
                                if (!$gameSwitches.value(29)) {
                                    $gameVariables.value(297)[i] = titleMvpActorIndex;
                                    const actorName = `\\C[2]${$gameActors.actor($gameVariables.value(297)[i]).name()}\\C[0]]`;
                                    valueWordSetEx = `\n[達成者:${actorName}`;
                                };
                            };
                            break;
                        };
                    }
                }
            }
        };

    };

    //戦闘マップ殲滅回数による称号獲得
    title_battleMapannihilation = function () {

        const gameVar257 = $gameVariables.value(257);
        for (var i = 1; i <= $dataItems.length - 1; i++) {
            const item = $dataItems[i];
            if (item.meta['annihilationTitle']) {
                if (!$gameParty.hasItem(item, true)) {
                    var annihilationTitleValues = item.meta['annihilationTitle'].split(',');
                    if (Number(annihilationTitleValues[0]) >= 20) {
                        if (gameVar257[Number(annihilationTitleValues[0])] >= 1) {
                            $gameVariables.setValue(19, i);
                        };
                    };
                    if (Number(annihilationTitleValues[0]) == 1) {
                        var annihilationCount = 0;
                        for (var j = 1; j <= 100; j++) {
                            annihilationCount += gameVar257[j];
                        };
                        if (annihilationCount >= Number(annihilationTitleValues[1])) {
                            $gameVariables.setValue(19, i);
                        };
                    };
                    if (Number(annihilationTitleValues[0]) == 2) {
                        var annihilationCount = 0;
                        for (var j = 1; j <= 100; j++) {
                            const itemJ = $dataItems[j];
                            if (!itemJ.meta['OnSwitch']) {
                                continue;
                            };
                            var onSwitchValues = itemJ.meta['OnSwitch'].split(',');
                            for (var switchIndex = 0; switchIndex <= onSwitchValues.length - 1; switchIndex++) {
                                if (Number(onSwitchValues[switchIndex]) == 207) {
                                    annihilationCount += gameVar257[j];
                                    break;
                                };
                            };
                        };
                        if (annihilationCount >= Number(annihilationTitleValues[1])) {
                            $gameVariables.setValue(19, i);
                            $gameParty.gainItem(item, 1);
                        };
                    };
                };
            };
        };
        if ($gameParty.hasItem($dataItems[$gameVariables.value(19)], true)) {
            $gameVariables.setValue(19, 0);
        };

    };

    //曜日変更と日数経過時の処理
    weeks_toggleOther = function () {

        let start = $gameVariables.value(73);
        let end = $gameVariables.value(74);
        for (var i = start; i <= end; i++) { $gameVariables.value(i + 380)[46] = 0 };//直前のＨＣＧ
        const list = valueOneDayLimitItem;
        list.forEach(function (id) {
            if ($dataItems[id].meta.SkillCostToday) {
                $gameParty.gainItem($dataItems[id], 1);
            };
        }, this);
        $gameVariables.setValue(58, $gameVariables.value(58) + 1);//経過日数
        if ($gameParty.loseGoldSum > $gameVariables.value(341)) {
            const goldCalc = $gameParty.loseGoldSum - $gameVariables.value(341);
            const gold = `\\C[2]${goldCalc.toLocaleString()}\\C[0]\n`;
            $gameVariables.setValue(539, $gameVariables.value(539) + `本日消費\\G:${gold}\n`);
            $gameVariables.setValue(540, $gameVariables.value(540) + 1);
        };
        if ($gameParty.gainGoldSum > $gameVariables.value(342)) {
            const goldCalc = $gameParty.gainGoldSum - $gameVariables.value(342);
            const gold = `\\C[2]${goldCalc.toLocaleString()}\\C[0]\n`;
            $gameVariables.setValue(539, $gameVariables.value(539) + `本日獲得\\G:${gold}\n`);
            $gameVariables.setValue(540, $gameVariables.value(540) + 1);
        };
        $gameVariables.setValue(341, $gameParty.loseGoldSum.toLocaleString());//一日の消費金額
        $gameVariables.setValue(342, $gameParty.gainGoldSum.toLocaleString());//一日の獲得金額
        let levelUpActorCount = 0;
        start = $gameVariables.value(75);
        end = $gameVariables.value(76);
        for (let actorId = start; actorId <= end; actorId++) {
            const actor = $gameActors.actor(actorId);
            if (actor.currentExp() > $gameVariables.value(actorId + 380)[65]) {
                const expCalc = actor.currentExp() - $gameVariables.value(actorId + 380)[65];
                const exp = `\\C[2]${expCalc.toLocaleString()}\\C[0]　`
                $gameVariables.setValue(539, $gameVariables.value(539) + `${actor.name()}本日獲得経験値:${exp}`);
                levelUpActorCount += 1;
                if ((levelUpActorCount % 2) == 0) {
                    $gameVariables.setValue(539, $gameVariables.value(539) + `\n`);
                    $gameVariables.setValue(540, $gameVariables.value(540) + 1);
                };
            };
            $gameVariables.value(actorId + 380)[65] = actor.currentExp();
        };
        if (levelUpActorCount == 1 || levelUpActorCount == 3 || levelUpActorCount == 5 || levelUpActorCount == 7) {
            $gameVariables.setValue(539, $gameVariables.value(539) + `\n`);
            $gameVariables.setValue(540, $gameVariables.value(540) + 1);
        };
        for (var i = 16; i <= 17; i++) { $gameSwitches.setValue(i, false) };
        for (var i = 6; i <= 12; i++) { $gameSwitches.setValue(i, false) };

        var daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];
        var currentDay = $gameVariables.value(55);

        const maxDaysInWeek = daysOfWeek.length;
        for (let i = 0; i < maxDaysInWeek; i++) {
            if (currentDay === daysOfWeek[i]) {
                const nextDay = daysOfWeek[(i + 1) % maxDaysInWeek]; // will be 0 (日) when will reach max (土) day
                $gameVariables.setValue(55, nextDay);
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
            10: [25, 478],
        }

        //内容のほうで開始時点ではレアリティを8に制限
        gacha_naiyou(3, 0);
        if (valueGachaId >= 1) {
            $gameParty.gainItem(valueItems[valueGachaId], 1);
            var lotteryRarity = Number(valueItems[valueGachaId].meta['LotteryRearity']);
            if ($gameVariables.value(23) < lotteryRarity) {
                $gameVariables.setValue(23, lotteryRarity);
            };

            const colorCode = RARITY_COLOR_TAG_INFOS[lotteryRarity][0];
            const itemIndex = RARITY_COLOR_TAG_INFOS[lotteryRarity][1];
            var rarityColorTag = colorTaggedText(colorCode, `<Rarity:\\I[${itemIndex}]`);

            if (valueItems == $dataItems) { var itemTypePrefix = `\\iin`; }
            else if (valueItems == $dataWeapons) { var itemTypePrefix = `\\win`; }
            else if (valueItems == $dataArmors) { var itemTypePrefix = `\\ain`; };
            var prefixGacha = colorTaggedText(16, `${itemTypePrefix}[${valueGachaId}]`);
            var gacha = rarityColorTag + prefixGacha;
            var gachaResultMessage = `${gacha}が排出されました！`;

            if ($gameSwitches.value(380)) {
                $gameVariables.setValue(21, $gameVariables.value(21) + 1);
                $gameVariables.setValue(22, $gameVariables.value(22) + `${gachaResultMessage}\n`);
            } else {
                $gameVariables.setValue(22, gachaResultMessage);
            };
        };

    };

    //アイテム武器防具抽選スクリプト。id12アイテム1武器2防具3all
    //id13がall。10まで。value1としてid決定
    const DEFAULT_RARITY_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    gacha_naiyou = function (valueItemsType, rarity) {

        if (valueItemsType && valueItemsType > -1 && valueItemsType < 3) {
            valueItems = getItemEquipmentSource(valueItemsType);
        }
        else {
            const randomValueItemsType = getRandomIndex(11);
            valueItems = getItemEquipmentSource(randomValueItemsType > 1 ? 2 : randomValueItemsType);
        }

        let chosenRarity = rarity;
        if (rarity < 1) {
            let rarityArray = DEFAULT_RARITY_LIST;
            for (let i = 1; i <= 50; i++) {
                rarityArray.push(1);
                if (i > 45) continue;

                addRarityCheckValues(rarityArray, i);
            }
            chosenRarity = rarityArray[getRandomIndex(rarityArray.length)];
            //ガチャ称号取得でＵＲ，ＬＲ解放
            if (!$gameParty.hasItem($dataItems[657], true) && chosenRarity >= 9) {
                chosenRarity = 8;
            };
            if (!$gameParty.hasItem($dataItems[656], true) && chosenRarity >= 8) {
                chosenRarity = 7;
            };
        };

        let selectedItemIndex;
        if ($gameParty.inBattle()) {
            selectedItemIndex = 71; //仮指定。ポーションのみ
        } else {
            let eligibleItemIndices = [0];
            const itemsLength = valueItems.length;
            for (let i = 1; i < itemsLength; i++) {
                const currentItem = valueItems[i];
                if (!currentItem) continue;

                if (currentItem.meta['GatchaOutOfRange']) continue;
                if ($gameParty.hasItem(currentItem)) {
                    const maxItemLimit = currentItem.meta['Max Item'];
                    if (maxItemLimit && Number(maxItemLimit) == 1) continue;
                }
                else if (currentItem.meta['GatchaHasRange']) continue;

                const lotteryRearity = currentItem.meta['LotteryRearity'];
                if (!lotteryRearity) continue;
                if (Number(lotteryRearity) !== chosenRarity) continue;

                eligibleItemIndices.push(i);
            }
            selectedItemIndex = eligibleItemIndices[getRandomIndex(eligibleItemIndices.length)];
            if (selectedItemIndex === 0) { //レアリティ1でmax1アイテムを作らない。
                eligibleItemIndices = [];
                chosenRarity = 1;
                for (let i = 1; i < itemsLength; i++) {
                    const currentItem = valueItems[i];
                    if (!currentItem) continue;
                    if (currentItem.meta['GatchaOutOfRange']) continue;
                    if (currentItem.meta['GatchaHasRange']
                        && !$gameParty.hasItem(currentItem)) continue;

                    const lotteryRearity = currentItem.meta['LotteryRearity'];
                    if (!lotteryRearity) continue;
                    if (Number(lotteryRearity) !== chosenRarity) continue;

                    eligibleItemIndices.push(i);
                };
                valueGachaId = eligibleItemIndices[getRandomIndex(eligibleItemIndices.length)];
                return;
            }
        };

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
        { threshold: 3, value: 9 },
    ];
    function addRarityCheckValues(rarityArray, currentValue) {
        rarityChecks.forEach(check => {
            if (currentValue <= check.threshold) {
                rarityArray.push(check.value);
            }
        });
    }

    //レアリティ一覧作成
    item_gachaitiran1 = function (lotteryRarity) {

        let choiceIndex = 1;
        let pictureSlot = 1;

        const info = $gameVariables.value(801)
        for (var j = 0; j <= 2; j++) {

            valueItems = j == 0 ? $dataItems : j == 1 ? $dataWeapons : $dataArmors; // 2=armors
            const start = 1;
            const end = valueItems.length;
            for (var i = start; i < end; i++) {
                let isItemExcluded = 0;
                const databaseEntry = valueItems[i];
                if (!databaseEntry) continue;
                if (!databaseEntry.meta['LotteryRearity']) continue;

                if (Number(databaseEntry.meta['LotteryRearity']) !== lotteryRarity) continue;

                if (databaseEntry.meta['Max Item']) {
                    if (Number(databaseEntry.meta['Max Item']) == 1 && $gameParty.hasItem(databaseEntry)) {
                        isItemExcluded = 1;
                    }
                };
                if (databaseEntry.meta['GatchaHasRange']) {
                    if (!$gameParty.hasItem(databaseEntry)) {
                        isItemExcluded = 1;
                    }
                };
                if (databaseEntry.meta['GatchaOutOfRange']) {
                    isItemExcluded = 1;
                };
                if (isItemExcluded !== 0) continue;

                const descriptionText = `${databaseEntry.description}`;
                item_priceinfo(j, i);
                const id = 1;
                const itemName = `\x1bI[${databaseEntry.iconIndex}]${databaseEntry.name}`;
                const choiceParams = {
                    text: `${itemName}`,
                    value: choiceIndex
                };
                $gameSystem.addCustomChoice(id, choiceParams);
                $gameScreen.setDTextPicture(descriptionText, 28);
                $gameScreen.dWindowFrame = 'ON';
                $gameScreen.showPicture(pictureSlot + 100, '', 0, 20, 10, 100, 100, 0, 0);
                $gameMessage.setSelectPictureId(choiceIndex, pictureSlot + 100);
                const message = `　　　　　　` + colorTaggedText(14, `──詳細情報──`) + `　　　　　　　　` + `\n${info}`;
                $gameScreen.setDTextPicture(message, 28);
                $gameScreen.dWindowFrame = 'ON';
                $gameScreen.showPicture(pictureSlot + 100 + 1, '', 0, 640, 110, 100, 100, 0, 0);
                $gameMessage.setSelectPictureId(choiceIndex, pictureSlot + 100 + 1);
                choiceIndex += 1;
                pictureSlot += 2;
            }
        };

    };

    //ダンジョンランダム宝箱中身処理
    danjon_treasure = function () {

        var treasureIndices = $gameVariables.value(215)[$gameVariables.value(240)];
        var entryCategoryIndices = $gameVariables.value(216)[$gameVariables.value(240)];
        if (treasureIndices != 0) {
            var treasureItemIndex = treasureIndices[getRandomIndex(treasureIndices.length)];
            let index = treasureIndices.findIndex(candidateIndex => candidateIndex == treasureItemIndex);
            var sourceEntries = getItemEquipmentSource(entryCategoryIndices[index]);
            if ($dataItems[$gameVariables.value(240)].meta['TchestRere']) {
                if (treasureItemIndex == Number($dataItems[$gameVariables.value(240)].meta['TchestRere'])) {
                    $gameSwitches.setValue(439, true);
                }
            };
            $gameParty.gainItem(sourceEntries[treasureItemIndex], 1);
            var treasureMessage = `\\C[24]\x1bI[${sourceEntries[treasureItemIndex].iconIndex}]${sourceEntries[treasureItemIndex].name}\\C[0]を入手した！`;
            if (!$gameSwitches.value(440)) {
                if (index >= 0) {
                    treasureIndices.splice(index, 1);
                    entryCategoryIndices.splice(index, 1);
                };
            };
        } else {
            var treasureMessage = `宝箱の中身は空だった…。`;
            $gameSwitches.setValue(380, true);
        };
        if ($gameSwitches.value(439)) {
            var treasureItemIndex = 28;
            $gameScreen.setDTextPicture(treasureMessage, treasureItemIndex);
        } else {
            CommonPopupManager.showInfo({}, treasureMessage, null);
        };

    };

    //アクター選択肢準備
    actor_choicePre1 = function () {

        var choiceOrder = 0;
        var choicePictureId = 101;
        var start = 0;
        var end = $gameParty.members().length - 1;
        for (var i = start; i <= end; i++) {
            if (i >= 1) { choiceOrder += 1 };
            const gameActor = $gameParty.members()[i];
            var actorId = gameActor.actorId();
            $gameVariables.setValue(20, actorId);
            const id = 1;
            const choiceParams = { text: gameActor.name(), value: actorId };
            $gameSystem.addCustomChoice(id, choiceParams);
            if (isGirl(gameActor)) {
                valueFaceSelect = 6;
                var randomFaceIndex = getRandomIndex(8);
                if (randomFaceIndex == 0) { valueFaceSelect = 1 }//通常
                else if (randomFaceIndex == 1) { valueFaceSelect = 2 }//笑顔
                else if (randomFaceIndex == 2) { valueFaceSelect = 5 }//真顔
                else if (randomFaceIndex == 3) { valueFaceSelect = 15 }//目を瞑る
                else if (gameActor.isLearnedSkill(66)) {
                    if (randomFaceIndex == 4) { valueFaceSelect = 40 }//頬染め
                    else if (randomFaceIndex == 5) { valueFaceSelect = 39 }//頬染めウィンク
                    else if (randomFaceIndex == 6) { valueFaceSelect = 38 }//頬染め挑発的
                    else if (randomFaceIndex == 7) { valueFaceSelect = 41 };//頬染め目にハート
                };

                battle_bustUp1(gameActor, choicePictureId, 0, 0, 10);
                for (var j = 0; j <= 7; j++) {
                    if ($gameScreen.picture(choicePictureId + j)) {
                        $gameMessage.setSelectPictureId(choiceOrder, choicePictureId + j);
                    };
                };
            } else {
                //$gameScreen.showPicture(id3,$gameVariables.value(20)+"Actor1_s0",0,0,0,100,100,0,0);
                //$gameMessage.setSelectPictureId(id2, id3);
            };
            choicePictureId += 10;
        };

    };

    //エネミーのデータベースパラメータ設定
    enemy_dataBaseSettei = function () {

        var start = 31;
        var end = 300;
        for (var i = start; i <= end; i++) {
            if ($dataEnemies[i].meta['BaseStates']) {
                var baseStateValues = $dataEnemies[i].meta['BaseStates'].split(',');
                var baseParamValue = Number(baseStateValues[0]);
                //var arr2 = [baseParamValue-5,baseParamValue-4,baseParamValue-3,baseParamValue-2,baseParamValue-2,baseParamValue,baseParamValue+1,baseParamValue+2,baseParamValue+3,baseParamValue+4,baseParamValue+5];
                var statVarianceCandidates = [baseParamValue - 10, baseParamValue - 5, baseParamValue, baseParamValue + 5, baseParamValue + 10];
                var randomParam = statVarianceCandidates[getRandomIndex(statVarianceCandidates.length)];
                $dataEnemies[i].params[0] = randomParam;
                for (var j = 1; j <= 7; j++) {
                    var secondBaseValue = Number(baseStateValues[1]);
                    var randomStatValue = getRandomIndex(5) + (secondBaseValue - 3);
                    //var randomStatValue = secondBaseValue;//getRandomIndex(5) + (secondBaseValue - 3);
                    $dataEnemies[i].params[j] = randomStatValue;
                };
                $dataEnemies[i].exp = Math.round(randomParam / 10);
                var goldDivisor = getRandomIndex(4) + 8;
                $dataEnemies[i].gold = Math.round(randomParam / goldDivisor);
            };
        };

    };

    //メニュー画面で付与ステートの解説分表示
    state_menuDisprayDescription = function () {

        valueCountSet1 = 0;
        valueCountSet2 = 1;
        var headerText = `付与ステート一覧\n`;
        eval("valueWordSet" + valueCountSet2 + " = headerText");
        var start = 1;
        var end = $dataStates.length - 1;
        for (var i = start; i <= end; i++) {
            if ($gameParty.membersState(i) && $dataStates[i].iconIndex >= 1 && $dataStates[i].name !== '' && $dataStates[i].description !== '') {
                for (var partyMemberIndex = 0; partyMemberIndex <= $gameParty.members().length - 1; partyMemberIndex++) {
                    if ($gameParty.members()[partyMemberIndex].isStateAffected(i)) {
                        var actor = $gameParty.members()[partyMemberIndex];
                        var stateTextPortion = `\\C[16][${actor.name()}]\\C[0]`;
                        eval("valueWordSet" + valueCountSet2 + " += stateTextPortion");
                    };
                };
                var stateTextPortion = `\n${$dataStates[i].description}\n`;
                eval("valueWordSet" + valueCountSet2 + " += stateTextPortion");
                valueCountSet1 += 1;
                if ((valueCountSet1 % 6) == 0) {
                    valueCountSet2 += 1;
                    eval("valueWordSet" + valueCountSet2 + " = headerText");
                };
            };
        };

    };

    //キャラ初期セットアップ。ＬＶリセットにも実行。この後レアリティコモン実行。
    actor_StartSetUp = function (i) {

        var actor = $gameActors.actor(i);
        //主人公にタイトルセットと存在フラグとレベルフラグと視点変更スキル
        if (i == $gameVariables.value(2)) {
            //actor.learnSkill(23);//タイトルセット。不要
            //actor.learnSkill(24);//性欲度関連に合わせて習得させる。性欲度ランク1で習得
            //actor.learnSkill(42);//視点変更
            actor.learnSkill(407);
            actor.learnSkill(18);
        };
        //デバッグ時に全員に存在フラグとレベルフラグ
        //if($gameSwitches.value(53)){
        //actor.learnSkill(407);
        //actor.learnSkill(18);
        //};
        //初期装備とスキル付与
        if ($dataActors[i].meta['JoinEquipWeapons']) {
            var metaFlagValue = Number($dataActors[i].meta['JoinEquipWeapons']);
            $gameParty.gainItem($dataWeapons[metaFlagValue], 1, false);
            actor.changeEquipById(1, metaFlagValue);
        };
        var list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        list.forEach(function (id) {
            if ($dataActors[i].meta['JoinEquipArmors' + id]) {
                var metaFlagValue = Number($dataActors[i].meta['JoinEquipArmors' + id]);
                $gameParty.gainItem($dataArmors[metaFlagValue], 1, false);
                actor.changeEquipById(3, metaFlagValue);
            };
        }, this);
        if ($dataActors[i].meta['JoinSkillLearn']) {
            var joinSkillValues = $dataActors[i].meta['JoinSkillLearn'].split(',');
            for (var j = 0; j <= joinSkillValues.length - 1; j++) {
                $gameActors.actor(i).learnSkill(Number(joinSkillValues[j]));
            };
        };
        //初期レアリティ設定。スキルとしてはJoinSkillLearnで付与
        reality_setUp(i);
        //主人公確定
        var metaFlagValue = $dataActors[i].meta['Mcharacter'];
        if (metaFlagValue) {
            actor.addState(601);
        } else {
            actor.removeState(601);
        };
        //主人公と女・男用ステート↓
        var metaFlagValue = $dataActors[i].meta['Heroine'];
        if (metaFlagValue) {
            actor.addState(602);
        } else {
            actor.addState(603);
        };
        //立ち絵変更あり男に全裸スキル
        var metaFlagValue = $dataActors[i].meta['MultipleTachie'];
        if (metaFlagValue) {
            actor.learnSkill(45);
        };
        //全員に通常攻撃十種基本スキル付与。
        var list = [101, 111, 121, 131, 141, 151, 161, 171, 181, 191];
        list.forEach(function (id) {
            actor.learnSkill(id);
        }, this);
        //初期JP  
        actor.gainJp(100);
        //苗字代入
        if ($dataActors[i].meta['SecondName']) {
            var joinSkillValues = $dataActors[i].meta['SecondName'].split(',');
            $dataWeapons[i + 200].name = joinSkillValues[1];
            $gameVariables.value(i + 380)[50] = $dataWeapons[i + 200].name;
        };
    };

    const ACTOR_RARITY_RANK_DATA = {
        // rarityRank: [skillId, rankLv, code, maxLevel]
        0: { skillId: 406, rankLv: 0, code: 'N', maxLv: 9 },
        1: { skillId: 405, rankLv: 1, code: 'R', maxLv: 39 },
        2: { skillId: 404, rankLv: 2, code: 'SR', maxLv: 59 },
        3: { skillId: 403, rankLv: 3, code: 'SSR', maxLv: 79 },
        4: { skillId: 402, rankLv: 4, code: 'UR', maxLv: 98 },
        5: { skillId: 401, rankLv: 5, code: 'LR', maxLv: 998 },
    }

    /*
    * Get actor rarity rank data
    */
    getRarityRank = function (actor) {
        for (var rarityRank in ACTOR_RARITY_RANK_DATA) {
            var rank = ACTOR_RARITY_RANK_DATA[rarityRank];
            if (actor.isLearnedSkill(rank.skillId)) {
                return rank;
            };
        }
    };

    //レアリティを設定
    reality_setUp = function (actorId) {

        var actor = $gameActors.actor(actorId);
        var rank = getRarityRank(actor);

        actor.gainMaxLevel(-999);
        actor.gainMaxLevel(rank.maxLv);
        actor.setupCssbgi(1, 'actorreality' + (valueCountSet1 = rank.code), 0, 0, 0, 0, 0);
        actor.setFaceImage("Actor_" + actorId, rank.rankLv);
    };

    const ACTOR_RARITY_RANK_SKILLS_DATA = {
        // rarityRank: { skillId, forgetSkillIds: [], learnSkillIds: [] }
        5: { skillId: 401, forgetSkillIds: [], learnSkillIds: [] },
        4: { skillId: 402, forgetSkillIds: [402], learnSkillIds: [401] },
        3: { skillId: 403, forgetSkillIds: [403], learnSkillIds: [402] },
        2: { skillId: 404, forgetSkillIds: [404], learnSkillIds: [403] },
        1: { skillId: 405, forgetSkillIds: [405], learnSkillIds: [404] },
        0: { skillId: 406, forgetSkillIds: [406], learnSkillIds: [405] },
    }

    //レアリティアップ
    reality_Up = function (actorId) {

        var actor = $gameActors.actor(actorId);
        for (var rank in ACTOR_RARITY_RANK_SKILLS_DATA) {
            var rankData = ACTOR_RARITY_RANK_SKILLS_DATA[rank];
            if (actor.isLearnedSkill(rankData.skillId)) {
                rankData.forgetSkillIds.forEach(function (id) {
                    actor.forgetSkill(id);
                }, this);
                rankData.learnSkillIds.forEach(function (id) {
                    actor.learnSkill(id);
                }, this);
            };
        }
    };

    const RANK_BY_PROMOTION_DATA = {
        // rankLv: { promotionValue, promotionCode, cost }
        0: { promotionValue: 402, promotionCode: 'LR', cost: 1000000 },
        1: { promotionValue: 403, promotionCode: 'UR', cost: 100000 },
        2: { promotionValue: 404, promotionCode: 'SSR', cost: 50000 },
        3: { promotionValue: 405, promotionCode: 'SR', cost: 10000 },
        4: { promotionValue: 406, promotionCode: 'R', cost: 1000 },
    }

    //レアリティの昇格計算
    // 昇格に必要な素材の作業配列。CommonEvent 235 が mode 1 → 2 → 0 の順で
    // 呼ぶ前提で、mode 1 が詰めて mode 2/0 が読む。宣言が無いと window を汚し、
    // mode 1 を経ずに呼ばれた場合は undefined.length で落ちる。
    let arr1 = [];
    let arr2 = [];
    reality_setPromotion = function (promotionModeId, actorId) {

        if (promotionModeId == 1) {
            var promotionValue = 401;
            var actor = $gameActors.actor(actorId);
            arr1 = [];
            arr2 = [];
            for (var i = 401; i <= 406; i++) {
                if (actor.isLearnedSkill(i)) {
                    var promotionValue = i;
                    break;
                }
            };
            if (valueCountSet1 == 401) {
                //最高レアのため昇格不可
            } else {
                for (var rank in RANK_BY_PROMOTION_DATA) {
                    var rankData = RANK_BY_PROMOTION_DATA[rank];
                    if (promotionValue == rankData.promotionValue) {
                        valueWordSet2 = '<' + rankData.promotionCode + '>' + '昇格';
                        valueWordSet1 = rankData.promotionCode + 'promotionM'; // do not translate, meta
                        valueCountSet2 = rankData.cost;
                        break;
                    }
                };

                for (var i = 1; i <= $dataItems.length - 1; i++) {
                    if ($dataItems[i].meta[valueWordSet1]) {
                        arr1.push(i);
                        arr2.push(Number($dataItems[i].meta[valueWordSet1]));
                    };
                };

                var promotionMessage = `${valueWordSet2}\n`;
                for (var i = 0; i <= arr1.length - 1; i++) {
                    promotionMessage += `\x1bIIN[${arr1[i]}]:\\C[10]${arr2[i]}\\C[0]個<${$gameParty.numItems($dataItems[arr1[i]])}>\n`;
                };
                promotionMessage += `\\C[10]${valueCountSet2.toLocaleString()}\\C[0]\\G<${$gameParty.gold().toLocaleString()}\\G>`;
                $gameScreen.setDTextPicture(promotionMessage, 28);
                $gameScreen.dWindowFrame = 'ON';
                var promotionPictureId = 100;
                var promotionMessage = '';
                $gameScreen.showPicture(promotionPictureId, promotionMessage, 0, 50 + 100, 100, 100, 100, 0, 0);
                $gameScreen.movePicture(promotionPictureId, 0, 50, 100, 100, 100, 255, 0, 60);
            };
            valueCountSet1 = promotionValue;
        };
        if (promotionModeId == 2) {
            var promotionValue = 0;
            for (var i = 0; i <= arr1.length - 1; i++) {
                if ($gameParty.numItems($dataItems[arr1[i]]) < arr2[i]) {
                    var promotionValue = 1;
                };
            };
            if ($gameParty.gold() < valueCountSet2) {
                var promotionValue = 1;
            };
            if (promotionValue == 0) {
                $gameSwitches.setValue(380, true);
            } else {
                $gameSwitches.setValue(380, false);
            };
        };

        if (promotionModeId == 0) {
            for (var i = 0; i <= arr1.length - 1; i++) {
                $gameParty.loseItem($dataItems[arr1[i]], arr2[i]);
                var promotionValue = `\x1bIIN[${arr1[i]}]を\\C[10]${arr2[i]}\\C[0]個捧げた…`;
                TickerManager.show(promotionValue);
            };
            $gameParty.loseGold(valueCountSet2);
            var promotionValue = `\\C[10]${valueCountSet2.toLocaleString()}\\C[0]\\G捧げた…`;
            TickerManager.show(promotionValue);
        };

    };

    //監禁、奴隷化時にレアリティと装備を記憶。レアリティダウンを実行するかはid3が1で実行
    reality_setRelegation = function (rarityModeId, actorId, isRarityDownFlag) {
        const actor = $gameActors.actor(actorId);
        const stateData93 = $dataStates[93];
        const classData1 = $dataClasses[1];
        let equipData = $gameVariables.value(333)[actorId];
        const actorName = actor.name();
        const stateName = stateData93.name;
        const stateIcon = stateData93.iconIndex;
        const baseClassName = classData1.name;

        if (rarityModeId === 0) {
            for (let i = 0; i < 10; i++) {
                if (equipData[i] >= 1) {
                    actor.changeEquipById(i + 1, equipData[i]);
                    equipData[i] = 0;
                }
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
                    const subclassMessage = `${actorName}のサブジョブが\\C[14]${baseClassName}\\C[0]に戻った！`;
                    CommonPopupManager.showInfo({}, subclassMessage, null);
                }
                equipData[11] = 0;
                equipData[12] = 0;
                equipData[13] = 0;
            }
        } else if (rarityModeId === 1) {
            $gameVariables.value(333)[actorId] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 0-10: 装備, 11: レアリティスキル, 12: 経験値, 13: サブジョブ
            equipData = $gameVariables.value(333)[actorId];
            let learnedSkill = 401;
            for (let i = 401; i <= 406; i++) {
                if (actor.isLearnedSkill(i)) {
                    learnedSkill = i;
                }
            }
            equipData[11] = learnedSkill;

            const equips = actor.equips();
            for (let i = 0; i < equips.length; i++) {
                if (equips[i]) {
                    equipData[i] = equips[i].id;
                    actor.changeEquipById(i + 1, 0);
                }
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
                const subclassAppliedMessage = `${actorName}のサブジョブが\\C[27]${dataClass.name}\\C[0]になった…`;
                CommonPopupManager.showInfo({}, subclassAppliedMessage, null);
            }
        }
    }

    //換金時にアイテム没収/解放時に放出スクリプト.1で実行 2で解除
    item_confinementScript = function (confinementModeId) {

        if (confinementModeId == 1) {
            if ($gameVariables.value(316)[0] == 0) {
                $gameVariables.setValue(316, Array(4).fill(0));
                for (var j = 0; j <= 3; j++) {
                    $gameVariables.value(316)[j] = [];
                    for (var slotIndex = 0; slotIndex <= 2000; slotIndex++) {
                        $gameVariables.value(316)[j].push(0);
                    };
                };
                $gameVariables.value(316)[3] = 0;
            };
        };
        if (confinementModeId == 1) {
            if ($gameParty.gold() >= 1) {
                var confinementValue = `アイテム類と所持金\\C[1]${$gameParty.gold().toLocaleString()}\\C[0]を奪われた…`;
                CommonPopupManager.showInfo({}, confinementValue, null);
                $gameVariables.value(316)[3] += $gameParty.gold();
                $gameParty.loseGold($gameParty.gold());
            };
        } else {
            if ($gameVariables.value(316)[3] >= 1) {
                var confinementValue = `アイテム類と所持金\\C[5]${$gameVariables.value(316)[3].toLocaleString()}\\C[0]を取り戻した！`;
                CommonPopupManager.showInfo({}, confinementValue, null);
                $gameParty.gainGold($gameVariables.value(316)[3]);
                $gameVariables.value(316)[3] = 0;
            };
        };
        for (var j = 0; j <= 2; j++) {
            var sourceEntries = getItemEquipmentSource(j);
            var start = 1;
            if (j == 2) {
                var end = valueArmorsLength;
            } else {
                var end = sourceEntries.length - 1;
            };
            for (var i = start; i <= end; i++) {
                var databaseEntry = sourceEntries[i];
                if (!databaseEntry) continue;
                if (confinementModeId == 1) {
                    var confinementValue = $gameParty.hasItem(databaseEntry, true);
                } else {
                    var confinementValue = $gameVariables.value(316)[j][i];
                };
                if (confinementValue) {
                    if (j == 0) {
                        if (databaseEntry.meta['EICSwitch']) {
                            if ([101, 106, 109].some(function (id) { return Number(databaseEntry.meta['EICSwitch']) == id })) {
                                if (confinementModeId == 1) {
                                    $gameVariables.value(316)[j][i] += $gameParty.numItems(databaseEntry);
                                    $gameParty.loseItem(databaseEntry, $gameVariables.value(316)[j][i]);
                                } else {
                                    $gameParty.gainItem(databaseEntry, $gameVariables.value(316)[j][i]);
                                    $gameVariables.value(316)[j][i] = 0;
                                };
                            };
                        };
                    };
                    if (j == 1) {
                        if (confinementModeId == 1) {
                            $gameVariables.value(316)[j][i] += $gameParty.numItems(databaseEntry);
                            $gameParty.loseItem(databaseEntry, $gameVariables.value(316)[j][i]);
                        } else {
                            $gameParty.gainItem(databaseEntry, $gameVariables.value(316)[j][i]);
                            $gameVariables.value(316)[j][i] = 0;
                        };
                    };
                    if (j == 2) {
                        if (databaseEntry.meta['Not Independent item']) {
                            if (confinementModeId == 1) {
                                $gameVariables.value(316)[j][i] += $gameParty.numItems(databaseEntry);
                                $gameParty.loseItem(databaseEntry, $gameVariables.value(316)[j][i]);
                            } else {
                                $gameParty.gainItem(databaseEntry, $gameVariables.value(316)[j][i]);
                                $gameVariables.value(316)[j][i] = 0;
                            };
                        };
                    };
                };
            };
        };
        if (confinementModeId == 0) {
            $gameVariables.setValue(316, Array(4).fill(0));
        };

    };

    //初めて来る街でマップ名表示
    map_centerDispray = function (pictureId, mapTitleText) {

        var screenPictureId = pictureId;
        var backgroundPictureName = 'ScreenBlackOut';
        $gameScreen.showPicture(screenPictureId, backgroundPictureName, 1, 640, 384, 100, 100, 0, 0);
        $gameScreen.movePicture(screenPictureId, 1, 640, 384, 100, 100, 150, 0, 30);
        var backgroundPictureName = 'ScreenCenterTextDisPray';
        $gameScreen.showPicture(screenPictureId + 1, backgroundPictureName, 1, 640, 384, 100, 0, 0, 0);
        $gameScreen.movePicture(screenPictureId + 1, 1, 640, 384, 100, 100, 255, 0, 30);
        var centerDisplayText = mapTitleText;
        $gameScreen.setDTextPicture(`\\f[b]${centerDisplayText}`, 40);
        $gameScreen.setDtextFont('ＭＳ Ｐ明朝');
        pic_1(2, screenPictureId + 3, '', 3, 100, 255, 90, 1280, 768, 0, 0);

    };

    //右横256とメニュー背景設定 backGraund_menuMapSelect(2,'BG_Shower',0,0);
    backGraund_menuMapSelect = function (backgroundVariantId, backgroundName, horizontalScrollSpeed, verticalScrollSpeed) {

        h_keikenhyouji2(521, 0);
        $gameScreen.erasePicture(6);
        $gameScreen.erasePicture(70);
        if ($gameVariables.value(508) == 0) {
            $gameVariables.setValue(508, 'BlueSky');
            $gameVariables.setValue(81, 0.3);//メニュー背景横スク
            $gameVariables.setValue(82, 0);//メニュー背景縦スク
        };
        if ($gameSwitches.value(206)) {
            if ($gameSwitches.value(15)) {
                $gameVariables.setValue(508, 'BG_MyRoomN');
                $gameVariables.setValue(81, 0);//メニュー背景横スク
                $gameVariables.setValue(82, 0.4);//メニュー背景縦スク
            } else {
                $gameVariables.setValue(508, 'BG_MyRoom');
                $gameVariables.setValue(81, 0.3);//メニュー背景横スク
                $gameVariables.setValue(82, 0);//メニュー背景縦スク
            };
        };
        if (backgroundName != 0) {
            $gameVariables.setValue(508, backgroundName);
            $gameVariables.setValue(81, horizontalScrollSpeed);//メニュー背景横スク
            $gameVariables.setValue(82, verticalScrollSpeed);//メニュー背景縦スク
        };
        if ($gameVariables.value(508) != 0) {
            Galv.CACHE.load('parallaxes', $gameVariables.value(508));
            $gameSystem._backgroundName = $gameVariables.value(508);
            if ($gameVariables.value(81) != 0) { var hScrollEnabled = true } else { var hScrollEnabled = false };
            if ($gameVariables.value(82) != 0) { var vScrollEnabled = true } else { var vScrollEnabled = false };
            if ($gameSwitches.value(468)) {
                $gameMap.changeParallax($gameVariables.value(508), hScrollEnabled, vScrollEnabled, $gameVariables.value(81), $gameVariables.value(82));
            };
            if ($gameSwitches.value(209) || $gameSwitches.value(227)) { } else {//全体マップと艦橋ではない場合
                if (['Dungeon2_2'].some(function (id) { return $gameVariables.value(508) == id })) {
                    var parallaxYOffset = -355;
                } else {
                    var parallaxYOffset = 0;
                };
                $gameScreen.showPicture(6, '/img/parallaxes/' + $gameVariables.value(508), 0, 1024, parallaxYOffset + 50, 100, 100, 0, 0);
                $gameScreen.movePicture(6, 0, 1024, parallaxYOffset, 100, 100, 250, 0, 60);
                if (backgroundVariantId == 2) {
                    $gameScreen.showPicture(70, '/img/parallaxes/' + $gameVariables.value(508), 0, 1024, parallaxYOffset + 50, 100, 100, 0, 0);
                    $gameScreen.movePicture(70, 0, 1024, parallaxYOffset, 100, 100, 255, 0, 60);
                };
            };
        };

    };

    //遠景をアイテム武器ＩＤで指定
    setMap_parallaxSelect = function (databaseTypeId, paramItemId, paramInOutFlag) {

        var parallaxKey = 0;
        if (databaseTypeId == 0) { var metaSource = $dataItems[paramItemId] };
        if (databaseTypeId == 1) { var metaSource = $dataWeapons[paramItemId] };
        if (databaseTypeId == 1) {
            if (paramInOutFlag == 0) {
                if (metaSource.meta['BG_in']) { var parallaxKey = 'BG_in' };
            };
            if (paramInOutFlag == 1) {
                if (metaSource.meta['BG_out']) { var parallaxKey = 'BG_out' };
            };
            if ($gameSwitches.value(15)) {
                if (paramInOutFlag == 0) {
                    if (metaSource.meta['BG_inN']) { var parallaxKey = 'BG_inN' };
                };
                if (paramInOutFlag == 1) {
                    if (metaSource.meta['BG_outN']) { var parallaxKey = 'BG_outN' };
                };
            };
        };
        if (databaseTypeId == 0) {
            if (metaSource.meta['BG2']) { var parallaxKey = 'BG2' };
            if ($gameSwitches.value(15)) {
                if (metaSource.meta['BGN2']) { var parallaxKey = 'BGN2' };
            };
        };
        if (parallaxKey != 0) {
            var parallaxValues = metaSource.meta[parallaxKey].split(',');
            if (Number(parallaxValues[1]) == 0) {
                var hScrollEnabled = false
            } else {
                var hScrollEnabled = true;
            };
            if (Number(parallaxValues[2]) == 0) {
                var vScrollEnabled = false
            } else {
                var vScrollEnabled = true;
            };
            $gameMap.changeParallax(parallaxValues[0], hScrollEnabled, vScrollEnabled, Number(parallaxValues[1]), Number(parallaxValues[2]));
            $gameVariables.setValue(508, parallaxValues[0]);
            $gameVariables.setValue(81, 0);//メニュー背景横スク
            $gameVariables.setValue(82, 0);//メニュー背景縦スク
        };

    };

    //BGMをjouhouで設定した配列で指定。BGMの保存も実行
    setMap_musicSelect2 = function () {

        AudioManager.playBgm({ name: valueMapBGM[0], volume: valueMapBGM[1], pitch: valueMapBGM[2], pan: valueMapBGM[3] });
        $gameSystem.saveBgm();

    };

    //BGMをアイテム武器ＩＤで指定
    setMap_musicSelect = function (databaseTypeId, paramItemId, paramInOutFlag) {

        if (databaseTypeId == 0) { var metaSource = $dataItems[paramItemId] };
        if (databaseTypeId == 1) { var metaSource = $dataWeapons[paramItemId] };
        if ($dataMap.meta['BGM']) { var metaSource = $dataMap };
        if (metaSource.meta['BGM']) {
            if ($gameSwitches.value(15)) {
                if (metaSource.meta['BGMN']) { var bgmKey = 'BGMN' };
            } else {
                var bgmKey = 'BGM';
            };
            var bgmValues = metaSource.meta[bgmKey].split(',');
            AudioManager.playBgm({ name: bgmValues[0], volume: bgmValues[1], pitch: bgmValues[2], pan: bgmValues[3] });
            $gameSystem.saveBgm();
        };

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
                gameVariables.setValue(292, Array(21).fill(0));
                if (!isInBattle) { $gameTemp.stopMapPlayerMovement() };
                if (!isInBattle) { gamePlayer.setStealthMode(true) };
                //gameSwitches.setValue(71,true);//ﾌﾟﾚｲﾔ移動禁止
                gameSwitches.setValue(124, true);//イベント進行時onoff
                gameSwitches.setValue(468, true);//ﾏｯﾌﾟﾌｪｰﾄﾞと他イベント進行禁止
                gameSwitches.setValue(467, true);//NPC消滅スイッチon
                if (gameVariables.value(320) == 0) {
                    if (valueWeatherSceneSet != 0) {
                        for (var i = 13; i <= 15; i++) {
                            if (gameSwitches.value(i)) {
                                gameSwitches.setValue(i, false);
                                gameVariables.setValue(320, i);
                            };
                        };
                        gameSwitches.setValue(valueWeatherSceneSet, true);
                    };
                };
                var activeCommonEventIds = $gameMap._commonEvents.filter(function (event) {
                    return event.isActive();
                }).map(function (event) {
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
                    gameVariables.setValue(529, dataCommonEvents[gameVariables.value(201)].switchId);
                };
            };
        }
        else if (scenePhaseId == 0) {
            if (gameVariables.value(528) >= 101) {
                const max = gameVariables.value(292).length;
                const gameMap = $gameMap;
                for (var i = 0; i < max; i++) {
                    if (gameVariables.value(292)[i] >= 1) {
                        if (!!gameMap.event(gameVariables.value(292)[i])) {
                            if (!isInBattle) { gameMap.eraseEvent(gameVariables.value(292)[i]) };
                        };
                    };
                };
                if (gameVariables.value(320) >= 1) {
                    for (var i = 13; i <= 15; i++) {
                        gameSwitches.setValue(i, false);
                    };
                    gameSwitches.setValue(gameVariables.value(320), true);
                };
                gameVariables.setValue(320, 0);
                gameVariables.setValue(292, Array(21).fill(0));
                if (!isInBattle) { gamePlayer.setStealthMode(false) };
                if (!isInBattle) {
                    gamePlayer.setThrough(false);
                    $gameTemp.allowMapPlayerMovement();
                };
                //gameSwitches.setValue(71,false);//ﾌﾟﾚｲﾔ移動禁止
                gameSwitches.setValue(124, false);//イベント進行時onoff
                gameSwitches.setValue(467, false);//NPC消滅スイッチoff。
                gameSwitches.setValue(506, false);//通行人消滅スイッチoff。任意
                gameSwitches.setValue(473, false);//天候反映なし。任意
                gameSwitches.setValue(468, false);//ﾏｯﾌﾟﾌｪｰﾄﾞと他イベント進行禁止
                gameSwitches.setValue(180, true);//自動実行トリガー
                if (!isInBattle) {
                    drowsepost.camera.zoom(1, 60, gamePlayer);
                    gamePlayer.setTransparent(false);
                };
                itemGet_afterProcess();
                fade_wipeDirect(1);
                if (gameVariables.value(529) >= 2) {
                    gameSwitches.setValue(gameVariables.value(529), false);
                };
            };
        };

    };

    //イベント開始と終了時スクリプト
    eventScene_StartEnd = function (startEndFlag, selectionSwitchId, sceneParamValue, eventItemId) {

        valueCountSet1 = 0;
        const startSceneActor = $gameActors.actor($gameVariables.value(11));
        if (startSceneActor) { $gameVariables.setValue(49, startSceneActor.name()) };
        $gameVariables.setValue(525, 0); //達成スイッチid変数
        if (eventItemId >= 401) {
            if ($dataItems[eventItemId].meta['AddEventCompSwi']) {
                var completionSwitchId = Number($dataItems[eventItemId].meta['AddEventCompSwi']);
            } else {
                if ($gameVariables.value(626) == 1) {//挿話
                    var completionSwitchId = eventItemId + 900
                };
                if ($gameVariables.value(626) == 2) {//Ｈ
                    var completionSwitchId = eventItemId + 600
                };
            };
            $gameVariables.setValue(525, completionSwitchId);
            valueCountSet1 += completionSwitchId;
            if (startEndFlag == 1 && !$gameSwitches.value(29) && !$gameSwitches.value(503) && !$gameSwitches.value(505)) {
                var registrationFlag = 0;
                if ($dataItems[eventItemId].meta['RegistrationC1']) {
                    var conditionExpression = $dataItems[eventItemId].meta['RegistrationC1'];
                    if (eval(conditionExpression)) {
                        var registrationFlag = 1;
                    };
                };
                if ($dataItems[eventItemId].meta['RegistrationC2']) {
                    var conditionExpression = $dataItems[eventItemId].meta['RegistrationC2'];
                    if (eval(conditionExpression)) {
                        var registrationFlag = 1;
                    };
                };
                if ($dataItems[eventItemId].meta['RegistrationC3']) {
                    var conditionExpression = $dataItems[eventItemId].meta['RegistrationC3'];
                    if (eval(conditionExpression)) {
                        var registrationFlag = 1;
                    };
                };
                if (registrationFlag == 0) { $gameParty.gainItem($dataItems[eventItemId], 1) };
                $gameSwitches.setValue(completionSwitchId, true);
            };
        } else {
            if (startEndFlag == 1 && !$gameSwitches.value(29) && !$gameSwitches.value(503) && !$gameSwitches.value(504) && !$gameSwitches.value(505)) { //135-140
                if ($gameSwitches.value(61)) { $gameVariables.setValue(135, $gameVariables.value(135) + 1) };
                if ($gameSwitches.value(62)) { $gameVariables.setValue(136, $gameVariables.value(136) + 1) };
                if ($gameSwitches.value(63)) { $gameVariables.setValue(137, $gameVariables.value(137) + 1) };
                if ($gameSwitches.value(64)) { $gameVariables.setValue(138, $gameVariables.value(138) + 1) };
                if ($gameSwitches.value(65)) { $gameVariables.setValue(139, $gameVariables.value(139) + 1) };
                if ($gameSwitches.value(66)) { $gameVariables.setValue(140, $gameVariables.value(140) + 1) };
            };
            $gameSwitches.setValue(504, false);
        };
        if (startEndFlag == 0) {
            if ($gameVariables.value(320) == 0) {
                for (var i = 13; i <= 15; i++) {
                    if ($gameSwitches.value(i)) {
                        $gameVariables.setValue(320, i);
                    };
                };
            };
            if (valueWeatherSceneSet != 0) {
                $gameSwitches.setValue(13, false);
                $gameSwitches.setValue(14, false);
                $gameSwitches.setValue(15, false);
                $gameSwitches.setValue(valueWeatherSceneSet, true);
            };
            if (!$gameParty.inBattle()) { $gamePlayer.setThrough(true) };
            if (!$gameParty.inBattle()) { $gamePlayer.setStealthMode(true) };
            if (eventItemId >= 1) {
                if ($gameSwitches.value(29)) {
                    valueSceneConditions1 = true;
                    valueSceneConditions2 = true;
                    valueSceneConditions3 = true;
                } else {
                    if ($dataItems[eventItemId].meta['RegistrationC1']) {
                        valueSceneConditions1 = $dataItems[eventItemId].meta['RegistrationC1'];
                    };
                    if ($dataItems[eventItemId].meta['RegistrationC2']) {
                        valueSceneConditions2 = $dataItems[eventItemId].meta['RegistrationC2'];
                    };
                    if ($dataItems[eventItemId].meta['RegistrationC3']) {
                        valueSceneConditions3 = $dataItems[eventItemId].meta['RegistrationC3'];
                    };
                };
            };
            //$gamePlayer.setTransparent(true);//効果なし。コモンで実行
            $gameSwitches.setValue(467, true);//NPC消滅スイッチon
            $gameSwitches.setValue(468, true);
            $gameSwitches.setValue(124, true);
            $gameVariables.setValue(292, Array(21).fill(0));
            $gameVariables.setValue(530, sceneParamValue);
            //$gameSwitches.setValue(71,true);//ﾌﾟﾚｲﾔ移動禁止未使用
            if (!$gameParty.inBattle()) { $gameTemp.stopMapPlayerMovement() };
        } else {
            if ($gameVariables.value(320) >= 1) {
                for (var i = 13; i <= 15; i++) {
                    $gameSwitches.setValue(i, false);
                };
                $gameSwitches.setValue($gameVariables.value(320), true);
            };
            $gameVariables.setValue(320, 0);
            if ($gameVariables.value(630) >= 1) {
                for (var i = 13; i <= 15; i++) {
                    $gameSwitches.setValue(i, false);
                };
                if ($gameVariables.value(630) == 1) { $gameSwitches.setValue(13, true) };
                if ($gameVariables.value(630) == 2) { $gameSwitches.setValue(14, true) };
                if ($gameVariables.value(630) == 3) { $gameSwitches.setValue(15, true) };
                $gameVariables.setValue(630, 0);
            };
            if (!$gameParty.inBattle()) { $gamePlayer.setThrough(false) };
            if (!$gameParty.inBattle()) { $gamePlayer.setStealthMode(false) };
            $gameSwitches.setValue(124, false);//イベント進行時onoff
            $gameSwitches.setValue(473, false);
            $gameSwitches.setValue(505, false);//選択肢でシーン達成なし続行
            if (!$gameParty.inBattle()) {
                $gameTemp.allowMapPlayerMovement();
                $gameTemp.allowMapEventMovement();
            };
            $gameSwitches.setValue(467, false);//NPC消滅スイッチoff
            $gameSwitches.setValue(506, false);//通行人消滅スイッチoff。任意
            for (var i = 0; i <= $gameVariables.value(292).length - 1; i++) {
                if ($gameVariables.value(292)[i] >= 1) {
                    if (!!$gameMap.event($gameVariables.value(292)[i])) {
                        if (!$gameParty.inBattle()) { $gameMap.eraseEvent($gameVariables.value(292)[i]) };
                    };
                };
            };
            valueWeatherSceneSet = 0;
            valueSceneConditions1 = true;
            valueSceneConditions2 = true;
            valueSceneConditions3 = true;
            $gameVariables.setValue(292, Array(21).fill(0));
            $gameVariables.setValue(530, 0);
            $gameVariables.setValue(528, 0);
            if (!$gameSwitches.value(29)) {
                $gamePlayer.setTransparent(false);
                if ($gameSwitches.value(412)) {//挿話
                    $gameSwitches.setValue(412, false);
                };
                if ($gameSwitches.value(469)) {//Ｈ
                    $gameSwitches.setValue(469, false);
                };
            };
            if (!$gameParty.inBattle()) {
                drowsepost.camera.zoom(1, 60, $gamePlayer);
            };
            if (selectionSwitchId >= 2) {
                valueCountSet2 = selectionSwitchId;
                //$gameSwitches.setValue(selectionSwitchId,false);
            };
        };

    };

    //隊列順で次の表示者を決定formation_orderSelect(20,0);
    formation_orderSelect = function (targetVarId, stepDirectionId) {

        const partyMembers = $gameParty.members();
        const maxPartyMembersIndex = $gameParty.members().length - 1;

        let partyMemberIndex1;
        let partyMemberIndex2;
        if (stepDirectionId == 0) {
            partyMemberIndex1 = maxPartyMembersIndex;
            partyMemberIndex2 = 0;
        } else {
            partyMemberIndex1 = 0;
            partyMemberIndex2 = maxPartyMembersIndex;
        };

        for (let i = 0; i <= maxPartyMembersIndex; i++) {
            if (partyMembers[i].actorId() == $gameVariables.value(targetVarId)) {
                if (i == partyMemberIndex1) {
                    $gameVariables.setValue(targetVarId, partyMembers[partyMemberIndex2].actorId());
                } else {
                    let index = i + (stepDirectionId == 0 ? 1 : -1);
                    $gameVariables.setValue(targetVarId, partyMembers[index].actorId());
                };
                break;
            }
        };

    };

    //隊列順で次のヒロインを決定formation_orderSelectH(20,0);//formation_orderSelectH(167,2);
    formation_orderSelectH = function (targetVarId, listModeId) {

        if (listModeId == 2) {
            valueHeroineCoice = [];
            for (var i = 0; i <= $gameParty.members().length - 1; i++) {
                if (isGirl($gameParty.members()[i])) {
                    valueHeroineCoice.push($gameParty.members()[i].actorId());
                };
            };
            if (valueHeroineCoice.length >= 2) {
                $gameSwitches.setValue(targetVarId, true);
            };
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
            };

            const trySetActorIndex = (index) => {
                const actorIndex = valueHeroineCoice[index];
                const actor = $gameActors.actor(actorIndex);
                if (isGirl(actor)) {
                    $gameVariables.setValue(targetVarId, actorIndex);
                    return true;
                };
                return false;
            }

            const len = valueHeroineCoice.length;
            for (let i = 0; i < len; i++) {
                const currentHeroineId = valueHeroineCoice[i];
                if (currentHeroineId !== $gameVariables.value(targetVarId)) continue;
                if (currentHeroineId == valueHeroineCoice[actorIndex1]) {
                    if (listModeId == 0) {
                        for (var j = 0; j < len; j++) if (trySetActorIndex(j)) break;
                        break;
                    }
                    else if (listModeId == 1) {
                        const maxIndex = valueHeroineCoice.length - 1;
                        for (var j = maxIndex; j >= 0; j--) if (trySetActorIndex(j)) break;
                        break;
                    }
                } else {
                    const actorIndex = $gameActors.actor(valueHeroineCoice[i]).index() + actorIndexShift;
                    const actor = $gameParty.members()[actorIndex];
                    if (actor && isGirl(actor)) {
                        $gameVariables.setValue(targetVarId, actor.actorId());
                        break;
                    }
                }
            }
        }

    };

    //初期解説コモン+tips選択肢作成
    start_commentary = function (switchId, choiceText, displayType, displayText, firstPictureData, firstTextData, secondPictureData, secondTextData) {

        if ($gameSwitches.value(427)) {
            const id = 1;
            const choiceParams = {
                text: `${choiceText}`,
                value: valueStartCommentary0
            };
            $gameSystem.addCustomChoice(id, choiceParams);
            if (displayType == 'Dpic') { } else {
                if (firstTextData == 'Nda') { } else { displayText += `\\I[535]` };
                $gameScreen.setDTextPicture(displayText, 28);
                $gameScreen.dWindowFrame = 'ON';
                var pictureId = 150 + valueStartCommentary1 + valueStartCommentary0;
                var pictureName = '';
                $gameScreen.showPicture(pictureId, pictureName, 0, 10, 606, 100, 100, 0, 0);
                $gameMessage.setSelectPictureId(valueStartCommentary0 - 1, pictureId);
            };
            if (displayType == 'Npic') { } else {
                if (displayType == 'Dpic') {
                    var pictureName = '';
                    $gameScreen.setDTextPicture(displayText, 28);
                    $gameScreen.dWindowFrame = 'ON';
                    var pictureY = 100;
                    var pictureX = 334;
                } else {
                    var pictureName = '/img/tips/' + displayType;
                    var pictureY = 0;
                    var pictureX = 334;
                }
                var pictureId = 100 + valueStartCommentary1 + valueStartCommentary0;
                $gameScreen.showPicture(pictureId, pictureName, 0, pictureX, pictureY, 100, 100, 0, 0);
                $gameMessage.setSelectPictureId(valueStartCommentary0 - 1, pictureId);
            };
        } else {
            $gameVariables.setValue(21, 0);
            $gameVariables.setValue(22, 0);
            if (!$gameSwitches.value(switchId)) {
                if (switchId >= 1) {
                    $gameSwitches.setValue(switchId, true);
                };
                AudioManager.playSe({ "name": 'Chime1', "volume": 90, "pitch": 100, "pan": 0 });
                $gameVariables.setValue(21, switchId);
                valueStartCommentary0 = 1;
                if (displayType == 'Npic' || displayType == 'Dpic') {
                    var pictureName = '';
                    $gameScreen.setDTextPicture(`${choiceText}\n${displayText}`, 28);
                    $gameScreen.dWindowFrame = 'ON';
                    $gameScreen.showPicture(102, pictureName, 0, 110, 100, 100, 100, 0, 0);
                } else {
                    var pictureName = '/img/tips/' + displayType;
                    $gameScreen.showPicture(102, pictureName, 0, 110, 100, 100, 100, 0, 0);
                    $gameVariables.setValue(22, displayText);
                };
                $gameScreen.movePicture(102, 0, 10, 10, 100, 100, 255, 0, 60);
                $gameScreen.showPicture(101, 'ScreenBlackOut', 1, 640, 384, 100, 100, 0, 0);
                $gameScreen.movePicture(101, 1, 640, 384, 100, 100, 200, 0, 60);
            };
        };
        if (firstPictureData == 'Npic') { } else {
            valueStartCommentary2P[valueStartCommentary0] = firstPictureData;
        };
        if (firstTextData == 'Nda') { } else {
            valueStartCommentary2[valueStartCommentary0] = firstTextData;
        };
        if (secondPictureData == 'Npic') { } else {
            valueStartCommentary3P[valueStartCommentary0] = secondPictureData;
        };
        if (secondTextData == 'Nda') { } else {
            valueStartCommentary3[valueStartCommentary0] = secondTextData;
        };
        valueStartCommentary0 += 1;
        valueWordSet0 = choiceText;

    };

    //スキル習得時のコスト（反応）skill_learnFeedback(user,skill.id);
    skill_learnFeedback = function (user, skillId) {

        var feedbackMessage = ` `;
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
            };
            if (user.skillMasteryLevel(skillId) < 1) {
                feedbackMessage += `${userName}は\\C[16]\x1bSIN[${skillId}]\\C[0]を習得した！`;
            } else {
                feedbackMessage += `${userName}の\\C[16]\x1bSIN[${skillId}]\\C[0]がランクアップ！`;
            };
            user.gainSkillMasteryLevel(skillId, +1);
            const skillLevel = user.skillMasteryLevel(skillId);
            const maxSkillLevel = Number(maxMasteryLevel);
            feedbackMessage += ` [\\C[2]${skillLevel}/${maxSkillLevel}\\C[0]]`;
            if (skillLevel >= maxSkillLevel) {
                feedbackMessage += `\\C[10]<ランクマックス！>\\C[0]`;
            };
        } else {
            feedbackMessage += `${userName}は\\C[16]\x1bSIN[${skillId}]\\C[0]を習得した！`;
            feedbackAnimationId = 296;
        };
        //};
        TickerManager.show(feedbackMessage);
        user.startAnimation(feedbackAnimationId, true, 0);//変更。アニメ追加
        passive_addCondition(user);//パッシブ
        title_battleUp(user);//タイトル
        user.refresh();

    };

    //スキル習得時のＪＰコストskill_learnJPCost(user,skill.id);
    skill_learnJPCost = function (user, skillId) {

        var rankUpPoint = Number($dataSkills[skillId].meta.RankUpPoint);
        var skillMasteryUses = user.skillMasteryUses(skillId);
        valueSkillLearnJPCost = (rankUpPoint + user.skillMasteryLevel(skillId) * rankUpPoint) - skillMasteryUses;

    };

    //クラス毎ジョブ解放スクリプト。途中セーブ禁止！
    job_releaseUnlockEvent = function (startLearningIndex, endLearningIndex) {

        var actor = $gameActors.actor($gameVariables.value(20));
        var choiceSlotId = 101;
        var choiceIndex = 1;
        //var value5 = $gameMap.event(1).screenX()*$gameScreen.zoomScale();
        //var value6 = $gameMap.event(1).screenY()*$gameScreen.zoomScale();
        const id = 1;
        const choiceParams = {
            text: `${actor.name()}→`, value: 0
        };
        $gameSystem.addCustomChoice(id, choiceParams);
        var classInfoText = ``;
        var start = 0;
        var end = $dataClasses[actor._classId].learnings.length - 1;
        var skillOrFoundFlag = 0;
        for (var i = start; i <= end; i++) {
            if ($dataClasses[actor._classId].learnings[i]) {
                var currentClassId = $dataClasses[actor._classId].learnings[i].skillId;
                if ($dataClasses[actor._classId].learnings[i].level >= actor.level) {
                    classInfoText += `\\C[17][Lv${$dataClasses[actor._classId].learnings[i].level}]\\C[0]`;
                    classInfoText += `\x1bSIN[${currentClassId}]\n`;
                    classInfoText += `${$dataSkills[currentClassId].description}\n`;
                    skillOrFoundFlag += 1
                };
            };
            if (skillOrFoundFlag >= 6) {
                break;
            };
        };
        var classDescriptionText = `\\C[23]<${$dataClasses[actor._classId].name}>\\C[0]\n${$dataClasses[actor._classId].description}\n${valueAddDescriptionClass[actor._classId]}\n`;
        $gameScreen.setDTextPicture(`${classDescriptionText + classInfoText}`, 22);
        $gameScreen.dWindowFrame = 'ON';
        $gameScreen.showPicture(choiceSlotId - 1, '', 0, 300, 20, 100, 100, 0, 0);
        $gameMessage.setSelectPictureId(0, choiceSlotId - 1);
        for (var j = startLearningIndex; j <= endLearningIndex; j++) {
            var currentClassId = j;
            var skillOrFoundFlag = 0;
            var releaseItemIndex = 0;
            var releaseBlockedFlag = 0;
            var classInfoText = `\\C[14]習得可能スキル\\C[0]\n`;
            for (var i = 0; i < actor.unlockedClasses().length; ++i) {
                if (actor.unlockedClasses()[i] == currentClassId) {
                    var skillOrFoundFlag = 1;
                    break;
                }
            };
            if (skillOrFoundFlag == 0) {
                var start = 1;
                var end = 888;//$dataSkills.length-1;エネミースキル除外のため
                for (var i = start; i <= end; i++) {
                    if ($dataSkills[i].meta['SkillLearningClass']) {
                        if (Number($dataSkills[i].meta['SkillLearningClass']) == currentClassId) {
                            classInfoText += `\x1bSIN[${i}]\n`;
                            classInfoText += `${$dataSkills[i].description}\n`;
                        }
                    }
                };
                var classRankValue = Number($dataClasses[currentClassId].meta['classRank']);
                if (classRankValue == 1) { var releaseCost = 3000 };
                if (classRankValue == 2) { var releaseCost = 10000 };
                if (classRankValue == 3) { var releaseCost = 100000 };
                classInfoText += `\\C[14]解放資金\\C[0]:${releaseCost.toLocaleString()}`;
                var currentGold = $gameParty.gold();
                if (currentGold >= releaseCost) {
                    classInfoText += `（現在所持金:${currentGold.toLocaleString()}）\n`;
                } else {
                    classInfoText += `\\C[10]（現在所持金:${currentGold.toLocaleString()}）\\C[0]\n`;
                    var releaseBlockedFlag = 1;
                };
                classInfoText += `\\C[14]解放素材\\C[0]:`;
                if (classRankValue >= 1) {
                    for (var i = 1; i <= $dataItems.length - 1; i++) {
                        if ($dataItems[i].meta['class' + classRankValue + 'JobReleaseM']) {
                            var releaseItemIndex = i;
                            break;
                        }
                    }
                };
                if (releaseItemIndex >= 1) {
                    classInfoText += `${$dataItems[releaseItemIndex].name} 3個`;
                    if ($gameParty.numItems($dataItems[releaseItemIndex]) >= 1) {
                        classInfoText += `（所持数:${$gameParty.numItems($dataItems[releaseItemIndex])}）\n`;
                        if ($gameParty.numItems($dataItems[releaseItemIndex]) >= 3) { } else {
                            var releaseBlockedFlag = 1;
                        };
                    } else {
                        classInfoText += `\\C[10]（未所持）\\C[0]\n`;
                        var releaseBlockedFlag = 1;
                    };
                } else {
                    classInfoText += `なし\n`;
                };
                if (classRankValue >= 2) {
                    if (classRankValue == 2) { var requiredLevel = 20 };
                    if (classRankValue == 3) { var requiredLevel = 30 };
                    classInfoText += `\\C[14]解放条件\\C[0]:`;
                    classInfoText += `${$dataClasses[currentClassId - 10].name}LV:${actor.classLevel(currentClassId - 10)}`;
                    if (actor.classLevel(currentClassId - 10) >= requiredLevel) {
                        classInfoText += `<達成>\n`;
                    } else {
                        classInfoText += `\\C[10]<未達成>\\C[0]\n`;
                        var releaseBlockedFlag = 1;
                    };
                };
                if (releaseBlockedFlag == 0) {
                    valueJobReleaseTorF1[currentClassId] = 1;
                    var classNameLabel = `${$dataClasses[currentClassId].name}`;
                } else {
                    var classNameLabel = `\\C[7]${$dataClasses[currentClassId].name}\\C[0]`;
                };
                const id = 1;
                const choiceParams = {
                    text: `${classNameLabel}`,
                    value: choiceIndex
                };
                $gameSystem.addCustomChoice(id, choiceParams);
                var classDescriptionText = `${$dataClasses[currentClassId].description}\n${valueAddDescriptionClass[currentClassId]}\n`;
                $gameScreen.setDTextPicture(`${classDescriptionText + classInfoText}`, 22);
                $gameScreen.dWindowFrame = 'ON';
                $gameScreen.showPicture(choiceSlotId, '', 0, 300, 20, 100, 100, 0, 0);
                $gameMessage.setSelectPictureId(choiceIndex, choiceSlotId);
                valueJobReleaseTorF2[choiceIndex] = currentClassId;
                choiceSlotId += 1;
                choiceIndex += 1;
            };
        };

    };

    //クラス毎ジョブ解放スクリプト。コスト支払い
    job_releaseCostEvent = function (classId) {

        var classRankIndex = Number($dataClasses[classId].meta['classRank']);

        if (classRankIndex == 1) { var goldValue = 3000 }
        else if (classRankIndex == 2) { var goldValue = 10000 }
        else if (classRankIndex == 3) { var goldValue = 100000 };

        var soundFileName = classRankIndex == 3 ? '21_ClassRelease2' : '21_ClassRelease';
        AudioManager.playMe({ "name": soundFileName, "volume": 90, "pitch": 100, "pan": 0 });

        $gameParty.loseGold(goldValue);
        var messageText = `所持金:-\\C[2]${goldValue}\\C[0]\\G`;
        CommonPopupManager.showInfo({}, messageText, null);

        let itemIndex = 0;
        if (classRankIndex >= 1) {
            for (var i = 1; i <= $dataItems.length - 1; i++) {
                if ($dataItems[i].meta['class' + classRankIndex + 'JobReleaseM']) {
                    itemIndex = i;
                    break;
                }
            }
        };

        if (itemIndex >= 1) {
            const item = $dataItems[itemIndex];
            $gameParty.loseItem(item, 3);

            const messageText = `アイテム:-\\C[2]${item.name}\\C[0]`;
            CommonPopupManager.showInfo({}, messageText, null);
        };

        var actor = $gameActors.actor($gameVariables.value(20));
        actor.unlockClass(classId);
        $gameSwitches.setValue(424, true);//初めてジョブ解放したスイッチ

    };

    //パーティ全体のアンロッククラス数,コモン43で実行
    actors_unlockedClassHit = function () {

        var unlockedClassCounts = [];
        for (var i = 0; i < $gameParty.members().length; i++) {
            var actor = $gameParty.members()[i];
            var actorUnlockedClasses = actor.unlockedClasses();
            var unlockedClassCounts = unlockedClassCounts.concat(actorUnlockedClasses);
        };
        unlockedClassCounts.filter(function (x, i, self) {
            return self.indexOf(x) === i;
        });
        var groupACount = 0;
        var groupBCount = 0;
        var groupCCount = 0;
        for (var i = 0; i < unlockedClassCounts.length; i++) {
            if (unlockedClassCounts[i] >= 51 && unlockedClassCounts[i] <= 60) {
                groupACount += 1;
            };
            if (unlockedClassCounts[i] >= 61 && unlockedClassCounts[i] <= 70) {
                groupBCount += 1;
            };
            if (unlockedClassCounts[i] >= 71 && unlockedClassCounts[i] <= 80) {
                groupCCount += 1;
            };
        };
        if (groupACount >= 10) {
            $gameSwitches.setValue(423, true);
        };
        if (groupBCount >= 10) {
            $gameSwitches.setValue(613, true);
        };
        if (groupCCount >= 10) {
            $gameSwitches.setValue(614, true);
        };

    };

    //変数やスイッチのタイトル効果
    title_EffectConfi = function () {

        for (var i = 1; i <= $dataItems.length - 1; i++) {
            if ($dataItems[i].meta['titleEffectConfiSwi']) {
                var targetSwitchId = Number($dataItems[i].meta['titleEffectConfiSwi']);
                var switchStateValue = false;
                $gameSwitches.setValue(targetSwitchId, switchStateValue);
            };
        };

        //var list = [288,295];//通常タイトルとＨタイトルのセットして変数配列の変数id
        var list = [288];//Hタイトル枠削除
        list.forEach(function (titleSetVarId) {
            var titleStateValues = $gameVariables.value(titleSetVarId);
            for (var i = 0; i <= titleStateValues.length - 1; i++) {
                if (Number(titleStateValues[i]) >= 1) {
                    if ($dataItems[Number(titleStateValues[i])].meta['titleEffectConfiVal']) {
                        var titleEffectVariableValues = $dataItems[Number(titleStateValues[i])].meta['titleEffectConfiVal'].split(',');
                        $gameVariables.setValue(Number(titleEffectVariableValues[0]), $gameVariables.value(Number(titleEffectVariableValues[0])) + Number(titleEffectVariableValues[1]));
                    }
                };
                if (Number(titleStateValues[i]) >= 1) {
                    if ($dataItems[Number(titleStateValues[i])].meta['titleEffectConfiSwi']) {
                        var targetSwitchId = Number($dataItems[Number(titleStateValues[i])].meta['titleEffectConfiSwi']);
                        var switchStateValue = true;
                        $gameSwitches.setValue(targetSwitchId, switchStateValue);
                    }
                };
            };
        }, this);

        var noEffectTitleItemIds = valueTitleSetItemsNoSetEffect;
        for (var i = 0; i <= noEffectTitleItemIds.length - 1; i++) {
            if ($gameParty.hasItem($dataItems[Number(noEffectTitleItemIds[i])])) {
                if ($dataItems[Number(noEffectTitleItemIds[i])].meta['titleEffectConfiVal']) {
                    var titleEffectVariableValues = $dataItems[Number(noEffectTitleItemIds[i])].meta['titleEffectConfiVal'].split(',');
                    $gameVariables.setValue(Number(titleEffectVariableValues[0]), $gameVariables.value(Number(titleEffectVariableValues[0])) + Number(titleEffectVariableValues[1]));
                };
            };
            if ($dataItems[Number(noEffectTitleItemIds[i])].meta['titleEffectConfiSwi']) {
                var targetSwitchId = Number($dataItems[Number(noEffectTitleItemIds[i])].meta['titleEffectConfiSwi']);
                var switchStateValue = false;
                if ($gameParty.hasItem($dataItems[Number(noEffectTitleItemIds[i])])) { var switchStateValue = true };
                $gameSwitches.setValue(targetSwitchId, switchStateValue);
            };
        };

    };

    //フェードインアウトワイプ演出。0消去1汎用2ワープ
    fade_wipeDirect = function (wipeTypeId) {

        if (wipeTypeId == 0) {
            $gameScreen._useGWTrans = 'off';
        };
        if (wipeTypeId == 1) {
            if ($gameSwitches.value(201)) {
                var wipeImageCandidates = ['Dunjon004', 'Dunjon008', 'Dunjon012', 'Dunjon036', 'Dunjon052', 'Dunjon100', 'Dunjon104', 'Dunjon118', 'Dunjon153', 'Dunjon999'];
            } else {
                var wipeImageCandidates = ['Town048', 'Town084', 'Town092', 'Town129', 'Town131', 'Town225', 'Town309', 'Town310', 'Town001', 'Town013', 'Town014', 'Town032', 'Town033', 'Town039', 'Town041', 'Town046'];
            };
            var wipeImageName = wipeImageCandidates[getRandomIndex(wipeImageCandidates.length)];
        };
        if (wipeTypeId == 2) {
            var wipeImageName = 'Town129';
        };
        if (wipeTypeId >= 1) {
            $gameScreen._GWInImg = wipeImageName;
            $gameScreen._GWOutImg = wipeImageName;
            valueWipeImg = wipeImageName;
            Galv.CACHE.load('transitions', wipeImageName);
        };

    };

    //トラップ設定
    trap_setUp = function (unusedArg1) {

        $gameSwitches.setValue(380, false);
        var trapEventIds = [];
        var start = 1;
        var end = $dataSkills.length - 1;
        for (var i = start; i <= end; i++) {
            if ($dataSkills[i].meta['trapEvasion']) {
                trapEventIds.push(i);
            }
        };
        for (var i = 0; i <= $gameParty.members().length - 1; i++) {
            var actor = $gameParty.members()[i];
            for (var id = 0; id <= trapEventIds.length - 1; id++) {
                if (actor.battleSkillsRaw().includes(trapEventIds[id])) {
                    $gameSwitches.setValue(380, true);
                    break;
                };
            };
        };
        if (!$gameSwitches.value(380)) {
            var trapEventIds = [];
            var start = 1;
            var end = $dataItems.length - 1;
            for (var i = start; i <= end; i++) {
                if ($dataItems[i].meta['trapEvasion']) {
                    trapEventIds.push(i);
                }
            };
            for (var i = 0; i <= trapEventIds.length - 1; i++) {
                if ($gameParty.hasItem($dataItems[trapEventIds[i]])) {
                    $gameSwitches.setValue(380, true);
                    $gameParty.gainItem($dataItems[trapEventIds[i]], -1);
                    break;
                };
            };
        };
        if ($gameSwitches.value(380)) {
            $gameMap.spawnEvent(136, $gamePlayer._realX, $gamePlayer._realY, true);
            var event = $gameMap.event($gameMap.getLastSpawnEventId());
            var actor = $gameParty.members()[0];
            event.setImage(actor.characterName(), actor.characterIndex());
            event.setDirection($gamePlayer._direction);
            event.setPattern(1);
            event._originalPattern = 1;
            event.setOpacity(250);
            event.setBlendMode(1);
            var trapAvoidMessage = `\\C[16]${actor.name()}\\C[0]は\\C[10]トラップ\\C[0]を回避した！`;
            CommonPopupManager.showInfo({}, trapAvoidMessage, null);
        };

    };

    function getScaledTrapValue(enemyLevelValues, multiplier) {
        const baseValue = Number(enemyLevelValues[getRandomIndex(enemyLevelValues.length)]) * multiplier;
        return Math.floor(Math.random() * (baseValue * 10)) + (baseValue + 1);
    }

    trap_starting1 = function (trapModeId, eventId) {

        var event = $gameMap.event(eventId);
        if (trapModeId == 1) {
            valueCountSet1 = getRandomIndex(13);
            //valueCountSet1 = 13;//テスト用
            if (valueCountSet1 <= 1) { valueCountSet2 = 1 };
            if (valueCountSet1 == 2) { valueCountSet2 = 4 };//毒
            if (valueCountSet1 == 3) { valueCountSet2 = 5 };//暗闇
            if (valueCountSet1 == 4) { valueCountSet2 = 6 };//沈黙
            if (valueCountSet1 == 5) { valueCountSet2 = 1 };//激高
            if (valueCountSet1 == 6) { valueCountSet2 = 8 };//混乱
            if (valueCountSet1 == 7) { valueCountSet2 = 9 };//魅了
            if (valueCountSet1 == 8) { valueCountSet2 = 10 };//睡眠
            if (valueCountSet1 == 9) { valueCountSet2 = 1 };//スタン
            if (valueCountSet1 == 10) { valueCountSet2 = 0 };//爆破。ＨＰダメージ623user.gainMp(-evasionThreshold);
            if (valueCountSet1 == 11) { valueCountSet2 = 0 };//吸収。ＭＰダメージ625
            if (valueCountSet1 == 12) { valueCountSet2 = 0 };//脱力。TＰダメージ626
            if (valueCountSet1 == 13) { valueCountSet2 = 0 };//転移。valueCountSet2に転送先のイベID
        };
        if (trapModeId == 2) {
            if (valueCountSet2 == 1) {
                var actor = $gameParty.members()[0];
                if (isGirl(actor)) {
                    actor.addState(62);
                    if (actor.isStateAffected(62)) {
                        $gamePlayer.requestAnimation(624);
                        $gameVariables.setValue(20, actor.actorId());
                        var infoText = `衣装破損トラップが発生した！`;
                    } else {
                        $gamePlayer.requestBalloon(2);
                        var infoText = `しかし何も起こらなかった…。（\\C[3]衣装破損トラップ未発生\\C[0]）`;
                    };
                };
                CommonPopupManager.showInfo({}, infoText, null);
            };
            if ([4, 5, 6, 8, 9, 10].some(function (id) { return valueCountSet2 == id })) {
                $gamePlayer.requestAnimation(valueStateAnimeArr[valueCountSet2]);
                for (var i = 0; i <= $gameParty.members().length - 1; i++) {
                    var actor = $gameParty.members()[i];
                    state_addFormula1([valueCountSet2, 50, actor, actor, actor.mdf, actor.luk]);
                };
            };
            if (valueCountSet1 == 5 || valueCountSet1 == 9) {
                $gamePlayer.requestBalloon(2);
                var infoText = `しかし何も起こらなかった…。`;
                CommonPopupManager.showInfo({}, infoText, null);
            };
            if (valueCountSet1 == 10) {
                $gamePlayer.requestAnimation(623);
                var infoText = `足元の魔法陣から爆発が発生した！`;
                CommonPopupManager.showInfo({}, infoText, null);
                for (var i = 0; i <= $gameParty.members().length - 1; i++) {
                    var actor = $gameParty.members()[i];
                    //agi,luk,actor.xparam(0)*100。Math.round((actor.agi * 2 + actor.luk /10) * (actor.xparam(0)*100))
                    var evasionThreshold = Math.round((actor.agi * 2 + actor.luk / 10) * (actor.xparam(0)));
                    var randomRoll = getRandomIndex(900) + 101;
                    var damageAmount = getRandomIndex(900) + 101;
                    if ($gameVariables.value(240) >= 1) {
                        const enemyLevelValues = $dataItems[$gameVariables.value(240)].meta['EnemyLV'].split(',');
                        randomRoll = getScaledTrapValue(enemyLevelValues, 10);
                        damageAmount = getScaledTrapValue(enemyLevelValues, 10);
                    };
                    if (randomRoll > evasionThreshold) {
                        $gamePlayer.requestAnimation(131);
                        actor.gainHp(-damageAmount);
                        var infoText = `\\C[16]${actor.name()}\\C[0]は\\C[10]${damageAmount}\\C[0]のＨＰダメージを受けた！（判定：\\C[4]${evasionThreshold}\\C[0] > \\C[10]${randomRoll}\\C[0]）`;
                        CommonPopupManager.showInfo({}, infoText, null);
                    } else {
                        $gamePlayer.requestAnimation(129);
                        var infoText = `\\C[16]${actor.name()}\\C[0]は\\C[2]回避\\C[0]に成功した！（判定：\\C[4]${evasionThreshold}\\C[0] > \\C[10]${randomRoll}\\C[0]）`;
                        CommonPopupManager.showInfo({}, infoText, null);
                    };
                };
            };
            if (valueCountSet1 == 11) {
                var infoText = `吸収の魔法陣が発動した！`;
                CommonPopupManager.showInfo({}, infoText, null);
                $gamePlayer.requestAnimation(625);
                for (var i = 0; i <= $gameParty.members().length - 1; i++) {
                    var actor = $gameParty.members()[i];
                    var evasionThreshold = Math.round((actor.mat * 2 + actor.luk / 10) * (actor.xparam(0)));
                    var randomRoll = getRandomIndex(900) + 101;
                    var damageAmount = getRandomIndex(900) + 101;
                    if ($gameVariables.value(240) >= 1) {
                        const enemyLevelValues = $dataItems[$gameVariables.value(240)].meta['EnemyLV'].split(',');
                        randomRoll = getScaledTrapValue(enemyLevelValues, 10);
                        damageAmount = getScaledTrapValue(enemyLevelValues, 1);
                    };
                    if (randomRoll > evasionThreshold) {
                        $gamePlayer.requestAnimation(58);
                        actor.gainMp(-damageAmount);
                        var infoText = `\\C[16]${actor.name()}\\C[0]は\\C[10]${damageAmount}\\C[0]のＭＰダメージを受けた！（判定：\\C[4]${evasionThreshold}\\C[0] > \\C[10]${randomRoll}\\C[0]）`;
                        CommonPopupManager.showInfo({}, infoText, null);
                    } else {
                        $gamePlayer.requestAnimation(129);
                        var infoText = `\\C[16]${actor.name()}\\C[0]は\\C[2]回避\\C[0]に成功した！（判定：\\C[4]${evasionThreshold}\\C[0] > \\C[10]${randomRoll}\\C[0]）`;
                        CommonPopupManager.showInfo({}, infoText, null);
                    };
                };
            };
            if (valueCountSet1 == 12) {
                var infoText = `脱力の魔法陣が発動した！`;
                CommonPopupManager.showInfo({}, infoText, null);
                event.requestAnimation(626);
                for (var i = 0; i <= $gameParty.members().length - 1; i++) {
                    var actor = $gameParty.members()[i];
                    var evasionThreshold = Math.round((actor.mdf * 2 + actor.luk / 10) * (actor.xparam(0)));
                    var randomRoll = getRandomIndex(900) + 101;
                    var damageAmount = getRandomIndex(90) + 11;
                    if ($gameVariables.value(240) >= 1) {
                        const enemyLevelValues = $dataItems[$gameVariables.value(240)].meta['EnemyLV'].split(',');
                        randomRoll = getScaledTrapValue(enemyLevelValues, 10);
                    };
                    if (randomRoll > evasionThreshold) {
                        $gamePlayer.requestAnimation(58);
                        actor.gainTp(-damageAmount);
                        var infoText = `\\C[16]${actor.name()}\\C[0]は\\C[10]${damageAmount}\\C[0]のＴＰダメージを受けた！（判定：\\C[4]${evasionThreshold}\\C[0] > \\C[10]${randomRoll}\\C[0]）`;
                        CommonPopupManager.showInfo({}, infoText, null);
                    } else {
                        $gamePlayer.requestAnimation(129);
                        var infoText = `\\C[16]${actor.name()}\\C[0]は\\C[2]回避\\C[0]に成功した！（判定：\\C[4]${evasionThreshold}\\C[0] > \\C[10]${randomRoll}\\C[0]）`;
                        CommonPopupManager.showInfo({}, infoText, null);
                    };
                };
            };
            if (valueCountSet1 == 13) {
                $gameVariables.setValue(161, 0);
                var infoText = $gameMap.events().length;
                if (infoText >= 50) {
                    var warpSearchStartId = 200;
                } else {
                    var warpSearchStartId = 100;
                };
                for (var id = warpSearchStartId; id > 0; id--) {
                    if (!!$gameMap.event(id)) {
                        if ($gameMap.event(id).event().meta['warpTrap']) {
                            valueCountSet2 = id;
                            $gameVariables.setValue(161, [$gameMap.mapId(), $gameMap.event(id).x, $gameMap.event(id).y]);
                            break;
                        }
                    }
                };
                var infoText = `転送トラップが発動した！`;
                CommonPopupManager.showInfo({}, infoText, null);
            };
        };

    };

    //フラッシュモブ演出flashmob_wordDirect(1,55,56,100,'Tamanegiv6',`!?`);
    flashmob_wordDirect = function (displayModeId, bannerPictureId, messagePictureId, messageText, fontName, textPictureId) {
        if (displayModeId == 0) {
            $gameScreen.erasePicture(bannerPictureId);
            $gameScreen.erasePicture(messagePictureId);
        } else {
            if (displayModeId == 1) { var pictureName = 'Screen_mobFlash' };
            if (displayModeId == 2) { var pictureName = 'Screen_hukidasi' };
            if (displayModeId == 3) { var pictureName = 'Screen_hukidasiIkari' };
            var pictureId = bannerPictureId;
            if (displayModeId == 1 || displayModeId == 2) {
                pic_1(2, pictureId, pictureName, 0, 100, 250, 60, 1280, 768, 0, 0);
            };
            if (displayModeId == 3) {
                pic_1(2, pictureId, pictureName, 0, 100, 255, 40, 1280, 768, 0, 0);
            };
            var pictureId = textPictureId;
            var pictureName = messageText;
            $gameScreen.setDTextPicture(`\\oc[15]\\C[15]${pictureId}`, pictureName);//\\f[b]
            $gameScreen.setDtextFont(fontName);
            var pictureId = messagePictureId;
            if (displayModeId == 1 || displayModeId == 2) {
                $gameScreen.showPicture(pictureId, "", 1, 640 - 240 + 60, 384 - 80, 100, 100, 0, 0);
                $gameScreen.movePicture(pictureId, 1, 640 - 240, 384 - 80, 100, 100, 255, 0, 60);
            };
            if (displayModeId == 3) {
                adv_partDirectPlay(7);
                $gameScreen.dTextAlign = 1;
                $gameScreen.showPicture(pictureId, "", 1, 640, 384, 300, 300, 0, 0);
                $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 100, 255, 0, 40);
            };
            if (displayModeId == 1 || displayModeId == 3) {
                ensyutu_ikari(60, 'Thunder9');
            };
        };

    };

    //獲得物等一覧表示
    get_loopListDisplay = function () {

        var windowYOffset = 0;
        if (valueCountSet2 >= 2) {
            windowYOffset += 6 * 3 * 38;
        } else {
            windowYOffset += valueCountSet1 * 3 * 38 + 60;
        };
        var windowY = 50;
        if (valueCountSet1 <= 3) {
            windowY = 250 - (valueCountSet1 * 40);
        };
        WindowManager.show(1, 0, windowY, 1280, 768 - windowY);
        WindowManager.drawText(1, `\\fs[28]${eval("valueWordSet" + valueCountSet3)}`);
        valueCountSet3 += 1;

    };

    //獲得物等一覧表示全画面
    get_loopListDisplay2 = function () {

        WindowManager.show(1, 0, 70, 1280, 698);
        WindowManager.drawText(1, `\\fs[28]${eval("valueWordSet" + valueCountSet3)}`);
        valueCountSet3 += 1;

    };

    //獲得物等一覧表示２面仕様valueCountSet3 = 0;から始める
    get_loopListDisplay3 = function (isBulkSellFlag) {

        //id1で一括売却実行//arr1[0];//名前//arr1[1];//数//arr1[2];//\G
        //arr1[3];//変数57//arr1[4];//ｱｲﾃﾑID270//valueIkkatuArray[j];
        var pageIndex = 1;
        var leftDisplayText = ``;
        var rightDisplayText = ``;
        var accumulatedText = ``;
        if (isBulkSellFlag == 1) { var rowsPerPage = 20; var fontSize = 23 };
        if (isBulkSellFlag == 2) { var rowsPerPage = 15; var fontSize = 32 };
        for (var i = valueCountSet3; i <= valueIkkatuArray.length - 1; i++) {
            if (valueIkkatuArray[i] != 0) {
                if (isBulkSellFlag == 2) {//種族討伐数表示
                    if (valueIkkatuArray[i][0].length <= 8) {
                        for (var j = valueIkkatuArray[i][0].length; j <= 9; j++) {
                            valueIkkatuArray[i][0] += `　`;
                        };
                    };
                    accumulatedText += `　　\\C[16]${valueIkkatuArray[i][0]}\\C[0]:\\C[2]${valueIkkatuArray[i][1]}体\\C[0] `;
                    accumulatedText += `\n`;
                    eval((pageIndex == 1 ? "leftDisplayText" : "rightDisplayText") + " = accumulatedText");
                };
                if (isBulkSellFlag == 1) {//一括売却実行用
                    accumulatedText += `${valueIkkatuArray[i][0]}:${valueIkkatuArray[i][1]}個売却 `;
                    valueCountSet4 += valueIkkatuArray[i][1];
                    if (valueIkkatuArray[i][2] != 0) {
                        var formattedValue = valueIkkatuArray[i][2].toLocaleString();
                        accumulatedText += `[+${formattedValue}\G]`;
                        valueCountSet5 += valueIkkatuArray[i][2];
                    };
                    if (valueIkkatuArray[i][3] != 0) {
                        var formattedValue = valueIkkatuArray[i][3].toLocaleString();
                        accumulatedText += `[+\\I[1]${formattedValue}]`;
                        valueCountSet6 += valueIkkatuArray[i][3];
                    };
                    if (valueIkkatuArray[i][4] != 0) {
                        var formattedValue = valueIkkatuArray[i][4].toLocaleString();
                        accumulatedText += `[+\\I[1]${formattedValue}]`;
                        valueCountSet7 += valueIkkatuArray[i][4];
                    };
                    accumulatedText += `\n`;
                    eval((pageIndex == 1 ? "leftDisplayText" : "rightDisplayText") + " = accumulatedText");
                };
                valueCountSet3 += 1;
                if ((valueCountSet3 % rowsPerPage) == 0) {
                    if (pageIndex == 2) {
                        break;
                    };
                    var pageIndex = 2;
                    var accumulatedText = ``;
                };
            };
        };
        WindowManager.show(1, 0, 70, 640, 698);
        WindowManager.drawText(1, `\x1bfs[${fontSize}]${leftDisplayText}`);
        if (rightDisplayText != 0) {
            WindowManager.show(2, 640, 70, 1280, 698);
            WindowManager.drawText(2, `\x1bfs[${fontSize}]${rightDisplayText}`);
        };

    };

    //選択肢でアイテム表示item_price()合わせて3面表示//選択肢のvalueは1からで選択肢ﾋﾟｸﾁｬは0からvalueWordArray
    get_loopChoiceDisplay1 = function (listKindId, entryCategoryId, columnCount) {
        //get_loopChoiceDisplay1(1,0,1);//クエストid1は種類 id2が0道具1武器2防具 id3が列数WindowManager.hide(0);
        //get_loopChoiceDisplay1(2,0,2);//一括売却
        //get_loopChoiceDisplay1(3,0,2);//一括売却

        //picture_motion1("linear",[0]);
        $gameVariables.setValue(177, columnCount);
        if (listKindId == 1) {//クエスト掲示
            WindowManager.show(0, 0, 0, 1280, 110);
            var titleText = `　　　　　　　　　　　　　　　　　　　` + `クエスト掲示板`;
            WindowManager.drawText(0, titleText);
            var choicePromptText = `　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　`;
        };
        if (listKindId == 2 || listKindId == 3) {//一括売却
            var choicePromptText = `\\FS[25]対象を選択して下さい　　　　　　　　　　　　　　　　　　　　　　　　　　　`;
        };
        var choiceIndex = 1;
        if (listKindId == 2 || listKindId == 3) {
            const id = 1;
            const choiceParams = {
                text: choicePromptText,
                value: -1
            };
            $gameSystem.addCustomChoice(id, choiceParams);
        };
        var choiceText = ``;//選択肢表示分
        var dTextContent = ``;//item_price()の表示分
        valueCountArray3 = [];
        for (var i = 0; i <= valueCountArray.length - 1; i++) {
            if (valueWordArray != 0) {
                var choiceText = `${valueWordArray[i]}`;
            } else {
                if (listKindId == 3) {
                    if (valueCountArray2[i] == 0) { var choiceText = `\x1bIIN[${valueCountArray[i]}]` };
                    if (valueCountArray2[i] == 1) { var choiceText = `\x1bWIN[${valueCountArray[i]}]` };
                    if (valueCountArray2[i] == 2) { var choiceText = `\x1bAIN[${valueCountArray[i]}]` };
                } else {
                    if (entryCategoryId == 0) { var choiceText = `\x1bIIN[${valueCountArray[i]}]` };
                    if (entryCategoryId == 1) { var choiceText = `\x1bWIN[${valueCountArray[i]}]` };
                    if (entryCategoryId == 2) { var choiceText = `\x1bAIN[${valueCountArray[i]}]` };
                };
            };
            if (listKindId == 1) {//クエスト
                if (valueWordArray[i] == `？？？`) {
                    var prefix = '[' + colorTaggedText(1, `受注不可`) + ']';
                    var iconIndex = $dataItems[valueCountArray[i]].iconIndex;
                    var icon = `\x1bI[${iconIndex}]`;
                    var unknownText = `？？？`;
                    var choiceText = prefix + icon + unknownText
                    var dTextContent = valueQuestArray7[valueCountArray[i] - 800];
                } else {
                    var dTextContent = valueQuestArray4[valueCountArray[i] - 800];
                };
            };
            if (listKindId == 2) {//一括売却
                item_priceinfo(entryCategoryId, valueCountArray[i]);
                var dTextContent = $gameVariables.value(801);
            };
            const id = 1;
            const choiceParams = {
                text: choiceText,
                value: i
            };
            $gameSystem.addCustomChoice(id, choiceParams);
            valueCountArray3.push(valueCountArray[i]);
            if (columnCount <= 2 && choiceIndex <= 240) {
                if (columnCount == 2) { var picturePosX = 1000 };
                if (columnCount == 1) { var picturePosX = 700 };
                if (columnCount == 2) { var picturePosY = 10 };
                if (columnCount == 1) { var picturePosY = 120 };
                var selectPictureId = choiceIndex - 1;
                if (listKindId == 2) { var selectPictureId = choiceIndex };
                if (listKindId == 1 || listKindId == 2) {//クエストと一括対象選択のみ。
                    $gameScreen.setDTextPicture(dTextContent, 22);
                    $gameScreen.dWindowFrame = 'ON';
                    var pictureName = '';
                    $gameScreen.showPicture(choiceIndex + 10, pictureName, 0, picturePosX, picturePosY, 100, 100, 0, 0);
                    $gameMessage.setSelectPictureId(selectPictureId, choiceIndex + 10);
                };
            };
            choiceIndex += 1;
        };

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
        var entryIndex = 1;
        if ($gameVariables.value(183)[entryIndex] == 0) {
            $gameVariables.setValue(800 + entryIndex, `Ｈシーンフラグをリセットする`);
        } else {
            $gameVariables.setValue(800 + entryIndex, `Ｈシーンフラグをリセットしない`);
        };
        var entryIndex = 2;
        if ($gameVariables.value(183)[entryIndex] == 0) {
            $gameVariables.setValue(800 + entryIndex, `挿話シーンフラグをリセットする`);
        } else {
            $gameVariables.setValue(800 + entryIndex, `挿話シーンフラグをリセットしない`);
        };
        var entryIndex = 3;
        if ($gameVariables.value(183)[entryIndex] == 0) {
            $gameVariables.setValue(800 + entryIndex, `Ｈ回想履歴をリセットする`);
        } else {
            $gameVariables.setValue(800 + entryIndex, `Ｈ回想履歴をリセットしない`);
        };
        var entryIndex = 4;
        if ($gameVariables.value(183)[entryIndex] == 0) {
            $gameVariables.setValue(800 + entryIndex, `挿話回想履歴をリセットする`);
        } else {
            $gameVariables.setValue(800 + entryIndex, `挿話回想履歴をリセットしない`);
        };
        var entryIndex = 5;
        if ($gameVariables.value(183)[entryIndex] == 0) {
            $gameVariables.setValue(800 + entryIndex, `クエスト達成状況をリセットする`);
        } else {
            $gameVariables.setValue(800 + entryIndex, `クエスト達成状況をリセットしない`);
        };
        var entryIndex = 6;
        if ($gameVariables.value(183)[entryIndex] == 0) {
            $gameVariables.setValue(800 + entryIndex, `各種族討伐数をリセットする`);
        } else {
            $gameVariables.setValue(800 + entryIndex, `各種族討伐数をリセットしない`);
        };
        var entryIndex = 7;
        if ($gameVariables.value(183)[entryIndex] == 0) {
            $gameVariables.setValue(800 + entryIndex, `マップ情報をリセットする`);
        } else {
            $gameVariables.setValue(800 + entryIndex, `マップ情報をリセットしない`);
        };
        var entryIndex = 8;
        if ($gameVariables.value(183)[entryIndex] == 0) {
            $gameVariables.setValue(800 + entryIndex, `戦闘レコードをリセットする`);
        } else {
            $gameVariables.setValue(800 + entryIndex, `戦闘レコードをリセットしない`);
        };

    };

    //リセット時に実行
    reset_exe1 = function () {

        const gameSwitches = $gameSwitches;
        const gameVariables = $gameVariables;
        const gameParty = $gameParty;
        const gameActors = $gameActors;

        const dataSystem = $dataSystem;
        const dataSystemSwitches = dataSystem.switches;
        const dataSystemVariables = $dataSystem.variables;
        const dataSystemSwitchesCount = dataSystemSwitches.length;
        const dataSystemVariablesCount = dataSystemVariables.length;
        const dataSkills = $dataSkills;
        const dataSkillsCount = dataSkills.length;
        const dataItems = $dataItems;
        const dataItemsCount = dataItems.length;
        const dataWeapons = $dataWeapons;
        const dataWeaponsCount = dataWeapons.length;
        const dataArmors = $dataArmors;
        //const dataArmorsCount = dataArmors.length;
        const dataStates = $dataStates;
        const dataStatesCount = dataStates.length;

        for (let i = 401; i < dataSystemSwitchesCount; i++) {
            const systemName = dataSystemSwitches[i];
            if (systemName.match(/NoReset/) || systemName.match(/QReset/) || systemName.match(/OReset/) || systemName.match(/SReset/)) { } else {
                gameSwitches.setValue(i, false);
            }
        };
        for (let i = 501; i < dataSystemVariablesCount; i++) {
            const systemName = dataSystemVariables[i];
            if (systemName.match(/NoReset/) || systemName.match(/QReset/) || systemName.match(/OReset/) || systemName.match(/SReset/)) { } else {
                gameVariables.setValue(i, 0);
            }
        };
        if (gameVariables.value(183)[1] == 0) {
            for (let i = 1; i < dataSystemSwitchesCount; i++) {
                if (dataSystemSwitches[i].match(/シーン達成/) || dataSystemSwitches[i].match(/SReset/)) {
                    gameSwitches.setValue(i, false);
                }
            };
            for (let i = 1; i < dataSystemVariablesCount; i++) {
                if (dataSystemVariables[i].match(/シーン達成/) || dataSystemVariables[i].match(/SReset/)) {
                    gameVariables.setValue(i, 0);
                }
            };
            for (let i = 1; i < dataSkillsCount; i++) {
                if (dataSkills[i].meta['SceneFactorClearReset']) {
                    for (let j = gameVariables.value(75); j <= gameVariables.value(76); j++) {
                        const actor = gameActors.actor(j);
                        if (actor.isLearnedSkill(i)) {
                            if (dataSkills[i].meta['Max Mastery Level']) {
                                actor.setSkillMasteryLevel(i, 0);
                            };
                            actor.forgetSkill(i);
                        }
                    }
                }
            };
            for (let i = 1; i < dataStatesCount; i++) {
                if (dataStates[i].meta['SceneFactorClearReset']) {
                    for (let j = gameVariables.value(75); j <= gameVariables.value(76); j++) {
                        const actor = gameActors.actor(j);
                        if (actor.isStateAffected(i)) {
                            actor.removeState(i);
                        }
                    }
                }
            };
            for (let i = 1; i <= dataItems.length - 1; i++) {
                if (dataItems[i].meta['DungeonInformation']) {
                    gameParty.gainItem(dataItems[i], -9999);
                };
                if (dataItems[i].meta['SceneFactorClearReset']) {
                    gameParty.gainItem(dataItems[i], -9999);
                };
            };
            for (let i = 1; i < dataWeaponsCount; i++) {
                if (dataWeapons[i].meta['SceneFactorClearReset']) {
                    gameParty.gainItem(dataWeapons[i], -9999);
                };
            };
            for (let i = 1; i <= valueArmorsLength; i++) {
                if (dataArmors[i].meta['SceneFactorClearReset']) {
                    gameParty.gainItem(dataArmors[i], -9999);
                }
            };
        };
        if (gameVariables.value(183)[2] == 0) {
            for (let i = 1; i < dataSystemSwitchesCount; i++) {
                if (dataSystemSwitches[i].match(/挿話達成/) || dataSystemSwitches[i].match(/OReset/)) {
                    gameSwitches.setValue(i, false);
                }
            };
            for (let i = 1; i < dataSystemVariablesCount; i++) {
                if (dataSystemVariables[i].match(/挿話達成/) || dataSystemVariables[i].match(/OReset/)) {
                    gameVariables.setValue(i, 0);
                }
            };
        };
        if (gameVariables.value(183)[3] == 0) {
            for (let i = 1; i < dataItemsCount; i++) {
                if (dataItems[i].meta['EICSwitch']) {
                    if (Number(dataItems[i].meta['EICSwitch']) == 103) {
                        gameParty.gainItem(dataItems[i], -1);
                    }
                }
            }
        };
        if (gameVariables.value(183)[4] == 0) {
            for (let i = 1; i < dataItemsCount; i++) {
                if (dataItems[i].meta['EICSwitch']) {
                    if (Number(dataItems[i].meta['EICSwitch']) == 102) {
                        gameParty.gainItem(dataItems[i], -1);
                    }
                }
            }
        };
        if (gameVariables.value(183)[5] == 0) {
            for (let i = 1; i < dataItemsCount; i++) {
                if (dataItems[i].meta['SG種別']) {
                    if (Number(dataItems[i].meta['SG種別']) == 1) {
                        gameParty.gainItem(dataItems[i], -1);
                    }
                }
            };
            for (let i = 1; i < dataSystemSwitchesCount; i++) {
                if (dataSystemSwitches[i].match(/QReset/)) {
                    gameSwitches.setValue(i, false);
                }
            };
            for (let i = 1; i < dataSystemVariablesCount; i++) {
                if (dataSystemVariables[i].match(/QReset/)) {
                    gameVariables.setValue(i, 0);
                }
            };
        };
        if (gameVariables.value(183)[6] == 0) {
            gameVariables.setValue(52, Array(1001).fill(0));
        };
        if (gameVariables.value(183)[7] == 0) {
            for (let i = 1; i < dataItemsCount; i++) {
                if (dataItems[i].meta['BattleMapInformation']) {
                    gameParty.gainItem(dataItems[i], -9999);
                }
            }
        };
        const var75 = gameVariables.value(75);
        const var76 = gameVariables.value(76);
        if (gameVariables.value(183)[8] == 0) {
            gameParty.clearRecord();
            for (let j = var75; j <= var76; j++) {
                gameActors.actor(j).clearBattleRecord();
            };
        };
        //<EventFactorClearReset>
        for (let i = 1; i < dataSkillsCount; i++) {
            if (dataSkills[i].meta['EventFactorClearReset']) {
                for (let j = var75; j <= var76; j++) {
                    const actor = gameActors.actor(j);
                    if (actor.isLearnedSkill(i)) {
                        if (dataSkills[i].meta['Max Mastery Level']) {
                            actor.setSkillMasteryLevel(i, 0);
                        };
                        actor.forgetSkill(i);
                    };
                }
            }
        };
        for (let i = 1; i < dataStatesCount; i++) {
            if (dataStates[i].meta['EventFactorClearReset']) {
                for (let j = var75; j <= var76; j++) {
                    const actor = gameActors.actor(j);
                    if (actor.isStateAffected(i)) {
                        actor.removeState(i);
                    };
                }
            }
        };
        for (let i = 1; i < dataItemsCount; i++) {
            if (dataItems[i].meta['EventFactorClearReset']) {
                gameParty.gainItem(dataItems[i], -9999);
            }
        };
        for (let i = 1; i < dataWeaponsCount; i++) {
            if (dataWeapons[i].meta['EventFactorClearReset']) {
                gameParty.gainItem(dataWeapons[i], -9999);
            }
        };
        for (let i = 1; i <= valueArmorsLength; i++) {
            if (dataArmors[i].meta['EventFactorClearReset']) {
                gameParty.gainItem(dataArmors[i], -9999);
            }
        };

    };

    //バトルレコード一覧
    actor_battleRecordDisplay1 = function () {

        valueBattleRecordMVP = Array(11).fill(0);
        var killCounts = []; var maxAttackDamages = []; var attackDamageSums = []; var criticalHitCounts = [];
        var overKillCounts = []; var maxAcceptDamages = []; var acceptDamageSums = []; var deathCounts = [];
        for (var i = 0; i <= $gameParty.members().length - 1; i++) {
            var actorId = $gameParty.members()[i]._actorId;
            var actor = $gameActors.actor(actorId);
            killCounts.push(actor.getAllKillEnemyCounter());
            maxAttackDamages.push(actor.attackDamageMax);
            attackDamageSums.push(actor.attackDamageSum);
            criticalHitCounts.push($gameVariables.value(380 + actorId)[68]);
            overKillCounts.push($gameVariables.value(380 + actorId)[67]);
            maxAcceptDamages.push(actor.acceptDamageMax);
            acceptDamageSums.push(actor.acceptDamageSum);
            deathCounts.push(actor.deadCounter);
        };
        var maxKillCount = killCounts.reduce(function (a, b) {
            return Math.max(a, b);
        });
        valueBattleRecordMVP[1] = maxKillCount;
        var maxAttackDamage = maxAttackDamages.reduce(function (a, b) {
            return Math.max(a, b);
        });
        valueBattleRecordMVP[2] = maxAttackDamage;
        var totalAttackDamage = attackDamageSums.reduce(function (a, b) {
            return Math.max(a, b);
        });
        valueBattleRecordMVP[3] = totalAttackDamage;
        var maxCriticalHitCount = criticalHitCounts.reduce(function (a, b) {
            return Math.max(a, b);
        });
        valueBattleRecordMVP[4] = maxCriticalHitCount;
        var maxOverKillCount = overKillCounts.reduce(function (a, b) {
            return Math.max(a, b);
        });
        valueBattleRecordMVP[5] = maxOverKillCount / 2;
        var maxAcceptDamage = maxAcceptDamages.reduce(function (a, b) {
            return Math.max(a, b);
        });
        valueBattleRecordMVP[6] = maxAcceptDamage;
        var totalAcceptDamage = acceptDamageSums.reduce(function (a, b) {
            return Math.max(a, b);
        });
        valueBattleRecordMVP[7] = totalAcceptDamage;
        var maxDeathCount = deathCounts.reduce(function (a, b) {
            return Math.max(a, b);
        });
        valueBattleRecordMVP[8] = maxDeathCount;

        var actorId = `\\C[10]☆Battle Record\\C[0]\nTotalKill\nMaxAssalt\nTotalAssalt\nCritical\nOverKill\nMaxDamage\nTotalDamage\nDefead\n`;
        actorId += `\\C[10]☆Skill Count\\C[0]\nAttack\nS-Ability\nA-Ability\nW-Ability\nR-Ability\nBurst!\nChain!`;
        WindowManager.show(1, 10, 100, 250, 668);
        WindowManager.drawText(1, actorId);
        var windowId = 2;
        var windowY = 260;
        const dataSkillsCount = $dataSkills.length;
        const gamePartyMembersCount = $gameParty.members().length;
        const partyMembers = $gameParty.members();
        for (var i = 0; i < gamePartyMembersCount; i++) {
            if (i == 4) break;
            const valueBattleRecord_i = "valueBattleRecord_" + i;
            eval("valueBattleRecord_" + i + " = Array(21).fill(-1)");
            var actor = partyMembers[i];
            const evalValueBattleRecord_i = eval("valueBattleRecord_" + i);
            evalValueBattleRecord_i[0] = `\\C[1]${actor.name()}\\C[0]\n`;
            evalValueBattleRecord_i[1] = actor.getAllKillEnemyCounter();
            evalValueBattleRecord_i[2] = actor.attackDamageMax;
            evalValueBattleRecord_i[3] = actor.attackDamageSum;
            evalValueBattleRecord_i[4] = $gameVariables.value(380 + actor.actorId())[68];
            evalValueBattleRecord_i[5] = $gameVariables.value(380 + actor.actorId())[67] / 2;
            evalValueBattleRecord_i[6] = actor.acceptDamageMax;
            evalValueBattleRecord_i[7] = actor.acceptDamageSum;
            evalValueBattleRecord_i[8] = actor.deadCounter;
            evalValueBattleRecord_i[10] = `────`
            for (var j = 11; j <= 17; j++) { evalValueBattleRecord_i[j] = 0 };
            for (var j = 1; j < dataSkillsCount; j++) {
                if ($dataSkills[j].name !== '') {
                    const skillStypeId = $dataSkills[j].stypeId;
                    if (skillStypeId == 2) { evalValueBattleRecord_i[11] += actor.getSkillUseCounter(j) };
                    if (skillStypeId == 5) { evalValueBattleRecord_i[12] += actor.getSkillUseCounter(j) };
                    if (skillStypeId == 6) { evalValueBattleRecord_i[13] += actor.getSkillUseCounter(j) };
                    if (skillStypeId == 7) { evalValueBattleRecord_i[14] += actor.getSkillUseCounter(j) };
                    if (skillStypeId == 8) { evalValueBattleRecord_i[15] += actor.getSkillUseCounter(j) };
                    if (skillStypeId == 12) { evalValueBattleRecord_i[16] += actor.getSkillUseCounter(j) };
                    if (skillStypeId == 13) { evalValueBattleRecord_i[17] += actor.getSkillUseCounter(j) };
                };
            };
            for (var j = 1; j <= 20; j++) {
                if (evalValueBattleRecord_i[j] != -1) {
                    if (j >= 1 && j <= 8) {
                        if (evalValueBattleRecord_i[j] >= 1 && evalValueBattleRecord_i[j] >= valueBattleRecordMVP[j]) {
                            evalValueBattleRecord_i[0] += `\\I[676]\\C[2]`;
                        };
                    };
                    if (evalValueBattleRecord_i[j] >= 1000000000) {
                        evalValueBattleRecord_i[0] += `\\fs[22]${evalValueBattleRecord_i[j].toLocaleString()}\\C[0]\\fs[28]\n`;
                    } else {
                        evalValueBattleRecord_i[0] += `${evalValueBattleRecord_i[j].toLocaleString()}\\C[0]\n`;
                    };
                };
            };
            WindowManager.show(windowId, windowY, 100, 250, 668);
            WindowManager.drawText(windowId, evalValueBattleRecord_i[0]);
            WindowManager.show(windowId + 1, windowY + 10 + 30, 20, 170, 80);
            WindowManager.drawPicture(windowId + 1, "/img/battlehud/Face_" + actor.actorId());
            windowId += 2;
            windowY += 250;
        };

    };

    //コンフィグ時に全般情報表示
    config_display = function () {
        var partyRecordText = `\\V[58]日目<\\V[55]> \\V[141]\n`;
        var partyInfoText = `\\C[16]Party Record\\C[0]\n`;
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

        var miscInfoText = `\\C[16][発動中の称号効果]\\C[0]\n`;
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
        $gameScreen.dWindowFrame = 'ON';
        $gameScreen.showPicture(partyInfoPictureId, "", 0, 810, 80, 100, 100, 255, 0);
        $gameMessage.setSelectPictureId(0, 101);
    };

    //会話時に実行
    talk_script = function () {

        var facePictureId = 86;
        if ($gameScreen.picture(facePictureId)) {
            var faceName = $gameScreen.picture(facePictureId).name();
            var faceName = faceName.replace("/img/talkface/", "")
            var actorIdCode = faceName.charAt(0);
            var secondChar = faceName.charAt(1);
            if (Number(secondChar)) {
                actorIdCode += String(secondChar);
            };
        } else {
            var actorIdCode = $gameVariables.value(20);
        };
        var picMoveParam = $gameMessage._IZSTPicMoveParam[1];
        if (Number(actorIdCode) == $gameVariables.value(20)) {
            var faceName = $gameVariables.value(20) + 'Actor_' + valueFaceSelect;
            pic_locationSet(91, 91, "/img/talkface/" + faceName, 1, 0);
            //$gameSwitches.setValue(436,true);
            //battle_bustUp(id1,$gameMessage._IZSTPicMoveParam[0]-640,picMoveParam-384,1);
            //$gameSwitches.setValue(436,false);
        } else {
            $gameSwitches.setValue(436, true);
            battle_bustUp(101, 100, picMoveParam - 384, 30);
            $gameSwitches.setValue(436, false);
        };

    };

    //変動する特徴設定
    trait_changeSetting = function (stateId) {

        if (stateId == 106) {//信仰バフ
            var stateData = $dataStates[stateId];
            stateData.traits = [];
            var traitRate = $gameVariables.value(631) / 100000;
            for (var i = 2; i <= 7; i++) {
                stateData.traits.push({ code: 21, dataId: i, value: 1 + traitRate });
            };
            if (stateData.meta['Help Description']) {
                if (stateData.meta['AddDWord']) {
                    var traitText = `${stateData.meta['AddDWord']}`;
                } else {
                    var traitText = ` `;
                };
                stateData.description = `\\sim[${stateId}]:${traitText}\n\\I[659]+${traitRate * 100}%`;
            };
        };
        if (stateId == 107) {//食事バフ,10まで
            var stateData = $dataStates[stateId];
            stateData.traits = [];
            var effectEntries = $gameVariables.value(620);
            var traitLineCount = 0;
            var descBuilder = ``;
            if (effectEntries.length >= 1) {
                for (var i = 0; i <= effectEntries.length - 1; i++) {
                    var effectValues = effectEntries[i];
                    var traitRate = Number(effectValues[2]);
                    var traitLineText = ``;
                    if (Number(effectValues[0]) == 0) {
                        traitLineText += TextManager.param(Number(effectValues[1]));
                        traitLineText += `\\C[10]${Number(effectValues[2]) * 100}%\\C[0]UP!`;
                    };
                    if (Number(effectValues[0]) == 1) {
                        traitLineText += FTKR.CSS.cssStatus.xparam[Number(effectValues[1])];
                        traitLineText += `\\C[10]${Number(effectValues[2]) * 100}%\\C[0]UP!`;
                    };
                    if (Number(effectValues[0]) == 2) {
                        traitLineText += FTKR.CSS.cssStatus.sparam[Number(effectValues[1])];
                        traitLineText += `\\C[10]${Number(effectValues[2]) * 100}%\\C[0]UP!`;
                    };
                    if (Number(effectValues[0]) == 3) {
                        traitLineText += `${$dataSystem.elements[Number(effectValues[1])]}威力`;
                        if (Number(effectValues[2]) >= 0) {
                            traitLineText += `\\C[10]${Number(effectValues[2])}%UP!\\C[0]`;
                        } else {
                            traitLineText += `\\C[1]${Number(effectValues[2])}%DOWN!\\C[0]`;
                        };
                    };
                    if (Number(effectValues[0]) == 4) {
                        traitLineText += `${$dataSystem.elements[Number(effectValues[1])]}`;
                        if ([10, 11, 12, 15, 20, 38, 39, 40, 41].some(function (elementId) { return elementId == Number(effectValues[1]) })) {
                            if (Number(effectValues[1]) == 11) {
                                var traitText = `10`;
                            } else {
                                var traitText = `100`;
                            };
                            if (traitRate >= 0) {
                                traitLineText += `\\C[10]${Number(effectValues[2]) * traitText}%\\C[0]UP!`;
                            } else {
                                traitLineText += `\\C[1]${Number(effectValues[2]) * traitText}%\\C[0]DOWN!`;
                            };
                        } else {
                            traitLineText += `耐性`;
                            if (Number(effectValues[1]) == 11) {
                                var traitText = `10`;
                            } else {
                                var traitText = `100`;
                            };
                            if (traitRate <= 0) {
                                var traitRate = traitRate - traitRate - traitRate;
                                traitLineText += `\\C[1]${Number(effectValues[2]) * traitText}%\\C[0]DOWN!`;
                            } else {
                                traitLineText += `\\C[10]${Number(effectValues[2]) * traitText}%\\C[0]UP!`;
                            };
                        };
                    };
                    if (Number(effectValues[0]) == 0) {
                        stateData.traits.push({ code: 21, dataId: Number(effectValues[1]), value: 1 + traitRate });
                    };
                    if (Number(effectValues[0]) == 1) {
                        stateData.traits.push({ code: 22, dataId: Number(effectValues[1]), value: traitRate });
                    };
                    if (Number(effectValues[0]) == 2) {
                        stateData.traits.push({ code: 23, dataId: Number(effectValues[1]), value: 1 + traitRate });
                    };
                    if (Number(effectValues[0]) == 3) { valueAttackAmplifysActorId[actor.actorId()][Number(effectValues[1])] += Number(effectValues[2]) };
                    if (Number(effectValues[0]) == 4) {
                        var traitRate = traitRate - traitRate - traitRate;
                        stateData.traits.push({ code: 11, dataId: Number(effectValues[1]), value: 1 + traitRate });
                    };
                    descBuilder += `[${traitLineText}] `;
                    traitLineCount += 1;
                    if ((traitLineCount % 5) == 0) {
                        descBuilder += `\n`;
                    };
                };
                const effectNote = `時間経過で解除。`;
                stateData.description = `\\sim[${stateId}]:${effectNote}\n${descBuilder}`;
            };
        };
        $gamePlayer.refresh();

    };

    //ミニステでインフォＹ軸補正値変更info_SetY($gameVariables.value(200));
    info_SetY = function (positionPresetId) {

        if (positionPresetId == 1) { valueInfoY = 0 }
        else if (positionPresetId == 2) { valueInfoY = -100 }
        else if (positionPresetId == 3) { valueInfoY = -100 }
        else if (positionPresetId == 4) { valueInfoY = -100 }
        else if (positionPresetId == 5) { valueInfoY = 0 };

    };

    //tipsを纏めて閲覧
    tips_select = function () {

        var basePictureId = 101;
        for (var i = 0; i <= $gameVariables.value(532).length - 1; i++) {
            var tipNames = $gameVariables.value(532);
            const id = 1;
            var tipName = tipNames[i];
            if (tipName.length >= 14) {
                var tipName = tipName.substring(0, 14);
            };
            const choiceParams = {
                text: `\\fs[20]${tipName}\\fs[28]`,
                value: i + 1
            };
            $gameSystem.addCustomChoice(id, choiceParams);
            if ($gameVariables.value(533)[i] != 0) {
                $gameScreen.setDTextPicture(`\\C[16]${tipNames[i]}\\C[0]:\n${$gameVariables.value(533)[i]}`, 28);
                $gameScreen.dWindowFrame = 'ON';
                $gameScreen.showPicture(i + basePictureId + 1, '', 0, 334, 10, 100, 100, 255, 0);
                $gameMessage.setSelectPictureId(i, i + basePictureId + 1);
            };
            if ($gameVariables.value(534)[i] && $gameVariables.value(534)[i][0] != 0) {
                //$gameScreen.showPicture(i + basePictureId,$gameVariables.value(534)[i][0],$gameVariables.value(534)[i][1],
                //$gameVariables.value(534)[i][2]+334-100-50,$gameVariables.value(534)[i][3],
                //$gameVariables.value(534)[i][4],$gameVariables.value(534)[i][5],$gameVariables.value(534)[i][6],0);
                $gameScreen.showPicture(i + basePictureId, $gameVariables.value(534)[i][0], 0, 334, 0, 100, 100, 255, 0);
                $gameMessage.setSelectPictureId(i, i + basePictureId);
            };
            basePictureId += 2;
        };

    };

    //ダンジョンから脱出スクリプト
    dungeon_escape = function () {

        if ($gameVariables.value(240) >= 1) {
            var escapePositionValues = $dataItems[$gameVariables.value(240)].meta['EscapeMapID'].split(',');
            $gameVariables.setValue(161, [Number(escapePositionValues[0]), Number(escapePositionValues[1]), Number(escapePositionValues[2])]);
            set_playerPosition2(161);
        } else {
            $gameVariables.setValue(161, [14, 26, 7]);
            set_playerPosition2(161);
        };

    };

    //街から外に出るスクリプト
    town_escape = function () {

        $gameVariables.setValue(520, Array(21).fill(0));
        for (var i = 0; i < $gameParty.members().length; i++) {
            if (isGirl($gameParty.members()[i])) {
                var escapeActorId = $gameParty.members()[i].actorId();
                if ($gameVariables.value(230) >= 1) {
                    if ($dataWeapons[$gameVariables.value(230)].meta['PermissionCloth']) {
                        if ($gameVariables.value(440 + escapeActorId)[41] == Number($dataWeapons[$gameVariables.value(230)].meta['PermissionCloth'])) {
                            if ($gameVariables.value(380 + escapeActorId)[5] > $gameVariables.value(380 + escapeActorId)[4]) {
                                $gameVariables.value(520)[escapeActorId] = Number($dataWeapons[$gameVariables.value(230)].meta['PermissionCloth']);
                            }
                        }
                    }
                }
            }
        };
        var escapeSourceVarId = 204;
        var escapeActorId = $gameVariables.value(escapeSourceVarId)[0];
        var escapeMapX = $gameVariables.value(escapeSourceVarId)[1];
        var escapeMapY = $gameVariables.value(escapeSourceVarId)[2];
        if (escapeActorId >= 1) {
            $gamePlayer.reserveTransfer(escapeActorId, escapeMapX, escapeMapY, 2, 2);
        } else {
            $gamePlayer.reserveTransfer(14, 2, 2, 2, 2);
        };

    };

    //指定衣装OKな町から出た後、次マップで露出超過なら通常衣装に戻すスクリプト。マップ最初イベントで実行
    town_startPermissionClothChange = function () {

        var transferMapId = 0;
        for (var i = 0; i < $gameVariables.value(520).length; i++) {
            if ($gameVariables.value(520)[i] >= 1) {
                if ($gameVariables.value(230) >= 1) {
                    if ($dataWeapons[$gameVariables.value(230)].meta['PermissionCloth']) {
                        if ($gameVariables.value(520)[i] == Number($dataWeapons[$gameVariables.value(230)].meta['PermissionCloth'])) {
                            var transferMapId = 1;
                            break;
                        }
                    }
                }
            }
        };
        if (transferMapId == 0) {
            for (var i = 0; i < $gameVariables.value(520).length; i++) {
                if ($gameVariables.value(520)[i] >= 1) {
                    var transferX = $gameVariables.value(520)[i];
                    $gameVariables.setValue(20, transferX);
                    var actor = $gameActors.actor($gameVariables.value(20));
                    if ($dataActors[$gameVariables.value(20)].meta['MainCloth']) {
                        $gameVariables.setValue(19, Number($dataActors[$gameVariables.value(20)].meta['MainCloth']));
                        kisekae_tyokusetusitei($gameVariables.value(19), 0);
                        var transferY = `${actor.name()}は\x1bIIN[${$gameVariables.value(19)}]に着替えた。`;
                        CommonPopupManager.showInfo({}, transferY, null);
                    };
                }
            }
        };
        $gameVariables.setValue(520, Array(21).fill(0));

    };

    //ダンジョンワプ機能スクリプト<warpShare:1>
    dungeon_warpscript = function (warpModeId) {

        if (warpModeId == 1) {
            $gameSwitches.setValue(380, false);
            if ($dataItems[$gameVariables.value(240)].meta['warpShare']) {
                for (var j = 1; j <= $dataWeapons.length - 1; j++) {
                    if ($dataItems[j].meta['warpShare']) {
                        if (Number($dataItems[j].meta['warpShare']) == Number($dataItems[$gameVariables.value(240)].meta['warpShare'])) {
                            if ($dataItems[j].meta['warpStart']) {
                                valueScriptArray1.push($dataItems[j].meta['warpStart'].split(','));
                            };
                            for (var i = 1; i <= 9; i++) {
                                if ($dataItems[j].meta['warpPoint' + i]) {
                                    if ($gameVariables.value(211)[j][i] == 1) {
                                        valueScriptArray1.push($dataItems[j].meta['warpPoint' + i].split(','));
                                        $gameSwitches.setValue(380, true);
                                    }
                                };
                            };
                        };
                    };
                };
            } else {
                if ($dataItems[$gameVariables.value(240)].meta['warpStart']) {
                    valueScriptArray1.push($dataItems[$gameVariables.value(240)].meta['warpStart'].split(','));
                };
                for (var i = 1; i <= 9; i++) {
                    if ($dataItems[$gameVariables.value(240)].meta['warpPoint' + i]) {
                        if ($gameVariables.value(211)[$gameVariables.value(240)][i] == 1) {
                            valueScriptArray1.push($dataItems[$gameVariables.value(240)].meta['warpPoint' + i].split(','));
                            $gameSwitches.setValue(380, true);
                        }
                    };
                };
            };
        };

    };

    function createRandomWordSegment(wordHeadCandidates, wordBodyCandidates, wordTailCandidates, shakeOffsetCandidates) {
        const wordHead = wordHeadCandidates[getRandomIndex(wordHeadCandidates.length)];
        const wordBody = wordBodyCandidates[getRandomIndex(wordBodyCandidates.length)];
        const fontSize = wordTailCandidates[getRandomIndex(wordTailCandidates.length)];
        let shakeOffset;

        if (wordBody == ` `) {
            shakeOffset = -getRandomIndex(11);
        } else if (wordBody == `\\C[27]♥\\C[0]` || wordBody == `\\C[27]♡\\C[0]`) {
            shakeOffset = getRandomIndex(6);
        } else {
            shakeOffset = shakeOffsetCandidates[getRandomIndex(shakeOffsetCandidates.length)];
            if (fontSize >= 40) {
                shakeOffset += Math.ceil(fontSize / 4);
            };
        }

        return `\x1bfs[${fontSize}]${wordHead}${wordBody}\\MX[${-shakeOffset}]`;
    }

    function appendRandomWordSegments(targetVarId, count, wordHeadCandidates, wordBodyCandidates, wordTailCandidates, shakeOffsetCandidates) {
        let generatedText = $gameVariables.value(targetVarId);
        for (let index = 0; index < count; index++) {
            generatedText += createRandomWordSegment(wordHeadCandidates, wordBodyCandidates, wordTailCandidates, shakeOffsetCandidates);
        }
        $gameVariables.setValue(targetVarId, generatedText);
    }

    //文字ランダム作成
    text_randumWord = function (targetVarId, actorIdCode, wordRepeatCount, wordHeadCandidates, wordBodyCandidates, wordTailCandidates, shakeOffsetCandidates) {

        $gameVariables.setValue(targetVarId, `\\AT[${actorIdCode}]`);
        //var wordPart1 = `${wordPart1}\\MY[0]`;
        appendRandomWordSegments(targetVarId, wordRepeatCount, wordHeadCandidates, wordBodyCandidates, wordTailCandidates, shakeOffsetCandidates);//
        if (wordRepeatCount >= 20) {
            $gameVariables.setValue(targetVarId, $gameVariables.value(targetVarId) + `\n`);
            appendRandomWordSegments(targetVarId, wordRepeatCount, wordHeadCandidates, wordBodyCandidates, wordTailCandidates, shakeOffsetCandidates);//
        };
        //Graphics.loadFont("GameFont","fonts/eromangasimaji.otf");

    };

    //２回目以降殲滅時にボーナス
    annihilationItem_bonus = function () {
        const chestId = Number($gameVariables.value(240));
        const chestMeta = $dataItems[chestId].meta;

        if (!chestMeta['TchestType']) return;

        const chestOptions = collectChestOptions(chestMeta);
        const selectedOption = selectRandomChestOption(chestOptions);

        if (!selectedOption) return;

        const itemData = getItemAndAwardToPlayer(selectedOption);

        // displayBonusMessage

        const item = `\\C[24]\x1bI[${itemData.iconIndex}]${itemData.name}\\C[0]`;
        valueWordSet1 = `全滅ボーナスとして${item}を入手した！`;

        checkForRareItemFlags(chestMeta, selectedOption.itemIndex);
    };

    // Collects all possible chest reward options from the chest metadata
    collectChestOptions = function (chestMeta) {
        const options = [];

        // Add standard chest items
        if (chestMeta['TchestType'] && chestMeta['Tchest']) {
            const types = chestMeta['TchestType'].split(',');
            const indices = chestMeta['Tchest'].split(',');

            for (let i = 0; i < types.length; i++) {
                options.push({
                    type: Number(types[i]),
                    itemIndex: Number(indices[i])
                });
            }
        }

        // Add first annihilation item if present
        if (chestMeta['firstAnnihilationItem']) {
            const [type, index] = chestMeta['firstAnnihilationItem'].split(',');
            options.push({
                type: Number(type),
                itemIndex: Number(index)
            });
        }

        // Add chest-only bonus item if present
        if (chestMeta['TchestOnly']) {
            const [, , , type, index] = chestMeta['TchestOnly'].split(',');
            options.push({
                type: Number(type),
                itemIndex: Number(index)
            });
        }

        return options;
    };

    // Selects a random option from the available chest options
    selectRandomChestOption = function (options) {
        if (options.length === 0) return null;
        return options[getRandomIndex(options.length)];
    };

    // Retrieves the item based on type and index, then gives it to the player
    getItemAndAwardToPlayer = function (option) {
        const itemArray = getItemEquipmentSource(option.type);
        const item = itemArray[option.itemIndex];

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
        if (chestMeta['TchestRere'] && selectedItemIndex == Number(chestMeta['TchestRere'])) {
            $gameSwitches.setValue(439, true);
            return;
        }
        // Check first annihilation rare item flag
        if (chestMeta['firstAnnihilationItem']) {
            const firstAnnihilationIndex = Number(chestMeta['firstAnnihilationItem'].split(',')[1]);
            if (selectedItemIndex == firstAnnihilationIndex) {
                $gameSwitches.setValue(439, true);
                return;
            }
        }

        // Check chest-only rare item flag
        if (chestMeta['TchestOnly']) {
            const chestOnlyIndex = Number(chestMeta['TchestOnly'].split(',')[4]);
            if (selectedItemIndex == chestOnlyIndex) {
                $gameSwitches.setValue(439, true);
                return;
            }
        }
    };

    //文字ピクチャを座標指定して表示しっぱなしpictureText_SetUp(1,100,`ジュク…っ\\I[12]`,28,640,384,180,'eromangasimaji')
    pictureText_SetUp = function (setupType, pictureId, displayText, textSetting, posX, posY, moveDuration, fontName) {

        if (setupType == 1) {
            curveFunctions.patternScaleX = curveFunctions.getPattern('jump', [100]);
            curveFunctions.patternScaleY = curveFunctions.getPattern('jump', [100]);
            if (fontName != 0) {
                $gameScreen.setDtextFont(fontName);
            };
            $gameScreen.dTextAlign = 0;
            $gameScreen.dWindowFrame = 'ON';
            $gameScreen.dTextRealTime = 'ON';
            $gameScreen.setDTextPicture(displayText, textSetting);
            $gameScreen.showPicture(pictureId, '', 1, posX, posY, 0, 0, 0, 0);
            $gameScreen.movePicture(pictureId, 1, posX, posY, 100, 100, 255, 0, moveDuration);
        } else {
            $gameScreen.setDtextFont('ＭＳ Ｐ明朝');
            picture_motion1("smooth", [0]);
            pic_eraseP(0, [pictureId]);
        };

    };

    //エネミーステートでドロップ
    //enemy_drop = function(user,enemy){
    //};

    learn_show_eval_is_notlearned_added_contains = function (user, skillId) {
        return !user.isLearnedSkill(skillId) && user.addedSkills().contains(skillId);
    };

    learn_show_eval_mastery_moreorequalof = function (user, skillId, minSkillMasteryLevel) {
        return user.skillMasteryLevel(skillId) >= minSkillMasteryLevel;
    };

    learn_show_eval_notmax_or_islearned = function (user, skillId) {
        return user.skillMasteryLevel(skillId) < Number($dataSkills[skillId].meta['Max Mastery Level'])
            && user.isLearnedSkill(skillId);
    };

    learn_show_eval_is_notlearned_max_addedcontains_reqskill = function (user, skillId, reqSkillId) {
        return !user.isLearnedSkill(skillId) &&
            user.skillMasteryLevel(skillId) >= Number($dataSkills[skillId].meta['Max Mastery Level']) &&
            user.addedSkills().contains(skillId) &&
            user.isLearnedSkill(reqSkillId);
    };

    triggerParallelEventIfQuestAndMapMatch0 = function (questProgress, mapId, event_pararelStarting_param2) {
        triggerParallelEventIfQuestAndMapMatch(questProgress, mapId, event_pararelStarting_param2, true, -1)
    };

    triggerParallelEventIfQuestAndMapMatch1 = function (questProgress, mapId, switchId, event_pararelStarting_param2) {
        triggerParallelEventIfQuestAndMapMatch(questProgress, mapId, event_pararelStarting_param2, false, switchId)
    }

    // Renamed from triggerParallelEventIfQuestAndMapMatch
    triggerParallelEventIfQuestAndMapMatch = function (questProgress, mapId, eventParallelParam, skipGuardCheck, switchId) {
        if ($gameVariables.value(135) != questProgress) return;
        if ($gameMap.mapId() != mapId) return;
        if (!skipGuardCheck && !$gameSwitches.value(switchId)) return; // Guard win condition check

        event_pararelStarting(0, eventParallelParam, 0);
        $gameSwitches.setValue(474, true);
    }

    scene_joukenNakami_clean_prefixes = function (text) {

        return text
            .replace("[daysReset]", "")
            .replace("[NoReset]", "")
            .replace("[夜自動]", "")
            .replace("[シーン達成]", "")
            .replace("[挿話達成]", "");
    }

    getItemEquipmentSource = function (id) {
        switch (Number(id)) {
            case 1:
                return $dataWeapons;
            case 2:
                return $dataArmors;
            default:
                return $dataItems;
        }
    }

    getItemsSourceSkillsItemsStates = function (id) {
        switch (Number(id)) {
            case 0:
                return $dataSkills;
            case 1:
                return $dataItems;
            case 2:
                return $dataStates;
            default:
                console.error(`getItemsSourceSkillsItemsStates: id(${id}) is not 0,1,2!`);
                return null;
        }
    }

    getRandomIndex = function (length) {
        return Math.floor(Math.random() * length);
    }

    getPreviousTachiePicId = function () {
        return $gameVariables.value(300);
    }

    isHEnemyOrNonAuto = function () {
        return $gameSwitches.value(370);
    }

    isGirl = function (gameActor) {
        return gameActor.isStateAffected(602);
    }

    // CommonEvents
    configureCommonEvents = function (start, end, switchIdOffset) {
        for (let i = start; i <= end; i++) {
            const cEv = $dataCommonEvents[i];
            cEv.trigger = 2;
            if ($dataItems[i].meta['AutoEvent']) cEv.trigger = 1;
            cEv.switchId = switchIdOffset + i;
        }
    }

    initializeVersionSettings = function () {
        //$gameSwitches.setValue(4,true)//体験版on
        $gameSwitches.setValue(4, false)//製品版on
        //$gameSwitches.setValue(53,true)//デバッグon
        //$gameSwitches.setValue(53,false)//デバッグoff
        $gameVariables.setValue(61, 'りしゃぶるVer1.49')
    }

    setNPCInfo = function (gameVarId, metaKey, substitutionCallback) {
        // Initialize the game variable array with 101 zeroes.
        $gameVariables.setValue(gameVarId, Array(101).fill(0));

        const npcDatas = $gameVariables.value(gameVarId);
        const dataWeapons = $dataWeapons;

        // Loop over the weapons indices 301–400.
        for (let i = 301; i <= 400; i++) {
            // Only process if the weapon has a non‐empty name.
            const weapon = dataWeapons[i];
            if (weapon.name !== '') {
                const meta = weapon.meta;
                // If there is a substitution actor id, use the provided callback.
                if (meta['SubstitutionActorId']) {
                    const actorId = Number(meta['SubstitutionActorId']);
                    npcDatas[i - 300] = substitutionCallback(actorId);
                }
                // If the override meta value exists, it takes precedence.
                if (meta[metaKey]) {
                    npcDatas[i - 300] = meta[metaKey];
                }
            }
        }
    }
    setNPCFamilyName = function () {
        setNPCInfo(354, 'FamilyName', function (actorId) { return $dataWeapons[actorId + 200].name; });
    }
    setNPCProfession = function () {
        setNPCInfo(353, 'Profession', function (actorId) { return $gameVariables.value(actorId + 380)[59]; });
    }
    setItemSGType2GlossaryText123 = function () {
        var start = 1;
        var end = $dataItems.length - 1;
        for (var i = start; i <= end; i++) {
            let itemMeta = $dataItems[i].meta['SG種別'];
            if (itemMeta && Number(itemMeta) === 2) {
                scene_Glossarytext1(i, 218);
                scene_Glossarytext2(i, 213);
                scene_Glossarytext3(i, 219);
            }
        };
    }

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
            for (let j = 0; j < partyMembersCount; j++) {
                const partyMember = partyMembers[j];
                if (partyMember.getStateCounter(i) != undefined) {
                    gameSwitches.setValue(160, true);
                    return;
                }
            }
        };

        gameSwitches.setValue(160, false);
    }

    isSceneGlossaryDisabledv2 = function () {
        const stateIds = $gameVariables.value(214);
        if (!stateIds || !stateIds.length) return;

        const gameSwitches = $gameSwitches;
        const gameParty = $gameParty;
        const partyMembers = gameParty.members();

        const partyMinIndex = partyMembers.length - 1;

        // Process in reverse order for potentially earlier exit
        for (let i = stateIds.length - 1; i >= 0; i--) {
            const stateId = stateIds[i];
            if (!gameParty.membersState(stateId)) continue;

            for (let j = partyMinIndex; j >= 0; j--) {
                const actor = partyMembers[j];

                if (actor.isStateAffected(stateId) && actor.getStateCounter(stateId) !== undefined) {
                    gameSwitches.setValue(160, true);
                    return;
                }
            }
        }

        // If we get here, no matches were found
        gameSwitches.setValue(160, false);
    }

    setupDateTime = function () {
        const timeget = new Date();
        const year = timeget.getFullYear();
        const month = timeget.getMonth() + 1;
        const day = timeget.getDate();//日(1-31)。getDay()は曜日(0-6)なので使わない
        const hour = timeget.getHours();
        const min = timeget.getMinutes();
        const sec = timeget.getSeconds();
        $gameVariables.setValue(67, year + '/' + month + '/' + day + ' T' + hour + ':' + min + ':' + sec);
    }

    showMapName = function () {
        const displayName = $gameMap.displayName();
        if (displayName) {
            let name;
            const id = $gameMap.mapId();
            if (valueMapNameSpecialStaging[id] == 0) {
                name = displayName;
            } else {
                name = valueMapNameSpecialStaging[id];
                $dataMap.displayName = name;
            };

            const num = $gameSwitches.value(201) ? 10 : 3;
            const infoMessage = `～～\\C[${num}]${name}\\C[0]～～`;
            CommonPopupManager.showInfo({}, infoMessage, null);
        };
    }

    evStateCleanFromActors = function (actorInitId, actorEndId, stateId) {
        for (let actorId = actorInitId; actorId <= actorEndId; actorId++) {
            const gameActor = $gameActors.actor(actorId);
            if (!gameActor) continue;
            gameActor.removeState(stateId);
        }
    };

    //#region cev 296
    ev296RemoveTempState = function (valueTachieChangeStateTemporary, parentList) {
        const stateIds = valueTachieChangeStateTemporary;
        const start = $gameVariables.value(75);
        const end = $gameVariables.value(76);
        const gameVariables = $gameVariables;
        const members = $gameParty.members();

        // Remove temporary states from all actors
        stateIds.forEach(stateId => {
            evStateCleanFromActors(start, end, stateId);
        });

        // Restore outfit settings for party members
        const actorIds = gameVariables.value(247);
        actorIds.forEach(id => {
            const actor = $gameActors.actor(id);

            if (!members.contains(actor)) return;

            // Restore outfit variables
            for (let i = 0; i <= 42; i++) {
                gameVariables.value(id + 440)[i] = gameVariables.value(id + 540)[i];
            }

            // Update character appearance
            gameVariables.setValue(20, id);
            tachie_settei2();
        });

        // Ensure standing picture common event is properly terminated
        parentList.setupChild($dataCommonEvents[19].list, 0);
    };
    //#endregion

    //#region cev23
    ev23StateReleaseOverTime = function (parent) {
        const start = $gameVariables.value(75);
        const end = $gameVariables.value(76);
        const gameVariables = $gameVariables;

        // Process each state that has the timeRemove flag
        for (let stateId = 1; stateId < $dataStates.length; stateId++) {
            const state = $dataStates[stateId];
            if (!state.meta['timeRemove']) continue;

            // If any party member has this state, log its removal
            if ($gameParty.membersState(stateId)) {
                parent.sVal(539, gameVariables.value(539) + `${state.name}が解除された。\n`);
                parent.sVal(540, gameVariables.value(540) + 1);
            }

            // Remove the state from all actors
            evStateCleanFromActors(start, end, stateId);
        }
    };

    ev23DecreaseTPby30 = function (parent) {
        const actorIds = $gameVariables.value(248);
        const gameVariables = $gameVariables;

        // Reduce TP for each party member
        actorIds.forEach(actorId => {
            $gameActors.actor(actorId).gainTp(-30);
        });

        // Log the TP reduction
        parent.sVal(539, gameVariables.value(539) + `パーティメンバーのTP-30\n`);
        parent.sVal(540, gameVariables.value(540) + 1);
    };
    //#endregion

    ev23MorningDayEveningNightSwitch = function (parent) {
        const wasNight = $gameSwitches.value(15);
        const wasDay = $gameSwitches.value(14);

        // First reset all time switches
        for (let i = 13; i <= 15; i++) {
            $gameSwitches.setValue(i, false);
        }

        // Determine the next time of day
        let nextTimeOfDay;
        if (wasNight) {
            nextTimeOfDay = 13; // Morning (after Night)
            parent.sVal(539, $gameVariables.value(539) + `夜になりました。\n`);
            parent.sVal(540, $gameVariables.value(540) + 1);
        } else if (wasDay) {
            nextTimeOfDay = 15; // Night (after Day)
            parent.sVal(539, $gameVariables.value(539) + `昼になりました。\n`);
            parent.sVal(540, $gameVariables.value(540) + 1);
        } else {
            nextTimeOfDay = 14; // Day (after Morning)
        }

        // Set the next time of day
        $gameSwitches.setValue(nextTimeOfDay, true);
    };

    ev23zsumaho = function () {
        WindowManager.show(1, 0, 100, 1024, (120 + $gameVariables.value(540) * 60));
    }

    ev23showElapsedMessage = function () {
        const dayNum = $gameVariables.value(58);
        const weekNum = $gameVariables.value(55);
        const dd = `日目`;
        const ww = `曜日`;
        const progress = `経過`;
        TickerManager.show(`──${dayNum}${dd}(${weekNum}${ww})${progress}──`);
    }

    resetChildEventAppearance = function () {
        const eventIds = $gameVariables.value(292);
        for (let eventId = 11; eventId <= 13; eventId++) {
            const childEventId = eventIds[eventId]; // this._eventId
            if ($gameMap.event(childEventId)) {
                const mapEvent = $gameMap.event(childEventId);
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
    }

    prepareDarknessTransition = function () {
        $gameMap.darknessOpacity = 200;
        const eventId = $gameVariables.value(292)[5]; // this._eventId
        if ($gameMap.event(eventId)) {
            const mapEvent = $gameMap.event(eventId);
            mapEvent.setStepAnime(true);
            mapEvent.setWalkAnime(true);
            mapEvent.setAngle(0);
            mapEvent._spriteOffsetX = 0;
            mapEvent._spriteOffsetY = 0;
            mapEvent._kageM = new Game_KageMaster(mapEvent);
            mapEvent.removeFace();
            mapEvent.setOpacity(0);
        }
    }

    updateDefaultPortraitOutsideBattle = function () {
        if (!$gameParty.inBattle()) {
            $gameVariables.setValue(20, $gameVariables.value(3));
            tachie_settei2();
        };
    }

    updateBattleGirlsPortrait = function () {
        const gamePartyBattleMembers = $gameParty.battleMembers();
        for (let i = 0, max = gamePartyBattleMembers.length - 1; i <= max; i++) {
            const actor = gamePartyBattleMembers[i];
            if (isGirl(actor)) {
                $gameVariables.setValue(20, actor.actorId());
                tachie_settei3(actor);
            }
        };
    }

    syncAndUpdateActorPortrait = function () {
        const gamePartyMembers = $gameParty.members();
        const gameVariables = $gameVariables;
        const gameActors = $gameActors;
        const actorIds = gameVariables.value(247);
        for (var i = 0, len = actorIds.length; i < len; i++) {
            const actorId = actorIds[i];
            const actor = gameActors.actor(actorId);
            if (gamePartyMembers.contains(actor)) {
                for (let i = 0; i <= 42; i++) {
                    gameVariables.value(actorId + 440)[i] = gameVariables.value(actorId + 540)[i];
                }
                gameVariables.setValue(20, actorId);
                tachie_settei3(actor);
            }
        }
    }

    clearTemporaryActorState = function (parent) {
        const actorIds = $gameVariables.value(248);
        actorIds.forEach(function (actorId) {
            $gameActors.actor(actorId).removeState(39);
            $gameVariables.value(380 + actorId)[58] = 0;
        }, parent);
    }

    updateNPCWeaponNamesFromVariables = function (parent) {
        const actorIds = $gameVariables.value(248);
        actorIds.forEach(function (actorId) {
            $dataWeapons[actorId + 200].name = $gameVariables.value(actorId + 380)[50];
        }, parent);
    }

    setNPCFamilyNames = function (parent) {
        setNPCInformation(
            parent,
            354,
            'FamilyName',
            function (actorId) { return $dataWeapons[actorId + 200].name; }
        );
    };

    //#region setNPCInformation
    setNPCProfessions = function (parent) {
        setNPCInformation(
            parent,
            353,
            'Profession',
            function (actorId) { return $gameVariables.value(actorId + 380)[59]; }
        );
    };

    /**
     * Sets NPC information based on substitution actor or direct metadata.
     * @param {*} parent - The parent object (for sVal method access)
     * @param {number} gameVarId - Target game variable ID to store data (353 for Profession, 354 for FamilyName)
     * @param {string} metaKey - The metadata key to look for ('Profession' or 'FamilyName')
     * @param {Function} substitutionCallback - Function that returns value for substitution actors
     */
    setNPCInformation = function (parent, gameVarId, metaKey, substitutionCallback) {
        // Initialize the array with 101 zeroes
        parent.sVal(gameVarId, Array(101).fill(0));

        // Process all NPC weapon entries (301-400)
        for (let weaponIndex = 301; weaponIndex <= 400; weaponIndex++) {
            const weapon = $dataWeapons[weaponIndex];
            if (weapon.name !== '') {
                // If there is a substitution actor id, use the provided callback
                if (weapon.meta['SubstitutionActorId']) {
                    const substitutionActorId = Number(weapon.meta['SubstitutionActorId']);
                    $gameVariables.value(gameVarId)[weaponIndex - 300] = substitutionCallback(substitutionActorId);
                }
                // If the metadata key exists, it takes precedence
                if (weapon.meta[metaKey]) {
                    $gameVariables.value(gameVarId)[weaponIndex - 300] = weapon.meta[metaKey];
                }
            }
        }
    };
    //#endregion

}());
