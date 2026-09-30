/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){

//武器防具の説明文に効果に応じた文章追加
various_description = function(id1){

Hentai380_ArrangementNameSet();

//value10文言 value11文言文頭 value12-14属性の付与/増加/減少 value15数字か文字列か value16ALL設定
//value17武器攻撃補正 value18スキル属性 value19説明文改変スキップ value20十種武器装備可能時

if(id1 == 1){valueItems = $dataWeapons};
if(id1 == 2){valueItems = $dataArmors};
if(id1 == 0){valueItems = $dataItems};
if(id1 == 3){valueItems = $dataSkills};
if(id1 == 4){valueItems = $dataStates};
if(id1 == 5){valueItems = $dataClasses};

var start = 1;
if(id1 == 2){
  var end = valueArmorsLength;
} else {
  var end = valueItems.length-1;
};

for (var i = start; i <= end; i++) {

var effectText = ``;
var headerText = ``;
var statUpCount = 0;
var skillElementText = ``;
var skipDescFlag = 0;//追加説明するかどうか
var tenWeaponCount = 0;//武器種計算
var damageCutRef = 0;//物理魔法ダメージカット。数値が同一かどうか
var damageCutCount = 0;//物理魔法ダメージカット
var damageCutIsFirst = 0;//物理魔法ダメージカット。１個めかどうか
var prevStateCode = 0;//スキル効果。同じ効果が連続で存在する時
var consecStateCount = 0;//スキル効果。同じ効果が連続で存在する時。カウント用
var colorCode = 2;//カラー設定。通常は２．変更時はその直後に２に戻す。
var calcTmp = 0;//計算用
var suffixText = ``;//説明文前段の後半部分に付記する文言
var tempDesc = ``;//説明文直前代入時に一時代入する
var descWordText = 0;//DescriptionWord用
var arr11 = [];
var arr12 = [];

if(valueItems[i].name == ''){
var skipDescFlag = 1;
};

if(id1 == 1 && valueItems[i].wtypeId == 0){
var skipDescFlag = 1;
};

if(skipDescFlag == 0){

if(id1 == 1 || id1 == 2){
  var headerText = `[\\C[${colorCode}]分類\\C[0]:${$dataSystem.equipTypes[valueItems[i].etypeId]}]`;
    if(id1 == 1 && valueItems[i].wtypeId >= 1){
      var weaponTypeName = $dataSystem.weaponTypes[valueItems[i].wtypeId];
      headerText += `[\\C[${colorCode}]種別\\C[0]:${weaponTypeName}]`
    };
    if(id1 == 2 && valueItems[i].atypeId >= 1){headerText += `[\\C[${colorCode}]種別\\C[0]:${$dataSystem.armorTypes[valueItems[i].atypeId]}]`};
if(id1 == 1 || id1 == 2){
  if(valueItems[i].meta['LotteryRearity']){
    headerText += `[\\I[517]:${Number(valueItems[i].meta['LotteryRearity'])}]`;
}};
};

if(id1 == 1 || id1 == 2 || id1 == 4 || id1 == 5){

  for (var id4 = 0; id4 <= 9; id4++) {//十種武器
    if(valueItems[i].traits[id4]){
      if(valueItems[i].traits[id4].code == 51){
        tenWeaponCount += 1;
  }}};
  if(tenWeaponCount >= 10){
    var fragText = `\\C[${colorCode}]武器種:\\C[0]十種武器`;
    effectText += `${fragText} `;
  };

  var valNum = 0;
  var calcTmp = 0;
  for (var id4 = 0; id4 <= 7; id4++) {//ステアップALLで纏める
    if(valueItems[i].traits[id4]){
      if(valueItems[i].traits[id4].code == 21){
        statUpCount += 1;
        if(valNum == valueItems[i].traits[id4].value){
          var valNum = valueItems[i].traits[id4].value;
          calcTmp += 1;
        };
  }}};
  if(statUpCount == 5 && valueItems[i].traits[4]){
           if(valueItems[i].traits[4].value >= 1){
              var fragText = `\\I[658]+`;
              var valNum = Math.round((valueItems[i].traits[4].value - 1) * 100);
            } else {
              var fragText = `\\I[674]-`;
              var valNum = Math.round((1 - valueItems[i].traits[4].value) * 100);
            };
            if(calcTmp >= 2){
              effectText += `${fragText} `;
            } else {
              effectText += `${fragText}${valNum}% `;
            };
  };
  if(statUpCount == 8){
           if(valueItems[i].traits[7].value >= 1){
              var fragText = `\\I[659]+`;
              var valNum = Math.round((valueItems[i].traits[7].value - 1) * 100);
            } else {
              var fragText = `\\I[675]-`;
              var valNum = Math.round((1 - valueItems[i].traits[7].value) * 100);
            };
            if(calcTmp >= 2){
              effectText += `${fragText} `;
            } else {
              effectText += `${fragText}${valNum}% `;
            };
  };

  for (var id4 = 0; id4 <= 1; id4++) {//物理魔法ダメージカット
    if(valueItems[i].traits[id4]){
      if(valueItems[i].traits[id4].code == 23){
        if(valueItems[i].traits[id4].dataId == 6 || valueItems[i].traits[id4].dataId == 7){
          if(damageCutIsFirst == 0){
          var damageCutRef = valueItems[i].traits[id4].value;
          };
            if(damageCutIsFirst == 0 || damageCutRef == valueItems[i].traits[id4].value){
              damageCutCount += 1;
            };
            damageCutIsFirst += 1;        
  }}}};

  if(damageCutCount == 2){
    if(valueItems[i].traits[1].value >= 1){
      var fragText = `\\I[654]\\I[655]-`;
      var valNum = Math.round((valueItems[i].traits[1].value - 1) * 100);
    } else {
      var fragText = `\\I[638]\\I[639]+`;
      var valNum = Math.round((1 - valueItems[i].traits[1].value) * 100);
    };
    effectText += `${fragText}${valNum}% `;
  };

  for (var id2 = 0; id2 <= 19; id2++) {
    if(valueItems[i].traits[id2]){
      if(valueItems[i].traits[id2].code == 31){
        for (var id3 = 1; id3 <= $dataSystem.elements.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            amygame_elementIcon(id3);
              var valNum = Math.round((valueItems[i].traits[id2].value - 1) * 100);
              if(valueElementIconArr[0] >= 1){
                var fragText = `${valueElementIconArr[1]}`;
              } else {
                var fragText = `\x1bI[${valueElementIconArr[1]}]`;
              };
              if(valueItems[i].meta['EnemyState']){}else{
                if([18,19,51,52,53,54,55,56,57,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,82,83].some(function(id){return id == id3})){
                  effectText += `\\C[${colorCode}]特攻属性付与\\C[0]${fragText} `;
                } else {
                  effectText += `\\C[${colorCode}]攻撃属性付与\\C[0]${fragText}\\C[${colorCode}] `;
                };
              };
      }}};

      if(valueItems[i].traits[id2].code == 11){
        for (var id3 = 1; id3 <= $dataSystem.elements.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            amygame_elementIcon(id3);
              if(valueElementIconArr[0] >= 1){
                var fragText = `${valueElementIconArr[1]}`;
              } else {
                if(valueItems[i].traits[id2].value >= 1){
                  var valNum = Math.round((valueItems[i].traits[id2].value - 1) * 100);
                  if(id3 == 11){var valNum = Math.round((valueItems[i].traits[id2].value - 1) * 10)};
                    if( [10,11,12,15,20,38,39,40,41].some(function(id){return id == id3}) ){
                      var fragText = `\x1bI[${valueElementIconArr[3]}]+`;
                    } else {
                      var fragText = `\x1bI[${valueElementIconArr[3]}]耐性-`;
                    };
                } else {
                  var valNum = Math.round((1 - valueItems[i].traits[id2].value) * 100);
                  if(id3 == 11){var valNum = Math.round((1 - valueItems[i].traits[id2].value) * 10)};
                    if( [10,11,12,15,20,38,39,40,41].some(function(id){return id == id3}) ){
                      var fragText = `\x1bI[${valueElementIconArr[3]}]-`;
                    } else {
                      var fragText = `\x1bI[${valueElementIconArr[3]}]耐性+`;
                    };
                };
              };
              if([35,37,38,41].some(function(id){return id == id3})){}else{
                if( [41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80].some(function(id){return id == id3}) ){
                  if(valueItems[i].meta['EnemyState']){}else{
                    effectText += `${fragText}${valNum}% `;
                  };
                } else {
                    effectText += `${fragText}${valNum}% `;
                };
              };
      }}};

      if(valueItems[i].traits[id2].code == 12){
        for (var id3 = 0; id3 <= 7; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            if(valueItems[i].traits[id2].value >= 1){
              var valNum = Math.round((valueItems[i].traits[id2].value - 1) * 100);
              var fragText = `\\C[1]耐性-\\C[0]\x1bI[${id3 + 48}]`;
            } else {
              var valNum = Math.round((1 - valueItems[i].traits[id2].value) * 100);
              var fragText = `\\C[${colorCode}]耐性+\\C[0]\x1bI[${id3 + 48}]`;
            };
              effectText += `${fragText}${valNum}% `;
      }}};

      if(valueItems[i].traits[id2].code == 13){
        for (var id3 = 1; id3 <= $dataStates.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            if(valueItems[i].traits[id2].value >= 1){
              var valNum = Math.round((valueItems[i].traits[id2].value - 1) * 100);
              if($dataStates[id3].iconIndex >= 1){
                var fragText = `\\C[1]耐性-\\C[0]\x1bI[${$dataStates[id3].iconIndex}]`;
              } else {
                var fragText = `\\C[1]耐性-\\C[0]${$dataStates[id3].name}`;
              };
            } else {
              var valNum = Math.round((1 - valueItems[i].traits[id2].value) * 100);
              if($dataStates[id3].iconIndex >= 1){
                var fragText = `\\C[${colorCode}]耐性+\\C[0]\x1bI[${$dataStates[id3].iconIndex}]`;
              } else {
                var fragText = `\\C[${colorCode}]耐性+\\C[0]${$dataStates[id3].name}`;
              };
            };
            effectText += `\\C[0]${fragText}${valNum}% `;
      }}};

      if(valueItems[i].traits[id2].code == 14){
        for (var id3 = 1; id3 <= $dataStates.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            if($dataStates[id3].iconIndex >= 1){
              var fragText = `\x1bI[${$dataStates[id3].iconIndex}]`;
            } else {
              var fragText = `${$dataStates[id3].name}`;
            };
              effectText += `\\C[${colorCode}]無効化\\C[0]${fragText} `;
      }}};

  if(id2 > statUpCount || statUpCount <= 4){
      if(valueItems[i].traits[id2].code == 21){
        for (var id3 = 0; id3 <= 7; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            if(valueItems[i].traits[id2].value >= 1){
              var fragText = `\x1bI[${id3 + 32}]+`;
              var valNum = Math.round((valueItems[i].traits[id2].value - 1) * 100);
            } else {
              var fragText = `\x1bI[${id3 + 48}]-`;
              var valNum = Math.round((1 - valueItems[i].traits[id2].value) * 100);
            };
              effectText += `${fragText}${valNum}% `;
      }}};
  };

      if(valueItems[i].traits[id2].code == 22){
        for (var id3 = 0; id3 <= 9; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            var iconIdxGrant = 16;var iconIdxUp = 16;var iconIdxDown = 16;
              if(id3 == 0){var iconIdxGrant = 630;var iconIdxUp = 630;var iconIdxDown = 646};
              if(id3 == 1){var iconIdxGrant = 632;var iconIdxUp = 632;var iconIdxDown = 648};
              if(id3 == 2){var iconIdxGrant = 631;var iconIdxUp = 631;var iconIdxDown = 647};
              if(id3 == 7){var iconIdxGrant = 640;var iconIdxUp = 640;var iconIdxDown = 643};
              if(id3 == 8){var iconIdxGrant = 641;var iconIdxUp = 641;var iconIdxDown = 644};
              if(id3 == 9){var iconIdxGrant = 642;var iconIdxUp = 642;var iconIdxDown = 645};
              if(valueItems[i].traits[id2].value >= 0.01){
                var fragText = `\x1bI[${iconIdxUp}]+`;
                var valNum = Math.round((valueItems[i].traits[id2].value) * 100);
              } else {
                var fragText = `\x1bI[${iconIdxDown}]`;
                var valNum = Math.round((valueItems[i].traits[id2].value) * 100);
              };
              effectText += `${fragText}${valNum}% `;
      }}};

  if(damageCutCount <= 1){
      if(valueItems[i].traits[id2].code == 23){
        for (var id3 = 0; id3 <= 9; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            var iconIdxGrant = 16;var iconIdxUp = 16;var iconIdxDown = 16;
              if(id3 == 0){var iconIdxGrant = 649;var iconIdxUp = 649;var iconIdxDown = 649};
              if(id3 == 6){var iconIdxGrant = 654;var iconIdxUp = 638;var iconIdxDown = 654};
              if(id3 == 7){var iconIdxGrant = 655;var iconIdxUp = 639;var iconIdxDown = 655};//ここまでマイナスがプラス効果
              if(id3 == 4){var iconIdxGrant = 634;var iconIdxUp = 634;var iconIdxDown = 650};
              if(id3 == 5){var iconIdxGrant = 635;var iconIdxUp = 635;var iconIdxDown = 651};
              if(id3 == 9){var iconIdxGrant = 656;var iconIdxUp = 656;var iconIdxDown = 672};
              if(valueItems[i].traits[id2].value >= 1){
                if(id3 == 6 || id3 == 7){
                  var fragText = `\x1bI[${iconIdxDown}]-`;
                } else {
                  var fragText = `\x1bI[${iconIdxUp}]+`;
                };
                var valNum = Math.round((valueItems[i].traits[id2].value - 1) * 100);
              } else {
                if(id3 == 6 || id3 == 7){
                  var fragText = `\x1bI[${iconIdxUp}]+`;
                } else {
                  var fragText = `\x1bI[${iconIdxDown}]-`;
                };
                var valNum = Math.round((1 - valueItems[i].traits[id2].value) * 100);
              };
              effectText += `${fragText}${valNum}% `;
      }}};
  };

      if(valueItems[i].traits[id2].code == 32){ //31は先頭で実行済み。
        for (var id3 = 1; id3 <= $dataStates.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
                var valNum = Math.round((valueItems[i].traits[id2].value) * 100);
               if(id3 >= 206 && id3 <= 217){
                 if(id3 == 206){var fragText = `\\I[322]`};
                 if(id3 == 207){var fragText = `\\I[323]`};
                 if(id3 == 208){var fragText = `\\I[324]`};
                 if(id3 == 209){var fragText = `\\I[325]`};
                 if(id3 == 210){var fragText = `\\I[326]`};
                 if(id3 == 211){var fragText = `\\I[327]`};
                 if(id3 == 212){var fragText = `\\I[338]`};
                 if(id3 == 213){var fragText = `\\I[339]`};
                 if(id3 == 214){var fragText = `\\I[340]`};
                 if(id3 == 215){var fragText = `\\I[341]`};
                 if(id3 == 216){var fragText = `\\I[342]`};
                 if(id3 == 217){var fragText = `\\I[343]`};
               } else {
                 if($dataStates[id3].iconIndex >= 1){
                   var fragText = `\x1bI[${$dataStates[id3].iconIndex}]`;
                 } else {
                   var fragText = `${$dataStates[id3].name}`;
                 };
               };
              effectText += `\\C[${colorCode}]ステート付与\\C[0]${fragText}${valNum}% `;
      }}};

      if(valueItems[i].traits[id2].code == 33){ 
          if(valueItems[i].traits[id2].dataId == 0){
                var valNum = Math.round((valueItems[i].traits[id2].value));
                var fragText = `\\C[${colorCode}]AttackSpeed+\\C[0]`;
                effectText += `${fragText}${valNum} `;
      }};

      if(valueItems[i].traits[id2].code == 41){ 
        for (var id3 = 1; id3 <= $dataSystem.skillTypes.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            var fragText = `<${$dataSystem.skillTypes[id3]}>`;
            effectText += `\\C[${colorCode}]使用可能\\C[0]${fragText} `;
      }}};

      if(valueItems[i].traits[id2].code == 42){ 
        for (var id3 = 1; id3 <= $dataSystem.skillTypes.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            var fragText = `<${$dataSystem.skillTypes[id3]}>`;
            effectText += `\\I[626]${fragText} `;
      }}};

      if(valueItems[i].traits[id2].code == 43){
        for (var id3 = 1; id3 <= $dataSkills.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            //var value9 = `<${$dataSkills[id3].name}>`;
            var fragText = `<\x1bSIN[${id3}]>`;
              if(id1 == 1 && $dataSkills[id3].stypeId == 12){
                effectText += `\\C[${colorCode}]Burst\\C[0]${fragText} `;
              } else {
                effectText += `\\C[${colorCode}]使用可能\\C[0]${fragText} `;
              };  
      }}};

      if(valueItems[i].traits[id2].code == 44){
        for (var id3 = 1; id3 <= $dataSkills.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            //var value9 = `<${$dataSkills[id3].name}>`;
            var fragText = `<\x1bSIN[${id3}]>`;
            effectText += `\\I[626]${fragText} `;
      }}};
  if(tenWeaponCount <= 9){
      if(valueItems[i].traits[id2].code == 51){
        for (var id3 = 1; id3 <= $dataSystem.weaponTypes.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            var fragText = `<${$dataSystem.weaponTypes[id3]}>`;
            effectText += `\\C[${colorCode}]武器種\\C[0]${fragText} `;
      }}};
  };

      if(valueItems[i].traits[id2].code == 52){
        for (var id3 = 1; id3 <= $dataSystem.armorTypes.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            if(id3 >= 2){
              var fragText = `<${$dataSystem.armorTypes[id3]}>`;
              effectText += `\\C[${colorCode}]防具種\\C[0]${fragText} `;
            };
      }}};

      if(valueItems[i].traits[id2].code == 53){
        for (var id3 = 1; id3 <= $dataSystem.equipTypes.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            var fragText = `<${$dataSystem.equipTypes[id3]}>`;
            effectText += `\\C[1]装備固定\\C[0]${fragText} `;
      }}};

      if(valueItems[i].traits[id2].code == 54){
        for (var id3 = 1; id3 <= $dataSystem.equipTypes.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            var fragText = `<${$dataSystem.equipTypes[id3]}>`;
            effectText += `\\C[1]装備封印\\C[0]${fragText} `;
      }}};

      if(valueItems[i].traits[id2].code == 61){ 
          if(valueItems[i].traits[id2].dataId == 0){
                var valNum = Math.round((valueItems[i].traits[id2].value) * 100);
                var fragText = `\\C[${colorCode}]行動回数追加\\C[0]`;
                effectText += `${fragText}${valNum}% `;
      }};

    };
  };

};//ここまで特徴コード。武器防具ステート。スキルはtraitsではなくeffectsなので下で実行

