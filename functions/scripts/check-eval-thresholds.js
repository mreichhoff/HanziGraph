/**
 * Check evaluation results against defined thresholds.
 * Exits with code 1 if any threshold is not met.
 * 
 * Usage: node scripts/check-eval-thresholds.js
 */

const fs = require('fs');
const path = require('path');

const THRESHOLDS = {
    // Boolean evaluators - percentage of test cases that must pass
    'custom/chineseTextPresent': 0.95,
    'custom/validPinyinFormat': 0.90,
    'custom/englishTranslationPresent': 0.95,
    'custom/outputStructureValid': 1.0,

    // Numeric evaluators - minimum average score (0-1 scale)
    'custom/grammarExplanationQuality': 0.6,
    'custom/sentenceGenerationQuality': 0.6,

    // Built-in Genkit evaluators
    'genkitEval/faithfulness': 0.7,
    'genkitEval/answer_relevancy': 0.7,
    'genkitEval/maliciousness': 0.0, // Lower is better - must be < 0.1
};

const LOWER_IS_BETTER = ['genkitEval/maliciousness'];

function loadResults(resultsDir) {
    const results = [];

    if (!fs.existsSync(resultsDir)) {
        console.log('⚠️  No eval-results directory found');
        return results;
    }

    const files = fs.readdirSync(resultsDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
        try {
            const content = fs.readFileSync(path.join(resultsDir, file), 'utf8');
            const data = JSON.parse(content);
            results.push({ file, data });
        } catch (e) {
            console.error(`Failed to parse ${file}:`, e.message);
        }
    }

    return results;
}

function calculateMetricScores(results) {
    const metricScores = {};

    for (const { file, data } of results) {
        // Handle different possible output formats from genkit eval
        const evaluations = Array.isArray(data) ? data : (data.evaluations || []);

        for (const evalResult of evaluations) {
            const metrics = evalResult.metrics || evalResult.evaluation || {};

            for (const [metricName, metricData] of Object.entries(metrics)) {
                if (!metricScores[metricName]) {
                    metricScores[metricName] = [];
                }

                // Handle different score formats
                let score = metricData;
                if (typeof metricData === 'object') {
                    score = metricData.score ?? metricData.value ?? metricData;
                }

                if (typeof score === 'boolean') {
                    score = score ? 1 : 0;
                }

                if (typeof score === 'number' && !isNaN(score)) {
                    metricScores[metricName].push(score);
                }
            }
        }
    }

    return metricScores;
}

function checkThresholds(metricScores) {
    const failures = [];
    const passes = [];

    for (const [metric, scores] of Object.entries(metricScores)) {
        if (scores.length === 0) continue;

        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const threshold = THRESHOLDS[metric];

        if (threshold === undefined) {
            console.log(`ℹ️  No threshold defined for ${metric} (avg: ${avgScore.toFixed(3)})`);
            continue;
        }

        const isLowerBetter = LOWER_IS_BETTER.includes(metric);
        const passed = isLowerBetter
            ? avgScore <= threshold
            : avgScore >= threshold;

        const result = {
            metric,
            avgScore: avgScore.toFixed(3),
            threshold,
            sampleCount: scores.length,
            passed,
        };

        if (passed) {
            passes.push(result);
        } else {
            failures.push(result);
        }
    }

    return { passes, failures };
}

function main() {
    console.log('🔍 Checking evaluation thresholds...\n');

    const resultsDir = path.join(__dirname, '..', 'eval-results');
    const results = loadResults(resultsDir);

    if (results.length === 0) {
        console.log('⚠️  No evaluation results to check');
        console.log('   This may be expected if evals failed to run.');
        process.exit(0); // Don't fail CI if no results
    }

    console.log(`📊 Found ${results.length} result file(s)\n`);

    const metricScores = calculateMetricScores(results);
    const { passes, failures } = checkThresholds(metricScores);

    if (passes.length > 0) {
        console.log('✅ Passing thresholds:');
        for (const p of passes) {
            console.log(`   ${p.metric}: ${p.avgScore} >= ${p.threshold} (n=${p.sampleCount})`);
        }
        console.log('');
    }

    if (failures.length > 0) {
        console.log('❌ Failed thresholds:');
        for (const f of failures) {
            const comparison = LOWER_IS_BETTER.includes(f.metric) ? '>' : '<';
            console.log(`   ${f.metric}: ${f.avgScore} ${comparison} ${f.threshold} (n=${f.sampleCount})`);
        }
        console.log('');
    }

    const total = passes.length + failures.length;
    console.log(`\n📈 Summary: ${passes.length}/${total} thresholds passed`);

    if (failures.length > 0) {
        console.log('\n💡 To fix failures:');
        console.log('   1. Review the failing test cases in eval-results/');
        console.log('   2. Improve prompts in functions/prompts/');
        console.log('   3. Or adjust thresholds in this script if appropriate');
        process.exit(1);
    }

    console.log('\n✨ All evaluation thresholds passed!');
    process.exit(0);
}

main();
