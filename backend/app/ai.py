import base64
import io
import json
import os
from typing import Optional
from openai import OpenAI
from PIL import Image
from .models import BrandAnalysis, CreativeDirection


DIRECTION_GUIDES = {
    "quiet-luxury": "QUIET LUXURY: use restrained premium typography, generous whitespace, soft tactile light, an elegant muted palette, and minimal graphic elements.",
    "kinetic-type": "KINETIC TYPE: use oversized bold typography, sharp geometric movement, strong scale contrast, energetic cropping, and a graphic high-impact palette.",
    "product-theatre": "PRODUCT THEATRE: use cinematic dramatic lighting, rich shadows, controlled highlights, depth, and a hero-product stage composition.",
    "fresh-air": "FRESH AIR: use bright natural daylight, open space, optimistic human warmth, fresh colors, and a light approachable composition.",
    "paper-cut": "PAPER CUT: use visibly layered paper shapes, crafted edges, playful depth, print-native texture, and bold complementary colors.",
    "monochrome": "MONOCHROME: use black-and-white or near-monochrome imagery, extreme contrast, direct iconic composition, and one restrained accent at most.",
}


def _client() -> Optional[OpenAI]:
    key = os.getenv("OPENAI_API_KEY")
    return OpenAI(api_key=key) if key else None


def analyze_artwork(data: bytes, mime: str) -> BrandAnalysis:
    client = _client()
    if not client:
        return BrandAnalysis(brand_name="North & Co.", palette=["#17352e", "#c8ad72", "#f6f0e1"], tone=["refined", "warm", "confident"], visual_motifs=["soft natural light", "tactile surfaces", "editorial whitespace"], protected_copy=["Made for the moment."], has_logo=True, has_qr=False, confidence=.91)
    encoded = base64.b64encode(data).decode()
    schema = BrandAnalysis.model_json_schema()
    schema["additionalProperties"] = False
    schema["required"] = list(schema["properties"])
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_ANALYSIS_MODEL", "gpt-4.1-mini"),
        messages=[{"role":"user","content":[
            {"type":"text","text":"Analyze this client artwork for a newspaper ad workflow. Return JSON with brand_name, palette (hex), tone, visual_motifs, protected_copy, has_logo, has_qr, confidence. Do not invent copy."},
            {"type":"image_url","image_url":{"url":f"data:{mime};base64,{encoded}"}}
        ]}], response_format={"type":"json_schema","json_schema":{"name":"brand_analysis","schema":schema,"strict":True}}
    )
    content = response.choices[0].message.content
    if not content:
        raise RuntimeError("The analysis model returned no content")
    return BrandAnalysis.model_validate_json(content)


def generate_directions(analysis: BrandAnalysis) -> list[CreativeDirection]:
    names = [("quiet-luxury","Quiet Luxury","Elegant · Restrained"),("kinetic-type","Kinetic Type","Bold · Graphic"),("product-theatre","Product Theatre","Cinematic · Rich"),("fresh-air","Fresh Air","Bright · Human"),("paper-cut","Paper Cut","Crafted · Playful"),("monochrome","Monochrome","Iconic · Direct")]
    return [CreativeDirection(id=i,name=n,mood=m,concept=f"{m} interpretation of {analysis.brand_name} that preserves the supplied campaign subject.",palette=analysis.palette,image_prompt=f"Create a polished new editorial advertising treatment from the supplied artwork for {analysis.brand_name}. Mood: {m}. Keep the exact hero vehicle or product recognizable with the same model, body design, color, proportions, camera angle, badges, wheels, and identifying details. Preserve the existing brand identities, campaign meaning, and important supplied copy. Do not replace the hero subject or introduce unrelated products, placeholder packaging, or fake QR codes. Improve the environment, lighting, visual hierarchy, and composition while leaving clear readable areas for the campaign message.") for i,n,m in names]


