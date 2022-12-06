import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { setTimeout, clearTimeout } from 'node:timers';
import { URLSearchParams } from 'node:url';
import type { APIUser, OAuth2Scopes, RESTPostOAuth2ClientCredentialsResult, Snowflake } from 'discord-api-types/v10';
import { Routes } from 'discord-api-types/v10';
import { fetch } from 'undici';
import { RPCError } from './error.js';
import { transports } from './transports/index.js';
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
import {
	RPCCommands,
	RPCEvents,
	type LobbyType,
	RelationshipType,
	RPCErrorCodes,
	PromptType,
} from './typings/types.js';
import { pid as getPid } from './util.js';

type Class<T extends new (...args: any[]) => unknown> = T extends new (...args: any[]) => infer R ? R : never;

const MAX_TIME_RANGE = 2_147_483_647_000;

export interface RPCClientOptions {
	/**
	 * Origin link specified in the [Portal](https://discord.com/developers/applications)
	 */
	origin?: string;
	/**
	 * rpc transport
	 */
	transport: keyof typeof transports;
}

export interface RPCLoginOptions {
	/**
	 * Access token
	 */
	accessToken: string;
	/**
	 * Client ID
	 */
	clientId: string;
	/**
	 * Client secret
	 */
	clientSecret: string;
	prompt: PromptType;
	/**
	 * Scopes to authorize with
	 */
	scopes: OAuth2Scopes[];
	/**
	 * Token endpoint
	 */
	tokenEndpoint: string;
	/**
	 * Should we use RPC token or npt
	 */
	useRPCToken: boolean;
	/**
	 * Username to use if user doesn't have a discord account
	 */
	username: string;
}

/**
 * The main hub for interacting with Discord RPC
 *
 * @beta
 */
export class RPCClient extends EventEmitter {
	private accessToken: string | null = null;

	/**
	 * ID of the application used in this client
	 */
	public clientId: string | null = null;

	/**
	 * Application used in this client
	 */
	public application: RPCOAuthApplication | null = null;

	/**
	 * User used in this application
	 */
	public user: Partial<APIUser> | null = null;

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

	private readonly _expecting: Map<
		string,
		{ error: RPCError; reject(reason?: Error): void; resolve(value: unknown): void }
	>;

	private _connectPromise: Promise<unknown> | undefined;

	/**
	 * @param options - Options for the client.
	 * You must provide a transport
	 */
	public constructor(public readonly options: RPCClientOptions) {
		super();

		const transport = transports[options.transport];
		if (!transport) {
			const invalidTransportErr = new TypeError('INVALID_TRANSPORT', options.transport as any);
			Error.captureStackTrace(invalidTransportErr, this.constructor);
			throw invalidTransportErr;
		}

		this.fetch = async (method, path, options) => {
			const res = await fetch(
				`${this.endpoint}${path}${options?.query ? new URLSearchParams(options.query).toString() : ''}`,
				{
					method,
					body: options?.data.toString() as string | null,
					headers: {
						Authorization: `Bearer ${this.accessToken!}`,
					},
				},
			);

			const body = await res.json();
			if (!res.ok) {
				const err = new Error(res.status.toString()) as Error & { body: unknown };
				err.body = body;
				throw err;
			}

			return body;
		};

		/**
		 * Raw transport used
		 */
		this.transport = new transport(this);
		this.transport.on('message', this._onRpcMessage.bind(this));

		/**
		 * Map of nonces being expected from the transport
		 */
		this._expecting = new Map();

		this._connectPromise = undefined;
	}

	/**
	 * Update endpoint
	 *
	 * @internal
	 */
	public updateEndpoint(endpoint: string) {
		this.endpoint = endpoint;
	}

