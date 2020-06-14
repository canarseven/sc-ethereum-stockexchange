pragma solidity >=0.5.0 <0.6.0;

import './Security.sol';

// TODO: OVERHAUL SOLIDITY CODE COMPLETELY -> check for mistakes and push pre final version

contract StockExchangeV2 {

    address owner;  // the owner address should be the account of the stock exchange node

    uint orderID;

    mapping (string => Security) tradableStocks;

    event CreatedOrder(string id, uint timestamp, address owner, uint8 method, string symbol, uint amount, uint price);
    event SettledOrder(string buyID, string sellID);
    event CreatedTrader(address traderadress);
    event CreatedStock(uint totalAmount, string name, string symbol);
    event InvalidatedOrder(string id);

    event TestEvent(bytes32 createHash, bytes32 settleHash);

    struct trader {
        address hin;
        uint balance;
        bool isMember;
    }

    mapping (address => trader) public traders;

    mapping (string => uint) mappedPrice;

    mapping (string => bytes32) allOrders;


    constructor() public{
        owner = msg.sender;
    }


    function createTrader() public {
        trader storage myTrader = traders[msg.sender];
        myTrader.hin = msg.sender;
        myTrader.isMember = true;
        myTrader.balance = 10000;

        emit CreatedTrader(myTrader.hin);
    }


    function createStock(uint256 _totalAmount, string memory _tokenName, string memory _tokenSymbol) public {
        require(msg.sender == owner);
        Security token = new Security(msg.sender, _totalAmount, _tokenName, _tokenSymbol);
        tradableStocks[_tokenSymbol] = token;

        //uint totalAmount, string _name, string _symbol
        emit CreatedStock(_totalAmount, _tokenName, _tokenSymbol);
    }

    //0 = "BUY", 1 = "SELL"
    function createOrder(string memory orderId, uint8 _method, string memory _symbol, uint _amount, uint _price, uint _timestamp) public {
        require(traders[msg.sender].isMember == true);

        //---------------------------------------(orderID, timestamp, method, symbol, amount, price, valid, settled, owner)
        allOrders[orderId] = keccak256(abi.encodePacked(orderId, _timestamp, _method, _symbol, _amount, _price, true, false, msg.sender));

        //uint _id, uint _timestamp, address _owner, string _method, string _symbol, uint _amount, uint _price
        emit CreatedOrder(orderId, _timestamp, msg.sender, _method, _symbol, _amount, _price);
        //orderID++;
    }


    function settleOrder(string memory _BUYid, string memory _symbol, uint totalPrice, uint _amount, uint _BUYtimestamp, string memory _SELLid, uint _SELLtimestamp, address _SELLowner) public {
        
        uint price = totalPrice/_amount;

        bytes32 hashedBuy = keccak256(abi.encodePacked(_BUYid, _BUYtimestamp, uint8(0), _symbol, _amount, price, true, false, msg.sender));
        bytes32 hashedSell = keccak256(abi.encodePacked(_SELLid, _SELLtimestamp, uint8(1), _symbol, _amount, price, true, false, _SELLowner));
        
        require(hashedBuy == allOrders[_BUYid]);
        require(hashedSell == allOrders[_SELLid]);

        Security token = tradableStocks[_symbol];

        trader storage myTrader = traders[msg.sender];
        myTrader.balance -= totalPrice;
        require(myTrader.balance >= 0);
        trader storage seller = traders[_SELLowner];
        seller.balance += totalPrice;
        
        require(token.transfer(_SELLowner, msg.sender, _amount) == true);

        allOrders[_BUYid] = keccak256(abi.encodePacked(_BUYid, _BUYtimestamp, uint8(0), _symbol, _amount, price, true, true, msg.sender));
        allOrders[_SELLid] = keccak256(abi.encodePacked(_SELLid, _SELLtimestamp, uint8(1), _symbol, _amount, price, true, true, _SELLowner));
        mappedPrice[_symbol] = totalPrice/_amount;

        emit SettledOrder(_BUYid, _SELLid);
    }

    function invalidateOrder(string memory orderId, uint8 _method, string memory _symbol, uint _amount, uint _price, uint _timestamp) public {
        bytes32 hashedOrder = keccak256(abi.encodePacked(orderId, _timestamp, _method, _symbol, _amount, _price, true, false, msg.sender));
        require(hashedOrder == allOrders[orderId]);

        allOrders[orderId] = keccak256(abi.encodePacked(orderId, _timestamp, _method, _symbol, _amount, _price, false, false, msg.sender));
        emit InvalidatedOrder(orderId);
    }


    function getMyStock(string memory _symbol) view public returns (uint){
        return tradableStocks[_symbol].balanceOf(msg.sender);
    }


    function getLastPrice(string memory symbol) view public returns (uint) {
        return mappedPrice[symbol];
    }


    function getMyAddress() view public returns (address) {
        return msg.sender;
    }
}

