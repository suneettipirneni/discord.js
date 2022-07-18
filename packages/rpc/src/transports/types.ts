import type {
	OAuth2Scopes,
	Snowflake,
	APIUser,
	APIGuild,
	APIGuildMember,
	ChannelType,
	GatewayVoiceState,
	APIMessage,
	APIGuildChannel,
	GatewayActivity,
} from 'discord.js';

export enum RPCCommand {
	Dispatch = 'DISPATCH',
	Authorize = 'AUTHORIZE',
	Authenticate = 'AUTHENTICATE',
	GetGuild = 'GET_GUILD',
	GetGuilds = 'GET_GUILDS',
	GetChannel = 'GET_CHANNEL',
	GetChannels = 'GET_CHANNELS',
	Subscribe = 'SUBSCRIBE',
	Unsubscribe = 'UNSUBSCRIBE',
	SetUserVoiceSettings = 'SET_USER_VOICE_SETTINGS',
	SelectVoiceChannel = 'SELECT_VOICE_CHANNEL',
	GetSelectedVoiceChannel = 'GET_SELECTED_VOICE_CHANNEL',
	SelectTextChannel = 'SELECT_TEXT_CHANNEL',
	GetVoiceSettings = 'GET_VOICE_SETTINGS',
	SetVoiceSettings = 'SET_VOICE_SETTINGS',
	SetCertifiedDevices = 'SET_CERTIFIED_DEVICES',
	SetActivity = 'SET_ACTIVITY',
	SendActivityJoinInvite = 'SEND_ACTIVITY_JOIN_INVITE',
	CloseActivityRequest = 'CLOSE_ACTIVITY_REQUEST',
}

export enum RPCEvent {
	Ready = 'READY',
	Error = 'ERROR',
	GuildStatus = 'GUILD_STATUS',
	GuildCreate = 'GUILD_CREATE',
	ChannelCreate = 'CHANNEL_CREATE',
	VoiceChannelSelect = 'VOICE_CHANNEL_SELECT',
	VoiceStateCreate = 'VOICE_STATE_CREATE',
	VoiceStateUpdate = 'VOICE_STATE_UPDATE',
	VoiceStateDelete = 'VOICE_STATE_DELETE',
	VoiceSettingsUpdate = 'VOICE_SETTINGS_UPDATE',
	VoiceConnectionStatus = 'VOICE_CONNECTION_STATUS',
	SpeakingStart = 'SPEAKING_START',
	SpeakingStop = 'SPEAKING_STOP',
	MessageCreate = 'MESSAGE_CREATE',
	MessageUpdate = 'MESSAGE_UPDATE',
	MessageDelete = 'MESSAGE_DELETE',
	NotificationCreate = 'NOTIFICATION_CREATE',
	ActivityJoin = 'ACTIVITY_JOIN',
	ActivityJoinRequest = 'ACTIVITY_JOIN_REQUEST',
}

export interface BaseRPCPayload {
	cmd: RPCCommand;
}

export interface RPCCommandResponsePayload extends BaseRPCPayload {
	nonce: string;
}

export interface BaseRPCServerResponsePayload extends BaseRPCPayload {
	args: never;
	evt?: RPCEvent;
}

export type RPCResponsePayload =
	| RPCAuthorizeResponsePayload
	| RPCAuthenticateResponsePayload
	| RPCGetGuildResponsePayload
	| RPCGetGuildsResponsePayload
	| RPCGetChannelResponsePayload
	| RPCGetChannelsResponsePayload
	| RPCSetUserVoiceSettingsResponsePayload
	| RPCSelectVoiceChannelResponsePayload
	| RPCGetVoiceSettingsResponsePayload
	| RPCSetVoiceSettingsResponsePayload
	| RPCSetCertifiedDevicesResponsePayload
	| RPCSetActivityResponsePayload
	| RPCSendActivityJoinInviteResponsePayload
	| RPCCloseActivityRequestResponsePayload;

// ----- BEGIN RPC RESPONSE TYPES -----

export interface RPCAuthorizeResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommand.Authorize;
	data: AuthorizeResponseData;
}

export interface RPCAuthenticateResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommand.Authenticate;
	data: AuthenticateResponseData;
}

