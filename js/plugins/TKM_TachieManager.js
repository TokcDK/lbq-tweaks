//=============================================================================
// TKM_TachieManager.js
// ----------------------------------------------------------------------------
// Copyright (c) 2016 Tsukimi
// This software released under the MIT license.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 0.0.0 2017/02/27 リリース
// 1.0.0 2017/05/13 リニューアル
// 1.0.1 2017/05/24 立ち絵更新の時にちらつくバグ解消
//=============================================================================

/*:
 * @plugindesc 立ち絵マネージャー
 * @author Tsukimi
 * 
 * @param ---------------
 * @desc -
 * @default ---立ち絵コンテナ設定---
 * 
 * @param 立ち絵11_ピクチャ番号
 * @desc 立ち絵11のピクチャ番号
 * @default 11
 * 
 * @param 立ち絵11_x座標
 * @desc 立ち絵11の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵11_y座標
 * @desc 立ち絵11の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵11_反転
 * @desc 立ち絵11を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 * 
 * @param 立ち絵12_ピクチャ番号
 * @desc 立ち絵12のピクチャ番号
 * @default 12
 * 
 * @param 立ち絵12_x座標
 * @desc 立ち絵12の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵12_y座標
 * @desc 立ち絵12の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵12_反転
 * @desc 立ち絵12を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 * 
 * @param 立ち絵13_ピクチャ番号
 * @desc 立ち絵13のピクチャ番号
 * @default 13
 * 
 * @param 立ち絵13_x座標
 * @desc 立ち絵13の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵13_y座標
 * @desc 立ち絵13の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵13_反転
 * @desc 立ち絵13を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 * 
 * @param 立ち絵14_ピクチャ番号
 * @desc 立ち絵14のピクチャ番号
 * @default 14
 * 
 * @param 立ち絵14_x座標
 * @desc 立ち絵14の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵14_y座標
 * @desc 立ち絵14の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵14_反転
 * @desc 立ち絵14を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 * 
 * @param 立ち絵15_ピクチャ番号
 * @desc 立ち絵15のピクチャ番号
 * @default 15
 * 
 * @param 立ち絵15_x座標
 * @desc 立ち絵15の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵15_y座標
 * @desc 立ち絵15の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵15_反転
 * @desc 立ち絵15を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 * 
 * @param 立ち絵16_ピクチャ番号
 * @desc 立ち絵16のピクチャ番号
 * @default 16
 * 
 * @param 立ち絵16_x座標
 * @desc 立ち絵16の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵16_y座標
 * @desc 立ち絵16の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵16_反転
 * @desc 立ち絵16を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 * 
 * @param 立ち絵17_ピクチャ番号
 * @desc 立ち絵17のピクチャ番号
 * @default 17
 * 
 * @param 立ち絵17_x座標
 * @desc 立ち絵17の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵17_y座標
 * @desc 立ち絵17の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵17_反転
 * @desc 立ち絵17を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 * 
 * @param 立ち絵18_ピクチャ番号
 * @desc 立ち絵18のピクチャ番号
 * @default 18
 * 
 * @param 立ち絵18_x座標
 * @desc 立ち絵18の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵18_y座標
 * @desc 立ち絵18の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵18_反転
 * @desc 立ち絵18を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 * 
 * @param 立ち絵19_ピクチャ番号
 * @desc 立ち絵19のピクチャ番号
 * @default 19
 * 
 * @param 立ち絵19_x座標
 * @desc 立ち絵19の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵19_y座標
 * @desc 立ち絵19の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵19_反転
 * @desc 立ち絵19を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 * 
 * @param 立ち絵20_ピクチャ番号
 * @desc 立ち絵20のピクチャ番号
 * @default 20
 * 
 * @param 立ち絵20_x座標
 * @desc 立ち絵20の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵20_y座標
 * @desc 立ち絵20の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵20_反転
 * @desc 立ち絵20を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 * 
 * @param 立ち絵21_ピクチャ番号
 * @desc 立ち絵21のピクチャ番号
 * @default 21
 * 
 * @param 立ち絵21_x座標
 * @desc 立ち絵21の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵21_y座標
 * @desc 立ち絵21の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵21_反転
 * @desc 立ち絵21を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 * 
 * @param 立ち絵22_ピクチャ番号
 * @desc 立ち絵22のピクチャ番号
 * @default 22
 * 
 * @param 立ち絵22_x座標
 * @desc 立ち絵22の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵22_y座標
 * @desc 立ち絵22の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵22_反転
 * @desc 立ち絵22を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 * 
 * @param 立ち絵23_ピクチャ番号
 * @desc 立ち絵23のピクチャ番号
 * @default 23
 * 
 * @param 立ち絵23_x座標
 * @desc 立ち絵23の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵23_y座標
 * @desc 立ち絵23の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵23_反転
 * @desc 立ち絵23を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 * 
 * @param 立ち絵24_ピクチャ番号
 * @desc 立ち絵24のピクチャ番号
 * @default 24
 * 
 * @param 立ち絵24_x座標
 * @desc 立ち絵24の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵24_y座標
 * @desc 立ち絵24の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵24_反転
 * @desc 立ち絵24を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 * 
 * @param 立ち絵25_ピクチャ番号
 * @desc 立ち絵25のピクチャ番号
 * @default 25
 * 
 * @param 立ち絵25_x座標
 * @desc 立ち絵25の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵25_y座標
 * @desc 立ち絵25の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵25_反転
 * @desc 立ち絵25を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 * 
 * @param 立ち絵26_ピクチャ番号
 * @desc 立ち絵26のピクチャ番号
 * @default 26
 * 
 * @param 立ち絵26_x座標
 * @desc 立ち絵26の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵26_y座標
 * @desc 立ち絵26の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵26_反転
 * @desc 立ち絵26を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 * 
 * @param 立ち絵27_ピクチャ番号
 * @desc 立ち絵27のピクチャ番号
 * @default 27
 * 
 * @param 立ち絵27_x座標
 * @desc 立ち絵27の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵27_y座標
 * @desc 立ち絵27の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵27_反転
 * @desc 立ち絵27を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 * 
 * @param 立ち絵28_ピクチャ番号
 * @desc 立ち絵28のピクチャ番号
 * @default 28
 * 
 * @param 立ち絵28_x座標
 * @desc 立ち絵28の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵28_y座標
 * @desc 立ち絵28の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵28_反転
 * @desc 立ち絵28を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 * 
 * @param 立ち絵29_ピクチャ番号
 * @desc 立ち絵29のピクチャ番号
 * @default 29
 * 
 * @param 立ち絵29_x座標
 * @desc 立ち絵29の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵29_y座標
 * @desc 立ち絵29の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵29_反転
 * @desc 立ち絵29を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 * 
 * @param 立ち絵30_ピクチャ番号
 * @desc 立ち絵30のピクチャ番号
 * @default 30
 * 
 * @param 立ち絵30_x座標
 * @desc 立ち絵30の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵30_y座標
 * @desc 立ち絵30の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵30_反転
 * @desc 立ち絵30を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 * 
 * @param 立ち絵31_ピクチャ番号
 * @desc 立ち絵31のピクチャ番号
 * @default 31
 * 
 * @param 立ち絵31_x座標
 * @desc 立ち絵31の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵31_y座標
 * @desc 立ち絵31の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵31_反転
 * @desc 立ち絵31を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 * 
 * @param 立ち絵32_ピクチャ番号
 * @desc 立ち絵32のピクチャ番号
 * @default 32
 * 
 * @param 立ち絵32_x座標
 * @desc 立ち絵32の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵32_y座標
 * @desc 立ち絵32の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵32_反転
 * @desc 立ち絵32を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 *
 * @param 立ち絵33_ピクチャ番号
 * @desc 立ち絵33のピクチャ番号
 * @default 33
 * 
 * @param 立ち絵33_x座標
 * @desc 立ち絵33の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵33_y座標
 * @desc 立ち絵33の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵33_反転
 * @desc 立ち絵33を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 *  
 * @param 立ち絵34_ピクチャ番号
 * @desc 立ち絵34のピクチャ番号
 * @default 34
 * 
 * @param 立ち絵34_x座標
 * @desc 立ち絵34の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵34_y座標
 * @desc 立ち絵34の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵34_反転
 * @desc 立ち絵34を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 *  
 * @param 立ち絵35_ピクチャ番号
 * @desc 立ち絵35のピクチャ番号
 * @default 35
 * 
 * @param 立ち絵35_x座標
 * @desc 立ち絵35の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵35_y座標
 * @desc 立ち絵35の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵35_反転
 * @desc 立ち絵35を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 *  
 * @param 立ち絵36_ピクチャ番号
 * @desc 立ち絵36のピクチャ番号
 * @default 36
 * 
 * @param 立ち絵36_x座標
 * @desc 立ち絵36の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵36_y座標
 * @desc 立ち絵36の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵36_反転
 * @desc 立ち絵36を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 *  
 * @param 立ち絵37_ピクチャ番号
 * @desc 立ち絵37のピクチャ番号
 * @default 37
 * 
 * @param 立ち絵37_x座標
 * @desc 立ち絵37の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵37_y座標
 * @desc 立ち絵37の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵37_反転
 * @desc 立ち絵37を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 *  
 * @param 立ち絵38_ピクチャ番号
 * @desc 立ち絵38のピクチャ番号
 * @default 38
 * 
 * @param 立ち絵38_x座標
 * @desc 立ち絵38の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵38_y座標
 * @desc 立ち絵38の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵38_反転
 * @desc 立ち絵38を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 *  
 * @param 立ち絵39_ピクチャ番号
 * @desc 立ち絵39のピクチャ番号
 * @default 39
 * 
 * @param 立ち絵39_x座標
 * @desc 立ち絵39の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵39_y座標
 * @desc 立ち絵39の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵39_反転
 * @desc 立ち絵39を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 *  
 * @param 立ち絵40_ピクチャ番号
 * @desc 立ち絵40のピクチャ番号
 * @default 40
 * 
 * @param 立ち絵40_x座標
 * @desc 立ち絵40の画面上のx座標
 * @default 0
 * 
 * @param 立ち絵40_y座標
 * @desc 立ち絵40の画面上のy座標
 * @default 0
 * 
 * @param 立ち絵40_反転
 * @desc 立ち絵40を反転して表示するか（0=そのまま、1=反転）
 * @default 0
 *  
 * @param ---------------
 * @desc -
 * @default ---立ち絵レイヤー設定---
 * 
 * @param レイヤー00名
 * @desc レイヤー00に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default 
 * 
 * @param レイヤー01名
 * @desc レイヤー01に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default 
 *
 * @param レイヤー02名
 * @desc レイヤー02に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default 
 *
 * @param レイヤー03名
 * @desc レイヤー03に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default 
 * 
 * @param レイヤー04名
 * @desc レイヤー04に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default 
 * 
 * @param レイヤー05名
 * @desc レイヤー05に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default 
 * 
 * @param レイヤー06名
 * @desc レイヤー06に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default 
 * 
 * @param レイヤー07名
 * @desc レイヤー07に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default 
 * 
 * @param レイヤー08名
 * @desc レイヤー08に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default 
 * 
 * @param レイヤー09名
 * @desc レイヤー09に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default 
 * 
 * @param レイヤー10名
 * @desc レイヤー10に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default 
 *
 * @param レイヤー11名
 * @desc レイヤー11に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー12名
 * @desc レイヤー12に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー13名
 * @desc レイヤー13に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー14名
 * @desc レイヤー14に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー15名
 * @desc レイヤー15に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー16名
 * @desc レイヤー16に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー17名
 * @desc レイヤー17に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー18名
 * @desc レイヤー18に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー19名
 * @desc レイヤー19に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー20名
 * @desc レイヤー20に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー21名
 * @desc レイヤー21に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー22名
 * @desc レイヤー22に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー23名
 * @desc レイヤー23に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー24名
 * @desc レイヤー24に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー25名
 * @desc レイヤー25に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー26名
 * @desc レイヤー26に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー27名
 * @desc レイヤー27に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー28名
 * @desc レイヤー28に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー29名
 * @desc レイヤー29に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー30名
 * @desc レイヤー30に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー31名
 * @desc レイヤー31に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー32名
 * @desc レイヤー32に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー33名
 * @desc レイヤー33に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー34名
 * @desc レイヤー34に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー35名
 * @desc レイヤー35に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー36名
 * @desc レイヤー36に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー37名
 * @desc レイヤー37に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー38名
 * @desc レイヤー38に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー39名
 * @desc レイヤー39に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @param レイヤー40名
 * @desc レイヤー40に表示するパーツの名前(空欄のまま=このレイヤーを使用しない)
 * @default
 *
 * @help
 * 
 *　レイヤー式立ち絵マネージャー
 * 作者：ツキミ
 * 
 * 説明：
 * レイヤー式立ち絵のマネージャーです。
 * 立ち絵のコンテナに、パーツを自動的に一枚絵に合成し表示します。
 * その後普通にピクチャの移動などもできます。
 * 
 * ***************************************************
 * プラグインコマンド：
 *  イベントコマンド「プラグインコマンド」から実行。
 *  （パラメータの間は半角スペースで区切る）
 * 
 * tachie_Register [キャラ名]
 *     システムに[キャラ名]を登録します。
 *     例：tachie_Register sizuru
 * 
 * 
 * tachie_ChangePart [キャラ名] [レイヤー名] [パーツ番号]
 * tachie_CP [キャラ名] [レイヤー名] [パーツ番号]
 *     キャラのパーツの番号を設定します。デフォルトでは全部0です。
 *     例：tachie_ChangePart sizuru body 1
 *     　　tachie_CP sizuru body 1
 * 
 * ※CPはChangePartの短縮表示で、効果が同じです
 * 
 * 
 * tachie_SetChar [立ち絵番号] [キャラ名]
 *     立ち絵のコンテナに表示するキャラを設定します。
 *     （まだ描画してません）
 *     例：tachie_SetChar 1 sizuru
 * 
 * 
 * tachie_Draw [立ち絵番号] [オプション]
 *     立ち絵のコンテナに設定されたキャラを描画します。
 *     オプション：
 *         invisible: 不透明度0でピクチャの表示（主にフェード演出用など）
 *         inv: 上と同じ
 *     例：tachie_Draw 1 inv
 *     　　tachie_Draw 2
 * 
 * 
 * tachie_Clear [立ち絵番号]
 *     立ち絵のコンテナに描画された立ち絵を消します。ピクチャの消去と効果は同じ
 *     例：tachie_Clear 1
 * 
 * 
 * ***************************************************
 * 
 * 作者のサイト： http://tsukimitsf.blog.fc2.com/
 * バグなどがあったら、是非こちらへご一報ください。ありがとうございます。
 */
