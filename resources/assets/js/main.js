(function () {

    $(document).on('shown.bs.modal', function(e) {
        $('[autofocus]', e.target).focus()
    });

    Array.prototype.extendUniquely = function(other_array) {
        /* you should include a test to check whether other_array really is an array */
        other_array.forEach(function(v) {
            if (this.indexOf(v) == -1) {
                this.push(v);
            }
        }, this);
    };

    Vue.http.headers.common['X-CSRF-TOKEN'] = window.Laravel.csrfToken;

    Vue.transition('error', {
        enterClass: 'fadeIn',
        leaveClass: 'fadeOut'
    });

    Vue.transition('loader-modal', {
        enterClass: 'fadeIn',
        leaveClass: 'fadeOut'
    });

    Vue.transition('delete-error', {
        enterClass: 'bounceIn',
        leaveClass: 'bounceOut'
    });

    Vue.transition('post', {
        enterClass: 'flipInX',
        leaveClass: 'flipOutX'
    });

    Vue.directive('ajax-add-post', {
        bind: function() {
            this.el.addEventListener(
                'submit', this.onSubmit.bind(this)
            );
        },

        onSubmit: function(e) {
            this.el.querySelector('button[type="submit"]').disabled = true;
            this.vm.toggleSubmitBtnText();

            e.preventDefault();

            const requestType = this.getRequestType();
            const form = this.el;

            const formData = new FormData(form);

            this.vm
                .$http['post'](this.el.action, formData)
                .then(this.onComplete.bind(this), this.onError.bind(this));
        },

        onComplete: function(response) {
            const newPost = response.body;

            this.vm.lastError = {};
            this.el.reset();

            $('#addPostFormModal').modal('hide');

            let oldPost = this.vm.getPostWithId(newPost.id);

            this.vm.posts.$remove(oldPost);
            this.vm.posts.push(newPost);

            this.vm.toggleSubmitBtnText();
            this.el.querySelector('button[type="submit"]').disabled = false;
        },

        onError: function(response) {
            this.vm.lastError.general = 'Something went wrong, please try again in a moment.';
            this.vm.lastError.more = '[' + response.status + '] ' + response.statusText;

            this.el.querySelector('button[type="submit"]').disabled = false;
            this.vm.toggleSubmitBtnText();
        },

        getRequestType: function() {
            let method = this.el.querySelector('input[name="_method"]');
            method = (method ? method.value : this.el.method).toLowerCase();
            return method;
        },

    });

    Vue.directive('ajax-delete-post', {
        bind: function() {
            this.el.addEventListener(
                'submit', this.onSubmit.bind(this)
            );
        },

        onSubmit: function(e) {
            e.preventDefault();

            this.el.querySelector('button[type="submit"]').disabled = true;
            this.vm.toggleSubmitBtnText();

            const requestType = this.getRequestType();
            const form = this.el;
            const formData = new FormData(form);

            this.vm
                .$http[requestType](this.el.action, formData)
                .then(this.onComplete.bind(this), this.onError.bind(this));
        },

        onComplete: function(response) {
            const deletedPostId = response.body;
            const deletedPost = this.vm.$parent.getPostWithId(deletedPostId);

            this.vm.$parent.posts.$remove(deletedPost);
        },

        onError: function(response) {
            this.vm.lastError.general = 'Failed to delete the post. Please try again in a moment.';
            this.vm.lastError.more = 'Something went wrong: [' + response.status + '] ' + response.statusText;

            this.el.querySelector('button[type="submit"]').disabled = false;
            this.vm.toggleSubmitBtnText();
        },

        getRequestType: function() {
            let method = this.el.querySelector('input[name="_method"]');
            method = (method ? method.value : this.el.method).toLowerCase();
            return method;
        },
    });


    const MyPost = Vue.extend({
        template: '#my-post-template',
        props: ['post', 'index'],

        data: function() {
            return {
                lastError: { general: '', more: '' },
                submitBtnTexts: ['Delete', 'Deleting...'],
                submitBtnTextIndex: 0,
            }
        },

        computed: {
            submitBtnText: function() {
                return this.submitBtnTexts[this.submitBtnTextIndex];
            }
        },

        methods: {
            toggleSubmitBtnText: function() {
                this.submitBtnTextIndex ^= 1;
            },

            showEditForm: function (post) {
                this.$event.preventDefault();

                let form = document.getElementById('addPostForm');
                this.fillEditForm(form, post);
                this.showEditFormModal(post.id);
            },

            fillEditForm: function (form, post) {
                form.title.value = post.title;
                form.description.value = post.description;
            },

            showEditFormModal: function (postId) {
                this.$parent.setFormTypeEdit(postId);
                $('#addPostFormModal').modal('show');
            },
        },
    });

    const MyEmpty = Vue.extend({
        template: '#my-empty-template',
    });

    const MyPostList = Vue.extend({
        template: '#my-post-list-template',

        data: function() {
            return {
                posts: [],
                isOffline: false,
                lastError: { general: '', more: '' },
                formTitles: ['Add a Post', 'Edit the Post'],
                formTypeIndex: 0,
                formMethod: 'POST',
                formAction: 'posts',
                submitBtnTexts: ['Save changes', 'Saving...'],
                submitBtnTextIndex: 0,
            };
        },

        computed: {
            formTitle: function () {
                return this.formTitles[this.formTypeIndex];
            },
            latestFetchedId: function() {
                let index = this.posts.length - 1;
                return (index >= 0) ? this.posts[index].id : 0;
            },
            submitBtnText: function() {
                return this.submitBtnTexts[this.submitBtnTextIndex];
            }
        },

        methods: {
            toggleSubmitBtnText: function() {
                this.submitBtnTextIndex ^= 1;
            },

            toggleFormTitle: function() {
                this.formTypeIndex ^= 1;
            },

            setFormTypeAdd: function() {
                this.formTypeIndex = 0;
                this.formAction = 'posts';
                this.formMethod = 'POST';
                this.$resetValidation();
            },

            setFormTypeEdit: function(postId) {
                this.formTypeIndex = 1;
                this.formAction = 'posts/' + postId;
                this.formMethod = 'PATCH';
                this.$resetValidation();
                this.$validate();
            },

            getPostWithId: function(id) {
                return this.posts.find(function (p) {
                    if (p.id == id) {
                        return p;
                    }
                    return null;
                });
            },

            fetchPosts: function() {
                this.$http.get('posts?latestFetchedId=' + this.latestFetchedId, {

                    // use before callback
                    before: function(request) {

                        // abort previous request, if exists
                        if (this.previousRequest) {
                            this.previousRequest.abort();
                        }

                        // set previous request on Vue instance
                        this.previousRequest = request;
                    }

                }).then(function(response) {
                    this.isOffline = false;
                    if (response.body) {
                        this.posts.extendUniquely(response.body);
                    }
                    this.$dispatch('loading-finish');

                }, function() {
                    this.isOffline = true;
                    this.$dispatch('loading-finish');
                });
            },
        },

        ready: function() {
            this.$dispatch('loading-start');
            this.fetchPosts();

            // setInterval(this.fetchPosts, 7000);
        },

        components: {
            'myPost': MyPost,
            'myEmpty': MyEmpty,
        },
    });

    new Vue({
        el: 'body',

        data: {
            isLoading: true,
        },

        components: {
            'myPostList': MyPostList,
        },
        
        methods: {
            addPostClicked: function () {
                this.$broadcast('post-add-clicked');
            }
        },

        ready: function() {
            this.isLoading = false;
        },
    });

})();
