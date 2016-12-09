const elixir = require('laravel-elixir');

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Sass
 | file for your application as well as publishing vendor resources.
 |
 */

elixir((mix) => {
    mix.styles([
        'bootstrap.css',
        'bootstrap-theme.css',
        'animate.css',
        'main.css',
    ]).scripts([
        'jquery-3.1.1.js',
        'bootstrap.js',
        'vue.js',
        'vue-resource.js',
        'vue-validator.js',
        'vue-animated-list.js',
        'main.js',
    ]);
});
