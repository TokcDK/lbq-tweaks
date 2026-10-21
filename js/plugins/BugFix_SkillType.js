//
//  BugFix_SkillType ver1.01
//
// author yana
//

var Imported = Imported || {};
Imported['BugFix_SkillType'] = 1.01;

/*:
 * @plugindesc ver1.01/同じスキルタイプを複数追加したとき、スキル欄にダブって並んでしまうバグを修正。
 * @author Yana
 * 
 * 
 * @help------------------------------------------------------
 *  プラグインコマンドはありません。
 * ------------------------------------------------------
 * ------------------------------------------------------
 * 利用規約：特になし。素材利用は自己責任でお願いします。
 * ------------------------------------------------------
 * 更新履歴:
 * ver1.01:
 * 内容を別の処理に変更して、戦闘中も効果が出るように修正。
 * ver1.00:
 * 公開
 */

(function(){
	
  const _BF_GBBase_addedSkillTypes = Game_BattlerBase.prototype.addedSkillTypes;
  Game_BattlerBase.prototype.addedSkillTypes = function() {
  	const types = _BF_GBBase_addedSkillTypes.call(this);
  	const result = [];
	const typesLength = types.length;
  	for (let i=0;i<typesLength;i++){
		const type = types[i];
  		if (!result.contains(type)){
  			result.push(type);
  		}
  	}
  	return result;
  };
}());
