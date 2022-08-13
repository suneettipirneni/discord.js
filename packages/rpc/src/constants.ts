import type { Snowflake } from 'discord-api-types/globals';
import type { APIUser } from 'discord.js';

// @ts-expect-error
export const browser = typeof window !== 'undefined';

export enum RPCErrors {
	CaptureShortcutAlreadyListening = 5004,
	GetGuildTimedOut = 5002,
	InvalidActivityJoinRequest = 4012,
	InvalidActivitySecret = 5005,
	InvalidChannel = 4005,
	InvalidClientID = 4007,
	InvalidCommand = 4002,
	InvalidEntitlement = 4015,
	InvalidEvent = 4004,
	InvalidGiftCode = 4016,
	InvalidGuild = 4003,
	InvalidInvite = 4011,
	InvalidLobby = 4013,
	InvalidLobbySecret = 4014,
	InvalidOrigin = 4008,
	InvalidPayload = 4000,
	InvalidPermissions = 4006,
	InvalidToken = 4009,
	InvalidUser = 4010,
	LobbyFull = 5007,
	NoEligibleActivity = 5006,
	OAuth2Error = 5000,
	PurchaseCanceled = 5008,
	PurchaseError = 5009,
	RateLimited = 5011,
	SelectChannelTimedOut = 5001,
	SelectVoiceForceRequired = 5003,
	ServiceUnavailable = 1001,
	TransactionAborted = 1002,
	UnauthorizedForAchievement = 5010,
	UnknownError = 1000,
}

export enum RPCCloseCode {
	CloseNormal = 1000,
	CloseUnsupported = 1003,
	CloseAbnormal = 1006,
	InvalidClientID = 4000,
	InvalidOrigin = 4001,
	RateLimited = 4002,
	TokenRevoked = 4003,
	InvalidVersion = 4004,
	InvalidEncoding = 4005,
}

export enum LobbyTypes {
	Private = 1,
	Public = 2,
}

export enum RelationshipTypes {
	None = 0,
	Friend = 1,
	Blocked = 2,
	PendingIncoming = 3,
	PendingOutgoing = 4,
	Implicit = 5,
}

export interface RelationShip {
	id: Snowflake;
	type: RelationshipTypes;
	user: APIUser;
}
