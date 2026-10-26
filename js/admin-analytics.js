import { db } from "./firebase.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const totalLost = document.getElementById("totalLost");
const totalFound = document.getElementById("totalFound");
const totalUsers = document.getElementById("totalUsers");
const totalClaims = document.getElementById("totalClaims");

const pendingItems = document.getElementById("pendingItems");
const verifiedItems = document.getElementById("verifiedItems");
const rejectedItems = document.getElementById("rejectedItems");
const totalItems = document.getElementById("totalItems");

const lostBar = document.getElementById("lostBar");
const foundBar = document.getElementById("foundBar");

const lostBarValue = document.getElementById("lostBarValue");
const foundBarValue = document.getElementById("foundBarValue");

const claimTotal = document.getElementById("claimTotal");
const pendingClaims = document.getElementById("pendingClaims");
const approvedClaims = document.getElementById("approvedClaims");
const rejectedClaims = document.getElementById("rejectedClaims");

const claimCircle = document.querySelector(".claim-circle");

async function loadAnalytics() {


try {

    /* GET FIREBASE DATA */

    const lostSnapshot =
        await getDocs(collection(db, "lostItems"));

    const foundSnapshot =
        await getDocs(collection(db, "foundItems"));

    const claimSnapshot =
        await getDocs(collection(db, "claimRequests"));

    const usersSnapshot =
        await getDocs(collection(db, "users"));


    /* ITEM COUNTS */

    const lostCount = lostSnapshot.size;
    const foundCount = foundSnapshot.size;

    totalLost.textContent = lostCount;
    totalFound.textContent = foundCount;

    totalUsers.textContent =
        usersSnapshot.size;


    /* ITEM STATUS */

    let pending = 0;
    let verified = 0;
    let rejected = 0;


    lostSnapshot.forEach((doc) => {

        const data = doc.data();

        if (!data.status || data.status === "Pending") {
            pending++;
        }

        else if (
            data.status === "Approved" ||
            data.status === "Verified"
        ) {
            verified++;
        }

        else if (data.status === "Rejected") {
            rejected++;
        }

    });


    foundSnapshot.forEach((doc) => {

        const data = doc.data();

        if (!data.status || data.status === "Pending") {
            pending++;
        }

        else if (
            data.status === "Approved" ||
            data.status === "Verified"
        ) {
            verified++;
        }

        else if (data.status === "Rejected") {
            rejected++;
        }

    });


    const allItems =
        lostCount + foundCount;


    pendingItems.textContent = pending;
    verifiedItems.textContent = verified;
    rejectedItems.textContent = rejected;
    totalItems.textContent = allItems;


    /* LOST VS FOUND BAR */

    lostBarValue.textContent = lostCount;
    foundBarValue.textContent = foundCount;


    const highestItemCount =
        Math.max(lostCount, foundCount, 1);


    lostBar.style.width =
        ((lostCount / highestItemCount) * 100) + "%";

    foundBar.style.width =
        ((foundCount / highestItemCount) * 100) + "%";


    /* CLAIM COUNTS */

    let pendingClaimCount = 0;
    let approvedClaimCount = 0;
    let rejectedClaimCount = 0;


    claimSnapshot.forEach((doc) => {

        const data = doc.data();

        if (data.status === "Approved") {
            approvedClaimCount++;
        }

        else if (data.status === "Rejected") {
            rejectedClaimCount++;
        }

        else {
            pendingClaimCount++;
        }

    });


    const claimsTotal =
        claimSnapshot.size;


    totalClaims.textContent = claimsTotal;

    claimTotal.textContent = claimsTotal;

    pendingClaims.textContent =
        pendingClaimCount;

    approvedClaims.textContent =
        approvedClaimCount;

    rejectedClaims.textContent =
        rejectedClaimCount;


    /* CLAIM DONUT */

    if (claimsTotal > 0) {

        const pendingDegree =
            (pendingClaimCount / claimsTotal) * 360;

        const approvedDegree =
            (approvedClaimCount / claimsTotal) * 360;

        const rejectedDegree =
            (rejectedClaimCount / claimsTotal) * 360;


        const pendingEnd =
            pendingDegree;

        const approvedEnd =
            pendingDegree + approvedDegree;


        claimCircle.style.background =
            `conic-gradient(
                #f59e0b 0deg ${pendingEnd}deg,
                #22c55e ${pendingEnd}deg ${approvedEnd}deg,
                #ef4444 ${approvedEnd}deg 360deg
            )`;

    } else {

        claimCircle.style.background =
            "#e2e8f0";

    }


    console.log("Analytics Loaded Successfully");

}

catch (error) {

    console.error(
        "Analytics Error:",
        error
    );

    alert(
        "Unable to load analytics. Check Firebase permissions."
    );

}


}

loadAnalytics();
