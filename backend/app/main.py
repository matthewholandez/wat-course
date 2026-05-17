"""
Main API for Wat Course.
"""

from fastapi import FastAPI
from .routers import courses
from .db import lifespan

app = FastAPI(lifespan=lifespan)
app.include_router(courses.router)