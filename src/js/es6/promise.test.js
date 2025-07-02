import { MyPromise } from './promise';

describe('promise', () => {
  it('promise then', () => {
    const promise = MyPromise.resolve(42);
    promise.then((value) => {
      expect(value).toBe(42);
    });
  });

  it('promise catch', () => {
    const error = new Error('Test error');
    const promise = MyPromise.reject(error);
    promise.catch((reason) => {
      expect(reason).toBe(error);
    });
  });

  it('promise finally', () => {
    const promise = MyPromise.resolve(42);
    let finallyCalled = false;
    promise.finally(() => {
      finallyCalled = true;
    });
    promise.then((value) => {
      expect(value).toBe(42);
      expect(finallyCalled).toBe(true);
    });
  });

  it('promise resolve', () => {
    const promise = MyPromise.resolve(42);
    promise.then((value) => {
      expect(value).toBe(42);
    });
  });

  it('promise reject', () => {
    const error = new Error('Test error');
    const promise = MyPromise.reject(error);
    promise.catch((reason) => {
      expect(reason).toBe(error);
    });
  });

  it('promise all', () => {
    const promise1 = MyPromise.resolve(1);
    const promise2 = MyPromise.resolve(2);
    const promise3 = MyPromise.resolve(3);
    const promise4 = MyPromise.reject(new Error('error'));

    MyPromise.all([promise1, promise2, promise3]).then((values) => {
      expect(values).toEqual([1, 2, 3]);
    });
    MyPromise.all([promise1, promise2, promise4])
      .then(() => {
        throw new Error('This should not be called');
      })
      .catch((error) => {
        expect(error.message).toBe('error');
      });
  });

  it('promise race', () => {
    const promise1 = MyPromise.resolve(1);
    const promise2 = MyPromise.resolve(2);
    const promise3 = MyPromise.resolve(3);
    const promise4 = MyPromise.reject(new Error('error'));

    MyPromise.race([promise1, promise2, promise3]).then((value) => {
      expect(value).toBe(1);
    });
    MyPromise.race([promise4, promise2])
      .then(() => {
        throw new Error('This should not be called');
      })
      .catch((error) => {
        expect(error.message).toBe('error');
      });
  });

  it('promise any', () => {
    const promise1 = MyPromise.resolve(1);
    const promise2 = MyPromise.reject(new Error('error 2'));
    const promise3 = MyPromise.reject(new Error('error 3'));

    MyPromise.any([]).catch((error) => {
      expect(error.message).toBe('All promises were rejected. Errors: []');
    });

    MyPromise.any([promise2, promise3]).catch((error) => {
      expect(error.message).toBe(
        'All promises were rejected. Errors: [error 2, error 3]'
      );
    });

    MyPromise.any([promise1, promise2, promise3]).then((value) => {
      expect(value).toBe(1);
    });
  });
});
