import type { Snowflake, APIUser, RESTPostOAuth2ClientCredentialsResult } from 'discord.js';
import type { KeyType, RelationshipType } from './types';

export interface RPCOAuthApplication {
	description: string;
	icon: string;
	id: Snowflake;
	rpc_origin: string[];
	name: string;
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

export interface RPCServerConfiguration {
	cdn_host: string;
	api_endpoint: string;
	environment: string;
}

export interface RelationShip {
	id: Snowflake;
	type: RelationshipType;
	user: APIUser;
}

export type RESTPostOAuth2RPCClientCredentialsResult = Omit<RESTPostOAuth2ClientCredentialsResult, 'access_token'> & {
	rpc_token: string;
};
