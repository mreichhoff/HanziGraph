# Genkit Evaluation Setup

This directory contains the evaluation framework for HanziGraph's AI flows.

## Quick Start

1. **Start the Genkit dev server with evaluation support:**
   ```bash
   cd functions
   npm run eval:start
   ```

2. **Open the Genkit Dev UI:**
   Navigate to http://localhost:4000 in your browser.

3. **Run evaluations from the UI:**
   - Go to the "Datasets" tab
   - Create a dataset or import from `datasets/` folder
   - Run evaluations against your flows

## Available Flows

| Flow Name | Input | Description |
|-----------|-------|-------------|
| `explainText` | Chinese text string | Explains Chinese text with translation, pinyin, grammar |
| `explainEnglish` | English text string | Translates English to Chinese with explanation |
| `generateChineseSentences` | `{word, definitions[]}` | Generates example sentences for a word |
| `analyzeCollocation` | Chinese collocation string | Analyzes word combinations |
| `explainWordInContext` | `{word, sentence}` | Explains a word's meaning in context |
| `analyzeImage` | Base64 image URL | Analyzes images containing Chinese text |

## Evaluation Datasets

Sample datasets are in `datasets/`:

- `explain-chinese.json` - Chinese text explanation test cases
- `explain-english.json` - English to Chinese translation test cases  
- `generate-chinese-sentences.json` - Sentence generation test cases
- `analyze-collocation.json` - Collocation analysis test cases
- `explain-word-in-context.json` - Word-in-context test cases

## Available Evaluators

### Built-in Genkit Metrics
- **faithfulness** - Factual consistency of responses
- **answer_relevancy** - How relevant the answer is to the input
- **maliciousness** - Checks for harmful content

### Custom Evaluators (`custom/*`)
- **custom/chineseTextPresent** - Verifies Chinese characters in output
- **custom/validPinyinFormat** - Validates pinyin with tone marks/numbers
- **custom/englishTranslationPresent** - Verifies English text present
- **custom/grammarExplanationQuality** - LLM-judged explanation quality (1-5 scale)
- **custom/sentenceGenerationQuality** - LLM-judged sentence quality (1-5 scale)
- **custom/outputStructureValid** - Validates expected output structure

## CLI Commands

```bash
# Start the eval server (required first)
npm run eval:start

# Run evaluation on a flow with a dataset file
genkit eval:flow explainText --input datasets/explain-chinese.json

# Run with specific evaluators only
genkit eval:flow explainText --input datasets/explain-chinese.json \
  --evaluators=custom/chineseTextPresent,custom/grammarExplanationQuality

# Run with batching for faster evaluation
genkit eval:flow explainText --input datasets/explain-chinese.json --batchSize 5

# Extract data from previous runs for analysis
genkit eval:extractData explainText --label myTestRun --output results.json

# Run raw evaluation on extracted data
genkit eval:run results.json
```

## Adding Test Cases

### Dataset Format
Each dataset is a JSON array of objects with:
- `input` (required): The input to the flow
- `reference` (optional): Expected output or notes for evaluators

Example for `explainText`:
```json
[
  {
    "input": "我喜欢吃苹果",
    "reference": {
      "expectedGrammarPoints": ["Subject-Verb-Object structure"],
      "expectedTranslation": "I like to eat apples"
    }
  }
]
```

### Tips for Good Test Cases
1. **Cover edge cases**: Very short text, very long text, rare characters
2. **Include grammar variety**: Different grammar patterns you want to test
3. **Add reference data**: Expected outputs help with automated scoring
4. **Version your datasets**: Track changes as you refine prompts

## Adding Custom Evaluators

Edit `src/evaluators.ts` to add new evaluators:

```typescript
export const myCustomEvaluator = evalAi.defineEvaluator(
    {
        name: 'custom/myEvaluator',
        displayName: 'My Custom Evaluator',
        definition: 'Description of what this evaluates.',
    },
    async (datapoint: BaseEvalDataPoint) => {
        // Your evaluation logic here
        const score = /* compute score */;
        return {
            testCaseId: datapoint.testCaseId,
            evaluation: {
                score: score, // boolean or number 0-1
                details: { reasoning: 'Why this score' },
            },
        };
    }
);
```

## Comparing Evaluation Runs

1. Run evaluations multiple times (e.g., before/after prompt changes)
2. In the Dev UI, go to Datasets → your dataset → Evaluations tab
3. Click "+ Comparison" to compare runs side-by-side
4. Enable metric highlighting to see improvements/regressions

## Workflow for Prompt Refinement

1. **Baseline**: Run `eval:flow` on current prompts, save results
2. **Modify**: Update prompts in `prompts/` directory
3. **Re-evaluate**: Run `eval:flow` again with same dataset
4. **Compare**: Use Dev UI comparison to see changes
5. **Iterate**: Repeat until satisfied with quality

## Troubleshooting

**"Command not found: genkit"**
```bash
npm install -g genkit-cli
# or use npx:
npx genkit eval:flow ...
```

**"Vertex AI authentication error"**
```bash
gcloud auth application-default login
```

**Evaluators not appearing**
Make sure the eval server is running (`npm run eval:start`) before running CLI commands.
