export const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        console.error(`Error in async handler: ${error.message}`);
        res.status(error.status || 500).json({
            success: false,
            message: error.message,
        });
    }
};
