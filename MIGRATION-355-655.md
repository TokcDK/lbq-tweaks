# Migration report — event Script (355/655) → `js/plugins/amygameHelper.js`

## Scope

Every `data/CommonEvents.json` and `data/Map*.json` command that carries JavaScript was
inventoried (skill `rpgmaker-event-js-extractor`). The migration target was the **Script
command family** — code 355 plus its contiguous 655 continuation lines. The other
JavaScript-bearing commands were inventoried but left in place:

| kind | count | action |
|---|---|---|
| `event-script` (355 + 655) | 6700 | **migrated / fixed** |
| `move-route-script` (205 → 45) | 771 | left in place (see "Move routes") |
| `conditional-expression` (111/12) | 571 | left in place |
| `variable-expression` (122/4) | 60 | left in place |
| `mv-plugin-command` (356) | 774 | not JavaScript |
| `mz-plugin-command` (357) | 1 | not JavaScript |

Inventory: 8877 blocks, 4093 warnings, of which 302 flagged "syntax error".

## What was extracted

*Source*: `data/CommonEvents.json` and 74 `data/Map*.json` files.
*Target*: `js/plugins/amygameHelper.js` — 666 new `AGH_evtNNNN_*` functions in a
banner-headed section appended before the closing `})();` (file grew 3415 → 9416 lines).

Selection rule: a block was moved when it was **duplicated** across events or **proven to
execute** by the runtime log (`console.log.txt`, 639 eval entries / 162 distinct bodies).

Result: **2086 Script commands** reduced to a single `AGH_evtNNNN_*()` call, and the
**4752 655 continuation lines** they carried were deleted. A command census confirms the
change is surgical: 355 count unchanged (6700 → 6700), every other command code unchanged
(42236 → 42236), 655 reduced by exactly 4870 (4752 + 118 from the fixes below).

Two shapes were emitted:

* `AGH_evtNNNN_xxx();` — self-contained bodies.
* `AGH_evtNNNN_xxx(this, ...);` — bodies that used the interpreter. The body runs through
  `.call(interp)` so `this` keeps its original meaning, including for the callbacks that
  were passed `this` in the source block. 193 such functions.
* `__a0, __a1, …` are the literals that differed between the duplicated source blocks
  (numbers and strings), in first-occurrence order. 506 parameters total.

Player-facing text was made translation-friendly per `rpgmaker-translatable-text-refactor`:
split at control codes / wrapper brackets / label colons (R10), control codes named
outside the translatable string (R11), no call with backtick-quoted arguments inside another
template (R12). 292 `//翻訳対象` consts and 100 `// code, not translation text` consts were
hoisted; the rendered string is byte-identical to the original.

## Bugs found and fixed

### 1. 26 Script blocks that were `eval()` syntax errors

These blocks threw a `SyntaxError` inside `Game_Interpreter#command355` (no try/catch), so
the event died at that command. None of the 26 appears in the runtime log, so none is
reachable in the tested path. Each block is either prose that lost its `//`, a dangling
`if (`/`for (` whose closing line was lost, pseudo-code with a `※` placeholder, or code
glued onto a documentation line. Policy: comment out the unparseable lines and keep every
complete, self-contained statement — no behaviour invented.

Examples: CE3:86 (chained statement kept, `1位は …` prose commented), CE4:91 (five real
statements kept, dangling `if` commented), CE495:100/105/120 and their CE532/CE548 twins
(`adv_HpartDirectPlay`, `adv_partDirectPlay/Set`, `sex_direction`, `pic_eraseP` kept),
Map003 event 218 (`h_exp`, two `this.sVal` kept, `\V[22]…` prose commented).

### 2. Wrong-representative grouping (found by verification, fixed before commit)

The first generation picked each group's representative body from the **whole** group
instead of from the text-signature partition it belonged to, so a block inherited another
partition's baked literals. Concretely, actor-name blocks such as
`$gameActors.actor(21).setName(\`受付嬢\\} ${$dataWeapons[76].name} …\`)` were emitted as
`$gameActors.actor(21).setName(\`情報屋\`)`. The generator was corrected to select the
representative per partition (plus a literal-slot alignment guard), and the whole migration
was re-run from a pristine tree.

### 3. Not a bug — YEP_MoveRouteCore pseudo-commands

138 move-route "Script" entries look like broken labels (`UP: 20`, `Move To: X, Y`,
`Move To: Event 5`). They are documented `YEP_MoveRouteCore` pseudo-commands parsed by the
plugin's `processMoveCommand` override before the engine ever evals them. Left untouched.

## Verification

| check | result |
|---|---|
| data files parse (JSON) | 214/214 |
| 355 blocks now single `AGH_evt*` calls | 2086/2086 |
| call expressions parse | 2086/2086 |
| fix bodies parse | 26/26 |
| helpers defined / called & defined | 666/666 |
| orphan 655 commands | 0 |
| unparseable 355 blocks remaining | 0 |
| runtime log coverage ("need review") | 0 |
| identifier-set audit over all 2086 edits | 0 mismatches |
| behavioural equivalence harness, **all 2112 sites** | 2086 equivalent, 0 mismatched |
| untouched 355 blocks byte-identical to `HEAD` | 4588, 0 unexpectedly changed |
| headless helper smoke test (`mv-headless-runtime.js`) | ALL 666 HELPERS DEFINED |
| BOM / CRLF conventions on edited files | preserved |

The equivalence harness runs each original block body and its generated helper inside the
same recording environment (property reads, method calls with arguments, writes, thrown
errors) and compares the traces — that is what caught bug 2.

**In-game test not run.**

## Traps checked

`this` semantics (incl. callbacks that received `this`), `var`-vs-`eval` scope in
`YEP_CoreEngine#command355`, implicit globals (`valuePic1`, `valueCountSet*`) preserved
because the plugin is a non-strict IIFE, `arguments`/`with`/`async` bodies skipped, no
`__aN` identifier collisions, text templates that end in `//` comments, template literals
containing `}` and control codes, note spans that look like `{"code":` inside script
strings, autonomous move-route lists, and per-item optional notetag keys.
