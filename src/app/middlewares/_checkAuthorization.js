export default async (req, res, next) => {
  const {
    headers: { appauthorization },
  } = req;

  if (!appauthorization || appauthorization !== process.env.APP_KEY) {
    return res
      .status(401)
      .json({ error: 401, data: { message: 'Unauthorized' } });
  }

  return next();
};
