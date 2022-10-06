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
	| AuthenticatePayloadData
	| AuthorizePayloadData
	| GetChannelPayloadData
	| GetChannelsPayloadData
	| GetGuildPayloadData
	| GetGuildsPayloadData
	| SetUserVoiceSettingsData;

export interface AuthorizePayloadData {
	code: string;
}

export interface AuthenticatePayloadData {
	application: RPCOAuthApplication;
	expires: string;
	scopes: OAuth2Scopes[];
	user: Partial<APIUser>;
}

export interface GetGuildsPayloadData {
	guilds: Partial<APIGuild>[];
}

export interface GetGuildPayloadData {
	icon_url: string;
	id: Snowflake;
	members: Partial<APIGuildMember>[];
	name: string;
}

export interface GetChannelPayloadData {
	bitrate: number;
	guild_id: Snowflake;
	id: Snowflake;
	messages: APIMessage[];
	name: string;
	position: number;
	topic: string;
	type: ChannelType;
	user_limit: number;
	voice_states: GatewayVoiceState[];
}

export interface GetChannelsPayloadData {
	channels: Partial<APIGuildChannel<ChannelType>>[];
}

export interface GetVoiceSettingsPayloadData {
	automatic_gain_control: boolean;
	deaf: boolean;
	echo_cancellation: boolean;
	input: VoiceSettingsInput;
	mode: VoiceSettingsMode;
	mute: boolean;
	noise_suppression: boolean;
	output: VoiceSettingsOutput;
	qos: boolean;
	silence_warning: boolean;
}

export interface SubscribePayloadData {
	evt: RPCEvents;
}
