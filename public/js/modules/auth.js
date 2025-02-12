import { initialize } from "./firebase-init.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signInWithRedirect, GoogleAuthProvider, sendPasswordResetEmail, deleteUser } from "firebase/auth";

initialize();
let auth = getAuth();
if (document.location.href.includes('login')) {
    const googleProvider = new GoogleAuthProvider();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            document.location.href = "/";
        }
    });

    document.getElementById('signin-with-google').addEventListener('click', function () {
        signInWithRedirect(auth, googleProvider);
    });

    document.getElementById('signin').addEventListener('submit', function (event) {
        event.preventDefault();
        event.stopPropagation();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
            .then((_) => {
                document.location.href = "/";
            })
            .catch((_) => {
                document.getElementById('error-message').style.visibility = 'visible';
            });
    });
    document.getElementById('register').addEventListener('submit', function (event) {
        event.preventDefault();
        event.stopPropagation();
        const auth = getAuth();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        createUserWithEmailAndPassword(auth, email, password)
            .then((_) => {
                document.location.href = "/";
            })
            .catch((_) => {
                document.getElementById('error-message').style.visibility = 'visible';
            });
    });
    document.getElementById('register-link').addEventListener('click', function () {
        document.getElementById('signin').style.display = 'none';
        document.getElementById('login-header').innerText = "Register";
        document.getElementById('register').removeAttribute('style');
        document.getElementById('error-message').style.visibility = 'hidden';
    });
    document.getElementById('signin-link').addEventListener('click', function () {
        document.getElementById('register').style.display = 'none';
        document.getElementById('login-header').innerText = "Sign in";
        document.getElementById('signin').removeAttribute('style');
        document.getElementById('error-message').style.visibility = 'hidden';
    });
    document.getElementById('forgot-password').addEventListener('click', function () {
        const auth = getAuth();
        const email = document.getElementById('email').value;
        if (!email) {
            alert('Please enter your email address above. A recovery email will be sent to that address.');
            return false;
        }
        sendPasswordResetEmail(auth, email)
            .then(() => {
                alert('A recovery email has been sent.');
            });

    });
}

if (document.location.href.includes('privacy')) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            deleteAccountButton.disabled = false;
        } else {
            deleteAccountButton.disabled = true;
        }
    });
    const deleteAccountButton = document.getElementById('delete-account');
    if (!getAuth() || !getAuth().currentUser) {
        deleteAccountButton.disabled = true;
    }
    deleteAccountButton.addEventListener('click', function () {
        const auth = getAuth();
        if (auth && auth.currentUser && confirm(`Are you sure you want to delete your HanziGraph account, ${auth.currentUser.email}? This cannot be undone.`)) {
            const user = auth.currentUser;
            deleteUser(user).then(() => {
                alert('Your account has been deleted.');
                document.location.href = "/";
            }).catch((error) => {
                alert(`Error: ${error}. You may need to sign in first, to avoid fraudulent deletions. Email hanzigraph@googlegroups.com for support.`);
            });
        }
    });
}