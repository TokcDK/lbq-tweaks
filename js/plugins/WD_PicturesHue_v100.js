//=============================================================================
// WD_PicturesHue.js v1.00
//=============================================================================

/*:ja
 * @plugindesc ピクチャの色相を変更して表示します。(v1.00)
 * @author Izumi (http://izumiwhite.web.fc2.com/)
 *
 * 
 * @help
 * 
 * スクリプトで表示する場合:
 *   $gameScreen.showPicture_hue(pictureId, name, hue, origin, x, y, scaleX, scaleY, opacity, blendMode);
 *    pictureId : ピクチャ番号
 *    name      : 画像の名前(''で囲む)
 *    hue       : 色相 0~360
 *    origin    : 原点 0 or 1 (左上 or 中央)
 *    x         : X
 *    y         : Y
 *    scaleX    : 拡大率(幅)
 *    scaleY    : 拡大率(高さ)
 *    opacity   : 不透明度 0 ~ 255
 *    blendmode : 合成方法 0 or 1 or 2 or 3 (通常 or 加算 or 乗算 or スクリーン)
 *　または、下記で一部パラメータを省略可。
 *   $gameScreen.showPicture_hue2(pictureId, name, hue, x, y); 
 * 
 * プラグインコマンドで表示する場合:
 *   PictureHue show pictureId name hue origin x y scaleX scaleY opacity blendMode
 *   PictureHue show2 pictureId name hue x y
 * 　　※引数は上記のスクリプトで表示する場合と同じ。但し、nameは''で囲まないこと。
 * 　　　たとえば、
 *       PictureHue show 1 hero 50 0 0 0 100 100 255 0
 * 
 * 表示したピクチャを消去したい場合は、「ピクチャの消去」のコマンドで消してください。
 * 
 */

(function() {

    var _Game_Interpreter_pluginCommand =
            Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'PictureHue') {
            switch (args[0]) {
            case 'show':
                $gameScreen.showPicture_hue(Number(args[1]), args[2], Number(args[3]), Number(args[4]), Number(args[5]), Number(args[6]), Number(args[7]), Number(args[8]), Number(args[9]), Number(args[10]));
                break;
            case 'show2':
                $gameScreen.showPicture_hue2(Number(args[1]), args[2], Number(args[3]), Number(args[4]), Number(args[5])); 
                break;
            }
        }
    };

Game_Screen.prototype.showPicture_hue = function(pictureId, name, hue, origin, x, y,
                                             scaleX, scaleY, opacity, blendMode) {
    var realPictureId = this.realPictureId(pictureId);
    var picture = new Game_Picture();
    picture.show_hue(name, hue, origin, x, y, scaleX, scaleY, opacity, blendMode); // 
    this._pictures[realPictureId] = picture;
};
Game_Screen.prototype.showPicture_hue2 = function(pictureId, name, hue, x, y) {
    var realPictureId = this.realPictureId(pictureId);
    var picture = new Game_Picture();
    picture.show_hue(name, hue, 0, x, y, 100, 100, 255, 0); // 
    this._pictures[realPictureId] = picture;
};

Game_Picture.prototype.show_hue = function(name, hue, origin, x, y, scaleX,
                                       scaleY, opacity, blendMode) {
    this._name = name;
    this._origin = origin;
    this._x = x;
    this._y = y;
    this._scaleX = scaleX;
    this._scaleY = scaleY;
    this._opacity = opacity;
    this._blendMode = blendMode;
    this._hue = hue; //追加
    this.initTarget();
    this.initTone();
    this.initRotation();
};

//再定義
Sprite_Picture.prototype.updateBitmap = function() {
    var picture = this.picture();
    if (picture) {
        var pictureName = picture.name();
        var hue = picture._hue;
        if (this._pictureName !== pictureName || this._hue !== hue) { //変更
            this._pictureName = pictureName;
            this._hue = hue; //追加
            if (picture._hue) {
                this.loadBitmap_hue(); //追加
            }else{
                this.loadBitmap();                
            }
        }
        this.visible = true;
    } else {
        this._pictureName = '';
        this.bitmap = null;
        this.visible = false;
    }
};

Sprite_Picture.prototype.loadBitmap_hue = function(hue) {
    this.bitmap = ImageManager.loadPicture(this._pictureName, this._hue); //変更
};


})();
