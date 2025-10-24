<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Bản đồ quán ăn</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; background: #f8f9fa; }
        #map { height: 500px; margin: 10px; border-radius: 10px; }
        .form-box { background: white; padding: 10px; margin: 10px; border-radius: 8px; box-shadow: 0 0 5px rgba(0,0,0,0.2); }
    </style>
</head>
<body>
    <h2 style="text-align:center;">🍽️ Hệ thống quản lý quán ăn</h2>

    <div class="form-box">
        <h4>Thêm quán ăn</h4>
        <input type="text" id="name" placeholder="Tên quán">
        <input type="text" id="type" placeholder="Loại ẩm thực">
        <input type="text" id="address" placeholder="Địa chỉ">
        <input type="text" id="signature_dish" placeholder="Món nổi bật">
        <input type="number" id="avg_price" placeholder="Giá trung bình">
        <button onclick="addRestaurant()">Thêm</button>
    </div>

    <div id="map"></div>

    <div class="form-box">
        <h4>Tìm món ăn</h4>
        <input type="text" id="search" placeholder="Nhập món ăn...">
        <button onclick="searchDish()">Tìm</button>
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        const map = L.map('map').setView([10.0452, 105.7469], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        let markers = [];

        function clearMarkers() {
            markers.forEach(m => map.removeLayer(m));
            markers = [];
        }

        function loadRestaurants() {
            fetch('/restaurants')
                .then(res => res.json())
                .then(data => {
                    clearMarkers();
                    data.forEach(r => {
                        const marker = L.marker([r.latitude, r.longitude])
                            .addTo(map)
                            .bindPopup(`<b>${r.name}</b><br>${r.signature_dish}<br>${r.address}`);
                        markers.push(marker);
                    });
                });
        }

        function addRestaurant() {
            const data = {
                name: document.getElementById('name').value,
                type: document.getElementById('type').value,
                address: document.getElementById('address').value,
                signature_dish: document.getElementById('signature_dish').value,
                avg_price: document.getElementById('avg_price').value,
                latitude: 10.0452 + Math.random() * 0.05,
                longitude: 105.7469 + Math.random() * 0.05
            };

            fetch('http://127.0.0.1:8012/api/restaurants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
                },
                body: JSON.stringify(data)
                   
            })
            .then(res => res.json())
            .then(() => loadRestaurants());
        }

        function searchDish() {
            const q = document.getElementById('search').value;
            fetch(`/restaurants/search?q=${q}`)
                .then(res => res.json())
                .then(results => {
                    clearMarkers();
                    results.forEach(r => {
                        const marker = L.marker([r.latitude, r.longitude])
                            .addTo(map)
                            .bindPopup(`<b>${r.name}</b><br>${r.signature_dish}<br>${r.address}`);
                        markers.push(marker);
                    });
                });
        }

        loadRestaurants();
    </script>
</body>
</html>
