/**
 * promise A+ 规范对是否promise的定义
 * 1.有值
 * 2.是一个对象
 * 3.有then方法
 * @param {*} obj
 * @returns {Boolean} 是否为promise
 */
function isPromise(obj) {
  return !!(obj && typeof obj === 'object' && typeof obj.then === 'function');
}

// promise的状态常量
const PROMISE_STATUS = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
};

export class MyPromise {
  constructor(executor) {
    this._status = PROMISE_STATUS.PENDING;
    this._value = undefined;
    this._handlers = [];
    try {
      executor(this._resolve.bind(this), this._reject.bind(this));
    } catch (error) {
      this._reject(error);
      console.log(error);
    }
  }

  /**
   * 更新promise的状态和值，并执行任务队列中的任务
   * @param {String} status
   * @param {any} value
   * @returns
   */
  _setStatusAndValue(status, value) {
    if (this._status !== PROMISE_STATUS.PENDING) {
      return;
    }
    this._status = status;
    this._value = value;
    this._executeHandlers();
  }

  /**
   * 设置成功状态和对应的值
   * @param {any} data
   */
  _resolve(data) {
    this._setStatusAndValue(PROMISE_STATUS.FULFILLED, data);
  }

  /**
   * 设置失败的状态和失败原因
   * @param {any} error
   */
  _reject(error) {
    this._setStatusAndValue(PROMISE_STATUS.REJECTED, error);
  }

  /**
   * 将单个任务推入微队列
   * @param {*} handler
   * @returns
   */
  _executeSingleHandler(handler) {
    const { status, executor, resolve, reject } = handler;
    if (status !== this._status) {
      return;
    }
    queueMicrotask(() => {
      // 若传入的不是函数，则状态和值跟调用then的promise保持一致

      if (typeof executor !== 'function') {
        if (this._status === PROMISE_STATUS.FULFILLED) {
          resolve(this._value);
        } else {
          reject(this._value);
        }
        return;
      }

      try {
        // 若传入的函数执行没有报错，则状态改为成功，值即为函数返回值
        const result = executor(this._value);

        // 若返回结果是新的promise，则调用起then函数，其状态和值与返回的promise保持一致
        if (isPromise(result)) {
          result.then(resolve, reject);
          return;
        }
        resolve(result);
      } catch (error) {
        // 若执行出错，则状态为失败，值为错误原因
        reject(error);
        console.log(error);
      }
    });
  }

  /**
   * 执行任务列队中的所有任务
   */
  _executeHandlers() {
    if (this._status === PROMISE_STATUS.PENDING) {
      return;
    }
    while (this._handlers[0]) {
      this._executeSingleHandler(this._handlers[0]);
      this._handlers.shift();
    }
  }

  /**
   * 将任务加入队列
   * @param {String} status
   * @param {any} executor
   * @param {Function} resolve
   * @param {Function} reject
   */
  _addHandler(status, executor, resolve, reject) {
    this._handlers.push({
      status,
      executor,
      resolve,
      reject,
    });
  }

  /**
   * 1.将成功和失败的回调函数放入任务队列
   * 2.执行一下任务队列
   * @param {Function} onFulfilled
   * @param {Function} onRejected
   * @returns
   */
  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      this._addHandler(PROMISE_STATUS.FULFILLED, onFulfilled, resolve, reject);
      this._addHandler(PROMISE_STATUS.REJECTED, onRejected, resolve, reject);
      this._executeHandlers();
    });
  }

  /**
   * 仅处理失败的场景
   * @param {Function} onRejected
   */
  catch(onRejected) {
    return this.then(null, onRejected);
  }

  /**
   * 成功失败都执行
   * @param {Function} onSettled
   */
  finally(onSettled) {
    return this.then(
      // 执行没有报错，状态和值与调用该finally的promise保持一致
      (data) => {
        onSettled();
        return data;
      },
      // 执行若报错，状态为失败，值为失败原因
      (error) => {
        onSettled();
        throw error;
      }
    );
  }

  /**
   * 返回一个fulfilled状态的的promise
   * @param {any} data
   * @returns
   */
  static resolve(data) {
    // 如果是MyPromise，直接返回data
    if (data instanceof MyPromise) {
      return data;
    }

    return new MyPromise((resolve, reject) => {
      if (isPromise(data)) {
        // 如果是其他promiseLike对象，则返回新promise，状态保持一致
        data.then(resolve, reject);
      } else {
        // 其他情况直接返回一个fulfilled状态的promise
        resolve(data);
      }
    });
  }

  /**
   * 返回一个rejected状态的promise
   * @param {any} error
   * @returns
   */
  static reject(error) {
    return new MyPromise((_, reject) => {
      reject(error);
    });
  }

  /**
   * 返回一个promise
   * promises是一个迭代器，包含多个promise
   * 全部promise成功，则返回的promise状态为成功，数据为传入promise成功的数据，且顺序与传入的顺序一致
   * 若有一个promise失败，则返回promise的状态为失败，原因为第一个失败的原因
   * @param {Iterator} promises
   * @returns {MyPromise[]}
   */
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      try {
        const results = [];
        let count = 0;
        let fulfilledCount = 0;

        for (const promise of promises) {
          const index = count;
          count++;

          MyPromise.resolve(promise).then((data) => {
            results[index] = data;
            fulfilledCount++;

            // 若成功执行完每一个promise，则状态改为成功
            if (fulfilledCount === count) {
              resolve(results);
            }
          }, reject);
        }

        // 处理空迭代器情况
        if (count === 0) {
          resolve(results);
        }
      } catch (error) {
        // 执行过程中报错，状态改为失败
        reject(error);
        console.log(error);
      }
    });
  }

  /**
   * 返回一个promise
   * promises是一个迭代器，包含多个promise
   * 返回的状态一定为成功，按照顺序将所有promise的结果返回
   * @param {Iterator} promises
   * @returns {MyPromise[]}
   */
  static allSettled(promises) {
    const promiseList = [];
    for (const promise of promises) {
      promiseList.push(
        // then中两个回调只要不报错，则promise.then返回的promise一定为成功
        // 使用promise.then确保promiseList中的promise执行后状态一定为fulfilled
        MyPromise.resolve(promise).then(
          (value) => ({ _status: PROMISE_STATUS.FULFILLED, _value: value }),
          (error) => ({ _status: PROMISE_STATUS.REJECTED, _value: error })
        )
      );
    }
    return MyPromise.all(promiseList);
  }

  /**
   * 返回一个promise
   * promises是一个迭代器，包含多个promise
   * 返回的状态和值与最先完成的promise保持一致
   * 若传空数组，则一致Pending
   * @param {Iterator} promises
   * @returns {MyPromise[]}
   */
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      for (const promise of promises) {
        MyPromise.resolve(promise).then(resolve, reject);
      }
    });
  }
}
