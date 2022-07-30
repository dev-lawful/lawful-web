/**
 *
 * @param arr Array<T> being T the type of a single element of @arr
 * @param callback (params: T) => Promise<U> being T a single element of @arr
 * @returns Array<T>
 */
export const asyncFilter = async function filter<T>(
  arr: Array<T>,
  callback: (params: T) => Promise<boolean>
) {
  const fail = Symbol();
  return (
    await Promise.all(
      arr.map(async (item) => ((await callback(item)) ? item : fail))
    )
  ).filter((i) => i !== fail) as Array<T>;
};
