from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine

from routers.signup import router as signup_router
from routers.login import router as login_router
from routers.verify import router as verify_router

# -------------------------
# Create Database Tables
# -------------------------
Base.metadata.create_all(bind=engine)

# -------------------------
# FastAPI App
# -------------------------
app = FastAPI(
    title="Login Automation API"
)

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Static Files
# -------------------------
app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)

# -------------------------
# Templates
# -------------------------
templates = Jinja2Templates(directory="templates")

# -------------------------
# Include Routers
# -------------------------
app.include_router(signup_router)
app.include_router(login_router)
app.include_router(verify_router)

# -------------------------
# Home Page
# -------------------------
@app.get("/", response_class=HTMLResponse)
def home(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="index.html"
    )

@app.get("/signup-page", response_class=HTMLResponse)
def signup_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="signup.html"
    )

@app.get(
    "/login-page",
    response_class=HTMLResponse
)
def login_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="login.html"
    )


@app.get(
    "/verify-page",
    response_class=HTMLResponse
)
def verify_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="verify.html"
    )

@app.get(
    "/dashboard",
    response_class=HTMLResponse
)
def dashboard(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="dashboard.html"
    )