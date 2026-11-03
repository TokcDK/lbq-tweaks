/*:
 * @plugindesc Shared functions and constans using from other places
 * @author author
 *
 * @help
 * 
 */

(function (global) {

// `[\C[n]label\C[0]] ` — the shape shared by most single-value effect notes.
colorTaggedText = function (colorCode, text) {
  return `\\C[${colorCode}]${text}\\C[0]`;
}

// 配列から 1 つをランダムに選ぶ(getRandomIndex の消費回数は元コードと同じ 1 回)。
pickRandomValue = function(values) {
  return values[getRandomIndex(values.length)];
}

})();
