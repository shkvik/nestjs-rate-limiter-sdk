import {
  DynamicModule,
  Global,
  Inject,
  Logger,
  Module,
  OnApplicationShutdown,
  OnModuleInit,
} from "@nestjs/common";
import { DiscoveryModule, DiscoveryService } from "@nestjs/core";
import Redis, { RedisOptions } from "ioredis";
import { RATE_LIMIT_META_KEY } from "./decorators";
import { TIMED_QUEUE_SCRIPT } from "./scripts/timed-queue.script";
import { TOKEN_BUCKET_SCRIPT } from "./scripts/token-bucket.script";
import { FIXED_WINDOW_SCRIPT } from "./scripts/fixed-window.script";
import { LimiterException } from "./limiter.exception";
import {
  CustomFixedWindowOpts,
  CustomLimitCommon,
  CustomTimedQueueOpts,
  CustomTokenBucketOpts,
  LimitFixedWindowOpts,
  LimitOpts,
  LimitOverflow,
  LimitTimedQueueOpts,
  LimitTokenBucketOpts,
} from "./types";

const RATE_LIMITER_CLIENT = Symbol("RATE_LIMITER_CLIENT");

/**
 * @publicApi
 */
@Global()
@Module({
  imports: [DiscoveryModule],
})
export class LimiterModule implements OnApplicationShutdown, OnModuleInit {
  private readonly logger = new Logger(LimiterModule.name);
  constructor(
    @Inject(RATE_LIMITER_CLIENT)
    private readonly client: Redis,
    @Inject()
    private readonly discoveryService: DiscoveryService,
  ) {}

  public static forRoot(opts: RedisOptions | Redis): DynamicModule {
    const client = opts instanceof Redis ? opts : new Redis(opts);
    return {
      module: LimiterModule,
      providers: [
        {
          provide: RATE_LIMITER_CLIENT,
          useValue: client,
        },
      ],
    };
  }

  public async onModuleInit(): Promise<void> {
    const timedQueueSHA = (await this.client.script(
      "LOAD",
      TIMED_QUEUE_SCRIPT,
    )) as string;

    const tokenBucketSHA = (await this.client.script(
      "LOAD",
      TOKEN_BUCKET_SCRIPT,
    )) as string;

    const fixedWindowSHA = (await this.client.script(
      "LOAD",
      FIXED_WINDOW_SCRIPT,
    )) as string;

    const providers = this.getClassProviders();

    this.redefineMethods({
      providers,
      timedQueueSHA,
      tokenBucketSHA,
      fixedWindowSHA,
    });
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.client.quit();
  }

  private getClassProviders(): any[] {
    const wrappers = this.discoveryService.getProviders();
    const classProviders = wrappers.filter(
      (wrapper) =>
        wrapper.metatype &&
        typeof wrapper.metatype === "function" &&
        wrapper.instance &&
        wrapper.instance.constructor === wrapper.metatype &&
        Boolean(
          Reflect.getMetadata(
            RATE_LIMIT_META_KEY,
            wrapper.instance.constructor,
          ),
        ),
    );
    return classProviders.map((wrapper) => wrapper.instance);
  }

  private redefineMethods(params: {
    providers: any[];
    timedQueueSHA: string;
    tokenBucketSHA: string;
    fixedWindowSHA: string;
  }): void {
    const { providers, timedQueueSHA, tokenBucketSHA, fixedWindowSHA } = params;
    for (const provider of providers) {
      const prototype = Object.getPrototypeOf(provider);
      const methodNames = Object.getOwnPropertyNames(prototype).filter(
        (methodName) => methodName !== "constructor",
      );

      for (const methodName of methodNames) {
        this.redefineMethod({
          provider,
          prototype,
          methodName,
          timedQueueSHA,
          tokenBucketSHA,
          fixedWindowSHA,
        });
      }
    }
  }

