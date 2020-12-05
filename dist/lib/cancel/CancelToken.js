"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Cancel_1 = require("./Cancel");
var CancelToken = /** @class */ (function () {
    function CancelToken(executor) {
        var _this = this;
        var resolvePromise;
        this.promise = new Promise(function (resolve) {
            resolvePromise = resolve;
        });
        executor(function (message) {
            if (_this.reason) {
                return;
            }
            _this.reason = new Cancel_1.default(message);
            resolvePromise(_this.reason);
        });
    }
    CancelToken.source = function () {
        var cancel;
        var token = new CancelToken(function (c) {
            cancel = c;
        });
        return {
            cancel: cancel,
            token: token
        };
    };
    // 判断是否使用过 使用过抛出异常
    CancelToken.prototype.throwIfRequested = function () {
        if (this.reason) {
            throw this.reason;
        }
    };
    return CancelToken;
}());
exports.default = CancelToken;
//# sourceMappingURL=CancelToken.js.map