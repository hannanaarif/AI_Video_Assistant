import os 

from langchain_community.vectorstores import Chroma 
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

CHROMA_DIR = "vector_db"
COLLECTION_NAME = "meeting_transcript"

_embeddings = None

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        print("Initializing OpenAIEmbeddings (text-embedding-3-small)...")
        api_key = os.getenv("OPENAI_API_KEY")
        _embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            api_key=api_key,
            check_embedding_ctx_length=False
        )
    return _embeddings

def build_vector_store(transcript : str)->Chroma:
    embeddings = get_embeddings()

    # Clean old database files on disk BEFORE creating Chroma instance to avoid SQLite locks
    if os.path.exists(CHROMA_DIR):
        try:
            import shutil
            shutil.rmtree(CHROMA_DIR)
        except Exception as e:
            print(f"[VectorStore Reset Note] {e}")

    splitter = RecursiveCharacterTextSplitter(
        separators = ["\n\n", "\n", ". ", "? ", "! ", " "],
        chunk_size = 1200,
        chunk_overlap = 200
    )
    chunks = splitter.split_text(transcript)
    print(f"Building fresh Chroma vector store with {len(chunks)} chunk(s) from full transcript ({len(transcript)} chars)...")

    docs = [
        Document(page_content=chunk, metadata = {'chunk_index' : i})
        for i,chunk in enumerate(chunks)
    ]

    print(f"Embedding {len(docs)} chunk(s) into fresh Chroma DB collection using OpenAI Embeddings...")
    vector_store = Chroma.from_documents(
        documents= docs,
        embedding=embeddings,
        collection_name=COLLECTION_NAME,
        persist_directory=CHROMA_DIR
    )
    print("Fresh OpenAI vector store build complete!")

    return vector_store



def load_vector_store() ->Chroma:
    embeddings = get_embeddings()
    vector_store = Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function= embeddings,
        persist_directory=CHROMA_DIR
    )

    return vector_store

def get_retriever(vector_store : Chroma, k :int = 4):
    return vector_store.as_retriever(
        search_type = 'similarity',
        search_kwargs = {"k":k}
    )