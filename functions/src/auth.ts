import { ActionContext } from "genkit";
import { getFirestore } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";

export async function isUserAuthorized(context: ActionContext | undefined): Promise<boolean> {
    if (!context || !context.auth?.uid) {
        return false;
    }
    const userId = context.auth.uid;

    const firestore = getFirestore();
    let docRef = firestore.doc(`permissions/${userId}`);
    const documentSnapshot = await docRef.get();
    if (!documentSnapshot.exists || documentSnapshot.get('ai') !== true) {
        return false;
    }
    // user ID is a random string...shouldn't be sensitive for logging (as opposed to email address)
    logger.info(`user ${userId} authorized for AI`);
    return true;
}