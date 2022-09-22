import type {
	AuthorizeArguments,
	AuthenticateArguments,
	GetGuildArguments,
	GetChannelArguments,
	SelectVoiceChannelArguments,
	SelectTextChannelArguments,
	SetCertifiedDevicesArguments,
	SetActivityArguments,
	SendActivityJoinInviteArguments,
	CloseActivityRequestArguments,
	GetChannelsArguments,
} from './arguments';
import type { RPCDispatchData, MappedRPCDispatchData } from './dispatchdata';
import type {
	AuthorizePayloadData,
	AuthenticatePayloadData,
	GetGuildPayloadData,
	GetGuildsPayloadData,
	GetChannelPayloadData,
	GetChannelsPayloadData,
	GetVoiceSettingsPayloadData,
	SubscribePayloadData,
} from './payloaddata';
import type { SetUserVoiceSettingsData } from './structs';
import type { RPCCommands, RPCEvents } from './types';

export type RPCPayload = BaseRPCServerResponsePayload | RPCCommandPayload | RPCSubscribedRequestPayload;

export interface BaseRPCPayload {
	cmd: RPCCommands;
}

// NOTE: this doesn't seem to be used anywhere
export interface RPCCommandResponsePayload extends BaseRPCPayload {
	nonce: string;
}

// ----- BEGIN RPC COMMAND RESPONSE TYPES -----

export type RPCResponsePayload =
	| RPCAuthenticateResponsePayload
	| RPCAuthorizeResponsePayload
	| RPCCloseActivityRequestResponsePayload
	| RPCGetChannelResponsePayload
	| RPCGetChannelsResponsePayload
	| RPCGetGuildResponsePayload
	| RPCGetGuildsResponsePayload
	| RPCGetVoiceSettingsResponsePayload
	| RPCSelectVoiceChannelResponsePayload
	| RPCSendActivityJoinInviteResponsePayload
	| RPCSetActivityResponsePayload
	| RPCSetCertifiedDevicesResponsePayload
	| RPCSetUserVoiceSettingsResponsePayload
	| RPCSetVoiceSettingsResponsePayload;

export interface BaseRPCServerResponsePayload extends BaseRPCPayload {
	evt?: RPCEvents;
	nonce: string;
}

export interface RPCAuthorizeResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommands.Authorize;
	data: AuthorizePayloadData;
}

export interface RPCAuthenticateResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommands.Authenticate;
	data: AuthenticatePayloadData;
}

export interface RPCGetGuildResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommands.GetGuild;
	data: GetGuildPayloadData;
}

export interface RPCGetGuildsResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommands.GetGuilds;
	data: GetGuildsPayloadData;
}

export interface RPCGetChannelResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommands.GetChannel;
	data: GetChannelPayloadData;
}

export interface RPCGetChannelsResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommands.GetChannels;
	data: GetChannelsPayloadData;
}

export interface RPCSetUserVoiceSettingsResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommands.SetUserVoiceSettings;
	data: SetUserVoiceSettingsData;
}

export interface RPCSelectVoiceChannelResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommands.SelectVoiceChannel;
	data: undefined;
}

export interface RPCSelectTextChannelResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommands.SelectTextChannel;
	data: undefined;
}

export interface RPCGetVoiceSettingsResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommands.GetVoiceSettings;
	data: GetVoiceSettingsPayloadData;
}

export interface RPCSetVoiceSettingsResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommands.SetVoiceSettings;
	data: GetVoiceSettingsPayloadData;
}

export interface RPCSetCertifiedDevicesResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommands.SetCertifiedDevices;
	data: undefined;
}

export interface RPCSetActivityResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommands.SetActivity;
	data: undefined;
}

export interface RPCSendActivityJoinInviteResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommands.SendActivityJoinInvite;
	data: undefined;
}

export interface RPCCloseActivityRequestResponsePayload extends BaseRPCServerResponsePayload {
	cmd: RPCCommands.CloseActivityRequest;
	data: undefined;
}

// ----- END RPC COMMAND RESPONSE TYPES -----

// ----- BEGIN RPC COMMAND REQUEST TYPES -----