if(valueItems[i].meta['HSkillLearn']){
      var iconIdxGrant = 0;
      effectText += `[条件:`;
  for (var id3 = 1; id3 <= 3; id3++) {
    if(valueItems[i].meta['PremiseSkill' + id3]){
      var valNum = Number(valueItems[i].meta['PremiseSkill' + id3]);
      var fragText = `${$dataSkills[valNum].name}`;
      effectText += `\\C[27]<${fragText}>\\C[0]習得`;
      var iconIdxGrant = 1;
    };
    if(valueItems[i].meta['PremiseSkillRank' + id3]){
      var valNum = Number(valueItems[i].meta['PremiseSkillRank' + id3].split(',')[0]);
      var fragText = Number(valueItems[i].meta['PremiseSkillRank' + id3].split(',')[1]);
      effectText += `\\C[27]<${$dataSkills[valNum].name}>\\C[0]Rank:\\C[27]${fragText}\\C[0]到達`;
      var iconIdxGrant = 1;
    };
    if(valueItems[i].meta['PremiseVariable' + id3]){
      var valNum = Number(valueItems[i].meta['PremiseVariable' + id3].split(',')[0]);
      var valNum = `${$dataSystem.variables[valNum]}`;
      var valNum = valNum.replace("　", "");
      var valNum = valNum.replace("　", "");
      var valNum = valNum.replace("　", "");
      var valNum = valNum.replace(" ", "");
      var valNum = valNum.replace(":", "");
      var fragText = Number(valueItems[i].meta['PremiseVariable' + id3].split(',')[1]);
      effectText += `\\C[27]${valNum}\\C[0]:\\C[27]${fragText}\\C[0]以上`;
      var iconIdxGrant = 1;
    };
    if(valueItems[i].meta['PremiseArrangement' + id3]){
      var valNum = Number(valueItems[i].meta['PremiseArrangement' + id3].split(',')[0]);
      var fragText = Number(valueItems[i].meta['PremiseArrangement' + id3].split(',')[1]);
      effectText += `\\C[27]${valueHentaiArrangement[valNum]}\\C[0]:\\C[27]${fragText}\\C[0]以上`;
      var iconIdxGrant = 1;
    };
  };
    if(iconIdxGrant == 0){
      var fragText = `なし`;
      effectText += `\\C[27]${fragText}\\C[0]`;
    };
      effectText += `]`;
};

if(valueItems[i].meta['DescriptionWord']){
  var fragText = `${valueItems[i].meta['DescriptionWord']}`;
    if(id1 == 3 && valueItems[i].stypeId == 15){
      var descWordText = `\\C[27][${fragText}]\\C[0] `;
    } else {
      var descWordText = `\\C[${colorCode}][${fragText}]\\C[0] `;
    };
};//一言が必要なもののみ

if(valueItems[i].meta['GunDamage']){
var valNum = valueItems[i].meta['GunDamage'];
effectText += `[固定値:${valNum}] `;
};//銃武器の固定値

