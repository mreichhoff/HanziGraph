import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";

const auth = getAuth();
const signinButton = document.getElementById('signin-button');
const signoutButton = document.getElementById('signout-button');
const welcomeMessageContainer = document.getElementById('welcome-message-container');
const welcomeMessage = document.getElementById('welcome-message');

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.user = user;
        signinButton.style.display = 'none';
        signoutButton.style.display = 'inline-block';
        welcomeMessageContainer.removeAttribute('style');
        welcomeMessage.textContent = "你好" + user.email;
    } else {
        window.user = null;
        welcomeMessageContainer.style.display = 'none';
        signoutButton.style.display = 'none';
        signinButton.style.display = 'inline-block';
        welcomeMessage.textContent = '';
    }
});

signoutButton.addEventListener('click', function () {
    const auth = getAuth();
    signOut(auth).then(() => {
        //TODO move to study-list.js?
        window.studyList = {};
        localStorage.removeItem('studyList');
        localStorage.removeItem('visited');
        localStorage.removeItem('studyResults');
        localStorage.removeItem('state');
        document.location.reload();
    }).catch((error) => {
        console.log(error);
    });
});