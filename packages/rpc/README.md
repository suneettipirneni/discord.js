<div align="center">
	<br />
	<p>
		<a href="https://discord.js.org"><img src="https://discord.js.org/static/logo.svg" width="546" alt="discord.js" /></a>
	</p>
	<br />
	<p>
		<a href="https://discord.gg/djs"><img src="https://img.shields.io/discord/222078108977594368?color=5865F2&logo=discord&logoColor=white" alt="Discord server" /></a>
		<a href="https://www.npmjs.com/package/@discordjs/rpc"><img src="https://img.shields.io/npm/v/@discordjs/rpc.svg?maxAge=3600" alt="npm version" /></a>
		<a href="https://www.npmjs.com/package/@discordjs/rpc"><img src="https://img.shields.io/npm/dt/@discordjs/rpc.svg?maxAge=3600" alt="npm downloads" /></a>
		<a href="https://github.com/discordjs/discord.js/actions"><img src="https://github.com/discordjs/discord.js/actions/workflows/test.yml/badge.svg" alt="Tests status" /></a>
		<a href="https://codecov.io/gh/discordjs/discord.js" ><img src="https://codecov.io/gh/discordjs/discord.js/branch/main/graph/badge.svg?precision=2&flag=rest" alt="Code coverage" /></a>
	</p>
	<p>
		<a href="https://vercel.com/?utm_source=discordjs&utm_campaign=oss"><img src="https://raw.githubusercontent.com/discordjs/discord.js/main/.github/powered-by-vercel.svg" alt="Vercel" /></a>
	</p>
</div>

## Installation

**Node.js 16.9.0 or newer is required.**

```sh-session
npm install @discordjs/rpc
yarn add @discordjs/rpc
pnpm add @discordjs/rpc
```

## Examples

Rich presence example

```js
import { Client } from '@discordjs/rpc';

const clientId = '287406016902594560';

const client = new Client({ transport: 'ipc' });

client.on('ready', () => {
	client.setActivity({
		details: 'i am snek',
		state: 'in slither party',
		largeImageKey: 'snek_large',
		largeImageText: 'tea is delicious',
		smallImageKey: 'snek_small',
		smallImageText: 'i am my own pillows',
		instance: false,
	});
});

client.login({ clientId });
```

## Links

- [Website](https://discord.js.org/) ([source](https://github.com/discordjs/discord.js/tree/main/packages/website))
- [Documentation](https://discord.js.org/#/docs/rpc)
- [Guide](https://discordjs.guide/) ([source](https://github.com/discordjs/guide))
  See also the [Update Guide](https://discordjs.guide/additional-info/changes-in-v14.html), including updated and removed items in the library.
- [discord.js Discord server](https://discord.gg/djs)
- [Discord API Discord server](https://discord.gg/discord-api)
- [GitHub](https://github.com/discordjs/discord.js/tree/main/packages/rpc)
- [npm](https://www.npmjs.com/package/@discordjs/rpc)
- [Related libraries](https://discord.com/developers/docs/topics/community-resources#libraries)

## Contributing

Before creating an issue, please ensure that it hasn't already been reported/suggested, and double-check the
[documentation](https://discord.js.org/#/docs/rpc).  
See [the contribution guide](https://github.com/discordjs/discord.js/blob/main/.github/CONTRIBUTING.md) if you'd like to submit a PR.

## Help

If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle nudge in the right direction, please don't hesitate to join our official [discord.js Server](https://discord.gg/djs).
