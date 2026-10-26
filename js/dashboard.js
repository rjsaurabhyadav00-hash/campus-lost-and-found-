import { db, auth } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


// ===============================
// Smart Matching Functions
// ===============================

function normalize(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim();
}


function itemNameMatches(name1, name2) {

    const a = normalize(name1);
    const b = normalize(name2);

    // Exact match
    if (a === b) {
        return true;
    }

    // One name contains the other
    if (a.includes(b) || b.includes(a)) {
        return true;
    }

    // Word matching
    const wordsA = a.split(/\s+/);
    const wordsB = b.split(/\s+/);

    return wordsA.some(word =>
        word.length >= 3 && wordsB.includes(word)
    );
}


// ===============================
// Show Logged In User
// ===============================

onAuthStateChanged(auth, (user) => {

    if (user) {

        document.getElementById("userEmail").textContent =
            user.displayName || "User";

        // Load My Matches
        loadMatchCount(user);

    } else {

        window.location.href = "login.html";

    }

});


// ===============================
// Logout
// ===============================

document.getElementById("logoutBtn").addEventListener("click", async () => {

    await signOut(auth);

    alert("Logged Out Successfully");

    window.location.href = "login.html";

});


// ===============================
// Total Lost Items
// ===============================

async function loadLostCount() {

    const snapshot = await getDocs(
        collection(db, "lostItems")
    );

    document.getElementById("lostCount").textContent =
        snapshot.size;
}


// ===============================
// Total Found Items
// ===============================

async function loadFoundCount() {

    const snapshot = await getDocs(
        collection(db, "foundItems")
    );

    document.getElementById("foundCount").textContent =
        snapshot.size;
}


// ===============================
// My Matches Count
// ===============================

async function loadMatchCount(user) {

    try {

        // Get all Lost items
        const lostSnapshot = await getDocs(
            collection(db, "lostItems")
        );

        // Get all Found items
        const foundSnapshot = await getDocs(
            collection(db, "foundItems")
        );


        const lostItems = [];
        const foundItems = [];


        // Store Lost Items
        lostSnapshot.forEach((doc) => {

            lostItems.push({
                id: doc.id,
                ...doc.data()
            });

        });


        // Store Found Items
        foundSnapshot.forEach((doc) => {

            foundItems.push({
                id: doc.id,
                ...doc.data()
            });

        });


        const matches = [];


        // =====================================
        // MY LOST → OTHER USER FOUND
        // =====================================

        lostItems
            .filter(item => item.uid === user.uid)
            .forEach(lostItem => {

                foundItems
                    .filter(foundItem => foundItem.uid !== user.uid)
                    .forEach(foundItem => {

                        const categoryMatch =
                            normalize(lostItem.category) ===
                            normalize(foundItem.category);


                        const nameMatch =
                            itemNameMatches(
                                lostItem.itemName,
                                foundItem.itemName
                            );


                        if (categoryMatch && nameMatch) {

                            matches.push(
                                foundItem.id + "-Found"
                            );

                        }

                    });

            });


        // =====================================
        // MY FOUND → OTHER USER LOST
        // =====================================

        foundItems
            .filter(item => item.uid === user.uid)
            .forEach(foundItem => {

                lostItems
                    .filter(lostItem => lostItem.uid !== user.uid)
                    .forEach(lostItem => {

                        const categoryMatch =
                            normalize(foundItem.category) ===
                            normalize(lostItem.category);


                        const nameMatch =
                            itemNameMatches(
                                foundItem.itemName,
                                lostItem.itemName
                            );


                        if (categoryMatch && nameMatch) {

                            matches.push(
                                lostItem.id + "-Lost"
                            );

                        }

                    });

            });


        // Remove duplicate matches
        const uniqueMatches = [...new Set(matches)];


        // Update Dashboard
        document.getElementById("matchCount").textContent =
            uniqueMatches.length;


        console.log(
            "My Matches:",
            uniqueMatches.length
        );

    } catch (error) {

        console.error(
            "Error loading match count:",
            error
        );

    }

}


// ===============================
// Load Dashboard Counts
// ===============================

loadLostCount();
loadFoundCount();
