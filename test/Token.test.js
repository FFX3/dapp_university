import { tokens } from './helpers'

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

				it('can transfer tokens', async()=>{
					let balanceOf_receiver = await token.balanceOf(receiver)
					let balanceOf_sender = await token.balanceOf(deployer)
					console.log("receiver balance", balanceOf_receiver.toString())
					console.log("deployer balance", balanceOf_sender.toString())

					await token.transfer(receiver, tokens(100).toString(), { from: deployer })

					balanceOf_receiver = await token.balanceOf(receiver)
					balanceOf_sender = await token.balanceOf(deployer)
					console.log("receiver balance", balanceOf_receiver.toString())
					console.log("deployer balance", balanceOf_sender.toString())

					balanceOf_sender.toString().should.equal(tokens(999900).toString())
					balanceOf_receiver.toString().should.equal(tokens(100).toString())
				})
    })

})