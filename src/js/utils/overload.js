/**
 * @description 函数重载
 */

export function createOverloadFn() {
  // 记录不同参数对应的函数
  const fnMap = new Map();

  function overload(...args) {
    // 此处简单地使用typeof判断参数类型，可以按实际需要优化key的取值
    const key = args.map((item) => typeof item).join('_');
    const fn = fnMap.get(key);

    if (!fn) {
      throw '未实现该类型参数的方法！';
    }
    return fn.apply(this, args);
  }

  overload.addImpl = (...args) => {
    // 前n-1项为参数类型，最后一项为对应的函数
    const fn = args.pop();
    const key = args.join('_');

    if (typeof fn !== 'function') {
      throw '最后一个参数必须为函数！';
    }
    fnMap.set(key, fn);
  };

  return overload;
}
