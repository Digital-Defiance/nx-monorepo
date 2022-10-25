export interface IBreadCrumbTrace {
  readonly date: Date;
  readonly functionName: string;
  readonly functionArgs: Array<any>;
}

export class HanselGretelBreadCrumbTrail implements IBreadCrumbTrace {
  public readonly traceLog: Array<IBreadCrumbTrace>;
  public readonly date: Date;
  public readonly functionName: string;
  public readonly functionArgs: Array<any>;
  constructor(
    traceLog: Array<IBreadCrumbTrace>,
    functionName: string,
    ...args: Array<any>
  ) {
    this.date = new Date();
    this.functionName = functionName;
    this.functionArgs = args;
    this.traceLog = traceLog;
    this.traceLog.push(this);
  }
  public static trace(
    traceLog: Array<IBreadCrumbTrace>,
    functionName: string,
    ...args: Array<any>
  ): HanselGretelBreadCrumbTrail {
    return new HanselGretelBreadCrumbTrail(traceLog, functionName, ...args);
  }
  public trace(...args: Array<any>): HanselGretelBreadCrumbTrail {
    return new HanselGretelBreadCrumbTrail(
      this.traceLog,
      this.functionName,
      ...args
    );
  }
  public deeperTrace(
    functionName: string,
    ...args: Array<any>
  ): HanselGretelBreadCrumbTrail {
    return new HanselGretelBreadCrumbTrail(
      this.traceLog,
      [this.functionName, functionName].join('>'),
      ...args
    );
  }
}
