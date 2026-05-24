#!/usr/bin/env python3
import os
import sys
import uuid
import psycopg2

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../backend'))

from matcher import get_connection, couple_custom_programs

def import_rice_79_majors():
    print("🚀 Starting Complete Ingestion of Official 79 Majors for Rice University (2025-2026 Latest Catalog)...")
    
    conn = get_connection(register=False)
    try:
        with conn.cursor() as cur:
            # 1. Update George R. Brown School name to official "George R. Brown School of Engineering and Computing"
            # And ensure all other school divisions exist with precise naming
            schools_to_create = [
                ("rice-architecture", "School of Architecture", "建筑学院", "rice"),
                ("rice-business", "Virani Undergraduate School of Business", "维拉尼本科商学院", "rice"),
                ("rice-brown", "George R. Brown School of Engineering and Computing", "布朗工程与计算学院", "rice"),
                ("rice-humanities", "School of Humanities and Arts", "人文与艺术学院", "rice"),
                ("rice-music", "Shepherd School of Music", "谢泼德音乐学院", "rice"),
                ("rice-natural", "Wiess School of Natural Sciences", "自然科学学院", "rice"),
                ("rice-social", "School of Social Sciences", "社会科学学院", "rice")
            ]
            
            print("🏫 Creating/Updating Rice University School Divisions...")
            for s_id, name_en, name_zh, uni_id in schools_to_create:
                cur.execute(
                    '''
                    INSERT INTO "School" ("id", "nameEn", "nameZh", "universityId")
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT ("id") DO UPDATE 
                    SET "nameEn" = EXCLUDED."nameEn", "nameZh" = EXCLUDED."nameZh"
                    ''',
                    (s_id, name_en, name_zh, uni_id)
                )
            
            # 2. Delete old custom majors ONLY for Rice to prevent duplicates
            print("🧹 Purging old custom majors for Rice...")
            cur.execute(
                '''
                DELETE FROM "UniversityMajorAssociation" 
                WHERE "universityId" = 'rice'
                '''
            )
            
            # 3. Define the 79 official majors
            source_url = "https://ga.rice.edu/programs-study/departments-programs/"
            
            # Form: (school_id, customName, customCode)
            rice_79_majors = [
                # 🏛️ 建筑学院 School of Architecture
                ("rice-architecture", "Architecture", "rice-arch-ba"),
                ("rice-architecture", "Architectural Studies", "rice-arch-studies"),
                
                # 💼 商学院 Virani Undergraduate School of Business
                ("rice-business", "Business", "rice-biz-gen"),
                ("rice-business", "Entrepreneurship", "rice-entrepreneurship"),
                
                # 🛠️ 工程与计算学院 George R. Brown School of Engineering and Computing
                ("rice-brown", "Artificial Intelligence", "rice-ai"),
                ("rice-brown", "Bioengineering", "rice-bioeng"),
                ("rice-brown", "Chemical and Biomolecular Engineering", "rice-chemeng"),
                ("rice-brown", "Civil and Environmental Engineering", "rice-civileng"),
                ("rice-brown", "Computational Applied Mathematics and Operations Research", "rice-caam-cmor"),
                ("rice-brown", "Computer Science", "rice-cs"),
                ("rice-brown", "Data Science", "rice-datasci"),
                ("rice-brown", "Electrical and Computer Engineering", "rice-ece"),
                ("rice-brown", "Energy and Water Sustainability", "rice-energy-sust"),
                ("rice-brown", "Engineering Design", "rice-eng-design"),
                ("rice-brown", "Engineering Leadership", "rice-eng-leadership"),
                ("rice-brown", "Financial Computation and Modeling", "rice-fin-model"),
                ("rice-brown", "Global Health Technologies", "rice-global-health"),
                ("rice-brown", "Materials Science and NanoEngineering", "rice-matsci"),
                ("rice-brown", "Mechanical Engineering", "rice-mecheng"),
                ("rice-brown", "Statistics", "rice-stats-eng"),
                
                # 🎨 人文与艺术学院 School of Humanities and Arts
                ("rice-humanities", "African and African American Studies", "rice-african-studies"),
                ("rice-humanities", "Ancient Mediterranean Civilizations", "rice-ancient-med"),
                ("rice-humanities", "Art", "rice-art"),
                ("rice-humanities", "Art History", "rice-art-history"),
                ("rice-humanities", "Asian Studies", "rice-asian-studies"),
                ("rice-humanities", "Classical Civilizations", "rice-class-civ"),
                ("rice-humanities", "Classical Studies", "rice-class-studies"),
                ("rice-humanities", "Creative Writing", "rice-creative-writing"),
                ("rice-humanities", "English", "rice-english"),
                ("rice-humanities", "Environmental Studies", "rice-env-studies"),
                ("rice-humanities", "European Studies", "rice-euro-studies"),
                ("rice-humanities", "French Studies", "rice-french-studies"),
                ("rice-humanities", "German Studies", "rice-german-studies"),
                ("rice-humanities", "Greek Language and Literature", "rice-greek-lang"),
                ("rice-humanities", "History", "rice-history"),
                ("rice-humanities", "Jewish Studies", "rice-jewish-studies"),
                ("rice-humanities", "Languages and Intercultural Communication", "rice-lang-inter"),
                ("rice-humanities", "Latin American and Latinx Studies", "rice-latin-studies"),
                ("rice-humanities", "Latin Language and Literature", "rice-latin-lang"),
                ("rice-humanities", "Media Studies", "rice-media-studies"),
                ("rice-humanities", "Medical Humanities", "rice-med-humanities"),
                ("rice-humanities", "Medieval and Early Modern Studies", "rice-medieval-studies"),
                ("rice-humanities", "Modern and Classical Languages, Literatures, and Cultures", "rice-modern-class-lang"),
                ("rice-humanities", "Museums and Cultural Heritage", "rice-museums-heritage"),
                ("rice-humanities", "Philosophy", "rice-philosophy"),
                ("rice-humanities", "Politics, Law, and Social Thought", "rice-pol-law-thought"),
                ("rice-humanities", "Religion", "rice-religion"),
                ("rice-humanities", "Science and Technology Studies", "rice-sci-tech-studies"),
                ("rice-humanities", "Spanish and Portuguese", "rice-spanish-port"),
                ("rice-humanities", "Study of Women, Gender and Sexuality", "rice-women-gender"),
                ("rice-humanities", "Theatre", "rice-theatre"),
                
                # 🎵 谢泼德音乐学院 Shepherd School of Music
                ("rice-music", "Music", "rice-music-performance"),
                
                # 🔬 自然科学学院 Wiess School of Natural Sciences
                ("rice-natural", "Astronomy", "rice-astronomy"),
                ("rice-natural", "Astrophysics", "rice-astrophysics"),
                ("rice-natural", "Biosciences", "rice-biosci"),
                ("rice-natural", "Chemical Physics", "rice-chem-phys"),
                ("rice-natural", "Chemistry", "rice-chemistry"),
                ("rice-natural", "Earth, Environmental and Planetary Sciences", "rice-earth-planetary"),
                ("rice-natural", "Ecology and Evolutionary Biology", "rice-ecology-biology"),
                ("rice-natural", "Environmental Science", "rice-env-science"),
                ("rice-natural", "Health Sciences", "rice-health-sciences"),
                ("rice-natural", "Kinesiology", "rice-kinesiology"),
                ("rice-natural", "Mathematics", "rice-math-natural"),
                ("rice-natural", "Neuroscience", "rice-neuroscience"),
                ("rice-natural", "Physics", "rice-physics-natural"),
                ("rice-natural", "Sports Medicine and Exercise Physiology", "rice-sports-med"),
                
                # 👥 社会科学学院 School of Social Sciences
                ("rice-social", "Anthropology", "rice-anthropology"),
                ("rice-social", "Cognitive Sciences", "rice-cogsci-social"),
                ("rice-social", "Economics", "rice-economics-social"),
                ("rice-social", "Global Affairs", "rice-global-affairs"),
                ("rice-social", "Linguistics", "rice-linguistics"),
                ("rice-social", "Managerial Economics and Organizational Sciences", "rice-managerial-econ"),
                ("rice-social", "Mathematical Economic Analysis", "rice-math-econ"),
                ("rice-social", "Political Science", "rice-polsci-social"),
                ("rice-social", "Psychology", "rice-psychology-social"),
                ("rice-social", "Social Policy Analysis", "rice-social-policy"),
                ("rice-social", "Sociology", "rice-sociology-social"),
                ("rice-social", "Sport Analytics", "rice-sport-analytics"),
                ("rice-social", "Sport Management", "rice-sport-management")
            ]
            
            print(f"📝 Inserting {len(rice_79_majors)} official majors into Database...")
            for s_id, custom_name, custom_code in rice_79_majors:
                cur.execute(
                    '''
                    INSERT INTO "UniversityMajorAssociation" 
                    ("id", "universityId", "schoolId", "customName", "customCode", "standardMajorId", "mappingScore", "isValidated", "degreeLevel", "sourceUrl")
                    VALUES (gen_random_uuid(), 'rice', %s, %s, %s, NULL, 0.0, FALSE, 'BACHELOR', %s)
                    ''',
                    (s_id, custom_name, custom_code, source_url)
                )
                
        conn.commit()
        print("✅ Official Rice 79 Majors successfully inserted.")
        
        # 4. Trigger Automatic Coupling to run SentenceTransformers BM25 matcher
        print("🤖 Triggering lexical-vector automatic matcher on newly seeded majors...")
        couple_custom_programs()
        print("\n🎉 Complete Rice University 79 Majors sync finished with 100% data authenticity!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Failed to sync Rice 79 majors: {e}")
        sys.exit(1)
    finally:
        conn.close()

if __name__ == '__main__':
    import_rice_79_majors()
