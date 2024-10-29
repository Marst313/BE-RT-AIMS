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

function validatePermission(token) {
  const permission = token.permission;
  let access = false;

  for (let i = 0; i < permission.length; i++) {
    const p = permission[i];
    if (p.create == 1 || p.read == 1 || p.edit == 1 || p.delete == 1) {
      access = true;
      break;
    }
  }
  if (!access) {
    return "Access denied: No modules available for this user";
  }
  return "Access granted";
}

module.exports = { loginSchema, validateMiddleware, validatePermission };
