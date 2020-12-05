"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../helpers/util");
var strats = Object.create(null);
// 如果自定义配置中定义了某个属性，就采用自定义的，否则就用默认配置。
function defaultStrate(val1, val2) {
    return typeof val2 !== 'undefined' ? val2 : val1;
}
// 针对 'url', 'params', 'data' 直接取传入的
function fromVal2Strate(val1, val2) {
    if (typeof val2 !== 'undefined') {
        return val2;
    }
}
var strateKeysFromVal2 = ['url', 'params', 'data'];
strateKeysFromVal2.forEach(function (key) {
    strats[key] = fromVal2Strate;
});
function deepMergeStrate(val1, val2) {
    if (util_1.isPlainObject(val2)) {
        return util_1.deepMerge(val1, val2);
    }
    else if (typeof val2 !== 'undefined') {
        return val2;
    }
    else if (util_1.isPlainObject(val1)) {
        return util_1.deepMerge(val1);
    }
    else {
        return val1;
    }
}
var strateKeysDeepMerge = ['headers', 'auth'];
// const strateKeysDeepMerge = ['headers']
strateKeysDeepMerge.forEach(function (key) {
    strats[key] = deepMergeStrate;
});
// config1 为默认的 config ，2 为传入的
function mergeConfig(config1, config2) {
    if (!config2) {
        config2 = {};
    }
    var config = Object.create(null); // 承接合并的结果
    for (var key in config2) {
        mergeField(key);
    }
    for (var key in config1) {
        if (!config2[key]) {
            mergeField(key);
        }
    }
    function mergeField(key) {
        var strat = strats[key] || defaultStrate;
        config[key] = strat(config1[key], config2[key]);
    }
    return config;
}
exports.default = mergeConfig;
//# sourceMappingURL=mergeConfig.js.map