<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Post;

class PostController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        if($id = $request->get('latestFetchedId')) {
            $posts = Post::with('owner')->where('id', '>', $id)->get();
        }
        else {
            $posts = Post::with('owner')->get();
        }
        return $posts;
    }

    public function store(Request $request)
    {
        $post = new Post($request->all());
        $request->user()->posts()->save($post);
        return $post->load('owner');
    }

    public function show(Post $post)
    {
        $post->load('owner');
        return $post;
    }

    public function update(Request $request, Post $post)
    {
        //
    }

    public function destroy(Post $post)
    {
        //
    }
}
