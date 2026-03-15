// ===============================
// GOOGLE ADDRESS AUTOCOMPLETE
// ===============================

let selectedAddress = "";

function initAutocomplete() {
  const input = document.getElementById("autocomplete");
  if (!input) return;

  const autocomplete = new google.maps.places.Autocomplete(input, {
    componentRestrictions: { country: "us" },
    types: ["address"],
    fields: ["formatted_address", "address_components", "geometry"]
  });

  autocomplete.addListener("place_changed", function () {
    const place = autocomplete.getPlace();

    if (!place || !place.formatted_address || !place.address_components) {
      selectedAddress = "";
      console.log("Google place data missing:", place);
      return;
    }

    let street = "";
    let city = "";
    let state = "";
    let postal = "";
    let country = "";

    place.address_components.forEach(component => {
      const types = component.types;

      if (types.includes("street_number")) {
        street = component.long_name + " " + street;
      }

      if (types.includes("route")) {
        street += component.long_name;
      }

      if (types.includes("locality")) {
        city = component.long_name;
      }

      if (types.includes("administrative_area_level_1")) {
        state = component.short_name;
      }

      if (types.includes("postal_code")) {
        postal = component.long_name;
      }

      if (types.includes("country")) {
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

    console.log("Selected address:", place.formatted_address);
  });
}

window.initAutocomplete = initAutocomplete;

// ===============================
// FORM SUBMIT LOADING + REDIRECT
// ===============================

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("addressForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!selectedAddress) {
      alert("Please select a valid address from the dropdown.");
      return;
    }

    const btn = document.getElementById("offerBtn");
    if (btn) {
      btn.innerText = "Requesting...";
      btn.disabled = true;
    }

    setTimeout(function () {
      const encoded = encodeURIComponent(selectedAddress);
      const params = new URLSearchParams();

      [
        "fbclid",
        "fbc",
        "fbp",
        "utm_source",
        "utm_campaign",
        "utm_term",
        "utm_device",
        "utm_adgroup"
      ].forEach(function (p) {
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
      // Fail silently
    });
});

// FAQ Accordion
document.addEventListener("DOMContentLoaded", function () {
  const items = document.querySelectorAll(".faq-item");

  items.forEach(item => {
    const question = item.querySelector(".faq-question");
    if (!question) return;

    question.addEventListener("click", () => {
      item.classList.toggle("active");
    });
  });
});

/* =========================================
CAPTURE META CLICK DATA + UTMs
========================================= */

(function () {
  const params = new URLSearchParams(window.location.search);

  const fbclid = params.get("fbclid");
  if (fbclid) {
    localStorage.setItem("fbclid", fbclid);

    const existingFbc = localStorage.getItem("fbc");
    if (!existingFbc) {
      const fbc = "fb.1." + Date.now() + "." + fbclid;
      localStorage.setItem("fbc", fbc);
    }
  }

  const fbpMatch = document.cookie.match(/(?:^|; )_fbp=([^;]+)/);
  if (fbpMatch) {
    localStorage.setItem("fbp", decodeURIComponent(fbpMatch[1]));
  }

  [
    "utm_source",
    "utm_campaign",
    "utm_term",
    "utm_device",
    "utm_adgroup"
  ].forEach(function (p) {
    const value = params.get(p);
    if (value) {
      localStorage.setItem(p, value);
    }
  });
})();

/* =========================================
POPULATE META / UTM FIELDS INTO GHL
========================================= */

(function () {
  const fieldMap = {
    fbclid: "fbclid",
    fbc: "fbc",
    fbp: "fbp",
    utm_source: "utm_source",
    utm_campaign: "utm_campaign",
    utm_term: "utm_term",
    utm_device: "utm_device",
    utm_adgroup: "utm_adgroup"
  };

  function populate() {
    Object.keys(fieldMap).forEach(function (param) {
      const stored = localStorage.getItem(param);
      const input = document.querySelector(`[name="${fieldMap[param]}"]`);

      if (stored && input) {
        input.value = stored;
      }
    });
  }

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

document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const address = params.get("address");

  if (!address) return;

  const decoded = decodeURIComponent(address);
  const field = document.querySelector('[name="address"]');

  if (field) {
    field.value = decoded;
    console.log("Address inserted:", decoded);
  }
});

// =========================================
// SAVE CONTACT FORM DATA FOR NEXT STEP
// =========================================

document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const firstName = document.getElementById("firstName");
    const lastName = document.getElementById("lastName");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");

    localStorage.setItem("firstName", firstName ? firstName.value : "");
    localStorage.setItem("lastName", lastName ? lastName.value : "");
    localStorage.setItem("email", email ? email.value : "");
    localStorage.setItem("phone", phone ? phone.value : "");

    const params = new URLSearchParams(window.location.search);

    window.location.href =
      "get-your-offer-send.html?" + params.toString();
  });
});
