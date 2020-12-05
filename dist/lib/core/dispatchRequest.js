"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformUrl = void 0;
var xhr_1 = require("./xhr");
var url_1 = require("../helpers/url");
var data_1 = require("../helpers/data");
var headers_1 = require("../helpers/headers");
// import { transformResponse } from './helpers/data'
var transform_1 = require("./transform");
function dispatchRequest(config) {
    // 发送请求前检查 cancelToken 是否已经使用过了
    throwIfCancellationRequested(config);
    processConfig(config);
    return xhr_1.default(config).then(function (res) {
        return transformResponseData(res);
    }, function (e) {
        if (e && e.response) {
            e.response = transformResponseData(e.response);
        }
        return Promise.reject(e);
    });
}
exports.default = dispatchRequest;
function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
    }
}
// function axios(config: AxiosRequestConfig): AxiosPromise {
//   // TODO 处理参数
//   processConfig(config)
//   return xhr(config).then(res => {
//     return transformResponseData(res)
//   })
// }
function processConfig(config) {
    config.url = transformUrl(config);
    // config.headers = transformHeaders(config)
    // config.data = transformRequestData(config) // string 参数
    config.data = transform_1.default(config.data, config.headers, config.transformRequest);
    // flatten headers
    config.headers = headers_1.flattenHeaders(config.headers, config.method);
}
function transformUrl(config) {
    var url = config.url, params = config.params, paramsSerializer = config.paramsSerializer, baseURL = config.baseURL;
    if (baseURL && !url_1.isAbsoluteURL(url)) {
        url = url_1.combineURL(baseURL, url);
    }
    return url_1.buildURL(url, params, paramsSerializer);
}
exports.transformUrl = transformUrl;
function transformResponseData(res) {
    // res.data = transformResponse(res.data)
    res.data = transform_1.default(res.data, res.headers, res.config.transformResponse);
    return res;
}
function transformRequestData(config) {
    return data_1.transformRequest(config.data);
}
function transformHeaders(config) {
    var _a = config.headers, headers = _a === void 0 ? {} : _a, data = config.data;
    return headers_1.processHeaders(headers, data);
}
//# sourceMappingURL=dispatchRequest.js.map