from __future__ import annotations

import html
import re
from pathlib import Path


HERE = Path(__file__).resolve().parent
SOURCE = HERE / "REAL_QR_FIND_위치기반서비스_사업계획서_원고.md"
OUTPUT = HERE / "REAL_QR_FIND_위치기반서비스_사업계획서.html"

FIGURES = {
    "organization": ("assets/01_위치정보보호조직.png", "그림 1. 위치정보 보호 조직(제출 전 실제 담당자 지정 필요)"),
    "scenario": ("assets/02_서비스시나리오.png", "그림 2. 제자리 QR 안심 위치공유 서비스 시나리오"),
    "dataflow": ("assets/03_데이터흐름도.png", "그림 3. 위치정보의 수집·이용·제공 데이터 흐름"),
    "security": ("assets/04_보호조치구조.png", "그림 4. 관리적·기술적 보호조치 구조"),
    "infrastructure": ("assets/05_주요설비구성도.png", "그림 5. 위치정보시스템 주요설비 및 설치장소 구성"),
}


def inline_html(text: str) -> str:
    escaped = html.escape(text)
    escaped = re.sub(r"`([^`]+)`", r'<strong class="code">\1</strong>', escaped)
    escaped = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", escaped)
    escaped = re.sub(
        r"(https?://[^\s<]+)",
        lambda match: f'<a href="{match.group(1)}">{match.group(1)}</a>',
        escaped,
    )
    return escaped


def source_body_to_html() -> str:
    lines = SOURCE.read_text(encoding="utf-8").splitlines()
    start = next(i for i, line in enumerate(lines) if line.strip() == "# 1. 사업자 현황")
    lines = lines[start:]
    out: list[str] = []
    paragraph_buffer: list[str] = []
    list_type: str | None = None

    def close_list() -> None:
        nonlocal list_type
        if list_type:
            out.append(f"</{list_type}>")
            list_type = None

    def flush_paragraph() -> None:
        if paragraph_buffer:
            out.append(f"<p>{inline_html(' '.join(paragraph_buffer))}</p>")
            paragraph_buffer.clear()

    i = 0
    while i < len(lines):
        stripped = lines[i].strip()
        if not stripped:
            flush_paragraph()
            close_list()
            i += 1
            continue
        if stripped.startswith("[[FIGURE:"):
            flush_paragraph()
            close_list()
            key = stripped[len("[[FIGURE:") : -2]
            src, caption = FIGURES[key]
            out.append(
                f'<figure><img src="{html.escape(src)}" width="640" alt="{html.escape(caption)}">'
                f"<figcaption>{html.escape(caption)}</figcaption></figure>"
            )
            i += 1
            continue
        if stripped.startswith("# "):
            flush_paragraph()
            close_list()
            out.append('<div style="page-break-before: always; break-before: page;"></div>')
            out.append(f'<h1 class="chapter" style="page-break-before: always;">{inline_html(stripped[2:])}</h1>')
            i += 1
            continue
        if stripped.startswith("## "):
            flush_paragraph()
            close_list()
            out.append(f"<h2>{inline_html(stripped[3:])}</h2>")
            i += 1
            continue
        if stripped.startswith("### "):
            flush_paragraph()
            close_list()
            out.append(f"<h3>{inline_html(stripped[4:])}</h3>")
            i += 1
            continue
        if stripped.startswith("> "):
            flush_paragraph()
            close_list()
            out.append(f"<blockquote>{inline_html(stripped[2:])}</blockquote>")
            i += 1
            continue
        if stripped.startswith("|"):
            flush_paragraph()
            close_list()
            raw_rows: list[list[str]] = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                raw_rows.append([cell.strip() for cell in lines[i].strip().strip("|").split("|")])
                i += 1
            rows = [
                row
                for idx, row in enumerate(raw_rows)
                if idx != 1 or not all(re.fullmatch(r":?-{3,}:?", cell) for cell in row)
            ]
            out.append("<table>")
            for row_idx, row in enumerate(rows):
                tag = "th" if row_idx == 0 else "td"
                out.append("<tr>" + "".join(f"<{tag}>{inline_html(cell)}</{tag}>" for cell in row) + "</tr>")
            out.append("</table>")
            continue
        number = re.match(r"^(\d+)\.\s+(.*)$", stripped)
        if number:
            flush_paragraph()
            if list_type != "ol":
                close_list()
                out.append("<ol>")
                list_type = "ol"
            out.append(f"<li>{inline_html(number.group(2))}</li>")
            i += 1
            continue
        if stripped.startswith("- "):
            flush_paragraph()
            if list_type != "ul":
                close_list()
                out.append("<ul>")
                list_type = "ul"
            out.append(f"<li>{inline_html(stripped[2:])}</li>")
            i += 1
            continue
        paragraph_buffer.append(stripped)
        i += 1

    flush_paragraph()
    close_list()
    return "\n".join(out)


def build() -> Path:
    body = source_body_to_html()
    document = f"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>REAL_QR_FIND 위치기반서비스 사업계획서</title>