var $TKMvar = $TKMvar || {};
$TKMvar.tachie = $TKMvar.tachie || {};


$TKMvar.tachie.CharList; // is {} ; "キャラ名": [ 各レイヤーの番号[] ]
$TKMvar.tachie.PicData = [];  // 各立ち絵のピクチャの番号、xy座標、現キャラなど

    $TKMvar.tachie.PicData[0] = {}; // 左に表示するピクチャ；立ち絵1
    $TKMvar.tachie.PicData[1] = {}; // 右に表示するピクチャ；立ち絵2→1-4までメニュー立ち絵用
    $TKMvar.tachie.PicData[2] = {};
    $TKMvar.tachie.PicData[3] = {};
    $TKMvar.tachie.PicData[4] = {};
    $TKMvar.tachie.PicData[5] = {};
    $TKMvar.tachie.PicData[6] = {};
    $TKMvar.tachie.PicData[7] = {};
    $TKMvar.tachie.PicData[8] = {};
    $TKMvar.tachie.PicData[9] = {};
    $TKMvar.tachie.PicData[10] = {};
    $TKMvar.tachie.PicData[11] = {};
    $TKMvar.tachie.PicData[12] = {};
    $TKMvar.tachie.PicData[13] = {};
    $TKMvar.tachie.PicData[14] = {};
    $TKMvar.tachie.PicData[15] = {};
    $TKMvar.tachie.PicData[16] = {};
    $TKMvar.tachie.PicData[17] = {};
    $TKMvar.tachie.PicData[18] = {};
    $TKMvar.tachie.PicData[19] = {};
    $TKMvar.tachie.PicData[20] = {};
    $TKMvar.tachie.PicData[21] = {};
    $TKMvar.tachie.PicData[22] = {};
    $TKMvar.tachie.PicData[23] = {};
    $TKMvar.tachie.PicData[24] = {};
    $TKMvar.tachie.PicData[25] = {};
    $TKMvar.tachie.PicData[26] = {};
    $TKMvar.tachie.PicData[27] = {};
    $TKMvar.tachie.PicData[28] = {};
    $TKMvar.tachie.PicData[29] = {};
    $TKMvar.tachie.PicData[30] = {};
    $TKMvar.tachie.PicData[31] = {};
    $TKMvar.tachie.PicData[32] = {};
    $TKMvar.tachie.PicData[33] = {};
    $TKMvar.tachie.PicData[34] = {};
    $TKMvar.tachie.PicData[35] = {};
    $TKMvar.tachie.PicData[36] = {};
    $TKMvar.tachie.PicData[37] = {};
    $TKMvar.tachie.PicData[38] = {};
    $TKMvar.tachie.PicData[39] = {};
    $TKMvar.tachie.PicData[40] = {};
                                    // カスタマイズするならここに PicData[2] =　{} などを追加

