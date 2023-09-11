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

var value10 = ``;
var value11 = ``;
var value16 = 0;
var value18 = ``;
var value19 = 0;//追加説明するかどうか
var value20 = 0;//武器種計算
var value21 = 0;//物理魔法ダメージカット。数値が同一かどうか
var value22 = 0;//物理魔法ダメージカット
var value23 = 0;//物理魔法ダメージカット。１個めかどうか
var value24 = 0;//スキル効果。同じ効果が連続で存在する時
var value25 = 0;//スキル効果。同じ効果が連続で存在する時。カウント用
var value26 = 2;//カラー設定。通常は２．変更時はその直後に２に戻す。
var value27 = 0;//計算用
var value28 = ``;//説明文前段の後半部分に付記する文言
var value29 = ``;//説明文直前代入時に一時代入する
var value30 = 0;//DescriptionWord用
var arr11 = [];
var arr12 = [];

if(valueItems[i].name == ''){
var value19 = 1;
};

if(id1 == 1 && valueItems[i].wtypeId == 0){
var value19 = 1;
};

if(value19 == 0){

if(id1 == 1 || id1 == 2){
  var value11 = `[\\C[${value26}]分類\\C[0]:${$dataSystem.equipTypes[valueItems[i].etypeId]}]`;
    if(id1 == 1 && valueItems[i].wtypeId >= 1){
      var value17 = $dataSystem.weaponTypes[valueItems[i].wtypeId];
      value11 += `[\\C[${value26}]種別\\C[0]:${value17}]`
    };
    if(id1 == 2 && valueItems[i].atypeId >= 1){value11 += `[\\C[${value26}]種別\\C[0]:${$dataSystem.armorTypes[valueItems[i].atypeId]}]`};
if(id1 == 1 || id1 == 2){
  if(valueItems[i].meta['LotteryRearity']){
    value11 += `[\\I[517]:${Number(valueItems[i].meta['LotteryRearity'])}]`;
}};
};

if(id1 == 1 || id1 == 2 || id1 == 4 || id1 == 5){

  for (var id4 = 0; id4 <= 9; id4++) {//十種武器
    if(valueItems[i].traits[id4]){
      if(valueItems[i].traits[id4].code == 51){
        value20 += 1;
  }}};
  if(value20 >= 10){
    var value9 = `\\C[${value26}]武器種:\\C[0]十種武器`;
    value10 += `${value9} `;
  };

  var value3 = 0;
  var value27 = 0;
  for (var id4 = 0; id4 <= 7; id4++) {//ステアップALLで纏める
    if(valueItems[i].traits[id4]){
      if(valueItems[i].traits[id4].code == 21){
        value16 += 1;
        if(value3 == valueItems[i].traits[id4].value){
          var value3 = valueItems[i].traits[id4].value;
          value27 += 1;
        };
  }}};
  if(value16 == 5){
           if(valueItems[i].traits[4].value >= 1){
              var value9 = `\\I[658]+`;
              var value3 = Math.round((valueItems[i].traits[4].value - 1) * 100);
            } else {
              var value9 = `\\I[674]-`;
              var value3 = Math.round((1 - valueItems[i].traits[4].value) * 100);
            };
            if(value27 >= 2){
              value10 += `${value9} `;
            } else {
              value10 += `${value9}${value3}% `;
            };
  };
  if(value16 == 8){
           if(valueItems[i].traits[7].value >= 1){
              var value9 = `\\I[659]+`;
              var value3 = Math.round((valueItems[i].traits[7].value - 1) * 100);
            } else {
              var value9 = `\\I[675]-`;
              var value3 = Math.round((1 - valueItems[i].traits[7].value) * 100);
            };
            if(value27 >= 2){
              value10 += `${value9} `;
            } else {
              value10 += `${value9}${value3}% `;
            };
  };

  for (var id4 = 0; id4 <= 1; id4++) {//物理魔法ダメージカット
    if(valueItems[i].traits[id4]){
      if(valueItems[i].traits[id4].code == 23){
        if(valueItems[i].traits[id4].dataId == 6 || valueItems[i].traits[id4].dataId == 7){
          if(value23 == 0){
          var value21 = valueItems[i].traits[id4].value;
          };
            if(value23 == 0 || value21 == valueItems[i].traits[id4].value){
              value22 += 1;
            };
            value23 += 1;        
  }}}};

  if(value22 == 2){
    if(valueItems[i].traits[1].value >= 1){
      var value9 = `\\I[654]\\I[655]-`;
      var value3 = Math.round((valueItems[i].traits[1].value - 1) * 100);
    } else {
      var value9 = `\\I[638]\\I[639]+`;
      var value3 = Math.round((1 - valueItems[i].traits[1].value) * 100);
    };
    value10 += `${value9}${value3}% `;
  };

  for (var id2 = 0; id2 <= 19; id2++) {
    if(valueItems[i].traits[id2]){
      if(valueItems[i].traits[id2].code == 31){
        for (var id3 = 1; id3 <= $dataSystem.elements.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            amygame_elementIcon(id3);
              var value3 = Math.round((valueItems[i].traits[id2].value - 1) * 100);
              if(valueElementIconArr[0] >= 1){
                var value9 = `${valueElementIconArr[1]}`;
              } else {
                var value9 = `\x1bI[${valueElementIconArr[1]}]`;
              };
              if(valueItems[i].meta['EnemyState']){}else{
                if([18,19,51,52,53,54,55,56,57,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,82,83].some(function(id){return id == id3})){
                  value10 += `\\C[${value26}]特攻属性付与\\C[0]${value9} `;
                } else {
                  value10 += `\\C[${value26}]攻撃属性付与\\C[0]${value9}\\C[${value26}] `;
                };
              };
      }}};

      if(valueItems[i].traits[id2].code == 11){
        for (var id3 = 1; id3 <= $dataSystem.elements.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            amygame_elementIcon(id3);
              if(valueElementIconArr[0] >= 1){
                var value9 = `${valueElementIconArr[1]}`;
              } else {
                if(valueItems[i].traits[id2].value >= 1){
                  var value3 = Math.round((valueItems[i].traits[id2].value - 1) * 100);
                  if(id3 == 11){var value3 = Math.round((valueItems[i].traits[id2].value - 1) * 10)};
                    if( [10,11,12,15,20,38,39,40,41].some(function(id){return id == id3}) ){
                      var value9 = `\x1bI[${valueElementIconArr[3]}]+`;
                    } else {
                      var value9 = `\x1bI[${valueElementIconArr[3]}]耐性-`;
                    };
                } else {
                  var value3 = Math.round((1 - valueItems[i].traits[id2].value) * 100);
                  if(id3 == 11){var value3 = Math.round((1 - valueItems[i].traits[id2].value) * 10)};
                    if( [10,11,12,15,20,38,39,40,41].some(function(id){return id == id3}) ){
                      var value9 = `\x1bI[${valueElementIconArr[3]}]-`;
                    } else {
                      var value9 = `\x1bI[${valueElementIconArr[3]}]耐性+`;
                    };
                };
              };
              if([35,37,38,41].some(function(id){return id == id3})){}else{
                if( [41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80].some(function(id){return id == id3}) ){
                  if(valueItems[i].meta['EnemyState']){}else{
                    value10 += `${value9}${value3}% `;
                  };
                } else {
                    value10 += `${value9}${value3}% `;
                };
              };
      }}};

      if(valueItems[i].traits[id2].code == 12){
        for (var id3 = 0; id3 <= 7; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            if(valueItems[i].traits[id2].value >= 1){
              var value3 = Math.round((valueItems[i].traits[id2].value - 1) * 100);
              var value9 = `\\C[1]耐性-\\C[0]\x1bI[${id3 + 48}]`;
            } else {
              var value3 = Math.round((1 - valueItems[i].traits[id2].value) * 100);
              var value9 = `\\C[${value26}]耐性+\\C[0]\x1bI[${id3 + 48}]`;
            };
              value10 += `${value9}${value3}% `;
      }}};

      if(valueItems[i].traits[id2].code == 13){
        for (var id3 = 1; id3 <= $dataStates.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            if(valueItems[i].traits[id2].value >= 1){
              var value3 = Math.round((valueItems[i].traits[id2].value - 1) * 100);
              if($dataStates[id3].iconIndex >= 1){
                var value9 = `\\C[1]耐性-\\C[0]\x1bI[${$dataStates[id3].iconIndex}]`;
              } else {
                var value9 = `\\C[1]耐性-\\C[0]${$dataStates[id3].name}`;
              };
            } else {
              var value3 = Math.round((1 - valueItems[i].traits[id2].value) * 100);
              if($dataStates[id3].iconIndex >= 1){
                var value9 = `\\C[${value26}]耐性+\\C[0]\x1bI[${$dataStates[id3].iconIndex}]`;
              } else {
                var value9 = `\\C[${value26}]耐性+\\C[0]${$dataStates[id3].name}`;
              };
            };
            value10 += `\\C[0]${value9}${value3}% `;
      }}};

      if(valueItems[i].traits[id2].code == 14){
        for (var id3 = 1; id3 <= $dataStates.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            if($dataStates[id3].iconIndex >= 1){
              var value9 = `\x1bI[${$dataStates[id3].iconIndex}]`;
            } else {
              var value9 = `${$dataStates[id3].name}`;
            };
              value10 += `\\C[${value26}]無効化\\C[0]${value9} `;
      }}};

  if(id2 > value16 || value16 <= 4){
      if(valueItems[i].traits[id2].code == 21){
        for (var id3 = 0; id3 <= 7; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            if(valueItems[i].traits[id2].value >= 1){
              var value9 = `\x1bI[${id3 + 32}]+`;
              var value3 = Math.round((valueItems[i].traits[id2].value - 1) * 100);
            } else {
              var value9 = `\x1bI[${id3 + 48}]-`;
              var value3 = Math.round((1 - valueItems[i].traits[id2].value) * 100);
            };
              value10 += `${value9}${value3}% `;
      }}};
  };

      if(valueItems[i].traits[id2].code == 22){
        for (var id3 = 0; id3 <= 9; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            var value12 = 16;var value13 = 16;var value14 = 16;
              if(id3 == 0){var value12 = 630;var value13 = 630;var value14 = 646};
              if(id3 == 1){var value12 = 632;var value13 = 632;var value14 = 648};
              if(id3 == 2){var value12 = 631;var value13 = 631;var value14 = 647};
              if(id3 == 7){var value12 = 640;var value13 = 640;var value14 = 643};
              if(id3 == 8){var value12 = 641;var value13 = 641;var value14 = 644};
              if(id3 == 9){var value12 = 642;var value13 = 642;var value14 = 645};
              if(valueItems[i].traits[id2].value >= 0.01){
                var value9 = `\x1bI[${value13}]+`;
                var value3 = Math.round((valueItems[i].traits[id2].value) * 100);
              } else {
                var value9 = `\x1bI[${value14}]`;
                var value3 = Math.round((valueItems[i].traits[id2].value) * 100);
              };
              value10 += `${value9}${value3}% `;
      }}};

  if(value22 <= 1){
      if(valueItems[i].traits[id2].code == 23){
        for (var id3 = 0; id3 <= 9; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            var value12 = 16;var value13 = 16;var value14 = 16;
              if(id3 == 0){var value12 = 649;var value13 = 649;var value14 = 649};
              if(id3 == 6){var value12 = 654;var value13 = 638;var value14 = 654};
              if(id3 == 7){var value12 = 655;var value13 = 639;var value14 = 655};//ここまでマイナスがプラス効果
              if(id3 == 4){var value12 = 634;var value13 = 634;var value14 = 650};
              if(id3 == 5){var value12 = 635;var value13 = 635;var value14 = 651};
              if(id3 == 9){var value12 = 656;var value13 = 656;var value14 = 672};
              if(valueItems[i].traits[id2].value >= 1){
                if(id3 == 6 || id3 == 7){
                  var value9 = `\x1bI[${value14}]-`;
                } else {
                  var value9 = `\x1bI[${value13}]+`;
                };
                var value3 = Math.round((valueItems[i].traits[id2].value - 1) * 100);
              } else {
                if(id3 == 6 || id3 == 7){
                  var value9 = `\x1bI[${value13}]+`;
                } else {
                  var value9 = `\x1bI[${value14}]-`;
                };
                var value3 = Math.round((1 - valueItems[i].traits[id2].value) * 100);
              };
              value10 += `${value9}${value3}% `;
      }}};
  };

      if(valueItems[i].traits[id2].code == 32){ //31は先頭で実行済み。
        for (var id3 = 1; id3 <= $dataStates.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
                var value3 = Math.round((valueItems[i].traits[id2].value) * 100);
               if(id3 >= 206 && id3 <= 217){
                 if(id3 == 206){var value9 = `\\I[322]`};
                 if(id3 == 207){var value9 = `\\I[323]`};
                 if(id3 == 208){var value9 = `\\I[324]`};
                 if(id3 == 209){var value9 = `\\I[325]`};
                 if(id3 == 210){var value9 = `\\I[326]`};
                 if(id3 == 211){var value9 = `\\I[327]`};
                 if(id3 == 212){var value9 = `\\I[338]`};
                 if(id3 == 213){var value9 = `\\I[339]`};
                 if(id3 == 214){var value9 = `\\I[340]`};
                 if(id3 == 215){var value9 = `\\I[341]`};
                 if(id3 == 216){var value9 = `\\I[342]`};
                 if(id3 == 217){var value9 = `\\I[343]`};
               } else {
                 if($dataStates[id3].iconIndex >= 1){
                   var value9 = `\x1bI[${$dataStates[id3].iconIndex}]`;
                 } else {
                   var value9 = `${$dataStates[id3].name}`;
                 };
               };
              value10 += `\\C[${value26}]ステート付与\\C[0]${value9}${value3}% `;
      }}};

      if(valueItems[i].traits[id2].code == 33){ 
          if(valueItems[i].traits[id2].dataId == 0){
                var value3 = Math.round((valueItems[i].traits[id2].value));
                var value9 = `\\C[${value26}]AttackSpeed+\\C[0]`;
                value10 += `${value9}${value3} `;
      }};

      if(valueItems[i].traits[id2].code == 41){ 
        for (var id3 = 1; id3 <= $dataSystem.skillTypes.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            var value9 = `<${$dataSystem.skillTypes[id3]}>`;
            value10 += `\\C[${value26}]使用可能\\C[0]${value9} `;
      }}};

      if(valueItems[i].traits[id2].code == 42){ 
        for (var id3 = 1; id3 <= $dataSystem.skillTypes.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            var value9 = `<${$dataSystem.skillTypes[id3]}>`;
            value10 += `\\I[626]${value9} `;
      }}};

      if(valueItems[i].traits[id2].code == 43){
        for (var id3 = 1; id3 <= $dataSkills.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            //var value9 = `<${$dataSkills[id3].name}>`;
            var value9 = `<\x1bSIN[${id3}]>`;
              if(id1 == 1 && $dataSkills[id3].stypeId == 12){
                value10 += `\\C[${value26}]Burst\\C[0]${value9} `;
              } else {
                value10 += `\\C[${value26}]使用可能\\C[0]${value9} `;
              };  
      }}};

      if(valueItems[i].traits[id2].code == 44){
        for (var id3 = 1; id3 <= $dataSkills.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            //var value9 = `<${$dataSkills[id3].name}>`;
            var value9 = `<\x1bSIN[${id3}]>`;
            value10 += `\\I[626]${value9} `;
      }}};
  if(value20 <= 9){
      if(valueItems[i].traits[id2].code == 51){
        for (var id3 = 1; id3 <= $dataSystem.weaponTypes.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            var value9 = `<${$dataSystem.weaponTypes[id3]}>`;
            value10 += `\\C[${value26}]武器種\\C[0]${value9} `;
      }}};
  };

      if(valueItems[i].traits[id2].code == 52){
        for (var id3 = 1; id3 <= $dataSystem.armorTypes.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            if(id3 >= 2){
              var value9 = `<${$dataSystem.armorTypes[id3]}>`;
              value10 += `\\C[${value26}]防具種\\C[0]${value9} `;
            };
      }}};

      if(valueItems[i].traits[id2].code == 53){
        for (var id3 = 1; id3 <= $dataSystem.equipTypes.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            var value9 = `<${$dataSystem.equipTypes[id3]}>`;
            value10 += `\\C[1]装備固定\\C[0]${value9} `;
      }}};

      if(valueItems[i].traits[id2].code == 54){
        for (var id3 = 1; id3 <= $dataSystem.equipTypes.length-1; id3++) {
          if(valueItems[i].traits[id2].dataId == id3){
            var value9 = `<${$dataSystem.equipTypes[id3]}>`;
            value10 += `\\C[1]装備封印\\C[0]${value9} `;
      }}};

      if(valueItems[i].traits[id2].code == 61){ 
          if(valueItems[i].traits[id2].dataId == 0){
                var value3 = Math.round((valueItems[i].traits[id2].value) * 100);
                var value9 = `\\C[${value26}]行動回数追加\\C[0]`;
                value10 += `${value9}${value3}% `;
      }};

    };
  };

};//ここまで特徴コード。武器防具ステート。スキルはtraitsではなくeffectsなので下で実行

