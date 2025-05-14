# 🚀 Auto-Claim-Faucet-Sol-Testnet

A simple, colorful Node.js CLI bot for auto-claiming Solana Devnet faucet airdrop to multiple wallets, with proxy support and countdown timer.

---

## ✨ Features

- **Automatic SOL claim** for all wallets in `wallets.txt`
- **Proxy support** (HTTP/HTTPS/SOCKS5) via `proxies.txt` (or direct if empty)


## 📦 Installation

1. **Clone this repo**

   ```
   git clone https://github.com/PetrukStar/Auto-Faucet-Sol-Testnet.git
   cd Auto-Claim-Faucet-Sol-Testnet
   ```

2. **Install dependencies:**
```
npm install http-proxy-agent@latest https-proxy-agent@latest socks-proxy-agent@latest
```

3. **Prepare your files:**
   - `wallets.txt` — one Solana address per line.
   - `proxies.txt` — one proxy per line, or leave empty for direct connection.

---

## 🚦 Usage

```
node index.js 60
````

- **interval** (optional) — claim interval in seconds (default: 86400, i.e. 24 hours).
  - Example: `node index.js 60` (claim every 60 seconds)

---

## 🙏 Credits

- Script by **@PetrukStar**
- Inspired by Solana faucet

---

## ⚠️ Disclaimer

- **For educational purposes only.**  
- Do not use to spam faucets or for malicious activity.

