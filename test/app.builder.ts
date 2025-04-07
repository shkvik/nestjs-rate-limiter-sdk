import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "./app.module";

export class AppBuilder {
  private app: INestApplication<unknown>;

  public async create(): Promise<INestApplication<unknown>> {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleRef.createNestApplication();
    this.app = app;
    return app.init();
  }

  public async dispose(): Promise<void> {
    await this.app.close();
  }
}
