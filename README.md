# Rate Limiter SDK - The [Redis](https://redis.io/) limiter for [NestJS](https://nestjs.com/)

> [!IMPORTANT]
>
> This project was created with the goal of building simple and scalable
> rate limiter to control requests from **YOUR** application to a **THIRD-PARTY API**.
> And although it does allow using that mode, it is strongly discouraged to do so.
> 

Beginning to work with the library, I recommend reviewing the documentation and understanding how it works, so you won't encounter any surprises during usage. I aimed to create the simplest possible interface with reliable logic, which is why I wrote tests for every configuration option — so both you and I can sleep better at night.

# Overview
The library is an importable module that, once imported, provides you with two decorators for classes and methods. It includes three of the most commonly used rate limiting strategies. To get started, you'll need a running Redis instance and you'll need to import the LimiterModule. The library uses ioredis for Redis interaction, so the connection configuration is identical — or you can pass in an existing Redis client directly.
```ts
import { Module } from "@nestjs/common";
import { LimiterModule } from "nestjs-rate-limiter-sdk";

@Module({
  imports: [
    LimiterModule.forRoot({
      host: "localhost",
      port: 6379,
    }),
  ],
})
export class AppModule {}
```

## 1. Token Bucket
```ts
import { UseLimit } from "src/decorators";
import { RateLimitation } from "src/types";

@UseLimit({ limitation: RateLimitation.TOKEN_BUCKET })
export class TokenBucket {
  method(): void {
    console.log("Hello World!");
  }
}

```

