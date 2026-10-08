/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){

//武器防具の説明文に効果に応じた文章追加
various_description = function(databaseTypeId){

Hentai380_ArrangementNameSet();

//value10文言 value11文言文頭 value12-14属性の付与/増加/減少 value15数字か文字列か value16ALL設定
//value17武器攻撃補正 value18スキル属性 value19説明文改変スキップ value20十種武器装備可能時

if(databaseTypeId == 1){valueItems = $dataWeapons};
if(databaseTypeId == 2){valueItems = $dataArmors};
if(databaseTypeId == 0){valueItems = $dataItems};
if(databaseTypeId == 3){valueItems = $dataSkills};
if(databaseTypeId == 4){valueItems = $dataStates};
if(databaseTypeId == 5){valueItems = $dataClasses};

var start = 1;
if(databaseTypeId == 2){
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
var additionalSetTextByTarget = [];
var additionalSetCountByTarget = [];

if(valueItems[i].name == ''){
var skipDescFlag = 1;
};

if(databaseTypeId == 1 && valueItems[i].wtypeId == 0){
var skipDescFlag = 1;
};

if(skipDescFlag == 0){

if(databaseTypeId == 1 || databaseTypeId == 2){
  var headerText = `[\\C[${colorCode}]分類\\C[0]:${$dataSystem.equipTypes[valueItems[i].etypeId]}]`;
    if(databaseTypeId == 1 && valueItems[i].wtypeId >= 1){
      var weaponTypeName = $dataSystem.weaponTypes[valueItems[i].wtypeId];
      headerText += `[\\C[${colorCode}]種別\\C[0]:${weaponTypeName}]`
    };
    if(databaseTypeId == 2 && valueItems[i].atypeId >= 1){headerText += `[\\C[${colorCode}]種別\\C[0]:${$dataSystem.armorTypes[valueItems[i].atypeId]}]`};
if(databaseTypeId == 1 || databaseTypeId == 2){
  if(valueItems[i].meta['LotteryRearity']){
    headerText += `[\\I[517]:${Number(valueItems[i].meta['LotteryRearity'])}]`;
}};
};

if(databaseTypeId == 1 || databaseTypeId == 2 || databaseTypeId == 4 || databaseTypeId == 5){

  for (var traitScanIndex = 0; traitScanIndex <= 9; traitScanIndex++) {//十種武器
    if(valueItems[i].traits[traitScanIndex]){
      if(valueItems[i].traits[traitScanIndex].code == 51){
        tenWeaponCount += 1;
  }}};
  if(tenWeaponCount >= 10){
    var fragText = `\\C[${colorCode}]武器種:\\C[0]十種武器`;
    effectText += `${fragText} `;
  };

  var effectValue = 0;
  var calcTmp = 0;
  for (var traitScanIndex = 0; traitScanIndex <= 7; traitScanIndex++) {//ステアップALLで纏める
    if(valueItems[i].traits[traitScanIndex]){
      if(valueItems[i].traits[traitScanIndex].code == 21){
        statUpCount += 1;
        if(effectValue == valueItems[i].traits[traitScanIndex].value){
          var effectValue = valueItems[i].traits[traitScanIndex].value;
          calcTmp += 1;
        };
  }}};
  if(statUpCount == 5 && valueItems[i].traits[4]){
           if(valueItems[i].traits[4].value >= 1){
              var fragText = `\\I[658]+`;
              var effectValue = Math.round((valueItems[i].traits[4].value - 1) * 100);
            } else {
              var fragText = `\\I[674]-`;
              var effectValue = Math.round((1 - valueItems[i].traits[4].value) * 100);
            };
            if(calcTmp >= 2){
              effectText += `${fragText} `;
            } else {
              effectText += `${fragText}${effectValue}% `;
            };
  };
  if(statUpCount == 8){
           if(valueItems[i].traits[7].value >= 1){
              var fragText = `\\I[659]+`;
              var effectValue = Math.round((valueItems[i].traits[7].value - 1) * 100);
            } else {
              var fragText = `\\I[675]-`;
              var effectValue = Math.round((1 - valueItems[i].traits[7].value) * 100);
            };
            if(calcTmp >= 2){
              effectText += `${fragText} `;
            } else {
              effectText += `${fragText}${effectValue}% `;
            };
  };

  for (var traitScanIndex = 0; traitScanIndex <= 1; traitScanIndex++) {//物理魔法ダメージカット
    if(valueItems[i].traits[traitScanIndex]){
      if(valueItems[i].traits[traitScanIndex].code == 23){
        if(valueItems[i].traits[traitScanIndex].dataId == 6 || valueItems[i].traits[traitScanIndex].dataId == 7){
          if(damageCutIsFirst == 0){
          var damageCutRef = valueItems[i].traits[traitScanIndex].value;
          };
            if(damageCutIsFirst == 0 || damageCutRef == valueItems[i].traits[traitScanIndex].value){
              damageCutCount += 1;
            };
            damageCutIsFirst += 1;        
  }}}};

  if(damageCutCount == 2){
    if(valueItems[i].traits[1].value >= 1){
      var fragText = `\\I[654]\\I[655]-`;
      var effectValue = Math.round((valueItems[i].traits[1].value - 1) * 100);
    } else {
      var fragText = `\\I[638]\\I[639]+`;
      var effectValue = Math.round((1 - valueItems[i].traits[1].value) * 100);
    };
    effectText += `${fragText}${effectValue}% `;
  };

  for (var traitIndex = 0; traitIndex <= 19; traitIndex++) {
    if(valueItems[i].traits[traitIndex]){
      if(valueItems[i].traits[traitIndex].code == 31){
        for (var traitDataId = 1; traitDataId <= $dataSystem.elements.length-1; traitDataId++) {
          if(valueItems[i].traits[traitIndex].dataId == traitDataId){
            const elementIcon = amygame_elementIcon(traitDataId);
              var effectValue = Math.round((valueItems[i].traits[traitIndex].value - 1) * 100);
              if(elementIcon[0] >= 1){
                var fragText = `${elementIcon[1]}`;
              } else {
                var fragText = `\x1bI[${elementIcon[1]}]`;
              };
              if(valueItems[i].meta['EnemyState']){}else{
                if([18,19,51,52,53,54,55,56,57,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,82,83].some(function(id){return id == traitDataId})){
                  effectText += `\\C[${colorCode}]特攻属性付与\\C[0]${fragText} `;
                } else {
                  effectText += `\\C[${colorCode}]攻撃属性付与\\C[0]${fragText}\\C[${colorCode}] `;
                };
              };
      }}};

      if(valueItems[i].traits[traitIndex].code == 11){
        for (var traitDataId = 1; traitDataId <= $dataSystem.elements.length-1; traitDataId++) {
          if(valueItems[i].traits[traitIndex].dataId == traitDataId){
            const elementIcon = amygame_elementIcon(traitDataId);
              if(elementIcon[0] >= 1){
                var fragText = `${elementIcon[1]}`;
              } else {
                if(valueItems[i].traits[traitIndex].value >= 1){
                  var effectValue = Math.round((valueItems[i].traits[traitIndex].value - 1) * 100);
                  if(traitDataId == 11){var effectValue = Math.round((valueItems[i].traits[traitIndex].value - 1) * 10)};
                    if( [10,11,12,15,20,38,39,40,41].some(function(id){return id == traitDataId}) ){
                      var fragText = `\x1bI[${elementIcon[3]}]+`;
                    } else {
                      var fragText = `\x1bI[${elementIcon[3]}]耐性-`;
                    };
                } else {
                  var effectValue = Math.round((1 - valueItems[i].traits[traitIndex].value) * 100);
                  if(traitDataId == 11){var effectValue = Math.round((1 - valueItems[i].traits[traitIndex].value) * 10)};
                    if( [10,11,12,15,20,38,39,40,41].some(function(id){return id == traitDataId}) ){
                      var fragText = `\x1bI[${elementIcon[3]}]-`;
                    } else {
                      var fragText = `\x1bI[${elementIcon[3]}]耐性+`;
                    };
                };
              };
              if([35,37,38,41].some(function(id){return id == traitDataId})){}else{
                if( [41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80].some(function(id){return id == traitDataId}) ){
                  if(valueItems[i].meta['EnemyState']){}else{
                    effectText += `${fragText}${effectValue}% `;
                  };
                } else {
                    effectText += `${fragText}${effectValue}% `;
                };
              };
      }}};

      if(valueItems[i].traits[traitIndex].code == 12){
        for (var traitDataId = 0; traitDataId <= 7; traitDataId++) {
          if(valueItems[i].traits[traitIndex].dataId == traitDataId){
            if(valueItems[i].traits[traitIndex].value >= 1){
              var effectValue = Math.round((valueItems[i].traits[traitIndex].value - 1) * 100);
              var fragText = `\\C[1]耐性-\\C[0]\x1bI[${traitDataId + 48}]`;
            } else {
              var effectValue = Math.round((1 - valueItems[i].traits[traitIndex].value) * 100);
              var fragText = `\\C[${colorCode}]耐性+\\C[0]\x1bI[${traitDataId + 48}]`;
            };
              effectText += `${fragText}${effectValue}% `;
      }}};

      if(valueItems[i].traits[traitIndex].code == 13){
        for (var traitDataId = 1; traitDataId <= $dataStates.length-1; traitDataId++) {
          if(valueItems[i].traits[traitIndex].dataId == traitDataId){
            if(valueItems[i].traits[traitIndex].value >= 1){
              var effectValue = Math.round((valueItems[i].traits[traitIndex].value - 1) * 100);
              if($dataStates[traitDataId].iconIndex >= 1){
                var fragText = `\\C[1]耐性-\\C[0]\x1bI[${$dataStates[traitDataId].iconIndex}]`;
              } else {
                var fragText = `\\C[1]耐性-\\C[0]${$dataStates[traitDataId].name}`;
              };
            } else {
              var effectValue = Math.round((1 - valueItems[i].traits[traitIndex].value) * 100);
              if($dataStates[traitDataId].iconIndex >= 1){
                var fragText = `\\C[${colorCode}]耐性+\\C[0]\x1bI[${$dataStates[traitDataId].iconIndex}]`;
              } else {
                var fragText = `\\C[${colorCode}]耐性+\\C[0]${$dataStates[traitDataId].name}`;
              };
            };
            effectText += `\\C[0]${fragText}${effectValue}% `;
      }}};

      if(valueItems[i].traits[traitIndex].code == 14){
        for (var traitDataId = 1; traitDataId <= $dataStates.length-1; traitDataId++) {
          if(valueItems[i].traits[traitIndex].dataId == traitDataId){
            if($dataStates[traitDataId].iconIndex >= 1){
              var fragText = `\x1bI[${$dataStates[traitDataId].iconIndex}]`;
            } else {
              var fragText = `${$dataStates[traitDataId].name}`;
            };
              effectText += `\\C[${colorCode}]無効化\\C[0]${fragText} `;
      }}};

  if(traitIndex > statUpCount || statUpCount <= 4){
      if(valueItems[i].traits[traitIndex].code == 21){
        for (var traitDataId = 0; traitDataId <= 7; traitDataId++) {
          if(valueItems[i].traits[traitIndex].dataId == traitDataId){
            if(valueItems[i].traits[traitIndex].value >= 1){
              var fragText = `\x1bI[${traitDataId + 32}]+`;
              var effectValue = Math.round((valueItems[i].traits[traitIndex].value - 1) * 100);
            } else {
              var fragText = `\x1bI[${traitDataId + 48}]-`;
              var effectValue = Math.round((1 - valueItems[i].traits[traitIndex].value) * 100);
            };
              effectText += `${fragText}${effectValue}% `;
      }}};
  };

      if(valueItems[i].traits[traitIndex].code == 22){
        for (var traitDataId = 0; traitDataId <= 9; traitDataId++) {
          if(valueItems[i].traits[traitIndex].dataId == traitDataId){
            var iconIdxGrant = 16;var iconIdxUp = 16;var iconIdxDown = 16;
              if(traitDataId == 0){var iconIdxGrant = 630;var iconIdxUp = 630;var iconIdxDown = 646};
              if(traitDataId == 1){var iconIdxGrant = 632;var iconIdxUp = 632;var iconIdxDown = 648};
              if(traitDataId == 2){var iconIdxGrant = 631;var iconIdxUp = 631;var iconIdxDown = 647};
              if(traitDataId == 7){var iconIdxGrant = 640;var iconIdxUp = 640;var iconIdxDown = 643};
              if(traitDataId == 8){var iconIdxGrant = 641;var iconIdxUp = 641;var iconIdxDown = 644};
              if(traitDataId == 9){var iconIdxGrant = 642;var iconIdxUp = 642;var iconIdxDown = 645};
              if(valueItems[i].traits[traitIndex].value >= 0.01){
                var fragText = `\x1bI[${iconIdxUp}]+`;
                var effectValue = Math.round((valueItems[i].traits[traitIndex].value) * 100);
              } else {
                var fragText = `\x1bI[${iconIdxDown}]`;
                var effectValue = Math.round((valueItems[i].traits[traitIndex].value) * 100);
              };
              effectText += `${fragText}${effectValue}% `;
      }}};

  if(damageCutCount <= 1){
      if(valueItems[i].traits[traitIndex].code == 23){
        for (var traitDataId = 0; traitDataId <= 9; traitDataId++) {
          if(valueItems[i].traits[traitIndex].dataId == traitDataId){
            var iconIdxGrant = 16;var iconIdxUp = 16;var iconIdxDown = 16;
              if(traitDataId == 0){var iconIdxGrant = 649;var iconIdxUp = 649;var iconIdxDown = 649};
              if(traitDataId == 6){var iconIdxGrant = 654;var iconIdxUp = 638;var iconIdxDown = 654};
              if(traitDataId == 7){var iconIdxGrant = 655;var iconIdxUp = 639;var iconIdxDown = 655};//ここまでマイナスがプラス効果
              if(traitDataId == 4){var iconIdxGrant = 634;var iconIdxUp = 634;var iconIdxDown = 650};
              if(traitDataId == 5){var iconIdxGrant = 635;var iconIdxUp = 635;var iconIdxDown = 651};
              if(traitDataId == 9){var iconIdxGrant = 656;var iconIdxUp = 656;var iconIdxDown = 672};
              if(valueItems[i].traits[traitIndex].value >= 1){
                if(traitDataId == 6 || traitDataId == 7){
                  var fragText = `\x1bI[${iconIdxDown}]-`;
                } else {
                  var fragText = `\x1bI[${iconIdxUp}]+`;
                };
                var effectValue = Math.round((valueItems[i].traits[traitIndex].value - 1) * 100);
              } else {
                if(traitDataId == 6 || traitDataId == 7){
                  var fragText = `\x1bI[${iconIdxUp}]+`;
                } else {
                  var fragText = `\x1bI[${iconIdxDown}]-`;
                };
                var effectValue = Math.round((1 - valueItems[i].traits[traitIndex].value) * 100);
              };
              effectText += `${fragText}${effectValue}% `;
      }}};
  };

      if(valueItems[i].traits[traitIndex].code == 32){ //31は先頭で実行済み。
        for (var traitDataId = 1; traitDataId <= $dataStates.length-1; traitDataId++) {
          if(valueItems[i].traits[traitIndex].dataId == traitDataId){
                var effectValue = Math.round((valueItems[i].traits[traitIndex].value) * 100);
               if(traitDataId >= 206 && traitDataId <= 217){
                 if(traitDataId == 206){var fragText = `\\I[322]`};
                 if(traitDataId == 207){var fragText = `\\I[323]`};
                 if(traitDataId == 208){var fragText = `\\I[324]`};
                 if(traitDataId == 209){var fragText = `\\I[325]`};
                 if(traitDataId == 210){var fragText = `\\I[326]`};
                 if(traitDataId == 211){var fragText = `\\I[327]`};
                 if(traitDataId == 212){var fragText = `\\I[338]`};
                 if(traitDataId == 213){var fragText = `\\I[339]`};
                 if(traitDataId == 214){var fragText = `\\I[340]`};
                 if(traitDataId == 215){var fragText = `\\I[341]`};
                 if(traitDataId == 216){var fragText = `\\I[342]`};
                 if(traitDataId == 217){var fragText = `\\I[343]`};
               } else {
                 if($dataStates[traitDataId].iconIndex >= 1){
                   var fragText = `\x1bI[${$dataStates[traitDataId].iconIndex}]`;
                 } else {
                   var fragText = `${$dataStates[traitDataId].name}`;
                 };
               };
              effectText += `\\C[${colorCode}]ステート付与\\C[0]${fragText}${effectValue}% `;
      }}};

      if(valueItems[i].traits[traitIndex].code == 33){ 
          if(valueItems[i].traits[traitIndex].dataId == 0){
                var effectValue = Math.round((valueItems[i].traits[traitIndex].value));
                var fragText = `\\C[${colorCode}]AttackSpeed+\\C[0]`;
                effectText += `${fragText}${effectValue} `;
      }};

      if(valueItems[i].traits[traitIndex].code == 41){ 
        for (var traitDataId = 1; traitDataId <= $dataSystem.skillTypes.length-1; traitDataId++) {
          if(valueItems[i].traits[traitIndex].dataId == traitDataId){
            var fragText = `<${$dataSystem.skillTypes[traitDataId]}>`;
            effectText += `\\C[${colorCode}]使用可能\\C[0]${fragText} `;
      }}};

      if(valueItems[i].traits[traitIndex].code == 42){ 
        for (var traitDataId = 1; traitDataId <= $dataSystem.skillTypes.length-1; traitDataId++) {
          if(valueItems[i].traits[traitIndex].dataId == traitDataId){
            var fragText = `<${$dataSystem.skillTypes[traitDataId]}>`;
            effectText += `\\I[626]${fragText} `;
      }}};

      if(valueItems[i].traits[traitIndex].code == 43){
        for (var traitDataId = 1; traitDataId <= $dataSkills.length-1; traitDataId++) {
          if(valueItems[i].traits[traitIndex].dataId == traitDataId){
            //var value9 = `<${$dataSkills[id3].name}>`;
            var fragText = `<\x1bSIN[${traitDataId}]>`;
              if(databaseTypeId == 1 && $dataSkills[traitDataId].stypeId == 12){
                effectText += `\\C[${colorCode}]Burst\\C[0]${fragText} `;
              } else {
                effectText += `\\C[${colorCode}]使用可能\\C[0]${fragText} `;
              };  
      }}};

      if(valueItems[i].traits[traitIndex].code == 44){
        for (var traitDataId = 1; traitDataId <= $dataSkills.length-1; traitDataId++) {
          if(valueItems[i].traits[traitIndex].dataId == traitDataId){
            //var value9 = `<${$dataSkills[id3].name}>`;
            var fragText = `<\x1bSIN[${traitDataId}]>`;
            effectText += `\\I[626]${fragText} `;
      }}};
  if(tenWeaponCount <= 9){
      if(valueItems[i].traits[traitIndex].code == 51){
        for (var traitDataId = 1; traitDataId <= $dataSystem.weaponTypes.length-1; traitDataId++) {
          if(valueItems[i].traits[traitIndex].dataId == traitDataId){
            var fragText = `<${$dataSystem.weaponTypes[traitDataId]}>`;
            effectText += `\\C[${colorCode}]武器種\\C[0]${fragText} `;
      }}};
  };

      if(valueItems[i].traits[traitIndex].code == 52){
        for (var traitDataId = 1; traitDataId <= $dataSystem.armorTypes.length-1; traitDataId++) {
          if(valueItems[i].traits[traitIndex].dataId == traitDataId){
            if(traitDataId >= 2){
              var fragText = `<${$dataSystem.armorTypes[traitDataId]}>`;
              effectText += `\\C[${colorCode}]防具種\\C[0]${fragText} `;
            };
      }}};

      if(valueItems[i].traits[traitIndex].code == 53){
        for (var traitDataId = 1; traitDataId <= $dataSystem.equipTypes.length-1; traitDataId++) {
          if(valueItems[i].traits[traitIndex].dataId == traitDataId){
            var fragText = `<${$dataSystem.equipTypes[traitDataId]}>`;
            effectText += `\\C[1]装備固定\\C[0]${fragText} `;
      }}};

      if(valueItems[i].traits[traitIndex].code == 54){
        for (var traitDataId = 1; traitDataId <= $dataSystem.equipTypes.length-1; traitDataId++) {
          if(valueItems[i].traits[traitIndex].dataId == traitDataId){
            var fragText = `<${$dataSystem.equipTypes[traitDataId]}>`;
            effectText += `\\C[1]装備封印\\C[0]${fragText} `;
      }}};

      if(valueItems[i].traits[traitIndex].code == 61){ 
          if(valueItems[i].traits[traitIndex].dataId == 0){
                var effectValue = Math.round((valueItems[i].traits[traitIndex].value) * 100);
                var fragText = `\\C[${colorCode}]行動回数追加\\C[0]`;
                effectText += `${fragText}${effectValue}% `;
      }};

    };
  };

};//ここまで特徴コード。武器防具ステート。スキルはtraitsではなくeffectsなので下で実行

if(valueItems[i].meta['HSkillLearn']){
      var iconIdxGrant = 0;
      effectText += `[条件:`;
  for (var traitDataId = 1; traitDataId <= 3; traitDataId++) {
    if(valueItems[i].meta['PremiseSkill' + traitDataId]){
      var effectValue = Number(valueItems[i].meta['PremiseSkill' + traitDataId]);
      var fragText = `${$dataSkills[effectValue].name}`;
      effectText += `\\C[27]<${fragText}>\\C[0]習得`;
      var iconIdxGrant = 1;
    };
    if(valueItems[i].meta['PremiseSkillRank' + traitDataId]){
      var effectValue = Number(valueItems[i].meta['PremiseSkillRank' + traitDataId].split(',')[0]);
      var fragText = Number(valueItems[i].meta['PremiseSkillRank' + traitDataId].split(',')[1]);
      effectText += `\\C[27]<${$dataSkills[effectValue].name}>\\C[0]Rank:\\C[27]${fragText}\\C[0]到達`;
      var iconIdxGrant = 1;
    };
    if(valueItems[i].meta['PremiseVariable' + traitDataId]){
      var effectValue = Number(valueItems[i].meta['PremiseVariable' + traitDataId].split(',')[0]);
      var effectValue = `${$dataSystem.variables[effectValue]}`;
      var effectValue = effectValue.replace("　", "");
      var effectValue = effectValue.replace("　", "");
      var effectValue = effectValue.replace("　", "");
      var effectValue = effectValue.replace(" ", "");
      var effectValue = effectValue.replace(":", "");
      var fragText = Number(valueItems[i].meta['PremiseVariable' + traitDataId].split(',')[1]);
      effectText += `\\C[27]${effectValue}\\C[0]:\\C[27]${fragText}\\C[0]以上`;
      var iconIdxGrant = 1;
    };
    if(valueItems[i].meta['PremiseArrangement' + traitDataId]){
      var effectValue = Number(valueItems[i].meta['PremiseArrangement' + traitDataId].split(',')[0]);
      var fragText = Number(valueItems[i].meta['PremiseArrangement' + traitDataId].split(',')[1]);
      effectText += `\\C[27]${valueHentaiArrangement[effectValue]}\\C[0]:\\C[27]${fragText}\\C[0]以上`;
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
    if(databaseTypeId == 3 && valueItems[i].stypeId == 15){
      var descWordText = `\\C[27][${fragText}]\\C[0] `;
    } else {
      var descWordText = `\\C[${colorCode}][${fragText}]\\C[0] `;
    };
};//一言が必要なもののみ

if(valueItems[i].meta['GunDamage']){
var effectValue = valueItems[i].meta['GunDamage'];
effectText += `[固定値:${effectValue}] `;
};//銃武器の固定値

if(databaseTypeId == 3 || databaseTypeId == 0){

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
      var effectValue = valueItems[i].meta['Skill Tier'].replace(' ','');
      effectValue = Number(effectValue);
      if(effectValue >= 1){effectValue = `\x1bI[${Yanfly.Icon.ESTier[effectValue]}]${Yanfly.Param.ESTierName[effectValue]}>`};
      var fragText = `<装着:${effectValue}`;
      if(valueItems[i].stypeId == 15){var colorCode = 27};
      headerText += `\\C[${colorCode}]${fragText}\\C[0] `;
      var colorCode = 2;
  };
if(databaseTypeId == 3){
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
if(databaseTypeId == 0){
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

if(databaseTypeId == 3){
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
    var metaValues = valueItems[i].meta['Multiple Elements'].split(',');
      for (var traitDataId = 0; traitDataId <= metaValues.length-1; traitDataId++) {
            const elementIcon = amygame_elementIcon(metaValues[traitDataId]);
              if(elementIcon[0] >= 1){
                var fragText = `${elementIcon[1]}`;
              } else {
                var fragText = `\x1bI[${elementIcon[1]}]`;
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
  var effectValue = `${$dataSystem.skillTypes[valueItems[i].stypeId]}`;
  var fragText = Number(valueItems[i].meta['SkillLearningClass']);
  if(fragText != 100){
    effectText += `[\\C[${colorCode}]${effectValue}\\C[0]] [\\C[${colorCode}]\x1bJ[${fragText}]\\C[0]習得] `;
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
if(databaseTypeId == 0){
  if(valueItems[i].consumable){
    //value10 += `[\\C[${value26}]消耗品\\C[0]] `;
  };
};
if(databaseTypeId == 0){
  if(valueItems[i].meta['SeiyokuItem']){
    var colorCode = 27;
    effectText += `[\\C[${colorCode}]性欲品\\C[0]] `;
  };
};
var colorCode = 2;
if(valueItems[i].meta['DamageFormula2']){
  var metaValues = valueItems[i].meta['DamageFormula2'].split(',');
    if(metaValues[0] == 1){var fragText = `[\\C[${colorCode}]\\I[34]100%\\C[0]`};
    if(metaValues[0] == 2){var fragText = `[\\C[${colorCode}]\\I[36]100%\\C[0]`};
    if(metaValues[0] == 3){var fragText = `[\\C[${colorCode}]\\I[37]100%\\C[0]`};
    if(metaValues[0] == 4){var fragText = `[\\C[${colorCode}]\\I[39]100%\\C[0]`};
    if(metaValues[0] == 5){var fragText = `[\\C[${colorCode}]\\I[35]100%\\C[0]`};
    if(metaValues[0] == 6){var fragText = `[\\C[${colorCode}]\\I[37]50%\\I[38]50%\\C[0]`};
    if(metaValues[0] == 7){var fragText = `[\\C[${colorCode}]\\I[34]50%\\I[37]50%\\C[0]`};
    if(metaValues[0] == 8){var fragText = recoveryEffectMsg(36, 36);};
    if(metaValues[0] == 9){var fragText = recoveryEffectMsg(34, 35);};
    if(metaValues[0] == 10){
		var absorbNum = metaValues[1];var dmgNum = metaValues[2];
		var msg = `現在HPの${absorbNum}%消費して×${dmgNum}倍の与ダメ`;
		var fragText = `[\\C[${colorCode}]${msg}\\C[0]`;
	};
    if(metaValues[0] == 11){var fragText = `[\\C[${colorCode}]\\I[34]70%\\I[37]20%\\I[38]10%\\C[0]`};
    if(metaValues[0] == 12){var fragText = `[\\C[${colorCode}]\\I[34]20%\\I[37]40%\\I[38]40%\\C[0]`};
    if(metaValues[0] == 13){var fragText = `[\\C[${colorCode}]\\I[34]60%\\I[37]40%\\C[0]`};
    if(metaValues[0] == 14){var fragText = `[\\C[${colorCode}]\\I[36]100%\\C[0]`};
    if(metaValues[0] == 15){var fragText = `[\\C[${colorCode}]\\I[34]40%\\I[37]30%\\I[38]30%\\C[0]`};
    if(metaValues[0] == 16){var fragText = `[\\C[${colorCode}]\\I[34]80%\\I[37]20%\\C[0]`};
    if(metaValues[0] == 17){var fragText = `[\\C[${colorCode}]\\I[34]100%\\C[0]`};
    if(metaValues[0] == 18){
		var item = `\\I[37]`;
		var msg = `${item}50%+固定値`;
		var fragText = `[\\C[${colorCode}]${msg}\\C[0]`
	};
    if(metaValues[0] == 19){var fragText = `[\\C[${colorCode}]\\I[34]20%\\I[37]80%\\C[0]`};
    if(metaValues[0] == 20){var fragText = `[\\C[${colorCode}]\\I[36]50%\\I[37]50%\\C[0]`};
    if(metaValues[0] == 24){var fragText = `[\\C[${colorCode}]\\I[37]50%\\I[39]50%\\C[0]`};
    if(metaValues[0] == 25){var fragText = `[\\C[${colorCode}]\\I[37]50%\\C[0]`};
    if(metaValues[0] == 28){var fragText = `[\\C[${colorCode}]\\I[34]100%\\C[0]`};
    if(metaValues[0] == 29){var fragText = `[\\C[${colorCode}]\\I[34]80%\\I[37]10%\\I[38]10%\\C[0]`};
    if(metaValues[0] == 30){var fragText = `[\\C[${colorCode}]\\I[34]70%\\I[37]10%\\I[38]20%\\C[0]`};
    if(metaValues[2] >= 0){fragText += ` \\C[${colorCode}]×${metaValues[2]}\\C[0]] `};
    if(metaValues[1] >= 1){fragText += `\\I[666]:${metaValues[1]}`};
    if(databaseTypeId == 3){
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
	var lvlN = valueItems[i].meta['LevelFluctuation'];
    suffixText += `[${lvlN}ﾚﾍﾞﾙ毎に威力+]`;
  };
};

if(valueItems[i].damage.type >= 1){
  if(valueItems[i].meta['PotionUsePoint']){
    if(valueItems[i].damage.type == 3){var fragText = 'HP'};//HP回復
    if(valueItems[i].damage.type == 4){var fragText = 'MP'};//MP回復
      if(Number(valueItems[i].meta['PotionUsePoint']) >= 2){
        var effectValue = Number(valueItems[i].meta['PotionUsePoint']);
      } else {
        var effectValue = `全`;
      };
      effectText += `[\\C[${colorCode}]${fragText}\\C[3]${effectValue}\\C[0]回復]`;
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

var additionalSetTextByTarget = [0,`[\\C[${colorCode}]使用者に`,`[\\C[${colorCode}]味方全体に`,`[\\C[${colorCode}]対象敵に`,`[\\C[${colorCode}]敵全体に`];
var additionalSetCountByTarget = [0,0,0,0,0];
var list = [1,2,3,4,5,6,7,8,9];
list.forEach(function(additionalSetSlot) {
  if(valueItems[i].meta['additionalSet' + additionalSetSlot]){
    var additionalSetValues = valueItems[i].meta['additionalSet' + additionalSetSlot].split(',');
    if(Number(additionalSetValues[0]) == 1){additionalSetCountByTarget[1] += 1};
    if(Number(additionalSetValues[0]) == 2){additionalSetCountByTarget[2] += 1};
    if(Number(additionalSetValues[0]) == 3){additionalSetCountByTarget[3] += 1};
    if(Number(additionalSetValues[0]) == 4){additionalSetCountByTarget[4] += 1};
    if(Number(additionalSetValues[1]) == 1){
        if(Number(additionalSetValues[3]) >= 206 && Number(additionalSetValues[3]) <= 217){
        if(Number(additionalSetValues[3]) == 206){var fragText = `\\I[322]`};
        if(Number(additionalSetValues[3]) == 207){var fragText = `\\I[323]`};
        if(Number(additionalSetValues[3]) == 208){var fragText = `\\I[324]`};
        if(Number(additionalSetValues[3]) == 209){var fragText = `\\I[325]`};
        if(Number(additionalSetValues[3]) == 210){var fragText = `\\I[326]`};
        if(Number(additionalSetValues[3]) == 211){var fragText = `\\I[327]`};
        if(Number(additionalSetValues[3]) == 212){var fragText = `\\I[338]`};
        if(Number(additionalSetValues[3]) == 213){var fragText = `\\I[339]`};
        if(Number(additionalSetValues[3]) == 214){var fragText = `\\I[340]`};
        if(Number(additionalSetValues[3]) == 215){var fragText = `\\I[341]`};
        if(Number(additionalSetValues[3]) == 216){var fragText = `\\I[342]`};
        if(Number(additionalSetValues[3]) == 217){var fragText = `\\I[343]`};
      } else {
        var fragText = `\x1bSIM[${Number(additionalSetValues[3])}]`;
      };
      if(Number(additionalSetValues[3]) == 201){var fragText = `\\I[658]`};
      if(Number(additionalSetValues[3]) == 293){fragText += `*10`};//バフリミット+も数
      if(Number(additionalSetValues[3]) == 294){fragText += `*20`};
      if(Number(additionalSetValues[3]) == 295){fragText += `*30`};
      if(Number(additionalSetValues[2]) >= 2){
        for (var plusSignCount = 2; plusSignCount <= Number(additionalSetValues[2]); plusSignCount++) {
          fragText += `+`;
        };
      };
    if(Number(additionalSetValues[0]) == 1){additionalSetTextByTarget[1] += `${fragText}`};
    if(Number(additionalSetValues[0]) == 2){additionalSetTextByTarget[2] += `${fragText}`};
    if(Number(additionalSetValues[0]) == 3){additionalSetTextByTarget[3] += `${fragText}`};
    if(Number(additionalSetValues[0]) == 4){additionalSetTextByTarget[4] += `${fragText}`};
    };
  };
}, this);
if( Number(additionalSetCountByTarget[1]) >= 1 ){effectText += `${additionalSetTextByTarget[1]}付与\\C[0]] `};
if( Number(additionalSetCountByTarget[2]) >= 1 ){effectText += `${additionalSetTextByTarget[2]}付与\\C[0]] `};
if( Number(additionalSetCountByTarget[3]) >= 1 ){effectText += `${additionalSetTextByTarget[3]}付与\\C[0]] `};
if( Number(additionalSetCountByTarget[4]) >= 1 ){effectText += `${additionalSetTextByTarget[4]}付与\\C[0]] `};

  for (var traitIndex = 0; traitIndex <= 19; traitIndex++) {
    if(valueItems[i].effects[traitIndex]){

      if(valueItems[i].effects[traitIndex].code == 11){
        if(valueItems[i].effects[traitIndex].dataId == 0){
          var effectValue = Math.round((valueItems[i].effects[traitIndex].value1)*100);
            if(effectValue != 0){
              var fragText = `\\I[627]:${effectValue}%`;
                if(effectValue >= 1){
                  effectText += `[\\C[3]${fragText}\\C[0]]`;
                } else {
                  effectText += `[\\C[4]${fragText}\\C[0]]`;             
                };
            };
        };
        if(valueItems[i].effects[traitIndex].dataId == 0){
          var effectValue = (valueItems[i].effects[traitIndex].value2);
            if(effectValue != 0){
              var fragText = `\\I[627]:${effectValue}`;
                if(effectValue >= 1){
                  effectText += `[\\C[3]${fragText}\\C[0]]`;
                } else {
                  effectText += `[\\C[4]${fragText}\\C[0]]`;             
                };
            };
        };
      };

      if(valueItems[i].effects[traitIndex].code == 12){
        if(valueItems[i].effects[traitIndex].dataId == 0){
          var effectValue = Math.round((valueItems[i].effects[traitIndex].value1)*100);
            if(effectValue != 0){
              var fragText = `\\I[628]:${effectValue}%`;
                if(effectValue >= 1){
                  effectText += `[\\C[3]${fragText}\\C[0]]`;
                } else {
                  effectText += `[\\C[4]${fragText}\\C[0]]`;             
                };
            };
        };
        if(valueItems[i].effects[traitIndex].dataId == 0){
          var effectValue = (valueItems[i].effects[traitIndex].value2);
            if(effectValue != 0){
              var fragText = `\\I[628]:${effectValue}`;
                if(effectValue >= 1){
                  effectText += `[\\C[3]${fragText}\\C[0]]`;
                } else {
                  effectText += `[\\C[4]${fragText}\\C[0]]`;             
                };
            };
        };
      };

      if(valueItems[i].effects[traitIndex].code == 13){//TPはvalue2（固定値）なし。%表記ではないので*100処理も不要
        if(valueItems[i].effects[traitIndex].dataId == 0){
          var effectValue = Math.round((valueItems[i].effects[traitIndex].value1)*1);
            if(effectValue != 0){
              var fragText = `\\I[629]:${effectValue}%`;
                if(effectValue >= 1){
                  effectText += `[\\C[3]${fragText}up\\C[0]]`;
                } else {
                  effectText += `[\\C[4]${fragText}down\\C[0]]`;             
                };
            };
        };
      };

      if(valueItems[i].effects[traitIndex].code == 21){
        for (var traitDataId = 1; traitDataId <= $dataStates.length-1; traitDataId++) {
          if(valueItems[i].effects[traitIndex].dataId == traitDataId){
            var effectValue = Math.round((valueItems[i].effects[traitIndex].value1) * 100);
               if(traitDataId >= 206 && traitDataId <= 217){
                 if(traitDataId == 206){var fragText = `\\I[322]`};
                 if(traitDataId == 207){var fragText = `\\I[323]`};
                 if(traitDataId == 208){var fragText = `\\I[324]`};
                 if(traitDataId == 209){var fragText = `\\I[325]`};
                 if(traitDataId == 210){var fragText = `\\I[326]`};
                 if(traitDataId == 211){var fragText = `\\I[327]`};
                 if(traitDataId == 212){var fragText = `\\I[338]`};
                 if(traitDataId == 213){var fragText = `\\I[339]`};
                 if(traitDataId == 214){var fragText = `\\I[340]`};
                 if(traitDataId == 215){var fragText = `\\I[341]`};
                 if(traitDataId == 216){var fragText = `\\I[342]`};
                 if(traitDataId == 217){var fragText = `\\I[343]`};
              } else {
              if($dataStates[traitDataId].iconIndex >= 1){
                var fragText = `\x1bI[${$dataStates[traitDataId].iconIndex}]`;
              } else {
                var fragText = `${$dataStates[traitDataId].name}`;
              };
              };
              if(traitDataId != prevStateCode){
                var prevStateCode = 0;
                var consecStateCount = 0;
              };
              if(prevStateCode == traitDataId){
                consecStateCount += 1; 
              } else {
                var prevStateCode = traitDataId 
              };
              if($dataStates[traitDataId].autoRemovalTiming >= 1){
                var calcTmp = ` ${$dataStates[traitDataId].minTurns}`;
                  if($dataStates[traitDataId].minTurns != $dataStates[traitDataId].maxTurns){
                    calcTmp += `～${$dataStates[traitDataId].maxTurns}t`;
                  } else {
                    calcTmp += `t`;
                  };
              } else {
                var calcTmp = ``;
              };
              if(traitDataId >= 206 && traitDataId <= 217){
                var calcTmp = ``;
              };
              if(consecStateCount >= 1){
                  effectText += `\\C[${colorCode}]+\\C[0]`;         
              } else {
				var bonus = `付与`;
                if(effectValue == 100){
                  effectText += `[\\C[${colorCode}]付与:\\C[0]${fragText}${calcTmp}]`;
                } else {
                  effectText += `[\\C[${colorCode}]付与:\\C[0]${fragText}${effectValue}%${calcTmp}]`;
                };
              };
       }}};

      if(valueItems[i].effects[traitIndex].code == 22){
        for (var traitDataId = 1; traitDataId <= $dataStates.length-1; traitDataId++) {
          if(valueItems[i].effects[traitIndex].dataId == traitDataId){
            var effectValue = Math.round((valueItems[i].effects[traitIndex].value1) * 100);
              if($dataStates[traitDataId].iconIndex >= 1){
                var fragText = `\x1bI[${$dataStates[traitDataId].iconIndex}]`;
                } else {
                var fragText = `${$dataStates[traitDataId].name}`;
                };
              if(effectValue == 100){
                effectText += `[\\C[3]解除:\\C[0]${fragText}]`;
              } else {
                effectText += `[\\C[3]解除:\\C[0]${fragText}${effectValue}%]`;
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

for (var traitDataId = 1; traitDataId <= $dataSystem.elements.length-1; traitDataId++) {
  if(valueItems[i].meta['Element Amplify ' + traitDataId]){
            const elementIcon = amygame_elementIcon(traitDataId);
              var effectValue = valueItems[i].meta['Element Amplify ' + traitDataId].replace(' ','');
              if(elementIcon[0] >= 1){
                var fragText = `${elementIcon[1]}威力`;
              } else {
                var fragText = `\x1bI[${elementIcon[2]}]威力`;
              };
            effectText += `${fragText}${effectValue} `;
}};//属性威力加算

if(valueItems[i].meta['PassiveElementP']){//<Max Mastery Level: 5>
  var metaValues = valueItems[i].meta['PassiveElementP'].split(',');
  const elementIcon = amygame_elementIcon(Number(metaValues[0]));
  if(elementIcon[0] >= 1){
    var fragText = `${elementIcon[1]}威力`;
  } else {
    var fragText = `\x1bI[${elementIcon[2]}]威力`;
  };
  //var value9 = `${$dataSystem.elements[Number(arr1[0])]}威力:`;
  if(Number(metaValues[1]) >= 1){
    var colorCode = 10;
  } else {
    var colorCode = 1;
  };
  if(valueItems[i].meta['Max Mastery Level']){
    effectText += `\\C[${colorCode}]<${fragText}Rank*${Number(metaValues[1])}%\\C[0]>`;
  } else {
    effectText += `\\C[${colorCode}]<${fragText}${Number(metaValues[1])}%\\C[0]>`;
  };
  var colorCode = 2;
};
if(valueItems[i].meta['SpecialAttack']){
  var effectValue = Number(valueItems[i].meta['SpecialAttack']);
  var fragText = `<\x1bSIN[${effectValue}]>`;
  effectText += `\\C[${colorCode}]Attack\\C[0]${fragText} `;
};
if(valueItems[i].meta['AddPowerWeapon']){
  var effectValue = valueItems[i].meta['AddPowerWeapon'];
  effectText += `\\I[666]+${effectValue} `;
};//スキルのパワーに加算
if(valueItems[i].meta['Critical Multiplier']){
  var effectValue = valueItems[i].meta['Critical Multiplier'].replace(' ','');
  effectText += `\\I[78]威力${effectValue} `;
};//会心威力
if(valueItems[i].meta['Counter Skills']){
  var effectValue = valueItems[i].meta['Counter Skills'];
  effectText += `\\C[16]反撃スキル:\x1bSIN[${effectValue}]\\C[0] `;
};
if(valueItems[i].meta['Counter Total']){
  var effectValue = valueItems[i].meta['Counter Total'];
  var effectValue = effectValue.replace(" +", "");
  effectText += `\\C[16][最大反撃回数:${Number(effectValue)+1}回]\\C[0] `;
};
if(valueItems[i].meta['CertainlyDouble']){
  effectText += `\\C[16][必ず2連撃以上]\\C[0] `;
};
if(valueItems[i].meta['CertainlyTriple']){
  effectText += `\\C[16][必ず3連撃]\\C[0] `;
};
if(valueItems[i].meta['NormalAttackHit']){
  var effectValue = valueItems[i].meta['NormalAttackHit'];
  effectText += `\\C[16][通常攻撃Hit数+${effectValue}]\\C[0] `;
};
if(valueItems[i].meta['AttackAbilityHit']){
  var effectValue = valueItems[i].meta['AttackAbilityHit'];
  effectText += `\\C[16][通常/アビリティ攻撃Hit数+${effectValue}]\\C[0] `;
};
if(valueItems[i].meta['BattleAddAttackSet']){
  var effectValue = valueItems[i].meta['BattleAddAttackSet'];
  effectText += `\\C[16][追撃${effectValue}%]\\C[0] `;
};
if(valueItems[i].meta['Evade Counter']){
  effectText += `\\C[16][回避後に反撃]\\C[0] `;
};
if(valueItems[i].meta['Hit Counter']){
  effectText += `\\C[16][攻撃受後に反撃]\\C[0] `;
};
if(valueItems[i].meta['MaxTp']){
  var effectValue = valueItems[i].meta['MaxTp'];
  effectText += `\\C[16]MaxTp\\C[0]+${effectValue} `;
};
if(valueItems[i].meta['elementRegist6']){
  var effectValue = valueItems[i].meta['elementRegist6'];
  if(effectValue == 0){
    effectText += `\\C[${colorCode}]六属性完全耐性\\C[0] `;
  } else {
    effectText += `\\C[${colorCode}]六属性耐性\\C[0]${effectValue}% `;
  };
};
if(valueItems[i].meta['elementRegist9']){
  var effectValue = valueItems[i].meta['elementRegist9'];
  if(effectValue == 0){
    effectText += `\\C[${colorCode}]九属性完全耐性\\C[0] `;
  } else {
    effectText += `\\C[${colorCode}]九属性耐性\\C[0]${effectValue}% `;
  };
};
if(valueItems[i].meta['StateabNomalResist']){
  var effectValue = valueItems[i].meta['StateabNomalResist'];
  if(effectValue == 0){
    effectText += `\\C[${colorCode}]\\I[683]無効\\C[0] `;
  } else {
    effectText += `\\C[${colorCode}]\\I[683]耐性\\C[0]+${effectValue}% `;
  };
};
if(valueItems[i].meta['StateSPabNomalResist']){
  var effectValue = valueItems[i].meta['StateSPabNomalResist'];
  if(effectValue == 0){
    effectText += `\\C[${colorCode}]\\I[684]無効\\C[0] `;
  } else {
    effectText += `\\C[${colorCode}]\\I[684]耐性\\C[0]+${effectValue}% `;
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
    var effectValue = valueItems[i].meta['Damage Cap'].replace(' ','');
    effectText += `\\C[16]D.Cap:\\C[0]${effectValue} `;
  };
};
if(valueItems[i].meta['Bypass Heal Cap']){
  effectText += `\\C[16]H.Cap無効\\C[0] `;
} else {
  if(valueItems[i].meta['Heal Cap']){
    var effectValue = valueItems[i].meta['Heal Cap'].replace(' ','');
    effectText += `\\C[16]H.Cap:\\C[0]${effectValue} `;
  };
};
if(valueItems[i].meta['HP Cost']){
  var effectValue = valueItems[i].meta['HP Cost'].replace(' ','');
  effectText += `[\\C[16]HP${effectValue}消費\\C[0]]`;
};
if(valueItems[i].meta['MP Cost']){
  var effectValue = valueItems[i].meta['MP Cost'].replace(' ','');
  effectText += `[\\C[16]MP${effectValue}消費\\C[0]]`;
};
if(valueItems[i].meta['SpcialState']){
  suffixText += `[\\C[${colorCode}]\x1bSIM[110]で発動\\C[0]][\x1bSIM[109]で効果消失]`;
  effectText += `[\\C[${colorCode}]行動時MP消費/消費MP未満で\\I[252]付与\\C[0]]`;
};
if(valueItems[i].meta['activateRate']){
  var effectValue = Math.round(valueItems[i].meta['activateRate'] * 100);
  suffixText += `[消費MP:MMP\\C[10]${effectValue}%\\C[0]]`;
};
if(valueItems[i].meta['activatePoint']){//使ってない？
  var effectValue = valueItems[i].meta['activatePoint'];
  suffixText += `[消費MP:\\C[2]${effectValue}\\C[0]]`;
};
if(valueItems[i].meta['Global Cooldown']){
  var effectValue = Number(valueItems[i].meta['Global Cooldown']);
  suffixText += `[全てのCT:\\C[2]${effectValue}\\C[0]]`;
};
for (var traitDataId = 1; traitDataId <= 15; traitDataId++) {
  var calcTmp = `SType ${traitDataId} Cooldown`;
  if(valueItems[i].meta[calcTmp]){
    if(Number(valueItems[i].meta[calcTmp]) < 0){
      var colorCode = 3;
    } else {
      var colorCode = 1;
    };
    var fragText = `${$dataSystem.skillTypes[traitDataId]}\\C[${colorCode}]\\I[663]${Number(valueItems[i].meta[calcTmp])}`;
    effectText += `[${fragText}\\C[0]]`;
  };
  var calcTmp = `SType ${traitDataId} Warmup`;
  if(valueItems[i].meta[calcTmp]){
    if(Number(valueItems[i].meta[calcTmp]) < 0){
      var colorCode = 3;
    } else {
      var colorCode = 1;
    };
    var fragText = `${$dataSystem.skillTypes[traitDataId]}\\C[${colorCode}]\\I[662]${Number(valueItems[i].meta[calcTmp])}`;
    effectText += `[${fragText}\\C[0]]`;
  };
};
var colorCode = 2;
if(valueItems[i].meta['HP Life Steal Physical'] && valueItems[i].meta['HP Life Steal Magical']){
  var effectValue = valueItems[i].meta['HP Life Steal Physical'].replace(' ','');
  var effectValue = effectValue.replace('%','');
  if(Number(effectValue) >= 1){
    var colorCode = 2;
    effectText += `[\\C[${colorCode}]物理/魔法与Dの${Number(effectValue)}%HP吸収回復\\C[0]]`;
  } else {
    var colorCode = 10;
    effectText += `[\\C[${colorCode}]物理/魔法与Dの${Number(effectValue)}%HP反動ﾀﾞﾒｰｼﾞ\\C[0]]`;
  };
} else {
  if(valueItems[i].meta['HP Life Steal Physical']){
    var effectValue = valueItems[i].meta['HP Life Steal Physical'].replace(' ','');
    var effectValue = effectValue.replace('%','');
    if(Number(effectValue) >= 1){
      var colorCode = 2;
      effectText += `[\\C[${colorCode}]物理与Dの${Number(effectValue)}%HP吸収回復\\C[0]]`;
    } else {
      var colorCode = 10;
      effectText += `[\\C[${colorCode}]物理与Dの${Number(effectValue)}%HP反動ﾀﾞﾒｰｼﾞ\\C[0]]`;
    };
  };
  if(valueItems[i].meta['HP Life Steal Magical']){
    var effectValue = valueItems[i].meta['HP Life Steal Magical'].replace(' ','');
    var effectValue = effectValue.replace('%','');
    if(Number(effectValue) >= 1){
      var colorCode = 2;
      effectText += `[\\C[${colorCode}]魔法与Dの${Number(effectValue)}%HP吸収回復\\C[0]]`;
    } else {
      var colorCode = 10;
      effectText += `[\\C[${colorCode}]魔法与Dの${Number(effectValue)}%HP反動ﾀﾞﾒｰｼﾞ\\C[0]]`;
    };
  };
};
var colorCode = 2;
if(valueItems[i].meta['MP Life Steal Physical'] && valueItems[i].meta['MP Life Steal Magical']){
  var effectValue = valueItems[i].meta['MP Life Steal Physical'].replace(' ','');
  var effectValue = effectValue.replace('%','');
  if(Number(effectValue) >= 1){
    var colorCode = 2;
    effectText += `[\\C[${colorCode}]物理/魔法与Dの${Number(effectValue)}%MP吸収回復\\C[0]]`;
  } else {
    var colorCode = 10;
    effectText += `[\\C[${colorCode}]物理/魔法与Dの${Number(effectValue)}%MP消耗\\C[0]]`;
  };
} else {
  if(valueItems[i].meta['MP Life Steal Physical']){
    var effectValue = valueItems[i].meta['MP Life Steal Physical'].replace(' ','');
    var effectValue = effectValue.replace('%','');
    if(Number(effectValue) >= 1){
      var colorCode = 2;
      effectText += `[\\C[${colorCode}]物理与Dの${Number(effectValue)}%MP吸収回復\\C[0]]`;
    } else {
      var colorCode = 10;
      effectText += `[\\C[${colorCode}]物理与Dの${Number(effectValue)}%MP消耗\\C[0]]`;
    };
  };
  if(valueItems[i].meta['MP Life Steal Magical']){
    var effectValue = valueItems[i].meta['MP Life Steal Magical'].replace(' ','');
    var effectValue = effectValue.replace('%','');
    if(Number(effectValue) >= 1){
      var colorCode = 2;
      effectText += `[\\C[${colorCode}]魔法与Dの${Number(effectValue)}%MP吸収回復\\C[0]]`;
    } else {
      var colorCode = 10;
      effectText += `[\\C[${colorCode}]魔法与Dの${Number(effectValue)}%MP消耗\\C[0]]`;
    };
  };
};
var colorCode = 2;
if(valueItems[i].meta['HP Life Steal']){
  var effectValue = valueItems[i].meta['HP Life Steal'].replace(' ','');
  var effectValue = effectValue.replace('%','');
  effectText += `[\\C[${colorCode}]与Dの${Number(effectValue)}%HP吸収回復\\C[0]]`;
};
if(valueItems[i].meta['MP Life Steal']){
  var effectValue = valueItems[i].meta['MP Life Steal'].replace(' ','');
  var effectValue = effectValue.replace('%','');
  effectText += `[\\C[${colorCode}]与Dの${Number(effectValue)}%HP吸収回復\\C[0]]`;
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
  var effectValue = Number(valueItems[i].meta['SemenRemove']);
  effectText += `[\\C[${colorCode}]状態異常精液${effectValue}つ回復\\C[0]]`;
};
if(valueItems[i].meta['HstaSuppression']){
  var colorCode = 27;
  var metaValues = valueItems[i].meta['HstaSuppression'].split(',');
  var effectValue = Number(metaValues[1]);
  if(Number(metaValues[0]) == 0){
    effectText += `[\\C[${colorCode}]性欲度${effectValue*100}まで\\C[0]][\\C[${colorCode}]各開発/経験度${effectValue}まで\\C[0]]`;
  } else {
    effectText += `[\\C[${colorCode}]${$dataSystem.variables[Number(metaValues[0])]}のランク${effectValue}まで\\C[0]]`;
  };
};
var colorCode = 2;
if(valueItems[i].meta['TPGain1']){
  var effectValue = valueItems[i].meta['TPGain1'];
  effectText += `[\\C[${colorCode}]TP${effectValue}%\\C[0]]`;
};
if(valueItems[i].meta['gainExp']){
  var effectValue = valueItems[i].meta['gainExp'];
  effectText += `[\\C[${colorCode}]獲得Exp:${effectValue}%\\C[0]]`;
};
for (var traitDataId = 1; traitDataId <= 6; traitDataId++) {
  if(valueItems[i].meta['Skill Tier ' + traitDataId + ' Slots']){
    var effectValue = valueItems[i].meta['Skill Tier ' + traitDataId + ' Slots'].replace(' ','');
    var colorCode = 16;
    if(traitDataId == 1){var fragText = `Ability装着数`};
    if(traitDataId == 2){var fragText = `Main装着数`};
    if(traitDataId == 3){var fragText = `Job装着数`};
    if(traitDataId == 4){var fragText = `G-Passive装着数`};
    if(traitDataId == 5){var fragText = `Passive装着数`};
    if(traitDataId == 6){var fragText = `H-Passive装着数`};
    effectText += `[\\C[${colorCode}]${fragText}\\C[2]${effectValue}\\C[0]]`;
  };
};
var colorCode = 2;

//称号関係
if(valueItems[i].meta['titleGetSwitch']){
  var effectValue = Number(valueItems[i].meta['titleGetSwitch']);
  if(effectValue == 2 || valueItems[i].meta['DescriptionWord']){}else{
    effectText += `\\C[${colorCode}][条件:${$dataSystem.switches[effectValue]}]\\C[0]`;
  };
};
if(valueItems[i].meta['titleGetVariable']){
  var metaValues = valueItems[i].meta['titleGetVariable'].split(',');
  if(valueItems[i].meta['DescriptionWord']){}else{
    effectText += `\\C[${colorCode}][条件:${$dataSystem.variables[Number(metaValues[0])]}:${Number(metaValues[1])}]\\C[0]`;
  };
};
if(valueItems[i].meta['titleGetArray']){
  var metaValues = valueItems[i].meta['titleGetArray'].split(',');
  if(valueItems[i].meta['DescriptionWord']){}else{
    if(Number(metaValues[0]) == 52){
      effectText += `\\C[${colorCode}][条件:\x1bSIM[${Number(metaValues[1])}]:${Number(metaValues[2])}体討伐]\\C[0]`;
    };
  };
};
if(valueItems[i].meta['titleGetItems']){
  var metaValues = valueItems[i].meta['titleGetItems'].split(',');
  if(valueItems[i].meta['DescriptionWord']){}else{
    effectText += `\\C[${colorCode}][条件:\x1bIIN[${Number(metaValues[0])}]:${Number(metaValues[1])}個]\\C[0]`;
  };
};
if(valueItems[i].meta['titleGetSkillRank']){
  var metaValues = valueItems[i].meta['titleGetSkillRank'].split(',');
  effectText += `\\C[${colorCode}][条件:パーティの誰かが\x1bSIN[${Number(metaValues[0])}]Rank:${Number(metaValues[1])}以上]\\C[0]`;
};
if(valueItems[i].meta['titleGetAchievement']){
  var metaValues = valueItems[i].meta['titleGetAchievement'].split(',');
  if(valueItems[i].meta['DescriptionWord']){}else{
    if(Number(metaValues[0]) == 1){var effectValue = `TotalKill`};
    if(Number(metaValues[0]) == 2){var effectValue = `MaxAssalt`};
    if(Number(metaValues[0]) == 3){var effectValue = `TotalAssalt`};
    if(Number(metaValues[0]) == 4){var effectValue = `TotalOverKill`};
    if(Number(metaValues[0]) == 5){var effectValue = `MaxDamage`};
    if(Number(metaValues[0]) == 6){var effectValue = `TotalDamage`};
    if(Number(metaValues[0]) == 7){var effectValue = `Defead`};
    if(Number(metaValues[0]) == 8){var effectValue = `AttackCount`};
    if(Number(metaValues[0]) == 9){var effectValue = `S-AbilityCount`};
    if(Number(metaValues[0]) == 10){var effectValue = `A-AbilityCount`};
    if(Number(metaValues[0]) == 11){var effectValue = `W-AbilityCount`};
    if(Number(metaValues[0]) == 12){var effectValue = `R-AbilityCount`};
    if(Number(metaValues[0]) == 13){var effectValue = `BurstCount`};
    if(Number(metaValues[0]) == 14){var effectValue = `ChainCount`};
    if(Number(metaValues[0]) == 15){var effectValue = `TotalDefead`};
    if(Number(metaValues[0]) == 16){var effectValue = `CriticalCount`};
    if(valueItems[i].meta['KojinTitle']){effectValue += `[個人]`};
    effectText += `\\C[${colorCode}][条件:${effectValue}:${Number(metaValues[1])}]\\C[0]`;
  };
};
if(valueItems[i].meta['HtitleGetArray']){
  var metaValues = valueItems[i].meta['HtitleGetArray'].split(',');
  if(valueItems[i].meta['DescriptionWord']){}else{
    effectText += `\\C[${colorCode}][条件:${$dataSystem.variables[Number(metaValues[0]) + 400]}:${Number(metaValues[1])}]\\C[0]`;
  };
};
if(valueItems[i].meta['annihilationTitle']){
  var metaValues = valueItems[i].meta['annihilationTitle'].split(',');
  if(Number(metaValues[0]) >= 20 && $dataItems[Number(metaValues[0])]){
    var effectValue = `\\C[1]<${$dataItems[Number(metaValues[0])].name}>\\C[0]殲滅回数:\\C[10]${Number(metaValues[1])}\\C[0]回以上`;
  };
  if(Number(metaValues[0]) == 1){
    var effectValue = `\\C[1]<全マップ>\\C[0]の総殲滅回数:\\C[10]${Number(metaValues[0])}\\C[0]回以上`;
  };
  if(Number(metaValues[0]) == 2){
    var effectValue = `\\C[1]<全ダンジョン>\\C[0]の総殲滅回数:\\C[10]${Number(metaValues[0])}\\C[0]回以上`;
  };
    effectText += `\\C[${colorCode}][条件:${effectValue}\\C[${colorCode}]]\\C[0]`;
};
if(valueItems[i].meta['PassivePlusTrait']){
  var metaValues = valueItems[i].meta['PassivePlusTrait'].split(',');
  if(Number(metaValues[0]) == 11){
    var effectValue = Number(metaValues[2]);
    if(effectValue >= 0){
      effectText += `[\\C[${colorCode}]${$dataSystem.elements[Number(metaValues[1])]}\\C[0]ダメージ耐性${Math.round(effectValue * 100)}%Down]`;
    } else {
      var effectValue = effectValue - effectValue - effectValue;
      effectText += `[\\C[${colorCode}]${$dataSystem.elements[Number(metaValues[1])]}\\C[0]ダメージ耐性${Math.round(effectValue * 100)}%Up]`;
    };
  };
};
if(valueItems[i].meta['PassivePlusEffect']){//PassiveCondi
  var metaValues = valueItems[i].meta['PassivePlusEffect'].split(',');
  if(Number(metaValues[0]) == 0){
    var effectValue = TextManager.param(Number(metaValues[1]));
  };
  if(Number(metaValues[0]) == 1){
    var effectValue = FTKR.CSS.cssStatus.xparam[Number(metaValues[1])];
  };
  if(Number(metaValues[0]) == 2){
    var effectValue = FTKR.CSS.cssStatus.sparam[Number(metaValues[1])];
  };   
  effectText += `[\\C[${colorCode}]${effectValue}\\C[0]+${Math.round(Number(metaValues[2]) * 100)}%]`;
};
//称号効果
if(valueItems[i].meta['titleEffectConfiVal']){
  var metaValues = valueItems[i].meta['titleEffectConfiVal'].split(',');
  if(valueItems[i].meta['DescriptionWord']){}else{
    effectText += `[\\C[${colorCode}]${$dataSystem.variables[Number(metaValues[0])]}:+${Number(metaValues[1])}\\C[0]]`;
  };
};
if(valueItems[i].meta['titleEffectConfiSwi']){
  var effectValue = Number(valueItems[i].meta['titleEffectConfiSwi']);
  effectText += `[\\C[${colorCode}]${$dataSystem.switches[effectValue]}\\C[0]]`;
};

if(valueItems[i].meta['titleSenkaGet']){
  var effectValue = Number(valueItems[i].meta['titleSenkaGet']);
  effectText += `[\\C[${colorCode}]\x1bIIN[10]+${effectValue}\\C[0]]`;
};
for (var traitDataId = 1; traitDataId <= 9; traitDataId++) {
if(valueItems[i].meta['titleEffect'+traitDataId]){
  var metaValues = valueItems[i].meta['titleEffect'+traitDataId].split(',');
  if(Number(metaValues[0]) == 0){
    var effectValue = TextManager.param(Number(metaValues[1]));
  };
  if(Number(metaValues[0]) == 1){
    var effectValue = FTKR.CSS.cssStatus.xparam[Number(metaValues[1])];
  };
  if(Number(metaValues[0]) == 2){
    var effectValue = FTKR.CSS.cssStatus.sparam[Number(metaValues[1])];
  };
  if(Number(metaValues[0]) == 3){
    var effectValue = `${$dataSystem.elements[Number(metaValues[1])]}`;
    if([18,19,51,52,53,54,55,56,57,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80].some(function(id){return id == Number(metaValues[1])})){
      effectValue += `特攻`;
    };
    effectValue += `威力`;
  };
  if(Number(metaValues[0])==4){
    effectText += `${$dataSystem.elements[Number(metaValues[1])]}`;
    if([10,11,12,15,20,38,39,40,41].some(function(elementId){return elementId == Number(metaValues[1])})){
    }else{
      var effectValue = `耐性`;
    };
  };
    if(Number(metaValues[2]) < 0){
      var calcTmp = Number(metaValues[2]) - Number(metaValues[2]) - Number(metaValues[2]);
    } else {
      var calcTmp = Number(metaValues[2]);
    };
    var fragText = `\\C[2]${calcTmp * 100}\\C[0]%`;
    var colorCode = 1;
    effectText += `[\\C[${colorCode}]${effectValue}\\C[0]+${fragText}]`;
    var colorCode = 2;
};
};
//食事バフ
for (var traitDataId = 1; traitDataId <= 9; traitDataId++) {
if(valueItems[i].meta['eatEffect'+traitDataId]){
  var metaValues = valueItems[i].meta['eatEffect'+traitDataId].split(',');
  if(Number(metaValues[0]) == 0){
    var effectValue = TextManager.param(Number(metaValues[1]));
  };
  if(Number(metaValues[0]) == 1){
    var effectValue = FTKR.CSS.cssStatus.xparam[Number(metaValues[1])];
  };
  if(Number(metaValues[0]) == 2){
    var effectValue = FTKR.CSS.cssStatus.sparam[Number(metaValues[1])];
  };
  if(Number(metaValues[0]) == 3){
    var effectValue = `${$dataSystem.elements[Number(metaValues[1])]}`;
    if([18,19,51,52,53,54,55,56,57,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80].some(function(id){return id == Number(metaValues[1])})){
      effectValue += `特攻`;
    };
    effectValue += `威力`;
  };
  if(Number(metaValues[0])==4){
    effectText += `${$dataSystem.elements[Number(metaValues[1])]}`;
    if([10,11,12,15,20,38,39,40,41].some(function(elementId){return elementId == Number(metaValues[1])})){
    }else{
      var effectValue = `耐性`;
    };
  };
  if(Number(metaValues[2]) < 0){
    var calcTmp = Number(metaValues[2]) - Number(metaValues[2]) - Number(metaValues[2]);
  } else {
    var calcTmp = Number(metaValues[2]);
  };
  var fragText = `\\C[2]${calcTmp * 100}\\C[0]%`;
  var colorCode = 1;
  effectText += `[\\C[${colorCode}]${effectValue}\\C[0]+${fragText}]`;
  var colorCode = 2;
};
};
//娼婦系説明文
if(valueItems[i].meta['ProstitutionMoneyUp']){
    var effectValue = valueItems[i].meta['ProstitutionMoneyUp'];
    effectText += `\\C[27]売春額に${effectValue}倍補正\\C[0] `;
};
if(valueItems[i].meta['BustSizeChange']){
    var effectValue = valueItems[i].meta['BustSizeChange'];
    effectText += `\\C[27]BustSize+${effectValue}cm\\C[0] `;
};
if(valueItems[i].meta['HipSizeChange']){
    var effectValue = valueItems[i].meta['HipSizeChange'];
    effectText += `\\C[27]HipSize+${effectValue}cm\\C[0] `;
};
if(valueItems[i].meta['BodyWeightChange']){
    var effectValue = valueItems[i].meta['BodyWeightChange'];
    effectText += `\\C[27]BodyWeight+${effectValue}kg\\C[0] `;
};

if(valueItems[i].meta['下級鑑定品'] || valueItems[i].meta['中級鑑定品'] || valueItems[i].meta['上級鑑定品']){
  var fragText = `\\C[3][未鑑定品]\\C[0]`;
    if(valueItems[i].meta['下級鑑定品']){fragText += `\\C[${colorCode}][下級]\\C[0]`};
    if(valueItems[i].meta['中級鑑定品']){fragText += `\\C[${colorCode}][中級]\\C[0]`};
    if(valueItems[i].meta['上級鑑定品']){fragText += `\\C[${colorCode}][上級]\\C[0]`};
      effectText += `${fragText} `;
};

if(valueItems[i].meta['walletIn']){
  var effectValue = valueItems[i].meta['BodyWeightChange'];
  effectText += `\\C[${colorCode}][使用で\\G入手]\\C[0] `;
};
if(valueItems[i].meta['QuestSetMap']){
  if(Number(valueItems[i].meta['QuestSetMap']) == 0){
    var effectValue = `[常設]`;
  } else {
    var effectValue = $dataSystem.switches[Number(valueItems[i].meta['QuestSetMap'])];
  };
  var colorCode = 16;
  effectText += `[\\C[${colorCode}]受注\\C[0]:\\C[2]${effectValue}\\C[0]] `;
  var colorCode = 2;
};
if(valueItems[i].meta['QuestSubjectMap']){
  var effectValue = $dataSystem.switches[Number(valueItems[i].meta['QuestSubjectMap'])];
  var colorCode = 16;
  effectText += `[\\C[${colorCode}]対象\\C[0]:\\C[2]${effectValue}\\C[0]]\n`;
  var colorCode = 2;
};
if(valueItems[i].meta['QuestSuitableLv']){
    var effectValue = Number(valueItems[i].meta['QuestSuitableLv']);
    var colorCode = 16;
    effectText += `[\\C[${colorCode}]適正Lv\\C[0]:\\C[2]${effectValue}\\C[0]] `;
    var colorCode = 2;
} else {
  if(valueItems[i].meta['QuestSubjectMap']){
    var effectValue = Number(valueItems[i].meta['QuestSubjectMap']);
    for (var traitDataId = 1; traitDataId <= $dataItems.length-1; traitDataId++) {
      if($dataItems[traitDataId].meta['MapSwitch']){
        if(Number($dataItems[traitDataId].meta['MapSwitch']) == effectValue){
          if($dataItems[traitDataId].meta['EnemyLV']){
            var metaValues = $dataItems[traitDataId].meta['EnemyLV'].split(',');
            var fragText = Math.min(...metaValues);
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
  var effectValue = Number(valueItems[i].meta['Stuff']);
  effectText += `\\C[${colorCode}][満腹度+${effectValue}（${$gameVariables.value(16)}/${$gameVariables.value(13)}）]\\C[0] `;
};
if(valueItems[i].meta['ＴＰ']){
  var effectValue = Number(valueItems[i].meta['ＴＰ']);
  effectText += `\\C[${colorCode}][TP+${effectValue}]\\C[0] `;
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
if(valueItems[i].meta['AddPowerCustom']){
  var effectValue = Number(valueItems[i].meta['AddPowerCustom']);
    if(effectValue >= 1){
      effectText += `\\I[666]+${effectValue} `;
    };
};
if(valueItems[i].meta['RaceDropRarity']){
  var effectValue = Number(valueItems[i].meta['RaceDropRarity']);
    //if(value3 == 1){value10 += `[種族エネミーLv20までドロップ]`};
    //if(value3 == 2){value10 += `[種族エネミーLv40までドロップ]`};
    //if(value3 == 3){value10 += `[種族エネミーLv60までドロップ]`};
    //if(value3 == 4){value10 += `[種族エネミーLv80までドロップ]`};
    //if(value3 == 5){value10 += `[種族エネミーLv20-100までドロップ]`};
    if(effectValue == 6){effectText += `[種族エネミーLv20からドロップ]`};
    if(effectValue == 7){effectText += `[種族エネミーLv30からドロップ]`};
    if(effectValue == 8){effectText += `[種族エネミーLv40からドロップ]`};
    if(effectValue == 9){effectText += `[種族エネミーLv50からドロップ]`};
    if(effectValue == 10){effectText += `[種族エネミーLv50からドロップ]`};
};
if(valueItems[i].meta['PartyExpRate']){
  var effectValue = valueItems[i].meta['PartyExpRate'];
  effectText += `\\I[296]${effectValue}倍 `;
};
if(valueItems[i].meta['PartyGoldRate']){
  var effectValue = valueItems[i].meta['PartyGoldRate'];
  effectText += `\\I[314]${effectValue}倍 `;
};
if(valueItems[i].meta['EnemyExpRate']){
  var effectValue = valueItems[i].meta['EnemyExpRate'];
  effectText += `\\I[296]${effectValue}倍 `;
};
if(valueItems[i].meta['EnemyGoldRate']){
  var effectValue = valueItems[i].meta['EnemyGoldRate'];
  effectText += `\\I[314]${effectValue}倍 `;
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

if(databaseTypeId == 4){
  if(valueItems[i].meta['registUp']){
    var effectValue = valueItems[i].meta['registUp'];
    effectText += `[\\C[${colorCode}]付与時に耐性率${effectValue}%up\\C[0]]`;
  };
  if(valueItems[i].autoRemovalTiming >= 1){
    var fragText = `\\I[75]:${valueItems[i].minTurns}`;
      if(valueItems[i].minTurns != valueItems[i].maxTurns){
        fragText += `～${valueItems[i].maxTurns}`;
      };
      effectText += `[${fragText}] `;
  } else {
    var effectValue = 0;
    if(valueEquipPassiveSkill.length >= 1){
      for (var traitDataId = 0; traitDataId <= valueEquipPassiveSkill.length-1; traitDataId++) {
        if(valueEquipPassiveSkill[traitDataId] == i){
          var effectValue = 1;
        };
      };
    };
    if(valueEquipPassiveWeapon.length >= 1){
      for (var traitDataId = 0; traitDataId <= valueEquipPassiveWeapon.length-1; traitDataId++) {
        if(valueEquipPassiveWeapon[traitDataId] == i){
          var effectValue = 1;
        };
      };
    };
    if(valueEquipPassiveArmor.length >= 1){
      for (var traitDataId = 0; traitDataId <= valueEquipPassiveArmor.length-1; traitDataId++) {
        if(valueEquipPassiveArmor[traitDataId] == i){
          var effectValue = 1;
        };
      };
    };
    if(effectValue == 0){
      effectText += `[\\I[75]:∞] `;
    };
  };

};
if(databaseTypeId == 4){var descWordText = `　${descWordText}`};
if(databaseTypeId != 4){
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
if(databaseTypeId == 0 || databaseTypeId == 1 || databaseTypeId == 2 || databaseTypeId == 3){
  valueItems[i].description = tempDesc;
};
if(databaseTypeId == 4){//ステートとジョブは解説入れてる分のみに適用するため。
  if(valueItems[i].meta['Help Description']){
    valueItems[i].description = tempDesc;
}};
if(!valueItems[i].meta['NoAddDescription']){
  if(databaseTypeId == 5){//ステートとジョブは解説入れてる分のみに適用するため。
    if(valueItems[i].meta['Help Description']){
      valueItems[i].description = `${headerText}${valueItems[i].description}${suffixText}${effectText}`;
}}};

//解説では無く実際に影響のある処理。解説に反映させたくないもの。
if(databaseTypeId == 1 || databaseTypeId == 2 || databaseTypeId == 4 || databaseTypeId == 5){//スキルタイプ4封印で5-8までまとめて封印。
  for (var traitIndex = 0; traitIndex <= 19; traitIndex++) {
    if(valueItems[i].traits[traitIndex]){
      if(valueItems[i].traits[traitIndex].code == 42){ 
        if(valueItems[i].traits[traitIndex].dataId == 4){
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
          var metaValues = $dataSkills[i].meta['NormalAttackDerived'].split(',');
          descText += `[ランク${metaValues[0]}で\\C[2]${$dataSkills[Number(metaValues[1])].name}\\C[0]が派生発生]`
        };
        if($dataSkills[i].meta['NormalAttackDerivedSuper']){
          var metaValues = $dataSkills[i].meta['NormalAttackDerivedSuper'].split(',');
          descText += `[ランク${metaValues[0]}と特殊条件を満たす事で\\C[2]${$dataSkills[Number(metaValues[1])].name}\\C[0]が派生発生]`
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
        var metaValues = $dataSkills[i].meta['NormalAttackDerived'].split(',');
        descText += `[ランク${metaValues[0]}で\\C[2]${$dataSkills[Number(metaValues[1])].name}\\C[0]が派生発生]`
      } else {
        descText += ``;
      };
      valueAddDescriptionSkill[i-800] = `${descText}`;
}};

};

recoveryEffectMsg = function (ind1,ind2) {
	const obj1 = `\\I[ind1]`;
	const obj2 = `\\I[ind2]`;
	const effectName = `回復`;
	const extraEffectMsg = `対象の${obj2}も影響`;
	return `[\\C[3]${effectName}:${obj1}100%(${extraEffectMsg})\\C[0]`;
}

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
    var classGrowthStats = valuePeplesStatas;
    if(Number($dataClasses[i].meta['Icon']) == 353){var classGrowthStats = valueActor1Statas};
    if(Number($dataClasses[i].meta['Icon']) == 354){var classGrowthStats = valueActor2Statas};
    if(Number($dataClasses[i].meta['Icon']) == 355){var classGrowthStats = valueActor3Statas};
    if(Number($dataClasses[i].meta['Icon']) == 356){var classGrowthStats = valueActor4Statas};
    if(Number($dataClasses[i].meta['Icon']) == 357){var classGrowthStats = valueActor5Statas};
//ここまでメインクラス
    if(Number($dataClasses[i].meta['Icon']) == 97){var classGrowthStats = valueFighterStatas};
    if(Number($dataClasses[i].meta['Icon']) == 107){var classGrowthStats = valueNightStatas};
    if(Number($dataClasses[i].meta['Icon']) == 108){var classGrowthStats = valuePriestStatas};
    if(Number($dataClasses[i].meta['Icon']) == 101){var classGrowthStats = valueMagicianStatas};
    if(Number($dataClasses[i].meta['Icon']) == 115){var classGrowthStats = valueThiefStatas};
    if(Number($dataClasses[i].meta['Icon']) == 96){var classGrowthStats = valueEnhancerStatas};
    if(Number($dataClasses[i].meta['Icon']) == 106){var classGrowthStats = valueGrapplerStatas};
    if(Number($dataClasses[i].meta['Icon']) == 120){var classGrowthStats = valueSamuraiStatas};
    if(Number($dataClasses[i].meta['Icon']) == 102){var classGrowthStats = valueRangerStatas};
    if(Number($dataClasses[i].meta['Icon']) == 199){var classGrowthStats = valueHarpistStatas};
    if(Number($dataClasses[i].meta['Icon']) == 99){var classGrowthStats = valueDestroyerStatas};
    if(Number($dataClasses[i].meta['Icon']) == 554){var classGrowthStats = valueSlaveStatas};
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
      descText += `[GrowStatas:\\C[16]Mhp\\C[10]${Number(classGrowthStats[0])*classRankVal}\\C[0],\\C[16]Mmp\\C[10]${Number(classGrowthStats[1])*classRankVal}\\C[0],\\C[16]Atk\\C[10]${Number(classGrowthStats[2])*classRankVal}\\C[0],\\C[16]Def\\C[10]${Number(classGrowthStats[3])*classRankVal}\\C[0],\\C[16]Mag\\C[10]${Number(classGrowthStats[4])*classRankVal}\\C[0],\\C[16]Dex\\C[10]${Number(classGrowthStats[5])*classRankVal}\\C[0],\\C[16]Agi\\C[10]${Number(classGrowthStats[6])*classRankVal}\\C[0],\\C[16]Luk\\C[10]${Number(classGrowthStats[7])*classRankVal}\\C[0]]\n`;
      valueClassGrowStatasComparison[i] += `:\\C[16]Mhp\\C[10]${Number(classGrowthStats[0])*classRankVal}\\C[0],\\C[16]Mmp\\C[10]${Number(classGrowthStats[1])*classRankVal}\\C[0],\\C[16]Atk\\C[10]${Number(classGrowthStats[2])*classRankVal}\\C[0],\\C[16]Def\\C[10]${Number(classGrowthStats[3])*classRankVal}\\C[0],\\C[16]Mag\\C[10]${Number(classGrowthStats[4])*classRankVal}\\C[0],\\C[16]Dex\\C[10]${Number(classGrowthStats[5])*classRankVal}\\C[0],\\C[16]Agi\\C[10]${Number(classGrowthStats[6])*classRankVal}\\C[0],\\C[16]Luk\\C[10]${Number(classGrowthStats[7])*classRankVal}\\C[0]]`;
        for (var learningIndex = 0; learningIndex <= 10; learningIndex++) {
          if($dataClasses[i].learnings[learningIndex]){
            if($dataClasses[i].meta['Primary Only']){
              if($dataClasses[i].learnings[learningIndex].level >= $gameVariables.value(6)){
                descText += `[Lv${$dataClasses[i].learnings[learningIndex].level}:\\C[2]\x1bSIN[${$dataClasses[i].learnings[learningIndex].skillId}]\\C[0]]`;
              };
            } else {
              descText += `[Lv${$dataClasses[i].learnings[learningIndex].level}:\\C[2]\x1bSIN[${$dataClasses[i].learnings[learningIndex].skillId}]\\C[0]]`;
            };
          };
        };
      valueAddDescriptionClass[i] = `${descText}`;
}};

};

//}());
