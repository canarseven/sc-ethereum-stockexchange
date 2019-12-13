pragma solidity >=0.5.0 <0.6.0;

contract Security {

    address ownerContract;      //address of the PostTrade contract the stock exchange has deployed

    uint256 totalSupply;
    mapping (address => uint256) public balances;
    mapping (address => mapping (address => uint256)) public allowed;

    event Approval(address owner, address spender, uint256 value);
    event Transfer(address _from, address _to, uint256 value);

    string name;
    string symbol;

    constructor(address owner, uint256 _initialAmount, string memory _tokenName, string memory _tokenSymbol) public {
        balances[owner] = _initialAmount;
        totalSupply = _initialAmount;
        name = _tokenName;
        symbol = _tokenSymbol;
        ownerContract = msg.sender;
    }

    function transfer(address _from, address _to, uint256 _value) payable public returns (bool success) {
        require(balances[_from] >= _value);
        balances[_from] -= _value;
        balances[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function balanceOf(address _trader) external view returns (uint256 balance) {
        return balances[_trader];
    }

    function approve(address _spender, uint256 _value) internal returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) internal view returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }
}
