(function () {

    $(document).on('shown.bs.modal', (e) => {
        $('[autofocus]', e.target).focus()
    });

    Array.prototype.extend = function(other_array) {
        /* you should include a test to check whether other_array really is an array */
        other_array.forEach((v) => {
            this.push(v)
        }, this);
    };

    Vue.http.headers.common['X-CSRF-TOKEN'] = window.Laravel.csrfToken;

    Vue.transition('error', {
        enterClass: 'fadeIn',
        leaveClass: 'flipOutX'
    });

    Vue.transition('post', {
        enterClass: 'flipInX',
        leaveClass: 'rotateOut'
    });

    Vue.directive('ajax', {
        bind() {
            this.el.addEventListener(
                'submit', this.onSubmit.bind(this)
            );
        },

        onSubmit(e) {
            this.el.querySelector('button[type="submit"]').disabled = true;
            e.preventDefault();

            const requestType = this.getRequestType();
            const form = this.el;
            const formData = new FormData(form);

            this.vm
                .$http[requestType](this.el.action, formData)
                .then(this.onComplete.bind(this), this.onError.bind(this));
        },

        onComplete(response) {
            const newPost = response.body;

            this.vm.lastError = {};
            this.el.reset();

            $('#addPostFormModal').modal('hide');

            this.vm.posts.push(newPost);
        },

        onError(response) {
            this.vm.lastError.general = 'Something went wrong, please try again in a moment.';
            this.vm.lastError.more = '[' + response.status + '] ' + response.statusText;
        },

        getRequestType() {
            let method = this.el.querySelector('input[name="_method"]');
            method = (method ? method.value : this.el.method).toLowerCase();
            return method;
        },
    });


    const MyPost = Vue.extend({
        template: '#my-post-template',
        props: ['post'],
    });


    const MyPostList = Vue.extend({
        template: '#my-post-list-template',

        data() {
            return {
                posts: [],
                lastError: { general: '', more: '' },
                isOffline: true,
            };
        },

        computed: {
            latestFetchedId() {
                return this.posts[this.posts.length - 1].id;
            }
        },

        created() {
            this.fetchPosts();
            setInterval(this.fetchPosts, 7000);
        },

        methods: {
            fetchPosts() {
                this.$http.get('posts?latestFetchedId=' + this.latestFetchedId).then((response) => {
                    this.isOffline = false;
                    if (response.body) {
                        this.posts.extend(response.body);
                    }
                }, () => {
                    this.isOffline = true;
                });
            },
        },

        components: {
            'myPost': MyPost,
        },
    });


    new Vue({
        el: 'body',

        components: {
            'myPostList': MyPostList,
        },
    });

})();
