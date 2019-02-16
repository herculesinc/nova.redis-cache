"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Error_1 = require("./Error");
// CLASS DEFINITION
// ================================================================================================
class CacheClient {
    // CONSTRUCTOR
    // --------------------------------------------------------------------------------------------
    constructor(client, logger, source) {
        this.client = client;
        this.logger = logger;
        this.source = source;
    }
    // PUBLIC METHODS
    // --------------------------------------------------------------------------------------------
    async get(keyOrKeys) {
        if (!keyOrKeys)
            throw new TypeError('Cannot get values from cache: keys are undefined');
        if (Array.isArray(keyOrKeys)) {
            return this.getAll(keyOrKeys);
        }
        else {
            return this.getOne(keyOrKeys);
        }
    }
    async set(key, value, expires) {
        if (!key)
            throw new TypeError('Cannot set cache key: key is undefined');
        const start = Date.now();
        this.logger.debug(`Setting value for key (${key}) in the cache`);
        // convert value to string representation
        const stringValue = JSON.stringify(value);
        // execute redis set (or setex) command
        if (expires) {
            return new Promise((resolve, reject) => {
                this.client.setex(key, expires, stringValue, (error) => {
                    this.logger.trace(this.source, 'set', Date.now() - start, !error);
                    if (error) {
                        return reject(new Error_1.CacheError(error, 'Failed to set a cache item'));
                    }
                    resolve();
                });
            });
        }
        else {
            return new Promise((resolve, reject) => {
                this.client.set(key, stringValue, (error) => {
                    this.logger.trace(this.source, 'set', Date.now() - start, !error);
                    if (error) {
                        return reject(new Error_1.CacheError(error, 'Failed to set a cache item'));
                    }
                    resolve();
                });
            });
        }
    }
    async execute(script, keys = [], parameters = []) {
        if (!script)
            throw new TypeError('Cannot execute cache script: script is undefined');
        const start = Date.now();
        this.logger.debug(`Executing cache script`);
        return new Promise((resolve, reject) => {
            // execute the script
            this.client.eval(script, keys.length, ...keys, ...parameters, (error, result) => {
                this.logger.trace(this.source, 'execute', Date.now() - start, !error);
                if (error) {
                    return reject(new Error_1.CacheError(error, 'Failed to execute cache script'));
                }
                let value;
                try {
                    value = result ? JSON.parse(result) : undefined;
                }
                catch (err) {
                    this.logger.warn(`Failed to de-serialize cache value ${result}`);
                }
                // return the result
                resolve(value);
            });
        });
    }
    async clear(keyOrKeys) {
        if (!keyOrKeys)
            throw new TypeError('Cannot clear cache keys: keys are undefined');
        const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
        const start = Date.now();
        this.logger.debug(`Clearing values for ${keys.length} keys from cache`);
        // execute redis del command
        return new Promise((resolve, reject) => {
            this.client.del(keys, (error) => {
                this.logger.trace(this.source, 'clear', Date.now() - start, !error);
                if (error) {
                    return reject(new Error_1.CacheError(error, 'Failed to clear cache items'));
                }
                resolve();
            });
        });
    }
    // PRIVATE METHODS
    // --------------------------------------------------------------------------------------------
    getOne(key) {
        const start = Date.now();
        this.logger.debug(`Retrieving value for key (${key}) from the cache`);
        return new Promise((resolve, reject) => {
            // run the get command and return the result
            this.client.get(key, (error, result) => {
                this.logger.trace(this.source, 'get', Date.now() - start, !error);
                if (error) {
                    return reject(new Error_1.CacheError(error, 'Failed to retrieve a value from cache'));
                }
                let value;
                try {
                    value = result ? JSON.parse(result) : undefined;
                }
                catch (err) {
                    this.logger.warn(`Failed to de-serialize cache value ${result}`);
                }
                // return the value
                resolve(value);
            });
        });
    }
    getAll(keys) {
        const start = Date.now();
        this.logger.debug(`Retrieving values for (${keys.length}) keys from the cache`);
        return new Promise((resolve, reject) => {
            // run the get command and return the result
            this.client.mget(keys, (error, results) => {
                this.logger.trace(this.source, 'get', Date.now() - start, !error);
                if (error) {
                    return reject(new Error_1.CacheError(error, 'Failed to retrieve values from cache'));
                }
                // de-serialize values
                const values = [];
                for (let result of results) {
                    try {
                        values.push(result ? JSON.parse(result) : undefined);
                    }
                    catch (err) {
                        this.logger.warn(`Failed to de-serialize cache value ${result}`);
                    }
                }
                // return the results
                resolve(values);
            });
        });
    }
}
exports.CacheClient = CacheClient;
//# sourceMappingURL=Client.js.map