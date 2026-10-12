import { describe, expect, it } from "vitest";
import {
  defaultVisiblePage,
  isInNavigation,
  isRoutable,
} from "../../../apps/playground/src/navigationVisibility";

describe("playground navigation visibility", () => {
  it("routes and lists visible/default pages", () => {
    expect(isRoutable()).toBe(true);
    expect(isInNavigation()).toBe(true);
    expect(isRoutable("visible")).toBe(true);
    expect(isInNavigation("visible")).toBe(true);
  });

  it("preserves direct routes for hidden overview pages", () => {
    expect(isRoutable("hidden")).toBe(true);
    expect(isInNavigation("hidden")).toBe(false);
  });

  it("excludes disabled pages from routes and the menu", () => {
    expect(isRoutable("disabled")).toBe(false);
    expect(isInNavigation("disabled")).toBe(false);
  });

  it("selects a visible default even if the overview is hidden", () => {
    const pages = [
      { id: "overview", navigation: "hidden" as const },
      { id: "basic", navigation: "visible" as const },
    ];
    expect(defaultVisiblePage(pages)?.id).toBe("basic");
    expect(defaultVisiblePage(pages.slice(0, 1))?.id).toBe("overview");
    expect(defaultVisiblePage([])).toBeUndefined();
  });
});
