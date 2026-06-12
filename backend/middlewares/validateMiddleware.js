// ── Validation Middleware ─────────────────────────────────────────────────────
// Wraps Zod schemas into Express middleware.

export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.issues.map((e) => e.message);
        return res.status(400).json({ message: errors[0], errors });
    }
    // Replace req.body with parsed/sanitized data (strips unknown fields)
    req.body = result.data;
    next();
};
