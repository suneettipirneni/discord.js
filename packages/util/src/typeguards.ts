import {
	type APIApplicationCommandInteraction,
	type Interaction,
	type APIInteraction,
	type ChatInputCommandInteraction,
	type APIChatInputApplicationCommandInteraction,
	InteractionType,
	ApplicationCommandType,
	type MessageContextMenuCommandInteraction,
	type UserContextMenuCommandInteraction,
	type APIContextMenuInteraction,
	type APIMessageApplicationCommandInteraction,
	type APIUserApplicationCommandInteraction,
	type ContextMenuCommandInteraction,
} from 'discord.js';

export type CommandInteractionResolvable =
	| (ChatInputCommandInteraction | ContextMenuCommandInteraction)
	| APIApplicationCommandInteraction;

function resolveCommandType(resolvable: CommandInteractionResolvable) {
	if ('commandType' in resolvable) {
		return resolvable.commandType;
	}

	return resolvable.data.type;
}

export type InteractionResolvable = Interaction | APIInteraction;

/**
 * Checks if the interaction is a chat input command or not
 * @param maybeChatInput The interaction to check against
 *
 * @example
 * client.on('interactionCreate', interaction => {
 *      if (!isChatInputCommand(interaction)) {
 *           return;
 *      }
 *      // Now narrowed to a `ChatInputCommandInteraction`
 *      const option = interaction.options.getString('option');
 * });
 */
export function isChatInputCommand(
	maybeChatInput: InteractionResolvable,
): maybeChatInput is ChatInputCommandInteraction | APIChatInputApplicationCommandInteraction {
	return (
		maybeChatInput.type === InteractionType.ApplicationCommand &&
		resolveCommandType(maybeChatInput) === ApplicationCommandType.ChatInput
	);
}

/**
 * Checks if the interaction is a context menu command or not
 * @param maybeContextMenu The interaction to check against
 *
 * @example
 * client.on('interactionCreate', interaction => {
 *      if (!isContextMenuCommand(interaction)) {
 *           return;
 *      }
 *      // Now narrowed to a `ChatInputCommandInteraction`
 *      const { target } = interaction;
 * });
 */
function isContextMenuCommand(
	maybeContextMenu: InteractionResolvable,
): maybeContextMenu is
	| (MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction)
	| APIContextMenuInteraction {
	if (maybeContextMenu.type === InteractionType.ApplicationCommand) {
		const commandType = resolveCommandType(maybeContextMenu);
		return commandType === ApplicationCommandType.Message || commandType === ApplicationCommandType.User;
	}
	return false;
}

/**
 * Checks if the interaction is a context menu message command or not
 * @param maybeMessageCommand The interaction to check against
 *
 * @example
 * client.on('interactionCreate', interaction => {
 *      if (!isMessageCommand(interaction)) {
 *           return;
 *      }
 *      // Now narrowed to a `MessageContextMenuCommandInteraction`
 *      const { target } = interaction;
 * });
 */
export function isMessageCommand(
	maybeMessageCommand: InteractionResolvable,
): maybeMessageCommand is MessageContextMenuCommandInteraction | APIMessageApplicationCommandInteraction {
	return (
		isContextMenuCommand(maybeMessageCommand) &&
		resolveCommandType(maybeMessageCommand) === ApplicationCommandType.Message
	);
}

export function isUserCommand(
	maybeUserCommand: InteractionResolvable,
): maybeUserCommand is UserContextMenuCommandInteraction | APIUserApplicationCommandInteraction {
	return isContextMenuCommand(maybeUserCommand) && resolveCommandType(maybeUserCommand) === ApplicationCommandType.User;
}
