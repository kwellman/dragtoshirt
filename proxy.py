import logging, time, urllib, hashlib, urllib2, re
from flask import make_response, request
from main import app

@app.route('/spreadshirt/proxy/', methods=['GET', 'POST', 'PUT'])
@app.route('/proxy.php', methods=['GET', 'POST', 'PUT']) # for compatibility
def spreadshirt_proxy():
    url = request.args['url']

    try:
        if request.method == 'GET':
            if request.args.get('secure'):
                url = secure_url(request.method, url)
            response = urllib2.urlopen(url)

        elif request.method == 'POST':
            url = secure_url(request.method, url)
            response = urllib2.urlopen(url, request.data)

        elif request.method == 'PUT':
            if 'image-server/v1' in url and 'xlink:href' in request.data:
                image_url = re.search(r'xlink:href="(.+?)"', request.data).group(1)
                response = urllib.urlopen(image_url).read()
                url = secure_url(request.method, url) + '&method=PUT'
                response = urllib2.urlopen(url, response)

    except urllib2.HTTPError, e:
        # TODO: better handling of errors
        logging.warning(url)
        logging.warning(e.code)
        logging.warning(e.msg)
        response = make_response(e.fp.read())

        if e.code == 201:
            # fix for GAE python 2.5
            response.headers['Content-Type'] = 'application/xml'
            response.headers['Location'] = e.hdrs.get('Location')

        response.status_code = e.code
        return response

    r = response.read()
    if app.debug:
        logging.info(request.url)
        logging.info(r)

    my_response = make_response(r)
    my_response.headers['Content-Type'] = 'application/xml'
    my_response.headers['Location'] = response.headers.get('Location')
    #response.getcode() not supported in python 2.5
    my_response.status_code = 201 if 'Location' in response.headers else 200
    return my_response
    return my_response

def secure_url(method, url):
    """Add authorization signature for spreadshirt request
    http://developer.spreadshirt.net/display/API/Security
    """
    timestamp = int(time.time() * 1000)
    signature = hashlib.sha1('%s %s %s %s' % (method, url, timestamp,
                                              app.config['SPREADSHIRT_SECRET'])).hexdigest()
    return url + '?' + urllib.urlencode({
        'apiKey': app.config['SPREADSHIRT_KEY'], 'sig': signature, 'time': timestamp})
