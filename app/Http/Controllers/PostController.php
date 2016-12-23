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
//        return $request->all();

        $post = new Post($request->all());
        $request->user()->posts()->save($post);
        return $post->load('owner');
    }

    public function show(Post $post)
    {
        return $post->load('owner');
    }

    public function update(Request $request, Post $post)
    {
//        return $request->all();

        $this->authorize('update', $post);

        $post->update($request->all());
        return $post->load('owner');
    }

    public function destroy(Post $post)
    {
        $this->authorize('delete', $post);

        $post->delete();
        return $post->id;
    }
}
