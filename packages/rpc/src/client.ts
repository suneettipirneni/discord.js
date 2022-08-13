import { EventEmitter } from 'node:events';
import { setTimeout, clearTimeout } from 'timers';
import { OAuth2Scopes, Routes } from 'discord-api-types/v10';
import type { ClientApplication, User } from 'discord.js';
import { fetch } from 'undici';
import { transports } from './transports';
import {
	MappedRPCCommandsArguments,
	RESTPostOAuth2RPCClientCredentialsResult,
	RPCArguments,
	RPCCommand,
	RPCEvent,
} from './transports/types';
import { pid as getPid, uuid } from './util';

// TODO: lots of errors and (maybe) unneeded functions to take care of

// function subKey(event: string, args: any[]) {
// 	return `${event}${JSON.stringify(args)}`;
// }

type Class<T extends new (...args: any[]) => unknown> = T extends new (...args: any[]) => infer R ? R : never;

export interface RPCClientOptions {
	transport?: keyof typeof transports;
	origin?: string;
}

export interface RPCLoginOptions {
	clientId: string;
	clientSecret: string;
	accessToken: string;
	rpcToken: string;
	tokenEndpoint: string;
	scopes: OAuth2Scopes[];
	username: string;
}

/**
 * @typedef {RPCClientOptions}
 * @extends {ClientOptions}
 * @prop {string} transport RPC transport. one of `ipc` or `websocket`
 */

/**
 * The main hub for interacting with Discord RPC
 * @extends {BaseClient}
 */
export class RPCClient extends EventEmitter {
	public readonly options: RPCClientOptions;
	private accessToken: string | null;
	public clientId: string | null;
	public application: ClientApplication | null;
	public user: User | null;
	private readonly fetch: (
		method: string,
		path: string,
		options?: { data: URLSearchParams; query?: Record<string, string> },
	) => Promise<unknown>;

	private endpoint = 'https://discord.com/api';
	private readonly transport: Class<typeof transports[keyof typeof transports]>;
	private readonly _expecting: Map<string, { resolve: (value: unknown) => void; reject: (reason?: Error) => void }>;
	private _connectPromise: Promise<unknown> | undefined;
	private readonly _subscriptions: Map<string, ({ shortcut }: { shortcut: string }) => void>;

	/**
	 * @param {RPCClientOptions} [options] Options for the client.
	 * You must provide a transport
	 */
	public constructor(options: RPCClientOptions = {}) {
		super();

		this.options = options;

		this.accessToken = null;
		this.clientId = null;

		/**
		 * Application used in this client
		 * @type {?ClientApplication}
		 */
		this.application = null;

		/**
		 * User used in this application
		 * @type {?User}
		 */
		this.user = null;

		const Transport = options.transport ? transports[options.transport] : false;
		if (!Transport) {
			throw new TypeError('RPC_INVALID_TRANSPORT', options.transport as undefined);
		}

		this.fetch = (method, path, options) =>
			fetch(`${this.endpoint}${path}${options?.query ? new URLSearchParams(options.query).toString() : ''}`, {
				method,
				body: options?.data.toString() as string | null,
				headers: {
					Authorization: `Bearer ${this.accessToken!}`,
				},
			}).then(async (r) => {
				const body = await r.json();
				if (!r.ok) {
					const e = new Error(r.status.toString()) as Error & { body: unknown };
					e.body = body;
					throw e;
				}
				return body;
			});

		/**
		 * Raw transport userd
		 * @type {RPCTransport}
		 * @private
		 */
		this.transport = new Transport(this);
		this.transport.on('message', this._onRpcMessage.bind(this));

		/**
		 * Map of nonces being expected from the transport
		 * @type {Map}
		 * @private
		 */
		this._expecting = new Map();

		this._connectPromise = undefined;

		/**
		 * Map of subscriptions
		 * @type {Map}
		 * @private
		 */
		this._subscriptions = new Map();
	}

	/**
	 * Update endpoint
	 */
	public updateEndpoint(endpoint: string) {
		this.endpoint = endpoint;
	}

	/**
	 * Search and connect to RPC
	 */
	public connect(clientId: string) {
		if (this._connectPromise) {
			return this._connectPromise;
		}
		this._connectPromise = new Promise((resolve, reject) => {
			this.clientId = clientId;
			const timeout = setTimeout(() => reject(new Error('RPC_CONNECTION_TIMEOUT')), 10e3);
			timeout.unref();
			this.once('connected', () => {
				clearTimeout(timeout);
				resolve(this);
			});
			this.transport.once('close', () => {
				this._expecting.forEach((e) => {
					e.reject(new Error('connection closed'));
				});
				this.emit('disconnected');
				reject(new Error('connection closed'));
			});
			try {
				void this.transport.connect();
			} catch (e) {
				reject(e);
			}
		});
		return this._connectPromise;
	}

