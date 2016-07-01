Also generates .scss mixins and classes for you to use, with correct code points and aliases.

Note that some optional dependencies may fail for ttf2woff2. In addition, ttf2woff2 doesn't seem to work when called from gulp (so I've commented it out).

Usage
---------------------------------

    fontBuilder({
      fonts: {
        'fa': './Vendor/font-awesome/fonts/fontawesome-webfont.svg'
      },
      glyphs: {
        'fa:f067': 'plus',
        'fa:f068': 'minus',
        'fa:f021': 'refresh'
      }
    });
    
All available options
----------------

    var defaults = {
      fontname: 'built-font',
      fonts: [],
      defaultFont: null,
      glyphs: [],
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
      fontsUrl: ''
    };
    
Example of generated _icons.scss file
-------------------------------------

    @font-face {
      font-family: 'built-font';
      src: url('built-font.eot?e7822c');
      src: url('built-font.eot?e7822c#iefix') format('embedded-opentype'),
        url('built-font.ttf?e7822c') format('truetype'),
        url('built-font.woff?e7822c') format('woff'),
        url('built-font.svg?e7822c#svgfont') format('svg');
      font-weight: normal;
      font-style: normal;
    }
    
    @mixin icon {
      display: inline-block;
      font-family: 'built-font';
      font-style: normal;
      font-weight: normal;
      font-size: inherit;
      line-height: 1;
      vertical-align: middle;
      text-rendering: auto;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .icon { @include icon; }

    @mixin icon-arrow-left   { content: '\e62a'; }
    @mixin icon-arrow-right  { content: '\e62b'; }
    @mixin icon-search       { content: '\e01f'; }

    .icon-arrow-left:before  { @include icon-arrow-left; }
    .icon-arrow-right:before { @include icon-arrow-right; }
    .icon-search:before      { @include icon-search; }
  
Example of using the font in HTML
---------------------------------

    <i class="icon icon-search"></i>

Credits
=======

Most of the (really) hard work here was already done by [Vitaly](https://github.com/puzrin).