if(id1 == 3 || id1 == 0){

  //if(valueItems[i].meta['PassiveCondi'] || valueItems[i].meta['PassivePlusTrait'] || valueItems[i].meta['PassivePlusEffect']){
  //  var value9 = `\\I[661]`;
  //  value11 += `${value9}`;
  //};//戦闘中のみ発動→中止

    if( [9,10,15].some(function(id){return id == valueItems[i].stypeId}) ){
    if(valueItems[i].meta['Unequippable']){
      var fragText = `<自動>`;
      if(valueItems[i].stypeId == 15){var colorCode = 27};
      headerText += `\\C[${colorCode}]${fragText}\\C[0]`;
      var colorCode = 2;
    };
  };
  if(valueItems[i].meta['Skill Tier']){
      var valNum = valueItems[i].meta['Skill Tier'].replace(' ','');
      valNum = Number(valNum);
      if(valNum >= 1){valNum = `\x1bI[${Yanfly.Icon.ESTier[valNum]}]${Yanfly.Param.ESTierName[valNum]}>`};
      var fragText = `<装着:${valNum}`;
      if(valueItems[i].stypeId == 15){var colorCode = 27};
      headerText += `\\C[${colorCode}]${fragText}\\C[0] `;
      var colorCode = 2;
  };
if(id1 == 3){
  if( [1,4,5,6,7,8,11,12,14].some(function(id){return id == valueItems[i].stypeId}) ){
    if(valueItems[i].occasion){
      if(!valueItems[i].meta['BattleMapInformation']){
        if(valueItems[i].occasion == 0){var fragText = `\\I[661]\\I[660]`};
        if(valueItems[i].occasion == 1){var fragText = `\\I[661]`};
        if(valueItems[i].occasion == 2){var fragText = `\\I[660]`};
        if(valueItems[i].occasion == 3){var fragText = `\\I[16]`};
        headerText += `\\C[${colorCode}]${fragText}\\C[0]`;
      };
    } else {
      var fragText = `\\I[661]\\I[660]`;
      headerText += `\\C[${colorCode}]${fragText}\\C[0]`;
    }; 
  };
};
if(id1 == 0){
  if(valueItems[i].occasion){
    if(!valueItems[i].meta['BattleMapInformation']){
      if(valueItems[i].occasion == 0){var fragText = `\\I[661]\\I[660]`};
      if(valueItems[i].occasion == 1){var fragText = `\\I[661]`};
      if(valueItems[i].occasion == 2){var fragText = `\\I[660]`};
      if(valueItems[i].occasion == 3){var fragText = `\\I[16]`};
      headerText += `\\C[${colorCode}]${fragText}\\C[0]`;
    };
  } else {
    var fragText = `\\I[661]\\I[660]`;
    headerText += `\\C[${colorCode}]${fragText}\\C[0]`;
  };
};
  if(valueItems[i].meta['SaveShare']){
    headerText += `\\I[15]`;
  };

  if(valueItems[i].meta['MCharacterLearn']){
    headerText += `\\I[14]`;
  };

if(id1 == 3){
  if( [4,5,6,7,8].some(function(id){return id == valueItems[i].stypeId}) ){
    if(!valueItems[i].meta['Instant']){
      var colorCode = 13;
      headerText += `\\C[${colorCode}]<${'ターン行動'}>\\C[0] `;
      var colorCode = 2;
    };
  };
};
  if(valueItems[i].scope >= 1){
    if( [1,2,4,5,6,7,8,11,12,14].some(function(id){return id == valueItems[i].stypeId}) ){
      if(valueItems[i].scope == 1){var fragText = `敵単体`};
      if(valueItems[i].scope == 2){var fragText = `敵全体`};
      if(valueItems[i].scope == 3){var fragText = `敵R1`};
      if(valueItems[i].scope == 4){var fragText = `敵R2`};
      if(valueItems[i].scope == 5){var fragText = `敵R3`};
      if(valueItems[i].scope == 6){var fragText = `敵R4`};
      if(valueItems[i].scope == 7){var fragText = `味方単体`};
      if(valueItems[i].scope == 8){var fragText = `味方全体`};
      if(valueItems[i].scope == 9){var fragText = `戦闘不能単体`};
      if(valueItems[i].scope == 10){var fragText = `戦闘不能全体`};
      if(valueItems[i].scope == 11){var fragText = `使用者`};
      var colorCode = 14;
      headerText += `\\C[${colorCode}]<${fragText}>\\C[0] `;
      var colorCode = 2;
    };
  };

  if(valueItems[i].meta['Multiple Elements']){
    var arr1 = valueItems[i].meta['Multiple Elements'].split(',');
      for (var id3 = 0; id3 <= arr1.length-1; id3++) {
            amygame_elementIcon(arr1[id3]);
              if(valueElementIconArr[0] >= 1){
                var fragText = `${valueElementIconArr[1]}`;
              } else {
                var fragText = `\x1bI[${valueElementIconArr[1]}]`;
              };
        skillElementText += `\\C[${colorCode}]${fragText}\\C[0]`;
    };
    headerText += `[属性:${skillElementText}] `;
  };

if(valueItems[i].meta['Custom Cooldown Mastery Formula'] || valueItems[i].meta['Custom MP Cost Mastery Formula']  || valueItems[i].meta['Mastery Effect']){
  //var value9 = `RankUpで`;
  //value11 += `[${value9}]`;
};
if(valueItems[i].meta['Select Conditions']){
  headerText += `[\\C[${colorCode}]対象前衛のみ\\C[0]] `;
};
if(valueItems[i].meta['SkillLearningClass']){
  var valNum = `${$dataSystem.skillTypes[valueItems[i].stypeId]}`;
  var fragText = Number(valueItems[i].meta['SkillLearningClass']);
  if(fragText != 100){
    effectText += `[\\C[${colorCode}]${valNum}\\C[0]] [\\C[${colorCode}]\x1bJ[${fragText}]\\C[0]習得] `;
  };
};
if(valueItems[i].meta['Limit Uses']){
  var fragText = Number(valueItems[i].meta['Limit Uses']);
  if(valueItems[i].meta['Not Recover All Uses']){//<After Battle Uses Recover: 0>もセット
    headerText += `[\\C[${colorCode}]1日${fragText}回\\C[0]] `;
  } else {
    headerText += `[\\C[${colorCode}]戦闘中${fragText}回\\C[0]] `;
  };
};
if(id1 == 0){
  if(valueItems[i].consumable){
    //value10 += `[\\C[${value26}]消耗品\\C[0]] `;
  };
};
if(id1 == 0){
  if(valueItems[i].meta['SeiyokuItem']){
    var colorCode = 27;
    effectText += `[\\C[${colorCode}]性欲品\\C[0]] `;
  };
};
var colorCode = 2;
if(valueItems[i].meta['DamageFormula2']){
  var arr1 = valueItems[i].meta['DamageFormula2'].split(',');
    if(arr1[0] == 1){var fragText = `[\\C[${colorCode}]\\I[34]100%\\C[0]`};
    if(arr1[0] == 2){var fragText = `[\\C[${colorCode}]\\I[36]100%\\C[0]`};
    if(arr1[0] == 3){var fragText = `[\\C[${colorCode}]\\I[37]100%\\C[0]`};
    if(arr1[0] == 4){var fragText = `[\\C[${colorCode}]\\I[39]100%\\C[0]`};
    if(arr1[0] == 5){var fragText = `[\\C[${colorCode}]\\I[35]100%\\C[0]`};
    if(arr1[0] == 6){var fragText = `[\\C[${colorCode}]\\I[37]50%\\I[38]50%\\C[0]`};
    if(arr1[0] == 7){var fragText = `[\\C[${colorCode}]\\I[34]50%\\I[37]50%\\C[0]`};
    if(arr1[0] == 8){var fragText = `[\\C[3]回復:\\I[36]100%(対象の\\I[36]も影響)\\C[0]`};
    if(arr1[0] == 9){var fragText = `[\\C[3]回復:\\I[34]100%(対象の\\I[35]も影響)\\C[0]`};
    if(arr1[0] == 10){var fragText = `[\\C[${colorCode}]現在HPの${arr1[1]}%消費して×${arr1[2]}倍の与ダメ\\C[0]`};
    if(arr1[0] == 11){var fragText = `[\\C[${colorCode}]\\I[34]70%\\I[37]20%\\I[38]10%\\C[0]`};
    if(arr1[0] == 12){var fragText = `[\\C[${colorCode}]\\I[34]20%\\I[37]40%\\I[38]40%\\C[0]`};
    if(arr1[0] == 13){var fragText = `[\\C[${colorCode}]\\I[34]60%\\I[37]40%\\C[0]`};
    if(arr1[0] == 14){var fragText = `[\\C[${colorCode}]\\I[36]100%\\C[0]`};
    if(arr1[0] == 15){var fragText = `[\\C[${colorCode}]\\I[34]40%\\I[37]30%\\I[38]30%\\C[0]`};
    if(arr1[0] == 16){var fragText = `[\\C[${colorCode}]\\I[34]80%\\I[37]20%\\C[0]`};
    if(arr1[0] == 17){var fragText = `[\\C[${colorCode}]\\I[34]100%\\C[0]`};
    if(arr1[0] == 18){var fragText = `[\\C[${colorCode}]\\I[37]50%+固定値\\C[0]`};
    if(arr1[0] == 19){var fragText = `[\\C[${colorCode}]\\I[34]20%\\I[37]80%\\C[0]`};
    if(arr1[0] == 20){var fragText = `[\\C[${colorCode}]\\I[36]50%\\I[37]50%\\C[0]`};
    if(arr1[0] == 24){var fragText = `[\\C[${colorCode}]\\I[37]50%\\I[39]50%\\C[0]`};
    if(arr1[0] == 25){var fragText = `[\\C[${colorCode}]\\I[37]50%\\C[0]`};
    if(arr1[0] == 28){var fragText = `[\\C[${colorCode}]\\I[34]100%\\C[0]`};
    if(arr1[0] == 29){var fragText = `[\\C[${colorCode}]\\I[34]80%\\I[37]10%\\I[38]10%\\C[0]`};
    if(arr1[0] == 30){var fragText = `[\\C[${colorCode}]\\I[34]70%\\I[37]10%\\I[38]20%\\C[0]`};
    if(arr1[2] >= 0){fragText += ` \\C[${colorCode}]×${arr1[2]}\\C[0]] `};
    if(arr1[1] >= 1){fragText += `\\I[666]:${arr1[1]}`};
    if(id1 == 3){
      if(valueItems[i].stypeId == 12){
        if(valueItems[i].meta['ユニーク']){//武器を特定できないため無効状態
          fragText += `+強化段階`;
        } else {
          fragText += `+装備レア度`;
        };
      };
    };
  suffixText += `${fragText} `;//元文章の後に追記される。
  if(valueItems[i].meta['LevelFluctuation']){
    suffixText += `[${valueItems[i].meta['LevelFluctuation']}ﾚﾍﾞﾙ毎に威力+]`;
  };
};

if(valueItems[i].damage.type >= 1){
  if(valueItems[i].meta['PotionUsePoint']){
    if(valueItems[i].damage.type == 3){var fragText = 'HP'};//HP回復
    if(valueItems[i].damage.type == 4){var fragText = 'MP'};//MP回復
      if(Number(valueItems[i].meta['PotionUsePoint']) >= 2){
        var valNum = Number(valueItems[i].meta['PotionUsePoint']);
      } else {
        var valNum = `全`;
      };
      effectText += `[\\C[${colorCode}]${fragText}\\C[3]${valNum}\\C[0]回復]`;
  };
};
if(valueItems[i].meta['SkillStateAddRemove']){
  var fragText = Number(valueItems[i].meta['SkillStateAddRemove']);
  effectText += `[\\C[${colorCode}]\x1bSIM[${fragText}]\\C[0]付与/解除]`;//
};
if(valueItems[i].meta['PotionResist']){
  var fragText = Number(valueItems[i].meta['PotionResist']);
  effectText += `[\\I[624]+${fragText}%]`;
};
if(valueItems[i].speed != 0){
  var fragText = valueItems[i].speed;
  effectText += `\\C[${colorCode}]Speed\\C[0]:${fragText} `;
};
if(valueItems[i].meta['Repeat']){
  var fragText = Number(valueItems[i].meta['Repeat']);
  effectText += `\\I[668]:${fragText} `;
};
if(valueItems[i].meta['Warmup']){
  var fragText = Number(valueItems[i].meta['Warmup']);
  effectText += `\\I[662]:${fragText} `;
};
if(valueItems[i].meta['Cooldown']){
  var fragText = Number(valueItems[i].meta['Cooldown']);
  effectText += `\\I[663]:${fragText} `;
};
if(valueItems[i].meta['RankUpPoint']){
  var fragText = Number(valueItems[i].meta['RankUpPoint']);
  if(valueItems[i].meta['Max Mastery Level']){
    if(Number(valueItems[i].meta['Max Mastery Level']) == 1){
      effectText += `\\I[664]:${fragText} `;
    } else {
      effectText += `\\I[664]:${fragText}*Rank `;
    };
  };
};
//if(valueItems[i].meta['Max Mastery Level']){
//  value10 += `\\I[664]:Rank*Exp `;
//};//冗長なので使用しない。
if(valueItems[i].meta['Max Mastery Level']){
  var fragText = Number(valueItems[i].meta['Max Mastery Level']);
  effectText += `\\I[665]:${fragText} `;
};
if(valueItems[i].tpGain != 0){
  var fragText = valueItems[i].tpGain;
  effectText += `\\C[${colorCode}]TP\\C[0]:${fragText}\\C[10]↑\\C[0] `;
};

var arr11 = [0,`[\\C[${colorCode}]使用者に`,`[\\C[${colorCode}]味方全体に`,`[\\C[${colorCode}]対象敵に`,`[\\C[${colorCode}]敵全体に`];
var arr12 = [0,0,0,0,0];
var list = [1,2,3,4,5,6,7,8,9];
list.forEach(function(id3) {
  if(valueItems[i].meta['additionalSet' + id3]){
    var arr1 = valueItems[i].meta['additionalSet' + id3].split(',');
    if(Number(arr1[0]) == 1){arr12[1] += 1};
    if(Number(arr1[0]) == 2){arr12[2] += 1};
    if(Number(arr1[0]) == 3){arr12[3] += 1};
    if(Number(arr1[0]) == 4){arr12[4] += 1};
    if(Number(arr1[1]) == 1){
        if(Number(arr1[3]) >= 206 && Number(arr1[3]) <= 217){
        if(Number(arr1[3]) == 206){var fragText = `\\I[322]`};
        if(Number(arr1[3]) == 207){var fragText = `\\I[323]`};
        if(Number(arr1[3]) == 208){var fragText = `\\I[324]`};
        if(Number(arr1[3]) == 209){var fragText = `\\I[325]`};
        if(Number(arr1[3]) == 210){var fragText = `\\I[326]`};
        if(Number(arr1[3]) == 211){var fragText = `\\I[327]`};
        if(Number(arr1[3]) == 212){var fragText = `\\I[338]`};
        if(Number(arr1[3]) == 213){var fragText = `\\I[339]`};
        if(Number(arr1[3]) == 214){var fragText = `\\I[340]`};
        if(Number(arr1[3]) == 215){var fragText = `\\I[341]`};
        if(Number(arr1[3]) == 216){var fragText = `\\I[342]`};
        if(Number(arr1[3]) == 217){var fragText = `\\I[343]`};
      } else {
        var fragText = `\x1bSIM[${Number(arr1[3])}]`;
      };
      if(Number(arr1[3]) == 201){var fragText = `\\I[658]`};
      if(Number(arr1[3]) == 293){fragText += `*10`};//バフリミット+も数
      if(Number(arr1[3]) == 294){fragText += `*20`};
      if(Number(arr1[3]) == 295){fragText += `*30`};
      if(Number(arr1[2]) >= 2){
        for (var id4 = 2; id4 <= Number(arr1[2]); id4++) {
          fragText += `+`;
        };
      };
    if(Number(arr1[0]) == 1){arr11[1] += `${fragText}`};
    if(Number(arr1[0]) == 2){arr11[2] += `${fragText}`};
    if(Number(arr1[0]) == 3){arr11[3] += `${fragText}`};
    if(Number(arr1[0]) == 4){arr11[4] += `${fragText}`};
    };
  };
}, this);
if( Number(arr12[1]) >= 1 ){effectText += `${arr11[1]}付与\\C[0]] `};
if( Number(arr12[2]) >= 1 ){effectText += `${arr11[2]}付与\\C[0]] `};
if( Number(arr12[3]) >= 1 ){effectText += `${arr11[3]}付与\\C[0]] `};
if( Number(arr12[4]) >= 1 ){effectText += `${arr11[4]}付与\\C[0]] `};

  for (var id2 = 0; id2 <= 19; id2++) {
    if(valueItems[i].effects[id2]){

      if(valueItems[i].effects[id2].code == 11){
        if(valueItems[i].effects[id2].dataId == 0){
          var valNum = Math.round((valueItems[i].effects[id2].value1)*100);
            if(valNum != 0){
              var fragText = `\\I[627]:${valNum}%`;
                if(valNum >= 1){
                  effectText += `[\\C[3]${fragText}\\C[0]]`;
                } else {
                  effectText += `[\\C[4]${fragText}\\C[0]]`;             
                };
            };
        };
        if(valueItems[i].effects[id2].dataId == 0){
          var valNum = (valueItems[i].effects[id2].value2);
            if(valNum != 0){
              var fragText = `\\I[627]:${valNum}`;
                if(valNum >= 1){
                  effectText += `[\\C[3]${fragText}\\C[0]]`;
                } else {
                  effectText += `[\\C[4]${fragText}\\C[0]]`;             
                };
            };
        };
      };

      if(valueItems[i].effects[id2].code == 12){
        if(valueItems[i].effects[id2].dataId == 0){
          var valNum = Math.round((valueItems[i].effects[id2].value1)*100);
            if(valNum != 0){
              var fragText = `\\I[628]:${valNum}%`;
                if(valNum >= 1){
                  effectText += `[\\C[3]${fragText}\\C[0]]`;
                } else {
                  effectText += `[\\C[4]${fragText}\\C[0]]`;             
                };
            };
        };
        if(valueItems[i].effects[id2].dataId == 0){
          var valNum = (valueItems[i].effects[id2].value2);
            if(valNum != 0){
              var fragText = `\\I[628]:${valNum}`;
                if(valNum >= 1){
                  effectText += `[\\C[3]${fragText}\\C[0]]`;
                } else {
                  effectText += `[\\C[4]${fragText}\\C[0]]`;             
                };
            };
        };
      };

      if(valueItems[i].effects[id2].code == 13){//TPはvalue2（固定値）なし。%表記ではないので*100処理も不要
        if(valueItems[i].effects[id2].dataId == 0){
          var valNum = Math.round((valueItems[i].effects[id2].value1)*1);
            if(valNum != 0){
              var fragText = `\\I[629]:${valNum}%`;
                if(valNum >= 1){
                  effectText += `[\\C[3]${fragText}up\\C[0]]`;
                } else {
                  effectText += `[\\C[4]${fragText}down\\C[0]]`;             
                };
            };
        };
      };

      if(valueItems[i].effects[id2].code == 21){
        for (var id3 = 1; id3 <= $dataStates.length-1; id3++) {
          if(valueItems[i].effects[id2].dataId == id3){
            var valNum = Math.round((valueItems[i].effects[id2].value1) * 100);
               if(id3 >= 206 && id3 <= 217){
                 if(id3 == 206){var fragText = `\\I[322]`};
                 if(id3 == 207){var fragText = `\\I[323]`};
                 if(id3 == 208){var fragText = `\\I[324]`};
                 if(id3 == 209){var fragText = `\\I[325]`};
                 if(id3 == 210){var fragText = `\\I[326]`};
                 if(id3 == 211){var fragText = `\\I[327]`};
                 if(id3 == 212){var fragText = `\\I[338]`};
                 if(id3 == 213){var fragText = `\\I[339]`};
                 if(id3 == 214){var fragText = `\\I[340]`};
                 if(id3 == 215){var fragText = `\\I[341]`};
                 if(id3 == 216){var fragText = `\\I[342]`};
                 if(id3 == 217){var fragText = `\\I[343]`};
              } else {
              if($dataStates[id3].iconIndex >= 1){
                var fragText = `\x1bI[${$dataStates[id3].iconIndex}]`;
              } else {
                var fragText = `${$dataStates[id3].name}`;
              };
              };
              if(id3 != prevStateCode){
                var prevStateCode = 0;
                var consecStateCount = 0;
              };
              if(prevStateCode == id3){
                consecStateCount += 1; 
              } else {
                var prevStateCode = id3 
              };
              if($dataStates[id3].autoRemovalTiming >= 1){
                var calcTmp = ` ${$dataStates[id3].minTurns}`;
                  if($dataStates[id3].minTurns != $dataStates[id3].maxTurns){
                    calcTmp += `～${$dataStates[id3].maxTurns}t`;
                  } else {
                    calcTmp += `t`;
                  };
              } else {
                var calcTmp = ``;
              };
              if(id3 >= 206 && id3 <= 217){
                var calcTmp = ``;
              };
              if(consecStateCount >= 1){
                  effectText += `\\C[${colorCode}]+\\C[0]`;         
              } else {
                if(valNum == 100){
                  effectText += `[\\C[${colorCode}]付与:\\C[0]${fragText}${calcTmp}]`;
                } else {
                  effectText += `[\\C[${colorCode}]付与:\\C[0]${fragText}${valNum}%${calcTmp}]`;
                };
              };
       }}};

      if(valueItems[i].effects[id2].code == 22){
        for (var id3 = 1; id3 <= $dataStates.length-1; id3++) {
          if(valueItems[i].effects[id2].dataId == id3){
            var valNum = Math.round((valueItems[i].effects[id2].value1) * 100);
              if($dataStates[id3].iconIndex >= 1){
                var fragText = `\x1bI[${$dataStates[id3].iconIndex}]`;
                } else {
                var fragText = `${$dataStates[id3].name}`;
                };
              if(valNum == 100){
                effectText += `[\\C[3]解除:\\C[0]${fragText}]`;
              } else {
                effectText += `[\\C[3]解除:\\C[0]${fragText}${valNum}%]`;
              };
       }}};

  }};

};//スキルのみの処理終わり

