/*:
 * @plugindesc Throttles idle parallel events: a command list that already
 * finished is restarted every 4th frame instead of every frame.
 * @author Senior MV Expert
 *
 * @help
 * Game_Event.prototype.updateParallel and Game_CommonEvent.prototype.update
 * call interpreter.setup() again as soon as the previous list has finished, so
 * a parallel event whose list completes inside a single frame (no Wait, no
 * waitMode, helper returns early) re-runs its whole list 60 times per second.
 *
 * This plugin only delays the RESTART of an already finished list. A list that
 * is still running (Wait, waitMode, nested waits, message, move route) is never
 * delayed, so anything that yields keeps its exact timing.
 *
 * Exemptions:
 *  - Lists that poll Input./TouchInput. are never throttled. isTriggered()
 *    presses are cleared every frame, so a skipped frame would drop the input.
 *  - Graphics.frameCount is used for the phase, and the event id is added to it
 *    so several events on the same map do not all restart on the same frame.
 *
 * Must load AFTER FSDK_EngineTuner, which replaces both of these methods
 * without aliasing them.
 */
(function() {
    'use strict';

    // A finished list is restarted on 1 frame out of N. 4 = 15Hz instead of 60Hz.
    var RESTART_INTERVAL = 4;

    // Cached per list array reference, which is stable for a given event page.
    function listPollsInput(list) {
        if (!list) return false;
        for (var i = 0; i < list.length; i++) {
            var command = list[i];
            if (command.code !== 355 && command.code !== 655) continue;
            var text = command.parameters && command.parameters[0];
            if (typeof text !== 'string') continue;
            if (text.indexOf('Input.') >= 0) return true;
            if (text.indexOf('TouchInput.') >= 0) return true;
        }
        return false;
    }

    function shouldDeferRestart(owner, list, id) {
        if (owner._throttleList !== list) {
            owner._throttleList = list;
            owner._throttlePollsInput = listPollsInput(list);
        }
        if (owner._throttlePollsInput) return false;
        return (Graphics.frameCount + id) % RESTART_INTERVAL !== 0;
    }

    var _Game_Event_updateParallel = Game_Event.prototype.updateParallel;
    Game_Event.prototype.updateParallel = function() {
        if (this._interpreter && !this._interpreter.isRunning()) {
            if (shouldDeferRestart(this, this.list(), this._eventId)) return;
        }
        _Game_Event_updateParallel.call(this);
    };

    var _Game_CommonEvent_update = Game_CommonEvent.prototype.update;
    Game_CommonEvent.prototype.update = function() {
        if (this._interpreter && !this._interpreter.isRunning()) {
            if (shouldDeferRestart(this, this.list(), this._commonEventId)) return;
        }
        _Game_CommonEvent_update.call(this);
    };
})();
