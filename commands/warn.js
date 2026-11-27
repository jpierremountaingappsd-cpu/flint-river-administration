
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { db, logAction } = require("../database/db");
const { isSchoolAdmin } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Record a formal warning for a server member.")
    .addUserOption(o =>
      o.setName("member")
        .setDescription("Member receiving the warning")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("reason")
        .setDescription("Reason for the warning")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!isSchoolAdmin(interaction.member)) {
      return interaction.reply({
        content: "You are not authorized to issue warnings.",
        ephemeral: true
      });
    }

    const member = interaction.options.getUser("member");
    const reason = interaction.options.getString("reason", true);

    // Record the warning
    const result = db.prepare(
      "INSERT INTO warnings (discord_id, reason, moderator_id) VALUES (?, ?, ?)"
    ).run(member.id, reason, interaction.user.id);

    const warningNumber = result.lastInsertRowid;

    logAction(
      "WARNING_RECORDED",
      interaction.user.id,
      member.id,
      `Warning #${warningNumber}: ${reason}`
    );

    // Prepare the DM
    const warningEmbed = new EmbedBuilder()
      .setColor(0xD9534F)
      .setTitle("Official Staff Warning")
      .setDescription(
        `You have received a formal warning from **Flint River High School**.`
      )
      .addFields(
        { name: "Warning Number", value: `#${warningNumber}`, inline: true },
        { name: "Issued By", value: interaction.user.tag, inline: true },
        { name: "Reason", value: reason }
      )
      .setFooter({
        text: "Flint River High School | Human Resources & Administration"
      })
      .setTimestamp();

    // Attempt to DM the member
    let dmSent = true;

    try {
      await member.send({ embeds: [warningEmbed] });
    } catch (error) {
      dmSent = false;
    }

    // Confirm to the administrator
    await interaction.reply({
      content: dmSent
        ? `Warning #${warningNumber} recorded for **${member.username}**.\n<:check:> The member was successfully notified by DM.`
        : `Warning #${warningNumber} recorded for **${member.username}**.\nThe warning could not be delivered by DM. Their privacy settings may prevent messages.`,
      ephemeral: true
    });
  }
};
