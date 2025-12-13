// server/src/utils/helpers.ts
import { Request, Response } from "express";

/**
 * Get the authenticated user ID from the request object
 * Handles both req.user.id and req.user._id patterns
 */
export function getUserId(req: Request): string | null {
  const user = (req as any).user;
  if (!user) return null;
  const id = String(user.id || user._id || "");
  // Return null if empty string instead of empty string for proper type safety
  return id.length > 0 ? id : null;
}

/**
 * Check if the authenticated user owns a resource
 * @param req - Express request object
 * @param ownerId - The owner ID from the resource (string or ObjectId)
 * @returns true if user owns the resource
 */
export function isOwner(req: Request, ownerId: any): boolean {
  const userId = getUserId(req);
  if (!userId) return false;
  return String(ownerId) === userId;
}

/**
 * Check if the authenticated user has a specific role
 */
export function hasRole(req: Request, ...roles: string[]): boolean {
  const user = (req as any).user;
  if (!user) return false;
  const userRole = String(user.role ?? "");
  return roles.includes(userRole);
}

/**
 * Check if user is owner OR has one of the specified roles
 */
export function isOwnerOrHasRole(
  req: Request,
  ownerId: any,
  ...roles: string[]
): boolean {
  return isOwner(req, ownerId) || hasRole(req, ...roles);
}

/**
 * Standard error response helper
 */
export function sendError(
  res: Response,
  statusCode: number,
  message: string
): Response {
  return res.status(statusCode).json({ error: message });
}

/**
 * Standard success response helper
 */
export function sendSuccess(
  res: Response,
  data: any,
  statusCode: number = 200
): Response {
  return res.status(statusCode).json(data);
}

/**
 * Verify user is authenticated, return error response if not
 * Returns the user ID if authenticated, null otherwise
 */
export function requireUser(req: Request, res: Response): string | null {
  const userId = getUserId(req);
  if (!userId) {
    sendError(res, 401, "Unauthorized");
    return null;
  }
  return userId;
}

/**
 * Verify ownership or return 403 error
 * Returns true if authorized, false if not (and sends error)
 */
export function verifyOwnership(
  req: Request,
  res: Response,
  ownerId: any,
  allowedRoles: string[] = ["admin"]
): boolean {
  if (isOwnerOrHasRole(req, ownerId, ...allowedRoles)) {
    return true;
  }
  sendError(res, 403, "Forbidden");
  return false;
}
