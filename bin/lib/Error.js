"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// IMPORTS
// ================================================================================================
const core_1 = require("@nova/core");
// MODULE VARIABLES
// ================================================================================================
const COMMAND_ERRORS = {
    get: 'Failed to retrieve a value from cache',
    set: 'Failed to set a cache item',
    clear: 'Failed to clear cache items',
    execute: 'Failed to execute cache script'
};
// CLASS DEFINITION
// ================================================================================================
class CacheError extends core_1.Exception {
    constructor(cause, messageOrCommand) {
        if (typeof messageOrCommand === 'string') {
            super({ cause, message: messageOrCommand });
        }
        else {
            const message = COMMAND_ERRORS[messageOrCommand.name];
            super({ cause, message });
            this.details = {
                command: messageOrCommand.text
            };
        }
    }
}
exports.CacheError = CacheError;
//# sourceMappingURL=Error.js.map