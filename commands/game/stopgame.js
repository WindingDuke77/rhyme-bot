const { SlashCommandBuilder } = require("@discordjs/builders");
const { stopGame } = require("../../module/rhymeGame/main");

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("stopgame")
    .setDescription("Stops the Rhyme Game")
    .setDefaultMemberPermissions("0"),

  async execute(interation, Discord, client) {
    stopGame(interation, Discord, client);
  },
};
