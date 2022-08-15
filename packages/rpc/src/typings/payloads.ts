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

export type RPCPayload = RPCCommandPayload | RPCSubscribedRequestPayload | BaseRPCServerResponsePayload;

export interface BaseRPCPayload {
	cmd: RPCCommands;
}

// NOTE: this doesn't seem to be used anywhere
export interface RPCCommandResponsePayload extends BaseRPCPayload {
	nonce: string;
}

// ----- BEGIN RPC RESPONSE TYPES -----

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

export interface BaseRPCServerResponsePayload extends BaseRPCPayload {
	args: never;
	evt?: RPCEvents;
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

// ----- END RPC RESPONSE TYPES -----

// ----- BEGIN RPC REQUEST TYPES -----

export type RPCCommandPayload =
	| RPCAuthorizeCommandRequestPayload
	| RPCAuthenticateCommandRequestPayload
	| RPCGetGuildCommandRequestPayload
	| RPCGetGuildsCommandRequestPayload
	| RPCGetChannelCommandRequestPayload
	| RPCGetChannelsCommandRequestPayload
	| RPCSetUserVoiceSettingsCommandRequestPayload
	| RPCSelectVoiceChannelCommandRequestPayload
	| RPCGetVoiceSettingsCommandRequestPayload
	| RPCSetVoiceSettingsCommandRequestPayload
	| RPCSetCertifiedDevicesCommandRequestPayload
	| RPCSetActivityCommandRequestPayload
	| RPCSendActivityJoinInviteCommandRequestPayload
	| RPCCloseActivityRequestCommandRequestPayload;

export interface RPCAuthorizeCommandRequestPayload {
	cmd: RPCCommands.Authorize;
	args: AuthorizeArguments;
}

export interface RPCAuthenticateCommandRequestPayload {
	cmd: RPCCommands.Authenticate;
	args: AuthenticateArguments;
}

export interface RPCGetGuildCommandRequestPayload {
	cmd: RPCCommands.GetGuild;
	args: GetGuildArguments;
}

export interface RPCGetGuildsCommandRequestPayload {
	cmd: RPCCommands.GetGuilds;
	args: undefined;
}

export interface RPCGetChannelCommandRequestPayload {
	cmd: RPCCommands.GetChannel;
	args: GetChannelArguments;
}

export interface RPCGetChannelsCommandRequestPayload {
	cmd: RPCCommands.GetChannels;
	args: GetChannelArguments;
}

export interface RPCSetUserVoiceSettingsCommandRequestPayload {
	cmd: RPCCommands.SetUserVoiceSettings;
	args: SetUserVoiceSettingsData;
}

export interface RPCSelectVoiceChannelCommandRequestPayload {
	cmd: RPCCommands.SelectVoiceChannel;
	args: SelectVoiceChannelArguments;
}

export interface RPCGetSelectedVoiceChannelCommandRequestPayload {
	cmd: RPCCommands.GetSelectedVoiceChannel;
	args: undefined;
}

export interface RPCSelectTextChannelCommandRequestPayload {
	cmd: RPCCommands.SelectTextChannel;
	args: SelectTextChannelArguments;
}

export interface RPCGetVoiceSettingsCommandRequestPayload {
	cmd: RPCCommands.GetVoiceSettings;
	args: undefined;
}

export interface RPCSetVoiceSettingsCommandRequestPayload {
	cmd: RPCCommands.SetVoiceSettings;
	args: GetVoiceSettingsPayloadData;
}

export interface RPCSetCertifiedDevicesCommandRequestPayload {
	cmd: RPCCommands.SetCertifiedDevices;
	args: SetCertifiedDevicesArguments;
}

export interface RPCSetActivityCommandRequestPayload {
	cmd: RPCCommands.SetActivity;
	args: SetActivityArguments;
}

export interface RPCSendActivityJoinInviteCommandRequestPayload {
	cmd: RPCCommands.SendActivityJoinInvite;
	args: SendActivityJoinInviteArguments;
}

export interface RPCCloseActivityRequestCommandRequestPayload {
	cmd: RPCCommands.CloseActivityRequest;
	args: CloseActivityRequestArguments;
}

export interface RPCSubscribedRequestPayload extends BaseRPCPayload {
	evt: RPCEvents;
}

export interface DispatchRPCRequestPayload extends BaseRPCPayload {
	cmd: RPCCommands.Dispatch;
	evt: RPCEvents;
	data: RPCDispatchData;
}

export interface AuthorizeRequestPayload extends BaseRPCPayload {
	cmd: RPCCommands.Authorize;
	args?: AuthorizeArguments;
	data?: AuthorizePayloadData;
}

export interface AuthenticateRequestPayload extends BaseRPCPayload {
	cmd: RPCCommands.Authenticate;
	args?: AuthenticateArguments;
	data?: AuthenticatePayloadData;
}

export interface GetGuildsRequestPayload extends Omit<BaseRPCPayload, 'args'> {
	cmd: RPCCommands.GetGuilds;
	data?: GetGuildPayloadData;
}

export interface GetGuildRequestPayload extends BaseRPCPayload {
	cmd: RPCCommands.GetGuild;
	args?: GetGuildArguments;
	data?: GetGuildPayloadData;
}

export interface GetChannelRequestPayload extends BaseRPCPayload {
	cmd: RPCCommands.GetChannel;
	args?: GetChannelArguments;
	data?: GetChannelPayloadData;
}

export interface GetChannelsRequestPayload extends BaseRPCPayload {
	cmd: RPCCommands.GetChannels;
	args?: GetChannelsArguments;
	data?: GetChannelsPayloadData;
}

export interface SetUserVoiceSettingsRequestPayload extends BaseRPCPayload {
	cmd: RPCCommands.SetUserVoiceSettings;
	data?: SetUserVoiceSettingsData;
	args?: SetUserVoiceSettingsData;
}

export interface SelectVoiceChannelRequestPayload extends BaseRPCPayload {
	cmd: RPCCommands.SelectVoiceChannel;
	args?: SelectVoiceChannelArguments;
}

export interface GetSelectedVoiceChannelRequestPayload extends BaseRPCPayload {
	cmd: RPCCommands.GetSelectedVoiceChannel;
	data?: GetChannelPayloadData;
}

export interface SelectTextChannelRequestPayload extends BaseRPCPayload {
	cmd: RPCCommands.SelectTextChannel;
	args?: SelectTextChannelArguments;
}

export interface GetVoiceSettingsRequestPayload extends BaseRPCPayload {
	cmd: RPCCommands.GetVoiceSettings;
	data?: GetVoiceSettingsPayloadData;
}

export interface SetVoiceSettingsRequestPayload extends BaseRPCPayload {
	cmd: RPCCommands.SetVoiceSettings;
	data?: GetVoiceSettingsPayloadData;
	args?: GetVoiceSettingsPayloadData;
}

export interface SubscribeRequestPayload<
	T extends Exclude<RPCEvents, RPCEvents.Ready | RPCEvents.Error> = Exclude<
		RPCEvents,
		RPCEvents.Ready | RPCEvents.Error
	>,
> extends BaseRPCPayload {
	evt: T;
	cmd: RPCCommands.Subscribe;
	args: MappedRPCDispatchData[T];
	data?: SubscribePayloadData;
}

export interface UnsubscribeRequestPayload<
	T extends Exclude<RPCEvents, RPCEvents.Ready | RPCEvents.Error> = Exclude<
		RPCEvents,
		RPCEvents.Ready | RPCEvents.Error
	>,
> extends BaseRPCPayload {
	cmd: RPCCommands.Unsubscribe;
	evt: T;
	args: MappedRPCDispatchData[T];
	data?: SubscribePayloadData;
}

export interface SetCertifiedDevicesRequestPayload extends BaseRPCPayload {
	cmd: RPCCommands.SetCertifiedDevices;
	args?: SetCertifiedDevicesArguments;
}

export interface SetActivityRequestPayload extends BaseRPCPayload {
	cmd: RPCCommands.SetActivity;
	args?: SetActivityArguments;
}

export interface SendActivityJoinInviteRequestPayload extends BaseRPCPayload {
	cmd: RPCCommands.SendActivityJoinInvite;
	args?: SendActivityJoinInviteArguments;
}

export interface CloseActivityRequestPayload extends BaseRPCPayload {
	cmd: RPCCommands.CloseActivityRequest;
	args?: CloseActivityRequestArguments;
}

// ----- END RPC REQUEST TYPES -----
