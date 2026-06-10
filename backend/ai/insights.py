import anthropic
import os
from typing import AsyncGenerator
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

LANG_INSTRUCTION = {
    "tamil": "Respond entirely in Tamil language (தமிழில் பதில் அளிக்கவும்). Use Tamil script throughout.",
    "hindi": "Respond entirely in Hindi language (हिन्दी में उत्तर दें). Use Devanagari script.",
    "english": "Respond in clear English.",
}

EXAM_CONTEXT = {
    "UPSC": "UPSC Civil Services Examination (CSE) Prelims and Mains, conducted by UPSC India. Papers span 2015–2024.",
    "JEE": "JEE Main and JEE Advanced conducted by NTA/IIT. Papers span 2015–2024.",
    "NEET": "NEET UG conducted by NTA for medical admissions. Papers span 2015–2024.",
    "SSC_CGL": "SSC CGL (Combined Graduate Level) Tier 1 and Tier 2 conducted by Staff Selection Commission. Papers span 2015–2024.",
    "IBPS_PO": "IBPS PO Prelims and Mains conducted by IBPS for bank PO recruitment. Papers span 2015–2024.",
    "TNPSC_GROUP1": "TNPSC Group 1 (Combined Civil Services Exam I) for Tamil Nadu civil services. Papers span 2013–2024.",
    "TNPSC_GROUP2": "TNPSC Group 2/2A (Junior Assistant, Revenue Inspector) Tamil Nadu. Papers span 2014–2024.",
    "TNPSC_GROUP4": "TNPSC Group 4 (VAO, Typist) Tamil Nadu. Papers span 2014–2024.",
    "TNTET": "TNTET Paper 1 (Classes 1–5) and Paper 2 (Classes 6–8) Tamil Nadu Teacher Eligibility Test.",
    "UPPSC": "UPPSC (Uttar Pradesh Public Service Commission) Prelims and Mains. Papers span 2015–2024.",
    "BPSC": "BPSC (Bihar Public Service Commission) 64th–70th combined exams. Papers span 2019–2024.",
    "MPPSC": "MPPSC (Madhya Pradesh PSC) State Services Exam. Papers span 2015–2024.",
    "RPSC": "RPSC (Rajasthan PSC) RAS/RTS Combined Competitive Exam. Papers span 2015–2024.",
}


async def stream_recurring_questions(
    exam_type: str,
    subject: str,
    language: str = "english",
) -> AsyncGenerator[str, None]:
    """Stream recurring/repeated question patterns from Claude."""

    exam_ctx = EXAM_CONTEXT.get(exam_type.upper(), exam_type)
    lang_instr = LANG_INSTRUCTION.get(language, LANG_INSTRUCTION["english"])

    prompt = f"""You are an expert exam analyst for Indian competitive examinations.

Exam: {exam_ctx}
Subject/Section: {subject}

{lang_instr}

Analyze the question paper history for {exam_type} – {subject} and identify:

## Frequently Repeated Topics (appeared in 2+ years)

For each recurring topic:
1. **Topic name** — bold heading
2. Years it appeared (approximate, e.g. 2019, 2021, 2022, 2023)
3. The specific aspect/angle that keeps getting asked
4. One sample question type or theme that appeared
5. What to focus on for this topic

List at least 10–15 such recurring topics, ordered from most frequent to least.

## Year-Wise Pattern Summary
Briefly summarize any observable trend in question patterns over the last 5 years.

## Quick Revision Tips
3–4 bullet points on what to revise first based on recurrence patterns.

Be specific to {exam_type} exam style and difficulty. Use actual question themes from real past papers where possible."""

    with client.messages.stream(
        model="claude-opus-4-8",
        max_tokens=3000,
        thinking={"type": "adaptive"},
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        for text in stream.text_stream:
            yield f"data: {text}\n\n"

    yield "data: [DONE]\n\n"


async def stream_high_yield_topics(
    exam_type: str,
    subject: str,
    language: str = "english",
) -> AsyncGenerator[str, None]:
    """Stream high-yield topic analysis from Claude."""

    exam_ctx = EXAM_CONTEXT.get(exam_type.upper(), exam_type)
    lang_instr = LANG_INSTRUCTION.get(language, LANG_INSTRUCTION["english"])

    prompt = f"""You are an expert exam strategist for Indian competitive examinations.

Exam: {exam_ctx}
Subject/Section: {subject}

{lang_instr}

Based on historical question paper analysis for {exam_type} – {subject}, provide a comprehensive high-yield topic guide:

## High-Yield Topics (Ranked by Importance)

For each topic, provide:
| Rank | Topic | Approx. Weightage | Questions/Year | Priority |
|------|-------|-------------------|----------------|----------|

Then for each top 5 topics, add a detailed breakdown:

### [Topic Name]
- **Why it's important**: reason + typical question count per paper
- **Key subtopics**: specific chapters/concepts to master
- **Question pattern**: type of questions asked (factual/analytical/application)
- **Preparation tip**: most efficient way to cover this topic
- **Common mistakes**: what students typically get wrong

## Score Maximization Strategy
A 5-step strategy to maximize marks in {subject} for {exam_type}, based on mark weightage.

## Topics to Skip (Low ROI)
Topics with low question frequency relative to preparation time — so students can deprioritize.

Be specific, data-driven, and actionable for {exam_type} aspirants."""

    with client.messages.stream(
        model="claude-opus-4-8",
        max_tokens=3000,
        thinking={"type": "adaptive"},
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        for text in stream.text_stream:
            yield f"data: {text}\n\n"

    yield "data: [DONE]\n\n"