export type RPCCommandPayload =
	| RPCAuthenticateCommandRequestPayload
	| RPCAuthorizeCommandRequestPayload
	| RPCCloseActivityRequestCommandRequestPayload
	| RPCGetChannelCommandRequestPayload
	| RPCGetChannelsCommandRequestPayload
	| RPCGetGuildCommandRequestPayload
	| RPCGetGuildsCommandRequestPayload
	| RPCGetVoiceSettingsCommandRequestPayload
	| RPCSelectVoiceChannelCommandRequestPayload
	| RPCSendActivityJoinInviteCommandRequestPayload
	| RPCSetActivityCommandRequestPayload
	| RPCSetCertifiedDevicesCommandRequestPayload
	| RPCSetUserVoiceSettingsCommandRequestPayload
	| RPCSetVoiceSettingsCommandRequestPayload;

export interface RPCAuthorizeCommandRequestPayload {
	args: AuthorizeArguments;
	cmd: RPCCommands.Authorize;
}

export interface RPCAuthenticateCommandRequestPayload {
	args: AuthenticateArguments;
	cmd: RPCCommands.Authenticate;
}

export interface RPCGetGuildCommandRequestPayload {
	args: GetGuildArguments;
	cmd: RPCCommands.GetGuild;
}

export interface RPCGetGuildsCommandRequestPayload {
	args: undefined;
	cmd: RPCCommands.GetGuilds;
}

export interface RPCGetChannelCommandRequestPayload {
	args: GetChannelArguments;
	cmd: RPCCommands.GetChannel;
}

export interface RPCGetChannelsCommandRequestPayload {
	args: GetChannelArguments;
	cmd: RPCCommands.GetChannels;
}

export interface RPCSetUserVoiceSettingsCommandRequestPayload {
	args: SetUserVoiceSettingsData;
	cmd: RPCCommands.SetUserVoiceSettings;
}

export interface RPCSelectVoiceChannelCommandRequestPayload {
	args: SelectVoiceChannelArguments;
	cmd: RPCCommands.SelectVoiceChannel;
}

export interface RPCGetSelectedVoiceChannelCommandRequestPayload {
	args: undefined;
	cmd: RPCCommands.GetSelectedVoiceChannel;
}

export interface RPCSelectTextChannelCommandRequestPayload {
	args: SelectTextChannelArguments;
	cmd: RPCCommands.SelectTextChannel;
}

export interface RPCGetVoiceSettingsCommandRequestPayload {
	args: undefined;
	cmd: RPCCommands.GetVoiceSettings;
}

export interface RPCSetVoiceSettingsCommandRequestPayload {
	args: GetVoiceSettingsPayloadData;
	cmd: RPCCommands.SetVoiceSettings;
}

export interface RPCSetCertifiedDevicesCommandRequestPayload {
	args: SetCertifiedDevicesArguments;
	cmd: RPCCommands.SetCertifiedDevices;
}

export interface RPCSetActivityCommandRequestPayload {
	args: SetActivityArguments;
	cmd: RPCCommands.SetActivity;
}

export interface RPCSendActivityJoinInviteCommandRequestPayload {
	args: SendActivityJoinInviteArguments;
	cmd: RPCCommands.SendActivityJoinInvite;
}

export interface RPCCloseActivityRequestCommandRequestPayload {
	args: CloseActivityRequestArguments;
	cmd: RPCCommands.CloseActivityRequest;
}

export interface RPCSubscribedRequestPayload extends BaseRPCPayload {
	evt: RPCEvents;
}

export interface DispatchRPCRequestPayload extends BaseRPCPayload {
	cmd: RPCCommands.Dispatch;
	data: RPCDispatchData;
	evt: RPCEvents;
}

export interface AuthorizeRequestPayload extends BaseRPCPayload {
	args?: AuthorizeArguments;
	cmd: RPCCommands.Authorize;
	data?: AuthorizePayloadData;
}

export interface AuthenticateRequestPayload extends BaseRPCPayload {
	args?: AuthenticateArguments;
	cmd: RPCCommands.Authenticate;
	data?: AuthenticatePayloadData;
}

