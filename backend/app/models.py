from typing import Literal, Optional
from pydantic import BaseModel, Field


class BrandAnalysis(BaseModel):
    brand_name: str
    palette: list[str]
    tone: list[str]
    visual_motifs: list[str]
    protected_copy: list[str]
    has_logo: bool = True
    has_qr: bool = False
    confidence: float = Field(ge=0, le=1)


class CreativeDirection(BaseModel):
    id: str
    name: str
    mood: str
    concept: str
    palette: list[str]
    image_prompt: str


class RenderRequest(BaseModel):
    project_id: str = "demo"
    format_id: str
    direction_id: str
    brand_name: str
    headline: str
    body: str = "Designed with intention. Made to be remembered."
    cta: str = "DISCOVER THE COLLECTION"
    background_data_url: Optional[str] = None
    preserve_source: bool = False
    lband_side: Literal["right", "left"] = "right"
    lband_vertical: Literal["bottom", "top"] = "bottom"
    page_placement: Literal["front", "inside"] = "front"


class ValidationItem(BaseModel):
    key: str
    label: str
    status: Literal["passed", "warning", "failed"]
    detail: str


class RenderResponse(BaseModel):
    svg: str
    width_mm: int
    height_mm: int
    validation: list[ValidationItem]
    valid: bool
