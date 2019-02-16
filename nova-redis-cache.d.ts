declare module "@nova/redis-cache" {
    
    // IMPORTS AND RE-EXPORTS
    // --------------------------------------------------------------------------------------------
    import * as events from 'events';
    import * as tls from 'tls';

    import { Logger, Exception } from '@nova/core';
    export { Logger, TraceSource, TraceCommand } from '@nova/core';

    // REDIS CONNECTION
    // --------------------------------------------------------------------------------------------
    export interface RedisConnectionConfig {
        host            : string;
        port            : number;
        password        : string;
        prefix?         : string;
        tls?            : tls.ConnectionOptions;
        retry_strategy? : (options: ConnectionRetryOptions) => number | Error;
    }

    export interface ConnectionRetryOptions {
        error           : any;
        attempt         : number;
        total_retry_time: number;
        times_connected : number;
    }

    // CACHE
    // --------------------------------------------------------------------------------------------
    export interface CacheConfig {
		name?       : string;
        redis       : RedisConnectionConfig;
    }
    
    export class Cache extends events.EventEmitter {

        constructor(config: CacheConfig);

        getClient(logger?: Logger): CacheClient;

        on(event: 'error', callback: (error: CacheError) => void): this;
    }

    export interface CacheClient {
        get(key: string)    : Promise<any>;
        get(keys: string[]) : Promise<any[]>;

        set(key: string, value: any, expires?: number): Promise<void>;
        execute(script: string, keys: string[], parameters: any[]): Promise<any>;

        clear(key: string)      : Promise<void>;
        clear(keys: string[])   : Promise<void>;
    }

    export class CacheError extends Exception {
        constructor(cause: Error, message: string);
    }
}