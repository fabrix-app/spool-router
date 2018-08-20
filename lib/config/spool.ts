/**
 * Spool Configuration
 *
 * This manifest declares the application resources which are provided and/or
 * modified by this spool.
 * @see {@link https://fabrix.app/docs/spool/config
 */
export const spool = {
  provides: {
    config: ['routes', 'router']
  }
}
