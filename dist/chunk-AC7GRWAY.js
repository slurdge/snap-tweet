"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }




var _chunk3EAOVE4Wjs = require('./chunk-3EAOVE4W.js');


var _chunk2HKELI3Rjs = require('./chunk-2HKELI3R.js');




var _chunkRIYM4ALWjs = require('./chunk-RIYM4ALW.js');

// node_modules/.pnpm/fs.realpath@1.0.0/node_modules/fs.realpath/old.js
var require_old = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports) => {
  var pathModule = require("path");
  var isWindows = process.platform === "win32";
  var fs = require("fs");
  var DEBUG = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);
  function rethrow() {
    var callback;
    if (DEBUG) {
      var backtrace = new Error();
      callback = debugCallback;
    } else
      callback = missingCallback;
    return callback;
    function debugCallback(err) {
      if (err) {
        backtrace.message = err.message;
        err = backtrace;
        missingCallback(err);
      }
    }
    function missingCallback(err) {
      if (err) {
        if (process.throwDeprecation)
          throw err;
        else if (!process.noDeprecation) {
          var msg = "fs: missing callback " + (err.stack || err.message);
          if (process.traceDeprecation)
            console.trace(msg);
          else
            console.error(msg);
        }
      }
    }
  }
  function maybeCallback(cb) {
    return typeof cb === "function" ? cb : rethrow();
  }
  var normalize = pathModule.normalize;
  if (isWindows) {
    nextPartRe = /(.*?)(?:[\/\\]+|$)/g;
  } else {
    nextPartRe = /(.*?)(?:[\/]+|$)/g;
  }
  var nextPartRe;
  if (isWindows) {
    splitRootRe = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
  } else {
    splitRootRe = /^[\/]*/;
  }
  var splitRootRe;
  exports.realpathSync = function realpathSync(p, cache) {
    p = pathModule.resolve(p);
    if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
      return cache[p];
    }
    var original = p, seenLinks = {}, knownHard = {};
    var pos;
    var current;
    var base;
    var previous;
    start();
    function start() {
      var m = splitRootRe.exec(p);
      pos = m[0].length;
      current = m[0];
      base = m[0];
      previous = "";
      if (isWindows && !knownHard[base]) {
        fs.lstatSync(base);
        knownHard[base] = true;
      }
    }
    while (pos < p.length) {
      nextPartRe.lastIndex = pos;
      var result = nextPartRe.exec(p);
      previous = current;
      current += result[0];
      base = previous + result[1];
      pos = nextPartRe.lastIndex;
      if (knownHard[base] || cache && cache[base] === base) {
        continue;
      }
      var resolvedLink;
      if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
        resolvedLink = cache[base];
      } else {
        var stat = fs.lstatSync(base);
        if (!stat.isSymbolicLink()) {
          knownHard[base] = true;
          if (cache)
            cache[base] = base;
          continue;
        }
        var linkTarget = null;
        if (!isWindows) {
          var id = stat.dev.toString(32) + ":" + stat.ino.toString(32);
          if (seenLinks.hasOwnProperty(id)) {
            linkTarget = seenLinks[id];
          }
        }
        if (linkTarget === null) {
          fs.statSync(base);
          linkTarget = fs.readlinkSync(base);
        }
        resolvedLink = pathModule.resolve(previous, linkTarget);
        if (cache)
          cache[base] = resolvedLink;
        if (!isWindows)
          seenLinks[id] = linkTarget;
      }
      p = pathModule.resolve(resolvedLink, p.slice(pos));
      start();
    }
    if (cache)
      cache[original] = p;
    return p;
  };
  exports.realpath = function realpath(p, cache, cb) {
    if (typeof cb !== "function") {
      cb = maybeCallback(cache);
      cache = null;
    }
    p = pathModule.resolve(p);
    if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
      return process.nextTick(cb.bind(null, null, cache[p]));
    }
    var original = p, seenLinks = {}, knownHard = {};
    var pos;
    var current;
    var base;
    var previous;
    start();
    function start() {
      var m = splitRootRe.exec(p);
      pos = m[0].length;
      current = m[0];
      base = m[0];
      previous = "";
      if (isWindows && !knownHard[base]) {
        fs.lstat(base, function(err) {
          if (err)
            return cb(err);
          knownHard[base] = true;
          LOOP();
        });
      } else {
        process.nextTick(LOOP);
      }
    }
    function LOOP() {
      if (pos >= p.length) {
        if (cache)
          cache[original] = p;
        return cb(null, p);
      }
      nextPartRe.lastIndex = pos;
      var result = nextPartRe.exec(p);
      previous = current;
      current += result[0];
      base = previous + result[1];
      pos = nextPartRe.lastIndex;
      if (knownHard[base] || cache && cache[base] === base) {
        return process.nextTick(LOOP);
      }
      if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
        return gotResolvedLink(cache[base]);
      }
      return fs.lstat(base, gotStat);
    }
    function gotStat(err, stat) {
      if (err)
        return cb(err);
      if (!stat.isSymbolicLink()) {
        knownHard[base] = true;
        if (cache)
          cache[base] = base;
        return process.nextTick(LOOP);
      }
      if (!isWindows) {
        var id = stat.dev.toString(32) + ":" + stat.ino.toString(32);
        if (seenLinks.hasOwnProperty(id)) {
          return gotTarget(null, seenLinks[id], base);
        }
      }
      fs.stat(base, function(err2) {
        if (err2)
          return cb(err2);
        fs.readlink(base, function(err3, target) {
          if (!isWindows)
            seenLinks[id] = target;
          gotTarget(err3, target);
        });
      });
    }
    function gotTarget(err, target, base2) {
      if (err)
        return cb(err);
      var resolvedLink = pathModule.resolve(previous, target);
      if (cache)
        cache[base2] = resolvedLink;
      gotResolvedLink(resolvedLink);
    }
    function gotResolvedLink(resolvedLink) {
      p = pathModule.resolve(resolvedLink, p.slice(pos));
      start();
    }
  };
});

// node_modules/.pnpm/fs.realpath@1.0.0/node_modules/fs.realpath/index.js
var require_fs = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  module.exports = realpath;
  realpath.realpath = realpath;
  realpath.sync = realpathSync;
  realpath.realpathSync = realpathSync;
  realpath.monkeypatch = monkeypatch;
  realpath.unmonkeypatch = unmonkeypatch;
  var fs = require("fs");
  var origRealpath = fs.realpath;
  var origRealpathSync = fs.realpathSync;
  var version = process.version;
  var ok = /^v[0-5]\./.test(version);
  var old = require_old();
  function newError(er) {
    return er && er.syscall === "realpath" && (er.code === "ELOOP" || er.code === "ENOMEM" || er.code === "ENAMETOOLONG");
  }
  function realpath(p, cache, cb) {
    if (ok) {
      return origRealpath(p, cache, cb);
    }
    if (typeof cache === "function") {
      cb = cache;
      cache = null;
    }
    origRealpath(p, cache, function(er, result) {
      if (newError(er)) {
        old.realpath(p, cache, cb);
      } else {
        cb(er, result);
      }
    });
  }
  function realpathSync(p, cache) {
    if (ok) {
      return origRealpathSync(p, cache);
    }
    try {
      return origRealpathSync(p, cache);
    } catch (er) {
      if (newError(er)) {
        return old.realpathSync(p, cache);
      } else {
        throw er;
      }
    }
  }
  function monkeypatch() {
    fs.realpath = realpath;
    fs.realpathSync = realpathSync;
  }
  function unmonkeypatch() {
    fs.realpath = origRealpath;
    fs.realpathSync = origRealpathSync;
  }
});

// node_modules/.pnpm/concat-map@0.0.1/node_modules/concat-map/index.js
var require_concat_map = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  module.exports = function(xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
      var x = fn(xs[i], i);
      if (isArray(x))
        res.push.apply(res, x);
      else
        res.push(x);
    }
    return res;
  };
  var isArray = Array.isArray || function(xs) {
    return Object.prototype.toString.call(xs) === "[object Array]";
  };
});

// node_modules/.pnpm/balanced-match@1.0.2/node_modules/balanced-match/index.js
var require_balanced_match = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  module.exports = balanced;
  function balanced(a, b, str) {
    if (a instanceof RegExp)
      a = maybeMatch(a, str);
    if (b instanceof RegExp)
      b = maybeMatch(b, str);
    var r = range(a, b, str);
    return r && {
      start: r[0],
      end: r[1],
      pre: str.slice(0, r[0]),
      body: str.slice(r[0] + a.length, r[1]),
      post: str.slice(r[1] + b.length)
    };
  }
  function maybeMatch(reg, str) {
    var m = str.match(reg);
    return m ? m[0] : null;
  }
  balanced.range = range;
  function range(a, b, str) {
    var begs, beg, left, right, result;
    var ai = str.indexOf(a);
    var bi = str.indexOf(b, ai + 1);
    var i = ai;
    if (ai >= 0 && bi > 0) {
      if (a === b) {
        return [ai, bi];
      }
      begs = [];
      left = str.length;
      while (i >= 0 && !result) {
        if (i == ai) {
          begs.push(i);
          ai = str.indexOf(a, i + 1);
        } else if (begs.length == 1) {
          result = [begs.pop(), bi];
        } else {
          beg = begs.pop();
          if (beg < left) {
            left = beg;
            right = bi;
          }
          bi = str.indexOf(b, i + 1);
        }
        i = ai < bi && ai >= 0 ? ai : bi;
      }
      if (begs.length) {
        result = [left, right];
      }
    }
    return result;
  }
});

// node_modules/.pnpm/brace-expansion@1.1.11/node_modules/brace-expansion/index.js
var require_brace_expansion = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  var concatMap = require_concat_map();
  var balanced = require_balanced_match();
  module.exports = expandTop;
  var escSlash = "\0SLASH" + Math.random() + "\0";
  var escOpen = "\0OPEN" + Math.random() + "\0";
  var escClose = "\0CLOSE" + Math.random() + "\0";
  var escComma = "\0COMMA" + Math.random() + "\0";
  var escPeriod = "\0PERIOD" + Math.random() + "\0";
  function numeric(str) {
    return parseInt(str, 10) == str ? parseInt(str, 10) : str.charCodeAt(0);
  }
  function escapeBraces(str) {
    return str.split("\\\\").join(escSlash).split("\\{").join(escOpen).split("\\}").join(escClose).split("\\,").join(escComma).split("\\.").join(escPeriod);
  }
  function unescapeBraces(str) {
    return str.split(escSlash).join("\\").split(escOpen).join("{").split(escClose).join("}").split(escComma).join(",").split(escPeriod).join(".");
  }
  function parseCommaParts(str) {
    if (!str)
      return [""];
    var parts = [];
    var m = balanced("{", "}", str);
    if (!m)
      return str.split(",");
    var pre = m.pre;
    var body = m.body;
    var post = m.post;
    var p = pre.split(",");
    p[p.length - 1] += "{" + body + "}";
    var postParts = parseCommaParts(post);
    if (post.length) {
      p[p.length - 1] += postParts.shift();
      p.push.apply(p, postParts);
    }
    parts.push.apply(parts, p);
    return parts;
  }
  function expandTop(str) {
    if (!str)
      return [];
    if (str.substr(0, 2) === "{}") {
      str = "\\{\\}" + str.substr(2);
    }
    return expand(escapeBraces(str), true).map(unescapeBraces);
  }
  function embrace(str) {
    return "{" + str + "}";
  }
  function isPadded(el) {
    return /^-?0\d/.test(el);
  }
  function lte(i, y) {
    return i <= y;
  }
  function gte(i, y) {
    return i >= y;
  }
  function expand(str, isTop) {
    var expansions = [];
    var m = balanced("{", "}", str);
    if (!m || /\$$/.test(m.pre))
      return [str];
    var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
    var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
    var isSequence = isNumericSequence || isAlphaSequence;
    var isOptions = m.body.indexOf(",") >= 0;
    if (!isSequence && !isOptions) {
      if (m.post.match(/,.*\}/)) {
        str = m.pre + "{" + m.body + escClose + m.post;
        return expand(str);
      }
      return [str];
    }
    var n;
    if (isSequence) {
      n = m.body.split(/\.\./);
    } else {
      n = parseCommaParts(m.body);
      if (n.length === 1) {
        n = expand(n[0], false).map(embrace);
        if (n.length === 1) {
          var post = m.post.length ? expand(m.post, false) : [""];
          return post.map(function(p) {
            return m.pre + n[0] + p;
          });
        }
      }
    }
    var pre = m.pre;
    var post = m.post.length ? expand(m.post, false) : [""];
    var N;
    if (isSequence) {
      var x = numeric(n[0]);
      var y = numeric(n[1]);
      var width = Math.max(n[0].length, n[1].length);
      var incr = n.length == 3 ? Math.abs(numeric(n[2])) : 1;
      var test = lte;
      var reverse = y < x;
      if (reverse) {
        incr *= -1;
        test = gte;
      }
      var pad = n.some(isPadded);
      N = [];
      for (var i = x; test(i, y); i += incr) {
        var c;
        if (isAlphaSequence) {
          c = String.fromCharCode(i);
          if (c === "\\")
            c = "";
        } else {
          c = String(i);
          if (pad) {
            var need = width - c.length;
            if (need > 0) {
              var z = new Array(need + 1).join("0");
              if (i < 0)
                c = "-" + z + c.slice(1);
              else
                c = z + c;
            }
          }
        }
        N.push(c);
      }
    } else {
      N = concatMap(n, function(el) {
        return expand(el, false);
      });
    }
    for (var j = 0; j < N.length; j++) {
      for (var k = 0; k < post.length; k++) {
        var expansion = pre + N[j] + post[k];
        if (!isTop || isSequence || expansion)
          expansions.push(expansion);
      }
    }
    return expansions;
  }
});

// node_modules/.pnpm/minimatch@3.0.4/node_modules/minimatch/minimatch.js
var require_minimatch = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  module.exports = minimatch;
  minimatch.Minimatch = Minimatch;
  var path = {sep: "/"};
  try {
    path = require("path");
  } catch (er) {
  }
  var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {};
  var expand = require_brace_expansion();
  var plTypes = {
    "!": {open: "(?:(?!(?:", close: "))[^/]*?)"},
    "?": {open: "(?:", close: ")?"},
    "+": {open: "(?:", close: ")+"},
    "*": {open: "(?:", close: ")*"},
    "@": {open: "(?:", close: ")"}
  };
  var qmark = "[^/]";
  var star = qmark + "*?";
  var twoStarDot = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?";
  var twoStarNoDot = "(?:(?!(?:\\/|^)\\.).)*?";
  var reSpecials = charSet("().*{}+?[]^$\\!");
  function charSet(s) {
    return s.split("").reduce(function(set, c) {
      set[c] = true;
      return set;
    }, {});
  }
  var slashSplit = /\/+/;
  minimatch.filter = filter;
  function filter(pattern, options) {
    options = options || {};
    return function(p, i, list) {
      return minimatch(p, pattern, options);
    };
  }
  function ext(a, b) {
    a = a || {};
    b = b || {};
    var t = {};
    Object.keys(b).forEach(function(k) {
      t[k] = b[k];
    });
    Object.keys(a).forEach(function(k) {
      t[k] = a[k];
    });
    return t;
  }
  minimatch.defaults = function(def) {
    if (!def || !Object.keys(def).length)
      return minimatch;
    var orig = minimatch;
    var m = function minimatch2(p, pattern, options) {
      return orig.minimatch(p, pattern, ext(def, options));
    };
    m.Minimatch = function Minimatch2(pattern, options) {
      return new orig.Minimatch(pattern, ext(def, options));
    };
    return m;
  };
  Minimatch.defaults = function(def) {
    if (!def || !Object.keys(def).length)
      return Minimatch;
    return minimatch.defaults(def).Minimatch;
  };
  function minimatch(p, pattern, options) {
    if (typeof pattern !== "string") {
      throw new TypeError("glob pattern string required");
    }
    if (!options)
      options = {};
    if (!options.nocomment && pattern.charAt(0) === "#") {
      return false;
    }
    if (pattern.trim() === "")
      return p === "";
    return new Minimatch(pattern, options).match(p);
  }
  function Minimatch(pattern, options) {
    if (!(this instanceof Minimatch)) {
      return new Minimatch(pattern, options);
    }
    if (typeof pattern !== "string") {
      throw new TypeError("glob pattern string required");
    }
    if (!options)
      options = {};
    pattern = pattern.trim();
    if (path.sep !== "/") {
      pattern = pattern.split(path.sep).join("/");
    }
    this.options = options;
    this.set = [];
    this.pattern = pattern;
    this.regexp = null;
    this.negate = false;
    this.comment = false;
    this.empty = false;
    this.make();
  }
  Minimatch.prototype.debug = function() {
  };
  Minimatch.prototype.make = make;
  function make() {
    if (this._made)
      return;
    var pattern = this.pattern;
    var options = this.options;
    if (!options.nocomment && pattern.charAt(0) === "#") {
      this.comment = true;
      return;
    }
    if (!pattern) {
      this.empty = true;
      return;
    }
    this.parseNegate();
    var set = this.globSet = this.braceExpand();
    if (options.debug)
      this.debug = console.error;
    this.debug(this.pattern, set);
    set = this.globParts = set.map(function(s) {
      return s.split(slashSplit);
    });
    this.debug(this.pattern, set);
    set = set.map(function(s, si, set2) {
      return s.map(this.parse, this);
    }, this);
    this.debug(this.pattern, set);
    set = set.filter(function(s) {
      return s.indexOf(false) === -1;
    });
    this.debug(this.pattern, set);
    this.set = set;
  }
  Minimatch.prototype.parseNegate = parseNegate;
  function parseNegate() {
    var pattern = this.pattern;
    var negate = false;
    var options = this.options;
    var negateOffset = 0;
    if (options.nonegate)
      return;
    for (var i = 0, l = pattern.length; i < l && pattern.charAt(i) === "!"; i++) {
      negate = !negate;
      negateOffset++;
    }
    if (negateOffset)
      this.pattern = pattern.substr(negateOffset);
    this.negate = negate;
  }
  minimatch.braceExpand = function(pattern, options) {
    return braceExpand(pattern, options);
  };
  Minimatch.prototype.braceExpand = braceExpand;
  function braceExpand(pattern, options) {
    if (!options) {
      if (this instanceof Minimatch) {
        options = this.options;
      } else {
        options = {};
      }
    }
    pattern = typeof pattern === "undefined" ? this.pattern : pattern;
    if (typeof pattern === "undefined") {
      throw new TypeError("undefined pattern");
    }
    if (options.nobrace || !pattern.match(/\{.*\}/)) {
      return [pattern];
    }
    return expand(pattern);
  }
  Minimatch.prototype.parse = parse;
  var SUBPARSE = {};
  function parse(pattern, isSub) {
    if (pattern.length > 1024 * 64) {
      throw new TypeError("pattern is too long");
    }
    var options = this.options;
    if (!options.noglobstar && pattern === "**")
      return GLOBSTAR;
    if (pattern === "")
      return "";
    var re = "";
    var hasMagic = !!options.nocase;
    var escaping = false;
    var patternListStack = [];
    var negativeLists = [];
    var stateChar;
    var inClass = false;
    var reClassStart = -1;
    var classStart = -1;
    var patternStart = pattern.charAt(0) === "." ? "" : options.dot ? "(?!(?:^|\\/)\\.{1,2}(?:$|\\/))" : "(?!\\.)";
    var self = this;
    function clearStateChar() {
      if (stateChar) {
        switch (stateChar) {
          case "*":
            re += star;
            hasMagic = true;
            break;
          case "?":
            re += qmark;
            hasMagic = true;
            break;
          default:
            re += "\\" + stateChar;
            break;
        }
        self.debug("clearStateChar %j %j", stateChar, re);
        stateChar = false;
      }
    }
    for (var i = 0, len = pattern.length, c; i < len && (c = pattern.charAt(i)); i++) {
      this.debug("%s	%s %s %j", pattern, i, re, c);
      if (escaping && reSpecials[c]) {
        re += "\\" + c;
        escaping = false;
        continue;
      }
      switch (c) {
        case "/":
          return false;
        case "\\":
          clearStateChar();
          escaping = true;
          continue;
        case "?":
        case "*":
        case "+":
        case "@":
        case "!":
          this.debug("%s	%s %s %j <-- stateChar", pattern, i, re, c);
          if (inClass) {
            this.debug("  in class");
            if (c === "!" && i === classStart + 1)
              c = "^";
            re += c;
            continue;
          }
          self.debug("call clearStateChar %j", stateChar);
          clearStateChar();
          stateChar = c;
          if (options.noext)
            clearStateChar();
          continue;
        case "(":
          if (inClass) {
            re += "(";
            continue;
          }
          if (!stateChar) {
            re += "\\(";
            continue;
          }
          patternListStack.push({
            type: stateChar,
            start: i - 1,
            reStart: re.length,
            open: plTypes[stateChar].open,
            close: plTypes[stateChar].close
          });
          re += stateChar === "!" ? "(?:(?!(?:" : "(?:";
          this.debug("plType %j %j", stateChar, re);
          stateChar = false;
          continue;
        case ")":
          if (inClass || !patternListStack.length) {
            re += "\\)";
            continue;
          }
          clearStateChar();
          hasMagic = true;
          var pl = patternListStack.pop();
          re += pl.close;
          if (pl.type === "!") {
            negativeLists.push(pl);
          }
          pl.reEnd = re.length;
          continue;
        case "|":
          if (inClass || !patternListStack.length || escaping) {
            re += "\\|";
            escaping = false;
            continue;
          }
          clearStateChar();
          re += "|";
          continue;
        case "[":
          clearStateChar();
          if (inClass) {
            re += "\\" + c;
            continue;
          }
          inClass = true;
          classStart = i;
          reClassStart = re.length;
          re += c;
          continue;
        case "]":
          if (i === classStart + 1 || !inClass) {
            re += "\\" + c;
            escaping = false;
            continue;
          }
          if (inClass) {
            var cs = pattern.substring(classStart + 1, i);
            try {
              RegExp("[" + cs + "]");
            } catch (er) {
              var sp = this.parse(cs, SUBPARSE);
              re = re.substr(0, reClassStart) + "\\[" + sp[0] + "\\]";
              hasMagic = hasMagic || sp[1];
              inClass = false;
              continue;
            }
          }
          hasMagic = true;
          inClass = false;
          re += c;
          continue;
        default:
          clearStateChar();
          if (escaping) {
            escaping = false;
          } else if (reSpecials[c] && !(c === "^" && inClass)) {
            re += "\\";
          }
          re += c;
      }
    }
    if (inClass) {
      cs = pattern.substr(classStart + 1);
      sp = this.parse(cs, SUBPARSE);
      re = re.substr(0, reClassStart) + "\\[" + sp[0];
      hasMagic = hasMagic || sp[1];
    }
    for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
      var tail = re.slice(pl.reStart + pl.open.length);
      this.debug("setting tail", re, pl);
      tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function(_, $1, $2) {
        if (!$2) {
          $2 = "\\";
        }
        return $1 + $1 + $2 + "|";
      });
      this.debug("tail=%j\n   %s", tail, tail, pl, re);
      var t = pl.type === "*" ? star : pl.type === "?" ? qmark : "\\" + pl.type;
      hasMagic = true;
      re = re.slice(0, pl.reStart) + t + "\\(" + tail;
    }
    clearStateChar();
    if (escaping) {
      re += "\\\\";
    }
    var addPatternStart = false;
    switch (re.charAt(0)) {
      case ".":
      case "[":
      case "(":
        addPatternStart = true;
    }
    for (var n = negativeLists.length - 1; n > -1; n--) {
      var nl = negativeLists[n];
      var nlBefore = re.slice(0, nl.reStart);
      var nlFirst = re.slice(nl.reStart, nl.reEnd - 8);
      var nlLast = re.slice(nl.reEnd - 8, nl.reEnd);
      var nlAfter = re.slice(nl.reEnd);
      nlLast += nlAfter;
      var openParensBefore = nlBefore.split("(").length - 1;
      var cleanAfter = nlAfter;
      for (i = 0; i < openParensBefore; i++) {
        cleanAfter = cleanAfter.replace(/\)[+*?]?/, "");
      }
      nlAfter = cleanAfter;
      var dollar = "";
      if (nlAfter === "" && isSub !== SUBPARSE) {
        dollar = "$";
      }
      var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast;
      re = newRe;
    }
    if (re !== "" && hasMagic) {
      re = "(?=.)" + re;
    }
    if (addPatternStart) {
      re = patternStart + re;
    }
    if (isSub === SUBPARSE) {
      return [re, hasMagic];
    }
    if (!hasMagic) {
      return globUnescape(pattern);
    }
    var flags = options.nocase ? "i" : "";
    try {
      var regExp = new RegExp("^" + re + "$", flags);
    } catch (er) {
      return new RegExp("$.");
    }
    regExp._glob = pattern;
    regExp._src = re;
    return regExp;
  }
  minimatch.makeRe = function(pattern, options) {
    return new Minimatch(pattern, options || {}).makeRe();
  };
  Minimatch.prototype.makeRe = makeRe;
  function makeRe() {
    if (this.regexp || this.regexp === false)
      return this.regexp;
    var set = this.set;
    if (!set.length) {
      this.regexp = false;
      return this.regexp;
    }
    var options = this.options;
    var twoStar = options.noglobstar ? star : options.dot ? twoStarDot : twoStarNoDot;
    var flags = options.nocase ? "i" : "";
    var re = set.map(function(pattern) {
      return pattern.map(function(p) {
        return p === GLOBSTAR ? twoStar : typeof p === "string" ? regExpEscape(p) : p._src;
      }).join("\\/");
    }).join("|");
    re = "^(?:" + re + ")$";
    if (this.negate)
      re = "^(?!" + re + ").*$";
    try {
      this.regexp = new RegExp(re, flags);
    } catch (ex) {
      this.regexp = false;
    }
    return this.regexp;
  }
  minimatch.match = function(list, pattern, options) {
    options = options || {};
    var mm = new Minimatch(pattern, options);
    list = list.filter(function(f) {
      return mm.match(f);
    });
    if (mm.options.nonull && !list.length) {
      list.push(pattern);
    }
    return list;
  };
  Minimatch.prototype.match = match;
  function match(f, partial) {
    this.debug("match", f, this.pattern);
    if (this.comment)
      return false;
    if (this.empty)
      return f === "";
    if (f === "/" && partial)
      return true;
    var options = this.options;
    if (path.sep !== "/") {
      f = f.split(path.sep).join("/");
    }
    f = f.split(slashSplit);
    this.debug(this.pattern, "split", f);
    var set = this.set;
    this.debug(this.pattern, "set", set);
    var filename;
    var i;
    for (i = f.length - 1; i >= 0; i--) {
      filename = f[i];
      if (filename)
        break;
    }
    for (i = 0; i < set.length; i++) {
      var pattern = set[i];
      var file = f;
      if (options.matchBase && pattern.length === 1) {
        file = [filename];
      }
      var hit = this.matchOne(file, pattern, partial);
      if (hit) {
        if (options.flipNegate)
          return true;
        return !this.negate;
      }
    }
    if (options.flipNegate)
      return false;
    return this.negate;
  }
  Minimatch.prototype.matchOne = function(file, pattern, partial) {
    var options = this.options;
    this.debug("matchOne", {this: this, file, pattern});
    this.debug("matchOne", file.length, pattern.length);
    for (var fi = 0, pi = 0, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, pi++) {
      this.debug("matchOne loop");
      var p = pattern[pi];
      var f = file[fi];
      this.debug(pattern, p, f);
      if (p === false)
        return false;
      if (p === GLOBSTAR) {
        this.debug("GLOBSTAR", [pattern, p, f]);
        var fr = fi;
        var pr = pi + 1;
        if (pr === pl) {
          this.debug("** at the end");
          for (; fi < fl; fi++) {
            if (file[fi] === "." || file[fi] === ".." || !options.dot && file[fi].charAt(0) === ".")
              return false;
          }
          return true;
        }
        while (fr < fl) {
          var swallowee = file[fr];
          this.debug("\nglobstar while", file, fr, pattern, pr, swallowee);
          if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
            this.debug("globstar found match!", fr, fl, swallowee);
            return true;
          } else {
            if (swallowee === "." || swallowee === ".." || !options.dot && swallowee.charAt(0) === ".") {
              this.debug("dot detected!", file, fr, pattern, pr);
              break;
            }
            this.debug("globstar swallow a segment, and continue");
            fr++;
          }
        }
        if (partial) {
          this.debug("\n>>> no match, partial?", file, fr, pattern, pr);
          if (fr === fl)
            return true;
        }
        return false;
      }
      var hit;
      if (typeof p === "string") {
        if (options.nocase) {
          hit = f.toLowerCase() === p.toLowerCase();
        } else {
          hit = f === p;
        }
        this.debug("string match", p, f, hit);
      } else {
        hit = f.match(p);
        this.debug("pattern match", p, f, hit);
      }
      if (!hit)
        return false;
    }
    if (fi === fl && pi === pl) {
      return true;
    } else if (fi === fl) {
      return partial;
    } else if (pi === pl) {
      var emptyFileEnd = fi === fl - 1 && file[fi] === "";
      return emptyFileEnd;
    }
    throw new Error("wtf?");
  };
  function globUnescape(s) {
    return s.replace(/\\(.)/g, "$1");
  }
  function regExpEscape(s) {
    return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }
});

// node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits_browser.js
var require_inherits_browser = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  if (typeof Object.create === "function") {
    module.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
      }
    };
  } else {
    module.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function() {
        };
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;
      }
    };
  }
});

// node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits.js
var require_inherits = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  try {
    util = require("util");
    if (typeof util.inherits !== "function")
      throw "";
    module.exports = util.inherits;
  } catch (e) {
    module.exports = require_inherits_browser();
  }
  var util;
});

// node_modules/.pnpm/path-is-absolute@1.0.1/node_modules/path-is-absolute/index.js
var require_path_is_absolute = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  function posix(path) {
    return path.charAt(0) === "/";
  }
  function win32(path) {
    var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
    var result = splitDeviceRe.exec(path);
    var device = result[1] || "";
    var isUnc = Boolean(device && device.charAt(1) !== ":");
    return Boolean(result[2] || isUnc);
  }
  module.exports = process.platform === "win32" ? win32 : posix;
  module.exports.posix = posix;
  module.exports.win32 = win32;
});

// node_modules/.pnpm/glob@7.1.6/node_modules/glob/common.js
var require_common = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports) => {
  exports.alphasort = alphasort;
  exports.alphasorti = alphasorti;
  exports.setopts = setopts;
  exports.ownProp = ownProp;
  exports.makeAbs = makeAbs;
  exports.finish = finish;
  exports.mark = mark;
  exports.isIgnored = isIgnored;
  exports.childrenIgnored = childrenIgnored;
  function ownProp(obj, field) {
    return Object.prototype.hasOwnProperty.call(obj, field);
  }
  var path = require("path");
  var minimatch = require_minimatch();
  var isAbsolute = require_path_is_absolute();
  var Minimatch = minimatch.Minimatch;
  function alphasorti(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  }
  function alphasort(a, b) {
    return a.localeCompare(b);
  }
  function setupIgnores(self, options) {
    self.ignore = options.ignore || [];
    if (!Array.isArray(self.ignore))
      self.ignore = [self.ignore];
    if (self.ignore.length) {
      self.ignore = self.ignore.map(ignoreMap);
    }
  }
  function ignoreMap(pattern) {
    var gmatcher = null;
    if (pattern.slice(-3) === "/**") {
      var gpattern = pattern.replace(/(\/\*\*)+$/, "");
      gmatcher = new Minimatch(gpattern, {dot: true});
    }
    return {
      matcher: new Minimatch(pattern, {dot: true}),
      gmatcher
    };
  }
  function setopts(self, pattern, options) {
    if (!options)
      options = {};
    if (options.matchBase && pattern.indexOf("/") === -1) {
      if (options.noglobstar) {
        throw new Error("base matching requires globstar");
      }
      pattern = "**/" + pattern;
    }
    self.silent = !!options.silent;
    self.pattern = pattern;
    self.strict = options.strict !== false;
    self.realpath = !!options.realpath;
    self.realpathCache = options.realpathCache || Object.create(null);
    self.follow = !!options.follow;
    self.dot = !!options.dot;
    self.mark = !!options.mark;
    self.nodir = !!options.nodir;
    if (self.nodir)
      self.mark = true;
    self.sync = !!options.sync;
    self.nounique = !!options.nounique;
    self.nonull = !!options.nonull;
    self.nosort = !!options.nosort;
    self.nocase = !!options.nocase;
    self.stat = !!options.stat;
    self.noprocess = !!options.noprocess;
    self.absolute = !!options.absolute;
    self.maxLength = options.maxLength || Infinity;
    self.cache = options.cache || Object.create(null);
    self.statCache = options.statCache || Object.create(null);
    self.symlinks = options.symlinks || Object.create(null);
    setupIgnores(self, options);
    self.changedCwd = false;
    var cwd = process.cwd();
    if (!ownProp(options, "cwd"))
      self.cwd = cwd;
    else {
      self.cwd = path.resolve(options.cwd);
      self.changedCwd = self.cwd !== cwd;
    }
    self.root = options.root || path.resolve(self.cwd, "/");
    self.root = path.resolve(self.root);
    if (process.platform === "win32")
      self.root = self.root.replace(/\\/g, "/");
    self.cwdAbs = isAbsolute(self.cwd) ? self.cwd : makeAbs(self, self.cwd);
    if (process.platform === "win32")
      self.cwdAbs = self.cwdAbs.replace(/\\/g, "/");
    self.nomount = !!options.nomount;
    options.nonegate = true;
    options.nocomment = true;
    self.minimatch = new Minimatch(pattern, options);
    self.options = self.minimatch.options;
  }
  function finish(self) {
    var nou = self.nounique;
    var all = nou ? [] : Object.create(null);
    for (var i = 0, l = self.matches.length; i < l; i++) {
      var matches = self.matches[i];
      if (!matches || Object.keys(matches).length === 0) {
        if (self.nonull) {
          var literal = self.minimatch.globSet[i];
          if (nou)
            all.push(literal);
          else
            all[literal] = true;
        }
      } else {
        var m = Object.keys(matches);
        if (nou)
          all.push.apply(all, m);
        else
          m.forEach(function(m2) {
            all[m2] = true;
          });
      }
    }
    if (!nou)
      all = Object.keys(all);
    if (!self.nosort)
      all = all.sort(self.nocase ? alphasorti : alphasort);
    if (self.mark) {
      for (var i = 0; i < all.length; i++) {
        all[i] = self._mark(all[i]);
      }
      if (self.nodir) {
        all = all.filter(function(e) {
          var notDir = !/\/$/.test(e);
          var c = self.cache[e] || self.cache[makeAbs(self, e)];
          if (notDir && c)
            notDir = c !== "DIR" && !Array.isArray(c);
          return notDir;
        });
      }
    }
    if (self.ignore.length)
      all = all.filter(function(m2) {
        return !isIgnored(self, m2);
      });
    self.found = all;
  }
  function mark(self, p) {
    var abs = makeAbs(self, p);
    var c = self.cache[abs];
    var m = p;
    if (c) {
      var isDir = c === "DIR" || Array.isArray(c);
      var slash = p.slice(-1) === "/";
      if (isDir && !slash)
        m += "/";
      else if (!isDir && slash)
        m = m.slice(0, -1);
      if (m !== p) {
        var mabs = makeAbs(self, m);
        self.statCache[mabs] = self.statCache[abs];
        self.cache[mabs] = self.cache[abs];
      }
    }
    return m;
  }
  function makeAbs(self, f) {
    var abs = f;
    if (f.charAt(0) === "/") {
      abs = path.join(self.root, f);
    } else if (isAbsolute(f) || f === "") {
      abs = f;
    } else if (self.changedCwd) {
      abs = path.resolve(self.cwd, f);
    } else {
      abs = path.resolve(f);
    }
    if (process.platform === "win32")
      abs = abs.replace(/\\/g, "/");
    return abs;
  }
  function isIgnored(self, path2) {
    if (!self.ignore.length)
      return false;
    return self.ignore.some(function(item) {
      return item.matcher.match(path2) || !!(item.gmatcher && item.gmatcher.match(path2));
    });
  }
  function childrenIgnored(self, path2) {
    if (!self.ignore.length)
      return false;
    return self.ignore.some(function(item) {
      return !!(item.gmatcher && item.gmatcher.match(path2));
    });
  }
});

// node_modules/.pnpm/glob@7.1.6/node_modules/glob/sync.js
var require_sync = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  module.exports = globSync;
  globSync.GlobSync = GlobSync;
  var fs = require("fs");
  var rp = require_fs();
  var minimatch = require_minimatch();
  var Minimatch = minimatch.Minimatch;
  var Glob = require_glob().Glob;
  var util = require("util");
  var path = require("path");
  var assert2 = require("assert");
  var isAbsolute = require_path_is_absolute();
  var common = require_common();
  var alphasort = common.alphasort;
  var alphasorti = common.alphasorti;
  var setopts = common.setopts;
  var ownProp = common.ownProp;
  var childrenIgnored = common.childrenIgnored;
  var isIgnored = common.isIgnored;
  function globSync(pattern, options) {
    if (typeof options === "function" || arguments.length === 3)
      throw new TypeError("callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167");
    return new GlobSync(pattern, options).found;
  }
  function GlobSync(pattern, options) {
    if (!pattern)
      throw new Error("must provide pattern");
    if (typeof options === "function" || arguments.length === 3)
      throw new TypeError("callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167");
    if (!(this instanceof GlobSync))
      return new GlobSync(pattern, options);
    setopts(this, pattern, options);
    if (this.noprocess)
      return this;
    var n = this.minimatch.set.length;
    this.matches = new Array(n);
    for (var i = 0; i < n; i++) {
      this._process(this.minimatch.set[i], i, false);
    }
    this._finish();
  }
  GlobSync.prototype._finish = function() {
    assert2(this instanceof GlobSync);
    if (this.realpath) {
      var self = this;
      this.matches.forEach(function(matchset, index) {
        var set = self.matches[index] = Object.create(null);
        for (var p in matchset) {
          try {
            p = self._makeAbs(p);
            var real = rp.realpathSync(p, self.realpathCache);
            set[real] = true;
          } catch (er) {
            if (er.syscall === "stat")
              set[self._makeAbs(p)] = true;
            else
              throw er;
          }
        }
      });
    }
    common.finish(this);
  };
  GlobSync.prototype._process = function(pattern, index, inGlobStar) {
    assert2(this instanceof GlobSync);
    var n = 0;
    while (typeof pattern[n] === "string") {
      n++;
    }
    var prefix;
    switch (n) {
      case pattern.length:
        this._processSimple(pattern.join("/"), index);
        return;
      case 0:
        prefix = null;
        break;
      default:
        prefix = pattern.slice(0, n).join("/");
        break;
    }
    var remain = pattern.slice(n);
    var read;
    if (prefix === null)
      read = ".";
    else if (isAbsolute(prefix) || isAbsolute(pattern.join("/"))) {
      if (!prefix || !isAbsolute(prefix))
        prefix = "/" + prefix;
      read = prefix;
    } else
      read = prefix;
    var abs = this._makeAbs(read);
    if (childrenIgnored(this, read))
      return;
    var isGlobStar = remain[0] === minimatch.GLOBSTAR;
    if (isGlobStar)
      this._processGlobStar(prefix, read, abs, remain, index, inGlobStar);
    else
      this._processReaddir(prefix, read, abs, remain, index, inGlobStar);
  };
  GlobSync.prototype._processReaddir = function(prefix, read, abs, remain, index, inGlobStar) {
    var entries = this._readdir(abs, inGlobStar);
    if (!entries)
      return;
    var pn = remain[0];
    var negate = !!this.minimatch.negate;
    var rawGlob = pn._glob;
    var dotOk = this.dot || rawGlob.charAt(0) === ".";
    var matchedEntries = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.charAt(0) !== "." || dotOk) {
        var m;
        if (negate && !prefix) {
          m = !e.match(pn);
        } else {
          m = e.match(pn);
        }
        if (m)
          matchedEntries.push(e);
      }
    }
    var len = matchedEntries.length;
    if (len === 0)
      return;
    if (remain.length === 1 && !this.mark && !this.stat) {
      if (!this.matches[index])
        this.matches[index] = Object.create(null);
      for (var i = 0; i < len; i++) {
        var e = matchedEntries[i];
        if (prefix) {
          if (prefix.slice(-1) !== "/")
            e = prefix + "/" + e;
          else
            e = prefix + e;
        }
        if (e.charAt(0) === "/" && !this.nomount) {
          e = path.join(this.root, e);
        }
        this._emitMatch(index, e);
      }
      return;
    }
    remain.shift();
    for (var i = 0; i < len; i++) {
      var e = matchedEntries[i];
      var newPattern;
      if (prefix)
        newPattern = [prefix, e];
      else
        newPattern = [e];
      this._process(newPattern.concat(remain), index, inGlobStar);
    }
  };
  GlobSync.prototype._emitMatch = function(index, e) {
    if (isIgnored(this, e))
      return;
    var abs = this._makeAbs(e);
    if (this.mark)
      e = this._mark(e);
    if (this.absolute) {
      e = abs;
    }
    if (this.matches[index][e])
      return;
    if (this.nodir) {
      var c = this.cache[abs];
      if (c === "DIR" || Array.isArray(c))
        return;
    }
    this.matches[index][e] = true;
    if (this.stat)
      this._stat(e);
  };
  GlobSync.prototype._readdirInGlobStar = function(abs) {
    if (this.follow)
      return this._readdir(abs, false);
    var entries;
    var lstat;
    var stat;
    try {
      lstat = fs.lstatSync(abs);
    } catch (er) {
      if (er.code === "ENOENT") {
        return null;
      }
    }
    var isSym = lstat && lstat.isSymbolicLink();
    this.symlinks[abs] = isSym;
    if (!isSym && lstat && !lstat.isDirectory())
      this.cache[abs] = "FILE";
    else
      entries = this._readdir(abs, false);
    return entries;
  };
  GlobSync.prototype._readdir = function(abs, inGlobStar) {
    var entries;
    if (inGlobStar && !ownProp(this.symlinks, abs))
      return this._readdirInGlobStar(abs);
    if (ownProp(this.cache, abs)) {
      var c = this.cache[abs];
      if (!c || c === "FILE")
        return null;
      if (Array.isArray(c))
        return c;
    }
    try {
      return this._readdirEntries(abs, fs.readdirSync(abs));
    } catch (er) {
      this._readdirError(abs, er);
      return null;
    }
  };
  GlobSync.prototype._readdirEntries = function(abs, entries) {
    if (!this.mark && !this.stat) {
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (abs === "/")
          e = abs + e;
        else
          e = abs + "/" + e;
        this.cache[e] = true;
      }
    }
    this.cache[abs] = entries;
    return entries;
  };
  GlobSync.prototype._readdirError = function(f, er) {
    switch (er.code) {
      case "ENOTSUP":
      case "ENOTDIR":
        var abs = this._makeAbs(f);
        this.cache[abs] = "FILE";
        if (abs === this.cwdAbs) {
          var error = new Error(er.code + " invalid cwd " + this.cwd);
          error.path = this.cwd;
          error.code = er.code;
          throw error;
        }
        break;
      case "ENOENT":
      case "ELOOP":
      case "ENAMETOOLONG":
      case "UNKNOWN":
        this.cache[this._makeAbs(f)] = false;
        break;
      default:
        this.cache[this._makeAbs(f)] = false;
        if (this.strict)
          throw er;
        if (!this.silent)
          console.error("glob error", er);
        break;
    }
  };
  GlobSync.prototype._processGlobStar = function(prefix, read, abs, remain, index, inGlobStar) {
    var entries = this._readdir(abs, inGlobStar);
    if (!entries)
      return;
    var remainWithoutGlobStar = remain.slice(1);
    var gspref = prefix ? [prefix] : [];
    var noGlobStar = gspref.concat(remainWithoutGlobStar);
    this._process(noGlobStar, index, false);
    var len = entries.length;
    var isSym = this.symlinks[abs];
    if (isSym && inGlobStar)
      return;
    for (var i = 0; i < len; i++) {
      var e = entries[i];
      if (e.charAt(0) === "." && !this.dot)
        continue;
      var instead = gspref.concat(entries[i], remainWithoutGlobStar);
      this._process(instead, index, true);
      var below = gspref.concat(entries[i], remain);
      this._process(below, index, true);
    }
  };
  GlobSync.prototype._processSimple = function(prefix, index) {
    var exists = this._stat(prefix);
    if (!this.matches[index])
      this.matches[index] = Object.create(null);
    if (!exists)
      return;
    if (prefix && isAbsolute(prefix) && !this.nomount) {
      var trail = /[\/\\]$/.test(prefix);
      if (prefix.charAt(0) === "/") {
        prefix = path.join(this.root, prefix);
      } else {
        prefix = path.resolve(this.root, prefix);
        if (trail)
          prefix += "/";
      }
    }
    if (process.platform === "win32")
      prefix = prefix.replace(/\\/g, "/");
    this._emitMatch(index, prefix);
  };
  GlobSync.prototype._stat = function(f) {
    var abs = this._makeAbs(f);
    var needDir = f.slice(-1) === "/";
    if (f.length > this.maxLength)
      return false;
    if (!this.stat && ownProp(this.cache, abs)) {
      var c = this.cache[abs];
      if (Array.isArray(c))
        c = "DIR";
      if (!needDir || c === "DIR")
        return c;
      if (needDir && c === "FILE")
        return false;
    }
    var exists;
    var stat = this.statCache[abs];
    if (!stat) {
      var lstat;
      try {
        lstat = fs.lstatSync(abs);
      } catch (er) {
        if (er && (er.code === "ENOENT" || er.code === "ENOTDIR")) {
          this.statCache[abs] = false;
          return false;
        }
      }
      if (lstat && lstat.isSymbolicLink()) {
        try {
          stat = fs.statSync(abs);
        } catch (er) {
          stat = lstat;
        }
      } else {
        stat = lstat;
      }
    }
    this.statCache[abs] = stat;
    var c = true;
    if (stat)
      c = stat.isDirectory() ? "DIR" : "FILE";
    this.cache[abs] = this.cache[abs] || c;
    if (needDir && c === "FILE")
      return false;
    return c;
  };
  GlobSync.prototype._mark = function(p) {
    return common.mark(this, p);
  };
  GlobSync.prototype._makeAbs = function(f) {
    return common.makeAbs(this, f);
  };
});

// node_modules/.pnpm/wrappy@1.0.2/node_modules/wrappy/wrappy.js
var require_wrappy = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  module.exports = wrappy;
  function wrappy(fn, cb) {
    if (fn && cb)
      return wrappy(fn)(cb);
    if (typeof fn !== "function")
      throw new TypeError("need wrapper function");
    Object.keys(fn).forEach(function(k) {
      wrapper[k] = fn[k];
    });
    return wrapper;
    function wrapper() {
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }
      var ret = fn.apply(this, args);
      var cb2 = args[args.length - 1];
      if (typeof ret === "function" && ret !== cb2) {
        Object.keys(cb2).forEach(function(k) {
          ret[k] = cb2[k];
        });
      }
      return ret;
    }
  }
});

// node_modules/.pnpm/once@1.4.0/node_modules/once/once.js
var require_once = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  var wrappy = require_wrappy();
  module.exports = wrappy(once);
  module.exports.strict = wrappy(onceStrict);
  once.proto = once(function() {
    Object.defineProperty(Function.prototype, "once", {
      value: function() {
        return once(this);
      },
      configurable: true
    });
    Object.defineProperty(Function.prototype, "onceStrict", {
      value: function() {
        return onceStrict(this);
      },
      configurable: true
    });
  });
  function once(fn) {
    var f = function() {
      if (f.called)
        return f.value;
      f.called = true;
      return f.value = fn.apply(this, arguments);
    };
    f.called = false;
    return f;
  }
  function onceStrict(fn) {
    var f = function() {
      if (f.called)
        throw new Error(f.onceError);
      f.called = true;
      return f.value = fn.apply(this, arguments);
    };
    var name = fn.name || "Function wrapped with `once`";
    f.onceError = name + " shouldn't be called more than once";
    f.called = false;
    return f;
  }
});

// node_modules/.pnpm/inflight@1.0.6/node_modules/inflight/inflight.js
var require_inflight = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  var wrappy = require_wrappy();
  var reqs = Object.create(null);
  var once = require_once();
  module.exports = wrappy(inflight);
  function inflight(key, cb) {
    if (reqs[key]) {
      reqs[key].push(cb);
      return null;
    } else {
      reqs[key] = [cb];
      return makeres(key);
    }
  }
  function makeres(key) {
    return once(function RES() {
      var cbs = reqs[key];
      var len = cbs.length;
      var args = slice(arguments);
      try {
        for (var i = 0; i < len; i++) {
          cbs[i].apply(null, args);
        }
      } finally {
        if (cbs.length > len) {
          cbs.splice(0, len);
          process.nextTick(function() {
            RES.apply(null, args);
          });
        } else {
          delete reqs[key];
        }
      }
    });
  }
  function slice(args) {
    var length = args.length;
    var array = [];
    for (var i = 0; i < length; i++)
      array[i] = args[i];
    return array;
  }
});

// node_modules/.pnpm/glob@7.1.6/node_modules/glob/glob.js
var require_glob = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  module.exports = glob;
  var fs = require("fs");
  var rp = require_fs();
  var minimatch = require_minimatch();
  var Minimatch = minimatch.Minimatch;
  var inherits = require_inherits();
  var EE = require("events").EventEmitter;
  var path = require("path");
  var assert2 = require("assert");
  var isAbsolute = require_path_is_absolute();
  var globSync = require_sync();
  var common = require_common();
  var alphasort = common.alphasort;
  var alphasorti = common.alphasorti;
  var setopts = common.setopts;
  var ownProp = common.ownProp;
  var inflight = require_inflight();
  var util = require("util");
  var childrenIgnored = common.childrenIgnored;
  var isIgnored = common.isIgnored;
  var once = require_once();
  function glob(pattern, options, cb) {
    if (typeof options === "function")
      cb = options, options = {};
    if (!options)
      options = {};
    if (options.sync) {
      if (cb)
        throw new TypeError("callback provided to sync glob");
      return globSync(pattern, options);
    }
    return new Glob(pattern, options, cb);
  }
  glob.sync = globSync;
  var GlobSync = glob.GlobSync = globSync.GlobSync;
  glob.glob = glob;
  function extend(origin, add) {
    if (add === null || typeof add !== "object") {
      return origin;
    }
    var keys = Object.keys(add);
    var i = keys.length;
    while (i--) {
      origin[keys[i]] = add[keys[i]];
    }
    return origin;
  }
  glob.hasMagic = function(pattern, options_) {
    var options = extend({}, options_);
    options.noprocess = true;
    var g = new Glob(pattern, options);
    var set = g.minimatch.set;
    if (!pattern)
      return false;
    if (set.length > 1)
      return true;
    for (var j = 0; j < set[0].length; j++) {
      if (typeof set[0][j] !== "string")
        return true;
    }
    return false;
  };
  glob.Glob = Glob;
  inherits(Glob, EE);
  function Glob(pattern, options, cb) {
    if (typeof options === "function") {
      cb = options;
      options = null;
    }
    if (options && options.sync) {
      if (cb)
        throw new TypeError("callback provided to sync glob");
      return new GlobSync(pattern, options);
    }
    if (!(this instanceof Glob))
      return new Glob(pattern, options, cb);
    setopts(this, pattern, options);
    this._didRealPath = false;
    var n = this.minimatch.set.length;
    this.matches = new Array(n);
    if (typeof cb === "function") {
      cb = once(cb);
      this.on("error", cb);
      this.on("end", function(matches) {
        cb(null, matches);
      });
    }
    var self = this;
    this._processing = 0;
    this._emitQueue = [];
    this._processQueue = [];
    this.paused = false;
    if (this.noprocess)
      return this;
    if (n === 0)
      return done();
    var sync = true;
    for (var i = 0; i < n; i++) {
      this._process(this.minimatch.set[i], i, false, done);
    }
    sync = false;
    function done() {
      --self._processing;
      if (self._processing <= 0) {
        if (sync) {
          process.nextTick(function() {
            self._finish();
          });
        } else {
          self._finish();
        }
      }
    }
  }
  Glob.prototype._finish = function() {
    assert2(this instanceof Glob);
    if (this.aborted)
      return;
    if (this.realpath && !this._didRealpath)
      return this._realpath();
    common.finish(this);
    this.emit("end", this.found);
  };
  Glob.prototype._realpath = function() {
    if (this._didRealpath)
      return;
    this._didRealpath = true;
    var n = this.matches.length;
    if (n === 0)
      return this._finish();
    var self = this;
    for (var i = 0; i < this.matches.length; i++)
      this._realpathSet(i, next);
    function next() {
      if (--n === 0)
        self._finish();
    }
  };
  Glob.prototype._realpathSet = function(index, cb) {
    var matchset = this.matches[index];
    if (!matchset)
      return cb();
    var found = Object.keys(matchset);
    var self = this;
    var n = found.length;
    if (n === 0)
      return cb();
    var set = this.matches[index] = Object.create(null);
    found.forEach(function(p, i) {
      p = self._makeAbs(p);
      rp.realpath(p, self.realpathCache, function(er, real) {
        if (!er)
          set[real] = true;
        else if (er.syscall === "stat")
          set[p] = true;
        else
          self.emit("error", er);
        if (--n === 0) {
          self.matches[index] = set;
          cb();
        }
      });
    });
  };
  Glob.prototype._mark = function(p) {
    return common.mark(this, p);
  };
  Glob.prototype._makeAbs = function(f) {
    return common.makeAbs(this, f);
  };
  Glob.prototype.abort = function() {
    this.aborted = true;
    this.emit("abort");
  };
  Glob.prototype.pause = function() {
    if (!this.paused) {
      this.paused = true;
      this.emit("pause");
    }
  };
  Glob.prototype.resume = function() {
    if (this.paused) {
      this.emit("resume");
      this.paused = false;
      if (this._emitQueue.length) {
        var eq = this._emitQueue.slice(0);
        this._emitQueue.length = 0;
        for (var i = 0; i < eq.length; i++) {
          var e = eq[i];
          this._emitMatch(e[0], e[1]);
        }
      }
      if (this._processQueue.length) {
        var pq = this._processQueue.slice(0);
        this._processQueue.length = 0;
        for (var i = 0; i < pq.length; i++) {
          var p = pq[i];
          this._processing--;
          this._process(p[0], p[1], p[2], p[3]);
        }
      }
    }
  };
  Glob.prototype._process = function(pattern, index, inGlobStar, cb) {
    assert2(this instanceof Glob);
    assert2(typeof cb === "function");
    if (this.aborted)
      return;
    this._processing++;
    if (this.paused) {
      this._processQueue.push([pattern, index, inGlobStar, cb]);
      return;
    }
    var n = 0;
    while (typeof pattern[n] === "string") {
      n++;
    }
    var prefix;
    switch (n) {
      case pattern.length:
        this._processSimple(pattern.join("/"), index, cb);
        return;
      case 0:
        prefix = null;
        break;
      default:
        prefix = pattern.slice(0, n).join("/");
        break;
    }
    var remain = pattern.slice(n);
    var read;
    if (prefix === null)
      read = ".";
    else if (isAbsolute(prefix) || isAbsolute(pattern.join("/"))) {
      if (!prefix || !isAbsolute(prefix))
        prefix = "/" + prefix;
      read = prefix;
    } else
      read = prefix;
    var abs = this._makeAbs(read);
    if (childrenIgnored(this, read))
      return cb();
    var isGlobStar = remain[0] === minimatch.GLOBSTAR;
    if (isGlobStar)
      this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb);
    else
      this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb);
  };
  Glob.prototype._processReaddir = function(prefix, read, abs, remain, index, inGlobStar, cb) {
    var self = this;
    this._readdir(abs, inGlobStar, function(er, entries) {
      return self._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
    });
  };
  Glob.prototype._processReaddir2 = function(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
    if (!entries)
      return cb();
    var pn = remain[0];
    var negate = !!this.minimatch.negate;
    var rawGlob = pn._glob;
    var dotOk = this.dot || rawGlob.charAt(0) === ".";
    var matchedEntries = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.charAt(0) !== "." || dotOk) {
        var m;
        if (negate && !prefix) {
          m = !e.match(pn);
        } else {
          m = e.match(pn);
        }
        if (m)
          matchedEntries.push(e);
      }
    }
    var len = matchedEntries.length;
    if (len === 0)
      return cb();
    if (remain.length === 1 && !this.mark && !this.stat) {
      if (!this.matches[index])
        this.matches[index] = Object.create(null);
      for (var i = 0; i < len; i++) {
        var e = matchedEntries[i];
        if (prefix) {
          if (prefix !== "/")
            e = prefix + "/" + e;
          else
            e = prefix + e;
        }
        if (e.charAt(0) === "/" && !this.nomount) {
          e = path.join(this.root, e);
        }
        this._emitMatch(index, e);
      }
      return cb();
    }
    remain.shift();
    for (var i = 0; i < len; i++) {
      var e = matchedEntries[i];
      var newPattern;
      if (prefix) {
        if (prefix !== "/")
          e = prefix + "/" + e;
        else
          e = prefix + e;
      }
      this._process([e].concat(remain), index, inGlobStar, cb);
    }
    cb();
  };
  Glob.prototype._emitMatch = function(index, e) {
    if (this.aborted)
      return;
    if (isIgnored(this, e))
      return;
    if (this.paused) {
      this._emitQueue.push([index, e]);
      return;
    }
    var abs = isAbsolute(e) ? e : this._makeAbs(e);
    if (this.mark)
      e = this._mark(e);
    if (this.absolute)
      e = abs;
    if (this.matches[index][e])
      return;
    if (this.nodir) {
      var c = this.cache[abs];
      if (c === "DIR" || Array.isArray(c))
        return;
    }
    this.matches[index][e] = true;
    var st = this.statCache[abs];
    if (st)
      this.emit("stat", e, st);
    this.emit("match", e);
  };
  Glob.prototype._readdirInGlobStar = function(abs, cb) {
    if (this.aborted)
      return;
    if (this.follow)
      return this._readdir(abs, false, cb);
    var lstatkey = "lstat\0" + abs;
    var self = this;
    var lstatcb = inflight(lstatkey, lstatcb_);
    if (lstatcb)
      fs.lstat(abs, lstatcb);
    function lstatcb_(er, lstat) {
      if (er && er.code === "ENOENT")
        return cb();
      var isSym = lstat && lstat.isSymbolicLink();
      self.symlinks[abs] = isSym;
      if (!isSym && lstat && !lstat.isDirectory()) {
        self.cache[abs] = "FILE";
        cb();
      } else
        self._readdir(abs, false, cb);
    }
  };
  Glob.prototype._readdir = function(abs, inGlobStar, cb) {
    if (this.aborted)
      return;
    cb = inflight("readdir\0" + abs + "\0" + inGlobStar, cb);
    if (!cb)
      return;
    if (inGlobStar && !ownProp(this.symlinks, abs))
      return this._readdirInGlobStar(abs, cb);
    if (ownProp(this.cache, abs)) {
      var c = this.cache[abs];
      if (!c || c === "FILE")
        return cb();
      if (Array.isArray(c))
        return cb(null, c);
    }
    var self = this;
    fs.readdir(abs, readdirCb(this, abs, cb));
  };
  function readdirCb(self, abs, cb) {
    return function(er, entries) {
      if (er)
        self._readdirError(abs, er, cb);
      else
        self._readdirEntries(abs, entries, cb);
    };
  }
  Glob.prototype._readdirEntries = function(abs, entries, cb) {
    if (this.aborted)
      return;
    if (!this.mark && !this.stat) {
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (abs === "/")
          e = abs + e;
        else
          e = abs + "/" + e;
        this.cache[e] = true;
      }
    }
    this.cache[abs] = entries;
    return cb(null, entries);
  };
  Glob.prototype._readdirError = function(f, er, cb) {
    if (this.aborted)
      return;
    switch (er.code) {
      case "ENOTSUP":
      case "ENOTDIR":
        var abs = this._makeAbs(f);
        this.cache[abs] = "FILE";
        if (abs === this.cwdAbs) {
          var error = new Error(er.code + " invalid cwd " + this.cwd);
          error.path = this.cwd;
          error.code = er.code;
          this.emit("error", error);
          this.abort();
        }
        break;
      case "ENOENT":
      case "ELOOP":
      case "ENAMETOOLONG":
      case "UNKNOWN":
        this.cache[this._makeAbs(f)] = false;
        break;
      default:
        this.cache[this._makeAbs(f)] = false;
        if (this.strict) {
          this.emit("error", er);
          this.abort();
        }
        if (!this.silent)
          console.error("glob error", er);
        break;
    }
    return cb();
  };
  Glob.prototype._processGlobStar = function(prefix, read, abs, remain, index, inGlobStar, cb) {
    var self = this;
    this._readdir(abs, inGlobStar, function(er, entries) {
      self._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
    });
  };
  Glob.prototype._processGlobStar2 = function(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
    if (!entries)
      return cb();
    var remainWithoutGlobStar = remain.slice(1);
    var gspref = prefix ? [prefix] : [];
    var noGlobStar = gspref.concat(remainWithoutGlobStar);
    this._process(noGlobStar, index, false, cb);
    var isSym = this.symlinks[abs];
    var len = entries.length;
    if (isSym && inGlobStar)
      return cb();
    for (var i = 0; i < len; i++) {
      var e = entries[i];
      if (e.charAt(0) === "." && !this.dot)
        continue;
      var instead = gspref.concat(entries[i], remainWithoutGlobStar);
      this._process(instead, index, true, cb);
      var below = gspref.concat(entries[i], remain);
      this._process(below, index, true, cb);
    }
    cb();
  };
  Glob.prototype._processSimple = function(prefix, index, cb) {
    var self = this;
    this._stat(prefix, function(er, exists) {
      self._processSimple2(prefix, index, er, exists, cb);
    });
  };
  Glob.prototype._processSimple2 = function(prefix, index, er, exists, cb) {
    if (!this.matches[index])
      this.matches[index] = Object.create(null);
    if (!exists)
      return cb();
    if (prefix && isAbsolute(prefix) && !this.nomount) {
      var trail = /[\/\\]$/.test(prefix);
      if (prefix.charAt(0) === "/") {
        prefix = path.join(this.root, prefix);
      } else {
        prefix = path.resolve(this.root, prefix);
        if (trail)
          prefix += "/";
      }
    }
    if (process.platform === "win32")
      prefix = prefix.replace(/\\/g, "/");
    this._emitMatch(index, prefix);
    cb();
  };
  Glob.prototype._stat = function(f, cb) {
    var abs = this._makeAbs(f);
    var needDir = f.slice(-1) === "/";
    if (f.length > this.maxLength)
      return cb();
    if (!this.stat && ownProp(this.cache, abs)) {
      var c = this.cache[abs];
      if (Array.isArray(c))
        c = "DIR";
      if (!needDir || c === "DIR")
        return cb(null, c);
      if (needDir && c === "FILE")
        return cb();
    }
    var exists;
    var stat = this.statCache[abs];
    if (stat !== void 0) {
      if (stat === false)
        return cb(null, stat);
      else {
        var type = stat.isDirectory() ? "DIR" : "FILE";
        if (needDir && type === "FILE")
          return cb();
        else
          return cb(null, type, stat);
      }
    }
    var self = this;
    var statcb = inflight("stat\0" + abs, lstatcb_);
    if (statcb)
      fs.lstat(abs, statcb);
    function lstatcb_(er, lstat) {
      if (lstat && lstat.isSymbolicLink()) {
        return fs.stat(abs, function(er2, stat2) {
          if (er2)
            self._stat2(f, abs, null, lstat, cb);
          else
            self._stat2(f, abs, er2, stat2, cb);
        });
      } else {
        self._stat2(f, abs, er, lstat, cb);
      }
    }
  };
  Glob.prototype._stat2 = function(f, abs, er, stat, cb) {
    if (er && (er.code === "ENOENT" || er.code === "ENOTDIR")) {
      this.statCache[abs] = false;
      return cb();
    }
    var needDir = f.slice(-1) === "/";
    this.statCache[abs] = stat;
    if (abs.slice(-1) === "/" && stat && !stat.isDirectory())
      return cb(null, false, stat);
    var c = true;
    if (stat)
      c = stat.isDirectory() ? "DIR" : "FILE";
    this.cache[abs] = this.cache[abs] || c;
    if (needDir && c === "FILE")
      return cb();
    return cb(null, c, stat);
  };
});

// node_modules/.pnpm/rimraf@3.0.2/node_modules/rimraf/rimraf.js
var require_rimraf = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  var assert2 = require("assert");
  var path = require("path");
  var fs = require("fs");
  var glob = void 0;
  try {
    glob = require_glob();
  } catch (_err) {
  }
  var defaultGlobOpts = {
    nosort: true,
    silent: true
  };
  var timeout = 0;
  var isWindows = process.platform === "win32";
  var defaults = (options) => {
    const methods = [
      "unlink",
      "chmod",
      "stat",
      "lstat",
      "rmdir",
      "readdir"
    ];
    methods.forEach((m) => {
      options[m] = options[m] || fs[m];
      m = m + "Sync";
      options[m] = options[m] || fs[m];
    });
    options.maxBusyTries = options.maxBusyTries || 3;
    options.emfileWait = options.emfileWait || 1e3;
    if (options.glob === false) {
      options.disableGlob = true;
    }
    if (options.disableGlob !== true && glob === void 0) {
      throw Error("glob dependency not found, set `options.disableGlob = true` if intentional");
    }
    options.disableGlob = options.disableGlob || false;
    options.glob = options.glob || defaultGlobOpts;
  };
  var rimraf = (p, options, cb) => {
    if (typeof options === "function") {
      cb = options;
      options = {};
    }
    assert2(p, "rimraf: missing path");
    assert2.equal(typeof p, "string", "rimraf: path should be a string");
    assert2.equal(typeof cb, "function", "rimraf: callback function required");
    assert2(options, "rimraf: invalid options argument provided");
    assert2.equal(typeof options, "object", "rimraf: options should be object");
    defaults(options);
    let busyTries = 0;
    let errState = null;
    let n = 0;
    const next = (er) => {
      errState = errState || er;
      if (--n === 0)
        cb(errState);
    };
    const afterGlob = (er, results) => {
      if (er)
        return cb(er);
      n = results.length;
      if (n === 0)
        return cb();
      results.forEach((p2) => {
        const CB = (er2) => {
          if (er2) {
            if ((er2.code === "EBUSY" || er2.code === "ENOTEMPTY" || er2.code === "EPERM") && busyTries < options.maxBusyTries) {
              busyTries++;
              return setTimeout(() => rimraf_(p2, options, CB), busyTries * 100);
            }
            if (er2.code === "EMFILE" && timeout < options.emfileWait) {
              return setTimeout(() => rimraf_(p2, options, CB), timeout++);
            }
            if (er2.code === "ENOENT")
              er2 = null;
          }
          timeout = 0;
          next(er2);
        };
        rimraf_(p2, options, CB);
      });
    };
    if (options.disableGlob || !glob.hasMagic(p))
      return afterGlob(null, [p]);
    options.lstat(p, (er, stat) => {
      if (!er)
        return afterGlob(null, [p]);
      glob(p, options.glob, afterGlob);
    });
  };
  var rimraf_ = (p, options, cb) => {
    assert2(p);
    assert2(options);
    assert2(typeof cb === "function");
    options.lstat(p, (er, st) => {
      if (er && er.code === "ENOENT")
        return cb(null);
      if (er && er.code === "EPERM" && isWindows)
        fixWinEPERM(p, options, er, cb);
      if (st && st.isDirectory())
        return rmdir(p, options, er, cb);
      options.unlink(p, (er2) => {
        if (er2) {
          if (er2.code === "ENOENT")
            return cb(null);
          if (er2.code === "EPERM")
            return isWindows ? fixWinEPERM(p, options, er2, cb) : rmdir(p, options, er2, cb);
          if (er2.code === "EISDIR")
            return rmdir(p, options, er2, cb);
        }
        return cb(er2);
      });
    });
  };
  var fixWinEPERM = (p, options, er, cb) => {
    assert2(p);
    assert2(options);
    assert2(typeof cb === "function");
    options.chmod(p, 438, (er2) => {
      if (er2)
        cb(er2.code === "ENOENT" ? null : er);
      else
        options.stat(p, (er3, stats) => {
          if (er3)
            cb(er3.code === "ENOENT" ? null : er);
          else if (stats.isDirectory())
            rmdir(p, options, er, cb);
          else
            options.unlink(p, cb);
        });
    });
  };
  var fixWinEPERMSync = (p, options, er) => {
    assert2(p);
    assert2(options);
    try {
      options.chmodSync(p, 438);
    } catch (er2) {
      if (er2.code === "ENOENT")
        return;
      else
        throw er;
    }
    let stats;
    try {
      stats = options.statSync(p);
    } catch (er3) {
      if (er3.code === "ENOENT")
        return;
      else
        throw er;
    }
    if (stats.isDirectory())
      rmdirSync(p, options, er);
    else
      options.unlinkSync(p);
  };
  var rmdir = (p, options, originalEr, cb) => {
    assert2(p);
    assert2(options);
    assert2(typeof cb === "function");
    options.rmdir(p, (er) => {
      if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM"))
        rmkids(p, options, cb);
      else if (er && er.code === "ENOTDIR")
        cb(originalEr);
      else
        cb(er);
    });
  };
  var rmkids = (p, options, cb) => {
    assert2(p);
    assert2(options);
    assert2(typeof cb === "function");
    options.readdir(p, (er, files) => {
      if (er)
        return cb(er);
      let n = files.length;
      if (n === 0)
        return options.rmdir(p, cb);
      let errState;
      files.forEach((f) => {
        rimraf(path.join(p, f), options, (er2) => {
          if (errState)
            return;
          if (er2)
            return cb(errState = er2);
          if (--n === 0)
            options.rmdir(p, cb);
        });
      });
    });
  };
  var rimrafSync = (p, options) => {
    options = options || {};
    defaults(options);
    assert2(p, "rimraf: missing path");
    assert2.equal(typeof p, "string", "rimraf: path should be a string");
    assert2(options, "rimraf: missing options");
    assert2.equal(typeof options, "object", "rimraf: options should be object");
    let results;
    if (options.disableGlob || !glob.hasMagic(p)) {
      results = [p];
    } else {
      try {
        options.lstatSync(p);
        results = [p];
      } catch (er) {
        results = glob.sync(p, options.glob);
      }
    }
    if (!results.length)
      return;
    for (let i = 0; i < results.length; i++) {
      const p2 = results[i];
      let st;
      try {
        st = options.lstatSync(p2);
      } catch (er) {
        if (er.code === "ENOENT")
          return;
        if (er.code === "EPERM" && isWindows)
          fixWinEPERMSync(p2, options, er);
      }
      try {
        if (st && st.isDirectory())
          rmdirSync(p2, options, null);
        else
          options.unlinkSync(p2);
      } catch (er) {
        if (er.code === "ENOENT")
          return;
        if (er.code === "EPERM")
          return isWindows ? fixWinEPERMSync(p2, options, er) : rmdirSync(p2, options, er);
        if (er.code !== "EISDIR")
          throw er;
        rmdirSync(p2, options, er);
      }
    }
  };
  var rmdirSync = (p, options, originalEr) => {
    assert2(p);
    assert2(options);
    try {
      options.rmdirSync(p);
    } catch (er) {
      if (er.code === "ENOENT")
        return;
      if (er.code === "ENOTDIR")
        throw originalEr;
      if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")
        rmkidsSync(p, options);
    }
  };
  var rmkidsSync = (p, options) => {
    assert2(p);
    assert2(options);
    options.readdirSync(p).forEach((f) => rimrafSync(path.join(p, f), options));
    const retries = isWindows ? 100 : 1;
    let i = 0;
    do {
      let threw = true;
      try {
        const ret = options.rmdirSync(p, options);
        threw = false;
        return ret;
      } finally {
        if (++i < retries && threw)
          continue;
      }
    } while (true);
  };
  module.exports = rimraf;
  rimraf.sync = rimrafSync;
});

// node_modules/.pnpm/ms@2.0.0/node_modules/ms/index.js
var require_ms = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  var s = 1e3;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var y = d * 365.25;
  module.exports = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse(val);
    } else if (type === "number" && isNaN(val) === false) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
  };
  function parse(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return void 0;
    }
  }
  function fmtShort(ms) {
    if (ms >= d) {
      return Math.round(ms / d) + "d";
    }
    if (ms >= h) {
      return Math.round(ms / h) + "h";
    }
    if (ms >= m) {
      return Math.round(ms / m) + "m";
    }
    if (ms >= s) {
      return Math.round(ms / s) + "s";
    }
    return ms + "ms";
  }
  function fmtLong(ms) {
    return plural(ms, d, "day") || plural(ms, h, "hour") || plural(ms, m, "minute") || plural(ms, s, "second") || ms + " ms";
  }
  function plural(ms, n, name) {
    if (ms < n) {
      return;
    }
    if (ms < n * 1.5) {
      return Math.floor(ms / n) + " " + name;
    }
    return Math.ceil(ms / n) + " " + name + "s";
  }
});

// node_modules/.pnpm/debug@2.6.9/node_modules/debug/src/debug.js
var require_debug = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  exports = module.exports = createDebug.debug = createDebug["default"] = createDebug;
  exports.coerce = coerce;
  exports.disable = disable;
  exports.enable = enable;
  exports.enabled = enabled;
  exports.humanize = require_ms();
  exports.names = [];
  exports.skips = [];
  exports.formatters = {};
  var prevTime;
  function selectColor(namespace) {
    var hash = 0, i;
    for (i in namespace) {
      hash = (hash << 5) - hash + namespace.charCodeAt(i);
      hash |= 0;
    }
    return exports.colors[Math.abs(hash) % exports.colors.length];
  }
  function createDebug(namespace) {
    function debug() {
      if (!debug.enabled)
        return;
      var self = debug;
      var curr = +new Date();
      var ms = curr - (prevTime || curr);
      self.diff = ms;
      self.prev = prevTime;
      self.curr = curr;
      prevTime = curr;
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }
      args[0] = exports.coerce(args[0]);
      if (typeof args[0] !== "string") {
        args.unshift("%O");
      }
      var index = 0;
      args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
        if (match === "%%")
          return match;
        index++;
        var formatter = exports.formatters[format];
        if (typeof formatter === "function") {
          var val = args[index];
          match = formatter.call(self, val);
          args.splice(index, 1);
          index--;
        }
        return match;
      });
      exports.formatArgs.call(self, args);
      var logFn = debug.log || exports.log || console.log.bind(console);
      logFn.apply(self, args);
    }
    debug.namespace = namespace;
    debug.enabled = exports.enabled(namespace);
    debug.useColors = exports.useColors();
    debug.color = selectColor(namespace);
    if (typeof exports.init === "function") {
      exports.init(debug);
    }
    return debug;
  }
  function enable(namespaces) {
    exports.save(namespaces);
    exports.names = [];
    exports.skips = [];
    var split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
    var len = split.length;
    for (var i = 0; i < len; i++) {
      if (!split[i])
        continue;
      namespaces = split[i].replace(/\*/g, ".*?");
      if (namespaces[0] === "-") {
        exports.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
      } else {
        exports.names.push(new RegExp("^" + namespaces + "$"));
      }
    }
  }
  function disable() {
    exports.enable("");
  }
  function enabled(name) {
    var i, len;
    for (i = 0, len = exports.skips.length; i < len; i++) {
      if (exports.skips[i].test(name)) {
        return false;
      }
    }
    for (i = 0, len = exports.names.length; i < len; i++) {
      if (exports.names[i].test(name)) {
        return true;
      }
    }
    return false;
  }
  function coerce(val) {
    if (val instanceof Error)
      return val.stack || val.message;
    return val;
  }
});

// node_modules/.pnpm/debug@2.6.9/node_modules/debug/src/browser.js
var require_browser = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  exports = module.exports = require_debug();
  exports.log = log;
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.storage = typeof chrome != "undefined" && typeof chrome.storage != "undefined" ? chrome.storage.local : localstorage();
  exports.colors = [
    "lightseagreen",
    "forestgreen",
    "goldenrod",
    "dodgerblue",
    "darkorchid",
    "crimson"
  ];
  function useColors() {
    if (typeof window !== "undefined" && window.process && window.process.type === "renderer") {
      return true;
    }
    return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
  }
  exports.formatters.j = function(v) {
    try {
      return JSON.stringify(v);
    } catch (err) {
      return "[UnexpectedJSONParseError]: " + err.message;
    }
  };
  function formatArgs(args) {
    var useColors2 = this.useColors;
    args[0] = (useColors2 ? "%c" : "") + this.namespace + (useColors2 ? " %c" : " ") + args[0] + (useColors2 ? "%c " : " ") + "+" + exports.humanize(this.diff);
    if (!useColors2)
      return;
    var c = "color: " + this.color;
    args.splice(1, 0, c, "color: inherit");
    var index = 0;
    var lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, function(match) {
      if (match === "%%")
        return;
      index++;
      if (match === "%c") {
        lastC = index;
      }
    });
    args.splice(lastC, 0, c);
  }
  function log() {
    return typeof console === "object" && console.log && Function.prototype.apply.call(console.log, console, arguments);
  }
  function save(namespaces) {
    try {
      if (namespaces == null) {
        exports.storage.removeItem("debug");
      } else {
        exports.storage.debug = namespaces;
      }
    } catch (e) {
    }
  }
  function load() {
    var r;
    try {
      r = exports.storage.debug;
    } catch (e) {
    }
    if (!r && typeof process !== "undefined" && "env" in process) {
      r = process.env.DEBUG;
    }
    return r;
  }
  exports.enable(load());
  function localstorage() {
    try {
      return window.localStorage;
    } catch (e) {
    }
  }
});

// node_modules/.pnpm/debug@2.6.9/node_modules/debug/src/node.js
var require_node = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  var tty = require("tty");
  var util = require("util");
  exports = module.exports = require_debug();
  exports.init = init;
  exports.log = log;
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.colors = [6, 2, 3, 4, 5, 1];
  exports.inspectOpts = Object.keys(process.env).filter(function(key) {
    return /^debug_/i.test(key);
  }).reduce(function(obj, key) {
    var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, function(_, k) {
      return k.toUpperCase();
    });
    var val = process.env[key];
    if (/^(yes|on|true|enabled)$/i.test(val))
      val = true;
    else if (/^(no|off|false|disabled)$/i.test(val))
      val = false;
    else if (val === "null")
      val = null;
    else
      val = Number(val);
    obj[prop] = val;
    return obj;
  }, {});
  var fd = parseInt(process.env.DEBUG_FD, 10) || 2;
  if (fd !== 1 && fd !== 2) {
    util.deprecate(function() {
    }, "except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)")();
  }
  var stream = fd === 1 ? process.stdout : fd === 2 ? process.stderr : createWritableStdioStream(fd);
  function useColors() {
    return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(fd);
  }
  exports.formatters.o = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts).split("\n").map(function(str) {
      return str.trim();
    }).join(" ");
  };
  exports.formatters.O = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts);
  };
  function formatArgs(args) {
    var name = this.namespace;
    var useColors2 = this.useColors;
    if (useColors2) {
      var c = this.color;
      var prefix = "  [3" + c + ";1m" + name + " [0m";
      args[0] = prefix + args[0].split("\n").join("\n" + prefix);
      args.push("[3" + c + "m+" + exports.humanize(this.diff) + "[0m");
    } else {
      args[0] = new Date().toUTCString() + " " + name + " " + args[0];
    }
  }
  function log() {
    return stream.write(util.format.apply(util, arguments) + "\n");
  }
  function save(namespaces) {
    if (namespaces == null) {
      delete process.env.DEBUG;
    } else {
      process.env.DEBUG = namespaces;
    }
  }
  function load() {
    return process.env.DEBUG;
  }
  function createWritableStdioStream(fd2) {
    var stream2;
    var tty_wrap = process.binding("tty_wrap");
    switch (tty_wrap.guessHandleType(fd2)) {
      case "TTY":
        stream2 = new tty.WriteStream(fd2);
        stream2._type = "tty";
        if (stream2._handle && stream2._handle.unref) {
          stream2._handle.unref();
        }
        break;
      case "FILE":
        var fs = require("fs");
        stream2 = new fs.SyncWriteStream(fd2, {autoClose: false});
        stream2._type = "fs";
        break;
      case "PIPE":
      case "TCP":
        var net = require("net");
        stream2 = new net.Socket({
          fd: fd2,
          readable: false,
          writable: true
        });
        stream2.readable = false;
        stream2.read = null;
        stream2._type = "pipe";
        if (stream2._handle && stream2._handle.unref) {
          stream2._handle.unref();
        }
        break;
      default:
        throw new Error("Implement me. Unknown stream file type!");
    }
    stream2.fd = fd2;
    stream2._isStdio = true;
    return stream2;
  }
  function init(debug) {
    debug.inspectOpts = {};
    var keys = Object.keys(exports.inspectOpts);
    for (var i = 0; i < keys.length; i++) {
      debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
    }
  }
  exports.enable(load());
});

// node_modules/.pnpm/debug@2.6.9/node_modules/debug/src/index.js
var require_src = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  if (typeof process !== "undefined" && process.type === "renderer") {
    module.exports = require_browser();
  } else {
    module.exports = require_node();
  }
});

// node_modules/.pnpm/marky@1.2.2/node_modules/marky/lib/marky.cjs.js
var require_marky_cjs = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  var perf = typeof performance !== "undefined" && performance;
  var nowForNode;
  {
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
    nowForNode = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
  }
  var hrtime;
  var getNanoSeconds;
  var loadTime;
  var now = nowForNode;
  function throwIfEmpty(name) {
    if (!name) {
      throw new Error("name must be non-empty");
    }
  }
  function insertSorted(arr, item) {
    var low = 0;
    var high = arr.length;
    var mid;
    while (low < high) {
      mid = low + high >>> 1;
      if (arr[mid].startTime < item.startTime) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    arr.splice(low, 0, item);
  }
  exports.mark = void 0;
  exports.stop = void 0;
  exports.getEntries = void 0;
  exports.clear = void 0;
  if (perf && perf.mark && perf.getEntriesByName && perf.getEntriesByType && perf.clearMeasures) {
    exports.mark = function(name) {
      throwIfEmpty(name);
      perf.mark("start " + name);
    };
    exports.stop = function(name) {
      throwIfEmpty(name);
      perf.mark("end " + name);
      perf.measure(name, "start " + name, "end " + name);
      var entries2 = perf.getEntriesByName(name);
      return entries2[entries2.length - 1];
    };
    exports.getEntries = function() {
      return perf.getEntriesByType("measure");
    };
    exports.clear = function() {
      perf.clearMarks();
      perf.clearMeasures();
    };
  } else {
    marks = {};
    entries = [];
    exports.mark = function(name) {
      throwIfEmpty(name);
      var startTime = now();
      marks["$" + name] = startTime;
    };
    exports.stop = function(name) {
      throwIfEmpty(name);
      var endTime = now();
      var startTime = marks["$" + name];
      if (!startTime) {
        throw new Error("no known mark: " + name);
      }
      var entry = {
        startTime,
        name,
        duration: endTime - startTime,
        entryType: "measure"
      };
      insertSorted(entries, entry);
      return entry;
    };
    exports.getEntries = function() {
      return entries;
    };
    exports.clear = function() {
      marks = {};
      entries = [];
    };
  }
  var marks;
  var entries;
});

// node_modules/.pnpm/lighthouse-logger@1.2.0/node_modules/lighthouse-logger/index.js
var require_lighthouse_logger = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  var debug = require_src();
  var marky = require_marky_cjs();
  var EventEmitter = require("events").EventEmitter;
  var isWindows = process.platform === "win32";
  var isBrowser = process.browser;
  var colors = {
    red: isBrowser ? "crimson" : 1,
    yellow: isBrowser ? "gold" : 3,
    cyan: isBrowser ? "darkturquoise" : 6,
    green: isBrowser ? "forestgreen" : 2,
    blue: isBrowser ? "steelblue" : 4,
    magenta: isBrowser ? "palevioletred" : 5
  };
  debug.colors = [colors.cyan, colors.green, colors.blue, colors.magenta];
  var Emitter = class extends EventEmitter {
    issueStatus(title, argsArray) {
      if (title === "status" || title === "statusEnd") {
        this.emit(title, [title, ...argsArray]);
      }
    }
    issueWarning(title, argsArray) {
      this.emit("warning", [title, ...argsArray]);
    }
  };
  var loggersByTitle = {};
  var loggingBufferColumns = 25;
  var level_;
  var Log = class {
    static _logToStdErr(title, argsArray) {
      const log = Log.loggerfn(title);
      log(...argsArray);
    }
    static loggerfn(title) {
      let log = loggersByTitle[title];
      if (!log) {
        log = debug(title);
        loggersByTitle[title] = log;
        if (title.endsWith("error")) {
          log.color = colors.red;
        } else if (title.endsWith("warn")) {
          log.color = colors.yellow;
        }
      }
      return log;
    }
    static setLevel(level) {
      level_ = level;
      switch (level) {
        case "silent":
          debug.enable("-*");
          break;
        case "verbose":
          debug.enable("*");
          break;
        case "error":
          debug.enable("-*, *:error");
          break;
        default:
          debug.enable("*, -*:verbose");
      }
    }
    static formatProtocol(prefix, data, level) {
      const columns = !process || process.browser ? Infinity : process.stdout.columns;
      const method = data.method || "?????";
      const maxLength = columns - method.length - prefix.length - loggingBufferColumns;
      const snippet = data.params && method !== "IO.read" ? JSON.stringify(data.params).substr(0, maxLength) : "";
      Log._logToStdErr(`${prefix}:${level || ""}`, [method, snippet]);
    }
    static isVerbose() {
      return level_ === "verbose";
    }
    static time({msg, id, args = []}, level = "log") {
      marky.mark(id);
      Log[level]("status", msg, ...args);
    }
    static timeEnd({msg, id, args = []}, level = "verbose") {
      Log[level]("statusEnd", msg, ...args);
      marky.stop(id);
    }
    static log(title, ...args) {
      Log.events.issueStatus(title, args);
      return Log._logToStdErr(title, args);
    }
    static warn(title, ...args) {
      Log.events.issueWarning(title, args);
      return Log._logToStdErr(`${title}:warn`, args);
    }
    static error(title, ...args) {
      return Log._logToStdErr(`${title}:error`, args);
    }
    static verbose(title, ...args) {
      Log.events.issueStatus(title, args);
      return Log._logToStdErr(`${title}:verbose`, args);
    }
    static greenify(str) {
      return `${Log.green}${str}${Log.reset}`;
    }
    static redify(str) {
      return `${Log.red}${str}${Log.reset}`;
    }
    static get green() {
      return "[32m";
    }
    static get red() {
      return "[31m";
    }
    static get yellow() {
      return "[33m";
    }
    static get purple() {
      return "[95m";
    }
    static get reset() {
      return "[0m";
    }
    static get bold() {
      return "[1m";
    }
    static get dim() {
      return "[2m";
    }
    static get tick() {
      return isWindows ? "\u221A" : "\u2713";
    }
    static get cross() {
      return isWindows ? "\xD7" : "\u2718";
    }
    static get whiteSmallSquare() {
      return isWindows ? "\u0387" : "\u25AB";
    }
    static get heavyHorizontal() {
      return isWindows ? "\u2500" : "\u2501";
    }
    static get heavyVertical() {
      return isWindows ? "\u2502 " : "\u2503 ";
    }
    static get heavyUpAndRight() {
      return isWindows ? "\u2514" : "\u2517";
    }
    static get heavyVerticalAndRight() {
      return isWindows ? "\u251C" : "\u2523";
    }
    static get heavyDownAndHorizontal() {
      return isWindows ? "\u252C" : "\u2533";
    }
    static get doubleLightHorizontal() {
      return "\u2500\u2500";
    }
  };
  Log.events = new Emitter();
  Log.takeTimeEntries = () => {
    const entries = marky.getEntries();
    marky.clear();
    return entries;
  };
  Log.getTimeEntries = () => marky.getEntries();
  module.exports = Log;
});

// node_modules/.pnpm/mkdirp@0.5.5/node_modules/mkdirp/index.js
var require_mkdirp = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  var path = require("path");
  var fs = require("fs");
  var _0777 = parseInt("0777", 8);
  module.exports = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;
  function mkdirP(p, opts, f, made) {
    if (typeof opts === "function") {
      f = opts;
      opts = {};
    } else if (!opts || typeof opts !== "object") {
      opts = {mode: opts};
    }
    var mode = opts.mode;
    var xfs = opts.fs || fs;
    if (mode === void 0) {
      mode = _0777;
    }
    if (!made)
      made = null;
    var cb = f || function() {
    };
    p = path.resolve(p);
    xfs.mkdir(p, mode, function(er) {
      if (!er) {
        made = made || p;
        return cb(null, made);
      }
      switch (er.code) {
        case "ENOENT":
          if (path.dirname(p) === p)
            return cb(er);
          mkdirP(path.dirname(p), opts, function(er2, made2) {
            if (er2)
              cb(er2, made2);
            else
              mkdirP(p, opts, cb, made2);
          });
          break;
        default:
          xfs.stat(p, function(er2, stat) {
            if (er2 || !stat.isDirectory())
              cb(er, made);
            else
              cb(null, made);
          });
          break;
      }
    });
  }
  mkdirP.sync = function sync(p, opts, made) {
    if (!opts || typeof opts !== "object") {
      opts = {mode: opts};
    }
    var mode = opts.mode;
    var xfs = opts.fs || fs;
    if (mode === void 0) {
      mode = _0777;
    }
    if (!made)
      made = null;
    p = path.resolve(p);
    try {
      xfs.mkdirSync(p, mode);
      made = made || p;
    } catch (err0) {
      switch (err0.code) {
        case "ENOENT":
          made = sync(path.dirname(p), opts, made);
          sync(p, opts, made);
          break;
        default:
          var stat;
          try {
            stat = xfs.statSync(p);
          } catch (err1) {
            throw err0;
          }
          if (!stat.isDirectory())
            throw err0;
          break;
      }
    }
    return made;
  };
});

// node_modules/.pnpm/is-docker@2.2.1/node_modules/is-docker/index.js
var require_is_docker = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  var fs = require("fs");
  var isDocker;
  function hasDockerEnv() {
    try {
      fs.statSync("/.dockerenv");
      return true;
    } catch (_) {
      return false;
    }
  }
  function hasDockerCGroup() {
    try {
      return fs.readFileSync("/proc/self/cgroup", "utf8").includes("docker");
    } catch (_) {
      return false;
    }
  }
  module.exports = () => {
    if (isDocker === void 0) {
      isDocker = hasDockerEnv() || hasDockerCGroup();
    }
    return isDocker;
  };
});

// node_modules/.pnpm/is-wsl@2.2.0/node_modules/is-wsl/index.js
var require_is_wsl = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  var os = require("os");
  var fs = require("fs");
  var isDocker = require_is_docker();
  var isWsl = () => {
    if (process.platform !== "linux") {
      return false;
    }
    if (os.release().toLowerCase().includes("microsoft")) {
      if (isDocker()) {
        return false;
      }
      return true;
    }
    try {
      return fs.readFileSync("/proc/version", "utf8").toLowerCase().includes("microsoft") ? !isDocker() : false;
    } catch (_) {
      return false;
    }
  };
  if (process.env.__IS_WSL_TEST__) {
    module.exports = isWsl;
  } else {
    module.exports = isWsl();
  }
});

// node_modules/.pnpm/chrome-launcher@0.13.4/node_modules/chrome-launcher/dist/utils.js
var require_utils = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports) => {
  "use strict";
  var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.getLocalAppDataPath = exports.toWinDirFormat = exports.makeTmpDir = exports.getPlatform = exports.ChromeNotInstalledError = exports.UnsupportedPlatformError = exports.InvalidUserDataDirectoryError = exports.ChromePathNotSetError = exports.LauncherError = exports.delay = exports.defaults = void 0;
  var path_1 = require("path");
  var child_process_1 = require("child_process");
  var mkdirp = require_mkdirp();
  var isWsl = require_is_wsl();
  function defaults(val, def) {
    return typeof val === "undefined" ? def : val;
  }
  exports.defaults = defaults;
  function delay(time) {
    return __awaiter(this, void 0, void 0, function* () {
      return new Promise((resolve) => setTimeout(resolve, time));
    });
  }
  exports.delay = delay;
  var LauncherError = class extends Error {
    constructor(message = "Unexpected error", code) {
      super();
      this.message = message;
      this.code = code;
      this.stack = new Error().stack;
      return this;
    }
  };
  exports.LauncherError = LauncherError;
  var ChromePathNotSetError = class extends LauncherError {
    constructor() {
      super(...arguments);
      this.message = "The environment variable CHROME_PATH must be set to executable of a build of Chromium version 54.0 or later.";
      this.code = "ERR_LAUNCHER_PATH_NOT_SET";
    }
  };
  exports.ChromePathNotSetError = ChromePathNotSetError;
  var InvalidUserDataDirectoryError = class extends LauncherError {
    constructor() {
      super(...arguments);
      this.message = "userDataDir must be false or a path.";
      this.code = "ERR_LAUNCHER_INVALID_USER_DATA_DIRECTORY";
    }
  };
  exports.InvalidUserDataDirectoryError = InvalidUserDataDirectoryError;
  var UnsupportedPlatformError = class extends LauncherError {
    constructor() {
      super(...arguments);
      this.message = `Platform ${getPlatform()} is not supported.`;
      this.code = "ERR_LAUNCHER_UNSUPPORTED_PLATFORM";
    }
  };
  exports.UnsupportedPlatformError = UnsupportedPlatformError;
  var ChromeNotInstalledError = class extends LauncherError {
    constructor() {
      super(...arguments);
      this.message = "No Chrome installations found.";
      this.code = "ERR_LAUNCHER_NOT_INSTALLED";
    }
  };
  exports.ChromeNotInstalledError = ChromeNotInstalledError;
  function getPlatform() {
    return isWsl ? "wsl" : process.platform;
  }
  exports.getPlatform = getPlatform;
  function makeTmpDir() {
    switch (getPlatform()) {
      case "darwin":
      case "linux":
        return makeUnixTmpDir();
      case "wsl":
        process.env.TEMP = getLocalAppDataPath(`${process.env.PATH}`);
      case "win32":
        return makeWin32TmpDir();
      default:
        throw new UnsupportedPlatformError();
    }
  }
  exports.makeTmpDir = makeTmpDir;
  function toWinDirFormat(dir = "") {
    const results = /\/mnt\/([a-z])\//.exec(dir);
    if (!results) {
      return dir;
    }
    const driveLetter = results[1];
    return dir.replace(`/mnt/${driveLetter}/`, `${driveLetter.toUpperCase()}:\\`).replace(/\//g, "\\");
  }
  exports.toWinDirFormat = toWinDirFormat;
  function getLocalAppDataPath(path) {
    const userRegExp = /\/mnt\/([a-z])\/Users\/([^\/:]+)\/AppData\//;
    const results = userRegExp.exec(path) || [];
    return `/mnt/${results[1]}/Users/${results[2]}/AppData/Local`;
  }
  exports.getLocalAppDataPath = getLocalAppDataPath;
  function makeUnixTmpDir() {
    return child_process_1.execSync("mktemp -d -t lighthouse.XXXXXXX").toString().trim();
  }
  function makeWin32TmpDir() {
    const winTmpPath = process.env.TEMP || process.env.TMP || (process.env.SystemRoot || process.env.windir) + "\\temp";
    const randomNumber = Math.floor(Math.random() * 9e7 + 1e7);
    const tmpdir = path_1.join(winTmpPath, "lighthouse." + randomNumber);
    mkdirp.sync(tmpdir);
    return tmpdir;
  }
});

// node_modules/.pnpm/chrome-launcher@0.13.4/node_modules/chrome-launcher/dist/chrome-finder.js
var require_chrome_finder = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.win32 = exports.wsl = exports.linux = exports.darwin = exports.darwinFast = void 0;
  var fs = require("fs");
  var path = require("path");
  var {homedir} = require("os");
  var {execSync, execFileSync} = require("child_process");
  var escapeRegExp = _chunk2HKELI3Rjs.require_escape_string_regexp.call(void 0, );
  var log = require_lighthouse_logger();
  var utils_1 = require_utils();
  var newLineRegex = /\r?\n/;
  function darwinFast() {
    const priorityOptions = [
      process.env.CHROME_PATH,
      process.env.LIGHTHOUSE_CHROMIUM_PATH,
      "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    ];
    for (const chromePath of priorityOptions) {
      if (chromePath && canAccess(chromePath))
        return chromePath;
    }
    return darwin()[0];
  }
  exports.darwinFast = darwinFast;
  function darwin() {
    const suffixes = ["/Contents/MacOS/Google Chrome Canary", "/Contents/MacOS/Google Chrome"];
    const LSREGISTER = "/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister";
    const installations = [];
    const customChromePath = resolveChromePath();
    if (customChromePath) {
      installations.push(customChromePath);
    }
    execSync(`${LSREGISTER} -dump | grep -i 'google chrome\\( canary\\)\\?\\.app' | awk '{$1=""; print $0}'`).toString().split(newLineRegex).forEach((inst) => {
      suffixes.forEach((suffix) => {
        const execPath = path.join(inst.substring(0, inst.indexOf(".app") + 4).trim(), suffix);
        if (canAccess(execPath) && installations.indexOf(execPath) === -1) {
          installations.push(execPath);
        }
      });
    });
    const home = escapeRegExp(process.env.HOME || homedir());
    const priorities = [
      {regex: new RegExp(`^${home}/Applications/.*Chrome\\.app`), weight: 50},
      {regex: new RegExp(`^${home}/Applications/.*Chrome Canary\\.app`), weight: 51},
      {regex: /^\/Applications\/.*Chrome.app/, weight: 100},
      {regex: /^\/Applications\/.*Chrome Canary.app/, weight: 101},
      {regex: /^\/Volumes\/.*Chrome.app/, weight: -2},
      {regex: /^\/Volumes\/.*Chrome Canary.app/, weight: -1}
    ];
    if (process.env.LIGHTHOUSE_CHROMIUM_PATH) {
      priorities.unshift({regex: new RegExp(escapeRegExp(process.env.LIGHTHOUSE_CHROMIUM_PATH)), weight: 150});
    }
    if (process.env.CHROME_PATH) {
      priorities.unshift({regex: new RegExp(escapeRegExp(process.env.CHROME_PATH)), weight: 151});
    }
    return sort(installations, priorities);
  }
  exports.darwin = darwin;
  function resolveChromePath() {
    if (canAccess(process.env.CHROME_PATH)) {
      return process.env.CHROME_PATH;
    }
    if (canAccess(process.env.LIGHTHOUSE_CHROMIUM_PATH)) {
      log.warn("ChromeLauncher", "LIGHTHOUSE_CHROMIUM_PATH is deprecated, use CHROME_PATH env variable instead.");
      return process.env.LIGHTHOUSE_CHROMIUM_PATH;
    }
    return void 0;
  }
  function linux() {
    let installations = [];
    const customChromePath = resolveChromePath();
    if (customChromePath) {
      installations.push(customChromePath);
    }
    const desktopInstallationFolders = [
      path.join(homedir(), ".local/share/applications/"),
      "/usr/share/applications/"
    ];
    desktopInstallationFolders.forEach((folder) => {
      installations = installations.concat(findChromeExecutables(folder));
    });
    const executables = [
      "google-chrome-stable",
      "google-chrome",
      "chromium-browser",
      "chromium"
    ];
    executables.forEach((executable) => {
      try {
        const chromePath = execFileSync("which", [executable], {stdio: "pipe"}).toString().split(newLineRegex)[0];
        if (canAccess(chromePath)) {
          installations.push(chromePath);
        }
      } catch (e) {
      }
    });
    if (!installations.length) {
      throw new utils_1.ChromePathNotSetError();
    }
    const priorities = [
      {regex: /chrome-wrapper$/, weight: 51},
      {regex: /google-chrome-stable$/, weight: 50},
      {regex: /google-chrome$/, weight: 49},
      {regex: /chromium-browser$/, weight: 48},
      {regex: /chromium$/, weight: 47}
    ];
    if (process.env.LIGHTHOUSE_CHROMIUM_PATH) {
      priorities.unshift({regex: new RegExp(escapeRegExp(process.env.LIGHTHOUSE_CHROMIUM_PATH)), weight: 100});
    }
    if (process.env.CHROME_PATH) {
      priorities.unshift({regex: new RegExp(escapeRegExp(process.env.CHROME_PATH)), weight: 101});
    }
    return sort(uniq(installations.filter(Boolean)), priorities);
  }
  exports.linux = linux;
  function wsl() {
    process.env.LOCALAPPDATA = utils_1.getLocalAppDataPath(`${process.env.PATH}`);
    process.env.PROGRAMFILES = "/mnt/c/Program Files";
    process.env["PROGRAMFILES(X86)"] = "/mnt/c/Program Files (x86)";
    return win32();
  }
  exports.wsl = wsl;
  function win32() {
    const installations = [];
    const suffixes = [
      `${path.sep}Google${path.sep}Chrome SxS${path.sep}Application${path.sep}chrome.exe`,
      `${path.sep}Google${path.sep}Chrome${path.sep}Application${path.sep}chrome.exe`
    ];
    const prefixes = [
      process.env.LOCALAPPDATA,
      process.env.PROGRAMFILES,
      process.env["PROGRAMFILES(X86)"]
    ].filter(Boolean);
    const customChromePath = resolveChromePath();
    if (customChromePath) {
      installations.push(customChromePath);
    }
    prefixes.forEach((prefix) => suffixes.forEach((suffix) => {
      const chromePath = path.join(prefix, suffix);
      if (canAccess(chromePath)) {
        installations.push(chromePath);
      }
    }));
    return installations;
  }
  exports.win32 = win32;
  function sort(installations, priorities) {
    const defaultPriority = 10;
    return installations.map((inst) => {
      for (const pair of priorities) {
        if (pair.regex.test(inst)) {
          return {path: inst, weight: pair.weight};
        }
      }
      return {path: inst, weight: defaultPriority};
    }).sort((a, b) => b.weight - a.weight).map((pair) => pair.path);
  }
  function canAccess(file) {
    if (!file) {
      return false;
    }
    try {
      fs.accessSync(file);
      return true;
    } catch (e) {
      return false;
    }
  }
  function uniq(arr) {
    return Array.from(new Set(arr));
  }
  function findChromeExecutables(folder) {
    const argumentsRegex = /(^[^ ]+).*/;
    const chromeExecRegex = "^Exec=/.*/(google-chrome|chrome|chromium)-.*";
    let installations = [];
    if (canAccess(folder)) {
      let execPaths;
      try {
        execPaths = execSync(`grep -ER "${chromeExecRegex}" ${folder} | awk -F '=' '{print $2}'`, {stdio: "pipe"});
      } catch (e) {
        execPaths = execSync(`grep -Er "${chromeExecRegex}" ${folder} | awk -F '=' '{print $2}'`, {stdio: "pipe"});
      }
      execPaths = execPaths.toString().split(newLineRegex).map((execPath) => execPath.replace(argumentsRegex, "$1"));
      execPaths.forEach((execPath) => canAccess(execPath) && installations.push(execPath));
    }
    return installations;
  }
});

// node_modules/.pnpm/chrome-launcher@0.13.4/node_modules/chrome-launcher/dist/random-port.js
var require_random_port = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.getRandomPort = void 0;
  var http_1 = require("http");
  function getRandomPort() {
    return new Promise((resolve, reject) => {
      const server = http_1.createServer();
      server.listen(0);
      server.once("listening", () => {
        const {port} = server.address();
        server.close(() => resolve(port));
      });
      server.once("error", reject);
    });
  }
  exports.getRandomPort = getRandomPort;
});

// node_modules/.pnpm/chrome-launcher@0.13.4/node_modules/chrome-launcher/dist/flags.js
var require_flags = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.DEFAULT_FLAGS = void 0;
  exports.DEFAULT_FLAGS = [
    "--disable-features=TranslateUI",
    "--disable-extensions",
    "--disable-component-extensions-with-background-pages",
    "--disable-background-networking",
    "--disable-sync",
    "--metrics-recording-only",
    "--disable-default-apps",
    "--mute-audio",
    "--no-default-browser-check",
    "--no-first-run",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--disable-background-timer-throttling",
    "--force-fieldtrials=*BackgroundTracing/default/"
  ];
});

// node_modules/.pnpm/chrome-launcher@0.13.4/node_modules/chrome-launcher/dist/chrome-launcher.js
var require_chrome_launcher = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports) => {
  "use strict";
  var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.killAll = exports.launch = exports.Launcher = void 0;
  var childProcess = require("child_process");
  var fs = require("fs");
  var net = require("net");
  var rimraf = require_rimraf();
  var chromeFinder = require_chrome_finder();
  var random_port_1 = require_random_port();
  var flags_1 = require_flags();
  var utils_1 = require_utils();
  var log = require_lighthouse_logger();
  var spawn = childProcess.spawn;
  var execSync = childProcess.execSync;
  var isWsl = utils_1.getPlatform() === "wsl";
  var isWindows = utils_1.getPlatform() === "win32";
  var _SIGINT = "SIGINT";
  var _SIGINT_EXIT_CODE = 130;
  var _SUPPORTED_PLATFORMS = new Set(["darwin", "linux", "win32", "wsl"]);
  var instances = new Set();
  var sigintListener = () => __awaiter(void 0, void 0, void 0, function* () {
    yield killAll();
    process.exit(_SIGINT_EXIT_CODE);
  });
  function launch2(opts = {}) {
    return __awaiter(this, void 0, void 0, function* () {
      opts.handleSIGINT = utils_1.defaults(opts.handleSIGINT, true);
      const instance = new Launcher(opts);
      if (opts.handleSIGINT && instances.size === 0) {
        process.on(_SIGINT, sigintListener);
      }
      instances.add(instance);
      yield instance.launch();
      const kill = () => __awaiter(this, void 0, void 0, function* () {
        instances.delete(instance);
        if (instances.size === 0) {
          process.removeListener(_SIGINT, sigintListener);
        }
        return instance.kill();
      });
      return {pid: instance.pid, port: instance.port, kill, process: instance.chrome};
    });
  }
  exports.launch = launch2;
  function killAll() {
    return __awaiter(this, void 0, void 0, function* () {
      let errors = [];
      for (const instance of instances) {
        try {
          yield instance.kill();
          instances.delete(instance);
        } catch (err) {
          errors.push(err);
        }
      }
      return errors;
    });
  }
  exports.killAll = killAll;
  var Launcher = class {
    constructor(opts = {}, moduleOverrides = {}) {
      this.opts = opts;
      this.tmpDirandPidFileReady = false;
      this.fs = moduleOverrides.fs || fs;
      this.rimraf = moduleOverrides.rimraf || rimraf;
      this.spawn = moduleOverrides.spawn || spawn;
      log.setLevel(utils_1.defaults(this.opts.logLevel, "silent"));
      this.startingUrl = utils_1.defaults(this.opts.startingUrl, "about:blank");
      this.chromeFlags = utils_1.defaults(this.opts.chromeFlags, []);
      this.requestedPort = utils_1.defaults(this.opts.port, 0);
      this.chromePath = this.opts.chromePath;
      this.ignoreDefaultFlags = utils_1.defaults(this.opts.ignoreDefaultFlags, false);
      this.connectionPollInterval = utils_1.defaults(this.opts.connectionPollInterval, 500);
      this.maxConnectionRetries = utils_1.defaults(this.opts.maxConnectionRetries, 50);
      this.envVars = utils_1.defaults(opts.envVars, Object.assign({}, process.env));
      if (typeof this.opts.userDataDir === "boolean") {
        if (!this.opts.userDataDir) {
          this.useDefaultProfile = true;
          this.userDataDir = void 0;
        } else {
          throw new utils_1.InvalidUserDataDirectoryError();
        }
      } else {
        this.useDefaultProfile = false;
        this.userDataDir = this.opts.userDataDir;
      }
    }
    get flags() {
      const flags = this.ignoreDefaultFlags ? [] : flags_1.DEFAULT_FLAGS.slice();
      flags.push(`--remote-debugging-port=${this.port}`);
      if (!this.ignoreDefaultFlags && utils_1.getPlatform() === "linux") {
        flags.push("--disable-setuid-sandbox");
      }
      if (!this.useDefaultProfile) {
        flags.push(`--user-data-dir=${isWsl ? utils_1.toWinDirFormat(this.userDataDir) : this.userDataDir}`);
      }
      flags.push(...this.chromeFlags);
      flags.push(this.startingUrl);
      return flags;
    }
    static defaultFlags() {
      return flags_1.DEFAULT_FLAGS.slice();
    }
    static getFirstInstallation() {
      if (utils_1.getPlatform() === "darwin")
        return chromeFinder.darwinFast();
      return chromeFinder[utils_1.getPlatform()]()[0];
    }
    static getInstallations() {
      return chromeFinder[utils_1.getPlatform()]();
    }
    makeTmpDir() {
      return utils_1.makeTmpDir();
    }
    prepare() {
      const platform = utils_1.getPlatform();
      if (!_SUPPORTED_PLATFORMS.has(platform)) {
        throw new utils_1.UnsupportedPlatformError();
      }
      this.userDataDir = this.userDataDir || this.makeTmpDir();
      this.outFile = this.fs.openSync(`${this.userDataDir}/chrome-out.log`, "a");
      this.errFile = this.fs.openSync(`${this.userDataDir}/chrome-err.log`, "a");
      this.pidFile = `${this.userDataDir}/chrome.pid`;
      log.verbose("ChromeLauncher", `created ${this.userDataDir}`);
      this.tmpDirandPidFileReady = true;
    }
    launch() {
      return __awaiter(this, void 0, void 0, function* () {
        if (this.requestedPort !== 0) {
          this.port = this.requestedPort;
          try {
            return yield this.isDebuggerReady();
          } catch (err) {
            log.log("ChromeLauncher", `No debugging port found on port ${this.port}, launching a new Chrome.`);
          }
        }
        if (this.chromePath === void 0) {
          const installation = Launcher.getFirstInstallation();
          if (!installation) {
            throw new utils_1.ChromeNotInstalledError();
          }
          this.chromePath = installation;
        }
        if (!this.tmpDirandPidFileReady) {
          this.prepare();
        }
        this.pid = yield this.spawnProcess(this.chromePath);
        return Promise.resolve();
      });
    }
    spawnProcess(execPath) {
      return __awaiter(this, void 0, void 0, function* () {
        const spawnPromise = (() => __awaiter(this, void 0, void 0, function* () {
          if (this.chrome) {
            log.log("ChromeLauncher", `Chrome already running with pid ${this.chrome.pid}.`);
            return this.chrome.pid;
          }
          if (this.requestedPort === 0) {
            this.port = yield random_port_1.getRandomPort();
          }
          log.verbose("ChromeLauncher", `Launching with command:
"${execPath}" ${this.flags.join(" ")}`);
          const chrome2 = this.spawn(execPath, this.flags, {detached: true, stdio: ["ignore", this.outFile, this.errFile], env: this.envVars});
          this.chrome = chrome2;
          this.fs.writeFileSync(this.pidFile, chrome2.pid.toString());
          log.verbose("ChromeLauncher", `Chrome running with pid ${chrome2.pid} on port ${this.port}.`);
          return chrome2.pid;
        }))();
        const pid = yield spawnPromise;
        yield this.waitUntilReady();
        return pid;
      });
    }
    cleanup(client) {
      if (client) {
        client.removeAllListeners();
        client.end();
        client.destroy();
        client.unref();
      }
    }
    isDebuggerReady() {
      return new Promise((resolve, reject) => {
        const client = net.createConnection(this.port);
        client.once("error", (err) => {
          this.cleanup(client);
          reject(err);
        });
        client.once("connect", () => {
          this.cleanup(client);
          resolve();
        });
      });
    }
    waitUntilReady() {
      const launcher = this;
      return new Promise((resolve, reject) => {
        let retries = 0;
        let waitStatus = "Waiting for browser.";
        const poll = () => {
          if (retries === 0) {
            log.log("ChromeLauncher", waitStatus);
          }
          retries++;
          waitStatus += "..";
          log.log("ChromeLauncher", waitStatus);
          launcher.isDebuggerReady().then(() => {
            log.log("ChromeLauncher", waitStatus + `${log.greenify(log.tick)}`);
            resolve();
          }).catch((err) => {
            if (retries > launcher.maxConnectionRetries) {
              log.error("ChromeLauncher", err.message);
              const stderr = this.fs.readFileSync(`${this.userDataDir}/chrome-err.log`, {encoding: "utf-8"});
              log.error("ChromeLauncher", `Logging contents of ${this.userDataDir}/chrome-err.log`);
              log.error("ChromeLauncher", stderr);
              return reject(err);
            }
            utils_1.delay(launcher.connectionPollInterval).then(poll);
          });
        };
        poll();
      });
    }
    kill() {
      return new Promise((resolve, reject) => {
        if (this.chrome) {
          this.chrome.on("close", () => {
            delete this.chrome;
            this.destroyTmp().then(resolve);
          });
          log.log("ChromeLauncher", `Killing Chrome instance ${this.chrome.pid}`);
          try {
            if (isWindows) {
              execSync(`taskkill /pid ${this.chrome.pid} /T /F`, {stdio: "pipe"});
            } else {
              process.kill(-this.chrome.pid);
            }
          } catch (err) {
            const message = `Chrome could not be killed ${err.message}`;
            log.warn("ChromeLauncher", message);
            reject(new Error(message));
          }
        } else {
          resolve();
        }
      });
    }
    destroyTmp() {
      return new Promise((resolve) => {
        if (this.userDataDir === void 0 || this.opts.userDataDir !== void 0) {
          return resolve();
        }
        if (this.outFile) {
          this.fs.closeSync(this.outFile);
          delete this.outFile;
        }
        if (this.errFile) {
          this.fs.closeSync(this.errFile);
          delete this.errFile;
        }
        this.rimraf(this.userDataDir, () => resolve());
      });
    }
  };
  exports.Launcher = Launcher;
  exports.default = Launcher;
});

// node_modules/.pnpm/chrome-launcher@0.13.4/node_modules/chrome-launcher/dist/index.js
var require_dist = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports) => {
  "use strict";
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    Object.defineProperty(o, k2, {enumerable: true, get: function() {
      return m[k];
    }});
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = exports && exports.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !exports2.hasOwnProperty(p))
        __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", {value: true});
  __exportStar(require_chrome_launcher(), exports);
});

// node_modules/.pnpm/chrome-remote-interface@0.30.0/node_modules/chrome-remote-interface/lib/defaults.js
var require_defaults = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  module.exports.HOST = "localhost";
  module.exports.PORT = 9222;
});

// node_modules/.pnpm/chrome-remote-interface@0.30.0/node_modules/chrome-remote-interface/lib/external-request.js
var require_external_request = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  var dns = require("dns");
  var util = require("util");
  var REQUEST_TIMEOUT = 1e4;
  async function externalRequest(transport, options, callback) {
    if (!options.useHostName) {
      try {
        const {address} = await util.promisify(dns.lookup)(options.host);
        options = Object.assign({}, options);
        options.host = address;
      } catch (err) {
        callback(err);
        return;
      }
    }
    const request = transport.get(options, (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });
      response.on("end", () => {
        if (response.statusCode === 200) {
          callback(null, data);
        } else {
          callback(new Error(data));
        }
      });
    });
    request.setTimeout(REQUEST_TIMEOUT, () => {
      request.abort();
    });
    request.on("error", callback);
  }
  module.exports = externalRequest;
});

// node_modules/.pnpm/chrome-remote-interface@0.30.0/node_modules/chrome-remote-interface/lib/protocol.json
var require_protocol = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  module.exports = {
    version: {
      major: "1",
      minor: "3"
    },
    domains: [
      {
        domain: "Accessibility",
        experimental: true,
        dependencies: [
          "DOM"
        ],
        types: [
          {
            id: "AXNodeId",
            description: "Unique accessibility node identifier.",
            type: "string"
          },
          {
            id: "AXValueType",
            description: "Enum of possible property types.",
            type: "string",
            enum: [
              "boolean",
              "tristate",
              "booleanOrUndefined",
              "idref",
              "idrefList",
              "integer",
              "node",
              "nodeList",
              "number",
              "string",
              "computedString",
              "token",
              "tokenList",
              "domRelation",
              "role",
              "internalRole",
              "valueUndefined"
            ]
          },
          {
            id: "AXValueSourceType",
            description: "Enum of possible property sources.",
            type: "string",
            enum: [
              "attribute",
              "implicit",
              "style",
              "contents",
              "placeholder",
              "relatedElement"
            ]
          },
          {
            id: "AXValueNativeSourceType",
            description: "Enum of possible native property sources (as a subtype of a particular AXValueSourceType).",
            type: "string",
            enum: [
              "figcaption",
              "label",
              "labelfor",
              "labelwrapped",
              "legend",
              "tablecaption",
              "title",
              "other"
            ]
          },
          {
            id: "AXValueSource",
            description: "A single source for a computed AX property.",
            type: "object",
            properties: [
              {
                name: "type",
                description: "What type of source this is.",
                $ref: "AXValueSourceType"
              },
              {
                name: "value",
                description: "The value of this property source.",
                optional: true,
                $ref: "AXValue"
              },
              {
                name: "attribute",
                description: "The name of the relevant attribute, if any.",
                optional: true,
                type: "string"
              },
              {
                name: "attributeValue",
                description: "The value of the relevant attribute, if any.",
                optional: true,
                $ref: "AXValue"
              },
              {
                name: "superseded",
                description: "Whether this source is superseded by a higher priority source.",
                optional: true,
                type: "boolean"
              },
              {
                name: "nativeSource",
                description: "The native markup source for this value, e.g. a <label> element.",
                optional: true,
                $ref: "AXValueNativeSourceType"
              },
              {
                name: "nativeSourceValue",
                description: "The value, such as a node or node list, of the native source.",
                optional: true,
                $ref: "AXValue"
              },
              {
                name: "invalid",
                description: "Whether the value for this property is invalid.",
                optional: true,
                type: "boolean"
              },
              {
                name: "invalidReason",
                description: "Reason for the value being invalid, if it is.",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            id: "AXRelatedNode",
            type: "object",
            properties: [
              {
                name: "backendDOMNodeId",
                description: "The BackendNodeId of the related DOM node.",
                $ref: "DOM.BackendNodeId"
              },
              {
                name: "idref",
                description: "The IDRef value provided, if any.",
                optional: true,
                type: "string"
              },
              {
                name: "text",
                description: "The text alternative of this node in the current context.",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            id: "AXProperty",
            type: "object",
            properties: [
              {
                name: "name",
                description: "The name of this property.",
                $ref: "AXPropertyName"
              },
              {
                name: "value",
                description: "The value of this property.",
                $ref: "AXValue"
              }
            ]
          },
          {
            id: "AXValue",
            description: "A single computed AX property.",
            type: "object",
            properties: [
              {
                name: "type",
                description: "The type of this value.",
                $ref: "AXValueType"
              },
              {
                name: "value",
                description: "The computed value of this property.",
                optional: true,
                type: "any"
              },
              {
                name: "relatedNodes",
                description: "One or more related nodes, if applicable.",
                optional: true,
                type: "array",
                items: {
                  $ref: "AXRelatedNode"
                }
              },
              {
                name: "sources",
                description: "The sources which contributed to the computation of this property.",
                optional: true,
                type: "array",
                items: {
                  $ref: "AXValueSource"
                }
              }
            ]
          },
          {
            id: "AXPropertyName",
            description: "Values of AXProperty name:\n- from 'busy' to 'roledescription': states which apply to every AX node\n- from 'live' to 'root': attributes which apply to nodes in live regions\n- from 'autocomplete' to 'valuetext': attributes which apply to widgets\n- from 'checked' to 'selected': states which apply to widgets\n- from 'activedescendant' to 'owns' - relationships between elements other than parent/child/sibling.",
            type: "string",
            enum: [
              "busy",
              "disabled",
              "editable",
              "focusable",
              "focused",
              "hidden",
              "hiddenRoot",
              "invalid",
              "keyshortcuts",
              "settable",
              "roledescription",
              "live",
              "atomic",
              "relevant",
              "root",
              "autocomplete",
              "hasPopup",
              "level",
              "multiselectable",
              "orientation",
              "multiline",
              "readonly",
              "required",
              "valuemin",
              "valuemax",
              "valuetext",
              "checked",
              "expanded",
              "modal",
              "pressed",
              "selected",
              "activedescendant",
              "controls",
              "describedby",
              "details",
              "errormessage",
              "flowto",
              "labelledby",
              "owns"
            ]
          },
          {
            id: "AXNode",
            description: "A node in the accessibility tree.",
            type: "object",
            properties: [
              {
                name: "nodeId",
                description: "Unique identifier for this node.",
                $ref: "AXNodeId"
              },
              {
                name: "ignored",
                description: "Whether this node is ignored for accessibility",
                type: "boolean"
              },
              {
                name: "ignoredReasons",
                description: "Collection of reasons why this node is hidden.",
                optional: true,
                type: "array",
                items: {
                  $ref: "AXProperty"
                }
              },
              {
                name: "role",
                description: "This `Node`'s role, whether explicit or implicit.",
                optional: true,
                $ref: "AXValue"
              },
              {
                name: "name",
                description: "The accessible name for this `Node`.",
                optional: true,
                $ref: "AXValue"
              },
              {
                name: "description",
                description: "The accessible description for this `Node`.",
                optional: true,
                $ref: "AXValue"
              },
              {
                name: "value",
                description: "The value for this `Node`.",
                optional: true,
                $ref: "AXValue"
              },
              {
                name: "properties",
                description: "All other properties",
                optional: true,
                type: "array",
                items: {
                  $ref: "AXProperty"
                }
              },
              {
                name: "childIds",
                description: "IDs for each of this node's child nodes.",
                optional: true,
                type: "array",
                items: {
                  $ref: "AXNodeId"
                }
              },
              {
                name: "backendDOMNodeId",
                description: "The backend ID for the associated DOM node, if any.",
                optional: true,
                $ref: "DOM.BackendNodeId"
              }
            ]
          }
        ],
        commands: [
          {
            name: "disable",
            description: "Disables the accessibility domain."
          },
          {
            name: "enable",
            description: "Enables the accessibility domain which causes `AXNodeId`s to remain consistent between method calls.\nThis turns on accessibility for the page, which can impact performance until accessibility is disabled."
          },
          {
            name: "getPartialAXTree",
            description: "Fetches the accessibility node and partial accessibility tree for this DOM node, if it exists.",
            experimental: true,
            parameters: [
              {
                name: "nodeId",
                description: "Identifier of the node to get the partial accessibility tree for.",
                optional: true,
                $ref: "DOM.NodeId"
              },
              {
                name: "backendNodeId",
                description: "Identifier of the backend node to get the partial accessibility tree for.",
                optional: true,
                $ref: "DOM.BackendNodeId"
              },
              {
                name: "objectId",
                description: "JavaScript object id of the node wrapper to get the partial accessibility tree for.",
                optional: true,
                $ref: "Runtime.RemoteObjectId"
              },
              {
                name: "fetchRelatives",
                description: "Whether to fetch this nodes ancestors, siblings and children. Defaults to true.",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "nodes",
                description: "The `Accessibility.AXNode` for this DOM node, if it exists, plus its ancestors, siblings and\nchildren, if requested.",
                type: "array",
                items: {
                  $ref: "AXNode"
                }
              }
            ]
          },
          {
            name: "getFullAXTree",
            description: "Fetches the entire accessibility tree",
            experimental: true,
            returns: [
              {
                name: "nodes",
                type: "array",
                items: {
                  $ref: "AXNode"
                }
              }
            ]
          }
        ]
      },
      {
        domain: "Animation",
        experimental: true,
        dependencies: [
          "Runtime",
          "DOM"
        ],
        types: [
          {
            id: "Animation",
            description: "Animation instance.",
            type: "object",
            properties: [
              {
                name: "id",
                description: "`Animation`'s id.",
                type: "string"
              },
              {
                name: "name",
                description: "`Animation`'s name.",
                type: "string"
              },
              {
                name: "pausedState",
                description: "`Animation`'s internal paused state.",
                type: "boolean"
              },
              {
                name: "playState",
                description: "`Animation`'s play state.",
                type: "string"
              },
              {
                name: "playbackRate",
                description: "`Animation`'s playback rate.",
                type: "number"
              },
              {
                name: "startTime",
                description: "`Animation`'s start time.",
                type: "number"
              },
              {
                name: "currentTime",
                description: "`Animation`'s current time.",
                type: "number"
              },
              {
                name: "type",
                description: "Animation type of `Animation`.",
                type: "string",
                enum: [
                  "CSSTransition",
                  "CSSAnimation",
                  "WebAnimation"
                ]
              },
              {
                name: "source",
                description: "`Animation`'s source animation node.",
                optional: true,
                $ref: "AnimationEffect"
              },
              {
                name: "cssId",
                description: "A unique ID for `Animation` representing the sources that triggered this CSS\nanimation/transition.",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            id: "AnimationEffect",
            description: "AnimationEffect instance",
            type: "object",
            properties: [
              {
                name: "delay",
                description: "`AnimationEffect`'s delay.",
                type: "number"
              },
              {
                name: "endDelay",
                description: "`AnimationEffect`'s end delay.",
                type: "number"
              },
              {
                name: "iterationStart",
                description: "`AnimationEffect`'s iteration start.",
                type: "number"
              },
              {
                name: "iterations",
                description: "`AnimationEffect`'s iterations.",
                type: "number"
              },
              {
                name: "duration",
                description: "`AnimationEffect`'s iteration duration.",
                type: "number"
              },
              {
                name: "direction",
                description: "`AnimationEffect`'s playback direction.",
                type: "string"
              },
              {
                name: "fill",
                description: "`AnimationEffect`'s fill mode.",
                type: "string"
              },
              {
                name: "backendNodeId",
                description: "`AnimationEffect`'s target node.",
                optional: true,
                $ref: "DOM.BackendNodeId"
              },
              {
                name: "keyframesRule",
                description: "`AnimationEffect`'s keyframes.",
                optional: true,
                $ref: "KeyframesRule"
              },
              {
                name: "easing",
                description: "`AnimationEffect`'s timing function.",
                type: "string"
              }
            ]
          },
          {
            id: "KeyframesRule",
            description: "Keyframes Rule",
            type: "object",
            properties: [
              {
                name: "name",
                description: "CSS keyframed animation's name.",
                optional: true,
                type: "string"
              },
              {
                name: "keyframes",
                description: "List of animation keyframes.",
                type: "array",
                items: {
                  $ref: "KeyframeStyle"
                }
              }
            ]
          },
          {
            id: "KeyframeStyle",
            description: "Keyframe Style",
            type: "object",
            properties: [
              {
                name: "offset",
                description: "Keyframe's time offset.",
                type: "string"
              },
              {
                name: "easing",
                description: "`AnimationEffect`'s timing function.",
                type: "string"
              }
            ]
          }
        ],
        commands: [
          {
            name: "disable",
            description: "Disables animation domain notifications."
          },
          {
            name: "enable",
            description: "Enables animation domain notifications."
          },
          {
            name: "getCurrentTime",
            description: "Returns the current time of the an animation.",
            parameters: [
              {
                name: "id",
                description: "Id of animation.",
                type: "string"
              }
            ],
            returns: [
              {
                name: "currentTime",
                description: "Current time of the page.",
                type: "number"
              }
            ]
          },
          {
            name: "getPlaybackRate",
            description: "Gets the playback rate of the document timeline.",
            returns: [
              {
                name: "playbackRate",
                description: "Playback rate for animations on page.",
                type: "number"
              }
            ]
          },
          {
            name: "releaseAnimations",
            description: "Releases a set of animations to no longer be manipulated.",
            parameters: [
              {
                name: "animations",
                description: "List of animation ids to seek.",
                type: "array",
                items: {
                  type: "string"
                }
              }
            ]
          },
          {
            name: "resolveAnimation",
            description: "Gets the remote object of the Animation.",
            parameters: [
              {
                name: "animationId",
                description: "Animation id.",
                type: "string"
              }
            ],
            returns: [
              {
                name: "remoteObject",
                description: "Corresponding remote object.",
                $ref: "Runtime.RemoteObject"
              }
            ]
          },
          {
            name: "seekAnimations",
            description: "Seek a set of animations to a particular time within each animation.",
            parameters: [
              {
                name: "animations",
                description: "List of animation ids to seek.",
                type: "array",
                items: {
                  type: "string"
                }
              },
              {
                name: "currentTime",
                description: "Set the current time of each animation.",
                type: "number"
              }
            ]
          },
          {
            name: "setPaused",
            description: "Sets the paused state of a set of animations.",
            parameters: [
              {
                name: "animations",
                description: "Animations to set the pause state of.",
                type: "array",
                items: {
                  type: "string"
                }
              },
              {
                name: "paused",
                description: "Paused state to set to.",
                type: "boolean"
              }
            ]
          },
          {
            name: "setPlaybackRate",
            description: "Sets the playback rate of the document timeline.",
            parameters: [
              {
                name: "playbackRate",
                description: "Playback rate for animations on page",
                type: "number"
              }
            ]
          },
          {
            name: "setTiming",
            description: "Sets the timing of an animation node.",
            parameters: [
              {
                name: "animationId",
                description: "Animation id.",
                type: "string"
              },
              {
                name: "duration",
                description: "Duration of the animation.",
                type: "number"
              },
              {
                name: "delay",
                description: "Delay of the animation.",
                type: "number"
              }
            ]
          }
        ],
        events: [
          {
            name: "animationCanceled",
            description: "Event for when an animation has been cancelled.",
            parameters: [
              {
                name: "id",
                description: "Id of the animation that was cancelled.",
                type: "string"
              }
            ]
          },
          {
            name: "animationCreated",
            description: "Event for each animation that has been created.",
            parameters: [
              {
                name: "id",
                description: "Id of the animation that was created.",
                type: "string"
              }
            ]
          },
          {
            name: "animationStarted",
            description: "Event for animation that has been started.",
            parameters: [
              {
                name: "animation",
                description: "Animation that was started.",
                $ref: "Animation"
              }
            ]
          }
        ]
      },
      {
        domain: "ApplicationCache",
        experimental: true,
        types: [
          {
            id: "ApplicationCacheResource",
            description: "Detailed application cache resource information.",
            type: "object",
            properties: [
              {
                name: "url",
                description: "Resource url.",
                type: "string"
              },
              {
                name: "size",
                description: "Resource size.",
                type: "integer"
              },
              {
                name: "type",
                description: "Resource type.",
                type: "string"
              }
            ]
          },
          {
            id: "ApplicationCache",
            description: "Detailed application cache information.",
            type: "object",
            properties: [
              {
                name: "manifestURL",
                description: "Manifest URL.",
                type: "string"
              },
              {
                name: "size",
                description: "Application cache size.",
                type: "number"
              },
              {
                name: "creationTime",
                description: "Application cache creation time.",
                type: "number"
              },
              {
                name: "updateTime",
                description: "Application cache update time.",
                type: "number"
              },
              {
                name: "resources",
                description: "Application cache resources.",
                type: "array",
                items: {
                  $ref: "ApplicationCacheResource"
                }
              }
            ]
          },
          {
            id: "FrameWithManifest",
            description: "Frame identifier - manifest URL pair.",
            type: "object",
            properties: [
              {
                name: "frameId",
                description: "Frame identifier.",
                $ref: "Page.FrameId"
              },
              {
                name: "manifestURL",
                description: "Manifest URL.",
                type: "string"
              },
              {
                name: "status",
                description: "Application cache status.",
                type: "integer"
              }
            ]
          }
        ],
        commands: [
          {
            name: "enable",
            description: "Enables application cache domain notifications."
          },
          {
            name: "getApplicationCacheForFrame",
            description: "Returns relevant application cache data for the document in given frame.",
            parameters: [
              {
                name: "frameId",
                description: "Identifier of the frame containing document whose application cache is retrieved.",
                $ref: "Page.FrameId"
              }
            ],
            returns: [
              {
                name: "applicationCache",
                description: "Relevant application cache data for the document in given frame.",
                $ref: "ApplicationCache"
              }
            ]
          },
          {
            name: "getFramesWithManifests",
            description: "Returns array of frame identifiers with manifest urls for each frame containing a document\nassociated with some application cache.",
            returns: [
              {
                name: "frameIds",
                description: "Array of frame identifiers with manifest urls for each frame containing a document\nassociated with some application cache.",
                type: "array",
                items: {
                  $ref: "FrameWithManifest"
                }
              }
            ]
          },
          {
            name: "getManifestForFrame",
            description: "Returns manifest URL for document in the given frame.",
            parameters: [
              {
                name: "frameId",
                description: "Identifier of the frame containing document whose manifest is retrieved.",
                $ref: "Page.FrameId"
              }
            ],
            returns: [
              {
                name: "manifestURL",
                description: "Manifest URL for document in the given frame.",
                type: "string"
              }
            ]
          }
        ],
        events: [
          {
            name: "applicationCacheStatusUpdated",
            parameters: [
              {
                name: "frameId",
                description: "Identifier of the frame containing document whose application cache updated status.",
                $ref: "Page.FrameId"
              },
              {
                name: "manifestURL",
                description: "Manifest URL.",
                type: "string"
              },
              {
                name: "status",
                description: "Updated application cache status.",
                type: "integer"
              }
            ]
          },
          {
            name: "networkStateUpdated",
            parameters: [
              {
                name: "isNowOnline",
                type: "boolean"
              }
            ]
          }
        ]
      },
      {
        domain: "Audits",
        description: "Audits domain allows investigation of page violations and possible improvements.",
        experimental: true,
        dependencies: [
          "Network"
        ],
        commands: [
          {
            name: "getEncodedResponse",
            description: "Returns the response body and size if it were re-encoded with the specified settings. Only\napplies to images.",
            parameters: [
              {
                name: "requestId",
                description: "Identifier of the network request to get content for.",
                $ref: "Network.RequestId"
              },
              {
                name: "encoding",
                description: "The encoding to use.",
                type: "string",
                enum: [
                  "webp",
                  "jpeg",
                  "png"
                ]
              },
              {
                name: "quality",
                description: "The quality of the encoding (0-1). (defaults to 1)",
                optional: true,
                type: "number"
              },
              {
                name: "sizeOnly",
                description: "Whether to only return the size information (defaults to false).",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "body",
                description: "The encoded body as a base64 string. Omitted if sizeOnly is true.",
                optional: true,
                type: "string"
              },
              {
                name: "originalSize",
                description: "Size before re-encoding.",
                type: "integer"
              },
              {
                name: "encodedSize",
                description: "Size after re-encoding.",
                type: "integer"
              }
            ]
          }
        ]
      },
      {
        domain: "BackgroundService",
        description: "Defines events for background web platform features.",
        experimental: true,
        types: [
          {
            id: "ServiceName",
            description: "The Background Service that will be associated with the commands/events.\nEvery Background Service operates independently, but they share the same\nAPI.",
            type: "string",
            enum: [
              "backgroundFetch",
              "backgroundSync",
              "pushMessaging",
              "notifications",
              "paymentHandler"
            ]
          },
          {
            id: "EventMetadata",
            description: "A key-value pair for additional event information to pass along.",
            type: "object",
            properties: [
              {
                name: "key",
                type: "string"
              },
              {
                name: "value",
                type: "string"
              }
            ]
          },
          {
            id: "BackgroundServiceEvent",
            type: "object",
            properties: [
              {
                name: "timestamp",
                description: "Timestamp of the event (in seconds).",
                $ref: "Network.TimeSinceEpoch"
              },
              {
                name: "origin",
                description: "The origin this event belongs to.",
                type: "string"
              },
              {
                name: "serviceWorkerRegistrationId",
                description: "The Service Worker ID that initiated the event.",
                $ref: "ServiceWorker.RegistrationID"
              },
              {
                name: "service",
                description: "The Background Service this event belongs to.",
                $ref: "ServiceName"
              },
              {
                name: "eventName",
                description: "A description of the event.",
                type: "string"
              },
              {
                name: "instanceId",
                description: "An identifier that groups related events together.",
                type: "string"
              },
              {
                name: "eventMetadata",
                description: "A list of event-specific information.",
                type: "array",
                items: {
                  $ref: "EventMetadata"
                }
              }
            ]
          }
        ],
        commands: [
          {
            name: "startObserving",
            description: "Enables event updates for the service.",
            parameters: [
              {
                name: "service",
                $ref: "ServiceName"
              }
            ]
          },
          {
            name: "stopObserving",
            description: "Disables event updates for the service.",
            parameters: [
              {
                name: "service",
                $ref: "ServiceName"
              }
            ]
          },
          {
            name: "setRecording",
            description: "Set the recording state for the service.",
            parameters: [
              {
                name: "shouldRecord",
                type: "boolean"
              },
              {
                name: "service",
                $ref: "ServiceName"
              }
            ]
          },
          {
            name: "clearEvents",
            description: "Clears all stored data for the service.",
            parameters: [
              {
                name: "service",
                $ref: "ServiceName"
              }
            ]
          }
        ],
        events: [
          {
            name: "recordingStateChanged",
            description: "Called when the recording state for the service has been updated.",
            parameters: [
              {
                name: "isRecording",
                type: "boolean"
              },
              {
                name: "service",
                $ref: "ServiceName"
              }
            ]
          },
          {
            name: "backgroundServiceEventReceived",
            description: "Called with all existing backgroundServiceEvents when enabled, and all new\nevents afterwards if enabled and recording.",
            parameters: [
              {
                name: "backgroundServiceEvent",
                $ref: "BackgroundServiceEvent"
              }
            ]
          }
        ]
      },
      {
        domain: "Browser",
        description: "The Browser domain defines methods and events for browser managing.",
        types: [
          {
            id: "WindowID",
            experimental: true,
            type: "integer"
          },
          {
            id: "WindowState",
            description: "The state of the browser window.",
            experimental: true,
            type: "string",
            enum: [
              "normal",
              "minimized",
              "maximized",
              "fullscreen"
            ]
          },
          {
            id: "Bounds",
            description: "Browser window bounds information",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "left",
                description: "The offset from the left edge of the screen to the window in pixels.",
                optional: true,
                type: "integer"
              },
              {
                name: "top",
                description: "The offset from the top edge of the screen to the window in pixels.",
                optional: true,
                type: "integer"
              },
              {
                name: "width",
                description: "The window width in pixels.",
                optional: true,
                type: "integer"
              },
              {
                name: "height",
                description: "The window height in pixels.",
                optional: true,
                type: "integer"
              },
              {
                name: "windowState",
                description: "The window state. Default to normal.",
                optional: true,
                $ref: "WindowState"
              }
            ]
          },
          {
            id: "PermissionType",
            experimental: true,
            type: "string",
            enum: [
              "accessibilityEvents",
              "audioCapture",
              "backgroundSync",
              "backgroundFetch",
              "clipboardRead",
              "clipboardWrite",
              "durableStorage",
              "flash",
              "geolocation",
              "midi",
              "midiSysex",
              "notifications",
              "paymentHandler",
              "periodicBackgroundSync",
              "protectedMediaIdentifier",
              "sensors",
              "videoCapture",
              "idleDetection",
              "wakeLockScreen",
              "wakeLockSystem"
            ]
          },
          {
            id: "Bucket",
            description: "Chrome histogram bucket.",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "low",
                description: "Minimum value (inclusive).",
                type: "integer"
              },
              {
                name: "high",
                description: "Maximum value (exclusive).",
                type: "integer"
              },
              {
                name: "count",
                description: "Number of samples.",
                type: "integer"
              }
            ]
          },
          {
            id: "Histogram",
            description: "Chrome histogram.",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "name",
                description: "Name.",
                type: "string"
              },
              {
                name: "sum",
                description: "Sum of sample values.",
                type: "integer"
              },
              {
                name: "count",
                description: "Total number of samples.",
                type: "integer"
              },
              {
                name: "buckets",
                description: "Buckets.",
                type: "array",
                items: {
                  $ref: "Bucket"
                }
              }
            ]
          }
        ],
        commands: [
          {
            name: "grantPermissions",
            description: "Grant specific permissions to the given origin and reject all others.",
            experimental: true,
            parameters: [
              {
                name: "origin",
                type: "string"
              },
              {
                name: "permissions",
                type: "array",
                items: {
                  $ref: "PermissionType"
                }
              },
              {
                name: "browserContextId",
                description: "BrowserContext to override permissions. When omitted, default browser context is used.",
                optional: true,
                $ref: "Target.BrowserContextID"
              }
            ]
          },
          {
            name: "resetPermissions",
            description: "Reset all permission management for all origins.",
            experimental: true,
            parameters: [
              {
                name: "browserContextId",
                description: "BrowserContext to reset permissions. When omitted, default browser context is used.",
                optional: true,
                $ref: "Target.BrowserContextID"
              }
            ]
          },
          {
            name: "close",
            description: "Close browser gracefully."
          },
          {
            name: "crash",
            description: "Crashes browser on the main thread.",
            experimental: true
          },
          {
            name: "crashGpuProcess",
            description: "Crashes GPU process.",
            experimental: true
          },
          {
            name: "getVersion",
            description: "Returns version information.",
            returns: [
              {
                name: "protocolVersion",
                description: "Protocol version.",
                type: "string"
              },
              {
                name: "product",
                description: "Product name.",
                type: "string"
              },
              {
                name: "revision",
                description: "Product revision.",
                type: "string"
              },
              {
                name: "userAgent",
                description: "User-Agent.",
                type: "string"
              },
              {
                name: "jsVersion",
                description: "V8 version.",
                type: "string"
              }
            ]
          },
          {
            name: "getBrowserCommandLine",
            description: "Returns the command line switches for the browser process if, and only if\n--enable-automation is on the commandline.",
            experimental: true,
            returns: [
              {
                name: "arguments",
                description: "Commandline parameters",
                type: "array",
                items: {
                  type: "string"
                }
              }
            ]
          },
          {
            name: "getHistograms",
            description: "Get Chrome histograms.",
            experimental: true,
            parameters: [
              {
                name: "query",
                description: "Requested substring in name. Only histograms which have query as a\nsubstring in their name are extracted. An empty or absent query returns\nall histograms.",
                optional: true,
                type: "string"
              },
              {
                name: "delta",
                description: "If true, retrieve delta since last call.",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "histograms",
                description: "Histograms.",
                type: "array",
                items: {
                  $ref: "Histogram"
                }
              }
            ]
          },
          {
            name: "getHistogram",
            description: "Get a Chrome histogram by name.",
            experimental: true,
            parameters: [
              {
                name: "name",
                description: "Requested histogram name.",
                type: "string"
              },
              {
                name: "delta",
                description: "If true, retrieve delta since last call.",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "histogram",
                description: "Histogram.",
                $ref: "Histogram"
              }
            ]
          },
          {
            name: "getWindowBounds",
            description: "Get position and size of the browser window.",
            experimental: true,
            parameters: [
              {
                name: "windowId",
                description: "Browser window id.",
                $ref: "WindowID"
              }
            ],
            returns: [
              {
                name: "bounds",
                description: "Bounds information of the window. When window state is 'minimized', the restored window\nposition and size are returned.",
                $ref: "Bounds"
              }
            ]
          },
          {
            name: "getWindowForTarget",
            description: "Get the browser window that contains the devtools target.",
            experimental: true,
            parameters: [
              {
                name: "targetId",
                description: "Devtools agent host id. If called as a part of the session, associated targetId is used.",
                optional: true,
                $ref: "Target.TargetID"
              }
            ],
            returns: [
              {
                name: "windowId",
                description: "Browser window id.",
                $ref: "WindowID"
              },
              {
                name: "bounds",
                description: "Bounds information of the window. When window state is 'minimized', the restored window\nposition and size are returned.",
                $ref: "Bounds"
              }
            ]
          },
          {
            name: "setWindowBounds",
            description: "Set position and/or size of the browser window.",
            experimental: true,
            parameters: [
              {
                name: "windowId",
                description: "Browser window id.",
                $ref: "WindowID"
              },
              {
                name: "bounds",
                description: "New window bounds. The 'minimized', 'maximized' and 'fullscreen' states cannot be combined\nwith 'left', 'top', 'width' or 'height'. Leaves unspecified fields unchanged.",
                $ref: "Bounds"
              }
            ]
          },
          {
            name: "setDockTile",
            description: "Set dock tile details, platform-specific.",
            experimental: true,
            parameters: [
              {
                name: "badgeLabel",
                optional: true,
                type: "string"
              },
              {
                name: "image",
                description: "Png encoded image.",
                optional: true,
                type: "string"
              }
            ]
          }
        ]
      },
      {
        domain: "CSS",
        description: "This domain exposes CSS read/write operations. All CSS objects (stylesheets, rules, and styles)\nhave an associated `id` used in subsequent operations on the related object. Each object type has\na specific `id` structure, and those are not interchangeable between objects of different kinds.\nCSS objects can be loaded using the `get*ForNode()` calls (which accept a DOM node id). A client\ncan also keep track of stylesheets via the `styleSheetAdded`/`styleSheetRemoved` events and\nsubsequently load the required stylesheet contents using the `getStyleSheet[Text]()` methods.",
        experimental: true,
        dependencies: [
          "DOM"
        ],
        types: [
          {
            id: "StyleSheetId",
            type: "string"
          },
          {
            id: "StyleSheetOrigin",
            description: 'Stylesheet type: "injected" for stylesheets injected via extension, "user-agent" for user-agent\nstylesheets, "inspector" for stylesheets created by the inspector (i.e. those holding the "via\ninspector" rules), "regular" for regular stylesheets.',
            type: "string",
            enum: [
              "injected",
              "user-agent",
              "inspector",
              "regular"
            ]
          },
          {
            id: "PseudoElementMatches",
            description: "CSS rule collection for a single pseudo style.",
            type: "object",
            properties: [
              {
                name: "pseudoType",
                description: "Pseudo element type.",
                $ref: "DOM.PseudoType"
              },
              {
                name: "matches",
                description: "Matches of CSS rules applicable to the pseudo style.",
                type: "array",
                items: {
                  $ref: "RuleMatch"
                }
              }
            ]
          },
          {
            id: "InheritedStyleEntry",
            description: "Inherited CSS rule collection from ancestor node.",
            type: "object",
            properties: [
              {
                name: "inlineStyle",
                description: "The ancestor node's inline style, if any, in the style inheritance chain.",
                optional: true,
                $ref: "CSSStyle"
              },
              {
                name: "matchedCSSRules",
                description: "Matches of CSS rules matching the ancestor node in the style inheritance chain.",
                type: "array",
                items: {
                  $ref: "RuleMatch"
                }
              }
            ]
          },
          {
            id: "RuleMatch",
            description: "Match data for a CSS rule.",
            type: "object",
            properties: [
              {
                name: "rule",
                description: "CSS rule in the match.",
                $ref: "CSSRule"
              },
              {
                name: "matchingSelectors",
                description: "Matching selector indices in the rule's selectorList selectors (0-based).",
                type: "array",
                items: {
                  type: "integer"
                }
              }
            ]
          },
          {
            id: "Value",
            description: "Data for a simple selector (these are delimited by commas in a selector list).",
            type: "object",
            properties: [
              {
                name: "text",
                description: "Value text.",
                type: "string"
              },
              {
                name: "range",
                description: "Value range in the underlying resource (if available).",
                optional: true,
                $ref: "SourceRange"
              }
            ]
          },
          {
            id: "SelectorList",
            description: "Selector list data.",
            type: "object",
            properties: [
              {
                name: "selectors",
                description: "Selectors in the list.",
                type: "array",
                items: {
                  $ref: "Value"
                }
              },
              {
                name: "text",
                description: "Rule selector text.",
                type: "string"
              }
            ]
          },
          {
            id: "CSSStyleSheetHeader",
            description: "CSS stylesheet metainformation.",
            type: "object",
            properties: [
              {
                name: "styleSheetId",
                description: "The stylesheet identifier.",
                $ref: "StyleSheetId"
              },
              {
                name: "frameId",
                description: "Owner frame identifier.",
                $ref: "Page.FrameId"
              },
              {
                name: "sourceURL",
                description: "Stylesheet resource URL.",
                type: "string"
              },
              {
                name: "sourceMapURL",
                description: "URL of source map associated with the stylesheet (if any).",
                optional: true,
                type: "string"
              },
              {
                name: "origin",
                description: "Stylesheet origin.",
                $ref: "StyleSheetOrigin"
              },
              {
                name: "title",
                description: "Stylesheet title.",
                type: "string"
              },
              {
                name: "ownerNode",
                description: "The backend id for the owner node of the stylesheet.",
                optional: true,
                $ref: "DOM.BackendNodeId"
              },
              {
                name: "disabled",
                description: "Denotes whether the stylesheet is disabled.",
                type: "boolean"
              },
              {
                name: "hasSourceURL",
                description: "Whether the sourceURL field value comes from the sourceURL comment.",
                optional: true,
                type: "boolean"
              },
              {
                name: "isInline",
                description: "Whether this stylesheet is created for STYLE tag by parser. This flag is not set for\ndocument.written STYLE tags.",
                type: "boolean"
              },
              {
                name: "startLine",
                description: "Line offset of the stylesheet within the resource (zero based).",
                type: "number"
              },
              {
                name: "startColumn",
                description: "Column offset of the stylesheet within the resource (zero based).",
                type: "number"
              },
              {
                name: "length",
                description: "Size of the content (in characters).",
                type: "number"
              }
            ]
          },
          {
            id: "CSSRule",
            description: "CSS rule representation.",
            type: "object",
            properties: [
              {
                name: "styleSheetId",
                description: "The css style sheet identifier (absent for user agent stylesheet and user-specified\nstylesheet rules) this rule came from.",
                optional: true,
                $ref: "StyleSheetId"
              },
              {
                name: "selectorList",
                description: "Rule selector data.",
                $ref: "SelectorList"
              },
              {
                name: "origin",
                description: "Parent stylesheet's origin.",
                $ref: "StyleSheetOrigin"
              },
              {
                name: "style",
                description: "Associated style declaration.",
                $ref: "CSSStyle"
              },
              {
                name: "media",
                description: "Media list array (for rules involving media queries). The array enumerates media queries\nstarting with the innermost one, going outwards.",
                optional: true,
                type: "array",
                items: {
                  $ref: "CSSMedia"
                }
              }
            ]
          },
          {
            id: "RuleUsage",
            description: "CSS coverage information.",
            type: "object",
            properties: [
              {
                name: "styleSheetId",
                description: "The css style sheet identifier (absent for user agent stylesheet and user-specified\nstylesheet rules) this rule came from.",
                $ref: "StyleSheetId"
              },
              {
                name: "startOffset",
                description: "Offset of the start of the rule (including selector) from the beginning of the stylesheet.",
                type: "number"
              },
              {
                name: "endOffset",
                description: "Offset of the end of the rule body from the beginning of the stylesheet.",
                type: "number"
              },
              {
                name: "used",
                description: "Indicates whether the rule was actually used by some element in the page.",
                type: "boolean"
              }
            ]
          },
          {
            id: "SourceRange",
            description: "Text range within a resource. All numbers are zero-based.",
            type: "object",
            properties: [
              {
                name: "startLine",
                description: "Start line of range.",
                type: "integer"
              },
              {
                name: "startColumn",
                description: "Start column of range (inclusive).",
                type: "integer"
              },
              {
                name: "endLine",
                description: "End line of range",
                type: "integer"
              },
              {
                name: "endColumn",
                description: "End column of range (exclusive).",
                type: "integer"
              }
            ]
          },
          {
            id: "ShorthandEntry",
            type: "object",
            properties: [
              {
                name: "name",
                description: "Shorthand name.",
                type: "string"
              },
              {
                name: "value",
                description: "Shorthand value.",
                type: "string"
              },
              {
                name: "important",
                description: 'Whether the property has "!important" annotation (implies `false` if absent).',
                optional: true,
                type: "boolean"
              }
            ]
          },
          {
            id: "CSSComputedStyleProperty",
            type: "object",
            properties: [
              {
                name: "name",
                description: "Computed style property name.",
                type: "string"
              },
              {
                name: "value",
                description: "Computed style property value.",
                type: "string"
              }
            ]
          },
          {
            id: "CSSStyle",
            description: "CSS style representation.",
            type: "object",
            properties: [
              {
                name: "styleSheetId",
                description: "The css style sheet identifier (absent for user agent stylesheet and user-specified\nstylesheet rules) this rule came from.",
                optional: true,
                $ref: "StyleSheetId"
              },
              {
                name: "cssProperties",
                description: "CSS properties in the style.",
                type: "array",
                items: {
                  $ref: "CSSProperty"
                }
              },
              {
                name: "shorthandEntries",
                description: "Computed values for all shorthands found in the style.",
                type: "array",
                items: {
                  $ref: "ShorthandEntry"
                }
              },
              {
                name: "cssText",
                description: "Style declaration text (if available).",
                optional: true,
                type: "string"
              },
              {
                name: "range",
                description: "Style declaration range in the enclosing stylesheet (if available).",
                optional: true,
                $ref: "SourceRange"
              }
            ]
          },
          {
            id: "CSSProperty",
            description: "CSS property declaration data.",
            type: "object",
            properties: [
              {
                name: "name",
                description: "The property name.",
                type: "string"
              },
              {
                name: "value",
                description: "The property value.",
                type: "string"
              },
              {
                name: "important",
                description: 'Whether the property has "!important" annotation (implies `false` if absent).',
                optional: true,
                type: "boolean"
              },
              {
                name: "implicit",
                description: "Whether the property is implicit (implies `false` if absent).",
                optional: true,
                type: "boolean"
              },
              {
                name: "text",
                description: "The full property text as specified in the style.",
                optional: true,
                type: "string"
              },
              {
                name: "parsedOk",
                description: "Whether the property is understood by the browser (implies `true` if absent).",
                optional: true,
                type: "boolean"
              },
              {
                name: "disabled",
                description: "Whether the property is disabled by the user (present for source-based properties only).",
                optional: true,
                type: "boolean"
              },
              {
                name: "range",
                description: "The entire property range in the enclosing style declaration (if available).",
                optional: true,
                $ref: "SourceRange"
              }
            ]
          },
          {
            id: "CSSMedia",
            description: "CSS media rule descriptor.",
            type: "object",
            properties: [
              {
                name: "text",
                description: "Media query text.",
                type: "string"
              },
              {
                name: "source",
                description: `Source of the media query: "mediaRule" if specified by a @media rule, "importRule" if
specified by an @import rule, "linkedSheet" if specified by a "media" attribute in a linked
stylesheet's LINK tag, "inlineSheet" if specified by a "media" attribute in an inline
stylesheet's STYLE tag.`,
                type: "string",
                enum: [
                  "mediaRule",
                  "importRule",
                  "linkedSheet",
                  "inlineSheet"
                ]
              },
              {
                name: "sourceURL",
                description: "URL of the document containing the media query description.",
                optional: true,
                type: "string"
              },
              {
                name: "range",
                description: "The associated rule (@media or @import) header range in the enclosing stylesheet (if\navailable).",
                optional: true,
                $ref: "SourceRange"
              },
              {
                name: "styleSheetId",
                description: "Identifier of the stylesheet containing this object (if exists).",
                optional: true,
                $ref: "StyleSheetId"
              },
              {
                name: "mediaList",
                description: "Array of media queries.",
                optional: true,
                type: "array",
                items: {
                  $ref: "MediaQuery"
                }
              }
            ]
          },
          {
            id: "MediaQuery",
            description: "Media query descriptor.",
            type: "object",
            properties: [
              {
                name: "expressions",
                description: "Array of media query expressions.",
                type: "array",
                items: {
                  $ref: "MediaQueryExpression"
                }
              },
              {
                name: "active",
                description: "Whether the media query condition is satisfied.",
                type: "boolean"
              }
            ]
          },
          {
            id: "MediaQueryExpression",
            description: "Media query expression descriptor.",
            type: "object",
            properties: [
              {
                name: "value",
                description: "Media query expression value.",
                type: "number"
              },
              {
                name: "unit",
                description: "Media query expression units.",
                type: "string"
              },
              {
                name: "feature",
                description: "Media query expression feature.",
                type: "string"
              },
              {
                name: "valueRange",
                description: "The associated range of the value text in the enclosing stylesheet (if available).",
                optional: true,
                $ref: "SourceRange"
              },
              {
                name: "computedLength",
                description: "Computed length of media query expression (if applicable).",
                optional: true,
                type: "number"
              }
            ]
          },
          {
            id: "PlatformFontUsage",
            description: "Information about amount of glyphs that were rendered with given font.",
            type: "object",
            properties: [
              {
                name: "familyName",
                description: "Font's family name reported by platform.",
                type: "string"
              },
              {
                name: "isCustomFont",
                description: "Indicates if the font was downloaded or resolved locally.",
                type: "boolean"
              },
              {
                name: "glyphCount",
                description: "Amount of glyphs that were rendered with this font.",
                type: "number"
              }
            ]
          },
          {
            id: "FontFace",
            description: "Properties of a web font: https://www.w3.org/TR/2008/REC-CSS2-20080411/fonts.html#font-descriptions",
            type: "object",
            properties: [
              {
                name: "fontFamily",
                description: "The font-family.",
                type: "string"
              },
              {
                name: "fontStyle",
                description: "The font-style.",
                type: "string"
              },
              {
                name: "fontVariant",
                description: "The font-variant.",
                type: "string"
              },
              {
                name: "fontWeight",
                description: "The font-weight.",
                type: "string"
              },
              {
                name: "fontStretch",
                description: "The font-stretch.",
                type: "string"
              },
              {
                name: "unicodeRange",
                description: "The unicode-range.",
                type: "string"
              },
              {
                name: "src",
                description: "The src.",
                type: "string"
              },
              {
                name: "platformFontFamily",
                description: "The resolved platform font family",
                type: "string"
              }
            ]
          },
          {
            id: "CSSKeyframesRule",
            description: "CSS keyframes rule representation.",
            type: "object",
            properties: [
              {
                name: "animationName",
                description: "Animation name.",
                $ref: "Value"
              },
              {
                name: "keyframes",
                description: "List of keyframes.",
                type: "array",
                items: {
                  $ref: "CSSKeyframeRule"
                }
              }
            ]
          },
          {
            id: "CSSKeyframeRule",
            description: "CSS keyframe rule representation.",
            type: "object",
            properties: [
              {
                name: "styleSheetId",
                description: "The css style sheet identifier (absent for user agent stylesheet and user-specified\nstylesheet rules) this rule came from.",
                optional: true,
                $ref: "StyleSheetId"
              },
              {
                name: "origin",
                description: "Parent stylesheet's origin.",
                $ref: "StyleSheetOrigin"
              },
              {
                name: "keyText",
                description: "Associated key text.",
                $ref: "Value"
              },
              {
                name: "style",
                description: "Associated style declaration.",
                $ref: "CSSStyle"
              }
            ]
          },
          {
            id: "StyleDeclarationEdit",
            description: "A descriptor of operation to mutate style declaration text.",
            type: "object",
            properties: [
              {
                name: "styleSheetId",
                description: "The css style sheet identifier.",
                $ref: "StyleSheetId"
              },
              {
                name: "range",
                description: "The range of the style text in the enclosing stylesheet.",
                $ref: "SourceRange"
              },
              {
                name: "text",
                description: "New style text.",
                type: "string"
              }
            ]
          }
        ],
        commands: [
          {
            name: "addRule",
            description: "Inserts a new rule with the given `ruleText` in a stylesheet with given `styleSheetId`, at the\nposition specified by `location`.",
            parameters: [
              {
                name: "styleSheetId",
                description: "The css style sheet identifier where a new rule should be inserted.",
                $ref: "StyleSheetId"
              },
              {
                name: "ruleText",
                description: "The text of a new rule.",
                type: "string"
              },
              {
                name: "location",
                description: "Text position of a new rule in the target style sheet.",
                $ref: "SourceRange"
              }
            ],
            returns: [
              {
                name: "rule",
                description: "The newly created rule.",
                $ref: "CSSRule"
              }
            ]
          },
          {
            name: "collectClassNames",
            description: "Returns all class names from specified stylesheet.",
            parameters: [
              {
                name: "styleSheetId",
                $ref: "StyleSheetId"
              }
            ],
            returns: [
              {
                name: "classNames",
                description: "Class name list.",
                type: "array",
                items: {
                  type: "string"
                }
              }
            ]
          },
          {
            name: "createStyleSheet",
            description: 'Creates a new special "via-inspector" stylesheet in the frame with given `frameId`.',
            parameters: [
              {
                name: "frameId",
                description: 'Identifier of the frame where "via-inspector" stylesheet should be created.',
                $ref: "Page.FrameId"
              }
            ],
            returns: [
              {
                name: "styleSheetId",
                description: 'Identifier of the created "via-inspector" stylesheet.',
                $ref: "StyleSheetId"
              }
            ]
          },
          {
            name: "disable",
            description: "Disables the CSS agent for the given page."
          },
          {
            name: "enable",
            description: "Enables the CSS agent for the given page. Clients should not assume that the CSS agent has been\nenabled until the result of this command is received."
          },
          {
            name: "forcePseudoState",
            description: "Ensures that the given node will have specified pseudo-classes whenever its style is computed by\nthe browser.",
            parameters: [
              {
                name: "nodeId",
                description: "The element id for which to force the pseudo state.",
                $ref: "DOM.NodeId"
              },
              {
                name: "forcedPseudoClasses",
                description: "Element pseudo classes to force when computing the element's style.",
                type: "array",
                items: {
                  type: "string"
                }
              }
            ]
          },
          {
            name: "getBackgroundColors",
            parameters: [
              {
                name: "nodeId",
                description: "Id of the node to get background colors for.",
                $ref: "DOM.NodeId"
              }
            ],
            returns: [
              {
                name: "backgroundColors",
                description: "The range of background colors behind this element, if it contains any visible text. If no\nvisible text is present, this will be undefined. In the case of a flat background color,\nthis will consist of simply that color. In the case of a gradient, this will consist of each\nof the color stops. For anything more complicated, this will be an empty array. Images will\nbe ignored (as if the image had failed to load).",
                optional: true,
                type: "array",
                items: {
                  type: "string"
                }
              },
              {
                name: "computedFontSize",
                description: "The computed font size for this node, as a CSS computed value string (e.g. '12px').",
                optional: true,
                type: "string"
              },
              {
                name: "computedFontWeight",
                description: "The computed font weight for this node, as a CSS computed value string (e.g. 'normal' or\n'100').",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "getComputedStyleForNode",
            description: "Returns the computed style for a DOM node identified by `nodeId`.",
            parameters: [
              {
                name: "nodeId",
                $ref: "DOM.NodeId"
              }
            ],
            returns: [
              {
                name: "computedStyle",
                description: "Computed style for the specified DOM node.",
                type: "array",
                items: {
                  $ref: "CSSComputedStyleProperty"
                }
              }
            ]
          },
          {
            name: "getInlineStylesForNode",
            description: 'Returns the styles defined inline (explicitly in the "style" attribute and implicitly, using DOM\nattributes) for a DOM node identified by `nodeId`.',
            parameters: [
              {
                name: "nodeId",
                $ref: "DOM.NodeId"
              }
            ],
            returns: [
              {
                name: "inlineStyle",
                description: "Inline style for the specified DOM node.",
                optional: true,
                $ref: "CSSStyle"
              },
              {
                name: "attributesStyle",
                description: 'Attribute-defined element style (e.g. resulting from "width=20 height=100%").',
                optional: true,
                $ref: "CSSStyle"
              }
            ]
          },
          {
            name: "getMatchedStylesForNode",
            description: "Returns requested styles for a DOM node identified by `nodeId`.",
            parameters: [
              {
                name: "nodeId",
                $ref: "DOM.NodeId"
              }
            ],
            returns: [
              {
                name: "inlineStyle",
                description: "Inline style for the specified DOM node.",
                optional: true,
                $ref: "CSSStyle"
              },
              {
                name: "attributesStyle",
                description: 'Attribute-defined element style (e.g. resulting from "width=20 height=100%").',
                optional: true,
                $ref: "CSSStyle"
              },
              {
                name: "matchedCSSRules",
                description: "CSS rules matching this node, from all applicable stylesheets.",
                optional: true,
                type: "array",
                items: {
                  $ref: "RuleMatch"
                }
              },
              {
                name: "pseudoElements",
                description: "Pseudo style matches for this node.",
                optional: true,
                type: "array",
                items: {
                  $ref: "PseudoElementMatches"
                }
              },
              {
                name: "inherited",
                description: "A chain of inherited styles (from the immediate node parent up to the DOM tree root).",
                optional: true,
                type: "array",
                items: {
                  $ref: "InheritedStyleEntry"
                }
              },
              {
                name: "cssKeyframesRules",
                description: "A list of CSS keyframed animations matching this node.",
                optional: true,
                type: "array",
                items: {
                  $ref: "CSSKeyframesRule"
                }
              }
            ]
          },
          {
            name: "getMediaQueries",
            description: "Returns all media queries parsed by the rendering engine.",
            returns: [
              {
                name: "medias",
                type: "array",
                items: {
                  $ref: "CSSMedia"
                }
              }
            ]
          },
          {
            name: "getPlatformFontsForNode",
            description: "Requests information about platform fonts which we used to render child TextNodes in the given\nnode.",
            parameters: [
              {
                name: "nodeId",
                $ref: "DOM.NodeId"
              }
            ],
            returns: [
              {
                name: "fonts",
                description: "Usage statistics for every employed platform font.",
                type: "array",
                items: {
                  $ref: "PlatformFontUsage"
                }
              }
            ]
          },
          {
            name: "getStyleSheetText",
            description: "Returns the current textual content for a stylesheet.",
            parameters: [
              {
                name: "styleSheetId",
                $ref: "StyleSheetId"
              }
            ],
            returns: [
              {
                name: "text",
                description: "The stylesheet text.",
                type: "string"
              }
            ]
          },
          {
            name: "setEffectivePropertyValueForNode",
            description: "Find a rule with the given active property for the given node and set the new value for this\nproperty",
            parameters: [
              {
                name: "nodeId",
                description: "The element id for which to set property.",
                $ref: "DOM.NodeId"
              },
              {
                name: "propertyName",
                type: "string"
              },
              {
                name: "value",
                type: "string"
              }
            ]
          },
          {
            name: "setKeyframeKey",
            description: "Modifies the keyframe rule key text.",
            parameters: [
              {
                name: "styleSheetId",
                $ref: "StyleSheetId"
              },
              {
                name: "range",
                $ref: "SourceRange"
              },
              {
                name: "keyText",
                type: "string"
              }
            ],
            returns: [
              {
                name: "keyText",
                description: "The resulting key text after modification.",
                $ref: "Value"
              }
            ]
          },
          {
            name: "setMediaText",
            description: "Modifies the rule selector.",
            parameters: [
              {
                name: "styleSheetId",
                $ref: "StyleSheetId"
              },
              {
                name: "range",
                $ref: "SourceRange"
              },
              {
                name: "text",
                type: "string"
              }
            ],
            returns: [
              {
                name: "media",
                description: "The resulting CSS media rule after modification.",
                $ref: "CSSMedia"
              }
            ]
          },
          {
            name: "setRuleSelector",
            description: "Modifies the rule selector.",
            parameters: [
              {
                name: "styleSheetId",
                $ref: "StyleSheetId"
              },
              {
                name: "range",
                $ref: "SourceRange"
              },
              {
                name: "selector",
                type: "string"
              }
            ],
            returns: [
              {
                name: "selectorList",
                description: "The resulting selector list after modification.",
                $ref: "SelectorList"
              }
            ]
          },
          {
            name: "setStyleSheetText",
            description: "Sets the new stylesheet text.",
            parameters: [
              {
                name: "styleSheetId",
                $ref: "StyleSheetId"
              },
              {
                name: "text",
                type: "string"
              }
            ],
            returns: [
              {
                name: "sourceMapURL",
                description: "URL of source map associated with script (if any).",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "setStyleTexts",
            description: "Applies specified style edits one after another in the given order.",
            parameters: [
              {
                name: "edits",
                type: "array",
                items: {
                  $ref: "StyleDeclarationEdit"
                }
              }
            ],
            returns: [
              {
                name: "styles",
                description: "The resulting styles after modification.",
                type: "array",
                items: {
                  $ref: "CSSStyle"
                }
              }
            ]
          },
          {
            name: "startRuleUsageTracking",
            description: "Enables the selector recording."
          },
          {
            name: "stopRuleUsageTracking",
            description: "Stop tracking rule usage and return the list of rules that were used since last call to\n`takeCoverageDelta` (or since start of coverage instrumentation)",
            returns: [
              {
                name: "ruleUsage",
                type: "array",
                items: {
                  $ref: "RuleUsage"
                }
              }
            ]
          },
          {
            name: "takeCoverageDelta",
            description: "Obtain list of rules that became used since last call to this method (or since start of coverage\ninstrumentation)",
            returns: [
              {
                name: "coverage",
                type: "array",
                items: {
                  $ref: "RuleUsage"
                }
              }
            ]
          }
        ],
        events: [
          {
            name: "fontsUpdated",
            description: "Fires whenever a web font is updated.  A non-empty font parameter indicates a successfully loaded\nweb font",
            parameters: [
              {
                name: "font",
                description: "The web font that has loaded.",
                optional: true,
                $ref: "FontFace"
              }
            ]
          },
          {
            name: "mediaQueryResultChanged",
            description: "Fires whenever a MediaQuery result changes (for example, after a browser window has been\nresized.) The current implementation considers only viewport-dependent media features."
          },
          {
            name: "styleSheetAdded",
            description: "Fired whenever an active document stylesheet is added.",
            parameters: [
              {
                name: "header",
                description: "Added stylesheet metainfo.",
                $ref: "CSSStyleSheetHeader"
              }
            ]
          },
          {
            name: "styleSheetChanged",
            description: "Fired whenever a stylesheet is changed as a result of the client operation.",
            parameters: [
              {
                name: "styleSheetId",
                $ref: "StyleSheetId"
              }
            ]
          },
          {
            name: "styleSheetRemoved",
            description: "Fired whenever an active document stylesheet is removed.",
            parameters: [
              {
                name: "styleSheetId",
                description: "Identifier of the removed stylesheet.",
                $ref: "StyleSheetId"
              }
            ]
          }
        ]
      },
      {
        domain: "CacheStorage",
        experimental: true,
        types: [
          {
            id: "CacheId",
            description: "Unique identifier of the Cache object.",
            type: "string"
          },
          {
            id: "CachedResponseType",
            description: "type of HTTP response cached",
            type: "string",
            enum: [
              "basic",
              "cors",
              "default",
              "error",
              "opaqueResponse",
              "opaqueRedirect"
            ]
          },
          {
            id: "DataEntry",
            description: "Data entry.",
            type: "object",
            properties: [
              {
                name: "requestURL",
                description: "Request URL.",
                type: "string"
              },
              {
                name: "requestMethod",
                description: "Request method.",
                type: "string"
              },
              {
                name: "requestHeaders",
                description: "Request headers",
                type: "array",
                items: {
                  $ref: "Header"
                }
              },
              {
                name: "responseTime",
                description: "Number of seconds since epoch.",
                type: "number"
              },
              {
                name: "responseStatus",
                description: "HTTP response status code.",
                type: "integer"
              },
              {
                name: "responseStatusText",
                description: "HTTP response status text.",
                type: "string"
              },
              {
                name: "responseType",
                description: "HTTP response type",
                $ref: "CachedResponseType"
              },
              {
                name: "responseHeaders",
                description: "Response headers",
                type: "array",
                items: {
                  $ref: "Header"
                }
              }
            ]
          },
          {
            id: "Cache",
            description: "Cache identifier.",
            type: "object",
            properties: [
              {
                name: "cacheId",
                description: "An opaque unique id of the cache.",
                $ref: "CacheId"
              },
              {
                name: "securityOrigin",
                description: "Security origin of the cache.",
                type: "string"
              },
              {
                name: "cacheName",
                description: "The name of the cache.",
                type: "string"
              }
            ]
          },
          {
            id: "Header",
            type: "object",
            properties: [
              {
                name: "name",
                type: "string"
              },
              {
                name: "value",
                type: "string"
              }
            ]
          },
          {
            id: "CachedResponse",
            description: "Cached response",
            type: "object",
            properties: [
              {
                name: "body",
                description: "Entry content, base64-encoded.",
                type: "string"
              }
            ]
          }
        ],
        commands: [
          {
            name: "deleteCache",
            description: "Deletes a cache.",
            parameters: [
              {
                name: "cacheId",
                description: "Id of cache for deletion.",
                $ref: "CacheId"
              }
            ]
          },
          {
            name: "deleteEntry",
            description: "Deletes a cache entry.",
            parameters: [
              {
                name: "cacheId",
                description: "Id of cache where the entry will be deleted.",
                $ref: "CacheId"
              },
              {
                name: "request",
                description: "URL spec of the request.",
                type: "string"
              }
            ]
          },
          {
            name: "requestCacheNames",
            description: "Requests cache names.",
            parameters: [
              {
                name: "securityOrigin",
                description: "Security origin.",
                type: "string"
              }
            ],
            returns: [
              {
                name: "caches",
                description: "Caches for the security origin.",
                type: "array",
                items: {
                  $ref: "Cache"
                }
              }
            ]
          },
          {
            name: "requestCachedResponse",
            description: "Fetches cache entry.",
            parameters: [
              {
                name: "cacheId",
                description: "Id of cache that contains the entry.",
                $ref: "CacheId"
              },
              {
                name: "requestURL",
                description: "URL spec of the request.",
                type: "string"
              },
              {
                name: "requestHeaders",
                description: "headers of the request.",
                type: "array",
                items: {
                  $ref: "Header"
                }
              }
            ],
            returns: [
              {
                name: "response",
                description: "Response read from the cache.",
                $ref: "CachedResponse"
              }
            ]
          },
          {
            name: "requestEntries",
            description: "Requests data from cache.",
            parameters: [
              {
                name: "cacheId",
                description: "ID of cache to get entries from.",
                $ref: "CacheId"
              },
              {
                name: "skipCount",
                description: "Number of records to skip.",
                type: "integer"
              },
              {
                name: "pageSize",
                description: "Number of records to fetch.",
                type: "integer"
              },
              {
                name: "pathFilter",
                description: "If present, only return the entries containing this substring in the path",
                optional: true,
                type: "string"
              }
            ],
            returns: [
              {
                name: "cacheDataEntries",
                description: "Array of object store data entries.",
                type: "array",
                items: {
                  $ref: "DataEntry"
                }
              },
              {
                name: "returnCount",
                description: "Count of returned entries from this storage. If pathFilter is empty, it\nis the count of all entries from this storage.",
                type: "number"
              }
            ]
          }
        ]
      },
      {
        domain: "Cast",
        description: "A domain for interacting with Cast, Presentation API, and Remote Playback API\nfunctionalities.",
        experimental: true,
        types: [
          {
            id: "Sink",
            type: "object",
            properties: [
              {
                name: "name",
                type: "string"
              },
              {
                name: "id",
                type: "string"
              },
              {
                name: "session",
                description: "Text describing the current session. Present only if there is an active\nsession on the sink.",
                optional: true,
                type: "string"
              }
            ]
          }
        ],
        commands: [
          {
            name: "enable",
            description: "Starts observing for sinks that can be used for tab mirroring, and if set,\nsinks compatible with |presentationUrl| as well. When sinks are found, a\n|sinksUpdated| event is fired.\nAlso starts observing for issue messages. When an issue is added or removed,\nan |issueUpdated| event is fired.",
            parameters: [
              {
                name: "presentationUrl",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "disable",
            description: "Stops observing for sinks and issues."
          },
          {
            name: "setSinkToUse",
            description: "Sets a sink to be used when the web page requests the browser to choose a\nsink via Presentation API, Remote Playback API, or Cast SDK.",
            parameters: [
              {
                name: "sinkName",
                type: "string"
              }
            ]
          },
          {
            name: "startTabMirroring",
            description: "Starts mirroring the tab to the sink.",
            parameters: [
              {
                name: "sinkName",
                type: "string"
              }
            ]
          },
          {
            name: "stopCasting",
            description: "Stops the active Cast session on the sink.",
            parameters: [
              {
                name: "sinkName",
                type: "string"
              }
            ]
          }
        ],
        events: [
          {
            name: "sinksUpdated",
            description: "This is fired whenever the list of available sinks changes. A sink is a\ndevice or a software surface that you can cast to.",
            parameters: [
              {
                name: "sinks",
                type: "array",
                items: {
                  $ref: "Sink"
                }
              }
            ]
          },
          {
            name: "issueUpdated",
            description: "This is fired whenever the outstanding issue/error message changes.\n|issueMessage| is empty if there is no issue.",
            parameters: [
              {
                name: "issueMessage",
                type: "string"
              }
            ]
          }
        ]
      },
      {
        domain: "DOM",
        description: "This domain exposes DOM read/write operations. Each DOM Node is represented with its mirror object\nthat has an `id`. This `id` can be used to get additional information on the Node, resolve it into\nthe JavaScript object wrapper, etc. It is important that client receives DOM events only for the\nnodes that are known to the client. Backend keeps track of the nodes that were sent to the client\nand never sends the same node twice. It is client's responsibility to collect information about\nthe nodes that were sent to the client.<p>Note that `iframe` owner elements will return\ncorresponding document elements as their child nodes.</p>",
        dependencies: [
          "Runtime"
        ],
        types: [
          {
            id: "NodeId",
            description: "Unique DOM node identifier.",
            type: "integer"
          },
          {
            id: "BackendNodeId",
            description: "Unique DOM node identifier used to reference a node that may not have been pushed to the\nfront-end.",
            type: "integer"
          },
          {
            id: "BackendNode",
            description: "Backend node with a friendly name.",
            type: "object",
            properties: [
              {
                name: "nodeType",
                description: "`Node`'s nodeType.",
                type: "integer"
              },
              {
                name: "nodeName",
                description: "`Node`'s nodeName.",
                type: "string"
              },
              {
                name: "backendNodeId",
                $ref: "BackendNodeId"
              }
            ]
          },
          {
            id: "PseudoType",
            description: "Pseudo element type.",
            type: "string",
            enum: [
              "first-line",
              "first-letter",
              "before",
              "after",
              "backdrop",
              "selection",
              "first-line-inherited",
              "scrollbar",
              "scrollbar-thumb",
              "scrollbar-button",
              "scrollbar-track",
              "scrollbar-track-piece",
              "scrollbar-corner",
              "resizer",
              "input-list-button"
            ]
          },
          {
            id: "ShadowRootType",
            description: "Shadow root type.",
            type: "string",
            enum: [
              "user-agent",
              "open",
              "closed"
            ]
          },
          {
            id: "Node",
            description: "DOM interaction is implemented in terms of mirror objects that represent the actual DOM nodes.\nDOMNode is a base node mirror type.",
            type: "object",
            properties: [
              {
                name: "nodeId",
                description: "Node identifier that is passed into the rest of the DOM messages as the `nodeId`. Backend\nwill only push node with given `id` once. It is aware of all requested nodes and will only\nfire DOM events for nodes known to the client.",
                $ref: "NodeId"
              },
              {
                name: "parentId",
                description: "The id of the parent node if any.",
                optional: true,
                $ref: "NodeId"
              },
              {
                name: "backendNodeId",
                description: "The BackendNodeId for this node.",
                $ref: "BackendNodeId"
              },
              {
                name: "nodeType",
                description: "`Node`'s nodeType.",
                type: "integer"
              },
              {
                name: "nodeName",
                description: "`Node`'s nodeName.",
                type: "string"
              },
              {
                name: "localName",
                description: "`Node`'s localName.",
                type: "string"
              },
              {
                name: "nodeValue",
                description: "`Node`'s nodeValue.",
                type: "string"
              },
              {
                name: "childNodeCount",
                description: "Child count for `Container` nodes.",
                optional: true,
                type: "integer"
              },
              {
                name: "children",
                description: "Child nodes of this node when requested with children.",
                optional: true,
                type: "array",
                items: {
                  $ref: "Node"
                }
              },
              {
                name: "attributes",
                description: "Attributes of the `Element` node in the form of flat array `[name1, value1, name2, value2]`.",
                optional: true,
                type: "array",
                items: {
                  type: "string"
                }
              },
              {
                name: "documentURL",
                description: "Document URL that `Document` or `FrameOwner` node points to.",
                optional: true,
                type: "string"
              },
              {
                name: "baseURL",
                description: "Base URL that `Document` or `FrameOwner` node uses for URL completion.",
                optional: true,
                type: "string"
              },
              {
                name: "publicId",
                description: "`DocumentType`'s publicId.",
                optional: true,
                type: "string"
              },
              {
                name: "systemId",
                description: "`DocumentType`'s systemId.",
                optional: true,
                type: "string"
              },
              {
                name: "internalSubset",
                description: "`DocumentType`'s internalSubset.",
                optional: true,
                type: "string"
              },
              {
                name: "xmlVersion",
                description: "`Document`'s XML version in case of XML documents.",
                optional: true,
                type: "string"
              },
              {
                name: "name",
                description: "`Attr`'s name.",
                optional: true,
                type: "string"
              },
              {
                name: "value",
                description: "`Attr`'s value.",
                optional: true,
                type: "string"
              },
              {
                name: "pseudoType",
                description: "Pseudo element type for this node.",
                optional: true,
                $ref: "PseudoType"
              },
              {
                name: "shadowRootType",
                description: "Shadow root type.",
                optional: true,
                $ref: "ShadowRootType"
              },
              {
                name: "frameId",
                description: "Frame ID for frame owner elements.",
                optional: true,
                $ref: "Page.FrameId"
              },
              {
                name: "contentDocument",
                description: "Content document for frame owner elements.",
                optional: true,
                $ref: "Node"
              },
              {
                name: "shadowRoots",
                description: "Shadow root list for given element host.",
                optional: true,
                type: "array",
                items: {
                  $ref: "Node"
                }
              },
              {
                name: "templateContent",
                description: "Content document fragment for template elements.",
                optional: true,
                $ref: "Node"
              },
              {
                name: "pseudoElements",
                description: "Pseudo elements associated with this node.",
                optional: true,
                type: "array",
                items: {
                  $ref: "Node"
                }
              },
              {
                name: "importedDocument",
                description: "Import document for the HTMLImport links.",
                optional: true,
                $ref: "Node"
              },
              {
                name: "distributedNodes",
                description: "Distributed nodes for given insertion point.",
                optional: true,
                type: "array",
                items: {
                  $ref: "BackendNode"
                }
              },
              {
                name: "isSVG",
                description: "Whether the node is SVG.",
                optional: true,
                type: "boolean"
              }
            ]
          },
          {
            id: "RGBA",
            description: "A structure holding an RGBA color.",
            type: "object",
            properties: [
              {
                name: "r",
                description: "The red component, in the [0-255] range.",
                type: "integer"
              },
              {
                name: "g",
                description: "The green component, in the [0-255] range.",
                type: "integer"
              },
              {
                name: "b",
                description: "The blue component, in the [0-255] range.",
                type: "integer"
              },
              {
                name: "a",
                description: "The alpha component, in the [0-1] range (default: 1).",
                optional: true,
                type: "number"
              }
            ]
          },
          {
            id: "Quad",
            description: "An array of quad vertices, x immediately followed by y for each point, points clock-wise.",
            type: "array",
            items: {
              type: "number"
            }
          },
          {
            id: "BoxModel",
            description: "Box model.",
            type: "object",
            properties: [
              {
                name: "content",
                description: "Content box",
                $ref: "Quad"
              },
              {
                name: "padding",
                description: "Padding box",
                $ref: "Quad"
              },
              {
                name: "border",
                description: "Border box",
                $ref: "Quad"
              },
              {
                name: "margin",
                description: "Margin box",
                $ref: "Quad"
              },
              {
                name: "width",
                description: "Node width",
                type: "integer"
              },
              {
                name: "height",
                description: "Node height",
                type: "integer"
              },
              {
                name: "shapeOutside",
                description: "Shape outside coordinates",
                optional: true,
                $ref: "ShapeOutsideInfo"
              }
            ]
          },
          {
            id: "ShapeOutsideInfo",
            description: "CSS Shape Outside details.",
            type: "object",
            properties: [
              {
                name: "bounds",
                description: "Shape bounds",
                $ref: "Quad"
              },
              {
                name: "shape",
                description: "Shape coordinate details",
                type: "array",
                items: {
                  type: "any"
                }
              },
              {
                name: "marginShape",
                description: "Margin shape bounds",
                type: "array",
                items: {
                  type: "any"
                }
              }
            ]
          },
          {
            id: "Rect",
            description: "Rectangle.",
            type: "object",
            properties: [
              {
                name: "x",
                description: "X coordinate",
                type: "number"
              },
              {
                name: "y",
                description: "Y coordinate",
                type: "number"
              },
              {
                name: "width",
                description: "Rectangle width",
                type: "number"
              },
              {
                name: "height",
                description: "Rectangle height",
                type: "number"
              }
            ]
          }
        ],
        commands: [
          {
            name: "collectClassNamesFromSubtree",
            description: "Collects class names for the node with given id and all of it's child nodes.",
            experimental: true,
            parameters: [
              {
                name: "nodeId",
                description: "Id of the node to collect class names.",
                $ref: "NodeId"
              }
            ],
            returns: [
              {
                name: "classNames",
                description: "Class name list.",
                type: "array",
                items: {
                  type: "string"
                }
              }
            ]
          },
          {
            name: "copyTo",
            description: "Creates a deep copy of the specified node and places it into the target container before the\ngiven anchor.",
            experimental: true,
            parameters: [
              {
                name: "nodeId",
                description: "Id of the node to copy.",
                $ref: "NodeId"
              },
              {
                name: "targetNodeId",
                description: "Id of the element to drop the copy into.",
                $ref: "NodeId"
              },
              {
                name: "insertBeforeNodeId",
                description: "Drop the copy before this node (if absent, the copy becomes the last child of\n`targetNodeId`).",
                optional: true,
                $ref: "NodeId"
              }
            ],
            returns: [
              {
                name: "nodeId",
                description: "Id of the node clone.",
                $ref: "NodeId"
              }
            ]
          },
          {
            name: "describeNode",
            description: "Describes node given its id, does not require domain to be enabled. Does not start tracking any\nobjects, can be used for automation.",
            parameters: [
              {
                name: "nodeId",
                description: "Identifier of the node.",
                optional: true,
                $ref: "NodeId"
              },
              {
                name: "backendNodeId",
                description: "Identifier of the backend node.",
                optional: true,
                $ref: "BackendNodeId"
              },
              {
                name: "objectId",
                description: "JavaScript object id of the node wrapper.",
                optional: true,
                $ref: "Runtime.RemoteObjectId"
              },
              {
                name: "depth",
                description: "The maximum depth at which children should be retrieved, defaults to 1. Use -1 for the\nentire subtree or provide an integer larger than 0.",
                optional: true,
                type: "integer"
              },
              {
                name: "pierce",
                description: "Whether or not iframes and shadow roots should be traversed when returning the subtree\n(default is false).",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "node",
                description: "Node description.",
                $ref: "Node"
              }
            ]
          },
          {
            name: "disable",
            description: "Disables DOM agent for the given page."
          },
          {
            name: "discardSearchResults",
            description: "Discards search results from the session with the given id. `getSearchResults` should no longer\nbe called for that search.",
            experimental: true,
            parameters: [
              {
                name: "searchId",
                description: "Unique search session identifier.",
                type: "string"
              }
            ]
          },
          {
            name: "enable",
            description: "Enables DOM agent for the given page."
          },
          {
            name: "focus",
            description: "Focuses the given element.",
            parameters: [
              {
                name: "nodeId",
                description: "Identifier of the node.",
                optional: true,
                $ref: "NodeId"
              },
              {
                name: "backendNodeId",
                description: "Identifier of the backend node.",
                optional: true,
                $ref: "BackendNodeId"
              },
              {
                name: "objectId",
                description: "JavaScript object id of the node wrapper.",
                optional: true,
                $ref: "Runtime.RemoteObjectId"
              }
            ]
          },
          {
            name: "getAttributes",
            description: "Returns attributes for the specified node.",
            parameters: [
              {
                name: "nodeId",
                description: "Id of the node to retrieve attibutes for.",
                $ref: "NodeId"
              }
            ],
            returns: [
              {
                name: "attributes",
                description: "An interleaved array of node attribute names and values.",
                type: "array",
                items: {
                  type: "string"
                }
              }
            ]
          },
          {
            name: "getBoxModel",
            description: "Returns boxes for the given node.",
            parameters: [
              {
                name: "nodeId",
                description: "Identifier of the node.",
                optional: true,
                $ref: "NodeId"
              },
              {
                name: "backendNodeId",
                description: "Identifier of the backend node.",
                optional: true,
                $ref: "BackendNodeId"
              },
              {
                name: "objectId",
                description: "JavaScript object id of the node wrapper.",
                optional: true,
                $ref: "Runtime.RemoteObjectId"
              }
            ],
            returns: [
              {
                name: "model",
                description: "Box model for the node.",
                $ref: "BoxModel"
              }
            ]
          },
          {
            name: "getContentQuads",
            description: "Returns quads that describe node position on the page. This method\nmight return multiple quads for inline nodes.",
            experimental: true,
            parameters: [
              {
                name: "nodeId",
                description: "Identifier of the node.",
                optional: true,
                $ref: "NodeId"
              },
              {
                name: "backendNodeId",
                description: "Identifier of the backend node.",
                optional: true,
                $ref: "BackendNodeId"
              },
              {
                name: "objectId",
                description: "JavaScript object id of the node wrapper.",
                optional: true,
                $ref: "Runtime.RemoteObjectId"
              }
            ],
            returns: [
              {
                name: "quads",
                description: "Quads that describe node layout relative to viewport.",
                type: "array",
                items: {
                  $ref: "Quad"
                }
              }
            ]
          },
          {
            name: "getDocument",
            description: "Returns the root DOM node (and optionally the subtree) to the caller.",
            parameters: [
              {
                name: "depth",
                description: "The maximum depth at which children should be retrieved, defaults to 1. Use -1 for the\nentire subtree or provide an integer larger than 0.",
                optional: true,
                type: "integer"
              },
              {
                name: "pierce",
                description: "Whether or not iframes and shadow roots should be traversed when returning the subtree\n(default is false).",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "root",
                description: "Resulting node.",
                $ref: "Node"
              }
            ]
          },
          {
            name: "getFlattenedDocument",
            description: "Returns the root DOM node (and optionally the subtree) to the caller.",
            parameters: [
              {
                name: "depth",
                description: "The maximum depth at which children should be retrieved, defaults to 1. Use -1 for the\nentire subtree or provide an integer larger than 0.",
                optional: true,
                type: "integer"
              },
              {
                name: "pierce",
                description: "Whether or not iframes and shadow roots should be traversed when returning the subtree\n(default is false).",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "nodes",
                description: "Resulting node.",
                type: "array",
                items: {
                  $ref: "Node"
                }
              }
            ]
          },
          {
            name: "getNodeForLocation",
            description: "Returns node id at given location. Depending on whether DOM domain is enabled, nodeId is\neither returned or not.",
            experimental: true,
            parameters: [
              {
                name: "x",
                description: "X coordinate.",
                type: "integer"
              },
              {
                name: "y",
                description: "Y coordinate.",
                type: "integer"
              },
              {
                name: "includeUserAgentShadowDOM",
                description: "False to skip to the nearest non-UA shadow root ancestor (default: false).",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "backendNodeId",
                description: "Resulting node.",
                $ref: "BackendNodeId"
              },
              {
                name: "nodeId",
                description: "Id of the node at given coordinates, only when enabled and requested document.",
                optional: true,
                $ref: "NodeId"
              }
            ]
          },
          {
            name: "getOuterHTML",
            description: "Returns node's HTML markup.",
            parameters: [
              {
                name: "nodeId",
                description: "Identifier of the node.",
                optional: true,
                $ref: "NodeId"
              },
              {
                name: "backendNodeId",
                description: "Identifier of the backend node.",
                optional: true,
                $ref: "BackendNodeId"
              },
              {
                name: "objectId",
                description: "JavaScript object id of the node wrapper.",
                optional: true,
                $ref: "Runtime.RemoteObjectId"
              }
            ],
            returns: [
              {
                name: "outerHTML",
                description: "Outer HTML markup.",
                type: "string"
              }
            ]
          },
          {
            name: "getRelayoutBoundary",
            description: "Returns the id of the nearest ancestor that is a relayout boundary.",
            experimental: true,
            parameters: [
              {
                name: "nodeId",
                description: "Id of the node.",
                $ref: "NodeId"
              }
            ],
            returns: [
              {
                name: "nodeId",
                description: "Relayout boundary node id for the given node.",
                $ref: "NodeId"
              }
            ]
          },
          {
            name: "getSearchResults",
            description: "Returns search results from given `fromIndex` to given `toIndex` from the search with the given\nidentifier.",
            experimental: true,
            parameters: [
              {
                name: "searchId",
                description: "Unique search session identifier.",
                type: "string"
              },
              {
                name: "fromIndex",
                description: "Start index of the search result to be returned.",
                type: "integer"
              },
              {
                name: "toIndex",
                description: "End index of the search result to be returned.",
                type: "integer"
              }
            ],
            returns: [
              {
                name: "nodeIds",
                description: "Ids of the search result nodes.",
                type: "array",
                items: {
                  $ref: "NodeId"
                }
              }
            ]
          },
          {
            name: "hideHighlight",
            description: "Hides any highlight.",
            redirect: "Overlay"
          },
          {
            name: "highlightNode",
            description: "Highlights DOM node.",
            redirect: "Overlay"
          },
          {
            name: "highlightRect",
            description: "Highlights given rectangle.",
            redirect: "Overlay"
          },
          {
            name: "markUndoableState",
            description: "Marks last undoable state.",
            experimental: true
          },
          {
            name: "moveTo",
            description: "Moves node into the new container, places it before the given anchor.",
            parameters: [
              {
                name: "nodeId",
                description: "Id of the node to move.",
                $ref: "NodeId"
              },
              {
                name: "targetNodeId",
                description: "Id of the element to drop the moved node into.",
                $ref: "NodeId"
              },
              {
                name: "insertBeforeNodeId",
                description: "Drop node before this one (if absent, the moved node becomes the last child of\n`targetNodeId`).",
                optional: true,
                $ref: "NodeId"
              }
            ],
            returns: [
              {
                name: "nodeId",
                description: "New id of the moved node.",
                $ref: "NodeId"
              }
            ]
          },
          {
            name: "performSearch",
            description: "Searches for a given string in the DOM tree. Use `getSearchResults` to access search results or\n`cancelSearch` to end this search session.",
            experimental: true,
            parameters: [
              {
                name: "query",
                description: "Plain text or query selector or XPath search query.",
                type: "string"
              },
              {
                name: "includeUserAgentShadowDOM",
                description: "True to search in user agent shadow DOM.",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "searchId",
                description: "Unique search session identifier.",
                type: "string"
              },
              {
                name: "resultCount",
                description: "Number of search results.",
                type: "integer"
              }
            ]
          },
          {
            name: "pushNodeByPathToFrontend",
            description: "Requests that the node is sent to the caller given its path. // FIXME, use XPath",
            experimental: true,
            parameters: [
              {
                name: "path",
                description: "Path to node in the proprietary format.",
                type: "string"
              }
            ],
            returns: [
              {
                name: "nodeId",
                description: "Id of the node for given path.",
                $ref: "NodeId"
              }
            ]
          },
          {
            name: "pushNodesByBackendIdsToFrontend",
            description: "Requests that a batch of nodes is sent to the caller given their backend node ids.",
            experimental: true,
            parameters: [
              {
                name: "backendNodeIds",
                description: "The array of backend node ids.",
                type: "array",
                items: {
                  $ref: "BackendNodeId"
                }
              }
            ],
            returns: [
              {
                name: "nodeIds",
                description: "The array of ids of pushed nodes that correspond to the backend ids specified in\nbackendNodeIds.",
                type: "array",
                items: {
                  $ref: "NodeId"
                }
              }
            ]
          },
          {
            name: "querySelector",
            description: "Executes `querySelector` on a given node.",
            parameters: [
              {
                name: "nodeId",
                description: "Id of the node to query upon.",
                $ref: "NodeId"
              },
              {
                name: "selector",
                description: "Selector string.",
                type: "string"
              }
            ],
            returns: [
              {
                name: "nodeId",
                description: "Query selector result.",
                $ref: "NodeId"
              }
            ]
          },
          {
            name: "querySelectorAll",
            description: "Executes `querySelectorAll` on a given node.",
            parameters: [
              {
                name: "nodeId",
                description: "Id of the node to query upon.",
                $ref: "NodeId"
              },
              {
                name: "selector",
                description: "Selector string.",
                type: "string"
              }
            ],
            returns: [
              {
                name: "nodeIds",
                description: "Query selector result.",
                type: "array",
                items: {
                  $ref: "NodeId"
                }
              }
            ]
          },
          {
            name: "redo",
            description: "Re-does the last undone action.",
            experimental: true
          },
          {
            name: "removeAttribute",
            description: "Removes attribute with given name from an element with given id.",
            parameters: [
              {
                name: "nodeId",
                description: "Id of the element to remove attribute from.",
                $ref: "NodeId"
              },
              {
                name: "name",
                description: "Name of the attribute to remove.",
                type: "string"
              }
            ]
          },
          {
            name: "removeNode",
            description: "Removes node with given id.",
            parameters: [
              {
                name: "nodeId",
                description: "Id of the node to remove.",
                $ref: "NodeId"
              }
            ]
          },
          {
            name: "requestChildNodes",
            description: "Requests that children of the node with given id are returned to the caller in form of\n`setChildNodes` events where not only immediate children are retrieved, but all children down to\nthe specified depth.",
            parameters: [
              {
                name: "nodeId",
                description: "Id of the node to get children for.",
                $ref: "NodeId"
              },
              {
                name: "depth",
                description: "The maximum depth at which children should be retrieved, defaults to 1. Use -1 for the\nentire subtree or provide an integer larger than 0.",
                optional: true,
                type: "integer"
              },
              {
                name: "pierce",
                description: "Whether or not iframes and shadow roots should be traversed when returning the sub-tree\n(default is false).",
                optional: true,
                type: "boolean"
              }
            ]
          },
          {
            name: "requestNode",
            description: "Requests that the node is sent to the caller given the JavaScript node object reference. All\nnodes that form the path from the node to the root are also sent to the client as a series of\n`setChildNodes` notifications.",
            parameters: [
              {
                name: "objectId",
                description: "JavaScript object id to convert into node.",
                $ref: "Runtime.RemoteObjectId"
              }
            ],
            returns: [
              {
                name: "nodeId",
                description: "Node id for given object.",
                $ref: "NodeId"
              }
            ]
          },
          {
            name: "resolveNode",
            description: "Resolves the JavaScript node object for a given NodeId or BackendNodeId.",
            parameters: [
              {
                name: "nodeId",
                description: "Id of the node to resolve.",
                optional: true,
                $ref: "NodeId"
              },
              {
                name: "backendNodeId",
                description: "Backend identifier of the node to resolve.",
                optional: true,
                $ref: "DOM.BackendNodeId"
              },
              {
                name: "objectGroup",
                description: "Symbolic group name that can be used to release multiple objects.",
                optional: true,
                type: "string"
              },
              {
                name: "executionContextId",
                description: "Execution context in which to resolve the node.",
                optional: true,
                $ref: "Runtime.ExecutionContextId"
              }
            ],
            returns: [
              {
                name: "object",
                description: "JavaScript object wrapper for given node.",
                $ref: "Runtime.RemoteObject"
              }
            ]
          },
          {
            name: "setAttributeValue",
            description: "Sets attribute for an element with given id.",
            parameters: [
              {
                name: "nodeId",
                description: "Id of the element to set attribute for.",
                $ref: "NodeId"
              },
              {
                name: "name",
                description: "Attribute name.",
                type: "string"
              },
              {
                name: "value",
                description: "Attribute value.",
                type: "string"
              }
            ]
          },
          {
            name: "setAttributesAsText",
            description: "Sets attributes on element with given id. This method is useful when user edits some existing\nattribute value and types in several attribute name/value pairs.",
            parameters: [
              {
                name: "nodeId",
                description: "Id of the element to set attributes for.",
                $ref: "NodeId"
              },
              {
                name: "text",
                description: "Text with a number of attributes. Will parse this text using HTML parser.",
                type: "string"
              },
              {
                name: "name",
                description: "Attribute name to replace with new attributes derived from text in case text parsed\nsuccessfully.",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "setFileInputFiles",
            description: "Sets files for the given file input element.",
            parameters: [
              {
                name: "files",
                description: "Array of file paths to set.",
                type: "array",
                items: {
                  type: "string"
                }
              },
              {
                name: "nodeId",
                description: "Identifier of the node.",
                optional: true,
                $ref: "NodeId"
              },
              {
                name: "backendNodeId",
                description: "Identifier of the backend node.",
                optional: true,
                $ref: "BackendNodeId"
              },
              {
                name: "objectId",
                description: "JavaScript object id of the node wrapper.",
                optional: true,
                $ref: "Runtime.RemoteObjectId"
              }
            ]
          },
          {
            name: "getFileInfo",
            description: "Returns file information for the given\nFile wrapper.",
            experimental: true,
            parameters: [
              {
                name: "objectId",
                description: "JavaScript object id of the node wrapper.",
                $ref: "Runtime.RemoteObjectId"
              }
            ],
            returns: [
              {
                name: "path",
                type: "string"
              }
            ]
          },
          {
            name: "setInspectedNode",
            description: "Enables console to refer to the node with given id via $x (see Command Line API for more details\n$x functions).",
            experimental: true,
            parameters: [
              {
                name: "nodeId",
                description: "DOM node id to be accessible by means of $x command line API.",
                $ref: "NodeId"
              }
            ]
          },
          {
            name: "setNodeName",
            description: "Sets node name for a node with given id.",
            parameters: [
              {
                name: "nodeId",
                description: "Id of the node to set name for.",
                $ref: "NodeId"
              },
              {
                name: "name",
                description: "New node's name.",
                type: "string"
              }
            ],
            returns: [
              {
                name: "nodeId",
                description: "New node's id.",
                $ref: "NodeId"
              }
            ]
          },
          {
            name: "setNodeValue",
            description: "Sets node value for a node with given id.",
            parameters: [
              {
                name: "nodeId",
                description: "Id of the node to set value for.",
                $ref: "NodeId"
              },
              {
                name: "value",
                description: "New node's value.",
                type: "string"
              }
            ]
          },
          {
            name: "setOuterHTML",
            description: "Sets node HTML markup, returns new node id.",
            parameters: [
              {
                name: "nodeId",
                description: "Id of the node to set markup for.",
                $ref: "NodeId"
              },
              {
                name: "outerHTML",
                description: "Outer HTML markup to set.",
                type: "string"
              }
            ]
          },
          {
            name: "undo",
            description: "Undoes the last performed action.",
            experimental: true
          },
          {
            name: "getFrameOwner",
            description: "Returns iframe node that owns iframe with the given domain.",
            experimental: true,
            parameters: [
              {
                name: "frameId",
                $ref: "Page.FrameId"
              }
            ],
            returns: [
              {
                name: "backendNodeId",
                description: "Resulting node.",
                $ref: "BackendNodeId"
              },
              {
                name: "nodeId",
                description: "Id of the node at given coordinates, only when enabled and requested document.",
                optional: true,
                $ref: "NodeId"
              }
            ]
          }
        ],
        events: [
          {
            name: "attributeModified",
            description: "Fired when `Element`'s attribute is modified.",
            parameters: [
              {
                name: "nodeId",
                description: "Id of the node that has changed.",
                $ref: "NodeId"
              },
              {
                name: "name",
                description: "Attribute name.",
                type: "string"
              },
              {
                name: "value",
                description: "Attribute value.",
                type: "string"
              }
            ]
          },
          {
            name: "attributeRemoved",
            description: "Fired when `Element`'s attribute is removed.",
            parameters: [
              {
                name: "nodeId",
                description: "Id of the node that has changed.",
                $ref: "NodeId"
              },
              {
                name: "name",
                description: "A ttribute name.",
                type: "string"
              }
            ]
          },
          {
            name: "characterDataModified",
            description: "Mirrors `DOMCharacterDataModified` event.",
            parameters: [
              {
                name: "nodeId",
                description: "Id of the node that has changed.",
                $ref: "NodeId"
              },
              {
                name: "characterData",
                description: "New text value.",
                type: "string"
              }
            ]
          },
          {
            name: "childNodeCountUpdated",
            description: "Fired when `Container`'s child node count has changed.",
            parameters: [
              {
                name: "nodeId",
                description: "Id of the node that has changed.",
                $ref: "NodeId"
              },
              {
                name: "childNodeCount",
                description: "New node count.",
                type: "integer"
              }
            ]
          },
          {
            name: "childNodeInserted",
            description: "Mirrors `DOMNodeInserted` event.",
            parameters: [
              {
                name: "parentNodeId",
                description: "Id of the node that has changed.",
                $ref: "NodeId"
              },
              {
                name: "previousNodeId",
                description: "If of the previous siblint.",
                $ref: "NodeId"
              },
              {
                name: "node",
                description: "Inserted node data.",
                $ref: "Node"
              }
            ]
          },
          {
            name: "childNodeRemoved",
            description: "Mirrors `DOMNodeRemoved` event.",
            parameters: [
              {
                name: "parentNodeId",
                description: "Parent id.",
                $ref: "NodeId"
              },
              {
                name: "nodeId",
                description: "Id of the node that has been removed.",
                $ref: "NodeId"
              }
            ]
          },
          {
            name: "distributedNodesUpdated",
            description: "Called when distrubution is changed.",
            experimental: true,
            parameters: [
              {
                name: "insertionPointId",
                description: "Insertion point where distrubuted nodes were updated.",
                $ref: "NodeId"
              },
              {
                name: "distributedNodes",
                description: "Distributed nodes for given insertion point.",
                type: "array",
                items: {
                  $ref: "BackendNode"
                }
              }
            ]
          },
          {
            name: "documentUpdated",
            description: "Fired when `Document` has been totally updated. Node ids are no longer valid."
          },
          {
            name: "inlineStyleInvalidated",
            description: "Fired when `Element`'s inline style is modified via a CSS property modification.",
            experimental: true,
            parameters: [
              {
                name: "nodeIds",
                description: "Ids of the nodes for which the inline styles have been invalidated.",
                type: "array",
                items: {
                  $ref: "NodeId"
                }
              }
            ]
          },
          {
            name: "pseudoElementAdded",
            description: "Called when a pseudo element is added to an element.",
            experimental: true,
            parameters: [
              {
                name: "parentId",
                description: "Pseudo element's parent element id.",
                $ref: "NodeId"
              },
              {
                name: "pseudoElement",
                description: "The added pseudo element.",
                $ref: "Node"
              }
            ]
          },
          {
            name: "pseudoElementRemoved",
            description: "Called when a pseudo element is removed from an element.",
            experimental: true,
            parameters: [
              {
                name: "parentId",
                description: "Pseudo element's parent element id.",
                $ref: "NodeId"
              },
              {
                name: "pseudoElementId",
                description: "The removed pseudo element id.",
                $ref: "NodeId"
              }
            ]
          },
          {
            name: "setChildNodes",
            description: "Fired when backend wants to provide client with the missing DOM structure. This happens upon\nmost of the calls requesting node ids.",
            parameters: [
              {
                name: "parentId",
                description: "Parent node id to populate with children.",
                $ref: "NodeId"
              },
              {
                name: "nodes",
                description: "Child nodes array.",
                type: "array",
                items: {
                  $ref: "Node"
                }
              }
            ]
          },
          {
            name: "shadowRootPopped",
            description: "Called when shadow root is popped from the element.",
            experimental: true,
            parameters: [
              {
                name: "hostId",
                description: "Host element id.",
                $ref: "NodeId"
              },
              {
                name: "rootId",
                description: "Shadow root id.",
                $ref: "NodeId"
              }
            ]
          },
          {
            name: "shadowRootPushed",
            description: "Called when shadow root is pushed into the element.",
            experimental: true,
            parameters: [
              {
                name: "hostId",
                description: "Host element id.",
                $ref: "NodeId"
              },
              {
                name: "root",
                description: "Shadow root.",
                $ref: "Node"
              }
            ]
          }
        ]
      },
      {
        domain: "DOMDebugger",
        description: "DOM debugging allows setting breakpoints on particular DOM operations and events. JavaScript\nexecution will stop on these operations as if there was a regular breakpoint set.",
        dependencies: [
          "DOM",
          "Debugger",
          "Runtime"
        ],
        types: [
          {
            id: "DOMBreakpointType",
            description: "DOM breakpoint type.",
            type: "string",
            enum: [
              "subtree-modified",
              "attribute-modified",
              "node-removed"
            ]
          },
          {
            id: "EventListener",
            description: "Object event listener.",
            type: "object",
            properties: [
              {
                name: "type",
                description: "`EventListener`'s type.",
                type: "string"
              },
              {
                name: "useCapture",
                description: "`EventListener`'s useCapture.",
                type: "boolean"
              },
              {
                name: "passive",
                description: "`EventListener`'s passive flag.",
                type: "boolean"
              },
              {
                name: "once",
                description: "`EventListener`'s once flag.",
                type: "boolean"
              },
              {
                name: "scriptId",
                description: "Script id of the handler code.",
                $ref: "Runtime.ScriptId"
              },
              {
                name: "lineNumber",
                description: "Line number in the script (0-based).",
                type: "integer"
              },
              {
                name: "columnNumber",
                description: "Column number in the script (0-based).",
                type: "integer"
              },
              {
                name: "handler",
                description: "Event handler function value.",
                optional: true,
                $ref: "Runtime.RemoteObject"
              },
              {
                name: "originalHandler",
                description: "Event original handler function value.",
                optional: true,
                $ref: "Runtime.RemoteObject"
              },
              {
                name: "backendNodeId",
                description: "Node the listener is added to (if any).",
                optional: true,
                $ref: "DOM.BackendNodeId"
              }
            ]
          }
        ],
        commands: [
          {
            name: "getEventListeners",
            description: "Returns event listeners of the given object.",
            parameters: [
              {
                name: "objectId",
                description: "Identifier of the object to return listeners for.",
                $ref: "Runtime.RemoteObjectId"
              },
              {
                name: "depth",
                description: "The maximum depth at which Node children should be retrieved, defaults to 1. Use -1 for the\nentire subtree or provide an integer larger than 0.",
                optional: true,
                type: "integer"
              },
              {
                name: "pierce",
                description: "Whether or not iframes and shadow roots should be traversed when returning the subtree\n(default is false). Reports listeners for all contexts if pierce is enabled.",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "listeners",
                description: "Array of relevant listeners.",
                type: "array",
                items: {
                  $ref: "EventListener"
                }
              }
            ]
          },
          {
            name: "removeDOMBreakpoint",
            description: "Removes DOM breakpoint that was set using `setDOMBreakpoint`.",
            parameters: [
              {
                name: "nodeId",
                description: "Identifier of the node to remove breakpoint from.",
                $ref: "DOM.NodeId"
              },
              {
                name: "type",
                description: "Type of the breakpoint to remove.",
                $ref: "DOMBreakpointType"
              }
            ]
          },
          {
            name: "removeEventListenerBreakpoint",
            description: "Removes breakpoint on particular DOM event.",
            parameters: [
              {
                name: "eventName",
                description: "Event name.",
                type: "string"
              },
              {
                name: "targetName",
                description: "EventTarget interface name.",
                experimental: true,
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "removeInstrumentationBreakpoint",
            description: "Removes breakpoint on particular native event.",
            experimental: true,
            parameters: [
              {
                name: "eventName",
                description: "Instrumentation name to stop on.",
                type: "string"
              }
            ]
          },
          {
            name: "removeXHRBreakpoint",
            description: "Removes breakpoint from XMLHttpRequest.",
            parameters: [
              {
                name: "url",
                description: "Resource URL substring.",
                type: "string"
              }
            ]
          },
          {
            name: "setDOMBreakpoint",
            description: "Sets breakpoint on particular operation with DOM.",
            parameters: [
              {
                name: "nodeId",
                description: "Identifier of the node to set breakpoint on.",
                $ref: "DOM.NodeId"
              },
              {
                name: "type",
                description: "Type of the operation to stop upon.",
                $ref: "DOMBreakpointType"
              }
            ]
          },
          {
            name: "setEventListenerBreakpoint",
            description: "Sets breakpoint on particular DOM event.",
            parameters: [
              {
                name: "eventName",
                description: "DOM Event name to stop on (any DOM event will do).",
                type: "string"
              },
              {
                name: "targetName",
                description: 'EventTarget interface name to stop on. If equal to `"*"` or not provided, will stop on any\nEventTarget.',
                experimental: true,
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "setInstrumentationBreakpoint",
            description: "Sets breakpoint on particular native event.",
            experimental: true,
            parameters: [
              {
                name: "eventName",
                description: "Instrumentation name to stop on.",
                type: "string"
              }
            ]
          },
          {
            name: "setXHRBreakpoint",
            description: "Sets breakpoint on XMLHttpRequest.",
            parameters: [
              {
                name: "url",
                description: "Resource URL substring. All XHRs having this substring in the URL will get stopped upon.",
                type: "string"
              }
            ]
          }
        ]
      },
      {
        domain: "DOMSnapshot",
        description: "This domain facilitates obtaining document snapshots with DOM, layout, and style information.",
        experimental: true,
        dependencies: [
          "CSS",
          "DOM",
          "DOMDebugger",
          "Page"
        ],
        types: [
          {
            id: "DOMNode",
            description: "A Node in the DOM tree.",
            type: "object",
            properties: [
              {
                name: "nodeType",
                description: "`Node`'s nodeType.",
                type: "integer"
              },
              {
                name: "nodeName",
                description: "`Node`'s nodeName.",
                type: "string"
              },
              {
                name: "nodeValue",
                description: "`Node`'s nodeValue.",
                type: "string"
              },
              {
                name: "textValue",
                description: "Only set for textarea elements, contains the text value.",
                optional: true,
                type: "string"
              },
              {
                name: "inputValue",
                description: "Only set for input elements, contains the input's associated text value.",
                optional: true,
                type: "string"
              },
              {
                name: "inputChecked",
                description: "Only set for radio and checkbox input elements, indicates if the element has been checked",
                optional: true,
                type: "boolean"
              },
              {
                name: "optionSelected",
                description: "Only set for option elements, indicates if the element has been selected",
                optional: true,
                type: "boolean"
              },
              {
                name: "backendNodeId",
                description: "`Node`'s id, corresponds to DOM.Node.backendNodeId.",
                $ref: "DOM.BackendNodeId"
              },
              {
                name: "childNodeIndexes",
                description: "The indexes of the node's child nodes in the `domNodes` array returned by `getSnapshot`, if\nany.",
                optional: true,
                type: "array",
                items: {
                  type: "integer"
                }
              },
              {
                name: "attributes",
                description: "Attributes of an `Element` node.",
                optional: true,
                type: "array",
                items: {
                  $ref: "NameValue"
                }
              },
              {
                name: "pseudoElementIndexes",
                description: "Indexes of pseudo elements associated with this node in the `domNodes` array returned by\n`getSnapshot`, if any.",
                optional: true,
                type: "array",
                items: {
                  type: "integer"
                }
              },
              {
                name: "layoutNodeIndex",
                description: "The index of the node's related layout tree node in the `layoutTreeNodes` array returned by\n`getSnapshot`, if any.",
                optional: true,
                type: "integer"
              },
              {
                name: "documentURL",
                description: "Document URL that `Document` or `FrameOwner` node points to.",
                optional: true,
                type: "string"
              },
              {
                name: "baseURL",
                description: "Base URL that `Document` or `FrameOwner` node uses for URL completion.",
                optional: true,
                type: "string"
              },
              {
                name: "contentLanguage",
                description: "Only set for documents, contains the document's content language.",
                optional: true,
                type: "string"
              },
              {
                name: "documentEncoding",
                description: "Only set for documents, contains the document's character set encoding.",
                optional: true,
                type: "string"
              },
              {
                name: "publicId",
                description: "`DocumentType` node's publicId.",
                optional: true,
                type: "string"
              },
              {
                name: "systemId",
                description: "`DocumentType` node's systemId.",
                optional: true,
                type: "string"
              },
              {
                name: "frameId",
                description: "Frame ID for frame owner elements and also for the document node.",
                optional: true,
                $ref: "Page.FrameId"
              },
              {
                name: "contentDocumentIndex",
                description: "The index of a frame owner element's content document in the `domNodes` array returned by\n`getSnapshot`, if any.",
                optional: true,
                type: "integer"
              },
              {
                name: "pseudoType",
                description: "Type of a pseudo element node.",
                optional: true,
                $ref: "DOM.PseudoType"
              },
              {
                name: "shadowRootType",
                description: "Shadow root type.",
                optional: true,
                $ref: "DOM.ShadowRootType"
              },
              {
                name: "isClickable",
                description: "Whether this DOM node responds to mouse clicks. This includes nodes that have had click\nevent listeners attached via JavaScript as well as anchor tags that naturally navigate when\nclicked.",
                optional: true,
                type: "boolean"
              },
              {
                name: "eventListeners",
                description: "Details of the node's event listeners, if any.",
                optional: true,
                type: "array",
                items: {
                  $ref: "DOMDebugger.EventListener"
                }
              },
              {
                name: "currentSourceURL",
                description: "The selected url for nodes with a srcset attribute.",
                optional: true,
                type: "string"
              },
              {
                name: "originURL",
                description: "The url of the script (if any) that generates this node.",
                optional: true,
                type: "string"
              },
              {
                name: "scrollOffsetX",
                description: "Scroll offsets, set when this node is a Document.",
                optional: true,
                type: "number"
              },
              {
                name: "scrollOffsetY",
                optional: true,
                type: "number"
              }
            ]
          },
          {
            id: "InlineTextBox",
            description: "Details of post layout rendered text positions. The exact layout should not be regarded as\nstable and may change between versions.",
            type: "object",
            properties: [
              {
                name: "boundingBox",
                description: "The bounding box in document coordinates. Note that scroll offset of the document is ignored.",
                $ref: "DOM.Rect"
              },
              {
                name: "startCharacterIndex",
                description: "The starting index in characters, for this post layout textbox substring. Characters that\nwould be represented as a surrogate pair in UTF-16 have length 2.",
                type: "integer"
              },
              {
                name: "numCharacters",
                description: "The number of characters in this post layout textbox substring. Characters that would be\nrepresented as a surrogate pair in UTF-16 have length 2.",
                type: "integer"
              }
            ]
          },
          {
            id: "LayoutTreeNode",
            description: "Details of an element in the DOM tree with a LayoutObject.",
            type: "object",
            properties: [
              {
                name: "domNodeIndex",
                description: "The index of the related DOM node in the `domNodes` array returned by `getSnapshot`.",
                type: "integer"
              },
              {
                name: "boundingBox",
                description: "The bounding box in document coordinates. Note that scroll offset of the document is ignored.",
                $ref: "DOM.Rect"
              },
              {
                name: "layoutText",
                description: "Contents of the LayoutText, if any.",
                optional: true,
                type: "string"
              },
              {
                name: "inlineTextNodes",
                description: "The post-layout inline text nodes, if any.",
                optional: true,
                type: "array",
                items: {
                  $ref: "InlineTextBox"
                }
              },
              {
                name: "styleIndex",
                description: "Index into the `computedStyles` array returned by `getSnapshot`.",
                optional: true,
                type: "integer"
              },
              {
                name: "paintOrder",
                description: "Global paint order index, which is determined by the stacking order of the nodes. Nodes\nthat are painted together will have the same index. Only provided if includePaintOrder in\ngetSnapshot was true.",
                optional: true,
                type: "integer"
              },
              {
                name: "isStackingContext",
                description: "Set to true to indicate the element begins a new stacking context.",
                optional: true,
                type: "boolean"
              }
            ]
          },
          {
            id: "ComputedStyle",
            description: "A subset of the full ComputedStyle as defined by the request whitelist.",
            type: "object",
            properties: [
              {
                name: "properties",
                description: "Name/value pairs of computed style properties.",
                type: "array",
                items: {
                  $ref: "NameValue"
                }
              }
            ]
          },
          {
            id: "NameValue",
            description: "A name/value pair.",
            type: "object",
            properties: [
              {
                name: "name",
                description: "Attribute/property name.",
                type: "string"
              },
              {
                name: "value",
                description: "Attribute/property value.",
                type: "string"
              }
            ]
          },
          {
            id: "StringIndex",
            description: "Index of the string in the strings table.",
            type: "integer"
          },
          {
            id: "ArrayOfStrings",
            description: "Index of the string in the strings table.",
            type: "array",
            items: {
              $ref: "StringIndex"
            }
          },
          {
            id: "RareStringData",
            description: "Data that is only present on rare nodes.",
            type: "object",
            properties: [
              {
                name: "index",
                type: "array",
                items: {
                  type: "integer"
                }
              },
              {
                name: "value",
                type: "array",
                items: {
                  $ref: "StringIndex"
                }
              }
            ]
          },
          {
            id: "RareBooleanData",
            type: "object",
            properties: [
              {
                name: "index",
                type: "array",
                items: {
                  type: "integer"
                }
              }
            ]
          },
          {
            id: "RareIntegerData",
            type: "object",
            properties: [
              {
                name: "index",
                type: "array",
                items: {
                  type: "integer"
                }
              },
              {
                name: "value",
                type: "array",
                items: {
                  type: "integer"
                }
              }
            ]
          },
          {
            id: "Rectangle",
            type: "array",
            items: {
              type: "number"
            }
          },
          {
            id: "DocumentSnapshot",
            description: "Document snapshot.",
            type: "object",
            properties: [
              {
                name: "documentURL",
                description: "Document URL that `Document` or `FrameOwner` node points to.",
                $ref: "StringIndex"
              },
              {
                name: "baseURL",
                description: "Base URL that `Document` or `FrameOwner` node uses for URL completion.",
                $ref: "StringIndex"
              },
              {
                name: "contentLanguage",
                description: "Contains the document's content language.",
                $ref: "StringIndex"
              },
              {
                name: "encodingName",
                description: "Contains the document's character set encoding.",
                $ref: "StringIndex"
              },
              {
                name: "publicId",
                description: "`DocumentType` node's publicId.",
                $ref: "StringIndex"
              },
              {
                name: "systemId",
                description: "`DocumentType` node's systemId.",
                $ref: "StringIndex"
              },
              {
                name: "frameId",
                description: "Frame ID for frame owner elements and also for the document node.",
                $ref: "StringIndex"
              },
              {
                name: "nodes",
                description: "A table with dom nodes.",
                $ref: "NodeTreeSnapshot"
              },
              {
                name: "layout",
                description: "The nodes in the layout tree.",
                $ref: "LayoutTreeSnapshot"
              },
              {
                name: "textBoxes",
                description: "The post-layout inline text nodes.",
                $ref: "TextBoxSnapshot"
              },
              {
                name: "scrollOffsetX",
                description: "Horizontal scroll offset.",
                optional: true,
                type: "number"
              },
              {
                name: "scrollOffsetY",
                description: "Vertical scroll offset.",
                optional: true,
                type: "number"
              }
            ]
          },
          {
            id: "NodeTreeSnapshot",
            description: "Table containing nodes.",
            type: "object",
            properties: [
              {
                name: "parentIndex",
                description: "Parent node index.",
                optional: true,
                type: "array",
                items: {
                  type: "integer"
                }
              },
              {
                name: "nodeType",
                description: "`Node`'s nodeType.",
                optional: true,
                type: "array",
                items: {
                  type: "integer"
                }
              },
              {
                name: "nodeName",
                description: "`Node`'s nodeName.",
                optional: true,
                type: "array",
                items: {
                  $ref: "StringIndex"
                }
              },
              {
                name: "nodeValue",
                description: "`Node`'s nodeValue.",
                optional: true,
                type: "array",
                items: {
                  $ref: "StringIndex"
                }
              },
              {
                name: "backendNodeId",
                description: "`Node`'s id, corresponds to DOM.Node.backendNodeId.",
                optional: true,
                type: "array",
                items: {
                  $ref: "DOM.BackendNodeId"
                }
              },
              {
                name: "attributes",
                description: "Attributes of an `Element` node. Flatten name, value pairs.",
                optional: true,
                type: "array",
                items: {
                  $ref: "ArrayOfStrings"
                }
              },
              {
                name: "textValue",
                description: "Only set for textarea elements, contains the text value.",
                optional: true,
                $ref: "RareStringData"
              },
              {
                name: "inputValue",
                description: "Only set for input elements, contains the input's associated text value.",
                optional: true,
                $ref: "RareStringData"
              },
              {
                name: "inputChecked",
                description: "Only set for radio and checkbox input elements, indicates if the element has been checked",
                optional: true,
                $ref: "RareBooleanData"
              },
              {
                name: "optionSelected",
                description: "Only set for option elements, indicates if the element has been selected",
                optional: true,
                $ref: "RareBooleanData"
              },
              {
                name: "contentDocumentIndex",
                description: "The index of the document in the list of the snapshot documents.",
                optional: true,
                $ref: "RareIntegerData"
              },
              {
                name: "pseudoType",
                description: "Type of a pseudo element node.",
                optional: true,
                $ref: "RareStringData"
              },
              {
                name: "isClickable",
                description: "Whether this DOM node responds to mouse clicks. This includes nodes that have had click\nevent listeners attached via JavaScript as well as anchor tags that naturally navigate when\nclicked.",
                optional: true,
                $ref: "RareBooleanData"
              },
              {
                name: "currentSourceURL",
                description: "The selected url for nodes with a srcset attribute.",
                optional: true,
                $ref: "RareStringData"
              },
              {
                name: "originURL",
                description: "The url of the script (if any) that generates this node.",
                optional: true,
                $ref: "RareStringData"
              }
            ]
          },
          {
            id: "LayoutTreeSnapshot",
            description: "Table of details of an element in the DOM tree with a LayoutObject.",
            type: "object",
            properties: [
              {
                name: "nodeIndex",
                description: "Index of the corresponding node in the `NodeTreeSnapshot` array returned by `captureSnapshot`.",
                type: "array",
                items: {
                  type: "integer"
                }
              },
              {
                name: "styles",
                description: "Array of indexes specifying computed style strings, filtered according to the `computedStyles` parameter passed to `captureSnapshot`.",
                type: "array",
                items: {
                  $ref: "ArrayOfStrings"
                }
              },
              {
                name: "bounds",
                description: "The absolute position bounding box.",
                type: "array",
                items: {
                  $ref: "Rectangle"
                }
              },
              {
                name: "text",
                description: "Contents of the LayoutText, if any.",
                type: "array",
                items: {
                  $ref: "StringIndex"
                }
              },
              {
                name: "stackingContexts",
                description: "Stacking context information.",
                $ref: "RareBooleanData"
              },
              {
                name: "offsetRects",
                description: "The offset rect of nodes. Only available when includeDOMRects is set to true",
                optional: true,
                type: "array",
                items: {
                  $ref: "Rectangle"
                }
              },
              {
                name: "scrollRects",
                description: "The scroll rect of nodes. Only available when includeDOMRects is set to true",
                optional: true,
                type: "array",
                items: {
                  $ref: "Rectangle"
                }
              },
              {
                name: "clientRects",
                description: "The client rect of nodes. Only available when includeDOMRects is set to true",
                optional: true,
                type: "array",
                items: {
                  $ref: "Rectangle"
                }
              }
            ]
          },
          {
            id: "TextBoxSnapshot",
            description: "Table of details of the post layout rendered text positions. The exact layout should not be regarded as\nstable and may change between versions.",
            type: "object",
            properties: [
              {
                name: "layoutIndex",
                description: "Index of the layout tree node that owns this box collection.",
                type: "array",
                items: {
                  type: "integer"
                }
              },
              {
                name: "bounds",
                description: "The absolute position bounding box.",
                type: "array",
                items: {
                  $ref: "Rectangle"
                }
              },
              {
                name: "start",
                description: "The starting index in characters, for this post layout textbox substring. Characters that\nwould be represented as a surrogate pair in UTF-16 have length 2.",
                type: "array",
                items: {
                  type: "integer"
                }
              },
              {
                name: "length",
                description: "The number of characters in this post layout textbox substring. Characters that would be\nrepresented as a surrogate pair in UTF-16 have length 2.",
                type: "array",
                items: {
                  type: "integer"
                }
              }
            ]
          }
        ],
        commands: [
          {
            name: "disable",
            description: "Disables DOM snapshot agent for the given page."
          },
          {
            name: "enable",
            description: "Enables DOM snapshot agent for the given page."
          },
          {
            name: "getSnapshot",
            description: "Returns a document snapshot, including the full DOM tree of the root node (including iframes,\ntemplate contents, and imported documents) in a flattened array, as well as layout and\nwhite-listed computed style information for the nodes. Shadow DOM in the returned DOM tree is\nflattened.",
            deprecated: true,
            parameters: [
              {
                name: "computedStyleWhitelist",
                description: "Whitelist of computed styles to return.",
                type: "array",
                items: {
                  type: "string"
                }
              },
              {
                name: "includeEventListeners",
                description: "Whether or not to retrieve details of DOM listeners (default false).",
                optional: true,
                type: "boolean"
              },
              {
                name: "includePaintOrder",
                description: "Whether to determine and include the paint order index of LayoutTreeNodes (default false).",
                optional: true,
                type: "boolean"
              },
              {
                name: "includeUserAgentShadowTree",
                description: "Whether to include UA shadow tree in the snapshot (default false).",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "domNodes",
                description: "The nodes in the DOM tree. The DOMNode at index 0 corresponds to the root document.",
                type: "array",
                items: {
                  $ref: "DOMNode"
                }
              },
              {
                name: "layoutTreeNodes",
                description: "The nodes in the layout tree.",
                type: "array",
                items: {
                  $ref: "LayoutTreeNode"
                }
              },
              {
                name: "computedStyles",
                description: "Whitelisted ComputedStyle properties for each node in the layout tree.",
                type: "array",
                items: {
                  $ref: "ComputedStyle"
                }
              }
            ]
          },
          {
            name: "captureSnapshot",
            description: "Returns a document snapshot, including the full DOM tree of the root node (including iframes,\ntemplate contents, and imported documents) in a flattened array, as well as layout and\nwhite-listed computed style information for the nodes. Shadow DOM in the returned DOM tree is\nflattened.",
            parameters: [
              {
                name: "computedStyles",
                description: "Whitelist of computed styles to return.",
                type: "array",
                items: {
                  type: "string"
                }
              },
              {
                name: "includeDOMRects",
                description: "Whether to include DOM rectangles (offsetRects, clientRects, scrollRects) into the snapshot",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "documents",
                description: "The nodes in the DOM tree. The DOMNode at index 0 corresponds to the root document.",
                type: "array",
                items: {
                  $ref: "DocumentSnapshot"
                }
              },
              {
                name: "strings",
                description: "Shared string table that all string properties refer to with indexes.",
                type: "array",
                items: {
                  type: "string"
                }
              }
            ]
          }
        ]
      },
      {
        domain: "DOMStorage",
        description: "Query and modify DOM storage.",
        experimental: true,
        types: [
          {
            id: "StorageId",
            description: "DOM Storage identifier.",
            type: "object",
            properties: [
              {
                name: "securityOrigin",
                description: "Security origin for the storage.",
                type: "string"
              },
              {
                name: "isLocalStorage",
                description: "Whether the storage is local storage (not session storage).",
                type: "boolean"
              }
            ]
          },
          {
            id: "Item",
            description: "DOM Storage item.",
            type: "array",
            items: {
              type: "string"
            }
          }
        ],
        commands: [
          {
            name: "clear",
            parameters: [
              {
                name: "storageId",
                $ref: "StorageId"
              }
            ]
          },
          {
            name: "disable",
            description: "Disables storage tracking, prevents storage events from being sent to the client."
          },
          {
            name: "enable",
            description: "Enables storage tracking, storage events will now be delivered to the client."
          },
          {
            name: "getDOMStorageItems",
            parameters: [
              {
                name: "storageId",
                $ref: "StorageId"
              }
            ],
            returns: [
              {
                name: "entries",
                type: "array",
                items: {
                  $ref: "Item"
                }
              }
            ]
          },
          {
            name: "removeDOMStorageItem",
            parameters: [
              {
                name: "storageId",
                $ref: "StorageId"
              },
              {
                name: "key",
                type: "string"
              }
            ]
          },
          {
            name: "setDOMStorageItem",
            parameters: [
              {
                name: "storageId",
                $ref: "StorageId"
              },
              {
                name: "key",
                type: "string"
              },
              {
                name: "value",
                type: "string"
              }
            ]
          }
        ],
        events: [
          {
            name: "domStorageItemAdded",
            parameters: [
              {
                name: "storageId",
                $ref: "StorageId"
              },
              {
                name: "key",
                type: "string"
              },
              {
                name: "newValue",
                type: "string"
              }
            ]
          },
          {
            name: "domStorageItemRemoved",
            parameters: [
              {
                name: "storageId",
                $ref: "StorageId"
              },
              {
                name: "key",
                type: "string"
              }
            ]
          },
          {
            name: "domStorageItemUpdated",
            parameters: [
              {
                name: "storageId",
                $ref: "StorageId"
              },
              {
                name: "key",
                type: "string"
              },
              {
                name: "oldValue",
                type: "string"
              },
              {
                name: "newValue",
                type: "string"
              }
            ]
          },
          {
            name: "domStorageItemsCleared",
            parameters: [
              {
                name: "storageId",
                $ref: "StorageId"
              }
            ]
          }
        ]
      },
      {
        domain: "Database",
        experimental: true,
        types: [
          {
            id: "DatabaseId",
            description: "Unique identifier of Database object.",
            type: "string"
          },
          {
            id: "Database",
            description: "Database object.",
            type: "object",
            properties: [
              {
                name: "id",
                description: "Database ID.",
                $ref: "DatabaseId"
              },
              {
                name: "domain",
                description: "Database domain.",
                type: "string"
              },
              {
                name: "name",
                description: "Database name.",
                type: "string"
              },
              {
                name: "version",
                description: "Database version.",
                type: "string"
              }
            ]
          },
          {
            id: "Error",
            description: "Database error.",
            type: "object",
            properties: [
              {
                name: "message",
                description: "Error message.",
                type: "string"
              },
              {
                name: "code",
                description: "Error code.",
                type: "integer"
              }
            ]
          }
        ],
        commands: [
          {
            name: "disable",
            description: "Disables database tracking, prevents database events from being sent to the client."
          },
          {
            name: "enable",
            description: "Enables database tracking, database events will now be delivered to the client."
          },
          {
            name: "executeSQL",
            parameters: [
              {
                name: "databaseId",
                $ref: "DatabaseId"
              },
              {
                name: "query",
                type: "string"
              }
            ],
            returns: [
              {
                name: "columnNames",
                optional: true,
                type: "array",
                items: {
                  type: "string"
                }
              },
              {
                name: "values",
                optional: true,
                type: "array",
                items: {
                  type: "any"
                }
              },
              {
                name: "sqlError",
                optional: true,
                $ref: "Error"
              }
            ]
          },
          {
            name: "getDatabaseTableNames",
            parameters: [
              {
                name: "databaseId",
                $ref: "DatabaseId"
              }
            ],
            returns: [
              {
                name: "tableNames",
                type: "array",
                items: {
                  type: "string"
                }
              }
            ]
          }
        ],
        events: [
          {
            name: "addDatabase",
            parameters: [
              {
                name: "database",
                $ref: "Database"
              }
            ]
          }
        ]
      },
      {
        domain: "DeviceOrientation",
        experimental: true,
        commands: [
          {
            name: "clearDeviceOrientationOverride",
            description: "Clears the overridden Device Orientation."
          },
          {
            name: "setDeviceOrientationOverride",
            description: "Overrides the Device Orientation.",
            parameters: [
              {
                name: "alpha",
                description: "Mock alpha",
                type: "number"
              },
              {
                name: "beta",
                description: "Mock beta",
                type: "number"
              },
              {
                name: "gamma",
                description: "Mock gamma",
                type: "number"
              }
            ]
          }
        ]
      },
      {
        domain: "Emulation",
        description: "This domain emulates different environments for the page.",
        dependencies: [
          "DOM",
          "Page",
          "Runtime"
        ],
        types: [
          {
            id: "ScreenOrientation",
            description: "Screen orientation.",
            type: "object",
            properties: [
              {
                name: "type",
                description: "Orientation type.",
                type: "string",
                enum: [
                  "portraitPrimary",
                  "portraitSecondary",
                  "landscapePrimary",
                  "landscapeSecondary"
                ]
              },
              {
                name: "angle",
                description: "Orientation angle.",
                type: "integer"
              }
            ]
          },
          {
            id: "VirtualTimePolicy",
            description: "advance: If the scheduler runs out of immediate work, the virtual time base may fast forward to\nallow the next delayed task (if any) to run; pause: The virtual time base may not advance;\npauseIfNetworkFetchesPending: The virtual time base may not advance if there are any pending\nresource fetches.",
            experimental: true,
            type: "string",
            enum: [
              "advance",
              "pause",
              "pauseIfNetworkFetchesPending"
            ]
          }
        ],
        commands: [
          {
            name: "canEmulate",
            description: "Tells whether emulation is supported.",
            returns: [
              {
                name: "result",
                description: "True if emulation is supported.",
                type: "boolean"
              }
            ]
          },
          {
            name: "clearDeviceMetricsOverride",
            description: "Clears the overriden device metrics."
          },
          {
            name: "clearGeolocationOverride",
            description: "Clears the overriden Geolocation Position and Error."
          },
          {
            name: "resetPageScaleFactor",
            description: "Requests that page scale factor is reset to initial values.",
            experimental: true
          },
          {
            name: "setFocusEmulationEnabled",
            description: "Enables or disables simulating a focused and active page.",
            experimental: true,
            parameters: [
              {
                name: "enabled",
                description: "Whether to enable to disable focus emulation.",
                type: "boolean"
              }
            ]
          },
          {
            name: "setCPUThrottlingRate",
            description: "Enables CPU throttling to emulate slow CPUs.",
            experimental: true,
            parameters: [
              {
                name: "rate",
                description: "Throttling rate as a slowdown factor (1 is no throttle, 2 is 2x slowdown, etc).",
                type: "number"
              }
            ]
          },
          {
            name: "setDefaultBackgroundColorOverride",
            description: "Sets or clears an override of the default background color of the frame. This override is used\nif the content does not specify one.",
            parameters: [
              {
                name: "color",
                description: "RGBA of the default background color. If not specified, any existing override will be\ncleared.",
                optional: true,
                $ref: "DOM.RGBA"
              }
            ]
          },
          {
            name: "setDeviceMetricsOverride",
            description: 'Overrides the values of device screen dimensions (window.screen.width, window.screen.height,\nwindow.innerWidth, window.innerHeight, and "device-width"/"device-height"-related CSS media\nquery results).',
            parameters: [
              {
                name: "width",
                description: "Overriding width value in pixels (minimum 0, maximum 10000000). 0 disables the override.",
                type: "integer"
              },
              {
                name: "height",
                description: "Overriding height value in pixels (minimum 0, maximum 10000000). 0 disables the override.",
                type: "integer"
              },
              {
                name: "deviceScaleFactor",
                description: "Overriding device scale factor value. 0 disables the override.",
                type: "number"
              },
              {
                name: "mobile",
                description: "Whether to emulate mobile device. This includes viewport meta tag, overlay scrollbars, text\nautosizing and more.",
                type: "boolean"
              },
              {
                name: "scale",
                description: "Scale to apply to resulting view image.",
                experimental: true,
                optional: true,
                type: "number"
              },
              {
                name: "screenWidth",
                description: "Overriding screen width value in pixels (minimum 0, maximum 10000000).",
                experimental: true,
                optional: true,
                type: "integer"
              },
              {
                name: "screenHeight",
                description: "Overriding screen height value in pixels (minimum 0, maximum 10000000).",
                experimental: true,
                optional: true,
                type: "integer"
              },
              {
                name: "positionX",
                description: "Overriding view X position on screen in pixels (minimum 0, maximum 10000000).",
                experimental: true,
                optional: true,
                type: "integer"
              },
              {
                name: "positionY",
                description: "Overriding view Y position on screen in pixels (minimum 0, maximum 10000000).",
                experimental: true,
                optional: true,
                type: "integer"
              },
              {
                name: "dontSetVisibleSize",
                description: "Do not set visible view size, rely upon explicit setVisibleSize call.",
                experimental: true,
                optional: true,
                type: "boolean"
              },
              {
                name: "screenOrientation",
                description: "Screen orientation override.",
                optional: true,
                $ref: "ScreenOrientation"
              },
              {
                name: "viewport",
                description: "If set, the visible area of the page will be overridden to this viewport. This viewport\nchange is not observed by the page, e.g. viewport-relative elements do not change positions.",
                experimental: true,
                optional: true,
                $ref: "Page.Viewport"
              }
            ]
          },
          {
            name: "setScrollbarsHidden",
            experimental: true,
            parameters: [
              {
                name: "hidden",
                description: "Whether scrollbars should be always hidden.",
                type: "boolean"
              }
            ]
          },
          {
            name: "setDocumentCookieDisabled",
            experimental: true,
            parameters: [
              {
                name: "disabled",
                description: "Whether document.coookie API should be disabled.",
                type: "boolean"
              }
            ]
          },
          {
            name: "setEmitTouchEventsForMouse",
            experimental: true,
            parameters: [
              {
                name: "enabled",
                description: "Whether touch emulation based on mouse input should be enabled.",
                type: "boolean"
              },
              {
                name: "configuration",
                description: "Touch/gesture events configuration. Default: current platform.",
                optional: true,
                type: "string",
                enum: [
                  "mobile",
                  "desktop"
                ]
              }
            ]
          },
          {
            name: "setEmulatedMedia",
            description: "Emulates the given media for CSS media queries.",
            parameters: [
              {
                name: "media",
                description: "Media type to emulate. Empty string disables the override.",
                type: "string"
              }
            ]
          },
          {
            name: "setGeolocationOverride",
            description: "Overrides the Geolocation Position or Error. Omitting any of the parameters emulates position\nunavailable.",
            parameters: [
              {
                name: "latitude",
                description: "Mock latitude",
                optional: true,
                type: "number"
              },
              {
                name: "longitude",
                description: "Mock longitude",
                optional: true,
                type: "number"
              },
              {
                name: "accuracy",
                description: "Mock accuracy",
                optional: true,
                type: "number"
              }
            ]
          },
          {
            name: "setNavigatorOverrides",
            description: "Overrides value returned by the javascript navigator object.",
            experimental: true,
            deprecated: true,
            parameters: [
              {
                name: "platform",
                description: "The platform navigator.platform should return.",
                type: "string"
              }
            ]
          },
          {
            name: "setPageScaleFactor",
            description: "Sets a specified page scale factor.",
            experimental: true,
            parameters: [
              {
                name: "pageScaleFactor",
                description: "Page scale factor.",
                type: "number"
              }
            ]
          },
          {
            name: "setScriptExecutionDisabled",
            description: "Switches script execution in the page.",
            parameters: [
              {
                name: "value",
                description: "Whether script execution should be disabled in the page.",
                type: "boolean"
              }
            ]
          },
          {
            name: "setTouchEmulationEnabled",
            description: "Enables touch on platforms which do not support them.",
            parameters: [
              {
                name: "enabled",
                description: "Whether the touch event emulation should be enabled.",
                type: "boolean"
              },
              {
                name: "maxTouchPoints",
                description: "Maximum touch points supported. Defaults to one.",
                optional: true,
                type: "integer"
              }
            ]
          },
          {
            name: "setVirtualTimePolicy",
            description: "Turns on virtual time for all frames (replacing real-time with a synthetic time source) and sets\nthe current virtual time policy.  Note this supersedes any previous time budget.",
            experimental: true,
            parameters: [
              {
                name: "policy",
                $ref: "VirtualTimePolicy"
              },
              {
                name: "budget",
                description: "If set, after this many virtual milliseconds have elapsed virtual time will be paused and a\nvirtualTimeBudgetExpired event is sent.",
                optional: true,
                type: "number"
              },
              {
                name: "maxVirtualTimeTaskStarvationCount",
                description: "If set this specifies the maximum number of tasks that can be run before virtual is forced\nforwards to prevent deadlock.",
                optional: true,
                type: "integer"
              },
              {
                name: "waitForNavigation",
                description: "If set the virtual time policy change should be deferred until any frame starts navigating.\nNote any previous deferred policy change is superseded.",
                optional: true,
                type: "boolean"
              },
              {
                name: "initialVirtualTime",
                description: "If set, base::Time::Now will be overriden to initially return this value.",
                optional: true,
                $ref: "Network.TimeSinceEpoch"
              }
            ],
            returns: [
              {
                name: "virtualTimeTicksBase",
                description: "Absolute timestamp at which virtual time was first enabled (up time in milliseconds).",
                type: "number"
              }
            ]
          },
          {
            name: "setTimezoneOverride",
            description: "Overrides default host system timezone with the specified one.",
            experimental: true,
            parameters: [
              {
                name: "timezoneId",
                description: "The timezone identifier. If empty, disables the override and\nrestores default host system timezone.",
                type: "string"
              }
            ]
          },
          {
            name: "setVisibleSize",
            description: "Resizes the frame/viewport of the page. Note that this does not affect the frame's container\n(e.g. browser window). Can be used to produce screenshots of the specified size. Not supported\non Android.",
            experimental: true,
            deprecated: true,
            parameters: [
              {
                name: "width",
                description: "Frame width (DIP).",
                type: "integer"
              },
              {
                name: "height",
                description: "Frame height (DIP).",
                type: "integer"
              }
            ]
          },
          {
            name: "setUserAgentOverride",
            description: "Allows overriding user agent with the given string.",
            parameters: [
              {
                name: "userAgent",
                description: "User agent to use.",
                type: "string"
              },
              {
                name: "acceptLanguage",
                description: "Browser langugage to emulate.",
                optional: true,
                type: "string"
              },
              {
                name: "platform",
                description: "The platform navigator.platform should return.",
                optional: true,
                type: "string"
              }
            ]
          }
        ],
        events: [
          {
            name: "virtualTimeBudgetExpired",
            description: "Notification sent after the virtual time budget for the current VirtualTimePolicy has run out.",
            experimental: true
          }
        ]
      },
      {
        domain: "HeadlessExperimental",
        description: "This domain provides experimental commands only supported in headless mode.",
        experimental: true,
        dependencies: [
          "Page",
          "Runtime"
        ],
        types: [
          {
            id: "ScreenshotParams",
            description: "Encoding options for a screenshot.",
            type: "object",
            properties: [
              {
                name: "format",
                description: "Image compression format (defaults to png).",
                optional: true,
                type: "string",
                enum: [
                  "jpeg",
                  "png"
                ]
              },
              {
                name: "quality",
                description: "Compression quality from range [0..100] (jpeg only).",
                optional: true,
                type: "integer"
              }
            ]
          }
        ],
        commands: [
          {
            name: "beginFrame",
            description: "Sends a BeginFrame to the target and returns when the frame was completed. Optionally captures a\nscreenshot from the resulting frame. Requires that the target was created with enabled\nBeginFrameControl. Designed for use with --run-all-compositor-stages-before-draw, see also\nhttps://goo.gl/3zHXhB for more background.",
            parameters: [
              {
                name: "frameTimeTicks",
                description: "Timestamp of this BeginFrame in Renderer TimeTicks (milliseconds of uptime). If not set,\nthe current time will be used.",
                optional: true,
                type: "number"
              },
              {
                name: "interval",
                description: "The interval between BeginFrames that is reported to the compositor, in milliseconds.\nDefaults to a 60 frames/second interval, i.e. about 16.666 milliseconds.",
                optional: true,
                type: "number"
              },
              {
                name: "noDisplayUpdates",
                description: "Whether updates should not be committed and drawn onto the display. False by default. If\ntrue, only side effects of the BeginFrame will be run, such as layout and animations, but\nany visual updates may not be visible on the display or in screenshots.",
                optional: true,
                type: "boolean"
              },
              {
                name: "screenshot",
                description: "If set, a screenshot of the frame will be captured and returned in the response. Otherwise,\nno screenshot will be captured. Note that capturing a screenshot can fail, for example,\nduring renderer initialization. In such a case, no screenshot data will be returned.",
                optional: true,
                $ref: "ScreenshotParams"
              }
            ],
            returns: [
              {
                name: "hasDamage",
                description: "Whether the BeginFrame resulted in damage and, thus, a new frame was committed to the\ndisplay. Reported for diagnostic uses, may be removed in the future.",
                type: "boolean"
              },
              {
                name: "screenshotData",
                description: "Base64-encoded image data of the screenshot, if one was requested and successfully taken.",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "disable",
            description: "Disables headless events for the target."
          },
          {
            name: "enable",
            description: "Enables headless events for the target."
          }
        ],
        events: [
          {
            name: "needsBeginFramesChanged",
            description: "Issued when the target starts or stops needing BeginFrames.",
            parameters: [
              {
                name: "needsBeginFrames",
                description: "True if BeginFrames are needed, false otherwise.",
                type: "boolean"
              }
            ]
          }
        ]
      },
      {
        domain: "IO",
        description: "Input/Output operations for streams produced by DevTools.",
        types: [
          {
            id: "StreamHandle",
            description: "This is either obtained from another method or specifed as `blob:&lt;uuid&gt;` where\n`&lt;uuid&gt` is an UUID of a Blob.",
            type: "string"
          }
        ],
        commands: [
          {
            name: "close",
            description: "Close the stream, discard any temporary backing storage.",
            parameters: [
              {
                name: "handle",
                description: "Handle of the stream to close.",
                $ref: "StreamHandle"
              }
            ]
          },
          {
            name: "read",
            description: "Read a chunk of the stream",
            parameters: [
              {
                name: "handle",
                description: "Handle of the stream to read.",
                $ref: "StreamHandle"
              },
              {
                name: "offset",
                description: "Seek to the specified offset before reading (if not specificed, proceed with offset\nfollowing the last read). Some types of streams may only support sequential reads.",
                optional: true,
                type: "integer"
              },
              {
                name: "size",
                description: "Maximum number of bytes to read (left upon the agent discretion if not specified).",
                optional: true,
                type: "integer"
              }
            ],
            returns: [
              {
                name: "base64Encoded",
                description: "Set if the data is base64-encoded",
                optional: true,
                type: "boolean"
              },
              {
                name: "data",
                description: "Data that were read.",
                type: "string"
              },
              {
                name: "eof",
                description: "Set if the end-of-file condition occured while reading.",
                type: "boolean"
              }
            ]
          },
          {
            name: "resolveBlob",
            description: "Return UUID of Blob object specified by a remote object id.",
            parameters: [
              {
                name: "objectId",
                description: "Object id of a Blob object wrapper.",
                $ref: "Runtime.RemoteObjectId"
              }
            ],
            returns: [
              {
                name: "uuid",
                description: "UUID of the specified Blob.",
                type: "string"
              }
            ]
          }
        ]
      },
      {
        domain: "IndexedDB",
        experimental: true,
        dependencies: [
          "Runtime"
        ],
        types: [
          {
            id: "DatabaseWithObjectStores",
            description: "Database with an array of object stores.",
            type: "object",
            properties: [
              {
                name: "name",
                description: "Database name.",
                type: "string"
              },
              {
                name: "version",
                description: "Database version (type is not 'integer', as the standard\nrequires the version number to be 'unsigned long long')",
                type: "number"
              },
              {
                name: "objectStores",
                description: "Object stores in this database.",
                type: "array",
                items: {
                  $ref: "ObjectStore"
                }
              }
            ]
          },
          {
            id: "ObjectStore",
            description: "Object store.",
            type: "object",
            properties: [
              {
                name: "name",
                description: "Object store name.",
                type: "string"
              },
              {
                name: "keyPath",
                description: "Object store key path.",
                $ref: "KeyPath"
              },
              {
                name: "autoIncrement",
                description: "If true, object store has auto increment flag set.",
                type: "boolean"
              },
              {
                name: "indexes",
                description: "Indexes in this object store.",
                type: "array",
                items: {
                  $ref: "ObjectStoreIndex"
                }
              }
            ]
          },
          {
            id: "ObjectStoreIndex",
            description: "Object store index.",
            type: "object",
            properties: [
              {
                name: "name",
                description: "Index name.",
                type: "string"
              },
              {
                name: "keyPath",
                description: "Index key path.",
                $ref: "KeyPath"
              },
              {
                name: "unique",
                description: "If true, index is unique.",
                type: "boolean"
              },
              {
                name: "multiEntry",
                description: "If true, index allows multiple entries for a key.",
                type: "boolean"
              }
            ]
          },
          {
            id: "Key",
            description: "Key.",
            type: "object",
            properties: [
              {
                name: "type",
                description: "Key type.",
                type: "string",
                enum: [
                  "number",
                  "string",
                  "date",
                  "array"
                ]
              },
              {
                name: "number",
                description: "Number value.",
                optional: true,
                type: "number"
              },
              {
                name: "string",
                description: "String value.",
                optional: true,
                type: "string"
              },
              {
                name: "date",
                description: "Date value.",
                optional: true,
                type: "number"
              },
              {
                name: "array",
                description: "Array value.",
                optional: true,
                type: "array",
                items: {
                  $ref: "Key"
                }
              }
            ]
          },
          {
            id: "KeyRange",
            description: "Key range.",
            type: "object",
            properties: [
              {
                name: "lower",
                description: "Lower bound.",
                optional: true,
                $ref: "Key"
              },
              {
                name: "upper",
                description: "Upper bound.",
                optional: true,
                $ref: "Key"
              },
              {
                name: "lowerOpen",
                description: "If true lower bound is open.",
                type: "boolean"
              },
              {
                name: "upperOpen",
                description: "If true upper bound is open.",
                type: "boolean"
              }
            ]
          },
          {
            id: "DataEntry",
            description: "Data entry.",
            type: "object",
            properties: [
              {
                name: "key",
                description: "Key object.",
                $ref: "Runtime.RemoteObject"
              },
              {
                name: "primaryKey",
                description: "Primary key object.",
                $ref: "Runtime.RemoteObject"
              },
              {
                name: "value",
                description: "Value object.",
                $ref: "Runtime.RemoteObject"
              }
            ]
          },
          {
            id: "KeyPath",
            description: "Key path.",
            type: "object",
            properties: [
              {
                name: "type",
                description: "Key path type.",
                type: "string",
                enum: [
                  "null",
                  "string",
                  "array"
                ]
              },
              {
                name: "string",
                description: "String value.",
                optional: true,
                type: "string"
              },
              {
                name: "array",
                description: "Array value.",
                optional: true,
                type: "array",
                items: {
                  type: "string"
                }
              }
            ]
          }
        ],
        commands: [
          {
            name: "clearObjectStore",
            description: "Clears all entries from an object store.",
            parameters: [
              {
                name: "securityOrigin",
                description: "Security origin.",
                type: "string"
              },
              {
                name: "databaseName",
                description: "Database name.",
                type: "string"
              },
              {
                name: "objectStoreName",
                description: "Object store name.",
                type: "string"
              }
            ]
          },
          {
            name: "deleteDatabase",
            description: "Deletes a database.",
            parameters: [
              {
                name: "securityOrigin",
                description: "Security origin.",
                type: "string"
              },
              {
                name: "databaseName",
                description: "Database name.",
                type: "string"
              }
            ]
          },
          {
            name: "deleteObjectStoreEntries",
            description: "Delete a range of entries from an object store",
            parameters: [
              {
                name: "securityOrigin",
                type: "string"
              },
              {
                name: "databaseName",
                type: "string"
              },
              {
                name: "objectStoreName",
                type: "string"
              },
              {
                name: "keyRange",
                description: "Range of entry keys to delete",
                $ref: "KeyRange"
              }
            ]
          },
          {
            name: "disable",
            description: "Disables events from backend."
          },
          {
            name: "enable",
            description: "Enables events from backend."
          },
          {
            name: "requestData",
            description: "Requests data from object store or index.",
            parameters: [
              {
                name: "securityOrigin",
                description: "Security origin.",
                type: "string"
              },
              {
                name: "databaseName",
                description: "Database name.",
                type: "string"
              },
              {
                name: "objectStoreName",
                description: "Object store name.",
                type: "string"
              },
              {
                name: "indexName",
                description: "Index name, empty string for object store data requests.",
                type: "string"
              },
              {
                name: "skipCount",
                description: "Number of records to skip.",
                type: "integer"
              },
              {
                name: "pageSize",
                description: "Number of records to fetch.",
                type: "integer"
              },
              {
                name: "keyRange",
                description: "Key range.",
                optional: true,
                $ref: "KeyRange"
              }
            ],
            returns: [
              {
                name: "objectStoreDataEntries",
                description: "Array of object store data entries.",
                type: "array",
                items: {
                  $ref: "DataEntry"
                }
              },
              {
                name: "hasMore",
                description: "If true, there are more entries to fetch in the given range.",
                type: "boolean"
              }
            ]
          },
          {
            name: "getMetadata",
            description: "Gets metadata of an object store",
            parameters: [
              {
                name: "securityOrigin",
                description: "Security origin.",
                type: "string"
              },
              {
                name: "databaseName",
                description: "Database name.",
                type: "string"
              },
              {
                name: "objectStoreName",
                description: "Object store name.",
                type: "string"
              }
            ],
            returns: [
              {
                name: "entriesCount",
                description: "the entries count",
                type: "number"
              },
              {
                name: "keyGeneratorValue",
                description: "the current value of key generator, to become the next inserted\nkey into the object store. Valid if objectStore.autoIncrement\nis true.",
                type: "number"
              }
            ]
          },
          {
            name: "requestDatabase",
            description: "Requests database with given name in given frame.",
            parameters: [
              {
                name: "securityOrigin",
                description: "Security origin.",
                type: "string"
              },
              {
                name: "databaseName",
                description: "Database name.",
                type: "string"
              }
            ],
            returns: [
              {
                name: "databaseWithObjectStores",
                description: "Database with an array of object stores.",
                $ref: "DatabaseWithObjectStores"
              }
            ]
          },
          {
            name: "requestDatabaseNames",
            description: "Requests database names for given security origin.",
            parameters: [
              {
                name: "securityOrigin",
                description: "Security origin.",
                type: "string"
              }
            ],
            returns: [
              {
                name: "databaseNames",
                description: "Database names for origin.",
                type: "array",
                items: {
                  type: "string"
                }
              }
            ]
          }
        ]
      },
      {
        domain: "Input",
        types: [
          {
            id: "TouchPoint",
            type: "object",
            properties: [
              {
                name: "x",
                description: "X coordinate of the event relative to the main frame's viewport in CSS pixels.",
                type: "number"
              },
              {
                name: "y",
                description: "Y coordinate of the event relative to the main frame's viewport in CSS pixels. 0 refers to\nthe top of the viewport and Y increases as it proceeds towards the bottom of the viewport.",
                type: "number"
              },
              {
                name: "radiusX",
                description: "X radius of the touch area (default: 1.0).",
                optional: true,
                type: "number"
              },
              {
                name: "radiusY",
                description: "Y radius of the touch area (default: 1.0).",
                optional: true,
                type: "number"
              },
              {
                name: "rotationAngle",
                description: "Rotation angle (default: 0.0).",
                optional: true,
                type: "number"
              },
              {
                name: "force",
                description: "Force (default: 1.0).",
                optional: true,
                type: "number"
              },
              {
                name: "id",
                description: "Identifier used to track touch sources between events, must be unique within an event.",
                optional: true,
                type: "number"
              }
            ]
          },
          {
            id: "GestureSourceType",
            experimental: true,
            type: "string",
            enum: [
              "default",
              "touch",
              "mouse"
            ]
          },
          {
            id: "TimeSinceEpoch",
            description: "UTC time in seconds, counted from January 1, 1970.",
            type: "number"
          }
        ],
        commands: [
          {
            name: "dispatchKeyEvent",
            description: "Dispatches a key event to the page.",
            parameters: [
              {
                name: "type",
                description: "Type of the key event.",
                type: "string",
                enum: [
                  "keyDown",
                  "keyUp",
                  "rawKeyDown",
                  "char"
                ]
              },
              {
                name: "modifiers",
                description: "Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8\n(default: 0).",
                optional: true,
                type: "integer"
              },
              {
                name: "timestamp",
                description: "Time at which the event occurred.",
                optional: true,
                $ref: "TimeSinceEpoch"
              },
              {
                name: "text",
                description: 'Text as generated by processing a virtual key code with a keyboard layout. Not needed for\nfor `keyUp` and `rawKeyDown` events (default: "")',
                optional: true,
                type: "string"
              },
              {
                name: "unmodifiedText",
                description: 'Text that would have been generated by the keyboard if no modifiers were pressed (except for\nshift). Useful for shortcut (accelerator) key handling (default: "").',
                optional: true,
                type: "string"
              },
              {
                name: "keyIdentifier",
                description: `Unique key identifier (e.g., 'U+0041') (default: "").`,
                optional: true,
                type: "string"
              },
              {
                name: "code",
                description: `Unique DOM defined string value for each physical key (e.g., 'KeyA') (default: "").`,
                optional: true,
                type: "string"
              },
              {
                name: "key",
                description: `Unique DOM defined string value describing the meaning of the key in the context of active
modifiers, keyboard layout, etc (e.g., 'AltGr') (default: "").`,
                optional: true,
                type: "string"
              },
              {
                name: "windowsVirtualKeyCode",
                description: "Windows virtual key code (default: 0).",
                optional: true,
                type: "integer"
              },
              {
                name: "nativeVirtualKeyCode",
                description: "Native virtual key code (default: 0).",
                optional: true,
                type: "integer"
              },
              {
                name: "autoRepeat",
                description: "Whether the event was generated from auto repeat (default: false).",
                optional: true,
                type: "boolean"
              },
              {
                name: "isKeypad",
                description: "Whether the event was generated from the keypad (default: false).",
                optional: true,
                type: "boolean"
              },
              {
                name: "isSystemKey",
                description: "Whether the event was a system key event (default: false).",
                optional: true,
                type: "boolean"
              },
              {
                name: "location",
                description: "Whether the event was from the left or right side of the keyboard. 1=Left, 2=Right (default:\n0).",
                optional: true,
                type: "integer"
              }
            ]
          },
          {
            name: "insertText",
            description: "This method emulates inserting text that doesn't come from a key press,\nfor example an emoji keyboard or an IME.",
            experimental: true,
            parameters: [
              {
                name: "text",
                description: "The text to insert.",
                type: "string"
              }
            ]
          },
          {
            name: "dispatchMouseEvent",
            description: "Dispatches a mouse event to the page.",
            parameters: [
              {
                name: "type",
                description: "Type of the mouse event.",
                type: "string",
                enum: [
                  "mousePressed",
                  "mouseReleased",
                  "mouseMoved",
                  "mouseWheel"
                ]
              },
              {
                name: "x",
                description: "X coordinate of the event relative to the main frame's viewport in CSS pixels.",
                type: "number"
              },
              {
                name: "y",
                description: "Y coordinate of the event relative to the main frame's viewport in CSS pixels. 0 refers to\nthe top of the viewport and Y increases as it proceeds towards the bottom of the viewport.",
                type: "number"
              },
              {
                name: "modifiers",
                description: "Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8\n(default: 0).",
                optional: true,
                type: "integer"
              },
              {
                name: "timestamp",
                description: "Time at which the event occurred.",
                optional: true,
                $ref: "TimeSinceEpoch"
              },
              {
                name: "button",
                description: 'Mouse button (default: "none").',
                optional: true,
                type: "string",
                enum: [
                  "none",
                  "left",
                  "middle",
                  "right",
                  "back",
                  "forward"
                ]
              },
              {
                name: "buttons",
                description: "A number indicating which buttons are pressed on the mouse when a mouse event is triggered.\nLeft=1, Right=2, Middle=4, Back=8, Forward=16, None=0.",
                optional: true,
                type: "integer"
              },
              {
                name: "clickCount",
                description: "Number of times the mouse button was clicked (default: 0).",
                optional: true,
                type: "integer"
              },
              {
                name: "deltaX",
                description: "X delta in CSS pixels for mouse wheel event (default: 0).",
                optional: true,
                type: "number"
              },
              {
                name: "deltaY",
                description: "Y delta in CSS pixels for mouse wheel event (default: 0).",
                optional: true,
                type: "number"
              },
              {
                name: "pointerType",
                description: 'Pointer type (default: "mouse").',
                optional: true,
                type: "string",
                enum: [
                  "mouse",
                  "pen"
                ]
              }
            ]
          },
          {
            name: "dispatchTouchEvent",
            description: "Dispatches a touch event to the page.",
            parameters: [
              {
                name: "type",
                description: "Type of the touch event. TouchEnd and TouchCancel must not contain any touch points, while\nTouchStart and TouchMove must contains at least one.",
                type: "string",
                enum: [
                  "touchStart",
                  "touchEnd",
                  "touchMove",
                  "touchCancel"
                ]
              },
              {
                name: "touchPoints",
                description: "Active touch points on the touch device. One event per any changed point (compared to\nprevious touch event in a sequence) is generated, emulating pressing/moving/releasing points\none by one.",
                type: "array",
                items: {
                  $ref: "TouchPoint"
                }
              },
              {
                name: "modifiers",
                description: "Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8\n(default: 0).",
                optional: true,
                type: "integer"
              },
              {
                name: "timestamp",
                description: "Time at which the event occurred.",
                optional: true,
                $ref: "TimeSinceEpoch"
              }
            ]
          },
          {
            name: "emulateTouchFromMouseEvent",
            description: "Emulates touch event from the mouse event parameters.",
            experimental: true,
            parameters: [
              {
                name: "type",
                description: "Type of the mouse event.",
                type: "string",
                enum: [
                  "mousePressed",
                  "mouseReleased",
                  "mouseMoved",
                  "mouseWheel"
                ]
              },
              {
                name: "x",
                description: "X coordinate of the mouse pointer in DIP.",
                type: "integer"
              },
              {
                name: "y",
                description: "Y coordinate of the mouse pointer in DIP.",
                type: "integer"
              },
              {
                name: "button",
                description: "Mouse button.",
                type: "string",
                enum: [
                  "none",
                  "left",
                  "middle",
                  "right"
                ]
              },
              {
                name: "timestamp",
                description: "Time at which the event occurred (default: current time).",
                optional: true,
                $ref: "TimeSinceEpoch"
              },
              {
                name: "deltaX",
                description: "X delta in DIP for mouse wheel event (default: 0).",
                optional: true,
                type: "number"
              },
              {
                name: "deltaY",
                description: "Y delta in DIP for mouse wheel event (default: 0).",
                optional: true,
                type: "number"
              },
              {
                name: "modifiers",
                description: "Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8\n(default: 0).",
                optional: true,
                type: "integer"
              },
              {
                name: "clickCount",
                description: "Number of times the mouse button was clicked (default: 0).",
                optional: true,
                type: "integer"
              }
            ]
          },
          {
            name: "setIgnoreInputEvents",
            description: "Ignores input events (useful while auditing page).",
            parameters: [
              {
                name: "ignore",
                description: "Ignores input events processing when set to true.",
                type: "boolean"
              }
            ]
          },
          {
            name: "synthesizePinchGesture",
            description: "Synthesizes a pinch gesture over a time period by issuing appropriate touch events.",
            experimental: true,
            parameters: [
              {
                name: "x",
                description: "X coordinate of the start of the gesture in CSS pixels.",
                type: "number"
              },
              {
                name: "y",
                description: "Y coordinate of the start of the gesture in CSS pixels.",
                type: "number"
              },
              {
                name: "scaleFactor",
                description: "Relative scale factor after zooming (>1.0 zooms in, <1.0 zooms out).",
                type: "number"
              },
              {
                name: "relativeSpeed",
                description: "Relative pointer speed in pixels per second (default: 800).",
                optional: true,
                type: "integer"
              },
              {
                name: "gestureSourceType",
                description: "Which type of input events to be generated (default: 'default', which queries the platform\nfor the preferred input type).",
                optional: true,
                $ref: "GestureSourceType"
              }
            ]
          },
          {
            name: "synthesizeScrollGesture",
            description: "Synthesizes a scroll gesture over a time period by issuing appropriate touch events.",
            experimental: true,
            parameters: [
              {
                name: "x",
                description: "X coordinate of the start of the gesture in CSS pixels.",
                type: "number"
              },
              {
                name: "y",
                description: "Y coordinate of the start of the gesture in CSS pixels.",
                type: "number"
              },
              {
                name: "xDistance",
                description: "The distance to scroll along the X axis (positive to scroll left).",
                optional: true,
                type: "number"
              },
              {
                name: "yDistance",
                description: "The distance to scroll along the Y axis (positive to scroll up).",
                optional: true,
                type: "number"
              },
              {
                name: "xOverscroll",
                description: "The number of additional pixels to scroll back along the X axis, in addition to the given\ndistance.",
                optional: true,
                type: "number"
              },
              {
                name: "yOverscroll",
                description: "The number of additional pixels to scroll back along the Y axis, in addition to the given\ndistance.",
                optional: true,
                type: "number"
              },
              {
                name: "preventFling",
                description: "Prevent fling (default: true).",
                optional: true,
                type: "boolean"
              },
              {
                name: "speed",
                description: "Swipe speed in pixels per second (default: 800).",
                optional: true,
                type: "integer"
              },
              {
                name: "gestureSourceType",
                description: "Which type of input events to be generated (default: 'default', which queries the platform\nfor the preferred input type).",
                optional: true,
                $ref: "GestureSourceType"
              },
              {
                name: "repeatCount",
                description: "The number of times to repeat the gesture (default: 0).",
                optional: true,
                type: "integer"
              },
              {
                name: "repeatDelayMs",
                description: "The number of milliseconds delay between each repeat. (default: 250).",
                optional: true,
                type: "integer"
              },
              {
                name: "interactionMarkerName",
                description: 'The name of the interaction markers to generate, if not empty (default: "").',
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "synthesizeTapGesture",
            description: "Synthesizes a tap gesture over a time period by issuing appropriate touch events.",
            experimental: true,
            parameters: [
              {
                name: "x",
                description: "X coordinate of the start of the gesture in CSS pixels.",
                type: "number"
              },
              {
                name: "y",
                description: "Y coordinate of the start of the gesture in CSS pixels.",
                type: "number"
              },
              {
                name: "duration",
                description: "Duration between touchdown and touchup events in ms (default: 50).",
                optional: true,
                type: "integer"
              },
              {
                name: "tapCount",
                description: "Number of times to perform the tap (e.g. 2 for double tap, default: 1).",
                optional: true,
                type: "integer"
              },
              {
                name: "gestureSourceType",
                description: "Which type of input events to be generated (default: 'default', which queries the platform\nfor the preferred input type).",
                optional: true,
                $ref: "GestureSourceType"
              }
            ]
          }
        ]
      },
      {
        domain: "Inspector",
        experimental: true,
        commands: [
          {
            name: "disable",
            description: "Disables inspector domain notifications."
          },
          {
            name: "enable",
            description: "Enables inspector domain notifications."
          }
        ],
        events: [
          {
            name: "detached",
            description: "Fired when remote debugging connection is about to be terminated. Contains detach reason.",
            parameters: [
              {
                name: "reason",
                description: "The reason why connection has been terminated.",
                type: "string"
              }
            ]
          },
          {
            name: "targetCrashed",
            description: "Fired when debugging target has crashed"
          },
          {
            name: "targetReloadedAfterCrash",
            description: "Fired when debugging target has reloaded after crash"
          }
        ]
      },
      {
        domain: "LayerTree",
        experimental: true,
        dependencies: [
          "DOM"
        ],
        types: [
          {
            id: "LayerId",
            description: "Unique Layer identifier.",
            type: "string"
          },
          {
            id: "SnapshotId",
            description: "Unique snapshot identifier.",
            type: "string"
          },
          {
            id: "ScrollRect",
            description: "Rectangle where scrolling happens on the main thread.",
            type: "object",
            properties: [
              {
                name: "rect",
                description: "Rectangle itself.",
                $ref: "DOM.Rect"
              },
              {
                name: "type",
                description: "Reason for rectangle to force scrolling on the main thread",
                type: "string",
                enum: [
                  "RepaintsOnScroll",
                  "TouchEventHandler",
                  "WheelEventHandler"
                ]
              }
            ]
          },
          {
            id: "StickyPositionConstraint",
            description: "Sticky position constraints.",
            type: "object",
            properties: [
              {
                name: "stickyBoxRect",
                description: "Layout rectangle of the sticky element before being shifted",
                $ref: "DOM.Rect"
              },
              {
                name: "containingBlockRect",
                description: "Layout rectangle of the containing block of the sticky element",
                $ref: "DOM.Rect"
              },
              {
                name: "nearestLayerShiftingStickyBox",
                description: "The nearest sticky layer that shifts the sticky box",
                optional: true,
                $ref: "LayerId"
              },
              {
                name: "nearestLayerShiftingContainingBlock",
                description: "The nearest sticky layer that shifts the containing block",
                optional: true,
                $ref: "LayerId"
              }
            ]
          },
          {
            id: "PictureTile",
            description: "Serialized fragment of layer picture along with its offset within the layer.",
            type: "object",
            properties: [
              {
                name: "x",
                description: "Offset from owning layer left boundary",
                type: "number"
              },
              {
                name: "y",
                description: "Offset from owning layer top boundary",
                type: "number"
              },
              {
                name: "picture",
                description: "Base64-encoded snapshot data.",
                type: "string"
              }
            ]
          },
          {
            id: "Layer",
            description: "Information about a compositing layer.",
            type: "object",
            properties: [
              {
                name: "layerId",
                description: "The unique id for this layer.",
                $ref: "LayerId"
              },
              {
                name: "parentLayerId",
                description: "The id of parent (not present for root).",
                optional: true,
                $ref: "LayerId"
              },
              {
                name: "backendNodeId",
                description: "The backend id for the node associated with this layer.",
                optional: true,
                $ref: "DOM.BackendNodeId"
              },
              {
                name: "offsetX",
                description: "Offset from parent layer, X coordinate.",
                type: "number"
              },
              {
                name: "offsetY",
                description: "Offset from parent layer, Y coordinate.",
                type: "number"
              },
              {
                name: "width",
                description: "Layer width.",
                type: "number"
              },
              {
                name: "height",
                description: "Layer height.",
                type: "number"
              },
              {
                name: "transform",
                description: "Transformation matrix for layer, default is identity matrix",
                optional: true,
                type: "array",
                items: {
                  type: "number"
                }
              },
              {
                name: "anchorX",
                description: "Transform anchor point X, absent if no transform specified",
                optional: true,
                type: "number"
              },
              {
                name: "anchorY",
                description: "Transform anchor point Y, absent if no transform specified",
                optional: true,
                type: "number"
              },
              {
                name: "anchorZ",
                description: "Transform anchor point Z, absent if no transform specified",
                optional: true,
                type: "number"
              },
              {
                name: "paintCount",
                description: "Indicates how many time this layer has painted.",
                type: "integer"
              },
              {
                name: "drawsContent",
                description: "Indicates whether this layer hosts any content, rather than being used for\ntransform/scrolling purposes only.",
                type: "boolean"
              },
              {
                name: "invisible",
                description: "Set if layer is not visible.",
                optional: true,
                type: "boolean"
              },
              {
                name: "scrollRects",
                description: "Rectangles scrolling on main thread only.",
                optional: true,
                type: "array",
                items: {
                  $ref: "ScrollRect"
                }
              },
              {
                name: "stickyPositionConstraint",
                description: "Sticky position constraint information",
                optional: true,
                $ref: "StickyPositionConstraint"
              }
            ]
          },
          {
            id: "PaintProfile",
            description: "Array of timings, one per paint step.",
            type: "array",
            items: {
              type: "number"
            }
          }
        ],
        commands: [
          {
            name: "compositingReasons",
            description: "Provides the reasons why the given layer was composited.",
            parameters: [
              {
                name: "layerId",
                description: "The id of the layer for which we want to get the reasons it was composited.",
                $ref: "LayerId"
              }
            ],
            returns: [
              {
                name: "compositingReasons",
                description: "A list of strings specifying reasons for the given layer to become composited.",
                type: "array",
                items: {
                  type: "string"
                }
              }
            ]
          },
          {
            name: "disable",
            description: "Disables compositing tree inspection."
          },
          {
            name: "enable",
            description: "Enables compositing tree inspection."
          },
          {
            name: "loadSnapshot",
            description: "Returns the snapshot identifier.",
            parameters: [
              {
                name: "tiles",
                description: "An array of tiles composing the snapshot.",
                type: "array",
                items: {
                  $ref: "PictureTile"
                }
              }
            ],
            returns: [
              {
                name: "snapshotId",
                description: "The id of the snapshot.",
                $ref: "SnapshotId"
              }
            ]
          },
          {
            name: "makeSnapshot",
            description: "Returns the layer snapshot identifier.",
            parameters: [
              {
                name: "layerId",
                description: "The id of the layer.",
                $ref: "LayerId"
              }
            ],
            returns: [
              {
                name: "snapshotId",
                description: "The id of the layer snapshot.",
                $ref: "SnapshotId"
              }
            ]
          },
          {
            name: "profileSnapshot",
            parameters: [
              {
                name: "snapshotId",
                description: "The id of the layer snapshot.",
                $ref: "SnapshotId"
              },
              {
                name: "minRepeatCount",
                description: "The maximum number of times to replay the snapshot (1, if not specified).",
                optional: true,
                type: "integer"
              },
              {
                name: "minDuration",
                description: "The minimum duration (in seconds) to replay the snapshot.",
                optional: true,
                type: "number"
              },
              {
                name: "clipRect",
                description: "The clip rectangle to apply when replaying the snapshot.",
                optional: true,
                $ref: "DOM.Rect"
              }
            ],
            returns: [
              {
                name: "timings",
                description: "The array of paint profiles, one per run.",
                type: "array",
                items: {
                  $ref: "PaintProfile"
                }
              }
            ]
          },
          {
            name: "releaseSnapshot",
            description: "Releases layer snapshot captured by the back-end.",
            parameters: [
              {
                name: "snapshotId",
                description: "The id of the layer snapshot.",
                $ref: "SnapshotId"
              }
            ]
          },
          {
            name: "replaySnapshot",
            description: "Replays the layer snapshot and returns the resulting bitmap.",
            parameters: [
              {
                name: "snapshotId",
                description: "The id of the layer snapshot.",
                $ref: "SnapshotId"
              },
              {
                name: "fromStep",
                description: "The first step to replay from (replay from the very start if not specified).",
                optional: true,
                type: "integer"
              },
              {
                name: "toStep",
                description: "The last step to replay to (replay till the end if not specified).",
                optional: true,
                type: "integer"
              },
              {
                name: "scale",
                description: "The scale to apply while replaying (defaults to 1).",
                optional: true,
                type: "number"
              }
            ],
            returns: [
              {
                name: "dataURL",
                description: "A data: URL for resulting image.",
                type: "string"
              }
            ]
          },
          {
            name: "snapshotCommandLog",
            description: "Replays the layer snapshot and returns canvas log.",
            parameters: [
              {
                name: "snapshotId",
                description: "The id of the layer snapshot.",
                $ref: "SnapshotId"
              }
            ],
            returns: [
              {
                name: "commandLog",
                description: "The array of canvas function calls.",
                type: "array",
                items: {
                  type: "object"
                }
              }
            ]
          }
        ],
        events: [
          {
            name: "layerPainted",
            parameters: [
              {
                name: "layerId",
                description: "The id of the painted layer.",
                $ref: "LayerId"
              },
              {
                name: "clip",
                description: "Clip rectangle.",
                $ref: "DOM.Rect"
              }
            ]
          },
          {
            name: "layerTreeDidChange",
            parameters: [
              {
                name: "layers",
                description: "Layer tree, absent if not in the comspositing mode.",
                optional: true,
                type: "array",
                items: {
                  $ref: "Layer"
                }
              }
            ]
          }
        ]
      },
      {
        domain: "Log",
        description: "Provides access to log entries.",
        dependencies: [
          "Runtime",
          "Network"
        ],
        types: [
          {
            id: "LogEntry",
            description: "Log entry.",
            type: "object",
            properties: [
              {
                name: "source",
                description: "Log entry source.",
                type: "string",
                enum: [
                  "xml",
                  "javascript",
                  "network",
                  "storage",
                  "appcache",
                  "rendering",
                  "security",
                  "deprecation",
                  "worker",
                  "violation",
                  "intervention",
                  "recommendation",
                  "other"
                ]
              },
              {
                name: "level",
                description: "Log entry severity.",
                type: "string",
                enum: [
                  "verbose",
                  "info",
                  "warning",
                  "error"
                ]
              },
              {
                name: "text",
                description: "Logged text.",
                type: "string"
              },
              {
                name: "timestamp",
                description: "Timestamp when this entry was added.",
                $ref: "Runtime.Timestamp"
              },
              {
                name: "url",
                description: "URL of the resource if known.",
                optional: true,
                type: "string"
              },
              {
                name: "lineNumber",
                description: "Line number in the resource.",
                optional: true,
                type: "integer"
              },
              {
                name: "stackTrace",
                description: "JavaScript stack trace.",
                optional: true,
                $ref: "Runtime.StackTrace"
              },
              {
                name: "networkRequestId",
                description: "Identifier of the network request associated with this entry.",
                optional: true,
                $ref: "Network.RequestId"
              },
              {
                name: "workerId",
                description: "Identifier of the worker associated with this entry.",
                optional: true,
                type: "string"
              },
              {
                name: "args",
                description: "Call arguments.",
                optional: true,
                type: "array",
                items: {
                  $ref: "Runtime.RemoteObject"
                }
              }
            ]
          },
          {
            id: "ViolationSetting",
            description: "Violation configuration setting.",
            type: "object",
            properties: [
              {
                name: "name",
                description: "Violation type.",
                type: "string",
                enum: [
                  "longTask",
                  "longLayout",
                  "blockedEvent",
                  "blockedParser",
                  "discouragedAPIUse",
                  "handler",
                  "recurringHandler"
                ]
              },
              {
                name: "threshold",
                description: "Time threshold to trigger upon.",
                type: "number"
              }
            ]
          }
        ],
        commands: [
          {
            name: "clear",
            description: "Clears the log."
          },
          {
            name: "disable",
            description: "Disables log domain, prevents further log entries from being reported to the client."
          },
          {
            name: "enable",
            description: "Enables log domain, sends the entries collected so far to the client by means of the\n`entryAdded` notification."
          },
          {
            name: "startViolationsReport",
            description: "start violation reporting.",
            parameters: [
              {
                name: "config",
                description: "Configuration for violations.",
                type: "array",
                items: {
                  $ref: "ViolationSetting"
                }
              }
            ]
          },
          {
            name: "stopViolationsReport",
            description: "Stop violation reporting."
          }
        ],
        events: [
          {
            name: "entryAdded",
            description: "Issued when new message was logged.",
            parameters: [
              {
                name: "entry",
                description: "The entry.",
                $ref: "LogEntry"
              }
            ]
          }
        ]
      },
      {
        domain: "Memory",
        experimental: true,
        types: [
          {
            id: "PressureLevel",
            description: "Memory pressure level.",
            type: "string",
            enum: [
              "moderate",
              "critical"
            ]
          },
          {
            id: "SamplingProfileNode",
            description: "Heap profile sample.",
            type: "object",
            properties: [
              {
                name: "size",
                description: "Size of the sampled allocation.",
                type: "number"
              },
              {
                name: "total",
                description: "Total bytes attributed to this sample.",
                type: "number"
              },
              {
                name: "stack",
                description: "Execution stack at the point of allocation.",
                type: "array",
                items: {
                  type: "string"
                }
              }
            ]
          },
          {
            id: "SamplingProfile",
            description: "Array of heap profile samples.",
            type: "object",
            properties: [
              {
                name: "samples",
                type: "array",
                items: {
                  $ref: "SamplingProfileNode"
                }
              },
              {
                name: "modules",
                type: "array",
                items: {
                  $ref: "Module"
                }
              }
            ]
          },
          {
            id: "Module",
            description: "Executable module information",
            type: "object",
            properties: [
              {
                name: "name",
                description: "Name of the module.",
                type: "string"
              },
              {
                name: "uuid",
                description: "UUID of the module.",
                type: "string"
              },
              {
                name: "baseAddress",
                description: "Base address where the module is loaded into memory. Encoded as a decimal\nor hexadecimal (0x prefixed) string.",
                type: "string"
              },
              {
                name: "size",
                description: "Size of the module in bytes.",
                type: "number"
              }
            ]
          }
        ],
        commands: [
          {
            name: "getDOMCounters",
            returns: [
              {
                name: "documents",
                type: "integer"
              },
              {
                name: "nodes",
                type: "integer"
              },
              {
                name: "jsEventListeners",
                type: "integer"
              }
            ]
          },
          {
            name: "prepareForLeakDetection"
          },
          {
            name: "forciblyPurgeJavaScriptMemory",
            description: "Simulate OomIntervention by purging V8 memory."
          },
          {
            name: "setPressureNotificationsSuppressed",
            description: "Enable/disable suppressing memory pressure notifications in all processes.",
            parameters: [
              {
                name: "suppressed",
                description: "If true, memory pressure notifications will be suppressed.",
                type: "boolean"
              }
            ]
          },
          {
            name: "simulatePressureNotification",
            description: "Simulate a memory pressure notification in all processes.",
            parameters: [
              {
                name: "level",
                description: "Memory pressure level of the notification.",
                $ref: "PressureLevel"
              }
            ]
          },
          {
            name: "startSampling",
            description: "Start collecting native memory profile.",
            parameters: [
              {
                name: "samplingInterval",
                description: "Average number of bytes between samples.",
                optional: true,
                type: "integer"
              },
              {
                name: "suppressRandomness",
                description: "Do not randomize intervals between samples.",
                optional: true,
                type: "boolean"
              }
            ]
          },
          {
            name: "stopSampling",
            description: "Stop collecting native memory profile."
          },
          {
            name: "getAllTimeSamplingProfile",
            description: "Retrieve native memory allocations profile\ncollected since renderer process startup.",
            returns: [
              {
                name: "profile",
                $ref: "SamplingProfile"
              }
            ]
          },
          {
            name: "getBrowserSamplingProfile",
            description: "Retrieve native memory allocations profile\ncollected since browser process startup.",
            returns: [
              {
                name: "profile",
                $ref: "SamplingProfile"
              }
            ]
          },
          {
            name: "getSamplingProfile",
            description: "Retrieve native memory allocations profile collected since last\n`startSampling` call.",
            returns: [
              {
                name: "profile",
                $ref: "SamplingProfile"
              }
            ]
          }
        ]
      },
      {
        domain: "Network",
        description: "Network domain allows tracking network activities of the page. It exposes information about http,\nfile, data and other requests and responses, their headers, bodies, timing, etc.",
        dependencies: [
          "Debugger",
          "Runtime",
          "Security"
        ],
        types: [
          {
            id: "ResourceType",
            description: "Resource type as it was perceived by the rendering engine.",
            type: "string",
            enum: [
              "Document",
              "Stylesheet",
              "Image",
              "Media",
              "Font",
              "Script",
              "TextTrack",
              "XHR",
              "Fetch",
              "EventSource",
              "WebSocket",
              "Manifest",
              "SignedExchange",
              "Ping",
              "CSPViolationReport",
              "Other"
            ]
          },
          {
            id: "LoaderId",
            description: "Unique loader identifier.",
            type: "string"
          },
          {
            id: "RequestId",
            description: "Unique request identifier.",
            type: "string"
          },
          {
            id: "InterceptionId",
            description: "Unique intercepted request identifier.",
            type: "string"
          },
          {
            id: "ErrorReason",
            description: "Network level fetch failure reason.",
            type: "string",
            enum: [
              "Failed",
              "Aborted",
              "TimedOut",
              "AccessDenied",
              "ConnectionClosed",
              "ConnectionReset",
              "ConnectionRefused",
              "ConnectionAborted",
              "ConnectionFailed",
              "NameNotResolved",
              "InternetDisconnected",
              "AddressUnreachable",
              "BlockedByClient",
              "BlockedByResponse"
            ]
          },
          {
            id: "TimeSinceEpoch",
            description: "UTC time in seconds, counted from January 1, 1970.",
            type: "number"
          },
          {
            id: "MonotonicTime",
            description: "Monotonically increasing time in seconds since an arbitrary point in the past.",
            type: "number"
          },
          {
            id: "Headers",
            description: "Request / response headers as keys / values of JSON object.",
            type: "object"
          },
          {
            id: "ConnectionType",
            description: "The underlying connection technology that the browser is supposedly using.",
            type: "string",
            enum: [
              "none",
              "cellular2g",
              "cellular3g",
              "cellular4g",
              "bluetooth",
              "ethernet",
              "wifi",
              "wimax",
              "other"
            ]
          },
          {
            id: "CookieSameSite",
            description: "Represents the cookie's 'SameSite' status:\nhttps://tools.ietf.org/html/draft-west-first-party-cookies",
            type: "string",
            enum: [
              "Strict",
              "Lax",
              "Extended",
              "None"
            ]
          },
          {
            id: "ResourceTiming",
            description: "Timing information for the request.",
            type: "object",
            properties: [
              {
                name: "requestTime",
                description: "Timing's requestTime is a baseline in seconds, while the other numbers are ticks in\nmilliseconds relatively to this requestTime.",
                type: "number"
              },
              {
                name: "proxyStart",
                description: "Started resolving proxy.",
                type: "number"
              },
              {
                name: "proxyEnd",
                description: "Finished resolving proxy.",
                type: "number"
              },
              {
                name: "dnsStart",
                description: "Started DNS address resolve.",
                type: "number"
              },
              {
                name: "dnsEnd",
                description: "Finished DNS address resolve.",
                type: "number"
              },
              {
                name: "connectStart",
                description: "Started connecting to the remote host.",
                type: "number"
              },
              {
                name: "connectEnd",
                description: "Connected to the remote host.",
                type: "number"
              },
              {
                name: "sslStart",
                description: "Started SSL handshake.",
                type: "number"
              },
              {
                name: "sslEnd",
                description: "Finished SSL handshake.",
                type: "number"
              },
              {
                name: "workerStart",
                description: "Started running ServiceWorker.",
                experimental: true,
                type: "number"
              },
              {
                name: "workerReady",
                description: "Finished Starting ServiceWorker.",
                experimental: true,
                type: "number"
              },
              {
                name: "sendStart",
                description: "Started sending request.",
                type: "number"
              },
              {
                name: "sendEnd",
                description: "Finished sending request.",
                type: "number"
              },
              {
                name: "pushStart",
                description: "Time the server started pushing request.",
                experimental: true,
                type: "number"
              },
              {
                name: "pushEnd",
                description: "Time the server finished pushing request.",
                experimental: true,
                type: "number"
              },
              {
                name: "receiveHeadersEnd",
                description: "Finished receiving response headers.",
                type: "number"
              }
            ]
          },
          {
            id: "ResourcePriority",
            description: "Loading priority of a resource request.",
            type: "string",
            enum: [
              "VeryLow",
              "Low",
              "Medium",
              "High",
              "VeryHigh"
            ]
          },
          {
            id: "Request",
            description: "HTTP request data.",
            type: "object",
            properties: [
              {
                name: "url",
                description: "Request URL (without fragment).",
                type: "string"
              },
              {
                name: "urlFragment",
                description: "Fragment of the requested URL starting with hash, if present.",
                optional: true,
                type: "string"
              },
              {
                name: "method",
                description: "HTTP request method.",
                type: "string"
              },
              {
                name: "headers",
                description: "HTTP request headers.",
                $ref: "Headers"
              },
              {
                name: "postData",
                description: "HTTP POST request data.",
                optional: true,
                type: "string"
              },
              {
                name: "hasPostData",
                description: "True when the request has POST data. Note that postData might still be omitted when this flag is true when the data is too long.",
                optional: true,
                type: "boolean"
              },
              {
                name: "mixedContentType",
                description: "The mixed content type of the request.",
                optional: true,
                $ref: "Security.MixedContentType"
              },
              {
                name: "initialPriority",
                description: "Priority of the resource request at the time request is sent.",
                $ref: "ResourcePriority"
              },
              {
                name: "referrerPolicy",
                description: "The referrer policy of the request, as defined in https://www.w3.org/TR/referrer-policy/",
                type: "string",
                enum: [
                  "unsafe-url",
                  "no-referrer-when-downgrade",
                  "no-referrer",
                  "origin",
                  "origin-when-cross-origin",
                  "same-origin",
                  "strict-origin",
                  "strict-origin-when-cross-origin"
                ]
              },
              {
                name: "isLinkPreload",
                description: "Whether is loaded via link preload.",
                optional: true,
                type: "boolean"
              }
            ]
          },
          {
            id: "SignedCertificateTimestamp",
            description: "Details of a signed certificate timestamp (SCT).",
            type: "object",
            properties: [
              {
                name: "status",
                description: "Validation status.",
                type: "string"
              },
              {
                name: "origin",
                description: "Origin.",
                type: "string"
              },
              {
                name: "logDescription",
                description: "Log name / description.",
                type: "string"
              },
              {
                name: "logId",
                description: "Log ID.",
                type: "string"
              },
              {
                name: "timestamp",
                description: "Issuance date.",
                $ref: "TimeSinceEpoch"
              },
              {
                name: "hashAlgorithm",
                description: "Hash algorithm.",
                type: "string"
              },
              {
                name: "signatureAlgorithm",
                description: "Signature algorithm.",
                type: "string"
              },
              {
                name: "signatureData",
                description: "Signature data.",
                type: "string"
              }
            ]
          },
          {
            id: "SecurityDetails",
            description: "Security details about a request.",
            type: "object",
            properties: [
              {
                name: "protocol",
                description: 'Protocol name (e.g. "TLS 1.2" or "QUIC").',
                type: "string"
              },
              {
                name: "keyExchange",
                description: "Key Exchange used by the connection, or the empty string if not applicable.",
                type: "string"
              },
              {
                name: "keyExchangeGroup",
                description: "(EC)DH group used by the connection, if applicable.",
                optional: true,
                type: "string"
              },
              {
                name: "cipher",
                description: "Cipher name.",
                type: "string"
              },
              {
                name: "mac",
                description: "TLS MAC. Note that AEAD ciphers do not have separate MACs.",
                optional: true,
                type: "string"
              },
              {
                name: "certificateId",
                description: "Certificate ID value.",
                $ref: "Security.CertificateId"
              },
              {
                name: "subjectName",
                description: "Certificate subject name.",
                type: "string"
              },
              {
                name: "sanList",
                description: "Subject Alternative Name (SAN) DNS names and IP addresses.",
                type: "array",
                items: {
                  type: "string"
                }
              },
              {
                name: "issuer",
                description: "Name of the issuing CA.",
                type: "string"
              },
              {
                name: "validFrom",
                description: "Certificate valid from date.",
                $ref: "TimeSinceEpoch"
              },
              {
                name: "validTo",
                description: "Certificate valid to (expiration) date",
                $ref: "TimeSinceEpoch"
              },
              {
                name: "signedCertificateTimestampList",
                description: "List of signed certificate timestamps (SCTs).",
                type: "array",
                items: {
                  $ref: "SignedCertificateTimestamp"
                }
              },
              {
                name: "certificateTransparencyCompliance",
                description: "Whether the request complied with Certificate Transparency policy",
                $ref: "CertificateTransparencyCompliance"
              }
            ]
          },
          {
            id: "CertificateTransparencyCompliance",
            description: "Whether the request complied with Certificate Transparency policy.",
            type: "string",
            enum: [
              "unknown",
              "not-compliant",
              "compliant"
            ]
          },
          {
            id: "BlockedReason",
            description: "The reason why request was blocked.",
            type: "string",
            enum: [
              "other",
              "csp",
              "mixed-content",
              "origin",
              "inspector",
              "subresource-filter",
              "content-type",
              "collapsed-by-client"
            ]
          },
          {
            id: "Response",
            description: "HTTP response data.",
            type: "object",
            properties: [
              {
                name: "url",
                description: "Response URL. This URL can be different from CachedResource.url in case of redirect.",
                type: "string"
              },
              {
                name: "status",
                description: "HTTP response status code.",
                type: "integer"
              },
              {
                name: "statusText",
                description: "HTTP response status text.",
                type: "string"
              },
              {
                name: "headers",
                description: "HTTP response headers.",
                $ref: "Headers"
              },
              {
                name: "headersText",
                description: "HTTP response headers text.",
                optional: true,
                type: "string"
              },
              {
                name: "mimeType",
                description: "Resource mimeType as determined by the browser.",
                type: "string"
              },
              {
                name: "requestHeaders",
                description: "Refined HTTP request headers that were actually transmitted over the network.",
                optional: true,
                $ref: "Headers"
              },
              {
                name: "requestHeadersText",
                description: "HTTP request headers text.",
                optional: true,
                type: "string"
              },
              {
                name: "connectionReused",
                description: "Specifies whether physical connection was actually reused for this request.",
                type: "boolean"
              },
              {
                name: "connectionId",
                description: "Physical connection id that was actually used for this request.",
                type: "number"
              },
              {
                name: "remoteIPAddress",
                description: "Remote IP address.",
                optional: true,
                type: "string"
              },
              {
                name: "remotePort",
                description: "Remote port.",
                optional: true,
                type: "integer"
              },
              {
                name: "fromDiskCache",
                description: "Specifies that the request was served from the disk cache.",
                optional: true,
                type: "boolean"
              },
              {
                name: "fromServiceWorker",
                description: "Specifies that the request was served from the ServiceWorker.",
                optional: true,
                type: "boolean"
              },
              {
                name: "fromPrefetchCache",
                description: "Specifies that the request was served from the prefetch cache.",
                optional: true,
                type: "boolean"
              },
              {
                name: "encodedDataLength",
                description: "Total number of bytes received for this request so far.",
                type: "number"
              },
              {
                name: "timing",
                description: "Timing information for the given request.",
                optional: true,
                $ref: "ResourceTiming"
              },
              {
                name: "protocol",
                description: "Protocol used to fetch this request.",
                optional: true,
                type: "string"
              },
              {
                name: "securityState",
                description: "Security state of the request resource.",
                $ref: "Security.SecurityState"
              },
              {
                name: "securityDetails",
                description: "Security details for the request.",
                optional: true,
                $ref: "SecurityDetails"
              }
            ]
          },
          {
            id: "WebSocketRequest",
            description: "WebSocket request data.",
            type: "object",
            properties: [
              {
                name: "headers",
                description: "HTTP request headers.",
                $ref: "Headers"
              }
            ]
          },
          {
            id: "WebSocketResponse",
            description: "WebSocket response data.",
            type: "object",
            properties: [
              {
                name: "status",
                description: "HTTP response status code.",
                type: "integer"
              },
              {
                name: "statusText",
                description: "HTTP response status text.",
                type: "string"
              },
              {
                name: "headers",
                description: "HTTP response headers.",
                $ref: "Headers"
              },
              {
                name: "headersText",
                description: "HTTP response headers text.",
                optional: true,
                type: "string"
              },
              {
                name: "requestHeaders",
                description: "HTTP request headers.",
                optional: true,
                $ref: "Headers"
              },
              {
                name: "requestHeadersText",
                description: "HTTP request headers text.",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            id: "WebSocketFrame",
            description: "WebSocket message data. This represents an entire WebSocket message, not just a fragmented frame as the name suggests.",
            type: "object",
            properties: [
              {
                name: "opcode",
                description: "WebSocket message opcode.",
                type: "number"
              },
              {
                name: "mask",
                description: "WebSocket message mask.",
                type: "boolean"
              },
              {
                name: "payloadData",
                description: "WebSocket message payload data.\nIf the opcode is 1, this is a text message and payloadData is a UTF-8 string.\nIf the opcode isn't 1, then payloadData is a base64 encoded string representing binary data.",
                type: "string"
              }
            ]
          },
          {
            id: "CachedResource",
            description: "Information about the cached resource.",
            type: "object",
            properties: [
              {
                name: "url",
                description: "Resource URL. This is the url of the original network request.",
                type: "string"
              },
              {
                name: "type",
                description: "Type of this resource.",
                $ref: "ResourceType"
              },
              {
                name: "response",
                description: "Cached response data.",
                optional: true,
                $ref: "Response"
              },
              {
                name: "bodySize",
                description: "Cached response body size.",
                type: "number"
              }
            ]
          },
          {
            id: "Initiator",
            description: "Information about the request initiator.",
            type: "object",
            properties: [
              {
                name: "type",
                description: "Type of this initiator.",
                type: "string",
                enum: [
                  "parser",
                  "script",
                  "preload",
                  "SignedExchange",
                  "other"
                ]
              },
              {
                name: "stack",
                description: "Initiator JavaScript stack trace, set for Script only.",
                optional: true,
                $ref: "Runtime.StackTrace"
              },
              {
                name: "url",
                description: "Initiator URL, set for Parser type or for Script type (when script is importing module) or for SignedExchange type.",
                optional: true,
                type: "string"
              },
              {
                name: "lineNumber",
                description: "Initiator line number, set for Parser type or for Script type (when script is importing\nmodule) (0-based).",
                optional: true,
                type: "number"
              }
            ]
          },
          {
            id: "Cookie",
            description: "Cookie object",
            type: "object",
            properties: [
              {
                name: "name",
                description: "Cookie name.",
                type: "string"
              },
              {
                name: "value",
                description: "Cookie value.",
                type: "string"
              },
              {
                name: "domain",
                description: "Cookie domain.",
                type: "string"
              },
              {
                name: "path",
                description: "Cookie path.",
                type: "string"
              },
              {
                name: "expires",
                description: "Cookie expiration date as the number of seconds since the UNIX epoch.",
                type: "number"
              },
              {
                name: "size",
                description: "Cookie size.",
                type: "integer"
              },
              {
                name: "httpOnly",
                description: "True if cookie is http-only.",
                type: "boolean"
              },
              {
                name: "secure",
                description: "True if cookie is secure.",
                type: "boolean"
              },
              {
                name: "session",
                description: "True in case of session cookie.",
                type: "boolean"
              },
              {
                name: "sameSite",
                description: "Cookie SameSite type.",
                optional: true,
                $ref: "CookieSameSite"
              }
            ]
          },
          {
            id: "CookieParam",
            description: "Cookie parameter object",
            type: "object",
            properties: [
              {
                name: "name",
                description: "Cookie name.",
                type: "string"
              },
              {
                name: "value",
                description: "Cookie value.",
                type: "string"
              },
              {
                name: "url",
                description: "The request-URI to associate with the setting of the cookie. This value can affect the\ndefault domain and path values of the created cookie.",
                optional: true,
                type: "string"
              },
              {
                name: "domain",
                description: "Cookie domain.",
                optional: true,
                type: "string"
              },
              {
                name: "path",
                description: "Cookie path.",
                optional: true,
                type: "string"
              },
              {
                name: "secure",
                description: "True if cookie is secure.",
                optional: true,
                type: "boolean"
              },
              {
                name: "httpOnly",
                description: "True if cookie is http-only.",
                optional: true,
                type: "boolean"
              },
              {
                name: "sameSite",
                description: "Cookie SameSite type.",
                optional: true,
                $ref: "CookieSameSite"
              },
              {
                name: "expires",
                description: "Cookie expiration date, session cookie if not set",
                optional: true,
                $ref: "TimeSinceEpoch"
              }
            ]
          },
          {
            id: "AuthChallenge",
            description: "Authorization challenge for HTTP status code 401 or 407.",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "source",
                description: "Source of the authentication challenge.",
                optional: true,
                type: "string",
                enum: [
                  "Server",
                  "Proxy"
                ]
              },
              {
                name: "origin",
                description: "Origin of the challenger.",
                type: "string"
              },
              {
                name: "scheme",
                description: "The authentication scheme used, such as basic or digest",
                type: "string"
              },
              {
                name: "realm",
                description: "The realm of the challenge. May be empty.",
                type: "string"
              }
            ]
          },
          {
            id: "AuthChallengeResponse",
            description: "Response to an AuthChallenge.",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "response",
                description: "The decision on what to do in response to the authorization challenge.  Default means\ndeferring to the default behavior of the net stack, which will likely either the Cancel\nauthentication or display a popup dialog box.",
                type: "string",
                enum: [
                  "Default",
                  "CancelAuth",
                  "ProvideCredentials"
                ]
              },
              {
                name: "username",
                description: "The username to provide, possibly empty. Should only be set if response is\nProvideCredentials.",
                optional: true,
                type: "string"
              },
              {
                name: "password",
                description: "The password to provide, possibly empty. Should only be set if response is\nProvideCredentials.",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            id: "InterceptionStage",
            description: "Stages of the interception to begin intercepting. Request will intercept before the request is\nsent. Response will intercept after the response is received.",
            experimental: true,
            type: "string",
            enum: [
              "Request",
              "HeadersReceived"
            ]
          },
          {
            id: "RequestPattern",
            description: "Request pattern for interception.",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "urlPattern",
                description: `Wildcards ('*' -> zero or more, '?' -> exactly one) are allowed. Escape character is
backslash. Omitting is equivalent to "*".`,
                optional: true,
                type: "string"
              },
              {
                name: "resourceType",
                description: "If set, only requests for matching resource types will be intercepted.",
                optional: true,
                $ref: "ResourceType"
              },
              {
                name: "interceptionStage",
                description: "Stage at wich to begin intercepting requests. Default is Request.",
                optional: true,
                $ref: "InterceptionStage"
              }
            ]
          },
          {
            id: "SignedExchangeSignature",
            description: "Information about a signed exchange signature.\nhttps://wicg.github.io/webpackage/draft-yasskin-httpbis-origin-signed-exchanges-impl.html#rfc.section.3.1",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "label",
                description: "Signed exchange signature label.",
                type: "string"
              },
              {
                name: "signature",
                description: "The hex string of signed exchange signature.",
                type: "string"
              },
              {
                name: "integrity",
                description: "Signed exchange signature integrity.",
                type: "string"
              },
              {
                name: "certUrl",
                description: "Signed exchange signature cert Url.",
                optional: true,
                type: "string"
              },
              {
                name: "certSha256",
                description: "The hex string of signed exchange signature cert sha256.",
                optional: true,
                type: "string"
              },
              {
                name: "validityUrl",
                description: "Signed exchange signature validity Url.",
                type: "string"
              },
              {
                name: "date",
                description: "Signed exchange signature date.",
                type: "integer"
              },
              {
                name: "expires",
                description: "Signed exchange signature expires.",
                type: "integer"
              },
              {
                name: "certificates",
                description: "The encoded certificates.",
                optional: true,
                type: "array",
                items: {
                  type: "string"
                }
              }
            ]
          },
          {
            id: "SignedExchangeHeader",
            description: "Information about a signed exchange header.\nhttps://wicg.github.io/webpackage/draft-yasskin-httpbis-origin-signed-exchanges-impl.html#cbor-representation",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "requestUrl",
                description: "Signed exchange request URL.",
                type: "string"
              },
              {
                name: "responseCode",
                description: "Signed exchange response code.",
                type: "integer"
              },
              {
                name: "responseHeaders",
                description: "Signed exchange response headers.",
                $ref: "Headers"
              },
              {
                name: "signatures",
                description: "Signed exchange response signature.",
                type: "array",
                items: {
                  $ref: "SignedExchangeSignature"
                }
              },
              {
                name: "headerIntegrity",
                description: 'Signed exchange header integrity hash in the form of "sha256-<base64-hash-value>".',
                type: "string"
              }
            ]
          },
          {
            id: "SignedExchangeErrorField",
            description: "Field type for a signed exchange related error.",
            experimental: true,
            type: "string",
            enum: [
              "signatureSig",
              "signatureIntegrity",
              "signatureCertUrl",
              "signatureCertSha256",
              "signatureValidityUrl",
              "signatureTimestamps"
            ]
          },
          {
            id: "SignedExchangeError",
            description: "Information about a signed exchange response.",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "message",
                description: "Error message.",
                type: "string"
              },
              {
                name: "signatureIndex",
                description: "The index of the signature which caused the error.",
                optional: true,
                type: "integer"
              },
              {
                name: "errorField",
                description: "The field which caused the error.",
                optional: true,
                $ref: "SignedExchangeErrorField"
              }
            ]
          },
          {
            id: "SignedExchangeInfo",
            description: "Information about a signed exchange response.",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "outerResponse",
                description: "The outer response of signed HTTP exchange which was received from network.",
                $ref: "Response"
              },
              {
                name: "header",
                description: "Information about the signed exchange header.",
                optional: true,
                $ref: "SignedExchangeHeader"
              },
              {
                name: "securityDetails",
                description: "Security details for the signed exchange header.",
                optional: true,
                $ref: "SecurityDetails"
              },
              {
                name: "errors",
                description: "Errors occurred while handling the signed exchagne.",
                optional: true,
                type: "array",
                items: {
                  $ref: "SignedExchangeError"
                }
              }
            ]
          }
        ],
        commands: [
          {
            name: "canClearBrowserCache",
            description: "Tells whether clearing browser cache is supported.",
            deprecated: true,
            returns: [
              {
                name: "result",
                description: "True if browser cache can be cleared.",
                type: "boolean"
              }
            ]
          },
          {
            name: "canClearBrowserCookies",
            description: "Tells whether clearing browser cookies is supported.",
            deprecated: true,
            returns: [
              {
                name: "result",
                description: "True if browser cookies can be cleared.",
                type: "boolean"
              }
            ]
          },
          {
            name: "canEmulateNetworkConditions",
            description: "Tells whether emulation of network conditions is supported.",
            deprecated: true,
            returns: [
              {
                name: "result",
                description: "True if emulation of network conditions is supported.",
                type: "boolean"
              }
            ]
          },
          {
            name: "clearBrowserCache",
            description: "Clears browser cache."
          },
          {
            name: "clearBrowserCookies",
            description: "Clears browser cookies."
          },
          {
            name: "continueInterceptedRequest",
            description: "Response to Network.requestIntercepted which either modifies the request to continue with any\nmodifications, or blocks it, or completes it with the provided response bytes. If a network\nfetch occurs as a result which encounters a redirect an additional Network.requestIntercepted\nevent will be sent with the same InterceptionId.\nDeprecated, use Fetch.continueRequest, Fetch.fulfillRequest and Fetch.failRequest instead.",
            experimental: true,
            deprecated: true,
            parameters: [
              {
                name: "interceptionId",
                $ref: "InterceptionId"
              },
              {
                name: "errorReason",
                description: "If set this causes the request to fail with the given reason. Passing `Aborted` for requests\nmarked with `isNavigationRequest` also cancels the navigation. Must not be set in response\nto an authChallenge.",
                optional: true,
                $ref: "ErrorReason"
              },
              {
                name: "rawResponse",
                description: "If set the requests completes using with the provided base64 encoded raw response, including\nHTTP status line and headers etc... Must not be set in response to an authChallenge.",
                optional: true,
                type: "string"
              },
              {
                name: "url",
                description: "If set the request url will be modified in a way that's not observable by page. Must not be\nset in response to an authChallenge.",
                optional: true,
                type: "string"
              },
              {
                name: "method",
                description: "If set this allows the request method to be overridden. Must not be set in response to an\nauthChallenge.",
                optional: true,
                type: "string"
              },
              {
                name: "postData",
                description: "If set this allows postData to be set. Must not be set in response to an authChallenge.",
                optional: true,
                type: "string"
              },
              {
                name: "headers",
                description: "If set this allows the request headers to be changed. Must not be set in response to an\nauthChallenge.",
                optional: true,
                $ref: "Headers"
              },
              {
                name: "authChallengeResponse",
                description: "Response to a requestIntercepted with an authChallenge. Must not be set otherwise.",
                optional: true,
                $ref: "AuthChallengeResponse"
              }
            ]
          },
          {
            name: "deleteCookies",
            description: "Deletes browser cookies with matching name and url or domain/path pair.",
            parameters: [
              {
                name: "name",
                description: "Name of the cookies to remove.",
                type: "string"
              },
              {
                name: "url",
                description: "If specified, deletes all the cookies with the given name where domain and path match\nprovided URL.",
                optional: true,
                type: "string"
              },
              {
                name: "domain",
                description: "If specified, deletes only cookies with the exact domain.",
                optional: true,
                type: "string"
              },
              {
                name: "path",
                description: "If specified, deletes only cookies with the exact path.",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "disable",
            description: "Disables network tracking, prevents network events from being sent to the client."
          },
          {
            name: "emulateNetworkConditions",
            description: "Activates emulation of network conditions.",
            parameters: [
              {
                name: "offline",
                description: "True to emulate internet disconnection.",
                type: "boolean"
              },
              {
                name: "latency",
                description: "Minimum latency from request sent to response headers received (ms).",
                type: "number"
              },
              {
                name: "downloadThroughput",
                description: "Maximal aggregated download throughput (bytes/sec). -1 disables download throttling.",
                type: "number"
              },
              {
                name: "uploadThroughput",
                description: "Maximal aggregated upload throughput (bytes/sec).  -1 disables upload throttling.",
                type: "number"
              },
              {
                name: "connectionType",
                description: "Connection type if known.",
                optional: true,
                $ref: "ConnectionType"
              }
            ]
          },
          {
            name: "enable",
            description: "Enables network tracking, network events will now be delivered to the client.",
            parameters: [
              {
                name: "maxTotalBufferSize",
                description: "Buffer size in bytes to use when preserving network payloads (XHRs, etc).",
                experimental: true,
                optional: true,
                type: "integer"
              },
              {
                name: "maxResourceBufferSize",
                description: "Per-resource buffer size in bytes to use when preserving network payloads (XHRs, etc).",
                experimental: true,
                optional: true,
                type: "integer"
              },
              {
                name: "maxPostDataSize",
                description: "Longest post body size (in bytes) that would be included in requestWillBeSent notification",
                optional: true,
                type: "integer"
              }
            ]
          },
          {
            name: "getAllCookies",
            description: "Returns all browser cookies. Depending on the backend support, will return detailed cookie\ninformation in the `cookies` field.",
            returns: [
              {
                name: "cookies",
                description: "Array of cookie objects.",
                type: "array",
                items: {
                  $ref: "Cookie"
                }
              }
            ]
          },
          {
            name: "getCertificate",
            description: "Returns the DER-encoded certificate.",
            experimental: true,
            parameters: [
              {
                name: "origin",
                description: "Origin to get certificate for.",
                type: "string"
              }
            ],
            returns: [
              {
                name: "tableNames",
                type: "array",
                items: {
                  type: "string"
                }
              }
            ]
          },
          {
            name: "getCookies",
            description: "Returns all browser cookies for the current URL. Depending on the backend support, will return\ndetailed cookie information in the `cookies` field.",
            parameters: [
              {
                name: "urls",
                description: "The list of URLs for which applicable cookies will be fetched",
                optional: true,
                type: "array",
                items: {
                  type: "string"
                }
              }
            ],
            returns: [
              {
                name: "cookies",
                description: "Array of cookie objects.",
                type: "array",
                items: {
                  $ref: "Cookie"
                }
              }
            ]
          },
          {
            name: "getResponseBody",
            description: "Returns content served for the given request.",
            parameters: [
              {
                name: "requestId",
                description: "Identifier of the network request to get content for.",
                $ref: "RequestId"
              }
            ],
            returns: [
              {
                name: "body",
                description: "Response body.",
                type: "string"
              },
              {
                name: "base64Encoded",
                description: "True, if content was sent as base64.",
                type: "boolean"
              }
            ]
          },
          {
            name: "getRequestPostData",
            description: "Returns post data sent with the request. Returns an error when no data was sent with the request.",
            parameters: [
              {
                name: "requestId",
                description: "Identifier of the network request to get content for.",
                $ref: "RequestId"
              }
            ],
            returns: [
              {
                name: "postData",
                description: "Request body string, omitting files from multipart requests",
                type: "string"
              }
            ]
          },
          {
            name: "getResponseBodyForInterception",
            description: "Returns content served for the given currently intercepted request.",
            experimental: true,
            parameters: [
              {
                name: "interceptionId",
                description: "Identifier for the intercepted request to get body for.",
                $ref: "InterceptionId"
              }
            ],
            returns: [
              {
                name: "body",
                description: "Response body.",
                type: "string"
              },
              {
                name: "base64Encoded",
                description: "True, if content was sent as base64.",
                type: "boolean"
              }
            ]
          },
          {
            name: "takeResponseBodyForInterceptionAsStream",
            description: "Returns a handle to the stream representing the response body. Note that after this command,\nthe intercepted request can't be continued as is -- you either need to cancel it or to provide\nthe response body. The stream only supports sequential read, IO.read will fail if the position\nis specified.",
            experimental: true,
            parameters: [
              {
                name: "interceptionId",
                $ref: "InterceptionId"
              }
            ],
            returns: [
              {
                name: "stream",
                $ref: "IO.StreamHandle"
              }
            ]
          },
          {
            name: "replayXHR",
            description: "This method sends a new XMLHttpRequest which is identical to the original one. The following\nparameters should be identical: method, url, async, request body, extra headers, withCredentials\nattribute, user, password.",
            experimental: true,
            parameters: [
              {
                name: "requestId",
                description: "Identifier of XHR to replay.",
                $ref: "RequestId"
              }
            ]
          },
          {
            name: "searchInResponseBody",
            description: "Searches for given string in response content.",
            experimental: true,
            parameters: [
              {
                name: "requestId",
                description: "Identifier of the network response to search.",
                $ref: "RequestId"
              },
              {
                name: "query",
                description: "String to search for.",
                type: "string"
              },
              {
                name: "caseSensitive",
                description: "If true, search is case sensitive.",
                optional: true,
                type: "boolean"
              },
              {
                name: "isRegex",
                description: "If true, treats string parameter as regex.",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "result",
                description: "List of search matches.",
                type: "array",
                items: {
                  $ref: "Debugger.SearchMatch"
                }
              }
            ]
          },
          {
            name: "setBlockedURLs",
            description: "Blocks URLs from loading.",
            experimental: true,
            parameters: [
              {
                name: "urls",
                description: "URL patterns to block. Wildcards ('*') are allowed.",
                type: "array",
                items: {
                  type: "string"
                }
              }
            ]
          },
          {
            name: "setBypassServiceWorker",
            description: "Toggles ignoring of service worker for each request.",
            experimental: true,
            parameters: [
              {
                name: "bypass",
                description: "Bypass service worker and load from network.",
                type: "boolean"
              }
            ]
          },
          {
            name: "setCacheDisabled",
            description: "Toggles ignoring cache for each request. If `true`, cache will not be used.",
            parameters: [
              {
                name: "cacheDisabled",
                description: "Cache disabled state.",
                type: "boolean"
              }
            ]
          },
          {
            name: "setCookie",
            description: "Sets a cookie with the given cookie data; may overwrite equivalent cookies if they exist.",
            parameters: [
              {
                name: "name",
                description: "Cookie name.",
                type: "string"
              },
              {
                name: "value",
                description: "Cookie value.",
                type: "string"
              },
              {
                name: "url",
                description: "The request-URI to associate with the setting of the cookie. This value can affect the\ndefault domain and path values of the created cookie.",
                optional: true,
                type: "string"
              },
              {
                name: "domain",
                description: "Cookie domain.",
                optional: true,
                type: "string"
              },
              {
                name: "path",
                description: "Cookie path.",
                optional: true,
                type: "string"
              },
              {
                name: "secure",
                description: "True if cookie is secure.",
                optional: true,
                type: "boolean"
              },
              {
                name: "httpOnly",
                description: "True if cookie is http-only.",
                optional: true,
                type: "boolean"
              },
              {
                name: "sameSite",
                description: "Cookie SameSite type.",
                optional: true,
                $ref: "CookieSameSite"
              },
              {
                name: "expires",
                description: "Cookie expiration date, session cookie if not set",
                optional: true,
                $ref: "TimeSinceEpoch"
              }
            ],
            returns: [
              {
                name: "success",
                description: "True if successfully set cookie.",
                type: "boolean"
              }
            ]
          },
          {
            name: "setCookies",
            description: "Sets given cookies.",
            parameters: [
              {
                name: "cookies",
                description: "Cookies to be set.",
                type: "array",
                items: {
                  $ref: "CookieParam"
                }
              }
            ]
          },
          {
            name: "setDataSizeLimitsForTest",
            description: "For testing.",
            experimental: true,
            parameters: [
              {
                name: "maxTotalSize",
                description: "Maximum total buffer size.",
                type: "integer"
              },
              {
                name: "maxResourceSize",
                description: "Maximum per-resource size.",
                type: "integer"
              }
            ]
          },
          {
            name: "setExtraHTTPHeaders",
            description: "Specifies whether to always send extra HTTP headers with the requests from this page.",
            parameters: [
              {
                name: "headers",
                description: "Map with extra HTTP headers.",
                $ref: "Headers"
              }
            ]
          },
          {
            name: "setRequestInterception",
            description: "Sets the requests to intercept that match the provided patterns and optionally resource types.\nDeprecated, please use Fetch.enable instead.",
            experimental: true,
            deprecated: true,
            parameters: [
              {
                name: "patterns",
                description: "Requests matching any of these patterns will be forwarded and wait for the corresponding\ncontinueInterceptedRequest call.",
                type: "array",
                items: {
                  $ref: "RequestPattern"
                }
              }
            ]
          },
          {
            name: "setUserAgentOverride",
            description: "Allows overriding user agent with the given string.",
            redirect: "Emulation",
            parameters: [
              {
                name: "userAgent",
                description: "User agent to use.",
                type: "string"
              },
              {
                name: "acceptLanguage",
                description: "Browser langugage to emulate.",
                optional: true,
                type: "string"
              },
              {
                name: "platform",
                description: "The platform navigator.platform should return.",
                optional: true,
                type: "string"
              }
            ]
          }
        ],
        events: [
          {
            name: "dataReceived",
            description: "Fired when data chunk was received over the network.",
            parameters: [
              {
                name: "requestId",
                description: "Request identifier.",
                $ref: "RequestId"
              },
              {
                name: "timestamp",
                description: "Timestamp.",
                $ref: "MonotonicTime"
              },
              {
                name: "dataLength",
                description: "Data chunk length.",
                type: "integer"
              },
              {
                name: "encodedDataLength",
                description: "Actual bytes received (might be less than dataLength for compressed encodings).",
                type: "integer"
              }
            ]
          },
          {
            name: "eventSourceMessageReceived",
            description: "Fired when EventSource message is received.",
            parameters: [
              {
                name: "requestId",
                description: "Request identifier.",
                $ref: "RequestId"
              },
              {
                name: "timestamp",
                description: "Timestamp.",
                $ref: "MonotonicTime"
              },
              {
                name: "eventName",
                description: "Message type.",
                type: "string"
              },
              {
                name: "eventId",
                description: "Message identifier.",
                type: "string"
              },
              {
                name: "data",
                description: "Message content.",
                type: "string"
              }
            ]
          },
          {
            name: "loadingFailed",
            description: "Fired when HTTP request has failed to load.",
            parameters: [
              {
                name: "requestId",
                description: "Request identifier.",
                $ref: "RequestId"
              },
              {
                name: "timestamp",
                description: "Timestamp.",
                $ref: "MonotonicTime"
              },
              {
                name: "type",
                description: "Resource type.",
                $ref: "ResourceType"
              },
              {
                name: "errorText",
                description: "User friendly error message.",
                type: "string"
              },
              {
                name: "canceled",
                description: "True if loading was canceled.",
                optional: true,
                type: "boolean"
              },
              {
                name: "blockedReason",
                description: "The reason why loading was blocked, if any.",
                optional: true,
                $ref: "BlockedReason"
              }
            ]
          },
          {
            name: "loadingFinished",
            description: "Fired when HTTP request has finished loading.",
            parameters: [
              {
                name: "requestId",
                description: "Request identifier.",
                $ref: "RequestId"
              },
              {
                name: "timestamp",
                description: "Timestamp.",
                $ref: "MonotonicTime"
              },
              {
                name: "encodedDataLength",
                description: "Total number of bytes received for this request.",
                type: "number"
              },
              {
                name: "shouldReportCorbBlocking",
                description: "Set when 1) response was blocked by Cross-Origin Read Blocking and also\n2) this needs to be reported to the DevTools console.",
                optional: true,
                type: "boolean"
              }
            ]
          },
          {
            name: "requestIntercepted",
            description: "Details of an intercepted HTTP request, which must be either allowed, blocked, modified or\nmocked.\nDeprecated, use Fetch.requestPaused instead.",
            experimental: true,
            deprecated: true,
            parameters: [
              {
                name: "interceptionId",
                description: "Each request the page makes will have a unique id, however if any redirects are encountered\nwhile processing that fetch, they will be reported with the same id as the original fetch.\nLikewise if HTTP authentication is needed then the same fetch id will be used.",
                $ref: "InterceptionId"
              },
              {
                name: "request",
                $ref: "Request"
              },
              {
                name: "frameId",
                description: "The id of the frame that initiated the request.",
                $ref: "Page.FrameId"
              },
              {
                name: "resourceType",
                description: "How the requested resource will be used.",
                $ref: "ResourceType"
              },
              {
                name: "isNavigationRequest",
                description: "Whether this is a navigation request, which can abort the navigation completely.",
                type: "boolean"
              },
              {
                name: "isDownload",
                description: "Set if the request is a navigation that will result in a download.\nOnly present after response is received from the server (i.e. HeadersReceived stage).",
                optional: true,
                type: "boolean"
              },
              {
                name: "redirectUrl",
                description: "Redirect location, only sent if a redirect was intercepted.",
                optional: true,
                type: "string"
              },
              {
                name: "authChallenge",
                description: "Details of the Authorization Challenge encountered. If this is set then\ncontinueInterceptedRequest must contain an authChallengeResponse.",
                optional: true,
                $ref: "AuthChallenge"
              },
              {
                name: "responseErrorReason",
                description: "Response error if intercepted at response stage or if redirect occurred while intercepting\nrequest.",
                optional: true,
                $ref: "ErrorReason"
              },
              {
                name: "responseStatusCode",
                description: "Response code if intercepted at response stage or if redirect occurred while intercepting\nrequest or auth retry occurred.",
                optional: true,
                type: "integer"
              },
              {
                name: "responseHeaders",
                description: "Response headers if intercepted at the response stage or if redirect occurred while\nintercepting request or auth retry occurred.",
                optional: true,
                $ref: "Headers"
              },
              {
                name: "requestId",
                description: "If the intercepted request had a corresponding requestWillBeSent event fired for it, then\nthis requestId will be the same as the requestId present in the requestWillBeSent event.",
                optional: true,
                $ref: "RequestId"
              }
            ]
          },
          {
            name: "requestServedFromCache",
            description: "Fired if request ended up loading from cache.",
            parameters: [
              {
                name: "requestId",
                description: "Request identifier.",
                $ref: "RequestId"
              }
            ]
          },
          {
            name: "requestWillBeSent",
            description: "Fired when page is about to send HTTP request.",
            parameters: [
              {
                name: "requestId",
                description: "Request identifier.",
                $ref: "RequestId"
              },
              {
                name: "loaderId",
                description: "Loader identifier. Empty string if the request is fetched from worker.",
                $ref: "LoaderId"
              },
              {
                name: "documentURL",
                description: "URL of the document this request is loaded for.",
                type: "string"
              },
              {
                name: "request",
                description: "Request data.",
                $ref: "Request"
              },
              {
                name: "timestamp",
                description: "Timestamp.",
                $ref: "MonotonicTime"
              },
              {
                name: "wallTime",
                description: "Timestamp.",
                $ref: "TimeSinceEpoch"
              },
              {
                name: "initiator",
                description: "Request initiator.",
                $ref: "Initiator"
              },
              {
                name: "redirectResponse",
                description: "Redirect response data.",
                optional: true,
                $ref: "Response"
              },
              {
                name: "type",
                description: "Type of this resource.",
                optional: true,
                $ref: "ResourceType"
              },
              {
                name: "frameId",
                description: "Frame identifier.",
                optional: true,
                $ref: "Page.FrameId"
              },
              {
                name: "hasUserGesture",
                description: "Whether the request is initiated by a user gesture. Defaults to false.",
                optional: true,
                type: "boolean"
              }
            ]
          },
          {
            name: "resourceChangedPriority",
            description: "Fired when resource loading priority is changed",
            experimental: true,
            parameters: [
              {
                name: "requestId",
                description: "Request identifier.",
                $ref: "RequestId"
              },
              {
                name: "newPriority",
                description: "New priority",
                $ref: "ResourcePriority"
              },
              {
                name: "timestamp",
                description: "Timestamp.",
                $ref: "MonotonicTime"
              }
            ]
          },
          {
            name: "signedExchangeReceived",
            description: "Fired when a signed exchange was received over the network",
            experimental: true,
            parameters: [
              {
                name: "requestId",
                description: "Request identifier.",
                $ref: "RequestId"
              },
              {
                name: "info",
                description: "Information about the signed exchange response.",
                $ref: "SignedExchangeInfo"
              }
            ]
          },
          {
            name: "responseReceived",
            description: "Fired when HTTP response is available.",
            parameters: [
              {
                name: "requestId",
                description: "Request identifier.",
                $ref: "RequestId"
              },
              {
                name: "loaderId",
                description: "Loader identifier. Empty string if the request is fetched from worker.",
                $ref: "LoaderId"
              },
              {
                name: "timestamp",
                description: "Timestamp.",
                $ref: "MonotonicTime"
              },
              {
                name: "type",
                description: "Resource type.",
                $ref: "ResourceType"
              },
              {
                name: "response",
                description: "Response data.",
                $ref: "Response"
              },
              {
                name: "frameId",
                description: "Frame identifier.",
                optional: true,
                $ref: "Page.FrameId"
              }
            ]
          },
          {
            name: "webSocketClosed",
            description: "Fired when WebSocket is closed.",
            parameters: [
              {
                name: "requestId",
                description: "Request identifier.",
                $ref: "RequestId"
              },
              {
                name: "timestamp",
                description: "Timestamp.",
                $ref: "MonotonicTime"
              }
            ]
          },
          {
            name: "webSocketCreated",
            description: "Fired upon WebSocket creation.",
            parameters: [
              {
                name: "requestId",
                description: "Request identifier.",
                $ref: "RequestId"
              },
              {
                name: "url",
                description: "WebSocket request URL.",
                type: "string"
              },
              {
                name: "initiator",
                description: "Request initiator.",
                optional: true,
                $ref: "Initiator"
              }
            ]
          },
          {
            name: "webSocketFrameError",
            description: "Fired when WebSocket message error occurs.",
            parameters: [
              {
                name: "requestId",
                description: "Request identifier.",
                $ref: "RequestId"
              },
              {
                name: "timestamp",
                description: "Timestamp.",
                $ref: "MonotonicTime"
              },
              {
                name: "errorMessage",
                description: "WebSocket error message.",
                type: "string"
              }
            ]
          },
          {
            name: "webSocketFrameReceived",
            description: "Fired when WebSocket message is received.",
            parameters: [
              {
                name: "requestId",
                description: "Request identifier.",
                $ref: "RequestId"
              },
              {
                name: "timestamp",
                description: "Timestamp.",
                $ref: "MonotonicTime"
              },
              {
                name: "response",
                description: "WebSocket response data.",
                $ref: "WebSocketFrame"
              }
            ]
          },
          {
            name: "webSocketFrameSent",
            description: "Fired when WebSocket message is sent.",
            parameters: [
              {
                name: "requestId",
                description: "Request identifier.",
                $ref: "RequestId"
              },
              {
                name: "timestamp",
                description: "Timestamp.",
                $ref: "MonotonicTime"
              },
              {
                name: "response",
                description: "WebSocket response data.",
                $ref: "WebSocketFrame"
              }
            ]
          },
          {
            name: "webSocketHandshakeResponseReceived",
            description: "Fired when WebSocket handshake response becomes available.",
            parameters: [
              {
                name: "requestId",
                description: "Request identifier.",
                $ref: "RequestId"
              },
              {
                name: "timestamp",
                description: "Timestamp.",
                $ref: "MonotonicTime"
              },
              {
                name: "response",
                description: "WebSocket response data.",
                $ref: "WebSocketResponse"
              }
            ]
          },
          {
            name: "webSocketWillSendHandshakeRequest",
            description: "Fired when WebSocket is about to initiate handshake.",
            parameters: [
              {
                name: "requestId",
                description: "Request identifier.",
                $ref: "RequestId"
              },
              {
                name: "timestamp",
                description: "Timestamp.",
                $ref: "MonotonicTime"
              },
              {
                name: "wallTime",
                description: "UTC Timestamp.",
                $ref: "TimeSinceEpoch"
              },
              {
                name: "request",
                description: "WebSocket request data.",
                $ref: "WebSocketRequest"
              }
            ]
          }
        ]
      },
      {
        domain: "Overlay",
        description: "This domain provides various functionality related to drawing atop the inspected page.",
        experimental: true,
        dependencies: [
          "DOM",
          "Page",
          "Runtime"
        ],
        types: [
          {
            id: "HighlightConfig",
            description: "Configuration data for the highlighting of page elements.",
            type: "object",
            properties: [
              {
                name: "showInfo",
                description: "Whether the node info tooltip should be shown (default: false).",
                optional: true,
                type: "boolean"
              },
              {
                name: "showStyles",
                description: "Whether the node styles in the tooltip (default: false).",
                optional: true,
                type: "boolean"
              },
              {
                name: "showRulers",
                description: "Whether the rulers should be shown (default: false).",
                optional: true,
                type: "boolean"
              },
              {
                name: "showExtensionLines",
                description: "Whether the extension lines from node to the rulers should be shown (default: false).",
                optional: true,
                type: "boolean"
              },
              {
                name: "contentColor",
                description: "The content box highlight fill color (default: transparent).",
                optional: true,
                $ref: "DOM.RGBA"
              },
              {
                name: "paddingColor",
                description: "The padding highlight fill color (default: transparent).",
                optional: true,
                $ref: "DOM.RGBA"
              },
              {
                name: "borderColor",
                description: "The border highlight fill color (default: transparent).",
                optional: true,
                $ref: "DOM.RGBA"
              },
              {
                name: "marginColor",
                description: "The margin highlight fill color (default: transparent).",
                optional: true,
                $ref: "DOM.RGBA"
              },
              {
                name: "eventTargetColor",
                description: "The event target element highlight fill color (default: transparent).",
                optional: true,
                $ref: "DOM.RGBA"
              },
              {
                name: "shapeColor",
                description: "The shape outside fill color (default: transparent).",
                optional: true,
                $ref: "DOM.RGBA"
              },
              {
                name: "shapeMarginColor",
                description: "The shape margin fill color (default: transparent).",
                optional: true,
                $ref: "DOM.RGBA"
              },
              {
                name: "cssGridColor",
                description: "The grid layout color (default: transparent).",
                optional: true,
                $ref: "DOM.RGBA"
              }
            ]
          },
          {
            id: "InspectMode",
            type: "string",
            enum: [
              "searchForNode",
              "searchForUAShadowDOM",
              "captureAreaScreenshot",
              "showDistances",
              "none"
            ]
          }
        ],
        commands: [
          {
            name: "disable",
            description: "Disables domain notifications."
          },
          {
            name: "enable",
            description: "Enables domain notifications."
          },
          {
            name: "getHighlightObjectForTest",
            description: "For testing.",
            parameters: [
              {
                name: "nodeId",
                description: "Id of the node to get highlight object for.",
                $ref: "DOM.NodeId"
              },
              {
                name: "includeDistance",
                description: "Whether to include distance info.",
                optional: true,
                type: "boolean"
              },
              {
                name: "includeStyle",
                description: "Whether to include style info.",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "highlight",
                description: "Highlight data for the node.",
                type: "object"
              }
            ]
          },
          {
            name: "hideHighlight",
            description: "Hides any highlight."
          },
          {
            name: "highlightFrame",
            description: "Highlights owner element of the frame with given id.",
            parameters: [
              {
                name: "frameId",
                description: "Identifier of the frame to highlight.",
                $ref: "Page.FrameId"
              },
              {
                name: "contentColor",
                description: "The content box highlight fill color (default: transparent).",
                optional: true,
                $ref: "DOM.RGBA"
              },
              {
                name: "contentOutlineColor",
                description: "The content box highlight outline color (default: transparent).",
                optional: true,
                $ref: "DOM.RGBA"
              }
            ]
          },
          {
            name: "highlightNode",
            description: "Highlights DOM node with given id or with the given JavaScript object wrapper. Either nodeId or\nobjectId must be specified.",
            parameters: [
              {
                name: "highlightConfig",
                description: "A descriptor for the highlight appearance.",
                $ref: "HighlightConfig"
              },
              {
                name: "nodeId",
                description: "Identifier of the node to highlight.",
                optional: true,
                $ref: "DOM.NodeId"
              },
              {
                name: "backendNodeId",
                description: "Identifier of the backend node to highlight.",
                optional: true,
                $ref: "DOM.BackendNodeId"
              },
              {
                name: "objectId",
                description: "JavaScript object id of the node to be highlighted.",
                optional: true,
                $ref: "Runtime.RemoteObjectId"
              },
              {
                name: "selector",
                description: "Selectors to highlight relevant nodes.",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "highlightQuad",
            description: "Highlights given quad. Coordinates are absolute with respect to the main frame viewport.",
            parameters: [
              {
                name: "quad",
                description: "Quad to highlight",
                $ref: "DOM.Quad"
              },
              {
                name: "color",
                description: "The highlight fill color (default: transparent).",
                optional: true,
                $ref: "DOM.RGBA"
              },
              {
                name: "outlineColor",
                description: "The highlight outline color (default: transparent).",
                optional: true,
                $ref: "DOM.RGBA"
              }
            ]
          },
          {
            name: "highlightRect",
            description: "Highlights given rectangle. Coordinates are absolute with respect to the main frame viewport.",
            parameters: [
              {
                name: "x",
                description: "X coordinate",
                type: "integer"
              },
              {
                name: "y",
                description: "Y coordinate",
                type: "integer"
              },
              {
                name: "width",
                description: "Rectangle width",
                type: "integer"
              },
              {
                name: "height",
                description: "Rectangle height",
                type: "integer"
              },
              {
                name: "color",
                description: "The highlight fill color (default: transparent).",
                optional: true,
                $ref: "DOM.RGBA"
              },
              {
                name: "outlineColor",
                description: "The highlight outline color (default: transparent).",
                optional: true,
                $ref: "DOM.RGBA"
              }
            ]
          },
          {
            name: "setInspectMode",
            description: "Enters the 'inspect' mode. In this mode, elements that user is hovering over are highlighted.\nBackend then generates 'inspectNodeRequested' event upon element selection.",
            parameters: [
              {
                name: "mode",
                description: "Set an inspection mode.",
                $ref: "InspectMode"
              },
              {
                name: "highlightConfig",
                description: "A descriptor for the highlight appearance of hovered-over nodes. May be omitted if `enabled\n== false`.",
                optional: true,
                $ref: "HighlightConfig"
              }
            ]
          },
          {
            name: "setShowAdHighlights",
            description: "Highlights owner element of all frames detected to be ads.",
            parameters: [
              {
                name: "show",
                description: "True for showing ad highlights",
                type: "boolean"
              }
            ]
          },
          {
            name: "setPausedInDebuggerMessage",
            parameters: [
              {
                name: "message",
                description: "The message to display, also triggers resume and step over controls.",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "setShowDebugBorders",
            description: "Requests that backend shows debug borders on layers",
            parameters: [
              {
                name: "show",
                description: "True for showing debug borders",
                type: "boolean"
              }
            ]
          },
          {
            name: "setShowFPSCounter",
            description: "Requests that backend shows the FPS counter",
            parameters: [
              {
                name: "show",
                description: "True for showing the FPS counter",
                type: "boolean"
              }
            ]
          },
          {
            name: "setShowPaintRects",
            description: "Requests that backend shows paint rectangles",
            parameters: [
              {
                name: "result",
                description: "True for showing paint rectangles",
                type: "boolean"
              }
            ]
          },
          {
            name: "setShowLayoutShiftRegions",
            description: "Requests that backend shows layout shift regions",
            parameters: [
              {
                name: "result",
                description: "True for showing layout shift regions",
                type: "boolean"
              }
            ]
          },
          {
            name: "setShowScrollBottleneckRects",
            description: "Requests that backend shows scroll bottleneck rects",
            parameters: [
              {
                name: "show",
                description: "True for showing scroll bottleneck rects",
                type: "boolean"
              }
            ]
          },
          {
            name: "setShowHitTestBorders",
            description: "Requests that backend shows hit-test borders on layers",
            parameters: [
              {
                name: "show",
                description: "True for showing hit-test borders",
                type: "boolean"
              }
            ]
          },
          {
            name: "setShowViewportSizeOnResize",
            description: "Paints viewport size upon main frame resize.",
            parameters: [
              {
                name: "show",
                description: "Whether to paint size or not.",
                type: "boolean"
              }
            ]
          }
        ],
        events: [
          {
            name: "inspectNodeRequested",
            description: "Fired when the node should be inspected. This happens after call to `setInspectMode` or when\nuser manually inspects an element.",
            parameters: [
              {
                name: "backendNodeId",
                description: "Id of the node to inspect.",
                $ref: "DOM.BackendNodeId"
              }
            ]
          },
          {
            name: "nodeHighlightRequested",
            description: "Fired when the node should be highlighted. This happens after call to `setInspectMode`.",
            parameters: [
              {
                name: "nodeId",
                $ref: "DOM.NodeId"
              }
            ]
          },
          {
            name: "screenshotRequested",
            description: "Fired when user asks to capture screenshot of some area on the page.",
            parameters: [
              {
                name: "viewport",
                description: "Viewport to capture, in device independent pixels (dip).",
                $ref: "Page.Viewport"
              }
            ]
          },
          {
            name: "inspectModeCanceled",
            description: "Fired when user cancels the inspect mode."
          }
        ]
      },
      {
        domain: "Page",
        description: "Actions and events related to the inspected page belong to the page domain.",
        dependencies: [
          "Debugger",
          "DOM",
          "IO",
          "Network",
          "Runtime"
        ],
        types: [
          {
            id: "FrameId",
            description: "Unique frame identifier.",
            type: "string"
          },
          {
            id: "Frame",
            description: "Information about the Frame on the page.",
            type: "object",
            properties: [
              {
                name: "id",
                description: "Frame unique identifier.",
                type: "string"
              },
              {
                name: "parentId",
                description: "Parent frame identifier.",
                optional: true,
                type: "string"
              },
              {
                name: "loaderId",
                description: "Identifier of the loader associated with this frame.",
                $ref: "Network.LoaderId"
              },
              {
                name: "name",
                description: "Frame's name as specified in the tag.",
                optional: true,
                type: "string"
              },
              {
                name: "url",
                description: "Frame document's URL without fragment.",
                type: "string"
              },
              {
                name: "urlFragment",
                description: "Frame document's URL fragment including the '#'.",
                experimental: true,
                optional: true,
                type: "string"
              },
              {
                name: "securityOrigin",
                description: "Frame document's security origin.",
                type: "string"
              },
              {
                name: "mimeType",
                description: "Frame document's mimeType as determined by the browser.",
                type: "string"
              },
              {
                name: "unreachableUrl",
                description: "If the frame failed to load, this contains the URL that could not be loaded. Note that unlike url above, this URL may contain a fragment.",
                experimental: true,
                optional: true,
                type: "string"
              }
            ]
          },
          {
            id: "FrameResource",
            description: "Information about the Resource on the page.",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "url",
                description: "Resource URL.",
                type: "string"
              },
              {
                name: "type",
                description: "Type of this resource.",
                $ref: "Network.ResourceType"
              },
              {
                name: "mimeType",
                description: "Resource mimeType as determined by the browser.",
                type: "string"
              },
              {
                name: "lastModified",
                description: "last-modified timestamp as reported by server.",
                optional: true,
                $ref: "Network.TimeSinceEpoch"
              },
              {
                name: "contentSize",
                description: "Resource content size.",
                optional: true,
                type: "number"
              },
              {
                name: "failed",
                description: "True if the resource failed to load.",
                optional: true,
                type: "boolean"
              },
              {
                name: "canceled",
                description: "True if the resource was canceled during loading.",
                optional: true,
                type: "boolean"
              }
            ]
          },
          {
            id: "FrameResourceTree",
            description: "Information about the Frame hierarchy along with their cached resources.",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "frame",
                description: "Frame information for this tree item.",
                $ref: "Frame"
              },
              {
                name: "childFrames",
                description: "Child frames.",
                optional: true,
                type: "array",
                items: {
                  $ref: "FrameResourceTree"
                }
              },
              {
                name: "resources",
                description: "Information about frame resources.",
                type: "array",
                items: {
                  $ref: "FrameResource"
                }
              }
            ]
          },
          {
            id: "FrameTree",
            description: "Information about the Frame hierarchy.",
            type: "object",
            properties: [
              {
                name: "frame",
                description: "Frame information for this tree item.",
                $ref: "Frame"
              },
              {
                name: "childFrames",
                description: "Child frames.",
                optional: true,
                type: "array",
                items: {
                  $ref: "FrameTree"
                }
              }
            ]
          },
          {
            id: "ScriptIdentifier",
            description: "Unique script identifier.",
            type: "string"
          },
          {
            id: "TransitionType",
            description: "Transition type.",
            type: "string",
            enum: [
              "link",
              "typed",
              "address_bar",
              "auto_bookmark",
              "auto_subframe",
              "manual_subframe",
              "generated",
              "auto_toplevel",
              "form_submit",
              "reload",
              "keyword",
              "keyword_generated",
              "other"
            ]
          },
          {
            id: "NavigationEntry",
            description: "Navigation history entry.",
            type: "object",
            properties: [
              {
                name: "id",
                description: "Unique id of the navigation history entry.",
                type: "integer"
              },
              {
                name: "url",
                description: "URL of the navigation history entry.",
                type: "string"
              },
              {
                name: "userTypedURL",
                description: "URL that the user typed in the url bar.",
                type: "string"
              },
              {
                name: "title",
                description: "Title of the navigation history entry.",
                type: "string"
              },
              {
                name: "transitionType",
                description: "Transition type.",
                $ref: "TransitionType"
              }
            ]
          },
          {
            id: "ScreencastFrameMetadata",
            description: "Screencast frame metadata.",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "offsetTop",
                description: "Top offset in DIP.",
                type: "number"
              },
              {
                name: "pageScaleFactor",
                description: "Page scale factor.",
                type: "number"
              },
              {
                name: "deviceWidth",
                description: "Device screen width in DIP.",
                type: "number"
              },
              {
                name: "deviceHeight",
                description: "Device screen height in DIP.",
                type: "number"
              },
              {
                name: "scrollOffsetX",
                description: "Position of horizontal scroll in CSS pixels.",
                type: "number"
              },
              {
                name: "scrollOffsetY",
                description: "Position of vertical scroll in CSS pixels.",
                type: "number"
              },
              {
                name: "timestamp",
                description: "Frame swap timestamp.",
                optional: true,
                $ref: "Network.TimeSinceEpoch"
              }
            ]
          },
          {
            id: "DialogType",
            description: "Javascript dialog type.",
            type: "string",
            enum: [
              "alert",
              "confirm",
              "prompt",
              "beforeunload"
            ]
          },
          {
            id: "AppManifestError",
            description: "Error while paring app manifest.",
            type: "object",
            properties: [
              {
                name: "message",
                description: "Error message.",
                type: "string"
              },
              {
                name: "critical",
                description: "If criticial, this is a non-recoverable parse error.",
                type: "integer"
              },
              {
                name: "line",
                description: "Error line.",
                type: "integer"
              },
              {
                name: "column",
                description: "Error column.",
                type: "integer"
              }
            ]
          },
          {
            id: "LayoutViewport",
            description: "Layout viewport position and dimensions.",
            type: "object",
            properties: [
              {
                name: "pageX",
                description: "Horizontal offset relative to the document (CSS pixels).",
                type: "integer"
              },
              {
                name: "pageY",
                description: "Vertical offset relative to the document (CSS pixels).",
                type: "integer"
              },
              {
                name: "clientWidth",
                description: "Width (CSS pixels), excludes scrollbar if present.",
                type: "integer"
              },
              {
                name: "clientHeight",
                description: "Height (CSS pixels), excludes scrollbar if present.",
                type: "integer"
              }
            ]
          },
          {
            id: "VisualViewport",
            description: "Visual viewport position, dimensions, and scale.",
            type: "object",
            properties: [
              {
                name: "offsetX",
                description: "Horizontal offset relative to the layout viewport (CSS pixels).",
                type: "number"
              },
              {
                name: "offsetY",
                description: "Vertical offset relative to the layout viewport (CSS pixels).",
                type: "number"
              },
              {
                name: "pageX",
                description: "Horizontal offset relative to the document (CSS pixels).",
                type: "number"
              },
              {
                name: "pageY",
                description: "Vertical offset relative to the document (CSS pixels).",
                type: "number"
              },
              {
                name: "clientWidth",
                description: "Width (CSS pixels), excludes scrollbar if present.",
                type: "number"
              },
              {
                name: "clientHeight",
                description: "Height (CSS pixels), excludes scrollbar if present.",
                type: "number"
              },
              {
                name: "scale",
                description: "Scale relative to the ideal viewport (size at width=device-width).",
                type: "number"
              },
              {
                name: "zoom",
                description: "Page zoom factor (CSS to device independent pixels ratio).",
                optional: true,
                type: "number"
              }
            ]
          },
          {
            id: "Viewport",
            description: "Viewport for capturing screenshot.",
            type: "object",
            properties: [
              {
                name: "x",
                description: "X offset in device independent pixels (dip).",
                type: "number"
              },
              {
                name: "y",
                description: "Y offset in device independent pixels (dip).",
                type: "number"
              },
              {
                name: "width",
                description: "Rectangle width in device independent pixels (dip).",
                type: "number"
              },
              {
                name: "height",
                description: "Rectangle height in device independent pixels (dip).",
                type: "number"
              },
              {
                name: "scale",
                description: "Page scale factor.",
                type: "number"
              }
            ]
          },
          {
            id: "FontFamilies",
            description: "Generic font families collection.",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "standard",
                description: "The standard font-family.",
                optional: true,
                type: "string"
              },
              {
                name: "fixed",
                description: "The fixed font-family.",
                optional: true,
                type: "string"
              },
              {
                name: "serif",
                description: "The serif font-family.",
                optional: true,
                type: "string"
              },
              {
                name: "sansSerif",
                description: "The sansSerif font-family.",
                optional: true,
                type: "string"
              },
              {
                name: "cursive",
                description: "The cursive font-family.",
                optional: true,
                type: "string"
              },
              {
                name: "fantasy",
                description: "The fantasy font-family.",
                optional: true,
                type: "string"
              },
              {
                name: "pictograph",
                description: "The pictograph font-family.",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            id: "FontSizes",
            description: "Default font sizes.",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "standard",
                description: "Default standard font size.",
                optional: true,
                type: "integer"
              },
              {
                name: "fixed",
                description: "Default fixed font size.",
                optional: true,
                type: "integer"
              }
            ]
          },
          {
            id: "ClientNavigationReason",
            experimental: true,
            type: "string",
            enum: [
              "formSubmissionGet",
              "formSubmissionPost",
              "httpHeaderRefresh",
              "scriptInitiated",
              "metaTagRefresh",
              "pageBlockInterstitial",
              "reload"
            ]
          }
        ],
        commands: [
          {
            name: "addScriptToEvaluateOnLoad",
            description: "Deprecated, please use addScriptToEvaluateOnNewDocument instead.",
            experimental: true,
            deprecated: true,
            parameters: [
              {
                name: "scriptSource",
                type: "string"
              }
            ],
            returns: [
              {
                name: "identifier",
                description: "Identifier of the added script.",
                $ref: "ScriptIdentifier"
              }
            ]
          },
          {
            name: "addScriptToEvaluateOnNewDocument",
            description: "Evaluates given script in every frame upon creation (before loading frame's scripts).",
            parameters: [
              {
                name: "source",
                type: "string"
              },
              {
                name: "worldName",
                description: "If specified, creates an isolated world with the given name and evaluates given script in it.\nThis world name will be used as the ExecutionContextDescription::name when the corresponding\nevent is emitted.",
                experimental: true,
                optional: true,
                type: "string"
              }
            ],
            returns: [
              {
                name: "identifier",
                description: "Identifier of the added script.",
                $ref: "ScriptIdentifier"
              }
            ]
          },
          {
            name: "bringToFront",
            description: "Brings page to front (activates tab)."
          },
          {
            name: "captureScreenshot",
            description: "Capture page screenshot.",
            parameters: [
              {
                name: "format",
                description: "Image compression format (defaults to png).",
                optional: true,
                type: "string",
                enum: [
                  "jpeg",
                  "png"
                ]
              },
              {
                name: "quality",
                description: "Compression quality from range [0..100] (jpeg only).",
                optional: true,
                type: "integer"
              },
              {
                name: "clip",
                description: "Capture the screenshot of a given region only.",
                optional: true,
                $ref: "Viewport"
              },
              {
                name: "fromSurface",
                description: "Capture the screenshot from the surface, rather than the view. Defaults to true.",
                experimental: true,
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "data",
                description: "Base64-encoded image data.",
                type: "string"
              }
            ]
          },
          {
            name: "captureSnapshot",
            description: "Returns a snapshot of the page as a string. For MHTML format, the serialization includes\niframes, shadow DOM, external resources, and element-inline styles.",
            experimental: true,
            parameters: [
              {
                name: "format",
                description: "Format (defaults to mhtml).",
                optional: true,
                type: "string",
                enum: [
                  "mhtml"
                ]
              }
            ],
            returns: [
              {
                name: "data",
                description: "Serialized page data.",
                type: "string"
              }
            ]
          },
          {
            name: "clearDeviceMetricsOverride",
            description: "Clears the overriden device metrics.",
            experimental: true,
            deprecated: true,
            redirect: "Emulation"
          },
          {
            name: "clearDeviceOrientationOverride",
            description: "Clears the overridden Device Orientation.",
            experimental: true,
            deprecated: true,
            redirect: "DeviceOrientation"
          },
          {
            name: "clearGeolocationOverride",
            description: "Clears the overriden Geolocation Position and Error.",
            deprecated: true,
            redirect: "Emulation"
          },
          {
            name: "createIsolatedWorld",
            description: "Creates an isolated world for the given frame.",
            parameters: [
              {
                name: "frameId",
                description: "Id of the frame in which the isolated world should be created.",
                $ref: "FrameId"
              },
              {
                name: "worldName",
                description: "An optional name which is reported in the Execution Context.",
                optional: true,
                type: "string"
              },
              {
                name: "grantUniveralAccess",
                description: "Whether or not universal access should be granted to the isolated world. This is a powerful\noption, use with caution.",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "executionContextId",
                description: "Execution context of the isolated world.",
                $ref: "Runtime.ExecutionContextId"
              }
            ]
          },
          {
            name: "deleteCookie",
            description: "Deletes browser cookie with given name, domain and path.",
            experimental: true,
            deprecated: true,
            redirect: "Network",
            parameters: [
              {
                name: "cookieName",
                description: "Name of the cookie to remove.",
                type: "string"
              },
              {
                name: "url",
                description: "URL to match cooke domain and path.",
                type: "string"
              }
            ]
          },
          {
            name: "disable",
            description: "Disables page domain notifications."
          },
          {
            name: "enable",
            description: "Enables page domain notifications."
          },
          {
            name: "getAppManifest",
            returns: [
              {
                name: "url",
                description: "Manifest location.",
                type: "string"
              },
              {
                name: "errors",
                type: "array",
                items: {
                  $ref: "AppManifestError"
                }
              },
              {
                name: "data",
                description: "Manifest content.",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "getInstallabilityErrors",
            experimental: true,
            returns: [
              {
                name: "errors",
                type: "array",
                items: {
                  type: "string"
                }
              }
            ]
          },
          {
            name: "getCookies",
            description: "Returns all browser cookies. Depending on the backend support, will return detailed cookie\ninformation in the `cookies` field.",
            experimental: true,
            deprecated: true,
            redirect: "Network",
            returns: [
              {
                name: "cookies",
                description: "Array of cookie objects.",
                type: "array",
                items: {
                  $ref: "Network.Cookie"
                }
              }
            ]
          },
          {
            name: "getFrameTree",
            description: "Returns present frame tree structure.",
            returns: [
              {
                name: "frameTree",
                description: "Present frame tree structure.",
                $ref: "FrameTree"
              }
            ]
          },
          {
            name: "getLayoutMetrics",
            description: "Returns metrics relating to the layouting of the page, such as viewport bounds/scale.",
            returns: [
              {
                name: "layoutViewport",
                description: "Metrics relating to the layout viewport.",
                $ref: "LayoutViewport"
              },
              {
                name: "visualViewport",
                description: "Metrics relating to the visual viewport.",
                $ref: "VisualViewport"
              },
              {
                name: "contentSize",
                description: "Size of scrollable area.",
                $ref: "DOM.Rect"
              }
            ]
          },
          {
            name: "getNavigationHistory",
            description: "Returns navigation history for the current page.",
            returns: [
              {
                name: "currentIndex",
                description: "Index of the current navigation history entry.",
                type: "integer"
              },
              {
                name: "entries",
                description: "Array of navigation history entries.",
                type: "array",
                items: {
                  $ref: "NavigationEntry"
                }
              }
            ]
          },
          {
            name: "resetNavigationHistory",
            description: "Resets navigation history for the current page."
          },
          {
            name: "getResourceContent",
            description: "Returns content of the given resource.",
            experimental: true,
            parameters: [
              {
                name: "frameId",
                description: "Frame id to get resource for.",
                $ref: "FrameId"
              },
              {
                name: "url",
                description: "URL of the resource to get content for.",
                type: "string"
              }
            ],
            returns: [
              {
                name: "content",
                description: "Resource content.",
                type: "string"
              },
              {
                name: "base64Encoded",
                description: "True, if content was served as base64.",
                type: "boolean"
              }
            ]
          },
          {
            name: "getResourceTree",
            description: "Returns present frame / resource tree structure.",
            experimental: true,
            returns: [
              {
                name: "frameTree",
                description: "Present frame / resource tree structure.",
                $ref: "FrameResourceTree"
              }
            ]
          },
          {
            name: "handleJavaScriptDialog",
            description: "Accepts or dismisses a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload).",
            parameters: [
              {
                name: "accept",
                description: "Whether to accept or dismiss the dialog.",
                type: "boolean"
              },
              {
                name: "promptText",
                description: "The text to enter into the dialog prompt before accepting. Used only if this is a prompt\ndialog.",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "navigate",
            description: "Navigates current page to the given URL.",
            parameters: [
              {
                name: "url",
                description: "URL to navigate the page to.",
                type: "string"
              },
              {
                name: "referrer",
                description: "Referrer URL.",
                optional: true,
                type: "string"
              },
              {
                name: "transitionType",
                description: "Intended transition type.",
                optional: true,
                $ref: "TransitionType"
              },
              {
                name: "frameId",
                description: "Frame id to navigate, if not specified navigates the top frame.",
                optional: true,
                $ref: "FrameId"
              }
            ],
            returns: [
              {
                name: "frameId",
                description: "Frame id that has navigated (or failed to navigate)",
                $ref: "FrameId"
              },
              {
                name: "loaderId",
                description: "Loader identifier.",
                optional: true,
                $ref: "Network.LoaderId"
              },
              {
                name: "errorText",
                description: "User friendly error message, present if and only if navigation has failed.",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "navigateToHistoryEntry",
            description: "Navigates current page to the given history entry.",
            parameters: [
              {
                name: "entryId",
                description: "Unique id of the entry to navigate to.",
                type: "integer"
              }
            ]
          },
          {
            name: "printToPDF",
            description: "Print page as PDF.",
            parameters: [
              {
                name: "landscape",
                description: "Paper orientation. Defaults to false.",
                optional: true,
                type: "boolean"
              },
              {
                name: "displayHeaderFooter",
                description: "Display header and footer. Defaults to false.",
                optional: true,
                type: "boolean"
              },
              {
                name: "printBackground",
                description: "Print background graphics. Defaults to false.",
                optional: true,
                type: "boolean"
              },
              {
                name: "scale",
                description: "Scale of the webpage rendering. Defaults to 1.",
                optional: true,
                type: "number"
              },
              {
                name: "paperWidth",
                description: "Paper width in inches. Defaults to 8.5 inches.",
                optional: true,
                type: "number"
              },
              {
                name: "paperHeight",
                description: "Paper height in inches. Defaults to 11 inches.",
                optional: true,
                type: "number"
              },
              {
                name: "marginTop",
                description: "Top margin in inches. Defaults to 1cm (~0.4 inches).",
                optional: true,
                type: "number"
              },
              {
                name: "marginBottom",
                description: "Bottom margin in inches. Defaults to 1cm (~0.4 inches).",
                optional: true,
                type: "number"
              },
              {
                name: "marginLeft",
                description: "Left margin in inches. Defaults to 1cm (~0.4 inches).",
                optional: true,
                type: "number"
              },
              {
                name: "marginRight",
                description: "Right margin in inches. Defaults to 1cm (~0.4 inches).",
                optional: true,
                type: "number"
              },
              {
                name: "pageRanges",
                description: "Paper ranges to print, e.g., '1-5, 8, 11-13'. Defaults to the empty string, which means\nprint all pages.",
                optional: true,
                type: "string"
              },
              {
                name: "ignoreInvalidPageRanges",
                description: "Whether to silently ignore invalid but successfully parsed page ranges, such as '3-2'.\nDefaults to false.",
                optional: true,
                type: "boolean"
              },
              {
                name: "headerTemplate",
                description: "HTML template for the print header. Should be valid HTML markup with following\nclasses used to inject printing values into them:\n- `date`: formatted print date\n- `title`: document title\n- `url`: document location\n- `pageNumber`: current page number\n- `totalPages`: total pages in the document\n\nFor example, `<span class=title></span>` would generate span containing the title.",
                optional: true,
                type: "string"
              },
              {
                name: "footerTemplate",
                description: "HTML template for the print footer. Should use the same format as the `headerTemplate`.",
                optional: true,
                type: "string"
              },
              {
                name: "preferCSSPageSize",
                description: "Whether or not to prefer page size as defined by css. Defaults to false,\nin which case the content will be scaled to fit the paper size.",
                optional: true,
                type: "boolean"
              },
              {
                name: "transferMode",
                description: "return as stream",
                experimental: true,
                optional: true,
                type: "string",
                enum: [
                  "ReturnAsBase64",
                  "ReturnAsStream"
                ]
              }
            ],
            returns: [
              {
                name: "data",
                description: "Base64-encoded pdf data. Empty if |returnAsStream| is specified.",
                type: "string"
              },
              {
                name: "stream",
                description: "A handle of the stream that holds resulting PDF data.",
                experimental: true,
                optional: true,
                $ref: "IO.StreamHandle"
              }
            ]
          },
          {
            name: "reload",
            description: "Reloads given page optionally ignoring the cache.",
            parameters: [
              {
                name: "ignoreCache",
                description: "If true, browser cache is ignored (as if the user pressed Shift+refresh).",
                optional: true,
                type: "boolean"
              },
              {
                name: "scriptToEvaluateOnLoad",
                description: "If set, the script will be injected into all frames of the inspected page after reload.\nArgument will be ignored if reloading dataURL origin.",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "removeScriptToEvaluateOnLoad",
            description: "Deprecated, please use removeScriptToEvaluateOnNewDocument instead.",
            experimental: true,
            deprecated: true,
            parameters: [
              {
                name: "identifier",
                $ref: "ScriptIdentifier"
              }
            ]
          },
          {
            name: "removeScriptToEvaluateOnNewDocument",
            description: "Removes given script from the list.",
            parameters: [
              {
                name: "identifier",
                $ref: "ScriptIdentifier"
              }
            ]
          },
          {
            name: "screencastFrameAck",
            description: "Acknowledges that a screencast frame has been received by the frontend.",
            experimental: true,
            parameters: [
              {
                name: "sessionId",
                description: "Frame number.",
                type: "integer"
              }
            ]
          },
          {
            name: "searchInResource",
            description: "Searches for given string in resource content.",
            experimental: true,
            parameters: [
              {
                name: "frameId",
                description: "Frame id for resource to search in.",
                $ref: "FrameId"
              },
              {
                name: "url",
                description: "URL of the resource to search in.",
                type: "string"
              },
              {
                name: "query",
                description: "String to search for.",
                type: "string"
              },
              {
                name: "caseSensitive",
                description: "If true, search is case sensitive.",
                optional: true,
                type: "boolean"
              },
              {
                name: "isRegex",
                description: "If true, treats string parameter as regex.",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "result",
                description: "List of search matches.",
                type: "array",
                items: {
                  $ref: "Debugger.SearchMatch"
                }
              }
            ]
          },
          {
            name: "setAdBlockingEnabled",
            description: "Enable Chrome's experimental ad filter on all sites.",
            experimental: true,
            parameters: [
              {
                name: "enabled",
                description: "Whether to block ads.",
                type: "boolean"
              }
            ]
          },
          {
            name: "setBypassCSP",
            description: "Enable page Content Security Policy by-passing.",
            experimental: true,
            parameters: [
              {
                name: "enabled",
                description: "Whether to bypass page CSP.",
                type: "boolean"
              }
            ]
          },
          {
            name: "setDeviceMetricsOverride",
            description: 'Overrides the values of device screen dimensions (window.screen.width, window.screen.height,\nwindow.innerWidth, window.innerHeight, and "device-width"/"device-height"-related CSS media\nquery results).',
            experimental: true,
            deprecated: true,
            redirect: "Emulation",
            parameters: [
              {
                name: "width",
                description: "Overriding width value in pixels (minimum 0, maximum 10000000). 0 disables the override.",
                type: "integer"
              },
              {
                name: "height",
                description: "Overriding height value in pixels (minimum 0, maximum 10000000). 0 disables the override.",
                type: "integer"
              },
              {
                name: "deviceScaleFactor",
                description: "Overriding device scale factor value. 0 disables the override.",
                type: "number"
              },
              {
                name: "mobile",
                description: "Whether to emulate mobile device. This includes viewport meta tag, overlay scrollbars, text\nautosizing and more.",
                type: "boolean"
              },
              {
                name: "scale",
                description: "Scale to apply to resulting view image.",
                optional: true,
                type: "number"
              },
              {
                name: "screenWidth",
                description: "Overriding screen width value in pixels (minimum 0, maximum 10000000).",
                optional: true,
                type: "integer"
              },
              {
                name: "screenHeight",
                description: "Overriding screen height value in pixels (minimum 0, maximum 10000000).",
                optional: true,
                type: "integer"
              },
              {
                name: "positionX",
                description: "Overriding view X position on screen in pixels (minimum 0, maximum 10000000).",
                optional: true,
                type: "integer"
              },
              {
                name: "positionY",
                description: "Overriding view Y position on screen in pixels (minimum 0, maximum 10000000).",
                optional: true,
                type: "integer"
              },
              {
                name: "dontSetVisibleSize",
                description: "Do not set visible view size, rely upon explicit setVisibleSize call.",
                optional: true,
                type: "boolean"
              },
              {
                name: "screenOrientation",
                description: "Screen orientation override.",
                optional: true,
                $ref: "Emulation.ScreenOrientation"
              },
              {
                name: "viewport",
                description: "The viewport dimensions and scale. If not set, the override is cleared.",
                optional: true,
                $ref: "Viewport"
              }
            ]
          },
          {
            name: "setDeviceOrientationOverride",
            description: "Overrides the Device Orientation.",
            experimental: true,
            deprecated: true,
            redirect: "DeviceOrientation",
            parameters: [
              {
                name: "alpha",
                description: "Mock alpha",
                type: "number"
              },
              {
                name: "beta",
                description: "Mock beta",
                type: "number"
              },
              {
                name: "gamma",
                description: "Mock gamma",
                type: "number"
              }
            ]
          },
          {
            name: "setFontFamilies",
            description: "Set generic font families.",
            experimental: true,
            parameters: [
              {
                name: "fontFamilies",
                description: "Specifies font families to set. If a font family is not specified, it won't be changed.",
                $ref: "FontFamilies"
              }
            ]
          },
          {
            name: "setFontSizes",
            description: "Set default font sizes.",
            experimental: true,
            parameters: [
              {
                name: "fontSizes",
                description: "Specifies font sizes to set. If a font size is not specified, it won't be changed.",
                $ref: "FontSizes"
              }
            ]
          },
          {
            name: "setDocumentContent",
            description: "Sets given markup as the document's HTML.",
            parameters: [
              {
                name: "frameId",
                description: "Frame id to set HTML for.",
                $ref: "FrameId"
              },
              {
                name: "html",
                description: "HTML content to set.",
                type: "string"
              }
            ]
          },
          {
            name: "setDownloadBehavior",
            description: "Set the behavior when downloading a file.",
            experimental: true,
            parameters: [
              {
                name: "behavior",
                description: "Whether to allow all or deny all download requests, or use default Chrome behavior if\navailable (otherwise deny).",
                type: "string",
                enum: [
                  "deny",
                  "allow",
                  "default"
                ]
              },
              {
                name: "downloadPath",
                description: "The default path to save downloaded files to. This is requred if behavior is set to 'allow'",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "setGeolocationOverride",
            description: "Overrides the Geolocation Position or Error. Omitting any of the parameters emulates position\nunavailable.",
            deprecated: true,
            redirect: "Emulation",
            parameters: [
              {
                name: "latitude",
                description: "Mock latitude",
                optional: true,
                type: "number"
              },
              {
                name: "longitude",
                description: "Mock longitude",
                optional: true,
                type: "number"
              },
              {
                name: "accuracy",
                description: "Mock accuracy",
                optional: true,
                type: "number"
              }
            ]
          },
          {
            name: "setLifecycleEventsEnabled",
            description: "Controls whether page will emit lifecycle events.",
            experimental: true,
            parameters: [
              {
                name: "enabled",
                description: "If true, starts emitting lifecycle events.",
                type: "boolean"
              }
            ]
          },
          {
            name: "setTouchEmulationEnabled",
            description: "Toggles mouse event-based touch event emulation.",
            experimental: true,
            deprecated: true,
            redirect: "Emulation",
            parameters: [
              {
                name: "enabled",
                description: "Whether the touch event emulation should be enabled.",
                type: "boolean"
              },
              {
                name: "configuration",
                description: "Touch/gesture events configuration. Default: current platform.",
                optional: true,
                type: "string",
                enum: [
                  "mobile",
                  "desktop"
                ]
              }
            ]
          },
          {
            name: "startScreencast",
            description: "Starts sending each frame using the `screencastFrame` event.",
            experimental: true,
            parameters: [
              {
                name: "format",
                description: "Image compression format.",
                optional: true,
                type: "string",
                enum: [
                  "jpeg",
                  "png"
                ]
              },
              {
                name: "quality",
                description: "Compression quality from range [0..100].",
                optional: true,
                type: "integer"
              },
              {
                name: "maxWidth",
                description: "Maximum screenshot width.",
                optional: true,
                type: "integer"
              },
              {
                name: "maxHeight",
                description: "Maximum screenshot height.",
                optional: true,
                type: "integer"
              },
              {
                name: "everyNthFrame",
                description: "Send every n-th frame.",
                optional: true,
                type: "integer"
              }
            ]
          },
          {
            name: "stopLoading",
            description: "Force the page stop all navigations and pending resource fetches."
          },
          {
            name: "crash",
            description: "Crashes renderer on the IO thread, generates minidumps.",
            experimental: true
          },
          {
            name: "close",
            description: "Tries to close page, running its beforeunload hooks, if any.",
            experimental: true
          },
          {
            name: "setWebLifecycleState",
            description: "Tries to update the web lifecycle state of the page.\nIt will transition the page to the given state according to:\nhttps://github.com/WICG/web-lifecycle/",
            experimental: true,
            parameters: [
              {
                name: "state",
                description: "Target lifecycle state",
                type: "string",
                enum: [
                  "frozen",
                  "active"
                ]
              }
            ]
          },
          {
            name: "stopScreencast",
            description: "Stops sending each frame in the `screencastFrame`.",
            experimental: true
          },
          {
            name: "setProduceCompilationCache",
            description: "Forces compilation cache to be generated for every subresource script.",
            experimental: true,
            parameters: [
              {
                name: "enabled",
                type: "boolean"
              }
            ]
          },
          {
            name: "addCompilationCache",
            description: "Seeds compilation cache for given url. Compilation cache does not survive\ncross-process navigation.",
            experimental: true,
            parameters: [
              {
                name: "url",
                type: "string"
              },
              {
                name: "data",
                description: "Base64-encoded data",
                type: "string"
              }
            ]
          },
          {
            name: "clearCompilationCache",
            description: "Clears seeded compilation cache.",
            experimental: true
          },
          {
            name: "generateTestReport",
            description: "Generates a report for testing.",
            experimental: true,
            parameters: [
              {
                name: "message",
                description: "Message to be displayed in the report.",
                type: "string"
              },
              {
                name: "group",
                description: "Specifies the endpoint group to deliver the report to.",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "waitForDebugger",
            description: "Pauses page execution. Can be resumed using generic Runtime.runIfWaitingForDebugger.",
            experimental: true
          },
          {
            name: "setInterceptFileChooserDialog",
            description: "Intercept file chooser requests and transfer control to protocol clients.\nWhen file chooser interception is enabled, native file chooser dialog is not shown.\nInstead, a protocol event `Page.fileChooserOpened` is emitted.\nFile chooser can be handled with `page.handleFileChooser` command.",
            experimental: true,
            parameters: [
              {
                name: "enabled",
                type: "boolean"
              }
            ]
          },
          {
            name: "handleFileChooser",
            description: "Accepts or cancels an intercepted file chooser dialog.",
            experimental: true,
            parameters: [
              {
                name: "action",
                type: "string",
                enum: [
                  "accept",
                  "cancel",
                  "fallback"
                ]
              },
              {
                name: "files",
                description: "Array of absolute file paths to set, only respected with `accept` action.",
                optional: true,
                type: "array",
                items: {
                  type: "string"
                }
              }
            ]
          }
        ],
        events: [
          {
            name: "domContentEventFired",
            parameters: [
              {
                name: "timestamp",
                $ref: "Network.MonotonicTime"
              }
            ]
          },
          {
            name: "fileChooserOpened",
            description: "Emitted only when `page.interceptFileChooser` is enabled.",
            parameters: [
              {
                name: "mode",
                type: "string",
                enum: [
                  "selectSingle",
                  "selectMultiple"
                ]
              }
            ]
          },
          {
            name: "frameAttached",
            description: "Fired when frame has been attached to its parent.",
            parameters: [
              {
                name: "frameId",
                description: "Id of the frame that has been attached.",
                $ref: "FrameId"
              },
              {
                name: "parentFrameId",
                description: "Parent frame identifier.",
                $ref: "FrameId"
              },
              {
                name: "stack",
                description: "JavaScript stack trace of when frame was attached, only set if frame initiated from script.",
                optional: true,
                $ref: "Runtime.StackTrace"
              }
            ]
          },
          {
            name: "frameClearedScheduledNavigation",
            description: "Fired when frame no longer has a scheduled navigation.",
            deprecated: true,
            parameters: [
              {
                name: "frameId",
                description: "Id of the frame that has cleared its scheduled navigation.",
                $ref: "FrameId"
              }
            ]
          },
          {
            name: "frameDetached",
            description: "Fired when frame has been detached from its parent.",
            parameters: [
              {
                name: "frameId",
                description: "Id of the frame that has been detached.",
                $ref: "FrameId"
              }
            ]
          },
          {
            name: "frameNavigated",
            description: "Fired once navigation of the frame has completed. Frame is now associated with the new loader.",
            parameters: [
              {
                name: "frame",
                description: "Frame object.",
                $ref: "Frame"
              }
            ]
          },
          {
            name: "frameResized",
            experimental: true
          },
          {
            name: "frameRequestedNavigation",
            description: "Fired when a renderer-initiated navigation is requested.\nNavigation may still be cancelled after the event is issued.",
            experimental: true,
            parameters: [
              {
                name: "frameId",
                description: "Id of the frame that is being navigated.",
                $ref: "FrameId"
              },
              {
                name: "reason",
                description: "The reason for the navigation.",
                $ref: "ClientNavigationReason"
              },
              {
                name: "url",
                description: "The destination URL for the requested navigation.",
                type: "string"
              }
            ]
          },
          {
            name: "frameScheduledNavigation",
            description: "Fired when frame schedules a potential navigation.",
            deprecated: true,
            parameters: [
              {
                name: "frameId",
                description: "Id of the frame that has scheduled a navigation.",
                $ref: "FrameId"
              },
              {
                name: "delay",
                description: "Delay (in seconds) until the navigation is scheduled to begin. The navigation is not\nguaranteed to start.",
                type: "number"
              },
              {
                name: "reason",
                description: "The reason for the navigation.",
                type: "string",
                enum: [
                  "formSubmissionGet",
                  "formSubmissionPost",
                  "httpHeaderRefresh",
                  "scriptInitiated",
                  "metaTagRefresh",
                  "pageBlockInterstitial",
                  "reload"
                ]
              },
              {
                name: "url",
                description: "The destination URL for the scheduled navigation.",
                type: "string"
              }
            ]
          },
          {
            name: "frameStartedLoading",
            description: "Fired when frame has started loading.",
            experimental: true,
            parameters: [
              {
                name: "frameId",
                description: "Id of the frame that has started loading.",
                $ref: "FrameId"
              }
            ]
          },
          {
            name: "frameStoppedLoading",
            description: "Fired when frame has stopped loading.",
            experimental: true,
            parameters: [
              {
                name: "frameId",
                description: "Id of the frame that has stopped loading.",
                $ref: "FrameId"
              }
            ]
          },
          {
            name: "downloadWillBegin",
            description: "Fired when page is about to start a download.",
            experimental: true,
            parameters: [
              {
                name: "frameId",
                description: "Id of the frame that caused download to begin.",
                $ref: "FrameId"
              },
              {
                name: "url",
                description: "URL of the resource being downloaded.",
                type: "string"
              }
            ]
          },
          {
            name: "interstitialHidden",
            description: "Fired when interstitial page was hidden"
          },
          {
            name: "interstitialShown",
            description: "Fired when interstitial page was shown"
          },
          {
            name: "javascriptDialogClosed",
            description: "Fired when a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload) has been\nclosed.",
            parameters: [
              {
                name: "result",
                description: "Whether dialog was confirmed.",
                type: "boolean"
              },
              {
                name: "userInput",
                description: "User input in case of prompt.",
                type: "string"
              }
            ]
          },
          {
            name: "javascriptDialogOpening",
            description: "Fired when a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload) is about to\nopen.",
            parameters: [
              {
                name: "url",
                description: "Frame url.",
                type: "string"
              },
              {
                name: "message",
                description: "Message that will be displayed by the dialog.",
                type: "string"
              },
              {
                name: "type",
                description: "Dialog type.",
                $ref: "DialogType"
              },
              {
                name: "hasBrowserHandler",
                description: "True iff browser is capable showing or acting on the given dialog. When browser has no\ndialog handler for given target, calling alert while Page domain is engaged will stall\nthe page execution. Execution can be resumed via calling Page.handleJavaScriptDialog.",
                type: "boolean"
              },
              {
                name: "defaultPrompt",
                description: "Default dialog prompt.",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "lifecycleEvent",
            description: "Fired for top level page lifecycle events such as navigation, load, paint, etc.",
            parameters: [
              {
                name: "frameId",
                description: "Id of the frame.",
                $ref: "FrameId"
              },
              {
                name: "loaderId",
                description: "Loader identifier. Empty string if the request is fetched from worker.",
                $ref: "Network.LoaderId"
              },
              {
                name: "name",
                type: "string"
              },
              {
                name: "timestamp",
                $ref: "Network.MonotonicTime"
              }
            ]
          },
          {
            name: "loadEventFired",
            parameters: [
              {
                name: "timestamp",
                $ref: "Network.MonotonicTime"
              }
            ]
          },
          {
            name: "navigatedWithinDocument",
            description: "Fired when same-document navigation happens, e.g. due to history API usage or anchor navigation.",
            experimental: true,
            parameters: [
              {
                name: "frameId",
                description: "Id of the frame.",
                $ref: "FrameId"
              },
              {
                name: "url",
                description: "Frame's new url.",
                type: "string"
              }
            ]
          },
          {
            name: "screencastFrame",
            description: "Compressed image data requested by the `startScreencast`.",
            experimental: true,
            parameters: [
              {
                name: "data",
                description: "Base64-encoded compressed image.",
                type: "string"
              },
              {
                name: "metadata",
                description: "Screencast frame metadata.",
                $ref: "ScreencastFrameMetadata"
              },
              {
                name: "sessionId",
                description: "Frame number.",
                type: "integer"
              }
            ]
          },
          {
            name: "screencastVisibilityChanged",
            description: "Fired when the page with currently enabled screencast was shown or hidden `.",
            experimental: true,
            parameters: [
              {
                name: "visible",
                description: "True if the page is visible.",
                type: "boolean"
              }
            ]
          },
          {
            name: "windowOpen",
            description: "Fired when a new window is going to be opened, via window.open(), link click, form submission,\netc.",
            parameters: [
              {
                name: "url",
                description: "The URL for the new window.",
                type: "string"
              },
              {
                name: "windowName",
                description: "Window name.",
                type: "string"
              },
              {
                name: "windowFeatures",
                description: "An array of enabled window features.",
                type: "array",
                items: {
                  type: "string"
                }
              },
              {
                name: "userGesture",
                description: "Whether or not it was triggered by user gesture.",
                type: "boolean"
              }
            ]
          },
          {
            name: "compilationCacheProduced",
            description: "Issued for every compilation cache generated. Is only available\nif Page.setGenerateCompilationCache is enabled.",
            experimental: true,
            parameters: [
              {
                name: "url",
                type: "string"
              },
              {
                name: "data",
                description: "Base64-encoded data",
                type: "string"
              }
            ]
          }
        ]
      },
      {
        domain: "Performance",
        types: [
          {
            id: "Metric",
            description: "Run-time execution metric.",
            type: "object",
            properties: [
              {
                name: "name",
                description: "Metric name.",
                type: "string"
              },
              {
                name: "value",
                description: "Metric value.",
                type: "number"
              }
            ]
          }
        ],
        commands: [
          {
            name: "disable",
            description: "Disable collecting and reporting metrics."
          },
          {
            name: "enable",
            description: "Enable collecting and reporting metrics."
          },
          {
            name: "setTimeDomain",
            description: "Sets time domain to use for collecting and reporting duration metrics.\nNote that this must be called before enabling metrics collection. Calling\nthis method while metrics collection is enabled returns an error.",
            experimental: true,
            parameters: [
              {
                name: "timeDomain",
                description: "Time domain",
                type: "string",
                enum: [
                  "timeTicks",
                  "threadTicks"
                ]
              }
            ]
          },
          {
            name: "getMetrics",
            description: "Retrieve current values of run-time metrics.",
            returns: [
              {
                name: "metrics",
                description: "Current values for run-time metrics.",
                type: "array",
                items: {
                  $ref: "Metric"
                }
              }
            ]
          }
        ],
        events: [
          {
            name: "metrics",
            description: "Current values of the metrics.",
            parameters: [
              {
                name: "metrics",
                description: "Current values of the metrics.",
                type: "array",
                items: {
                  $ref: "Metric"
                }
              },
              {
                name: "title",
                description: "Timestamp title.",
                type: "string"
              }
            ]
          }
        ]
      },
      {
        domain: "Security",
        description: "Security",
        types: [
          {
            id: "CertificateId",
            description: "An internal certificate ID value.",
            type: "integer"
          },
          {
            id: "MixedContentType",
            description: "A description of mixed content (HTTP resources on HTTPS pages), as defined by\nhttps://www.w3.org/TR/mixed-content/#categories",
            type: "string",
            enum: [
              "blockable",
              "optionally-blockable",
              "none"
            ]
          },
          {
            id: "SecurityState",
            description: "The security level of a page or resource.",
            type: "string",
            enum: [
              "unknown",
              "neutral",
              "insecure",
              "secure",
              "info"
            ]
          },
          {
            id: "SecurityStateExplanation",
            description: "An explanation of an factor contributing to the security state.",
            type: "object",
            properties: [
              {
                name: "securityState",
                description: "Security state representing the severity of the factor being explained.",
                $ref: "SecurityState"
              },
              {
                name: "title",
                description: "Title describing the type of factor.",
                type: "string"
              },
              {
                name: "summary",
                description: "Short phrase describing the type of factor.",
                type: "string"
              },
              {
                name: "description",
                description: "Full text explanation of the factor.",
                type: "string"
              },
              {
                name: "mixedContentType",
                description: "The type of mixed content described by the explanation.",
                $ref: "MixedContentType"
              },
              {
                name: "certificate",
                description: "Page certificate.",
                type: "array",
                items: {
                  type: "string"
                }
              },
              {
                name: "recommendations",
                description: "Recommendations to fix any issues.",
                optional: true,
                type: "array",
                items: {
                  type: "string"
                }
              }
            ]
          },
          {
            id: "InsecureContentStatus",
            description: "Information about insecure content on the page.",
            deprecated: true,
            type: "object",
            properties: [
              {
                name: "ranMixedContent",
                description: "Always false.",
                type: "boolean"
              },
              {
                name: "displayedMixedContent",
                description: "Always false.",
                type: "boolean"
              },
              {
                name: "containedMixedForm",
                description: "Always false.",
                type: "boolean"
              },
              {
                name: "ranContentWithCertErrors",
                description: "Always false.",
                type: "boolean"
              },
              {
                name: "displayedContentWithCertErrors",
                description: "Always false.",
                type: "boolean"
              },
              {
                name: "ranInsecureContentStyle",
                description: "Always set to unknown.",
                $ref: "SecurityState"
              },
              {
                name: "displayedInsecureContentStyle",
                description: "Always set to unknown.",
                $ref: "SecurityState"
              }
            ]
          },
          {
            id: "CertificateErrorAction",
            description: "The action to take when a certificate error occurs. continue will continue processing the\nrequest and cancel will cancel the request.",
            type: "string",
            enum: [
              "continue",
              "cancel"
            ]
          }
        ],
        commands: [
          {
            name: "disable",
            description: "Disables tracking security state changes."
          },
          {
            name: "enable",
            description: "Enables tracking security state changes."
          },
          {
            name: "setIgnoreCertificateErrors",
            description: "Enable/disable whether all certificate errors should be ignored.",
            experimental: true,
            parameters: [
              {
                name: "ignore",
                description: "If true, all certificate errors will be ignored.",
                type: "boolean"
              }
            ]
          },
          {
            name: "handleCertificateError",
            description: "Handles a certificate error that fired a certificateError event.",
            deprecated: true,
            parameters: [
              {
                name: "eventId",
                description: "The ID of the event.",
                type: "integer"
              },
              {
                name: "action",
                description: "The action to take on the certificate error.",
                $ref: "CertificateErrorAction"
              }
            ]
          },
          {
            name: "setOverrideCertificateErrors",
            description: "Enable/disable overriding certificate errors. If enabled, all certificate error events need to\nbe handled by the DevTools client and should be answered with `handleCertificateError` commands.",
            deprecated: true,
            parameters: [
              {
                name: "override",
                description: "If true, certificate errors will be overridden.",
                type: "boolean"
              }
            ]
          }
        ],
        events: [
          {
            name: "certificateError",
            description: "There is a certificate error. If overriding certificate errors is enabled, then it should be\nhandled with the `handleCertificateError` command. Note: this event does not fire if the\ncertificate error has been allowed internally. Only one client per target should override\ncertificate errors at the same time.",
            deprecated: true,
            parameters: [
              {
                name: "eventId",
                description: "The ID of the event.",
                type: "integer"
              },
              {
                name: "errorType",
                description: "The type of the error.",
                type: "string"
              },
              {
                name: "requestURL",
                description: "The url that was requested.",
                type: "string"
              }
            ]
          },
          {
            name: "securityStateChanged",
            description: "The security state of the page changed.",
            parameters: [
              {
                name: "securityState",
                description: "Security state.",
                $ref: "SecurityState"
              },
              {
                name: "schemeIsCryptographic",
                description: "True if the page was loaded over cryptographic transport such as HTTPS.",
                deprecated: true,
                type: "boolean"
              },
              {
                name: "explanations",
                description: "List of explanations for the security state. If the overall security state is `insecure` or\n`warning`, at least one corresponding explanation should be included.",
                type: "array",
                items: {
                  $ref: "SecurityStateExplanation"
                }
              },
              {
                name: "insecureContentStatus",
                description: "Information about insecure content on the page.",
                deprecated: true,
                $ref: "InsecureContentStatus"
              },
              {
                name: "summary",
                description: "Overrides user-visible description of the state.",
                optional: true,
                type: "string"
              }
            ]
          }
        ]
      },
      {
        domain: "ServiceWorker",
        experimental: true,
        types: [
          {
            id: "RegistrationID",
            type: "string"
          },
          {
            id: "ServiceWorkerRegistration",
            description: "ServiceWorker registration.",
            type: "object",
            properties: [
              {
                name: "registrationId",
                $ref: "RegistrationID"
              },
              {
                name: "scopeURL",
                type: "string"
              },
              {
                name: "isDeleted",
                type: "boolean"
              }
            ]
          },
          {
            id: "ServiceWorkerVersionRunningStatus",
            type: "string",
            enum: [
              "stopped",
              "starting",
              "running",
              "stopping"
            ]
          },
          {
            id: "ServiceWorkerVersionStatus",
            type: "string",
            enum: [
              "new",
              "installing",
              "installed",
              "activating",
              "activated",
              "redundant"
            ]
          },
          {
            id: "ServiceWorkerVersion",
            description: "ServiceWorker version.",
            type: "object",
            properties: [
              {
                name: "versionId",
                type: "string"
              },
              {
                name: "registrationId",
                $ref: "RegistrationID"
              },
              {
                name: "scriptURL",
                type: "string"
              },
              {
                name: "runningStatus",
                $ref: "ServiceWorkerVersionRunningStatus"
              },
              {
                name: "status",
                $ref: "ServiceWorkerVersionStatus"
              },
              {
                name: "scriptLastModified",
                description: "The Last-Modified header value of the main script.",
                optional: true,
                type: "number"
              },
              {
                name: "scriptResponseTime",
                description: "The time at which the response headers of the main script were received from the server.\nFor cached script it is the last time the cache entry was validated.",
                optional: true,
                type: "number"
              },
              {
                name: "controlledClients",
                optional: true,
                type: "array",
                items: {
                  $ref: "Target.TargetID"
                }
              },
              {
                name: "targetId",
                optional: true,
                $ref: "Target.TargetID"
              }
            ]
          },
          {
            id: "ServiceWorkerErrorMessage",
            description: "ServiceWorker error message.",
            type: "object",
            properties: [
              {
                name: "errorMessage",
                type: "string"
              },
              {
                name: "registrationId",
                $ref: "RegistrationID"
              },
              {
                name: "versionId",
                type: "string"
              },
              {
                name: "sourceURL",
                type: "string"
              },
              {
                name: "lineNumber",
                type: "integer"
              },
              {
                name: "columnNumber",
                type: "integer"
              }
            ]
          }
        ],
        commands: [
          {
            name: "deliverPushMessage",
            parameters: [
              {
                name: "origin",
                type: "string"
              },
              {
                name: "registrationId",
                $ref: "RegistrationID"
              },
              {
                name: "data",
                type: "string"
              }
            ]
          },
          {
            name: "disable"
          },
          {
            name: "dispatchSyncEvent",
            parameters: [
              {
                name: "origin",
                type: "string"
              },
              {
                name: "registrationId",
                $ref: "RegistrationID"
              },
              {
                name: "tag",
                type: "string"
              },
              {
                name: "lastChance",
                type: "boolean"
              }
            ]
          },
          {
            name: "enable"
          },
          {
            name: "inspectWorker",
            parameters: [
              {
                name: "versionId",
                type: "string"
              }
            ]
          },
          {
            name: "setForceUpdateOnPageLoad",
            parameters: [
              {
                name: "forceUpdateOnPageLoad",
                type: "boolean"
              }
            ]
          },
          {
            name: "skipWaiting",
            parameters: [
              {
                name: "scopeURL",
                type: "string"
              }
            ]
          },
          {
            name: "startWorker",
            parameters: [
              {
                name: "scopeURL",
                type: "string"
              }
            ]
          },
          {
            name: "stopAllWorkers"
          },
          {
            name: "stopWorker",
            parameters: [
              {
                name: "versionId",
                type: "string"
              }
            ]
          },
          {
            name: "unregister",
            parameters: [
              {
                name: "scopeURL",
                type: "string"
              }
            ]
          },
          {
            name: "updateRegistration",
            parameters: [
              {
                name: "scopeURL",
                type: "string"
              }
            ]
          }
        ],
        events: [
          {
            name: "workerErrorReported",
            parameters: [
              {
                name: "errorMessage",
                $ref: "ServiceWorkerErrorMessage"
              }
            ]
          },
          {
            name: "workerRegistrationUpdated",
            parameters: [
              {
                name: "registrations",
                type: "array",
                items: {
                  $ref: "ServiceWorkerRegistration"
                }
              }
            ]
          },
          {
            name: "workerVersionUpdated",
            parameters: [
              {
                name: "versions",
                type: "array",
                items: {
                  $ref: "ServiceWorkerVersion"
                }
              }
            ]
          }
        ]
      },
      {
        domain: "Storage",
        experimental: true,
        types: [
          {
            id: "StorageType",
            description: "Enum of possible storage types.",
            type: "string",
            enum: [
              "appcache",
              "cookies",
              "file_systems",
              "indexeddb",
              "local_storage",
              "shader_cache",
              "websql",
              "service_workers",
              "cache_storage",
              "all",
              "other"
            ]
          },
          {
            id: "UsageForType",
            description: "Usage for a storage type.",
            type: "object",
            properties: [
              {
                name: "storageType",
                description: "Name of storage type.",
                $ref: "StorageType"
              },
              {
                name: "usage",
                description: "Storage usage (bytes).",
                type: "number"
              }
            ]
          }
        ],
        commands: [
          {
            name: "clearDataForOrigin",
            description: "Clears storage for origin.",
            parameters: [
              {
                name: "origin",
                description: "Security origin.",
                type: "string"
              },
              {
                name: "storageTypes",
                description: "Comma separated list of StorageType to clear.",
                type: "string"
              }
            ]
          },
          {
            name: "getUsageAndQuota",
            description: "Returns usage and quota in bytes.",
            parameters: [
              {
                name: "origin",
                description: "Security origin.",
                type: "string"
              }
            ],
            returns: [
              {
                name: "usage",
                description: "Storage usage (bytes).",
                type: "number"
              },
              {
                name: "quota",
                description: "Storage quota (bytes).",
                type: "number"
              },
              {
                name: "usageBreakdown",
                description: "Storage usage per type (bytes).",
                type: "array",
                items: {
                  $ref: "UsageForType"
                }
              }
            ]
          },
          {
            name: "trackCacheStorageForOrigin",
            description: "Registers origin to be notified when an update occurs to its cache storage list.",
            parameters: [
              {
                name: "origin",
                description: "Security origin.",
                type: "string"
              }
            ]
          },
          {
            name: "trackIndexedDBForOrigin",
            description: "Registers origin to be notified when an update occurs to its IndexedDB.",
            parameters: [
              {
                name: "origin",
                description: "Security origin.",
                type: "string"
              }
            ]
          },
          {
            name: "untrackCacheStorageForOrigin",
            description: "Unregisters origin from receiving notifications for cache storage.",
            parameters: [
              {
                name: "origin",
                description: "Security origin.",
                type: "string"
              }
            ]
          },
          {
            name: "untrackIndexedDBForOrigin",
            description: "Unregisters origin from receiving notifications for IndexedDB.",
            parameters: [
              {
                name: "origin",
                description: "Security origin.",
                type: "string"
              }
            ]
          }
        ],
        events: [
          {
            name: "cacheStorageContentUpdated",
            description: "A cache's contents have been modified.",
            parameters: [
              {
                name: "origin",
                description: "Origin to update.",
                type: "string"
              },
              {
                name: "cacheName",
                description: "Name of cache in origin.",
                type: "string"
              }
            ]
          },
          {
            name: "cacheStorageListUpdated",
            description: "A cache has been added/deleted.",
            parameters: [
              {
                name: "origin",
                description: "Origin to update.",
                type: "string"
              }
            ]
          },
          {
            name: "indexedDBContentUpdated",
            description: "The origin's IndexedDB object store has been modified.",
            parameters: [
              {
                name: "origin",
                description: "Origin to update.",
                type: "string"
              },
              {
                name: "databaseName",
                description: "Database to update.",
                type: "string"
              },
              {
                name: "objectStoreName",
                description: "ObjectStore to update.",
                type: "string"
              }
            ]
          },
          {
            name: "indexedDBListUpdated",
            description: "The origin's IndexedDB database list has been modified.",
            parameters: [
              {
                name: "origin",
                description: "Origin to update.",
                type: "string"
              }
            ]
          }
        ]
      },
      {
        domain: "SystemInfo",
        description: "The SystemInfo domain defines methods and events for querying low-level system information.",
        experimental: true,
        types: [
          {
            id: "GPUDevice",
            description: "Describes a single graphics processor (GPU).",
            type: "object",
            properties: [
              {
                name: "vendorId",
                description: "PCI ID of the GPU vendor, if available; 0 otherwise.",
                type: "number"
              },
              {
                name: "deviceId",
                description: "PCI ID of the GPU device, if available; 0 otherwise.",
                type: "number"
              },
              {
                name: "vendorString",
                description: "String description of the GPU vendor, if the PCI ID is not available.",
                type: "string"
              },
              {
                name: "deviceString",
                description: "String description of the GPU device, if the PCI ID is not available.",
                type: "string"
              },
              {
                name: "driverVendor",
                description: "String description of the GPU driver vendor.",
                type: "string"
              },
              {
                name: "driverVersion",
                description: "String description of the GPU driver version.",
                type: "string"
              }
            ]
          },
          {
            id: "Size",
            description: "Describes the width and height dimensions of an entity.",
            type: "object",
            properties: [
              {
                name: "width",
                description: "Width in pixels.",
                type: "integer"
              },
              {
                name: "height",
                description: "Height in pixels.",
                type: "integer"
              }
            ]
          },
          {
            id: "VideoDecodeAcceleratorCapability",
            description: "Describes a supported video decoding profile with its associated minimum and\nmaximum resolutions.",
            type: "object",
            properties: [
              {
                name: "profile",
                description: "Video codec profile that is supported, e.g. VP9 Profile 2.",
                type: "string"
              },
              {
                name: "maxResolution",
                description: "Maximum video dimensions in pixels supported for this |profile|.",
                $ref: "Size"
              },
              {
                name: "minResolution",
                description: "Minimum video dimensions in pixels supported for this |profile|.",
                $ref: "Size"
              }
            ]
          },
          {
            id: "VideoEncodeAcceleratorCapability",
            description: "Describes a supported video encoding profile with its associated maximum\nresolution and maximum framerate.",
            type: "object",
            properties: [
              {
                name: "profile",
                description: "Video codec profile that is supported, e.g H264 Main.",
                type: "string"
              },
              {
                name: "maxResolution",
                description: "Maximum video dimensions in pixels supported for this |profile|.",
                $ref: "Size"
              },
              {
                name: "maxFramerateNumerator",
                description: "Maximum encoding framerate in frames per second supported for this\n|profile|, as fraction's numerator and denominator, e.g. 24/1 fps,\n24000/1001 fps, etc.",
                type: "integer"
              },
              {
                name: "maxFramerateDenominator",
                type: "integer"
              }
            ]
          },
          {
            id: "SubsamplingFormat",
            description: "YUV subsampling type of the pixels of a given image.",
            type: "string",
            enum: [
              "yuv420",
              "yuv422",
              "yuv444"
            ]
          },
          {
            id: "ImageDecodeAcceleratorCapability",
            description: "Describes a supported image decoding profile with its associated minimum and\nmaximum resolutions and subsampling.",
            type: "object",
            properties: [
              {
                name: "imageType",
                description: "Image coded, e.g. Jpeg.",
                type: "string"
              },
              {
                name: "maxDimensions",
                description: "Maximum supported dimensions of the image in pixels.",
                $ref: "Size"
              },
              {
                name: "minDimensions",
                description: "Minimum supported dimensions of the image in pixels.",
                $ref: "Size"
              },
              {
                name: "subsamplings",
                description: "Optional array of supported subsampling formats, e.g. 4:2:0, if known.",
                type: "array",
                items: {
                  $ref: "SubsamplingFormat"
                }
              }
            ]
          },
          {
            id: "GPUInfo",
            description: "Provides information about the GPU(s) on the system.",
            type: "object",
            properties: [
              {
                name: "devices",
                description: "The graphics devices on the system. Element 0 is the primary GPU.",
                type: "array",
                items: {
                  $ref: "GPUDevice"
                }
              },
              {
                name: "auxAttributes",
                description: "An optional dictionary of additional GPU related attributes.",
                optional: true,
                type: "object"
              },
              {
                name: "featureStatus",
                description: "An optional dictionary of graphics features and their status.",
                optional: true,
                type: "object"
              },
              {
                name: "driverBugWorkarounds",
                description: "An optional array of GPU driver bug workarounds.",
                type: "array",
                items: {
                  type: "string"
                }
              },
              {
                name: "videoDecoding",
                description: "Supported accelerated video decoding capabilities.",
                type: "array",
                items: {
                  $ref: "VideoDecodeAcceleratorCapability"
                }
              },
              {
                name: "videoEncoding",
                description: "Supported accelerated video encoding capabilities.",
                type: "array",
                items: {
                  $ref: "VideoEncodeAcceleratorCapability"
                }
              },
              {
                name: "imageDecoding",
                description: "Supported accelerated image decoding capabilities.",
                type: "array",
                items: {
                  $ref: "ImageDecodeAcceleratorCapability"
                }
              }
            ]
          },
          {
            id: "ProcessInfo",
            description: "Represents process info.",
            type: "object",
            properties: [
              {
                name: "type",
                description: "Specifies process type.",
                type: "string"
              },
              {
                name: "id",
                description: "Specifies process id.",
                type: "integer"
              },
              {
                name: "cpuTime",
                description: "Specifies cumulative CPU usage in seconds across all threads of the\nprocess since the process start.",
                type: "number"
              }
            ]
          }
        ],
        commands: [
          {
            name: "getInfo",
            description: "Returns information about the system.",
            returns: [
              {
                name: "gpu",
                description: "Information about the GPUs on the system.",
                $ref: "GPUInfo"
              },
              {
                name: "modelName",
                description: "A platform-dependent description of the model of the machine. On Mac OS, this is, for\nexample, 'MacBookPro'. Will be the empty string if not supported.",
                type: "string"
              },
              {
                name: "modelVersion",
                description: "A platform-dependent description of the version of the machine. On Mac OS, this is, for\nexample, '10.1'. Will be the empty string if not supported.",
                type: "string"
              },
              {
                name: "commandLine",
                description: "The command line string used to launch the browser. Will be the empty string if not\nsupported.",
                type: "string"
              }
            ]
          },
          {
            name: "getProcessInfo",
            description: "Returns information about all running processes.",
            returns: [
              {
                name: "processInfo",
                description: "An array of process info blocks.",
                type: "array",
                items: {
                  $ref: "ProcessInfo"
                }
              }
            ]
          }
        ]
      },
      {
        domain: "Target",
        description: "Supports additional targets discovery and allows to attach to them.",
        types: [
          {
            id: "TargetID",
            type: "string"
          },
          {
            id: "SessionID",
            description: "Unique identifier of attached debugging session.",
            type: "string"
          },
          {
            id: "BrowserContextID",
            experimental: true,
            type: "string"
          },
          {
            id: "TargetInfo",
            type: "object",
            properties: [
              {
                name: "targetId",
                $ref: "TargetID"
              },
              {
                name: "type",
                type: "string"
              },
              {
                name: "title",
                type: "string"
              },
              {
                name: "url",
                type: "string"
              },
              {
                name: "attached",
                description: "Whether the target has an attached client.",
                type: "boolean"
              },
              {
                name: "openerId",
                description: "Opener target Id",
                optional: true,
                $ref: "TargetID"
              },
              {
                name: "browserContextId",
                experimental: true,
                optional: true,
                $ref: "BrowserContextID"
              }
            ]
          },
          {
            id: "RemoteLocation",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "host",
                type: "string"
              },
              {
                name: "port",
                type: "integer"
              }
            ]
          }
        ],
        commands: [
          {
            name: "activateTarget",
            description: "Activates (focuses) the target.",
            parameters: [
              {
                name: "targetId",
                $ref: "TargetID"
              }
            ]
          },
          {
            name: "attachToTarget",
            description: "Attaches to the target with given id.",
            parameters: [
              {
                name: "targetId",
                $ref: "TargetID"
              },
              {
                name: "flatten",
                description: 'Enables "flat" access to the session via specifying sessionId attribute in the commands.',
                experimental: true,
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "sessionId",
                description: "Id assigned to the session.",
                $ref: "SessionID"
              }
            ]
          },
          {
            name: "attachToBrowserTarget",
            description: "Attaches to the browser target, only uses flat sessionId mode.",
            experimental: true,
            returns: [
              {
                name: "sessionId",
                description: "Id assigned to the session.",
                $ref: "SessionID"
              }
            ]
          },
          {
            name: "closeTarget",
            description: "Closes the target. If the target is a page that gets closed too.",
            parameters: [
              {
                name: "targetId",
                $ref: "TargetID"
              }
            ],
            returns: [
              {
                name: "success",
                type: "boolean"
              }
            ]
          },
          {
            name: "exposeDevToolsProtocol",
            description: "Inject object to the target's main frame that provides a communication\nchannel with browser target.\n\nInjected object will be available as `window[bindingName]`.\n\nThe object has the follwing API:\n- `binding.send(json)` - a method to send messages over the remote debugging protocol\n- `binding.onmessage = json => handleMessage(json)` - a callback that will be called for the protocol notifications and command responses.",
            experimental: true,
            parameters: [
              {
                name: "targetId",
                $ref: "TargetID"
              },
              {
                name: "bindingName",
                description: "Binding name, 'cdp' if not specified.",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "createBrowserContext",
            description: "Creates a new empty BrowserContext. Similar to an incognito profile but you can have more than\none.",
            experimental: true,
            returns: [
              {
                name: "browserContextId",
                description: "The id of the context created.",
                $ref: "BrowserContextID"
              }
            ]
          },
          {
            name: "getBrowserContexts",
            description: "Returns all browser contexts created with `Target.createBrowserContext` method.",
            experimental: true,
            returns: [
              {
                name: "browserContextIds",
                description: "An array of browser context ids.",
                type: "array",
                items: {
                  $ref: "BrowserContextID"
                }
              }
            ]
          },
          {
            name: "createTarget",
            description: "Creates a new page.",
            parameters: [
              {
                name: "url",
                description: "The initial URL the page will be navigated to.",
                type: "string"
              },
              {
                name: "width",
                description: "Frame width in DIP (headless chrome only).",
                optional: true,
                type: "integer"
              },
              {
                name: "height",
                description: "Frame height in DIP (headless chrome only).",
                optional: true,
                type: "integer"
              },
              {
                name: "browserContextId",
                description: "The browser context to create the page in.",
                optional: true,
                $ref: "BrowserContextID"
              },
              {
                name: "enableBeginFrameControl",
                description: "Whether BeginFrames for this target will be controlled via DevTools (headless chrome only,\nnot supported on MacOS yet, false by default).",
                experimental: true,
                optional: true,
                type: "boolean"
              },
              {
                name: "newWindow",
                description: "Whether to create a new Window or Tab (chrome-only, false by default).",
                optional: true,
                type: "boolean"
              },
              {
                name: "background",
                description: "Whether to create the target in background or foreground (chrome-only,\nfalse by default).",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "targetId",
                description: "The id of the page opened.",
                $ref: "TargetID"
              }
            ]
          },
          {
            name: "detachFromTarget",
            description: "Detaches session with given id.",
            parameters: [
              {
                name: "sessionId",
                description: "Session to detach.",
                optional: true,
                $ref: "SessionID"
              },
              {
                name: "targetId",
                description: "Deprecated.",
                deprecated: true,
                optional: true,
                $ref: "TargetID"
              }
            ]
          },
          {
            name: "disposeBrowserContext",
            description: "Deletes a BrowserContext. All the belonging pages will be closed without calling their\nbeforeunload hooks.",
            experimental: true,
            parameters: [
              {
                name: "browserContextId",
                $ref: "BrowserContextID"
              }
            ]
          },
          {
            name: "getTargetInfo",
            description: "Returns information about a target.",
            experimental: true,
            parameters: [
              {
                name: "targetId",
                optional: true,
                $ref: "TargetID"
              }
            ],
            returns: [
              {
                name: "targetInfo",
                $ref: "TargetInfo"
              }
            ]
          },
          {
            name: "getTargets",
            description: "Retrieves a list of available targets.",
            returns: [
              {
                name: "targetInfos",
                description: "The list of targets.",
                type: "array",
                items: {
                  $ref: "TargetInfo"
                }
              }
            ]
          },
          {
            name: "sendMessageToTarget",
            description: "Sends protocol message over session with given id.",
            parameters: [
              {
                name: "message",
                type: "string"
              },
              {
                name: "sessionId",
                description: "Identifier of the session.",
                optional: true,
                $ref: "SessionID"
              },
              {
                name: "targetId",
                description: "Deprecated.",
                deprecated: true,
                optional: true,
                $ref: "TargetID"
              }
            ]
          },
          {
            name: "setAutoAttach",
            description: "Controls whether to automatically attach to new targets which are considered to be related to\nthis one. When turned on, attaches to all existing related targets as well. When turned off,\nautomatically detaches from all currently attached targets.",
            experimental: true,
            parameters: [
              {
                name: "autoAttach",
                description: "Whether to auto-attach to related targets.",
                type: "boolean"
              },
              {
                name: "waitForDebuggerOnStart",
                description: "Whether to pause new targets when attaching to them. Use `Runtime.runIfWaitingForDebugger`\nto run paused targets.",
                type: "boolean"
              },
              {
                name: "flatten",
                description: 'Enables "flat" access to the session via specifying sessionId attribute in the commands.',
                experimental: true,
                optional: true,
                type: "boolean"
              }
            ]
          },
          {
            name: "setDiscoverTargets",
            description: "Controls whether to discover available targets and notify via\n`targetCreated/targetInfoChanged/targetDestroyed` events.",
            parameters: [
              {
                name: "discover",
                description: "Whether to discover available targets.",
                type: "boolean"
              }
            ]
          },
          {
            name: "setRemoteLocations",
            description: "Enables target discovery for the specified locations, when `setDiscoverTargets` was set to\n`true`.",
            experimental: true,
            parameters: [
              {
                name: "locations",
                description: "List of remote locations.",
                type: "array",
                items: {
                  $ref: "RemoteLocation"
                }
              }
            ]
          }
        ],
        events: [
          {
            name: "attachedToTarget",
            description: "Issued when attached to target because of auto-attach or `attachToTarget` command.",
            experimental: true,
            parameters: [
              {
                name: "sessionId",
                description: "Identifier assigned to the session used to send/receive messages.",
                $ref: "SessionID"
              },
              {
                name: "targetInfo",
                $ref: "TargetInfo"
              },
              {
                name: "waitingForDebugger",
                type: "boolean"
              }
            ]
          },
          {
            name: "detachedFromTarget",
            description: "Issued when detached from target for any reason (including `detachFromTarget` command). Can be\nissued multiple times per target if multiple sessions have been attached to it.",
            experimental: true,
            parameters: [
              {
                name: "sessionId",
                description: "Detached session identifier.",
                $ref: "SessionID"
              },
              {
                name: "targetId",
                description: "Deprecated.",
                deprecated: true,
                optional: true,
                $ref: "TargetID"
              }
            ]
          },
          {
            name: "receivedMessageFromTarget",
            description: "Notifies about a new protocol message received from the session (as reported in\n`attachedToTarget` event).",
            parameters: [
              {
                name: "sessionId",
                description: "Identifier of a session which sends a message.",
                $ref: "SessionID"
              },
              {
                name: "message",
                type: "string"
              },
              {
                name: "targetId",
                description: "Deprecated.",
                deprecated: true,
                optional: true,
                $ref: "TargetID"
              }
            ]
          },
          {
            name: "targetCreated",
            description: "Issued when a possible inspection target is created.",
            parameters: [
              {
                name: "targetInfo",
                $ref: "TargetInfo"
              }
            ]
          },
          {
            name: "targetDestroyed",
            description: "Issued when a target is destroyed.",
            parameters: [
              {
                name: "targetId",
                $ref: "TargetID"
              }
            ]
          },
          {
            name: "targetCrashed",
            description: "Issued when a target has crashed.",
            parameters: [
              {
                name: "targetId",
                $ref: "TargetID"
              },
              {
                name: "status",
                description: "Termination status type.",
                type: "string"
              },
              {
                name: "errorCode",
                description: "Termination error code.",
                type: "integer"
              }
            ]
          },
          {
            name: "targetInfoChanged",
            description: "Issued when some information about a target has changed. This only happens between\n`targetCreated` and `targetDestroyed`.",
            parameters: [
              {
                name: "targetInfo",
                $ref: "TargetInfo"
              }
            ]
          }
        ]
      },
      {
        domain: "Tethering",
        description: "The Tethering domain defines methods and events for browser port binding.",
        experimental: true,
        commands: [
          {
            name: "bind",
            description: "Request browser port binding.",
            parameters: [
              {
                name: "port",
                description: "Port number to bind.",
                type: "integer"
              }
            ]
          },
          {
            name: "unbind",
            description: "Request browser port unbinding.",
            parameters: [
              {
                name: "port",
                description: "Port number to unbind.",
                type: "integer"
              }
            ]
          }
        ],
        events: [
          {
            name: "accepted",
            description: "Informs that port was successfully bound and got a specified connection id.",
            parameters: [
              {
                name: "port",
                description: "Port number that was successfully bound.",
                type: "integer"
              },
              {
                name: "connectionId",
                description: "Connection id to be used.",
                type: "string"
              }
            ]
          }
        ]
      },
      {
        domain: "Tracing",
        experimental: true,
        dependencies: [
          "IO"
        ],
        types: [
          {
            id: "MemoryDumpConfig",
            description: 'Configuration for memory dump. Used only when "memory-infra" category is enabled.',
            type: "object"
          },
          {
            id: "TraceConfig",
            type: "object",
            properties: [
              {
                name: "recordMode",
                description: "Controls how the trace buffer stores data.",
                optional: true,
                type: "string",
                enum: [
                  "recordUntilFull",
                  "recordContinuously",
                  "recordAsMuchAsPossible",
                  "echoToConsole"
                ]
              },
              {
                name: "enableSampling",
                description: "Turns on JavaScript stack sampling.",
                optional: true,
                type: "boolean"
              },
              {
                name: "enableSystrace",
                description: "Turns on system tracing.",
                optional: true,
                type: "boolean"
              },
              {
                name: "enableArgumentFilter",
                description: "Turns on argument filter.",
                optional: true,
                type: "boolean"
              },
              {
                name: "includedCategories",
                description: "Included category filters.",
                optional: true,
                type: "array",
                items: {
                  type: "string"
                }
              },
              {
                name: "excludedCategories",
                description: "Excluded category filters.",
                optional: true,
                type: "array",
                items: {
                  type: "string"
                }
              },
              {
                name: "syntheticDelays",
                description: "Configuration to synthesize the delays in tracing.",
                optional: true,
                type: "array",
                items: {
                  type: "string"
                }
              },
              {
                name: "memoryDumpConfig",
                description: 'Configuration for memory dump triggers. Used only when "memory-infra" category is enabled.',
                optional: true,
                $ref: "MemoryDumpConfig"
              }
            ]
          },
          {
            id: "StreamFormat",
            description: "Data format of a trace. Can be either the legacy JSON format or the\nprotocol buffer format. Note that the JSON format will be deprecated soon.",
            type: "string",
            enum: [
              "json",
              "proto"
            ]
          },
          {
            id: "StreamCompression",
            description: "Compression type to use for traces returned via streams.",
            type: "string",
            enum: [
              "none",
              "gzip"
            ]
          }
        ],
        commands: [
          {
            name: "end",
            description: "Stop trace events collection."
          },
          {
            name: "getCategories",
            description: "Gets supported tracing categories.",
            returns: [
              {
                name: "categories",
                description: "A list of supported tracing categories.",
                type: "array",
                items: {
                  type: "string"
                }
              }
            ]
          },
          {
            name: "recordClockSyncMarker",
            description: "Record a clock sync marker in the trace.",
            parameters: [
              {
                name: "syncId",
                description: "The ID of this clock sync marker",
                type: "string"
              }
            ]
          },
          {
            name: "requestMemoryDump",
            description: "Request a global memory dump.",
            returns: [
              {
                name: "dumpGuid",
                description: "GUID of the resulting global memory dump.",
                type: "string"
              },
              {
                name: "success",
                description: "True iff the global memory dump succeeded.",
                type: "boolean"
              }
            ]
          },
          {
            name: "start",
            description: "Start trace events collection.",
            parameters: [
              {
                name: "categories",
                description: "Category/tag filter",
                deprecated: true,
                optional: true,
                type: "string"
              },
              {
                name: "options",
                description: "Tracing options",
                deprecated: true,
                optional: true,
                type: "string"
              },
              {
                name: "bufferUsageReportingInterval",
                description: "If set, the agent will issue bufferUsage events at this interval, specified in milliseconds",
                optional: true,
                type: "number"
              },
              {
                name: "transferMode",
                description: "Whether to report trace events as series of dataCollected events or to save trace to a\nstream (defaults to `ReportEvents`).",
                optional: true,
                type: "string",
                enum: [
                  "ReportEvents",
                  "ReturnAsStream"
                ]
              },
              {
                name: "streamFormat",
                description: "Trace data format to use. This only applies when using `ReturnAsStream`\ntransfer mode (defaults to `json`).",
                optional: true,
                $ref: "StreamFormat"
              },
              {
                name: "streamCompression",
                description: "Compression format to use. This only applies when using `ReturnAsStream`\ntransfer mode (defaults to `none`)",
                optional: true,
                $ref: "StreamCompression"
              },
              {
                name: "traceConfig",
                optional: true,
                $ref: "TraceConfig"
              }
            ]
          }
        ],
        events: [
          {
            name: "bufferUsage",
            parameters: [
              {
                name: "percentFull",
                description: "A number in range [0..1] that indicates the used size of event buffer as a fraction of its\ntotal size.",
                optional: true,
                type: "number"
              },
              {
                name: "eventCount",
                description: "An approximate number of events in the trace log.",
                optional: true,
                type: "number"
              },
              {
                name: "value",
                description: "A number in range [0..1] that indicates the used size of event buffer as a fraction of its\ntotal size.",
                optional: true,
                type: "number"
              }
            ]
          },
          {
            name: "dataCollected",
            description: "Contains an bucket of collected trace events. When tracing is stopped collected events will be\nsend as a sequence of dataCollected events followed by tracingComplete event.",
            parameters: [
              {
                name: "value",
                type: "array",
                items: {
                  type: "object"
                }
              }
            ]
          },
          {
            name: "tracingComplete",
            description: "Signals that tracing is stopped and there is no trace buffers pending flush, all data were\ndelivered via dataCollected events.",
            parameters: [
              {
                name: "dataLossOccurred",
                description: "Indicates whether some trace data is known to have been lost, e.g. because the trace ring\nbuffer wrapped around.",
                type: "boolean"
              },
              {
                name: "stream",
                description: "A handle of the stream that holds resulting trace data.",
                optional: true,
                $ref: "IO.StreamHandle"
              },
              {
                name: "traceFormat",
                description: "Trace data format of returned stream.",
                optional: true,
                $ref: "StreamFormat"
              },
              {
                name: "streamCompression",
                description: "Compression format of returned stream.",
                optional: true,
                $ref: "StreamCompression"
              }
            ]
          }
        ]
      },
      {
        domain: "Fetch",
        description: "A domain for letting clients substitute browser's network layer with client code.",
        experimental: true,
        dependencies: [
          "Network",
          "IO",
          "Page"
        ],
        types: [
          {
            id: "RequestId",
            description: "Unique request identifier.",
            type: "string"
          },
          {
            id: "RequestStage",
            description: "Stages of the request to handle. Request will intercept before the request is\nsent. Response will intercept after the response is received (but before response\nbody is received.",
            experimental: true,
            type: "string",
            enum: [
              "Request",
              "Response"
            ]
          },
          {
            id: "RequestPattern",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "urlPattern",
                description: `Wildcards ('*' -> zero or more, '?' -> exactly one) are allowed. Escape character is
backslash. Omitting is equivalent to "*".`,
                optional: true,
                type: "string"
              },
              {
                name: "resourceType",
                description: "If set, only requests for matching resource types will be intercepted.",
                optional: true,
                $ref: "Network.ResourceType"
              },
              {
                name: "requestStage",
                description: "Stage at wich to begin intercepting requests. Default is Request.",
                optional: true,
                $ref: "RequestStage"
              }
            ]
          },
          {
            id: "HeaderEntry",
            description: "Response HTTP header entry",
            type: "object",
            properties: [
              {
                name: "name",
                type: "string"
              },
              {
                name: "value",
                type: "string"
              }
            ]
          },
          {
            id: "AuthChallenge",
            description: "Authorization challenge for HTTP status code 401 or 407.",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "source",
                description: "Source of the authentication challenge.",
                optional: true,
                type: "string",
                enum: [
                  "Server",
                  "Proxy"
                ]
              },
              {
                name: "origin",
                description: "Origin of the challenger.",
                type: "string"
              },
              {
                name: "scheme",
                description: "The authentication scheme used, such as basic or digest",
                type: "string"
              },
              {
                name: "realm",
                description: "The realm of the challenge. May be empty.",
                type: "string"
              }
            ]
          },
          {
            id: "AuthChallengeResponse",
            description: "Response to an AuthChallenge.",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "response",
                description: "The decision on what to do in response to the authorization challenge.  Default means\ndeferring to the default behavior of the net stack, which will likely either the Cancel\nauthentication or display a popup dialog box.",
                type: "string",
                enum: [
                  "Default",
                  "CancelAuth",
                  "ProvideCredentials"
                ]
              },
              {
                name: "username",
                description: "The username to provide, possibly empty. Should only be set if response is\nProvideCredentials.",
                optional: true,
                type: "string"
              },
              {
                name: "password",
                description: "The password to provide, possibly empty. Should only be set if response is\nProvideCredentials.",
                optional: true,
                type: "string"
              }
            ]
          }
        ],
        commands: [
          {
            name: "disable",
            description: "Disables the fetch domain."
          },
          {
            name: "enable",
            description: "Enables issuing of requestPaused events. A request will be paused until client\ncalls one of failRequest, fulfillRequest or continueRequest/continueWithAuth.",
            parameters: [
              {
                name: "patterns",
                description: "If specified, only requests matching any of these patterns will produce\nfetchRequested event and will be paused until clients response. If not set,\nall requests will be affected.",
                optional: true,
                type: "array",
                items: {
                  $ref: "RequestPattern"
                }
              },
              {
                name: "handleAuthRequests",
                description: "If true, authRequired events will be issued and requests will be paused\nexpecting a call to continueWithAuth.",
                optional: true,
                type: "boolean"
              }
            ]
          },
          {
            name: "failRequest",
            description: "Causes the request to fail with specified reason.",
            parameters: [
              {
                name: "requestId",
                description: "An id the client received in requestPaused event.",
                $ref: "RequestId"
              },
              {
                name: "errorReason",
                description: "Causes the request to fail with the given reason.",
                $ref: "Network.ErrorReason"
              }
            ]
          },
          {
            name: "fulfillRequest",
            description: "Provides response to the request.",
            parameters: [
              {
                name: "requestId",
                description: "An id the client received in requestPaused event.",
                $ref: "RequestId"
              },
              {
                name: "responseCode",
                description: "An HTTP response code.",
                type: "integer"
              },
              {
                name: "responseHeaders",
                description: "Response headers.",
                type: "array",
                items: {
                  $ref: "HeaderEntry"
                }
              },
              {
                name: "body",
                description: "A response body.",
                optional: true,
                type: "string"
              },
              {
                name: "responsePhrase",
                description: "A textual representation of responseCode.\nIf absent, a standard phrase mathcing responseCode is used.",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "continueRequest",
            description: "Continues the request, optionally modifying some of its parameters.",
            parameters: [
              {
                name: "requestId",
                description: "An id the client received in requestPaused event.",
                $ref: "RequestId"
              },
              {
                name: "url",
                description: "If set, the request url will be modified in a way that's not observable by page.",
                optional: true,
                type: "string"
              },
              {
                name: "method",
                description: "If set, the request method is overridden.",
                optional: true,
                type: "string"
              },
              {
                name: "postData",
                description: "If set, overrides the post data in the request.",
                optional: true,
                type: "string"
              },
              {
                name: "headers",
                description: "If set, overrides the request headrts.",
                optional: true,
                type: "array",
                items: {
                  $ref: "HeaderEntry"
                }
              }
            ]
          },
          {
            name: "continueWithAuth",
            description: "Continues a request supplying authChallengeResponse following authRequired event.",
            parameters: [
              {
                name: "requestId",
                description: "An id the client received in authRequired event.",
                $ref: "RequestId"
              },
              {
                name: "authChallengeResponse",
                description: "Response to  with an authChallenge.",
                $ref: "AuthChallengeResponse"
              }
            ]
          },
          {
            name: "getResponseBody",
            description: "Causes the body of the response to be received from the server and\nreturned as a single string. May only be issued for a request that\nis paused in the Response stage and is mutually exclusive with\ntakeResponseBodyForInterceptionAsStream. Calling other methods that\naffect the request or disabling fetch domain before body is received\nresults in an undefined behavior.",
            parameters: [
              {
                name: "requestId",
                description: "Identifier for the intercepted request to get body for.",
                $ref: "RequestId"
              }
            ],
            returns: [
              {
                name: "body",
                description: "Response body.",
                type: "string"
              },
              {
                name: "base64Encoded",
                description: "True, if content was sent as base64.",
                type: "boolean"
              }
            ]
          },
          {
            name: "takeResponseBodyAsStream",
            description: "Returns a handle to the stream representing the response body.\nThe request must be paused in the HeadersReceived stage.\nNote that after this command the request can't be continued\nas is -- client either needs to cancel it or to provide the\nresponse body.\nThe stream only supports sequential read, IO.read will fail if the position\nis specified.\nThis method is mutually exclusive with getResponseBody.\nCalling other methods that affect the request or disabling fetch\ndomain before body is received results in an undefined behavior.",
            parameters: [
              {
                name: "requestId",
                $ref: "RequestId"
              }
            ],
            returns: [
              {
                name: "stream",
                $ref: "IO.StreamHandle"
              }
            ]
          }
        ],
        events: [
          {
            name: "requestPaused",
            description: "Issued when the domain is enabled and the request URL matches the\nspecified filter. The request is paused until the client responds\nwith one of continueRequest, failRequest or fulfillRequest.\nThe stage of the request can be determined by presence of responseErrorReason\nand responseStatusCode -- the request is at the response stage if either\nof these fields is present and in the request stage otherwise.",
            parameters: [
              {
                name: "requestId",
                description: "Each request the page makes will have a unique id.",
                $ref: "RequestId"
              },
              {
                name: "request",
                description: "The details of the request.",
                $ref: "Network.Request"
              },
              {
                name: "frameId",
                description: "The id of the frame that initiated the request.",
                $ref: "Page.FrameId"
              },
              {
                name: "resourceType",
                description: "How the requested resource will be used.",
                $ref: "Network.ResourceType"
              },
              {
                name: "responseErrorReason",
                description: "Response error if intercepted at response stage.",
                optional: true,
                $ref: "Network.ErrorReason"
              },
              {
                name: "responseStatusCode",
                description: "Response code if intercepted at response stage.",
                optional: true,
                type: "integer"
              },
              {
                name: "responseHeaders",
                description: "Response headers if intercepted at the response stage.",
                optional: true,
                type: "array",
                items: {
                  $ref: "HeaderEntry"
                }
              },
              {
                name: "networkId",
                description: "If the intercepted request had a corresponding Network.requestWillBeSent event fired for it,\nthen this networkId will be the same as the requestId present in the requestWillBeSent event.",
                optional: true,
                $ref: "RequestId"
              }
            ]
          },
          {
            name: "authRequired",
            description: "Issued when the domain is enabled with handleAuthRequests set to true.\nThe request is paused until client responds with continueWithAuth.",
            parameters: [
              {
                name: "requestId",
                description: "Each request the page makes will have a unique id.",
                $ref: "RequestId"
              },
              {
                name: "request",
                description: "The details of the request.",
                $ref: "Network.Request"
              },
              {
                name: "frameId",
                description: "The id of the frame that initiated the request.",
                $ref: "Page.FrameId"
              },
              {
                name: "resourceType",
                description: "How the requested resource will be used.",
                $ref: "Network.ResourceType"
              },
              {
                name: "authChallenge",
                description: "Details of the Authorization Challenge encountered.\nIf this is set, client should respond with continueRequest that\ncontains AuthChallengeResponse.",
                $ref: "AuthChallenge"
              }
            ]
          }
        ]
      },
      {
        domain: "WebAudio",
        description: "This domain allows inspection of Web Audio API.\nhttps://webaudio.github.io/web-audio-api/",
        experimental: true,
        types: [
          {
            id: "ContextId",
            description: "Context's UUID in string",
            type: "string"
          },
          {
            id: "ContextType",
            description: "Enum of BaseAudioContext types",
            type: "string",
            enum: [
              "realtime",
              "offline"
            ]
          },
          {
            id: "ContextState",
            description: "Enum of AudioContextState from the spec",
            type: "string",
            enum: [
              "suspended",
              "running",
              "closed"
            ]
          },
          {
            id: "ContextRealtimeData",
            description: "Fields in AudioContext that change in real-time.",
            type: "object",
            properties: [
              {
                name: "currentTime",
                description: "The current context time in second in BaseAudioContext.",
                type: "number"
              },
              {
                name: "renderCapacity",
                description: "The time spent on rendering graph divided by render qunatum duration,\nand multiplied by 100. 100 means the audio renderer reached the full\ncapacity and glitch may occur.",
                type: "number"
              },
              {
                name: "callbackIntervalMean",
                description: "A running mean of callback interval.",
                type: "number"
              },
              {
                name: "callbackIntervalVariance",
                description: "A running variance of callback interval.",
                type: "number"
              }
            ]
          },
          {
            id: "BaseAudioContext",
            description: "Protocol object for BaseAudioContext",
            type: "object",
            properties: [
              {
                name: "contextId",
                $ref: "ContextId"
              },
              {
                name: "contextType",
                $ref: "ContextType"
              },
              {
                name: "contextState",
                $ref: "ContextState"
              },
              {
                name: "realtimeData",
                optional: true,
                $ref: "ContextRealtimeData"
              },
              {
                name: "callbackBufferSize",
                description: "Platform-dependent callback buffer size.",
                type: "number"
              },
              {
                name: "maxOutputChannelCount",
                description: "Number of output channels supported by audio hardware in use.",
                type: "number"
              },
              {
                name: "sampleRate",
                description: "Context sample rate.",
                type: "number"
              }
            ]
          }
        ],
        commands: [
          {
            name: "enable",
            description: "Enables the WebAudio domain and starts sending context lifetime events."
          },
          {
            name: "disable",
            description: "Disables the WebAudio domain."
          },
          {
            name: "getRealtimeData",
            description: "Fetch the realtime data from the registered contexts.",
            parameters: [
              {
                name: "contextId",
                $ref: "ContextId"
              }
            ],
            returns: [
              {
                name: "realtimeData",
                $ref: "ContextRealtimeData"
              }
            ]
          }
        ],
        events: [
          {
            name: "contextCreated",
            description: "Notifies that a new BaseAudioContext has been created.",
            parameters: [
              {
                name: "context",
                $ref: "BaseAudioContext"
              }
            ]
          },
          {
            name: "contextDestroyed",
            description: "Notifies that existing BaseAudioContext has been destroyed.",
            parameters: [
              {
                name: "contextId",
                $ref: "ContextId"
              }
            ]
          },
          {
            name: "contextChanged",
            description: "Notifies that existing BaseAudioContext has changed some properties (id stays the same)..",
            parameters: [
              {
                name: "context",
                $ref: "BaseAudioContext"
              }
            ]
          }
        ]
      },
      {
        domain: "WebAuthn",
        description: "This domain allows configuring virtual authenticators to test the WebAuthn\nAPI.",
        experimental: true,
        types: [
          {
            id: "AuthenticatorId",
            type: "string"
          },
          {
            id: "AuthenticatorProtocol",
            type: "string",
            enum: [
              "u2f",
              "ctap2"
            ]
          },
          {
            id: "AuthenticatorTransport",
            type: "string",
            enum: [
              "usb",
              "nfc",
              "ble",
              "cable",
              "internal"
            ]
          },
          {
            id: "VirtualAuthenticatorOptions",
            type: "object",
            properties: [
              {
                name: "protocol",
                $ref: "AuthenticatorProtocol"
              },
              {
                name: "transport",
                $ref: "AuthenticatorTransport"
              },
              {
                name: "hasResidentKey",
                type: "boolean"
              },
              {
                name: "hasUserVerification",
                type: "boolean"
              },
              {
                name: "automaticPresenceSimulation",
                description: "If set to true, tests of user presence will succeed immediately.\nOtherwise, they will not be resolved. Defaults to true.",
                optional: true,
                type: "boolean"
              }
            ]
          },
          {
            id: "Credential",
            type: "object",
            properties: [
              {
                name: "credentialId",
                type: "string"
              },
              {
                name: "rpIdHash",
                description: "SHA-256 hash of the Relying Party ID the credential is scoped to. Must\nbe 32 bytes long.\nSee https://w3c.github.io/webauthn/#rpidhash",
                type: "string"
              },
              {
                name: "privateKey",
                description: "The private key in PKCS#8 format.",
                type: "string"
              },
              {
                name: "signCount",
                description: "Signature counter. This is incremented by one for each successful\nassertion.\nSee https://w3c.github.io/webauthn/#signature-counter",
                type: "integer"
              }
            ]
          }
        ],
        commands: [
          {
            name: "enable",
            description: "Enable the WebAuthn domain and start intercepting credential storage and\nretrieval with a virtual authenticator."
          },
          {
            name: "disable",
            description: "Disable the WebAuthn domain."
          },
          {
            name: "addVirtualAuthenticator",
            description: "Creates and adds a virtual authenticator.",
            parameters: [
              {
                name: "options",
                $ref: "VirtualAuthenticatorOptions"
              }
            ],
            returns: [
              {
                name: "authenticatorId",
                $ref: "AuthenticatorId"
              }
            ]
          },
          {
            name: "removeVirtualAuthenticator",
            description: "Removes the given authenticator.",
            parameters: [
              {
                name: "authenticatorId",
                $ref: "AuthenticatorId"
              }
            ]
          },
          {
            name: "addCredential",
            description: "Adds the credential to the specified authenticator.",
            parameters: [
              {
                name: "authenticatorId",
                $ref: "AuthenticatorId"
              },
              {
                name: "credential",
                $ref: "Credential"
              }
            ]
          },
          {
            name: "getCredentials",
            description: "Returns all the credentials stored in the given virtual authenticator.",
            parameters: [
              {
                name: "authenticatorId",
                $ref: "AuthenticatorId"
              }
            ],
            returns: [
              {
                name: "credentials",
                type: "array",
                items: {
                  $ref: "Credential"
                }
              }
            ]
          },
          {
            name: "clearCredentials",
            description: "Clears all the credentials from the specified device.",
            parameters: [
              {
                name: "authenticatorId",
                $ref: "AuthenticatorId"
              }
            ]
          },
          {
            name: "setUserVerified",
            description: "Sets whether User Verification succeeds or fails for an authenticator.\nThe default is true.",
            parameters: [
              {
                name: "authenticatorId",
                $ref: "AuthenticatorId"
              },
              {
                name: "isUserVerified",
                type: "boolean"
              }
            ]
          }
        ]
      },
      {
        domain: "Console",
        description: "This domain is deprecated - use Runtime or Log instead.",
        deprecated: true,
        dependencies: [
          "Runtime"
        ],
        types: [
          {
            id: "ConsoleMessage",
            description: "Console message.",
            type: "object",
            properties: [
              {
                name: "source",
                description: "Message source.",
                type: "string",
                enum: [
                  "xml",
                  "javascript",
                  "network",
                  "console-api",
                  "storage",
                  "appcache",
                  "rendering",
                  "security",
                  "other",
                  "deprecation",
                  "worker"
                ]
              },
              {
                name: "level",
                description: "Message severity.",
                type: "string",
                enum: [
                  "log",
                  "warning",
                  "error",
                  "debug",
                  "info"
                ]
              },
              {
                name: "text",
                description: "Message text.",
                type: "string"
              },
              {
                name: "url",
                description: "URL of the message origin.",
                optional: true,
                type: "string"
              },
              {
                name: "line",
                description: "Line number in the resource that generated this message (1-based).",
                optional: true,
                type: "integer"
              },
              {
                name: "column",
                description: "Column number in the resource that generated this message (1-based).",
                optional: true,
                type: "integer"
              }
            ]
          }
        ],
        commands: [
          {
            name: "clearMessages",
            description: "Does nothing."
          },
          {
            name: "disable",
            description: "Disables console domain, prevents further console messages from being reported to the client."
          },
          {
            name: "enable",
            description: "Enables console domain, sends the messages collected so far to the client by means of the\n`messageAdded` notification."
          }
        ],
        events: [
          {
            name: "messageAdded",
            description: "Issued when new console message is added.",
            parameters: [
              {
                name: "message",
                description: "Console message that has been added.",
                $ref: "ConsoleMessage"
              }
            ]
          }
        ]
      },
      {
        domain: "Debugger",
        description: "Debugger domain exposes JavaScript debugging capabilities. It allows setting and removing\nbreakpoints, stepping through execution, exploring stack traces, etc.",
        dependencies: [
          "Runtime"
        ],
        types: [
          {
            id: "BreakpointId",
            description: "Breakpoint identifier.",
            type: "string"
          },
          {
            id: "CallFrameId",
            description: "Call frame identifier.",
            type: "string"
          },
          {
            id: "Location",
            description: "Location in the source code.",
            type: "object",
            properties: [
              {
                name: "scriptId",
                description: "Script identifier as reported in the `Debugger.scriptParsed`.",
                $ref: "Runtime.ScriptId"
              },
              {
                name: "lineNumber",
                description: "Line number in the script (0-based).",
                type: "integer"
              },
              {
                name: "columnNumber",
                description: "Column number in the script (0-based).",
                optional: true,
                type: "integer"
              }
            ]
          },
          {
            id: "ScriptPosition",
            description: "Location in the source code.",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "lineNumber",
                type: "integer"
              },
              {
                name: "columnNumber",
                type: "integer"
              }
            ]
          },
          {
            id: "CallFrame",
            description: "JavaScript call frame. Array of call frames form the call stack.",
            type: "object",
            properties: [
              {
                name: "callFrameId",
                description: "Call frame identifier. This identifier is only valid while the virtual machine is paused.",
                $ref: "CallFrameId"
              },
              {
                name: "functionName",
                description: "Name of the JavaScript function called on this call frame.",
                type: "string"
              },
              {
                name: "functionLocation",
                description: "Location in the source code.",
                optional: true,
                $ref: "Location"
              },
              {
                name: "location",
                description: "Location in the source code.",
                $ref: "Location"
              },
              {
                name: "url",
                description: "JavaScript script name or url.",
                type: "string"
              },
              {
                name: "scopeChain",
                description: "Scope chain for this call frame.",
                type: "array",
                items: {
                  $ref: "Scope"
                }
              },
              {
                name: "this",
                description: "`this` object for this call frame.",
                $ref: "Runtime.RemoteObject"
              },
              {
                name: "returnValue",
                description: "The value being returned, if the function is at return point.",
                optional: true,
                $ref: "Runtime.RemoteObject"
              }
            ]
          },
          {
            id: "Scope",
            description: "Scope description.",
            type: "object",
            properties: [
              {
                name: "type",
                description: "Scope type.",
                type: "string",
                enum: [
                  "global",
                  "local",
                  "with",
                  "closure",
                  "catch",
                  "block",
                  "script",
                  "eval",
                  "module"
                ]
              },
              {
                name: "object",
                description: "Object representing the scope. For `global` and `with` scopes it represents the actual\nobject; for the rest of the scopes, it is artificial transient object enumerating scope\nvariables as its properties.",
                $ref: "Runtime.RemoteObject"
              },
              {
                name: "name",
                optional: true,
                type: "string"
              },
              {
                name: "startLocation",
                description: "Location in the source code where scope starts",
                optional: true,
                $ref: "Location"
              },
              {
                name: "endLocation",
                description: "Location in the source code where scope ends",
                optional: true,
                $ref: "Location"
              }
            ]
          },
          {
            id: "SearchMatch",
            description: "Search match for resource.",
            type: "object",
            properties: [
              {
                name: "lineNumber",
                description: "Line number in resource content.",
                type: "number"
              },
              {
                name: "lineContent",
                description: "Line with match content.",
                type: "string"
              }
            ]
          },
          {
            id: "BreakLocation",
            type: "object",
            properties: [
              {
                name: "scriptId",
                description: "Script identifier as reported in the `Debugger.scriptParsed`.",
                $ref: "Runtime.ScriptId"
              },
              {
                name: "lineNumber",
                description: "Line number in the script (0-based).",
                type: "integer"
              },
              {
                name: "columnNumber",
                description: "Column number in the script (0-based).",
                optional: true,
                type: "integer"
              },
              {
                name: "type",
                optional: true,
                type: "string",
                enum: [
                  "debuggerStatement",
                  "call",
                  "return"
                ]
              }
            ]
          }
        ],
        commands: [
          {
            name: "continueToLocation",
            description: "Continues execution until specific location is reached.",
            parameters: [
              {
                name: "location",
                description: "Location to continue to.",
                $ref: "Location"
              },
              {
                name: "targetCallFrames",
                optional: true,
                type: "string",
                enum: [
                  "any",
                  "current"
                ]
              }
            ]
          },
          {
            name: "disable",
            description: "Disables debugger for given page."
          },
          {
            name: "enable",
            description: "Enables debugger for the given page. Clients should not assume that the debugging has been\nenabled until the result for this command is received.",
            parameters: [
              {
                name: "maxScriptsCacheSize",
                description: "The maximum size in bytes of collected scripts (not referenced by other heap objects)\nthe debugger can hold. Puts no limit if paramter is omitted.",
                experimental: true,
                optional: true,
                type: "number"
              }
            ],
            returns: [
              {
                name: "debuggerId",
                description: "Unique identifier of the debugger.",
                experimental: true,
                $ref: "Runtime.UniqueDebuggerId"
              }
            ]
          },
          {
            name: "evaluateOnCallFrame",
            description: "Evaluates expression on a given call frame.",
            parameters: [
              {
                name: "callFrameId",
                description: "Call frame identifier to evaluate on.",
                $ref: "CallFrameId"
              },
              {
                name: "expression",
                description: "Expression to evaluate.",
                type: "string"
              },
              {
                name: "objectGroup",
                description: "String object group name to put result into (allows rapid releasing resulting object handles\nusing `releaseObjectGroup`).",
                optional: true,
                type: "string"
              },
              {
                name: "includeCommandLineAPI",
                description: "Specifies whether command line API should be available to the evaluated expression, defaults\nto false.",
                optional: true,
                type: "boolean"
              },
              {
                name: "silent",
                description: "In silent mode exceptions thrown during evaluation are not reported and do not pause\nexecution. Overrides `setPauseOnException` state.",
                optional: true,
                type: "boolean"
              },
              {
                name: "returnByValue",
                description: "Whether the result is expected to be a JSON object that should be sent by value.",
                optional: true,
                type: "boolean"
              },
              {
                name: "generatePreview",
                description: "Whether preview should be generated for the result.",
                experimental: true,
                optional: true,
                type: "boolean"
              },
              {
                name: "throwOnSideEffect",
                description: "Whether to throw an exception if side effect cannot be ruled out during evaluation.",
                optional: true,
                type: "boolean"
              },
              {
                name: "timeout",
                description: "Terminate execution after timing out (number of milliseconds).",
                experimental: true,
                optional: true,
                $ref: "Runtime.TimeDelta"
              }
            ],
            returns: [
              {
                name: "result",
                description: "Object wrapper for the evaluation result.",
                $ref: "Runtime.RemoteObject"
              },
              {
                name: "exceptionDetails",
                description: "Exception details.",
                optional: true,
                $ref: "Runtime.ExceptionDetails"
              }
            ]
          },
          {
            name: "getPossibleBreakpoints",
            description: "Returns possible locations for breakpoint. scriptId in start and end range locations should be\nthe same.",
            parameters: [
              {
                name: "start",
                description: "Start of range to search possible breakpoint locations in.",
                $ref: "Location"
              },
              {
                name: "end",
                description: "End of range to search possible breakpoint locations in (excluding). When not specified, end\nof scripts is used as end of range.",
                optional: true,
                $ref: "Location"
              },
              {
                name: "restrictToFunction",
                description: "Only consider locations which are in the same (non-nested) function as start.",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "locations",
                description: "List of the possible breakpoint locations.",
                type: "array",
                items: {
                  $ref: "BreakLocation"
                }
              }
            ]
          },
          {
            name: "getScriptSource",
            description: "Returns source for the script with given id.",
            parameters: [
              {
                name: "scriptId",
                description: "Id of the script to get source for.",
                $ref: "Runtime.ScriptId"
              }
            ],
            returns: [
              {
                name: "scriptSource",
                description: "Script source.",
                type: "string"
              }
            ]
          },
          {
            name: "getStackTrace",
            description: "Returns stack trace with given `stackTraceId`.",
            experimental: true,
            parameters: [
              {
                name: "stackTraceId",
                $ref: "Runtime.StackTraceId"
              }
            ],
            returns: [
              {
                name: "stackTrace",
                $ref: "Runtime.StackTrace"
              }
            ]
          },
          {
            name: "pause",
            description: "Stops on the next JavaScript statement."
          },
          {
            name: "pauseOnAsyncCall",
            experimental: true,
            parameters: [
              {
                name: "parentStackTraceId",
                description: "Debugger will pause when async call with given stack trace is started.",
                $ref: "Runtime.StackTraceId"
              }
            ]
          },
          {
            name: "removeBreakpoint",
            description: "Removes JavaScript breakpoint.",
            parameters: [
              {
                name: "breakpointId",
                $ref: "BreakpointId"
              }
            ]
          },
          {
            name: "restartFrame",
            description: "Restarts particular call frame from the beginning.",
            parameters: [
              {
                name: "callFrameId",
                description: "Call frame identifier to evaluate on.",
                $ref: "CallFrameId"
              }
            ],
            returns: [
              {
                name: "callFrames",
                description: "New stack trace.",
                type: "array",
                items: {
                  $ref: "CallFrame"
                }
              },
              {
                name: "asyncStackTrace",
                description: "Async stack trace, if any.",
                optional: true,
                $ref: "Runtime.StackTrace"
              },
              {
                name: "asyncStackTraceId",
                description: "Async stack trace, if any.",
                experimental: true,
                optional: true,
                $ref: "Runtime.StackTraceId"
              }
            ]
          },
          {
            name: "resume",
            description: "Resumes JavaScript execution."
          },
          {
            name: "searchInContent",
            description: "Searches for given string in script content.",
            parameters: [
              {
                name: "scriptId",
                description: "Id of the script to search in.",
                $ref: "Runtime.ScriptId"
              },
              {
                name: "query",
                description: "String to search for.",
                type: "string"
              },
              {
                name: "caseSensitive",
                description: "If true, search is case sensitive.",
                optional: true,
                type: "boolean"
              },
              {
                name: "isRegex",
                description: "If true, treats string parameter as regex.",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "result",
                description: "List of search matches.",
                type: "array",
                items: {
                  $ref: "SearchMatch"
                }
              }
            ]
          },
          {
            name: "setAsyncCallStackDepth",
            description: "Enables or disables async call stacks tracking.",
            parameters: [
              {
                name: "maxDepth",
                description: "Maximum depth of async call stacks. Setting to `0` will effectively disable collecting async\ncall stacks (default).",
                type: "integer"
              }
            ]
          },
          {
            name: "setBlackboxPatterns",
            description: "Replace previous blackbox patterns with passed ones. Forces backend to skip stepping/pausing in\nscripts with url matching one of the patterns. VM will try to leave blackboxed script by\nperforming 'step in' several times, finally resorting to 'step out' if unsuccessful.",
            experimental: true,
            parameters: [
              {
                name: "patterns",
                description: "Array of regexps that will be used to check script url for blackbox state.",
                type: "array",
                items: {
                  type: "string"
                }
              }
            ]
          },
          {
            name: "setBlackboxedRanges",
            description: "Makes backend skip steps in the script in blackboxed ranges. VM will try leave blacklisted\nscripts by performing 'step in' several times, finally resorting to 'step out' if unsuccessful.\nPositions array contains positions where blackbox state is changed. First interval isn't\nblackboxed. Array should be sorted.",
            experimental: true,
            parameters: [
              {
                name: "scriptId",
                description: "Id of the script.",
                $ref: "Runtime.ScriptId"
              },
              {
                name: "positions",
                type: "array",
                items: {
                  $ref: "ScriptPosition"
                }
              }
            ]
          },
          {
            name: "setBreakpoint",
            description: "Sets JavaScript breakpoint at a given location.",
            parameters: [
              {
                name: "location",
                description: "Location to set breakpoint in.",
                $ref: "Location"
              },
              {
                name: "condition",
                description: "Expression to use as a breakpoint condition. When specified, debugger will only stop on the\nbreakpoint if this expression evaluates to true.",
                optional: true,
                type: "string"
              }
            ],
            returns: [
              {
                name: "breakpointId",
                description: "Id of the created breakpoint for further reference.",
                $ref: "BreakpointId"
              },
              {
                name: "actualLocation",
                description: "Location this breakpoint resolved into.",
                $ref: "Location"
              }
            ]
          },
          {
            name: "setInstrumentationBreakpoint",
            description: "Sets instrumentation breakpoint.",
            parameters: [
              {
                name: "instrumentation",
                description: "Instrumentation name.",
                type: "string",
                enum: [
                  "beforeScriptExecution",
                  "beforeScriptWithSourceMapExecution"
                ]
              }
            ],
            returns: [
              {
                name: "breakpointId",
                description: "Id of the created breakpoint for further reference.",
                $ref: "BreakpointId"
              }
            ]
          },
          {
            name: "setBreakpointByUrl",
            description: "Sets JavaScript breakpoint at given location specified either by URL or URL regex. Once this\ncommand is issued, all existing parsed scripts will have breakpoints resolved and returned in\n`locations` property. Further matching script parsing will result in subsequent\n`breakpointResolved` events issued. This logical breakpoint will survive page reloads.",
            parameters: [
              {
                name: "lineNumber",
                description: "Line number to set breakpoint at.",
                type: "integer"
              },
              {
                name: "url",
                description: "URL of the resources to set breakpoint on.",
                optional: true,
                type: "string"
              },
              {
                name: "urlRegex",
                description: "Regex pattern for the URLs of the resources to set breakpoints on. Either `url` or\n`urlRegex` must be specified.",
                optional: true,
                type: "string"
              },
              {
                name: "scriptHash",
                description: "Script hash of the resources to set breakpoint on.",
                optional: true,
                type: "string"
              },
              {
                name: "columnNumber",
                description: "Offset in the line to set breakpoint at.",
                optional: true,
                type: "integer"
              },
              {
                name: "condition",
                description: "Expression to use as a breakpoint condition. When specified, debugger will only stop on the\nbreakpoint if this expression evaluates to true.",
                optional: true,
                type: "string"
              }
            ],
            returns: [
              {
                name: "breakpointId",
                description: "Id of the created breakpoint for further reference.",
                $ref: "BreakpointId"
              },
              {
                name: "locations",
                description: "List of the locations this breakpoint resolved into upon addition.",
                type: "array",
                items: {
                  $ref: "Location"
                }
              }
            ]
          },
          {
            name: "setBreakpointOnFunctionCall",
            description: "Sets JavaScript breakpoint before each call to the given function.\nIf another function was created from the same source as a given one,\ncalling it will also trigger the breakpoint.",
            experimental: true,
            parameters: [
              {
                name: "objectId",
                description: "Function object id.",
                $ref: "Runtime.RemoteObjectId"
              },
              {
                name: "condition",
                description: "Expression to use as a breakpoint condition. When specified, debugger will\nstop on the breakpoint if this expression evaluates to true.",
                optional: true,
                type: "string"
              }
            ],
            returns: [
              {
                name: "breakpointId",
                description: "Id of the created breakpoint for further reference.",
                $ref: "BreakpointId"
              }
            ]
          },
          {
            name: "setBreakpointsActive",
            description: "Activates / deactivates all breakpoints on the page.",
            parameters: [
              {
                name: "active",
                description: "New value for breakpoints active state.",
                type: "boolean"
              }
            ]
          },
          {
            name: "setPauseOnExceptions",
            description: "Defines pause on exceptions state. Can be set to stop on all exceptions, uncaught exceptions or\nno exceptions. Initial pause on exceptions state is `none`.",
            parameters: [
              {
                name: "state",
                description: "Pause on exceptions mode.",
                type: "string",
                enum: [
                  "none",
                  "uncaught",
                  "all"
                ]
              }
            ]
          },
          {
            name: "setReturnValue",
            description: "Changes return value in top frame. Available only at return break position.",
            experimental: true,
            parameters: [
              {
                name: "newValue",
                description: "New return value.",
                $ref: "Runtime.CallArgument"
              }
            ]
          },
          {
            name: "setScriptSource",
            description: "Edits JavaScript source live.",
            parameters: [
              {
                name: "scriptId",
                description: "Id of the script to edit.",
                $ref: "Runtime.ScriptId"
              },
              {
                name: "scriptSource",
                description: "New content of the script.",
                type: "string"
              },
              {
                name: "dryRun",
                description: "If true the change will not actually be applied. Dry run may be used to get result\ndescription without actually modifying the code.",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "callFrames",
                description: "New stack trace in case editing has happened while VM was stopped.",
                optional: true,
                type: "array",
                items: {
                  $ref: "CallFrame"
                }
              },
              {
                name: "stackChanged",
                description: "Whether current call stack  was modified after applying the changes.",
                optional: true,
                type: "boolean"
              },
              {
                name: "asyncStackTrace",
                description: "Async stack trace, if any.",
                optional: true,
                $ref: "Runtime.StackTrace"
              },
              {
                name: "asyncStackTraceId",
                description: "Async stack trace, if any.",
                experimental: true,
                optional: true,
                $ref: "Runtime.StackTraceId"
              },
              {
                name: "exceptionDetails",
                description: "Exception details if any.",
                optional: true,
                $ref: "Runtime.ExceptionDetails"
              }
            ]
          },
          {
            name: "setSkipAllPauses",
            description: "Makes page not interrupt on any pauses (breakpoint, exception, dom exception etc).",
            parameters: [
              {
                name: "skip",
                description: "New value for skip pauses state.",
                type: "boolean"
              }
            ]
          },
          {
            name: "setVariableValue",
            description: "Changes value of variable in a callframe. Object-based scopes are not supported and must be\nmutated manually.",
            parameters: [
              {
                name: "scopeNumber",
                description: "0-based number of scope as was listed in scope chain. Only 'local', 'closure' and 'catch'\nscope types are allowed. Other scopes could be manipulated manually.",
                type: "integer"
              },
              {
                name: "variableName",
                description: "Variable name.",
                type: "string"
              },
              {
                name: "newValue",
                description: "New variable value.",
                $ref: "Runtime.CallArgument"
              },
              {
                name: "callFrameId",
                description: "Id of callframe that holds variable.",
                $ref: "CallFrameId"
              }
            ]
          },
          {
            name: "stepInto",
            description: "Steps into the function call.",
            parameters: [
              {
                name: "breakOnAsyncCall",
                description: "Debugger will issue additional Debugger.paused notification if any async task is scheduled\nbefore next pause.",
                experimental: true,
                optional: true,
                type: "boolean"
              }
            ]
          },
          {
            name: "stepOut",
            description: "Steps out of the function call."
          },
          {
            name: "stepOver",
            description: "Steps over the statement."
          }
        ],
        events: [
          {
            name: "breakpointResolved",
            description: "Fired when breakpoint is resolved to an actual script and location.",
            parameters: [
              {
                name: "breakpointId",
                description: "Breakpoint unique identifier.",
                $ref: "BreakpointId"
              },
              {
                name: "location",
                description: "Actual breakpoint location.",
                $ref: "Location"
              }
            ]
          },
          {
            name: "paused",
            description: "Fired when the virtual machine stopped on breakpoint or exception or any other stop criteria.",
            parameters: [
              {
                name: "callFrames",
                description: "Call stack the virtual machine stopped on.",
                type: "array",
                items: {
                  $ref: "CallFrame"
                }
              },
              {
                name: "reason",
                description: "Pause reason.",
                type: "string",
                enum: [
                  "ambiguous",
                  "assert",
                  "debugCommand",
                  "DOM",
                  "EventListener",
                  "exception",
                  "instrumentation",
                  "OOM",
                  "other",
                  "promiseRejection",
                  "XHR"
                ]
              },
              {
                name: "data",
                description: "Object containing break-specific auxiliary properties.",
                optional: true,
                type: "object"
              },
              {
                name: "hitBreakpoints",
                description: "Hit breakpoints IDs",
                optional: true,
                type: "array",
                items: {
                  type: "string"
                }
              },
              {
                name: "asyncStackTrace",
                description: "Async stack trace, if any.",
                optional: true,
                $ref: "Runtime.StackTrace"
              },
              {
                name: "asyncStackTraceId",
                description: "Async stack trace, if any.",
                experimental: true,
                optional: true,
                $ref: "Runtime.StackTraceId"
              },
              {
                name: "asyncCallStackTraceId",
                description: "Just scheduled async call will have this stack trace as parent stack during async execution.\nThis field is available only after `Debugger.stepInto` call with `breakOnAsynCall` flag.",
                experimental: true,
                optional: true,
                $ref: "Runtime.StackTraceId"
              }
            ]
          },
          {
            name: "resumed",
            description: "Fired when the virtual machine resumed execution."
          },
          {
            name: "scriptFailedToParse",
            description: "Fired when virtual machine fails to parse the script.",
            parameters: [
              {
                name: "scriptId",
                description: "Identifier of the script parsed.",
                $ref: "Runtime.ScriptId"
              },
              {
                name: "url",
                description: "URL or name of the script parsed (if any).",
                type: "string"
              },
              {
                name: "startLine",
                description: "Line offset of the script within the resource with given URL (for script tags).",
                type: "integer"
              },
              {
                name: "startColumn",
                description: "Column offset of the script within the resource with given URL.",
                type: "integer"
              },
              {
                name: "endLine",
                description: "Last line of the script.",
                type: "integer"
              },
              {
                name: "endColumn",
                description: "Length of the last line of the script.",
                type: "integer"
              },
              {
                name: "executionContextId",
                description: "Specifies script creation context.",
                $ref: "Runtime.ExecutionContextId"
              },
              {
                name: "hash",
                description: "Content hash of the script.",
                type: "string"
              },
              {
                name: "executionContextAuxData",
                description: "Embedder-specific auxiliary data.",
                optional: true,
                type: "object"
              },
              {
                name: "sourceMapURL",
                description: "URL of source map associated with script (if any).",
                optional: true,
                type: "string"
              },
              {
                name: "hasSourceURL",
                description: "True, if this script has sourceURL.",
                optional: true,
                type: "boolean"
              },
              {
                name: "isModule",
                description: "True, if this script is ES6 module.",
                optional: true,
                type: "boolean"
              },
              {
                name: "length",
                description: "This script length.",
                optional: true,
                type: "integer"
              },
              {
                name: "stackTrace",
                description: "JavaScript top stack frame of where the script parsed event was triggered if available.",
                experimental: true,
                optional: true,
                $ref: "Runtime.StackTrace"
              }
            ]
          },
          {
            name: "scriptParsed",
            description: "Fired when virtual machine parses script. This event is also fired for all known and uncollected\nscripts upon enabling debugger.",
            parameters: [
              {
                name: "scriptId",
                description: "Identifier of the script parsed.",
                $ref: "Runtime.ScriptId"
              },
              {
                name: "url",
                description: "URL or name of the script parsed (if any).",
                type: "string"
              },
              {
                name: "startLine",
                description: "Line offset of the script within the resource with given URL (for script tags).",
                type: "integer"
              },
              {
                name: "startColumn",
                description: "Column offset of the script within the resource with given URL.",
                type: "integer"
              },
              {
                name: "endLine",
                description: "Last line of the script.",
                type: "integer"
              },
              {
                name: "endColumn",
                description: "Length of the last line of the script.",
                type: "integer"
              },
              {
                name: "executionContextId",
                description: "Specifies script creation context.",
                $ref: "Runtime.ExecutionContextId"
              },
              {
                name: "hash",
                description: "Content hash of the script.",
                type: "string"
              },
              {
                name: "executionContextAuxData",
                description: "Embedder-specific auxiliary data.",
                optional: true,
                type: "object"
              },
              {
                name: "isLiveEdit",
                description: "True, if this script is generated as a result of the live edit operation.",
                experimental: true,
                optional: true,
                type: "boolean"
              },
              {
                name: "sourceMapURL",
                description: "URL of source map associated with script (if any).",
                optional: true,
                type: "string"
              },
              {
                name: "hasSourceURL",
                description: "True, if this script has sourceURL.",
                optional: true,
                type: "boolean"
              },
              {
                name: "isModule",
                description: "True, if this script is ES6 module.",
                optional: true,
                type: "boolean"
              },
              {
                name: "length",
                description: "This script length.",
                optional: true,
                type: "integer"
              },
              {
                name: "stackTrace",
                description: "JavaScript top stack frame of where the script parsed event was triggered if available.",
                experimental: true,
                optional: true,
                $ref: "Runtime.StackTrace"
              }
            ]
          }
        ]
      },
      {
        domain: "HeapProfiler",
        experimental: true,
        dependencies: [
          "Runtime"
        ],
        types: [
          {
            id: "HeapSnapshotObjectId",
            description: "Heap snapshot object id.",
            type: "string"
          },
          {
            id: "SamplingHeapProfileNode",
            description: "Sampling Heap Profile node. Holds callsite information, allocation statistics and child nodes.",
            type: "object",
            properties: [
              {
                name: "callFrame",
                description: "Function location.",
                $ref: "Runtime.CallFrame"
              },
              {
                name: "selfSize",
                description: "Allocations size in bytes for the node excluding children.",
                type: "number"
              },
              {
                name: "id",
                description: "Node id. Ids are unique across all profiles collected between startSampling and stopSampling.",
                type: "integer"
              },
              {
                name: "children",
                description: "Child nodes.",
                type: "array",
                items: {
                  $ref: "SamplingHeapProfileNode"
                }
              }
            ]
          },
          {
            id: "SamplingHeapProfileSample",
            description: "A single sample from a sampling profile.",
            type: "object",
            properties: [
              {
                name: "size",
                description: "Allocation size in bytes attributed to the sample.",
                type: "number"
              },
              {
                name: "nodeId",
                description: "Id of the corresponding profile tree node.",
                type: "integer"
              },
              {
                name: "ordinal",
                description: "Time-ordered sample ordinal number. It is unique across all profiles retrieved\nbetween startSampling and stopSampling.",
                type: "number"
              }
            ]
          },
          {
            id: "SamplingHeapProfile",
            description: "Sampling profile.",
            type: "object",
            properties: [
              {
                name: "head",
                $ref: "SamplingHeapProfileNode"
              },
              {
                name: "samples",
                type: "array",
                items: {
                  $ref: "SamplingHeapProfileSample"
                }
              }
            ]
          }
        ],
        commands: [
          {
            name: "addInspectedHeapObject",
            description: "Enables console to refer to the node with given id via $x (see Command Line API for more details\n$x functions).",
            parameters: [
              {
                name: "heapObjectId",
                description: "Heap snapshot object id to be accessible by means of $x command line API.",
                $ref: "HeapSnapshotObjectId"
              }
            ]
          },
          {
            name: "collectGarbage"
          },
          {
            name: "disable"
          },
          {
            name: "enable"
          },
          {
            name: "getHeapObjectId",
            parameters: [
              {
                name: "objectId",
                description: "Identifier of the object to get heap object id for.",
                $ref: "Runtime.RemoteObjectId"
              }
            ],
            returns: [
              {
                name: "heapSnapshotObjectId",
                description: "Id of the heap snapshot object corresponding to the passed remote object id.",
                $ref: "HeapSnapshotObjectId"
              }
            ]
          },
          {
            name: "getObjectByHeapObjectId",
            parameters: [
              {
                name: "objectId",
                $ref: "HeapSnapshotObjectId"
              },
              {
                name: "objectGroup",
                description: "Symbolic group name that can be used to release multiple objects.",
                optional: true,
                type: "string"
              }
            ],
            returns: [
              {
                name: "result",
                description: "Evaluation result.",
                $ref: "Runtime.RemoteObject"
              }
            ]
          },
          {
            name: "getSamplingProfile",
            returns: [
              {
                name: "profile",
                description: "Return the sampling profile being collected.",
                $ref: "SamplingHeapProfile"
              }
            ]
          },
          {
            name: "startSampling",
            parameters: [
              {
                name: "samplingInterval",
                description: "Average sample interval in bytes. Poisson distribution is used for the intervals. The\ndefault value is 32768 bytes.",
                optional: true,
                type: "number"
              }
            ]
          },
          {
            name: "startTrackingHeapObjects",
            parameters: [
              {
                name: "trackAllocations",
                optional: true,
                type: "boolean"
              }
            ]
          },
          {
            name: "stopSampling",
            returns: [
              {
                name: "profile",
                description: "Recorded sampling heap profile.",
                $ref: "SamplingHeapProfile"
              }
            ]
          },
          {
            name: "stopTrackingHeapObjects",
            parameters: [
              {
                name: "reportProgress",
                description: "If true 'reportHeapSnapshotProgress' events will be generated while snapshot is being taken\nwhen the tracking is stopped.",
                optional: true,
                type: "boolean"
              }
            ]
          },
          {
            name: "takeHeapSnapshot",
            parameters: [
              {
                name: "reportProgress",
                description: "If true 'reportHeapSnapshotProgress' events will be generated while snapshot is being taken.",
                optional: true,
                type: "boolean"
              }
            ]
          }
        ],
        events: [
          {
            name: "addHeapSnapshotChunk",
            parameters: [
              {
                name: "chunk",
                type: "string"
              }
            ]
          },
          {
            name: "heapStatsUpdate",
            description: "If heap objects tracking has been started then backend may send update for one or more fragments",
            parameters: [
              {
                name: "statsUpdate",
                description: "An array of triplets. Each triplet describes a fragment. The first integer is the fragment\nindex, the second integer is a total count of objects for the fragment, the third integer is\na total size of the objects for the fragment.",
                type: "array",
                items: {
                  type: "integer"
                }
              }
            ]
          },
          {
            name: "lastSeenObjectId",
            description: "If heap objects tracking has been started then backend regularly sends a current value for last\nseen object id and corresponding timestamp. If the were changes in the heap since last event\nthen one or more heapStatsUpdate events will be sent before a new lastSeenObjectId event.",
            parameters: [
              {
                name: "lastSeenObjectId",
                type: "integer"
              },
              {
                name: "timestamp",
                type: "number"
              }
            ]
          },
          {
            name: "reportHeapSnapshotProgress",
            parameters: [
              {
                name: "done",
                type: "integer"
              },
              {
                name: "total",
                type: "integer"
              },
              {
                name: "finished",
                optional: true,
                type: "boolean"
              }
            ]
          },
          {
            name: "resetProfiles"
          }
        ]
      },
      {
        domain: "Profiler",
        dependencies: [
          "Runtime",
          "Debugger"
        ],
        types: [
          {
            id: "ProfileNode",
            description: "Profile node. Holds callsite information, execution statistics and child nodes.",
            type: "object",
            properties: [
              {
                name: "id",
                description: "Unique id of the node.",
                type: "integer"
              },
              {
                name: "callFrame",
                description: "Function location.",
                $ref: "Runtime.CallFrame"
              },
              {
                name: "hitCount",
                description: "Number of samples where this node was on top of the call stack.",
                optional: true,
                type: "integer"
              },
              {
                name: "children",
                description: "Child node ids.",
                optional: true,
                type: "array",
                items: {
                  type: "integer"
                }
              },
              {
                name: "deoptReason",
                description: "The reason of being not optimized. The function may be deoptimized or marked as don't\noptimize.",
                optional: true,
                type: "string"
              },
              {
                name: "positionTicks",
                description: "An array of source position ticks.",
                optional: true,
                type: "array",
                items: {
                  $ref: "PositionTickInfo"
                }
              }
            ]
          },
          {
            id: "Profile",
            description: "Profile.",
            type: "object",
            properties: [
              {
                name: "nodes",
                description: "The list of profile nodes. First item is the root node.",
                type: "array",
                items: {
                  $ref: "ProfileNode"
                }
              },
              {
                name: "startTime",
                description: "Profiling start timestamp in microseconds.",
                type: "number"
              },
              {
                name: "endTime",
                description: "Profiling end timestamp in microseconds.",
                type: "number"
              },
              {
                name: "samples",
                description: "Ids of samples top nodes.",
                optional: true,
                type: "array",
                items: {
                  type: "integer"
                }
              },
              {
                name: "timeDeltas",
                description: "Time intervals between adjacent samples in microseconds. The first delta is relative to the\nprofile startTime.",
                optional: true,
                type: "array",
                items: {
                  type: "integer"
                }
              }
            ]
          },
          {
            id: "PositionTickInfo",
            description: "Specifies a number of samples attributed to a certain source position.",
            type: "object",
            properties: [
              {
                name: "line",
                description: "Source line number (1-based).",
                type: "integer"
              },
              {
                name: "ticks",
                description: "Number of samples attributed to the source line.",
                type: "integer"
              }
            ]
          },
          {
            id: "CoverageRange",
            description: "Coverage data for a source range.",
            type: "object",
            properties: [
              {
                name: "startOffset",
                description: "JavaScript script source offset for the range start.",
                type: "integer"
              },
              {
                name: "endOffset",
                description: "JavaScript script source offset for the range end.",
                type: "integer"
              },
              {
                name: "count",
                description: "Collected execution count of the source range.",
                type: "integer"
              }
            ]
          },
          {
            id: "FunctionCoverage",
            description: "Coverage data for a JavaScript function.",
            type: "object",
            properties: [
              {
                name: "functionName",
                description: "JavaScript function name.",
                type: "string"
              },
              {
                name: "ranges",
                description: "Source ranges inside the function with coverage data.",
                type: "array",
                items: {
                  $ref: "CoverageRange"
                }
              },
              {
                name: "isBlockCoverage",
                description: "Whether coverage data for this function has block granularity.",
                type: "boolean"
              }
            ]
          },
          {
            id: "ScriptCoverage",
            description: "Coverage data for a JavaScript script.",
            type: "object",
            properties: [
              {
                name: "scriptId",
                description: "JavaScript script id.",
                $ref: "Runtime.ScriptId"
              },
              {
                name: "url",
                description: "JavaScript script name or url.",
                type: "string"
              },
              {
                name: "functions",
                description: "Functions contained in the script that has coverage data.",
                type: "array",
                items: {
                  $ref: "FunctionCoverage"
                }
              }
            ]
          },
          {
            id: "TypeObject",
            description: "Describes a type collected during runtime.",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "name",
                description: "Name of a type collected with type profiling.",
                type: "string"
              }
            ]
          },
          {
            id: "TypeProfileEntry",
            description: "Source offset and types for a parameter or return value.",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "offset",
                description: "Source offset of the parameter or end of function for return values.",
                type: "integer"
              },
              {
                name: "types",
                description: "The types for this parameter or return value.",
                type: "array",
                items: {
                  $ref: "TypeObject"
                }
              }
            ]
          },
          {
            id: "ScriptTypeProfile",
            description: "Type profile data collected during runtime for a JavaScript script.",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "scriptId",
                description: "JavaScript script id.",
                $ref: "Runtime.ScriptId"
              },
              {
                name: "url",
                description: "JavaScript script name or url.",
                type: "string"
              },
              {
                name: "entries",
                description: "Type profile entries for parameters and return values of the functions in the script.",
                type: "array",
                items: {
                  $ref: "TypeProfileEntry"
                }
              }
            ]
          }
        ],
        commands: [
          {
            name: "disable"
          },
          {
            name: "enable"
          },
          {
            name: "getBestEffortCoverage",
            description: "Collect coverage data for the current isolate. The coverage data may be incomplete due to\ngarbage collection.",
            returns: [
              {
                name: "result",
                description: "Coverage data for the current isolate.",
                type: "array",
                items: {
                  $ref: "ScriptCoverage"
                }
              }
            ]
          },
          {
            name: "setSamplingInterval",
            description: "Changes CPU profiler sampling interval. Must be called before CPU profiles recording started.",
            parameters: [
              {
                name: "interval",
                description: "New sampling interval in microseconds.",
                type: "integer"
              }
            ]
          },
          {
            name: "start"
          },
          {
            name: "startPreciseCoverage",
            description: "Enable precise code coverage. Coverage data for JavaScript executed before enabling precise code\ncoverage may be incomplete. Enabling prevents running optimized code and resets execution\ncounters.",
            parameters: [
              {
                name: "callCount",
                description: "Collect accurate call counts beyond simple 'covered' or 'not covered'.",
                optional: true,
                type: "boolean"
              },
              {
                name: "detailed",
                description: "Collect block-based coverage.",
                optional: true,
                type: "boolean"
              }
            ]
          },
          {
            name: "startTypeProfile",
            description: "Enable type profile.",
            experimental: true
          },
          {
            name: "stop",
            returns: [
              {
                name: "profile",
                description: "Recorded profile.",
                $ref: "Profile"
              }
            ]
          },
          {
            name: "stopPreciseCoverage",
            description: "Disable precise code coverage. Disabling releases unnecessary execution count records and allows\nexecuting optimized code."
          },
          {
            name: "stopTypeProfile",
            description: "Disable type profile. Disabling releases type profile data collected so far.",
            experimental: true
          },
          {
            name: "takePreciseCoverage",
            description: "Collect coverage data for the current isolate, and resets execution counters. Precise code\ncoverage needs to have started.",
            returns: [
              {
                name: "result",
                description: "Coverage data for the current isolate.",
                type: "array",
                items: {
                  $ref: "ScriptCoverage"
                }
              }
            ]
          },
          {
            name: "takeTypeProfile",
            description: "Collect type profile.",
            experimental: true,
            returns: [
              {
                name: "result",
                description: "Type profile for all scripts since startTypeProfile() was turned on.",
                type: "array",
                items: {
                  $ref: "ScriptTypeProfile"
                }
              }
            ]
          }
        ],
        events: [
          {
            name: "consoleProfileFinished",
            parameters: [
              {
                name: "id",
                type: "string"
              },
              {
                name: "location",
                description: "Location of console.profileEnd().",
                $ref: "Debugger.Location"
              },
              {
                name: "profile",
                $ref: "Profile"
              },
              {
                name: "title",
                description: "Profile title passed as an argument to console.profile().",
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "consoleProfileStarted",
            description: "Sent when new profile recording is started using console.profile() call.",
            parameters: [
              {
                name: "id",
                type: "string"
              },
              {
                name: "location",
                description: "Location of console.profile().",
                $ref: "Debugger.Location"
              },
              {
                name: "title",
                description: "Profile title passed as an argument to console.profile().",
                optional: true,
                type: "string"
              }
            ]
          }
        ]
      },
      {
        domain: "Runtime",
        description: "Runtime domain exposes JavaScript runtime by means of remote evaluation and mirror objects.\nEvaluation results are returned as mirror object that expose object type, string representation\nand unique identifier that can be used for further object reference. Original objects are\nmaintained in memory unless they are either explicitly released or are released along with the\nother objects in their object group.",
        types: [
          {
            id: "ScriptId",
            description: "Unique script identifier.",
            type: "string"
          },
          {
            id: "RemoteObjectId",
            description: "Unique object identifier.",
            type: "string"
          },
          {
            id: "UnserializableValue",
            description: "Primitive value which cannot be JSON-stringified. Includes values `-0`, `NaN`, `Infinity`,\n`-Infinity`, and bigint literals.",
            type: "string"
          },
          {
            id: "RemoteObject",
            description: "Mirror object referencing original JavaScript object.",
            type: "object",
            properties: [
              {
                name: "type",
                description: "Object type.",
                type: "string",
                enum: [
                  "object",
                  "function",
                  "undefined",
                  "string",
                  "number",
                  "boolean",
                  "symbol",
                  "bigint"
                ]
              },
              {
                name: "subtype",
                description: "Object subtype hint. Specified for `object` type values only.",
                optional: true,
                type: "string",
                enum: [
                  "array",
                  "null",
                  "node",
                  "regexp",
                  "date",
                  "map",
                  "set",
                  "weakmap",
                  "weakset",
                  "iterator",
                  "generator",
                  "error",
                  "proxy",
                  "promise",
                  "typedarray",
                  "arraybuffer",
                  "dataview"
                ]
              },
              {
                name: "className",
                description: "Object class (constructor) name. Specified for `object` type values only.",
                optional: true,
                type: "string"
              },
              {
                name: "value",
                description: "Remote object value in case of primitive values or JSON values (if it was requested).",
                optional: true,
                type: "any"
              },
              {
                name: "unserializableValue",
                description: "Primitive value which can not be JSON-stringified does not have `value`, but gets this\nproperty.",
                optional: true,
                $ref: "UnserializableValue"
              },
              {
                name: "description",
                description: "String representation of the object.",
                optional: true,
                type: "string"
              },
              {
                name: "objectId",
                description: "Unique object identifier (for non-primitive values).",
                optional: true,
                $ref: "RemoteObjectId"
              },
              {
                name: "preview",
                description: "Preview containing abbreviated property values. Specified for `object` type values only.",
                experimental: true,
                optional: true,
                $ref: "ObjectPreview"
              },
              {
                name: "customPreview",
                experimental: true,
                optional: true,
                $ref: "CustomPreview"
              }
            ]
          },
          {
            id: "CustomPreview",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "header",
                description: "The JSON-stringified result of formatter.header(object, config) call.\nIt contains json ML array that represents RemoteObject.",
                type: "string"
              },
              {
                name: "bodyGetterId",
                description: "If formatter returns true as a result of formatter.hasBody call then bodyGetterId will\ncontain RemoteObjectId for the function that returns result of formatter.body(object, config) call.\nThe result value is json ML array.",
                optional: true,
                $ref: "RemoteObjectId"
              }
            ]
          },
          {
            id: "ObjectPreview",
            description: "Object containing abbreviated remote object value.",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "type",
                description: "Object type.",
                type: "string",
                enum: [
                  "object",
                  "function",
                  "undefined",
                  "string",
                  "number",
                  "boolean",
                  "symbol",
                  "bigint"
                ]
              },
              {
                name: "subtype",
                description: "Object subtype hint. Specified for `object` type values only.",
                optional: true,
                type: "string",
                enum: [
                  "array",
                  "null",
                  "node",
                  "regexp",
                  "date",
                  "map",
                  "set",
                  "weakmap",
                  "weakset",
                  "iterator",
                  "generator",
                  "error"
                ]
              },
              {
                name: "description",
                description: "String representation of the object.",
                optional: true,
                type: "string"
              },
              {
                name: "overflow",
                description: "True iff some of the properties or entries of the original object did not fit.",
                type: "boolean"
              },
              {
                name: "properties",
                description: "List of the properties.",
                type: "array",
                items: {
                  $ref: "PropertyPreview"
                }
              },
              {
                name: "entries",
                description: "List of the entries. Specified for `map` and `set` subtype values only.",
                optional: true,
                type: "array",
                items: {
                  $ref: "EntryPreview"
                }
              }
            ]
          },
          {
            id: "PropertyPreview",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "name",
                description: "Property name.",
                type: "string"
              },
              {
                name: "type",
                description: "Object type. Accessor means that the property itself is an accessor property.",
                type: "string",
                enum: [
                  "object",
                  "function",
                  "undefined",
                  "string",
                  "number",
                  "boolean",
                  "symbol",
                  "accessor",
                  "bigint"
                ]
              },
              {
                name: "value",
                description: "User-friendly property value string.",
                optional: true,
                type: "string"
              },
              {
                name: "valuePreview",
                description: "Nested value preview.",
                optional: true,
                $ref: "ObjectPreview"
              },
              {
                name: "subtype",
                description: "Object subtype hint. Specified for `object` type values only.",
                optional: true,
                type: "string",
                enum: [
                  "array",
                  "null",
                  "node",
                  "regexp",
                  "date",
                  "map",
                  "set",
                  "weakmap",
                  "weakset",
                  "iterator",
                  "generator",
                  "error"
                ]
              }
            ]
          },
          {
            id: "EntryPreview",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "key",
                description: "Preview of the key. Specified for map-like collection entries.",
                optional: true,
                $ref: "ObjectPreview"
              },
              {
                name: "value",
                description: "Preview of the value.",
                $ref: "ObjectPreview"
              }
            ]
          },
          {
            id: "PropertyDescriptor",
            description: "Object property descriptor.",
            type: "object",
            properties: [
              {
                name: "name",
                description: "Property name or symbol description.",
                type: "string"
              },
              {
                name: "value",
                description: "The value associated with the property.",
                optional: true,
                $ref: "RemoteObject"
              },
              {
                name: "writable",
                description: "True if the value associated with the property may be changed (data descriptors only).",
                optional: true,
                type: "boolean"
              },
              {
                name: "get",
                description: "A function which serves as a getter for the property, or `undefined` if there is no getter\n(accessor descriptors only).",
                optional: true,
                $ref: "RemoteObject"
              },
              {
                name: "set",
                description: "A function which serves as a setter for the property, or `undefined` if there is no setter\n(accessor descriptors only).",
                optional: true,
                $ref: "RemoteObject"
              },
              {
                name: "configurable",
                description: "True if the type of this property descriptor may be changed and if the property may be\ndeleted from the corresponding object.",
                type: "boolean"
              },
              {
                name: "enumerable",
                description: "True if this property shows up during enumeration of the properties on the corresponding\nobject.",
                type: "boolean"
              },
              {
                name: "wasThrown",
                description: "True if the result was thrown during the evaluation.",
                optional: true,
                type: "boolean"
              },
              {
                name: "isOwn",
                description: "True if the property is owned for the object.",
                optional: true,
                type: "boolean"
              },
              {
                name: "symbol",
                description: "Property symbol object, if the property is of the `symbol` type.",
                optional: true,
                $ref: "RemoteObject"
              }
            ]
          },
          {
            id: "InternalPropertyDescriptor",
            description: "Object internal property descriptor. This property isn't normally visible in JavaScript code.",
            type: "object",
            properties: [
              {
                name: "name",
                description: "Conventional property name.",
                type: "string"
              },
              {
                name: "value",
                description: "The value associated with the property.",
                optional: true,
                $ref: "RemoteObject"
              }
            ]
          },
          {
            id: "PrivatePropertyDescriptor",
            description: "Object private field descriptor.",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "name",
                description: "Private property name.",
                type: "string"
              },
              {
                name: "value",
                description: "The value associated with the private property.",
                $ref: "RemoteObject"
              }
            ]
          },
          {
            id: "CallArgument",
            description: "Represents function call argument. Either remote object id `objectId`, primitive `value`,\nunserializable primitive value or neither of (for undefined) them should be specified.",
            type: "object",
            properties: [
              {
                name: "value",
                description: "Primitive value or serializable javascript object.",
                optional: true,
                type: "any"
              },
              {
                name: "unserializableValue",
                description: "Primitive value which can not be JSON-stringified.",
                optional: true,
                $ref: "UnserializableValue"
              },
              {
                name: "objectId",
                description: "Remote object handle.",
                optional: true,
                $ref: "RemoteObjectId"
              }
            ]
          },
          {
            id: "ExecutionContextId",
            description: "Id of an execution context.",
            type: "integer"
          },
          {
            id: "ExecutionContextDescription",
            description: "Description of an isolated world.",
            type: "object",
            properties: [
              {
                name: "id",
                description: "Unique id of the execution context. It can be used to specify in which execution context\nscript evaluation should be performed.",
                $ref: "ExecutionContextId"
              },
              {
                name: "origin",
                description: "Execution context origin.",
                type: "string"
              },
              {
                name: "name",
                description: "Human readable name describing given context.",
                type: "string"
              },
              {
                name: "auxData",
                description: "Embedder-specific auxiliary data.",
                optional: true,
                type: "object"
              }
            ]
          },
          {
            id: "ExceptionDetails",
            description: "Detailed information about exception (or error) that was thrown during script compilation or\nexecution.",
            type: "object",
            properties: [
              {
                name: "exceptionId",
                description: "Exception id.",
                type: "integer"
              },
              {
                name: "text",
                description: "Exception text, which should be used together with exception object when available.",
                type: "string"
              },
              {
                name: "lineNumber",
                description: "Line number of the exception location (0-based).",
                type: "integer"
              },
              {
                name: "columnNumber",
                description: "Column number of the exception location (0-based).",
                type: "integer"
              },
              {
                name: "scriptId",
                description: "Script ID of the exception location.",
                optional: true,
                $ref: "ScriptId"
              },
              {
                name: "url",
                description: "URL of the exception location, to be used when the script was not reported.",
                optional: true,
                type: "string"
              },
              {
                name: "stackTrace",
                description: "JavaScript stack trace if available.",
                optional: true,
                $ref: "StackTrace"
              },
              {
                name: "exception",
                description: "Exception object if available.",
                optional: true,
                $ref: "RemoteObject"
              },
              {
                name: "executionContextId",
                description: "Identifier of the context where exception happened.",
                optional: true,
                $ref: "ExecutionContextId"
              }
            ]
          },
          {
            id: "Timestamp",
            description: "Number of milliseconds since epoch.",
            type: "number"
          },
          {
            id: "TimeDelta",
            description: "Number of milliseconds.",
            type: "number"
          },
          {
            id: "CallFrame",
            description: "Stack entry for runtime errors and assertions.",
            type: "object",
            properties: [
              {
                name: "functionName",
                description: "JavaScript function name.",
                type: "string"
              },
              {
                name: "scriptId",
                description: "JavaScript script id.",
                $ref: "ScriptId"
              },
              {
                name: "url",
                description: "JavaScript script name or url.",
                type: "string"
              },
              {
                name: "lineNumber",
                description: "JavaScript script line number (0-based).",
                type: "integer"
              },
              {
                name: "columnNumber",
                description: "JavaScript script column number (0-based).",
                type: "integer"
              }
            ]
          },
          {
            id: "StackTrace",
            description: "Call frames for assertions or error messages.",
            type: "object",
            properties: [
              {
                name: "description",
                description: "String label of this stack trace. For async traces this may be a name of the function that\ninitiated the async call.",
                optional: true,
                type: "string"
              },
              {
                name: "callFrames",
                description: "JavaScript function name.",
                type: "array",
                items: {
                  $ref: "CallFrame"
                }
              },
              {
                name: "parent",
                description: "Asynchronous JavaScript stack trace that preceded this stack, if available.",
                optional: true,
                $ref: "StackTrace"
              },
              {
                name: "parentId",
                description: "Asynchronous JavaScript stack trace that preceded this stack, if available.",
                experimental: true,
                optional: true,
                $ref: "StackTraceId"
              }
            ]
          },
          {
            id: "UniqueDebuggerId",
            description: "Unique identifier of current debugger.",
            experimental: true,
            type: "string"
          },
          {
            id: "StackTraceId",
            description: "If `debuggerId` is set stack trace comes from another debugger and can be resolved there. This\nallows to track cross-debugger calls. See `Runtime.StackTrace` and `Debugger.paused` for usages.",
            experimental: true,
            type: "object",
            properties: [
              {
                name: "id",
                type: "string"
              },
              {
                name: "debuggerId",
                optional: true,
                $ref: "UniqueDebuggerId"
              }
            ]
          }
        ],
        commands: [
          {
            name: "awaitPromise",
            description: "Add handler to promise with given promise object id.",
            parameters: [
              {
                name: "promiseObjectId",
                description: "Identifier of the promise.",
                $ref: "RemoteObjectId"
              },
              {
                name: "returnByValue",
                description: "Whether the result is expected to be a JSON object that should be sent by value.",
                optional: true,
                type: "boolean"
              },
              {
                name: "generatePreview",
                description: "Whether preview should be generated for the result.",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "result",
                description: "Promise result. Will contain rejected value if promise was rejected.",
                $ref: "RemoteObject"
              },
              {
                name: "exceptionDetails",
                description: "Exception details if stack strace is available.",
                optional: true,
                $ref: "ExceptionDetails"
              }
            ]
          },
          {
            name: "callFunctionOn",
            description: "Calls function with given declaration on the given object. Object group of the result is\ninherited from the target object.",
            parameters: [
              {
                name: "functionDeclaration",
                description: "Declaration of the function to call.",
                type: "string"
              },
              {
                name: "objectId",
                description: "Identifier of the object to call function on. Either objectId or executionContextId should\nbe specified.",
                optional: true,
                $ref: "RemoteObjectId"
              },
              {
                name: "arguments",
                description: "Call arguments. All call arguments must belong to the same JavaScript world as the target\nobject.",
                optional: true,
                type: "array",
                items: {
                  $ref: "CallArgument"
                }
              },
              {
                name: "silent",
                description: "In silent mode exceptions thrown during evaluation are not reported and do not pause\nexecution. Overrides `setPauseOnException` state.",
                optional: true,
                type: "boolean"
              },
              {
                name: "returnByValue",
                description: "Whether the result is expected to be a JSON object which should be sent by value.",
                optional: true,
                type: "boolean"
              },
              {
                name: "generatePreview",
                description: "Whether preview should be generated for the result.",
                experimental: true,
                optional: true,
                type: "boolean"
              },
              {
                name: "userGesture",
                description: "Whether execution should be treated as initiated by user in the UI.",
                optional: true,
                type: "boolean"
              },
              {
                name: "awaitPromise",
                description: "Whether execution should `await` for resulting value and return once awaited promise is\nresolved.",
                optional: true,
                type: "boolean"
              },
              {
                name: "executionContextId",
                description: "Specifies execution context which global object will be used to call function on. Either\nexecutionContextId or objectId should be specified.",
                optional: true,
                $ref: "ExecutionContextId"
              },
              {
                name: "objectGroup",
                description: "Symbolic group name that can be used to release multiple objects. If objectGroup is not\nspecified and objectId is, objectGroup will be inherited from object.",
                optional: true,
                type: "string"
              }
            ],
            returns: [
              {
                name: "result",
                description: "Call result.",
                $ref: "RemoteObject"
              },
              {
                name: "exceptionDetails",
                description: "Exception details.",
                optional: true,
                $ref: "ExceptionDetails"
              }
            ]
          },
          {
            name: "compileScript",
            description: "Compiles expression.",
            parameters: [
              {
                name: "expression",
                description: "Expression to compile.",
                type: "string"
              },
              {
                name: "sourceURL",
                description: "Source url to be set for the script.",
                type: "string"
              },
              {
                name: "persistScript",
                description: "Specifies whether the compiled script should be persisted.",
                type: "boolean"
              },
              {
                name: "executionContextId",
                description: "Specifies in which execution context to perform script run. If the parameter is omitted the\nevaluation will be performed in the context of the inspected page.",
                optional: true,
                $ref: "ExecutionContextId"
              }
            ],
            returns: [
              {
                name: "scriptId",
                description: "Id of the script.",
                optional: true,
                $ref: "ScriptId"
              },
              {
                name: "exceptionDetails",
                description: "Exception details.",
                optional: true,
                $ref: "ExceptionDetails"
              }
            ]
          },
          {
            name: "disable",
            description: "Disables reporting of execution contexts creation."
          },
          {
            name: "discardConsoleEntries",
            description: "Discards collected exceptions and console API calls."
          },
          {
            name: "enable",
            description: "Enables reporting of execution contexts creation by means of `executionContextCreated` event.\nWhen the reporting gets enabled the event will be sent immediately for each existing execution\ncontext."
          },
          {
            name: "evaluate",
            description: "Evaluates expression on global object.",
            parameters: [
              {
                name: "expression",
                description: "Expression to evaluate.",
                type: "string"
              },
              {
                name: "objectGroup",
                description: "Symbolic group name that can be used to release multiple objects.",
                optional: true,
                type: "string"
              },
              {
                name: "includeCommandLineAPI",
                description: "Determines whether Command Line API should be available during the evaluation.",
                optional: true,
                type: "boolean"
              },
              {
                name: "silent",
                description: "In silent mode exceptions thrown during evaluation are not reported and do not pause\nexecution. Overrides `setPauseOnException` state.",
                optional: true,
                type: "boolean"
              },
              {
                name: "contextId",
                description: "Specifies in which execution context to perform evaluation. If the parameter is omitted the\nevaluation will be performed in the context of the inspected page.",
                optional: true,
                $ref: "ExecutionContextId"
              },
              {
                name: "returnByValue",
                description: "Whether the result is expected to be a JSON object that should be sent by value.",
                optional: true,
                type: "boolean"
              },
              {
                name: "generatePreview",
                description: "Whether preview should be generated for the result.",
                experimental: true,
                optional: true,
                type: "boolean"
              },
              {
                name: "userGesture",
                description: "Whether execution should be treated as initiated by user in the UI.",
                optional: true,
                type: "boolean"
              },
              {
                name: "awaitPromise",
                description: "Whether execution should `await` for resulting value and return once awaited promise is\nresolved.",
                optional: true,
                type: "boolean"
              },
              {
                name: "throwOnSideEffect",
                description: "Whether to throw an exception if side effect cannot be ruled out during evaluation.",
                experimental: true,
                optional: true,
                type: "boolean"
              },
              {
                name: "timeout",
                description: "Terminate execution after timing out (number of milliseconds).",
                experimental: true,
                optional: true,
                $ref: "TimeDelta"
              }
            ],
            returns: [
              {
                name: "result",
                description: "Evaluation result.",
                $ref: "RemoteObject"
              },
              {
                name: "exceptionDetails",
                description: "Exception details.",
                optional: true,
                $ref: "ExceptionDetails"
              }
            ]
          },
          {
            name: "getIsolateId",
            description: "Returns the isolate id.",
            experimental: true,
            returns: [
              {
                name: "id",
                description: "The isolate id.",
                type: "string"
              }
            ]
          },
          {
            name: "getHeapUsage",
            description: "Returns the JavaScript heap usage.\nIt is the total usage of the corresponding isolate not scoped to a particular Runtime.",
            experimental: true,
            returns: [
              {
                name: "usedSize",
                description: "Used heap size in bytes.",
                type: "number"
              },
              {
                name: "totalSize",
                description: "Allocated heap size in bytes.",
                type: "number"
              }
            ]
          },
          {
            name: "getProperties",
            description: "Returns properties of a given object. Object group of the result is inherited from the target\nobject.",
            parameters: [
              {
                name: "objectId",
                description: "Identifier of the object to return properties for.",
                $ref: "RemoteObjectId"
              },
              {
                name: "ownProperties",
                description: "If true, returns properties belonging only to the element itself, not to its prototype\nchain.",
                optional: true,
                type: "boolean"
              },
              {
                name: "accessorPropertiesOnly",
                description: "If true, returns accessor properties (with getter/setter) only; internal properties are not\nreturned either.",
                experimental: true,
                optional: true,
                type: "boolean"
              },
              {
                name: "generatePreview",
                description: "Whether preview should be generated for the results.",
                experimental: true,
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "result",
                description: "Object properties.",
                type: "array",
                items: {
                  $ref: "PropertyDescriptor"
                }
              },
              {
                name: "internalProperties",
                description: "Internal object properties (only of the element itself).",
                optional: true,
                type: "array",
                items: {
                  $ref: "InternalPropertyDescriptor"
                }
              },
              {
                name: "privateProperties",
                description: "Object private properties.",
                experimental: true,
                optional: true,
                type: "array",
                items: {
                  $ref: "PrivatePropertyDescriptor"
                }
              },
              {
                name: "exceptionDetails",
                description: "Exception details.",
                optional: true,
                $ref: "ExceptionDetails"
              }
            ]
          },
          {
            name: "globalLexicalScopeNames",
            description: "Returns all let, const and class variables from global scope.",
            parameters: [
              {
                name: "executionContextId",
                description: "Specifies in which execution context to lookup global scope variables.",
                optional: true,
                $ref: "ExecutionContextId"
              }
            ],
            returns: [
              {
                name: "names",
                type: "array",
                items: {
                  type: "string"
                }
              }
            ]
          },
          {
            name: "queryObjects",
            parameters: [
              {
                name: "prototypeObjectId",
                description: "Identifier of the prototype to return objects for.",
                $ref: "RemoteObjectId"
              },
              {
                name: "objectGroup",
                description: "Symbolic group name that can be used to release the results.",
                optional: true,
                type: "string"
              }
            ],
            returns: [
              {
                name: "objects",
                description: "Array with objects.",
                $ref: "RemoteObject"
              }
            ]
          },
          {
            name: "releaseObject",
            description: "Releases remote object with given id.",
            parameters: [
              {
                name: "objectId",
                description: "Identifier of the object to release.",
                $ref: "RemoteObjectId"
              }
            ]
          },
          {
            name: "releaseObjectGroup",
            description: "Releases all remote objects that belong to a given group.",
            parameters: [
              {
                name: "objectGroup",
                description: "Symbolic object group name.",
                type: "string"
              }
            ]
          },
          {
            name: "runIfWaitingForDebugger",
            description: "Tells inspected instance to run if it was waiting for debugger to attach."
          },
          {
            name: "runScript",
            description: "Runs script with given id in a given context.",
            parameters: [
              {
                name: "scriptId",
                description: "Id of the script to run.",
                $ref: "ScriptId"
              },
              {
                name: "executionContextId",
                description: "Specifies in which execution context to perform script run. If the parameter is omitted the\nevaluation will be performed in the context of the inspected page.",
                optional: true,
                $ref: "ExecutionContextId"
              },
              {
                name: "objectGroup",
                description: "Symbolic group name that can be used to release multiple objects.",
                optional: true,
                type: "string"
              },
              {
                name: "silent",
                description: "In silent mode exceptions thrown during evaluation are not reported and do not pause\nexecution. Overrides `setPauseOnException` state.",
                optional: true,
                type: "boolean"
              },
              {
                name: "includeCommandLineAPI",
                description: "Determines whether Command Line API should be available during the evaluation.",
                optional: true,
                type: "boolean"
              },
              {
                name: "returnByValue",
                description: "Whether the result is expected to be a JSON object which should be sent by value.",
                optional: true,
                type: "boolean"
              },
              {
                name: "generatePreview",
                description: "Whether preview should be generated for the result.",
                optional: true,
                type: "boolean"
              },
              {
                name: "awaitPromise",
                description: "Whether execution should `await` for resulting value and return once awaited promise is\nresolved.",
                optional: true,
                type: "boolean"
              }
            ],
            returns: [
              {
                name: "result",
                description: "Run result.",
                $ref: "RemoteObject"
              },
              {
                name: "exceptionDetails",
                description: "Exception details.",
                optional: true,
                $ref: "ExceptionDetails"
              }
            ]
          },
          {
            name: "setAsyncCallStackDepth",
            description: "Enables or disables async call stacks tracking.",
            redirect: "Debugger",
            parameters: [
              {
                name: "maxDepth",
                description: "Maximum depth of async call stacks. Setting to `0` will effectively disable collecting async\ncall stacks (default).",
                type: "integer"
              }
            ]
          },
          {
            name: "setCustomObjectFormatterEnabled",
            experimental: true,
            parameters: [
              {
                name: "enabled",
                type: "boolean"
              }
            ]
          },
          {
            name: "setMaxCallStackSizeToCapture",
            experimental: true,
            parameters: [
              {
                name: "size",
                type: "integer"
              }
            ]
          },
          {
            name: "terminateExecution",
            description: "Terminate current or next JavaScript execution.\nWill cancel the termination when the outer-most script execution ends.",
            experimental: true
          },
          {
            name: "addBinding",
            description: "If executionContextId is empty, adds binding with the given name on the\nglobal objects of all inspected contexts, including those created later,\nbindings survive reloads.\nIf executionContextId is specified, adds binding only on global object of\ngiven execution context.\nBinding function takes exactly one argument, this argument should be string,\nin case of any other input, function throws an exception.\nEach binding function call produces Runtime.bindingCalled notification.",
            experimental: true,
            parameters: [
              {
                name: "name",
                type: "string"
              },
              {
                name: "executionContextId",
                optional: true,
                $ref: "ExecutionContextId"
              }
            ]
          },
          {
            name: "removeBinding",
            description: "This method does not remove binding function from global object but\nunsubscribes current runtime agent from Runtime.bindingCalled notifications.",
            experimental: true,
            parameters: [
              {
                name: "name",
                type: "string"
              }
            ]
          }
        ],
        events: [
          {
            name: "bindingCalled",
            description: "Notification is issued every time when binding is called.",
            experimental: true,
            parameters: [
              {
                name: "name",
                type: "string"
              },
              {
                name: "payload",
                type: "string"
              },
              {
                name: "executionContextId",
                description: "Identifier of the context where the call was made.",
                $ref: "ExecutionContextId"
              }
            ]
          },
          {
            name: "consoleAPICalled",
            description: "Issued when console API was called.",
            parameters: [
              {
                name: "type",
                description: "Type of the call.",
                type: "string",
                enum: [
                  "log",
                  "debug",
                  "info",
                  "error",
                  "warning",
                  "dir",
                  "dirxml",
                  "table",
                  "trace",
                  "clear",
                  "startGroup",
                  "startGroupCollapsed",
                  "endGroup",
                  "assert",
                  "profile",
                  "profileEnd",
                  "count",
                  "timeEnd"
                ]
              },
              {
                name: "args",
                description: "Call arguments.",
                type: "array",
                items: {
                  $ref: "RemoteObject"
                }
              },
              {
                name: "executionContextId",
                description: "Identifier of the context where the call was made.",
                $ref: "ExecutionContextId"
              },
              {
                name: "timestamp",
                description: "Call timestamp.",
                $ref: "Timestamp"
              },
              {
                name: "stackTrace",
                description: "Stack trace captured when the call was made. The async stack chain is automatically reported for\nthe following call types: `assert`, `error`, `trace`, `warning`. For other types the async call\nchain can be retrieved using `Debugger.getStackTrace` and `stackTrace.parentId` field.",
                optional: true,
                $ref: "StackTrace"
              },
              {
                name: "context",
                description: "Console context descriptor for calls on non-default console context (not console.*):\n'anonymous#unique-logger-id' for call on unnamed context, 'name#unique-logger-id' for call\non named context.",
                experimental: true,
                optional: true,
                type: "string"
              }
            ]
          },
          {
            name: "exceptionRevoked",
            description: "Issued when unhandled exception was revoked.",
            parameters: [
              {
                name: "reason",
                description: "Reason describing why exception was revoked.",
                type: "string"
              },
              {
                name: "exceptionId",
                description: "The id of revoked exception, as reported in `exceptionThrown`.",
                type: "integer"
              }
            ]
          },
          {
            name: "exceptionThrown",
            description: "Issued when exception was thrown and unhandled.",
            parameters: [
              {
                name: "timestamp",
                description: "Timestamp of the exception.",
                $ref: "Timestamp"
              },
              {
                name: "exceptionDetails",
                $ref: "ExceptionDetails"
              }
            ]
          },
          {
            name: "executionContextCreated",
            description: "Issued when new execution context is created.",
            parameters: [
              {
                name: "context",
                description: "A newly created execution context.",
                $ref: "ExecutionContextDescription"
              }
            ]
          },
          {
            name: "executionContextDestroyed",
            description: "Issued when execution context is destroyed.",
            parameters: [
              {
                name: "executionContextId",
                description: "Id of the destroyed context",
                $ref: "ExecutionContextId"
              }
            ]
          },
          {
            name: "executionContextsCleared",
            description: "Issued when all executionContexts were cleared in browser"
          },
          {
            name: "inspectRequested",
            description: "Issued when object should be inspected (for example, as a result of inspect() command line API\ncall).",
            parameters: [
              {
                name: "object",
                $ref: "RemoteObject"
              },
              {
                name: "hints",
                type: "object"
              }
            ]
          }
        ]
      },
      {
        domain: "Schema",
        description: "This domain is deprecated.",
        deprecated: true,
        types: [
          {
            id: "Domain",
            description: "Description of the protocol domain.",
            type: "object",
            properties: [
              {
                name: "name",
                description: "Domain name.",
                type: "string"
              },
              {
                name: "version",
                description: "Domain version.",
                type: "string"
              }
            ]
          }
        ],
        commands: [
          {
            name: "getDomains",
            description: "Returns supported domains.",
            returns: [
              {
                name: "domains",
                description: "List of supported domains.",
                type: "array",
                items: {
                  $ref: "Domain"
                }
              }
            ]
          }
        ]
      }
    ]
  };
});

// node_modules/.pnpm/chrome-remote-interface@0.30.0/node_modules/chrome-remote-interface/lib/devtools.js
var require_devtools = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  var http = require("http");
  var https = require("https");
  var defaults = require_defaults();
  var externalRequest = require_external_request();
  function devToolsInterface(options, callback) {
    options.host = options.host || defaults.HOST;
    options.port = options.port || defaults.PORT;
    options.secure = !!options.secure;
    options.useHostName = !!options.useHostName;
    options.alterPath = options.alterPath || ((path) => path);
    const newOptions = _chunkRIYM4ALWjs.__objSpread.call(void 0, {}, options);
    newOptions.path = options.alterPath(options.path);
    externalRequest(options.secure ? https : http, newOptions, callback);
  }
  function promisesWrapper(func) {
    return (options, callback) => {
      if (typeof options === "function") {
        callback = options;
        options = void 0;
      }
      options = options || {};
      if (typeof callback === "function") {
        func(options, callback);
        return void 0;
      } else {
        return new Promise((fulfill, reject) => {
          func(options, (err, result) => {
            if (err) {
              reject(err);
            } else {
              fulfill(result);
            }
          });
        });
      }
    };
  }
  function Protocol(options, callback) {
    if (options.local) {
      const localDescriptor = require_protocol();
      callback(null, localDescriptor);
      return;
    }
    options.path = "/json/protocol";
    devToolsInterface(options, (err, descriptor) => {
      if (err) {
        callback(err);
      } else {
        callback(null, JSON.parse(descriptor));
      }
    });
  }
  function List(options, callback) {
    options.path = "/json/list";
    devToolsInterface(options, (err, tabs) => {
      if (err) {
        callback(err);
      } else {
        callback(null, JSON.parse(tabs));
      }
    });
  }
  function New(options, callback) {
    options.path = "/json/new";
    if (Object.prototype.hasOwnProperty.call(options, "url")) {
      options.path += `?${options.url}`;
    }
    devToolsInterface(options, (err, tab) => {
      if (err) {
        callback(err);
      } else {
        callback(null, JSON.parse(tab));
      }
    });
  }
  function Activate(options, callback) {
    options.path = "/json/activate/" + options.id;
    devToolsInterface(options, (err) => {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  }
  function Close(options, callback) {
    options.path = "/json/close/" + options.id;
    devToolsInterface(options, (err) => {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  }
  function Version(options, callback) {
    options.path = "/json/version";
    devToolsInterface(options, (err, versionInfo) => {
      if (err) {
        callback(err);
      } else {
        callback(null, JSON.parse(versionInfo));
      }
    });
  }
  module.exports.Protocol = promisesWrapper(Protocol);
  module.exports.List = promisesWrapper(List);
  module.exports.New = promisesWrapper(New);
  module.exports.Activate = promisesWrapper(Activate);
  module.exports.Close = promisesWrapper(Close);
  module.exports.Version = promisesWrapper(Version);
});

// node_modules/.pnpm/ws@7.4.5/node_modules/ws/lib/constants.js
var require_constants = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  module.exports = {
    BINARY_TYPES: ["nodebuffer", "arraybuffer", "fragments"],
    GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
    kStatusCode: Symbol("status-code"),
    kWebSocket: Symbol("websocket"),
    EMPTY_BUFFER: Buffer.alloc(0),
    NOOP: () => {
    }
  };
});

// node_modules/.pnpm/ws@7.4.5/node_modules/ws/lib/buffer-util.js
var require_buffer_util = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  var {EMPTY_BUFFER} = require_constants();
  function concat(list, totalLength) {
    if (list.length === 0)
      return EMPTY_BUFFER;
    if (list.length === 1)
      return list[0];
    const target = Buffer.allocUnsafe(totalLength);
    let offset = 0;
    for (let i = 0; i < list.length; i++) {
      const buf = list[i];
      target.set(buf, offset);
      offset += buf.length;
    }
    if (offset < totalLength)
      return target.slice(0, offset);
    return target;
  }
  function _mask(source, mask, output, offset, length) {
    for (let i = 0; i < length; i++) {
      output[offset + i] = source[i] ^ mask[i & 3];
    }
  }
  function _unmask(buffer, mask) {
    const length = buffer.length;
    for (let i = 0; i < length; i++) {
      buffer[i] ^= mask[i & 3];
    }
  }
  function toArrayBuffer(buf) {
    if (buf.byteLength === buf.buffer.byteLength) {
      return buf.buffer;
    }
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }
  function toBuffer(data) {
    toBuffer.readOnly = true;
    if (Buffer.isBuffer(data))
      return data;
    let buf;
    if (data instanceof ArrayBuffer) {
      buf = Buffer.from(data);
    } else if (ArrayBuffer.isView(data)) {
      buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    } else {
      buf = Buffer.from(data);
      toBuffer.readOnly = false;
    }
    return buf;
  }
  try {
    const bufferUtil = require("bufferutil");
    const bu = bufferUtil.BufferUtil || bufferUtil;
    module.exports = {
      concat,
      mask(source, mask, output, offset, length) {
        if (length < 48)
          _mask(source, mask, output, offset, length);
        else
          bu.mask(source, mask, output, offset, length);
      },
      toArrayBuffer,
      toBuffer,
      unmask(buffer, mask) {
        if (buffer.length < 32)
          _unmask(buffer, mask);
        else
          bu.unmask(buffer, mask);
      }
    };
  } catch (e) {
    module.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
  }
});

// node_modules/.pnpm/ws@7.4.5/node_modules/ws/lib/limiter.js
var require_limiter = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  var kDone = Symbol("kDone");
  var kRun = Symbol("kRun");
  var Limiter = class {
    constructor(concurrency) {
      this[kDone] = () => {
        this.pending--;
        this[kRun]();
      };
      this.concurrency = concurrency || Infinity;
      this.jobs = [];
      this.pending = 0;
    }
    add(job) {
      this.jobs.push(job);
      this[kRun]();
    }
    [kRun]() {
      if (this.pending === this.concurrency)
        return;
      if (this.jobs.length) {
        const job = this.jobs.shift();
        this.pending++;
        job(this[kDone]);
      }
    }
  };
  module.exports = Limiter;
});

// node_modules/.pnpm/ws@7.4.5/node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  var zlib = require("zlib");
  var bufferUtil = require_buffer_util();
  var Limiter = require_limiter();
  var {kStatusCode, NOOP} = require_constants();
  var TRAILER = Buffer.from([0, 0, 255, 255]);
  var kPerMessageDeflate = Symbol("permessage-deflate");
  var kTotalLength = Symbol("total-length");
  var kCallback = Symbol("callback");
  var kBuffers = Symbol("buffers");
  var kError = Symbol("error");
  var zlibLimiter;
  var PerMessageDeflate = class {
    constructor(options, isServer, maxPayload) {
      this._maxPayload = maxPayload | 0;
      this._options = options || {};
      this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
      this._isServer = !!isServer;
      this._deflate = null;
      this._inflate = null;
      this.params = null;
      if (!zlibLimiter) {
        const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
        zlibLimiter = new Limiter(concurrency);
      }
    }
    static get extensionName() {
      return "permessage-deflate";
    }
    offer() {
      const params = {};
      if (this._options.serverNoContextTakeover) {
        params.server_no_context_takeover = true;
      }
      if (this._options.clientNoContextTakeover) {
        params.client_no_context_takeover = true;
      }
      if (this._options.serverMaxWindowBits) {
        params.server_max_window_bits = this._options.serverMaxWindowBits;
      }
      if (this._options.clientMaxWindowBits) {
        params.client_max_window_bits = this._options.clientMaxWindowBits;
      } else if (this._options.clientMaxWindowBits == null) {
        params.client_max_window_bits = true;
      }
      return params;
    }
    accept(configurations) {
      configurations = this.normalizeParams(configurations);
      this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
      return this.params;
    }
    cleanup() {
      if (this._inflate) {
        this._inflate.close();
        this._inflate = null;
      }
      if (this._deflate) {
        const callback = this._deflate[kCallback];
        this._deflate.close();
        this._deflate = null;
        if (callback) {
          callback(new Error("The deflate stream was closed while data was being processed"));
        }
      }
    }
    acceptAsServer(offers) {
      const opts = this._options;
      const accepted = offers.find((params) => {
        if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
          return false;
        }
        return true;
      });
      if (!accepted) {
        throw new Error("None of the extension offers can be accepted");
      }
      if (opts.serverNoContextTakeover) {
        accepted.server_no_context_takeover = true;
      }
      if (opts.clientNoContextTakeover) {
        accepted.client_no_context_takeover = true;
      }
      if (typeof opts.serverMaxWindowBits === "number") {
        accepted.server_max_window_bits = opts.serverMaxWindowBits;
      }
      if (typeof opts.clientMaxWindowBits === "number") {
        accepted.client_max_window_bits = opts.clientMaxWindowBits;
      } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
        delete accepted.client_max_window_bits;
      }
      return accepted;
    }
    acceptAsClient(response) {
      const params = response[0];
      if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
        throw new Error('Unexpected parameter "client_no_context_takeover"');
      }
      if (!params.client_max_window_bits) {
        if (typeof this._options.clientMaxWindowBits === "number") {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        }
      } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
        throw new Error('Unexpected or invalid parameter "client_max_window_bits"');
      }
      return params;
    }
    normalizeParams(configurations) {
      configurations.forEach((params) => {
        Object.keys(params).forEach((key) => {
          let value = params[key];
          if (value.length > 1) {
            throw new Error(`Parameter "${key}" must have only a single value`);
          }
          value = value[0];
          if (key === "client_max_window_bits") {
            if (value !== true) {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
              }
              value = num;
            } else if (!this._isServer) {
              throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
            }
          } else if (key === "server_max_window_bits") {
            const num = +value;
            if (!Number.isInteger(num) || num < 8 || num > 15) {
              throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
            }
            value = num;
          } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
            if (value !== true) {
              throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
            }
          } else {
            throw new Error(`Unknown parameter "${key}"`);
          }
          params[key] = value;
        });
      });
      return configurations;
    }
    decompress(data, fin, callback) {
      zlibLimiter.add((done) => {
        this._decompress(data, fin, (err, result) => {
          done();
          callback(err, result);
        });
      });
    }
    compress(data, fin, callback) {
      zlibLimiter.add((done) => {
        this._compress(data, fin, (err, result) => {
          done();
          callback(err, result);
        });
      });
    }
    _decompress(data, fin, callback) {
      const endpoint = this._isServer ? "client" : "server";
      if (!this._inflate) {
        const key = `${endpoint}_max_window_bits`;
        const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
        this._inflate = zlib.createInflateRaw(_chunkRIYM4ALWjs.__objSpread.call(void 0, _chunkRIYM4ALWjs.__objSpread.call(void 0, {}, this._options.zlibInflateOptions), {
          windowBits
        }));
        this._inflate[kPerMessageDeflate] = this;
        this._inflate[kTotalLength] = 0;
        this._inflate[kBuffers] = [];
        this._inflate.on("error", inflateOnError);
        this._inflate.on("data", inflateOnData);
      }
      this._inflate[kCallback] = callback;
      this._inflate.write(data);
      if (fin)
        this._inflate.write(TRAILER);
      this._inflate.flush(() => {
        const err = this._inflate[kError];
        if (err) {
          this._inflate.close();
          this._inflate = null;
          callback(err);
          return;
        }
        const data2 = bufferUtil.concat(this._inflate[kBuffers], this._inflate[kTotalLength]);
        if (this._inflate._readableState.endEmitted) {
          this._inflate.close();
          this._inflate = null;
        } else {
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._inflate.reset();
          }
        }
        callback(null, data2);
      });
    }
    _compress(data, fin, callback) {
      const endpoint = this._isServer ? "server" : "client";
      if (!this._deflate) {
        const key = `${endpoint}_max_window_bits`;
        const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
        this._deflate = zlib.createDeflateRaw(_chunkRIYM4ALWjs.__objSpread.call(void 0, _chunkRIYM4ALWjs.__objSpread.call(void 0, {}, this._options.zlibDeflateOptions), {
          windowBits
        }));
        this._deflate[kTotalLength] = 0;
        this._deflate[kBuffers] = [];
        this._deflate.on("error", NOOP);
        this._deflate.on("data", deflateOnData);
      }
      this._deflate[kCallback] = callback;
      this._deflate.write(data);
      this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
        if (!this._deflate) {
          return;
        }
        let data2 = bufferUtil.concat(this._deflate[kBuffers], this._deflate[kTotalLength]);
        if (fin)
          data2 = data2.slice(0, data2.length - 4);
        this._deflate[kCallback] = null;
        this._deflate[kTotalLength] = 0;
        this._deflate[kBuffers] = [];
        if (fin && this.params[`${endpoint}_no_context_takeover`]) {
          this._deflate.reset();
        }
        callback(null, data2);
      });
    }
  };
  module.exports = PerMessageDeflate;
  function deflateOnData(chunk) {
    this[kBuffers].push(chunk);
    this[kTotalLength] += chunk.length;
  }
  function inflateOnData(chunk) {
    this[kTotalLength] += chunk.length;
    if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
      this[kBuffers].push(chunk);
      return;
    }
    this[kError] = new RangeError("Max payload size exceeded");
    this[kError][kStatusCode] = 1009;
    this.removeListener("data", inflateOnData);
    this.reset();
  }
  function inflateOnError(err) {
    this[kPerMessageDeflate]._inflate = null;
    err[kStatusCode] = 1007;
    this[kCallback](err);
  }
});

// node_modules/.pnpm/ws@7.4.5/node_modules/ws/lib/validation.js
var require_validation = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  function isValidStatusCode(code) {
    return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
  }
  function _isValidUTF8(buf) {
    const len = buf.length;
    let i = 0;
    while (i < len) {
      if (buf[i] < 128) {
        i++;
      } else if ((buf[i] & 224) === 192) {
        if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
          return false;
        } else {
          i += 2;
        }
      } else if ((buf[i] & 240) === 224) {
        if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || buf[i] === 237 && (buf[i + 1] & 224) === 160) {
          return false;
        } else {
          i += 3;
        }
      } else if ((buf[i] & 248) === 240) {
        if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
          return false;
        } else {
          i += 4;
        }
      } else {
        return false;
      }
    }
    return true;
  }
  try {
    let isValidUTF8 = require("utf-8-validate");
    if (typeof isValidUTF8 === "object") {
      isValidUTF8 = isValidUTF8.Validation.isValidUTF8;
    }
    module.exports = {
      isValidStatusCode,
      isValidUTF8(buf) {
        return buf.length < 150 ? _isValidUTF8(buf) : isValidUTF8(buf);
      }
    };
  } catch (e) {
    module.exports = {
      isValidStatusCode,
      isValidUTF8: _isValidUTF8
    };
  }
});

// node_modules/.pnpm/ws@7.4.5/node_modules/ws/lib/receiver.js
var require_receiver = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  var {Writable} = require("stream");
  var PerMessageDeflate = require_permessage_deflate();
  var {
    BINARY_TYPES,
    EMPTY_BUFFER,
    kStatusCode,
    kWebSocket
  } = require_constants();
  var {concat, toArrayBuffer, unmask} = require_buffer_util();
  var {isValidStatusCode, isValidUTF8} = require_validation();
  var GET_INFO = 0;
  var GET_PAYLOAD_LENGTH_16 = 1;
  var GET_PAYLOAD_LENGTH_64 = 2;
  var GET_MASK = 3;
  var GET_DATA = 4;
  var INFLATING = 5;
  var Receiver = class extends Writable {
    constructor(binaryType, extensions, isServer, maxPayload) {
      super();
      this._binaryType = binaryType || BINARY_TYPES[0];
      this[kWebSocket] = void 0;
      this._extensions = extensions || {};
      this._isServer = !!isServer;
      this._maxPayload = maxPayload | 0;
      this._bufferedBytes = 0;
      this._buffers = [];
      this._compressed = false;
      this._payloadLength = 0;
      this._mask = void 0;
      this._fragmented = 0;
      this._masked = false;
      this._fin = false;
      this._opcode = 0;
      this._totalPayloadLength = 0;
      this._messageLength = 0;
      this._fragments = [];
      this._state = GET_INFO;
      this._loop = false;
    }
    _write(chunk, encoding, cb) {
      if (this._opcode === 8 && this._state == GET_INFO)
        return cb();
      this._bufferedBytes += chunk.length;
      this._buffers.push(chunk);
      this.startLoop(cb);
    }
    consume(n) {
      this._bufferedBytes -= n;
      if (n === this._buffers[0].length)
        return this._buffers.shift();
      if (n < this._buffers[0].length) {
        const buf = this._buffers[0];
        this._buffers[0] = buf.slice(n);
        return buf.slice(0, n);
      }
      const dst = Buffer.allocUnsafe(n);
      do {
        const buf = this._buffers[0];
        const offset = dst.length - n;
        if (n >= buf.length) {
          dst.set(this._buffers.shift(), offset);
        } else {
          dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
          this._buffers[0] = buf.slice(n);
        }
        n -= buf.length;
      } while (n > 0);
      return dst;
    }
    startLoop(cb) {
      let err;
      this._loop = true;
      do {
        switch (this._state) {
          case GET_INFO:
            err = this.getInfo();
            break;
          case GET_PAYLOAD_LENGTH_16:
            err = this.getPayloadLength16();
            break;
          case GET_PAYLOAD_LENGTH_64:
            err = this.getPayloadLength64();
            break;
          case GET_MASK:
            this.getMask();
            break;
          case GET_DATA:
            err = this.getData(cb);
            break;
          default:
            this._loop = false;
            return;
        }
      } while (this._loop);
      cb(err);
    }
    getInfo() {
      if (this._bufferedBytes < 2) {
        this._loop = false;
        return;
      }
      const buf = this.consume(2);
      if ((buf[0] & 48) !== 0) {
        this._loop = false;
        return error(RangeError, "RSV2 and RSV3 must be clear", true, 1002);
      }
      const compressed = (buf[0] & 64) === 64;
      if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
        this._loop = false;
        return error(RangeError, "RSV1 must be clear", true, 1002);
      }
      this._fin = (buf[0] & 128) === 128;
      this._opcode = buf[0] & 15;
      this._payloadLength = buf[1] & 127;
      if (this._opcode === 0) {
        if (compressed) {
          this._loop = false;
          return error(RangeError, "RSV1 must be clear", true, 1002);
        }
        if (!this._fragmented) {
          this._loop = false;
          return error(RangeError, "invalid opcode 0", true, 1002);
        }
        this._opcode = this._fragmented;
      } else if (this._opcode === 1 || this._opcode === 2) {
        if (this._fragmented) {
          this._loop = false;
          return error(RangeError, `invalid opcode ${this._opcode}`, true, 1002);
        }
        this._compressed = compressed;
      } else if (this._opcode > 7 && this._opcode < 11) {
        if (!this._fin) {
          this._loop = false;
          return error(RangeError, "FIN must be set", true, 1002);
        }
        if (compressed) {
          this._loop = false;
          return error(RangeError, "RSV1 must be clear", true, 1002);
        }
        if (this._payloadLength > 125) {
          this._loop = false;
          return error(RangeError, `invalid payload length ${this._payloadLength}`, true, 1002);
        }
      } else {
        this._loop = false;
        return error(RangeError, `invalid opcode ${this._opcode}`, true, 1002);
      }
      if (!this._fin && !this._fragmented)
        this._fragmented = this._opcode;
      this._masked = (buf[1] & 128) === 128;
      if (this._isServer) {
        if (!this._masked) {
          this._loop = false;
          return error(RangeError, "MASK must be set", true, 1002);
        }
      } else if (this._masked) {
        this._loop = false;
        return error(RangeError, "MASK must be clear", true, 1002);
      }
      if (this._payloadLength === 126)
        this._state = GET_PAYLOAD_LENGTH_16;
      else if (this._payloadLength === 127)
        this._state = GET_PAYLOAD_LENGTH_64;
      else
        return this.haveLength();
    }
    getPayloadLength16() {
      if (this._bufferedBytes < 2) {
        this._loop = false;
        return;
      }
      this._payloadLength = this.consume(2).readUInt16BE(0);
      return this.haveLength();
    }
    getPayloadLength64() {
      if (this._bufferedBytes < 8) {
        this._loop = false;
        return;
      }
      const buf = this.consume(8);
      const num = buf.readUInt32BE(0);
      if (num > Math.pow(2, 53 - 32) - 1) {
        this._loop = false;
        return error(RangeError, "Unsupported WebSocket frame: payload length > 2^53 - 1", false, 1009);
      }
      this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
      return this.haveLength();
    }
    haveLength() {
      if (this._payloadLength && this._opcode < 8) {
        this._totalPayloadLength += this._payloadLength;
        if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
          this._loop = false;
          return error(RangeError, "Max payload size exceeded", false, 1009);
        }
      }
      if (this._masked)
        this._state = GET_MASK;
      else
        this._state = GET_DATA;
    }
    getMask() {
      if (this._bufferedBytes < 4) {
        this._loop = false;
        return;
      }
      this._mask = this.consume(4);
      this._state = GET_DATA;
    }
    getData(cb) {
      let data = EMPTY_BUFFER;
      if (this._payloadLength) {
        if (this._bufferedBytes < this._payloadLength) {
          this._loop = false;
          return;
        }
        data = this.consume(this._payloadLength);
        if (this._masked)
          unmask(data, this._mask);
      }
      if (this._opcode > 7)
        return this.controlMessage(data);
      if (this._compressed) {
        this._state = INFLATING;
        this.decompress(data, cb);
        return;
      }
      if (data.length) {
        this._messageLength = this._totalPayloadLength;
        this._fragments.push(data);
      }
      return this.dataMessage();
    }
    decompress(data, cb) {
      const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
      perMessageDeflate.decompress(data, this._fin, (err, buf) => {
        if (err)
          return cb(err);
        if (buf.length) {
          this._messageLength += buf.length;
          if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
            return cb(error(RangeError, "Max payload size exceeded", false, 1009));
          }
          this._fragments.push(buf);
        }
        const er = this.dataMessage();
        if (er)
          return cb(er);
        this.startLoop(cb);
      });
    }
    dataMessage() {
      if (this._fin) {
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else {
            data = fragments;
          }
          this.emit("message", data);
        } else {
          const buf = concat(fragments, messageLength);
          if (!isValidUTF8(buf)) {
            this._loop = false;
            return error(Error, "invalid UTF-8 sequence", true, 1007);
          }
          this.emit("message", buf.toString());
        }
      }
      this._state = GET_INFO;
    }
    controlMessage(data) {
      if (this._opcode === 8) {
        this._loop = false;
        if (data.length === 0) {
          this.emit("conclude", 1005, "");
          this.end();
        } else if (data.length === 1) {
          return error(RangeError, "invalid payload length 1", true, 1002);
        } else {
          const code = data.readUInt16BE(0);
          if (!isValidStatusCode(code)) {
            return error(RangeError, `invalid status code ${code}`, true, 1002);
          }
          const buf = data.slice(2);
          if (!isValidUTF8(buf)) {
            return error(Error, "invalid UTF-8 sequence", true, 1007);
          }
          this.emit("conclude", code, buf.toString());
          this.end();
        }
      } else if (this._opcode === 9) {
        this.emit("ping", data);
      } else {
        this.emit("pong", data);
      }
      this._state = GET_INFO;
    }
  };
  module.exports = Receiver;
  function error(ErrorCtor, message, prefix, statusCode) {
    const err = new ErrorCtor(prefix ? `Invalid WebSocket frame: ${message}` : message);
    Error.captureStackTrace(err, error);
    err[kStatusCode] = statusCode;
    return err;
  }
});

// node_modules/.pnpm/ws@7.4.5/node_modules/ws/lib/sender.js
var require_sender = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  var {randomFillSync} = require("crypto");
  var PerMessageDeflate = require_permessage_deflate();
  var {EMPTY_BUFFER} = require_constants();
  var {isValidStatusCode} = require_validation();
  var {mask: applyMask, toBuffer} = require_buffer_util();
  var mask = Buffer.alloc(4);
  var Sender = class {
    constructor(socket, extensions) {
      this._extensions = extensions || {};
      this._socket = socket;
      this._firstFragment = true;
      this._compress = false;
      this._bufferedBytes = 0;
      this._deflating = false;
      this._queue = [];
    }
    static frame(data, options) {
      const merge = options.mask && options.readOnly;
      let offset = options.mask ? 6 : 2;
      let payloadLength = data.length;
      if (data.length >= 65536) {
        offset += 8;
        payloadLength = 127;
      } else if (data.length > 125) {
        offset += 2;
        payloadLength = 126;
      }
      const target = Buffer.allocUnsafe(merge ? data.length + offset : offset);
      target[0] = options.fin ? options.opcode | 128 : options.opcode;
      if (options.rsv1)
        target[0] |= 64;
      target[1] = payloadLength;
      if (payloadLength === 126) {
        target.writeUInt16BE(data.length, 2);
      } else if (payloadLength === 127) {
        target.writeUInt32BE(0, 2);
        target.writeUInt32BE(data.length, 6);
      }
      if (!options.mask)
        return [target, data];
      randomFillSync(mask, 0, 4);
      target[1] |= 128;
      target[offset - 4] = mask[0];
      target[offset - 3] = mask[1];
      target[offset - 2] = mask[2];
      target[offset - 1] = mask[3];
      if (merge) {
        applyMask(data, mask, target, offset, data.length);
        return [target];
      }
      applyMask(data, mask, data, 0, data.length);
      return [target, data];
    }
    close(code, data, mask2, cb) {
      let buf;
      if (code === void 0) {
        buf = EMPTY_BUFFER;
      } else if (typeof code !== "number" || !isValidStatusCode(code)) {
        throw new TypeError("First argument must be a valid error code number");
      } else if (data === void 0 || data === "") {
        buf = Buffer.allocUnsafe(2);
        buf.writeUInt16BE(code, 0);
      } else {
        const length = Buffer.byteLength(data);
        if (length > 123) {
          throw new RangeError("The message must not be greater than 123 bytes");
        }
        buf = Buffer.allocUnsafe(2 + length);
        buf.writeUInt16BE(code, 0);
        buf.write(data, 2);
      }
      if (this._deflating) {
        this.enqueue([this.doClose, buf, mask2, cb]);
      } else {
        this.doClose(buf, mask2, cb);
      }
    }
    doClose(data, mask2, cb) {
      this.sendFrame(Sender.frame(data, {
        fin: true,
        rsv1: false,
        opcode: 8,
        mask: mask2,
        readOnly: false
      }), cb);
    }
    ping(data, mask2, cb) {
      const buf = toBuffer(data);
      if (buf.length > 125) {
        throw new RangeError("The data size must not be greater than 125 bytes");
      }
      if (this._deflating) {
        this.enqueue([this.doPing, buf, mask2, toBuffer.readOnly, cb]);
      } else {
        this.doPing(buf, mask2, toBuffer.readOnly, cb);
      }
    }
    doPing(data, mask2, readOnly, cb) {
      this.sendFrame(Sender.frame(data, {
        fin: true,
        rsv1: false,
        opcode: 9,
        mask: mask2,
        readOnly
      }), cb);
    }
    pong(data, mask2, cb) {
      const buf = toBuffer(data);
      if (buf.length > 125) {
        throw new RangeError("The data size must not be greater than 125 bytes");
      }
      if (this._deflating) {
        this.enqueue([this.doPong, buf, mask2, toBuffer.readOnly, cb]);
      } else {
        this.doPong(buf, mask2, toBuffer.readOnly, cb);
      }
    }
    doPong(data, mask2, readOnly, cb) {
      this.sendFrame(Sender.frame(data, {
        fin: true,
        rsv1: false,
        opcode: 10,
        mask: mask2,
        readOnly
      }), cb);
    }
    send(data, options, cb) {
      const buf = toBuffer(data);
      const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
      let opcode = options.binary ? 2 : 1;
      let rsv1 = options.compress;
      if (this._firstFragment) {
        this._firstFragment = false;
        if (rsv1 && perMessageDeflate) {
          rsv1 = buf.length >= perMessageDeflate._threshold;
        }
        this._compress = rsv1;
      } else {
        rsv1 = false;
        opcode = 0;
      }
      if (options.fin)
        this._firstFragment = true;
      if (perMessageDeflate) {
        const opts = {
          fin: options.fin,
          rsv1,
          opcode,
          mask: options.mask,
          readOnly: toBuffer.readOnly
        };
        if (this._deflating) {
          this.enqueue([this.dispatch, buf, this._compress, opts, cb]);
        } else {
          this.dispatch(buf, this._compress, opts, cb);
        }
      } else {
        this.sendFrame(Sender.frame(buf, {
          fin: options.fin,
          rsv1: false,
          opcode,
          mask: options.mask,
          readOnly: toBuffer.readOnly
        }), cb);
      }
    }
    dispatch(data, compress, options, cb) {
      if (!compress) {
        this.sendFrame(Sender.frame(data, options), cb);
        return;
      }
      const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
      this._bufferedBytes += data.length;
      this._deflating = true;
      perMessageDeflate.compress(data, options.fin, (_, buf) => {
        if (this._socket.destroyed) {
          const err = new Error("The socket was closed while data was being compressed");
          if (typeof cb === "function")
            cb(err);
          for (let i = 0; i < this._queue.length; i++) {
            const callback = this._queue[i][4];
            if (typeof callback === "function")
              callback(err);
          }
          return;
        }
        this._bufferedBytes -= data.length;
        this._deflating = false;
        options.readOnly = false;
        this.sendFrame(Sender.frame(buf, options), cb);
        this.dequeue();
      });
    }
    dequeue() {
      while (!this._deflating && this._queue.length) {
        const params = this._queue.shift();
        this._bufferedBytes -= params[1].length;
        Reflect.apply(params[0], this, params.slice(1));
      }
    }
    enqueue(params) {
      this._bufferedBytes += params[1].length;
      this._queue.push(params);
    }
    sendFrame(list, cb) {
      if (list.length === 2) {
        this._socket.cork();
        this._socket.write(list[0]);
        this._socket.write(list[1], cb);
        this._socket.uncork();
      } else {
        this._socket.write(list[0], cb);
      }
    }
  };
  module.exports = Sender;
});

// node_modules/.pnpm/ws@7.4.5/node_modules/ws/lib/event-target.js
var require_event_target = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  var Event = class {
    constructor(type, target) {
      this.target = target;
      this.type = type;
    }
  };
  var MessageEvent = class extends Event {
    constructor(data, target) {
      super("message", target);
      this.data = data;
    }
  };
  var CloseEvent = class extends Event {
    constructor(code, reason, target) {
      super("close", target);
      this.wasClean = target._closeFrameReceived && target._closeFrameSent;
      this.reason = reason;
      this.code = code;
    }
  };
  var OpenEvent = class extends Event {
    constructor(target) {
      super("open", target);
    }
  };
  var ErrorEvent = class extends Event {
    constructor(error, target) {
      super("error", target);
      this.message = error.message;
      this.error = error;
    }
  };
  var EventTarget = {
    addEventListener(type, listener, options) {
      if (typeof listener !== "function")
        return;
      function onMessage(data) {
        listener.call(this, new MessageEvent(data, this));
      }
      function onClose(code, message) {
        listener.call(this, new CloseEvent(code, message, this));
      }
      function onError(error) {
        listener.call(this, new ErrorEvent(error, this));
      }
      function onOpen() {
        listener.call(this, new OpenEvent(this));
      }
      const method = options && options.once ? "once" : "on";
      if (type === "message") {
        onMessage._listener = listener;
        this[method](type, onMessage);
      } else if (type === "close") {
        onClose._listener = listener;
        this[method](type, onClose);
      } else if (type === "error") {
        onError._listener = listener;
        this[method](type, onError);
      } else if (type === "open") {
        onOpen._listener = listener;
        this[method](type, onOpen);
      } else {
        this[method](type, listener);
      }
    },
    removeEventListener(type, listener) {
      const listeners = this.listeners(type);
      for (let i = 0; i < listeners.length; i++) {
        if (listeners[i] === listener || listeners[i]._listener === listener) {
          this.removeListener(type, listeners[i]);
        }
      }
    }
  };
  module.exports = EventTarget;
});

// node_modules/.pnpm/ws@7.4.5/node_modules/ws/lib/extension.js
var require_extension = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  var tokenChars = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    1,
    0,
    1,
    0
  ];
  function push(dest, name, elem) {
    if (dest[name] === void 0)
      dest[name] = [elem];
    else
      dest[name].push(elem);
  }
  function parse(header) {
    const offers = Object.create(null);
    if (header === void 0 || header === "")
      return offers;
    let params = Object.create(null);
    let mustUnescape = false;
    let isEscaping = false;
    let inQuotes = false;
    let extensionName;
    let paramName;
    let start = -1;
    let end = -1;
    let i = 0;
    for (; i < header.length; i++) {
      const code = header.charCodeAt(i);
      if (extensionName === void 0) {
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1)
            start = i;
        } else if (code === 32 || code === 9) {
          if (end === -1 && start !== -1)
            end = i;
        } else if (code === 59 || code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1)
            end = i;
          const name = header.slice(start, end);
          if (code === 44) {
            push(offers, name, params);
            params = Object.create(null);
          } else {
            extensionName = name;
          }
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      } else if (paramName === void 0) {
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1)
            start = i;
        } else if (code === 32 || code === 9) {
          if (end === -1 && start !== -1)
            end = i;
        } else if (code === 59 || code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1)
            end = i;
          push(params, header.slice(start, end), true);
          if (code === 44) {
            push(offers, extensionName, params);
            params = Object.create(null);
            extensionName = void 0;
          }
          start = end = -1;
        } else if (code === 61 && start !== -1 && end === -1) {
          paramName = header.slice(start, i);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      } else {
        if (isEscaping) {
          if (tokenChars[code] !== 1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (start === -1)
            start = i;
          else if (!mustUnescape)
            mustUnescape = true;
          isEscaping = false;
        } else if (inQuotes) {
          if (tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (code === 34 && start !== -1) {
            inQuotes = false;
            end = i;
          } else if (code === 92) {
            isEscaping = true;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
          inQuotes = true;
        } else if (end === -1 && tokenChars[code] === 1) {
          if (start === -1)
            start = i;
        } else if (start !== -1 && (code === 32 || code === 9)) {
          if (end === -1)
            end = i;
        } else if (code === 59 || code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1)
            end = i;
          let value = header.slice(start, end);
          if (mustUnescape) {
            value = value.replace(/\\/g, "");
            mustUnescape = false;
          }
          push(params, paramName, value);
          if (code === 44) {
            push(offers, extensionName, params);
            params = Object.create(null);
            extensionName = void 0;
          }
          paramName = void 0;
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
    }
    if (start === -1 || inQuotes) {
      throw new SyntaxError("Unexpected end of input");
    }
    if (end === -1)
      end = i;
    const token = header.slice(start, end);
    if (extensionName === void 0) {
      push(offers, token, params);
    } else {
      if (paramName === void 0) {
        push(params, token, true);
      } else if (mustUnescape) {
        push(params, paramName, token.replace(/\\/g, ""));
      } else {
        push(params, paramName, token);
      }
      push(offers, extensionName, params);
    }
    return offers;
  }
  function format(extensions) {
    return Object.keys(extensions).map((extension) => {
      let configurations = extensions[extension];
      if (!Array.isArray(configurations))
        configurations = [configurations];
      return configurations.map((params) => {
        return [extension].concat(Object.keys(params).map((k) => {
          let values = params[k];
          if (!Array.isArray(values))
            values = [values];
          return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
        })).join("; ");
      }).join(", ");
    }).join(", ");
  }
  module.exports = {format, parse};
});

// node_modules/.pnpm/ws@7.4.5/node_modules/ws/lib/websocket.js
var require_websocket = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  var EventEmitter = require("events");
  var https = require("https");
  var http = require("http");
  var net = require("net");
  var tls = require("tls");
  var {randomBytes, createHash} = require("crypto");
  var {URL: URL2} = require("url");
  var PerMessageDeflate = require_permessage_deflate();
  var Receiver = require_receiver();
  var Sender = require_sender();
  var {
    BINARY_TYPES,
    EMPTY_BUFFER,
    GUID,
    kStatusCode,
    kWebSocket,
    NOOP
  } = require_constants();
  var {addEventListener, removeEventListener} = require_event_target();
  var {format, parse} = require_extension();
  var {toBuffer} = require_buffer_util();
  var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
  var protocolVersions = [8, 13];
  var closeTimeout = 30 * 1e3;
  var WebSocket = class extends EventEmitter {
    constructor(address, protocols, options) {
      super();
      this._binaryType = BINARY_TYPES[0];
      this._closeCode = 1006;
      this._closeFrameReceived = false;
      this._closeFrameSent = false;
      this._closeMessage = "";
      this._closeTimer = null;
      this._extensions = {};
      this._protocol = "";
      this._readyState = WebSocket.CONNECTING;
      this._receiver = null;
      this._sender = null;
      this._socket = null;
      if (address !== null) {
        this._bufferedAmount = 0;
        this._isServer = false;
        this._redirects = 0;
        if (Array.isArray(protocols)) {
          protocols = protocols.join(", ");
        } else if (typeof protocols === "object" && protocols !== null) {
          options = protocols;
          protocols = void 0;
        }
        initAsClient(this, address, protocols, options);
      } else {
        this._isServer = true;
      }
    }
    get binaryType() {
      return this._binaryType;
    }
    set binaryType(type) {
      if (!BINARY_TYPES.includes(type))
        return;
      this._binaryType = type;
      if (this._receiver)
        this._receiver._binaryType = type;
    }
    get bufferedAmount() {
      if (!this._socket)
        return this._bufferedAmount;
      return this._socket._writableState.length + this._sender._bufferedBytes;
    }
    get extensions() {
      return Object.keys(this._extensions).join();
    }
    get protocol() {
      return this._protocol;
    }
    get readyState() {
      return this._readyState;
    }
    get url() {
      return this._url;
    }
    setSocket(socket, head, maxPayload) {
      const receiver = new Receiver(this.binaryType, this._extensions, this._isServer, maxPayload);
      this._sender = new Sender(socket, this._extensions);
      this._receiver = receiver;
      this._socket = socket;
      receiver[kWebSocket] = this;
      socket[kWebSocket] = this;
      receiver.on("conclude", receiverOnConclude);
      receiver.on("drain", receiverOnDrain);
      receiver.on("error", receiverOnError);
      receiver.on("message", receiverOnMessage);
      receiver.on("ping", receiverOnPing);
      receiver.on("pong", receiverOnPong);
      socket.setTimeout(0);
      socket.setNoDelay();
      if (head.length > 0)
        socket.unshift(head);
      socket.on("close", socketOnClose);
      socket.on("data", socketOnData);
      socket.on("end", socketOnEnd);
      socket.on("error", socketOnError);
      this._readyState = WebSocket.OPEN;
      this.emit("open");
    }
    emitClose() {
      if (!this._socket) {
        this._readyState = WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
        return;
      }
      if (this._extensions[PerMessageDeflate.extensionName]) {
        this._extensions[PerMessageDeflate.extensionName].cleanup();
      }
      this._receiver.removeAllListeners();
      this._readyState = WebSocket.CLOSED;
      this.emit("close", this._closeCode, this._closeMessage);
    }
    close(code, data) {
      if (this.readyState === WebSocket.CLOSED)
        return;
      if (this.readyState === WebSocket.CONNECTING) {
        const msg = "WebSocket was closed before the connection was established";
        return abortHandshake(this, this._req, msg);
      }
      if (this.readyState === WebSocket.CLOSING) {
        if (this._closeFrameSent && this._closeFrameReceived)
          this._socket.end();
        return;
      }
      this._readyState = WebSocket.CLOSING;
      this._sender.close(code, data, !this._isServer, (err) => {
        if (err)
          return;
        this._closeFrameSent = true;
        if (this._closeFrameReceived)
          this._socket.end();
      });
      this._closeTimer = setTimeout(this._socket.destroy.bind(this._socket), closeTimeout);
    }
    ping(data, mask, cb) {
      if (this.readyState === WebSocket.CONNECTING) {
        throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
      }
      if (typeof data === "function") {
        cb = data;
        data = mask = void 0;
      } else if (typeof mask === "function") {
        cb = mask;
        mask = void 0;
      }
      if (typeof data === "number")
        data = data.toString();
      if (this.readyState !== WebSocket.OPEN) {
        sendAfterClose(this, data, cb);
        return;
      }
      if (mask === void 0)
        mask = !this._isServer;
      this._sender.ping(data || EMPTY_BUFFER, mask, cb);
    }
    pong(data, mask, cb) {
      if (this.readyState === WebSocket.CONNECTING) {
        throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
      }
      if (typeof data === "function") {
        cb = data;
        data = mask = void 0;
      } else if (typeof mask === "function") {
        cb = mask;
        mask = void 0;
      }
      if (typeof data === "number")
        data = data.toString();
      if (this.readyState !== WebSocket.OPEN) {
        sendAfterClose(this, data, cb);
        return;
      }
      if (mask === void 0)
        mask = !this._isServer;
      this._sender.pong(data || EMPTY_BUFFER, mask, cb);
    }
    send(data, options, cb) {
      if (this.readyState === WebSocket.CONNECTING) {
        throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
      }
      if (typeof options === "function") {
        cb = options;
        options = {};
      }
      if (typeof data === "number")
        data = data.toString();
      if (this.readyState !== WebSocket.OPEN) {
        sendAfterClose(this, data, cb);
        return;
      }
      const opts = _chunkRIYM4ALWjs.__objSpread.call(void 0, {
        binary: typeof data !== "string",
        mask: !this._isServer,
        compress: true,
        fin: true
      }, options);
      if (!this._extensions[PerMessageDeflate.extensionName]) {
        opts.compress = false;
      }
      this._sender.send(data || EMPTY_BUFFER, opts, cb);
    }
    terminate() {
      if (this.readyState === WebSocket.CLOSED)
        return;
      if (this.readyState === WebSocket.CONNECTING) {
        const msg = "WebSocket was closed before the connection was established";
        return abortHandshake(this, this._req, msg);
      }
      if (this._socket) {
        this._readyState = WebSocket.CLOSING;
        this._socket.destroy();
      }
    }
  };
  readyStates.forEach((readyState, i) => {
    const descriptor = {enumerable: true, value: i};
    Object.defineProperty(WebSocket.prototype, readyState, descriptor);
    Object.defineProperty(WebSocket, readyState, descriptor);
  });
  [
    "binaryType",
    "bufferedAmount",
    "extensions",
    "protocol",
    "readyState",
    "url"
  ].forEach((property) => {
    Object.defineProperty(WebSocket.prototype, property, {enumerable: true});
  });
  ["open", "error", "close", "message"].forEach((method) => {
    Object.defineProperty(WebSocket.prototype, `on${method}`, {
      configurable: true,
      enumerable: true,
      get() {
        const listeners = this.listeners(method);
        for (let i = 0; i < listeners.length; i++) {
          if (listeners[i]._listener)
            return listeners[i]._listener;
        }
        return void 0;
      },
      set(listener) {
        const listeners = this.listeners(method);
        for (let i = 0; i < listeners.length; i++) {
          if (listeners[i]._listener)
            this.removeListener(method, listeners[i]);
        }
        this.addEventListener(method, listener);
      }
    });
  });
  WebSocket.prototype.addEventListener = addEventListener;
  WebSocket.prototype.removeEventListener = removeEventListener;
  module.exports = WebSocket;
  function initAsClient(websocket, address, protocols, options) {
    const opts = _chunkRIYM4ALWjs.__objSpread.call(void 0, _chunkRIYM4ALWjs.__objSpread.call(void 0, {
      protocolVersion: protocolVersions[1],
      maxPayload: 100 * 1024 * 1024,
      perMessageDeflate: true,
      followRedirects: false,
      maxRedirects: 10
    }, options), {
      createConnection: void 0,
      socketPath: void 0,
      hostname: void 0,
      protocol: void 0,
      timeout: void 0,
      method: void 0,
      host: void 0,
      path: void 0,
      port: void 0
    });
    if (!protocolVersions.includes(opts.protocolVersion)) {
      throw new RangeError(`Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`);
    }
    let parsedUrl;
    if (address instanceof URL2) {
      parsedUrl = address;
      websocket._url = address.href;
    } else {
      parsedUrl = new URL2(address);
      websocket._url = address;
    }
    const isUnixSocket = parsedUrl.protocol === "ws+unix:";
    if (!parsedUrl.host && (!isUnixSocket || !parsedUrl.pathname)) {
      throw new Error(`Invalid URL: ${websocket.url}`);
    }
    const isSecure = parsedUrl.protocol === "wss:" || parsedUrl.protocol === "https:";
    const defaultPort = isSecure ? 443 : 80;
    const key = randomBytes(16).toString("base64");
    const get = isSecure ? https.get : http.get;
    let perMessageDeflate;
    opts.createConnection = isSecure ? tlsConnect : netConnect;
    opts.defaultPort = opts.defaultPort || defaultPort;
    opts.port = parsedUrl.port || defaultPort;
    opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
    opts.headers = _chunkRIYM4ALWjs.__objSpread.call(void 0, {
      "Sec-WebSocket-Version": opts.protocolVersion,
      "Sec-WebSocket-Key": key,
      Connection: "Upgrade",
      Upgrade: "websocket"
    }, opts.headers);
    opts.path = parsedUrl.pathname + parsedUrl.search;
    opts.timeout = opts.handshakeTimeout;
    if (opts.perMessageDeflate) {
      perMessageDeflate = new PerMessageDeflate(opts.perMessageDeflate !== true ? opts.perMessageDeflate : {}, false, opts.maxPayload);
      opts.headers["Sec-WebSocket-Extensions"] = format({
        [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
      });
    }
    if (protocols) {
      opts.headers["Sec-WebSocket-Protocol"] = protocols;
    }
    if (opts.origin) {
      if (opts.protocolVersion < 13) {
        opts.headers["Sec-WebSocket-Origin"] = opts.origin;
      } else {
        opts.headers.Origin = opts.origin;
      }
    }
    if (parsedUrl.username || parsedUrl.password) {
      opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
    }
    if (isUnixSocket) {
      const parts = opts.path.split(":");
      opts.socketPath = parts[0];
      opts.path = parts[1];
    }
    let req = websocket._req = get(opts);
    if (opts.timeout) {
      req.on("timeout", () => {
        abortHandshake(websocket, req, "Opening handshake has timed out");
      });
    }
    req.on("error", (err) => {
      if (req === null || req.aborted)
        return;
      req = websocket._req = null;
      websocket._readyState = WebSocket.CLOSING;
      websocket.emit("error", err);
      websocket.emitClose();
    });
    req.on("response", (res) => {
      const location = res.headers.location;
      const statusCode = res.statusCode;
      if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
        if (++websocket._redirects > opts.maxRedirects) {
          abortHandshake(websocket, req, "Maximum redirects exceeded");
          return;
        }
        req.abort();
        const addr = new URL2(location, address);
        initAsClient(websocket, addr, protocols, options);
      } else if (!websocket.emit("unexpected-response", req, res)) {
        abortHandshake(websocket, req, `Unexpected server response: ${res.statusCode}`);
      }
    });
    req.on("upgrade", (res, socket, head) => {
      websocket.emit("upgrade", res);
      if (websocket.readyState !== WebSocket.CONNECTING)
        return;
      req = websocket._req = null;
      const digest = createHash("sha1").update(key + GUID).digest("base64");
      if (res.headers["sec-websocket-accept"] !== digest) {
        abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
        return;
      }
      const serverProt = res.headers["sec-websocket-protocol"];
      const protList = (protocols || "").split(/, */);
      let protError;
      if (!protocols && serverProt) {
        protError = "Server sent a subprotocol but none was requested";
      } else if (protocols && !serverProt) {
        protError = "Server sent no subprotocol";
      } else if (serverProt && !protList.includes(serverProt)) {
        protError = "Server sent an invalid subprotocol";
      }
      if (protError) {
        abortHandshake(websocket, socket, protError);
        return;
      }
      if (serverProt)
        websocket._protocol = serverProt;
      if (perMessageDeflate) {
        try {
          const extensions = parse(res.headers["sec-websocket-extensions"]);
          if (extensions[PerMessageDeflate.extensionName]) {
            perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
            websocket._extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
          }
        } catch (err) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Extensions header");
          return;
        }
      }
      websocket.setSocket(socket, head, opts.maxPayload);
    });
  }
  function netConnect(options) {
    options.path = options.socketPath;
    return net.connect(options);
  }
  function tlsConnect(options) {
    options.path = void 0;
    if (!options.servername && options.servername !== "") {
      options.servername = net.isIP(options.host) ? "" : options.host;
    }
    return tls.connect(options);
  }
  function abortHandshake(websocket, stream, message) {
    websocket._readyState = WebSocket.CLOSING;
    const err = new Error(message);
    Error.captureStackTrace(err, abortHandshake);
    if (stream.setHeader) {
      stream.abort();
      if (stream.socket && !stream.socket.destroyed) {
        stream.socket.destroy();
      }
      stream.once("abort", websocket.emitClose.bind(websocket));
      websocket.emit("error", err);
    } else {
      stream.destroy(err);
      stream.once("error", websocket.emit.bind(websocket, "error"));
      stream.once("close", websocket.emitClose.bind(websocket));
    }
  }
  function sendAfterClose(websocket, data, cb) {
    if (data) {
      const length = toBuffer(data).length;
      if (websocket._socket)
        websocket._sender._bufferedBytes += length;
      else
        websocket._bufferedAmount += length;
    }
    if (cb) {
      const err = new Error(`WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`);
      cb(err);
    }
  }
  function receiverOnConclude(code, reason) {
    const websocket = this[kWebSocket];
    websocket._socket.removeListener("data", socketOnData);
    websocket._socket.resume();
    websocket._closeFrameReceived = true;
    websocket._closeMessage = reason;
    websocket._closeCode = code;
    if (code === 1005)
      websocket.close();
    else
      websocket.close(code, reason);
  }
  function receiverOnDrain() {
    this[kWebSocket]._socket.resume();
  }
  function receiverOnError(err) {
    const websocket = this[kWebSocket];
    websocket._socket.removeListener("data", socketOnData);
    websocket._readyState = WebSocket.CLOSING;
    websocket._closeCode = err[kStatusCode];
    websocket.emit("error", err);
    websocket._socket.destroy();
  }
  function receiverOnFinish() {
    this[kWebSocket].emitClose();
  }
  function receiverOnMessage(data) {
    this[kWebSocket].emit("message", data);
  }
  function receiverOnPing(data) {
    const websocket = this[kWebSocket];
    websocket.pong(data, !websocket._isServer, NOOP);
    websocket.emit("ping", data);
  }
  function receiverOnPong(data) {
    this[kWebSocket].emit("pong", data);
  }
  function socketOnClose() {
    const websocket = this[kWebSocket];
    this.removeListener("close", socketOnClose);
    this.removeListener("end", socketOnEnd);
    websocket._readyState = WebSocket.CLOSING;
    websocket._socket.read();
    websocket._receiver.end();
    this.removeListener("data", socketOnData);
    this[kWebSocket] = void 0;
    clearTimeout(websocket._closeTimer);
    if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
      websocket.emitClose();
    } else {
      websocket._receiver.on("error", receiverOnFinish);
      websocket._receiver.on("finish", receiverOnFinish);
    }
  }
  function socketOnData(chunk) {
    if (!this[kWebSocket]._receiver.write(chunk)) {
      this.pause();
    }
  }
  function socketOnEnd() {
    const websocket = this[kWebSocket];
    websocket._readyState = WebSocket.CLOSING;
    websocket._receiver.end();
    this.end();
  }
  function socketOnError() {
    const websocket = this[kWebSocket];
    this.removeListener("error", socketOnError);
    this.on("error", NOOP);
    if (websocket) {
      websocket._readyState = WebSocket.CLOSING;
      this.destroy();
    }
  }
});

// node_modules/.pnpm/ws@7.4.5/node_modules/ws/lib/stream.js
var require_stream = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  var {Duplex} = require("stream");
  function emitClose(stream) {
    stream.emit("close");
  }
  function duplexOnEnd() {
    if (!this.destroyed && this._writableState.finished) {
      this.destroy();
    }
  }
  function duplexOnError(err) {
    this.removeListener("error", duplexOnError);
    this.destroy();
    if (this.listenerCount("error") === 0) {
      this.emit("error", err);
    }
  }
  function createWebSocketStream(ws, options) {
    let resumeOnReceiverDrain = true;
    function receiverOnDrain() {
      if (resumeOnReceiverDrain)
        ws._socket.resume();
    }
    if (ws.readyState === ws.CONNECTING) {
      ws.once("open", function open() {
        ws._receiver.removeAllListeners("drain");
        ws._receiver.on("drain", receiverOnDrain);
      });
    } else {
      ws._receiver.removeAllListeners("drain");
      ws._receiver.on("drain", receiverOnDrain);
    }
    const duplex = new Duplex(_chunkRIYM4ALWjs.__objSpread.call(void 0, _chunkRIYM4ALWjs.__objSpread.call(void 0, {}, options), {
      autoDestroy: false,
      emitClose: false,
      objectMode: false,
      writableObjectMode: false
    }));
    ws.on("message", function message(msg) {
      if (!duplex.push(msg)) {
        resumeOnReceiverDrain = false;
        ws._socket.pause();
      }
    });
    ws.once("error", function error(err) {
      if (duplex.destroyed)
        return;
      duplex.destroy(err);
    });
    ws.once("close", function close() {
      if (duplex.destroyed)
        return;
      duplex.push(null);
    });
    duplex._destroy = function(err, callback) {
      if (ws.readyState === ws.CLOSED) {
        callback(err);
        process.nextTick(emitClose, duplex);
        return;
      }
      let called = false;
      ws.once("error", function error(err2) {
        called = true;
        callback(err2);
      });
      ws.once("close", function close() {
        if (!called)
          callback(err);
        process.nextTick(emitClose, duplex);
      });
      ws.terminate();
    };
    duplex._final = function(callback) {
      if (ws.readyState === ws.CONNECTING) {
        ws.once("open", function open() {
          duplex._final(callback);
        });
        return;
      }
      if (ws._socket === null)
        return;
      if (ws._socket._writableState.finished) {
        callback();
        if (duplex._readableState.endEmitted)
          duplex.destroy();
      } else {
        ws._socket.once("finish", function finish() {
          callback();
        });
        ws.close();
      }
    };
    duplex._read = function() {
      if (ws.readyState === ws.OPEN && !resumeOnReceiverDrain) {
        resumeOnReceiverDrain = true;
        if (!ws._receiver._writableState.needDrain)
          ws._socket.resume();
      }
    };
    duplex._write = function(chunk, encoding, callback) {
      if (ws.readyState === ws.CONNECTING) {
        ws.once("open", function open() {
          duplex._write(chunk, encoding, callback);
        });
        return;
      }
      ws.send(chunk, callback);
    };
    duplex.on("end", duplexOnEnd);
    duplex.on("error", duplexOnError);
    return duplex;
  }
  module.exports = createWebSocketStream;
});

// node_modules/.pnpm/ws@7.4.5/node_modules/ws/lib/websocket-server.js
var require_websocket_server = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  var EventEmitter = require("events");
  var {createHash} = require("crypto");
  var {createServer, STATUS_CODES} = require("http");
  var PerMessageDeflate = require_permessage_deflate();
  var WebSocket = require_websocket();
  var {format, parse} = require_extension();
  var {GUID, kWebSocket} = require_constants();
  var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
  var WebSocketServer = class extends EventEmitter {
    constructor(options, callback) {
      super();
      options = _chunkRIYM4ALWjs.__objSpread.call(void 0, {
        maxPayload: 100 * 1024 * 1024,
        perMessageDeflate: false,
        handleProtocols: null,
        clientTracking: true,
        verifyClient: null,
        noServer: false,
        backlog: null,
        server: null,
        host: null,
        path: null,
        port: null
      }, options);
      if (options.port == null && !options.server && !options.noServer) {
        throw new TypeError('One of the "port", "server", or "noServer" options must be specified');
      }
      if (options.port != null) {
        this._server = createServer((req, res) => {
          const body = STATUS_CODES[426];
          res.writeHead(426, {
            "Content-Length": body.length,
            "Content-Type": "text/plain"
          });
          res.end(body);
        });
        this._server.listen(options.port, options.host, options.backlog, callback);
      } else if (options.server) {
        this._server = options.server;
      }
      if (this._server) {
        const emitConnection = this.emit.bind(this, "connection");
        this._removeListeners = addListeners(this._server, {
          listening: this.emit.bind(this, "listening"),
          error: this.emit.bind(this, "error"),
          upgrade: (req, socket, head) => {
            this.handleUpgrade(req, socket, head, emitConnection);
          }
        });
      }
      if (options.perMessageDeflate === true)
        options.perMessageDeflate = {};
      if (options.clientTracking)
        this.clients = new Set();
      this.options = options;
    }
    address() {
      if (this.options.noServer) {
        throw new Error('The server is operating in "noServer" mode');
      }
      if (!this._server)
        return null;
      return this._server.address();
    }
    close(cb) {
      if (cb)
        this.once("close", cb);
      if (this.clients) {
        for (const client of this.clients)
          client.terminate();
      }
      const server = this._server;
      if (server) {
        this._removeListeners();
        this._removeListeners = this._server = null;
        if (this.options.port != null) {
          server.close(() => this.emit("close"));
          return;
        }
      }
      process.nextTick(emitClose, this);
    }
    shouldHandle(req) {
      if (this.options.path) {
        const index = req.url.indexOf("?");
        const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
        if (pathname !== this.options.path)
          return false;
      }
      return true;
    }
    handleUpgrade(req, socket, head, cb) {
      socket.on("error", socketOnError);
      const key = req.headers["sec-websocket-key"] !== void 0 ? req.headers["sec-websocket-key"].trim() : false;
      const version = +req.headers["sec-websocket-version"];
      const extensions = {};
      if (req.method !== "GET" || req.headers.upgrade.toLowerCase() !== "websocket" || !key || !keyRegex.test(key) || version !== 8 && version !== 13 || !this.shouldHandle(req)) {
        return abortHandshake(socket, 400);
      }
      if (this.options.perMessageDeflate) {
        const perMessageDeflate = new PerMessageDeflate(this.options.perMessageDeflate, true, this.options.maxPayload);
        try {
          const offers = parse(req.headers["sec-websocket-extensions"]);
          if (offers[PerMessageDeflate.extensionName]) {
            perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
            extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
          }
        } catch (err) {
          return abortHandshake(socket, 400);
        }
      }
      if (this.options.verifyClient) {
        const info = {
          origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
          secure: !!(req.socket.authorized || req.socket.encrypted),
          req
        };
        if (this.options.verifyClient.length === 2) {
          this.options.verifyClient(info, (verified, code, message, headers) => {
            if (!verified) {
              return abortHandshake(socket, code || 401, message, headers);
            }
            this.completeUpgrade(key, extensions, req, socket, head, cb);
          });
          return;
        }
        if (!this.options.verifyClient(info))
          return abortHandshake(socket, 401);
      }
      this.completeUpgrade(key, extensions, req, socket, head, cb);
    }
    completeUpgrade(key, extensions, req, socket, head, cb) {
      if (!socket.readable || !socket.writable)
        return socket.destroy();
      if (socket[kWebSocket]) {
        throw new Error("server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration");
      }
      const digest = createHash("sha1").update(key + GUID).digest("base64");
      const headers = [
        "HTTP/1.1 101 Switching Protocols",
        "Upgrade: websocket",
        "Connection: Upgrade",
        `Sec-WebSocket-Accept: ${digest}`
      ];
      const ws = new WebSocket(null);
      let protocol = req.headers["sec-websocket-protocol"];
      if (protocol) {
        protocol = protocol.trim().split(/ *, */);
        if (this.options.handleProtocols) {
          protocol = this.options.handleProtocols(protocol, req);
        } else {
          protocol = protocol[0];
        }
        if (protocol) {
          headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
          ws._protocol = protocol;
        }
      }
      if (extensions[PerMessageDeflate.extensionName]) {
        const params = extensions[PerMessageDeflate.extensionName].params;
        const value = format({
          [PerMessageDeflate.extensionName]: [params]
        });
        headers.push(`Sec-WebSocket-Extensions: ${value}`);
        ws._extensions = extensions;
      }
      this.emit("headers", headers, req);
      socket.write(headers.concat("\r\n").join("\r\n"));
      socket.removeListener("error", socketOnError);
      ws.setSocket(socket, head, this.options.maxPayload);
      if (this.clients) {
        this.clients.add(ws);
        ws.on("close", () => this.clients.delete(ws));
      }
      cb(ws, req);
    }
  };
  module.exports = WebSocketServer;
  function addListeners(server, map) {
    for (const event of Object.keys(map))
      server.on(event, map[event]);
    return function removeListeners() {
      for (const event of Object.keys(map)) {
        server.removeListener(event, map[event]);
      }
    };
  }
  function emitClose(server) {
    server.emit("close");
  }
  function socketOnError() {
    this.destroy();
  }
  function abortHandshake(socket, code, message, headers) {
    if (socket.writable) {
      message = message || STATUS_CODES[code];
      headers = _chunkRIYM4ALWjs.__objSpread.call(void 0, {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message)
      }, headers);
      socket.write(`HTTP/1.1 ${code} ${STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message);
    }
    socket.removeListener("error", socketOnError);
    socket.destroy();
  }
});

// node_modules/.pnpm/ws@7.4.5/node_modules/ws/index.js
var require_ws = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  var WebSocket = require_websocket();
  WebSocket.createWebSocketStream = require_stream();
  WebSocket.Server = require_websocket_server();
  WebSocket.Receiver = require_receiver();
  WebSocket.Sender = require_sender();
  module.exports = WebSocket;
});

// node_modules/.pnpm/chrome-remote-interface@0.30.0/node_modules/chrome-remote-interface/lib/api.js
var require_api = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  function arrayToObject(parameters) {
    const keyValue = {};
    parameters.forEach((parameter) => {
      const name = parameter.name;
      delete parameter.name;
      keyValue[name] = parameter;
    });
    return keyValue;
  }
  function decorate(to, category, object) {
    to.category = category;
    Object.keys(object).forEach((field) => {
      if (field === "name") {
        return;
      }
      if (category === "type" && field === "properties" || field === "parameters") {
        to[field] = arrayToObject(object[field]);
      } else {
        to[field] = object[field];
      }
    });
  }
  function addCommand(chrome2, domainName, command) {
    const handler = (params, sessionId, callback) => {
      return chrome2.send(`${domainName}.${command.name}`, params, sessionId, callback);
    };
    decorate(handler, "command", command);
    chrome2[domainName][command.name] = handler;
  }
  function addEvent(chrome2, domainName, event) {
    const eventName = `${domainName}.${event.name}`;
    const handler = (sessionId, handler2) => {
      if (typeof sessionId === "function") {
        handler2 = sessionId;
        sessionId = void 0;
      }
      const rawEventName = sessionId ? `${eventName}.${sessionId}` : eventName;
      if (typeof handler2 === "function") {
        chrome2.on(rawEventName, handler2);
        return () => chrome2.removeListener(rawEventName, handler2);
      } else {
        return new Promise((fulfill, reject) => {
          chrome2.once(rawEventName, fulfill);
        });
      }
    };
    decorate(handler, "event", event);
    chrome2[domainName][event.name] = handler;
  }
  function addType(chrome2, domainName, type) {
    const help = {};
    decorate(help, "type", type);
    chrome2[domainName][type.id] = help;
  }
  function prepare(object, protocol) {
    object.protocol = protocol;
    protocol.domains.forEach((domain) => {
      const domainName = domain.domain;
      object[domainName] = {};
      (domain.commands || []).forEach((command) => {
        addCommand(object, domainName, command);
      });
      (domain.events || []).forEach((event) => {
        addEvent(object, domainName, event);
      });
      (domain.types || []).forEach((type) => {
        addType(object, domainName, type);
      });
      object[domainName].on = (eventName, handler) => {
        return object[domainName][eventName](handler);
      };
    });
  }
  module.exports.prepare = prepare;
});

// node_modules/.pnpm/chrome-remote-interface@0.30.0/node_modules/chrome-remote-interface/lib/chrome.js
var require_chrome = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  var EventEmitter = require("events");
  var util = require("util");
  var formatUrl = require("url").format;
  var parseUrl = require("url").parse;
  var WebSocket = require_ws();
  var api = require_api();
  var defaults = require_defaults();
  var devtools = require_devtools();
  var ProtocolError = class extends Error {
    constructor(request, response) {
      let {message} = response;
      if (response.data) {
        message += ` (${response.data})`;
      }
      super(message);
      this.request = request;
      this.response = response;
    }
  };
  var Chrome = class extends EventEmitter {
    constructor(options, notifier) {
      super();
      const defaultTarget = (targets) => {
        let backup;
        let target = targets.find((target2) => {
          if (target2.webSocketDebuggerUrl) {
            backup = backup || target2;
            return target2.type === "page";
          } else {
            return false;
          }
        });
        target = target || backup;
        if (target) {
          return target;
        } else {
          throw new Error("No inspectable targets");
        }
      };
      options = options || {};
      this.host = options.host || defaults.HOST;
      this.port = options.port || defaults.PORT;
      this.secure = !!options.secure;
      this.useHostName = !!options.useHostName;
      this.alterPath = options.alterPath || ((path) => path);
      this.protocol = options.protocol;
      this.local = !!options.local;
      this.target = options.target || defaultTarget;
      this._notifier = notifier;
      this._callbacks = {};
      this._nextCommandId = 1;
      this.webSocketUrl = void 0;
      this._start();
    }
    inspect(depth, options) {
      options.customInspect = false;
      return util.inspect(this, options);
    }
    send(method, params, sessionId, callback) {
      const optionals = Array.from(arguments).slice(1);
      params = optionals.find((x) => typeof x === "object");
      sessionId = optionals.find((x) => typeof x === "string");
      callback = optionals.find((x) => typeof x === "function");
      if (typeof callback === "function") {
        this._enqueueCommand(method, params, sessionId, callback);
        return void 0;
      } else {
        return new Promise((fulfill, reject) => {
          this._enqueueCommand(method, params, sessionId, (error, response) => {
            if (error) {
              const request = {method, params, sessionId};
              reject(error instanceof Error ? error : new ProtocolError(request, response));
            } else {
              fulfill(response);
            }
          });
        });
      }
    }
    close(callback) {
      const closeWebSocket = (callback2) => {
        if (this._ws.readyState === 3) {
          callback2();
        } else {
          this._ws.removeAllListeners("close");
          this._ws.once("close", () => {
            this._ws.removeAllListeners();
            callback2();
          });
          this._ws.close();
        }
      };
      if (typeof callback === "function") {
        closeWebSocket(callback);
        return void 0;
      } else {
        return new Promise((fulfill, reject) => {
          closeWebSocket(fulfill);
        });
      }
    }
    async _start() {
      const options = {
        host: this.host,
        port: this.port,
        secure: this.secure,
        useHostName: this.useHostName,
        alterPath: this.alterPath
      };
      try {
        const url = await this._fetchDebuggerURL(options);
        const urlObject = parseUrl(url);
        urlObject.pathname = options.alterPath(urlObject.pathname);
        this.webSocketUrl = formatUrl(urlObject);
        options.host = urlObject.hostname;
        options.port = urlObject.port || options.port;
        const protocol = await this._fetchProtocol(options);
        api.prepare(this, protocol);
        await this._connectToWebSocket();
        process.nextTick(() => {
          this._notifier.emit("connect", this);
        });
      } catch (err) {
        this._notifier.emit("error", err);
      }
    }
    async _fetchDebuggerURL(options) {
      const userTarget = this.target;
      switch (typeof userTarget) {
        case "string": {
          let idOrUrl = userTarget;
          if (idOrUrl.startsWith("/")) {
            idOrUrl = `ws://${this.host}:${this.port}${idOrUrl}`;
          }
          if (idOrUrl.match(/^wss?:/i)) {
            return idOrUrl;
          } else {
            const targets = await devtools.List(options);
            const object = targets.find((target) => target.id === idOrUrl);
            return object.webSocketDebuggerUrl;
          }
        }
        case "object": {
          const object = userTarget;
          return object.webSocketDebuggerUrl;
        }
        case "function": {
          const func = userTarget;
          const targets = await devtools.List(options);
          const result = func(targets);
          const object = typeof result === "number" ? targets[result] : result;
          return object.webSocketDebuggerUrl;
        }
        default:
          throw new Error(`Invalid target argument "${this.target}"`);
      }
    }
    async _fetchProtocol(options) {
      if (this.protocol) {
        return this.protocol;
      } else {
        options.local = this.local;
        return await devtools.Protocol(options);
      }
    }
    _connectToWebSocket() {
      return new Promise((fulfill, reject) => {
        try {
          if (this.secure) {
            this.webSocketUrl = this.webSocketUrl.replace(/^ws:/i, "wss:");
          }
          this._ws = new WebSocket(this.webSocketUrl);
        } catch (err) {
          reject(err);
          return;
        }
        this._ws.on("open", () => {
          fulfill();
        });
        this._ws.on("message", (data) => {
          const message = JSON.parse(data);
          this._handleMessage(message);
        });
        this._ws.on("close", (code) => {
          this.emit("disconnect");
        });
        this._ws.on("error", (err) => {
          reject(err);
        });
      });
    }
    _handleMessage(message) {
      if (message.id) {
        const callback = this._callbacks[message.id];
        if (!callback) {
          return;
        }
        if (message.error) {
          callback(true, message.error);
        } else {
          callback(false, message.result || {});
        }
        delete this._callbacks[message.id];
        if (Object.keys(this._callbacks).length === 0) {
          this.emit("ready");
        }
      } else if (message.method) {
        const {method, params, sessionId} = message;
        this.emit("event", message);
        this.emit(method, params, sessionId);
        this.emit(`${method}.${sessionId}`, params, sessionId);
      }
    }
    _enqueueCommand(method, params, sessionId, callback) {
      const id = this._nextCommandId++;
      const message = {
        id,
        method,
        sessionId,
        params: params || {}
      };
      this._ws.send(JSON.stringify(message), (err) => {
        if (err) {
          if (typeof callback === "function") {
            callback(err);
          }
        } else {
          this._callbacks[id] = callback;
        }
      });
    }
  };
  module.exports = Chrome;
});

// node_modules/.pnpm/chrome-remote-interface@0.30.0/node_modules/chrome-remote-interface/index.js
var require_chrome_remote_interface = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  var EventEmitter = require("events");
  var devtools = require_devtools();
  var Chrome = require_chrome();
  function CDP2(options, callback) {
    if (typeof options === "function") {
      callback = options;
      options = void 0;
    }
    const notifier = new EventEmitter();
    if (typeof callback === "function") {
      process.nextTick(() => {
        new Chrome(options, notifier);
      });
      return notifier.once("connect", callback);
    } else {
      return new Promise((fulfill, reject) => {
        notifier.once("connect", fulfill);
        notifier.once("error", reject);
        new Chrome(options, notifier);
      });
    }
  }
  module.exports = CDP2;
  module.exports.Protocol = devtools.Protocol;
  module.exports.List = devtools.List;
  module.exports.New = devtools.New;
  module.exports.Activate = devtools.Activate;
  module.exports.Close = devtools.Close;
  module.exports.Version = devtools.Version;
});

// node_modules/.pnpm/exit-hook@2.2.1/node_modules/exit-hook/index.js
var require_exit_hook = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  var callbacks = new Set();
  var isCalled = false;
  var isRegistered = false;
  function exit(exit2, signal) {
    if (isCalled) {
      return;
    }
    isCalled = true;
    for (const callback of callbacks) {
      callback();
    }
    if (exit2 === true) {
      process.exit(128 + signal);
    }
  }
  module.exports = (callback) => {
    callbacks.add(callback);
    if (!isRegistered) {
      isRegistered = true;
      process.once("exit", exit);
      process.once("SIGINT", exit.bind(null, true, 2));
      process.once("SIGTERM", exit.bind(null, true, 15));
      process.on("message", (message) => {
        if (message === "shutdown") {
          exit(true, -128);
        }
      });
    }
    return () => {
      callbacks.delete(callback);
    };
  };
});

// src/tweet-camera.ts
var import_chrome_launcher = _chunkRIYM4ALWjs.__toModule.call(void 0, require_dist());
var import_chrome_remote_interface = _chunkRIYM4ALWjs.__toModule.call(void 0, require_chrome_remote_interface());
var import_exit_hook = _chunkRIYM4ALWjs.__toModule.call(void 0, require_exit_hook());
var _assert = require('assert'); var _assert2 = _interopRequireDefault(_assert);
var getEmbeddableTweetUrl = (tweetId, options) => {
  var _a;
  const embeddableTweetUrl = new URL("https://platform.twitter.com/embed/Tweet.html");
  const searchParameters = {
    id: tweetId,
    theme: options.darkMode ? "dark" : "light",
    hideThread: options.showThread ? "false" : "true",
    lang: (_a = options.locale) != null ? _a : "en",
    embedId: "twitter-widget-0",
    features: "eyJ0ZndfZXhwZXJpbWVudHNfY29va2llX2V4cGlyYXRpb24iOnsiYnVja2V0IjoxMjA5NjAwLCJ2ZXJzaW9uIjpudWxsfSwidGZ3X2hvcml6b25fdHdlZXRfZW1iZWRfOTU1NSI6eyJidWNrZXQiOiJodGUiLCJ2ZXJzaW9uIjpudWxsfX0=",
    frame: "false",
    hideCard: "false",
    sessionId: "4ee57c34a8bc3f4118cee97a9904f889f35e29b4",
    widgetsVersion: "82e1070:1619632193066"
  };
  for (const key in searchParameters) {
    embeddableTweetUrl.searchParams.set(key, searchParameters[key]);
  }
  return embeddableTweetUrl.toString();
};
var waitForTweetLoad = (Network) => new Promise((resolve, reject) => {
  Network.responseReceived(({type, response}) => {
    if (type === "XHR" && response.url.startsWith("https://cdn.syndication.twimg.com/tweet")) {
      if (response.status === 200) {
        return resolve();
      }
      if (response.status === 404) {
        return reject(new Error("Tweet not found"));
      }
      reject(new Error(`Failed to fetch tweet: ${response.status}`));
    }
  });
});
var TweetCamera = class {
  constructor() {
    this.initializingChrome = this.initializeChrome();
  }
  async initializeChrome() {
    const chrome2 = await (0, import_chrome_launcher.launch)({
      chromeFlags: [
        "--headless",
        "--disable-gpu"
      ]
    });
    (0, import_exit_hook.default)(() => {
      chrome2.kill();
    });
    this.chrome = chrome2;
    const browserClient = await (0, import_chrome_remote_interface.default)({
      port: chrome2.port
    });
    return browserClient;
  }
  static parseTweetUrl(tweetUrl) {
    var _a;
    _assert2.default.call(void 0, tweetUrl, "Tweet URL must be passed in");
    const [, username, tweetId] = (_a = tweetUrl.match(/twitter.com\/(\w{1,15})\/status\/(\d+)/)) != null ? _a : [];
    _assert2.default.call(void 0, username && tweetId, `Invalid Tweet URL: ${tweetUrl}`);
    return {
      username,
      tweetId
    };
  }
  static getRecommendedFileName(username, tweetId, options = {}) {
    const nameComponents = [username, tweetId];
    if (options.width !== 550) {
      nameComponents.push(`w${options.width}`);
    }
    if (options.showThread) {
      nameComponents.push("thread");
    }
    if (options.darkMode) {
      nameComponents.push("dark");
    }
    if (options.locale !== "en") {
      nameComponents.push(options.locale);
    }
    return `${nameComponents.join("-")}.png`;
  }
  async snapTweet(tweetId, options = {}) {
    var _a;
    const browserClient = await this.initializingChrome;
    const {targetId} = await browserClient.Target.createTarget({
      url: getEmbeddableTweetUrl(tweetId, options),
      width: (_a = options.width) != null ? _a : 550,
      height: 1e3
    });
    const client = await (0, import_chrome_remote_interface.default)({
      port: this.chrome.port,
      target: targetId
    });
    await client.Network.enable();
    await waitForTweetLoad(client.Network);
    await _chunk3EAOVE4Wjs.waitForNetworkIdle.call(void 0, client.Network, 200);
    const {root} = await client.DOM.getDocument();
    const tweetContainerNodeId = await _chunk3EAOVE4Wjs.querySelector.call(void 0, client.DOM, root.nodeId, "#app > div > div > div:last-child");
    await Promise.all([
      _chunk3EAOVE4Wjs.hideNode.call(void 0, client.DOM, tweetContainerNodeId, '[role="button"][aria-label]'),
      _chunk3EAOVE4Wjs.hideNode.call(void 0, client.DOM, tweetContainerNodeId, 'a[href$="twitter-for-websites-ads-info-and-privacy"]'),
      client.DOM.setAttributeValue({
        nodeId: tweetContainerNodeId,
        name: "style",
        value: "max-width: unset"
      }),
      client.Emulation.setDefaultBackgroundColorOverride({
        color: {
          r: 0,
          g: 0,
          b: 0,
          a: 0
        }
      })
    ]);
    if (options.width > 550) {
      await _chunk3EAOVE4Wjs.waitForNetworkIdle.call(void 0, client.Network, 200);
    }
    const snapshot = await _chunk3EAOVE4Wjs.screenshotNode.call(void 0, client.Page, client.DOM, tweetContainerNodeId);
    client.Target.closeTarget({
      targetId
    });
    return snapshot;
  }
  async close() {
    const browserClient = await this.initializingChrome;
    await browserClient.close();
    await this.chrome.kill();
  }
};
var tweet_camera_default = TweetCamera;






exports.require_rimraf = require_rimraf; exports.require_is_docker = require_is_docker; exports.require_is_wsl = require_is_wsl; exports.tweet_camera_default = tweet_camera_default;
/**
 * @license Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
/**
 * @license Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