if(valueItems[i].meta['HSkillLearn']){
      var value12 = 0;
      value10 += `[条件:`;
  for (var id3 = 1; id3 <= 3; id3++) {
    if(valueItems[i].meta['PremiseSkill' + id3]){
      var value3 = Number(valueItems[i].meta['PremiseSkill' + id3]);
      var value9 = `${$dataSkills[value3].name}`;
      value10 += `\\C[27]<${value9}>\\C[0]習得`;
      var value12 = 1;
    };
    if(valueItems[i].meta['PremiseSkillRank' + id3]){
      var value3 = Number(valueItems[i].meta['PremiseSkillRank' + id3].split(',')[0]);
      var value9 = Number(valueItems[i].meta['PremiseSkillRank' + id3].split(',')[1]);
      value10 += `\\C[27]<${$dataSkills[value3].name}>\\C[0]Rank:\\C[27]${value9}\\C[0]到達`;
      var value12 = 1;
    };
    if(valueItems[i].meta['PremiseVariable' + id3]){
      var value3 = Number(valueItems[i].meta['PremiseVariable' + id3].split(',')[0]);
      var value3 = `${$dataSystem.variables[value3]}`;
      var value3 = value3.replace("　", "");
      var value3 = value3.replace("　", "");
      var value3 = value3.replace("　", "");
      var value3 = value3.replace(" ", "");
      var value3 = value3.replace(":", "");
      var value9 = Number(valueItems[i].meta['PremiseVariable' + id3].split(',')[1]);
      value10 += `\\C[27]${value3}\\C[0]:\\C[27]${value9}\\C[0]以上`;
      var value12 = 1;
    };
    if(valueItems[i].meta['PremiseArrangement' + id3]){
      var value3 = Number(valueItems[i].meta['PremiseArrangement' + id3].split(',')[0]);
      var value9 = Number(valueItems[i].meta['PremiseArrangement' + id3].split(',')[1]);
      value10 += `\\C[27]${valueHentaiArrangement[value3]}\\C[0]:\\C[27]${value9}\\C[0]以上`;
      var value12 = 1;
    };
  };
    if(value12 == 0){
      var value9 = `なし`;
      value10 += `\\C[27]${value9}\\C[0]`;
    };
      value10 += `]`;
};

if(valueItems[i].meta['DescriptionWord']){
  var value9 = `${valueItems[i].meta['DescriptionWord']}`;
    if(id1 == 3 && valueItems[i].stypeId == 15){
      var value30 = `\\C[27][${value9}]\\C[0] `;
    } else {
      var value30 = `\\C[${value26}][${value9}]\\C[0] `;
    };
};//一言が必要なもののみ

if(valueItems[i].meta['GunDamage']){
var value3 = valueItems[i].meta['GunDamage'];
value10 += `[固定値:${value3}] `;
};//銃武器の固定値

