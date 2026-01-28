import os
import json
import base64
from typing import Dict, List, Optional
from enum import Enum

# Mocking the AI client for now, or using standard library if feasible.
# Ideally, we'd use `openai` library: import openai
# But sticking to standard request structure for compatibility/demonstration if lib not present.
# For production code, we assume 'openai' or similar SDK is installed.
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

class AdContentPredictor:
    """
    AdOracle: Core prediction module for ad content performance across social platforms.
    """
    
    PLATFORM_CRITERIA = {
        "TikTok": {
            "core_dna": "Dopamine Driven: High visual impact, fast pace, sound/music cues.",
            "high_score_traits": "Strong hook in first 0.5s (spark/noise/mud), BGM sync, 1st person POV, raw/native feel.",
            "low_score_traits": "Static PPT, traditional corporate promo style, silent, no info in first 3s.",
            "system_prompt": "You are a TikTok Algorithm Expert. Analyze if this content stops the scroll. Focus on 'Hook', 'Pacing', and 'Native Feel'."
        },
        "LinkedIn": {
            "core_dna": "Trust & Authority Driven: Professionalism, industry insight, credibility.",
            "high_score_traits": "Real engineer on camera, clear machine specs, solving specific pain points, industry data, professional clarity.",
            "low_score_traits": "Blurry selfies, zero-info hard ads, excessive emojis, 'spammy' copy.",
            "system_prompt": "You are a B2B Marketing Director. Analyze if this builds trust. Focus on 'Professionalism', 'Clarity', and 'Value Prop'."
        },
        "WhatsApp": {
            "core_dna": "Intimacy & Real-time Driven: Authenticity, close social distance, FOMO.",
            "high_score_traits": "Factory shipping raw shots, mobile photography, short text ('Busy day!'), 'Happening Now' vibe.",
            "low_score_traits": "Polished posters, long essays, robotic broadcast messages.",
            "system_prompt": "You are a personal connection. Analyze if this feels authentic. Focus on 'Rawness', 'Brevity', and 'Urgency'."
        },
        "YouTube": {
            "core_dna": "Search & Utility Driven: Info density, search intent match, CTR.",
            "high_score_traits": "Cover: High contrast, Text Overlay, Visual Focal Point. Content: 'How to', 'Review', 'Price' in title.",
            "low_score_traits": "Random screen grab cover, misleading title, low info density.",
            "system_prompt": "You are a detailed Youtube Analyst. Analyze CTR potential. Focus on 'Thumbnail Pop', 'Keywords', and 'Information Density'."
        }
    }

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY") or "mock_key"
        if OpenAI:
            self.client = OpenAI(api_key=self.api_key)
        else:
            self.client = None
            print("Warning: OpenAI library not found. Running in Mock Mode.")

    def _encode_image(self, image_path: str) -> str:
        """Encodes a local image file to base64 string."""
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found at {image_path}")
        
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')

    def predict(self, image_path: str, text: str, platform: str) -> Dict:
        """
        Predicts ad performance for a specific platform.
        Output: JSON Dict.
        """
        # 1. Validate Platform
        criteria = self.PLATFORM_CRITERIA.get(platform)
        if not criteria:
            valid_keys = list(self.PLATFORM_CRITERIA.keys())
            # Fuzzy match or default? Let's error for strictness.
            return {"error": f"Invalid platform. Choose from {valid_keys}"}

        # 2. Prepare Prompt
        messages = [
            {
                "role": "system",
                "content": f"""
                {criteria['system_prompt']}
                
                Core DNA: {criteria['core_dna']}
                High Score Criteria: {criteria['high_score_traits']}
                Low Score Criteria: {criteria['low_score_traits']}
                
                Task: Analyze the provided image and text.
                Return STRICT JSON format with no markdown formatting:
                {{
                    "platform_fit_score": (int 0-10, based on criteria),
                    "predicted_ctr_level": (str "High"/"Medium"/"Low"),
                    "visual_analysis": (str "Why it fits/fails this platform visually"),
                    "copy_analysis": (str "Why the text fits/fails user psychology here"),
                    "critical_flaw": (str "The biggest dealbreaker if any, else 'None'"),
                    "optimization_suggestions": [(str), (str), (str)]
                }}
                """
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": f"Ad Copy: {text}"},
                ]
            }
        ]
        
        # 3. Handle Image
        try:
            base64_image = self._encode_image(image_path)
            messages[1]["content"].append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{base64_image}"
                }
            })
        except Exception as e:
            return {"error": f"Image processing failed: {str(e)}"}

        # 4. Call LLM
        if self.client:
            try:
                response = self.client.chat.completions.create(
                    model="gpt-4o", # Or gpt-4-turbo
                    messages=messages,
                    response_format={ "type": "json_object" },
                    max_tokens=500
                )
                result_json = response.choices[0].message.content
                return json.loads(result_json)
            except Exception as e:
                return {"error": f"API Call Failed: {str(e)}"}
        else:
            # Mock Response for Testing without API Key
            return self._mock_response(platform)

    def _mock_response(self, platform: str) -> Dict:
        """Returns a dummy JSON response for testing purposes."""
        return {
            "platform_fit_score": 7,
            "predicted_ctr_level": "Medium",
            "visual_analysis": f"Mock analysis: Visuals are decent but could be more native to {platform}.",
            "copy_analysis": "Mock analysis: Text is clear but lacks specific platform engagement triggers.",
            "critical_flaw": "None",
            "optimization_suggestions": [
                f"Add more {platform}-specific elements.",
                "Increase contrast.",
                "Shorten text."
            ],
            "note": "RUNNING IN MOCK MODE (No API Key)"
        }

# ==========================================
# Main Test Block
# ==========================================
if __name__ == "__main__":
    # Test Setup
    predictor = AdContentPredictor() # Will fallback to Mock if no key
    
    # Dummy Data
    # Using the uploaded image from previous context if available, otherwise strict error handling
    test_image = "C:/Users/33589/.gemini/antigravity/brain/56a7ab63-8e0f-4bba-a18f-d513483ffe85/uploaded_image_1766473776736.png" 
    
    # If the specific file doesn't exist, we just warn.
    if not os.path.exists(test_image):
        print(f"Test image not found at {test_image}. Creating a dummy file for interface test.")
        # Proceeding without creating real file to avoid clutter, will let _encode_image handle error or just mock.
        # But for 'main' block we want to see it run.
        # Let's just use the mock if file missing.
    
    test_copy = "Exciting news! Our new Heavy Duty Excavator X-2000 is now available. Best price, high quality. Contact us today!"
    
    platforms = ["TikTok", "LinkedIn", "WhatsApp", "YouTube"]
    
    print(f"--- AdOracle Prediction System (v1.0) ---")
    print(f"Analyzing Ad: '{test_copy[:30]}...'")
    print("-------------------------------------------")

    for plat in platforms:
        print(f"\n[Targeting: {plat}]")
        try:
            # Note: We pass the path. If it doesn't exist, _encode_image throws.
            # For the purpose of this script run, we handle that.
            if os.path.exists(test_image):
                result = predictor.predict(test_image, test_copy, plat)
            else:
                 # Force mock if no file
                 result = predictor._mock_response(plat)
                 
            print(json.dumps(result, indent=2))
        except Exception as e:
            print(f"Error: {e}")
            
