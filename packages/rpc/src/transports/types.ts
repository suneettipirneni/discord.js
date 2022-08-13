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
	RESTPostOAuth2ClientCredentialsResult,
} from 'discord-api-types/v10';

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
	// undocumented commands
	CreateChannelInvite = 'CREATE_CHANNEL_INVITE',
	GetRelationships = 'GET_RELATIONSHIPS',
	GetUser = 'GET_USER',
	SetUserVoiceSettings2 = 'SET_USER_VOICE_SETTINGS_2',
	SetVoiceSettings2 = 'SET_VOICE_SETTINGS_2',
	CaptureShortcut = 'CAPTURE_SHORTCUT',
	CloseActivityJoinRequest = 'CLOSE_ACTIVITY_JOIN_REQUEST',
	ActivityInviteUser = 'ACTIVITY_INVITE_USER',
	AcceptActivityInvite = 'ACCEPT_ACTIVITY_INVITE',
	InviteBrowser = 'INVITE_BROWSER',
	DeepLink = 'DEEP_LINK',
	ConnectionsCallback = 'CONNECTIONS_CALLBACK',
	BrainTreePopupBridgeCallback = 'BRAINTREE_POPUP_BRIDGE_CALLBACK',
	GiftCodeBrowser = 'GIFT_CODE_BROWSER',
	GuildTemplateBrowser = 'GUILD_TEMPLATE_BROWSER',
	Overlay = 'OVERLAY',
	BrowserHandoff = 'BROWSER_HANDOFF',
	GetImage = 'GET_IMAGE',
	CreateLobby = 'CREATE_LOBBY',
	UpdateLobby = 'UPDATE_LOBBY',
	DeleteLobby = 'DELETE_LOBBY',
	UpdateLobbyMember = 'UPDATE_LOBBY_MEMBER',
	ConnectToLobby = 'CONNECT_TO_LOBBY',
	DisconnectFromLobby = 'DISCONNECT_FROM_LOBBY',
	SendToLobby = 'SEND_TO_LOBBY',
	SearchLobbies = 'SEARCH_LOBBIES',
	ConnectToLobbyVoice = 'CONNECT_TO_LOBBY_VOICE',
	DisconnectFromLobbyVoice = 'DISCONNECT_FROM_LOBBY_VOICE',
	SetOverlayLocked = 'SET_OVERLAY_LOCKED',
	OpenOverlayActivityInvite = 'OPEN_OVERLAY_ACTIVITY_INVITE',
	OpenOverlayGuildInvite = 'OPEN_OVERLAY_GUILD_INVITE',
	OpenOverlayVoiceSettings = 'OPEN_OVERLAY_VOICE_SETTINGS',
	ValidateApplication = 'VALIDATE_APPLICATION',
	GetEntitlementTicket = 'GET_ENTITLEMENT_TICKET',
	GetApplicationTicket = 'GET_APPLICATION_TICKET',
	StartPurchase = 'START_PURCHASE',
	GetSKUS = 'GET_SKUS',
	GetEntitlements = 'GET_ENTITLEMENTS',
	GetNetworkingConfig = 'GET_NETWORKING_CONFIG',
	NetworkingSystemMetrics = 'NETWORKING_SYSTEM_METRICS',
	NetworkingPeerMetrics = 'NETWORKING_PEER_METRICS',
	NetworkingCreateToken = 'NETWORKING_CREATE_TOKEN',
	SetUserAchievement = 'SET_USER_ACHIEVEMENT',
	GetUserAchievements = 'GET_USER_ACHIEVEMENTS',
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
	ActivitySpectate = 'ACTIVITY_SPECTATE',
	ActivityJoinRequest = 'ACTIVITY_JOIN_REQUEST',
	// undocumented events
	CurrentUserUpdate = 'CURRENT_USER_UPDATE',
	RelationshipUpdate = 'RELATIONSHIP_UPDATE',
	VoiceSettingsUpdate2 = 'VOICE_SETTINGS_UPDATE_2',
	GameJoin = 'GAME_JOIN',
	GameSpectate = 'GAME_SPECTATE',
	ActivityInvite = 'ACTIVITY_INVITE',
	LobbyDelete = 'LOBBY_DELETE',
	LobbyUpdate = 'LOBBY_UPDATE',
	LobbyMemberConnect = 'LOBBY_MEMBER_CONNECT',
	LobbyMemberDisconnect = 'LOBBY_MEMBER_DISCONNECT',
	LobbyMemberUpdate = 'LOBBY_MEMBER_UPDATE',
	LobbyMessage = 'LOBBY_MESSAGE',
	CaptureShortcutChange = 'CAPTURE_SHORTCUT_CHANGE',
	Overlay = 'OVERLAY',
	OverlayUpdate = 'OVERLAY_UPDATE',
	EntitlementCreate = 'ENTITLEMENT_CREATE',
	EntitlementDelete = 'ENTITLEMENT_DELETE',
	UserAchievementUpdate = 'USER_ACHIEVEMENT_UPDATE',
}

