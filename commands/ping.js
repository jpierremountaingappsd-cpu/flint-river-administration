
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check whether Flint River Administration is online."),

  async execute(interaction) {
    const latency = interaction.client.ws.ping;

    await interaction.reply({
      content:
        `Flint River Administration is online!\n` +
        `Discord Gateway Latency: ${latency}ms`,
      ephemeral: true
    });
  }
};
