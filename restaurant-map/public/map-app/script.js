// --- Khởi tạo bản đồ ---
const map = L.map("map").setView([10.0452, 105.7469], 14);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// --- Biến toàn cục ---
let currentRoute = null;
let userMarker = null;
let cuisineCount = {};
let chart = null;
let allRestaurants = [];
let allMarkers = [];

// --- Hàm dịch loại món ---
function formatLoaiMon(tag) {
  if (!tag) return "Khác";
  tag = tag.toLowerCase();

  const map = {
    restaurant: "Nhà hàng",
    fast_food: "Đồ ăn nhanh",
    bar: "Quán bar",
    pub: "Quán nhậu",
    food_court: "Khu ăn uống",
    bakery: "Tiệm bánh",
    ice_cream: "Quán kem",
    vietnamese: "Ẩm thực Việt Nam",
    chinese: "Ẩm thực Trung Hoa",
    japanese: "Ẩm thực Nhật Bản",
    thai: "Ẩm thực Thái Lan",
    korean: "Ẩm thực Hàn Quốc",
    seafood: "Hải sản",
    noodle: "Mì / Phở",
    cafe: "Quán cà phê",
    coffee: "Quán cà phê",
    tea: "Trà sữa / Trà"
  };

  return map[tag] || tag.replace(/_/g, " ");
}

// --- Biểu tượng emoji ---
function getEmoji(cuisine) {
  cuisine = cuisine.toLowerCase();
  if (cuisine.includes("coffee") || cuisine.includes("cafe")) return "☕";
  if (cuisine.includes("vietnam")) return "🍜";
  if (cuisine.includes("korean")) return "🇰🇷";
  if (cuisine.includes("japan")) return "🍣";
  if (cuisine.includes("thai")) return "🍲";
  if (cuisine.includes("seafood")) return "🦞";
  if (cuisine.includes("ice_cream")) return "🍦";
  if (cuisine.includes("bakery")) return "🍰";
  if (cuisine.includes("bar")) return "🍺";
  return "🍴";
}

// --- Lấy vị trí người dùng ---
navigator.geolocation.getCurrentPosition(
(pos) => {
const userLatLng = [pos.coords.latitude, pos.coords.longitude];

      // 🔴 Tạo icon riêng cho vị trí người dùng
      const userIcon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // icon màu đỏ
        iconSize: [38, 38], // kích thước icon
        iconAnchor: [19, 38], // điểm neo (chân của icon)
        popupAnchor: [0, -35] // vị trí popup hiển thị
      });

      // 🔹 Hiển thị marker với icon riêng
      userMarker = L.marker(userLatLng, { icon: userIcon })
        .addTo(map)
        .bindPopup("📍 <b>Vị trí của bạn</b>")
        .openPopup();

      // 🔹 Di chuyển bản đồ đến vị trí người dùng
      map.setView(userLatLng, 15);
    },
    (err) => {
      console.warn("⚠️ Không thể lấy vị trí người dùng:", err.message);
    }
  );


// --- Gọi API Overpass ---
const overpassUrl = "https://overpass-api.de/api/interpreter";
const query = `
[out:json];
node["amenity"="restaurant"](around:3000,10.0452,105.7469);
out;
`;

fetch(overpassUrl, { method: "POST", body: query })
  .then((res) => res.json())
  .then((data) => {
    const listContainer = document.getElementById("restaurantList");

    data.elements.forEach((el) => {
      if (el.type === "node") {
        const name = el.tags.name || "Quán ăn không tên";
        const rawCuisine = el.tags.cuisine || el.tags.amenity || "Khác";
        const cuisine = formatLoaiMon(rawCuisine);
        const icon = getEmoji(rawCuisine);

        const marker = L.marker([el.lat, el.lon]).addTo(map).bindPopup(`
          <b>${icon} ${name}</b><br>
          🍜 ${cuisine || 'Không rõ'}<br>
          🌍 <b>Tọa độ:</b> ${el.lat.toFixed(6)}, ${el.lon.toFixed(6)}<br><br>
          <button onclick="showRoute(${el.lat}, ${el.lon}, '${name}')">🧭 Chỉ đường</button>
        `);

        // Sidebar list
        const li = document.createElement("li");
        li.innerHTML = `${icon} <b>${name}</b><br><small>${cuisine}</small>`;
        li.addEventListener("click", () => {
          map.setView([el.lat, el.lon], 17);
          marker.openPopup();
        });
        listContainer.appendChild(li);

        allRestaurants.push({ name, cuisine, lat: el.lat, lon: el.lon, marker });
        allMarkers.push(marker);

        cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1;
      }
    });

    drawChart();
    setupSearch();
  })
  .catch((err) => console.error("Lỗi tải dữ liệu:", err));

// --- Chức năng tìm kiếm ---
function setupSearch() {
  const searchBox = document.getElementById("searchBox");
  searchBox.addEventListener("input", (e) => {
    const keyword = e.target.value.toLowerCase();
    const listContainer = document.getElementById("restaurantList");
    listContainer.innerHTML = "";

    allMarkers.forEach((m) => map.removeLayer(m));

    const filtered = allRestaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(keyword) ||
        r.cuisine.toLowerCase().includes(keyword)
    );

    filtered.forEach((r) => {
      r.marker.addTo(map);
      const li = document.createElement("li");
      li.innerHTML = `🍴 <b>${r.name}</b><br><small>${r.cuisine}</small>`;
      li.addEventListener("click", () => {
        map.setView([r.lat, r.lon], 17);
        r.marker.openPopup();
      });
      listContainer.appendChild(li);
    });
  });
}

// --- Chỉ đường ---
window.showRoute = function (destLat, destLon, name) {
  if (!userMarker) {
    alert("Hãy bật GPS để xác định vị trí của bạn!");
    return;
  }

  const userLatLng = userMarker.getLatLng();
  if (currentRoute) map.removeControl(currentRoute);

  currentRoute = L.Routing.control({
    waypoints: [
      L.latLng(userLatLng.lat, userLatLng.lng),
      L.latLng(destLat, destLon)
    ],
    routeWhileDragging: false,
    lineOptions: { addWaypoints: false },
    show: false
  }).addTo(map);
};

// --- Biểu đồ thống kê ---
function drawChart() {
  const ctx = document.getElementById("cuisineChart").getContext("2d");
  const labels = Object.keys(cuisineCount);
  const values = Object.values(cuisineCount);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Số lượng nhà hàng",
        data: values,
        backgroundColor: "rgba(54,162,235,0.6)",
        borderColor: "rgba(54,162,235,1)",
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "📊 Thống kê loại ẩm thực tại Cần Thơ",
          font: { size: 20, weight: "bold" },
          padding: { bottom: 15 }
        }
      },
      scales: {
        x: { ticks: { font: { size: 13, weight: "500" } } },
        y: { beginAtZero: true, title: { display: true, text: "Số lượng" } }
      }
    }
  });
}
