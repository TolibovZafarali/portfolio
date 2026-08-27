import { describe, expect, it } from "vitest";
import { portfolioContent } from "../../src/content/portfolio";

describe("portfolio content layer", () => {
  it("provides exactly three neutral project slots", () => {
    expect(portfolioContent.projects).toHaveLength(3);
    expect(portfolioContent.projects.map((project) => project.index)).toEqual([
      "01",
      "02",
      "03",
    ]);
  });

  it("keeps navigation identifiers unique and complete", () => {
    const ids = portfolioContent.navigation.map((item) => item.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(["top", "plane", "type", "route", "operations", "close"]);
  });

  it("contains no links, contact values, or filler copy", () => {
    const serialized = JSON.stringify(portfolioContent).toLowerCase();
    const disallowed = ["http", "@", "lorem ipsum", "linkedin", "github", "testimonial"];

    disallowed.forEach((value) => expect(serialized).not.toContain(value));
  });
});
