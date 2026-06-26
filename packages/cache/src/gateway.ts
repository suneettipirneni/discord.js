import type { AsyncCache, Cache, CacheTypeOverrides, GatewayDispatchSource } from './types.js';

export const GatewayDispatchEvent = 'dispatch';

/**
 * Attaches a cache to a gateway-like dispatch source.
 *
 * This accepts the structural shape exposed by `@discordjs/ws` and the gateway abstraction used by `@discordjs/core`.
 */
export function attachCacheToGateway<TTypes extends CacheTypeOverrides>(
	gateway: GatewayDispatchSource,
	cache: AsyncCache<TTypes> | Cache<TTypes>,
): void {
	gateway.on(GatewayDispatchEvent, (payload, shardId) => {
		void cache.handleGatewayDispatch(payload, shardId);
	});
}