export interface RPCGetGuildResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommand.GetGuild;
	data: GetGuildResponseData;
}

export interface RPCGetGuildsResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommand.GetGuilds;
	data: GetGuildsResponseData;
}

export interface RPCGetChannelResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommand.GetChannel;
	data: GetChannelResponseData;
}

export interface RPCGetChannelsResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommand.GetChannels;
	data: GetChannelsResponseData;
}

export interface RPCSetUserVoiceSettingsResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommand.SetUserVoiceSettings;
	data: SetUserVoiceSettingsData;
}

export interface RPCSelectVoiceChannelResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommand.SelectVoiceChannel;
	data: undefined;
}

export interface RPCSelectTextChannelResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommand.SelectTextChannel;
	data: undefined;
}

export interface RPCGetVoiceSettingsResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommand.GetVoiceSettings;
	data: GetVoiceSettingsResponseData;
}

export interface RPCSetVoiceSettingsResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommand.SetVoiceSettings;
	data: GetVoiceSettingsResponseData;
}

export interface RPCSetCertifiedDevicesResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommand.SetCertifiedDevices;
	data: undefined;
}

export interface RPCSetActivityResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommand.SetActivity;
	data: undefined;
}

export interface RPCSendActivityJoinInviteResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommand.SendActivityJoinInvite;
	data: undefined;
}

export interface RPCCloseActivityRequestResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommand.CloseActivityRequest;
	data: undefined;
}

// ----- END RPC RESPONSE TYPES -----

// ----- BEGIN RPC REQUEST TYPES -----

export type RPCCommandPayload =
	| RPCAuthorizeCommandPayload
	| RPCAuthenticateCommandPayload
	| RPCGetGuildCommandPayload
	| RPCGetGuildsCommandPayload
	| RPCGetChannelCommandPayload
	| RPCGetChannelsCommandPayload
	| RPCSetUserVoiceSettingsCommandPayload
	| RPCSelectVoiceChannelCommandPayload
	| RPCGetVoiceSettingsCommandPayload
	| RPCSetVoiceSettingsCommandPayload
	| RPCSetCertifiedDevicesCommandPayload
	| RPCSetActivityCommandPayload
	| RPCSendActivityJoinInviteCommandPayload
	| RPCCloseActivityRequestCommandPayload;

export interface RPCAuthorizeCommandPayload {
	cmd: RPCCommand.Authorize;
	args: AuthorizeArguments;
}

export interface RPCAuthenticateCommandPayload {
	cmd: RPCCommand.Authenticate;
	args: AuthenticateArguments;
}

export interface RPCGetGuildCommandPayload {
	cmd: RPCCommand.GetGuild;
	args: GetGuildArguments;
}

export interface RPCGetGuildsCommandPayload {
	cmd: RPCCommand.GetGuilds;
	args: undefined;
}

export interface RPCGetChannelCommandPayload {
	cmd: RPCCommand.GetChannel;
	args: GetChannelArguments;
}

export interface RPCGetChannelsCommandPayload {
	cmd: RPCCommand.GetChannels;
	args: GetChannelArguments;
}

export interface RPCSetUserVoiceSettingsCommandPayload {
	cmd: RPCCommand.SetUserVoiceSettings;
	args: SetUserVoiceSettingsData;
}

export interface RPCSelectVoiceChannelCommandPayload {
	cmd: RPCCommand.SelectVoiceChannel;
	args: SelectVoiceChannelArguments;
}

export interface RPCGetSelectedVoiceChannelCommandPayload {
	cmd: RPCCommand.GetSelectedVoiceChannel;
	args: undefined;
}

export interface RPCSelectTextChannelCommandPayload {
	cmd: RPCCommand.SelectTextChannel;
	args: SelectTextChannelArguments;
}

export interface RPCGetVoiceSettingsCommandPayload {
	cmd: RPCCommand.GetVoiceSettings;
	args: undefined;
}

export interface RPCSetVoiceSettingsCommandPayload {
	cmd: RPCCommand.SetVoiceSettings;
	args: GetVoiceSettingsResponseData;
}

