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


def test_lband_render_locks_editorial_and_ad_regions():
    result = render_svg(RenderRequest(
        format_id="lband",
        direction_id="quiet-luxury",
        brand_name="ACME",
        headline="Exact copy.",
        background_data_url="data:image/png;base64,AAAA",
        preserve_source=True,
    ))
    assert 'id="editorialClip"' in result.svg
    assert 'id="lbandClip"' in result.svg
    assert result.svg.count('href="data:image/png;base64,AAAA"') == 2


def test_edit_wrap_preserves_masthead_and_places_generated_body_below_it():
    result = render_svg(RenderRequest(
        format_id="edit-wrap",
        direction_id="product-theatre",
        brand_name="MARUTI SUZUKI",
        headline="Drive the future.",
        background_data_url="data:image/png;base64,AAAA",
        preserve_source=True,
    ))
    assert "image copy 4.png" not in result.svg
    assert result.svg.count("data:image/png;base64,") == 2
    assert 'y="164" width="720" height="985"' in result.svg