	/**
	 * @typedef {RPCLoginOptions}
	 * @param {string} clientId Client ID
	 * @param {string} [clientSecret] Client secret
	 * @param {string} [accessToken] Access token
	 * @param {string} [rpcToken] RPC token
	 * @param {string} [tokenEndpoint] Token endpoint
	 * @param {OAuth2Scopes[]} [scopes] Scopes to authorize with
	 */

	/**
	 * Performs authentication flow. Automatically calls Client#connect if needed.
	 * @param {RPCLoginOptions} options Options for authentication.
	 * At least one property must be provided to perform login.
	 * @example client.login({ clientId: '1234567', clientSecret: 'abcdef123' });
	 * @returns {Promise<RPCClient>}
	 */
	public async login(options?: RPCLoginOptions): Promise<RPCClient> {
		await this.connect(options?.clientId ?? '');
		if (!options?.scopes) {
			this.emit('ready');
			return this;
		}
		if (!options.accessToken) {
			options.accessToken = await this.authorize(options);
		}
		return this.authenticate(options.accessToken);
	}

	/**
	 * Request
	 * @param {string} cmd Command
	 * @param {Object} [args={}] Arguments
	 * @param {string} [evt] Event
	 * @returns {Promise}
	 * @private
	 */
	public request<T extends RPCCommand = RPCCommand>(
		cmd: T,
		args: MappedRPCCommandsArguments[T],
		event?: RPCEvent,
	): Promise<unknown> {
		return new Promise((resolve, reject) => {
			const nonce = uuid();
			const evt = event!;
			this.transport.send({ cmd, args, evt, nonce });
			this._expecting.set(nonce, { resolve, reject });
		});
	}

	/**
	 * Message handler
	 * @param {Object} message message
	 * @private
	 */
	private _onRpcMessage(message: { cmd: RPCCommand; evt: string; data: Record<string, unknown>; nonce: string }) {
		if (message.cmd === RPCCommand.Dispatch && message.evt === RPCEvent.Ready) {
			if (message.data.user) {
				this.user = message.data.user as User;
			}
			this.emit('connected');
		} else if (this._expecting.has(message.nonce)) {
			const { resolve, reject } = this._expecting.get(message.nonce)!;
			if (message.evt === 'ERROR') {
				const e = new Error(message.data.message as string) as Error & { code: string; data: Record<string, unknown> };
				e.code = message.data.code as string;
				e.data = message.data;
				reject(e);
			} else {
				resolve(message.data);
			}
			this._expecting.delete(message.nonce);
		} else {
			this.emit(message.evt, message.data);
		}
	}

	/**
	 * Authorize
	 * @param {Object} options options
	 * @returns {Promise}
	 * @private
	 */
	public async authorize({
		scopes,
		clientSecret,
		rpcToken,
		username,
		redirectUri,
	}: {
		scopes: OAuth2Scopes[];
		clientSecret: string;
		rpcToken: string | boolean;
		username: string;
		redirectUri?: string;
	}): Promise<string> {
		if (clientSecret && rpcToken === true) {
			const body = (await this.fetch('POST', `${Routes.oauth2TokenExchange()}/rpc`, {
				data: new URLSearchParams({
					client_id: this.clientId!,
					client_secret: clientSecret,
				}),
			})) as RESTPostOAuth2RPCClientCredentialsResult;
			rpcToken = body.rpc_token;
		}

		const { code } = await this.request(RPCCommand.Authorize, {
			scopes,
			client_id: this.clientId!,
			rpc_token: rpcToken as string,
			username,
		});

		const response = await this.fetch('POST', Routes.oauth2TokenExchange(), {
			data: new URLSearchParams({
				client_id: this.clientId!,
				client_secret: clientSecret,
				code,
				grant_type: 'authorization_code',
				redirect_uri: redirectUri!,
			}),
		});

		return response.access_token;
	}

	/**
	 * Authenticate
	 * @param {string} accessToken access token
	 * @returns {Promise}
	 * @private
	 */
	public authenticate(accessToken: string): Promise<RPCClient> {
		return this.request('AUTHENTICATE', { access_token: accessToken }).then(({ application, user }) => {
			this.accessToken = accessToken;
			this.application = application;
			this.user = user;
			this.emit('ready');
			return this;
		});
	}

