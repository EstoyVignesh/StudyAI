import anthropic
import json
import os
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

LANGUAGE_INSTRUCTIONS = {
    "tamil": "Generate the entire question, all options (A/B/C/D), and the explanation IN TAMIL LANGUAGE (தமிழில்). Use proper Tamil script.",
    "hindi": "Generate the entire question, all options (A/B/C/D), and the explanation IN HINDI LANGUAGE (हिन्दी में). Use proper Devanagari script.",
    "english": "Generate the question, options, and explanation in English.",
}

DIFFICULTY_DESC = {
    1: "very basic, straightforward factual recall",
    2: "easy, tests fundamental understanding",
    3: "medium, requires application of concepts",
    4: "hard, requires analysis and deeper understanding",
    5: "expert level, requires synthesis and evaluation of complex concepts",
}


async def generate_question(
    exam_type: str,
    subject: str,
    topic: str,
    difficulty: int,
    language: str = "english",
) -> dict:
    lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["english"])
    diff_desc = DIFFICULTY_DESC.get(difficulty, "medium difficulty")

    prompt = f"""You are generating an exam question for {exam_type} preparation.

Subject: {subject}
Topic: {topic}
Difficulty Level: {difficulty}/5 — {diff_desc}

LANGUAGE INSTRUCTION: {lang_instruction}

Generate ONE high-quality multiple choice question.

Return ONLY a valid JSON object with EXACTLY this structure (no markdown, no extra text):
{{
  "question": "The complete question text (in {language})",
  "options": {{
    "A": "First option (in {language})",
    "B": "Second option (in {language})",
    "C": "Third option (in {language})",
    "D": "Fourth option (in {language})"
  }},
  "correct_answer": "A",
  "explanation": "Clear explanation in {language} of why the correct answer is right and briefly why others are wrong.",
  "topic": "{topic}",
  "difficulty": {difficulty}
}}

Requirements:
- Factually accurate and exam-relevant for {exam_type}
- All 4 options must be plausible
- correct_answer must be exactly "A", "B", "C", or "D"
- All text (question, options, explanation) must be in {language}
"""

    with client.messages.stream(
        model="claude-opus-4-8",
        max_tokens=1500,
        thinking={"type": "adaptive"},
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        response = stream.get_final_message()

    text_content = ""
    for block in response.content:
        if block.type == "text":
            text_content = block.text
            break

    start = text_content.find("{")
    end = text_content.rfind("}") + 1
    if start == -1 or end <= start:
        raise ValueError("No JSON found in Claude response")

    question_data = json.loads(text_content[start:end])

    for key in ["question", "options", "correct_answer", "explanation", "topic", "difficulty"]:
        if key not in question_data:
            raise ValueError(f"Missing key: {key}")

    if question_data["correct_answer"] not in ["A", "B", "C", "D"]:
        raise ValueError(f"Invalid correct_answer: {question_data['correct_answer']}")

    return question_data
