import { MyPromise } from './promise.mjs';

const pro = new MyPromise((resolve, reject) => {
  resolve('pro');
});

const pro2 = pro.finally(() => {
  console.log('pro2');
  return 'pro2';
});

const pro3 = pro.then((res) => {
  console.log(res);
  return 'pro3';
});

setTimeout(() => {
  console.log(pro);
  console.log(pro2);
  console.log(pro3);
}, 1000);
