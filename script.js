/* =====================================================
   SCRIPT.JS  (Unit IV: JavaScript Fundamentals)
   1. Variables, data types and the medicine data
   2. Finding things on the page
   3. Small helper functions
   4. Saving and loading data
   5. Showing medicines and numbers
   6. Adding and removing medicines
   7. Billing
   8. Contact form
   9. Start of the program

   Debugging tip: press F12 in your browser and open the "Console" tab.
   Messages written with console.log() appear there, and so do errors.
   ===================================================== */


/* ---------- 1. VARIABLES, DATA TYPES AND DATA ---------- */

// const = a value that never changes
const shopName = "MediCare Pharmacy";   // string (text)
const GST_RATE = 0.12;                  // number (12% = 0.12)
const LOW_STOCK_LIMIT = 20;             // number: less than this = "low stock"
const STORAGE_KEY = "simplePharmacyMedicines";

// A function that gives us the starting list of medicines.
// The list is an ARRAY [ ... ] and every medicine is an OBJECT { name: value, ... }
function getSampleMedicines() {
  return [
    { id: 1, name: "Paracetamol 500mg", category: "Pain Relief", type: "Tablet",    price: 25,  quantity: 120, expiry: "2028-06-30" },
    { id: 2, name: "Ibuprofen 400mg",   category: "Pain Relief", type: "Tablet",    price: 40,  quantity: 15,  expiry: "2028-03-15" },
    { id: 3, name: "Amoxicillin 250mg", category: "Antibiotic",  type: "Tablet",    price: 85,  quantity: 60,  expiry: "2028-01-20" },
    { id: 4, name: "Cetirizine 10mg",   category: "Allergy",     type: "Tablet",    price: 30,  quantity: 90,  expiry: "2028-09-10" },
    { id: 5, name: "Cough Syrup 100ml", category: "Digestive",   type: "Syrup",     price: 95,  quantity: 0,   expiry: "2028-02-28" },
    { id: 6, name: "Vitamin C 500mg",   category: "Vitamins",    type: "Tablet",    price: 60,  quantity: 150, expiry: "2028-12-01" },
    { id: 7, name: "Insulin Injection", category: "Antibiotic",  type: "Injection", price: 450, quantity: 12,  expiry: "2028-04-05" },
    { id: 8, name: "Antiseptic Liquid", category: "Digestive",   type: "Syrup",     price: 110, quantity: 40,  expiry: "2026-01-15" }
  ];
}

// let = a value that can change later
let medicines = loadMedicines();   // array of medicine objects
let bill = [];                     // array of items in the current bill (empty at the start)


/* ---------- 2. FINDING THINGS ON THE PAGE ----------
   document.getElementById("x") finds the HTML element that has id="x". */
const searchBox        = document.getElementById("search");
const medicineList     = document.getElementById("medicine-list");
const medicineCount    = document.getElementById("medicine-count");
const addForm          = document.getElementById("add-form");
const addMessage       = document.getElementById("add-message");
const resetButton      = document.getElementById("reset-button");

const billForm         = document.getElementById("bill-form");
const billMedicine     = document.getElementById("bill-medicine");
const billQuantity     = document.getElementById("bill-quantity");
const billList         = document.getElementById("bill-list");
const billMessage      = document.getElementById("bill-message");
const generateButton   = document.getElementById("generate-button");
const clearButton      = document.getElementById("clear-button");

const contactForm      = document.getElementById("contact-form");
const contactMessage   = document.getElementById("contact-message");
const ratingInput      = document.getElementById("ct-rating");
const ratingOutput     = document.getElementById("rating-output");


/* ---------- 3. SMALL HELPER FUNCTIONS ----------
   A function is a block of code with a name. We write it once and use it many times. */

// Turns the number 25 into the text "₹25.00"
function formatMoney(amount) {
  return "₹" + amount.toFixed(2);   // toFixed(2) = always 2 digits after the dot
}

// Gives today's date as text like "2026-11-03"
function getToday() {
  return new Date().toISOString().slice(0, 10);
}

// Decides the status of ONE medicine. It uses if / else if / else.
function getStatus(medicine) {
  if (medicine.expiry < getToday()) {          // dates written as YYYY-MM-DD can be compared like text
    return { text: "Expired", cssClass: "expired" };
  } else if (medicine.quantity === 0) {        // === means "is exactly equal to"
    return { text: "Out of stock", cssClass: "out" };
  } else if (medicine.quantity < LOW_STOCK_LIMIT) {
    return { text: "Low stock", cssClass: "low" };
  } else {
    return { text: "In stock", cssClass: "ok" };
  }
}

// Makes typed text safe before we put it inside HTML
function safeText(text) {
  const box = document.createElement("div");
  box.textContent = text;
  return box.innerHTML;
}

// Shows a message under a form. type is "success" or "error"
function showMessage(element, text, type) {
  element.textContent = text;
  element.className = "message " + type;
}

// Looks for a medicine by its id. Returns the medicine object, or undefined if not found.
function findMedicine(id) {
  return medicines.find(function (medicine) {
    return medicine.id === id;
  });
}

