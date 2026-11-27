
const {
  SlashCommandBuilder,
  ChannelType
} = require("discord.js");

const { isSchoolAdmin } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Publish a school announcement.")
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("Channel for the announcement")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("message")
        .setDescription("Write your announcement")
        .setRequired(true)
        .setMaxLength(2000)
    ),

  async execute(interaction) {
    if (!isSchoolAdmin(interaction.member)) {
      return interaction.reply({
        content: "You are not authorized to publish announcements.",
        ephemeral: true
      });
    }

    const channel = interaction.options.getChannel("channel");
    const message = interaction.options.getString("message", true);

    try {
      await channel.send({
        content: message,
        allowedMentions: {
          parse: ["users", "roles", "everyone"]
        }
      });

      await interaction.reply({
        content: `Announcement published in ${channel}.`,
        ephemeral: true
      });

    } catch (error) {
      console.error("Announcement error:", error);

      await interaction.reply({
        content: "Unable to publish the announcement. Check the bot's channel permissions.",
        ephemeral: true
      });
    }
  }
};
