import { db } from "./firebase.js";

import {
collection,
getDocs,
updateDoc,
doc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const pendingClaims = document.getElementById("pendingClaims");
const approvedClaims = document.getElementById("approvedClaims");
const rejectedClaims = document.getElementById("rejectedClaims");
const totalClaimRequests = document.getElementById("totalClaimRequests");

const requestCount = document.getElementById("requestCount");
const claimsContainer = document.getElementById("claimsContainer");
const emptyState = document.getElementById("emptyState");

async function loadClaims() {

try {

    const snapshot = await getDocs(
        collection(db, "claimRequests")
    );

    claimsContainer.innerHTML = "";

    let pending = 0;
    let approved = 0;
    let rejected = 0;


    snapshot.forEach((claimDoc) => {

        const claim = claimDoc.data();

        const status = claim.status || "Pending";

        if (status === "Pending") {
            pending++;
        }

        if (status === "Approved") {
            approved++;
        }

        if (status === "Rejected") {
            rejected++;
        }


        const card = document.createElement("div");

        card.className = "admin-claim-card";


        let statusClass = "pending";

        if (status === "Approved") {
            statusClass = "approved";
        }

        if (status === "Rejected") {
            statusClass = "rejected";
        }


        let actionButtons = "";

        if (status === "Pending") {

            actionButtons = `
                <div class="claim-actions">

                    <button
                        class="claim-btn approve-btn"
                        data-id="${claimDoc.id}">
                        <i class="fa-solid fa-check"></i>
                        Approve
                    </button>

                    <button
                        class="claim-btn reject-btn"
                        data-id="${claimDoc.id}">
                        <i class="fa-solid fa-xmark"></i>
                        Reject
                    </button>

                </div>
            `;

        } else {

            actionButtons = `
                <div class="claim-actions">
                    <span class="reviewed-text">
                        Request ${status}
                    </span>
                </div>
            `;
        }


        card.innerHTML = `

            <div class="claim-card-header">

                <div class="claim-item-title">

                    <div class="claim-item-icon">
                        <i class="fa-solid fa-box"></i>
                    </div>

                    <div>
                        <h3>${claim.itemName || "Unknown Item"}</h3>

                        <p>
                            ${claim.category || "Not specified"}
                        </p>
                    </div>

                </div>


                <span class="claim-status ${statusClass}">
                    ${status}
                </span>

            </div>


            <div class="claim-details-grid">

                <div class="claim-detail">
                    <i class="fa-solid fa-location-dot"></i>

                    <div>
                        <span>Location</span>
                        <strong>
                            ${claim.location || "Not specified"}
                        </strong>
                    </div>
                </div>


                <div class="claim-detail">
                    <i class="fa-solid fa-calendar"></i>

                    <div>
                        <span>Date</span>
                        <strong>
                            ${claim.date || "Not specified"}
                        </strong>
                    </div>
                </div>


                <div class="claim-detail">
                    <i class="fa-solid fa-tag"></i>

                    <div>
                        <span>Item Type</span>
                        <strong>
                            ${claim.itemType || "Item"}
                        </strong>
                    </div>
                </div>


                <div class="claim-detail">
                    <i class="fa-solid fa-phone"></i>

                    <div>
                        <span>Contact</span>
                        <strong>
                            ${claim.contact || "Not provided"}
                        </strong>
                    </div>
                </div>

            </div>


            <div class="claimant-box">

                <div class="claimant-avatar">
                    <i class="fa-solid fa-user"></i>
                </div>

                <div class="claimant-info">

                    <span>Claimant</span>

                    <strong>
                        ${claim.claimantName || "Unknown User"}
                    </strong>

                </div>

            </div>


            ${actionButtons}

        `;


        claimsContainer.appendChild(card);

    });


    const total = snapshot.size;


    pendingClaims.textContent = pending;

    approvedClaims.textContent = approved;

    rejectedClaims.textContent = rejected;

    totalClaimRequests.textContent = total;


    requestCount.textContent =
        `${total} Request${total !== 1 ? "s" : ""}`;


    if (total === 0) {

        emptyState.style.display = "block";

        claimsContainer.style.display = "none";

    } else {

        emptyState.style.display = "none";

        claimsContainer.style.display = "grid";

    }


    addButtonEvents();


    console.log("Claim Requests:", total);

} catch (error) {

    console.error(
        "Error loading claim requests:",
        error
    );

    alert(
        "Error loading claim requests: " +
        error.message
    );
}

}




function addButtonEvents() {

const approveButtons =
    document.querySelectorAll(".approve-btn");

const rejectButtons =
    document.querySelectorAll(".reject-btn");


approveButtons.forEach((button) => {

    button.addEventListener("click", async () => {

        const claimId =
            button.getAttribute("data-id");


        const confirmApprove =
            confirm(
                "Are you sure you want to approve this claim?"
            );


        if (!confirmApprove) {
            return;
        }


        await updateClaimStatus(
            claimId,
            "Approved"
        );

    });

});


rejectButtons.forEach((button) => {

    button.addEventListener("click", async () => {

        const claimId =
            button.getAttribute("data-id");


        const confirmReject =
            confirm(
                "Are you sure you want to reject this claim?"
            );


        if (!confirmReject) {
            return;
        }


        await updateClaimStatus(
            claimId,
            "Rejected"
        );

    });

});

}




async function updateClaimStatus(
claimId,
newStatus
) {

try {

    await updateDoc(
        doc(db, "claimRequests", claimId),
        {
            status: newStatus,
            reviewedAt: new Date()
        }
    );


    alert(
        `Claim ${newStatus} Successfully!`
    );


    await loadClaims();

} catch (error) {

    console.error(
        "Error updating claim:",
        error
    );

    alert(
        "Error updating claim: " +
        error.message
    );

}

}

loadClaims();