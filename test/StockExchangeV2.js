const StockExchange = artifacts.require("StockExchangeV2");
var BN = web3.utils.BN;

contract("StockExchange Test", async accounts => {

  const wei = 100000;

  let instance;
  let myAddress;
  let createdOrder;
  let processedOrders;
  let buyTimestamp;
  let sellTimestamp;

  let buyID;
  let sellID;

  let seBalance;
  let traderaBalance;

  describe('SETUP', function() {

    it("deploys contract & default order", async () => {
      instance = await StockExchange.deployed();
      myAddress = await instance.getMyAddress.call();
      assert.ok(myAddress);
      seBalance = web3.eth.getBalance(myAddress);
      traderaBalance = web3.eth.getBalance(accounts[1]);
    });


    it('creates SE', async () => {
      myEvent = await instance.createTrader();
      assert.equal(myAddress, myEvent.logs[0].args.traderadress);
    });

    it('creates traderA', async () => {
      myEvent = await instance.createTrader({
        from: accounts[1]
      });
      assert.equal(accounts[1], myEvent.logs[0].args.traderadress);
    });

    it('creates 100 AAPL stocks', async () => {
      await instance.createStock(100, "Apple", "AAPL");
      let amount = await instance.getMyStock.call("AAPL");
      assert.equal(100, amount);
    });
  });


  describe('BUY AND SELL', function() {

    it('SE creates SELL 5(x'+ wei.toString() +') AAPL', async () => {
      const orderCreated = await instance.createOrder(1, "AAPL", 5, wei, Date.now(), {from: accounts[0]});
      const orderEvent = orderCreated.logs[0];
      sellTimestamp = orderEvent.args.timestamp.toNumber();
      assert.equal(orderEvent.args.owner, accounts[0]);
      assert.equal(orderEvent.args.symbol, "AAPL");
      assert.equal(orderEvent.args.method.toNumber(), 1);
      assert.equal(orderEvent.args.amount.toNumber(), 5);
      assert.equal(orderEvent.args.price.toNumber(), wei);
      sellID = orderEvent.args.id.toNumber();
    });

    it('TraderA creates BUY 5(x'+ wei.toString() +') AAPL', async () => {
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
      buyID = orderEvent.args.id.toNumber();
    });

    it('settles BUY&SELL 5(x'+ wei.toString() +') AAPL', async () => {
      const orderEvent = await instance.settleOrder(buyID, "AAPL", 5, buyTimestamp, sellID, sellTimestamp, myAddress, {
        from: accounts[1],
        value: (wei * 5)
      });
      const settledOrder = orderEvent.logs[0];
      assert.equal(settledOrder.args.buyID.toNumber(), buyID);
      assert.equal(settledOrder.args.sellID.toNumber(), sellID);
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

    it('AAPL latestPrice is '+ wei.toString(), async () => {
      const latestPrice = await instance.getLastPrice("AAPL");
      assert.equal(latestPrice.toNumber(), wei);
    });
  });

});
