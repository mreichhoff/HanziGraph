from http.server import HTTPServer, SimpleHTTPRequestHandler
import argparse

class MyHTTPServer(HTTPServer):
    def __init__(self, server_address, RequestHandlerClass,
                 base_path='',
                 bind_and_activate=True):
        HTTPServer.__init__(self, server_address, RequestHandlerClass, bind_and_activate=bind_and_activate)
        self.base_path = base_path


class RequestHandler(SimpleHTTPRequestHandler):
    # mimic firebase hosting's rewrite rules
    def translate_path(self, request_path):
        base_path = self.server.base_path if isinstance(self.server, MyHTTPServer) else ''
        slashed_path = request_path.removeprefix(base_path)
        crit_blank = slashed_path in ('/', '')
        crit_specials = any([slashed_path.startswith(f"{candidate}") for candidate in (
            '/simplified', '/traditional', '/cantonese', '/hsk'
        )])
        if crit_blank or crit_specials:
            return 'index.html'
        # now turn the slashed path /foo/bar into ./foo/bar on disk
        path = f".{slashed_path}"
        return path


if __name__ == '__main__':
    # simplified version of answers to
    # https://stackoverflow.com/questions/18624251
    parser = argparse.ArgumentParser(
        description='Enable URL rewrites without relying on firebase hosting. Intended to be run from the public/ directory.')
    parser.add_argument(
        '--port', help='your choice of port; default 8000', nargs='?', default=8000, type=int)
    parser.add_argument(
        '--base-path', help='custom base path, e.g. /app/hanzi; useful for reverse proxy', default='')
    args = parser.parse_args()
    port = int(args.port)
    base_path = args.base_path
    if base_path:
        assert base_path[0] == '/', '--base-path must start with /'
        if base_path[-1] == '/':
            base_path = base_path[:-1]
    myServer = MyHTTPServer(('0.0.0.0', port), RequestHandler, base_path=base_path)
    print("HanziGraph started")
    try:
        myServer.serve_forever()
    except KeyboardInterrupt:
        pass

    myServer.server_close()
    print("exiting")
