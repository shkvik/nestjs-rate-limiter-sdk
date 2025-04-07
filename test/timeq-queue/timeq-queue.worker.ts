import { UseLimit } from "src/decorators";

@UseLimit()
export class TimedQueueDefault {
  regular(): string {
    return "regular";
  }
}

@UseLimit()
export class TimedQueueInterval {
  interval(): string {
    return "interval";
  }
}

