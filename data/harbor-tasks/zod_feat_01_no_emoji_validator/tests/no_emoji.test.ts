import { z } from "../../index";

describe("ZodString.noEmoji()", () => {
  const schema = z.string().noEmoji();

  test("plain text passes", () => {
    expect(schema.safeParse("hello").success).toBe(true);
  });

  test("empty string passes", () => {
    expect(schema.safeParse("").success).toBe(true);
  });

  test("digits pass (not emoji)", () => {
    expect(schema.safeParse("123").success).toBe(true);
  });

  test("special chars pass", () => {
    expect(schema.safeParse("hello-world_42!").success).toBe(true);
  });

  test("single emoji fails", () => {
    expect(schema.safeParse("😀").success).toBe(false);
  });

  test("emoji in sentence fails", () => {
    expect(schema.safeParse("hello 😀 world").success).toBe(false);
  });

  test("multiple emoji fail", () => {
    expect(schema.safeParse("😀🎉🔥").success).toBe(false);
  });

  test("custom error message", () => {
    const s = z.string().noEmoji("No emoji allowed");
    const result = s.safeParse("😀");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("No emoji allowed");
    }
  });

  test("chaining with other validators", () => {
    const s = z.string().min(1).noEmoji().max(100);
    expect(s.safeParse("valid text").success).toBe(true);
    expect(s.safeParse("bad 🙁").success).toBe(false);
  });
});
