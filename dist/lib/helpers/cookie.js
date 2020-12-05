"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cookie = {
    read: function (name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return match ? decodeURIComponent(match[3]) : null;
    }
};
exports.default = cookie;
//# sourceMappingURL=cookie.js.map