export interface RPCSetCertifiedDevicesCommandPayload {
	cmd: RPCCommand.SetCertifiedDevices;
	args: SetCertifiedDevicesArguments;
}

export interface RPCSetActivityCommandPayload {
	cmd: RPCCommand.SetActivity;
	args: SetActivityArguments;
}

export interface RPCSendActivityJoinInviteCommandPayload {
	cmd: RPCCommand.SendActivityJoinInvite;
	args: SendActivityJoinInviteArguments;
}

export interface RPCCloseActivityRequestCommandPayload {
	cmd: RPCCommand.CloseActivityRequest;
	args: CloseActivityRequestArguments;
}

// ----- END RPC REQUEST TYPES -----

export interface RPCSubscribedPayload extends BaseRPCPayload {
	evt: RPCEvent;
}

export type RPCPayload = RPCCommandPayload | RPCSubscribedPayload | BaseRPCServerResponsePayload;

export interface DispatchRPCPayload extends BaseRPCPayload {
	cmd: RPCCommand.Dispatch;
	evt: RPCEvent;
	data: RPCDispatchData;
}

<<<<<<< Updated upstream
export interface MappedArguments {
	[RPCCommand.Authorize]: AuthorizeArguments;
	[RPCCommand.Authenticate]: AuthenticateArguments;
	[RPCCommand.GetGuild]: GetGuildArguments;
	[RPCCommand.GetGuilds]: undefined;
	[RPCCommand.GetChannel]: GetChannelArguments;
	[RPCCommand.GetChannels]: GetChannelsArguments;
	[RPCCommand.SetUserVoiceSettings]: SetUserVoiceSettingsData;
	[RPCCommand.SelectVoiceChannel]: SelectVoiceChannelArguments;
	[RPCCommand.GetSelectedVoiceChannel]: undefined;
	[RPCCommand.SelectTextChannel]: SelectTextChannelArguments;
	[RPCCommand.GetVoiceSettings]: undefined;
	[RPCCommand.SetVoiceSettings]: GetVoiceSettingsResponseData;
	// [RPCCommand.Subscribe]: SubscribeArguments;
	// [RPCCommand.Unsubscribe]: UnsubscribeArguments;
	[RPCCommand.SetCertifiedDevices]: SetCertifiedDevicesArguments;
	[RPCCommand.SetActivity]: SetActivityArguments;
	[RPCCommand.SendActivityJoinInvite]: SendActivityJoinInviteArguments;
	[RPCCommand.CloseActivityRequest]: CloseActivityRequestArguments;
}

=======
>>>>>>> Stashed changes
export type RPCArguments =
	| AuthorizeArguments
	| AuthenticateArguments
	| GetGuildArguments
	| GetChannelArguments
	| GetChannelsArguments
	| SetUserVoiceSettingsData
	| SelectVoiceChannelArguments
	| SelectVoiceChannelArguments;

export type RPCResponseData =
	| AuthorizeResponseData
	| AuthenticateResponseData
	| GetGuildsResponseData
	| GetGuildResponseData
	| GetChannelResponseData
	| GetChannelsResponseData
	| SetUserVoiceSettingsData;

export interface AuthorizeArguments {
	scopes: OAuth2Scopes[];
	client_id: string;
	rpc_token: string;
	username: string;
}

export interface AuthorizeResponseData {
	code: string;
}

<<<<<<< Updated upstream
export interface AuthorizePayload extends BaseRPCPayload {
	cmd: RPCCommand.Authorize;
	args?: AuthorizeArguments;
	data?: AuthorizeResponseData;
}

=======
>>>>>>> Stashed changes
export interface AuthenticateArguments {
	access_token: string;
}

export interface RPCOAuthApplication {
	description: string;
	icon: string;
	id: Snowflake;
	rpc_origin: string[];
	name: string;
}

export interface AuthenticateResponseData {
	user: Partial<APIUser>;
	scopes: OAuth2Scopes[];
	expires: string;
	application: RPCOAuthApplication;
}

<<<<<<< Updated upstream
export interface AuthenticatePayload extends BaseRPCPayload {
	cmd: RPCCommand.Authenticate;
	args?: AuthenticateArguments;
	data?: AuthenticateResponseData;
}

