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
	mapping(uint256=>bool) public ordersCancelled;
	mapping(uint256=>bool) public ordersFilled;

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
	
	event Cancel(
		uint id,
		address user,
		address tokenGet,
		uint amountGet,
		address tokenGive,
		uint amountGive,
		uint timestamp
	);

		event Trade(
		uint id,
		address user,
		address tokenGet,
		uint amountGet,
		address tokenGive,
		uint amountGive,
		address filledBy,
		address feeToken,
		uint feeAmount,
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

	function _fetchOrder(uint256 _id) internal returns(_Order storage) {
		_Order storage _order = orders[_id];
		require(_order.id == _id);
		return _order;
	}

	function cancelOrder(uint256 _id) public {
		_Order storage _order = _fetchOrder(_id);
		//must be user's order
		require(address(_order.user) == msg.sender);
		ordersCancelled[_id] = true;
		emit Cancel(_order.id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, now);
	}

	function fillOrder(uint256 _id) public {
		require(!ordersFilled[_id]);
		require(!ordersCancelled[_id]);
		//fetch the order
		_Order storage _order = _fetchOrder(_id);
		_trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive);
		//mark order as filled
		ordersFilled[_order.id] = true;
	}

	function _trade(uint256 _orderId, address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) internal {
		
		uint256 _feeAmount = _amountGet.mul(feePercent).div(100);
		//execute the order
		tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender].sub(_amountGet.add(_feeAmount));
		tokens[_tokenGet][_user] = tokens[_tokenGet][_user].add(_amountGet);
		//charge fees
		tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount].add(_feeAmount);
		tokens[_tokenGive][_user] = tokens[_tokenGive][_user].sub(_amountGive);
		tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender].add(_amountGive);
		//emit trade event
		emit Trade(_orderId, _user, _tokenGet, _amountGet, _tokenGive, _amountGive, msg.sender, _tokenGet, _feeAmount, now);
	}

	function balanceOf(address _token, address _user) public view returns (uint256) {
			return tokens[_token][_user];
	}
}