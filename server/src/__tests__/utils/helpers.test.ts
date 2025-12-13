// server/src/__tests__/utils/helpers.test.ts
import { Request, Response } from "express";
import {
  getUserId,
  isOwner,
  hasRole,
  isOwnerOrHasRole,
  sendError,
  sendSuccess,
  requireUser,
  verifyOwnership,
} from "../../utils/helpers.js";

// Mock Express Request and Response
const mockRequest = (user?: any): Request => {
  return { user } as any as Request;
};

const mockResponse = (): Response => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("helpers utils", () => {
  describe("getUserId", () => {
    it("should return user id from req.user.id", () => {
      const req = mockRequest({ id: "user123" });
      expect(getUserId(req)).toBe("user123");
    });

    it("should return user id from req.user._id", () => {
      const req = mockRequest({ _id: "user456" });
      expect(getUserId(req)).toBe("user456");
    });

    it("should return null when no user", () => {
      const req = mockRequest();
      expect(getUserId(req)).toBeNull();
    });
  });

  describe("isOwner", () => {
    it("should return true when user owns resource", () => {
      const req = mockRequest({ id: "user123" });
      expect(isOwner(req, "user123")).toBe(true);
    });

    it("should return false when user does not own resource", () => {
      const req = mockRequest({ id: "user123" });
      expect(isOwner(req, "user456")).toBe(false);
    });

    it("should return false when no user", () => {
      const req = mockRequest();
      expect(isOwner(req, "user123")).toBe(false);
    });
  });

  describe("hasRole", () => {
    it("should return true when user has specified role", () => {
      const req = mockRequest({ role: "admin" });
      expect(hasRole(req, "admin")).toBe(true);
    });

    it("should return true when user has one of multiple roles", () => {
      const req = mockRequest({ role: "instructor" });
      expect(hasRole(req, "admin", "instructor")).toBe(true);
    });

    it("should return false when user does not have role", () => {
      const req = mockRequest({ role: "student" });
      expect(hasRole(req, "admin", "instructor")).toBe(false);
    });

    it("should return false when no user", () => {
      const req = mockRequest();
      expect(hasRole(req, "admin")).toBe(false);
    });
  });

  describe("isOwnerOrHasRole", () => {
    it("should return true when user is owner", () => {
      const req = mockRequest({ id: "user123", role: "student" });
      expect(isOwnerOrHasRole(req, "user123", "admin")).toBe(true);
    });

    it("should return true when user has role", () => {
      const req = mockRequest({ id: "user123", role: "admin" });
      expect(isOwnerOrHasRole(req, "user456", "admin")).toBe(true);
    });

    it("should return false when neither owner nor has role", () => {
      const req = mockRequest({ id: "user123", role: "student" });
      expect(isOwnerOrHasRole(req, "user456", "admin")).toBe(false);
    });
  });

  describe("sendError", () => {
    it("should send error response with correct status and message", () => {
      const res = mockResponse();
      sendError(res, 404, "Not found");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Not found" });
    });
  });

  describe("sendSuccess", () => {
    it("should send success response with default status 200", () => {
      const res = mockResponse();
      const data = { id: "123", name: "Test" };
      sendSuccess(res, data);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(data);
    });

    it("should send success response with custom status", () => {
      const res = mockResponse();
      const data = { ok: true };
      sendSuccess(res, data, 201);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(data);
    });
  });

  describe("requireUser", () => {
    it("should return user id when authenticated", () => {
      const req = mockRequest({ id: "user123" });
      const res = mockResponse();
      expect(requireUser(req, res)).toBe("user123");
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should send 401 error when not authenticated", () => {
      const req = mockRequest();
      const res = mockResponse();
      expect(requireUser(req, res)).toBeNull();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });
  });

  describe("verifyOwnership", () => {
    it("should return true when user is owner", () => {
      const req = mockRequest({ id: "user123", role: "student" });
      const res = mockResponse();
      expect(verifyOwnership(req, res, "user123")).toBe(true);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return true when user has allowed role", () => {
      const req = mockRequest({ id: "user123", role: "admin" });
      const res = mockResponse();
      expect(verifyOwnership(req, res, "user456", ["admin"])).toBe(true);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should send 403 error and return false when not authorized", () => {
      const req = mockRequest({ id: "user123", role: "student" });
      const res = mockResponse();
      expect(verifyOwnership(req, res, "user456", ["admin"])).toBe(false);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Forbidden" });
    });
  });
});
