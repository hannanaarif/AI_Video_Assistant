export const MOCK_ANALYSIS_RESULT = {
  title: "Q3 AI Product Architecture & Sarvam AI Integration Sync",
  metadata: {
    duration: "24m 18s",
    sourceType: "YouTube",
    sourceUrl: "https://www.youtube.com/watch?v=IA0la6XEi4Q",
    channel: "Tech Architecture Weekly",
    processedAt: "Just now",
  },
  summary: [
    "Discussed transition from Whisper local CPU model to Sarvam AI (`saaras:v2.5`) for Hinglish meeting transcription.",
    "Decided to split audio chunks into 25-second segments to comply with Sarvam's strict 30-second API limit.",
    "Validated Chroma DB vector store configuration using `all-MiniLM-L6-v2` embeddings for chunk similarity retrieval (top-k=4).",
    "Agreed on implementing LCEL (LangChain Expression Language) pipelines for modular prompt chaining and low-latency response stream.",
    "Planned frontend integration using ChatGPT dark theme design principles."
  ],
  action_items: [
    {
      id: "act-1",
      task: "Add environment variable fallback for SARVAM_API_KEY in transcriber module",
      owner: "Hannan",
      deadline: "Aug 25, 2026",
      completed: true
    },
    {
      id: "act-2",
      task: "Fix FFmpeg path resolution in .venv for Whisper subprocess execution",
      owner: "DevOps Team",
      deadline: "Immediate",
      completed: true
    },
    {
      id: "act-3",
      task: "Build responsive React frontend with ChatGPT style sidebar & RAG chat window",
      owner: "Frontend Lead",
      deadline: "Aug 24, 2026",
      completed: false
    },
    {
      id: "act-4",
      task: "Benchmark Retrieval Augmented Generation latency on 1-hour transcripts",
      owner: "AI/ML Team",
      deadline: "Aug 28, 2026",
      completed: false
    }
  ],
  key_decisions: [
    "Adopted Sarvam AI STT API (`saaras:v2.5`) specifically for Hinglish code-switched audio transcription.",
    "Enforced strict 25-second chunking with 5s safety margin to avoid API HTTP 400 payload errors.",
    "Configured RecursiveCharacterTextSplitter with chunk_size=500 and chunk_overlap=50 for optimal vector store retrieval.",
    "Used ChatMistralAI (`mistral-small-latest`) with temperature 0.3 for meeting summarization and extraction tasks."
  ],
  open_questions: [
    "How will speaker diarization be handled if Sarvam AI `with_diarization` parameter is enabled?",
    "Should vector DB persist across server restarts or re-embed per user session?",
    "Can we stream RAG responses token-by-token directly to the chat UI interface?"
  ],
  initialChatMessages: [
    {
      id: "msg-1",
      sender: "assistant",
      text: "Hello! I've analyzed your meeting transcript **\"Q3 AI Product Architecture & Sarvam AI Integration Sync\"**.\n\nYou can ask me anything about the topic, summary, decisions, action items, or technical implementation details.",
      timestamp: "10:42 AM",
      citations: []
    }
  ]
};

export const MOCK_SAMPLE_VIDEOS = [
  {
    id: "sample-1",
    title: "AI Video Assistant & RAG Demo",
    url: "https://www.youtube.com/watch?v=IA0la6XEi4Q",
    duration: "14m 20s",
    tag: "AI & Engineering"
  },
  {
    id: "sample-2",
    title: "Sarvam AI Speech & Hinglish STT",
    url: "https://www.youtube.com/watch?v=OxEMHsCKTWo",
    duration: "08m 45s",
    tag: "Audio Processing"
  },
  {
    id: "sample-3",
    title: "Weekly Product & Sprint Planning",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "22m 10s",
    tag: "Sprint Review"
  }
];

