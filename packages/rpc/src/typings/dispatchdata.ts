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
	[RPCEvents.VoiceChannelEffectToggleAnimationType]: undefined;
	[RPCEvents.ThermalStateUpdate]: undefined;
}

export interface ReadyDispatchData {
	config: RPCServerConfiguration;
	user: Partial<APIUser>;
	v: number;
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
	type: ChannelType.DM | ChannelType.GroupDM | ChannelType.GuildText | ChannelType.GuildVoice;
}

export interface VoiceChannelSelectDispatchData {
	channel_id: string | null;
	guild_id: string | null;
}

export type VoiceSettingsUpdateDispatchData = GetVoiceSettingsPayloadData;

export interface VoiceStateCreateDispatchData {
	mute: boolean;
	nick: string;
	pan: {
		left: number;
		right: number;
	};
	user: APIUser;
	voice_state: {
		deaf: boolean;
		mute: boolean;
		self_deaf: boolean;
		self_mute: boolean;
		suppress: boolean;
	};
	volume: number;
}

export type VoiceStateUpdateDispatchData = VoiceStateCreateDispatchData;

export type VoiceStateDeleteDispatchData = VoiceStateCreateDispatchData;

export interface VoiceConnectionStatusDispatchData {
	average_ping: number;
	hostname: string;
	last_ping: number;
	pings: number[];
	state: VoiceConnectionStates;
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
	body: string;
	channel_id: Snowflake;
	icon_url: string;
	message: APIMessage;
	title: string;
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
