/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help スキルラーン使用時にクラス選択を除外できるプラグイン
 */

(function() {
    'use strict';
/*:
Window_ClassList.prototype.makeItemList = function() {
    var data = []
    for (var i = 1; i < $dataClasses.length; i++){
        data.push(i)
    }
    this._data = [];
    for (var i = 0; i < data.length; ++i) {
      var classId = data[i];
      if ($dataClasses[classId] && !this._data.contains(classId)) {
        this._data.push(classId);
      }
    }
    this._data.sort(function(a, b) { return a - b });
};

Window_ClassList.prototype.isEnabled = function(item) {
    return this._actor.unlockedClasses().slice().includes(item);
};
 */
Scene_LearnSkill.prototype.adjustSelection = function() {
      this.commandClass();
      this._commandWindow.deactivate();
};

Scene_LearnSkill.prototype.onLearnCancel = function() {
      this.popScene();
};

Game_Actor.prototype.availableClasses = function() {
    return 1;
};

Window_SkillLearnCommand.prototype.makeCommandList = function() {
    if (!this._actor) return;
    this.addClassCommand(this._actor.currentClass().id);
    this._currentClass = this._actor.currentClass().id;
    return
};

})()

