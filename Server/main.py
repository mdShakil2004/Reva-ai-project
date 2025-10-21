# main.py
# Entry point for the FastAPI application
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from createConnection import get_database
 # should print True
from routes.image_api import router as image_api_router


from controllers.chat_controller import router as chat_router

from controllers.search_controller import router as search_router


#  for voice 
from routes import voiceRoute

# Initialize the FastAPI app
app = FastAPI(title="Image Search API")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React-Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the image search routes

# Include routers
app.include_router(chat_router, prefix="/api/chat")
app.include_router(search_router, prefix="/api/search")
# Include the authentication routes from routers/auth.py
app.include_router(auth_router)


app.include_router(image_api_router, prefix="/api")

# including voice router
app.include_router(voiceRoute.router, prefix="/api", tags=["Voice"])

# Startup event to establish MongoDB connection
@app.on_event("startup")
async def startup_event():
    # Initialize MongoDB connection before server starts
    get_database()  # This will print "db connected" in the terminal



@app.get("/")
async def root():
    # Basic root endpoint to verify the API is running
    return {"message": "Image Search API is running"}