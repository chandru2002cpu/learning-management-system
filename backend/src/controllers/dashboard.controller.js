export function getRoleDashboard(req, res) {
  const role = req.user.role

  return res.status(200).json({
    success: true,
    message: `${role[0].toUpperCase()}${role.slice(1)} dashboard`,
    data: {
      role,
      user: req.user.toJSON(),
    },
  })
}
