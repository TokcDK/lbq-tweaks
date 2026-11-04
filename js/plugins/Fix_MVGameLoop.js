/*:
 * @plugindesc Fixes MV's 15-frame accumulator death spiral and stops redundant rendering on 120Hz/144Hz+ monitors.
 * @author Senior MV Expert
 */
(function() {
    'use strict';

    // Maximum logic updates allowed per single rAF tick (2 = max 33.3ms catch-up instead of 250ms)
    const MAX_UPDATES_PER_FRAME = 2;

    SceneManager.updateMain = function() {
        if (Utils.isMobileSafari()) {
            this.changeScene();
            this.updateScene();
            this.renderScene();
        } else {
            const newTime = this._getTimeInMsWithoutMobileSafari();
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
            while (this._accumulator >= this._deltaTime) {
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