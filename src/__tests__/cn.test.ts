import { describe, it, expect } from "vitest";
import { cn } from "../lib/cn";

describe("cn utility", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    const showBar = false;
    const showQux = true;
    expect(cn("foo", showBar && "bar", "baz")).toBe("foo baz");
    expect(cn("foo", showQux && "bar", "baz")).toBe("foo bar baz");
  });

  it("should handle undefined and null", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  it("should merge tailwind classes with proper precedence", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("should handle arrays of classes", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  it("should handle objects for conditional classes", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("should return empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});
