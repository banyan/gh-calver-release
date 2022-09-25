declare module 'calver' {
  export function inc(format: string, version: string, levels: string): string;
  export function isValid(format: string, version: string): boolean;
}