	/**
	 * Search and connect to RPC
	 *
	 * @param clientId - Client ID to use
	 */
	public async connect(clientId: string) {
		if (this._connectPromise) {
			return this._connectPromise;
		}

		const timeoutErr = new Error('RPC_CONNECTION_TIMEOUT');
		// eslint-disable-next-line @typescript-eslint/unbound-method
		Error.captureStackTrace(timeoutErr, this.connect);

		this._connectPromise = new Promise((resolve, reject) => {
			this.clientId = clientId;
			const timeout = setTimeout(() => reject(timeoutErr), 10e3);
			timeout.unref();
			this.once('connected', () => {
				clearTimeout(timeout);
				resolve(this);
			});
			this.transport.once('close', () => {
				for (const expect of this._expecting.values()) {
					expect.reject(new Error('connection closed'));
				}

				this.emit('disconnected');
				reject(new Error('connection closed'));
			});
			try {
				void this.transport.connect();
			} catch (error) {
				reject(error);
			}
		});
		return this._connectPromise;
	}

	/**
	 * Performs authentication flow. Automatically calls Client#connect if needed.
	 *
	 * @param options - Options for authentication.
	 * At least one property must be provided to perform login.
	 * @example
	 * ```js
	 * client.login({ clientId: '1234567', clientSecret: 'abcdef123' });
	 * ```
	 */
	public async login(options?: RPCLoginOptions): Promise<RPCClient> {
		const data = await this.connect(options?.clientId ?? '');
		if (!options?.scopes) {
			this.emit(RPCEvents.Ready, data as MappedRPCDispatchData[RPCEvents.Ready]);
			return this;
		}

		// eslint-disable-next-line require-atomic-updates
		options.accessToken ??= await this.authorize(options);

		return this.authenticate(options.accessToken);
	}

	/**
	 * Request
	 *
	 * @param cmd - Command
	 * @param args - Arguments
	 * @param event - Event
	 * @internal
	 */
	protected async request<T extends RPCCommands = RPCCommands>(
		cmd: T,
		args?: MappedRPCCommandsArguments[T],
		event?: RPCEvents,
	): Promise<unknown> {
		const error = new RPCError(RPCErrorCodes.UnknownError);
		// eslint-disable-next-line @typescript-eslint/unbound-method
		RPCError.captureStackTrace(error, this.request);

		return new Promise((resolve, reject) => {
			const nonce = randomUUID();
			const evt = event!;
			this.transport.send({ cmd, args, evt, nonce });
			this._expecting.set(nonce, { resolve, reject, error });
		});
	}

	/**
	 * Message handler
	 *
	 * @param message - message
	 */
	private _onRpcMessage(message: RPCEventPayload) {
		if (message.cmd === RPCCommands.CaptureShortcut && message.evt === RPCEvents.CaptureShortcutChange) {
			this.emit(
				RPCEvents.CaptureShortcutChange,
				message.data as MappedRPCDispatchData[RPCEvents.CaptureShortcutChange],
			);
		}

		if (message.cmd === RPCCommands.Dispatch && message.evt === RPCEvents.Ready) {
			this.user = (message.data as MappedRPCDispatchData[RPCEvents.Ready]).user;
			this.emit('connected');
		} else if (this._expecting.has(message.nonce)) {
			const expect = this._expecting.get(message.nonce)!;
			if (message.evt === RPCEvents.Error) {
				const err = expect.error;
				err.code = (message.data as MappedRPCDispatchData[RPCEvents.Error]).code;
				err.message = (message.data as MappedRPCDispatchData[RPCEvents.Error]).message;

				expect.reject(err);
			} else {
				expect.resolve(message.data);
			}

			this._expecting.delete(message.nonce);
		} else {
			this.emit(message.evt, message.data);
		}
	}

