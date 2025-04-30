export type FieldSelector = {
  [key: string | number]: boolean | FieldSelector;
};

function flattenFieldSelectorString(
  fieldSelector: FieldSelector,
  prefix: string = ""
): string[] {
  return Object.entries(fieldSelector).flatMap(([k, v]) => {
    if (v === true) {
      return [`${prefix}:${k}`];
    } else if (typeof v === "object" && v !== null) {
      return flattenFieldSelectorString(v, `${prefix}:${k}`);
    } else {
      return [];
    }
  });
}

export function fieldsString(fields: FieldSelector | null | undefined) {
  if (!fields) {
    return {};
  }

  return {
    fields: Object.entries(fields ?? {})
      .flatMap(([k, v]) => {
        if (v === true) {
          return [k];
        } else if (typeof v === "object" && v !== null && v !== undefined) {
          return flattenFieldSelectorString(v, k);
        } else {
          return [];
        }
      })
      .join(","),
  };
}

// This was possible to write in a recursive flatter way like:
// export type HasChildBool<T> = T extends true
//   ? true
//   : T extends object
//   ? T extends never
//     ? false
//     : true extends { [K in keyof T]: HasChildBool<T[K]> }[keyof T]
//     ? true
//     : false
//   : false;
// However that resulted in "type instantiation is excessively deep possibly infinite" errors.
// Since we know the context we're using this in and it goes at most 3 deep this is fine.
export type HasChildBool<T> = T extends true
  ? true
  : T extends object
  ? keyof T extends never
    ? false
    : T[keyof T] extends true
    ? true
    : T[keyof T] extends object
    ? T[keyof T][keyof T[keyof T]] extends true
      ? true
      : T[keyof T][keyof T[keyof T]] extends object
      ? T[keyof T][keyof T[keyof T]][keyof T[keyof T][keyof T[keyof T]]] extends true
        ? true
        : false
      : false
    : false
  : false;
