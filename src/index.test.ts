import { describe, expect, it } from "vitest";
import { doit } from "./index";

describe("First case", () => {
  it("should succeed", () => {
    expect(doit()).toBe("foobar");
  });
});
