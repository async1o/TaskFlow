import logging
import asyncio

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from routers import router
from db.db import create_db


app = FastAPI()
app.include_router(router)

origins = [
    'http://localhost:5173',
     'http://127.0.0.1:5173',
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}



if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    asyncio.run(create_db())

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
