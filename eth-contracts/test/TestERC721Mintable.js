var PropertyTitleERC721Token = artifacts.require('PropertyTitleERC721Token');

contract('TestERC721Mintable', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];
    const account_three = accounts[2];
    const totalSupply = 10;

    describe('match erc721 spec', function () {

        before(async function () {
            this.contract = await PropertyTitleERC721Token.new({ from: account_one });

            // mint multiple tokens
            for (let i = 0; i < totalSupply; i++) {
                await this.contract.mint(account_two, i, { from: account_one });
            }
        })

        it('should return total supply', async function () {
            let supply = await this.contract.totalSupply.call();

            assert.equal(supply, totalSupply, "Total supply is incorrect");
        })

        it('should get token balance', async function () {
            let balance = await this.contract.balanceOf.call(account_two);
            assert.equal(balance, 10, "Incorrect balance count for account_two");
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () {
            let tokenURI = await this.contract.tokenURI.call(1);
            assert.equal(tokenURI, "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1", "Incorrect tokenURI");

            let tokenURI2 = await this.contract.tokenURI.call(2);
            assert.equal(tokenURI2, "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/2", "Incorrect tokenURI");
        })

        it('should transfer token from one owner to another', async function () {
            let tokenId = 1;
            await this.contract.transferFrom(account_two, account_three, tokenId, { from: account_two });
            let newOwner = await this.contract.ownerOf.call(tokenId);
            assert.equal(newOwner, account_three, "Token failed to transfer");
        })
    });

    describe('have ownership properties', function () {
        before(async function () {
            this.contract = await PropertyTitleERC721Token.new({ from: account_one });
        })

        it('should fail when minting when address is not contract owner', async function () {
            let success = true;

            try {
                await this.contract.mint(account_three, 11, { from: account_two });
            }
            catch (e) {
                success = false;
            }

            assert.equal(success, false, "only the contract owner can mint tokens");
        })

        it('should return contract owner', async function () {
            let currentOwner = await this.contract.getOwner.call();
            assert.equal(currentOwner, account_one, "Incorrect owner");
        })

    });
})