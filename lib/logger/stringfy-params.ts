/**
 * Converts parameters to a string.
 * Sometimes parameters can have circular objects and therefor we are handle this case too.
 */
export function stringifyParams(parameters: any[]) {
  try {
    return JSON.stringify(parameters);
  } catch (error) {
    // most probably circular objects in parameters
    return parameters;
  }
}
