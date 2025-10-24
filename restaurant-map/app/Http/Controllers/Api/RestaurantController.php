<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    public function index()
    {
        return response()->json(Restaurant::all());
    }

    public function store(Request $request)
    {
        $restaurant = Restaurant::create([
            'name' => $request->name,
            'type' => $request->type,
            'address' => $request->address,
            'signature_dish' => $request->signature_dish,
            'avg_price' => $request->avg_price,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude
        ]);

        return response()->json($restaurant);
    }
    public function search(Request $request)
    {
        $q = $request->query('q');
        $results = Restaurant::where('signature_dish', 'LIKE', "%$q%")
                    ->orWhere('name', 'LIKE', "%$q%")
                    ->get();

        return response()->json($results);
    }

    public function show($id)
    {
        return response()->json(Restaurant::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $restaurant = Restaurant::findOrFail($id);
        $restaurant->update($request->all());
        return response()->json($restaurant);
    }

    public function destroy($id)
    {
        Restaurant::destroy($id);
        return response()->json(null, 204);
    }
}

