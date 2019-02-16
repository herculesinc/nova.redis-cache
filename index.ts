// IMPORTS
// ================================================================================================
import * as events from 'events';
import * as redis from 'redis';
import * as nova from '@nova/core';
import { CacheConfig, Logger, TraceSource } from '@nova/redis-cache';
import { CacheClient } from './lib/Client';
import { CacheError } from './lib/Error';

// MODULE VARIABLES
// ================================================================================================
const ERROR_EVENT = 'error';

// CACHE CLASS
// ================================================================================================
export class Cache extends events.EventEmitter {

    private readonly source : TraceSource;
    private readonly client : redis.RedisClient;

    // CONSTRUCTOR
    // --------------------------------------------------------------------------------------------
    constructor(config: CacheConfig) {
        super();

        if (!config) throw TypeError('Cannot create Cache: config is undefined');
        if (!config.redis) throw TypeError('Cannot create Cache: redis settings are undefined');

        // initialize class variables
        this.source = { name: config.name || 'cache', type: 'redis' };
        this.client = redis.createClient(config.redis);

        // listen to error event
        this.client.on('error', (error) => {
            this.emit(ERROR_EVENT, new CacheError(error, 'Cache error'));
        });
    }

    getClient(logger: Logger) {
        return new CacheClient(this.client, logger || nova.logger, this.source);
    }
}