#!/usr/bin/env python3
import os
import re
import sys
import numpy as np
import psycopg2
from psycopg2.extras import execute_values
from pgvector.psycopg2 import register_vector
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi

# Helper to load .env variables manually or from system env
def load_env():
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                key_val = line.split('=', 1)
                if len(key_val) == 2:
                    key, val = key_val
                    # Strip quotes if present
                    val = val.strip().strip('"').strip("'")
                    os.environ[key] = val

load_env()
DATABASE_URL = os.getenv('DATABASE_URL')

def get_connection(register=True):
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL is not set in environment or .env file.")
    
    # psycopg2 doesn't support schema query param in the connection URL
    cleaned_url = DATABASE_URL
    if '?' in cleaned_url:
        base_url, query = cleaned_url.split('?', 1)
        params = [p for p in query.split('&') if not p.startswith('schema=')]
        if params:
            cleaned_url = f"{base_url}?{'&'.join(params)}"
        else:
            cleaned_url = base_url
            
    conn = psycopg2.connect(cleaned_url)
    if register:
        try:
            register_vector(conn)
        except psycopg2.ProgrammingError as e:
            # If the vector extension doesn't exist yet, we ignore it
            # so the extension can be created.
            if "vector type not found" in str(e):
                pass
            else:
                raise e
    return conn

# Clean and tokenize text for BM25
def tokenize(text):
    if not text:
        return []
    # Lowercase and split on non-alphanumeric characters
    tokens = re.findall(r'\w+', text.lower())
    # Add a fallback for Chinese characters by split-by-character
    chinese_chars = re.findall(r'[\u4e00-\u9fff]', text)
    return tokens + chinese_chars

class HybridMatcher:
    def __init__(self, model_name='sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'):
        print(f"Loading SentenceTransformers model: {model_name}...")
        self.model = SentenceTransformer(model_name)
        self.majors_cache = []
        self.bm25_en = None
        self.bm25_zh = None
        self.load_majors_and_build_lexical_index()

    def load_majors_and_build_lexical_index(self):
        """
        Fetch all standard majors from the database and initialize BM25 indices.
        """
        print("Fetching standard majors from database to build indices...")
        conn = get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute('SELECT "id", "nameEn", "nameZh" FROM "Major"')
                rows = cur.fetchall()
                self.majors_cache = [
                    {"id": r[0], "nameEn": r[1], "nameZh": r[2]}
                    for r in rows
                ]
        finally:
            conn.close()

        if not self.majors_cache:
            print("Warning: No standard majors found in the database. Lexical index is empty.")
            return

        # Build BM25 corpora
        corpus_en = [tokenize(m["nameEn"]) for m in self.majors_cache]
        corpus_zh = [tokenize(m["nameZh"]) for m in self.majors_cache]

        self.bm25_en = BM25Okapi(corpus_en)
        self.bm25_zh = BM25Okapi(corpus_zh)
        print(f"BM25 index successfully built for {len(self.majors_cache)} majors.")

    def match(self, custom_name, top_k=5, w_lexical=0.4, w_semantic=0.6):
        """
        Perform hybrid matching for a custom program name.
        Combines BM25 lexical keyword retrieval and pgvector Cosine Similarity embedding search.
        """
        if not self.majors_cache:
            return []

        # 1. Lexical Scoring (BM25)
        tokens = tokenize(custom_name)
        bm25_scores_en = self.bm25_en.get_scores(tokens) if self.bm25_en else np.zeros(len(self.majors_cache))
        bm25_scores_zh = self.bm25_zh.get_scores(tokens) if self.bm25_zh else np.zeros(len(self.majors_cache))
        
        # Combine English and Chinese BM25 scores by taking the maximum for each major
        lexical_scores = np.maximum(bm25_scores_en, bm25_scores_zh)
        
        # Normalize BM25 scores to [0, 1] range
        max_lex = np.max(lexical_scores)
        if max_lex > 0:
            norm_lexical_scores = lexical_scores / max_lex
        else:
            norm_lexical_scores = np.zeros(len(self.majors_cache))

        # 2. Semantic Scoring (pgvector cosine similarity)
        query_vector = self.model.encode(custom_name)

        conn = get_connection()
        semantic_scores = {}
        try:
            with conn.cursor() as cur:
                # Cosine distance (<=>) is 1 - Cosine Similarity
                # So similarity = 1 - distance
                cur.execute(
                    '''
                    SELECT "id", 
                           1 - ("embeddingEn" <=> %s::vector) AS sim_en,
                           1 - ("embeddingZh" <=> %s::vector) AS sim_zh
                    FROM "Major"
                    WHERE "embeddingEn" IS NOT NULL AND "embeddingZh" IS NOT NULL
                    ''',
                    (query_vector, query_vector)
                )
                rows = cur.fetchall()
                for r in rows:
                    major_id = r[0]
                    sim_en = r[1] if r[1] is not None else 0.0
                    sim_zh = r[2] if r[2] is not None else 0.0
                    # Max similarity across En and Zh fields
                    semantic_scores[major_id] = max(sim_en, sim_zh)
        finally:
            conn.close()

        # 3. Hybrid Combining
        results = []
        for idx, major in enumerate(self.majors_cache):
            major_id = major["id"]
            
            lex_score = float(norm_lexical_scores[idx])
            sem_score = float(semantic_scores.get(major_id, 0.0))
            
            # Map negative cosine similarity to 0
            sem_score = max(0.0, sem_score)
            
            # Hybrid score computation
            hybrid_score = (w_lexical * lex_score) + (w_semantic * sem_score)
            
            results.append({
                "id": major_id,
                "nameEn": major["nameEn"],
                "nameZh": major["nameZh"],
                "lexical_score": lex_score,
                "semantic_score": sem_score,
                "hybrid_score": hybrid_score
            })

        # Sort descending by hybrid score
        results.sort(key=lambda x: x["hybrid_score"], reverse=True)
        return results[:top_k]

