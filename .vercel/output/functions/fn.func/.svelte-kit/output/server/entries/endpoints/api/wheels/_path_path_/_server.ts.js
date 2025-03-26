import { z } from "zod";
import { S as SVELTE_WHEEL_API_KEY } from "../../../../../chunks/private.js";
import { a as getWheel, u as updateWheel, d as deleteWheel } from "../../../../../chunks/FirebaseAdmin.js";
import { u as updateWheelSchema } from "../../../../../chunks/Schemas.js";
const GET = async ({ request, params }) => {
  const uid = request.headers.get("authorization");
  const apiKey = request.headers.get("x-api-key");
  if (!uid && !apiKey || apiKey && apiKey !== SVELTE_WHEEL_API_KEY) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: "Unauthorized" }
      }),
      { status: 401 }
    );
  }
  try {
    const wheel = await getWheel(params.path, uid);
    if (!wheel) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: `Wheel "${params.path}" not found` }
        }),
        { status: 404 }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        data: { wheel }
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: `Error fetching wheel "${params.path}"` }
      }),
      { status: 500 }
    );
  }
};
const PUT = async ({ request, params }) => {
  const uid = request.headers.get("authorization");
  const apiKey = request.headers.get("x-api-key");
  if (!uid && !apiKey || apiKey && apiKey !== SVELTE_WHEEL_API_KEY) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: "Unauthorized" }
      }),
      { status: 401 }
    );
  }
  try {
    const body = await request.json();
    const { wheel, uid: uid2, visibility } = updateWheelSchema.parse(body);
    const path = await updateWheel(params.path, wheel, uid2, visibility);
    if (!path) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: `Wheel "${params.path}" not found` }
        }),
        { status: 404 }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        data: { path }
      }),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: "Invalid wheel",
            errors: error.flatten().fieldErrors
          }
        }),
        { status: 400 }
      );
    }
    console.error(error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: `Error updating wheel "${params.path}"` }
      }),
      { status: 500 }
    );
  }
};
const DELETE = async ({ request, params }) => {
  const uid = request.headers.get("authorization");
  if (!uid) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: "Unauthorized" }
      }),
      { status: 401 }
    );
  }
  try {
    await deleteWheel(params.path, uid);
    return new Response(
      JSON.stringify({ success: true, data: null }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: `Error deleting wheel "${params.path}"` }
      }),
      { status: 500 }
    );
  }
};
export {
  DELETE,
  GET,
  PUT
};
