//=============================================================================
// TRP_DevTools.js
//=============================================================================
/*:
 * @author Thirop
 * @plugindesc ビューワ呼び出し・テストプレイ用ツール
 * @help
 * 【更新履歴】
 * 1.01 2022/08/04 スクリプト実行時の不具合修正。
 *                 立ち絵プラグインとの競合修正。
 * 
 * @param key
 * @text ショートカットキー
 * @desc ショートカットキー。Ctrl(Cmd)を押しながら設定したキーを押すと表示。（デフォ値：t）
 * @default t
 *
 * @param toolWindows
 * @text 独自ツールウィンドウ
 * @desc 独自ツールウィンドウの登録
 * @default ["{\"key\":\"d\",\"commands\":\"[\\\"{\\\\\\\"type\\\\\\\":\\\\\\\"victory\\\\\\\",\\\\\\\"param\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"name\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"key\\\\\\\":\\\\\\\"v\\\\\\\",\\\\\\\"closeWindow\\\\\\\":\\\\\\\"true\\\\\\\"}\\\",\\\"{\\\\\\\"type\\\\\\\":\\\\\\\"defeat\\\\\\\",\\\\\\\"param\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"name\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"closeWindow\\\\\\\":\\\\\\\"true\\\\\\\"}\\\",\\\"{\\\\\\\"type\\\\\\\":\\\\\\\"doubleSpeed\\\\\\\",\\\\\\\"param\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"name\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"closeWindow\\\\\\\":\\\\\\\"true\\\\\\\"}\\\",\\\"{\\\\\\\"type\\\\\\\":\\\\\\\"eventSkip\\\\\\\",\\\\\\\"param\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"name\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"closeWindow\\\\\\\":\\\\\\\"true\\\\\\\"}\\\",\\\"{\\\\\\\"type\\\\\\\":\\\\\\\"gainAllItems\\\\\\\",\\\\\\\"param\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"name\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"key\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"closeWindow\\\\\\\":\\\\\\\"true\\\\\\\"}\\\",\\\"{\\\\\\\"type\\\\\\\":\\\\\\\"gainGold\\\\\\\",\\\\\\\"param\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"name\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"key\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"closeWindow\\\\\\\":\\\\\\\"true\\\\\\\"}\\\",\\\"{\\\\\\\"type\\\\\\\":\\\\\\\"levelMax\\\\\\\",\\\\\\\"param\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"name\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"key\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"closeWindow\\\\\\\":\\\\\\\"true\\\\\\\"}\\\"]\"}"]
 * @type struct<ToolWindow>[]
 *
 * @param skipRate
 * @text イベント高速化の倍率
 * @desc イベント高速化の倍率。高速再生はプラグインコマンド（MV形式は「stopEventSkip」）で解除
 * @default 5
 * @type num
 * @min 1
 *
 * @command stopEventSkip
 * @text イベント高速化OFF
 * @desc イベント高速化状態を中段
 * 
 */
 /*~struct~ToolWindow:
 * @param key
 * @text キー名
 * @desc このツールウィンドウを呼び出すキー名（Ctrl+キー名で呼び出し）
 *
 * @param commands
 * @text コマンド登録
 * @desc このウィンドウに表示するコマンドの登録
 * @type struct<Command>[]
 */
/*~struct~Command:
 * @param type
 * @text コマンドタイプ
 * @desc 実行するコマンドの種類を選択。(コモンイベントのID、スクリプト内容は「パラメータ」で設定）
 * @type select
 * @option commonEvent/コモンイベント
 * @value commonEvent
 * @option script/スクリプト
 * @value script
 * @option victory/敵全滅
 * @value victory
 * @option defeat/味方全滅
 * @value defeat
 * @option doubleSpeed/倍速切り替え
 * @value doubleSpeed
 * @option eventSkip/イベント高速化の切り替え
 * @value eventSkip
 * @option gainAllItems/全アイテム取得
 * @value gainAllItems
 * @option gainGold/ゴールド取得
 * @value gainGold
 * @option levelMax/レベル最大
 * @value levelMax
 *
 * @param param
 * @text パラメータ
 * @desc タイプがコモンイベントの場合はID、スクリプトの場合はスクリプト
 *
 * @param name
 * @text 名前
 * @desc 表示するコマンド名。コモンイベントの場合は省略するとコモンイベント名
 *
 * @param key
 * @text キー
 * @desc 設定すると、「Ctrl+キー」でコマンドを直接呼び出し
 *
 * @param closeWindow
 * @text ウィンドウを閉じる
 * @desc ON/trueで、コマンド実行後にウィンドウを閉じる
 * @default true
 * @type boolean
 */
