import { ActionContext } from "genkit";
import { getFirestore } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";

const DEFAULT_DAILY_LIMIT = 100;

function getISODate(date: Date) {
    function pad(number: number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }

    return (
        date.getFullYear() +
        '-' +
        pad(date.getMonth() + 1) +
        '-' +
        pad(date.getDate()));
};

export async function isUserAuthorized(context: ActionContext | undefined): Promise<boolean> {
    if (!context || !context.auth?.uid) {
        return false;
    }
    // Note that there is also a concept of a role that can be set per-user
    // https://firebase.google.com/docs/auth/admin/custom-claims
    // however, I want the client to be able to read (but not write!) whether it has
    // the AI permission below, so skipping for now. Most likely the right thing here is to
    // run an on-user-created function that can set the claim, a permission, and a limit, or put
    // a little button on the site that calls a backend function and sets this stuff up.
    // we could then use all of:
    // * a claim
    // * and the DB permission's existence
    // * and the user having remaining quota
    // to authorize.
    const userId = context.auth.uid;

    const firestore = getFirestore();
    const docRef = firestore.doc(`permissions/${userId}`);
    try {
        // an extremely similar use case is shown on:
        // https://firebase.google.com/docs/firestore/manage-data/transactions#passing_information_out_of_transactions
        // we use a transaction to ensure the same document isn't written concurrently without our awareness
        // and because of that, our increment can be trusted
        // and if the user exceeds a quota the admin can set (which the user cannot write, security rules enforce it),
        // they get rejected. It's true that the client-side Firebase Vertex API has per-user-per-minute limits,
        // but using this approach instead allows:
        // a) not relying on client-side appcheck
        // b) authorizing individual users (though I may set it up to be default authorized, or easy to obtain)
        // c) setting per-user limits, with more flexibility than just "N per minute per user"
        //    e.g., an admin user could have a high limit, a new user could have a low one, and it's per-day vs
        //    per-minute (so more able to handle a quick few queries during a moment of intensive use)
        // d) this also banks on the notion of backend integration having more flexibility long-term (e.g.,
        //    to use non-gemini models or entirely removing the google APIs).
        await firestore.runTransaction(async transaction => {
            const date = new Date();
            // note that this approach does assume we wouldn't get systematic clock skew
            // that just keeps moving into the past with every request or something, but
            // that seems a reasonable assumption.
            const isoDate: string = getISODate(date);
            const documentSnapshot = await transaction.get(docRef);
            if (!documentSnapshot.exists || documentSnapshot.get('ai') !== true) {
                logger.info(`user ${userId} cannot use AI features`);
                throw 'User unauthorized';
            }
            const dailyLimit: number = documentSnapshot.get('dailyLimit') || DEFAULT_DAILY_LIMIT;
            const useToday = documentSnapshot.get(isoDate) || 0;
            const updatedTotal = useToday + 1;
            if (updatedTotal > dailyLimit) {
                logger.info(`user ${userId} out of quota for ${isoDate}`);
                throw 'User exceeded daily limit';
            }
            // note that this does allow the document to grow unbounded with new dates.
            // however, the max number of keys is reportedly 20k, so we should have ~50 years
            // of every-day use.
            transaction.update(docRef, isoDate, updatedTotal);
        });
    } catch (ex) {
        return false;
    }
    // user ID is a random string...shouldn't be sensitive for logging (as opposed to email address)
    logger.info(`user ${userId} authorized for AI`);
    return true;
}