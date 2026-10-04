import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultPrompt, listModels, askAi, makeNote, addToAnki, ankiRequest, ankiModelFor, ankiTemplates } from '../../public/js/modules/immersive-integrations.mjs';
const settings = {aiEndpoint:'http://localhost:1234/v1/', aiModel:'local-model', ankiEndpoint:'http://localhost:8765', ankiKey:'test-key', deck:'JapaneseGraph'};
const response = value => ({ok:true, json:async () => value});

test('prompts distinguish Japanese, Mandarin scripts, and Cantonese', () => {
    assert.match(defaultPrompt('japanese'), /Japanese.*hiragana/s);
    assert.doesNotMatch(defaultPrompt('japanese'), /pinyin/);
    assert.match(defaultPrompt('traditional'), /traditional characters.*pinyin/s);
    assert.match(defaultPrompt('cantonese'), /Cantonese.*jyutping/s);
});
test('AI uses selected model, language prompt and structured examples', async () => {
    const fetcher = async (url, options) => {
        assert.equal(url, 'http://localhost:1234/v1/chat/completions');
        const body = JSON.parse(options.body);
        assert.equal(body.model, 'local-model');
        assert.match(body.messages[0].content, /Japanese/);
        assert.equal(body.response_format.type, 'json_schema');
        return response({choices:[{message:{content:JSON.stringify({sentences:[{text:'学校に行く。', reading:'がっこうにいく。', english:'I go to school.'}]})}}]});
    };
    assert.equal((await askAi(settings, 'japanese', '学校', 'school', true, undefined, fetcher))[0].reading, 'がっこうにいく。');
    await assert.rejects(askAi(settings, 'japanese', '学校', '', true, undefined, async () => response({choices:[{message:{content:'not JSON'}}]})), /valid example JSON/);
});
test('connection and AI errors are surfaced without rendering server markup', async () => {
    await assert.rejects(listModels(settings, undefined, async () => ({ok:false, status:403})), /403/);
    await assert.rejects(ankiRequest(settings, 'deckNames', {}, undefined, async () => response({hello:'world'})), /Expected AnkiConnect/);
    await assert.rejects(askAi(settings, 'simplified', '学', '', false, undefined, async () => response({choices:[]})), /no text/);
});
test('notes escape HTML and preserve Japanese reading, language, and source', () => {
    const note = makeNote(settings, 'japanese', {text:'<学校>', reading:'がっこう', english:'school & learning', source:'https://japanesegraph.com/japanese/学校', generated:true});
    assert.equal(note.fields.Text, '&lt;学校&gt;');
    assert.equal(note.fields.Meaning, 'school &amp; learning');
    assert.equal(note.fields.Language, 'ja-JP');
    assert.equal(note.options.allowDuplicate, false);
    assert.ok(note.tags.includes('ai-generated'));
});
test('Anki export creates only its own model/deck and adds one note', async () => {
    const calls = [];
    const fetcher = async (url, options) => {
        const body = JSON.parse(options.body); calls.push(body);
        assert.equal(body.key, 'test-key');
        return response({error:null, result:({modelNames:[], createModel:1, createDeck:2, canAddNotes:[true], addNote:123})[body.action]});
    };
    assert.equal(await addToAnki(settings, 'japanese', {text:'学校', reading:'がっこう', english:'school'}, undefined, fetcher), 123);
    assert.deepEqual(calls.map(c => c.action), ['modelNames','createModel','createDeck','canAddNotes','addNote']);
    assert.equal(calls.at(-1).params.note.fields.Reading, 'がっこう');
});
test('duplicate or incompatible Anki notes never overwrite existing content', async () => {
    const calls = [];
    const fetcher = async (url, options) => {
        const {action} = JSON.parse(options.body); calls.push(action);
        return response({error:null, result:({modelNames:[ankiModelFor('japanese')], modelFieldNames:['Text','Reading','Meaning','Source','Language','Speech'], createDeck:2, canAddNotes:[false]})[action]});
    };
    await assert.rejects(addToAnki(settings, 'japanese', {text:'学校'}, undefined, fetcher), /already exists/);
    assert.ok(!calls.includes('addNote'));
    assert.ok(!calls.includes('updateNoteFields'));
});

test('incompatible Anki model stops before creating a deck or adding notes', async () => {
    const actions = [];
    const fetcher = async (url, options) => {
        const {action} = JSON.parse(options.body); actions.push(action);
        return response({error:null, result:action === 'modelNames' ? [ankiModelFor('japanese')] : ['Front','Back']});
    };
    await assert.rejects(addToAnki(settings, 'japanese', {text:'学校'}, undefined, fetcher), /incompatible fields/);
    assert.deepEqual(actions, ['modelNames','modelFieldNames']);
});
test('AI honors a custom prompt and cancellation', async () => {
    const controller = new AbortController();
    const task = askAi({...settings, prompt:'Custom teacher'}, 'japanese', '学校', '', false, controller.signal, async (url, options) => {
        assert.equal(JSON.parse(options.body).messages[0].content, 'Custom teacher');
        return new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('aborted')), {once:true}));
    });
    controller.abort();
    await assert.rejects(task, /cancelled or timed out/);
});

