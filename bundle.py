"""
Bundle and minify dragtoshirt source files.
Requires webbundle and uglifyjs:
https://github.com/kwellman/webbundle
https://github.com/mishoo/UglifyJS
"""
from webbundle import cssbundle, jsbundle

jsfiles = [
    'spreadshirtapi.js',
    'simplomat.js',
    'customsimplomat.js',
    'jquery.magnifier.js',
    'dragtoshirt.js',
]
jsbundle(jsfiles, 'jquery.dragtoshirt.js', engine='uglifyjs', verbose=True)
