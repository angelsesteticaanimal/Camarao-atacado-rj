const PRODUCTS = {
  shrimp: {
    name: "Camarão descascado",
    price: 55,
    checkbox: document.querySelector("#shrimpSelected"),
    quantity: document.querySelector("#shrimpQty"),
    row: document.querySelector("#shrimpRow")
  },
  tilapia: {
    name: "Filé de tilápia pequena sem espinha",
    price: 32.99,
    checkbox: document.querySelector("#tilapiaSelected"),
    quantity: document.querySelector("#tilapiaQty"),
    row: document.querySelector("#tilapiaRow")
  }
};

const MINIMUM_KG = 50;
const WHATSAPP_NUMBER = "5522920020824";
const totalElement = document.querySelector("#estimatedTotal");
const noteElement = document.querySelector("#estimateNote");
const form = document.querySelector("#orderForm");
const warningElement = document.querySelector("#formWarning");

const money = value =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);

function normalizedQuantity(productKey) {
  const product = PRODUCTS[productKey];
  const value = Number(product.quantity.value || MINIMUM_KG);
  return Math.max(MINIMUM_KG, Math.round(value));
}

function setProductActive(productKey, active) {
  const product = PRODUCTS[productKey];
  product.checkbox.checked = active;
  product.row.classList.toggle("active", active);
  if (active) {
    product.quantity.value = normalizedQuantity(productKey);
  }
  updateEstimate();
}

function selectedProducts() {
  return Object.entries(PRODUCTS)
    .filter(([, product]) => product.checkbox.checked)
    .map(([key, product]) => ({
      key,
      name: product.name,
      price: product.price,
      quantity: normalizedQuantity(key),
      subtotal: product.price * normalizedQuantity(key)
    }));
}

function updateEstimate() {
  Object.entries(PRODUCTS).forEach(([key, product]) => {
    product.row.classList.toggle("active", product.checkbox.checked);
    if (product.checkbox.checked) {
      product.quantity.value = normalizedQuantity(key);
    }
  });

  const selected = selectedProducts();

  if (!selected.length) {
    totalElement.textContent = "Selecione um produto";
    noteElement.textContent = "Frete e condições comerciais serão confirmados pelo WhatsApp.";
    return;
  }

  const total = selected.reduce((sum, product) => sum + product.subtotal, 0);
  totalElement.textContent = `A partir de ${money(total)}`;

  if (selected.length === 1) {
    noteElement.textContent =
      `${selected[0].quantity} kg de ${selected[0].name}. Frete não incluído.`;
  } else {
    noteElement.textContent =
      `${selected.map(item => `${item.quantity} kg de ${item.name}`).join(" + ")}. Frete não incluído.`;
  }
}

function baseMessage() {
  const params = new URLSearchParams(window.location.search);
  const source = params.get("utm_source") || "site";
  const campaign = params.get("utm_campaign") || "acesso_direto";

  return [
    "Olá! Gostaria de informações sobre os produtos Santos Alhos no atacado.",
    "",
    "• Camarão descascado: a partir de R$ 55,00/kg",
    "• Filé de tilápia pequena sem espinha: a partir de R$ 32,99/kg",
    "• Pedido mínimo: 50 kg por produto",
    "",
    `Origem do contato: ${source} / ${campaign}`
  ].join("\n");
}

document.querySelectorAll("[data-whatsapp-link]").forEach(link => {
  link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(baseMessage())}`;
});

document.querySelectorAll("[data-select-product]").forEach(button => {
  button.addEventListener("click", () => {
    const key = button.dataset.selectProduct;
    setProductActive(key, true);
    document.querySelector("#pedido").scrollIntoView({ behavior: "smooth" });
  });
});

Object.entries(PRODUCTS).forEach(([key, product]) => {
  product.checkbox.addEventListener("change", updateEstimate);
  product.quantity.addEventListener("input", updateEstimate);
  product.quantity.addEventListener("blur", () => {
    product.quantity.value = normalizedQuantity(key);
    updateEstimate();
  });
});

document.querySelectorAll("[data-plus]").forEach(button => {
  button.addEventListener("click", event => {
    event.preventDefault();
    const key = button.dataset.plus;
    const product = PRODUCTS[key];
    setProductActive(key, true);
    product.quantity.value = normalizedQuantity(key) + 10;
    updateEstimate();
  });
});

document.querySelectorAll("[data-minus]").forEach(button => {
  button.addEventListener("click", event => {
    event.preventDefault();
    const key = button.dataset.minus;
    const product = PRODUCTS[key];
    setProductActive(key, true);
    product.quantity.value = Math.max(MINIMUM_KG, normalizedQuantity(key) - 10);
    updateEstimate();
  });
});

form.addEventListener("submit", event => {
  event.preventDefault();
  warningElement.textContent = "";

  const selected = selectedProducts();

  if (!selected.length) {
    warningElement.textContent = "Selecione pelo menos um produto antes de enviar.";
    document.querySelector("#pedido").scrollIntoView({ behavior: "smooth" });
    return;
  }

  const data = new FormData(form);
  const total = selected.reduce((sum, product) => sum + product.subtotal, 0);
  const params = new URLSearchParams(window.location.search);

  const productLines = selected.map(product =>
    `• ${product.name}: ${product.quantity} kg — valor inicial ${money(product.subtotal)}`
  );

  const message = [
    "Olá! Quero solicitar um orçamento no atacado.",
    "",
    "PRODUTOS:",
    ...productLines,
    `Valor inicial estimado: ${money(total)}`,
    "",
    `Estabelecimento/empresa: ${data.get("business")}`,
    `Responsável: ${data.get("contact")}`,
    `Telefone: ${data.get("phone")}`,
    `Cidade: ${data.get("city")}`,
    `Bairro: ${data.get("district")}`,
    `Data desejada: ${data.get("deliveryDate")}`,
    `Frequência: ${data.get("frequency")}`,
    `Observações: ${data.get("notes") || "Não informado"}`,
    "",
    "Estou ciente de que os preços são anunciados 'a partir de' e aguardo a confirmação de disponibilidade, embalagem, peso líquido, frete, prazo e valor final.",
    `Campanha: ${params.get("utm_campaign") || "acesso_direto"}`
  ].join("\n");

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener"
  );
});

document.querySelector("#year").textContent = new Date().getFullYear();
updateEstimate();
