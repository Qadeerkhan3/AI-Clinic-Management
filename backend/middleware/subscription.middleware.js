export const requirePro = (req, res, next) => {
  if (req.user.subscriptionPlan !== 'pro') {
    return res.status(403).json({
      message: 'Yeh feature sirf Pro plan mein hai. Upgrade karein.',
      upgrade: true,
    });
  }
  next();
};