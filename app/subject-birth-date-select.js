"use client";

import { useMemo, useState } from "react";

export default function SubjectBirthDateSelect({ value = "" }) {
  const initial = parseDate(value);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: currentYear - 1899 }, (_, index) => String(currentYear - index)),
    [currentYear]
  );
  const maxDay = getDaysInMonth(year, month);
  const birthDate = year && month && day ? `${year}-${month}-${day}` : "";

  function updateYear(nextYear) {
    setYear(nextYear);
    if (Number(day) > getDaysInMonth(nextYear, month)) setDay("");
  }

  function updateMonth(nextMonth) {
    setMonth(nextMonth);
    if (Number(day) > getDaysInMonth(year, nextMonth)) setDay("");
  }

  return (
    <div className="subject-birth-date-field">
      <span>생년월일</span>
      <input type="hidden" name="birthDate" value={birthDate} />
      <div className="subject-birth-date-selects">
        <select
          name="birthYearPart"
          value={year}
          onChange={(event) => updateYear(event.target.value)}
          aria-label="출생 연도"
        >
          <option value="">연도</option>
          {years.map((item) => <option value={item} key={item}>{item}년</option>)}
        </select>
        <select
          name="birthMonthPart"
          value={month}
          onChange={(event) => updateMonth(event.target.value)}
          aria-label="출생 월"
        >
          <option value="">월</option>
          {Array.from({ length: 12 }, (_, index) => pad(index + 1)).map((item) => (
            <option value={item} key={item}>{item}월</option>
          ))}
        </select>
        <select
          name="birthDayPart"
          value={day}
          onChange={(event) => setDay(event.target.value)}
          aria-label="출생 일"
        >
          <option value="">일</option>
          {Array.from({ length: maxDay }, (_, index) => pad(index + 1)).map((item) => (
            <option value={item} key={item}>{item}일</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function parseDate(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match
    ? { year: match[1], month: match[2], day: match[3] }
    : { year: "", month: "", day: "" };
}

function getDaysInMonth(year, month) {
  if (!month) return 31;
  return new Date(Number(year) || 2000, Number(month), 0).getDate();
}

function pad(value) {
  return String(value).padStart(2, "0");
}
