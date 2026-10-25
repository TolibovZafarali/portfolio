import { describe, expect, it } from "vitest";
import { portfolioContent } from "../../src/content/portfolio";

describe("portfolio content layer", () => {
  it("features Venfour before Imposter: All Languages", () => {
    expect(portfolioContent.projects.map((project) => project.name)).toEqual([
      "Venfour",
      "Imposter: All Languages",
    ]);
    expect(portfolioContent.projects.map((project) => project.index)).toEqual(["01", "02"]);
  });

  it("keeps navigation identifiers unique and complete", () => {
    const ids = portfolioContent.navigation.map((item) => item.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(["work", "about", "contact"]);
  });

  it("links to the real projects and the developer's GitHub profile", () => {
    expect(portfolioContent.github).toBe("https://github.com/TolibovZafarali");
    expect(portfolioContent.projects.map((project) => project.url)).toEqual([
      "https://venfour.com",
      "https://apps.apple.com/us/app/imposter-all-languages/id6771144493",
    ]);
    for (const project of portfolioContent.projects) {
      expect(project.repository).toBe(`https://github.com/TolibovZafarali/${project.id}`);
      expect(project.description.trim()).not.toBe("");
      expect(project.details.length).toBeGreaterThan(0);
    }
  });
});
