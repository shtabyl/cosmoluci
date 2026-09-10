from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes.artwork_routes import router as artwork_router
from routes.reference_routes import router as reference_router
from routes.owners_routes import router as owners_router

app = FastAPI()
app.include_router(artwork_router)
app.include_router(reference_router)
app.include_router(owners_router)

app.mount("/images", StaticFiles(directory="../storage"), name="images")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




