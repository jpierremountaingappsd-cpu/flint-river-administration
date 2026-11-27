
const { SlashCommandBuilder } = require("discord.js");
const { db, logAction } = require("../database/db");
const { isSchoolAdmin } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("assign")
    .setDescription("Assign an enquiry to an administrator.")
    .addIntegerOption(option =>
      option.setName("ticket")
        .setDescription("Enquiry reference number")
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName("administrator")
        .setDescription("Administrator handling the enquiry")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!isSchoolAdmin(interaction.member)) {
      return interaction.reply({
        content: "You are not authorized to assign enquiries.",
        ephemeral: true
      });
    }

    const ticketId = interaction.options.getInteger("ticket");
    const administrator = interaction.options.getUser("administrator");

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
      UPDATE inbox_tickets SET assigned_to = ?
      WHERE id = ?
    `).run(administrator.id, ticketId);

    logAction(
      "INBOX_TICKET_ASSIGNED",
      interaction.user.id,
      administrator.id,
      `Enquiry #${ticketId}`
    );

    await interaction.reply({
      content: `Enquiry #${ticketId} assigned to **${administrator.username}**.`,
      ephemeral: true
    });
  }
};
