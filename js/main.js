// perfume options for men and women
const scents = {
  men: ["Sauvage", "Bleu de Chanel", "Creed Aventus", "Dior Homme"],
  women: ["J'adore", "La Vie Est Belle", "Chanel No.5", "Good Girl"]
};

// elements
const sizeSelect = document.getElementById("perfume-size");
const bottleSelect = document.getElementById("bottle-type");
const alcoholSelect = document.getElementById("alcohol-type");
const genderSelect = document.getElementById("gender-select");
const scentSelect = document.getElementById("scent-select");
const packagingSelect = document.getElementById("packaging-select");

const summarySize = document.getElementById("summary-size");
const summaryBottle = document.getElementById("summary-bottle");
const summaryAlcohol = document.getElementById("summary-alcohol");
const summaryScent = document.getElementById("summary-scent");
const summaryPackaging = document.getElementById("summary-packaging");

const totalPriceElement = document.getElementById("total-price");
const checkoutBtn = document.getElementById("checkout-button");
const customerForm = document.getElementById("customer-form");
const submitOrder = document.getElementById("submit-order");


function updateScentOptions() {
  const selectedGender = genderSelect.value;
  scentSelect.innerHTML = '<option value="" disabled selected>Select a scent</option>';
  if (selectedGender && scents[selectedGender]) {
    scents[selectedGender].forEach((scent) => {
      const option = document.createElement("option");
      option.value = scent;
      option.textContent = scent;
      scentSelect.appendChild(option);
    });
  }
}

function updateSummary() {
  summarySize.textContent = "Size: " + (sizeSelect.value || "---");
  summaryBottle.textContent = "Bottle: " + (bottleSelect.value || "---");
  summaryAlcohol.textContent = "Alcohol: " + (alcoholSelect.value || "---");
  summaryScent.textContent = "Scent: " + (scentSelect.value || "---");
  summaryPackaging.textContent = "Packaging: " + (packagingSelect.value || "---");

  const sizePrice = parseInt(sizeSelect.selectedOptions[0]?.dataset.price || 0);
  const bottlePrice = parseInt(bottleSelect.selectedOptions[0]?.dataset.price || 0);
  const alcoholPrice = parseInt(alcoholSelect.selectedOptions[0]?.dataset.price || 0);
  const packagingPrice = parseInt(packagingSelect.selectedOptions[0]?.dataset.price || 0);

  const total = sizePrice + bottlePrice + alcoholPrice + packagingPrice;
  totalPriceElement.textContent = `Total Price: ${total} EGP`;
}



// event listeners
sizeSelect.addEventListener("change", updateSummary);
bottleSelect.addEventListener("change", updateSummary);
alcoholSelect.addEventListener("change", updateSummary);
packagingSelect.addEventListener("change", updateSummary);
scentSelect.addEventListener("change", updateSummary);
genderSelect.addEventListener("change", () => {
  updateScentOptions();
  updateSummary();
});

checkoutBtn.addEventListener("click", () => {
  customerForm.style.display = "block";
  checkoutBtn.style.display = "none";
});
submitOrder.addEventListener("click", async () => {
  // Get form values
  const name = document.getElementById("customer-name").value;
  const phone = document.getElementById("customer-phone").value;
  const address = document.getElementById("customer-address").value;
  const size = sizeSelect.value;
  const bottle = bottleSelect.value;
  const alcohol = alcoholSelect.value;
  const gender = genderSelect.value;
  const scent = scentSelect.value;
  const packaging = packagingSelect.value;
    console.log("قيمة العطر المختارة:", scent ,gender);


  // Calculate prices
  const sizePrice = parseInt(sizeSelect.selectedOptions[0]?.dataset.price || 0);
  const bottlePrice = parseInt(bottleSelect.selectedOptions[0]?.dataset.price || 0);
  const alcoholPrice = parseInt(alcoholSelect.selectedOptions[0]?.dataset.price || 0);
  const packagingPrice = parseInt(packagingSelect.selectedOptions[0]?.dataset.price || 0);
  const total = sizePrice + bottlePrice + alcoholPrice + packagingPrice;

  // Validate required fields
  if (!name || !phone || !address) {
    alert("يرجى ملء كل البيانات");
    return;
  }

  // Prepare order data
  const orderData = {
    name,
    phone,
    address,
    size,
    bottle,
    alcohol,
    gender, 
    scent,
    packaging,
    total
  };

  // Google Apps Script URL
  const scriptURL = 'https://script.google.com/macros/s/AKfycbx7TqC9H4DTscjnfP461SDu0jseAQ8If0yAFGzu90ffBwky4WmPKii3OmeK7D5jEl9FXw/exec';

  try {
    // Send data to Google Sheets
    const response = await fetch(scriptURL, {
      method: 'POST',
      body: JSON.stringify(orderData),
      headers: {
        'Content-Type': 'application/json'
      },
      // Important for Google Apps Script
      redirect: 'follow',
      mode: 'no-cors' // Only if you've properly configured CORS in your Apps Script
    });

    // Check if the request was successful
    if (response.ok || response.status === 0) { // status 0 for no-cors mode
      alert("✅ تم إرسال الطلب بنجاح!");
      // Optional: Reset form after successful submission
     document.getElementById("customer-form").reset();
    } else {
      throw new Error('Network response was not ok');
    }
  } catch (error) {
    alert("❌ حصل خطأ، حاول تاني.");
    console.error("Error:", error);
  }
});
