/*: @target MZ
 * @base TRP_ParticleMZ
 * @plugindesc 自作パーティクル設定の一覧
 * @help
 * Baojinbi <character> ＠2025/8/12
 * DRfire <character> ＠2025/8/12
 * DarkEvent <character> ＠2025/5/29
 * EnemyDust <character> ＠2025/5/2
 * EnemyDust2 <character> ＠2025/10/19
 * EnemyDust3 <character> ＠2025/10/19
 * EnemyDust4 <character> ＠2025/10/19
 * EnemyDust5 <character> ＠2025/10/19
 * EnemyDust6 <character> ＠2025/10/19
 * EnemyDust7 <character> ＠2025/10/19
 * EnemyDust8 <character> ＠2025/10/19
 * EnemyOuji <character> ＠2025/5/2
 * Magic_1 <character> ＠2025/3/30
 * Newdust <character> ＠2025/3/29
 * Warp_Blue_c <character> ＠2025/5/30
 * Warp_Blue_cp <character> ＠2025/5/30
 * Warp_Green_c <character> ＠2025/5/30
 * Warp_Green_cp <character> ＠2025/5/30
 * Warp_Red_c <character> ＠2025/5/30
 * Warp_Red_cp <character> ＠2025/5/30
 * Warp_Yellow_c <character> ＠2025/5/30
 * Warp_Yellow_cp <character> ＠2025/5/30
 * Yellow_Light <character> ＠2025/8/31
 * blizard_w <weather> ＠2025/3/30
 * circle_Blue <character> ＠2025/5/30
 * circle_Dark <character> ＠2025/6/11
 * circle_Green <character> ＠2025/5/30
 * circle_Red <character> ＠2025/5/30
 * circle_Yellow <character> ＠2025/5/30
 * fog_w2 <character> ＠2025/4/28
 * test <startdash> ＠2025/3/29
 *
 * @command set_character
 * @text set/表示 > character(24)
 * @desc パーティクル表示
 *
 * @arg id
 * @text 管理ID
 * @desc 他と被らない管理ID。「def」で設定名,「-EID」で設定名-EID
 * @default def
 *
 * @arg target
 * @text ターゲット
 * @desc thisでこのイベント。「event:イベントID」「player」「weather」など
 * @default weather
 *
 * @arg name
 * @text 《データ名》
 * @desc データ名。defとすると管理IDをデータ名として使用。（重み同じデータ名を複数表示するときは管理IDを分ける）
 * @default 《呼び出す設定を選択》
 * @type select
 * @option Baojinbi <character> ＠2025/8/12
 * @value Baojinbi
 * @option DRfire <character> ＠2025/8/12
 * @value DRfire
 * @option DarkEvent <character> ＠2025/5/29
 * @value DarkEvent
 * @option EnemyDust <character> ＠2025/5/2
 * @value EnemyDust
 * @option EnemyDust2 <character> ＠2025/10/19
 * @value EnemyDust2
 * @option EnemyDust3 <character> ＠2025/10/19
 * @value EnemyDust3
 * @option EnemyDust4 <character> ＠2025/10/19
 * @value EnemyDust4
 * @option EnemyDust5 <character> ＠2025/10/19
 * @value EnemyDust5
 * @option EnemyDust6 <character> ＠2025/10/19
 * @value EnemyDust6
 * @option EnemyDust7 <character> ＠2025/10/19
 * @value EnemyDust7
 * @option EnemyDust8 <character> ＠2025/10/19
 * @value EnemyDust8
 * @option EnemyOuji <character> ＠2025/5/2
 * @value EnemyOuji
 * @option Magic_1 <character> ＠2025/3/30
 * @value Magic_1
 * @option Warp_Blue_c <character> ＠2025/5/30
 * @value Warp_Blue_c
 * @option Warp_Green_c <character> ＠2025/5/30
 * @value Warp_Green_c
 * @option Warp_Red_c <character> ＠2025/5/30
 * @value Warp_Red_c
 * @option Warp_Yellow_c <character> ＠2025/5/30
 * @value Warp_Yellow_c
 * @option Yellow_Light <character> ＠2025/8/31
 * @value Yellow_Light
 * @option circle_Blue <character> ＠2025/5/30
 * @value circle_Blue
 * @option circle_Dark <character> ＠2025/6/11
 * @value circle_Dark
 * @option circle_Green <character> ＠2025/5/30
 * @value circle_Green
 * @option circle_Red <character> ＠2025/5/30
 * @value circle_Red
 * @option circle_Yellow <character> ＠2025/5/30
 * @value circle_Yellow
 * @option fog_w2 <character> ＠2025/4/28
 * @value fog_w2
 *
 * @arg z
 * @text Z値
 * @desc 重なり順。above:上、below:後ろ、screen、spritesetなど。数値指定も可
 * @default def
 *
 * @arg tag
 * @text 管理タグ
 * @desc 管理用のタグ名
 *
 * @arg edit
 * @text Editモード
 * @desc ONにするとエディタを呼び出し(テストプレイ時のみ有効)
 * @default false
 * @type boolean
 *
 * @arg delay
 * @text _ディレイ
 * @desc 1以上とすると、指定フレーム後にコマンドを実効
 * @default 0
 * @type number
 * @min 0
 *
 *
 * @command set_screen
 * @text set/表示 > screen/weather/region(1)
 * @desc パーティクル表示
 *
 * @arg id
 * @text 管理ID
 * @desc 他と被らない管理ID。「def」で設定名,「-EID」で設定名-EID
 * @default def
 *
 * @arg target
 * @text ターゲット
 * @desc thisでこのイベント。「event:イベントID」「player」「weather」など
 * @default this
 *
 * @arg name
 * @text 《データ名》
 * @desc データ名。defとすると管理IDをデータ名として使用。（重み同じデータ名を複数表示するときは管理IDを分ける）
 * @default 《呼び出す設定を選択》
 * @type select
 * @option blizard_w <weather> ＠2025/3/30
 * @value blizard_w
 *
 * @arg z
 * @text Z値
 * @desc 重なり順。above:上、below:後ろ、screen、spritesetなど。数値指定も可
 * @default def
 *
 * @arg tag
 * @text 管理タグ
 * @desc 管理用のタグ名
 *
 * @arg edit
 * @text Editモード
 * @desc ONにするとエディタを呼び出し(テストプレイ時のみ有効)
 * @default false
 * @type boolean
 *
 * @arg delay
 * @text _ディレイ
 * @desc 1以上とすると、指定フレーム後にコマンドを実効
 * @default 0
 * @type number
 * @min 0
 *
 *
 * @command play_character
 * @text play/１回再生 > character(6)
 * @desc パーティクルを１回だけ再生
 *
 * @arg id
 * @text 管理ID
 * @desc 他と被らない管理ID。「def」で設定名,「-EID」で設定名-EID
 * @default def
 *
 * @arg target
 * @text ターゲット
 * @desc thisでこのイベント。「event:イベントID」「player」「weather」など
 * @default weather
 *
 * @arg name
 * @text 《データ名》
 * @desc データ名。defとすると管理IDをデータ名として使用。（重み同じデータ名を複数表示するときは管理IDを分ける）
 * @default 《呼び出す設定を選択》
 * @type select
 * @option Newdust <character> ＠2025/3/29
 * @value Newdust
 * @option Warp_Blue_cp <character> ＠2025/5/30
 * @value Warp_Blue_cp
 * @option Warp_Green_cp <character> ＠2025/5/30
 * @value Warp_Green_cp
 * @option Warp_Red_cp <character> ＠2025/5/30
 * @value Warp_Red_cp
 * @option Warp_Yellow_cp <character> ＠2025/5/30
 * @value Warp_Yellow_cp
 * @option test <startdash> ＠2025/3/29
 * @value test
 *
 * @arg z
 * @text Z値
 * @desc 重なり順。above:上、below:後ろ、screen、spritesetなど。数値指定も可
 * @default def
 *
 * @arg tag
 * @text 管理タグ
 * @desc 管理用のタグ名
 *
 * @arg edit
 * @text Editモード
 * @desc ONにするとエディタを呼び出し(テストプレイ時のみ有効)
 * @default false
 * @type boolean
 *
 * @arg delay
 * @text _ディレイ
 * @desc 1以上とすると、指定フレーム後にコマンドを実効
 * @default 0
 * @type number
 * @min 0
 *
 *
 *
 *
 *
 *
 * @requiredAssets img/particles/smog2
 * @requiredAssets img/particles/particle1
 * @requiredAssets img/particles/cartoon_fuss1
 * @requiredAssets img/particles/line_oval3
 * @requiredAssets img/particles/line_oval2
 * @requiredAssets img/particles/square_line1
 * @requiredAssets img/particles/snow_particle2
 * @requiredAssets img/particles/snow_particle1
 * @requiredAssets img/particles/hexagon_line3
 * @requiredAssets img/particles/hexagon1
 * @requiredAssets img/particles/cloud3
 * @requiredAssets img/particles/cloud2
 * @requiredAssets img/particles/cloud1
 * @requiredAssets img/particles/__ANIM_30FPS_ACQ024_Ice_46
 * @requiredAssets img/particles/__ANIM_30FPS_ACQ026_Dark_44
 * @requiredAssets img/particles/__ANIM_60FPS_AC2Q001_Slash_16
 * @requiredAssets img/particles/__ANIM_60FPS_AC2Q002_Blow_21
 * @requiredAssets img/particles/__ANIM_60FPS_AC2Q013_Virus_48
 * @requiredAssets img/particles/__ANIM_Cure1_16
 */
PluginManager._parameters.trp_particle_list = {
	animImages:["_ANIM_30FPS_ACQ024_Ice_46","_ANIM_30FPS_ACQ026_Dark_44","_ANIM_60FPS_AC2Q001_Slash_16","_ANIM_60FPS_AC2Q002_Blow_21","_ANIM_60FPS_AC2Q013_Virus_48","_ANIM_Cure1_16"]
};