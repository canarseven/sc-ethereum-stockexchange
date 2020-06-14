'use strict';

module.exports.info  = 'Creating Buy Orders';

const fs = require('fs');

const contractID = 'ethexchange';
const version = 'v1';

let bc, ctx, clientArgs, clientIdx;

const symbols = ["AAPL", "SNAP", "FB", "TMUS", "GOOA", "NVDA", "PNW", "SPLK", "MLK", "VLK"]
const names = ["Apple Inc.", "Snap Inc.", "Facebook", "TMobile US", "Alphabet Inc.", "NVIDIA", "Palo Alto Networks", "Splunk Inc.", "Mlunk Inc.", "Vlunk Inc."]

var buyTimestamps = [];

var buyOrders = [];

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

    // ----- Create Buy Order -----
    //createOrder(final Context ctx, String method, String symbol, String quantity, String price, String timestamp)
    var buyTimestamp = Date.now().toString();
    buyTimestamps.push(buyTimestamp);

    var myArgs = {
        verb: 'createOrder',
        args: ["KB"+orderId.toString(), '0', symbol, quantity, price, buyTimestamp]
    };
	let orderObject = {
                    "orderId": "KB"+orderId.toString(),
                    "symbol": symbol,
                    "quantity": quantity,
                    "price": price,
                    "method": "0",
                    "timestamp": buyTimestamp,
                    "valid": "true",
                    "processed": "false",
                    "traderHin": myHin
    };
	buyOrders.push(orderObject);
    try {
        //console.log(`${clientIdx} BUYING ${quantity} ${symbol}@${price}€`);
		orderId++;
        return bc.invokeSmartContract(ctx, contractID, version, myArgs);
    } catch (error) {
        return console.log(`BUYORDER ${error}`);
    }
};

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}

module.exports.end = async function() {
    const buyStream = fs.createWriteStream('buytimestamps.txt');
    const buyPath = buyStream.path;

    // write each value of the array on the file breaking line
    buyOrders.forEach(value => buyStream.write(`${JSON.stringify(value)}\n`));
    // the finish event is emitted when all data has been flushed from the stream
    buyStream.on('finish', () => {
        console.log(`wrote all the array data to file ${buyPath}`);
    });
    // handle the errors on the write process
    buyStream.on('error', (err) => {
        console.error(`There is an error writing the file ${buyPath} => ${err}`)
    });
    // close the stream
    buyStream.end();

    return Promise.resolve();
};
