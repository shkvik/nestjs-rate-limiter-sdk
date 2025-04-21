import { AppBuilder } from "./app.builder";
import { INestApplication } from "@nestjs/common";
import Redis from "ioredis";
import * as request from "supertest";
import { 
  TokenBucketCapacity, 
  TokenBucketRegular 
} from "./token-bucket";

describe("Rate Limiter Tests", () => {
  let builder: AppBuilder;
  let app: INestApplication;
  let redis: Redis;

  beforeAll(async () => {
    builder = new AppBuilder();
    app = await builder.create();
    redis = new Redis({
      host: "0.0.0.0",
      port: 6379,
    });
  });
  afterAll(async () => {
    await builder.dispose();
    await redis.quit();
  });
  describe("Token Bucket", () => {
    it("Regular", async () => {
      await redis.del(
        `nestjs-ratelimiter:${TokenBucketRegular.name}`
      );
      let delay = 0;
      const tasks = Array.from({ length: 100 }, async () => {
        await new Promise(res => setTimeout(res, delay += 50));
        await request(app.getHttpServer()).get("/token-bucket/regular")
      });
      await Promise.all(tasks);
      const tokens = await redis.hget(
        `nestjs-ratelimiter:${TokenBucketRegular.name}`, 'tokens'
      );
      expect(tokens).toEqual('0');
    });

    it("Capacity", async () => {
      await redis.del(
        `nestjs-ratelimiter:${TokenBucketCapacity.name}`
      );
      let delay = 0;
      const tasks = Array.from({ length: 9 }, async () => {
        await new Promise(res => setTimeout(res, delay += 50));
        await request(app.getHttpServer()).get("/token-bucket/capacity")
      });
      await Promise.all(tasks);
      const tokens = await redis.hget(
        `nestjs-ratelimiter:${TokenBucketCapacity.name}`, 'tokens'
      );
      expect(tokens).toEqual('1');
    });
  })

});
