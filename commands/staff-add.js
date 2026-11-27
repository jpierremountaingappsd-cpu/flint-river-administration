const { SlashCommandBuilder } = require("discord.js");
const { db, logAction } = require("../database/db");
const { isSchoolAdmin } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("staff-add")
    .setDescription("Create a staff personnel record.")
    .addUserOption(o => o.setName("member").setDescription("Discord member").setRequired(true))
    .addStringOption(o => o.setName("position").setDescription("Official school position").setRequired(true))
    .addStringOption(o => o.setName("department").setDescription("Assigned department").setRequired(true)),
  async execute(interaction) {
    if (!isSchoolAdmin(interaction.member)) {
      return interaction.reply({ content: "You are not authorized to use this command.", ephemeral: true });
    }

    const member = interaction.options.getUser("member");
    const position = interaction.options.getString("position", true);
    const department = interaction.options.getString("department", true);

    try {
      db.prepare(`
        INSERT INTO staff (discord_id, display_name, position, department, added_by)
        VALUES (?, ?, ?, ?, ?)
      `).run(member.id, member.username, position, department, interaction.user.id);

      logAction("STAFF_ADDED", interaction.user.id, member.id, `${position} | ${department}`);
      await interaction.reply({
        content: `Staff record created for **${member.username}**.\nPosition: ${position}\nDepartment: ${department}`,
        ephemeral: true
      });
    } catch (error) {
      if (String(error.message).includes("UNIQUE")) {
        return interaction.reply({ content: "That member already has a staff record.", ephemeral: true });
      }
      throw error;
    }
  }
};