<style>
@page {{ size: A4; margin: 20mm 20mm 18mm; }}
* {{ box-sizing: border-box; }}
body {{ font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; color: #111827; font-size: 10.5pt; line-height: 1.55; margin: 0 auto; width: 170mm; }}
.cover {{ page-break-after: always; min-height: 245mm; padding-top: 24mm; text-align: center; }}
.cover-kicker {{ color: #2F79A8; font-weight: 700; margin: 0 0 20mm; }}
.cover h1 {{ color: #123B5D; font-size: 28pt; line-height: 1.25; margin: 0 0 8mm; }}
.cover h2 {{ color: #2F79A8; border: 0; font-size: 14pt; margin: 0 0 12mm; }}
.cover-rule {{ border-top: 4px solid #2F79A8; margin: 0 0 12mm; }}
.cover-table {{ width: 135mm; margin: 0 auto; }}
.cover-status {{ margin-top: 14mm; color: #A43A3A; font-weight: 700; }}
.front {{ page-break-after: always; }}
.page-break {{ page-break-after: always; break-after: page; height: 0; }}
h1.chapter {{ color: #123B5D; font-size: 17pt; border-bottom: 2px solid #2F79A8; padding-bottom: 2mm; margin: 0 0 7mm; page-break-before: always; }}
h1.chapter:first-child {{ page-break-before: auto; }}
h2 {{ color: #2F79A8; font-size: 14pt; margin: 7mm 0 3mm; page-break-after: avoid; }}
h3 {{ color: #123B5D; font-size: 11.5pt; margin: 5mm 0 2mm; page-break-after: avoid; }}
p {{ margin: 0 0 3mm; text-align: justify; }}
ul, ol {{ margin: 0 0 3mm 7mm; padding-left: 4mm; }}
li {{ margin: 0 0 1.5mm; }}
table {{ width: 100%; border-collapse: collapse; margin: 3mm 0 5mm; page-break-inside: auto; }}
tr {{ page-break-inside: avoid; }}
th, td {{ border: 1px solid #AAB4BC; padding: 2.2mm 2.5mm; vertical-align: middle; font-size: 9pt; line-height: 1.35; }}
th {{ background: #123B5D; color: white; font-weight: 700; }}
td:first-child {{ background: #EAF4FA; color: #123B5D; font-weight: 700; }}
blockquote {{ margin: 4mm 0 6mm; border-left: 5px solid #8A6500; background: #FFF5D8; padding: 4mm 5mm; color: #5C4700; font-weight: 700; }}
figure {{ margin: 4mm 0 6mm; text-align: center; page-break-inside: avoid; }}
figure img {{ width: 100%; height: auto; border: 1px solid #AAB4BC; }}
figcaption {{ margin-top: 2mm; color: #5F6B76; font-size: 8.5pt; }}
.code {{ color: #123B5D; }}
.toc li {{ margin-bottom: 2mm; }}
a {{ color: #1F67A5; text-decoration: underline; }}
</style>
</head>
<body>
<section class="cover">
  <p class="cover-kicker">위치기반서비스사업 신고 준비본</p>
  <h1>위치기반서비스<br>사업계획서</h1>
  <h2>제자리 QR 안심 위치공유 서비스<br>REAL_QR_FIND</h2>
  <div class="cover-rule"></div>
  <table class="cover-table">
    <tr><td>상호</td><td>제자리</td></tr>
    <tr><td>대표자</td><td>이진영, 이진선</td></tr>
    <tr><td>사업자등록번호</td><td>639-58-00963</td></tr>
    <tr><td>서비스 URL</td><td>https://zezari.family</td></tr>
    <tr><td>작성기준일</td><td>2026년 8월 1일</td></tr>
  </table>
  <p class="cover-status">문서상태: 제출 준비본 - 보완항목 확인 후 제출</p>
</section>
<div class="page-break" style="page-break-after: always;"></div>
<section class="front">
  <h1 class="chapter">문서관리 및 제출 전 확인</h1>
  <blockquote>이 문서는 완성 원고이나 신고 제출본으로 확정하기 전에 별도 위치정보 동의, 법정 확인자료 원장, 자동 파기, 좌표 저장 보호, 관리자 감사로그를 구현하고 관련 화면·계약·설정 증빙을 첨부해야 합니다.</blockquote>
  <table>
    <tr><th>구분</th><th>내용</th></tr>
    <tr><td>문서명</td><td>위치기반서비스 사업계획서</td></tr>
    <tr><td>상호</td><td>제자리</td></tr>
    <tr><td>서비스명</td><td>제자리 QR 안심 위치공유 서비스(REAL_QR_FIND)</td></tr>
    <tr><td>작성기준일</td><td>2026년 8월 1일</td></tr>
    <tr><td>위치정보관리책임자</td><td>이진선(대표자 지정서 확인 필요)</td></tr>
    <tr><td>문의</td><td>general@zezari.com / 1668-1290</td></tr>
  </table>
  <h2>목차</h2>
  <ol class="toc">
    <li>사업자 현황</li><li>서비스 내용</li><li>위치정보의 보호조치 내역</li><li>주요설비 내용 및 설치 장소</li>
    <li>별첨 1. 위치정보의 관리지침</li><li>별첨 2. 기술적 보호조치 증빙자료 목록</li><li>별첨 3. 사업자 확인서류 목록</li>
    <li>제출 전 최종 점검표</li><li>참고 법령 및 자료</li>
  </ol>
</section>
<div class="page-break" style="page-break-after: always;"></div>
{body}
</body>
</html>
"""
    OUTPUT.write_text(document, encoding="utf-8")
    return OUTPUT


if __name__ == "__main__":
    print(build())
