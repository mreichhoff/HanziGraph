import test from 'node:test';
import assert from 'node:assert/strict';
import { buildExplorerGraph, placeCard, overlapArea, sparseConnections, segmentsCross, evictionOrder, wordConnections, searchPositions, neighborPosition } from '../../public/js/modules/immersive-geometry.mjs';

test('exploration retains rare neighbors beyond the former eight-edge limit and handles supplementary Han', () => {
    const neighbors = [...'一二三四五六七八九十水火𰻝'];
    const graph = buildExplorerGraph(neighbors.map(c => `学${c}`).concat(['学水', 'A学', '学A']));
    assert.equal(Object.keys(graph.学.edges).length, neighbors.length);
    assert.equal(graph.学.edges['𰻝'].words[0], '学𰻝');
    assert.equal(graph.A, undefined);
    assert.equal(graph.学.edges.学, undefined);
    assert.equal(Object.keys(graph['𰻝'].edges)[0], '学');
});

test('cards use the click location, stay within bounds, and avoid existing cards', () => {
    const bounds = { x: 12, y: 82, width: 1416, height: 718 };
    const size = { width: 310, height: 460 };
    const first = placeCard({ x: 500, y: 150 }, size, bounds, []);
    assert.deepEqual(first, { ...size, x: 472, y: 122 });
    const second = placeCard({ x: 510, y: 160 }, size, bounds, [first]);
    const third = placeCard({ x: 490, y: 170 }, size, bounds, [first, second]);
    for (const [a, b] of [[first, second], [first, third], [second, third]]) assert.equal(overlapArea(a, b), 0);
    const mobile = placeCard({ x: 389, y: 840 }, { width: 310, height: 420 }, { x: 12, y: 82, width: 366, height: 662 }, []);
    assert.ok(mobile.x >= 12 && mobile.x + mobile.width <= 378);
    assert.ok(mobile.y >= 82 && mobile.y + mobile.height <= 744);
});

test('dense graph renders a sparse, non-crossing set of real nearby word edges', () => {
    const chars = [...'一二三四五六七八九'];
    const graph = buildExplorerGraph([chars.join('')]);
    const nodes = chars.map((id, i) => ({ id, position: { x: i % 3 * 120, y: Math.floor(i / 3) * 120 } }));
    const edges = sparseConnections(nodes, graph);
    assert.ok(edges.length > 0 && edges.length <= nodes.length * 1.5);
    const positions = Object.fromEntries(nodes.map(n => [n.id, n.position]));
    for (const char of chars) assert.ok(edges.filter(e => e.source === char || e.target === char).length <= 3);
    for (const edge of edges) {
        assert.ok(graph[edge.source].edges[edge.target]);
        assert.ok(edge.distance <= 270);
        for (const other of edges) assert.equal(segmentsCross(positions[edge.source], positions[edge.target], positions[other.source], positions[other.target]), false);
    }
});

test('links do not run through an unrelated character or across distant islands', () => {
    const graph = buildExplorerGraph(['一三', '一四']);
    graph.二 = { node: { level: 1 }, edges: {} };
    const nodes = [ ['一', 0], ['二', 100], ['三', 200], ['四', 800] ].map(([id, x]) => ({ id, position: { x, y: 0 } }));
    assert.equal(sparseConnections(nodes, graph).length, 0);
});


test('renderer recycling prefers distant nodes and preserves visible, buffered, and open-card characters', () => {
    const nodes = [
        { id: 'visible', position: { x: 100, y: 100 } },
        { id: 'buffered', position: { x: 540, y: 100 } },
        { id: 'near', position: { x: 600, y: 100 } },
        { id: 'far', position: { x: 1200, y: 100 } },
        { id: 'card', position: { x: 2000, y: 100 } }
    ];
    const original = structuredClone(nodes);
    const order = evictionOrder(nodes, { x1: 0, y1: 0, x2: 500, y2: 500 }, new Set(['card']));
    assert.deepEqual(order, ['far', 'near']);
    assert.deepEqual(nodes, original, 'remembered coordinates must not be mutated');
    const moved = evictionOrder(nodes, { x1: 1000, y1: 0, x2: 1500, y2: 500 }, new Set(['card']));
    assert.ok(moved.includes('visible'));
    assert.ok(!moved.includes('far'));
});


test('searched words retain exact labels and connections even when sparse drawing would omit them', () => {
    const graph = buildExplorerGraph(['年轻']);
    const nodes = [{ id: '年', position: { x: 0, y: 0 } }, { id: '轻', position: { x: 2000, y: 0 } }];
    assert.equal(sparseConnections(nodes, graph).length, 0);
    const required = wordConnections('年轻', new Set(['年', '轻']));
    assert.equal(required.length, 1);
    assert.equal(required[0].label, '年轻');
    assert.deepEqual(required[0].words, ['年轻']);
    assert.equal(wordConnections('看看', new Set(['看'])).length, 0);
    assert.equal(wordConnections('人人有责', new Set(['人', '有', '责'])).length, 2);
    assert.equal(wordConnections('学𰻝', new Set(['学', '𰻝']))[0].target, '𰻝');
});

