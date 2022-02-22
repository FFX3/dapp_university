import { tokens, ether, EVM_REVERT, ETHER_ADDRESS } from './helpers'

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
		
		describe('success', ()=>{

			describe('token deposits', ()=>{
				beforeEach(async()=>{
					amount = tokens(10)
					await token.approve(exchange.address, amount, { from: user1})
					result = await exchange.depositTokens(token.address, amount, { from: user1 })
				})
				it ('tracks the token deposit', async()=>{
					let balance
					balance = await token.balanceOf(exchange.address)
					balance.toString().should.equal(amount.toString())
					balance = await exchange.tokens(token.address, user1)
					balance.toString().should.equal(amount.toString())
				})

				it('emits a deposit event', async()=>{
					const log = result.logs[0]
					log.event.should.eq('Deposit')
					const event  = log.args
					event.token.toString().should.equal(token.address.toString(), 'token address is correct')
					event.user.toString().should.equal(user1, 'user address is correct')
					event.amount.toString().should.equal(amount.toString(), 'amount is correct')
					event.balance.toString().should.equal(amount.toString(), 'balance is correct')
				})
			})

			describe('ether deposits', ()=>{
				beforeEach(async()=>{
					amount = ether(10)
					result = await exchange.depositEther({ from: user1, value: amount })
				})
				it('tracks the ether deposit', async()=>{
					let balance = await exchange.tokens(ETHER_ADDRESS, user1)
					balance.toString().should.equal(amount.toString())
				})
				it('emits a deposit event', async()=>{
					const log = result.logs[0]
					log.event.should.eq('Deposit')
					const event = log.args
					event.token.toString().should.equal(ETHER_ADDRESS.toString(), 'Using Eth address')
					event.user.toString().should.equal(user1, 'user address is correct')
					event.amount.toString().should.equal(amount.toString(), 'amount is correct')
					event.balance.toString().should.equal(amount.toString(), 'balance is correct')
				})
			})
		})

		describe('failure', async()=>{
			it('rejects Ether deposits', async()=>{
				await exchange.depositTokens(ETHER_ADDRESS, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
			})

			it('fails when no tokens were approved', async()=>{
				await exchange.depositTokens(token.address, amount, { from: user1 }).should.be.rejectedWith(EVM_REVERT)
			})
		})
	})

	describe('fallback', ()=>{
		it('reverts when Ether is sent', async()=>{
			await exchange.sendTransaction({ value: 1, from: user1 }).should.be.rejectedWith(EVM_REVERT)
		})
	})
})