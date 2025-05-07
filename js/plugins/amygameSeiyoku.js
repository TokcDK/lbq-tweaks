/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){

//380-400の変数配列に名称設定。
Hentai380_ArrangementNameSet = function(){

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
weeks_toggleOtherH = function(){

//61は当日Ｈ回数、62は当日Ｈ回数10以上の時に記録。64は性欲499以上でＨ回数0の連続日数
for(var i = 1; i <= 20; i++){
  if(isGirl($gameActors.actor(i))){
    var actor = $gameActors.actor(i);
    if($gameVariables.value(i+380)[61] >= 10){
      $gameVariables.value(i+380)[62] += 1;//1日Ｈ回数１０回以上
    };
    if($gameVariables.value(i+380)[1] >= 499){
      if($gameVariables.value(i+380)[61] == 0){
        $gameVariables.value(i+380)[64] += 1;
      } else {
        $gameVariables.value(i+380)[64] = 0;
      };
    };
    $gameVariables.value(i+380)[61] = 0;//H回数リセット
  };
};

};

h_BattleEcstasyDirect = function(){

adv_HpartDirectPlay(3);
if($dataActors[$gameVariables.value(20)].meta['SexualZettyouLow']){
  var actor = $gameActors.actor($gameVariables.value(20));
  var value3 = 'Low';var value4 = 1;
  //if($gameActors.actor($gameVariables.value(20)).isLearnedSkill(62)){var value3 = 'Middle';var value4 = 2};
  //if($gameActors.actor($gameVariables.value(20)).isLearnedSkill(65)){var value3 = 'Hi';var value4 = 3};
  var arr1 = $dataActors[$gameVariables.value(20)].meta['SexualZettyou' + value3].split(',');
  var value1 = arr1[Math.floor(Math.random() * arr1.length)];
  var value2 = `${actor.name()}`;
  $gameVariables.setValue(21,`\\nw[${value2}]${value1}`);
  var value1 = 'Zev_BattleEcstasy'+$gameVariables.value(20)+'_'+value4;
  pic_1(0,57,value1,0,100,255,60,1280,768,0,0);
  var value1 = 51;
  var value2 = 'ScreenBattleEcstasySell5';
  picture_anime1(value1,value2,5,1,"横",10,1,true,[1,2]);
  $gameScreen.movePicture(value1,1,640,384,100,100,150,0,30);
};

};

//相手とＨ済みの場合に表示するためのスクリプト
h_keikenhyouji1 = function(id2,id1){

var value1 = id1;  
if($gameVariables.value(353)[id1-300] != 0){
  $gameActors.actor(21).setName(`\x1bnnp[${id1}]`);
} else {
  $gameActors.actor(21).setName($dataWeapons[id1].name);
};
valueScenePartnerId = id1;
if($gameVariables.value($gameVariables.value(20)+360)[value1-100] >= 1){
  h_partnerFullName(22,value1);
  var value3 = $dataWeapons[id1].description;
  if(value3 == 0){
    var value2 = `\n`;
  }else{
    var value2 = `${$dataWeapons[id1].description}\n`;
  };
  var value4 = $gameVariables.value(22);
  value2 += `\n${value4}との\\C[27]Ｈ回数：${$gameVariables.value($gameVariables.value(20)+360)[value1-100]}\\C[0]`
  if($gameVariables.value($gameVariables.value(20)+360)[value1+100] >= 1){
    value2 += `　${value4}との子${$gameVariables.value($gameVariables.value(20)+360)[value1+100]}人`
  };
  if($gameVariables.value($gameVariables.value(20)+360)[value1] >= 1){
    value2 += `　${value4}の子を宿しているかも知れない…。`
  };
  $gameVariables.setValue(id2,`【${value2}】`);
} else {
  $gameVariables.setValue(id2,0);
};

};

//相手とＨ済みの場合に表示するためのスクリプト
h_keikenhyouji2 = function(id2,id1){

if(id2 != 0){
  if(id1 == 1){
    if($gameVariables.value(id2) != 0){
      $gameScreen.dWindowFrame = 'ON';
      $gameScreen.setDTextPicture($gameVariables.value(id2), 25);  
      $gameScreen.showPicture(150,"",0,100,100,100,100,0,0);
      $gameScreen.movePicture(150,0,10,100,100,100,255,0,30);
    };
  };
};
if(id1 == 0){
  pic_move1(150,-100,100,100,100,0,60);
};


};

//固有相手とのＨ経験回数リスト
h_hennreki = function(){

for (var i = 801; i <= 810; i++) { $gameVariables.setValue(i,0) };
var value1 = 0;
var value3 = 801;
$gameVariables.setValue(value3,`一覧\n`);
var start = 1; 
var end = 100;
for (var i = start; i <= end; i++) {
  if($gameVariables.value($gameVariables.value(20)+360)[i] >= 1){
    var value2 = ` `
    value2 += `${$dataWeapons[i+300].name}：`
    value2 += `${$gameVariables.value($gameVariables.value(20)+360)[i]}回`
    if($gameVariables.value($gameVariables.value(20)+360)[i+200] >= 1){
      value2 += `【${$gameVariables.value($gameVariables.value(20)+360)[i+200]}人】`
    };
    value2 += `\n`
    $gameVariables.setValue(value3,$gameVariables.value(value3) + value2);
    value1 += 1;
    if((value1 %10) == 0){
      value3 += 1;
      $gameVariables.setValue(value3,`　\n`);
    };
}};

};

//h_partnerFullName(22,$gameVariables.value(340)); //代入変数id,相手id指定変数
h_partnerFullName = function(id3,id4){

var value4 = `\\C[23]${$dataWeapons[id4].name}\\C[0]`;
if($dataWeapons[id4].meta['FamilyName']){
  value4 += `\\C[23]=${$dataWeapons[id4].meta['FamilyName']}\\C[0]`;
};
if($dataWeapons[id4].meta['FamilyNameKanji']){
  var value4 = `\\C[23]${$dataWeapons[id4].meta['FamilyNameKanji']}\\C[0] ${value4}`;
};
if($dataWeapons[id4].meta['SubstitutionActorId']){
  var value5 = Number($dataWeapons[id4].meta['SubstitutionActorId']);
  var value4 = `\x1bSET[${value5}]`;
};
$gameVariables.setValue(id3,value4);

};

//Ｈ経験値更新
h_exp = function(id1,picname,id2,value1,value2,value3){

$gameVariables.setValue(339,0); 
$gameVariables.setValue(20,id1); 
$gameVariables.setValue(193,picname);
$gameVariables.value($gameVariables.value(20)+380)[46] = $gameVariables.value(193);
$gameSwitches.setValue(121,value1);//非表示
$gameSwitches.setValue(122,value2);//性欲性感のみ簡易主にアイテム使用時
$gameSwitches.setValue(123,value3);//過去シーンならオン
$gameVariables.setValue(340,id2);//301汎用
$gameVariables.setValue(94,$gameActors.actor($gameVariables.value(20)).name());
$gameVariables.setValue(22,$dataWeapons[$gameVariables.value(340)].name);
if($dataWeapons[$gameVariables.value(340)].meta['NumberOfPeople']){
  $gameVariables.setValue(339,Number($dataWeapons[$gameVariables.value(340)].meta['NumberOfPeople']));
};

};

//性経験値加算式
h_exp1 = function(id0,id1,id2,id3,id4,id5){

$gameVariables.setValue(406,id0);
$gameVariables.setValue(409,id1);
$gameVariables.setValue(408,id2);
$gameVariables.setValue(407,id3);
$gameVariables.setValue(413,id4);
$gameVariables.setValue(414,id5);

};

h_exp1ex = function(id){

for (var i = 1; i <= id; i++) {
  var arr1 = [6,6,6,6,7,8,8];
  var value1 = arr1[Math.floor(Math.random() * arr1.length)];
  $gameVariables.setValue(400+value1,$gameVariables.value(400+value1) + 1 );
};

};

h_exp2 = function(id0,id1,id2,id3,id5,id4){

$gameVariables.setValue(417,id0);
$gameVariables.setValue(418,id1);
$gameVariables.setValue(420,id2);
$gameVariables.setValue(419,id3);
$gameVariables.setValue(430,id5);
$gameVariables.setValue(410,id4);

};

h_exp3 = function(id0,id1,id2,id3,id4,id5,id6,id7,id8,id9,id10){

$gameVariables.setValue(421,id0);
$gameVariables.setValue(422,id1);
$gameVariables.setValue(423,id2);
$gameVariables.setValue(424,id3);
$gameVariables.setValue(425,id4);
$gameVariables.setValue(426,id5);
$gameVariables.setValue(415,id6);
$gameVariables.setValue(428,id7);
$gameVariables.setValue(411,id8);
$gameVariables.setValue(412,id9);
$gameVariables.setValue(416,id10);

};

h_exp4 = function(id0,id1,id2,id3,id4,id5,id6,id7,id8){

$gameVariables.setValue(431,id0);
$gameVariables.setValue(432,id1);
$gameVariables.setValue(433,id2);
$gameVariables.setValue(434,id3);
$gameVariables.setValue(435,id4);
$gameVariables.setValue(436,id5);
$gameVariables.setValue(437,id6);
$gameVariables.setValue(438,id7);
$gameVariables.setValue(427,id8);

};

//☆☆アクター変数20の開発度表示2
actor_Hstateshyouji2 = function(){

var actor = $gameActors.actor($gameVariables.value(20));
var value1 = 50;
var value2 = $gameVariables.value(actor.actorId()+380)[1];
var value5 = `\\fs[25]性欲発展度`;

if(!actor.isLearnedSkill(value1)){value5 += `:\\C[1]皆無\\C[0]\n`};
if(actor.isLearnedSkill(value1)){
  if(value2 <= 100){value5 += `\\C[4][圏外]\\C[0]`;var value3 = 0};
  if(value2 >= 101 && value2 <= 200){value5 += `\\C[12][圏外]\\C[0]`;var value3 = 1};
  if(value2 >= 201 && value2 <= 300){value5 += `\\C[4][E]\\C[0]`;var value3 = 2};
  if(value2 >= 301 && value2 <= 400){value5 += `\\C[12][D]\\C[0]`;var value3 = 3};
  if(value2 >= 401 && value2 <= 500){value5 += `\\C[5][C]\\C[0]`;var value3 = 4};
  if(value2 >= 501 && value2 <= 600){value5 += `\\C[13][B]\\C[0]`;var value3 = 5};
  if(value2 >= 601 && value2 <= 700){value5 += `\\C[27][A]\\C[0]`;var value3 = 6};
  if(value2 >= 701 && value2 <= 800){value5 += `\\C[30][S]\\C[0]`;var value3 = 7};
  if(value2 >= 801 && value2 <= 900){value5 += `\\C[30][SS]\\C[0]`;var value3 = 8};
  if(value2 >= 901){value5 += `\\C[31][SSS]\\C[0]`;var value3 = 9};
  if(value3 >= 1){
    value5 += `:\\C[27]<${$dataSkills[value3+60].name}>\\C[0]\n`;
  } else {
    value5 += `\n`;
  };
};
var start = 51; var end = 59;
for (var i = start; i <= end; i++) {
  value5 += `${$dataSkills[i].name}`;
  if(!actor.isLearnedSkill(i)){value5 += `:\\C[1]未開発\\C[0]\n`};
  if(actor.isLearnedSkill(i)){
    if(actor.skillMasteryLevel(i) <= 1){value5 += `\\C[4][E]\\C[0]`};
    if(actor.skillMasteryLevel(i) == 2){value5 += `\\C[12][D]\\C[0]`};
    if(actor.skillMasteryLevel(i) == 3){value5 += `\\C[5][C]\\C[0]`};
    if(actor.skillMasteryLevel(i) == 4){value5 += `\\C[13][B]\\C[0]`};
    if(actor.skillMasteryLevel(i) == 5){value5 += `\\C[27][A]\\C[0]`};
    if(actor.skillMasteryLevel(i) >= 6){value5 += `\\C[30][S]\\C[0]`};
    var list = valueHstaSuppression;
    list.forEach(function(id) {
      if( actor.isLearnedSkill(id) && !actor.isLearnedSkill(Number($dataSkills[id].meta['Hide if Learned Skill'])) ){
        var value1 = Number($dataSkills[id].meta['HstaSuppression'].split(',')[0]);
        var value2 = Number($dataSkills[id].meta['HstaSuppression'].split(',')[1]);
          if(value1 == 0){
            for (var value1 = 431; value1 <= 439; value1++) {
              if(value1-380 == id && actor.skillMasteryLevel(i) == value2){
                value5 += `[ランク制限]`;
              };
            };
          };
          if(value1 >= 431 && value1 <= 439){
            if(value1-380 == id && actor.skillMasteryLevel(i) == value2){
              value5 += `[ランク制限]`;
            };
          };
      };
    }, this);
    value5 += `(${ actor.skillMasteryUses(i) }/${actor.skillMasteryUsageMax(i)}):`;
    value5 += `${$dataSkills[i].meta['RankSetWord' + actor.skillMasteryLevel(i)]}\n`;
  };
};
WindowManager.show(1, 0, 200, 768, 386);
WindowManager.drawText(1, value5);

};

//☆☆アクター変数20のＨステータス表示1
actor_Hstateshyouji1 = function(){

if(!$gameSwitches.value(496) && !$gameSwitches.value(130) && $gameVariables.value(193) == 0){
  var value1 = 0 + 128;var value2 = 379 + 128;
  $gameVariables.setValue(313,128);
} else {
  var value1 = 0;var value2 = 379;
};
WindowManager.show(1, value1, 200, 379, 390);
WindowManager.show(2, value2, 200, 389, 390);
var actor = $gameActors.actor($gameVariables.value(20));
var value = $gameVariables.value($gameVariables.value(20)+380);
var id1 = 400;
//性欲度表示用情報を書き込み
var start = 1; var end = 40;
for (var i = start; i <= end; i++) {
  if($gameVariables.value(id1 + i) >= 1){
    var value1 = `\\C[2]+${$gameVariables.value(id1 + i)}\\C[0]`;
  }else{
    var value1 = '　';
  }
  eval("valueWordSet" + i +" = value1");
};
var value3 = `\\fs[24]`;
var list = [6,7,8,9,10,11,12,16,13,14,15];
list.forEach(function(i) {
  value3 += `\\C[27]${$dataSystem.variables[id1+i]}\\C[0]${value[i]}回${eval("valueWordSet" + i)}\n`;
}, this);
WindowManager.drawText(1, value3);

var value4 = `\\fs[24]`;
var list = [17,18,19,30,20,21,22,23,24,25,26,28];
list.forEach(function(i) {
  value4 += `\\C[27]${$dataSystem.variables[id1+i]}\\C[0]${value[i]}回${eval("valueWordSet" + i)}\n`;
}, this);
WindowManager.drawText(2, value4);

if(!$gameSwitches.value(130)){
  var arr1 = [0,0,0,0,0,0,0,0,0,0];//開発度ランク0では未開発表示
  var start = 51; var end = 59;
  for (var i = start; i <= end; i++) {
    if(actor.skillMasteryLevel(i) >= 1 && actor.isLearnedSkill(i)){
      if(actor.skillMasteryLevel(i) <= 1){var value4 = `\\C[4][E]\\C[0]`};
      if(actor.skillMasteryLevel(i) == 2){var value4 = `\\C[12][D]\\C[0]`};
      if(actor.skillMasteryLevel(i) == 3){var value4 = `\\C[5][C]\\C[0]`};
      if(actor.skillMasteryLevel(i) == 4){var value4 = `\\C[13][B]\\C[0]`};
      if(actor.skillMasteryLevel(i) == 5){var value4 = `\\C[27][A]\\C[0]`};
      if(actor.skillMasteryLevel(i) >= 6){var value4 = `\\C[30][S]\\C[0]`};
      var value1 = i - 20;
      arr1[i-50] = `\x1bI[${$dataSkills[i].iconIndex}]${value4}:${actor.skillMasteryUses(i)}${eval("valueWordSet" + value1)}`;
    }else{
      arr1[i-50] = `\\C[1]未開発\\C[0]\\I[0] `;
    };
  };
  if(!$gameSwitches.value(496) && !$gameSwitches.value(130) && $gameVariables.value(193) == 0){
    var value3 = 430 + 128;
  } else {
    var value3 = 430;
  };
  WindowManager.show(3, value3, 0, 338, 202);
  WindowManager.drawText(3, `\\fs[22][開発度]\\I[0]${arr1[1]}
${arr1[2]} ${arr1[3]}
${arr1[4]} ${arr1[5]}
${arr1[6]} ${arr1[7]}
${arr1[8]} ${arr1[9]}`);
  };
};

//MVP計算用
battlerecord_mvp = function(id1){

var arr1 = [];var arr2 = [];var arr3 = [];var arr4 = [];
var arr5 = [];var arr6 = [];var arr7 = [];var arr8 = [];
for (var i = 0; i <= $gameParty.members().length-1; i++) {
  var value1 = $gameParty.members()[i]._actorId;
  var actor = $gameActors.actor(value1);
  arr1.push(actor.getAllKillEnemyCounter());
  arr2.push(actor.attackDamageMax);
  arr3.push(actor.attackDamageSum);
  arr4.push($gameVariables.value(351)[value1]);
  arr5.push(actor.acceptDamageMax);
  arr6.push(actor.acceptDamageSum);
  arr7.push(actor.deadCounter);
  arr8.push($gameVariables.value(298)[value1]);
};

var max1 = arr1.reduce(function(a,b){  
return Math.max(a,b);
});
$gameVariables.value(350)[1] = max1;
var max2 = arr2.reduce(function(a,b){  
return Math.max(a,b);
});
$gameVariables.value(350)[2] = max2;
var max3 = arr3.reduce(function(a,b){  
return Math.max(a,b);
});
$gameVariables.value(350)[3] = max3;
var max4 = arr4.reduce(function(a,b){  
return Math.max(a,b);
});
$gameVariables.value(350)[4] = max4;
var max5 = arr5.reduce(function(a,b){  
return Math.max(a,b);
});
$gameVariables.value(350)[5] = max5;
var max6 = arr6.reduce(function(a,b){  
return Math.max(a,b);
});
$gameVariables.value(350)[6] = max6;
var max7 = arr7.reduce(function(a,b){  
return Math.max(a,b);
});
$gameVariables.value(350)[7] = max7;
var max8 = arr8.reduce(function(a,b){  
return Math.max(a,b);
});
$gameVariables.value(350)[8] = max8;

};

//☆☆アクター変数20の通常ステータス表示,0と4ウィンド使用
actor_stateshyouji = function(){

if(!$gameSwitches.value(496) && !$gameSwitches.value(130) && $gameVariables.value(193) == 0){
  var value1 = 0 + 128;
} else {
  var value1 = 0;
};
WindowManager.show(0, value1, 0, 430, 202);
seiyoku_jougenn();

var actor = $gameActors.actor($gameVariables.value(20));
var value = $gameVariables.value($gameVariables.value(20)+380);
var id1 = 400;

//性欲度表示用情報を書き込み
var start = 1; var end = 40;
for (var i = start; i <= end; i++) {
  if($gameVariables.value(id1 + i) >= 1){
    var value1 = `\\C[2]+${$gameVariables.value(id1 +i)}\\C[0]`;
  }else{
    var value1 = '　';
  }
  eval("valueWordSet" + i +" = value1");
};

//現在のＨステートを変数643に代入
var value1 = 0;
$gameVariables.setValue(value1+643,`\\I[16]`);
var list = valueHstateDisplay;
list.forEach(function(id) {
  if(actor.isStateAffected(id)){
    $gameVariables.setValue(value1+643,$gameVariables.value(value1+643)+`\\I[${$dataStates[id].iconIndex}]`)
}}, this);
if(actor.isLearnedSkill(74)){
  var value30 = 500;
};
if(actor.isLearnedSkill(72)){
  var value30 = 200;
};
var value2 = `\\fs[24]\\C[1]${actor.nickname()}\\C[0]\n`;
value2 += `\x1bSET[${actor.actorId()}]\n`;
if(isGirl($gameActors.actor($gameVariables.value(20)))){
  if(value[0] == 0){var value3 = ` `}else{var value3 = `<${value[0]}>`};
  value2 += `\\C[27]${$dataSystem.variables[id1+1]}\\C[0]${value[1]}${value3}${eval("valueWordSet" + 1)}`;
  value2 += `\\C[27]${$dataSystem.variables[id1+2]}\\C[0]${value[2]}${eval("valueWordSet" + 2)}\n`;
  value2 += `\\C[27]${$dataSystem.variables[id1+4]}\\C[0]${value[4]}<${value[5]}>`;
  if(actor.isLearnedSkill(65)){
    value2 += `\\C[27]${$dataSystem.variables[id1+3]}\\C[0]${value[3]}%　\n`;
  } else {
    value2 += `\\C[27]${$dataSystem.variables[id1+3]}\\C[0]───%　\n`;
  };
  value2 += `\\V[643]`;
};
WindowManager.drawText(0, value2);
if($gameSwitches.value(130)){
  var value21 = $gameVariables.value(351)[$gameVariables.value(20)];
  var value22 = $gameVariables.value(298)[$gameVariables.value(20)];
  var value11 = $gameVariables.value(350)[1];
  var value12 = $gameVariables.value(350)[2];
  var value13 = $gameVariables.value(350)[3];
  var value14 = $gameVariables.value(350)[4];
  var value15 = $gameVariables.value(350)[5];
  var value16 = $gameVariables.value(350)[6];
  var value17 = $gameVariables.value(350)[7];
  var value18 = $gameVariables.value(350)[8];
  if(value11 == 0){
    value11 = ``;
  } else {
    if(value11 == actor.getAllKillEnemyCounter()){value11 = `\\C[17][MVP!]\\C[0]`}else{value11 = ``};
  };
  if(value12 == 0){
    value12 = ``;
  } else {
    if(value12 == actor.attackDamageMax){         value12 = `\\C[17][MVP!]\\C[0]`}else{value12 = ``};
  };
  if(value13 == 0){
    value13 = ``;
  } else {
    if(value13 == actor.attackDamageSum){         value13 = `\\C[17][MVP!]\\C[0]`}else{value13 = ``};
  };
  if(value14 == 0){
    value14 = ``;
  } else {
    if(value14 == value21)              {         value14 = `\\C[17][MVP!]\\C[0]`}else{value14 = ``};
  };
  if(value15 == 0){
    value15 = ``;
  } else {
    if(value15 == actor.acceptDamageMax){         value15 = `\\C[17][MVP!]\\C[0]`}else{value15 = ``};
  };
  if(value16 == 0){
    value16 = ``;
  } else {
    if(value16 == actor.acceptDamageSum){         value16 = `\\C[17][MVP!]\\C[0]`}else{value16 = ``};
  };
  if(value17 == 0){
    value17 = ``;
  } else {
    if(value17 == actor.deadCounter){             value17 = `\\C[10][WORST…]\\C[0]`}else{value17 = ``};
  };
  if(value18 == 0){
    value18 = ``;
  } else {
    if(value18 == value22)          {             value18 = `\\C[17][MVP!]\\C[0]`}else{value18 = ``};
  };
var value10 = `\\C[16]<Battle Record!>\\C[0]
TotalKill  :\\C[10]${actor.getAllKillEnemyCounter()}\\C[0]${value11}
MaxAssalt  :\\C[10]${actor.attackDamageMax}\\C[0]${value12}
TotalAssalt:\\C[10]${actor.attackDamageSum}\\C[0]${value13}
Critical   :\\C[10]${value22}\\C[0]${value18}
OverKill   :\\C[10]${value21/2}\\C[0]${value14}
MaxDamage  :\\C[1]${actor.acceptDamageMax}\\C[0]${value15}
TotalDamage:\\C[1]${actor.acceptDamageSum}\\C[0]${value16}
Defead     :\\C[1]${actor.deadCounter}\\C[0]${value17}
`;
WindowManager.show(1, 0, 200, 500, 389);
WindowManager.drawText(1, value10);
};
var value1 = 0; var value2 = 0;var value3 = 0;
var value4 = 0; var value5 = 0; var value6 = 0;
var value7 = 0;
for (var i = 1; i <= $dataSkills.length-1; i++) {
  if (!$dataSkills[i].name == '') {
    if($dataSkills[i].stypeId == 2){value1 += actor.getSkillUseCounter(i)};
    if($dataSkills[i].stypeId == 5){value2 += actor.getSkillUseCounter(i)};
    if($dataSkills[i].stypeId == 6){value3 += actor.getSkillUseCounter(i)};
    if($dataSkills[i].stypeId == 7){value4 += actor.getSkillUseCounter(i)};
    if($dataSkills[i].stypeId == 8){value5 += actor.getSkillUseCounter(i)};
    if($dataSkills[i].stypeId == 12){value6 += actor.getSkillUseCounter(i)};
    if($dataSkills[i].stypeId == 13){value7 += actor.getSkillUseCounter(i)};
}};
var value6 = `\\C[16]<Skill Record!>\\C[0]
Attack   :${value1}
S-Ability:${value2}
A-Ability:${value3}
W-Ability:${value4}
R-Ability:${value5}
Burst!   :${value6}
Chain!   :${value7}
`;
WindowManager.show(2, 500, 200, 268, 389);
WindowManager.drawText(2, value6);
if($gameSwitches.value(130)){
  WindowManager.show(4, 430, 0, 340, 202);
  hstates_heights($gameVariables.value(20),253);
  WindowManager.drawText(4, `\\V[253]`);
};

};
//☆☆性欲度上限計算。露出計算時とＨプロフ表示時に一緒にやっておく
seiyoku_jougenn = function(){

const gameVar20 = $gameVariables.value(20);
const gameVar20_300 = gameVar20 + 380;
const gameVar_20_300Array = $gameVariables.value(gameVar20_300);
gameVar_20_300Array[0] = 0;
const actor = $gameActors.actor(gameVar20);
for (const id of valueHstaSuppression) {
  if(!actor.isLearnedSkill(id)) continue;
  const skill = $dataSkills[id];
  if (actor.isLearnedSkill(Number(skill.meta['Hide if Learned Skill']))) continue;

  const arr1 = skill.meta['HstaSuppression'].split(',');
  const arr1_0n = Number(arr1[0]);
  if (arr1_0n == 0 || arr1_0n == 401) {
    const value2 = Number(arr1[1]) * 100;
    if (gameVar_20_300Array[0] == 0 || value2 <= gameVar_20_300Array[0]) {
      gameVar_20_300Array[0] = value2 - 1;
    }
  }
}

};

//☆☆限界露出値計算
const rosyutu_genkai_id1 = 400
const rosyutu_genkai_id2 = 55;
rosyutu_genkai = function(){

  const gameVar20 = $gameVariables.value(20);
  const actor = $gameActors.actor(gameVar20);
  const id = rosyutu_genkai_id1 + 5;
  $gameVariables.setValue(id,100);
  const actorSkillLevel = actor.skillMasteryLevel(rosyutu_genkai_id2);
  switch (actorSkillLevel) {
    case 1:
      $gameVariables.setValue(id, 90);
      break;
    case 2:
      $gameVariables.setValue(id, 70);
      break;
    case 3:
      $gameVariables.setValue(id, 50);
      break;
    case 4:
      $gameVariables.setValue(id, 30);
      break;
    case 5:
      $gameVariables.setValue(id, 10);
      break;
    case 6:
      $gameVariables.setValue(id, 0);
      break;
    default:
      break;
  }
  $gameVariables.value(gameVar20 +380)[5] = $gameVariables.value(id);
  $gameVariables.setValue(id,0);

seiyoku_jougenn();

};

//☆☆現在露出度計上
const rosyutu_genzai_ids = [
  461, 462, 463, 464, 465, 466, 467, 468, 469, 470,
  471, 472, 473, 474, 475, 476, 477, 478, 479, 480,
  481, 482, 483, 484, 485, 486, 487, 488, 489, 490,
  491, 492, 493, 494, 495, 496, 497, 498, 499, 500];
rosyutu_genzai = function(){

  $gameVariables.setValue(404, 0);
  const gameVar20 = $gameVariables.value(20);
  const gameVar20_180 = gameVar20 + 180;
  const gameVar20_380 = gameVar20 + 380;
  const itemsLen = $dataItems.length;
  for (var i = 1201; i < itemsLen; i++) {
    const item = $dataItems[i];
    if (item.meta['TotalCloth']) continue;

    const itemMetaEICSwitchNum = Number(item.meta['EICSwitch']);
    const itemMetaClothSwitchNum_460 = Number(item.meta['ClothSwitch']) + 460;
    const itemMetaClothAllocationNumberNum = Number(item.meta['ClothAllocationNumber']);
    const itemMetaClothUncoverCountNum = Number(item.meta['ClothUncoverCount']);
    for (const id of rosyutu_genzai_ids) {
      switch (itemMetaEICSwitchNum) {
        case gameVar20_180:
        case gameVar20_380:
        case 200:
          break;
        default:
          continue;
      }

      if (id !== itemMetaClothSwitchNum_460 
        || $gameVariables.value(id) !== itemMetaClothAllocationNumberNum) continue;

      $gameVariables.setValue(404, $gameVariables.value(404) + itemMetaClothUncoverCountNum);
    }
  }

  $gameVariables.value(gameVar20_380)[4] = $gameVariables.value(404);
  $gameVariables.setValue(404, 0);
};

//受精するかどうかの計算
jusei_keisan = function(){

var value1 = 11;
var actor = $gameActors.actor($gameVariables.value(20));
if(!actor.isStateAffected(83) && actor.isLearnedSkill(65)){
  if($gameVariables.value(400 + value1) >= 1){
    var value2 = $gameVariables.value($gameVariables.value(20)+380)[3];
    if(value2 >= 1){
      var value3 = Math.floor( Math.random() * 101);
      if(value2 >= value3 || actor.battleSkillsRaw().includes(873) || actor.isStateAffected(75)){
        if(actor.battleSkillsRaw().includes(874) || actor.isStateAffected(76)){
          var value5 = `${actor.name()}は\\C[27]${$dataSkills[874].name}\\C[0]の効果により受精を退けた。`;
          CommonPopupManager.showInfo({},value5,null);
        } else {
          actor.addState(79);
          if($gameVariables.value(340) >= 1){
            var value4 = $gameVariables.value(340)-200;//101-200の間
            $gameVariables.value($gameVariables.value(20)+360)[value4] += 1;
          };
        };
}}}};

};

//受精してるキャラ以外の受精相手記録を消滅
jusei_clear = function(){

var list = $gameVariables.value(247);
list.forEach(function(id) {
  $gameVariables.setValue(20,id);
  var actor = $gameActors.actor(id);
  actor.removeState(79);//受精前段階ステート消滅
  if(!actor.isStateAffected(82)){
    for (var i = 101; i <= 200; i++) {
      if($gameVariables.value($gameVariables.value(20)+360)[i] >= 1){
        $gameVariables.value($gameVariables.value(20)+360)[i] = 0;
  }}};
}, this);

};

//☆☆Ｈステのうち、身長等
hstates_heights = function(id,id2){

if(isGirl($gameActors.actor(id))){
  var actor = $dataActors[id];
  var actor1 = $gameActors.actor(id);
  if(actor1.elementRate(37) >= 1.1){
    var value11 = `\\fs[25]Reproduction:${Math.round(actor1.elementRate(37))}%`;
  } else{
    var value11 = ``;
  };
  var value1 = Number( actor.meta['HeightEtc'].split(',')[0] );//身長
  var value2 = Number( actor.meta['HeightEtc'].split(',')[1] );//体重
  var value3 = Number( actor.meta['HeightEtc'].split(',')[2] );//バスト
  var value4 = Number( actor.meta['HeightEtc'].split(',')[3] );//ウェスト
  var value5 = Number( actor.meta['HeightEtc'].split(',')[4] );//ヒップ
  var value9 = 0;//体型変化による影響数値
//スキルによる増加valuePhysiquUp
  var list = valuePhysiquUp;
  list.forEach(function(i) {
    if( $dataSkills[i].meta['BodyWeightChange'] && $gameActors.actor(id).battleSkillsRaw().includes(i) ){
      value2 += Number($dataSkills[i].meta['BodyWeightChange']);
      value9 += 1;
    };
    if( $dataSkills[i].meta['BustSizeChange'] && $gameActors.actor(id).battleSkillsRaw().includes(i) ){
      value3 += Number($dataSkills[i].meta['BustSizeChange']);
      value9 += 1;
    };
    if( $dataSkills[i].meta['WaistSizeChange'] && $gameActors.actor(id).battleSkillsRaw().includes(i) ){
      value4 += Number($dataSkills[i].meta['WaistSizeChange']);
      value9 += 1;
    };
    if( $dataSkills[i].meta['HipSizeChange'] && $gameActors.actor(id).battleSkillsRaw().includes(i) ){
      value5 += Number($dataSkills[i].meta['HipSizeChange']);
    value9 += 1;
    };
  }, this);
//妊娠時の増加
  value2 += $gameVariables.value(id+380)[42];
  value3 += $gameVariables.value(id+380)[43];
  value4 += $gameVariables.value(id+380)[44];
  value5 += $gameVariables.value(id+380)[45];
  var value6 = (value3 - (value1*0.435 - (value1*0.38-value4))) + 2;//カップサイズ測定。最後に+2を独自挿入
//カップ測定
  if(value6 <= 2.49){value6 = `AAAAA`};
  if(value6 <= 4.99){value6 = `AAAA`};
  if(value6 <= 7.49){value6 = `AAA`};
  if(value6 <= 9.99){value6 = `AA`};
  if(value6 <= 12.49){value6 = `A`};
  if(value6 <= 14.99){value6 = `B`};
  if(value6 <= 17.49){value6 = `C`};
  if(value6 <= 19.99){value6 = `D`};
  if(value6 <= 22.49){value6 = `E`};
  if(value6 <= 24.99){value6 = `F`};
  if(value6 <= 27.49){value6 = `G`};
  if(value6 <= 29.99){value6 = `H`};
  if(value6 <= 32.49){value6 = `I`};
  if(value6 <= 34.99){value6 = `J`};
  if(value6 <= 37.49){value6 = `K`};
  if(value6 <= 39.99){value6 = `L`};
  if(value6 <= 42.49){value6 = `M`};
  if(value6 <= 44.99){value6 = `N`};
  if(value6 <= 47.49){value6 = `O`};
  if(value6 <= 49.99){value6 = `P`};
  if(value6 <= 52.49){value6 = `Q`};
  if(value6 <= 54.99){value6 = `R`};
  if(value6 <= 57.49){value6 = `S`};
  if(value6 <= 59.99){value6 = `T`};
  if(value6 >= 60){value6 = `──`};
  var value8 = ``;
  var value10 = valuePhysiquUp.length;
  if($dataActors[id].meta['BodyStyle']){
    if(value9 >= value10*2){
      value8 += `\\C[27][${$dataItems[742].name}]\\C[0]`;
      if(id == $gameVariables.value(2)){$gameVariables.setValue(612,value10*2)};
    } else {
      if(value9 >= value10){
        value8 += `\\C[27][${$dataItems[741].name}]\\C[0]`;
        if(id == $gameVariables.value(2)){$gameVariables.setValue(611,value10)};
      } else {
        if(value9 >= value10/2){
          //value8 += `\\V[27][Ｈな${$dataActors[id].meta['BodyStyle']}]\\C[0]`;
          value8 += `\\C[21][${$dataActors[id].meta['BodyStyle']}]\\C[0]`;
        } else {
          value8 += `\\C[21][${$dataActors[id].meta['BodyStyle']}]\\C[0]`;
  }}}};
  var value7 = `\\C[27][処女ヒロイン]\\C[0]`
  if($gameVariables.value(id+380)[6] >= 1){
    var value7 = `\\C[0][非処女ヒロイン]\\C[0]`
  };
  if($gameVariables.value(id+380)[6] >= 100){
    var value7 = `\\C[31][中古ヒロイン]\\C[0]`
  };
  if($gameVariables.value(id+380)[6] >= 1000){
    var value7 = `\\C[30][中古]\\C[0]`
  };
  $gameVariables.setValue(id2,
  `\\fs[25]\\C[16]HT:\\C[0]${value1}\\C[16]cm\\C[0]　\\C[16]WT:\\C[0]${value2}\\C[16]kg\\C[0]
\\C[16]Cup:\\C[0][${value6}] \\C[16]B:\\C[0]${value3} \\C[16]W:\\C[0]${value4} \\C[16]H:\\C[0]${value5}
${value8}
${value7}
${value11}`);
  $gameVariables.value(id+380)[51] = value1;
  $gameVariables.value(id+380)[52] = value2;
  $gameVariables.value(id+380)[53] = value3;
  $gameVariables.value(id+380)[54] = value4;
  $gameVariables.value(id+380)[55] = value5;
  $gameVariables.value(id+380)[56] = value6;
} else {
  if($dataActors[id].meta['BodyStyle']){
    $gameVariables.setValue(id2,`\\C[21][${$dataActors[id].meta['BodyStyle']}]\\C[0]`);
  } else {
    $gameVariables.setValue(id2,`NoData`);
  };
};

};

//☆☆Hスキル習得通常パターン
hskill_learn = function(id1){

var actor = $gameActors.actor($gameVariables.value(20));  
var list = valueGetHskillLearn;
list.forEach(function(i) {
  if(id1 == 1){var valueLearn = !actor.isLearnedSkill(i)};
  if(id1 == 2){var valueLearn = actor.isLearnedSkill(i)};
  if(valueLearn){
    $gameVariables.setValue(641,0);
    if($gameVariables.value(340) >= 1){
      var value1 = $gameVariables.value(340)-300;
      var value2 = $gameVariables.value($gameVariables.value(20)+360)[value1];
      $gameVariables.setValue(641,value2);
    };
    $gameVariables.value($gameVariables.value(20)+380)[63] = $gameVariables.value($gameVariables.value(20)+360)[6];//武器ID306の性欲薬使用回数を計上
    if($dataSkills[i].meta['PremiseSkill1']){var value1 = Number($dataSkills[i].meta['PremiseSkill1'])} else {var value1 = 407};
    if($dataSkills[i].meta['PremiseSkill2']){var value2 = Number($dataSkills[i].meta['PremiseSkill2'])} else {var value2 = 407};
    if($dataSkills[i].meta['PremiseSkill3']){var value3 = Number($dataSkills[i].meta['PremiseSkill3'])} else {var value3 = 407};
    if($dataSkills[i].meta['PremiseSkillRank1']){var value4 = Number($dataSkills[i].meta['PremiseSkillRank1'].split(',')[0])} else {var value4 = 407};
    if($dataSkills[i].meta['PremiseSkillRank2']){var value5 = Number($dataSkills[i].meta['PremiseSkillRank2'].split(',')[0])} else {var value5 = 407};
    if($dataSkills[i].meta['PremiseSkillRank3']){var value6 = Number($dataSkills[i].meta['PremiseSkillRank3'].split(',')[0])} else {var value6 = 407};
    if($dataSkills[i].meta['PremiseSkillRank1']){var value7 = Number($dataSkills[i].meta['PremiseSkillRank1'].split(',')[1])} else {var value7 = 0};
    if($dataSkills[i].meta['PremiseSkillRank2']){var value8 = Number($dataSkills[i].meta['PremiseSkillRank2'].split(',')[1])} else {var value8 = 0};
    if($dataSkills[i].meta['PremiseSkillRank3']){var value9 = Number($dataSkills[i].meta['PremiseSkillRank3'].split(',')[1])} else {var value9 = 0};
    if($dataSkills[i].meta['PremiseVariable1']){var value10 = Number($dataSkills[i].meta['PremiseVariable1'].split(',')[0])} else {var value10 = 2};
    if($dataSkills[i].meta['PremiseVariable2']){var value11 = Number($dataSkills[i].meta['PremiseVariable2'].split(',')[0])} else {var value11 = 2};
    if($dataSkills[i].meta['PremiseVariable3']){var value12 = Number($dataSkills[i].meta['PremiseVariable3'].split(',')[0])} else {var value12 = 2};
    if($dataSkills[i].meta['PremiseVariable1']){var value13 = Number($dataSkills[i].meta['PremiseVariable1'].split(',')[1])} else {var value13 = 0};
    if($dataSkills[i].meta['PremiseVariable2']){var value14 = Number($dataSkills[i].meta['PremiseVariable2'].split(',')[1])} else {var value14 = 0};
    if($dataSkills[i].meta['PremiseVariable3']){var value15 = Number($dataSkills[i].meta['PremiseVariable3'].split(',')[1])} else {var value15 = 0};
    if($dataSkills[i].meta['PremiseArrangement1']){var value16 = Number($dataSkills[i].meta['PremiseArrangement1'].split(',')[0])} else {var value16 = 0};
    if($dataSkills[i].meta['PremiseArrangement2']){var value17 = Number($dataSkills[i].meta['PremiseArrangement2'].split(',')[0])} else {var value17 = 0};
    if($dataSkills[i].meta['PremiseArrangement3']){var value18 = Number($dataSkills[i].meta['PremiseArrangement3'].split(',')[0])} else {var value18 = 0};
    if($dataSkills[i].meta['PremiseArrangement1']){var value19 = Number($dataSkills[i].meta['PremiseArrangement1'].split(',')[1])} else {var value19 = 0};
    if($dataSkills[i].meta['PremiseArrangement2']){var value20 = Number($dataSkills[i].meta['PremiseArrangement2'].split(',')[1])} else {var value20 = 0};
    if($dataSkills[i].meta['PremiseArrangement3']){var value21 = Number($dataSkills[i].meta['PremiseArrangement3'].split(',')[1])} else {var value21 = 0};
    if($dataSkills[i].meta['MainCharaPremise']){var value22 = $gameVariables.value(2)}else {var value22 = 0};
    if($dataSkills[i].meta['SkillLearningClass']){var value22 = 100};//あったらここでは習得させない
    if(value22 == 0 || value22 == $gameVariables.value(20)){
      if( actor.isLearnedSkill(value1) &&
      actor.isLearnedSkill(value2) &&
      actor.isLearnedSkill(value3) &&
      actor.skillMasteryLevel(value4) >= value7 &&
      actor.skillMasteryLevel(value5) >= value8 &&
      actor.skillMasteryLevel(value6) >= value9 &&
      $gameVariables.value(value10) >= value13 &&
      $gameVariables.value(value11) >= value14 &&
      $gameVariables.value(value12) >= value15 &&
      $gameVariables.value(380 + $gameVariables.value(20))[value16] >= value19 &&
      $gameVariables.value(380 + $gameVariables.value(20))[value17] >= value20 &&
      $gameVariables.value(380 + $gameVariables.value(20))[value18] >= value21
      ){
        actor.learnSkill(i);
        var value0 = `──\\C[2]H-Passive\\C[0]\\C[27]\x1bSIN[${i}]\\C[0]Expression…──\n`;
        value0 += `${$dataSkills[i].description}\\C[0]\n`;
        eval("valueWordSet" + valueCountSet2 +" += value0");
        valueCountSet1 += 1;
        if((valueCountSet1 %6) == 0){
          valueCountSet2 += 1;
          var value1 = `\\FS[28]\\C[10]<H-Passive Expression!>\\FS[25]\\C[0]\n`;
          eval("valueWordSet" + valueCountSet2 +" = value1");
        };
      } else {
      //リセット時のみ実行。スキル忘却
        if(id1 == 2){
        actor.forgetSkill(i);
        var value1 = `──${$dataSkills[i].name}忘却…──`;
        CommonPopupManager.showInfo({},value1,null);
        };
      };
    };
  } else {
    if($dataSkills[i].meta['LostHSkill']){
      if($dataSkills[i].meta['PremiseVariable1']){
        if($gameVariables.value(Number($dataSkills[i].meta['PremiseVariable1'].split(',')[0])) < Number($dataSkills[i].meta['PremiseVariable1'].split(',')[1])){
          actor.forgetSkill(i);
        };
      };
    };
  };
}, this);
if(valueHskillLearnArr != 0 && id1 == 1){
  for (var i = 0; i <= valueHskillLearnArr.length-1; i++) {
    var value0 = `──\\C[2]H-Passive\\C[0]\\C[27]\x1bSIN[${valueHskillLearnArr[i]}]\\C[0]RankUp!──\n`;
    value0 += `${$dataSkills[valueHskillLearnArr[i]].description}\\C[0]\n`;
    eval("valueWordSet" + valueCountSet2 +" += value0");
    valueCountSet1 += 1;
      if((valueCountSet1 %6) == 0){
        valueCountSet2 += 1;
        var value1 = `\\FS[28]\\C[10]<H-Passive Expression!>\\FS[25]\\C[0]\n`;
        eval("valueWordSet" + valueCountSet2 +" = value1");
      };
  };
};
if(id1 == 1){
hskill_learn2();
};

};

//☆☆Hスキル習得やアイテム入手特殊パターン
hskill_learn2 = function(){

var actor = $gameActors.actor($gameVariables.value(20));
var value2 = 55;//露出開発度
var value1 = zenravalueId;//全裸
var value3 = 1;
if(actor.skillMasteryLevel(value2) >= value3 && !$gameParty.hasItem($dataItems[value1])){
  $gameParty.gainItem($dataItems[value1], 1);
  var value0 = `──\\C[2]${$dataSkills[value2].name}\\C[0]が${value3}到達！　\\C[27]\x1bIIN[${value1}]\\C[0]Get!──\n`;
  value0 += `${$dataItems[value1].description}\\C[0]\n`;
  eval("valueWordSet" + valueCountSet2 +" += value0");
  valueCountSet1 += 1;
    if((valueCountSet1 %6) == 0){
      valueCountSet2 += 1;
      var value1 = `\\FS[28]\\C[10]<H-Passive Expression!>\\FS[25]\\C[0]\n`;
      eval("valueWordSet" + valueCountSet2 +" = value1");
    };
};
var value1 = clothPartsChoice;//パーツ指定
var value3 = 2;
if(actor.skillMasteryLevel(value2) >= value3 && !$gameParty.hasItem($dataItems[value1])){
  $gameParty.gainItem($dataItems[value1], 1);
  var value0 = `──\\C[2]${$dataSkills[value2].name}\\C[0]が${value3}到達！　\\C[27]\x1bIIN[${value1}]\\C[0]Get!──\n`;
  value0 += `${$dataItems[value1].description}\\C[0]\n`;
  eval("valueWordSet" + valueCountSet2 +" += value0");
  valueCountSet1 += 1;
    if((valueCountSet1 %6) == 0){
      valueCountSet2 += 1;
      var value1 = `\\FS[28]\\C[10]<H-Passive Expression!>\\FS[25]\\C[0]\n`;
      eval("valueWordSet" + valueCountSet2 +" = value1");
    };
};
var value1 = 'ClothBreakage';//ClothType指定
var value3 = 3;
if(actor.skillMasteryLevel(value2) >= value3){
for (var i = 1; i <= $dataItems.length-1; i++) {
  if($dataItems[i].meta['subCategory'] && $dataItems[i].meta['ClothType'] && $dataItems[i].meta['TotalCloth']){
    if($gameParty.hasItem($dataItems[i])){
      for (var j = 1; j <= $dataItems.length-1; j++) {
        if($dataItems[j].meta['subCategory'] && $dataItems[j].meta['ClothType']){
          if($dataItems[i].meta['subCategory'] == $dataItems[j].meta['subCategory']){
            if($dataItems[j].meta['ClothType'] == value1){
              if(!$gameParty.hasItem($dataItems[j])){
                clothes_get($gameVariables.value(20),$dataItems[j].meta['subCategory'],$dataItems[j].meta['ClothType']);
                var value0 = `──\\C[2]${$dataSkills[value2].name}:Rank${value3}\\C[0]の効果により、\\C[27]\x1bIIN[${j}]\\C[0]Get!──\n`;
                eval("valueWordSet" + valueCountSet2 +" += value0");
                valueCountSet1 += 1;
                if((valueCountSet1 %6) == 0){
                  valueCountSet2 += 1;
                  var value1 = `\\FS[28]\\C[10]<H-Passive Expression!>\\FS[25]\\C[0]\n`;
                  eval("valueWordSet" + valueCountSet2 +" = value1");
                };
                break;
              } else {
                break;
              };
}}}}}}}};
var value1 = '改';//ClothType指定
var value3 = 4;
if(actor.skillMasteryLevel(value2) >= value3){
for (var i = 1; i <= $dataItems.length-1; i++) {
  if($dataItems[i].meta['subCategory'] && $dataItems[i].meta['ClothType'] && $dataItems[i].meta['TotalCloth']){
    if($gameParty.hasItem($dataItems[i])){
      for (var j = 1; j <= $dataItems.length-1; j++) {
        if($dataItems[j].meta['subCategory'] && $dataItems[j].meta['ClothType']){
          if($dataItems[i].meta['subCategory'] == $dataItems[j].meta['subCategory']){
            if($dataItems[j].meta['ClothType'] == value1){
              if(!$gameParty.hasItem($dataItems[j])){
                clothes_get($gameVariables.value(20),$dataItems[j].meta['subCategory'],$dataItems[j].meta['ClothType']);
                var value0 = `──\\C[2]${$dataSkills[value2].name}:Rank${value3}\\C[0]の効果により、\\C[27]\x1bIIN[${j}]\\C[0]Get!──\n`;
                eval("valueWordSet" + valueCountSet2 +" += value0");
                valueCountSet1 += 1;
                if((valueCountSet1 %6) == 0){
                  valueCountSet2 += 1;
                  var value1 = `\\FS[28]\\C[10]<H-Passive Expression!>\\FS[25]\\C[0]\n`;
                  eval("valueWordSet" + valueCountSet2 +" = value1");
                };
                break;
              } else {
                break;
              };
}}}}}}}};
var value3 = 5;
if(!$gameSwitches.value(604)){
  if(actor.skillMasteryLevel(value2) >= value3){
    $gameSwitches.setValue(604,true);
    var value0 = `──\\C[2]${$dataSkills[value2].name}\\C[0]が${value3}到達！　メニュー画面に\\C[27]着せ替え\\C[0]出現──\n`;
    value0 += `\n`;
    eval("valueWordSet" + valueCountSet2 +" += value0");
    valueCountSet1 += 1;
    if((valueCountSet1 %6) == 0){
      valueCountSet2 += 1;
      var value1 = `\\FS[28]\\C[10]<H-Passive Expression!>\\FS[25]\\C[0]\n`;
      eval("valueWordSet" + valueCountSet2 +" = value1");
    };
  };
};

var value1 = 875;//９種組み合わせ
if(!actor.isLearnedSkill(value1)){
  if(actor.skillMasteryLevel(51) >= 6 &&
     actor.skillMasteryLevel(52) >= 6 && 
     actor.skillMasteryLevel(53) >= 6 &&
     actor.skillMasteryLevel(54) >= 6 &&
     actor.skillMasteryLevel(55) >= 6 &&
     actor.skillMasteryLevel(56) >= 6 &&
     actor.skillMasteryLevel(57) >= 6 &&
     actor.skillMasteryLevel(58) >= 6 &&
     actor.skillMasteryLevel(59) >= 6){
       actor.learnSkill(value1);
       var value0 = `──\\C[2]全開発度(経験値)\\C[0]\\C[10]Max\\C[0]！　\\C[27]\x1bSIN[${value1}]\\C[0]Expression!──\n`;
       value0 += `${$dataSkills[value1].description}\\C[0]\n`;
       eval("valueWordSet" + valueCountSet2 +" += value0");
       valueCountSet1 += 1;
       if((valueCountSet1 %6) == 0){
         valueCountSet2 += 1;
         var value1 = `\\FS[28]\\C[10]<H-Passive Expression!>\\FS[25]\\C[0]\n`;
         eval("valueWordSet" + valueCountSet2 +" = value1");
       };
  };
};

};

//☆☆Ｈパッシブ未収得分の条件提示
actor_HpassiveConditions = function(a,b,itemId){

if($gameSwitches.value(115)){
  $gameSwitches.setValue(115,false)
  WindowManager.hide(1);
} else {
  if(isGirl($gameActors.actor(b.actorId()))){
    $gameSwitches.setValue(115,true)
    var actor = $gameActors.actor(b.actorId());    
    var value = `${actor.name()}の未収得\\C[27]<H-Passive>\\C[0]\n`
    var value1 = 120;
    var value2 = 0;
    var value3 = 0;
    var start = 1;
    var end = $dataSkills.length-1;
    for (var i = start; i <= end; i++) {
      if($dataSkills[i].meta['HSkillLearn'] && !actor.isLearnedSkill(i)){
        value += `\\C[27]${$dataSkills[i].name}\\C[0]\n`;
        value += `${$dataSkills[i].meta['ADDescription']}\n`;
        value2 += 1;
      };
    };
    if(value2 >= 1){
      value3 += value2 * 60;
      WindowManager.show(1, 0, 0, 1280, value3);
      WindowManager.drawText(1, `\\fs[28]${value}`);
    } else {
      WindowManager.show(1, 0, 100, 1024, 180);
      WindowManager.drawText(1, `\\C[27]\\fs[28]H-Passive Complete!\\C[0]`);
    };
  } else {
    TickerManager.show(`${$gameActors.actor(b.actorId()).name()}は対象キャラではありません…。`);
  };
};

};

//☆スキルアイテムステート性経験値補正
hStates_up1 = function(id){

if(id == 1){ var value = $dataSkills; var value10 = valueHStatesUp1 };
if(id == 2){ var value = $dataItems; var value10 = valueHStatesUp2 };
if(id == 3){ var value = $dataStates; var value10 = valueHStatesUp3 };
var actor = $gameActors.actor($gameVariables.value(20));
var list = value10;
list.forEach(function(i) {
if( value[i].meta['HexpReflectionSkill'] && actor.battleSkillsRaw().includes(i) ){
  if(value[i].meta['HexpActivateSwi']){
    var value11 = Number(value[i].meta['HexpActivateSwi']);
  } else {
    var value11 = 2;
  };
  if($gameSwitches.value(value11)){
    var value1 = 0;
    var value2 = 0;
    var value3 = 0;
    var value6 = 0;
    if(value[i].meta['HexpReflectionSkill']){var value1 = Number(value[i].meta['HexpReflectionSkill'])};
    if(value[i].meta['HexpActivateVal']){var value2 = Number(value[i].meta['HexpActivateVal'])};
    if(value[i].meta['HexpReflectionVal']){var value3 = Number(value[i].meta['HexpReflectionVal'])};
    if(value[i].meta['HexpReflectionSkillRank']){var value6 = Number(value[i].meta['HexpReflectionSkillRank'])};
      if(value2 >= 1 && $gameVariables.value(value2) >= 1){
        var value4 = $gameVariables.value(value2) * actor.skillMasteryLevel(value1) * value6;
        $gameVariables.setValue(value3,$gameVariables.value(value3) + value4 );
        var value8 = `\\C[27]<${value[i].name}>\\C[0]発動\\C[31](+${value4})\\C[0]\\I[12]\n`;
        eval("valueWordSet" + valueCountSet2 +" += value8");
        valueCountSet1 += 1;
          if((valueCountSet1 %3) == 0){
            valueCountSet2 += 1
            var value1 = `\\C[10]H-Passive[${valueCountSet2}]\\C[0]\n`;
            eval("valueWordSet" + valueCountSet2 +" = value1");
          };
      };
  };
};
if( value[i].meta['ProstitutionMoneyUp'] && actor.battleSkillsRaw().includes(i) ){
  if($gameVariables.value(427) >= 1){
    var value7 = Number(value[i].meta['ProstitutionMoneyUp']);
    $gameVariables.setValue(427,$gameVariables.value(427) * value7 );
    var value8 = `\\C[27]<${value[i].name}>\\C[0]発動\\C[31](×${value7}\\G)\\C[0]\\I[12]\n`;
    eval("valueWordSet" + valueCountSet2 +" += value8");
    valueCountSet1 += 1;
      if((valueCountSet1 %3) == 0){
        valueCountSet2 += 1
        var value1 = `\\C[10]H-Passive[${valueCountSet2}]\\C[0]\n`;
        eval("valueWordSet" + valueCountSet2 +" = value1");
      };
  };
};
}, this);
if(id == 3){
  //売春額一時記憶と娼婦ジョブ経験値取得
  valueProstitutionMoney = $gameVariables.value(427);
  if(valueProstitutionMoney >= 1){
    if(actor.subclass()){
      if(actor._subclassId == 41){
        actor.gainExpSubclass( Math.ceil(valueProstitutionMoney / 10) );
        var value8 = `ジョブ:\\C[27][\x1bJ[41]]\\C[0]に\\C[31]${Math.ceil(valueProstitutionMoney / 10)}\\C[0]expを取得\\I[12]\n`;
        eval("valueWordSet" + valueCountSet2 +" += value8");
        valueCountSet1 += 1;
        if((valueCountSet1 %3) == 0){
          valueCountSet2 += 1
          var value1 = `\\C[10]H-Passive[${valueCountSet2}]\\C[0]\n`;
          eval("valueWordSet" + valueCountSet2 +" = value1");
        };
      };
    };
  };
  //奴隷ジョブの時に奴隷ジョブ経験値取得
  if(actor.subclass()){
    if(actor._subclassId == 42){
      var value1 = 0;
      for(var i = 401; i <= 440; i++){
        if($gameVariables.value(i) >= 1){
          value1 += $gameVariables.value(i);
        };
      };
      actor.gainExpSubclass( Math.ceil(value1) );
      var value8 = `ジョブ:\\C[27][\x1bJ[42]]\\C[0]に\\C[31]${Math.ceil(value1)}\\C[0]expを取得\\I[12]\n`;
      eval("valueWordSet" + valueCountSet2 +" += value8");
      valueCountSet1 += 1;
      if((valueCountSet1 %3) == 0){
        valueCountSet2 += 1
        var value1 = `\\C[10]H-Passive[${valueCountSet2}]\\C[0]\n`;
        eval("valueWordSet" + valueCountSet2 +" = value1");
      };
    };
  };
};

};

//☆☆性欲度上限比較
seiyoku_genkai = function(){

seiyoku_jougenn();
var actor = $gameActors.actor($gameVariables.value(20));
if($gameVariables.value(401) + $gameVariables.value($gameVariables.value(20)+380)[1] >= $gameVariables.value($gameVariables.value(20)+380)[0] && $gameVariables.value($gameVariables.value(20)+380)[0] >= 1){
  if($gameSwitches.value(475)){
    TickerManager.show(`性欲度上限のため、性欲度上昇が抑制された。`);
  } else {
    $gameVariables.setValue(506,$gameVariables.value(506)+`\n性欲度上限のため、性欲度上昇が抑制された。`);
  };
    $gameVariables.value($gameVariables.value(20)+380)[1] = $gameVariables.value($gameVariables.value(20)+380)[0];
    $gameVariables.setValue(401,0);
};
if($gameVariables.value(402) >= 100){
  $gameVariables.value($gameVariables.value(20)+380)[2] = 100;
  $gameVariables.setValue(402,0);
};

};

//☆☆性欲度以外のランク制限を実施
hstates_rankSeigen = function(){

var actor = $gameActors.actor($gameVariables.value(20));
var value6 = `　`;
var list = valueHstaSuppression;
list.forEach(function(id) {
  if( actor.isLearnedSkill(id) && !actor.isLearnedSkill(Number($dataSkills[id].meta['Hide if Learned Skill'])) ){
    var value5 = 0;
    var value1 = Number($dataSkills[id].meta['HstaSuppression'].split(',')[0]);
    var value2 = Number($dataSkills[id].meta['HstaSuppression'].split(',')[1]);
    var value4 = `\n${$dataSkills[id].name}の影響により`;
      if(value1 == 0){
        for (var value1 = 431; value1 <= 439; value1++) {
          if($gameVariables.value(value1) >= 1 && actor.skillMasteryLevel(value1-380) == value2){
            var value3 = $gameVariables.value(value1) + $gameVariables.value($gameVariables.value(20)+380)[value1-400];
              if(value3 >= actor.skillMasteryUsageMax(value1-380)){
                $gameVariables.setValue(value1,0);
                value6 += `\\C[1][${$dataSkills[value1-380].name}]\\C[0]`;
                value5 += 1;
              };
           };
        };
        if(value5 >= 1){
          var value7 = `上昇抑制`;
            if($gameSwitches.value(122)){
              TickerManager.show(value4 + value6 + value7);
            } else {
              $gameVariables.setValue(506,$gameVariables.value(506)+value4 + value6 + value7);
            };
        };
      } else {
        if($gameVariables.value(value1) >= 1 && actor.skillMasteryLevel(value1-380) == value2){
          var value3 = $gameVariables.value(value1) + $gameVariables.value($gameVariables.value(20)+380)[value1-400];
            if(value3 >= actor.skillMasteryUsageMax(value1-380)){
              $gameVariables.setValue(value1,0);
                value6 += `\\C[1][${$dataSkills[value1-380].name}]\\C[0]`;
                value5 += 1;
            };
          if(value5 >= 1){
            var value7 = `上昇抑制`;
              if($gameSwitches.value(122)){
                TickerManager.show(value4 + value6 + value7);
              } else {
                $gameVariables.setValue(506,$gameVariables.value(506)+value4 + value6 + value7);
              };
          };
        };
      };
  };
}, this);

};

//☆☆性欲上昇簡易表示
seiyoku_kanniHyouji = function(){

if(!$gameSwitches.value(475)){
  valueWordSet0 = `${$gameVariables.value(506)}\n`;
};
var actor = $gameActors.actor($gameVariables.value(20));
var start = 401; var end = 440;
for (var i = start; i <= end; i++) {
  var value4 = 0;
  if(i != 405){
  if(!$gameVariables.value(i) == 0){
    if(i >= 401 && i <= 430){
      var value2 = $gameVariables.value($gameVariables.value(20)+380)[i-400];
    } else {
      var value2 = actor.skillMasteryUses(i-380);
      if(!actor.isLearnedSkill(i-380)){var value4 = 1};
    };
    if(value4 == 0){
      var value3 = $dataSystem.variables[i];
      var value3 = value3.replace("　", "");
      var value3 = value3.replace("　", "");
      var value3 = value3.replace("　", "");
      var value3 = value3.replace(" ", "");
      var value3 = value3.replace(":", "");
      if($gameVariables.value(i) >= 1){
        valueWordSet0 += `${actor.name()}の${value3}\\C[2]+${$gameVariables.value(i)}！\\C[0](${value2+$gameVariables.value(i)})\n`;
      } else {
        valueWordSet0 += `${actor.name()}の${value3}\\C[1]${$gameVariables.value(i)}！\\C[0](${value2+$gameVariables.value(i)})\n`;
      };
      if($gameSwitches.value(475)){
        TickerManager.show(valueWordSet0);
      };
    };
}}};
if(!$gameSwitches.value(475)){
  if($gameSwitches.value(154)){
    $gameVariables.setValue(539,`${valueWordSet0}\n`);
    $gameVariables.setValue(540,$gameVariables.value(540) + 1);
  } else {
    $gameScreen.setDTextPicture(valueWordSet0, 28);
  };
};
$gameSwitches.setValue(122,false);

};

//☆☆性欲度補正
seiyoku_hosei = function(){

var actor = $gameActors.actor($gameVariables.value(20));
//現在。限界露出度設定
rosyutu_genkai();
rosyutu_genzai();
//発情値を設定
$gameVariables.setValue(402,$gameVariables.value(401));
//初体験時の相手をＨステ配列41に記録
var value1 = 6;
var value2 = 41;
if($gameVariables.value($gameVariables.value(20)+380)[value1] == 0 && $gameVariables.value(400 + value1) >= 1){
  $gameVariables.value($gameVariables.value(20)+380)[value2] = $gameVariables.value(22);
};
//相手が魔物場合に魔物姦回数+1.事前に数字が入っている場合は無視。
if($gameVariables.value(420) == 0){
  if($dataWeapons[$gameVariables.value(340)].meta['monster']){
    $gameVariables.setValue(420,1);
  };
};
//人数が指定されている場合、339に数が格納されているので経験人数に反映
//同一人物の場合に経験人数上昇を抑制
var value4 = $gameVariables.value(340)-300;
if($gameVariables.value($gameVariables.value(20)+360)[value4] == 0){
  var value1 = 9;
  $gameVariables.setValue(400+ value1,$gameVariables.value(400 + value1) + $gameVariables.value(339));
};
//各相手とのＨ回数を記録。
var value1 = 6;
var value2 = 7;
var value3 = 8;
if($gameVariables.value(400 + value1) >= 1 ||
$gameVariables.value(400 + value2) >= 1 ||
$gameVariables.value(400 + value3) >= 1){
  var value4 = $gameVariables.value(340) - 300;
  $gameVariables.value($gameVariables.value(20)+360)[value4] += 1;
};
//膣姦の時に中だしか否か。膣射回数に数字を入れている場合はその数字をそのまま採用。
var value1 = $gameVariables.value(406);
var value2 = 411;
var value3 = 0;
if(value1 >= 1 && $gameVariables.value(value2) == 0){
  for (var i = 1; i <= value1; i++) {
    var arr = [1,0,1,0,1,1]
    var value4 = arr[Math.floor(Math.random() * arr.length)];
    if(value4 == 1){
      value3 += 1;
    };
  };
  if(actor.battleSkillsRaw().includes(871) || actor.isStateAffected(73)){
    var value3 = value1;
  };
  if(actor.battleSkillsRaw().includes(872) || actor.isStateAffected(74)){
    var value3 = 0;
  };
  if(value3 >= 1){
    $gameVariables.setValue(value2,$gameVariables.value(value2) + value3 );
  };
};
//尻姦の時に中だしか否か
var value1 = $gameVariables.value(407);
var value2 = 412;
var value3 = 0;
if(value1 >= 1 && $gameVariables.value(value2) == 0){
  for (var i = 1; i <= value1; i++) {
    var arr = [1,0,1,0,1,1]
    var value4 = arr[Math.floor(Math.random() * arr.length)];
    if(value4 == 1){
      value3 += 1;
    };
  };
  if(actor.battleSkillsRaw().includes(871) || actor.isStateAffected(73)){
    var value3 = value1;
  };
  if(actor.battleSkillsRaw().includes(872) || actor.isStateAffected(74)){
    var value3 = 0;
  };
  if(value3 >= 1){
    $gameVariables.setValue(value2,$gameVariables.value(value2) + value3 );
  };
};
//フェラの時に中だしか否か
var value1 = $gameVariables.value(408);
var value2 = 416;
var value3 = 0;
if(value1 >= 1 && $gameVariables.value(value2) == 0){
  for (var i = 1; i <= value1; i++) {
    var arr = [1,0,1,0,1,1]
    var value4 = arr[Math.floor(Math.random() * arr.length)];
    if(value4 == 1){
      value3 += 1;
    };
  };
  if(actor.battleSkillsRaw().includes(871) || actor.isStateAffected(73)){
    var value3 = value1;
  };
  if(actor.battleSkillsRaw().includes(872) || actor.isStateAffected(74)){
    var value3 = 0;
  };
  if(value3 >= 1){
    $gameVariables.setValue(value2,$gameVariables.value(value2) + value3 );
  };
};
//経験人数二人以上で輪姦
var value1 = 409;
var value2 = 419;
if($gameVariables.value(value1) >= 2){
  $gameVariables.setValue(value2, 1);
};

//受精するかどうか
jusei_keisan();
//回数に応じて各開発度に＋
var array1 = [406,407,408,410,408,408,411,412,416,413,421,426,414]
var array2 = [431,432,433,435,438,437,436,436,436,434,434,439,434]
var start = 0;
var end = 12;//配列の数に応じて変更
var value2 = 0;
for (var i = start; i <= end; i++) {
  if($gameVariables.value(array1[i]) >= 1){
    var value1 = $gameVariables.value(array1[i]);
    if(actor.elementRate(37) >= 1.1){
      var value1 = $gameVariables.value(array1[i]) + Math.round(actor.elementRate(37));
      var value2 = 1;
    };
    $gameVariables.setValue(array2[i],$gameVariables.value(array2[i])+value1);
  };
};
if(value2 == 1){
  var value8 = `\\C[27]<Reproduction>\\C[0]補正。各開発度/経験度加算値に\\C[27]+${Math.round(actor.elementRate(37))}\\C[0]\n`;
  eval("valueWordSet" + valueCountSet2 +" += value8");
  valueCountSet1 += 1;
  if((valueCountSet1 %3) == 0){
    valueCountSet2 += 1
    var value1 = `\\C[10]H-Passive[${valueCountSet2}]\\C[0]\n`;
    eval("valueWordSet" + valueCountSet2 +" = value1");
  };
};
//各開発度のランクに応じて回数上昇の時に開発度に補正
var array1 = [406,407,408,410,411,412,413,413,418,419,420]
var array2 = [ 51, 52, 53, 55, 56, 56, 51, 52, 54, 54, 54]
var array3 = [434,434,434,434,434,434,431,432,434,434,434]
var array4 = [  2,  3,  3,  2,  3,  4,  2,  4,  4,  5,  5]
var start = 0;var end = 10;
for (var i = start; i <= end; i++) {
  if(actor.skillMasteryLevel(array2[i]) >= Number(array4[i]) && $gameVariables.value(array1[i]) >= 1){
    var value1 = $gameVariables.value(array1[i]) * actor.skillMasteryLevel(array2[i])
    $gameVariables.setValue(array3[i],$gameVariables.value(array3[i])+value1);
}};
//ステート精液の付与
var value1 = 411;
if($gameVariables.value(value1) >= 1){actor.addState(84)};
var value2 = 408;
if($gameVariables.value(value2) >= 1){actor.addState(85)};
var value3 = 419;
if($gameVariables.value(value3) >= 1){actor.addState(86)};
//開発度ランクに応じて乗算。スキル51-59。最後に実行
var start = 1;
var end = 9;
for (var i = start; i <= end; i++) {
  if(actor.skillMasteryLevel(i+50) >= 1 && $gameVariables.value(i+430) >= 2){
    var value1 = $gameVariables.value(i+430)*actor.skillMasteryLevel(i+50)
    $gameVariables.setValue(i+430,value1)
}};
//発情値を性感開発値で増幅
if(actor.skillMasteryLevel(54) >= 1 && $gameVariables.value(402) >= 1){
  var value1 = $gameVariables.value(402) * actor.skillMasteryLevel(54);
  $gameVariables.setValue(402,$gameVariables.value(402)+value1);
};
//発情値100で絶頂回数+
if($gameVariables.value(402) >= 100){
  $gameVariables.setValue(414, $gameVariables.value(414)+1);
  if(actor.isLearnedSkill(65)){//スケベっこ以上で膣アナルフェラ回数に応じて絶頂回数+
    var value1 = $gameVariables.value(406);
    value1 += $gameVariables.value(407);
    value1 += $gameVariables.value(408);
    var value2 = Math.floor( Math.random() * value1);
    $gameVariables.setValue(414, $gameVariables.value(414)+value1);
  };
};
//性感開発度に応じて絶頂時に潮吹きと失禁回数+
if(actor.skillMasteryLevel(54) >= 3){
  if($gameVariables.value(414) >= 1){
    var value1 = Math.floor( Math.random() * 101);
    var value1 = value1 + (actor.skillMasteryLevel(54) * 10);
    if(value1 >= 80){
      $gameVariables.setValue(425, $gameVariables.value(425)+1);
    };
    var value1 = Math.floor( Math.random() * 101);
    var value1 = value1 + (actor.skillMasteryLevel(54) * 10);
    if(value1 >= 110){
      $gameVariables.setValue(424, $gameVariables.value(424)+1);
    };
  };
};

};

//☆☆性欲度情報を更新
seiyoku_hanei = function(){

var actor = $gameActors.actor($gameVariables.value(20));
var start = 1; var end = 30;
  for (var i = start; i <= end; i++) {
    $gameVariables.value($gameVariables.value(20)+380)[i] += $gameVariables.value(i+400);
      if($gameVariables.value($gameVariables.value(20)+380)[i] < 0){
        $gameVariables.value($gameVariables.value(20)+380)[i] = 0;
      };
  };
  if([406,407,417,418,419,420].some(function(id){return $gameVariables.value(id) >= 1})){
    $gameVariables.value($gameVariables.value(20)+380)[61] += 1;
  };
  //売春時のゴールド獲得処理
  if($gameVariables.value(427) >= 1){
    $gameParty.gainGold(Math.ceil($gameVariables.value(427)));
  };
  //強姦時に当日強姦回数に+。戦闘中に放心付与
  if($gameVariables.value(418) >= 1){
    $gameVariables.value($gameVariables.value(20)+380)[71] += 1;
    if($gameParty.inBattle() && !actor.battleSkillsRaw().includes(846)){
      actor.addState(64);
    };
  };
  if(!actor.battleSkillsRaw().includes(867)){
    if(!$gameParty.inBattle() && $gameVariables.value(414) >= 1){//絶頂で発情鎮静。戦闘中はコモン113で行う
      var value1 = 0;
      if(actor.isLearnedSkill(61)){value1 += Math.floor( Math.random() * 1)};
      if(actor.isLearnedSkill(62)){value1 += Math.floor( Math.random() * 2)};
      if(actor.isLearnedSkill(63)){value1 += Math.floor( Math.random() * 3)};
      if(actor.isLearnedSkill(64)){value1 += Math.floor( Math.random() * 4)};
      if(actor.isLearnedSkill(65)){value1 += Math.floor( Math.random() * 5)};
      if(actor.isLearnedSkill(66)){value1 += Math.floor( Math.random() * 6)};
      if(actor.isLearnedSkill(67)){value1 += Math.floor( Math.random() * 6)};
      if(actor.isLearnedSkill(68)){value1 += Math.floor( Math.random() * 6)};
      if(actor.isLearnedSkill(69)){value1 += Math.floor( Math.random() * 6)};
      $gameVariables.value($gameVariables.value(20)+380)[2] = value1;
    };
  };
  if($gameVariables.value($gameVariables.value(20)+380)[2] >= 51){
    if(!actor.isStateAffected(61)){
      var value1 = `${actor.name()}は\\C[27]発情\\C[0]している…。`;
        if($gameSwitches.value(154)){
          $gameVariables.setValue(539,`${value1}\n`);
          $gameVariables.setValue(540,$gameVariables.value(540) + 1);
        } else {
          TickerManager.show(value1);
        };
    };
      actor.addState(61);
  } else {
    if(actor.isStateAffected(61)){
      var value1 = `${actor.name()}の\\C[27]発情\\C[0]が静まった…。`;
        if($gameSwitches.value(154)){
          $gameVariables.setValue(539,`${value1}\n`);
          $gameVariables.setValue(540,$gameVariables.value(540) + 1);
        } else {
          TickerManager.show(value1);
        };
    };
      actor.removeState(61);
  };

valueHskillLearnArr = [];
var start = 1; var end = 9;
  for (var i = start; i <= end; i++) {
    var value1 = actor.skillMasteryLevel(i+50);
    actor.gainSkillMasteryUses(i+50,$gameVariables.value(i+430));
    var value2 = actor.skillMasteryLevel(i+50);
      if(value1 != value2 && value1 >= 1){
        valueHskillLearnArr.push(i+50);
      };
  };
var start = 1; var end = 30;
  for (var i = start; i <= end; i++) {
    $gameVariables.setValue(400+i,$gameVariables.value($gameVariables.value(20)+380)[i]);
  };

};

//☆☆スキルアイテム使用による性欲数値更新a,b,this.item().id,1
seiyoku_itemHanei = function(id1,id2,id3,id4){

if(id4 == 1){
  var valueItems = $dataSkills;
} else {
  var valueItems = $dataItems;
};
$gameVariables.setValue(20,id2.actorId());
if($dataActors[id2.actorId()].meta['Heroine']){
  var actor = $gameActors.actor($gameVariables.value(20));
  //使用アイテム名表示。アイテム使用時はパッシブ反映しない。
  if(valueItems[id3].meta['性欲度使用制限']){
    var value2 = Number(valueItems[id3].meta['性欲度使用制限']);
  } else {
    var value2 = 18;
  };
  if(!isGirl($gameActors.actor($gameVariables.value(20)))){
    var value2 = 61;
  };
  if($gameActors.actor($gameVariables.value(20)).isLearnedSkill(value2)){
    for(var i = 401; i <= 440; i++){$gameVariables.setValue(i,0)};
    h_exp($gameVariables.value(20),'0_1_0',306,false,true,false);
    var value1 = valueItems[id3].meta['HitemJudgement'].split(',');
    $gameVariables.setValue(Number(value1[0]),Number(value1[1]));
    $gameSwitches.setValue(475,true);
    valueWordSet0 = ``;
    seiyoku_genkai();
    seiyoku_kanniHyouji();
    seiyoku_hanei();
    $gameVariables.setValue(339,0);
    $gameVariables.setValue(340,0);
    for(var i = 401; i <= 440; i++){$gameVariables.setValue(i,0)};
    $gameVariables.setValue(506,' ');
    $gameSwitches.setValue(130,false);
    if(valueItems == $dataItems){
      var value1 = `${valueItems[id3].name}：${$gameParty.numItems(valueItems[id3])}個`;
      TickerManager.show(value1);
    };
  } else {
    $gameParty.gainItem(valueItems[id3], +1);
    var value1 = `条件を満たしていない為、${actor.name()}には使用する事が出来ない…。`;
    TickerManager.show(value1);
  };
  $gameSwitches.setValue(475,false);
} else {
  $gameParty.gainItem(valueItems[id3], +1);
  var value1 = `${actor.name()}には使用する事が出来ない…。`;
  TickerManager.show(value1);
};

};

//☆☆当日受精率設定
jusei_todayrate = function(){

var value1 = 65;//スケベっこで解放
var list = $gameVariables.value(247);
list.forEach(function(id) {
  var actor = $gameActors.actor(id);
  if(actor.isLearnedSkill(value1)){
    $gameVariables.value(id+380)[3] = Math.floor( Math.random() * 11);
    if(actor.battleSkillsRaw().includes(870)){
      $gameVariables.value(id+380)[3] += Math.floor( Math.random() * 51);
    };
  } else {
    $gameVariables.value(id+380)[3] = 0;
  };
}, this);

};

//☆☆キャラの各種遍歴代入actor_Hhennreki(3);valueWordSet
actor_Hhennreki = function(id1){

var value1 = `付与されているHステート\n`;
for (var i = 1; i <= 10; i++) {eval("valueWordSet" + i +" = value1")};
var value1 = 1;
var actor = $gameActors.actor($gameVariables.value(20));
var list = valueHstateDisplay;
list.forEach(function(id) {
  if(actor.isStateAffected(id)){
    var value2 = `${$dataStates[id].description}`;
    if(actor.getStateCounter(id) != undefined){
      value2 += `\\C[27]進行度:${actor.getStateCounter(id)}\\C[0]`;
    };
    value2 += `\n`;
    eval("valueWordSet" + value1 +" += value2");
    valueCountSet1 += 1;
    if(valueCountSet1 %8 == 0){value1 += 1};
  };
}, this);
};

//☆☆キャラの各種遍歴代入前実行2actor_Hhennreki2Before(4,5,6);
//選択肢番号は、実際の配列番号+1にしている。
actor_Hhennreki2Before = function(id1){

var actor = $gameActors.actor($gameVariables.value(20));
if(4 == id1){
  var value1 = `\\I[526]\\C[27]男性遍歴　　　　　　\\C[0]　　 　　　　　　　　　　　　　　　`;
};
if(5 == id1){
  var value1 = `\\I[428]\\C[27]出産履歴　　　　　　\\C[0]　　 　　　　　　　　　　　　　　　`;
};
if(6 == id1){
  var value1 = `\\I[556]\\C[27]シーン履歴（直近100件）\\C[0]　　　　　　　　　　　　　　　　`;
};
const id = 1; 
const choiceParams = {
text: `\\FS[25]${value1}`,
value: 0};
$gameSystem.addCustomChoice(id, choiceParams);
if(4 == id1 && $gameVariables.value($gameVariables.value(20)+380)[41] != 0){//41は名前を入れている
  if(actor.isLearnedSkill(67)){
    var value1 = `\\C[27]初体験の相手:\\C[0]`;
  } else {
    var value1 = `\\C[30]処女を奪った相手:\\C[0]`;
  };
  value1 += `${$gameVariables.value($gameVariables.value(20)+380)[41]}`;
  const id = 1; 
  const choiceParams = {
  text: `\\FS[25]${value1}`,
  value: 1};
  $gameSystem.addCustomChoice(id, choiceParams);
};
if(5 == id1 && $gameVariables.value($gameVariables.value(20)+380)[49] >= 1){//49はidを入れている
  if(actor.isLearnedSkill(67)){
    var value1 = `\\C[27]初子の父親:\\C[0]`;
  } else {
    var value1 = `\\C[30]初子を産んだ男:\\C[0]`;
  };
  value1 += `${$dataWeapons[$gameVariables.value($gameVariables.value(20)+380)[49]].name}`;
  const id = 1; 
  const choiceParams = {
  text: `\\FS[25]${value1}`,
  value: 1};
  $gameSystem.addCustomChoice(id, choiceParams);
};

};

//☆☆キャラの各種遍歴代入2actor_Hhennreki2(4,5,6);
actor_Hhennreki2 = function(id1){

if(4 == id1 || 5 == id1){
  var actor = $gameActors.actor($gameVariables.value(20));
  var arr1 = [0];
  var arr2 = $gameVariables.value(360 + $gameVariables.value(20));
  if(4 == id1){var value1 = 1; var value3 = 300;var value4 = 100};
  if(5 == id1){var value1 = 201; var value3 = 100;var value4 = -100};
  var j = 0;
  if(id1 == 4 || id1 == 5){
    for (var i = value1; i <= value1 + 99; i++) {
      j += 1;
      if(arr2[i] >= 1){
        var value2 = `\\C[16]${$dataWeapons[i+value3].name}\\C[0]:`;
        if($dataWeapons[i+value3].meta['Profession']){
          var value2 = `[${$dataWeapons[i+value3].meta['Profession']}]\\C[16]${$dataWeapons[i+value3].name}\\C[0]:`;
        } else {
          if($dataWeapons[i+value3].meta['FamilyName']){
            var value2 = `\\C[16]${$dataWeapons[i+value3].name} = $dataWeapons[i+value3].meta['FamilyName']\\C[0]:`;
          };
        };
        if(actor.isLearnedSkill(67)){
          value2 += `\\C[27]${arr2[i]}\\C[0]回`;
        } else {
          value2 += `\\C[1]${arr2[i]}\\C[0]回`;
        };
        if($gameSwitches.value(164)){ 
          if(id1 == 4){
            if(arr2[i + value4] >= 1){
              value2 += `\\I[374]？`;
        }}};
        const id = 1; 
        const choiceParams = {
        text: `\\FS[25]${value2}`,
        value: j + 1};
        $gameSystem.addCustomChoice(id, choiceParams);
      };
    };
  };
};
if(id1 == 6){
  var arr1 = $gameVariables.value(174)[$gameVariables.value(20)];
    if(arr1 != 0){
      for(var i = arr1.length-1; i >= 1; i --){
        const id = 1; 
        const choiceParams = {
        text: `\\FS[25]${arr1[i]}`,
        value: i+1};
        $gameSystem.addCustomChoice(id, choiceParams);
      };
    };
};

};

//☆☆汎用Ｈシーン時に文字ＢＧＶ。<汎用シーン性感低:>scene_textBgv($gameVariables.value(318),640,384);
scene_textBgv = function(id91,id92,id93,id94,id95,id96){

var actor = $gameActors.actor(id91);
var actor1 = $dataActors[id91];
var value91 = actor.nickname();
var arr91 = [];
var array9 = [];

if($gameSwitches.value(119)){
  if(actor.isLearnedSkill(68)){
    if(actor1.meta['SexualEcstasyHi']){var arr91 = actor1.meta['SexualEcstasyHi'].split(',')};
      var array = [`「アッ…」`,`「ンっ…」`,`「ンンっ…」`,`（ピクっ…\\I[12]）`];
  } else {
    if(actor.isLearnedSkill(65)){
      if(actor1.meta['SexualEcstasyMiddle']){var arr91 = actor1.meta['SexualEcstasyMiddle'].split(',')};
      var array = [`「アッ…\\I[12]」`,`「ンっ…」`,`「ンンっ…\\I[12]」`,`（ピクっ…\\I[12]）`];
    } else {
      var array = ['「ヤァッ…！」','「ダメっ…！」','「ヤメッ…！」',
      '「アっ…、ァァ…」','（ビクンッ）'];
      if(actor1.meta['SexualEcstasyLow']){var arr91 = actor1.meta['SexualEcstasyLow'].split(',')};
    };
  };
} else {
  var array9 = $gameVariables.value(707);
};
//if(arr91 == 0){}else{array9.push(arr91)};
if(arr91 == 0){}else{array9 = array9.concat(arr91)};
var value92 = array9[Math.floor(Math.random() * array9.length)];
if($gameVariables.value(299) == 0){
  $gameVariables.setValue(299,[121,122,123,124,125,126,127,128,129,130]);
};
var array92 = $gameVariables.value(299);
var value93 = array92[Math.floor(Math.random() * array92.length)];//ID
let index = array92.findIndex(array92 => array92 === value93); 
if(index >= 0){
  array92.splice(index, 1);
}
var value98 = id92;
var value99 = id93;
if(id94 == 1){
  var array91 = [50,100,150,200,0,-50,-100,-150,-200];
  var array92 = [100,150,200,0,-100,-200,-300,-350];
} else {
  var array91 = [100,200,300,400,0,-100,-200,-300,-400];
  var array92 = [100,150,200,0,-100,-200,-300,-350];
};
var value94 = array91[Math.floor(Math.random() * array91.length)];//x
var value95 = array92[Math.floor(Math.random() * array92.length)];//y
if(id95 == 0){
  var array94 = [80,90,100,110,120];//wait
  var value96 = array94[Math.floor(Math.random() * array94.length)];
} else {
  var array94 = [100,110,120,130,140,150,160];
  var value96 = array94[Math.floor(Math.random() * array94.length)];
};
var array93 = [28,29,30,31,32,33,34,35,36];
var value97 = array93[Math.floor(Math.random() * array93.length)];
$gameScreen.setDTextPicture(`${value92}`, value97);
$gameScreen.dWindowFrame = 'ON';
if(id96 == 0){}else{$gameScreen.setDtextFont(id96)};
$gameScreen.dTextAlign = 1;
if(id95 == 0){
  $gameScreen.showPicture(value93,"",1,value98 + value94,value99 + value95,150,150,255,0);
  $gameScreen.movePicture(value93,1,value98 + value94,value99 + value95,100,100,0,0,value96);
} else {
  var array95 = [50,60,70,80,90,100,110,120,130,140,150,-50,-60,-70,-80,-90,-100,-110,-120,-130,-140,-150];
  var value10 = array95[Math.floor(Math.random() * array95.length)];
  $gameScreen.showPicture(value93,"",1,value98 + value94 + value10,value99 + value95,100,100,255,0);
  $gameScreen.movePicture(value93,1,value98 + value94,value99 + value95,100,100,0,0,value96);
};

};

//☆☆CGの一部分で一言台詞pic_oneWord(valueSerialPictureId,x,y,25,60,arr1);
pic_oneWord = function(id1,id2,id3,id4,id5,arr1,id6){

if(id4 >= 100){
  picture_motion1("smooth",[0]);
} else {
  picture_motion1("linear",[0]);
};
var arr2 = [-50,0,50,-100,100];
var value3 = Math.floor( Math.random() * 201) - 100;
var value4 = Math.floor( Math.random() * 201) - 100;
var value5 = arr1[Math.floor(Math.random() * arr1.length)];
$gameScreen.setDTextPicture(value5, id4);
$gameScreen.dWindowFrame = 'ON';
if(id6 == 0){}else{$gameScreen.setDtextFont(id6)};
$gameScreen.dTextAlign = 1;
var value1 = id2;
var value2 = id3;
$gameScreen.showPicture(id1,"",1,value1+value3,value2+value4,50,50,255,0);
$gameScreen.movePicture(id1,1,value1+value3,value2+value4,150,150,0,0,id5);

};

//出産時の計算式
actor_pregnancyCalculation = function(id1){

$gameVariables.setValue(20,id1);
if($gameActors.actor($gameVariables.value(20)).isStateAffected(83)){
  var actor = $gameActors.actor($gameVariables.value(20));
  //actor.addStateCounter(83, +10);
  var value1 = Math.floor( Math.random() * 101);
    if(true){
      actor.removeState(83);
      actor.removeStateCounter(83);
      $gameVariables.setValue(94,actor.name());
    };
      if(!actor.isStateAffected(83)){
        //妊娠時の一時的なサイズ増量表現を消去させる
        var value1 = $gameVariables.value(20);
        $gameVariables.value(value1+380)[42] = 0;
        $gameVariables.value(value1+380)[43] = 0;
        $gameVariables.value(value1+380)[44] = 0;
        $gameVariables.value(value1+380)[45] = 0;
        //妊娠相手を特定する
        var array = [];
        var array2 = $gameVariables.value($gameVariables.value(20)+360);
        for(var i = 101; i <= 200; i++){
          if(array2[i] >= 1){
            array.push(i);
        }};
          var value1 = array[Math.floor(Math.random() * array.length)];
          if(value1 == 0){var value1 = 102};
          $gameVariables.value($gameVariables.value(20)+360)[value1+100] += 1;
          if($gameVariables.value($gameVariables.value(20)+380)[49] == 0){
            $gameVariables.value($gameVariables.value(20)+380)[49] = value1+200;
          };
          //受精相手を特定するための配列を0にする。
          var start = 101; 
          var end = 200;
          for (var i = start; i <= end; i++) {
            if($gameVariables.value($gameVariables.value(20)+360)[i] >= 1){
              $gameVariables.value($gameVariables.value(20)+360)[i] = 0;
          }};
}};

};

//☆☆Hプロフィール表示時立ち絵
const HSTATES_BACKGROUND = "HstatesBackGround1";
const HSTATES_FRAME = "HstatesFrame";
const HSTATES_ACTOR_BUST_WHITE = "HstatesActorBustWhite";
const HSTATES_ACTOR_BUST_PREFIX = "HstatesActorBust";
const HSTATES_ACTOR_HEAD_PREFIX = "HstatesActorHead";
const HSTATES_BG_SHINE1 = "hStates_bgShine1";
const HSTATES_BODY_SHINE1 = "hStates_bodyShine1";
const HSTATES_BACKGROUND_VAR = "HstatesBackGround"; // Used with variable suffix
const HSTATES_ACTOR_FACE_PREFIX = "HstatesActorFace";
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
  if (!isGirl(gameActor)) {
    tachie_hyouji2(gameActor);
  } else {
    const basePicId = 111;
    if (mode == 1) {
      setActorStateBasedOnSkillsHStatesTachie(gameActor);

      $gameScreen.showPicture(basePicId + 4, HSTATES_BACKGROUND, 1, 1024, 384, 100, 100, 255, 0);
      $gameScreen.showPicture(basePicId + 6, HSTATES_ACTOR_BUST_PREFIX + actorId + "_" + $gameVariables.value(192), 1, 1024, 400, 100, 100, 0, 0);
      $gameScreen.showPicture(basePicId + 9, HSTATES_ACTOR_FACE_PREFIX + actorId, 1, 1024, 384, 100, 100, 0, 0);
      //let defaultHue = '#00d0ff';
      if (gameActor.actor().meta['tachieHue2']) {
        defaultHue = gameActor.actor().meta['tachieHue2'];
      }
      $gameScreen.showPicture(basePicId + 10, HSTATES_ACTOR_BUST_WHITE, 1, 1024, 384, 0, 0, 0, 0);
      $gameScreen.showPicture(basePicId + 11, HSTATES_FRAME, 1, 1024, 384, 100, 100, 255, 0);
      $gameScreen.showPicture(basePicId + 5, HSTATES_FRAME, 1, 1024, 384, 100, 100, 255, 0);

      let actorBustName = HSTATES_ACTOR_BUST_PREFIX + actorId;
      $gameScreen.setPicturesAnimation(5, 1, "横", 3);
      $gameScreen.showPicture(basePicId + 7, actorBustName, 1, 1024, 384, 100, 100, 255, 0);
      $gameScreen.picture(basePicId + 7).startAnimationFrame(3, true, CACHED_ANIMATION_FRAMES);
      
      let headVariant;
      if ($gameVariables.value(actorId + 440)[32] == 2) {
        headVariant = 1;
      } else {
        headVariant = 2;
      }

      $gameScreen.showPicture(basePicId + 8, HSTATES_ACTOR_HEAD_PREFIX + actorId + "_" + headVariant, 1, 1024, 368, 100, 100, 0, 0);

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
      let actorHue = '#00d0ff';
      if (gameActor.actor().meta['tachieHue2']) {
        actorHue = gameActor.actor().meta['tachieHue2'];
      }
      $gameScreen._particle.particleSet(0, HSTATES_BG_SHINE1, 'picture:116', 'def', 'above'); //55
      $gameScreen._particle.particleSet(0, HSTATES_BODY_SHINE1, 'picture:118', 'def', 'above'); //58
      $gameScreen._particle.particleUpdate([HSTATES_BODY_SHINE1, 'pos', 0, 20]);
      $gameScreen._particle.particleUpdate([HSTATES_BODY_SHINE1, 'color', actorHue, actorHue + '@0.5', actorHue]);
      //scale1-15 alfa1-0 speed1-1 #eb00ff

    } else {
      updateActorHStatesTachie(basePicId, actorId);
    }
  }
};

function updateActorHStatesTachie(basePicId, actorId) {
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
  //$gameScreen.movePicture(value1+10,1,1024,384,100,100,0,0,60);
  //$gameScreen._particle.particleUpdate(['hStates_bodyShine1','emitterLifetime','1']);

  if (hStageSexualDesireMod >= 2) {
    const fadeDuration = hStageSexualDesireMod >= 5 ? 30 : fadeDurationsMap[hStageSexualDesireMod] || 0;
    $gameScreen.showPicture(basePicId + 13, HSTATES_BACKGROUND_VAR + hStageSexualDesireMod, 1, 1024, 384, 100, 100, 255, 0);
    picture_fade1(basePicId + 13, "fadeOut", "HscenePose054", fadeDuration, 5);
  }

  if (hStageSexualDesireMod >= 2) {
    $gameScreen.showPicture(basePicId + 3, HSTATES_BACKGROUND_VAR + hStageSexualDesireMod, 1, 1024, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(basePicId + 4, 1, 1024, 384, 100, 100, 0, 0, 120);
    $gameScreen.movePicture(basePicId + 3, 1, 1024, 384, 100, 100, 255, 0, 120);
  }

  bless_erase();

  let facePictureId = HSTATES_ACTOR_FACE_PREFIX + actorId + "_" + hStageSexualDesireMod;
  $gameScreen.setPicturesAnimation(5, 1, "横", 5);
  $gameScreen.showPicture(basePicId + 9, facePictureId, 1, 1024, 384, 100, 100, 255, 0);
  $gameScreen.picture(basePicId + 9).startAnimationFrame(1, false, [1]);

  if (hStageSexualDesireMod == 1 || hStageSexualDesireMod == 5) {
    let faceVariantSuffix = faceVariantMap[hStageSexualDesireMod];
    $gameScreen.showPicture(basePicId + 12, HSTATES_ACTOR_FACE_PREFIX + actorId + faceVariantSuffix, 1, 1024, 384, 100, 100, 0, 3);
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
seiyoku_parameterReset = function(id1){

var actor = $gameActors.actor($gameVariables.value(20));
if(id1 == 1){//選択肢作成
  var start = 401; var end = 440;
  for (var i = start; i <= end; i++) {
    if(i != 405){
      if(i >= 401 && i <= 430){
        $gameVariables.setValue(i,$gameVariables.value($gameVariables.value(20)+380)[i-400]);
      } else {
        $gameVariables.setValue(i,actor.skillMasteryLevel(i-380));
        if(!actor.isLearnedSkill(i-380)){$gameVariables.setValue(i,0)};
      };
  }};
  const id = 1;
  const choiceParams = {
  text: `一括で未経験に変更　　　　　　　　　　　　　　　　　　`,
  value: 0};
  $gameSystem.addCustomChoice(id, choiceParams);
  for (var i = 401; i <= 439; i++) {//431-439経験値
    //if(i != 402 || i != 403 || i != 404 || i != 405 || i != 428 || i != 429){
if( [402,403,404,405,428,429].some(function(id2){return id2 == i}) ){}else{
      var value3 = $dataSystem.variables[i];
    //var value3 = value3.replace("　", "");
    //var value3 = value3.replace("　", "");
    //var value3 = value3.replace("　", "");
    //var value3 = value3.replace(" ", "");
      var value3 = `${value3}${$gameVariables.value(i)}`;
      const id = 1; 
      const choiceParams = {
      text: value3,
      value: i};
      $gameSystem.addCustomChoice(id, choiceParams);
    };
  };
};
if(id1 == 2){//反映
  var start = $gameVariables.value(19) - 400; 
  var end = $gameVariables.value(19) - 400;
  if($gameVariables.value(19) == 0){
    var start = 1; var end = 30;
  };
  if($gameVariables.value(19) == 0 || $gameVariables.value(19) - 400 >= 1 && $gameVariables.value(19) - 400 <= 30){
    for (var i = start; i <= end; i++) {
      if($gameVariables.value($gameVariables.value(20)+380)[i] >= 1){
        $gameVariables.value($gameVariables.value(20)+380)[i] = 0;
        $gameVariables.setValue(i + 400,0)
        var value3 = $dataSystem.variables[i + 400];
        var value3 = value3.replace("　", "");
        var value3 = value3.replace("　", "");
        var value3 = value3.replace("　", "");
        var value3 = value3.replace(" ", "");
        var value3 = value3.replace(":", "");
        var value1 = `\\C[1]${value3}\\C[0]がリセットされました…`;
        CommonPopupManager.showInfo({},value1,null);
          if(i == 6){
            $gameVariables.value($gameVariables.value(20)+380)[41] = 0;
            var value1 = `\\C[2]初体験相手\\C[0]がリセットされました…`;
            CommonPopupManager.showInfo({},value1,null);
          };
      };
    };
  };
  if($gameVariables.value(19) == 0){
    var start = 31; var end = 40;
  };
  if($gameVariables.value(19) == 0 || $gameVariables.value(19) - 400 >= 31 && $gameVariables.value(19) - 400 <= 40){
    for (var i = start; i <= end; i++) {
      if(actor.isLearnedSkill(i + 20)){
        actor.setSkillMasteryUses(i + 20, 0);
        actor.setSkillMasteryLevel(i + 20, 0);
        actor.forgetSkill(i + 20);
        var value1 = `${$dataSkills[i+20].name}忘却…`;
        CommonPopupManager.showInfo({},value1,null);
      };
    };
  };
hskill_learn(2);//該当するHスキル忘却
};

};

//☆☆拘束前のセクハラ演出
actor_battleSekughara1 = function(){

var actor = $gameActors.actor($gameVariables.value(20));
var value1 = 81;
actor.addState(value1);
if (actor._stateCounter[value1] >= 1) {
  actor.addStateCounter(value1, +10);
} else {
  actor.setStateCounter(value1, 1);
};
var value2 = $gameVariables.value($gameVariables.value(20)+380)[4];
var value3 = $gameVariables.value($gameVariables.value(20)+380)[1];
var value4 = Math.ceil((value3+1) / 10);//0の場合の対策で+1
var value5 = Math.floor( Math.random() * 101);
value4 += actor._stateCounter[value1];
if(value4 >= value5){
  $gameSwitches.setValue(437,true);
};
var value1 = 54;
var value2 = 'Screen_Width512Black';//右側のみＨＣＧの際に使用
$gameScreen.showPicture(value1,value2,1,1024-100,384,100,100,0,0);
$gameScreen.movePicture(value1,1,1024-50,384,100,100,200,0,60);
valuePic1 = 60;
var value4 = $gameVariables.value(20);
var value5 = $gameVariables.value($gameVariables.value(20)+380)[1];
var value6 = 1;//相手によって変更.1ヒト2ゴブ3巨人
if($gameSwitches.value(248)){var value6 = 2};
var value7 = 180;var value8 = 1;
if(value5 >= 200){var value7 = 170;var value8 = 2};
if(value5 >= 400){var value7 = 160;var value8 = 3};
if(value5 >= 600){var value7 = 150;var value8 = 4};
if(value5 >= 800){var value7 = 140;var value8 = 5};
if(value5 >= 1000){var value7 = 120;var value8 = 6};
for (var i = 1; i < 10; i++) {
  var value9 = 0;
  if(i == 2 && $gameVariables.value($gameVariables.value(20)+440)[18] == 0){var value9 = 1};
  if(i == 6 && value8 <= 3){var value9 = 1};
  if(i == 8 && !actor.isStateAffected(83)){var value9 = 1};
  if(i == 10 && value8 <= 3){var value9 = 1};
  if(value9 == 0){
    if([1,2,4,5,6,8,10].some(function(id){return i == id})){var value8 = 1};
    if(i == 3 && value8 >= 5){var value8 = 2};
    if(i == 5 && $gameVariables.value($gameVariables.value(20)+440)[32] >= 1){var value8 = 2};
    if(i != 9){
      var value2 = 'Zev_BattleSekuharaActor'+value4+'_'+i+'_'+value8;
    } else {
      var value8 = value6
      $gameScreen.setPicturesAnimation(2, value7, '連番', 30);
      var value2 = 'Zev_BattleSekuharaActor'+value4+'_'+i+'_'+value8+'_0';
    };
    $gameScreen.showPicture(valuePic1+i,value2,1,640+400,384+50,100,100,0,0);
    if(i == 9){
      $gameScreen.picture(valuePic1+i).startAnimationFrame(1, true, [2,3]);
    };
    $gameScreen.movePicture(valuePic1+i,1,640+400,384+20,100,100,255,0,40);
    if(i == 9 || i == 4){
      hcg_piston(valuePic1+i,9,2,2);
    } else {
      tachie_bless(valuePic1+i,1);
    };
  };
};
var value1 = $gameVariables.value(20);//文字HBGV
$gameVariables.setValue(318,value1);
$gameVariables.setValue(706,[640+400,384+20,1,60,0,0]);
$gameSwitches.setValue(119,true);

};

//☆☆H時の音や効果 BGSライン。通常1,Ｈ2-9,天候10,Bgv10+アクターID//
sex_direction = function(id1,id2,id3){

var id4 = 0;
if($gameVariables.value(530) >= 1){
  $gameVariables.setValue(20,$gameVariables.value(530));
  if($dataActors[$gameVariables.value(20)].meta['HvoicePattern']){
    var id4 = Number($dataActors[$gameVariables.value(20)].meta['HvoicePattern']);
    if(id2 == 0){
      if($gameActors.actor($gameVariables.value(530)).isLearnedSkill(65)){
        var id2 = 2;
      } else {
        var id2 = 1;
      };
    };
  };
};
if(id1 == 99){
  AudioManager.stopAllBgs();
  $gameVariables.setValue(194,1);
};
if(id1 == 0){
  var arr1 = ['hScene_Direct1'];
  for (var i = 0; i <= arr1.length-1; i++) {
    $gameScreen._particle.particleClear(arr1[i]);
  };
  var value1 = Math.floor( Math.random() * 41) + 180;
  var value2 = Math.floor( Math.random() * 21) + 40;
  $gameScreen.startFlash([255,119,255,value1], value2);
  var value1 = 'hScene_Direct1';
  $gameScreen._particle.particleSet(0,value1,'screen','def','screen');
};
if(id1 == 1){//ピストン弱
  $gameVariables.setValue(194,$gameVariables.value(194)+1);
  $gameSystem.setBgsLine($gameVariables.value(194));
  var value1 = "21_Piston1";
  var value2 = Math.floor( Math.random() * 21) + 90;
  var value3 = Math.floor( Math.random() * 31) + 90;
  AudioManager.playBgs({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  if(id4 >= 1 && id2 <= 9){
    $gameSystem.setBgsLine(10 + $gameVariables.value(20));
    var value4 = 5;
    var arr1 = [1];
    if(id3 == 1){var arr1 = [1,2,3]};
    if(id2 == 2){
      value4 += 1;
      if(id3 == 1){var arr1 = [1,2,3]};
    };
    var value5 = arr1[Math.floor(Math.random() * arr1.length)];
    var value1 = "51_pattern" + id4 + "_" + value4 + "_" + value5;
    var value2 = Math.floor( Math.random() * 21) + 100;
    var value3 = Math.floor( Math.random() * 21) + 100;
    AudioManager.playBgs({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  };
};
if(id1 == 2){//ピストン強
  $gameVariables.setValue(194,$gameVariables.value(194)+1);
  $gameSystem.setBgsLine($gameVariables.value(194));
  var value1 = "21_Piston1";
  var value2 = Math.floor( Math.random() * 21) + 90;
  var value3 = Math.floor( Math.random() * 31) + 120;
  AudioManager.playBgs({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  if(id4 >= 1 && id2 <= 9){
    $gameSystem.setBgsLine(10 + $gameVariables.value(20));
    var value4 = 5;
    var arr1 = [1];
    if(id3 == 1){var arr1 = [1,2,3]};
    if(id2 == 2){
      value4 += 1;
      if(id3 == 1){var arr1 = [1,2,3]};
    };
    var value5 = arr1[Math.floor(Math.random() * arr1.length)];
    var value1 = "51_pattern" + id4 + "_" + value4 + "_" + value5;
    var value2 = Math.floor( Math.random() * 21) + 70;
    var value3 = Math.floor( Math.random() * 21) + 110;
    AudioManager.playBgs({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  };
};
if(id1 == 3){//愛液
  $gameVariables.setValue(194,$gameVariables.value(194)+1);
  $gameSystem.setBgsLine($gameVariables.value(194));
  var value1 = "21_LoveJuice";
  var value2 = Math.floor( Math.random() * 31) + 80;
  var value3 = Math.floor( Math.random() * 41) + 80;
  AudioManager.playBgs({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  $gameVariables.setValue(194,$gameVariables.value(194)+1);
  $gameSystem.setBgsLine($gameVariables.value(194));
  var value1 = "21_LoveJuice";
  var value2 = Math.floor( Math.random() * 31) + 80;
  var value3 = Math.floor( Math.random() * 41) + 50;
  AudioManager.playBgs({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  if(id4 >= 1 && id2 <= 9){
    $gameSystem.setBgsLine(10 + $gameVariables.value(20));
    var value4 = 7;
    var arr1 = [1];
    if(id3 == 1){var arr1 = [1,2,3]};
    if(id2 == 2){
      value4 += 1;
      if(id3 == 1){var arr1 = [1,2]};
    };
    var value5 = arr1[Math.floor(Math.random() * arr1.length)];
    var value1 = "51_pattern" + id4 + "_" + value4 + "_" + value5;
    var value2 = Math.floor( Math.random() * 21) + 70;
    var value3 = Math.floor( Math.random() * 21) + 100;
    AudioManager.playBgs({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  };
};
if(id1 == 4){//キス
  $gameVariables.setValue(194,$gameVariables.value(194)+1);
  $gameSystem.setBgsLine($gameVariables.value(194));
  var value1 = "21_LoveJuice";
  var value2 = Math.floor( Math.random() * 31) + 80;
  var value3 = Math.floor( Math.random() * 41) + 80;
  AudioManager.playBgs({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  $gameVariables.setValue(194,$gameVariables.value(194)+1);
  $gameSystem.setBgsLine($gameVariables.value(194));
  var value1 = "21_LoveJuice";
  var value2 = Math.floor( Math.random() * 31) + 80;
  var value3 = Math.floor( Math.random() * 41) + 50;
  AudioManager.playBgs({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  if(id4 >= 1 && id2 <= 9){
    $gameSystem.setBgsLine(10 + $gameVariables.value(20));
    var value4 = 1;
    var arr1 = [1];
    if(id3 == 1){var arr1 = [1,2,3]};
    if(id2 == 2){
      value4 += 1;
      if(id3 == 1){var arr1 = [1,2,3,4,5,6]};
    };
    var value5 = arr1[Math.floor(Math.random() * arr1.length)];
    var value1 = "51_pattern" + id4 + "_" + value4 + "_" + value5;
    var value2 = Math.floor( Math.random() * 21) + 70;
    var value3 = Math.floor( Math.random() * 31) + 90;
    AudioManager.playBgs({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  };
};
if(id1 == 5){//フェラ
  $gameVariables.setValue(194,$gameVariables.value(194)+1);
  $gameSystem.setBgsLine($gameVariables.value(194));
  var value1 = "21_LoveJuice";
  var value2 = Math.floor( Math.random() * 31) + 80;
  var value3 = Math.floor( Math.random() * 41) + 80;
  AudioManager.playBgs({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  $gameVariables.setValue(194,$gameVariables.value(194)+1);
  $gameSystem.setBgsLine($gameVariables.value(194));
  var value1 = "21_LoveJuice";
  var value2 = Math.floor( Math.random() * 31) + 80;
  var value3 = Math.floor( Math.random() * 41) + 50;
  AudioManager.playBgs({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  if(id4 >= 1){
    $gameSystem.setBgsLine(10 + $gameVariables.value(20));
    var value4 = 3;
    var arr1 = [1];
    if(id3 == 1){var arr1 = [1,2,3,4,5,6,7,8]};
    if(id2 == 2){
      value4 += 1;
      if(id3 == 1){var arr1 = [1,2,3,4,5,6,7,8,9,10]};
    };
    var value5 = arr1[Math.floor(Math.random() * arr1.length)];
    var value1 = "51_pattern" + id4 + "_" + value4 + "_" + value5;
    var value2 = Math.floor( Math.random() * 21) + 70;
    var value3 = Math.floor( Math.random() * 31) + 90;
    AudioManager.playBgs({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  };
};
if(id1 == 6){//揉み
  $gameVariables.setValue(194,$gameVariables.value(194)+1);
  $gameSystem.setBgsLine($gameVariables.value(194));
  var value1 = "21_BustKnead";
  var value2 = Math.floor( Math.random() * 11) + 10;
  var value3 = Math.floor( Math.random() * 41) + 80;
  AudioManager.playBgs({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  if(id4 >= 1 && id2 <= 9){
    $gameSystem.setBgsLine(10 + $gameVariables.value(20));
    var value4 = 7;
    var arr1 = [1];
    if(id3 == 1){var arr1 = [1,2,3]};
    if(id2 == 2){
      value4 += 1;
      if(id3 == 1){var arr1 = [1,2]};
    };
    var value5 = arr1[Math.floor(Math.random() * arr1.length)];
    var value1 = "51_pattern" + id4 + "_" + value4 + "_" + value5;
    var value2 = Math.floor( Math.random() * 21) + 70;
    var value3 = Math.floor( Math.random() * 21) + 100;
    AudioManager.playBgs({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  };
};
if(id1 == 7){//機械振動
  $gameVariables.setValue(194,$gameVariables.value(194)+1);
  $gameSystem.setBgsLine($gameVariables.value(194));
  var value1 = "21_HandyMassager2";
  var value2 = Math.floor( Math.random() * 21) + 50;
  var value3 = Math.floor( Math.random() * 21) + 80;
  AudioManager.playBgs({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  if(id4 >= 1 && id2 <= 9){
    $gameSystem.setBgsLine(10 + $gameVariables.value(20));
    var value4 = 7;
    var arr1 = [1];
    if(id3 == 1){var arr1 = [1,2,3]};
    if(id2 == 2){
      value4 += 1;
      if(id3 == 1){var arr1 = [1,2]};
    };
    var value5 = arr1[Math.floor(Math.random() * arr1.length)];
    var value1 = "51_pattern" + id4 + "_" + value4 + "_" + value5;
    var value2 = Math.floor( Math.random() * 21) + 70;
    var value3 = Math.floor( Math.random() * 21) + 100;
    AudioManager.playBgs({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  };
};
if(id1 == 8){//機械振動激しく
  $gameVariables.setValue(194,$gameVariables.value(194)+1);
  $gameSystem.setBgsLine($gameVariables.value(194));
  var value1 = "21_HandyMassager2";
  var value2 = Math.floor( Math.random() * 21) + 60;
  var value3 = Math.floor( Math.random() * 31) + 100;
  AudioManager.playBgs({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  if(id4 >= 1 && id2 <= 9){
    $gameSystem.setBgsLine(10 + $gameVariables.value(20));
    var value4 = 7;
    var arr1 = [1];
    if(id3 == 1){var arr1 = [1,2,3]};
    if(id2 == 2){
      value4 += 1;
      if(id3 == 1){var arr1 = [1,2]};
    };
    var value5 = arr1[Math.floor(Math.random() * arr1.length)];
    var value1 = "51_pattern" + id4 + "_" + value4 + "_" + value5;
    var value2 = Math.floor( Math.random() * 21) + 70;
    var value3 = Math.floor( Math.random() * 21) + 100;
    AudioManager.playBgs({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  };
};
if(id1 == 11){//挿入
  adv_partDirectPlay(7);
  if(valueSexWait == 0){
    var value1 = Math.floor( Math.random() * 41) + 160;
    var value2 = Math.floor( Math.random() * 21) + 50;
    var value3 = Math.floor( Math.random() * 5) + 6;
    $gameScreen.startFlash([255,119,255,value1], value2);
    $gameScreen.startShake(value3, value3, value2);
    var array = ['Z_zamen1','Z_zamen2'];
    var value1 = array[Math.floor(Math.random() * array.length)];
    var value2 = Math.floor( Math.random() * 21) + 100;
    var value3 = Math.floor( Math.random() * 41) + 80;
    AudioManager.playSe({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  };
  if(valueSexWait >= 1){
    var value1 = Math.floor( Math.random() * 41) + 160;
    var value2 = Math.floor( Math.random() * 21) + 50;
    $gameScreen.startFlash([255,119,255,value1], value2);
    var array = ['Z_zamen1','Z_zamen2'];
    var value1 = array[Math.floor(Math.random() * array.length)];
    var value2 = Math.floor( Math.random() * 21) + 100;
    var value3 = Math.floor( Math.random() * 41) + 80;
    AudioManager.playSe({"name":value1,"volume":value2,"pitch":value3,"pan":0});
    var array = ['Z_Insert'];
    var value1 = array[Math.floor(Math.random() * array.length)];
    var value2 = Math.floor( Math.random() * 21) + 150;
    var value3 = Math.floor( Math.random() * 41) + 80;
    AudioManager.playSe({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  };
  if(valueSexWait >= 1){
    valueSexWait = 0;
  } else {
    valueSexWait = Math.floor( Math.random() * 21) + 20;
  };
};
if(id1 == 12){//射精.pic_move1(88,0,0,400,400,0,90);ピクチャ拡大消去
  AudioManager.stopAllBgs();
  adv_partDirectSet(0);
  sex_direction(0);//集中線終了
  if(valueSexWait == 0){
    var value1 = Math.floor( Math.random() * 41) + 160;
    var value2 = Math.floor( Math.random() * 21) + 50;
    var value3 = Math.floor( Math.random() * 5) + 6;
    $gameScreen.startFlash([255,119,255,value1], value2);
    $gameScreen.startShake(value3, value3, value2);
    var array = ['Z_zamen'];
    var value1 = array[Math.floor(Math.random() * array.length)];
    var value2 = Math.floor( Math.random() * 21) + 100;
    var value3 = Math.floor( Math.random() * 51) + 100;
    AudioManager.playSe({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  };
  if(valueSexWait >= 1){
    var value1 = Math.floor( Math.random() * 41) + 160;
    var value2 = Math.floor( Math.random() * 21) + 50;
    $gameScreen.startFlash([255,119,255,value1], value2);
    var array = ['Z_zamen1','Z_zamen2'];
    var value1 = array[Math.floor(Math.random() * array.length)];
    var value2 = Math.floor( Math.random() * 21) + 100;
    var value3 = Math.floor( Math.random() * 41) + 80;
    AudioManager.playSe({"name":value1,"volume":value2,"pitch":value3,"pan":0});
    var array = ['Z_zamen1','Z_zamen2'];
    var value1 = array[Math.floor(Math.random() * array.length)];
    var value2 = Math.floor( Math.random() * 21) + 100;
    var value3 = Math.floor( Math.random() * 41) + 80;
    AudioManager.playSe({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  };
  if(valueSexWait >= 1){
    valueSexWait = 0;
  } else {
    valueSexWait = Math.floor( Math.random() * 11) + 20;
  };
};
if(id1 == 13){//射精以外で終了.
  AudioManager.stopAllBgs();
  adv_partDirectSet(0);
  sex_direction(0);//集中線終了
  if(valueSexWait == 0){
    var value1 = Math.floor( Math.random() * 41) + 160;
    var value2 = Math.floor( Math.random() * 21) + 50;
    var value3 = Math.floor( Math.random() * 5) + 6;
    $gameScreen.startFlash([255,119,255,value1], value2);
    $gameScreen.startShake(value3, value3, value2);
    var array = ['Z_zamen1','Z_zamen2'];
    var value1 = array[Math.floor(Math.random() * array.length)];
    var value2 = Math.floor( Math.random() * 21) + 100;
    var value3 = Math.floor( Math.random() * 41) + 80;
    AudioManager.playSe({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  };
  if(valueSexWait >= 1){
    var value1 = Math.floor( Math.random() * 41) + 160;
    var value2 = Math.floor( Math.random() * 21) + 50;
    $gameScreen.startFlash([255,119,255,value1], value2);
    var array = ['Z_zamen1','Z_zamen2'];
    var value1 = array[Math.floor(Math.random() * array.length)];
    var value2 = Math.floor( Math.random() * 21) + 100;
    var value3 = Math.floor( Math.random() * 41) + 80;
    AudioManager.playSe({"name":value1,"volume":value2,"pitch":value3,"pan":0});
    var array = ['Z_zamen1','Z_zamen2'];
    var value1 = array[Math.floor(Math.random() * array.length)];
    var value2 = Math.floor( Math.random() * 21) + 100;
    var value3 = Math.floor( Math.random() * 41) + 80;
    AudioManager.playSe({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  };
  if(valueSexWait >= 1){
    valueSexWait = 0;
  } else {
    valueSexWait = Math.floor( Math.random() * 11) + 20;
  };
};
if(id1 == 51){//写真撮影
  var value2 = 'ScreenWhiteOut';
  $gameScreen.showPicture(id2,value2,1,640,384,100,100,250,0);
  $gameScreen.movePicture(id2,1,640,384,100,100,0,0,20);
  var value1 = 'ZH_Photograph';
  AudioManager.playSe({"name":value1,"volume":100,"pitch":100,"pan":0});
  valueSexWait = 30;
};
if(id1 == 52){//眼パチ閉
  var value2 = 'ScreenBlackOut';
  $gameScreen.showPicture(id2,value2,1,640,384,100,100,255,0);
  var value3 = 'SceneCloseOpenEyes';
  picture_fade1(id2,"fadeIn",value3,id3,5);
  valueSexWait = id3;
};
if(id1 == 53){//眼パチ開く
  var value2 = 'ScreenBlackOut';
  $gameScreen.showPicture(id2,value2,1,640,384,100,100,255,0);
  var value3 = 'SceneCloseOpenEyes';
  picture_fade1(id2,"fadeOut",value3,id3,5);
  valueSexWait = id3;
};
if(id1 == 54){//薄くピンク点灯
  $gameScreen.setPicturesAnimation(2, id3/2, "横", id3);
//$gameScreen.setPicturesAnimation(2, 1, "横", id3);
  var value2 = 'ScreenPinkFlash';
  $gameScreen.showPicture(111,value2,1,640,384,100,100,id2,3);
$gameScreen.picture(111).startAnimationFrame(1, true, [1,1,1,2]);
};

};

//ADVＨパート演出クリアも。0実行1終了
adv_HpartDirectPlay = function(id1){

if(id1 == 0){
  var arr1 = ['Ecstasy_c1','lines_heightH1'];
  for (var i = 0; i <= arr1.length-1; i++) {
    $gameScreen._particle.particleClear(arr1[i]);
  };
};
if(id1 == 1){//感じる
  var value1 = 'Ecstasy_c1';
  $gameScreen._particle.particlePlay(0,value1,'screen','def','spriteset');
  $gameScreen._particle.particleUpdate([value1,'alpha','0.4','0']);
  //$gameScreen._particle.particleExceed(value1,1);
  var array = ['Z_HeartBeatDarty'];
  var value1 = array[Math.floor(Math.random() * array.length)];
  var value2 = Math.floor( Math.random() * 21) + 100;
  var value3 = Math.floor( Math.random() * 41) + 60;
  AudioManager.playSe({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  filter_direct(9,640-128,368,40);
};
if(id1 == 2){//激しく感じる
  var value1 = 'Ecstasy_c1';
  $gameScreen._particle.particlePlay(0,value1,'screen','def','spriteset');
  $gameScreen._particle.particleUpdate([value1,'alpha','0.4','0']);
  $gameScreen._particle.particleUpdate([value1,'scale','10','40']);
  //$gameScreen._particle.particleExceed(value1,0.8);
  var array = ['Z_HeartBeatDarty'];
  var value1 = array[Math.floor(Math.random() * array.length)];
  var value2 = Math.floor( Math.random() * 21) + 100;
  var value3 = Math.floor( Math.random() * 41) + 40;
  AudioManager.playSe({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  filter_direct(9,640-128,368,60);
};
if(id1 == 3){//絶頂激しく感じる永続クリア必須
  if(valueWordSet0 == '絶頂'){
    filter_direct(1,640,384,0.03);
    valueWordSet0 = 0;
    adv_HpartDirectPlay(0);
    adv_partDirectSet(0);
    $gameScreen.eraseParallax(7);
    $gameScreen.erasePicture(51);
    $gameScreen.erasePicture(57);
  } else {
    valueWordSet0 = '絶頂';
    var value1 = 57;
    if($gameActors.actor($gameVariables.value(20)).isLearnedSkill(66)){
      var value3 = 2;
    } else {
      var value3 = 1;
    };
    hcg_piston(value1,5,1,1);
    filter_direct(1,640,384,0.01);
    //parallax_scroll(7,'ScreenBattleEcstasyConcentratedLineHeight',0,20,0,-50,255);
    adv_partDirectSet(2);
    var value1 = 'Ecstasy_c1';
    $gameScreen._particle.particlePlay(0,value1,'screen','def','spritset');
    $gameScreen._particle.particleUpdate([value1,'scale','10','20']);
    $gameScreen._particle.particleUpdate([value1,'alpha','0.30','0']);
    //$gameScreen._particle.particleUpdate([value1,'emitterLifetime','-1']);
  };
};
if(id1 == 4){//軽く感じる
  var value1 = 'Ecstasy_c1';
  $gameScreen._particle.particlePlay(0,value1,'screen','def','spriteset');
  $gameScreen._particle.particleUpdate([value1,'alpha','0.3','0']);
  //$gameScreen._particle.particleExceed(value1,1.5);
  var array = ['Z_HeartBeatDarty'];
  var value1 = array[Math.floor(Math.random() * array.length)];
  var value2 = Math.floor( Math.random() * 21) + 100;
  var value3 = Math.floor( Math.random() * 41) + 80;
  AudioManager.playSe({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  filter_direct(9,640-128,368,30);
};
if(id1 == 5){//乳見せ
  var value1 = 'Ecstasy_c1';
  $gameScreen._particle.particlePlay(0,value1,'screen','def','spriteset');
  $gameScreen._particle.particleUpdate([value1,'alpha','0.2','0']);
  //$gameScreen._particle.particleExceed(value1,1.5);
  var array = ['ZH_Knead1','ZH_Knead1','ZH_Knead1'];
  var value1 = array[Math.floor(Math.random() * array.length)];
  var value2 = Math.floor( Math.random() * 21) + 100;
  var value3 = Math.floor( Math.random() * 41) + 80;
  AudioManager.playSe({"name":value1,"volume":value2,"pitch":value3,"pan":0});
  $gameScreen.startFlash([255,119,255,200], 60)
};
};

//☆☆性欲スキルで確立上昇最大50%
seiyoku_skillProbabilityUp = function(){

if($gameVariables.value(20) == 0){$gameVariables.setValue(21,1)};
var actor = $gameActors.actor($gameVariables.value(20));
var value91 = 0;
if(actor.learnSkill(61)){value91 += 5};
if(actor.learnSkill(62)){value91 += 5};
if(actor.learnSkill(63)){value91 += 5};
if(actor.learnSkill(64)){value91 += 5};
if(actor.learnSkill(65)){value91 += 5};
if(actor.learnSkill(66)){value91 += 5};
if(actor.learnSkill(67)){value91 += 5};
if(actor.learnSkill(68)){value91 += 5};
if(actor.learnSkill(69)){value91 += 5};
if(actor.learnSkill(70)){value91 += 5};
valueCountSet3 = value91;

};

//☆☆エネミーステートでドロップ
//enemy_drop = function(user,enemy){



//};

//}());
