const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const ms = require("ms");
const cooldownMap = new Map();

module.exports = async (Discord, client, interaction) => {
  if (!interaction.isCommand()) return;

  if (
    interaction.guild.id == process.env.devServer &&
    process.env.type != "dev"
  ) {
    return;
  }

  if (
    process.env.type == "dev" &&
    interaction.guild.id != process.env.devServer
  )
    return;

  const command = client.scommands.get(interaction.commandName);

  if (!command)
    return await interaction.reply({
      content: "This is a InValid Command!",
      ephemeral: true,
    });

  let commandName = interaction.commandName;
  let cooldown = cooldownMap.get(commandName + interaction.user.id);

  if (cooldown) {
    if (Date.now() < cooldown) {
      return await interaction.reply({
        content:
          "This command is still on cooldown, You have " +
          ms(Math.abs(cooldown - Date.now())) +
          " Left",
        ephemeral: true,
      });
    }
    cooldownMap.delete(commandName + interaction.user.id);
  } else {
    let endtime = Date.now() + command.cooldown * 1000;
    cooldownMap.set(commandName + interaction.user.id, endtime);
  }

  const permissionNeeded = ["SEND_MESSAGES", "EMBED_LINKS", "ADD_REACTIONS"];

  let invalidPerms = [];
  let permissions = interaction.channel.permissionsFor(client.user).toArray();
  console.log(permissions);
  permissionNeeded.forEach((perm) => {
    if (!permissions.includes(perm)) {
      invalidPerms.push(perm);
    }
  });
  if (invalidPerms.length > 0) {
    interaction.reply({
      content: `Bot Missing Permissions: ${invalidPerms}`,
      ephemeral: true,
    });
    return;
  }

  try {
    await command.execute(interaction, Discord, client);
  } catch (err) {
    console.log(err);
    await interaction.reply({
      content: "There was an error trying to execute this command!",
      ephemeral: true,
    });
  }
};
