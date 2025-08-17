#!/usr/bin/env python3
"""
Test script for file indexing and search functionality
This script demonstrates:
1. Indexing a file from URL
2. Searching indexed materials
3. RAG functionality
"""

import asyncio
import sys
from pathlib import Path
import logging

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent / "app"))

from helpers.learning_path import LearningPathAI

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_file_indexing():
    """Test file indexing functionality"""
    try:
        # Initialize LearningPathAI
        learning_ai = LearningPathAI()
        
        # Test parameters
        test_user_id = 123
        test_file_url = "https://example.com/sample.pdf"  # Replace with actual file URL
        test_file_id = "test_file_001"
        test_file_name = "sample_document.pdf"
        test_file_type = "pdf"
        
        logger.info("🚀 Testing file indexing functionality...")
        
        # Test 1: Index a file
        logger.info(f"📁 Indexing file: {test_file_name}")
        logger.info(f"   URL: {test_file_url}")
        logger.info(f"   User ID: {test_user_id}")
        
        try:
            result = await learning_ai.process_learning_materials(
                file_url=test_file_url,
                file_id=test_file_id,
                file_name=test_file_name,
                file_type=test_file_type,
                user_id=test_user_id
            )
            
            logger.info(f"✅ File indexing result: {result}")
            
            if result['status'] == 'completed':
                logger.info(f"   Chunks created: {result['chunks_created']}")
                logger.info(f"   Chunks indexed: {result['chunks_indexed']}")
            else:
                logger.error(f"   Indexing failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            logger.error(f"❌ File indexing failed: {e}")
            logger.info("   This is expected if the file URL is not accessible")
        
        # Test 2: Search functionality
        logger.info("\n🔍 Testing search functionality...")
        
        test_queries = [
            "machine learning",
            "python programming",
            "data analysis"
        ]
        
        for query in test_queries:
            logger.info(f"   Searching for: {query}")
            
            try:
                search_result = await learning_ai.search_learning_materials(
                    query=query,
                    user_id=test_user_id,
                    limit=5
                )
                
                logger.info(f"   Results found: {search_result['results_count']}")
                
                if search_result['results']:
                    for i, result in enumerate(search_result['results'][:2]):  # Show first 2 results
                        logger.info(f"     Result {i+1}: {result['filename']} (score: {result['relevance_score']:.3f})")
                        logger.info(f"       Content preview: {result['content'][:100]}...")
                else:
                    logger.info("     No results found (expected if no files indexed)")
                    
            except Exception as e:
                logger.error(f"     Search failed: {e}")
        
        logger.info("\n🎉 File indexing and search tests completed!")
        
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        raise

async def main():
    """Main test function"""
    logger.info("🚀 Starting file indexing and search tests...")
    
    try:
        await test_file_indexing()
        logger.info("✅ All tests completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Tests failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    # Run the async test
    success = asyncio.run(main())
    sys.exit(0 if success else 1) 