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
            if(minCeiled < 0 || maxFloored >= window.freqs.length) {
                return [];
            }

            const index = Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
            return [window.freqs[index]];
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
    return [];
}
export { handleCommand }