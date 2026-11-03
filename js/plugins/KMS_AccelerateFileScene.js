//=============================================================================
// KMS_AccelerateFileScene.js
//   Last update: 2015/12/05
//=============================================================================

/*:
 * @plugindesc
 * [v0.1.0] Accelerate drawing save/load scene.
 * 
 * @author TOMY (Kamesoft)
 *
 * @help This plugin does not provide plugin commands.
 */

/*:ja
 * @plugindesc
 * [v0.1.0] セーブ/ロード画面の描画を高速化します。
 * 
 * @author TOMY (Kamesoft)
 *
 * @help このプラグインには、プラグインコマンドはありません。
 */

var KMS = KMS || {};

(function() {

KMS.imported = KMS.imported || {};
KMS.imported['AccelerateFileScene'] = true;

//var pluginParams = PluginManager.parameters('KMS_AccelerateFileScene');
//var Params = {};

//-----------------------------------------------------------------------------
// DataManager

var _KMS_AccelerateFileScene_DataManager_loadGlobalInfo = DataManager.loadGlobalInfo;
DataManager.loadGlobalInfo = function()
{
    if (!this._globalInfoCache)
    {
        this._globalInfoCache = _KMS_AccelerateFileScene_DataManager_loadGlobalInfo.call(this);
    }

    return this._globalInfoCache;
};

var _KMS_AccelerateFileScene_DataManager_saveGlobalInfo = DataManager.saveGlobalInfo;
DataManager.saveGlobalInfo = function(info)
{
    this._globalInfoCache = null;
    _KMS_AccelerateFileScene_DataManager_saveGlobalInfo.call(this, info);
};

//-----------------------------------------------------------------------------
// StorageManager
//  BUGFIX: loadGlobalInfo の結果はこのプラグインでキャッシュされるが、キャッシュを
//  破棄していたのは saveGlobalInfo だけだった。セーブデータを削除してもキャッシュが
//  残るため、削除したスロットが「まだ存在する」と報告され続け、
//    - セーブ画面のスロット名が白いまま更新されない（グレーに戻らない）
//    - 情報ウィンドウが空のまま setTimeout を回し続ける
//    - そのスロットをロードすると JsonEx.parse("") が
//      "Unexpected end of JSON input" を投げる
//  という症状になる。ゲームを再起動すると直るのは、キャッシュが消えるため。
//  削除経路は StorageManager.remove に一本化されているので、そこで破棄する
//  （YEP_SaveCore の削除コマンド / Torigoya のプラグインコマンド / セーブ失敗時の
//  ロールバックのいずれから来ても同じように直る）。

var _KMS_AccelerateFileScene_StorageManager_remove = StorageManager.remove;
StorageManager.remove = function(savefileId)
{
    DataManager._globalInfoCache = null;
    _KMS_AccelerateFileScene_StorageManager_remove.call(this, savefileId);
};

})();
