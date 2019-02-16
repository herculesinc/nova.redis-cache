// IMPORTS
// ================================================================================================
import { Exception } from '@nova/core';

// CLASS DEFINITION
// ================================================================================================
export class CacheError extends Exception {
    constructor(cause: Error, message: string) {
        super({ cause, message });
    }
}