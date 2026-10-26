
import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const table = document.getElementById("itemTable");


// ==========================================
// LOAD ITEMS + UPDATE STATISTICS
// ==========================================

async function loadItems() {

    table.innerHTML = "";

    try {

        // Get Lost Items
        const lostSnapshot = await getDocs(
            collection(db, "lostItems")
        );

        // Get Found Items
        const foundSnapshot = await getDocs(
            collection(db, "foundItems")
        );


        // ==========================================
        // COMBINE BOTH COLLECTIONS
        // ==========================================

        const allItems = [];


        lostSnapshot.forEach((document) => {

            allItems.push({
                id: document.id,
                type: "lostItems",
                itemType: "Lost",
                ...document.data()
            });

        });


        foundSnapshot.forEach((document) => {

            allItems.push({
                id: document.id,
                type: "foundItems",
                itemType: "Found",
                ...document.data()
            });

        });


        // ==========================================
        // CALCULATE COUNTS
        // ==========================================

        let pendingCount = 0;
        let verifiedCount = 0;
        let rejectedCount = 0;


        allItems.forEach((item) => {

            const status = item.status || "Pending";

            if (status === "Pending") {
                pendingCount++;
            }

            else if (status === "Approved") {
                verifiedCount++;
            }

            else if (status === "Rejected") {
                rejectedCount++;
            }

        });


        const totalCount = allItems.length;


        // ==========================================
        // UPDATE STATISTICS
        // ==========================================

        const pendingElement =
            document.getElementById("pendingCount");

        const verifiedElement =
            document.getElementById("verifiedCount");

        const rejectedElement =
            document.getElementById("rejectedCount");

        const totalElement =
            document.getElementById("totalCount");


        if (pendingElement) {
            pendingElement.textContent = pendingCount;
        }

        if (verifiedElement) {
            verifiedElement.textContent = verifiedCount;
        }

        if (rejectedElement) {
            rejectedElement.textContent = rejectedCount;
        }

        if (totalElement) {
            totalElement.textContent = totalCount;
        }


        // ==========================================
        // SHOW ONLY PENDING ITEMS IN TABLE
        // ==========================================

        const pendingItems =
            allItems.filter(item =>
                (item.status || "Pending") === "Pending"
            );


        if (pendingItems.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center; padding:30px;">
                        No pending items for verification.
                    </td>
                </tr>
            `;

        }


        pendingItems.forEach((item) => {

            table.innerHTML += `
                <tr>

                    <td class="item-img">
                        No Image
                    </td>

                    <td>
                        ${item.itemName || "Unknown Item"}
                    </td>

                    <td>
                        ${item.itemType}
                    </td>

                    <td>
                        ${item.location || "Not specified"}
                    </td>

                    <td>
                        <span class="pending">
                            ${item.status || "Pending"}
                        </span>
                    </td>

                    <td>

                        <button
                            class="verify"
                            data-id="${item.id}"
                            data-type="${item.type}">
                            <i class="fa-solid fa-check"></i>
                            Verify
                        </button>

                        <button
                            class="reject"
                            data-id="${item.id}"
                            data-type="${item.type}">
                            <i class="fa-solid fa-xmark"></i>
                            Reject
                        </button>

                    </td>

                </tr>
            `;

        });


        // Add button events
        addEvents();


        // Console information
        console.log("Admin Verification Stats:");
        console.log("Pending:", pendingCount);
        console.log("Verified:", verifiedCount);
        console.log("Rejected:", rejectedCount);
        console.log("Total:", totalCount);

    }

    catch (error) {

        console.error("Admin Verification Error:", error);

        table.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:30px;">
                    Unable to load items.
                </td>
            </tr>
        `;

        alert("Unable to load items. Check Firebase permissions.");

    }

}


// ==========================================
// VERIFY / REJECT EVENTS
// ==========================================

function addEvents() {


    // ==========================================
    // VERIFY
    // ==========================================

    document.querySelectorAll(".verify").forEach(button => {

        button.addEventListener("click", async () => {

            const itemId = button.dataset.id;
            const itemType = button.dataset.type;


            try {

                await updateDoc(
                    doc(db, itemType, itemId),
                    {
                        status: "Approved"
                    }
                );


                alert("✅ Item Approved");

                loadItems();

            }

            catch (error) {

                console.error("Verify Error:", error);

                alert("❌ Unable to approve item.");

            }

        });

    });


    // ==========================================
    // REJECT
    // ==========================================

    document.querySelectorAll(".reject").forEach(button => {

        button.addEventListener("click", async () => {

            const itemId = button.dataset.id;
            const itemType = button.dataset.type;


            try {

                await updateDoc(
                    doc(db, itemType, itemId),
                    {
                        status: "Rejected"
                    }
                );


                alert("❌ Item Rejected");

                loadItems();

            }

            catch (error) {

                console.error("Reject Error:", error);

                alert("❌ Unable to reject item.");

            }

        });

    });

}


// ==========================================
// START
// ==========================================

loadItems();

