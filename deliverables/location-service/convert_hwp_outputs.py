from __future__ import annotations

import sys
from pathlib import Path

from pyhwpx import Hwp


def convert(input_html: Path) -> list[Path]:
    input_html = input_html.resolve()
    if not input_html.exists():
        raise FileNotFoundError(input_html)

    base = input_html.with_suffix("")
    outputs = [base.with_suffix(".hwpx"), base.with_suffix(".hwp"), base.with_suffix(".pdf")]
    hwp = Hwp(new=True, visible=False, register_module=True)
    try:
        if not hwp.open(str(input_html), format="HTML", arg="forceopen:true"):
            raise RuntimeError("Hancom Office could not open the generated HTML document.")
        for output, format_name in zip(outputs, ("HWPX", "HWP", "PDF"), strict=True):
            if not hwp.save_as(str(output), format=format_name):
                raise RuntimeError(f"Hancom Office could not save {format_name}: {output}")
    finally:
        hwp.quit(save=False)
    return outputs


if __name__ == "__main__":
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).with_name(
        "REAL_QR_FIND_위치기반서비스_사업계획서.html"
    )
    for item in convert(source):
        print(item)
