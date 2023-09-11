//=============================================================================
// IZ_MessageWindow.js
// ----------------------------------------------------------------------------
// Copyright (c) 2018 IZ
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0   2018/05/21  プラグインヘルプの改善
// 0.1.0β 2017/10/22
//=============================================================================

/*:
 * @plugindesc 顔画像の代わりにバストアップや立ち絵画像も表示できるメッセージウィンドウ。
 * トリアコンタン様作成のPicturePriorityCustomize.jsと合わせて使用します。
 * @author いず
 *
 * @param DefaultPictureMode
 * @desc バストアップモードと立ち絵モードのどちらをデフォルトで使うか
 * 0 : バストアップモード　1 : 立ち絵モード
 * @type select
 * @option 0 : バストアップモード
 * @value 0
 * @option 1 : 立ち絵モード
 * @value 1
 * @default 0
 *
 * @param == バストアップモード設定 ==
 * @desc
 * @default
 *
 * @param BustUpstUpPictureId
 * @desc バストアップ画像のピクチャ番号。PicturePriorityCustomize.js
 * の"上層ピクチャ番号"より大きな数値を指定。
 * @default 100
 * @type number
 * @min 1
 * @parent 
 * 
 *
 * @param BustUpFiles
 * @desc バストアップ用画像リスト。
 * バストアップに使用する画像を『全て』指定してください。
 * @default
 * @require 1
 * @dir img/pictures/
 * @type file[]
 *
 * @param BustUpWidth
 * @desc バストアップ画像の幅
 * @default 200
 * @type number
 * @min 0
 *
 * @param BustUpHeight
 * @desc バストアップ画像の高さ
 * @default 250
 * @type number
 * @min 0
 *
 * @param BustUpPosX
 * @desc ウィンドウ左下に対するバストアップ画像左下のX座標（右方向正）
 * @default 0
 * @type number
 *
 * @param BustUpPosY
 * @desc ウィンドウ左下に対するバストアップ画像左下のY座標（上方向正）
 * @default 0
 * @type number
 *
 * @param == 立ち絵モード（未完成）設定 ==
 * @desc バストアップ画像に関する設定
 * @default
 *
 * @param STPictureId
 * @desc 立ち絵画像のピクチャ番号。PicturePriorityCustomize.js
 * の"上層ピクチャ番号"より小さな数値を指定。
 * @default 100
 * @type number
 * @min 1
 *
 * @param STFiles
 * @desc 立ち絵用画像リスト。
 * 立ち絵に使用する画像を『全て』指定してください。
 * @default
 * @require 1
 * @dir img/pictures/
 * @type file[]
 *
 * @param STPosX
 * @desc ゲーム画面左下に対する立ち絵画像左『上』のX座標
 * （右方向正）
 * @default 0
 * @type number
 *
 * @param STPosY
 * @desc ゲーム画面左下に対する立ち絵画像左『上』のY座標
 * （『下』方向正） ★画像原点及び座標軸の向きに注意！
 * @default 0
 * @type number
 *
 * @param STZoom
 * @desc 立ち絵の大きさ倍率。元画像に対して
 * X軸方向〇倍、Y軸方向〇倍の大きさにして表示する。
 * @default 1
 * @type number
 * @decimals 2
 *
 * @help ・いつも通りエディタで顔画像を設定するだけで
 * 　顔画像の代わりにバストアップや立ち絵画像も表示できる
 * 　メッセージウィンドウを実装します。
 * ・トリアコンタン様作成のPicturePriorityCustomize.jsと合わせて使用します。
 * ・顔画像の代わりに表示する画像には、「バストアップモード」と「立ち絵モード」の
 * 　２つのモードがあります。
 * ・バストアップ画像や立ち絵画像は通常のピクチャとして配置されます。
 * ・対応するバストアップ画像や立ち絵画像がない場合は通常の顔画像が表示されます。
 * ・モードはプラグインコマンドで切り替えることができます（下記使い方の６を参照）。
 * 
 * 〇「バストアップモード」
 * 　・通常の顔画像の位置に、ウィンドウより上層に配置されます。
 * 　・画像は（原則として）プラグインパラメータで指定した大きさの物を使用します。
 * 　　（例；BustUpWidth = 200, BustUpHeight = 250のとき、
 * 　　　幅200px, 250pxの画像が使用できます。）
 * 　・画像幅（ = BustUpWidthの値）に応じてメッセージの改行位置が変更されます。
 *
 * 〇「立ち絵モード」
 * 　・通常のピクチャと同様にウィンドウの下に配置されます。
 * 　・様々な大きさの画像を使用できます。
 * 　・メッセージの改行位置は 0（顔画像を表示しないときと同じ）になります。
 * 　・元画像から一定倍率拡大/縮小して表示することができます。
 *
 * ※画像の準備等、お膳立ての部分が多いプラグインです。
 * 　下記説明を参考に頑張って準備してくださいm(__)m
 * 
 *
 * 
 * ★使用方法
 * 
 * １．トリアコンタン様作のPicturePriorityCustomize.jsを有効にし、
 * 　　各プラグインパラメータを設定して下さい。
 * 　　※このとき、"上層ピクチャ番号"には100より小さな数値を、
 * 　　　"下層ピクチャ番号"にはお好きな数値（ただし、これより大きな数値に
 * 　　　通常ピクチャが割り振られるので小さめの数値がおススメ）を
 * 　　　それぞれ設定してください。
 *
 * ２．「エディタ表示用画像」と
 * 　　「バストアップ用画像」・「立ち絵用画像」を作成してください。
 *　　■エディタ表示用画像
 * 　　・エディタで画像を選ぶときに表示する画像。通常の顔画像と同じ画像規格。
 * 　　・ゲーム画面に表示される画像ではないので、適当なものでも大丈夫です。
 * 　　　　0 | 1 | 2 | 3
 * 　　　　4 | 5 | 6 | 7 
 *　　　　↑エディタ表示用画像インデックス番号
 *  　　　　バストアップ用画像と立ち絵用画像のファイル名に使用します。
 *　　■バストアップ用画像
 * 　　・バストアップモードの時に顔画像の代わりに表示する画像。
 * 　　・１つの画像に１つのバストアップ。 
 * 　　・すべてのバストアップ用画像は原則として『同じ大きさ』。
 *　　 ・ファイル名は○○○〇_X　の形に統一
 *　　　 〇〇〇〇：エディタ表示用画像の名前（拡張子なし）
 * 　　　X：エディタ表示用画像のインデックス番号（上記参照）
 * 　　　例；Actor1_0
 *　　■立ち絵用画像
 * 　　・立ち絵モードの時に顔画像の代わりに表示する画像。
 * 　　・１つのファイルに１つの立ち絵。
 * 　　・それぞれの立ち絵の大きさは揃えなくても良い。
 * 　　・ファイル名は〇〇〇〇_sX　の形に統一
 * 　　　〇〇〇〇：エディタ表示用画像の名前（拡張子なし）
 * 　　　s：半角小文字の's'
 * 　　　X：エディタ表示用画像のインデックス番号（上記参照）
 * 　　　例；Actor1_s0
 *
 * ３．バストアップ用画像はimg/picturesに、
 * 　　エディタ表示用画像はimg/facesにそれぞれ保存してください。
 * 　　※バストアップか立ち絵のどちらか一方しか使わない場合も、
 * 　　　必ずプラグインパラメータ設定画面を開き、
 * 　　　"BustUpFiles"と"STFiles"のどちらも空白でないことを
 * 　　　確認してください。
 * 　　（空欄だと正常に動作しません。何もファイルを指定しない場合、
 * 　　　プラグインパラメータには [] (カギ括弧両とじのみ)を設定してください）
 *
 * ４．その他のプラグインパラメータを登録していきます（たくさんあります）。
 * 　　※ "BustUpPictureId"には PicturePriorityCustomize.jsの"上層ピクチャ番号"
 * 　　　よりも小さな数値を、
 * 　　　 "STPictureId"には、"上層ピクチャ番号"よりも小さな数値を
 * 　　　それぞれ指定してください。
 *
 * ５．★準備お疲れ様です！★
 * 　　ここまで設定したらあとはエディタではいつも通り顔画像を指定していくだけです。
 * 　　対応するバストアップ画像/立ち絵画像があるときのみ、その画像が表示されます。
 *
 * ６．途中で「バストアップモード」と「立ち絵モード」を切り替えるときは、
 * 　　プラグインコマンドを使用します。
 * 　　MWPic BustUp -> バストアップモードに切り替え
 * 　　MWPic Standing -> 立ち絵モードに切り替え
 *
 * ７．バストアップ画像/立ち絵画像はメッセージ中に
 * 　　文字色や文字の大きさを変えるのと同じ要領で次の文字列を記入すると、
 * 　　その位置で画像を変更することができます。
 * 　　/0 -> 現在の画像名の末尾の数字を'0'に置き換えた画像
 * 　　/1 -> 現在の画像名の末尾の数字を'1'に置き換えた画像
 * 　　　・　　　　　　　　　　　・
 * 　　　・　　　　　　　　　　　・
 * 　　　・　　　　　　　　　　　・
 * 　　/7 -> 現在の画像名の末尾の数字を'7'に置き換えた画像
 * 　　/8 -> エディタで指定した画像（はじめに表示した画像）
 *
 *
 */

