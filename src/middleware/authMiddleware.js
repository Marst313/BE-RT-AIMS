const { ZodError, z } = require("zod");
const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(),
  }),
});

function validateMiddleware(schema) {
  return (req, res, next) => {
    try {
      schema.parse({
        params: req.params,
        body: req.body,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue) => ({
          message: `${issue.message}`,
        }));
        res.status(400).json({ error: "Invalid data", details: errorMessages });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  };
}

module.exports = { loginSchema, validateMiddleware };