export enum VoiceConnectionStates {
	Disconnected = 'DISCONNECTED',
	AwaitingEndpoint = 'AWAITING_ENDPOINT',
	Authenticating = 'AUTHENTICATING',
	Connecting = 'CONNECTING',
	Connected = 'CONNECTED',
	VoiceDisconnected = 'VOICE_DISCONNECTED',
	VoiceConnecting = 'VOICE_CONNECTING',
	VoiceConnected = 'VOICE_CONNECTED',
	NoRoute = 'NO_ROUTE',
	IceChecking = 'ICE_CHECKING',
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

export type RPCEventsWithArguments = {
	[K in keyof typeof RPCEvent]: MappedRPCEventsArguments[typeof RPCEvent[K]] extends undefined
		? never
		: typeof RPCEvent[K];
}[keyof typeof RPCEvent];

export interface MappedRPCCommandsArguments<SubscribeEvent extends RPCEventsWithArguments = RPCEventsWithArguments> {
	[RPCCommand.Dispatch]: undefined;
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
	[RPCCommand.Subscribe]: MappedRPCEventsArguments[SubscribeEvent];
	[RPCCommand.Unsubscribe]: MappedRPCEventsArguments[SubscribeEvent];
	[RPCCommand.SetCertifiedDevices]: SetCertifiedDevicesArguments;
	[RPCCommand.SetActivity]: SetActivityArguments;
	[RPCCommand.SendActivityJoinInvite]: SendActivityJoinInviteArguments;
	[RPCCommand.CloseActivityRequest]: CloseActivityRequestArguments;
	[RPCCommand.CreateChannelInvite]: unknown;
	[RPCCommand.GetRelationships]: unknown;
	[RPCCommand.GetUser]: unknown;
	[RPCCommand.SetUserVoiceSettings2]: unknown;
	[RPCCommand.SetVoiceSettings2]: unknown;
	[RPCCommand.CaptureShortcut]: unknown;
	[RPCCommand.CloseActivityJoinRequest]: unknown;
	[RPCCommand.ActivityInviteUser]: unknown;
	[RPCCommand.AcceptActivityInvite]: unknown;
	[RPCCommand.InviteBrowser]: unknown;
	[RPCCommand.DeepLink]: unknown;
	[RPCCommand.ConnectionsCallback]: unknown;
	[RPCCommand.BrainTreePopupBridgeCallback]: unknown;
	[RPCCommand.GiftCodeBrowser]: unknown;
	[RPCCommand.GuildTemplateBrowser]: unknown;
	[RPCCommand.Overlay]: unknown;
	[RPCCommand.BrowserHandoff]: unknown;
	[RPCCommand.GetImage]: unknown;
	[RPCCommand.CreateLobby]: unknown;
	[RPCCommand.UpdateLobby]: unknown;
	[RPCCommand.DeleteLobby]: unknown;
	[RPCCommand.UpdateLobbyMember]: unknown;
	[RPCCommand.ConnectToLobby]: unknown;
	[RPCCommand.DisconnectFromLobby]: unknown;
	[RPCCommand.SendToLobby]: unknown;
	[RPCCommand.SearchLobbies]: unknown;
	[RPCCommand.ConnectToLobbyVoice]: unknown;
	[RPCCommand.DisconnectFromLobbyVoice]: unknown;
	[RPCCommand.SetOverlayLocked]: unknown;
	[RPCCommand.OpenOverlayActivityInvite]: unknown;
	[RPCCommand.OpenOverlayGuildInvite]: unknown;
	[RPCCommand.OpenOverlayVoiceSettings]: unknown;
	[RPCCommand.ValidateApplication]: unknown;
	[RPCCommand.GetEntitlementTicket]: unknown;
	[RPCCommand.GetApplicationTicket]: unknown;
	[RPCCommand.StartPurchase]: unknown;
	[RPCCommand.GetSKUS]: unknown;
	[RPCCommand.GetEntitlements]: unknown;
	[RPCCommand.GetNetworkingConfig]: unknown;
	[RPCCommand.NetworkingSystemMetrics]: unknown;
	[RPCCommand.NetworkingPeerMetrics]: unknown;
	[RPCCommand.NetworkingCreateToken]: unknown;
	[RPCCommand.SetUserAchievement]: unknown;
	[RPCCommand.GetUserAchievements]: unknown;
}

export type RPCArguments =
	| AuthorizeArguments
	| AuthenticateArguments
	| GetGuildArguments
	| GetChannelArguments
	| GetChannelsArguments
	| SetUserVoiceSettingsData
	| SelectVoiceChannelArguments
	| SelectTextChannelArguments
	| GetVoiceSettingsResponseData
	| SetCertifiedDevicesArguments
	| SetActivityArguments
	| SendActivityJoinInviteArguments
	| CloseActivityRequestArguments;

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

export interface AuthorizePayload extends BaseRPCPayload {
	cmd: RPCCommand.Authorize;
	args?: AuthorizeArguments;
	data?: AuthorizeResponseData;
}

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

export interface AuthenticatePayload extends BaseRPCPayload {
	cmd: RPCCommand.Authenticate;
	args?: AuthenticateArguments;
	data?: AuthenticateResponseData;
}

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

export interface GetGuildPayload extends BaseRPCPayload {
	cmd: RPCCommand.GetGuild;
	args?: GetGuildArguments;
	data?: GetGuildResponseData;
}

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

export interface GetChannelPayload extends BaseRPCPayload {
	cmd: RPCCommand.GetChannel;
	args?: GetChannelArguments;
	data?: GetChannelResponseData;
}

export interface GetChannelsArguments {
	guild_id: Snowflake;
}

export interface GetChannelsResponseData {
	channels: Partial<APIGuildChannel<ChannelType>>[];
}

export interface GetChannelsPayload extends BaseRPCPayload {
	cmd: RPCCommand.GetChannels;
	args?: GetChannelsArguments;
	data?: GetChannelsResponseData;
}

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

export interface SetUserVoiceSettingsPayload extends BaseRPCPayload {
	cmd: RPCCommand.SetUserVoiceSettings;
	data?: SetUserVoiceSettingsData;
	args?: SetUserVoiceSettingsData;
}

export interface SelectVoiceChannelArguments {
	channel_id: Snowflake;
	timeout?: number;
	force: boolean;
}

export interface SelectVoiceChannelPayload extends BaseRPCPayload {
	cmd: RPCCommand.SelectVoiceChannel;
	args?: SelectVoiceChannelArguments;
}

export interface GetSelectedVoiceChannelPayload extends BaseRPCPayload {
	cmd: RPCCommand.GetSelectedVoiceChannel;
	data?: GetChannelResponseData;
}

export interface SelectTextChannelArguments {
	channel_id: Snowflake | null;
	timeout?: number;
}

export interface SelectTextChannelPayload extends BaseRPCPayload {
	cmd: RPCCommand.SelectTextChannel;
	args?: SelectTextChannelArguments;
}

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

export interface GetVoiceSettingsPayload extends BaseRPCPayload {
	cmd: RPCCommand.GetVoiceSettings;
	data?: GetVoiceSettingsResponseData;
}

export interface SetVoiceSettingsPayload extends BaseRPCPayload {
	cmd: RPCCommand.SetVoiceSettings;
	data?: GetVoiceSettingsResponseData;
	args?: GetVoiceSettingsResponseData;
}

export interface SubscribeResponseData {
	evt: RPCEvent;
}

export interface SubscribePayload<
	T extends Exclude<RPCEvent, RPCEvent.Ready | RPCEvent.Error> = Exclude<RPCEvent, RPCEvent.Ready | RPCEvent.Error>,
> extends BaseRPCPayload {
	evt: T;
	cmd: RPCCommand.Subscribe;
	args: MappedRPCDispatchData[T];
	data?: SubscribeResponseData;
}

export interface UnsubscribePayload<
	T extends Exclude<RPCEvent, RPCEvent.Ready | RPCEvent.Error> = Exclude<RPCEvent, RPCEvent.Ready | RPCEvent.Error>,
> extends BaseRPCPayload {
	cmd: RPCCommand.Unsubscribe;
	evt: T;
	args: MappedRPCDispatchData[T];
	data?: SubscribeResponseData;
}

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

export interface SetCertifiedDevicesPayload extends BaseRPCPayload {
	cmd: RPCCommand.SetCertifiedDevices;
	args?: SetCertifiedDevicesArguments;
}

export interface SetActivityArguments {
	pid: number;
	activity?: Omit<GatewayActivity, 'name' | 'type' | 'id' | 'created_at'>;
}

export interface SetActivityPayload extends BaseRPCPayload {
	cmd: RPCCommand.SetActivity;
	args?: SetActivityArguments;
}

export interface SendActivityJoinInviteArguments {
	user_id: Snowflake;
}

export interface SendActivityJoinInvitePayload extends BaseRPCPayload {
	cmd: RPCCommand.SendActivityJoinInvite;
	args?: SendActivityJoinInviteArguments;
}

export interface CloseActivityRequestArguments {
	user_id: Snowflake;
}

export interface CloseActivityRequestPayload extends BaseRPCPayload {
	cmd: RPCCommand.CloseActivityRequest;
	args?: CloseActivityRequestArguments;
}

export interface RPCServerConfiguration {
	cdn_host: string;
	api_endpoint: string;
	environment: string;
}

export type RPCDispatchData =
	| ReadyDispatchData
	| ErrorDispatchData
	| GuildStatusDispatchData
	| GuildCreateDispatchData
	| ChannelCreateDispatchData
	| VoiceChannelSelectDispatchData
	| VoiceSettingsUpdateDispatchData
	| VoiceStateCreateDispatchData
	| VoiceStateUpdateDispatchData
	| VoiceStateDeleteDispatchData
	| VoiceConnectionStatusDispatchData
	| MessageCreateDispatchData
	| MessageUpdateDispatchData
	| MessageDeleteDispatchData
	| SpeakingStartDispatchData
	| SpeakingStopDispatchData
	| NotificationCreateDispatchData
	| ActivityJoinDispatchData
	| ActivitySpectateDispatchData
	| ActivityJoinRequestDispatchData;

export interface MappedRPCDispatchData {
	[RPCEvent.Ready]: ReadyDispatchData;
	[RPCEvent.Error]: ErrorDispatchData;
	[RPCEvent.GuildStatus]: GuildStatusDispatchData;
	[RPCEvent.GuildCreate]: GuildCreateDispatchData;
	[RPCEvent.ChannelCreate]: ChannelCreateDispatchData;
	[RPCEvent.VoiceChannelSelect]: VoiceChannelSelectDispatchData;
	[RPCEvent.VoiceSettingsUpdate]: VoiceSettingsUpdateDispatchData;
	[RPCEvent.VoiceStateCreate]: VoiceStateCreateDispatchData;
	[RPCEvent.VoiceStateUpdate]: VoiceStateUpdateDispatchData;
	[RPCEvent.VoiceStateDelete]: VoiceStateDeleteDispatchData;
	[RPCEvent.VoiceConnectionStatus]: VoiceConnectionStatusDispatchData;
	[RPCEvent.MessageCreate]: MessageCreateDispatchData;
	[RPCEvent.MessageUpdate]: MessageUpdateDispatchData;
	[RPCEvent.MessageDelete]: MessageDeleteDispatchData;
	[RPCEvent.SpeakingStart]: SpeakingStartDispatchData;
	[RPCEvent.SpeakingStop]: SpeakingStopDispatchData;
	[RPCEvent.NotificationCreate]: NotificationCreateDispatchData;
	[RPCEvent.ActivityJoin]: ActivityJoinDispatchData;
	[RPCEvent.ActivitySpectate]: ActivitySpectateDispatchData;
	[RPCEvent.ActivityJoinRequest]: ActivityJoinRequestDispatchData;
	[RPCEvent.CurrentUserUpdate]: unknown;
	[RPCEvent.RelationshipUpdate]: unknown;
	[RPCEvent.VoiceSettingsUpdate2]: unknown;
	[RPCEvent.GameJoin]: unknown;
	[RPCEvent.GameSpectate]: unknown;
	[RPCEvent.ActivityInvite]: unknown;
	[RPCEvent.LobbyDelete]: unknown;
	[RPCEvent.LobbyUpdate]: unknown;
	[RPCEvent.LobbyMemberConnect]: unknown;
	[RPCEvent.LobbyMemberDisconnect]: unknown;
	[RPCEvent.LobbyMemberUpdate]: unknown;
	[RPCEvent.LobbyMessage]: unknown;
	[RPCEvent.CaptureShortcutChange]: unknown;
	[RPCEvent.Overlay]: unknown;
	[RPCEvent.OverlayUpdate]: unknown;
	[RPCEvent.EntitlementCreate]: unknown;
	[RPCEvent.EntitlementDelete]: unknown;
	[RPCEvent.UserAchievementUpdate]: unknown;
}

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

export interface GuildCreateDispatchData {
	id: string;
	name: string;
}

export interface ChannelCreateDispatchData {
	id: string;
	name: string;
	type: ChannelType.GuildText | ChannelType.GuildVoice | ChannelType.DM | ChannelType.GroupDM;
}

export interface VoiceChannelSelectDispatchData {
	channel_id: string | null;
	guild_id: string | null;
}

export type VoiceSettingsUpdateDispatchData = GetVoiceSettingsResponseData;

export interface VoiceStateCreateDispatchData {
	voice_state: {
		mute: boolean;
		deaf: boolean;
		self_mute: boolean;
		self_deaf: boolean;
		suppress: boolean;
	};
	user: APIUser;
	nick: string;
	volume: number;
	mute: boolean;
	pan: {
		left: number;
		right: number;
	};
}

export type VoiceStateUpdateDispatchData = VoiceStateCreateDispatchData;

export type VoiceStateDeleteDispatchData = VoiceStateCreateDispatchData;

export interface VoiceConnectionStatusDispatchData {
	state: VoiceConnectionStates;
	hostname: string;
	pings: number[];
	average_ping: number;
	last_ping: number;
}

export type MessageCreateDispatchData = APIMessage;

export type MessageUpdateDispatchData = APIMessage;

export interface MessageDeleteDispatchData {
	id: Snowflake;
}

export interface SpeakingStartDispatchData {
	user_id: Snowflake;
}

export type SpeakingStopDispatchData = SpeakingStartDispatchData;

export interface NotificationCreateDispatchData {
	channel_id: Snowflake;
	message: APIMessage;
	icon_url: string;
	title: string;
	body: string;
}

export interface ActivityJoinDispatchData {
	/**
	 * the [join_secret](https://discord.com/developers/docs/rich-presence/how-to#updating-presence-update-presence-payload-fields) for the given invite
	 */
	secret: string;
}

export interface ActivitySpectateDispatchData {
	/**
	 * the [spectate_secret](https://discord.com/developers/docs/rich-presence/how-to#updating-presence-update-presence-payload-fields) for the given invite
	 */
	secret: string;
}

export interface ActivityJoinRequestDispatchData {
	user: APIUser;
}

export interface MappedRPCEventsArguments {
	[RPCEvent.Ready]: undefined;
	[RPCEvent.Error]: undefined;
	[RPCEvent.GuildStatus]: GuildStatusArguments;
	[RPCEvent.GuildCreate]: undefined;
	[RPCEvent.ChannelCreate]: undefined;
	[RPCEvent.VoiceChannelSelect]: undefined;
	[RPCEvent.VoiceSettingsUpdate]: undefined;
	[RPCEvent.VoiceStateCreate]: VoiceStateCreateArguments;
	[RPCEvent.VoiceStateUpdate]: VoiceStateUpdateArguments;
	[RPCEvent.VoiceStateDelete]: VoiceStateDeleteArguments;
	[RPCEvent.VoiceConnectionStatus]: undefined;
	[RPCEvent.MessageCreate]: MessageCreateArguments;
	[RPCEvent.MessageUpdate]: MessageUpdateArguments;
	[RPCEvent.MessageDelete]: MessageDeleteArguments;
	[RPCEvent.SpeakingStart]: SpeakingStartArguments;
	[RPCEvent.SpeakingStop]: SpeakingStopArguments;
	[RPCEvent.NotificationCreate]: undefined;
	[RPCEvent.ActivityJoin]: undefined;
	[RPCEvent.ActivitySpectate]: undefined;
	[RPCEvent.ActivityJoinRequest]: undefined;
	[RPCEvent.CurrentUserUpdate]: unknown;
	[RPCEvent.RelationshipUpdate]: unknown;
	[RPCEvent.VoiceSettingsUpdate2]: unknown;
	[RPCEvent.GameJoin]: unknown;
	[RPCEvent.GameSpectate]: unknown;
	[RPCEvent.ActivityInvite]: unknown;
	[RPCEvent.LobbyDelete]: unknown;
	[RPCEvent.LobbyUpdate]: unknown;
	[RPCEvent.LobbyMemberConnect]: unknown;
	[RPCEvent.LobbyMemberDisconnect]: unknown;
	[RPCEvent.LobbyMemberUpdate]: unknown;
	[RPCEvent.LobbyMessage]: unknown;
	[RPCEvent.CaptureShortcutChange]: unknown;
	[RPCEvent.Overlay]: unknown;
	[RPCEvent.OverlayUpdate]: unknown;
	[RPCEvent.EntitlementCreate]: unknown;
	[RPCEvent.EntitlementDelete]: unknown;
	[RPCEvent.UserAchievementUpdate]: unknown;
}

export interface GuildStatusArguments {
	guild_id: Snowflake;
}

export interface VoiceStateCreateArguments {
	channel_id: Snowflake;
}

export type VoiceStateUpdateArguments = VoiceStateCreateArguments;

export type VoiceStateDeleteArguments = VoiceStateCreateArguments;

export interface MessageCreateArguments {
	channel_id: Snowflake;
}

export type MessageUpdateArguments = MessageCreateArguments;

export type MessageDeleteArguments = MessageCreateArguments;

export interface SpeakingStartArguments {
	channel_id: Snowflake;
}

export type SpeakingStopArguments = SpeakingStartArguments;

export type RESTPostOAuth2RPCClientCredentialsResult = Omit<RESTPostOAuth2ClientCredentialsResult, 'access_token'> & {
	rpc_token: string;
};
