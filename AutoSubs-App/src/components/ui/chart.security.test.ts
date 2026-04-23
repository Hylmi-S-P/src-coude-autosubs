
export function sanitizeId(id: string) {
  return id.replace(/[^a-zA-Z0-9-_]/g, "")
}

export function sanitizeValue(value: string) {
  return value.replace(/[;{}\\\\<>]/g, "")
}

import { describe, it } from "node:test";
import assert from "node:assert";

describe("Chart sanitization utilities (standalone validation)", () => {
  describe("sanitizeId", () => {
    it("should allow alphanumeric characters, hyphens, and underscores", () => {
      assert.strictEqual(sanitizeId("valid-id_123"), "valid-id_123");
    });

    it("should strip spaces and special characters", () => {
      assert.strictEqual(sanitizeId("invalid id !@#"), "invalidid");
    });

    it("should prevent CSS injection attempts in IDs", () => {
      assert.strictEqual(sanitizeId("chart-id]; background: url(javascript:alert(1))"), "chart-idbackgroundurljavascriptalert1");
    });
  });

  describe("sanitizeValue", () => {
    it("should allow safe color values", () => {
      assert.strictEqual(sanitizeValue("hsl(var(--primary))"), "hsl(var(--primary))");
      assert.strictEqual(sanitizeValue("#ff0000"), "#ff0000");
    });

    it("should strip characters that break CSS context", () => {
      // Strips ; { } \ < >
      assert.strictEqual(sanitizeValue("red; background: url(x)"), "red background: url(x)");
      assert.strictEqual(sanitizeValue("blue { color: red }"), "blue  color: red ");
      assert.strictEqual(sanitizeValue("back\\slash"), "backslash");
    });

    it("should prevent basic XSS and injection via values", () => {
       assert.strictEqual(sanitizeValue("expression(alert('xss'))"), "expression(alert('xss'))");
       assert.strictEqual(sanitizeValue("red</style><script>alert(1)</script>"), "red/stylescriptalert(1)/script");
    });
  });
});
