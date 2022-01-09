//TODO may want to stop this and just have it stay shown, with faq over top via absolute position/z-index
const mainContainer = document.getElementById('container');
//faq items
const faqContainer = document.getElementById('faq-container');
const faqSingleCharWarning = document.getElementById('faq-single-char-warning');
const faqStudyMode = document.getElementById('faq-study-mode');
const faqRecommendations = document.getElementById('faq-recommendations');
const faqContext = document.getElementById('faq-context');
const faqGeneral = document.getElementById('faq-general');
const faqExitButton = document.getElementById('faq-exit-button');
const showStudyFaq = document.getElementById('show-study-faq');
const showGeneralFaq = document.getElementById('show-general-faq');

//TODO should combine with faqTypes
const faqTypesToElement = {
    singleCharWarning: faqSingleCharWarning,
    studyMode: faqStudyMode,
    context: faqContext,
    general: faqGeneral,
    recommendations: faqRecommendations
};
const faqTypes = {
    singleCharWarning: 'singleCharWarning',
    studyMode: 'studyMode',
    context: 'context',
    general: 'general',
    recommendations: 'recommendations'
};

let showFaq = function (faqType) {
    mainContainer.style.display = 'none';
    faqContainer.removeAttribute('style');
    faqTypesToElement[faqType].removeAttribute('style');
};

let initialize = function () {
    faqExitButton.addEventListener('click', function () {
        faqContainer.style.display = 'none';
        mainContainer.removeAttribute('style');
        Object.values(faqTypesToElement).forEach(x => {
            x.style.display = 'none';
        });
    });
    showStudyFaq.addEventListener('click', function () {
        showFaq(faqTypes.studyMode);
    });
    showGeneralFaq.addEventListener('click', function () {
        showFaq(faqTypes.general);
    });
}

export { faqTypes, showFaq, initialize }