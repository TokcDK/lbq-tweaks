//===============================================
// AddPluginSystemByVillaA.js 
//===============================================

/*:ja
 * @plugindesc 各プラグインに機能の追加や修正を行う総合的なプラグインです。。
 * @author 村人A
 *
 * @help
 * _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
 * 
 * バージョン情報
 * 2021/08/30 1.33リリース
 *            立ち絵の表示を修正
 * 2021/08/07 1.31リリース
 *            衣装が表示されない不具合の修正
 * 2021/08/04 1.3リリース
 *            同じ立ち絵・バストアップを複数回表示した際に位置が反映されない不具合の修正
 * 2020/03/28 1.2リリース
 *            IZ_MessageWindowの立ち絵をプラグインコマンドで一度決められたら以降のものも対応するようにしました。
 * 2020/03/26 1.1リリース
 *            戦闘リザルト時に空のメッセージボックスが表示されてしまう不具合を修正しました。
 * 2020/03/24 1.0リリース
 * 
 * _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
 * 
 * ===================================
 * ヘルプ
 * ===================================
 * このプラグインは様々なプラグインの機能を上書きしている個所があるため、最後の方
 * に配置するようにしてください。
 * 少なくとも以下のプラグインよりは下に配置してください。
 * 
 * MOG_SceneStatus.js
 * MOG_SceneMenu.js
 * MOG_MenuBackground
 * TKM_TachieManager
 * IZ_MessageWindow
 * 
 * このプラグインは以下のご依頼分の機能を実装しています。
 * 
 * ・戦闘リザルト時、隠しアイテムＡかＢ或いは両方の非表示。
 * ・戦闘リザルト時、同一ドロップアイテムの表示を纏める。
 * ・メニュー、ステータス画面の改造
 * ・メニュー画面の改造　立ち絵の表示優先度
 * ・メニュー表示時のバックグランド表示時の不具合修正。
 * ・プラグイン「IZ_MessageWindow」の改造。
 * 
 * 
 * ●メッセージ表示時に立ち絵を表示する際に以下のプラグインコマンドを記述すること
 * で立ち絵のフェードイン演出を行うことができます。
 * 
 * 立ち絵の表示
 * 
 * setIZSTPicShow x座標 y座標 幅拡大率 高さ拡大率 透過度
 * 
 * 立ち絵の移動
 * 
 * setIZSTPicMove x座標 y座標 幅拡大率 高さ拡大率 透過度 時間
 * 
 * 例えばx座標100、y座標50からx座標150、y座標50へ60フレームかけてフェードインさせ
 * たい場合はメッセージ表示前にプラグインコマンドにて
 * 
 * setIZSTPicShow 100 50 100 100 0
 * setIZSTPicMove 150 50 100 100 255 60
 * 
 * と記述します。
 * 
 * 
 * ●「TKM_TachieManager」で作成したキャラ毎の合成画像のメニューでの表示について
 * 
 * まずはアクターごとにデータベースのメモ欄にて立ち絵に使用するピクチャのID
 *
 * <tachiePicId:使用するID>
 *
 * と設定してください。
 *例えばそのアクターに使用したい立ち絵のピクチャIDが20だった場合は
 *
 * <tachiePicId:20>
 *
 * となります。
 * また、メニュー表示前には各アクター毎に「TKM_TachieManager」の立ち絵の設定を完了しているようにしてください。
 * 
 * 
 * 
 *
 * @param 以下戦闘リザルト時、隠しアイテムＡかＢ或いは両方の非表示について
 * @desc ――――――――――――――――――――――――――――――
 * @default 
 *
 * @param 戦闘リザルト画面で非表示にする隠しアイテムの種類
 * @desc 非表示にする隠しアイテムの種類を指定します。Aが3、Bが4となります。両方隠す場合は3,4と記述して下さい。
 * @default 3
 *
 * @param 以下同一ドロップアイテムの表示を纏める機能について
 * @desc ――――――――――――――――――――――――――――――
 * @default 
 *
 * @param 重複するアイテムの表示形式
 * @desc 取得したアイテムが重複している時の「アイテム名（×）個数」の（×）の部分の表示形式を記述します。
 * @default ×
 *
 * @param 以下メニュー画面の改造について
 * @desc ――――――――――――――――――――――――――――――
 * @default 
 *
 * @param メニューの立ち絵表示優先度変更スイッチID
 * @desc メニューの立ち絵表示優先度（ｚ座標）を昇順に表示するか降順に表示するを変更するスイッチIDを指定します。
 * @default 321
 * @type Number
 *
 * @param メニューの簡易ステータス表示変更スイッチID
 * @desc メニューのそれぞれのアクターのHP/MP等の簡易ステータスの表示を変更するスイッチIDを指定します。
 * @default 322
 * @type Number
 *
 * @param 以下「IZ_MessageWindow」の改造について
 * @desc ――――――――――――――――――――――――――――――
 * @default 
 *
 * @param 衣装に使用するアクター名と使用する変数ID
 * @desc 使用するアクターの名前と衣装に使用する変数のIDを例のように記述して下さい。
 * @type String[]
 * @default ["19Actor:861","21Actor:862"]
 *
 * @param 衣装に使用するピクチャのID
 * @desc アクターの衣装画像表示に使用するピクチャのIDを記述して下さい。BustUpstUpPictureIdやSTPictureIdよりも大きいIDにしてください。
 * @type String[]
 * @default 101
*/
{
	'use strict';
	
	String.prototype.toNumArray = function(){
		return this.split(",").map(str => Number(str))
	}
	
    let parameters = PluginManager.parameters('AddPluginSystemByVillaA');
	const unvisibleItemsItype               = parameters['戦闘リザルト画面で非表示にする隠しアイテムの種類'].toNumArray();
	const dupItemCountStr                   = parameters['重複するアイテムの表示形式'];
	const standPictureZChangeSwitchId       = Number(parameters['メニューの立ち絵表示優先度変更スイッチID']);
	const simpleStatusVisibleChangeSwitchId = Number(parameters['メニューの簡易ステータス表示変更スイッチID']);
	const clothPictureZId                   = Number(parameters['衣装に使用するピクチャのID']);
	const tempArr = parameters['衣装に使用するアクター名と使用する変数ID'].match(/\[(.+)\]/i)[1].split(",").map(str => str.match(/\"(.+)\"/i)[1])
	const actorCustomMessageSPClothValId    = tempArr.map(str => str.split(":"));
	
	// ===================================
	// 戦闘リザルト時、隠しアイテムＡかＢ或いは両方の非表示。　＆　同一ドロップアイテムの表示を纏める。
	// ===================================
	
	BattleResult.prototype.createTreasures = function() {
		this._treasures = [];
		var x = Moghunter.bresult_treasure_x;
		var y = Moghunter.bresult_treasure_y;
		var s = Graphics.boxWidth - 64;
		var w = (s / 3);
		var h = Window_Base._iconHeight + 4;
		
		const items = $gameTemp._bResult[3].filter(item => unvisibleItemsItype.indexOf(item.itypeId) < 0)
		const aItems = items.filter((x, i, self) => self.indexOf(x) === i)
		let itemNumArr = [];
		aItems.forEach(aitem => itemNumArr.push(items.filter(item => item == aitem).length));
		
		for (var i = 0; i < aItems.length; i++) {
			  if (i > 23) {
				  break
			  }
			  this._treasures[i] = new Sprite();
			  this._treasures[i].opacity = 0;
			  this.addChild(this._treasures[i]);
			  var l = Math.floor(i / 3);
			  this._treasures[i].x = x + (w * i) - Math.floor(l * s);
			  this._treasures[i].y = y + (l * h);
			  const item = aItems[i];
			  const data = {}
			  data.name = itemNumArr[i] == 1 ? item.name : item.name + dupItemCountStr + itemNumArr[i]
			  data.iconIndex = item.iconIndex
			  this.addIcon(this._treasures[i],data);
		};      
	};

	
	// ===================================
	// 立ち絵の表示優先度
	// ===================================
	
	Scene_Menu.prototype.createCharacters = function() {
		 this._characters = [];
		 if($gameSwitches.value(standPictureZChangeSwitchId)){
			 for (let i = this.maxMembers()-1; i >= 0; i--) {	   
				   this._characters[i] = new MBustMenu(i,$gameParty.members()[i],this.maxMembers());
				   this._field.addChild(this._characters[i]);
			 };
		 } else {
			 for (let i = 0; i < this.maxMembers(); i++) {	   
				   this._characters[i] = new MBustMenu(i,$gameParty.members()[i],this.maxMembers());
				   this._field.addChild(this._characters[i]);
			 };
		 }
	};

	
	// ===================================
	// 簡易ステータスの表示。変更、本体の方に移動。スイッチも直接指定している
	// ===================================
	
	//Scene_Menu.prototype.createCharStatus = function() {
	//	 if($gameSwitches.value(simpleStatusVisibleChangeSwitchId)){return}
	//	 this._charStatus = [];
	//	 for (let i = 0; i < this.maxMembers(); i++) {	   
	//		   this._charStatus[i] = new MCharStatus(i,$gameParty.members()[i],this.maxMembers());
	//		   this._field.addChild(this._charStatus[i]);
	//	 };
	//};
	
	
	// ===================================
	// メニュー表示時のバックグランド画像のサイズ
	// ===================================
	
	Scene_MenuBase.prototype.refreshBackgroundBitmap = function() {
		this._backgroundSpriteNew.bitmap = this._backImg;
		this._backgroundSpriteNew.move(0, 0, this._backImg.width, this._backImg.height);	
	};


	// ===================================
	// プラグイン「IZ_MessageWindow」の改造
	// ===================================
	
    const _alias_Game_Interpreter_pluginCommand2_IZ = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
		if(command == 'setIZSTPicShow'){
			$gameMessage._IZSTPicShowParam = args.map(str => Number(str));
		}
		if(command == 'setIZSTPicMove'){
			$gameMessage._IZSTPicMoveParam = args.map(str => Number(str));
		}
        _alias_Game_Interpreter_pluginCommand2_IZ.call(this, command, args);
	}
	
    const _alias_Game_Message_initialize = Game_Message.prototype.initialize;
	Game_Message.prototype.initialize = function() {
		_alias_Game_Message_initialize.call(this)
		this._IZSTPicShowParam = [];
		this._IZSTPicMoveParam = [];
	}

    const _alias_Game_Interpreter_terminate = Game_Interpreter.prototype.terminate;
	Game_Interpreter.prototype.terminate = function() {
		_alias_Game_Interpreter_terminate.call(this);
	}

    const _alias_Game_Map_initialize = Game_Map.prototype.initialize;
	Game_Map.prototype.initialize = function() {
		_alias_Game_Map_initialize.call(this)
		this._interpreter.isMapInterpreter = true
	}

    const _alias_Window_Message_terminateMessage = Window_Message.prototype.terminateMessage;
    Window_Message.prototype.terminateMessage = function () {
        $gameScreen.erasePicture(this.izPictureNumber());
        for (var i = 0; i <= 4; i++) {
          if($gameScreen.picture(clothPictureZId+i)){
            if($gameScreen.picture(clothPictureZId+i)._breathActive3){UTSU.PictureBreath3.off([clothPictureZId+i])};
            if($gameScreen.picture(clothPictureZId+i)._breathActive4){UTSU.PictureBreath4.off([clothPictureZId+i])};
            $gameScreen.erasePicture(clothPictureZId+i);
          };
        };
        if($gameScreen.picture(clothPictureZId+7)){
          if($gameScreen.picture(clothPictureZId+7)._breathActive3){UTSU.PictureBreath3.off([clothPictureZId+7])};
          if($gameScreen.picture(clothPictureZId+7)._breathActive4){UTSU.PictureBreath4.off([clothPictureZId+7])};
          $gameScreen.erasePicture(clothPictureZId+7);
        };
        if($gameParty.membersState(781) || $gameParty.membersState(783) || $gameParty.membersState(784)){
          if($gameScreen.picture(clothPictureZId+6)){
            if($gameScreen.picture(clothPictureZId+6)._breathActive3){UTSU.PictureBreath3.off([clothPictureZId+6])};
            if($gameScreen.picture(clothPictureZId+6)._breathActive4){UTSU.PictureBreath4.off([clothPictureZId+6])};
            $gameScreen.erasePicture(clothPictureZId+6);
          };
        };
        if($gameParty.membersState(782)){
          if($gameScreen.picture(99)){
            if($gameScreen.picture(99)._breathActive3){UTSU.PictureBreath3.off([99])};
            if($gameScreen.picture(99)._breathActive4){UTSU.PictureBreath4.off([99])};
            $gameScreen.erasePicture(99);
          };
        };
        _alias_Window_Message_terminateMessage.call(this);
    };

    const _alias_Window_Message_processEscapeCharacter = Window_Message.prototype.processEscapeCharacter;
	Window_Message.prototype.processEscapeCharacter = function(code, textState){
		const c = Number(code);
		if(!isNaN(c) && 0 <= c && c <= 8){
			const name = c == 8 ? this.izPictureName() : this.izPictureName().replace(/[0-9]$/, code);
			if(name != ""){
				this.showFaceStandPicturePros(name);
			}
		} else {
			_alias_Window_Message_processEscapeCharacter.call(this, code, textState)
		}
	}
	
	Window_Message.prototype.showFaceStandPicturePros = function(name){
		const actorName = name.split("_")[0];//name.split("_")[0].slice(0, -1);//インデックス表記から変更したため
		const nameArr = actorCustomMessageSPClothValId.map(arr => arr[0]);
		const nameIndex = nameArr.indexOf(actorName)
		if(nameIndex >= 0){
			const valId = Number(actorCustomMessageSPClothValId[nameIndex][1])
                                 if(valId >= 1){
			           if(valueBustUpCloth[valId] == 1){
                                     $gameMessage._IZSTPicShowParam[1] = 384;
                                     $gameMessage._IZSTPicMoveParam[1] = 384;
                                   } else {
                                     $gameMessage._IZSTPicShowParam[1] = 384+100;
                                     $gameMessage._IZSTPicMoveParam[1] = 384+100;
                                   };
                                   if(valueLiningCloth[valId] >= 1){
				     const clothName = actorName + "Lining" + valueLiningCloth[valId];	//const clothName = actorName + "Cloth" + $gameVariables.value(valId) + "_1";
				     this.setIZPicShowMovePros(clothPictureZId, clothName);	
                                   };
                                   if(valueBackHairCloth[valId] >= 1){
				     const clothName1 = actorName + "BackHair" + valueBackHairCloth[valId];	//const clothName = actorName + "Cloth" + $gameVariables.value(valId) + "_1";
				     this.setIZPicShowMovePros(clothPictureZId+1, clothName1);	
                                   };
			           if(valueBustUpCloth[valId] >= 0){	//if($gameVariables.value(valId) != 0){
				     const clothName2 = actorName + "Cloth" + valueBustUpCloth[valId];	//const clothName = actorName + "Cloth" + $gameVariables.value(valId);
				     this.setIZPicShowMovePros(clothPictureZId+2, clothName2);
                                   };
                                  if(valueBustUpCloth2[valId] >= 0){
				    const clothName3 = actorName + "BustUp" + valueBustUpCloth2[valId];	//const clothName = actorName + "Cloth" + $gameVariables.value(valId) + "_1";
				    this.setIZPicShowMovePros(clothPictureZId+3, clothName3);
                                   };	
                                   if(valueCoatCloth[valId] >= 1){
				     const clothName4 = actorName + "Coat" + valueCoatCloth[valId];	//const clothName = actorName + "Cloth" + $gameVariables.value(valId) + "_1";
				     this.setIZPicShowMovePros(clothPictureZId+4, clothName4);	
                                   };	
                                   if(valueFrontHairCloth[valId] >= 0){
				     const clothName7 = actorName + "FrontHair" + valueFrontHairCloth[valId];	//const clothName = actorName + "Cloth" + $gameVariables.value(valId) + "_1";
				     this.setIZPicShowMovePros(clothPictureZId+7, clothName7);	
                                   };
                                   if($gameActors.actor(valId).isStateAffected(781)){
				     const clothName6 = actorName + "CloudyEye1";	//const clothName = actorName + "Cloth" + $gameVariables.value(valId) + "_1";
				     this.setIZPicShowMovePros(clothPictureZId+6, clothName6);	
                                   };
                                   if($gameActors.actor(valId).isStateAffected(783)){
				     const clothName6 = actorName + "CloudyEye2";	//const clothName = actorName + "Cloth" + $gameVariables.value(valId) + "_1";
				     this.setIZPicShowMovePros(clothPictureZId+6, clothName6);	
                                   };
                                   if($gameActors.actor(valId).isStateAffected(784)){
				     const clothName6 = actorName + "CloudyEye3";	//const clothName = actorName + "Cloth" + $gameVariables.value(valId) + "_1";
				     this.setIZPicShowMovePros(clothPictureZId+6, clothName6);
                                     pic_move1(clothPictureZId+7,0,0,100,100,0,1);
                                     //$gameScreen.picture(clothPictureZId+7)._opacity = 0;	
                                   };
                                   if($gameActors.actor(valId).isStateAffected(782)){
				     const clothName8 = actorName + "HypnosisEye_0";	//const clothName = actorName + "Cloth" + $gameVariables.value(valId) + "_1";
				     valueHypnosisCount = $gameActors.actor(valId).getStateCounter(782);//60,40,20
                                     this.setIZPicShowMovePros(99, clothName8);	
                                   };
                                   if($gameActors.actor(valId).isStateAffected(785)){
				     const clothName6 = actorName + "CloudyEye4";	//const clothName = actorName + "Cloth" + $gameVariables.value(valId) + "_1";
				     this.setIZPicShowMovePros(clothPictureZId+6, clothName6);	
                                   };
                                 };
		}
		this.setIZPicShowMovePros(this.izPictureNumber(), name);
		const mp = $gameMessage._IZSTPicMoveParam.concat();
		mp.pop();
	}
    Window_Message.prototype.setIZPicShowMovePros = function (id, picName) {
        if(!$gameMessage.skipFlg()){//追加処理
		const sp = $gameMessage._IZSTPicShowParam;
		const dp = [this.izPicturePosX(), this.izPicturePosY(), this.izPictureZoom(), this.izPictureZoom(), 255];
		let args = sp.length != 0 ? [id, "/img/talkface/"+picName, 0, ...sp, 0] : [id, "/img/talkface/"+picName, 0, ...dp, 0];
		if($gameMessage._IZSTPicShowParam.length != 0){for(let i = 0; i < 5; i++){args[i+3] = $gameMessage._IZSTPicShowParam[i]}};
		args[2] = 1;//変更。原点を1に
                if(id == clothPictureZId+7){
                  args[7] += 150;
                };
                if(id == clothPictureZId+6){
                  args[7] += 250;
                };
                if(id == 99){
                  args[8] = 3;
                  $gameScreen.setPicturesAnimation(2, 10, "連番", valueHypnosisCount);
                };
                $gameScreen.showPicture.apply($gameScreen, args);
		if($gameMessage._IZSTPicMoveParam.length != 0){
			args.splice(1,1)
			for(let i = 0; i < 5; i++){args[i+2] = $gameMessage._IZSTPicMoveParam[i]};
			args[8] = $gameMessage._IZSTPicMoveParam[5];
                        args[1] = 1;//変更。原点を1に
                        if(id == 99){args[7] = 3};
			$gameScreen.movePicture.apply($gameScreen, args);
                        if(id == clothPictureZId+3){
                          hcg_piston(id,10,1,4);
                        } else {
                          tachie_bless(id,3);	
                        };
                        if(id == 99){
                          $gameScreen.picture(id).startAnimationFrame(3, true, [1,1,1,2]);
                        };
		};
          };
	}

	// ===================================
	// メニュー、ステータス画面にカスタムした立ち絵表示の改造
	// ===================================
	    const _alias_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
		if(command == 'tachie_ChangePart' || command == 'tachie_CP'){
            const PicData = $TKMvar.tachie.PicData;
			for(var i = 0; i < PicData.length; i++) {
				if(!PicData[i]["bitmap"]){PicData[i]["bitmap"] = []}
			}
		}
        _alias_Game_Interpreter_pluginCommand.call(this, command, args);
	}
	
	MBustMenu.prototype.createCharaters = function() {
		 if($dataActors[this._actor._actorId].meta.tachiePicId){
			this._char = new Sprite_TempTachiePicture();
			this._char.setPictureId($dataActors[this._actor._actorId].meta.tachiePicId)
		 } else {
			this._char = new Sprite(ImageManager.loadMenusFaces3("ActorA" + this._actor._actorId +"_"+ $gameVariables.value(this._actor._actorId + 100)));
		 }
		 this._char.anchor.x = 0.5; //0.5から変更
		 this._char.anchor.y = 1.0;
             this._char.x = this.posX() + Moghunter.scMenu_CharX + valueMenuStandval1;
		 this._char.y = Graphics.boxHeight + Number($dataActors[this._actor._actorId].meta['scmenutchary'].split(',')[valueMenuStandval2]);//変更Moghunter.scMenu_CharY;
		 this._orgX  = this._char.x;
		   this._char.scale.x = Number($dataActors[this._actor._actorId].meta['scmenutscale'].split(',')[valueMenuStandval2]); //ステプラグインでActorBをActorAへ
		   this._char.scale.y = Number($dataActors[this._actor._actorId].meta['scmenutscale'].split(',')[valueMenuStandval2]); //変更
		 this._char.x -= 40;
		 this._wait = 5 + 10 * this._index;//変更5+10を5+3
		 this._char.opacity = 0;
		 this.addChild(this._char);
	};	

	const _alias_MBustMenu_update = MBustMenu.prototype.update
	MBustMenu.prototype.update = function() {
		_alias_MBustMenu_update.call(this);
		this._char.update();
	}

	Scene_Status.prototype.createBust = function() {
		this._bust = new Sprite_TempTachiePicture();
		this._bust.setPictureId(id)
		this._bust.anchor.x = 0.5;
		this._bust.x = Moghunter.scStatus_BustX;
		this._bust.y = Number($dataActors[this._actor._actorId].meta.scStatusBustY) - $gameVariables.value(119)//Moghunter.scStatus_BustY;
		this._bust.org = [this._bust.x,this._bust.y]
		   this._bust.scale.x = Number($dataActors[this._actor._actorId].meta.scStatusBustScale)//追加
		   this._bust.scale.y = Number($dataActors[this._actor._actorId].meta.scStatusBustScale)//追加
		this._field.addChild(this._bust);
	};

//==============================
// * refresh Bust     
//==============================
	Scene_Status.prototype.refreshBust = function() {
		const id = this.actor().actor().meta.tachiePicId;
		this._bust.setPictureId(id)
this._bust.y = Number($dataActors[this._actor._actorId].meta.scStatusBustY) - $gameVariables.value(119)//Moghunter.scStatus_BustY;
this._bust.org = [this._bust.x,this._bust.y]//変更。追加分↑も。
                //this._bust.y = Number($dataActors[this._actor._actorId].meta.scStatusBustY) - $gameVariables.value(119)//Moghunter.scStatus_BustY;
		   this._bust.scale.x = Number($dataActors[this._actor._actorId].meta.scStatusBustScale)//追加
		   this._bust.scale.y = Number($dataActors[this._actor._actorId].meta.scStatusBustScale)//追加
                this._bust.y = Graphics.boxHeight-800;//変更。追加分
	 this._bust.opacity = 0;//変更。追加分
	}

	//-----------------------------------------------------------------------------
	// Sprite_TempTachiePicture
	//

	function Sprite_TempTachiePicture() {
		this.initialize.apply(this, arguments);
	}

	Sprite_TempTachiePicture.prototype = Object.create(Sprite.prototype);
	Sprite_TempTachiePicture.prototype.constructor = Sprite_TempTachiePicture;

	Sprite_TempTachiePicture.prototype.initialize = function() {
		Sprite.prototype.initialize.call(this);
		this.loadTachieBitmapPictureId = -1;
	};
	
    Sprite_TempTachiePicture.prototype.setPictureId = function(id) {
		this.loadTachieBitmapPictureId = id;
	}

    Sprite_TempTachiePicture.prototype.update = function() {
		Sprite.prototype.update.call(this);
		this.updateLoadBitmapFromPictureTachie();
	}
	
    Sprite_TempTachiePicture.prototype.updateLoadBitmapFromPictureTachie = function() {
		if(this.loadTachieBitmapPictureId < 0){return}
		if(this.loadBitmapFromPictureTachie(this.loadTachieBitmapPictureId)){
			this.loadTachieBitmapPictureId = -1;
		}
	}
	
    Sprite_TempTachiePicture.prototype.loadBitmapFromPictureTachie = function(picId) {
		this.bitmap = new Bitmap(1, 1);
		this.bitmap.isTachie = true;
		this.bitmap.smooth = true;
		
		const PicData = $TKMvar.tachie.PicData;
		const _data = PicData.filter(obj => obj["picNum"] == picId)[0];
		if(!_data["bitmap"]) {
			try{
				$TKMvar.tachie.preloadBitmap(picId);
			} catch(e){
				throw new Error("ピクチャ―id:" + picId + "の立ち絵画像がtachie_SetCharにて指定されていません。")
			}
			return false;
		}
		
		const MaxLayer = $TKMvar.tachie.MaxLayer;
		let loaded = true;
		for(let j = 0; j < MaxLayer; j++) {
			const bitemp = _data["bitmap"][j];
			if(!bitemp) {continue}
			if(!bitemp.isReady()) {loaded = false; break};
		}
		if(!loaded) {return false};
		
		this.setFrame(0, 0, 0, 0);
		for(let j = 0; j < MaxLayer; j++) {
			const bitemp = _data["bitmap"][j];
			if(bitemp) {this.bitmap.resizeIfSmallerThan(bitemp)};
		}
		
		const doReverse = _data["reverse"]; 
		if(doReverse) {
			this.bitmap.context.save();
			this.bitmap.context.translate(this.bitmap.width, 0);
			this.bitmap.context.scale(-1, 1);
		}
		
		for(let j = 0; j < MaxLayer; j++) {
			const bitemp = _data["bitmap"][j];
			if(bitemp) {this.bitmap.context.drawImage(bitemp.canvas, 0, 0)};
		}
		
		this.bitmap._setDirty();
		if(doReverse) this.bitmap.context.restore();
		this._onBitmapLoad();
		return true;
    };
	
	Sprite.prototype._onBitmapLoad = function() {
		if (this._frame.width === 0 && this._frame.height === 0) {
			this._frame.width = this._bitmap.width;
			this._frame.height = this._bitmap.height;
		}
		this._refresh();
	};
	
}