  private redefineMethod(params: {
    provider: any;
    prototype: any;
    methodName: string;
    timedQueueSHA: string;
    tokenBucketSHA: string;
    fixedWindowSHA: string;
  }): void {
    const {
      provider,
      prototype,
      methodName,
      timedQueueSHA,
      tokenBucketSHA,
      fixedWindowSHA,
    } = params;
    const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);
    if (descriptor && typeof descriptor.value === "function") {
      const metadataCls = Reflect.getMetadata(
        RATE_LIMIT_META_KEY,
        provider.constructor,
      );
      const metadataMethod = Reflect.getMetadata(
        RATE_LIMIT_META_KEY,
        descriptor.value,
      );
      if (!metadataCls) {
        return;
      }
      this.setLimitation({
        provider,
        methodName,
        descriptor,
        metadataCls,
        metadataMethod,
        timedQueueSHA,
        tokenBucketSHA,
        fixedWindowSHA,
      });
    }
  }

  private setLimitation(params: {
    provider: unknown;
    methodName: string;
    descriptor: PropertyDescriptor;
    metadataCls: LimitOpts;
    metadataMethod: CustomLimitCommon;
    timedQueueSHA: string;
    tokenBucketSHA: string;
    fixedWindowSHA: string;
  }): void {
    const {
      provider,
      methodName,
      descriptor,
      metadataCls,
      metadataMethod,
      timedQueueSHA,
      tokenBucketSHA,
      fixedWindowSHA,
    } = params;
    if (metadataCls instanceof LimitTimedQueueOpts) {
      this.setTimedQueue({
        provider,
        timedQueueSHA,
        methodName,
        descriptor,
        metadataCls,
        metadataMethod,
      });
    } else if (metadataCls instanceof LimitTokenBucketOpts) {
      this.setTokenBucket({
        provider,
        tokenBucketSHA,
        methodName,
        descriptor,
        metadataCls,
        metadataMethod,
      });
    } else if (metadataCls instanceof LimitFixedWindowOpts) {
      this.setFixedWindow({
        provider,
        fixedWindowSHA,
        methodName,
        descriptor,
        metadataCls,
        metadataMethod,
      });
    }
  }

  private setTimedQueue(params: {
    provider: unknown;
    timedQueueSHA: string;
    methodName: string;
    descriptor: PropertyDescriptor;
    metadataCls: LimitTimedQueueOpts;
    metadataMethod: CustomTimedQueueOpts;
  }): void {
    const {
      provider,
      descriptor,
      metadataCls,
      metadataMethod,
      methodName,
      timedQueueSHA,
    } = params;
    if (metadataMethod?.enabled) {
      return;
    }
    const originalMethod = descriptor.value;
    const name =
      metadataCls?.key ?? `nestjs-ratelimiter:${provider.constructor.name}`;

    const interval = metadataMethod?.interval ?? metadataCls?.interval ?? 1000;

    descriptor.value = async (...args: unknown[]) => {
      const delay = (await this.client.evalsha(
        timedQueueSHA,
        1,
        name,
        interval,
      )) as string;
      const parsedDelay = Number(delay);
      this.logger.debug(delay);
      if (parsedDelay > 0) {
        throw new LimiterException(`queue is overflowed`);
      }
      await new Promise((res) => setTimeout(res, Number(delay)));
      return originalMethod.apply(provider, args);
    };
    Object.defineProperty(provider, methodName, descriptor);
  }

  private setTokenBucket(params: {
    provider: unknown;
    tokenBucketSHA: string;
    methodName: string;
    descriptor: PropertyDescriptor;
    metadataCls: LimitTokenBucketOpts;
    metadataMethod: CustomTokenBucketOpts;
  }): void {
    const {
      provider,
      descriptor,
      metadataCls,
      metadataMethod,
      methodName,
      tokenBucketSHA,
    } = params;
    if (metadataMethod?.enabled) {
      return;
    }
    const originalMethod = descriptor.value;
    const key =
      metadataCls?.key ?? `nestjs-ratelimiter:${provider.constructor.name}`;

    const overflow =
      metadataMethod?.overflow ?? metadataCls?.overflow ?? LimitOverflow.WAIT;

    const timeout =
      metadataMethod?.timeout ?? metadataCls?.timeout ?? 60000 * 10;

    const requested = metadataMethod?.cost ?? 1;
    const capacity = metadataCls?.capacity ?? 100;
    const refill = metadataCls?.refill ?? 60000;

    descriptor.value = async (...args: unknown[]) => {
      let [allowed, tokens, untilRefill] = (await this.client.evalsha(
        tokenBucketSHA,
        1,
        key,
        requested,
        capacity,
        refill,
      )) as [number, number, number];
      if (!allowed) {
        if (overflow === LimitOverflow.WAIT) {
          const start = Date.now();
          while (!allowed) {
            const elapsed = Date.now() - start;
            if (elapsed >= timeout) {
              throw new LimiterException(`wait timeout exceeded`);
            }
            await new Promise((res) => setTimeout(res, untilRefill));
            [allowed, tokens, untilRefill] = (await this.client.evalsha(
              tokenBucketSHA,
              1,
              key,
              requested,
              capacity,
              refill,
            )) as [number, number, number];
          }
        } else {
          throw new LimiterException(`bucket is overflowed`);
        }
      }
      return originalMethod.apply(provider, args);
    };
    Object.defineProperty(provider, methodName, descriptor);
  }

  private setFixedWindow(params: {
    provider: unknown;
    fixedWindowSHA: string;
    methodName: string;
    descriptor: PropertyDescriptor;
    metadataCls: LimitFixedWindowOpts;
    metadataMethod: CustomFixedWindowOpts;
  }): void {
    const {
      provider,
      descriptor,
      metadataCls,
      metadataMethod,
      methodName,
      fixedWindowSHA,
    } = params;
    if (metadataMethod?.enabled) {
      return;
    }
    const originalMethod = descriptor.value;
    const key =
      metadataCls?.key ?? `nestjs-ratelimiter:${provider.constructor.name}`;

    const overflow =
      metadataMethod?.overflow ?? metadataCls?.overflow ?? LimitOverflow.WAIT;

    const timeout =
      metadataMethod?.timeout ?? metadataCls?.timeout ?? 60000 * 10;

    const limit = metadataCls?.limit ?? 100;
    const window = metadataCls?.window ?? 60000;

    descriptor.value = async (...args: unknown[]) => {
      let [allowed, current, ttl] = (await this.client.evalsha(
        fixedWindowSHA,
        1,
        key,
        limit,
        window,
      )) as [number, number, number];
      if (!allowed) {
        if (overflow === LimitOverflow.WAIT) {
          const start = Date.now();
          while (!allowed) {
            const elapsed = Date.now() - start;
            if (elapsed >= timeout) {
              throw new LimiterException(`wait timeout exceeded`);
            }
            await new Promise((res) => setTimeout(res, ttl));
            [allowed, current, ttl] = (await this.client.evalsha(
              fixedWindowSHA,
              1,
              key,
              limit,
              window,
            )) as [number, number, number];
          }
        } else {
          throw new LimiterException(`bucket is overflowed`);
        }
      }
      return originalMethod.apply(provider, args);
    };
    Object.defineProperty(provider, methodName, descriptor);
  }
}
