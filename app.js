const PRICE_PER_KG = 55;
const MINIMUM_KG = 50;
const WHATSAPP_NUMBER = "5521996313915";

const quantityInput = document.querySelector("#quantity");
const totalElement = document.querySelector("#estimatedTotal");
const orderForm = document.querySelector("#orderForm");

const money = value =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

function quantityValue() {
  const value = Number(quantityInput.value || MINIMUM_KG);
  return Math.max(MINIMUM_KG, Math.round(value));
}

function updateTotal() {
  const quantity = quantityValue();
  quantityInput.value = quantity;
  totalElement.textContent = money(quantity * PRICE_PER_KG);
}

function generalMessage() {
  const query = new URLSearchParams(location.search);
  const source = query.get("utm_source") || "site";
  const campaign = query.get("utm_campaign") || "acesso_direto";
  return [
    "Olá! Gostaria de solicitar um orçamento de camarão descascado no atacado.",
    "Preço anunciado: a partir de R$ 55,00/kg.",
    "Pedido mínimo: 50 kg.",
    `Origem: ${source} / ${campaign}.`
  ].join("\n");
}

document.querySelectorAll("[data-whatsapp-link]").forEach(link => {
  link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(generalMessage())}`;
});

document.querySelector("#minus").addEventListener("click", () => {
  quantityInput.value = Math.max(MINIMUM_KG, quantityValue() - 10);
  updateTotal();
});

document.querySelector("#plus").addEventListener("click", () => {
  quantityInput.value = quantityValue() + 10;
  updateTotal();
});

quantityInput.addEventListener("input", updateTotal);
quantityInput.addEventListener("blur", updateTotal);

orderForm.addEventListener("submit", event => {
  event.preventDefault();

  const form = new FormData(orderForm);
  const quantity = quantityValue();
  const total = quantity * PRICE_PER_KG;
  const query = new URLSearchParams(location.search);

  const message = [
    "Olá! Quero solicitar um orçamento de camarão descascado no atacado.",
    "",
    `Estabelecimento/empresa: ${form.get("business")}`,
    `Responsável: ${form.get("contact")}`,
    `Telefone: ${form.get("phone")}`,
    `Cidade: ${form.get("city")}`,
    `Bairro: ${form.get("district")}`,
    `Quantidade: ${quantity} kg`,
    `Valor inicial estimado do produto: a partir de ${money(total)}`,
    `Data desejada: ${form.get("deliveryDate")}`,
    `Tipo de compra: ${form.get("frequency")}`,
    `Observações: ${form.get("notes") || "Não informado"}`,
    "",
    "Estou ciente de que o preço anunciado é a partir de R$ 55,00/kg e aguardo a confirmação de disponibilidade, calibre, embalagem, peso líquido, frete, prazo e valor final.",
    `Campanha: ${query.get("utm_campaign") || "acesso_direto"}`
  ].join("\n");

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
});

document.querySelector("#year").textContent = new Date().getFullYear();
updateTotal();