if(valueItems[i].meta['dispelCount']){
  var fragText = Number(valueItems[i].meta['dispelCount']);
  effectText += `[\\C[${colorCode}]強化状態\\C[3]${fragText}つ\\C[${colorCode}]消去\\C[0]]`;
};
if(valueItems[i].meta['abNomalClearCount']){
  var fragText = Number(valueItems[i].meta['abNomalClearCount']);
  if(valueItems[i].meta['StateabNomalOnly']){
    effectText += `[\\C[${colorCode}]\\I[683]\\C[3]${fragText}つ\\C[${colorCode}]回復\\C[0]]`;
  } else {
    effectText += `[\\C[${colorCode}]\\I[683]\\I[684]\\C[3]${fragText}つ\\C[${colorCode}]回復\\C[0]]`;
  };
};
if(valueItems[i].meta['abNomalClearCountPlus']){
  effectText += `[\\C[${colorCode}]状態異常回復数+(Magic/300)\\C[0]]`;
};
if(valueItems[i].meta['dispelCountPlus']){
  effectText += `[\\C[${colorCode}]強化解除数+(Magic/300)\\C[0]]`;
};

if(valueItems[i].meta['Passive State'] && !valueItems[i].meta['パッシブ隠蔽']){
  if($dataStates[Number(valueItems[i].meta['Passive State'])] && $dataStates[Number(valueItems[i].meta['Passive State'])].meta['SpcialState']){
    effectText += `\\C[${colorCode}]特殊効果付与\\C[0]<\x1bSIM[${Number(valueItems[i].meta['Passive State'])}]> `;
  } else {
    effectText += `\\C[${colorCode}]付与\\C[0]<\x1bSIM[${Number(valueItems[i].meta['Passive State'])}]> `;
  };
};//パッシブステート

for (var id3 = 1; id3 <= $dataSystem.elements.length-1; id3++) {
  if(valueItems[i].meta['Element Amplify ' + id3]){
            amygame_elementIcon(id3);
              var valNum = valueItems[i].meta['Element Amplify ' + id3].replace(' ','');
              if(valueElementIconArr[0] >= 1){
                var fragText = `${valueElementIconArr[1]}威力`;
              } else {
                var fragText = `\x1bI[${valueElementIconArr[2]}]威力`;
              };
            effectText += `${fragText}${valNum} `;
}};//属性威力加算

