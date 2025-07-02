import { connect, createServer } from 'node:http2';
export function register<Config>(config: Config, port = 3030) {
  console.log('Registering server', config);
  const server = createServer((request, response) => {
    const { headers } = request
    // const method = headers[':method'];
    const path: any = headers[':path'];
    // console.log('HTTP/2 request received', path);
    let data = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => { data += chunk; });
    request.on('end', async () => {
      const json = JSON.parse(data)
      // console.log(json)
      const res = await (config as any)[path](...json)
      // console.log('HTTP/2 response', res, typeof res === 'string' ? 'text/plain; charset=utf-8' : 'application/json');
      response.setHeader(
        'Content-Type',
        typeof res === 'string' ? 'text/plain; charset=utf-8' : 'application/json'
      );
      response.write(JSON.stringify(res))
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
          let isJSON = true;
          req.on('data', (chunk) => { data += chunk; });
          req.on('error', (err) => {
            console.error('HTTP/2 request error', err);
            reject(err);
          });
          req.on('response', (headers, flags) => {
            // console.log('HTTP/2 headers received', headers, flags);
            if (headers['content-type'] && headers['content-type'].includes('application/json')) {
              isJSON = true;
            } else {
              isJSON = false;
            }
          });
          req.on('end', () => {
            // console.log('HTTP/2 response received', data, req.sentHeaders, req.endAfterHeaders);
            if (isJSON) {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(new Error('Invalid JSON response'));
              }
            } else {
              resolve(data);
            }
          });
          // console.log('send', args);
          req.write(JSON.stringify(args))
          req.end();
        });
      }
    }
  });
  return obj as Config
}
