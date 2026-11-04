/*:
 * @plugindesc Fixes MV's 15-frame accumulator death spiral and stops redundant rendering on 120Hz/144Hz+ monitors.
 * @author Senior MV Expert
 *
 * @help
 * Replaces SceneManager.updateMain, so it must load AFTER YEP_X_CoreUpdatesOpt
 * (which replaces the same method) and BEFORE WaitFPS, which aliases whatever
 * updateMain is current in order to measure FPS. Loading it after WaitFPS
 * leaves WaitFPS' counter frozen at 0, and every "WaitFPS" command then waits
 * its full maxWaitTime instead of proceeding as soon as the framerate is fine.
 */
(function() {
    'use strict';

    // Maximum logic updates allowed per single rAF tick (2 = max 33.3ms catch-up instead of 250ms)
	// with MAX_UPDATES_PER_FRAME = 2, anything below 30 fps still runs in slow motion (20 fps → 66 % speed) 
	// because catch-up is capped at two ticks. Raising it to 3 covers 20 fps but weakens the anti-spiral cap
    const MAX_UPDATES_PER_FRAME = 3;

    SceneManager.updateMain = function() {
        if (Utils.isMobileSafari()) {
            this.changeScene();
            this.updateScene();
            this.renderScene();
        } else {
            const newTime = this._getTimeInMsWithoutMobileSafari();
            // SceneManager.resume() resets _currentTime, but a scene replaced
            // without it would otherwise produce a NaN delta and stall forever.
            if (this._currentTime === undefined) this._currentTime = newTime;
            let fTime = (newTime - this._currentTime) / 1000;
            const maxFTime = this._deltaTime * MAX_UPDATES_PER_FRAME;
            if (fTime > maxFTime) fTime = maxFTime;

            this._currentTime = newTime;
            this._accumulator += fTime;

            // Prevent accumulator buildup beyond our cap
            if (this._accumulator > maxFTime) {
                this._accumulator = maxFTime;
            }

            let updated = false;
            // A frame that lasts exactly MAX_UPDATES_PER_FRAME ticks must still
            // fit that many updates: after the first subtraction the remainder
            // is ~1e-18 short of _deltaTime and the second update is lost, which
            // made a steady 30fps game run at 75% speed.
            while (this._accumulator >= this._deltaTime - 1e-9) {
                this.updateInputData();
                this.changeScene();
                this.updateScene();
                this._accumulator -= this._deltaTime;
                updated = true;
            }

            // ONLY render to GPU if game state actually advanced this tick!
            if (updated) {
                this.renderScene();
            }
        }
        this.requestUpdate();
    };
})();