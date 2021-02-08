#Bitcoin-api

This is an API created to retrieve some data from a bitcoin core full node

##Installation 

1. After cloning the repository, run ``npm install``

2. Create a .env file in the project's folder with the following information:
RPC_USER=yourUser
RPC_PASSWORD=yourPassword
RPC_HOST=yourHostIPAddress

##Usage

Run ``npm start`` to launch the application on port 3000

##Documentation

localhost:3000/api/getblockhash/:height
return a block's hash

localhost:3000/api/getblock/:hash
return a block

localhost:3000/api/getblockcount
return the number of blocks in the longest bitcoin blockchain

localhost:3000/api/getblockchaininfo
return information of the blockchain

localhost:3000/api/getrawtransaction/:txid
return a transaction

localhost:3000/api/map/:hash
return a maps of inputs and outputs of a block