=======
>>>>>>> Stashed changes
export interface GetGuildsResponseData {
	guilds: Partial<APIGuild>[];
}

export interface GetGuildsPayload extends Omit<BaseRPCPayload, 'args'> {
	cmd: RPCCommand.GetGuilds;
	data?: GetGuildResponseData;
}

export interface GetGuildArguments {
	guild_id: Snowflake;
	timeout?: number;
}

export interface GetGuildResponseData {
	id: Snowflake;
	name: string;
	icon_url: string;
	members: Partial<APIGuildMember>[];
}

<<<<<<< Updated upstream
export interface GetGuildPayload extends BaseRPCPayload {
	cmd: RPCCommand.GetGuild;
	args?: GetGuildArguments;
	data?: GetGuildResponseData;
}

=======
>>>>>>> Stashed changes
export interface GetChannelArguments {
	channel_id: Snowflake;
}

export interface GetChannelResponseData {
	id: Snowflake;
	guild_id: Snowflake;
	name: string;
	type: ChannelType;
	topic: string;
	bitrate: number;
	user_limit: number;
	position: number;
	voice_states: GatewayVoiceState[];
	messages: APIMessage[];
}

<<<<<<< Updated upstream
export interface GetChannelPayload extends BaseRPCPayload {
	cmd: RPCCommand.GetChannel;
	args?: GetChannelArguments;
	data?: GetChannelResponseData;
}

=======
>>>>>>> Stashed changes
export interface GetChannelsArguments {
	guild_id: Snowflake;
}

export interface GetChannelsResponseData {
	channels: Partial<APIGuildChannel<ChannelType>>[];
}

<<<<<<< Updated upstream
export interface GetChannelsPayload extends BaseRPCPayload {
	cmd: RPCCommand.GetChannels;
	args?: GetChannelsArguments;
	data?: GetChannelsResponseData;
}

=======
>>>>>>> Stashed changes
export interface Pan {
	left: number;
	right: number;
}

export interface SetUserVoiceSettingsData {
	user_id: Snowflake;
	pan?: Pan;
	volume?: number;
	mute?: boolean;
}

<<<<<<< Updated upstream
export interface SetUserVoiceSettingsPayload extends BaseRPCPayload {
	cmd: RPCCommand.SetUserVoiceSettings;
	data?: SetUserVoiceSettingsData;
	args?: SetUserVoiceSettingsData;
}

=======
>>>>>>> Stashed changes
export interface SelectVoiceChannelArguments {
	channel_id: Snowflake;
	timeout: number;
	force: boolean;
}

<<<<<<< Updated upstream
export interface SelectVoiceChannelPayload extends BaseRPCPayload {
	cmd: RPCCommand.SelectVoiceChannel;
	args?: SelectVoiceChannelArguments;
}

export interface GetSelectedVoiceChannelPayload extends BaseRPCPayload {
	cmd: RPCCommand.GetSelectedVoiceChannel;
	data?: GetChannelResponseData;
}

=======
>>>>>>> Stashed changes
export interface SelectTextChannelArguments {
	channel_id: Snowflake;
	timeout: number;
}

<<<<<<< Updated upstream
export interface SelectTextChannelPayload extends BaseRPCPayload {
	cmd: RPCCommand.SelectTextChannel;
	args?: SelectTextChannelArguments;
}

=======
>>>>>>> Stashed changes
export enum KeyType {
	KeyboardKey = 'KEYBOARD_KEY',
	MouseButton = 'MOUSE_BUTTON',
	KeyboardModifierKey = 'KEYBOARD_MODIFIER_KEY',
	GamepadButton = 'GAMEPAD_BUTTON',
}

export interface ShortcutKeyCombo {
	type: KeyType;
	code: number;
	name: string;
}

export interface VoiceSettingDevice {
	id: string;
	name: string;
}

export interface VoiceSettingsInput {
	device_id: string;
	volume: number;
	available_devices: VoiceSettingDevice[];
}

export interface VoiceSettingsMode {
	type: 'PUSH_TO_TALK' | 'VOICE_ACTIVITY';
	auto_threshold: boolean;
	threshold: number;
	shortcut: ShortcutKeyCombo;
	delay: number;
}

export interface VoiceSettingsOutput {
	device_id: string;
	volume: number;
	available_devices: VoiceSettingDevice[];
}

