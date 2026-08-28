export function isAdminRequest(request: Request): boolean {
  const configuredToken = process.env.ADMIN_TOKEN
  return Boolean(configuredToken && request.headers.get("x-admin-token") === configuredToken)
}