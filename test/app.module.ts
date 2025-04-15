import { Module } from "@nestjs/common";
import { LimiterModule } from "src/index";
import { TokenBucketModule } from "./token-bucket";

@Module({
  imports: [
    LimiterModule.forRoot({
      host: "0.0.0.0",
      port: 6379,
    }),
    TokenBucketModule,
  ],
})
export class AppModule { }
