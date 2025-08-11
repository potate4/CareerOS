from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import Any
from app.core.supabase import supabase

router = APIRouter()

@router.post("/file-upload-and-get-url")
async def upload_file_and_get_url(
    file: UploadFile = File(...),
    
) -> Any:
    contents = await file.read()
    just_file_name = file.filename

    current_time = datetime.now().strftime("%Y%m%d%H%M%S")
    file_name = f"{just_file_name}_{current_time}"
        
    print("upload start")
    response = supabase.storage.from_('utils').upload(file_name, contents, file_options={"content-type": file.content_type})
    print("upload end")
    print(response)

   
    url = supabase.storage.from_('utils').get_public_url(file_name)
    public_url = url.rstrip('?')
    return {"url": public_url}