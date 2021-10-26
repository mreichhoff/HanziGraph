import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signInWithRedirect, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";

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
        .then((userCredential) => {
            document.location.href = "/";
        })
        .catch((error) => {
            const errorMessage = error.message;
            alert(errorMessage);
        });
});

document.getElementById('register').addEventListener('click', function () {
    const auth = getAuth();
    const email = document.getElementById('email').value;
    const passwordElement = document.getElementById('password');
    const password = passwordElement.value;
    if (password.length < passwordElement.minLength) {
        alert('Please enter a password of at least 12 characters.');
        return false;
    }
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            document.location.href = "/";
        })
        .catch((error) => {
            const errorMessage = error.message;
            alert(errorMessage);
        });
});