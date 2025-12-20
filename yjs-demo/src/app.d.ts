// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    interface Platform {
      env?: {
        YJS_ROOM: DurableObjectNamespace;
      };
    }
  }
}

export {};
