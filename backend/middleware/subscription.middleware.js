export const requirePro = (req, res, next) => {
  if (req.user.subscriptionPlan !== 'pro') {
    return res.status(403).json({
      message: 'This feature is available on the Pro plan. Please upgrade to access it.',
      upgrade: true,
    });
  }
  next();
};