test('search groups distant or missing characters compactly without colliding with other nodes', () => {
    const occupied = [{ x: 125, y: 0 }, { x: 0, y: 125 }];
    const planned = searchPositions(['年', '轻'], { x: 0, y: 0 }, occupied);
    assert.equal(planned.length, 2);
    assert.equal(planned[1].position.x - planned[0].position.x, 125);
    assert.equal(planned[1].position.y, planned[0].position.y);
    for (const node of planned) for (const point of occupied) assert.ok(Math.hypot(node.position.x - point.x, node.position.y - point.y) >= 100);
});

test('context placement avoids the selected node and edge endpoints', async () => {
    const {placeContextCard} = await import('../../public/js/modules/immersive-geometry.mjs');
    const context = {x:460, y:260, width:210, height:65};
    const result = placeContextCard({x:565,y:290}, {width:340,height:460}, {x:12,y:82,width:1256,height:538}, context);
    assert.equal(overlapArea(result.rect, context, 12), 0);
    assert.equal(result.scale, 1);
    assert.deepEqual(result.shift, {x:0,y:0});
});
test('phone placement reframes source above card when no adjacent space fits', async () => {
    const {placeContextCard} = await import('../../public/js/modules/immersive-geometry.mjs');
    const bounds = {x:12,y:82,width:296,height:558};
    for (const context of [{x:100,y:310,width:65,height:65}, {x:0,y:280,width:500,height:150}]) {
        const result = placeContextCard({x:150,y:335}, {width:296,height:460}, bounds, context);
        const transformed = {x:context.x*result.scale+result.shift.x,y:context.y*result.scale+result.shift.y,width:context.width*result.scale,height:context.height*result.scale};
        assert.equal(overlapArea(result.rect, transformed, 12), 0);
        assert.ok(transformed.x >= bounds.x && transformed.x + transformed.width <= bounds.x + bounds.width);
        assert.ok(transformed.y >= bounds.y);
        assert.ok(result.rect.y + result.rect.height <= bounds.y + bounds.height);
    }
});

test('edge usefulness can win a close contest without overriding distance constraints', async () => {
    const {sparseConnections,edgeScore}=await import('../../public/js/modules/immersive-geometry.mjs');
    const nodes=[{id:'A',position:{x:0,y:0}},{id:'B',position:{x:100,y:0}},{id:'C',position:{x:0,y:110}},{id:'D',position:{x:-120,y:0}},{id:'E',position:{x:0,y:-140}}];
    const graph={A:{edges:Object.fromEntries(['B','C','D','E'].map(id=>[id,{rank:id==='B'?30000:1,words:['A'+id]}]))}};
    assert.deepEqual(sparseConnections(nodes,graph).map(e=>e.target),['C','D','E']);
    assert.deepEqual(sparseConnections(nodes,graph,105).map(e=>e.target),['B']);
    assert.ok(edgeScore(100,1e9)<=180);
});
test('invalid or zero-sized layout inputs yield finite card placement', async () => {
    const {placeContextCard}=await import('../../public/js/modules/immersive-geometry.mjs');
    for (const context of [null,{x:NaN,y:0,width:10,height:10},{x:0,y:0,width:0,height:0}]) {
        const result=placeContextCard({x:NaN,y:Infinity},{width:390,height:400},{x:0,y:0,width:0,height:0},context);
        assert.ok(Object.values(result.rect).every(Number.isFinite));
        assert.equal(result.scale,1);
    }
});

test('a requested neighbor lands beside its character, on screen and clear of the card', () => {
    const extent = { x1: 0, y1: 0, x2: 1000, y2: 700 };
    const origin = { x: 300, y: 350 };
    const card = { x1: 420, y1: 120, x2: 900, y2: 620 };
    const free = neighborPosition(origin, [origin], extent, [card]);
    assert.ok(Math.hypot(free.x - origin.x, free.y - origin.y) <= 230, 'stays beside its character');
    assert.ok(free.x > extent.x1 + 40 && free.x < extent.x2 - 40 && free.y > extent.y1 + 40 && free.y < extent.y2 - 40);
    assert.ok(free.x < card.x1 - 40 || free.x > card.x2 + 40 || free.y < card.y1 - 40 || free.y > card.y2 + 40);
    // Existing characters are never overlapped, even when that forces a wider ring.
    const crowded = [origin, { x: 420, y: 350 }, { x: 180, y: 350 }, { x: 300, y: 230 }, { x: 300, y: 470 }];
    const spaced = neighborPosition(origin, crowded, extent, []);
    for (const other of crowded) assert.ok(Math.hypot(spaced.x - other.x, spaced.y - other.y) >= 100);
    // A crowded neighborhood still keeps the character beside its anchor rather than
    // banishing it to open space on the far side of the canvas.
    const walled = [];
    for (let x = -400; x <= 400; x += 60) for (let y = -400; y <= 400; y += 60) walled.push({ x: origin.x + x, y: origin.y + y });
    const crammed = neighborPosition(origin, walled, extent, []);
    assert.ok(Math.hypot(crammed.x - origin.x, crammed.y - origin.y) <= 230, 'stays beside its character when nothing is free');
    const gap = Math.min(...walled.map(other => Math.hypot(crammed.x - other.x, crammed.y - other.y)));
    assert.ok(gap >= 20, 'picks the roomiest gap available');
});
