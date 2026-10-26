
import { db } from "./firebase.js";
import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    const submitBtn = contactForm.querySelector('button[type="submit"]');

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";

        await addDoc(collection(db, "contactMessages"), {
            name,
            email,
            subject,
            message,
            status: "Unread",
            createdAt: serverTimestamp()
        });

        alert("Your message has been sent successfully!");
        contactForm.reset();

    } catch (error) {
        console.error("Error saving contact message:", error);
        alert("Message could not be sent. Please try again.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML =
            '<i class="fa-solid fa-paper-plane"></i> Send Message';
            
    }
});
