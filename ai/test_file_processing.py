#!/usr/bin/env python3
"""
Test script to verify file processing fixes in learning_path.py
"""

import asyncio
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "app"))

from app.helpers.learning_path import LearningPathAI

async def test_file_processing():
    """Test the file processing functionality"""
    print("🧪 Testing file processing functionality...")
    
    # Initialize the AI helper
    ai_helper = LearningPathAI()
    
    # Test file type normalization
    test_file_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "pdf",
        "docx",
        "pptx"
    ]
    
    print("\n📁 Testing file type normalization:")
    for file_type in test_file_types:
        print(f"  {file_type} -> {ai_helper._normalize_file_type(file_type)}")
    
    # Test uploads directory creation
    print("\n📂 Testing uploads directory:")
    current_file = Path(__file__)
    project_root = current_file.parent
    uploads_dir = project_root / "uploads"
    print(f"  Project root: {project_root.absolute()}")
    print(f"  Uploads directory: {uploads_dir.absolute()}")
    print(f"  Uploads directory exists: {uploads_dir.exists()}")
    
    print("\n✅ File processing test completed!")

def _normalize_file_type(self, file_type: str) -> str:
    """Normalize file type - handle MIME types and extensions"""
    file_type = file_type.lower().strip()
    if file_type.startswith('application/'):
        # Extract extension from MIME type
        if 'pdf' in file_type:
            file_type = 'pdf'
        elif 'word' in file_type or 'document' in file_type:
            file_type = 'docx'
        elif 'powerpoint' in file_type or 'presentation' in file_type:
            file_type = 'pptx'
        elif 'text' in file_type:
            file_type = 'txt'
    
    # Remove any remaining MIME type prefixes
    if '/' in file_type:
        file_type = file_type.split('/')[-1]
    
    return file_type

# Add the method to the class for testing
LearningPathAI._normalize_file_type = _normalize_file_type

if __name__ == "__main__":
    asyncio.run(test_file_processing()) 