const leftButtonContainer = document.getElementById('left-menu-button-container');
const rightButtonContainer = document.getElementById('right-menu-button-container');
const leftButton = document.getElementById('left-menu-button');
const rightButton = document.getElementById('right-menu-button');

const mainAppContainer = document.getElementById('main-app-container');
const statsContainer = document.getElementById('stats-container');
const faqContainer = document.getElementById('faq-container');
const menuContainer = document.getElementById('menu-container');

const textContainer = document.getElementById('text-container');
const graphContainer = document.getElementById('graph-container');
const graphExpander = document.getElementById('graph-expander');

const explorePane = document.getElementById('explore-container');
const studyPane = document.getElementById('study-container');

const searchForm = document.getElementById('hanzi-choose');
const textHeader = document.getElementById('text-header');

const graphLegend = document.getElementById('graph-legend');

const containers = [mainAppContainer, statsContainer, faqContainer, menuContainer];
const panes = [explorePane, studyPane];
const midHeaderOptions = [textHeader, searchForm];

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
        activeMidHeader: searchForm,
        rightState: 'study',
        paneAnimation: 'slide-in'
    },
    study: {
        leftButtonClass: 'menu-button',
        rightButtonClass: 'explore-button',
        activeContainer: mainAppContainer,
        activePane: studyPane,
        leftState: 'menu',
        activeMidHeader: searchForm,
        rightState: 'main',
        paneAnimation: 'slide-in'
    },
    faq: {
        leftButtonClass: 'exit-button',
        activeContainer: faqContainer,
        statePreserving: true,
        leftState: 'previous',
        activeMidHeader: textHeader,
        animation: 'slide-in'
    },
    stats: {
        leftButtonClass: 'exit-button',
        activeContainer: statsContainer,
        statePreserving: true,
        leftState: 'main',
        activeMidHeader: textHeader,
        animation: 'slide-in'
    },
    menu: {
        leftButtonClass: 'exit-button',
        activeContainer: menuContainer,
        statePreserving: true,
        leftState: 'previous',
        activeMidHeader: textHeader,
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
    for (const midHeaderOption of midHeaderOptions) {
        if (midHeaderOption.id !== stateConfig.activeMidHeader.id) {
            midHeaderOption.style.display = 'none';
        } else {
            midHeaderOption.removeAttribute('style');
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

const diagramKeys = { main: 'main', none: 'none' };
let currentDiagramKey = diagramKeys.main;

function switchDiagramView(diagramKey) {
    if (diagramKey === currentDiagramKey) {
        return;
    }
    if (diagramKey === diagramKeys.none) {
        textContainer.addEventListener('animationend', function () {
            graphContainer.dispatchEvent(new Event('hidden'));
            graphContainer.style.display = 'none';
            document.body.style.setProperty('--text-container-height', '100%');
            mainAppContainer.classList.remove('primary-container');
            textContainer.classList.remove('expand-panel');
            setTimeout(function () {
                graphExpander.removeAttribute('style');
            }, 250);
            graphExpander.addEventListener('click', function () {
                switchDiagramView(diagramKeys.main);
            }, { once: true });
        }, { once: true });
        textContainer.classList.add('expand-panel');
    } else {
        if (window.matchMedia('(max-width:664px)').matches) {
            textContainer.addEventListener('animationend', function () {
                graphContainer.dispatchEvent(new Event('shown-animationend'));
                textContainer.classList.remove('collapse-panel');
            }, { once: true });
        }
        graphExpander.style.display = 'none';
        graphContainer.dispatchEvent(new Event('shown'));
        textContainer.removeAttribute('style');
        mainAppContainer.classList.add('primary-container');
        graphContainer.removeAttribute('style');
        // Else here reachable if the user re-sizes from small to a larger window
        // in that case, the animation isn't run, so reset to the wide view.
        if (!window.matchMedia('(max-width:664px)').matches) {
            graphContainer.dispatchEvent(new Event('shown-animationend'));
        } else {
            textContainer.classList.add('collapse-panel');
        }
        delta = 0;
        startDelta = 0;
        document.body.style.setProperty('--text-container-height', '50%');
        document.body.style.setProperty('--graph-container-height', '50%');
        document.dispatchEvent(new Event('user-graph-resize'));
    }
    currentDiagramKey = diagramKey;
}

function showNotification() {
    rightButton.className = 'check';
    // Note that this de-duplicates notifications...could cancel the
    // pending timeout to stack them, but kinda prefer less frequent UI churn
    setTimeout(() => {
        rightButton.className = states[currentState].rightButtonClass;
    }, 2000);
}


let swipeStart;
let delta = 0;
let startDelta = 0;
let swiping = false;

function getClientY(event) {
    // we use the same event handler for touch and mouse events, so handle either.
    return event.changedTouches ? event.changedTouches[0].clientY : event.clientY;
}

function handleTouchResizeStart(event) {
    swiping = true;
    swipeStart = getClientY(event);
    startDelta = delta;
    document.body.addEventListener('mousemove', debouncedMoveHandler);
    document.body.addEventListener('mouseup', handleTouchResizeEnd);
    document.body.addEventListener('touchmove', debouncedMoveHandler);
    document.body.addEventListener('touchend', handleTouchResizeEnd);
}
function handleTouchResizeEnd(event) {
    if (!swiping) {
        return;
    }
    swiping = false;
    let percentageDelta = Math.round(100 * delta / window.innerHeight);
    let currentSwipeDelta = Math.round(100 * Math.abs(delta - startDelta) / window.innerHeight);
    if (percentageDelta > 20) {
        switchDiagramView(diagramKeys.none);
    } else if (Math.abs(currentSwipeDelta) >= 3) {
        // don't bother resizing the graph if this was a tiny change
        document.dispatchEvent(new Event('user-graph-resize'));
    }
    document.body.removeEventListener('mousemove', debouncedMoveHandler);
    document.body.removeEventListener('mouseup', handleTouchResizeEnd);
    document.body.removeEventListener('touchmove', debouncedMoveHandler);
    document.body.removeEventListener('touchend', handleTouchResizeEnd);
}
function handleTouchMove(event) {
    if (!swiping) {
        return;
    }
    delta = getClientY(event) - swipeStart + startDelta;
    // you'd think you could just set some delta variable in the CSS, but calc seemingly doesn't update
    // as variables that go into it change. The whole thing is probably a misuse of percentages, but
    // whatever.
    document.body.style.setProperty('--text-container-height', `calc(50% + ${delta}px)`);
    document.body.style.setProperty('--graph-container-height', `calc(50% - ${delta}px)`);
}

function debounce(callback) {
    let pendingAnimationFrame;

    return (...args) => {
        if (pendingAnimationFrame) {
            return;
        }

        pendingAnimationFrame = window.requestAnimationFrame(() => {
            callback(...args);
            pendingAnimationFrame = undefined;
        });
    };
}

const debouncedMoveHandler = debounce(handleTouchMove);

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
    });
    if (window.matchMedia('(max-width:664px)').matches) {
        graphLegend.addEventListener('mousedown', handleTouchResizeStart);
        graphLegend.addEventListener('touchstart', handleTouchResizeStart);
    }
    window.matchMedia('(max-width:664px)').addEventListener("change", function (event) {
        if (event.matches) {
            graphLegend.addEventListener('mousedown', handleTouchResizeStart);
            graphLegend.addEventListener('touchstart', handleTouchResizeStart);
        } else {
            graphLegend.removeEventListener('mousedown', handleTouchResizeStart);
            graphLegend.removeEventListener('touchstart', handleTouchResizeStart);
        }
        switchDiagramView(diagramKeys.main);
    });
}

export { initialize, switchToState, switchDiagramView, showNotification, stateKeys, diagramKeys }