if(valueItems[i].meta['PassiveElementP']){//<Max Mastery Level: 5>
  var arr1 = valueItems[i].meta['PassiveElementP'].split(',');
  amygame_elementIcon(Number(arr1[0]));
  if(valueElementIconArr[0] >= 1){
    var fragText = `${valueElementIconArr[1]}威力`;
  } else {
    var fragText = `\x1bI[${valueElementIconArr[2]}]威力`;
  };
  //var value9 = `${$dataSystem.elements[Number(arr1[0])]}威力:`;
  if(Number(arr1[1]) >= 1){
    var colorCode = 10;
  } else {
    var colorCode = 1;
  };
  if(valueItems[i].meta['Max Mastery Level']){
    effectText += `\\C[${colorCode}]<${fragText}Rank*${Number(arr1[1])}%\\C[0]>`;
  } else {
    effectText += `\\C[${colorCode}]<${fragText}${Number(arr1[1])}%\\C[0]>`;
  };
  var colorCode = 2;
};
if(valueItems[i].meta['SpecialAttack']){
  var valNum = Number(valueItems[i].meta['SpecialAttack']);
  var fragText = `<\x1bSIN[${valNum}]>`;
  effectText += `\\C[${colorCode}]Attack\\C[0]${fragText} `;
};
if(valueItems[i].meta['AddPowerWeapon']){
  var valNum = valueItems[i].meta['AddPowerWeapon'];
  effectText += `\\I[666]+${valNum} `;
};//スキルのパワーに加算
if(valueItems[i].meta['Critical Multiplier']){
  var valNum = valueItems[i].meta['Critical Multiplier'].replace(' ','');
  effectText += `\\I[78]威力${valNum} `;
};//会心威力
if(valueItems[i].meta['Counter Skills']){
  var valNum = valueItems[i].meta['Counter Skills'];
  effectText += `\\C[16]反撃スキル:\x1bSIN[${valNum}]\\C[0] `;
};
if(valueItems[i].meta['Counter Total']){
  var valNum = valueItems[i].meta['Counter Total'];
  var valNum = valNum.replace(" +", "");
  effectText += `\\C[16][最大反撃回数:${Number(valNum)+1}回]\\C[0] `;
};
if(valueItems[i].meta['CertainlyDouble']){
  effectText += `\\C[16][必ず2連撃以上]\\C[0] `;
};
if(valueItems[i].meta['CertainlyTriple']){
  effectText += `\\C[16][必ず3連撃]\\C[0] `;
};
if(valueItems[i].meta['NormalAttackHit']){
  var valNum = valueItems[i].meta['NormalAttackHit'];
  effectText += `\\C[16][通常攻撃Hit数+${valNum}]\\C[0] `;
};
if(valueItems[i].meta['AttackAbilityHit']){
  var valNum = valueItems[i].meta['AttackAbilityHit'];
  effectText += `\\C[16][通常/アビリティ攻撃Hit数+${valNum}]\\C[0] `;
};
if(valueItems[i].meta['BattleAddAttackSet']){
  var valNum = valueItems[i].meta['BattleAddAttackSet'];
  effectText += `\\C[16][追撃${valNum}%]\\C[0] `;
};
if(valueItems[i].meta['Evade Counter']){
  effectText += `\\C[16][回避後に反撃]\\C[0] `;
};
if(valueItems[i].meta['Hit Counter']){
  effectText += `\\C[16][攻撃受後に反撃]\\C[0] `;
};
if(valueItems[i].meta['MaxTp']){
  var valNum = valueItems[i].meta['MaxTp'];
  effectText += `\\C[16]MaxTp\\C[0]+${valNum} `;
};
if(valueItems[i].meta['elementRegist6']){
  var valNum = valueItems[i].meta['elementRegist6'];
  if(valNum == 0){
    effectText += `\\C[${colorCode}]六属性完全耐性\\C[0] `;
  } else {
    effectText += `\\C[${colorCode}]六属性耐性\\C[0]${valNum}% `;
  };
};
if(valueItems[i].meta['elementRegist9']){
  var valNum = valueItems[i].meta['elementRegist9'];
  if(valNum == 0){
    effectText += `\\C[${colorCode}]九属性完全耐性\\C[0] `;
  } else {
    effectText += `\\C[${colorCode}]九属性耐性\\C[0]${valNum}% `;
  };
};
if(valueItems[i].meta['StateabNomalResist']){
  var valNum = valueItems[i].meta['StateabNomalResist'];
  if(valNum == 0){
    effectText += `\\C[${colorCode}]\\I[683]無効\\C[0] `;
  } else {
    effectText += `\\C[${colorCode}]\\I[683]耐性\\C[0]+${valNum}% `;
  };
};
if(valueItems[i].meta['StateSPabNomalResist']){
  var valNum = valueItems[i].meta['StateSPabNomalResist'];
  if(valNum == 0){
    effectText += `\\C[${colorCode}]\\I[684]無効\\C[0] `;
  } else {
    effectText += `\\C[${colorCode}]\\I[684]耐性\\C[0]+${valNum}% `;
  };
};
if(valueItems[i].meta['DispelGuard']){
  effectText += `\\C[${colorCode}]強化消去無効\\C[0] `;
};
if(valueItems[i].meta['Level Up Recover All']){
    effectText += `[\\C[16]LvUp時に全回復\\C[0]]`;
};
if(valueItems[i].meta['Bypass Damage Cap']){
  effectText += `\\C[16]D.Cap無効\\C[0] `;
} else {
  if(valueItems[i].meta['Damage Cap']){
    var valNum = valueItems[i].meta['Damage Cap'].replace(' ','');
    effectText += `\\C[16]D.Cap:\\C[0]${valNum} `;
  };
};
if(valueItems[i].meta['Bypass Heal Cap']){
  effectText += `\\C[16]H.Cap無効\\C[0] `;
} else {
  if(valueItems[i].meta['Heal Cap']){
    var valNum = valueItems[i].meta['Heal Cap'].replace(' ','');
    effectText += `\\C[16]H.Cap:\\C[0]${valNum} `;
  };
};
if(valueItems[i].meta['HP Cost']){
  var valNum = valueItems[i].meta['HP Cost'].replace(' ','');
  effectText += `[\\C[16]HP${valNum}消費\\C[0]]`;
};
if(valueItems[i].meta['MP Cost']){
  var valNum = valueItems[i].meta['MP Cost'].replace(' ','');
  effectText += `[\\C[16]MP${valNum}消費\\C[0]]`;
};
if(valueItems[i].meta['SpcialState']){
  suffixText += `[\\C[${colorCode}]\x1bSIM[110]で発動\\C[0]][\x1bSIM[109]で効果消失]`;
  effectText += `[\\C[${colorCode}]行動時MP消費/消費MP未満で\\I[252]付与\\C[0]]`;
};
if(valueItems[i].meta['activateRate']){
  var valNum = Math.round(valueItems[i].meta['activateRate'] * 100);
  suffixText += `[消費MP:MMP\\C[10]${valNum}%\\C[0]]`;
};
if(valueItems[i].meta['activatePoint']){//使ってない？
  var valNum = valueItems[i].meta['activatePoint'];
  suffixText += `[消費MP:\\C[2]${valNum}\\C[0]]`;
};
if(valueItems[i].meta['Global Cooldown']){
  var valNum = Number(valueItems[i].meta['Global Cooldown']);
  suffixText += `[全てのCT:\\C[2]${valNum}\\C[0]]`;
};
for (var id3 = 1; id3 <= 15; id3++) {
  var calcTmp = `SType ${id3} Cooldown`;
  if(valueItems[i].meta[calcTmp]){
    if(Number(valueItems[i].meta[calcTmp]) < 0){
      var colorCode = 3;
    } else {
      var colorCode = 1;
    };
    var fragText = `${$dataSystem.skillTypes[id3]}\\C[${colorCode}]\\I[663]${Number(valueItems[i].meta[calcTmp])}`;
    effectText += `[${fragText}\\C[0]]`;
  };
  var calcTmp = `SType ${id3} Warmup`;
  if(valueItems[i].meta[calcTmp]){
    if(Number(valueItems[i].meta[calcTmp]) < 0){
      var colorCode = 3;
    } else {
      var colorCode = 1;
    };
    var fragText = `${$dataSystem.skillTypes[id3]}\\C[${colorCode}]\\I[662]${Number(valueItems[i].meta[calcTmp])}`;
    effectText += `[${fragText}\\C[0]]`;
  };
};
var colorCode = 2;
if(valueItems[i].meta['HP Life Steal Physical'] && valueItems[i].meta['HP Life Steal Magical']){
  var valNum = valueItems[i].meta['HP Life Steal Physical'].replace(' ','');
  var valNum = valNum.replace('%','');
  if(Number(valNum) >= 1){
    var colorCode = 2;
    effectText += `[\\C[${colorCode}]物理/魔法与Dの${Number(valNum)}%HP吸収回復\\C[0]]`;
  } else {
    var colorCode = 10;
    effectText += `[\\C[${colorCode}]物理/魔法与Dの${Number(valNum)}%HP反動ﾀﾞﾒｰｼﾞ\\C[0]]`;
  };
} else {
  if(valueItems[i].meta['HP Life Steal Physical']){
    var valNum = valueItems[i].meta['HP Life Steal Physical'].replace(' ','');
    var valNum = valNum.replace('%','');
    if(Number(valNum) >= 1){
      var colorCode = 2;
      effectText += `[\\C[${colorCode}]物理与Dの${Number(valNum)}%HP吸収回復\\C[0]]`;
    } else {
      var colorCode = 10;
      effectText += `[\\C[${colorCode}]物理与Dの${Number(valNum)}%HP反動ﾀﾞﾒｰｼﾞ\\C[0]]`;
    };
  };
  if(valueItems[i].meta['HP Life Steal Magical']){
    var valNum = valueItems[i].meta['HP Life Steal Magical'].replace(' ','');
    var valNum = valNum.replace('%','');
    if(Number(valNum) >= 1){
      var colorCode = 2;
      effectText += `[\\C[${colorCode}]魔法与Dの${Number(valNum)}%HP吸収回復\\C[0]]`;
    } else {
      var colorCode = 10;
      effectText += `[\\C[${colorCode}]魔法与Dの${Number(valNum)}%HP反動ﾀﾞﾒｰｼﾞ\\C[0]]`;
    };
  };
};
var colorCode = 2;
if(valueItems[i].meta['MP Life Steal Physical'] && valueItems[i].meta['MP Life Steal Magical']){
  var valNum = valueItems[i].meta['MP Life Steal Physical'].replace(' ','');
  var valNum = valNum.replace('%','');
  if(Number(valNum) >= 1){
    var colorCode = 2;
    effectText += `[\\C[${colorCode}]物理/魔法与Dの${Number(valNum)}%MP吸収回復\\C[0]]`;
  } else {
    var colorCode = 10;
    effectText += `[\\C[${colorCode}]物理/魔法与Dの${Number(valNum)}%MP消耗\\C[0]]`;
  };
} else {
  if(valueItems[i].meta['MP Life Steal Physical']){
    var valNum = valueItems[i].meta['MP Life Steal Physical'].replace(' ','');
    var valNum = valNum.replace('%','');
    if(Number(valNum) >= 1){
      var colorCode = 2;
      effectText += `[\\C[${colorCode}]物理与Dの${Number(valNum)}%MP吸収回復\\C[0]]`;
    } else {
      var colorCode = 10;
      effectText += `[\\C[${colorCode}]物理与Dの${Number(valNum)}%MP消耗\\C[0]]`;
    };
  };
  if(valueItems[i].meta['MP Life Steal Magical']){
    var valNum = valueItems[i].meta['MP Life Steal Magical'].replace(' ','');
    var valNum = valNum.replace('%','');
    if(Number(valNum) >= 1){
      var colorCode = 2;
      effectText += `[\\C[${colorCode}]魔法与Dの${Number(valNum)}%MP吸収回復\\C[0]]`;
    } else {
      var colorCode = 10;
      effectText += `[\\C[${colorCode}]魔法与Dの${Number(valNum)}%MP消耗\\C[0]]`;
    };
  };
};
var colorCode = 2;
if(valueItems[i].meta['HP Life Steal']){
  var valNum = valueItems[i].meta['HP Life Steal'].replace(' ','');
  var valNum = valNum.replace('%','');
  effectText += `[\\C[${colorCode}]与Dの${Number(valNum)}%HP吸収回復\\C[0]]`;
};
if(valueItems[i].meta['MP Life Steal']){
  var valNum = valueItems[i].meta['MP Life Steal'].replace(' ','');
  var valNum = valNum.replace('%','');
  effectText += `[\\C[${colorCode}]与Dの${Number(valNum)}%HP吸収回復\\C[0]]`;
};
if(valueItems[i].meta['RankMaxLearning']){
  if(valueItems[i].stypeId != 11){//召喚は前提スキルがあるため除外
    if(Number(valueItems[i].meta['Max Mastery Level']) >= 2){
      effectText += `[\\C[${colorCode}]RankMaxで習得が可能になる\\C[0]]`;
    } else {
      effectText += `[\\C[${colorCode}]熟練度Maxで習得が可能になる\\C[0]]`;
    };
  };
};
if(valueItems[i].meta['trapEvasion']){
  effectText += `[\\C[${colorCode}]引っ掛かったトラップを自動で回避する\\C[0]]`;
};
if(valueItems[i].meta['SemenRemove']){
  var colorCode = 27;
  var valNum = Number(valueItems[i].meta['SemenRemove']);
  effectText += `[\\C[${colorCode}]状態異常精液${valNum}つ回復\\C[0]]`;
};
if(valueItems[i].meta['HstaSuppression']){
  var colorCode = 27;
  var arr1 = valueItems[i].meta['HstaSuppression'].split(',');
  var valNum = Number(arr1[1]);
  if(Number(arr1[0]) == 0){
    effectText += `[\\C[${colorCode}]性欲度${valNum*100}まで\\C[0]][\\C[${colorCode}]各開発/経験度${valNum}まで\\C[0]]`;
  } else {
    effectText += `[\\C[${colorCode}]${$dataSystem.variables[Number(arr1[0])]}のランク${valNum}まで\\C[0]]`;
  };
};
var colorCode = 2;
if(valueItems[i].meta['TPGain1']){
  var valNum = valueItems[i].meta['TPGain1'];
  effectText += `[\\C[${colorCode}]TP${valNum}%\\C[0]]`;
};
if(valueItems[i].meta['gainExp']){
  var valNum = valueItems[i].meta['gainExp'];
  effectText += `[\\C[${colorCode}]獲得Exp:${valNum}%\\C[0]]`;
};
for (var id3 = 1; id3 <= 6; id3++) {
  if(valueItems[i].meta['Skill Tier ' + id3 + ' Slots']){
    var valNum = valueItems[i].meta['Skill Tier ' + id3 + ' Slots'].replace(' ','');
    var colorCode = 16;
    if(id3 == 1){var fragText = `Ability装着数`};
    if(id3 == 2){var fragText = `Main装着数`};
    if(id3 == 3){var fragText = `Job装着数`};
    if(id3 == 4){var fragText = `G-Passive装着数`};
    if(id3 == 5){var fragText = `Passive装着数`};
    if(id3 == 6){var fragText = `H-Passive装着数`};
    effectText += `[\\C[${colorCode}]${fragText}\\C[2]${valNum}\\C[0]]`;
  };
};
var colorCode = 2;

