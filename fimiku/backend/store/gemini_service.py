import os
from .models import Product

def query_fimiku_assistant(user_prompt: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    
    # Retrieve active catalog products for LLM context grounding
    try:
        catalog = Product.objects.filter(is_active=True).values(
            'name', 'category__name', 'target_age', 'price', 'material', 'features'
        )
        catalog_summary = "\n".join([
            f"- {p['name']} (Category: {p.get('category__name')}, Target Age: {p.get('target_age')}, Price: ₹{p.get('price')}, Material: {p.get('material')}): {', '.join(p.get('features', []))}"
            for p in catalog[:25]
        ])
    except Exception:
        catalog_summary = "- Fimiku Koala Textured Teething Ring (Age: 3m-12m, Price: ₹399)\n- Stay-Put Silicone Suction Plate & Soft Spoon (Age: 6m+, Price: ₹749)"

    system_instruction = f"""
You are the official, gentle, and knowledgeable AI Product Consultant for 'Fimiku', a premium baby brand specializing exclusively in 100% food-grade silicone baby products (teething toys, feeding essentials, sensory accessories, and bath toys).

CORE BRAND VALUES & SAFETY RULES:
1. Safety First: Fimiku products are made of 100% food-grade platinum silicone, 100% BPA, PVC, lead, and phthalate-free, and resistant to temperatures up to 220°C (dishwasher, boil, & microwave safe).
2. Age-Appropriate Recommendations: Always suggest items tailored to the baby's developmental stage (e.g. 0-3m soft rattles/touch, 3-6m lightweight soothing teethers, 6m+ suction plates/soft self-feeding spoons).
3. STRICT MEDICAL SAFETY: NEVER diagnose symptoms, prescribe remedies for illnesses/fever, or offer clinical pediatric advice. If a parent mentions fever, extreme distress, or unusual oral bleeding, warmly recommend consulting their pediatrician.
4. NO INVENTED CLAIMS: Never claim medical cures or invent certifications. Stick directly to authentic product specifications.
5. Catalog Grounding: Recommend products from the live catalog below whenever matching.

CURRENT FIMIKU LIVE CATALOG:
{catalog_summary}
"""

    if not api_key:
        # Graceful development fallback response when API key is not configured yet
        return (
            "🌿 **Fimiku Silicone Advisor (Demo Mode)**:\n\n"
            "Thank you for asking about your baby's comfort! For soothing tender gums, we recommend our "
            "**Fimiku Textured Teething Rings** (designed for 3m+ with easy two-hand grip and freezer cooling). "
            "For mealtime milestones starting at 6m+, our **Stay-Put Silicone Suction Plate & Soft Spoon** "
            "offers vacuum grip and ultra-soft, gum-friendly edges.\n\n"
            "*(Tip: Set `GEMINI_API_KEY` in backend `.env` to enable dynamic AI responses!)*"
        )

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=f"Customer Question: {user_prompt}",
            config=genai.types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.3
            )
        )
        return response.text
    except Exception as e:
        return f"Hello! Our AI assistant is currently updating. For product queries or age suggestions, please explore our catalog or check back shortly. (Note: {str(e)})"
