

---

# 💖 LoveFi on Solana

**A playful, on-chain dating and commitment app built on Solana that helps real people find each other, make verifiable commitments, and celebrate their love journey together — with auctions, yield, and real social fun.**

**👩‍💻 Built by:** *Gargi Pathak*

---

## 🌹 Why I Built LoveFi

Modern dating is messy. People struggle to find partners, verify trust, and sustain long-term commitment. Ghosting, dishonesty, and mismatched intentions ruin genuine connections.

So I built **LoveFi**, a **Solana-powered dating and commitment app** that makes relationships *verifiable, gamified, and rewarding*. Couples can stake tokens together, friends can **join the fun through “Love Auctions”**, and milestones unlock **on-chain rewards and NFTs** as the relationship matures.

The goal? To turn trust, time, and love into something transparent, fun, and financially aligned — powered by Solana’s speed and composability.

---

## 💘 What LoveFi Does

1. **Meet & Match:** AI-powered discovery helps people find compatible partners.
2. **Stake & Commit:** Couples lock SOL or SPL tokens into a shared on-chain vault.
3. **Auction the Love:** Friends and fans can **bid in “Love Auctions”** — a playful prediction market for relationships.
4. **Earn & Celebrate:** Milestones trigger automatic rewards, NFTs, and shared yield.
5. **Stay Verifiable:** All commitments, vaults, and milestones live entirely on Solana.

---

## 🧠 Architecture Overview

### 🪞 Frontend

* **React + TypeScript** for a fast, mobile-first user experience
* **Solana Web3.js** for on-chain transactions
* **Tailwind CSS** for clean, expressive UI styling

### ⚙️ On-Chain Logic (Solana Programs)

* **RelationshipRegistry:** Creates unique relationship accounts, emits events like `RelationshipCreated`, `MilestoneReached`, and `StakeUpdated`.
* **LoveVault Program:** Holds the staked SOL or SPL tokens. Time locks, milestone release logic, and yield distribution are all handled within the program.
* **LoveAuction Program:** Allows external users to participate in “Love Auctions,” where they can stake or bid on a couple’s next milestone.
* **Milestone Oracle:** Reads relationship duration and unlocks NFT or SOL rewards for each milestone achieved.

### 🔐 Wallet & Identity

* Integrated using **Solana Wallet Adapter** (Phantom, Solflare, Backpack).
* Seamless single connection and session management.

### 🤖 Agentic Matching

* Powered by **Artificial Superintelligence Alliance (ASI)** tools.
* AI agents parse user preferences, create embeddings, and generate meaningful matches with reduced ghosting and better compatibility.

---

## ⚡ Why Solana

Solana’s **speed, scalability, and cost-efficiency** make it the perfect foundation for a social protocol like LoveFi.

**Benefits:**

* Sub-second confirmations for real-time auction participation
* Micro-transactions possible at near-zero cost
* Solana’s account model enables easy tracking of relationship progress
* On-chain NFTs, auctions, and yield management in one ecosystem

---

## 🪙 Love Auction System

The **Love Auction** is the social heart of LoveFi.

* Friends can bid or stake on a couple’s next milestone (for example, “Will they reach 100 days?”).
* Bidders earn yield or NFTs based on successful predictions.
* Couples gain liquidity and engagement from their social circle.
* Auctions are transparent, time-limited, and fully on-chain — powered by Solana programs.

---

## 🎥 Demo Video

📺 **[Insert Demo Video Link Here – e.g., YouTube or Loom]**

---

## 🖼️ UI Showcase

| Screen                | Description                                     | Image                                   |
| --------------------- | ----------------------------------------------- | --------------------------------------- |
| Home Page             | Browse couples, active auctions, and milestones | ![Home](./assets/ui-home.png)           |
| Relationship Vault    | Stake and view commitment progress              | ![Vault](./assets/ui-vault.png)         |
| Love Auction          | Bid or stake on a couple’s milestone            | ![Auction](./assets/ui-auction.png)     |
| Milestone Celebration | Unlock NFT and claim rewards                    | ![Milestone](./assets/ui-milestone.png) |

*(Replace placeholder images with your actual UI screenshots in `/assets`.)*

---

## 🧩 Core Features

* 💍 On-chain relationship creation and milestone tracking
* 💎 Shared staking vault using SOL or SPL tokens
* 🪄 Social “Love Auctions” for friends to bid on milestones
* 🤖 AI matchmaking via ASI Alliance tools
* 🖼️ NFT milestone rewards
* 💰 Yield-backed commitment incentives

---

## 🧱 Tech Stack

**Frontend:**

* React + TypeScript
* Tailwind CSS
* Vite for local dev and bundling

**Smart Contracts (Programs):**

* Solana + Anchor Framework
* Rust
* Solana Web3.js for client integration

**Backend / AI Layer:**

* ASI Alliance tools for matchmaking
* Node scripts for automated deployment and oracle management

**Wallet Integration:**

* Solana Wallet Adapter (Phantom, Solflare, Backpack)

---

## 🧪 Deployments

| Network | Program              | Address / Explorer |
| ------- | -------------------- | ------------------ |
| Devnet  | RelationshipRegistry | `TBD`              |
| Devnet  | LoveVault            | `TBD`              |
| Devnet  | LoveAuction          | `TBD`              |

🔗 **Solscan / Solana Explorer Links:**
*(Add after deployment)*

---

## 🚀 Getting Started

```bash
git clone https://github.com/gargipathak/lovefi-solana.git
cd lovefi-solana
npm install
npm run dev
```

Connect your wallet (Phantom or Solflare), switch to **Solana Devnet**, and start exploring love on-chain 💞

---

## 💌 Future Roadmap

* Integrate zk-proof-based trust badges for privacy-preserving dating
* Add dynamic NFT art that evolves with relationship milestones
* Introduce community “Love Leaderboards”
* Expand auctions to include matchmaking bounties

---

## 🏆 Submission Info

**Project:** LoveFi
**Track:** Solana Social / Auction Systems
**Hackathon:** Solana Colosseum 2025
**Founder:** Gargi Pathak
**Network:** Solana Devnet

---

## ❤️ Built With Love

Created by **Gargi Pathak**,
for those who believe love deserves to be verifiable, fun, and forever.

---

