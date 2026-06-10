import anthropic
from typing import AsyncGenerator

TEXTBOOK_MAP = {
    "UPSC": {
        "History": "NCERT History (6–12th), Bipin Chandra Modern India, Spectrum Modern History",
        "Geography": "NCERT Geography (11–12th), GC Leong Physical Geography",
        "Polity": "M. Laxmikanth Indian Polity, NCERT Civics (11–12th)",
        "Economy": "NCERT Economics (11–12th), Ramesh Singh Indian Economy",
        "Environment": "NCERT Environment, Shankar IAS Environment manual",
        "Science & Technology": "NCERT Science, PIB Science & Tech reports",
        "Current Affairs": "PIB, The Hindu, Yojana magazine",
    },
    "JEE": {
        "Physics": "HC Verma Concepts of Physics Vol 1 & 2, NCERT Physics 11–12",
        "Chemistry": "NCERT Chemistry 11–12, P. Bahadur Physical Chemistry, Morrison Boyd Organic",
        "Mathematics": "RD Sharma, NCERT Maths 11–12, Arihant Series, SL Loney Trigonometry",
    },
    "NEET": {
        "Physics": "NCERT Physics 11–12, DC Pandey Objective Physics",
        "Chemistry": "NCERT Chemistry 11–12 (primary source), P. Bahadur",
        "Biology": "NCERT Biology 11–12 (primary source), Campbell Biology for depth",
    },
    "SSC_CGL": {
        "General Intelligence": "Arihant Reasoning, RS Aggarwal Verbal & Non-Verbal",
        "General Awareness": "Lucent's GK, NCERT summaries",
        "Quantitative Aptitude": "RS Aggarwal Quantitative Aptitude, Rakesh Yadav",
        "English": "Wren & Martin, SP Bakshi English",
    },
    "TNPSC_GROUP1": {
        "History": "Tamil Nadu State Board History (10th, 11th, 12th), NCERT History",
        "Geography": "Tamil Nadu State Board Geography (11th, 12th), NCERT Geography",
        "Polity": "Tamil Nadu State Board Civics (11th, 12th), Laxmikanth Indian Polity",
        "Economy": "Tamil Nadu State Board Economics (11th, 12th), NCERT Economics",
        "Science": "Tamil Nadu State Board Science (10th), NCERT Science",
        "Tamil": "Tamil Nadu State Board Tamil Literature (11th, 12th), Tolkappiyam",
        "Current Affairs": "Dinamalar, The Hindu Tamil, PIB Tamil",
    },
    "TNPSC_GROUP2": {
        "History": "Tamil Nadu State Board History (10th, 11th)",
        "Geography": "Tamil Nadu State Board Geography (10th, 11th)",
        "Polity": "Tamil Nadu State Board Civics (10th, 11th)",
        "Economy": "Tamil Nadu State Board Economics (10th, 11th)",
        "Science": "Tamil Nadu State Board Science (10th)",
        "Tamil": "Tamil Nadu State Board Tamil (10th, 11th)",
    },
    "TNPSC_GROUP4": {
        "History": "Tamil Nadu State Board History (10th)",
        "Geography": "Tamil Nadu State Board Geography (10th)",
        "Polity": "Tamil Nadu State Board Civics (10th)",
        "Science": "Tamil Nadu State Board Science (10th)",
        "Tamil": "Tamil Nadu State Board Tamil (10th)",
    },
}

LANG_INSTRUCTION = {
    "english": "Write the entire lesson in clear English.",
    "tamil": "Write the entire lesson in Tamil (தமிழில் எழுதவும்). Use Tamil script throughout.",
    "hindi": "Write the entire lesson in Hindi (हिंदी में लिखें). Use Devanagari script throughout.",
}

LESSON_PROMPT = """You are an expert teacher. Create a structured 6-slide lesson for {exam_type} exam preparation.

Subject: {subject}
Topic: {topic}
Reference books: {textbooks}

Output EXACTLY 6 slides using this format (copy the markers exactly):

[SLIDE:1]
TYPE: intro
TITLE: Introduction to {topic}
ICON: 🎯
CONTENT: [2-3 sentences introducing the topic and why it matters for {exam_type}]
POINTS:
- [overview point 1]
- [overview point 2]
- [overview point 3]

[SLIDE:2]
TYPE: concept
TITLE: Core Concepts
ICON: 📚
CONTENT: [Explain the main theoretical concepts clearly]
POINTS:
- [concept 1 with brief explanation]
- [concept 2 with brief explanation]
- [concept 3 with brief explanation]

[SLIDE:3]
TYPE: facts
TITLE: Key Facts & Dates
ICON: 📊
CONTENT: [Important facts, dates, figures, or data tables for this topic]
POINTS:
- [fact or date 1]
- [fact or date 2]
- [fact or date 3]
- [fact or date 4]

[SLIDE:4]
TYPE: example
TITLE: Examples & Case Studies
ICON: 💡
CONTENT: [Real-world examples or case studies that illustrate the concepts]
POINTS:
- [example 1]
- [example 2]
- [example 3]

[SLIDE:5]
TYPE: memory
TITLE: Memory Tricks
ICON: 🧠
CONTENT: [Mnemonics, acronyms, or visual memory techniques for this topic]
POINTS:
- [mnemonic or trick 1]
- [mnemonic or trick 2]
- [memory tip 3]

[SLIDE:6]
TYPE: exam
TITLE: Exam Focus — What Gets Asked
ICON: 🎓
CONTENT: [Typical question patterns in {exam_type} exams for this topic]
POINTS:
- [common question type 1]
- [common question type 2]
- [important exam angle 3]
- [last-minute tip]

{lang_instruction}
Do not add any text outside the slide format."""


async def stream_lesson(
    exam_type: str, subject: str, topic: str, language: str
) -> AsyncGenerator[str, None]:
    client = anthropic.Anthropic()

    exam_books = TEXTBOOK_MAP.get(exam_type.upper(), {})
    textbooks = exam_books.get(subject, f"Standard {exam_type} preparation materials")
    lang_instruction = LANG_INSTRUCTION.get(language, LANG_INSTRUCTION["english"])

    prompt = LESSON_PROMPT.format(
        exam_type=exam_type.upper(),
        subject=subject,
        topic=topic,
        textbooks=textbooks,
        lang_instruction=lang_instruction,
    )

    with client.messages.stream(
        model="claude-opus-4-8",
        max_tokens=2500,
        thinking={"type": "adaptive"},
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        for text in stream.text_stream:
            if text:
                safe = text.replace("\n", "\\n")
                yield f"data: {safe}\n\n"
    yield "data: [DONE]\n\n"
