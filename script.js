let cart = [];
let allProducts = [];

// Load products from JSON
fetch('products.json')
    .then(r => r.json())
    .then(data => {
        allProducts = data.products;
        renderProducts('all');
        handleProductURL();
    });

const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
});

function toggleMobileNav() {
    document.getElementById('mobileNav').classList.toggle('open');
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
}

function openCart() {
    document.getElementById('cartSidebar').classList.add('open');
    document.getElementById('cartOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('show');
    document.body.style.overflow = '';
}

function addToCart(name, price) {
    cart.push({ name, price });
    updateCart();
    showToast('Added — ' + name);
}

function updateCart() {
    document.getElementById('cartCount').textContent = cart.length;
    const el = document.getElementById('cartItems');
    let total = 0;

    if (cart.length === 0) {
        el.innerHTML = `
            <div class="cart-empty">
                <span class="cart-empty-icon">🖼</span>
                <p>Your cart is empty</p>
            </div>`;
    } else {
        el.innerHTML = '';
        cart.forEach((item, i) => {
            total += item.price;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">Rs ${item.price.toLocaleString()}</div>
                </div>
                <button class="cart-item-del" onclick="removeItem(${i})">✕</button>`;
            el.appendChild(div);
        });
    }

    document.getElementById('cartTotal').textContent = 'Rs ' + total.toLocaleString();
}

function removeItem(i) {
    const name = cart[i].name;
    cart.splice(i, 1);
    updateCart();
    showToast('Removed — ' + name);
}

function sendWhatsAppOrder() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    let msg = '🎨 *Aasath Art Order*%0A%0A';
    let total = 0;
    cart.forEach((item, i) => {
        msg += `${i + 1}. ${item.name} — Rs ${item.price.toLocaleString()}%0A`;
        total += item.price;
    });
    msg += `%0A*Total: Rs ${total.toLocaleString()}*%0A%0APlease confirm my order. Thank you!`;
    window.open('https://wa.me/94773503720?text=' + msg, '_blank');
}

function renderProducts(category = 'all', searchVal = '') {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';

    const filtered = allProducts.filter(p => {
        const matchCategory = category === 'all' || p.category === category;
        const matchSearch = p.name.toLowerCase().includes(searchVal.toLowerCase());
        return matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
        document.getElementById('noResults').style.display = 'block';
        return;
    }

    document.getElementById('noResults').style.display = 'none';

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = `product-card ${product.category}`;
        card.onclick = () => openProduct(product);
        card.innerHTML = `
            <div class="card-img">
                <img src="${product.images[0]}" alt="${product.name}">
                <div class="card-overlay">View Details</div>
                <span class="card-tag">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</span>
            </div>
            <div class="card-body">
                <div class="card-info">
                    <h3>${product.name}</h3>
                    <span class="card-medium">${product.medium}</span>
                </div>
                <div class="card-foot">
                    <span class="card-price">Rs ${product.price.toLocaleString()}</span>
                    <button class="card-add" onclick="event.stopPropagation(); addToCart('${product.name}', ${product.price})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterProducts(category, btn) {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    document.getElementById('searchInput').value = '';
    renderProducts(category, '');
}

document.getElementById('searchInput').addEventListener('input', function () {
    renderProducts('all', this.value);
});

function openProduct(product) {
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalPrice').textContent = 'Rs ' + product.price.toLocaleString();
    document.getElementById('modalDesc').textContent = product.description;
    document.getElementById('modalMainImg').src = product.images[0];

    const thumbs = document.getElementById('modalThumbs');
    thumbs.innerHTML = '';
    product.images.forEach((src, i) => {
        const img = document.createElement('img');
        img.src = src;
        if (i === 0) img.classList.add('active');
        img.onclick = () => {
            document.getElementById('modalMainImg').src = src;
            thumbs.querySelectorAll('img').forEach(t => t.classList.remove('active'));
            img.classList.add('active');
        };
        thumbs.appendChild(img);
    });

    document.getElementById('modalAddBtn').onclick = () => {
        addToCart(product.name, product.price);
        closeProduct();
    };

    document.getElementById('productModal').classList.add('show');
    document.getElementById('modalBackdrop').classList.add('show');
    document.body.style.overflow = 'hidden';

    // Update URL
    window.history.pushState(null, null, `?product=${product.id}`);
}

function closeProduct() {
    document.getElementById('productModal').classList.remove('show');
    document.getElementById('modalBackdrop').classList.remove('show');
    document.body.style.overflow = '';
    window.history.pushState(null, null, '?');
}

function handleProductURL() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('product');
    
    if (productId) {
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            setTimeout(() => openProduct(product), 100);
        }
    }
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeProduct(); closeCart(); }
});

updateCart();
