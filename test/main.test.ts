import { exampleFunction } from "src/index";
import { AppBuilder } from "./app.builder";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";

describe("Rate Limiter Tests", function () {
  let builder: AppBuilder;
  let app: INestApplication;

  beforeAll(async () => {
    builder = new AppBuilder();
    app = await builder.create();
  });
  afterAll(async () => {
    await builder.dispose();
  });

  it("Token Bucket", async () => {
    const tasks = Array.from({ length: 100 }, async () => {
      await request(app.getHttpServer()).get("/regular");
    });
    await Promise.all(tasks);

    //const res = await request(app.getHttpServer()).get("/method1");

    const a = 0;
  });
});