if(id1 == 3 || id1 == 0){

  //if(valueItems[i].meta['PassiveCondi'] || valueItems[i].meta['PassivePlusTrait'] || valueItems[i].meta['PassivePlusEffect']){
  //  var value9 = `\\I[661]`;
  //  value11 += `${value9}`;
  //};//戦闘中のみ発動→中止

    if( [9,10,15].some(function(id){return id == valueItems[i].stypeId}) ){
    if(valueItems[i].meta['Unequippable']){
      var value9 = `<自動>`;
      if(valueItems[i].stypeId == 15){var value26 = 27};
      value11 += `\\C[${value26}]${value9}\\C[0]`;
      var value26 = 2;
    };
  };
  if(valueItems[i].meta['Skill Tier']){
      var value3 = valueItems[i].meta['Skill Tier'].replace(' ','');
      value3 = Number(value3);
      if(value3 >= 1){value3 = `\x1bI[${Yanfly.Icon.ESTier[value3]}]${Yanfly.Param.ESTierName[value3]}>`};
      var value9 = `<装着:${value3}`;
      if(valueItems[i].stypeId == 15){var value26 = 27};
      value11 += `\\C[${value26}]${value9}\\C[0] `;
      var value26 = 2;
  };
if(id1 == 3){
  if( [1,4,5,6,7,8,11,12,14].some(function(id){return id == valueItems[i].stypeId}) ){
    if(valueItems[i].occasion){
      if(!valueItems[i].meta['BattleMapInformation']){
        if(valueItems[i].occasion == 0){var value9 = `\\I[661]\\I[660]`};
        if(valueItems[i].occasion == 1){var value9 = `\\I[661]`};
        if(valueItems[i].occasion == 2){var value9 = `\\I[660]`};
        if(valueItems[i].occasion == 3){var value9 = `\\I[16]`};
        value11 += `\\C[${value26}]${value9}\\C[0]`;
      };
    } else {
      var value9 = `\\I[661]\\I[660]`;
      value11 += `\\C[${value26}]${value9}\\C[0]`;
    }; 
  };
};
if(id1 == 0){
  if(valueItems[i].occasion){
    if(!valueItems[i].meta['BattleMapInformation']){
      if(valueItems[i].occasion == 0){var value9 = `\\I[661]\\I[660]`};
      if(valueItems[i].occasion == 1){var value9 = `\\I[661]`};
      if(valueItems[i].occasion == 2){var value9 = `\\I[660]`};
      if(valueItems[i].occasion == 3){var value9 = `\\I[16]`};
      value11 += `\\C[${value26}]${value9}\\C[0]`;
    };
  } else {
    var value9 = `\\I[661]\\I[660]`;
    value11 += `\\C[${value26}]${value9}\\C[0]`;
  };
};
  if(valueItems[i].meta['SaveShare']){
    value11 += `\\I[15]`;
  };

  if(valueItems[i].meta['MCharacterLearn']){
    value11 += `\\I[14]`;
  };

if(id1 == 3){
  if( [4,5,6,7,8].some(function(id){return id == valueItems[i].stypeId}) ){
    if(!valueItems[i].meta['Instant']){
      var value26 = 13;
      value11 += `\\C[${value26}]<${'ターン行動'}>\\C[0] `;
      var value26 = 2;
    };
  };
};
  if(valueItems[i].scope >= 1){
    if( [1,2,4,5,6,7,8,11,12,14].some(function(id){return id == valueItems[i].stypeId}) ){
      if(valueItems[i].scope == 1){var value9 = `敵単体`};
      if(valueItems[i].scope == 2){var value9 = `敵全体`};
      if(valueItems[i].scope == 3){var value9 = `敵R1`};
      if(valueItems[i].scope == 4){var value9 = `敵R2`};
      if(valueItems[i].scope == 5){var value9 = `敵R3`};
      if(valueItems[i].scope == 6){var value9 = `敵R4`};
      if(valueItems[i].scope == 7){var value9 = `味方単体`};
      if(valueItems[i].scope == 8){var value9 = `味方全体`};
      if(valueItems[i].scope == 9){var value9 = `戦闘不能単体`};
      if(valueItems[i].scope == 10){var value9 = `戦闘不能全体`};
      if(valueItems[i].scope == 11){var value9 = `使用者`};
      var value26 = 14;
      value11 += `\\C[${value26}]<${value9}>\\C[0] `;
      var value26 = 2;
    };
  };

  if(valueItems[i].meta['Multiple Elements']){
    var arr1 = valueItems[i].meta['Multiple Elements'].split(',');
      for (var id3 = 0; id3 <= arr1.length-1; id3++) {
            amygame_elementIcon(arr1[id3]);
              if(valueElementIconArr[0] >= 1){
                var value9 = `${valueElementIconArr[1]}`;
              } else {
                var value9 = `\x1bI[${valueElementIconArr[1]}]`;
              };
        value18 += `\\C[${value26}]${value9}\\C[0]`;
    };
    value11 += `[属性:${value18}] `;
  };

if(valueItems[i].meta['Custom Cooldown Mastery Formula'] || valueItems[i].meta['Custom MP Cost Mastery Formula']  || valueItems[i].meta['Mastery Effect']){
  //var value9 = `RankUpで`;
  //value11 += `[${value9}]`;
};
if(valueItems[i].meta['Select Conditions']){
  value11 += `[\\C[${value26}]対象前衛のみ\\C[0]] `;
};
if(valueItems[i].meta['SkillLearningClass']){
  var value3 = `${$dataSystem.skillTypes[valueItems[i].stypeId]}`;
  var value9 = Number(valueItems[i].meta['SkillLearningClass']);
  if(value9 != 100){
    value10 += `[\\C[${value26}]${value3}\\C[0]] [\\C[${value26}]\x1bJ[${value9}]\\C[0]習得] `;
  };
};
if(valueItems[i].meta['Limit Uses']){
  var value9 = Number(valueItems[i].meta['Limit Uses']);
  if(valueItems[i].meta['Not Recover All Uses']){//<After Battle Uses Recover: 0>もセット
    value11 += `[\\C[${value26}]1日${value9}回\\C[0]] `;
  } else {
    value11 += `[\\C[${value26}]戦闘中${value9}回\\C[0]] `;
  };
};
if(id1 == 0){
  if(valueItems[i].consumable){
    //value10 += `[\\C[${value26}]消耗品\\C[0]] `;
  };
};
if(id1 == 0){
  if(valueItems[i].meta['SeiyokuItem']){
    var value26 = 27;
    value10 += `[\\C[${value26}]性欲品\\C[0]] `;
  };
};
var value26 = 2;
if(valueItems[i].meta['DamageFormula2']){
  var arr1 = valueItems[i].meta['DamageFormula2'].split(',');
    if(arr1[0] == 1){var value9 = `[\\C[${value26}]\\I[34]100%\\C[0]`};
    if(arr1[0] == 2){var value9 = `[\\C[${value26}]\\I[36]100%\\C[0]`};
    if(arr1[0] == 3){var value9 = `[\\C[${value26}]\\I[37]100%\\C[0]`};
    if(arr1[0] == 4){var value9 = `[\\C[${value26}]\\I[39]100%\\C[0]`};
    if(arr1[0] == 5){var value9 = `[\\C[${value26}]\\I[35]100%\\C[0]`};
    if(arr1[0] == 6){var value9 = `[\\C[${value26}]\\I[37]50%\\I[38]50%\\C[0]`};
    if(arr1[0] == 7){var value9 = `[\\C[${value26}]\\I[34]50%\\I[37]50%\\C[0]`};
    if(arr1[0] == 8){var value9 = `[\\C[3]回復:\\I[36]100%(対象の\\I[36]も影響)\\C[0]`};
    if(arr1[0] == 9){var value9 = `[\\C[3]回復:\\I[34]100%(対象の\\I[35]も影響)\\C[0]`};
    if(arr1[0] == 10){var value9 = `[\\C[${value26}]現在HPの${arr1[1]}%消費して×${arr1[2]}倍の与ダメ\\C[0]`};
    if(arr1[0] == 11){var value9 = `[\\C[${value26}]\\I[34]70%\\I[37]20%\\I[38]10%\\C[0]`};
    if(arr1[0] == 12){var value9 = `[\\C[${value26}]\\I[34]20%\\I[37]40%\\I[38]40%\\C[0]`};
    if(arr1[0] == 13){var value9 = `[\\C[${value26}]\\I[34]60%\\I[37]40%\\C[0]`};
    if(arr1[0] == 14){var value9 = `[\\C[${value26}]\\I[36]100%\\C[0]`};
    if(arr1[0] == 15){var value9 = `[\\C[${value26}]\\I[34]40%\\I[37]30%\\I[38]30%\\C[0]`};
    if(arr1[0] == 16){var value9 = `[\\C[${value26}]\\I[34]80%\\I[37]20%\\C[0]`};
    if(arr1[0] == 17){var value9 = `[\\C[${value26}]\\I[34]100%\\C[0]`};
    if(arr1[0] == 18){var value9 = `[\\C[${value26}]\\I[37]50%+固定値\\C[0]`};
    if(arr1[0] == 19){var value9 = `[\\C[${value26}]\\I[34]20%\\I[37]80%\\C[0]`};
    if(arr1[0] == 20){var value9 = `[\\C[${value26}]\\I[36]50%\\I[37]50%\\C[0]`};
    if(arr1[0] == 24){var value9 = `[\\C[${value26}]\\I[37]50%\\I[39]50%\\C[0]`};
    if(arr1[0] == 25){var value9 = `[\\C[${value26}]\\I[37]50%\\C[0]`};
    if(arr1[0] == 28){var value9 = `[\\C[${value26}]\\I[34]100%\\C[0]`};
    if(arr1[0] == 29){var value9 = `[\\C[${value26}]\\I[34]80%\\I[37]10%\\I[38]10%\\C[0]`};
    if(arr1[0] == 30){var value9 = `[\\C[${value26}]\\I[34]70%\\I[37]10%\\I[38]20%\\C[0]`};
    if(arr1[2] >= 0){value9 += ` \\C[${value26}]×${arr1[2]}\\C[0]] `};
    if(arr1[1] >= 1){value9 += `\\I[666]:${arr1[1]}`};
    if(id1 == 3){
      if(valueItems[i].stypeId == 12){
        if(valueItems[i].meta['ユニーク']){//武器を特定できないため無効状態
          value9 += `+強化段階`;
        } else {
          value9 += `+装備レア度`;
        };
      };
    };
  value28 += `${value9} `;//元文章の後に追記される。
  if(valueItems[i].meta['LevelFluctuation']){
    value28 += `[${valueItems[i].meta['LevelFluctuation']}ﾚﾍﾞﾙ毎に威力+]`;
  };
};

if(valueItems[i].damage.type >= 1){
  if(valueItems[i].meta['PotionUsePoint']){
    if(valueItems[i].damage.type == 3){var value9 = 'HP'};//HP回復
    if(valueItems[i].damage.type == 4){var value9 = 'MP'};//MP回復
      if(Number(valueItems[i].meta['PotionUsePoint']) >= 2){
        var value3 = Number(valueItems[i].meta['PotionUsePoint']);
      } else {
        var value3 = `全`;
      };
      value10 += `[\\C[${value26}]${value9}\\C[3]${value3}\\C[0]回復]`;
  };
};
if(valueItems[i].meta['SkillStateAddRemove']){
  var value9 = Number(valueItems[i].meta['SkillStateAddRemove']);
  value10 += `[\\C[${value26}]\x1bSIM[${value9}]\\C[0]付与/解除]`;//
};
if(valueItems[i].meta['PotionResist']){
  var value9 = Number(valueItems[i].meta['PotionResist']);
  value10 += `[\\I[624]+${value9}%]`;
};
if(valueItems[i].speed != 0){
  var value9 = valueItems[i].speed;
  value10 += `\\C[${value26}]Speed\\C[0]:${value9} `;
};
if(valueItems[i].meta['Repeat']){
  var value9 = Number(valueItems[i].meta['Repeat']);
  value10 += `\\I[668]:${value9} `;
};
if(valueItems[i].meta['Warmup']){
  var value9 = Number(valueItems[i].meta['Warmup']);
  value10 += `\\I[662]:${value9} `;
};
if(valueItems[i].meta['Cooldown']){
  var value9 = Number(valueItems[i].meta['Cooldown']);
  value10 += `\\I[663]:${value9} `;
};
if(valueItems[i].meta['RankUpPoint']){
  var value9 = Number(valueItems[i].meta['RankUpPoint']);
  if(valueItems[i].meta['Max Mastery Level']){
    if(Number(valueItems[i].meta['Max Mastery Level']) == 1){
      value10 += `\\I[664]:${value9} `;
    } else {
      value10 += `\\I[664]:${value9}*Rank `;
    };
  };
};
//if(valueItems[i].meta['Max Mastery Level']){
//  value10 += `\\I[664]:Rank*Exp `;
//};//冗長なので使用しない。
if(valueItems[i].meta['Max Mastery Level']){
  var value9 = Number(valueItems[i].meta['Max Mastery Level']);
  value10 += `\\I[665]:${value9} `;
};
if(valueItems[i].tpGain != 0){
  var value9 = valueItems[i].tpGain;
  value10 += `\\C[${value26}]TP\\C[0]:${value9}\\C[10]↑\\C[0] `;
};

var arr11 = [0,`[\\C[${value26}]使用者に`,`[\\C[${value26}]味方全体に`,`[\\C[${value26}]対象敵に`,`[\\C[${value26}]敵全体に`];
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
        if(Number(arr1[3]) == 206){var value9 = `\\I[322]`};
        if(Number(arr1[3]) == 207){var value9 = `\\I[323]`};
        if(Number(arr1[3]) == 208){var value9 = `\\I[324]`};
        if(Number(arr1[3]) == 209){var value9 = `\\I[325]`};
        if(Number(arr1[3]) == 210){var value9 = `\\I[326]`};
        if(Number(arr1[3]) == 211){var value9 = `\\I[327]`};
        if(Number(arr1[3]) == 212){var value9 = `\\I[338]`};
        if(Number(arr1[3]) == 213){var value9 = `\\I[339]`};
        if(Number(arr1[3]) == 214){var value9 = `\\I[340]`};
        if(Number(arr1[3]) == 215){var value9 = `\\I[341]`};
        if(Number(arr1[3]) == 216){var value9 = `\\I[342]`};
        if(Number(arr1[3]) == 217){var value9 = `\\I[343]`};
      } else {
        var value9 = `\x1bSIM[${Number(arr1[3])}]`;
      };
      if(Number(arr1[3]) == 201){var value9 = `\\I[658]`};
      if(Number(arr1[3]) == 293){value9 += `*10`};//バフリミット+も数
      if(Number(arr1[3]) == 294){value9 += `*20`};
      if(Number(arr1[3]) == 295){value9 += `*30`};
      if(Number(arr1[2]) >= 2){
        for (var id4 = 2; id4 <= Number(arr1[2]); id4++) {
          value9 += `+`;
        };
      };
      ;
    if(Number(arr1[0]) == 1){arr11[1] += `${value9}`};
    if(Number(arr1[0]) == 2){arr11[2] += `${value9}`};
    if(Number(arr1[0]) == 3){arr11[3] += `${value9}`};
    if(Number(arr1[0]) == 4){arr11[4] += `${value9}`};
    };
  };
}, this);
if( Number(arr12[1]) >= 1 ){value10 += `${arr11[1]}付与\\C[0]] `};
if( Number(arr12[2]) >= 1 ){value10 += `${arr11[2]}付与\\C[0]] `};
if( Number(arr12[3]) >= 1 ){value10 += `${arr11[3]}付与\\C[0]] `};
if( Number(arr12[4]) >= 1 ){value10 += `${arr11[4]}付与\\C[0]] `};

  for (var id2 = 0; id2 <= 19; id2++) {
    if(valueItems[i].effects[id2]){

      if(valueItems[i].effects[id2].code == 11){
        if(valueItems[i].effects[id2].dataId == 0){
          var value3 = Math.round((valueItems[i].effects[id2].value1)*100);
            if(value3 != 0){
              var value9 = `\\I[627]:${value3}%`;
                if(value3 >= 1){
                  value10 += `[\\C[3]${value9}\\C[0]]`;
                } else {
                  value10 += `[\\C[4]${value9}\\C[0]]`;             
                };
            };
        };
        if(valueItems[i].effects[id2].dataId == 0){
          var value3 = (valueItems[i].effects[id2].value2);
            if(value3 != 0){
              var value9 = `\\I[627]:${value3}`;
                if(value3 >= 1){
                  value10 += `[\\C[3]${value9}\\C[0]]`;
                } else {
                  value10 += `[\\C[4]${value9}\\C[0]]`;             
                };
            };
        };
      };

      if(valueItems[i].effects[id2].code == 12){
        if(valueItems[i].effects[id2].dataId == 0){
          var value3 = Math.round((valueItems[i].effects[id2].value1)*100);
            if(value3 != 0){
              var value9 = `\\I[628]:${value3}%`;
                if(value3 >= 1){
                  value10 += `[\\C[3]${value9}\\C[0]]`;
                } else {
                  value10 += `[\\C[4]${value9}\\C[0]]`;             
                };
            };
        };
        if(valueItems[i].effects[id2].dataId == 0){
          var value3 = (valueItems[i].effects[id2].value2);
            if(value3 != 0){
              var value9 = `\\I[628]:${value3}`;
                if(value3 >= 1){
                  value10 += `[\\C[3]${value9}\\C[0]]`;
                } else {
                  value10 += `[\\C[4]${value9}\\C[0]]`;             
                };
            };
        };
      };

      if(valueItems[i].effects[id2].code == 13){//TPはvalue2（固定値）なし。%表記ではないので*100処理も不要
        if(valueItems[i].effects[id2].dataId == 0){
          var value3 = Math.round((valueItems[i].effects[id2].value1)*1);
            if(value3 != 0){
              var value9 = `\\I[629]:${value3}%`;
                if(value3 >= 1){
                  value10 += `[\\C[3]${value9}up\\C[0]]`;
                } else {
                  value10 += `[\\C[4]${value9}down\\C[0]]`;             
                };
            };
        };
      };

      if(valueItems[i].effects[id2].code == 21){
        for (var id3 = 1; id3 <= $dataStates.length-1; id3++) {
          if(valueItems[i].effects[id2].dataId == id3){
            var value3 = Math.round((valueItems[i].effects[id2].value1) * 100);
               if(id3 >= 206 && id3 <= 217){
                 if(id3 == 206){var value9 = `\\I[322]`};
                 if(id3 == 207){var value9 = `\\I[323]`};
                 if(id3 == 208){var value9 = `\\I[324]`};
                 if(id3 == 209){var value9 = `\\I[325]`};
                 if(id3 == 210){var value9 = `\\I[326]`};
                 if(id3 == 211){var value9 = `\\I[327]`};
                 if(id3 == 212){var value9 = `\\I[338]`};
                 if(id3 == 213){var value9 = `\\I[339]`};
                 if(id3 == 214){var value9 = `\\I[340]`};
                 if(id3 == 215){var value9 = `\\I[341]`};
                 if(id3 == 216){var value9 = `\\I[342]`};
                 if(id3 == 217){var value9 = `\\I[343]`};
              } else {
              if($dataStates[id3].iconIndex >= 1){
                var value9 = `\x1bI[${$dataStates[id3].iconIndex}]`;
              } else {
                var value9 = `${$dataStates[id3].name}`;
              };
              };
              if(id3 != value24){
                var value24 = 0;
                var value25 = 0;
              };
              if(value24 == id3){
                value25 += 1; 
              } else {
                var value24 = id3 
              };
              if($dataStates[id3].autoRemovalTiming >= 1){
                var value27 = ` ${$dataStates[id3].minTurns}`;
                  if($dataStates[id3].minTurns != $dataStates[id3].maxTurns){
                    value27 += `～${$dataStates[id3].maxTurns}t`;
                  } else {
                    value27 += `t`;
                  };
              } else {
                var value27 = ``;
              };
              if(id3 >= 206 && id3 <= 217){
                var value27 = ``;
              };
              if(value25 >= 1){
                  value10 += `\\C[${value26}]+\\C[0]`;         
              } else {
                if(value3 == 100){
                  value10 += `[\\C[${value26}]付与:\\C[0]${value9}${value27}]`;
                } else {
                  value10 += `[\\C[${value26}]付与:\\C[0]${value9}${value3}%${value27}]`;
                };
              };
       }}};

      if(valueItems[i].effects[id2].code == 22){
        for (var id3 = 1; id3 <= $dataStates.length-1; id3++) {
          if(valueItems[i].effects[id2].dataId == id3){
            var value3 = Math.round((valueItems[i].effects[id2].value1) * 100);
              if($dataStates[id3].iconIndex >= 1){
                var value9 = `\x1bI[${$dataStates[id3].iconIndex}]`;
                } else {
                var value9 = `${$dataStates[id3].name}`;
                };
              if(value3 == 100){
                value10 += `[\\C[3]解除:\\C[0]${value9}]`;
              } else {
                value10 += `[\\C[3]解除:\\C[0]${value9}${value3}%]`;
              };
       }}};

  }};

};//スキルのみの処理終わり

