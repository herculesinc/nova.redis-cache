// IMPORTS
// ================================================================================================
import { RedisClient } from 'redis';
import { Logger, TraceSource, CacheClient as ICacheClient } from '@nova/redis-cache';
import { CacheError } from './Error';

// CLASS DEFINITION
// ================================================================================================
export class CacheClient implements ICacheClient {

    private readonly client : RedisClient;
    private readonly logger : Logger;
    private readonly source : TraceSource;

    // CONSTRUCTOR
    // --------------------------------------------------------------------------------------------
    constructor(client: RedisClient, logger: Logger, source: TraceSource) {
        this.client = client;
        this.logger = logger;
        this.source = source;
    }

    // PUBLIC METHODS
    // --------------------------------------------------------------------------------------------
    async get(keyOrKeys: string | string[]): Promise<any> {
        if (!keyOrKeys) throw new TypeError('Cannot get values from cache: keys are undefined');
        if (Array.isArray(keyOrKeys)) {
            return this.getAll(keyOrKeys);
        }
        else {
            return this.getOne(keyOrKeys);
        }
    }

    async set(key: string, value: any, expires?: number): Promise<void> {
        if (!key) throw new TypeError('Cannot set cache key: key is undefined');
        const start = Date.now();
        this.logger.debug(`Setting value for key (${key}) in the cache`);

        // convert value to string representation
        const stringValue = JSON.stringify(value);

        // execute redis set (or setex) command
        if (expires) {
            return new Promise((resolve, reject)=> {
                this.client.setex(key, expires, stringValue, (error) => {
                    this.logger.trace(this.source, 'set', Date.now() - start, !error);
                    if (error) {
                        return reject(new CacheError(error, 'Failed to set a cache item'));
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
                        return reject(new CacheError(error, 'Failed to set a cache item'));
                    }
                    resolve();
                });
            });
        }
    }

    async execute(script: string, keys: string[] = [], parameters: string[] = []): Promise<any> {
        if (!script) throw new TypeError('Cannot execute cache script: script is undefined');
        const start = Date.now();
        this.logger.debug(`Executing cache script`);

        return new Promise((resolve, reject) => {
            // execute the script
            this.client.eval(script, keys.length, ...keys, ...parameters, (error, result) => {
                this.logger.trace(this.source, 'execute', Date.now() - start, !error);
                if (error) {
                    return reject(new CacheError(error, 'Failed to execute cache script'));
                }
                
                let value: any;
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

    async clear(keyOrKeys: string | string[]): Promise<void> {
        if (!keyOrKeys) throw new TypeError('Cannot clear cache keys: keys are undefined');
        const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
        const start = Date.now();
        this.logger.debug(`Clearing values for ${keys.length} keys from cache`);

        // execute redis del command
        return new Promise((resolve, reject) => {
            this.client.del(keys, (error) => {
                this.logger.trace(this.source, 'clear', Date.now() - start, !error);
                if (error) {
                    return reject(new CacheError(error, 'Failed to clear cache items'));
                }
                resolve();
            });
        });
    }

    // PRIVATE METHODS
    // --------------------------------------------------------------------------------------------
    private getOne(key: string): Promise<any> {
        const start = Date.now();
        this.logger.debug(`Retrieving value for key (${key}) from the cache`);

        return new Promise((resolve, reject) => {
            // run the get command and return the result
            this.client.get(key, (error, result) => {
                this.logger.trace(this.source, 'get', Date.now() - start, !error);
                if (error) {
                    return reject(new CacheError(error, 'Failed to retrieve a value from cache'));
                }
                
                let value: any;
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

    private getAll(keys: string[]): Promise<any[]> {
        const start = Date.now();
        this.logger.debug(`Retrieving values for (${keys.length}) keys from the cache`);

        return new Promise((resolve, reject) => {
            // run the get command and return the result
            this.client.mget(keys, (error, results) => {
                this.logger.trace(this.source, 'get', Date.now() - start, !error);
                if (error) {
                    return reject(new CacheError(error, 'Failed to retrieve values from cache'));
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