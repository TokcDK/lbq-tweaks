/*:
 * @plugindesc Fix for issues of saved games in previous versions
 * @author author
 *
 * @help
 * map003 EV003 add runOldSavegameFixes() from here.
 */

(function () {

    let wasExecuted = false;

    // Console tracing for the battle clothing damage / bust-up work. Set to
    // false (or delete the checks) once the visual state is confirmed in game.
    window.DEBUG_BATTLE_CLOTHES = true;

    // Battle clothing damage rate modifier, game variable 613 (percent).
    // 0 = default 100%, 200 = twice as likely, 10000 = every damaging hit tears
    // a part. Forced on every save load so an existing save picks it up.
    const BATTLE_CLOTHES_DAMAGE_PERCENT = 10000;

    function applyBattleClothesDamagePercent() {
        if (!$gameVariables) return;
        $gameVariables.setValue(613, BATTLE_CLOTHES_DAMAGE_PERCENT);
    }

    // DataManager.loadGameWithoutRescue is the single funnel for every save load
    // (continue, load menu, autoload) and $gameVariables is already the loaded
    // one when it returns, so this is the earliest reliable point.
    const _DataManager_loadGameWithoutRescue = DataManager.loadGameWithoutRescue;
    DataManager.loadGameWithoutRescue = function (savefileId) {
        const loaded = _DataManager_loadGameWithoutRescue.apply(this, arguments);
        if (loaded) applyBattleClothesDamagePercent();
        return loaded;
    };

    // skills added on new game begin but can be missing if game saved in old version
    const skillIdsToCheck = [
        22, // object detection
        26, // lift
        27, // hide portrait
        29, // breathing perf
        30, // high load
        31, // map effect
        32, // title
        33, // skill
        34, // battle h
        35, // map status
        36, // map ruby
        37, // map time
        38, // smooth scroll
        39, // menu shortcuts
        41, // battle pose
        43, // skip battle
        48, // picture fade
        427, // skill memorize
        428, // skill recover
        429, // skill batch unlock
        430, // skill equip all
    ];


    // functions need to run after saved game loaded
    /*:
    * @function
    * @runs after saved game loaded, wasExecuted control it to run once
    * @obsolete, it can be wrote inside saved game and call in old save loaded
    */
    run_old_savegame_fixes = function () {
        runOldSavegameFixes();
    };
    /*:
    * @function
    * @runs after saved game loaded, wasExecuted control it to run once
    */
    runOldSavegameFixes = function () {
        applyBattleClothesDamagePercent(); // same value as on save load, also for a new game

        console.debug(
            'run_old_savegame_fixes fired!'
        );

        if (wasExecuted) return;

        console.debug(
            'run_old_savegame_fixes continued! / wasExecuted is ' + wasExecuted
        );

        const leader = $gameParty && $gameParty.leader();
        if (!leader) return;

        // Only consume the one-shot flag once the fix has actually been applied.
        // Setting it before the guard above would silently skip the repair for the
        // whole save if this runs before $gameParty is available.
        wasExecuted = true;

        for (const skillId of skillIdsToCheck) {
            if (leader.isLearnedSkill(skillId)) continue;

            leader.learnSkill(skillId);

            // debug
            //leader.setSkillMasteryLevel(skillId, 1);
            //const skill = $dataSkills[skillId];
            //console.log(`add skill: name:${skill.name}, id:${skillId}`);
        }
    }

    // ---------------------------------------------------------------------------
    // Missing event-script entry points.
    //
    // Game_Interpreter.command355 eval()s a Script command with no try/catch, and
    // SceneManager.catchException() ends with SceneManager.stop(). So a single
    // ReferenceError thrown from a Script command prints the error screen and
    // halts the game loop permanently - it is not merely a console warning.
    //
    // The names below are called from data/*.json but have never been defined
    // anywhere in this project's history: `git log -S` across every branch finds no
    // definition in any commit. They are declared here so a stale event cannot halt
    // the game. Each reports once and then does nothing, rather than guessing at
    // behaviour, because the original semantics are not recoverable from here.
    // ---------------------------------------------------------------------------

    const reportedMissingHelpers = new Set();

    function warnMissingHelperOnce(name, detail) {
        if (reportedMissingHelpers.has(name)) return;
        reportedMissingHelpers.add(name);
        console.warn(
            '[amygameFixes] "' + name + '" is called by an event Script command but is not defined.' + detail
        );
    }

    // Picture-animation helper carried over from the pre-MZ version of this project.
    // All three call sites (CommonEvents 62 and 67, Map007 EV005) pass literal test
    // asset names - 'test2' and a 'test\u30d1\u30af\u30c1\u30e3a' picture - so they are left
    // inert rather than pointed at picture_anime1, whose parameter order differs.
    window.pic_anime1 = function () {
        warnMissingHelperOnce(
            'pic_anime1',
            ' Its 3 call sites all use test asset names, so they were left inert.'
        );
    };

    // Opens the job-unlock choice menu. The current equivalent is
    // job_releaseUnlockEvent(startLearningIndex, endLearningIndex), but that needs the
    // range of class ids to offer as choices and that range is not recorded anywhere.
    // To enable the menu, call it with the intended class-id range:
    //   job_releaseUnlockEvent(<first class id>, <last class id>);
    window.job_unlockevent = function () {
        warnMissingHelperOnce(
            'job_unlockevent',
            ' job_releaseUnlockEvent(startLearningIndex, endLearningIndex) is the replacement' +
            ' but needs the class-id range to offer as choices.'
        );
    };

    // Opens the "jouhou" (information) board from Map007 EV003. The related helpers
    // that do exist are jouhou_map / jouhou_buySetup / jouhouShop_preparert, none of
    // which is an entry point for this call, so it is left inert rather than aliased
    // to the wrong one.
    window.jouhou_action = function () {
        warnMissingHelperOnce(
            'jouhou_action',
            ' It is called from Map007 EV003; no matching entry point exists in js/.'
        );
    };
})();

// todo
// fix crash on missing image path in line :"/img/tachies/" + actorParameter, in AmygameTachie.js