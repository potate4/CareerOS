import qdrant_client
from app.core.config import settings

qdrantClient = qdrant_client.QdrantClient(url= settings.QDRANT_HOST, api_key = settings.QDRANT_API_KEY)
