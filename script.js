// ===============================
// GOOGLE ADDRESS AUTOCOMPLETE
// ===============================

let selectedAddress = "";

function initAutocomplete() {

  const input = document.getElementById("autocomplete");
  if (!input) return;

  const autocomplete = new google.maps.places.Autocomplete(input, {
    componentRestrictions: { country: "us" },
    types: ["address"]
  });

  autocomplete.addListener("place_changed", function () {

    const place = autocomplete.getPlace();

    let street = "";
    let city = "";
    let state = "";
    let postal = "";
    let country = "";

    place.address_components.forEach(component => {

      const types = component.types;

      if(types.includes("street_number")){
        street = component.long_name + " " + street;
      }

      if(types.includes("route")){
        street += component.long_name;
      }

      if(types.includes("locality")){
        city = component.long_name;
      }

      if(types.includes("administrative_area_level_1")){
        state = component.short_name;
      }

      if(types.includes("postal_code")){
        postal = component.long_name;
      }

      if(types.includes("country")){
        country = component.long_name;
      }

    });

    selectedAddress = place.formatted_address;

    localStorage.setItem("addressStreet", street);
    localStorage.setItem("addressCity", city);
    localStorage.setItem("addressState", state);
    localStorage.setItem("addressPostal", postal);
    localStorage.setItem("addressCountry", country);

    localStorage.setItem("address", place.formatted_address);

  });

}

window.initAutocomplete = initAutocomplete;
// ===============================
// FORM SUBMIT LOADING + REDIRECT
// ===============================

document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("addressForm");
  if (!form) return;

  form.addEventListener("submit", function(e){
    e.preventDefault();

    if(!selectedAddress){
      alert("Please select a valid address from the dropdown.");
      return;
    }

    const btn = document.getElementById("offerBtn");
    btn.innerText = "Requesting...";
    btn.disabled = true;

    setTimeout(function(){

  const encoded = encodeURIComponent(selectedAddress);

  const params = new URLSearchParams();

  [
    "gclid",
    "wbraid",
    "gbraid",
    "utm_source",
    "utm_campaign",
    "utm_term",
    "utm_device",
    "utm_adgroup"
  ].forEach(p => {

    const v = localStorage.getItem(p);
    if (v) params.append(p, v);

  });

  window.location.href =
    "/get-your-offer.html?address=" + encoded + "&" + params.toString();

}, 1200);

  });

});

/* ===============================
   HAMBURGER DROPDOWN (ALL PAGES)
================================ */
function toggleMenu() {
  const menu = document.getElementById("dropdownMenu");
  if (menu) menu.classList.toggle("show");
}

/* ===============================
   GET OFFER PAGE LOGIC
================================ */
document.addEventListener("DOMContentLoaded", function () {

  const offerForm = document.getElementById("offerPageForm");
  const offerBtn = document.getElementById("offerPageBtn");
  const offerInput = document.getElementById("offerAddress");

  if (offerForm && offerBtn && offerInput) {

    offerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const address = offerInput.value.trim();
      if (!address) return;

      offerBtn.innerText = "Requesting...";
      offerBtn.disabled = true;

      setTimeout(() => {

  const encoded = encodeURIComponent(address);

  const query = window.location.search
    ? "&" + window.location.search.substring(1)
    : "";

  window.location.href =
    "get-your-offer.html?address=" + encoded + query;

}, 800);
    });
  }

});

function openMenu() {
  document.getElementById("sideMenu").classList.add("active");
  document.getElementById("menuOverlay").classList.add("active");
}

function closeMenu() {
  document.getElementById("sideMenu").classList.remove("active");
  document.getElementById("menuOverlay").classList.remove("active");
}



// ===============================
// HERO ADDRESS BAR NAV REPLACEMENT
// ===============================

document.addEventListener("DOMContentLoaded", function () {

  const hero = document.querySelector(".hero");
  const floatingBar = document.getElementById("floatingOffer");
  const nav = document.querySelector(".top-nav");

  if (!hero || !floatingBar || !nav) return;

  function handleScroll() {

    const heroBottom = hero.offsetTop + hero.offsetHeight;
    const scrollPosition = window.scrollY;

    if (scrollPosition > heroBottom - 100) {
      floatingBar.classList.add("sticky");
      nav.classList.add("hidden");
    } else {
      floatingBar.classList.remove("sticky");
      nav.classList.remove("hidden");
    }
  }

  window.addEventListener("scroll", handleScroll);
  handleScroll();
});

