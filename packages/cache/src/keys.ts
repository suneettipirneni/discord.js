import type { Snowflake } from 'discord-api-types/v10';

/**
 * Creates a stable key for a guild-scoped entity.
 */
export function guildScopedKey(guildId: Snowflake, id: Snowflake): string {
	return `${guildId}:${id}`;
}

/**
 * Creates a stable key for a channel message.
 */
export function messageKey(channelId: Snowflake, messageId: Snowflake): string {
	return `${channelId}:${messageId}`;
}

/**
 * Creates a stable key for a guild member.
 */
export function memberKey(guildId: Snowflake, userId: Snowflake): string {
	return guildScopedKey(guildId, userId);
}

/**
 * Creates a stable key for a guild presence.
 */
export function presenceKey(guildId: Snowflake, userId: Snowflake): string {
	return guildScopedKey(guildId, userId);
}

/**
 * Creates a stable key for a guild voice state.
 */
export function voiceStateKey(guildId: Snowflake, userId: Snowflake): string {
	return guildScopedKey(guildId, userId);
}

/**
 * Creates a stable key for a guild role.
 */
export function roleKey(guildId: Snowflake, roleId: Snowflake): string {
	return guildScopedKey(guildId, roleId);
}

/**
 * Creates a stable key for a guild emoji.
 */
export function emojiKey(guildId: Snowflake, emojiId: Snowflake): string {
	return guildScopedKey(guildId, emojiId);
}

/**
 * Creates a stable key for a guild sticker.
 */
export function stickerKey(guildId: Snowflake, stickerId: Snowflake): string {
	return guildScopedKey(guildId, stickerId);
}

/**
 * Creates a stable key for a guild scheduled event.
 */
export function scheduledEventKey(guildId: Snowflake, scheduledEventId: Snowflake): string {
	return guildScopedKey(guildId, scheduledEventId);
}

/**
 * Creates a stable key for a stage instance.
 */
export function stageInstanceKey(guildId: Snowflake, channelId: Snowflake): string {
	return guildScopedKey(guildId, channelId);
}

/**
 * Creates a stable key for a guild soundboard sound.
 */
export function soundboardSoundKey(guildId: Snowflake, soundId: Snowflake): string {
	return guildScopedKey(guildId, soundId);
}

/**
 * Creates a stable key for a guild auto moderation rule.
 */
export function autoModerationRuleKey(guildId: Snowflake, ruleId: Snowflake): string {
	return guildScopedKey(guildId, ruleId);
}

/**
 * Creates a stable key for a guild ban.
 */
export function banKey(guildId: Snowflake, userId: Snowflake): string {
	return guildScopedKey(guildId, userId);
}

/**
 * Creates a stable key for a guild integration.
 */
export function integrationKey(guildId: Snowflake, integrationId: Snowflake): string {
	return guildScopedKey(guildId, integrationId);
}

/**
 * Creates a stable key for a guild invite.
 */
export function inviteKey(guildId: Snowflake | null | undefined, code: string): string {
	return `${guildId ?? '@global'}:${code}`;
}

/**
 * Creates a stable key for a thread member.
 */
export function threadMemberKey(threadId: Snowflake, userId: Snowflake): string {
	return `${threadId}:${userId}`;
}

/**
 * Creates a stable key for application command permissions.
 */
export function applicationCommandPermissionsKey(
	applicationId: Snowflake,
	guildId: Snowflake,
	commandId: Snowflake,
): string {
	return `${applicationId}:${guildId}:${commandId}`;
}
