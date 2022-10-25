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
    traceLog.push(this.IBreadCrumbTrace);
  }
  public get IBreadCrumbTrace(): IBreadCrumbTrace {
    return {
      date: this.date,
      functionName: this.functionName,
      functionArgs: this.functionArgs,
    } as IBreadCrumbTrace;
  }
  public static addCrumb(
    traceLog: Array<IBreadCrumbTrace>,
    functionName: string,
    ...args: Array<any>
  ): HanselGretelBreadCrumbTrail {
    return new HanselGretelBreadCrumbTrail(traceLog, functionName, ...args);
  }
  public addCrumb(...args: Array<any>): HanselGretelBreadCrumbTrail {
    return new HanselGretelBreadCrumbTrail(
      this.traceLog,
      this.functionName,
      ...args
    );
  }
  public forkAndAddCrumb(
    functionName: string,
    ...args: Array<any>
  ): HanselGretelBreadCrumbTrail {
    return new HanselGretelBreadCrumbTrail(
      this.traceLog,
      [this.functionName, functionName].join('>'),
      ...args
    );
  }
  public static IBreadCrumbTrace(trace: IBreadCrumbTrace): IBreadCrumbTrace {
    return trace;
  }
}
