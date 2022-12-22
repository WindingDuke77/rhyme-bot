const { RhymeGame } = require("./classes");
const { addStat } = require("../../functions/stat");

const activeGames = new Map();

function startGame(interation, discord, client, word, lives) {
  if (activeGames.get(interation.guild.id)) {
    if (activeGames.get(interation.guild.id).selfDestruct) {
      activeGames.delete(interation.guild.id);
    } else {
      return interation.reply({
        content: "A Game is Already Running",
        ephemeral: true,
      });
    }
  }

  let game = new RhymeGame(interation, discord, client, word, lives);

  addStat("totalGames", 1);

  activeGames.set(interation.guild.id, game);
  game.start();
}

function stopGame(interation, discord, client) {
  if (!activeGames.get(interation.guild.id)) {
    return interation.reply({
      content: "No Game is Running",
      ephemeral: true,
    });
  }

  if (activeGames.get(interation.guild.id).selfDestruct) {
    activeGames.delete(interation.guild.id);
    return interation.reply({
      content: "No Game is Running",
      ephemeral: true,
    });
  }

  activeGames.get(interation.guild.id).stop();
  interation.reply({
    content: "The Game has been Stopped.",
  });
  activeGames.delete(interation.guild.id);
}

module.exports = { startGame, stopGame };
