/**
 * Single source of truth for the in-game operating system branding.
 * Change OS branding details here to propagate throughout the virtual workstation.
 */
export const OS_NAME = 'Heron OS';
export const OS_VERSION = '4.5';
export const OS_EDITION = 'Enterprise';
export const OS_CODENAME = 'Lagos Security Staging';

export const HOSTNAMES = {
  office: 'heron-ws04',
  home: 'heron-rig',
} as const;

export const KERNEL_STRING = '6.8.0-heron x86_64';

export const OS_BRANDING = {
  name: OS_NAME,
  version: OS_VERSION,
  edition: OS_EDITION,
  kernel: KERNEL_STRING,
  hostnames: HOSTNAMES,
  welcomeTag: 'Heron Security Arsenal // M11',
  bannerHeader: `${OS_NAME.toUpperCase()} // ${OS_EDITION.toUpperCase()} [v${OS_VERSION}-sandboxed]`,
  fullVersionString: `${OS_NAME} ${OS_VERSION} (${KERNEL_STRING})`,
} as const;
