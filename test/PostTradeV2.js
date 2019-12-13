const PostTrade = artifacts.require("PostTradeV2");
var BN = web3.utils.BN;

contract("PostTrade Test", async accounts => {

  const wei = 100000;

  let instance;
  let myAddress;
  let createdOrder;
  let processedOrders;
  let buyTimestamp;
  let sellTimestamp;

  let seBalance;
  let traderaBalance;

  describe('SETUP', function() {

    it("deploys contract & default order", async () => {
      instance = await PostTrade.deployed();
      myAddress = await instance.getMyAddress.call();
      assert.ok(myAddress);
      seBalance = web3.eth.getBalance(myAddress);
      traderaBalance = web3.eth.getBalance(accounts[1]);
    });


    it('creates SE', async () => {
      await instance.createTrader();
      var trader = await instance.traders.call(myAddress);
      assert.equal(myAddress, trader);
    });

    it('creates traderA', async () => {
      await instance.createTrader({
        from: accounts[1]
      });
      var trader = await instance.traders.call(accounts[1]);
      assert.equal(accounts[1], trader);
    });

    it('creates 100 AAPL stocks', async () => {
      await instance.createStock(100, "Apple", "AAPL");
      var amount = await instance.getMyStock.call("AAPL");
      assert.equal(100, amount);
    });
  });


  describe('BUY AND SELL', function() {

    it('creates SELL 5(x1000) AAPL', async () => {
      const orderCreated = await instance.createOrder(1, "AAPL", 5, wei, Date.now());
      const orderEvent = orderCreated.logs[0];
      sellTimestamp = orderEvent.args.timestamp.toNumber();
      assert.equal(orderEvent.args.owner, accounts[0]);
      assert.equal(orderEvent.args.symbol, "AAPL");
      assert.equal(orderEvent.args.method.toNumber(), 1);
      assert.equal(orderEvent.args.amount.toNumber(), 5);
      assert.equal(orderEvent.args.price.toNumber(), wei);
    });

    it('creates BUY 5(x1000) AAPL', async () => {
      const orderCreated = await instance.createOrder(0, "AAPL", 5, wei, Date.now(), {
        from: accounts[1]
      });
      const orderEvent = orderCreated.logs[0];
      buyTimestamp = orderEvent.args.timestamp.toNumber();
      assert.equal(orderEvent.args.owner, accounts[1]);
      assert.equal(orderEvent.args.symbol, "AAPL");
      assert.equal(orderEvent.args.method.toNumber(), 0);
      assert.equal(orderEvent.args.amount.toNumber(), 5);
      assert.equal(orderEvent.args.price.toNumber(), wei);
    });

    it('cleares BUY&SELL 5(x1000) AAPL', async () => {
      const orderEvent = await instance.clearOrder(1, "AAPL", 5, buyTimestamp, 0, wei, sellTimestamp, myAddress, {
        from: accounts[1],
        value: wei
      });
      const orderProcessed = orderEvent.logs[0];
      assert.equal(orderProcessed.args.buyID, 1);
      assert.equal(orderProcessed.args.sellID, 0);
    });

  });


  describe('AFTERMATH', function() {

    it('traderA has 5 AAPL stocks', async () => {
      const traderStockAmount = await instance.getMyStock("AAPL", {
        from: accounts[1]
      });
      assert.equal(traderStockAmount.toNumber(), 5);
    });

    it('SE has 5 AAPL stocks', async () => {
      const traderStockAmount = await instance.getMyStock("AAPL");
      assert.equal(traderStockAmount.toNumber(), 95);
    });

    it('AAPL latestPrice is wei', async () => {
      const latestPrice = await instance.getLastPrice("AAPL");
      assert.equal(latestPrice.toNumber(), wei);
    });
  });

});