export interface GetVoiceSettingsResponseData {
	input: VoiceSettingsInput;
	output: VoiceSettingsOutput;
	mode: VoiceSettingsMode;
	automatic_gain_control: boolean;
	echo_cancellation: boolean;
	noise_suppression: boolean;
	qos: boolean;
	silence_warning: boolean;
	deaf: boolean;
	mute: boolean;
}

<<<<<<< Updated upstream
export interface GetVoiceSettingsPayload extends BaseRPCPayload {
	cmd: RPCCommand.GetVoiceSettings;
	data?: GetVoiceSettingsResponseData;
}

export interface SetVoiceSettingsPayload extends BaseRPCPayload {
	cmd: RPCCommand.SetVoiceSettings;
	data?: GetVoiceSettingsResponseData;
	args?: GetVoiceSettingsResponseData;
}

=======
>>>>>>> Stashed changes
export interface SubscribeResponseData {
	evt: RPCEvent;
}

<<<<<<< Updated upstream
export interface SubscribePayload extends BaseRPCPayload {
	evt: RPCEvent;
	cmd: RPCCommand.Subscribe;
	// TODO: event arg types
	args: any;
	data?: SubscribeResponseData;
}

export interface UnsubscribePayload extends BaseRPCPayload {
	cmd: RPCCommand.Unsubscribe;
	evt: RPCEvent;
	// TODO: event arg types
	args: any;
	data?: SubscribeResponseData;
}

=======
>>>>>>> Stashed changes
export enum DeviceType {
	AudioInput = 'audioinput',
	AudioOutput = 'audiooutput',
	VideoInput = 'videoinput',
}

export interface Vendor {
	name: string;
	url: string;
}

export interface Model {
	name: string;
	url: string;
}

export interface BaseDevice {
	type: DeviceType;
	id: string;
	vendor: Vendor;
	model: Model;
	related: string[];
}

export interface OutputDevice extends BaseDevice {
	type: DeviceType.VideoInput | DeviceType.AudioOutput;
}

export interface InputAudioDevice extends BaseDevice {
	type: DeviceType.AudioInput;
	echo_cancellation?: boolean;
	noise_suppression?: boolean;
	auto_gain_control?: boolean;
	hardware_mute?: boolean;
}

export type Device = OutputDevice | InputAudioDevice;

export interface SetCertifiedDevicesArguments {
	devices: Device[];
}

<<<<<<< Updated upstream
export interface SetCertifiedDevicesPayload extends BaseRPCPayload {
	cmd: RPCCommand.SetCertifiedDevices;
	args?: SetCertifiedDevicesArguments;
}

=======
>>>>>>> Stashed changes
export interface SetActivityArguments {
	pid: number;
	activity: GatewayActivity;
}

<<<<<<< Updated upstream
export interface SetActivityPayload extends BaseRPCPayload {
	cmd: RPCCommand.SetActivity;
	args?: SetActivityArguments;
}

=======
>>>>>>> Stashed changes
export interface SendActivityJoinInviteArguments {
	user_id: Snowflake;
}

<<<<<<< Updated upstream
export interface SendActivityJoinInvitePayload extends BaseRPCPayload {
	cmd: RPCCommand.SendActivityJoinInvite;
	args?: SendActivityJoinInviteArguments;
}

=======
>>>>>>> Stashed changes
export interface CloseActivityRequestArguments {
	user_id: Snowflake;
}

<<<<<<< Updated upstream
export interface CloseActivityRequestPayload extends BaseRPCPayload {
	cmd: RPCCommand.CloseActivityRequest;
	args?: CloseActivityRequestArguments;
}

=======
>>>>>>> Stashed changes
export interface RPCServerConfiguration {
	cdn_host: string;
	api_endpoint: string;
	environment: string;
}

export type RPCDispatchData = ReadyDispatchData | ErrorDispatchData | GuildStatusDispatchData;

export interface ReadyDispatchData {
	v: number;
	config: RPCServerConfiguration;
	user: Partial<APIUser>;
}

export interface ErrorDispatchData {
	code: number;
	message: string;
}

export interface GuildStatusDispatchData {
	guild_id: Snowflake;
}
