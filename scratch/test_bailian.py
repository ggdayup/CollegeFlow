import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Set paths
CDS_ROOT = Path("/Users/ggdayup/ggdayup-syncthing/code/CollegeFlow/data/cds/CollegeFlow_CDS")
load_dotenv(CDS_ROOT / ".env")

sys.path.insert(0, str(CDS_ROOT))
from importlib import import_module
llm_mod = import_module("pdf-parse.llm_interface")

def test_api():
    print("="*60)
    print("TESTING LLM INTERFACE DEPLOYMENT")
    print("="*60)
    
    # Check current .env configurations
    provider = os.getenv("LLM_PROVIDER", "gemini")
    base_url = os.getenv("BAILIAN_BASE_URL", "N/A")
    model = os.getenv("GEMINI_SUMMARY_MODEL", "N/A")
    api_key = os.getenv("DASHSCOPE_API_KEY", "")
    
    print(f"Provider: {provider}")
    print(f"Base URL: {base_url}")
    print(f"Model: {model}")
    print(f"API Key configured: {'YES' if api_key else 'NO'}")
    print("-"*60)
    
    try:
        llm = llm_mod.LLMInterface()
        print("🚀 Initialized LLMInterface successfully!")
        
        prompt = "Hello! Please reply in Chinese, state who you are, and name the model you are running on."
        print(f"Sending prompt: '{prompt}'")
        print("Waiting for response...")
        
        response = llm.generate_content(prompt)
        print("\n" + "="*60)
        print("API RESPONSE OUTPUT:")
        print("="*60)
        print(response)
        print("="*60)
        print("✅ API Test Completed successfully!")
        
    except Exception as e:
        print("\n❌ Error encountered during API call:")
        import traceback
        traceback.print_exc()
        print("="*60)

if __name__ == "__main__":
    test_api()
