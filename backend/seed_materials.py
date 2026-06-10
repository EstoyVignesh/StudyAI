"""
Seed official question papers from government sources.
Run: python seed_materials.py
"""
from database import engine, Base, SessionLocal
from models import StudyMaterial

Base.metadata.create_all(bind=engine)

MATERIALS = [
    # ══════════════════════════════════════════════════════════════════
    # UPSC — Official PDFs from upsc.gov.in
    # ══════════════════════════════════════════════════════════════════

    # Prelims – GS Paper 1
    dict(exam_type="UPSC", subject="General Studies", year=2023, material_type="question_paper",
         title="UPSC CSE Prelims – GS Paper 1 (2023)",
         url="https://upsc.gov.in/sites/default/files/QP_CS_Pre_Exam_2023_280523.pdf",
         language="english", tags=["prelims", "GS1", "2023"], is_official=True),
    dict(exam_type="UPSC", subject="General Studies", year=2023, material_type="question_paper",
         title="UPSC CSE Prelims – CSAT Paper 2 (2023)",
         url="https://upsc.gov.in/sites/default/files/QP_CS_Pre_Exam_2023_GENERAL_STUDIES_PAPER_II_280523.pdf",
         language="english", tags=["prelims", "CSAT", "2023"], is_official=True),

    # Mains – GS Paper 1
    dict(exam_type="UPSC", subject="General Studies", year=2024, material_type="question_paper",
         title="UPSC CSE Mains – GS Paper 2 (2024)",
         url="https://upsc.gov.in/sites/default/files/QP_CSM_2024_GenStud_II_03102024.pdf",
         language="english", tags=["mains", "GS2", "2024"], is_official=True),
    dict(exam_type="UPSC", subject="General Studies", year=2023, material_type="question_paper",
         title="UPSC CSE Mains – GS Paper 2 (2023)",
         url="https://upsc.gov.in/sites/default/files/QP-CSM-23-GENERAL-STUDIES-PAPER-II-180923.pdf",
         language="english", tags=["mains", "GS2", "2023"], is_official=True),
    dict(exam_type="UPSC", subject="General Studies", year=2023, material_type="question_paper",
         title="UPSC CSE Mains – Public Administration Paper 2 (2023)",
         url="https://upsc.gov.in/sites/default/files/QP-CSM-23-PUBLIC%20ADMINISTRATION-PAPER-II-29092023.pdf",
         language="english", tags=["mains", "public admin", "2023"], is_official=True),
    dict(exam_type="UPSC", subject="Polity", year=2023, material_type="question_paper",
         title="UPSC CSE Mains – Political Science & IR Paper 1 (2023)",
         url="https://upsc.gov.in/sites/default/files/QP-CSM-23-POL-SC-IR-PAPER-I-29092023.pdf",
         language="english", tags=["mains", "polity", "IR", "2023"], is_official=True),
    dict(exam_type="UPSC", subject="General Studies", year=2022, material_type="question_paper",
         title="UPSC CSE Mains – GS Paper 1 (2022)",
         url="https://upsc.gov.in/sites/default/files/QP-CSM-22-GENERAL-STUDIES-PAPER%20I-190922.pdf",
         language="english", tags=["mains", "GS1", "2022"], is_official=True),
    dict(exam_type="UPSC", subject="General Studies", year=2022, material_type="question_paper",
         title="UPSC CSE Mains – GS Paper 2 (2022)",
         url="https://upsc.gov.in/sites/default/files/QP-CSM-22-GENERAL-STUDIES-PAPER-II-190922.pdf",
         language="english", tags=["mains", "GS2", "2022"], is_official=True),
    dict(exam_type="UPSC", subject="General Studies", year=2021, material_type="question_paper",
         title="UPSC CSE Mains – GS Paper 1 (2021)",
         url="https://upsc.gov.in/sites/default/files/QP-CSM-21-GENSTUDIESPAPER-I-110122.pdf",
         language="english", tags=["mains", "GS1", "2021"], is_official=True),
    dict(exam_type="UPSC", subject="General Studies", year=2021, material_type="question_paper",
         title="UPSC CSE Mains – GS Paper 3 (2021)",
         url="https://upsc.gov.in/sites/default/files/QP-CSM-21-GENSTUDIESPAPER-III-110122.pdf",
         language="english", tags=["mains", "GS3", "2021"], is_official=True),
    dict(exam_type="UPSC", subject="Polity", year=2024, material_type="question_paper",
         title="UPSC CSE Mains – Political Science & IR Paper 1 (2024)",
         url="https://upsc.gov.in/sites/default/files/QP-CSM-24-POLITICAL-SCIENCE-INTERNL%20-REL-PAPER-I-031024.pdf",
         language="english", tags=["mains", "polity", "2024"], is_official=True),
    # Archive page (for years not available as direct PDFs)
    dict(exam_type="UPSC", subject="General Studies", year=None, material_type="archive",
         title="UPSC Previous Question Papers – Official Archive (All Years)",
         url="https://upsc.gov.in/examinations/previous-question-papers",
         language="english", tags=["archive", "all years"], is_official=True),

    # ══════════════════════════════════════════════════════════════════
    # NEET — Official PDFs from nta.ac.in
    # ══════════════════════════════════════════════════════════════════
    dict(exam_type="NEET", subject="Physics, Chemistry, Biology", year=2024, material_type="question_paper",
         title="NEET UG 2024 – Question Paper (English)",
         url="https://exams.nta.ac.in/NEET/images/NEET%20UG%202024%20IB-version%202%20final.pdf",
         language="english", tags=["NEET", "2024", "PCB"], is_official=True),
    dict(exam_type="NEET", subject="Physics, Chemistry, Biology", year=2023, material_type="question_paper",
         title="NEET UG 2023 – Question Paper (English)",
         url="https://nta.ac.in/Download/ExamPaper/Paper_20230320092044.pdf",
         language="english", tags=["NEET", "2023", "PCB"], is_official=True),
    dict(exam_type="NEET", subject="Physics, Chemistry, Biology", year=2023, material_type="question_paper",
         title="NEET UG 2023 – Question Paper Set B1 (English)",
         url="https://nta.ac.in/Download/ExamPaper/Paper_20231120112727.pdf",
         language="english", tags=["NEET", "2023", "Set B1"], is_official=True),
    dict(exam_type="NEET", subject="Physics, Chemistry, Biology", year=2020, material_type="question_paper",
         title="NEET UG 2020 – Question Paper (English)",
         url="https://nta.ac.in/Download/ExamPaper/Paper_20200509192346.pdf",
         language="english", tags=["NEET", "2020", "PCB"], is_official=True),
    dict(exam_type="NEET", subject="Physics, Chemistry, Biology", year=2020, material_type="question_paper",
         title="NEET UG 2020 – Question Paper Set E4 (English)",
         url="https://nta.ac.in/Download/ExamPaper/Paper_20201106080951.pdf",
         language="english", tags=["NEET", "2020", "Set E4"], is_official=True),
    dict(exam_type="NEET", subject="Physics, Chemistry, Biology", year=2019, material_type="question_paper",
         title="NEET UG 2019 – Question Paper (English)",
         url="https://nta.ac.in/Download/Notice/20190605125750.pdf",
         language="english", tags=["NEET", "2019", "PCB"], is_official=True),
    dict(exam_type="NEET", subject="Physics, Chemistry, Biology", year=None, material_type="archive",
         title="NEET UG – Official Question Paper Archive (All Years)",
         url="https://neet.nta.nic.in/document-category/archive/",
         language="english", tags=["archive", "all years"], is_official=True),
    # Tamil medium NEET
    dict(exam_type="NEET", subject="Physics, Chemistry, Biology", year=2023, material_type="question_paper",
         title="NEET UG 2023 – Question Paper (Tamil Medium)",
         url="https://nta.ac.in/Download/ExamPaper/Paper_20231120115210.pdf",
         language="tamil", tags=["NEET", "2023", "Tamil"], is_official=True),

    # ══════════════════════════════════════════════════════════════════
    # JEE Main — Official archive from NTA
    # ══════════════════════════════════════════════════════════════════
    dict(exam_type="JEE", subject="Physics, Chemistry, Mathematics", year=None, material_type="archive",
         title="JEE Main – Official Question Paper Archive (NTA)",
         url="https://jeemain.nta.nic.in/document-category/archive/",
         language="english", tags=["archive", "all years", "JEE Main"], is_official=True),
    dict(exam_type="JEE", subject="Physics, Chemistry, Mathematics", year=None, material_type="archive",
         title="JEE Main – Previous Papers & Answer Keys (NTA Portal)",
         url="https://ntaexampapers.com/question-papers/",
         language="english", tags=["archive", "JEE Main"], is_official=False),

    # ══════════════════════════════════════════════════════════════════
    # TNPSC — Official PDFs from tnpsc.gov.in
    # ══════════════════════════════════════════════════════════════════

    # Group 1
    dict(exam_type="TNPSC_GROUP1", subject="General Studies", year=2024, material_type="answer_key",
         title="TNPSC Group 1 Prelims – Final Answer Key (2024)",
         url="https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/04_2024_GR_I_PRELIM_FAK.pdf",
         language="tamil", tags=["Group 1", "prelims", "answer key", "2024"], is_official=True),
    dict(exam_type="TNPSC_GROUP1", subject="General Studies", year=2017, material_type="answer_key",
         title="TNPSC Group 1 Prelims – Final Answer Key (2017)",
         url="https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/2017_group1_finanskeys.pdf",
         language="tamil", tags=["Group 1", "prelims", "answer key", "2017"], is_official=True),
    dict(exam_type="TNPSC_GROUP1", subject="General Studies", year=2015, material_type="answer_key",
         title="TNPSC Group 1 Prelims – Final Answer Key (2015)",
         url="https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/GR_I_92K15_FIN_ANSKEY.pdf",
         language="tamil", tags=["Group 1", "prelims", "answer key", "2015"], is_official=True),
    # Group 1 main archive
    dict(exam_type="TNPSC_GROUP1", subject="General Studies", year=None, material_type="archive",
         title="TNPSC Group 1 – Previous Question Papers Archive",
         url="https://tnpsc.gov.in/english/previous-questions.html",
         language="tamil", tags=["archive", "Group 1"], is_official=True),
    dict(exam_type="TNPSC_GROUP1", subject="General Studies", year=None, material_type="archive",
         title="TNPSC Group 1 – Answer Keys Archive",
         url="https://tnpsc.gov.in/english/answerkeys.aspx",
         language="tamil", tags=["archive", "answer key", "Group 1"], is_official=True),

    # Group 2
    dict(exam_type="TNPSC_GROUP2", subject="General Studies", year=2024, material_type="answer_key",
         title="TNPSC Group 2 Mains – Final Answer Key (2024)",
         url="https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/08_2024_MWE_08022025_FAK.pdf",
         language="tamil", tags=["Group 2", "mains", "answer key", "2024"], is_official=True),
    dict(exam_type="TNPSC_GROUP2", subject="General Studies", year=2024, material_type="answer_key",
         title="TNPSC Group 2 Prelims – Final Answer Key (2024)",
         url="https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/08_2024_PE_14092024_FAK.pdf",
         language="tamil", tags=["Group 2", "prelims", "answer key", "2024"], is_official=True),
    dict(exam_type="TNPSC_GROUP2", subject="General Studies", year=2022, material_type="answer_key",
         title="TNPSC Group 2 Prelims – Final Answer Key (2022)",
         url="https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/GROUP_II_032022_PRELIMS_FIN_KEY.pdf",
         language="tamil", tags=["Group 2", "prelims", "answer key", "2022"], is_official=True),
    dict(exam_type="TNPSC_GROUP2", subject="General Studies", year=2015, material_type="answer_key",
         title="TNPSC Group 2 Prelims – Final Answer Key (2015)",
         url="https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/g2_prelims_finanskeys_2k15.pdf",
         language="tamil", tags=["Group 2", "prelims", "answer key", "2015"], is_official=True),

    # Group 4
    dict(exam_type="TNPSC_GROUP4", subject="General Studies", year=2025, material_type="answer_key",
         title="TNPSC Group 4 – Final Answer Key (2025)",
         url="https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/07_2025_CCSE_IV_FINAL_ANSWER_KEY.pdf",
         language="tamil", tags=["Group 4", "answer key", "2025"], is_official=True),
    dict(exam_type="TNPSC_GROUP4", subject="General Studies", year=2024, material_type="answer_key",
         title="TNPSC Group 4 – Final Answer Key (2024)",
         url="https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/01_2024_Final%20_Answer_Key_GT_GE.pdf",
         language="tamil", tags=["Group 4", "answer key", "2024"], is_official=True),
    dict(exam_type="TNPSC_GROUP4", subject="General Studies", year=2022, material_type="answer_key",
         title="TNPSC Group 4 – Final Answer Key (2022)",
         url="https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/07_22_GR_IV_FINAL_KEY.pdf",
         language="tamil", tags=["Group 4", "answer key", "2022"], is_official=True),
    dict(exam_type="TNPSC_GROUP4", subject="General Studies", year=2016, material_type="answer_key",
         title="TNPSC Group 4 – Final Answer Key (2016)",
         url="https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/06_11_2016_GROUP_IV_FIN_ANS_KEYS.pdf",
         language="tamil", tags=["Group 4", "answer key", "2016"], is_official=True),
    dict(exam_type="TNPSC_GROUP4", subject="General Studies", year=None, material_type="archive",
         title="TNPSC Group 4 – Answer Keys & Papers Archive",
         url="https://tnpsc.gov.in/english/answerkeys.aspx",
         language="tamil", tags=["archive", "Group 4"], is_official=True),

    # ══════════════════════════════════════════════════════════════════
    # SSC CGL — Official archive from ssc.nic.in
    # ══════════════════════════════════════════════════════════════════
    dict(exam_type="SSC_CGL", subject="General Intelligence & Reasoning", year=None, material_type="archive",
         title="SSC CGL – Previous Question Papers Archive",
         url="https://ssc.nic.in/Portal/SchemeExamination",
         language="english", tags=["archive", "CGL", "Tier 1", "Tier 2"], is_official=True),

    # ══════════════════════════════════════════════════════════════════
    # IBPS PO — Official archive from ibps.in
    # ══════════════════════════════════════════════════════════════════
    dict(exam_type="IBPS_PO", subject="Reasoning, Aptitude, English", year=None, material_type="archive",
         title="IBPS PO – Previous Question Papers Archive",
         url="https://www.ibps.in/",
         language="english", tags=["archive", "IBPS PO", "prelims", "mains"], is_official=True),

    # ══════════════════════════════════════════════════════════════════
    # Hindi PSC — Official archive pages
    # ══════════════════════════════════════════════════════════════════
    dict(exam_type="UPPSC", subject="General Studies", year=None, material_type="archive",
         title="UPPSC – Previous Question Papers (Official)",
         url="https://uppsc.up.nic.in/",
         language="hindi", tags=["archive", "UPPSC"], is_official=True),
    dict(exam_type="BPSC", subject="General Studies", year=None, material_type="archive",
         title="BPSC – Previous Question Papers (Official)",
         url="https://www.bpsc.bih.nic.in/",
         language="hindi", tags=["archive", "BPSC"], is_official=True),
    dict(exam_type="MPPSC", subject="General Studies", year=None, material_type="archive",
         title="MPPSC – Previous Question Papers (Official)",
         url="https://mppsc.mp.gov.in/",
         language="hindi", tags=["archive", "MPPSC"], is_official=True),
    dict(exam_type="RPSC", subject="General Studies", year=None, material_type="archive",
         title="RPSC – Previous Question Papers (Official)",
         url="https://rpsc.rajasthan.gov.in/",
         language="hindi", tags=["archive", "RPSC"], is_official=True),
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(StudyMaterial).count()
        if existing > 0:
            print(f"Already have {existing} materials. Skipping seed.")
            return

        for m in MATERIALS:
            db.add(StudyMaterial(**m))
        db.commit()
        print(f"Seeded {len(MATERIALS)} study materials.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
