//===============================================
// StepsCount.js 
//===============================================

/*:ja
 * @plugindesc 歩数を指定した変数に随時代入するプラグインです。
 * @author 村人A
 *
 * @help
 * _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
 * 
 * バージョン情報
 * 
 * 2020/06/30 ver 1.01リリース
 * カウント終了時も歩数がカウントされてしまう不具合を修正しました。
 * 
 * 2020/03/24 ver 1.0リリース
 * 
 * _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
 * 
 * ===================================
 * ヘルプ
 * ===================================
 * 指定したIDの変数に随時歩数を代入していきます。
 * カウントを開始したい場合はプラグインコマンドにて「歩数カウント開始」と記述してください。
 * 
 * 変数や歩数を調節する場合は以下のプラグインコマンドを使ってください。
 * 
 * ●歩数カウントを開始する場合
 * 歩数カウント開始
 * 
 * ●歩数カウントを中断する場合
 * 歩数カウント終了
 * 
 * ●歩数カウントを０にリセットする場合
 * 歩数カウントのリセット
 * 
 * ●歩数カウントを任意の数増やしたり減らす場合
 * 歩数カウント操作 数値
 * 
 * 例えば１０歩歩数を増やす場合は
 * 
 * 歩数カウント操作 10
 * 
 * １０歩歩数を減らす場合は
 * 
 * 歩数カウント操作 -10
 * 
 * となります。
 * 
 * 
 * @param 歩数を代入する変数のID
 * @desc 歩数を代入する変数のIDを半角数字で指定します。
 * @default 891
 * @type number
 *
 * @param コモンイベントを発生させる歩数
 * @desc コモンイベントを発生させる歩数を指定します。
 * @default 30
 * @type number
 *
 * @param コモンイベントのID
 * @desc 特定の歩数になった際に発生させるコモンイベントのID。
 * @default 773
 * @type number
 *
 */
 {
	'use strict';
	
    const parameters = PluginManager.parameters('StepsCount');
	const variableId = Number(parameters['歩数を代入する変数のID']);
	const startCommonEventStepCount = Number(parameters['コモンイベントを発生させる歩数']);
	const commonId = Number(parameters['コモンイベントのID']);
	
	const _alias_Game_Party_increaseSteps = Game_Party.prototype.increaseSteps;
	Game_Party.prototype.increaseSteps = function() {
		if(!$gameSystem.stepsCountModeStart){return};
		_alias_Game_Party_increaseSteps.call(this);
		//console.log(this._steps)//変更。カット
		$gameVariables.setValue(variableId, this._steps)
		if(startCommonEventStepCount <= this._steps){$gameTemp.reserveCommonEvent(commonId)};
	};
	
    const _alias_Game_System_initialize = Game_System.prototype.initialize;
	Game_System.prototype.initialize = function() {
		_alias_Game_System_initialize.call(this);
		this.stepsCountModeStart = false;
	}
	
    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command == "startCountStep" || command == "歩数カウント開始") {
			$gameSystem.stepsCountModeStart = true;
		}
        if (command == "stopCountStep" || command == "歩数カウント終了") {
			$gameSystem.stepsCountModeStart = false;
		}
        if (command == "resetStep" || command == "歩数カウントのリセット") {
			$gameParty._steps = 0;
			$gameVariables.setValue(variableId, 0)
		}
        if (command == "controllStep" || command == "歩数カウント操作") {
			$gameParty._steps += Number(args[0]);
			$gameVariables.setValue(variableId, $gameVariables.value(variableId) + Number(args[0]))
		}
	}
 }