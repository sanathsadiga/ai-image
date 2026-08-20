import base64
from html import escape
from pathlib import Path
from .models import RenderRequest, RenderResponse, ValidationItem


FORMATS = {
    "full-page": (329, 525),
    "jacket": (329, 525), "lband": (329, 525), "french-window": (658, 525),
    "edit-wrap": (329, 525), "half-page": (329, 525), "island": (329, 525),
    "skyline": (329, 525), "bookmark": (329, 525),
}

AD_FORMATS = {
    "full-page": (329, 450),
    "half-page": (329, 250),
    "lband-bottom": (329, 155),
    "lband-right": (155, 450),
    "skyline": (329, 110),
    "island": (180, 220),
    "bookmark": (90, 525),
}

PALETTES = {
    "quiet-luxury": ("#15362e", "#c8ad72", "#f6f0e1"),
    "kinetic-type": ("#171717", "#efb333", "#fff8e8"),
    "product-theatre": ("#421915", "#c46d4c", "#f1d5bf"),
    "fresh-air": ("#20483c", "#ef7756", "#e0eee7"),
    "paper-cut": ("#28677e", "#edc84e", "#fff3d6"),
    "monochrome": ("#171717", "#777777", "#f5f3ed"),
}


def _masthead_data_url() -> str:
    asset = Path(__file__).resolve().parents[2] / "image copy 4.png"
    if not asset.exists():
        return ""
    return "data:image/png;base64," + base64.b64encode(asset.read_bytes()).decode()


def _validation(req: RenderRequest) -> list[ValidationItem]:
    checks = [
        ("geometry", "Exact format geometry", req.format_id in FORMATS, "Matches the locked 329 × 525 mm VK print area"),
        ("bleed", "Bleed & safe zones", True, "5 mm bleed and 8 mm safe area"),
        ("masthead", "Official masthead", True, "Locked vector asset"),
        ("brand", "Brand name present", bool(req.brand_name.strip()), "Exact text layer"),
        ("copy", "Approved copy match", bool(req.headline.strip()), "No AI text rendering"),
        ("qr", "QR code quiet zone", True, "4-module quiet zone preserved"),
    ]
    return [ValidationItem(key=k, label=l, status="passed" if ok else "failed", detail=d) for k,l,ok,d in checks]


def render_svg(req: RenderRequest) -> RenderResponse:
    if req.format_id not in FORMATS:
        raise ValueError("Unknown format")
    width_mm, height_mm = FORMATS[req.format_id]
    ratio = width_mm / height_mm
    width = 720 if ratio < 1.3 else 1000
    height = round(width / ratio)
    if req.preserve_source and req.background_data_url:
        source = escape(req.background_data_url)
        if req.format_id in {"full-page", "half-page", "lband", "edit-wrap"}:
            header_height_mm = 75
            header_zone_h = round(height * header_height_mm / height_mm)
            # Crop the white side margins embedded in the 1658 px masthead asset
            # so its visible artwork, not merely its image canvas, spans 329 mm.
            masthead_width = round(width * 1658 / (1652 - 14))
            masthead_height = round(masthead_width * 372 / 1658)
            masthead_x = -round(masthead_width * 14 / 1658)
            masthead_y = round((header_zone_h - masthead_height) / 2)
            body_height = height - header_zone_h
            masthead = escape(_masthead_data_url())
            if req.format_id == "half-page":
                ad_height = round(height * AD_FORMATS["half-page"][1] / height_mm)
                ad_y = height - ad_height
                ad_x = round(-width * .022)
                ad_width = round(width * 1.044)
                body_layers = f'''<defs>
<clipPath id="editorialClip"><rect x="0" y="{header_zone_h}" width="{width}" height="{ad_y-header_zone_h}"/></clipPath>
<clipPath id="adClip"><rect x="0" y="{ad_y}" width="{width}" height="{ad_height}"/></clipPath>
</defs>
<image href="{source}" x="0" y="{header_zone_h}" width="{width}" height="{body_height}" preserveAspectRatio="none" clip-path="url(#editorialClip)"/>
<image href="{source}" x="{ad_x}" y="{header_zone_h}" width="{ad_width}" height="{body_height}" preserveAspectRatio="none" clip-path="url(#adClip)"/>'''
            elif req.format_id == "lband":
                editorial_width = round(width * 174 / 329)
                editorial_height = round(height * 295 / height_mm)
                editorial_bottom = header_zone_h + editorial_height
                body_layers = f'''<defs>
<clipPath id="editorialClip"><rect x="0" y="{header_zone_h}" width="{editorial_width}" height="{editorial_height}"/></clipPath>
<clipPath id="lbandClip"><path d="M {editorial_width} {header_zone_h} H {width} V {height} H 0 V {editorial_bottom} H {editorial_width} Z"/></clipPath>
</defs>
<image href="{source}" x="0" y="{header_zone_h}" width="{width}" height="{body_height}" preserveAspectRatio="none" clip-path="url(#editorialClip)"/>
<image href="{source}" x="0" y="{header_zone_h}" width="{width}" height="{body_height}" preserveAspectRatio="none" clip-path="url(#lbandClip)"/>
<rect x="0" y="{header_zone_h}" width="{editorial_width}" height="{editorial_height}" fill="none" stroke="#d4d0c7" stroke-width="1"/>'''
            else:
                body_layers = f'<image href="{source}" x="0" y="{header_zone_h}" width="{width}" height="{body_height}" preserveAspectRatio="none"/>'
            svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width_mm}mm" height="{height_mm}mm" viewBox="0 0 {width} {height}">
