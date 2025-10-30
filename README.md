# Proof of Life

Verify your life — together we prove the world's still here.

This is a Web3 mini app that enables users to verify their existence and claim LIFE tokens through World ID verification. The app demonstrates proof of life through blockchain technology and human verification.

## Basic Commands used

1. Connect Wallet or Wallet Auth using Next Auth for Sessions
2. Verify With World ID Command requesting Orb verification level to proceed.
3. Send Transaction for minting and send the user a $TUTE ERC 20 token just for being verified. This refreshes every 5 minutes.

---

## Dependencies

- **[pnpm](https://pnpm.io/)**: Fast and efficient package manager.
- **[ngrok](https://ngrok.com/)**: Expose your local server publicly for easy testing.
- **[mini-kit-js](https://www.npmjs.com/package/@worldcoin/mini-kit-js)**: JavaScript SDK for World's Mini Apps.
- **[minikit-react](https://www.npmjs.com/package/@worldcoin/minikit-react)**: React bindings for MiniKit SDK.
- **[mini-apps-ui-kit-react](https://www.npmjs.com/package/@worldcoin/mini-apps-ui-kit-react)**: Pre-built UI components for Mini Apps.

---

## 🛠️ Setup

### 1. Clone the repository

```bash
git clone https://github.com/mateosauton/MiniAppWeb3template.git
cd MiniAppWeb3template
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure your environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then fill in the required variables:

#### 🔑 APP_ID

Find your **App ID** in the [Developer Portal](https://developer.worldcoin.org/) (`Configuration > Basic`).

#### Incognito Action

Define an _action_ in the developer portal under the Incognito Actions tab, copy it, and include it in the .env file

---

## ▶️ Running the Project

Run your Mini App locally:

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Testing on Mobile

To test your Mini App directly on your phone, expose your app publicly using NGROK.

### 🚀 Using NGROK

Install [NGROK](https://ngrok.com/) and run:

```bash
ngrok http http://localhost:3000
```

NGROK provides a publicly accessible URL.

### 🌎 Configuring Your App (Developer Portal)

Go to the [Developer Portal](https://developer.worldcoin.org/) and configure:

- **App URL:** Set it to your NGROK-generated URL.

<img width="400" alt="image" src="https://github.com/user-attachments/assets/4d2c2c1b-cab4-40a7-ad6d-f91d1a77ecc5" />

---

### 📱 Opening your Mini App in World App

From the [Developer Portal](https://developer.worldcoin.org/), navigate to `Configuration > Basic` and scan the generated QR code.

---

## 📞 Contact

Questions or feedback? Feel free to reach out!

- **Telegram:** [@mateosauton](https://t.me/mateosauton)

---

## 🔗 Useful Links

- [World Documentation](https://docs.world.org/)
- [Developer Portal](https://developer.worldcoin.org/)

---
## World Chain Context
- World Chain runs on the OP Stack and is part of the Superchain, using the EVM for execution and Ethereum for data availability and finality.
- World Chain adds unique-human primitives via World ID. Orb-only verification (Group ID = 1) enables strong sybil resistance with on-chain nullifier tracking.
- This repo targets Worldchain Mainnet with real World ID integration for zero-knowledge proof verification.

## Contracts Overview
- `LIFE` (ERC-20, upgradeable): Orb-gated daily claims, signing bonus, region tracking, authorized minting by `Economy`.
- `Property` (ERC-721, upgradeable): Property NFTs with levels, yield rates, daily income, buyback mechanics.
- `LimitedEdition` (ERC-721, upgradeable): Template-based collectibles minted by `Economy`.
- `PlayerRegistry` (upgradeable): Player region, status score, check-ins; owner/authorized updaters manage registration.
- `Economy` (upgradeable): Central hub for purchases (LIFE or WLD), fees, exchange rates, income generation, buyback, and optional World ID–exclusive properties.

All core contracts use OpenZeppelin `Initializable`, `UUPSUpgradeable`, `OwnableUpgradeable`; `Economy` adds `ReentrancyGuardUpgradeable`.

## World ID Integration (Production)
- Router: Real World ID Router on Worldchain Mainnet (`0x17B354dD2595411ff79041f930e491A4Df39A278`).
- Group ID: `1` (orb-only). App ID: `app_960683747d9e6074f64601c654c8775f`. Action: `proof-of-life`.
- LIFE contract verifies ZK proofs, validates signal, and tracks nullifiers to prevent double claims.

Further details: `smart-contract/docs/WORLDCHAIN_SETUP.md` and `smart-contract/docs/contracts.md`.
