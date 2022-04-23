var SolnSquareVerifier = artifacts.require('SolnSquareVerifier');
const Verifier = artifacts.require("Verifier");

const Proof = require("../../zokrates/code/square/proof");

contract('TestSolnSquareVerifier', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];

    describe('test SolnSquareVerifier', function () {
        
        before(async function () { 
            let verifier = await Verifier.new({ from: accounts[0] });

            this.contract = await SolnSquareVerifier.new(verifier.address, {from: accounts[0]});
        });

        // Test if a new solution can be added for contract - SolnSquareVerifier
        // Test if an ERC721 token can be minted for contract - SolnSquareVerifier
        // since addSolution is internal it cannot be tested directly, it is tested via calling mintNFT
        it('should mint a ERC721 token', async function () { 
            let account_two_bal = await this.contract.balanceOf(account_two);
            assert.equal(account_two_bal, 0, "balance should be zero");

            await this.contract.mintNFT(account_two, 21, Proof.proof, Proof.inputs, {from: account_one});

            let ownerAddress = await this.contract.ownerOf.call(21, {from: account_one});

            assert.equal(account_two, ownerAddress, "Token not minted correctly");
            
        });

        it('mint fails as solution already used', async function () { 
            let success = true;

            try {
                await this.contract.mintNFT(account_two, 22, Proof.proof, Proof.inputs, {from: account_one});
            }
            catch (e) {
                success = false;
            }

            assert.equal(success, false, "mint should fail as solution alreday exists");
            
        });

    });

})

