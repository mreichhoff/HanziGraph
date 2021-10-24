import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";

const auth = getAuth();
const signinButton = document.getElementById('signin-button');
const signoutButton = document.getElementById('signout-button');
const mainHeader = document.getElementById('main-header');

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.user = user;
        signinButton.style.display = 'none';
        signoutButton.style.display = 'inline-block';
        let message = document.querySelector('.welcome-message');
        if (!message) {
            let welcomeMessage = document.createElement('span');
            welcomeMessage.className = 'welcome-message';
            welcomeMessage.textContent = "你好" + user.email;
            mainHeader.appendChild(welcomeMessage);
        }
    } else {
        window.user = null;
        signoutButton.style.display = 'none';
        signinButton.style.display = 'inline-block';
        let staleMessage = document.querySelector('.welcome-message');
        if (staleMessage) {
            staleMessage.remove();
        }
    }
});

signoutButton.addEventListener('click', function () {
    const auth = getAuth();
    signOut(auth).then(() => {
        //TODO move to rtdb.js?
        window.studyList = {};
        localStorage.removeItem('studyList');
        document.location.reload();
    }).catch((error) => {
        console.log(error);
    });
});