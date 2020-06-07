'use strict';

module.exports.info  = 'Template callback';

const util = require('util');

const contractID = 'ethexchange';
const version = 'v1';

let bc, ctx, clientArgs, clientIdx;

let overrides = {
    gasLimit: 750000
};

const symbols = ["AAPL", "SNAP", "FB", "TMUS", "GOOA", "NVDA", "PNW", "SPLK", "MLK", "VLK"]
const names = ["Apple Inc.", "Snap Inc.", "Facebook", "TMobile US", "Alphabet Inc.", "NVIDIA", "Palo Alto Networks", "Splunk Inc.", "Mlunk Inc.", "Vlunk Inc."]

module.exports.init = async function(blockchain, context, args) {
    bc = blockchain;
    ctx = context;
    clientArgs = args;

    //console.log(bc.eth.accounts);

    // -------------- createTrader() --------------
    var myArgs = {
        verb: 'createTrader',
        args: []
    };

    try {
        console.log("Creating Trader");
        await bc.invokeSmartContract(ctx, contractID, version, myArgs);
    } catch (error) {
        console.log(error);
    }

    for (let i=0; i<clientArgs.securities; i++) {
        try {
            const symbol = symbols[i];
            const name = names[i];
            const quantity = 1000;
            console.log(`Creating asset ${symbol}`);
            const myArgs = {
                verb: 'createStock',
                args: [quantity, name, symbol]
            };
            await bc.invokeSmartContract(ctx, contractID, version, myArgs);
        } catch (error) {
            console.log(`Smart Contract threw with error: ${error}` );
        }
    }
    return Promise.resolve();
};

module.exports.run = function() {
    var randomIndex = Math.floor(Math.random() * (clientArgs.securities-1))
    const symbol = symbols[randomIndex];
    const myArgs = {
                verb: 'getMyStock',
                args: [symbol]
            };
    return bc.querySmartContract(ctx, contractID, version, myArgs);
};

module.exports.end = async function() {
    return Promise.resolve();
};
