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
    expect(firstCrumb.IBreadCrumbTrace).toEqual(
      HanselGretelBreadCrumbTrail.IBreadCrumbTrace({
        date: firstCrumb.date,
        functionName: 'HanselGretelBreadCrumbTrail.spec.ts',
        functionArgs: [],
      })
    );
    const secondCrumb = firstCrumb.addCrumb('trace 1');
    expect(secondCrumb.IBreadCrumbTrace).toEqual(
      HanselGretelBreadCrumbTrail.IBreadCrumbTrace({
        date: secondCrumb.date,
        functionName: 'HanselGretelBreadCrumbTrail.spec.ts',
        functionArgs: ['trace 1'],
      })
    );
    expect(secondCrumb.date.getUTCMilliseconds()).toBeGreaterThanOrEqual(
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
    expect(firstCrumb.IBreadCrumbTrace).toEqual(
      HanselGretelBreadCrumbTrail.IBreadCrumbTrace({
        date: firstCrumb.date,
        functionName: 'HanselGretelBreadCrumbTrail.spec.ts',
        functionArgs: [],
      })
    );
    const forkedCrumb = firstCrumb.forkAndAddCrumb('trace 1', 'trace 2');
    expect(forkedCrumb.IBreadCrumbTrace).toEqual(
      HanselGretelBreadCrumbTrail.IBreadCrumbTrace({
        date: forkedCrumb.date,
        functionName: 'HanselGretelBreadCrumbTrail.spec.ts>trace 1',
        functionArgs: ['trace 2'],
      })
    );
    expect(forkedCrumb.date.getUTCMilliseconds()).toBeGreaterThanOrEqual(
      firstCrumb.date.getUTCMilliseconds()
    );
  });
});
