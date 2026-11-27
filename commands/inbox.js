
const { SlashCommandBuilder } = require("discord.js");
const { db } = require("../database/db");
const { isSchoolAdmin } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inbox")
    .setDescription("View open administration enquiries."),

  async execute(interaction) {
    if (!isSchoolAdmin(interaction.member)) {
      return interaction.reply({
        content: "You are not authorized to access the inbox.",
        ephemeral: true
      });
    }

    const tickets = db.prepare(`
      SELECT * FROM inbox_tickets
      WHERE status = 'Open'
      ORDER BY id DESC LIMIT 15
    `).all();

    if (!tickets.length) {
      return interaction.reply({
        content: "There are currently no open enquiries.",
        ephemeral: true
      });
    }

    const output = tickets.map(ticket =>
      `**#${ticket.id}** — ${ticket.username}\n` +
      `Assigned to: ${ticket.assigned_to || "Unassigned"}`
    ).join("\n\n");

    await interaction.reply({
      content: `**Open Administration Enquiries**\n\n${output}`,
      ephemeral: true
    });
  }
};
