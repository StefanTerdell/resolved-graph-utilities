export const mutateDeepLeft = (left, right) =>
  Object.keys(right).forEach((key) =>
    typeof right[key] === "object"
      ? mutateDeepLeft(
          (typeof left[key] === "object" ||
            (left[key] = Array.isArray(right[key]) ? [] : {})) &&
            left[key],
          right[key]
        )
      : (left[key] = right[key])
  );
