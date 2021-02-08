# Bitcoin-api

This is an API created to retrieve some data from a bitcoin core full node

## Installation 

1. After cloning the repository, run ``npm install``

2. Create a .env file in the project's folder with the following information:
* RPC_USER=yourUser
* RPC_PASSWORD=yourPassword
* RPC_HOST=yourHostIPAddress

## Usage

Run ``npm start`` to launch the application on port 3000

## Documentation

__localhost:3000/api/getblockhash/:height__

return a block's hash

__localhost:3000/api/getblock/:hash__

return a block

__localhost:3000/api/getblockcount__

return the number of blocks in the longest bitcoin blockchain

__localhost:3000/api/getblockchaininfo__

return information of the blockchain

__localhost:3000/api/getrawtransaction/:txid__

return a transaction

__localhost:3000/api/map/:hash__

return a maps of inputs and outputs of a block