//称号関係
if(valueItems[i].meta['titleGetSwitch']){
  var valNum = Number(valueItems[i].meta['titleGetSwitch']);
  if(valNum == 2 || valueItems[i].meta['DescriptionWord']){}else{
    effectText += `\\C[${colorCode}][条件:${$dataSystem.switches[valNum]}]\\C[0]`;
  };
};
if(valueItems[i].meta['titleGetVariable']){
  var arr1 = valueItems[i].meta['titleGetVariable'].split(',');
  if(valueItems[i].meta['DescriptionWord']){}else{
    effectText += `\\C[${colorCode}][条件:${$dataSystem.variables[Number(arr1[0])]}:${Number(arr1[1])}]\\C[0]`;
  };
};
if(valueItems[i].meta['titleGetArray']){
  var arr1 = valueItems[i].meta['titleGetArray'].split(',');
  if(valueItems[i].meta['DescriptionWord']){}else{
    if(Number(arr1[0]) == 52){
      effectText += `\\C[${colorCode}][条件:\x1bSIM[${Number(arr1[1])}]:${Number(arr1[2])}体討伐]\\C[0]`;
    };
  };
};
if(valueItems[i].meta['titleGetItems']){
  var arr1 = valueItems[i].meta['titleGetItems'].split(',');
  if(valueItems[i].meta['DescriptionWord']){}else{
    effectText += `\\C[${colorCode}][条件:\x1bIIN[${Number(arr1[0])}]:${Number(arr1[1])}個]\\C[0]`;
  };
};
if(valueItems[i].meta['titleGetSkillRank']){
  var arr1 = valueItems[i].meta['titleGetSkillRank'].split(',');
  effectText += `\\C[${colorCode}][条件:パーティの誰かが\x1bSIN[${Number(arr1[0])}]Rank:${Number(arr1[1])}以上]\\C[0]`;
};
if(valueItems[i].meta['titleGetAchievement']){
  var arr1 = valueItems[i].meta['titleGetAchievement'].split(',');
  if(valueItems[i].meta['DescriptionWord']){}else{
    if(Number(arr1[0]) == 1){var valNum = `TotalKill`};
    if(Number(arr1[0]) == 2){var valNum = `MaxAssalt`};
    if(Number(arr1[0]) == 3){var valNum = `TotalAssalt`};
    if(Number(arr1[0]) == 4){var valNum = `TotalOverKill`};
    if(Number(arr1[0]) == 5){var valNum = `MaxDamage`};
    if(Number(arr1[0]) == 6){var valNum = `TotalDamage`};
    if(Number(arr1[0]) == 7){var valNum = `Defead`};
    if(Number(arr1[0]) == 8){var valNum = `AttackCount`};
    if(Number(arr1[0]) == 9){var valNum = `S-AbilityCount`};
    if(Number(arr1[0]) == 10){var valNum = `A-AbilityCount`};
    if(Number(arr1[0]) == 11){var valNum = `W-AbilityCount`};
    if(Number(arr1[0]) == 12){var valNum = `R-AbilityCount`};
    if(Number(arr1[0]) == 13){var valNum = `BurstCount`};
    if(Number(arr1[0]) == 14){var valNum = `ChainCount`};
    if(Number(arr1[0]) == 15){var valNum = `TotalDefead`};
    if(Number(arr1[0]) == 16){var valNum = `CriticalCount`};
    if(valueItems[i].meta['KojinTitle']){valNum += `[個人]`};
    effectText += `\\C[${colorCode}][条件:${valNum}:${Number(arr1[1])}]\\C[0]`;
  };
};
if(valueItems[i].meta['HtitleGetArray']){
  var arr1 = valueItems[i].meta['HtitleGetArray'].split(',');
  if(valueItems[i].meta['DescriptionWord']){}else{
    effectText += `\\C[${colorCode}][条件:${$dataSystem.variables[Number(arr1[0]) + 400]}:${Number(arr1[1])}]\\C[0]`;
  };
};
if(valueItems[i].meta['annihilationTitle']){
  var arr1 = valueItems[i].meta['annihilationTitle'].split(',');
  if(Number(arr1[0]) >= 20 && $dataItems[Number(arr1[0])]){
    var valNum = `\\C[1]<${$dataItems[Number(arr1[0])].name}>\\C[0]殲滅回数:\\C[10]${Number(arr1[1])}\\C[0]回以上`;
  };
  if(Number(arr1[0]) == 1){
    var valNum = `\\C[1]<全マップ>\\C[0]の総殲滅回数:\\C[10]${Number(arr1[0])}\\C[0]回以上`;
  };
  if(Number(arr1[0]) == 2){
    var valNum = `\\C[1]<全ダンジョン>\\C[0]の総殲滅回数:\\C[10]${Number(arr1[0])}\\C[0]回以上`;
  };
    effectText += `\\C[${colorCode}][条件:${valNum}\\C[${colorCode}]]\\C[0]`;
};
if(valueItems[i].meta['PassivePlusTrait']){
  var arr1 = valueItems[i].meta['PassivePlusTrait'].split(',');
  if(Number(arr1[0]) == 11){
    var valNum = Number(arr1[2]);
    if(valNum >= 0){
      effectText += `[\\C[${colorCode}]${$dataSystem.elements[Number(arr1[1])]}\\C[0]ダメージ耐性${Math.round(valNum * 100)}%Down]`;
    } else {
      var valNum = valNum - valNum - valNum;
      effectText += `[\\C[${colorCode}]${$dataSystem.elements[Number(arr1[1])]}\\C[0]ダメージ耐性${Math.round(valNum * 100)}%Up]`;
    };
  };
};
if(valueItems[i].meta['PassivePlusEffect']){//PassiveCondi
  var arr1 = valueItems[i].meta['PassivePlusEffect'].split(',');
  if(Number(arr1[0]) == 0){
    var valNum = TextManager.param(Number(arr1[1]));
  };
  if(Number(arr1[0]) == 1){
    var valNum = FTKR.CSS.cssStatus.xparam[Number(arr1[1])];
  };
  if(Number(arr1[0]) == 2){
    var valNum = FTKR.CSS.cssStatus.sparam[Number(arr1[1])];
  };   
  effectText += `[\\C[${colorCode}]${valNum}\\C[0]+${Math.round(Number(arr1[2]) * 100)}%]`;
};
//称号効果
if(valueItems[i].meta['titleEffectConfiVal']){
  var arr1 = valueItems[i].meta['titleEffectConfiVal'].split(',');
  if(valueItems[i].meta['DescriptionWord']){}else{
    effectText += `[\\C[${colorCode}]${$dataSystem.variables[Number(arr1[0])]}:+${Number(arr1[1])}\\C[0]]`;
  };
};
if(valueItems[i].meta['titleEffectConfiSwi']){
  var valNum = Number(valueItems[i].meta['titleEffectConfiSwi']);
  effectText += `[\\C[${colorCode}]${$dataSystem.switches[valNum]}\\C[0]]`;
};

if(valueItems[i].meta['titleSenkaGet']){
  var valNum = Number(valueItems[i].meta['titleSenkaGet']);
  effectText += `[\\C[${colorCode}]\x1bIIN[10]+${valNum}\\C[0]]`;
};
for (var id3 = 1; id3 <= 9; id3++) {
if(valueItems[i].meta['titleEffect'+id3]){
  var arr1 = valueItems[i].meta['titleEffect'+id3].split(',');
  if(Number(arr1[0]) == 0){
    var valNum = TextManager.param(Number(arr1[1]));
  };
  if(Number(arr1[0]) == 1){
    var valNum = FTKR.CSS.cssStatus.xparam[Number(arr1[1])];
  };
  if(Number(arr1[0]) == 2){
    var valNum = FTKR.CSS.cssStatus.sparam[Number(arr1[1])];
  };
  if(Number(arr1[0]) == 3){
    var valNum = `${$dataSystem.elements[Number(arr1[1])]}`;
    if([18,19,51,52,53,54,55,56,57,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80].some(function(id){return id == Number(arr1[1])})){
      valNum += `特攻`;
    };
    valNum += `威力`;
  };
  if(Number(arr1[0])==4){
    effectText += `${$dataSystem.elements[Number(arr1[1])]}`;
    if([10,11,12,15,20,38,39,40,41].some(function(id1){return id1 == Number(arr1[1])})){
    }else{
      var valNum = `耐性`;
    };
  };
    if(Number(arr1[2]) < 0){
      var calcTmp = Number(arr1[2]) - Number(arr1[2]) - Number(arr1[2]);
    } else {
      var calcTmp = Number(arr1[2]);
    };
    var fragText = `\\C[2]${calcTmp * 100}\\C[0]%`;
    var colorCode = 1;
    effectText += `[\\C[${colorCode}]${valNum}\\C[0]+${fragText}]`;
    var colorCode = 2;
};
};
//食事バフ
for (var id3 = 1; id3 <= 9; id3++) {
if(valueItems[i].meta['eatEffect'+id3]){
  var arr1 = valueItems[i].meta['eatEffect'+id3].split(',');
  if(Number(arr1[0]) == 0){
    var valNum = TextManager.param(Number(arr1[1]));
  };
  if(Number(arr1[0]) == 1){
    var valNum = FTKR.CSS.cssStatus.xparam[Number(arr1[1])];
  };
  if(Number(arr1[0]) == 2){
    var valNum = FTKR.CSS.cssStatus.sparam[Number(arr1[1])];
  };
  if(Number(arr1[0]) == 3){
    var valNum = `${$dataSystem.elements[Number(arr1[1])]}`;
    if([18,19,51,52,53,54,55,56,57,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80].some(function(id){return id == Number(arr1[1])})){
      valNum += `特攻`;
    };
    valNum += `威力`;
  };
  if(Number(arr1[0])==4){
    effectText += `${$dataSystem.elements[Number(arr1[1])]}`;
    if([10,11,12,15,20,38,39,40,41].some(function(id1){return id1 == Number(arr1[1])})){
    }else{
      var valNum = `耐性`;
    };
  };
  if(Number(arr1[2]) < 0){
    var calcTmp = Number(arr1[2]) - Number(arr1[2]) - Number(arr1[2]);
  } else {
    var calcTmp = Number(arr1[2]);
  };
  var fragText = `\\C[2]${calcTmp * 100}\\C[0]%`;
  var colorCode = 1;
  effectText += `[\\C[${colorCode}]${valNum}\\C[0]+${fragText}]`;
  var colorCode = 2;
};
};
//娼婦系説明文
if(valueItems[i].meta['ProstitutionMoneyUp']){
    var valNum = valueItems[i].meta['ProstitutionMoneyUp'];
    effectText += `\\C[27]売春額に${valNum}倍補正\\C[0] `;
};
if(valueItems[i].meta['BustSizeChange']){
    var valNum = valueItems[i].meta['BustSizeChange'];
    effectText += `\\C[27]BustSize+${valNum}cm\\C[0] `;
};
if(valueItems[i].meta['HipSizeChange']){
    var valNum = valueItems[i].meta['HipSizeChange'];
    effectText += `\\C[27]HipSize+${valNum}cm\\C[0] `;
};
if(valueItems[i].meta['BodyWeightChange']){
    var valNum = valueItems[i].meta['BodyWeightChange'];
    effectText += `\\C[27]BodyWeight+${valNum}kg\\C[0] `;
};

