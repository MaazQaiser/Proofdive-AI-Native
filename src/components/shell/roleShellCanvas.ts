export function isRoleHubPath(pathname: string | null, hubPath: string) {
  return pathname === hubPath || pathname === `${hubPath}/`;
}

export const ROLE_SHELL_HEADER_SURFACE_CLASS =
  "relative z-20 border-b border-[#dfe7e9] bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60";

export const ROLE_SHELL_ROOT_CANVAS_CLASS = "app-canvas";

export const ROLE_HUB_MOTIF_CLASS = "app-canvas--motif-soft";
