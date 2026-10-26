import { db, auth } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


// ===============================
// Elements
// ===============================

const userName = document.getElementById("userName");

const pendingCount = document.getElementById("pendingCount");
const approvedCount = document.getElementById("approvedCount");
const rejectedCount = document.getElementById("rejectedCount");
const totalClaims = document.getElementById("totalClaims");

const requestCount = document.getElementById("requestCount");
const claimsContainer = document.getElementById("claimsContainer");
const emptyState = document.getElementById("emptyState");


// ===============================
// Load Claim Requests
// ===============================

async function loadClaims(user) {

    try {

        const claimsQuery = query(
            collection(db, "claimRequests"),
            where("claimantUid", "==", user.uid)
        );

        const snapshot = await getDocs(claimsQuery);

        claimsContainer.innerHTML = "";

        let pending = 0;
        let approved = 0;
        let rejected = 0;


        snapshot.forEach((doc) => {

            const claim = doc.data();

            if (claim.status === "Pending") {
                pending++;
            }

            if (claim.status === "Approved") {
                approved++;
            }

            if (claim.status === "Rejected") {
                rejected++;
            }


            // Create Claim Card

            const card = document.createElement("div");

            card.className = "claim-card";

            card.innerHTML = `
                <div class="claim-card-content">

                    <div class="claim-title">
                        <h3>${claim.itemName || "Unknown Item"}</h3>

                        <span class="claim-status ${String(
                            claim.status || "Pending"
                        ).toLowerCase()}">
                            ${claim.status || "Pending"}
                        </span>
                    </div>

                    <div class="claim-info">

                        <p>
                            <i class="fa-solid fa-tag"></i>
                            ${claim.category || "Not specified"}
                        </p>

                        <p>
                            <i class="fa-solid fa-location-dot"></i>
                            ${claim.location || "Not specified"}
                        </p>

                        <p>
                            <i class="fa-solid fa-calendar"></i>
                            ${claim.date || "Not specified"}
                        </p>

                        <p>
                            <i class="fa-solid fa-box"></i>
                            ${claim.itemType || "Item"}
                        </p>

                    </div>

                    <div class="claim-footer">

                        <span>
                            Claim submitted
                        </span>

                    </div>

                </div>
            `;

            claimsContainer.appendChild(card);

        });


        // ===============================
        // Update Statistics
        // ===============================

        const total = snapshot.size;

        pendingCount.textContent = pending;
        approvedCount.textContent = approved;
        rejectedCount.textContent = rejected;
        totalClaims.textContent = total;

        requestCount.textContent =
            `${total} Request${total !== 1 ? "s" : ""}`;


        // ===============================
        // Empty State
        // ===============================

        if (total === 0) {

            emptyState.style.display = "block";
            claimsContainer.style.display = "none";

        } else {

            emptyState.style.display = "none";
            claimsContainer.style.display = "grid";

        }


        console.log("Total Claims:", total);

    } catch (error) {

        console.error("Error loading claims:", error);

        alert("Error loading claim requests: " + error.message);

    }

}


// ===============================
// Check Login
// ===============================

onAuthStateChanged(auth, (user) => {

    if (user) {

        userName.textContent =
            user.displayName || "User";

        loadClaims(user);

    } else {

        window.location.href = "login.html";

    }

});

