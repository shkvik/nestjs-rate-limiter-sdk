import { Module } from "@nestjs/common";
import { LimiterModule } from "nestjs-rate-limiter-sdk";

@Module({
  imports: [
    LimiterModule.forRoot({
      host: "0.0.0.0",
      port: 6379,
    }),
  ],
})
export class AppModule {}