// How many pieces of this medicine are already in the current bill?
function quantityInBill(id) {
  let total = 0;
  for (let i = 0; i < bill.length; i++) {
    if (bill[i].id === id) {
      total = total + bill[i].quantity;
    }
  }
  return total;
}


/* ---------- 4. SAVING AND LOADING DATA ----------
   localStorage is a small storage space inside the browser.
   It can only store text, so we change the array to text with JSON.stringify
   and back to an array with JSON.parse. */
function saveMedicines() {
  // try { ... } catch { ... } keeps the website working even if the browser blocks saving
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));
  } catch (error) {
    console.log("Could not save:", error);
  }
}

function loadMedicines() {
  try {
    const savedText = localStorage.getItem(STORAGE_KEY);
    if (savedText) {                             // is there something saved?
      return JSON.parse(savedText);
    }
  } catch (error) {
    console.log("Could not load saved data:", error);
  }
  return getSampleMedicines();                   // nothing saved yet: use the sample list
}


/* ---------- 5. SHOWING MEDICINES AND NUMBERS ---------- */

// Builds the medicine table. It runs again every time something changes.
function showMedicines() {
  const searchText = searchBox.value.toLowerCase().trim();   // string methods
  let rowsHtml = "";        // we collect all the table rows in this text
  let shown = 0;            // how many medicines match the search

  // A for loop goes through the array one medicine at a time
  for (let i = 0; i < medicines.length; i++) {
    const medicine = medicines[i];

    if (medicine.name.toLowerCase().includes(searchText)) {
      const status = getStatus(medicine);
      shown = shown + 1;

      // Template text with backticks `...` lets us put values inside with ${...}
      rowsHtml += `
        <tr>
          <td>${safeText(medicine.name)}<br><small>${medicine.type}</small></td>
          <td>${medicine.category}</td>
          <td>${formatMoney(medicine.price)}</td>
          <td>${medicine.quantity}</td>
          <td>${medicine.expiry}</td>
          <td><span class="badge ${status.cssClass}">${status.text}</span></td>
          <td><button type="button" class="delete-btn" data-id="${medicine.id}">X</button></td>
        </tr>`;
    }
  }

  if (shown === 0) {
    rowsHtml = '<tr><td colspan="7">No medicine found.</td></tr>';
  }

  medicineList.innerHTML = rowsHtml;     // put the rows into the page
  medicineCount.textContent = "Showing " + shown + " of " + medicines.length + " medicines";
}

// Fills the three number cards on the Home section
function showStats() {
  // filter() makes a new array with only the medicines that pass the test
  const lowStock = medicines.filter(function (medicine) {
    return medicine.quantity < LOW_STOCK_LIMIT;
  });

  // reduce() adds everything up into one number
  const stockValue = medicines.reduce(function (sum, medicine) {
    return sum + medicine.price * medicine.quantity;
  }, 0);

  document.getElementById("stat-total").textContent = medicines.length;
  document.getElementById("stat-low").textContent = lowStock.length;
  document.getElementById("stat-value").textContent = formatMoney(stockValue);
}

// Fills the "Medicine" drop-down in the billing section
function showBillingDropdown() {
  let optionsHtml = '<option value="">-- Choose a medicine --</option>';

  medicines.forEach(function (medicine) {      // forEach = do something for each item
    const status = getStatus(medicine);
    const cannotSell = status.cssClass === "expired" || status.cssClass === "out";   // || means OR

    optionsHtml += `<option value="${medicine.id}"${cannotSell ? " disabled" : ""}>
      ${safeText(medicine.name)} - ${formatMoney(medicine.price)} (stock ${medicine.quantity})${cannotSell ? " - " + status.text : ""}
    </option>`;
  });

  billMedicine.innerHTML = optionsHtml;
}

// Shows "Open now" or "Closed now" in the header (operators and a boolean)
function showShopStatus() {
  const hour = new Date().getHours();          // 0 to 23
  const isOpen = hour >= 8 && hour < 21;       // && means AND. The result is true or false
  const statusElement = document.getElementById("shop-status");

  if (isOpen) {
    statusElement.textContent = "Open now";
    statusElement.className = "shop-status open";
  } else {
    statusElement.textContent = "Closed now";
    statusElement.className = "shop-status closed";
  }
}

// Updates everything that depends on the medicine list
function refreshAll() {
  showMedicines();
  showStats();
  showBillingDropdown();
  showBill();
}


/* ---------- 6. ADDING AND REMOVING MEDICINES ---------- */

// Search: show the table again every time the user types a letter
searchBox.addEventListener("input", showMedicines);

// Remove button. One listener on the whole table body works for every button inside it.
medicineList.addEventListener("click", function (event) {
  if (event.target.classList.contains("delete-btn")) {
    const id = Number(event.target.dataset.id);   // Number() turns text into a number

    // keep every medicine EXCEPT the one with this id
    medicines = medicines.filter(function (medicine) {
      return medicine.id !== id;
    });
    bill = bill.filter(function (item) {
      return item.id !== id;
    });

    saveMedicines();
    refreshAll();
  }
});

