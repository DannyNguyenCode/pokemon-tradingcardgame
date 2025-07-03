# cardgame
Web Browser Pokemon trading card game, where users can collect, trade, and battle.

## Folder Structure
```bash
.
└── pokemon-tcg/
    ├── app/
    │   ├── lib/
    │   │   └── data.tsx
    │   └── ui/
    │       └── components/
    │           ├── page.tsx
    │           └── layout.tsx
    ├── layout.tsx
    └── page.tsx
```
## Milestones

### Milestone 1 (M1): Foundation & CRUD

#### 1.1 Repo & Monorepo Setup
- ~~Create a GitHub organization or project repo “poketcg”~~
- ~~Decide: monorepo (with web/, api/, infra/) or two repos (poketcg-web, poketcg-api)~~
- ~~Initialize .gitignore, README.md, and license~~

#### 1.2 Back-end: Card Catalog Service
- ~~Tech: Python + Flask + Flask-Smorest~~
- ~~Scaffold: api/ folder with main.py, routers/cards.py, models.py, schemas.py~~
- ~~Connect to Supabase Postgres via asyncpg or Supabase SDK~~
- Implement endpoints:
    - GET /cards (list, paging, basic filters)
    - ~~GET /cards/{id}~~
    - ~~POST /cards (admin only)~~
    - ~~PUT /cards/{id}, DELETE /cards/{id}~~
- ~~Write Pydantic schemas and SQLAlchemy models~~

#### 1.3 Front-end: Card Catalog Page
- ~~Tech: React (CRA or Next.js) + Redux Toolkit~~
- ~~Scaffold app: web/ folder, npm init, ESLint/Prettier, Tailwind config~~
- ~~Create Redux “cards” slice with async thunks for fetchCards()~~
    - decided on a plain reducer
    - no thunk, fetch will be done in the react server component (NextJS Server Side Rendering)
- Build /cards page: grid layout, card components, loading/error states
- Wire environment var REACT_APP_API_URL=http://localhost:8000

#### 1.4 Infra: Docker & Compose
- Infra:
    - Write api/Dockerfile (from previous)
    - Write docker-compose.yml to spin up api + Supabase emulator (or real Supabase)
- Verify: docker-compose up --build, then hit http://localhost:8000/cards

#### 1.5 Testing & CI
- Add pytest tests for the card catalog routes (CRUD & validation)
- Add Jest + React Testing Library tests for the /cards page
- Create GitHub Actions workflow:
    -Lint Python (flake8) & JS (eslint), run tests, build Docker image

### Milestone 2 (M2): Auth, Profiles & Deck Builder

#### 2.1 Back-end: Auth & User Service
- Deploy Supabase Auth or implement Auth.js proxy:
- For custom, create api/routers/auth.py with /signup, /login, /refresh using JWT
- Middleware: enforce JWT on protected routes

#### 2.2 Back-end: Deck Service
- Models: Deck { id, name, user_id }, DeckCard { deck_id, card_id, count }
- Endpoints:
    - GET /decks (user’s decks)
    - POST /decks, PUT /decks/{id}, DELETE /decks/{id}
    - POST /decks/{id}/cards (add/remove cards)
- Business rule: max 4 copies per card, deck size rules

#### 2.3 Front-end: Auth Integration
- Install Auth.js in React; configure providers (email/password + OAuth)
- Build /login, /signup, /profile pages; Redux “auth” slice for tokens/user

#### 2.4 Front-end: Deck Builder Page
- Create /decks and /decks/[id] routes
- Deck list with “Create Deck” modal
- Deck editor: drag/drop or select cards from catalog, show counts, enforce rules
- Save to API; optimistic UI updates

#### 2.5 Infra & CI/CD
- Update docker-compose.yml to include Redis (for rate-limiting or session store) if needed
- Add GitHub Actions step to build and push API Docker image to registry
- Add Vercel integration: on merge to main, deploy web/ folder

### Milestone 3 (M3): Real-Time Play & Trade

#### 3.1 Back-end: Game Logic Service
- New service api-game/ with its own Dockerfile
- Endpoints: POST /matches (create/join), POST /matches/{id}/move
- In-memory or Redis pub/sub for turn events
- Optional: gRPC interface for performance

#### 3.2 Back-end: Trade Service
- Models: TradeOffer { id, user_id, offered: [{card_id,count}], wanted: [...] }
- Endpoints: GET /trades, POST /trades, PUT /trades/{id}/accept, DELETE

#### 3.3 Front-end: Play Arena & Trade Hub
- Play Arena: /play: lobby to select or create matches; WebSocket or polling for game state; board UI
- Trade Hub: /trades: list active offers; create offer modal; accept/counter

#### 3.4 Infrastructure
- Extend docker-compose.yml to include api-game and api-trade services
- Use Docker network for inter-service comms
- Configure NGINX or Traefik reverse proxy for routing /api/catalog, /api/auth, /api/game, /api/trade

#### 3.5 Testing & Observability
- Write Cypress tests for deck vs. match flows and trade scenarios
- Instrument Prometheus metrics in each service; spin up Grafana in compose
- Add load tests (k6) for match—simulate concurrent moves
