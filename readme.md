# Bitcoin-api

This is an API created to retrieve some data from a bitcoin core full node

## Installation 

1. After cloning the repository, run ``npm install``

2. Create a .env file in the project's folder with the following information:
* RPC_USER=yourUser
* RPC_PASSWORD=yourPassword
* RPC_HOST=yourHost
* DB_URI=yourDataBase

## Usage

Run ``npm start`` to launch the application on port 3000

## Documentation

The following routes should be opened in a web browser




__http://localhost:3000/api/getblockhash/:height__

Returns a block's hash.

__http://localhost:3000/api/getblock/:hash__

Returns a block.

__http://localhost:3000/api/getblockcount__

Returns the number of blocks in the longest bitcoin blockchain.

__http://localhost:3000/api/getblockchaininfo__

Returns information of the blockchain.

__http://localhost:3000/api/getrawtransaction/:txid__

Returns a transaction.

__http://localhost:3000/api/map/:height__

Returns a map of inputs and outputs of a block.

__http://localhost:3000/api/python-map/:height__

Returns a map of inputs and outputs of a block from python script.

__http://localhost:3000/api/transactions?page=p&limit=l__

Returns page number *p* with *l* transactions present in the database. (Replace *p* and *l* by the page number and the number of element to display)

__http://localhost:3000/api/transaction/?search=:txid__

Returns all the entries and outputs of a transaction in the database.

__http://localhost:3000/api/address/?search=:addr__

Returns all the entries and outputs of a transaction with a particular address in the database.

**NOTE**: ':addr', ':txid', ':height' and ':hash' are parameters and should be replaced by an actual value
