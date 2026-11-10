//=============================================================================
// StatusActorLeftRight.js
//=============================================================================

/*:
 * @plugindesc Lets the Status screen switch party members with Left/Right.
 * @author
 *
 * @help
 * On the status screen, Left/Right cycle through the party members in the
 * same way PageUp/PageDown already do.
 */

(function () {
    'use strict';

    var _Scene_Status_update = Scene_Status.prototype.update;
    Scene_Status.prototype.update = function () {
        _Scene_Status_update.call(this);
        this.updateActorLeftRight();
    };

    Scene_Status.prototype.updateActorLeftRight = function () {
        if (!this._statusWindow || !this._statusWindow.isOpenAndActive()) return;
        if ($gameParty.members().length < 2) return;
        if (Input.isTriggered('right')) {
            this.nextActor();
            SoundManager.playCursor();
        } else if (Input.isTriggered('left')) {
            this.previousActor();
            SoundManager.playCursor();
        }
    };
})();
