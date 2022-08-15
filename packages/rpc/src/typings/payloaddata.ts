import type {
	APIUser,
	OAuth2Scopes,
	APIGuild,
	Snowflake,
	APIGuildMember,
	ChannelType,
	GatewayVoiceState,
	APIMessage,
	APIGuildChannel,
} from 'discord.js';
import type {
	RPCOAuthApplication,
	SetUserVoiceSettingsData,
	VoiceSettingsInput,
	VoiceSettingsMode,
	VoiceSettingsOutput,
} from './structs';
import type { RPCEvents } from './types';

export type RPCPayloadData =
	| AuthorizePayloadData
	| AuthenticatePayloadData
	| GetGuildsPayloadData
	| GetGuildPayloadData
	| GetChannelPayloadData
	| GetChannelsPayloadData
	| SetUserVoiceSettingsData;

export interface AuthorizePayloadData {
	code: string;
}

export interface AuthenticatePayloadData {
	user: Partial<APIUser>;
	scopes: OAuth2Scopes[];
	expires: string;
	application: RPCOAuthApplication;
}

export interface GetGuildsPayloadData {
	guilds: Partial<APIGuild>[];
}

export interface GetGuildPayloadData {
	id: Snowflake;
	name: string;
	icon_url: string;
	members: Partial<APIGuildMember>[];
}

export interface GetChannelPayloadData {
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

export interface GetChannelsPayloadData {
	channels: Partial<APIGuildChannel<ChannelType>>[];
}

export interface GetVoiceSettingsPayloadData {
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

export interface SubscribePayloadData {
	evt: RPCEvents;
}
