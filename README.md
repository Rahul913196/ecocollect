# EcoCollect — Plastic Waste Collection & Recycling Platform

A full-stack platform where households request plastic pickups, collectors fulfill
them, and completed pickups earn reward points redeemable in a marketplace.

**Stack:** React (Vite) · FastAPI · MongoDB · JWT Auth

---

## Project structure

```
ecocollect/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, error handlers
│   │   ├── config.py        # env-based settings
│   │   ├── database.py      # Motor (async MongoDB) client + indexes
│   │   ├── security.py      # password hashing + JWT
│   │   ├── models.py        # Pydantic request/response schemas
│   │   ├── deps.py          # get_current_user, require_role guards
│   │   └── routers/
│   │       ├── auth.py       # register / login / me
│   │       ├── requests.py   # create + list pickup requests (user)
│   │       ├── admin.py      # approve / reject / assign / analytics
│   │       ├── collector.py  # pickup / complete + reward crediting
│   │       └── rewards.py    # product catalog + order redemption
│   ├── seed.py               # creates a default admin + sample products
│   └── requirements.txt
└── frontend/
    └── src/
        ├── api/axios.js          # axios instance + JWT interceptor
        ├── context/AuthContext.jsx
        ├── components/           # Navbar, ProtectedRoute, RequestCard
        └── pages/                # Home, Login, Register, dashboards, etc.
```

## Setup

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # edit MONGO_URI / JWT_SECRET as needed

# Make sure MongoDB is running locally, or point MONGO_URI at Atlas

python seed.py                # creates admin@ecocollect.com / Admin@123
uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs` (FastAPI's auto-generated
Swagger UI — useful to demo in an interview).

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:8000/api
npm run dev
```

App runs at `http://localhost:5173`.

### 3. Try it out

1. Register a **user** account (or a **collector** account from the sign-up dropdown).
2. Log in as the seeded **admin** (`admin@ecocollect.com` / `Admin@123`) to approve
   requests, assign collectors, and view analytics.
3. As the user: submit a pickup on **Sell Plastic**, track it on **My Requests**.
4. As admin: **Approve** → **Assign** a collector.
5. As the collector: **Mark picked up** → **Mark completed** — this credits the
   user's reward points automatically.
6. Back as the user: spend points in **Rewards**.

---

## Build order followed (matches the original plan)

- [x] **Phase 1** — React + Vite setup · FastAPI setup · MongoDB connection · Git repo
- [x] **Phase 2** — Home page · Navbar · Login · Register
- [x] **Phase 3** — Register API · Login API · JWT · Protected routes
- [x] **Phase 4** — User Dashboard · Sell Plastic page · Create Request API · My Requests
- [x] **Phase 5** — Admin Dashboard · Approve request · Reject request · Assign collector
- [x] **Phase 6** — Collector Dashboard · Pickup · Complete request
- [x] **Phase 7** — Reward system · Products · Orders · Analytics
- [x] **Phase 8** — Validation · Error handling · Loading states · Responsive design · Deployment

## Deployment (Phase 8)

- **Frontend:** deploy `frontend/` to Vercel or Netlify (set `VITE_API_URL` to your
  deployed backend URL as an environment variable).
- **Backend:** deploy `backend/` to Render or Railway (set `MONGO_URI`,
  `JWT_SECRET`, `FRONTEND_ORIGIN` as environment variables).
- **Database:** use MongoDB Atlas for a free managed cluster; whitelist your
  backend host's IP (or `0.0.0.0/0` for quick testing).

## Notes for your resume / interview

- Auth uses **bcrypt** password hashing + **JWT bearer tokens**; protected routes
  are enforced both on the backend (`require_role` dependency) and the frontend
  (`ProtectedRoute` component).
- Role-based access control across three roles: **user**, **admin**, **collector**.
- Request status moves through a real state machine:
  `pending → approved → assigned → picked_up → completed` (or `rejected`).
- Reward points are calculated server-side (`kg × rate`) only when a collector
  marks a request **completed**, so points can't be gamed from the client.
