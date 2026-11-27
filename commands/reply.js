
const { SlashCommandBuilder } = require("discord.js");
const { db, logAction } = require("../database/db");
const { isSchoolAdmin } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reply")
    .setDescription("Reply to an administration enquiry.")
    .addIntegerOption(option =>
      option.setName("ticket")
        .setDescription("Enquiry reference number")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("message")
        .setDescription("Your response")
        .setRequired(true)
        .setMaxLength(2000)
    ),

  async execute(interaction) {
    if (!isSchoolAdmin(interaction.member)) {
      return interaction.reply({
        content: "You are not authorized to reply to enquiries.",
        ephemeral: true
      });
    }

    const ticketId = interaction.options.getInteger("ticket");
    const response = interaction.options.getString("message", true);

    const ticket = db.prepare(
      "SELECT * FROM inbox_tickets WHERE id = ?"
    ).get(ticketId);

    if (!ticket || ticket.status !== "Open") {
      return interaction.reply({
        content: "That enquiry does not exist or is already closed.",
        ephemeral: true
      });
    }

    try {
      const user = await interaction.client.users.fetch(ticket.discord_id);

      await user.send(response);

      db.prepare(`
        INSERT INTO inbox_messages
        (ticket_id, sender_id, message, direction)
        VALUES (?, ?, ?, 'Outgoing')
      `).run(ticketId, interaction.user.id, response);

      logAction(
        "INBOX_REPLY_SENT",
        interaction.user.id,
        ticket.discord_id,
        `Enquiry #${ticketId}`
      );

      const inbox = await interaction.client.channels.fetch(
        process.env.ADMIN_INBOX_CHANNEL_ID
      );

      if (inbox) {
        await inbox.send(
          `**RESPONSE SENT — #${ticketId}**\n` +
          `**Administrator:** ${interaction.user.tag}\n\n${response}`
        );
      }

      await interaction.reply({
        content: `Your response was delivered for enquiry #${ticketId}.`,
        ephemeral: true
      });

    } catch (error) {
      console.error("Inbox reply error:", error);

      await interaction.reply({
        content: "The response could not be delivered. The member may have disabled DMs.",
        ephemeral: true
      });
    }
  }
};
