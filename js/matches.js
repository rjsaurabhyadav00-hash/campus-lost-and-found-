import { db, auth } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


// ===============================
// Elements
// ===============================

const matchesContainer = document.getElementById("matchesContainer");
const matchCount = document.getElementById("matchCount");
const noMatches = document.getElementById("noMatches");
const userName = document.getElementById("userName");


// ===============================
// Normalize Text
// ===============================

function normalize(text) {

    return String(text || "")
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim();

}


// ===============================
// Item Name Matching
// ===============================

function itemNameMatches(name1, name2) {

    const a = normalize(name1);
    const b = normalize(name2);

    // Exact match
    if (a === b) {
        return true;
    }

    // Partial match
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
// Submit Claim
// ===============================

async function submitClaim(item, type, user) {

    try {

        // Get existing claims
        const claimsSnapshot = await getDocs(
            collection(db, "claimRequests")
        );


        // Check duplicate claim
        let alreadyClaimed = false;

        claimsSnapshot.forEach((doc) => {

            const claim = doc.data();

            if (
                claim.claimantUid === user.uid &&
                claim.itemId === item.id
            ) {

                alreadyClaimed = true;

            }

        });


        if (alreadyClaimed) {

            alert("⚠️ You have already submitted a claim for this item.");
            return;

        }


        // Create Claim Request
        await addDoc(
            collection(db, "claimRequests"),
            {

                claimantUid: user.uid,

                claimantName:
                    user.displayName || "User",

                ownerUid:
                    item.uid || "",

                itemId:
                    item.id,

                itemName:
                    item.itemName || "",

                category:
                    item.category || "",

                location:
                    item.location || "",

                date:
                    item.date || "",

                contact:
                    item.contact || "",

                description:
                    item.description || "",

                itemType:
                    type,

                status:
                    "Pending",

                createdAt:
                    new Date()

            }
        );


        alert("✅ Claim request submitted successfully!");

        // Go to Claim Requests
        window.location.href = "claim.html";


    } catch (error) {

        console.error("Claim Error:", error);

        alert(
            "❌ Error submitting claim: " +
            error.message
        );

    }

}


// ===============================
// Create Match Card
// ===============================

function createMatchCard(item, type, user) {

    const card = document.createElement("div");

    card.className = "match-card";


    card.innerHTML = `

        
        <div class="match-content">

            <div class="match-top">

                <h3>
                    ${item.itemName || "Unknown Item"}
                </h3>

                <span class="status ${type.toLowerCase()}">
                    ${type}
                </span>

            </div>


            <p class="description">

                ${item.description ||
                "No description available."}

            </p>


            <div class="item-info">

                <p>
                    <i class="fa-solid fa-location-dot"></i>
                    ${item.location || "Not specified"}
                </p>

                <p>
                    <i class="fa-solid fa-calendar"></i>
                    ${item.date || "Not specified"}
                </p>

                <p>
                    <i class="fa-solid fa-tag"></i>
                    ${item.category || "Not specified"}
                </p>

            </div>


            <div class="match-details">

                <span>
                    <i class="fa-solid fa-percent"></i>
                    Possible Match
                </span>


                <button
                    class="view-btn"
                    type="button"
                >
                    Claim Item
                </button>

            </div>

        </div>

    `;


    // ===============================
    // Claim Button
    // ===============================

    card
        .querySelector(".view-btn")
        .addEventListener("click", () => {

            const confirmClaim = confirm(

                `Do you want to claim this item?\n\n` +

                `Item: ${item.itemName}\n` +

                `Category: ${item.category}\n\n` +

                `Your claim will be sent as Pending.`
            );


            if (confirmClaim) {

                submitClaim(
                    item,
                    type,
                    user
                );

            }

        });


    return card;

}


// ===============================
// Load Matches
// ===============================

async function loadMatches(user) {

    try {

        console.log(
            "Logged-in UID:",
            user.uid
        );


        // Get Lost Items
        const lostSnapshot = await getDocs(
            collection(db, "lostItems")
        );


        // Get Found Items
        const foundSnapshot = await getDocs(
            collection(db, "foundItems")
        );


        const lostItems = [];
        const foundItems = [];


        // Store Lost Items
        lostSnapshot.forEach((doc) => {

            const data = doc.data();

            console.log(
                "LOST ITEM:",
                data
            );

            lostItems.push({
                id: doc.id,
                ...data
            });

        });


        // Store Found Items
        foundSnapshot.forEach((doc) => {

            const data = doc.data();

            console.log(
                "FOUND ITEM:",
                data
            );

            foundItems.push({
                id: doc.id,
                ...data
            });

        });


        const matches = [];


        // =====================================
        // MY LOST → OTHER USER FOUND
        // =====================================
        
        const myLostItems =
            lostItems.filter(
                item => item.uid === user.uid
            );
        console.log("MY LOST ITEMS:", myLostItems);
        console.log("ALL FOUND ITEMS:", foundItems);

        myLostItems.forEach(lostItem => {

            foundItems.forEach(foundItem => {

                // Don't match own item
                if (foundItem.uid === user.uid) {
                    return;
                }


                const categoryMatch =
                    normalize(lostItem.category) ===
                    normalize(foundItem.category);


                const nameMatch =
                    itemNameMatches(
                        lostItem.itemName,
                        foundItem.itemName
                    );


                console.log(
                    "Checking:",
                    lostItem.itemName,
                    "↔",
                    foundItem.itemName,
                    "Category:",
                    categoryMatch,
                    "Name:",
                    nameMatch
                );


                if (
                    categoryMatch &&
                    nameMatch
                ) {

                    matches.push({

                        item: foundItem,

                        type: "Found"

                    });

                }

            });

        });


        // =====================================
        // MY FOUND → OTHER USER LOST
        // =====================================

        const myFoundItems =
            foundItems.filter(
                item => item.uid === user.uid
            );


        myFoundItems.forEach(foundItem => {

            lostItems.forEach(lostItem => {

                // Don't match own item
                if (lostItem.uid === user.uid) {
                    return;
                }


                const categoryMatch =
                    normalize(foundItem.category) ===
                    normalize(lostItem.category);


                const nameMatch =
                    itemNameMatches(
                        foundItem.itemName,
                        lostItem.itemName
                    );


                if (
                    categoryMatch &&
                    nameMatch
                ) {

                    matches.push({

                        item: lostItem,

                        type: "Lost"

                    });

                }

            });

        });


        // =====================================
        // Remove Duplicate Matches
        // =====================================

        const uniqueMatches = [];

        const seen = new Set();


        matches.forEach(match => {

            const key =
                match.item.id +
                "-" +
                match.type;


            if (!seen.has(key)) {

                seen.add(key);

                uniqueMatches.push(match);

            }

        });


        // Clear Container
        matchesContainer.innerHTML = "";


        // =====================================
        // No Matches
        // =====================================

        if (
            uniqueMatches.length === 0
        ) {

            noMatches.style.display = "block";

            matchCount.textContent =
                "0 Matches";

            console.log(
                "NO MATCHES FOUND"
            );

        }


        // =====================================
        // Show Matches
        // =====================================

        else {

            noMatches.style.display = "none";

            matchCount.textContent =
                `${uniqueMatches.length} Match${
                    uniqueMatches.length > 1
                        ? "es"
                        : ""
                }`;


            uniqueMatches.forEach(match => {

                const card =
                    createMatchCard(
                        match.item,
                        match.type,
                        user
                    );


                matchesContainer.appendChild(card);

            });


            console.log(
                "MATCHES FOUND:",
                uniqueMatches.length
            );

        }

    } catch (error) {

        console.error(
            "MATCH ERROR:",
            error
        );

        alert(
            "Error loading matches: " +
            error.message
        );

    }

}


// ===============================
// Authentication
// ===============================

onAuthStateChanged(
    auth,
    (user) => {

        if (user) {

            console.log(
                "USER LOGGED IN:",
                user.uid
            );


            userName.textContent =
                user.displayName ||
                "User";


            loadMatches(user);

        } else {

            console.log(
                "NO USER LOGGED IN"
            );


            window.location.href =
                "login.html";

        }

    }
);