/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){
	
// TIPS using in original_text function>
class BookTipBase {
    constructor() {
    }
	
    seName() {
        throw new Error("getValue2 method should be implemented");
    }

    var172value() {
        throw new Error("getValue2 method should be implemented");
    }

    getValue1() {
        throw new Error("getValue1 method should be implemented");
    }

    getValue2() {
        throw new Error("getValue2 method should be implemented");
    }

    playSound() {
        AudioManager.playSe({"name": this.seName(), "volume": 100, "pitch": 100, "pan": 0});
    }

    setGameVariable() {
        $gameVariables.setValue(172, this.var172value());
    }

    setValueTalkSet() {
		const value3 = [0,1,640,384,100,100,255];
		valueTalkSet = [this.getValue1(),this.getValue2(),value3];
    }

    execute() {
        this.playSound();
        this.setGameVariable();
        this.setValueTalkSet();
    }
}
class Tip1 extends BookTipBase {//
    seName() {
        return "Book2";
    }

    var172value() {
        return 2;
    }
    getValue1() {
        return `朽ちた星晶獣の権能復元計画`;
    }
    getValue2() {
        return 
`\\swi[247]の協力者から持ち込まれた情報を元に
策定されたプロジェクト。
\\swi[221]に嘗て存在したとされる、
とある星晶獣の細胞が提供された事によって
本計画は採用された。

協力者は\\swi[247]で要職に就いている事もあり、
国内での施設建造、実験体調達をスムーズに行えている。
但し、研究施設については機器の調達・整備等の面から
別島に移設する事が検討されている──。


『朽ちた星晶獣の権能復元計画書』より抜粋`;
    }
};
class Tip2 extends BookTipBase {//<淫統薬>インデュ・アビス
    seName() {
        return "Book2";
    }

    var172value() {
        return 2;
    }
    getValue1() {
        return `${$dataWeapons[452].name}─その１─`;
    }
    getValue2() {
        return 
`コルブラント島でその断片を確保した星晶獣、
その一部他を用いて精製された、民意扇動を目的とした薬物。

彼の星晶獣が所有していた「支配」の権能は、
民衆管理の手法としては非常に有用ではあるが、
広範囲に作用する性質が原因なのか、
断片でしか無いためダウングレードしているのか、
意志力の強い者へは作用し辛い事が確認されている。
少なくとも、国元で治験名目で実験した所、
英雄と呼ばれる位階に居る者達には
明確な効力を発揮する事が無かったのは、
決して座視できぬ問題であった。

その２に続く──`;
    }
};
class Tip3 extends BookTipBase {//<淫統薬>インデュ・アビス
    seName() {
        return "Book2";
    }

    var172value() {
        return 2;
    }
    getValue1() {
        return `${$dataWeapons[452].name}─その３─`;
    }
    getValue2() {
        return 
`
現在は行方不明者が発生しても騒ぎになり難い、
空域内でも有数の観光島で実地検証を行っている。
この検証で、投薬対象によっては
廃人化してしまう事が判明したのは、
非常に有意義な結果だったと言えるだろう。
また、この廃人化した対象の体液は、
インデュ・アビス精製の際に必要な接受体として
使える事も確認されている。

『〇〇〇〇帝国研究開発部の業務月報』より抜粋`;
    }
};
class Tip4 extends BookTipBase {//<試薬品>インデュルゲンス・リキッド
    seName() {
        return "Book2";
    }

    var172value() {
        return 2;
    }
    getValue1() {
        return `${$dataWeapons[453].name}`;
    }
    getValue2() {
        return 
`開発された\\wn[452]の試作品。
正式採用となった薬品と比較すると、
必要な摂取量などが問題となり開発中止となった。
しかし、効能についてはより大元となる星晶獣の
権能に近いものがあるのが特徴。

\\swi[247]宰相を通じて、同派閥貴族達に
生産された一部が流出されている事が判明している。

『〇〇〇〇帝国研究開発部の業務日報』より抜粋`;
    }
};
class Tip5 extends BookTipBase {//<淫紋>アビス・クレスト使用ずみ
    seName() {
        return "Book2";
    }

    var172value() {
        return 2;
    }
    getValue1() {
        return `${$dataWeapons[454].name}`;
    }
    getValue2() {
        return 
`触手型魔物である「\\wn[455]」が使う、
対象を苗床化する\\wn[456]を元に、
人間用に改変された紋章の一つ。

対象女性の性的官能を自在に操る効果を持つ紋章を刻む。
主に性奴隷などに用いられる為、
習得者は専らアンダーグラウンドの住人である。
紋章を刻まれた対象は、産まれ持ち育んだ価値観が
歪められる程の快楽を得るという…。
余談だが、原型となる\\wn[456]と
比べると、その効果は幾分かマイルドになっているらしい。
これは、\\wn[456]の効果が凡そ人には
受け入れられない程のものであり、
「商品」として仕立てる事も出来ぬほど強力であるかららしい──。

民明書房刊『魔術大家の独り言』より抜粋`;
    }
};
class Tip6 extends BookTipBase {//<淫統光>HMD型インデュ・アビス.使用ずみ
    seName() {
        return "Chime2";
    }

    var172value() {
        return 2;
    }
    getValue1() {
        return `${$dataWeapons[457].name}`;
    }
    getValue2() {
        return 
`服薬が必要な\\wn[452]に対して、
光学的なアプローチを用いた試作魔導開発品。
網膜に淫統作用を持った光を照射する事で、
脳に直接効果を与える事が可能。

国土に配備した照射機で齎される、
「光」を照らすだけで民を支配する事を目標としているが、
現状では専用のヘッドマウントディスプレイを用いる必要がある。

現在はまだ試験中であり、実験レポートが求められている。

『エルステ帝国研究開発部の成果発表レポート』より抜粋`;
    }
};
class Tip7 extends BookTipBase {//<アビス・クレスト>と<インデュ・アビス>使用ずみ
    seName() {
        return "Chime2";
    }

    var172value() {
        return 2;
    }
    getValue1() {
        return `${$dataWeapons[458].name}`;
    }
    getValue2() {
        return 
`両者には根幹技術に措いて同様の手法が用いられている
（正確には\\wn[454]の術式を
\\wn[452]が流用している）為、
ある程度の知識がある者ならば、
互いの術式から干渉する事が可能。

作中では\\set[7]によって、
空賊が仕込んだ\\wn[454]に\\N[7]が干渉し、
鎮静化されていた淫統光の効果をＨＭＤを用いずに
再活性化させた。

『飛び出せ！ よく解る＜りしゃぶる＞大図鑑！！』より抜粋`;
    }
};
class Tip8 extends BookTipBase {//使用済み
    seName() {
        return "Book2";
    }

    var172value() {
        return 2;
    }
    getValue1() {
        return `${$dataWeapons[80].name}`;
    }
    getValue2() {
        return 
`数年前よりコルブラント島に出没するようになった空賊団。
高機能な騎空挺と練度の高い団員を擁しており、
島内での被害が相次いでいる。
王国による掃討作戦が幾度となく行われたが、
その全てで失敗している。
軍部に内通者の存在が疑われているが、現在調査中につき真偽は不明。

王国宰相の諜報網を駆使した結果、
空賊団の一部が\\in[23]に姿を現している事が判明。
彼らを幾人か捕らえ、本拠地の場所を確定したい。

王国所属の騎士団へは報を入れず、
お招きした<秩序の騎空団>諸氏に対応を願いたい。

『秩序の騎空団への状況報告書』より抜粋`;
    }
};
class Tip11 extends BookTipBase {//<星晶獣>インペリウム・グノーシス。使用ずみ
    seName() {
        return "Book2";
    }

    var172value() {
        return 2;
    }
    getValue1() {
        return `${$dataWeapons[451].name}`;
    }
    getValue2() {
        return 
`コルブラント島で存在を確認された星晶獣。
その権能は、認識改変による「支配」。
現在、浮島を統治しているネルガド王家始祖は、
この権能を用いて自身の王権を確立させたと思われる。
それからも、細々とした形ではあるが
国家運営上の問題点をこの権能を用いて解決していた事が、
協力者の証言により確認されている。

しかし、凡そ百年前にインペリウム・グノーシスは姿を消し、
現在の王家は自力での統治を行っている事も
前述の協力者より証言されている。
百年前に何があったかは不明。
優先度は低いが継続的な調査が求められる。

『〇〇〇〇帝国研究開発部の業務年報』より抜粋`;
    }
};
class Tip12 extends BookTipBase {//<星晶獣>インペリウム・グノーシス
    seName() {
        return "Chime2";
    }

    var172value() {
        return 3;
    }
    getValue1() {
        return `${$dataWeapons[451].name}─その２─`;
    }
    getValue2() {
        return 
`既にその存在は朽ち果て、遺骸は大森林の地下深くに埋没している。
残滓や断片が卑小化された権能を発揮する事もあるが、
大元には朧げな意識しか存在していない。

朽ちた原因は、代々のネルガド王家による権能の過剰使用。
これにより王家はその地位を盤石なものにしていたが、
その寄る辺を喪った結果、
何一つ決断/判断をする事が出来ない
無能な王族が蔓延する事となった。

現在は、遺跡でのみ存在を保っている。。
己が<支配>の届かぬ『天』を超える者の到来を望みながら…。
`;
    }
};
class Tip13 extends BookTipBase {//「インペルの神水」使用済み
    seName() {
        return "Chime2";
    }

    var172value() {
        return 2;
    }
    getValue1() {
        return `${$dataItems[1162].name} またの名を「${$dataWeapons[460].name}」`;
    }
    getValue2() {
        return 
`中央森林で汲み取れる湧き水。
高級志向の飲食店などで使われている。
…それとは別に、\\swi[247]でも一部の高位貴族にしか
伝わっていない使用法がある。
コルブラント島でしか取れぬ霊薬を調合に用いる事で、
服用者を一種の催眠状態に陥らせる事が出来る
特殊な飲料水を生成する事が可能なのである。

当然のように国法で生成を禁じられているが、
裏で用いられる事例が度々散見されている。
特に、島外からの余所者などに──。

一説には、とある星晶獣の体液が混ざっているとも
云われている。

`;
    }
};
class Tip14 extends BookTipBase {//支配の結石使用済み
    seName() {
        return "Chime2";
    }

    var172value() {
        return 2;
    }
    getValue1() {
        return `${$dataItems[1163].name}`;
    }
    getValue2() {
        return 
`ジャックモンド伯爵家に伝わる希少な鉱石。
とある不思議な効力があるとされている。
現在では、後継を選ぶための試練に使われている。

その効果は、「\\swi[247]の貴族血統に発現する、
状態異常支配系アビリティの超強化」。
その強化具合は、＜Ｎ(ノーヴィス)＞として産まれた
貧弱な子供が使う状態異常アビリティが、
＜ＳＲ＞として産まれ磨き上げられた一流騎空士の
耐性をブチ抜くほど。

一説には、とある星晶獣の肉片が変じた姿なのでは、と
云われている。

`;
    }
};
class Tip15 extends BookTipBase {//クサンについて。ラストバトル時に使用,入手ずみ
    seName() {
        return "Chime2";
    }

    var172value() {
        return 3;
    }
    getValue1() {
        return `${$gameActors.actor(7).name()}=コルド＝${$dataActors[7].meta['SecondName'].split(',')[1]}`;
    }
    getValue2() {
        return 
`\\swi[247]元宰相。
その目的は、嘗て王国統治を支えた星晶獣の権能復元。
現在に置いても、湧き水や結石という形でその神秘は
利用する事が可能だが、それらは所詮は残滓に過ぎない。
彼が求めたのは、「秩序を護る者を秩序を穢す者」へと
変える事も可能なほどの強力な支配能力である。
その為に\\wn[75]と繋がり、彼の国の特殊な魔導具を
用いての再現を目論んだ。
空賊を経由して拉致した\\swi[247]民を
人体実験の生贄に用いて………。

当の昔に喪われた異形。
その力に頼り切る体制から脱却できぬ国の宰相は、
禁忌へと手を染めた。頼りにならぬ愚王や佞臣達に代わり、
己が覇権を握り祖国を導かんが為に──。

`;
    }
};
class Tip16 extends BookTipBase {//クサンについて2。使用ずみ
    seName() {
        return "Chime2";
    }

    var172value() {
        return 2;
    }
  //var value1 = `\\set[7]─その２─`;
    getValue1() {
        return `${$gameActors.actor(7).name()}=コルド＝${$dataActors[7].meta['SecondName'].split(',')[1]}─その２─`;
    }
    getValue2() {
        return 
`未だ復権という野心にその身を焦がす\\swi[247]元宰相。

…その可能性が、既に潰えている事を自覚せぬままに。
何故ならば、\\swi[247]は\\wn[359]王主導の元、
急速に\\N[7]を過去の人物へと押しやっているのだから…。
歴史の潮流に取り残された元宰相に、
これを覆す手段はもはや存在しないのである…。

元来の、一国を牛耳るまでに至った\\N[7]ならば、
自ずと悟っていたであろう現実。
けれど、今の彼が理解することは未来永劫、有り得ない。
星晶獣との疑似的な融合や地位の失墜により、
精神に重篤な瑕疵の出来た今。
在りし日の栄光に心を寄せる事でしか
心を保てないのが、今の\\set[7]なのだから──。

`;
    }
};
class Tip17 extends BookTipBase {//騎士団長,入手ずみ
    seName() {
        return "Chime2";
    }

    var172value() {
        return 3;
    }
    getValue1() {
        return `${$dataWeapons[351].name}=${$dataWeapons[351].meta['FamilyName']}`;
    }
    getValue2() {
        return 
`\\swi[247]騎士団長。
王国最強の騎士にして、軍事に措ける最高責任者。
政治からは自覚的に距離を取るようにしていた。

比較的早い時期から、\\afn[7]宰相の暗躍に気付いていた。
何とか掣肘すべく動いていたが、政治的な影響力の差もあり
逆に騎士団の要職を宰相派とでもいうべき貴族達に
挿げ替えられ、身動きが取れなくなっていた。
そんな時に\\wn[78]による干渉を知り、
これを奇貨とすべく水面下で行動していた。
最終的に\\N[1]達の手によって討たれる事で、
一連の事件に幕を引く事となる。

──王国最強の騎士は、最後まで忠義にその身を捧げた。
愛する祖国の為、そして無二の友の為に…。

`;
    }
};
class Tip18 extends BookTipBase {//国王。使用ずみ
    seName() {
        return "Chime2";
    }

    var172value() {
        return 2;
    }
    getValue1() {
        return `${$dataWeapons[359].name}=${$dataWeapons[359].meta['FamilyName']}`;
    }
    getValue2() {
        return 
`\\swi[247]国王。自他共に認める無能な王。
それは彼自身の責というよりも、星晶獣の権能という
便利な力に縋る事を辞められなかった歴代王家そのものに
責があるといえよう。

一連の事件の後、崩壊へと傾き続ける王国にあって、
『唯一の友の死』、そして、『己がやるしかない状況』
に直面する事で、無能から凡夫程度へと成長を成し遂げる。
結果、\\swi[247]は辛うじて破綻を免れた、という。

──歴史に語られる無為無能の王。
然れど、死期を悟った友が去り際に願った『王国の安寧』。
その大願の為に残りの生涯を賭した王でもあった。
`;
    }
};
class Tip19 extends BookTipBase {//<淫触薬>アビス・リキッド、使用ずみ
    seName() {
        return "Book2";
    }

    var172value() {
        return 2;
    }
    getValue1() {
        return `${$dataWeapons[459].name}`;
    }
    getValue2() {
        return 
`\\wn[452]を元にして作成された派生薬の一つ。
触手型魔物である「\\wn[455]」の体液を用いる事で、
元の薬品とは別の形で、
しかし更に強力な強制力を持たせる事に成功している。
雌性体専用薬。

対象の性的官能を暴力的なまでに引き上げ、
異性からの支配を受け入れやすくする。
代償として思考が鈍くなってしまう為、
性的用途以外には使えない。
\\wn[454]が定着する事で本来の効果を発揮する。

\\wn[459]以外にも様々な派生形薬品が作られており、
それらは\\swi[223]の観光客相手に売り捌かれたらしい…。
`;
    }
};
class Tip20 extends BookTipBase {//エネミー全滅ボーナス、使用ずみ
    seName() {
        return "Book2";
    }

    var172value() {
        return 2;
    }
    getValue1() {
        return `エネミー全滅ボーナス`;
    }
    getValue2() {
        return 
`マップ上のシンボルエネミーを全滅させる事で、
初回殲滅特典としてレアなアイテムが入手できます。
２回目以降は、そのマップの
「初回殲滅特典」「白銀宝箱」「通常宝箱」の中から
ランダムで抽選されたアイテムが入手できます。

エネミーの全滅判定（カウント）は、
そのダンジョン（フィールド）から
出るか日数経過させる事でリセットされます。

また、エネミーを全滅させると、全滅させた回数分だけ
エネミーのレベルが上昇します。
（全滅回数３回でエネミーレベル＋３）
`;
    }
};
class Tip21 extends BookTipBase {//ダンジョンとフィールドの違い。使用ずみ
    seName() {
        return "Book2";
    }

    var172value() {
        return 2;
    }
    getValue1() {
        return `ダンジョンとフィールド`;
    }
    getValue2() {
        return 
`作中に措いて、『ダンジョン』と『フィールド』は
扱いが異なる。
ダンジョンでは倒したエネミーは自然消滅し上限まで
リポップするが、フィールドではしない。
エネミーＬＶが20以上のダンジョンでは「トラップ」が
設置されるが、フィールドではない。

一部のクエストでも、扱いを別にされている。

`;
    }
};
class Tip22 extends BookTipBase {//食事について。使用済み
    seName() {
        return "Book2";
    }

    var172value() {
        return 2;
    }
    getValue1() {
        return `食事アイテムについて`;
    }
    getValue2() {
        return 
`「Food」に分類される食事アイテムは、
使用する事で食べる事ができ、
その食事毎に設定されたバフを受ける事が出来ます。

一度の食事で「満腹度」が1上昇し、
「満腹度上限」に達するまで食事が行えます。
満腹度は昼夜変更時にリセットされます。
同時にバフも消去されます。

※ 「食材」と「食事」アイテムは別物です。
`;
    }
};
class Tip23 extends BookTipBase {//<淫統薬>インデュ・アビス
    seName() {
        return "Book2";
    }

    var172value() {
        return 2;
    }
    getValue1() {
        return `${$dataWeapons[452].name}─その２─`;
    }
    getValue2() {
        return 
`これを解消する為の研究は主に、
「特定対象に特化した支配機能」を主軸としている。
主に、「対象の欲求に根差した支配」となる。
認識改変による０からの支配では無く、
支配を受け入れざるを得ない土壌を用意する形式と言える。

この研究で最も効力を示している成果物が、
\\wn[452]である。
とある触手型魔物の体液と化合させて精製されるこの薬品は、
対象の性的欲求を過剰に誘発させ、
肉欲を対象の最上位価値基準に置く事で
他者からの支配を受け入れさせる物である。

その３に続く──`;
    }
};
class Tip24 extends BookTipBase {//ディヴィジョン・ベルセルク
    seName() {
        return "Book2";
    }

    var172value() {
        return 3;
    }
    getValue1() {
        return `ベルセルク──過去──`;
    }
    getValue2() {
        return 
`覇空戦争時代に猛威を振るった狂戦士達。
理性を払底させる事を代償に強大な力を振るう。
その性質上、「味方殺し」すら許容されるような、
凄惨極まる戦場で活躍した。

一説には星の民による人種改良によって
産み出された半人工的な存在と云われている。

戦後、己らの凶暴性を忌んだ彼らは外界との関わりを断ち、
人の手の入っていない浮島を選んで一族纏めて移住した。

──もう二度と、と。
それだけを想い選んで…。
`;
    }
};
class Tip25 extends BookTipBase {//ディヴィジョン・ベルセルク
    seName() {
        return "Book2";
    }

    var172value() {
        return 3;
    }
    getValue1() {
        return `ベルセルク──現在──`;
    }
    getValue2() {
        return 
`──現代に措いて。
様々な書物から、その一族の存在を掴んだ帝国研究所。
早速サンプルの確保に動いたが、正規軍を動かすには
時期が悪く、流れの空賊に『回収』を依頼する。
しかし、その空賊達は情報だけを利用し略奪を実行。
結果、集落は全滅。
彼らが望んだ「伝説のベルセルク」の血統も途絶えた…。

──一人の少年を除いて。

その生き残りも、面倒な騎空団に拾われた事で回収も半ば
断念されていたが………。
何故か追放された為、軍を動かし確保に赴く事となった──。
`;
    }
};
class Tip26 extends BookTipBase {//ディヴィジョン・ベルセルク
    seName() {
        return "Book2";
    }

    var172value() {
        return 3;
    }
    getValue1() {
        return `ディヴィジョン・ベルセルク`;
    }
    getValue2() {
        return 
`本来は、血族であろうとも器では無い\N[5]が、
寿命を代償に狂戦士化した姿。
本来のベルセルクと比べ弱体化、或いは超ピーキーな
改変が行われている。

然れど、元がノーヴィスの少年である事を考えれば、
その伸び幅は破格のものと言える。

──理性を剥奪されて得た力に、どれ程の意味があるのか。
その答えを出すべき少年は………。
`;
    }
};
class Tip27 extends BookTipBase {//ライフスト－ム
    seName() {
        return "Book2";
    }

    var172value() {
        return 3;
    }
    getValue1() {
        return `生命奔流体機構<ライフストーム・イグジット>`;
    }
    getValue2() {
        return 
`生体兵器として産み出された狂戦士の血統に
遺伝子レベルで組み込まれた疑似思考群体。
平時は対象の無意識領域にて沈黙を保っているが、
狂戦士化(殺戮)による精神の不安定化などの時に
保有者のメンタルケアを自動実行する機能を持つ。
また、保有者の生命維持を最優先事項とし、
その為の生体改造/改竄技術と権限を保持している。

機構を持ちながらも覚醒する事無く虐殺された
\\N[5]の集落の住人は、「暴力への絶対的禁忌」を
父祖に洗脳レベルで躾けられていた為、
機構が干渉を行える余地が無かったのである。

──歳若い\\N[5]を除いて。
`;
    }
};
// < TIPS
	

htext_word = function(id1){
	switch(id1) {
		case 3: {
		  valueHtextWord = ['「アッ\\I[12]\\I[12]\\I[12]」','「ンッ\\I[12]」','「ンン…\\I[12]」','「ンクっ…\\I[12]」','「ァンっ…\\I[12]」','「ヒィンっ…\\I[12]」','「アヒィっ…\\I[12]」'];
		  break;
		}
		case 2: {
		  valueHtextWord =  ['「………ァっ」','「いや…」','「ンン──……」','「ンクっ…」','「ァンっ…」'];
		  break;
		}
		case 1: {
		  valueHtextWord = ['「イヤ…ッ」','「ヤメ…」','「ァァ………」','「助けッ──」','「ァ──」'];
		  break;
		}
	}
}

gabWord_exeScriptNoFace = function(arrNpcGab1){

var arrNpcGab2 = [];
var arrNpcGab2 = arrNpcGab1[Math.floor(Math.random() * arrNpcGab1.length)];
if(arrNpcGab1 != 0){
  var scene = SceneManager._scene;
  var gabData = [arrNpcGab2[0],'',0,0,'',0];
  if(!$gameParty.inBattle()){$gameSystem.pushInfoLog(arrNpcGab2[0])};//追加。インフォログにギャブ内容を直接入れる。
  if (scene._gabWindow) scene.startGabWindow(gabData);
};

};

gabWord_exeScript = function(arrNpcGab1){

var arrNpcGab2 = [];
var arrNpcGab2 = arrNpcGab1[Math.floor(Math.random() * arrNpcGab1.length)];
if(arrNpcGab1 != 0){
  var scene = SceneManager._scene;
  var gabData = [arrNpcGab2[0],'face',arrNpcGab2[1],Number(arrNpcGab2[2]),'',0];
  if(!$gameParty.inBattle()){$gameSystem.pushInfoLog(arrNpcGab2[0])};//追加。インフォログにギャブ内容を直接入れる。
  if (scene._gabWindow) scene.startGabWindow(gabData);
};

};

//戦闘開始時Gab。
gabWord_setBattle = function(){

var arrNpcGab1 = [];
var value4 = 0;
var value3 = $gameParty.battleMembers().length;
var value2 = Math.floor( Math.random() * value3);
var value1 = $gameParty.battleMembers()[value2].actorId();
$gameVariables.setValue(53,$gameActors.actor(value1).nickname());
$gameVariables.setValue(625,$gameVariables.value(380 + value1)[59]);
if($gameVariables.value(229) == 0){//グループID
  $gameVariables.setValue(68,80)//GAB表示時間。二言目以上の時
  var arrNpcGab1 = [];
  arrNpcGab1.push([`「秩序の名に措いて…、私は負けませんッ！！」`,'1Actor1',7]);
  gabWord_exeScript(arrNpcGab1);
  var arrNpcGab1 = [];
  arrNpcGab1.push([`「油断せず行きますよ──ッ！！」`,'1Actor1',3]);
  var value4 = 1;
};
if(value4 == 0 && !$gameSwitches.value(211)){
  if(value3 == 1){
    for (var i = 1; i <= 9; i++) {
      if($dataActors[value1].meta['GabBattleTurnAlone_' + i]){
        arrNpcGab1.push($dataActors[value1].meta['GabBattleTurnAlone_' + i].split(','));
      };
    };
  } else {
    for (var i = 1; i <= 9; i++) {
      if($dataActors[value1].meta['GabBattleTurn_' + i]){
        arrNpcGab1.push($dataActors[value1].meta['GabBattleTurn_' + i].split(','));
      };
    };
  };
//arrNpcGab1.push([`「押し通る──ッ！！」`,'2Actor1',7]);
//arrNpcGab1.push([`「前進あるのみ！　行くぞ──ッッ！！」`,'2Actor1',3]);
//arrNpcGab1.push([`「押し通る──ッ！！」`,'NPC1',6]);
//arrNpcGab1.push([`「押し通る──ッ！！」`,'NPC1',7]);
//arrNpcGab1.push([`「押し通る──ッ！！」`,'NPC2',0]);
};
gabWord_exeScript(arrNpcGab1);

};

//マップ移動時ＮＰＣ呟き。
gabWord_setNpc = function(){

var arrNpcGab1 = [];
if($gameParty.numItems($dataItems[10]) >= 1000){
  arrNpcGab1.push([`【中年男】「\\iin[10]が貯まってるじゃないか。早く交換に行きな」`,'GabPeople4',4]);
  arrNpcGab1.push([`【女性】「\\iin[10]が貯まってるじゃない。交換に行ってきたら？」`,'GabPeople4',3]);
  arrNpcGab1.push([`【少年】「\\iin[10]が貯まっていますよ？　交換に行くべきでは」`,'GabPeople4',0]);
};
if($gameSwitches.value(241) && $gameSwitches.value(203)){//コルブラント屋外
  if($gameVariables.value(135) >= 42 && $gameVariables.value(135) <= 43){
    arrNpcGab1.push([`【中年男】「何やら城の方が騒がしいな…」`,'GabPeople1',4]);
    arrNpcGab1.push([`【老婆】「何があったって言うんだい、全く…」`,'GabPeople1',7]);
    arrNpcGab1.push([`【青年】「騎士団長が何とかしてくれるさ！」`,'GabPeople1',2]);
    arrNpcGab1.push([`【少年】「ヒャ、ヒャハ～～………」`,'GabPeople1',0]);
  } else {
    if($gameVariables.value(135) >= 47){
      arrNpcGab1.push([`【中年男】「宰相が逆賊だったんだって？　オレは前から怪しいと──」`,'GabPeople1',4]);
      arrNpcGab1.push([`【老婆】「\\N[7]様がねぇ…、一体何だって………」`,'GabPeople1',7]);
    } else {
      arrNpcGab1.push([`【中年男】「最近盗賊が暴れてるんだって？　全く騎士団は何をしてるんだよ──」`,'GabPeople1',4]);
      arrNpcGab1.push([`【老婆】「最近は物騒な話ばっかりで嫌になるねぇ──」`,'GabPeople1',7]);
    };
    arrNpcGab1.push([`【青年】「コルブラント島は初めてかい？　この島は良い所だよ！」`,'GabPeople1',2]);
    arrNpcGab1.push([`【少年】「ヒャッハーーッ」`,'GabPeople1',0]);
  }
};
if($gameSwitches.value(242)  || $gameSwitches.value(276)){//王城、後半も
  if($gameVariables.value(135) >= 42){
    arrNpcGab1.push([`【団員】「制圧完了！」`,'GabPeople2',4]);
    arrNpcGab1.push([`【団員】「異常なし！」`,'GabActor1',7]);
  } else {
    arrNpcGab1.push([`【兵士】「異常ありません！」`,'GabPeople3',7]);
    arrNpcGab1.push([`【メイド】「これはお目汚しを。失礼致しました──」`,'GabPeople2',5]);
    arrNpcGab1.push([`【貴族】「フン。平民風情が城内を闊歩するなど。身の程をしれ──」`,'GabPeople3',4]);
    if($gameVariables.value(135) <= 49){
      arrNpcGab1.push([`【兵士】「何だってよそ者に討伐なんて(ﾌﾞﾂﾌﾞﾂ…)──」`,'GabPeople3',7]);
    };
  };
};
if($gameSwitches.value(261)){//秩序
  if($gameVariables.value(135) >= 100){
    arrNpcGab1.push([`【団員】「お、団長代理じゃねーか。相変わらずエロい身体してるぜ\\I[12]」`,'GabEroPeople1',1]);
    arrNpcGab1.push([`【団員】「ククク…──\\I[12]」`,'GabEroPeople1',4]);
  } else {
    arrNpcGab1.push([`【団員】「全空に、秩序を──！」`,'GabPeople2',4]);
    arrNpcGab1.push([`【団員】「全空に、秩序を──！」`,'GabActor1',7]);
  };
};
if($gameSwitches.value(281) && $gameSwitches.value(203)){//アウギュステ屋外
  arrNpcGab1.push([`【青年】「ここはアウギュステ。年中観光客で賑わってる島だよ──」`,'GabPeople4',2]);
  arrNpcGab1.push([`【少年】「ウキャキャキャーーーッ♪」`,'GabPeople1',0]);
  arrNpcGab1.push([`【宗教男】「母なる海を汚す者、汝この地より立ち去るべし──」`,'GabPeople4',6]);
  if($gameVariables.value(135) >= 32){
    arrNpcGab1.push([`【中年男】「例のクスリも下火になってきたみたいだな。助かる話だぜ」`,'GabPeople4',4]);
  } else {
    arrNpcGab1.push([`【中年男】「最近この街じゃ妙なクスリが出回ってるみたいでな…。アンタも気を付けなよ──」`,'GabPeople4',4]);
  }
  if($gameVariables.value(135) <= 32){
    arrNpcGab1.push([`【青年？】「オホ…、オホホホォォォゥゥゥッッ──\\I[12]」`,'GabEroPeople1',0]);
    arrNpcGab1.push([`【老人？】「儂は…神じゃったんか…、神、神、カミカミカミカミカァッハァァ──ッ\\I[12]」`,'GabEroPeople1',1]);
    arrNpcGab1.push([`【中年？】「アヘ\\I[12] ア、ヒハヒハ\\I[12]」`,'GabEroPeople1',3]);
  };
};
if($gameSwitches.value(282)){//浜辺
  arrNpcGab1.push([`【青年】「青い海、白い砂浜。完璧だッぜッ！！」`,'GabPeople1',2]);
  arrNpcGab1.push([`【頭アウギュステ】「やっぱり年に一度は此処にリゾートに来ないとね──」`,'GabActor2',2]);
  if($gameVariables.value(135) <= 32){
    arrNpcGab1.push([`【青年？】「オホ…、オホホホォォォゥゥゥッッ──\\I[12]」`,'GabEroPeople1',0]);
    arrNpcGab1.push([`【老人？】「儂は…神じゃったんか…、神、神、カミカミカミカミカァッハァァ──ッ\\I[12]」`,'GabEroPeople1',1]);
    arrNpcGab1.push([`【中年？】「アヘ\\I[12] ア、ヒハヒハ\\I[12]」`,'GabEroPeople1',3]);
  };
};
if($gameSwitches.value(301)){//ジュエルリゾート
  arrNpcGab1.push([`【少年】「ここに来ると、お父さん達が大はしゃぎするんだよね──」`,'GabPeople4',0]);
  arrNpcGab1.push([`【中年】「カジノで今月の家賃まで溶かしちゃった。テヘペロ\\I[12]」`,'GabPeople4',4]);
  arrNpcGab1.push([`【熟女】（無言で中年男のボディをサンドバックにしている…）`,'GabPeople4',5]);
};
if($gameSwitches.value(321) && $gameSwitches.value(203)){//犯罪都市屋外

};
if(isGirl($gameParty.battleMembers()[0])){//先頭キャラ女か。露出状態での発言
  rosyutu_wordChoiceNPC($gameParty.battleMembers()[0].actorId());
};

gabWord_exeScript(arrNpcGab1);

};
//露出限界判定時にnpc台詞設定
rosyutu_wordChoiceNPC = function(id1){

var arrNpcGab1 = [];
if($gameVariables.value(id1+380)[4] <= 90) {
  arrNpcGab1.push([`【中年男】「………………………（視線をこちらに固定しながら）」`,'GabEroPeople1',3]);
};
if($gameVariables.value(id1+380)[4] <= 50) {
  arrNpcGab1.push([`【青年】「（ニヤニヤ──\\I[12]）」`,'GabEroPeople1',0]);
  arrNpcGab1.push([`【青年】「ヒュゥ──\\I[12]」`,'GabEroPeople1',2]);
};
if($gameVariables.value(id1+380)[4] <= 25) {
  arrNpcGab1.push([`【青年】「エロい格好しやがって──\\I[12]」`,'GabEroPeople1',1]);
  arrNpcGab1.push([`【青年】「ヘッヘッヘ──\\I[12]」`,'GabEroPeople1',4]);
  arrNpcGab1.push([`【青年】（こちらをジっと見ながらポケットに入れた手を激しく動かしている…）`,'GabEroPeople1',5]);
  arrNpcGab1.push([`【青年】（こちらをジっと見ながらポケットに入れた手を激しく動かしている…）`,'GabEroPeople1',6]);
  arrNpcGab1.push([`【青年】（こちらをジっと見ながらポケットに入れた手を激しく動かしている…）`,'GabEroPeople1',7]);
};
if($gameVariables.value(id1+380)[4] <= 25 && $gameVariables.value(id1+380)[1] >= 500) {
  arrNpcGab1.push([`【青年】「オイオイ、あの秩序の女、また乳デカくなってんじゃねーの──\\I[12]」`,'GabEroPeople1',5]);
  arrNpcGab1.push([`【青年】「秩序秩序って、自分が一番秩序乱してんじゃね？」（←呆れ顔）`,'GabEroPeople1',6]);
  arrNpcGab1.push([`【青年】「慧漏いな…」`,'GabEroPeople1',7]);
};
gabWord_exeScript(arrNpcGab1);

};
//露出限界判定時に台詞設定
rosyutu_wordChoice = function(id1){

var actor = $gameActors.actor(id1);
var arr2 = [];
if(id1 == 2){
  var arr1 = [`「乙女にさせる格好では無いだろうが…っ」`,3,2];  arr2.push(arr1);
};
if(id1 == 1){
  if($gameVariables.value(id1+380)[4] >= 70) {
    var arr1 = [`「そ、その…、早く着替えましょう………」`,3,7];  arr2.push(arr1);
    var arr1 = [`「は、恥ずかしいんですけど………」`,3,4];  arr2.push(arr1);
  } else {
    var arr1 = [`「…巫山戯ないでくれませんか…！？」`,3,2];  arr2.push(arr1);
    var arr1 = [`「………」（←変質者を見る目）`,3,0];  arr2.push(arr1);
  };

  if($gameVariables.value(id1+440)[41] == 2){
    var arr1 = [`「…街中でする格好ではありませんよね…？」`,4,1];arr2.push(arr1);//水着
  };
  if($gameVariables.value(id1+440)[41] == 3){
    var arr1 = [`「…街中でする格好ではありませんよね…？」`,4,1];arr2.push(arr1);//メイド
  };
  if($gameVariables.value(id1+440)[41] == 99){
    var arr1 = [`「頭がおかしいんじゃ無いですか！！」`,3,3];arr2.push(arr1);//奴隷
    ensyutu_ikari(60,'Thunder9');
  };
  if(actor.isStateAffected(70)){
    var arr1 = [`「早く着替えましょう…！」`,3,5];arr2.push(arr1);//破損
  };
  if($gameVariables.value(id1+440)[0] >= 1){
    if($dataItems[$gameVariables.value($gameVariables.value(20)+440)[0]].meta['ClothType']){
      if($dataItems[$gameVariables.value($gameVariables.value(20)+440)[0]].meta['ClothType'] == '改'){
        var arr1 = [`「こんな破廉恥な恰好、秩序として受け入れられません！！」`,3,3];  arr2.push(arr1);//改造衣装
        ensyutu_ikari(60,'Thunder9');
  }}};

  if(actor.skillMasteryLevel(55) >= 3) {

  };
  if($gameSwitches.value(206) || $gameSwitches.value(213)){//露出開発度などで条件分岐
    var arr1 = [`「こんな破廉恥な恰好、秩序として受け入れられません！！」`,3,3];arr2.push(arr1);
  };
};
var array1 = arr2[Math.floor(Math.random() * arr2.length)];
$gameVariables.setValue(21,array1);

};

//作品ごとで変更させる個人プロフィール
production_separateSetProfile = function(id1){

if(id1 == 1){//リーシャ
var value1 = 
`気高く尊き秩序の蒼光纏う、若き騎空団団長（代理）。
全空でも有数の騎士を父に持ち、
自身も七光りでは終わらぬ才を持つ。
生真面目な気質で、事案の類には容赦が無い。\n`;
};
if(id1 == 2){//モニカ
var value1 = 
`剛勇鮮烈な武威の閃電煌めく、（実質的に）第四船団長。
一行の中では年長者であり、
年相応の落ち着きと研鑽を積んだ甘党系武闘派騎空士。
齢に相応しき外見になりたいが、諦めてもいる。\n`;
};
if(id1 == 3){//雄ドラフ
var value1 = 
`雄ドラフらしいマッスルが頼れるナイスガイ。
秩序の騎空団創設者とも轡を並べたベテラン騎空士。
秩序の騎空団内部でも信頼厚く、\\N[1]の
守役のような立ち位置。嫁さん募集中。\n`;
};
if(id1 == 4){//女ヒューマン
var value1 = 
`秩序の騎空団では若手に入る、実力派騎空士。
生きる為に汚れ仕事に手を染めていたが、
\\N[1]父のパーティにボコられて改心する。
以降は秩序の騎空士として優秀な戦果を挙げている。
カレシ募集中。\n`;
};
if(id1 == 5){//少年
var value1 = 
`賊によって家族と住む場所を失った薄幸の少年エルーン。
現在は秩序の騎空士見習いとして励んでいる。
その経緯から団長代理付きのような立場になっており、
\\N[1]に淡い思いを抱いている。
今作の不幸枠。\n`;
if($gameVariables.value(135) >= 49){
var value1 = 
`賊によって家族と住む場所を失った薄幸の少年エルーン。
現在は秩序の騎空士見習いとして励んでいる。
その経緯から団長代理付きのような立場になっており、
\\N[1]に淡い思いを抱いている。
今作の不幸枠、兼、疫病神。\n`;
};
};
if(id1 == 6){//糞ガキ
var value1 = 
`コルブラント王国に措いて由緒正しき血脈を
保つ名門伯爵家嫡男。\n`;
//value1 += //進行に応じて追加。
};
if(id1 == 7){//大臣
var value1 = 
`コルブラント王国の内政を一手に取り仕切る大臣。
辣腕と評判。\n`;
};

var actor = $gameActors.actor(id1);
actor.setProfile(value1);

};

//作品ごとで変更させる個人プロフィール
production_ChangeSetProfile = function(){

var actor = $gameActors.actor($gameVariables.value(20));
if($gameVariables.value(20) == 1){
  if(actor.isLearnedSkill(65)){
    var value1 = 
`致命的に狂った歯車は、秩序の女を一人の雌にした。
あの蒼光は、最早戻る事は無い。`;
  } else {
  if(actor.isLearnedSkill(64)){
    var value1 = 
`呵責無き凌辱の大火は、秩序に癒えぬ恥辱の痕を刻む。
不動の筈であった優先順位に僅かな瑕疵が現れ始め…。
心身より湧き上がる肉欲の疼きは
確実に\\set[1]を歪ませていく…。`;
  } else {
  if(actor.isLearnedSkill(62)){
    var value1 = 
`望まぬ穢れは秩序の光を貶め始めている…。
然れどその蒼光は未だ顕在なり。
しかし、薄暗がりを照らす彼女の光は人面獣心の徒を
惹きつけて已まないのも事実であろう…。`
  } else {
    var value1 = 
`生命活動の大半を＜秩序＞に捧げている弊害か、
性的な事物に疎い。男社会で育った弊害か無防備な面も。
団内では異性としての人気も高いのだが、
本人は気づいていない。`;
}}}};
//サブヒロインはスイッチで設定するかも？
if($gameVariables.value(20) == 2){
  if(actor.isLearnedSkill(65)){
    var value1 = 
`堕ちた武人は、夜な夜な男を口説き部屋へと連れ込む。
一夜の快楽に耽るため…。
その肉欲に狂わされている事を自覚しながら、
それでも抗えぬ欲求に屈するが故──。
`;
  } else {
  if(actor.isLearnedSkill(63)){
    var value1 = 
`淫欲に目覚めた武人は、男を欲し始める…。
その欲求は、逆らう術を、彼女は持たない…。`;
  } else {
  if(actor.isLearnedSkill(61)){
    var value1 = 
`忌まわしき呪縛は、秩序の騎空士が誇る女傑すら
狂わせた…。
未だ自覚こそ無いものの、
彼女は確かに道を踏み外そうとしている…。`
  } else {
    var value1 = 
`武家の出生である為か、外見に反比例して
硬い気質の持ち主。男女の由無し事からは縁遠い。
\\N[1]と団内女性人気を二分しているが、
彼女の場合は理解した上でスルーしている。`;
}}}};
actor.setProfile(value1);

};

//星晶獣パラメータの一律強化。MAxHPとMPが反映されない
seisyoujuu_addParamsAll = function(){

for (var i = 1; i <= valueArmorsLength; i++) {
  seisyoujuu_addParams(i);
};

};

//星晶獣パラメータの強化
seisyoujuu_addParams = function(i){

  if($dataArmors[i].etypeId == 6){
    if($dataArmors[i].meta['ItemPicture']){
      if($gameVariables.value(352)[i - valueSeisyoujuuStartId] >= 1){
        for (var j = 2; j <= 7; j++) {
          $dataArmors[i].params[j] = $gameVariables.value(352)[i - valueSeisyoujuuStartId] * 10;
  }}}};

};

//入手した星晶獣の一覧
seisyoujuu_select1 = function(){

valueCountSet3 = 0;
valueCountSet4 = 0;
$gameSwitches.setValue(380,false);
var value1 = 0;
valueItems = $dataArmors;
for (var i = 1; i <= valueArmorsLength; i++) {
  if(valueItems[i].etypeId == 6){
    if(valueItems[i].meta['ItemPicture']){
      valueCountSet3 += 1;
      if($gameParty.hasItem(valueItems[i],true)){
        value1 += 1;
        valueCountSet4 += 1;
}}}};
if(value1 >= 1){$gameSwitches.setValue(380,true)};

};

//入手した星晶獣の一覧valueCountSet1 = 0;
seisyoujuu_select2 = function(id1){

if(id1 == 0){
  for (let i = 100; i <= 205; i++) {$gameScreen.erasePicture(i)};
}
else if(id1 == 1){
  //valueItems = $dataArmors;
  //const value0 = 0;
  let value1 = 101;
  //const value2 = 'ScreenBlackOut';
  let value3 = 0;
  const txt = `\\I[508]星晶石入手率＜${valueCountSet4}/${valueCountSet3}＞`;
  const choiceParams = {
	  text: txt,
	  value: 0
  };
  let id = 1; 
  $gameSystem.addCustomChoice(id, choiceParams);
  value3 += 1;
  valueItems = $dataArmors;
  for (let i = 1; i <= valueArmorsLength; i++) {
	const item = valueItems[i];
    if(item.etypeId == 6){
	  const itemMeta = item.meta;
	  const itemPictureData = itemMeta['itemPictureData'];
      if(itemPictureData){
        if($gameParty.hasItem(item,true)){
          id = 1; 
          const choiceParams = {
			  text: `${item.name}:<${$gameVariables.value(352)[i - valueSeisyoujuuStartId]}>`,
			  value: i
		  };
          $gameSystem.addCustomChoice(id, choiceParams);
		  const itemPictureDataArr = itemPictureData.split(',');
          const value5 = Number(itemPictureDataArr[1]);
          
          let value6;
          let value7;
		  if(value5 >= 0){
            value6 = 50;
            value7 = 0;
          } else {
            value6 = 100;
            value7 = 200;
          };
		  
          const value2 = `/img/sv_enemies/Summon_${itemPictureDataArr[0]}`;
          $gameScreen.showPicture(value1,value2,1,640 + 200,384 + value5 - 150 + value7,value6,value6,0,0);
          $gameMessage.setSelectPictureId(value3, value1);
          if(itemMeta['summonDescription']){
            const summonDescription = itemMeta['summonDescription'];
            $gameScreen.setDTextPicture(summonDescription, 28);
            $gameScreen.dWindowFrame = 'ON';
            $gameScreen.showPicture(value1+1,'',0,10,606,100,100,0,0);
            $gameMessage.setSelectPictureId(value3, value1+1);
          };
          value1 += 2;
          value3 += 1;
  }}}};
};

};

kobetu_isyouSetOther = function(){

const gameVariables = $gameVariables;

gameVariables.setValue(20,3);
gameVariables.value(443)[5] = 1; // 443 = gameVariables.value(20)+440
tachie_settei3($gameActors.actor(3));

gameVariables.setValue(20,4);
gameVariables.value(444)[5] = 1;
tachie_settei3($gameActors.actor(4));

gameVariables.setValue(20,5);
let array = gameVariables.value(445);
array[5] = 1;//身体
array[7] = 1;//ペニス
array[23] = 1;//衣装
array[33] = 1;//表情
array[37] = 1;//髪型
tachie_settei3($gameActors.actor(5));

gameVariables.setValue(20,6);
array = gameVariables.value(446);
array[5] = 1;
array[7] = 1;
array[23] = 1;
array[33] = 1;
array[37] = 0;
tachie_settei3($gameActors.actor(6));

gameVariables.setValue(20,7);
array = gameVariables.value(447);
array[5] = 1;
array[7] = 1;
array[23] = 1;
array[33] = 1;
array[37] = 0;
tachie_settei3($gameActors.actor(7));

};

kobetu_isyousettei = function(){

var value1 = 460;
$gameVariables.setValue(value1+5,1);
var actor = $gameActors.actor($gameVariables.value(20));

if($gameVariables.value(20) == 1){

//表情オリジナルの49ドヤ顔を追加
//靴を27→16に設定
//場合によって帽子を37に設定

//スカート破損。影
if($gameVariables.value(value1+22) == 2){
  $gameVariables.setValue(value1+16,3);
};
//腰帯の影
if($gameVariables.value(value1+23) == 1){
  $gameVariables.setValue(value1+19,3);
};
//スカートの影。靴の設定よりも前
if([1,4].some(function(id){return $gameVariables.value(value1+22) == (id)}) ){
  $gameVariables.setValue(value1+16,1);
};

if($gameSwitches.value(97) || $gameParty.inBattle()){}else{ //立ち絵会話時と戦闘時にランダム表情変化を禁止する。
//平常時、確率でドヤ顔
  if([1,2,5,6,15].some(function(id){return $gameVariables.value(value1+33) == (id)})){
    var arr = [1,1,1,1,2,1,1,1];
    var value2 = arr[Math.floor(Math.random() * arr.length)];
    if(value2 == 2){
      $gameVariables.setValue(value1+33,53);
  }};
};

//メイドエプロン＋左腕股間隠し

if($gameVariables.value(value1+15) == 4 &&
  $gameVariables.value(value1+25) == 1){
  $gameVariables.setValue(value1+15,1);
};
//1帽子。深くかぶる。条件、未定
if($gameVariables.value(value1+32) == 2 && $gameVariables.value(value1+35) == 10){
  $gameVariables.setValue(value1+132,$gameVariables.value(value1+32));
  $gameVariables.setValue(value1+37,4);
  $gameVariables.setValue(value1+32,0);
  $gameVariables.setValue(value1+31,0);
};
//2帽子。アイマスケ時に16から27へ
if($gameVariables.value(value1+32) >= 1 && $gameVariables.value(value1+35) == 1){
  $gameVariables.setValue(value1+37,$gameVariables.value(value1+32));
};
//靴。奴隷衣装装備時に16から27へ
if($gameVariables.value(value1+20) == 11 && $gameVariables.value(value1+18) >= 1){
  $gameVariables.setValue(value1+27,$gameVariables.value(value1+18));
};
//靴。娼婦下着装備時に16から27へ
if($gameVariables.value(value1+20) == 10 && $gameVariables.value(value1+18) >= 1){
  $gameVariables.setValue(value1+27,$gameVariables.value(value1+18));
};
//バスタオルの肌影
if($gameVariables.value(value1+23) == 6 && !$gameVariables.value(value1+20) == 10 &&
!$gameVariables.value(value1+20) == 11){
  $gameVariables.setValue(value1+19,4);
};
//メイドエプロン1の肌影
if($gameVariables.value(value1+25) == 1 && !$gameVariables.value(value1+20) == 10 &&
!$gameVariables.value(value1+20) == 11){
  $gameVariables.setValue(value1+19,1);
};
//メイドエプロン2の肌影
if($gameVariables.value(value1+25) == 2 && $gameVariables.value(value1+20) == 0){
  $gameVariables.setValue(value1+19,2);
};
//メイドエプロン1が23に着用の時3に変更
if($gameVariables.value(value1+25) == 1 && $gameVariables.value(value1+23) == 4 &&
$gameVariables.value(value1+23) == 5){
  $gameVariables.setValue(value1+125,$gameVariables.value(value1+25));
  $gameVariables.setValue(value1+25,3);
};
//左腕股間露出時。衣装によって通常に
if($gameVariables.value(value1+21) == 11 || $gameVariables.value(value1+23) >= 1){
  $gameVariables.setValue(value1+15,1);
};
//秩序アームカバー左手
if($gameVariables.value(value1+17) == 1){
  $gameVariables.setValue(value1+26,2);
};
//メイドアームカバー左手
if($gameVariables.value(value1+17) == 2){
  $gameVariables.setValue(value1+26,3);
};
//腰帯、破損で裾
if($gameVariables.value(value1+23) == 1){
  $gameVariables.setValue(value1+3,1);
};
if($gameVariables.value(value1+23) == 2){
  $gameVariables.setValue(value1+3,2);
};
//1サーコート裾
if($gameVariables.value(value1+28) == 3){
  $gameVariables.setValue(value1+2,1);
};
//2サーコートでロング
if($gameVariables.value(value1+28) == 3 && $gameVariables.value(value1+4) == 1){
  $gameVariables.setValue(value1+104,$gameVariables.value(value1+4));
  $gameVariables.setValue(value1+4,2);
};
//3サーコートでポニテ
if($gameVariables.value(value1+28) == 3 && $gameVariables.value(value1+4) == 3){
  $gameVariables.setValue(value1+128,$gameVariables.value(value1+28));
  $gameVariables.setValue(value1+28,2);
  $gameVariables.setValue(value1+104,$gameVariables.value(value1+4));
  $gameVariables.setValue(value1+4,4);
};
//1破損サーコート裾
if($gameVariables.value(value1+28) == 4){
  $gameVariables.setValue(value1+2,2);
};
//ブラで乳房隠し1
if([4,5,11].some(function(id){return $gameVariables.value(value1+21) == (id)})){
  $gameVariables.setValue(value1+10,0);
};
//上衣で乳房隠し1
if([6].some(function(id){return $gameVariables.value(value1+23) == (id)})){
  $gameVariables.setValue(value1+10,0);
};
//左腕衣装1アームカバーで乳房露出時
if($gameVariables.value(value1+15) == 4 && $gameVariables.value(value1+26) == 2){
  $gameVariables.setValue(value1+26,1);
  $gameVariables.setValue(value1+15,0);
};
//右腕衣装1アームカバーで乳房露出時
if($gameVariables.value(value1+9) == 4 && $gameVariables.value(value1+17) == 1){
  $gameVariables.setValue(value1+117,$gameVariables.value(value1+17));
  $gameVariables.setValue(value1+24,1);
  $gameVariables.setValue(value1+17,0);
  $gameVariables.setValue(value1+9,6);
  $gameVariables.setValue(value1+10,1);
};
//武器を表示
if($gameVariables.value(value1+9) == 1){
  if(actor._equips[0]._itemId >= 1 && $gameSwitches.value(201) || $gameSwitches.value(239)){
    $gameVariables.setValue(value1+24,0);
    $gameVariables.setValue(value1+9,5);
    $gameVariables.setValue(value1+10,1);
}};
//秩序アームカバー時武器表示
if($gameVariables.value(value1+9) == 5 && $gameVariables.value(value1+17) == 1){
  $gameVariables.setValue(value1+30,1);
  $gameVariables.setValue(value1+30,2);
  $gameVariables.setValue(value1+9,6);
  $gameVariables.setValue(value1+10,1);
};

//透け条件
if(actor.isStateAffected(71)){
//水着トップ透ける
  if($gameVariables.value(value1+21) == 6){
    $gameVariables.setValue(value1+121,$gameVariables.value(value1+21));
    $gameVariables.setValue(value1+21,8);
  };
//秩序ショーツ透ける
  if($gameVariables.value(value1+20) == 1){
    $gameVariables.setValue(value1+120,$gameVariables.value(value1+20));
    $gameVariables.setValue(value1+20,2);
  };
//水着ボトム透ける
  if($gameVariables.value(value1+20) == 5){
    $gameVariables.setValue(value1+120,$gameVariables.value(value1+20));
    $gameVariables.setValue(value1+20,7);
  };
//タンクトップ透ける
  if($gameVariables.value(value1+21) == 4){
    $gameVariables.setValue(value1+121,$gameVariables.value(value1+21));
    $gameVariables.setValue(value1+21,5);
  };
//差分タンクトップ透ける
  if($gameVariables.value(value1+21) == 1){
    $gameVariables.setValue(value1+121,$gameVariables.value(value1+21));
    $gameVariables.setValue(value1+21,12);
  };
};

};

if($gameVariables.value(20) == 2){

//モニカ水着着用時局部隠し無効
if($gameVariables.value(value1+15) == 4 && $gameVariables.value(value1+21) == 3){
  $gameVariables.setValue(value1+15,1);
};
//モニカコート着用時局部隠し無効
if($gameVariables.value(value1+9) == 4 && $gameVariables.value(value1+23) >= 1){
  $gameVariables.setValue(value1+9,1);
};
//モニカコート着用時局部隠し無効
if($gameVariables.value(value1+9) == 4 && $gameVariables.value(value1+28) >= 2){
  $gameVariables.setValue(value1+9,1);
  $gameVariables.setValue(value1+15,1);
};
//モニカコート着用時局部隠し無効2
if($gameVariables.value(value1+15) == 4 && $gameVariables.value(value1+28) >= 2){
  $gameVariables.setValue(value1+9,1);
  $gameVariables.setValue(value1+15,1);
};
//腕カバー右手に反映
if($gameVariables.value(value1+17) >=  1){
  $gameVariables.setValue(value1+26,$gameVariables.value(value1+17));
};
//腕隠し時に腕カバー消去
if($gameVariables.value(value1+9) >= 2 ){
  $gameVariables.setValue(value1+117,$gameVariables.value(value1+17));
  $gameVariables.setValue(value1+124,$gameVariables.value(value1+24));
  $gameVariables.setValue(value1+17,0);
  $gameVariables.setValue(value1+24,0);
};
if($gameVariables.value(value1+15) >= 2 ){
  $gameVariables.setValue(value1+26,0);
};
//モニカ解禁シャツ時にインナーありで変化
if($gameVariables.value(value1+23) == 2 && [1,2].some(function(id){return $gameVariables.value(value1+21) == (id)})){
  $gameVariables.setValue(value1+123,$gameVariables.value(value1+23));
  $gameVariables.setValue(value1+23,4);
};
//シャツとインナー上で乳房非表示
if([1,2,3,4].some(function(id){return $gameVariables.value(value1+21) == (id)}) ||
[1,2].some(function(id){return $gameVariables.value(value1+23) == (id)}) ||
$gameVariables.value(value1+23) == 4){
  $gameVariables.setValue(value1+10,0);$gameVariables.setValue(value1+11,0);
};
//シャツ表示でインナー上非表示
if([1,2,4].some(function(id){return $gameVariables.value(value1+23) == (id)}) && 
$gameVariables.value(value1+21) >= 1 ){
  //$gameVariables.setValue(value1+121,$gameVariables.value(value1+21));
  //$gameVariables.setValue(value1+21,0);
};
//帽子被り時髪型に影
if($gameVariables.value(value1+32) == 2){
  $gameVariables.setValue(value1+31,3);
};
//コート着用時に手袋変更
if($gameVariables.value(value1+28) == 2 || $gameVariables.value(value1+28) == 3){
  if($gameVariables.value(value1+17) == 1){
    $gameVariables.setValue(value1+117,$gameVariables.value(value1+17));
    $gameVariables.setValue(value1+17,2);
    $gameVariables.setValue(value1+26,2);
}};
//コート着用時アームなしで落ち影
if($gameVariables.value(value1+28) >= 2){
  if($gameVariables.value(value1+17) == 0){
    $gameVariables.setValue(value1+117,$gameVariables.value(value1+17));
    $gameVariables.setValue(value1+17,4);
  };
  if($gameVariables.value(value1+26) == 0){
    $gameVariables.setValue(value1+26,4);
  };
};
//コート着用時にシャツスカートインナー上下なしで乳房丸出し発情時限定
if($gameVariables.value(value1+28) == 2 && $gameVariables.value(value1+21) == 0 &&
$gameVariables.value(value1+23) == 0){
  if(actor.isStateAffected(61)){
  $gameVariables.setValue(value1+128,$gameVariables.value(value1+28));
  $gameVariables.setValue(value1+28,3);
  };
};
//コートの裏地、肌影
if($gameVariables.value(value1+28) == 2 || $gameVariables.value(value1+28) == 3){
  $gameVariables.setValue(value1+3,1);
  $gameVariables.setValue(value1+16,1);
};

//武器を表示
if($gameVariables.value(value1+9) == 1){
if(actor._equips[0]._itemId >= 1 && $gameSwitches.value(201) || $gameSwitches.value(239)){
  $gameVariables.setValue(value1+2,1);
  $gameVariables.setValue(value1+9,5);
}};

//服上影服なしなら消去
if($gameVariables.value(value1+16) >= 1  && $gameVariables.value(value1+22) == 0){
    $gameVariables.setValue(value1+16,0);
};
//透け条件
if(actor.isStateAffected(71)){
//ボトムショーパン透ける
  if($gameVariables.value(value1+20) == 1){
    $gameVariables.setValue(value1+120,$gameVariables.value(value1+20));
    $gameVariables.setValue(value1+20,4);
  };
//タンクトップ透ける
  if($gameVariables.value(value1+21) == 1){
    $gameVariables.setValue(value1+121,$gameVariables.value(value1+21));
    $gameVariables.setValue(value1+21,7);
  };
//タンクトップ2透ける
  if($gameVariables.value(value1+21) == 2){
    $gameVariables.setValue(value1+121,$gameVariables.value(value1+21));
    $gameVariables.setValue(value1+21,8);
  };
//水着透ける
  if($gameVariables.value(value1+21) == 3){
    $gameVariables.setValue(value1+121,$gameVariables.value(value1+21));
    $gameVariables.setValue(value1+21,9);
  };
//シャツ透ける
  if($gameVariables.value(value1+23) == 2){
    $gameVariables.setValue(value1+123,$gameVariables.value(value1+23));
    $gameVariables.setValue(value1+23,5);
  };
};

};

};

//リーシャとモニカに露出状態でのキャラチップコート着用
isyou_senyouLisciaBlueOnly = function(id2){

if(id2 == 1){
  valueBustUpCloth2[id2] = valueBustUpCloth[id2];//バスト存在しない衣装がある場合ここで処理
  if($gameVariables.value(440 + id2)[28] == 3){
    if([20,21,22,23,25].every(function(id){return $gameVariables.value(440 + id2)[id] == 0})){
      $gameVariables.setValue(22,5);
      $gameVariables.setValue(23,5);
    };
    if($gameVariables.value(22) == 2){
      $gameVariables.setValue(22,6);
      $gameVariables.setValue(23,6);
    };
    if($gameVariables.value(22) == 3){
      $gameVariables.setValue(22,7);
      $gameVariables.setValue(23,7);
    };
  };
};
if(id2 == 2){
  valueBustUpCloth2[id2] = valueBustUpCloth[id2];
  if($gameVariables.value(440 + id2)[28] == 2){
    if([20,21,22,23,25].every(function(id){return $gameVariables.value(440 + id2)[id] == 0})){
      $gameVariables.setValue(22,5);
      $gameVariables.setValue(23,5);
    };
    if($gameVariables.value(22) == 2){
      $gameVariables.setValue(22,6);
      $gameVariables.setValue(23,6);
    };
    if($gameVariables.value(22) == 3){
      $gameVariables.setValue(22,7);
      $gameVariables.setValue(23,7);
    };
  };
};

if($dataActors[id2].meta['bustBlessNo']){valueBustUpCloth2[id2] = -1};//乳揺れ無いキャラ

};

//リザルト画像設定
actor_setBattleResult = function(){

var start = $gameVariables.value(73);
var end = $gameVariables.value(74);
for (var i = start; i <= end; i++) {
  if($gameParty.members().contains($gameActors.actor(i))){
    $gameVariables.value(380 + i)[66] = 0;
    if ($gameActors.actor(i).isLearnedSkill(65)) {
      $gameVariables.value(380 + i)[66] = 1;
    };
    if(i == 5 && $gameActors.actor(i)._classId == 25){
      $gameVariables.value(380 + i)[66] = 1;
    };
    if(i == 6 && $gameActors.actor(i).subclass()){
      if(gameActors.actor(i)._subclassId == 49){
        $gameVariables.value(380 + i)[66] = 1;
      };
    };
  };
};

};

//購入できる情報一覧作成
jouhou_buySetup = function(){

const id = 1; 
const choiceParams = {
text: '情報一覧',
value: -1};
$gameSystem.addCustomChoice(id, choiceParams);
for (var i = 1; i < $dataItems.length; i++) {
  var value1 = 0;
  var value4 = 0;
  if($dataItems[i].meta['BattleMapInformation']){
    if($dataItems[i].meta['SetJouhouVal']){
      var arr1 = $dataItems[i].meta['SetJouhouVal'].split(',');
      if(Number(arr1[0]) == 0){arr1[0] = 135};
      if($gameVariables.value(Number(arr1[0])) >= Number(arr1[1])){
        var value1 = 1;
    }};
    if($dataItems[i].meta['SetJouhouSwi']){
      var value2 = $dataItems[i].meta['SetJouhouSwi'];
      if(value2 == 0){var value2 = 2};
      if($gameSwitches.value(Number(value2))){
        var value1 = 1;
    }};
    if($gameParty.hasItem($dataItems[i],true)){
      var value1 = 2;
    };
    if($dataItems[i].meta['SetJouhouGold']){
      var value3 = Number($dataItems[i].meta['SetJouhouGold']);
      if($gameParty.gold() > value3){
        var value4 = 1;
    }};
    if(value1 == 1){
      var value5 = `${$dataItems[i].name}:${$dataItems[i].meta['SetJouhouGold']}\\G`;
      if(value4 == 0){value5 += `en(s[1])`};
      var value6 = i;
    } else {
      var value5 = `？？？en(s[1])`;
      var value6 = 0;
    };
    if(value1 < 2){
      const id = 1; 
      const choiceParams = {
      text: value5,
      value: value6};
      $gameSystem.addCustomChoice(id, choiceParams);
    };
}};

};

//寝起きピクチャ。作品共通でも行けるかも？
wakingup_pic = function(){

valuePic1 = 71;
var actor = $gameActors.actor($gameVariables.value(2));
if($gameSwitches.value(202) && $gameSwitches.value(204)){
  var value3 = 1;
  var value4 = Math.floor( Math.random() * 3) + 1;
  var value5 = Math.floor( Math.random() * 2) + 0;
  var value6 = 5;
  var arr1 = [8,8,8,11,8,8];var value7 = arr1[Math.floor(Math.random() * arr1.length)];
} else {
  var value3 = 2;
  var value4 = Math.floor( Math.random() * 2) + 2;
  var value5 = 2;
  var value6 = 5;
  var value7 = 9;
};
if(actor.isStateAffected(61)){
  var value5 = 4;
  var value6 = 6;
  var value7 = 12;
};
if(actor.isStateAffected(67)){
  var value5 = 3;
  var value6 = 7;
  var value7 = 10;
};
if($gameSwitches.value(465)){
  var value5 = Math.floor( Math.random() * 2) + 0;
  var value6 = 5;
  var arr1 = [8,8,8,11,8,8];var value7 = arr1[Math.floor(Math.random() * arr1.length)];
};
var value2 = 'Zev_WakingUp1_' + value3;
$gameScreen.showPicture(valuePic1,value2,1,640+384+128,384+50,100,100,0,0);
$gameScreen.movePicture(valuePic1,1,640+384+128,384,100,100,255,0,120);
var value2 = 'Zev_WakingUp2_' + value4;
$gameScreen.showPicture(valuePic1+1,value2,1,640+384+128,384+50,100,100,0,0);
$gameScreen.movePicture(valuePic1+1,1,640+384+128,384,100,100,255,0,120);
$gameScreen.setPicturesAnimation(13, 4, "連番", 8);
var value2 = 'Zev_WakingUp3_00';
$gameScreen.showPicture(valuePic1+2,value2,1,640+384+128,384+50,100,100,0,0);
$gameScreen.movePicture(valuePic1+2,1,640+384+128,384,100,100,255,0,120);
valueScriptArray1 = [value5+1,value6+1,value7+1];
$gameScreen.picture(valuePic1+2).cell = value5;

};

//宿泊時表示ピクチャvalue18 value21～
syukuhaku_pic = function(value12){

var actor = $gameActors.actor(value12);
var value14 = $gameVariables.value(value12+380)[4];
var array = [];
var value20 = 0;
if($gameSwitches.value(203)){
  var value20 = 2;
} else {
  var value20 = 1;
};
if(value20 >= 1){array.push("Zev_StaySleep0-" + value20)};
array.push("Zev_StaySleep1-1");
var value22 = 1;
if(actor.hpRate() <= 0.3){var value22 = 2};
if(actor.isStateAffected(61) || $gameSwitches.value(465)){var value22 = 3};
if(actor.isLearnedSkill(66)){
  for (var id = 0; id <= valueHstateDisplay.length-1; id++) {
    if(actor.isStateAffected(valueHstateDisplay[id])){
      var value22 = 4;
      break;
    };
  };
};
if(value22 >= 1){array.push("Zev_StaySleep2-" + value22)};
var value23 = 0;
if(value14 >= 49){
  var value15 = Math.floor( Math.random() * 4);
  if(value15 >= 2){var value23 = 1};
  if(value15 == 1){var value23 = 2};
  if(value15 == 0){var value23 = 3};
};
if(value23 >= 1){array.push("Zev_StaySleep3-" + value23)};
var value24 = 1;
if(actor.isStateAffected(67)){var value24 = 2};
var value16 = Math.floor( Math.random() * 10);
if(actor.isLearnedSkill(66)){value16 += 1};
if(actor.isLearnedSkill(67)){value16 += 1};
if(actor.isLearnedSkill(68)){value16 += 1};
if(actor.isLearnedSkill(69)){value16 += 1};
if(actor.isLearnedSkill(70)){value16 += 1};
if(value16 >= 8){var value24 = 0};
if(value24 >= 1){array.push("Zev_StaySleep4-" + value24)};
var value25 = Math.floor( Math.random() * 3);
if(value22 >= 4){var value25 = 0};
if(value25 >= 1){array.push("Zev_StaySleep5-" + value25)};

var value26 = 0;
if(value22 >= 4){var value26 = 1};//value22の判定を利用
if(value26 >= 1){array.push("Zev_StaySleep6-" + value26)};

var value10 = 1;
var value11 = Math.floor( Math.random() * 2);//ピクチャ表示時に中央1か左上0か
var value9 = Math.floor( Math.random() * 3) + 1;
if(value9 >= 2){var value10 = Math.floor( Math.random() * value9) + 1};
var value5 = 1600;var value6 = 1200;
var value7 = 1280;var value8 = 768;
var value13 = Math.floor( Math.random() * 2);
if(value13 >= 1){
  var value1 = value7/2+(value5*value10-value7)/2;//x始点。+で左
  var value2 = value8/2-(value6*value10-value8)/2;//y始点。-で下
  var value3 = value7/2-(value5-value7)/2;//x終点。-で右
  var value4 = value8/2+(value6-value8)/2;//y終点。+で上
} else {
  var value1 = value7/2-(value5*value10-value7)/2;//x始点。+で左
  var value2 = value8/2+(value6*value10-value8)/2;//y始点。-で下
  var value3 = value7/2+(value5-value7)/2;//x終点。-で右
  var value4 = value8/2-(value6-value8)/2;//y終点。+で上
};
var value17 = 50;//特定IDだけを透明にしたいけど出来なかった
var id1 = 51;
for (var id = 0; id <= array.length-1; id++) {
  $gameScreen.showPicture(id1,array[id],value11,value1,value2,100*value9,100*value9,value17,0);
  id1 += 1;
};
var value19 = 100;
var value18 = Math.floor( Math.random() * 2);
if(value18 >= 1){
  var value3 = value7/2;
  var value4 = value8/2;
var value19 = 80;
};
var id1 = 51;
for (var id = 0; id <= array.length-1; id++) {
  $gameScreen.movePicture(id1,1,value3,value4,value19,value19,255,0,240);
  id1 += 1;
};
if(value22 >= 4){
  AudioManager.playMe({"name":"21_Inn1","volume":50,"pitch":100,"pan":0});
} else {
  AudioManager.playMe({"name":"21_Inn2","volume":50,"pitch":100,"pan":0});
};

};

//作品オリジナルの演出に使用original_direct(1,0,0,0,0,0);没original_mainに引き抜いて使用
original_direct = function(id1,id2,id3,id4,id5,id6){

if(id1 == 1){//バハムート登場/退場
  var value1 = 61;
    var value2 = "/img/parallaxes/BattleField1_1";//仮パララックス名。
    $gameScreen.showPicture(value1,value2,1,640,384,100,100,0,0);
    $gameScreen.movePicture(value1,1,640,384,100,100,250,0,60);
    hcg_piston(value1,5,1);
    var value2 = 'TachieMonster1';//仮ピクチャ名。
    $gameScreen.showPicture(value1+1,value2,1,640-400,384+100,-100,100,0,0);
    $gameScreen.movePicture(value1+1,1,640-200,384+100,-100,100,255,0,60);
    hcg_piston(value1+1,5,1);
    if($gameParty.inBattle()){
      valueWordSet10 = 'battleWeather';
    } else {
      valueWordSet10 = 'weather';
    };
    var value1 = 'stardust_w';
    $gameScreen._particle.particleSet(0,value1,valueWordSet10,'def','screen');
    var value1 = 'thunder_w';
    $gameScreen._particle.particleSet(0,value1,valueWordSet10,'def','screen');
};
if(id1 == 2){//バハムート登場/退場
  var value1 = 61;
    $gameScreen.erasePicture(value1);
    $gameScreen.erasePicture(value1+1);
    var value1 = 'stardust_w';
    $gameScreen._particle.particleClear(value1);
    var value1 = 'thunder_w';
    $gameScreen._particle.particleClear(value1);
};
if(id1 == 3){//オーラ処理。original_direct(3,this._eventId,1,0,0,0);
  var value1 = 'aura_static_b';
  $gameScreen._particle.particleSet(String(id2),value1 + '-' + id2,'this',value1,'99');
  $gameScreen._particle.particleUpdate([value1 + '-' + id2,'alpha','0','0.7@0.5','0']);
  $gameScreen._particle.particleUpdate([value1 + '-' + id2,'blendMode','1']);
  $gameScreen._particle.particleUpdate([value1 + '-' + id2,'scale','0','0.6']);
  $gameScreen._particle.particleUpdate([value1 + '-' + id2,'lifetime','1.1','1.1']);
  if(id3 == 1){$gameScreen._particle.particleUpdate([value1 + '-' + id2,'color','#ffffff','#00eeff'])};//リーシャ
  if(id3 == 2){$gameScreen._particle.particleUpdate([value1 + '-' + id2,'color','#ffffff','#f2ff00'])};//モニカ
  $gameScreen._particle.particleUpdate([value1 + '-' + id2,'pos',0,-20]);
};
if(id1 == 4){//オーラ処理終了
  var value1 = 'aura_static_b'+'-'+id2;
  $gameScreen._particle.particleClear(value1);
};
if(id1 == 5){//少年暴走ベルセルクoriginal_direct(5,this._eventId,0,0,0,0);
  var value1 = 'magic_circle_c2';
  var arr1 = [String(id2),'this','99'];
  $gameScreen._particle.particleSet(arr1[0],value1 + '-' + id2,arr1[1],value1,arr1[2]);
  var value1 = 'monster_c';
  var arr1 = [String(id2),'this','99'];
  $gameScreen._particle.particleSet(arr1[0],value1 + '-' + id2,arr1[1],value1,arr1[2]);
  var value1 = 'mysterious_torch_c';
  var arr1 = [String(id2),'this','99'];
  $gameScreen._particle.particleSet(arr1[0],value1 + '-' + id2,arr1[1],value1,arr1[2]);
};
if(id1 == 6){//少年暴走ベルセルク終了
  var value1 = 'magic_circle_c2'+'-'+id2;
  $gameScreen._particle.particleClear(value1);
  var value1 = 'monster_c'+'-'+id2;
  $gameScreen._particle.particleClear(value1);
  var value1 = 'mysterious_torch_c'+'-'+id2;
  $gameScreen._particle.particleClear(value1);
};

};

//作品オリジナルの移動禁止処理
original_stopMoveSwi = function(){

var arr3 = [$gameSwitches.value(1),$gameSwitches.value(1)];
var arr4 = [!$gameSwitches.value(2),!$gameSwitches.value(2)];
var arr5 = [[18,14,42],[18,14,42]];
var arr6 = [[1,1,`今は先に行くところがあります`],[1,1,`今は先に行くところがあります`]];
for (var i = 0; i < arr3.length; i++) {
  if(arr3[i] && arr4[i]){
    $gameSwitches.setValue(434,true); 
    var arr1 = arr4[i]; 
    var arr2 = [$gameMap.mapId(),$gamePlayer._realX,$gamePlayer._realY];
    if(arr1[0] == arr2[0]){
      if(arr1[1] == arr2[1] || arr1[1] == arr2[1]+1 || arr1[1] == arr2[1]-1){
        if(arr1[2] == arr2[2] || arr1[2] == arr2[2]+1 || arr1[2] == arr2[2]-1){
          $gameSwitches.setValue(434,false); 
          $gameVariables.setValue(21,arr6[i][2]);
}}}}};

};

//作品オリジナルのスイッチや変数の自動切換え。メインクエスト変数。今のところ使用しない
original_autoEventFlag = function(){
/*:
if($gameVariables.value(135) == 1 && $gameMap.mapId() == 28){
  $gameSwitches.setValue(522,true);
};

};

var actor = $gameActors.actor($gameVariables.value(20));
if(actor.isStateAffected(61)){
if(actor.isLearnedSkill(10)){
if([0,1].some(function(id){return $gameSwitches.value(id)})){
if($gameSwitches.value(1)){
if($gameVariables.value(20) >= 1){
$gameSwitches.setValue(1,true);
$gameVariables.setValue(21,0);
*/
};

//作品オリジナルのテキスト作成
original_text = function(id100,id101){
	
let tip;
switch(id100){
	case 1:
		tip = new Tip1();
		break;
	case 2:
		tip = new Tip2();
		break;
	case 3:
		tip = new Tip3();
		break;
	case 4:
		tip = new Tip4();
		break;
	case 5:
		tip = new Tip5();
		break;
	case 6:
		tip = new Tip6();
		break;
	case 7:
		tip = new Tip7();
		break;
	case 8:
		tip = new Tip8();
		break;
	case 9:
		tip = new Tip9();
		break;
	case 10:
		tip = new Tip10();
		break;
	case 11:
		tip = new Tip11();
		break;
	case 12:
		tip = new Tip12();
		break;
	case 13:
		tip = new Tip13();
		break;
	case 14:
		tip = new Tip14();
		break;
	case 15:
		tip = new Tip15();
		break;
	case 16:
		tip = new Tip16();
		break;
	case 17:
		tip = new Tip17();
		break;
	case 18:
		tip = new Tip18();
		break;
	case 19:
		tip = new Tip19();
		break;
	case 20:
		tip = new Tip20();
		break;
	case 21:
		tip = new Tip21();
		break;
	case 22:
		tip = new Tip22();
		break;
	case 23:
		tip = new Tip23();
		break;
	case 24:
		tip = new Tip24();
		break;
	case 25:
		tip = new Tip25();
		break;
	case 26:
		tip = new Tip26();
		break;
	case 27:
		tip = new Tip27();
		break;
}

tip.execute();

};

//作品オリジナルのメインシーンピクチャやキャラグラ移動等処理。全てid直接入力
original_main = function(id100,id101){

id100 = id100 - 300;
if(id100 == 1){//リーシャ登場。戦闘シーン
  valuePic1 = 51;
  valueScenePic = 'ZX_Main000_';
 switch (id101) {
  case 1: {
    $gameScreen.showPicture(valuePic1,'ScreenBlackOut',1,640,384,100,100,0,0);
    pic_1(1,valuePic1+2,valueScenePic+'01',6,100,255,120,1280,768,0,0);
    $gameScreen.showPicture(valuePic1+3,'ScreenBlackOut',1,640,384,100,100,0,0);
    $gameScreen.setPicturesAnimation(2, 10, "連番", 60);
    $gameScreen.showPicture(valuePic1+4,valueScenePic+'02_00',1,640,384 - (1390-768) / 2,100,100,0,0);
    $gameScreen.showPicture(valuePic1+10,'ScreenConcentratedLineWidthBackGraund',1,640,384,100,100,0,0);
    $gameScreen.showPicture(valuePic1+12,valueScenePic+'03',1,(640 - (1500-1280) / 2)-1000,384,500,500,0,0);
    $gameScreen.movePicture(valuePic1,1,640,384,100,100,200,0,60);
    tachie_bless(valuePic1+4,1);
	break;
  }
  case 2: {
    adv_partDirectSet(3);
    pic_move1(valuePic1+3,0,0,100,100,200,10);
    pic_move1(valuePic1+4,0,0,100,100,200,10);
    if($gameScreen.picture(valuePic1+4)){
      $gameScreen.picture(valuePic1+4).startAnimationFrame(1, true, [1,1,1,2]);
    }
	break;
  }
  case 3: {
    const value1 = $gameScreen.picture(valuePic1+4).y();
    pic_move1(valuePic1+4,0,(384 + (1390-768)/2)-value1,100,100,255,600);
  }
  case 4: { 
	parallax_scroll(valuePic1+5,'ScreenConcentratedLineWidthBackGraund',0,20,20,0,255); 
	break; 
  }
  case 5: {
    pic_move1(valuePic1+10,0,0,100,100,255,60);
    const value1 = $gameScreen.picture(valuePic1+12).x();
    pic_move1(valuePic1+12,(640 + (1500-1280) / 2) - value1,0,100,100,255,40);
    //パララックスで4と残像で1
    filter_direct(10,10,10,20);
	break;
  }
  case 6: { pic_move1(valuePic1+12,-200,0,100,100,0,40); break; }
  case 7: { //地面黒塗りと残像作成
    $gameMap.spawnEvent(146, 25, 35, true);
    $gameVariables.value(292)[13] = $gameMap.getLastSpawnEventId();
    let eventId = $gameVariables.value(292)[13];
    const event = $gameMap.event(eventId);
    event.setOpacity(200);
    eventId = $gameVariables.value(292)[$gameVariables.value(530)];
    let value1 = 'monster_c';
    $gameScreen._particle.particleSet('attach:event:'+eventId,value1+'-'+eventId,'this',value1);
    $gameScreen._particle.particleUpdate([value1,'color','#007dff','#66b1ff']);
    value1 = 'monster_c'+'-'+eventId;
    $gameScreen._particle.particleClear(value1);
	break;
  }
 }
}
// if(id100 == 1){
  // if(id101 == 1){

  // }
  // if(id101 == 2){

  // }
// }
// if(id100 == 1){
  // if(id101 == 1){

  // }
  // if(id101 == 2){

  // }
// }

}

get_id100_if_zero = function(id100, x){
	if(id100 > 0) return id100;
	
	const var535 = $gameVariables.value(535);
	if(var535 >= x + 1 && var535 <= x + 100){
		return var535 - x;
	}
	
	return id100;
}

//作品オリジナルのピクチャ挿話やキャラグラ移動等処理。401-600以外は直接コモンid入力
original_souwa = function(id100,id101){

id100 = get_id100_if_zero(id100, 400);

if(id100 == 31){//秩序の酒場に不良団員npc2人と酒とつまみを生成。id11-15まで使用
  if(id101 == 1){
    let value1 = 11;
    event_respawnSetN(value1,16,15,0,'npcOrder2',0);
    let event = $gameMap.event($gameVariables.value(292)[value1]);
    event.setDirection(4);
	
    value1 = 12;
    event_respawnSetN(value1,13,15,0,'npcOrder2',3);
    event = $gameMap.event($gameVariables.value(292)[value1]);
    event.setDirection(6);
	
    value1 = 13;
    goodsEvent_respawn(value1,'food_2',1,4,2,15,15);
    event = $gameMap.event($gameVariables.value(292)[value1]);
    event._spriteOffsetX = 25;
    event._spriteOffsetY = 10;
    event._priorityType = 2;
	
    value1 = 14;
    goodsEvent_respawn(value1,'food_2',3,6,0,14,15);
    event = $gameMap.event($gameVariables.value(292)[value1]);
    event._spriteOffsetX = -25;
    event._spriteOffsetY = 10;
    event._priorityType = 2;
	
    value1 = 15;
    goodsEvent_respawn(value1,'food_1',0,4,0,15,15);
    event = $gameMap.event($gameVariables.value(292)[value1]);
    event._spriteOffsetX = -24;
  };
};
// if(id100 == 1){
  // if(id101 == 1){

  // };
  // if(id101 == 2){

  // };
// };
// if(id100 == 1){
  // if(id101 == 1){

  // };
  // if(id101 == 2){

  // };
// };

};

//作品オリジナルのピクチャシーンやキャラグラ移動等処理。401-600以外は直接コモンid入力
original_scene = function(id100,id101){ //original_scene(0,1);//テストの際は変数535にid入力

id100 = get_id100_if_zero(id100, 500);

if(id100 == 11){//Ｈな診察
  if(id101 == 1){
    backGraund_menuMapSelect(2,0,0,0);
    valuePic1 = 51;
    valueScenePic = 'XevS011_';
    $gameScreen.showPicture(valuePic1,valueScenePic+'00',1,640-128,384,100,100,0,0);
    $gameScreen.showPicture(valuePic1+1,'ScreenDarkCloudsH',1,640-256,384,100,100,0,0);
    $gameScreen.setPicturesAnimation(6, 30, "連番", 60);
    $gameScreen.showPicture(valuePic1+2,valueScenePic+'02_00',1,640-128,384-50,100,100,0,0);
    $gameScreen.showPicture(valuePic1+11,valueScenePic+'11',1,640-128,384,100,100,0,0);
    $gameScreen.setPicturesAnimation(5, 30, "連番", 60);
    $gameScreen.showPicture(valuePic1+12,valueScenePic+'12_00',1,640-128,384+200,100,100,0,0);
    $gameScreen.setPicturesAnimation(2, 15, "連番", 30);
    $gameScreen.showPicture(valuePic1+13,valueScenePic+'13_00',1,640-128,384-(1732/2)+(768/2)+100,100,100,0,0);
    $gameScreen.setPicturesAnimation(2, 30, "連番", 60);
    $gameScreen.showPicture(valuePic1+15,valueScenePic+'14_00',1,640-128,384+50,100,100,0,0);
    pic_move1(valuePic1,0,0,100,100,255,90);
    pic_move1(valuePic1+11,0,0,100,100,255,90);
    tachie_bless(valuePic1+2,1);
    valuePicWait2 = 60;
  }
  else if(id101 == 2){ pic_move1(valuePic1+12,0,-200,100,100,255,180);valuePicWait2 = 120; }
  else if(id101 == 3){ pic_move1(valuePic1+2,0,50,100,100,255,180);valuePicWait2 = 60; }
  else if(id101 == 4){ $gameScreen.startAnimation(520, 680, 179, false) }
  else if(id101 == 5){ 
	const picId = valuePic1+12;
	if($gameScreen.picture(picId)){
		$gameScreen.picture(picId).addCellCount()} 
	}
  else if(id101 == 6){
    const picId = valuePic1+2;
    if($gameScreen.picture(picId)){$gameScreen.picture(picId).addCellCount()}
    pic_move1(valuePic1+11,0,0,100,100,0,60);
    pic_move1(valuePic1+12,0,0,100,100,0,60);
    pic_move1(valuePic1+1,0,0,100,100,200,120);
    picture_fade1(valuePic1+1,"fadeIn",'Hscene005',120,5);
  }
  else if(id101 == 7){
    pic_move1(valuePic1+13,0,0,100,100,255,120);
    pic_move1(valuePic1+15,0,-50,100,100,255,120);
    valuePicWait2 = 120;
  }
  else if(id101 == 8){
    pic_setArray1 = [1,valuePic1+13,0,384+(1732/2)-(768/2)+100,5,1200];
    pic_setArray2 = [1,0,0,0,0,0];
    valueParallelPicSe1 = [0,0,0];
    valueParallelPicSe2 = [0,0,0];
    hcg_piston(valuePic1+13,8,1,2);
    $gameSwitches.setValue(429,true);
    const picId = valuePic1+15;
    if($gameScreen.picture(picId)){$gameScreen.picture(picId).addCellCount()}
    valuePicWait2 = 60;
  }
  else if(id101 == 9){
    $gameSwitches.setValue(429,false);
    valueParallelPicSe1 = [0,0,0];
    valueParallelPicSe2 = [0,0,0];
    pic_setArray(0,0,0,0,0,0);
    picture_motion1("smooth",[0]);
  }
  else if(id101 == 10){
    pic_move1(valuePic1,0,0,200,200,255,60);
    pic_move1(valuePic1+1,0,0,100,100,0,60);
    pic_move1(valuePic1+13,0,0,100,100,0,60);
    pic_move1(valuePic1+15,0,0,100,100,0,60);
    valuePicWait2 = 60;
  }
  else if(id101 == 11){ 
    pic_move1(valuePic1,0,0,100,100,255,60);
    const picId = valuePic1+2;
	if($gameScreen.picture(picId)){
		$gameScreen.picture(picId).addCellCount()
	}
    pic_move1(valuePic1+11,0,0,100,100,255,60);
    pic_move1(valuePic1+12,0,0,100,100,255,60);
  }
  else if(id101 == 12){ pic_move1(valuePic1+12,0,+200,100,100,255,180);valuePicWait2 = 120; }
  else if(id101 == 90){//2と3の間に仕様
    pic_move1(valuePic1,0,0,25,25,150,60);
    pic_move1(valuePic1+11,0,0,25,25,150,60);
    pic_move1(valuePic1+11,0,0,25,25,150,60);
    valuePicWait2 = 60;
  }
  else if(id101 == 91){//2と3の間に仕様
    pic_move1(valuePic1,0,0,100,100,255,60);
    pic_move1(valuePic1+11,0,0,100,100,255,60);
    pic_move1(valuePic1+11,0,0,100,100,255,60);
  }
}
// if(id100 == 1){
  // if(id101 == 1){

  // }
  // if(id101 == 2){

  // }
// }
// if(id100 == 1){
  // if(id101 == 1){

  // }
  // if(id101 == 2){

  // }
// }
else if(id100 == 100){//モニカマッサージ,id1とid2。
  valuePic1 = 51;
  if(id101 == 1){
    AudioManager.playBgs({"name":"21_HandyMassager1","volume":50,"pitch":100,"pan":0});
    let picName = 'XevS101_00back';
    pic_1(0,valuePic1,picName,0,100,255,60,1280,768,-256,0);
    picName = 'XevS101_00back2';
    pic_1(0,valuePic1+1,picName,0,100,255,60,1280,768,-256,0);
    picName = 'XevS101_01';
    pic_1(0,valuePic1+2,picName,0,100,255,60,1280,768,-256,0);
    picName = 'XevS101_01face1';
    pic_1(0,valuePic1+6,picName,0,100,255,60,1280,768,-256,0);
    picName = 'XevS101_01_100';
    picture_anime1(valuePic1+7,picName,5,1,"連番",15,3,true,[2,3,4,5]);
    $gameScreen.picture(valuePic1+7)._x = 640-128;
    $gameScreen.movePicture(valuePic1+7,1,640-128,384,100,100,200,0,60);
    picture_anime1(valuePic1+8,picName,5,1,"連番",20,3,true,[4,5,2,3]);
    $gameScreen.picture(valuePic1+8)._x = 640-128;
    $gameScreen.movePicture(valuePic1+8,1,640-128,384,100,100,100,0,60);
    for (let i = valuePic1+1; i <= valuePic1+8; i++) { hcg_piston(i,5,1,2) }
  }
  else if(id101 == 2){//ピストンしている時に表情変化させる場合、身体も更新する。振動が同期しないため
    AudioManager.playBgs({"name":"21_HandyMassager1","volume":60,"pitch":120,"pan":0});
    let picName = 'XevS101_01';
    pic_1(2,valuePic1+2,picName,0,100,255,1,1280,768,-256,0);
    picName = 'XevS101_01face2';
    pic_1(2,valuePic1+6,picName,0,100,255,1,1280,768,-256,0);
    picName = 'XevS101_02_100';
    picture_anime1(valuePic1+7,picName,5,1,"連番",5,3,true,[0,2,3,4,5]);
    $gameScreen.picture(valuePic1+7)._x = 640-128;
    $gameScreen.movePicture(valuePic1+7,1,640-128,384,100,100,200,0,60);
    picture_anime1(valuePic1+8,picName,5,1,"連番",10,3,true,[0,4,5,2,3]);
    $gameScreen.picture(valuePic1+8)._x = 640-128;
    $gameScreen.movePicture(valuePic1+8,1,640-128,384,100,100,100,0,60);
    for (let i = valuePic1+1; i <= valuePic1+8; i++) { hcg_piston(i,5,3,2) }
  }
  else if(id101 == 3){
    pic_eraseP(2,[valuePic1+2]);
    let picName = 'XevS101_02';
    pic_1(2,valuePic1+3,picName,0,100,255,1,1280,768,-256,0);
    picName = 'XevS101_01face3';
    pic_1(2,valuePic1+6,picName,0,100,255,1,1280,768,-256,0);
    picName = 'XevS101_03_100';
    picture_anime1(valuePic1+9,picName,4,1,"連番",5,3,true,[3,1,5,1]);
    $gameScreen.picture(valuePic1+9)._x = 640-128;
    $gameScreen.movePicture(valuePic1+9,1,640-128,384,100,100,255,0,10);
    picture_anime1(valuePic1+10,picName,4,1,"連番",5,3,true,[1,2,1,4]);
    $gameScreen.picture(valuePic1+10)._x = 640-128;
    $gameScreen.movePicture(valuePic1+10,1,640-128,384,100,100,255,0,10);
    for (let i = valuePic1+1; i <= valuePic1+8; i++) { hcg_piston(i,5,3,2) }
    for (let i = valuePic1+9; i <= valuePic1+10; i++) { hcg_piston(i,5,3,1) }
  }
  else if(id101 == 4){//id3が+50,-250,-500,+50,id4が200,300
    for (let i = valuePic1; i <= valuePic1+10; i++) {
      if($gameScreen.picture(i)){
        const picOpacity = $gameScreen.picture(i).opacity();
        $gameScreen.movePicture(i,1,640,384+id3,id4,id4,picOpacity,0,120);
      }
    }
  }
  else if(id101 == 5){
    pic_1(0,valuePic1,'XevS101_04back',0,100,255,120,1280,768,0,0);
    pic_1(0,valuePic1+1,'XevS101_04',0,100,255,120,1280,768,0,0);
    hcg_piston(valuePic1+1,5,1,2);
  }
  else if(id101 == 6){
    const arr1 = [];
    for (let i = valuePic1; i <= valuePic1+11; i++) {
      arr1.push(i);
    }
    pic_eraseP(0,arr1);
  }
  else if(id101 == 7){
    AudioManager.fadeOutBgs(10);
    for (let i = valuePic1; i <= valuePic1+10; i++) {
      if($gameScreen.picture(i)){
        pic_move1(i,0,0,300,300,0,120);
      }
    }
  }
  else if(id101 == 8){
    AudioManager.playBgs({"name":"21_HandyMassager1","volume":60,"pitch":120,"pan":0});
    for (let i = valuePic1; i <= valuePic1+10; i++) {
      if($gameScreen.picture(i)){
        pic_move1(i,0,0,300,300,255,60);
      }
    }
  }
  else if(id101 == 9){
    pic_1(0,valuePic1+2,'XevS101_05',2,100,255,60,1280,768,0,0);
    hcg_piston(valuePic1+2,5,1,2);
  }
}

}

//}());
