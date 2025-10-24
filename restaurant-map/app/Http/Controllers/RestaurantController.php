<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Restaurant;

class RestaurantController extends Controller
{
    // Hiển thị danh sách nhà hàng
    public function index()
    {
        $restaurants = Restaurant::all();
        return view('restaurants.index', compact('restaurants'));
    }

    // Thêm mới nhà hàng
    public function create()
    {
        return view('restaurants.create');
    }

    // Lưu nhà hàng
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
       $keyword = $request->query('food');

    // Tìm theo tên nhà hàng, loại ẩm thực, hoặc món nổi bật
    $results = Restaurant::where('ten_nha_hang', 'like', "%{$keyword}%")
        ->orWhere('loai_am_thuc', 'like', "%{$keyword}%")
        ->orWhere('mon_noi_bat', 'like', "%{$keyword}%")
        ->get();

    // ✅ Luôn trả về mảng (kể cả khi trống)
    return response()->json($results);
    }
}
