const user = JSON.parse(localStorage.getItem('user'));
let currentOrderPrice = 0;

if (document.getElementById('userSpan') && user) {
    document.getElementById('userSpan').innerText = "Hello, " + user.name + " | ";
}

// --- PRODUCT LOADING ---
if (document.getElementById('product-grid')) {
    fetch('/api/products')
        .then(res => res.json())
        .then(data => {
            const grid = document.getElementById('product-grid');
            data.forEach(p => {
                grid.innerHTML += `
                    <div class="card">
                        <img src="${p.image_url}">
                        <div class="card-body">
                            <h3>${p.name}</h3>
                            <p style="font-weight:bold; color:red">$${p.price}</p>
                            <button class="btn" onclick="openPayment(${p.price})">Add to Order</button>
                        </div>
                    </div>`;
            });
        });
}

// --- AUTH LOGIC ---
async function authLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('pass').value;
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = data.user.role === 'admin' ? 'admin.html' : 'index.html';
    } else { alert(data.error); }
}

// --- ORDER LOGIC ---
function openPayment(price) {
    if (!user) return window.location.href = 'login.html';
    currentOrderPrice = price;
    document.getElementById('amount').innerText = price;
    document.getElementById('payModal').style.display = 'block';
}

function closeModal() { document.getElementById('payModal').style.display = 'none'; }

async function processPayment() {
    const cardNum = document.getElementById('cardNumber').value;
    if (cardNum.length < 16) return alert("Enter valid 16-digit pseudo card!");
    
    await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: user.name, total: currentOrderPrice })
    });
    alert("Payment Received! Food on the way!");
    closeModal();
}

// --- ADMIN DASHBOARD ---
if (document.getElementById('admin-orders')) {
    fetch('/api/orders').then(res => res.json()).then(data => {
        const body = document.getElementById('admin-orders');
        data.forEach(o => {
            body.innerHTML += `<tr><td>#${o.id}</td><td>${o.user_name}</td><td>$${o.total_amount}</td><td>${o.status}</td><td>${o.order_date}</td></tr>`;
        });
    });
}

function logout() { localStorage.clear(); window.location.href = 'login.html'; }