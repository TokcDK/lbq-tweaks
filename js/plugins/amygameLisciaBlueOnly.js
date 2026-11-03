/*:
* @plugindesc このゲーム専用プラグイン
* @author 作者名
* @help ゲーム専用に作成された初期読み込み用プラグイン
*/
//(function(){

//#region original_tips
// 書籍(Tips)の共通処理。seName / var172value の既定値はここに置き、
// サブクラスは差分がある時だけ上書きする。
class BookTipBase {
  constructor() {
  }

  seName() {
    return "Book2";
  }

  var172value() {
    return 2;
  }

  bookTitle() {
    throw new Error("bookTitle method should be implemented");
  }

  bookDescription() {
    throw new Error("bookDescription method should be implemented");
  }

  playSound() {
    AudioManager.playSe({ "name": this.seName(), "volume": 100, "pitch": 100, "pan": 0 });
  }

  setGameVariable() {
    $gameVariables.setValue(172, this.var172value());
  }

  setValueTalkSet() {
    const talkLayout = [0, 1, 640, 384, 100, 100, 255];
    valueTalkSet = [this.bookTitle(), this.bookDescription(), talkLayout];
  }

  execute() {
    this.playSound();
    this.setGameVariable();
    this.setValueTalkSet();
  }
}

class Tip1 extends BookTipBase {//
  bookTitle() {
    return `朽ちた星晶獣の権能復元計画`;
  }
  bookDescription() {
    return `\\swi[247]の協力者から持ち込まれた情報を元に
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
}

class Tip2 extends BookTipBase {//<淫統薬>インデュ・アビス
  bookTitle() {
    const weaponName = $dataWeapons[452].name;
    return `${weaponName}─その１─`;
  }
  bookDescription() {
    return `コルブラント島でその断片を確保した星晶獣、
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
}

class Tip3 extends BookTipBase {//<淫統薬>インデュ・アビス
  bookTitle() {
    const weaponName = $dataWeapons[452].name;
    return `${weaponName}─その３─`;
  }
  bookDescription() {
    return `
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
}

class Tip4 extends BookTipBase {//<試薬品>インデュルゲンス・リキッド
  bookTitle() {
    const weaponName = $dataWeapons[453].name;
    return `${weaponName}`;
  }
  bookDescription() {
    return `開発された\\wn[452]の試作品。
正式採用となった薬品と比較すると、
必要な摂取量などが問題となり開発中止となった。
しかし、効能についてはより大元となる星晶獣の
権能に近いものがあるのが特徴。

\\swi[247]宰相を通じて、同派閥貴族達に
生産された一部が流出されている事が判明している。

『〇〇〇〇帝国研究開発部の業務日報』より抜粋`;
  }
}

class Tip5 extends BookTipBase {//<淫紋>アビス・クレスト使用ずみ
  bookTitle() {
    const weaponName = $dataWeapons[454].name;
    return `${weaponName}`;
  }
  bookDescription() {
    return `触手型魔物である「\\wn[455]」が使う、
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
}

class Tip6 extends BookTipBase {//<淫統光>HMD型インデュ・アビス.使用ずみ
  seName() {
    return "Chime2";
  }

  bookTitle() {
    const weaponName = $dataWeapons[457].name;
    return `${weaponName}`;
  }
  bookDescription() {
    return `服薬が必要な\\wn[452]に対して、
光学的なアプローチを用いた試作魔導開発品。
網膜に淫統作用を持った光を照射する事で、
脳に直接効果を与える事が可能。

国土に配備した照射機で齎される、
「光」を照らすだけで民を支配する事を目標としているが、
現状では専用のヘッドマウントディスプレイを用いる必要がある。

現在はまだ試験中であり、実験レポートが求められている。

『エルステ帝国研究開発部の成果発表レポート』より抜粋`;
  }
}

class Tip7 extends BookTipBase {//<アビス・クレスト>と<インデュ・アビス>使用ずみ
  seName() {
    return "Chime2";
  }

  bookTitle() {
    const weaponName = $dataWeapons[458].name;
    return `${weaponName}`;
  }
  bookDescription() {
    return `両者には根幹技術に措いて同様の手法が用いられている
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
}

class Tip8 extends BookTipBase {//使用済み
  bookTitle() {
    const weaponName = $dataWeapons[80].name;
    return `${weaponName}`;
  }
  bookDescription() {
    return `数年前よりコルブラント島に出没するようになった空賊団。
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
}

class Tip11 extends BookTipBase {//<星晶獣>インペリウム・グノーシス。使用ずみ
  bookTitle() {
    const weaponName = $dataWeapons[451].name;
    return `${weaponName}`;
  }
  bookDescription() {
    return `コルブラント島で存在を確認された星晶獣。
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
}

class Tip12 extends BookTipBase {//<星晶獣>インペリウム・グノーシス
  seName() {
    return "Chime2";
  }

  var172value() {
    return 3;
  }
  bookTitle() {
    const weaponName = $dataWeapons[451].name;
    return `${weaponName}─その２─`;
  }
  bookDescription() {
    return `既にその存在は朽ち果て、遺骸は大森林の地下深くに埋没している。
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
}

class Tip13 extends BookTipBase {//「インペルの神水」使用済み
  seName() {
    return "Chime2";
  }

  bookTitle() {
  const itemName = $dataItems[1162].name;
  const weaponName = $dataWeapons[460].name;
    return `${itemName} またの名を「${weaponName}」`;
  }
  bookDescription() {
    return `中央森林で汲み取れる湧き水。
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
}

class Tip14 extends BookTipBase {//支配の結石使用済み
  seName() {
    return "Chime2";
  }

  bookTitle() {
    return `${$dataItems[1163].name}`;
  }
  bookDescription() {
    return `ジャックモンド伯爵家に伝わる希少な鉱石。
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
}

class Tip15 extends BookTipBase {//クサンについて。ラストバトル時に使用,入手ずみ
  seName() {
    return "Chime2";
  }

  var172value() {
    return 3;
  }
  bookTitle() {
    const actorName = $gameActors.actor(7).name();
    const actorSecondName = $dataActors[7].meta['SecondName'].split(',')[1];
    return `${actorName}=コルド＝${actorSecondName}─その２─`;
  }
  bookDescription() {
    return `\\swi[247]元宰相。
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
}

class Tip16 extends BookTipBase {//クサンについて2。使用ずみ
  seName() {
    return "Chime2";
  }

  //var value1 = `\\set[7]─その２─`;
  bookTitle() {
    const actorName = $gameActors.actor(7).name();
    const actorSecondName = $dataActors[7].meta['SecondName'].split(',')[1];
    return `${actorName}=コルド＝${actorSecondName}─その２─`;
  }
  bookDescription() {
    return `未だ復権という野心にその身を焦がす\\swi[247]元宰相。

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
}

class Tip17 extends BookTipBase {//騎士団長,入手ずみ
  seName() {
    return "Chime2";
  }

  var172value() {
    return 3;
  }
  bookTitle() {
    const weaponName = $dataWeapons[351].name;
    return `${weaponName}=${$dataWeapons[351].meta['FamilyName']}`;
  }
  bookDescription() {
    return `\\swi[247]騎士団長。
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
}

class Tip18 extends BookTipBase {//国王。使用ずみ
  seName() {
    return "Chime2";
  }

  bookTitle() {
    const weaponName = $dataWeapons[359].name;
    return `${weaponName}=${$dataWeapons[359].meta['FamilyName']}`;
  }
  bookDescription() {
    return `\\swi[247]国王。自他共に認める無能な王。
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
}

class Tip19 extends BookTipBase {//<淫触薬>アビス・リキッド、使用ずみ
  bookTitle() {
    const weaponName = $dataWeapons[459].name;
    return `${weaponName}`;
  }
  bookDescription() {
    return `\\wn[452]を元にして作成された派生薬の一つ。
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
}

class Tip20 extends BookTipBase {//エネミー全滅ボーナス、使用ずみ
  bookTitle() {
    return `エネミー全滅ボーナス`;
  }
  bookDescription() {
    return `マップ上のシンボルエネミーを全滅させる事で、
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
}

class Tip21 extends BookTipBase {//ダンジョンとフィールドの違い。使用ずみ
  bookTitle() {
    return `ダンジョンとフィールド`;
  }
  bookDescription() {
    return `作中に措いて、『ダンジョン』と『フィールド』は
扱いが異なる。
ダンジョンでは倒したエネミーは自然消滅し上限まで
リポップするが、フィールドではしない。
エネミーＬＶが20以上のダンジョンでは「トラップ」が
設置されるが、フィールドではない。

一部のクエストでも、扱いを別にされている。

`;
  }
}

class Tip22 extends BookTipBase {//食事について。使用済み
  bookTitle() {
    return `食事アイテムについて`;
  }
  bookDescription() {
    return `「Food」に分類される食事アイテムは、
使用する事で食べる事ができ、
その食事毎に設定されたバフを受ける事が出来ます。

一度の食事で「満腹度」が1上昇し、
「満腹度上限」に達するまで食事が行えます。
満腹度は昼夜変更時にリセットされます。
同時にバフも消去されます。

※ 「食材」と「食事」アイテムは別物です。
`;
  }
}

class Tip23 extends BookTipBase {//<淫統薬>インデュ・アビス
  bookTitle() {
    const weaponName = $dataWeapons[452].name;
    return `${weaponName}─その２─`;
  }
  bookDescription() {
    return `これを解消する為の研究は主に、
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
}

class Tip24 extends BookTipBase {//ディヴィジョン・ベルセルク
  var172value() {
    return 3;
  }
  bookTitle() {
    return `ベルセルク──過去──`;
  }
  bookDescription() {
    return `覇空戦争時代に猛威を振るった狂戦士達。
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
}

class Tip25 extends BookTipBase {//ディヴィジョン・ベルセルク
  var172value() {
    return 3;
  }
  bookTitle() {
    return `ベルセルク──現在──`;
  }
  bookDescription() {
    return `──現代に措いて。
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
}

class Tip26 extends BookTipBase {//ディヴィジョン・ベルセルク
  var172value() {
    return 3;
  }
  bookTitle() {
    return `ディヴィジョン・ベルセルク`;
  }
  bookDescription() {
    return `本来は、血族であろうとも器では無い\N[5]が、
寿命を代償に狂戦士化した姿。
本来のベルセルクと比べ弱体化、或いは超ピーキーな
改変が行われている。

然れど、元がノーヴィスの少年である事を考えれば、
その伸び幅は破格のものと言える。

──理性を剥奪されて得た力に、どれ程の意味があるのか。
その答えを出すべき少年は………。
`;
  }
}

class Tip27 extends BookTipBase {//ライフスト－ム
  var172value() {
    return 3;
  }
  bookTitle() {
    return `生命奔流体機構<ライフストーム・イグジット>`;
  }
  bookDescription() {
    return `生体兵器として産み出された狂戦士の血統に
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
}

// Tips ID -> クラス。本文は各クラス側にある。
const originalTipsMap = {
  1: Tip1,
  2: Tip2,
  3: Tip3,
  4: Tip4,
  5: Tip5,
  6: Tip6,
  7: Tip7,
  8: Tip8,
  11: Tip11,
  12: Tip12,
  13: Tip13,
  14: Tip14,
  15: Tip15,
  16: Tip16,
  17: Tip17,
  18: Tip18,
  19: Tip19,
  20: Tip20,
  21: Tip21,
  22: Tip22,
  23: Tip23,
  24: Tip24,
  25: Tip25,
  26: Tip26,
  27: Tip27
};
//#endregion

//#region original_text

// 固有テキスト(OriginalText1/2)の共通処理。本文は bookDescription 側にある。
class OriginalTextBase extends BookTipBase {
  seName() {
    return "Chime2";
  }

  var172value() {
    return 10;
  }

  execute(bookData) {
    this.playSound();
    $gameVariables.setValue(172, this.var172value());
    valueTalkSet = [25, this.bookDescription(), bookData];
  }
}

class OriginalText1 extends OriginalTextBase {
  _weapon = $dataWeapons[317];
  _job = this._weapon.meta['Profession'];
  _subJob = this._weapon.meta['Profession1'];


