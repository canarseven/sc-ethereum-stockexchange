pragma solidity >=0.5.0 <0.6.0;

import './Security.sol';

// TODO: OVERHAUL SOLIDITY CODE COMPLETELY -> check for mistakes and push pre final version

contract PostTradeV2 {

    bytes32 seHash = 0x2cd2f6d41776603d9d1b4527217a2b9540dda145afa56db5e49ae0bc9457da6e;
    address owner;


    uint orderID;


    mapping (string => Security) tradableStocks;


    event CreatedOrder(uint id, uint timestamp, address owner, uint8 method, string symbol, uint amount, uint price);
    event ProcessedOrder(uint buyID, uint sellID);
    event CreatedTrader(address traderadress);
    event CreatedStock(uint totalAmount, string name, string symbol);
    event InvalidatedOrder(uint id);


    struct trader {
        address HIN;
    }


    mapping (address => trader) public traders;

    mapping (string => uint) mappedPrice;

    bytes32[] public allOrders;


    constructor() public{
        bytes32 myAddress = keccak256(abi.encodePacked(msg.sender));
        require(myAddress == seHash);
    }


    function createTrader() public {
        trader storage myTrader = traders[msg.sender];
        myTrader.HIN = msg.sender;

        emit CreatedTrader(myTrader.HIN);
    }


    function createStock(uint256 _totalAmount, string memory _tokenName, string memory _tokenSymbol) public {
        bytes32 myAddress = keccak256(abi.encodePacked(msg.sender));
        require(myAddress == seHash);
        Security token = new Security(msg.sender, _totalAmount, _tokenName, _tokenSymbol);
        tradableStocks[_tokenSymbol] = token;

        //uint totalAmount, string _name, string _symbol
        emit CreatedStock(_totalAmount, _tokenName, _tokenSymbol);
    }

    //0 = "BUY", 1 = "SELL"
    function createOrder(uint8 _method, string memory _symbol, uint _amount, uint _price, uint _timestamp) public {
        allOrders.push(keccak256(abi.encodePacked(orderID, _timestamp, _method, _symbol, _amount, _price, true, false, msg.sender)));
        //uint _id, uint _timestamp, address _owner, string _method, string _symbol, uint _amount, uint _price
        emit CreatedOrder(orderID, _timestamp, msg.sender, _method, _symbol, _amount, _price);
        orderID++;
    }


    function clearOrder(uint _BUYid, string memory _symbol, uint _amount, uint _BUYtimestamp, uint _SELLid, uint _SELLprice, uint _SELLtimestamp, address payable _SELLowner) payable public {

        bytes32 hashedBuy = keccak256(abi.encodePacked(_BUYid, _BUYtimestamp, uint8(0), _symbol, _amount, _SELLprice, true, false, msg.sender));
        bytes32 hashedSell = keccak256(abi.encodePacked(_SELLid, _SELLtimestamp, uint8(1), _symbol, _amount, _SELLprice, true, false, _SELLowner));

        require(hashedBuy == allOrders[_BUYid]);
        require(hashedSell == allOrders[_SELLid]);
        //require(msg.value == _SELLprice * _amount);

        Security token = tradableStocks[_symbol];

        _SELLowner.transfer(msg.value);
        require(token.transfer(_SELLowner, msg.sender, _amount) == true);

        mappedPrice[_symbol] = _SELLprice;

        emit ProcessedOrder(_BUYid, _SELLid);
    }

    function invalidateOrder(uint orderId, uint8 _method, string memory _symbol, uint _amount, uint _price, uint _timestamp) public {
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