	/**
	 * Fetch a guild
	 * @param {Snowflake} id Guild ID
	 * @param {number} [timeout] Timeout request
	 * @returns {Promise<Guild>}
	 */
	public getGuild(id, timeout) {
		return this.request(RPCCommand.GetGuild, { guild_id: id, timeout });
	}

	/**
	 * Fetch all guilds
	 * @param {number} [timeout] Timeout request
	 * @returns {Promise<Collection<Snowflake, Guild>>}
	 */
	public getGuilds(timeout) {
		return this.request(RPCCommand.GetGuilds, { timeout });
	}

	/**
	 * Get a channel
	 * @param {Snowflake} id Channel ID
	 * @param {number} [timeout] Timeout request
	 * @returns {Promise<Channel>}
	 */
	public getChannel(id, timeout) {
		return this.request(RPCCommand.GetChannel, { channel_id: id, timeout });
	}

	/**
	 * Get all channels
	 * @param {Snowflake} [id] Guild ID
	 * @param {number} [timeout] Timeout request
	 * @returns {Promise<Collection<Snowflake, Channel>>}
	 */
	public async getChannels(id, timeout) {
		const { channels } = await this.request(RPCCommand.GetChannels, {
			timeout,
			guild_id: id,
		});
		return channels;
	}

	/**
	 * @typedef {CertifiedDevice}
	 * @prop {string} type One of `AUDIO_INPUT`, `AUDIO_OUTPUT`, `VIDEO_INPUT`
	 * @prop {string} uuid This device's Windows UUID
	 * @prop {object} vendor Vendor information
	 * @prop {string} vendor.name Vendor's name
	 * @prop {string} vendor.url Vendor's url
	 * @prop {object} model Model information
	 * @prop {string} model.name Model's name
	 * @prop {string} model.url Model's url
	 * @prop {string[]} related Array of related product's Windows UUIDs
	 * @prop {boolean} echoCancellation If the device has echo cancellation
	 * @prop {boolean} noiseSuppression If the device has noise suppression
	 * @prop {boolean} automaticGainControl If the device has automatic gain control
	 * @prop {boolean} hardwareMute If the device has a hardware mute
	 */

	/**
	 * Tell discord which devices are certified
	 * @param {CertifiedDevice[]} devices Certified devices to send to discord
	 * @returns {Promise}
	 */
	public setCertifiedDevices(devices) {
		return this.request(RPCCommand.SetCertifiedDevices, {
			devices: devices.map((d) => ({
				type: d.type,
				id: d.uuid,
				vendor: d.vendor,
				model: d.model,
				related: d.related,
				echo_cancellation: d.echoCancellation,
				noise_suppression: d.noiseSuppression,
				automatic_gain_control: d.automaticGainControl,
				hardware_mute: d.hardwareMute,
			})),
		});
	}

	/**
	 * @typedef {UserVoiceSettings}
	 * @prop {Snowflake} id ID of the user these settings apply to
	 * @prop {?Object} [pan] Pan settings, an object with `left` and `right` set between
	 * 0.0 and 1.0, inclusive
	 * @prop {?number} [volume=100] The volume
	 * @prop {bool} [mute] If the user is muted
	 */

	/**
	 * Set the voice settings for a user, by id
	 * @param {Snowflake} id ID of the user to set
	 * @param {UserVoiceSettings} settings Settings
	 * @returns {Promise}
	 */
	public setUserVoiceSettings(id, settings) {
		return this.request(RPCCommand.SetUserVoiceSettings, {
			user_id: id,
			pan: settings.pan,
			mute: settings.mute,
			volume: settings.volume,
		});
	}

	/**
	 * Move the user to a voice channel
	 * @param {Snowflake} id ID of the voice channel
	 * @param {Object} [options] Options
	 * @param {number} [options.timeout] Timeout for the command
	 * @param {boolean} [options.force] Force this move. This should only be done if you
	 * have explicit permission from the user.
	 * @returns {Promise}
	 */
	public selectVoiceChannel(id, { timeout, force = false } = {}) {
		return this.request(RPCCommand.SelectVoiceChannel, { channel_id: id, timeout, force });
	}

	/**
	 * Move the user to a text channel
	 * @param {Snowflake} id ID of the voice channel
	 * @param {Object} [options] Options
	 * @param {number} [options.timeout] Timeout for the command
	 * have explicit permission from the user.
	 * @returns {Promise}
	 */
	public selectTextChannel(id, { timeout } = {}) {
		return this.request(RPCCommand.SelectTextChannel, { channel_id: id, timeout });
	}

