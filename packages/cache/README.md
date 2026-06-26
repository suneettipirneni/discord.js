<div align="center">
	<br />
	<p>
		<a href="https://discord.js.org"><img src="https://discord.js.org/static/logo.svg" width="546" alt="discord.js" /></a>
	</p>
	<br />
	<p>
		<a href="https://discord.gg/djs"><img src="https://img.shields.io/badge/join_us-on_discord-5865F2?logo=discord&logoColor=white" alt="Discord server" /></a>
		<a href="https://www.npmjs.com/package/@discordjs/cache"><img src="https://img.shields.io/npm/v/@discordjs/cache.svg?maxAge=3600" alt="npm version" /></a>
		<a href="https://www.npmjs.com/package/@discordjs/cache"><img src="https://img.shields.io/npm/dt/@discordjs/cache.svg?maxAge=3600" alt="npm downloads" /></a>
		<a href="https://github.com/discordjs/discord.js/actions"><img src="https://github.com/discordjs/discord.js/actions/workflows/tests.yml/badge.svg" alt="Build status" /></a>
		<a href="https://github.com/discordjs/discord.js/commits/main/packages/cache"><img alt="Last commit." src="https://img.shields.io/github/last-commit/discordjs/discord.js?logo=github&logoColor=ffffff&path=packages%2Fcache" /></a>
		<a href="https://opencollective.com/discordjs"><img src="https://img.shields.io/opencollective/backers/discordjs?maxAge=3600&logo=opencollective" alt="backers" /></a>
		<a href="https://codecov.io/gh/discordjs/discord.js"><img src="https://codecov.io/gh/discordjs/discord.js/branch/main/graph/badge.svg?precision=2&flag=cache" alt="Code coverage" /></a>
	</p>
</div>

## About

`@discordjs/cache` is a decoupled cache package for applications built on gateway dispatch payloads, including
applications using `@discordjs/core`.

## Installation

**Node.js 22.12.0 or newer is required.**

```sh
npm install @discordjs/cache
yarn add @discordjs/cache
pnpm add @discordjs/cache
```

## Example usage

These examples use [ES modules](https://nodejs.org/api/esm.html#enabling).

### In-memory cache

```ts
import { GatewayDispatchEvents } from 'discord-api-types/v10';
import { Client } from '@discordjs/core';
import { WebSocketShardEvents } from '@discordjs/ws';
import { createInMemoryCache } from '@discordjs/cache/inmemory';
import { memberKey } from '@discordjs/cache';

const client = new Client({ rest, gateway });
const cache = createInMemoryCache();

gateway.on(WebSocketShardEvents.Dispatch, (payload, shardId) => {
	cache.handleGatewayDispatch(payload, shardId);
});

client.on(GatewayDispatchEvents.InteractionCreate, async ({ api, data }) => {
	const member =
		data.guild_id && 'member' in data && data.member?.user
			? cache.members.get(memberKey(data.guild_id, data.member.user.id))
			: undefined;

	const cachedGuildName = data.guild_id ? cache.guilds.get(data.guild_id)?.name : undefined;
	const cachedChannelName = data.channel_id ? cache.channels.get(data.channel_id)?.name : undefined;
	const guildName = cachedGuildName ?? 'this server';
	const channelName = cachedChannelName ? `#${cachedChannelName}` : 'this channel';
	const displayName = member?.nick ?? data.user?.username ?? 'there';

	await api.interactions.reply(data.id, data.token, {
		content: `Hi ${displayName}, this interaction came from ${channelName} in ${guildName}.`,
	});
});
```

### Custom cache types

```ts
import { GatewayDispatchEvents } from 'discord-api-types/v10';
import { Client } from '@discordjs/core';
import { WebSocketShardEvents } from '@discordjs/ws';
import { createInMemoryCache } from '@discordjs/cache/inmemory';

const client = new Client({ rest, gateway });
const cache = createInMemoryCache({
	mappers: {
		// Only store a subset of fields we care about. Omit to store full API object.
		guild: ({ raw }) => ({ id: raw.id, name: 'name' in raw ? raw.name : raw.id }),
	},
});

gateway.on(WebSocketShardEvents.Dispatch, (payload, shardId) => {
	cache.handleGatewayDispatch(payload, shardId);
});

client.on(GatewayDispatchEvents.InteractionCreate, async ({ api, data }) => {
	if (!data.guild_id) return;

	// Type auto-inferred to `{ id: string, name: string }`
	const guild = cache.guilds.get(data.guild_id);

	await api.interactions.reply(data.id, data.token, {
		content: `Cached guild name: ${guild?.name ?? 'unknown'}`,
	});
});
```

You can also pass an explicit entity map to `createInMemoryCache<MyCacheTypes>()` or `createRedisCache<MyCacheTypes>()`
when you want to share a named cache type across modules.

### Redis cache

```ts
import { GatewayDispatchEvents } from 'discord-api-types/v10';
import { Client } from '@discordjs/core';
import { WebSocketShardEvents } from '@discordjs/ws';
import { createRedisCache } from '@discordjs/cache/redis';
import Redis from 'ioredis';

const client = new Client({ rest, gateway });
const cache = createRedisCache(new Redis());

gateway.on(WebSocketShardEvents.Dispatch, async (payload, shardId) => {
	await cache.handleGatewayDispatch(payload, shardId);
});

client.on(GatewayDispatchEvents.InteractionCreate, async ({ api, data }) => {
	const cachedGuildName = data.guild_id ? (await cache.guilds.get(data.guild_id))?.name : undefined;
	const cachedChannelName = data.channel_id ? (await cache.channels.get(data.channel_id))?.name : undefined;
	const guildName = cachedGuildName ?? 'this server';
	const channelName = cachedChannelName ? `#${cachedChannelName}` : 'this channel';

	await api.interactions.reply(data.id, data.token, {
		content: `I used the Redis cache to resolve ${channelName} in ${guildName}.`,
	});
});
```

## Links

- [Website][website] ([source][website-source])
- [Documentation][documentation]
- [Guide][guide] ([source][guide-source])
- [discord.js Discord server][discord]
- [Discord Developers Discord server][discord-developers]
- [GitHub][source]
- [npm][npm]
- [Related libraries][related-libs]

## Contributing

Before creating an issue, please ensure that it hasn't already been reported/suggested, and double-check the
[documentation][documentation].  
See [the contribution guide][contributing] if you'd like to submit a PR.

## Help

If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle nudge in the right direction, please don't hesitate to join our official [discord.js Server][discord].

[website]: https://discord.js.org
[website-source]: https://github.com/discordjs/discord.js/tree/main/apps/website
[documentation]: https://discord.js.org/docs/packages/cache/stable
[guide]: https://discordjs.guide
[guide-source]: https://github.com/discordjs/discord.js/tree/main/apps/guide
[discord]: https://discord.gg/djs
[discord-developers]: https://discord.gg/discord-developers
[source]: https://github.com/discordjs/discord.js/tree/main/packages/cache
[npm]: https://www.npmjs.com/package/@discordjs/cache
[related-libs]: https://docs.discord.com/developers/developer-tools/community-resources#libraries
[contributing]: https://github.com/discordjs/discord.js/blob/main/.github/CONTRIBUTING.md
