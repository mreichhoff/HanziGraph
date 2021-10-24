import { getDatabase, update, ref, onValue } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";

let auth = getAuth();

let sanitizeKey = function (key) {
    return key.replaceAll('.', '。').replaceAll('#', '').replaceAll('$', 'USD').replaceAll('/', '').replaceAll('[', '').replaceAll(']', '');
};
let signedOutSaveStudyList = function (keys) {
    localStorage.setItem('studyList', JSON.stringify(window.studyList));
};
let saveStudyList = function (keys, localStudyList) {
    localStudyList = localStudyList || studyList;
    const db = getDatabase();
    const flashcardRef = ref(db, 'users/' + user.uid + '/decks/zh-CN');
    let updates = {};
    for (let i = 0; i < keys.length; i++) {
        //delete if not present
        updates[sanitizeKey(keys[i])] = localStudyList[keys[i]] || null;
    }
    update(flashcardRef, updates).then(() => {
        //regardless of how we ended up here, the localStorage part has been incorporated, so clear it out
        localStorage.removeItem('studyList');
    });
};
window.saveStudyList = signedOutSaveStudyList;
onAuthStateChanged(auth, (user) => {
    if (user) {
        const db = getDatabase();
        const flashcardRef = ref(db, 'users/' + user.uid + '/decks/zh-CN');
        window.saveStudyList = saveStudyList;
        onValue(flashcardRef, (snapshot) => {
            const data = snapshot.val();
            let localStudyList = JSON.parse(localStorage.getItem('studyList') || '{}');
            if (Object.keys(localStudyList).length > 0) {
                let updates = [];
                for (const key in localStudyList) {
                    if (!data || !data[key] ||
                        (data[key].rightCount + data[key].wrongCount) <
                        (localStudyList[key].rightCount + localStudyList[key].wrongCount)) {
                        updates.push(key);
                    }
                }
                if (updates.length > 0) {
                    saveStudyList(updates, localStudyList);
                    //break out and let the save re-trigger this
                    return;
                }
            }
            if (data) {
                window.studyList = data;
            }
        });
    } else {
        //reset due to the user signing out
        window.studyList = {};
        localStorage.removeItem('studyList');
        window.saveStudyList = signedOutSaveStudyList;
    }
});