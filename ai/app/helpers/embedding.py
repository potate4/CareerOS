from app.core.voyage import voyageClient
from app.core.openai import openaiClient
#################################################################################################
#   Helper function to get the vector embedding for any text
#   input: string, output: multidimensional array representing embedding
#   vector dimension size = 3072
#################################################################################################
def create_embedding(txt):
    embedding_model = "text-embedding-3-large"
    str_embedding = openaiClient.embeddings.create(input= txt, model=embedding_model)
    return str_embedding.data[0].embedding

def create_embedding_with_voyage_large_3(txt):
    texts = [txt]
    result = voyageClient.embed(texts, model="voyage-3-large", input_type="document")
    return result.embeddings[0]