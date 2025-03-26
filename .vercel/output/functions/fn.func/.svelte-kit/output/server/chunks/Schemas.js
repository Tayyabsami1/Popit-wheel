import { z } from "zod";
import { w as wheelTypes, d as defaultColors, c as confettiTypes, b as hubSizeKeys, g as getNewEntryId } from "./Wheel.js";
import { w as wheelVisibilities } from "./Api.js";
const wheelConfigSchema = z.object({
  type: z.optional(z.enum(wheelTypes)).default("color"),
  title: z.string().min(1).max(50).trim(),
  description: z.optional(z.string().max(200).trim()).default(""),
  spinTime: z.optional(z.number().min(1).max(60)).default(10),
  indefiniteSpin: z.optional(z.boolean()).default(false),
  colors: z.optional(
    z.array(z.string().trim().length(7).startsWith("#"))
  ).default(defaultColors),
  confetti: z.optional(z.enum(confettiTypes)).default("off"),
  displayWinnerDialog: z.optional(z.boolean()).default(true),
  winnerMessage: z.optional(z.string().max(50).trim()).default(""),
  hubSize: z.optional(z.enum(hubSizeKeys)).default("S"),
  duringSpinSound: z.optional(z.string().max(100).trim()).default(""),
  duringSpinSoundVolume: z.optional(z.number().min(0).max(1)).default(0),
  afterSpinSound: z.optional(z.string().max(100).trim()).default(""),
  afterSpinSoundVolume: z.optional(z.number().min(0).max(1)).default(0),
  image: z.optional(z.string().trim()).default("")
});
const entrySchema = z.object({
  text: z.string(),
  id: z.optional(z.string().trim().length(8)).default(getNewEntryId())
});
const entriesSchema = z.array(entrySchema);
const uidValidator = z.string().trim().min(20).max(40);
const createWheelSchema = z.object({
  wheel: z.object({
    config: wheelConfigSchema,
    entries: entriesSchema
  }),
  visibility: z.enum(wheelVisibilities),
  uid: uidValidator
});
const updateWheelSchema = z.object({
  wheel: z.optional(
    z.object({
      config: z.optional(wheelConfigSchema),
      entries: z.optional(entriesSchema)
    })
  ).default({}),
  visibility: z.optional(z.enum(wheelVisibilities)),
  uid: uidValidator
});
const emailValidator = z.string().email();
z.object({
  email: emailValidator,
  password: z.string().min(8).trim()
});
export {
  createWheelSchema as c,
  updateWheelSchema as u
};
