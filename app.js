let bitGoUTXO = require('@bitgo/utxo-lib');
var bip39 = require('bip39');

const seeds = "...";
const pathh = "m/44'/410'/0'";
const type = 410;
const feeLevel = 10000;
const utxo = {
  "txid": "1c467e1eba579958e9a2db783ab302a97f8d8295fed020776937a06beb5b9204",
  "vout": 1,
  "satoshis": 86960000
}

const out1 = {
  "address": "s1ZeaiTJ64z3vpWemfCrUduQmPzWQn7jkp4",
  "value": 1000000
}

const out2 = {
  "address": "s1eUmEMctBXNsCHJWstDaxxUmVd9hdTtLVR",
  "value": 85950000
}


function getXpriv(coin, privKey, derive, isChange) {
  var network = getNetwork(coin);
  var root = bitGoUTXO.HDNode.fromBase58(privKey, network);
  return root
    .derive(isChange ? 1 : 0)
    .derive(derive)
    .toBase58();
}

function getMaximumFee() {
  return 2500;
}

function getMainXpriv(coin, mnemo, customPath, type) {
  var network = getNetwork(coin);
  var seed = bip39.mnemonicToSeedSync(mnemo);
  var derivedByArgument;
  if (customPath == undefined) {
    var retrieved = bitGoUTXO.HDNode.fromSeedBuffer(seed, network);
    derivedByArgument = retrieved.deriveHardened(44).deriveHardened(type).deriveHardened(0);
  } else {
    customPath = customPath.replace(/'/g, '');
    var split = customPath.split('/');
    var retrieved = bitGoUTXO.HDNode.fromSeedBuffer(seed, network);
    derivedByArgument = retrieved
      .deriveHardened(Number(split[1]))
      .deriveHardened(Number(split[2]))
      .deriveHardened(Number(split[3]));
  }
  return derivedByArgument.toBase58();
}

function getKeypair(coin, xpriv) {
  var network = getNetwork(coin);
  var root = bitGoUTXO.HDNode.fromBase58(xpriv, network);
  return root.keyPair;
}

function getNetwork(coin) {
  switch (coin.toLowerCase()) {
    case bitGoUTXO.networks.bitcoin.coin:
    default:
      return bitGoUTXO.networks.bitcoin;
    case bitGoUTXO.networks.bitcoincash.coin:
      return bitGoUTXO.networks.bitcoincash;
    case bitGoUTXO.networks.bitcoingold.coin:
      return bitGoUTXO.networks.bitcoingold;
    case bitGoUTXO.networks.bitcoinsv.coin:
      return bitGoUTXO.networks.bitcoinsv;
    case bitGoUTXO.networks.dash.coin:
      return bitGoUTXO.networks.dash;
    case bitGoUTXO.networks.litecoin.coin:
      return bitGoUTXO.networks.litecoin;
    case bitGoUTXO.networks.zcash.coin:
      return bitGoUTXO.networks.zcash;
    case bitGoUTXO.networks.tent.coin:
      return bitGoUTXO.networks.tent;
    case bitGoUTXO.networks.bitgreen.coin:
      return bitGoUTXO.networks.bitgreen;
    case bitGoUTXO.networks.digibyte.coin:
      return bitGoUTXO.networks.digibyte;
    case bitGoUTXO.networks.sumcoin.coin:
      return bitGoUTXO.networks.sumcoin;
    // case bitGoUTXO.networks.horizen.coin:
    //   return bitGoUTXO.networks.horizen;
    case bitGoUTXO.networks.dogecoin.coin:
      return bitGoUTXO.networks.dogecoin;
  }
}

function estimatedFee(size, feeLevel) {
  return parseInt(((size * feeLevel) / 1000).toFixed(8));
}

function createTransaction(out1, out2, feeLevel, utxo) {
  const mainPriv = getMainXpriv("zec", seeds, pathh, type);

  var network = getNetwork("zec");
  var txb = new bitGoUTXO.TransactionBuilder(network, getMaximumFee());
  var fees = 0;

  fees = estimatedFee(txb.tx.virtualSize(), feeLevel);

  txb.addInput(utxo.txid, utxo.vout);

  fees = estimatedFee(txb.tx.virtualSize(), feeLevel);

  txb.addOutput(out1.address, out1.value);
  txb.addOutput(out2.address, out2.value);

  txb.setVersion(4)
  txb.setConsensusBranchId(parseInt('0xE9FF75A6', 16))
  txb.setVersionGroupId(parseInt('0x892F2085', 16))


  var priv = getXpriv("zec", mainPriv, 0, false);
  var keyPair = getKeypair("zec", priv);
  txb.sign(0, keyPair, '', bitGoUTXO.Transaction.SIGHASH_ALL, utxo.satoshis);

  console.log("Rawtx", txb.build().toHex())

}

createTransaction(out1, out2, feeLevel, utxo)