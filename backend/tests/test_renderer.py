from app.models import RenderRequest
from app.renderer import FORMATS, render_svg


def test_all_formats_render_with_exact_mm_dimensions():
    for format_id, dimensions in FORMATS.items():
        result = render_svg(RenderRequest(format_id=format_id, direction_id="quiet-luxury", brand_name="ACME", headline="Exact copy."))
        assert (result.width_mm, result.height_mm) == dimensions
        assert result.valid
        assert "THE DAILY CHRONICLE" in result.svg
        assert "Exact copy." in result.svg


def test_missing_approved_copy_fails_validation():
    result = render_svg(RenderRequest(format_id="jacket", direction_id="monochrome", brand_name="ACME", headline=""))
    assert not result.valid
    assert any(item.key == "copy" and item.status == "failed" for item in result.validation)