export function generateMockRAGAnswer(question, meetingData = MOCK_ANALYSIS_RESULT) {
  const q = question.toLowerCase().trim();

  if (q.includes("topic") || q.includes("about") || q.includes("overview") || q.includes("what is this") || q.includes("subject")) {
    return {
      text: `The topic of this video/meeting is **"${meetingData.title}"**.\n\n### Core Subject Matter:\nIt focuses on integrating **Sarvam AI (`saaras:v2.5`)** for Hinglish speech recognition, establishing **Chroma Vector DB** indexing with `all-MiniLM-L6-v2` embeddings, and chaining RAG queries using LangChain LCEL pipelines.`,
      citations: [{ timestamp: "00:45 - 02:15", text: "Meeting introduction outlining project architecture goals and Hinglish transcription requirements." }]
    };
  }

  if (q.includes("summary") || q.includes("summarize") || q.includes("discuss") || q.includes("highlights")) {
    const summaryList = (meetingData.summary || MOCK_ANALYSIS_RESULT.summary).map(s => `- ${s}`).join("\n");
    return {
      text: `Here is the executive summary of the meeting:\n\n${summaryList}`,
      citations: [{ timestamp: "03:10 - 06:40", text: "Summary of technical review and architectural decisions." }]
    };
  }

  if (q.includes("action") || q.includes("task") || q.includes("deadline") || q.includes("owner") || q.includes("assigned") || q.includes("who")) {
    const items = (meetingData.action_items || MOCK_ANALYSIS_RESULT.action_items).map((item, idx) => 
      `${idx + 1}. **${item.task}** — Assigned to **${item.owner}** *(Deadline: ${item.deadline})* ${item.completed ? '✅ Completed' : '⏳ Pending'}`
    ).join("\n");
    return {
      text: `Here are the action items extracted from the transcript:\n\n${items}`,
      citations: [{ timestamp: "14:20 - 17:05", text: "Action item assignment and deadline review." }]
    };
  }

  if (q.includes("decision") || q.includes("decide") || q.includes("choose") || q.includes("why")) {
    const decs = (meetingData.key_decisions || MOCK_ANALYSIS_RESULT.key_decisions).map((d, i) => `${i + 1}. ${d}`).join("\n");
    return {
      text: `Key decisions established during the meeting:\n\n${decs}`,
      citations: [{ timestamp: "09:30 - 12:15", text: "Technical decision alignment on STT models and chunking parameters." }]
    };
  }

  if (q.includes("question") || q.includes("unresolved") || q.includes("issue") || q.includes("pending")) {
    const qList = (meetingData.open_questions || MOCK_ANALYSIS_RESULT.open_questions).map((oq, i) => `${i + 1}. ${oq}`).join("\n");
    return {
      text: `Unresolved questions needing follow-up:\n\n${qList}`,
      citations: [{ timestamp: "21:00 - 23:45", text: "Open discussion on speaker diarization and streaming tokens." }]
    };
  }

  if (q.includes("sarvam") || q.includes("whisper") || q.includes("hinglish")) {
    return {
      text: `The team selected **Sarvam AI (`saaras:v2.5`)** over standard local Whisper for Hinglish speech because Sarvam accurately transcribes code-switched Hindi-English audio into clean English text.\n\nTo prevent HTTP 400 payload errors from Sarvam's 30-second API limit, audio tracks are sliced into **25-second pieces** before submission.`,
      citations: [{ timestamp: "07:15 - 08:50", text: "Detailed discussion comparing Whisper local CPU performance vs Sarvam AI API accuracy." }]
    };
  }

  return {
    text: `Based on the transcript of **"${meetingData.title}"**:\n\nRegarding your question *"${question}"*:\n\nThe transcript confirms that all vector retrieval operations use **Chroma DB** with top $k=4$ document chunks, processed via `mistral-small-latest` with a temperature setting of 0.3 to enforce precise, context-bounded answers.`,
    citations: [{ timestamp: "18:00 - 19:30", text: "RAG engine context retrieval configuration." }]
  };
}