if(valueItems[i].meta['dispelCount']){
  var value9 = Number(valueItems[i].meta['dispelCount']);
  value10 += `[\\C[${value26}]強化状態\\C[3]${value9}つ\\C[${value26}]消去\\C[0]]`;
};
if(valueItems[i].meta['abNomalClearCount']){
  var value9 = Number(valueItems[i].meta['abNomalClearCount']);
  if(valueItems[i].meta['StateabNomalOnly']){
    value10 += `[\\C[${value26}]\\I[683]\\C[3]${value9}つ\\C[${value26}]回復\\C[0]]`;
  } else {
    value10 += `[\\C[${value26}]\\I[683]\\I[684]\\C[3]${value9}つ\\C[${value26}]回復\\C[0]]`;
  };
};
if(valueItems[i].meta['abNomalClearCountPlus']){
  value10 += `[\\C[${value26}]状態異常回復数+(Magic/300)\\C[0]]`;
};
if(valueItems[i].meta['dispelCountPlus']){
  value10 += `[\\C[${value26}]強化解除数+(Magic/300)\\C[0]]`;
};

if(valueItems[i].meta['Passive State'] && !valueItems[i].meta['パッシブ隠蔽']){
  if($dataStates[Number(valueItems[i].meta['Passive State'])].meta['SpcialState']){
    value10 += `\\C[${value26}]特殊効果付与\\C[0]<\x1bSIM[${Number(valueItems[i].meta['Passive State'])}]> `;
  } else {
    value10 += `\\C[${value26}]付与\\C[0]<\x1bSIM[${Number(valueItems[i].meta['Passive State'])}]> `;
  };
};//パッシブステート

for (var id3 = 1; id3 <= $dataSystem.elements.length-1; id3++) {
  if(valueItems[i].meta['Element Amplify ' + id3]){
            amygame_elementIcon(id3);
              var value3 = valueItems[i].meta['Element Amplify ' + id3].replace(' ','');
              if(valueElementIconArr[0] >= 1){
                var value9 = `${valueElementIconArr[1]}威力`;
              } else {
                var value9 = `\x1bI[${valueElementIconArr[2]}]威力`;
              };
            value10 += `${value9}${value3} `;
}};//属性威力加算

