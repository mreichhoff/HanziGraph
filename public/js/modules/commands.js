import { evaluate as evaluateMathExpression } from "./hanzi-math";
const commands = [
    {
        prefix: "!random",
        parse: segments => {
            if (!window.freqs) {
                return [];
            }
            let startIndex = 0;
            let endIndex = 10000;
            if (segments.length === 3) {
                const startCandidate = parseInt(segments[1]);
                const endCandidate = parseInt(segments[2]);
                if (startCandidate != NaN && endCandidate != NaN && startCandidate < endCandidate) {
                    startIndex = startCandidate;
                    endIndex = endCandidate;
                }
            }
            const minCeiled = Math.ceil(startIndex);
            const maxFloored = Math.floor(endIndex);
            if (minCeiled < 0 || maxFloored >= window.freqs.length) {
                return [];
            }

            const index = Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
            return [window.freqs[index]];
        }
    },
    {
        prefix: "!math",
        parse: segments => {
            // no spaces allowed in the math operation
            // so segment[0] = "!math" and segment[1] = math expression
            if (segments.length !== 2) {
                return [];
            }
            const expression = segments[1];
            const result = evaluateMathExpression(expression);
            // limit to 10 results
            return result.filter(x => x in hanzi).sort((a, b) => hanzi[a].node.level - hanzi[b].node.level).slice(0, 10);
        }
    },
    {
        prefix: "!rank",
        parse: segments => {
            if (!window.freqs) {
                return [];
            }
            const index = parseInt(segments[1]);
            if (index != NaN && index > 0 && index <= window.freqs.length) {
                // subtract one as we'd rather not have zero indexing
                // i.e., `!rank 5000` should display index 4999.
                return [window.freqs[index - 1]];
            }
            return [];
        }
    }
];
function handleCommand(value) {
    const segments = value.split(' ');
    // TODOs:
    // * is prefix and parse the right way to do this?
    // * set up a mechanism for search suggestions per command
    // * consider other data sources to pass into the parse function
    //   (though the various structures on window are powerful, but that's another story)
    for (const command of commands) {
        if (segments[0].startsWith(command.prefix)) {
            return command.parse(segments);
        }
    }
    return null;
}
export { handleCommand }