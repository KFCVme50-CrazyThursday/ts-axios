export declare function buildURL(url: string, params?: any, paramsSerializer?: (params: any) => string): string;
export declare function isURLSameOrigin(requestURL: string): boolean;
export declare function isURLSearchParams(val: any): val is URLSearchParams;
export declare function isAbsoluteURL(url: string): boolean;
export declare function combineURL(baseURL: string, relativeURL?: string): string;
