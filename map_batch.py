from bitcoinrpc.authproxy import AuthServiceProxy
import simplejson as json
import time
import os, sys
from dotenv import load_dotenv

load_dotenv()

user = os.getenv("RPC_USER")
password = os.getenv("RPC_PASSWORD")
host = os.getenv("RPC_HOST")

rpc_connection = AuthServiceProxy("http://%s:%s@%s:8332"%(user, password,host))

def getBlock(height):
    commands = [ [ "getblockhash", height] ]
    block_hashes = rpc_connection.batch_(commands)
    block = rpc_connection.batch_([ [ "getblock", block_hashes[0] ] ])
    return block

def getTx(block_txid):
    block_tx = []
    loop = 0
    while len(block_tx) < len(block_txid)/100:
        if loop + 100 > len(block_txid):
            #print(loop, len(block_txid))
            block_tx.append(rpc_connection.batch_([ [ "getrawtransaction", block_txid[ind] , True] for ind in range(loop, len(block_txid)) ]))
        else:
            #print(loop, loop + 100)
            block_tx.append(rpc_connection.batch_([ [ "getrawtransaction", block_txid[ind] , True] for ind in range(loop, loop + 100) ]))
        loop += 100

    return block_tx

def getOuts(rawtx):
    outs = []
    for vout in rawtx['vout']:
        if 'addresses' in vout['scriptPubKey']:
            for addr in vout['scriptPubKey']['addresses']:
                txin = {
                    'txidIn': rawtx['txid'],
                    'addr': addr,
                    'out': vout['n'],
                    'value': vout['value'],
                    'blockhash': rawtx['blockhash']
                }
                outs.append(txin)
    return outs

def getIns(tx):
    ins = []
    for vin in tx['vin']:
        if 'coinbase' not in vin:
            txSource = rpc_connection.batch_([ [ "getrawtransaction", vin['txid'] , True] ])
            voutSource = getOuts(txSource[0])
            for out in voutSource:
                if out['out'] == vin['vout']:
                    txout = {
                        'txidOut': txSource[0]['txid'],
                        'addr': out['addr'],
                        'in': vin['vout'],
                        'value': out['value'],
                        'blockhash': txSource[0]['blockhash']
                    }
                    ins.append(txout)
    return ins

def getFees(tx):
    valueOut = 0
    for tab in getOuts(tx):
        valueOut+=tab['value']

    valueIn = 0
    for tab in getIns(tx):
        valueIn+=tab['value']

    fees = valueIn-valueOut
    return fees

def txMapFunction(ins, outs, fees):
    result = {
        'ins': ins,
        'outs': outs,
        'fees': fees
    }
    return result

mapResult = []
start = time.time()
print("start", time.strftime("%H:%M:%S", time.localtime(start)))
#for x in range(1, 11):
#x = rpc_connection.getblockcount()
block = [] 
block_txid = [] 
x = int(sys.argv[1])
block = getBlock(x)

#for each transaction
for txid in block[0]["tx"]:
    block_txid.append(txid)

block_tx = getTx(block_txid)
outs = []
ins = []

mapping = time.time()
print("mapping", time.strftime("%H:%M:%S", time.localtime(time.time())))

for tx_pack in block_tx:
    for tx in tx_pack:
        ins.append(getIns(tx))
        outs.append(getOuts(tx))
    if len(outs)%10 == 0:
        print("outs", len(outs), time.strftime("%H:%M:%S", time.localtime(time.time())))

print("writing in file", time.strftime("%H:%M:%S", time.localtime(time.time())))
"""with open(str(x) + '.json', 'a') as outfile:
    json.dump(mapResult, outfile, indent=4)"""

end = time.time()
print("finish", time.strftime("%H:%M:%S", time.localtime(end)))

duration = end - start
print("duration", time.strftime("%H:%M:%S", time.gmtime(duration)))


