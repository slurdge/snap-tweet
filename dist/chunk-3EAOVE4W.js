"use strict";Object.defineProperty(exports, "__esModule", {value: true});



var _chunkRIYM4ALWjs = require('./chunk-RIYM4ALW.js');

// node_modules/.pnpm/retry@0.12.0/node_modules/retry/lib/retry_operation.js
var require_retry_operation = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  function RetryOperation(timeouts, options) {
    if (typeof options === "boolean") {
      options = {forever: options};
    }
    this._originalTimeouts = JSON.parse(JSON.stringify(timeouts));
    this._timeouts = timeouts;
    this._options = options || {};
    this._maxRetryTime = options && options.maxRetryTime || Infinity;
    this._fn = null;
    this._errors = [];
    this._attempts = 1;
    this._operationTimeout = null;
    this._operationTimeoutCb = null;
    this._timeout = null;
    this._operationStart = null;
    if (this._options.forever) {
      this._cachedTimeouts = this._timeouts.slice(0);
    }
  }
  module.exports = RetryOperation;
  RetryOperation.prototype.reset = function() {
    this._attempts = 1;
    this._timeouts = this._originalTimeouts;
  };
  RetryOperation.prototype.stop = function() {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    this._timeouts = [];
    this._cachedTimeouts = null;
  };
  RetryOperation.prototype.retry = function(err) {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    if (!err) {
      return false;
    }
    var currentTime = new Date().getTime();
    if (err && currentTime - this._operationStart >= this._maxRetryTime) {
      this._errors.unshift(new Error("RetryOperation timeout occurred"));
      return false;
    }
    this._errors.push(err);
    var timeout = this._timeouts.shift();
    if (timeout === void 0) {
      if (this._cachedTimeouts) {
        this._errors.splice(this._errors.length - 1, this._errors.length);
        this._timeouts = this._cachedTimeouts.slice(0);
        timeout = this._timeouts.shift();
      } else {
        return false;
      }
    }
    var self = this;
    var timer = setTimeout(function() {
      self._attempts++;
      if (self._operationTimeoutCb) {
        self._timeout = setTimeout(function() {
          self._operationTimeoutCb(self._attempts);
        }, self._operationTimeout);
        if (self._options.unref) {
          self._timeout.unref();
        }
      }
      self._fn(self._attempts);
    }, timeout);
    if (this._options.unref) {
      timer.unref();
    }
    return true;
  };
  RetryOperation.prototype.attempt = function(fn, timeoutOps) {
    this._fn = fn;
    if (timeoutOps) {
      if (timeoutOps.timeout) {
        this._operationTimeout = timeoutOps.timeout;
      }
      if (timeoutOps.cb) {
        this._operationTimeoutCb = timeoutOps.cb;
      }
    }
    var self = this;
    if (this._operationTimeoutCb) {
      this._timeout = setTimeout(function() {
        self._operationTimeoutCb();
      }, self._operationTimeout);
    }
    this._operationStart = new Date().getTime();
    this._fn(this._attempts);
  };
  RetryOperation.prototype.try = function(fn) {
    console.log("Using RetryOperation.try() is deprecated");
    this.attempt(fn);
  };
  RetryOperation.prototype.start = function(fn) {
    console.log("Using RetryOperation.start() is deprecated");
    this.attempt(fn);
  };
  RetryOperation.prototype.start = RetryOperation.prototype.try;
  RetryOperation.prototype.errors = function() {
    return this._errors;
  };
  RetryOperation.prototype.attempts = function() {
    return this._attempts;
  };
  RetryOperation.prototype.mainError = function() {
    if (this._errors.length === 0) {
      return null;
    }
    var counts = {};
    var mainError = null;
    var mainErrorCount = 0;
    for (var i = 0; i < this._errors.length; i++) {
      var error = this._errors[i];
      var message = error.message;
      var count = (counts[message] || 0) + 1;
      counts[message] = count;
      if (count >= mainErrorCount) {
        mainError = error;
        mainErrorCount = count;
      }
    }
    return mainError;
  };
});

// node_modules/.pnpm/retry@0.12.0/node_modules/retry/lib/retry.js
var require_retry = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports) => {
  var RetryOperation = require_retry_operation();
  exports.operation = function(options) {
    var timeouts = exports.timeouts(options);
    return new RetryOperation(timeouts, {
      forever: options && options.forever,
      unref: options && options.unref,
      maxRetryTime: options && options.maxRetryTime
    });
  };
  exports.timeouts = function(options) {
    if (options instanceof Array) {
      return [].concat(options);
    }
    var opts = {
      retries: 10,
      factor: 2,
      minTimeout: 1 * 1e3,
      maxTimeout: Infinity,
      randomize: false
    };
    for (var key in options) {
      opts[key] = options[key];
    }
    if (opts.minTimeout > opts.maxTimeout) {
      throw new Error("minTimeout is greater than maxTimeout");
    }
    var timeouts = [];
    for (var i = 0; i < opts.retries; i++) {
      timeouts.push(this.createTimeout(i, opts));
    }
    if (options && options.forever && !timeouts.length) {
      timeouts.push(this.createTimeout(i, opts));
    }
    timeouts.sort(function(a, b) {
      return a - b;
    });
    return timeouts;
  };
  exports.createTimeout = function(attempt, opts) {
    var random = opts.randomize ? Math.random() + 1 : 1;
    var timeout = Math.round(random * opts.minTimeout * Math.pow(opts.factor, attempt));
    timeout = Math.min(timeout, opts.maxTimeout);
    return timeout;
  };
  exports.wrap = function(obj, options, methods) {
    if (options instanceof Array) {
      methods = options;
      options = null;
    }
    if (!methods) {
      methods = [];
      for (var key in obj) {
        if (typeof obj[key] === "function") {
          methods.push(key);
        }
      }
    }
    for (var i = 0; i < methods.length; i++) {
      var method = methods[i];
      var original = obj[method];
      obj[method] = function retryWrapper(original2) {
        var op = exports.operation(options);
        var args = Array.prototype.slice.call(arguments, 1);
        var callback = args.pop();
        args.push(function(err) {
          if (op.retry(err)) {
            return;
          }
          if (err) {
            arguments[0] = op.mainError();
          }
          callback.apply(this, arguments);
        });
        op.attempt(function() {
          original2.apply(obj, args);
        });
      }.bind(obj, original);
      obj[method].options = options;
    }
  };
});

