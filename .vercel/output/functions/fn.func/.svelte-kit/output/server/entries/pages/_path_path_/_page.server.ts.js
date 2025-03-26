import { e as error } from "../../../chunks/index2.js";
import { S as SVELTE_WHEEL_API_KEY } from "../../../chunks/private.js";
import { g as getWheel } from "../../../chunks/Api.js";
const load = async ({ fetch, params }) => {
  const response = await getWheel(
    params.path,
    null,
    SVELTE_WHEEL_API_KEY,
    fetch
  );
  if (!response.success) {
    error(404, response.error.message);
  }
  return { wheel: response.data.wheel };
};
export {
  load
};