	/**
	 * Get current voice settings
	 * @returns {Promise}
	 */
	public getVoiceSettings() {
		return this.request(RPCCommand.GetVoiceSettings).then((s) => ({
			automaticGainControl: s.automatic_gain_control,
			echoCancellation: s.echo_cancellation,
			noiseSuppression: s.noise_suppression,
			qos: s.qos,
			silenceWarning: s.silence_warning,
			deaf: s.deaf,
			mute: s.mute,
			input: {
				availableDevices: s.input.available_devices,
				device: s.input.device_id,
				volume: s.input.volume,
			},
			output: {
				availableDevices: s.output.available_devices,
				device: s.output.device_id,
				volume: s.output.volume,
			},
			mode: {
				type: s.mode.type,
				autoThreshold: s.mode.auto_threshold,
				threshold: s.mode.threshold,
				shortcut: s.mode.shortcut,
				delay: s.mode.delay,
			},
		}));
	}

	/**
	 * Set current voice settings, overriding the current settings until this session disconnects.
	 * This also locks the settings for any other rpc sessions which may be connected.
	 * @param {Object} args Settings
	 * @returns {Promise}
	 */
	public setVoiceSettings(args) {
		return this.request(RPCCommand.SetVoiceSettings, {
			automatic_gain_control: args.automaticGainControl,
			echo_cancellation: args.echoCancellation,
			noise_suppression: args.noiseSuppression,
			qos: args.qos,
			silence_warning: args.silenceWarning,
			deaf: args.deaf,
			mute: args.mute,
			input: args.input
				? {
						device_id: args.input.device,
						volume: args.input.volume,
				  }
				: undefined,
			output: args.output
				? {
						device_id: args.output.device,
						volume: args.output.volume,
				  }
				: undefined,
			mode: args.mode
				? {
						type: args.mode.type,
						auto_threshold: args.mode.autoThreshold,
						threshold: args.mode.threshold,
						shortcut: args.mode.shortcut,
						delay: args.mode.delay,
				  }
				: undefined,
		});
	}

	// NOTE: other things that we can worry about later
	// /**
	//  * Capture a shortcut using the client
	//  * The callback takes (key, stop) where `stop` is a function that will stop capturing.
	//  * This `stop` function must be called before disconnecting or else the user will have
	//  * to restart their client.
	//  * @param {Function} callback Callback handling keys
	//  * @returns {Promise<Function>}
	//  */
	// public captureShortcut(callback) {
	// 	const subid = subKey(RPCEvents.CAPTURE_SHORTCUT_CHANGE);
	// 	const stop = () => {
	// 		this._subscriptions.delete(subid);
	// 		return this.request(RPCCommand.CAPTURE_SHORTCUT, { action: 'STOP' });
	// 	};
	// 	this._subscriptions.set(subid, ({ shortcut }) => {
	// 		callback(shortcut, stop);
	// 	});
	// 	return this.request(RPCCommand.CAPTURE_SHORTCUT, { action: 'START' }).then(() => stop);
	// }

	/**
	 * Sets the presence for the logged in user.
	 * @param {RPCArguments} args The rich presence to pass.
	 * @param {number} [pid] The application's process ID. Defaults to the executing process' PID.
	 * @returns {Promise}
	 */
	public setActivity(args: RPCArguments, pid = getPid()): Promise<unknown> {
		let timestamps;
		let assets;
		let party;
		let secrets;
		if (args.startTimestamp || args.endTimestamp) {
			timestamps = {
				start: args.startTimestamp,
				end: args.endTimestamp,
			};
			if (timestamps.start instanceof Date) {
				timestamps.start = Math.round(timestamps.start.getTime());
			}
			if (timestamps.end instanceof Date) {
				timestamps.end = Math.round(timestamps.end.getTime());
			}
			if (timestamps.start > 2147483647000) {
				throw new RangeError('timestamps.start must fit into a unix timestamp');
			}
			if (timestamps.end > 2147483647000) {
				throw new RangeError('timestamps.end must fit into a unix timestamp');
			}
		}
		if (args.largeImageKey || args.largeImageText || args.smallImageKey || args.smallImageText) {
			assets = {
				large_image: args.largeImageKey,
				large_text: args.largeImageText,
				small_image: args.smallImageKey,
				small_text: args.smallImageText,
			};
		}
		if (args.partySize || args.partyId || args.partyMax) {
			party = { id: args.partyId };
			if (args.partySize || args.partyMax) {
				party.size = [args.partySize, args.partyMax];
			}
		}
		if (args.matchSecret || args.joinSecret || args.spectateSecret) {
			secrets = {
				match: args.matchSecret,
				join: args.joinSecret,
				spectate: args.spectateSecret,
			};
		}

		return this.request(RPCCommand.SetActivity, {
			pid,
			activity: {
				state: args.state,
				details: args.details,
				timestamps,
				assets,
				party,
				secrets,
				buttons: args.buttons,
				instance: Boolean(args.instance),
			},
		});
	}

