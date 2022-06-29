import { before } from 'lodash'
import { tokens, ether, EVM_REVERT, ETHER_ADDRESS } from './helpers'

const Exchange = artifacts.require('./Exchange')
const Token = artifacts.require('./Token')
require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Exchange', ([deployer, feeAccount, user1, user2])=>{
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
	
	describe('Withdrawals', ()=>{

		let result
		let balanceAfterWithdrawal
		let withdrawalAmount
		
		describe('success', ()=>{
			

			describe('token withdrawal', ()=>{
				beforeEach(async()=>{
					let depositAmount = tokens(1)
					await token.approve(exchange.address, depositAmount, { from: user1})
					await exchange.depositTokens(token.address, depositAmount, { from: user1 })
					await exchange.depositEther({ from: user1, value: depositAmount })
					withdrawalAmount = tokens(0.5)
					balanceAfterWithdrawal = depositAmount - withdrawalAmount
					result = await exchange.withdrawTokens(token.address, withdrawalAmount, { from: user1 })
				})
				it ('tracks the token withdrawal', async()=>{
					let balance
					balance = await token.balanceOf(exchange.address)
					balance.toString().should.equal(balanceAfterWithdrawal.toString())
					balance = await exchange.tokens(token.address, user1)
					balance.toString().should.equal(balanceAfterWithdrawal.toString())
				})

				it('emits a withdrawl event', async()=>{
					const log = result.logs[result.logs.length - 1]
					log.event.should.eq('Withdrawal')
					const event  = log.args
					event.token.toString().should.equal(token.address.toString(), 'token address is correct')
					event.user.toString().should.equal(user1, 'user address is correct')
					event.amount.toString().should.equal(withdrawalAmount.toString(), 'amount is correct')
					event.balance.toString().should.equal(balanceAfterWithdrawal.toString(), 'balance is correct')
				})
			})

			describe('ether withdrawl', ()=>{
				beforeEach(async()=>{
					let depositAmount = tokens(1)
					await token.approve(exchange.address, depositAmount, { from: user1})
					await exchange.depositTokens(token.address, depositAmount, { from: user1 })
					await exchange.depositEther({ from: user1, value: depositAmount })
					withdrawalAmount = tokens(0.5)
					balanceAfterWithdrawal = depositAmount - withdrawalAmount
					result = await exchange.withdrawEther(withdrawalAmount, { from: user1 })
				})
				it('tracks the ether withdrawl', async()=>{
					let balance = await exchange.tokens(ETHER_ADDRESS, user1)
					balance.toString().should.equal(balanceAfterWithdrawal.toString())
				})
				it('emits a deposit event', async()=>{
					const log = result.logs[result.logs.length - 1]
					log.event.should.eq('Withdrawal')
					const event = log.args
					event.token.toString().should.equal(ETHER_ADDRESS.toString(), 'Using Eth address')
					event.user.toString().should.equal(user1, 'user address is correct')
					event.amount.toString().should.equal(withdrawalAmount.toString(), 'amount is correct')
					event.balance.toString().should.equal(balanceAfterWithdrawal.toString(), 'balance is correct')
				})
			})
		})

		describe('failure', async()=>{
			beforeEach(async()=>{
				withdrawalAmount = tokens(20)
			})

			it('reverts when there\'s insufficient tokens', async()=>{
				await exchange.withdrawTokens(token.address, withdrawalAmount, { from: user1 }).should.be.rejectedWith(EVM_REVERT)
			})

			it('reverts when there\'s insufficient ether', async()=>{
				await exchange.withdrawEther(withdrawalAmount, { from: user1 }).should.be.rejectedWith(EVM_REVERT)
			})

		})
	})

	describe('fallback', ()=>{

		it('reverts when Ether is sent', async()=>{
			await exchange.sendTransaction({ value: 1, from: user1 }).should.be.rejectedWith(EVM_REVERT)
		})

	})

	describe('making orders', async()=>{
		let result

		beforeEach(async()=>{
			result = await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), { from: user1 })
		})

		it('tracks the newly created order', async()=>{
			const orderCount = await exchange.orderCount()
			orderCount.toString().should.equal('1')
			const order = await exchange.orders('1')
			order.id.toString().should.equal('1', 'id is correct')
			order.user.should.equal(user1, 'user is correct')
			order.tokenGet.should.equal(token.address, 'tokenGet is correct')
			order.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
			order.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
			order.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
			order.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
		})

		it('emits an "Order" event', async()=>{
			const log = result.logs[0]
			log.event.should.eq('Order')
			const event = log.args
			event.id.toString().should.equal('1', 'id is correct')
			event.user.should.equal(user1, 'user is correct')
			event.tokenGet.should.equal(token.address, 'tokenGet is correct')
			event.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
			event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
			event.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
			event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
		})

	})

	describe('order actions', async()=>{

		beforeEach(async()=>{
			await exchange.depositEther({from: user1, value: ether(1)})
			await token.transfer(user2, tokens(100), {from: deployer})
			await token.approve(exchange.address, tokens(2), {from: user2})
			await exchange.depositTokens(token.address, tokens(2), {from: user2})
			await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), {from:user1})
		})

		describe('filling orders', async()=>{
			let result

			describe('success', async()=>{
				beforeEach(async()=>{
					result = await exchange.fillOrder('1', {from: user2})
				})

				it('executes the trade & charges fees', async()=>{
					let balance
					balance = await exchange.balanceOf(token.address, user1)
					balance.toString().should.equal(tokens(1).toString(), 'user1 received tokens')
					balance = await exchange.balanceOf(ETHER_ADDRESS, user2)
					balance.toString().should.equal(ether(1).toString(),'user2 received Ether')
					balance =  await exchange.balanceOf(ETHER_ADDRESS, user1)
					balance.toString().should.equal('0', 'user1 Ether deducted')
					balance = await exchange.balanceOf(token.address, user2)
					balance.toString().should.equal(tokens(0.9).toString(), 'user2 tokens deducted with fee applied')

					const feeAccount = await exchange.feeAccount()
					balance = await exchange.balanceOf(token.address, feeAccount)
					balance.toString().should.equal(tokens(0.1).toString(), 'feeAccount receive fee')
				})

				it('emits a "Trade" event', async()=>{
					const log = result.logs[0]
					log.event.should.eq('Trade')
					const event = log.args
					event.id.toString().should.equal('1', 'id is correct')
					event.user.should.equal(user1, 'user is correct')
					event.tokenGet.should.equal(token.address, 'tokenGet is correct')
					event.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
					event.tokenGive.toString().should.equal(ETHER_ADDRESS, 'tokenGive is correct')
					event.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
					event.filledBy.should.equal(user2, 'filledBy is correct')
					event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
				})

				it('updates filled orders', async()=>{
					const orderFilled = await exchange.ordersFilled(1)
					orderFilled.should.equal(true)
				})
			})

			describe('failure', async()=>{
				it('rejects invalid order ids', async()=>{
					const invalidOrderId = 99999
					await exchange.fillOrder(invalidOrderId, {from:user2})
						.should.be.rejectedWith(EVM_REVERT)
				})

				it('rejects already-filled orders', async()=>{
					await exchange.fillOrder('1', {from:user2}).should.be.fulfilled
					await exchange.fillOrder('1', {from:user2}).should.be.rejectedWith(EVM_REVERT)
				})

				it('rejects concelled orders', async()=>{
					await exchange.cancelOrder('1', {from:user1}).should.be.fulfilled
					await exchange.fillOrder('1', {from:user2}).should.be.rejectedWith(EVM_REVERT)
				})
			})
		})

		describe('cancelling orders', async()=>{
			let result
			
			describe('success', async()=>{
				beforeEach(async()=>{
					result = await exchange.cancelOrder('1', {from: user1})
				})

				it('updates cancelled orders', async()=>{
					const orderCancelled = await exchange.ordersCancelled(1)
					orderCancelled.should.equal(true)
				})

				it('emits a  "Cancel" event', async()=>{
					const log = result.logs[0]
					log.event.should.eq('Cancel')
					const event = log.args
					event.id.toString().should.equal('1', 'id is correct')
					event.user.should.equal(user1, 'user is correct')
					event.tokenGet.should.equal(token.address, 'tokenGet is correct')
					event.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
					event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
					event.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
					event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
				})
			})

			describe('faliure', async()=>{
				it('rejects invalid order ids', async()=>{
					const invalidOrderId = 99999
					await exchange.cancelOrder(invalidOrderId, {from: user1})
						.should.be.rejectedWith(EVM_REVERT)
				})

				it('rejects unauthorized cancelations', async()=>{
					await exchange.cancelOrder('1', {from: user2})
						.should.be.rejectedWith(EVM_REVERT)
				})
			})
		})
	})


})