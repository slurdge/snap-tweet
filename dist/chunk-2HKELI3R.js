"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkRIYM4ALWjs = require('./chunk-RIYM4ALW.js');

// node_modules/.pnpm/escape-string-regexp@1.0.5/node_modules/escape-string-regexp/index.js
var require_escape_string_regexp = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
  module.exports = function(str) {
    if (typeof str !== "string") {
      throw new TypeError("Expected a string");
    }
    return str.replace(matchOperatorsRe, "\\$&");
  };
});



exports.require_escape_string_regexp = require_escape_string_regexp;
