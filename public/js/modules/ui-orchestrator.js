const leftButtonContainer = document.getElementById('left-menu-button-container');
const rightButtonContainer = document.getElementById('right-menu-button-container');
const leftButton = document.getElementById('left-menu-button');
const rightButton = document.getElementById('right-menu-button');

const mainAppContainer = document.getElementById('main-app-container');
const statsContainer = document.getElementById('stats-container');
const faqContainer = document.getElementById('faq-container');
const menuContainer = document.getElementById('menu-container');

const explorePane = document.getElementById('explore-container');
const studyPane = document.getElementById('study-container');

const containers = [mainAppContainer, statsContainer, faqContainer, menuContainer];
const panes = [explorePane, studyPane];

// TODO(refactor): I'm gonna go out on a limb and say there's a better way...
const stateKeys = {
    main: 'main',
    study: 'study',
    faq: 'faq',
    stats: 'stats',
    menu: 'menu'
};

const states = {
    main: {
        leftButtonClass: 'menu-button',
        rightButtonClass: 'study-button',
        activeContainer: mainAppContainer,
        activePane: explorePane,
        leftState: 'menu',
        rightState: 'study',
        paneAnimation: 'slide-in'
    },
    study: {
        leftButtonClass: 'menu-button',
        rightButtonClass: 'explore-button',
        activeContainer: mainAppContainer,
        activePane: studyPane,
        leftState: 'menu',
        rightState: 'main',
        paneAnimation: 'slide-in'
    },
    faq: {
        leftButtonClass: 'exit-button',
        activeContainer: faqContainer,
        statePreserving: true,
        leftState: 'previous',
        animation: 'slide-in'
    },
    stats: {
        leftButtonClass: 'exit-button',
        activeContainer: statsContainer,
        statePreserving: true,
        leftState: 'main',
        animation: 'slide-in'
    },
    menu: {
        leftButtonClass: 'exit-button',
        activeContainer: menuContainer,
        statePreserving: true,
        leftState: 'previous',
        animation: 'slide-in'
    }
};

let prevState = null;
let currentState = stateKeys.main;

function switchToState(state) {
    if (state === currentState) {
        // no sense doing extra work...
        return;
    }
    // if we don't have the new state, treat it as indicating we must go back
    // for now we don't support chains of back/forward, it's just one
    const stateConfig = states[state] || states[prevState];

    for (const container of containers) {
        if (container.id !== stateConfig.activeContainer.id) {
            container.style.display = 'none';
            container.dispatchEvent(new Event('hidden'));
        }
    }
    stateConfig.activeContainer.removeAttribute('style');
    stateConfig.activeContainer.dispatchEvent(new Event('shown'));
    if (stateConfig.animation) {
        stateConfig.activeContainer.classList.add(stateConfig.animation);
        stateConfig.activeContainer.addEventListener('animationend', function () {
            stateConfig.activeContainer.classList.remove(stateConfig.animation);
        }, { once: true });
    }

    if (stateConfig.activePane) {
        for (const pane of panes) {
            if (pane.id !== stateConfig.activePane.id) {
                pane.style.display = 'none';
                pane.dispatchEvent(new Event('hidden'));
            }
        }
        stateConfig.activePane.removeAttribute('style');
        stateConfig.activePane.dispatchEvent(new Event('shown'));
        if (stateConfig.paneAnimation) {
            stateConfig.activePane.classList.add(stateConfig.paneAnimation);
            stateConfig.activePane.addEventListener('animationend', function () {
                stateConfig.activePane.classList.remove(stateConfig.paneAnimation);
            }, { once: true });
        }
    }
    if (stateConfig.leftButtonClass) {
        leftButton.className = stateConfig.leftButtonClass;
        leftButton.removeAttribute('style');
    } else {
        leftButton.style.display = 'none';
    }
    if (stateConfig.rightButtonClass) {
        rightButton.className = stateConfig.rightButtonClass;
        rightButton.removeAttribute('style');
    } else {
        rightButton.style.display = 'none';
    }
    // this 'previous' string thing is weird, but it might just work
    // (until we need any notion of reentrancy)
    let tmp = prevState;
    if (stateConfig.statePreserving) {
        prevState = currentState;
    } else {
        prevState = null;
    }
    if (state === 'previous') {
        currentState = tmp;
    } else {
        currentState = state;
    }
}

const diagrams = {
    main: {
        element: document.getElementById('graph-container'),
        animation: 'slide-from-right'
    },
    flow: {
        element: document.getElementById('flow-diagram-container'),
        animation: 'slide-from-right'
    }
};
const diagramKeys = { main: 'main', flow: 'flow' };
let currentDiagramKey = diagramKeys.main;

function switchDiagramView(diagramKey) {
    if (diagramKey === currentDiagramKey) {
        return;
    }
    for (const [key, diagram] of Object.entries(diagrams)) {
        if (key !== diagramKey) {
            diagram.element.style.display = 'none';
            diagram.element.dispatchEvent(new Event('hidden'));
        } else {
            diagram.element.removeAttribute('style');
            diagram.element.classList.add(diagram.animation);
            diagram.element.addEventListener('animationend', function () {
                diagram.element.classList.remove(diagram.animation);
            }, { once: true });
            diagram.element.dispatchEvent(new Event('shown'));
        }
    }
    currentDiagramKey = diagramKey;
}

function initialize() {
    leftButtonContainer.addEventListener('click', function () {
        if (states[currentState].leftState) {
            switchToState(states[currentState].leftState);
        }
    });
    rightButtonContainer.addEventListener('click', function () {
        if (states[currentState].rightState) {
            switchToState(states[currentState].rightState);
        }
    })
}

export { initialize, switchToState, switchDiagramView, stateKeys, diagramKeys }