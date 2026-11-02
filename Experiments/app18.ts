
type Farmer = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

type Product = {
  id: number;
  owner: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  image: string;
};

type Order = {
  id: number;
  buyer: string;
  productId: number;
  productName: string;
  seller: string;
  quantity: number;
  total: number;
  status: string;
  shipping: string;
};

const farmers: Farmer[] = [];
const products: Product[] = [];
const orders: Order[] = [];

let currentFarmer = "";
let pendingEmail = "";
let demoOTP = "";

function get<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

function show(id: string): void {
  document.querySelectorAll("main section").forEach(s =>
    s.classList.add("hidden")
  );
  get(id).classList.remove("hidden");
  if (id === "shop") renderProducts();
  if (id === "dashboard") renderDashboard();
}

function registerFarmer(): void {
  const name = get<HTMLInputElement>("regName").value.trim();
  const email = get<HTMLInputElement>("regEmail").value.trim().toLowerCase();
  const phone = get<HTMLInputElement>("regPhone").value.trim();
  const password = get<HTMLInputElement>("regPass").value;

  if (!name || !email || !phone || !password) {
    get("regMsg").textContent = "Please fill in all fields.";
    return;
  }

  if (farmers.some(f => f.email === email)) {
    get("regMsg").textContent = "This email is already registered.";
    return;
  }

  farmers.push({ name, email, phone, password });
  get("regMsg").textContent =
    "Registration successful. Please log in to continue.";
}

function loginFarmer(): void {
  const email = get<HTMLInputElement>("loginEmail").value.trim().toLowerCase();
  const password = get<HTMLInputElement>("loginPass").value;
  const farmer = farmers.find(f => f.email === email && f.password === password);

  if (!farmer) {
    get("loginMsg").textContent = "Invalid email or password.";
    return;
  }

  pendingEmail = email;
  demoOTP = String(Math.floor(100000 + Math.random() * 900000));
  get("otpArea").classList.remove("hidden");
  get("otpMessage").textContent = `Demo OTP: ${demoOTP}`;
  get("loginMsg").textContent = "Enter the OTP to finish login.";
}

function verifyOTP(): void {
  const entered = get<HTMLInputElement>("otpInput").value.trim();

  if (!demoOTP || entered !== demoOTP) {
    get("loginMsg").textContent = "Incorrect OTP.";
    return;
  }

  currentFarmer = pendingEmail;
  demoOTP = "";
  get("loginMsg").textContent = "Login successful.";
  show("dashboard");
}

function logout(): void {
  currentFarmer = "";
  pendingEmail = "";
  show("shop");
}

function addProduct(): void {
  if (!currentFarmer) {
    alert("Please log in first.");
    show("login");
    return;
  }

  const name = get<HTMLInputElement>("pName").value.trim();
  const category = get<HTMLSelectElement>("pCategory").value;
  const description = get<HTMLTextAreaElement>("pDescription").value.trim();
  const price = Number(get<HTMLInputElement>("pPrice").value);
  const stock = Number(get<HTMLInputElement>("pStock").value);
  const file = get<HTMLInputElement>("pImage").files?.[0];

  if (!name || !description || price <= 0 ||
      !Number.isFinite(price) || !Number.isInteger(stock) || stock < 0) {
    alert("Enter valid product details, price, and stock.");
    return;
  }

  const saveProduct = (image: string): void => {
    products.push({
      id: Date.now(),
      owner: currentFarmer,
      name, category, description, price, stock, image
    });
    renderProducts();
    renderDashboard();
    alert("Product added successfully.");
  };

  if (file) {
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => saveProduct(String(reader.result));
    reader.readAsDataURL(file);
  } else {
    saveProduct("");
  }
}

function renderProducts(): void {
  const list = get("productList");
  list.innerHTML = "";

  const query = get<HTMLInputElement>("search").value.toLowerCase();
  const category = get<HTMLSelectElement>("category").value;

  products
    .filter(p =>
      p.name.toLowerCase().includes(query) &&
      (!category || p.category === category) &&
      p.stock > 0
    )
    .forEach(p => {
      const card = document.createElement("div");
      card.className = "product";

      if (p.image) {
        const img = document.createElement("img");
        img.src = p.image;
        img.alt = p.name;
        card.appendChild(img);
      }

      const title = document.createElement("h3");
      title.textContent = p.name;

      const details = document.createElement("p");
      details.textContent =
        `${p.category} | ₹${p.price} | Stock: ${p.stock}`;

      const description = document.createElement("p");
      description.textContent = p.description;

      const seller = document.createElement("small");
      seller.textContent = `Seller: ${p.owner}`;

      const quantity = document.createElement("input");
      quantity.type = "number";
      quantity.min = "1";
      quantity.max = String(p.stock);
      quantity.value = "1";
      quantity.setAttribute("aria-label", `Quantity for ${p.name}`);

      const buy = document.createElement("button");
      buy.className = "action";
      buy.textContent = "Place Demo Order";
      buy.onclick = () => placeOrder(p.id, Number(quantity.value));

      card.append(title, details, description, seller, quantity, buy);
      list.appendChild(card);
    });

  if (!list.children.length) {
    list.textContent = "No products available. Farmers can add products after login.";
  }
}