  // id100==1 用の本文。必要なら id101 で分岐する。
  bookDescription() {
    return `・Usopedia:${this._job}
覇空戦争時代より続く医師の名門一族、\\NFN[317]家。
何よりも患者の命を救う事を真摯に求める、高邁な精神の癒し手達。
彼らに救われた生命は、全空に渡って存在する。
一族の者達は各地で敬われており、
表敬の際には民衆が群れを成すという──。

──\\wn[317]=\\NFN[317]は、そんな医師一家の傍流の出であるが、
一族に伝わる高潔さも医療技術も一切持ち合わせていない。
勤務態度は不真面目そのものであり、診察も適当極まる。
裏社会との繋がりも噂されており、黒い噂が絶えない男である。
空立の医療施設に勤めていられるのは、
一族への忖度が１０割である、とは当院の院長の言だとか。

故に彼は蔑みと軽視を込めてこう呼ばれている。
${this._subJob}、と…。

民明書房刊『華麗なる一族、\\NFN[317]の光と闇』より抜粋`;
  }
}

class OriginalText2 extends OriginalTextBase {
  // id100==2 用の本文。必要なら id101 で分岐する。
  bookDescription() {
    return `・Usopedia:魔導電算機について
来訪者(コラボ勢)の一人が所持していたＰＣ(パーソナルコンピューター)を元に、
エルステ帝国が開発した電算処理ユニット。
性能としては、元となったＰＣの遥か劣化品に当たる。
しかし、簡単な計算や同機同士の通信機能など、
その利便性は計り知れない。

現在は大量生産こそ実現していないが、
少数だが現品の生産は行われており、
その一部は帝国外の好事家達にも流れているとか。

帝国開発局では、現行品の大量生産と共に、
高性能化や小型化などの研究に着手している──。

ファ空新聞『時代を変える発明品！？　噂の魔導電算機に迫る！』特集一面より抜粋`;
  }
}
//#endregion


//#region gab_word
// 喘ぎ声セット。wordSetId はイベントから変数で指定される。
const HTEXT_WORD_SETS = {
  3: ['「アッ\\I[12]\\I[12]\\I[12]」', '「ンッ\\I[12]」', '「ンン…\\I[12]」', '「ンクっ…\\I[12]」', '「ァンっ…\\I[12]」', '「ヒィンっ…\\I[12]」', '「アヒィっ…\\I[12]」'],
  2: ['「………ァっ」', '「いや…」', '「ンン──……」', '「ンクっ…」', '「ァンっ…」'],
  1: ['「イヤ…ッ」', '「ヤメ…」', '「ァァ………」', '「助けッ──」', '「ァ──」']
};

htext_word = function (wordSetId) {
  const wordSet = HTEXT_WORD_SETS[wordSetId];
  valueHtextWord = wordSet ? wordSet.slice() : [];
};

// Gab(一言台詞)を1つ表示する。withFace の時だけ顔グラ情報を渡す。
function showGabLine(gabLine, withFace) {
  const gabLineText = gabLine[0];
  if (!$gameParty.inBattle()) $gameSystem.pushInfoLog(gabLineText);//インフォログにも残す

  const scene = SceneManager._scene;
  if (!scene || !scene._gabWindow) return;

  const gabData = withFace
    ? [gabLineText, 'face', gabLine[1], Number(gabLine[2]), '', 0]
    : [gabLineText, '', 0, 0, '', 0];
  scene.startGabWindow(gabData);
}

// 候補から1つ選ぶ。空なら null。
function pickGabLine(gabLineCandidates) {
  if (!gabLineCandidates || gabLineCandidates.length === 0) return null;
  return gabLineCandidates[getRandomIndex(gabLineCandidates.length)];
}

// 顔グラ無しの一言。
gabWord_exeScriptNoFace = function (gabLineCandidates) {
  const gabLine = pickGabLine(gabLineCandidates);
  if (!gabLine) return;
  showGabLine(gabLine, false);
};

// 顔グラ付きの一言。
gabWord_exeScript = function (gabLineCandidates) {
  const gabLine = pickGabLine(gabLineCandidates);
  if (!gabLine) return;
  showGabLine(gabLine, true);
};

// 戦闘開始時Gab。
const BATTLE_INTRO_GAB_GROUP_ID = 0;//変数229(グループID)
const BATTLE_INTRO_GAB_DURATION = 80;//変数68。GAB表示時間。二言目以上の時
const INTRO_GREETING_GAB = [`「秩序の名に措いて…、私は負けませんッ！！」`, '1Actor1', 7];
const INTRO_CHALLENGE_GAB = [`「油断せず行きますよ──ッ！！」`, '1Actor1', 3];

gabWord_setBattle = function () {

  const battleMembers = $gameParty.battleMembers();
  const memberCount = battleMembers.length;
  if (memberCount === 0) return;

  const randomMemberIndex = getRandomIndex(memberCount);
  const actorId = battleMembers[randomMemberIndex].actorId();
  const actor = $gameActors.actor(actorId);
  $gameVariables.setValue(53, actor.nickname());
  $gameVariables.setValue(625, $gameVariables.value(380 + actorId)[59]);

  let gabLineCandidates = null;

  if ($gameVariables.value(229) == BATTLE_INTRO_GAB_GROUP_ID) {
    $gameVariables.setValue(68, BATTLE_INTRO_GAB_DURATION);
    gabWord_exeScript([INTRO_GREETING_GAB]);
    gabLineCandidates = [INTRO_CHALLENGE_GAB];
  } else if (!$gameSwitches.value(211)) {
    gabLineCandidates = collectBattleTurnGabLines(actorId, memberCount == 1);
  }

  if (!gabLineCandidates) return;
  gabWord_exeScript(gabLineCandidates);

};

// アクターの <GabBattleTurn_N> / 単独時は <GabBattleTurnAlone_N> を読む。
function collectBattleTurnGabLines(actorId, isAlone) {
  const actorMeta = $dataActors[actorId].meta;
  const metaKeyPrefix = isAlone ? 'GabBattleTurnAlone_' : 'GabBattleTurn_';
  const gabLineCandidates = [];

  for (let gabSlotId = 1; gabSlotId <= 9; gabSlotId++) {
    const gabValue = actorMeta[metaKeyPrefix + gabSlotId];
    if (!gabValue) continue;
    gabLineCandidates.push(gabValue.split(','));
  }
  return gabLineCandidates;
}

// ---------------------------------------------------------------------------
// マップ移動時NPC呟き
// ---------------------------------------------------------------------------
// スイッチ・変数135(進行度)で出現する台詞の組。評価順と push 順は元コードと同一。
const NPC_GAB_BLOCKS = [
  {
    //戦貨が貯まっている
    isActive: function () {
      return $gameParty.numItems($dataItems[10]) >= 1000;
    },
    lines: function () {
      return [
        [`【中年男】「\\iin[10]が貯まってるじゃないか。早く交換に行きな」`, 'GabPeople4', 4],
        [`【女性】「\\iin[10]が貯まってるじゃない。交換に行ってきたら？」`, 'GabPeople4', 3],
        [`【少年】「\\iin[10]が貯まっていますよ？　交換に行くべきでは」`, 'GabPeople4', 0]
      ];
    }
  },
  {
    //コルブラント屋外
    isActive: function () {
      return $gameSwitches.value(241) && $gameSwitches.value(203);
    },
    lines: function (storyProgress) {
      if (storyProgress >= 42 && storyProgress <= 43) {
        return [
          [`【中年男】「何やら城の方が騒がしいな…」`, 'GabPeople1', 4],
          [`【老婆】「何があったって言うんだい、全く…」`, 'GabPeople1', 7],
          [`【青年】「騎士団長が何とかしてくれるさ！」`, 'GabPeople1', 2],
          [`【少年】「ヒャ、ヒャハ～～………」`, 'GabPeople1', 0]
        ];
      }

      const cityRumorLines = (storyProgress >= 47)
        ? [
          [`【中年男】「宰相が逆賊だったんだって？　オレは前から怪しいと──」`, 'GabPeople1', 4],
          [`【老婆】「\\N[7]様がねぇ…、一体何だって………」`, 'GabPeople1', 7]
        ]
        : [
          [`【中年男】「最近盗賊が暴れてるんだって？　全く騎士団は何をしてるんだよ──」`, 'GabPeople1', 4],
          [`【老婆】「最近は物騒な話ばっかりで嫌になるねぇ──」`, 'GabPeople1', 7]
        ];
      return cityRumorLines.concat([
        [`【青年】「コルブラント島は初めてかい？　この島は良い所だよ！」`, 'GabPeople1', 2],
        [`【少年】「ヒャッハーーッ」`, 'GabPeople1', 0]
      ]);
    }
  },
  {
    //王城、後半も
    isActive: function () {
      return $gameSwitches.value(242) || $gameSwitches.value(276);
    },
    lines: function (storyProgress) {
      if (storyProgress >= 42) {
        return [
          [`【団員】「制圧完了！」`, 'GabPeople2', 4],
          [`【団員】「異常なし！」`, 'GabActor1', 7]
        ];
      }

      const castleLines = [
        [`【兵士】「異常ありません！」`, 'GabPeople3', 7],
        [`【メイド】「これはお目汚しを。失礼致しました──」`, 'GabPeople2', 5],
        [`【貴族】「フン。平民風情が城内を闊歩するなど。身の程をしれ──」`, 'GabPeople3', 4]
      ];
      if (storyProgress <= 49) {
        castleLines.push([`【兵士】「何だってよそ者に討伐なんて(ﾌﾞﾂﾌﾞﾂ…)──」`, 'GabPeople3', 7]);
      }
      return castleLines;
    }
  },
  {
    //秩序
    isActive: function () {
      return $gameSwitches.value(261);
    },
    lines: function (storyProgress) {
      if (storyProgress >= 100) {
        return [
          [`【団員】「お、団長代理じゃねーか。相変わらずエロい身体してるぜ\\I[12]」`, 'GabEroPeople1', 1],
          [`【団員】「ククク…──\\I[12]」`, 'GabEroPeople1', 4]
        ];
      }
      return [
        [`【団員】「全空に、秩序を──！」`, 'GabPeople2', 4],
        [`【団員】「全空に、秩序を──！」`, 'GabActor1', 7]
      ];
    }
  },
  {
    //アウギュステ屋外
    isActive: function () {
      return $gameSwitches.value(281) && $gameSwitches.value(203);
    },
    lines: function (storyProgress) {
      const augysteLines = [
        [`【青年】「ここはアウギュステ。年中観光客で賑わってる島だよ──」`, 'GabPeople4', 2],
        [`【少年】「ウキャキャキャーーーッ♪」`, 'GabPeople1', 0],
        [`【宗教男】「母なる海を汚す者、汝この地より立ち去るべし──」`, 'GabPeople4', 6]
      ];

      if (storyProgress >= 32) {
        augysteLines.push([`【中年男】「例のクスリも下火になってきたみたいだな。助かる話だぜ」`, 'GabPeople4', 4]);
      } else {
        augysteLines.push([`【中年男】「最近この街じゃ妙なクスリが出回ってるみたいでな…。アンタも気を付けなよ──」`, 'GabPeople4', 4]);
      }

      if (storyProgress <= 32) {
        augysteLines.push(
          [`【青年？】「オホ…、オホホホォォォゥゥゥッッ──\\I[12]」`, 'GabEroPeople1', 0],
          [`【老人？】「儂は…神じゃったんか…、神、神、カミカミカミカミカァッハァァ──ッ\\I[12]」`, 'GabEroPeople1', 1],
          [`【中年？】「アヘ\\I[12] ア、ヒハヒハ\\I[12]」`, 'GabEroPeople1', 3]
        );
      }
      return augysteLines;
    }
  },
  {
    //浜辺
    isActive: function () {
      return $gameSwitches.value(282);
    },
    lines: function (storyProgress) {
      const beachLines = [
        [`【青年】「青い海、白い砂浜。完璧だッぜッ！！」`, 'GabPeople1', 2],
        [`【頭アウギュステ】「やっぱり年に一度は此処にリゾートに来ないとね──」`, 'GabActor2', 2]
      ];
      if (storyProgress <= 32) {
        beachLines.push(
          [`【青年？】「オホ…、オホホホォォォゥゥゥッッ──\\I[12]」`, 'GabEroPeople1', 0],
          [`【老人？】「儂は…神じゃったんか…、神、神、カミカミカミカミカァッハァァ──ッ\\I[12]」`, 'GabEroPeople1', 1],
          [`【中年？】「アヘ\\I[12] ア、ヒハヒハ\\I[12]」`, 'GabEroPeople1', 3]
        );
      }
      return beachLines;
    }
  },
  {
    //ジュエルリゾート
    isActive: function () {
      return $gameSwitches.value(301);
    },
    lines: function () {
      return [
        [`【少年】「ここに来ると、お父さん達が大はしゃぎするんだよね──」`, 'GabPeople4', 0],
        [`【中年】「カジノで今月の家賃まで溶かしちゃった。テヘペロ\\I[12]」`, 'GabPeople4', 4],
        [`【熟女】（無言で中年男のボディをサンドバックにしている…）`, 'GabPeople4', 5]
      ];
    }
  }
  // NOTE: 犯罪都市屋外(スイッチ321 && 203)は元コードでも台詞が無い為、ブロックを持たない。
];

gabWord_setNpc = function () {

  const storyProgress = $gameVariables.value(135);
  const gabLineCandidates = [];

  for (const gabBlock of NPC_GAB_BLOCKS) {
    if (!gabBlock.isActive()) continue;
    for (const gabLine of gabBlock.lines(storyProgress)) gabLineCandidates.push(gabLine);
  }

  //先頭キャラが女なら露出状態での発言も追加する。
  const leaderMember = $gameParty.battleMembers()[0];
  if (leaderMember && isGirl(leaderMember)) rosyutu_wordChoiceNPC(leaderMember.actorId());

  gabWord_exeScript(gabLineCandidates);

};

// 露出限界判定時のNPC台詞。露出度(変数 actorId+380 の [4])が低いほど過激になる。
const NPC_LEER_GAB_BLOCKS = [
  {
    isActive: function (exposureLevel) {
      return exposureLevel <= 90;
    },
    lines: function () {
      return [
        [`【中年男】「………………………（視線をこちらに固定しながら）」`, 'GabEroPeople1', 3]
      ];
    }
  },
  {
    isActive: function (exposureLevel) {
      return exposureLevel <= 50;
    },
    lines: function () {
      return [
        [`【青年】「（ニヤニヤ──\\I[12]）」`, 'GabEroPeople1', 0],
        [`【青年】「ヒュゥ──\\I[12]」`, 'GabEroPeople1', 2]
      ];
    }
  },
  {
    isActive: function (exposureLevel) {
      return exposureLevel <= 25;
    },
    lines: function () {
      const pocketLine = `【青年】（こちらをジっと見ながらポケットに入れた手を激しく動かしている…）`;
      return [
        [`【青年】「エロい格好しやがって──\\I[12]」`, 'GabEroPeople1', 1],
        [`【青年】「ヘッヘッヘ──\\I[12]」`, 'GabEroPeople1', 4],
        [pocketLine, 'GabEroPeople1', 5],
        [pocketLine, 'GabEroPeople1', 6],
        [pocketLine, 'GabEroPeople1', 7]
      ];
    }
  },
  {
    isActive: function (exposureLevel, bustSize) {
      return exposureLevel <= 25 && bustSize >= 500;
    },
    lines: function () {
      return [
        [`【青年】「オイオイ、あの秩序の女、また乳デカくなってんじゃねーの──\\I[12]」`, 'GabEroPeople1', 5],
        [`【青年】「秩序秩序って、自分が一番秩序乱してんじゃね？」（←呆れ顔）`, 'GabEroPeople1', 6],
        [`【青年】「慧漏いな…」`, 'GabEroPeople1', 7]
      ];
    }
  }
];

// 露出限界判定時にnpc台詞設定
rosyutu_wordChoiceNPC = function (actorId) {

  const actorVariables = $gameVariables.value(actorId + 380);
  const exposureLevel = actorVariables[4];
  const bustSize = actorVariables[1];
  const gabLineCandidates = [];

  for (const gabBlock of NPC_LEER_GAB_BLOCKS) {
    if (!gabBlock.isActive(exposureLevel, bustSize)) continue;
    for (const gabLine of gabBlock.lines()) gabLineCandidates.push(gabLine);
  }

  gabWord_exeScript(gabLineCandidates);

};

// 露出限界判定時に台詞設定(操作キャラの内心)
rosyutu_wordChoice = function (actorId) {

  const actor = $gameActors.actor(actorId);
  if (!actor) return;

  const gabLineCandidates = collectRosyutuWordCandidates(actor, actorId);
  const chosenGabLine = gabLineCandidates.length > 0 ? gabLineCandidates[getRandomIndex(gabLineCandidates.length)] : 0;
  $gameVariables.setValue(21, chosenGabLine);

};

// 露出時の内心台詞。衣装状態(変数 actorId+440)と状態で出し分ける。
function collectRosyutuWordCandidates(actor, actorId) {
  const actorVariables = $gameVariables.value(actorId + 380);
  const outfit = $gameVariables.value(actorId + 440);
  const gabLineCandidates = [];

  if (actorId == 2) {
    gabLineCandidates.push([`「乙女にさせる格好では無いだろうが…っ」`, 3, 2]);
  }

  if (actorId == 1) {
    if (actorVariables[4] >= 70) {
      gabLineCandidates.push([`「そ、その…、早く着替えましょう………」`, 3, 7]);
      gabLineCandidates.push([`「は、恥ずかしいんですけど………」`, 3, 4]);
    } else {
      gabLineCandidates.push([`「…巫山戯ないでくれませんか…！？」`, 3, 2]);
      gabLineCandidates.push([`「………」（←変質者を見る目）`, 3, 0]);
    }

    const wornOutfitId = outfit[41];
    if (wornOutfitId == 2 || wornOutfitId == 3) {//水着/メイド
      gabLineCandidates.push([`「…街中でする格好ではありませんよね…？」`, 4, 1]);
    }
    if (wornOutfitId == 99) {//奴隷
      gabLineCandidates.push([`「頭がおかしいんじゃ無いですか！！」`, 3, 3]);
      ensyutu_ikari(60, 'Thunder9');
    }
    if (actor.isStateAffected(70)) {//破損
      gabLineCandidates.push([`「早く着替えましょう…！」`, 3, 5]);
    }

    //改造衣装
    const clothItem = $dataItems[outfit[0]];
    if (clothItem && clothItem.meta['ClothType'] == '改') {
      gabLineCandidates.push([`「こんな破廉恥な恰好、秩序として受け入れられません！！」`, 3, 3]);
      ensyutu_ikari(60, 'Thunder9');
    }

    if ($gameSwitches.value(206) || $gameSwitches.value(213)) {//露出開発度などで条件分岐
      gabLineCandidates.push([`「こんな破廉恥な恰好、秩序として受け入れられません！！」`, 3, 3]);
    }
  }

  return gabLineCandidates;
}
//#endregion

//#region profile
// 作品ごとで変更させる個人プロフィール


// 作品ごとで変更させる個人プロフィール(アクター別)。テキストはここに集約する。
const SEPARATE_PROFILE_ACTOR1 =
`気高く尊き秩序の蒼光纏う、若き騎空団団長（代理）。
全空でも有数の騎士を父に持ち、
自身も七光りでは終わらぬ才を持つ。
生真面目な気質で、事案の類には容赦が無い。\n`;

const SEPARATE_PROFILE_ACTOR2 =
`剛勇鮮烈な武威の閃電煌めく、（実質的に）第四船団長。
一行の中では年長者であり、
年相応の落ち着きと研鑽を積んだ甘党系武闘派騎空士。
齢に相応しき外見になりたいが、諦めてもいる。\n`;

const SEPARATE_PROFILE_ACTOR3 =
`雄ドラフらしいマッスルが頼れるナイスガイ。
秩序の騎空団創設者とも轡を並べたベテラン騎空士。
秩序の騎空団内部でも信頼厚く、\\N[1]の
守役のような立ち位置。嫁さん募集中。\n`;

const SEPARATE_PROFILE_ACTOR4 =
`秩序の騎空団では若手に入る、実力派騎空士。
生きる為に汚れ仕事に手を染めていたが、
\\N[1]父のパーティにボコられて改心する。
以降は秩序の騎空士として優秀な戦果を挙げている。
カレシ募集中。\n`;

const SEPARATE_PROFILE_ACTOR5 =
`賊によって家族と住む場所を失った薄幸の少年エルーン。
現在は秩序の騎空士見習いとして励んでいる。
その経緯から団長代理付きのような立場になっており、
\\N[1]に淡い思いを抱いている。
今作の不幸枠。\n`;

const SEPARATE_PROFILE_ACTOR5_LATE =
`賊によって家族と住む場所を失った薄幸の少年エルーン。
現在は秩序の騎空士見習いとして励んでいる。
その経緯から団長代理付きのような立場になっており、
\\N[1]に淡い思いを抱いている。
今作の不幸枠、兼、疫病神。\n`;

const SEPARATE_PROFILE_ACTOR6 =
`コルブラント王国に措いて由緒正しき血脈を
保つ名門伯爵家嫡男。\n`;

const SEPARATE_PROFILE_ACTOR7 =
`コルブラント王国の内政を一手に取り仕切る大臣。
辣腕と評判。\n`;

const SEPARATE_PROFILE_TEXTS = {
  1: SEPARATE_PROFILE_ACTOR1,
  2: SEPARATE_PROFILE_ACTOR2,
  3: SEPARATE_PROFILE_ACTOR3,
  4: SEPARATE_PROFILE_ACTOR4,
  5: SEPARATE_PROFILE_ACTOR5,
  6: SEPARATE_PROFILE_ACTOR6,
  7: SEPARATE_PROFILE_ACTOR7
};

// 進行度(変数135)で差し替わるプロフィール。
const SEPARATE_PROFILE_LATE_TEXTS = {
  5: { requiredProgress: 49, text: SEPARATE_PROFILE_ACTOR5_LATE }
};

production_separateSetProfile = function (actorId) {

  const profileText = resolveSeparateProfileText(actorId, $gameVariables.value(135));
  const actor = $gameActors.actor(actorId);
  if (!actor || !profileText) return;
  actor.setProfile(profileText);

};

// アクターIDと進行度からプロフィール本文を選ぶ。
function resolveSeparateProfileText(actorId, storyProgress) {
  const lateProfile = SEPARATE_PROFILE_LATE_TEXTS[actorId];
  if (lateProfile && storyProgress >= lateProfile.requiredProgress) return lateProfile.text;
  return SEPARATE_PROFILE_TEXTS[actorId];
}

// 作品ごとで変更させる個人プロフィール(堕落度合い)。上から順に判定する。
const DEGRADED_PROFILE_ACTOR1_SKILL65 =
`致命的に狂った歯車は、秩序の女を一人の雌にした。
あの蒼光は、最早戻る事は無い。`;

const DEGRADED_PROFILE_ACTOR1_SKILL64 =
`呵責無き凌辱の大火は、秩序に癒えぬ恥辱の痕を刻む。
不動の筈であった優先順位に僅かな瑕疵が現れ始め…。
心身より湧き上がる肉欲の疼きは
確実に\\set[1]を歪ませていく…。`;

const DEGRADED_PROFILE_ACTOR1_SKILL62 =
`望まぬ穢れは秩序の光を貶め始めている…。
然れどその蒼光は未だ顕在なり。
しかし、薄暗がりを照らす彼女の光は人面獣心の徒を
惹きつけて已まないのも事実であろう…。`;

const DEGRADED_PROFILE_ACTOR1_DEFAULT =
`生命活動の大半を＜秩序＞に捧げている弊害か、
性的な事物に疎い。男社会で育った弊害か無防備な面も。
団内では異性としての人気も高いのだが、
本人は気づいていない。`;

const DEGRADED_PROFILE_ACTOR2_SKILL65 =
`堕ちた武人は、夜な夜な男を口説き部屋へと連れ込む。
一夜の快楽に耽るため…。
その肉欲に狂わされている事を自覚しながら、
それでも抗えぬ欲求に屈するが故──。
`;

const DEGRADED_PROFILE_ACTOR2_SKILL63 =
`淫欲に目覚めた武人は、男を欲し始める…。
その欲求は、逆らう術を、彼女は持たない…。`;

const DEGRADED_PROFILE_ACTOR2_SKILL61 =
`忌まわしき呪縛は、秩序の騎空士が誇る女傑すら
狂わせた…。
未だ自覚こそ無いものの、
彼女は確かに道を踏み外そうとしている…。`;

const DEGRADED_PROFILE_ACTOR2_DEFAULT =
`武家の出生である為か、外見に反比例して
硬い気質の持ち主。男女の由無し事からは縁遠い。
\\N[1]と団内女性人気を二分しているが、
彼女の場合は理解した上でスルーしている。`;

const DEGRADED_PROFILE_TIERS = {
  1: [
    { skillId: 65, text: DEGRADED_PROFILE_ACTOR1_SKILL65 },
    { skillId: 64, text: DEGRADED_PROFILE_ACTOR1_SKILL64 },
    { skillId: 62, text: DEGRADED_PROFILE_ACTOR1_SKILL62 }
  ],
  2: [
    { skillId: 65, text: DEGRADED_PROFILE_ACTOR2_SKILL65 },
    { skillId: 63, text: DEGRADED_PROFILE_ACTOR2_SKILL63 },
    { skillId: 61, text: DEGRADED_PROFILE_ACTOR2_SKILL61 }
  ]
};

const DEGRADED_PROFILE_DEFAULT_TEXTS = {
  1: DEGRADED_PROFILE_ACTOR1_DEFAULT,
  2: DEGRADED_PROFILE_ACTOR2_DEFAULT
};

production_ChangeSetProfile = function () {

  const actorId = $gameVariables.value(20);
  const actor = $gameActors.actor(actorId);
  if (!actor) return;

  // サブヒロインはスイッチで設定するかも？
  actor.setProfile(resolveDegradedProfileText(actor, actorId));

};

// 習得済みスキルのうち一番上の段階の本文を返す(該当なしは既定文)。
function resolveDegradedProfileText(actor, actorId) {
  const profileTiers = DEGRADED_PROFILE_TIERS[actorId];
  if (profileTiers) {
    for (const profileTier of profileTiers) {
      if (actor.isLearnedSkill(profileTier.skillId)) return profileTier.text;
    }
  }
  return DEGRADED_PROFILE_DEFAULT_TEXTS[actorId];
}
//#endregion

//#region seisyoujuu
// 星晶獣パラメータの強化
seisyoujuu_addParams = function (armorId) {

  const armor = $dataArmors[armorId];
  if (!armor || armor.etypeId != SEISYOUJUU_ARMOR_ETYPE_ID) return;
  if (!armor.meta['ItemPicture']) return;

  const enhanceValue = $gameVariables.value(352)[armorId - valueSeisyoujuuStartId];
  if (!(enhanceValue >= 1)) return;

  // params[0] は最大HPなので 2..7 だけ上書きする。
  for (let paramIndex = 2; paramIndex <= 7; paramIndex++) {
    armor.params[paramIndex] = enhanceValue * 10;
  }

};

// 星晶獣パラメータの一律強化。MAxHPとMPが反映されない
seisyoujuu_addParamsAll = function () {

  for (let armorId = 1; armorId <= valueArmorsLength; armorId++) {
    seisyoujuu_addParams(armorId);
  }

};

// 星晶獣の装備タイプ。<ItemPicture> と <itemPictureData> は別タグなので注意。
const SEISYOUJUU_ARMOR_ETYPE_ID = 6;

function isSeisyoujuuArmor(armor, pictureMetaKey) {
  return !!armor && armor.etypeId == SEISYOUJUU_ARMOR_ETYPE_ID && !!armor.meta[pictureMetaKey];
}

// 入手した星晶獣の一覧
seisyoujuu_select1 = function () {

  valueCountSet3 = 0;
  valueCountSet4 = 0;
  $gameSwitches.setValue(380, false);

  valueItems = $dataArmors;
  let ownedCount = 0;

  for (let armorId = 1; armorId <= valueArmorsLength; armorId++) {
    const armor = valueItems[armorId];
    if (!isSeisyoujuuArmor(armor, 'ItemPicture')) continue;

    valueCountSet3 += 1;
    if (!$gameParty.hasItem(armor, true)) continue;
    ownedCount += 1;
    valueCountSet4 += 1;
  }

  if (ownedCount >= 1) $gameSwitches.setValue(380, true);

};

// 入手した星晶獣の一覧 seisyoujuu_select2(1);
seisyoujuu_select2 = function (selectModeId) {

  switch (selectModeId) {
    case 0:
      eraseStarBeastPictures();
      break;
    case 1:
      buildStarBeastChoiceList();
      break;
    default:
      break;
  }

};

const STAR_BEAST_PICTURE_ID_FIRST = 100;
const STAR_BEAST_PICTURE_ID_LAST = 205;
const STAR_BEAST_CHOICE_PICTURE_ID_FIRST = 101;

function eraseStarBeastPictures() {
  for (let pictureId = STAR_BEAST_PICTURE_ID_FIRST; pictureId <= STAR_BEAST_PICTURE_ID_LAST; pictureId++) {
    $gameScreen.erasePicture(pictureId);
  }
}

// 入手率の見出し + 所持している星晶獣を選択肢として並べる。
function buildStarBeastChoiceList() {
  addStarBeastHeaderChoice();

  valueItems = $dataArmors;
  let pictureId = STAR_BEAST_CHOICE_PICTURE_ID_FIRST;
  let choiceIndex = 1;

  for (let armorId = 1; armorId <= valueArmorsLength; armorId++) {
    const armor = valueItems[armorId];
    if (!isSeisyoujuuArmor(armor, 'itemPictureData')) continue;
    if (!$gameParty.hasItem(armor, true)) continue;

    addStarBeastChoice(armor, armorId, choiceIndex, pictureId);
    pictureId += 2;
    choiceIndex += 1;
  }
}

// 「星晶石入手率＜x/y＞」の見出し選択肢。
function addStarBeastHeaderChoice() {
  const ownedRateLabel = `星晶石入手率`;//翻訳対象
  const starBeastIcon = `\\I[508]`;
  const rateText = `＜${valueCountSet4}/${valueCountSet3}＞`;
  $gameSystem.addCustomChoice(1, { text: `${starBeastIcon}${ownedRateLabel}${rateText}`, value: 0 });
}

// 星晶獣1体分の選択肢・立ち絵・説明を登録する。
function addStarBeastChoice(armor, armorId, choiceIndex, pictureId) {
  const itemMeta = armor.meta;
  const itemPictureValues = itemMeta['itemPictureData'].split(',');
  const pictureOffsetY = Number(itemPictureValues[1]);
  const enhanceValue = $gameVariables.value(352)[armorId - valueSeisyoujuuStartId];
  const choiceText = `${armor.name}:<${enhanceValue}>`;

  $gameSystem.addCustomChoice(1, { text: choiceText, value: armorId });

  // 立ち絵の縦位置が正なら上半身のみ、負なら全身を縮小して表示する。
  const isUpperBody = pictureOffsetY >= 0;
  const pictureScale = isUpperBody ? 50 : 100;
  const extraYOffset = isUpperBody ? 0 : 200;
  const picturePath = `/img/sv_enemies/Summon_${itemPictureValues[0]}`;
  $gameScreen.showPicture(pictureId, picturePath, 1, 640 + 200,
    384 + pictureOffsetY - 150 + extraYOffset, pictureScale, pictureScale, 0, 0);
  $gameMessage.setSelectPictureId(choiceIndex, pictureId);

  if (itemMeta['summonDescription']) {
    $gameScreen.setDTextPicture(itemMeta['summonDescription'], 28);
    $gameScreen.dWindowFrame = 'ON';
    $gameScreen.showPicture(pictureId + 1, '', 0, 10, 606, 100, 100, 0, 0);
    $gameMessage.setSelectPictureId(choiceIndex, pictureId + 1);
  }
}
//#endregion


//#region outfit
// ---------------------------------------------------------------------------
// 衣装スロット
// ---------------------------------------------------------------------------
// 立ち絵の差分スロットは 変数 460 + スロットID に入っている。
const OUTFIT_BASE_VARIABLE_ID = 460;

const OUTFIT_SLOT = {
  coatHem: 2,           //コート/サーコートの裾
  coatLining: 3,        //裏地・腰帯の裾
  hairStyle: 4,         //髪型
  rightArm: 9,          //右腕(武器を含む)
  bust: 10,             //胸差分
  bustSub: 11,          //胸差分(サブ)
  leftArm: 15,          //左腕
  upperClothShadow: 16, //服上影
  armCoverMode: 17,     //アームカバーの設定値
  shoes: 18,            //靴
  skinShadow: 19,       //肌影
  bottoms: 20,          //ボトムス/下着下
  tops: 21,             //トップス/下着上
  skirt: 22,            //スカート
  shirt: 23,            //上衣/インナー上
  weaponState: 24,      //武器表示状態
  maidApron: 25,        //メイドエプロン
  leftArmCover: 26,     //左アームカバー
  shoesDisplay: 27,     //靴(表示用)
  coat: 28,             //コート/サーコート
  rightArmCoverAlt: 30, //右腕カバー(コート用)
  hairShadow: 31,       //髪の影
  hat: 32,              //帽子
  face: 33,             //表情
  hatCondition: 35,     //帽子の条件値
  hatDisplay: 37,       //帽子(表示用)
  //以下は元の値を退避しておくスロット
  hairBackup: 104,
  armCoverBackup: 117,
  bottomsBackup: 120,
  topsBackup: 121,
  shirtBackup: 123,
  weaponStateBackup: 124,
  maidApronBackup: 125,
  coatBackup: 128,
  hatBackup: 132
};

// 衣装スロットの読み書き。同じスロットを何度も $gameVariables.value で
// 引かないよう、一度読んだ値をキャッシュする(書き込みは即時反映)。
class OutfitSlots {
  constructor(baseVariableId) {
    this._baseVariableId = baseVariableId;
    this._values = {};
  }

