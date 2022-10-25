import {
  HanselGretelBreadCrumbTrail,
  IBreadCrumbTrace,
} from './HanselGretelBreadCrumbTrail';
describe('HanselGretelBreadCrumbTrail', () => {
  it('should trace', () => {
    const traceLog: Array<IBreadCrumbTrace> = [];
    const firstCrumb = HanselGretelBreadCrumbTrail.addCrumb(
      traceLog,
      'HanselGretelBreadCrumbTrail.spec.ts'
    );
    expect(firstCrumb.date).toBeDefined();
    expect(firstCrumb.IBreadCrumbTrace).toBe(
      HanselGretelBreadCrumbTrail.IBreadCrumbTrace({
        date: firstCrumb.date,
        functionName: 'HanselGretelBreadCrumbTrail.spec.ts',
        functionArgs: [],
      })
    );
    const result = firstCrumb.addCrumb('trace 1');
    expect(result.IBreadCrumbTrace).toBe(
      HanselGretelBreadCrumbTrail.IBreadCrumbTrace({
        date: firstCrumb.date,
        functionName: 'HanselGretelBreadCrumbTrail.spec.ts',
        functionArgs: ['trace 1'],
      })
    );
    expect(result.date.getUTCMilliseconds()).toBeGreaterThanOrEqual(
      firstCrumb.date.getUTCMilliseconds()
    );
  });
  it('should trace deeper', () => {
    const traceLog: Array<IBreadCrumbTrace> = [];
    const firstCrumb = HanselGretelBreadCrumbTrail.addCrumb(
      traceLog,
      'HanselGretelBreadCrumbTrail.spec.ts'
    );
    expect(firstCrumb.date).toBeDefined();
    expect(firstCrumb.IBreadCrumbTrace).toBe(
      HanselGretelBreadCrumbTrail.IBreadCrumbTrace({
        date: firstCrumb.date,
        functionName: 'HanselGretelBreadCrumbTrail.spec.ts',
        functionArgs: [],
      })
    );
    const deeperCrumb = firstCrumb.forkAndAddCrumb('trace 1', 'trace 2');
    expect(deeperCrumb.IBreadCrumbTrace).toBe(
      HanselGretelBreadCrumbTrail.IBreadCrumbTrace({
        date: deeperCrumb.date,
        functionName: 'HanselGretelBreadCrumbTrail.spec.ts>trace 1',
        functionArgs: ['trace 2'],
      })
    );
    expect(deeperCrumb.date.getUTCMilliseconds()).toBeGreaterThanOrEqual(
      firstCrumb.date.getUTCMilliseconds()
    );
  });
});
