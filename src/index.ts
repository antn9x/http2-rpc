import { connect, createServer } from "node:http2";
export function register<Config>(config: Config) {
  console.log("Registering server", config);
  const server = createServer((request, response) => {
    const { headers } = request
    // const method = headers[':method'];
    const path: any = headers[':path'];
    console.log("HTTP/2 request received", path);
    // ...
    // response.setHeader(
    //   'content-type', 'binary'
    // );
    let data = '';
    request.setEncoding("utf8");
    request.on('data', (chunk) => { data += chunk; });
    request.on('end', async () => {
      // console.log(`\n${data}`);
      // client.close();
      const json = JSON.parse(data)
      console.log(json)
      // console.log(config[path])
      const res = await (config as any)[path](...json)
      response.write(res);
      response.end();
    });
  })
  server.listen(3000)
  console.log("Server listening on port 3000");
}

export function createClient<Config>(connection: string) {
  const client = connect(connection);
  const obj = new Proxy({}, {
    get: (_, prop: string) => {
      return (...args: any) => {
        const req = client.request({
          ":method": "POST",
          ":path": prop
        })
        req.setEncoding('utf8');
        let data = '';
        req.on('data', (chunk) => { data += chunk; });
        req.on('end', () => {
          console.log(`\n${data}`);
          // client.close();
        });
        console.log(`send`, args)
        req.write(JSON.stringify(args))
        req.end();
      }
    }
  });
  return obj as Config
}
