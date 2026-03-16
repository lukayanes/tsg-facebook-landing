// ===============================
// GLOBAL ADDRESS STATE
// ===============================

let selectedAddress = "";
let parsedAddress = {
  street: "",
  city: "",
  state: "",
  postal: "",
  country: ""
};

// ===============================
// STORAGE HELPERS
// ===============================

function clearStoredAddress() {
  selectedAddress = "";
  parsedAddress = {
    street: "",
    city: "",
    state: "",
    postal: "",
    country: ""
  };

  localStorage.removeItem("address");
  localStorage.removeItem("addressStreet");
  localStorage.removeItem("addressCity");
  localStorage.removeItem("addressState");
  localStorage.removeItem("addressPostal");
  localStorage.removeItem("addressCountry");
}

function saveStoredAddress(fullAddress, parts) {
  localStorage.setItem("address", fullAddress || "");
  localStorage.setItem("addressStreet", parts.street || "");
  localStorage.setItem("addressCity", parts.city || "");
  localStorage.setItem("addressState", parts.state || "");
  localStorage.setItem("addressPostal", parts.postal || "");
  localStorage.setItem("addressCountry", parts.country || "");
}

function getStoredAddress() {
  return {
    address: localStorage.getItem("address") || "",
    street: localStorage.getItem("addressStreet") || "",
    city: localStorage.getItem("addressCity") || "",
    state: localStorage.getItem("addressState") || "",
    postal: localStorage.getItem("addressPostal") || "",
    country: localStorage.getItem("addressCountry") || ""
  };
}

// ===============================
// GOOGLE ADDRESS AUTOCOMPLETE
// ===============================

