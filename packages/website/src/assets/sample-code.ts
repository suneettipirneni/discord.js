export const codeSampleText = `
const client = new Client({ intents: [Intents.ApplicationCommands] });
await client.login('token');

client.on('interactionCreate', async interaction => {
  if (interaction.type !== InteractionType.ApplicationCommand) {
    return;
  }

  await interaction.reply("Hello World!");
});
`;
