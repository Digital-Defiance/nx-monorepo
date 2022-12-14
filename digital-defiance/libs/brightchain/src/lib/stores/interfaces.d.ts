export interface ISimpleStore<K, V> {
  /**
   * Whether the store has the given key, without respect to its type
   * @param key
   * @returns
   */
  public has(key: K): boolean;
  /**
   * Gets the value from the store the key is present or throws an error
   * @param key
   */
  public get(key: K): V;
  /**
   * Adds the key and value to the store
   * @param key
   * @param value
   */
  public set(key: K, value: V): void;
  /**
   * Load the store from a file
   */
  load(): void;
  /**
   * Persist the store to a file
   */
  save(): void;
}

export interface IJsonStore<K> {
  /**
   * Whether the store has the given key, without respect to its type
   * @param key
   * @returns
   */
  public has(key: K): boolean;
  /**
   * Gets the value from the store the key is present or throws an error
   * @param key
   */
  public get<V>(key: K): V;
  /**
   * Adds the key and value to the store
   * @param key
   * @param value
   */
  public set<V>(key: K, value: V): void;
  /**
   * Load the store from a file
   */
  load(): void;
  /**
   * Persist the store to a file
   */
  save(): void;
}
