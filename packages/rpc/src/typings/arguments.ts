import type { OAuth2Scopes, Snowflake, GatewayActivity } from 'discord.js';
import type { GetVoiceSettingsPayloadData } from './payloaddata';
import type { SetUserVoiceSettingsData, Device } from './structs';
import type { RPCCommands, RPCEvents } from './types';

// TODO: rename types to better differentiate arguments between Events and Commands

// ----- BEGIN RPC COMMAND ARGUMENTS TYPES -----

export type RPCEventsWithArguments = {
	[K in keyof typeof RPCEvents]: MappedRPCEventsArguments[typeof RPCEvents[K]] extends undefined
		? never
		: typeof RPCEvents[K];
}[keyof typeof RPCEvents];

export interface MappedRPCCommandsArguments<SubscribeEvent extends RPCEventsWithArguments = RPCEventsWithArguments> {
	[RPCCommands.Dispatch]: undefined;
	[RPCCommands.Authorize]: AuthorizeArguments;
	[RPCCommands.Authenticate]: AuthenticateArguments;
	[RPCCommands.GetGuild]: GetGuildArguments;
	[RPCCommands.GetGuilds]: undefined;
	[RPCCommands.GetChannel]: GetChannelArguments;
	[RPCCommands.GetChannels]: GetChannelsArguments;
	[RPCCommands.SetUserVoiceSettings]: SetUserVoiceSettingsData;
	[RPCCommands.SelectVoiceChannel]: SelectVoiceChannelArguments;
	[RPCCommands.GetSelectedVoiceChannel]: undefined;
	[RPCCommands.SelectTextChannel]: SelectTextChannelArguments;
	[RPCCommands.GetVoiceSettings]: undefined;
	[RPCCommands.SetVoiceSettings]: GetVoiceSettingsPayloadData;
	[RPCCommands.Subscribe]: MappedRPCEventsArguments[SubscribeEvent];
	[RPCCommands.Unsubscribe]: MappedRPCEventsArguments[SubscribeEvent];
	[RPCCommands.SetCertifiedDevices]: SetCertifiedDevicesArguments;
	[RPCCommands.SetActivity]: SetActivityArguments;
	[RPCCommands.SendActivityJoinInvite]: SendActivityJoinInviteArguments;
	[RPCCommands.CloseActivityRequest]: CloseActivityRequestArguments;
	[RPCCommands.CreateChannelInvite]: unknown;
	[RPCCommands.GetRelationships]: unknown;
	[RPCCommands.GetUser]: unknown;
	[RPCCommands.SetUserVoiceSettings2]: unknown;
	[RPCCommands.SetVoiceSettings2]: unknown;
	[RPCCommands.CaptureShortcut]: unknown;
	[RPCCommands.CloseActivityJoinRequest]: unknown;
	[RPCCommands.ActivityInviteUser]: unknown;
	[RPCCommands.AcceptActivityInvite]: unknown;
	[RPCCommands.InviteBrowser]: unknown;
	[RPCCommands.DeepLink]: unknown;
	[RPCCommands.ConnectionsCallback]: unknown;
	[RPCCommands.BrainTreePopupBridgeCallback]: unknown;
	[RPCCommands.GiftCodeBrowser]: unknown;
	[RPCCommands.GuildTemplateBrowser]: unknown;
	[RPCCommands.Overlay]: unknown;
	[RPCCommands.BrowserHandoff]: unknown;
	[RPCCommands.GetImage]: unknown;
	[RPCCommands.CreateLobby]: unknown;
	[RPCCommands.UpdateLobby]: unknown;
	[RPCCommands.DeleteLobby]: unknown;
	[RPCCommands.UpdateLobbyMember]: unknown;
	[RPCCommands.ConnectToLobby]: unknown;
	[RPCCommands.DisconnectFromLobby]: unknown;
	[RPCCommands.SendToLobby]: unknown;
	[RPCCommands.SearchLobbies]: unknown;
	[RPCCommands.ConnectToLobbyVoice]: unknown;
	[RPCCommands.DisconnectFromLobbyVoice]: unknown;
	[RPCCommands.SetOverlayLocked]: unknown;
	[RPCCommands.OpenOverlayActivityInvite]: unknown;
	[RPCCommands.OpenOverlayGuildInvite]: unknown;
	[RPCCommands.OpenOverlayVoiceSettings]: unknown;
	[RPCCommands.ValidateApplication]: unknown;
	[RPCCommands.GetEntitlementTicket]: unknown;
	[RPCCommands.GetApplicationTicket]: unknown;
	[RPCCommands.StartPurchase]: unknown;
	[RPCCommands.GetSKUS]: unknown;
	[RPCCommands.GetEntitlements]: unknown;
	[RPCCommands.GetNetworkingConfig]: unknown;
	[RPCCommands.NetworkingSystemMetrics]: unknown;
	[RPCCommands.NetworkingPeerMetrics]: unknown;
	[RPCCommands.NetworkingCreateToken]: unknown;
	[RPCCommands.SetUserAchievement]: unknown;
	[RPCCommands.GetUserAchievements]: unknown;
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
	| GetVoiceSettingsPayloadData
	| SetCertifiedDevicesArguments
	| SetActivityArguments
	| SendActivityJoinInviteArguments
	| CloseActivityRequestArguments;

export interface AuthorizeArguments {
	scopes: OAuth2Scopes[];
	client_id: string;
	rpc_token: string;
	username: string;
}

export interface AuthenticateArguments {
	access_token: string;
}

export interface GetGuildArguments {
	guild_id: Snowflake;
	timeout?: number;
}

export interface GetChannelArguments {
	channel_id: Snowflake;
}

export interface GetChannelsArguments {
	guild_id: Snowflake;
}

export interface SelectVoiceChannelArguments {
	channel_id: Snowflake;
	timeout?: number;
	force: boolean;
}

export interface SelectTextChannelArguments {
	channel_id: Snowflake | null;
	timeout?: number;
}

export interface SetCertifiedDevicesArguments {
	devices: Device[];
}

export interface SetActivityArguments {
	pid: number;
	activity?: Omit<GatewayActivity, 'name' | 'type' | 'id' | 'created_at'>;
}

export interface SendActivityJoinInviteArguments {
	user_id: Snowflake;
}

export interface CloseActivityRequestArguments {
	user_id: Snowflake;
}

// ----- END RPC COMMAND ARGUMENTS TYPES -----

// ----- BEGIN RPC EVENT ARGUMENTS TYPES -----

export interface MappedRPCEventsArguments {
	[RPCEvents.Ready]: undefined;
	[RPCEvents.Error]: undefined;
	[RPCEvents.GuildStatus]: GuildStatusArguments;
	[RPCEvents.GuildCreate]: undefined;
	[RPCEvents.ChannelCreate]: undefined;
	[RPCEvents.VoiceChannelSelect]: undefined;
	[RPCEvents.VoiceSettingsUpdate]: undefined;
	[RPCEvents.VoiceStateCreate]: VoiceStateCreateArguments;
	[RPCEvents.VoiceStateUpdate]: VoiceStateUpdateArguments;
	[RPCEvents.VoiceStateDelete]: VoiceStateDeleteArguments;
	[RPCEvents.VoiceConnectionStatus]: undefined;
	[RPCEvents.MessageCreate]: MessageCreateArguments;
	[RPCEvents.MessageUpdate]: MessageUpdateArguments;
	[RPCEvents.MessageDelete]: MessageDeleteArguments;
	[RPCEvents.SpeakingStart]: SpeakingStartArguments;
	[RPCEvents.SpeakingStop]: SpeakingStopArguments;
	[RPCEvents.NotificationCreate]: undefined;
	[RPCEvents.ActivityJoin]: undefined;
	[RPCEvents.ActivitySpectate]: undefined;
	[RPCEvents.ActivityJoinRequest]: undefined;
	[RPCEvents.CurrentUserUpdate]: unknown;
	[RPCEvents.RelationshipUpdate]: unknown;
	[RPCEvents.VoiceSettingsUpdate2]: unknown;
	[RPCEvents.GameJoin]: unknown;
	[RPCEvents.GameSpectate]: unknown;
	[RPCEvents.ActivityInvite]: unknown;
	[RPCEvents.LobbyDelete]: unknown;
	[RPCEvents.LobbyUpdate]: unknown;
	[RPCEvents.LobbyMemberConnect]: unknown;
	[RPCEvents.LobbyMemberDisconnect]: unknown;
	[RPCEvents.LobbyMemberUpdate]: unknown;
	[RPCEvents.LobbyMessage]: unknown;
	[RPCEvents.CaptureShortcutChange]: unknown;
	[RPCEvents.Overlay]: unknown;
	[RPCEvents.OverlayUpdate]: unknown;
	[RPCEvents.EntitlementCreate]: unknown;
	[RPCEvents.EntitlementDelete]: unknown;
	[RPCEvents.UserAchievementUpdate]: unknown;
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

// ----- END RPC EVENT ARGUMENTS TYPES -----
