import type { Snowflake, APIUser, RESTPostOAuth2ClientCredentialsResult } from 'discord.js';
import type { KeyType, RelationshipType } from './types';

export interface RPCOAuthApplication {
	description: string;
	icon: string;
	id: Snowflake;
	name: string;
	rpc_origin: string[];
}

export interface Pan {
	left: number;
	right: number;
}

export interface SetUserVoiceSettingsData {
	mute?: boolean;
	pan?: Pan;
	user_id: Snowflake;
	volume?: number;
}

export interface ShortcutKeyCombo {
	code: number;
	name: string;
	type: KeyType;
}

export interface VoiceSettingDevice {
	id: string;
	name: string;
}

export interface VoiceSettingsInput {
	available_devices: VoiceSettingDevice[];
	device_id: string;
	volume: number;
}

export interface VoiceSettingsMode {
	auto_threshold: boolean;
	delay: number;
	shortcut: ShortcutKeyCombo;
	threshold: number;
	type: 'PUSH_TO_TALK' | 'VOICE_ACTIVITY';
}

export interface VoiceSettingsOutput {
	available_devices: VoiceSettingDevice[];
	device_id: string;
	volume: number;
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
	id: string;
	model: Model;
	related: string[];
	type: DeviceType;
	vendor: Vendor;
}

export interface OutputDevice extends BaseDevice {
	type: DeviceType.AudioOutput | DeviceType.VideoInput;
}

export interface InputAudioDevice extends BaseDevice {
	auto_gain_control?: boolean;
	echo_cancellation?: boolean;
	hardware_mute?: boolean;
	noise_suppression?: boolean;
	type: DeviceType.AudioInput;
}

export type Device = InputAudioDevice | OutputDevice;

export interface RPCServerConfiguration {
	api_endpoint: string;
	cdn_host: string;
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
