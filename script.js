const menuItems = [
    { id: 1, name: "Masala Chai (Pot)", price: 40, category: "Beverages", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400", time: "5 min" },
    { id: 2, name: "Cold Coffee with Ice Cream", price: 80, category: "Beverages", image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400", time: "8 min" },
    { id: 3, name: "Special Vegetable Samosa (2 pcs)", price: 30, category: "Snacks", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400", time: "5 min" },
    { id: 4, name: "Paneer Grilled Sandwich", price: 70, category: "Snacks", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400", time: "10 min" },
    { id: 5, name: "Commerce Fest VIP Combo (Tea + Snacks + Sweet)", price: 120, category: "Combos", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400", time: "10 min" },
    { id: 6, name: "Gulab Jamun (2 pcs)", price: 40, category: "Snacks", image: "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=400", time: "3 min" }
];

let cart = [];
let currentUser = JSON.parse(localStorage.getItem("commfest_user") || "null");

// Initialize User Profile
function initUserSession() {
    const loginCard = document.getElementById("loginCard");
    const userBadge = document.getElementById("userBadge");
    const nameEl = document.getElementById("headerTeacherName");
    const idEl = document.getElementById("headerUserId");

    if (currentUser) {
        loginCard.classList.add("hidden");
        userBadge.classList.remove("hidden");
        userBadge.classList.add("flex");
        nameEl.innerText = currentUser.name;
        idEl.innerText = `ID: ${currentUser.userId}`;
        renderActiveOrders();
    } else {
        loginCard.classList.remove("hidden");
        userBadge.classList.add("hidden");
        userBadge.classList.remove("flex");
        document.getElementById("activeOrdersList").innerHTML = `<p class="text-gray-500 text-sm">Please log in with your name above to view your private order history.</p>`;
    }
}

document.getElementById("loginBtn").addEventListener("click", () => {
    const nameInput = document.getElementById("teacherNameInput").value.trim();
    if (!nameInput) {
        alert("Please enter your name to proceed.");
        return;
    }

    // Assign a unique random User ID for zero privacy overlap
    const randomId = "TEACHER-" + Math.floor(1000 + Math.random() * 9000);
    currentUser = {
        name: nameInput,
        userId: randomId
    };

    localStorage.setItem("commfest_user", JSON.stringify(currentUser));
    initUserSession();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("commfest_user");
    currentUser = null;
    document.getElementById("teacherNameInput").value = "";
    initUserSession();
});

// Render Menu Grid
function renderMenu(filter = "all", search = "") {
    const grid = document.getElementById("menuGrid");
    grid.innerHTML = "";

    const savedStock = JSON.parse(localStorage.getItem("commfest_stock") || "{}");

    const filtered = menuItems.filter(item => {
        const matchesCat = filter === "all" || item.category === filter;
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<p class="text-gray-500 col-span-full text-center py-8">No food items found matching your filter.</p>`;
        return;
    }

    filtered.forEach(item => {
        const inStock = savedStock[item.id] !== undefined ? savedStock[item.id] : true;
        
        grid.innerHTML += `
            <div class="bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                <div>
                    <div class="relative h-40">
                        <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
                        <span class="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-semibold px-2.5 py-1 rounded-lg shadow"><i class="fa-regular fa-clock text-orange-600"></i> ${item.time}</span>
                    </div>
                    <div class="p-4">
                        <h3 class="font-bold text-lg mb-1">${item.name}</h3>
                        <p class="text-orange-600 font-extrabold text-lg">₹${item.price}</p>
                    </div>
                </div>
                <div class="p-4 pt-0">
                    ${inStock ? `
                        <button onclick="addToCart(${item.id})" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-xl transition shadow">
                            <i class="fa-solid fa-plus mr-1"></i> Add to Cart
                        </button>
                    ` : `
                        <button disabled class="w-full bg-gray-200 text-gray-500 font-semibold py-2 rounded-xl cursor-not-allowed">
                            Sold Out
                        </button>
                    `}
                </div>
            </div>
        `;
    });
}

function addToCart(id) {
    if (!currentUser) {
        alert("Please enter your name at the top of the page first!");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    const item = menuItems.find(i => i.id === id);
    const existing = cart.find(c => c.id === id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    const countEl = document.getElementById("cartCount");
    const listEl = document.getElementById("cartItemsList");
    const totalEl = document.getElementById("cartTotalPrice");

    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    countEl.innerText = totalCount;
    totalEl.innerText = `₹${totalPrice}`;

    if (cart.length === 0) {
        listEl.innerHTML = `<p class="text-gray-500 text-center py-8">Your cart is empty.</p>`;
        return;
    }

    listEl.innerHTML = cart.map(item => `
        <div class="flex justify-between items-center border-b pb-3">
            <div>
                <h4 class="font-bold text-sm">${item.name}</h4>
                <p class="text-xs text-gray-500">₹${item.price} x ${item.qty}</p>
            </div>
            <div class="flex items-center space-x-2">
                <button onclick="changeQty(${item.id}, -1)" class="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold">-</button>
                <span class="text-sm font-semibold">${item.qty}</span>
                <button onclick="changeQty(${item.id}, 1)" class="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold">+</button>
            </div>
        </div>
    `).join('');
}

function changeQty(id, delta) {
    const item = cart.find(c => c.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(c => c.id !== id);
    }
    updateCartUI();
}

// Checkout & Submit Order
document.getElementById("checkoutBtn").addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    if (!currentUser) {
        alert("Please enter your name first!");
        return;
    }

    const staffroom = document.getElementById("staffroomSelect").value;
    const notes = document.getElementById("deliveryNotes").value.trim();

    const newOrder = {
        id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
        userId: currentUser.userId, // Bound strictly to User ID
        teacherName: currentUser.name,
        location: staffroom,
        notes: notes,
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
        status: "Received",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let orders = JSON.parse(localStorage.getItem("commfest_orders") || "[]");
    orders.unshift(newOrder);
    localStorage.setItem("commfest_orders", JSON.stringify(orders));

    cart = [];
    document.getElementById("deliveryNotes").value = "";
    updateCartUI();
    document.getElementById("cartModal").classList.add("hidden");
    alert("Order placed successfully! Student runners have been notified.");
    renderActiveOrders();
});

function renderActiveOrders() {
    const container = document.getElementById("activeOrdersList");
    if (!currentUser) {
        container.innerHTML = `<p class="text-gray-500 text-sm">Log in with your name above to view your private order history.</p>`;
        return;
    }

    const orders = JSON.parse(localStorage.getItem("commfest_orders") || "[]");
    
    // STRICT PRIVACY FILTER: Only show orders matching this specific User ID
    const myOrders = orders.filter(o => o.userId === currentUser.userId);

    if (myOrders.length === 0) {
        container.innerHTML = `<p class="text-gray-500 text-sm">No active or past orders found for ${currentUser.name}.</p>`;
        return;
    }

    container.innerHTML = myOrders.map(order => `
        <div class="border rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md">${order.id}</span>
                    <span class="text-xs text-gray-400"><i class="fa-regular fa-clock"></i> ${order.time}</span>
                </div>
                <h4 class="font-bold text-gray-900">${order.location}</h4>
                <p class="text-xs text-gray-600 mt-0.5">${order.items.map(i => `${i.qty}x${i.name}`).join(', ')}</p>
                ${order.notes ? `<p class="text-[11px] text-gray-500 italic mt-1"><i class="fa-solid fa-note-sticky"></i> "${order.notes}"</p>` : ''}
            </div>
            <div class="flex items-center gap-3">
                <span class="px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'En Route' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'Preparing' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                }">${order.status}</span>
                <span class="font-bold text-orange-600 text-base">₹${order.total}</span>
            </div>
        </div>
    `).join('');
}

// Event Listeners
document.getElementById("cartBtn").addEventListener("click", () => document.getElementById("cartModal").classList.remove("hidden"));
document.getElementById("closeCartBtn").addEventListener("click", () => document.getElementById("cartModal").classList.add("hidden"));
document.getElementById("searchInput").addEventListener("input", (e) => renderMenu("all", e.target.value));

document.querySelectorAll(".cat-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".cat-btn").forEach(b => {
            b.classList.remove("bg-orange-600", "text-white", "shadow");
            b.classList.add("bg-white", "text-gray-600", "border");
        });
        e.target.classList.remove("bg-white", "text-gray-600", "border");
        e.target.classList.add("bg-orange-600", "text-white", "shadow");
        renderMenu(e.target.dataset.category);
    });
});

window.addEventListener("storage", () => {
    renderActiveOrders();
    renderMenu();
});

initUserSession();
renderMenu();