	/**
	 * Authorize
	 *
	 * @internal
	 */
	protected async authorize({
		scopes,
		clientSecret,
		useRPCToken,
		username,
		redirectUri,
		prompt = PromptType.Consent,
	}: Omit<RPCLoginOptions, 'clientId' | 'tokenEndpoint'> & { redirectUri?: string }): Promise<string> {
		let rpcToken: string | undefined;
		if (clientSecret && useRPCToken) {
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
			prompt,
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
	 *
	 * @param accessToken - access token
	 * @internal
	 */
	protected async authenticate(accessToken: string): Promise<RPCClient> {
		const { data } = (await this.request(RPCCommands.Authenticate, {
			access_token: accessToken,
		})) as RPCAuthenticateResponsePayload;

		this.accessToken = accessToken;
		this.application = data.application;
		this.user = data.user;

		this.emit(RPCEvents.Ready, { user: this.user } as unknown as MappedRPCDispatchData[RPCEvents.Ready]);

		return this;
	}

	/**
	 * Fetch a guild
	 *
	 * @param id - Guild ID
	 */
	public async getGuild(id: Snowflake): Promise<GetGuildPayloadData> {
		return this.request(RPCCommands.GetGuild, { guild_id: id }) as Promise<GetGuildPayloadData>;
	}

	/**
	 * Fetch all guilds
	 */
	public async getGuilds(): Promise<GetGuildsPayloadData['guilds']> {
		return this.request(RPCCommands.GetGuilds) as Promise<GetGuildsPayloadData['guilds']>;
	}

	/**
	 * Get a channel
	 *
	 * @param id - Channel ID
	 */
	public async getChannel(id: Snowflake): Promise<GetChannelPayloadData> {
		return this.request(RPCCommands.GetChannel, { channel_id: id }) as Promise<GetChannelPayloadData>;
	}

	/**
	 * Get all channels
	 *
	 * @param id - Guild ID
	 */
	public async getChannels(id: Snowflake): Promise<GetChannelsPayloadData['channels']> {
		const { channels } = (await this.request(RPCCommands.GetChannels, {
			guild_id: id,
		})) as GetChannelsPayloadData;
		return channels;
	}

	/**
	 * Tell discord which devices are certified
	 *
	 * @param devices - Certified devices to send to discord
	 */
	public async setCertifiedDevices(devices: SetCertifiedDevicesArguments['devices']) {
		return this.request(RPCCommands.SetCertifiedDevices, { devices });
	}

	/**
	 * Set the voice settings for a user, by id
	 *
	 * @param settings - Settings
	 */
	public async setUserVoiceSettings(settings: SetUserVoiceSettingsData) {
		return this.request(RPCCommands.SetUserVoiceSettings, settings);
	}

	/**
	 * Move the user to a voice channel
	 *
	 * @param id - ID of the voice channel
	 * @param args - select voice channel arguments
	 */
	public async selectVoiceChannel(
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
	 *
	 * @param id - ID of the text channel
	 * @param args - select text channel arguments
	 *
	 * have explicit permission from the user.
	 */
	public async selectTextChannel(
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
	 */
	public async getVoiceSettings(): Promise<GetVoiceSettingsPayloadData> {
		return this.request(RPCCommands.GetVoiceSettings) as Promise<GetVoiceSettingsPayloadData>;
	}

	/**
	 * Set current voice settings, overriding the current settings until this session disconnects.
	 * This also locks the settings for any other rpc sessions which may be connected.
	 *
	 * @param args - Settings
	 */
	public async setVoiceSettings(args: GetVoiceSettingsPayloadData): Promise<unknown> {
		return this.request(RPCCommands.SetVoiceSettings, args);
	}

	/**
	 * Start capturing a shortcut using the client
	 */
	public async startCapturingShortcut() {
		return this.request(RPCCommands.CaptureShortcut, { action: 'START' });
	}

	/**
	 * Stop capturing a shortcut using the client
	 */
	public async stopCapturingShortcut() {
		return this.request(RPCCommands.CaptureShortcut, { action: 'STOP' });
	}

	/**
	 * Sets the presence for the logged in user.
	 *
	 * @param activity - The rich presence to pass.
	 * @param pid - The application's process ID. Defaults to the executing process' PID.
	 */
	public async setActivity(
		activity: NonNullable<SetActivityArguments['activity']>,
		pid: number | null = getPid(),
	): Promise<unknown> {
		if ('timestamps' in activity) {
			activity.timestamps = {
				start: activity.timestamps.start ?? Date.now(),
				end: (activity.timestamps.end ?? null) as unknown as number,
			};

			if (activity.timestamps.start! > MAX_TIME_RANGE) {
				const rangeError = new RangeError('timestamps.start must fit into a unix timestamp');

				// eslint-disable-next-line @typescript-eslint/unbound-method
				Error.captureStackTrace(rangeError, this.setActivity);

				throw rangeError;
			}

			if (activity.timestamps.end! > MAX_TIME_RANGE) {
				const rangeError = new RangeError('timestamps.end must fit into a unix timestamp');

				// eslint-disable-next-line @typescript-eslint/unbound-method
				Error.captureStackTrace(rangeError, this.setActivity);

				throw rangeError;
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
	 *
	 * @param pid - The application's process ID. Defaults to the executing process' PID.
	 */
	public async clearActivity(pid: number = getPid()!): Promise<unknown> {
		return this.request(RPCCommands.SetActivity, {
			pid,
		});
	}

	/**
	 * Invite a user to join the game the RPC user is currently playing
	 *
	 * @param user_id - The user to invite
	 */
	public async sendJoinInvite(user_id: string): Promise<unknown> {
		return this.request(RPCCommands.SendActivityJoinInvite, {
			user_id,
		});
	}

	/**
	 * Request to join the game the user is playing
	 *
	 * @param id - The id of the user whose game you want to request to join
	 */
	public async sendJoinRequest(id: Snowflake): Promise<unknown> {
		return this.request(RPCCommands.CloseActivityJoinRequest, {
			user_id: id,
		});
	}

	/**
	 * Reject a join request from a user
	 *
	 * @param user_id - The user whose request you wish to reject
	 */
	public async closeJoinRequest(user_id: string): Promise<unknown> {
		return this.request(RPCCommands.CloseActivityRequest, {
			user_id,
		});
	}

	public async createLobby(
		type: LobbyType,
		capacity: number,
		metadata: { key: string; value: string },
	): Promise<unknown> {
		return this.request(RPCCommands.CreateLobby, {
			type,
			capacity,
			metadata,
		});
	}

	public async updateLobby(
		id: number,
		{
			type,
			owner_id,
			capacity,
			metadata,
		}: Partial<{ capacity: number; metadata: { key: string; value: string }; owner_id: number; type: LobbyType }>,
	) {
		return this.request(RPCCommands.UpdateLobby, {
			id,
			type,
			owner_id,
			capacity,
			metadata,
		});
	}

	public async deleteLobby(id: number): Promise<unknown> {
		return this.request(RPCCommands.DeleteLobby, {
			id,
		});
	}

	public async connectToLobby(id: number, secret: string): Promise<unknown> {
		return this.request(RPCCommands.ConnectToLobby, {
			id,
			secret,
		});
	}

	/**
	 * Sends a message to the lobby if the user is in the specified lobby.
	 *
	 * @param id - The id of the lobby to join
	 * @param data - The data to send to the lobby
	 */
	public async sendToLobby(id: number, data: ArrayBuffer): Promise<unknown> {
		return this.request(RPCCommands.SendToLobby, {
			id,
			data,
		});
	}

	public async disconnectFromLobby(id: number): Promise<unknown> {
		return this.request(RPCCommands.DisconnectFromLobby, {
			id,
		});
	}

	public async updateLobbyMember(
		id: number,
		user: Snowflake,
		metadata: { key: string; value: string },
	): Promise<unknown> {
		return this.request(RPCCommands.UpdateLobbyMember, {
			lobby_id: id,
			user_id: user,
			metadata,
		});
	}

	public async getRelationships() {
		// why does get the keys and attempts to index them from the request?
		const types = Object.keys(RelationshipType);
		const { relationships } = (await this.request(RPCCommands.GetRelationships)) as {
			relationships: RelationShip[];
		};

		return relationships.map((relationship) => ({
			...relationship,
			type: types[relationship.type],
		}));
	}

	/**
	 * Subscribe to an event
	 *
	 * @param event - Name of event e.g. `MESSAGE_CREATE`
	 * @param args - Args for event e.g. `{ channel_id: '1234' }`
	 */
	public async subscribe(event: RPCEvents, args: RPCArguments): Promise<object> {
		await this.request(RPCCommands.Subscribe, args, event);
		return {
			unsubscribe: async () => this.request(RPCCommands.Unsubscribe, args, event),
		};
	}

	/**
	 * Destroy the client
	 */
	public async destroy() {
		await this.transport.close();
	}
}
