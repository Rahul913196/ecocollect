from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.database import init_indexes
from app.routers import auth, requests as requests_router, admin, collector, rewards

app = FastAPI(title="EcoCollect API", version="1.0.0")

# ---- CORS ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- Global error handling (Phase 8) ----
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = [
        {"field": ".".join(str(loc) for loc in err["loc"][1:]), "message": err["msg"]}
        for err in exc.errors()
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation failed", "errors": errors},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Something went wrong. Please try again."},
    )


@app.on_event("startup")
async def on_startup():
    await init_indexes()


@app.get("/api/health", tags=["health"])
async def health_check():
    return {"status": "ok"}


# ---- Routers ----
app.include_router(auth.router)
app.include_router(requests_router.router)
app.include_router(admin.router)
app.include_router(collector.router)
app.include_router(rewards.router)
