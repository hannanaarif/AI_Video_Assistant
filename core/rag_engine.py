import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from core.vector_store import build_vector_store, load_vector_store, get_retriever

def get_llm():
    return ChatOpenAI(
        model="gpt-4o-mini",
        api_key=os.getenv("OPENAI_API_KEY"),
        temperature=0.3,
        request_timeout=30,
        max_retries=3,
    )

def format_docs(docs):
    return "\n\n".join([doc.page_content for doc in docs])

def build_rag_chain(transcript:str):

    vector_store = build_vector_store(transcript)

    retriever = get_retriever(vector_store, k = 8)

    llm = get_llm()

    prompt = ChatPromptTemplate.from_messages(

        [(
            "system",
            """You are an expert video & meeting assistant. Answer the user's question 
based on the video transcript, speaker bio, and metadata context provided below.

Instructions:
1. Answer the question using all available context (metadata, speaker bio, description, and transcript chunks).
2. If asked about something specific (such as education, degree, background, or credentials) that is NOT explicitly spoken aloud in the audio transcript or mentioned in the bio description, summarize what background details ARE present in the transcript (e.g., former roles at Google/Microsoft) and note that specific university degrees were shown visually on-screen rather than spoken in the audio.
3. Be helpful, clear, and precise.

Context from video transcript & metadata:
{context}""",
        ),
        ("human", "{question}"),
    ]
    )

    #full LCEL Rag pipeline 

    rag_chain = (

        {"context" : retriever | RunnableLambda(format_docs),
         "question": RunnablePassthrough()
         }
         |prompt|llm|StrOutputParser()
    )

    return rag_chain


def load_rag_chain():
    vector_store = load_vector_store()
    retriever = get_retriever(vector_store)

    llm = get_llm()
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            """You are an expert meeting assistant. Answer the user's question 
based ONLY on the meeting transcript context provided below.

If the answer is not found in the context, say: 
"I could not find this information in the meeting transcript."

Always be concise and precise. If quoting someone, mention it clearly.

Context from meeting transcript:
{context}""",
        ),
        ("human", "{question}"),
    ])

    rag_chain = (
        {
            "context":  retriever | RunnableLambda(format_docs),
            "question": RunnablePassthrough(),
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return rag_chain


def ask_question(rag_chain, question:str) -> str:
    print(f"Question : {question}")
    answer = rag_chain.invoke(question)
    print(f"answer :{answer}")
    return answer