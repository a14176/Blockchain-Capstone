// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./ERC721Mintable.sol";
// define a contract call to the zokrates generated solidity contract <Verifier> or <renamedVerifier>
import "./Verifier.sol";

// define another contract named SolnSquareVerifier that inherits from your ERC721Mintable class
contract SolnSquareVerifier is PropertyTitleERC721Token {
    Verifier private verifier;

    constructor(address verifierAddress) public {
        verifier = Verifier(verifierAddress);
    }

    //  define a solutions struct that can hold an index & an address
    struct Solution {
        bytes32 index;
        address ownerAddress;
    }

    //  define an array of the above struct
    Solution[] private solutions;

    //  define a mapping to store unique solutions submitted
    mapping(bytes32 => Solution) submittedSolutions;

    //  Create an event to emit when a solution is added
    event SolutionAdded(bytes32 index, address ownerAddress);

    // Create a function to add the solutions to the array and emit the event
    // this is internal as used by mintNFT only
    function addSolution(Verifier.Proof memory proof, uint256[2] memory input)
        internal
    {
        bytes32 key = getKey(proof, input);

        require(submittedSolutions[key].index == 0, "Solution must be unique.");
        require(
            verifier.verifyTx(proof, input),
            "Unable to verify the solution"
        );

        // solution is valid so add it to the array & mapping for future reference
        Solution memory newSol = Solution({
            index: key,
            ownerAddress: msg.sender
        });

        solutions.push(newSol);
        submittedSolutions[key] = newSol;

        emit SolutionAdded(key, newSol.ownerAddress);
    }

    // Create a function to mint new NFT only after the solution has been verified
    //  - make sure the solution is unique (has not been used before)
    //  - make sure you handle metadata as well as tokenSuplly
    function mintNFT(
        address to,
        uint256 tokenId,
        Verifier.Proof memory proof,
        uint256[2] memory input
    ) public {
        addSolution(proof, input);
        super.mint(to, tokenId);
    }

    function getKey(Verifier.Proof memory proof, uint256[2] memory input)
        internal
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encodePacked(
                    proof.a.X,
                    proof.a.Y,
                    proof.b.X,
                    proof.b.Y,
                    proof.c.X,
                    proof.c.Y,
                    input
                )
            );
    }
}
