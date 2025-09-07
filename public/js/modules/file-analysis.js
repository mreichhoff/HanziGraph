import { hanziBox, notFoundElement, searchControl } from "./dom";
import { switchToState, stateKeys } from "./ui-orchestrator";
import { analyzeImage, isAiEligible } from "./data-layer"

const menuInput = document.getElementById('image-analysis-input');
const searchPhotoInput = document.getElementById('search-photo-input');
const searchFileInput = document.getElementById('search-file-input');
const menuItem = document.getElementById('image-analysis-menu-item');

function setVisibilityBasedOnAiEligibility() {
    if (!isAiEligible()) {
        menuItem.style.display = 'none';
    } else {
        menuItem.removeAttribute('style');
    }
}
function handleFile(file) {
    hanziBox.classList.remove('drop-target');
    if (!isAiEligible()) {
        return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
        try {
            switchToState(stateKeys.main);
            searchControl.style.display = 'none';
            document.dispatchEvent(new CustomEvent('loading-dots'));
            const aiData = await analyzeImage(reader.result);
            document.dispatchEvent(new CustomEvent('ai-file-response', { detail: { aiData } }));
        } catch (ex) {
            notFoundElement.removeAttribute('style');
            document.dispatchEvent(new CustomEvent('hide-loading-dots'));
            alert("The AI didn't like that.");
        }
    };
    reader.onerror = () => {
        alert("Error reading the file. Please try again.");
    };
    reader.readAsDataURL(file);
}

function fileInputHandler(event) {
    const file = event.target.files[0];
    handleFile(file);
}

function initialize() {
    setVisibilityBasedOnAiEligibility();
    // users can choose a file in the menu
    menuInput.addEventListener('change', fileInputHandler);
    searchPhotoInput.addEventListener('change', fileInputHandler);
    searchFileInput.addEventListener('change', fileInputHandler);
    // handle drag/drop for the main search box for eligible users.
    hanziBox.addEventListener('dragenter', function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (isAiEligible()) {
            hanziBox.classList.add('drop-target');
        }
    });
    hanziBox.addEventListener('dragend', function (e) {
        e.stopPropagation();
        e.preventDefault();
        hanziBox.classList.remove('drop-target');
    });
    hanziBox.addEventListener('dragleave', function (e) {
        e.stopPropagation();
        e.preventDefault();
        hanziBox.classList.remove('drop-target');
    });
    hanziBox.addEventListener('dragover', function (e) {
        e.stopPropagation();
        e.preventDefault();
    });
    hanziBox.addEventListener('drop', function (e) {
        e.stopPropagation();
        e.preventDefault();

        const file = e.dataTransfer.files[0];
        handleFile(file);
    });
    document.addEventListener('ai-eligibility-changed', function (event) {
        setVisibilityBasedOnAiEligibility();
    });
}

export { initialize }