declare module 'web-worker:*' {
  declare var WebWorker: {
    prototype: Worker;
    new (): Worker;
  };

  export default WebWorker;
}

declare module 'rollup-plugin-web-worker-loader-helper' {
  export declare function createBase64WorkerFactory(base64: string, sourceMap: string | null): string;
}
