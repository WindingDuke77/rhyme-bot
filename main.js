require("dotenv").config();
const discord = require("discord.js");
const { getAllFiles } = require("./functions/filesfuncs");

const intents = new discord.Intents(36353);
const client = new discord.Client({ intents });

client.scommands = new discord.Collection();
client.pcommands = new discord.Collection();

client.login(process.env.DISCORD_TOKEN);

const handlers = getAllFiles("./handlers");
handlers.forEach((handler) => {
  require(`${handler}`)(discord, client);
});
