const fs = require('fs');
const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');
const HttpProxyAgent = require('http-proxy-agent');
const { SocksProxyAgent } = require('socks-proxy-agent');
const chalk = require('chalk');

function showBanner() {
    console.log(
        chalk.cyan.bold('=========================================\n') +
        chalk.yellow.bold('🚀 Auto-Claim-Faucet SOLANA TESTNET 🚀 🤖\n') + // !!!
        chalk.white('Created by: ') + chalk.green('@PetrukStar\n') +
        chalk.white('EVM Address: ') + chalk.green('0x2E8cF27819D18D935596915c4066E8198cBEd795\n') +
        chalk.cyan.bold('=========================================')
    );
}

function showDisclaimer() {
    console.log(chalk.green("⚠️  WARNING: Do not use this script to spam the faucet! Please use it responsibly.\n"));
}

function loadWallets(filename) {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        return data.split('\n').map(line => line.trim()).filter(Boolean);
    } catch (err) {
        console.error(chalk.redBright(`❌ Unable to read file ${filename}: ${err.message}`));
        return [];
    }
}

function loadProxies(filename) {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        return data.split('\n').map(line => line.trim()).filter(Boolean);
    } catch (err) {
        return [];
    }
}

function getProxyAgent(proxy) {
    if (!proxy) return null;
    if (proxy.startsWith('socks5://')) {
        return new SocksProxyAgent(proxy);
    } else if (proxy.startsWith('http://')) {
        return new HttpProxyAgent(proxy);
    } else if (proxy.startsWith('https://')) {
        return new HttpsProxyAgent(proxy);
    } else {
        return null;
    }
}

async function claimFaucet(address, amountSol = 1, agent = null) {
    const lamports = amountSol * 1_000_000_000;
    const payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "requestAirdrop",
        "params": [address, lamports]
    };

    try {
        const response = await axios.post("https://api.testnet.solana.com", payload, { // Ganti devnet -> testnet
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000,
            httpsAgent: agent,
            httpAgent: agent
        });

        if (response.data.result) {
            console.log(chalk.greenBright(`🎉 ${address}: Claimed ${amountSol} SOL successfully! Tx: ${response.data.result}`));

            const balance = await getBalance(address, agent);
            if (balance !== null) {
                console.log(chalk.blueBright(`💰 ${address}: Current balance: ${balance.toFixed(2)} SOL`));
            }
        } else {
            const errMsg = response.data.error ? response.data.error.message : 'Unknown error';
            console.log(chalk.redBright(`❌ ${address}: Failed - ${errMsg}`));
        }
    } catch (err) {
        console.log(chalk.redBright(`❌ ${address}: Error - ${err.message}`));
    }
}

async function getBalance(address, agent = null) {
    const payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getBalance",
        "params": [address]
    };

    try {
        const response = await axios.post("https://api.testnet.solana.com", payload, { // Ganti devnet -> testnet
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000,
            httpsAgent: agent,
            httpAgent: agent
        });

        if (response.data.result && response.data.result.value !== undefined) {
            return response.data.result.value / 1_000_000_000;
        } else {
            throw new Error(response.data.error ? response.data.error.message : 'Unknown error');
        }
    } catch (err) {
        console.error(chalk.redBright(`❌ Failed to fetch balance for ${address}: ${err.message}`));
        return null;
    }
}

async function autoClaim(wallets, amountSol, intervalSeconds, proxyList) {
    console.log(chalk.yellowBright(`\n⏳ Auto claim is active every ${intervalSeconds} seconds... (Press Ctrl+C to stop)\n`));
    const proxy = getWorkingProxy(proxyList);
    const agent = getProxyAgent(proxy);

    while (true) {
        for (const address of wallets) {
            await claimFaucet(address, amountSol, agent);
            await new Promise(res => setTimeout(res, 10000));
        }

        console.log(chalk.greenBright(`\n✅ One round finished. Waiting ${intervalSeconds} seconds for the next round...\n`));

        const balances = [];
        for (const address of wallets) {
            const balance = await getBalance(address, agent);
            balances.push({ address, balance });
        }

        let remaining = intervalSeconds;
        const countdown = setInterval(() => {
            process.stdout.write(chalk.yellowBright(`⏳ Next round in ${remaining} seconds...\r`));
            remaining--;

            if (remaining % 10 === 0) {
                console.log(chalk.cyanBright("\n💰 Wallet Balances:"));
                for (const { address, balance } of balances) {
                    console.log(
                        balance !== null
                            ? chalk.blueBright(`- ${address}: ${balance.toFixed(2)} SOL`)
                            : chalk.redBright(`- ${address}: Failed to fetch balance`)
                    );
                }
            }

            if (remaining < 0) {
                clearInterval(countdown);
            }
        }, 1000);

        await new Promise(res => setTimeout(res, intervalSeconds * 1000));
        console.log('\n');
    }
}

function getWorkingProxy(proxyList) {
    if (!proxyList || proxyList.length === 0) {
        return null;
    }
    const proxy = proxyList[0];
    console.log(chalk.greenBright(`🌐 Using proxy: ${proxy}`));
    return proxy;
}

async function main() {
    showBanner();
    showDisclaimer();

    const wallets = loadWallets('wallets.txt');
    if (wallets.length === 0) {
        console.error(chalk.redBright("❌ No wallets found in wallets.txt!"));
        process.exit(1);
    }

    const proxies = loadProxies('proxies.txt');
    const intervalSeconds = process.argv[2] ? parseInt(process.argv[2]) : 86400; // Default to 24 hours
    await autoClaim(wallets, 1, intervalSeconds, proxies);
}

main();