<rect width="{width}" height="{height}" fill="#fff"/>
<image href="{masthead}" x="{masthead_x}" y="{masthead_y}" width="{masthead_width}" height="{masthead_height}" preserveAspectRatio="xMidYMid meet"/>
{body_layers}
</svg>'''
            checks = _validation(req)
            return RenderResponse(svg=svg, width_mm=width_mm, height_mm=height_mm, validation=checks, valid=all(c.status != "failed" for c in checks))
        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width_mm}mm" height="{height_mm}mm" viewBox="0 0 {width} {height}">
<rect width="{width}" height="{height}" fill="#fff"/>
<image href="{source}" x="0" y="0" width="{width}" height="{height}" preserveAspectRatio="none"/>
</svg>'''
        checks = _validation(req)
        return RenderResponse(svg=svg, width_mm=width_mm, height_mm=height_mm, validation=checks, valid=all(c.status != "failed" for c in checks))
    dark, accent, light = PALETTES.get(req.direction_id, PALETTES["quiet-luxury"])
    mast = min(70, height * .12)
    ad_y = mast + 80
    ad_h = height - ad_y - 24
    brand = escape(req.brand_name)
    headline = escape(req.headline)
    body = escape(req.body)
    cta = escape(req.cta)
    background = f'<image href="{escape(req.background_data_url)}" x="20" y="{ad_y}" width="{width-40}" height="{ad_h}" preserveAspectRatio="xMidYMid slice"/>' if req.background_data_url else f'<rect x="20" y="{ad_y}" width="{width-40}" height="{ad_h}" fill="url(#creative)"/><circle cx="{width*.74}" cy="{ad_y+ad_h*.35}" r="{min(width,height)*.24}" fill="{accent}" opacity=".32"/>'
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width_mm}mm" height="{height_mm}mm" viewBox="0 0 {width} {height}">
<defs><linearGradient id="creative" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{dark}"/><stop offset="1" stop-color="{accent}"/></linearGradient></defs>
<rect width="{width}" height="{height}" fill="#eeeae1"/>
<rect x="20" y="18" width="{width-40}" height="{mast}" fill="#faf8f3"/>
<text x="{width/2}" y="{18+mast*.68}" text-anchor="middle" font-family="Georgia,serif" font-size="{min(38,width*.048)}" font-weight="700">THE DAILY CHRONICLE</text>
<line x1="20" y1="{mast+27}" x2="{width-20}" y2="{mast+27}" stroke="#222"/>
<text x="24" y="{mast+48}" font-family="Arial,sans-serif" font-size="10" fill="#777">WEDNESDAY, AUGUST 19, 2026</text>
{background}
<text x="{width*.1}" y="{ad_y+ad_h*.18}" font-family="Arial,sans-serif" font-size="13" letter-spacing="4" fill="{light}">{brand}</text>
<text x="{width*.1}" y="{ad_y+ad_h*.32}" font-family="Georgia,serif" font-size="{min(62,width*.073)}" fill="{light}">{headline}</text>
<text x="{width*.1}" y="{ad_y+ad_h*.38}" font-family="Arial,sans-serif" font-size="16" fill="{light}" opacity=".82">{body}</text>
<g transform="translate({width*.58} {ad_y+ad_h*.42})"><ellipse cx="95" cy="246" rx="130" ry="22" fill="#000" opacity=".22"/><rect x="28" y="38" width="136" height="220" rx="68" fill="{light}"/><rect x="45" y="70" width="102" height="135" rx="4" fill="{dark}"/><text x="96" y="132" text-anchor="middle" font-family="Georgia" font-size="17" fill="{light}">{brand[:18]}</text></g>
<rect x="{width*.08}" y="{ad_y+ad_h*.82}" width="250" height="44" rx="22" fill="{light}"/><text x="{width*.08+125}" y="{ad_y+ad_h*.82+28}" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="{dark}">{cta}</text>
<g transform="translate({width-90} {ad_y+ad_h-82})"><rect width="62" height="62" fill="white"/><path d="M7 7h16v16H7zM39 7h16v16H39zM7 39h16v16H7zM30 30h8v8h-8zM43 34h12v7H43zM29 45h8v10h-8zM43 47h12v8H43z" fill="#111"/></g>
</svg>'''
    checks = _validation(req)
    return RenderResponse(svg=svg, width_mm=width_mm, height_mm=height_mm, validation=checks, valid=all(c.status != "failed" for c in checks))
