const { PermissionFlagsBits } = require("discord.js");

function isSchoolAdmin(member) {
  if (!member) return false;
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  const roleId = process.env.ADMIN_ROLE_ID;
  return Boolean(roleId && member.roles.cache.has(roleId));
}

module.exports = { isSchoolAdmin };
