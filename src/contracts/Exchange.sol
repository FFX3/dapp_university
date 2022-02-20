pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Token.sol";

contract Exchange {
	address public feeAccount;
	uint256 public feePercent;

	constructor (address _feeAccount, uint256 _feePercent) public{
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}
	
	function depositTokens(address _token, uint256 _amount) public {
		Token(_token).transferFrom(msg.sender, address(this), _amount);
	}
}