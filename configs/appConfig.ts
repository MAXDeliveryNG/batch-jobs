export default {
  ENV: process?.env?.NODE_ENV,
  PORT: process?.env?.PORT,
  "db": {
    host: process?.env?.DB_HOST || 'stagingdb.max.ng',
    database: process?.env?.DB_DATABASE || 'v2staging',
    user: process?.env?.DB_USER || 'max',
    password: process?.env?.DB_PASSWORD || 'Z2EDTCx5#YnD',
    port: process?.env?.DB_PORT || 5432,
  },
  authToken: process.env.AUTH_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZTFlOTBjYTUtZjk4OC00MTYyLTg2NzktZWQxNTNjZDIxOGFkIiwiZmlyc3RfbmFtZSI6IkFuaXRhIiwibGFzdF9uYW1lIjoiT2doZW5ha2hvZ2llIiwiZW1haWwiOiJhbml0YS5vZ2hlbmFraG9naWVAbWF4Lm5nIiwicm9sZSI6ImFkbWluIiwiYXBwX3JvbGVzIjp7ImNoYW1waW9uLXNlcnZpY2UiOiJvbmJvYXJkaW5nIiwibG9hbi1hc3NldC1tYW5hZ2VtZW50IjoiYWRtaW4ifX0sImlhdCI6MTY2MTg1Mzc4NiwiZXhwIjoxNjc3NjY0OTg2LCJhdWQiOiJlMWU5MGNhNS1mOTg4LTQxNjItODY3OS1lZDE1M2NkMjE4YWQiLCJpc3MiOiIvYXV0aC9sb2dpbiJ9.QLiYNv0yDBEDbozzsb08SAzTB9-70ee596hVNvY2g38",
  apiURL: process.env.API_URL || "https://api.staging.max.ng/collection/v1",
  NOTIFICATION_PUSH_URL: process?.env?.NOTIFICATION_PUSH_URL
}


