import { tokens, EVM_REVERT } from './helpers'

const Token = artifacts.require('./Token')
require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Token', ([deployer, receiver])=>{
	const name = 'Shinos'
	const symbol = 'SHIN'
	const decimals = '18'
	const totalSupply = tokens(1000000).toString();
	let token

	beforeEach(async()=>{
		token = await Token.new()
	})

	describe('deployment', ()=>{
		it('has a name', async ()=>{
			const result = await token.name()
			result.should.equal(name)  
		})

		it('has a symbol', async ()=>{
			const result = await token.symbol()
			result.should.equal(symbol)  
		})

		it('has a decimals', async ()=>{
			const result = await token.decimals()
			result.toString().should.equal(decimals)   
		})

		it('has a total supply', async ()=>{
			const result = await token.totalSupply()
			result.toString().should.equal(totalSupply)   
		})

		it('assigns the total supply to the deployer', async()=>{
			const result = await token.balanceOf(deployer)
			result.toString().should.equal(totalSupply)
		})
	})

	describe('token transfer', ()=>{
		let result
		let amount

		describe('success',()=>{
			beforeEach(async ()=>{
				amount = tokens(100)
				result = await token.transfer(receiver, amount, { from: deployer })
			})


			it('can transfer tokens', async()=>{
				let balanceOf
				balanceOf = await token.balanceOf(deployer)
				balanceOf.toString().should.equal(tokens(999900).toString())
				balanceOf = await token.balanceOf(receiver)
				balanceOf.toString().should.equal(tokens(100).toString())
			})

			it('emits a fransfer event', async()=>{
				const log = result.logs[0]
				log.event.should.eq('Transfer')
				const event = log.args
				event.from.toString().should.equal(deployer, 'from is correct')
				event.to.toString().should.equal(receiver, 'receiver is correct')
				event.value.toString().should.equal(amount.toString(), 'value is correct')
			})
		})
		describe('failure',()=>{
			it('rejects insufficent balances', async()=>{
				let invalidAmount
				invalidAmount = tokens(1000000000)
				await token.transfer(receiver, invalidAmount, { from: deployer })
					.should.be.rejectedWith(EVM_REVERT)

				//transfer from empty wallet
				invalidAmount = tokens(10)
				await token.transfer(deployer, invalidAmount, { from: receiver })
					.should.be.rejectedWith(EVM_REVERT)
			})

			it('rejects invalid recipients', async()=>{
				await token.transfer(0x0, amount, { from: deployer })
					.should.be.rejected
			})
		})
	})

})