import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// ===============================
// LOAD ADMIN DASHBOARD DATA
// ===============================

async function loadDashboardStats() {

    try {

        // Get Lost Items
        const lostSnapshot = await getDocs(
            collection(db, "lostItems")
        );

        // Get Found Items
        const foundSnapshot = await getDocs(
            collection(db, "foundItems")
        );

        // Get Claim Requests
        const claimSnapshot = await getDocs(
            collection(db, "claimRequests")
        );


        // ===============================
        // TOTAL LOST & FOUND
        // ===============================

        const totalLost = lostSnapshot.size;
        const totalFound = foundSnapshot.size;
        const totalClaims = claimSnapshot.size;


        // ===============================
        // PENDING ITEMS
        // ===============================

        let totalPending = 0;

        lostSnapshot.forEach((doc) => {

            const data = doc.data();

            if (!data.status || data.status === "Pending") {
                totalPending++;
            }

        });


        foundSnapshot.forEach((doc) => {

            const data = doc.data();

            if (!data.status || data.status === "Pending") {
                totalPending++;
            }

        });


        // ===============================
        // DISPLAY DATA
        // ===============================

        document.getElementById("totalLost").textContent = totalLost;

        document.getElementById("totalFound").textContent = totalFound;

        document.getElementById("totalPending").textContent = totalPending;

        document.getElementById("totalClaims").textContent = totalClaims;


        console.log("Admin Dashboard Stats Loaded:");
        console.log("Lost:", totalLost);
        console.log("Found:", totalFound);
        console.log("Pending:", totalPending);
        console.log("Claims:", totalClaims);

    }

    catch (error) {

        console.error("Admin Dashboard Error:", error);

        alert("Unable to load dashboard data. Check Firebase permissions.");

    }

}


// ===============================
// START
// ===============================

loadDashboardStats();

