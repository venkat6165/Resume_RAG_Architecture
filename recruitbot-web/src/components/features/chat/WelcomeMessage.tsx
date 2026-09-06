import { BotBubble } from './BotBubble';

export function WelcomeMessage() {
  return (
    <BotBubble>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <span>👋 Hello! I am RecruitBot, your AI Talent Acquisition Assistant.</span>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          I can help you search, discover, and re-rank candidate resumes from your MongoDB database using three AI retrieval modes:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
          <div className="p-2.5 rounded-xl bg-score-vector/10 border border-score-vector/20 flex flex-col gap-1">
            <span className="text-xs font-semibold text-score-vector">🎯 Vector Search</span>
            <span className="text-[11px] text-text-muted">1024-dim Mistral semantic similarity matching</span>
          </div>

          <div className="p-2.5 rounded-xl bg-score-bm25/10 border border-score-bm25/20 flex flex-col gap-1">
            <span className="text-xs font-semibold text-score-bm25">🔍 BM25 Keyword</span>
            <span className="text-[11px] text-text-muted">Exact skill & job title weighted lexical search</span>
          </div>

          <div className="p-2.5 rounded-xl bg-score-hybrid/10 border border-score-hybrid/20 flex flex-col gap-1">
            <span className="text-xs font-semibold text-score-hybrid">⚡ Hybrid RAG</span>
            <span className="text-[11px] text-text-muted">Parallel retrieval + Groq LLM re-ranking & summary</span>
          </div>
        </div>

        <p className="text-xs text-text-muted pt-1">
          Type a recruiter query below (e.g. <em className="text-text-primary">"Senior QA Architect with RAG and DeepEval"</em>) or select a suggestion chip to begin!
        </p>
      </div>
    </BotBubble>
  );
}
