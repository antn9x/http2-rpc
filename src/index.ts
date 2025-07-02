import { connect, createServer } from 'node:http2';
export function register<Config>(config: Config, port = 3030) {
  console.log('Registering server', config);
  const server = createServer((request, response) => {
    const { headers } = request
    // const method = headers[':method'];
    const path: any = headers[':path'];
    console.log('HTTP/2 request received', path);
    // response.setHeader(
    //   'content-type', 'binary'
    // );
    let data = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => { data += chunk; });
    request.on('end', async () => {
      const json = JSON.parse(data)
      // console.log(json)
      const res = await (config as any)[path](...json)
      response.write(JSON.stringify(res));
      response.end();
    });
  })
  server.listen(port)
  console.log('Server listening on port ', port);
}

export function createClient<Config>(connection: string) {
  const client = connect(connection);
  const obj = new Proxy({}, {
    get: (_, prop: string) => {
      return (...args: any) => {
        return new Promise((resolve, reject) => {
          const req = client.request({
            ':method': 'POST',
            ':path': prop
          })
          req.setEncoding('utf8');
          let data = '';
          req.on('data', (chunk) => { data += chunk; });
          req.on('end', () => {
            resolve(data);
          });
          console.log(`send`, args)
          req.write(JSON.stringify(args))
          req.end();
        });
      }
    }
  });
  return obj as Config
}