function placeOrder(productId: number, quantity: number): void {
  if (!currentFarmer) {
    alert("Register and log in as a farmer to place a demo order.");
    show("register");
    return;
  }

  const p = products.find(item => item.id === productId);
  if (!p || !Number.isInteger(quantity) || quantity < 1 ||
      quantity > p.stock || p.owner === currentFarmer) {
    alert("Invalid quantity, unavailable stock, or you cannot order your own product.");
    return;
  }

  p.stock -= quantity;
  orders.push({
    id: Date.now(),
    buyer: currentFarmer,
    productId: p.id,
    productName: p.name,
    seller: p.owner,
    quantity,
    total: p.price * quantity,
    status: "Order Placed",
    shipping: "Not Shipped"
  });

  renderProducts();
  renderDashboard();
  alert("Demo order placed. No payment was processed.");
}

function renderDashboard(): void {
  const welcome = get("welcome");
  const myProducts = get("myProducts");
  const myOrders = get("myOrders");

  if (!currentFarmer) {
    welcome.textContent = "Please log in to access farmer features.";
    myProducts.innerHTML = "";
    myOrders.innerHTML = "";
    return;
  }

  const farmer = farmers.find(f => f.email === currentFarmer);
  welcome.textContent = `Welcome, ${farmer?.name ?? currentFarmer}`;

  myProducts.innerHTML = "";
  products.filter(p => p.owner === currentFarmer).forEach(p => {
    const card = document.createElement("div");
    card.className = "product";

    const title = document.createElement("h3");
    title.textContent = p.name;

    const details = document.createElement("p");
    details.textContent = `₹${p.price} | Stock: ${p.stock}`;

    const edit = document.createElement("button");
    edit.className = "action";
    edit.textContent = "Update";
    edit.onclick = () => updateProduct(p.id);

    const remove = document.createElement("button");
    remove.className = "action remove";
    remove.textContent = "Delete";
    remove.onclick = () => deleteProduct(p.id);

    card.append(title, details, edit, remove);
    myProducts.appendChild(card);
  });

  myOrders.innerHTML = "";
  const related = orders.filter(o =>
    o.buyer === currentFarmer || o.seller === currentFarmer
  );

  if (!related.length) {
    myOrders.textContent = "No orders or sales yet.";
  }

  related.forEach(order => {
    const card = document.createElement("div");
    card.className = "card";

    const info = document.createElement("p");
    info.textContent =
      `Order #${order.id}: ${order.productName}, quantity ${order.quantity}, ` +
      `total ₹${order.total}. Order status: ${order.status}. Shipping: ${order.shipping}.`;

    card.appendChild(info);

    if (order.seller === currentFarmer) {
      const status = document.createElement("select");
      ["Order Placed", "Processing", "Accepted", "Cancelled"].forEach(s => {
        const option = document.createElement("option");
        option.value = s;
        option.textContent = s;
        status.appendChild(option);
      });
      status.value = order.status;
      status.onchange = () => {
        order.status = status.value;
        renderDashboard();
      };

      const shipping = document.createElement("select");
      ["Not Shipped", "Shipped", "In Transit", "Delivered"].forEach(s => {
        const option = document.createElement("option");
        option.value = s;
        option.textContent = s;
        shipping.appendChild(option);
      });
      shipping.value = order.shipping;
      shipping.onchange = () => {
        order.shipping = shipping.value;
        renderDashboard();
      };

      card.append("Update order status: ", status, " Shipping status: ", shipping);
    }

    myOrders.appendChild(card);
  });
}

function updateProduct(id: number): void {
  const p = products.find(item => item.id === id && item.owner === currentFarmer);
  if (!p) return;

  const price = prompt("Enter new price:", String(p.price));
  const stock = prompt("Enter new stock:", String(p.stock));
  const name = prompt("Enter product name:", p.name);

  if (price === null || stock === null || name === null) return;

  const newPrice = Number(price);
  const newStock = Number(stock);

  if (!name.trim() || !Number.isFinite(newPrice) || newPrice <= 0 ||
      !Number.isInteger(newStock) || newStock < 0) {
    alert("Invalid product details.");
    return;
  }

  p.name = name.trim();
  p.price = newPrice;
  p.stock = newStock;
  renderProducts();
  renderDashboard();
}

function deleteProduct(id: number): void {
  const index = products.findIndex(p =>
    p.id === id && p.owner === currentFarmer
  );
  if (index < 0) return;

  if (confirm("Delete this product?")) {
    products.splice(index, 1);
    renderProducts();
    renderDashboard();
  }
}

renderProducts();
