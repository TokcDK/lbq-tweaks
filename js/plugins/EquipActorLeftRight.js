//=============================================================================
// EquipActorLeftRight.js
//=============================================================================

/*:
 * @plugindesc Lets the Equip screen switch party members with Left/Right.
 * @author
 *
 * @help
 * On the equip screen, Left/Right cycle through the party members while the
 * command or slot window is active, the same way PageUp/PageDown already do.
 * The item window keeps using Left/Right to move between its columns.
 */

(function () {
    'use strict';

    var _Scene_Equip_createSlotWindow = Scene_Equip.prototype.createSlotWindow;
    Scene_Equip.prototype.createSlotWindow = function () {
        _Scene_Equip_createSlotWindow.call(this);
        if ($gameTemp._cbeBattle) {
            this._slotWindow.removeHandler('pagedown');
            this._slotWindow.removeHandler('pageup');
        }
    };

    var _Scene_Equip_update = Scene_Equip.prototype.update;
    Scene_Equip.prototype.update = function () {
        _Scene_Equip_update.call(this);
        this.updateActorLeftRight();
    };

    Scene_Equip.prototype.updateActorLeftRight = function () {
        // YEP_X_ChangeBattleEquip removes PageUp/PageDown on the battle equip screen;
        // Left/Right must not switch actors there either.
        if ($gameTemp._cbeBattle) return;
        if ($gameParty.members().length < 2) return;
        if (Input.isTriggered('right')) {
            this.changeActorByLeftRight(true);
        } else if (Input.isTriggered('left')) {
            this.changeActorByLeftRight(false);
        }
    };

    Scene_Equip.prototype.changeActorByLeftRight = function (isNext) {
        var win = this._slotWindow && this._slotWindow.isOpenAndActive() ? this._slotWindow
                : this._commandWindow && this._commandWindow.isOpenAndActive() ? this._commandWindow
                : null;
        if (!win) return;
        if (isNext) {
            this.nextActor();
        } else {
            this.previousActor();
        }
        this._commandWindow.deactivate();
        win.activate();
        SoundManager.playCursor();
    };
})();
