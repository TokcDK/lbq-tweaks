//=============================================================================
// SkillFormula.js
//=============================================================================

/*:
 * @plugindesc 計算式用
 * @author 作者名
 *
 * @help 計算式を定義します。
 */

/**
 * ●物理攻撃計算式
 * a:行動主体、b:対象
 */
function $attack1(value1, a, b, level) {

var user = a;
    // 変数を移し替え
if(value1 == 1){//物理
    var atk = a.atk * 2;
    var def = b.def;
};
if(value1 == 2){//魔法
    var atk = a.mat * 2;
    var def = b.mat;
};
if(value1 == 3){//器用
    var atk = a.mdf * 2;
    var def = b.def;
};
if(value1 == 4){//幸運
    var atk = a.luk * 2;
    var def = b.def;
};
if(value1 == 5){//防御
    var atk = a.def * 2;
    var def = b.def;
};
if(value1 == 6){//器用と敏捷
    var atk = a.mdf + a.agi;
    var def = b.def;
};
if(value1 == 7){//攻撃と器用
    var atk = a.atk + a.mdf;
    var def = b.def;
};
if(value1 == 8){//回復
    var atk = a.mat;
    var def = b.mat;
};
if(value1 == 9){//物理回復
    var atk = a.atk;
    var def = b.def;
};
if(value1 == 10){//HP変換ダメージ
    var atk = a.hp;
    var def = b.def;
};
if(value1 == 11){//剣
    var atk = Math.round((a.atk*7 + a.mdf*2 + a.agi*1) / 5);
    var def = b.def;
};
if(value1 == 12){//短剣
    var atk = Math.round((a.atk*2 + a.mdf*4 + a.agi*4) / 5);
    var def = b.def;
};
if(value1 == 13){//刀
    var atk = Math.round((a.atk*7 + a.mdf*3) / 5);
    var def = b.def;
};
if(value1 == 14){//杖
    var atk = a.mat * 2;
    var def = b.mat;
};
if(value1 == 15){//拳
    var atk = Math.round((a.atk*4 + a.mdf*3 + a.agi*3) / 5);
    var def = b.def;
};
if(value1 == 16){//槍
    var atk = Math.round((a.atk*8 + a.mdf*2) / 5);
    var def = b.def;
};
if(value1 == 17){//斧
    var atk = a.atk * 2;
    var def = b.def;
};
if(value1 == 18){//銃
    var atk = a.dex * 1;
    var def = b.def;
};
if(value1 == 19){//弓
    var atk = Math.round((a.atk*2 + a.mdf*8) / 5);
    var def = b.def;
};
if(value1 == 20){//楽器
    var atk = Math.round((a.mat*5 + a.mdf*5) / 5);
    var def = b.def;
};
if(value1 == 24){//針
    var atk = Math.round((a.mdf*5 + a.luk*5) / 5);
    var def = b.def;
};
if(value1 == 25){//鞭
    var atk = a.mdf;
    var def = b.def;
};
if(value1 == 28){//鈍器
    var atk = a.atk * 2;
    var def = b.def;
};
if(value1 == 29){//爪
    var atk = Math.round((a.atk*8 + a.mdf*1 + a.agi*1) / 5);
    var def = b.def;
};
if(value1 == 30){//牙
    var atk = Math.round((a.atk*7 + a.mdf*1 + a.agi*2) / 5);
    var def = b.def;
};
if(value1 == 31){//ゴールド消費
    var atk = $gameVariables.value(268);
    var def = b.def;
};
if(valueLevelFluctuation >= 1){
  //var atk = atk + Math.floor(a.level / valueLevelFluctuation);
};
if($gameVariables.value(182) == 13){
    var atk = valueChainTotalStat;
    var def = 0;
    valueAddPowerCustom += valueChainMemberCount;
};
if (a.isStateAffected(624)) {//渾身と背水
  if(user._stateCounter[624] >= 0.1){
    valueAddPowerCustom += user._stateCounter[624];
  };
};
if (a.isStateAffected(625)) {
  if(user._stateCounter[625] >= 0.1){
    valueAddPowerCustom += user._stateCounter[625];
  };
};
var level = level + valueAddPowerCustom;

// 特定ステート時。回復時はキャンセル
if(value1 != 8){
  var value2 = 221;
  if(value1 == 2 || value1 == 14){ var value2 = 222 };
  if (a.isStateAffected(value2)) {
    var def = 0; // 防御を0として計算
  }
};
if(value1 == 31){
  var value2 = atk;
} else {
  if(value1 == 10){
    var value2 = atk / level * 100;
  } else {
    if(value1 == 8 || value1 == 9){
      var value2 = (atk + def) * level;
    } else {
      if(user.isActor() && value1 == 18 && $dataWeapons[user._equips[0]._itemId].meta['GunDamage']){
        var value2 = (Number($dataWeapons[user._equips[0]._itemId].meta['GunDamage']) + (atk - def)) * level;
      } else {
        var value2 = (atk - def) * level;
      };
    };
  };
};

var value3 = 0;
if(user.isActor() && valueAttackElements != 0){
  for (var i = 0; i <= valueAttackElements.length-1; i++) {
    if(Number(valueAttackElements[i]) >= 1){
      if(valueAttackAmplifysActorId[user.actorId()][Number(valueAttackElements[i])] >= 1){
        value3 += valueAttackAmplifysActorId[user.actorId()][Number(valueAttackElements[i])];
}}}};
if($gameVariables.value(182) == 13){
  if(valueChainAddPower >= 1){
    value3 += valueChainAddPower;
  };
};

damage = Math.round(value2 * (1 + (value3 / 100)));//計算式表示の為にvar消去。

        return damage;
};
