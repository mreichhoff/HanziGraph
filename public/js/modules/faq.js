import { switchToState, stateKeys } from "./ui-orchestrator";

const faqContainer = document.getElementById('faq-container');
const faqStudyMode = document.getElementById('faq-study-mode');
const faqFlow = document.getElementById('faq-flow');
const faqContext = document.getElementById('faq-context');
const faqGeneral = document.getElementById('faq-general');
const showStudyFaq = document.getElementById('show-study-faq');

//TODO should combine with faqTypes
const faqTypesToElement = {
    studyMode: faqStudyMode,
    context: faqContext,
    general: faqGeneral,
    flow: faqFlow
};
const faqTypes = {
    studyMode: 'studyMode',
    context: 'context',
    general: 'general',
    flow: 'flow'
};

let showFaq = function (faqType) {
    switchToState(stateKeys.faq);
    faqTypesToElement[faqType].removeAttribute('style');
};

let initialize = function () {
    faqContainer.addEventListener('hidden', function () {
        Object.values(faqTypesToElement).forEach(x => {
            x.style.display = 'none';
        });
    });
    showStudyFaq.addEventListener('click', function () {
        showFaq(faqTypes.studyMode);
    });
}

export { faqTypes, showFaq, initialize }