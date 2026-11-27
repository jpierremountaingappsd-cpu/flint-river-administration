const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { db } = require("../database/db");
const { isSchoolAdmin } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("staff-list")
    .setDescription("View the current staff directory."),
  async execute(interaction) {
    if (!isSchoolAdmin(interaction.member)) {
      return interaction.reply({ content: "You are not authorized to view the staff directory.", ephemeral: true });
    }

    const rows = db.prepare(
      "SELECT display_name, position, department, status FROM staff ORDER BY department, display_name LIMIT 20"
    ).all();

    if (!rows.length) {
      return interaction.reply({ content: "No staff records have been added yet.", ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle("Flint River | Staff Directory")
      .setDescription(rows.map((r, i) =>
        `**${i + 1}. ${r.display_name}**\n${r.position} • ${r.department} • ${r.status}`
      ).join("\n\n"))
      .setFooter({ text: "Showing up to 20 records" });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
