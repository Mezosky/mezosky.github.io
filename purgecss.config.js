module.exports = {
  content: ["_site/**/*.html", "_site/**/*.js"],
  css: ["_site/assets/css/*.css"],
  output: "_site/assets/css/",
  skippedContentGlobs: ["_site/assets/**/*.html"],
  // Classes applied at runtime by libraries loaded from a CDN. PurgeCSS only
  // scans the files above, so it never sees these and would strip their rules.
  safelist: {
    standard: [/^medium-zoom/],
  },
};
