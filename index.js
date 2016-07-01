var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var svgPath = require('svgpath');
var XMLDOMParser  = require('xmldom').DOMParser;



module.exports = function (options) {
  var defaults = {
    fontname: 'built-font',
    fonts: {},
    glyphs: {},
    outputScss: true
  };
  var fontDefaults = {
    fontUnitsPerEm: 512,
    ascent: 480,
    descent: -32,
    horizAdvX: 512
  };
  var pathDefaults = {
    stylesDirectory: './styles',
    fontsDirectory: './fonts',
    fontsUrl: '../fonts'
  };

  options = _.assign({}, defaults, fontDefaults, pathDefaults, options);



  // Generate initial SVG font.
  
  var svgTemplateStart = 
    '<?xml version="1.0" standalone="no"?>\n' +
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
    '<svg xmlns="http://www.w3.org/2000/svg">\n' +
    '<defs>\n' +
    '<font id="' + options.fontname + '" horiz-adv-x="' + options.horizAdvX + '">\n' +
    '<font-face font-family="' + options.fontname + '" units-per-em="' + options.fontUnitsPerEm + '" ascent="' + options.ascent + '" descent="' + options.descent + '"/>\n' +
    '<missing-glyph horiz-adv-x="' + options.horizAdvX + '" />\n';

  var svgTemplateEnd = '</font></defs></svg>';
  
  
  
  function loadSvg(src){
    var source = {};
        
    source.contents = fs.readFileSync(src).toString();
    source.xml = (new XMLDOMParser()).parseFromString(source.contents, "application/xml");
    
    source.svgFont = source.xml.getElementsByTagName('font')[0];
    source.svgFontface = source.xml.getElementsByTagName('font-face')[0];
    source.svgGlyphs = source.xml.getElementsByTagName('glyph');

    source.fontHorizAdvX = +source.svgFont.getAttribute('horiz-adv-x');
    source.fontAscent = +source.svgFontface.getAttribute('ascent');
    source.fontUnitsPerEm = +source.svgFontface.getAttribute('units-per-em') || 1000;

    source.scale = options.fontUnitsPerEm / source.fontUnitsPerEm;
    
    return source;
  }
  
  
  
  var resultingGlyphs = [];

  var sources = {}

  _.each(options.fonts, function (fontPath, fontAlias) {
    sources[fontAlias] = loadSvg(fontPath);
  });
  
  _.each(options.glyphs, function (alias, glyphReference) {
    if(glyphReference.indexOf(':') == -1){
      throw 'Glyph key ' + glyphReference + ' was not prefixed (which font should I use?)';
      return;
    }
    
    var glyphReferenceSplit = glyphReference.split(':');
    
    var name = glyphReferenceSplit[1];
    var source = sources[glyphReferenceSplit[0]];

    var unicodeValue = parseInt(name, 16);

    var foundGlyph = false;
    
    _.each(source.svgGlyphs, function (svgGlyph) {
      if(svgGlyph.getAttribute('unicode').charCodeAt(0) != unicodeValue){
        return;
      }
      
      var d = svgGlyph.getAttribute('d');

      if (!d) {
        return;
      }

      foundGlyph = true;

      var unicode = svgGlyph.getAttribute('unicode');
      var width = svgGlyph.getAttribute('horiz-adv-x') || source.fontHorizAdvX;

      resultingGlyphs.push({
      glyphName: alias,
      unicode: unicodeValue.toString(16),
      horizAdvX: Math.floor(width / source.fontUnitsPerEm * options.fontUnitsPerEm),
      d: new svgPath(d)
        .translate(0, source.fontAscent / source.fontUnitsPerEm * options.fontUnitsPerEm)
        .scale(source.scale, source.scale)
        .abs()
        .round(1)
        .rel()
        .round(1)
        .toString()
      });
    });

    if (!foundGlyph) {
        throw 'Did not find glyph ' + glyphReference;
    }
  });

  var maxGlyphNameLength = Math.max.apply(null, _.map(options.glyphs, 'length'));
  var glyphNamePadding = new Array(maxGlyphNameLength).join(' ');
  
  var resultingGlyphsXml = _.map(resultingGlyphs, function(resultingGlyph){
    return '' +
      '<glyph' +
      ' glyph-name="' + resultingGlyph.glyphName + '"' +
      glyphNamePadding.substr(resultingGlyph.glyphName.length - 1) +
      ' unicode="&#x' + resultingGlyph.unicode.toString(16) + ';"' +
      ' horiz-adv-x="' + resultingGlyph.horizAdvX + '"' +
      ' d="' + resultingGlyph.d + '" />';
  });
  
  var svgOutput = svgTemplateStart + '\n' + resultingGlyphsXml.join('\n') + '\n' + svgTemplateEnd;
  
  fs.writeFileSync(path.join(options.fontsDirectory, options.fontname + '.svg'), svgOutput, 'utf8');
  
  if (options.outputScss) {
    var hex = Math.floor(Math.random()*16777215).toString(16);
    
    var scssOutput = '';
    
    scssOutput += '@font-face {' + "\n";
    scssOutput += '  font-family: \'' + options.fontname + '\';' + "\n";
    scssOutput += '  src: url(\'' + path.join(options.fontsUrl, options.fontname + '.eot?' + hex).replace(/\\/g, '/') + '\');' + "\n";
    scssOutput += '  src: url(\'' + path.join(options.fontsUrl, options.fontname + '.eot?' + hex + '#iefix').replace(/\\/g, '/') + '\') format(\'embedded-opentype\'),' + "\n";
    scssOutput += '    url(\'' + path.join(options.fontsUrl, options.fontname + '.ttf?' + hex).replace(/\\/g, '/') + '\') format(\'truetype\'),' + "\n";
    scssOutput += '    url(\'' + path.join(options.fontsUrl, options.fontname + '.woff?' + hex).replace(/\\/g, '/') + '\') format(\'woff\'),' + "\n";
    scssOutput += '    url(\'' + path.join(options.fontsUrl, options.fontname + '.svg?' + hex + '#svgfont').replace(/\\/g, '/') + '\') format(\'svg\');' + "\n";
    scssOutput += '  font-weight: normal;' + "\n";
    scssOutput += '  font-style: normal;' + "\n";
    scssOutput += '}';

    scssOutput += "\n\n";

    scssOutput += '@mixin icon {' + "\n";
    scssOutput += '  display: inline-block;' + "\n";
    scssOutput += '  font-family: \'' + options.fontname + '\';' + "\n";
    scssOutput += '  font-style: normal;' + "\n";
    scssOutput += '  font-weight: normal;' + "\n";
    scssOutput += '  font-size: inherit;' + "\n";
    scssOutput += '  line-height: 1;' + "\n";
    scssOutput += '  vertical-align: middle;' + "\n";
    scssOutput += '  text-rendering: auto;' + "\n";
    scssOutput += '  -webkit-font-smoothing: antialiased;' + "\n";
    scssOutput += '  -moz-osx-font-smoothing: grayscale;' + "\n";
    scssOutput += '}';

    scssOutput += "\n\n";

    scssOutput += '.icon { @include icon; }' + "\n";

    scssOutput += "\n";

    _.each(resultingGlyphs, function (resultingGlyph) {
      scssOutput += '@mixin icon-' + resultingGlyph.glyphName + '' + glyphNamePadding.substr(resultingGlyph.glyphName.length - 1) + '  { content: \'\\' + resultingGlyph.unicode + '\'; }' + "\n";
    });

    scssOutput += "\n";

    _.each(resultingGlyphs, function (resultingGlyph) {
      scssOutput += '.icon-' + resultingGlyph.glyphName + ':before' + glyphNamePadding.substr(resultingGlyph.glyphName.length - 1) + ' { @include icon-' + resultingGlyph.glyphName + '; }' + "\n";
    });

    fs.writeFileSync(path.join(options.stylesDirectory, '_icons.scss'), scssOutput, 'utf8');
  }



  // Convert SVG to TTF

  var ttf = require('svg2ttf')(svgOutput, { copyright: 'Streamline' });
  fs.writeFileSync(path.join(options.fontsDirectory, options.fontname + '.ttf'), new Buffer(ttf.buffer));

  // Read the resulting TTF

  var ttfOutput = new Uint8Array(fs.readFileSync(path.join(options.fontsDirectory, options.fontname + '.ttf')));

  // Convert TTF to EOT.

  fs.writeFileSync(path.join(options.fontsDirectory, options.fontname + '.eot'), new Buffer(require('ttf2eot')(ttfOutput).buffer));

  // Convert TTF to WOFF / WOFF2

  fs.writeFileSync(path.join(options.fontsDirectory, options.fontname + '.woff'), new Buffer(require('ttf2woff')(ttfOutput).buffer));
  // fs.writeFileSync(path.join(fontsDirectory, options.fontname + '.woff2'), require('ttf2woff2')(ttfOutput));
  // last line doesnt work from within task explorer/gulp.
}