if(valueItems[i].meta['PassiveElementP']){//<Max Mastery Level: 5>
  var arr1 = valueItems[i].meta['PassiveElementP'].split(',');
  amygame_elementIcon(Number(arr1[0]));
  if(valueElementIconArr[0] >= 1){
    var value9 = `${valueElementIconArr[1]}威力`;
  } else {
    var value9 = `\x1bI[${valueElementIconArr[2]}]威力`;
  };
  //var value9 = `${$dataSystem.elements[Number(arr1[0])]}威力:`;
  if(Number(arr1[1]) >= 1){
    var value26 = 10;
  } else {
    var value26 = 1;
  };
  if(valueItems[i].meta['Max Mastery Level']){
    value10 += `\\C[${value26}]<${value9}Rank*${Number(arr1[1])}%\\C[0]>`;
  } else {
    value10 += `\\C[${value26}]<${value9}${Number(arr1[1])}%\\C[0]>`;
  };
  var value26 = 2;
};
if(valueItems[i].meta['SpecialAttack']){
  var value3 = Number(valueItems[i].meta['SpecialAttack']);
  var value9 = `<\x1bSIN[${value3}]>`;
  value10 += `\\C[${value26}]Attack\\C[0]${value9} `;
};
if(valueItems[i].meta['AddPowerWeapon']){
  var value3 = valueItems[i].meta['AddPowerWeapon'];
  value10 += `\\I[666]+${value3} `;
};//スキルのパワーに加算
if(valueItems[i].meta['Critical Multiplier']){
  var value3 = valueItems[i].meta['Critical Multiplier'].replace(' ','');
  value10 += `\\I[78]威力${value3} `;
};//会心威力
if(valueItems[i].meta['Counter Skills']){
  var value3 = valueItems[i].meta['Counter Skills'];
  value10 += `\\C[16]反撃スキル:\x1bSIN[${value3}]\\C[0] `;
};
if(valueItems[i].meta['Counter Total']){
  var value3 = valueItems[i].meta['Counter Total'];
  var value3 = value3.replace(" +", "");
  value10 += `\\C[16][最大反撃回数:${Number(value3)+1}回]\\C[0] `;
};
if(valueItems[i].meta['CertainlyDouble']){
  value10 += `\\C[16][必ず2連撃以上]\\C[0] `;
};
if(valueItems[i].meta['CertainlyTriple']){
  value10 += `\\C[16][必ず3連撃]\\C[0] `;
};
if(valueItems[i].meta['NormalAttackHit']){
  var value3 = valueItems[i].meta['NormalAttackHit'];
  value10 += `\\C[16][通常攻撃Hit数+${value3}]\\C[0] `;
};
if(valueItems[i].meta['AttackAbilityHit']){
  var value3 = valueItems[i].meta['AttackAbilityHit'];
  value10 += `\\C[16][通常/アビリティ攻撃Hit数+${value3}]\\C[0] `;
};
if(valueItems[i].meta['BattleAddAttackSet']){
  var value3 = valueItems[i].meta['BattleAddAttackSet'];
  value10 += `\\C[16][追撃${value3}%]\\C[0] `;
};
if(valueItems[i].meta['Evade Counter']){
  value10 += `\\C[16][回避後に反撃]\\C[0] `;
};
if(valueItems[i].meta['Hit Counter']){
  value10 += `\\C[16][攻撃受後に反撃]\\C[0] `;
};
if(valueItems[i].meta['MaxTp']){
  var value3 = valueItems[i].meta['MaxTp'];
  value10 += `\\C[16]MaxTp\\C[0]+${value3} `;
};
if(valueItems[i].meta['elementRegist6']){
  var value3 = valueItems[i].meta['elementRegist6'];
  if(value3 == 0){
    value10 += `\\C[${value26}]六属性完全耐性\\C[0] `;
  } else {
    value10 += `\\C[${value26}]六属性耐性\\C[0]${value3}% `;
  };
};
if(valueItems[i].meta['elementRegist9']){
  var value3 = valueItems[i].meta['elementRegist9'];
  if(value3 == 0){
    value10 += `\\C[${value26}]九属性完全耐性\\C[0] `;
  } else {
    value10 += `\\C[${value26}]九属性耐性\\C[0]${value3}% `;
  };
};
if(valueItems[i].meta['StateabNomalResist']){
  var value3 = valueItems[i].meta['StateabNomalResist'];
  if(value3 == 0){
    value10 += `\\C[${value26}]\\I[683]無効\\C[0] `;
  } else {
    value10 += `\\C[${value26}]\\I[683]耐性\\C[0]+${value3}% `;
  };
};
if(valueItems[i].meta['StateSPabNomalResist']){
  var value3 = valueItems[i].meta['StateSPabNomalResist'];
  if(value3 == 0){
    value10 += `\\C[${value26}]\\I[684]無効\\C[0] `;
  } else {
    value10 += `\\C[${value26}]\\I[684]耐性\\C[0]+${value3}% `;
  };
};
if(valueItems[i].meta['DispelGuard']){
  value10 += `\\C[${value26}]強化消去無効\\C[0] `;
};
if(valueItems[i].meta['Level Up Recover All']){
    value10 += `[\\C[16]LvUp時に全回復\\C[0]]`;
};
if(valueItems[i].meta['Bypass Damage Cap']){
  value10 += `\\C[16]D.Cap無効\\C[0] `;
} else {
  if(valueItems[i].meta['Damage Cap']){
    var value3 = valueItems[i].meta['Damage Cap'].replace(' ','');
    value10 += `\\C[16]D.Cap:\\C[0]${value3} `;
  };
};
if(valueItems[i].meta['Bypass Heal Cap']){
  value10 += `\\C[16]H.Cap無効\\C[0] `;
} else {
  if(valueItems[i].meta['Heal Cap']){
    var value3 = valueItems[i].meta['Heal Cap'].replace(' ','');
    value10 += `\\C[16]H.Cap:\\C[0]${value3} `;
  };
};
if(valueItems[i].meta['HP Cost']){
  var value3 = valueItems[i].meta['HP Cost'].replace(' ','');
  value10 += `[\\C[16]HP${value3}消費\\C[0]]`;
};
if(valueItems[i].meta['MP Cost']){
  var value3 = valueItems[i].meta['MP Cost'].replace(' ','');
  value10 += `[\\C[16]HP${value3}消費\\C[0]]`;
};
if(valueItems[i].meta['SpcialState']){
  value28 += `[\\C[${value26}]\x1bSIM[110]で発動\\C[0]][\x1bSIM[109]で効果消失]`;
  value10 += `[\\C[${value26}]行動時MP消費/消費MP未満で\\I[252]付与\\C[0]]`;
};
if(valueItems[i].meta['activateRate']){
  var value3 = Math.round(valueItems[i].meta['activateRate'] * 100);
  value28 += `[消費MP:MMP\\C[10]${value3}%\\C[0]]`;
};
if(valueItems[i].meta['activatePoint']){//使ってない？
  var value3 = valueItems[i].meta['activatePoint'];
  value28 += `[消費MP:\\C[2]${value3}\\C[0]]`;
};
if(valueItems[i].meta['Global Cooldown']){
  var value3 = Number(valueItems[i].meta['Global Cooldown']);
  value28 += `[全てのCT:\\C[2]${value3}\\C[0]]`;
};
for (var id3 = 1; id3 <= 15; id3++) {
  var value27 = `SType ${id3} Cooldown`;
  if(valueItems[i].meta[value27]){
    if(Number(valueItems[i].meta[value27]) < 0){
      var value26 = 3;
    } else {
      var value26 = 1;
    };
    var value9 = `${$dataSystem.skillTypes[id3]}\\C[${value26}]\\I[663]${Number(valueItems[i].meta[value27])}`;
    value10 += `[${value9}\\C[0]]`;
  };
  var value27 = `SType ${id3} Warmup`;
  if(valueItems[i].meta[value27]){
    if(Number(valueItems[i].meta[value27]) < 0){
      var value26 = 3;
    } else {
      var value26 = 1;
    };
    var value9 = `${$dataSystem.skillTypes[id3]}\\C[${value26}]\\I[662]${Number(valueItems[i].meta[value27])}`;
    value10 += `[${value9}\\C[0]]`;
  };
};
var value26 = 2;
if(valueItems[i].meta['HP Life Steal Physical'] && valueItems[i].meta['HP Life Steal Magical']){
  var value3 = valueItems[i].meta['HP Life Steal Physical'].replace(' ','');
  var value3 = value3.replace('%','');
  if(Number(value3) >= 1){
    var value26 = 2;
    value10 += `[\\C[${value26}]物理/魔法与Dの${Number(value3)}%HP吸収回復\\C[0]]`;
  } else {
    var value26 = 10;
    value10 += `[\\C[${value26}]物理/魔法与Dの${Number(value3)}%HP反動ﾀﾞﾒｰｼﾞ\\C[0]]`;
  };
} else {
  if(valueItems[i].meta['HP Life Steal Physical']){
    var value3 = valueItems[i].meta['HP Life Steal Physical'].replace(' ','');
    var value3 = value3.replace('%','');
    if(Number(value3) >= 1){
      var value26 = 2;
      var value10 = `[\\C[${value26}]物理与Dの${Number(value3)}%HP吸収回復\\C[0]]`;
    } else {
      var value26 = 10;
      value10 += `[\\C[${value26}]物理与Dの${Number(value3)}%HP反動ﾀﾞﾒｰｼﾞ\\C[0]]`;
    };
  };
  if(valueItems[i].meta['HP Life Steal Magical']){
    var value3 = valueItems[i].meta['HP Life Steal Magical'].replace(' ','');
    var value3 = value3.replace('%','');
    if(Number(value3) >= 1){
      var value26 = 2;
      value10 += `[\\C[${value26}]魔法与Dの${Number(value3)}%HP吸収回復\\C[0]]`;
    } else {
      var value26 = 10;
      value10 += `[\\C[${value26}]魔法与Dの${Number(value3)}%HP反動ﾀﾞﾒｰｼﾞ\\C[0]]`;
    };
  };
};
var value26 = 2;
if(valueItems[i].meta['MP Life Steal Physical'] && valueItems[i].meta['MP Life Steal Magical']){
  var value3 = valueItems[i].meta['MP Life Steal Physical'].replace(' ','');
  var value3 = value3.replace('%','');
  if(Number(value3) >= 1){
    var value26 = 2;
    value10 += `[\\C[${value26}]物理/魔法与Dの${Number(value3)}%MP吸収回復\\C[0]]`;
  } else {
    var value26 = 10;
    value10 += `[\\C[${value26}]物理/魔法与Dの${Number(value3)}%MP消耗\\C[0]]`;
  };
} else {
  if(valueItems[i].meta['MP Life Steal Physical']){
    var value3 = valueItems[i].meta['MP Life Steal Physical'].replace(' ','');
    var value3 = value3.replace('%','');
    if(Number(value3) >= 1){
      var value26 = 2;
      value10 += `[\\C[${value26}]物理与Dの${Number(value3)}%MP吸収回復\\C[0]]`;
    } else {
      var value26 = 10;
      value10 += `[\\C[${value26}]物理与Dの${Number(value3)}%MP消耗\\C[0]]`;
    };
  };
  if(valueItems[i].meta['MP Life Steal Magical']){
    var value3 = valueItems[i].meta['MP Life Steal Magical'].replace(' ','');
    var value3 = value3.replace('%','');
    if(Number(value3) >= 1){
      var value26 = 2;
      value10 += `[\\C[${value26}]魔法与Dの${Number(value3)}%MP吸収回復\\C[0]]`;
    } else {
      var value26 = 10;
      value10 += `[\\C[${value26}]魔法与Dの${Number(value3)}%MP消耗\\C[0]]`;
    };
  };
};
var value26 = 2;
if(valueItems[i].meta['HP Life Steal']){
  var value3 = valueItems[i].meta['HP Life Steal'].replace(' ','');
  var value3 = value3.replace('%','');
  value10 += `[\\C[${value26}]与Dの${Number(value3)}%HP吸収回復\\C[0]]`;
};
if(valueItems[i].meta['MP Life Steal']){
  var value3 = valueItems[i].meta['MP Life Steal'].replace(' ','');
  var value3 = value3.replace('%','');
  value10 += `[\\C[${value26}]与Dの${Number(value3)}%HP吸収回復\\C[0]]`;
};
if(valueItems[i].meta['RankMaxLearning']){
  if(valueItems[i].stypeId != 11){//召喚は前提スキルがあるため除外
    if(Number(valueItems[i].meta['Max Mastery Level']) >= 2){
      value10 += `[\\C[${value26}]RankMaxで習得が可能になる\\C[0]]`;
    } else {
      value10 += `[\\C[${value26}]熟練度Maxで習得が可能になる\\C[0]]`;
    };
  };
};
if(valueItems[i].meta['trapEvasion']){
  value10 += `[\\C[${value26}]引っ掛かったトラップを自動で回避する\\C[0]]`;
};
if(valueItems[i].meta['SemenRemove']){
  var value26 = 27;
  var value3 = Number(valueItems[i].meta['SemenRemove']);
  value10 += `[\\C[${value26}]状態異常精液${value3}つ回復\\C[0]]`;
};
if(valueItems[i].meta['HstaSuppression']){
  var value26 = 27;
  var arr1 = valueItems[i].meta['HstaSuppression'].split(',');
  var value3 = Number(arr1[1]);
  if(Number(arr1[0]) == 0){
    value10 += `[\\C[${value26}]性欲度${value3*100}まで\\C[0]][\\C[${value26}]各開発/経験度${value3}まで\\C[0]]`;
  } else {
    value10 += `[\\C[${value26}]${$dataSystem.variables[Number(arr1[0])]}のランク${value3}まで\\C[0]]`;
  };
};
var value26 = 2;
if(valueItems[i].meta['TPGain1']){
  var value3 = valueItems[i].meta['TPGain1'];
  value10 += `[\\C[${value26}]TP${value3}%\\C[0]]`;
};
if(valueItems[i].meta['gainExp']){
  var value3 = valueItems[i].meta['gainExp'];
  value10 += `[\\C[${value26}]獲得Exp:${value3}%\\C[0]]`;
};
for (var id3 = 1; id3 <= 6; id3++) {
  if(valueItems[i].meta['Skill Tier ' + id3 + ' Slots']){
    var value3 = valueItems[i].meta['Skill Tier ' + id3 + ' Slots'].replace(' ','');
    var value26 = 16;
    if(id3 == 1){var value9 = `Ability装着数`};
    if(id3 == 2){var value9 = `Main装着数`};
    if(id3 == 3){var value9 = `Job装着数`};
    if(id3 == 4){var value9 = `G-Passive装着数`};
    if(id3 == 5){var value9 = `Passive装着数`};
    if(id3 == 6){var value9 = `H-Passive装着数`};
    value10 += `[\\C[${value26}]${value9}\\C[2]${value3}\\C[0]]`;
  };
};
var value26 = 2;

