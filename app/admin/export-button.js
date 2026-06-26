"use client";

export default function AdminExportButton({ filename, rows, disabledText = "다운로드 데이터 없음" }) {
  const hasRows = Array.isArray(rows) && rows.length > 0;

  function downloadCsv() {
    if (!hasRows) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
    ].join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = normalizeFilename(filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      className="excel-download-button"
      type="button"
      onClick={downloadCsv}
      disabled={!hasRows}
      title={hasRows ? "현재 조회 결과를 엑셀 호환 CSV로 다운로드" : disabledText}
    >
      엑셀 다운로드
    </button>
  );
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function normalizeFilename(filename) {
  const base = String(filename || "admin-export").replace(/[\\/:*?"<>|]+/g, "_");
  return base.toLowerCase().endsWith(".csv") ? base : `${base}.csv`;
}
