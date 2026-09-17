from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes.artwork_routes import router as artwork_router
from routes.reference_routes import router as reference_router
from routes.owners_routes import router as owners_router
from routes.auth_routes import router as auth_router

app = FastAPI()
app.include_router(artwork_router)
app.include_router(reference_router)
app.include_router(owners_router)
app.include_router(auth_router)

app.mount("/images", StaticFiles(directory="../storage"), name="images")

allowed_origins = [
    # Production
    "https://cosmoluci.art",
    "https://www.cosmoluci.art",

    # Local development
    "http://localhost:5500",
    "http://127.0.0.1:5500",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],
    allow_headers=[
        "Content-Type",
        "X-CSRF-Token",
    ],
)




