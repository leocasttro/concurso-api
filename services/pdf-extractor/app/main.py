from fastapi import FastAPI

from app.routes.extract_routes import router as extract_router

app = FastAPI(title="Serviço de Extração de PDF")

app.include_router(extract_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}