Update of NWJS to newer version will noticeable improve the game performance and work with you hardware.

How to:

1. Download NWJS here: https://nwjs.io/downloads/
	Select Windows 64-bit SDK or Windows 32-bit SDK (if you have Win x32)
	
2. Backup you game files as always to be able to restore if something will be broken
3. Extract files from downloaded "nwjs-sdk-v0.82.0-win-##.zip" to your game folder
4. To fix run error open "package.json" file in notepad and add {} between quotes into line `"name": "",` to look like this `"name": "{}",`
5. Run game using "nw.exe" or remove "game.exe" and rename "nw.exe" to "game.exe" and run as always


After update you can now use F12 to open DevTools where in console you can see all internal game messages, warnings and errors. Please report about any error messages to the game dev.

extra:After run game with newest NWJS there is possible to get profile error if start game with older nwjs. The error can be removed by run "!fix-nwjs-profile-error-clean-nwjs-cache!.bat" file.


----------
NWJSの更新を新しいバージョンにすると、ゲームのパフォーマンスが顕著に向上し、ハードウェアとの動作が改善されます。

手順:

1:NWJSをダウンロード: https://nwjs.io/downloads/
"Windows 64ビット SDK" または "Windows 32ビット SDK"（Win x32を使用している場合）を選択してください。

2.いつも通りにゲームファイルをバックアップして、何かが壊れた場合に復元できるようにしてください。

3.ダウンロードした "nwjs-sdk-v0.82.0-win-##.zip" からファイルをゲームフォルダに抽出してください。

4. 問題を修正するには、メモ帳で "package.json" ファイルを開き、ダブルクォートの間に {} を追加して、次のように "name": "{}" に見えるようにしてください。

5.ゲームを "nw.exe" を使用して実行するか、"game.exe" を削除して "nw.exe" の名前を "game.exe" に変更して通常通りに実行してください。


アップデート後、"F12" キーを使用してDevToolsを開くことができ、コンソールですべての内部ゲームメッセージ、警告、エラーを表示できます。エラーメッセージがある場合は、ゲーム開発者に報告してください。

extra:最新のNWJSでゲームを実行した後、古いnwjsでゲームを起動するとプロファイルエラーが発生する可能性があります。このエラーは、"!fix-nwjs-profile-error-clean-nwjs-cache!.bat"ファイルを実行することで解消されます。