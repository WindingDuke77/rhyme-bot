const fs = require("fs");

function addStat(stat, amount) {
  let file = require("../gobalStats.json");
  file[stat] += amount;
  fs.writeFile("./gobalStats.json", JSON.stringify(file), () => {});
}

function getStats() {
  return require("../gobalStats.json");
}

module.exports = {
  addStat,
  getStats,
};
