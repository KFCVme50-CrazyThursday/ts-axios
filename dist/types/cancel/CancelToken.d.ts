import { CancelExecutor, CancelTokenSource } from '../types';
import Cancel from './Cancel';
export default class CancelToken {
    promise: Promise<Cancel>;
    reason?: Cancel;
    constructor(executor: CancelExecutor);
    static source(): CancelTokenSource;
    throwIfRequested(): void;
}
