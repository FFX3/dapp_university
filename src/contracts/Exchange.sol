pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Token.sol";

contract Exchange {
	using SafeMath for uint;

	address public feeAccount;
	uint256 public feePercent;
	mapping(address => mapping(address => uint256)) public tokens;
	address constant ETHER = address(0); //save space by storing Eth in the tokens mapping
	mapping(uint256=> _Order)public orders;
	uint256 public orderCount;

	event Deposit(address token, address user, uint256 amount, uint256 balance);
	event Withdrawal(address token, address user, uint256 amount, uint256 balance);
	event Order(
		uint id,
		address user,
		address tokenGet,
		uint amountGet,
		address tokenGive,
		uint amountGive,
		uint timestamp
	);

	struct _Order {
		uint id;
		address user;
		address tokenGet;
		uint amountGet;
		address tokenGive;
		uint amountGive;
		uint timestamp;
	}

	constructor (address _feeAccount, uint256 _feePercent) public{
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}

	function() external{
		revert();
	}

	function depositEther() payable public {
		tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
		emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
	}

	function withdrawEther(uint _amount) public {
		tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
		msg.sender.transfer(_amount);
		emit Withdrawal(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
	}
	
	
	function depositTokens(address _token, uint256 _amount) public {
		require(_token != ETHER);
		require(Token(_token).transferFrom(msg.sender, address(this), _amount));
		tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
		emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}

	function withdrawTokens(address _token, uint _amount) public {
		require(Token(_token).transfer(msg.sender, _amount));
		tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
		emit Withdrawal(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}

	function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint _amountGive) public {
		orderCount = orderCount.add(1);
		orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
		emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
	}
}