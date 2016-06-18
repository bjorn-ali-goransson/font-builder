Also generates .scss mixins and classes for you to use, with correct code points and aliases.

Note that some optional dependencies may fail for ttf2woff2. In addition, ttf2woff2 doesn't seem to work when called from gulp (so I've commented it out).

Choose icons (glyphs) from a font
---------------------------------

    fontBuilder(
        './font-awesome/fonts/fontawesome-webfont.svg',
        {
            'f16d': 'lorem'
        }
    );
    
Choose icons from several fonts:
--------------------------------

    fontBuilder(
        {
            defaultFont: './streamline-24px/fonts/streamline-24px.svg',
            fonts: {
                'fa':   './Static/Vendor/font-awesome/fonts/fontawesome-webfont.svg'
            },
            glyphs: {
                'e62a': 'arrow-left',
                'e62b': 'arrow-right',
                'fa:f08c': 'linkedin',
                'fa:f082': 'facebook',
                'fa:f16d': 'instagram'
            }
        }
    );
    
The kitchen sink
----------------

    fontBuilder(
        {
            fontname: 'streamline',
            stylesDirectory: './Static/css',
            fontsDirectory: './Static/fonts',
            defaultFont: './streamline-24px/fonts/streamline-24px.svg',
            fonts: {
                'fi': './streamline-24px-filled-in/fonts/streamline-24px-filled-in.svg',
                'fa': './font-awesome/fonts/fontawesome-webfont.svg'
            },
            glyphs: {
                'e62a': 'arrow-left',
                'e62b': 'arrow-right',
                'fi:e124': 'mail',
                'fa:f08c': 'linkedin',
                'fa:f082': 'facebook',
                'fa:f16d': 'instagram'
            }
        }
    );

Credits
=======

Most of the (really) hard work here was already done by [Vitaly](https://github.com/puzrin).