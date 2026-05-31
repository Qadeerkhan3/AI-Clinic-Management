// role.middleware.js
// Alias for the authorize() function in auth.middleware.js.
// Import authorize from auth.middleware.js directly in routes.
export { authorize as checkRole } from './auth.middleware.js';
