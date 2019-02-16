"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// IMPORTS
// ================================================================================================
const core_1 = require("@nova/core");
// CLASS DEFINITION
// ================================================================================================
class CacheError extends core_1.Exception {
    constructor(cause, message) {
        super({ cause, message });
    }
}
exports.CacheError = CacheError;
//# sourceMappingURL=Error.js.map