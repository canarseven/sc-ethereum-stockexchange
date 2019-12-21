const StockExchange = artifacts.require("StockExchangeV2");

module.exports = function(deployer) {
  deployer.deploy(StockExchange);
};