// ===============================
// AUTO-DETECT USER STATE
// ===============================

document.addEventListener("DOMContentLoaded", function () {

  const stateEl = document.getElementById("userState");
  if (!stateEl) return;

  fetch("https://ipapi.co/json/")
    .then(res => res.json())
    .then(data => {
      if (data && data.region) {
        stateEl.textContent = data.region;
      }
    })
    .catch(() => {
      // Fail silently, Georgia stays default
    });

});

// FAQ Accordion
document.addEventListener("DOMContentLoaded", function () {
  const items = document.querySelectorAll(".faq-item");

  items.forEach(item => {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {
      item.classList.toggle("active");
    });
  });
});

/* =========================================
CAPTURE GOOGLE ADS CLICK DATA
========================================= */

(function(){

function getParam(p){
  const url = new URL(window.location.href);
  return url.searchParams.get(p);
}

const params = [
  "gclid",
  "wbraid",
  "gbraid",
  "utm_source",
  "utm_campaign",
  "utm_term",
  "utm_device",
  "utm_adgroup"
];

params.forEach(function(p){

  const value = getParam(p);

  if(value){
    localStorage.setItem(p, value);
  }

});

})();



/* =========================================
CAPTURE GOOGLE CLICK DATA + POPULATE GHL
========================================= */

(function(){

const params = new URLSearchParams(window.location.search);

const keys = [
"gclid",
"wbraid",
"gbraid",
"utm_source",
"utm_campaign",
"utm_term",
"utm_device",
"utm_adgroup"
];

/* STORE URL PARAMETERS */

keys.forEach(function(k){

  const value = params.get(k);

  if(value){
    localStorage.setItem(k, value);
  }

});


/* MAP URL PARAM → FORM FIELD */

const fieldMap = {
  gclid: "gclid2",
  wbraid: "wbraid",
  gbraid: "gbraid",
  utm_source: "utm_source",
  utm_campaign: "utm_campaign",
  utm_term: "utm_term",
  utm_device: "utm_device",
  utm_adgroup: "utm_adgroup"
};


/* POPULATE FIELDS */

function populate(){

  Object.keys(fieldMap).forEach(function(param){

    const stored = localStorage.getItem(param);

    const input = document.querySelector(`[name="${fieldMap[param]}"]`);

    if(stored && input){
      input.value = stored;
    }

  });

}


/* RUN MULTIPLE TIMES (GHL loads forms late) */

document.addEventListener("DOMContentLoaded", populate);

setTimeout(populate, 500);
setTimeout(populate, 1500);
setTimeout(populate, 3000);

})();


// Populate address field from URL
document.addEventListener("DOMContentLoaded", function () {

  const params = new URLSearchParams(window.location.search);
  const address = params.get("address");

  if (!address) return;

  const decoded = decodeURIComponent(address);

  const field =
    document.querySelector('[name="address"]') ||
    document.querySelector("#offerAddress");

  if (field) {
    field.value = decoded;
  }

});

/* =========================================
POPULATE ADDRESS INTO GHL FORM
========================================= */

document.addEventListener("DOMContentLoaded", function(){

  const params = new URLSearchParams(window.location.search);
  const address = params.get("address");

  if(!address) return;

  const decoded = decodeURIComponent(address);

  // Find the GHL address field
  const field = document.querySelector('[name="address"]');

  if(field){
    field.value = decoded;
    console.log("Address inserted:", decoded);
  }

});


const contactForm = document.getElementById("contactForm");

if(contactForm){

contactForm.addEventListener("submit", function(e){

e.preventDefault();

localStorage.setItem("firstName", document.getElementById("firstName").value);
localStorage.setItem("lastName", document.getElementById("lastName").value);
localStorage.setItem("email", document.getElementById("email").value);
localStorage.setItem("phone", document.getElementById("phone").value);

const params = new URLSearchParams(window.location.search);

window.location.href =
"get-your-offer-send.html?" + params.toString();

});

}