if(valueItems[i].meta['下級鑑定品'] || valueItems[i].meta['中級鑑定品'] || valueItems[i].meta['上級鑑定品']){
  var fragText = `\\C[3][未鑑定品]\\C[0]`;
    if(valueItems[i].meta['下級鑑定品']){fragText += `\\C[${colorCode}][下級]\\C[0]`};
    if(valueItems[i].meta['中級鑑定品']){fragText += `\\C[${colorCode}][中級]\\C[0]`};
    if(valueItems[i].meta['上級鑑定品']){fragText += `\\C[${colorCode}][上級]\\C[0]`};
      effectText += `${fragText} `;
};

if(valueItems[i].meta['walletIn']){
  var valNum = valueItems[i].meta['BodyWeightChange'];
  effectText += `\\C[${colorCode}][使用で\\G入手]\\C[0] `;
};
if(valueItems[i].meta['QuestSetMap']){
  if(Number(valueItems[i].meta['QuestSetMap']) == 0){
    var valNum = `[常設]`;
  } else {
    var valNum = $dataSystem.switches[Number(valueItems[i].meta['QuestSetMap'])];
  };
  var colorCode = 16;
  effectText += `[\\C[${colorCode}]受注\\C[0]:\\C[2]${valNum}\\C[0]] `;
  var colorCode = 2;
};
if(valueItems[i].meta['QuestSubjectMap']){
  var valNum = $dataSystem.switches[Number(valueItems[i].meta['QuestSubjectMap'])];
  var colorCode = 16;
  effectText += `[\\C[${colorCode}]対象\\C[0]:\\C[2]${valNum}\\C[0]]\n`;
  var colorCode = 2;
};
if(valueItems[i].meta['QuestSuitableLv']){
    var valNum = Number(valueItems[i].meta['QuestSuitableLv']);
    var colorCode = 16;
    effectText += `[\\C[${colorCode}]適正Lv\\C[0]:\\C[2]${valNum}\\C[0]] `;
    var colorCode = 2;
} else {
  if(valueItems[i].meta['QuestSubjectMap']){
    var valNum = Number(valueItems[i].meta['QuestSubjectMap']);
    for (var id3 = 1; id3 <= $dataItems.length-1; id3++) {
      if($dataItems[id3].meta['MapSwitch']){
        if(Number($dataItems[id3].meta['MapSwitch']) == valNum){
          if($dataItems[id3].meta['EnemyLV']){
            var arr1 = $dataItems[id3].meta['EnemyLV'].split(',');
            var fragText = Math.min(...arr1);
            var colorCode = 16;
            effectText += `[\\C[${colorCode}]適正Lv\\C[0]:\\C[2]${fragText}\\C[0]] `;
            var colorCode = 2;
            break;
    }}}};
  };
};
var colorCode = 2;
if(valueItems[i].meta['QuestCompSubjugation1']){
  if(Number(valueItems[i].meta['QuestCompSubjugation1'].split(',')[0]) >= 1){
    effectText += `[\\C[${colorCode}]討伐依頼\\C[0]] `;
  };
};
if(valueItems[i].meta['QuestCompcollect1']){
  if(Number(valueItems[i].meta['QuestCompcollect1'].split(',')[0]) >= 1){
    effectText += `[\\C[${colorCode}]収集依頼\\C[0]] `;
    var colorCode = 2;
  };
};
if(valueItems[i].meta['QuestCompDelivery1']){
  if(Number(valueItems[i].meta['QuestCompDelivery1'].split(',')[0]) >= 1){
    effectText += `[\\C[${colorCode}]納品依頼\\C[0]] `;
  };
};
if(valueItems[i].meta['QuestCompVal1']){
  if(Number(valueItems[i].meta['QuestCompVal1'].split(',')[0]) >= 1){
    effectText += `[\\C[${colorCode}]指定値達成依頼\\C[0]] `;
  };
};
if(valueItems[i].meta['QuestCompArray1']){
  if(Number(valueItems[i].meta['QuestCompArray1'].split(',')[0]) >= 1){
    effectText += `[\\C[${colorCode}]指定値達成依頼\\C[0]] `;
  };
};
if(valueItems[i].meta['QuestCompSkill1']){
  if(Number(valueItems[i].meta['QuestCompSkill1'].split(',')[0]) >= 1){
    effectText += `[\\C[${colorCode}]指定スキル獲得依頼\\C[0]] `;
  };
};
if(valueItems[i].meta['QuestCompSkillRank1']){
  if(Number(valueItems[i].meta['QuestCompSkillRank1'].split(',')[0]) >= 1){
    effectText += `\\C[${colorCode}][指定スキルランク到達依頼]\\C[0] `;
  };
};
if(valueItems[i].meta['QuestCompSkillSwi']){
  if(Number(valueItems[i].meta['QuestCompSkillSwi'].split(',')[0]) >= 1){
    effectText += `[\\C[${colorCode}]指定目的達成依頼\\C[0]] `;
  };
};
if(valueItems[i].meta['CoercionQuest']){
  effectText += `[\\C[${colorCode}]クエスト進行中に強制進行あり\\C[0]] `;
};
if(valueItems[i].meta['Stuff']){
  var valNum = Number(valueItems[i].meta['Stuff']);
  effectText += `\\C[${colorCode}][満腹度+${valNum}（${$gameVariables.value(16)}/${$gameVariables.value(13)}）]\\C[0] `;
};
if(valueItems[i].meta['ＴＰ']){
  var valNum = Number(valueItems[i].meta['ＴＰ']);
  effectText += `\\C[${colorCode}][TP+${valNum}]\\C[0] `;
};
if(valueItems[i].meta['Ingredients']){
  effectText += `\\C[${colorCode}][食材(換金用途)]\\C[0] `;
};
if(valueItems[i].meta['Alcohol']){
  effectText += `\\C[${colorCode}][アルコール]\\C[0] `;
};
if(valueItems[i].meta['ExpiryDate']){
  if(valueItems[i].meta['Menu Category']){
    if(valueItems[i].meta['Menu Category'] == ' Food'){
      effectText += `\\C[${colorCode}][賞味期限当日中]\\C[0] `;
    };
  } else {
      effectText += `\\C[${colorCode}][翌日自動返却]\\C[0] `;
  };
};
if(valueItems[i].meta['EventFactorClearReset']){
  effectText += `\\C[${colorCode}][クエスト関連アイテム]\\C[0] `;
};
//アイテムのカテゴリ素材
/*:
if(valueItems[i].meta['Menu Category'] && valueItems[i].meta['LotteryRearity']){
  if(valueItems[i].meta['Menu Category'] == ' Material'){
  if(Number(valueItems[i].meta['LotteryRearity']) == 3){var value9 = `条件:\\C[${value26}]対象LV10以上\\C[0]`};
  if(Number(valueItems[i].meta['LotteryRearity']) == 4){var value9 = `条件:\\C[${value26}]対象LV20以上\\C[0]`};
  if(Number(valueItems[i].meta['LotteryRearity']) == 5){var value9 = `条件:\\C[${value26}]対象LV30以上\\C[0]`};
  if(Number(valueItems[i].meta['LotteryRearity']) == 6){var value9 = `条件:\\C[${value26}]対象LV30以上\\C[0]`};
  if(Number(valueItems[i].meta['LotteryRearity']) == 7){var value9 = `条件:\\C[${value26}]対象LV40以上\\C[0]`};
  if(Number(valueItems[i].meta['LotteryRearity']) == 8){var value9 = `条件:\\C[${value26}]対象LV40以上\\C[0]`};
  if(Number(valueItems[i].meta['LotteryRearity']) == 9){var value9 = `条件:\\C[${value26}]対象LV50以上\\C[0]`};
  if(Number(valueItems[i].meta['LotteryRearity']) == 10){var value9 = `条件:\\C[${value26}]対象LV50以上\\C[0]`};
    value10 += `${value9} `;
  };
};
*/
if(valueItems[i].meta['AddPowerCustom']){
  var valNum = Number(valueItems[i].meta['AddPowerCustom']);
    if(valNum >= 1){
      effectText += `\\I[666]+${valNum} `;
    };
};
if(valueItems[i].meta['RaceDropRarity']){
  var valNum = Number(valueItems[i].meta['RaceDropRarity']);
    //if(value3 == 1){value10 += `[種族エネミーLv20までドロップ]`};
    //if(value3 == 2){value10 += `[種族エネミーLv40までドロップ]`};
    //if(value3 == 3){value10 += `[種族エネミーLv60までドロップ]`};
    //if(value3 == 4){value10 += `[種族エネミーLv80までドロップ]`};
    //if(value3 == 5){value10 += `[種族エネミーLv20-100までドロップ]`};
    if(valNum == 6){effectText += `[種族エネミーLv20からドロップ]`};
    if(valNum == 7){effectText += `[種族エネミーLv30からドロップ]`};
    if(valNum == 8){effectText += `[種族エネミーLv40からドロップ]`};
    if(valNum == 9){effectText += `[種族エネミーLv50からドロップ]`};
    if(valNum == 10){effectText += `[種族エネミーLv50からドロップ]`};
};
if(valueItems[i].meta['PartyExpRate']){
  var valNum = valueItems[i].meta['PartyExpRate'];
  effectText += `\\I[296]${valNum}倍 `;
};
if(valueItems[i].meta['PartyGoldRate']){
  var valNum = valueItems[i].meta['PartyGoldRate'];
  effectText += `\\I[314]${valNum}倍 `;
};
if(valueItems[i].meta['EnemyExpRate']){
  var valNum = valueItems[i].meta['EnemyExpRate'];
  effectText += `\\I[296]${valNum}倍 `;
};
if(valueItems[i].meta['EnemyGoldRate']){
  var valNum = valueItems[i].meta['EnemyGoldRate'];
  effectText += `\\I[314]${valNum}倍 `;
};
//↓スキル最後に付けるようにする。

if(valueItems[i].meta['Learn Require Eval']){
    headerText += `[\\C[${colorCode}]習得条件あり\\C[0]]`;
};

if(valueItems[i].meta['SwicthOnOffUse']){
    effectText += `[\\C[${colorCode}]使用でOn/Off\\C[0]]`;
};

//↓ステート最後に付けるようにする。
if(valueItems[i].meta['Category']){
  if(valueItems[i].meta['Category'] == ' StateabNomal'){
    suffixText += `\\C[${colorCode}]${$dataStates[15].description}\\C[0] `;
  };
};
if(valueItems[i].meta['Category']){
  if(valueItems[i].meta['Category'] == ' StateSPabNomal'){
    suffixText += `\\C[${colorCode}]${$dataStates[30].description}\\C[0] `;
  };
};
if(valueItems[i].meta['Category']){
  if(valueItems[i].meta['Category'] == ' StateUnique'){
    suffixText += `\\C[${colorCode}]${$dataStates[40].description}\\C[0] `;
  };
};
if(valueItems[i].meta['Category']){
  if(valueItems[i].meta['Category'] == ' InvalidDispel'){
    suffixText += `\\C[${colorCode}]${$dataStates[201].description}\\C[0] `;
  };
};
if(valueItems[i].meta['Category']){
  if(valueItems[i].meta['Category'] == ' PowerUp'){
    suffixText += `\\C[${colorCode}]${$dataStates[202].description}\\C[0] `;
  };
};
if(valueItems[i].meta['timeRemove']){
  effectText += `[\\C[${colorCode}]時間経過で解除\\C[0]]`;
};