function initAutocomplete() {
  const input = document.getElementById("autocomplete");
  if (!input || !window.google || !google.maps || !google.maps.places) return;

  const autocomplete = new google.maps.places.Autocomplete(input, {
    componentRestrictions: { country: "us" },
    types: ["address"],
    fields: ["formatted_address", "address_components", "geometry"]
  });

  input.addEventListener("input", function () {
    selectedAddress = "";
    parsedAddress = {
      street: "",
      city: "",
      state: "",
      postal: "",
      country: ""
    };
  });

  autocomplete.addListener("place_changed", function () {
    const place = autocomplete.getPlace();

    if (!place || !place.formatted_address || !place.address_components) {
      clearStoredAddress();
      console.log("Google place data missing:", place);
      return;
    }

    let streetNumber = "";
    let route = "";
    let city = "";
    let state = "";
    let postal = "";
    let country = "";

    place.address_components.forEach(component => {
      const types = component.types || [];

      if (types.includes("street_number")) {
        streetNumber = component.long_name;
      }

      if (types.includes("route")) {
        route = component.long_name;
      }

      if (
        !city &&
        (
          types.includes("locality") ||
          types.includes("postal_town") ||
          types.includes("sublocality") ||
          types.includes("sublocality_level_1")
        )
      ) {
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

    const street = [streetNumber, route].filter(Boolean).join(" ").trim();

    selectedAddress = place.formatted_address;
    parsedAddress = {
      street,
      city,
      state,
      postal,
      country
    };

    saveStoredAddress(selectedAddress, parsedAddress);

    console.log("Selected address:", selectedAddress);
    console.log("Parsed address:", parsedAddress);
  });
}

window.initAutocomplete = initAutocomplete;

// ===============================
// ADDRESS FORM SUBMIT
// index.html / get-offer.html -> get-your-offer.html
// ===============================

document.addEventListener("DOMContentLoaded", function () {
  const addressForm = document.getElementById("addressForm");
  if (!addressForm) return;

  addressForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const input = document.getElementById("autocomplete");
    const typedAddress = input ? input.value.trim() : "";
    const googleLoaded = !!(window.google && google.maps && google.maps.places);

    if (!typedAddress) {
      alert("Please enter your property address.");
      return;
    }

    let finalAddress = "";
    let parts = {
      street: "",
      city: "",
      state: "",
      postal: "",
      country: ""
    };

    // If Google is loaded, require actual dropdown selection.
    if (googleLoaded) {
      if (!selectedAddress) {
        alert("Please select your address from the dropdown suggestions.");
        return;
      }

      finalAddress = selectedAddress;
      parts = { ...parsedAddress };
    } else {
      // Safe fallback only if Places script failed to load.
      finalAddress = typedAddress;
      parts.street = typedAddress;
    }

    saveStoredAddress(finalAddress, parts);

    const btn = document.getElementById("offerBtn");
    if (btn) {
      btn.innerText = "Requesting...";
      btn.disabled = true;
    }

    const params = new URLSearchParams();
    params.set("address", finalAddress);

    [
      "fbclid",
      "fbc",
      "fbp",
      "utm_source",
      "utm_medium",
      "utm_campaign_name",
      "utm_campaign",
      "utm_adgroup",
      "utm_ad",
      "utm_term",
      "utm_device"
    ].forEach(function (key) {
      const value = localStorage.getItem(key);
      if (value) params.set(key, value);
    });

    setTimeout(function () {
      window.location.href = "get-your-offer.html?" + params.toString();
    }, 400);
  });
});

// ===============================
// GET-YOUR-OFFER PAGE ADDRESS DISPLAY
// ===============================

document.addEventListener("DOMContentLoaded", function () {
  const displayAddress = document.getElementById("displayAddress");
  const addressField = document.getElementById("addressField");

  if (!displayAddress && !addressField) return;

  const params = new URLSearchParams(window.location.search);
  const stored = getStoredAddress();

  const address = params.get("address") || stored.address || "";

  if (displayAddress) {
    displayAddress.textContent = address;
  }

  if (addressField) {
    addressField.value = address;
  }
});

// ===============================
// CONTACT FORM SUBMIT
// get-your-offer.html -> get-your-offer-send.html
// ===============================

document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;

  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const firstName = document.getElementById("firstName")?.value.trim() || "";
    const lastName = document.getElementById("lastName")?.value.trim() || "";
    const email = document.getElementById("email")?.value.trim() || "";
    const phone = document.getElementById("phone")?.value.trim() || "";

    const addressFieldValue = document.getElementById("addressField")?.value.trim() || "";
    const params = new URLSearchParams(window.location.search);
    const stored = getStoredAddress();

    const address = addressFieldValue || params.get("address") || stored.address || "";
    const city = stored.city || "";
    const state = stored.state || "";
    const postal = stored.postal || "";
    const country = stored.country || "";

    if (!address) {
      alert("Missing property address. Please go back and enter your address again.");
      return;
    }

    localStorage.setItem("firstName", firstName);
    localStorage.setItem("lastName", lastName);
    localStorage.setItem("email", email);
    localStorage.setItem("phone", phone);

    try {
      let recaptchaToken = "";

      if (
        window.grecaptcha &&
        grecaptcha.enterprise &&
        typeof grecaptcha.enterprise.execute === "function"
      ) {
        recaptchaToken = await getRecaptchaToken();
      }

      const tokenField = document.getElementById("recaptchaToken");
      if (tokenField) tokenField.value = recaptchaToken;

      const redirectParams = new URLSearchParams(window.location.search);

      redirectParams.set("address", address);
      redirectParams.set("city", city);
      redirectParams.set("state", state);
      redirectParams.set("postal_code", postal);
      redirectParams.set("country", country);

      redirectParams.set("first_name", firstName);
      redirectParams.set("last_name", lastName);
      redirectParams.set("email", email);
      redirectParams.set("phone", phone);

      if (recaptchaToken) {
        redirectParams.set("recaptcha_token", recaptchaToken);
      }

      window.location.href = "get-your-offer-send.html?" + redirectParams.toString();
    } catch (err) {
      console.error("reCAPTCHA failed:", err);
      alert("Security check failed. Please try again.");
    }
  });
});

// ===============================
// FINAL OFFER PAGE LOGIC
// get-your-offer-send.html
// ===============================

