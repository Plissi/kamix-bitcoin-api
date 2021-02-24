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
    blockhash = rpc_connection.getblockhash(height)
    block = rpc_connection.getblock(blockhash)
    return block

def getTx(txid):
    rawtx = rpc_connection.getrawtransaction(txid, True)
    return rawtx

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
            txSource = getTx(vin['txid'])
            voutSource = getOuts(txSource)

            for out in voutSource:
                if out['out'] == vin['vout']:
                    txout = {
                        'txidOut': tx['txid'],
                        'addr': out['addr'],
                        'in': vin['vout'],
                        'value': out['value'],
                        'blockhash': tx['blockhash']
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
x = sys.argv[1]
block = getBlock(x)

#for each transaction
for i in block['tx']:
    rawtx = getTx(i)
    mapResult.append(txMapFunction(getIns(rawtx), getOuts(rawtx), getFees(rawtx)))

print("writing in file", time.strftime("%H:%M:%S", time.localtime(time.time())))
with open(str(x) + '.json', 'a') as outfile:
    json.dump(mapResult, outfile, indent=4)

end = time.time()
print("finish", time.strftime("%H:%M:%S", time.localtime(end)))

duration = end - start
print("duration", time.strftime("%H:%M:%S", time.gmtime(duration)))


