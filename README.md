# Health Watchers

**AI-assisted Electronic Medical Records (EMR) powered by Stellar blockchain.**  
*Adapted from [CIVRA-INC/LumenHealth](https://github.com/CIVRA-INC/LumenHealth) as a monorepo scaffold (10% implementation). Full patient management, encounters, payments on Stellar testnet/mainnet, AI insights.*

## 🚀 Quick Start

```bash
npm install
cp .env.example .env  # Configure STELLAR_NETWORK=testnet, API_PORT=3001, etc.
npm run dev
```

- **Web App**: http://localhost:3000 (Next.js dashboard)
- **API**: http://localhost:3001/health (Express backend)
- **Stellar Service**: Runs on configured port (blockchain ops)

## 🏗️ Architecture (Monorepo with Turbo)

```
health-watchers/
├── apps/
│   ├── api/          # Express API: auth, patients, encounters, payments, AI
│   ├── web/          # Next.js frontend: dashboard pages
│   └── stellar-service/ # Stellar Horizon SDK: payments, tx verification
├── packages/
│   ├── config/       # Shared config (ports, DB, Stellar network)
│   └── types/        # Shared TypeScript types
├── turbo.json        # Build orchestration
└── package.json      # Root workspaces
```

### Key Features (10% Scaffold)
- **Patient/Encounter Management**: CRUD API stubs with Prisma models.
- **Stellar Payments**: Create intents, verify tx, testnet funding.
- **Auth**: JWT, RBAC middleware.
- **Web Dashboard**: Stub pages with API integration.
- **AI Module**: Routes stubbed for future ML insights.

## 📁 Structure Details
- **API**: Modular (modules/auth, patients, etc.), /api/v1/* endpoints.
- **Stellar**: Handles payment ops on Stellar Horizon (testnet default).
- **Shared**: Config from `@health-watchers/config`.

## 🛠️ Development

| Script | Description |
|--------|-------------|
| `npm run dev` | Parallel dev: web + api + stellar-service |
| `npm run build` | Turbo build all |
| `npm run lint` | ESLint across workspaces |

### Environment Vars (.env.example provided post-setup)
```
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
API_PORT=3001
DATABASE_URL=...
JWT_SECRET=...
```

## 🔮 Roadmap (Beyond 10%)
- Full AI (patient analytics).
- Real-time WebSockets.
- Mobile app.
- Mainnet payments.

## 🤝 Contributing
Fork → Branch → PR. See [CONTRIBUTING.md](CONTRIBUTING.md) (TBD).

**Powered by Stellar – Decentralized health payments.**