// node_modules/.pnpm/retry@0.12.0/node_modules/retry/index.js
var require_retry2 = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  module.exports = require_retry();
});

// node_modules/.pnpm/p-retry@4.5.0/node_modules/p-retry/index.js
var require_p_retry = _chunkRIYM4ALWjs.__commonJS.call(void 0, (exports, module) => {
  "use strict";
  var retry = require_retry2();
  var networkErrorMsgs = [
    "Failed to fetch",
    "NetworkError when attempting to fetch resource",
    "The Internet connection appears to be offline",
    "Network request failed"
  ];
  var AbortError = class extends Error {
    constructor(message) {
      super();
      if (message instanceof Error) {
        this.originalError = message;
        ({message} = message);
      } else {
        this.originalError = new Error(message);
        this.originalError.stack = this.stack;
      }
      this.name = "AbortError";
      this.message = message;
    }
  };
  var decorateErrorWithCounts = (error, attemptNumber, options) => {
    const retriesLeft = options.retries - (attemptNumber - 1);
    error.attemptNumber = attemptNumber;
    error.retriesLeft = retriesLeft;
    return error;
  };
  var isNetworkError = (errorMessage) => networkErrorMsgs.includes(errorMessage);
  var pRetry2 = (input, options) => new Promise((resolve, reject) => {
    options = _chunkRIYM4ALWjs.__objSpread.call(void 0, {
      onFailedAttempt: () => {
      },
      retries: 10
    }, options);
    const operation = retry.operation(options);
    operation.attempt(async (attemptNumber) => {
      try {
        resolve(await input(attemptNumber));
      } catch (error) {
        if (!(error instanceof Error)) {
          reject(new TypeError(`Non-error was thrown: "${error}". You should only throw errors.`));
          return;
        }
        if (error instanceof AbortError) {
          operation.stop();
          reject(error.originalError);
        } else if (error instanceof TypeError && !isNetworkError(error.message)) {
          operation.stop();
          reject(error);
        } else {
          decorateErrorWithCounts(error, attemptNumber, options);
          try {
            await options.onFailedAttempt(error);
          } catch (error2) {
            reject(error2);
            return;
          }
          if (!operation.retry(error)) {
            reject(operation.mainError());
          }
        }
      }
    });
  });
  module.exports = pRetry2;
  module.exports.default = pRetry2;
  module.exports.AbortError = AbortError;
});

// src/cdp-utils.ts
var import_p_retry = _chunkRIYM4ALWjs.__toModule.call(void 0, require_p_retry());
var waitForNetworkIdle = (Network, waitFor) => new Promise((resolve) => {
  const trackRequests = new Set();
  let resolvingTimeout = setTimeout(resolve, waitFor);
  Network.requestWillBeSent(({requestId}) => {
    trackRequests.add(requestId);
    clearTimeout(resolvingTimeout);
  });
  Network.loadingFinished(({requestId}) => {
    trackRequests.delete(requestId);
    if (trackRequests.size === 0) {
      resolvingTimeout = setTimeout(resolve, waitFor);
    }
  });
});
var sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});
var querySelector = async (DOM, contextNodeId, selector) => await (0, import_p_retry.default)(async () => {
  const {nodeId} = await DOM.querySelector({
    nodeId: contextNodeId,
    selector
  });
  if (nodeId === 0) {
    throw new Error("Not found");
  }
  return nodeId;
}, {
  retries: 3,
  onFailedAttempt: async () => await sleep(100)
});
var hideNode = async (DOM, queryNodeId, selector) => {
  const nodeId = await querySelector(DOM, queryNodeId, selector);
  await DOM.setAttributeValue({
    nodeId,
    name: "style",
    value: "visibility: hidden"
  });
};
var screenshotNode = async (Page, DOM, nodeId) => {
  try {
    const {model} = await DOM.getBoxModel({nodeId});
    const screenshot = await Page.captureScreenshot({
      clip: {
        x: 0,
        y: 0,
        width: model.width,
        height: model.height,
        scale: 1
      }
    });
    return Buffer.from(screenshot.data, "base64");
  } catch (error) {
    console.log(error);
    throw new Error("Failed to take a snapshot");
  }
};






exports.waitForNetworkIdle = waitForNetworkIdle; exports.querySelector = querySelector; exports.hideNode = hideNode; exports.screenshotNode = screenshotNode;
