const { MessageCollector } = require("discord.js");
const { addStat } = require("../../functions/stat");
const fetch = require("node-fetch");

class RhymeGame {
  constructor(interation, discord, client, word) {
    this.interation = interation;
    this.discord = discord;
    this.client = client;

    this.channel = interation.channel;
    this.guild = interation.guild;
    this.embed = null;
    this.collector = null;

    this.players = new Map();
    this.failedPlayers = 0;

    this.startWord = word;
    this.validRhymeWords = {};
    this.lastPerson = null;

    this.countdown = 30; // change to 60
    this.countdownMsg = null;
  }
  async start() {
    if (!(await this.getvalidRhymes())) {
      return;
    }
    this.interation.reply({
      content: "The Game is now starting.",
      ephemeral: true,
    });

    const Template = new this.discord.MessageEmbed()
      .setColor(Math.floor(Math.random() * 16777215).toString(16))
      .setFooter(`Started by ${this.interation.member.user.tag}`)
      .setTimestamp()
      .setDescription(
        `If you would like to join the game\n**Click ✋** \nThe game will begin in **${this.countdown} seconds**`
      )
      .setTitle("📚 Rhyme Game 📚");

    this.embed = await this.channel.send({ embeds: [Template] });
    this.embed.react("✋");

    await this.getPlayers();

    this.mainGame();
  }
  stop() {
    if (this.collector) {
      this.collector.stop();
    }

    this.selfDestruct = true;
  }
  async getvalidRhymes() {
    const response = await fetch(
      `https://rhymebrain.com/talk?function=getRhymes&word=${this.startWord}`,
      { method: "GET" }
    );

    let unproccessRhymes = await response.json();

    unproccessRhymes
      .filter((Rhyme) => Rhyme.score >= 100)
      .forEach((Rhyme) => {
        this.validRhymeWords[Rhyme.word] = true;
      });

    if (this.validRhymeWords.length < 10) {
      this.stop();
      this.interation.reply({
        content: "Invalid Word",
        ephemeral: true,
      });
      return false;
    }
    return true;
  }
  async getPlayers() {
    await new Promise((reslove) => {
      setTimeout(() => {
        reslove();
      }, this.countdown * 1000);
    });

    let players = await this.embed.reactions.cache.first().users.fetch();
    if (players.size <= 2) {
      this.channel.send("Not enough Players to Play");
      return this.stop();
    }

    players.forEach((player) => {
      if (player.id == this.client.user.id) {
        return;
      }
      this.players.set(player.id, new RhymePlayer(player));
    });

    const Template = new this.discord.MessageEmbed()
      .setColor(Math.floor(Math.random() * 16777215).toString(16))
      .setFooter(`Started by ${this.interation.member.user.tag}`)
      .setTimestamp()
      .setDescription(
        `The game is now starting \nThe word is **${this.startWord}**`
      )
      .setTitle("📚 Rhyme Game 📚");

    this.channel.send({ embeds: [Template] });
  }
  mainGame() {
    const Collectorfilter = (message) => {
      let player = this.players.get(message.author.id);
      if (!player) return false;
      if (player.failed) return false;
      if (this.lastPerson == message.author.id) return false;
      return true;
    };

    this.collector = new MessageCollector(this.channel, {
      filter: Collectorfilter,
      time: 30 * 60 * 1000,
    });

    this.collector.on("collect", (m) => {
      let player = this.players.get(m.author.id);
      this.lastPerson = m.author.id;
      m.content = m.content.toLowerCase();
      if (!this.validRhymeWords[m.content]) {
        m.react("❌");
        this.failedPlayers += 1;
        player.failed = true;
        m.reply({
          content: "That Word doesnt Rhyme or Already been said.\nYou are out",
          ephemeral: true,
        });
      } else {
        m.react("✔");
        this.validRhymeWords[m.content] = null;
        player.addWord(m.content);
      }

      if (this.players.size - this.failedPlayers <= 1)
        return this.collector.stop("noplayerleft");
      if (this.validRhymeWords.length <= 0)
        return this.collector.stop("allwordsguess");
    });

    this.collector.on("end", (_, reason) => {
      const Template = new this.discord.MessageEmbed()
        .setColor(Math.floor(Math.random() * 16777215).toString(16))
        .setTimestamp()
        .setTitle("📚 Rhyme Game 📚");

      let description = `The Game has **Ended**\n`;

      if (reason == "allwordsguess") {
        description += "All words were guessed\n\n";
      }

      description += "Stats of the Game\n";

      let lastPerson = [];
      let topPlayer;

      this.players.forEach((p) => {
        if (!p.failed) lastPerson.push(p);

        if (p.words.length > (topPlayer?.words.length || 0)) topPlayer = p;
      });

      lastPerson = lastPerson[0];
      topPlayer = topPlayer;

      if (reason == "noplayerleft" && lastPerson) {
        Template.addFields({
          name: "Last Person",
          value: `${lastPerson.user}`,
          inline: true,
        });
      }

      Template.setDescription(description);
      if (topPlayer)
        Template.addFields({
          name: "Top Player",
          value: `${topPlayer.user} with **${topPlayer.words.length}** words`,
          inline: true,
        });

      this.channel.send({ embeds: [Template] });
      this.stop();
    });
  }
}

class RhymePlayer {
  constructor(user) {
    this.failed = false;
    this.words = [];
    this.user = user;
  }
  addWord(word) {
    addStat("totalRhymesGuess", 1);
    this.words.push(word);
  }
}

module.exports = { RhymeGame };