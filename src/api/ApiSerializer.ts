// WIP
// AppExpress - WebApi の接合に当たるもの
// HTTPリクエストのvalidationに使う。

interface ApiSerializer<Request, Response> {
  serializeRequest(request: Request): object;
  deserializeRequest(requestRaw: object): Request | null;
  serializeResponse(response: Response): object;
  deserializeResponse(responseRaw: object): Response | null;
}
