import { EventEmitter } from 'node:events';
import { setTimeout, clearTimeout } from 'timers';
import { APIUser, OAuth2Scopes, RESTPostOAuth2ClientCredentialsResult, Routes, Snowflake } from 'discord-api-types/v10';
import { fetch } from 'undici';
import { transports } from './transports';
import type {
	MappedRPCCommandsArguments,
	RPCArguments,
	SelectTextChannelArguments,
	SelectVoiceChannelArguments,
	SetActivityArguments,
	SetCertifiedDevicesArguments,
} from './typings/arguments';
import type { MappedRPCDispatchData } from './typings/dispatchdata';
import type {
	AuthorizePayloadData,
	GetChannelPayloadData,
	GetChannelsPayloadData,
	GetGuildPayloadData,
	GetGuildsPayloadData,
	GetVoiceSettingsPayloadData,
} from './typings/payloaddata';
import type { RPCAuthenticateResponsePayload, RPCClientEvents, RPCEventPayload } from './typings/payloads';
import type {
	RPCOAuthApplication,
	RESTPostOAuth2RPCClientCredentialsResult,
	SetUserVoiceSettingsData,
	RelationShip,
} from './typings/structs';
import { RPCCommands, RPCEvents, type LobbyType, RelationshipType } from './typings/types';
import { pid as getPid, uuid } from './util';

function subKey(event: string, args?: unknown[]) {
	return `${event}${JSON.stringify(args)}`;
}

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
 * @extends {EventEmitter}
 */
export class RPCClient extends EventEmitter {
	public readonly options: RPCClientOptions;
	private accessToken: string | null;
	public clientId: string | null;
	public application: RPCOAuthApplication | null;
	public user: Partial<APIUser> | null;
	private readonly fetch: (
		method: string,
		path: string,
		options?: { data: URLSearchParams; query?: Record<string, string> },
	) => Promise<unknown>;

	public override on!: <K extends RPCEvents | 'connected' | 'disconnected'>(
		event: K,
		listener: (...args: RPCClientEvents[K]) => void,
	) => this;

	public override once!: <K extends RPCEvents | 'connected' | 'disconnected'>(
		event: K,
		listener: (...args: RPCClientEvents[K]) => void,
	) => this;

