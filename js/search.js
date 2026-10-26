
import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

console.log("search.js loaded");

// ================= ELEMENTS =================

const container = document.getElementById("resultsContainer");
const heading = document.querySelector(".result-heading");
const noResult = document.getElementById("noResult");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const typeFilter = document.getElementById("typeFilter");
const searchBtn = document.getElementById("searchBtn");

const detailsModal = document.getElementById("detailsModal");
const closeModal = document.querySelector(".close-modal");

let allItems = [];

// ================= NORMALIZE TEXT =================

function normalize(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

// Treat Electronic and Electronics as the same category.

function normalizeCategory(value) {
    const category = normalize(value);

    if (category === "electronic" || category === "electronics") {
        return "electronics";
    }

    if (category === "document" || category === "documents") {
        return "documents";
    }

    if (category === "bag" || category === "bags") {
        return "bags";
    }

    if (category === "accessory" || category === "accessories") {
        return "accessories";
    }

    if (category === "watch" || category === "watches") {
        return "watches";
    }

    return category;
}

// ================= LOAD LOST & FOUND ITEMS =================

async function loadItems() {
    console.log("Loading items...");

    container.innerHTML = "";
    heading.textContent = "Loading items...";
    noResult.style.display = "none";

    allItems = [];

    try {
        // Load Lost Items
        const lostSnapshot = await getDocs(
            collection(db, "lostItems")
        );

        lostSnapshot.forEach((doc) => {
            const item = doc.data();

            if (normalize(item.status) !== "approved") return;

            allItems.push({
                ...item,
                id: doc.id,
                type: "Lost"
            });
        });

        // Load Found Items
        const foundSnapshot = await getDocs(
            collection(db, "foundItems")
        );

        foundSnapshot.forEach((doc) => {
            const item = doc.data();

            if (normalize(item.status) !== "approved") return;

            allItems.push({
                ...item,
                id: doc.id,
                type: "Found"
            });
        });

        console.log("Approved items loaded:", allItems);

        // Display all approved items initially
        filterItems();

    } catch (error) {
        console.error("Firestore Error:", error);

        container.innerHTML = "";
        heading.textContent = "Unable to load items";
        noResult.style.display = "block";

        alert("Error loading items: " + error.message);
    }
}

// ================= DISPLAY ITEMS =================

function displayItems(items) {
    container.innerHTML = "";

    heading.textContent = `Showing ${items.length} Results`;

    noResult.style.display =
        items.length === 0 ? "block" : "none";

    items.forEach((item) => {
        const card = document.createElement("div");
        card.className = "result-card";

        const content = document.createElement("div");
        content.className = "result-content";

        const title = document.createElement("h3");
        title.textContent = item.itemName || "Unknown Item";

        const category = document.createElement("p");
        category.textContent = `Category: ${item.category || "Not specified"}`;

        const location = document.createElement("p");
        location.textContent = `Location: ${item.location || "Not specified"}`;

        const date = document.createElement("p");
        date.textContent = `Date: ${item.date || "Not specified"}`;

        const badge = document.createElement("span");
        badge.className = `badge ${item.type.toLowerCase()}`;
        badge.textContent = item.type;

        const viewButton = document.createElement("button");
        viewButton.className = "view-btn";
        viewButton.type = "button";
        viewButton.textContent = "View Details";

        viewButton.addEventListener("click", () => {
            document.getElementById("modalTitle").textContent =
                item.itemName || "Item Details";

            document.getElementById("modalCategory").textContent =
                item.category || "Not specified";

            document.getElementById("modalLocation").textContent =
                item.location || "Not specified";

            document.getElementById("modalDate").textContent =
                item.date || "Not specified";

            document.getElementById("modalStatus").textContent =
                item.status || item.type;

            document.getElementById("modalDescription").textContent =
                item.description || "No description available";

            document.getElementById("modalContact").textContent =
                item.contact || "Not provided";

            detailsModal.style.display = "flex";
        });

        content.append(
            title,
            category,
            location,
            date,
            badge,
            viewButton
        );

        card.appendChild(content);
        container.appendChild(card);
    });
}

// ================= SEARCH & FILTERS =================

function filterItems() {
    const searchValue = normalize(searchInput.value);
    const categoryValue = normalizeCategory(categoryFilter.value);
    const typeValue = normalize(typeFilter.value);

    const filteredItems = allItems.filter((item) => {
        const searchableText = [
            item.itemName,
            item.description,
            item.location
        ]
            .map(normalize)
            .join(" ");

        const matchName =
            searchableText.includes(searchValue);

        const matchCategory =
            categoryValue === "all" ||
            normalizeCategory(item.category) === categoryValue;

        const matchType =
            typeValue === "all" ||
            normalize(item.type) === typeValue;

        return matchName && matchCategory && matchType;
    });

    displayItems(filteredItems);
}

// Search button
searchBtn.addEventListener("click", filterItems);

// Press Enter to search
searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        filterItems();
    }
});

// Live search
searchInput.addEventListener("input", filterItems);

// Category and type filters
categoryFilter.addEventListener("change", filterItems);
typeFilter.addEventListener("change", filterItems);

// ================= CLOSE MODAL =================

closeModal.addEventListener("click", () => {
    detailsModal.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target === detailsModal) {
        detailsModal.style.display = "none";
    }
});

// ================= START =================

loadItems();
