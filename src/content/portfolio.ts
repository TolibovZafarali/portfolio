export type SceneId = "top" | "plane" | "type" | "route" | "operations" | "close";

export interface NavigationItem {
  readonly id: SceneId;
  readonly index: string;
  readonly label: string;
}

export interface StructuralProject {
  readonly id: Exclude<SceneId, "top" | "operations" | "close">;
  readonly index: string;
  readonly label: string;
  readonly descriptor: string;
  readonly mediaLabel: string;
}

export const portfolioContent = {
  eyebrow: "Selected structures",
  openingPrompt: "Scroll / open",
  completionLabel: "Structure complete",
  projects: [
    {
      id: "plane",
      index: "01",
      label: "Plane",
      descriptor: "Form / Field",
      mediaLabel: "Abstract composition of a paper slab and oxide band on a carbon field.",
    },
    {
      id: "type",
      index: "02",
      label: "Type",
      descriptor: "Scale / Contrast",
      mediaLabel: "Abstract typographic composition changing between paper and carbon materials.",
    },
    {
      id: "route",
      index: "03",
      label: "Route",
      descriptor: "Logic / Sequence",
      mediaLabel: "Abstract orthogonal route with three indexed junctions.",
    },
  ] satisfies readonly [StructuralProject, StructuralProject, StructuralProject],
  operations: ["Frame", "Sequence", "Type", "Motion", "System", "Refine"],
  navigation: [
    { id: "top", index: "00", label: "Opening" },
    { id: "plane", index: "01", label: "Plane" },
    { id: "type", index: "02", label: "Type" },
    { id: "route", index: "03", label: "Route" },
    { id: "operations", index: "04", label: "Operations" },
    { id: "close", index: "05", label: "Closure" },
  ] satisfies readonly NavigationItem[],
} as const;
