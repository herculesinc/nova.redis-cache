// IMPORTS
// ================================================================================================
import { Exception, TraceCommand } from '@nova/core';

// MODULE VARIABLES
// ================================================================================================
const COMMAND_ERRORS: { [command: string]: string; } = {
    get     : 'Failed to retrieve a value from cache',
    set     : 'Failed to set a cache item',
    clear   : 'Failed to clear cache items',
    execute : 'Failed to execute cache script'
};

// CLASS DEFINITION
// ================================================================================================
export class CacheError extends Exception {
    constructor(cause: Error, messageOrCommand: string | TraceCommand) {
        if (typeof messageOrCommand === 'string') {
            super({ cause, message: messageOrCommand });
        }
        else {
            const message = COMMAND_ERRORS[messageOrCommand.name];
            super({ cause, message });
            this.details = {
                command : messageOrCommand.text
            };
        }
    }
}