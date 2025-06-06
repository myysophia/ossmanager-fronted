import debug from 'debug';

const baseNamespace = 'ossmanager';

export const createLogger = (namespace: string) => debug(`${baseNamespace}:${namespace}`);

// Enable namespaces from environment variables
const envNs = typeof window === 'undefined' ? process.env.DEBUG : process.env.NEXT_PUBLIC_DEBUG;
if (envNs) {
  debug.enable(envNs);
}

export default createLogger('app');
