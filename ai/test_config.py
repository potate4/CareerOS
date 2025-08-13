# Test Configuration for CareerOS AI Backend
# Copy these values to your .env file or set as environment variables

TEST_CONFIG = {
    "DATABASE_URL": "postgresql://test:test@localhost:5432/careeros_test",
    "SUPABASE_URL": "https://your-project.supabase.co",
    "SUPABASE_ANON_KEY": "your_supabase_anon_key_here",
    "GOOGLE_API_KEY": "your_google_api_key_here",
    "UPLOAD_DIR": "./uploads",
    "FRAME_DIR": "./frames",
    "AUDIO_SEG_DIR": "./audio_segments",
    "BACKEND_URL": "http://localhost:8080",
    "BACKEND_JWT_SECRET": "your_jwt_secret_here"
}

# To use these values, set them as environment variables:
# export DATABASE_URL="postgresql://test:test@localhost:5432/careeros_test"
# export SUPABASE_URL="https://your-project.supabase.co"
# etc.

