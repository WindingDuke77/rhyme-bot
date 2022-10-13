const { SlashCommandBuilder } = require("@discordjs/builders");
const fetch = require("node-fetch");
const { addStat } = require("../../functions/stat");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("searchrhyme")
    .setDescription("Need a rhyme for a word")
    .addStringOption((options) =>
      options
        .setRequired(true)
        .setName("word")
        .setDescription("The word you want a rhyme for")
    ),

  async execute(interation, Discord, client) {
    let word = await interation.options.getString("word");

    const response = await fetch(
      `https://rhymebrain.com/talk?function=getRhymes&word=${word}`,
      { method: "GET" }
    );

    let unproccessRhymes = await response.json();

    let description = `Here some words that rhyme with **${word}**\n\n`;

    unproccessRhymes.filter((Rhyme) => Rhyme.score >= 300);

    if (unproccessRhymes.length <= 0) {
      return interation.reply({
        content: "No Rhymes Found",
        ephemeral: true,
      });
    }

    addStat("totalSearchs", 1);

    for (let i = 0; i < Math.min(unproccessRhymes.length, 10); i++) {
      word = unproccessRhymes[i].word;
      description += `**${word}**\n`;
    }

    const Template = new Discord.MessageEmbed()
      .setColor(Math.floor(Math.random() * 16777215).toString(16))
      .setFooter({ text: `Search by ${interation.user.tag}` })
      .setTimestamp()
      .setTitle("📚 Rhyme Search 📚")
      .setDescription(description);

    interation.reply({ embeds: [Template] });
  },
};
