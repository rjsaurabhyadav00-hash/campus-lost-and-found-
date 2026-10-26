import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const usersTable = document.getElementById("usersTable");
const totalUsers = document.getElementById("totalUsers");
const registeredUsers = document.getElementById("registeredUsers");
const userCount = document.getElementById("userCount");
const emptyState = document.getElementById("emptyState");
const userSearch = document.getElementById("userSearch");


let users = [];


// ==========================================
// LOAD USERS
// ==========================================

async function loadUsers() {

    try {

        const snapshot =
            await getDocs(collection(db, "users"));


        users = [];


        snapshot.forEach((document) => {

            users.push({
                id: document.id,
                ...document.data()
            });

        });


        updateStats();

        displayUsers(users);

    }

    catch (error) {

        console.error("Users Error:", error);

        usersTable.innerHTML = "";

        emptyState.style.display = "block";

        alert("Unable to load users. Check Firebase permissions.");

    }

}



// ==========================================
// UPDATE STATS
// ==========================================

function updateStats() {

    const total = users.length;


    totalUsers.textContent = total;

    registeredUsers.textContent = total;

    userCount.textContent =
        total + (total === 1 ? " User" : " Users");

}



// ==========================================
// DISPLAY USERS
// ==========================================

function displayUsers(userList) {

    usersTable.innerHTML = "";


    if (userList.length === 0) {

        emptyState.style.display = "block";

        return;

    }


    emptyState.style.display = "none";


    userList.forEach((user, index) => {

        const name =
            user.name || "Unknown User";

        const email =
            user.email || "No Email";


        let registeredDate = "N/A";


        if (user.createdAt) {

            if (user.createdAt.toDate) {

                registeredDate =
                    user.createdAt.toDate().toLocaleDateString();

            }

            else {

                registeredDate =
                    new Date(user.createdAt).toLocaleDateString();

            }

        }


        const firstLetter =
            name.charAt(0).toUpperCase();


        usersTable.innerHTML += `

            <tr>

                <td>
                    ${index + 1}
                </td>


                <td>

                    <span class="user-avatar">
                        ${firstLetter}
                    </span>

                    <span class="user-name">
                        ${name}
                    </span>

                </td>


                <td>
                    ${email}
                </td>


                <td class="uid">
                    ${user.uid || user.id}
                </td>


                <td>
                    ${registeredDate}
                </td>

            </tr>

        `;

    });

}



// ==========================================
// SEARCH USERS
// ==========================================

userSearch.addEventListener("input", () => {

    const searchText =
        userSearch.value.toLowerCase().trim();


    const filteredUsers =
        users.filter(user => {

            const name =
                (user.name || "").toLowerCase();

            const email =
                (user.email || "").toLowerCase();


            return (
                name.includes(searchText) ||
                email.includes(searchText)
            );

        });


    displayUsers(filteredUsers);

});



// ==========================================
// START
// ==========================================

loadUsers();

