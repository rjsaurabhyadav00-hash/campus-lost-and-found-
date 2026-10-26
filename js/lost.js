import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    // Check logged-in user
    const user = auth.currentUser;

    if (!user) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    const itemName = document.getElementById("itemName").value.trim();
    const category = document.getElementById("category").value;
    const location = document.getElementById("location").value.trim();
    const date = document.getElementById("date").value;
    const contact = document.getElementById("contact").value.trim();
    const description = document.getElementById("description").value.trim();


    // ===== VALIDATION =====

    if (itemName.length < 2) {
        alert("Please enter a valid item name.");
        return;
    }

    if (category === "") {
        alert("Please select a category.");
        return;
    }

    if (location.length < 2) {
        alert("Please enter the lost location.");
        return;
    }

    if (date === "") {
        alert("Please select the lost date.");
        return;
    }


    // Future date validation
    const today = new Date().toISOString().split("T")[0];

    if (date > today) {
        alert("Lost date cannot be a future date.");
        return;
    }


    // 10 digit Indian mobile number validation
    const mobilePattern = /^[6-9][0-9]{9}$/;

    if (!mobilePattern.test(contact)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }


    if (description.length < 10) {
        alert("Description must contain at least 10 characters.");
        return;
    }


    // ===== SAVE TO FIREBASE =====

    try {

        await addDoc(collection(db, "lostItems"), {

            uid: user.uid,

            itemName,
            category,
            location,
            date,
            contact,
            description,

            status: "Pending",

            createdAt: new Date()
        });


        alert("✅ Lost Item Report Submitted Successfully!");

        form.reset();

    } catch (error) {

        console.error("Error:", error);

        alert("❌ Error submitting report.");

    }

});
