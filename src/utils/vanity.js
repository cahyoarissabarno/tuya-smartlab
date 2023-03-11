/* eslint-env worker */
const secp256k1 = require('secp256k1');
const keccak = require('keccak');
const randomBytes = require('randombytes');

const step = 500;

/**
 * Transform a private key into an address
 */
const privateToAddress = async (privateKey) => {
    const pub = await secp256k1.publicKeyCreate(privateKey, false).slice(1).toString();
    // console.log(pub)
    return await keccak('keccak256').update(pub).digest().slice(-20).toString('hex');
};

/**
 * Create a wallet from a random private key
 */
const getRandomWallet = async () => {
    const randbytes = await randomBytes(32);
    // const addr = await privateToAddress(randbytes).toString('hex')
    console.log(randbytes)
    console.log(privateToAddress(randbytes))
    return {
        // address: privateToAddress(randbytes).toString('hex'),
        address: privateToAddress(randbytes),
        privKey: randbytes.toString('hex')
        
    };
};

/**
 * Check if a wallet respects the input constraints
 */
const isValidVanityAddress = async (address, input, isChecksum, isSuffix) => {
    const subStr = isSuffix ? address.substr(40 - input.length) : address.substr(0, input.length);

    if (!isChecksum) {
        return input === subStr;
    }
    if (input.toLowerCase() !== subStr) {
        return false;
    }

    return isValidChecksum(address, input, isSuffix);
};

const isValidChecksum = async (address, input, isSuffix) => {
    const hash = keccak('keccak256').update(address).digest().toString('hex');
    const shift = isSuffix ? 40 - input.length : 0;

    for (let i = 0; i < input.length; i++) {
        const j = i + shift;
        if (input[i] !== (parseInt(hash[j], 16) >= 8 ? address[j].toUpperCase() : address[j])) {
            return false;
        }
    }
    return true;
};

const toChecksumAddress = async (address) => {
    const hash = keccak('keccak256').update(address).digest().toString('hex');
    let ret = '';
    for (let i = 0; i < address.length; i++) {
        ret += parseInt(hash[i], 16) >= 8 ? address[i].toUpperCase() : address[i];
    }
    return ret;
};

/**
 * Generate a lot of wallets until one satisfies the input constraints
 */
const getVanityWallet = async (input, isChecksum, isSuffix) => {
    // console.log({input, isChecksum, isSuffix})

    input = isChecksum ? input : input.toLowerCase();
    let wallet = await getRandomWallet();
    let attempts = 1;

    // console.log(wallet)

    while (!isValidVanityAddress(wallet.address, input, isChecksum, isSuffix)) {
        if (attempts >= step) {
            // cb({attempts});
            attempts = 0;
        }
        wallet = getRandomWallet();
        attempts++;
    }
    return ({address: '0x' + await toChecksumAddress(wallet.address), privKey: wallet.privKey, attempts});
    // return ({address: '0x' + wallet.address, privKey: wallet.privKey, attempts});
};

// export {getVanityWallet, toChecksumAddress, isValidChecksum, isValidVanityAddress, getRandomWallet, privateToAddress};

// onmessage = function () {
//     // const input = event.data;
//     try {
//         // getVanityWallet(input.hex, input.checksum, input.suffix, (message) => postMessage(message));
//         getVanityWallet('', true, false, (message) => postMessage(message));
//     } catch (err) {
//         self.postMessage({error: err.toString()});
//     }
// };

module.exports = {
    getVanityWallet
};
