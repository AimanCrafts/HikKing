<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // Get all categories
    public function index()
    {
        $categories = Category::all();

        return response()->json($categories);
    }

    // Get a single category (with its packages)
    public function show($id)
    {
        $category = Category::with('packages')->findOrFail($id);

        return response()->json($category);
    }

    // Create a new category
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_name' => 'required|string|max:100|unique:categories,category_name',
        ]);

        $category = Category::create($validated);

        return response()->json($category, 201);
    }

    // Update a category
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'category_name' => 'required|string|max:100|unique:categories,category_name,' . $id . ',category_id',
        ]);

        $category->update($validated);

        return response()->json($category);
    }

    // Delete a category
    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully'
        ]);
    }
}