// server/src/__tests__/routes/auth.test.ts
import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import authRouter from "../../routes/auth.js";
import { User } from "../../models/User.js";

/**
 * E2E Test Example for Auth Routes
 * 
 * NOTE: These tests require a running MongoDB instance.
 * Set MONGO_URI in your test environment or use mongodb-memory-server
 * for in-memory testing.
 * 
 * To run these tests:
 * 1. Ensure MongoDB is running
 * 2. Set TEST_MONGO_URI environment variable
 * 3. Run: npm test
 */

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

describe("Auth Routes E2E", () => {
  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.TEST_MONGO_URI || "mongodb://localhost:27017/test-db";
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Clean up after each test
    await User.deleteMany({});
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          username: "testuser",
          email: "test@example.com",
          password: "password123",
        })
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.username).toBe("testuser");
      expect(response.body.user.email).toBe("test@example.com");
    });

    it("should return 400 when missing required fields", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          username: "testuser",
          // missing email and password
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it("should return 409 when user already exists", async () => {
      // Create first user
      await request(app)
        .post("/api/auth/register")
        .send({
          username: "testuser",
          email: "test@example.com",
          password: "password123",
        });

      // Try to create duplicate user
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          username: "testuser",
          email: "test@example.com",
          password: "password456",
        })
        .expect(409);

      expect(response.body.error).toBe("User already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app)
        .post("/api/auth/register")
        .send({
          username: "testuser",
          email: "test@example.com",
          password: "password123",
        });
    });

    it("should login successfully with email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          emailOrUsername: "test@example.com",
          password: "password123",
        })
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe("test@example.com");
    });

    it("should login successfully with username", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          emailOrUsername: "testuser",
          password: "password123",
        })
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.username).toBe("testuser");
    });

    it("should return 401 for wrong password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          emailOrUsername: "test@example.com",
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body.error).toBe("Invalid credentials");
    });

    it("should return 401 for non-existent user", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          emailOrUsername: "nonexistent@example.com",
          password: "password123",
        })
        .expect(401);

      expect(response.body.error).toBe("Invalid credentials");
    });

    it("should return 400 when missing credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          emailOrUsername: "test@example.com",
          // missing password
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe("GET /api/auth/me", () => {
    let token: string;

    beforeEach(async () => {
      // Register and login to get a token
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          username: "testuser",
          email: "test@example.com",
          password: "password123",
        });

      token = response.body.token;
    });

    it("should return current user info with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe("testuser");
      expect(response.body.user.email).toBe("test@example.com");
      expect(response.body.user.passwordHash).toBeUndefined();
    });

    it("should return 401 without token", async () => {
      await request(app).get("/api/auth/me").expect(401);
    });

    it("should return 401 with invalid token", async () => {
      await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
    });
  });
});
