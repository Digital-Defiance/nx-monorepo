import SimpleStore from './simpleStore';

describe('simpleStore', () => {
  it('should be able to store and retrieve a value', () => {
    const store = new SimpleStore<string, string>();
    const key = 'key';
    const value = 'value';
    store.set(key, value);
    expect(store.get(key)).toEqual(value);
  });
  it('should report whether a key exists', () => {
    const store = new SimpleStore<string, string>();
    const key = 'key';
    const value = 'value';
    store.set(key, value);
    expect(store.has(key)).toBeTruthy();
    expect(store.has('nonexistent')).toBeFalsy();
  });
  it('should throw an error when getting a nonexistent key', () => {
    const store = new SimpleStore<string, string>();
    const key = 'key';
    expect(() => store.get(key)).toThrowError(`Key not found: ${key}`);
  });
});