const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("View the available Flint River bot commands."),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Flint River High School | Bot Commands")
      .setDescription("Initial command set. More modules will be added as the system is developed.")
      .addFields(
        { name: "General", value: "`/ping` — Check bot status\n`/help` — Show this command guide" },
        { name: "Human Resources", value: "`/staff-add` — Add a staff record\n`/staff-list` — View staff records" },
        { name: "Moderation", value: "`/warn` — Record a staff or member warning" },
        { name: "Communications", value: "`/announce` — Publish an announcement" }
      )
      .setFooter({ text: "Flint River High School • Administration" });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
