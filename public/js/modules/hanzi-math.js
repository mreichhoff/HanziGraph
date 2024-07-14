const operators = new Set(['+', '-']);
// Validate a hanzi-math expression.
// The input expression must start and end with a hanzi, and alternate between hanzi and an operator
// the plus and minus signs (+ and -) are the only supported operators for now.
// For parsing simplicity, no spaces are allowed.
//
// valid examples (though these might not find any results):
// 我+你
// 我-你
// 我-你+你
// 我-你+你+你-我
//
// invalid examples:
// 我+你+
// 我+你-
// -我+你
// +我+你
// 我_你
// 我 + 你
// 我你+你
// 你+你你
// 你+
// -你
//
// the definition of hanzi above is "exists in window.components".
// note that the components data isn't perfect, but it's enough for a start
function validate(input) {
    if (input.length < 3) {
        // treat single characters as invalid
        // and anything with length two couldn't both start and end with a hanzi while also alternating
        // between hanzi and operator.
        return false;
    }
    if (!window.components) {
        return false;
    }
    let nextMustBeCharacter = true;
    for (const character of input) {
        if (nextMustBeCharacter) {
            if (!(character in window.components)) {
                return false;
            }
            nextMustBeCharacter = false;
        } else {
            if (!operators.has(character)) {
                return false;
            }
            nextMustBeCharacter = true;
        }
    }
    return !nextMustBeCharacter;
}
// a breadth-first search for a given component of `candidate`
function containsTransitiveComponent(candidate, filterComponent) {
    if (candidate === filterComponent) {
        return true;
    }
    let componentQueue = [];
    componentQueue.push(candidate);
    while (componentQueue.length > 0) {
        let curr = componentQueue.shift();
        if (!(curr in window.components)) {
            continue;
        }
        for (const component of window.components[curr].components) {
            if (filterComponent === component) {
                return true;
            }
            componentQueue.push(component);
        }
    }
    return false;
}
// get components one layer deep, used in subtraction when a given
// character is known to have the item being subtracted
function findNonTransitiveComponents(characterList) {
    let result = new Set();
    for (const character of characterList) {
        for (const component of window.components[character].components) {
            result.add(component);
        }
    }
    return result;
}
// a BFS to find all compounds containing any character in `characterList`.
// used in addition operations to find compounds containing the item being added
function findAllTransitiveCompounds(characterList) {
    let compounds = new Set();
    for (const character of characterList) {
        let compoundQueue = [];
        compoundQueue.push(character);
        while (compoundQueue.length > 0) {
            let curr = compoundQueue.shift();
            compounds.add(curr);
            if (!(curr in window.components)) {
                continue;
            }
            for (const compound of window.components[curr].componentOf) {
                compoundQueue.push(compound);
            }
        }
    }
    return compounds;
}
// TODO: adding two of the same character has unexpected results because of the components lists de-duping
// (this came from the original cjkv-ids project, if I recall correctly)...worth revisiting
//
// move left to right, evaluating the expression as we go. Return all possible results.
// note that we don't allow parentheses, and ordering could end up mattering.
function evaluate(input) {
    if (!validate(input)) {
        return [];
    }
    let leftOperandList = null;
    let nextOperator = null;
    for (const character of input) {
        // no left side yet? set it and move on.
        // note that leftOperandList can later become empty, which is then handled in the plus operation
        if (leftOperandList === null) {
            leftOperandList = [character];
            continue;
        }
        // it's an operator, so note that as our next operation and move on.
        if (operators.has(character)) {
            nextOperator = character;
            continue;
        }
        // if we're here, it's the right hand operand.
        // evaluate what we have so far, set that to left operand, and move on
        //
        // note that we return all possible results at each step, so additions can also end up being filtering
        // operations (i.e., we have N candidates, remove those that don't include the added operand). Subtractions
        // similarly: we have N candidates, remove any that do include the added operand. TBD if we should treat
        // subtractions when there aren't candidates with the operand as a no-op or a failed operation (probably the
        // former).
        // we now have all compounds that contain any of the candidates in leftOperandList so far
        // now, incorporate the operation itself, and store the results in leftOperandList
        let filtered = [];
        if (nextOperator === '-') {
            // when subtracting, first find which operands of leftOperandList have the component anywhere
            let operandsWithComponent = [];
            for (const candidate of leftOperandList) {
                if (!containsTransitiveComponent(candidate, character)) {
                    // if it already excludes the subtracted component, keep it around
                    filtered.push(candidate);
                } else if (candidate !== character) {
                    // otherwise, see if we can break it up without the component
                    // (as long as it's not <char>-<char>)
                    // see below...
                    operandsWithComponent.push(candidate);
                }
            }
            let nonTransitiveComponents = findNonTransitiveComponents(operandsWithComponent);
            for (const candidate of nonTransitiveComponents) {
                if (!containsTransitiveComponent(candidate, character)) {
                    filtered.push(candidate);
                }
            }
        } else {
            // Nothing there now, due to subtraction to 0 or due to not finding results of an add?
            // Add the right operand and return its compounds...
            if (leftOperandList.length < 1) {
                leftOperandList.push(character);
            }
            // if it's addition, get rid of any candidate that doesn't contain the rightOperand anywhere in
            // its transitive set of components
            let compounds = findAllTransitiveCompounds(leftOperandList);
            for (const candidate of compounds) {
                if (containsTransitiveComponent(candidate, character)) {
                    filtered.push(candidate);
                }
            }
        }
        leftOperandList = filtered;
    }
    return leftOperandList;
}
export { evaluate }