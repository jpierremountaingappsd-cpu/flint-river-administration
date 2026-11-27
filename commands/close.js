
const { SlashCommandBuilder } = require("discord.js");
const { db, logAction } = require("../database/db");
const { isSchoolAdmin } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("close")
    .setDescription("Close an administration enquiry.")
    .addIntegerOption(option =>
      option.setName("ticket")
        .setDescription("Enquiry reference number")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!isSchoolAdmin(interaction.member)) {
      return interaction.reply({
        content: "You are not authorized to close enquiries.",
        ephemeral: true
      });
    }

    const ticketId = interaction.options.getInteger("ticket");

    const ticket = db.prepare(
      "SELECT * FROM inbox_tickets WHERE id = ?"
    ).get(ticketId);

    if (!ticket || ticket.status !== "Open") {
      return interaction.reply({
        content: "That enquiry does not exist or is already closed.",
        ephemeral: true
      });
    }

    db.prepare(`
      UPDATE inbox_tickets
      SET status = 'Closed', closed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(ticketId);

    logAction(
      "INBOX_TICKET_CLOSED",
      interaction.user.id,
      ticket.discord_id,
      `Enquiry #${ticketId}`
    );

    await interaction.reply({
      content: `Enquiry #${ticketId} has been closed.`,
      ephemeral: true
    });
  }
};
