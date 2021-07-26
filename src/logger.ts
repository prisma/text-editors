export function logger(namespace: string, color: string = "orange") {
  return function (...args: any[]) {
    console.log(`%c[${namespace}]`, `color:${color};`, ...args);
  };
}
