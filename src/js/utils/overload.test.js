import { createOverloadFn } from './overload.js';

describe('createOverloadFn', () => {
  it('should throw an error if no implementation is provided for the given argument types', () => {
    const overloadFn = createOverloadFn();
    expect(() => overloadFn(1)).toThrow('未实现该类型参数的方法！');
  });

  it('should call the correct implementation based on argument types', () => {
    const overloadFn = createOverloadFn();
    overloadFn.addImpl('number', (x) => x * 2);
    overloadFn.addImpl('string', (x) => x.toUpperCase());

    expect(overloadFn(2)).toBe(4);
    expect(overloadFn('hello')).toBe('HELLO');
  });

  it('should throw an error if the last argument is not a function', () => {
    const overloadFn = createOverloadFn();
    expect(() => overloadFn.addImpl('number', 'not a function')).toThrow(
      '最后一个参数必须为函数！'
    );
  });
});
