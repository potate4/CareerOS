from app.core.config import settings
from langchain_huggingface import HuggingFaceEmbeddings
#################################################################################################
#   Helper function to get the vector embedding for any text
#   input: string, output: multidimensional array representing embedding
#   vector dimension size = 3072
#################################################################################################
def create_embedding(txt):
    embedding_model = settings.EMBEDDING_MODEL
    str_embedding = HuggingFaceEmbeddings(model=embedding_model).embed_query(txt)
    return str_embedding
