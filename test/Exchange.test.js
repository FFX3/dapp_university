import { tokens, EVM_REVERT } from './helpers'

const Exchange = artifacts.require('./Exchange')
const Token = artifacts.require('./Token')
require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Exchange', ([deployer, feeAccount, user1])=>{
	let exchange
	let feePercent = 10;
	let token

	beforeEach(async()=>{
		token = await Token.new()
		await token.transfer(user1, tokens(100), { from: deployer })
		exchange = await Exchange.new(feeAccount, feePercent)
	})

	describe('deployment', ()=>{
		it('tracks the fee account', async()=>{
			const result = await exchange.feeAccount()
			result.should.equal(feeAccount)
		})

		it('tracks the fee percent', async()=>{
			const result = await exchange.feePercent()
			result.toString().should.equal(feePercent.toString())
		})
	})

	describe('deposits', ()=>{
		let result
		let amount
		
		beforeEach(async()=>{
			amount = tokens(10)
			await token.approve(exchange.address, amount, { from: user1})
			result = await exchange.depositTokens(token.address, amount, { from: user1 })
		})
		describe('success', ()=>{
			it ('tracks the token deposit', async()=>{
				let balance
				balance = await token.balanceOf(exchange.address)
				balance.toString().should.equal(amount.toString())
			})
		})
	})
})