document.addEventListener("DOMContentLoaded", function () {
  const offerForm = document.getElementById("offerPageForm");
  const offerBtn = document.getElementById("offerPageBtn");
  const offerInput = document.getElementById("offerAddress");

  if (!offerForm || !offerBtn || !offerInput) return;

  offerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const address = offerInput.value.trim();

    if (!address) {
      alert("Please enter your property address.");
      return;
    }

    localStorage.setItem("address", address);

    offerBtn.innerText = "Requesting...";
    offerBtn.disabled = true;

    const params = new URLSearchParams(window.location.search);
    params.set("address", address);

    setTimeout(() => {
      window.location.href = "get-your-offer-send.html?" + params.toString();
    }, 400);
  });
});

// ===============================
// HAMBURGER / SIDE MENU
// ===============================

function toggleMenu() {
  const menu = document.getElementById("dropdownMenu");
  if (menu) menu.classList.toggle("show");
}

function openMenu() {
  document.getElementById("sideMenu")?.classList.add("active");
  document.getElementById("menuOverlay")?.classList.add("active");
}

function closeMenu() {
  document.getElementById("sideMenu")?.classList.remove("active");
  document.getElementById("menuOverlay")?.classList.remove("active");
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
    .catch(() => {});
});

// ===============================
// FAQ ACCORDION
// ===============================

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

// ===============================
// CAPTURE META CLICK DATA + UTMS
// ===============================

(function () {
  const params = new URLSearchParams(window.location.search);

  const fbclid = params.get("fbclid");
  if (fbclid) {
    localStorage.setItem("fbclid", fbclid);
    const fbc = "fb.1." + Date.now() + "." + fbclid;
    localStorage.setItem("fbc", fbc);
  }

  const fbpMatch = document.cookie.match(/(?:^|; )_fbp=([^;]+)/);
  if (fbpMatch) {
    localStorage.setItem("fbp", decodeURIComponent(fbpMatch[1]));
  }

  [
    "utm_source",
    "utm_medium",
    "utm_campaign_name",
    "utm_campaign",
    "utm_adgroup",
    "utm_ad",
    "utm_term",
    "utm_device"
  ].forEach(function (key) {
    const value = params.get(key);
    if (value) {
      localStorage.setItem(key, value);
    }
  });
})();

// ===============================
// POPULATE META / UTM FIELDS INTO FORM
// ===============================

(function () {
  const fieldMap = {
    fbclid: "fbclid",
    fbc: "fbc",
    fbp: "fbp",
    utm_source: "utm_source",
    utm_medium: "utm_medium",
    utm_campaign_name: "utm_campaign_name",
    utm_campaign: "utm_campaign",
    utm_adgroup: "utm_adgroup",
    utm_ad: "utm_ad",
    utm_term: "utm_term",
    utm_device: "utm_device"
  };

  function populate() {
    Object.keys(fieldMap).forEach(function (param) {
      const stored = localStorage.getItem(param);
      const input = document.querySelector(`[name="${fieldMap[param]}"]`);
      if (stored && input) input.value = stored;
    });
  }

  document.addEventListener("DOMContentLoaded", populate);
  setTimeout(populate, 500);
  setTimeout(populate, 1500);
  setTimeout(populate, 3000);
})();

// ===============================
// GENERIC ADDRESS POPULATION
// ===============================

document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const stored = getStoredAddress();
  const address = params.get("address") || stored.address || "";
  if (!address) return;

  const field =
    document.querySelector('[name="address"]') ||
    document.getElementById("offerAddress") ||
    document.getElementById("autocomplete");

  if (field && !field.value) {
    field.value = address;
  }
});

// ===============================
// YEAR
// ===============================

document.addEventListener("DOMContentLoaded", function () {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});

// ===============================
// RECAPTCHA
// ===============================

async function getRecaptchaToken() {
  if (
    !window.grecaptcha ||
    !grecaptcha.enterprise ||
    typeof grecaptcha.enterprise.ready !== "function" ||
    typeof grecaptcha.enterprise.execute !== "function"
  ) {
    return "";
  }

  return new Promise((resolve, reject) => {
    grecaptcha.enterprise.ready(async () => {
      try {
        const token = await grecaptcha.enterprise.execute(
          "6LdBUYwsAAAAABtvWLcy5v8-ZT5-qvr2Q6x8DV0G",
          { action: "submit_lead" }
        );
        resolve(token || "");
      } catch (err) {
        reject(err);
      }
    });
  });
}
