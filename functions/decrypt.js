const bitcoinjs = require('bitcoinjs-lib')

module.exports = (vout) =>{
    //console.log('vout', vout);
    let asm = vout.scriptPubKey.asm.split(" ");
    let suppliedKey = asm[0];
    var hex = suppliedKey.replace(/^0x/, "");
    var b = Buffer.from(hex, "hex");
    //console.log('b',b);
    //console.log( bitcoinjs.ECPair.fromPublicKey(b, {compressed:false}) ); 
    let keypair = bitcoinjs.ECPair.fromPublicKey(b, {compressed:false}).publicKey;
    let addr = bitcoinjs.payments.p2pkh({pubkey: keypair}).address;
    return addr;
}
