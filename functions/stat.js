const fs = require("fs");

function addStat(stat, amount) {
  if (process.env.type == "dev") return;
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
