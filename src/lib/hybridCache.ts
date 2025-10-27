import { LRUCache } from "lru-cache";
import { openDB, IDBPDatabase } from "idb";

interface CacheOptions<T = unknown> {
    name: string;
    max?: number;
    ttl?: number;
}

interface CacheRecord<T = unknown> {
    key: string;
    value: T;
    timestamp: number;
}

export class HybridCache<T = unknown> {
    private memoryCache: LRUCache<string, T & object>;
    private dbPromise: Promise<IDBPDatabase>;
    private ttl: number;
    private name: string;

    constructor({ name, max = 500, ttl = 1000 * 60 * 60 * 6 }: CacheOptions<T>) {
        this.name = name;
        this.ttl = ttl;
        this.memoryCache = new LRUCache<string, T & object>({
            max,
            ttl,
        });

        this.dbPromise = openDB(`${name}-cache`, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains("cache")) {
                    db.createObjectStore("cache", { keyPath: "key" });
                }
            },
        });
    }

    async get(key: string): Promise<T | undefined> {
        const inMem = this.memoryCache.get(key as string);
        if (inMem !== undefined) return inMem as T;

        const db = await this.dbPromise;
        const record = (await db.get("cache", key)) as CacheRecord<T> | undefined;
        if (!record) return undefined;

        const age = Date.now() - record.timestamp;
        if (age > this.ttl) {
            await db.delete("cache", key);
            return undefined;
        }
        this.memoryCache.set(key, record.value as T & object);
        return record.value;
    }

    async set(key: string, value: T): Promise<void> {
        this.memoryCache.set(key, value as T & object);
        const db = await this.dbPromise;
        const record: CacheRecord<T> = { key, value, timestamp: Date.now() };
        await db.put("cache", record);
    }

    async delete(key: string) {
        this.memoryCache.delete(key);
        const db = await this.dbPromise;
        await db.delete("cache", key);
    }

    async clear() {
        this.memoryCache.clear();
        const db = await this.dbPromise;
        await db.clear("cache");
    }

    async warmup(keys: string[]) {
        const db = await this.dbPromise;
        const tx = db.transaction("cache", "readonly");
        const store = tx.objectStore("cache");
        for (const key of keys) {
            const record = (await store.get(key)) as CacheRecord<T> | undefined;
            if (record && Date.now() - record.timestamp < this.ttl) {
                this.memoryCache.set(key, record.value as T & object);
            }
        }
    }
}
