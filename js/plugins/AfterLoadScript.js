/*:
 * @plugindesc Runs custom JavaScript code after a saved game is loaded.
 * @author author
 *
 * @help
 * This plugin runs custom JavaScript code right after a saved game is loaded.
 */

(function () {
    // autorun on save load code
    var _Scene_Load_onLoadSuccess = Scene_Load.prototype.onLoadSuccess;
    Scene_Load.prototype.onLoadSuccess = function () {
        _Scene_Load_onLoadSuccess.call(this);
        this.executeAfterLoadScript();
    };
    Scene_Load.prototype.executeAfterLoadScript = function () {
        add_missing_skills();
    };

    // functions need to run after saved game loaded
    /*:
    * @function
    * @help add missing skills
    */
    add_missing_skills = function () {

        // skills added on new game begin
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
        const leader = $gameParty.leader();
        for (const skillId of skillIdsToCheck) {
            if (leader.isLearnedSkill(skillId)) continue;
         
            leader.learnSkill(skillId);

            // debug
            //leader.setSkillMasteryLevel(skillId, 1);
            //const skill = $dataSkills[skillId];   
            //console.log(`add skill: name:${skill.name}, id:${skillId}`);
        }
    }
})();