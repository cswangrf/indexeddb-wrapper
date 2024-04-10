import IndexedDBWrapper from "../IndexedDBWrapper";

describe("IndexedDBWrapper", () => {
  let indexedDBWrapper: IndexedDBWrapper;
  let dbName = "testDB";
  let tableName = "testStore";
  let foo = { key_path: "key1", value: "value2" };

  beforeAll(async () => {
    indexedDBWrapper = new IndexedDBWrapper(dbName, 1);
    await indexedDBWrapper.open(tableName, "key");
  });

  afterAll(async () => {
    await indexedDBWrapper.truncate(tableName);
  });

  it("should set and get item correctly", async () => {
    await indexedDBWrapper.set(tableName, foo);
    const result = await indexedDBWrapper.get(tableName, "key1");
    expect(result).toBe("value1");
  });
});
