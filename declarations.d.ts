// Allow CSS file imports (used by NativeWind global.css)
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
