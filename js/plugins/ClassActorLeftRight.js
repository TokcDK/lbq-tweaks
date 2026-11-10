//=============================================================================
// ClassActorLeftRight.js
//=============================================================================

/*:
 * @plugindesc Lets the Job (Class) menu switch party members with Left/Right.
 * @author
 *
 * @help
 * On the Job menu, Left/Right cycle through the party members while the
 * command window is active, the same way PageUp/PageDown already do.
 * The class/subclass list keeps using Left/Right to move between its columns.
 */

(function () {
    'use strict';

    var _Scene_Class_update = Scene_Class.prototype.update;
    Scene_Class.prototype.update = function () {
        _Scene_Class_update.call(this);
        this.updateActorLeftRight();
    };

    Scene_Class.prototype.updateActorLeftRight = function () {
        if ($gameParty.members().length < 2) return;
        if (!this._commandWindow || !this._commandWindow.isOpenAndActive()) return;
        if (Input.isTriggered('right')) {
            this.nextActor();
            SoundManager.playCursor();
        } else if (Input.isTriggered('left')) {
            this.previousActor();
            SoundManager.playCursor();
        }
    };
})();
