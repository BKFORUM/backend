const toError = (candidate) => {
  try {
    return new Error(JSON.stringify(candidate));
  } catch (_) {
    return new Error(String(candidate));
  }
};

export const getStack = (err) =>
  err && err.stack ? err.stack.split('\n').map((s) => s.trim()) : [];

export const isError = (maybeError) =>
  maybeError && maybeError.isError === true;

export const instanceOfError = (maybeError) => maybeError instanceof Error;

export const getError = (maybeError) =>
  isError(maybeError) || instanceOfError(maybeError)
    ? maybeError
    : toError(maybeError);

export type ErrorInterface = {
  errorId: string;
  message: string;
  error: string;
};
