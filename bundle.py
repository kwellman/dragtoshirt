"""
Bundle and minify dragtoshirt source files.
Requires webbundle and uglifyjs:
https://github.com/kwellman/webbundle
https://github.com/mishoo/UglifyJS
"""
from webbundle import cssbundle, jsbundle

jsfiles = [
    'static/spreadshirtapi.js',
    'static/simplomat.js',
    'static/customsimplomat.js',
    'static/jquery.magnifier.js',
    'static/dragtoshirt.js',
]
jsbundle(jsfiles, 'static/jquery.dragtoshirt.js', engine='uglifyjs', verbose=True)
