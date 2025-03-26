import { z } from "zod";
import { S as SVELTE_WHEEL_API_KEY } from "../../../../chunks/private.js";
import { g as getUserWheelsMeta, s as saveWheel } from "../../../../chunks/FirebaseAdmin.js";
import { c as createWheelSchema } from "../../../../chunks/Schemas.js";
const GET = async ({ request }) => {
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
    const wheels = await getUserWheelsMeta(uid);
    return new Response(
      JSON.stringify({
        success: true,
        data: { wheels }
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: "Error getting wheels" }
      }),
      { status: 500 }
    );
  }
};
const POST = async ({ request }) => {
  const apiKey = request.headers.get("x-api-key");
  const uid = request.headers.get("authorization");
  if (!uid && !apiKey || apiKey && apiKey !== SVELTE_WHEEL_API_KEY) {
    console.log("Unauthorized request");
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
    console.log("Received body:", body);
    const data = createWheelSchema.parse(body);
    console.log("Parsed data:", data);
    const path = await saveWheel(data.wheel, data.uid, data.visibility);
    console.log("Saved wheel path:", path);
    if (!path) {
      throw new Error("Error saving wheel");
    }
    return new Response(
      JSON.stringify({
        success: true,
        data: { path }
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/wheels:", error);
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
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: "Error saving wheel" }
      }),
      { status: 500 }
    );
  }
};
export {
  GET,
  POST
};
