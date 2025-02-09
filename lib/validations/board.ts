import * as z from "zod"

export const boardSchema = z.object({
    boardName: z
      .string()
      .min(1, "Board name must be at least 1 character.")
      .max(16, "Board name cannot exceed 16 characters."),
})