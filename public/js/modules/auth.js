import { initialize } from "./firebase-init.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signInWithRedirect, GoogleAuthProvider, sendPasswordResetEmail } from "firebase/auth";

initialize();
let auth = getAuth();
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