$TKMvar.tachie.partsNameArr = [];  // 各レイヤーのパーツ名


$TKMvar.tachie.MaxLayer = 41; // 0~9; このプラグインをカスタマイズする時に、ここを調整10→40
 
 (function() {
    "use strict";
    
    $TKMvar.tachie.preloadBitmap = function(tachieNum) {
        // 取得
        var PicData = $TKMvar.tachie.PicData;
        var MaxLayer = $TKMvar.tachie.MaxLayer;
        
        // 配列を作成
        if(!PicData[tachieNum]["bitmap"]) PicData[tachieNum]["bitmap"] = [];
        
        var name = PicData[tachieNum]["char"];          // 設定されたキャラの名前
        var partList= $TKMvar.tachie.CharList[name];    // キャラのパーツ番号を取得
        
        for(var i = 0; i < MaxLayer; i++) {
            // パーツ番号が0だったら省略する
            if(partList[i] === 0) {
                PicData[tachieNum]["bitmap"][i] = null;
                continue;
            }
            else {
            PicData[tachieNum]["bitmap"][i] = 
                ImageManager.loadPicture("/img/tachies/" + name + "_" + $TKMvar.tachie.partsNameArr[i] + "_" + partList[i], 0);
            }
        }
     };
     
    // 初期値の設定
    // 新しくゲームを始めた時に呼ばれる
    var createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        createGameObjects.call(this);
        $TKMvar.tachie.CharList = {};
        var PicData = $TKMvar.tachie.PicData;
        for(var i = 0; i <　PicData.length; i++) {
            PicData[i]["char"] = ""; // 現キャラ名を "" にする
            PicData[i]["bitmap"] = null;
        }
    };
 
    // セーブデータの生成
    // 返り値がセーブされるのでデータをcontentsに追加して返す
    var makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function() {
        var contents = makeSaveContents.call(this);
        contents.TKMvar_tachieList = $TKMvar.tachie.CharList;
        
        var PicData = $TKMvar.tachie.PicData;
        // 現キャラだけセーブ
        contents.TKMvar_tachieCurr = [];
        for(var i = 0; i <　PicData.length; i++) {
            contents.TKMvar_tachieCurr[i] = PicData[i]["char"];
        }
        return contents;
    };
    
    // セーブデータの読み込み
    // 生成時と同じ形でデータがcontentsに入っているので、変数に格納する
    var extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        extractSaveContents.call(this, contents);
        $TKMvar.tachie.CharList = contents.TKMvar_tachieList;
        // 現キャラをロードし、前のゲームのキャッシュを削除
        var PicData = $TKMvar.tachie.PicData;
        for(var i = 0; i <　PicData.length; i++) {
            PicData[i]["char"] = contents.TKMvar_tachieCurr[i];
            PicData[i]["bitmap"] = null;
        }
        
    };
 
    // parameterの処理
    var param = PluginManager.parameters('TKM_TachieManager'); 
    
    for(var i = 0; i < $TKMvar.tachie.MaxLayer; i++) {
        var name = 'レイヤー' + ("00" + i).slice(-2) + '名';
        $TKMvar.tachie.partsNameArr[i] = param[name];
    }
    for(var i = 0; i < $TKMvar.tachie.PicData.length; i++) {
        $TKMvar.tachie.PicData[i]["picNum"] = parseInt(param['立ち絵'+ (i+1) + '_ピクチャ番号'], 10);
        $TKMvar.tachie.PicData[i]["x"] = parseInt(param['立ち絵' + (i+1) + '_x座標'], 10);
        $TKMvar.tachie.PicData[i]["y"] = parseInt(param['立ち絵' + (i+1) + '_y座標'], 10);
        $TKMvar.tachie.PicData[i]["reverse"] = parseInt(param['立ち絵'+ (i+1) + '_反転'], 10) ? true : false;
    }

    Bitmap.prototype.resizeIfSmallerThan = function(bitemp) { // 立ち絵合成に使う
        var changed = false;
        var width = this.width;
        var height = this.height;
        if(width < bitemp.width) {
            width = bitemp.width;
            changed = true;
        }
        if(height < bitemp.height) {
            height = bitemp.height;
            changed = true;
        }
        if(changed) {
            this.resize(width, height);
        }
    };
     
    var _Sprite_Picture_loadBitmap = Sprite_Picture.prototype.loadBitmap;
    Sprite_Picture.prototype.loadBitmap = function() {
        if(this._pictureName.substr(0, 10) !== "TKMtachie_") {
            _Sprite_Picture_loadBitmap.call(this);
        }
        else { // ピクチャのname要素の接頭が TKMtachie_ だったら
            // 取得
            var PicData = $TKMvar.tachie.PicData;
            var MaxLayer = $TKMvar.tachie.MaxLayer;
            
            
            if(!this.bitmap || !this.bitmap.isTachie) { // Tachie専用のbitmapかどうか
                // this.bitmap = new Bitmap(Graphics.width, Graphics.height);
                this.bitmap = new Bitmap(1, 1);
                this.bitmap.isTachie = true;
                this.bitmap.smooth = true;
            }
            
            var HasController = false;
            for(var i = 0; i < PicData.length; i++) {
                if(this._pictureId === PicData[i]["picNum"]) { // このSprite_Pictureに対応するPicDataを探す
                    HasController = true;
                    
                    // ** first check if all loaded
                    // *  if no ["bitmap"], call preload and pass
                    var loaded = true;
                    if(!PicData[i]["bitmap"]) { // 主にニューゲームとロードゲームの時
                        $TKMvar.tachie.preloadBitmap(i);
                        this._pictureName = "TKMtachie_" ; // wait for all loaded (if _pictureName !== picture's name, will execute loadBitmap again)
                        break;
                    }
                    // *  ["bitmap"] exists; check if somebody still loading
                    for(var j = 0; j < MaxLayer; j++) {
                        var bitemp = PicData[i]["bitmap"][j]; // i: 立ち絵番号, j: パーツ番号
                        if(bitemp) {
                            if(!bitemp.isReady()) {
                                loaded = false;
                                break;
                            }
                        }
                    }
                    // ** if not loaded 
                    if(!loaded) {
                        this._pictureName = "TKMtachie_" ; // wait for all loaded (if _pictureName !== picture's name, will execute loadBitmap again)
                        break;
                    }
                    // 全パーツのbitmpのロードが終わったら、描画する
                    this.bitmap.clear();
                    this.setFrame(0, 0, 0, 0); // 描画範囲を各パーツを描画できるように拡大
                    for(var j = 0; j < MaxLayer; j++) {
                        var bitemp = PicData[i]["bitmap"][j];
                        if(bitemp) {
                            this.bitmap.resizeIfSmallerThan(bitemp);
                        }
                    }
                    // 反転するかどうか
                    var doReverse = PicData[i]["reverse"];
                    if(doReverse) { // TODO: transformは遅い、もっといい方法ないか？
                        this.bitmap.context.save();
                        this.bitmap.context.translate(this.bitmap.width, 0);
                        this.bitmap.context.scale(-1, 1);
                    }
                    // 本当の描画
                    for(var j = 0; j < MaxLayer; j++) {
                        var bitemp = PicData[i]["bitmap"][j];
                        if(bitemp) {
                            // this.bitmap.resizeIfSmallerThan(bitemp);
                            this.bitmap.context.drawImage(bitemp.canvas, 0, 0);
                        }
                    }
                    
                    this.bitmap._setDirty();
                    if(doReverse) this.bitmap.context.restore(); // 反転の後始末
                    //this._onBitmapLoad(); // ←アツマールコアでは無効になった
                    // 描画範囲をbitmapに合わせる
                    this._frame.width = this._bitmap.width;
                    this._frame.height = this._bitmap.height;
                    this._refresh();
                    break;
                }
            }
            if(!HasController) {
                $gameScreen.picture(this._pictureId)._name = "";
                this._pictureName = '';
                this.bitmap = null;
            }
        }
        // end of function
    };
 
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        
        // commandの処理
        switch ((command || '')) {
            case 'tachie_Register':         // tachie_Register [キャラ名]
                var charName = args[0];
                // 取得
                var CharList = $TKMvar.tachie.CharList;
                var MaxLayer = $TKMvar.tachie.MaxLayer;
                CharList[charName] = []; // 新しいキャラのパーツ番号の配列を作る
                
                for(var i = 0; i < MaxLayer; i++) {
                    CharList[charName][i] = 0; // すべてのパーツのデフォルト値は0
                }
                break;
                
            case 'tachie_CP':               // tachie_CP [キャラ名] [レイヤー番号] [パーツ番号]
            case 'tachie_ChangePart':       // tachie_ChangePart [キャラ名] [レイヤー番号] [パーツ番号]
                if( !(args[0] in $TKMvar.tachie.CharList) ) break; // そんなキャラ名が登録されなかったら無視する
                
                // 取得
                var CharList = $TKMvar.tachie.CharList;
                var MaxLayer = $TKMvar.tachie.MaxLayer;
                var PicData = $TKMvar.tachie.PicData;
                
                // パーツの名前に対応するレイヤーを探す
                var layerNum = -1;
                for(var i = 0; i < MaxLayer; i++) {
                    if($TKMvar.tachie.partsNameArr[i] === args[1]) {
                        layerNum = i; break;
                    }
                }
                if(layerNum === -1) break; // そんなレイヤー名がなかったら無視する
                
                var partNum = parseInt(args[2], 10) || 0;
                if(CharList[args[0]][layerNum] === partNum) break; // パーツが同じなら変更する必要ない
                CharList[args[0]][layerNum] = partNum;
                
                // ついでにそのパーツのbitmapをキャッシュしよう
                for(var i = 0; i < PicData.length; i++) {
                   if(PicData[i]["char"] == args[0]) {
                       // bitmap [] の存在確認
                       if(!PicData[i]["bitmap"]) $TKMvar.tachie.preloadBitmap(i);
                       if(partNum === 0) PicData[i]["bitmap"][layerNum] = null;
                       else PicData[i]["bitmap"][layerNum] = 
                           ImageManager.loadPicture("/img/tachies/" + args[0] + "_" + $TKMvar.tachie.partsNameArr[layerNum] + "_" + partNum, 0);
                   }
                }
                
                break;
                
            case 'tachie_SetChar':          // tachie_SetChar [立ち絵番号] [キャラ名]
                var tachieNum = parseInt(args[0], 10) || 0; // 立ち絵1か2か、それとも…
                tachieNum--; // データ上は0から
                if(tachieNum === -1) break;
                
                // 取得
                var CharList = $TKMvar.tachie.CharList;
                var MaxLayer = $TKMvar.tachie.MaxLayer;
                var PicData = $TKMvar.tachie.PicData;
                
                if($TKMvar.tachie.PicData[tachieNum]["char"] === args[1]) break; // キャラが同じなら変更する必要ない
                
                if( args[1] in CharList ) {
                    if(PicData.length > tachieNum) {
                        PicData[tachieNum]["char"] = args[1];
                        
                        PicData[tachieNum]["bitmap"] = null;
                        PicData[tachieNum]["bitmap"] = [];
                        
                        // preload bitmap
                        /*
                        var partList= $TKMvar.tachie.CharList[args[1]];
                        for(var i = 0; i < $TKMvar.tachie.MaxLayer; i++) {
                            if(partList[i] === 0) {
                                $TKMvar.tachie.PicData[tachieNum]["bitmap"][i] = null;
                                continue;
                            }
                            else {
                                $TKMvar.tachie.PicData[tachieNum]["bitmap"][i] = ImageManager.loadPicture("/img/tachies/" + args[1] + "_" + $TKMvar.tachie.partsNameArr[i] + "_" + partList[i], 0);
                            }
                            
                        }*/
                        $TKMvar.tachie.preloadBitmap(tachieNum);
                        
                    }
                }
                break;
                
            case 'tachie_Draw':             // tachie_Draw [立ち絵番号] [オプション]
                var tachieNum = parseInt(args[0], 10) || 0; // 立ち絵1か2か、それとも…
                tachieNum--; // データ上は0から
                if(tachieNum === -1) break;
                if($TKMvar.tachie.PicData.length <= tachieNum) break;
                if(!$TKMvar.tachie.PicData[tachieNum]["char"]) break;
                
                // 取得
                var CharList = $TKMvar.tachie.CharList;
                var MaxLayer = $TKMvar.tachie.MaxLayer;
                var PicData = $TKMvar.tachie.PicData;
                
                var pictureId = PicData[tachieNum]["picNum"];
                // ピクチャの名前を設定: "TKMtachie_[キャラ]_[すべてのパーツ番号]"
                var char = PicData[tachieNum]["char"];
                var name = "TKMtachie_" + char + "_";
                var partList = CharList[char];
                for(var i = 0; i < $TKMvar.tachie.MaxLayer; i++) {
                    name += partList[i];
                }
                var x = $TKMvar.tachie.PicData[tachieNum]["x"];
                var y = $TKMvar.tachie.PicData[tachieNum]["y"];
                // TODO
                
                // オプション
                if(!args[1]) {
                $gameScreen.showPicture(pictureId, name, 0, x, y, 85, 85, 255, 0);
                }
                else{
                    switch(args[1].toUpperCase()) {
                        case 'INV':
                        case 'INVISIBLE':
                            $gameScreen.showPicture(pictureId, name, 0, x, y, 85, 85, 0, 0);
                            break;
                        
                        default:
                            $gameScreen.showPicture(pictureId, name, 0, x, y, 85, 85, 255, 0);
                            break;
                    }
                }
                break;
                
            case 'tachie_Clear':            // tachie_Clear [立ち絵番号]
                var tachieNum = parseInt(args[0], 10) || 0; // 立ち絵1か2か、それとも…
                tachieNum--; // データ上は0から
                if(tachieNum === -1) break;
                if($TKMvar.tachie.PicData.length <= tachieNum) break;
                
                $gameScreen.erasePicture($TKMvar.tachie.PicData[tachieNum]["picNum"]);
                // $TKMvar.tachie.PicData[tachieNum]["char"] = "";
                break;
        }
        
    };
    
    
})();
