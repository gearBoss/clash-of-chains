# ChainClash — Turn-Based Card Battler on Base

Async PvP turn-based card battler built as a Base Mini App. Build a 15-card deck from a 40-card pool, challenge other players, and anchor match results onchain.

## Features

- **Deck Builder**: Choose 15 cards from a pool of 40 unique cards (attack, shield, heal, draw, multi-effect)
- **Async PvP**: Create or join matches; alternate turns at your own pace
- **Deterministic Engine**: Server-side simulation with seeded RNG (keccak256-based)
- **Elo Rating**: Skill-based matchmaking; rating deltas stored onchain
- **Onchain Anchoring**: Match results verified via EIP-712 signatures and recorded on Base
- **Anti-Cheat**: Server-validated moves, hash chain integrity, rate limiting, zod input validation

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Web3**: wagmi v2 + viem v2, Base mainnet + Base Sepolia
- **Backend**: Next.js Route Handlers, Prisma + SQLite
- **Smart Contracts**: Solidity + Foundry, OpenZeppelin (EIP-712, ECDSA, Ownable)
- **Testing**: Vitest (server logic), Foundry (contracts)

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_CHAIN="base-sepolia"
NEXT_PUBLIC_CONTRACT_ADDRESS="0x..."
SESSION_SECRET="your-secret-at-least-32-characters-long"
SERVER_SALT="your-server-salt-hex-string"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ANCHOR_SIGNER_PRIVATE_KEY="0x..."
```

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up database
npx prisma generate
npx prisma db push

# 3. (Optional) Seed demo data
npm run db:seed

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy Smart Contract

Requires [Foundry](https://book.getfoundry.sh/getting-started/installation):

```bash
cd contracts

# Install dependencies
forge install foundry-rs/forge-std --no-commit
forge install openzeppelin/openzeppelin-contracts --no-commit

# Run tests
forge test -vvv

# Deploy to Base Sepolia
DEPLOYER_PRIVATE_KEY=0x... ANCHOR_SIGNER_ADDRESS=0x... forge script script/Deploy.s.sol \
  --rpc-url https://sepolia.base.org \
  --broadcast --verify

# Deploy to Base Mainnet
DEPLOYER_PRIVATE_KEY=0x... ANCHOR_SIGNER_ADDRESS=0x... forge script script/Deploy.s.sol \
  --rpc-url https://mainnet.base.org \
  --broadcast --verify
```

After deploying, update `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local`.

## Deploy to Vercel

```bash
vercel
```

Set environment variables in the Vercel dashboard.

## API Endpoints

### Auth
- `GET  /api/auth/nonce` — Get signing nonce
- `POST /api/auth/verify` — Verify wallet signature
- `GET  /api/auth/session` — Check session status
- `DELETE /api/auth/session` — Sign out

### Match
- `POST /api/match/create` — Create a new match
- `POST /api/match/join` — Join an open match
- `POST /api/match/move` — Submit a move (play card or pass)
- `POST /api/match/forfeit` — Forfeit a match
- `POST /api/match/anchor` — Anchor result onchain
- `GET  /api/match/[id]` — Get match details
- `GET  /api/match/list` — List matches (filter by status/player)

### Deck & Profile
- `GET/POST /api/deck` — Get/save deck
- `GET /api/leaderboard` — Leaderboard + recent anchored matches
- `GET /api/profile` — Player profile + match history

## Game Rules

- **HP**: 30 per player
- **Mana**: Starts at 1, increases by 1 each of your turns (max 10)
- **Hand**: Draw 3 initially; draw 1 at the start of each turn (max 8 in hand)
- **Shield**: Absorbs damage before HP; persists until consumed
- **Turn timeout**: 24 hours per move, auto-forfeit on timeout
- **Fatigue**: If your deck and hand are empty at turn start, you lose

## Base Mini App / Farcaster Manifest

The file `public/.well-known/farcaster.json` contains the required manifest.

### Generate accountAssociation

1. Deploy to Vercel and get your production URL
2. Go to [Farcaster Manifest tool](https://farcaster.xyz/~/developers/mini-apps/manifest)
3. Paste your domain, click "Generate account association"
4. Copy the `accountAssociation` values into `public/.well-known/farcaster.json`
5. Update all URLs in the manifest
6. Redeploy

### base.dev Verification Checklist

- [ ] `/.well-known/farcaster.json` accessible at your domain
- [ ] `accountAssociation` fields populated
- [ ] `homeUrl` matches deployed URL
- [ ] `iconUrl` and `imageUrl` point to valid images
- [ ] App loads in frame context
- [ ] Wallet connection works within frame

## Run Tests

```bash
# Server logic tests
npm test

# Smart contract tests
cd contracts && forge test -vvv
```

## Project Structure

```
chain-clash/
├── contracts/                # Solidity + Foundry
│   ├── src/ChainClashArena.sol
│   ├── test/ChainClashArena.t.sol
│   └── script/Deploy.s.sol
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/.well-known/
│   └── farcaster.json
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # Route handlers
│   │   ├── lobby/
│   │   ├── deck-builder/
│   │   ├── match/[id]/
│   │   ├── profile/
│   │   ├── leaderboard/
│   │   └── settings/
│   ├── components/           # React components
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Game engine, utils, config
│   └── __tests__/            # Vitest tests
└── README.md
```