test('action prompts interpolate once and distinguish words, context, and examples', async () => {
    const custom = {...settings, explainPrompt:'WORD {word} / {context}', contextPrompt:'CONTEXT {word} / {context}', examplesPrompt:'EXAMPLES {word} / {context}'};
    const sent = [];
    const fetcher = async (url, options) => {
        const body = JSON.parse(options.body); sent.push(body.messages[1].content);
        return response({choices:[{message:{content:body.response_format ? JSON.stringify({sentences:[{text:'学校',reading:'がっこう',english:'school'}]}) : 'Explanation'}}]});
    };
    await askAi(custom, 'japanese', '学校', '{word}', false, undefined, fetcher);
    await askAi(custom, 'japanese', '学校', '学校に行く', false, undefined, fetcher, true);
    await askAi(custom, 'japanese', '学校', 'school', true, undefined, fetcher);
    assert.equal(sent[0], 'WORD "学校" / "{word}"');
    assert.equal(sent[1], 'CONTEXT "学校" / "学校に行く"');
    assert.match(sent[2], /^EXAMPLES "学校" \/ "school"/);
    assert.match(sent[2], /Return JSON/);
});

test('saved incomplete drafts cannot enable integrations and disabled drafts do not block other settings', async () => {
    const {integrationProblem} = await import('../../public/js/modules/immersive-integrations.mjs');
    assert.match(integrationProblem({aiEnabled:true, aiEndpoint:'http://localhost:1234/v1', aiModel:''}, 'ai'), /model/);
    assert.match(integrationProblem({ankiEnabled:true, ankiEndpoint:'http://localhost:8765', deck:''}, 'anki'), /deck/);
    assert.match(integrationProblem({aiEnabled:true, aiEndpoint:'file:///tmp', aiModel:'model'}, 'ai'), /HTTP/);
    assert.equal(integrationProblem({aiEnabled:false, aiEndpoint:''}, 'ai'), '');
    assert.equal(integrationProblem({...settings, aiEnabled:true}, 'ai'), '');
});


test('native TTS templates choose the target locale and speak only on the answer', () => {
    for (const [dataset, locale] of Object.entries({japanese:'ja_JP',simplified:'zh_CN',traditional:'zh_TW',cantonese:'zh_HK'})) {
        const [template] = ankiTemplates(dataset);
        assert.ok(template.Back.includes('{{tts '+locale+':Speech}}'));
        assert.ok(template.Back.includes('{{tts '+locale+':Text}}'));
        assert.doesNotMatch(template.Front, /tts/);
        assert.doesNotMatch(template.Back, /tts.*:Meaning/);
        assert.equal(makeNote(settings,dataset,{text:'学校'}).modelName,ankiModelFor(dataset));
    }
    assert.equal(new Set(['japanese','simplified','traditional','cantonese'].map(ankiModelFor)).size,4);
    assert.throws(() => ankiTemplates('unknown'));
});
test('Japanese TTS follows the first reading, Chinese speaks characters, and missing readings fall back', () => {
    assert.equal(makeNote(settings,'japanese',{text:'丈夫',reading:'じょうぶ / ますらお'}).fields.Speech,'じょうぶ');
    assert.equal(makeNote(settings,'japanese',{text:'電車が来た。',reading:''}).fields.Speech,'電車が来た。');
    assert.equal(makeNote(settings,'simplified',{text:'学校',reading:'xue2 xiao4'}).fields.Speech,'学校');
    assert.equal(makeNote(settings,'japanese',{text:'<script>',reading:'<kana>'}).fields.Speech,'&lt;kana&gt;');
});
test('legacy Graph Explorer models are not altered when creating an audio model', async () => {
    const calls=[];
    const fetcher=async (url, options)=>{
        const body=JSON.parse(options.body);calls.push(body);
        return response({error:null,result:({modelNames:['Graph Explorer'],createModel:1,createDeck:2,canAddNotes:[true],addNote:123})[body.action]});
    };
    await addToAnki(settings,'japanese',{text:'丈夫',reading:'じょうぶ'},undefined,fetcher);
    const model=calls.find(call=>call.action==='createModel').params;
    assert.equal(model.modelName,ankiModelFor('japanese'));
    assert.ok(model.inOrderFields.includes('Speech'));
    assert.deepEqual(model.cardTemplates,ankiTemplates('japanese'));
    assert.ok(!calls.some(call=>call.action.startsWith('update')));
});
