const { SlashCommandBuilder } = require("@discordjs/builders");
const { startGame } = require("../../module/rhymeGame/main");

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("startgame")
    .setDescription("Starts the Rhyme Game")
    .setDefaultMemberPermissions("0")
    .addStringOption((options) =>
      options
        .setRequired(true)
        .setName("word")
        .setDescription("The word you want to think of rhymes for")
    ),

  async execute(interation, Discord, client) {
    startGame(
      interation,
      Discord,
      client,
      await interation.options.getString("word")
    );
  },
};
