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

})();
