import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";

const auth = getAuth();
const signinButton = document.getElementById('signin-button');
const signoutButton = document.getElementById('signout-button');
const mainHeader = document.getElementById('main-header');

onAuthStateChanged(auth, (user) => {
    if (user) {
        signinButton.style.display = 'none';
        signoutButton.style.display = 'inline-block';
        let welcomeMessage = document.createElement('span');
        welcomeMessage.className = 'welcome-message';
        welcomeMessage.textContent = "你好" + user.email;
        mainHeader.appendChild(welcomeMessage);
    } else {
        signoutButton.style.display = 'none';
        signinButton.style.display = 'inline-block';
    }
});

signoutButton.addEventListener('click', function () {
    const auth = getAuth();
    signOut(auth).then(() => {
        signoutButton.style.display = 'none';
        signinButton.style.display = 'inline-block';
        document.querySelector('.welcome-message').remove();
    }).catch((error) => {
        console.log(error);
    });
});