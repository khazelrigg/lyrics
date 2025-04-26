#!/bin/bash
cd lyrics-api
source .venv/bin/activate

uvicorn app.main:app --reload
