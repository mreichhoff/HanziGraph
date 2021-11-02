import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";

//super rough for now, will be converted to graphs or other visualization
let auth = getAuth();
onAuthStateChanged(auth, (user) => {
    if (user) {
        //could be an array, but we're possibly going to add out of order, and also trying to avoid hardcoding max level
        let hskTotalsByLevel = {};
        Object.keys(hanzi).forEach(x => {
            let level = hanzi[x].node.level;
            if (!(level in hskTotalsByLevel)) {
                hskTotalsByLevel[level] = { seen: 0, total: 0, visited: 0 };
            }
            hskTotalsByLevel[level].total++;
        });
        const dbRef = ref(getDatabase());
        get(child(dbRef, `users/${user.uid}/decks/zh-CN`)).then((snapshot) => {
            const studyList = snapshot.val();
            let studyListCharacters = new Set();
            Object.keys(studyList).forEach(x => {
                for (let i = 0; i < x.length; i++) {
                    studyListCharacters.add(x[i]);
                }
            });
            studyListCharacters.forEach(x => {
                if (hanzi[x]) {
                    let level = hanzi[x].node.level;
                    if (!level in hskTotalsByLevel) {
                        hskTotalsByLevel[level] = { seen: 0, total: 0 };
                    }
                    hskTotalsByLevel[level].seen++;
                }
            });
            Object.keys(hskTotalsByLevel).forEach(x => {
                let element = document.getElementById(`hsk${x}-totals`);
                element.textContent = `${hskTotalsByLevel[x].seen} of ${hskTotalsByLevel[x].total}`;
            });
        });

        get(child(dbRef, `users/${user.uid}/results/zh-CN`)).then((snapshot) => {
            const results = snapshot.val();
            Object.keys(results.hourly).forEach(x => {
                let element = document.getElementById(`${x}results`);
                element.textContent = `${results.hourly[x].correct || 0} of ${(results.hourly[x].correct || 0) + (results.hourly[x].incorrect || 0)}`;
            });
        });

        get(child(dbRef, `users/${user.uid}/visited/zh-CN`)).then((snapshot) => {
            const visitedCharacters = snapshot.val();
            Object.keys(visitedCharacters).forEach(x => {
                if (hanzi[x]) {
                    const level = hanzi[x].node.level;
                    hskTotalsByLevel[level].visited++;
                }
            });
            Object.keys(hskTotalsByLevel).forEach(x => {
                let element = document.getElementById(`hsk${x}-visited`);
                element.textContent = `${hskTotalsByLevel[x].visited} of ${hskTotalsByLevel[x].total}`;
            });
        });
    }
});