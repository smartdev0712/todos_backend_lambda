export interface LambdaContext {
  functionName: string;
  done: (a?: any, b?: any) => void;
  fail: (e: Error) => void;
}
export type LambdaCallback = (a: any, b: any) => void;

export interface GetEvent {
  queryStringParameters: {
    region?: string;
    time?: number;
  };
}

export interface PatchEvent {
  queryStringParameters: {
    id: string;
  };
  body: string;
}

export interface DeleteEvent {
  queryStringParameters: {
    id: string;
  };
}

export interface PostEvent {
  body: string;
}
