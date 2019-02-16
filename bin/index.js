"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// IMPORTS
// ================================================================================================
const events = require("events");
const redis = require("redis");
const nova = require("@nova/core");
const Client_1 = require("./lib/Client");
const Error_1 = require("./lib/Error");
// MODULE VARIABLES
// ================================================================================================
const ERROR_EVENT = 'error';
// CACHE CLASS
// ================================================================================================
class Cache extends events.EventEmitter {
    // CONSTRUCTOR
    // --------------------------------------------------------------------------------------------
    constructor(config) {
        super();
        if (!config)
            throw TypeError('Cannot create Cache: config is undefined');
        if (!config.redis)
            throw TypeError('Cannot create Cache: redis settings are undefined');
        // initialize class variables
        this.source = { name: config.name || 'cache', type: 'redis' };
        this.client = redis.createClient(config.redis);
        // listen to error event
        this.client.on('error', (error) => {
            this.emit(ERROR_EVENT, new Error_1.CacheError(error, 'Cache error'));
        });
    }
    getClient(logger) {
        return new Client_1.CacheClient(this.client, logger || nova.logger, this.source);
    }
}
exports.Cache = Cache;
//# sourceMappingURL=index.js.map