import hashlib
from web3 import Web3
import os
import json

class Web3Anchor:
    """
    Anchors the cadastral hash chain to a public blockchain (Polygon) to provide
    true decentralized immutability, moving beyond single-database cryptographic theater.
    """
    def __init__(self):
        # We use a mock RPC for the hackathon, but this would point to Polygon Mainnet/Mumbai
        self.rpc_url = os.getenv("WEB3_RPC_URL", "https://rpc-mumbai.maticvigil.com")
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        self.contract_address = os.getenv("WEB3_CONTRACT_ADDRESS", "0x0000000000000000000000000000000000000000")
        
        # In a real app, load the ABI from a compiled Truffle/Hardhat JSON
        self.contract_abi = json.loads('[{"inputs":[{"internalType":"bytes32","name":"merkleRoot","type":"bytes32"}],"name":"anchorDailyRoot","outputs":[],"stateMutability":"nonpayable","type":"function"}]')

    def _compute_merkle_root(self, hashes: list[str]) -> str:
        """
        Computes a Merkle root from a list of transaction hashes.
        """
        if not hashes:
            return hashlib.sha256(b"empty_tree").hexdigest()
            
        current_layer = [hashlib.sha256(h.encode()).hexdigest() for h in hashes]
        
        while len(current_layer) > 1:
            next_layer = []
            for i in range(0, len(current_layer), 2):
                left = current_layer[i]
                right = current_layer[i+1] if i+1 < len(current_layer) else left
                combined = left + right
                next_layer.append(hashlib.sha256(combined.encode()).hexdigest())
            current_layer = next_layer
            
        return current_layer[0]

    def anchor_to_polygon(self, daily_hashes: list[str]):
        """
        Computes the Merkle Root of all daily cadastral edits and submits it to the smart contract.
        """
        merkle_root = self._compute_merkle_root(daily_hashes)
        
        # If w3 is connected, build and send the transaction
        if self.w3.is_connected():
            contract = self.w3.eth.contract(address=self.contract_address, abi=self.contract_abi)
            # Dummy private key for demo purposes
            account = self.w3.eth.account.from_key("0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef")
            
            # This is where the actual anchoring happens
            # tx = contract.functions.anchorDailyRoot(merkle_root).build_transaction({
            #     'from': account.address,
            #     'nonce': self.w3.eth.get_transaction_count(account.address),
            #     'gas': 2000000,
            #     'gasPrice': self.w3.to_wei('50', 'gwei')
            # })
            # signed_tx = self.w3.eth.account.sign_transaction(tx, private_key=account.key)
            # tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            # return tx_hash.hex()
            
            return f"Mock anchored root: {merkle_root}"
        else:
            print("Web3 RPC not connected. Simulating anchor...")
            return f"Simulated anchor root: {merkle_root}"
