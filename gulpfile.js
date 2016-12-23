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

elixir(function(mix) {
    mix
        .styles([
            'bootstrap.min.css',
            'bootstrap-theme.min.css',
            'animate.min.css',
            'main.css',
        ])
        .scripts([
            'jquery-3.1.1.min.js',
            'bootstrap.min.js',
            'vue.min.js',
            'vue-resource.min.js',
            'vue-validator.min.js',
            'vue-animated-list.min.js',
            'main.js',
        ])
        .version([
            'css/all.css',
            'js/all.js'
        ]);
});
