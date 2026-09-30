/*:
 * @plugindesc Fix for issues of saved games in previous versions
 * @author author
 *
 * @help
 * map003 EV003 add runOldSavegameFixes() from here.
 */

(function () {

  let wasExecuted = false;

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

  //???there is call of it somewhere but cant find it by function name
  window.run_old_savegame_fixes = function () {
    window.runOldSavegameFixes();
  };

  // functions need to run after saved game loaded
  /*:
  * @function
  * @help it ru after each saved game loaded
  */
  window.runOldSavegameFixes = function () {

    if (wasExecuted) return;
    wasExecuted = true;

    const leader = $gameParty && $gameParty.leader();
    if (!leader) return;

    for (const skillId of skillIdsToCheck) {
      if (leader.isLearnedSkill(skillId)) continue;

      leader.learnSkill(skillId);

      // debug
      //leader.setSkillMasteryLevel(skillId, 1);
      //const skill = $dataSkills[skillId];
      //console.log(`add skill: name:${skill.name}, id:${skillId}`);
    }
  };
})();

// todo
// - job points for subclass was set to 25% of main class jp get,
// calculate and add missing job points for subclass, maybe will be not possible precise
//
// - goblins is not disappear after quest of subjugation completed
//  and instead each next battle not only raises max level
// of monsters but completes new subjugation quest,
// need to find and fix the source function
// check annihilationItem_bonus();
//
// fix crash on missing image path in line :"/img/tachies/" + actorParameter, in AmygameTachie.js