	/**
	 * Clears the currently set presence, if any. This will hide the "Playing X" message
	 * displayed below the user's name.
	 * @param {number} [pid] The application's process ID. Defaults to the executing process' PID.
	 * @returns {Promise}
	 */
	public clearActivity(pid: number = getPid()!): Promise<unknown> {
		return this.request(RPCCommand.SetActivity, {
			pid,
		});
	}

	/**
	 * Invite a user to join the game the RPC user is currently playing
	 * @param {string} user_id The user to invite
	 * @returns {Promise}
	 */
	public sendJoinInvite(user_id: string): Promise<unknown> {
		return this.request(RPCCommand.SendActivityJoinInvite, {
			user_id,
		});
	}

	// NOTE: so there's an event for ACTIVITY_JOIN_REQUEST but no SEND_ACTIVITY_JOIN_REQUEST for the RPC Commands in documentation? Part of game-related RPCs I presume?
	// /**
	//  * Request to join the game the user is playing
	//  * @param {User} user The user whose game you want to request to join
	//  * @returns {Promise}
	//  */
	// public sendJoinRequest(user) {
	// 	return this.request(RPCCommand.SEND_ACTIVITY_JOIN_REQUEST, {
	// 		user_id: user.id || user,
	// 	});
	// }

	/**
	 * Reject a join request from a user
	 * @param {string} user_id The user whose request you wish to reject
	 * @returns {Promise}
	 */
	public closeJoinRequest(user_id: string): Promise<unknown> {
		return this.request(RPCCommand.CloseActivityRequest, {
			user_id,
		});
	}

	// NOTE: aren't all of these RPC Commands undocumented pieces that are meant for a game?
	// public createLobby(type, capacity, metadata) {
	// 	return this.request(RPCCommand.CREATE_LOBBY, {
	// 		type,
	// 		capacity,
	// 		metadata,
	// 	});
	// }

	// public updateLobby(lobby, { type, owner, capacity, metadata } = {}) {
	// 	return this.request(RPCCommand.UPDATE_LOBBY, {
	// 		id: lobby.id || lobby,
	// 		type,
	// 		owner_id: (owner && owner.id) || owner,
	// 		capacity,
	// 		metadata,
	// 	});
	// }

	// public deleteLobby(lobby) {
	// 	return this.request(RPCCommand.DELETE_LOBBY, {
	// 		id: lobby.id || lobby,
	// 	});
	// }

	// public connectToLobby(id, secret) {
	// 	return this.request(RPCCommand.CONNECT_TO_LOBBY, {
	// 		id,
	// 		secret,
	// 	});
	// }

	// public sendToLobby(lobby, data) {
	// 	return this.request(RPCCommand.SEND_TO_LOBBY, {
	// 		id: lobby.id || lobby,
	// 		data,
	// 	});
	// }

	// public disconnectFromLobby(lobby) {
	// 	return this.request(RPCCommand.DISCONNECT_FROM_LOBBY, {
	// 		id: lobby.id || lobby,
	// 	});
	// }

	// public updateLobbyMember(lobby, user, metadata) {
	// 	return this.request(RPCCommand.UPDATE_LOBBY_MEMBER, {
	// 		lobby_id: lobby.id || lobby,
	// 		user_id: user.id || user,
	// 		metadata,
	// 	});
	// }

	// public getRelationships() {
	// 	const types = Object.keys(RelationshipTypes);
	// 	return this.request(RPCCommand.GET_RELATIONSHIPS).then((o) =>
	// 		o.relationships.map((r) => ({
	// 			...r,
	// 			type: types[r.type],
	// 		})),
	// 	);
	// }

	/**
	 * Subscribe to an event
	 * @param {RPCEvent} event Name of event e.g. `MESSAGE_CREATE`
	 * @param {RPCArguments} [args] Args for event e.g. `{ channel_id: '1234' }`
	 * @returns {Promise<Object>}
	 */
	public async subscribe(event: RPCEvent, args: RPCArguments): Promise<object> {
		await this.request(RPCCommand.Subscribe, args, event);
		return {
			unsubscribe: () => this.request(RPCCommand.Unsubscribe, args, event),
		};
	}

	/**
	 * Destroy the client
	 */
	public async destroy() {
		await this.transport.close();
	}
}
