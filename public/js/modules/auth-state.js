import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";

const signinButton = document.getElementById('signin-button');
const signoutButton = document.getElementById('signout-button');
const welcomeMessageContainer = document.getElementById('welcome-message-container');
const welcomeMessage = document.getElementById('welcome-message');

let initialize = function () {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            signinButton.style.display = 'none';
            signoutButton.style.display = 'inline-block';
            welcomeMessageContainer.removeAttribute('style');
            welcomeMessage.textContent = "你好" + user.email;
        } else {
            welcomeMessageContainer.style.display = 'none';
            signoutButton.style.display = 'none';
            signinButton.style.display = 'inline-block';
            welcomeMessage.textContent = '';
        }
    });
    signoutButton.addEventListener('click', function () {
        const auth = getAuth();
        signOut(auth).then(() => {
            localStorage.removeItem('studyList');
            localStorage.removeItem('studyListDirty');
            localStorage.removeItem('dailyDirty');
            localStorage.removeItem('hourlyDirty');
            localStorage.removeItem('studyResults');
            localStorage.removeItem('state');
            localStorage.removeItem('options');
            localStorage.removeItem('exploreState');
            document.location.reload();
        }).catch((error) => {
            console.log(error);
        });
    });
}

export { initialize }