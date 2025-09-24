from http.server import HTTPServer, SimpleHTTPRequestHandler
import argparse


class RequestHandler(SimpleHTTPRequestHandler):

    # mimic firebase hosting's rewrite rules
    def translate_path(self, path):
        if path.startswith('/simplified') or path.startswith('/traditional') or path.startswith('/cantonese') or path.startswith('/hsk'):
            return 'index.html'
        # prepend . such that the frontend's use of /whatever results in ./whatever
        # should maybe just strip the first character, tbh
        return f".{path}"


if __name__ == '__main__':
    # simplified version of answers to
    # https://stackoverflow.com/questions/18624251
    parser = argparse.ArgumentParser(
        description='Enable URL rewrites without relying on firebase hosting. Intended to be run from the public/ directory.')
    parser.add_argument(
        '--port', help='your choice of port; default 8000', nargs='?', default=8000, type=int)
    args = parser.parse_args()
    port = int(args.port)
    myServer = HTTPServer(('0.0.0.0', port), RequestHandler)
    print("HanziGraph started")
    try:
        myServer.serve_forever()
    except KeyboardInterrupt:
        pass

    myServer.server_close()
    print("exiting")
