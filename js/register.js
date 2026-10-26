
import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const form = document.getElementById("registerForm");


form.addEventListener("submit", async (e) => {

    e.preventDefault();


    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;


    try {

        // Create Firebase Authentication account
        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user = userCredential.user;


        // Save display name in Authentication
        await updateProfile(user, {
            displayName: name
        });


        // Save user information in Firestore
        await setDoc(
            doc(db, "users", user.uid),
            {
                uid: user.uid,
                name: name,
                email: email,
                createdAt: new Date()
            }
        );


        alert("Registration Successful!");

        window.location.href = "login.html";


    } catch (error) {

        console.error("Registration Error:", error);

        alert(error.message);

    }

});