//称号関係
if(valueItems[i].meta['titleGetSwitch']){
  var value3 = Number(valueItems[i].meta['titleGetSwitch']);
  if(value3 == 2 || valueItems[i].meta['DescriptionWord']){}else{
    value10 += `\\C[${value26}][条件:${$dataSystem.switches[value3]}]\\C[0]`;
  };
};
if(valueItems[i].meta['titleGetVariable']){
  var arr1 = valueItems[i].meta['titleGetVariable'].split(',');
  if(valueItems[i].meta['DescriptionWord']){}else{
    value10 += `\\C[${value26}][条件:${$dataSystem.variables[Number(arr1[0])]}:${Number(arr1[1])}]\\C[0]`;
  };
};
if(valueItems[i].meta['titleGetArray']){
  var arr1 = valueItems[i].meta['titleGetArray'].split(',');
  if(valueItems[i].meta['DescriptionWord']){}else{
    if(Number(arr1[0]) == 52){
      value10 += `\\C[${value26}][条件:\x1bSIM[${Number(arr1[1])}]:${Number(arr1[2])}体討伐]\\C[0]`;
    };
  };
};
if(valueItems[i].meta['titleGetItems']){
  var arr1 = valueItems[i].meta['titleGetItems'].split(',');
  if(valueItems[i].meta['DescriptionWord']){}else{
    value10 += `\\C[${value26}][条件:\x1bIIN[${Number(arr1[0])}]:${Number(arr1[1])}個]\\C[0]`;
  };
};
if(valueItems[i].meta['titleGetSkillRank']){
  var arr1 = valueItems[i].meta['titleGetSkillRank'].split(',');
  value10 += `\\C[${value26}][条件:パーティの誰かが\x1bSIN[${Number(arr1[0])}]Rank:${Number(arr1[1])}以上]\\C[0]`;
};
if(valueItems[i].meta['titleGetAchievement']){
  var arr1 = valueItems[i].meta['titleGetAchievement'].split(',');
  if(valueItems[i].meta['DescriptionWord']){}else{
    if(Number(arr1[0]) == 1){var value3 = `TotalKill`};
    if(Number(arr1[0]) == 2){var value3 = `MaxAssalt`};
    if(Number(arr1[0]) == 3){var value3 = `TotalAssalt`};
    if(Number(arr1[0]) == 4){var value3 = `TotalOverKill`};
    if(Number(arr1[0]) == 5){var value3 = `MaxDamage`};
    if(Number(arr1[0]) == 6){var value3 = `TotalDamage`};
    if(Number(arr1[0]) == 7){var value3 = `Defead`};
    if(Number(arr1[0]) == 8){var value3 = `AttackCount`};
    if(Number(arr1[0]) == 9){var value3 = `S-AbilityCount`};
    if(Number(arr1[0]) == 10){var value3 = `A-AbilityCount`};
    if(Number(arr1[0]) == 11){var value3 = `W-AbilityCount`};
    if(Number(arr1[0]) == 12){var value3 = `R-AbilityCount`};
    if(Number(arr1[0]) == 13){var value3 = `BurstCount`};
    if(Number(arr1[0]) == 14){var value3 = `ChainCount`};
    if(Number(arr1[0]) == 15){var value3 = `TotalDefead`};
    if(Number(arr1[0]) == 16){var value3 = `CriticalCount`};
    if(valueItems[i].meta['KojinTitle']){value3 += `[個人]`};
    value10 += `\\C[${value26}][条件:${value3}:${Number(arr1[1])}]\\C[0]`;
  };
};
if(valueItems[i].meta['HtitleGetArray']){
  var arr1 = valueItems[i].meta['HtitleGetArray'].split(',');
  if(valueItems[i].meta['DescriptionWord']){}else{
    value10 += `\\C[${value26}][条件:${$dataSystem.variables[Number(arr1[0]) + 400]}:${Number(arr1[1])}]\\C[0]`;
  };
};
if(valueItems[i].meta['annihilationTitle']){
  var arr1 = valueItems[i].meta['annihilationTitle'].split(',');
  if(Number(arr1[0]) >= 20){
    var value3 = `\\C[1]<${$dataItems[Number(arr1[0])].name}>\\C[0]殲滅回数:\\C[10]${Number(arr1[1])}\\C[0]回以上`;
  };
  if(Number(arr1[0]) == 1){
    var value3 = `\\C[1]<全マップ>\\C[0]の総殲滅回数:\\C[10]${Number(arr1[0])}\\C[0]回以上`;
  };
  if(Number(arr1[0]) == 2){
    var value3 = `\\C[1]<全ダンジョン>\\C[0]の総殲滅回数:\\C[10]${Number(arr1[0])}\\C[0]回以上`;
  };
    value10 += `\\C[${value26}][条件:${value3}\\C[${value26}]]\\C[0]`;
};
if(valueItems[i].meta['PassivePlusTrait']){
  var arr1 = valueItems[i].meta['PassivePlusTrait'].split(',');
  if(Number(arr1[0]) == 11){
    var value3 = Number(arr1[2]);
    if(value3 >= 0){
      value10 += `[\\C[${value26}]${$dataSystem.elements[Number(arr1[1])]}\\C[0]ダメージ耐性${Math.round(value3 * 100)}%Down]`;
    } else {
      var value3 = value3 - value3 - value3;
      value10 += `[\\C[${value26}]${$dataSystem.elements[Number(arr1[1])]}\\C[0]ダメージ耐性${Math.round(value3 * 100)}%Up]`;
    };
  };
};
if(valueItems[i].meta['PassivePlusEffect']){//PassiveCondi
  var arr1 = valueItems[i].meta['PassivePlusEffect'].split(',');
  if(Number(arr1[0]) == 0){
    var value3 = TextManager.param(Number(arr1[1]));
  };
  if(Number(arr1[0]) == 1){
    var value3 = FTKR.CSS.cssStatus.xparam[Number(arr1[1])];
  };
  if(Number(arr1[0]) == 2){
    var value3 = FTKR.CSS.cssStatus.sparam[Number(arr1[1])];
  };   
  value10 += `[\\C[${value26}]${value3}\\C[0]+${Math.round(Number(arr1[2]) * 100)}%]`;
};
//称号効果
if(valueItems[i].meta['titleEffectConfiVal']){
  var arr1 = valueItems[i].meta['titleEffectConfiVal'].split(',');
  if(valueItems[i].meta['DescriptionWord']){}else{
    value10 += `[\\C[${value26}]${$dataSystem.variables[Number(arr1[0])]}:+${Number(arr1[1])}\\C[0]]`;
  };
};
if(valueItems[i].meta['titleEffectConfiSwi']){
  var value3 = Number(valueItems[i].meta['titleEffectConfiSwi']);
  value10 += `[\\C[${value26}]${$dataSystem.switches[value3]}\\C[0]]`;
};

