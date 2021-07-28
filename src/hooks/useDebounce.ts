import { debounce } from "lodash-es";

export function useDebounce<T extends (...args: any) => any>(
  fn: T,
  wait: number = 100
) {
  return debounce(fn, wait);
}
