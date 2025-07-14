from fastapi import FastAPI
from app.api.v1.api import api_router_v1
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(api_router_v1, prefix="/api/v1") 

origins = [
    # "*"
    "http://localhost:5173",
    "http://localhost:5174",
    "https://shrobon-audio.web.app",
    "https://audio.shrobon.com",
]

allow_credentials = True
allow_methods = ["*"]  
allow_headers = ["*"]  
expose_headers = ["*"] 

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials = allow_credentials,
    allow_methods=allow_methods,  
    allow_headers=allow_headers,  
)
# Dummy Endpoint
@app.get("/")
async def get_welcome_message():
   return "DEV Server Audio analytics"


# gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app -b 0.0.0.0:8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)