export interface GetGuildsRequestPayload extends Omit<BaseRPCPayload, 'args'> {
	cmd: RPCCommands.GetGuilds;
	data?: GetGuildPayloadData;
}

export interface GetGuildRequestPayload extends BaseRPCPayload {
	args?: GetGuildArguments;
	cmd: RPCCommands.GetGuild;
	data?: GetGuildPayloadData;
}

export interface GetChannelRequestPayload extends BaseRPCPayload {
	args?: GetChannelArguments;
	cmd: RPCCommands.GetChannel;
	data?: GetChannelPayloadData;
}

export interface GetChannelsRequestPayload extends BaseRPCPayload {
	args?: GetChannelsArguments;
	cmd: RPCCommands.GetChannels;
	data?: GetChannelsPayloadData;
}

export interface SetUserVoiceSettingsRequestPayload extends BaseRPCPayload {
	args?: SetUserVoiceSettingsData;
	cmd: RPCCommands.SetUserVoiceSettings;
	data?: SetUserVoiceSettingsData;
}

export interface SelectVoiceChannelRequestPayload extends BaseRPCPayload {
	args?: SelectVoiceChannelArguments;
	cmd: RPCCommands.SelectVoiceChannel;
}

export interface GetSelectedVoiceChannelRequestPayload extends BaseRPCPayload {
	cmd: RPCCommands.GetSelectedVoiceChannel;
	data?: GetChannelPayloadData;
}

export interface SelectTextChannelRequestPayload extends BaseRPCPayload {
	args?: SelectTextChannelArguments;
	cmd: RPCCommands.SelectTextChannel;
}

export interface GetVoiceSettingsRequestPayload extends BaseRPCPayload {
	cmd: RPCCommands.GetVoiceSettings;
	data?: GetVoiceSettingsPayloadData;
}

export interface SetVoiceSettingsRequestPayload extends BaseRPCPayload {
	args?: GetVoiceSettingsPayloadData;
	cmd: RPCCommands.SetVoiceSettings;
	data?: GetVoiceSettingsPayloadData;
}

export interface SubscribeRequestPayload<
	T extends Exclude<RPCEvents, RPCEvents.Error | RPCEvents.Ready> = Exclude<
		RPCEvents,
		RPCEvents.Error | RPCEvents.Ready
	>,
> extends BaseRPCPayload {
	args: MappedRPCDispatchData[T];
	cmd: RPCCommands.Subscribe;
	data?: SubscribePayloadData;
	evt: T;
}

export interface UnsubscribeRequestPayload<
	T extends Exclude<RPCEvents, RPCEvents.Error | RPCEvents.Ready> = Exclude<
		RPCEvents,
		RPCEvents.Error | RPCEvents.Ready
	>,
> extends BaseRPCPayload {
	args: MappedRPCDispatchData[T];
	cmd: RPCCommands.Unsubscribe;
	data?: SubscribePayloadData;
	evt: T;
}

export interface SetCertifiedDevicesRequestPayload extends BaseRPCPayload {
	args?: SetCertifiedDevicesArguments;
	cmd: RPCCommands.SetCertifiedDevices;
}

export interface SetActivityRequestPayload extends BaseRPCPayload {
	args?: SetActivityArguments;
	cmd: RPCCommands.SetActivity;
}

export interface SendActivityJoinInviteRequestPayload extends BaseRPCPayload {
	args?: SendActivityJoinInviteArguments;
	cmd: RPCCommands.SendActivityJoinInvite;
}

export interface CloseActivityRequestPayload extends BaseRPCPayload {
	args?: CloseActivityRequestArguments;
	cmd: RPCCommands.CloseActivityRequest;
}

// ----- END RPC COMMAND REQUEST TYPES -----

// ----- BEGIN RPC EVENT PAYLOADS -----

export interface RPCEventPayload<T extends RPCEvents = RPCEvents> {
	cmd: RPCCommands;
	data: MappedRPCDispatchData[T];
	evt: T;
	nonce: string;
}

export type RPCClientEvents = {
	[K in RPCEvents]: [RPCEventPayload<K>['data']];
} & {
	connected: [];
	disconnected: [];
};

// ----- END RPC EVENT PAYLOADS -----