// Add form. The browser already checks required, min and minlength before this runs.
addForm.addEventListener("submit", function (event) {
  event.preventDefault();      // stop the page from reloading

  const name = document.getElementById("med-name").value.trim();

  // Do we already have a medicine with this name?
  const alreadyExists = medicines.some(function (medicine) {
    return medicine.name.toLowerCase() === name.toLowerCase();
  });

  if (alreadyExists) {
    showMessage(addMessage, name + " is already in the list.", "error");
    return;                    // stop here
  }

  // Create a new object and push it to the end of the array
  const newMedicine = {
    id: Date.now(),            // a number that is different every time
    name: name,
    category: document.getElementById("med-category").value,
    type: addForm.elements["type"].value,
    price: Number(document.getElementById("med-price").value),
    quantity: Number(document.getElementById("med-quantity").value),
    expiry: document.getElementById("med-expiry").value
  };
  medicines.push(newMedicine);
  console.log("New medicine added:", newMedicine);     // visible in the Console (F12)

  saveMedicines();
  addForm.reset();
  refreshAll();
  showMessage(addMessage, name + " was added.", "success");
});

// Restore button: go back to the sample list
resetButton.addEventListener("click", function () {
  medicines = getSampleMedicines();
  bill = [];
  saveMedicines();
  refreshAll();
  showMessage(addMessage, "Sample medicines restored.", "success");
});


/* ---------- 7. BILLING ---------- */

// Shows the bill table and the totals
function showBill() {
  let rowsHtml = "";
  let subtotal = 0;

  for (let i = 0; i < bill.length; i++) {
    const item = bill[i];
    const amount = item.price * item.quantity;
    subtotal = subtotal + amount;

    rowsHtml += `
      <tr>
        <td>${safeText(item.name)}</td>
        <td>${item.quantity}</td>
        <td>${formatMoney(amount)}</td>
      </tr>`;
  }

  if (bill.length === 0) {
    rowsHtml = '<tr><td colspan="3">The bill is empty.</td></tr>';
  }

  const gst = subtotal * GST_RATE;
  const total = subtotal + gst;

  billList.innerHTML = rowsHtml;
  document.getElementById("bill-subtotal").textContent = formatMoney(subtotal);
  document.getElementById("bill-gst").textContent = formatMoney(gst);
  document.getElementById("bill-total").textContent = formatMoney(total);
}

// "Add to bill" button
billForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const id = Number(billMedicine.value);
  const quantity = Number(billQuantity.value);
  const medicine = findMedicine(id);

  if (!medicine) {                                  // ! means NOT
    showMessage(billMessage, "Please choose a medicine.", "error");
    return;
  }

  // Do we have enough stock? (also count what is already in the bill)
  if (quantityInBill(id) + quantity > medicine.quantity) {
    showMessage(billMessage, "Not enough stock. Only " + medicine.quantity + " available.", "error");
    return;
  }

  bill.push({ id: medicine.id, name: medicine.name, price: medicine.price, quantity: quantity });
  billQuantity.value = 1;
  showBill();
  showMessage(billMessage, medicine.name + " added to the bill.", "success");
});

// "Generate bill" button
generateButton.addEventListener("click", function () {
  if (bill.length === 0) {
    showMessage(billMessage, "Add at least one medicine first.", "error");
    return;
  }

  // Work out the total before we clear the bill
  let subtotal = 0;
  for (let i = 0; i < bill.length; i++) {
    subtotal = subtotal + bill[i].price * bill[i].quantity;
  }
  const total = subtotal + subtotal * GST_RATE;

  // Reduce the stock of every medicine we sold
  for (let i = 0; i < bill.length; i++) {
    const medicine = findMedicine(bill[i].id);
    medicine.quantity = medicine.quantity - bill[i].quantity;
  }

  bill = [];
  saveMedicines();
  refreshAll();
  showMessage(billMessage, "Bill generated. Total paid: " + formatMoney(total) + ". Thank you for shopping at " + shopName + "!", "success");
});

// "Clear bill" button
clearButton.addEventListener("click", function () {
  bill = [];
  showBill();
  showMessage(billMessage, "Bill cleared.", "success");
});


/* ---------- 8. CONTACT FORM ---------- */

// Show the number next to the slider while it moves
ratingInput.addEventListener("input", function () {
  ratingOutput.textContent = ratingInput.value;
});

contactForm.addEventListener("submit", function (event) {
  event.preventDefault();

  // An object that keeps the form answers together
  const feedback = {
    name: document.getElementById("ct-name").value.trim(),
    email: document.getElementById("ct-email").value.trim(),
    phone: document.getElementById("ct-phone").value,
    topic: document.getElementById("ct-topic").value,
    rating: Number(ratingInput.value),
    message: document.getElementById("ct-message").value.trim()
  };
  console.log("Message received:", feedback);   // there is no server, so we only show it in the Console

  contactForm.reset();
  ratingOutput.textContent = "3";
  showMessage(contactMessage, "Thank you, " + feedback.name + "! We received your message.", "success");
});


/* ---------- 9. START OF THE PROGRAM ----------
   These lines run when the page opens. */
console.log("Medicines loaded:", medicines);
showShopStatus();
refreshAll();
