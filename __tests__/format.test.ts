import { describe, it, expect } from "vitest";
import { formatDate, relativeDay, buildJiraId, buildText } from "@/lib/format";

describe("formatDate", () => {
  it("formats ISO date to readable string", () => {
    expect(formatDate("2026-05-20")).toBe("20 May 2026");
  });

  it("returns empty string for empty input", () => {
    expect(formatDate("")).toBe("");
  });
});

describe("relativeDay", () => {
  it("returns null for empty string", () => {
    expect(relativeDay("")).toBeNull();
  });
});

describe("buildJiraId", () => {
  it("builds full jira id", () => {
    expect(buildJiraId("29", "P100")).toBe("JIRA-P100-29");
  });

  it("returns suffix only when no prefix", () => {
    expect(buildJiraId("29", "")).toBe("29");
  });

  it("returns empty string for empty suffix", () => {
    expect(buildJiraId("", "P100")).toBe("");
  });

  it("trims whitespace", () => {
    expect(buildJiraId(" 29 ", " P100 ")).toBe("JIRA-P100-29");
  });
});

describe("buildText", () => {
  const entry = {
    name: "ไมโครเวฟ",
    date: "2026-05-20",
    yesterday: [{ jira: "29", desc: "Integrate สายเข้า" }],
    today: [{ jira: "30", desc: "Fix bug" }],
    blockers: "",
    help: "",
  };

  it("includes name and date in header", () => {
    const text = buildText(entry);
    expect(text).toContain("[ไมโครเวฟ]");
    expect(text).toContain("20 May 2026");
  });

  it("formats jira task with prefix", () => {
    const text = buildText(entry, "P100");
    expect(text).toContain("JIRA-P100-29");
  });

  it("shows ไม่มี for empty blockers", () => {
    const text = buildText(entry);
    expect(text).toContain("* ไม่มี");
  });

  it("uses fallback name when empty", () => {
    const text = buildText({ ...entry, name: "" });
    expect(text).toContain("[ชื่อ]");
  });
});
