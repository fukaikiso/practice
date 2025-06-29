import { MyPromise } from './promise.mjs';

const pro1 = new MyPromise((resolve, reject) => {
  reject('pro');
});
const pro2 = pro1.finally(() => {
  console.log('finally');
});
const pro3 = pro1.then(
  () =>
    new Promise((resolve) => {
      setTimeout(() => resolve('pro3'));
    })
);
const pro4 = MyPromise.allSettled([MyPromise.reject(1), 2, 3]);
const pro5 = MyPromise.all([pro1, 2, 3]);
const pro6 = Promise.race([]);

setTimeout(() => {
  console.log(pro1);
  console.log(pro2);
  console.log(pro3);
  console.log(pro4);
  console.log(pro5);
  console.log(pro6);
}, 1000);
