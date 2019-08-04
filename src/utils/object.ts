export const isEmpty = (obj: unknown) => {
  if (typeof obj !== 'object' || obj === null) return true;

  if (Array.isArray(obj)) {
    return obj.length === 0;
  }

  for (let p in obj) {
    if (Object.hasOwnProperty.call(obj, p)) return true;
  }

  return false;
};

export const pick = <T extends object = object>(obj: T, keys: Array<keyof T>): object => { // todo: type me
  const newObj: Partial<T> = {};
  for (const key of keys) {
    if (key in obj) {
      newObj[key] = obj[key];
    }
  }

  return newObj;
}
