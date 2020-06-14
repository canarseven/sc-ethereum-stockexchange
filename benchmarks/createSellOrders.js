'use strict';

module.exports.info  = 'Creating Sell Orders';

const fs = require('fs');

const contractID = 'ethexchange';
const version = 'v1';

let bc, ctx, clientArgs, clientIdx;

const symbols = ["AAPL", "SNAP", "FB", "TMUS", "GOOA", "NVDA", "PNW", "SPLK", "MLK", "VLK"]
const names = ["Apple Inc.", "Snap Inc.", "Facebook", "TMobile US", "Alphabet Inc.", "NVIDIA", "Palo Alto Networks", "Splunk Inc.", "Mlunk Inc.", "Vlunk Inc."]

var sellTimestamps = [];

var sellOrders = [];

var orderId = 0;

var myHin;

module.exports.init = async function(blockchain, context, args) {
    bc = blockchain;
    ctx = context;
    clientArgs = args;
    //clientIdx = context.clientIdx.toString();
    var myArgs = {
        verb: 'getMyAddress',
        args: []
    };
	var hinTx = await bc.querySmartContract(ctx, contractID, version, myArgs);
	console.log(hinTx);
	var hin = hinTx[0].status.result.toString('utf8');
	console.log(hin);
	myHin = hin;
    return Promise.resolve();
};

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

module.exports.run = function() {
    const symbol = clientArgs.symbol;

    const quantity = clientArgs.quantity;
    const price = clientArgs.price;

    // ----- Create Sell Order -----
    var sellTimestamp = Date.now().toString();
    sellTimestamps.push(sellTimestamp);

    var myArgs = {
        verb: 'createOrder',
        args: ["KS"+orderId.toString(), '1', symbol, quantity, price, sellTimestamp]
    };
	let orderObject = {
                    "orderId": "KS"+orderId.toString(),
                    "symbol": symbol,
                    "quantity": quantity,
                    "price": price,
                    "method": "1",
                    "timestamp": sellTimestamp,
                    "valid": "true",
                    "processed": "false",
                    "traderHin": myHin
    };
	sellOrders.push(orderObject);
    try {
		orderId++;
        return bc.invokeSmartContract(ctx, contractID, version, myArgs);
    } catch (error) {
        return console.log(`SELLORDER ${error}`);
    }
};

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}

module.exports.end = async function() {
    const sellStream = fs.createWriteStream('selltimestamps.txt');
    const sellPath = sellStream.path;

    sellOrders.forEach(value => sellStream.write(`${JSON.stringify(value)}\n`));
    sellStream.on('finish', () => {
        console.log(`wrote all the array data to file ${sellPath}`);
    });
    sellStream.on('error', (err) => {
        console.error(`There is an error writing the file ${sellPath} => ${err}`)
    });
    sellStream.end();

    return Promise.resolve();
};