(function () {

    'use strict'
    var pluginName = 'IZ_MessageWindow';

    function toNumber(str, def) {
        return isNaN(str) ? def : +(str || def);
    }

    //■プラグインパラメータ
    var parameters = PluginManager.parameters(pluginName);

    //バストアップ用
    var BustUpPictureId = parseInt(parameters['BustUpPictureId'])||100;
    var BustUpWidth = toNumber(parameters['BustUpWidth'], 200);
    var BustUpHeight = toNumber(parameters['BustUpHeight'], 250);
    var BustUpPosX = toNumber(parameters['BustUpPosX'], 10);
    var BustUpPosY = toNumber(parameters['BustUpPosY'], 0);
    var buf = PluginManager.parameters(pluginName)['BustUpFiles'];
    var BustUpFiles = JSON.parse(buf);

    //立ち絵用
    var STPictureId = parseInt(parameters['STPictureId']) || 50;
    var STPosX = toNumber(parameters['STPosX'], 0);
    var STPosY = toNumber(parameters['STPosY'], 0);
    var stf = PluginManager.parameters(pluginName)['STFiles'];
    var STFiles = JSON.parse(stf);
	var STZoom = toNumber(parameters['STZoom'], 1);

    //バストアップモード・立ち絵モード管理変数
    var mode = toNumber(parameters['DefaultPictureMode'], 0);

    //■モード切替（プラグインコマンド）
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'MWPic') {
            switch(args[0]){
                case 'BustUp':
                    mode = 0;
                    break;
                case 'Standing':
                    mode = 1;
					break;
            }
        }
    };


    var _GameMessage_clear = Game_Message.prototype.clear;
    Game_Message.prototype.clear = function () {
		_GameMessage_clear.call(this);
		this._bustUpName = '';//バストアップ名を追加
        this._standName = '';//立ち絵名を追加
    };

    Game_Message.prototype.bustUpName = function () {
        return this._bustUpName;
    };

    Game_Message.prototype.standName = function () {
        return this._standName;
    };

    var _Game_Message_setFaceImage = Game_Message.prototype.setFaceImage;
    Game_Message.prototype.setFaceImage = function (faceName, faceIndex) {
        var value1 = Number(faceName.charAt(faceName.length -1));//変更。インデックスではなく連番で会話顔グラ表示
        if(value1 == 1){
          var value2 = faceIndex + 1;
        } else {
          var value2 = (faceIndex + 1) + ((value1 - 1) * 8);
        };
        var value3 = faceName.substring(0, faceName.length-1);
        //var buName = faceName + '_' + faceIndex;
          var buName = value3 + '_' + value2;
        //var stName = faceName + '_s'+ faceIndex;
          var stName = value3 + '_' + value2;
        if (mode == 0) {
            for (var i = 0, len = BustUpFiles.length; i < len; i++) {
                if (i in BustUpFiles && BustUpFiles[i] === buName) {
                    this._bustUpName = buName;
                    break;
                }
            }
            if (this._bustUpName === '') {
				_Game_Message_setFaceImage.call(this, faceName, faceIndex);
            }
        } else if (mode == 1) {
            for (var i = 0, len = STFiles.length; i < len; i++) {//変更。正規ファイル名との照合を停止
                if (i in STFiles && STFiles[i] === stName) {
                    this._standName = stName;
                    break;
                }
            }
            if (this._standName === '') {
                _Game_Message_setFaceImage.call(this, faceName, faceIndex);
            }
        }
        
    };


    var _Window_Message_newLineX = Window_Message.prototype.newLineX;
    Window_Message.prototype.newLineX = function () {
        if (mode == 0 && $gameMessage.bustUpName() !== '') {
            return BustUpPosX + BustUpWidth + 10;
        } else if (mode == 1 && $gameMessage.standName() !== '') {
            return 0;
        } else {
			return _Window_Message_newLineX.call(this);
        }
    };

	
	//ここで競合が起きないようにしたい！
    var _Window_Message_startMessage = Window_Message.prototype.startMessage;
    Window_Message.prototype.startMessage = function () {
        this._textState = {};
        this._textState.index = 0;
        this._textState.text = "\x1b8" + this.convertEscapeCharacters($gameMessage.allText());//最初に挿入したエスケープキャラクターによってピクチャ配置イベントを呼び出す
        this.newPage(this._textState);
        this.updatePlacement();
        this.updateBackground();
        this.open();
    };

	

    var _Window_Message_terminateMessage = Window_Message.prototype.terminateMessage;
    Window_Message.prototype.terminateMessage = function () {
        $gameScreen.erasePicture(this.izPictureNumber());//_
        _Window_Message_terminateMessage.call(this);
    };

    //ピクチャ番号をモードによって変更する関数を追加
    Window_Message.prototype.izPictureNumber = function () {
        return mode == 0 ? BustUpPictureId : STPictureId;
    }

    Window_Message.prototype.izPictureName = function () {
        return mode == 0 ? $gameMessage.bustUpName() : $gameMessage.standName();
    }

    Window_Message.prototype.izPicturePosX = function () {
        return mode == 0 ? BustUpPosX : STPosX;
    }

    Window_Message.prototype.izPicturePosY = function(){
        if(mode == 0){
            return this._positionType * (Graphics.boxHeight - this.height) / 2 + this.height - BustUpHeight - BustUpPosY;
        }else{
            return STPosY;
        }
        
    }

	Window_Message.prototype.izPictureZoom = function(){
		return mode == 0 ? 100 : STZoom * 100;
	}

	var _Window_Message_processEscapeCharacter = Window_Message.prototype.processEscapeCharacter;
	Window_Message.prototype.processEscapeCharacter = function(code, textState){
	    switch (code) {
		    case '8':
			    $gameScreen.showPicture(this.izPictureNumber(), this.izPictureName(), 1, this.izPicturePosX(), this.izPicturePosY(), this.izPictureZoom(), this.izPictureZoom(), 255, 0);
			    break;
		    case '0':
		        var name = this.izPictureName().replace(/[0-9]$/, '0');//変更。原点0を1に
		        $gameScreen.showPicture(this.izPictureNumber(), name, 1, this.izPicturePosX(), this.izPicturePosY(), this.izPictureZoom(), this.izPictureZoom(), 255, 0);
			    break;
		    case '1':
		        var name = this.izPictureName().replace(/[0-9]$/, '1');
		        $gameScreen.showPicture(this.izPictureNumber(), name, 1, this.izPicturePosX(), this.izPicturePosY(), this.izPictureZoom(), this.izPictureZoom(), 255, 0);
			    break;
		    case '2':
		        var name = this.izPictureName().replace(/[0-9]$/, '2');
		        $gameScreen.showPicture(this.izPictureNumber(), name, 1, this.izPicturePosX(), this.izPicturePosY(), this.izPictureZoom(), this.izPictureZoom(), 255, 0);
			    break;
		    case '3':
		        var name = this.izPictureName().replace(/[0-9]$/, '3');
		        $gameScreen.showPicture(this.izPictureNumber(), name, 1, this.izPicturePosX(), this.izPicturePosY(), this.izPictureZoom(), this.izPictureZoom(), 255, 0);
			    break;
		    case '4':
		        var name = this.izPictureName().replace(/[0-9]$/, '4');
		        $gameScreen.showPicture(this.izPictureNumber(), name, 1, this.izPicturePosX(), this.izPicturePosY(), this.izPictureZoom(), this.izPictureZoom(), 255, 0);
			    break;
		    case '5':
		        var name = this.izPictureName().replace(/[0-9]$/, '5');
		        $gameScreen.showPicture(this.izPictureNumber(), name, 1, this.izPicturePosX(), this.izPicturePosY(), this.izPictureZoom(), this.izPictureZoom(), 255, 0);
			    break;
		    case '6':
		        var name = this.izPictureName().replace(/[0-9]$/, '6');
		        $gameScreen.showPicture(this.izPictureNumber(), name, 1, this.izPicturePosX(), this.izPicturePosY(), this.izPictureZoom(), this.izPictureZoom(), 255, 0);
			    break;
		    case '7':
		        var name = this.izPictureName().replace(/[0-9]$/, '7');
		        $gameScreen.showPicture(this.izPictureNumber(), name, 1, this.izPicturePosX(), this.izPicturePosY(), this.izPictureZoom(), this.izPictureZoom(), 255, 0);
			    break;
                
		    case '$':
			    this._goldWindow.open();
			    break;
		    case '.':
			    this.startWait(15);
			    break;
		    case '|':
			    this.startWait(60);
			    break;
		    case '!':
			    this.startPause();
			    break;
		    case '>':
			    this._lineShowFast = true;
			    break;
		    case '<':
			    this._lineShowFast = false;
			    break;
		    case '^':
			    this._pauseSkip = true;
			    break;
		    default:
			    Window_Base.prototype.processEscapeCharacter.call(this, code, textState);
			    break;
		}
	}

	Window_Message.prototype.obtainEscapeCode = function(textState) {
		textState.index++;
		var regExp = /^[\$\.\|\^!><\{\}\\]|^[A-Z]+|[012345678]/i;
		var arr = regExp.exec(textState.text.slice(textState.index));
		if (arr) {
			textState.index += arr[0].length;
			return arr[0].toUpperCase();
		} else {
			return '';
		}
	};

      
})();
