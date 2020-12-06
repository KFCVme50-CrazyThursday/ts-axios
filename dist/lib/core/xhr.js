"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var headers_1 = require("../helpers/headers");
// import { resolve } from 'url'
var error_1 = require("../helpers/error");
var url_1 = require("../helpers/url");
var cookie_1 = require("../helpers/cookie");
var util_1 = require("../helpers/util");
function xhr(config) {
    return new Promise(function (resolve, reject) {
        var _a = config.data, data = _a === void 0 ? null : _a, url = config.url, _b = config.method, method = _b === void 0 ? 'get' : _b, _c = config.headers, headers = _c === void 0 ? {} : _c, responseType = config.responseType, timeout = config.timeout, cancelToken = config.cancelToken, withCredentials = config.withCredentials, xsrfCookieName = config.xsrfCookieName, xsrfHeaderName = config.xsrfHeaderName, onDownloadProgress = config.onDownloadProgress, onUploadProgress = config.onUploadProgress, auth = config.auth, validateStatus = config.validateStatus;
        // 创建 xhr 实例
        var request = new XMLHttpRequest();
        // 初始化
        request.open(method.toUpperCase(), url, true);
        // 配置对象
        configureRequest();
        // 添加事件与处理函数
        addEvents();
        // 处理请求头
        processHeaders();
        // 处理请求取消逻辑
        processCancel();
        // 发送请求
        request.send(data);
        function configureRequest() {
            if (responseType) {
                request.responseType = responseType;
            }
            if (timeout) {
                request.timeout = timeout;
            }
            if (withCredentials) {
                request.withCredentials = true;
            }
        }
        function addEvents() {
            request.onreadystatechange = function handleLoad() {
                if (request.readyState !== 4) {
                    return;
                }
                if (request.status === 0) {
                    return;
                }
                // const responseHeaders = request.getAllResponseHeaders()
                var responseHeaders = headers_1.parseHeaders(request.getAllResponseHeaders());
                var responseData = responseType && responseType !== 'text' ? request.response : request.responseText;
                var response = {
                    data: responseData,
                    status: request.status,
                    statusText: request.statusText,
                    headers: responseHeaders,
                    config: config,
                    request: request
                };
                handleResponse(response);
            };
            request.onerror = function handleError() {
                reject(error_1.createError('Network Error', config, null, request));
            };
            request.ontimeout = function handleTimeout() {
                reject(error_1.createError("Timeout of " + config.timeout + " ms exceeded", config, 'ECONNABORTED', request));
            };
            if (onDownloadProgress) {
                request.onprogress = onDownloadProgress;
            }
            if (onUploadProgress) {
                request.upload.onprogress = onUploadProgress;
            }
        }
        function processHeaders() {
            // 当请求的数据是 formdata 类型时候，主动删除 headers 中的 Content-Type 字段
            // 浏览器会自动设置，通过 formData 上传时，浏览器会自动把 content-type 设置为 multipart/form-data
            if (util_1.isFormData(data)) {
                delete headers['Content-Type'];
            }
            if ((withCredentials || url_1.isURLSameOrigin(url)) && xsrfCookieName) {
                var xsrfValue = cookie_1.default.read(xsrfCookieName);
                if (xsrfValue) {
                    headers[xsrfHeaderName] = xsrfValue;
                }
            }
            if (auth) {
                // btoa 创建一个 base-64 编码的字符串
                headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password);
            }
            Object.keys(headers).forEach(function (name) {
                if (data === null && name.toLowerCase() === 'content-type') {
                    delete headers[name]; // 传入的 data 为空的时候，请求 header 配置 Content-Type 是没有意义的
                }
                else {
                    request.setRequestHeader(name, headers[name]);
                }
            });
        }
        function processCancel() {
            // CancelToken存在取消请求
            if (cancelToken) {
                cancelToken.promise
                    .then(function (reason) {
                    request.abort();
                    reject(reason);
                })
                    .catch(
                /* istanbul ignore next */
                function () {
                    // do nothing
                });
            }
        }
        function handleResponse(response) {
            if (!validateStatus || validateStatus(response.status)) {
                resolve(response);
            }
            else {
                reject(error_1.createError("Request failed with status code " + response.status, config, null, request, response));
            }
        }
    });
}
exports.default = xhr;
//# sourceMappingURL=xhr.js.map