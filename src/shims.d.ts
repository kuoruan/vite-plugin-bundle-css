/// <reference types="vite/client" />

declare module "*.json" {
  const value: Record<string, object>;
  export default value;
}