  get(slotId) {
    if (!(slotId in this._values)) this._values[slotId] = $gameVariables.value(this._baseVariableId + slotId);
    return this._values[slotId];
  }

  set(slotId, value) {
    this._values[slotId] = value;
    $gameVariables.setValue(this._baseVariableId + slotId, value);
  }

  // 予備スロットへ現在値を退避してから新しい値にする(元の値の保存)。
  stash(backupSlotId, slotId) {
    this.set(backupSlotId, this.get(slotId));
  }
}

// 服の透過(状態71)で差し替えるスロット。上から順に判定する。
const TOPS_PIECES = {
  topTank: 1, topTankDiff: 4, topSwimsuit: 6,
  bottomShorts: 1, bottomSwimsuit: 5, shirtInner: 2
};

// 他のキャラの衣装解禁フラグ(変数 440+アクターID の配列)。
const OTHER_ACTOR_UNLOCK_FLAGS = {
  3: { 5: 1 },                                          //身体
  4: { 5: 1 },                                          //身体
  5: { 5: 1, 7: 1, 23: 1, 33: 1, 37: 1 },               //身体/ペニス/衣装/表情/髪型
  6: { 5: 1, 7: 1, 23: 1, 33: 1, 37: 0 },
  7: { 5: 1, 7: 1, 23: 1, 33: 1, 37: 0 }
};

kobetu_isyouSetOther = function () {

  for (const actorId of [3, 4, 5, 6, 7]) {
    $gameVariables.setValue(20, actorId);

    const unlockFlags = $gameVariables.value(440 + actorId);
    const actorUnlockFlags = OTHER_ACTOR_UNLOCK_FLAGS[actorId];
    for (const flagSlotId of Object.keys(actorUnlockFlags)) {
      unlockFlags[Number(flagSlotId)] = actorUnlockFlags[flagSlotId];
    }

    tachie_settei3($gameActors.actor(actorId));
  }

};

kobetu_isyousettei = function () {
  kobetu_isyousettei1($gameActors.actor($gameVariables.value(20)));
}

// ---------------------------------------------------------------------------
// 個人衣装設定の本体
// ---------------------------------------------------------------------------
kobetu_isyousettei1 = function (actor) {

  $gameVariables.setValue(OUTFIT_BASE_VARIABLE_ID + 5, 1);

  const actorId = $gameVariables.value(20);
  const outfit = new OutfitSlots(OUTFIT_BASE_VARIABLE_ID);

  switch (actorId) {
    case 1:
      applyLisciaOutfitRules(actor, outfit);
      break;
    case 2:
      applyMonicaOutfitRules(actor, outfit);
      break;
    default:
      break;
  }

};

// --- リーシャ(アクター1) -------------------------------------------------
function applyLisciaOutfitRules(actor, outfit) {
  applyLisciaShadowRules(actor, outfit);
  applyLisciaHatRules(outfit);
  applyLisciaShoeRules(outfit);
  applyLisciaApronRules(outfit);
  applyLisciaArmRules(actor, outfit);
  applyLisciaWeaponRules(actor, outfit);
  applyLisciaSheerRules(actor, outfit);
}

// スカート/腰帯/服の影。靴の設定より前に行う。
function applyLisciaShadowRules(actor, outfit) {
  if (outfit.get(OUTFIT_SLOT.skirt) == 2) outfit.set(OUTFIT_SLOT.upperClothShadow, 3);
  if (outfit.get(OUTFIT_SLOT.shirt) == 1) outfit.set(OUTFIT_SLOT.skinShadow, 3);
  if ([1, 4].includes(outfit.get(OUTFIT_SLOT.skirt))) outfit.set(OUTFIT_SLOT.upperClothShadow, 1);

  //平常時、確率でドヤ顔。立ち絵会話時と戦闘時には変化させない。
  if ($gameSwitches.value(97) || $gameParty.inBattle()) return;
  if (![1, 2, 5, 6, 15].includes(outfit.get(OUTFIT_SLOT.face))) return;

  const faceChangePattern = [1, 1, 1, 1, 2, 1, 1, 1];//2 の時だけドヤ顔(53)
  if (faceChangePattern[getRandomIndex(faceChangePattern.length)] == 2) {
    outfit.set(OUTFIT_SLOT.face, 53);
  }
}

// 帽子の表示。深くかぶる設定(条件値10)は専用スロットへ退避する。
function applyLisciaHatRules(outfit) {
  const hat = outfit.get(OUTFIT_SLOT.hat);
  if (hat < 1) return;

  const hatCondition = outfit.get(OUTFIT_SLOT.hatCondition);

  if (hat == 2 && hatCondition == 10) {
    outfit.stash(OUTFIT_SLOT.hatBackup, OUTFIT_SLOT.hat);
    outfit.set(OUTFIT_SLOT.hatDisplay, 4);
    outfit.set(OUTFIT_SLOT.hat, 0);
    outfit.set(OUTFIT_SLOT.hairShadow, 0);
    return;
  }

  if (hatCondition == 1) outfit.set(OUTFIT_SLOT.hatDisplay, hat);
}

// 奴隷衣装(11)・娼婦下着(10)の時は靴を別スロットに出す。
function applyLisciaShoeRules(outfit) {
  const bottoms = outfit.get(OUTFIT_SLOT.bottoms);
  if (bottoms != 10 && bottoms != 11) return;

  const shoes = outfit.get(OUTFIT_SLOT.shoes);
  if (shoes < 1) return;
  outfit.set(OUTFIT_SLOT.shoesDisplay, shoes);
}

// メイドエプロンとバスタオルによる肌影・股間隠しの調整。
function applyLisciaApronRules(outfit) {
  const maidApron = outfit.get(OUTFIT_SLOT.maidApron);
  const bottoms = outfit.get(OUTFIT_SLOT.bottoms);
  const shirt = outfit.get(OUTFIT_SLOT.shirt);
  const isSlaveOrProstitute = (bottoms == 10 || bottoms == 11);

  //メイドエプロン＋左腕股間隠し
  if (outfit.get(OUTFIT_SLOT.leftArm) == 4 && maidApron == 1) {
    outfit.set(OUTFIT_SLOT.leftArm, 1);
  }

  //バスタオルの肌影
  if (shirt == 6 && !isSlaveOrProstitute) outfit.set(OUTFIT_SLOT.skinShadow, 4);
  //メイドエプロン1の肌影
  if (maidApron == 1 && !isSlaveOrProstitute) outfit.set(OUTFIT_SLOT.skinShadow, 1);
  //メイドエプロン2の肌影
  if (maidApron == 2 && bottoms == 0) outfit.set(OUTFIT_SLOT.skinShadow, 2);

  //メイドエプロン1が上衣4/5に着用の時3に変更
  if (maidApron == 1 && [4, 5].includes(shirt)) {
    outfit.stash(OUTFIT_SLOT.maidApronBackup, OUTFIT_SLOT.maidApron);
    outfit.set(OUTFIT_SLOT.maidApron, 3);
  }

  //腰帯、破損で裾
  if (shirt == 1) outfit.set(OUTFIT_SLOT.coatLining, 1);
  if (shirt == 2) outfit.set(OUTFIT_SLOT.coatLining, 2);

  //左腕股間露出時。衣装によって通常に
  if (outfit.get(OUTFIT_SLOT.tops) == 11 || shirt >= 1) {
    outfit.set(OUTFIT_SLOT.leftArm, 1);
  }

  //乳房隠し(ブラ/上衣)
  if ([4, 5, 11].includes(outfit.get(OUTFIT_SLOT.tops))) outfit.set(OUTFIT_SLOT.bust, 0);
  if (shirt == 6) outfit.set(OUTFIT_SLOT.bust, 0);
}

// アームカバーの割り当てと、コートの裾・髪型の連動。
function applyLisciaArmRules(actor, outfit) {
  //秩序アームカバー左手 / メイドアームカバー左手
  const armCoverMode = outfit.get(OUTFIT_SLOT.armCoverMode);
  if (armCoverMode == 1) outfit.set(OUTFIT_SLOT.leftArmCover, 2);
  if (armCoverMode == 2) outfit.set(OUTFIT_SLOT.leftArmCover, 3);

  //左腕衣装1アームカバーで乳房露出時
  if (outfit.get(OUTFIT_SLOT.leftArm) == 4 && outfit.get(OUTFIT_SLOT.leftArmCover) == 2) {
    outfit.set(OUTFIT_SLOT.leftArmCover, 1);
    outfit.set(OUTFIT_SLOT.leftArm, 0);
  }

  //右腕衣装1アームカバーで乳房露出時
  if (outfit.get(OUTFIT_SLOT.rightArm) == 4 && armCoverMode == 1) {
    outfit.stash(OUTFIT_SLOT.armCoverBackup, OUTFIT_SLOT.armCoverMode);
    outfit.set(OUTFIT_SLOT.armCoverMode, 0);
    outfit.set(OUTFIT_SLOT.weaponState, 1);
    outfit.set(OUTFIT_SLOT.rightArm, 6);
    outfit.set(OUTFIT_SLOT.bust, 1);
  }

  //サーコートの裾と髪型
  const coat = outfit.get(OUTFIT_SLOT.coat);
  if (coat == 3) outfit.set(OUTFIT_SLOT.coatHem, 1);
  if (coat == 4) outfit.set(OUTFIT_SLOT.coatHem, 2);
  if (coat != 3) return;

  const hairStyle = outfit.get(OUTFIT_SLOT.hairStyle);
  if (hairStyle == 1) {
    outfit.stash(OUTFIT_SLOT.hairBackup, OUTFIT_SLOT.hairStyle);
    outfit.set(OUTFIT_SLOT.hairStyle, 2);
  }
  if (hairStyle == 3) {
    outfit.stash(OUTFIT_SLOT.coatBackup, OUTFIT_SLOT.coat);
    outfit.set(OUTFIT_SLOT.coat, 2);
    outfit.stash(OUTFIT_SLOT.hairBackup, OUTFIT_SLOT.hairStyle);
    outfit.set(OUTFIT_SLOT.hairStyle, 4);
  }
}

// 武器の表示状態。武器を装備していてスイッチ201/239が立っている時だけ出す。
function applyLisciaWeaponRules(actor, outfit) {
  const rightArm = outfit.get(OUTFIT_SLOT.rightArm);

  if (rightArm == 1 && isWeaponDisplayEnabled(actor)) {
    outfit.set(OUTFIT_SLOT.weaponState, 0);
    outfit.set(OUTFIT_SLOT.rightArm, 5);
    outfit.set(OUTFIT_SLOT.bust, 1);
  }

  //秩序アームカバー時武器表示
  if (outfit.get(OUTFIT_SLOT.rightArm) == 5 && outfit.get(OUTFIT_SLOT.armCoverMode) == 1) {
    outfit.set(OUTFIT_SLOT.rightArmCoverAlt, 2);
    outfit.set(OUTFIT_SLOT.rightArm, 6);
    outfit.set(OUTFIT_SLOT.bust, 1);
  }
}

// 服が透ける状態(71)の時、衣装を透け差分に差し替える。
const LISCIA_SHEER_RULES = [
  { slotId: OUTFIT_SLOT.tops, fromValue: 6, toValue: 8 },
  { slotId: OUTFIT_SLOT.bottoms, fromValue: 1, toValue: 2 },
  { slotId: OUTFIT_SLOT.bottoms, fromValue: 5, toValue: 7 },
  { slotId: OUTFIT_SLOT.tops, fromValue: 4, toValue: 5 },
  { slotId: OUTFIT_SLOT.tops, fromValue: 1, toValue: 12 }
];

function applyLisciaSheerRules(actor, outfit) {
  if (!actor.isStateAffected(71)) return;
  applySheerRules(outfit, LISCIA_SHEER_RULES);
}

// --- モニカ(アクター2) ---------------------------------------------------
function applyMonicaOutfitRules(actor, outfit) {
  applyMonicaArmRules(actor, outfit);
  applyMonicaHatRules(outfit);
  applyMonicaCoatRules(actor, outfit);
  applyMonicaWeaponRules(actor, outfit);
  applyMonicaSheerRules(actor, outfit);
}

// 腕・コート・シャツの組み合わせで股間隠しと腕カバーを付け替える。
function applyMonicaArmRules(actor, outfit) {
  //モニカ水着着用時局部隠し無効
  if (outfit.get(OUTFIT_SLOT.leftArm) == 4 && outfit.get(OUTFIT_SLOT.tops) == 3) {
    outfit.set(OUTFIT_SLOT.leftArm, 1);
  }

  const rightArm = outfit.get(OUTFIT_SLOT.rightArm);
  const coat = outfit.get(OUTFIT_SLOT.coat);
  const leftArm = outfit.get(OUTFIT_SLOT.leftArm);
  const armCoverMode = outfit.get(OUTFIT_SLOT.armCoverMode);

  //モニカコート着用時局部隠し無効
  if (rightArm == 4 && outfit.get(OUTFIT_SLOT.shirt) >= 1) outfit.set(OUTFIT_SLOT.rightArm, 1);
  if (outfit.get(OUTFIT_SLOT.rightArm) == 4 && coat >= 2) {
    outfit.set(OUTFIT_SLOT.rightArm, 1);
    outfit.set(OUTFIT_SLOT.leftArm, 1);
  }
  //モニカコート着用時局部隠し無効2
  if (outfit.get(OUTFIT_SLOT.leftArm) == 4 && coat >= 2) {
    outfit.set(OUTFIT_SLOT.rightArm, 1);
    outfit.set(OUTFIT_SLOT.leftArm, 1);
  }

  //腕カバー右手に反映
  if (armCoverMode >= 1) outfit.set(OUTFIT_SLOT.leftArmCover, armCoverMode);

  //腕隠し時に腕カバー消去
  if (outfit.get(OUTFIT_SLOT.rightArm) >= 2) {
    outfit.stash(OUTFIT_SLOT.armCoverBackup, OUTFIT_SLOT.armCoverMode);
    outfit.stash(OUTFIT_SLOT.weaponStateBackup, OUTFIT_SLOT.weaponState);
    outfit.set(OUTFIT_SLOT.armCoverMode, 0);
    outfit.set(OUTFIT_SLOT.weaponState, 0);
  }
  if (outfit.get(OUTFIT_SLOT.leftArm) >= 2) outfit.set(OUTFIT_SLOT.leftArmCover, 0);

  //モニカ解禁シャツ時にインナーありで変化
  if (outfit.get(OUTFIT_SLOT.shirt) == 2 && [1, 2].includes(outfit.get(OUTFIT_SLOT.tops))) {
    outfit.stash(OUTFIT_SLOT.shirtBackup, OUTFIT_SLOT.shirt);
    outfit.set(OUTFIT_SLOT.shirt, 4);
  }

  //シャツとインナー上で乳房非表示
  const shirt = outfit.get(OUTFIT_SLOT.shirt);
  if ([1, 2, 3, 4].includes(outfit.get(OUTFIT_SLOT.tops)) || [1, 2].includes(shirt) || shirt == 4) {
    outfit.set(OUTFIT_SLOT.bust, 0);
    outfit.set(OUTFIT_SLOT.bustSub, 0);
  }
}

// 帽子被り時は髪型に影を入れる。
function applyMonicaHatRules(outfit) {
  if (outfit.get(OUTFIT_SLOT.hat) == 2) outfit.set(OUTFIT_SLOT.hairShadow, 3);
}

// コート着用時の手袋・落ち影・発情差分。
function applyMonicaCoatRules(actor, outfit) {
  const coat = outfit.get(OUTFIT_SLOT.coat);

  //コート着用時に手袋変更
  if ((coat == 2 || coat == 3) && outfit.get(OUTFIT_SLOT.armCoverMode) == 1) {
    outfit.stash(OUTFIT_SLOT.armCoverBackup, OUTFIT_SLOT.armCoverMode);
    outfit.set(OUTFIT_SLOT.armCoverMode, 2);
    outfit.set(OUTFIT_SLOT.leftArmCover, 2);
  }

  //コート着用時アームなしで落ち影
  if (coat >= 2) {
    if (outfit.get(OUTFIT_SLOT.armCoverMode) == 0) {
      outfit.stash(OUTFIT_SLOT.armCoverBackup, OUTFIT_SLOT.armCoverMode);
      outfit.set(OUTFIT_SLOT.armCoverMode, 4);
    }
    if (outfit.get(OUTFIT_SLOT.leftArmCover) == 0) outfit.set(OUTFIT_SLOT.leftArmCover, 4);
  }

  //コート着用時にシャツスカートインナー上下なしで乳房丸出し発情時限定
  if (coat == 2 && outfit.get(OUTFIT_SLOT.tops) == 0 && outfit.get(OUTFIT_SLOT.shirt) == 0) {
    if (actor.isStateAffected(61)) {
      outfit.stash(OUTFIT_SLOT.coatBackup, OUTFIT_SLOT.coat);
      outfit.set(OUTFIT_SLOT.coat, 3);
    }
  }

  //コートの裏地、肌影
  if (coat == 2 || coat == 3) {
    outfit.set(OUTFIT_SLOT.coatLining, 1);
    outfit.set(OUTFIT_SLOT.upperClothShadow, 1);
  }

  //服上影服なしなら消去
  if (outfit.get(OUTFIT_SLOT.upperClothShadow) >= 1 && outfit.get(OUTFIT_SLOT.skirt) == 0) {
    outfit.set(OUTFIT_SLOT.upperClothShadow, 0);
  }
}

// モニカの武器表示。
function applyMonicaWeaponRules(actor, outfit) {
  if (outfit.get(OUTFIT_SLOT.rightArm) != 1) return;
  if (!isWeaponDisplayEnabled(actor)) return;

  outfit.set(OUTFIT_SLOT.coatHem, 1);
  outfit.set(OUTFIT_SLOT.rightArm, 5);
}

const MONICA_SHEER_RULES = [
  { slotId: OUTFIT_SLOT.bottoms, fromValue: 1, toValue: 4 },
  { slotId: OUTFIT_SLOT.tops, fromValue: 1, toValue: 7 },
  { slotId: OUTFIT_SLOT.tops, fromValue: 2, toValue: 8 },
  { slotId: OUTFIT_SLOT.tops, fromValue: 3, toValue: 9 },
  { slotId: OUTFIT_SLOT.shirt, fromValue: 2, toValue: 5 }
];

function applyMonicaSheerRules(actor, outfit) {
  if (!actor.isStateAffected(71)) return;
  applySheerRules(outfit, MONICA_SHEER_RULES);
}

// 透け差分ルールを順に適用する(現在値が fromValue の時だけ差し替え)。
function applySheerRules(outfit, sheerRules) {
  for (const sheerRule of sheerRules) {
    if (outfit.get(sheerRule.slotId) != sheerRule.fromValue) continue;
    outfit.stash(sheerBackupSlotId(sheerRule.slotId), sheerRule.slotId);
    outfit.set(sheerRule.slotId, sheerRule.toValue);
  }
}

// 透け差分の退避先スロット。
function sheerBackupSlotId(slotId) {
  switch (slotId) {
    case OUTFIT_SLOT.bottoms: return OUTFIT_SLOT.bottomsBackup;
    case OUTFIT_SLOT.tops: return OUTFIT_SLOT.topsBackup;
    case OUTFIT_SLOT.shirt: return OUTFIT_SLOT.shirtBackup;
    default: return slotId;
  }
}

// 右手に武器を出せる状態か(装備あり + スイッチ201、またはスイッチ239)。
function isWeaponDisplayEnabled(actor) {
  const weaponItemId = actor._equips[0]._itemId;
  return (weaponItemId >= 1 && $gameSwitches.value(201)) || $gameSwitches.value(239);
}

// リーシャとモニカに露出状態でのキャラチップコート着用
// バストが存在しないコートの衣装ID(アクター別)。この衣装の時だけ下着差分を隠す
const NO_BUST_COAT_ITEM_IDS = { 1: 3, 2: 2 };
// 下着差分を隠す時に全て0である必要がある下着スロット
const NO_BUST_UNDERWEAR_SLOT_IDS = [20, 21, 22, 23, 25];
// 下着差分を隠す時の差し替え(変数22/23の値 -> 差し替え後)
const NO_BUST_UNDERWEAR_REPLACEMENTS = [
  { sourceValue: 2, replacedValue: 6 },
  { sourceValue: 3, replacedValue: 7 }
];

isyou_senyouLisciaBlueOnly = function (actorId) {

  const noBustCoatItemId = NO_BUST_COAT_ITEM_IDS[actorId];
  if (noBustCoatItemId !== undefined) applyNoBustCoatAdjustmentLisciaBlueOnly(actorId, noBustCoatItemId);

  //乳揺れ無いキャラ
  if ($dataActors[actorId].meta['bustBlessNo']) valueBustUpCloth2[actorId] = -1;

};

// バストが存在しないコート着用時のバスト差分・下着差分調整(アクター1/2で共有)
function applyNoBustCoatAdjustmentLisciaBlueOnly(actorId, noBustCoatItemId) {
  valueBustUpCloth2[actorId] = valueBustUpCloth[actorId];//バスト存在しない衣装がある場合ここで処理

  const actorClothingData = $gameVariables.value(440 + actorId);
  if (actorClothingData[28] != noBustCoatItemId) return;

  //下着未着用なら下着差分を消す
  const hasNoUnderwear = NO_BUST_UNDERWEAR_SLOT_IDS.every(function (slotId) { return actorClothingData[slotId] == 0 });
  if (hasNoUnderwear) {
    $gameVariables.setValue(22, 5);
    $gameVariables.setValue(23, 5);
    return;
  }

  const currentUnderwearValue = $gameVariables.value(22);
  for (const replacement of NO_BUST_UNDERWEAR_REPLACEMENTS) {
    if (currentUnderwearValue != replacement.sourceValue) continue;
    $gameVariables.setValue(22, replacement.replacedValue);
    $gameVariables.setValue(23, replacement.replacedValue);
    return;
  }
};

// リザルト画像設定
actor_setBattleResult = function () {

  const firstActorId = $gameVariables.value(73);
  const lastActorId = $gameVariables.value(74);
  const members = $gameParty.members();

  for (let actorId = firstActorId; actorId <= lastActorId; actorId++) {
    const actor = $gameActors.actor(actorId);
    if (!members.contains(actor)) continue;
    $gameVariables.value(380 + actorId)[66] = needsLecherousResultPicture(actorId, actor) ? 1 : 0;
  }

};

// リザルトで堕落差分を使うか(スキル65 / アクター5のクラス25 / アクター6のサブクラス49)。
function needsLecherousResultPicture(actorId, actor) {
  if (actor.isLearnedSkill(65)) return true;
  if (actorId == 5 && actor._classId == 25) return true;
  if (actorId == 6 && actor.subclass() && actor._subclassId == 49) return true;
  return false;
}
//#endregion


//#region jouhou
// 購入できる情報一覧作成
const JOUHOU_CHOICE_ID = 1;
const JOUHOU_DEFAULT_PROGRESS_VARIABLE_ID = 135;
const JOUHOU_DEFAULT_CONDITION_SWITCH_ID = 2;
const JOUHOU_AVAIL_HIDDEN = 0;   //条件未達で「？？？」
const JOUHOU_AVAIL_BUYABLE = 1;  //条件達成済みで購入可
const JOUHOU_AVAIL_OWNED = 2;    //所持済みなので一覧に出さない
const JOUHOU_LIST_TITLE = '情報一覧';//翻訳対象
const JOUHOU_UNKNOWN_LABEL = '？？？en(s[1])';//翻訳対象
const JOUHOU_SHORT_OF_GOLD_LABEL = 'en(s[1])';//翻訳対象

jouhou_buySetup = function () {

  $gameSystem.addCustomChoice(JOUHOU_CHOICE_ID, { text: JOUHOU_LIST_TITLE, value: -1 });

  for (let itemId = 1; itemId < $dataItems.length; itemId++) {
    const infoItem = $dataItems[itemId];
    if (!infoItem.meta['BattleMapInformation']) continue;

    const availability = resolveJouhouAvailability(infoItem);
    if (availability >= JOUHOU_AVAIL_OWNED) continue;

    const choiceParams = availability == JOUHOU_AVAIL_BUYABLE
      ? buildJouhouChoiceParams(infoItem, itemId)
      : { text: JOUHOU_UNKNOWN_LABEL, value: 0 };
    $gameSystem.addCustomChoice(JOUHOU_CHOICE_ID, choiceParams);
  }

};

// 解放条件(変数比較 → スイッチ)を判定し、所持していれば所持済みを優先する。
function resolveJouhouAvailability(infoItem) {
  const isConditionMet = isJouhouConditionMet(infoItem.meta);
  if ($gameParty.hasItem(infoItem, true)) return JOUHOU_AVAIL_OWNED;
  return isConditionMet ? JOUHOU_AVAIL_BUYABLE : JOUHOU_AVAIL_HIDDEN;
}

// <SetJouhouVal:x,y> は「変数xがy以上」、<SetJouhouSwi:n> は「スイッチnがON」。
function isJouhouConditionMet(infoMeta) {
  if (infoMeta['SetJouhouVal']) {
    const setJouhouValues = infoMeta['SetJouhouVal'].split(',');
    const progressVariableId = Number(setJouhouValues[0]) == 0
      ? JOUHOU_DEFAULT_PROGRESS_VARIABLE_ID
      : Number(setJouhouValues[0]);
    if ($gameVariables.value(progressVariableId) >= Number(setJouhouValues[1])) return true;
  }

  if (infoMeta['SetJouhouSwi']) {
    const conditionSwitchId = infoMeta['SetJouhouSwi'] == 0
      ? JOUHOU_DEFAULT_CONDITION_SWITCH_ID
      : Number(infoMeta['SetJouhouSwi']);
    if ($gameSwitches.value(conditionSwitchId)) return true;
  }

  return false;
}

// 「情報名:価格\G」+ 所持金不足なら選択不可マーカーを付ける。
function buildJouhouChoiceParams(infoItem, itemId) {
  const requiredGold = Number(infoItem.meta['SetJouhouGold']);
  let choiceText = `${infoItem.name}:${infoItem.meta['SetJouhouGold']}\\G`;
  if ($gameParty.gold() < requiredGold) choiceText += JOUHOU_SHORT_OF_GOLD_LABEL;
  return { text: choiceText, value: itemId };
}
//#endregion

//#region pictures
//寝起きピクチャ。作品共通でも行けるかも？
const WAKING_UP_PICTURE_ID_FIRST = 71;
const WAKING_UP_POSE_VALUES = [8, 8, 8, 11, 8, 8];//この配列から1つ選ぶ
const WAKING_UP_STATE_LECHEROUS_ID = 61;
const WAKING_UP_STATE_EXCITED_ID = 67;
const WAKING_UP_SWITCH_FIRST_WAKE_ID = 202;
const WAKING_UP_SWITCH_FIRST_WAKE_SUB_ID = 204;
const WAKING_UP_SWITCH_RANDOM_POSE_ID = 465;
const WAKING_UP_CELL_ANIMATION = [13, 4, '連番', 8];

wakingup_pic = function () {

  valuePic1 = WAKING_UP_PICTURE_ID_FIRST;
  const firstPictureId = valuePic1;

  const actor = $gameActors.actor($gameVariables.value(2));
  if (!actor) return;

  const wakePose = buildWakingUpPose(actor);

  showWakingUpPicture(firstPictureId, 'Zev_WakingUp1_' + wakePose.imageVariant1);
  showWakingUpPicture(firstPictureId + 1, 'Zev_WakingUp2_' + wakePose.imageVariant2);
  //連番アニメーションは3枚目の表示前に登録する必要がある。
  $gameScreen.setPicturesAnimation(13, 4, "連番", 8);
  showWakingUpPicture(firstPictureId + 2, 'Zev_WakingUp3_00');

  valueScriptArray1 = [wakePose.poseValue1 + 1, wakePose.poseValue2 + 1, wakePose.poseValue3 + 1];
  $gameScreen.picture(firstPictureId + 2).cell = wakePose.poseValue1;

};

// 寝起き差分の画像バリアントとポーズ値。乱数の消費順は元のまま。
function buildWakingUpPose(actor) {
  const isFirstWakePattern = $gameSwitches.value(202) && $gameSwitches.value(204);

  let imageVariant1;
  let imageVariant2;
  let poseValue1;
  let poseValue2;
  let poseValue3;

  if (isFirstWakePattern) {
    imageVariant1 = 1;
    imageVariant2 = getRandomIndex(3) + 1;
    poseValue1 = getRandomIndex(2);
    poseValue2 = 5;
    poseValue3 = pickRandomValue(WAKING_UP_POSE_VALUES);
  } else {
    imageVariant1 = 2;
    imageVariant2 = getRandomIndex(2) + 2;
    poseValue1 = 2;
    poseValue2 = 5;
    poseValue3 = 9;
  }

  if (actor.isStateAffected(WAKING_UP_STATE_LECHEROUS_ID)) {
    poseValue1 = 4;
    poseValue2 = 6;
    poseValue3 = 12;
  }
  if (actor.isStateAffected(WAKING_UP_STATE_EXCITED_ID)) {
    poseValue1 = 3;
    poseValue2 = 7;
    poseValue3 = 10;
  }

  if ($gameSwitches.value(WAKING_UP_SWITCH_RANDOM_POSE_ID)) {
    poseValue1 = getRandomIndex(2);
    poseValue2 = 5;
    poseValue3 = pickRandomValue(WAKING_UP_POSE_VALUES);
  }

  return { imageVariant1, imageVariant2, poseValue1, poseValue2, poseValue3 };
}

// 寝起きピクチャ1枚分の表示 + 移動(画面下から定位置へ)。
function showWakingUpPicture(pictureId, pictureName) {
  const pictureX = 640 + 384 + 128;
  $gameScreen.showPicture(pictureId, pictureName, 1, pictureX, 384 + 50, 100, 100, 0, 0);
  $gameScreen.movePicture(pictureId, 1, pictureX, 384, 100, 100, 255, 0, 120);
}

//宿泊時表示ピクチャvalue18 value21～
const SLEEP_PICTURE_ID_FIRST = 51;
const SLEEP_PICTURE_BASE_WIDTH = 1600;
const SLEEP_PICTURE_BASE_HEIGHT = 1200;
const SLEEP_PICTURE_REF_WIDTH = 1280;
const SLEEP_PICTURE_REF_HEIGHT = 768;
const SLEEP_PICTURE_OPACITY = 50;//特定IDだけを透明にしたいけど出来なかった
const SLEEP_PICTURE_MOVE_OPACITY = 80;
const SLEEP_PICTURE_MOVE_DURATION = 240;
const SLEEP_STATE_LECHEROUS_ID = 61;
const SLEEP_STATE_EXCITED_ID = 67;
const SLEEP_SKILL_GROUP = [66, 67, 68, 69, 70];//習得数で差分が変わる
const SLEEP_INN_BGM = [
  { "name": "21_Inn1", "volume": 50, "pitch": 100, "pan": 0 },
  { "name": "21_Inn2", "volume": 50, "pitch": 100, "pan": 0 }
];

syukuhaku_pic = function (actorSlotId) {

  const actor = $gameActors.actor(actorSlotId);
  if (!actor) return;

  const exposureLevel = $gameVariables.value(actorSlotId + 380)[4];
  const sleepPose = resolveSleepPose(actor);
  const sleepPictureNames = collectSleepPictureNames(actor, exposureLevel, sleepPose);

  const sleepPicturePath = buildSleepPicturePath();
  showSleepPictures(sleepPictureNames, sleepPicturePath);
  moveSleepPictures(sleepPictureNames, sleepPicturePath);

  AudioManager.playMe(sleepPose >= 4 ? SLEEP_INN_BGM[0] : SLEEP_INN_BGM[1]);

};

// 寝相(1:通常 2:HP僅少 3:発情/イベント 4:発情状態あり)。
function resolveSleepPose(actor) {
  if (actor.isLearnedSkill(66) && isActorAffectedByAnyState(actor, valueHstateDisplay)) return 4;
  if (actor.isStateAffected(SLEEP_STATE_LECHEROUS_ID) || $gameSwitches.value(465)) return 3;
  if (actor.hpRate() <= 0.3) return 2;
  return 1;
}

// 指定した状態IDのいずれかに掛かっているか。
function isActorAffectedByAnyState(actor, stateIds) {
  for (const stateId of stateIds) {
    if (actor.isStateAffected(stateId)) return true;
  }
  return false;
}

// 表示するピクチャ名を0(下着)→6の順に積む。
function collectSleepPictureNames(actor, exposureLevel, sleepPose) {
  const sleepPictureNames = [];

  const locationType = $gameSwitches.value(203) ? 2 : 1;
  sleepPictureNames.push("Zev_StaySleep0-" + locationType);
  sleepPictureNames.push("Zev_StaySleep1-1");

  //sleepPose は必ず1以上。
  sleepPictureNames.push("Zev_StaySleep2-" + sleepPose);

  const sleepVariant3 = resolveSleepVariant3(exposureLevel);
  if (sleepVariant3 >= 1) sleepPictureNames.push("Zev_StaySleep3-" + sleepVariant3);

  const sleepVariant4 = resolveSleepVariant4(actor);
  if (sleepVariant4 >= 1) sleepPictureNames.push("Zev_StaySleep4-" + sleepVariant4);

  //発情寝相でも乱数は消費する(消費順を変えないため)。
  let sleepVariant5 = getRandomIndex(3);
  if (sleepPose >= 4) sleepVariant5 = 0;
  if (sleepVariant5 >= 1) sleepPictureNames.push("Zev_StaySleep5-" + sleepVariant5);

  //差分6は発情寝相の時だけ出す
  const sleepVariant6 = sleepPose >= 4 ? 1 : 0;//value22の判定を利用
  if (sleepVariant6 >= 1) sleepPictureNames.push("Zev_StaySleep6-" + sleepVariant6);

  return sleepPictureNames;
}

// 露出度が高い時だけ3枚目の差分を出す(乱数は露出度に関係なく1回消費しない)。
function resolveSleepVariant3(exposureLevel) {
  if (exposureLevel < 49) return 0;
  const sleepRand3 = getRandomIndex(4);
  if (sleepRand3 >= 2) return 1;
  if (sleepRand3 == 1) return 2;
  return 3;
}

// 差分4は堕落スキルの習得数で変化する(状態67で2、習得数+乱数が8以上で0)。
function resolveSleepVariant4(actor) {
  const sleepVariant4 = actor.isStateAffected(SLEEP_STATE_EXCITED_ID) ? 2 : 1;
  let skillBonus = getRandomIndex(10);
  for (const skillId of SLEEP_SKILL_GROUP) {
    if (actor.isLearnedSkill(skillId)) skillBonus += 1;
  }
  return skillBonus >= 8 ? 0 : sleepVariant4;
}

// 表示位置と移動先。拡大した画像の端が画面外に来る座標から中央寄りの座標へ動かす。
function buildSleepPicturePath() {
  const positionIndex = getRandomIndex(2);//ピクチャ表示時に中央1か左上0か
  const zoomScale = getRandomIndex(3) + 1;
  const scaleFactor = zoomScale >= 2 ? getRandomIndex(zoomScale) + 1 : 1;
  const isStartOuter = getRandomIndex(2) >= 1;

  //拡大後の画像のハミ出し量(scaleFactor倍)と、等倍時のハミ出し量
  const expandedX = (SLEEP_PICTURE_BASE_WIDTH * scaleFactor - SLEEP_PICTURE_REF_WIDTH) / 2;
  const expandedY = (SLEEP_PICTURE_BASE_HEIGHT * scaleFactor - SLEEP_PICTURE_REF_HEIGHT) / 2;
  const trimmedX = (SLEEP_PICTURE_BASE_WIDTH - SLEEP_PICTURE_REF_WIDTH) / 2;
  const trimmedY = (SLEEP_PICTURE_BASE_HEIGHT - SLEEP_PICTURE_REF_HEIGHT) / 2;

  return {
    positionIndex, zoomScale,
    //+で左 / -で下 を基準に、開始位置と終了位置を反対側へ振る。
    startX: isStartOuter ? SLEEP_PICTURE_REF_WIDTH / 2 + expandedX : SLEEP_PICTURE_REF_WIDTH / 2 - expandedX,
    startY: isStartOuter ? SLEEP_PICTURE_REF_HEIGHT / 2 - expandedY : SLEEP_PICTURE_REF_HEIGHT / 2 + expandedY,
    endX: isStartOuter ? SLEEP_PICTURE_REF_WIDTH / 2 - trimmedX : SLEEP_PICTURE_REF_WIDTH / 2 + trimmedX,
    endY: isStartOuter ? SLEEP_PICTURE_REF_HEIGHT / 2 + trimmedY : SLEEP_PICTURE_REF_HEIGHT / 2 - trimmedY
  };
}

// ピクチャを薄く表示しておく(移動は moveSleepPictures)。
function showSleepPictures(sleepPictureNames, sleepPicturePath) {
  let pictureId = SLEEP_PICTURE_ID_FIRST;
  for (const sleepPictureName of sleepPictureNames) {
    $gameScreen.showPicture(pictureId, sleepPictureName, sleepPicturePath.positionIndex,
      sleepPicturePath.startX, sleepPicturePath.startY,
      100 * sleepPicturePath.zoomScale, 100 * sleepPicturePath.zoomScale, SLEEP_PICTURE_OPACITY, 0);
    pictureId += 1;
  }
}

// 中央へ寄せる。乱数次第で画面中央に固定して少しだけ暗くする。
function moveSleepPictures(sleepPictureNames, sleepPicturePath) {
  const isMoveToCenter = getRandomIndex(2) >= 1;
  const endX = isMoveToCenter ? SLEEP_PICTURE_REF_WIDTH / 2 : sleepPicturePath.endX;
  const endY = isMoveToCenter ? SLEEP_PICTURE_REF_HEIGHT / 2 : sleepPicturePath.endY;
  const moveOpacity = isMoveToCenter ? SLEEP_PICTURE_MOVE_OPACITY : 100;

  //NOTE: 元コードでは移動倍率に moveOpacity を渡している(意図不明)。挙動を変えないためそのまま。
  let pictureId = SLEEP_PICTURE_ID_FIRST;
  for (let index = 0; index < sleepPictureNames.length; index++) {
    $gameScreen.movePicture(pictureId, 1, endX, endY, moveOpacity, moveOpacity, 255, 0, SLEEP_PICTURE_MOVE_DURATION);
    pictureId += 1;
  }
}
//#endregion


//#region direct
//作品オリジナルの演出に使用original_direct(1,0,0,0,0,0);没original_mainに引き抜いて使用
const DIRECT_EFFECT_PICTURE_ID_FIRST = 61;
const DIRECT_AURA_COLORS = {
  1: '#00eeff',//リーシャ
  2: '#f2ff00'//モニカ
};
const DIRECT_BERSERK_PARTICLE_NAMES = ['magic_circle_c2', 'monster_c', 'mysterious_torch_c'];

original_direct = function (effectTypeId, particleGroupId, auraColorVariantId, unusedArg4, unusedArg5, unusedArg6) {

  switch (effectTypeId) {
    case 1: showBahamutEntry(particleGroupId); break;
    case 2: hideBahamut(); break;
    case 3: showAuraParticle(particleGroupId, auraColorVariantId); break;
    case 4: clearAuraParticle(particleGroupId); break;
    case 5: showBerserkParticles(particleGroupId); break;
    case 6: clearBerserkParticles(particleGroupId); break;
    default: break;
  }

};

// バハムート登場。仮パララックス名・仮ピクチャ名を使用。
function showBahamutEntry(particleGroupId) {
  const picId = DIRECT_EFFECT_PICTURE_ID_FIRST;
  const battlefieldPictureName = "/img/parallaxes/BattleField1_1";
  $gameScreen.showPicture(picId, battlefieldPictureName, 1, 640, 384, 100, 100, 0, 0);
  $gameScreen.movePicture(picId, 1, 640, 384, 100, 100, 250, 0, 60);
  hcg_piston(picId, 5, 1);

  const monsterPictureName = 'TachieMonster1';
  $gameScreen.showPicture(picId + 1, monsterPictureName, 1, 640 - 400, 384 + 100, -100, 100, 0, 0);
  $gameScreen.movePicture(picId + 1, 1, 640 - 200, 384 + 100, -100, 100, 255, 0, 60);
  hcg_piston(picId + 1, 5, 1);

  //戦闘中は天候パーティクルを切り替える。
  valueWordSet10 = $gameParty.inBattle() ? 'battleWeather' : 'weather';
  $gameScreen._particle.particleSet(0, 'stardust_w', valueWordSet10, 'def', 'screen');
  $gameScreen._particle.particleSet(0, 'thunder_w', valueWordSet10, 'def', 'screen');
}

function hideBahamut() {
  const picId = DIRECT_EFFECT_PICTURE_ID_FIRST;
  $gameScreen.erasePicture(picId);
  $gameScreen.erasePicture(picId + 1);
  $gameScreen._particle.particleClear('stardust_w');
  $gameScreen._particle.particleClear('thunder_w');
}

// オーラ処理。original_direct(3,this._eventId,1,0,0,0);
function showAuraParticle(particleGroupId, auraColorVariantId) {
  const particleName = 'aura_static_b';
  const particleId = particleName + '-' + particleGroupId;
  $gameScreen._particle.particleSet(String(particleGroupId), particleId, 'this', particleName, '99');
  $gameScreen._particle.particleUpdate([particleId, 'alpha', '0', '0.7@0.5', '0']);
  $gameScreen._particle.particleUpdate([particleId, 'blendMode', '1']);
  $gameScreen._particle.particleUpdate([particleId, 'scale', '0', '0.6']);
  $gameScreen._particle.particleUpdate([particleId, 'lifetime', '1.1', '1.1']);

  const auraColor = DIRECT_AURA_COLORS[auraColorVariantId];
  if (auraColor) $gameScreen._particle.particleUpdate([particleId, 'color', '#ffffff', auraColor]);

  $gameScreen._particle.particleUpdate([particleId, 'pos', 0, -20]);
}

// オーラ処理終了
function clearAuraParticle(particleGroupId) {
  $gameScreen._particle.particleClear('aura_static_b' + '-' + particleGroupId);
}

// 少年暴走ベルセルク original_direct(5,this._eventId,0,0,0,0);
function showBerserkParticles(particleGroupId) {
  for (const particleName of DIRECT_BERSERK_PARTICLE_NAMES) {
    $gameScreen._particle.particleSet(String(particleGroupId), particleName + '-' + particleGroupId, 'this', particleName, '99');
  }
}

// 少年暴走ベルセルク終了
function clearBerserkParticles(particleGroupId) {
  for (const particleName of DIRECT_BERSERK_PARTICLE_NAMES) {
    $gameScreen._particle.particleClear(particleName + '-' + particleGroupId);
  }
}
//#endregion

//#region stopMove
//作品オリジナルの移動禁止処理
const STOP_MOVE_SWITCH_ID = 434;
const STOP_MOVE_STORY_VARIABLE_ID = 21;
const STOP_MOVE_ENTRY_SWITCH_ID = 1;
const STOP_MOVE_EXIT_SWITCH_ID = 2;
const STOP_MOVE_BLOCKED_MESSAGE = `今は先に行くところがあります`;//翻訳対象
//[マップID, X, Y] の周辺1マスで進行を止める。元コードは同じ内容を2回並べていたのでまとめた。
const STOP_MOVE_AREAS = [[18, 14, 42]];

original_stopMoveSwi = function () {

  const isEntryEnabled = $gameSwitches.value(STOP_MOVE_ENTRY_SWITCH_ID);
  const isExitBlocked = !$gameSwitches.value(STOP_MOVE_EXIT_SWITCH_ID);
  if (!isEntryEnabled || !isExitBlocked) return;

  $gameSwitches.setValue(STOP_MOVE_SWITCH_ID, true);

  for (const stopArea of STOP_MOVE_AREAS) {
    if (!isPlayerAroundStopArea(stopArea)) continue;
    $gameSwitches.setValue(STOP_MOVE_SWITCH_ID, false);
    $gameVariables.setValue(STOP_MOVE_STORY_VARIABLE_ID, STOP_MOVE_BLOCKED_MESSAGE);
  }

};

// プレイヤーが指定座標の周辺1マス(同じマップ)にいるか。
function isPlayerAroundStopArea(stopArea) {
  const [stopMapId, stopX, stopY] = stopArea;
  if (stopMapId != $gameMap.mapId()) return false;
  if (!isWithinOneTile(stopX, $gamePlayer._realX)) return false;
  return isWithinOneTile(stopY, $gamePlayer._realY);
}

function isWithinOneTile(targetValue, currentValue) {
  return targetValue == currentValue || targetValue == currentValue + 1 || targetValue == currentValue - 1;
}
//#endregion

//#region autoEventFlag
//作品オリジナルのスイッチや変数の自動切換え。メインクエスト変数。今のところ使用しない
original_autoEventFlag = function () {
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
//#endregion

//#region originalText
//作品オリジナルのテキスト作成
const ORIGINAL_TEXT_CLASSES = { 1: OriginalText1, 2: OriginalText2 };

original_text = function (bookId, id101) {
  const OriginalTextClass = ORIGINAL_TEXT_CLASSES[bookId];
  if (!OriginalTextClass) return;
  new OriginalTextClass().execute(id101);
};

//作品オリジナルのtipsテキスト作成//15行まで
original_tips = function (bookId) {
  const TipClass = originalTipsMap[bookId];
  if (!TipClass) return;
  tip = new TipClass();//NOTE: 元コード同様、暗黙のグローバル変数 tip に代入する
  tip.execute();
};
//#endregion

//#region originalMain
//作品オリジナルのメインシーンピクチャやキャラグラ移動等処理。全てid直接入力
const ORIGINAL_MAIN_ID_OFFSET = 300;
const MAIN_SCENE_PICTURE_ID_FIRST = 51;
const MAIN_SCENE_PICTURE_NAME_PREFIX = 'ZX_Main000_';

original_main = function (id100, id101) {

  const mainSceneId = id100 - ORIGINAL_MAIN_ID_OFFSET;
  if (mainSceneId != 1) return;//リーシャ登場。戦闘シーン以外は現在未使用

  valuePic1 = MAIN_SCENE_PICTURE_ID_FIRST;
  valueScenePic = MAIN_SCENE_PICTURE_NAME_PREFIX;

  switch (id101) {
    case 1: setupLisciaAppearanceScene(); break;
    case 2: startLisciaAppearanceBlessAnimation(); break;
    case 3: moveLisciaAppearancePictureToCenter(); break;
    case 4: scrollLisciaAppearanceParallax(); break;
    case 5: moveLisciaAppearanceBackgroundLines(); break;
    case 6: pic_move1(valuePic1 + 12, -200, 0, 100, 100, 0, 40); break;
    case 7: attachLisciaAppearanceEvent(); break;
    default: break;
  }

};

// リーシャ登場の初期配置(黒バック + 各差分 + 集中線)
function setupLisciaAppearanceScene() {
  $gameScreen.showPicture(valuePic1, 'ScreenBlackOut', 1, 640, 384, 100, 100, 0, 0);
  pic_1(1, valuePic1 + 2, valueScenePic + '01', 6, 100, 255, 120, 1280, 768, 0, 0);
  $gameScreen.showPicture(valuePic1 + 3, 'ScreenBlackOut', 1, 640, 384, 100, 100, 0, 0);
  $gameScreen.setPicturesAnimation(2, 10, "連番", 60);
  $gameScreen.showPicture(valuePic1 + 4, valueScenePic + '02_00', 1, 640,
    384 - (1390 - 768) / 2, 100, 100, 0, 0);
  $gameScreen.showPicture(valuePic1 + 10, 'ScreenConcentratedLineWidthBackGraund', 1, 640, 384, 100, 100, 0, 0);
  $gameScreen.showPicture(valuePic1 + 12, valueScenePic + '03', 1, (640 - (1500 - 1280) / 2) - 1000, 384, 500, 500, 0, 0);
  $gameScreen.movePicture(valuePic1, 1, 640, 384, 100, 100, 200, 0, 60);
  tachie_bless(valuePic1 + 4, 1);
}

// 登場演出の続き(フェード + 表情の連番アニメ)
function startLisciaAppearanceBlessAnimation() {
  adv_partDirectSet(3);
  pic_move1(valuePic1 + 3, 0, 0, 100, 100, 200, 10);
  pic_move1(valuePic1 + 4, 0, 0, 100, 100, 200, 10);

  const blessPicture = $gameScreen.picture(valuePic1 + 4);
  if (!blessPicture) return;
  blessPicture.startAnimationFrame(1, true, [1, 1, 1, 2]);
}

// 立ち絵を画面中央へ移動
function moveLisciaAppearancePictureToCenter() {
  const blessPicture = $gameScreen.picture(valuePic1 + 4);
  if (!blessPicture) return;

  const currentPictureY = blessPicture.y();
  const targetPictureY = 384 + (1390 - 768) / 2;
  pic_move1(valuePic1 + 4, 0, targetPictureY - currentPictureY, 100, 100, 255, 600);
}

// 背景のパララックス
function scrollLisciaAppearanceParallax() {
  parallax_scroll(valuePic1 + 5, 'ScreenConcentratedLineWidthBackGraund', 0, 20, 20, 0, 255);
}

// 集中線と残像の移動。パララックスで4、残像で1。
function moveLisciaAppearanceBackgroundLines() {
  pic_move1(valuePic1 + 10, 0, 0, 100, 100, 255, 60);

  const linePicture = $gameScreen.picture(valuePic1 + 12);
  const currentPictureX = linePicture.x();
  pic_move1(valuePic1 + 12, (640 + (1500 - 1280) / 2) - currentPictureX, 0, 100, 100, 255, 40);

  filter_direct(10, 10, 10, 20);
}

// 地面黒塗りと残像作成
function attachLisciaAppearanceEvent() {
  $gameMap.spawnEvent(146, 25, 35, true);
  if (!$gameVariables.value(292)) return;

  const spawnedEventSlots = $gameVariables.value(292);
  spawnedEventSlots[13] = $gameMap.getLastSpawnEventId();

  const spawnedEventId = spawnedEventSlots[13];
  const spawnedEvent = $gameMap.event(spawnedEventId);
  if (spawnedEvent) spawnedEvent.setOpacity(200);

  const attachedEventId = spawnedEventSlots[$gameVariables.value(530)];
  const monsterParticleName = 'monster_c';
  $gameScreen._particle.particleSet('attach:event:' + attachedEventId,
    monsterParticleName + '-' + attachedEventId, 'this', monsterParticleName);
  $gameScreen._particle.particleUpdate([monsterParticleName, 'color', '#007dff', '#66b1ff']);
  $gameScreen._particle.particleClear(monsterParticleName + '-' + attachedEventId);
}
//#endregion

//#region idHelper
get_id100_if_zero = function (id100, x) {
  if (id100 > 0) return id100;

  const sceneVariableValue = $gameVariables.value(535);
  if (sceneVariableValue >= x + 1 && sceneVariableValue <= x + 100) {
    return sceneVariableValue - x;
  }

  return id100;
}
//#endregion

//#region souwa
//作品オリジナルのピクチャ挿話やキャラグラ移動等処理。401-600以外は直接コモンid入力
const SOUWA_ID_BASE = 400;
const SOUWA_EVENT_SLOT_FIRST_ID = 11;

original_souwa = function (id100, id101) {

  const souwaId = get_id100_if_zero(id100, SOUWA_ID_BASE);
  const souwaStepId = id101;
  if (souwaId != 31) return;//秩序の酒場の不良団員・酒・つまみ生成以外は未使用
  if (souwaStepId != 1) return;

  spawnOrderTavernNpc(11, 16, 15, 0, 'npcOrder2', 0, { direction: 4 });
  spawnOrderTavernNpc(12, 13, 15, 0, 'npcOrder2', 3, { direction: 6 });
  spawnOrderTavernGoods(13, 'food_2', 1, 4, 2, 15, 15, { offsetX: 25, offsetY: 10, priorityType: 2 });
  spawnOrderTavernGoods(14, 'food_2', 3, 6, 0, 14, 15, { offsetX: -25, offsetY: 10, priorityType: 2 });
  spawnOrderTavernGoods(15, 'food_1', 0, 4, 0, 15, 15, { offsetX: -24 });

};

// 秩序の酒場のNPCを生成して向きを設定する。
function spawnOrderTavernNpc(eventSlotId, ...respawnArgs) {
  const npcOptions = respawnArgs.pop();
  event_respawnSetN(eventSlotId, ...respawnArgs);
  const npcEvent = $gameMap.event($gameVariables.value(292)[eventSlotId]);
  npcEvent.setDirection(npcOptions.direction);
}

// 秩序の酒場の酒・つまみを生成し、スプライト位置とプライオリティを調整する。
function spawnOrderTavernGoods(eventSlotId, ...respawnArgs) {
  const goodsOptions = respawnArgs.pop();
  goodsEvent_respawn(eventSlotId, ...respawnArgs);

  const goodsEvent = $gameMap.event($gameVariables.value(292)[eventSlotId]);
  goodsEvent._spriteOffsetX = goodsOptions.offsetX;
  if (goodsOptions.offsetY !== undefined) goodsEvent._spriteOffsetY = goodsOptions.offsetY;
  if (goodsOptions.priorityType !== undefined) goodsEvent._priorityType = goodsOptions.priorityType;
}
//#endregion

//#region scene
const SCENE_PICTURE_ID_FIRST = 51;

//作品オリジナルのピクチャシーンやキャラグラ移動等処理。401-600以外は直接コモンid入力
original_scene = function (idScene, idStep) { //original_scene(0,1);//テストの際は変数535にid入力

  const adjustedSceneId = adjustSceneIdOriginalScene(idScene);

  switch (adjustedSceneId) {
    case 11: hMedicalExamination(idStep); break;//Ｈな診察
    case 100: monicaMassage(idStep); break;//モニカマッサージ,id1とid2。
    default: break;
  }
};

// 待ち時間(valuePicWait2)を返すステップ。
const H_MEDICAL_EXAMINATION_WAIT_STEPS = {
  1: hMedicalExaminationStep1OriginalScene,
  2: hMedicalExaminationStep2OriginalScene,
  3: hMedicalExaminationStep3OriginalScene,
  7: idScene11handleCase7OriginalScene,
  8: hMedicalExaminationStep8OriginalScene,
  10: hMedicalExaminationStep10OriginalScene,
  12: hMedicalExaminationStep12OriginalScene,
  90: hMedicalExaminationStep90OriginalScene
};

// 待ち時間を返さないステップ。
const H_MEDICAL_EXAMINATION_VOID_STEPS = {
  4: hMedicalExaminationStep4OriginalScene,
  5: hMedicalExaminationStep5OriginalScene,
  6: hMedicalExaminationStep6OriginalScene,
  9: hMedicalExaminationStep9OriginalScene,
  11: hMedicalExaminationStep11OriginalScene,
  91: hMedicalExaminationStep91OriginalScene
};

function hMedicalExamination(idStep) {
  valuePic1 = SCENE_PICTURE_ID_FIRST;

  const waitStepHandler = H_MEDICAL_EXAMINATION_WAIT_STEPS[idStep];
  if (waitStepHandler) {
    valuePicWait2 = waitStepHandler(valuePic1);
    return;
  }

  const voidStepHandler = H_MEDICAL_EXAMINATION_VOID_STEPS[idStep];
  if (voidStepHandler) voidStepHandler(valuePic1);
}

const MONICA_MASSAGE_STEPS = {
  1: monicaMassageStep1OriginalScene,
  2: monicaMassageStep2OriginalScene,
  3: monicaMassageStep3OriginalScene,
  //id3,id4は親関数で設定していないため固定値で渡す
  4: function (firstPictureId) { monicaMassageStep4OriginalScene(firstPictureId, 50, 200); },
  5: monicaMassageStep5OriginalScene,
  6: monicaMassageStep6OriginalScene,
  7: monicaMassageStep7OriginalScene,
  8: monicaMassageStep8OriginalScene,
  9: monicaMassageStep9OriginalScene
};

function monicaMassage(idStep) {
  valuePic1 = SCENE_PICTURE_ID_FIRST;

  const stepHandler = MONICA_MASSAGE_STEPS[idStep];
  if (stepHandler) stepHandler(valuePic1);
}
//#endregion


//#region scenes11
// ピクチャが存在すればセル(連番コマ)を1つ進める。
function addPictureCellCountIfExists(pictureId) {
  const picture = $gameScreen.picture(pictureId);
  if (!picture) return;
  picture.addCellCount();
}

// 診察シーン step1: 背景・暗雲・各差分の初期配置と移動
function hMedicalExaminationStep1OriginalScene(firstPictureId) {
  backGraund_menuMapSelect(2, 0, 0, 0);

  const scenePictureName = 'XevS011_';
  $gameScreen.showPicture(firstPictureId, scenePictureName + '00', 1, 640 - 128, 384, 100, 100, 0, 0);
  $gameScreen.showPicture(firstPictureId + 1, 'ScreenDarkCloudsH', 1, 640 - 256, 384, 100, 100, 0, 0);
  $gameScreen.setPicturesAnimation(6, 30, "連番", 60);
  $gameScreen.showPicture(firstPictureId + 2, scenePictureName + '02_00', 1, 640 - 128, 384 - 50, 100, 100, 0, 0);

  $gameScreen.showPicture(firstPictureId + 11, scenePictureName + '11', 1, 640 - 128, 384, 100, 100, 0, 0);
  $gameScreen.setPicturesAnimation(5, 30, "連番", 60);
  $gameScreen.showPicture(firstPictureId + 12, scenePictureName + '12_00', 1, 640 - 128, 384 + 200, 100, 100, 0, 0);

  $gameScreen.setPicturesAnimation(2, 15, "連番", 30);
  $gameScreen.showPicture(firstPictureId + 13, scenePictureName + '13_00', 1, 640 - 128,
    384 - (1732 / 2) + (768 / 2) + 100, 100, 100, 0, 0);

  $gameScreen.setPicturesAnimation(2, 30, "連番", 60);
  $gameScreen.showPicture(firstPictureId + 15, scenePictureName + '14_00', 1, 640 - 128, 384 + 50, 100, 100, 0, 0);

  pic_move1(firstPictureId, 0, 0, 100, 100, 255, 90);
  pic_move1(firstPictureId + 11, 0, 0, 100, 100, 255, 90);
  tachie_bless(firstPictureId + 2, 1);

  return 60;//valuePicWait2
}

// step2: 差分12を上へ移動
function hMedicalExaminationStep2OriginalScene(firstPictureId) {
  pic_move1(firstPictureId + 12, 0, -200, 100, 100, 255, 180);
  return 120;
}

// step3: 差分2を下へ移動
function hMedicalExaminationStep3OriginalScene(firstPictureId) {
  pic_move1(firstPictureId + 2, 0, 50, 100, 100, 255, 180);
  return 60;
}

// step4: 画面アニメーション(爆発/閃光)
function hMedicalExaminationStep4OriginalScene() {
  $gameScreen.startAnimation(520, 680, 179, false);
}

// step5: 差分12のセルを進める
function hMedicalExaminationStep5OriginalScene(firstPictureId) {
  addPictureCellCountIfExists(firstPictureId + 12);
}

// step6: 差分2のセルを進め、各差分をフェードアウト
function hMedicalExaminationStep6OriginalScene(firstPictureId) {
  addPictureCellCountIfExists(firstPictureId + 2);

  pic_move1(firstPictureId + 11, 0, 0, 100, 100, 0, 60);
  pic_move1(firstPictureId + 12, 0, 0, 100, 100, 0, 60);
  pic_move1(firstPictureId + 1, 0, 0, 100, 100, 200, 120);

  const fadeAnimationName = 'Hscene005';
  picture_fade1(firstPictureId + 1, "fadeIn", fadeAnimationName, 120, 5);
}

// step7: 差分13/15の移動
function idScene11handleCase7OriginalScene(firstPictureId) {
  pic_move1(firstPictureId + 13, 0, 0, 100, 100, 255, 120);
  pic_move1(firstPictureId + 15, 0, -50, 100, 100, 255, 120);
  return 120;
}

// step8: ピストン演出の開始とピクチャ配列の設定
function hMedicalExaminationStep8OriginalScene(firstPictureId) {
  pic_setArray1 = [1, firstPictureId + 13, 0, 384 + (1732 / 2) - (768 / 2) + 100, 5, 1200];
  pic_setArray2 = [1, 0, 0, 0, 0, 0];
  valueParallelPicSe1 = [0, 0, 0];
  valueParallelPicSe2 = [0, 0, 0];

  hcg_piston(firstPictureId + 13, 8, 1, 2);
  $gameSwitches.setValue(429, true);

  addPictureCellCountIfExists(firstPictureId + 15);
  return 60;
}

// step9: ピストン演出の終了
function hMedicalExaminationStep9OriginalScene() {
  $gameSwitches.setValue(429, false);
  valueParallelPicSe1 = [0, 0, 0];
  valueParallelPicSe2 = [0, 0, 0];
  pic_setArray(0, 0, 0, 0, 0, 0);
  picture_motion1("smooth", [0]);
}

// step10: 各差分を元の状態へ戻す
function hMedicalExaminationStep10OriginalScene(firstPictureId) {
  pic_move1(firstPictureId, 0, 0, 200, 200, 255, 60);
  pic_move1(firstPictureId + 1, 0, 0, 100, 100, 0, 60);
  pic_move1(firstPictureId + 13, 0, 0, 100, 100, 0, 60);
  pic_move1(firstPictureId + 15, 0, 0, 100, 100, 0, 60);
  return 60;
}

// step11: 差分2のセルを進め、差分11/12を戻す
function hMedicalExaminationStep11OriginalScene(firstPictureId) {
  pic_move1(firstPictureId, 0, 0, 100, 100, 255, 60);
  addPictureCellCountIfExists(firstPictureId + 2);
  pic_move1(firstPictureId + 11, 0, 0, 100, 100, 255, 60);
  pic_move1(firstPictureId + 12, 0, 0, 100, 100, 255, 60);
}

// step12: 差分12を下へ移動
function hMedicalExaminationStep12OriginalScene(firstPictureId) {
  pic_move1(firstPictureId + 12, 0, +200, 100, 100, 255, 180);
  return 120;
}

// step90: 2と3の間の仕様
function hMedicalExaminationStep90OriginalScene(firstPictureId) {
  pic_move1(firstPictureId, 0, 0, 25, 25, 150, 60);
  //NOTE: 元コードでは差分11を2回移動している(11と12の取り違えと思われるが挙動を変えない)
  pic_move1(firstPictureId + 11, 0, 0, 25, 25, 150, 60);
  pic_move1(firstPictureId + 11, 0, 0, 25, 25, 150, 60);
  return 60;
}

// step91: 2と3の間の仕様(step90の取り消し)
function hMedicalExaminationStep91OriginalScene(firstPictureId) {
  pic_move1(firstPictureId, 0, 0, 100, 100, 255, 60);
  //NOTE: step90 と同じく差分11を2回移動している。挙動を変えないためそのまま。
  pic_move1(firstPictureId + 11, 0, 0, 100, 100, 255, 60);
  pic_move1(firstPictureId + 11, 0, 0, 100, 100, 255, 60);
}
//#endregion

//#region scenes100
const MONICA_MASSAGE_BGS_HANDY_MASSAGER = { "name": "21_HandyMassager1", "volume": 50, "pitch": 100, "pan": 0 };
const MONICA_MASSAGE_BGS_HANDY_MASSAGER_FASTER = { "name": "21_HandyMassager1", "volume": 60, "pitch": 120, "pan": 0 };
//マッサージ差分は 101_xx 系のピクチャを +1 .. +10 のIDで並べる
const MONICA_MASSAGE_PICTURE_OFFSET_FIRST = 1;
const MONICA_MASSAGE_PICTURE_OFFSET_LAST = 8;

// step1: 背景・顔差分・振動の初期化
function monicaMassageStep1OriginalScene(firstPictureId) {
  AudioManager.playBgs(MONICA_MASSAGE_BGS_HANDY_MASSAGER);

  pic_1(0, firstPictureId, 'XevS101_00back', 0, 100, 255, 60, 1280, 768, -256, 0);
  pic_1(0, firstPictureId + 1, 'XevS101_00back2', 0, 100, 255, 60, 1280, 768, -256, 0);
  pic_1(0, firstPictureId + 2, 'XevS101_01', 0, 100, 255, 60, 1280, 768, -256, 0);
  pic_1(0, firstPictureId + 6, 'XevS101_01face1', 0, 100, 255, 60, 1280, 768, -256, 0);

  showMonicaMassageVibrationPictures(firstPictureId, 'XevS101_01_100', [2, 3, 4, 5], [4, 5, 2, 3], 15, 20);

  for (let pictureId = firstPictureId + MONICA_MASSAGE_PICTURE_OFFSET_FIRST;
    pictureId <= firstPictureId + MONICA_MASSAGE_PICTURE_OFFSET_LAST; pictureId++) {
    hcg_piston(pictureId, 5, 1, 2);
  }
}

// step2: 表情2へ変更し振動を強める
function monicaMassageStep2OriginalScene(firstPictureId) {
  AudioManager.playBgs(MONICA_MASSAGE_BGS_HANDY_MASSAGER_FASTER);

  pic_1(2, firstPictureId + 2, 'XevS101_01', 0, 100, 255, 1, 1280, 768, -256, 0);
  pic_1(2, firstPictureId + 6, 'XevS101_01face2', 0, 100, 255, 1, 1280, 768, -256, 0);

  showMonicaMassageVibrationPictures(firstPictureId, 'XevS101_02_100', [0, 2, 3, 4, 5], [0, 4, 5, 2, 3], 5, 10);

  for (let pictureId = firstPictureId + MONICA_MASSAGE_PICTURE_OFFSET_FIRST;
    pictureId <= firstPictureId + MONICA_MASSAGE_PICTURE_OFFSET_LAST; pictureId++) {
    hcg_piston(pictureId, 5, 3, 2);
  }
}

// step3: 差分を差し替え、新しい振動差分を追加
function monicaMassageStep3OriginalScene(firstPictureId) {
  pic_eraseP(2, [firstPictureId + 2]);

  pic_1(2, firstPictureId + 3, 'XevS101_02', 0, 100, 255, 1, 1280, 768, -256, 0);
  pic_1(2, firstPictureId + 6, 'XevS101_01face3', 0, 100, 255, 1, 1280, 768, -256, 0);

  showMonicaMassageVibrationPicture(firstPictureId + 9, 'XevS101_03_100', 4, [3, 1, 5, 1], 5, 255, 10);
  showMonicaMassageVibrationPicture(firstPictureId + 10, 'XevS101_03_100', 4, [1, 2, 1, 4], 5, 255, 10);

  for (let pictureId = firstPictureId + MONICA_MASSAGE_PICTURE_OFFSET_FIRST;
    pictureId <= firstPictureId + MONICA_MASSAGE_PICTURE_OFFSET_LAST; pictureId++) {
    hcg_piston(pictureId, 5, 3, 2);
  }
  for (let pictureId = firstPictureId + 9; pictureId <= firstPictureId + 10; pictureId++) {
    hcg_piston(pictureId, 5, 3, 1);
  }
}

// step4: 全差分を画面中央へ移動
function monicaMassageStep4OriginalScene(firstPictureId, yOffset, scalePercent) {
  for (let pictureId = firstPictureId; pictureId <= firstPictureId + 10; pictureId++) {
    const picture = $gameScreen.picture(pictureId);
    if (!picture) continue;

    const currentOpacity = picture.opacity();
    $gameScreen.movePicture(pictureId, 1, 640, 384 + yOffset, scalePercent, scalePercent, currentOpacity, 0, 120);
  }
}

// step5: 新しい背景を表示
function monicaMassageStep5OriginalScene(firstPictureId) {
  pic_1(0, firstPictureId, 'XevS101_04back', 0, 100, 255, 120, 1280, 768, 0, 0);
  pic_1(0, firstPictureId + 1, 'XevS101_04', 0, 100, 255, 120, 1280, 768, 0, 0);
  hcg_piston(firstPictureId + 1, 5, 1, 2);
}

// step6: 差分をまとめて消去
function monicaMassageStep6OriginalScene(firstPictureId) {
  const pictureIdsToErase = [];
  for (let pictureId = firstPictureId; pictureId <= firstPictureId + 11; pictureId++) {
    pictureIdsToErase.push(pictureId);
  }
  pic_eraseP(0, pictureIdsToErase);
}

// step7: BGSをフェードアウトし、差分を縮小して消す
function monicaMassageStep7OriginalScene(firstPictureId) {
  AudioManager.fadeOutBgs(10);
  for (let pictureId = firstPictureId; pictureId <= firstPictureId + 10; pictureId++) {
    if (!$gameScreen.picture(pictureId)) continue;
    pic_move1(pictureId, 0, 0, 300, 300, 0, 120);
  }
}

// step8: BGSを戻し、差分を元の倍率に戻す
function monicaMassageStep8OriginalScene(firstPictureId) {
  AudioManager.playBgs(MONICA_MASSAGE_BGS_HANDY_MASSAGER_FASTER);
  for (let pictureId = firstPictureId; pictureId <= firstPictureId + 10; pictureId++) {
    if (!$gameScreen.picture(pictureId)) continue;
    pic_move1(pictureId, 0, 0, 300, 300, 255, 60);
  }
}

// step9: 最終差分の表示とピストン演出
function monicaMassageStep9OriginalScene(firstPictureId) {
  pic_1(0, firstPictureId + 2, 'XevS101_05', 2, 100, 255, 60, 1280, 768, 0, 0);
  hcg_piston(firstPictureId + 2, 5, 1, 2);
}

// 振動差分(手前と奥の2枚)をまとめて表示する。
function showMonicaMassageVibrationPictures(firstPictureId, animationImageName,
  frontCellPattern, backCellPattern, frontSpeed, backSpeed) {
  showMonicaMassageVibrationPicture(firstPictureId + 7, animationImageName, 5, frontCellPattern, frontSpeed, 200, 60);
  showMonicaMassageVibrationPicture(firstPictureId + 8, animationImageName, 5, backCellPattern, backSpeed, 100, 60);
}

// 振動差分1枚分(連番アニメ + X座標を直接指定 + 移動)。
function showMonicaMassageVibrationPicture(pictureId, animationImageName, cellCount,
  cellPattern, animationSpeed, opacity, moveDuration) {
  picture_anime1(pictureId, animationImageName, cellCount, 1, "連番", animationSpeed, 3, true, cellPattern);
  $gameScreen.picture(pictureId)._x = 640 - 128;
  $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, opacity, 0, moveDuration);
}
//#endregion

//#region adjustSceneId
// 変数535(501-600)にシーンIDを直接入力してテストできるようにする。
const SCENE_ID_TEST_VARIABLE_ID = 535;
const SCENE_ID_TEST_RANGE_FIRST = 501;
const SCENE_ID_TEST_RANGE_LAST = 600;
const SCENE_ID_TEST_OFFSET = 500;

function adjustSceneIdOriginalScene(idScene) {
  if (idScene !== 0) return idScene;

  const sceneIdTestValue = $gameVariables.value(SCENE_ID_TEST_VARIABLE_ID);
  if (sceneIdTestValue < SCENE_ID_TEST_RANGE_FIRST) return idScene;
  if (sceneIdTestValue > SCENE_ID_TEST_RANGE_LAST) return idScene;
  return sceneIdTestValue - SCENE_ID_TEST_OFFSET;
}
//#endregion

//}());

