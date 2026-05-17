"""
Main API for Wat Course.
"""

from fastapi import FastAPI
from .routers import courses, programs, search
from .db import lifespan

app = FastAPI(lifespan=lifespan)
app.include_router(courses.router)
app.include_router(programs.router)
app.include_router(search.router)