if(valueItems[i].meta['titleSenkaGet']){
  var value3 = Number(valueItems[i].meta['titleSenkaGet']);
  value10 += `[\\C[${value26}]\x1bIIN[10]+${value3}\\C[0]]`;
};
for (var id3 = 1; id3 <= 9; id3++) {
if(valueItems[i].meta['titleEffect'+id3]){
  var arr1 = valueItems[i].meta['titleEffect'+id3].split(',');
  if(Number(arr1[0]) == 0){
    var value3 = TextManager.param(Number(arr1[1]));
  };
  if(Number(arr1[0]) == 1){
    var value3 = FTKR.CSS.cssStatus.xparam[Number(arr1[1])];
  };
  if(Number(arr1[0]) == 2){
    var value3 = FTKR.CSS.cssStatus.sparam[Number(arr1[1])];
  };
  if(Number(arr1[0]) == 3){
    var value3 = `${$dataSystem.elements[Number(arr1[1])]}`;
    if([18,19,51,52,53,54,55,56,57,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80].some(function(id){return id == Number(arr1[1])})){
      value3 += `特攻`;
    };
    value3 += `威力`;
  };
  if(Number(arr1[0])==4){
    value10 += `${$dataSystem.elements[Number(arr1[1])]}`;
    if([10,11,12,15,20,38,39,40,41].some(function(id1){return id1 == Number(arr1[1])})){
    }else{
      var value3 = `耐性`;
    };
  };
    if(Number(arr1[2]) < 0){
      var value27 = Number(arr1[2]) - Number(arr1[2]) - Number(arr1[2]);
    } else {
      var value27 = Number(arr1[2]);
    };
    var value9 = `\\C[2]${value27 * 100}\\C[0]%`;
    var value26 = 1;
    value10 += `[\\C[${value26}]${value3}\\C[0]+${value9}]`;
    var value26 = 2;
};
};
//食事バフ
for (var id3 = 1; id3 <= 9; id3++) {
if(valueItems[i].meta['eatEffect'+id3]){
  var arr1 = valueItems[i].meta['eatEffect'+id3].split(',');
  if(Number(arr1[0]) == 0){
    var value3 = TextManager.param(Number(arr1[1]));
  };
  if(Number(arr1[0]) == 1){
    var value3 = FTKR.CSS.cssStatus.xparam[Number(arr1[1])];
  };
  if(Number(arr1[0]) == 2){
    var value3 = FTKR.CSS.cssStatus.sparam[Number(arr1[1])];
  };
  if(Number(arr1[0]) == 3){
    var value3 = `${$dataSystem.elements[Number(arr1[1])]}`;
    if([18,19,51,52,53,54,55,56,57,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80].some(function(id){return id == Number(arr1[1])})){
      value3 += `特攻`;
    };
    value3 += `威力`;
  };
  if(Number(arr1[0])==4){
    value10 += `${$dataSystem.elements[Number(arr1[1])]}`;
    if([10,11,12,15,20,38,39,40,41].some(function(id1){return id1 == Number(arr1[1])})){
    }else{
      var value3 = `耐性`;
    };
  };
  if(Number(arr1[2]) < 0){
    var value27 = Number(arr1[2]) - Number(arr1[2]) - Number(arr1[2]);
  } else {
    var value27 = Number(arr1[2]);
  };
  var value9 = `\\C[2]${value27 * 100}\\C[0]%`;
  var value26 = 1;
  value10 += `[\\C[${value26}]${value3}\\C[0]+${value9}]`;
  var value26 = 2;
};
};
//娼婦系説明文
if(valueItems[i].meta['ProstitutionMoneyUp']){
    var value3 = valueItems[i].meta['ProstitutionMoneyUp'];
    value10 += `\\C[27]売春額に${value3}倍補正\\C[0] `;
};
if(valueItems[i].meta['BustSizeChange']){
    var value3 = valueItems[i].meta['BustSizeChange'];
    value10 += `\\C[27]BustSize+${value3}cm\\C[0] `;
};
if(valueItems[i].meta['HipSizeChange']){
    var value3 = valueItems[i].meta['HipSizeChange'];
    value10 += `\\C[27]HipSize+${value3}cm\\C[0] `;
};
if(valueItems[i].meta['BodyWeightChange']){
    var value3 = valueItems[i].meta['BodyWeightChange'];
    value10 += `\\C[27]BodyWeight+${value3}kg\\C[0] `;
};

if(valueItems[i].meta['下級鑑定品'] || valueItems[i].meta['中級鑑定品'] || valueItems[i].meta['上級鑑定品']){
  var value9 = `\\C[3][未鑑定品]\\C[0]`;
    if(valueItems[i].meta['下級鑑定品']){value9 += `\\C[${value26}][下級]\\C[0]`};
    if(valueItems[i].meta['中級鑑定品']){value9 += `\\C[${value26}][中級]\\C[0]`};
    if(valueItems[i].meta['上級鑑定品']){value9 += `\\C[${value26}][上級]\\C[0]`};
      value10 += `${value9} `;
};

if(valueItems[i].meta['walletIn']){
  var value3 = valueItems[i].meta['BodyWeightChange'];
  value10 += `\\C[${value26}][使用で\\G入手]\\C[0] `;
};
if(valueItems[i].meta['QuestSetMap']){
  if(Number(valueItems[i].meta['QuestSetMap']) == 0){
    var value3 = `[常設]`;
  } else {
    var value3 = $dataSystem.switches[Number(valueItems[i].meta['QuestSetMap'])];
  };
  var value26 = 16;
  value10 += `[\\C[${value26}]受注\\C[0]:\\C[2]${value3}\\C[0]] `;
  var value26 = 2;
};
if(valueItems[i].meta['QuestSubjectMap']){
  var value3 = $dataSystem.switches[Number(valueItems[i].meta['QuestSubjectMap'])];
  var value26 = 16;
  value10 += `[\\C[${value26}]対象\\C[0]:\\C[2]${value3}\\C[0]]\n`;
  var value26 = 2;
};
if(valueItems[i].meta['QuestSuitableLv']){
    var value3 = Number(valueItems[i].meta['QuestSuitableLv']);
    var value26 = 16;
    value10 += `[\\C[${value26}]適正Lv\\C[0]:\\C[2]${value3}\\C[0]] `;
    var value26 = 2;
} else {
  if(valueItems[i].meta['QuestSubjectMap']){
    var value3 = Number(valueItems[i].meta['QuestSubjectMap']);
    for (var id3 = 1; id3 <= $dataItems.length-1; id3++) {
      if($dataItems[id3].meta['MapSwitch']){
        if(Number($dataItems[id3].meta['MapSwitch']) == value3){
          if($dataItems[id3].meta['EnemyLV']){
            var arr1 = $dataItems[id3].meta['EnemyLV'].split(',');
            var value9 = Math.min(...arr1);
            var value26 = 16;
            value10 += `[\\C[${value26}]適正Lv\\C[0]:\\C[2]${value9}\\C[0]] `;
            var value26 = 2;
            break;
    }}}};
  };
};
var value26 = 2;
if(valueItems[i].meta['QuestCompSubjugation1']){
  if(Number(valueItems[i].meta['QuestCompSubjugation1'].split(',')[0]) >= 1){
    value10 += `[\\C[${value26}]討伐依頼\\C[0]] `;
  };
};
if(valueItems[i].meta['QuestCompcollect1']){
  if(Number(valueItems[i].meta['QuestCompcollect1'].split(',')[0]) >= 1){
    value10 += `[\\C[${value26}]収集依頼\\C[0]] `;
    var value26 = 2;
  };
};
if(valueItems[i].meta['QuestCompDelivery1']){
  if(Number(valueItems[i].meta['QuestCompDelivery1'].split(',')[0]) >= 1){
    value10 += `[\\C[${value26}]納品依頼\\C[0]] `;
  };
};
if(valueItems[i].meta['QuestCompVal1']){
  if(Number(valueItems[i].meta['QuestCompVal1'].split(',')[0]) >= 1){
    value10 += `[\\C[${value26}]指定値達成依頼\\C[0]] `;
  };
};
if(valueItems[i].meta['QuestCompArray1']){
  if(Number(valueItems[i].meta['QuestCompArray1'].split(',')[0]) >= 1){
    value10 += `[\\C[${value26}]指定値達成依頼\\C[0]] `;
  };
};
if(valueItems[i].meta['QuestCompSkill1']){
  if(Number(valueItems[i].meta['QuestCompSkill1'].split(',')[0]) >= 1){
    value10 += `[\\C[${value26}]指定スキル獲得依頼\\C[0]] `;
  };
};
if(valueItems[i].meta['QuestCompSkillRank1']){
  if(Number(valueItems[i].meta['QuestCompSkillRank1'].split(',')[0]) >= 1){
    value10 += `\\C[${value26}][指定スキルランク到達依頼]\\C[0] `;
  };
};
if(valueItems[i].meta['QuestCompSkillSwi']){
  if(Number(valueItems[i].meta['QuestCompSkillSwi'].split(',')[0]) >= 1){
    value10 += `[\\C[${value26}]指定目的達成依頼\\C[0]] `;
  };
};
if(valueItems[i].meta['CoercionQuest']){
  value10 += `[\\C[${value26}]クエスト進行中に強制進行あり\\C[0]] `;
};
if(valueItems[i].meta['Stuff']){
  var value3 = Number(valueItems[i].meta['Stuff']);
  value10 += `\\C[${value26}][満腹度+${value3}（${$gameVariables.value(16)}/${$gameVariables.value(13)}）]\\C[0] `;
};
if(valueItems[i].meta['ＴＰ']){
  var value3 = Number(valueItems[i].meta['ＴＰ']);
  value10 += `\\C[${value26}][TP+${value3}]\\C[0] `;
};
if(valueItems[i].meta['Ingredients']){
  value10 += `\\C[${value26}][食材(換金用途)]\\C[0] `;
};
if(valueItems[i].meta['Alcohol']){
  value10 += `\\C[${value26}][アルコール]\\C[0] `;
};
if(valueItems[i].meta['ExpiryDate']){
  if(valueItems[i].meta['Menu Category']){
    if(valueItems[i].meta['Menu Category'] == ' Food'){
      value10 += `\\C[${value26}][賞味期限当日中]\\C[0] `;
    };
  } else {
      value10 += `\\C[${value26}][翌日自動返却]\\C[0] `;
  };
};
if(valueItems[i].meta['EventFactorClearReset']){
  value10 += `\\C[${value26}][クエスト関連アイテム]\\C[0] `;
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
  var value3 = Number(valueItems[i].meta['AddPowerCustom']);
    if(value3 >= 1){
      value10 += `\\I[666]+${value3} `;
    };
};
if(valueItems[i].meta['RaceDropRarity']){
  var value3 = Number(valueItems[i].meta['RaceDropRarity']);
    //if(value3 == 1){value10 += `[種族エネミーLv20までドロップ]`};
    //if(value3 == 2){value10 += `[種族エネミーLv40までドロップ]`};
    //if(value3 == 3){value10 += `[種族エネミーLv60までドロップ]`};
    //if(value3 == 4){value10 += `[種族エネミーLv80までドロップ]`};
    //if(value3 == 5){value10 += `[種族エネミーLv20-100までドロップ]`};
    if(value3 == 6){value10 += `[種族エネミーLv20からドロップ]`};
    if(value3 == 7){value10 += `[種族エネミーLv30からドロップ]`};
    if(value3 == 8){value10 += `[種族エネミーLv40からドロップ]`};
    if(value3 == 9){value10 += `[種族エネミーLv50からドロップ]`};
    if(value3 == 10){value10 += `[種族エネミーLv50からドロップ]`};
};
if(valueItems[i].meta['PartyExpRate']){
  var value3 = valueItems[i].meta['PartyExpRate'];
  value10 += `\\I[296]${value3}倍 `;
};
if(valueItems[i].meta['PartyGoldRate']){
  var value3 = valueItems[i].meta['PartyGoldRate'];
  value10 += `\\I[314]${value3}倍 `;
};
if(valueItems[i].meta['EnemyExpRate']){
  var value3 = valueItems[i].meta['EnemyExpRate'];
  value10 += `\\I[296]${value3}倍 `;
};
if(valueItems[i].meta['EnemyGoldRate']){
  var value3 = valueItems[i].meta['EnemyGoldRate'];
  value10 += `\\I[314]${value3}倍 `;
};
//↓スキル最後に付けるようにする。

