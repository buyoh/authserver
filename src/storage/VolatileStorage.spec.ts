import { VolatileStorage } from './VolatileStorage';

//
// testcases
//

describe('VolatileStorage', () => {
  it('insert and get, get missing, insert duplicate, update and get, update missing', async () => {
    const storage = new VolatileStorage('dbname');

    await storage.initialize();

    //
    const res0 = await storage.insert('key', { test: 'data1', test2: 'data2' });
    expect(res0.ok).toBeTruthy();

    //
    const res1 = await storage.get('key');
    expect(res1.ok).toBeTruthy();
    if (!res1.ok) return;
    expect(res1.data).toMatchObject({ test: 'data1', test2: 'data2' });

    //
    const res2 = await storage.get('keykeykey');
    expect(res2.ok).toBeFalsy();
    if (res2.ok === false) {
      expect(res2.result).not.toBe('error');
      expect(res2.result).not.toBe('invalid');
    }

    //
    const res3 = await storage.insert('key', {});
    expect(res3.ok).toBeFalsy();

    //
    const res4 = await storage.update('key', { xxx: 'yyy' });
    expect(res4.ok).toBeTruthy();

    //
    const res5 = await storage.get('key');
    expect(res5.ok).toBeTruthy();
    if (!res5.ok) return;
    expect(res5.data).toMatchObject({ xxx: 'yyy' });

    //
    const res6 = await storage.update('keykeykey', {});
    expect(res6.ok).toBeFalsy();
  });

  it('multiple', async () => {
    const storage = new VolatileStorage('dbname');
    await storage.initialize();

    const keys = [] as number[];

    for (let i = 0; i < 4; ++i) {
      const limit = 2;

      const res0 = await storage.all(limit);
      expect(res0.ok).toBeTruthy();
      if (res0.ok === false) return;
      expect(res0.data.length).toBe(Math.min(i, limit));
      for (let j = 0; j < res0.data.length; ++j) {
        expect(res0.data).toContainEqual({ key: 'v' + j, data: { v: j } });
      }

      const res1 = await storage.insert('v' + i, { v: i });
      keys.push(i);
    }

    for (let i = 1; i < 4; ++i) {
      const limit = 2;

      const res0 = await storage.all(limit, i);
      expect(res0.ok).toBeTruthy();
      if (res0.ok === false) return;
      expect(res0.data.length).toBe(Math.min(4 - i, limit));
      for (let j = 0; j < res0.data.length; ++j) {
        expect(res0.data).toContainEqual({
          key: 'v' + (j + i),
          data: { v: i + j },
        });
      }
    }

    for (let i = 0; i < 4; ++i) {
      const res0 = await storage.all();
      expect(res0.ok).toBeTruthy();
      if (res0.ok === false) return;
      expect(res0.data.length).toBe(4 - i);
      for (let j = 0; j < 4; ++j) {
        if (keys.includes(j))
          expect(res0.data).toContainEqual({ key: 'v' + j, data: { v: j } });
        else
          expect(res0.data).not.toContainEqual({
            key: 'v' + j,
            data: { v: j },
          });
      }

      const k = (i + 2) % 4;
      const res1 = await storage.erase('v' + k);
      expect(res1.ok).toBeTruthy();
      keys.splice(
        keys.findIndex((x) => x === k),
        1
      );
    }
  });

  it('missing initialize', async () => {
    const storage = new VolatileStorage('dbname');

    const res0 = await storage.insert('key', { test: 'data1', test2: 'data2' });
    expect(res0.ok).toBeFalsy();
    expect(res0.ok).toBe('error');
  });
});
