import test from 'node:test';
import assert from 'node:assert/strict';
import { selectionConnections } from '../../public/js/modules/immersive-geometry.mjs';

test('selection adds at most four real visible neighbors without replacing existing labels', () => {
    const nodes = [{id:'学', position:{x:0,y:0}}, ...[...'校生大小中習先'].map((id, i) => ({id, position:{x:200*Math.cos(i*2*Math.PI/7),y:200*Math.sin(i*2*Math.PI/7)}}))];
    const graph = {学:{edges:Object.fromEntries(nodes.slice(1).map((node, i) => [node.id,{words:[`学${node.id}`],rank:i+1}]))}};
    graph.学.edges.外 = {words:['学外'],rank:1};
    const existing = new Map([['edge:学:校', {label:'An explicitly searched word'}]]);
    const before = JSON.stringify({nodes,graph,existing:[...existing]});
    const added = selectionConnections('学',nodes,graph,existing);
    assert.equal(added.length,4);
    assert.ok(added.every(edge => edge.source === '学' && edge.target !== '外' && !existing.has(edge.id)));
    assert.equal(JSON.stringify({nodes,graph,existing:[...existing]}),before);
    assert.deepEqual(selectionConnections('外',nodes,graph,existing),[]);
});

test('selection prefers common vocabulary at comparable distances and rejects long or obstructed edges', () => {
    const nodes = [
        {id:'学',position:{x:0,y:0}}, {id:'校',position:{x:180,y:0}},
        {id:'生',position:{x:0,y:200}}, {id:'遠',position:{x:-500,y:0}},
        {id:'後',position:{x:0,y:-300}}, {id:'中',position:{x:0,y:-150}}
    ];
    const graph = {学:{edges:{校:{words:['学校'],rank:30000},生:{words:['学生'],rank:1},遠:{words:['遠学'],rank:1},後:{words:['後学'],rank:1}}}};
    const added = selectionConnections('学',nodes,graph,new Set());
    assert.deepEqual(added.map(edge => edge.target),['生','校']);
});

test('a revealed edge remains while its word card is open, then disappears without becoming pinned', async () => {
    const {readFileSync} = await import('node:fs');
    const {default:vm} = await import('node:vm');
    const {default:cytoscape} = await import('cytoscape');
    const source = readFileSync(new URL('../../public/js/modules/immersive.js',import.meta.url),'utf8');
    const connect = source.slice(source.indexOf('function connect()'),source.indexOf('function protectedCharacters()'));
    const cy = cytoscape({headless:true,elements:[{data:{id:'学'}},{data:{id:'校'}}]});
    const edge = {id:'edge:学:校',source:'学',target:'校',words:['学校'],label:'学校'};
    const cards = new Map([['学校',{graphConnection:edge}]]), pinnedPairs = new Set();
    const context = vm.createContext({cy,cards,pinnedPairs,graph:{},searchedWords:new Set(),searchedWord:'',
        sparseConnections:()=>[],showMeanings:true,meaningFor:()=> 'school',edgeLabel:(word,gloss)=>word+' / '+gloss,revealConnections(){}});
    vm.runInContext(connect,context);
    try {
        context.connect();
        assert.equal(cy.edges().length,1);
        assert.equal(cy.edges()[0].data('label'),'学校 / school');
        context.connect();
        assert.equal(cy.edges().length,1);
        assert.equal(cy.edges()[0].data('label'),'学校 / school');
        assert.equal(edge.label,'学校');
        cards.clear(); context.connect();
        assert.equal(cy.edges().length,0);
        assert.equal(pinnedPairs.size,0);
    } finally { cy.destroy(); }
});
