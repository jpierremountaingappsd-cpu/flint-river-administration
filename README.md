# Flint River High School Discord Bot

A starter Discord administration bot using JavaScript, Discord.js v14, and SQLite.

## Requirements
- Node.js 20 or newer
- A Discord account with permission to create/manage an application
- A test Discord server where you have permission to add a bot

## Setup
1. Install Node.js 20+ from https://nodejs.org/
2. Extract this project folder.
3. Open a terminal in the project folder.
4. Run `npm install`.
5. Copy `.env.example` to a new file named `.env`.
6. In the Discord Developer Portal, create an application and add a Bot user.
7. Copy the bot token into `DISCORD_TOKEN` in `.env`.
8. Copy the Application ID into `CLIENT_ID`.
9. Enable the bot invite with the `bot` and `applications.commands` scopes. Grant only the permissions it needs, such as View Channels, Send Messages, Embed Links, and Read Message History.
10. Copy your test server's ID into `GUILD_ID`. To copy IDs, enable Developer Mode in Discord's Advanced settings.
11. Optionally set `ADMIN_ROLE_ID` to the ID of your trusted school administration role.
12. Run `npm run deploy` to register slash commands in your test server.
13. Run `npm start` to start the bot.

## Included commands
- `/ping`
- `/help`
- `/staff-add`
- `/staff-list`
- `/warn`
- `/announce`

## Important security notes
- Never share your bot token or upload your `.env` file.
- If a token is exposed, reset it immediately in the Discord Developer Portal.
- Test in a private server before inviting the bot to the main school server.
- Keep staff and student records limited to information genuinely needed for school roleplay administration. Do not store passwords, private contact details, or sensitive real-world student information.
- The starter uses server Administrator permission or the configured `ADMIN_ROLE_ID` for protected commands. Before launch, replace this simple access check with a carefully defined role-permission system for each department.
- This starter is not yet a complete production system. Ticket workflows, application forms, attendance sessions, student records, resignation workflows, richer audit logs, and department-specific permissions are planned next.