if(valueItems[i].meta['Learn Require Eval']){
    value11 += `[\\C[${value26}]習得条件あり\\C[0]]`;
};

if(valueItems[i].meta['SwicthOnOffUse']){
    value10 += `[\\C[${value26}]使用でOn/Off\\C[0]]`;
};

//↓ステート最後に付けるようにする。
if(valueItems[i].meta['Category']){
  if(valueItems[i].meta['Category'] == ' StateabNomal'){
    value28 += `\\C[${value26}]${$dataStates[15].description}\\C[0] `;
  };
};
if(valueItems[i].meta['Category']){
  if(valueItems[i].meta['Category'] == ' StateSPabNomal'){
    value28 += `\\C[${value26}]${$dataStates[30].description}\\C[0] `;
  };
};
if(valueItems[i].meta['Category']){
  if(valueItems[i].meta['Category'] == ' StateUnique'){
    value28 += `\\C[${value26}]${$dataStates[40].description}\\C[0] `;
  };
};
if(valueItems[i].meta['Category']){
  if(valueItems[i].meta['Category'] == ' InvalidDispel'){
    value28 += `\\C[${value26}]${$dataStates[201].description}\\C[0] `;
  };
};
if(valueItems[i].meta['Category']){
  if(valueItems[i].meta['Category'] == ' PowerUp'){
    value28 += `\\C[${value26}]${$dataStates[202].description}\\C[0] `;
  };
};
if(valueItems[i].meta['timeRemove']){
  value10 += `[\\C[${value26}]時間経過で解除\\C[0]]`;
};

if(id1 == 4){
  if(valueItems[i].meta['registUp']){
    var value3 = valueItems[i].meta['registUp'];
    value10 += `[\\C[${value26}]付与時に耐性率${value3}%up\\C[0]]`;
  };
  if(valueItems[i].autoRemovalTiming >= 1){
    var value9 = `\\I[75]:${valueItems[i].minTurns}`;
      if(valueItems[i].minTurns != valueItems[i].maxTurns){
        value9 += `～${valueItems[i].maxTurns}`;
      };
      value10 += `[${value9}] `;
  } else {
    var value3 = 0;
    if(valueEquipPassiveSkill.length >= 1){
      for (var id3 = 1; id3 <= valueEquipPassiveSkill.length-1; id3++) {
        if(valueEquipPassiveSkill[id3] == i){
          var value3 = 1;
        };
      };
    };
    if(valueEquipPassiveWeapon.length >= 1){
      for (var id3 = 1; id3 <= valueEquipPassiveWeapon.length-1; id3++) {
        if(valueEquipPassiveWeapon[id3] == i){
          var value3 = 1;
        };
      };
    };
    if(valueEquipPassiveArmor.length >= 1){
      for (var id3 = 1; id3 <= valueEquipPassiveArmor.length-1; id3++) {
        if(valueEquipPassiveArmor[id3] == i){
          var value3 = 1;
        };
      };
    };
    if(value3 == 0){
      value10 += `[\\I[75]:∞] `;
    };
  };

};
if(id1 == 4){var value30 = `　${value30}`};
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
  if(value30 == 0){
    var value29 = `${value11}${valueItems[i].description}${value28}`;
  } else {
    var value29 = `${value11}${valueItems[i].description}${value28}\n${value30}`;
  };
} else {
    if(value30 == 0){
      var value29 = `${value11}${valueItems[i].description}${value28}\n${value10}`;
    } else {
      var value29 = `${value11}${valueItems[i].description}${value28}\n${value30}${value10}`;
    };
};
if(id1 == 0 || id1 == 1 || id1 == 2 || id1 == 3){
  valueItems[i].description = value29;
};
if(id1 == 4){//ステートとジョブは解説入れてる分のみに適用するため。
  if(valueItems[i].meta['Help Description']){
    valueItems[i].description = value29;
}};
if(!valueItems[i].meta['NoAddDescription']){
  if(id1 == 5){//ステートとジョブは解説入れてる分のみに適用するため。
    if(valueItems[i].meta['Help Description']){
      valueItems[i].description = `${value11}${valueItems[i].description}${value28}${value10}`;
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
    var value1 = ``;
      if($dataSkills[i].meta['Mastery Effect']){
        var value2 = $dataSkills[i].meta['Mastery Effect'];
        var value3 = value2.replace(' Damage Per Level', '');
        var value4 = value3.replace(' ', '');
        value1 += `[ランク補正:ダメージ値にランク毎${value4}]\n`;
      } else {
        value1 += `\n`
      };
        if($dataSkills[i].meta['NormalAttackDerived']){
          var arr1 = $dataSkills[i].meta['NormalAttackDerived'].split(',');
          value1 += `[ランク${arr1[0]}で\\C[2]${$dataSkills[Number(arr1[1])].name}\\C[0]が派生発生]`
        };
        if($dataSkills[i].meta['NormalAttackDerivedSuper']){
          var arr1 = $dataSkills[i].meta['NormalAttackDerivedSuper'].split(',');
          value1 += `[ランク${arr1[0]}と特殊条件を満たす事で\\C[2]${$dataSkills[Number(arr1[1])].name}\\C[0]が派生発生]`
        };
        valueAddDescriptionSkill[i-100] = `${value1}`;
}};
var start = 901;
var end = 950;
for (var i = start; i <= end; i++) {
  if (!$dataSkills[i].name == '') {
    var value1 = `[必要熟練度:基礎値${Number($dataSkills[i].meta.RankUpPoint)}にランク×基礎値をプラス]`;
      if($dataSkills[i].meta['Mastery Effect']){
        var value2 = $dataSkills[i].meta['Mastery Effect'];
        var value3 = value2.replace(' Damage Per Level', '');
        var value4 = value3.replace(' ', '');
        value1 += `[ランク補正:ダメージ値にランク毎${value4}]\n`;
      } else {
        value1 += `\n`
      };
      if($dataSkills[i].meta['NormalAttackDerived']){
        var arr1 = $dataSkills[i].meta['NormalAttackDerived'].split(',');
        value1 += `[ランク${arr1[0]}で\\C[2]${$dataSkills[Number(arr1[1])].name}\\C[0]が派生発生]`
      } else {
        value1 += ``;
      };
      valueAddDescriptionSkill[i-800] = `${value1}`;
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
    var value2 = 1;
    var value2 = Number($dataClasses[i].meta['classRank']);
    if(value2 == 0){var value2 = 1};
      if($dataClasses[i].meta['Primary Only']){
        var value1 = `[\\C[1]メイン\\C[0]]`;
      } else {
        var value1 = `[\\C[5]サブ\\C[0]]`;
      };
      if(value2 == 1){var value4 = `Ⅰ`};
      if(value2 == 2){var value4 = `Ⅱ`};
      if(value2 == 3){var value4 = `Ⅲ`};
      if(value2 == 4){var value4 = `Ⅳ`};
      value1 += `[Class${value4}]`;
      value1 += `[GrowStatas:\\C[16]Mhp\\C[10]${Number(arr1[0])*value2}\\C[0],\\C[16]Mmp\\C[10]${Number(arr1[1])*value2}\\C[0],\\C[16]Atk\\C[10]${Number(arr1[2])*value2}\\C[0],\\C[16]Def\\C[10]${Number(arr1[3])*value2}\\C[0],\\C[16]Mag\\C[10]${Number(arr1[4])*value2}\\C[0],\\C[16]Dex\\C[10]${Number(arr1[5])*value2}\\C[0],\\C[16]Agi\\C[10]${Number(arr1[6])*value2}\\C[0],\\C[16]Luk\\C[10]${Number(arr1[7])*value2}\\C[0]]\n`;
      valueClassGrowStatasComparison[i] += `:\\C[16]Mhp\\C[10]${Number(arr1[0])*value2}\\C[0],\\C[16]Mmp\\C[10]${Number(arr1[1])*value2}\\C[0],\\C[16]Atk\\C[10]${Number(arr1[2])*value2}\\C[0],\\C[16]Def\\C[10]${Number(arr1[3])*value2}\\C[0],\\C[16]Mag\\C[10]${Number(arr1[4])*value2}\\C[0],\\C[16]Dex\\C[10]${Number(arr1[5])*value2}\\C[0],\\C[16]Agi\\C[10]${Number(arr1[6])*value2}\\C[0],\\C[16]Luk\\C[10]${Number(arr1[7])*value2}\\C[0]]`;
        for (var id1 = 0; id1 <= 10; id1++) {
          if($dataClasses[i].learnings[id1]){
            if($dataClasses[i].meta['Primary Only']){
              if($dataClasses[i].learnings[id1].level >= $gameVariables.value(6)){
                value1 += `[Lv${$dataClasses[i].learnings[id1].level}:\\C[2]\x1bSIN[${$dataClasses[i].learnings[id1].skillId}]\\C[0]]`;
              };
            } else {
              value1 += `[Lv${$dataClasses[i].learnings[id1].level}:\\C[2]\x1bSIN[${$dataClasses[i].learnings[id1].skillId}]\\C[0]]`;
            };
          };
        };
      valueAddDescriptionClass[i] = `${value1}`;
}};

};

//}());