	public override emit!: <K extends RPCEvents | 'connected' | 'disconnected'>(
		event: K,
		...args: RPCClientEvents[K]
	) => boolean;

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
		 * @type {?Partial<APIUser>}
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
		const data = await this.connect(options?.clientId ?? '');
		if (!options?.scopes) {
			this.emit(RPCEvents.Ready, data as MappedRPCDispatchData[RPCEvents.Ready]);
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
	public request<T extends RPCCommands = RPCCommands>(
		cmd: T,
		args?: MappedRPCCommandsArguments[T],
		event?: RPCEvents,
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
	private _onRpcMessage(message: RPCEventPayload) {
		if (message.cmd === RPCCommands.Dispatch && message.evt === RPCEvents.Ready) {
			this.user = (message.data as MappedRPCDispatchData[RPCEvents.Ready]).user;
			this.emit('connected');
		} else if (this._expecting.has(message.nonce)) {
			const { resolve, reject } = this._expecting.get(message.nonce)!;
			if (message.evt === RPCEvents.Error) {
				const e = new Error((message.data as MappedRPCDispatchData[RPCEvents.Error]).message) as Error & {
					code: number;
					data: MappedRPCDispatchData[RPCEvents.Error];
				};
				e.code = (message.data as MappedRPCDispatchData[RPCEvents.Error]).code;
				e.data = message.data as MappedRPCDispatchData[RPCEvents.Error];
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

		const { code } = (await this.request(RPCCommands.Authorize, {
			scopes,
			client_id: this.clientId!,
			rpc_token: rpcToken as string,
			username,
		})) as AuthorizePayloadData;

		const response = (await this.fetch('POST', Routes.oauth2TokenExchange(), {
			data: new URLSearchParams({
				client_id: this.clientId!,
				client_secret: clientSecret,
				code,
				grant_type: 'authorization_code',
				redirect_uri: redirectUri!,
			}),
		})) as RESTPostOAuth2ClientCredentialsResult;

		return response.access_token;
	}

	/**
	 * Authenticate
	 * @param {string} accessToken access token
	 * @returns {Promise}
	 * @private
	 */
	public authenticate(accessToken: string): Promise<RPCClient> {
		return (
			this.request(RPCCommands.Authenticate, { access_token: accessToken }) as Promise<RPCAuthenticateResponsePayload>
		).then((output) => {
			this.accessToken = accessToken;
			this.application = output.data.application;
			this.user = output.data.user;
			this.emit(RPCEvents.Ready, { user: this.user } as unknown as MappedRPCDispatchData[RPCEvents.Ready]);
			return this;
		});
	}

	/**
	 * Fetch a guild
	 * @param {Snowflake} id Guild ID
	 * @returns {Promise<GetGuildPayloadData>}
	 */
	public getGuild(id: Snowflake): Promise<GetGuildPayloadData> {
		return this.request(RPCCommands.GetGuild, { guild_id: id }) as Promise<GetGuildPayloadData>;
	}

	/**
	 * Fetch all guilds
	 * @returns {Promise<GetGuildsPayloadData['guilds']>}
	 */
	public getGuilds(): Promise<GetGuildsPayloadData['guilds']> {
		return this.request(RPCCommands.GetGuilds) as Promise<GetGuildsPayloadData['guilds']>;
	}

	/**
	 * Get a channel
	 * @param {Snowflake} id Channel ID
	 * @returns {Promise<GetChannelPayloadData>}
	 */
	public getChannel(id: Snowflake): Promise<GetChannelPayloadData> {
		return this.request(RPCCommands.GetChannel, { channel_id: id }) as Promise<GetChannelPayloadData>;
	}

	/**
	 * Get all channels
	 * @param {Snowflake} [id] Guild ID
	 * @returns {Promise<GetChannelsPayloadData['channels']>}
	 */
	public async getChannels(id: Snowflake): Promise<GetChannelsPayloadData['channels']> {
		const { channels } = (await this.request(RPCCommands.GetChannels, {
			guild_id: id,
		})) as GetChannelsPayloadData;
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
	public setCertifiedDevices(devices: SetCertifiedDevicesArguments['devices']) {
		return this.request(RPCCommands.SetCertifiedDevices, { devices });
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
	 * @param {SetUserVoiceSettingsData} settings Settings
	 * @returns {Promise}
	 */
	public setUserVoiceSettings(settings: SetUserVoiceSettingsData) {
		return this.request(RPCCommands.SetUserVoiceSettings, settings);
	}

	/**
	 * Move the user to a voice channel
	 * @param {Snowflake} id ID of the voice channel
	 * @param {Object} [options] Options
	 * @param {number} [options.timeout] Timeout for the command
	 * @param {boolean} [options.force] Force this move. This should only be done if you
	 * have explicit permission from the user.
	 * @returns {Promise<GetChannelPayloadData | null>}
	 */
	public selectVoiceChannel(
		id: Snowflake,
		args: Omit<SelectVoiceChannelArguments, 'channel_id'>,
	): Promise<GetChannelPayloadData | null> {
		return this.request(RPCCommands.SelectVoiceChannel, {
			channel_id: id,
			timeout: args.timeout!,
			force: 'force' in args ? args.force : false,
		}) as Promise<GetChannelPayloadData | null>;
	}

	/**
	 * Move the user to a text channel
	 * @param {SelectTextChannelArguments} [args] select text channel arguments
	 *
	 * have explicit permission from the user.
	 * @returns {Promise<GetChannelPayloadData | null>}
	 */
	public selectTextChannel(
		id: Snowflake | null,
		args: Omit<SelectTextChannelArguments, 'channel_id'>,
	): Promise<GetChannelPayloadData | null> {
		return this.request(RPCCommands.SelectTextChannel, {
			channel_id: id,
			timeout: args.timeout!,
		}) as Promise<GetChannelPayloadData | null>;
	}

	/**
	 * Get current voice settings
	 * @returns {Promise<GetVoiceSettingsPayloadData>}
	 */
	public getVoiceSettings(): Promise<GetVoiceSettingsPayloadData> {
		return this.request(RPCCommands.GetVoiceSettings).then((s) => s as GetVoiceSettingsPayloadData);
	}

	/**
	 * Set current voice settings, overriding the current settings until this session disconnects.
	 * This also locks the settings for any other rpc sessions which may be connected.
	 * @param {GetVoiceSettingsPayloadData} args Settings
	 * @returns {Promise}
	 */
	public setVoiceSettings(args: GetVoiceSettingsPayloadData): Promise<unknown> {
		return this.request(RPCCommands.SetVoiceSettings, args);
	}

	/**
	 * Capture a shortcut using the client
	 * The callback takes (key, stop) where `stop` is a function that will stop capturing.
	 * This `stop` function must be called before disconnecting or else the user will have
	 * to restart their client.
	 * @param {Function} callback Callback handling keys
	 * @returns {Promise<Function>}
	 */
	public captureShortcut(callback: (key: string, stop: () => Promise<unknown>) => void) {
		const subid = subKey(RPCEvents.CaptureShortcutChange);
		const stop = () => {
			this._subscriptions.delete(subid);
			return this.request(RPCCommands.CaptureShortcut, { action: 'STOP' });
		};
		this._subscriptions.set(subid, ({ shortcut }) => {
			callback(shortcut, stop);
		});
		return this.request(RPCCommands.CaptureShortcut, { action: 'START' }).then(() => stop);
	}

	/**
	 * Sets the presence for the logged in user.
	 * @param {SetActivityArguments['activity']} activity The rich presence to pass.
	 * @param {number} [pid] The application's process ID. Defaults to the executing process' PID.
	 * @returns {Promise}
	 */
	public setActivity(
		activity: NonNullable<SetActivityArguments['activity']>,
		pid: number | null = getPid(),
	): Promise<unknown> {
		if ('timestamps' in activity) {
			activity.timestamps = {
				start: activity.timestamps.start ?? Date.now(),
				end: (activity.timestamps.end ?? null) as unknown as number,
			};
			if (activity.timestamps.start! > 2147483647000) {
				throw new RangeError('timestamps.start must fit into a unix timestamp');
			}
			if (activity.timestamps.end! > 2147483647000) {
				throw new RangeError('timestamps.end must fit into a unix timestamp');
			}
		}

		return this.request(RPCCommands.SetActivity, {
			pid: pid!,
			activity,
		});
	}

	/**
	 * Clears the currently set presence, if any. This will hide the "Playing X" message
	 * displayed below the user's name.
	 * @param {number} [pid] The application's process ID. Defaults to the executing process' PID.
	 * @returns {Promise}
	 */
	public clearActivity(pid: number = getPid()!): Promise<unknown> {
		return this.request(RPCCommands.SetActivity, {
			pid,
		});
	}

	/**
	 * Invite a user to join the game the RPC user is currently playing
	 * @param {string} user_id The user to invite
	 * @returns {Promise}
	 */
	public sendJoinInvite(user_id: string): Promise<unknown> {
		return this.request(RPCCommands.SendActivityJoinInvite, {
			user_id,
		});
	}

	/**
	 * Request to join the game the user is playing
	 * @param {Snowflake} id The id of the user whose game you want to request to join
	 * @returns {Promise}
	 */
	public sendJoinRequest(id: Snowflake): Promise<unknown> {
		return this.request(RPCCommands.CloseActivityJoinRequest, {
			user_id: id,
		});
	}

	/**
	 * Reject a join request from a user
	 * @param {string} user_id The user whose request you wish to reject
	 * @returns {Promise}
	 */
	public closeJoinRequest(user_id: string): Promise<unknown> {
		return this.request(RPCCommands.CloseActivityRequest, {
			user_id,
		});
	}

	public createLobby(type: LobbyType, capacity: number, metadata: { key: string; value: string }): Promise<unknown> {
		return this.request(RPCCommands.CreateLobby, {
			type,
			capacity,
			metadata,
		});
	}

	public updateLobby(
		id: number,
		{
			type,
			owner_id,
			capacity,
			metadata,
		}: Partial<{ type: LobbyType; owner_id: number; capacity: number; metadata: { key: string; value: string } }>,
	) {
		return this.request(RPCCommands.UpdateLobby, {
			id,
			type,
			owner_id,
			capacity,
			metadata,
		});
	}

	public deleteLobby(id: number): Promise<unknown> {
		return this.request(RPCCommands.DeleteLobby, {
			id,
		});
	}

	public connectToLobby(id: number, secret: string): Promise<unknown> {
		return this.request(RPCCommands.ConnectToLobby, {
			id,
			secret,
		});
	}

	/**
	 * Sends a message to the lobby if the user is in the specified lobby.
	 * @param id The id of the lobby to join
	 * @param data The data to send to the lobby
	 * @returns {Promise}
	 */
	public sendToLobby(id: number, data: ArrayBuffer): Promise<unknown> {
		return this.request(RPCCommands.SendToLobby, {
			id,
			data,
		});
	}

	public disconnectFromLobby(id: number): Promise<unknown> {
		return this.request(RPCCommands.DisconnectFromLobby, {
			id,
		});
	}

	public updateLobbyMember(id: number, user: Snowflake, metadata: { key: string; value: string }): Promise<unknown> {
		return this.request(RPCCommands.UpdateLobbyMember, {
			lobby_id: id,
			user_id: user,
			metadata,
		});
	}

	public getRelationships() {
		// why does get the keys and attempts to index them from the request?
		const types = Object.keys(RelationshipType);
		return (this.request(RPCCommands.GetRelationships) as Promise<{ relationships: RelationShip[] }>).then((o) =>
			o.relationships.map((r) => ({
				...r,
				type: types[r.type],
			})),
		);
	}

	/**
	 * Subscribe to an event
	 * @param {RPCEvent} event Name of event e.g. `MESSAGE_CREATE`
	 * @param {RPCArguments} [args] Args for event e.g. `{ channel_id: '1234' }`
	 * @returns {Promise<Object>}
	 */
	public async subscribe(event: RPCEvents, args: RPCArguments): Promise<object> {
		await this.request(RPCCommands.Subscribe, args, event);
		return {
			unsubscribe: () => this.request(RPCCommands.Unsubscribe, args, event),
		};
	}

	/**
	 * Destroy the client
	 */
	public async destroy() {
		await this.transport.close();
	}
}