if(id1 == 4){
  if(valueItems[i].meta['registUp']){
    var valNum = valueItems[i].meta['registUp'];
    effectText += `[\\C[${colorCode}]付与時に耐性率${valNum}%up\\C[0]]`;
  };
  if(valueItems[i].autoRemovalTiming >= 1){
    var fragText = `\\I[75]:${valueItems[i].minTurns}`;
      if(valueItems[i].minTurns != valueItems[i].maxTurns){
        fragText += `～${valueItems[i].maxTurns}`;
      };
      effectText += `[${fragText}] `;
  } else {
    var valNum = 0;
    if(valueEquipPassiveSkill.length >= 1){
      for (var id3 = 0; id3 <= valueEquipPassiveSkill.length-1; id3++) {
        if(valueEquipPassiveSkill[id3] == i){
          var valNum = 1;
        };
      };
    };
    if(valueEquipPassiveWeapon.length >= 1){
      for (var id3 = 0; id3 <= valueEquipPassiveWeapon.length-1; id3++) {
        if(valueEquipPassiveWeapon[id3] == i){
          var valNum = 1;
        };
      };
    };
    if(valueEquipPassiveArmor.length >= 1){
      for (var id3 = 0; id3 <= valueEquipPassiveArmor.length-1; id3++) {
        if(valueEquipPassiveArmor[id3] == i){
          var valNum = 1;
        };
      };
    };
    if(valNum == 0){
      effectText += `[\\I[75]:∞] `;
    };
  };

};
if(id1 == 4){var descWordText = `　${descWordText}`};
if(id1 != 4){
  if(valueItems[i].description == undefined){
    if(valueItems[i].meta['NoAddDescription']){
      valueItems[i].description = `解説なし`;
    } else {
      valueItems[i].description = ``;
    };
  };
};
if(valueItems[i].meta['NoAddDescription']){
  if(descWordText == 0){
    var tempDesc = `${headerText}${valueItems[i].description}${suffixText}`;
  } else {
    var tempDesc = `${headerText}${valueItems[i].description}${suffixText}\n${descWordText}`;
  };
} else {
    if(descWordText == 0){
      var tempDesc = `${headerText}${valueItems[i].description}${suffixText}\n${effectText}`;
    } else {
      var tempDesc = `${headerText}${valueItems[i].description}${suffixText}\n${descWordText}${effectText}`;
    };
};
if(id1 == 0 || id1 == 1 || id1 == 2 || id1 == 3){
  valueItems[i].description = tempDesc;
};
if(id1 == 4){//ステートとジョブは解説入れてる分のみに適用するため。
  if(valueItems[i].meta['Help Description']){
    valueItems[i].description = tempDesc;
}};
if(!valueItems[i].meta['NoAddDescription']){
  if(id1 == 5){//ステートとジョブは解説入れてる分のみに適用するため。
    if(valueItems[i].meta['Help Description']){
      valueItems[i].description = `${headerText}${valueItems[i].description}${suffixText}${effectText}`;
}}};

//解説では無く実際に影響のある処理。解説に反映させたくないもの。
if(id1 == 1 || id1 == 2 || id1 == 4 || id1 == 5){//スキルタイプ4封印で5-8までまとめて封印。
  for (var id2 = 0; id2 <= 19; id2++) {
    if(valueItems[i].traits[id2]){
      if(valueItems[i].traits[id2].code == 42){ 
        if(valueItems[i].traits[id2].dataId == 4){
          valueItems[i].traits.push({code: 42, dataId: 5, value: 1});
          valueItems[i].traits.push({code: 42, dataId: 6, value: 1});
          valueItems[i].traits.push({code: 42, dataId: 7, value: 1});
          valueItems[i].traits.push({code: 42, dataId: 8, value: 1});
  }}}};
};

};//ここまでで各種データベースのlength-1.

};//スキップ用

};

//通常攻撃の追加説明文にランク補正値と派生スキルの有無を表示valueAddDescriptionSkill = Array(101).fill(0);
attack_addKaisetu1 = function(){

var start = 101;
var end = 200;
for (var i = start; i <= end; i++) {
  if (!$dataSkills[i].name == '') {
    var descText = ``;
      if($dataSkills[i].meta['Mastery Effect']){
        var masteryRaw = $dataSkills[i].meta['Mastery Effect'];
        var masteryNoDmg = masteryRaw.replace(' Damage Per Level', '');
        var masteryClean = masteryNoDmg.replace(' ', '');
        descText += `[ランク補正:ダメージ値にランク毎${masteryClean}]\n`;
      } else {
        descText += `\n`
      };
        if($dataSkills[i].meta['NormalAttackDerived']){
          var arr1 = $dataSkills[i].meta['NormalAttackDerived'].split(',');
          descText += `[ランク${arr1[0]}で\\C[2]${$dataSkills[Number(arr1[1])].name}\\C[0]が派生発生]`
        };
        if($dataSkills[i].meta['NormalAttackDerivedSuper']){
          var arr1 = $dataSkills[i].meta['NormalAttackDerivedSuper'].split(',');
          descText += `[ランク${arr1[0]}と特殊条件を満たす事で\\C[2]${$dataSkills[Number(arr1[1])].name}\\C[0]が派生発生]`
        };
        valueAddDescriptionSkill[i-100] = `${descText}`;
}};
var start = 901;
var end = 950;
for (var i = start; i <= end; i++) {
  if (!$dataSkills[i].name == '') {
    var descText = `[必要熟練度:基礎値${Number($dataSkills[i].meta.RankUpPoint)}にランク×基礎値をプラス]`;
      if($dataSkills[i].meta['Mastery Effect']){
        var masteryRaw = $dataSkills[i].meta['Mastery Effect'];
        var masteryNoDmg = masteryRaw.replace(' Damage Per Level', '');
        var masteryClean = masteryNoDmg.replace(' ', '');
        descText += `[ランク補正:ダメージ値にランク毎${masteryClean}]\n`;
      } else {
        descText += `\n`
      };
      if($dataSkills[i].meta['NormalAttackDerived']){
        var arr1 = $dataSkills[i].meta['NormalAttackDerived'].split(',');
        descText += `[ランク${arr1[0]}で\\C[2]${$dataSkills[Number(arr1[1])].name}\\C[0]が派生発生]`
      } else {
        descText += ``;
      };
      valueAddDescriptionSkill[i-800] = `${descText}`;
}};

};

//ジョブの追加説明文valueAddDescriptionClass
class_addKaisetu1 = function(){

var start = 1;
var end = $dataClasses.length-1;
for (var i = start; i <= end; i++) {
  if (!$dataClasses[i].name == '') {
    valueClassGrowStatasComparison[i] = `${$dataClasses[i].name}`;
    if(valueClassGrowStatasComparison[i].length == 1){valueClassGrowStatasComparison[i] += `　　　　　`};
    if(valueClassGrowStatasComparison[i].length == 2){valueClassGrowStatasComparison[i] += `　　　　`};
    if(valueClassGrowStatasComparison[i].length == 3){valueClassGrowStatasComparison[i] += `　　　`};
    if(valueClassGrowStatasComparison[i].length == 4){valueClassGrowStatasComparison[i] += `　　`};
    if(valueClassGrowStatasComparison[i].length == 5){valueClassGrowStatasComparison[i] += `　`};
    var arr1 = valuePeplesStatas;
    if(Number($dataClasses[i].meta['Icon']) == 353){var arr1 = valueActor1Statas};
    if(Number($dataClasses[i].meta['Icon']) == 354){var arr1 = valueActor2Statas};
    if(Number($dataClasses[i].meta['Icon']) == 355){var arr1 = valueActor3Statas};
    if(Number($dataClasses[i].meta['Icon']) == 356){var arr1 = valueActor4Statas};
    if(Number($dataClasses[i].meta['Icon']) == 357){var arr1 = valueActor5Statas};
//ここまでメインクラス
    if(Number($dataClasses[i].meta['Icon']) == 97){var arr1 = valueFighterStatas};
    if(Number($dataClasses[i].meta['Icon']) == 107){var arr1 = valueNightStatas};
    if(Number($dataClasses[i].meta['Icon']) == 108){var arr1 = valuePriestStatas};
    if(Number($dataClasses[i].meta['Icon']) == 101){var arr1 = valueMagicianStatas};
    if(Number($dataClasses[i].meta['Icon']) == 115){var arr1 = valueThiefStatas};
    if(Number($dataClasses[i].meta['Icon']) == 96){var arr1 = valueEnhancerStatas};
    if(Number($dataClasses[i].meta['Icon']) == 106){var arr1 = valueGrapplerStatas};
    if(Number($dataClasses[i].meta['Icon']) == 120){var arr1 = valueSamuraiStatas};
    if(Number($dataClasses[i].meta['Icon']) == 102){var arr1 = valueRangerStatas};
    if(Number($dataClasses[i].meta['Icon']) == 199){var arr1 = valueHarpistStatas};
    if(Number($dataClasses[i].meta['Icon']) == 99){var arr1 = valueDestroyerStatas};
    if(Number($dataClasses[i].meta['Icon']) == 554){var arr1 = valueSlaveStatas};
    var classRankVal = 1;
    var classRankVal = Number($dataClasses[i].meta['classRank']);
    if(classRankVal == 0){var classRankVal = 1};
      if($dataClasses[i].meta['Primary Only']){
        var descText = `[\\C[1]メイン\\C[0]]`;
      } else {
        var descText = `[\\C[5]サブ\\C[0]]`;
      };
      if(classRankVal == 1){var rankRoman = `Ⅰ`};
      if(classRankVal == 2){var rankRoman = `Ⅱ`};
      if(classRankVal == 3){var rankRoman = `Ⅲ`};
      if(classRankVal == 4){var rankRoman = `Ⅳ`};
      descText += `[Class${rankRoman}]`;
      descText += `[GrowStatas:\\C[16]Mhp\\C[10]${Number(arr1[0])*classRankVal}\\C[0],\\C[16]Mmp\\C[10]${Number(arr1[1])*classRankVal}\\C[0],\\C[16]Atk\\C[10]${Number(arr1[2])*classRankVal}\\C[0],\\C[16]Def\\C[10]${Number(arr1[3])*classRankVal}\\C[0],\\C[16]Mag\\C[10]${Number(arr1[4])*classRankVal}\\C[0],\\C[16]Dex\\C[10]${Number(arr1[5])*classRankVal}\\C[0],\\C[16]Agi\\C[10]${Number(arr1[6])*classRankVal}\\C[0],\\C[16]Luk\\C[10]${Number(arr1[7])*classRankVal}\\C[0]]\n`;
      valueClassGrowStatasComparison[i] += `:\\C[16]Mhp\\C[10]${Number(arr1[0])*classRankVal}\\C[0],\\C[16]Mmp\\C[10]${Number(arr1[1])*classRankVal}\\C[0],\\C[16]Atk\\C[10]${Number(arr1[2])*classRankVal}\\C[0],\\C[16]Def\\C[10]${Number(arr1[3])*classRankVal}\\C[0],\\C[16]Mag\\C[10]${Number(arr1[4])*classRankVal}\\C[0],\\C[16]Dex\\C[10]${Number(arr1[5])*classRankVal}\\C[0],\\C[16]Agi\\C[10]${Number(arr1[6])*classRankVal}\\C[0],\\C[16]Luk\\C[10]${Number(arr1[7])*classRankVal}\\C[0]]`;
        for (var id1 = 0; id1 <= 10; id1++) {
          if($dataClasses[i].learnings[id1]){
            if($dataClasses[i].meta['Primary Only']){
              if($dataClasses[i].learnings[id1].level >= $gameVariables.value(6)){
                descText += `[Lv${$dataClasses[i].learnings[id1].level}:\\C[2]\x1bSIN[${$dataClasses[i].learnings[id1].skillId}]\\C[0]]`;
              };
            } else {
              descText += `[Lv${$dataClasses[i].learnings[id1].level}:\\C[2]\x1bSIN[${$dataClasses[i].learnings[id1].skillId}]\\C[0]]`;
            };
          };
        };
      valueAddDescriptionClass[i] = `${descText}`;
}};

};

//}());
