#!/bin/bash

# Setup environment variables for CareerOS Frontend

echo "Setting up environment variables for CareerOS Frontend..."

# Check if .env already exists
if [ -f ".env" ]; then
    echo "Warning: .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled. Your existing .env file was preserved."
        exit 0
    fi
fi

# Copy the example file
cp env.example .env

echo "✅ Environment file created successfully!"
echo ""
echo "📝 Please review and update the following in your .env file:"
echo "   - VITE_API_URL: Your backend API URL (default: http://localhost:8080/api)"
echo "   - VITE_APP_NAME: Your application name"
echo "   - VITE_DEV_MODE: Set to 'false' for production"
echo ""
echo "🚀 You can now start the frontend with: npm run dev" 