def seed_embeddings(model_name='sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'):
    """
    Ensures pgvector extension exists and columns are added.
    Generates and updates embeddings for all standard national majors.
    """
    print("Initializing Database with pgvector extension and embedding columns...")
    conn = get_connection(register=False)
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            cur.execute('CREATE EXTENSION IF NOT EXISTS vector;')
            print("✅ pgvector extension ensured.")
            
            cur.execute('ALTER TABLE "Major" ADD COLUMN IF NOT EXISTS "embeddingEn" vector(384);')
            cur.execute('ALTER TABLE "Major" ADD COLUMN IF NOT EXISTS "embeddingZh" vector(384);')
            print("✅ embedding columns added/verified.")
    finally:
        conn.close()

    print("Fetching majors to generate embeddings...")
    conn = get_connection(register=False)
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "id", "nameEn", "nameZh" FROM "Major"')
            rows = cur.fetchall()
    finally:
        conn.close()

    if not rows:
        print("❌ No standard majors found in database to seed.")
        return

    print(f"Loaded {len(rows)} majors. Generating embeddings using {model_name}...")
    model = SentenceTransformer(model_name)
    
    # Batch encode for high-performance throughput
    names_en = [r[1] for r in rows]
    names_zh = [r[2] for r in rows]

    print("Encoding English names...")
    embeddings_en = model.encode(names_en, show_progress_bar=True)
    
    print("Encoding Chinese names...")
    embeddings_zh = model.encode(names_zh, show_progress_bar=True)

    print("Updating embeddings in database...")
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            for idx, r in enumerate(rows):
                major_id = r[0]
                cur.execute(
                    '''
                    UPDATE "Major"
                    SET "embeddingEn" = %s::vector,
                        "embeddingZh" = %s::vector
                    WHERE "id" = %s
                    ''',
                    (embeddings_en[idx].tolist(), embeddings_zh[idx].tolist(), major_id)
                )
        conn.commit()
        print(f"✅ Successfully seeded vector embeddings for {len(rows)} majors.")
    except Exception as e:
        conn.rollback()
        print(f"❌ Error seeding embeddings: {e}")
        raise e
    finally:
        conn.close()

def couple_custom_programs(w_lexical=0.4, w_semantic=0.6):
    """
    Scan UniversityMajorAssociation where isValidated = false or missing mapping,
    perform automatic hybrid coupling, track score, and set isValidated to false.
    """
    print("Automatic Coupling: Scanning school-specific custom programs...")
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            # Fetch unvalidated custom programs
            cur.execute(
                '''
                SELECT "id", "customName"
                FROM "UniversityMajorAssociation"
                WHERE "isValidated" = FALSE OR "mappingScore" = 0.0
                '''
            )
            custom_programs = cur.fetchall()
    finally:
        conn.close()

    if not custom_programs:
        print("✅ No unvalidated custom programs need coupling.")
        return

    print(f"Found {len(custom_programs)} unvalidated custom programs. Starting matcher...")
    matcher = HybridMatcher()

    conn = get_connection()
    coupled_count = 0
    try:
        with conn.cursor() as cur:
            for prog_id, custom_name in custom_programs:
                matches = matcher.match(custom_name, top_k=1, w_lexical=w_lexical, w_semantic=w_semantic)
                if not matches:
                    continue
                
                best_match = matches[0]
                score = best_match["hybrid_score"]
                
                if score >= 0.85:
                    standard_major_id = best_match["id"]
                    is_validated = False
                    print(f"Coupled (>=0.85): '{custom_name}' -> '{best_match['nameEn']}' | score: {score:.4f}")
                else:
                    standard_major_id = None
                    is_validated = False
                    print(f"Unmapped (<0.85): '{custom_name}' | best guess score: {score:.4f} - saved with NULL standardMajorId")

                cur.execute(
                    '''
                    UPDATE "UniversityMajorAssociation"
                    SET "standardMajorId" = %s,
                        "mappingScore" = %s,
                        "isValidated" = %s
                    WHERE "id" = %s
                    ''',
                    (standard_major_id, score, is_validated, prog_id)
                )
                coupled_count += 1
        conn.commit()
        print(f"✅ Successfully auto-coupled {coupled_count} school-specific custom programs.")
    except Exception as e:
        conn.rollback()
        print(f"❌ Error during automatic coupling: {e}")
        raise e
    finally:
        conn.close()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python matcher.py [seed | match <name> | couple]")
        sys.exit(1)

    command = sys.argv[1]
    if command == "seed":
        seed_embeddings()
    elif command == "match":
        if len(sys.argv) < 3:
            print("Please provide a name to match: python matcher.py match \"Electrical Engineering\"")
            sys.exit(1)
        name_to_match = sys.argv[2]
        matcher = HybridMatcher()
        matches = matcher.match(name_to_match)
        print(f"\nTop Matches for '{name_to_match}':")
        for idx, m in enumerate(matches):
            print(f"{idx+1}. [{m['id']}] {m['nameEn']} / {m['nameZh']}")
            print(f"   Lexical Score: {m['lexical_score']:.4f} | Semantic Score: {m['semantic_score']:.4f} | Hybrid: {m['hybrid_score']:.4f}")
    elif command == "couple":
        couple_custom_programs()
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
