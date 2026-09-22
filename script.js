// Telegram WebApp
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Theme adaptation
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2563eb');
document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f1f5f9');

// User greeting
const user = tg.initDataUnsafe?.user;
if (user) {
    document.getElementById('userGreeting').textContent = 
        `Салом, ${user.first_name}! Маҳсулотро интихоб кунед`;
}

// Products
const products = [
    { id: 1, name: "Смартфон Galaxy Pro", price: 4590, category: "electronics", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80" },
    { id: 2, name: "Гӯшмонак AirSound", price: 890, category: "electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80" },
    { id: 3, name: "Соати FitLife 5", price: 1290, category: "electronics", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80" },
    { id: 4, name: "Куртаи классикӣ", price: 450, category: "clothes", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80" },
    { id: 5, name: "Кроссовка SportMax", price: 780, category: "clothes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
    { id: 6, name: "Лампаи LED", price: 340, category: "home", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80" },
    { id: 7, name: "Кӯрпаи премиум", price: 560, category: "home", image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=400&q=80" },
    { id: 8, name: "Китоби муваффақият", price: 120, category: "home", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80" }
];

let cart = [];
let currentCategory = "all";

// Render products
function renderProducts() {
    const list = document.getElementById('productList');
    const filtered = currentCategory === "all" 
        ? products 
        : products.filter(p => p.category === currentCategory);

    list.innerHTML = filtered.map(p => `
        <div class="product-card">
            <img src="${p.image}" alt="${p.name}">
            <div class="product-info">
                <h3>${p.name}</h3>
                <div class="product-price">${p.price.toLocaleString()} TJS</div>
                <button class="add-btn" onclick="addToCart(${p.id})">Илова кардан</button>
            </div>
        </div>
    `).join('');
}

// Cart functions
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    
    updateCart();
    tg.HapticFeedback.impactOccurred('light');
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

function updateCart() {
    const count = cart.reduce((sum, i) => sum + i.qty, 0);
    document.getElementById('cartCount').textContent = count;

    const itemsEl = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');

    if (cart.length === 0) {
        itemsEl.innerHTML = '<p class="empty">Сабад холӣ аст</p>';
        totalEl.textContent = '0 TJS';
        return;
    }

    itemsEl.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.price.toLocaleString()} TJS × ${item.qty}</p>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">×</button>
        </div>
    `).join('');

    const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    totalEl.textContent = total.toLocaleString() + ' TJS';
}

// Categories
document.querySelectorAll('.cat-item').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.cat;
        renderProducts();
    });
});

// Cart modal
document.getElementById('cartBtn').addEventListener('click', () => {
    document.getElementById('cartModal').classList.add('open');
});

document.getElementById('closeCart').addEventListener('click', () => {
    document.getElementById('cartModal').classList.remove('open');
});

// Order button — send data to bot
document.getElementById('orderBtn').addEventListener('click', () => {
    if (cart.length === 0) {
        tg.showAlert('Сабад холӣ аст!');
        return;
    }

    const order = {
        items: cart.map(i => ({
            name: i.name,
            price: i.price,
            qty: i.qty
        })),
        total: cart.reduce((sum, i) => sum + (i.price * i.qty), 0)
    };

    // Send data back to the bot
    tg.sendData(JSON.stringify(order));
    
    // Or close the app
    // tg.close();
});

// Init
renderProducts();
updateCart();
