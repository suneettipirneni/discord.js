import type { APIUser, Snowflake, ChannelType, APIMessage } from 'discord.js';
import type { GetVoiceSettingsPayloadData } from './payloaddata';
import type { RPCServerConfiguration } from './structs';
import type { RPCEvents, VoiceConnectionStates } from './types';

export type RPCDispatchData = MappedRPCDispatchData[keyof MappedRPCDispatchData];

export interface MappedRPCDispatchData {
	[RPCEvents.Ready]: ReadyDispatchData;
	[RPCEvents.Error]: ErrorDispatchData;
	[RPCEvents.GuildStatus]: GuildStatusDispatchData;
	[RPCEvents.GuildCreate]: GuildCreateDispatchData;
	[RPCEvents.ChannelCreate]: ChannelCreateDispatchData;
	[RPCEvents.VoiceChannelSelect]: VoiceChannelSelectDispatchData;
	[RPCEvents.VoiceSettingsUpdate]: VoiceSettingsUpdateDispatchData;
	[RPCEvents.VoiceStateCreate]: VoiceStateCreateDispatchData;
	[RPCEvents.VoiceStateUpdate]: VoiceStateUpdateDispatchData;
	[RPCEvents.VoiceStateDelete]: VoiceStateDeleteDispatchData;
	[RPCEvents.VoiceConnectionStatus]: VoiceConnectionStatusDispatchData;
	[RPCEvents.MessageCreate]: MessageCreateDispatchData;
	[RPCEvents.MessageUpdate]: MessageUpdateDispatchData;
	[RPCEvents.MessageDelete]: MessageDeleteDispatchData;
	[RPCEvents.SpeakingStart]: SpeakingStartDispatchData;
	[RPCEvents.SpeakingStop]: SpeakingStopDispatchData;
	[RPCEvents.NotificationCreate]: NotificationCreateDispatchData;
	[RPCEvents.ActivityJoin]: ActivityJoinDispatchData;
	[RPCEvents.ActivitySpectate]: ActivitySpectateDispatchData;
	[RPCEvents.ActivityJoinRequest]: ActivityJoinRequestDispatchData;
	[RPCEvents.CurrentUserUpdate]: undefined;
	[RPCEvents.RelationshipUpdate]: undefined;
	[RPCEvents.VoiceSettingsUpdate2]: undefined;
	[RPCEvents.GameJoin]: undefined;
	[RPCEvents.GameSpectate]: undefined;
	[RPCEvents.ActivityInvite]: undefined;
	[RPCEvents.LobbyDelete]: undefined;
	[RPCEvents.LobbyUpdate]: undefined;
	[RPCEvents.LobbyMemberConnect]: undefined;
	[RPCEvents.LobbyMemberDisconnect]: undefined;
	[RPCEvents.LobbyMemberUpdate]: undefined;
	[RPCEvents.LobbyMessage]: undefined;
	[RPCEvents.CaptureShortcutChange]: undefined;
	[RPCEvents.Overlay]: undefined;
	[RPCEvents.OverlayUpdate]: undefined;
	[RPCEvents.EntitlementCreate]: undefined;
	[RPCEvents.EntitlementDelete]: undefined;
	[RPCEvents.UserAchievementUpdate]: undefined;
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

export type VoiceSettingsUpdateDispatchData = GetVoiceSettingsPayloadData;

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
