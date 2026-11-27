
const { SlashCommandBuilder } = require("discord.js");
const { isSchoolAdmin } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("message")
    .setDescription("Send a private message to a member.")
    .addUserOption(option =>
      option
        .setName("member")
        .setDescription("Person receiving the message")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("message")
        .setDescription("Write your message")
        .setRequired(true)
        .setMaxLength(2000)
    ),

  async execute(interaction) {
    if (!isSchoolAdmin(interaction.member)) {
      return interaction.reply({
        content: "You are not authorized to use this command.",
        ephemeral: true
      });
    }

    const recipient = interaction.options.getUser("member");
    const message = interaction.options.getString("message", true);

    if (recipient.bot) {
      return interaction.reply({
        content: "You cannot send messages to bots.",
        ephemeral: true
      });
    }

    try {
      await recipient.send({
        content: message,
        allowedMentions: {
          parse: ["users", "roles", "everyone"]
        }
      });

      await interaction.reply({
        content: `Message delivered to **${recipient.username}**.`,
        ephemeral: true
      });

    } catch (error) {
      console.error("DM delivery error:", error);

      await interaction.reply({
        content: `Unable to deliver the message to **${recipient.username}**. Their DM settings may prevent it.`,
        ephemeral: true
      });
    }
  }
};
