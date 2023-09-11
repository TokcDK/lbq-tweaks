//=============================================================================
// MOG_SceneEquip.js
//=============================================================================

/*:
 * @plugindesc (v1.0) Modifica a cena de equipamento.
 * @author Moghunter
 *
 * @param FontSize
 * @desc Definição do tamanho da fonte.
 * @default 20
 *
 * @param Help X-Axis
 * @desc Definição X-Axis da janela de ajuda.
 * @default 0
 *
 * @param Help Y-Axis
 * @desc Definição Y-Axis da janela de ajuda.
 * @default 516
 *
 * @param Help Layout X-Axis
 * @desc Definição X-Axis do layout da janela de ajuda.
 * @default 0
 *
 * @param Help Layout Y-Axis
 * @desc Definição Y-Axis do layout da janela de ajuda.
 * @default -67
 * 
 * @param Command X-Axis
 * @desc Definição X-Axis da janela de comando.
 * @default 312
 *
 * @param Command Y-Axis
 * @desc Definição Y-Axis da janela de comando.
 * @default 10
 *
 * @param Command Layout X-Axis
 * @desc Definição X-Axis do layout da janela de comando.
 * @default 15
 *
 * @param Command Layout Y-Axis
 * @desc Definição Y-Axis do layout da janela de comando.
 * @default 11
 * 
 * @param Slot X-Axis
 * @desc Definição X-Axis da janela de slot.
 * @default 312
 *
 * @param Slot Y-Axis
 * @desc Definição Y-Axis da janela de slot.
 * @default 70
 *
 * @param Slot Layout X-Axis
 * @desc Definição X-Axis do layout da janela de slot.
 * @default 22
 *
 * @param Slot Layout Y-Axis
 * @desc Definição Y-Axis do layout da janela de slot.
 * @default 8
 * 
 * @param List X-Axis
 * @desc Definição X-Axis da janela de lista de items.
 * @default 305
 *
 * @param List Y-Axis
 * @desc Definição Y-Axis da janela de lista de items.
 * @default 280
 *
 * @param List Layout X-Axis
 * @desc Definição X-Axis do layout da janela de lista de items.
 * @default 0
 *
 * @param List Layout Y-Axis
 * @desc Definição Y-Axis do layout da janela de lista de items.
 * @default 0
 * 
 * @param Status X-Axis
 * @desc Definição X-Axis da janela de status.
 * @default 10
 *
 * @param Status Y-Axis
 * @desc Definição Y-Axis da janela de  status.
 * @default 120
 *
 * @param Status Layout X-Axis
 * @desc Definição X-Axis do layout da janela de status.
 * @default 0
 *
 * @param Status Layout Y-Axis
 * @desc Definição Y-Axis do layout da janela de status.
 * @default 0
 * 		
 * @help  
 * =============================================================================
 * +++ MOG - Scene Equip (v1.0) +++
 * By Moghunter 
 * https://atelierrgss.wordpress.com/
 * =============================================================================
 * Modifica a cena de equipamento.
 *
 * =============================================================================
 * UTILIZAÇÃO
 * =============================================================================
 * As imagens do sistema deverão ser gravados na pasta.
 *
 * /img/menus/equip/
 *
 * =============================================================================
 */

//=============================================================================
// ** PLUGIN PARAMETERS
//=============================================================================
　　var Imported = Imported || {};
　　Imported.MOG_SceneEquip = true;
　　var Moghunter = Moghunter || {}; 

  　Moghunter.parameters = PluginManager.parameters('MOG_SceneEquip');  
    Moghunter.scEquip_FontSize = Number(Moghunter.parameters['FontSize'] || 20);
	Moghunter.scEquip_HelpWindowX = Number(Moghunter.parameters['Help X-Axis'] || 0);
	Moghunter.scEquip_HelpWindowY = Number(Moghunter.parameters['Help Y-Axis'] || 516);	
	Moghunter.scEquip_HelpLayoutX = Number(Moghunter.parameters['Help Layout X-Axis'] || 0);
	Moghunter.scEquip_HelpLayoutY = Number(Moghunter.parameters['Help Layout Y-Axis'] || -67);			
	Moghunter.scEquip_ComWindowX = Number(Moghunter.parameters['Command X-Axis'] || 312);
	Moghunter.scEquip_ComWindowY = Number(Moghunter.parameters['Command Y-Axis'] || 10);	
	Moghunter.scEquip_ComLayoutX = Number(Moghunter.parameters['Command Layout X-Axis'] || 15);
	Moghunter.scEquip_ComLayoutY = Number(Moghunter.parameters['Command Layout Y-Axis'] || 11);			
	Moghunter.scEquip_SlotWindowX = Number(Moghunter.parameters['Slot X-Axis'] || 312);
	Moghunter.scEquip_SlotWindowY = Number(Moghunter.parameters['Slot Y-Axis'] || 70);	
	Moghunter.scEquip_SlotLayoutX = Number(Moghunter.parameters['Slot Layout X-Axis'] || 22);
	Moghunter.scEquip_SlotLayoutY = Number(Moghunter.parameters['Slot Layout Y-Axis'] || 8);	
	Moghunter.scEquip_ItemWindowX = Number(Moghunter.parameters['List X-Axis'] || 305);
	Moghunter.scEquip_ItemWindowY = Number(Moghunter.parameters['List Y-Axis'] || 280);
	Moghunter.scEquip_ItemLayoutX = Number(Moghunter.parameters['List Layout X-Axis'] || 0);
	Moghunter.scEquip_ItemLayoutY = Number(Moghunter.parameters['List Layout Y-Axis'] || 0);	
	Moghunter.scEquip_StatusWindowX= Number(Moghunter.parameters['Status X-Axis'] || 10);
	Moghunter.scEquip_StatusWindowY = Number(Moghunter.parameters['Status Y-Axis'] || 120);
	Moghunter.scEquip_StatusLayoutX = Number(Moghunter.parameters['Status Layout X-Axis'] || 0);
	Moghunter.scEquip_StatusLayoutY = Number(Moghunter.parameters['Status Layout Y-Axis'] || 0);
		
//=============================================================================
// ** ImageManager
//=============================================================================

//==============================
// * Equip
//==============================
ImageManager.loadMenusequip = function(filename) {
    return this.loadBitmap('img/menus/equip/', filename, 0, true);
};

//=============================================================================
// ** Scene Equip
//=============================================================================

//==============================
// * create Background
//==============================
var _mog_scEquip_createBackground = Scene_Equip.prototype.createBackground;
Scene_Equip.prototype.createBackground = function() {
	_mog_scEquip_createBackground.call(this);
	this._field = new Sprite();
	this.addChild(this._field);	
};
