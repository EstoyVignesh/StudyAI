import anthropic
import json
import os
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


async def generate_question(exam_type: str, subject: str, topic: str, difficulty: int) -> dict:
    """Generate an adaptive MCQ question using Claude with thinking."""

    difficulty_desc = {
        1: "very basic, straightforward factual recall",
        2: "easy, tests fundamental understanding",
        3: "medium, requires application of concepts",
        4: "hard, requires analysis and deeper understanding",
        5: "expert level, requires synthesis and evaluation of complex concepts",
    }

    prompt = f"""You are generating an exam question for {exam_type} preparation.

Subject: {subject}
Topic: {topic}
Difficulty Level: {difficulty}/5 — {difficulty_desc.get(difficulty, "medium")}

Generate ONE high-quality multiple choice question appropriate for {exam_type} exam.

Return ONLY a valid JSON object with EXACTLY this structure (no markdown, no explanation):
{{
  "question": "The complete question text",
  "options": {{
    "A": "First option text",
    "B": "Second option text",
    "C": "Third option text",
    "D": "Fourth option text"
  }},
  "correct_answer": "A",
  "explanation": "Clear explanation of why the correct answer is right and briefly why others are wrong. Be educational.",
  "topic": "{topic}",
  "difficulty": {difficulty}
}}

Requirements:
- Question must be factually accurate and exam-relevant for {exam_type}
- All 4 options must be plausible (no obviously wrong distractors)
- Explanation should be educational and help the student understand
- For difficulty {difficulty}/5: {difficulty_desc.get(difficulty, "medium")}
- correct_answer must be exactly "A", "B", "C", or "D"
"""

    with client.messages.stream(
        model="claude-opus-4-8",
        max_tokens=1024,
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

    required_keys = ["question", "options", "correct_answer", "explanation", "topic", "difficulty"]
    for key in required_keys:
        if key not in question_data:
            raise ValueError(f"Missing key in question data: {key}")

    if question_data["correct_answer"] not in ["A", "B", "C", "D"]:
        raise ValueError(f"Invalid correct_answer: {question_data['correct_answer']}")

    return question_data
