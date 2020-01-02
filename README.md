# README

## The 'Ethereum StockExchange' Project

This repo is one of two parts that (together) provide a functioning, decentralized and scalable stock exchange based on Ethereum. This is the smart contract part of the whole project. The other part (django project) is only the frontend and not needed to run this stocke exchange smart contract. Important info: All participants are required to maintain the book keeping themselves by listening to events (creating/matching/canceling an order emits an event to all nodes). Thus, all responsibility is on the trader node as it should be!

The smart contract only ensures that the submitted orders and matched orders are valid (matching price, symbol and amount). This provides an average of 57266 gas consumption per transaction, making >200 transactions per second possible!



## Installation

Here is a list of requirements to run the project:
* Own private ethereum network (Ganache is recommended for testing)
* Install npm if you don't have it already
* Then cd into this projects folder and 'npm install'
* After simply try the contract (e.g. with running Ganache) 'truffle test'

