// main.js

document.addEventListener("DOMContentLoaded", () => {
  const sizeSelect = document.getElementById("perfume-size");
  const bottleSelect = document.getElementById("bottle-type");
  const alcoholSelect = document.getElementById("alcohol-type");
  //const perfumemaleselect = document.getElementById("male-perfumes");
  // const perfumefemaleselect = document.getElementById("female-perfumes");
  const packagingSelect = document.getElementById("packaging-select");
  const customPerfumePrice = document.getElementById("custom-perfume-price");

  const summarySize = document.getElementById("summary-size");
  const summaryBottle = document.getElementById("summary-bottle");
  const summaryAlcohol = document.getElementById("summary-alcohol");
  const summaryPackaging = document.getElementById("summary-packaging");
  //const summaryPerfume = document.getElementById("summary-perfume");

  const totalPriceElement = document.getElementById("total-price");
  const checkoutBtn = document.getElementById("checkout-button");
  const customerForm = document.getElementById("customer-form");
  const submitOrder = document.getElementById("submit-order");

  // function getSelectedPerfumeName() {
  //   const male = perfumemaleselect.value;
  //   const female = perfumefemaleselect.value;
  //   return male || female || "No perfume selected";
  // }

  function updateSummary() {
    const sizePrice = parseInt(sizeSelect?.selectedOptions[0]?.dataset.price || 0);
    const bottlePrice = parseInt(bottleSelect?.selectedOptions[0]?.dataset.price || 0);
    const alcoholPrice = parseInt(alcoholSelect?.selectedOptions[0]?.dataset.price || 0);
    const packagingPrice = parseInt(packagingSelect?.selectedOptions[0]?.dataset.price || 0);
    const customPerfume = parseInt(customPerfumePrice?.value || 0);

    const total = sizePrice + bottlePrice + alcoholPrice + packagingPrice + customPerfume;

    summarySize.textContent = "Size: " + (sizeSelect.value || "---");
    summaryBottle.textContent = "Bottle: " + (bottleSelect.value || "---");
    summaryAlcohol.textContent = "Alcohol: " + (alcoholSelect.value || "---");
    summaryPackaging.textContent = "Packaging: " + (packagingSelect.value || "---");
    // summaryPerfume.textContent = "Perfume: " + getSelectedPerfumeName();
    totalPriceElement.textContent = `Total Price: ${total} EGP`;
  }

  [sizeSelect, bottleSelect, alcoholSelect, packagingSelect, /*perfumemaleselect, perfumefemaleselect8*/, customPerfumePrice]
    .forEach(el => el?.addEventListener("change", updateSummary));

  checkoutBtn?.addEventListener("click", () => {
    customerForm.style.display = "block";
    checkoutBtn.style.display = "none";
  });

  submitOrder?.addEventListener("click", async () => {
    const name = document.getElementById("customer-name")?.value;
    const phone = document.getElementById("customer-phone")?.value;
    const address = document.getElementById("customer-address")?.value;

    if (!name || !phone || !address) {
      alert("يرجى ملء كل البيانات");
      return;
    }

    // const perfume = getSelectedPerfumeName();
    const size = sizeSelect.value;
    const bottle = bottleSelect.value;
    const alcohol = alcoholSelect.value;
    const packaging = packagingSelect.value;
    const perfumeBasePrice = parseInt(customPerfumePrice?.value || 0);

    const sizePrice = parseInt(sizeSelect?.selectedOptions[0]?.dataset.price || 0);
    const bottlePrice = parseInt(bottleSelect?.selectedOptions[0]?.dataset.price || 0);
    const alcoholPrice = parseInt(alcoholSelect?.selectedOptions[0]?.dataset.price || 0);
    const packagingPrice = parseInt(packagingSelect?.selectedOptions[0]?.dataset.price || 0);

    const total = sizePrice + bottlePrice + alcoholPrice + packagingPrice + perfumeBasePrice;

    document.getElementById("order-summary").innerHTML = `
      <h2>Order Summary</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>Size:</strong> ${size}</p>
      <p><strong>Bottle Type:</strong> ${bottle}</p>
      <p><strong>perfume:</strong> ${alcohol}</p>
      <p><strong>perfume:</strong> ${packaging}</p>
      <p><strong>Base Perfume Price:</strong> ${perfumeBasePrice} EGP</p>
      <h3>Total: ${total} EGP</h3>
    `;

    const message = encodeURIComponent(`🧾 Order Summary\n--------------------\n👤 Name: ${name}\n📞 Phone: ${phone}\n📍 Address: ${address}\n📦 Size: ${size}\n🍾 Bottle: ${bottle}\n💧 Perfume: ${alcohol}\n🎁 Perfume: ${packaging}\n💰 Total: ${total} EGP`);
    const whatsappURL = `https://wa.me/20${phone}?text=${message}`;
    window.open(whatsappURL, "_blank");

    const scriptURL = 'https://script.google.com/macros/s/AKfycbx7TqC9H4DTscjnfP461SDu0jseAQ8If0yAFGzu90ffBwky4WmPKii3OmeK7D5jEl9FXw/exec';

console.log({ 
  name,
  phone,
  address,
  size,
  bottle,
  alcohol,
  // perfume,
  packaging,
  total
});

    try {
      await fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify({
  name,
  phone,
  address,
  size,
  bottle,
  alcohol,
  packaging,
  // perfume, // ← ده التعديل الصح
  total
}),


        headers: { 'Content-Type': 'application/json' },
        redirect: 'follow',
        mode: 'no-cors'
      });

      alert("✅ تم إرسال الطلب بنجاح!");
      document.getElementById("customer-form").reset();
    } catch (error) {
      alert("❌ حصل خطأ، حاول تاني.");
      console.error("Error:", error);
    }
  });

  updateSummary();
});
