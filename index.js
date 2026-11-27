
require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");

const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  Events
} = require("discord.js");

const { db, initializeDatabase, logAction } =
  require("./database/db");

if (!process.env.DISCORD_TOKEN) {
  console.error("Missing DISCORD_TOKEN in .env");
  process.exit(1);
}

if (!process.env.ADMIN_INBOX_CHANNEL_ID) {
  console.error("Missing ADMIN_INBOX_CHANNEL_ID in .env");
  process.exit(1);
}

initializeDatabase();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.commands = new Collection();

const commandFiles = fs.readdirSync(
  path.join(__dirname, "commands")
).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(__dirname, "commands", file));
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Receive private messages and forward them to the inbox
client.on(Events.MessageCreate, async message => {
  if (message.author.bot || message.guild) return;

  const content = message.content.trim();

  if (!content && message.attachments.size === 0) return;

  try {
    const inbox = await client.channels.fetch(
      process.env.ADMIN_INBOX_CHANNEL_ID
    );

    if (!inbox || !inbox.isTextBased()) {
      console.error("Administration inbox channel was not found.");
      return;
    }

    let ticket = db.prepare(`
      SELECT * FROM inbox_tickets
      WHERE discord_id = ? AND status = 'Open'
      ORDER BY id DESC LIMIT 1
    `).get(message.author.id);

    let isNewTicket = false;

    if (!ticket) {
      const result = db.prepare(`
        INSERT INTO inbox_tickets (discord_id, username)
        VALUES (?, ?)
      `).run(message.author.id, message.author.username);

      ticket = db.prepare(
        "SELECT * FROM inbox_tickets WHERE id = ?"
      ).get(result.lastInsertRowid);

      isNewTicket = true;
    }

    const attachmentText = message.attachments.size
      ? "\nAttachments: " + [...message.attachments.values()]
          .map(file => file.url)
          .join("\n")
      : "";

    const savedMessage = content + attachmentText;

    db.prepare(`
      INSERT INTO inbox_messages
      (ticket_id, sender_id, message, direction)
      VALUES (?, ?, ?, 'Incoming')
    `).run(ticket.id, message.author.id, savedMessage);

    logAction(
      "INBOX_MESSAGE_RECEIVED",
      message.author.id,
      message.author.id,
      `Enquiry #${ticket.id}`
    );

    await inbox.send({
      content:
        `**${isNewTicket ? "NEW ENQUIRY" : "NEW MESSAGE"} — #${ticket.id}**\n` +
        `**From:** ${message.author.tag}\n` +
        `**User ID:** ${message.author.id}\n` +
        `**Status:** ${ticket.status}\n\n` +
        `${savedMessage || "(Attachment only)"}`
    });

    if (isNewTicket) {
      await message.author.send(
        `Thank you for contacting Flint River Administration. ` +
        `Your enquiry has been received and assigned reference **#${ticket.id}**. ` +
        `An administrator will respond when available.`
      ).catch(() => {});
    }

  } catch (error) {
    console.error("Inbox forwarding error:", error);
  }
});

// Handle slash commands
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(
      `Command error (${interaction.commandName}):`,
      error
    );

    const response = {
      content: "Something went wrong while running that command.",
      ephemeral: true
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(response).catch(() => {});
    } else {
      await interaction.reply(response).catch(() => {});
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