//============================================================================= 


var TRP_CORE = TRP_CORE||{};

(function(){
'use strict';

if (!Utils.isNwjs() || !Utils.isOptionValid('test')){
	return;
}


var pluginName = 'TRP_DevTools';
var parameters = PluginManager.parameters(pluginName);

var skipRate = Number(parameters.skipRate)||1;
var keyToolWindowMap = {};
var keyCommandMap = {};
var toolWindows = null;
var doubleSpeedEnabled = false;
var eventSkipEnabled = false;
(()=>{
    /* validate parameters
    ===================================*/
    toolWindows = JSON.parse(parameters.toolWindows);
    for(var i=toolWindows.length-1; i>=0; i=(i-1)|0){
        toolWindows[i] = JSON.parse(toolWindows[i]);
        var toolWindow = toolWindows[i];
        if(!toolWindow)continue;

        if(toolWindow.key){
            if(keyToolWindowMap[toolWindow.key] ||parameters.key===toolWindow.key || keyCommandMap[toolWindow.key]){
                throw new Error('ツールウィンドウの呼び出しキー「'+toolWindow.key+'」が重複登録されています。')
            }
            keyToolWindowMap[toolWindow.key] = toolWindow;
        }

        toolWindow.commands = JSON.parse(toolWindow.commands);
        var commands = toolWindow.commands;
        for(var j=commands.length-1; j>=0; j=(j-1)|0){
            commands[j] = JSON.parse(commands[j]);
            var command = commands[j];
            command.closeWindow = command.closeWindow==='true';
            if(command.key){
                if(keyToolWindowMap[command.key] ||parameters.key===command.key || keyCommandMap[command.key]){
                    throw new Error('ツールウィンドウの呼び出しキー「'+toolWindow.key+'」が重複登録されています。');
                }
                keyCommandMap[command.key] = command;
            }
            switch(command.type){
            case 'doubleSpeed':
                doubleSpeedEnabled = true;
                break;
            case 'eventSkip':
                eventSkipEnabled = true;
                break;
            case 'commonEventId':
                if(!$dataCommonEvents[Number(command.param)]){
                    throw new Error('ツールウィンドウのコマンド登録エラー：コモンイベントID「%1」のデータが存在しません。'.format(command.param));
                }
                break;
            }
        }
    }
})();


var isMZ = Utils.RPGMAKER_NAME==="MZ";

if(isMZ){
    PluginManager.registerCommand(pluginName,'stopEventSkip',()=>{
        TRP_CORE.eventSkip = false;
    });
}
var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args){
    if(command.toLowerCase()==='stopeventskip'){
        TRP_CORE.eventSkip = false;
    }else{
        _Game_Interpreter_pluginCommand.call(this,command,args);
    }
};


var _SceneManager_onKeyDown = SceneManager.onKeyDown;
SceneManager.onKeyDown = function(event){
	if(event.ctrlKey||event.metaKey){
        if(TRP_CORE.onKeyDownForDevTools(event)){
            return;
        }
	}
	_SceneManager_onKeyDown.call(this,event);
};

TRP_CORE.onKeyDownForDevTools = function(event){
    if(TRP_CORE.devToolsDisabled)return;
    if(TRP_CORE.showingToolsWindow)return;

    if(SceneManager._scene){
        if(SceneManager._scene.update!==SceneManager._scene.constructor.prototype.update){
            //update override maybe for any devTool
            return;
        }
        if(SceneManager._scene._particleEditor){
            //particle editor
            return;
        }
    }
    if(window.TRP_SkitDevPicker && TRP_SkitDevPicker._expPicker){
        //exp picker
        return;
    }

    if(parameters.key && event.key===parameters.key){
        TRP_CORE.showDevToolsWindow(event.key);
        return true;
    }else if(keyToolWindowMap[event.key]){
        TRP_CORE.showDevToolsWindow(event.key);    
        return true;
    }else if(keyCommandMap[event.key]){
        TRP_CORE.processDevToolsCommand(keyCommandMap[event.key]);
        SoundManager.playCursor();
        return true;
    }
    return false;
}

TRP_CORE.showingToolsWindow = null;
TRP_CORE.showDevToolsWindow = function(key){
    var setting;
    if(key===parameters.key){
        setting = parameters;
    }else{
        setting = keyToolWindowMap[key];
    }
	if(!setting || TRP_CORE.showingToolsWindow===setting){
		SoundManager.playBuzzer();
		return;
	}

	TRP_CORE.showingToolsWindow = setting;
	SoundManager.playOk();

    var window;
    if(setting===parameters){
        window = new Window_TrpDevTools();
    }else{
        window = new Window_TrpCustomDevTools(setting);
    }

    var scene = SceneManager._scene;
    scene.addChild(window);
    window.setup();

    var update = scene.update;
    scene.update = function(){
    	window.update();
    	if(window.isClosed()){
    		scene.update = update;
    		TRP_CORE.showingToolsWindow = null;
    	}
    };
};
TRP_CORE.processDevToolsCommand = function(command){
    switch(command.type){
    case 'commonEvent':
        $gameTemp.reserveCommonEvent(Number(command.param));
        break;
    case 'script':
        this.processEval(command.param);
        break;
    case 'doubleSpeed':
        TRP_CORE.doubleSpeed = !TRP_CORE.doubleSpeed;
        break;
    case 'eventSkip':
        TRP_CORE.eventSkip = !TRP_CORE.eventSkip;
        break;

    case 'victory':
        if(!$gameParty.inBattle()){
            SoundManager.playBuzzer();
        }else{
            $gameTroop.members().forEach(m=>{
                m.setHp(0);
            });
            BattleManager.checkBattleEnd();
        }
        break;
    case 'defeat':
        $gameParty.members().forEach(m=>{
            m.setHp(0);
        });
        if($gameParty.inBattle()){
            BattleManager.checkBattleEnd();
        }
        break;

    case 'gainGold':
        $gameParty.gainGold(9999999);
        break;
    case 'gainAllItems':
        [$dataItems,$dataWeapons,$dataArmors].forEach((dataSet)=>{
            for(const data of dataSet){
                if(data && data.name){
                    $gameParty.gainItem(data,99);
                }
            }
        });
        break;
    case 'levelMax':
        for(const member of $gameParty.members()){
            if(member.isMaxLevel())continue;

            var maxLevel = member.maxLevel();
            var exp = member.expForLevel(maxLevel);
            member.changeExp(exp,false);
        }
        break;
    }
};
TRP_CORE.processEval = function(script){
    try{
        eval(script);
    }catch(e){
        console.log(script);
        throw e;
    }
}


//=============================================================================
// Window_TrpDevToolsBase
//=============================================================================
function Window_TrpDevToolsBase(){
    this.initialize.apply(this, arguments);
}
Window_TrpDevToolsBase.prototype = Object.create(Window_Command.prototype);
Window_TrpDevToolsBase.prototype.constructor = Window_TrpDevToolsBase;
Window_TrpDevToolsBase.prototype.initialize = function() {
    var width = this.windowWidth();
    var height = this.windowHeight();
    var x = (Graphics.width-width)/2;
    var y = (Graphics.height-height)/2;

    if(isMZ){
        var rect = new Rectangle(x,y,width,height)
        Window_Command.prototype.initialize.call(this, rect);
    }else{
        Window_Command.prototype.initialize.call(this,x,y);
    }

    this.openness = 0;
    this.deactivate();

    this.setHandler('cancel', ()=>{
        this.close();
    });
};

Window_TrpDevToolsBase.prototype.windowWidth = function(){
    return Math.min(Graphics.width-100,500);
};
Window_TrpDevToolsBase.prototype.windowHeight = function(){
    var lines = this.commands().length;

    var height;
    do{
        height = this.fittingHeight(lines);
        lines -= 1;
    }while(height>Graphics.height-10 && lines>0);

    return height;
};
Window_TrpDevToolsBase.prototype.makeCommandList = function() {
    var commands = this.commands();
    var names = this.commandNames(commands);
    var length = commands.length;
    for(var i=0; i<length; i=(i+1)|0){
        var command = commands[i];
        var name = names[i];
        this.addCommand(name,command);
    }
};
Window_TrpDevToolsBase.prototype.setup = function() {
    this.refresh();
    if(isMZ){
        this.forceSelect(0);
    }else{
        this.select(0);
    }
    this.activate();
    this.open();
};

Window_TrpDevToolsBase.prototype.commands = null;
Window_TrpDevToolsBase.prototype.commandNames = null;


//=============================================================================
// Window_TrpCustomDevTools
//=============================================================================
function Window_TrpCustomDevTools(){
    this.initialize.apply(this, arguments);
}
Window_TrpCustomDevTools.prototype = Object.create(Window_TrpDevToolsBase.prototype);
Window_TrpCustomDevTools.prototype.constructor = Window_TrpCustomDevTools;
Window_TrpCustomDevTools.prototype.initialize = function(setting){
    this._setting = setting;
    Window_TrpDevToolsBase.prototype.initialize.call(this);

    var commands = setting.commands;
    var length = commands.length;
    for(var i=0; i<length; i=(i+1)|0){
        this.registerCommandHandler(i,commands[i]);
    }
};

Window_TrpCustomDevTools.prototype.registerCommandHandler = function(i,command){
    this.setHandler('command:'+i,()=>{
        TRP_CORE.processDevToolsCommand(command);

        if(command.closeWindow){
            this.visible = false;
            this.close();
        }
    });
};

Window_TrpCustomDevTools.prototype.commands = function(){
    var commands = [];
    var length = this._setting.commands.length;
    for(var i=0; i<length; i=(i+1)|0){
        commands.push('command:'+i)
    }
    commands.push('cancel');

    return commands;
};
Window_TrpCustomDevTools.prototype.commandNames = function(commands){
    var names = [];
    var commands = this._setting.commands;
    for(const command of commands){
        var name = command.name;
        if(!name){
            switch(command.type){
            case 'victory':
                name = '敵全滅';
                break;
            case 'defeat':
                name = '味方全滅';
                break;
            case 'doubleSpeed':
                name = '倍速切り替え';
                break;
            case 'eventSkip':
                name = 'イベント高速化の切り替え';
                break;
            case 'gainGold':
                name = 'ゴールド取得';
                break;
            case 'gainAllItems':
                name = '全アイテム取得';
                break;
            case 'levelMax':
                name = 'レベル最大';
                break;


            case 'script':
                name = command.param;
                if(name.length>20){
                    name = name.substring(0,Math.min(20,name.length))+'…';
                }
                break;
            case 'commonEvent':
                var commonEventId = Number(command.param);
                var commonEvent = $dataCommonEvents[commonEventId];
                name = commonEvent.name;
                break;
            }
        }
        if(command.key){
            name += '<'+command.key+'>';
        }
        names.push(name);
    }
    names.push('キャンセル');
    return names;
};




//=============================================================================
// Window_TrpDevTools
//=============================================================================
function Window_TrpDevTools() {
    this.initialize(...arguments);
};
Window_TrpDevTools.prototype = Object.create(Window_TrpDevToolsBase.prototype);
Window_TrpDevTools.prototype.constructor = Window_TrpDevTools;

Window_TrpDevTools.prototype.initialize = function(){
    Window_TrpDevToolsBase.prototype.initialize.call(this);

    this.setHandler('animation', ()=>{
        this.close();
        TRP_CORE.AnimationViewer.start(0,null);
    });
    this.setHandler('se',()=>{
        TRP_CORE.SeEditor.start('',null);
        this.visible = false;
        this.close();
    });
    this.setHandler('particle', ()=>{
        TRP_CORE.ParticleViewer.start(null,true,false);
        this.visible = false;
        this.close();
    });
    this.setHandler('particleGroup', ()=>{
        TRP_CORE.ParticleViewer.start(null,true,true);
        this.visible = false;
        this.close();
    });
};

Window_TrpDevTools.prototype.commands = function(){
    var commands = [];
    if(PluginManager._scripts.contains('TRP_AnimationEx')){
        commands.push('animation');
    }
    if(PluginManager._scripts.contains('TRP_SEPicker')){
        commands.push('se');    
    }
    if(PluginManager._scripts.contains('TRP_ParticleMZ_ExViewer')){
        commands.push('particle');
        if(PluginManager._scripts.contains('TRP_ParticleMZ_Group')
            || PluginManager._scripts.contains('TRP_Particle_Group')
        ){
            commands.push('particleGroup');
        }
    }
    commands.push('cancel');

    return commands;
}
Window_TrpDevTools.COMMAND_NAMES = {
    animation:'アニメーションピッカー',
    se:'SEピッカー',
    particle:'パーティクルピッカー',
    particleGroup:'パーティクルグループピッカー',
    cancel:'キャンセル',
};
Window_TrpDevTools.prototype.commandNames = function(commands=this.commands()){
    var names = [];
    for(const command of commands){
        names.push(Window_TrpDevTools.COMMAND_NAMES[command]);
    }
    return names;
}




//=============================================================================
// TRP_CORE
//=============================================================================
TRP_CORE.doubleSpeed = false;
TRP_CORE.eventSkip = false;
TRP_CORE.devToolsDisabled = false;

TRP_CORE.isEventRunning = function(){
    if(TRP_CORE.showingToolsWindow)return false;
    return $gameParty.inBattle() ? $gameTroop.isEventRunning() : $gameMap.isEventRunning();
}
if(doubleSpeedEnabled||eventSkipEnabled)(()=>{
    if(isMZ){
        var _SceneManager_determineRepeatNumber = SceneManager.determineRepeatNumber;
        SceneManager.determineRepeatNumber = function(deltaTime) {
            var num = _SceneManager_determineRepeatNumber.call(this,deltaTime);
            if(TRP_CORE.eventSkip && TRP_CORE.isEventRunning()){
                num += (Number(parameters.skipRate)||1)-1;
            }else if(TRP_CORE.doubleSpeed){
                num += 1;
            }
            return num;
        };
    }else{
        var isFirstUpdate = false;

        var _SceneManager_updateScene = SceneManager.updateScene;
        SceneManager.updateScene = function() {
            isFirstUpdate = true;
            _SceneManager_updateScene.call(this);

            isFirstUpdate = false;

            var num = 0;
            if(TRP_CORE.eventSkip && TRP_CORE.isEventRunning()){
                num += (Number(parameters.skipRate)||1)-1;
            }else if(TRP_CORE.doubleSpeed){
                num += 1;
            }

            if (this._scene){
                if (this.isCurrentSceneStarted()){
                    for(var i=0; i<num; i=(i+1)|0){
                        this.updateInputData();
                        this._scene.update();
                    }
                }
            }
        };
    }
})();


if(eventSkipEnabled)(()=>{
    var _Window_ScrollText_isFastForward = Window_ScrollText.prototype.isFastForward;
    Window_ScrollText.prototype.isFastForward = function(){
        if ($gameMessage.scrollNoFast())return false;

        if(TRP_CORE.eventSkip && TRP_CORE.isEventRunning())return true;
        return _Window_ScrollText_isFastForward.call(this);
    };


    // var _Window_Message_processNewLine = Window_Message.prototype.processNewLine;
    // Window_Message.prototype.processNewLine = function(){
    //     _Window_Message_processNewLine.call(this,...arguments);

    //     if(TRP_CORE.eventSkip && TRP_CORE.isEventRunning()){
    //         this._lineShowFast = true;
    //     }
    // };

    var _Window_Message_isTriggered = Window_Message.prototype.isTriggered;
    Window_Message.prototype.isTriggered = function() {
        if(TRP_CORE.eventSkip && TRP_CORE.isEventRunning()){
            return true;
        }
        return _Window_Message_isTriggered.call(this,...arguments);
    };
})();





})();