@extends('layouts.app')

@section('content')

    <div class="container">
        <div class="panel panel-default">
            <div class="panel-heading">
                Posts
                <button type="button"
                        class="btn btn-success btn-xs pull-right"
                        data-toggle="modal"
                        data-target="#addPostFormModal"
                        @click="addPostClicked"
                >
                    Add Post
                </button>
            </div>

            <div class="panel-body">
                <div class="container-fluid">
                    <my-post-list @loading-start="isLoading = true" @loading-finish="isLoading = false"></my-post-list>
                </div>
            </div>
        </div>
    </div>

@endsection


@section('templates')

    <template id="my-post-template">

        <div>

            <blockquote>

                <div class="pull-right" v-if="canBeModified">
                    <form method="POST" action="posts/@{{ post.id }}" v-ajax-delete-post>
                        {{ method_field('DELETE') }}
                        <button type="submit" class="btn btn-danger btn-xs">@{{ submitBtnText }}</button>
                    </form>
                </div>

                <h3>#@{{ index }}: @{{ post.title }}</h3>

                <div>@{{ post.description }}</div>

                <footer>
                    by
                    <a>
                        @{{ post.owner.name }}
                    </a>
                    <cite>
                        <abbr title="last updated at">
                            @{{ post.updated_at }}
                        </abbr>
                    </cite>
                    <span v-if="canBeModified">
                        (<a href="#" @click="showEditForm(post)">edit</a>)
                    </span>
                </footer>

                <div class="animated smallerFont" v-show="lastError.general" transition="delete-error">
                &nbsp;
                    <div class="alert alert-danger alert-dismissible">

                        <button type="button" class="close" aria-label="Close"
                        @click="lastError = {general: '', more: ''}"
                        >
                        <span aria-hidden="true">&times;</span>
                        </button>

                        <a type="button" class="text-danger" data-toggle="collapse" href="#collapseErrorDelete@{{ post.id }}" aria-expanded="false" aria-controls="collapseErrorDelete@{{ post.id }}">
                            @{{ lastError.general }}
                        </a>
                        <div class="collapse" id="collapseErrorDelete@{{ post.id }}">
                            <div class="bg-danger" id="error-more">
                                @{{ lastError.more }}
                            </div>
                        </div>

                    </div>
                </div>
            </blockquote>

        </div>

    </template>

    <template id="my-post-list-template">

        <div id="postsList">

            <div transition="error" class="alert alert-warning animated" v-if="isOffline">You seem to be offline.</div>

            <div transition="error" class="alert alert-info animated" v-if="! posts.length">There is no any post to display.</div>

            <my-post class="animated" v-for="post in posts | orderBy 'updated_at' -1" :index="$index + 1" :post="post" transition="post">
            </my-post>


            <my-empty @post-add-clicked="setFormTypeAdd"></my-empty>

            <div class="modal fade"
                 id="addPostFormModal"
                 tabindex="-1"
                 role="dialog"
                 aria-labelledby="myAddPostFormModalLabel"
            >
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header bg-info">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 class="modal-title">@{{ formTitle }}</h4>
                        </div>

                        <form novalidate name="addPostForm" id="addPostForm" :action="formAction" method="POST" v-ajax-add-post>

{{--                            {{ csrf_field() }}--}}

                            <input type="hidden" name="_method" :value="formMethod">

                            <validator name="postValidation">
                                <div class="modal-body">
                                    <div :class="['form-group', $postValidation.title.dirty && $postValidation.title.invalid ? 'has-error' : '']">
                                        <input type="text"
                                               name="title"
                                               autofocus
                                               class="form-control"
                                               placeholder="Enter Post Title"
                                               v-validate:title="{ required: true, minlength: 5 }"
                                        >
                                        <span class="help-block" v-show="$postValidation.title.dirty && $postValidation.title.invalid">
                                        Title must be at least 5 characters
                                    </span>
                                    </div>

                                    <div :class="['form-group', $postValidation.description.dirty && $postValidation.description.invalid ? 'has-error' : '']">
                                    <textarea name="description"
                                              class="form-control"
                                              placeholder="Description"
                                              v-validate:description="{ required: true, minlength: 10 }"
                                    ></textarea>
                                        <span class="help-block" v-show="$postValidation.description.dirty && $postValidation.description.invalid">
                                        Description must be at least 10 characters
                                    </span>
                                    </div>

                                    <div class="alert alert-danger" v-show="lastError.general">
                                        <a type="button" class="text-danger" data-toggle="collapse" href="#collapseError" aria-expanded="false" aria-controls="collapseError">
                                            @{{ lastError.general }}
                                        </a>
                                        <div class="collapse" id="collapseError">
                                            <div class="bg-danger" id="error-more">
                                                @{{ lastError.more }}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                                <div class="modal-footer bg-info">
                                    <button id="postModalCloseBtn" type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                                    <button id="postFormSubmitBtn" type="submit" class="btn btn-primary" :disabled="$postValidation.invalid">@{{ submitBtnText }}</button>
                                </div>
                            </validator>
                        </form>
                    </div>
                </div>
            </div>

        </div>

    </template>

    <template id="my-empty-template"></template>

@endsection
