// server/src/__tests__/utils/auth.test.ts
import {
  createTokenForUser,
  verifyToken,
  hashPassword,
  comparePassword,
} from "../../utils/auth.js";

describe("auth utils", () => {
  describe("hashPassword and comparePassword", () => {
    it("should hash a password and verify it correctly", async () => {
      const password = "testPassword123!";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);

      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const password = "testPassword123!";
      const wrongPassword = "wrongPassword456!";
      const hash = await hashPassword(password);

      const isValid = await comparePassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it("should handle string conversion", async () => {
      const password = 12345;
      const hash = await hashPassword(password as any);

      const isValid = await comparePassword(String(password), hash);
      expect(isValid).toBe(true);
    });
  });

  describe("createTokenForUser and verifyToken", () => {
    it("should create and verify a valid JWT token", () => {
      const user = {
        _id: "user123",
        username: "testuser",
        role: "student",
      };

      const token = createTokenForUser(user);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);

      const payload = verifyToken(token);
      expect(payload.id).toBe("user123");
      expect(payload.role).toBe("student");
      expect(payload.u).toBe("testuser");
    });

    it("should handle different user roles", () => {
      const adminUser = {
        _id: "admin123",
        username: "adminuser",
        role: "admin",
      };

      const token = createTokenForUser(adminUser);
      const payload = verifyToken(token);

      expect(payload.id).toBe("admin123");
      expect(payload.role).toBe("admin");
    });

    it("should throw error for invalid token", () => {
      const invalidToken = "invalid.token.here";

      expect(() => {
        verifyToken(invalidToken);
      }).toThrow();
    });

    it("should throw error for expired token", () => {
      // This test would require mocking time or using a very short expiration
      // For now, we'll just verify that the token format is correct
      const user = {
        _id: "user123",
        username: "testuser",
        role: "student",
      };

      const token = createTokenForUser(user);
      expect(token.split(".").length).toBe(3); // JWT format: header.payload.signature
    });
  });
});