def generate_background(prompt: str, reference_data: Optional[bytes] = None, filename: str = "reference.png", format_id: str = "", direction_id: str = "") -> Optional[str]:
    client = _client()
    if not client:
        return None
    if format_id == "full-page":
        size = "1024x1536"
        layout = " OUTPUT ONLY THE PORTRAIT 32.9 cm × 45 cm ADVERTISEMENT CREATIVE. The application adds the newspaper masthead separately. Fill the canvas edge-to-edge. Do not generate a newspaper header, editorial columns, stories, gutters, page margin, frame, or mockup."
    elif format_id == "half-page":
        size = "1024x1536"
        layout = " OUTPUT ONLY THE 45 cm HIGH NEWSPAPER BODY AREA THAT BELONGS BELOW THE OFFICIAL MASTHEAD. The application will place the supplied official Vijay Karnataka header separately as a locked 7.5 cm header. DO NOT generate any masthead, newspaper logo, publication name, date/header bar, publisher mark, The Hindu Group mark, weather box, header portrait, or top branding. The TOP 20 cm of this body must contain dense, authentic Kannada editorial content with headlines, multi-column articles, photographs, rules, and normal editorial spacing. The LOWER 25 cm must contain ONE horizontal half-page advertisement at exactly 32.9 cm wide × 25 cm high. The advertisement boundary must begin exactly 20 cm below the top of this body canvas. It must span the COMPLETE 32.9 cm WIDTH, touching both left and right canvas edges. There must be zero white side gutter, page margin, or inset around the advertisement. Extend the ad background and artwork fully to both side edges. Do not make the ad portrait and do not mix editorial content into the ad. Fill this below-header body canvas edge-to-edge with no outer frame, desk, presentation board, or empty surrounding space."
    elif format_id == "lband":
        size = "1024x1536"
        layout = " OUTPUT ONLY THE 32.9 cm WIDE × 45 cm HIGH NEWSPAPER BODY BELOW THE LOCKED OFFICIAL MASTHEAD. Do not generate any masthead, publication logo, header, publisher mark, or top branding. Divide the canvas into TWO CLEARLY DIFFERENT CONTENT ZONES. ZONE 1 is a prominent WHITE NEWSPAPER EDITORIAL RECTANGLE anchored at the TOP-LEFT, exactly 17.4 cm wide × 29.5 cm high (52.9% of canvas width and 65.6% of canvas height). It must be visibly filled with dense, authentic Kannada newspaper content: a bold Kannada headline, two or three narrow article columns, at least one realistic news photograph, captions, rules, and normal editorial spacing. ZONE 2 is one exact continuous L-BAND advertisement consisting of a RIGHT VERTICAL LEG exactly 15.5 cm wide through the full 45 cm body height plus a BOTTOM HORIZONTAL LEG exactly 32.9 cm wide × 15.5 cm high. The advertisement must wrap around the editorial rectangle, touch the right and bottom canvas edges, and have no gutter. The top-left editorial rectangle must remain unmistakably editorial and must not contain the advertised product, brand background, logo, slogan, or campaign graphics. Do not put newspaper articles inside either advertising leg. Preserve the sharp straight boundary between the white editorial rectangle and the L-shaped advertisement."
    elif format_id == "edit-wrap":
        size = "1024x1536"
        layout = " OUTPUT ONLY THE 32.9 cm WIDE × 45 cm HIGH NEWSPAPER BODY BELOW THE LOCKED OFFICIAL MASTHEAD. The application adds the real Vijay Karnataka masthead separately, so do not generate a masthead, newspaper logo, publication name, date bar, publisher mark, or top branding. Create a TRUE EDIT WRAP execution like a real Kannada newspaper front page. The WHITE EDITORIAL PAGE must remain one continuous field across the full width and full height, filled with dense authentic Kannada headlines, narrow multi-column articles, news photographs, captions, rules, and natural newspaper spacing. Place the exact supplied hero product or vehicle as a LARGE BORDERLESS CUTOUT that overlaps the editorial field in the central-to-lower part of the page. Make multiple editorial columns visibly approach and wrap around the IRREGULAR OUTLINE of the hero on its left and right; retain substantial editorial stories above it and continue editorial in any open areas beside or below it. The hero may overlap the edges of nearby editorial columns, as in a premium front-page edit-wrap innovation. Advertising logos, headline, product variants, benefit icons, QR, and legal copy must float with the hero on the same white page or in one shallow branded footer strip no taller than 15% of the body. CRITICAL: do not reserve a rectangular middle section for the advertisement. Do not create two symmetrical editorial sidebars around a rectangular ad. Do not use a central box, enclosing border, card, frame, large solid-color panel, full-width mid-page banner, or horizontal rules that define an ad rectangle. There must be no fixed ad width or height and no visible rectangular advertising boundary. Keep the page predominantly white and preserve the supplied hero vehicle or product, brand identities, packaging, approved campaign elements, and real QR code."
    else:
        size = "1024x1536"
        layout = " Show the newspaper masthead and date across the top, realistic editorial news columns with headlines and photographs around the advertisement, and additional editorial content below."
    direction = DIRECTION_GUIDES.get(direction_id, "Follow the requested creative direction clearly and consistently.")
    preservation = layout + " " + direction + " The selected creative direction is mandatory and must be immediately visible in the advertisement. Do not merely resize, crop, or reframe the supplied design. Build a substantially new ad layout, background, lighting treatment, typography hierarchy, and spatial composition. Use the supplied image only to preserve protected content: the exact recognizable hero vehicle or product, brand identities, approved headline, key benefits, real QR code, legal strip, and campaign meaning. Do not preserve the source ad's original composition, background, scale relationships, or decorative treatment. Keep protected logos and copy inside a professional safe area without clipping. Do not introduce unrelated products, placeholder objects, fake QR codes, or generic packaging."
    final_prompt = prompt + " " + preservation
    if reference_data:
        image = io.BytesIO(reference_data)
        image.name = filename
        result = client.images.edit(model=os.getenv("OPENAI_IMAGE_MODEL", "gpt-image-2"), image=image, prompt=final_prompt, size=size, extra_body={"quality":"medium"})
    else:
        result = client.images.generate(model=os.getenv("OPENAI_IMAGE_MODEL", "gpt-image-2"), prompt=final_prompt, size=size, quality="medium")
    output = base64.b64decode(result.data[0].b64_json)
    image = Image.open(io.BytesIO(output)).convert("RGB")
    # Models sometimes place a full newspaper on a large white presentation mat.
    # Crop only when the non-white content occupies substantially less than the canvas.
    mask = image.convert("L").point(lambda value: 255 if value < 242 else 0)
    bounds = mask.getbbox()
    if bounds:
        left, top, right, bottom = bounds
        if (right - left) < image.width * .82 or (bottom - top) < image.height * .82:
            pad_x, pad_y = int((right-left) * .025), int((bottom-top) * .025)
            crop = (max(0,left-pad_x), max(0,top-pad_y), min(image.width,right+pad_x), min(image.height,bottom+pad_y))
            image = image.crop(crop).resize((1024, 1536), Image.Resampling.LANCZOS)
            encoded = io.BytesIO()
            image.save(encoded, format="PNG", optimize=True)
            output = encoded.getvalue()
    return f"data:image/png;base64,{base64.b64encode(output).decode()}"
